import { Component, OnInit } from '@angular/core';
import {
  MarketplaceReclamation,
  MarketplaceReclamationService,
  MarketplaceReclamationStatus
} from '../../../shared/services/marketplace-reclamation.service';

@Component({
  selector: 'app-marketplace-reclamations-admin',
  templateUrl: './reclamations.component.html',
  styleUrl: './reclamations.component.css'
})
export class ReclamationsComponent implements OnInit {
  loading = false;
  error = '';
  updateError = '';
  updatingId: number | null = null;

  reclamations: MarketplaceReclamation[] = [];

  statusDrafts: Record<number, MarketplaceReclamationStatus> = {};
  responseDrafts: Record<number, string> = {};

  readonly statusOptions: MarketplaceReclamationStatus[] = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED'];

  constructor(private readonly reclamationService: MarketplaceReclamationService) {}

  ngOnInit(): void {
    this.loadReclamations();
  }

  loadReclamations(): void {
    this.loading = true;
    this.error = '';

    this.reclamationService.getAll().subscribe({
      next: (items) => {
        this.reclamations = items;
        this.statusDrafts = {};
        this.responseDrafts = {};

        items.forEach((item) => {
          this.statusDrafts[item.id] = item.status;
          this.responseDrafts[item.id] = item.responseMalek ?? '';
        });

        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || 'Unable to load marketplace reclamations';
        this.loading = false;
      }
    });
  }

  saveTreatment(item: MarketplaceReclamation): void {
    const nextStatus = this.statusDrafts[item.id] ?? item.status;
    const nextResponse = (this.responseDrafts[item.id] ?? '').trim();

    if (!nextStatus) {
      this.updateError = 'Status is required.';
      return;
    }

    this.updateError = '';
    this.updatingId = item.id;

    this.reclamationService.updateStatus(item.id, nextStatus, nextResponse).subscribe({
      next: (updated) => {
        this.reclamations = this.reclamations.map((existing) => existing.id === updated.id ? updated : existing);
        this.statusDrafts[updated.id] = updated.status;
        this.responseDrafts[updated.id] = updated.responseMalek ?? '';
        this.updatingId = null;
      },
      error: (err) => {
        this.updateError = err?.error?.error || 'Unable to update reclamation';
        this.updatingId = null;
      }
    });
  }

  statusClass(status: string): string {
    switch (status) {
      case 'RESOLVED':
        return 'reclamation-status-success';
      case 'REJECTED':
        return 'reclamation-status-danger';
      case 'IN_REVIEW':
        return 'reclamation-status-warning';
      default:
        return 'reclamation-status-neutral';
    }
  }

  formatDate(value: string | null): string {
    if (!value) {
      return '-';
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '-' : parsed.toLocaleString();
  }
}
