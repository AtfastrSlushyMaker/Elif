import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Community } from '../../models/community.model';
import { Post } from '../../models/post.model';
import { CommunityService } from '../../services/community.service';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-community-list',
  templateUrl: './community-list.component.html',
  styleUrl: './community-list.component.css'
})
export class CommunityListComponent implements OnInit {
  private readonly bannerPalette = ['#A7E1D8', '#FCD6A0', '#F9B3B9', '#B7D7F7', '#CBB8F4', '#BFE8C3', '#F7D5E6', '#F6E6A8'];
  private readonly collapseState: Record<string, boolean> = {
    creators: false,
    moderators: false,
    members: false
  };
  communities: Community[] = [];
  trendingPosts: Post[] = [];
  communitySearch = '';
  showJoinedOnly = false;
  trendingSort: 'HOT' | 'NEW' | 'TOP' | 'CONTROVERSIAL' = 'HOT';
  loading = true;
  loadingTrending = true;
  error = '';

  get userId(): number | undefined {
    return this.auth.getCurrentUser()?.id;
  }

  get isLoggedIn(): boolean {
    return !!this.userId;
  }

  get filteredCommunities(): Community[] {
    const term = this.communitySearch.trim().toLowerCase();
    const pool = this.showJoinedOnly ? this.joinedCommunities : this.communities;

    if (!term) {
      return pool;
    }

    return pool.filter((community) => {
      const name = community.name.toLowerCase();
      const description = (community.description || '').toLowerCase();
      return name.includes(term) || description.includes(term);
    });
  }

  get joinedCommunities(): Community[] {
    return this.communities.filter((community) => !!community.userRole);
  }

  get joinedGroups(): Array<{ key: string; title: string; items: Community[] }> {
    const creators = this.joinedCommunities.filter((community) => community.userRole === 'CREATOR');
    const moderators = this.joinedCommunities.filter((community) => community.userRole === 'MODERATOR');
    const members = this.joinedCommunities.filter((community) => community.userRole === 'MEMBER');

    return [
      { key: 'creators', title: 'Managed by you', items: creators },
      { key: 'moderators', title: 'You moderate', items: moderators },
      { key: 'members', title: 'Joined', items: members }
    ].filter((group) => group.items.length > 0);
  }

  get topCommunities(): Community[] {
    return [...this.communities]
      .sort((a, b) => b.memberCount - a.memberCount)
      .slice(0, 5);
  }

  get publicCount(): number {
    return this.communities.filter((community) => community.type === 'PUBLIC').length;
  }

  get privateCount(): number {
    return this.communities.filter((community) => community.type === 'PRIVATE').length;
  }

  get totalMemberReach(): number {
    return this.communities.reduce((sum, community) => sum + community.memberCount, 0);
  }

  get featuredCommunities(): Community[] {
    return [...this.communities]
      .sort((a, b) => {
        const roleBoostA = a.userRole ? 1 : 0;
        const roleBoostB = b.userRole ? 1 : 0;
        if (roleBoostB !== roleBoostA) {
          return roleBoostB - roleBoostA;
        }
        return b.memberCount - a.memberCount;
      })
      .slice(0, 3);
  }

  get hasCommunityFilters(): boolean {
    return this.showJoinedOnly || !!this.communitySearch.trim();
  }

  constructor(
    private communityService: CommunityService,
    private postService: PostService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.communityService.getAll(this.userId).subscribe({
      next: (data) => {
        this.communities = data;
        this.loading = false;
        this.loadTrendingPosts();
      },
      error: () => {
        this.error = 'Unable to load communities now.';
        this.loading = false;
        this.loadingTrending = false;
      }
    });
  }

  communityFor(post: Post): Community | undefined {
    return this.communities.find((community) => community.id === post.communityId);
  }

  canManagePost(post: Post): boolean {
    const community = this.communityFor(post);
    if (!community) {
      return false;
    }

    const role = community.userRole;
    const isOwner = this.userId != null && post.userId === this.userId;
    const isModerator = role === 'CREATOR' || role === 'MODERATOR';
    return isOwner || isModerator;
  }

  roleLabel(community: Community): string {
    if (!community.userRole) {
      return 'Visitor';
    }

    if (community.userRole === 'CREATOR') {
      return 'Creator';
    }

    if (community.userRole === 'MODERATOR') {
      return 'Moderator';
    }

    return 'Member';
  }

  roleTone(community: Community): string {
    if (community.userRole === 'CREATOR') {
      return 'bg-brand-orange/15 text-brand-orange border-brand-orange/20';
    }

    if (community.userRole === 'MODERATOR') {
      return 'bg-brand-teal/15 text-brand-teal border-brand-teal/20';
    }

    if (community.userRole === 'MEMBER') {
      return 'bg-slate-100 text-slate-700 border-slate-200';
    }

    return 'bg-white text-slate-500 border-slate-200';
  }

  communityInitial(community: Community): string {
    return community.name.trim().charAt(0).toUpperCase() || 'C';
  }

  isGroupCollapsed(groupKey: string): boolean {
    return this.collapseState[groupKey] ?? false;
  }

  toggleGroup(groupKey: string): void {
    this.collapseState[groupKey] = !this.isGroupCollapsed(groupKey);
  }

  clearCommunityFilters(): void {
    this.communitySearch = '';
    this.showJoinedOnly = false;
  }

  trackByCommunityId(_index: number, community: Community): number {
    return community.id;
  }

  trackByPostId(_index: number, post: Post): number {
    return post.id;
  }

  onTrendingSortChange(sort: 'HOT' | 'NEW' | 'TOP' | 'CONTROVERSIAL'): void {
    if (this.trendingSort === sort) return;
    this.trendingSort = sort;
    this.loadTrendingPosts();
  }

  onPostVote(post: Post, value: 1 | -1): void {
    const userId = this.userId;
    if (!userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const previousVote = post.userVote ?? null;
    const previousScore = post.voteScore;

    if (previousVote === value) {
      post.userVote = null;
      post.voteScore -= value;
      this.postService.removeVote(post.id, 'POST', userId).subscribe({
        error: () => this.restorePostVote(post, previousVote, previousScore)
      });
      return;
    }

    post.userVote = value;
    post.voteScore += value - (previousVote ?? 0);
    this.postService.vote(post.id, 'POST', value, userId).subscribe({
      error: () => this.restorePostVote(post, previousVote, previousScore)
    });
  }

  bannerFallbackColor(community: Community): string {
    const seed = `${community.id}|${community.slug}|${community.name}`;
    return this.pickBannerColor(seed);
  }

  communityActivityLabel(community: Community): string {
    if (community.userRole) {
      return 'Already part of your workspace';
    }

    if (community.memberCount >= 80) {
      return 'Busy every day';
    }

    if (community.memberCount >= 30) {
      return 'Growing conversations';
    }

    return 'Smaller focused group';
  }

  communityActivityTone(community: Community): string {
    if (community.userRole) {
      return 'community-card-activity-member';
    }

    if (community.memberCount >= 80) {
      return 'community-card-activity-busy';
    }

    if (community.memberCount >= 30) {
      return 'community-card-activity-growing';
    }

    return 'community-card-activity-quiet';
  }

  private pickBannerColor(seed: string): string {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }

    const index = Math.abs(hash) % this.bannerPalette.length;
    return this.bannerPalette[index];
  }

  private restorePostVote(post: Post, previousVote: 1 | -1 | null, previousScore: number): void {
    post.userVote = previousVote;
    post.voteScore = previousScore;
  }

  private loadTrendingPosts(): void {
    this.loadingTrending = true;
    this.postService.getTrending(undefined, this.trendingSort, this.userId).subscribe({
      next: (posts) => {
        this.trendingPosts = posts;
        this.loadingTrending = false;
      },
      error: () => {
        this.loadTrendingPostsFallback();
      }
    });
  }

  private loadTrendingPostsFallback(): void {
    if (!this.communities.length) {
      this.trendingPosts = [];
      this.loadingTrending = false;
      return;
    }

    const seedCommunities = this.communities.slice(0, 8);
    const requests = seedCommunities.map((community) =>
      this.postService.getPosts(community.id, this.trendingSort, undefined, undefined, this.userId).pipe(
        map((posts) => posts.slice(0, 4)),
        catchError(() => of([] as Post[]))
      )
    );

    forkJoin(requests).subscribe({
      next: (groups) => {
        this.trendingPosts = groups
          .flat()
          .sort((a, b) => {
            if (b.voteScore !== a.voteScore) return b.voteScore - a.voteScore;
            if (b.commentCount !== a.commentCount) return (b.commentCount ?? 0) - (a.commentCount ?? 0);
            return b.viewCount - a.viewCount;
          });
        this.loadingTrending = false;
      },
      error: () => {
        this.trendingPosts = [];
        this.loadingTrending = false;
      }
    });
  }
}
