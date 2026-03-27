import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Flair } from '../../models/community.model';
import { CommunityService } from '../../services/community.service';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrl: './post-create.component.css'
})
export class PostCreateComponent implements OnInit {
  communityId = 0;
  communitySlug = '';
  communityName = 'Community';
  communityType: 'PUBLIC' | 'PRIVATE' = 'PUBLIC';
  loadingCommunity = true;
  flairs: Flair[] = [];
  saving = false;
  error = '';
  postImagePreview = '';
  imageInputId = 'post-image-input';

  get userId(): number | undefined {
    return this.auth.getCurrentUser()?.id;
  }

  get titleLength(): number {
    return String(this.form.get('title')?.value || '').length;
  }

  get contentLength(): number {
    return String(this.form.get('content')?.value || '').length;
  }

  get selectedFlair(): Flair | undefined {
    const flairId = this.form.get('flairId')?.value;
    return this.flairs.find((flair) => flair.id === flairId);
  }

  form;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private postService: PostService,
    private communityService: CommunityService,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(6)]],
      content: ['', [Validators.required, Validators.minLength(20)]],
      type: ['DISCUSSION'],
      flairId: [null as number | null],
      imageUrl: ['']
    });
  }

  onImagePicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || '');
      this.form.patchValue({ imageUrl: value });
      this.postImagePreview = value;
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  clearPostImage(): void {
    this.form.patchValue({ imageUrl: '' });
    this.postImagePreview = '';
  }

  ngOnInit(): void {
    if (!this.userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const communityId = Number(this.route.snapshot.queryParamMap.get('communityId'));
    const slug = String(this.route.snapshot.paramMap.get('slug') || '').trim();

    this.communitySlug = slug;
    this.communityId = Number.isFinite(communityId) ? communityId : 0;

    if (slug) {
      this.communityService.getBySlug(slug, this.userId).subscribe({
        next: (community) => {
          this.communityId = this.communityId || community.id;
          this.communityName = community.name;
          this.communityType = community.type;
          this.loadingCommunity = false;
          this.loadFlairs(this.communityId);
        },
        error: (error) => {
          this.error = this.readErrorMessage(error, 'Unable to load the community context.');
          this.loadingCommunity = false;
        }
      });
      return;
    }

    if (this.communityId) {
      this.loadingCommunity = false;
      this.loadFlairs(this.communityId);
      return;
    }

    this.loadingCommunity = false;
    this.error = 'Community context is missing for this post.';
  }

  submit(): void {
    if (this.form.invalid || !this.communityId) {
      this.form.markAllAsTouched();
      return;
    }

    const userId = this.userId;
    if (!userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.saving = true;
    this.error = '';
    const payload: { title: string; content: string; type: 'DISCUSSION' | 'QUESTION'; flairId?: number; imageUrl?: string } = {
      title: this.form.value.title ?? '',
      content: this.form.value.content ?? '',
      type: (this.form.value.type as 'DISCUSSION' | 'QUESTION') ?? 'DISCUSSION',
      flairId: this.form.value.flairId ?? undefined,
      imageUrl: this.cleanOptional(this.form.value.imageUrl)
    };

    this.postService.create(this.communityId, payload, userId).subscribe({
      next: (post) => this.router.navigate(['/app/community/post', post.id]),
      error: (error) => {
        this.error = this.readErrorMessage(error, 'Could not create post.');
        this.saving = false;
      }
    });
  }

  private loadFlairs(communityId: number): void {
    if (!communityId) {
      return;
    }

    this.communityService.getFlairs(communityId).subscribe({
      next: (flairs) => (this.flairs = flairs),
      error: () => (this.flairs = [])
    });
  }

  private cleanOptional(value: unknown): string | undefined {
    const str = String(value ?? '').trim();
    return str.length ? str : undefined;
  }

  private readErrorMessage(error: unknown, fallback: string): string {
    const message = (error as { error?: { error?: string } })?.error?.error;
    return typeof message === 'string' && message.trim().length > 0 ? message : fallback;
  }
}
