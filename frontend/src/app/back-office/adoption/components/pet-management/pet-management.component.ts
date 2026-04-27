import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AdminService } from '../../services/admin.service';
import { UploadService } from '../../../../front-office/adoption/services/upload.service';
import { ConfirmDialogService } from '../../../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-pet-management',
  templateUrl: './pet-management.component.html',
  styleUrls: ['./pet-management.component.css']
})
export class PetManagementComponent implements OnInit {
  pets: any[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';
  selectedType = '';
  selectedStatus = '';

  // Types d'animaux
  petTypes: string[] = ['CHIEN', 'CHAT', 'OISEAU', 'LAPIN', 'RONGEUR', 'REPTILE', 'POISSON', 'AUTRE'];

  constructor(
    private adminService: AdminService,
    private uploadService: UploadService,
    private router: Router,
    private confirmDialogService: ConfirmDialogService
  ) {}

  ngOnInit(): void {
    this.loadPets();
  }

  loadPets(): void {
    this.loading = true;
    this.error = null;

    this.adminService.getAllPets().subscribe({
      next: (data) => {
        this.pets = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading pets', err);
        this.error = 'Failed to load pets. Please try again.';
        this.loading = false;
      }
    });
  }

  // Filtrer les animaux
  get filteredPets(): any[] {
    return this.pets.filter(pet => {
      const matchSearch = !this.searchTerm ||
        pet.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        pet.breed?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchType = !this.selectedType || pet.type === this.selectedType;
      const matchStatus = !this.selectedStatus ||
        (this.selectedStatus === 'AVAILABLE' && pet.available) ||
        (this.selectedStatus === 'ADOPTED' && !pet.available);

      return matchSearch && matchType && matchStatus;
    });
  }

  // Réinitialiser les filtres
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedStatus = '';
  }

  // Modifier un animal
  editPet(pet: any): void {
    this.router.navigate(['/admin/adoption/pets/edit', pet.id]);
  }

  // Supprimer un animal
  async deletePet(pet: any): Promise<void> {
    const confirmed = await firstValueFrom(this.confirmDialogService.confirm(
      `Delete pet "${pet.name}"? This action cannot be undone.`,
      {
        title: 'Delete adoption pet',
        confirmText: 'Delete pet',
        cancelText: 'Cancel',
        tone: 'danger'
      }
    ));

    if (!confirmed) {
      return;
    }

    this.adminService.deletePet(pet.id).subscribe({
      next: () => {
        alert('✅ Pet deleted successfully!');
        this.loadPets();
      },
      error: (err: any) => {
        console.error('Error deleting pet', err);
        alert('Error deleting pet: ' + (err.error?.message || 'Unknown error'));
      }
    });
  }

  // Ajouter un animal
  addPet(): void {
    this.router.navigate(['/admin/adoption/pets/create']);
  }

  // Retour au dashboard
  goBack(): void {
    this.router.navigate(['/admin/adoption/dashboard']);
  }

  // Obtenir le label du statut
  getStatusLabel(pet: any): string {
    return pet.available ? '✅ Available' : '🏠 Adopted';
  }

  getStatusClass(pet: any): string {
    return pet.available ? 'status-available' : 'status-adopted';
  }

  // Obtenir le label du type
  getTypeLabel(type: string): string {
    const labels: any = {
      'CHIEN': '🐕 Dog',
      'CHAT': '🐈 Cat',
      'OISEAU': '🐦 Bird',
      'LAPIN': '🐇 Rabbit',
      'RONGEUR': '🐭 Rodent',
      'REPTILE': '🐍 Reptile',
      'POISSON': '🐟 Fish',
      'AUTRE': '🐾 Other'
    };
    return labels[type] || type;
  }

  // Obtenir la première photo
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
    return first ? this.uploadService.buildMediaUrl(first) : '';
  }
}
