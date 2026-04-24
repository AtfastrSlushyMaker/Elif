import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { EventCategory, EventSummary } from '../../models/event.models';
import {
  AiMatchResult,
  EventMatch,
  SmartEventMatchService,
} from '../../services/smart-event-match.service';

interface EnrichedMatch extends EventMatch {
  event: EventSummary;
}

type PanelState = 'idle' | 'thinking' | 'streaming' | 'done' | 'empty' | 'error';

const EXAMPLES = [
  'I have a 2-year-old active Border Collie, vaccinated, and I am looking for an agility competition.',
  'Golden Retriever, 5 years old, family-friendly event with no competition requirement.',
  'Spayed Siamese cat looking for an exhibition or beauty contest.',
  'Labrador with registration papers, 3 years old, ready for an official competition.',
];

@Component({
  selector: 'app-smart-event-match',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './smart-event-match.component.html',
  styleUrls: ['./smart-event-match.component.css'],
})
export class SmartEventMatchComponent implements OnDestroy {
  @Input() events: EventSummary[] = [];
  @Input() categories: EventCategory[] = [];
  @Input() categoryFilter: number | null = null;
  @Output() eventSelected = new EventEmitter<number>();

  @ViewChild('inputEl') inputEl!: ElementRef<HTMLTextAreaElement>;

  panelState: PanelState = 'idle';
  userQuery = '';
  streamBuffer = '';
  enrichedMatches: EnrichedMatch[] = [];
  summaryText = '';
  errorMsg = '';
  selectedId: number | null = null;

  elapsedSec = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private sub: Subscription | null = null;
  private phraseInterval: ReturnType<typeof setInterval> | null = null;

  readonly examples = EXAMPLES;

  private readonly thinkingPhrases = [
    'Reading the pet profile and preferences...',
    'Scanning currently available events...',
    'Checking category and eligibility rules...',
    'Ranking the best matches for this request...',
    'Preparing the final shortlist...',
  ];
  thinkingPhrase = this.thinkingPhrases[0];

  constructor(
    private matchService: SmartEventMatchService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.stopTimer();
    this.stopThinkingAnimation();
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.search();
    }
  }

  useExample(query: string): void {
    this.userQuery = query;
    this.search();
  }

  autoResize(event: Event): void {
    const element = event.target as HTMLTextAreaElement;
    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 180)}px`;
  }

  search(): void {
    const query = this.userQuery.trim();
    if (!query || query.length < 5 || this.isBusy) {
      return;
    }

    this.panelState = 'thinking';
    this.streamBuffer = '';
    this.enrichedMatches = [];
    this.summaryText = '';
    this.errorMsg = '';
    this.selectedId = null;
    this.elapsedSec = 0;
    this.startTimer();
    this.startThinkingAnimation();
    this.cdr.markForCheck();

    this.sub?.unsubscribe();
    this.sub = this.matchService.streamMatch(query, this.categoryFilter).subscribe({
      next: (streamEvent) => {
        if (streamEvent.type === 'token') {
          if (this.panelState === 'thinking') {
            this.panelState = 'streaming';
          }
        } else if (streamEvent.type === 'done' && streamEvent.result) {
          this.finalizeResults(streamEvent.result);
        } else if (streamEvent.type === 'done') {
          this.stopTimer();
          this.stopThinkingAnimation();
          this.panelState = 'error';
          this.errorMsg = 'The AI response could not be parsed.';
        } else if (streamEvent.type === 'error') {
          this.stopTimer();
          this.stopThinkingAnimation();
          this.panelState = 'error';
          this.errorMsg = streamEvent.content;
        }

        this.cdr.markForCheck();
      },
      error: (error) => {
        this.stopTimer();
        this.stopThinkingAnimation();
        this.panelState = 'error';
        this.errorMsg = error?.message ?? 'Connection error';
        this.cdr.markForCheck();
      },
    });
  }

  reset(): void {
    this.sub?.unsubscribe();
    this.panelState = 'idle';
    this.userQuery = '';
    this.streamBuffer = '';
    this.enrichedMatches = [];
    this.summaryText = '';
    this.errorMsg = '';
    this.selectedId = null;
    this.stopTimer();
    this.stopThinkingAnimation();
    this.cdr.markForCheck();
  }

  toggleSelect(id: number): void {
    this.selectedId = this.selectedId === id ? null : id;
    this.cdr.markForCheck();
  }

  openEvent(id: number): void {
    this.eventSelected.emit(id);
  }

  get elapsedFormatted(): string {
    return this.elapsedSec < 60
      ? `${this.elapsedSec}s`
      : `${Math.floor(this.elapsedSec / 60)}m ${this.elapsedSec % 60}s`;
  }

  get canSearch(): boolean {
    return this.userQuery.trim().length >= 5 && !this.isBusy;
  }

  get isBusy(): boolean {
    return this.panelState === 'thinking' || this.panelState === 'streaming';
  }

  get selectedCategoryName(): string {
    if (this.categoryFilter == null) {
      return 'All categories';
    }

    return this.categories.find((category) => category.id === this.categoryFilter)?.name ?? 'Filtered';
  }

  labelConfig(label: string): { text: string; cls: string } {
    const labels: Record<string, { text: string; cls: string }> = {
      perfect: { text: 'Perfect match', cls: 'badge--perfect' },
      great: { text: 'Great match', cls: 'badge--great' },
      good: { text: 'Good match', cls: 'badge--good' },
      maybe: { text: 'Possible fit', cls: 'badge--maybe' },
    };

    return labels[label] ?? labels['maybe'];
  }

  fillPct(event: EventSummary): number {
    if (!event.maxParticipants) {
      return 0;
    }

    return Math.round(((event.maxParticipants - event.remainingSlots) / event.maxParticipants) * 100);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  trackMatch(_: number, match: EnrichedMatch): number {
    return match.event.id;
  }

  trackExample(_: number, example: string): string {
    return example;
  }

  private finalizeResults(result: AiMatchResult): void {
    this.stopTimer();
    this.stopThinkingAnimation();
    this.summaryText = result.summary ?? '';

    this.enrichedMatches = (result.matches ?? [])
      .map((match) => {
        const event = this.events.find((item) => item.id === match.eventId);
        return event ? ({ ...match, event } as EnrichedMatch) : null;
      })
      .filter((match): match is EnrichedMatch => match !== null)
      .sort((a, b) => b.score - a.score);

    this.panelState = this.enrichedMatches.length > 0 ? 'done' : 'empty';

    if (this.panelState === 'empty' && result.noMatchReason) {
      this.summaryText = result.noMatchReason;
    }
  }

  private startThinkingAnimation(): void {
    this.stopThinkingAnimation();
    let index = 0;
    this.thinkingPhrase = this.thinkingPhrases[0];
    this.phraseInterval = setInterval(() => {
      index = (index + 1) % this.thinkingPhrases.length;
      this.thinkingPhrase = this.thinkingPhrases[index];
      this.cdr.markForCheck();
    }, 1800);
  }

  private stopThinkingAnimation(): void {
    if (this.phraseInterval) {
      clearInterval(this.phraseInterval);
      this.phraseInterval = null;
    }
  }

  private startTimer(): void {
    this.stopTimer();
    this.timer = setInterval(() => {
      this.elapsedSec += 1;
      this.cdr.markForCheck();
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
