import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-shelter-dashboard',
  templateUrl: './shelter-dashboard.component.html',
  styleUrl: './shelter-dashboard.component.css'
})
export class ShelterDashboardComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/app/adoption/shelter/dashboard' }
      });
      return;
    }

    if (user.role !== 'SHELTER') {
      this.router.navigate(['/app/adoption/pets']);
    }
  }

}
