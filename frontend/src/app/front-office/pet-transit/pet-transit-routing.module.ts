import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PetTransitComponent } from './pet-transit.component';

const routes: Routes = [
  { path: '', component: PetTransitComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PetTransitRoutingModule {}
