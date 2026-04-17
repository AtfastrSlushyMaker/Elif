import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { ProviderRequestService, ProviderRequest } from './provider-request.service';

@Component({
  selector: 'app-provider-request',
  templateUrl: './provider-request.component.html',
  styleUrls: ['./provider-request.component.css']
})
export class ProviderRequestComponent implements OnInit {

  form!: FormGroup;
  request: ProviderRequest | null = null;
  loading = true;
  submitting = false;
  errorMsg = '';
  successMsg = '';
  selectedFile: File | null = null;
  fileName = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private providerService: ProviderRequestService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+\s()-]{8,20}$/)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    });
    this.loadMyRequest();
  }

  private loadMyRequest(): void {
    const user = this.auth.getCurrentUser();
    if (!user) { this.loading = false; return; }

    this.providerService.getMyRequest(user.id).subscribe({
      next: (req: any) => {
        if (req && req.status && req.status !== 'NONE') {
          this.request = req;
        } else {
          this.request = null;
        }
        this.loading = false;
      },
      error: () => {
        this.request = null;
        this.loading = false;
      }
    });
  }

  get currentStatus(): string {
    return this.request?.status ?? 'NONE';
  }

  get isPending(): boolean  { return this.currentStatus === 'PENDING'; }
  get isApproved(): boolean { return this.currentStatus === 'APPROVED'; }
  get isRejected(): boolean { return this.currentStatus === 'REJECTED'; }
  get hasNoRequest(): boolean { return this.currentStatus === 'NONE'; }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.fileName = this.selectedFile.name;
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.fileName = '';
  }

  onSubmit(): void {
    if (this.form.invalid || this.submitting) return;
    const user = this.auth.getCurrentUser();
    if (!user) return;

    this.submitting = true;
    this.errorMsg = '';
    this.successMsg = '';

    const formData = new FormData();
    formData.append('userId', user.id.toString());
    formData.append('fullName', this.form.value.fullName);
    formData.append('email', this.form.value.email);
    formData.append('phone', this.form.value.phone);
    formData.append('description', this.form.value.description);
    if (this.selectedFile) {
      formData.append('cv', this.selectedFile);
    }

    this.providerService.createRequest(formData).subscribe({
      next: (req) => {
        this.request = req;
        this.submitting = false;
        this.successMsg = 'Votre demande a été envoyée avec succès !';
        this.form.reset();
        this.selectedFile = null;
        this.fileName = '';
      },
      error: (err) => {
        this.submitting = false;
        this.errorMsg = err?.error?.message || 'Une erreur est survenue. Réessayez.';
      }
    });
  }
}
