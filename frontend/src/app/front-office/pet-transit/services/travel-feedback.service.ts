import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import {
  TravelFeedback,
  TravelFeedbackCreateRequest,
  TravelFeedbackUpdateRequest
} from '../models/travel-feedback.model';

@Injectable({ providedIn: 'root' })
export class TravelFeedbackService {
  private readonly baseUrl = 'http://localhost:8087/elif/api';

  constructor(private readonly http: HttpClient) {}

  createFeedback(
    planId: number,
    request: TravelFeedbackCreateRequest
  ): Observable<TravelFeedback> {
    return this.http
      .post<TravelFeedback>(
        `${this.baseUrl}/travel-plans/${planId}/feedback`,
        request,
        { headers: this.headers() }
      )
      .pipe(catchError((error) => throwError(() => this.toError(error, 'Failed to submit feedback.'))));
  }

  getFeedbacksForPlan(planId: number): Observable<TravelFeedback[]> {
    return this.http
      .get<TravelFeedback[]>(
        `${this.baseUrl}/travel-plans/${planId}/feedback`,
        { headers: this.headers() }
      )
      .pipe(catchError((error) => throwError(() => this.toError(error, 'Failed to load feedbacks.'))));
  }

  getMyFeedbacks(): Observable<TravelFeedback[]> {
    return this.http
      .get<TravelFeedback[]>(`${this.baseUrl}/feedback/my`, {
        headers: this.headers()
      })
      .pipe(catchError((error) => throwError(() => this.toError(error, 'Failed to load your feedbacks.'))));
  }

  updateFeedback(
    planId: number,
    feedbackId: number,
    request: TravelFeedbackUpdateRequest
  ): Observable<TravelFeedback> {
    return this.http
      .put<TravelFeedback>(
        `${this.baseUrl}/travel-plans/${planId}/feedback/${feedbackId}`,
        request,
        { headers: this.headers() }
      )
      .pipe(catchError((error) => throwError(() => this.toError(error, 'Failed to update feedback.'))));
  }

  deleteFeedback(planId: number, feedbackId: number): Observable<void> {
    return this.http
      .delete<void>(
        `${this.baseUrl}/travel-plans/${planId}/feedback/${feedbackId}`,
        { headers: this.headers() }
      )
      .pipe(catchError((error) => throwError(() => this.toError(error, 'Failed to delete feedback.'))));
  }

  getCurrentUserId(): string {
    const keys = ['userId', 'elif_user', 'elif.session.user'];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const trimmed = raw.trim();
      if (!trimmed) continue;
      if (/^\d+$/.test(trimmed)) return trimmed;
      try {
        const parsed = JSON.parse(trimmed) as { id?: number | string };
        if (parsed?.id !== undefined && parsed.id !== null) {
          const idStr = String(parsed.id).trim();
          if (idStr) return idStr;
        }
      } catch {
        continue;
      }
    }
    return '';
  }

  private headers(): HttpHeaders {
    return new HttpHeaders({ 'X-User-Id': this.getCurrentUserId() });
  }

  private toError(error: unknown, fallback: string): Error {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return new Error('Unable to reach the server. Please check your connection.');
      }
      const raw = error.error;
      if (raw && typeof raw === 'object') {
        const candidate = raw as Record<string, unknown>;
        const msg = candidate['message'] ?? candidate['error'];
        if (typeof msg === 'string' && msg.trim()) {
          return new Error(msg.trim());
        }
      }
    }
    return new Error(fallback);
  }
}
