import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

interface SidebarLink {
  path: string;
  label: string;
  iconClass: string;
  iconColorClass: string;
}

interface TransitSubLink {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  @Input() isOpen = true;

  transitExpanded = false;

  readonly topAdminLinks: SidebarLink[] = [
    { path: '/admin/users', label: 'Users', iconClass: 'fa-solid fa-users', iconColorClass: 'icon-users' },
    { path: '/admin/community', label: 'Community', iconClass: 'fa-solid fa-comments', iconColorClass: 'icon-community' },
    { path: '/admin/pets', label: 'Pets', iconClass: 'fa-solid fa-paw', iconColorClass: 'icon-pets' }
  ];

  readonly bottomAdminLinks: SidebarLink[] = [
    { path: '/admin/services', label: 'Services', iconClass: 'fa-solid fa-stethoscope', iconColorClass: 'icon-services' },
    { path: '/admin/adoption', label: 'Adoption', iconClass: 'fa-solid fa-heart', iconColorClass: 'icon-adoption' },
    { path: '/admin/events', label: 'Events', iconClass: 'fa-solid fa-calendar-days', iconColorClass: 'icon-events' },
    { path: '/admin/marketplace', label: 'Marketplace', iconClass: 'fa-solid fa-store', iconColorClass: 'icon-marketplace' }
  ];

  readonly transitLinks: TransitSubLink[] = [
    { path: '/admin/transit/destinations', label: 'Destinations', icon: 'place' },
    { path: '/admin/transit/travel-plans', label: 'Travel Plans', icon: 'card_travel' }
  ];

  constructor(
    private readonly router: Router,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    if (this.isTransitRoute()) {
      this.transitExpanded = true;
    }
  }

  toggleTransit(): void {
    this.transitExpanded = !this.transitExpanded;
  }

  isTransitRoute(): boolean {
    return (
      this.router.url.startsWith('/admin/transit') ||
      this.router.url.startsWith('/back-office/transit')
    );
  }

  isActive(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(`${path}/`);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}

