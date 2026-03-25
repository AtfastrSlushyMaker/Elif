import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateDestinationComponent } from './pages/create-destination/create-destination.component';
import { DestinationsListComponent } from './pages/destinations-list/destinations-list.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'destinations' },
  { path: 'destinations', component: DestinationsListComponent },
  { path: 'destinations/create', component: CreateDestinationComponent },
  { path: '**', redirectTo: 'destinations' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransitRoutingModule {}
