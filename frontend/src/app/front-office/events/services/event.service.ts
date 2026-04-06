// front-office/events/services/event.service.ts
// Service HTTP aligné exactement avec les controllers Java backend

import { Injectable }                from '@angular/core';
import { HttpClient, HttpParams }    from '@angular/common/http';
import { Observable }               from 'rxjs';

import {
  EventSummary,
  EventDetail,
  EventParticipant,
  WaitlistEntry,
  EventReview,
  WeatherData,
  ParticipantRequest,
  ReviewRequest,
  Page,
} from '../models/event.models';

const BASE = 'http://localhost:8087/elif/api';

@Injectable({ providedIn: 'root' })
export class EventService {

  constructor(private http: HttpClient) {}

  // ══════════════════════════════════════════════════════════════════
  // ÉVÉNEMENTS — EventController.java
  // ══════════════════════════════════════════════════════════════════

  /**
   * GET /api/events
   * Retourne TOUS les statuts (PLANNED, FULL, ONGOING, COMPLETED, CANCELLED).
   * Le backend ne filtre PAS par status par défaut.
   */
  getAllEvents(params: {
    categoryId?: number | null;
    keyword?:    string;
    page?:       number;
    size?:       number;
    sort?:       string;
  }): Observable<Page<EventSummary>> {
    let p = new HttpParams()
      .set('page', String(params.page ?? 0))
      .set('size', String(params.size ?? 12))
      .set('sort', params.sort ?? 'startDate,asc');

    if (params.categoryId) p = p.set('categoryId', String(params.categoryId));
    if (params.keyword?.trim()) p = p.set('keyword', params.keyword.trim());

    return this.http.get<Page<EventSummary>>(`${BASE}/events`, { params: p });
  }

  /** GET /api/events/{id} */
  getEventById(id: number): Observable<EventDetail> {
    return this.http.get<EventDetail>(`${BASE}/events/${id}`);
  }

  /** GET /api/events/calendar?year=&month= */
  getCalendar(year: number, month: number): Observable<Record<string, EventSummary[]>> {
    return this.http.get<Record<string, EventSummary[]>>(
      `${BASE}/events/calendar`,
      { params: { year, month } }
    );
  }

  /** GET /api/events/weather?city= */
  getWeatherByCity(city: string): Observable<WeatherData> {
    return this.http.get<WeatherData>(
      `${BASE}/events/weather`,
      { params: { city } }
    );
  }

  /** GET /api/events/{id}/weather */
  getWeatherForEvent(id: number): Observable<WeatherData> {
    return this.http.get<WeatherData>(`${BASE}/events/${id}/weather`);
  }

  // ══════════════════════════════════════════════════════════════════
  // CATÉGORIES — EventCategoryController.java
  // ══════════════════════════════════════════════════════════════════

  /** GET /api/event-categories */
  getCategories(): Observable<import('../models/event.models').EventCategory[]> {
    return this.http.get<import('../models/event.models').EventCategory[]>(
      `${BASE}/event-categories`
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // INSCRIPTION — EventParticipantController.java
  // ══════════════════════════════════════════════════════════════════

  /**
   * POST /api/events/{id}/join?userId=
   * Body: { numberOfSeats: number }
   * Rôle requis : USER
   * Si category.requiresApproval → statut PENDING
   * Sinon → statut CONFIRMED
   */
  joinEvent(eventId: number, userId: number, body: ParticipantRequest): Observable<EventParticipant> {
    return this.http.post<EventParticipant>(
      `${BASE}/events/${eventId}/join`,
      body,
      { params: { userId } }
    );
  }

  /**
   * DELETE /api/events/{id}/leave?userId=
   * Rôle requis : USER
   */
  leaveEvent(eventId: number, userId: number): Observable<void> {
    return this.http.delete<void>(
      `${BASE}/events/${eventId}/leave`,
      { params: { userId } }
    );
  }

  /** GET /api/events/registrations/my?userId=&page=&size= */
  getMyRegistrations(userId: number, page = 0, size = 10): Observable<Page<EventParticipant>> {
    return this.http.get<Page<EventParticipant>>(
      `${BASE}/events/registrations/my`,
      { params: { userId, page, size } }
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // LISTE D'ATTENTE — EventParticipantController.java
  // ══════════════════════════════════════════════════════════════════

  /**
   * POST /api/events/{id}/waitlist?userId=
   * Disponible uniquement quand event.status === 'FULL'
   */
  joinWaitlist(eventId: number, userId: number, body: ParticipantRequest): Observable<WaitlistEntry> {
    return this.http.post<WaitlistEntry>(
      `${BASE}/events/${eventId}/waitlist`,
      body,
      { params: { userId } }
    );
  }

  /** DELETE /api/events/{id}/waitlist?userId= */
  leaveWaitlist(eventId: number, userId: number): Observable<void> {
    return this.http.delete<void>(
      `${BASE}/events/${eventId}/waitlist`,
      { params: { userId } }
    );
  }

  /** GET /api/events/{id}/waitlist/my?userId= */
  getMyWaitlistEntry(eventId: number, userId: number): Observable<WaitlistEntry> {
    return this.http.get<WaitlistEntry>(
      `${BASE}/events/${eventId}/waitlist/my`,
      { params: { userId } }
    );
  }

  /** GET /api/events/waitlist/my?userId=&page=&size= */
  getMyWaitlistEntries(userId: number, page = 0, size = 10): Observable<Page<WaitlistEntry>> {
    return this.http.get<Page<WaitlistEntry>>(
      `${BASE}/events/waitlist/my`,
      { params: { userId, page, size } }
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // AVIS — EventReviewController.java
  // ══════════════════════════════════════════════════════════════════

  /** GET /api/events/{id}/reviews?page=&size= */
  getEventReviews(eventId: number, page = 0, size = 10): Observable<Page<EventReview>> {
    return this.http.get<Page<EventReview>>(
      `${BASE}/events/${eventId}/reviews`,
      { params: { page, size } }
    );
  }

  /**
   * POST /api/events/{id}/reviews?userId=
   * Rôle requis : USER
   * Seulement sur événements COMPLETED
   */
  submitReview(eventId: number, userId: number, body: ReviewRequest): Observable<EventReview> {
    return this.http.post<EventReview>(
      `${BASE}/events/${eventId}/reviews`,
      body,
      { params: { userId } }
    );
  }

  /** PUT /api/events/reviews/{reviewId}?userId= */
  updateReview(reviewId: number, userId: number, body: ReviewRequest): Observable<EventReview> {
    return this.http.put<EventReview>(
      `${BASE}/events/reviews/${reviewId}`,
      body,
      { params: { userId } }
    );
  }

  /** DELETE /api/events/reviews/{reviewId}?userId= */
  deleteReview(reviewId: number, userId: number): Observable<void> {
    return this.http.delete<void>(
      `${BASE}/events/reviews/${reviewId}`,
      { params: { userId } }
    );
  }
}

// ─── Auth helper (à adapter selon votre AuthService réel) ────────────────────
@Injectable({ providedIn: 'root' })
export class UserAuthService {

  /** Retourne l'ID de l'utilisateur connecté depuis le localStorage */
  getUserId(): number | null {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
      return user?.id ?? null;
    } catch { return null; }
  }

  isLoggedIn(): boolean {
    return this.getUserId() !== null;
  }

  getRole(): 'USER' | 'ADMIN' | null {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
      return user?.role ?? null;
    } catch { return null; }
  }

  isUser(): boolean { return this.getRole() === 'USER'; }
}