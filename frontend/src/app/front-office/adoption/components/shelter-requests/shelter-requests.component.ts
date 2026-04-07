import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../auth/auth.service';
import { RequestService } from '../../services/request.service';
import { ShelterService } from '../../services/shelter.service';
import { ContractService } from '../../services/contract.service';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-shelter-requests',
  templateUrl: './shelter-requests.component.html',
  styleUrls: ['./shelter-requests.component.css']
})
export class ShelterRequestsComponent implements OnInit {

  // ── Données ──
  requests: any[]         = [];
  filteredRequests: any[] = [];
  scoredRequests: any[]   = [];
  appointments: any[]     = [];

  loading = true;
  error: string | null = null;
  shelterId: number | null = null;
  petId: number | null = null;
  selectedPetName = '';

  // ── Reject modal ──
  rejectionReason: string | null = null;
  selectedRequestId: number | null = null;

  // ── Schedule modal ──
  showScheduleModal  = false;
  schedulingRequest: any = null;
  appointmentDate    = '';
  appointmentTime    = '';
  shelterNotes       = '';
  scheduling         = false;

  // ── Respond modal ──
  showRespondModal    = false;
  respondingAppointment: any = null;
  consultationResult  = '';
  responseMessage     = '';
  responding          = false;

  // ── Vue active ──
  activeTab: 'requests' | 'appointments' = 'requests';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private requestService: RequestService,
    private shelterService: ShelterService,
    private contractService: ContractService,
    public appointmentService: AppointmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.petId = params['petId'] ? +params['petId'] : null;
    });

    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'SHELTER') {
      this.router.navigate(['/']);
      return;
    }

    this.shelterService.getShelterByUserId(user.id).subscribe({
      next: (shelter) => {
        this.shelterId = shelter.id ?? null;
        this.loadRequests();
        this.loadAppointments();
      },
      error: () => {
        this.error = 'Shelter not found';
        this.loading = false;
      }
    });
  }

  goBackToPets(): void {
    this.router.navigate(['/app/adoption/shelter/pets']);
  }

  // ============================================================
  // CHARGEMENT DES DONNÉES
  // ============================================================

  loadRequests(): void {
    if (!this.shelterId) return;
    this.loading = true;

    this.requestService.getByShelter(this.shelterId).subscribe({
      next: (data) => {
        this.requests = data;

        if (this.petId) {
          this.filteredRequests = data.filter(req =>
            req.petId === this.petId &&
            req.status !== 'CANCELLED' &&
            req.status !== 'REJECTED'
          );
          this.selectedPetName = this.filteredRequests[0]?.petName || `Pet #${this.petId}`;
          this.loadScoredRequests(this.petId);
        } else {
          this.filteredRequests = data;
          this.loadAllScoredRequests();
        }

        this.loading = false;
      },
      error: () => {
        this.error = 'Error loading requests';
        this.loading = false;
      }
    });
  }

  loadScoredRequests(petId: number): void {
    this.appointmentService.getScoredRequestsForPet(petId).subscribe({
      next: (data) => { this.scoredRequests = data; },
      error: (err) => console.error('Error loading scores', err)
    });
  }

  loadAllScoredRequests(): void {
    if (!this.shelterId) return;
    this.appointmentService.getScoredRequestsForShelter(this.shelterId).subscribe({
      next: (data) => { this.scoredRequests = data; },
      error: (err) => console.error('Error loading scores', err)
    });
  }

  loadAppointments(): void {
    if (!this.shelterId) return;
    this.appointmentService.getAppointmentsByShelter(this.shelterId).subscribe({
      next: (data) => { this.appointments = data; },
      error: (err) => console.error('Error loading appointments', err)
    });
  }

  // ============================================================
  // APPROVE / REJECT
  // ============================================================

  approveRequest(requestId: number): void {
    if (confirm('Approve this adoption request?')) {
      this.requestService.approve(requestId).subscribe({
        next: (approvedRequest) => {
          this.createContract(approvedRequest);
        },
        error: (err) => {
          console.error('Error approving request', err);
          alert('Error approving request');
        }
      });
    }
  }

  // ✅ CREATE CONTRACT SANS FRAIS D'ADOPTION
  createContract(request: any): void {
    if (!this.shelterId) {
      alert('Shelter ID not found');
      return;
    }
    
    const contractData = {
      shelterId: this.shelterId,
      adoptantId: request.adopterId,
      animalId: request.petId,
      conditionsSpecifiques: `Adoption approved on ${new Date().toLocaleDateString()}`
      // ✅ fraisAdoption supprimé complètement
    };
    
    console.log('📝 Creating contract with data:', contractData);
    
    this.contractService.create(contractData).subscribe({
      next: (contract) => {
        console.log('✅ Contract created successfully:', contract);
        alert('✅ Adoption approved! Contract generated successfully.');
        this.loadRequests();
        this.loadAppointments();
      },
      error: (err) => {
        console.error('❌ Error creating contract:', err);
        alert('⚠️ Adoption approved but contract generation failed. Please contact support.');
        this.loadRequests();
      }
    });
  }

  showRejectModal(id: number): void {
    this.selectedRequestId = id;
    this.rejectionReason = '';
  }

  confirmReject(): void {
    if (!this.selectedRequestId) return;
    this.requestService.reject(this.selectedRequestId, this.rejectionReason || 'No reason provided').subscribe({
      next: () => {
        this.loadRequests();
        this.selectedRequestId = null;
        this.rejectionReason = null;
        alert('❌ Request rejected');
      },
      error: (err) => {
        console.error('Error rejecting request', err);
        alert('Error rejecting request');
      }
    });
  }

  cancelReject(): void {
    this.selectedRequestId = null;
    this.rejectionReason = null;
  }

  // ============================================================
  // PLANIFIER UN RENDEZ-VOUS
  // ============================================================

  openScheduleModal(request: any): void {
    this.schedulingRequest = request;
    this.appointmentDate   = '';
    this.appointmentTime   = '';
    this.shelterNotes      = '';
    this.showScheduleModal = true;
  }

  closeScheduleModal(): void {
    this.showScheduleModal  = false;
    this.schedulingRequest  = null;
    this.scheduling         = false;
  }

  confirmSchedule(): void {
    if (!this.appointmentDate || !this.appointmentTime) {
      alert('Please select a date and time.');
      return;
    }

    this.scheduling = true;
    const dateTime = `${this.appointmentDate}T${this.appointmentTime}:00`;

    this.appointmentService.scheduleAppointment({
      requestId:          this.schedulingRequest.id,
      appointmentDate:    dateTime,
      shelterNotes:       this.shelterNotes,
      compatibilityScore: this.schedulingRequest.compatibilityScore
    }).subscribe({
      next: (appointment) => {
        console.log('✅ Appointment scheduled:', appointment);
        alert(`✅ Appointment scheduled for ${this.schedulingRequest.adopterName}!\nAn email notification has been sent.`);
        this.closeScheduleModal();
        this.loadRequests();
        this.loadAppointments();
      },
      error: (err) => {
        console.error('Error scheduling appointment', err);
        alert('❌ ' + (err.error?.message || 'Error scheduling appointment'));
        this.scheduling = false;
      }
    });
  }

  // ============================================================
  // RÉPONDRE APRÈS CONSULTATION
  // ============================================================

  openRespondModal(appointment: any): void {
    this.respondingAppointment = appointment;
    this.consultationResult    = '';
    this.responseMessage       = '';
    this.showRespondModal      = true;
  }

  closeRespondModal(): void {
    this.showRespondModal      = false;
    this.respondingAppointment = null;
    this.responding            = false;
  }

  confirmRespond(): void {
    if (!this.consultationResult) {
      alert('Please select a result.');
      return;
    }

    this.responding = true;

    this.appointmentService.respondAfterConsultation(
      this.respondingAppointment.id,
      this.consultationResult,
      this.responseMessage
    ).subscribe({
      next: () => {
        const label = this.consultationResult === 'APPROVED' ? 'approved ✅' : 'rejected ❌';
        alert(`Adoption ${label}. Email sent to adopter.`);
        this.closeRespondModal();
        this.loadAppointments();
        this.loadRequests();
      },
      error: (err) => {
        console.error('Error sending response', err);
        alert('Error sending response');
        this.responding = false;
      }
    });
  }

  // ============================================================
  // ANNULER UN RENDEZ-VOUS
  // ============================================================

  cancelAppointment(appointmentId: number): void {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentService.cancelAppointment(appointmentId, 'Cancelled by shelter').subscribe({
        next: () => {
          this.loadAppointments();
          alert('✅ Appointment cancelled successfully');
        },
        error: (err) => {
          console.error('Error cancelling appointment', err);
          alert('❌ Error cancelling appointment');
        }
      });
    }
  }

  // ============================================================
  // HELPERS AFFICHAGE
  // ============================================================

  getScoreRequest(requestId: number): any {
    return this.scoredRequests.find(r => r.id === requestId);
  }

  getScoreBarWidth(score: number): string {
    return `${score}%`;
  }

  getScoreBgColor(score: number): string {
    if (score >= 85) return '#f0fff4';
    if (score >= 70) return '#fffff0';
    if (score >= 55) return '#fff8f0';
    return '#fff5f5';
  }

  getScoreTextColor(score: number): string {
    if (score >= 85) return '#38a169';
    if (score >= 70) return '#d69e2e';
    if (score >= 55) return '#ed8936';
    return '#e53e3e';
  }

  getMinDate(): string {
    return new Date().toISOString().split('T')[0];
  }

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
    return `status-${status}`;
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

  getHousingIcon(housingType: string): string {
    const icons: any = {
      'APARTMENT': 'fa-building',
      'HOUSE': 'fa-home',
      'FARM': 'fa-tractor',
      'OTHER': 'fa-question-circle'
    };
    return icons[housingType] || 'fa-home';
  }

  getPetIcon(petName: string): string {
    return petName ? petName.charAt(0).toUpperCase() : '🐾';
  }

  getAppointmentStatusLabel(status: string): string {
    const map: any = {
      'SCHEDULED': '📅 Scheduled',
      'COMPLETED': '✅ Completed',
      'CANCELLED': '❌ Cancelled',
      'NO_SHOW':   '🚫 No Show'
    };
    return map[status] || status;
  }

  get pageTitle(): string {
    if (this.petId && this.selectedPetName) return `📋 Requests for ${this.selectedPetName}`;
    if (this.petId) return `📋 Requests for Pet #${this.petId}`;
    return '📋 Adoption Requests';
  }

  get pageSubtitle(): string {
    if (this.petId && this.filteredRequests.length > 0) {
      return `${this.filteredRequests.length} request(s) — sorted by compatibility score`;
    }
    return 'Manage adoption requests — candidates ranked by compatibility';
  }

  get pendingRequests(): any[] {
    return this.filteredRequests.filter(r =>
      r.status === 'PENDING' || r.status === 'UNDER_REVIEW');
  }

  get processedRequests(): any[] {
    return this.filteredRequests.filter(r =>
      r.status === 'APPROVED' || r.status === 'REJECTED' || r.status === 'CANCELLED');
  }

  get pendingAppointments(): any[] {
    return this.appointments.filter(a => a.status === 'SCHEDULED');
  }

  get completedAppointments(): any[] {
    return this.appointments.filter(a => a.status === 'COMPLETED' || a.status === 'CANCELLED');
  }
}