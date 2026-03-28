import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import {
  RequiredDocumentType,
  SafetyStatus,
  TransportType,
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

  constructor(private readonly http: HttpClient) {}

  createTravelPlan(payload: TravelPlanCreateRequest): Observable<TravelPlan> {
    const requestUrl = this.apiUrl;
    const headers = this.userHeaders();
    console.log('TravelPlanService.createTravelPlan URL:', requestUrl);
    console.log('TravelPlanService.createTravelPlan headers:', this.headersToObject(headers));
    console.log('TravelPlanService.createTravelPlan payload:', payload);

    return this.http
      .post<TravelPlan>(requestUrl, payload, { headers })
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
    const requestUrl = `${this.apiUrl}/${id}`;
    const headers = this.userHeaders();
    console.log('TravelPlanService.getTravelPlanById URL:', requestUrl);
    console.log('TravelPlanService.getTravelPlanById headers:', this.headersToObject(headers));
    console.log('TravelPlanService.getTravelPlanById payload:', null);

    return this.http
      .get<TravelPlan>(requestUrl, { headers })
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

  submitTravelPlan(id: number): Observable<TravelPlan> {
    return this.http
      .post<TravelPlan>(`${this.apiUrl}/${id}/submit`, {}, { headers: this.userHeaders() })
      .pipe(
        map((plan) => this.normalizePlan(plan)),
        catchError((error) =>
          throwError(() =>
            this.toApiError(error, 'Unable to submit this travel plan right now. Please try again.')
          )
        )
      );
  }

  getCurrentUserId(): string {
    const keys = ['elif_user', 'elif.session.user', 'userId'];

    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) {
        continue;
      }

      const trimmed = raw.trim();
      if (!trimmed) {
        continue;
      }

      if (/^\d+$/.test(trimmed)) {
        return trimmed;
      }

      try {
        const parsed = JSON.parse(trimmed) as { id?: number | string };
        if (parsed?.id === undefined || parsed.id === null) {
          continue;
        }

        const idAsString = String(parsed.id).trim();
        if (idAsString) {
          return idAsString;
        }
      } catch {
        continue;
      }
    }

    return '';
  }

  private userHeaders(): HttpHeaders {
    const userId = this.getCurrentUserId();
    const headers = new HttpHeaders({ 'X-User-Id': userId ?? '' });
    return headers;
  }

  private headersToObject(headers: HttpHeaders): Record<string, string | null> {
    return {
      'X-User-Id': headers.get('X-User-Id')
    };
  }

  private normalizeSummary(plan: TravelPlanSummary): TravelPlanSummary {
    const source = plan as Partial<TravelPlanSummary> & Record<string, unknown>;

    return {
      id: this.toNumber(source.id),
      destinationTitle: this.toText(source.destinationTitle, 'Untitled Destination'),
      destinationCountry: this.toText(source.destinationCountry, 'Unknown Country'),
      destinationRegion: this.toOptionalText(source.destinationRegion),
      destinationType: this.toOptionalText(source.destinationType),
      destinationCoverImageUrl: this.pickCoverImage(source),
      transportType: this.toTransportType(source.transportType),
      travelDate: this.toText(source.travelDate),
      returnDate: this.toOptionalText(source.returnDate),
      status: this.toTravelStatus(source.status),
      readinessScore: this.normalizeScore(source.readinessScore),
      safetyStatus: this.toSafetyStatus(source.safetyStatus),
      petId: this.toOptionalNumber(source.petId),
      petName: this.toOptionalText(source.petName),
      requiredDocuments: this.normalizeRequiredDocuments(source.requiredDocuments ?? source['requiredDocumentTypes']),
      createdAt: this.toText(source.createdAt)
    };
  }

  private normalizePlan(plan: TravelPlan): TravelPlan {
    const source = plan as Partial<TravelPlan> & Record<string, unknown>;

    return {
      id: this.toNumber(source.id),
      ownerId: this.toNumber(source.ownerId),
      ownerName: this.toOptionalText(source.ownerName),
      petId: this.toNumber(source.petId),
      petName: this.toOptionalText(source.petName),
      destinationId: this.toNumber(source.destinationId),
      destinationTitle: this.toText(source.destinationTitle, 'Untitled Destination'),
      destinationCountry: this.toText(source.destinationCountry, 'Unknown Country'),
      destinationRegion: this.toOptionalText(source.destinationRegion),
      destinationType: this.toOptionalText(source.destinationType),
      destinationCoverImageUrl: this.pickCoverImage(source),
      requiredDocuments: this.normalizeRequiredDocuments(source.requiredDocuments ?? source['requiredDocumentTypes']),
      origin: this.toText(source.origin),
      transportType: this.toTransportType(source.transportType) ?? 'CAR',
      travelDate: this.toText(source.travelDate),
      returnDate: this.toText(source.returnDate),
      estimatedTravelHours: this.toNumber(source.estimatedTravelHours),
      estimatedTravelCost: this.toNumber(source.estimatedTravelCost),
      currency: this.toText(source.currency, 'USD').toUpperCase(),
      animalWeight: this.toNumber(source.animalWeight),
      cageLength: this.toNumber(source.cageLength),
      cageWidth: this.toNumber(source.cageWidth),
      cageHeight: this.toNumber(source.cageHeight),
      hydrationIntervalMinutes: this.toNumber(source.hydrationIntervalMinutes),
      requiredStops: this.toNumber(source.requiredStops),
      readinessScore: this.normalizeScore(source.readinessScore),
      safetyStatus: this.toSafetyStatus(source.safetyStatus),
      status: this.toTravelStatus(source.status),
      adminDecisionComment: this.toOptionalText(source.adminDecisionComment ?? source['adminComment']),
      reviewedByAdminName: this.toOptionalText(source.reviewedByAdminName ?? source['reviewedBy']),
      submittedAt: this.toOptionalText(source.submittedAt),
      reviewedAt: this.toOptionalText(source.reviewedAt),
      createdAt: this.toText(source.createdAt),
      updatedAt: this.toText(source.updatedAt)
    };
  }

  private normalizeRequiredDocuments(value: unknown): RequiredDocumentType[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => String(item ?? '').trim())
      .filter((item) => item.length > 0)
      .filter((item): item is RequiredDocumentType =>
        [
          'PET_PASSPORT',
          'RABIES_VACCINE',
          'HEALTH_CERTIFICATE',
          'TRANSPORT_AUTHORIZATION'
        ].includes(item)
      );
  }

  private pickCoverImage(source: Record<string, unknown>): string | undefined {
    const candidates = [
      source['destinationCoverImageUrl'],
      source['coverImageUrl'],
      source['destinationImageUrl']
    ];

    for (const candidate of candidates) {
      const normalized = this.toOptionalText(candidate);
      if (normalized) {
        return normalized;
      }
    }

    return undefined;
  }

  private normalizeScore(score: unknown): number {
    const normalized = Number(score ?? 0);
    if (Number.isNaN(normalized)) {
      return 0;
    }

    return Math.min(100, Math.max(0, Math.round(normalized)));
  }

  private toTransportType(value: unknown): TransportType | undefined {
    const normalized = String(value ?? '').trim().toUpperCase();
    const supported: TransportType[] = ['CAR', 'TRAIN', 'PLANE', 'BUS'];
    return supported.find((item) => item === normalized);
  }

  private toTravelStatus(value: unknown): TravelPlanStatus {
    const normalized = String(value ?? '').trim().toUpperCase();
    const supported: TravelPlanStatus[] = [
      'DRAFT',
      'IN_PREPARATION',
      'SUBMITTED',
      'APPROVED',
      'REJECTED',
      'COMPLETED',
      'CANCELLED'
    ];

    return supported.find((item) => item === normalized) ?? 'DRAFT';
  }

  private toSafetyStatus(value: unknown): SafetyStatus {
    const normalized = String(value ?? '').trim().toUpperCase();
    const supported: SafetyStatus[] = ['PENDING', 'VALID', 'ALERT', 'INVALID'];
    return supported.find((item) => item === normalized) ?? 'PENDING';
  }

  private toText(value: unknown, fallback = ''): string {
    const normalized = String(value ?? '').trim();
    return normalized || fallback;
  }

  private toOptionalText(value: unknown): string | undefined {
    const normalized = String(value ?? '').trim();
    return normalized || undefined;
  }

  private toNumber(value: unknown): number {
    const normalized = Number(value ?? 0);
    if (Number.isNaN(normalized)) {
      return 0;
    }

    return normalized;
  }

  private toOptionalNumber(value: unknown): number | undefined {
    const normalized = Number(value ?? NaN);
    if (Number.isNaN(normalized)) {
      return undefined;
    }

    return normalized;
  }

  private toApiError(error: unknown, fallbackMessage: string): TravelPlanApiError {
    if (!(error instanceof HttpErrorResponse)) {
      return new TravelPlanApiError(fallbackMessage);
    }

    if (error.status === 0) {
      return new TravelPlanApiError('Unable to reach the travel plan service. Please check your connection.');
    }

    if (error.status === 400 && !this.getCurrentUserId()) {
      return new TravelPlanApiError('Missing user session. Please sign in again and try again.');
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












