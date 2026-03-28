package com.elif.services.adoption.impl;

import com.elif.dto.adoption.response.AdminStatisticsResponseDTO;
import com.elif.dto.adoption.response.ShelterAdminDTO;
import com.elif.entities.adoption.Shelter;
import com.elif.entities.adoption.enums.RequestStatus;
import com.elif.entities.user.Role;
import com.elif.repositories.adoption.*;
import com.elif.repositories.user.UserRepository;
import com.elif.services.adoption.interfaces.IAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements IAdminService {

    private final UserRepository userRepository;
    private final AdoptionPetRepository petRepository;
    private final AdoptionRequestRepository requestRepository;
    private final ContractRepository contractRepository;
    private final ShelterReviewRepository reviewRepository;
    private final ShelterRepository shelterRepository;

    @Override
    public AdminStatisticsResponseDTO getStatistics() {
        return AdminStatisticsResponseDTO.builder()
                .totalUsers(userRepository.count())
                .totalShelters(userRepository.countByRole(Role.SHELTER))
                .pendingShelters(userRepository.countByRoleAndVerified(Role.SHELTER, false))
                .verifiedShelters(userRepository.countByRoleAndVerified(Role.SHELTER, true))
                .totalPets(petRepository.count())
                .availablePets(petRepository.countByAvailable(true))
                .adoptedPets(petRepository.countByAvailable(false))
                .totalAdoptionRequests(requestRepository.count())
                .pendingRequests(requestRepository.countByStatus(RequestStatus.PENDING))
                .approvedRequests(requestRepository.countByStatus(RequestStatus.APPROVED))
                .rejectedRequests(requestRepository.countByStatus(RequestStatus.REJECTED))
                .totalContracts(contractRepository.count())
                .totalRevenue(contractRepository.sumFraisAdoption() != null ? contractRepository.sumFraisAdoption() : BigDecimal.ZERO)
                .pendingReviews(reviewRepository.countByIsApprovedFalseAndIsDeletedFalse())
                .build();
    }

    @Override
    public List<ShelterAdminDTO> getAllShelters() {
        return shelterRepository.findAll().stream()
                .map(shelter -> ShelterAdminDTO.builder()
                        .id(shelter.getId())
                        .name(shelter.getName())
                        .address(shelter.getAddress())
                        .phone(shelter.getPhone())
                        .email(shelter.getEmail())
                        .licenseNumber(shelter.getLicenseNumber())
                        .verified(shelter.getVerified())
                        .description(shelter.getDescription())
                        .logoUrl(shelter.getLogoUrl())
                        .createdAt(shelter.getCreatedAt())
                        .updatedAt(shelter.getUpdatedAt())
                        .userId(shelter.getUser() != null ? shelter.getUser().getId() : null)
                        .userEmail(shelter.getUser() != null ? shelter.getUser().getEmail() : null)
                        .userVerified(shelter.getUser() != null ? shelter.getUser().getVerified() : null)
                        .build())
                .collect(Collectors.toList());
    }

    // AJOUTER CETTE MÉTHODE
    @Override
    public ShelterAdminDTO getShelterById(Long id) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shelter not found with id: " + id));

        return ShelterAdminDTO.builder()
                .id(shelter.getId())
                .name(shelter.getName())
                .address(shelter.getAddress())
                .phone(shelter.getPhone())
                .email(shelter.getEmail())
                .licenseNumber(shelter.getLicenseNumber())
                .verified(shelter.getVerified())
                .description(shelter.getDescription())
                .logoUrl(shelter.getLogoUrl())
                .createdAt(shelter.getCreatedAt())
                .updatedAt(shelter.getUpdatedAt())
                .userId(shelter.getUser() != null ? shelter.getUser().getId() : null)
                .userEmail(shelter.getUser() != null ? shelter.getUser().getEmail() : null)
                .userVerified(shelter.getUser() != null ? shelter.getUser().getVerified() : null)
                .build();
    }
}