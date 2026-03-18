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
    { path: '/admin/community', label: 'Community', icon: 'fas fa-users text-brand-teal' }
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
