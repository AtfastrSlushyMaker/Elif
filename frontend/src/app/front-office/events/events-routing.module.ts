// src/app/front-office/events/events-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // Page liste (tous les événements) - INCHANGÉE
  {
    path: '',
    loadComponent: () =>
      import('./pages/events-list/events-list.component')
        .then(m => m.EventsListComponent),
  },
  // ✅ NOUVEAU : Page des recommandations
  {
    path: 'recommendations',
    loadComponent: () =>
      import('./pages/recommendations/recommendations.component')
        .then(m => m.RecommendationsComponent),
  },
  // Calendrier
  {
    path: 'calendar',
    loadComponent: () =>
      import('./pages/calendar/calendar.component')
        .then(m => m.CalendarComponent),
  },
  // Détail (doit être APRÈS)
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/detail/event-detail.component')
        .then(m => m.EventDetailComponent),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventsRoutingModule {}