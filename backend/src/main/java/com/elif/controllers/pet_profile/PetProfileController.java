package com.elif.controllers.pet_profile;

import com.elif.dto.pet_profile.request.PetProfileRequestDTO;
import com.elif.dto.pet_profile.response.PetProfileResponseDTO;
import com.elif.entities.pet_profile.PetProfile;
import com.elif.entities.pet_profile.enums.PetSpecies;
import com.elif.services.pet_profile.impl.PetProfileServiceImpl;
import com.elif.services.pet_profile.interfaces.PetProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-pets")
public class PetProfileController {

    private final PetProfileService petProfileService;

    public PetProfileController(PetProfileService petProfileService) {
        this.petProfileService = petProfileService;
    }

    @GetMapping
    public ResponseEntity<List<PetProfileResponseDTO>> getMyPets(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestParam(required = false) PetSpecies species) {
        Long userId = validateUserId(userIdHeader);
        List<PetProfileResponseDTO> response = petProfileService.findMyPets(userId, species)
                .stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{petId}")
    public ResponseEntity<PetProfileResponseDTO> getMyPetById(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @PathVariable Long petId) {
        Long userId = validateUserId(userIdHeader);
        return ResponseEntity.ok(toResponse(petProfileService.findMyPetById(userId, petId)));
    }

    @PostMapping
    public ResponseEntity<PetProfileResponseDTO> createMyPet(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @Valid @RequestBody PetProfileRequestDTO request) {
        Long userId = validateUserId(userIdHeader);
        PetProfile created = petProfileService.createMyPet(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(created));
    }

    @PutMapping("/{petId}")
    public ResponseEntity<PetProfileResponseDTO> updateMyPet(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @PathVariable Long petId,
            @Valid @RequestBody PetProfileRequestDTO request) {
        Long userId = validateUserId(userIdHeader);
        return ResponseEntity.ok(toResponse(petProfileService.updateMyPet(userId, petId, request)));
    }

    @DeleteMapping("/{petId}")
    public ResponseEntity<Void> deleteMyPet(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @PathVariable Long petId) {
        Long userId = validateUserId(userIdHeader);
        petProfileService.deleteMyPet(userId, petId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin")
    public ResponseEntity<List<PetProfileResponseDTO>> getAllPetsForAdmin(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestParam(required = false) PetSpecies species) {
        Long userId = validateUserId(userIdHeader);
        List<PetProfileResponseDTO> response = petProfileService.findAllPetsForAdmin(userId, species)
                .stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/admin/{petId}")
    public ResponseEntity<PetProfileResponseDTO> updatePetAsAdmin(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @PathVariable Long petId,
            @Valid @RequestBody PetProfileRequestDTO request) {
        Long userId = validateUserId(userIdHeader);
        return ResponseEntity.ok(toResponse(petProfileService.updatePetAsAdmin(userId, petId, request)));
    }

    @DeleteMapping("/admin/{petId}")
    public ResponseEntity<Void> deletePetAsAdmin(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @PathVariable Long petId) {
        Long userId = validateUserId(userIdHeader);
        petProfileService.deletePetAsAdmin(userId, petId);
        return ResponseEntity.noContent().build();
    }

    private PetProfileResponseDTO toResponse(PetProfile profile) {
        return PetProfileResponseDTO.builder()
                .id(profile.getId())
                .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                .name(profile.getName())
                .weight(profile.getWeight())
                .species(profile.getSpecies())
                .breed(profile.getBreed())
                .dateOfBirth(profile.getDateOfBirth())
                .ageDisplay(profile.formatAge())
                .gender(profile.getGender())
                .photoUrl(profile.getPhotoUrl())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }

    private Long validateUserId(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID header is missing. Please log in and try again.");
        }
        try {
            Long userId = Long.parseLong(userIdHeader.trim());
            if (userId <= 0) {
                throw new IllegalArgumentException("User ID must be a positive number.");
            }
            return userId;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("User ID header contains an invalid value: " + userIdHeader);
        }
    }
}
