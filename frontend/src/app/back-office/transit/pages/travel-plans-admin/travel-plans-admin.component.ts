import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { TransitToastContainerComponent } from '../../components/transit-toast-container/transit-toast-container.component';
import { TransitToastService } from '../../services/transit-toast.service';
import {
  TravelPlanStatus,
  TravelPlanSummary
} from '../../models/travel-plan-admin.model';
import { TravelPlanAdminService } from '../../services/travel-plan-admin.service';

type PlanFilter = 'ALL' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'DRAFT';

@Component({
  selector: 'app-travel-plans-admin',
  standalone: true,
  imports: [CommonModule, MatIconModule, TransitToastContainerComponent],
  templateUrl: './travel-plans-admin.component.html',
  styleUrl: './travel-plans-admin.component.scss'
})
export class TravelPlansAdminComponent implements OnInit {
  readonly filters: Array<{ value: PlanFilter; label: string }> = [
    { value: 'ALL', label: 'All' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'DRAFT', label: 'Draft' }
  ];

  readonly skeletonRows = [1, 2, 3, 4];

  plans: TravelPlanSummary[] = [];
  loading = true;
  errorMessage = '';
  activeFilter: PlanFilter = 'ALL';

  constructor(
    private readonly router: Router,
    private readonly travelPlanAdminService: TravelPlanAdminService,
    private readonly transitToastService: TransitToastService
  ) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  get filteredPlans(): TravelPlanSummary[] {
    const filtered = this.plans.filter((plan) => {
      if (this.activeFilter === 'ALL') {
        return true;
      }

      return plan.status === this.activeFilter;
    });

    return [...filtered].sort((left, right) => this.comparePlans(left, right));
  }

  get totalPlans(): number {
    return this.plans.length;
  }

  get submittedCount(): number {
    return this.plans.filter((plan) => plan.status === 'SUBMITTED').length;
  }

  get approvedCount(): number {
    return this.plans.filter((plan) => plan.status === 'APPROVED').length;
  }

  setFilter(filter: PlanFilter): void {
    this.activeFilter = filter;
  }

  isFilterActive(filter: PlanFilter): boolean {
    return this.activeFilter === filter;
  }

  openDetails(planId: number): void {
    this.router.navigate(['/admin/transit/travel-plans', planId]);
  }

  retry(): void {
    this.loadPlans();
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
    return `status-${String(status).toLowerCase()}`;
  }

  accentClass(status: TravelPlanStatus): string {
    return `accent-${String(status).toLowerCase()}`;
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

  initials(name: string): string {
    const chunks = String(name ?? '')
      .trim()
      .split(/\s+/)
      .filter((item) => item.length > 0);

    if (chunks.length === 0) {
      return 'NA';
    }

    if (chunks.length === 1) {
      return chunks[0].slice(0, 2).toUpperCase();
    }

    return `${chunks[0][0]}${chunks[1][0]}`.toUpperCase();
  }

  formatDate(value?: string): string {
    const normalized = String(value ?? '').trim();
    if (!normalized) {
      return 'Date not set';
    }

    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
      return normalized;
    }

    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date);
  }

  emptySubtitle(): string {
    if (this.activeFilter === 'ALL') {
      return 'No travel plans are available right now.';
    }

    return `No ${this.filters.find((item) => item.value === this.activeFilter)?.label ?? ''} plans found.`;
  }

  private loadPlans(): void {
    this.loading = true;
    this.errorMessage = '';

    this.travelPlanAdminService
      .getAllPlans()
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (plans) => {
          this.plans = plans;
        },
        error: (error: unknown) => {
          this.errorMessage =
            error instanceof Error
              ? error.message
              : 'Unable to load travel plans right now. Please try again.';
          this.transitToastService.error('Loading failed', this.errorMessage);
        }
      });
  }

  private comparePlans(left: TravelPlanSummary, right: TravelPlanSummary): number {
    if (this.activeFilter === 'ALL') {
      const statusPriority: Record<TravelPlanStatus, number> = {
        SUBMITTED: 0,
        APPROVED: 1,
        IN_PREPARATION: 2,
        DRAFT: 3,
        REJECTED: 4,
        COMPLETED: 5,
        CANCELLED: 6
      };

      const leftPriority = statusPriority[left.status] ?? 99;
      const rightPriority = statusPriority[right.status] ?? 99;
      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }
    }

    return this.toTimestamp(right.createdAt) - this.toTimestamp(left.createdAt);
  }

  private toTimestamp(value?: string): number {
    const parsed = Date.parse(String(value ?? ''));
    return Number.isNaN(parsed) ? 0 : parsed;
  }
}
