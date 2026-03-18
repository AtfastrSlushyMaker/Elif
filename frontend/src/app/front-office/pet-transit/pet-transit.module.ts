import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { PetTransitComponent } from './pet-transit.component';
import { PetTransitRoutingModule } from './pet-transit-routing.module';

@NgModule({
  declarations: [PetTransitComponent],
  imports: [
    CommonModule,
    SharedModule,
    PetTransitRoutingModule
  ]
})
export class PetTransitModule {}
