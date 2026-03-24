package com.elif.dto.pet_transit.request;

import com.elif.entities.pet_transit.enums.DocumentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TravelDocumentUploadRequest {

    @NotNull
    private Long travelPlanId;

    @NotNull
    private DocumentType documentType;

    @NotBlank
    private String fileUrl;

    private String documentNumber;
    private String holderName;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String issuingOrganization;
}