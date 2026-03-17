import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Flair } from '../../models/community.model';
import { CommunityService } from '../../services/community.service';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrl: './post-create.component.css'
})
export class PostCreateComponent implements OnInit {
  communityId = 0;
  flairs: Flair[] = [];
  saving = false;
  error = '';
  postImagePreview = '';
  imageInputId = 'post-image-input';
  get userId(): number { return this.auth.getCurrentUser()!.id; }

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
  }

  clearPostImage(): void {
    this.form.patchValue({ imageUrl: '' });
    this.postImagePreview = '';
  }

  ngOnInit(): void {
    const communityId = Number(this.route.snapshot.queryParamMap.get('communityId'));
    this.communityId = communityId;
    if (communityId) {
      this.communityService.getFlairs(communityId).subscribe((flairs) => (this.flairs = flairs));
    }
  }

  submit(): void {
    if (this.form.invalid || !this.communityId) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const payload: { title: string; content: string; type: 'DISCUSSION' | 'QUESTION'; flairId?: number; imageUrl?: string } = {
      title: this.form.value.title ?? '',
      content: this.form.value.content ?? '',
      type: (this.form.value.type as 'DISCUSSION' | 'QUESTION') ?? 'DISCUSSION',
      flairId: this.form.value.flairId ?? undefined,
      imageUrl: this.cleanOptional(this.form.value.imageUrl)
    };

    this.postService.create(this.communityId, payload, this.userId).subscribe({
      next: (post) => this.router.navigate(['/app/community/post', post.id]),
      error: () => {
        this.error = 'Could not create post.';
        this.saving = false;
      }
    });
  }

  private cleanOptional(value: unknown): string | undefined {
    const str = String(value ?? '').trim();
    return str.length ? str : undefined;
  }
}
