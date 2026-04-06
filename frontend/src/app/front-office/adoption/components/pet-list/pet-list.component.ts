import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription, combineLatest } from 'rxjs';
import { PetService } from '../../services/pet.service';
import { AuthService } from '../../../../auth/auth.service';
import { AdoptionPet } from '../../models/adoption-pet.model';
import { PetSuggestionWizardComponent } from '../pet-suggestion-wizard/pet-suggestion-wizard.component';

@Component({
  selector: 'app-pet-list',
  templateUrl: './pet-list.component.html',
  styleUrls: ['./pet-list.component.css']
})
export class PetListComponent implements OnInit, OnDestroy {
  pets: AdoptionPet[] = [];
  loading = true;
  error: string | null = null;
  isLoggedIn = false;

  private routeSubscription?: Subscription;
  private wizardDialogRef?: MatDialogRef<PetSuggestionWizardComponent>;

  filters = {
    type: '',
    size: ''
  };

  constructor(
    private petService: PetService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.routeSubscription = combineLatest([this.route.queryParamMap, this.route.url]).subscribe(([params, segments]) => {
      const queryWantsWizard = params.get('wizard') === '1';
      const path = segments.map((segment) => segment.path).join('/');
      const routeWantsWizard = path === 'find-my-pet';
      const shouldOpenWizard = queryWantsWizard || routeWantsWizard;

      if (shouldOpenWizard) {
        this.openWizardDialog();
      } else {
        this.closeWizardDialog(false);
      }
    });
    this.loadPets();
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.wizardDialogRef?.close();
  }

  private openWizardDialog(): void {
    if (this.wizardDialogRef) {
      return;
    }

    this.wizardDialogRef = this.dialog.open(PetSuggestionWizardComponent, {
      width: '96vw',
      maxWidth: '1040px',
      maxHeight: '92vh',
      autoFocus: false,
      restoreFocus: false
    });

    this.wizardDialogRef.afterClosed().subscribe(() => {
      this.wizardDialogRef = undefined;

      const hasWizardQuery = this.route.snapshot.queryParamMap.get('wizard') === '1';
      const isWizardRoute = this.route.snapshot.url.map((segment) => segment.path).join('/') === 'find-my-pet';

      if (hasWizardQuery || isWizardRoute) {
        this.router.navigate(['/app/adoption/pets'], {
          queryParams: { wizard: null },
          queryParamsHandling: 'merge'
        });
      }
    });
  }

  private closeWizardDialog(clearQuery: boolean): void {
    if (this.wizardDialogRef) {
      this.wizardDialogRef.close();
      this.wizardDialogRef = undefined;
    }

    if (!clearQuery) {
      return;
    }

    this.router.navigate(['/app/adoption/pets'], {
      queryParams: { wizard: null },
      queryParamsHandling: 'merge'
    });
  }

  loadPets(): void {
    this.loading = true;
    this.petService.getAvailable().subscribe({
      next: (data) => {
        this.pets = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading animals';
        this.loading = false;
        console.error(err);
      }
    });
  }

  search(): void {
    this.loading = true;
    this.petService.search(this.filters).subscribe({
      next: (data) => {
        this.pets = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  resetFilters(): void {
    this.filters = { type: '', size: '' };
    this.loadPets();
  }

  goToShelters(): void {
    this.router.navigate(['/app/adoption/shelters']);
  }

  goToMyRequests(): void {
    this.router.navigate(['/app/adoption/my-requests']);
  }

  goToMyContracts(): void {
    this.router.navigate(['/app/adoption/my-contracts']);
  }

  goToWizard(): void {
    this.router.navigate(['/app/adoption/pets'], {
      queryParams: { wizard: 1 },
      queryParamsHandling: 'merge'
    });
  }

  checkAdopt(pet: AdoptionPet): void {
    if (!pet.id) {
      return;
    }

    const returnUrl = `/app/adoption/pets/${pet.id}?adopt=1`;

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/app/adoption/pets', pet.id], {
        queryParams: { adopt: 1 }
      });
      return;
    }

    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl }
    });
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

  getAgeText(age?: number): string {
    if (!age) {
      return 'Age not specified';
    }

    const years = Math.floor(age / 12);
    const months = age % 12;

    if (years === 0) {
      return `${months} month${months > 1 ? 's' : ''}`;
    }

    if (months === 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    }

    return `${years}y ${months}m`;
  }
}
