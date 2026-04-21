package com.elif.services.adoption.impl;

import com.elif.dto.adoption.response.AdminStatisticsResponseDTO;
import com.elif.dto.adoption.response.ShelterAdminDTO;
import com.elif.entities.adoption.AdoptionPet;
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

    // ============================================================
    // STATISTIQUES
    // ============================================================

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
                .totalRevenue(contractRepository.sumFraisAdoption() != null
                        ? contractRepository.sumFraisAdoption()
                        : BigDecimal.ZERO)
                .pendingReviews(reviewRepository.countByIsApprovedFalseAndIsDeletedFalse())
                .build();
    }

    // ============================================================
    // GESTION DES REFUGES
    // ============================================================

    @Override
    public List<ShelterAdminDTO> getAllShelters() {
        return shelterRepository.findAll().stream()
                .map(this::toShelterDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ShelterAdminDTO getShelterById(Long id) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shelter not found with id: " + id));
        return toShelterDTO(shelter);
    }

    // ✅ NOUVEAU : créer un shelter depuis l'admin (sans user lié)
    @Override
    public ShelterAdminDTO createShelter(ShelterAdminDTO shelterDTO) {
        Shelter shelter = new Shelter();
        shelter.setName(shelterDTO.getName());
        shelter.setAddress(shelterDTO.getAddress());
        shelter.setPhone(shelterDTO.getPhone());
        shelter.setEmail(shelterDTO.getEmail());
        shelter.setDescription(shelterDTO.getDescription());
        shelter.setLogoUrl(shelterDTO.getLogoUrl());
        shelter.setLicenseNumber(shelterDTO.getLicenseNumber());
        shelter.setVerified(shelterDTO.getVerified() != null ? shelterDTO.getVerified() : false);

        shelter = shelterRepository.save(shelter);
        return toShelterDTO(shelter);
    }

    @Override
    public ShelterAdminDTO updateShelter(Long id, ShelterAdminDTO shelterDTO) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shelter not found with id: " + id));

        shelter.setName(shelterDTO.getName());
        shelter.setAddress(shelterDTO.getAddress());
        shelter.setPhone(shelterDTO.getPhone());
        shelter.setEmail(shelterDTO.getEmail());
        shelter.setDescription(shelterDTO.getDescription());
        shelter.setLogoUrl(shelterDTO.getLogoUrl());
        if (shelterDTO.getLicenseNumber() != null) {
            shelter.setLicenseNumber(shelterDTO.getLicenseNumber());
        }
        if (shelterDTO.getVerified() != null) {
            shelter.setVerified(shelterDTO.getVerified());
        }

        shelter = shelterRepository.save(shelter);
        return toShelterDTO(shelter);
    }

    @Override
    public void deleteShelter(Long id) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shelter not found with id: " + id));

        if (shelter.getUser() != null) {
            userRepository.delete(shelter.getUser());
        }

        shelterRepository.delete(shelter);
    }

    // ============================================================
    // GESTION DES ANIMAUX
    // ============================================================

    @Override
    public List<AdoptionPet> getAllPets() {
        return petRepository.findAll();
    }

    @Override
    public AdoptionPet getPetById(Long id) {
        return petRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pet not found with id: " + id));
    }

    @Override
    public AdoptionPet createPet(AdoptionPet pet) {
        if (pet.getShelter() != null && pet.getShelter().getId() != null) {
            Shelter shelter = shelterRepository.findById(pet.getShelter().getId())
                    .orElseThrow(() -> new RuntimeException(
                            "Shelter not found with id: " + pet.getShelter().getId()));
            pet.setShelter(shelter);
        } else {
            throw new RuntimeException("Shelter is required to create a pet");
        }
        return petRepository.save(pet);
    }

    @Override
    public AdoptionPet updatePet(Long id, AdoptionPet petDetails) {
        AdoptionPet pet = getPetById(id);

        pet.setName(petDetails.getName());
        pet.setType(petDetails.getType());
        pet.setBreed(petDetails.getBreed());
        pet.setAge(petDetails.getAge());
        pet.setGender(petDetails.getGender());
        pet.setSize(petDetails.getSize());
        pet.setColor(petDetails.getColor());
        pet.setHealthStatus(petDetails.getHealthStatus());
        pet.setSpayedNeutered(petDetails.getSpayedNeutered());
        pet.setSpecialNeeds(petDetails.getSpecialNeeds());
        pet.setDescription(petDetails.getDescription());
        pet.setPhotos(petDetails.getPhotos());

        if (petDetails.getShelter() != null && petDetails.getShelter().getId() != null) {
            Shelter shelter = shelterRepository.findById(petDetails.getShelter().getId())
                    .orElseThrow(() -> new RuntimeException(
                            "Shelter not found with id: " + petDetails.getShelter().getId()));
            pet.setShelter(shelter);
        }

        return petRepository.save(pet);
    }

    @Override
    public void deletePet(Long id) {
        AdoptionPet pet = getPetById(id);
        petRepository.delete(pet);
    }

    // ============================================================
    // MÉTHODE UTILITAIRE PRIVÉE
    // ============================================================

    private ShelterAdminDTO toShelterDTO(Shelter shelter) {
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