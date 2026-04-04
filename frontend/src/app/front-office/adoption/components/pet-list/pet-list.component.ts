import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PetService } from '../../services/pet.service';
import { AuthService } from '../../../../auth/auth.service';
import { AdoptionPet } from '../../models/adoption-pet.model';

@Component({
  selector: 'app-pet-list',
  templateUrl: './pet-list.component.html',
  styleUrls: ['./pet-list.component.css']
})
export class PetListComponent implements OnInit {
  pets: AdoptionPet[] = [];
  loading = true;
  error: string | null = null;
  isLoggedIn = false;
  
  filters = {
    type: '',
    size: ''
  };

  constructor(
    private petService: PetService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.loadPets();
  }

  loadPets(): void {
    this.loading = true;
    this.petService.getAvailable().subscribe({
      next: (data) => {
        this.pets = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading animals';
        this.loading = false;
        console.error(err);
      }
    });
  }

  search(): void {
    this.loading = true;
    this.petService.search(this.filters).subscribe({
      next: (data) => {
        this.pets = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  resetFilters(): void {
    this.filters = { type: '', size: '' };
    this.loadPets();
  }

  goToShelters(): void {
    this.router.navigate(['/app/adoption/shelters']);
  }

  goToMyRequests(): void {
    this.router.navigate(['/app/adoption/my-requests']);
  }

  // ✅ NOUVELLE MÉTHODE - Find My Perfect Pet
  goToWizard(): void {
    this.router.navigate(['/app/adoption/find-my-pet']);
  }

  checkAdopt(pet: AdoptionPet): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/app/adoption/pets', pet.id, 'adopt']);
    } else {
      alert('🔒 You must be logged in to adopt an animal.\n\nPlease sign up or log in.');
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: this.router.url }
      });
    }
  }

  // ============================================================
  // MÉTHODES D'AFFICHAGE
  // ============================================================

  getPetTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      'CHIEN': '🐕 Dog',
      'CHAT': '🐈 Cat',
      'OISEAU': '🐦 Bird',
      'LAPIN': '🐇 Rabbit',
      'RONGEUR': '🐭 Rodent',
      'REPTILE': '🐍 Reptile',
      'POISSON': '🐟 Fish',
      'AUTRE': '🐾 Other'
    };
    return types[type] || type;
  }

  getPetSizeLabel(size: string): string {
    const sizes: { [key: string]: string } = {
      'PETIT': 'Small',
      'MOYEN': 'Medium',
      'GRAND': 'Large',
      'TRES_GRAND': 'Extra Large'
    };
    return sizes[size] || size;
  }

  getFirstPhoto(photos: string | null | undefined): string {
    if (!photos) return '';
    try {
      const photoArray = JSON.parse(photos);
      if (Array.isArray(photoArray) && photoArray.length > 0) {
        return photoArray[0];
      }
    } catch {
      return photos;
    }
    return '';
  }
}