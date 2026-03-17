import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Community } from '../../models/community.model';
import { Post } from '../../models/post.model';
import { CommunityService } from '../../services/community.service';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-community-list',
  templateUrl: './community-list.component.html',
  styleUrl: './community-list.component.css'
})
export class CommunityListComponent implements OnInit {
  communities: Community[] = [];
  trendingPosts: Post[] = [];
  communitySearch = '';
  trendingSort: 'HOT' | 'NEW' | 'TOP' | 'CONTROVERSIAL' = 'HOT';
  loading = true;
  loadingTrending = true;
  error = '';

  get userId(): number | undefined {
    return this.auth.getCurrentUser()?.id;
  }

  get filteredCommunities(): Community[] {
    const term = this.communitySearch.trim().toLowerCase();
    if (!term) {
      return this.communities;
    }

    return this.communities.filter((community) => {
      const name = community.name.toLowerCase();
      const description = community.description.toLowerCase();
      return name.includes(term) || description.includes(term);
    });
  }

  constructor(
    private communityService: CommunityService,
    private postService: PostService,
    private auth: AuthService
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

  onTrendingSortChange(sort: 'HOT' | 'NEW' | 'TOP' | 'CONTROVERSIAL'): void {
    if (this.trendingSort === sort) return;
    this.trendingSort = sort;
    this.loadTrendingPosts();
  }

  private loadTrendingPosts(): void {
    this.loadingTrending = true;
    this.postService.getTrending(12, this.trendingSort).subscribe({
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
      this.postService.getPosts(community.id, this.trendingSort).pipe(
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
          })
          .slice(0, 12);
        this.loadingTrending = false;
      },
      error: () => {
        this.trendingPosts = [];
        this.loadingTrending = false;
      }
    });
  }
}
