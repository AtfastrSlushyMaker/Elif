import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { LandingComponent } from './landing/landing.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PetProfilesComponent } from './pet-profiles/pet-profiles.component';
import { MedicalRecordsComponent } from './medical-records/medical-records.component';
import { ServicesComponent } from './services/services.component';
import { MessagesComponent } from './messages/messages.component';
import { AuthGuard } from '../auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: LandingComponent },
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'pets', component: PetProfilesComponent, canActivate: [AuthGuard] },
      { path: 'medical-records', component: MedicalRecordsComponent, canActivate: [AuthGuard] },
      { path: 'services', component: ServicesComponent },
      { path: 'messages', component: MessagesComponent, canActivate: [AuthGuard] },
      { path: 'community', loadChildren: () => import('../community/community.module').then(m => m.CommunityModule) }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FrontOfficeRoutingModule { }
