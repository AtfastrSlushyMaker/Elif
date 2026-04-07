import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Conversation } from '../../models/message.model';
import { CommunityRealtimeService } from '../../services/community-realtime.service';
import { MessagingService, ChatDirectoryUser } from '../../services/messaging.service';
import { AuthService } from '../../../../auth/auth.service';

interface ChatCandidate {
  userId: number;
  name: string;
  roleLabel: string;
  email: string;
}

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.css'
})
export class InboxComponent implements OnInit {
  conversations: Conversation[] = [];
  chatCandidates: ChatCandidate[] = [];
  onlineUserIds = new Set<number>();

  loading = true;
  error = '';
  recipientsLoading = true;
  recipientsError = '';
  startingChatUserId: number | null = null;

  pickerOpen = false;
  searchTerm = '';
  private presenceSubscription?: Subscription;

  get userId(): number | undefined { return this.auth.getCurrentUser()?.id; }
  get filteredCandidates(): ChatCandidate[] {
    const query = this.searchTerm.trim().toLowerCase();
    if (!query) {
      return this.chatCandidates;
    }

    return this.chatCandidates.filter((candidate) => {
      const inName = candidate.name.toLowerCase().includes(query);
      const inEmail = candidate.email.toLowerCase().includes(query);
      const inRole = candidate.roleLabel.toLowerCase().includes(query);
      return inName || inEmail || inRole;
    });
  }

  constructor(
    private messagingService: MessagingService,
    private communityRealtimeService: CommunityRealtimeService,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.userId;
    if (!userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.messagingService.getInbox(userId).subscribe({
      next: (data) => {
        this.conversations = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load inbox.';
        this.loading = false;
      }
    });

    this.messagingService.getPresenceSnapshot(userId).pipe(
      catchError(() => of([] as number[]))
    ).subscribe((onlineIds) => {
      this.onlineUserIds = new Set(onlineIds);
    });

    this.communityRealtimeService.connect(userId);
    this.presenceSubscription = this.communityRealtimeService.observePresence().subscribe((event) => {
      if (event.online) {
        this.onlineUserIds.add(event.userId);
      } else {
        this.onlineUserIds.delete(event.userId);
      }
      this.onlineUserIds = new Set(this.onlineUserIds);
    });

    this.loadChatCandidates(userId);
  }

  ngOnDestroy(): void {
    this.presenceSubscription?.unsubscribe();
  }

  open(conversationId: number): void {
    this.router.navigate(['/app/community/chat', conversationId]);
  }

  openPicker(): void {
    this.pickerOpen = true;
  }

  closePicker(): void {
    this.pickerOpen = false;
    this.searchTerm = '';
  }

  startChatWith(candidate: ChatCandidate): void {
    const userId = this.userId;
    if (!userId) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.startingChatUserId = candidate.userId;
    this.messagingService.startOrGet(candidate.userId, userId).subscribe({
      next: (conversation) => {
        this.startingChatUserId = null;
        this.closePicker();
        this.open(conversation.id);
      },
      error: () => {
        this.startingChatUserId = null;
        this.recipientsError = 'Unable to start this chat right now. Please try again.';
      }
    });
  }

  trackByConversationId(_: number, conversation: Conversation): number {
    return conversation.id;
  }

  trackByCandidateId(_: number, candidate: ChatCandidate): number {
    return candidate.userId;
  }

  formatCandidateMeta(candidate: ChatCandidate): string {
    return candidate.email ? `${candidate.roleLabel} • ${candidate.email}` : candidate.roleLabel;
  }

  counterpartUserId(conversation: Conversation): number | null {
    const userId = this.userId;
    if (!userId) {
      return null;
    }
    return conversation.participantOneId === userId ? conversation.participantTwoId : conversation.participantOneId;
  }

  isCounterpartOnline(conversation: Conversation): boolean {
    const counterpartId = this.counterpartUserId(conversation);
    return counterpartId ? this.onlineUserIds.has(counterpartId) : false;
  }

  private loadChatCandidates(userId: number): void {
    this.recipientsLoading = true;
    this.recipientsError = '';

    this.messagingService.getUserDirectory().pipe(
      catchError(() => {
        this.recipientsLoading = false;
        this.recipientsError = 'Unable to load users for new chats.';
        return of([] as ChatDirectoryUser[]);
      })
    ).subscribe((users) => {
      this.chatCandidates = users
        .filter((user) => user.id !== userId)
        .map((user) => ({
          userId: user.id,
          name: this.buildDisplayName(user),
          roleLabel: this.normalizeRole(user.role),
          email: (user.email || '').trim()
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      this.recipientsLoading = false;
    });
  }

  private buildDisplayName(user: ChatDirectoryUser): string {
    const first = (user.firstName || '').trim();
    const last = (user.lastName || '').trim();
    const fullName = `${first} ${last}`.trim();
    if (fullName.length > 0) {
      return fullName;
    }

    if (user.email && user.email.trim().length > 0) {
      return user.email.trim();
    }

    return `User #${user.id}`;
  }

  private normalizeRole(role?: string): string {
    const normalized = (role || '').trim().toUpperCase();
    if (!normalized) {
      return 'User';
    }

    return normalized.charAt(0) + normalized.slice(1).toLowerCase();
  }
}
