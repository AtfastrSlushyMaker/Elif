package com.elif.dto.adoption.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatisticsResponseDTO {

    // Users
    private Long totalUsers;

    // Shelters
    private Long totalShelters;
    private Long pendingShelters;
    private Long verifiedShelters;

    // Pets
    private Long totalPets;
    private Long availablePets;
    private Long adoptedPets;

    // ✅ Nombre d'animaux par catégorie/type (ex: {"DOG": 12, "CAT": 8, "RABBIT": 3})
    private Map<String, Long> petsByCategory;

    // Adoption Requests
    private Long totalAdoptionRequests;
    private Long pendingRequests;
    private Long approvedRequests;
    private Long rejectedRequests;

    // Contracts
    private Long totalContracts;
    private BigDecimal totalRevenue;

    // Reviews
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