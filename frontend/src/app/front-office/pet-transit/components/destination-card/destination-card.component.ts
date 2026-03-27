import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PetFriendlyStarsComponent } from '../pet-friendly-stars/pet-friendly-stars.component';
import {
  DESTINATION_TYPE_CONFIG,
  TRANSPORT_CONFIG,
  TravelDestinationSummary
} from '../../models/travel-destination.model';

@Component({
  selector: 'app-destination-card',
  standalone: true,
  imports: [CommonModule, PetFriendlyStarsComponent],
  templateUrl: './destination-card.component.html',
  styleUrl: './destination-card.component.scss'
})
export class DestinationCardComponent {
  @Input({ required: true }) destination!: TravelDestinationSummary;
  @Output() cardClick = new EventEmitter<number>();

  get typeConfig() {
    return DESTINATION_TYPE_CONFIG[this.destination.destinationType];
  }

  get transportConfig() {
    return TRANSPORT_CONFIG[this.destination.recommendedTransportType];
  }

  onCardClick(): void {
    this.cardClick.emit(this.destination.id);
  }

  hasCoverImage(): boolean {
    return Boolean(this.destination.coverImageUrl?.trim());
  }

  safeRegion(): string {
    const region = this.destination.region?.trim();
    return region ? region : 'Region not specified';
  }

  typeIconClass(): string {
    return this.typeConfig.iconClass || 'fa-solid fa-compass';
  }

  transportIconClass(): string {
    return this.transportConfig.iconClass || 'fa-solid fa-route';
  }
}
