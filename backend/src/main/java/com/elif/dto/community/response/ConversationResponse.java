package com.elif.dto.community.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ConversationResponse {
    private Long id;
    private Long participantOneId;
    private Long participantTwoId;
    private String participantOneName;
    private String participantTwoName;
    private String counterpartName;
    private LocalDateTime lastMessageAt;
    private long unreadCount;
}
