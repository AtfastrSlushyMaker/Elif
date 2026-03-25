import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, throwError } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import {
  Destination,
  DestinationCreateRequest,
  DestinationStatus,
  DestinationType,
  DocumentType,
  TransportType
} from '../models/destination.model';

@Injectable({ providedIn: 'root' })
export class DestinationService {
  private readonly baseApi = 'http://localhost:8087/elif/api/destinations';

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

  createDestination(
    payload: DestinationCreateRequest,
    coverImageFile?: File | null
  ): Observable<Destination> {
    const formData = new FormData();
    const requestBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    formData.append('request', requestBlob);

    if (coverImageFile) {
      formData.append('coverImageFile', coverImageFile, coverImageFile.name);
    }

    return this.withAdminHeaders((headers) =>
      this.http.post<Destination>(`${this.baseApi}`, formData, { headers })
    ).pipe(map((destination) => this.normalizeDestination(destination)));
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
      scheduledPublishAt: destination.scheduledPublishAt ?? destination.scheduledDate ?? null,
      publishedAt: destination.publishedAt ?? null
    };
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
