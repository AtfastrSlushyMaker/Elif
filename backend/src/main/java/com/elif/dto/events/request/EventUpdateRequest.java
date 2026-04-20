package com.elif.dto.events.request;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventUpdateRequest {
    private String title;
    private String description;
    private String location;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer maxParticipants;
    private Long categoryId;
    private String coverImageUrl;
    private MultipartFile image;
    @Builder.Default
    private Boolean isOnline = false;
}