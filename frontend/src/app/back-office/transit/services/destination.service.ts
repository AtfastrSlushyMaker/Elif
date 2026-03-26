import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import {
  Destination,
  DestinationCreateRequest,
  DestinationUpdateRequest,
  DestinationStatus,
  DestinationType,
  DocumentType,
  TransportType
} from '../models/destination.model';

@Injectable({ providedIn: 'root' })
export class DestinationService {
  private readonly baseApi = 'http://localhost:8087/elif/api/destinations';
  private readonly backendHost = 'http://localhost:8087';
  private readonly backendContext = '/elif';

  readonly destinationTypes: DestinationType[] = [
    'BEACH',
    'MOUNTAIN',
    'CITY',
    'FOREST',
    'ROAD_TRIP',
    'INTERNATIONAL'
  ];

  readonly transportTypes: TransportType[] = ['CAR', 'TRAIN', 'PLANE', 'BUS'];

  readonly documentTypes: DocumentType[] = [
    'PET_PASSPORT',
    'RABIES_VACCINE',
    'HEALTH_CERTIFICATE',
    'TRANSPORT_AUTHORIZATION'
  ];

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  getAdminDestinations(): Observable<Destination[]> {
    return this.withAdminHeaders((headers) =>
      this.http.get<Destination[]>(`${this.baseApi}/admin/all`, { headers })
    ).pipe(
      map((destinations) =>
        destinations
          .map((destination) => this.normalizeDestination(destination))
          .sort((first, second) => (second.createdAt ?? '').localeCompare(first.createdAt ?? ''))
      )
    );
  }

  getDestinationById(destinationId: number): Observable<Destination> {
    return this.withAdminHeaders((headers) =>
      this.http.get<Destination>(`${this.baseApi}/admin/${destinationId}`, { headers })
    ).pipe(map((destination) => this.normalizeDestination(destination)));
  }

  createDestination(
    payload: DestinationCreateRequest,
    coverImageFile?: File | null
  ): Observable<Destination> {
    const formData = this.buildDestinationMultipartPayload(payload, coverImageFile);

    return this.withAdminHeaders((headers) =>
      this.http.post<Destination>(`${this.baseApi}`, formData, { headers })
    ).pipe(map((destination) => this.normalizeDestination(destination)));
  }

  updateDestination(
    destinationId: number,
    payload: DestinationUpdateRequest,
    coverImageFile?: File | null
  ): Observable<Destination> {
    const formData = this.buildDestinationMultipartPayload(payload, coverImageFile);

    return this.withAdminHeaders((headers) =>
      this.http.put<Destination>(`${this.baseApi}/${destinationId}`, formData, { headers })
    ).pipe(map((destination) => this.normalizeDestination(destination)));
  }

  deleteDestination(destinationId: number): Observable<void> {
    return this.withAdminHeaders((headers) =>
      this.http.delete<void>(`${this.baseApi}/${destinationId}`, { headers })
    );
  }

  archiveDestination(destinationId: number): Observable<Destination> {
    return this.withAdminHeaders((headers) =>
      this.http.post<Destination>(`${this.baseApi}/${destinationId}/archive`, null, { headers })
    ).pipe(map((destination) => this.normalizeDestination(destination)));
  }

  unarchiveDestination(destinationId: number): Observable<Destination> {
    return this.withAdminHeaders((headers) =>
      this.http.post<Destination>(`${this.baseApi}/${destinationId}/unarchive`, null, { headers })
    ).pipe(
      map((destination) => this.normalizeDestination(destination)),
      catchError((error: unknown) => {
        if (
          error instanceof HttpErrorResponse &&
          (error.status === 404 || error.status === 405 || error.status === 501)
        ) {
          return this.publishDestination(destinationId);
        }
        return throwError(() => error);
      })
    );
  }

  moveDestinationToDraft(destinationId: number): Observable<Destination> {
    return this.withAdminHeaders((headers) =>
      this.http.post<Destination>(`${this.baseApi}/${destinationId}/draft`, null, { headers })
    ).pipe(
      map((destination) => this.normalizeDestination(destination)),
      catchError((error: unknown) => {
        if (
          error instanceof HttpErrorResponse &&
          (error.status === 404 || error.status === 405 || error.status === 501)
        ) {
          return throwError(
            () => new Error('Move to draft is not supported by the current backend API.')
          );
        }
        return throwError(() => error);
      })
    );
  }

  publishDestination(destinationId: number): Observable<Destination> {
    return this.withAdminHeaders((headers) =>
      this.http.post<Destination>(`${this.baseApi}/${destinationId}/publish`, null, { headers })
    ).pipe(map((destination) => this.normalizeDestination(destination)));
  }

  scheduleDestination(destinationId: number, scheduledAt: string): Observable<Destination> {
    const params = new HttpParams().set('scheduledAt', this.toIsoLocalDateTime(scheduledAt));

    return this.withAdminHeaders((headers) =>
      this.http.post<Destination>(`${this.baseApi}/${destinationId}/schedule`, null, {
        headers,
        params
      })
    ).pipe(map((destination) => this.normalizeDestination(destination)));
  }

  formatDestinationType(type: DestinationType): string {
    switch (type) {
      case 'ROAD_TRIP':
        return 'Road Trip';
      default:
        return this.titleCase(type);
    }
  }

  formatTransportType(type: TransportType): string {
    return this.titleCase(type);
  }

  formatDocumentType(documentType: DocumentType): string {
    switch (documentType) {
      case 'PET_PASSPORT':
        return 'Pet Passport';
      case 'RABIES_VACCINE':
        return 'Rabies Vaccine';
      case 'HEALTH_CERTIFICATE':
        return 'Health Certificate';
      case 'TRANSPORT_AUTHORIZATION':
        return 'Transport Authorization';
      default:
        return this.titleCase(documentType);
    }
  }

  formatDocumentShort(documentType: DocumentType): string {
    switch (documentType) {
      case 'PET_PASSPORT':
        return 'Passport';
      case 'RABIES_VACCINE':
        return 'Vaccine';
      case 'HEALTH_CERTIFICATE':
        return 'Health Cert.';
      case 'TRANSPORT_AUTHORIZATION':
        return 'Authorization';
      default:
        return this.titleCase(documentType);
    }
  }

  resolveCoverImageUrl(coverImageUrl: string | null | undefined): string {
    const normalizedUrl = (coverImageUrl ?? '').trim();
    if (!normalizedUrl) {
      return '';
    }

    if (
      normalizedUrl.startsWith('http://') ||
      normalizedUrl.startsWith('https://') ||
      normalizedUrl.startsWith('data:') ||
      normalizedUrl.startsWith('blob:')
    ) {
      return normalizedUrl;
    }

    if (normalizedUrl.startsWith('/uploads/')) {
      return `${this.backendHost}${this.backendContext}${normalizedUrl}`;
    }

    if (normalizedUrl.startsWith('uploads/')) {
      return `${this.backendHost}${this.backendContext}/${normalizedUrl}`;
    }

    if (normalizedUrl.startsWith('/elif/')) {
      return `${this.backendHost}${normalizedUrl}`;
    }

    if (normalizedUrl.startsWith('/')) {
      return `${this.backendHost}${normalizedUrl}`;
    }

    return normalizedUrl;
  }

  private withAdminHeaders<T>(
    requestFactory: (headers: HttpHeaders) => Observable<T>
  ): Observable<T> {
    const currentUserId = this.authService.getCurrentUser()?.id;

    if (!currentUserId) {
      return throwError(() => new Error('Admin session not found. Please sign in again.'));
    }

    const headers = new HttpHeaders({ 'X-User-Id': String(currentUserId) });
    return requestFactory(headers);
  }

  private normalizeDestination(destination: Destination): Destination {
    const safeStatus: DestinationStatus = destination.status ?? 'DRAFT';

    return {
      ...destination,
      status: safeStatus,
      coverImageUrl: destination.coverImageUrl ?? '',
      requiredDocuments: (destination.requiredDocuments ?? []) as DocumentType[],
      scheduledPublishAt:
        destination.scheduledPublishAt ??
        destination.scheduledDate ??
        (destination as Destination & { scheduledAt?: string | null }).scheduledAt ??
        null,
      publishedAt: destination.publishedAt ?? null
    };
  }

  private buildDestinationMultipartPayload(
    payload: DestinationCreateRequest | DestinationUpdateRequest,
    coverImageFile?: File | null
  ): FormData {
    const formData = new FormData();
    const requestBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });

    formData.append('request', requestBlob);

    if (coverImageFile) {
      formData.append('coverImageFile', coverImageFile, coverImageFile.name);
    }

    return formData;
  }

  private toIsoLocalDateTime(dateTimeValue: string): string {
    if (dateTimeValue.length === 16) {
      return `${dateTimeValue}:00`;
    }
    return dateTimeValue;
  }

  private titleCase(value: string): string {
    return value
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
