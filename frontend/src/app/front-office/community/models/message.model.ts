export interface Conversation {
  id: number;
  participantOneId: number;
  participantTwoId: number;
  participantOneName?: string;
  participantTwoName?: string;
  counterpartName?: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderName?: string;
  content: string;
  replyToMessageId?: number;
  replyToSenderId?: number;
  replyToSenderName?: string;
  replyToContent?: string;
  attachments?: MessageAttachment[];
  readAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  createdAt: string;
  deliveryState?: 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';
}

export interface MessageAttachment {
  id: number;
  fileUrl: string;
  fileType?: string;
}
