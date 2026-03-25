import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateDestinationComponent } from './pages/create-destination/create-destination.component';
import { DestinationsListComponent } from './pages/destinations-list/destinations-list.component';
import { TransitRoutingModule } from './transit-routing.module';
import { DestinationStatusBadgeComponent } from './components/destination-status-badge/destination-status-badge.component';
import { PetFriendlyStarsComponent } from './components/pet-friendly-stars/pet-friendly-stars.component';
import { TransitToastContainerComponent } from './components/transit-toast-container/transit-toast-container.component';

@NgModule({
  declarations: [
    DestinationsListComponent,
    CreateDestinationComponent,
    DestinationStatusBadgeComponent,
    PetFriendlyStarsComponent,
    TransitToastContainerComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TransitRoutingModule
  ]
})
export class TransitModule {}
