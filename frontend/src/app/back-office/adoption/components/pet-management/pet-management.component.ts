import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';

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

  petTypes: string[] = ['CHIEN', 'CHAT', 'OISEAU', 'LAPIN', 'RONGEUR', 'REPTILE', 'POISSON', 'AUTRE'];

  constructor(
    private adminService: AdminService,
    private router: Router
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

  // ✅ GETTERS POUR SÉPARER LES ANIMAUX
  get availablePets(): any[] {
    return this.pets.filter(pet => pet.available === true);
  }

  get adoptedPets(): any[] {
    return this.pets.filter(pet => pet.available === false);
  }

  // Filtrer les animaux disponibles
  get filteredAvailablePets(): any[] {
    return this.availablePets.filter(pet => {
      const matchSearch = !this.searchTerm ||
        pet.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        pet.breed?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchType = !this.selectedType || pet.type === this.selectedType;

      return matchSearch && matchType;
    });
  }

  // Filtrer les animaux adoptés
  get filteredAdoptedPets(): any[] {
    return this.adoptedPets.filter(pet => {
      const matchSearch = !this.searchTerm ||
        pet.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        pet.breed?.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchType = !this.selectedType || pet.type === this.selectedType;

      return matchSearch && matchType;
    });
  }

  // Réinitialiser les filtres
  clearFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.selectedStatus = '';
  }

  editPet(pet: any): void {
    this.router.navigate(['/admin/adoption/pets/edit', pet.id]);
  }

  deletePet(pet: any): void {
    if (confirm(`Delete pet "${pet.name}"? This action cannot be undone.`)) {
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
  }

  addPet(): void {
    this.router.navigate(['/admin/adoption/pets/create']);
  }

  goBack(): void {
    this.router.navigate(['/admin/adoption/dashboard']);
  }

  getStatusLabel(pet: any): string {
    return pet.available ? '✅ Available' : '🏠 Adopted';
  }

  getStatusClass(pet: any): string {
    return pet.available ? 'status-available' : 'status-adopted';
  }

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
}