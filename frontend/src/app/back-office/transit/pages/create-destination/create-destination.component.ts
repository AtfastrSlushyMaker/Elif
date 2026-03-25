import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, finalize, takeUntil } from 'rxjs';
import {
  Destination,
  DestinationCreateRequest,
  DestinationStatus,
  DestinationType,
  DocumentType,
  PetFriendlyLevel,
  TransportType
} from '../../models/destination.model';
import { DestinationService } from '../../services/destination.service';

type CreateDestinationFormModel = {
  title: FormControl<string>;
  country: FormControl<string>;
  region: FormControl<string>;
  destinationType: FormControl<DestinationType | null>;
  recommendedTransportType: FormControl<TransportType | null>;
  petFriendlyLevel: FormControl<PetFriendlyLevel>;
  description: FormControl<string>;
  safetyTips: FormControl<string>;
  requiredDocuments: FormControl<DocumentType[]>;
  coverImageUrl: FormControl<string>;
  latitude: FormControl<number | null>;
  longitude: FormControl<number | null>;
  status: FormControl<DestinationStatus | null>;
};

type FormFieldName = keyof CreateDestinationFormModel;

@Component({
  selector: 'app-create-destination',
  templateUrl: './create-destination.component.html',
  styleUrl: './create-destination.component.scss'
})
export class CreateDestinationComponent implements OnDestroy {
  readonly statusOptions: DestinationStatus[] = ['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'];
  readonly starLevels: PetFriendlyLevel[] = [1, 2, 3, 4, 5];
  readonly placeholderCover = 'images/logo/logo-cropped-transparent.png';

  readonly destinationForm = new FormGroup<CreateDestinationFormModel>({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)]
    }),
    country: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)]
    }),
    region: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)]
    }),
    destinationType: new FormControl<DestinationType | null>(null, Validators.required),
    recommendedTransportType: new FormControl<TransportType | null>(null, Validators.required),
    petFriendlyLevel: new FormControl<PetFriendlyLevel>(3, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(5)]
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(2000)]
    }),
    safetyTips: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(2000)]
    }),
    requiredDocuments: new FormControl<DocumentType[]>([], { nonNullable: true }),
    coverImageUrl: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(500)] }),
    latitude: new FormControl<number | null>(null),
    longitude: new FormControl<number | null>(null),
    status: new FormControl<DestinationStatus | null>('DRAFT', Validators.required)
  });

  isSaving = false;
  submitErrorMessage = '';
  submitSuccessMessage = '';

  private readonly destroy$ = new Subject<void>();
  private readonly fallbackByType: Record<DestinationType, string> = {
    BEACH: 'images/stock/happy-dog-owner.jpg',
    MOUNTAIN: 'images/stock/vet-with-dog.jpg',
    CITY: 'images/stock/vet-examining.jpg',
    FOREST: 'images/stock/kitten.jpg',
    ROAD_TRIP: 'images/stock/golden-retriever.jpg',
    INTERNATIONAL: 'images/stock/vet-with-dog.jpg'
  };

  constructor(
    private readonly destinationService: DestinationService,
    private readonly router: Router
  ) {}

  get destinationTypes(): DestinationType[] {
    return this.destinationService.destinationTypes;
  }

  get transportTypes(): TransportType[] {
    return this.destinationService.transportTypes;
  }

  get requiredDocumentTypes(): DocumentType[] {
    return this.destinationService.documentTypes;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get previewDestination(): Destination {
    const value = this.destinationForm.getRawValue();
    const previewTimestamp = new Date().toISOString();
    const status = value.status ?? 'DRAFT';

    return {
      title: value.title.trim() || 'Untitled destination',
      country: value.country.trim() || 'Country',
      region: value.region.trim() || 'Region',
      destinationType: value.destinationType ?? 'CITY',
      recommendedTransportType: value.recommendedTransportType ?? 'CAR',
      petFriendlyLevel: value.petFriendlyLevel,
      description: value.description.trim() || 'Description will appear here.',
      safetyTips: value.safetyTips.trim() || 'Safety tips will appear here.',
      requiredDocuments: value.requiredDocuments,
      coverImageUrl: value.coverImageUrl.trim(),
      latitude: value.latitude,
      longitude: value.longitude,
      status,
      createdAt: previewTimestamp,
      updatedAt: previewTimestamp,
      publishedAt: status === 'PUBLISHED' ? previewTimestamp : null,
      scheduledPublishAt: status === 'SCHEDULED' ? previewTimestamp : null
    };
  }

  createDestination(): void {
    this.submitForm();
  }

  saveDraft(): void {
    this.destinationForm.controls.status.setValue('DRAFT');
    this.submitForm();
  }

  resetForm(): void {
    this.destinationForm.reset(this.initialFormValue());
    this.destinationForm.markAsPristine();
    this.destinationForm.markAsUntouched();
    this.submitErrorMessage = '';
    this.submitSuccessMessage = '';
  }

  goBackToList(): void {
    this.router.navigate(['/admin/transit/destinations']);
  }

  setPetFriendlyLevel(level: PetFriendlyLevel): void {
    this.destinationForm.controls.petFriendlyLevel.setValue(level);
    this.destinationForm.controls.petFriendlyLevel.markAsDirty();
    this.destinationForm.controls.petFriendlyLevel.markAsTouched();
  }

  toggleRequiredDocument(documentType: DocumentType): void {
    const currentDocuments = this.destinationForm.controls.requiredDocuments.value;
    const exists = currentDocuments.includes(documentType);

    const updatedDocuments = exists
      ? currentDocuments.filter((currentDocument) => currentDocument !== documentType)
      : [...currentDocuments, documentType];

    this.destinationForm.controls.requiredDocuments.setValue(updatedDocuments);
    this.destinationForm.controls.requiredDocuments.markAsDirty();
    this.destinationForm.controls.requiredDocuments.markAsTouched();
  }

  isRequiredDocumentSelected(documentType: DocumentType): boolean {
    return this.destinationForm.controls.requiredDocuments.value.includes(documentType);
  }

  hasControlError(fieldName: FormFieldName): boolean {
    const control = this.destinationForm.controls[fieldName];
    return control.invalid && (control.dirty || control.touched);
  }

  getControlError(fieldName: FormFieldName): string | null {
    const control = this.destinationForm.controls[fieldName];
    if (!this.hasControlError(fieldName)) {
      return null;
    }

    if (control.hasError('required')) {
      return 'This field is required.';
    }

    if (control.hasError('maxlength')) {
      const maxLength = control.getError('maxlength')?.requiredLength;
      return `Maximum ${maxLength} characters allowed.`;
    }

    if (control.hasError('min')) {
      return 'Value is below the minimum allowed.';
    }

    if (control.hasError('max')) {
      return 'Value is above the maximum allowed.';
    }

    return 'Invalid value.';
  }

  formatDestinationType(destinationType: DestinationType): string {
    return this.destinationService.formatDestinationType(destinationType);
  }

  formatTransportType(transportType: TransportType): string {
    return this.destinationService.formatTransportType(transportType);
  }

  formatDocumentLabel(documentType: DocumentType): string {
    return this.destinationService.formatDocumentType(documentType);
  }

  getDestinationTypeIcon(destinationType: DestinationType): string {
    switch (destinationType) {
      case 'BEACH':
        return 'fa-umbrella-beach';
      case 'MOUNTAIN':
        return 'fa-mountain';
      case 'CITY':
        return 'fa-city';
      case 'FOREST':
        return 'fa-tree';
      case 'ROAD_TRIP':
        return 'fa-road';
      case 'INTERNATIONAL':
      default:
        return 'fa-globe';
    }
  }

  getTransportIcon(transportType: TransportType): string {
    switch (transportType) {
      case 'CAR':
        return 'fa-car-side';
      case 'TRAIN':
        return 'fa-train';
      case 'PLANE':
        return 'fa-plane-departure';
      case 'BUS':
      default:
        return 'fa-bus';
    }
  }

  resolvePreviewImage(destination: Destination): string {
    const explicitCover = destination.coverImageUrl.trim();
    if (explicitCover.length > 0) {
      return explicitCover;
    }
    return this.fallbackByType[destination.destinationType] ?? this.placeholderCover;
  }

  onPreviewImageError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    if (!image) {
      return;
    }
    image.src = this.placeholderCover;
  }

  getPreviewDateLabel(destination: Destination): string {
    if (destination.status === 'PUBLISHED' && destination.publishedAt) {
      return 'Published on';
    }
    if (destination.status === 'SCHEDULED' && destination.scheduledPublishAt) {
      return 'Scheduled for';
    }
    return 'Created on';
  }

  getPreviewDateValue(destination: Destination): string | undefined {
    if (destination.status === 'PUBLISHED' && destination.publishedAt) {
      return destination.publishedAt;
    }
    if (destination.status === 'SCHEDULED' && destination.scheduledPublishAt) {
      return destination.scheduledPublishAt;
    }
    return destination.createdAt;
  }

  private submitForm(): void {
    this.submitErrorMessage = '';
    this.submitSuccessMessage = '';

    if (this.destinationForm.invalid) {
      this.destinationForm.markAllAsTouched();
      this.submitErrorMessage = 'Please complete all required fields before saving.';
      return;
    }

    const payload = this.buildCreatePayload();
    this.isSaving = true;

    this.destinationService
      .createDestination(payload)
      .pipe(
        finalize(() => {
          this.isSaving = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (createdDestination) => {
          this.submitSuccessMessage = `Destination "${createdDestination.title}" created successfully.`;
          this.destinationForm.markAsPristine();
        },
        error: () => {
          this.submitErrorMessage =
            'Unable to create this destination right now. Please try again.';
        }
      });
  }

  private buildCreatePayload(): DestinationCreateRequest {
    const value = this.destinationForm.getRawValue();

    return {
      title: value.title.trim(),
      country: value.country.trim(),
      region: value.region.trim(),
      destinationType: value.destinationType ?? 'CITY',
      recommendedTransportType: value.recommendedTransportType ?? 'CAR',
      petFriendlyLevel: value.petFriendlyLevel,
      description: value.description.trim(),
      safetyTips: value.safetyTips.trim(),
      requiredDocuments: value.requiredDocuments,
      coverImageUrl: value.coverImageUrl.trim(),
      latitude: value.latitude,
      longitude: value.longitude,
      status: value.status ?? 'DRAFT'
    };
  }

  private initialFormValue(): {
    title: string;
    country: string;
    region: string;
    destinationType: DestinationType | null;
    recommendedTransportType: TransportType | null;
    petFriendlyLevel: PetFriendlyLevel;
    description: string;
    safetyTips: string;
    requiredDocuments: DocumentType[];
    coverImageUrl: string;
    latitude: number | null;
    longitude: number | null;
    status: DestinationStatus | null;
  } {
    return {
      title: '',
      country: '',
      region: '',
      destinationType: null,
      recommendedTransportType: null,
      petFriendlyLevel: 3,
      description: '',
      safetyTips: '',
      requiredDocuments: [],
      coverImageUrl: '',
      latitude: null,
      longitude: null,
      status: 'DRAFT'
    };
  }
}
