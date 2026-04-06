import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Conversation, Message } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class MessagingService {
  private api = 'http://localhost:8087/elif/api/community/messages';
  private readonly backendHost = 'http://localhost:8087';
  private readonly backendContext = '/elif';

  constructor(private http: HttpClient) {}

  private headers(userId?: number): { headers?: HttpHeaders } {
    if (!userId) return {};
    return { headers: new HttpHeaders({ 'X-User-Id': String(userId) }) };
  }

  getInbox(userId: number): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.api}/inbox`, this.headers(userId));
  }

  getPresenceSnapshot(userId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.api}/presence`, this.headers(userId));
  }

  getMessages(id: number, userId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.api}/conversations/${id}`, this.headers(userId));
  }

  startOrGet(otherUserId: number, userId: number): Observable<Conversation> {
    return this.http.post<Conversation>(`${this.api}/conversations?otherUserId=${otherUserId}`, {}, this.headers(userId));
  }

  send(conversationId: number, content: string, userId: number): Observable<Message> {
    return this.http.post<Message>(`${this.api}/conversations/${conversationId}/send`, { content }, this.headers(userId));
  }

  sendImage(conversationId: number, file: File | null, content: string | null, userId: number, imageUrl?: string | null): Observable<Message> {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }

    const normalizedContent = (content || '').trim();
    if (normalizedContent) {
      formData.append('content', normalizedContent);
    }

    const normalizedImageUrl = (imageUrl || '').trim();
    if (normalizedImageUrl) {
      formData.append('imageUrl', normalizedImageUrl);
    }

    return this.http.post<Message>(`${this.api}/conversations/${conversationId}/send-image`, formData, this.headers(userId));
  }

  resolveMediaUrl(rawUrl?: string | null): string {
    const normalized = (rawUrl ?? '').trim();
    if (!normalized) {
      return '';
    }

    if (
      normalized.startsWith('http://') ||
      normalized.startsWith('https://') ||
      normalized.startsWith('data:') ||
      normalized.startsWith('blob:')
    ) {
      return normalized;
    }

    if (normalized.startsWith('/uploads/')) {
      return `${this.backendHost}${this.backendContext}${normalized}`;
    }

    if (normalized.startsWith('uploads/')) {
      return `${this.backendHost}${this.backendContext}/${normalized}`;
    }

    if (normalized.startsWith('/elif/')) {
      return `${this.backendHost}${normalized}`;
    }

    if (normalized.startsWith('/')) {
      return `${this.backendHost}${normalized}`;
    }

    return normalized;
  }

  markRead(conversationId: number, userId: number): Observable<void> {
    return this.http.put<void>(`${this.api}/conversations/${conversationId}/read`, {}, this.headers(userId));
  }
}
