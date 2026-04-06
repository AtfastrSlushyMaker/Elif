// front-office/events/pages/detail/event-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { EventService, UserAuthService } from '../../services/event.service';
import {
  EventDetail,
  EventSummary,
  EventParticipant,
  WaitlistEntry,
  EventReview,
  WeatherData,
  RegistrationState,
  STATUS_LABELS,
  STATUS_COLORS,
  WEATHER_ICONS,
} from '../../models/event.models';

type TabId = 'info' | 'reviews' | 'weather' | 'suggestions';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TitleCasePipe, DecimalPipe, DatePipe],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css'],
})
export class EventDetailComponent implements OnInit {

  // ── Data ────────────────────────────────────────────────────────────────
  event: EventDetail | null = null;
  weather: WeatherData | null = null;
  reviews: EventReview[] = [];
  myEntry: EventParticipant | null = null;
  waitlistEntry: WaitlistEntry | null = null;

  // ── État ────────────────────────────────────────────────────────────────
  loading = true;
  loadingWeather = false;
  loadingReviews = false;
  submittingReg = false;
  submittingReview = false;
  error = '';

  activeTab: TabId = 'info';

  // ── État inscription ──────────────────────────────────────────────────
  registrationState: RegistrationState = 'none';

  // ── Formulaire d'inscription ──────────────────────────────────────────
  requestedSeats = 1;

  // ── Formulaire avis ───────────────────────────────────────────────────
  reviewRating = 5;
  reviewComment = '';
  reviewError = '';
  myReview: EventReview | null = null;

  // ── Maps ────────────────────────────────────────────────────────────────
  readonly statusLabels = STATUS_LABELS;
  readonly statusColors = STATUS_COLORS;
  readonly weatherIcons = WEATHER_ICONS;

  // ── Toast ────────────────────────────────────────────────────────────────
  toast: { msg: string; type: 'success' | 'error' | 'info' | 'warning' } | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventSvc: EventService,
    public auth: UserAuthService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadEvent(+id);
    else { this.error = 'Événement introuvable'; this.loading = false; }
  }

  // ─── Chargement ──────────────────────────────────────────────────────
  loadEvent(id: number): void {
    this.loading = true;
    this.eventSvc.getEventById(id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: e => {
          this.event = e;
          this.loadMyRegistrationState(e.id);
          this.loadReviews(e.id);
        },
        error: () => (this.error = 'Impossible de charger cet événement'),
      });
  }

  // ─── Vérifier si l'utilisateur est inscrit ───────────────────────────
  private loadMyRegistrationState(eventId: number): void {
    const userId = this.auth.getUserId();
    if (!userId || !this.auth.isUser()) return;

    this.eventSvc.getMyRegistrations(userId, 0, 50).subscribe({
      next: page => {
        const entry = page.content.find(p => p.eventId === eventId);
        if (entry) {
          this.myEntry = entry;
          if (entry.status === 'CONFIRMED') this.registrationState = 'confirmed';
          if (entry.status === 'PENDING') this.registrationState = 'pending';
          if (entry.status === 'CANCELLED') this.registrationState = 'none';
          return;
        }
        if (this.event?.status === 'FULL') {
          this.eventSvc.getMyWaitlistEntry(eventId, userId).subscribe({
            next: w => { this.waitlistEntry = w; this.registrationState = 'on_waitlist'; },
            error: () => {},
          });
        }
      },
      error: () => {},
    });
  }

  // ─── Avis ────────────────────────────────────────────────────────────
  loadReviews(eventId: number): void {
    this.loadingReviews = true;
    this.eventSvc.getEventReviews(eventId, 0, 20)
      .pipe(finalize(() => (this.loadingReviews = false)))
      .subscribe({
        next: r => {
          this.reviews = r.content;
          const userId = this.auth.getUserId();
          if (userId) this.myReview = r.content.find(rv => rv.userId === userId) ?? null;
        },
        error: () => {},
      });
  }

  // ─── Météo ────────────────────────────────────────────────────────────
  loadWeather(): void {
    if (!this.event || this.weather) return;
    this.loadingWeather = true;
    this.eventSvc.getWeatherForEvent(this.event.id)
      .pipe(finalize(() => (this.loadingWeather = false)))
      .subscribe({ next: w => (this.weather = w), error: () => {} });
  }

  // ─── Onglets ─────────────────────────────────────────────────────────
  setTab(tab: TabId): void {
    this.activeTab = tab;
    if (tab === 'weather') this.loadWeather();
  }

  // ─── INSCRIPTION ─────────────────────────────────────────────────────
  register(): void {
    if (!this.event) return;
    const userId = this.auth.getUserId();
    if (!userId) { this.router.navigate(['/auth/login']); return; }
    if (!this.auth.isUser()) { this.showToast('Seuls les utilisateurs peuvent s\'inscrire', 'warning'); return; }

    this.submittingReg = true;

    if (this.event.status === 'FULL') {
      this.eventSvc.joinWaitlist(this.event.id, userId, { numberOfSeats: this.requestedSeats })
        .pipe(finalize(() => (this.submittingReg = false)))
        .subscribe({
          next: w => {
            this.waitlistEntry = w;
            this.registrationState = 'on_waitlist';
            this.showToast(`🎉 Vous êtes en position ${w.position} sur la liste d'attente !`, 'success');
          },
          error: err => this.showToast(err?.error?.message ?? 'Inscription échouée', 'error'),
        });
      return;
    }

    this.eventSvc.joinEvent(this.event.id, userId, { numberOfSeats: this.requestedSeats })
      .pipe(finalize(() => (this.submittingReg = false)))
      .subscribe({
        next: p => {
          this.myEntry = p;
          if (p.status === 'CONFIRMED') {
            this.registrationState = 'confirmed';
            this.showToast('✅ Inscription confirmée ! Les rappels seront envoyés automatiquement.', 'success');
          } else {
            this.registrationState = 'pending';
            this.showToast('⏳ Candidature soumise ! Un admin examinera votre demande.', 'info');
          }
          this.loadEvent(this.event!.id);
        },
        error: err => this.showToast(err?.error?.message ?? 'Inscription échouée', 'error'),
      });
  }

  // ─── ANNULATION inscription ───────────────────────────────────────────
  cancelRegistration(): void {
    if (!this.event) return;
    const userId = this.auth.getUserId();
    if (!userId) return;

    this.submittingReg = true;
    this.eventSvc.leaveEvent(this.event.id, userId)
      .pipe(finalize(() => (this.submittingReg = false)))
      .subscribe({
        next: () => {
          this.registrationState = 'none';
          this.myEntry = null;
          this.showToast('Inscription annulée', 'info');
          this.loadEvent(this.event!.id);
        },
        error: err => this.showToast(err?.error?.message ?? 'Annulation échouée', 'error'),
      });
  }

  // ─── QUITTER liste d'attente ──────────────────────────────────────────
  leaveWaitlist(): void {
    if (!this.event) return;
    const userId = this.auth.getUserId();
    if (!userId) return;

    this.submittingReg = true;
    this.eventSvc.leaveWaitlist(this.event.id, userId)
      .pipe(finalize(() => (this.submittingReg = false)))
      .subscribe({
        next: () => {
          this.registrationState = 'none';
          this.waitlistEntry = null;
          this.showToast('Retiré de la liste d\'attente', 'info');
        },
        error: err => this.showToast(err?.error?.message ?? 'Erreur', 'error'),
      });
  }

  // ─── SOUMETTRE avis ──────────────────────────────────────────────────
  submitReview(): void {
    if (!this.event) return;
    const userId = this.auth.getUserId();
    if (!userId) { this.router.navigate(['/auth/login']); return; }

    if (this.reviewRating < 1 || this.reviewRating > 5) {
      this.reviewError = 'La note doit être comprise entre 1 et 5';
      return;
    }
    this.reviewError = '';
    this.submittingReview = true;

    this.eventSvc.submitReview(this.event.id, userId, {
      rating: this.reviewRating,
      comment: this.reviewComment,
    }).pipe(finalize(() => (this.submittingReview = false)))
      .subscribe({
        next: r => {
          this.myReview = r;
          this.reviews.unshift(r);
          this.showToast('⭐ Avis soumis, merci !', 'success');
        },
        error: err => {
          this.reviewError = err?.error?.message ?? 'Erreur lors de la soumission';
        },
      });
  }

  // ─── SUPPRIMER mon avis ───────────────────────────────────────────────
  deleteMyReview(): void {
    if (!this.myReview || !this.event) return;
    const userId = this.auth.getUserId();
    if (!userId) return;

    this.eventSvc.deleteReview(this.myReview.id, userId).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== this.myReview!.id);
        this.myReview = null;
        this.reviewRating = 5;
        this.reviewComment = '';
        this.showToast('Avis supprimé', 'info');
      },
      error: err => this.showToast(err?.error?.message ?? 'Erreur', 'error'),
    });
  }

  // ─── Getters ─────────────────────────────────────────────────────────
  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }
  get isUser(): boolean {
    return this.auth.isUser();
  }
  get isCompetition(): boolean {
    return !!this.event?.category?.requiresApproval;
  }
  get canJoin(): boolean {
    return this.event?.status === 'PLANNED' && (this.event?.remainingSlots ?? 0) > 0;
  }
  get canWaitlist(): boolean {
    return this.event?.status === 'FULL';
  }
  get canReview(): boolean {
    return this.event?.status === 'COMPLETED' && this.registrationState === 'confirmed' && !this.myReview;
  }
  get fillPct(): number {
    if (!this.event?.maxParticipants) return 0;
    return Math.round(((this.event.maxParticipants - this.event.remainingSlots) / this.event.maxParticipants) * 100);
  }
  get hasSuggestedEvents(): boolean {
    return !!this.event?.suggestedEvents && this.event.suggestedEvents.length > 0;
  }

  // ─── Helpers UI ──────────────────────────────────────────────────────
  formatDate(d: string | undefined | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  formatTime(d: string | undefined | null): string {
    if (!d) return '—';
    return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  starsArray(r: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < Math.round(r));
  }

  setReviewRating(n: number): void {
    this.reviewRating = n;
  }

  trackById(_: number, item: { id: number }): number {
    return item.id;
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }

  // ─── Toast ───────────────────────────────────────────────────────────
  showToast(msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    this.toast = { msg, type };
    setTimeout(() => (this.toast = null), 4500);
  }
}