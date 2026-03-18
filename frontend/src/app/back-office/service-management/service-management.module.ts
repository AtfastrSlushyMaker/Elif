import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceManagementComponent } from './service-management.component';
import { ServiceManagementRoutingModule } from './service-management-routing.module';

@NgModule({
  declarations: [ServiceManagementComponent],
  imports: [
    CommonModule,
    ServiceManagementRoutingModule
  ]
})
export class ServiceManagementModule {}
