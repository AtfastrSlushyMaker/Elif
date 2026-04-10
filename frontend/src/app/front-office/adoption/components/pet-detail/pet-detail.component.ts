import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PetService } from '../../services/pet.service';
import { ShelterService } from '../../services/shelter.service';
import { RequestService } from '../../services/request.service';
import { AuthService } from '../../../../auth/auth.service';
import { AdoptionPet } from '../../models/adoption-pet.model';
import { Shelter } from '../../models/shelter.model';

@Component({
  selector: 'app-pet-detail',
  templateUrl: './pet-detail.component.html',
  styleUrls: ['./pet-detail.component.css']
})
export class PetDetailComponent implements OnInit {
  pet: AdoptionPet | null = null;
  shelter: Shelter | null = null;
  loading = true;
  error: string | null = null;
  requestModalOpen = false;
  requestSubmitting = false;
  requestError: string | null = null;
  requestSuccess = false;
  requestForm: FormGroup;
  private shouldOpenModalFromQuery = false;

  // Track whether the user came from the suggestion wizard.
  cameFromWizard = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private petService: PetService,
    private shelterService: ShelterService,
    private requestService: RequestService,
    private authService: AuthService
  ) {
    this.requestForm = this.fb.group({
      housingType: ['', Validators.required],
      experienceLevel: ['', Validators.required],
      hasGarden: [false],
      hasChildren: [false],
      otherPets: [''],
      notes: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.params['id']);

    this.cameFromWizard = localStorage.getItem('cameFromWizard') === 'true';

    this.route.queryParamMap.subscribe((params) => {
      const shouldOpen = params.get('adopt') === '1';
      if (!shouldOpen) {
        return;
      }

      if (this.pet && !this.loading) {
        this.openAdoptionModal();
      } else {
        this.shouldOpenModalFromQuery = true;
      }
    });

    if (id) {
      this.loadPet(id);
    } else {
      this.error = 'Pet not found';
      this.loading = false;
    }
  }

  loadPet(id: number): void {
    this.loading = true;
    this.petService.getById(id).subscribe({
      next: (data) => {
        this.pet = data;
        this.loading = false;

        if (this.shouldOpenModalFromQuery) {
          this.shouldOpenModalFromQuery = false;
          this.openAdoptionModal();
        }

        if (this.pet.shelterId) {
          this.loadShelter(this.pet.shelterId);
        }
      },
      error: (err) => {
        this.error = 'Error loading pet details';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadShelter(shelterId: number): void {
    this.shelterService.getById(shelterId).subscribe({
      next: (data) => {
        this.shelter = data;
      },
      error: (err) => {
        console.error('Error loading shelter:', err);
      }
    });
  }

  goBack(): void {
    if (this.cameFromWizard) {
      this.goBackToWizard();
    } else {
      this.goBackToAllPets();
    }
  }

  goBackToAllPets(): void {
    this.router.navigate(['/app/adoption/pets']);
  }

  goBackToWizard(): void {
    this.router.navigate(['/app/adoption/find-my-pet']);
  }

  adopt(): void {
    this.openAdoptionModal();
  }

  openAdoptionModal(): void {
    if (!this.pet || !this.pet.available) {
      return;
    }

    if (!this.authService.isLoggedIn()) {
      const returnUrl = `/app/adoption/pets/${this.pet.id}?adopt=1`;
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl }
      });
      return;
    }

    this.requestError = null;
    this.requestSuccess = false;
    this.requestSubmitting = false;
    this.requestModalOpen = true;
  }

  closeAdoptionModal(clearQuery = true): void {
    this.requestModalOpen = false;

    if (clearQuery) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { adopt: null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }
  }

  submitAdoptionRequest(): void {
    if (!this.pet || !this.pet.id) {
      this.requestError = 'Pet details are missing. Please refresh and try again.';
      return;
    }

    if (this.requestForm.invalid) {
      Object.keys(this.requestForm.controls).forEach((key) => {
        this.requestForm.get(key)?.markAsTouched();
      });
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      this.requestError = 'Please log in to submit an adoption request.';
      return;
    }

    this.requestSubmitting = true;
    this.requestError = null;

    this.requestService.create({
      petId: this.pet.id,
      housingType: this.requestForm.get('housingType')?.value,
      experienceLevel: this.requestForm.get('experienceLevel')?.value,
      hasGarden: !!this.requestForm.get('hasGarden')?.value,
      hasChildren: !!this.requestForm.get('hasChildren')?.value,
      otherPets: this.requestForm.get('otherPets')?.value || '',
      notes: this.requestForm.get('notes')?.value || ''
    }, user.id).subscribe({
      next: () => {
        this.requestSubmitting = false;
        this.requestSuccess = true;

        setTimeout(() => {
          this.closeAdoptionModal();
          this.router.navigate(['/app/adoption/my-requests']);
        }, 1100);
      },
      error: (err) => {
        this.requestSubmitting = false;
        this.requestError = err?.error?.message || 'Could not submit your request. Please try again.';
      }
    });
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getPetTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
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
    const sizes: { [key: string]: string } = {
      'PETIT': 'Small',
      'MOYEN': 'Medium',
      'GRAND': 'Large',
      'TRES_GRAND': 'Extra Large'
    };
    return sizes[size] || size;
  }

  getAgeText(age?: number): string {
    if (!age) return 'Age not specified';
    const years = Math.floor(age / 12);
    const months = age % 12;
    if (years === 0) return `${months} month${months > 1 ? 's' : ''}`;
    if (months === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years} year${years > 1 ? 's' : ''} and ${months} month${months > 1 ? 's' : ''}`;
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
    if (!first) {
      return '';
    }
    return this.petService.buildMediaUrl(first);
  }
}
