import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { Post } from '../community/models/post.model';
import { PostService } from '../community/services/post.service';
import { TravelPlanSummary } from '../pet-transit/models/travel-plan.model';
import { TravelPlanService } from '../pet-transit/services/travel-plan.service';
import { PetProfile } from '../../shared/models/pet-profile.model';
import { PetProfileService } from '../../shared/services/pet-profile.service';

interface DashboardActivity {
  title: string;
  subtitle: string;
  timestamp: string;
  kind: 'pet' | 'travel' | 'community';
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  loading = false;
  error = '';

  userFirstName = 'there';
  pets: PetProfile[] = [];
  travelPlans: TravelPlanSummary[] = [];
  trendingPosts: Post[] = [];
  recentActivity: DashboardActivity[] = [];

  constructor(
    private readonly authService: AuthService,
    private readonly petProfileService: PetProfileService,
    private readonly travelPlanService: TravelPlanService,
    private readonly postService: PostService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  get upcomingTravelPlan(): TravelPlanSummary | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = this.travelPlans
      .filter((plan) => {
        const travelDate = this.parseDate(plan.travelDate);
        return travelDate ? travelDate >= today : false;
      })
      .sort((a, b) => this.toDateValue(a.travelDate) - this.toDateValue(b.travelDate));

    return upcoming[0] ?? null;
  }

  get activeTravelPlansCount(): number {
    return this.travelPlans.filter((plan) => plan.status !== 'COMPLETED' && plan.status !== 'CANCELLED').length;
  }

  get postsCount(): number {
    return this.trendingPosts.length;
  }

  viewPet(petId: number): void {
    this.router.navigate(['/app/pets', petId]);
  }

  openPetsPage(): void {
    this.router.navigate(['/app/pets']);
  }

  openTransitPage(): void {
    this.router.navigate(['/app/transit/plans']);
  }

  openCommunityPage(): void {
    this.router.navigate(['/app/community']);
  }

  trackByPetId(_: number, pet: PetProfile): number {
    return pet.id;
  }

  trackByActivity(_: number, activity: DashboardActivity): string {
    return `${activity.kind}:${activity.title}:${activity.timestamp}`;
  }

  formatSpecies(species: string): string {
    return species
      .toLowerCase()
      .split('_')
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join(' ');
  }

  formatDate(dateText?: string): string {
    const date = this.parseDate(dateText);
    if (!date) {
      return 'Unknown date';
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }

  formatRelativeDate(dateText?: string): string {
    const date = this.parseDate(dateText);
    if (!date) {
      return 'Unknown time';
    }

    const diffMs = Date.now() - date.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < hour) {
      const minutes = Math.max(1, Math.floor(diffMs / minute));
      return `${minutes}m ago`;
    }
    if (diffMs < day) {
      const hours = Math.max(1, Math.floor(diffMs / hour));
      return `${hours}h ago`;
    }
    const days = Math.max(1, Math.floor(diffMs / day));
    return `${days}d ago`;
  }

  private loadDashboard(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      this.error = 'Please log in to load your dashboard.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.userFirstName = user.firstName || 'there';

    forkJoin({
      pets: this.petProfileService.getMyPets(user.id).pipe(catchError(() => of([] as PetProfile[]))),
      travelPlans: this.travelPlanService.getMyTravelPlans().pipe(catchError(() => of([] as TravelPlanSummary[]))),
      trendingPosts: this.postService.getTrending(6, 'HOT', user.id).pipe(catchError(() => of([] as Post[])))
    }).subscribe({
      next: ({ pets, travelPlans, trendingPosts }) => {
        this.pets = [...pets].sort((a, b) => a.name.localeCompare(b.name));
        this.travelPlans = [...travelPlans].sort((a, b) => this.toDateValue(b.travelDate) - this.toDateValue(a.travelDate));
        this.trendingPosts = [...trendingPosts].sort((a, b) => this.toDateValue(b.createdAt) - this.toDateValue(a.createdAt));
        this.recentActivity = this.buildRecentActivity();
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load your dashboard right now. Please try again.';
        this.loading = false;
      }
    });
  }

  private buildRecentActivity(): DashboardActivity[] {
    const petActivities: DashboardActivity[] = this.pets.slice(0, 3).map((pet) => ({
      title: `${pet.name} profile updated`,
      subtitle: `${this.formatSpecies(pet.species)} • ${pet.ageDisplay || 'Age unavailable'}`,
      timestamp: pet.updatedAt,
      kind: 'pet'
    }));

    const travelActivities: DashboardActivity[] = this.travelPlans.slice(0, 3).map((plan) => ({
      title: `${plan.destinationTitle} travel plan ${plan.status.toLowerCase().replace('_', ' ')}`,
      subtitle: `${plan.petName || 'No pet selected'} • ${this.formatDate(plan.travelDate)}`,
      timestamp: plan.createdAt,
      kind: 'travel'
    }));

    const communityActivities: DashboardActivity[] = this.trendingPosts.slice(0, 3).map((post) => ({
      title: post.title,
      subtitle: `${post.communitySlug} • ${post.commentCount ?? 0} comments`,
      timestamp: post.createdAt,
      kind: 'community'
    }));

    return [...petActivities, ...travelActivities, ...communityActivities]
      .sort((a, b) => this.toDateValue(b.timestamp) - this.toDateValue(a.timestamp))
      .slice(0, 6);
  }

  private parseDate(dateText?: string): Date | null {
    if (!dateText) {
      return null;
    }
    const date = new Date(dateText);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private toDateValue(dateText?: string): number {
    const date = this.parseDate(dateText);
    return date ? date.getTime() : 0;
  }
}
