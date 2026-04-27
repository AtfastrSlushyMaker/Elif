// smart-event-match.component.ts — VERSION CORRIGÉE

import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EventCategory, EventSummary } from '../../models/event.models';
import { SmartEventMatchService, EnrichedMatch, StreamEvent } from '../../services/smart-event-match.service';

@Component({
  selector: 'app-smart-event-match',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './smart-event-match.component.html',
  styleUrls: ['./smart-event-match.component.css'],
})
export class SmartEventMatchComponent implements OnInit, OnDestroy {
  @Input() events: EventSummary[] = [];
  @Input() categories: EventCategory[] = [];
  @Input() categoryFilter: number | null = null;

  @Output() eventSelected = new EventEmitter<number>();

  @ViewChild('inputEl') inputEl!: ElementRef<HTMLTextAreaElement>;

  /* ── Panel state ───────────────────────────────────────────── */
  isOpen = false;

  /* ── Search state ──────────────────────────────────────────── */
  userQuery = '';
  panelState: 'idle' | 'thinking' | 'streaming' | 'done' | 'empty' | 'error' = 'idle';
  enrichedMatches: EnrichedMatch[] = [];
  summaryText = '';
  streamBuffer = '';
  errorMsg = '';
  selectedId: number | null = null;
  hasSearched = false;

  /* ── Busy / timer ──────────────────────────────────────────── */
  isBusy = false;
  elapsedMs = 0;
  private elapsedInterval: ReturnType<typeof setInterval> | null = null;
  private destroy$ = new Subject<void>();

  /* ── Thinking animation ────────────────────────────────────── */
  private thinkingPhrases = [
    'Reading through the events…',
    'Matching your profile…',
    'Checking capacity and eligibility…',
    'Ranking the best options…',
    'Almost done…',
  ];
  thinkingPhrase = this.thinkingPhrases[0];
  private thinkingIndex = 0;
  private thinkingInterval: any = null;

  /* ── Example prompts ───────────────────────────────────────── */
  readonly examples = [
    'Active Border Collie, 2 years, want agility this month',
    'Senior cat, calm environment, no competitions',
    'Beginner dog owner, socialization focus, weekends only',
    'Young energetic dog, outdoor events, advanced level',
  ];

  constructor(
    private aiService: SmartEventMatchService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopTimer();
    this.stopThinkingAnimation();
    document.body.style.overflow = '';
  }

  /* ── Toggle drawer ─────────────────────────────────────────── */
  togglePanel(): void {
    this.isOpen = !this.isOpen;
    document.body.style.overflow = this.isOpen ? 'hidden' : '';
    if (this.isOpen) {
      setTimeout(() => this.inputEl?.nativeElement?.focus(), 320);
    }
  }

  /* ── Category label ────────────────────────────────────────── */
  get selectedCategoryName(): string {
    if (this.categoryFilter == null) return 'All categories';
    return this.categories.find(c => c.id === this.categoryFilter)?.name ?? 'Filtered';
  }

  /* ── Can search ────────────────────────────────────────────── */
  get canSearch(): boolean {
    return !!this.userQuery.trim() && !this.isBusy;
  }

  /* ── Elapsed time display ──────────────────────────────────── */
  get elapsedFormatted(): string {
    const s = Math.floor(this.elapsedMs / 1000);
    const ms = Math.floor((this.elapsedMs % 1000) / 100);
    return `${s}.${ms}s`;
  }

  private startTimer(): void {
    this.elapsedMs = 0;
    this.elapsedInterval = setInterval(() => (this.elapsedMs += 100), 100);
  }

  private stopTimer(): void {
    if (this.elapsedInterval) {
      clearInterval(this.elapsedInterval);
      this.elapsedInterval = null;
    }
  }

  private startThinkingAnimation(): void {
    this.thinkingIndex = 0;
    this.thinkingPhrase = this.thinkingPhrases[0];
    
    if (this.thinkingInterval) clearInterval(this.thinkingInterval);
    this.thinkingInterval = setInterval(() => {
      this.thinkingIndex = (this.thinkingIndex + 1) % this.thinkingPhrases.length;
      this.thinkingPhrase = this.thinkingPhrases[this.thinkingIndex];
    }, 1800);
  }

  private stopThinkingAnimation(): void {
    if (this.thinkingInterval) {
      clearInterval(this.thinkingInterval);
      this.thinkingInterval = null;
    }
  }

  /* ── Search ────────────────────────────────────────────────── */
  search(): void {
    if (!this.canSearch) return;

    this.isBusy = true;
    this.panelState = 'thinking';
    this.enrichedMatches = [];
    this.summaryText = '';
    this.streamBuffer = '';
    this.errorMsg = '';
    this.selectedId = null;
    this.hasSearched = true;

    this.startTimer();
    this.startThinkingAnimation();

    this.aiService.streamMatch(this.userQuery, this.categoryFilter, 20)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event: StreamEvent) => {
          if (event.type === 'token') {
            if (this.panelState === 'thinking') {
              this.panelState = 'streaming';
              this.stopThinkingAnimation();
            }
            this.streamBuffer = event.content;
          } 
          else if (event.type === 'done') {
            this.stopTimer();
            this.isBusy = false;
            
            if (event.result) {
              this.summaryText = event.result.summary ?? '';
              
              if (!event.result.matches || event.result.matches.length === 0) {
                this.panelState = 'empty';
              } else {
                // ✅ Utilisation de enrichMatches() pour combiner événements et matchs
                this.enrichedMatches = this.aiService.enrichMatches(event.result.matches, this.events);
                this.panelState = 'done';
              }
            } else {
              this.panelState = 'empty';
            }
          }
          else if (event.type === 'error') {
            this.stopTimer();
            this.isBusy = false;
            this.panelState = 'error';
            this.errorMsg = event.content;
          }
        },
        error: (err) => {
          this.stopTimer();
          this.isBusy = false;
          this.panelState = 'error';
          this.errorMsg = 'The AI matching assistant could not complete your request right now.';
        }
      });
  }

  /* ── Reset ─────────────────────────────────────────────────── */
  reset(): void {
    this.userQuery = '';
    this.panelState = 'idle';
    this.enrichedMatches = [];
    this.summaryText = '';
    this.streamBuffer = '';
    this.errorMsg = '';
    this.selectedId = null;
    this.hasSearched = false;
    this.stopTimer();
    this.stopThinkingAnimation();
    this.elapsedMs = 0;
    setTimeout(() => this.inputEl?.nativeElement?.focus(), 50);
  }

  /* ── Keyboard shortcut ─────────────────────────────────────── */
  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.search();
    }
  }

  /* ── Auto-resize textarea ──────────────────────────────────── */
  autoResize(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  }

  /* ── Example prompt ────────────────────────────────────────── */
  useExample(example: string): void {
    this.userQuery = example;
    setTimeout(() => this.inputEl?.nativeElement?.focus(), 50);
  }

  /* ── Toggle details ────────────────────────────────────────── */
  toggleSelect(id: number): void {
    this.selectedId = this.selectedId === id ? null : id;
  }

  /* ── Open event ────────────────────────────────────────────── */
  openEvent(id: number): void {
    this.eventSelected.emit(id);
    this.isOpen = false;
    document.body.style.overflow = '';
  }

  /* ── Fill % ────────────────────────────────────────────────── */
  fillPct(event: EventSummary): number {
    if (!event.maxParticipants) return 0;
    return Math.round(((event.maxParticipants - event.remainingSlots) / event.maxParticipants) * 100);
  }

  /* ── Format date ───────────────────────────────────────────── */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  /* ── Label config ──────────────────────────────────────────── */
  labelConfig(label: string): { text: string; cls: string } {
    const map: Record<string, { text: string; cls: string }> = {
      perfect: { text: '🏆 Perfect match', cls: 'badge--perfect' },
      great:   { text: '⭐ Great match',   cls: 'badge--great' },
      good:    { text: '👍 Good match',    cls: 'badge--good' },
      maybe:   { text: '🤔 Possible',      cls: 'badge--maybe' },
    };
    return map[label] ?? { text: label, cls: 'badge--maybe' };
  }

  /* ── Track fns ─────────────────────────────────────────────── */
  trackExample(_: number, ex: string): string { return ex; }
  trackMatch(_: number, m: EnrichedMatch): number { return m.event.id; }
}
