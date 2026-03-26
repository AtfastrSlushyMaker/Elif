package com.elif.dto.service;

import lombok.*;

/**
 * Data Transfer Object for Service entity
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceDTO {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private Integer duration;
    private String status;
    private Long categoryId;
    private Long providerId;
}
