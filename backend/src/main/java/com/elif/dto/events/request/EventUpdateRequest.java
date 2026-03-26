package com.elif.dto.events.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class EventUpdateRequest {

    @Size(min = 3, max = 150, message = "Le titre doit contenir entre 3 et 150 caractères")
    private String title;

    @Size(max = 5000, message = "La description ne peut pas dépasser 5000 caractères")
    private String description;

    @Size(max = 200, message = "Le lieu ne peut pas dépasser 200 caractères")
    private String location;

    @Future(message = "La date de début doit être dans le futur")
    private LocalDateTime startDate;

    @Future(message = "La date de fin doit être dans le futur")
    private LocalDateTime endDate;

    @Min(value = 1, message = "La capacité doit être d'au moins 1")
    @Max(value = 10000, message = "La capacité ne peut pas dépasser 10 000")
    private Integer maxParticipants;

    @Size(max = 500, message = "L'URL de l'image ne peut pas dépasser 500 caractères")
    private String coverImageUrl;

    private Long categoryId;
}