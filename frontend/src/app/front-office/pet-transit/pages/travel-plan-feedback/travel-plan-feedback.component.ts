import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';

import {
  FeedbackType,
  FEEDBACK_TYPE_CONFIG,
  TravelFeedback,
  TravelFeedbackCreateRequest,
  UrgencyLevel
} from '../../models/travel-feedback.model';
import { TravelPlan } from '../../models/travel-plan.model';
import { TravelFeedbackService } from '../../services/travel-feedback.service';
import { TravelPlanService } from '../../services/travel-plan.service';
import { PetTransitToastService } from '../../services/pet-transit-toast.service';

const FEEDBACK_TYPES: FeedbackType[] = ['REVIEW', 'SUGGESTION', 'INCIDENT', 'COMPLAINT'];

@Component({
  selector: 'app-travel-plan-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './travel-plan-feedback.component.html',
  styleUrl: './travel-plan-feedback.component.scss'
})
export class TravelPlanFeedbackComponent implements OnInit, OnDestroy {
  planId = 0;
  plan: TravelPlan | null = null;
  existingFeedbacks: TravelFeedback[] = [];

  loadingPlan = true;
  loadingFeedbacks = true;
  submitting = false;
  submitted = false;
  showSuccess = false;

  selectedType: FeedbackType | null = null;
  formVisible = false;

  // Form fields
  formTitle = '';
  formMessage = '';
  formRating = 0;
  formHoverRating = 0;
  formIncidentLocation = '';
  formUrgency: UrgencyLevel = 'NORMAL';

  readonly feedbackTypes = FEEDBACK_TYPES;
  readonly typeConfig = FEEDBACK_TYPE_CONFIG;
  readonly urgencyLevels: UrgencyLevel[] = ['NORMAL', 'HIGH', 'CRITICAL'];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly feedbackService: TravelFeedbackService,
    private readonly planService: TravelPlanService,
    private readonly toast: PetTransitToastService
  ) {}

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('planId');
    this.planId = Number(raw ?? 0);
    this.loadPlan();
    this.loadExistingFeedbacks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectType(type: FeedbackType): void {
    this.selectedType = type;
    this.formUrgency = 'NORMAL';
    this.formRating = 0;
    this.formHoverRating = 0;
    this.formTitle = '';
    this.formMessage = '';
    this.formIncidentLocation = '';
    setTimeout(() => {
      this.formVisible = true;
    }, 50);
  }

  setRating(r: number): void {
    this.formRating = r;
  }

  setHoverRating(r: number): void {
    this.formHoverRating = r;
  }

  clearHoverRating(): void {
    this.formHoverRating = 0;
  }

  effectiveRating(): number {
    return this.formHoverRating || this.formRating;
  }

  selectUrgency(level: UrgencyLevel): void {
    this.formUrgency = level;
  }

  isFormValid(): boolean {
    if (!this.selectedType) return false;
    if (this.selectedType === 'REVIEW' && this.formRating === 0) return false;
    if (
      (this.selectedType === 'INCIDENT' || this.selectedType === 'COMPLAINT') &&
      !this.formMessage.trim()
    ) {
      return false;
    }
    return true;
  }

  submit(): void {
    if (!this.selectedType || !this.isFormValid() || this.submitting) return;

    const request: TravelFeedbackCreateRequest = {
      travelPlanId: this.planId,
      feedbackType: this.selectedType,
      title: this.formTitle.trim() || undefined,
      message: this.formMessage.trim() || undefined,
      rating: this.selectedType === 'REVIEW' ? this.formRating : undefined,
      incidentLocation:
        this.selectedType === 'INCIDENT' || this.selectedType === 'COMPLAINT'
          ? this.formIncidentLocation.trim() || undefined
          : undefined,
      urgencyLevel:
        this.selectedType === 'INCIDENT' || this.selectedType === 'COMPLAINT'
          ? this.formUrgency
          : undefined
    };

    this.submitting = true;
    this.feedbackService
      .createFeedback(this.planId, request)
      .pipe(
        finalize(() => (this.submitting = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.toast.success('Feedback submitted successfully.');
          this.showSuccess = true;
          setTimeout(() => this.router.navigate(['/app/transit/plans/my']), 2500);
        },
        error: (err: Error) => {
          this.toast.error(err.message || 'Failed to submit feedback.');
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/app/transit/plans/my']);
  }

  heroStyle(): Record<string, string> {
    const img = this.plan?.destinationCoverImageUrl;
    if (img) {
      return {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('${img}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }
    return {
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    };
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  feedbackTypeLabel(type: FeedbackType): string {
    return FEEDBACK_TYPE_CONFIG[type]?.label ?? type;
  }

  feedbackStatusLabel(status: string): string {
    const map: Record<string, string> = {
      PENDING: 'Pending',
      IN_PROGRESS: 'In Progress',
      RESOLVED: 'Resolved',
      CLOSED: 'Closed'
    };
    return map[status] ?? status;
  }

  trackByFeedback(_: number, fb: TravelFeedback): number {
    return fb.id;
  }

  private loadPlan(): void {
    this.loadingPlan = true;
    this.planService
      .getTravelPlanById(this.planId)
      .pipe(
        finalize(() => (this.loadingPlan = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (plan) => (this.plan = plan),
        error: () => {
          // non-fatal — continue without plan details
        }
      });
  }

  private loadExistingFeedbacks(): void {
    this.loadingFeedbacks = true;
    this.feedbackService
      .getFeedbacksForPlan(this.planId)
      .pipe(
        finalize(() => (this.loadingFeedbacks = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (feedbacks) => (this.existingFeedbacks = feedbacks ?? []),
        error: () => (this.existingFeedbacks = [])
      });
  }
}
