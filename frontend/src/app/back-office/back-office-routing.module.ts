import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AppointmentManagementComponent } from './appointment-management/appointment-management.component';
import { PatientDatabaseComponent } from './patient-database/patient-database.component';
import { ClinicalRecordsComponent } from './clinical-records/clinical-records.component';
import { ClinicManagementComponent } from './clinic-management/clinic-management.component';
import { BillingComponent } from './billing/billing.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'appointments', component: AppointmentManagementComponent },
      { path: 'patients', component: PatientDatabaseComponent },
      { path: 'clinical-records', component: ClinicalRecordsComponent },
      { path: 'clinic-settings', component: ClinicManagementComponent },
      { path: 'billing', component: BillingComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BackOfficeRoutingModule { }
