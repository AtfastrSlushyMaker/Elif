import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: false,
  templateUrl: './landing.component.html'
})
export class LandingComponent {
  constructor(private router: Router) {}

  goToDashboard() {
    this.router.navigate(['/app/dashboard']);
  }
}
