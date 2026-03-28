import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  error = '';

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
    this.petForm.patchValue({
      name: this.pet.name,
      weight: this.pet.weight,
      species: this.pet.species,
      breed: this.pet.breed ?? '',
      dateOfBirth: this.pet.dateOfBirth ?? '',
      age: this.pet.age,
      gender: this.pet.gender,
      photoUrl: this.pet.photoUrl ?? ''
    });
  }

  cancelEdit(): void {
    this.formOpen = false;
  }

  saveEdit(): void {
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
    this.petProfileService.updateMyPet(userId, this.pet.id, this.toPayload()).subscribe({
      next: (updated) => {
        this.pet = updated;
        this.saving = false;
        this.formOpen = false;
      },
      error: (err) => {
        this.saving = false;
        this.error = this.extractError(err, 'Unable to update pet profile.');
      }
    });
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
    if (this.pet.age !== null && this.pet.age !== undefined) {
      return `${this.pet.age} year(s)`;
    }
    if (!this.pet.dateOfBirth) {
      return 'Unknown';
    }

    const now = new Date();
    const dob = new Date(this.pet.dateOfBirth);
    let age = now.getFullYear() - dob.getFullYear();
    const monthGap = now.getMonth() - dob.getMonth();
    if (monthGap < 0 || (monthGap === 0 && now.getDate() < dob.getDate())) {
      age--;
    }
    return age >= 0 ? `${age} year(s)` : 'Unknown';
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
      age: this.toNumber(value.age),
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
}
