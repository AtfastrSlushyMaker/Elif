import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdoptionBackRoutingModule } from './adoption-routing.module';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { ShelterManagementComponent } from './components/shelter-management/shelter-management.component';  // ← Vérifier l'import
import { PetManagementComponent } from './components/pet-management/pet-management.component';
import { RequestManagementComponent } from './components/request-management/request-management.component';
import { ContractManagementComponent } from './components/contract-management/contract-management.component';
import { ReviewModerationComponent } from './components/review-moderation/review-moderation.component';
import { PetFormComponent } from './components/pet-form/pet-form.component';
import { ShelterDetailComponent } from './components/shelter-detail/shelter-detail.component';

@NgModule({
  declarations: [
    StatisticsComponent,
    ShelterManagementComponent,   // ← Vérifier qu'il est ici
    PetManagementComponent,
    RequestManagementComponent,
    ContractManagementComponent,
    ReviewModerationComponent,
    PetFormComponent,
    ShelterDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    AdoptionBackRoutingModule
  ]
})
export class AdoptionModule { }