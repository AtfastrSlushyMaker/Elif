import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import {
  AdminFeedbackResponseRequest,
  TravelFeedbackAdmin
} from '../models/travel-feedback-admin.model';

@Injectable({ providedIn: 'root' })
export class TravelFeedbackAdminService {
  private readonly baseUrl = 'http://localhost:8087/elif/api';

  constructor(private readonly http: HttpClient) {}

  getAllFeedbacks(): Observable<TravelFeedbackAdmin[]> {
    return this.withHeaders((headers) =>
      this.http.get<TravelFeedbackAdmin[]>(`${this.baseUrl}/feedback/admin/all`, { headers })
    ).pipe(map((items) => this.normalizeList(items ?? [])));
  }

  getPendingComplaints(): Observable<TravelFeedbackAdmin[]> {
    return this.withHeaders((headers) =>
      this.http.get<TravelFeedbackAdmin[]>(`${this.baseUrl}/feedback/admin/pending-complaints`, { headers })
    ).pipe(map((items) => this.normalizeList(items ?? [])));
  }

  getUrgentFeedbacks(): Observable<TravelFeedbackAdmin[]> {
    return this.withHeaders((headers) =>
      this.http.get<TravelFeedbackAdmin[]>(`${this.baseUrl}/feedback/admin/urgent`, { headers })
    ).pipe(map((items) => this.normalizeList(items ?? [])));
  }

  getFeedbackById(planId: number, feedbackId: number): Observable<TravelFeedbackAdmin> {
    return this.withHeaders((headers) =>
      this.http.get<TravelFeedbackAdmin>(
        `${this.baseUrl}/travel-plans/${planId}/feedback/${feedbackId}`,
        { headers }
      )
    ).pipe(map((item) => this.normalize(item)));
  }

  respondToFeedback(
    feedbackId: number,
    request: AdminFeedbackResponseRequest
  ): Observable<TravelFeedbackAdmin> {
    return this.withHeaders((headers) =>
      this.http.post<TravelFeedbackAdmin>(
        `${this.baseUrl}/feedback/${feedbackId}/respond`,
        request,
        { headers }
      )
    ).pipe(map((item) => this.normalize(item)));
  }

  deleteFeedback(planId: number, feedbackId: number): Observable<void> {
    return this.withHeaders((headers) =>
      this.http.delete<void>(`${this.baseUrl}/travel-plans/${planId}/feedback/${feedbackId}`, {
        headers
      })
    );
  }

  private withHeaders<T>(request: (headers: HttpHeaders) => Observable<T>): Observable<T> {
    const userId = this.resolveUserId();
    if (!userId) {
      return throwError(() => new Error('Admin session not found. Please sign in again.'));
    }

    return request(new HttpHeaders({ 'X-User-Id': userId })).pipe(
      catchError((error) => throwError(() => this.toError(error, 'Request failed.')))
    );
  }

  private resolveUserId(): string {
    const direct = String(localStorage.getItem('userId') ?? '').trim();
    if (direct) {
      return direct;
    }

    const rawSession = localStorage.getItem('elif_user');
    if (!rawSession) {
      return '';
    }

    try {
      const parsed = JSON.parse(rawSession) as { id?: unknown };
      const parsedId = Number(parsed?.id ?? 0);
      if (Number.isFinite(parsedId) && parsedId > 0) {
        const normalized = String(parsedId);
        localStorage.setItem('userId', normalized);
        return normalized;
      }
    } catch {
      return '';
    }

    return '';
  }

  private normalizeList(items: TravelFeedbackAdmin[]): TravelFeedbackAdmin[] {
    return items
      .map((item) => this.normalize(item))
      .sort((left, right) => this.toTimestamp(right.createdAt) - this.toTimestamp(left.createdAt));
  }

  private normalize(item: TravelFeedbackAdmin): TravelFeedbackAdmin {
    return {
      id: Number(item?.id ?? 0),
      travelPlanId: Number(item?.travelPlanId ?? 0),
      destinationTitle: String(item?.destinationTitle ?? 'Unknown destination'),
      feedbackType: this.toFeedbackType(item?.feedbackType),
      rating: this.toOptionalNumber(item?.rating),
      title: this.toOptionalString(item?.title),
      message: this.toOptionalString(item?.message),
      incidentLocation: this.toOptionalString(item?.incidentLocation),
      aiSentimentScore: this.toNumber(item?.aiSentimentScore),
      urgencyLevel: this.toUrgency(item?.urgencyLevel),
      processingStatus: this.toProcessing(item?.processingStatus),
      adminResponse: this.toOptionalString(item?.adminResponse),
      respondedByAdminName: this.toOptionalString(item?.respondedByAdminName),
      respondedAt: this.toOptionalString(item?.respondedAt),
      createdAt: String(item?.createdAt ?? ''),
      updatedAt: String(item?.updatedAt ?? ''),
      ownerName: this.toOptionalString(item?.ownerName)
    };
  }

  private toFeedbackType(value: unknown): TravelFeedbackAdmin['feedbackType'] {
    const normalized = String(value ?? 'REVIEW').toUpperCase();
    if (
      normalized === 'REVIEW' ||
      normalized === 'SUGGESTION' ||
      normalized === 'INCIDENT' ||
      normalized === 'COMPLAINT'
    ) {
      return normalized;
    }

    return 'REVIEW';
  }

  private toUrgency(value: unknown): TravelFeedbackAdmin['urgencyLevel'] {
    const normalized = String(value ?? 'NORMAL').toUpperCase();
    if (normalized === 'HIGH' || normalized === 'CRITICAL' || normalized === 'NORMAL') {
      return normalized;
    }

    return 'NORMAL';
  }

  private toProcessing(value: unknown): TravelFeedbackAdmin['processingStatus'] {
    const normalized = String(value ?? 'PENDING').toUpperCase();
    if (
      normalized === 'PENDING' ||
      normalized === 'IN_PROGRESS' ||
      normalized === 'RESOLVED' ||
      normalized === 'CLOSED'
    ) {
      return normalized;
    }

    return 'PENDING';
  }

  private toOptionalString(value: unknown): string | undefined {
    const normalized = String(value ?? '').trim();
    return normalized ? normalized : undefined;
  }

  private toOptionalNumber(value: unknown): number | undefined {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private toNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private toTimestamp(value: string): number {
    const parsed = Date.parse(String(value ?? ''));
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private toError(error: unknown, fallback: string): Error {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return new Error('Unable to reach server. Please check your connection.');
      }

      const payload = error.error;
      if (typeof payload === 'string' && payload.trim()) {
        return new Error(payload.trim());
      }

      if (payload && typeof payload === 'object') {
        const candidate = payload as Record<string, unknown>;
        const serverMessage = candidate['message'] ?? candidate['error'];
        if (typeof serverMessage === 'string' && serverMessage.trim()) {
          return new Error(serverMessage.trim());
        }
      }

      if (error.message) {
        return new Error(error.message);
      }
    }

    return new Error(fallback);
  }
}
