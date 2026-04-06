import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
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
import { AdoptionRedirectGuard } from '../../adoption-redirect.guard';
import { AdoptionComponent } from './adoption.component';

const routes: Routes = [
  {
    path: '',
    component: AdoptionComponent,
    children: [
      { path: '', redirectTo: 'pets', pathMatch: 'full' },

      // Shelter routes
      { path: 'shelter/pets/new',      component: ShelterPetFormComponent },
      { path: 'shelter/pets/edit/:id', component: ShelterPetFormComponent },
      { path: 'shelter/pets',          component: ShelterPetsComponent },
      { path: 'shelter/requests',      component: ShelterRequestsComponent },
      { path: 'shelter/dashboard',     component: ShelterDashboardComponent },

      // Suggestion wizard (modal in pets view)
      { path: 'find-my-pet', component: PetListComponent, data: { openWizard: true } },

      // User routes
      { path: 'pets',           component: PetListComponent, canActivate: [AdoptionRedirectGuard] },
      { path: 'pets/:id',       component: PetDetailComponent },
      { path: 'pets/:id/adopt', component: RequestFormComponent },
      { path: 'shelters',       component: ShelterListComponent },
      { path: 'shelters/:id',   component: ShelterDetailComponent },
      { path: 'my-requests',    component: MyRequestsComponent },
      { path: 'my-contracts',   component: MyContractsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdoptionFrontRoutingModule { }
