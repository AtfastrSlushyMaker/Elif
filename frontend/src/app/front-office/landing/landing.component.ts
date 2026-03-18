import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

interface LandingModuleCard {
  title: string;
  description: string;
  route: string;
  icon: string;
  accent: string;
  access: string;
}

@Component({
  selector: 'app-landing',
  standalone: false,
  templateUrl: './landing.component.html'
})
export class LandingComponent implements OnInit {
  readonly moduleCards: LandingModuleCard[] = [
    {
      title: 'Community',
      description: 'Browse discussions as a visitor, then join conversations and post once signed in.',
      route: '/community',
      icon: 'fa-users',
      accent: 'text-brand-teal',
      access: 'Visitors can browse'
    },
    {
      title: 'Services',
      description: 'Explore vets, walkers, groomers, and care providers before booking or contacting them.',
      route: '/app/services',
      icon: 'fa-stethoscope',
      accent: 'text-brand-orange',
      access: 'Visitors can browse'
    },
    {
      title: 'Pet Transit',
      description: 'Prepare transport requests and discover transit flows for clinic visits, boarding, and relocation.',
      route: '/app/transit',
      icon: 'fa-truck-medical',
      accent: 'text-brand-red',
      access: 'Visitors can browse'
    },
    {
      title: 'Adoption',
      description: 'Discover adoptable pets, shelters, and step-by-step adoption guidance across the platform.',
      route: '/app/adoption',
      icon: 'fa-heart',
      accent: 'text-brand-orange',
      access: 'Visitors can browse'
    },
    {
      title: 'Events',
      description: 'Find training classes, celebrations, meetups, and community experiences for pet families.',
      route: '/app/events',
      icon: 'fa-calendar-days',
      accent: 'text-brand-teal',
      access: 'Visitors can browse'
    },
    {
      title: 'Marketplace',
      description: 'Browse feeds, merchandise, accessories, and pet essentials before purchase flows are added.',
      route: '/app/marketplace',
      icon: 'fa-store',
      accent: 'text-brand-red',
      access: 'Visitors can browse'
    },
    {
      title: 'Pet Profiles',
      description: 'Signed-in owners manage their pet family, records, and platform activity from one place.',
      route: '/app/pets',
      icon: 'fa-paw',
      accent: 'text-brand-teal',
      access: 'Login required'
    }
  ];

  constructor(private router: Router, private route: ActivatedRoute, private auth: AuthService) {}

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  ngOnInit(): void {
    const allowPortal = this.route.snapshot.queryParamMap.get('allowPortal') === '1';
    if (this.auth.isAdmin() && !allowPortal) {
      this.router.navigate(['/admin']);
    }
  }

  goToDashboard() {
    this.router.navigate([this.isLoggedIn ? '/app/dashboard' : '/auth/login']);
  }
}
