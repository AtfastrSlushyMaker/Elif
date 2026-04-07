package com.elif.dto.pet_profile.request;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class PetHealthRecordRequestDTO {

    @NotNull(message = "Record date is required")
    @PastOrPresent(message = "Record date cannot be in the future")
    private LocalDate recordDate;

    @NotBlank(message = "Visit type is required")
    @Size(max = 80, message = "Visit type must be at most 80 characters")
    private String visitType;

    @Size(max = 120, message = "Veterinarian must be at most 120 characters")
    private String veterinarian;

    @Size(max = 120, message = "Clinic name must be at most 120 characters")
    private String clinicName;

    @Size(max = 255, message = "Diagnosis must be at most 255 characters")
    private String diagnosis;

    @Size(max = 500, message = "Treatment must be at most 500 characters")
    private String treatment;

    @Size(max = 500, message = "Medications must be at most 500 characters")
    private String medications;

    @Size(max = 1000, message = "Notes must be at most 1000 characters")
    private String notes;

    private LocalDate nextVisitDate;

    @AssertTrue(message = "Next visit date cannot be before record date")
    public boolean isNextVisitDateValid() {
        if (recordDate == null || nextVisitDate == null) {
            return true;
        }
        return !nextVisitDate.isBefore(recordDate);
    }
}
