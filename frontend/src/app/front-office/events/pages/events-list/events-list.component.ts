// src/app/front-office/events/pages/events-list/events-list.component.ts
import { RouterLink } from '@angular/router';  // ← Ajoute RouterLink

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil, finalize } from 'rxjs/operators';
import { EventService } from '../../services/event.service';
import { CategoryService } from '../../services/category.service';
import { RecommendationService } from '../../services/recommendation.service';
import {
  EventSummary,
  EventCategory,
  EventRecommendation,
  STATUS_LABELS,
  STATUS_COLORS,
  SORT_OPTIONS,
} from '../../models/event.models';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.css'],
})
export class EventsListComponent implements OnInit, OnDestroy {

  // Data
  events: EventSummary[] = [];
  categories: EventCategory[] = [];
  
  // Recommandations
  recommendations: EventRecommendation[] = [];
  loadingRecommendations = true;
  showRecommendations = true;
  
  // UI State
  loading = true;
  totalElements = 0;
  totalPages = 1;
  currentPage = 0;
  pageSize = 12;
  
  // Filters
  keyword = '';
  categoryFilter: number | null = null;
  sortBy = 'startDate,asc';
  viewMode: 'grid' | 'list' = 'grid';
  
  // Constants
  readonly statusLabels = STATUS_LABELS;
  readonly statusColors = STATUS_COLORS;
  readonly sortOptions = SORT_OPTIONS;
  
  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private eventService: EventService,
    private categoryService: CategoryService,
    private recommendationService: RecommendationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🔵 ngOnInit - Démarrage');
    
    // Récupérer l'ID utilisateur
    const userId = this.getCurrentUserId();
    console.log('🔵 userId =', userId);
    
    if (userId) {
      this.loadRecommendations(userId);
    } else {
      console.log('⚠️ Aucun userId trouvé');
      this.loadingRecommendations = false;
      this.showRecommendations = false;
    }
    
    // Load categories
    this.categoryService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => this.categories = categories,
        error: (err) => console.error('Error loading categories:', err)
      });
    
    // Debounced search
    this.search$.pipe(
      debounceTime(400),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadEvents();
    });
    
    // Initial load
    this.loadEvents();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================
  // Méthodes utilisateur
  // ============================================
  
  private getCurrentUserId(): number | null {
    // Essaye de récupérer depuis localStorage
    const user = localStorage.getItem('currentUser');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        return parsed.id || parsed.userId || null;
      } catch {
        return null;
      }
    }
    
    // Si pas d'utilisateur connecté, retourne 1 pour tester
    console.log('⚠️ Aucun utilisateur connecté, utilisation de userId=1 pour test');
    return 1;
  }

  loadRecommendations(userId: number): void {
    console.log('🟢 loadRecommendations - userId =', userId);
    this.loadingRecommendations = true;
    
    this.recommendationService.getPersonalizedRecommendations(userId, 6)
      .pipe(finalize(() => {
        this.loadingRecommendations = false;
      }))
      .subscribe({
        next: (recs) => {
          console.log('✅ Recommandations reçues:', recs.length);
          this.recommendations = recs;
          this.showRecommendations = recs.length > 0;
          console.log('✅ showRecommendations =', this.showRecommendations);
        },
        error: (err) => {
          console.error('❌ Erreur chargement recommandations:', err);
          this.loadingRecommendations = false;
          this.showRecommendations = false;
        }
      });
  }

  refreshRecommendations(): void {
    const userId = this.getCurrentUserId();
    if (userId) {
      this.loadRecommendations(userId);
    }
  }

  getScoreClass(score: number): string {
    if (score >= 85) return 'score-excellent';
    if (score >= 70) return 'score-good';
    if (score >= 50) return 'score-medium';
    return 'score-low';
  }

  // ============================================
  // Data Loading
  // ============================================
  
  loadEvents(): void {
    this.loading = true;
    
    this.eventService.getAll({
      keyword: this.keyword,
      categoryId: this.categoryFilter,
      page: this.currentPage,
      size: this.pageSize,
      sort: this.sortBy
    })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response) => {
          this.events = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;
        },
        error: (err) => console.error('Error loading events:', err)
      });
  }

  // ============================================
  // Filter Handlers
  // ============================================
  
  onSearch(): void {
    this.search$.next(this.keyword);
  }
  
  onFilter(): void {
    this.currentPage = 0;
    this.loadEvents();
  }
  
  clearSearch(): void {
    this.keyword = '';
    this.onFilter();
  }
  
  resetFilters(): void {
    this.keyword = '';
    this.categoryFilter = null;
    this.sortBy = 'startDate,asc';
    this.currentPage = 0;
    this.loadEvents();
  }

  // ============================================
  // Pagination
  // ============================================
  
  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;
    this.loadEvents();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  get pageNumbers(): number[] {
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);
    
    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }
    
    return Array.from({ length: end - start }, (_, i) => start + i);
  }

  // ============================================
  // Navigation
  // ============================================
  
  openDetail(id: number): void {
    this.router.navigate(['/events', id]);
  }

  // ============================================
  // UI Helpers
  // ============================================
  
  fillPercentage(event: EventSummary): number {
    if (!event.maxParticipants) return 0;
    return Math.round(((event.maxParticipants - event.remainingSlots) / event.maxParticipants) * 100);
  }
  
  daysLeft(dateString: string): number | null {
    const eventDate = new Date(dateString);
    eventDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = eventDate.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days < 0 ? null : days;
  }
  
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  
  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  getStars(rating: number): boolean[] {
    const rounded = Math.round(rating);
    return Array.from({ length: 5 }, (_, i) => i < rounded);
  }
  
  trackById(_: number, event: EventSummary): number {
    return event.id;
  }

  // ============================================
  // Business Logic Helpers
  // ============================================
  
  isJoinable(event: EventSummary): boolean {
    return event.status === 'PLANNED' && event.remainingSlots > 0;
  }
  
  isWaitlistable(event: EventSummary): boolean {
    return event.status === 'FULL';
  }
  
  isCompetition(event: EventSummary): boolean {
    return !!event.category?.requiresApproval;
  }
  
  isCancelled(event: EventSummary): boolean {
    return event.status === 'CANCELLED';
  }
}