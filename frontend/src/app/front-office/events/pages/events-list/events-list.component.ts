// src/app/front-office/events/pages/events-list/events-list.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin, of } from 'rxjs';
import { debounceTime, takeUntil, finalize, catchError } from 'rxjs/operators';

import { EventService } from '../../services/event.service';
import { CategoryService } from '../../services/category.service';
import { RecommendationService } from '../../services/recommendation.service';
import { AuthService } from '../../../../auth/auth.service';

import {
  EventSummary,
  EventCategory,
  EventRecommendation,
  EventParticipantResponse,
  WaitlistResponse,
  STATUS_LABELS,
  STATUS_COLORS,
  SORT_OPTIONS,
} from '../../models/event.models';

export interface UserEventState {
  regStatus: 'CONFIRMED' | 'PENDING' | 'REJECTED' | null;
  waitlistStatus: 'WAITING' | 'NOTIFIED' | 'EXPIRED' | null;
  waitlistPosition: number | null;
}

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.css'],
})
export class EventsListComponent implements OnInit, OnDestroy {

  events: EventSummary[] = [];
  categories: EventCategory[] = [];

  recommendations: EventRecommendation[] = [];
  loadingRecommendations = true;
  showRecommendations = true;

  userStates: Map<number, UserEventState> = new Map();
  loadingStates = false;

  loading = true;
  totalElements = 0;
  totalPages = 1;
  currentPage = 0;
  pageSize = 12;

  keyword = '';
  categoryFilter: number | null = null;
  sortBy = 'startDate,asc';
  viewMode: 'grid' | 'list' = 'grid';

  toast: { msg: string; type: 'ok' | 'err' | 'info' | 'warn' } | null = null;
  private toastTimeout: any = null;

  readonly statusLabels = STATUS_LABELS;
  readonly statusColors = STATUS_COLORS;
  readonly sortOptions = SORT_OPTIONS;

  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private eventService: EventService,
    private categoryService: CategoryService,
    private recommendationService: RecommendationService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.getCurrentUserId();

    if (userId) {
      this.loadRecommendations(userId);
    } else {
      this.loadingRecommendations = false;
      this.showRecommendations = false;
    }

    this.categoryService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => (this.categories = categories),
        error: (err) => console.error('Error loading categories:', err),
      });

    this.search$.pipe(debounceTime(400), takeUntil(this.destroy$)).subscribe(() => {
      this.currentPage = 0;
      this.loadEvents();
    });

    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get isUser(): boolean {
    return this.auth.hasRole('USER');
  }

  private getCurrentUserId(): number | null {
    const user = this.auth.getCurrentUser?.();
    if (user?.id) return user.id;

    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.id || parsed.userId || null;
      }
    } catch {
      return null;
    }
    return null;
  }

  loadEvents(): void {
    this.loading = true;

    this.eventService
      .getAll({
        keyword: this.keyword,
        categoryId: this.categoryFilter,
        page: this.currentPage,
        size: this.pageSize,
        sort: this.sortBy,
      })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          this.events = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
          this.loadUserStatesForVisibleEvents();
        },
        error: (err) => console.error('Error loading events:', err),
      });
  }

  loadUserStatesForVisibleEvents(): void {
    const userId = this.getCurrentUserId();
    if (!userId || !this.isUser) return;

    this.loadingStates = true;

    const registrations$ = this.eventService
      .getMyRegistrations(userId, 0, 100)
      .pipe(catchError(() => of({ content: [] as EventParticipantResponse[], totalElements: 0 })));

    const waitlists$ = this.eventService
      .getMyWaitlistEntries(userId, 0, 100)
      .pipe(catchError(() => of({ content: [] as WaitlistResponse[], totalElements: 0 })));

    forkJoin([registrations$, waitlists$])
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.loadingStates = false))
      )
      .subscribe({
        next: ([regPage, waitPage]) => {
          const newMap = new Map<number, UserEventState>();

          for (const reg of regPage.content) {
            if (!reg.eventId) continue;
            const existing = newMap.get(reg.eventId) || {
              regStatus: null,
              waitlistStatus: null,
              waitlistPosition: null,
            };
            existing.regStatus = reg.status as any;
            newMap.set(reg.eventId, existing);
          }

          for (const wait of waitPage.content) {
            if (!wait.eventId) continue;
            const existing = newMap.get(wait.eventId) || {
              regStatus: null,
              waitlistStatus: null,
              waitlistPosition: null,
            };
            existing.waitlistStatus = wait.status as any;
            existing.waitlistPosition = wait.position ?? null;
            newMap.set(wait.eventId, existing);
          }

          this.userStates = newMap;
        },
      });
  }

  loadRecommendations(userId: number): void {
    this.loadingRecommendations = true;

    this.recommendationService
      .getPersonalizedRecommendations(userId, 6)
      .pipe(finalize(() => (this.loadingRecommendations = false)))
      .subscribe({
        next: (recs) => {
          this.recommendations = recs;
          this.showRecommendations = recs.length > 0;
        },
        error: () => {
          this.showRecommendations = false;
        },
      });
  }

  refreshRecommendations(): void {
    const userId = this.getCurrentUserId();
    if (userId) this.loadRecommendations(userId);
  }

  getUserState(eventId: number): UserEventState | null {
    return this.userStates.get(eventId) ?? null;
  }

  isConfirmed(event: EventSummary): boolean {
    return this.getUserState(event.id)?.regStatus === 'CONFIRMED';
  }

  isPending(event: EventSummary): boolean {
    return this.getUserState(event.id)?.regStatus === 'PENDING';
  }

  isOnWaitlist(event: EventSummary): boolean {
    const state = this.getUserState(event.id);
    return (
      !!state?.waitlistStatus &&
      (state.waitlistStatus === 'WAITING' || state.waitlistStatus === 'NOTIFIED')
    );
  }

  hasNotifiedOffer(event: EventSummary): boolean {
    return this.getUserState(event.id)?.waitlistStatus === 'NOTIFIED';
  }

  waitlistPosition(event: EventSummary): number | null {
    return this.getUserState(event.id)?.waitlistPosition ?? null;
  }

  cancelFromCard(event: EventSummary, $event: Event): void {
    $event.stopPropagation();
    const userId = this.getCurrentUserId();
    if (!userId) return;

    const state = this.getUserState(event.id);
    if (!state) return;

    const hasReg = state.regStatus === 'CONFIRMED' || state.regStatus === 'PENDING';
    const hasWait =
      state.waitlistStatus === 'WAITING' || state.waitlistStatus === 'NOTIFIED';

    if (!hasReg && !hasWait) return;

    if (!confirm('Cancel your participation?')) return;

    if (hasReg) {
      this.eventService.leaveEvent(event.id, userId).subscribe({
        next: () => {
          this.showToast('✅ Participation cancelled', 'ok');
          this.loadUserStatesForVisibleEvents();
          this.loadEvents();
        },
        error: (err) =>
          this.showToast(err.error?.message || 'Cancellation error', 'err'),
      });
    } else if (hasWait) {
      this.eventService.leaveWaitlist(event.id, userId).subscribe({
        next: () => {
          this.showToast('✅ Removed from waitlist', 'ok');
          this.loadUserStatesForVisibleEvents();
        },
        error: (err) =>
          this.showToast(err.error?.message || 'Waitlist removal error', 'err'),
      });
    }
  }

  onSearch(): void {
    this.search$.next(this.keyword);
  }

  onFilter(): void {
    this.currentPage = 0;
    this.loadEvents();
  }

  clearSearch(): void {
    this.keyword = '';
    this.onFilter();
  }

  resetFilters(): void {
    this.keyword = '';
    this.categoryFilter = null;
    this.sortBy = 'startDate,asc';
    this.currentPage = 0;
    this.loadEvents();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadEvents();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pageNumbers(): number[] {
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);
    if (end - start < maxVisible) start = Math.max(0, end - maxVisible);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }

  openDetail(id: number): void {
    this.router.navigateByUrl(`/app/events/${id}`);
  }

  fillPercentage(event: EventSummary): number {
    if (!event.maxParticipants) return 0;
    return Math.round(
      ((event.maxParticipants - event.remainingSlots) / event.maxParticipants) * 100
    );
  }

  daysLeft(dateString: string): number | null {
    const eventDate = new Date(dateString);
    eventDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return days < 0 ? null : days;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStars(rating: number): boolean[] {
    const rounded = Math.round(rating);
    return Array.from({ length: 5 }, (_, i) => i < rounded);
  }

  trackById(_: number, event: EventSummary): number {
    return event.id;
  }

  trackRecommendationById(_: number, rec: EventRecommendation): number {
    return rec.event.id;
  }

  getScoreClass(score: number): string {
    if (score >= 85) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-medium';
    return 'score-low';
  }

  isJoinable(event: EventSummary): boolean {
    if (!this.isUser) return false;
    const state = this.getUserState(event.id);
    const alreadyRegistered = state?.regStatus === 'CONFIRMED' || state?.regStatus === 'PENDING';
    const onWaitlist =
      state?.waitlistStatus === 'WAITING' || state?.waitlistStatus === 'NOTIFIED';
    return (
      event.status === 'PLANNED' &&
      event.remainingSlots > 0 &&
      !alreadyRegistered &&
      !onWaitlist
    );
  }

  isWaitlistable(event: EventSummary): boolean {
    if (!this.isUser) return false;
    const state = this.getUserState(event.id);
    const onWaitlist =
      state?.waitlistStatus === 'WAITING' || state?.waitlistStatus === 'NOTIFIED';
    return event.status === 'FULL' && !onWaitlist;
  }

  isCompetition(event: EventSummary): boolean {
    return !!event.category?.requiresApproval;
  }

  isCancelled(event: EventSummary): boolean {
    return event.status === 'CANCELLED';
  }

  private showToast(msg: string, type: 'ok' | 'err' | 'info' | 'warn'): void {
    this.toast = { msg, type };
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => (this.toast = null), 4000);
  }
}