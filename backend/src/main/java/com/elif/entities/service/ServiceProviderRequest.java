package com.elif.entities.service;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "service_provider_request")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceProviderRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(length = 100)
    private String fullName;

    @Column(length = 150)
    private String email;

    @Column(length = 50)
    private String phone;

    @Column(name = "cv_url")
    private String cvUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status;

    @Column(columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    public enum RequestStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}
