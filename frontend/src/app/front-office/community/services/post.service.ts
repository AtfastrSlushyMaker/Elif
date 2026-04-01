import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  private api = 'http://localhost:8087/elif/api/community';

  constructor(private http: HttpClient) {}

  private headers(userId?: number, actingUserId?: number): { headers?: HttpHeaders } {
    if (!userId && !actingUserId) return {};

    let headers = new HttpHeaders();
    if (userId) {
      headers = headers.set('X-User-Id', String(userId));
    }
    if (actingUserId) {
      headers = headers.set('X-Act-As-User-Id', String(actingUserId));
    }

    return { headers };
  }

  getPosts(
    communityId: number,
    sort = 'HOT',
    flairId?: number,
    type?: 'DISCUSSION' | 'QUESTION',
    userId?: number
  ): Observable<Post[]> {
    let params = new HttpParams().set('sort', sort);
    if (flairId) params = params.set('flairId', flairId);
    if (type) params = params.set('type', type);
    return this.http.get<Post[]>(`${this.api}/communities/${communityId}/posts`, {
      params,
      ...this.headers(userId)
    });
  }

  getPost(id: number, userId?: number): Observable<Post> {
    return this.http.get<Post>(`${this.api}/posts/${id}`, this.headers(userId));
  }

  getTrending(limit = 12, sort = 'HOT', userId?: number): Observable<Post[]> {
    const params = new HttpParams()
      .set('limit', String(limit))
      .set('sort', sort);
    return this.http.get<Post[]>(`${this.api}/posts/trending`, {
      params,
      ...this.headers(userId)
    });
  }

  create(communityId: number, payload: Partial<Post>, userId: number, actingUserId?: number): Observable<Post> {
    return this.http.post<Post>(`${this.api}/communities/${communityId}/posts`, payload, this.headers(userId, actingUserId));
  }

  update(postId: number, payload: Partial<Post>, userId: number): Observable<Post> {
    return this.http.put<Post>(`${this.api}/posts/${postId}`, payload, this.headers(userId));
  }

  delete(postId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/posts/${postId}`, this.headers(userId));
  }

  hardDelete(postId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/posts/${postId}/hard`, this.headers(userId));
  }

  vote(targetId: number, targetType: 'POST' | 'COMMENT', value: 1 | -1, userId: number): Observable<void> {
    return this.http.post<void>(`${this.api}/vote`, { targetId, targetType, value }, this.headers(userId));
  }

  removeVote(targetId: number, targetType: 'POST' | 'COMMENT', userId: number): Observable<void> {
    return this.http.request<void>('delete', `${this.api}/vote`, {
      ...this.headers(userId),
      body: { targetId, targetType }
    });
  }

  search(query: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.api}/posts/search`, { params: { q: query } });
  }
}
