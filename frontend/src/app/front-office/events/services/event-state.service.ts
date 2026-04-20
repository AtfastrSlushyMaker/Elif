
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, forkJoin, of, Observable } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  finalize,
  map,
  takeUntil,
} from 'rxjs/operators';

import { EventService } from './event.service';
import { AuthService } from '../../../auth/auth.service';
import {
  EventParticipantResponse,
  EventParticipantRequest,
  WaitlistResponse,
} from '../models/event.models';

// ─────────────────────────────────────────────────────────────────────────────
// Types publics
// ─────────────────────────────────────────────────────────────────────────────

export type RegStatus   = 'CONFIRMED' | 'PENDING' | 'REJECTED' | null;
export type WaitStatus  = 'WAITING' | 'NOTIFIED' | 'EXPIRED' | null;

export interface EventUserState {
  eventId:          number;
  regStatus:        RegStatus;
  regEntryId:       number | null;  // ID de la participation (pour les mises à jour)
  numberOfSeats:    number;
  waitStatus:       WaitStatus;
  waitEntryId:      number | null;
  waitPosition:     number | null;
  waitPeopleAhead:  number | null;
  confirmDeadline:  string | null;
  minutesLeft:      number | null;
}

export type StateMap = Map<number, EventUserState>;

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class EventStateService implements OnDestroy {

  // ── Streams publics ──────────────────────────────────────────────

  /** Map complète eventId → EventUserState. Émise à chaque changement. */
  private readonly _stateMap$ = new BehaviorSubject<StateMap>(new Map());
  readonly stateMap$ = this._stateMap$.asObservable();

  /** true pendant un refresh global */
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loading$.asObservable();

  /** Notifie les composants d'un toast à afficher */
  private readonly _toast$ = new Subject<{ msg: string; type: 'ok' | 'err' | 'warn' | 'info' }>();
  readonly toast$ = this._toast$.asObservable();

  private destroy$ = new Subject<void>();

  constructor(
    private eventService: EventService,
    private auth: AuthService,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─────────────────────────────────────────────────────────────────
  // Lecture
  // ─────────────────────────────────────────────────────────────────

  /** Snapshot synchrone de l'état d'un événement */
  getState(eventId: number): EventUserState | null {
    return this._stateMap$.getValue().get(eventId) ?? null;
  }

  /** Observable réactif sur l'état d'UN événement */
  state$(eventId: number): Observable<EventUserState | null> {
    return this.stateMap$.pipe(
      map(m => m.get(eventId) ?? null),
      distinctUntilChanged(),
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // Chargement
  // ─────────────────────────────────────────────────────────────────

  /**
   * Recharge TOUTES les inscriptions + listes d'attente de l'utilisateur.
   * Appelé : login, changement de page, après chaque action.
   */
  refreshAll(): void {
    const userId = this.currentUserId();
    if (!userId || !this.auth.hasRole('USER')) {
      this._stateMap$.next(new Map());
      return;
    }

    this._loading$.next(true);

    const reg$ = this.eventService.getMyRegistrations(userId, 0, 500).pipe(
      catchError(() => of({ content: [] as EventParticipantResponse[], totalElements: 0 })),
    );
    const wait$ = this.eventService.getMyWaitlistEntries(userId, 0, 500).pipe(
      catchError(() => of({ content: [] as WaitlistResponse[], totalElements: 0 })),
    );

    forkJoin([reg$, wait$])
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this._loading$.next(false)),
      )
      .subscribe({
        next: ([regPage, waitPage]) => {
          const map = new Map<number, EventUserState>();

          // Inscriptions
          for (const r of regPage.content) {
            if (!r.eventId) continue;
            const s = this._blank(r.eventId);
            s.regStatus     = r.status as RegStatus;
            s.regEntryId    = r.id ?? null;
            s.numberOfSeats = r.numberOfSeats ?? 1;
            map.set(r.eventId, s);
          }

          // Listes d'attente
          for (const w of waitPage.content) {
            if (!w.eventId) continue;
            const s = map.get(w.eventId) ?? this._blank(w.eventId);
            s.waitStatus    = w.status as WaitStatus;
            s.waitEntryId   = w.id ?? null;
            s.waitPosition  = w.position ?? null;
            s.waitPeopleAhead = (w as any).peopleAhead ?? null;
            s.confirmDeadline = (w as any).confirmationDeadline ?? null;
            s.minutesLeft   = (w as any).minutesRemainingToConfirm ?? null;
            map.set(w.eventId, s);
          }

          this._stateMap$.next(map);
        },
      });
  }

  /**
   * Met à jour l'état d'UN seul événement sans recharger tout.
   * Utilisé pour les mises à jour optimistes immédiates.
   */
  patchState(eventId: number, patch: Partial<EventUserState>): void {
    const map  = new Map(this._stateMap$.getValue());
    const curr = map.get(eventId) ?? this._blank(eventId);
    map.set(eventId, { ...curr, ...patch });
    this._stateMap$.next(map);
  }

  /**
   * Supprime l'état d'un événement (l'utilisateur s'est désinscrit).
   */
  clearState(eventId: number): void {
    const map = new Map(this._stateMap$.getValue());
    map.delete(eventId);
    this._stateMap$.next(map);
  }

  // ─────────────────────────────────────────────────────────────────
  // Actions utilisateur — Registration
  // ─────────────────────────────────────────────────────────────────

  /**
   * Inscription à un événement.
   * Mise à jour optimiste immédiate → confirmation API → refresh complet.
   */
  register(eventId: number, request: EventParticipantRequest): Observable<void> {
    const userId = this.currentUserId()!;

    // Optimiste : on affiche "PENDING" immédiatement pendant l'appel
    this.patchState(eventId, { regStatus: 'PENDING', numberOfSeats: request.numberOfSeats });

    return new Observable(obs => {
      this.eventService.register(eventId, userId, request).subscribe({
        next: (res) => {
          // Mise à jour précise dès la réponse
          this.patchState(eventId, {
            regStatus:    res.status as RegStatus,
            regEntryId:   res.id ?? null,
            numberOfSeats: res.numberOfSeats ?? request.numberOfSeats,
          });
          this._toast$.next({ msg: '✅ Inscription réussie !', type: 'ok' });
          this.refreshAll();
          obs.next();
          obs.complete();
        },
        error: (err) => {
          // Rollback optimiste
          this.clearState(eventId);
          this._toast$.next({
            msg: err.error?.message || 'Erreur lors de l\'inscription',
            type: 'err',
          });
          obs.error(err);
        },
      });
    });
  }

  /**
   * Annuler une inscription confirmée ou une candidature en attente.
   */
  cancelRegistration(eventId: number): Observable<void> {
    const userId = this.currentUserId()!;
    const prev   = this.getState(eventId);

    // Optimiste
    this.patchState(eventId, { regStatus: null, regEntryId: null });

    return new Observable(obs => {
      this.eventService.leaveEvent(eventId, userId).subscribe({
        next: () => {
          this.clearState(eventId);
          this._toast$.next({ msg: '✅ Participation annulée', type: 'ok' });
          this.refreshAll();
          obs.next();
          obs.complete();
        },
        error: (err) => {
          // Rollback
          if (prev) this.patchState(eventId, prev);
          this._toast$.next({
            msg: err.error?.message || 'Erreur lors de l\'annulation',
            type: 'err',
          });
          obs.error(err);
        },
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Actions utilisateur — Waitlist
  // ─────────────────────────────────────────────────────────────────

  /**
   * Rejoindre la liste d'attente.
   */
  joinWaitlist(eventId: number, request: EventParticipantRequest): Observable<void> {
    const userId = this.currentUserId()!;

    // Optimiste
    this.patchState(eventId, { waitStatus: 'WAITING', waitPosition: null });

    return new Observable(obs => {
      this.eventService.joinWaitlist(eventId, userId, request).subscribe({
        next: (res) => {
          this.patchState(eventId, {
            waitStatus:   'WAITING',
            waitEntryId:  res.id ?? null,
            waitPosition: res.position ?? null,
            waitPeopleAhead: (res as any).peopleAhead ?? null,
          });
          this._toast$.next({
            msg: `📋 En liste d'attente — Position #${res.position}`,
            type: 'ok',
          });
          this.refreshAll();
          obs.next();
          obs.complete();
        },
        error: (err) => {
          this.clearState(eventId);
          this._toast$.next({
            msg: err.error?.message || 'Erreur liste d\'attente',
            type: 'err',
          });
          obs.error(err);
        },
      });
    });
  }

  /**
   * Quitter la liste d'attente.
   */
  leaveWaitlist(eventId: number): Observable<void> {
    const userId = this.currentUserId()!;
    const prev   = this.getState(eventId);

    this.patchState(eventId, { waitStatus: null, waitEntryId: null, waitPosition: null });

    return new Observable(obs => {
      this.eventService.leaveWaitlist(eventId, userId).subscribe({
        next: () => {
          this.clearState(eventId);
          this._toast$.next({ msg: '✅ Retiré de la liste d\'attente', type: 'ok' });
          this.refreshAll();
          obs.next();
          obs.complete();
        },
        error: (err) => {
          if (prev) this.patchState(eventId, prev);
          this._toast$.next({
            msg: err.error?.message || 'Erreur retrait liste d\'attente',
            type: 'err',
          });
          obs.error(err);
        },
      });
    });
  }

  /**
   * Confirmer la place proposée (statut NOTIFIED).
   */
  confirmWaitlistOffer(eventId: number): Observable<void> {
    const userId = this.currentUserId()!;

    return new Observable(obs => {
      this.eventService.confirmWaitlistEntry(eventId, userId).subscribe({
        next: () => {
          this.patchState(eventId, {
            waitStatus: null,
            waitEntryId: null,
            regStatus: 'CONFIRMED',
          });
          this._toast$.next({ msg: '🎉 Place confirmée ! Vous êtes maintenant inscrit.', type: 'ok' });
          this.refreshAll();
          obs.next();
          obs.complete();
        },
        error: (err) => {
          const msg = err.error?.message || 'Erreur lors de la confirmation';
          this._toast$.next({ msg, type: 'err' });
          if (msg.toLowerCase().includes('expir')) {
            this.patchState(eventId, { waitStatus: 'EXPIRED' });
          }
          obs.error(err);
        },
      });
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────

  currentUserId(): number | null {
    const user = this.auth.getCurrentUser?.();
    if (user?.id) return user.id;
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const p = JSON.parse(stored);
        return p.id ?? p.userId ?? null;
      }
    } catch { /* noop */ }
    return null;
  }

  private _blank(eventId: number): EventUserState {
    return {
      eventId,
      regStatus:      null,
      regEntryId:     null,
      numberOfSeats:  1,
      waitStatus:     null,
      waitEntryId:    null,
      waitPosition:   null,
      waitPeopleAhead: null,
      confirmDeadline: null,
      minutesLeft:    null,
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // Computed helpers (synchrones, pour les templates)
  // ─────────────────────────────────────────────────────────────────

  isConfirmed(eventId: number):      boolean { return this.getState(eventId)?.regStatus === 'CONFIRMED'; }
  isPending(eventId: number):        boolean { return this.getState(eventId)?.regStatus === 'PENDING'; }
  isRejected(eventId: number):       boolean { return this.getState(eventId)?.regStatus === 'REJECTED'; }
  isOnWaitlist(eventId: number):     boolean {
    const s = this.getState(eventId)?.waitStatus;
    return s === 'WAITING' || s === 'NOTIFIED';
  }
  isNotified(eventId: number):       boolean { return this.getState(eventId)?.waitStatus === 'NOTIFIED'; }
  isExpired(eventId: number):        boolean { return this.getState(eventId)?.waitStatus === 'EXPIRED'; }
  hasAnyState(eventId: number):      boolean {
    const s = this.getState(eventId);
    return !!(s?.regStatus || s?.waitStatus);
  }
}