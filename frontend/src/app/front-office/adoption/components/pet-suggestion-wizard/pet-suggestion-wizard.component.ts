import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router';
import { PetService } from '../../services/pet.service';
import { AuthService } from '../../../../auth/auth.service';
import { UiToastService } from '../../../../shared/services/ui-toast.service';

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
  suggestions: any[]   = [];

  // â”€â”€ CritÃ¨res du wizard â”€â”€
  criteria: any = {
    // Ã‰tape 1 â€” Type
    type: null,
    // Ã‰tape 2 â€” Physique
    size:          null,
    gender:        null,
    breed:         '',
    color:         '',
    maxAge:        null,
    spayedNeutered: null,
    hasSpecialNeeds: false,
    // Ã‰tape 3 â€” Situation
    housingType:   null,
    hasGarden:     false,
    hasChildren:   false,
    hasOtherPets:  false,
    experienceLevel: null
  };

  // â”€â”€ Options â”€â”€
  petTypes = [
    { value: 'CHIEN',   label: 'ðŸ• Dog',    desc: 'Loyal & active companion' },
    { value: 'CHAT',    label: 'ðŸˆ Cat',    desc: 'Independent & affectionate' },
    { value: 'LAPIN',   label: 'ðŸ‡ Rabbit', desc: 'Gentle & curious' },
    { value: 'OISEAU',  label: 'ðŸ¦ Bird',   desc: 'Cheerful & social' },
    { value: 'RONGEUR', label: 'ðŸ­ Rodent', desc: 'Small & playful' },
    { value: 'REPTILE', label: 'ðŸ Reptile', desc: 'Unique & fascinating' },
    { value: 'AUTRE',   label: 'ðŸ¾ Other',  desc: 'Surprise me!' }
  ];

  sizes = [
    { value: 'PETIT',     label: 'Small',      desc: 'Under 10kg' },
    { value: 'MOYEN',     label: 'Medium',     desc: '10 - 25kg' },
    { value: 'GRAND',     label: 'Large',      desc: '25 - 45kg' },
    { value: 'TRES_GRAND', label: 'Extra Large', desc: 'Over 45kg' }
  ];

  genders = [
    { value: 'MALE',    label: 'â™‚ Male' },
    { value: 'FEMELLE', label: 'â™€ Female' }
  ];

  housingTypes = [
    { value: 'APARTMENT', label: 'ðŸ¢ Apartment', desc: 'No outdoor space' },
    { value: 'HOUSE',     label: 'ðŸ  House',     desc: 'With or without garden' },
    { value: 'FARM',      label: 'ðŸŒ¾ Farm',      desc: 'Large outdoor space' }
  ];

  experienceLevels = [
    { value: 'BEGINNER',     label: 'ðŸŒ± Beginner',     desc: 'First time pet owner' },
    { value: 'INTERMEDIATE', label: 'â­ Intermediate',  desc: 'Had pets before' },
    { value: 'EXPERT',       label: 'ðŸ† Expert',       desc: 'Experienced owner' }
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
    private uiToastService: UiToastService
  ) {}

  ngOnInit(): void {
    // âœ… Restaurer l'Ã©tat sauvegardÃ©
    this.restoreState();
  }

  // ============================================================
  // SAUVEGARDE ET RESTAURATION D'Ã‰TAT
  // ============================================================

  // âœ… Sauvegarder l'Ã©tat du wizard
  saveState(): void {
    localStorage.setItem('wizardCriteria', JSON.stringify(this.criteria));
    localStorage.setItem('wizardSuggestions', JSON.stringify(this.suggestions));
    localStorage.setItem('wizardCurrentStep', this.currentStep.toString());
  }

  // âœ… Restaurer l'Ã©tat du wizard
  restoreState(): void {
    const savedCriteria = localStorage.getItem('wizardCriteria');
    const savedSuggestions = localStorage.getItem('wizardSuggestions');
    const savedStep = localStorage.getItem('wizardCurrentStep');

    if (savedCriteria) {
      const parsedCriteria = JSON.parse(savedCriteria);
      if (parsedCriteria.type) {
        this.criteria = parsedCriteria;
      }
    }
    
    if (savedSuggestions) {
      const parsedSuggestions = JSON.parse(savedSuggestions);
      if (parsedSuggestions.length > 0) {
        this.suggestions = parsedSuggestions;
        this.currentStep = 4;  // Aller directement aux rÃ©sultats
        this.loading = false;
        return;
      }
    }
    
    if (savedStep && parseInt(savedStep) > 1) {
      this.currentStep = parseInt(savedStep);
    }
  }

  // âœ… Nettoyer le localStorage
  clearSavedState(): void {
    localStorage.removeItem('wizardCriteria');
    localStorage.removeItem('wizardSuggestions');
    localStorage.removeItem('wizardCurrentStep');
    localStorage.removeItem('cameFromWizard');
  }

  // ============================================================
  // NAVIGATION ENTRE Ã‰TAPES
  // ============================================================

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      if (this.currentStep === 3) {
        this.getSuggestions();
      }
      this.currentStep++;
      this.saveState();  // âœ… Sauvegarder aprÃ¨s changement d'Ã©tape
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.suggestions = [];
      this.error = null;
      this.saveState();  // âœ… Sauvegarder aprÃ¨s changement d'Ã©tape
    }
  }

  goToStep(step: number): void {
    if (step < this.currentStep) {
      this.currentStep = step;
      this.suggestions = [];
      this.saveState();  // âœ… Sauvegarder aprÃ¨s changement d'Ã©tape
    }
  }

  canGoNext(): boolean {
    if (this.currentStep === 1) return this.criteria.type !== null;
    if (this.currentStep === 3) return this.criteria.housingType !== null && this.criteria.experienceLevel !== null;
    return true;
  }

  // ============================================================
  // APPEL API
  // ============================================================

  getSuggestions(): void {
    this.loading = true;
    this.error   = null;

    // Nettoyer les champs vides
    const payload = { ...this.criteria };
    if (!payload.breed) delete payload.breed;
    if (!payload.color) delete payload.color;

    this.petService.getSuggestions(payload).subscribe({
      next: (data) => {
        this.suggestions = data;
        this.loading = false;
        this.saveState();  // âœ… Sauvegarder aprÃ¨s avoir obtenu les suggestions
      },
      error: (err) => {
        console.error(err);
        this.error   = 'Error loading suggestions. Please try again.';
        this.loading = false;
      }
    });
  }

  // ============================================================
  // ACTIONS SUR LES SUGGESTIONS
  // ============================================================

  adoptPet(pet: any): void {
    if (!this.authService.isLoggedIn()) {
      this.uiToastService.warning('Please log in to adopt a pet.');
      this.router.navigate(['/auth/login']);
      return;
    }
    this.router.navigate(['/app/adoption/pets', pet.id, 'adopt']);
  }

  viewPet(pet: any): void {
    this.saveState();  // âœ… Sauvegarder avant de quitter
    localStorage.setItem('cameFromWizard', 'true');
    this.router.navigate(['/app/adoption/pets', pet.id]);
  }

  restart(): void {
    this.currentStep = 1;
    this.suggestions = [];
    this.error = null;
    this.criteria = {
      type: null, size: null, gender: null,
      breed: '', color: '', maxAge: null,
      spayedNeutered: null, hasSpecialNeeds: false,
      housingType: null, hasGarden: false,
      hasChildren: false, hasOtherPets: false,
      experienceLevel: null
    };
    this.clearSavedState();  // âœ… Nettoyer localStorage
  }

  // ============================================================
  // HELPERS AFFICHAGE
  // ============================================================

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

  getAgeLabel(months: number | null): string {
    if (!months) return 'Unknown';
    if (months < 12) return `${months} month${months > 1 ? 's' : ''}`;
    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? 's' : ''}`;
  }

  getTypeLabel(type: string): string {
    const map: any = {
      'CHIEN': 'ðŸ• Dog', 'CHAT': 'ðŸˆ Cat', 'LAPIN': 'ðŸ‡ Rabbit',
      'OISEAU': 'ðŸ¦ Bird', 'RONGEUR': 'ðŸ­ Rodent',
      'REPTILE': 'ðŸ Reptile', 'AUTRE': 'ðŸ¾ Other'
    };
    return map[type] || type;
  }

  getSizeLabel(size: string): string {
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

