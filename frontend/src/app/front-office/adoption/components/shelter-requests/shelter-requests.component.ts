import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import { RequestService } from '../../services/request.service';
import { ShelterService } from '../../services/shelter.service';
import { ContractService } from '../../services/contract.service';

@Component({
  selector: 'app-shelter-requests',
  templateUrl: './shelter-requests.component.html',
  styleUrls: ['./shelter-requests.component.css']
})
export class ShelterRequestsComponent implements OnInit {
  requests: any[] = [];
  filteredRequests: any[] = []; // ✅ Demandes filtrées
  loading = true;
  error: string | null = null;
  shelterId: number | null = null;
  petId: number | null = null; // ✅ ID de l'animal sélectionné
  selectedPetName: string = ''; // ✅ Nom de l'animal
  rejectionReason: string | null = null;
  selectedRequestId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private requestService: RequestService,
    private shelterService: ShelterService,
    private contractService: ContractService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ✅ Récupérer petId depuis les queryParams
    this.route.queryParams.subscribe(params => {
      this.petId = params['petId'] ? +params['petId'] : null;
    });

    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'SHELTER') {
      this.router.navigate(['/']);
      return;
    }
    
    if (!user.id) {
      this.router.navigate(['/']);
      return;
    }
    
    this.shelterService.getShelterByUserId(user.id).subscribe({
      next: (shelter) => {
        this.shelterId = shelter.id ?? null;
        this.loadRequests();
      },
      error: (err) => {
        console.error('Shelter not found', err);
        this.error = 'Shelter not found';
        this.loading = false;
        this.router.navigate(['/']);
      }
    });
  }

  // ✅ Méthode pour revenir à la page des animaux
  goBackToPets(): void {
    this.router.navigate(['/app/adoption/shelter/pets']);
  }

 loadRequests(): void {
  if (!this.shelterId) return;
  this.loading = true;
  this.requestService.getByShelter(this.shelterId).subscribe({
    next: (data) => {
      this.requests = data;
      
      // ✅ Filtrer par petId si présent
      if (this.petId) {
        // Exclure aussi les demandes CANCELLED et REJECTED
        this.filteredRequests = data.filter(req => 
          req.petId === this.petId && 
          req.status !== 'CANCELLED' && 
          req.status !== 'REJECTED'
        );
        if (this.filteredRequests.length > 0 && this.filteredRequests[0].petName) {
          this.selectedPetName = this.filteredRequests[0].petName;
        } else {
          this.selectedPetName = `Pet #${this.petId}`;
        }
      } else {
        // Pour toutes les demandes, on garde tout
        this.filteredRequests = data;
        this.selectedPetName = '';
      }
      
      this.loading = false;
    },
    error: (err) => {
      console.error(err);
      this.error = 'Error loading requests';
      this.loading = false;
    }
  });
}

  approveRequest(requestId: number): void {
    if (confirm('Approve this adoption request?')) {
      this.requestService.approve(requestId).subscribe({
        next: (approvedRequest) => {
          this.createContract(approvedRequest);
          this.loadRequests();
          alert('✅ Adoption approved successfully!');
        },
        error: (err) => {
          alert('Error approving request');
          console.error(err);
        }
      });
    }
  }

  createContract(request: any): void {
    if (!this.shelterId) return;
    
    const contractData = {
      shelterId: this.shelterId,
      adoptantId: request.adopterId,
      animalId: request.petId,
      fraisAdoption: 150.00,
      conditionsSpecifiques: `Adoption approved on ${new Date().toLocaleDateString()}`
    };

    this.contractService.create(contractData).subscribe({
      next: (contract) => {
        console.log('Contract created:', contract);
      },
      error: (err) => {
        console.error('Error creating contract:', err);
        alert('⚠️ Adoption approved but contract generation failed. Please contact support.');
      }
    });
  }

  showRejectModal(id: number): void {
    this.selectedRequestId = id;
    this.rejectionReason = '';
  }

  confirmReject(): void {
    if (this.selectedRequestId) {
      this.requestService.reject(this.selectedRequestId, this.rejectionReason || 'No reason provided').subscribe({
        next: () => {
          this.loadRequests();
          this.selectedRequestId = null;
          this.rejectionReason = null;
          alert('❌ Request rejected');
        },
        error: (err) => {
          alert('Error rejecting request');
          console.error(err);
        }
      });
    }
  }

  cancelReject(): void {
    this.selectedRequestId = null;
    this.rejectionReason = null;
  }

  // ============================================================
  // MÉTHODES POUR LE STATUT
  // ============================================================

  getStatusBadge(status: string): string {
    const badges: any = {
      'PENDING': 'bg-warning text-dark',
      'UNDER_REVIEW': 'bg-info text-dark',
      'APPROVED': 'bg-success',
      'REJECTED': 'bg-danger',
      'CANCELLED': 'bg-secondary'
    };
    return badges[status] || 'bg-secondary';
  }

  getStatusClass(status: string): string {
    const classes: any = {
      'PENDING': 'status-PENDING',
      'UNDER_REVIEW': 'status-UNDER_REVIEW',
      'APPROVED': 'status-APPROVED',
      'REJECTED': 'status-REJECTED',
      'CANCELLED': 'status-CANCELLED'
    };
    return classes[status] || 'status-PENDING';
  }

  getStatusText(status: string): string {
    const texts: any = {
      'PENDING': '⏳ Pending',
      'UNDER_REVIEW': '📋 Under Review',
      'APPROVED': '✅ Approved',
      'REJECTED': '❌ Rejected',
      'CANCELLED': '🗑️ Cancelled'
    };
    return texts[status] || status;
  }

  getStatusIcon(status: string): string {
    const icons: any = {
      'PENDING': 'fa-clock',
      'UNDER_REVIEW': 'fa-eye',
      'APPROVED': 'fa-check-circle',
      'REJECTED': 'fa-times-circle',
      'CANCELLED': 'fa-ban'
    };
    return icons[status] || 'fa-question-circle';
  }

  // ============================================================
  // MÉTHODES POUR LES ICÔNES
  // ============================================================

  getPetIcon(petName: string): string {
    return petName ? petName.charAt(0).toUpperCase() : '🐾';
  }

  getHousingIcon(housingType: string): string {
    const icons: any = {
      'APARTMENT': 'fa-building',
      'HOUSE': 'fa-home',
      'FARM': 'fa-tractor',
      'OTHER': 'fa-question-circle'
    };
    return icons[housingType] || 'fa-home';
  }

  // ✅ Getter pour afficher le titre de la page
  get pageTitle(): string {
    if (this.petId && this.selectedPetName) {
      return `📋 Adoption Requests for ${this.selectedPetName}`;
    } else if (this.petId) {
      return `📋 Adoption Requests for Pet #${this.petId}`;
    }
    return '📋 All Adoption Requests';
  }

  // ✅ Getter pour afficher le sous-titre
  get pageSubtitle(): string {
    if (this.petId && this.filteredRequests.length > 0) {
      return `${this.filteredRequests.length} request${this.filteredRequests.length > 1 ? 's' : ''} found for this animal`;
    } else if (this.petId) {
      return 'No requests found for this animal';
    }
    return 'Manage all adoption requests for your shelter';
  }

  // ✅ Getter pour les demandes en attente (PENDING, UNDER_REVIEW)
get pendingRequests(): any[] {
  return this.filteredRequests.filter(req => 
    req.status === 'PENDING' || req.status === 'UNDER_REVIEW'
  );
}

// ✅ Getter pour les demandes traitées (APPROVED, REJECTED, CANCELLED)
get processedRequests(): any[] {
  return this.filteredRequests.filter(req => 
    req.status === 'APPROVED' || req.status === 'REJECTED' || req.status === 'CANCELLED'
  );
}
}