package com.elif.controllers.community;

import com.elif.dto.community.request.SendMessageRequest;
import com.elif.dto.community.response.ConversationResponse;
import com.elif.dto.community.response.MessageResponse;
import com.elif.entities.community.Conversation;
import com.elif.services.community.MessagingService;
import lombok.AllArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;
import java.util.Objects;

@RestController
@RequestMapping("/api/community/messages")
@AllArgsConstructor
public class MessagingController {

    private final MessagingService messagingService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/inbox")
    public List<ConversationResponse> getInbox(@RequestHeader("X-User-Id") Long userId) {
        return messagingService.getInbox(userId);
    }

    @GetMapping("/presence")
    public Set<Long> getPresenceSnapshot(@RequestHeader("X-User-Id") Long userId) {
        // Header is required to keep the same auth contract as other messaging
        // endpoints.
        return messagingService.onlineUserIds();
    }

    @GetMapping("/conversations/{id}")
    public List<MessageResponse> getMessages(@PathVariable Long id, @RequestHeader("X-User-Id") Long userId) {
        return messagingService.getMessages(id, userId);
    }

    @PostMapping("/conversations")
    public Conversation startOrGet(@RequestHeader("X-User-Id") Long userId,
            @RequestParam Long otherUserId) {
        return messagingService.startOrGet(userId, otherUserId);
    }

    @PostMapping("/conversations/{id}/send")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse send(@PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody SendMessageRequest request) {
        MessageResponse response = messagingService.send(id, userId, request);
        messagingTemplate.convertAndSend("/topic/community.conversation." + id + ".messages", response);
        return response;
    }

    @PostMapping(value = "/conversations/{id}/send-image", consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse sendImage(@PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "imageUrl", required = false) String imageUrl,
            @RequestParam(value = "content", required = false) String content) {
        MessageResponse response = messagingService.sendImage(id, userId, file, imageUrl, content);
        messagingTemplate.convertAndSend("/topic/community.conversation." + id + ".messages", response);
        return response;
    }

    @GetMapping("/attachments/{attachmentId}/content")
    public ResponseEntity<byte[]> getAttachmentContent(@PathVariable Long attachmentId,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            @RequestParam(value = "userId", required = false) Long queryUserId) {
        Long userId = headerUserId != null ? headerUserId : queryUserId;
        MessagingService.AttachmentContent payload = messagingService.getAttachmentContent(attachmentId, userId);
        String contentType = payload.contentType() != null && !payload.contentType().isBlank()
                ? payload.contentType()
                : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        MediaType mediaType = MediaType.parseMediaType(Objects.requireNonNull(contentType));

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header("Cache-Control", "private, max-age=300")
                .body(payload.data());
    }

    @PutMapping("/conversations/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markConversationRead(@PathVariable Long id, @RequestHeader("X-User-Id") Long userId) {
        messagingService.markConversationRead(id, userId);
    }

    @DeleteMapping("/{messageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMessage(@PathVariable Long messageId, @RequestHeader("X-User-Id") Long userId) {
        messagingService.deleteMessage(messageId, userId);
    }
}
