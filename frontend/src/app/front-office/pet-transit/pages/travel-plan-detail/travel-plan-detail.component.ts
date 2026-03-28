import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';
import {
  RequiredDocumentType,
  SafetyStatus,
  TRANSPORT_TYPE_LABELS,
  TravelPlan,
  TravelPlanStatus
} from '../../models/travel-plan.model';
import { TravelPlanService } from '../../services/travel-plan.service';
import { PetTransitToastService } from '../../services/pet-transit-toast.service';

@Component({
  selector: 'app-travel-plan-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './travel-plan-detail.component.html',
  styleUrl: './travel-plan-detail.component.scss'
})
export class TravelPlanDetailComponent implements OnInit, OnDestroy {
  readonly statusLabels: Record<TravelPlanStatus, string> = {
    DRAFT: 'Draft',
    IN_PREPARATION: 'In Preparation',
    SUBMITTED: 'Submitted',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled'
  };

  readonly documentLabelMap: Record<RequiredDocumentType, string> = {
    PET_PASSPORT: 'Pet Passport',
    RABIES_VACCINE: 'Rabies Vaccine',
    HEALTH_CERTIFICATE: 'Health Certificate',
    TRANSPORT_AUTHORIZATION: 'Transport Authorization'
  };

  readonly documentIconMap: Record<RequiredDocumentType, string> = {
    PET_PASSPORT: 'badge',
    RABIES_VACCINE: 'vaccines',
    HEALTH_CERTIFICATE: 'medical_services',
    TRANSPORT_AUTHORIZATION: 'assignment'
  };

  readonly defaultRequiredDocuments: RequiredDocumentType[] = [
    'PET_PASSPORT',
    'RABIES_VACCINE',
    'HEALTH_CERTIFICATE',
    'TRANSPORT_AUTHORIZATION'
  ];

  plan: TravelPlan | null = null;
  loading = true;
  submitting = false;
  errorMessage = '';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly travelPlanService: TravelPlanService,
    private readonly toastService: PetTransitToastService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadPlan();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.router.navigate(['/app/transit/plans/my']);
  }

  statusLabel(status: TravelPlanStatus): string {
    return this.statusLabels[status] ?? status;
  }

  statusClass(status: TravelPlanStatus): string {
    const classes: Record<TravelPlanStatus, string> = {
      DRAFT: 'status-draft',
      IN_PREPARATION: 'status-in-preparation',
      SUBMITTED: 'status-submitted',
      APPROVED: 'status-approved',
      REJECTED: 'status-rejected',
      COMPLETED: 'status-completed',
      CANCELLED: 'status-cancelled'
    };

    return classes[status];
  }

  safetyClass(status: SafetyStatus): string {
    const classes: Record<SafetyStatus, string> = {
      PENDING: 'safety-pending',
      VALID: 'safety-valid',
      ALERT: 'safety-alert',
      INVALID: 'safety-invalid'
    };

    return classes[status];
  }

  safetyLabel(status: SafetyStatus): string {
    const labels: Record<SafetyStatus, string> = {
      PENDING: 'Pending',
      VALID: 'Valid',
      ALERT: 'Alert',
      INVALID: 'Invalid'
    };

    return labels[status];
  }

  transportLabel(value?: TravelPlan['transportType']): string {
    if (!value) {
      return 'Not set';
    }

    return TRANSPORT_TYPE_LABELS[value] ?? value;
  }

  readinessClass(score: number): string {
    if (score < 40) {
      return 'readiness-low';
    }

    if (score < 80) {
      return 'readiness-medium';
    }

    return 'readiness-high';
  }

  cageDimensions(plan: TravelPlan): string {
    const length = this.asPositiveOrNull(plan.cageLength);
    const width = this.asPositiveOrNull(plan.cageWidth);
    const height = this.asPositiveOrNull(plan.cageHeight);

    if (!length || !width || !height) {
      return '-';
    }

    return `${length} x ${width} x ${height} cm`;
  }

  requiredDocuments(plan: TravelPlan): RequiredDocumentType[] {
    return plan.requiredDocuments && plan.requiredDocuments.length > 0
      ? plan.requiredDocuments
      : this.defaultRequiredDocuments;
  }

  canSubmitPlan(plan: TravelPlan): boolean {
    return ['DRAFT', 'IN_PREPARATION'].includes(plan.status) && plan.readinessScore >= 80;
  }

  showEditableActions(plan: TravelPlan): boolean {
    return ['DRAFT', 'IN_PREPARATION'].includes(plan.status);
  }

  goToDocuments(planId: number): void {
    this.router.navigate(['/app/transit/plans', planId, 'documents']);
  }

  goToChecklist(planId: number): void {
    this.router.navigate(['/app/transit/plans', planId, 'checklist']);
  }

  goToFeedback(planId: number): void {
    this.router.navigate(['/app/transit/plans', planId, 'feedback']);
  }

  editPlan(planId: number): void {
    this.router.navigate(['/app/transit/plans', planId, 'edit']);
  }

  submitPlan(plan: TravelPlan): void {
    if (!this.canSubmitPlan(plan) || this.submitting) {
      return;
    }

    this.submitting = true;

    this.travelPlanService
      .submitTravelPlan(plan.id)
      .pipe(
        finalize(() => {
          this.submitting = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (updatedPlan) => {
          this.plan = updatedPlan;
          this.toastService.success('Plan submitted successfully');
        },
        error: (error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : 'Unable to submit this travel plan right now. Please try again.';
          this.toastService.error(message);
        }
      });
  }

  private loadPlan(): void {
    const planId = Number(this.route.snapshot.paramMap.get('id'));

    if (Number.isNaN(planId) || planId <= 0) {
      this.loading = false;
      this.plan = null;
      this.errorMessage = 'Invalid travel plan identifier.';
      return;
    }

    this.loading = true;
    this.plan = null;
    this.errorMessage = '';

    this.travelPlanService
      .getTravelPlanById(planId)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (plan) => {
          this.plan = plan;
        },
        error: (error: unknown) => {
          const isSessionMissing = !this.travelPlanService.getCurrentUserId();
          this.errorMessage = isSessionMissing
            ? 'Your session is missing. Please sign in again and retry.'
            : (error instanceof Error ? error.message : 'Unable to load travel plan details.');
        }
      });
  }

  private asPositiveOrNull(value: unknown): number | null {
    const normalized = Number(value ?? 0);
    if (Number.isNaN(normalized) || normalized <= 0) {
      return null;
    }

    return normalized;
  }
}






