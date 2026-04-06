import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { ServicesComponent } from './services.component';
import { ServicesRoutingModule } from './services-routing.module';
import { FormBookingComponent } from './model/form-booking/form-booking.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ServicesComponent, FormBookingComponent],
  imports: [
    CommonModule,
    SharedModule,
    ServicesRoutingModule,
    ReactiveFormsModule,
  ]
})
export class ServicesModule {}
