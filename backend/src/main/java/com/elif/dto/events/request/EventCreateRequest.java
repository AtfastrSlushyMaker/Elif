package com.elif.dto.events.request;

import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

/**
 * DTO de création d'événement.
 * ✅ CORRECTION : ajout du champ isOnline — manquant, causait isOnline=0 en base.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventCreateRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 150)
    private String title;

    private String description;

    @NotBlank(message = "Location is required")
    @Size(max = 200)
    private String location;

    @NotNull(message = "Start date is required")
    @Future(message = "Start date must be in the future")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    private LocalDateTime endDate;

    @NotNull
    @Min(value = 1, message = "Must have at least 1 participant")
    @Max(value = 10000)
    private Integer maxParticipants;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private String coverImageUrl;

    private MultipartFile image;

    // ✅ NOUVEAU — champ manquant qui causait isOnline=false systématiquement
    @Builder.Default
    private Boolean isOnline = false;
}