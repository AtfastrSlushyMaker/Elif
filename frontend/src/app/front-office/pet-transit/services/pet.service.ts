import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

export interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  weight: number;
  photoUrl?: string;
  gender: string;
  dateOfBirth?: string;
}

@Injectable({ providedIn: 'root' })
export class PetService {
  private readonly apiUrl = 'http://localhost:8087/elif/api/user-pets';

  constructor(private readonly http: HttpClient) {}

  getMyPets(): Observable<Pet[]> {
    return this.http.get<unknown[]>(this.apiUrl, { headers: this.userHeaders() }).pipe(
      map((payload) => (payload ?? []).map((item) => this.normalizePet(item))),
      catchError((error) => {
        const message = this.extractErrorMessage(error);
        return throwError(() => new Error(message));
      })
    );
  }

  private userHeaders(): HttpHeaders {
    return new HttpHeaders({ 'X-User-Id': this.getCurrentUserId() });
  }

  private getCurrentUserId(): string {
    const raw = localStorage.getItem('userId');
    const normalized = String(raw ?? '').trim();
    return normalized;
  }

  private normalizePet(value: unknown): Pet {
    const payload = (value ?? {}) as Record<string, unknown>;

    return {
      id: this.toNumber(payload['id']),
      name: this.toText(payload['name'], 'Unnamed Pet'),
      species: this.toText(payload['species'], 'UNKNOWN'),
      breed: this.toText(payload['breed'], 'Unknown breed'),
      weight: this.toNumber(payload['weight']),
      photoUrl: this.toOptionalText(payload['photoUrl']),
      gender: this.toText(payload['gender'], 'Unknown'),
      dateOfBirth: this.toOptionalText(payload['dateOfBirth'])
    };
  }

  private toNumber(value: unknown): number {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return 0;
    }
    return parsed;
  }

  private toText(value: unknown, fallback = ''): string {
    const normalized = String(value ?? '').trim();
    return normalized || fallback;
  }

  private toOptionalText(value: unknown): string | undefined {
    const normalized = String(value ?? '').trim();
    return normalized || undefined;
  }

  private extractErrorMessage(error: unknown): string {
    const fallback = 'Unable to load pet profiles right now. Please try again.';
    if (!error || typeof error !== 'object') {
      return fallback;
    }

    const payload = error as { error?: unknown; message?: string; status?: number };
    if (payload.status === 0) {
      return 'Unable to reach pet profile service. Please check your connection.';
    }

    if (typeof payload.error === 'string' && payload.error.trim()) {
      return payload.error.trim();
    }

    if (payload.error && typeof payload.error === 'object') {
      const objectPayload = payload.error as Record<string, unknown>;
      const message = String(objectPayload['message'] ?? objectPayload['error'] ?? '').trim();
      if (message) {
        return message;
      }
    }

    if (typeof payload.message === 'string' && payload.message.trim()) {
      return payload.message.trim();
    }

    return fallback;
  }
}
