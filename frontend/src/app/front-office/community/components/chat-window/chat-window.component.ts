import { AfterViewChecked, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Conversation, Message } from '../../models/message.model';
import { CommunityRealtimeService } from '../../services/community-realtime.service';
import { GifResult } from '../../services/gif.service';
import { ChatDirectoryUser, MessagingService } from '../../services/messaging.service';
import { SeenEvent } from '../../models/realtime.model';
import { AuthService } from '../../../../auth/auth.service';
import { GifPickerDialogComponent } from '../gif-picker-dialog/gif-picker-dialog.component';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.css'
})
export class ChatWindowComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('imageInput') imageInput?: ElementRef<HTMLInputElement>;

  private static readonly MAX_IMAGE_BYTES = 10 * 1024 * 1024;

  conversationId = 0;
  messages: Message[] = [];
  draft = '';
  loading = true;
  error = '';
  composerError = '';
  counterpartName = 'Conversation';
  counterpartUserId: number | null = null;
  counterpartOnline = false;
  counterpartTyping = false;
  counterpartRoleLabel = '';
  counterpartProfileSnippet = '';
  get counterpartSnippet(): string {
    return this.counterpartProfileSnippet;
  }
  selectedImageFile: File | null = null;
  selectedImagePreviewUrl: string | null = null;
  selectedGif: GifResult | null = null;
  sendingImage = false;
  uploadProgress = 0;
  selectedAttachmentPreviewUrl: string | null = null;
  showScrollToBottom = false;
  editingMessageId: number | null = null;
  editingMessageOriginal = '';
  replyingToMessage: Message | null = null;
  senderProfiles = new Map<number, ChatDirectoryUser>();
  get userId(): number | undefined { return this.auth.getCurrentUser()?.id; }

  private shouldScrollToBottom = false;
  private typingStopTimer?: number;
  private typingSubscribed = false;
  private messagesSubscribed = false;
  private seenSubscribed = false;
  private typingUnsubscribe?: () => void;
  private messagesUnsubscribe?: () => void;
  private seenUnsubscribe?: () => void;
  private presenceSubscription?: Subscription;
  private onlineUserIds = new Set<number>();

  constructor(
    private route: ActivatedRoute,
    private messagingService: MessagingService,
    private communityRealtimeService: CommunityRealtimeService,
    private dialog: MatDialog,
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
    this.loadUserDirectory();
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
    this.seenUnsubscribe?.();
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
        this.messages = data.map((message) => this.normalizeMessage(message));
        this.loading = false;
        this.shouldScrollToBottom = true;
        this.scheduleScrollToBottom();
        window.setTimeout(() => this.updateScrollCtaVisibility(), 0);
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
    if ((!text && !this.selectedImageFile && !this.selectedGif) || !userId) return;

    if (this.editingMessageId !== null) {
      this.saveEditedMessage(userId, text);
      return;
    }

    if (this.selectedImageFile) {
      this.sendWithImage(userId, text || null);
      return;
    }

    if (this.selectedGif) {
      this.sendGif(userId, text || null);
      return;
    }

    const content = this.buildOutgoingContent(text);
    const replyToMessageId = this.replyingToMessage?.id ?? null;
    this.draft = '';
    this.publishTyping(false);
    this.composerError = '';

    this.messagingService.send(this.conversationId, content, userId, replyToMessageId).subscribe({
      next: (message) => {
        this.upsertMessage(message);
        this.shouldScrollToBottom = true;
        this.scheduleScrollToBottom();
        this.clearComposerAfterSend();
      },
      error: () => {
        this.composerError = 'Message failed to send. You can retry.';
        this.draft = content;
      }
    });
  }

  triggerImagePicker(): void {
    this.imageInput?.nativeElement.click();
  }

  openGifPicker(): void {
    const dialogRef = this.dialog.open(GifPickerDialogComponent, {
      width: '920px',
      maxWidth: '95vw',
      panelClass: 'gif-picker-dialog-panel',
      data: { title: 'Choose a GIF' }
    });

    dialogRef.afterClosed().subscribe((gif) => {
      if (!gif) {
        return;
      }

      this.selectedGif = gif;
      this.clearSelectedImage();
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.composerError = 'Only image files are allowed.';
      this.clearSelectedImage();
      return;
    }

    if (file.size > ChatWindowComponent.MAX_IMAGE_BYTES) {
      this.composerError = 'Image is too large. Please choose a file under 10 MB.';
      this.clearSelectedImage();
      return;
    }

    this.selectedImageFile = file;
    this.selectedGif = null;
    this.revokeSelectedImagePreview();
    this.selectedImagePreviewUrl = URL.createObjectURL(file);
    this.composerError = '';
  }

  clearSelectedImage(): void {
    this.selectedImageFile = null;
    this.uploadProgress = 0;
    this.revokeSelectedImagePreview();
    if (this.imageInput?.nativeElement) {
      this.imageInput.nativeElement.value = '';
    }
  }

  clearSelectedGif(): void {
    this.selectedGif = null;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    const units = ['KB', 'MB', 'GB'];
    let value = bytes / 1024;
    let index = 0;

    while (value >= 1024 && index < units.length - 1) {
      value /= 1024;
      index += 1;
    }

    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[index]}`;
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

  onMessagesScroll(): void {
    this.updateScrollCtaVisibility();
  }

  startReply(message: Message): void {
    this.replyingToMessage = message;
    this.editingMessageId = null;
    this.editingMessageOriginal = '';
    this.composerError = '';
  }

  startEdit(message: Message): void {
    if (!this.canModifyMessage(message)) {
      return;
    }

    this.editingMessageId = message.id;
    this.editingMessageOriginal = message.content || '';
    this.replyingToMessage = null;
    this.selectedImageFile = null;
    this.clearSelectedGif();
    this.revokeSelectedImagePreview();
    this.draft = message.content || '';
    this.composerError = '';
  }

  cancelEdit(): void {
    this.editingMessageId = null;
    this.editingMessageOriginal = '';
    this.draft = '';
    this.composerError = '';
  }

  cancelReply(): void {
    this.replyingToMessage = null;
    this.composerError = '';
  }

  canModifyMessage(message: Message): boolean {
    return !!this.userId && message.senderId === this.userId && !message.deletedAt;
  }

  onComposerKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();
    this.send();
  }

  jumpToLatest(): void {
    this.scrollToBottomNow();
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

  private loadUserDirectory(): void {
    this.messagingService.getUserDirectory().pipe(
      catchError(() => of([] as ChatDirectoryUser[]))
    ).subscribe((users) => {
      this.senderProfiles = new Map(users.map((user) => [user.id, user]));
      if (this.counterpartUserId) {
        this.syncCounterpartProfileSnippet();
      }
    });
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
      this.syncCounterpartProfileSnippet();
    });
  }

  private syncCounterpartProfileSnippet(): void {
    if (!this.counterpartUserId) {
      this.counterpartRoleLabel = '';
      this.counterpartProfileSnippet = '';
      return;
    }

    const profile = this.senderProfiles.get(this.counterpartUserId);
    this.counterpartRoleLabel = this.normalizeRole(profile?.role);
    this.counterpartProfileSnippet = profile?.email?.trim() || '';
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
        this.upsertMessage(message);
        this.shouldScrollToBottom = true;
        this.scheduleScrollToBottom();
      });
      this.messagesSubscribed = true;
    }

    if (!this.seenSubscribed) {
      this.seenUnsubscribe = this.communityRealtimeService.subscribeToConversationSeen(this.conversationId, (event) => {
        this.applySeenEvent(event);
      });
      this.seenSubscribed = true;
    }
  }

  private upsertMessage(message: Message): void {
    const normalized = this.normalizeMessage(message);
    const existingIndex = this.messages.findIndex((current) => current.id === normalized.id);

    if (existingIndex === -1) {
      this.messages = [...this.messages, normalized]
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      return;
    }

    const updated = [...this.messages];
    updated[existingIndex] = {
      ...updated[existingIndex],
      ...normalized,
      deliveryState: this.deriveMessageState(normalized)
    };
    this.messages = updated;
  }

  private applySeenEvent(event: SeenEvent): void {
    if (event.conversationId !== this.conversationId || event.readerId === this.userId) {
      return;
    }

    this.messages = this.messages.map((message) => {
      if (message.senderId !== this.userId || message.readAt) {
        return message;
      }

      return {
        ...message,
        readAt: event.seenAt,
        deliveryState: 'seen'
      };
    });
  }

  private sendWithImage(userId: number, content: string | null): void {
    if (!this.selectedImageFile) {
      return;
    }

    const file = this.selectedImageFile;
    const replyToMessageId = this.replyingToMessage?.id ?? null;
    this.sendingImage = true;
    this.uploadProgress = 0;
    this.publishTyping(false);
    this.composerError = '';

    this.messagingService.sendImageWithProgress(this.conversationId, file, content, userId, undefined, replyToMessageId).subscribe({
      next: (event: HttpEvent<Message>) => {
        if (event.type === HttpEventType.UploadProgress) {
          const total = event.total ?? file.size;
          this.uploadProgress = total > 0 ? Math.min(100, Math.round((event.loaded / total) * 100)) : 0;
          return;
        }

        if (event.type !== HttpEventType.Response || !event.body) {
          return;
        }

        this.upsertMessage(event.body);
        this.shouldScrollToBottom = true;
        this.sendingImage = false;
        this.clearSelectedImage();
        this.clearComposerAfterSend();
      },
      error: () => {
        this.composerError = 'Image failed to send. You can retry.';
        this.sendingImage = false;
      }
    });
  }

  private sendGif(userId: number, content: string | null): void {
    if (!this.selectedGif) {
      return;
    }

    const gif = this.selectedGif;
    const replyToMessageId = this.replyingToMessage?.id ?? null;
    this.sendingImage = true;
    this.publishTyping(false);
    this.composerError = '';

    this.messagingService.sendImage(this.conversationId, null, content, userId, gif.gifUrl, replyToMessageId).subscribe({
      next: (message) => {
        this.upsertMessage(message);
        this.shouldScrollToBottom = true;
        this.sendingImage = false;
        this.clearSelectedGif();
        this.clearComposerAfterSend();
      },
      error: () => {
        this.composerError = 'GIF failed to send. You can retry.';
        this.sendingImage = false;
      }
    });
  }

  private saveEditedMessage(userId: number, content: string): void {
    if (this.editingMessageId === null) {
      return;
    }

    const original = this.editingMessageOriginal;
    const finalContent = content.trim();
    if (!finalContent) {
      this.composerError = 'Message content is required.';
      this.draft = original;
      return;
    }

    this.composerError = '';
    this.messagingService.updateMessage(this.editingMessageId, finalContent, userId).subscribe({
      next: (updatedMessage) => {
        this.upsertMessage(updatedMessage);
        this.cancelEdit();
        this.replyingToMessage = null;
      },
      error: () => {
        this.composerError = 'Unable to save edit. You can retry.';
      }
    });
  }

  normalizeMessage(message: Message): Message {
    const normalizedLegacy = this.normalizeLegacyReplyContent(message);

    return {
      ...normalizedLegacy,
      deliveryState: normalizedLegacy.deliveryState || this.deriveMessageState(normalizedLegacy)
    };
  }

  jumpToMessage(messageId?: number): void {
    if (!messageId) {
      return;
    }

    window.setTimeout(() => {
      const target = document.getElementById(`message-${messageId}`);
      if (!target) {
        return;
      }

      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('message-jump-highlight');
      window.setTimeout(() => target.classList.remove('message-jump-highlight'), 1400);
    }, 0);
  }

  deriveMessageState(message: Message): 'sending' | 'sent' | 'delivered' | 'seen' | 'failed' | undefined {
    if (message.deletedAt) {
      return undefined;
    }

    if (message.senderId !== this.userId) {
      return undefined;
    }

    if (message.readAt) {
      return 'seen';
    }

    if (message.updatedAt) {
      return 'sent';
    }

    return 'delivered';
  }

  messageDisplayName(message: Message): string {
    if (message.senderId === this.userId) {
      return 'You';
    }

    const profile = this.senderProfiles.get(message.senderId);
    return message.senderName || profile?.firstName || profile?.email || 'Unknown User';
  }

  messageRoleLabel(message: Message): string {
    if (message.senderId === this.userId) {
      return 'You';
    }

    const profile = this.senderProfiles.get(message.senderId);
    return this.normalizeRole(profile?.role);
  }

  messageRoleSnippet(message: Message): string {
    const profile = this.senderProfiles.get(message.senderId);
    if (!profile?.email) {
      return '';
    }

    return profile.email;
  }

  messageAvatarInitials(message: Message): string {
    const label = this.messageDisplayName(message).trim();
    if (!label) {
      return 'U';
    }

    const parts = label.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }

  messageStatusLabel(message: Message): string {
    if (message.senderId !== this.userId) {
      return message.readAt ? 'Seen' : 'Delivered';
    }

    if (message.deletedAt) {
      return 'Deleted';
    }

    if (message.readAt) {
      return 'Seen';
    }

    if (message.deliveryState === 'sending') {
      return 'Sending';
    }

    return message.deliveryState === 'failed' ? 'Failed' : 'Delivered';
  }

  replyContext(message: Message): { author: string; quote: string } | null {
    if (message.replyToMessageId) {
      const senderName = (message.replyToSenderName || '').trim();
      const author = senderName || (message.replyToSenderId === this.userId ? 'You' : 'User');
      const quote = (message.replyToContent || '').trim() || 'Attachment';
      return { author, quote };
    }

    const parsed = this.parseReplyPayload(message.content || '');
    if (!parsed) {
      return null;
    }

    return {
      author: parsed.author,
      quote: parsed.quote
    };
  }

  messageDisplayContent(message: Message): string {
    if (message.replyToMessageId) {
      return message.content || '';
    }

    const parsed = this.parseReplyPayload(message.content || '');
    if (!parsed) {
      return message.content || '';
    }

    return parsed.body || '';
  }

  composerPreview(message: Message): string {
    if (message.replyToMessageId) {
      const replyBody = (message.content || '').trim();
      if (replyBody) {
        return replyBody;
      }
      return (message.replyToContent || '').trim();
    }

    const parsed = this.parseReplyPayload(message.content || '');
    if (!parsed) {
      return (message.content || '').trim();
    }

    if (parsed.body) {
      return parsed.body;
    }

    return parsed.quote;
  }

  isOwnMessage(message: Message): boolean {
    return !!this.userId && message.senderId === this.userId;
  }

  isEdited(message: Message): boolean {
    return !!message.updatedAt && !message.deletedAt;
  }

  private buildOutgoingContent(text: string): string {
    return text;
  }

  private clearComposerAfterSend(): void {
    this.draft = '';
    this.replyingToMessage = null;
    this.editingMessageId = null;
    this.editingMessageOriginal = '';
    this.composerError = '';
    this.uploadProgress = 0;
  }

  private normalizeRole(role?: string): string {
    const normalized = (role || '').trim().toUpperCase();
    if (!normalized) {
      return 'User';
    }

    return normalized.charAt(0) + normalized.slice(1).toLowerCase();
  }

  scrollComposerIntoView(): void {
    window.setTimeout(() => {
      const composer = document.getElementById('chat-draft');
      if (!composer) {
        return;
      }

      const rect = composer.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const isVisible = rect.top >= 8 && rect.bottom <= viewportHeight - 8;

      if (isVisible) {
        return;
      }

      composer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  }

  private parseReplyPayload(content: string): { author: string; quote: string; body: string } | null {
    const normalized = (content || '').trim();
    if (!normalized.startsWith('Replying to ')) {
      return null;
    }

    const lines = normalized.split('\n');
    const header = lines.shift() || '';
    const author = header.replace(/^Replying to\s+/, '').trim() || 'Unknown';

    const quoteLines: string[] = [];
    while (lines.length) {
      const current = (lines[0] || '').replace(/\r/g, '').trim();
      if (current === '>') {
        lines.shift();
        if (lines.length) {
          quoteLines.push((lines.shift() || '').replace(/\r/g, '').trim());
        }
        continue;
      }

      if (!current.startsWith('>')) {
        break;
      }

      quoteLines.push((lines.shift() || '').replace(/^>\s?/, '').replace(/\r/g, ''));
    }

    if (!quoteLines.length) {
      return null;
    }

    const body = lines.join('\n').trim();
    return {
      author,
      quote: quoteLines.join('\n').trim(),
      body
    };
  }

  private normalizeLegacyReplyContent(message: Message): Message {
    if (message.replyToMessageId || !message.content) {
      return message;
    }

    const parsed = this.parseReplyPayload(message.content);
    if (!parsed) {
      return message;
    }

    const trimmedAuthor = (parsed.author || '').trim();
    const replyToSenderName = trimmedAuthor || 'Unknown';
    const replyToSenderId = trimmedAuthor.toLowerCase() === 'you' ? this.userId : undefined;

    return {
      ...message,
      content: parsed.body,
      replyToMessageId: -1,
      replyToSenderId,
      replyToSenderName,
      replyToContent: parsed.quote
    };
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
    this.updateScrollCtaVisibility();
  }

  private updateScrollCtaVisibility(): void {
    if (!this.messagesContainer) {
      this.showScrollToBottom = false;
      return;
    }

    const container = this.messagesContainer.nativeElement;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    this.showScrollToBottom = distanceFromBottom > 120;
  }
}
