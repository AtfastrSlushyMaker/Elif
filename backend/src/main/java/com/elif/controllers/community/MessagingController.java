package com.elif.controllers.community;

import com.elif.dto.community.request.SendMessageRequest;
import com.elif.dto.community.response.ConversationResponse;
import com.elif.dto.community.response.MessageResponse;
import com.elif.entities.community.Conversation;
import com.elif.services.community.MessagingService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community/messages")
@AllArgsConstructor
public class MessagingController {

    private final MessagingService messagingService;

    @GetMapping("/inbox")
    public List<ConversationResponse> getInbox(@RequestHeader("X-User-Id") Long userId) {
        return messagingService.getInbox(userId);
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
        return messagingService.send(id, userId, request);
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
