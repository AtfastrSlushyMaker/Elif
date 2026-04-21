import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import { PetService } from '../../services/pet.service';
import { ShelterService } from '../../services/shelter.service';
import { RequestService } from '../../services/request.service';

@Component({
  selector: 'app-shelter-pets',
  templateUrl: './shelter-pets.component.html',
  styleUrls: ['./shelter-pets.component.css']
})
export class ShelterPetsComponent implements OnInit {
  pets: any[] = [];
  requestsCount: { [petId: number]: number } = {};
  loading = true;
  error: string | null = null;
  shelterId: number | null = null;

  constructor(
    private authService: AuthService,
    private petService: PetService,
    private shelterService: ShelterService,
    private requestService: RequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/app/adoption/shelter/pets' }
      });
      return;
    }

    if (user.role !== 'SHELTER') {
      this.router.navigate(['/app/adoption/pets']);
      return;
    }

    if (!user.id) {
      console.error('User ID not found');
      this.router.navigate(['/app/adoption/shelter/dashboard']);
      return;
    }

    this.loadShelter(user.id);
  }

  loadShelter(userId: number): void {
    this.shelterService.getShelterByUserId(userId).subscribe({
      next: (shelter) => {
        this.shelterId = shelter.id ?? null;
        this.loadPets();
      },
      error: (err) => {
        console.error('Shelter not found', err);
        this.error = 'Shelter not found';
        this.loading = false;
        this.router.navigate(['/app/adoption/shelter/dashboard']);
      }
    });
  }

  loadPets(): void {
    if (!this.shelterId) return;
    this.loading = true;
    this.petService.getByShelter(this.shelterId).subscribe({
      next: (data) => {
        this.pets = data;
        this.loading = false;
        this.loadRequestsCount();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error loading pets';
        this.loading = false;
      }
    });
  }

 loadRequestsCount(): void {
  if (!this.shelterId) return;

  this.requestService.getByShelter(this.shelterId).subscribe({
    next: (requests) => {
      this.pets.forEach(pet => {
        // Count only active requests.
        const count = requests.filter(req =>
          req.petId === pet.id &&
          req.status !== 'CANCELLED' &&
          req.status !== 'REJECTED'
        ).length;
        this.requestsCount[pet.id] = count;
      });
    },
    error: (err) => {
      console.error('Error loading requests', err);
      this.pets.forEach(pet => {
        this.requestsCount[pet.id] = 0;
      });
    }
  });
}

  // Getters to separate available and adopted pets
  get availablePets(): any[] {
    return this.pets.filter(pet => pet.available === true);
  }

  get adoptedPets(): any[] {
    return this.pets.filter(pet => pet.available === false);
  }

  addPet(): void {
    this.router.navigate(['/app/adoption/shelter/pets/new']);
  }

  editPet(id: number): void {
    this.router.navigate(['/app/adoption/shelter/pets/edit', id]);
  }

  deletePet(id: number): void {
    if (confirm('Are you sure you want to delete this pet?')) {
      this.petService.delete(id).subscribe({
        next: () => {
          this.loadPets();
        },
        error: (err) => {
          alert('Error deleting pet');
          console.error(err);
        }
      });
    }
  }

  goToRequests(): void {
    this.router.navigate(['/app/adoption/shelter/requests']);
  }

  viewRequests(petId: number): void {
    this.router.navigate(['/app/adoption/shelter/requests'], {
      queryParams: { petId: petId }
    });
  }

  getPetTypeLabel(type: string): string {
    const types: any = {
      'CHIEN': 'Dog',
      'CHAT': 'Cat',
      'OISEAU': 'Bird',
      'LAPIN': 'Rabbit',
      'RONGEUR': 'Rodent',
      'REPTILE': 'Reptile',
      'POISSON': 'Fish',
      'AUTRE': 'Other'
    };
    return types[type] || type;
  }

  getPetSizeLabel(size: string): string {
    const sizes: any = {
      'PETIT': 'Small',
      'MOYEN': 'Medium',
      'GRAND': 'Large',
      'TRES_GRAND': 'Extra Large'
    };
    return sizes[size] || size;
  }

  getPetIcon(petName: string): string {
    return petName ? petName.charAt(0).toUpperCase() : 'P';
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

  getPhotoUrl(photos: string | null | undefined): string {
    const first = this.getFirstPhoto(photos);
    return first ? this.petService.buildMediaUrl(first) : '';
  }
}
