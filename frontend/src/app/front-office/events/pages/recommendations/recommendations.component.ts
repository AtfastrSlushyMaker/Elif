// recommendations.component.ts - VERSION CORRIGÉE AVEC AUTH SERVICE

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { RecommendationService } from '../../services/recommendation.service';
import { EventRecommendation, EventSummary } from '../../models/event.models';
import { AuthService } from '../../../../auth/auth.service';  // 👈 AJOUTER

type PageState = 'loading' | 'done' | 'empty' | 'error' | 'not-logged-in';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, MatIconModule],
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.css']
})
export class RecommendationsComponent implements OnInit, OnDestroy {

  recommendations: EventRecommendation[] = [];
  pageState: PageState = 'loading';
  errorMessage = '';
  userId: number | null = null;

  get loading(): boolean { return this.pageState === 'loading'; }

  private destroy$ = new Subject<void>();

  constructor(
    private recommendationService: RecommendationService,
    private authService: AuthService,  // 👈 AJOUTER
    private router: Router
  ) {}

  ngOnInit(): void {
    // 👈 UTILISER AuthService DIRECTEMENT
    const currentUser = this.authService.getCurrentUser?.();
    
    console.log('Current user from AuthService:', currentUser);
    
    if (currentUser?.id) {
      this.userId = currentUser.id;
      console.log('✅ User ID found:', this.userId);
    } else {
      // Fallback: essayer plusieurs façons de récupérer l'utilisateur
      this.userId = this.getUserIdFromStorage();
    }

    if (!this.userId) {
      console.warn('⚠️ No user ID found - user not logged in');
      this.pageState = 'not-logged-in';
      return;
    }

    this.loadRecommendations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Méthode de secours pour récupérer l'ID utilisateur
  private getUserIdFromStorage(): number | null {
    // Essayer toutes les clés possibles
    const keysToTry = ['currentUser', 'user', 'auth_user', 'userData', 'authUser', 'token'];
    
    for (const key of keysToTry) {
      try {
        // localStorage
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Vérifier différentes structures possibles
          const id = parsed?.id ?? parsed?.userId ?? parsed?.user?.id ?? null;
          if (id && !isNaN(Number(id))) {
            console.log(`✅ Found user ID in localStorage key "${key}":`, id);
            return Number(id);
          }
        }
        
        // sessionStorage
        const sessionRaw = sessionStorage.getItem(key);
        if (sessionRaw) {
          const parsed = JSON.parse(sessionRaw);
          const id = parsed?.id ?? parsed?.userId ?? parsed?.user?.id ?? null;
          if (id && !isNaN(Number(id))) {
            console.log(`✅ Found user ID in sessionStorage key "${key}":`, id);
            return Number(id);
          }
        }
      } catch (e) {
        // Ignorer les erreurs de parsing
      }
    }
    
    return null;
  }

  loadRecommendations(): void {
    if (!this.userId) {
      this.pageState = 'not-logged-in';
      return;
    }
    
    console.log(`🔄 Loading recommendations for user ${this.userId}...`);
    this.pageState = 'loading';

    this.recommendationService
      .getPersonalizedRecommendations(this.userId, 20)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          if (this.pageState === 'loading') {
            this.pageState = 'error';
            this.errorMessage = 'Request timeout or no response';
          }
        })
      )
      .subscribe({
        next: (recs) => {
          console.log(`📦 Received ${recs?.length || 0} recommendations`);
          this.recommendations = recs ?? [];
          this.pageState = this.recommendations.length > 0 ? 'done' : 'empty';
        },
        error: (err) => {
          console.error('❌ Error loading recommendations:', err);
          if (err.status === 401 || err.status === 403) {
            this.pageState = 'not-logged-in';
            this.errorMessage = 'Please log in again.';
          } else {
            this.errorMessage = err?.error?.message || err?.message || 'Unable to load recommendations. Please try again.';
            this.pageState = 'error';
          }
        }
      });
  }

  // ... reste du code identique
  goBack(): void { this.router.navigate(['/app/events']); }
  openEvent(id: number): void { this.router.navigate(['/app/events', id]); }
  goToLogin(): void { this.router.navigate(['/login']); }
  retry(): void { this.loadRecommendations(); }

  getScoreClass(score: number): string {
    if (score >= 85) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-medium';
    return 'score-low';
  }

  fillPercentage(event: EventSummary): number {
    if (!event.maxParticipants) return 0;
    return Math.round(((event.maxParticipants - event.remainingSlots) / event.maxParticipants) * 100);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  trackRec(_: number, r: EventRecommendation): number {
    return r.event?.id ?? _;
  }
}
