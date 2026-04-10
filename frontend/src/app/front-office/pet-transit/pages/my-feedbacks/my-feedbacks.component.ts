import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';
import { EditFeedbackModalComponent } from '../../components/edit-feedback-modal/edit-feedback-modal.component';
import { FeedbackDetailsModalComponent } from '../../components/feedback-details-modal/feedback-details-modal.component';
import {
  FEEDBACK_TYPE_CONFIG,
  FeedbackType,
  PROCESSING_STATUS_CONFIG,
  ProcessingStatus,
  TravelFeedback
} from '../../models/travel-feedback.model';
import { PetTransitToastService } from '../../services/pet-transit-toast.service';
import { TravelFeedbackService } from '../../services/travel-feedback.service';

type FeedbackFilter = 'ALL' | FeedbackType;

@Component({
  selector: 'app-my-feedbacks',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    EditFeedbackModalComponent,
    FeedbackDetailsModalComponent
  ],
  templateUrl: './my-feedbacks.component.html',
  styleUrl: './my-feedbacks.component.scss'
})
export class MyFeedbacksComponent implements OnInit, OnDestroy {
  feedbacks: TravelFeedback[] = [];
  loading = true;
  errorMessage = '';

  activeFilter: FeedbackFilter = 'ALL';
  pendingDeleteId: number | null = null;
  pendingDeletePlanId: number | null = null;
  deleting = false;

  feedbackToEdit: TravelFeedback | null = null;
  feedbackToView: TravelFeedback | null = null;

  readonly filterOptions: { value: FeedbackFilter; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'REVIEW', label: 'Reviews' },
    { value: 'SUGGESTION', label: 'Suggestions' },
    { value: 'INCIDENT', label: 'Incidents' },
    { value: 'COMPLAINT', label: 'Complaints' }
  ];

  readonly typeConfig = FEEDBACK_TYPE_CONFIG;
  readonly statusConfig = PROCESSING_STATUS_CONFIG;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly feedbackService: TravelFeedbackService,
    private readonly toastService: PetTransitToastService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeedbacks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get filteredFeedbacks(): TravelFeedback[] {
    if (this.activeFilter === 'ALL') {
      return this.feedbacks;
    }

    return this.feedbacks.filter((feedback) => feedback.feedbackType === this.activeFilter);
  }

  get totalCount(): number {
    return this.feedbacks.length;
  }

  get reviewCount(): number {
    return this.feedbacks.filter((feedback) => feedback.feedbackType === 'REVIEW').length;
  }

  get complaintsIncidentsCount(): number {
    return this.feedbacks.filter(
      (feedback) => feedback.feedbackType === 'COMPLAINT' || feedback.feedbackType === 'INCIDENT'
    ).length;
  }

  get pendingResponseCount(): number {
    return this.feedbacks.filter(
      (feedback) =>
        feedback.processingStatus === 'PENDING' || feedback.processingStatus === 'IN_PROGRESS'
    ).length;
  }

  setFilter(filter: FeedbackFilter): void {
    this.activeFilter = filter;
  }

  isFilterActive(filter: FeedbackFilter): boolean {
    return this.activeFilter === filter;
  }

  openEditModal(feedback: TravelFeedback): void {
    this.feedbackToEdit = feedback;
  }

  openDetailsModal(feedback: TravelFeedback): void {
    this.feedbackToView = feedback;
  }

  closeDetailsModal(): void {
    this.feedbackToView = null;
  }

  closeEditModal(): void {
    this.feedbackToEdit = null;
  }

  onFeedbackUpdated(): void {
    this.closeEditModal();
    this.loadFeedbacks();
    this.toastService.success('Feedback updated successfully.');
  }

  openDeleteConfirm(feedbackId: number, planId: number): void {
    this.pendingDeleteId = feedbackId;
    this.pendingDeletePlanId = planId;
  }

  closeDeleteConfirm(): void {
    this.pendingDeleteId = null;
    this.pendingDeletePlanId = null;
  }

  confirmDelete(): void {
    if (this.pendingDeleteId === null || this.pendingDeletePlanId === null) {
      return;
    }

    const feedbackId = this.pendingDeleteId;
    const planId = this.pendingDeletePlanId;
    this.deleting = true;

    this.feedbackService
      .deleteFeedback(planId, feedbackId)
      .pipe(
        finalize(() => {
          this.deleting = false;
          this.closeDeleteConfirm();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.feedbacks = this.feedbacks.filter((feedback) => feedback.id !== feedbackId);
          this.toastService.success('Feedback deleted.');
        },
        error: (error: Error) => {
          this.toastService.error(error.message || 'Failed to delete feedback.');
        }
      });
  }

  starsArray(rating: number): number[] {
    const normalizedRating = Math.round(Math.max(0, Math.min(5, rating)));
    return Array.from({ length: normalizedRating }, (_, index) => index);
  }

  emptyStarsArray(rating: number): number[] {
    const normalizedRating = Math.round(Math.max(0, Math.min(5, rating)));
    return Array.from({ length: 5 - normalizedRating }, (_, index) => index);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) {
      return '';
    }

    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  trackByFeedback(_: number, feedback: TravelFeedback): number {
    return feedback.id;
  }

  goToMyTrips(): void {
    this.router.navigate(['/app/transit/plans/my']);
  }

  getStatusClass(status: ProcessingStatus): string {
    const classMap: Record<ProcessingStatus, string> = {
      PENDING: 'status-pending',
      IN_PROGRESS: 'status-in-progress',
      RESOLVED: 'status-resolved',
      CLOSED: 'status-closed'
    };

    return classMap[status] ?? '';
  }

  typeRgb(type: FeedbackType): string {
    const hex = this.typeConfig[type].color.replace('#', '');
    const normalized = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
    const value = Number.parseInt(normalized, 16);

    if (Number.isNaN(value)) {
      return '67,160,71';
    }

    const red = (value >> 16) & 255;
    const green = (value >> 8) & 255;
    const blue = value & 255;

    return `${red}, ${green}, ${blue}`;
  }

  private loadFeedbacks(): void {
    this.loading = true;
    this.errorMessage = '';

    this.feedbackService
      .getMyFeedbacks()
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (list) => (this.feedbacks = list ?? []),
        error: (error: Error) => {
          this.errorMessage = error.message || 'Unable to load your feedbacks.';
          this.toastService.error(this.errorMessage);
        }
      });
  }
}
