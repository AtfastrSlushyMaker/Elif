import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';
import {
  SafetyStatus,
  TravelPlanStatus,
  TravelPlanSummary,
  TRAVEL_PLAN_STATUS_CONFIG
} from '../../models/travel-plan.model';
import { TravelPlanService } from '../../services/travel-plan.service';
import { TravelPlanCardComponent } from '../../components/travel-plan-card/travel-plan-card.component';

@Component({
  selector: 'app-travel-plans-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TravelPlanCardComponent],
  templateUrl: './travel-plans-list.component.html',
  styleUrl: './travel-plans-list.component.scss'
})
export class TravelPlansListComponent implements OnInit, OnDestroy {
  readonly statusChips = [
    { value: 'ALL', label: 'All Plans' },
    ...Object.entries(TRAVEL_PLAN_STATUS_CONFIG).map(([value, config]) => ({
      value,
      label: config.label
    }))
  ];

  plans: TravelPlanSummary[] = [];
  loading = true;
  deleting = false;
  errorMessage = '';
  flashMessage = '';

  selectedStatus: TravelPlanStatus | 'ALL' = 'ALL';
  pendingDeletePlan: TravelPlanSummary | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly travelPlanService: TravelPlanService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.flashMessage = (history.state?.flashMessage as string) ?? '';
    this.loadPlans();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get filteredPlans(): TravelPlanSummary[] {
    if (this.selectedStatus === 'ALL') {
      return this.plans;
    }

    return this.plans.filter((plan) => plan.status === this.selectedStatus);
  }

  get totalPlans(): number {
    return this.plans.length;
  }

  get inPreparationCount(): number {
    return this.plans.filter((plan) => plan.status === 'IN_PREPARATION').length;
  }

  get approvedCount(): number {
    return this.plans.filter((plan) => plan.status === 'APPROVED').length;
  }

  get alertCount(): number {
    return this.plans.filter((plan) => plan.safetyStatus === 'ALERT' || plan.safetyStatus === 'INVALID').length;
  }

  trackByPlan(_: number, plan: TravelPlanSummary): number {
    return plan.id;
  }

  filterByStatusValue(status: string): void {
    this.selectedStatus = status as TravelPlanStatus | 'ALL';
  }

  onViewDetails(planId: number): void {
    this.router.navigate(['/app/transit/plans', planId]);
  }

  onEditPlan(planId: number): void {
    this.router.navigate(['/app/transit/plans', planId, 'edit']);
  }

  openDeleteDialog(planId: number): void {
    this.pendingDeletePlan = this.plans.find((plan) => plan.id === planId) ?? null;
  }

  closeDeleteDialog(): void {
    if (this.deleting) {
      return;
    }

    this.pendingDeletePlan = null;
  }

  confirmDelete(): void {
    if (!this.pendingDeletePlan) {
      return;
    }

    this.deleting = true;
    this.errorMessage = '';

    this.travelPlanService
      .deleteTravelPlan(this.pendingDeletePlan.id)
      .pipe(
        finalize(() => {
          this.deleting = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          const deletedId = this.pendingDeletePlan?.id;
          this.pendingDeletePlan = null;
          this.plans = this.plans.filter((plan) => plan.id !== deletedId);
          this.flashMessage = 'Travel plan deleted successfully.';
        },
        error: (error: unknown) => {
          this.errorMessage =
            error instanceof Error
              ? error.message
              : 'Unable to delete this plan right now. Please try again.';
        }
      });
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
          this.errorMessage =
            error instanceof Error ? error.message : 'Unable to load plans. Please try again.';
        }
      });
  }
}




