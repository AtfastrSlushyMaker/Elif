// src/app/front-office/events/pages/recommendations/recommendations.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { RecommendationService } from '../../services/recommendation.service';
import { EventRecommendation, EventSummary } from '../../models/event.models';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.css']
})
export class RecommendationsComponent implements OnInit {

  recommendations: EventRecommendation[] = [];
  loading = true;
  userId: number | null = null;

  constructor(
    private recommendationService: RecommendationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.getCurrentUserId();
    if (this.userId) {
      this.loadRecommendations();
    } else {
      this.loading = false;
    }
  }

  private getCurrentUserId(): number | null {
    const user = localStorage.getItem('currentUser');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        return parsed.id || parsed.userId || null;
      } catch {
        return null;
      }
    }
    return null;
  }

  loadRecommendations(): void {
    if (!this.userId) return;
    this.loading = true;

    this.recommendationService.getPersonalizedRecommendations(this.userId, 20)
      .pipe(finalize(() => {
        this.loading = false;
      }))
      .subscribe({
        next: (recs) => {
          this.recommendations = recs;
        },
        error: (err) => {
          console.error('Error loading recommendations:', err);
          this.loading = false;
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/app/events']);
  }

  openEvent(id: number): void {
    this.router.navigate(['/app/events', id]);
  }

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
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
}
