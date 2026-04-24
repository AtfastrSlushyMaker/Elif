import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { CommunityService } from '../../front-office/community/services/community.service';
import { Community, CommunityMember, CommunityRule, Flair } from '../../front-office/community/models/community.model';
import { Post } from '../../front-office/community/models/post.model';
import { PostService } from '../../front-office/community/services/post.service';
import { CommentService } from '../../front-office/community/services/comment.service';
import { Comment } from '../../front-office/community/models/comment.model';
import { AdminUser, AdminUserService } from '../services/admin-user.service';
import { AdminExportService } from '../services/admin-export.service';

interface FlattenedCommunityComment {
  postTitle: string;
  author: string;
  content: string;
  depth: number;
  voteScore: number;
  accepted: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-back-office-community',
  templateUrl: './community.component.html',
  styleUrl: './community.component.css'
})
export class CommunityComponent implements OnInit {
  // --- Edit form error state ---
  editTouched: Record<'name' | 'description', boolean> = { name: false, description: false };
  private readonly bannerPalette = ['#A7E1D8', '#FCD6A0', '#F9B3B9', '#B7D7F7', '#CBB8F4', '#BFE8C3', '#F7D5E6', '#F6E6A8'];
  private readonly currentUserId?: number;
  readonly bannerInputId = 'bo-community-banner-upload';
  readonly iconInputId = 'bo-community-icon-upload';
  readonly createBannerInputId = 'bo-community-create-banner-upload';
  readonly createIconInputId = 'bo-community-create-icon-upload';
  readonly postImageInputId = 'bo-community-post-image-upload';

  communities: Community[] = [];
  loading = true;
  error = '';
  search = '';
  communitySort: 'NAME_ASC' | 'NAME_DESC' | 'MEMBERS_DESC' | 'MEMBERS_ASC' = 'NAME_ASC';
  exportNotice = '';
  exportingCommunityReport = false;
  creatingCommunity = false;
  showCreateCommunityModal = false;
  createCommunityError = '';
  createCommunitySuccess = '';
  createCommunityStage: 1 | 2 | 3 | 4 = 1;
  createdCommunity?: Community;
  createdRules: CommunityRule[] = [];
  createdFlairs: Flair[] = [];
  creatingCommunityRule = false;
  creatingCommunityFlair = false;
  createRuleError = '';
  createFlairError = '';
  newCreateRuleTitle = '';
  newCreateRuleDescription = '';
  newCreateFlairName = '';
  newCreateFlairColor = '#3A9282';
  newCreateFlairTextColor = '#FFFFFF';
  newCommunityName = '';
  newCommunityDescription = '';
  newCommunityType: 'PUBLIC' | 'PRIVATE' = 'PUBLIC';
  newCommunityBannerUrl = '';
  newCommunityIconUrl = '';
  createCommunityTouched: Record<'name' | 'description', boolean> = {
    name: false,
    description: false
  };

  selectedCommunity?: Community;
  members: CommunityMember[] = [];
  membersLoading = false;
  membersError = '';
  memberActionError = '';
  memberActionSuccess = '';
  removingMemberId?: number;
  memberSearch = '';
  rules: CommunityRule[] = [];
  flairs: Flair[] = [];
  creatingRule = false;
  creatingFlair = false;
  ruleError = '';
  flairError = '';
  newRuleTitle = '';
  newRuleDescription = '';
  editingRuleId?: number;
  savingRuleId?: number;
  editRuleTitle = '';
  editRuleDescription = '';
  editRuleOrder?: number;
  newFlairName = '';
  newFlairColor = '#3A9282';
  newFlairTextColor = '#FFFFFF';
  editingFlairId?: number;
  savingFlairId?: number;
  editFlairName = '';
  editFlairColor = '#3A9282';
  editFlairTextColor = '#FFFFFF';
  deletingFlairId?: number;

  savingCommunity = false;
  updateError = '';
  updateSuccess = '';
  editName = '';
  editDescription = '';
  editType: 'PUBLIC' | 'PRIVATE' = 'PUBLIC';
  editBannerUrl = '';
  editIconUrl = '';

  // --- Edit form error helpers ---
  touchEditField(field: 'name' | 'description'): void {
    this.editTouched[field] = true;
  }

  editFieldError(field: 'name' | 'description'): string {
    const value = field === 'name' ? this.editName.trim() : this.editDescription.trim();
    if (!value) {
      return field === 'name' ? 'Community name is required.' : 'Community description is required.';
    }
    if (field === 'name' && value.length < 3) {
      return 'Community name must be at least 3 characters.';
    }
    if (field === 'description' && value.length < 20) {
      return 'Description must be at least 20 characters.';
    }
    return '';
  }

  shouldShowEditFieldError(field: 'name' | 'description'): boolean {
    return this.editTouched[field] && !!this.editFieldError(field);
  }

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
  createPostTouched: Record<'title' | 'content', boolean> = {
    title: false,
    content: false
  };

  selectedPost?: Post;
  postDetailLoading = false;
  postActionError = '';
  deletingPostId?: number;
  hardDeletingPostId?: number;
  deletingCommunity = false;
  hardDeletingCommunity = false;
  adminUsers: AdminUser[] = [];
  actingCommunityCreatorId?: number;
  actingPostAuthorId?: number;
  private userNameById = new Map<number, string>();

  constructor(
    private auth: AuthService,
    private communityService: CommunityService,
    private postService: PostService,
    private commentService: CommentService,
    private adminUserService: AdminUserService,
    private adminExportService: AdminExportService,
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
    const filtered = !q
      ? this.communities
      : this.communities.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));

    return [...filtered].sort((a, b) => {
      if (this.communitySort === 'NAME_ASC') {
        return a.name.localeCompare(b.name);
      }

      if (this.communitySort === 'NAME_DESC') {
        return b.name.localeCompare(a.name);
      }

      if (this.communitySort === 'MEMBERS_ASC') {
        return (a.memberCount || 0) - (b.memberCount || 0);
      }

      return (b.memberCount || 0) - (a.memberCount || 0);
    });
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
      m.role.toLowerCase().includes(q)
    );
  }

  get activePostCount(): number {
    return this.posts.filter((post) => !this.isSoftDeleted(post)).length;
  }

  get softDeletedPostCount(): number {
    return this.posts.filter((post) => this.isSoftDeleted(post)).length;
  }

  get publicCommunityCount(): number {
    return this.communities.filter((community) => community.type !== 'PRIVATE').length;
  }

  get privateCommunityCount(): number {
    return this.communities.filter((community) => community.type === 'PRIVATE').length;
  }

  get selectedModeratorCount(): number {
    return this.members.filter((member) => member.role === 'CREATOR' || member.role === 'MODERATOR').length;
  }

  get selectedCommunityHasBranding(): boolean {
    return !!this.selectedCommunity?.bannerUrl || !!this.selectedCommunity?.iconUrl;
  }

  get selectedCommunityReadinessScore(): number {
    let score = 0;

    if (this.selectedCommunityHasBranding) {
      score += 1;
    }

    if (this.rules.length > 0) {
      score += 1;
    }

    if (this.flairs.length > 0) {
      score += 1;
    }

    if (this.selectedModeratorCount > 0) {
      score += 1;
    }

    return score;
  }

  get selectedCommunityReadinessPercent(): number {
    return this.selectedCommunityReadinessScore * 25;
  }

  get selectedCommunityReadinessLabel(): string {
    if (this.selectedCommunityReadinessScore >= 4) {
      return 'Launch-ready';
    }

    if (this.selectedCommunityReadinessScore >= 3) {
      return 'Strong foundation';
    }

    if (this.selectedCommunityReadinessScore >= 2) {
      return 'Needs polish';
    }

    return 'Setup in progress';
  }

  get selectedCommunityInitial(): string {
    return this.labelInitial(this.selectedCommunity?.name, 'C');
  }

  get newCommunityInitial(): string {
    return this.labelInitial(this.newCommunityName, 'C');
  }

  get newCommunityNameLength(): number {
    return this.newCommunityName.trim().length;
  }

  get newCommunityDescriptionLength(): number {
    return this.newCommunityDescription.trim().length;
  }

  get newCommunitySlugPreview(): string {
    const slug = this.newCommunityName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    return slug || 'community-name';
  }

  get newCommunityTypeLabel(): string {
    return this.communityTypeLabel(this.newCommunityType);
  }

  get createStageTitle(): string {
    if (this.createCommunityStage === 1) return 'Basics';
    if (this.createCommunityStage === 2) return 'Rules';
    if (this.createCommunityStage === 3) return 'Flairs';
    return 'Launch';
  }

  get createRuleTitleLength(): number {
    return this.newCreateRuleTitle.trim().length;
  }

  get createFlairNameLength(): number {
    return this.newCreateFlairName.trim().length;
  }

  get manageRuleTitleLength(): number {
    return this.newRuleTitle.trim().length;
  }

  get manageFlairNameLength(): number {
    return this.newFlairName.trim().length;
  }

  get newPostTitleLength(): number {
    return this.newPostTitle.trim().length;
  }

  get newPostContentLength(): number {
    return this.newPostContent.trim().length;
  }

  get newPostTypeLabel(): string {
    return this.postTypeLabel(this.newPostType);
  }

  communityTypeLabel(type?: 'PUBLIC' | 'PRIVATE'): string {
    return type === 'PRIVATE' ? 'Private' : 'Public';
  }

  postTypeLabel(type?: '' | 'DISCUSSION' | 'QUESTION'): string {
    return type === 'QUESTION' ? 'Question' : 'Discussion';
  }

  roleLabel(role?: 'MEMBER' | 'MODERATOR' | 'CREATOR' | null): string {
    if (role === 'CREATOR') {
      return 'Creator';
    }

    if (role === 'MODERATOR') {
      return 'Moderator';
    }

    return 'Member';
  }

  canRemoveMember(member: CommunityMember): boolean {
    return member.role !== 'CREATOR' && member.userId !== this.currentUserId;
  }

  get canCreatePostInSelectedCommunity(): boolean {
    return !!this.selectedCommunity && !!this.currentUserId;
  }

  isSoftDeleted(post: Post): boolean {
    return post.content === '[deleted]';
  }

  communityInitial(community?: Community): string {
    return this.labelInitial(community?.name, 'C');
  }

  memberInitial(name?: string): string {
    return this.labelInitial(name, 'M');
  }

  trackByCommunityId(_: number, community: Community): number {
    return community.id;
  }

  trackByMemberId(_: number, member: CommunityMember): number {
    return member.userId;
  }

  trackByRuleId(_: number, rule: CommunityRule): number {
    return rule.id;
  }

  trackByFlairId(_: number, flair: Flair): number {
    return flair.id;
  }

  trackByPostId(_: number, post: Post): number {
    return post.id;
  }

  trackByAdminUserId(_: number, user: AdminUser): number {
    return user.id;
  }

  loadCommunities(): void {
    const userId = this.auth.getCurrentUser()?.id;
    this.loading = true;
    this.error = '';
    this.communityService.getAll(userId).subscribe({
      next: (data) => {
        this.communities = data;
        this.syncSelectedCommunityFromCollection(data);
        this.loading = false;
      },
      error: (error) => {
        this.error = this.readErrorMessage(error, 'Unable to load communities right now.');
        this.loading = false;
      }
    });
  }

  createCommunityAndContinue(): void {
    if (!this.currentUserId) {
      this.createCommunityError = 'You must be logged in as admin to create communities.';
      return;
    }

    const name = this.newCommunityName.trim();
    const description = this.newCommunityDescription.trim();
    this.touchCreateCommunityField('name');
    this.touchCreateCommunityField('description');
    this.createCommunityError = '';
    this.createCommunitySuccess = '';

    if (this.hasCreateCommunityValidationErrors()) {
      this.createCommunityError = 'Please fix the highlighted community fields.';
      return;
    }

    if (this.createdCommunity) {
      this.createCommunityStage = 2;
      return;
    }

    const bannerUrl = this.newCommunityBannerUrl.trim() || undefined;
    const iconUrl = this.newCommunityIconUrl.trim() || undefined;
    const imageValidationError = this.validateCommunityImageSize(bannerUrl, iconUrl);
    if (imageValidationError) {
      this.createCommunityError = imageValidationError;
      return;
    }

    this.creatingCommunity = true;
    this.communityService.create(
      {
        name,
        description,
        type: this.newCommunityType,
        bannerUrl,
        iconUrl
      },
      this.currentUserId,
      this.actingCommunityCreatorId
    ).subscribe({
      next: (created) => {
        this.createdCommunity = created;
        this.createCommunityStage = 2;
        this.creatingCommunity = false;
      },
      error: (error) => {
        this.createCommunityError = this.readErrorMessage(error, 'Unable to create community right now.');
        this.creatingCommunity = false;
      }
    });
  }

  addCreateRuleAndStay(): void {
    if (!this.createdCommunity || !this.currentUserId) {
      this.createRuleError = 'Create the community first.';
      return;
    }

    const title = this.newCreateRuleTitle.trim();
    const description = this.newCreateRuleDescription.trim();
    if (!title) {
      this.createRuleError = 'Rule title is required.';
      return;
    }

    this.creatingCommunityRule = true;
    this.createRuleError = '';
    const nextRuleOrder = (this.createdRules.reduce((max, rule) => Math.max(max, rule.ruleOrder || 0), 0) || 0) + 1;
    this.communityService.addRule(this.createdCommunity.id, {
      title,
      description,
      ruleOrder: nextRuleOrder
    }, this.currentUserId).subscribe({
      next: (rule) => {
        this.createdRules = [...this.createdRules, rule].sort((a, b) => (a.ruleOrder || 0) - (b.ruleOrder || 0));
        this.newCreateRuleTitle = '';
        this.newCreateRuleDescription = '';
        this.creatingCommunityRule = false;
      },
      error: (error) => {
        this.createRuleError = this.readErrorMessage(error, 'Could not add rule.');
        this.creatingCommunityRule = false;
      }
    });
  }

  addCreateFlairAndStay(): void {
    if (!this.createdCommunity || !this.currentUserId) {
      this.createFlairError = 'Create the community first.';
      return;
    }

    const name = this.newCreateFlairName.trim();
    if (!name) {
      this.createFlairError = 'Flair name is required.';
      return;
    }

    this.creatingCommunityFlair = true;
    this.createFlairError = '';
    this.communityService.addFlair(this.createdCommunity.id, {
      name,
      color: this.newCreateFlairColor,
      textColor: this.newCreateFlairTextColor
    }, this.currentUserId).subscribe({
      next: (flair) => {
        this.createdFlairs = [...this.createdFlairs, flair];
        this.newCreateFlairName = '';
        this.newCreateFlairColor = '#3A9282';
        this.newCreateFlairTextColor = '#FFFFFF';
        this.creatingCommunityFlair = false;
      },
      error: (error) => {
        this.createFlairError = this.readErrorMessage(error, 'Could not add flair.');
        this.creatingCommunityFlair = false;
      }
    });
  }

  nextCreateStage(): void {
    if (this.createCommunityStage === 1) {
      this.createCommunityAndContinue();
      return;
    }

    if (this.createCommunityStage < 4) {
      this.createCommunityStage = (this.createCommunityStage + 1) as 2 | 3 | 4;
    }
  }

  previousCreateStage(): void {
    if (this.createCommunityStage > 1) {
      this.createCommunityStage = (this.createCommunityStage - 1) as 1 | 2 | 3;
    }
  }

  finishCommunitySetup(): void {
    if (!this.createdCommunity) {
      this.createCommunityError = 'Create the community first.';
      return;
    }

    this.createCommunitySuccess = `${this.createdCommunity.name} created successfully.`;
    this.loadCommunities();
    this.selectCommunity(this.createdCommunity);
    this.showCreateCommunityModal = false;
    this.clearCreateCommunityDraft();
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
    this.rules = [];
    this.flairs = [];
    this.ruleError = '';
    this.flairError = '';
    this.newRuleTitle = '';
    this.newRuleDescription = '';
    this.editingRuleId = undefined;
    this.savingRuleId = undefined;
    this.editRuleTitle = '';
    this.editRuleDescription = '';
    this.editRuleOrder = undefined;
    this.newFlairName = '';
    this.newFlairColor = '#3A9282';
    this.newFlairTextColor = '#FFFFFF';
    this.editingFlairId = undefined;
    this.savingFlairId = undefined;
    this.editFlairName = '';
    this.editFlairColor = '#3A9282';
    this.editFlairTextColor = '#FFFFFF';
    this.syncEditForm(community);
    this.loadMembers();
    this.loadRules();
    this.loadFlairs();
    this.loadPosts();
  }

  refreshSelectedWorkspace(): void {
    this.loadCommunities();

    if (!this.selectedCommunity) {
      return;
    }

    this.loadMembers();
    this.loadRules();
    this.loadFlairs();
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
     this.editTouched = { name: false, description: false };
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

  onCreateCommunityImagePicked(event: Event, target: 'bannerUrl' | 'iconUrl'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : '';
      if (!value) return;

      if (target === 'bannerUrl') {
        this.newCommunityBannerUrl = value;
      } else {
        this.newCommunityIconUrl = value;
      }
    };
    reader.readAsDataURL(file);

    input.value = '';
  }

  clearCreateCommunityImage(target: 'bannerUrl' | 'iconUrl'): void {
    if (target === 'bannerUrl') {
      this.newCommunityBannerUrl = '';
      return;
    }

    this.newCommunityIconUrl = '';
  }

  onCreatePostImagePicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const value = typeof reader.result === 'string' ? reader.result : '';
      if (!value) return;
      this.newPostImageUrl = value;
    };
    reader.readAsDataURL(file);

    input.value = '';
  }

  clearCreatePostImage(): void {
    this.newPostImageUrl = '';
  }

  loadRules(): void {
    if (!this.selectedCommunity) {
      this.rules = [];
      return;
    }

    this.communityService.getRules(this.selectedCommunity.id).subscribe({
      next: (rules) => {
        this.rules = [...rules].sort((a, b) => (a.ruleOrder || 0) - (b.ruleOrder || 0));
      },
      error: () => {
        this.rules = [];
      }
    });
  }

  loadFlairs(): void {
    if (!this.selectedCommunity) {
      this.flairs = [];
      return;
    }

    this.communityService.getFlairs(this.selectedCommunity.id).subscribe({
      next: (flairs) => {
        this.flairs = flairs;
      },
      error: () => {
        this.flairs = [];
      }
    });
  }

  createRule(): void {
    if (!this.selectedCommunity || !this.currentUserId) {
      this.ruleError = 'Select a community first.';
      return;
    }

    const title = this.newRuleTitle.trim();
    const description = this.newRuleDescription.trim();
    if (!title) {
      this.ruleError = 'Rule title is required.';
      return;
    }

    this.creatingRule = true;
    this.ruleError = '';
    const nextRuleOrder = (this.rules.reduce((max, rule) => Math.max(max, rule.ruleOrder || 0), 0) || 0) + 1;
    this.communityService.addRule(this.selectedCommunity.id, {
      title,
      description,
      ruleOrder: nextRuleOrder
    }, this.currentUserId).subscribe({
      next: (rule) => {
        this.rules = [...this.rules, rule].sort((a, b) => (a.ruleOrder || 0) - (b.ruleOrder || 0));
        this.newRuleTitle = '';
        this.newRuleDescription = '';
        this.creatingRule = false;
      },
      error: (error) => {
        this.ruleError = this.readErrorMessage(error, 'Could not create rule.');
        this.creatingRule = false;
      }
    });
  }

  startEditRule(rule: CommunityRule): void {
    this.editingRuleId = rule.id;
    this.editRuleTitle = (rule.title || '').trim();
    this.editRuleDescription = (rule.description || '').trim();
    this.editRuleOrder = Number.isFinite(rule.ruleOrder) ? rule.ruleOrder : undefined;
    this.ruleError = '';
  }

  cancelEditRule(): void {
    this.editingRuleId = undefined;
    this.savingRuleId = undefined;
    this.editRuleTitle = '';
    this.editRuleDescription = '';
    this.editRuleOrder = undefined;
  }

  saveRule(rule: CommunityRule): void {
    if (!this.selectedCommunity || !this.currentUserId) {
      this.ruleError = 'Select a community first.';
      return;
    }

    const title = this.editRuleTitle.trim();
    if (!title) {
      this.ruleError = 'Rule title is required.';
      return;
    }

    let ruleOrder = Number(this.editRuleOrder);
    if (!Number.isFinite(ruleOrder) || ruleOrder < 0) {
      ruleOrder = rule.ruleOrder || 0;
    }

    this.savingRuleId = rule.id;
    this.ruleError = '';
    this.communityService.updateRule(this.selectedCommunity.id, rule.id, {
      title,
      description: this.editRuleDescription.trim(),
      ruleOrder
    }, this.currentUserId).subscribe({
      next: (updatedRule) => {
        this.rules = this.rules
          .map((item) => item.id === rule.id ? updatedRule : item)
          .sort((a, b) => (a.ruleOrder || 0) - (b.ruleOrder || 0));
        this.cancelEditRule();
      },
      error: (error) => {
        this.ruleError = this.readErrorMessage(error, 'Could not update rule.');
        this.savingRuleId = undefined;
      }
    });
  }

  createFlair(): void {
    if (!this.selectedCommunity || !this.currentUserId) {
      this.flairError = 'Select a community first.';
      return;
    }

    const name = this.newFlairName.trim();
    if (!name) {
      this.flairError = 'Flair name is required.';
      return;
    }

    this.creatingFlair = true;
    this.flairError = '';
    this.communityService.addFlair(this.selectedCommunity.id, {
      name,
      color: this.newFlairColor,
      textColor: this.newFlairTextColor
    }, this.currentUserId).subscribe({
      next: (flair) => {
        this.flairs = [...this.flairs, flair];
        this.newFlairName = '';
        this.newFlairColor = '#3A9282';
        this.newFlairTextColor = '#FFFFFF';
        this.creatingFlair = false;
      },
      error: (error) => {
        this.flairError = this.readErrorMessage(error, 'Could not create flair.');
        this.creatingFlair = false;
      }
    });
  }

  startEditFlair(flair: Flair): void {
    this.editingFlairId = flair.id;
    this.editFlairName = (flair.name || '').trim();
    this.editFlairColor = (flair.color || '#3A9282').trim();
    this.editFlairTextColor = (flair.textColor || '#FFFFFF').trim();
    this.flairError = '';
  }

  cancelEditFlair(): void {
    this.editingFlairId = undefined;
    this.savingFlairId = undefined;
    this.editFlairName = '';
    this.editFlairColor = '#3A9282';
    this.editFlairTextColor = '#FFFFFF';
  }

  saveFlair(flair: Flair): void {
    if (!this.selectedCommunity || !this.currentUserId) {
      this.flairError = 'Select a community first.';
      return;
    }

    const name = this.editFlairName.trim();
    if (!name) {
      this.flairError = 'Flair name is required.';
      return;
    }

    this.savingFlairId = flair.id;
    this.flairError = '';
    this.communityService.updateFlair(this.selectedCommunity.id, flair.id, {
      name,
      color: this.editFlairColor,
      textColor: this.editFlairTextColor
    }, this.currentUserId).subscribe({
      next: (updatedFlair) => {
        this.flairs = this.flairs.map((item) => item.id === flair.id ? updatedFlair : item);
        this.cancelEditFlair();
      },
      error: (error) => {
        this.flairError = this.readErrorMessage(error, 'Could not update flair.');
        this.savingFlairId = undefined;
      }
    });
  }

  deleteFlair(flair: Flair): void {
    if (!this.selectedCommunity || !this.currentUserId) {
      this.flairError = 'Select a community first.';
      return;
    }

    this.deletingFlairId = flair.id;
    this.flairError = '';
    this.communityService.deleteFlair(this.selectedCommunity.id, flair.id, this.currentUserId).subscribe({
      next: () => {
        this.flairs = this.flairs.filter((f) => f.id !== flair.id);
        this.deletingFlairId = undefined;
      },
      error: (error) => {
        this.flairError = this.readErrorMessage(error, 'Could not delete flair.');
        this.deletingFlairId = undefined;
      }
    });
  }

  deleteRule(rule: CommunityRule): void {
    if (!this.selectedCommunity || !this.currentUserId) {
      this.ruleError = 'Select a community first.';
      return;
    }

    if (!confirm(`Delete rule "${rule.title}"?`)) return;

    this.ruleError = '';
    this.communityService.deleteRule(this.selectedCommunity.id, rule.id, this.currentUserId).subscribe({
      next: () => {
        this.rules = this.rules.filter((item) => item.id !== rule.id);
      },
      error: (error) => {
        this.ruleError = this.readErrorMessage(error, 'Could not delete rule.');
      }
    });
  }

  loadMembers(): void {
    if (!this.selectedCommunity || !this.currentUserId) {
      this.members = [];
      this.membersLoading = false;
      return;
    }

    this.membersLoading = true;
    this.membersError = '';
    this.communityService.getMembers(this.selectedCommunity.id, this.currentUserId).subscribe({
      next: (data) => {
        this.members = data;
        this.membersLoading = false;
      },
      error: (error) => {
        this.membersError = this.readErrorMessage(error, 'Unable to load members. Your account may not be part of this community yet.');
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
      error: (error) => {
        this.memberActionError = this.readErrorMessage(error, 'Remove failed. You need moderator/admin rights and cannot remove the creator.');
        this.removingMemberId = undefined;
      }
    });
  }

  exportCommunitiesToExcel(): void {
    const rows = this.filteredCommunities.map((community) => [
      community.name,
      `c/${community.slug}`,
      this.communityTypeLabel(community.type),
      community.memberCount,
      this.roleLabel(community.userRole),
      this.formatDate(community.createdAt),
      this.oneLine(community.description)
    ]);

    if (!rows.length) {
      this.exportNotice = 'No communities available to export.';
      return;
    }

    this.adminExportService.exportExcel(
      `community-directory-${this.timestampForFilename()}`,
      ['Name', 'Slug', 'Type', 'Members', 'Your Role', 'Created', 'Description'],
      rows
    );
    this.exportNotice = 'Community directory exported to Excel.';
  }

  exportCommunitiesToPdf(): void {
    const rows = this.filteredCommunities.map((community) => [
      community.name,
      `c/${community.slug}`,
      this.communityTypeLabel(community.type),
      community.memberCount,
      this.roleLabel(community.userRole),
      this.formatDate(community.createdAt)
    ]);

    if (!rows.length) {
      this.exportNotice = 'No communities available to export.';
      return;
    }

    this.adminExportService.exportPdf(
      'Community Directory Export',
      ['Name', 'Slug', 'Type', 'Members', 'Your Role', 'Created'],
      rows,
      `Sorted by ${this.communitySort.replace('_', ' ')}`
    );
    this.exportNotice = 'Community directory exported to PDF.';
  }

  exportPostsToExcel(): void {
    if (!this.selectedCommunity) {
      this.exportNotice = 'Select a community to export posts.';
      return;
    }

    const rows = this.filteredPosts.map((post) => [
      post.title,
      this.isSoftDeleted(post) ? 'Soft deleted' : 'Active',
      this.postTypeLabel(post.type),
      this.getAuthorName(post.userId),
      post.voteScore,
      post.viewCount,
      post.commentCount || 0,
      this.formatDate(post.createdAt),
      this.oneLine(post.content || '')
    ]);

    if (!rows.length) {
      this.exportNotice = 'No posts available to export.';
      return;
    }

    this.adminExportService.exportExcel(
      `${this.filenameSafe(this.selectedCommunity.name)}-post-moderation-${this.timestampForFilename()}`,
      ['Title', 'Status', 'Type', 'Author', 'Score', 'Views', 'Comments', 'Created', 'Content Preview'],
      rows
    );
    this.exportNotice = 'Post moderation list exported to Excel.';
  }

  exportPostsToPdf(): void {
    if (!this.selectedCommunity) {
      this.exportNotice = 'Select a community to export posts.';
      return;
    }

    const rows = this.filteredPosts.map((post) => [
      post.title,
      this.isSoftDeleted(post) ? 'Soft deleted' : 'Active',
      this.postTypeLabel(post.type),
      this.getAuthorName(post.userId),
      post.voteScore,
      post.viewCount,
      post.commentCount || 0,
      this.formatDate(post.createdAt)
    ]);

    if (!rows.length) {
      this.exportNotice = 'No posts available to export.';
      return;
    }

    this.adminExportService.exportPdf(
      `${this.selectedCommunity.name} Post Moderation Export`,
      ['Title', 'Status', 'Type', 'Author', 'Score', 'Views', 'Comments', 'Created'],
      rows,
      `Sort: ${this.sort} | Type: ${this.postType || 'ALL'} | Search: ${this.postSearch.trim() || 'none'}`
    );
    this.exportNotice = 'Post moderation list exported to PDF.';
  }

  exportSelectedCommunityFullPdf(): void {
    const community = this.selectedCommunity;
    if (!community) {
      this.exportNotice = 'Select a community to export a full report.';
      return;
    }

    if (this.exportingCommunityReport) {
      return;
    }

    this.exportingCommunityReport = true;
    this.exportNotice = 'Preparing full community PDF report...';
    const actorId = this.currentUserId;

    forkJoin({
      posts: this.postService
        .getPosts(community.id, 'NEW', 'ALL', undefined, undefined, this.currentUserId)
        .pipe(catchError(() => of([] as Post[]))),
      members: actorId
        ? this.communityService
          .getMembers(community.id, actorId)
          .pipe(catchError(() => of([] as CommunityMember[])))
        : of([] as CommunityMember[]),
      rules: this.communityService
        .getRules(community.id)
        .pipe(catchError(() => of([] as CommunityRule[]))),
      flairs: this.communityService
        .getFlairs(community.id)
        .pipe(catchError(() => of([] as Flair[])))
    }).pipe(
      switchMap((payload) => {
        const commentRequests = payload.posts.map((post) =>
          this.commentService.getTree(post.id, this.currentUserId).pipe(
            catchError(() => of([] as Comment[])),
            map((comments) => ({
              post,
              comments: this.flattenComments(comments, post.title)
            }))
          )
        );

        return (commentRequests.length
          ? forkJoin(commentRequests)
          : of([] as Array<{ post: Post; comments: FlattenedCommunityComment[] }>))
          .pipe(map((commentsByPost) => ({ payload, commentsByPost })));
      })
    ).subscribe({
      next: ({ payload, commentsByPost }) => {
        const allComments = commentsByPost.flatMap((group) => group.comments);
        const reportTitle = `${community.name} Community Dossier`;

        this.adminExportService.exportStyledReport({
          title: reportTitle,
          subtitle: 'Comprehensive moderation export containing summary, members, rules, flairs, posts, and comments.',
          fileBaseName: `${this.filenameSafe(community.name)}-community-dossier-${this.timestampForFilename()}`,
          sections: [
            {
              title: 'Community Summary',
              headers: ['Metric', 'Value'],
              rows: [
                ['Community', community.name],
                ['Handle', `c/${community.slug}`],
                ['Type', this.communityTypeLabel(community.type)],
                ['Created', this.formatDate(community.createdAt)],
                ['Members', payload.members.length || community.memberCount || 0],
                ['Rules', payload.rules.length],
                ['Flairs', payload.flairs.length],
                ['Posts', payload.posts.length],
                ['Comments', allComments.length],
                ['Readiness', this.selectedCommunityReadinessLabel]
              ]
            },
            {
              title: 'Members',
              headers: ['Name', 'Role', 'Joined'],
              rows: payload.members
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((member) => [
                  member.name,
                  this.roleLabel(member.role),
                  this.formatDate(member.joinedAt)
                ]),
              note: 'Database identifiers are intentionally omitted from administrative reports.'
            },
            {
              title: 'Rules',
              headers: ['Order', 'Title', 'Description'],
              rows: payload.rules
                .slice()
                .sort((a, b) => (a.ruleOrder || 0) - (b.ruleOrder || 0))
                .map((rule) => [
                  rule.ruleOrder || 0,
                  rule.title,
                  this.oneLine(rule.description || '') || '-'
                ])
            },
            {
              title: 'Flairs',
              headers: ['Name', 'Background', 'Text'],
              rows: payload.flairs.map((flair) => [
                flair.name,
                flair.color || '-',
                flair.textColor || '-'
              ])
            },
            {
              title: 'Posts',
              headers: ['Title', 'Status', 'Type', 'Author', 'Comments', 'Score', 'Views', 'Created'],
              rows: payload.posts.map((post) => [
                post.title,
                this.isSoftDeleted(post) ? 'Soft deleted' : 'Active',
                this.postTypeLabel(post.type),
                this.getAuthorName(post.userId),
                post.commentCount || 0,
                post.voteScore,
                post.viewCount,
                this.formatDate(post.createdAt)
              ])
            },
            {
              title: 'Comments',
              headers: ['Post', 'Author', 'Depth', 'Score', 'Accepted', 'Created', 'Content'],
              rows: allComments.map((comment) => [
                comment.postTitle,
                comment.author,
                comment.depth,
                comment.voteScore,
                comment.accepted ? 'Yes' : 'No',
                this.formatDate(comment.createdAt),
                `${'  '.repeat(Math.min(comment.depth, 4))}${comment.content}`
              ])
            }
          ]
        });

        this.exportNotice = 'Full community PDF report generated successfully.';
        this.exportingCommunityReport = false;
      },
      error: () => {
        this.exportNotice = 'Unable to generate full community PDF report right now.';
        this.exportingCommunityReport = false;
      }
    });
  }

  saveCommunity(): void {
    if (!this.selectedCommunity || !this.currentUserId) {
      this.updateError = 'You must be logged in as an admin to update communities.';
      return;
    }

    if (this.editName.trim().length < 3) {
      this.updateError = 'Community name must be at least 3 characters.';
      return;
    }

    if (this.editDescription.trim().length < 20) {
      this.updateError = 'Community description must be at least 20 characters.';
      return;
    }

    this.savingCommunity = true;
    this.updateError = '';
    this.updateSuccess = '';
    const bannerUrl = this.editBannerUrl.trim() || undefined;
    const iconUrl = this.editIconUrl.trim() || undefined;
    const imageValidationError = this.validateCommunityImageSize(bannerUrl, iconUrl);
    if (imageValidationError) {
      this.updateError = imageValidationError;
      this.savingCommunity = false;
      return;
    }

    this.communityService.update(
      this.selectedCommunity.id,
      {
        name: this.editName.trim(),
        description: this.editDescription.trim(),
        type: this.editType,
        bannerUrl,
        iconUrl
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
      error: (error) => {
        this.updateError = this.readErrorMessage(error, 'Update failed. Ensure your account has moderator/creator permissions.');
        this.savingCommunity = false;
      }
    });
  }

  loadPosts(): void {
    if (!this.selectedCommunity) {
      this.posts = [];
      this.selectedPost = undefined;
      this.postsLoading = false;
      return;
    }

    this.postsLoading = true;
    this.postsError = '';
    this.postService
      .getPosts(this.selectedCommunity.id, this.sort, 'ALL', undefined, this.postType || undefined, this.currentUserId)
      .subscribe({
        next: (data) => {
          this.posts = data;
          this.postsLoading = false;
        },
        error: (error) => {
          this.postsError = this.readErrorMessage(error, 'Unable to load posts for this community.');
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
    this.touchCreatePostField('title');
    this.touchCreatePostField('content');
    this.createPostError = '';
    this.createPostSuccess = '';

    if (this.hasCreatePostValidationErrors()) {
      this.createPostError = 'Please fix the highlighted post fields.';
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
      this.currentUserId,
      this.actingPostAuthorId
    ).subscribe({
      next: (created) => {
        this.createPostSuccess = 'Post created successfully.';
        this.clearCreatePostDraft();
        this.loadPosts();
        this.openPostDetails(created);
        this.showCreatePostModal = false;
        this.creatingPost = false;
      },
      error: (error) => {
        this.createPostError = this.readErrorMessage(error, 'Unable to create post for this community.');
        this.creatingPost = false;
      }
    });
  }

  openPostDetails(post: Post): void {
    this.selectedPost = post;
    this.postDetailLoading = true;
    this.postActionError = '';

    this.postService.getPost(post.id, this.currentUserId).subscribe({
      next: (detail) => {
        this.selectedPost = detail;
        this.postDetailLoading = false;
      },
      error: (error) => {
        this.postActionError = this.readErrorMessage(error, 'Unable to load post details.');
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
      error: (error) => {
        this.postActionError = this.readErrorMessage(error, 'Delete failed. Ensure your account has moderator access for this community.');
        this.deletingPostId = undefined;
      }
    });
  }

  hardDeletePost(post: Post): void {
    if (!this.currentUserId) {
      this.postActionError = 'You must be logged in to delete posts.';
      return;
    }

    if (!confirm(`Hard delete post "${post.title}" permanently? This cannot be undone.`)) return;

    this.hardDeletingPostId = post.id;
    this.postActionError = '';
    this.postService.hardDelete(post.id, this.currentUserId).subscribe({
      next: () => {
        this.posts = this.posts.filter((item) => item.id !== post.id);
        if (this.selectedPost?.id === post.id) {
          this.selectedPost = undefined;
        }
        this.hardDeletingPostId = undefined;
      },
      error: (error) => {
        this.postActionError = this.readErrorMessage(error, 'Hard delete failed. Admin rights are required.');
        this.hardDeletingPostId = undefined;
      }
    });
  }

  softDeleteSelectedCommunity(): void {
    if (!this.selectedCommunity || !this.currentUserId) {
      this.updateError = 'Select a community first.';
      return;
    }

    if (!confirm(`Archive community "${this.selectedCommunity.name}" and soft-delete active posts?`)) return;

    this.deletingCommunity = true;
    this.updateError = '';
    this.communityService.softDelete(this.selectedCommunity.id, this.currentUserId).subscribe({
      next: () => {
        this.deletingCommunity = false;
        this.updateSuccess = 'Community archived and posts soft-deleted.';
        this.loadCommunities();
        this.loadPosts();
      },
      error: (error) => {
        this.updateError = this.readErrorMessage(error, 'Community soft delete failed.');
        this.deletingCommunity = false;
      }
    });
  }

  hardDeleteSelectedCommunity(): void {
    if (!this.selectedCommunity || !this.currentUserId) {
      this.updateError = 'Select a community first.';
      return;
    }

    if (!confirm(`Hard delete community "${this.selectedCommunity.name}" permanently? This removes posts, comments, votes, rules, and flairs.`)) return;

    const deletedCommunityId = this.selectedCommunity.id;
    this.hardDeletingCommunity = true;
    this.updateError = '';
    this.communityService.hardDelete(deletedCommunityId, this.currentUserId).subscribe({
      next: () => {
        this.communities = this.communities.filter((community) => community.id !== deletedCommunityId);
        this.selectedCommunity = undefined;
        this.selectedPost = undefined;
        this.posts = [];
        this.members = [];
        this.rules = [];
        this.flairs = [];
        this.hardDeletingCommunity = false;
        this.updateSuccess = 'Community permanently deleted.';
      },
      error: (error) => {
        this.updateError = this.readErrorMessage(error, 'Community hard delete failed. Admin rights are required.');
        this.hardDeletingCommunity = false;
      }
    });
  }

  openCommunity(community: Community): void {
    this.router.navigate(['/app/community/c', community.slug]);
  }

  openCreateCommunityModal(): void {
    this.clearCreateCommunityDraft();
    this.createCommunityError = '';
    this.createCommunityStage = 1;
    this.actingCommunityCreatorId = this.currentUserId;
    this.showCreateCommunityModal = true;
  }

  closeCreateCommunityModal(): void {
    if (this.creatingCommunity || this.creatingCommunityRule || this.creatingCommunityFlair) return;
    this.showCreateCommunityModal = false;
  }

  openCreatePostModal(): void {
    if (!this.selectedCommunity) {
      this.createPostError = 'Select a community first to create posts.';
      return;
    }
    this.clearCreatePostDraft();
    this.createPostError = '';
    this.actingPostAuthorId = this.currentUserId;
    this.showCreatePostModal = true;
  }

  closeCreatePostModal(): void {
    if (this.creatingPost) return;
    this.showCreatePostModal = false;
  }

  private loadUserDirectory(): void {
    this.adminUserService.findAll().subscribe({
      next: (users) => {
        this.adminUsers = users;
        if (!this.actingCommunityCreatorId) {
          this.actingCommunityCreatorId = this.currentUserId;
        }
        if (!this.actingPostAuthorId) {
          this.actingPostAuthorId = this.currentUserId;
        }
        this.userNameById = new Map(
          users.map((u) => [u.id, `${u.firstName} ${u.lastName}`.trim()])
        );
      },
      error: () => {
        this.adminUsers = [];
        this.userNameById = new Map();
      }
    });
  }

  touchCreateCommunityField(field: 'name' | 'description'): void {
    this.createCommunityTouched[field] = true;
  }

  createCommunityFieldError(field: 'name' | 'description'): string {
    const value = field === 'name'
      ? this.newCommunityName.trim()
      : this.newCommunityDescription.trim();

    if (!value) {
      return field === 'name'
        ? 'Community name is required.'
        : 'Community description is required.';
    }

    if (field === 'name' && value.length < 3) {
      return 'Community name must be at least 3 characters.';
    }

    if (field === 'description' && value.length < 20) {
      return 'Description must be at least 20 characters.';
    }

    return '';
  }

  shouldShowCreateCommunityFieldError(field: 'name' | 'description'): boolean {
    return this.createCommunityTouched[field] && !!this.createCommunityFieldError(field);
  }

  touchCreatePostField(field: 'title' | 'content'): void {
    this.createPostTouched[field] = true;
  }

  createPostFieldError(field: 'title' | 'content'): string {
    const value = field === 'title'
      ? this.newPostTitle.trim()
      : this.newPostContent.trim();

    if (!value) {
      return field === 'title'
        ? 'Post title is required.'
        : 'Post content is required.';
    }

    if (field === 'title' && value.length < 6) {
      return 'Post title must be at least 6 characters.';
    }

    if (field === 'content' && value.length < 20) {
      return 'Post content must be at least 20 characters.';
    }

    return '';
  }

  shouldShowCreatePostFieldError(field: 'title' | 'content'): boolean {
    return this.createPostTouched[field] && !!this.createPostFieldError(field);
  }

  private hasCreateCommunityValidationErrors(): boolean {
    return !!this.createCommunityFieldError('name') || !!this.createCommunityFieldError('description');
  }

  private hasCreatePostValidationErrors(): boolean {
    return !!this.createPostFieldError('title') || !!this.createPostFieldError('content');
  }

  private resetCreateCommunityFormState(): void {
    this.createCommunityTouched = { name: false, description: false };
  }

  private resetCreatePostFormState(): void {
    this.createPostTouched = { title: false, content: false };
  }

  private clearCreateCommunityDraft(): void {
    this.createCommunityStage = 1;
    this.createdCommunity = undefined;
    this.createdRules = [];
    this.createdFlairs = [];
    this.creatingCommunityRule = false;
    this.creatingCommunityFlair = false;
    this.createRuleError = '';
    this.createFlairError = '';
    this.newCreateRuleTitle = '';
    this.newCreateRuleDescription = '';
    this.newCreateFlairName = '';
    this.newCreateFlairColor = '#3A9282';
    this.newCreateFlairTextColor = '#FFFFFF';
    this.newCommunityName = '';
    this.newCommunityDescription = '';
    this.newCommunityType = 'PUBLIC';
    this.newCommunityBannerUrl = '';
    this.newCommunityIconUrl = '';
    this.actingCommunityCreatorId = this.currentUserId;
    this.resetCreateCommunityFormState();
  }

  private clearCreatePostDraft(): void {
    this.newPostTitle = '';
    this.newPostContent = '';
    this.newPostType = 'DISCUSSION';
    this.newPostImageUrl = '';
    this.actingPostAuthorId = this.currentUserId;
    this.resetCreatePostFormState();
  }

  private labelInitial(value?: string, fallback = 'C'): string {
    return value?.trim().charAt(0).toUpperCase() || fallback;
  }

  private formatDate(value?: string): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  }

  private oneLine(value: string): string {
    return value.replace(/\s+/g, ' ').trim();
  }

  private flattenComments(
    comments: Comment[],
    postTitle: string,
    depth = 0
  ): FlattenedCommunityComment[] {
    const flattened: FlattenedCommunityComment[] = [];

    comments.forEach((comment) => {
      flattened.push({
        postTitle,
        author: (comment.authorName || this.getAuthorName(comment.userId) || 'Unknown user').trim(),
        content: this.oneLine(comment.content || ''),
        depth,
        voteScore: comment.voteScore || 0,
        accepted: !!comment.acceptedAnswer,
        createdAt: comment.createdAt
      });

      if (comment.replies?.length) {
        flattened.push(...this.flattenComments(comment.replies, postTitle, depth + 1));
      }
    });

    return flattened;
  }

  private timestampForFilename(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private filenameSafe(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'community';
  }

  private syncSelectedCommunityFromCollection(communities: Community[]): void {
    if (!this.selectedCommunity) {
      return;
    }

    const refreshedCommunity = communities.find((community) => community.id === this.selectedCommunity?.id);
    if (!refreshedCommunity) {
      this.clearSelectedCommunityWorkspace();
      return;
    }

    this.selectedCommunity = refreshedCommunity;
    this.syncEditForm(refreshedCommunity);
  }

  private clearSelectedCommunityWorkspace(): void {
    this.selectedCommunity = undefined;
    this.selectedPost = undefined;
    this.members = [];
    this.rules = [];
    this.flairs = [];
    this.posts = [];
    this.memberSearch = '';
    this.postSearch = '';
    this.membersError = '';
    this.memberActionError = '';
    this.memberActionSuccess = '';
    this.ruleError = '';
    this.flairError = '';
    this.postsError = '';
    this.postActionError = '';
  }

  private readErrorMessage(error: unknown, fallback: string): string {
    const message = (error as { error?: { error?: string } })?.error?.error;
    return typeof message === 'string' && message.trim().length > 0 ? message : fallback;
  }

  private validateCommunityImageSize(bannerUrl?: string, iconUrl?: string): string | undefined {
    if (this.isTooLargeImagePayload(bannerUrl) || this.isTooLargeImagePayload(iconUrl)) {
      return 'Image payload is too large. Please upload a smaller image.';
    }

    return undefined;
  }

  private isTooLargeImagePayload(value?: string): boolean {
    return !!value && value.length > 1_500_000;
  }

  previewBannerColor(seedValue?: string): string {
    const seed = (seedValue || this.newCommunityName || 'community').trim();
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }

    const index = Math.abs(hash) % this.bannerPalette.length;
    return this.bannerPalette[index];
  }
}
