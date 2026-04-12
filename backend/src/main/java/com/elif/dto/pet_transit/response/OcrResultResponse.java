package com.elif.dto.pet_transit.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class OcrResultResponse {

    private String documentNumber;
    private String holderName;
    private String issueDate;
    private String expiryDate;
    private String issuingOrganization;
    private String detectedDocumentType;
    private Double confidence;
    private String rawExtractedText;
    private List<String> missingFields;
    private Boolean isExpired;
    private List<String> warnings;
    private String source;

    public String getConfidenceLabel() {
        if (confidence == null) return "UNKNOWN";
        if (confidence >= 0.8) return "HIGH";
        if (confidence >= 0.5) return "MEDIUM";
        return "LOW";
    }
}
