package com.elif.dto.events.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventReviewRequest {

    @NotNull(message = "L'ID de l'événement est obligatoire")
    private Long eventId;

    @NotNull(message = "L'ID de l'utilisateur est obligatoire")
    private Long userId;

    @NotNull(message = "La note est obligatoire")
    @Min(value = 1, message = "La note minimale est 1")
    @Max(value = 5, message = "La note maximale est 5")
    private Integer rating;

    @Size(max = 2000, message = "Le commentaire ne peut dépasser 2000 caractères")
    private String comment;
}