// smart-event-match.service.ts — VERSION CORRIGÉE AVEC ENRICHEDMATCH
//
// BUG CORRIGÉ :
//   - Ajout de l'interface EnrichedMatch manquante
//   - Le service parsait JSON.parse(parsed.content) sur le chunk "done"
//   - mais le backend envoyait content="" (vide) → SyntaxError silencieuse
//   - subject.next jamais émis avec result → panelState restait "streaming"
//
//   FIX : Le backend envoie maintenant le JSON dans le chunk "done".
//   En plus : on accumule les tokens pour afficher le streamBuffer,
//   et on parse le JSON au moment du "done" avec gestion d'erreur.

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { EventSummary } from '../models/event.models';

export interface EventMatch {
  eventId:         number;
  score:           number;
  label:           'perfect' | 'great' | 'good' | 'maybe';
  reason:          string;
  eligible:        boolean;
  eligibilityNote?: string;
}

export interface AiMatchResult {
  summary:         string;
  matches:         EventMatch[];
  noMatchReason?:  string;
}

export interface StreamEvent {
  type:    'token' | 'done' | 'error';
  content: string;
  result?: AiMatchResult;
}

// ✅ INTERFACE ENRICHEDMATCH AJOUTÉE
export interface EnrichedMatch {
  event: EventSummary;
  match: EventMatch;
}

@Injectable({ providedIn: 'root' })
export class SmartEventMatchService {

  private readonly BASE = 'http://localhost:8087/elif/api/events/ai/smart-match';

  /**
   * Enrichit les matchs avec les détails complets des événements
   */
  enrichMatches(matches: EventMatch[], events: EventSummary[]): EnrichedMatch[] {
    return matches
      .map(match => {
        const event = events.find(e => e.id === match.eventId);
        return event ? { event, match } : null;
      })
      .filter((item): item is EnrichedMatch => item !== null);
  }

  streamMatch(
    query: string,
    categoryId?: number | null,
    maxEvents = 20
  ): Observable<StreamEvent> {
    const subject = new Subject<StreamEvent>();
    this.fetchStream(query, categoryId, maxEvents, subject);
    return subject.asObservable();
  }

  private async fetchStream(
    query: string,
    categoryId: number | null | undefined,
    maxEvents: number,
    subject: Subject<StreamEvent>
  ): Promise<void> {

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      subject.next({ type: 'error', content: 'Request timed out after 30 seconds.' });
      subject.complete();
    }, 30_000);

    try {
      const response = await fetch(`${this.BASE}/stream`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ query, categoryId: categoryId ?? null, maxEvents }),
        signal:  controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errText = await response.text().catch(() => response.statusText);
        subject.next({ type: 'error', content: `Server error ${response.status}: ${errText}` });
        subject.complete();
        return;
      }

      const reader  = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        subject.next({ type: 'error', content: 'No response body from server.' });
        subject.complete();
        return;
      }

      let buffer = '';
      let accumulatedResult = ''; // ✅ Accumuler les tokens pour affichage

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;

          const jsonStr = line.substring(5).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;

          try {
            const parsed: { type: string; content: string } = JSON.parse(jsonStr);

            if (parsed.type === 'token') {
              // ✅ Token de progression → affiché dans streamBuffer
              accumulatedResult += parsed.content;
              subject.next({ type: 'token', content: accumulatedResult });

            } else if (parsed.type === 'done') {
              // ✅ FIX PRINCIPAL : le JSON complet est dans parsed.content
              const rawJson = parsed.content?.trim();

              if (!rawJson) {
                // Essayons d'utiliser accumulatedResult comme fallback
                if (accumulatedResult) {
                  try {
                    const result: AiMatchResult = JSON.parse(accumulatedResult);
                    subject.next({ type: 'done', content: accumulatedResult, result });
                    subject.complete();
                    return;
                  } catch (fallbackErr) {
                    console.error('Fallback parse also failed:', fallbackErr);
                  }
                }
                
                subject.next({ type: 'error', content: 'Empty result from AI service.' });
                subject.complete();
                return;
              }

              try {
                const result: AiMatchResult = JSON.parse(rawJson);
                subject.next({ type: 'done', content: rawJson, result });
                subject.complete();
                return;
              } catch (parseErr) {
                console.error('Failed to parse AI result JSON:', rawJson, parseErr);
                
                // ✅ Dernier essai : parser accumulatedResult
                if (accumulatedResult) {
                  try {
                    const result: AiMatchResult = JSON.parse(accumulatedResult);
                    subject.next({ type: 'done', content: accumulatedResult, result });
                    subject.complete();
                    return;
                  } catch (lastErr) {
                    console.error('Final parse attempt failed:', lastErr);
                  }
                }
                
                subject.next({ type: 'error', content: 'Invalid JSON from AI service.' });
                subject.complete();
                return;
              }

            } else if (parsed.type === 'error') {
              subject.next({ type: 'error', content: parsed.content });
              subject.complete();
              return;
            }

          } catch (parseLineErr) {
            // Chunk SSE partiel → ignorer, continuer à accumuler
            console.debug('Partial SSE chunk, continuing...', parseLineErr);
          }
        }
      }

      // ✅ Si on arrive ici sans avoir reçu 'done', c'est une erreur
      if (accumulatedResult) {
        try {
          const result: AiMatchResult = JSON.parse(accumulatedResult);
          subject.next({ type: 'done', content: accumulatedResult, result });
          subject.complete();
          return;
        } catch (finalErr) {
          console.error('Stream ended without proper done event:', finalErr);
          subject.next({ type: 'error', content: 'Incomplete response from server.' });
          subject.complete();
          return;
        }
      }

      subject.complete();

    } catch (error: any) {
      clearTimeout(timeout);
      if (error?.name === 'AbortError') {
        subject.next({ type: 'error', content: 'Request was cancelled.' });
        subject.complete();
        return;
      }
      subject.next({
        type: 'error',
        content: error?.message?.includes('Failed to fetch')
          ? 'Cannot reach server. Make sure the backend is running on port 8087.'
          : (error?.message || 'Network error')
      });
      subject.complete();
    }
  }
}