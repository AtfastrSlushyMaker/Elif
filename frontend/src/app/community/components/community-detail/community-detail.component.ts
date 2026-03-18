import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Community, CommunityMember, Flair } from '../../models/community.model';
import { Post } from '../../models/post.model';
import { CommunityService } from '../../services/community.service';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../../auth/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-community-detail',
  templateUrl: './community-detail.component.html',
  styleUrl: './community-detail.component.css'
})
export class CommunityDetailComponent implements OnInit {
  private readonly bannerPalette = ['#A7E1D8', '#FCD6A0', '#F9B3B9', '#B7D7F7', '#CBB8F4', '#BFE8C3', '#F7D5E6', '#F6E6A8'];
  readonly editBannerInputId = 'community-edit-banner-upload';
  readonly editIconInputId = 'community-edit-icon-upload';

  community?: Community;
  members: CommunityMember[] = [];
  memberSearch = '';
  posts: Post[] = [];
  flairs: Flair[] = [];
  loading = true;
  error = '';
  membersError = '';
  savingCommunity = false;
  editingCommunity = false;
  managementOpen = false;
  creatingFlair = false;
  deletingFlairId?: number;
  flairError = '';
  newFlairName = '';
  newFlairColor = '#3A9282';
  newFlairTextColor = '#FFFFFF';
  sort: 'HOT' | 'NEW' | 'TOP' | 'CONTROVERSIAL' = 'HOT';
  selectedFlairId?: number;

  get userId(): number | undefined {
    return this.auth.getCurrentUser()?.id;
  }

  get isLoggedIn(): boolean {
    return !!this.userId;
  }

  get canEditCommunity(): boolean {
    const role = this.community?.userRole;
    return role === 'CREATOR' || role === 'MODERATOR';
  }

  get canViewMembers(): boolean {
    return !!this.community?.userRole;
  }

  get filteredMembers(): CommunityMember[] {
    const term = this.memberSearch.trim().toLowerCase();
    if (!term) {
      return this.members;
    }

    return this.members.filter((member) => {
      const name = (member.name || '').toLowerCase();
      const role = (member.role || '').toLowerCase();
      return name.includes(term) || role.includes(term);
    });
  }

  bannerFallbackColor(community: Community): string {
    const seed = `${community.id}|${community.slug}|${community.name}`;
    return this.pickBannerColor(seed);
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

  editForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private communityService: CommunityService,
    private postService: PostService,
    private auth: AuthService,
    private fb: FormBuilder,
    private confirmDialog: ConfirmDialogService
  ) {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      type: ['PUBLIC'],
      bannerUrl: [''],
      iconUrl: ['']
    });
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.error = 'Community not found.';
      this.loading = false;
      return;
    }

    this.communityService.getBySlug(slug, this.userId).subscribe({
      next: (community) => {
        this.community = community;
        this.editForm.patchValue({
          name: community.name,
          description: community.description,
          type: community.type,
          bannerUrl: community.bannerUrl || '',
          iconUrl: community.iconUrl || ''
        });
        this.communityService.getFlairs(community.id).subscribe((flairs) => (this.flairs = flairs));
        if (this.isLoggedIn && community.userRole) {
          this.loadMembers();
        }
        this.loadPosts();
      },
      error: () => {
        this.error = 'Unable to load community.';
        this.loading = false;
      }
    });
  }

  loadPosts(): void {
    if (!this.community) return;
    this.postService.getPosts(this.community.id, this.sort, this.selectedFlairId).subscribe({
      next: (posts) => {
        this.posts = posts;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load posts.';
        this.loading = false;
      }
    });
  }

  onSortChange(mode: 'HOT' | 'NEW' | 'TOP' | 'CONTROVERSIAL'): void {
    this.sort = mode;
    this.loadPosts();
  }

  filterFlair(flairId?: number): void {
    this.selectedFlairId = flairId;
    this.loadPosts();
  }

  join(): void {
    if (!this.community) return;
    if (!this.userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.communityService.join(this.community.id, this.userId).subscribe(() => {
      if (this.community) {
        this.community.memberCount += 1;
        this.community.userRole = 'MEMBER';
      }
      this.managementOpen = true;
      this.loadMembers();
    });
  }

  loadMembers(): void {
    if (!this.community) return;
    const currentUserId = this.userId;
    if (!currentUserId) {
      this.members = [];
      this.membersError = '';
      return;
    }

    this.communityService.getMembers(this.community.id, currentUserId).subscribe({
      next: (members) => {
        this.members = members;
        this.membersError = '';
      },
      error: () => {
        this.membersError = 'Unable to load members.';
      }
    });
  }

  enableEditCommunity(): void {
    this.editingCommunity = true;
  }

  cancelEditCommunity(): void {
    this.editingCommunity = false;
    if (!this.community) return;
    this.editForm.patchValue({
      name: this.community.name,
      description: this.community.description,
      type: this.community.type,
      bannerUrl: this.community.bannerUrl || '',
      iconUrl: this.community.iconUrl || ''
    });
  }

  saveCommunity(): void {
    if (!this.community || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    if (!this.userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.savingCommunity = true;
    this.communityService.update(this.community.id, this.editForm.value, this.userId).subscribe({
      next: (updated) => {
        this.community = updated;
        this.editingCommunity = false;
        this.savingCommunity = false;
      },
      error: () => {
        this.error = 'Unable to update community.';
        this.savingCommunity = false;
      }
    });
  }

  onEditImagePicked(event: Event, target: 'bannerUrl' | 'iconUrl'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : '';
      if (!value) return;
      this.editForm.patchValue({ [target]: value });
    };
    reader.readAsDataURL(file);

    input.value = '';
  }

  clearEditImage(target: 'bannerUrl' | 'iconUrl'): void {
    this.editForm.patchValue({ [target]: '' });
  }

  createFlair(): void {
    if (!this.community || !this.canEditCommunity) return;
    if (!this.userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const name = this.newFlairName.trim();
    if (!name) {
      this.flairError = 'Flair name is required.';
      return;
    }

    this.creatingFlair = true;
    this.flairError = '';
    this.communityService.addFlair(this.community.id, {
      name,
      color: this.newFlairColor,
      textColor: this.newFlairTextColor
    }, this.userId).subscribe({
      next: (flair) => {
        this.flairs = [...this.flairs, flair];
        this.newFlairName = '';
        this.newFlairColor = '#3A9282';
        this.newFlairTextColor = '#FFFFFF';
        this.creatingFlair = false;
      },
      error: () => {
        this.flairError = 'Could not create flair.';
        this.creatingFlair = false;
      }
    });
  }

  deleteFlair(flair: Flair): void {
    if (!this.community || !this.canEditCommunity) return;
    if (!this.userId) {
      this.router.navigate(['/auth/login']);
      return;
    }
    if (!this.confirmDialog.confirmDelete(`flair \"${flair.name}\"`)) {
      return;
    }

    this.deletingFlairId = flair.id;
    this.flairError = '';
    this.communityService.deleteFlair(this.community.id, flair.id, this.userId).subscribe({
      next: () => {
        this.flairs = this.flairs.filter((f) => f.id !== flair.id);
        if (this.selectedFlairId === flair.id) {
          this.selectedFlairId = undefined;
          this.loadPosts();
        }
        this.deletingFlairId = undefined;
      },
      error: () => {
        this.flairError = 'Could not delete flair.';
        this.deletingFlairId = undefined;
      }
    });
  }
}
