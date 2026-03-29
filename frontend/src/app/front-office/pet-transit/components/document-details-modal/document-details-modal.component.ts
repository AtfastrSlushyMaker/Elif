import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DOCUMENT_CONFIG, VALIDATION_STATUS_CONFIG } from '../../models/travel-document.model';
import { TravelDocumentResponse } from '../../services/travel-document.service';

@Component({
  selector: 'app-document-details-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './document-details-modal.component.html',
  styleUrl: './document-details-modal.component.scss'
})
export class DocumentDetailsModalComponent {
  @Input() document!: TravelDocumentResponse;
  @Output() closed = new EventEmitter<void>();

  closeModal(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }

  get documentTypeLabel(): string {
    return DOCUMENT_CONFIG[this.document.documentType]?.label ?? this.document.documentType;
  }

  get documentTypeIcon(): string {
    return DOCUMENT_CONFIG[this.document.documentType]?.icon ?? 'description';
  }

  get statusLabel(): string {
    return VALIDATION_STATUS_CONFIG[this.document.validationStatus]?.label ?? 'Pending Review';
  }

  get statusClass(): string {
    return VALIDATION_STATUS_CONFIG[this.document.validationStatus]?.colorClass ?? 'status-pending';
  }

  formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) {
      return '—';
    }

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      return '—';
    }

    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  valueOrDash(value: string | null | undefined): string {
    const normalized = String(value ?? '').trim();
    return normalized || '—';
  }
}
