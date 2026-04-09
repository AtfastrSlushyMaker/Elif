import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';
import { TransportType, TravelPlanStatus, TravelPlanSummary } from '../../models/travel-plan.model';
import { PetTransitToastService } from '../../services/pet-transit-toast.service';
import { TravelPlanService } from '../../services/travel-plan.service';

type PlanFilter = 'ALL' | 'IN_PREPARATION' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

type TransportChip = {
  icon: string;
  label: string;
};

@Component({
  selector: 'app-travel-plans-list',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './travel-plans-list.component.html',
  styleUrl: './travel-plans-list.component.scss'
})
export class TravelPlansListComponent implements OnInit, OnDestroy {
  readonly filters: { value: PlanFilter; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'IN_PREPARATION', label: 'In Preparation' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'COMPLETED', label: 'Completed' }
  ];

  private readonly transportMap: Record<TransportType, TransportChip> = {
    CAR: { icon: 'directions_car', label: 'Car' },
    TRAIN: { icon: 'train', label: 'Train' },
    PLANE: { icon: 'flight', label: 'Plane' },
    BUS: { icon: 'directions_bus', label: 'Bus' }
  };

  plans: TravelPlanSummary[] = [];
  loading = true;
  deleting = false;
  errorMessage = '';

  activeFilter: PlanFilter = 'ALL';
  pendingDeletePlan: TravelPlanSummary | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly travelPlanService: TravelPlanService,
    readonly router: Router,
    private readonly toastService: PetTransitToastService
  ) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get filteredPlans(): TravelPlanSummary[] {
    return this.plans.filter((plan) => {
      if (this.activeFilter === 'ALL') {
        return true;
      }

      return plan.status === this.activeFilter;
    });
  }

  setFilter(filter: PlanFilter): void {
    this.activeFilter = filter;
  }

  isFilterActive(filter: PlanFilter): boolean {
    return this.activeFilter === filter;
  }

  trackByPlan(_: number, plan: TravelPlanSummary): number {
    return plan.id;
  }

  statusLabel(status: TravelPlanStatus): string {
    const labels: Record<TravelPlanStatus, string> = {
      DRAFT: 'Draft',
      IN_PREPARATION: 'In Preparation',
      SUBMITTED: 'Submitted',
      APPROVED: 'Approved',
      REJECTED: 'Rejected',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled'
    };

    return labels[status] ?? status;
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

  readinessClass(score: number): string {
    if (score < 40) {
      return 'readiness-low';
    }

    if (score < 80) {
      return 'readiness-medium';
    }

    return 'readiness-high';
  }

  transportChip(transportType: TravelPlanSummary['transportType']): TransportChip | null {
    if (!transportType) {
      return null;
    }

    return this.transportMap[transportType] ?? null;
  }

  petDisplayName(plan: TravelPlanSummary): string {
    const pet = this.extractPetRecord(plan);
    const explicitName = this.pickPetText(plan.petName, pet?.['name']);
    if (explicitName) {
      return explicitName;
    }

    if (plan.petId && plan.petId > 0) {
      return `Pet #${plan.petId}`;
    }

    return 'Unknown Pet';
  }

  petImageUrl(plan: TravelPlanSummary): string | null {
    const pet = this.extractPetRecord(plan);
    const source = plan as unknown as Record<string, unknown>;
    return this.pickPetText(
      pet?.['imageUrl'],
      pet?.['photoUrl'],
      pet?.['profilePhoto'],
      pet?.['avatarUrl'],
      source['petImageUrl'],
      source['petPhotoUrl'],
      source['petProfilePhoto']
    );
  }

  petBreed(plan: TravelPlanSummary): string | null {
    const pet = this.extractPetRecord(plan);
    const source = plan as unknown as Record<string, unknown>;
    return this.pickPetText(
      pet?.['breed'],
      source['petBreed']
    );
  }

  onPetImgError(event: Event): void {
    (event.target as HTMLImageElement).src = '/images/animals/cat.png';
  }

  petIndicator(plan: TravelPlanSummary): string {
    if (plan.petId && plan.petId > 0) {
      return `Pet #${plan.petId}`;
    }

    return '�';
  }

  openDetails(planId: number): void {
    this.router.navigate(['/app/transit/plans', planId]);
  }

  openDocuments(planId: number): void {
    const normalizedPlanId = Number(planId);
    console.log('[TravelPlansList] navigating to documents with planId:', normalizedPlanId);

    if (!Number.isFinite(normalizedPlanId) || normalizedPlanId <= 0) {
      this.toastService.error('Unable to open documents: invalid plan id.');
      return;
    }

    this.router.navigate(['/app/transit/plans', normalizedPlanId, 'documents']);
  }

  openCreate(): void {
    this.router.navigate(['/app/transit/destinations']);
  }

  openEdit(planId: number): void {
    this.router.navigate(['/app/transit/plans', planId, 'edit']);
  }

  canEdit(plan: TravelPlanSummary): boolean {
    return ['DRAFT', 'IN_PREPARATION', 'REJECTED'].includes(plan.status);
  }

  openDestinations(): void {
    this.router.navigate(['/app/transit/destinations']);
  }

  goToFeedback(planId: number): void {
    this.router.navigate(['/app/transit/plans', planId, 'feedback', 'new']);
  }

  retryLoad(): void {
    this.loadPlans();
  }

  openDeleteDialog(plan: TravelPlanSummary): void {
    this.pendingDeletePlan = plan;
  }

  closeDeleteDialog(): void {
    this.pendingDeletePlan = null;
  }

  confirmDelete(): void {
    if (!this.pendingDeletePlan) {
      return;
    }

    this.deleting = true;
    const planId = this.pendingDeletePlan.id;

    this.travelPlanService
      .deleteTravelPlan(planId)
      .pipe(
        finalize(() => {
          this.deleting = false;
          this.closeDeleteDialog();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.plans = this.plans.filter((p) => p.id !== planId);
          this.toastService.success('Travel plan deleted successfully.');
        },
        error: (error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : 'Unable to delete this travel plan right now. Please try again.';
          this.toastService.error(message);
        }
      });
  }

  private extractPetRecord(plan: TravelPlanSummary): Record<string, unknown> | null {
    const source = plan as unknown as Record<string, unknown>;
    const candidate = source['pet'];
    return candidate && typeof candidate === 'object'
      ? (candidate as Record<string, unknown>)
      : null;
  }

  private pickPetText(...candidates: unknown[]): string | null {
    for (const candidate of candidates) {
      const normalized = String(candidate ?? '').trim();
      if (normalized) {
        return normalized;
      }
    }

    return null;
  }

  private loadPlans(): void {
    this.loading = true;
    this.errorMessage = '';

    this.travelPlanService
      .getMyTravelPlans()
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (plans) => {
          this.plans = plans;
        },
        error: (error: unknown) => {
          const isSessionMissing = !this.travelPlanService.getCurrentUserId();
          this.errorMessage = isSessionMissing
            ? 'Your session is missing. Please sign in again and retry.'
            : error instanceof Error
              ? error.message
              : 'Unable to load your travel plans right now.';
          this.toastService.error(this.errorMessage);
        }
      });
  }
}

