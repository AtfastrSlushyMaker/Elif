import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest, finalize, takeUntil } from 'rxjs';
import { TravelDestination } from '../../models/travel-destination.model';
import {
  TRANSPORT_TYPE_LABELS,
  TravelPlan,
  TravelPlanCreateRequest,
  TravelPlanUpdateRequest,
  TransportType
} from '../../models/travel-plan.model';
import { TravelDestinationService } from '../../services/travel-destination.service';
import { TravelPlanService } from '../../services/travel-plan.service';

@Component({
  selector: 'app-create-travel-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-travel-plan.component.html',
  styleUrl: './create-travel-plan.component.scss'
})
export class CreateTravelPlanComponent implements OnInit, OnDestroy {
  private readonly fb = new FormBuilder();

  readonly transportOptions = Object.entries(TRANSPORT_TYPE_LABELS).map(([value, label]) => ({
    value: value as TransportType,
    label
  }));

  readonly form = this.fb.group({
    destinationId: [0, [Validators.required, Validators.min(1)]],
    petId: [0, [Validators.required, Validators.min(1)]],
    origin: ['', [Validators.required, Validators.minLength(2)]],
    transportType: ['CAR' as TransportType, [Validators.required]],
    travelDate: ['', [Validators.required]],
    returnDate: ['', [Validators.required]],
    estimatedTravelHours: [1, [Validators.required, Validators.min(0.5)]],
    estimatedTravelCost: [0, [Validators.required, Validators.min(0)]],
    currency: ['USD', [Validators.required, Validators.maxLength(5)]],
    animalWeight: [1, [Validators.required, Validators.min(0.1)]],
    cageLength: [1, [Validators.required, Validators.min(1)]],
    cageWidth: [1, [Validators.required, Validators.min(1)]],
    cageHeight: [1, [Validators.required, Validators.min(1)]],
    hydrationIntervalMinutes: [90, [Validators.required, Validators.min(15)]],
    requiredStops: [1, [Validators.required, Validators.min(0)]]
  });

  destinationRecap: TravelDestination | null = null;
  isEditMode = false;
  saving = false;
  loading = false;
  errorMessage = '';

  private planId: number | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly travelPlanService: TravelPlanService,
    private readonly destinationService: TravelDestinationService
  ) {}

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([params, queryParams]) => {
        const planId = Number(params.get('id'));
        const destinationId = Number(queryParams.get('destinationId'));

        this.errorMessage = '';

        if (!Number.isNaN(planId) && planId > 0) {
          this.isEditMode = true;
          this.planId = planId;
          this.loadPlanForEdit(planId);
          return;
        }

        this.isEditMode = false;
        this.planId = null;
        this.form.controls.destinationId.enable({ emitEvent: false });
        this.form.controls.petId.enable({ emitEvent: false });

        if (!Number.isNaN(destinationId) && destinationId > 0) {
          this.form.patchValue({ destinationId });
          this.loadDestinationRecap(destinationId);
        } else {
          this.destinationRecap = null;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get pageTitle(): string {
    return this.isEditMode ? 'Refine Your Travel Plan' : 'Build Your Premium Travel Plan';
  }

  get submitLabel(): string {
    return this.isEditMode ? 'Save Changes' : 'Save Plan';
  }

  get destinationLabel(): string {
    if (!this.destinationRecap) {
      return 'Destination selected from catalog';
    }

    return `${this.destinationRecap.title} - ${this.destinationRecap.country}`;
  }

  hasDestinationImage(): boolean {
    return Boolean(this.destinationRecap?.coverImageUrl?.trim());
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    if (this.isEditMode && this.planId) {
      this.travelPlanService
        .updateTravelPlan(this.planId, this.buildUpdatePayload())
        .pipe(
          finalize(() => {
            this.saving = false;
          }),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: () => {
            this.router.navigate(['/app/transit/plans'], {
              state: { flashMessage: 'Travel plan updated successfully.' }
            });
          },
          error: (error: unknown) => {
            this.errorMessage =
              error instanceof Error ? error.message : 'Unable to update the plan. Please try again.';
          }
        });
      return;
    }

    this.travelPlanService
      .createTravelPlan(this.buildCreatePayload())
      .pipe(
        finalize(() => {
          this.saving = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/app/transit/plans'], {
            state: { flashMessage: 'Your travel plan is now in preparation.' }
          });
        },
        error: (error: unknown) => {
          this.errorMessage =
            error instanceof Error ? error.message : 'Unable to save the plan. Please try again.';
        }
      });
  }

  onCancel(): void {
    if (this.isEditMode && this.planId) {
      this.router.navigate(['/app/transit/plans', this.planId]);
      return;
    }

    this.router.navigate(['/app/transit/plans']);
  }

  onReset(): void {
    if (this.isEditMode && this.planId) {
      this.loadPlanForEdit(this.planId);
      return;
    }

    const destinationId = this.form.getRawValue().destinationId;
    this.form.reset({
      destinationId,
      petId: 0,
      origin: '',
      transportType: 'CAR',
      travelDate: '',
      returnDate: '',
      estimatedTravelHours: 1,
      estimatedTravelCost: 0,
      currency: 'USD',
      animalWeight: 1,
      cageLength: 1,
      cageWidth: 1,
      cageHeight: 1,
      hydrationIntervalMinutes: 90,
      requiredStops: 1
    });
  }

  private loadPlanForEdit(planId: number): void {
    this.loading = true;

    this.travelPlanService
      .getTravelPlanById(planId)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (plan) => {
          this.patchPlan(plan);
          this.loadDestinationRecap(plan.destinationId);
        },
        error: (error: unknown) => {
          this.errorMessage =
            error instanceof Error ? error.message : 'Unable to load this travel plan for editing.';
        }
      });
  }

  private patchPlan(plan: TravelPlan): void {
    this.form.patchValue({
      destinationId: plan.destinationId,
      petId: plan.petId,
      origin: plan.origin,
      transportType: plan.transportType,
      travelDate: this.toDateInputValue(plan.travelDate),
      returnDate: this.toDateInputValue(plan.returnDate),
      estimatedTravelHours: plan.estimatedTravelHours,
      estimatedTravelCost: plan.estimatedTravelCost,
      currency: plan.currency,
      animalWeight: plan.animalWeight,
      cageLength: plan.cageLength,
      cageWidth: plan.cageWidth,
      cageHeight: plan.cageHeight,
      hydrationIntervalMinutes: plan.hydrationIntervalMinutes,
      requiredStops: plan.requiredStops
    });

    this.form.controls.destinationId.disable({ emitEvent: false });
    this.form.controls.petId.disable({ emitEvent: false });
  }

  private loadDestinationRecap(destinationId: number): void {
    this.destinationService
      .getDestinationById(destinationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (destination) => {
          this.destinationRecap = destination;
        },
        error: () => {
          this.destinationRecap = null;
        }
      });
  }

  private buildCreatePayload(): TravelPlanCreateRequest {
    const raw = this.form.getRawValue();

    return {
      destinationId: this.toNumber(raw.destinationId),
      petId: this.toNumber(raw.petId),
      origin: String(raw.origin ?? '').trim(),
      transportType: raw.transportType ?? 'CAR',
      travelDate: String(raw.travelDate ?? ''),
      returnDate: String(raw.returnDate ?? ''),
      estimatedTravelHours: this.toNumber(raw.estimatedTravelHours),
      estimatedTravelCost: this.toNumber(raw.estimatedTravelCost),
      currency: String(raw.currency ?? 'USD').trim().toUpperCase(),
      animalWeight: this.toNumber(raw.animalWeight),
      cageLength: this.toNumber(raw.cageLength),
      cageWidth: this.toNumber(raw.cageWidth),
      cageHeight: this.toNumber(raw.cageHeight),
      hydrationIntervalMinutes: this.toNumber(raw.hydrationIntervalMinutes),
      requiredStops: this.toNumber(raw.requiredStops)
    };
  }

  private buildUpdatePayload(): TravelPlanUpdateRequest {
    const raw = this.form.getRawValue();

    return {
      origin: String(raw.origin ?? '').trim(),
      transportType: raw.transportType ?? 'CAR',
      travelDate: String(raw.travelDate ?? ''),
      returnDate: String(raw.returnDate ?? ''),
      estimatedTravelHours: this.toNumber(raw.estimatedTravelHours),
      estimatedTravelCost: this.toNumber(raw.estimatedTravelCost),
      currency: String(raw.currency ?? 'USD').trim().toUpperCase(),
      animalWeight: this.toNumber(raw.animalWeight),
      cageLength: this.toNumber(raw.cageLength),
      cageWidth: this.toNumber(raw.cageWidth),
      cageHeight: this.toNumber(raw.cageHeight),
      hydrationIntervalMinutes: this.toNumber(raw.hydrationIntervalMinutes),
      requiredStops: this.toNumber(raw.requiredStops)
    };
  }

  private toNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private toDateInputValue(value: string): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toISOString().slice(0, 10);
  }
}
