import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, SessionUser } from '../../auth/auth.service';

interface NavLink {
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
  roles?: string[];
  requiresLogin?: boolean;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  mobileMenuOpen = false;
  userMenuOpen = false;
  readonly frontOfficeLinks: NavLink[] = [
    { path: '/app', label: 'Home', icon: 'fa-home', exact: true },
    { path: '/app/services', label: 'Services', icon: 'fa-stethoscope' },
    { path: '/app/adoption', label: 'Adoption', icon: 'fa-heart' },
    { path: '/app/events', label: 'Events', icon: 'fa-calendar-days' },
    { path: '/app/marketplace', label: 'Marketplace', icon: 'fa-store' },
    { path: '/app/transit', label: 'Transit', icon: 'fa-truck-medical' },
    { path: '/community', label: 'Community', icon: 'fa-users' }
  ];

  constructor(private auth: AuthService, private router: Router) {}

  get currentUser(): SessionUser | null { return this.auth.getCurrentUser(); }

  get currentRole(): string | null {
    return this.currentUser?.role?.toUpperCase() ?? null;
  }

  hasRole(...roles: string[]): boolean {
    const role = this.currentRole;
    return !!role && roles.includes(role);
  }

  get canSeeAdminPortal(): boolean {
    return this.hasRole('ADMIN');
  }

  get visibleFrontOfficeLinks(): NavLink[] {
    return this.frontOfficeLinks.filter((link) => this.canAccessLink(link));
  }

  get canSeeDashboardShortcut(): boolean {
    return this.hasRole('USER', 'SERVICE_PROVIDER', 'ADMIN');
  }

  private canAccessLink(link: NavLink): boolean {
    if (!link.requiresLogin) return true;
    if (!this.currentRole) return false;
    if (!link.roles?.length) return true;
    return link.roles.includes(this.currentRole);
  }
  goToServices(): void {
    if (this.hasRole('SERVICE_PROVIDER')) {
      // Si c'est un service provider, il va vers le backoffice
      this.router.navigate(['/backoffice/services']);
    } else {
      // Si c'est un user normal, il va vers le front-office
      this.router.navigate(['/app/services']);
    }
  }
  logout(): void {
    this.userMenuOpen = false;
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
