import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransitComponent } from './transit.component';
import { TransitRoutingModule } from './transit-routing.module';

@NgModule({
  declarations: [TransitComponent],
  imports: [
    CommonModule,
    TransitRoutingModule
  ]
})
export class TransitModule {}
