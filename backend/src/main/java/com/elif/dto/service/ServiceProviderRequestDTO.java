package com.elif.dto.service;

import com.elif.entities.service.ServiceProviderRequest.RequestStatus;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceProviderRequestDTO {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String cvUrl;
    private String description;
    private RequestStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
}
