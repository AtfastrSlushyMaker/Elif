import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { AdoptionComponent } from './adoption.component';
import { AdoptionRoutingModule } from './adoption-routing.module';

@NgModule({
  declarations: [AdoptionComponent],
  imports: [
    CommonModule,
    SharedModule,
    AdoptionRoutingModule
  ]
})
export class AdoptionModule {}
