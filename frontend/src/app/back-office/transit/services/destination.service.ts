import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, delay, map, of, tap } from 'rxjs';
import {
  Destination,
  DestinationCreateRequest,
  DestinationType,
  DocumentType,
  TransportType
} from '../models/destination.model';

@Injectable({ providedIn: 'root' })
export class DestinationService {
  private readonly baseApi = 'http://localhost:8087/elif/api/destinations';
  private readonly destinationsSubject = new BehaviorSubject<Destination[]>(this.seedMockDestinations());

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

  getAdminDestinations(): Observable<Destination[]> {
    // Future real endpoint: GET /elif/api/destinations/admin/all
    return this.destinationsSubject.asObservable().pipe(
      map((destinations) =>
        [...destinations].sort((first, second) =>
          (second.createdAt ?? '').localeCompare(first.createdAt ?? '')
        )
      ),
      delay(320)
    );
  }

  createDestination(payload: DestinationCreateRequest): Observable<Destination> {
    // Future real endpoint: POST /elif/api/destinations
    const now = new Date();
    const scheduledDate = new Date(now);
    scheduledDate.setDate(scheduledDate.getDate() + 10);

    const createdDestination: Destination = {
      id: this.nextId(),
      ...payload,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      publishedAt: payload.status === 'PUBLISHED' ? now.toISOString() : null,
      scheduledPublishAt:
        payload.status === 'SCHEDULED' ? scheduledDate.toISOString() : null
    };

    return of(createdDestination).pipe(
      delay(900),
      tap((destination) => {
        // Keep this console output while we are in mock mode.
        console.log('[Transit][Mock POST]', `${this.baseApi}`, destination);
        this.destinationsSubject.next([destination, ...this.destinationsSubject.value]);
      })
    );
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

  private nextId(): number {
    const ids = this.destinationsSubject.value.map((destination) => destination.id ?? 0);
    const currentMax = ids.length > 0 ? Math.max(...ids) : 0;
    return currentMax + 1;
  }

  private titleCase(value: string): string {
    return value
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private seedMockDestinations(): Destination[] {
    return [
      {
        id: 101,
        title: 'Azur Coast Escape',
        country: 'France',
        region: "Cote d'Azur",
        destinationType: 'BEACH',
        recommendedTransportType: 'CAR',
        petFriendlyLevel: 5,
        description:
          'A premium seaside itinerary with multiple pet-friendly hotels, shaded beaches, and hydration stations.',
        safetyTips:
          'Avoid noon heat, carry travel-sized cooling mats, and schedule hydration stops every 90 minutes.',
        requiredDocuments: ['PET_PASSPORT', 'RABIES_VACCINE'],
        coverImageUrl: 'images/stock/happy-dog-owner.jpg',
        latitude: 43.7102,
        longitude: 7.262,
        status: 'PUBLISHED',
        createdAt: '2026-02-14T09:18:00Z',
        publishedAt: '2026-02-18T13:00:00Z',
        updatedAt: '2026-02-18T13:00:00Z',
        scheduledPublishAt: null
      },
      {
        id: 102,
        title: 'Nordic Alpine Route',
        country: 'Switzerland',
        region: 'Bernese Highlands',
        destinationType: 'MOUNTAIN',
        recommendedTransportType: 'TRAIN',
        petFriendlyLevel: 4,
        description:
          'Scenic high-altitude journey with controlled climate cabins and mountain-safe boarding points.',
        safetyTips:
          'Monitor altitude reactions, carry vet-approved anti-stress support, and confirm rest shelters in advance.',
        requiredDocuments: ['PET_PASSPORT', 'HEALTH_CERTIFICATE', 'RABIES_VACCINE'],
        coverImageUrl: 'images/stock/vet-with-dog.jpg',
        latitude: 46.6863,
        longitude: 7.8632,
        status: 'SCHEDULED',
        createdAt: '2026-03-02T10:00:00Z',
        publishedAt: null,
        updatedAt: '2026-03-20T11:40:00Z',
        scheduledPublishAt: '2026-04-03T08:30:00Z'
      },
      {
        id: 103,
        title: 'Metropolitan Pet Circuit',
        country: 'Germany',
        region: 'Berlin',
        destinationType: 'CITY',
        recommendedTransportType: 'BUS',
        petFriendlyLevel: 3,
        description:
          'Urban route focused on public transport comfort, indoor walking alternatives, and emergency clinics.',
        safetyTips:
          'Use secure harnesses in crowded stations, avoid rush-hour transit, and keep digital medical records ready.',
        requiredDocuments: ['RABIES_VACCINE', 'TRANSPORT_AUTHORIZATION'],
        coverImageUrl: 'images/stock/vet-examining.jpg',
        latitude: 52.52,
        longitude: 13.405,
        status: 'DRAFT',
        createdAt: '2026-03-10T15:40:00Z',
        publishedAt: null,
        updatedAt: '2026-03-18T12:00:00Z',
        scheduledPublishAt: null
      },
      {
        id: 104,
        title: 'Forest Trail Residency',
        country: 'Canada',
        region: 'British Columbia',
        destinationType: 'FOREST',
        recommendedTransportType: 'CAR',
        petFriendlyLevel: 4,
        description:
          'Long-distance woodland transit with monitored stops and certified eco-lodges for pets.',
        safetyTips:
          'Carry anti-tick kits, keep pets leashed in unknown trails, and track weather alerts.',
        requiredDocuments: ['PET_PASSPORT', 'HEALTH_CERTIFICATE'],
        coverImageUrl: '',
        latitude: 53.7267,
        longitude: -127.6476,
        status: 'ARCHIVED',
        createdAt: '2025-12-03T08:25:00Z',
        publishedAt: '2025-12-11T09:00:00Z',
        updatedAt: '2026-02-06T14:10:00Z',
        scheduledPublishAt: null
      },
      {
        id: 105,
        title: 'Intercontinental Transit Corridor',
        country: 'United Arab Emirates',
        region: 'Dubai',
        destinationType: 'INTERNATIONAL',
        recommendedTransportType: 'PLANE',
        petFriendlyLevel: 5,
        description:
          'International air corridor package with multi-country document checklist and cabin/crate readiness guidance.',
        safetyTips:
          'Confirm airline pet policies, scan all certificates before departure, and bring approved calming accessories.',
        requiredDocuments: [
          'PET_PASSPORT',
          'RABIES_VACCINE',
          'HEALTH_CERTIFICATE',
          'TRANSPORT_AUTHORIZATION'
        ],
        coverImageUrl: 'images/stock/golden-retriever.jpg',
        latitude: 25.2048,
        longitude: 55.2708,
        status: 'PUBLISHED',
        createdAt: '2026-01-19T09:50:00Z',
        publishedAt: '2026-01-24T12:15:00Z',
        updatedAt: '2026-01-24T12:15:00Z',
        scheduledPublishAt: null
      }
    ];
  }
}
