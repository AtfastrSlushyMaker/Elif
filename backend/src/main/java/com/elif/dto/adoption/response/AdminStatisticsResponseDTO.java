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

    private Long totalContracts;
    private BigDecimal totalRevenue;

    private Long pendingReviews;

    // ============================================================
    // STATISTIQUES DÉTAILLÉES (optionnelles)
    // ============================================================

    private List<ShelterStatsDTO> topShelters;
    private List<PetTypeStatsDTO> adoptionsByPetType;
    private List<MonthlyStatsDTO> monthlyAdoptions;

    // ============================================================
    // CLASSES INTERNES
    // ============================================================

    @Data
    @Builder
    public static class ShelterStatsDTO {
        private Long id;
        private String name;
        private Long totalPets;
        private Long totalAdoptions;
        private Double adoptionRate;
    }

    @Data
    @Builder
    public static class PetTypeStatsDTO {
        private String type;
        private Long count;
    }

    @Data
    @Builder
    public static class MonthlyStatsDTO {
        private Integer year;
        private Integer month;
        private Long count;
    }
}