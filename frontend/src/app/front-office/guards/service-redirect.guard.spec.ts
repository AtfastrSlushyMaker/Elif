import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RedirectServiceLinkGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

canActivate(): boolean {

  // si pas connecté → login
  if (!this.authService.isLoggedIn()) {
    this.router.navigate(['/auth/login']);
    return false;
  }

  // si SERVICE_PROVIDER → backoffice
 const user = this.authService.getCurrentUser();

if (user?.role === 'SERVICE_PROVIDER') { 
    this.router.navigate(['/backoffice/services']);
    return false;
  }

  // sinon USER normal → front-office
  this.router.navigate(['/app/services']);
  return false;
}
}