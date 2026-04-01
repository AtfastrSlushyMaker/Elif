import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { finalize, take } from 'rxjs';
import { TransitConfirmationDialogComponent } from '../../components/transit-confirmation-dialog/transit-confirmation-dialog.component';
import { TransitToastContainerComponent } from '../../components/transit-toast-container/transit-toast-container.component';
import { TransitConfirmationDialogService } from '../../services/transit-confirmation-dialog.service';
import { TransitToastService } from '../../services/transit-toast.service';
import {
  TravelPlanStatus,
  TravelPlanSummary
} from '../../models/travel-plan-admin.model';
import { TravelPlanAdminService } from '../../services/travel-plan-admin.service';

type PlanFilter =
  | 'ALL'
  | 'DRAFT'
  | 'IN_PREPARATION'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

@Component({
  selector: 'app-travel-plans-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    TransitToastContainerComponent,
    TransitConfirmationDialogComponent
  ],
  templateUrl: './travel-plans-admin.component.html',
  styleUrl: './travel-plans-admin.component.scss'
})
export class TravelPlansAdminComponent implements OnInit {
  readonly filters: Array<{ value: PlanFilter; label: string }> = [
    { value: 'ALL', label: 'All' },
    { value: 'SUBMITTED', label: 'Submitted' },
    { value: 'APPROVED', label: 'Approved' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'IN_PREPARATION', label: 'In Preparation' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  readonly skeletonRows = [1, 2, 3, 4];

  plans: TravelPlanSummary[] = [];
  loading = true;
  errorMessage = '';
  activeFilter: PlanFilter = 'ALL';

  searchTerm = '';
  travelDateFilter = '';

  removingPlanId: number | null = null;

  constructor(
    private readonly router: Router,
    private readonly travelPlanAdminService: TravelPlanAdminService,
    private readonly transitToastService: TransitToastService,
    private readonly confirmationDialogService: TransitConfirmationDialogService
  ) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  get filteredPlans(): TravelPlanSummary[] {
    const keyword = this.searchTerm.trim().toLowerCase();

    const filtered = this.plans.filter((plan) => {
      const statusMatches = this.activeFilter === 'ALL' || plan.status === this.activeFilter;
      const searchMatches = this.matchesSearch(plan, keyword);
      const dateMatches = this.matchesDate(plan);

      return statusMatches && searchMatches && dateMatches;
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

  get hasQuickFilters(): boolean {
    return Boolean(this.searchTerm.trim()) || Boolean(this.travelDateFilter);
  }

  setFilter(filter: PlanFilter): void {
    this.activeFilter = filter;
  }

  isFilterActive(filter: PlanFilter): boolean {
    return this.activeFilter === filter;
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.searchTerm = target?.value ?? '';
  }

  onDateFilterChange(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.travelDateFilter = String(target?.value ?? '').trim();
  }

  clearQuickFilters(): void {
    this.searchTerm = '';
    this.travelDateFilter = '';
  }

  openDetails(planId: number): void {
    this.router.navigate(['/admin/transit/travel-plans', planId]);
  }

  removeFromAdmin(plan: TravelPlanSummary): void {
    if (!plan?.id || this.removingPlanId !== null) {
      return;
    }

    this.confirmationDialogService
      .confirm({
        title: 'Remove Plan From Admin View',
        message: `This will hide plan #${plan.id} from admin lists only. The client will still keep the plan.`,
        confirmLabel: 'Remove',
        cancelLabel: 'Cancel',
        tone: 'warning'
      })
      .pipe(take(1))
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.executeRemove(plan);
      });
  }

  isRemoving(planId: number): boolean {
    return this.removingPlanId === planId;
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
    if (this.hasQuickFilters) {
      return 'No travel plans match your current search or date filters.';
    }

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

  private executeRemove(plan: TravelPlanSummary): void {
    this.removingPlanId = plan.id;

    this.travelPlanAdminService
      .removeFromAdminView(plan.id)
      .pipe(
        finalize(() => {
          this.removingPlanId = null;
        })
      )
      .subscribe({
        next: () => {
          this.plans = this.plans.filter((item) => item.id !== plan.id);
          this.transitToastService.success('Plan removed', `Plan #${plan.id} was removed from admin view.`);
        },
        error: (error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : 'Unable to remove this plan from admin view right now.';
          this.transitToastService.error('Remove failed', message);
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

  private matchesSearch(plan: TravelPlanSummary, keyword: string): boolean {
    if (!keyword) {
      return true;
    }

    const searchPool = [
      plan.ownerName,
      plan.destinationTitle,
      plan.destinationCountry,
      plan.origin,
      plan.transportType,
      this.statusLabel(plan.status),
      plan.petId ? `pet ${plan.petId}` : ''
    ]
      .map((value) => String(value ?? '').toLowerCase())
      .join(' ');

    return searchPool.includes(keyword);
  }

  private matchesDate(plan: TravelPlanSummary): boolean {
    if (!this.travelDateFilter) {
      return true;
    }

    return this.toDateOnly(plan.travelDate) === this.travelDateFilter;
  }

  private toDateOnly(value?: string): string {
    const parsed = Date.parse(String(value ?? ''));
    if (Number.isNaN(parsed)) {
      return '';
    }

    return new Date(parsed).toISOString().slice(0, 10);
  }

  private toTimestamp(value?: string): number {
    const parsed = Date.parse(String(value ?? ''));
    return Number.isNaN(parsed) ? 0 : parsed;
  }
}
