import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  EventDetail, EventSummary, EventStats, WeatherResponse,
  EventCategory, EventParticipant, EventReview,
  EventCreateRequest, EventUpdateRequest,
  EventParticipantRequest, EventReviewRequest,
  Page
} from '../models/event.models';
 
const API = 'http://localhost:8080/api';
 @Injectable({ providedIn: 'root' })
export class CategoryService {
  constructor(private http: HttpClient) {}
 
  getAll(): Observable<EventCategory[]> {
    return this.http.get<EventCategory[]>(`${API}/event-categories`);
  }
 
  create(data: Partial<EventCategory>, userId: number): Observable<EventCategory> {
    return this.http.post<EventCategory>(`${API}/event-categories?userId=${userId}`, data);
  }
 
  update(id: number, data: Partial<EventCategory>, userId: number): Observable<EventCategory> {
    return this.http.put<EventCategory>(`${API}/event-categories/${id}?userId=${userId}`, data);
  }
 
  delete(id: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${API}/event-categories/${id}?userId=${userId}`);
  }
}