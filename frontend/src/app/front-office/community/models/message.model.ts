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
  attachments?: MessageAttachment[];
  readAt?: string;
  createdAt: string;
}

export interface MessageAttachment {
  id: number;
  fileUrl: string;
  fileType?: string;
}
