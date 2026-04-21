// src/app/front-office/events/pages/detail/event-detail.component.ts
import {
  Component, OnInit, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { CommonModule }                       from '@angular/common';
import { FormsModule }                        from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil }                 from 'rxjs';
import { finalize }                           from 'rxjs/operators';

import { EventService }                       from '../../services/event.service';
import { AuthService }                        from '../../../../auth/auth.service';
import { EventStateService, EventUserState }  from '../../services/event-state.service';
import { EligibilityResult }                  from '../../models/eligibility.models';
import { VirtualSessionPanelComponent } from '../../components/virtual-session-panel/virtual-session-panel.component';
import {
  EventDetail, WeatherResponse, EventReviewResponse,
  STATUS_LABELS, STATUS_COLORS,
} from '../../models/event.models';

interface Toast { msg: string; type: 'ok' | 'err' | 'warn' | 'info'; }

interface CompForm {
  species:      string;
  petName:      string;
  breed:        string;
  ageMonths:    number | null;
  weightKg:     number | null;
  sex:          string;
  color:        string;
  isVaccinated: boolean;
  hasLicense:   boolean;
  hasMedicalCert: boolean;
  notes:        string;
}

export type RegView =
  | 'none' | 'confirmed' | 'pending' | 'rejected'
  | 'on_waitlist' | 'notified' | 'expired';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, VirtualSessionPanelComponent],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDetailComponent implements OnInit, OnDestroy {

  event:    EventDetail | null        = null;
  weather:  WeatherResponse | null    = null;
  reviews:  EventReviewResponse[]     = [];
  myReview: EventReviewResponse | null = null;
  userState: EventUserState | null    = null;

  loading         = true;
  loadingWeather  = true;
  loadingReviews  = true;
  error:          string | null = null;
  submitting      = false;

  activeTab: 'info' | 'weather' | 'reviews' | 'similar' = 'info';
  seats = 1;

  reviewRating    = 5;
  reviewComment   = '';
  reviewError:    string | null = null;
  submittingReview = false;
  reviewTotal     = 0;

  showCompModal   = false;
  compStep        = 1;

  compForm: CompForm = {
    species: '', petName: '', breed: '',
    ageMonths: null, weightKg: null, sex: '', color: '',
    isVaccinated: false, hasLicense: false, hasMedicalCert: false, notes: '',
  };

  eligibilityResult:      EligibilityResult | null = null;
  showEligibilityFeedback = false;
  eligibilityCheckPending = false;
  eligibilityChecked      = false;

  readonly petSpecies = [
    { value: 'DOG',     label: 'Dog',     icon: '🐕' },
    { value: 'CAT',     label: 'Cat',     icon: '🐈' },
    { value: 'RABBIT',  label: 'Rabbit',  icon: '🐇' },
    { value: 'BIRD',    label: 'Bird',    icon: '🐦' },
    { value: 'REPTILE', label: 'Reptile', icon: '🦎' },
    { value: 'OTHER',   label: 'Other',   icon: '🐾' },
  ];

  toast:            Toast | null = null;
  private toastTimer:  any;
  private destroy$  = new Subject<void>();

  readonly weatherEmoji: Record<string, string> = {
    SUNNY: '☀️', CLOUDY: '⛅', RAINY: '🌧️', STORMY: '⛈️', SNOWY: '❄️', UNKNOWN: '🌤️',
  };
  readonly statusLabels = STATUS_LABELS;
  readonly statusColors = STATUS_COLORS;

  constructor(
    private route:        ActivatedRoute,
    private router:       Router,
    private eventService: EventService,
    public  auth:         AuthService,
    public  stateService: EventStateService,
    private cdr:          ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);
    if (!id) { this.error = 'Event not found'; this.loading = false; return; }

    this.stateService.toast$
      .pipe(takeUntil(this.destroy$))
      .subscribe(t => { this.showToast(t.msg, t.type); this.cdr.markForCheck(); });

    this.stateService.state$(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(s => { this.userState = s; this.cdr.markForCheck(); });

    this.loadEvent(id);
    this.loadWeather(id);
    this.loadReviews(id);
    this.stateService.refreshAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    clearTimeout(this.toastTimer);
  }

  get regView(): RegView {
    const s = this.userState;
    if (!s) return 'none';
    if (s.regStatus === 'CONFIRMED')  return 'confirmed';
    if (s.regStatus === 'PENDING')    return 'pending';
    if (s.regStatus === 'REJECTED')   return 'rejected';
    if (s.waitStatus === 'NOTIFIED')  return 'notified';
    if (s.waitStatus === 'WAITING')   return 'on_waitlist';
    if (s.waitStatus === 'EXPIRED')   return 'expired';
    return 'none';
  }

  get isCompetition(): boolean {
    return !!this.event?.category?.requiresApproval;
  }

  get canJoin(): boolean {
    if (!this.event || !this.auth.isLoggedIn() || !this.auth.hasRole('USER')) return false;
    const free = ['none', 'rejected', 'expired'].includes(this.regView);
    return this.event.status === 'PLANNED' && this.event.remainingSlots > 0 && free;
  }

  get canWaitlist(): boolean {
    if (!this.event || !this.auth.isLoggedIn() || !this.auth.hasRole('USER')) return false;
    const free = ['none', 'rejected', 'expired'].includes(this.regView);
    return this.event.status === 'FULL' && free;
  }

  get canReview(): boolean {
    if (!this.event || !this.auth.isLoggedIn()) return false;
    return this.event.status === 'COMPLETED' && this.regView === 'confirmed' && !this.myReview;
  }

  get fillPct(): number {
    if (!this.event?.maxParticipants) return 0;
    return Math.round(
      ((this.event.maxParticipants - this.event.remainingSlots) / this.event.maxParticipants) * 100
    );
  }

  get formattedTimeLeft(): string {
    const m = this.userState?.minutesLeft;
    if (!m || m <= 0) return 'Expired';
    const h = Math.floor(m / 60), min = m % 60;
    return h > 0 ? `${h}h ${min}min` : `${min} minutes`;
  }

  get canSubmitCompetition(): boolean {
    if (!this.eligibilityChecked || !this.eligibilityResult) return false;
    return !this.eligibilityResult.rejected;
  }

  get admissionBadge(): { icon: string; text: string; cssClass: string } | null {
    if (!this.eligibilityResult) return null;
    const r = this.eligibilityResult;

    if (r.rejected || r.ineligible)
      return { icon: '❌', text: r.userMessage, cssClass: 'elig-badge--rejected' };
    if (r.autoAdmit)
      return { icon: '✅', text: `Auto-admitted — score ${r.score}/100`, cssClass: 'elig-badge--admit' };
    if (r.pending)
      return { icon: '⏳', text: `Under review — score ${r.score}/100`, cssClass: 'elig-badge--pending' };
    return null;
  }

  get scoreBarPct(): number {
    return this.eligibilityResult?.score ?? 0;
  }

  get scoreBarClass(): string {
    const s = this.scoreBarPct;
    if (s >= 70) return 'score-bar__fill--high';
    if (s >= 40) return 'score-bar__fill--medium';
    return 'score-bar__fill--low';
  }

  loadEvent(id: number): void {
    this.eventService.getById(id).pipe(takeUntil(this.destroy$)).subscribe({
      next:  ev  => { this.event = ev; this.loading = false; this.cdr.markForCheck(); },
      error: ()  => { this.error = 'Unable to load event'; this.loading = false; this.cdr.markForCheck(); },
    });
  }

  loadWeather(id: number): void {
    this.loadingWeather = true;
    this.eventService.getEventWeather(id).pipe(takeUntil(this.destroy$)).subscribe({
      next:  w  => { this.weather = w; this.loadingWeather = false; this.cdr.markForCheck(); },
      error: () => { this.loadingWeather = false; this.cdr.markForCheck(); },
    });
  }

  loadReviews(id: number): void {
    this.loadingReviews = true;
    this.eventService.getEventReviews(id, 0, 20).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.reviews    = res.content;
        this.reviewTotal = res.totalElements;
        const uid = this.stateService.currentUserId();
        if (uid) this.myReview = this.reviews.find(r => r.userId === uid) ?? null;
        this.loadingReviews = false;
        this.cdr.markForCheck();
      },
      error: () => { this.loadingReviews = false; this.cdr.markForCheck(); },
    });
  }

  handleMainAction(): void {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/auth/login']); return; }
    if (this.canWaitlist) {
      this.joinWaitlist();
    } else if (this.canJoin && this.isCompetition) {
      this.openCompetitionModal();
    } else if (this.canJoin) {
      this.register();
    }
  }

  register(): void {
    if (!this.event) return;
    this.submitting = true;
    this.stateService.register(this.event.id, { numberOfSeats: this.seats })
      .pipe(finalize(() => { this.submitting = false; this.cdr.markForCheck(); }))
      .subscribe({ next: () => this.loadEvent(this.event!.id), error: () => {} });
  }

  openCompetitionModal(): void {
    this.compForm = {
      species: '', petName: '', breed: '',
      ageMonths: null, weightKg: null, sex: '', color: '',
      isVaccinated: false, hasLicense: false, hasMedicalCert: false, notes: '',
    };
    this.eligibilityResult      = null;
    this.showEligibilityFeedback = false;
    this.eligibilityChecked     = false;
    this.compStep               = 1;
    this.showCompModal          = true;
  }

  closeCompModal(): void {
    this.showCompModal = false;
  }

  resetEligibility(): void {
    this.eligibilityResult       = null;
    this.showEligibilityFeedback = false;
    this.eligibilityChecked      = false;
  }

  checkEligibility(): void {
    if (!this.event) return;
    if (!this.compForm.species || !this.compForm.breed) {
      this.showToast('Please fill in species and breed first', 'warn');
      return;
    }

    this.eligibilityCheckPending  = true;
    this.showEligibilityFeedback  = false;
    this.eligibilityChecked       = false;

    const petData = {
      petName:       this.compForm.petName || 'Unknown',
      breed:         this.compForm.breed.toUpperCase().trim(),
      species:       this.compForm.species.toUpperCase(),
      ageMonths:     this.compForm.ageMonths    ?? 0,
      weightKg:      this.compForm.weightKg     ?? 0,
      isVaccinated:  this.compForm.isVaccinated ?? false,
      hasLicense:    this.compForm.hasLicense   ?? false,
      hasMedicalCert:this.compForm.hasMedicalCert ?? false,
      sex:           this.compForm.sex   ? this.compForm.sex.toUpperCase()   : '',
      color:         this.compForm.color ? this.compForm.color.toUpperCase() : '',
      experienceLevel: 0,
      additionalInfo:  this.compForm.notes || '',
    };

    this.eventService.checkEligibility(this.event.id, petData).subscribe({
      next: (result: EligibilityResult) => {
        this.eligibilityResult       = result;
        this.showEligibilityFeedback = true;
        this.eligibilityChecked      = true;
        this.eligibilityCheckPending = false;
        this.cdr.markForCheck();

        if (result.rejected || result.ineligible) {
          this.showToast('❌ ' + (result.userMessage || 'Not eligible'), 'err');
        } else if (result.pending) {
          this.showToast('⏳ Your application will be reviewed by the organizer', 'warn');
        } else if (result.autoAdmit) {
          this.showToast('✅ All criteria met — you can submit now!', 'ok');
        }
      },
      error: (err: any) => {
        this.eligibilityCheckPending = false;
        this.showToast(err?.error?.message || 'Error checking eligibility', 'err');
        this.cdr.markForCheck();
      },
    });
  }

  submitCompetition(): void {
    if (!this.event) return;

    if (!this.eligibilityChecked) {
      this.checkEligibility();
      return;
    }

    const r = this.eligibilityResult;
    if (!r) return;

    if (r.rejected || r.ineligible) {
      this.showToast('❌ ' + r.userMessage, 'err');
      return;
    }

    if (r.pending) {
      const ok = confirm(
        `⏳ Your score is ${r.score}/100.\n\n` +
        `Your application will be reviewed by the organizer before confirmation.\n\n` +
        `Continue?`
      );
      if (!ok) return;
    }

    this.submitting = true;

    const req = {
      numberOfSeats: 1,
      petData: {
        petName:        this.compForm.petName || 'Unknown',
        breed:          this.compForm.breed.toUpperCase().trim(),
        species:        this.compForm.species.toUpperCase(),
        ageMonths:      this.compForm.ageMonths    ?? 0,
        weightKg:       this.compForm.weightKg     ?? 0,
        isVaccinated:   this.compForm.isVaccinated ?? false,
        hasLicense:     this.compForm.hasLicense   ?? false,
        hasMedicalCert: this.compForm.hasMedicalCert ?? false,
        sex:            this.compForm.sex   ? this.compForm.sex.toUpperCase()   : '',
        color:          this.compForm.color ? this.compForm.color.toUpperCase() : '',
        experienceLevel: 0,
        additionalInfo:  this.compForm.notes || '',
      },
    };

    this.stateService.register(this.event.id, req)
      .pipe(finalize(() => { this.submitting = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => {
          const wasAutoAdmit = r.autoAdmit;
          this.showCompModal = false;
          this.eligibilityResult = null;
          this.eligibilityChecked = false;

          if (wasAutoAdmit) {
            this.showToast('✅ Registration confirmed! Score: ' + r.score + '/100', 'ok');
          } else {
            this.showToast('📋 Application submitted — waiting for organizer review', 'info');
          }

          this.loadEvent(this.event!.id);
        },
        error: (err: any) => {
          this.showToast(err?.error?.message || '❌ Registration failed', 'err');
        },
      });
  }

  joinWaitlist(): void {
    if (!this.event) return;
    this.submitting = true;
    this.stateService.joinWaitlist(this.event.id, { numberOfSeats: this.seats })
      .pipe(finalize(() => { this.submitting = false; this.cdr.markForCheck(); }))
      .subscribe({ error: () => {} });
  }

  cancelRegistration(): void {
    if (!this.event) return;
    const isWait = this.regView === 'on_waitlist' || this.regView === 'notified';
    if (!confirm(isWait ? 'Leave waitlist?' : 'Cancel your participation?')) return;

    this.submitting = true;
    const action$ = isWait
      ? this.stateService.leaveWaitlist(this.event.id)
      : this.stateService.cancelRegistration(this.event.id);

    action$.pipe(finalize(() => {
      this.submitting = false; this.cdr.markForCheck();
      if (!isWait) this.loadEvent(this.event!.id);
    })).subscribe({ error: () => {} });
  }

  confirmWaitlistOffer(): void {
    if (!this.event) return;
    this.submitting = true;
    this.stateService.confirmWaitlistOffer(this.event.id)
      .pipe(finalize(() => {
        this.submitting = false; this.cdr.markForCheck();
        this.loadEvent(this.event!.id);
      }))
      .subscribe({ error: () => {} });
  }

  submitReview(): void {
    if (!this.event) return;
    const userId = this.stateService.currentUserId();
    if (!userId) { this.showToast('Please log in', 'warn'); return; }

    this.reviewError = null;
    if (!this.reviewComment.trim()) { this.reviewError = 'Comment is required'; return; }
    if (this.reviewComment.length > 1000) { this.reviewError = 'Max 1000 characters'; return; }

    this.submittingReview = true;
    this.eventService
      .submitReview(this.event.id, userId, { rating: this.reviewRating, comment: this.reviewComment })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submittingReview = false;
          this.reviewRating = 5; this.reviewComment = '';
          this.showToast('⭐ Review published!', 'ok');
          this.loadReviews(this.event!.id);
          this.loadEvent(this.event!.id);
          this.cdr.markForCheck();
        },
        error: err => {
          this.submittingReview = false;
          this.reviewError = err.error?.message || 'Error submitting review';
          this.cdr.markForCheck();
        },
      });
  }

  deleteMyReview(): void {
    if (!this.myReview) return;
    const userId = this.stateService.currentUserId();
    if (!userId || !confirm('Delete your review?')) return;

    this.eventService.deleteReview(this.myReview.id, userId).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.myReview = null;
        this.showToast('Review deleted', 'ok');
        this.loadReviews(this.event!.id);
        this.loadEvent(this.event!.id);
        this.cdr.markForCheck();
      },
      error: err => this.showToast(err.error?.message || 'Error', 'err'),
    });
  }

  setTab(t: EventDetailComponent['activeTab']): void { this.activeTab = t; }
  goBack(): void { this.router.navigate(['/app/events']); }

  fmtDate(d: string): string {
    return new Date(d).toLocaleDateString('en-GB',
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  fmtTime(d: string): string {
    return new Date(d).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  fmtDateTime(d: string | null | undefined): string {
    if (!d) return '';
    return new Date(d).toLocaleString('en-GB',
      { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  stars(rating: number): boolean[] {
    const r = Math.round(rating);
    return Array.from({ length: 5 }, (_, i) => i < r);
  }

  trackById(_: number, item: any): number { return item.id; }

  showToast(msg: string, type: Toast['type']): void {
    this.toast = { msg, type };
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toast = null; this.cdr.markForCheck(); }, 4500);
  }

  get currentUserId(): number | null {
    const user = this.auth.getCurrentUser();
    return user?.id ?? null;
  }

  get isAdmin(): boolean {
    return this.auth.hasRole('ADMIN');
  }
}