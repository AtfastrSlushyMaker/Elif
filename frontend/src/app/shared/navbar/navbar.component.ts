import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, SessionUser } from '../../auth/auth.service';
import { CartService } from '../services/cart.service';

interface NavLink {
  path: string;
  label: string;
  icon: string;
  iconType?: 'fa' | 'material';
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
  compactNav = false;
  private readonly compactNavBreakpoint = 1180;

  readonly cartCount$;

  readonly frontOfficeLinks: NavLink[] = [
    { path: '/app', label: 'Home', icon: 'fa-home', exact: true },
    { path: '/app/services', label: 'Services', icon: 'fa-stethoscope' },
    { path: '/app/adoption', label: 'Adoption', icon: 'fa-heart' },
    { path: '/app/events', label: 'Events', icon: 'fa-calendar-days' },
    { path: '/app/marketplace', label: 'Marketplace', icon: 'fa-store' },
    { path: '/app/transit', label: 'Transit', icon: 'flight_takeoff', iconType: 'material' },
    { path: '/app/community', label: 'Community', icon: 'fa-users' }
  ];

  // 🔥 Cache pour éviter recalcul inutile
  private cachedLinks: NavLink[] | null = null;
  private lastRole: string | null = undefined as any;

  constructor(
    private auth: AuthService,
    private router: Router,
    cartService: CartService
  ) {
    this.cartCount$ = cartService.getCartCount();
    this.compactNav = this.isCompactViewport();
  }

  ngOnInit(): void {
    this.applyViewportMode();
  }

  get currentUser(): SessionUser | null {
    return this.auth.getCurrentUser();
  }

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
    const currentRole = this.currentRole;

    // ⚡ optimisation: ne pas recalculer si rien n’a changé
    if (this.cachedLinks && this.lastRole === currentRole) {
      return this.cachedLinks;
    }

    this.lastRole = currentRole;

    this.cachedLinks = this.frontOfficeLinks
      .filter((link) => this.canAccessLink(link))
      .map(link => {

        // ⚠️ CONFIGURATION AJOUTÉE :
        // Si SERVICE_PROVIDER clique sur "Services"
        // → redirection vers le module back-office
        if (link.label === 'Services' && this.hasRole('SERVICE_PROVIDER')) {
          return { ...link, path: '/backoffice/services' };
        }

        return link;
      });

    return this.cachedLinks;
  }

  get canSeeDashboardShortcut(): boolean {
    return this.hasRole('USER', 'SERVICE_PROVIDER', 'ADMIN');
  }

  get canSeeInboxShortcut(): boolean {
    return !!this.currentUser;
  }

  private canAccessLink(link: NavLink): boolean {
    if (!link.requiresLogin) return true;
    if (!this.currentRole) return false;
    if (!link.roles?.length) return true;
    return link.roles.includes(this.currentRole);
  }

  // ⚠️ Navigation dynamique vers services
  goToServices(): void {
    if (this.hasRole('SERVICE_PROVIDER')) {
      this.router.navigate(['/backoffice/services']);
    } else {
      this.router.navigate(['/app/services']);
    }
  }

  logout(): void {
    this.userMenuOpen = false;
    this.mobileMenuOpen = false;
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  closeAllMenus(): void {
    this.userMenuOpen = false;
    this.mobileMenuOpen = false;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      this.userMenuOpen = false;
    }
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
    if (this.userMenuOpen) {
      this.mobileMenuOpen = false;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.applyViewportMode();
  }

  private applyViewportMode(): void {
    const nextCompact = this.isCompactViewport();
    if (this.compactNav === nextCompact) return;

    this.compactNav = nextCompact;
    this.closeAllMenus();
  }

  private isCompactViewport(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < this.compactNavBreakpoint;
  }
}