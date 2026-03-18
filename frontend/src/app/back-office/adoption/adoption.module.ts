import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdoptionComponent } from './adoption.component';
import { AdoptionRoutingModule } from './adoption-routing.module';

@NgModule({
  declarations: [AdoptionComponent],
  imports: [
    CommonModule,
    AdoptionRoutingModule
  ]
})
export class AdoptionModule {}
