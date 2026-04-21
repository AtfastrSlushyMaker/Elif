import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService, Statistics } from '../../services/admin.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  stats: Statistics | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading = true;
    this.adminService.getStatistics().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading statistics';
        this.loading = false;
        console.error(err);
      }
    });
  }

  // Navigation
  goToShelters(): void {
    this.router.navigate(['/admin/adoption/shelters']);
  }

  goToPets(): void {
    this.router.navigate(['/admin/adoption/pets']);
  }

  goToRequests(): void {
    this.router.navigate(['/admin/adoption/requests']);
  }

  goToContracts(): void {
    this.router.navigate(['/admin/adoption/contracts']);
  }

  goToReviews(): void {
    this.router.navigate(['/admin/adoption/reviews']);
  }

  // ============================================================
  // MÉTHODES POUR LES GRAPHIQUES
  // ============================================================

  getRequestPercentage(status: string): number {
    if (!this.stats || this.stats.totalAdoptionRequests === 0) return 0;
    switch (status) {
      case 'pending': return (this.stats.pendingRequests / this.stats.totalAdoptionRequests) * 100;
      case 'approved': return (this.stats.approvedRequests / this.stats.totalAdoptionRequests) * 100;
      case 'rejected': return (this.stats.rejectedRequests / this.stats.totalAdoptionRequests) * 100;
      default: return 0;
    }
  }

  getPetPercentage(status: string): number {
    if (!this.stats || this.stats.totalPets === 0) return 0;
    switch (status) {
      case 'available': return (this.stats.availablePets / this.stats.totalPets) * 100;
      case 'adopted': return (this.stats.adoptedPets / this.stats.totalPets) * 100;
      default: return 0;
    }
  }

  getShelterPercentage(status: string): number {
    if (!this.stats || this.stats.totalShelters === 0) return 0;
    switch (status) {
      case 'verified': return (this.stats.verifiedShelters / this.stats.totalShelters) * 100;
      case 'pending': return (this.stats.pendingShelters / this.stats.totalShelters) * 100;
      default: return 0;
    }
  }

  getAverageRevenue(): string {
    if (!this.stats || this.stats.totalContracts === 0) return '0';
    const avg = this.stats.totalRevenue / this.stats.totalContracts;
    return avg.toFixed(2);
  }
}