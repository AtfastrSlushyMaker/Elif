import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { PetGender, PetProfile, PetProfilePayload, PetSpecies } from '../../shared/models/pet-profile.model';
import { PetProfileService } from '../../shared/services/pet-profile.service';

interface PetTimelineItem {
  title: string;
  description: string;
  date: string;
  type: 'appointment' | 'history';
}

@Component({
  selector: 'app-pet-profile-detail',
  templateUrl: './pet-profile-detail.component.html',
  styleUrl: './pet-profile-detail.component.css'
})
export class PetProfileDetailComponent implements OnInit {
  readonly speciesOptions: PetSpecies[] = ['DOG', 'CAT', 'BIRD', 'RABBIT', 'HAMSTER', 'FISH', 'REPTILE', 'OTHER'];
  readonly genderOptions: PetGender[] = ['MALE', 'FEMALE', 'UNKNOWN'];

  pet: PetProfile | null = null;
  loading = false;
  saving = false;
  deleting = false;
  formOpen = false;
  submitAttempted = false;
  error = '';
  success = '';

  readonly timeline: PetTimelineItem[] = [
    {
      title: 'General wellness check',
      description: 'Routine annual checkup completed and vitals recorded.',
      date: '2026-02-14',
      type: 'history'
    },
    {
      title: 'Vaccination reminder',
      description: 'Upcoming booster appointment needs confirmation.',
      date: '2026-04-03',
      type: 'appointment'
    }
  ];

  petForm: FormGroup;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly petProfileService: PetProfileService
  ) {
    this.petForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-zA-Z\s]+$/)]], 
      weight: [null, [Validators.min(0.01)]],
      species: ['DOG', [Validators.required]],
      breed: ['', [Validators.maxLength(100), Validators.pattern(/^[a-zA-Z\s]*$/)]],
      dateOfBirth: ['', [Validators.required, this.pastOrTodayDateValidator()]],
      gender: ['UNKNOWN', [Validators.required]],
      photoUrl: ['', [Validators.pattern(/^$|^https?:\/\/.+/i), Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loadPet();
  }

  loadPet(): void {
    const userId = this.getCurrentUserId();
    const petId = Number(this.route.snapshot.paramMap.get('id'));
    if (!userId || !petId) {
      this.error = 'Invalid pet profile link.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';
    this.petProfileService.getMyPetById(userId, petId).subscribe({
      next: (pet) => {
        this.pet = pet;
        this.loading = false;
      },
      error: (err) => {
        this.error = this.extractError(err, 'Unable to load this pet profile.');
        this.loading = false;
      }
    });
  }

  openEdit(): void {
    if (!this.pet) {
      return;
    }
    this.formOpen = true;
    this.submitAttempted = false;
    this.success = '';
    this.petForm.patchValue({
      name: this.pet.name,
      weight: this.pet.weight,
      species: this.pet.species,
      breed: this.pet.breed ?? '',
      dateOfBirth: this.pet.dateOfBirth ?? '',
      gender: this.pet.gender,
      photoUrl: this.pet.photoUrl ?? ''
    });
  }

  cancelEdit(): void {
    this.formOpen = false;
    this.submitAttempted = false;
    this.success = '';
  }

  saveEdit(): void {
    this.submitAttempted = true;
    const userId = this.getCurrentUserId();
    if (!userId || !this.pet) {
      return;
    }
    if (this.petForm.invalid) {
      this.petForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';
    this.success = '';
    this.petProfileService.updateMyPet(userId, this.pet.id, this.toPayload()).subscribe({
      next: (updated) => {
        this.pet = updated;
        this.saving = false;
        this.formOpen = false;
        this.submitAttempted = false;
        this.success = 'Pet profile updated successfully.';
      },
      error: (err) => {
        this.saving = false;
        this.error = this.extractError(err, 'Unable to update pet profile.');
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.petForm.get(controlName);
    return !!control && control.invalid && control.touched;
  }

  hasControlError(controlName: string, errorKey: string): boolean {
    return !!this.petForm.get(controlName)?.errors?.[errorKey] && this.isInvalid(controlName);
  }

  deletePet(): void {
    const userId = this.getCurrentUserId();
    if (!userId || !this.pet) {
      return;
    }

    const confirmed = window.confirm(`Delete ${this.pet.name}'s profile?`);
    if (!confirmed) {
      return;
    }

    this.deleting = true;
    this.error = '';
    this.success = '';
    this.petProfileService.deleteMyPet(userId, this.pet.id).subscribe({
      next: () => {
        this.deleting = false;
        this.router.navigate(['/app/dashboard']);
      },
      error: (err) => {
        this.deleting = false;
        this.error = this.extractError(err, 'Unable to delete pet profile.');
      }
    });
  }

  getDisplayAge(): string {
    if (!this.pet) {
      return 'Unknown';
    }
    return this.pet.ageDisplay || 'Unknown';
  }

  formatDate(dateText: string | null): string {
    if (!dateText) {
      return 'Unknown';
    }
    const parsed = new Date(dateText);
    if (Number.isNaN(parsed.getTime())) {
      return 'Unknown';
    }
    return parsed.toLocaleDateString();
  }

  goBack(): void {
    this.router.navigate(['/app/dashboard']);
  }

  private getCurrentUserId(): number | null {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      this.error = 'Please sign in to access pet profiles.';
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

  private pastOrTodayDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const selectedDate = new Date(value);
      if (Number.isNaN(selectedDate.getTime())) {
        return { invalidDate: true };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);

      return selectedDate > today ? { futureDate: true } : null;
    };
  }
}
