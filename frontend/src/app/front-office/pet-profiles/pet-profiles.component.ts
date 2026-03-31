import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
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
  success = '';
  searchTerm = '';
  sortMode: 'name' | 'species' = 'name';
  formOpen = false;
  editingPetId: number | null = null;
  photoPreviewUrl: string | null = null;
  selectedPhotoFile: File | null = null;
  uploadingPhoto = false;
  isDragActive = false;
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
      gender: ['UNKNOWN', [Validators.required]],
      photoUrl: ['', [Validators.pattern(/^$|^https?:\/\/.+/i), Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loadPets();
  }

  get displayedPets(): PetProfile[] {
    const query = this.searchTerm.trim().toLowerCase();

    let items = [...this.pets];

    if (this.selectedSpecies) {
      items = items.filter((pet) => pet.species === this.selectedSpecies);
    }

    if (query) {
      items = items.filter((pet) =>
        pet.name.toLowerCase().includes(query)
        || (pet.breed ?? '').toLowerCase().includes(query)
        || pet.species.toLowerCase().includes(query)
      );
    }

    if (this.sortMode === 'species') {
      return items.sort((a, b) => `${a.species}${a.name}`.localeCompare(`${b.species}${b.name}`));
    }

    return items.sort((a, b) => a.name.localeCompare(b.name));
  }

  get filterSummary(): string {
    const activeFilters = Number(Boolean(this.searchTerm.trim())) + Number(Boolean(this.selectedSpecies));
    return `${this.displayedPets.length} shown of ${this.pets.length} total • ${activeFilters} filter${activeFilters === 1 ? '' : 's'} active`;
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedSpecies = '';
    this.sortMode = 'name';
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
    this.clearSelectedPhoto();
    this.photoPreviewUrl = null;
    this.petForm.reset({
      name: '',
      weight: null,
      species: 'DOG',
      breed: '',
      dateOfBirth: '',
      gender: 'UNKNOWN',
      photoUrl: ''
    });
    this.error = '';
    this.success = '';
  }

  openEditForm(pet: PetProfile): void {
    this.formOpen = true;
    this.editingPetId = pet.id;
    this.clearSelectedPhoto();
    this.photoPreviewUrl = pet.photoUrl ?? null;
    this.petForm.patchValue({
      name: pet.name,
      weight: pet.weight,
      species: pet.species,
      breed: pet.breed ?? '',
      dateOfBirth: pet.dateOfBirth ?? '',

      gender: pet.gender,
      photoUrl: this.toHttpUrlOrEmpty(pet.photoUrl)
    });
    this.error = '';
    this.success = '';
  }

  cancelForm(): void {
    this.formOpen = false;
    this.editingPetId = null;
    this.clearSelectedPhoto();
    this.photoPreviewUrl = null;
    this.uploadingPhoto = false;
    this.error = '';
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.applySelectedFile(file);
    input.value = '';
  }

  openFilePicker(input: HTMLInputElement): void {
    input.click();
  }

  onUploadDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragActive = true;
  }

  onUploadDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragActive = false;
  }

  onUploadDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragActive = false;

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.applySelectedFile(file);
      return;
    }

    const droppedUrl = (event.dataTransfer?.getData('text/uri-list') || event.dataTransfer?.getData('text/plain') || '').trim();
    if (this.isHttpUrl(droppedUrl)) {
      this.petForm.patchValue({ photoUrl: droppedUrl });
      this.syncPhotoUrlPreview();
      this.success = 'Image URL added from drop.';
    }
  }

  onUploadPaste(event: ClipboardEvent): void {
    const clipboard = event.clipboardData;
    if (!clipboard) {
      return;
    }

    const imageItem = Array.from(clipboard.items).find((item) => item.type.startsWith('image/'));
    if (imageItem) {
      const file = imageItem.getAsFile();
      if (file) {
        event.preventDefault();
        this.applySelectedFile(file);
      }
      return;
    }

    const pastedText = (clipboard.getData('text/plain') || '').trim();
    if (this.isHttpUrl(pastedText)) {
      event.preventDefault();
      this.petForm.patchValue({ photoUrl: pastedText });
      this.syncPhotoUrlPreview();
      this.success = 'Image URL pasted successfully.';
    }
  }

  syncPhotoUrlPreview(): void {
    const url = this.toHttpUrlOrEmpty(this.petForm.get('photoUrl')?.value ?? null);
    if (url) {
      this.clearSelectedFile();
      this.photoPreviewUrl = url;
      return;
    }

    if (!this.selectedPhotoFile) {
      this.photoPreviewUrl = null;
    }
  }

  removeSelectedPhoto(): void {
    this.clearSelectedPhoto();
    this.petForm.patchValue({ photoUrl: '' });
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
    this.uploadingPhoto = false;
    this.error = '';
    this.success = '';

    const request$ = this.editingPetId
      ? this.petProfileService.updateMyPet(userId, this.editingPetId, payload)
      : this.petProfileService.createMyPet(userId, payload);

    request$.pipe(
      switchMap((pet) => {
        if (!this.selectedPhotoFile) {
          return of(pet);
        }
        this.uploadingPhoto = true;
        return this.petProfileService.uploadMyPetPhoto(userId, pet.id, this.selectedPhotoFile);
      })
    ).subscribe({
      next: () => {
        this.saving = false;
        this.uploadingPhoto = false;
        this.formOpen = false;
        this.editingPetId = null;
        this.clearSelectedPhoto();
        this.photoPreviewUrl = null;
        this.success = 'Pet profile saved successfully.';
        this.loadPets();
      },
      error: (err) => {
        this.saving = false;
        this.uploadingPhoto = false;
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

  getSpeciesIcon(species: PetSpecies): string {
    const map: Record<PetSpecies, string> = {
      DOG: 'fa-dog',
      CAT: 'fa-cat',
      BIRD: 'fa-dove',
      RABBIT: 'fa-carrot',
      HAMSTER: 'fa-paw',
      FISH: 'fa-fish',
      REPTILE: 'fa-dragon',
      OTHER: 'fa-paw'
    };
    return map[species] ?? 'fa-paw';
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

  private toHttpUrlOrEmpty(value: string | null): string {
    if (!value) {
      return '';
    }
    return /^https?:\/\//i.test(value) ? value : '';
  }

  private applySelectedFile(file: File): void {
    this.clearSelectedPhoto();

    if (!file.type.startsWith('image/')) {
      this.error = 'Please select an image file.';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.error = 'Image size must be 5MB or less.';
      return;
    }

    this.selectedPhotoFile = file;
    this.photoPreviewUrl = URL.createObjectURL(file);
    this.petForm.patchValue({ photoUrl: '' });
    this.error = '';
    this.success = 'Image selected successfully.';
  }

  private clearSelectedFile(): void {
    if (this.photoPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.photoPreviewUrl);
      this.photoPreviewUrl = null;
    }
    this.selectedPhotoFile = null;
  }

  private isHttpUrl(value: string): boolean {
    return /^https?:\/\//i.test(value);
  }

  private clearSelectedPhoto(): void {
    this.clearSelectedFile();
    this.photoPreviewUrl = null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.petForm.get(fieldName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

}
