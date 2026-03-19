import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdoptionComponent } from './adoption.component';

const routes: Routes = [
  { path: '', component: AdoptionComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdoptionRoutingModule {}
