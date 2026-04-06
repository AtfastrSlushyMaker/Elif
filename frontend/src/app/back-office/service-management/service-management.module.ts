import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ServiceManagementComponent } from './service-management.component';
import { ServiceManagementRoutingModule } from './service-management-routing.module';
import { ServiceListComponent } from './service-list/service-list.component';
import { ServiceFormComponent } from './service-form/service-form.component';
import { ServiceCategoryPickerComponent } from './service-category-picker/service-category-picker.component';
import { SharedModule } from '../../shared/shared.module';
import { BookingComponent } from './booking/booking.component';

@NgModule({
  declarations: [
    ServiceManagementComponent,
    ServiceListComponent,
    ServiceFormComponent,
    ServiceCategoryPickerComponent,
    BookingComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ServiceManagementRoutingModule,
    SharedModule
  ]
})
export class ServiceManagementModule {}
