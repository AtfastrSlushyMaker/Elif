package com.elif.dto.events.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventParticipantRequest {

    @NotNull(message = "Le nombre de places est obligatoire")
    @Min(value = 1, message = "Vous devez réserver au moins 1 place")
    @Max(value = 20, message = "Vous ne pouvez pas réserver plus de 20 places à la fois")
    @Builder.Default
    private Integer numberOfSeats = 1;
}