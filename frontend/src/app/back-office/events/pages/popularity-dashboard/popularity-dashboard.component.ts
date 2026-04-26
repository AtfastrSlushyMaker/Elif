// ══════════════════════════════════════════════════════════════════════
// popularity-dashboard.component.ts  — VERSION CORRIGÉE
//
// BUGS CORRIGÉS :
//
// BUG 1 : loading = true après subscribe → finalize pas appliqué
//   FIX : finalize() sur le stream principal
//
// BUG 2 : maxScore = 0 si topEvents est vide → division par zéro
//   FIX : Math.max(..., 1) systématique
//
// BUG 3 : getBreakdownItems() appelé à chaque cycle change detection
//   FIX : mémoïsation dans ngOnInit + ngOnChanges
//
// BUG 4 : selectedDetail reste visible si on change de période
//   FIX : closeDetail() au changePeriod
// ══════════════════════════════════════════════════════════════════════

import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe, SlicePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AdminAuthService } from '../../services/admin-api.service';

// ── Types ──────────────────────────────────────────────────────────
interface PopularEventDTO {
  eventId: number; title: string; categoryName: string; categoryIcon: string;
  startDate: string; location: string; popularityScore: number;
  uniqueViews: number; totalInteractions: number; conversionRate: number;
  remainingSlots: number;
}

interface EventPopularityDetailDTO {
  eventId: number; title: string; totalViews: number; uniqueViews: number;
  searchClicks: number; detailOpens: number; waitlistJoins: number;
  registrations: number; reviewsPosted: number; conversionRate: number;
  popularityScore: number; trend: string;
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

interface BreakdownItem {
  icon: string; label: string; weight: number;
  color: string; count: number;
}

const API_BASE = 'http://localhost:8087/elif/api';

@Component({
  selector: 'app-popularity-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe, DatePipe, SlicePipe, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './popularity-dashboard.component.html',
  styleUrls: ['./popularity-dashboard.component.css']
})
export class PopularityDashboardComponent implements OnInit, OnDestroy {

  dashboard:      PopularityDashboardDTO | null = null;
  topEvents:      PopularEventDTO[] = [];
  selectedDetail: EventPopularityDetailDTO | null = null;
  breakdownItems: BreakdownItem[] = [];   // BUG 3 FIX : calculé une fois

  // États de chargement granulaires
  loading        = true;
  loadingTop     = false;
  loadingDetail  = false;
  errorDashboard = '';
  errorDetail    = '';

  selectedDays   = 30;
  private maxScore = 1;  // BUG 2 FIX : jamais 0

  private destroy$ = new Subject<void>();

  readonly formulaItems = [
    { icon: '👁️', label: 'View',           weight: 1,  color: '#6366f1' },
    { icon: '🔍', label: 'Search click',    weight: 3,  color: '#0ea5e9' },
    { icon: '📄', label: 'Detail open',     weight: 5,  color: '#8b5cf6' },
    { icon: '⏳', label: 'Waitlist join',   weight: 10, color: '#f59e0b' },
    { icon: '⭐', label: 'Review posted',   weight: 15, color: '#f97316' },
    { icon: '✅', label: 'Registration',    weight: 20, color: '#1d9e75' },
  ];

  constructor(
    private http: HttpClient,
    private auth: AdminAuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Dashboard ────────────────────────────────────────────────────

  loadDashboard(): void {
    this.loading       = true;
    this.errorDashboard = '';
    const adminId = this.auth.getAdminId();

    this.http
      .get<PopularityDashboardDTO>(
        `${API_BASE}/events/admin/popularity/dashboard`,
        { params: new HttpParams().set('adminId', adminId.toString()) }
      )
      .pipe(
        takeUntil(this.destroy$),
        // BUG 1 FIX : finalize positionné correctement
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (data) => {
          this.dashboard   = data;
          this.topEvents   = data.topEvents ?? [];
          // BUG 2 FIX : Math.max(..., 1) pour éviter division par zéro
          this.maxScore    = Math.max(...this.topEvents.map(e => e.popularityScore), 1);
          // BUG 3 FIX : calculer breakdownItems une seule fois
          this.breakdownItems = this.computeBreakdownItems(data.interactionsByType ?? {});
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('[PopularityDashboard] Error:', err);
          this.errorDashboard = err?.error?.message ?? 'Failed to load dashboard. Check admin rights.';
          this.cdr.markForCheck();
        }
      });
  }

  // ─── Changer période ──────────────────────────────────────────────

  changePeriod(days: number): void {
    if (this.loadingTop) return;
    this.selectedDays  = days;
    this.loadingTop    = true;
    this.selectedDetail = null; // BUG 4 FIX
    const adminId = this.auth.getAdminId();

    this.http
      .get<PopularEventDTO[]>(
        `${API_BASE}/events/popular`,
        { params: new HttpParams().set('limit', '10').set('days', days.toString()) }
      )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.loadingTop = false; this.cdr.markForCheck(); })
      )
      .subscribe({
        next: (events) => {
          this.topEvents = events ?? [];
          this.maxScore  = Math.max(...this.topEvents.map(e => e.popularityScore), 1);
          this.cdr.markForCheck();
        },
        error: (err) => console.error('[PopularityDashboard] Period error:', err)
      });
  }

  // ─── Détail d'un event ────────────────────────────────────────────

  openEventDetail(eventId: number): void {
    // Toggle : si déjà ouvert → fermer
    if (this.selectedDetail?.eventId === eventId) {
      this.selectedDetail = null;
      this.cdr.markForCheck();
      return;
    }

    this.selectedDetail = null;
    this.loadingDetail  = true;
    this.errorDetail    = '';
    const adminId = this.auth.getAdminId();

    this.http
      .get<EventPopularityDetailDTO>(
        `${API_BASE}/events/${eventId}/popularity`,
        { params: new HttpParams().set('adminId', adminId.toString()) }
      )
      .pipe(finalize(() => { this.loadingDetail = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (d) => { this.selectedDetail = d; this.cdr.markForCheck(); },
        error: (err) => {
          this.errorDetail = 'Failed to load event details.';
          console.error('[PopularityDashboard] Detail error:', err);
          this.cdr.markForCheck();
        }
      });
  }

  closeDetail(): void {
    this.selectedDetail = null;
    this.cdr.markForCheck();
  }

  // ─── Helpers template ─────────────────────────────────────────────

  // BUG 3 FIX : pré-calculé, pas appelé à chaque cycle
  private computeBreakdownItems(types: Record<string, number>): BreakdownItem[] {
    return [
      { icon: '👁️', label: 'Views',          weight: 1,  color: '#6366f1', count: types['VIEW']          || 0 },
      { icon: '🔍', label: 'Search clicks',   weight: 3,  color: '#0ea5e9', count: types['SEARCH_CLICK']  || 0 },
      { icon: '📄', label: 'Detail opens',    weight: 5,  color: '#8b5cf6', count: types['DETAIL_OPEN']   || 0 },
      { icon: '⏳', label: 'Waitlist joins',  weight: 10, color: '#f59e0b', count: types['WAITLIST_JOIN'] || 0 },
      { icon: '⭐', label: 'Reviews posted',  weight: 15, color: '#f97316', count: types['REVIEW_POSTED'] || 0 },
      { icon: '✅', label: 'Registrations',   weight: 20, color: '#1d9e75', count: types['REGISTRATION']  || 0 },
    ];
  }

  getBarWidth(count: number): number {
    const max = Math.max(...this.breakdownItems.map(i => i.count), 1);
    return Math.round((count / max) * 100);
  }

  getScoreBarWidth(score: number): number {
    return Math.round((score / this.maxScore) * 100);  // BUG 2 FIX : maxScore >= 1
  }

  getDetailBarWidth(val: number, d: EventPopularityDetailDTO): number {
    const max = Math.max(
      d.totalViews, d.searchClicks, d.detailOpens,
      d.waitlistJoins, d.registrations, d.reviewsPosted, 1
    );
    return Math.round((val / max) * 100);
  }

  getRankClass(i: number): string {
    if (i === 0) return 'pd-rank--gold';
    if (i === 1) return 'pd-rank--silver';
    if (i === 2) return 'pd-rank--bronze';
    return 'pd-rank--default';
  }

  getTrendIcon(trend: string): string {
    return trend === 'RISING' ? '📈' : trend === 'DECLINING' ? '📉' : '➡️';
  }

  getTrendClass(trend: string): string {
    return trend === 'RISING' ? 'trend--rising'
         : trend === 'DECLINING' ? 'trend--declining'
         : 'trend--stable';
  }

  trackEvent(_: number, e: PopularEventDTO): number { return e.eventId; }
}
