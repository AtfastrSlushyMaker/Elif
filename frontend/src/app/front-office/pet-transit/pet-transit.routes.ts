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
      }
    ]
  }
];
