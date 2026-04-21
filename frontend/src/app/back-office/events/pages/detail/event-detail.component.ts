
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { 
  AdminEventService, 
  AdminAuthService,
  AdminCapacityService,
  AdminParticipantService,
  AdminWaitlistService,
  AdminWeatherService,
  AdminReviewService,
  AdminExportService
} from '../../services/admin-api.service';
import { EventDetail, EventCapacityResponse, EventParticipantResponse, WaitlistResponse, WeatherResponse, EventReviewResponse } from '../../models/admin-events.models';
import { AdminVirtualSessionComponent } from '../../components/admin-virtual-session/admin-virtual-session.component';
@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe,  AdminVirtualSessionComponent],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {
  
  event: EventDetail | null = null;
  loading = true;
  error = '';
  
  // Modals
  activeTab: 'info' | 'participants' | 'waitlist' | 'reviews' | 'weather' | 'virtual' = 'info';
  
  // Participants
  participants: EventParticipantResponse[] = [];
  pendingList: EventParticipantResponse[] = [];
  loadingParticipants = false;
  
  // Waitlist
  waitlist: WaitlistResponse[] = [];
  loadingWaitlist = false;
  
  // Capacity
  capacityData: EventCapacityResponse | null = null;
  loadingCapacity = false;
  
  // Weather
  weather: WeatherResponse | null = null;
  loadingWeather = false;
  
  // Reviews
  reviews: EventReviewResponse[] = [];
  loadingReviews = false;
  
  // Export
  exporting = false;
   getAdminId(): number {
    return this.auth.getAdminId();
  }
  // Actions
  showConfirmDialog = false;
  confirmAction: { title: string; message: string; action: () => void } | null = null;

  statusLabels: Record<string, string> = {
    PLANNED: 'Planned',
    ONGOING: 'Ongoing',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    FULL: 'Full'
  };

  statusColors: Record<string, string> = {
    PLANNED: '#2ea46c',
    ONGOING: '#f59e0b',
    COMPLETED: '#3b82f6',
    CANCELLED: '#ef4444',
    FULL: '#a855f7'
  };

  weatherIcons: Record<string, string> = {
    SUNNY: '☀️',
    CLOUDY: '⛅',
    RAINY: '🌧️',
    STORMY: '⛈️',
    SNOWY: '❄️',
    UNKNOWN: '🌤️'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: AdminEventService,
    private capacityService: AdminCapacityService,
    private participantService: AdminParticipantService,
    private waitlistService: AdminWaitlistService,
    private weatherService: AdminWeatherService,
    private reviewService: AdminReviewService,
    private exportService: AdminExportService,
    private auth: AdminAuthService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadEvent(+id);
    } else {
      this.error = 'Event ID not found';
      this.loading = false;
    }
  }

  loadEvent(id: number) {
    this.loading = true;
    this.eventService.getById(id).subscribe({
      next: (e) => {
        this.event = e;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading event', err);
        this.error = 'Failed to load event details';
        this.loading = false;
      }
    });
  }

 // Tabs - CORRECTION
 setTab(tab: 'info' | 'participants' | 'waitlist' | 'reviews' | 'weather' | 'virtual') {
    this.activeTab = tab;
    
    if (tab === 'participants') this.loadParticipants();
    if (tab === 'waitlist') this.loadWaitlist();
    if (tab === 'reviews') this.loadReviews();
    if (tab === 'weather') this.loadWeather();    // ✅ maintenaant accepté
    if (tab === 'info') this.loadCapacity();
    // 'virtual' : pas de chargement nécessaire
  }
  loadCapacity() {
    if (!this.event) return;
    this.loadingCapacity = true;
    this.capacityService.getSnapshot(this.event.id).subscribe({
      next: (c) => {
        this.capacityData = c;
        this.loadingCapacity = false;
      },
      error: () => {
        this.loadingCapacity = false;
      }
    });
  }

  loadParticipants() {
    if (!this.event) return;
    this.loadingParticipants = true;
    
    this.participantService.getConfirmed(this.event.id, this.auth.getAdminId()).subscribe({
      next: (r) => {
        this.participants = r.content;
      },
      error: () => {}
    });
    
    this.participantService.getPending(this.event.id, this.auth.getAdminId()).subscribe({
      next: (r) => {
        this.pendingList = r.content;
        this.loadingParticipants = false;
      },
      error: () => {
        this.loadingParticipants = false;
      }
    });
  }

  loadWaitlist() {
    if (!this.event) return;
    this.loadingWaitlist = true;
    this.waitlistService.getWaitlist(this.event.id, this.auth.getAdminId()).subscribe({
      next: (r) => {
        this.waitlist = r.content;
        this.loadingWaitlist = false;
      },
      error: () => {
        this.loadingWaitlist = false;
      }
    });
  }

  loadReviews() {
    if (!this.event) return;
    this.loadingReviews = true;
    this.reviewService.getReviews(this.event.id).subscribe({
      next: (r) => {
        this.reviews = r.content;
        this.loadingReviews = false;
      },
      error: () => {
        this.loadingReviews = false;
      }
    });
  }

  loadWeather() {
    if (!this.event) return;
    this.loadingWeather = true;
    this.weatherService.getForEvent(this.event.id).subscribe({
      next: (w) => {
        this.weather = w;
        this.loadingWeather = false;
      },
      error: () => {
        this.loadingWeather = false;
      }
    });
  }

  // Participant actions
  approveParticipant(p: EventParticipantResponse) {
    this.participantService.approve(p.id, this.auth.getAdminId()).subscribe({
      next: () => {
        this.loadParticipants();
        this.loadCapacity();
      },
      error: (err) => console.error('Error approving participant', err)
    });
  }

  rejectParticipant(p: EventParticipantResponse) {
    this.participantService.reject(p.id, this.auth.getAdminId()).subscribe({
      next: () => {
        this.loadParticipants();
      },
      error: (err) => console.error('Error rejecting participant', err)
    });
  }

  // Waitlist actions
  promoteNext() {
    if (!this.event) return;
    this.waitlistService.promoteNext(this.event.id).subscribe({
      next: () => {
        this.loadWaitlist();
        this.loadCapacity();
        this.loadParticipants();
      },
      error: (err) => console.error('Error promoting next', err)
    });
  }

  // Recalculate capacity
  recalculateCapacity() {
    if (!this.event) return;
    this.capacityService.recalculate(this.event.id, this.auth.getAdminId()).subscribe({
      next: (c) => {
        this.capacityData = c;
        this.loadEvent(this.event!.id);
      },
      error: (err) => console.error('Error recalculating capacity', err)
    });
  }

  // Export
  exportParticipants() {
    if (!this.event) return;
    this.exporting = true;
    this.exportService.exportParticipants(this.event.id, this.auth.getAdminId()).subscribe({
      next: (blob) => {
        const safeTitle = this.event!.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        this.exportService.downloadBlob(blob, `participants_${safeTitle}_${this.today()}.csv`);
        this.exporting = false;
      },
      error: () => {
        this.exporting = false;
      }
    });
  }

  // Cancel event
  confirmCancel() {
    this.confirmAction = {
      title: 'Cancel Event',
      message: `Are you sure you want to cancel "${this.event?.title}"? All participants will be notified.`,
      action: () => {
        if (!this.event) return;
        this.eventService.cancel(this.event.id, this.auth.getAdminId()).subscribe({
          next: () => {
            this.loadEvent(this.event!.id);
            this.closeConfirm();
          },
          error: (err) => console.error('Error cancelling event', err)
        });
      }
    };
    this.showConfirmDialog = true;
  }

  // Delete event
  confirmDelete() {
    this.confirmAction = {
      title: 'Delete Event',
      message: `This action is irreversible. Delete "${this.event?.title}" permanently?`,
      action: () => {
        if (!this.event) return;
        this.eventService.delete(this.event.id, this.auth.getAdminId()).subscribe({
          next: () => {
            this.router.navigate(['/admin/events']);
          },
          error: (err) => console.error('Error deleting event', err)
        });
      }
    };
    this.showConfirmDialog = true;
  }

  closeConfirm() {
    this.showConfirmDialog = false;
    this.confirmAction = null;
  }

  // Navigation
  goBack() {
    this.router.navigate(['/admin/events']);
  }

  goToEdit() {
    if (!this.event) return;
    this.router.navigate(['/admin/events', this.event.id, 'edit']);
  }

  // Helpers
  private today(): string {
    return new Date().toISOString().split('T')[0];
  }

  starsArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatTime(date: string | Date): string {
    return new Date(date).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  canCancel(): boolean {
    if (!this.event) return false;
    return !['CANCELLED', 'COMPLETED'].includes(this.event.status);
  }

  getFillRate(): number {
    if (!this.capacityData) return 0;
    return this.capacityData.fillRatePercent;
  }
  // back-office/events/pages/detail/event-detail.component.ts

// Ajoute cette méthode avec les autres méthodes (vers ligne 150-160)
deleteReview(reviewId: number) {
  this.reviewService.deleteReview(reviewId, this.auth.getAdminId()).subscribe({
    next: () => {
      // Supprimer l'avis de la liste locale
      this.reviews = this.reviews.filter(r => r.id !== reviewId);
    },
    error: (err) => {
      console.error('Error deleting review', err);
    }
  });
}
// Dans event-detail.component.ts
}