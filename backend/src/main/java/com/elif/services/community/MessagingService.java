package com.elif.services.community;

import com.elif.dto.community.request.SendMessageRequest;
import com.elif.dto.community.response.MessageAttachmentResponse;
import com.elif.dto.community.response.ConversationResponse;
import com.elif.dto.community.response.MessageResponse;
import com.elif.entities.community.Conversation;
import com.elif.entities.community.Message;
import com.elif.entities.community.MessageAttachment;
import com.elif.repositories.community.MessageAttachmentRepository;
import com.elif.repositories.community.ConversationRepository;
import com.elif.repositories.community.MessageRepository;
import com.elif.repositories.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.time.LocalDateTime;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@AllArgsConstructor
@Transactional
public class MessagingService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final MessageAttachmentRepository messageAttachmentRepository;
    private final UserRepository userRepository;
    private final CommunityPresenceService communityPresenceService;
    private final RestTemplate restTemplate = new RestTemplate();

    public List<ConversationResponse> getInbox(Long userId) {
        return conversationRepository.findByParticipantOneIdOrParticipantTwoIdOrderByLastMessageAtDesc(userId, userId)
                .stream()
                .map(c -> toConversationResponse(c, userId))
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

    public ConversationResponse startOrGet(Long userId, Long otherUserId) {
        Long p1 = Math.min(userId, otherUserId);
        Long p2 = Math.max(userId, otherUserId);

        Conversation conversation = conversationRepository.findByParticipantOneIdAndParticipantTwoId(p1, p2)
                .orElseGet(() -> conversationRepository.save(Conversation.builder()
                        .participantOneId(p1)
                        .participantTwoId(p2)
                        .build()));

        return toConversationResponse(conversation, userId);
    }

    public MessageResponse send(Long conversationId, Long senderId, SendMessageRequest req) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        if (!isParticipant(conversation, senderId)) {
            throw new IllegalStateException("You are not part of this conversation");
        }

        String content = req != null ? req.getContent() : null;
        Message message = messageRepository.save(Message.builder()
                .conversation(conversation)
                .senderId(senderId)
                .content(content)
                .build());

        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return toMessageResponse(message);
    }

    public MessageResponse sendImage(Long conversationId, Long senderId, MultipartFile image, String imageUrl,
            String content) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        if (!isParticipant(conversation, senderId)) {
            throw new IllegalStateException("You are not part of this conversation");
        }

        boolean hasFile = image != null && !image.isEmpty();
        String normalizedImageUrl = normalizeOptional(imageUrl);

        if (!hasFile && normalizedImageUrl == null) {
            throw new IllegalArgumentException("Image file or imageUrl is required");
        }

        String fileType = "image/gif";
        byte[] imageBytes;
        if (hasFile) {
            MultipartFile uploadedImage = image;
            if (uploadedImage == null || uploadedImage.isEmpty()) {
                throw new IllegalArgumentException("Image file is required");
            }

            fileType = uploadedImage.getContentType();
            if (fileType == null || !fileType.startsWith("image/")) {
                throw new IllegalArgumentException("Only image attachments are allowed");
            }

            try {
                imageBytes = uploadedImage.getBytes();
            } catch (IOException ex) {
                throw new IllegalStateException("Could not read image content", ex);
            }
        } else {
            URI remoteUri = URI.create(normalizedImageUrl);
            String host = remoteUri.getHost();
            if (host == null || (!host.endsWith("giphy.com") && !host.endsWith("giphy.io"))) {
                throw new IllegalArgumentException("Only Giphy image URLs are allowed");
            }

            try {
                var remoteResponse = restTemplate.getForEntity(remoteUri, byte[].class);
                imageBytes = remoteResponse.getBody();
                var remoteContentType = remoteResponse.getHeaders().getContentType();
                fileType = remoteContentType != null ? remoteContentType.toString() : "image/gif";
            } catch (Exception ex) {
                throw new IllegalStateException("Could not load remote GIF", ex);
            }
        }

        if (imageBytes == null || imageBytes.length == 0) {
            throw new IllegalArgumentException("Image content is empty");
        }

        Message message = Message.builder()
                .conversation(conversation)
                .senderId(senderId)
                .content(content)
                .attachments(new ArrayList<>())
                .build();

        MessageAttachment attachment = MessageAttachment.builder()
                .message(message)
                .fileUrl("blob://pending")
                .fileType(fileType)
                .fileData(imageBytes)
                .build();

        message.getAttachments().add(attachment);
        Message saved = messageRepository.save(message);

        // Populate a stable API URL after ID generation.
        saved.getAttachments().forEach(
                currentAttachment -> currentAttachment.setFileUrl(buildAttachmentAccessUrl(currentAttachment.getId())));
        saved = messageRepository.save(saved);

        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        return toMessageResponse(saved);
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

    public boolean isParticipant(Long conversationId, Long userId) {
        return conversationRepository.findById(conversationId)
                .map(conversation -> isParticipant(conversation, userId))
                .orElse(false);
    }

    public Set<Long> onlineUserIds() {
        return communityPresenceService.onlineUserIds();
    }

    public AttachmentContent getAttachmentContent(Long attachmentId, Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User id is required");
        }

        MessageAttachment attachment = messageAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found"));

        Message message = attachment.getMessage();
        if (message == null || message.getConversation() == null) {
            throw new IllegalStateException("Attachment is not linked to a conversation");
        }

        if (!isParticipant(message.getConversation(), userId)) {
            throw new IllegalStateException("You are not allowed to access this attachment");
        }

        byte[] payload = attachment.getFileData();
        if (payload == null || payload.length == 0) {
            throw new IllegalStateException("Attachment content is unavailable");
        }

        return new AttachmentContent(payload, attachment.getFileType());
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
                .attachments(message.getAttachments().stream()
                        .map(attachment -> MessageAttachmentResponse.builder()
                                .id(attachment.getId())
                                .fileUrl(resolveAttachmentUrl(attachment))
                                .fileType(attachment.getFileType())
                                .build())
                        .toList())
                .readAt(message.getReadAt())
                .createdAt(message.getCreatedAt())
                .build();
    }

    private ConversationResponse toConversationResponse(Conversation conversation, Long viewerUserId) {
        Long counterpartId = conversation.getParticipantOneId().equals(viewerUserId)
                ? conversation.getParticipantTwoId()
                : conversation.getParticipantOneId();

        return ConversationResponse.builder()
                .id(conversation.getId())
                .participantOneId(conversation.getParticipantOneId())
                .participantTwoId(conversation.getParticipantTwoId())
                .participantOneName(fullName(conversation.getParticipantOneId()))
                .participantTwoName(fullName(conversation.getParticipantTwoId()))
                .counterpartName(fullName(counterpartId))
                .lastMessageAt(conversation.getLastMessageAt())
                .unreadCount(messageRepository.countByConversationIdAndSenderIdNotAndReadAtIsNull(conversation.getId(),
                        viewerUserId))
                .build();
    }

    private String resolveAttachmentUrl(MessageAttachment attachment) {
        if (attachment.getFileData() != null && attachment.getId() != null) {
            return buildAttachmentAccessUrl(attachment.getId());
        }
        return attachment.getFileUrl();
    }

    private String buildAttachmentAccessUrl(Long attachmentId) {
        return "/elif/api/community/messages/attachments/" + attachmentId + "/content";
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String fullName(Long userId) {
        return userRepository.findById(userId)
                .map(u -> u.getFirstName() + " " + u.getLastName())
                .orElse("Unknown User");
    }

    public record AttachmentContent(byte[] data, String contentType) {
    }
}
