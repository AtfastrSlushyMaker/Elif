package com.elif.controllers.pet_profile;

import com.elif.dto.pet_profile.request.PetProfileRequestDTO;
import com.elif.dto.pet_profile.response.PetProfileResponseDTO;
import com.elif.entities.pet_profile.PetProfile;
import com.elif.entities.pet_profile.enums.PetSpecies;
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
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(required = false) PetSpecies species) {
        List<PetProfileResponseDTO> response = petProfileService.findMyPets(userId, species)
                .stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{petId}")
    public ResponseEntity<PetProfileResponseDTO> getMyPetById(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long petId) {
        return ResponseEntity.ok(toResponse(petProfileService.findMyPetById(userId, petId)));
    }

    @PostMapping
    public ResponseEntity<PetProfileResponseDTO> createMyPet(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody PetProfileRequestDTO request) {
        PetProfile created = petProfileService.createMyPet(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(created));
    }

    @PutMapping("/{petId}")
    public ResponseEntity<PetProfileResponseDTO> updateMyPet(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long petId,
            @Valid @RequestBody PetProfileRequestDTO request) {
        return ResponseEntity.ok(toResponse(petProfileService.updateMyPet(userId, petId, request)));
    }

    @DeleteMapping("/{petId}")
    public ResponseEntity<Void> deleteMyPet(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long petId) {
        petProfileService.deleteMyPet(userId, petId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin")
    public ResponseEntity<List<PetProfileResponseDTO>> getAllPetsForAdmin(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(required = false) PetSpecies species) {
        List<PetProfileResponseDTO> response = petProfileService.findAllPetsForAdmin(userId, species)
                .stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/admin/{petId}")
    public ResponseEntity<PetProfileResponseDTO> updatePetAsAdmin(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long petId,
            @Valid @RequestBody PetProfileRequestDTO request) {
        return ResponseEntity.ok(toResponse(petProfileService.updatePetAsAdmin(userId, petId, request)));
    }

    @DeleteMapping("/admin/{petId}")
    public ResponseEntity<Void> deletePetAsAdmin(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long petId) {
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
                .age(profile.getAge())
                .gender(profile.getGender())
                .photoUrl(profile.getPhotoUrl())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
