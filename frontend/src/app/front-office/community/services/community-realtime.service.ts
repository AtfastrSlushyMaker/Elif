import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Subject, Observable } from 'rxjs';
import { Message } from '../models/message.model';
import { PresenceEvent, SeenEvent, TypingEvent } from '../models/realtime.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CommunityRealtimeService {
  private readonly wsUrl = environment.communityWsUrl;

  private client?: Client;
  private connectedUserId?: number;

  private readonly presenceSubject = new Subject<PresenceEvent>();
  private readonly connectedSubject = new Subject<void>();

  presence$ = this.presenceSubject.asObservable();
  connected$ = this.connectedSubject.asObservable();

  connect(userId: number): void {
    if (this.client?.connected && this.connectedUserId === userId) {
      return;
    }

    this.disconnect();

    this.connectedUserId = userId;
    this.client = new Client({
      brokerURL: this.wsUrl,
      reconnectDelay: 4000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      onConnect: () => {
        this.connectedSubject.next();

        this.client?.subscribe('/topic/community.presence', (message: IMessage) => {
          this.pushPresence(message);
        });

        this.client?.publish({
          destination: '/app/community/presence.connect',
          body: JSON.stringify({ userId })
        });
      }
    });

    this.client.activate();
  }

  disconnect(): void {
    if (!this.client) {
      return;
    }

    this.client.deactivate();
    this.client = undefined;
  }

  publishTyping(conversationId: number, typing: boolean): void {
    if (!this.client?.connected) {
      return;
    }

    this.client.publish({
      destination: '/app/community/typing',
      body: JSON.stringify({ conversationId, typing })
    });
  }

  subscribeToConversationTyping(conversationId: number, handler: (event: TypingEvent) => void): () => void {
    const topic = `/topic/community.conversation.${conversationId}.typing`;

    let subscription: StompSubscription | undefined;
    const subscribeNow = () => {
      if (!this.client?.connected) {
        return;
      }
      subscription = this.client.subscribe(topic, (message: IMessage) => {
        try {
          const parsed = JSON.parse(message.body) as TypingEvent;
          handler(parsed);
        } catch {
          // Ignore malformed events to keep chat resilient.
        }
      });
    };

    if (this.client?.connected) {
      subscribeNow();
    } else {
      const waitHandle = window.setInterval(() => {
        if (this.client?.connected) {
          window.clearInterval(waitHandle);
          subscribeNow();
        }
      }, 200);

      return () => {
        window.clearInterval(waitHandle);
        subscription?.unsubscribe();
      };
    }

    return () => subscription?.unsubscribe();
  }

  subscribeToConversationMessages(conversationId: number, handler: (message: Message) => void): () => void {
    const topic = `/topic/community.conversation.${conversationId}.messages`;

    let subscription: StompSubscription | undefined;
    const subscribeNow = () => {
      if (!this.client?.connected) {
        return;
      }
      subscription = this.client.subscribe(topic, (frame: IMessage) => {
        try {
          const parsed = JSON.parse(frame.body) as Message;
          handler(parsed);
        } catch {
          // Ignore malformed events to keep chat resilient.
        }
      });
    };

    if (this.client?.connected) {
      subscribeNow();
    } else {
      const waitHandle = window.setInterval(() => {
        if (this.client?.connected) {
          window.clearInterval(waitHandle);
          subscribeNow();
        }
      }, 200);

      return () => {
        window.clearInterval(waitHandle);
        subscription?.unsubscribe();
      };
    }

    return () => subscription?.unsubscribe();
  }

  subscribeToConversationSeen(conversationId: number, handler: (event: SeenEvent) => void): () => void {
    const topic = `/topic/community.conversation.${conversationId}.seen`;

    let subscription: StompSubscription | undefined;
    const subscribeNow = () => {
      if (!this.client?.connected) {
        return;
      }
      subscription = this.client.subscribe(topic, (message: IMessage) => {
        try {
          const parsed = JSON.parse(message.body) as SeenEvent;
          handler(parsed);
        } catch {
          // Ignore malformed events to keep chat resilient.
        }
      });
    };

    if (this.client?.connected) {
      subscribeNow();
    } else {
      const waitHandle = window.setInterval(() => {
        if (this.client?.connected) {
          window.clearInterval(waitHandle);
          subscribeNow();
        }
      }, 200);

      return () => {
        window.clearInterval(waitHandle);
        subscription?.unsubscribe();
      };
    }

    return () => subscription?.unsubscribe();
  }

  private pushPresence(message: IMessage): void {
    try {
      const parsed = JSON.parse(message.body) as PresenceEvent;
      this.presenceSubject.next(parsed);
    } catch {
      // Ignore malformed events to keep inbox/chat usable.
    }
  }

  observePresence(): Observable<PresenceEvent> {
    return this.presence$;
  }
}
