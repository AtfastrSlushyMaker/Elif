import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject, finalize, map, of, switchMap, takeUntil, throwError } from 'rxjs';
import {
  Destination,
  DestinationCreateRequest,
  DestinationProgrammingMode,
  DestinationStatus,
  DestinationType,
  DocumentType,
  PetFriendlyLevel,
  TransportType
} from '../../models/destination.model';
import { DestinationService } from '../../services/destination.service';
import { TransitToastService } from '../../services/transit-toast.service';

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
};

type FormFieldName = keyof CreateDestinationFormModel;

@Component({
  selector: 'app-create-destination',
  templateUrl: './create-destination.component.html',
  styleUrl: './create-destination.component.scss'
})
export class CreateDestinationComponent implements OnDestroy {
  readonly starLevels: PetFriendlyLevel[] = [1, 2, 3, 4, 5];
  readonly programmingModes: DestinationProgrammingMode[] = ['PUBLISH', 'SCHEDULE', 'DRAFT'];
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
    coverImageUrl: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)]
    }),
    latitude: new FormControl<number | null>(null),
    longitude: new FormControl<number | null>(null)
  });

  readonly scheduleAtControl = new FormControl('', { nonNullable: true });

  selectedProgrammingMode: DestinationProgrammingMode = 'DRAFT';
  selectedCoverFile: File | null = null;
  selectedCoverFileName = '';
  selectedCoverPreviewUrl: string | null = null;
  scheduleTouched = false;

  isSaving = false;
  submitErrorMessage = '';

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
    private readonly transitToastService: TransitToastService,
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

  get previewDestination(): Destination {
    const value = this.destinationForm.getRawValue();
    const previewTimestamp = new Date().toISOString();
    const previewStatus = this.previewStatus();
    const scheduledAt = this.scheduleAtControl.value;

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
      status: previewStatus,
      createdAt: previewTimestamp,
      updatedAt: previewTimestamp,
      publishedAt: previewStatus === 'PUBLISHED' ? previewTimestamp : null,
      scheduledPublishAt: previewStatus === 'SCHEDULED' && scheduledAt ? scheduledAt : null
    };
  }

  ngOnDestroy(): void {
    this.releasePreviewObjectUrl();
    this.destroy$.next();
    this.destroy$.complete();
  }

  setProgrammingMode(mode: DestinationProgrammingMode): void {
    this.selectedProgrammingMode = mode;
    if (mode !== 'SCHEDULE') {
      this.scheduleTouched = false;
    }
  }

  isProgrammingModeSelected(mode: DestinationProgrammingMode): boolean {
    return this.selectedProgrammingMode === mode;
  }

  executeProgrammingAction(): void {
    this.submitErrorMessage = '';
    this.scheduleTouched = this.selectedProgrammingMode === 'SCHEDULE';

    if (this.destinationForm.invalid) {
      this.destinationForm.markAllAsTouched();
      this.submitErrorMessage = 'Please complete all required fields before continuing.';
      return;
    }

    if (this.selectedProgrammingMode === 'SCHEDULE' && !this.scheduleAtControl.value.trim()) {
      this.submitErrorMessage = 'Select a schedule date and time before scheduling.';
      return;
    }

    this.isSaving = true;

    const createPayload = this.buildCreatePayload();

    this.destinationService
      .createDestination(createPayload, this.selectedCoverFile)
      .pipe(
        switchMap((createdDestination) => this.applyProgrammingAction(createdDestination)),
        finalize(() => {
          this.isSaving = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: ({ mode }) => {
          this.transitToastService.success(
            'Destination saved',
            this.successMessageForMode(mode)
          );
          this.router.navigate(['/admin/transit/destinations']);
        },
        error: (error: unknown) => {
          const message = this.extractErrorMessage(error);
          this.submitErrorMessage = message;
          this.transitToastService.error('Destination flow failed', message);
        }
      });
  }

  onCoverFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;
    this.assignCoverFile(file);
  }

  removeCoverFile(): void {
    this.assignCoverFile(null);
  }

  resetForm(): void {
    this.destinationForm.reset(this.initialFormValue());
    this.destinationForm.markAsUntouched();
    this.destinationForm.markAsPristine();
    this.scheduleAtControl.setValue('');
    this.scheduleAtControl.markAsUntouched();
    this.scheduleAtControl.markAsPristine();
    this.selectedProgrammingMode = 'DRAFT';
    this.scheduleTouched = false;
    this.submitErrorMessage = '';
    this.removeCoverFile();
  }

  cancel(): void {
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

  hasScheduleError(): boolean {
    return (
      this.selectedProgrammingMode === 'SCHEDULE' &&
      this.scheduleTouched &&
      this.scheduleAtControl.value.trim().length === 0
    );
  }

  actionLabel(): string {
    switch (this.selectedProgrammingMode) {
      case 'PUBLISH':
        return this.isSaving ? 'Publishing...' : 'Create and Publish';
      case 'SCHEDULE':
        return this.isSaving ? 'Scheduling...' : 'Create and Schedule';
      case 'DRAFT':
      default:
        return this.isSaving ? 'Saving draft...' : 'Save as Draft';
    }
  }

  modeLabel(mode: DestinationProgrammingMode): string {
    switch (mode) {
      case 'PUBLISH':
        return 'Publish';
      case 'SCHEDULE':
        return 'Schedule';
      case 'DRAFT':
      default:
        return 'Save as Draft';
    }
  }

  modeSubtitle(mode: DestinationProgrammingMode): string {
    switch (mode) {
      case 'PUBLISH':
        return 'Create now, then publish immediately';
      case 'SCHEDULE':
        return 'Create now, then publish later';
      case 'DRAFT':
      default:
        return 'Create now and keep as draft';
    }
  }

  modeIcon(mode: DestinationProgrammingMode): string {
    switch (mode) {
      case 'PUBLISH':
        return 'fa-bullhorn';
      case 'SCHEDULE':
        return 'fa-clock';
      case 'DRAFT':
      default:
        return 'fa-file-circle-plus';
    }
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
    if (this.selectedCoverPreviewUrl) {
      return this.selectedCoverPreviewUrl;
    }

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
      longitude: value.longitude
    };
  }

  private applyProgrammingAction(
    createdDestination: Destination
  ): Observable<{ mode: DestinationProgrammingMode; destination: Destination }> {
    const destinationId = createdDestination.id;
    if (!destinationId) {
      return throwError(() => new Error('Destination ID is missing after creation.'));
    }

    if (this.selectedProgrammingMode === 'PUBLISH') {
      return this.destinationService
        .publishDestination(destinationId)
        .pipe(map((destination) => ({ mode: 'PUBLISH' as const, destination })));
    }

    if (this.selectedProgrammingMode === 'SCHEDULE') {
      const scheduledAt = this.scheduleAtControl.value.trim();
      if (!scheduledAt) {
        return throwError(() => new Error('Scheduled date-time is required.'));
      }
      return this.destinationService
        .scheduleDestination(destinationId, scheduledAt)
        .pipe(map((destination) => ({ mode: 'SCHEDULE' as const, destination })));
    }

    return of({ mode: 'DRAFT' as const, destination: createdDestination });
  }

  private successMessageForMode(mode: DestinationProgrammingMode): string {
    switch (mode) {
      case 'PUBLISH':
        return 'Destination created and published successfully.';
      case 'SCHEDULE': {
        const scheduleText = this.scheduleAtControl.value.trim();
        return scheduleText
          ? `Destination created and scheduled for ${scheduleText}.`
          : 'Destination created and scheduled successfully.';
      }
      case 'DRAFT':
      default:
        return 'Destination saved as draft successfully.';
    }
  }

  private previewStatus(): DestinationStatus {
    switch (this.selectedProgrammingMode) {
      case 'PUBLISH':
        return 'PUBLISHED';
      case 'SCHEDULE':
        return 'SCHEDULED';
      case 'DRAFT':
      default:
        return 'DRAFT';
    }
  }

  private assignCoverFile(file: File | null): void {
    this.releasePreviewObjectUrl();

    this.selectedCoverFile = file;
    this.selectedCoverFileName = file?.name ?? '';
    this.selectedCoverPreviewUrl = file ? URL.createObjectURL(file) : null;
  }

  private releasePreviewObjectUrl(): void {
    if (this.selectedCoverPreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.selectedCoverPreviewUrl);
    }
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const backendMessage =
        (error.error as { message?: string } | null | undefined)?.message;
      return backendMessage || 'Request failed. Please verify data and try again.';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unexpected error. Please try again.';
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
      longitude: null
    };
  }
}

