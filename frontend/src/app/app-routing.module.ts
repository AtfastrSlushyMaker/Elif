import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminGuard } from './auth/admin.guard';

const routes: Routes = [
  { path: 'app', loadChildren: () => import('./front-office/front-office.module').then(m => m.FrontOfficeModule) },
  { path: 'admin', loadChildren: () => import('./back-office/back-office.module').then(m => m.BackOfficeModule), canActivate: [AdminGuard] },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  { path: 'community', redirectTo: 'app/community', pathMatch: 'full' },
  { path: '', redirectTo: 'app', pathMatch: 'full' },
  { path: '**', redirectTo: 'app' } // catch all
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }