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
export class ReviewService {
  constructor(private http: HttpClient) {}
 
  submit(eventId: number, userId: number, body: EventReviewRequest): Observable<EventReview> {
    return this.http.post<EventReview>(
      `${API}/events/${eventId}/reviews?userId=${userId}`, body
    );
  }
 
  getReviews(eventId: number, page = 0): Observable<Page<EventReview>> {
    return this.http.get<Page<EventReview>>(
      `${API}/events/${eventId}/reviews?page=${page}`
    );
  }
 
  update(reviewId: number, userId: number, body: EventReviewRequest): Observable<EventReview> {
    return this.http.put<EventReview>(
      `${API}/events/reviews/${reviewId}?userId=${userId}`, body
    );
  }
 
  delete(reviewId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${API}/events/reviews/${reviewId}?userId=${userId}`);
  }
}
 