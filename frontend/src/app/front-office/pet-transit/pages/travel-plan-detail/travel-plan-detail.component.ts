import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';
import { TravelDestination } from '../../models/travel-destination.model';
import {
  RequiredDocumentType,
  SafetyStatus,
  TRANSPORT_TYPE_LABELS,
  TravelPlan,
  TravelPlanStatus
} from '../../models/travel-plan.model';
import { PetTransitToastService } from '../../services/pet-transit-toast.service';
import { TravelDestinationService } from '../../services/travel-destination.service';
import {
  TravelPlanDocument,
  TravelPlanService
} from '../../services/travel-plan.service';

type RequiredDocumentState = 'VALIDATED' | 'PENDING' | 'REJECTED' | 'NOT_UPLOADED';

type RequiredDocumentRow = {
  type: RequiredDocumentType;
  label: string;
  icon: string;
  state: RequiredDocumentState;
  stateLabel: string;
  stateIcon: string;
  stateClass: string;
  fileName?: string;
};

@Component({
  selector: 'app-travel-plan-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule],
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
    PET_PASSPORT: 'pets',
    RABIES_VACCINE: 'healing',
    HEALTH_CERTIFICATE: 'assignment_turned_in',
    TRANSPORT_AUTHORIZATION: 'assignment'
  };

  plan: TravelPlan | null = null;
  destination: TravelDestination | null = null;
  uploadedDocuments: TravelPlanDocument[] = [];

  heroImages: string[] = [];
  currentImageIndex = 0;

  loading = true;
  destinationLoading = false;
  documentsLoading = false;
  submitting = false;
  errorMessage = '';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly travelPlanService: TravelPlanService,
    private readonly destinationService: TravelDestinationService,
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

  get hasMultipleImages(): boolean {
    return this.heroImages.length > 1;
  }

  get currentHeroImage(): string {
    return this.heroImages[this.currentImageIndex] ?? '';
  }

  get requiredDocumentRows(): RequiredDocumentRow[] {
    const required = this.destinationRequiredDocuments();
    return required.map((documentType) => this.buildDocumentRow(documentType));
  }

  goBack(): void {
    this.router.navigate(['/app/transit/plans/my']);
  }

  retryLoad(): void {
    this.loadPlan();
  }

  showPreviousImage(): void {
    if (!this.hasMultipleImages) {
      return;
    }

    this.currentImageIndex =
      this.currentImageIndex === 0 ? this.heroImages.length - 1 : this.currentImageIndex - 1;
  }

  showNextImage(): void {
    if (!this.hasMultipleImages) {
      return;
    }

    this.currentImageIndex =
      this.currentImageIndex >= this.heroImages.length - 1 ? 0 : this.currentImageIndex + 1;
  }

  selectImage(index: number): void {
    if (index < 0 || index >= this.heroImages.length) {
      return;
    }

    this.currentImageIndex = index;
  }

  trackByImage(index: number): number {
    return index;
  }

  trackByRequiredDocument(_: number, row: RequiredDocumentRow): string {
    return row.type;
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
      return '—';
    }

    return TRANSPORT_TYPE_LABELS[value] ?? value;
  }

  transportIcon(value?: TravelPlan['transportType']): string {
    const iconMap = {
      CAR: 'directions_car',
      TRAIN: 'train',
      PLANE: 'flight',
      BUS: 'directions_bus'
    } as const;

    if (!value) {
      return 'alt_route';
    }

    return iconMap[value] ?? 'alt_route';
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
      return '—';
    }

    return `${length} x ${width} x ${height} cm`;
  }

  showEditableActions(plan: TravelPlan): boolean {
    return ['DRAFT', 'IN_PREPARATION'].includes(plan.status);
  }

  canSubmitPlan(plan: TravelPlan): boolean {
    return this.showEditableActions(plan) && plan.readinessScore >= 80;
  }

  showReviewMetadata(plan: TravelPlan): boolean {
    return ['APPROVED', 'REJECTED'].includes(plan.status);
  }

  showRejectedCommentBanner(plan: TravelPlan): boolean {
    return plan.status === 'REJECTED' && Boolean(plan.adminDecisionComment?.trim());
  }

  goToDocuments(planId: number): void {
    const normalizedPlanId = Number(planId);
    console.log('[TravelPlanDetail] navigating to documents with planId:', normalizedPlanId);

    if (!Number.isFinite(normalizedPlanId) || normalizedPlanId <= 0) {
      this.toastService.error('Unable to open documents: invalid plan id.');
      return;
    }

    this.router.navigate(['/app/transit/plans', normalizedPlanId, 'documents']);
  }

  goToChecklist(planId: number): void {
    const normalizedPlanId = Number(planId);

    if (!Number.isFinite(normalizedPlanId) || normalizedPlanId <= 0) {
      this.toastService.error('Unable to open checklist: invalid plan id.');
      return;
    }

    this.router.navigate(['/app/transit/plans', normalizedPlanId, 'checklist']);
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
          this.toastService.success('Travel plan submitted successfully.');
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
      this.toastService.error(this.errorMessage);
      return;
    }

    this.loading = true;
    this.plan = null;
    this.destination = null;
    this.uploadedDocuments = [];
    this.heroImages = [];
    this.currentImageIndex = 0;
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
          this.loadDestination(plan.destinationId);
          this.loadUploadedDocuments(plan.id);
        },
        error: (error: unknown) => {
          const isSessionMissing = !this.travelPlanService.getCurrentUserId();
          this.errorMessage = isSessionMissing
            ? 'Your session is missing. Please sign in again and retry.'
            : error instanceof Error
              ? error.message
              : 'Unable to load travel plan details.';
          this.toastService.error(this.errorMessage);
        }
      });
  }

  private loadDestination(destinationId: number): void {
    this.destinationLoading = true;

    this.destinationService
      .getDestinationById(destinationId)
      .pipe(
        finalize(() => {
          this.destinationLoading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (destination) => {
          this.destination = destination;
          this.heroImages = this.buildHeroImages(destination);
          this.currentImageIndex = 0;
        },
        error: (error: unknown) => {
          this.destination = null;
          this.heroImages = [];
          const message =
            error instanceof Error
              ? error.message
              : 'Unable to load destination media right now.';
          this.toastService.error(message);
        }
      });
  }

  private loadUploadedDocuments(planId: number): void {
    this.documentsLoading = true;

    this.travelPlanService
      .getTravelPlanDocuments(planId)
      .pipe(
        finalize(() => {
          this.documentsLoading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (documents) => {
          this.uploadedDocuments = documents;
        },
        error: (error: unknown) => {
          this.uploadedDocuments = [];
          const message =
            error instanceof Error
              ? error.message
              : 'Unable to load travel plan documents right now.';
          this.toastService.error(message);
        }
      });
  }

  private buildHeroImages(destination: TravelDestination): string[] {
    const images: string[] = [];

    const appendUnique = (imageUrl?: string): void => {
      const normalized = (imageUrl ?? '').trim();
      if (!normalized || images.includes(normalized)) {
        return;
      }

      images.push(normalized);
    };

    appendUnique(destination.coverImageUrl);
    (destination.carouselImages ?? []).forEach((image) => appendUnique(image.imageUrl));

    return images;
  }

  private destinationRequiredDocuments(): RequiredDocumentType[] {
    const required = this.destination?.requiredDocuments ?? [];

    return required
      .map((value) => String(value ?? '').trim().toUpperCase())
      .filter((value): value is RequiredDocumentType =>
        ['PET_PASSPORT', 'RABIES_VACCINE', 'HEALTH_CERTIFICATE', 'TRANSPORT_AUTHORIZATION'].includes(
          value
        )
      );
  }

  private buildDocumentRow(type: RequiredDocumentType): RequiredDocumentRow {
    const uploaded = this.findUploadedDocument(type);

    if (!uploaded) {
      return {
        type,
        label: this.documentLabelMap[type],
        icon: this.documentIconMap[type],
        state: 'NOT_UPLOADED',
        stateLabel: 'Not uploaded',
        stateIcon: 'remove_circle_outline',
        stateClass: 'doc-state-neutral'
      };
    }

    if (uploaded.validationStatus === 'VALIDATED') {
      return {
        type,
        label: this.documentLabelMap[type],
        icon: this.documentIconMap[type],
        state: 'VALIDATED',
        stateLabel: 'Validated',
        stateIcon: 'check_circle',
        stateClass: 'doc-state-success',
        fileName: uploaded.fileName
      };
    }

    if (uploaded.validationStatus === 'REJECTED') {
      return {
        type,
        label: this.documentLabelMap[type],
        icon: this.documentIconMap[type],
        state: 'REJECTED',
        stateLabel: 'Rejected or Missing',
        stateIcon: 'cancel',
        stateClass: 'doc-state-danger',
        fileName: uploaded.fileName
      };
    }

    return {
      type,
      label: this.documentLabelMap[type],
      icon: this.documentIconMap[type],
      state: 'PENDING',
      stateLabel: 'Under review',
      stateIcon: 'schedule',
      stateClass: 'doc-state-warning',
      fileName: uploaded.fileName
    };
  }

  private findUploadedDocument(type: RequiredDocumentType): TravelPlanDocument | null {
    const matches = this.uploadedDocuments.filter((document) => document.documentType === type);
    if (matches.length === 0) {
      return null;
    }

    return matches.sort((left, right) => {
      const leftDate = Date.parse(left.uploadedAt ?? '');
      const rightDate = Date.parse(right.uploadedAt ?? '');

      const leftTime = Number.isNaN(leftDate) ? 0 : leftDate;
      const rightTime = Number.isNaN(rightDate) ? 0 : rightDate;

      return rightTime - leftTime;
    })[0];
  }

  private asPositiveOrNull(value: unknown): number | null {
    const normalized = Number(value ?? 0);
    if (Number.isNaN(normalized) || normalized <= 0) {
      return null;
    }

    return normalized;
  }
}


