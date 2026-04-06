// back-office/events/components/events.component/events.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, finalize } from 'rxjs/operators';

import {
  AdminEventService,
  AdminCategoryService,
  AdminCapacityService,
  AdminExportService,
  AdminAuthService,
  AdminParticipantService,
  AdminWaitlistService,
  AdminWeatherService,
  AdminReviewService,
  AdminReminderService
} from '../../services/admin-api.service';

import type {
  EventSummary,
  EventCategory,
  EventCapacityResponse,
  EventParticipantResponse,
  WaitlistResponse,
  EventReviewResponse,
  WeatherResponse,
  EventStatsResponse,
  PageResponse,
  SortField,
  SortDirection,
  SortState,
  ToastMessage,
  ConfirmAction
} from '../../models/admin-events.models';

// ─── Types locaux ─────────────────────────────────────────────────────────────
type ActiveModal = 'capacity' | 'participants' | 'waitlist' | 'reviews' | 'weather' | 'reminders' | null;

@Component({
  selector:    'app-back-office-events',
  templateUrl: './events.component.html',
  styleUrls:   ['./events.component.css']
})
export class EventsComponent implements OnInit, OnDestroy {

  // ── Data ──────────────────────────────────────────────────────────────────
  events:       EventSummary[]              = [];
  categories:   EventCategory[]             = [];
  stats:        EventStatsResponse | null   = null;

  // ── État ──────────────────────────────────────────────────────────────────
  loading       = true;
  exporting     = false;
  statsLoading  = true;

  // ── Filtres ───────────────────────────────────────────────────────────────
  keyword         = '';
  filterStatus    = '';
  filterCategory  = '';
  filterDateFrom  = '';
  filterDateTo    = '';
  currentPage     = 0;
  pageSize        = 12;
  totalPages      = 1;
  totalElements   = 0;

  // ── Tri ───────────────────────────────────────────────────────────────────
  sort: SortState = { field: 'startDate', direction: 'asc' };

  // ── Modals ────────────────────────────────────────────────────────────────
  activeModal:      ActiveModal              = null;
  selectedEvent:    EventSummary | null      = null;

  capacityData:     EventCapacityResponse | null         = null;
  participants:     EventParticipantResponse[]            = [];
  pendingList:      EventParticipantResponse[]            = [];
  waitlist:         WaitlistResponse[]                    = [];
  reviews:          EventReviewResponse[]                 = [];
  weather:          WeatherResponse | null                = null;

  modalLoading      = false;
  activeParticipantTab: 'confirmed' | 'pending' = 'confirmed';

  // ── Confirm ───────────────────────────────────────────────────────────────
  confirmAction: ConfirmAction | null = null;

  // ── Toasts ────────────────────────────────────────────────────────────────
  toasts: ToastMessage[] = [];
  private toastId = 0;

  // ── Labels ────────────────────────────────────────────────────────────────
  readonly statusLabels: Record<string, string> = {
    PLANNED:   'Planifié',
    ONGOING:   'En cours',
    COMPLETED: 'Terminé',
    CANCELLED: 'Annulé',
    FULL:      'Complet'
  };

  readonly statusIcons: Record<string, string> = {
    PLANNED:   '📅',
    ONGOING:   '🟢',
    COMPLETED: '✅',
    CANCELLED: '🚫',
    FULL:      '🔴'
  };

  readonly weatherIcons: Record<string, string> = {
    SUNNY:   '☀️',
    CLOUDY:  '⛅',
    RAINY:   '🌧️',
    STORMY:  '⛈️',
    SNOWY:   '❄️',
    UNKNOWN: '🌤️'
  };

  readonly reminderLabels: Record<string, string> = {
    J2:  '2 jours avant',
    H24: '24h avant',
    H2:  '2h avant'
  };

  private search$  = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private eventService:       AdminEventService,
    private categoryService:    AdminCategoryService,
    private capacityService:    AdminCapacityService,
    private exportService:      AdminExportService,
    private participantService: AdminParticipantService,
    private waitlistService:    AdminWaitlistService,
    private weatherService:     AdminWeatherService,
    private reviewService:      AdminReviewService,
    private reminderService:    AdminReminderService,
    private auth:               AdminAuthService,
    private cdr:                ChangeDetectorRef
  ) {}

  // ─── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadCategories();
    this.loadStats();
    this.setupSearch();
    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Init helpers ───────────────────────────────────────────────────────
  private loadCategories(): void {
    this.categoryService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next:  (cats) => this.categories = cats,
      error: ()     => this.toast('Impossible de charger les catégories', 'warning')
    });
  }

  private loadStats(): void {
    this.statsLoading = true;
    this.eventService.getStats(this.auth.getAdminId())
      .pipe(takeUntil(this.destroy$), finalize(() => this.statsLoading = false))
      .subscribe({
        next:  (s) => this.stats = s,
        error: ()  => {} // stats non bloquantes
      });
  }

  private setupSearch(): void {
    this.search$.pipe(debounceTime(350), takeUntil(this.destroy$))
      .subscribe(() => { this.currentPage = 0; this.loadEvents(); });
  }

  // ─── Chargement principal ───────────────────────────────────────────────
  loadEvents(): void {
    this.loading = true;
    const params: Record<string, any> = {
      page: this.currentPage,
      size: this.pageSize,
      sort: `${this.sort.field},${this.sort.direction}`
    };
    if (this.filterStatus)   params['status']     = this.filterStatus;
    if (this.filterCategory) params['categoryId'] = +this.filterCategory;
    if (this.keyword.trim()) params['keyword']    = this.keyword.trim();
    if (this.filterDateFrom) params['dateFrom']   = this.filterDateFrom;
    if (this.filterDateTo)   params['dateTo']     = this.filterDateTo;

    this.eventService.getAll(params)
      .pipe(takeUntil(this.destroy$), finalize(() => this.loading = false))
      .subscribe({
        next:  (r) => {
          this.events        = r.content;
          this.totalPages    = r.totalPages;
          this.totalElements = r.totalElements;
        },
        error: () => this.toast('Erreur lors du chargement des événements', 'error')
      });
  }

  // ─── Filtres & Tri ──────────────────────────────────────────────────────
  onSearch(): void { this.search$.next(this.keyword); }

  onFilter(): void { this.currentPage = 0; this.loadEvents(); }

  resetFilters(): void {
    this.keyword = '';
    this.filterStatus = '';
    this.filterCategory = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.currentPage = 0;
    this.loadEvents();
  }

  toggleSort(field: SortField): void {
    if (this.sort.field === field) {
      this.sort = { field, direction: this.sort.direction === 'asc' ? 'desc' : 'asc' };
    } else {
      this.sort = { field, direction: 'asc' };
    }
    this.currentPage = 0;
    this.loadEvents();
  }

  sortIcon(field: SortField): string {
    if (this.sort.field !== field) return '⇅';
    return this.sort.direction === 'asc' ? '↑' : '↓';
  }

  // ─── Pagination ─────────────────────────────────────────────────────────
  goToPage(p: number): void {
    this.currentPage = p;
    this.loadEvents();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  previousPage(): void { if (this.currentPage > 0) this.goToPage(this.currentPage - 1); }
  nextPage():     void { if (this.currentPage + 1 < this.totalPages) this.goToPage(this.currentPage + 1); }

  get pageNumbers(): number[] {
    const start = Math.max(0, this.currentPage - 2);
    const end   = Math.min(this.totalPages, start + 5);
    return Array.from({ length: end - start }, (_, i) => start + i);
  }

  // ─── Calculs UI ─────────────────────────────────────────────────────────
  fillPct(e: EventSummary): number {
    if (!e.maxParticipants) return 0;
    return Math.round(((e.maxParticipants - e.remainingSlots) / e.maxParticipants) * 100);
  }

  fillClass(pct: number): string {
    if (pct >= 100) return 'fill-full';
    if (pct >= 75)  return 'fill-warn';
    return 'fill-ok';
  }

  getDaysRemaining(e: EventSummary): number | null {
    const diff = new Date(e.startDate).setHours(0,0,0,0) - new Date().setHours(0,0,0,0);
    const days = Math.ceil(diff / 86_400_000);
    return days < 0 ? null : days;
  }

  getDaysLabel(e: EventSummary): string {
    const d = this.getDaysRemaining(e);
    if (d === null) return '✅ Passé';
    if (d === 0)    return '🔥 Aujourd\'hui';
    if (d === 1)    return '⭐ Demain';
    return `📆 J-${d}`;
  }

  getDaysClass(e: EventSummary): string {
    const d = this.getDaysRemaining(e);
    if (d === null) return 'days-past';
    if (d === 0)    return 'days-today';
    if (d <= 3)     return 'days-soon';
    return 'days-normal';
  }

  formatDate(d: string | Date): string {
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatTime(d: string | Date): string {
    return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  formatDateTime(d: string | Date): string {
    return `${this.formatDate(d)} à ${this.formatTime(d)}`;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      PLANNED:   'pill--planned',
      ONGOING:   'pill--ongoing',
      COMPLETED: 'pill--completed',
      CANCELLED: 'pill--cancelled',
      FULL:      'pill--full'
    };
    return map[status] ?? 'pill--planned';
  }

  // ─── Modal Capacité ─────────────────────────────────────────────────────
  openCapacityModal(e: EventSummary): void {
    this.selectedEvent = e;
    this.activeModal   = 'capacity';
    this.modalLoading  = true;
    this.capacityData  = null;

    this.capacityService.getSnapshot(e.id)
      .pipe(finalize(() => this.modalLoading = false))
      .subscribe({
        next:  (c) => this.capacityData = c,
        error: ()  => { this.toast('Impossible de charger la capacité', 'error'); this.closeModal(); }
      });
  }

  recalculateCapacity(): void {
    if (!this.capacityData) return;
    this.modalLoading = true;
    this.capacityService.recalculate(this.capacityData.eventId, this.auth.getAdminId())
      .pipe(finalize(() => this.modalLoading = false))
      .subscribe({
        next:  (c) => { this.capacityData = c; this.loadEvents(); this.toast('Capacité recalculée', 'success'); },
        error: ()  => this.toast('Échec du recalcul', 'error')
      });
  }

  // ─── Modal Participants ─────────────────────────────────────────────────
  openParticipantsModal(e: EventSummary): void {
    this.selectedEvent = e;
    this.activeModal   = 'participants';
    this.activeParticipantTab = 'confirmed';
    this.loadParticipants(e.id);
  }

  private loadParticipants(eventId: number): void {
    this.modalLoading = true;
    this.participants = [];
    this.pendingList  = [];

    this.participantService.getConfirmed(eventId, this.auth.getAdminId())
      .subscribe({ next: (r) => this.participants = r.content, error: () => {} });

    this.participantService.getPending(eventId, this.auth.getAdminId())
      .pipe(finalize(() => this.modalLoading = false))
      .subscribe({ next: (r) => this.pendingList = r.content, error: () => {} });
  }

  approveParticipant(p: EventParticipantResponse): void {
    this.participantService.approve(p.id, this.auth.getAdminId()).subscribe({
      next: () => {
        this.toast(`${p.userName} approuvé(e)`, 'success');
        if (this.selectedEvent) this.loadParticipants(this.selectedEvent.id);
        this.loadEvents();
      },
      error: () => this.toast('Approbation échouée', 'error')
    });
  }

  rejectParticipant(p: EventParticipantResponse): void {
    this.participantService.reject(p.id, this.auth.getAdminId()).subscribe({
      next: () => {
        this.toast(`${p.userName} rejeté(e)`, 'info');
        if (this.selectedEvent) this.loadParticipants(this.selectedEvent.id);
      },
      error: () => this.toast('Rejet échoué', 'error')
    });
  }

  // ─── Modal Liste d'attente ──────────────────────────────────────────────
  openWaitlistModal(e: EventSummary): void {
    this.selectedEvent = e;
    this.activeModal   = 'waitlist';
    this.modalLoading  = true;
    this.waitlist      = [];

    this.waitlistService.getWaitlist(e.id, this.auth.getAdminId())
      .pipe(finalize(() => this.modalLoading = false))
      .subscribe({
        next:  (r) => this.waitlist = r.content,
        error: ()  => this.toast('Impossible de charger la liste d\'attente', 'error')
      });
  }

  promoteNext(): void {
    if (!this.selectedEvent) return;
    this.waitlistService.promoteNext(this.selectedEvent.id).subscribe({
      next:  (r) => {
        const msg = r.promoted ? '🎉 Promotion effectuée' : 'Aucune promotion possible';
        this.toast(msg, r.promoted ? 'success' : 'info');
        if (this.selectedEvent) this.openWaitlistModal(this.selectedEvent);
        this.loadEvents();
      },
      error: () => this.toast('Promotion échouée', 'error')
    });
  }

  // ─── Modal Météo ────────────────────────────────────────────────────────
  openWeatherModal(e: EventSummary): void {
    this.selectedEvent = e;
    this.activeModal   = 'weather';
    this.modalLoading  = true;
    this.weather       = null;

    this.weatherService.getForEvent(e.id)
      .pipe(finalize(() => this.modalLoading = false))
      .subscribe({
        next:  (w) => this.weather = w,
        error: ()  => this.toast('Météo indisponible', 'warning')
      });
  }

  // ─── Modal Avis ─────────────────────────────────────────────────────────
  openReviewsModal(e: EventSummary): void {
    this.selectedEvent = e;
    this.activeModal   = 'reviews';
    this.modalLoading  = true;
    this.reviews       = [];

    this.reviewService.getReviews(e.id)
      .pipe(finalize(() => this.modalLoading = false))
      .subscribe({
        next:  (r) => this.reviews = r.content,
        error: ()  => this.toast('Impossible de charger les avis', 'error')
      });
  }

  deleteReview(r: EventReviewResponse): void {
    this.reviewService.deleteReview(r.id, this.auth.getAdminId()).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(x => x.id !== r.id);
        this.toast('Avis supprimé', 'success');
      },
      error: () => this.toast('Suppression échouée', 'error')
    });
  }

  starsArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  // ─── Modal Rappels ──────────────────────────────────────────────────────
  openRemindersModal(e: EventSummary): void {
    this.selectedEvent = e;
    this.activeModal   = 'reminders';
  }

  cancelAllReminders(): void {
    if (!this.selectedEvent) return;
    this.reminderService.cancelAll(this.selectedEvent.id).subscribe({
      next:  () => { this.toast('Tous les rappels annulés', 'success'); this.closeModal(); },
      error: () => this.toast('Annulation échouée', 'error')
    });
  }

  // ─── Fermer modal ───────────────────────────────────────────────────────
  closeModal(): void {
    this.activeModal  = null;
    this.selectedEvent = null;
    this.capacityData  = null;
    this.participants  = [];
    this.pendingList   = [];
    this.waitlist      = [];
    this.reviews       = [];
    this.weather       = null;
  }

  // ─── Export ─────────────────────────────────────────────────────────────
  exportAll(): void {
    this.exporting = true;
    this.exportService.exportAllEvents(this.auth.getAdminId())
      .pipe(finalize(() => this.exporting = false))
      .subscribe({
        next:  (b) => { this.exportService.downloadBlob(b, `events_${this.today()}.csv`); this.toast('CSV exporté', 'success'); },
        error: ()  => this.toast('Export échoué', 'error')
      });
  }

  exportParticipants(e: EventSummary): void {
    const safe = e.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    this.exportService.exportParticipants(e.id, this.auth.getAdminId()).subscribe({
      next:  (b) => { this.exportService.downloadBlob(b, `participants_${safe}_${this.today()}.csv`); this.toast('Participants exportés', 'success'); },
      error: ()  => this.toast('Export échoué', 'error')
    });
  }

  // ─── Confirm dialog ─────────────────────────────────────────────────────
  confirmCancel(e: EventSummary): void {
    this.confirmAction = {
      title:   'Annuler l\'événement',
      message: `Voulez-vous vraiment annuler "${e.title}" ? Tous les participants seront notifiés.`,
      label:   'Oui, annuler',
      variant: 'warning',
      fn: () => {
        this.eventService.cancel(e.id, this.auth.getAdminId()).subscribe({
          next:  () => { this.loadEvents(); this.toast('Événement annulé', 'success'); },
          error: (err) => this.toast(err?.error?.message ?? 'Annulation échouée', 'error')
        });
      }
    };
  }

  confirmDelete(e: EventSummary): void {
    this.confirmAction = {
      title:   'Supprimer l\'événement',
      message: `Cette action est irréversible. Supprimer définitivement "${e.title}" ?`,
      label:   'Supprimer',
      variant: 'danger',
      fn: () => {
        this.eventService.delete(e.id, this.auth.getAdminId()).subscribe({
          next:  () => { this.loadEvents(); this.toast('Événement supprimé', 'success'); },
          error: (err) => this.toast(err?.error?.message ?? 'Suppression échouée', 'error')
        });
      }
    };
  }

  executeConfirm(): void { this.confirmAction?.fn(); this.confirmAction = null; }
  closeConfirm():   void { this.confirmAction = null; }

  // ─── Toast stack ────────────────────────────────────────────────────────
  toast(msg: string, type: ToastMessage['type'] = 'info'): void {
    const icons: Record<string, string> = {
      success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️'
    };
    const t: ToastMessage = { id: ++this.toastId, msg, type, icon: icons[type] };
    this.toasts.push(t);
    setTimeout(() => this.dismissToast(t.id), 3500);
  }

  dismissToast(id: number): void {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }

  // ─── Helpers ────────────────────────────────────────────────────────────
  private today(): string { return new Date().toISOString().split('T')[0]; }

  canCancel(e: EventSummary): boolean {
    return !['CANCELLED', 'COMPLETED'].includes(e.status);
  }
// Dans EventsComponent, ajoute cette méthode
getPendingCount(event: EventSummary): number {
  return (event as any).pendingCount ?? 0;
}
  trackById(_: number, item: { id: number }): number { return item.id; }
}