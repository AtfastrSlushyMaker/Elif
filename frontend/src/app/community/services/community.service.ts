import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Community, CommunityMember, CommunityRule, Flair } from '../models/community.model';

@Injectable({ providedIn: 'root' })
export class CommunityService {
  private api = 'http://localhost:8087/elif/api/community';

  constructor(private http: HttpClient) {}

  private headers(userId?: number): { headers?: HttpHeaders } {
    if (!userId) return {};
    return { headers: new HttpHeaders({ 'X-User-Id': String(userId) }) };
  }

  getAll(userId?: number): Observable<Community[]> {
    return this.http.get<Community[]>(`${this.api}/communities`, this.headers(userId));
  }

  getBySlug(slug: string, userId?: number): Observable<Community> {
    return this.http.get<Community>(`${this.api}/communities/${slug}`, this.headers(userId));
  }

  create(payload: Partial<Community>, userId: number): Observable<Community> {
    return this.http.post<Community>(`${this.api}/communities`, payload, this.headers(userId));
  }

  update(id: number, payload: Partial<Community>, userId: number): Observable<Community> {
    return this.http.put<Community>(`${this.api}/communities/${id}`, payload, this.headers(userId));
  }

  join(id: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.api}/communities/${id}/join`, {}, this.headers(userId));
  }

  leave(id: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.api}/communities/${id}/leave`, {}, this.headers(userId));
  }

  getRules(id: number): Observable<CommunityRule[]> {
    return this.http.get<CommunityRule[]>(`${this.api}/communities/${id}/rules`);
  }

  getFlairs(id: number): Observable<Flair[]> {
    return this.http.get<Flair[]>(`${this.api}/communities/${id}/flairs`);
  }

  addFlair(id: number, payload: Partial<Flair>, userId: number): Observable<Flair> {
    return this.http.post<Flair>(`${this.api}/communities/${id}/flairs`, payload, this.headers(userId));
  }

  deleteFlair(id: number, flairId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/communities/${id}/flairs/${flairId}`, this.headers(userId));
  }

  getMembers(id: number, userId: number): Observable<CommunityMember[]> {
    return this.http.get<CommunityMember[]>(`${this.api}/communities/${id}/members`, this.headers(userId));
  }
}
