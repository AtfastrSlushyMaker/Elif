package com.elif.dto.events.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class EventCategoryRequest {

    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 100, message = "Le nom doit contenir entre 2 et 100 caractères")
    private String name;

    @Size(max = 255, message = "La description ne peut pas dépasser 255 caractères")
    private String description;
}