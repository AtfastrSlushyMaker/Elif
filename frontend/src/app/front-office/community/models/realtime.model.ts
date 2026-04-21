export interface PresenceEvent {
  userId: number;
  userName?: string;
  online: boolean;
  occurredAt: string;
}

export interface TypingEvent {
  conversationId: number;
  senderId: number;
  senderName?: string;
  typing: boolean;
  occurredAt: string;
}
