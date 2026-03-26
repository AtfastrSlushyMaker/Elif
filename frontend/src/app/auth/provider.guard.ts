import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ProviderGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    const user = this.auth.getCurrentUser();

    // Check if user is logged in
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Check if user is a service provider
    if (this.auth.hasRole('SERVICE_PROVIDER', 'PROVIDER', 'VET', 'WALKER')) {
      return true;
    }

    // If user is logged in but not a provider, redirect to app
    this.router.navigate(['/app']);
    return false;
  }
}
