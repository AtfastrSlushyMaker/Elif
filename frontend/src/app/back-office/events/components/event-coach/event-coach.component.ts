import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DoCheck,
  Input,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Subscription, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import {
  EventCoachAnalysisRequest,
  EventCoachAnalysisResponse,
  EventCoachRecommendation,
  EventCoachService
} from '../../services/event-coach.service';

type CoachState = 'idle' | 'loading' | 'ready' | 'error';

interface PatchableEventForm {
  value: Record<string, any>;
  patchValue(values: Record<string, any>): void;
}

@Component({
  selector: 'app-event-coach',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-coach.component.html',
  styleUrls: ['./event-coach.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventCoachComponent implements DoCheck, OnDestroy {
  @Input() form: PatchableEventForm | null = null;
  @Input() isLocationRequired = true;

  state: CoachState = 'idle';
  result: EventCoachAnalysisResponse | null = null;
  errorMessage = '';
  lastAnalyzedAt: Date | null = null;
  appliedChanges: string[] = [];

  private previousAnalysis = '';
  private lastSnapshot = '';
  private readonly analyze$ = new Subject<string>();
  private readonly subscription: Subscription;

  constructor(
    private eventCoachService: EventCoachService,
    private cdr: ChangeDetectorRef
  ) {
    this.subscription = this.analyze$
      .pipe(
        debounceTime(700),
        distinctUntilChanged(),
        switchMap((snapshot) => {
          this.state = 'loading';
          this.errorMessage = '';
          this.cdr.markForCheck();
          return this.eventCoachService.analyzeEvent(this.buildPayload(JSON.parse(snapshot) as Record<string, any>));
        })
      )
      .subscribe({
        next: (result) => {
          this.result = result;
          this.previousAnalysis = result.analysis || '';
          this.state = 'ready';
          this.lastAnalyzedAt = new Date();
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.result = null;
          this.state = 'error';
          this.errorMessage = error?.error?.message || error?.message || 'Unable to analyze this event right now.';
          this.cdr.markForCheck();
        }
      });
  }

  ngDoCheck(): void {
    const formValue = this.form?.value ?? {};
    const snapshot = JSON.stringify(this.buildAnalysisSnapshot(formValue));

    if (snapshot === this.lastSnapshot) {
      return;
    }

    this.lastSnapshot = snapshot;

    if (!this.canDisplayCoach) {
      this.state = 'idle';
      this.result = null;
      this.errorMessage = '';
      this.previousAnalysis = '';
      this.appliedChanges = [];
      this.cdr.markForCheck();
      return;
    }

    this.runAnalysis();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get canDisplayCoach(): boolean {
    const formValue = this.form?.value ?? {};
    const title = this.readString(formValue['title']);
    const date = this.readString(formValue['startDate']);
    const location = this.isLocationRequired ? this.readString(formValue['location']) : 'Online Event';
    return !!title && !!date && !!location;
  }

  get readiness(): number {
    const formValue = this.form?.value ?? {};
    let score = 0;

    if (this.readString(formValue['title'])) score += 20;
    if (this.readString(formValue['description']).length >= 40) score += 20;
    if (this.readString(formValue['startDate'])) score += 20;
    if (!this.isLocationRequired || this.readString(formValue['location'])) score += 15;
    if (formValue['price'] !== null && formValue['price'] !== undefined && formValue['price'] !== '') score += 10;
    if (this.parseAnimalTypes(formValue['expectedAnimalTypesText']).length > 0) score += 15;

    return Math.min(score, 100);
  }

  get readinessLabel(): string {
    if (this.readiness >= 80) {
      return 'Strong draft';
    }
    if (this.readiness >= 50) {
      return 'Good draft';
    }
    return 'Needs more data';
  }

  refresh(): void {
    this.runAnalysis(true);
  }

  applyRecommendation(recommendation: EventCoachRecommendation): void {
    if (!this.form) {
      return;
    }

    const patch = this.mapRecommendationToPatch(recommendation);
    if (!patch) {
      return;
    }

    this.form.patchValue(patch);

    const changeSummary = `${recommendation.field} -> ${this.formatSuggestedValue(recommendation.suggested_value)}`;
    if (!this.appliedChanges.includes(changeSummary)) {
      this.appliedChanges = [...this.appliedChanges, changeSummary];
    }

    this.lastSnapshot = JSON.stringify(this.buildAnalysisSnapshot(this.form.value));
    this.runAnalysis(true);
  }

  trackRecommendation(_: number, recommendation: EventCoachRecommendation): string {
    return `${recommendation.field}-${recommendation.reason}`;
  }

  formatSuggestedValue(value: string | number | string[] | null): string {
    if (Array.isArray(value)) {
      return value.join(', ');
    }

    if (value === null || value === undefined || value === '') {
      return 'No value provided';
    }

    return String(value);
  }

  private runAnalysis(force = false): void {
    if (!this.canDisplayCoach || !this.form) {
      return;
    }

    const snapshot = JSON.stringify(this.buildAnalysisSnapshot(this.form.value));
    if (!force && snapshot === this.lastSnapshot && this.state === 'loading') {
      return;
    }

    this.lastSnapshot = snapshot;
    this.analyze$.next(snapshot);
  }

  private buildPayload(formValue: Record<string, any>): EventCoachAnalysisRequest {
    return {
      title: this.readString(formValue['title']),
      description: this.readString(formValue['description']),
      date: this.readString(formValue['startDate']) || null,
      location: this.isLocationRequired ? this.readString(formValue['location']) : 'Online Event',
      price: formValue['price'] !== null && formValue['price'] !== undefined && formValue['price'] !== '' ? Number(formValue['price']) : null,
      animalTypes: this.parseAnimalTypes(formValue['expectedAnimalTypesText']),
      maxCapacity: Number(formValue['maxParticipants']) > 0 ? Number(formValue['maxParticipants']) : 1,
      previousAnalysis: this.previousAnalysis,
      appliedChanges: this.appliedChanges
    };
  }

  private buildAnalysisSnapshot(formValue: Record<string, any>): Record<string, any> {
    return {
      title: this.readString(formValue['title']),
      description: this.readString(formValue['description']),
      startDate: this.readString(formValue['startDate']),
      location: this.isLocationRequired ? this.readString(formValue['location']) : 'Online Event',
      price: formValue['price'] ?? null,
      expectedAnimalTypesText: this.readString(formValue['expectedAnimalTypesText']),
      maxParticipants: Number(formValue['maxParticipants']) > 0 ? Number(formValue['maxParticipants']) : 1,
      appliedChangesCount: this.appliedChanges.length
    };
  }

  private mapRecommendationToPatch(recommendation: EventCoachRecommendation): Record<string, any> | null {
    const suggestedValue = recommendation.suggested_value;

    switch (recommendation.field) {
      case 'title':
        return typeof suggestedValue === 'string' ? { title: suggestedValue } : null;
      case 'description':
        return typeof suggestedValue === 'string' ? { description: suggestedValue } : null;
      case 'location':
        return typeof suggestedValue === 'string' ? { location: suggestedValue } : null;
      case 'price':
        return suggestedValue !== null && suggestedValue !== undefined && !Number.isNaN(Number(suggestedValue))
          ? { price: Number(suggestedValue) }
          : null;
      case 'animal_types':
        if (Array.isArray(suggestedValue)) {
          return { expectedAnimalTypesText: suggestedValue.join(', ') };
        }
        return typeof suggestedValue === 'string'
          ? { expectedAnimalTypesText: suggestedValue }
          : null;
      case 'date':
        return typeof suggestedValue === 'string' ? this.buildDatePatch(suggestedValue) : null;
      default:
        return null;
    }
  }

  private buildDatePatch(value: string): Record<string, any> | null {
    const suggestedDate = new Date(value);
    if (Number.isNaN(suggestedDate.getTime())) {
      return null;
    }

    const formValue = this.form?.value ?? {};
    const currentStart = this.readString(formValue['startDate']) ? new Date(formValue['startDate']) : null;
    const currentEnd = this.readString(formValue['endDate']) ? new Date(formValue['endDate']) : null;
    const durationMs =
      currentStart && currentEnd && currentEnd.getTime() > currentStart.getTime()
        ? currentEnd.getTime() - currentStart.getTime()
        : 2 * 60 * 60 * 1000;

    const nextStart = currentStart
      ? new Date(
          suggestedDate.getFullYear(),
          suggestedDate.getMonth(),
          suggestedDate.getDate(),
          currentStart.getHours(),
          currentStart.getMinutes()
        )
      : suggestedDate;

    const nextEnd = new Date(nextStart.getTime() + durationMs);

    return {
      startDate: this.toDateTimeLocal(nextStart),
      endDate: this.toDateTimeLocal(nextEnd)
    };
  }

  private parseAnimalTypes(raw: string | null | undefined): string[] {
    if (!raw) {
      return [];
    }

    return raw
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
  }

  private readString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private toDateTimeLocal(value: Date): string {
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    const hours = `${value.getHours()}`.padStart(2, '0');
    const minutes = `${value.getMinutes()}`.padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
}
