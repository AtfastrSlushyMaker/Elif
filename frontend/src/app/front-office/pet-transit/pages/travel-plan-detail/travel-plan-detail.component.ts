import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, finalize, switchMap, takeUntil } from 'rxjs';
import {
  DELETABLE_TRAVEL_PLAN_STATUSES,
  EDITABLE_TRAVEL_PLAN_STATUSES,
  TRANSPORT_TYPE_LABELS,
  TravelPlan,
  TravelPlanStatus
} from '../../models/travel-plan.model';
import { TravelPlanService } from '../../services/travel-plan.service';
import { ReadinessScoreComponent } from '../../components/readiness-score/readiness-score.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';

@Component({
  selector: 'app-travel-plan-detail',
  standalone: true,
  imports: [CommonModule, StatusBadgeComponent, ReadinessScoreComponent],
  templateUrl: './travel-plan-detail.component.html',
  styleUrl: './travel-plan-detail.component.scss'
})
export class TravelPlanDetailComponent implements OnInit, OnDestroy {
  plan: TravelPlan | null = null;
  loading = true;
  deleting = false;
  errorMessage = '';
  showDeleteDialog = false;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly travelPlanService: TravelPlanService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const planId = Number(params.get('id'));
          if (Number.isNaN(planId) || planId <= 0) {
            throw new Error('Invalid travel plan id.');
          }

          this.loading = true;
          this.errorMessage = '';
          return this.travelPlanService.getTravelPlanById(planId);
        }),
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
          this.errorMessage =
            error instanceof Error ? error.message : 'Unable to load this travel plan.';
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  canEdit(): boolean {
    if (!this.plan) {
      return false;
    }

    return EDITABLE_TRAVEL_PLAN_STATUSES.includes(this.plan.status);
  }

  canDelete(): boolean {
    if (!this.plan) {
      return false;
    }

    return DELETABLE_TRAVEL_PLAN_STATUSES.includes(this.plan.status);
  }

  goBack(): void {
    this.router.navigate(['/app/transit/plans']);
  }

  editPlan(): void {
    if (!this.plan || !this.canEdit()) {
      return;
    }

    this.router.navigate(['/app/transit/plans', this.plan.id, 'edit']);
  }

  openDeleteDialog(): void {
    if (!this.canDelete()) {
      return;
    }

    this.showDeleteDialog = true;
  }

  closeDeleteDialog(): void {
    if (this.deleting) {
      return;
    }

    this.showDeleteDialog = false;
  }

  confirmDelete(): void {
    if (!this.plan) {
      return;
    }

    this.deleting = true;
    this.errorMessage = '';

    this.travelPlanService
      .deleteTravelPlan(this.plan.id)
      .pipe(
        finalize(() => {
          this.deleting = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/app/transit/plans'], {
            state: { flashMessage: 'Travel plan deleted successfully.' }
          });
        },
        error: (error: unknown) => {
          this.errorMessage =
            error instanceof Error
              ? error.message
              : 'Unable to delete this travel plan right now. Please try again.';
        }
      });
  }

  transportLabel(value: TravelPlan['transportType'] | undefined): string {
    if (!value) {
      return 'N/A';
    }

    return TRANSPORT_TYPE_LABELS[value] ?? value;
  }

  statusToneClass(status: TravelPlanStatus | undefined): string {
    const value = status ?? 'DRAFT';
    const map: Record<TravelPlanStatus, string> = {
      DRAFT: 'tone-draft',
      IN_PREPARATION: 'tone-prep',
      SUBMITTED: 'tone-submitted',
      APPROVED: 'tone-approved',
      REJECTED: 'tone-rejected',
      COMPLETED: 'tone-completed',
      CANCELLED: 'tone-cancelled'
    };

    return map[value];
  }
}
