import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { PetGender, PetProfile, PetProfilePayload, PetSpecies } from '../../shared/models/pet-profile.model';
import { PetProfileService } from '../../shared/services/pet-profile.service';

@Component({
  selector: 'app-pet-profiles',
  templateUrl: './pet-profiles.component.html',
  styleUrl: './pet-profiles.component.css'
})
export class PetProfilesComponent implements OnInit {
  pets: PetProfile[] = [];
  loading = false;
  saving = false;
  error = '';
  formOpen = false;
  editingPetId: number | null = null;
  selectedSpecies: PetSpecies | '' = '';
  readonly speciesOptions: PetSpecies[] = ['DOG', 'CAT', 'BIRD', 'RABBIT', 'HAMSTER', 'FISH', 'REPTILE', 'OTHER'];
  readonly genderOptions: PetGender[] = ['MALE', 'FEMALE', 'UNKNOWN'];

  petForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly petProfileService: PetProfileService,
    private readonly router: Router
  ) {
    this.petForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      weight: [null, [Validators.min(0.01)]],
      species: ['DOG', [Validators.required]],
      breed: ['', [Validators.maxLength(100)]],
      dateOfBirth: [''],
      age: [null, [Validators.min(0), Validators.max(80)]],
      gender: ['UNKNOWN', [Validators.required]],
      photoUrl: ['', [Validators.pattern(/^$|^https?:\/\/.+/i), Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loadPets();
  }

  loadPets(): void {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.petProfileService.getMyPets(userId, this.selectedSpecies || undefined).subscribe({
      next: (pets) => {
        this.pets = pets;
        this.loading = false;
      },
      error: (err) => {
        const errorMsg = this.extractError(err, 'Failed to load pets.');
        if (errorMsg.includes('Invalid user id') || errorMsg.includes('User ID')) {
          this.error = 'Your session is invalid. Please log out and log back in.';
        } else {
          this.error = errorMsg;
        }
        this.loading = false;
      }
    });
  }

  openCreateForm(): void {
    this.formOpen = true;
    this.editingPetId = null;
    this.petForm.reset({
      name: '',
      weight: null,
      species: 'DOG',
      breed: '',
      dateOfBirth: '',
      age: null,
      gender: 'UNKNOWN',
      photoUrl: ''
    });
    this.error = '';
  }

  openEditForm(pet: PetProfile): void {
    this.formOpen = true;
    this.editingPetId = pet.id;
    this.petForm.patchValue({
      name: pet.name,
      weight: pet.weight,
      species: pet.species,
      breed: pet.breed ?? '',
      dateOfBirth: pet.dateOfBirth ?? '',

      gender: pet.gender,
      photoUrl: pet.photoUrl ?? ''
    });
    this.error = '';
  }

  cancelForm(): void {
    this.formOpen = false;
    this.editingPetId = null;
    this.error = '';
  }

  submitForm(): void {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return;
    }
    if (this.petForm.invalid) {
      this.petForm.markAllAsTouched();
      this.error = 'Please complete the required fields before creating the profile.';
      return;
    }

    const payload = this.toPayload();
    this.saving = true;
    this.error = '';

    const request$ = this.editingPetId
      ? this.petProfileService.updateMyPet(userId, this.editingPetId, payload)
      : this.petProfileService.createMyPet(userId, payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.formOpen = false;
        this.editingPetId = null;
        this.loadPets();
      },
      error: (err) => {
        this.saving = false;
        this.error = this.extractError(err, 'Failed to save pet profile.');
      }
    });
  }

  deletePet(pet: PetProfile): void {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return;
    }
    const confirmed = window.confirm(`Delete ${pet.name}'s profile?`);
    if (!confirmed) {
      return;
    }

    this.petProfileService.deleteMyPet(userId, pet.id).subscribe({
      next: () => this.loadPets(),
      error: (err) => {
        this.error = this.extractError(err, 'Failed to delete pet profile.');
      }
    });
  }

  logoutAndRedirect(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  getDisplayAge(pet: PetProfile): string {
    return pet.ageDisplay || 'Unknown';
  }

  private getCurrentUserId(): number | null {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      this.error = 'Please log in to manage your pets.';
      return null;
    }
    return user.id;
  }

  private toPayload(): PetProfilePayload {
    const value = this.petForm.value;
    return {
      name: String(value.name ?? '').trim(),
      weight: this.toNumber(value.weight),
      species: value.species as PetSpecies,
      breed: this.toText(value.breed),
      dateOfBirth: this.toText(value.dateOfBirth),

      gender: value.gender as PetGender,
      photoUrl: this.toText(value.photoUrl)
    };
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

  isFieldInvalid(fieldName: string): boolean {
    const control = this.petForm.get(fieldName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

}
