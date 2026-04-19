package com.elif.dto.events.request;

import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventCreateRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 200)
    private String title;

    @Size(max = 2000)
    private String description;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    private LocalDateTime endDate;

    @NotNull(message = "Max participants is required")
    @Min(value = 1, message = "Max participants must be at least 1")
    @Max(value = 10000, message = "Max participants cannot exceed 10000")
    private Integer maxParticipants;

    @NotNull(message = "Category is required")
    private Long categoryId;

    // ✅ NOUVEAU : Fichier image (optionnel)
    private MultipartFile image;

    private String coverImageUrl;
}