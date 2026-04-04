import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Community, CommunityMember } from '../../models/community.model';
import { Conversation } from '../../models/message.model';
import { CommunityRealtimeService } from '../../services/community-realtime.service';
import { CommunityService } from '../../services/community.service';
import { MessagingService } from '../../services/messaging.service';
import { AuthService } from '../../../../auth/auth.service';

interface ChatCandidate {
  userId: number;
  name: string;
  roles: Set<'MEMBER' | 'MODERATOR' | 'CREATOR'>;
  communities: Set<string>;
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
      const inCommunity = Array.from(candidate.communities).some((communityName) => communityName.toLowerCase().includes(query));
      return inName || inCommunity;
    });
  }

  constructor(
    private messagingService: MessagingService,
    private communityRealtimeService: CommunityRealtimeService,
    private communityService: CommunityService,
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
    const roleLabel = this.highestRole(candidate.roles);
    const communities = Array.from(candidate.communities).slice(0, 2).join(' • ');
    return `${roleLabel} • ${communities}`;
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

    this.communityService.getAll(userId).pipe(
      catchError(() => {
        this.recipientsLoading = false;
        this.recipientsError = 'Unable to load members for new chats.';
        return of([] as Community[]);
      })
    ).subscribe((communities) => {
      const joinedCommunities = communities.filter((community) => !!community.userRole);
      if (!joinedCommunities.length) {
        this.chatCandidates = [];
        this.recipientsLoading = false;
        return;
      }

      forkJoin(
        joinedCommunities.map((community) =>
          this.communityService.getMembers(community.id, userId).pipe(
            catchError(() => of([] as CommunityMember[]))
          )
        )
      ).subscribe({
        next: (allMembersByCommunity) => {
          const candidateMap = new Map<number, ChatCandidate>();

          allMembersByCommunity.forEach((members, idx) => {
            const community = joinedCommunities[idx];

            members
              .filter((member) => member.userId !== userId)
              .forEach((member) => {
                const existing = candidateMap.get(member.userId);
                if (!existing) {
                  candidateMap.set(member.userId, {
                    userId: member.userId,
                    name: member.name,
                    roles: new Set([member.role]),
                    communities: new Set([community.name])
                  });
                  return;
                }

                existing.roles.add(member.role);
                existing.communities.add(community.name);
              });
          });

          this.chatCandidates = Array.from(candidateMap.values()).sort((a, b) => a.name.localeCompare(b.name));
          this.recipientsLoading = false;
        },
        error: () => {
          this.chatCandidates = [];
          this.recipientsLoading = false;
          this.recipientsError = 'Unable to load members for new chats.';
        }
      });
    });
  }

  private highestRole(roles: Set<'MEMBER' | 'MODERATOR' | 'CREATOR'>): string {
    if (roles.has('CREATOR')) {
      return 'Creator';
    }
    if (roles.has('MODERATOR')) {
      return 'Moderator';
    }
    return 'Member';
  }
}
