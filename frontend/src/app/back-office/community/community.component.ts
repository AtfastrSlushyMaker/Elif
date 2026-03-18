import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CommunityService } from '../../community/services/community.service';
import { Community, CommunityMember } from '../../community/models/community.model';
import { Post } from '../../community/models/post.model';
import { PostService } from '../../community/services/post.service';
import { AdminUserService } from '../services/admin-user.service';

@Component({
  selector: 'app-back-office-community',
  templateUrl: './community.component.html',
  styleUrl: './community.component.css'
})
export class CommunityComponent implements OnInit {
  private readonly currentUserId?: number;
  readonly bannerInputId = 'bo-community-banner-upload';
  readonly iconInputId = 'bo-community-icon-upload';

  communities: Community[] = [];
  loading = true;
  error = '';
  search = '';
  creatingCommunity = false;
  showCreateCommunityModal = false;
  createCommunityError = '';
  createCommunitySuccess = '';
  newCommunityName = '';
  newCommunityDescription = '';
  newCommunityType: 'PUBLIC' | 'PRIVATE' = 'PUBLIC';
  newCommunityBannerUrl = '';
  newCommunityIconUrl = '';

  selectedCommunity?: Community;
  members: CommunityMember[] = [];
  membersLoading = false;
  membersError = '';
  memberActionError = '';
  memberActionSuccess = '';
  removingMemberId?: number;
  memberSearch = '';

  savingCommunity = false;
  updateError = '';
  updateSuccess = '';
  editName = '';
  editDescription = '';
  editType: 'PUBLIC' | 'PRIVATE' = 'PUBLIC';
  editBannerUrl = '';
  editIconUrl = '';

  posts: Post[] = [];
  postsLoading = false;
  postsError = '';
  postSearch = '';
  sort: 'HOT' | 'NEW' | 'TOP' | 'CONTROVERSIAL' = 'NEW';
  postType: '' | 'DISCUSSION' | 'QUESTION' = '';
  creatingPost = false;
  showCreatePostModal = false;
  createPostError = '';
  createPostSuccess = '';
  newPostTitle = '';
  newPostContent = '';
  newPostType: 'DISCUSSION' | 'QUESTION' = 'DISCUSSION';
  newPostImageUrl = '';

  selectedPost?: Post;
  postDetailLoading = false;
  postActionError = '';
  deletingPostId?: number;
  private userNameById = new Map<number, string>();

  constructor(
    private auth: AuthService,
    private communityService: CommunityService,
    private postService: PostService,
    private adminUserService: AdminUserService,
    private router: Router
  ) {
    this.currentUserId = this.auth.getCurrentUser()?.id;
  }

  ngOnInit(): void {
    this.loadUserDirectory();
    this.loadCommunities();
  }

  getAuthorName(userId?: number): string {
    if (!userId) return 'Unknown user';
    return this.userNameById.get(userId) || 'Unknown user';
  }

  openAuthorInUsers(userId?: number): void {
    if (!userId) return;
    this.router.navigate(['/admin/users'], { queryParams: { selectedUserId: userId } });
  }

  get filteredCommunities(): Community[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.communities;
    return this.communities.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
  }

  get filteredPosts(): Post[] {
    const q = this.postSearch.trim().toLowerCase();
    if (!q) return this.posts;
    return this.posts.filter((p) => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
  }

  get filteredMembers(): CommunityMember[] {
    const q = this.memberSearch.trim().toLowerCase();
    if (!q) return this.members;
    return this.members.filter((m) =>
      m.name.toLowerCase().includes(q) ||
      String(m.userId).includes(q) ||
      m.role.toLowerCase().includes(q)
    );
  }

  canRemoveMember(member: CommunityMember): boolean {
    return member.role !== 'CREATOR' && member.userId !== this.currentUserId;
  }

  isSoftDeleted(post: Post): boolean {
    return post.content === '[deleted]';
  }

  loadCommunities(): void {
    const userId = this.auth.getCurrentUser()?.id;
    this.loading = true;
    this.error = '';
    this.communityService.getAll(userId).subscribe({
      next: (data) => {
        this.communities = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load communities right now.';
        this.loading = false;
      }
    });
  }

  createCommunity(): void {
    if (!this.currentUserId) {
      this.createCommunityError = 'You must be logged in as admin to create communities.';
      return;
    }

    const name = this.newCommunityName.trim();
    const description = this.newCommunityDescription.trim();
    this.createCommunityError = '';
    this.createCommunitySuccess = '';

    if (!name || !description) {
      this.createCommunityError = 'Community name and description are required.';
      return;
    }

    if (description.length < 20) {
      this.createCommunityError = 'Description must be at least 20 characters.';
      return;
    }

    this.creatingCommunity = true;
    this.communityService.create(
      {
        name,
        description,
        type: this.newCommunityType,
        bannerUrl: this.newCommunityBannerUrl.trim() || undefined,
        iconUrl: this.newCommunityIconUrl.trim() || undefined
      },
      this.currentUserId
    ).subscribe({
      next: (created) => {
        this.createCommunitySuccess = `${created.name} created successfully.`;
        this.newCommunityName = '';
        this.newCommunityDescription = '';
        this.newCommunityType = 'PUBLIC';
        this.newCommunityBannerUrl = '';
        this.newCommunityIconUrl = '';
        this.loadCommunities();
        this.selectCommunity(created);
        this.showCreateCommunityModal = false;
        this.creatingCommunity = false;
      },
      error: () => {
        this.createCommunityError = 'Unable to create community right now.';
        this.creatingCommunity = false;
      }
    });
  }

  selectCommunity(community: Community): void {
    this.selectedCommunity = community;
    this.selectedPost = undefined;
    this.postActionError = '';
    this.updateError = '';
    this.updateSuccess = '';
    this.membersError = '';
    this.memberActionError = '';
    this.memberActionSuccess = '';
    this.memberSearch = '';
    this.syncEditForm(community);
    this.loadMembers();
    this.loadPosts();
  }

  private syncEditForm(community: Community): void {
    this.editName = community.name;
    this.editDescription = community.description;
    this.editType = community.type;
    this.editBannerUrl = community.bannerUrl || '';
    this.editIconUrl = community.iconUrl || '';
  }

  resetEditForm(): void {
    if (!this.selectedCommunity) return;
    this.syncEditForm(this.selectedCommunity);
    this.updateError = '';
    this.updateSuccess = '';
  }

  onImagePicked(event: Event, target: 'bannerUrl' | 'iconUrl'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : '';
      if (!value) return;

      if (target === 'bannerUrl') {
        this.editBannerUrl = value;
      } else {
        this.editIconUrl = value;
      }
    };
    reader.readAsDataURL(file);

    input.value = '';
  }

  clearImage(target: 'bannerUrl' | 'iconUrl'): void {
    if (target === 'bannerUrl') {
      this.editBannerUrl = '';
      return;
    }
    this.editIconUrl = '';
  }

  loadMembers(): void {
    if (!this.selectedCommunity || !this.currentUserId) {
      this.members = [];
      return;
    }

    this.membersLoading = true;
    this.membersError = '';
    this.communityService.getMembers(this.selectedCommunity.id, this.currentUserId).subscribe({
      next: (data) => {
        this.members = data;
        this.membersLoading = false;
      },
      error: () => {
        this.membersError = 'Unable to load members. Your account may not be part of this community yet.';
        this.membersLoading = false;
      }
    });
  }

  removeMember(member: CommunityMember): void {
    if (!this.selectedCommunity || !this.currentUserId) {
      this.memberActionError = 'You must be logged in as an admin to remove members.';
      return;
    }

    if (!this.canRemoveMember(member)) return;
    if (!confirm(`Remove ${member.name} from this community?`)) return;

    this.removingMemberId = member.userId;
    this.memberActionError = '';
    this.memberActionSuccess = '';

    this.communityService.removeMember(this.selectedCommunity.id, member.userId, this.currentUserId).subscribe({
      next: () => {
        this.members = this.members.filter((m) => m.userId !== member.userId);

        const updatedCount = Math.max(0, (this.selectedCommunity?.memberCount || 0) - 1);
        if (this.selectedCommunity) {
          this.selectedCommunity = { ...this.selectedCommunity, memberCount: updatedCount };
          this.communities = this.communities.map((c) =>
            c.id === this.selectedCommunity?.id ? { ...c, memberCount: updatedCount } : c
          );
        }

        this.memberActionSuccess = `${member.name} removed successfully.`;
        this.removingMemberId = undefined;
      },
      error: () => {
        this.memberActionError = 'Remove failed. You need moderator/admin rights and cannot remove the creator.';
        this.removingMemberId = undefined;
      }
    });
  }

  saveCommunity(): void {
    if (!this.selectedCommunity || !this.currentUserId) {
      this.updateError = 'You must be logged in as an admin to update communities.';
      return;
    }

    this.savingCommunity = true;
    this.updateError = '';
    this.updateSuccess = '';

    this.communityService.update(
      this.selectedCommunity.id,
      {
        name: this.editName.trim(),
        description: this.editDescription.trim(),
        type: this.editType,
        bannerUrl: this.editBannerUrl.trim() || undefined,
        iconUrl: this.editIconUrl.trim() || undefined
      },
      this.currentUserId
    ).subscribe({
      next: (updated) => {
        this.selectedCommunity = updated;
        this.communities = this.communities.map((c) => (c.id === updated.id ? updated : c));
        this.syncEditForm(updated);
        this.updateSuccess = 'Community updated successfully.';
        this.savingCommunity = false;
      },
      error: () => {
        this.updateError = 'Update failed. Ensure your account has moderator/creator permissions.';
        this.savingCommunity = false;
      }
    });
  }

  loadPosts(): void {
    if (!this.selectedCommunity) return;

    this.postsLoading = true;
    this.postsError = '';
    this.postService
      .getPosts(this.selectedCommunity.id, this.sort, undefined, this.postType || undefined)
      .subscribe({
        next: (data) => {
          this.posts = data;
          this.postsLoading = false;
        },
        error: () => {
          this.postsError = 'Unable to load posts for this community.';
          this.postsLoading = false;
        }
      });
  }

  createPost(): void {
    if (!this.selectedCommunity || !this.currentUserId) {
      this.createPostError = 'Select a community first to create a post.';
      return;
    }

    const title = this.newPostTitle.trim();
    const content = this.newPostContent.trim();
    this.createPostError = '';
    this.createPostSuccess = '';

    if (!title || !content) {
      this.createPostError = 'Post title and content are required.';
      return;
    }

    if (title.length < 6 || content.length < 20) {
      this.createPostError = 'Title must be at least 6 chars and content at least 20 chars.';
      return;
    }

    this.creatingPost = true;
    this.postService.create(
      this.selectedCommunity.id,
      {
        title,
        content,
        type: this.newPostType,
        imageUrl: this.newPostImageUrl.trim() || undefined
      },
      this.currentUserId
    ).subscribe({
      next: (created) => {
        this.createPostSuccess = 'Post created successfully.';
        this.newPostTitle = '';
        this.newPostContent = '';
        this.newPostType = 'DISCUSSION';
        this.newPostImageUrl = '';
        this.loadPosts();
        this.openPostDetails(created);
        this.showCreatePostModal = false;
        this.creatingPost = false;
      },
      error: () => {
        this.createPostError = 'Unable to create post for this community.';
        this.creatingPost = false;
      }
    });
  }

  openPostDetails(post: Post): void {
    this.selectedPost = undefined;
    this.postDetailLoading = true;
    this.postActionError = '';

    this.postService.getPost(post.id).subscribe({
      next: (detail) => {
        this.selectedPost = detail;
        this.postDetailLoading = false;
      },
      error: () => {
        this.postActionError = 'Unable to load post details.';
        this.postDetailLoading = false;
      }
    });
  }

  softDeletePost(post: Post): void {
    if (!this.currentUserId) {
      this.postActionError = 'You must be logged in to delete posts.';
      return;
    }

    if (this.isSoftDeleted(post)) return;
    if (!confirm(`Soft delete post "${post.title}"?`)) return;

    this.deletingPostId = post.id;
    this.postActionError = '';
    this.postService.delete(post.id, this.currentUserId).subscribe({
      next: () => {
        this.posts = this.posts.map((item) =>
          item.id === post.id
            ? { ...item, content: '[deleted]', imageUrl: undefined }
            : item
        );

        if (this.selectedPost?.id === post.id) {
          this.selectedPost = { ...this.selectedPost, content: '[deleted]', imageUrl: undefined };
        }

        this.deletingPostId = undefined;
      },
      error: () => {
        this.postActionError = 'Delete failed. Ensure your account has moderator access for this community.';
        this.deletingPostId = undefined;
      }
    });
  }

  openCommunity(community: Community): void {
    this.router.navigate(['/app/community/c', community.slug]);
  }

  openCreateCommunityModal(): void {
    this.createCommunityError = '';
    this.showCreateCommunityModal = true;
  }

  closeCreateCommunityModal(): void {
    if (this.creatingCommunity) return;
    this.showCreateCommunityModal = false;
  }

  openCreatePostModal(): void {
    if (!this.selectedCommunity) {
      this.createPostError = 'Select a community first to create posts.';
      return;
    }
    this.createPostError = '';
    this.showCreatePostModal = true;
  }

  closeCreatePostModal(): void {
    if (this.creatingPost) return;
    this.showCreatePostModal = false;
  }

  private loadUserDirectory(): void {
    this.adminUserService.findAll().subscribe({
      next: (users) => {
        this.userNameById = new Map(
          users.map((u) => [u.id, `${u.firstName} ${u.lastName}`.trim()])
        );
      },
      error: () => {
        this.userNameById = new Map();
      }
    });
  }
}
