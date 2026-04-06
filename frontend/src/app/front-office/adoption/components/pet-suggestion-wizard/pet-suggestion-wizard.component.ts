import { Component, HostListener, OnInit, Optional } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PetService } from '../../services/pet.service';
import { AuthService } from '../../../../auth/auth.service';

interface PetSuggestion {
  id: number;
  name: string;
  type: string;
  breed?: string;
  age?: number | null;
  gender?: string;
  size?: string;
  photos?: string | null;
  available?: boolean;
  compatibilityScore: number;
  matchReasons?: string[];
  warningReasons?: string[];
}

interface WizardCriteria {
  type: string | null;
  size: string | null;
  gender: string | null;
  breed: string;
  color: string;
  maxAge: number | null;
  spayedNeutered: boolean | null;
  hasSpecialNeeds: boolean;
  housingType: string | null;
  hasGarden: boolean;
  hasChildren: boolean;
  hasOtherPets: boolean;
  experienceLevel: string | null;
}

interface WizardStateV2 {
  version: 2;
  savedAt: number;
  currentStep: number;
  criteria: WizardCriteria;
  suggestions: PetSuggestion[];
}

@Component({
  selector: 'app-pet-suggestion-wizard',
  templateUrl: './pet-suggestion-wizard.component.html',
  styleUrls: ['./pet-suggestion-wizard.component.css']
})
export class PetSuggestionWizardComponent implements OnInit {

  currentStep = 1;
  totalSteps  = 4;
  loading     = false;
  error: string | null = null;
  suggestions: PetSuggestion[] = [];

  private readonly stateKey = 'adoptionWizardStateV2';
  private readonly stateTtlMs = 1000 * 60 * 60 * 24;
  private latestRequestToken = 0;

  // Wizard criteria
  criteria: WizardCriteria = this.createDefaultCriteria();

  // Selection options
  petTypes = [
    { value: 'CHIEN',   label: 'Dog',    desc: 'Loyal and active companion', icon: 'fas fa-dog' },
    { value: 'CHAT',    label: 'Cat',    desc: 'Independent and affectionate', icon: 'fas fa-cat' },
    { value: 'LAPIN',   label: 'Rabbit', desc: 'Gentle and curious', icon: 'fas fa-carrot' },
    { value: 'OISEAU',  label: 'Bird',   desc: 'Cheerful and social', icon: 'fas fa-dove' },
    { value: 'RONGEUR', label: 'Rodent', desc: 'Small and playful', icon: 'fas fa-paw' },
    { value: 'REPTILE', label: 'Reptile', desc: 'Unique and fascinating', icon: 'fas fa-dragon' },
    { value: 'AUTRE',   label: 'Other',  desc: 'Surprise me', icon: 'fas fa-shapes' }
  ];

  sizes = [
    { value: 'PETIT',     label: 'Small',      desc: 'Under 10kg' },
    { value: 'MOYEN',     label: 'Medium',     desc: '10 - 25kg' },
    { value: 'GRAND',     label: 'Large',      desc: '25 - 45kg' },
    { value: 'TRES_GRAND', label: 'Extra Large', desc: 'Over 45kg' }
  ];

  genders = [
    { value: 'MALE',    label: 'Male' },
    { value: 'FEMELLE', label: 'Female' }
  ];

  housingTypes = [
    { value: 'APARTMENT', label: 'Apartment', desc: 'No outdoor space', icon: 'fas fa-building' },
    { value: 'HOUSE',     label: 'House',     desc: 'With or without garden', icon: 'fas fa-house' },
    { value: 'FARM',      label: 'Farm',      desc: 'Large outdoor space', icon: 'fas fa-tractor' }
  ];

  experienceLevels = [
    { value: 'BEGINNER',     label: 'Beginner',     desc: 'First-time pet owner', icon: 'fas fa-seedling' },
    { value: 'INTERMEDIATE', label: 'Intermediate',  desc: 'Had pets before', icon: 'fas fa-star' },
    { value: 'EXPERT',       label: 'Expert',       desc: 'Experienced owner', icon: 'fas fa-award' }
  ];

  maxAgeOptions = [
    { value: 12,  label: 'Puppy/Kitten (< 1 year)' },
    { value: 36,  label: 'Young (< 3 years)' },
    { value: 84,  label: 'Adult (< 7 years)' },
    { value: 999, label: 'Any age' }
  ];

  colors = ['Black', 'White', 'Brown', 'Golden', 'Gray', 'Orange', 'Tabby', 'Other'];

  constructor(
    private petService: PetService,
    private authService: AuthService,
    private router: Router,
    @Optional() private dialogRef?: MatDialogRef<PetSuggestionWizardComponent>
  ) {}

  ngOnInit(): void {
    this.restoreState();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeWizard();
  }

  private createDefaultCriteria(): WizardCriteria {
    return {
      type: null,
      size: null,
      gender: null,
      breed: '',
      color: '',
      maxAge: null,
      spayedNeutered: null,
      hasSpecialNeeds: false,
      housingType: null,
      hasGarden: false,
      hasChildren: false,
      hasOtherPets: false,
      experienceLevel: null
    };
  }

  saveState(): void {
    const state: WizardStateV2 = {
      version: 2,
      savedAt: Date.now(),
      currentStep: this.currentStep,
      criteria: this.criteria,
      suggestions: this.suggestions
    };

    localStorage.setItem(this.stateKey, JSON.stringify(state));

    // Keep legacy keys in sync for one transition cycle.
    localStorage.setItem('wizardCriteria', JSON.stringify(this.criteria));
    localStorage.setItem('wizardSuggestions', JSON.stringify(this.suggestions));
    localStorage.setItem('wizardCurrentStep', String(this.currentStep));
  }

  restoreState(): void {
    try {
      const raw = localStorage.getItem(this.stateKey);
      if (raw) {
        const parsed = JSON.parse(raw) as WizardStateV2;
        const isFresh = Date.now() - parsed.savedAt <= this.stateTtlMs;

        if (parsed.version === 2 && isFresh) {
          this.criteria = { ...this.createDefaultCriteria(), ...parsed.criteria };
          this.suggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
          this.currentStep = this.clampStep(parsed.currentStep);

          // If restored step is results without suggestions, return to criteria step.
          if (this.currentStep === 4 && this.suggestions.length === 0) {
            this.currentStep = 3;
          }
          return;
        }
      }
    } catch {
      // Ignore malformed state and fallback below.
    }

    // Legacy fallback (older wizard keys)
    try {
      const savedCriteria = localStorage.getItem('wizardCriteria');
      const savedSuggestions = localStorage.getItem('wizardSuggestions');
      const savedStep = localStorage.getItem('wizardCurrentStep');

      if (savedCriteria) {
        const parsedCriteria = JSON.parse(savedCriteria) as Partial<WizardCriteria>;
        if (parsedCriteria.type) {
          this.criteria = { ...this.createDefaultCriteria(), ...parsedCriteria };
        }
      }

      if (savedSuggestions) {
        const parsedSuggestions = JSON.parse(savedSuggestions) as PetSuggestion[];
        if (Array.isArray(parsedSuggestions) && parsedSuggestions.length > 0) {
          this.suggestions = parsedSuggestions;
          this.currentStep = 4;
          return;
        }
      }

      if (savedStep && Number(savedStep) > 1) {
        this.currentStep = this.clampStep(Number(savedStep));
      }
    } catch {
      this.criteria = this.createDefaultCriteria();
      this.suggestions = [];
      this.currentStep = 1;
    }
  }

  private clampStep(step: number): number {
    if (!Number.isFinite(step)) {
      return 1;
    }
    return Math.min(this.totalSteps, Math.max(1, Math.floor(step)));
  }

  clearSavedState(): void {
    localStorage.removeItem(this.stateKey);
    localStorage.removeItem('wizardCriteria');
    localStorage.removeItem('wizardSuggestions');
    localStorage.removeItem('wizardCurrentStep');
    localStorage.removeItem('cameFromWizard');
  }

  closeWizard(): void {
    if (this.loading) {
      this.latestRequestToken++;
      this.loading = false;
    }

    this.saveState();
    this.dialogRef?.close();
    this.router.navigate(['/app/adoption/pets'], {
      queryParams: { wizard: null },
      queryParamsHandling: 'merge'
    });
  }

  nextStep(): void {
    if (this.loading || !this.canGoNext()) {
      return;
    }

    if (this.currentStep < this.totalSteps) {
      if (this.currentStep === 3) {
        this.getSuggestions();
      }
      this.currentStep++;
      this.saveState();
    }
  }

  prevStep(): void {
    if (this.loading) {
      this.latestRequestToken++;
      this.loading = false;
    }

    if (this.currentStep > 1) {
      this.currentStep--;
      this.suggestions = [];
      this.error = null;
      this.saveState();
    }
  }

  goToStep(step: number): void {
    if (!this.loading && step < this.currentStep) {
      this.currentStep = step;
      this.suggestions = [];
      this.saveState();
    }
  }

  canGoNext(): boolean {
    if (this.currentStep === 1) {
      return this.criteria.type !== null;
    }

    if (this.currentStep === 3) {
      return this.criteria.housingType !== null && this.criteria.experienceLevel !== null;
    }

    return true;
  }

  getSuggestions(): void {
    this.loading = true;
    this.error = null;
    this.suggestions = [];

    const payload: Partial<WizardCriteria> = { ...this.criteria };
    if (!payload.breed) delete payload.breed;
    if (!payload.color) delete payload.color;

    const requestToken = ++this.latestRequestToken;

    this.petService.getSuggestions(payload).subscribe({
      next: (data) => {
        if (requestToken !== this.latestRequestToken) {
          return;
        }

        this.suggestions = data;
        this.loading = false;
        this.saveState();
      },
      error: (err) => {
        if (requestToken !== this.latestRequestToken) {
          return;
        }

        console.error(err);
        this.error = 'Error loading suggestions. Please try again.';
        this.loading = false;
      }
    });
  }

  adoptPet(pet: PetSuggestion): void {
    if (!pet?.id) {
      return;
    }

    const returnUrl = `/app/adoption/pets/${pet.id}?adopt=1&wizard=1`;

    if (!this.authService.isLoggedIn()) {
      this.dialogRef?.close();
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl }
      });
      return;
    }

    this.dialogRef?.close();
    this.router.navigate(['/app/adoption/pets', pet.id], {
      queryParams: { adopt: 1, wizard: 1 }
    });
  }

  viewPet(pet: PetSuggestion): void {
    if (!pet?.id) {
      return;
    }

    this.saveState();
    localStorage.setItem('cameFromWizard', 'true');
    this.dialogRef?.close();
    this.router.navigate(['/app/adoption/pets', pet.id], {
      queryParams: { wizard: 1 }
    });
  }

  restart(): void {
    this.latestRequestToken++;
    this.loading = false;
    this.currentStep = 1;
    this.suggestions = [];
    this.error = null;
    this.criteria = this.createDefaultCriteria();
    this.clearSavedState();
  }

  retrySuggestions(): void {
    this.error = null;
    this.currentStep = 4;
    this.getSuggestions();
  }

  goToPets(): void {
    this.dialogRef?.close();
    this.router.navigate(['/app/adoption/pets'], {
      queryParams: { wizard: null },
      queryParamsHandling: 'merge'
    });
  }

  getStepTitle(step: number): string {
    if (step === 1) return 'Choose your preferred pet type';
    if (step === 2) return 'Refine appearance preferences';
    if (step === 3) return 'Share your home and lifestyle';
    return 'Review your best matches';
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#38a169';
    if (score >= 60) return '#d69e2e';
    if (score >= 40) return '#e53e3e';
    return '#a0aec0';
  }

  getScoreBg(score: number): string {
    if (score >= 80) return '#f0fff4';
    if (score >= 60) return '#fffff0';
    if (score >= 40) return '#fff5f5';
    return '#f7fafc';
  }

  getFirstPhoto(photos: string | null | undefined): string {
    if (!photos) return '';
    try {
      const arr = JSON.parse(photos);
      return Array.isArray(arr) && arr.length > 0 ? arr[0] : '';
    } catch {
      return photos;
    }
  }

  getPhotoUrl(photos: string | null | undefined): string {
    const first = this.getFirstPhoto(photos);
    return first ? this.petService.buildMediaUrl(first) : '';
  }

  hasStepError(step: number): boolean {
    if (step === 1) {
      return this.currentStep === 1 && !this.criteria.type;
    }

    if (step === 3) {
      return this.currentStep === 3 && (!this.criteria.housingType || !this.criteria.experienceLevel);
    }

    return false;
  }

  getAgeLabel(months: number | null | undefined): string {
    if (!months) return 'Unknown';
    if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? 's' : ''}`;
  }

  getTypeLabel(type: string | undefined): string {
    if (!type) {
      return 'Unknown';
    }

    const map: any = {
      'CHIEN': 'Dog', 'CHAT': 'Cat', 'LAPIN': 'Rabbit',
      'OISEAU': 'Bird', 'RONGEUR': 'Rodent',
      'REPTILE': 'Reptile', 'AUTRE': 'Other'
    };
    return map[type] || type;
  }

  getSizeLabel(size: string | undefined): string {
    if (!size) {
      return 'Unknown';
    }

    const map: any = {
      'PETIT': 'Small', 'MOYEN': 'Medium',
      'GRAND': 'Large', 'TRES_GRAND': 'Extra Large'
    };
    return map[size] || size;
  }

  get progressWidth(): string {
    return `${(this.currentStep / this.totalSteps) * 100}%`;
  }
}
