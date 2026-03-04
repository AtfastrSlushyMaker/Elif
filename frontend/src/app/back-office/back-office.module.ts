import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BackOfficeRoutingModule } from './back-office-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { AppointmentManagementComponent } from './appointment-management/appointment-management.component';
import { PatientDatabaseComponent } from './patient-database/patient-database.component';
import { ClinicalRecordsComponent } from './clinical-records/clinical-records.component';
import { ClinicManagementComponent } from './clinic-management/clinic-management.component';
import { BillingComponent } from './billing/billing.component';

@NgModule({
  declarations: [
    LayoutComponent,
    DashboardComponent,
    AppointmentManagementComponent,
    PatientDatabaseComponent,
    ClinicalRecordsComponent,
    ClinicManagementComponent,
    BillingComponent
  ],
  imports: [
    CommonModule,
    BackOfficeRoutingModule,
    SharedModule
  ]
})
export class BackOfficeModule { }
