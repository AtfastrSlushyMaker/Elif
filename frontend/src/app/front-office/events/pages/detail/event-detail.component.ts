// src/app/front-office/events/pages/detail/event-detail.component.ts

import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../../../auth/auth.service';  // ✅ Import ajouté

import { 
  EventDetail, 
  WeatherResponse, 
  EventReviewResponse, 
  EventParticipantResponse,
  EventParticipantRequest,
  WaitlistResponse,
  STATUS_LABELS,
  STATUS_COLORS
} from '../../models/event.models';

interface ToastMessage {
  msg: string;
  type: 'ok' | 'err' | 'info' | 'warn';
}

interface CompetitionForm {
  species: string;
  petName: string;
  breed: string;
  ageMonths: number | null;
  weightKg: number | null;
  notes: string;
}

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit, OnDestroy {
  
  // ============================================
  // Data
  // ============================================
  
  event: EventDetail | null = null;
  weather: WeatherResponse | null = null;
  reviews: EventReviewResponse[] = [];
  myEntry: EventParticipantResponse | null = null;
  waitEntry: WaitlistResponse | null = null;
  myReview: EventReviewResponse | null = null;
  
  // ============================================
  // UI State
  // ============================================
  
  loading = true;
  loadingWeather = true;
  loadingReviews = true;
  error: string | null = null;
  
  activeTab: 'info' | 'weather' | 'reviews' | 'suggestions' = 'info';
  
  // Registration state
  regState: 'none' | 'confirmed' | 'pending' | 'on_waitlist' = 'none';
  seats = 1;
  submitting = false;
  
  // Review state
  reviewRating = 5;
  reviewComment = '';
  reviewError: string | null = null;
  submittingReview = false;
  reviewTotal = 0;
  
  // Competition form
  showCompForm = false;
  compStep = 1;
  compForm: CompetitionForm = {
    species: '',
    petName: '',
    breed: '',
    ageMonths: null,
    weightKg: null,
    notes: ''
  };
  
  petSpecies = [
    { value: 'dog', label: 'Chien', icon: '🐕' },
    { value: 'cat', label: 'Chat', icon: '🐈' },
    { value: 'rabbit', label: 'Lapin', icon: '🐇' },
    { value: 'bird', label: 'Oiseau', icon: '🐦' },
    { value: 'reptile', label: 'Reptile', icon: '🦎' },
    { value: 'other', label: 'Autre', icon: '🐾' }
  ];
  
  // Toast
  toast: ToastMessage | null = null;
  private toastTimeout: any = null;
  
  // Weather emoji mapping
  weatherEmoji: Record<string, string> = {
    'SUNNY': '☀️',
    'CLOUDY': '⛅',
    'RAINY': '🌧️',
    'STORMY': '⛈️',
    'SNOWY': '❄️',
    'UNKNOWN': '🌤️'
  };
  
  // Constants for template
  readonly statusLabels = STATUS_LABELS;
  readonly statusColors = STATUS_COLORS;
  
  private destroy$ = new Subject<void>();

  // ✅ Injection du AuthService (public pour accès dans le template)
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    public auth: AuthService,  // ✅ Ajouté et public pour le template
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadEvent(id);
      this.loadWeather(id);
      this.loadReviews(id);
      this.checkMyRegistration(id);
    } else {
      this.error = 'Événement non trouvé';
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
  }

  // ============================================
  // Getters
  // ============================================
  
  get isCompetition(): boolean {
    return !!this.event?.category?.requiresApproval;
  }
  
  get canJoin(): boolean {
    if (!this.event) return false;
    return this.event.status === 'PLANNED' && this.event.remainingSlots > 0;
  }
  
  get canWaitlist(): boolean {
    if (!this.event) return false;
    return this.event.status === 'FULL';
  }
  
  get canReview(): boolean {
    if (!this.event || !this.myEntry) return false;
    return this.event.status === 'COMPLETED' && 
           this.myEntry.status === 'CONFIRMED' &&
           !this.myReview;
  }
  
  get fillPct(): number {
    if (!this.event || !this.event.maxParticipants) return 0;
    const used = this.event.maxParticipants - this.event.remainingSlots;
    return Math.round((used / this.event.maxParticipants) * 100);
  }
  
  get compSpeciesIcon(): string {
    const species = this.petSpecies.find(s => s.value === this.compForm.species);
    return species?.icon || '🐾';
  }
  
  get compSpeciesLabel(): string {
    const species = this.petSpecies.find(s => s.value === this.compForm.species);
    return species?.label || this.compForm.species;
  }

  // ============================================
  // Data Loading
  // ============================================
  
  loadEvent(id: number): void {
    this.eventService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event) => {
          this.event = event;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading event:', err);
          this.error = 'Impossible de charger l\'événement';
          this.loading = false;
        }
      });
  }

  loadWeather(id: number): void {
    this.loadingWeather = true;
    this.eventService.getEventWeather(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (weather) => {
          this.weather = weather;
          this.loadingWeather = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading weather:', err);
          this.loadingWeather = false;
        }
      });
  }

  loadReviews(id: number): void {
    this.loadingReviews = true;
    this.eventService.getEventReviews(id, 0, 20)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.reviews = response.content;
          this.reviewTotal = response.totalElements;
          this.loadingReviews = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading reviews:', err);
          this.loadingReviews = false;
        }
      });
  }

  checkMyRegistration(eventId: number): void {
    const userId = this.auth.getCurrentUser()?.id;
    if (!userId) {
      this.regState = 'none';
      return;
    }
    
    // Check registration
    this.eventService.getMyRegistrations(userId, 0, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.myEntry = response.content.find(r => r.eventId === eventId) || null;
          this.updateRegState();
          
          // Check if user has a review
          if (this.myEntry) {
            this.myReview = this.reviews.find(r => r.userId === userId) || null;
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.myEntry = null;
          this.updateRegState();
        }
      });
    
    // Check waitlist
    this.eventService.getMyWaitlistEntry(eventId, userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (waitlist) => {
          this.waitEntry = waitlist;
          this.updateRegState();
          this.cdr.detectChanges();
        },
        error: () => {
          this.waitEntry = null;
          this.updateRegState();
        }
      });
  }
  
  updateRegState(): void {
    if (this.myEntry) {
      if (this.myEntry.status === 'CONFIRMED') {
        this.regState = 'confirmed';
      } else if (this.myEntry.status === 'PENDING') {
        this.regState = 'pending';
      } else {
        this.regState = 'none';
      }
    } else if (this.waitEntry) {
      this.regState = 'on_waitlist';
    } else {
      this.regState = 'none';
    }
  }

  // ============================================
  // Actions - Registration
  // ============================================
  
  handleMainAction(): void {
    if (this.canWaitlist) {
      this.joinWaitlist();
    } else if (this.canJoin && this.isCompetition) {
      this.showCompForm = true;
      this.compStep = 1;
      // Reset form
      this.compForm = {
        species: '',
        petName: '',
        breed: '',
        ageMonths: null,
        weightKg: null,
        notes: ''
      };
    } else if (this.canJoin) {
      this.register();
    }
  }
  
  register(): void {
    if (!this.event) return;
    
    const userId = this.auth.getCurrentUser()?.id;
    if (!userId) {
      this.showToast('Veuillez vous connecter', 'warn');
      return;
    }
    
    this.submitting = true;
    const request: EventParticipantRequest = { numberOfSeats: this.seats };
    
    this.eventService.register(this.event.id, userId, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.showToast('✅ Inscription réussie !', 'ok');
          this.checkMyRegistration(this.event!.id);
          this.loadEvent(this.event!.id);
        },
        error: (err) => {
          this.submitting = false;
          this.showToast(err.error?.message || 'Erreur lors de l\'inscription', 'err');
        }
      });
  }
  
  submitCompetition(): void {
    if (!this.event) return;
    
    const userId = this.auth.getCurrentUser()?.id;
    if (!userId) {
      this.showToast('Veuillez vous connecter', 'warn');
      return;
    }
    
    this.submitting = true;
    const request: EventParticipantRequest = {
      numberOfSeats: 1,
      animalName: this.compForm.petName,
      animalBreed: this.compForm.breed,
      animalWeight: this.compForm.weightKg || undefined,
      animalAge: this.compForm.ageMonths ? Math.floor(this.compForm.ageMonths / 12) : undefined,
      additionalInfo: this.compForm.notes
    };
    
    this.eventService.register(this.event.id, userId, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.showCompForm = false;
          this.showToast('🏆 Candidature soumise ! En attente d\'approbation', 'ok');
          this.checkMyRegistration(this.event!.id);
        },
        error: (err) => {
          this.submitting = false;
          this.showToast(err.error?.message || 'Erreur lors de la soumission', 'err');
        }
      });
  }
  
  joinWaitlist(): void {
    if (!this.event) return;
    
    const userId = this.auth.getCurrentUser()?.id;
    if (!userId) {
      this.showToast('Veuillez vous connecter', 'warn');
      return;
    }
    
    this.submitting = true;
    const request: EventParticipantRequest = { numberOfSeats: this.seats };
    
    this.eventService.joinWaitlist(this.event.id, userId, request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.submitting = false;
          this.showToast(`📋 Ajouté à la liste d'attente - Position ${response.position}`, 'ok');
          this.checkMyRegistration(this.event!.id);
        },
        error: (err) => {
          this.submitting = false;
          this.showToast(err.error?.message || 'Erreur lors de l\'ajout à la liste d\'attente', 'err');
        }
      });
  }
  
  cancelRegistration(): void {
    if (!this.event) return;
    
    const userId = this.auth.getCurrentUser()?.id;
    if (!userId) return;
    
    if (!confirm('Êtes-vous sûr de vouloir annuler votre participation ?')) return;
    
    this.submitting = true;
    
    if (this.myEntry) {
      this.eventService.leaveEvent(this.event.id, userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.submitting = false;
            this.showToast('Participation annulée', 'ok');
            this.checkMyRegistration(this.event!.id);
            this.loadEvent(this.event!.id);
          },
          error: (err) => {
            this.submitting = false;
            this.showToast(err.error?.message || 'Erreur lors de l\'annulation', 'err');
          }
        });
    } else if (this.waitEntry) {
      this.eventService.leaveWaitlist(this.event.id, userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.submitting = false;
            this.showToast('Retiré de la liste d\'attente', 'ok');
            this.checkMyRegistration(this.event!.id);
          },
          error: (err) => {
            this.submitting = false;
            this.showToast(err.error?.message || 'Erreur lors du retrait', 'err');
          }
        });
    }
  }
  
  leaveWaitlist(): void {
    this.cancelRegistration();
  }

  // ============================================
  // Actions - Reviews
  // ============================================
  
  submitReview(): void {
    if (!this.event) return;
    
    const userId = this.auth.getCurrentUser()?.id;
    if (!userId) {
      this.showToast('Veuillez vous connecter', 'warn');
      return;
    }
    
    this.reviewError = null;
    if (this.reviewComment.length > 1000) {
      this.reviewError = 'Le commentaire ne peut pas dépasser 1000 caractères';
      return;
    }
    
    this.submittingReview = true;
    
    this.eventService.submitReview(this.event.id, userId, {
      rating: this.reviewRating,
      comment: this.reviewComment
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submittingReview = false;
          this.reviewRating = 5;
          this.reviewComment = '';
          this.showToast('⭐ Merci pour votre avis !', 'ok');
          this.loadReviews(this.event!.id);
          this.checkMyRegistration(this.event!.id);
        },
        error: (err) => {
          this.submittingReview = false;
          this.reviewError = err.error?.message || 'Erreur lors de l\'envoi de l\'avis';
        }
      });
  }
  
  deleteMyReview(): void {
    if (!this.myReview) return;
    
    const userId = this.auth.getCurrentUser()?.id;
    if (!userId) return;
    
    if (!confirm('Supprimer votre avis ?')) return;
    
    this.eventService.deleteReview(this.myReview.id, userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.myReview = null;
          this.showToast('Avis supprimé', 'ok');
          this.loadReviews(this.event!.id);
          this.loadEvent(this.event!.id);
        },
        error: (err) => {
          this.showToast(err.error?.message || 'Erreur lors de la suppression', 'err');
        }
      });
  }

  // ============================================
  // UI Helpers
  // ============================================
  
  setTab(tab: 'info' | 'weather' | 'reviews' | 'suggestions'): void {
    this.activeTab = tab;
  }
  
  goBack(): void {
    this.router.navigate(['/app/events']);
  }
  
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  stars(rating: number): boolean[] {
    const rounded = Math.round(rating);
    return Array.from({ length: 5 }, (_, i) => i < rounded);
  }
  
  trackById(index: number, item: any): number {
    return item.id;
  }
  
  // ============================================
  // Toast Notifications
  // ============================================
  
  private showToast(msg: string, type: 'ok' | 'err' | 'info' | 'warn'): void {
    this.toast = { msg, type };
    this.cdr.detectChanges();
    
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toast = null;
      this.cdr.detectChanges();
    }, 4000);
  }
}