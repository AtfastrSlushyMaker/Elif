import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../auth/auth.guard';
import { PetProfilesComponent } from './pet-profiles.component';

const routes: Routes = [
  { path: '', component: PetProfilesComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PetProfilesRoutingModule {}
