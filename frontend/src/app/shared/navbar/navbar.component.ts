import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, SessionUser } from '../../auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  mobileMenuOpen = false;

  constructor(private auth: AuthService, private router: Router) {}

  get currentUser(): SessionUser | null { return this.auth.getCurrentUser(); }

  get currentRole(): string | null {
    return this.currentUser?.role?.toUpperCase() ?? null;
  }

  hasRole(...roles: string[]): boolean {
    const role = this.currentRole;
    return !!role && roles.includes(role);
  }

  get canSeeFrontOfficeNav(): boolean {
    return this.hasRole('USER', 'SERVICE_PROVIDER', 'ADMIN');
  }

  get canSeePetNav(): boolean {
    return this.hasRole('USER');
  }

  get canSeeRecordsNav(): boolean {
    return this.hasRole('USER', 'VET', 'ADMIN');
  }

  get canSeeAdminPortal(): boolean {
    return this.hasRole('ADMIN');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
