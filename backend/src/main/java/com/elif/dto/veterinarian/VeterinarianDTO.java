package com.elif.dto.veterinarian;

import lombok.*;

/**
 * Data Transfer Object for Veterinarian entity
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VeterinarianDTO {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String speciality;
    private Integer experienceYears;
    private String clinicAddress;
    private Boolean available;
}
