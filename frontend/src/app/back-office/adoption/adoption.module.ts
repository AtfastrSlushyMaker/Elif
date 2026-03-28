import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdoptionComponent } from './adoption.component';
import { AdoptionRoutingModule } from './adoption-routing.module';
import { ShelterManagementComponent } from './components/shelter-management/shelter-management.component';
import { PetManagementComponent } from './components/pet-management/pet-management.component';
import { PetFormComponent } from './components/pet-form/pet-form.component';
import { RequestManagementComponent } from './components/request-management/request-management.component';
import { ContractManagementComponent } from './components/contract-management/contract-management.component';
import { ReviewModerationComponent } from './components/review-moderation/review-moderation.component';
import { StatisticsComponent } from './components/statistics/statistics.component';

@NgModule({
  declarations: [AdoptionComponent, ShelterManagementComponent, PetManagementComponent, PetFormComponent, RequestManagementComponent, ContractManagementComponent, ReviewModerationComponent, StatisticsComponent],
  imports: [
    CommonModule,
    AdoptionRoutingModule
  ]
})
export class AdoptionModule {}
