import { AfterViewChecked, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Message } from '../../models/message.model';
import { MessagingService } from '../../services/messaging.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css'
})
export class ChatWindowComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;

  conversationId = 0;
  messages: Message[] = [];
  draft = '';
  loading = true;
  error = '';
  get userId(): number | undefined { return this.auth.getCurrentUser()?.id; }
  private shouldScrollToBottom = false;

  constructor(
    private route: ActivatedRoute,
    private messagingService: MessagingService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.conversationId = Number(this.route.snapshot.paramMap.get('conversationId'));
    this.loadMessages();
  }

  ngAfterViewChecked(): void {
    if (!this.shouldScrollToBottom || !this.messagesContainer) return;
    this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    this.shouldScrollToBottom = false;
  }

  loadMessages(): void {
    const userId = this.userId;
    if (!userId) return;

    this.messagingService.getMessages(this.conversationId, userId).subscribe({
      next: (data) => {
        this.messages = data;
        this.loading = false;
        this.shouldScrollToBottom = true;
      },
      error: () => {
        this.error = 'Unable to load chat.';
        this.loading = false;
      }
    });
  }

  send(): void {
    const userId = this.userId;
    if (!this.draft.trim() || !userId) return;

    const content = this.draft;
    this.draft = '';
    this.messagingService.send(this.conversationId, content, userId).subscribe({
      next: (message) => {
        this.messages = [...this.messages, message];
        this.shouldScrollToBottom = true;
      },
      error: () => {
        this.error = 'Message failed to send.';
        this.draft = content;
      }
    });
  }
}
