import { Routes } from '@angular/router';
import { PetTransitComponent } from './pet-transit.component';

export const PET_TRANSIT_ROUTES: Routes = [
  {
    path: '',
    component: PetTransitComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'destinations' },
      {
        path: 'destinations',
        loadComponent: () =>
          import('./pages/destination-catalog/destination-catalog.component').then(
            (m) => m.DestinationCatalogComponent
          )
      },
      {
        path: 'destinations/:id',
        loadComponent: () =>
          import('./pages/destination-detail/destination-detail.component').then(
            (m) => m.DestinationDetailComponent
          )
      },
      {
        path: 'plans',
        pathMatch: 'full',
        redirectTo: 'plans/my'
      },
      {
        path: 'plans/my',
        loadComponent: () =>
          import('./pages/travel-plans-list/travel-plans-list.component').then(
            (m) => m.TravelPlansListComponent
          )
      },
      {
        path: 'plans/new',
        loadComponent: () =>
          import('./pages/create-travel-plan/create-travel-plan.component').then(
            (m) => m.CreateTravelPlanComponent
          )
      },
      {
        path: 'plans/:id/edit',
        loadComponent: () =>
          import('./pages/create-travel-plan/create-travel-plan.component').then(
            (m) => m.CreateTravelPlanComponent
          )
      },
      {
        path: 'plans/:id/documents',
        loadComponent: () =>
          import('./pages/travel-plan-detail/travel-plan-detail.component').then(
            (m) => m.TravelPlanDetailComponent
          )
      },
      {
        path: 'plans/:id/checklist',
        loadComponent: () =>
          import('./pages/travel-plan-detail/travel-plan-detail.component').then(
            (m) => m.TravelPlanDetailComponent
          )
      },
      {
        path: 'plans/:id/feedback',
        loadComponent: () =>
          import('./pages/travel-plan-detail/travel-plan-detail.component').then(
            (m) => m.TravelPlanDetailComponent
          )
      },
      {
        path: 'plans/:id',
        loadComponent: () =>
          import('./pages/travel-plan-detail/travel-plan-detail.component').then(
            (m) => m.TravelPlanDetailComponent
          )
      }
    ]
  }
];
