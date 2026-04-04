import { AfterViewChecked, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Conversation, Message } from '../../models/message.model';
import { CommunityRealtimeService } from '../../services/community-realtime.service';
import { MessagingService } from '../../services/messaging.service';
import { AuthService } from '../../../../auth/auth.service';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css'
})
export class ChatWindowComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('imageInput') imageInput?: ElementRef<HTMLInputElement>;

  conversationId = 0;
  messages: Message[] = [];
  draft = '';
  loading = true;
  error = '';
  counterpartName = 'Conversation';
  counterpartUserId: number | null = null;
  counterpartOnline = false;
  counterpartTyping = false;
  selectedImageFile: File | null = null;
  selectedImagePreviewUrl: string | null = null;
  sendingImage = false;
  selectedAttachmentPreviewUrl: string | null = null;

  get userId(): number | undefined { return this.auth.getCurrentUser()?.id; }

  private shouldScrollToBottom = false;
  private typingStopTimer?: number;
  private typingSubscribed = false;
  private messagesSubscribed = false;
  private typingUnsubscribe?: () => void;
  private messagesUnsubscribe?: () => void;
  private presenceSubscription?: Subscription;
  private onlineUserIds = new Set<number>();

  constructor(
    private route: ActivatedRoute,
    private messagingService: MessagingService,
    private communityRealtimeService: CommunityRealtimeService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.conversationId = Number(this.route.snapshot.paramMap.get('conversationId'));
    this.communityRealtimeService.connect(this.userId);
    this.setupRealtimeSubscriptions();
    this.wirePresence();
    this.loadConversationMeta();
    this.loadMessages();
  }

  ngOnDestroy(): void {
    if (this.typingStopTimer) {
      window.clearTimeout(this.typingStopTimer);
    }
    this.typingUnsubscribe?.();
    this.messagesUnsubscribe?.();
    this.presenceSubscription?.unsubscribe();
    this.revokeSelectedImagePreview();
  }

  ngAfterViewChecked(): void {
    if (!this.shouldScrollToBottom) return;
    this.scrollToBottomNow();
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
        this.scheduleScrollToBottom();
        this.messagingService.markRead(this.conversationId, userId).subscribe({
          error: () => {
            // Keep chat usable even if read status update fails.
          }
        });
      },
      error: () => {
        this.error = 'Unable to load chat.';
        this.loading = false;
      }
    });
  }

  send(): void {
    const userId = this.userId;
    const text = this.draft.trim();
    if ((!text && !this.selectedImageFile) || !userId) return;

    if (this.selectedImageFile) {
      this.sendWithImage(userId, text || null);
      return;
    }

    const content = this.draft;
    this.draft = '';
    this.publishTyping(false);

    this.messagingService.send(this.conversationId, content, userId).subscribe({
      next: (message) => {
        this.pushMessageIfMissing(message);
        this.shouldScrollToBottom = true;
        this.scheduleScrollToBottom();
      },
      error: () => {
        this.error = 'Message failed to send.';
        this.draft = content;
      }
    });
  }

  triggerImagePicker(): void {
    this.imageInput?.nativeElement.click();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.error = 'Only image files are allowed.';
      this.clearSelectedImage();
      return;
    }

    this.selectedImageFile = file;
    this.revokeSelectedImagePreview();
    this.selectedImagePreviewUrl = URL.createObjectURL(file);
    this.error = '';
  }

  clearSelectedImage(): void {
    this.selectedImageFile = null;
    this.revokeSelectedImagePreview();
    if (this.imageInput?.nativeElement) {
      this.imageInput.nativeElement.value = '';
    }
  }

  attachmentUrl(fileUrl?: string): string {
    const resolved = this.messagingService.resolveMediaUrl(fileUrl);
    if (!resolved || !resolved.includes('/attachments/')) {
      return resolved;
    }

    const userId = this.userId;
    if (!userId) {
      return resolved;
    }

    const separator = resolved.includes('?') ? '&' : '?';
    return `${resolved}${separator}userId=${userId}`;
  }

  openAttachmentPreview(fileUrl?: string): void {
    const resolvedUrl = this.attachmentUrl(fileUrl);
    if (!resolvedUrl) {
      return;
    }
    this.selectedAttachmentPreviewUrl = resolvedUrl;
  }

  closeAttachmentPreview(): void {
    this.selectedAttachmentPreviewUrl = null;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAttachmentPreview();
  }

  onDraftInput(): void {
    if (!this.userId || !this.conversationId) {
      return;
    }

    const hasText = this.draft.trim().length > 0;
    this.publishTyping(hasText);

    if (this.typingStopTimer) {
      window.clearTimeout(this.typingStopTimer);
    }

    if (!hasText) {
      return;
    }

    this.typingStopTimer = window.setTimeout(() => {
      this.publishTyping(false);
    }, 1300);
  }

  private publishTyping(typing: boolean): void {
    this.communityRealtimeService.publishTyping(this.conversationId, typing);
  }

  private wirePresence(): void {
    const userId = this.userId;
    if (!userId) {
      return;
    }

    this.messagingService.getPresenceSnapshot(userId).pipe(
      catchError(() => of([] as number[]))
    ).subscribe((onlineIds) => {
      this.onlineUserIds = new Set(onlineIds);
      this.syncCounterpartOnlineFlag();
    });

    this.presenceSubscription = this.communityRealtimeService.observePresence().subscribe((event) => {
      const counterpartId = this.counterpartUserId;
      if (!counterpartId || event.userId !== counterpartId) {
        return;
      }
      this.counterpartOnline = event.online;

      if (event.online) {
        this.onlineUserIds.add(event.userId);
      } else {
        this.onlineUserIds.delete(event.userId);
      }
    });
  }

  private loadConversationMeta(): void {
    const userId = this.userId;
    if (!userId) {
      return;
    }

    this.messagingService.getInbox(userId).pipe(
      catchError(() => of([] as Conversation[]))
    ).subscribe((conversations: Conversation[]) => {
      const current = conversations.find((conversation) => conversation.id === this.conversationId);
      if (!current) {
        return;
      }

      this.counterpartName = current.counterpartName || 'Conversation';
      this.counterpartUserId = current.participantOneId === userId ? current.participantTwoId : current.participantOneId;
      this.syncCounterpartOnlineFlag();
    });
  }

  private syncCounterpartOnlineFlag(): void {
    this.counterpartOnline = this.counterpartUserId !== null && this.onlineUserIds.has(this.counterpartUserId);
  }

  private setupRealtimeSubscriptions(): void {
    if (!this.typingSubscribed) {
      this.typingUnsubscribe = this.communityRealtimeService.subscribeToConversationTyping(this.conversationId, (event) => {
        if (event.senderId === this.userId) {
          return;
        }
        this.counterpartTyping = event.typing;
      });
      this.typingSubscribed = true;
    }

    if (!this.messagesSubscribed) {
      this.messagesUnsubscribe = this.communityRealtimeService.subscribeToConversationMessages(this.conversationId, (message) => {
        this.pushMessageIfMissing(message);
        this.shouldScrollToBottom = true;
        this.scheduleScrollToBottom();
      });
      this.messagesSubscribed = true;
    }
  }

  private pushMessageIfMissing(message: Message): void {
    const exists = this.messages.some((current) => current.id === message.id);
    if (exists) {
      return;
    }
    this.messages = [...this.messages, message]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  private sendWithImage(userId: number, content: string | null): void {
    if (!this.selectedImageFile) {
      return;
    }

    const file = this.selectedImageFile;
    this.sendingImage = true;
    this.publishTyping(false);

    this.messagingService.sendImage(this.conversationId, file, content, userId).subscribe({
      next: (message) => {
        this.pushMessageIfMissing(message);
        this.shouldScrollToBottom = true;
        this.sendingImage = false;
        this.clearSelectedImage();
        this.draft = '';
      },
      error: () => {
        this.error = 'Image failed to send.';
        this.sendingImage = false;
      }
    });
  }

  private revokeSelectedImagePreview(): void {
    if (this.selectedImagePreviewUrl) {
      URL.revokeObjectURL(this.selectedImagePreviewUrl);
    }
    this.selectedImagePreviewUrl = null;
  }

  private scheduleScrollToBottom(): void {
    window.setTimeout(() => this.scrollToBottomNow(), 0);
  }

  private scrollToBottomNow(): void {
    if (!this.messagesContainer) {
      return;
    }
    const container = this.messagesContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }
}
