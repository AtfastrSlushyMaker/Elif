import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import {
  SafetyStatus,
  TravelPlan,
  TravelPlanCreateRequest,
  TravelPlanStatus,
  TravelPlanSummary,
  TravelPlanUpdateRequest
} from '../models/travel-plan.model';

export interface TravelPlanValidationIssue {
  field: string;
  message: string;
}

export class TravelPlanApiError extends Error {
  constructor(
    message: string,
    public readonly validationIssues: TravelPlanValidationIssue[] = []
  ) {
    super(message);
    this.name = 'TravelPlanApiError';
  }
}

@Injectable({ providedIn: 'root' })
export class TravelPlanService {
  private readonly apiUrl = 'http://localhost:8087/elif/api/travel-plans';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  createTravelPlan(payload: TravelPlanCreateRequest): Observable<TravelPlan> {
    return this.http
      .post<TravelPlan>(this.apiUrl, payload, { headers: this.userHeaders() })
      .pipe(
        map((plan) => this.normalizePlan(plan)),
        catchError((error) =>
          throwError(() =>
            this.toApiError(error, 'Unable to create your travel plan right now. Please try again.')
          )
        )
      );
  }

  getMyTravelPlans(): Observable<TravelPlanSummary[]> {
    return this.http
      .get<TravelPlanSummary[]>(`${this.apiUrl}/my`, { headers: this.userHeaders() })
      .pipe(
        map((plans) => (plans ?? []).map((plan) => this.normalizeSummary(plan))),
        catchError((error) =>
          throwError(() =>
            this.toApiError(error, 'Unable to load your travel plans right now. Please try again.')
          )
        )
      );
  }

  getTravelPlanById(id: number): Observable<TravelPlan> {
    return this.http
      .get<TravelPlan>(`${this.apiUrl}/${id}`, { headers: this.userHeaders() })
      .pipe(
        map((plan) => this.normalizePlan(plan)),
        catchError((error) =>
          throwError(() =>
            this.toApiError(error, 'Unable to load travel plan details right now. Please try again.')
          )
        )
      );
  }

  updateTravelPlan(id: number, payload: TravelPlanUpdateRequest): Observable<TravelPlan> {
    return this.http
      .put<TravelPlan>(`${this.apiUrl}/${id}`, payload, { headers: this.userHeaders() })
      .pipe(
        map((plan) => this.normalizePlan(plan)),
        catchError((error) =>
          throwError(() =>
            this.toApiError(error, 'Unable to update this travel plan right now. Please try again.')
          )
        )
      );
  }

  deleteTravelPlan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.userHeaders() }).pipe(
      catchError((error) =>
        throwError(() =>
          this.toApiError(error, 'Unable to delete this travel plan right now. Please try again.')
        )
      )
    );
  }

  // Prepared for future workflow actions.
  submitTravelPlan(id: number): Observable<TravelPlan> {
    return this.http
      .post<TravelPlan>(`${this.apiUrl}/${id}/submit`, {}, { headers: this.userHeaders() })
      .pipe(map((plan) => this.normalizePlan(plan)));
  }

  completeTravelPlan(id: number): Observable<TravelPlan> {
    return this.http
      .post<TravelPlan>(`${this.apiUrl}/${id}/complete`, {}, { headers: this.userHeaders() })
      .pipe(map((plan) => this.normalizePlan(plan)));
  }

  cancelTravelPlan(id: number): Observable<TravelPlan> {
    return this.http
      .post<TravelPlan>(`${this.apiUrl}/${id}/cancel`, {}, { headers: this.userHeaders() })
      .pipe(map((plan) => this.normalizePlan(plan)));
  }

  private userHeaders(): HttpHeaders {
    const userId = this.authService.getCurrentUser()?.id ?? 0;
    return new HttpHeaders({ 'X-User-Id': String(userId) });
  }

  private normalizeSummary(plan: TravelPlanSummary): TravelPlanSummary {
    return {
      id: Number(plan.id ?? 0),
      destinationTitle: (plan.destinationTitle ?? '').trim() || 'Untitled Destination',
      destinationCountry: (plan.destinationCountry ?? '').trim() || 'Unknown Country',
      travelDate: plan.travelDate ?? '',
      status: (plan.status ?? 'DRAFT') as TravelPlanStatus,
      readinessScore: this.normalizeScore(plan.readinessScore),
      safetyStatus: (plan.safetyStatus ?? 'PENDING') as SafetyStatus,
      createdAt: plan.createdAt ?? ''
    };
  }

  private normalizePlan(plan: TravelPlan): TravelPlan {
    return {
      id: Number(plan.id ?? 0),
      ownerId: Number(plan.ownerId ?? 0),
      ownerName: (plan.ownerName ?? '').trim(),
      petId: Number(plan.petId ?? 0),
      destinationId: Number(plan.destinationId ?? 0),
      destinationTitle: (plan.destinationTitle ?? '').trim() || 'Untitled Destination',
      destinationCountry: (plan.destinationCountry ?? '').trim() || 'Unknown Country',
      origin: (plan.origin ?? '').trim(),
      transportType: plan.transportType ?? 'CAR',
      travelDate: plan.travelDate ?? '',
      returnDate: plan.returnDate ?? '',
      estimatedTravelHours: Number(plan.estimatedTravelHours ?? 0),
      estimatedTravelCost: Number(plan.estimatedTravelCost ?? 0),
      currency: (plan.currency ?? 'USD').trim().toUpperCase(),
      animalWeight: Number(plan.animalWeight ?? 0),
      cageLength: Number(plan.cageLength ?? 0),
      cageWidth: Number(plan.cageWidth ?? 0),
      cageHeight: Number(plan.cageHeight ?? 0),
      hydrationIntervalMinutes: Number(plan.hydrationIntervalMinutes ?? 0),
      requiredStops: Number(plan.requiredStops ?? 0),
      readinessScore: this.normalizeScore(plan.readinessScore),
      safetyStatus: (plan.safetyStatus ?? 'PENDING') as SafetyStatus,
      status: (plan.status ?? 'DRAFT') as TravelPlanStatus,
      adminDecisionComment: (plan.adminDecisionComment ?? '').trim(),
      reviewedByAdminName: (plan.reviewedByAdminName ?? '').trim(),
      submittedAt: plan.submittedAt ?? '',
      reviewedAt: plan.reviewedAt ?? '',
      createdAt: plan.createdAt ?? '',
      updatedAt: plan.updatedAt ?? ''
    };
  }

  private normalizeScore(score: number | null | undefined): number {
    const normalized = Number(score ?? 0);
    if (Number.isNaN(normalized)) {
      return 0;
    }

    return Math.min(100, Math.max(0, normalized));
  }

  private toApiError(error: unknown, fallbackMessage: string): TravelPlanApiError {
    if (!(error instanceof HttpErrorResponse)) {
      return new TravelPlanApiError(fallbackMessage);
    }

    if (error.status === 0) {
      return new TravelPlanApiError('Unable to reach the travel plan service. Please check your connection.');
    }

    const raw = error.error;
    const issues = this.extractValidationIssues(raw);

    const explicitMessage = this.extractMessage(raw);
    const message = explicitMessage || fallbackMessage;

    return new TravelPlanApiError(message, issues);
  }

  private extractMessage(raw: unknown): string {
    if (typeof raw === 'string' && raw.trim()) {
      return raw.trim();
    }

    if (!raw || typeof raw !== 'object') {
      return '';
    }

    const candidate = raw as Record<string, unknown>;
    const message = candidate['message'];
    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }

    const error = candidate['error'];
    if (typeof error === 'string' && error.trim()) {
      return error.trim();
    }

    return '';
  }

  private extractValidationIssues(raw: unknown): TravelPlanValidationIssue[] {
    if (!raw || typeof raw !== 'object') {
      return [];
    }

    const payload = raw as Record<string, unknown>;
    const sources = [
      payload['errors'],
      payload['fieldErrors'],
      payload['validationErrors'],
      payload['violations'],
      payload['details']
    ];

    const issues: TravelPlanValidationIssue[] = [];

    for (const source of sources) {
      if (Array.isArray(source)) {
        for (const entry of source) {
          if (typeof entry === 'string' && entry.trim()) {
            issues.push({ field: '', message: entry.trim() });
            continue;
          }

          if (entry && typeof entry === 'object') {
            const item = entry as Record<string, unknown>;
            const field = String(
              item['field'] ?? item['fieldName'] ?? item['property'] ?? item['path'] ?? ''
            ).trim();
            const message = String(
              item['message'] ?? item['defaultMessage'] ?? item['errorMessage'] ?? ''
            ).trim();

            if (message) {
              issues.push({ field, message });
            }
          }
        }
      } else if (source && typeof source === 'object') {
        for (const [field, value] of Object.entries(source as Record<string, unknown>)) {
          if (typeof value === 'string' && value.trim()) {
            issues.push({ field, message: value.trim() });
            continue;
          }

          if (Array.isArray(value)) {
            value
              .map((item) => String(item ?? '').trim())
              .filter((item) => item.length > 0)
              .forEach((message) => {
                issues.push({ field, message });
              });
          }
        }
      }
    }

    return issues;
  }
}
