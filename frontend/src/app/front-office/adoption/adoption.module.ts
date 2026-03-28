import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  // ← MODIFIER CETTE LIGNE
import { AdoptionFrontRoutingModule } from './adoption-routing.module';
import { PetListComponent } from './components/pet-list/pet-list.component';
import { PetDetailComponent } from './components/pet-detail/pet-detail.component';
import { ShelterListComponent } from './components/shelter-list/shelter-list.component';
import { ShelterDetailComponent } from './components/shelter-detail/shelter-detail.component';
import { RequestFormComponent } from './components/request-form/request-form.component';
import { MyRequestsComponent } from './components/my-requests/my-requests.component';
import { MyContractsComponent } from './components/my-contracts/my-contracts.component';
import { ShelterDashboardComponent } from './components/shelter-dashboard/shelter-dashboard.component';
import { ShelterPetsComponent } from './components/shelter-pets/shelter-pets.component';
import { ShelterRequestsComponent } from './components/shelter-requests/shelter-requests.component';
import { ShelterPetFormComponent } from './components/shelter-pet-form/shelter-pet-form.component';
import { ContractService } from './services/contract.service';
import { RouterModule } from '@angular/router';
import { AdoptionComponent } from './adoption.component'; 
@NgModule({
  declarations: [
    PetListComponent,
    PetDetailComponent,
    ShelterListComponent,
    ShelterDetailComponent,
    RequestFormComponent,
    MyRequestsComponent,
    MyContractsComponent,
    ShelterDashboardComponent,
    ShelterPetsComponent,
    ShelterRequestsComponent,
    ShelterPetFormComponent,
    AdoptionComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
     RouterModule,
    AdoptionFrontRoutingModule,
    ReactiveFormsModule  // ← MAINTENANT RECONNU
  ]
})
export class AdoptionModule { }