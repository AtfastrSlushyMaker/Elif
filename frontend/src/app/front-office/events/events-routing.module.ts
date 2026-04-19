// src/app/front-office/events/events-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // Page liste (tous les événements) - Route par défaut
  {
    path: '',
    loadComponent: () =>
      import('./pages/events-list/events-list.component')
        .then(m => m.EventsListComponent),
  },
  // ⚠️ IMPORTANT : Les routes avec path fixe DOIVENT venir AVANT les routes paramétrées
  // Calendrier
  {
    path: 'calendar',
    loadComponent: () =>
      import('./pages/calendar/calendar.component')
        .then(m => m.CalendarComponent),
  },
  // Recommandations
  {
    path: 'recommendations',
    loadComponent: () =>
      import('./pages/recommendations/recommendations.component')
        .then(m => m.RecommendationsComponent),
  },
  // Détail (route paramétrée) - DOIT être en DERNIER
  // Car elle capture tout ce qui n'a pas matché avant
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