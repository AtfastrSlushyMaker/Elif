import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import { RequestService } from '../../services/request.service';

@Component({
  selector: 'app-my-requests',
  templateUrl: './my-requests.component.html',
  styleUrls: ['./my-requests.component.css']
})
export class MyRequestsComponent implements OnInit {
  requests: any[] = [];
  loading = true;
  error: string | null = null;
  cancelDialogOpen = false;
  canceling = false;
  selectedRequestId: number | null = null;
  selectedPetName = '';

  constructor(
    private authService: AuthService,
    private requestService: RequestService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadRequests(user.id);
  }

  loadRequests(userId: number): void {
    this.loading = true;
    this.requestService.getByAdopter(userId).subscribe({
      next: (data) => {
        this.requests = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading requests';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getStatusText(status: string): string {
    const texts: any = {
      'PENDING': 'Pending',
      'UNDER_REVIEW': 'Under Review',
      'APPROVED': 'Approved',
      'REJECTED': 'Rejected',
      'CANCELLED': 'Cancelled'
    };
    return texts[status] || status;
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

  getPetIcon(petName: string): string {
    return petName ? petName.charAt(0).toUpperCase() : 'P';
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

  goBack(): void {
    this.router.navigate(['/app/adoption/pets']);
  }

  goToPets(): void {
    this.router.navigate(['/app/adoption/pets']);
  }

  openCancelDialog(request: any): void {
    this.selectedRequestId = request.id ?? null;
    this.selectedPetName = request.petName || 'this pet';
    this.cancelDialogOpen = true;
  }

  closeCancelDialog(): void {
    this.cancelDialogOpen = false;
    this.canceling = false;
    this.selectedRequestId = null;
    this.selectedPetName = '';
  }

  confirmCancelRequest(): void {
    if (!this.selectedRequestId) {
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.canceling = true;
    this.requestService.cancel(this.selectedRequestId, user.id).subscribe({
      next: () => {
        this.closeCancelDialog();
        this.loadRequests(user.id);
      },
      error: (err) => {
        this.canceling = false;
        this.error = 'Could not cancel this request right now. Please try again.';
        console.error(err);
      }
    });
  }
}
