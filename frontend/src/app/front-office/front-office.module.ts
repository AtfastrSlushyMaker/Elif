import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FrontOfficeRoutingModule } from './front-office-routing.module';
import { LayoutComponent } from './layout/layout.component';
import { LandingComponent } from './landing/landing.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { PetProfilesComponent } from './pet-profiles/pet-profiles.component';
import { MedicalRecordsComponent } from './medical-records/medical-records.component';
import { ServicesComponent } from './services/services.component';
import { MessagesComponent } from './messages/messages.component';

@NgModule({
  declarations: [
    LayoutComponent,
    LandingComponent,
    DashboardComponent,
    PetProfilesComponent,
    MedicalRecordsComponent,
    ServicesComponent,
    MessagesComponent
  ],
  imports: [
    CommonModule,
    FrontOfficeRoutingModule,
    SharedModule
  ]
})
export class FrontOfficeModule { }
