import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ServiceManagementComponent } from './service-management.component';
import { ServiceManagementRoutingModule } from './service-management-routing.module';
import { ServiceListComponent } from './service-list/service-list.component';
import { ServiceFormComponent } from './service-form/service-form.component';

@NgModule({
  declarations: [
    ServiceManagementComponent,
    ServiceListComponent,
    ServiceFormComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ServiceManagementRoutingModule
  ]
})
export class ServiceManagementModule {}
