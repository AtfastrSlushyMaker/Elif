import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ContractService } from '../../services/contract.service';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-my-contracts',
  templateUrl: './my-contracts.component.html',
  styleUrls: ['./my-contracts.component.css']
})
export class MyContractsComponent implements OnInit {

  contracts: any[] = [];
  loading    = true;
  error: string | null = null;
  downloading: number | null = null;

  constructor(
    private contractService: ContractService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadContracts(user.id);
  }

  loadContracts(userId: number): void {
    this.loading = true;
    this.error   = null;

    this.contractService.getByAdopter(userId).subscribe({
      next: (data) => {
        this.contracts = data;
        this.loading   = false;
      },
      error: (err) => {
        console.error('Error loading contracts:', err);
        this.error   = 'Error loading your contracts. Please try again.';
        this.loading = false;
      }
    });
  }

  downloadPdf(contract: any): void {
    this.downloading = contract.id;

    this.contractService.downloadPdf(contract.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `contract-${contract.numeroContrat || contract.id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.downloading = null;
      },
      error: (err) => {
        console.error('Error downloading PDF:', err);
        alert('❌ Error downloading the contract PDF. Please try again.');
        this.downloading = null;
      }
    });
  }

  // Helper pour afficher la date
  formatDate(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getStatusLabel(statut: string): string {
    const map: any = {
      'BROUILLON': 'Draft',
      'ENVOYE':    'Sent',
      'SIGNE':     'Signed',
      'VALIDE':    'Validated',
      'ACTIF':     'Active',
      'TERMINE':   'Completed',
      'RESILIE':   'Terminated',
      'ANNULE':    'Cancelled'
    };
    return map[statut] || statut || 'Active';
  }

  getStatusClass(statut: string): string {
    const map: any = {
      'BROUILLON': 'status-draft',
      'ENVOYE':    'status-sent',
      'SIGNE':     'status-signed',
      'VALIDE':    'status-valid',
      'ACTIF':     'status-active',
      'TERMINE':   'status-done',
      'RESILIE':   'status-terminated',
      'ANNULE':    'status-cancelled'
    };
    return map[statut] || 'status-active';
  }

  goBack(): void {
    this.router.navigate(['/app/adoption/my-requests']);
  }
}