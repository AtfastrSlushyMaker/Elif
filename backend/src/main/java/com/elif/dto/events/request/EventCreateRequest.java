package com.elif.dto.events.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventCreateRequest {

    @NotBlank(message = "Le titre est obligatoire")
    @Size(min = 3, max = 150, message = "Le titre doit contenir entre 3 et 150 caractères")
    private String title;

    @Size(max = 5000, message = "La description ne peut pas dépasser 5000 caractères")
    private String description;

    @NotBlank(message = "Le lieu est obligatoire")
    @Size(max = 200, message = "Le lieu ne peut pas dépasser 200 caractères")
    private String location;

    @NotNull(message = "La date de début est obligatoire")
    @Future(message = "La date de début doit être dans le futur")
    private LocalDateTime startDate;

    @NotNull(message = "La date de fin est obligatoire")
    @Future(message = "La date de fin doit être dans le futur")
    private LocalDateTime endDate;

    @NotNull(message = "La capacité maximale est obligatoire")
    @Min(value = 1, message = "La capacité doit être d'au moins 1")
    @Max(value = 10000, message = "La capacité ne peut pas dépasser 10 000")
    private Integer maxParticipants;

    @NotNull(message = "La catégorie est obligatoire")
    private Long categoryId;

    // 👇 Gardé pour compatibilité (URL)
    private String coverImageUrl;
}