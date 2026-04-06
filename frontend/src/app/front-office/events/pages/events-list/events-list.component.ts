// front-office/events/pages/list/events-list.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, finalize } from 'rxjs/operators';

import { EventService } from '../../services/event.service';
import {
  EventSummary,
  EventCategory,
  STATUS_LABELS,
  STATUS_COLORS,
} from '../../models/event.models';

type EventStatus = 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED' | 'FULL';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DatePipe, DecimalPipe],
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.css']
})
export class EventsListComponent implements OnInit, OnDestroy {

  // ── Data ────────────────────────────────────────────────────────────────
  events: EventSummary[] = [];
  categories: EventCategory[] = [];

  // ── État ────────────────────────────────────────────────────────────────
  loading = true;
  totalElements = 0;
  totalPages = 1;
  currentPage = 0;
  pageSize = 12;
  error = '';

  // ── Filtres ─────────────────────────────────────────────────────────────
  keyword = '';
  filterCategory: number | null = null;
  sortOption = 'startDate,asc';

  // ── Vue ─────────────────────────────────────────────────────────────────
  viewMode: 'grid' | 'list' = 'grid';

  // ── Calendrier ──────────────────────────────────────────────────────────
  showCalendarModal = false;
  calendarEvents: Record<string, EventSummary[]> = {};
  calendarLoading = false;
  selectedDateEvents: EventSummary[] = [];
  selectedDate: string | null = null;

  // ── Maps ────────────────────────────────────────────────────────────────
  readonly statusLabels = STATUS_LABELS;
  readonly statusColors = STATUS_COLORS;

  readonly sortOptions = [
    { value: 'startDate,asc', label: 'Date (closest)' },
    { value: 'startDate,desc', label: 'Date (farthest)' },
    { value: 'averageRating,desc', label: 'Best rated' },
    { value: 'remainingSlots,asc', label: 'Almost full' },
  ];

  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private eventService: EventService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.search$.pipe(debounceTime(350), takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 0;
        this.loadEvents();
      });
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Chargement ───────────────────────────────────────────────────────
  loadCategories(): void {
    this.eventService.getCategories().subscribe({
      next: (cats) => (this.categories = cats),
      error: () => {},
    });
  }

  loadEvents(): void {
    this.loading = true;
    this.error = '';
    this.eventService.getAllEvents({
      keyword: this.keyword,
      categoryId: this.filterCategory,
      page: this.currentPage,
      size: this.pageSize,
      sort: this.sortOption,
    }).pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (r) => {
          this.events = r.content;
          this.totalElements = r.totalElements;
          this.totalPages = r.totalPages;
        },
        error: (err) => {
          console.error('Error loading events:', err);
          this.error = 'Failed to load events. Please try again.';
        },
      });
  }

  // ─── Filtres ──────────────────────────────────────────────────────────
  onSearch(): void {
    this.search$.next(this.keyword);
  }
  
  onFilter(): void {
    this.currentPage = 0;
    this.loadEvents();
  }
  
  resetFilters(): void {
    this.keyword = '';
    this.filterCategory = null;
    this.sortOption = 'startDate,asc';
    this.currentPage = 0;
    this.loadEvents();
  }

  // ─── Pagination ───────────────────────────────────────────────────────
  goToPage(p: number): void {
    this.currentPage = p;
    this.loadEvents();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  get pageNumbers(): number[] {
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 5);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }

  // ─── Navigation ──────────────────────────────────────────────────────
  goToDetail(id: number): void {
    this.router.navigate(['/events', id]);
  }

  // ─── Calendrier ──────────────────────────────────────────────────────
  goToCalendar(): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    this.calendarLoading = true;
    this.showCalendarModal = true;
    
    this.eventService.getCalendar(year, month).subscribe({
      next: (calendar) => {
        this.calendarEvents = calendar;
        this.calendarLoading = false;
        console.log('Calendar loaded:', calendar);
      },
      error: (err) => {
        console.error('Error loading calendar:', err);
        this.calendarLoading = false;
      }
    });
  }

  closeCalendarModal(): void {
    this.showCalendarModal = false;
    this.selectedDate = null;
    this.selectedDateEvents = [];
  }

  onDateClick(dateKey: string, events: EventSummary[]): void {
    this.selectedDate = dateKey;
    this.selectedDateEvents = events;
  }

  // ─── Helpers UI ───────────────────────────────────────────────────────
  fillPct(e: EventSummary): number {
    if (!e.maxParticipants) return 0;
    return Math.round(((e.maxParticipants - e.remainingSlots) / e.maxParticipants) * 100);
  }

  isJoinable(e: EventSummary): boolean {
    return e.status === 'PLANNED' && e.remainingSlots > 0;
  }

  canWaitlist(e: EventSummary): boolean {
    return e.status === 'FULL';
  }

  isCompetition(e: EventSummary): boolean {
    return !!e.category?.requiresApproval;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  formatTime(d: string): string {
    return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  daysUntil(d: string): number | null {
    const diff = new Date(d).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
    const days = Math.ceil(diff / 86_400_000);
    return days < 0 ? null : days;
  }

  starsArray(r: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(r));
  }

  trackById(_: number, item: EventSummary): number {
    return item.id;
  }
  // Ajoute cette méthode
trackByCategoryId(_: number, cat: EventCategory): number {
  return cat.id;
}
}