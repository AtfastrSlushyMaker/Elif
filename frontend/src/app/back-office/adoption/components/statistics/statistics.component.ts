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
    private router: Router  // ← AJOUTER
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

  // AJOUTER CETTE MÉTHODE
  goToShelters(): void {
  this.router.navigate(['/admin/adoption/shelters']);
}
}