package com.elif.services.community;

import com.elif.dto.community.request.SendMessageRequest;
import com.elif.dto.community.response.ConversationResponse;
import com.elif.dto.community.response.MessageResponse;
import com.elif.entities.community.Conversation;
import com.elif.entities.community.Message;
import com.elif.repositories.community.ConversationRepository;
import com.elif.repositories.community.MessageRepository;
import com.elif.repositories.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
@Transactional
public class MessagingService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public List<ConversationResponse> getInbox(Long userId) {
        return conversationRepository.findByParticipantOneIdOrParticipantTwoIdOrderByLastMessageAtDesc(userId, userId)
                .stream()
                .map(c -> ConversationResponse.builder()
                        .id(c.getId())
                        .participantOneId(c.getParticipantOneId())
                        .participantTwoId(c.getParticipantTwoId())
                        .participantOneName(fullName(c.getParticipantOneId()))
                        .participantTwoName(fullName(c.getParticipantTwoId()))
                        .counterpartName(fullName(c.getParticipantOneId().equals(userId) ? c.getParticipantTwoId()
                                : c.getParticipantOneId()))
                        .lastMessageAt(c.getLastMessageAt())
                        .unreadCount(
                                messageRepository.countByConversationIdAndSenderIdNotAndReadAtIsNull(c.getId(), userId))
                        .build())
                .toList();
    }

    public List<MessageResponse> getMessages(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        if (!isParticipant(conversation, userId)) {
            throw new IllegalStateException("You are not part of this conversation");
        }

        return messageRepository.findByConversationIdAndDeletedAtIsNullOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(this::toMessageResponse)
                .toList();
    }

    public Conversation startOrGet(Long userId, Long otherUserId) {
        Long p1 = Math.min(userId, otherUserId);
        Long p2 = Math.max(userId, otherUserId);

        return conversationRepository.findByParticipantOneIdAndParticipantTwoId(p1, p2)
                .orElseGet(() -> conversationRepository.save(Conversation.builder()
                        .participantOneId(p1)
                        .participantTwoId(p2)
                        .build()));
    }

    public MessageResponse send(Long conversationId, Long senderId, SendMessageRequest req) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        if (!isParticipant(conversation, senderId)) {
            throw new IllegalStateException("You are not part of this conversation");
        }

        Message message = messageRepository.save(Message.builder()
                .conversation(conversation)
                .senderId(senderId)
                .content(req.getContent())
                .build());

        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return toMessageResponse(message);
    }

    public void markConversationRead(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        if (!isParticipant(conversation, userId)) {
            throw new IllegalStateException("You are not part of this conversation");
        }

        List<Message> unreadMessages = messageRepository.findByConversationIdAndSenderIdNotAndReadAtIsNull(
                conversationId,
                userId);
        if (unreadMessages.isEmpty()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        for (Message message : unreadMessages) {
            message.setReadAt(now);
        }
        messageRepository.saveAll(unreadMessages);
    }

    public void deleteMessage(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        if (!message.getSenderId().equals(userId)) {
            throw new IllegalStateException("Only sender can delete message");
        }

        message.setDeletedAt(LocalDateTime.now());
        messageRepository.save(message);
    }

    private boolean isParticipant(Conversation c, Long userId) {
        return c.getParticipantOneId().equals(userId) || c.getParticipantTwoId().equals(userId);
    }

    private MessageResponse toMessageResponse(Message message) {
        return MessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSenderId())
                .senderName(fullName(message.getSenderId()))
                .content(message.getContent())
                .readAt(message.getReadAt())
                .createdAt(message.getCreatedAt())
                .build();
    }

    private String fullName(Long userId) {
        return userRepository.findById(userId)
                .map(u -> u.getFirstName() + " " + u.getLastName())
                .orElse("Unknown User");
    }
}
