// front-office/events/events-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventsListComponent } from './pages/events-list/events-list.component';

const routes: Routes = [
  // Liste principale
  {
    path: '',
    component: EventsListComponent,
  },
  // Détail d'un événement
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/detail/event-detail.component')
        .then(m => m.EventDetailComponent),
  },
  // Calendrier
 
  // Mes inscriptions
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventsRoutingModule {}