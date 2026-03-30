import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Comment } from '../models/comment.model';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private api = 'http://localhost:8087/elif/api/community';

  constructor(private http: HttpClient) {}

  private headers(userId?: number): { headers?: HttpHeaders } {
    if (!userId) return {};
    return { headers: new HttpHeaders({ 'X-User-Id': String(userId) }) };
  }

  getTree(postId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.api}/posts/${postId}/comments`);
  }

  create(postId: number, payload: Partial<Comment>, userId: number): Observable<Comment> {
    return this.http.post<Comment>(`${this.api}/posts/${postId}/comments`, payload, this.headers(userId));
  }

  update(commentId: number, payload: Partial<Comment>, userId: number): Observable<Comment> {
    return this.http.put<Comment>(`${this.api}/comments/${commentId}`, payload, this.headers(userId));
  }

  delete(commentId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/comments/${commentId}`, this.headers(userId));
  }

  accept(commentId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.api}/comments/${commentId}/accept`, {}, this.headers(userId));
  }
}
