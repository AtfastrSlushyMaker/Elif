import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import {
  DestinationType,
  TravelDestination,
  TravelDestinationSummary
} from '../models/travel-destination.model';

@Injectable({ providedIn: 'root' })
export class TravelDestinationService {
  private readonly apiUrl = 'http://localhost:8087/elif/api/destinations';
  private readonly backendHost = 'http://localhost:8087';
  private readonly backendContext = '/elif';

  constructor(private readonly http: HttpClient) {}

  getPublishedDestinations(): Observable<TravelDestinationSummary[]> {
    return this.http.get<TravelDestinationSummary[]>(this.apiUrl).pipe(
      map((destinations) =>
        (destinations ?? [])
          .map((destination) => this.normalizeSummary(destination))
          .filter((destination) => destination.status === 'PUBLISHED')
      ),
      catchError(() =>
        throwError(() => new Error('Unable to load destinations at the moment. Please try again.'))
      )
    );
  }

  getDestinationById(id: number): Observable<TravelDestination> {
    return this.http.get<TravelDestination>(`${this.apiUrl}/${id}`).pipe(
      map((destination) => this.normalizeDestination(destination)),
      catchError(() =>
        throwError(() =>
          new Error('Unable to load destination details right now. Please try again shortly.')
        )
      )
    );
  }

  getDestinationsByType(type: DestinationType): Observable<TravelDestinationSummary[]> {
    return this.getPublishedDestinations().pipe(
      map((destinations) =>
        destinations.filter((destination) => destination.destinationType === type)
      )
    );
  }

  private normalizeSummary(destination: TravelDestinationSummary): TravelDestinationSummary {
    return {
      ...destination,
      status: destination.status ?? 'PUBLISHED',
      coverImageUrl: this.resolveImageUrl(destination.coverImageUrl)
    };
  }

  private normalizeDestination(destination: TravelDestination): TravelDestination {
    return {
      ...destination,
      status: destination.status ?? 'PUBLISHED',
      region: destination.region ?? '',
      description: destination.description ?? '',
      safetyTips: destination.safetyTips ?? '',
      coverImageUrl: this.resolveImageUrl(destination.coverImageUrl),
      requiredDocuments: destination.requiredDocuments ?? [],
      carouselImages: (destination.carouselImages ?? [])
        .map((image, index) => ({
          ...image,
          displayOrder: image.displayOrder ?? index,
          imageUrl: this.resolveImageUrl(image.imageUrl)
        }))
        .filter((image) => image.imageUrl.length > 0)
        .sort((a, b) => a.displayOrder - b.displayOrder)
    };
  }

  private resolveImageUrl(imageUrl?: string): string {
    const normalized = (imageUrl ?? '').trim();
    if (!normalized) {
      return '';
    }

    if (
      normalized.startsWith('http://') ||
      normalized.startsWith('https://') ||
      normalized.startsWith('data:') ||
      normalized.startsWith('blob:')
    ) {
      return normalized;
    }

    if (normalized.startsWith('/uploads/')) {
      return `${this.backendHost}${this.backendContext}${normalized}`;
    }

    if (normalized.startsWith('uploads/')) {
      return `${this.backendHost}${this.backendContext}/${normalized}`;
    }

    if (normalized.startsWith('/elif/')) {
      return `${this.backendHost}${normalized}`;
    }

    if (normalized.startsWith('/')) {
      return `${this.backendHost}${normalized}`;
    }

    return normalized;
  }
}
