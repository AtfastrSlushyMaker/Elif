// back-office/events/services/admin-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type {
  EventCapacityResponse,
  EventParticipantResponse,
  WaitlistResponse,
  EventReviewResponse,
  WeatherResponse,
  EventStatsResponse,
  PageResponse,
  EventDetail,
  AdminEventSummary
} from '../models/admin-events.models';

import type {
  EventSummary,
  EventCategory
} from '../../../front-office/events/models/event.models';

// ✅ Réexports pour les composants
export type {
  EventSummary,
  AdminEventSummary,
  EventCategory,
  EventCapacityResponse,
  EventParticipantResponse,
  WaitlistResponse,
  EventReviewResponse,
  WeatherResponse,
  EventStatsResponse,
  PageResponse,
  EventDetail
};

const BASE = 'http://localhost:8087/elif/api';

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH HELPER
// ═══════════════════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  getAdminId(): number {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return user?.id ?? 1;
    } catch {
      return 1;
    }
  }

  getAdminName(): string {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return `${user?.firstName ?? 'Admin'} ${user?.lastName ?? ''}`.trim();
    } catch {
      return 'Admin';
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class AdminEventService {
  private url = `${BASE}/events`;
  constructor(private http: HttpClient) {}

  /** GET /api/events  — liste paginée avec filtres */
  getAll(params: Record<string, any>): Observable<PageResponse<AdminEventSummary>> {
    let p = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') p = p.set(k, String(v));
    });
    return this.http.get<PageResponse<AdminEventSummary>>(this.url, { params: p });
  }

  /** GET /api/events/:id - Détail d'un événement */
  getById(id: number): Observable<EventDetail> {
    return this.http.get<EventDetail>(`${this.url}/${id}`);
  }

  /** POST /api/events — créer un événement */
  create(data: any, userId: number): Observable<EventDetail> {
    return this.http.post<EventDetail>(this.url, data, { params: { userId } });
  }

  /** PUT /api/events/:id — modifier un événement */
  update(eventId: number, data: any, userId: number): Observable<EventDetail> {
    return this.http.put<EventDetail>(`${this.url}/${eventId}`, data, { params: { userId } });
  }

  /** PATCH /api/events/:id/cancel */
  cancel(eventId: number, userId: number): Observable<EventSummary> {
    return this.http.patch<EventSummary>(
      `${this.url}/${eventId}/cancel`, {},
      { params: { userId } }
    );
  }

  /** DELETE /api/events/:id */
  delete(eventId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${eventId}`, { params: { userId } });
  }

  /** GET /api/events/calendar */
  getCalendar(year: number, month: number): Observable<Record<string, EventSummary[]>> {
    return this.http.get<Record<string, EventSummary[]>>(`${this.url}/calendar`, {
      params: { year, month }
    });
  }

  /** GET /api/events/admin/stats */
  getStats(userId: number): Observable<EventStatsResponse> {
    return this.http.get<EventStatsResponse>(`${this.url}/admin/stats`, { params: { userId } });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class AdminCategoryService {
  private url = `${BASE}/event-categories`;
  constructor(private http: HttpClient) {}

  /** GET /api/event-categories — liste toutes les catégories */
  getAll(): Observable<EventCategory[]> {
    return this.http.get<EventCategory[]>(this.url);
  }

  /** GET /api/event-categories/:id — détail d'une catégorie */
  getById(id: number): Observable<EventCategory> {
    return this.http.get<EventCategory>(`${this.url}/${id}`);
  }

  /** POST /api/event-categories — créer une catégorie */
  create(data: any, userId: number): Observable<EventCategory> {
    return this.http.post<EventCategory>(this.url, data, { params: { userId } });
  }

  /** PUT /api/event-categories/:id — modifier une catégorie */
  update(id: number, data: any, userId: number): Observable<EventCategory> {
    return this.http.put<EventCategory>(`${this.url}/${id}`, data, { params: { userId } });
  }

  /** DELETE /api/event-categories/:id — supprimer une catégorie */
  delete(id: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`, { params: { userId } });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAPACITÉ
// ═══════════════════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class AdminCapacityService {
  private url = `${BASE}/events`;
  constructor(private http: HttpClient) {}

  /** GET /api/events/:id/capacity */
  getSnapshot(eventId: number): Observable<EventCapacityResponse> {
    return this.http.get<EventCapacityResponse>(`${this.url}/${eventId}/capacity`);
  }

  /** POST /api/events/:id/capacity/recalculate */
  recalculate(eventId: number, adminId: number): Observable<EventCapacityResponse> {
    return this.http.post<EventCapacityResponse>(
      `${this.url}/${eventId}/capacity/recalculate`, {},
      { params: { adminId } }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARTICIPANTS
// ═══════════════════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class AdminParticipantService {
  private url = `${BASE}/events`;
  constructor(private http: HttpClient) {}

  /** GET /api/events/:id/participants  — confirmés */
  getConfirmed(eventId: number, adminId: number, page = 0, size = 20)
      : Observable<PageResponse<EventParticipantResponse>> {
    return this.http.get<PageResponse<EventParticipantResponse>>(
      `${this.url}/${eventId}/participants`,
      { params: { userId: adminId, page, size } }
    );
  }

  /** GET /api/events/:id/participants/pending  — en attente d'approbation */
  getPending(eventId: number, adminId: number, page = 0, size = 20)
      : Observable<PageResponse<EventParticipantResponse>> {
    return this.http.get<PageResponse<EventParticipantResponse>>(
      `${this.url}/${eventId}/participants/pending`,
      { params: { userId: adminId, page, size } }
    );
  }

  /** PATCH /api/events/participants/:id/approve */
  approve(participantId: number, adminId: number): Observable<EventParticipantResponse> {
    return this.http.patch<EventParticipantResponse>(
      `${this.url}/participants/${participantId}/approve`, {},
      { params: { adminId } }
    );
  }

  /** PATCH /api/events/participants/:id/reject */
  reject(participantId: number, adminId: number): Observable<EventParticipantResponse> {
    return this.http.patch<EventParticipantResponse>(
      `${this.url}/participants/${participantId}/reject`, {},
      { params: { adminId } }
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LISTE D'ATTENTE
// ═══════════════════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class AdminWaitlistService {
  private url = `${BASE}/events`;
  constructor(private http: HttpClient) {}

  /** GET /api/events/:id/waitlist */
  getWaitlist(eventId: number, adminId: number, page = 0, size = 20)
      : Observable<PageResponse<WaitlistResponse>> {
    return this.http.get<PageResponse<WaitlistResponse>>(
      `${this.url}/${eventId}/waitlist`,
      { params: { adminId, page, size } }
    );
  }

  /** POST /api/events/:id/waitlist/promote  — promotion manuelle */
  promoteNext(eventId: number): Observable<{ promoted: boolean }> {
    return this.http.post<{ promoted: boolean }>(
      `${this.url}/${eventId}/waitlist/promote`, {}
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MÉTÉO
// ═══════════════════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class AdminWeatherService {
  private url = `${BASE}/events`;
  constructor(private http: HttpClient) {}

  /** GET /api/events/:id/weather */
  getForEvent(eventId: number): Observable<WeatherResponse> {
    return this.http.get<WeatherResponse>(`${this.url}/${eventId}/weather`);
  }

  /** GET /api/events/weather?city=Tunis */
  getByCity(city: string): Observable<WeatherResponse> {
    return this.http.get<WeatherResponse>(`${this.url}/weather`, { params: { city } });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AVIS
// ═══════════════════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class AdminReviewService {
  private url = `${BASE}/events`;
  constructor(private http: HttpClient) {}

  /** GET /api/events/:id/reviews */
  getReviews(eventId: number, page = 0, size = 10)
      : Observable<PageResponse<EventReviewResponse>> {
    return this.http.get<PageResponse<EventReviewResponse>>(
      `${this.url}/${eventId}/reviews`,
      { params: { page, size } }
    );
  }

  /** DELETE /api/events/reviews/:id */
  deleteReview(reviewId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/reviews/${reviewId}`, { params: { userId } });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// RAPPELS
// ═══════════════════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class AdminReminderService {
  private url = `${BASE}/events`;
  constructor(private http: HttpClient) {}

  /** DELETE /api/events/:id/reminders  — annuler tous les rappels d'un événement */
  cancelAll(eventId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${eventId}/reminders`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT CSV
// ═══════════════════════════════════════════════════════════════════════════════
@Injectable({ providedIn: 'root' })
export class AdminExportService {
  private url = `${BASE}/events`;
  constructor(private http: HttpClient) {}

  /** GET /api/events/export/all  → blob CSV */
  exportAllEvents(userId: number): Observable<Blob> {
    return this.http.get(`${this.url}/export/all`, {
      params: { userId },
      responseType: 'blob'
    });
  }

  /** GET /api/events/:id/export/participants  → blob CSV */
  exportParticipants(eventId: number, userId: number): Observable<Blob> {
    return this.http.get(`${this.url}/${eventId}/export/participants`, {
      params: { userId },
      responseType: 'blob'
    });
  }

  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
}