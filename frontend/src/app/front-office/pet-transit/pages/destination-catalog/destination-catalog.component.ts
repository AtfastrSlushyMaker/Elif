import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';
import { CategoryCarouselComponent } from '../../components/category-carousel/category-carousel.component';
import { DestinationCardComponent } from '../../components/destination-card/destination-card.component';
import {
  DESTINATION_TYPE_CONFIG,
  DestinationType,
  TravelDestinationSummary
} from '../../models/travel-destination.model';
import { TravelDestinationService } from '../../services/travel-destination.service';

type FeatureItem = {
  iconClass: string;
  title: string;
  description: string;
  tone: 'primary' | 'accent' | 'blue' | 'red';
};

type StepItem = {
  number: string;
  iconClass: string;
  title: string;
  description: string;
};

@Component({
  selector: 'app-destination-catalog',
  standalone: true,
  imports: [CommonModule, CategoryCarouselComponent, DestinationCardComponent],
  templateUrl: './destination-catalog.component.html',
  styleUrl: './destination-catalog.component.scss'
})
export class DestinationCatalogComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('featureCard') featureCards!: QueryList<ElementRef<HTMLElement>>;

  readonly typeConfigs = DESTINATION_TYPE_CONFIG;
  readonly skeletonItems = [1, 2, 3, 4, 5, 6];

  readonly features: FeatureItem[] = [
    {
      iconClass: 'fa-solid fa-circle-check',
      title: 'Verified Destinations',
      description:
        'Every destination is analyzed and certified pet-friendly by our expert team before being published.',
      tone: 'primary'
    },
    {
      iconClass: 'fa-solid fa-file-lines',
      title: 'Document Checklist',
      description:
        'Know exactly which documents are required before planning your trip. No surprises at the border.',
      tone: 'accent'
    },
    {
      iconClass: 'fa-solid fa-shield',
      title: 'Safety Guidelines',
      description:
        "Step-by-step safety checklist tailored to your pet's profile and travel route.",
      tone: 'blue'
    },
    {
      iconClass: 'fa-solid fa-comments',
      title: 'Traveler Reviews',
      description:
        'Read verified experiences from other pet owners who traveled these exact routes.',
      tone: 'red'
    }
  ];

  readonly planningSteps: StepItem[] = [
    {
      number: '01',
      iconClass: 'fa-solid fa-map',
      title: 'Choose a Destination',
      description:
        "Browse our verified catalog and find the perfect destination that fits your pet's needs."
    },
    {
      number: '02',
      iconClass: 'fa-solid fa-clipboard',
      title: 'Prepare Your Documents',
      description:
        'Upload required documents. Our system validates them and alerts you if anything is missing.'
    },
    {
      number: '03',
      iconClass: 'fa-solid fa-plane-departure',
      title: 'Travel with Confidence',
      description:
        'Depart knowing everything is in order. Share feedback after your journey.'
    }
  ];

  destinations: TravelDestinationSummary[] = [];
  filteredDestinations: TravelDestinationSummary[] = [];
  selectedType: DestinationType | null = null;

  loading = true;
  errorMessage = '';

  private readonly destroy$ = new Subject<void>();
  private intersectionObserver: IntersectionObserver | null = null;

  constructor(
    private readonly travelDestinationService: TravelDestinationService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadDestinations();
  }

  ngAfterViewInit(): void {
    this.setupRevealObserver();

    this.featureCards.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.setupRevealObserver();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.intersectionObserver?.disconnect();
  }

  get destinationCountLabel(): string {
    const count = this.filteredDestinations.length;
    return `${count} destination${count === 1 ? '' : 's'}`;
  }

  onTypeSelected(type: DestinationType | null): void {
    this.selectedType = type;
    this.applyFilter();
  }

  showAllDestinations(): void {
    this.selectedType = null;
    this.applyFilter();
  }

  exploreDestination(destinationId: number): void {
    this.router.navigate(['/app/transit/destinations', destinationId]);
  }

  retryLoad(): void {
    this.loadDestinations();
  }

  scrollToDestinations(): void {
    this.scrollToSection('destinations');
  }

  scrollToGuide(): void {
    this.scrollToSection('guide');
  }

  toneClass(feature: FeatureItem): string {
    return `tone-${feature.tone}`;
  }

  private loadDestinations(): void {
    this.loading = true;
    this.errorMessage = '';

    this.travelDestinationService
      .getPublishedDestinations()
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (destinations) => {
          this.destinations = destinations;
          this.applyFilter();
        },
        error: (error: unknown) => {
          if (error instanceof Error) {
            this.errorMessage = error.message;
            return;
          }

          this.errorMessage = 'Unable to load destinations. Please try again.';
        }
      });
  }

  private applyFilter(): void {
    if (!this.selectedType) {
      this.filteredDestinations = [...this.destinations];
      return;
    }

    this.filteredDestinations = this.destinations.filter(
      (destination) => destination.destinationType === this.selectedType
    );
  }

  private scrollToSection(sectionId: string): void {
    const target = document.getElementById(sectionId);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private setupRevealObserver(): void {
    this.intersectionObserver?.disconnect();

    if (typeof window === 'undefined' || !this.featureCards?.length) {
      return;
    }

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.intersectionObserver?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2 }
    );

    this.featureCards.forEach((cardRef, index) => {
      const cardEl = cardRef.nativeElement;
      cardEl.style.setProperty('--reveal-delay', `${index * 0.1}s`);
      this.intersectionObserver?.observe(cardEl);
    });
  }
}

