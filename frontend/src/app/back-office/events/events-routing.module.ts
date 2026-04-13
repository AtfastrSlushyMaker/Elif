// back-office/events/events-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventsComponent } from './components/events.component/events.component';

const routes: Routes = [
  { path: '', component: EventsComponent },
  { path: 'dashboard', loadComponent: () => import('./pages/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
  { path: 'create', loadComponent: () => import('./pages/form/admin-event-form.component').then(m => m.AdminEventFormComponent) },
  { path: 'categories', loadComponent: () => import('./pages/categories/admin-categories.component').then(m => m.AdminCategoriesComponent) },  // ← AVANT :id
  { path: ':id/edit', loadComponent: () => import('./pages/form/admin-event-form.component').then(m => m.AdminEventFormComponent) },
  { path: ':id', loadComponent: () => import('./pages/detail/event-detail.component').then(m => m.EventDetailComponent) },  // ← EN DERNIER
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EventsRoutingModule { }