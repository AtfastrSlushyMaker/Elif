import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe, SlicePipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AdminAuthService } from '../../services/admin-api.service';

// ─── Interfaces (complètes pour le HTML) ─────────────────────────
interface PopularEventDTO {
  eventId: number;
  title: string;
  categoryName: string;
  categoryIcon: string;
  startDate: string;
  location: string;
  popularityScore: number;
  uniqueViews: number;
  totalInteractions: number;
  conversionRate: number;
  remainingSlots: number;
}

interface EventPopularityDetailDTO {
  eventId: number;
  title: string;
  totalViews: number;
  uniqueViews: number;
  searchClicks: number;
  detailOpens: number;
  waitlistJoins: number;
  registrations: number;
  reviewsPosted: number;
  conversionRate: number;
  popularityScore: number;
  trend: string;
}

interface PopularityDashboardDTO {
  topEvents: PopularEventDTO[];
  neglectedEvents: PopularEventDTO[];
  interactionsByType: Record<string, number>;
  totalViewsToday: number;
  totalInteractionsThisWeek: number;
  averageConversionRate: number;
  period: { from: string; to: string; label: string };
}

const API_BASE = 'http://localhost:8087/elif/api';

@Component({
  selector: 'app-popularity-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe, DatePipe, SlicePipe],
  templateUrl: './popularity-dashboard.component.html',
  styleUrls: ['./popularity-dashboard.component.css']
})
export class PopularityDashboardComponent implements OnInit, OnDestroy {

  dashboard: PopularityDashboardDTO | null = null;
  topEvents: PopularEventDTO[] = [];
  selectedDetail: EventPopularityDetailDTO | null = null;

  loading = true;
  loadingTop = false;
  loadingDetail = false;
  selectedDays = 30;

  private maxScore = 0;
  private destroy$ = new Subject<void>();

  readonly formulaItems = [
    { icon: '👁️', label: 'View', desc: 'Page seen in the list', weight: 1, color: '#6366f1' },
    { icon: '🔍', label: 'Search click', desc: 'Clicked from search results', weight: 3, color: '#0ea5e9' },
    { icon: '📄', label: 'Detail open', desc: 'Opened the event detail page', weight: 5, color: '#8b5cf6' },
    { icon: '⏳', label: 'Waitlist join', desc: 'Joined the waitlist', weight: 10, color: '#f59e0b' },
    { icon: '⭐', label: 'Review posted', desc: 'Left a review after attending', weight: 15, color: '#f97316' },
    { icon: '✅', label: 'Registration', desc: 'Confirmed registration', weight: 20, color: '#1d9e75' },
  ];

  constructor(
    private http: HttpClient,
    private auth: AdminAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard(): void {
    this.loading = true;
    const adminId = this.auth.getAdminId();

    this.http
      .get<PopularityDashboardDTO>(
        `${API_BASE}/events/admin/popularity/dashboard`,
        { params: new HttpParams().set('adminId', adminId.toString()) }
      )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (data) => {
          this.dashboard = data;
          this.topEvents = data.topEvents;
          this.maxScore = Math.max(...data.topEvents.map(e => e.popularityScore), 1);
        },
        error: (err) => {
          console.error('Dashboard error:', err);
          this.loading = false;
        }
      });
  }

  changePeriod(days: number): void {
    this.selectedDays = days;
    this.loadingTop = true;
    const adminId = this.auth.getAdminId();

    this.http
      .get<PopularEventDTO[]>(
        `${API_BASE}/events/popular`,
        { params: new HttpParams()
            .set('limit', '10')
            .set('days', days.toString())
            .set('adminId', adminId.toString()) }
      )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingTop = false)
      )
      .subscribe({
        next: (events) => {
          this.topEvents = events;
          this.maxScore = Math.max(...events.map(e => e.popularityScore), 1);
        },
        error: (err) => console.error('Top events error:', err)
      });
  }

  openEventDetail(eventId: number): void {
    this.selectedDetail = null;
    this.loadingDetail = true;
    const adminId = this.auth.getAdminId();

    this.http
      .get<EventPopularityDetailDTO>(
        `${API_BASE}/events/${eventId}/popularity`,
        { params: new HttpParams().set('adminId', adminId.toString()) }
      )
      .pipe(finalize(() => this.loadingDetail = false))
      .subscribe({
        next: (d) => this.selectedDetail = d,
        error: (err) => console.error('Detail error:', err)
      });
  }

  closeDetail(): void {
    this.selectedDetail = null;
  }

  getBreakdownItems() {
    if (!this.dashboard) return [];
    const types = this.dashboard.interactionsByType;
    return [
      { icon: '👁️', label: 'Views', weight: 1, color: '#6366f1', count: types['VIEW'] || 0 },
      { icon: '🔍', label: 'Search clicks', weight: 3, color: '#0ea5e9', count: types['SEARCH_CLICK'] || 0 },
      { icon: '📄', label: 'Detail opens', weight: 5, color: '#8b5cf6', count: types['DETAIL_OPEN'] || 0 },
      { icon: '⏳', label: 'Waitlist joins', weight: 10, color: '#f59e0b', count: types['WAITLIST_JOIN'] || 0 },
      { icon: '⭐', label: 'Reviews posted', weight: 15, color: '#f97316', count: types['REVIEW_POSTED'] || 0 },
      { icon: '✅', label: 'Registrations', weight: 20, color: '#1d9e75', count: types['REGISTRATION'] || 0 },
    ];
  }

  getBarWidth(count: number): number {
    const items = this.getBreakdownItems();
    const max = Math.max(...items.map(i => i.count), 1);
    return Math.round((count / max) * 100);
  }

  getScoreBarWidth(score: number): number {
    return Math.round((score / this.maxScore) * 100);
  }

  getDetailBarWidth(val: number, detail: EventPopularityDetailDTO): number {
    const max = Math.max(
      detail.totalViews, detail.searchClicks, detail.detailOpens,
      detail.waitlistJoins, detail.registrations, detail.reviewsPosted, 1
    );
    return Math.round((val / max) * 100);
  }

  getRankClass(index: number): string {
    if (index === 0) return 'pd-rank--gold';
    if (index === 1) return 'pd-rank--silver';
    if (index === 2) return 'pd-rank--bronze';
    return 'pd-rank--default';
  }
}