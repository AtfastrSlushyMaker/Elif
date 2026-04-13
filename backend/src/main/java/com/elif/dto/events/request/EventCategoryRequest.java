package com.elif.dto.events.request;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventCategoryRequest {

    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 100)
    private String name;

    @Size(max = 10)
    private String icon;

    @Size(max = 255)
    private String description;

    /**
     * true = les inscriptions passent en PENDING (concours/compétition).
     * false = inscription directement CONFIRMED.
     */
    @Builder.Default
    private Boolean requiresApproval = false;
}
