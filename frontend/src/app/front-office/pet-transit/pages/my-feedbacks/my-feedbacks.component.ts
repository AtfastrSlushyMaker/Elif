import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';

import {
  FeedbackType,
  FEEDBACK_TYPE_CONFIG,
  ProcessingStatus,
  PROCESSING_STATUS_CONFIG,
  TravelFeedback,
  URGENCY_LEVEL_CONFIG
} from '../../models/travel-feedback.model';
import { TravelFeedbackService } from '../../services/travel-feedback.service';
import { PetTransitToastService } from '../../services/pet-transit-toast.service';

type FeedbackFilter = 'ALL' | FeedbackType;

@Component({
  selector: 'app-my-feedbacks',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './my-feedbacks.component.html',
  styleUrl: './my-feedbacks.component.scss'
})
export class MyFeedbacksComponent implements OnInit, OnDestroy {
  feedbacks: TravelFeedback[] = [];
  loading = true;
  errorMessage = '';

  activeFilter: FeedbackFilter = 'ALL';
  expandedAdminResponse = new Set<number>();
  pendingDeleteId: number | null = null;
  pendingDeletePlanId: number | null = null;
  deleting = false;

  readonly filterOptions: { value: FeedbackFilter; label: string }[] = [
    { value: 'ALL', label: 'All' },
    { value: 'REVIEW', label: 'Reviews' },
    { value: 'SUGGESTION', label: 'Suggestions' },
    { value: 'INCIDENT', label: 'Incidents' },
    { value: 'COMPLAINT', label: 'Complaints' }
  ];

  readonly typeConfig = FEEDBACK_TYPE_CONFIG;
  readonly statusConfig = PROCESSING_STATUS_CONFIG;
  readonly urgencyConfig = URGENCY_LEVEL_CONFIG;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly feedbackService: TravelFeedbackService,
    private readonly toast: PetTransitToastService,
    readonly router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get filteredFeedbacks(): TravelFeedback[] {
    if (this.activeFilter === 'ALL') return this.feedbacks;
    return this.feedbacks.filter((f) => f.feedbackType === this.activeFilter);
  }

  get totalCount(): number {
    return this.feedbacks.length;
  }

  get reviewCount(): number {
    return this.feedbacks.filter((f) => f.feedbackType === 'REVIEW').length;
  }

  get complaintsIncidentsCount(): number {
    return this.feedbacks.filter(
      (f) => f.feedbackType === 'COMPLAINT' || f.feedbackType === 'INCIDENT'
    ).length;
  }

  get pendingResponseCount(): number {
    return this.feedbacks.filter(
      (f) => f.processingStatus === 'PENDING' || f.processingStatus === 'IN_PROGRESS'
    ).length;
  }

  setFilter(filter: FeedbackFilter): void {
    this.activeFilter = filter;
  }

  isFilterActive(filter: FeedbackFilter): boolean {
    return this.activeFilter === filter;
  }

  toggleAdminResponse(id: number): void {
    if (this.expandedAdminResponse.has(id)) {
      this.expandedAdminResponse.delete(id);
    } else {
      this.expandedAdminResponse.add(id);
    }
  }

  isAdminResponseExpanded(id: number): boolean {
    return this.expandedAdminResponse.has(id);
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
    if (this.pendingDeleteId === null || this.pendingDeletePlanId === null) return;

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
          this.feedbacks = this.feedbacks.filter((f) => f.id !== feedbackId);
          this.toast.success('Feedback deleted.');
        },
        error: (err: Error) => {
          this.toast.error(err.message || 'Failed to delete feedback.');
        }
      });
  }

  showUrgency(fb: TravelFeedback): boolean {
    return fb.feedbackType === 'INCIDENT' || fb.feedbackType === 'COMPLAINT';
  }

  starsArray(rating: number): number[] {
    const r = Math.round(Math.max(0, Math.min(5, rating)));
    return Array.from({ length: r }, (_, i) => i);
  }

  emptyStarsArray(rating: number): number[] {
    const r = Math.round(Math.max(0, Math.min(5, rating)));
    return Array.from({ length: 5 - r }, (_, i) => i);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  trackByFeedback(_: number, fb: TravelFeedback): number {
    return fb.id;
  }

  goToMyTrips(): void {
    this.router.navigate(['/app/transit/plans/my']);
  }

  private load(): void {
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
        error: (err: Error) => {
          this.errorMessage = err.message || 'Unable to load your feedbacks.';
          this.toast.error(this.errorMessage);
        }
      });
  }

  getStatusClass(status: ProcessingStatus): string {
    const map: Record<ProcessingStatus, string> = {
      PENDING: 'status-pending',
      IN_PROGRESS: 'status-in-progress',
      RESOLVED: 'status-resolved',
      CLOSED: 'status-closed'
    };
    return map[status] ?? '';
  }
}
