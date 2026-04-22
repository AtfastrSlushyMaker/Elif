// smart-event-match.component.ts — VERSION AMÉLIORÉE
//
// FIXES + AMÉLIORATIONS :
//  1. streamBuffer ne montre plus le JSON brut — affiche un message propre
//  2. Meilleur état "thinking" avec animation
//  3. Ajout de la gestion du noMatchReason
//  4. Score ring animé avec couleur dynamique

import {
  Component, Input, Output, EventEmitter, OnDestroy,
  ChangeDetectionStrategy, ChangeDetectorRef, ElementRef, ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { EventSummary, EventCategory } from '../../models/event.models';
import {
  SmartEventMatchService,
  AiMatchResult,
  EventMatch
} from '../../services/smart-event-match.service';

interface EnrichedMatch extends EventMatch {
  event: EventSummary;
}

type PanelState = 'idle' | 'thinking' | 'streaming' | 'done' | 'empty' | 'error';

const EXAMPLES = [
  "I have a 2-year-old active Border Collie, vaccinated. Looking for agility competition.",
  "Golden Retriever male, 5 years old, 30kg. Family event, not competition.",
  "Siamese cat female, spayed. Exhibition or beauty contest.",
  "Labrador with LOF certificate, 3 years old. Ready for official competition.",
];

@Component({
  selector: 'app-smart-event-match',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './smart-event-match.component.html',
  styleUrls: ['./smart-event-match.component.css']
})
export class SmartEventMatchComponent implements OnDestroy {

  @Input() events: EventSummary[] = [];
  @Input() categories: EventCategory[] = [];
  @Input() categoryFilter: number | null = null;
  @Output() eventSelected = new EventEmitter<number>();

  @ViewChild('inputEl') inputEl!: ElementRef<HTMLTextAreaElement>;

  panelState: PanelState = 'idle';
  userQuery = '';
  // ✅ FIX : streamBuffer affiche un message de progression, pas le JSON brut
  streamBuffer = '';
  enrichedMatches: EnrichedMatch[] = [];
  summaryText = '';
  errorMsg = '';
  selectedId: number | null = null;

  elapsedSec = 0;
  private timer: any = null;
  private sub: Subscription | null = null;

  readonly examples = EXAMPLES;

  // Phrases de progression affichées pendant l'analyse
  private readonly thinkingPhrases = [
    "Reading your pet's description...",
    "Scanning available events...",
    "Analyzing eligibility criteria...",
    "Ranking events by match quality...",
    "Preparing your personalized shortlist..."
  ];
  thinkingPhrase = this.thinkingPhrases[0];
  private phraseInterval: any = null;

  constructor(
    private matchService: SmartEventMatchService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.stopTimer();
    clearInterval(this.phraseInterval);
  }

  onEnter(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.search();
    }
  }

  useExample(q: string): void {
    this.userQuery = q;
    this.search();
  }

  autoResize(e: Event): void {
    const el = e.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  search(): void {
    const q = this.userQuery.trim();
    if (!q || q.length < 5 || this.isBusy) return;

    this.panelState     = 'thinking';
    // ✅ FIX : streamBuffer contient un message lisible, pas du JSON
    this.streamBuffer   = '';
    this.enrichedMatches = [];
    this.summaryText    = '';
    this.errorMsg       = '';
    this.selectedId     = null;
    this.elapsedSec     = 0;
    this.startTimer();
    this.startThinkingAnimation();
    this.cdr.markForCheck();

    this.sub?.unsubscribe();
    this.sub = this.matchService
      .streamMatch(q, this.categoryFilter)
      .subscribe({
        next: event => {
          if (event.type === 'token') {
            // ✅ FIX : on n'affiche PAS le content brut (c'est "Analyzing...")
            // Le streamBuffer affiche la phrase de thinking animée
            if (this.panelState === 'thinking') this.panelState = 'streaming';
          } else if (event.type === 'done' && event.result) {
            this.finalizeResults(event.result);
          } else if (event.type === 'done' && !event.result) {
            // Chunk "done" sans result → erreur de parsing déjà loggée
            this.stopTimer();
            this.panelState = 'error';
            this.errorMsg = 'The AI returned an invalid response. Please try again.';
          } else if (event.type === 'error') {
            this.stopTimer();
            clearInterval(this.phraseInterval);
            this.panelState = 'error';
            this.errorMsg = event.content;
          }
          this.cdr.markForCheck();
        },
        error: err => {
          this.stopTimer();
          clearInterval(this.phraseInterval);
          this.panelState = 'error';
          this.errorMsg = err?.message ?? 'Connection error';
          this.cdr.markForCheck();
        }
      });
  }

  reset(): void {
    this.sub?.unsubscribe();
    this.panelState    = 'idle';
    this.userQuery     = '';
    this.streamBuffer  = '';
    this.enrichedMatches = [];
    this.summaryText   = '';
    this.selectedId    = null;
    this.stopTimer();
    clearInterval(this.phraseInterval);
    this.cdr.markForCheck();
  }

  private finalizeResults(result: AiMatchResult): void {
    this.stopTimer();
    clearInterval(this.phraseInterval);
    this.summaryText = result.summary ?? '';

    this.enrichedMatches = (result.matches ?? [])
      .map(m => {
        const ev = this.events.find(e => e.id === m.eventId);
        if (!ev) return null;
        return { ...m, event: ev } as EnrichedMatch;
      })
      .filter((m): m is EnrichedMatch => m !== null)
      .sort((a, b) => b.score - a.score);

    this.panelState = this.enrichedMatches.length > 0 ? 'done' : 'empty';
    if (this.panelState === 'empty' && result.noMatchReason) {
      this.summaryText = result.noMatchReason;
    }
  }

  private startThinkingAnimation(): void {
    clearInterval(this.phraseInterval);
    let i = 0;
    this.thinkingPhrase = this.thinkingPhrases[0];
    this.phraseInterval = setInterval(() => {
      i = (i + 1) % this.thinkingPhrases.length;
      this.thinkingPhrase = this.thinkingPhrases[i];
      this.cdr.markForCheck();
    }, 1800);
  }

  // ── UI helpers ────────────────────────────────────────────────

  toggleSelect(id: number): void {
    this.selectedId = this.selectedId === id ? null : id;
    this.cdr.markForCheck();
  }

  openEvent(id: number): void { this.eventSelected.emit(id); }

  private startTimer(): void {
    this.stopTimer();
    this.timer = setInterval(() => { this.elapsedSec++; this.cdr.markForCheck(); }, 1000);
  }

  private stopTimer(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
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
    if (this.categoryFilter == null) return 'All categories';
    return this.categories.find(c => c.id === this.categoryFilter)?.name ?? 'Filtered';
  }

  labelConfig(label: string): { text: string; cls: string } {
    const map: Record<string, { text: string; cls: string }> = {
      perfect: { text: '✨ Perfect match', cls: 'badge--perfect' },
      great:   { text: '⭐ Great match',   cls: 'badge--great'   },
      good:    { text: '👍 Good match',    cls: 'badge--good'    },
      maybe:   { text: '🔍 Possible',      cls: 'badge--maybe'   }
    };
    return map[label] ?? map['maybe'];
  }

  scoreColor(score: number): string {
    if (score >= 85) return '#1d9e75';
    if (score >= 70) return '#f97316';
    if (score >= 50) return '#3b82f6';
    return '#94a3b8';
  }

  fillPct(e: EventSummary): number {
    if (!e.maxParticipants) return 0;
    return Math.round(((e.maxParticipants - e.remainingSlots) / e.maxParticipants) * 100);
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US',
      { day: '2-digit', month: 'short', year: 'numeric' });
  }

  trackMatch(_: number, m: EnrichedMatch): number { return m.event.id; }
  trackExample(_: number, q: string): string { return q; }
}