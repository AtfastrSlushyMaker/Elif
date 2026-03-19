import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Conversation, Message } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class MessagingService {
  private api = 'http://localhost:8087/elif/api/community/messages';

  constructor(private http: HttpClient) {}

  private headers(userId?: number): { headers?: HttpHeaders } {
    if (!userId) return {};
    return { headers: new HttpHeaders({ 'X-User-Id': String(userId) }) };
  }

  getInbox(userId: number): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(`${this.api}/inbox`, this.headers(userId));
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

  markRead(conversationId: number, userId: number): Observable<void> {
    return this.http.put<void>(`${this.api}/conversations/${conversationId}/read`, {}, this.headers(userId));
  }
}
