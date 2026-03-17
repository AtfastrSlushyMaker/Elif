import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Message } from '../../models/message.model';
import { MessagingService } from '../../services/messaging.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css'
})
export class ChatWindowComponent implements OnInit {
  conversationId = 0;
  messages: Message[] = [];
  draft = '';
  loading = true;
  error = '';
  get userId(): number { return this.auth.getCurrentUser()!.id; }

  constructor(private route: ActivatedRoute, private messagingService: MessagingService, private auth: AuthService) {}

  ngOnInit(): void {
    this.conversationId = Number(this.route.snapshot.paramMap.get('conversationId'));
    this.loadMessages();
  }

  loadMessages(): void {
    this.messagingService.getMessages(this.conversationId, this.userId).subscribe({
      next: (data) => {
        this.messages = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load chat.';
        this.loading = false;
      }
    });
  }

  send(): void {
    if (!this.draft.trim()) return;
    const content = this.draft;
    this.draft = '';
    this.messagingService.send(this.conversationId, content, this.userId).subscribe({
      next: (message) => this.messages.push(message),
      error: () => {
        this.error = 'Message failed to send.';
        this.draft = content;
      }
    });
  }
}
