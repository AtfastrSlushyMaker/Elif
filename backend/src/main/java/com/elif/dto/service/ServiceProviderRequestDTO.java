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
    private String userFullName;
    private String message;
    private RequestStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
}
