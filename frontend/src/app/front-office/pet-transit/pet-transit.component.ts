import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-pet-transit',
  templateUrl: './pet-transit.component.html',
  styleUrl: './pet-transit.component.css'
})
export class PetTransitComponent {
  constructor(private auth: AuthService) {}

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }
}
