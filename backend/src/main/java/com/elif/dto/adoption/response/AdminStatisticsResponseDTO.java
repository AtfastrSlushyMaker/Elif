package com.elif.dto.adoption.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class AdminStatisticsResponseDTO {

    // ============================================================
    // STATISTIQUES GLOBALES
    // ============================================================

    private Long totalUsers;
    private Long totalShelters;
    private Long pendingShelters;
    private Long verifiedShelters;

    private Long totalPets;
    private Long availablePets;
    private Long adoptedPets;

    private Long totalAdoptionRequests;
    private Long pendingRequests;
    private Long approvedRequests;
    private Long rejectedRequests;
    private Long cancelledRequests;
    private Long underReviewRequests;

    private Long totalContracts;
    private BigDecimal totalRevenue;

    private Long pendingReviews;
    private Long approvedReviews;
    private Long totalReviews;
}