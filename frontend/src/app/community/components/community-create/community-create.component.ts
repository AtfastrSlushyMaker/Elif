import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommunityService } from '../../services/community.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-community-create',
  templateUrl: './community-create.component.html',
  styleUrl: './community-create.component.css'
})
export class CommunityCreateComponent {
  private readonly bannerPalette = ['#A7E1D8', '#FCD6A0', '#F9B3B9', '#B7D7F7', '#CBB8F4', '#BFE8C3', '#F7D5E6', '#F6E6A8'];
  private readonly previewSeed = Math.floor(Math.random() * 1000000);

  get userId(): number { return this.auth.getCurrentUser()!.id; }
  saving = false;
  error = '';
  bannerPreview = '';
  iconPreview = '';
  bannerInputId = 'community-banner-input';
  iconInputId = 'community-icon-input';

  form;

  constructor(
    private fb: FormBuilder,
    private communityService: CommunityService,
    private router: Router,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      type: ['PUBLIC'],
      bannerUrl: [''],
      iconUrl: ['']
    });
  }

  onImagePicked(event: Event, controlName: 'bannerUrl' | 'iconUrl'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || '');
      this.form.patchValue({ [controlName]: value });
      if (controlName === 'bannerUrl') this.bannerPreview = value;
      if (controlName === 'iconUrl') this.iconPreview = value;
    };
    reader.readAsDataURL(file);
  }

  clearPickedImage(controlName: 'bannerUrl' | 'iconUrl'): void {
    this.form.patchValue({ [controlName]: '' });
    if (controlName === 'bannerUrl') this.bannerPreview = '';
    if (controlName === 'iconUrl') this.iconPreview = '';
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.error = '';
    const payload: { name: string; description: string; type: 'PUBLIC' | 'PRIVATE'; bannerUrl?: string; iconUrl?: string } = {
      name: this.form.value.name ?? '',
      description: this.form.value.description ?? '',
      type: (this.form.value.type as 'PUBLIC' | 'PRIVATE') ?? 'PUBLIC',
      bannerUrl: this.cleanOptional(this.form.value.bannerUrl),
      iconUrl: this.cleanOptional(this.form.value.iconUrl)
    };

    this.communityService.create(payload, this.userId).subscribe({
      next: (community) => this.router.navigate(['/app/community/c', community.slug]),
      error: () => {
        this.error = 'Could not create community.';
        this.saving = false;
      }
    });
  }

  previewBannerColor(): string {
    const nameSeed = String(this.form.get('name')?.value || '').trim();
    const seed = nameSeed || String(this.previewSeed);
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

  private cleanOptional(value: unknown): string | undefined {
    const str = String(value ?? '').trim();
    return str.length ? str : undefined;
  }
}
