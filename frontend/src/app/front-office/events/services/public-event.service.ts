// front-office/events/services/public-event.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  EventSummary, 
  EventDetail, 
  EventCategory, 
  PageResponse,
  EventParticipant,
  EventParticipantRequest 
} from '../models/event.models';

@Injectable({ providedIn: 'root' })
export class PublicEventService {
  private apiUrl = 'http://localhost:8087/elif/api/events';

  constructor(private http: HttpClient) {}

  getEvents(params: {
    page?: number;
    size?: number;
    categoryId?: number;
    keyword?: string;
  }): Observable<PageResponse<EventSummary>> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.size) httpParams = httpParams.set('size', params.size);
    if (params.categoryId) httpParams = httpParams.set('categoryId', params.categoryId);
    if (params.keyword) httpParams = httpParams.set('keyword', params.keyword);
    
    return this.http.get<PageResponse<EventSummary>>(this.apiUrl, { params: httpParams });
  }

  getEventById(id: number): Observable<EventDetail> {
    return this.http.get<EventDetail>(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<EventCategory[]> {
    return this.http.get<EventCategory[]>('http://localhost:8087/elif/api/event-categories');
  }

  getCalendarEvents(year: number, month: number): Observable<Record<string, EventSummary[]>> {
    return this.http.get<Record<string, EventSummary[]>>(`${this.apiUrl}/calendar`, {
      params: { year: year.toString(), month: month.toString() }
    });
  }

  /** Register user to an event */
  registerToEvent(eventId: number, userId: number, request: EventParticipantRequest): Observable<EventParticipant> {
    return this.http.post<EventParticipant>(
      `${this.apiUrl}/${eventId}/join`,
      request,
      { params: { userId: userId.toString() } }
    );
  }

  /** Cancel registration */
  cancelRegistration(eventId: number, userId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${eventId}/leave`,
      { params: { userId: userId.toString() } }
    );
  }

  /** Check if user is registered */
  isUserRegistered(eventId: number, userId: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/${eventId}/is-registered`,
      { params: { userId: userId.toString() } }
    );
  }

  /** Get user's registrations */
  getMyRegistrations(userId: number): Observable<EventParticipant[]> {
    return this.http.get<EventParticipant[]>(
      `${this.apiUrl}/registrations/my`,
      { params: { userId: userId.toString() } }
    );
  }
}