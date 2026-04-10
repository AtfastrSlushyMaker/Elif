import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-adoption',
  templateUrl: './adoption.component.html',
  styleUrl: './adoption.component.css'
})
export class AdoptionComponent {
  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get isShelter(): boolean {
    return this.auth.isShelter();
  }

  get isPetsActive(): boolean {
    return this.router.url.startsWith('/app/adoption/pets') || this.router.url.startsWith('/app/adoption/find-my-pet');
  }

  get isSheltersActive(): boolean {
    return this.router.url.startsWith('/app/adoption/shelters');
  }

  get isMyRequestsActive(): boolean {
    return this.router.url.startsWith('/app/adoption/my-requests');
  }

  get isMyContractsActive(): boolean {
    return this.router.url.startsWith('/app/adoption/my-contracts');
  }
}
