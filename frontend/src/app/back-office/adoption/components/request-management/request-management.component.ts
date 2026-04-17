import { Component, OnInit } from '@angular/core';
import { AdminService, AdoptionRequest } from '../../services/admin.service';

@Component({
  selector: 'app-request-management',
  templateUrl: './request-management.component.html',
  styleUrls: ['./request-management.component.css']
})
export class RequestManagementComponent implements OnInit {
  requests: AdoptionRequest[] = [];
  filteredRequests: AdoptionRequest[] = [];
  loading = true;
  error: string | null = null;
  
  // Filtres
  statusFilter: string = 'ALL';
  searchTerm: string = '';
  
  // Modal
  showRejectModal = false;
  selectedRequest: AdoptionRequest | null = null;
  rejectionReason = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading = true;
    this.adminService.getAllRequests().subscribe({
      next: (data) => {
        this.requests = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading requests';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applyFilters(): void {
    this.filteredRequests = this.requests.filter(request => {
      // Filtre par statut
      if (this.statusFilter !== 'ALL' && request.status !== this.statusFilter) {
        return false;
      }
      // Filtre par recherche
      if (this.searchTerm) {
        const search = this.searchTerm.toLowerCase();
        return request.petName?.toLowerCase().includes(search) ||
               request.adopterName?.toLowerCase().includes(search);
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

  approveRequest(request: AdoptionRequest): void {
    if (confirm(`Approve adoption request for "${request.petName}"?`)) {
      this.adminService.updateRequestStatus(request.id, 'APPROVED').subscribe({
        next: () => {
          this.loadRequests();
          alert('✅ Request approved successfully');
        },
        error: (err) => {
          alert('Error approving request');
          console.error(err);
        }
      });
    }
  }

  openRejectModal(request: AdoptionRequest): void {
    this.selectedRequest = request;
    this.rejectionReason = '';
    this.showRejectModal = true;
  }

  confirmReject(): void {
    if (this.selectedRequest) {
      this.adminService.updateRequestStatus(
        this.selectedRequest.id, 
        'REJECTED', 
        this.rejectionReason
      ).subscribe({
        next: () => {
          this.loadRequests();
          this.showRejectModal = false;
          this.selectedRequest = null;
          this.rejectionReason = '';
          alert('❌ Request rejected');
        },
        error: (err) => {
          alert('Error rejecting request');
          console.error(err);
        }
      });
    }
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedRequest = null;
    this.rejectionReason = '';
  }

  deleteRequest(request: AdoptionRequest): void {
    if (confirm(`Are you sure you want to delete request for "${request.petName}"? This action cannot be undone.`)) {
      this.adminService.deleteRequest(request.id).subscribe({
        next: () => {
          this.loadRequests();
          alert('🗑️ Request deleted');
        },
        error: (err) => {
          alert('Error deleting request');
          console.error(err);
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      case 'CANCELLED': return 'status-cancelled';
      case 'UNDER_REVIEW': return 'status-review';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'PENDING': return '⏳ Pending';
      case 'APPROVED': return '✅ Approved';
      case 'REJECTED': return '❌ Rejected';
      case 'CANCELLED': return '🗑️ Cancelled';
      case 'UNDER_REVIEW': return '📋 Under Review';
      default: return status;
    }
  }
}