import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of, switchMap } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { PetGender, PetProfile, PetProfilePayload, PetSpecies } from '../../shared/models/pet-profile.model';
import { PetProfileService } from '../../shared/services/pet-profile.service';

@Component({
  selector: 'app-back-office-pets',
  templateUrl: './pets.component.html',
  styleUrl: './pets.component.css'
})
export class PetsComponent implements OnInit {
  pets: PetProfile[] = [];
  loading = false;
  saving = false;
  error = '';
  success = '';
  selectedSpecies: PetSpecies | '' = '';
  editingPetId: number | null = null;
  selectedPhotoFile: File | null = null;
  photoPreviewUrl: string | null = null;
  readonly speciesOptions: PetSpecies[] = ['DOG', 'CAT', 'BIRD', 'RABBIT', 'HAMSTER', 'FISH', 'REPTILE', 'OTHER'];
  readonly genderOptions: PetGender[] = ['MALE', 'FEMALE', 'UNKNOWN'];
  editForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly petProfileService: PetProfileService
  ) {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      weight: [null, [Validators.min(0.01)]],
      species: ['DOG', [Validators.required]],
      breed: ['', [Validators.maxLength(100)]],
      dateOfBirth: [''],
      gender: ['UNKNOWN', [Validators.required]],
      photoUrl: ['', [Validators.pattern(/^$|^https?:\/\/.+/i), Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loadAllPets();
  }

  loadAllPets(): void {
    const adminId = this.getCurrentUserId();
    if (!adminId) {
      return;
    }
    this.loading = true;
    this.error = '';
    this.petProfileService.getAllPetsForAdmin(adminId, this.selectedSpecies || undefined).subscribe({
      next: (pets) => {
        this.pets = pets;
        this.loading = false;
      },
      error: (err) => {
        this.error = this.extractError(err, 'Failed to load pet profiles for administration.');
        this.loading = false;
      }
    });
  }

  onSpeciesFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedSpecies = (select.value as PetSpecies | '') || '';
    this.loadAllPets();
  }

  startEdit(pet: PetProfile): void {
    this.editingPetId = pet.id;
    this.clearSelectedPhoto();
    this.photoPreviewUrl = pet.photoUrl ?? null;
    this.editForm.patchValue({
      name: pet.name,
      weight: pet.weight,
      species: pet.species,
      breed: pet.breed ?? '',
      dateOfBirth: pet.dateOfBirth ?? '',
      gender: pet.gender,
      photoUrl: this.toHttpUrlOrEmpty(pet.photoUrl)
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.error = 'Please select an image file.';
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.error = 'Image size must be 5MB or less.';
      input.value = '';
      return;
    }

    this.clearSelectedPhoto();
    this.selectedPhotoFile = file;
    this.photoPreviewUrl = URL.createObjectURL(file);
    this.editForm.patchValue({ photoUrl: '' });
    this.error = '';
  }

  cancelEdit(): void {
    this.editingPetId = null;
    this.clearSelectedPhoto();
    this.photoPreviewUrl = null;
    this.editForm.reset({
      name: '',
      weight: null,
      species: 'DOG',
      breed: '',
      dateOfBirth: '',
      gender: 'UNKNOWN',
      photoUrl: ''
    });
  }

  submitEdit(): void {
    const adminId = this.getCurrentUserId();
    if (!adminId || !this.editingPetId) {
      return;
    }
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.petProfileService.updatePetAsAdmin(adminId, this.editingPetId, this.toPayload()).pipe(
      switchMap((pet) => {
        if (!this.selectedPhotoFile) {
          return of(pet);
        }
        return this.petProfileService.uploadPetPhotoAsAdmin(adminId, pet.id, this.selectedPhotoFile);
      })
    ).subscribe({
      next: () => {
        this.saving = false;
        this.success = 'Pet profile updated successfully.';
        this.cancelEdit();
        this.loadAllPets();
      },
      error: (err) => {
        this.saving = false;
        this.error = this.extractError(err, 'Failed to update pet profile.');
      }
    });
  }

  removeSelectedPhoto(): void {
    this.clearSelectedPhoto();
    this.photoPreviewUrl = null;
    this.editForm.patchValue({ photoUrl: '' });
  }

  deletePet(pet: PetProfile): void {
    const adminId = this.getCurrentUserId();
    if (!adminId) {
      return;
    }
    const confirmed = window.confirm(`Delete ${pet.name}'s profile from back office?`);
    if (!confirmed) {
      return;
    }
    this.petProfileService.deletePetAsAdmin(adminId, pet.id).subscribe({
      next: () => this.loadAllPets(),
      error: (err) => {
        this.error = this.extractError(err, 'Failed to delete pet profile.');
      }
    });
  }

  private getCurrentUserId(): number | null {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      this.error = 'You must be logged in to access back-office pet management.';
      return null;
    }
    return user.id;
  }

  private toPayload(): PetProfilePayload {
    const value = this.editForm.value;
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

  private toHttpUrlOrEmpty(value: string | null): string {
    if (!value) {
      return '';
    }
    return /^https?:\/\//i.test(value) ? value : '';
  }

  private clearSelectedPhoto(): void {
    if (this.photoPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.photoPreviewUrl);
    }
    this.selectedPhotoFile = null;
  }

  private extractError(err: unknown, fallback: string): string {
    const apiError = err as { error?: { error?: string; message?: string } };
    return apiError?.error?.error || apiError?.error?.message || fallback;
  }
}
