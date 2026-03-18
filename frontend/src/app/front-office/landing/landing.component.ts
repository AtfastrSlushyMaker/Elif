import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-landing',
  standalone: false,
  templateUrl: './landing.component.html'
})
export class LandingComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute, private auth: AuthService) {}

  ngOnInit(): void {
    const allowPortal = this.route.snapshot.queryParamMap.get('allowPortal') === '1';
    if (this.auth.isAdmin() && !allowPortal) {
      this.router.navigate(['/admin']);
    }
  }

  goToDashboard() {
    this.router.navigate(['/app/dashboard']);
  }
}
