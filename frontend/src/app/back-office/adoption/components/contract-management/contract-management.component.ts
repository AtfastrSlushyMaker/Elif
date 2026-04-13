import { Component, OnInit } from '@angular/core';
import { AdminService, Contract } from '../../services/admin.service';

@Component({
  selector: 'app-contract-management',
  templateUrl: './contract-management.component.html',
  styleUrls: ['./contract-management.component.css']
})
export class ContractManagementComponent implements OnInit {
  contracts: Contract[] = [];
  filteredContracts: Contract[] = [];
  loading = true;
  error: string | null = null;
  downloadingId: number | null = null;
  
  // Filtres
  statusFilter: string = 'ALL';
  searchTerm: string = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadContracts();
  }

  loadContracts(): void {
    this.loading = true;
    this.adminService.getAllContracts().subscribe({
      next: (data) => {
        this.contracts = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading contracts';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applyFilters(): void {
    this.filteredContracts = this.contracts.filter(contract => {
      if (this.statusFilter !== 'ALL' && contract.statut !== this.statusFilter) {
        return false;
      }
      if (this.searchTerm) {
        const search = this.searchTerm.toLowerCase();
        return contract.animalName?.toLowerCase().includes(search) ||
               contract.adoptantName?.toLowerCase().includes(search) ||
               contract.numeroContrat?.toLowerCase().includes(search);
      }
      return true;
    });
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  // ✅ CORRIGÉ - avec typage correct
  updateStatus(contract: Contract, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value;
    
    if (confirm(`Change contract status to "${newStatus}"?`)) {
      this.adminService.updateContractStatus(contract.id, newStatus).subscribe({
        next: () => {
          this.loadContracts();
          alert(`✅ Contract status updated to ${newStatus}`);
        },
        error: (err) => {
          alert('Error updating contract status');
          console.error(err);
        }
      });
    }
  }

  downloadPdf(contract: Contract): void {
    this.downloadingId = contract.id;
    this.adminService.downloadContractPdf(contract.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contract-${contract.numeroContrat}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloadingId = null;
      },
      error: (err) => {
        alert('Error downloading PDF');
        this.downloadingId = null;
        console.error(err);
      }
    });
  }

  deleteContract(contract: Contract): void {
    if (confirm(`Are you sure you want to delete contract ${contract.numeroContrat}? This action cannot be undone.`)) {
      this.adminService.deleteContract(contract.id).subscribe({
        next: () => {
          this.loadContracts();
          alert('🗑️ Contract deleted');
        },
        error: (err) => {
          alert('Error deleting contract');
          console.error(err);
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIF': return 'status-active';
      case 'BROUILLON': return 'status-draft';
      case 'SIGNE': return 'status-signed';
      case 'TERMINE': return 'status-completed';
      case 'RESILIE': return 'status-terminated';
      case 'ANNULE': return 'status-cancelled';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'ACTIF': return '✅ Active';
      case 'BROUILLON': return '📝 Draft';
      case 'SIGNE': return '✍️ Signed';
      case 'TERMINE': return '🏁 Completed';
      case 'RESILIE': return '⚡ Terminated';
      case 'ANNULE': return '❌ Cancelled';
      default: return status;
    }
  }

  getAvailableStatuses(currentStatus: string): string[] {
    const allStatuses = ['ACTIF', 'TERMINE', 'RESILIE', 'ANNULE'];
    return allStatuses.filter(s => s !== currentStatus);
  }
}