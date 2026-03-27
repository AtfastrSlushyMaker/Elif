import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';
import { PetFriendlyStarsComponent } from '../../components/pet-friendly-stars/pet-friendly-stars.component';
import {
  DESTINATION_TYPE_CONFIG,
  DOCUMENT_CONFIG,
  TRANSPORT_CONFIG,
  TravelDestination
} from '../../models/travel-destination.model';
import { TravelDestinationService } from '../../services/travel-destination.service';

type DocumentItem = {
  key: string;
  iconClass: string;
  label: string;
};

@Component({
  selector: 'app-destination-detail',
  standalone: true,
  imports: [CommonModule, PetFriendlyStarsComponent],
  templateUrl: './destination-detail.component.html',
  styleUrl: './destination-detail.component.scss'
})
export class DestinationDetailComponent implements OnInit, OnDestroy {
  readonly destinationTypeConfig = DESTINATION_TYPE_CONFIG;
  readonly transportConfig = TRANSPORT_CONFIG;

  readonly uiIcons = {
    back: 'fa-solid fa-arrow-left',
    alert: 'fa-solid fa-circle-exclamation',
    placeholder: 'fa-solid fa-paw',
    left: 'fa-solid fa-chevron-left',
    right: 'fa-solid fa-chevron-right',
    location: 'fa-solid fa-location-dot',
    calendar: 'fa-solid fa-calendar-days',
    documents: 'fa-solid fa-folder-open',
    tips: 'fa-solid fa-lightbulb',
    cta: 'fa-solid fa-plane-departure',
    forward: 'fa-solid fa-arrow-right'
  };

  destination: TravelDestination | null = null;
  documentItems: DocumentItem[] = [];

  heroImages: string[] = [];
  currentImageIndex = 0;

  loading = true;
  errorMessage = '';

  private currentDestinationId: number | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly travelDestinationService: TravelDestinationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const idValue = params.get('id');
      const destinationId = Number(idValue);

      if (!idValue || Number.isNaN(destinationId) || destinationId <= 0) {
        this.loading = false;
        this.errorMessage = 'Invalid destination selected. Please return to the catalog.';
        this.destination = null;
        this.documentItems = [];
        this.heroImages = [];
        return;
      }

      this.loadDestination(destinationId);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get hasMultipleImages(): boolean {
    return this.heroImages.length > 1;
  }

  goBack(): void {
    this.router.navigate(['/app/transit/destinations']);
  }

  retry(): void {
    if (this.currentDestinationId === null) {
      return;
    }

    this.loadDestination(this.currentDestinationId);
  }

  planTrip(): void {
    if (!this.destination) {
      return;
    }

    this.router.navigate(['/pet-transit/plans/new'], {
      queryParams: { destinationId: this.destination.id }
    });
  }

  showPreviousImage(): void {
    if (!this.hasMultipleImages) {
      return;
    }

    this.currentImageIndex =
      this.currentImageIndex === 0 ? this.heroImages.length - 1 : this.currentImageIndex - 1;
  }

  showNextImage(): void {
    if (!this.hasMultipleImages) {
      return;
    }

    this.currentImageIndex =
      this.currentImageIndex >= this.heroImages.length - 1 ? 0 : this.currentImageIndex + 1;
  }

  selectImage(index: number): void {
    if (index < 0 || index >= this.heroImages.length) {
      return;
    }

    this.currentImageIndex = index;
  }

  trackByImage(index: number): number {
    return index;
  }

  trackByDocument(index: number, document: DocumentItem): string {
    return `${document.key}-${index}`;
  }

  typeIconClass(): string {
    if (!this.destination) {
      return 'fa-solid fa-compass';
    }

    return this.destinationTypeConfig[this.destination.destinationType].iconClass;
  }

  transportIconClass(): string {
    if (!this.destination) {
      return 'fa-solid fa-route';
    }

    return this.transportConfig[this.destination.recommendedTransportType].iconClass;
  }

  private loadDestination(destinationId: number): void {
    this.currentDestinationId = destinationId;
    this.loading = true;
    this.errorMessage = '';
    this.destination = null;
    this.documentItems = [];
    this.heroImages = [];
    this.currentImageIndex = 0;

    this.travelDestinationService
      .getDestinationById(destinationId)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (destination) => {
          this.destination = destination;
          this.documentItems = this.buildDocumentItems(destination.requiredDocuments);
          this.heroImages = this.buildHeroImages(destination);
          this.currentImageIndex = 0;
        },
        error: (error: unknown) => {
          this.errorMessage =
            error instanceof Error
              ? error.message
              : 'Unable to load destination details. Please try again.';
        }
      });
  }

  private buildHeroImages(destination: TravelDestination): string[] {
    const images: string[] = [];

    const appendUnique = (imageUrl?: string): void => {
      const normalized = (imageUrl ?? '').trim();
      if (!normalized || images.includes(normalized)) {
        return;
      }

      images.push(normalized);
    };

    appendUnique(destination.coverImageUrl);
    (destination.carouselImages ?? []).forEach((image) => appendUnique(image.imageUrl));

    return images;
  }

  private buildDocumentItems(requiredDocuments: string[]): DocumentItem[] {
    return (requiredDocuments ?? []).map((key) => {
      const config = DOCUMENT_CONFIG[key];
      return {
        key,
        iconClass: config?.iconClass ?? 'fa-solid fa-file-lines',
        label: config?.label ?? this.humanizeDocumentKey(key)
      };
    });
  }

  private humanizeDocumentKey(value: string): string {
    return value
      .toLowerCase()
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
