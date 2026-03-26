import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';
import { Destination, DestinationType, DocumentType, TransportType } from '../../models/destination.model';
import { TransitConfirmationDialogService } from '../../services/transit-confirmation-dialog.service';
import { DestinationService } from '../../services/destination.service';
import { TransitToastService } from '../../services/transit-toast.service';
import { TransitToastContainerComponent } from '../../components/transit-toast-container/transit-toast-container.component';
import { TransitConfirmationDialogComponent } from '../../components/transit-confirmation-dialog/transit-confirmation-dialog.component';
import { DestinationStatusBadgeComponent } from '../../components/destination-status-badge/destination-status-badge.component';
import { PetFriendlyStarsComponent } from '../../components/pet-friendly-stars/pet-friendly-stars.component';

@Component({
  selector: 'app-destination-details',
  templateUrl: './destination-details.component.html',
  styleUrl: './destination-details.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    TransitToastContainerComponent,
    TransitConfirmationDialogComponent,
    DestinationStatusBadgeComponent,
    PetFriendlyStarsComponent
  ]
})
export class DestinationDetailsComponent implements OnInit, OnDestroy {
  readonly placeholderCover = 'images/animals/cat.png';

  destination: Destination | null = null;
  loading = true;
  errorMessage = '';
  actionInProgress = false;

  private readonly destroy$ = new Subject<void>();
  private readonly fallbackByType: Record<DestinationType, string> = {
    BEACH: 'images/animals/turtle.png',
    MOUNTAIN: 'images/animals/pony.png',
    CITY: 'images/animals/parakeet.png',
    FOREST: 'images/animals/hamster.png',
    ROAD_TRIP: 'images/animals/chick.png',
    INTERNATIONAL: 'images/animals/cat.png'
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly destinationService: DestinationService,
    private readonly transitConfirmationDialogService: TransitConfirmationDialogService,
    private readonly transitToastService: TransitToastService
  ) {}

  ngOnInit(): void {
    this.loadDestination();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.router.navigate(['/admin/transit/destinations']);
  }

  editDestination(): void {
    if (!this.destination?.id) {
      return;
    }
    this.router.navigate(['/admin/transit/destinations', this.destination.id, 'edit']);
  }

  toggleArchive(): void {
    if (!this.destination?.id || this.actionInProgress) {
      return;
    }

    const isArchived = this.destination.status === 'ARCHIVED';
    this.transitConfirmationDialogService
      .confirm({
        title: isArchived
          ? `Restore "${this.destination.title}"?`
          : `Archive "${this.destination.title}"?`,
        message: isArchived
          ? 'This destination will return to active workflow processing.'
          : 'This destination will move to archived state.',
        confirmLabel: isArchived ? 'Restore' : 'Archive',
        cancelLabel: 'Cancel',
        tone: 'warning'
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.executeArchiveAction(this.destination?.id as number, isArchived);
      });
  }

  deleteDestination(): void {
    if (!this.destination?.id || this.actionInProgress) {
      return;
    }

    this.transitConfirmationDialogService
      .confirm({
        title: `Delete "${this.destination.title}"?`,
        message: 'This action cannot be undone.',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        tone: 'danger'
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.executeDeleteAction(this.destination?.id as number);
      });
  }

  reload(): void {
    this.loadDestination();
  }

  formatDestinationType(destinationType: DestinationType): string {
    return this.destinationService.formatDestinationType(destinationType);
  }

  formatTransportType(transportType: TransportType): string {
    return this.destinationService.formatTransportType(transportType);
  }

  formatDocument(documentType: DocumentType): string {
    return this.destinationService.formatDocumentType(documentType);
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

  getCoverImage(destination: Destination): string {
    const explicitCover = this.destinationService.resolveCoverImageUrl(destination.coverImageUrl);
    if (explicitCover.length > 0) {
      return explicitCover;
    }
    return this.fallbackByType[destination.destinationType] ?? this.placeholderCover;
  }

  onCoverImageError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    if (!image) {
      return;
    }
    image.src = this.placeholderCover;
  }

  hasCoordinates(destination: Destination): boolean {
    return (
      destination.latitude !== null &&
      destination.latitude !== undefined &&
      destination.longitude !== null &&
      destination.longitude !== undefined
    );
  }

  private loadDestination(): void {
    this.loading = true;
    this.errorMessage = '';
    const rawId = this.route.snapshot.paramMap.get('id');
    const destinationId = rawId ? Number(rawId) : Number.NaN;

    if (!Number.isFinite(destinationId)) {
      this.loading = false;
      this.errorMessage = 'Invalid destination id.';
      return;
    }

    this.destinationService
      .getDestinationById(destinationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (destination) => {
          this.destination = destination;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Unable to load destination details. Please try again.';
        }
      });
  }

  private executeArchiveAction(destinationId: number, isArchived: boolean): void {
    this.actionInProgress = true;

    const request$ = isArchived
      ? this.destinationService.unarchiveDestination(destinationId)
      : this.destinationService.archiveDestination(destinationId);

    request$
      .pipe(
        finalize(() => {
          this.actionInProgress = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (updatedDestination) => {
          this.destination = updatedDestination;
          this.transitToastService.success(
            isArchived ? 'Destination restored' : 'Destination archived',
            isArchived
              ? 'Destination has been restored for active workflow processing.'
              : 'Destination is now archived.'
          );
        },
        error: () => {
          this.transitToastService.error(
            'Action failed',
            isArchived
              ? 'Unable to restore destination right now.'
              : 'Unable to archive destination right now.'
          );
        }
      });
  }

  private executeDeleteAction(destinationId: number): void {
    this.actionInProgress = true;

    this.destinationService
      .deleteDestination(destinationId)
      .pipe(
        finalize(() => {
          this.actionInProgress = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.transitToastService.success(
            'Destination deleted',
            'Destination has been removed permanently.'
          );
          this.router.navigate(['/admin/transit/destinations']);
        },
        error: () => {
          this.transitToastService.error(
            'Delete failed',
            'Unable to delete this destination right now.'
          );
        }
      });
  }
}
