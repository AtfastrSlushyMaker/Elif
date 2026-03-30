import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, SessionUser } from '../../auth/auth.service';
import { CartService } from '../services/cart.service';
import { Observable } from 'rxjs';

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
export class NavbarComponent implements OnInit {
  mobileMenuOpen = false;
  userMenuOpen = false;
  cartCount$: Observable<number>;
  readonly frontOfficeLinks: NavLink[] = [
    { path: '/app', label: 'Home', icon: 'fa-home', exact: true },
    { path: '/app/services', label: 'Services', icon: 'fa-stethoscope' },
    { path: '/app/adoption', label: 'Adoption', icon: 'fa-heart' },
    { path: '/app/events', label: 'Events', icon: 'fa-calendar-days' },
    { path: '/app/marketplace', label: 'Marketplace', icon: 'fa-store' },
    { path: '/app/transit', label: 'Transit', icon: 'fa-truck-medical' },
    { path: '/community', label: 'Community', icon: 'fa-users' }
  ];

  constructor(
    private auth: AuthService,
    private router: Router,
    private cartService: CartService
  ) {
    this.cartCount$ = this.cartService.getCartCount();
  }

  ngOnInit(): void {}

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

  logout(): void {
    this.userMenuOpen = false;
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  goToCart(): void {
    this.router.navigate(['/app/marketplace/cart']);
  }
}
