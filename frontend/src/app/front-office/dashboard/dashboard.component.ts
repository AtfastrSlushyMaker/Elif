import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { PetGender, PetProfile, PetProfilePayload, PetSpecies } from '../../shared/models/pet-profile.model';
import { PetProfileService } from '../../shared/services/pet-profile.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  readonly speciesOptions: PetSpecies[] = ['DOG', 'CAT', 'BIRD', 'RABBIT', 'HAMSTER', 'FISH', 'REPTILE', 'OTHER'];
  readonly genderOptions: PetGender[] = ['MALE', 'FEMALE', 'UNKNOWN'];

  pets: PetProfile[] = [];
  editingPetId: number | null = null;
  loading = false;
  adding = false;
  showQuickAdd = false;
  error = '';
  quickAddForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly petProfileService: PetProfileService,
    private readonly router: Router
  ) {
    this.quickAddForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      species: ['DOG', [Validators.required]],
      breed: ['', [Validators.maxLength(100)]],
      weight: [null, [Validators.min(0.01)]],
      dateOfBirth: [''],
      age: [null, [Validators.min(0), Validators.max(80)]],
      gender: ['UNKNOWN', [Validators.required]],
      photoUrl: ['', [Validators.pattern(/^$|^https?:\/\/.+/i), Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loadPets();
  }

  get visiblePets(): PetProfile[] {
    return this.pets;
  }

  openPetDetails(petId: number): void {
    this.router.navigate(['/app/pets', petId]);
  }

  loadPets(): void {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.petProfileService.getMyPets(userId).subscribe({
      next: (pets) => {
        this.pets = pets;
        this.loading = false;
      },
      error: (err) => {
        this.error = this.extractError(err, 'Failed to load your pets on dashboard.');
        this.loading = false;
      }
    });
  }

  openQuickAddModal(): void {
    this.showQuickAdd = true;
  }

  closeQuickAddModal(): void {
    this.showQuickAdd = false;
    this.cancelPetEdit();
  }

  submitQuickAdd(): void {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return;
    }
    if (this.quickAddForm.invalid) {
      this.quickAddForm.markAllAsTouched();
      return;
    }

    this.adding = true;
    this.error = '';

    const payload = this.toPayload();
    const request$ = this.editingPetId
      ? this.petProfileService.updateMyPet(userId, this.editingPetId, payload)
      : this.petProfileService.createMyPet(userId, payload);

    request$.subscribe({
      next: () => {
        this.adding = false;
        this.showQuickAdd = false;
        this.resetForm();
        this.editingPetId = null;
        this.loadPets();
      },
      error: (err) => {
        this.adding = false;
        this.error = this.extractError(err, 'Failed to save pet profile.');
      }
    });
  }

  cancelPetEdit(): void {
    this.editingPetId = null;
    this.resetForm();
    this.error = '';
  }

  getDisplayAge(pet: PetProfile): string {
    if (pet.age !== null && pet.age !== undefined) {
      return `${pet.age} year(s)`;
    }
    if (!pet.dateOfBirth) {
      return 'Unknown';
    }
    const now = new Date();
    const dob = new Date(pet.dateOfBirth);
    let age = now.getFullYear() - dob.getFullYear();
    const monthGap = now.getMonth() - dob.getMonth();
    if (monthGap < 0 || (monthGap === 0 && now.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 0 ? `${age} year(s)` : 'Unknown';
  }

  private getCurrentUserId(): number | null {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      this.error = 'Please log in to manage pets from dashboard.';
      return null;
    }
    return user.id;
  }

  private toPayload(): PetProfilePayload {
    const value = this.quickAddForm.value;
    return {
      name: String(value.name ?? '').trim(),
      species: value.species as PetSpecies,
      breed: this.toText(value.breed),
      weight: this.toNumber(value.weight),
      dateOfBirth: this.toText(value.dateOfBirth),
      age: this.toNumber(value.age),
      gender: value.gender as PetGender,
      photoUrl: this.toText(value.photoUrl)
    };
  }

  private resetForm(): void {
    this.quickAddForm.reset({
      name: '',
      species: 'DOG',
      breed: '',
      weight: null,
      dateOfBirth: '',
      age: null,
      gender: 'UNKNOWN',
      photoUrl: ''
    });
  }

  private toText(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    const text = String(value).trim();
    return text.length ? text : null;
  }

  private toNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
  }

  private extractError(err: unknown, fallback: string): string {
    const apiError = err as { error?: { error?: string; message?: string } };
    return apiError?.error?.error || apiError?.error?.message || fallback;
  }

}
