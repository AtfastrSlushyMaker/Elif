import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import {
  ServiceProviderRequestService,
  ServiceProviderRequest
} from '../../services/service-provider-request.service';

@Component({
  selector: 'app-service-provider-request',
  templateUrl: './service-provider-request.component.html',
  styleUrls: ['./service-provider-request.component.css']
})
export class ServiceProviderRequestComponent implements OnInit {

  form!: FormGroup;
  request: ServiceProviderRequest | null = null;
  loading = true;
  submitting = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private requestService: ServiceProviderRequestService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
    this.loadMyRequest();
  }

  private loadMyRequest(): void {
    const user = this.auth.getCurrentUser();
    if (!user) { this.loading = false; return; }

    this.requestService.getMyRequest(user.id).subscribe({
      next: (req) => {
        // Backend retourne { status: 'NONE' } si aucune demande
        if ((req as any).status === 'NONE') {
          this.request = null;
        } else {
          this.request = req;
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get currentStatus(): string {
    return this.request?.status ?? 'NONE';
  }

  get isPending(): boolean  { return this.currentStatus === 'PENDING'; }
  get isApproved(): boolean { return this.currentStatus === 'APPROVED'; }
  get isRejected(): boolean { return this.currentStatus === 'REJECTED'; }
  get hasNoRequest(): boolean { return this.currentStatus === 'NONE'; }

  onSubmit(): void {
    if (this.form.invalid || this.submitting) return;
    const user = this.auth.getCurrentUser();
    if (!user) return;

    this.submitting = true;
    this.errorMsg = '';
    this.successMsg = '';

    this.requestService.createRequest(user.id, this.form.value.message).subscribe({
      next: (req) => {
        this.request = req;
        this.submitting = false;
        this.successMsg = 'Votre demande a été envoyée avec succès !';
        this.form.reset();
      },
      error: (err) => {
        this.submitting = false;
        this.errorMsg = err?.error?.message || 'Une erreur est survenue. Réessayez.';
      }
    });
  }
}
