package com.elif.services.pet_profile.impl;

import com.elif.dto.pet_profile.request.PetProfileRequestDTO;
import com.elif.entities.user.Role;
import com.elif.entities.user.User;
import com.elif.entities.pet_profile.PetProfile;
import com.elif.entities.pet_profile.enums.PetSpecies;
import com.elif.exceptions.pet_profile.PetProfileNotFoundException;
import com.elif.exceptions.pet_profile.UnauthorizedPetAccessException;
import com.elif.repositories.user.UserRepository;
import com.elif.repositories.pet_profile.PetProfileRepository;
import com.elif.services.pet_profile.interfaces.PetProfileService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Service
@Transactional
public class PetProfileServiceImpl implements PetProfileService {

    private final PetProfileRepository petProfileRepository;
    private final UserRepository userRepository;

    public PetProfileServiceImpl(PetProfileRepository petProfileRepository, UserRepository userRepository) {
        this.petProfileRepository = petProfileRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<PetProfile> findMyPets(Long userId, PetSpecies species) {
        ensureUserExists(userId);
        if (species != null) {
            return petProfileRepository.findByUserIdAndSpeciesOrderByCreatedAtDesc(userId, species);
        }
        return petProfileRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public PetProfile findMyPetById(Long userId, Long petId) {
        ensureUserExists(userId);
        return petProfileRepository.findByIdAndUserId(petId, userId)
                .orElseThrow(() -> new PetProfileNotFoundException(petId));
    }

    @Override
    public PetProfile createMyPet(Long userId, PetProfileRequestDTO request) {
        User user = ensureUserExists(userId);
        PetProfile profile = new PetProfile();
        profile.setUser(user);
        applyRequest(profile, request);
        return petProfileRepository.save(profile);
    }

    @Override
    public PetProfile updateMyPet(Long userId, Long petId, PetProfileRequestDTO request) {
        ensureUserExists(userId);
        PetProfile existing = petProfileRepository.findByIdAndUserId(petId, userId)
                .orElseThrow(() -> new PetProfileNotFoundException(petId));
        applyRequest(existing, request);
        return petProfileRepository.save(existing);
    }

    @Override
    public void deleteMyPet(Long userId, Long petId) {
        ensureUserExists(userId);
        PetProfile existing = petProfileRepository.findByIdAndUserId(petId, userId)
                .orElseThrow(() -> new PetProfileNotFoundException(petId));
        petProfileRepository.delete(existing);
    }

    @Override
    public List<PetProfile> findAllPetsForAdmin(Long adminUserId, PetSpecies species) {
        ensureAdmin(adminUserId);
        if (species == null) {
            return petProfileRepository.findAllByOrderByCreatedAtDesc();
        }
        return petProfileRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(profile -> profile.getSpecies() == species)
                .toList();
    }

    @Override
    public PetProfile updatePetAsAdmin(Long adminUserId, Long petId, PetProfileRequestDTO request) {
        ensureAdmin(adminUserId);
        PetProfile profile = petProfileRepository.findById(petId)
                .orElseThrow(() -> new PetProfileNotFoundException(petId));
        applyRequest(profile, request);
        return petProfileRepository.save(profile);
    }

    @Override
    public void deletePetAsAdmin(Long adminUserId, Long petId) {
        ensureAdmin(adminUserId);
        PetProfile profile = petProfileRepository.findById(petId)
                .orElseThrow(() -> new PetProfileNotFoundException(petId));
        petProfileRepository.delete(profile);
    }

    private User ensureUserExists(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid user id"));
    }

    private void ensureAdmin(Long userId) {
        User user = ensureUserExists(userId);
        if (user.getRole() != Role.ADMIN) {
            throw new UnauthorizedPetAccessException("Admin role is required for this operation");
        }
    }

    private void applyRequest(PetProfile profile, PetProfileRequestDTO request) {
        profile.setName(request.getName().trim());
        profile.setWeight(request.getWeight());
        profile.setSpecies(request.getSpecies());
        profile.setBreed(normalize(request.getBreed()));
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setAge(resolveAge(request.getDateOfBirth(), request.getAge()));
        profile.setGender(request.getGender());
        profile.setPhotoUrl(normalize(request.getPhotoUrl()));
    }

    private Integer resolveAge(LocalDate dateOfBirth, Integer providedAge) {
        if (dateOfBirth != null) {
            return Period.between(dateOfBirth, LocalDate.now()).getYears();
        }
        return providedAge;
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
