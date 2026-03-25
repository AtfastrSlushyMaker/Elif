import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import {
  Destination,
  DestinationStatusFilter,
  DestinationType,
  DocumentType,
  TransportType
} from '../../models/destination.model';
import { DestinationService } from '../../services/destination.service';

@Component({
  selector: 'app-destinations-list',
  templateUrl: './destinations-list.component.html',
  styleUrl: './destinations-list.component.scss'
})
export class DestinationsListComponent implements OnInit, OnDestroy {
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly statusFilters: DestinationStatusFilter[] = ['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'];
  readonly placeholderCover = 'images/logo/logo-cropped-transparent.png';

  allDestinations: Destination[] = [];
  filteredDestinations: Destination[] = [];
  activeStatusFilter: DestinationStatusFilter = 'ALL';
  loading = true;
  errorMessage = '';

  private readonly destroy$ = new Subject<void>();
  private readonly typeFallbackImage: Record<DestinationType, string> = {
    BEACH: 'images/stock/happy-dog-owner.jpg',
    MOUNTAIN: 'images/stock/vet-with-dog.jpg',
    CITY: 'images/stock/vet-examining.jpg',
    FOREST: 'images/stock/kitten.jpg',
    ROAD_TRIP: 'images/stock/golden-retriever.jpg',
    INTERNATIONAL: 'images/stock/vet-with-dog.jpg'
  };

  constructor(private readonly destinationService: DestinationService) {}

  ngOnInit(): void {
    this.loadDestinations();

    this.searchControl.valueChanges
      .pipe(debounceTime(120), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get totalCount(): number {
    return this.allDestinations.length;
  }

  get publishedCount(): number {
    return this.allDestinations.filter((destination) => destination.status === 'PUBLISHED').length;
  }

  get draftCount(): number {
    return this.allDestinations.filter((destination) => destination.status === 'DRAFT').length;
  }

  get archivedCount(): number {
    return this.allDestinations.filter((destination) => destination.status === 'ARCHIVED').length;
  }

  setStatusFilter(filter: DestinationStatusFilter): void {
    this.activeStatusFilter = filter;
    this.applyFilters();
  }

  isActiveFilter(filter: DestinationStatusFilter): boolean {
    return this.activeStatusFilter === filter;
  }

  trackByDestinationId(index: number, destination: Destination): number {
    return destination.id ?? index;
  }

  formatFilterLabel(filter: DestinationStatusFilter): string {
    if (filter === 'ALL') {
      return 'All';
    }
    return filter.charAt(0) + filter.slice(1).toLowerCase();
  }

  getDestinationTypeIcon(destinationType: DestinationType): string {
    switch (destinationType) {
      case 'BEACH':
        return 'fa-umbrella-beach';
      case 'MOUNTAIN':
        return 'fa-mountain';
      case 'CITY':
        return 'fa-city';
      case 'FOREST':
        return 'fa-tree';
      case 'ROAD_TRIP':
        return 'fa-road';
      case 'INTERNATIONAL':
      default:
        return 'fa-globe';
    }
  }

  getTransportIcon(transportType: TransportType): string {
    switch (transportType) {
      case 'CAR':
        return 'fa-car-side';
      case 'TRAIN':
        return 'fa-train';
      case 'PLANE':
        return 'fa-plane-departure';
      case 'BUS':
      default:
        return 'fa-bus';
    }
  }

  formatDestinationType(destinationType: DestinationType): string {
    return this.destinationService.formatDestinationType(destinationType);
  }

  formatTransportType(transportType: TransportType): string {
    return this.destinationService.formatTransportType(transportType);
  }

  getDocumentPreview(destination: Destination): string[] {
    return destination.requiredDocuments
      .slice(0, 2)
      .map((documentType) => this.destinationService.formatDocumentShort(documentType));
  }

  hasMoreDocuments(destination: Destination): boolean {
    return destination.requiredDocuments.length > 2;
  }

  remainingDocumentCount(destination: Destination): number {
    return Math.max(destination.requiredDocuments.length - 2, 0);
  }

  getCardDateLabel(destination: Destination): string {
    if (destination.status === 'PUBLISHED' && destination.publishedAt) {
      return 'Published on';
    }
    if (destination.status === 'SCHEDULED' && destination.scheduledPublishAt) {
      return 'Scheduled for';
    }
    return 'Created on';
  }

  getCardDateValue(destination: Destination): string | undefined {
    if (destination.status === 'PUBLISHED' && destination.publishedAt) {
      return destination.publishedAt;
    }
    if (destination.status === 'SCHEDULED' && destination.scheduledPublishAt) {
      return destination.scheduledPublishAt;
    }
    return destination.createdAt;
  }

  resolveCoverImage(destination: Destination): string {
    const explicitCover = destination.coverImageUrl.trim();
    if (explicitCover.length > 0) {
      return explicitCover;
    }

    return this.typeFallbackImage[destination.destinationType] ?? this.placeholderCover;
  }

  onCoverImageError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    if (!image) {
      return;
    }
    image.src = this.placeholderCover;
  }

  private loadDestinations(): void {
    this.loading = true;
    this.errorMessage = '';

    this.destinationService
      .getAdminDestinations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (destinations) => {
          this.allDestinations = destinations;
          this.applyFilters();
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.errorMessage =
            'Unable to load destinations right now. Please refresh and try again.';
        }
      });
  }

  private applyFilters(): void {
    const searchText = this.searchControl.value.trim().toLowerCase();

    this.filteredDestinations = this.allDestinations.filter((destination) => {
      const matchesStatus =
        this.activeStatusFilter === 'ALL' || destination.status === this.activeStatusFilter;

      const matchesSearch =
        searchText.length === 0 ||
        [destination.title, destination.country, destination.region].some((field) =>
          field.toLowerCase().includes(searchText)
        );

      return matchesStatus && matchesSearch;
    });
  }

  protected readonly documentType = (documentType: DocumentType): string =>
    this.destinationService.formatDocumentType(documentType);
}

