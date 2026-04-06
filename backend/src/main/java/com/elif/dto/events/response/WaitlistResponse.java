package com.elif.dto.events.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class WaitlistResponse {
    private Long   id;
    private Long   eventId;
    private String eventTitle;
    private Long   userId;
    private String userName;
    private int    numberOfSeats;
    private int    position;
    /** Nombre de personnes devant cet utilisateur */
    private long   peopleAhead;
    private LocalDateTime joinedAt;
    private boolean notified;
}
