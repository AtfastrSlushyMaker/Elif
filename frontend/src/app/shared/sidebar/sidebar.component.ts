import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

interface SidebarLink {
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() isOpen = true;

  readonly adminLinks: SidebarLink[] = [
    { path: '/admin/users', label: 'Users', icon: 'fas fa-users text-brand-red' },
    { path: '/admin/community', label: 'Community', icon: 'fas fa-comments text-brand-teal' },
    { path: '/admin/pets', label: 'Pets', icon: 'fas fa-paw text-brand-orange' },
    { path: '/admin/transit', label: 'Transit', icon: 'fas fa-truck-medical text-brand-red' },
    { path: '/admin/services', label: 'Services', icon: 'fas fa-stethoscope text-brand-teal' },
    { path: '/admin/adoption', label: 'Adoption', icon: 'fas fa-heart text-brand-orange' },
    { path: '/admin/events', label: 'Events', icon: 'fas fa-calendar-days text-brand-red' },
    { path: '/admin/marketplace', label: 'Marketplace', icon: 'fas fa-store text-brand-teal' }
  ];

  constructor(private router: Router, private auth: AuthService) {}

  isActive(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(`${path}/`);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }
}
