import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-office-service-management',
  templateUrl: './service-management.component.html',
  styleUrl: './service-management.component.css'
})
export class ServiceManagementComponent {
  isAdminRoute = false;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.isAdminRoute = this.router.url.includes('/service-requests') || this.router.url.includes('/admin/services');
    });
  }
}

