import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { finalize } from 'rxjs';
import { DOCUMENT_CONFIG, DocumentType } from '../../models/travel-document.model';
import { PetTransitToastService } from '../../services/pet-transit-toast.service';
import { TravelDocumentService } from '../../services/travel-document.service';

@Component({
  selector: 'app-upload-document-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './upload-document-modal.component.html',
  styleUrl: './upload-document-modal.component.scss'
})
export class UploadDocumentModalComponent implements OnChanges {
  @Input() planId!: number;
  @Input() preselectedType: string | null = null;
  @Output() uploaded = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  @ViewChild('fileInput') private fileInput?: ElementRef<HTMLInputElement>;

  private readonly fb = new FormBuilder();

  readonly documentConfig = DOCUMENT_CONFIG;
  readonly documentTypes: DocumentType[] = [
    'PET_PASSPORT',
    'RABIES_VACCINE',
    'HEALTH_CERTIFICATE',
    'TRANSPORT_AUTHORIZATION'
  ];

  readonly form = this.fb.group({
    documentType: ['', Validators.required],
    documentNumber: [''],
    holderName: [''],
    issueDate: ['', [this.issueDateNotInFutureValidator(), this.issueBeforeExpiryValidator()]],
    expiryDate: ['', [this.expiryInFutureValidator(), this.expiryAfterIssueValidator()]],
    issuingOrganization: ['']
  });

  selectedFile: File | null = null;
  isUploading = false;
  isDragActive = false;
  fileError = '';
  isTypeLocked = false;

  constructor(
    private readonly travelDocumentService: TravelDocumentService,
    private readonly toastService: PetTransitToastService
  ) {
    this.form.controls.issueDate.valueChanges.subscribe(() => {
      this.form.controls.expiryDate.updateValueAndValidity({ emitEvent: false });
    });

    this.form.controls.expiryDate.valueChanges.subscribe(() => {
      this.form.controls.issueDate.updateValueAndValidity({ emitEvent: false });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['preselectedType']) {
      this.applyPreselectedType();
    }
  }

  get selectedTypeIcon(): string {
    const selected = this.form.getRawValue().documentType;
    const type = this.toDocumentType(selected);

    if (!type) {
      return 'description';
    }

    return this.documentConfig[type].icon;
  }

  get canSubmit(): boolean {
    return !this.isUploading && this.form.valid && !!this.selectedFile && !this.fileError;
  }

  closeModal(): void {
    if (this.isUploading) {
      return;
    }

    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('upload-modal-backdrop')) {
      this.closeModal();
    }
  }

  triggerFilePicker(): void {
    this.fileInput?.nativeElement.click();
  }

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.item(0) ?? null;
    this.selectFile(file);

    if (input) {
      input.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragActive = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragActive = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragActive = false;
    const file = event.dataTransfer?.files?.item(0) ?? null;
    this.selectFile(file);
  }

  submit(): void {
    if (this.form.invalid || !this.selectedFile || this.fileError || this.isUploading) {
      this.form.markAllAsTouched();
      return;
    }

    if (!Number.isFinite(this.planId) || this.planId <= 0) {
      this.toastService.error('Upload failed. Invalid travel plan id.');
      return;
    }

    const raw = this.form.getRawValue();
    const documentType = this.toDocumentType(raw.documentType);

    if (!documentType) {
      this.form.controls.documentType.setErrors({ required: true });
      this.form.controls.documentType.markAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('documentType', documentType);

    const documentNumber = String(raw.documentNumber ?? '').trim();
    const holderName = String(raw.holderName ?? '').trim();
    const issueDate = String(raw.issueDate ?? '').trim();
    const expiryDate = String(raw.expiryDate ?? '').trim();
    const issuingOrganization = String(raw.issuingOrganization ?? '').trim();

    if (documentNumber) {
      formData.append('documentNumber', documentNumber);
    }

    if (holderName) {
      formData.append('holderName', holderName);
    }

    if (issueDate) {
      formData.append('issueDate', issueDate);
    }

    if (expiryDate) {
      formData.append('expiryDate', expiryDate);
    }

    if (issuingOrganization) {
      formData.append('issuingOrganization', issuingOrganization);
    }

    const payloadKeys: string[] = [];
    formData.forEach((_, key) => {
      payloadKeys.push(key);
    });

    console.log('[UploadDocumentModal] uploading for planId:', this.planId);
    console.log('[UploadDocumentModal] payload keys:', payloadKeys);

    this.isUploading = true;

    this.travelDocumentService
      .uploadDocument(this.planId, formData)
      .pipe(
        finalize(() => {
          this.isUploading = false;
        })
      )
      .subscribe({
        next: () => {
          this.toastService.success('Document uploaded successfully.');
          this.uploaded.emit();
          this.closed.emit();
        },
        error: (error: unknown) => {
          this.toastService.error(this.extractErrorMessage(error));
        }
      });
  }

  private applyPreselectedType(): void {
    const type = this.toDocumentType(this.preselectedType);

    if (type) {
      this.form.controls.documentType.setValue(type);
      this.form.controls.documentType.disable({ emitEvent: false });
      this.isTypeLocked = true;
      return;
    }

    this.form.controls.documentType.enable({ emitEvent: false });
    this.isTypeLocked = false;
  }

  private selectFile(file: File | null): void {
    this.fileError = '';

    if (!file) {
      this.selectedFile = null;
      return;
    }

    const validType = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const validExtension = ['pdf', 'jpg', 'jpeg', 'png'].includes(extension);

    if (!validType.includes(file.type.toLowerCase()) && !validExtension) {
      this.selectedFile = null;
      this.fileError = 'Please select PDF, JPG, or PNG accepted files only.';
      return;
    }

    this.selectedFile = file;
  }

  private toDocumentType(value: unknown): DocumentType | null {
    const normalized = String(value ?? '').trim().toUpperCase();
    return this.documentTypes.find((type) => type === normalized) ?? null;
  }

  private extractErrorMessage(error: unknown): string {
    const fallback = 'Upload failed. Please try again.';

    if (!error || typeof error !== 'object') {
      return fallback;
    }

    const httpError = error as { error?: unknown; message?: string };

    if (typeof httpError.error === 'string' && httpError.error.trim()) {
      return httpError.error.trim();
    }

    if (httpError.error && typeof httpError.error === 'object') {
      const payload = httpError.error as Record<string, unknown>;
      const message = String(payload['message'] ?? payload['error'] ?? '').trim();
      if (message) {
        return message;
      }
    }

    if (typeof httpError.message === 'string' && httpError.message.trim()) {
      return httpError.message.trim();
    }

    return fallback;
  }

  private issueDateNotInFutureValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value ?? '').trim();
      if (!value) {
        return null;
      }

      const issueDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return issueDate > today ? { issueInFuture: true } : null;
    };
  }

  private issueBeforeExpiryValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const issueDateValue = String(control.value ?? '').trim();
      if (!issueDateValue) {
        return null;
      }

      const expiryDateValue = String(control.parent?.get('expiryDate')?.value ?? '').trim();
      if (!expiryDateValue) {
        return null;
      }

      return new Date(issueDateValue) < new Date(expiryDateValue) ? null : { issueAfterExpiry: true };
    };
  }

  private expiryInFutureValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = String(control.value ?? '').trim();
      if (!value) {
        return null;
      }

      const expiryDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return expiryDate > today ? null : { expiryPast: true };
    };
  }

  private expiryAfterIssueValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const expiryDateValue = String(control.value ?? '').trim();
      if (!expiryDateValue) {
        return null;
      }

      const issueDateValue = String(control.parent?.get('issueDate')?.value ?? '').trim();
      if (!issueDateValue) {
        return null;
      }

      return new Date(expiryDateValue) > new Date(issueDateValue) ? null : { expiryBeforeIssue: true };
    };
  }
}
