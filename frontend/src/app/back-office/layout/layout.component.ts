import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-office-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {
  sidebarOpen = false;
  private desktopMode = true;
  today = new Date();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.syncViewportState();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.syncViewportState();
  }

  get currentSection(): string {
    if (this.router.url.startsWith('/admin/community')) return 'Community Management';
    if (this.router.url.startsWith('/admin/users')) return 'User Administration';
    return 'Back Office';
  }

  get sectionHint(): string {
    if (this.router.url.startsWith('/admin/community')) {
      return 'Review communities, moderate content, and manage member access from one place.';
    }

    if (this.router.url.startsWith('/admin/users')) {
      return 'Control platform accounts, permissions, and access quality across the ecosystem.';
    }

    return 'Choose a section from the sidebar to begin your administrative workflow.';
  }

  isSectionActive(routePrefix: string): boolean {
    return this.router.url.startsWith(routePrefix);
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  get isMobile(): boolean {
    return !this.desktopMode;
  }

  private syncViewportState(): void {
    this.desktopMode = window.innerWidth >= 1024;
    if (this.desktopMode) {
      this.sidebarOpen = true;
      return;
    }

    if (this.router.url) {
      this.sidebarOpen = false;
    }
  }
}
