package com.elif.services.pet_profile.impl;

import com.elif.dto.pet_profile.request.PetProfileRequestDTO;
import com.elif.dto.pet_profile.request.PetHealthRecordRequestDTO;
import com.elif.entities.user.Role;
import com.elif.entities.user.User;
import com.elif.entities.pet_profile.PetHealthRecord;
import com.elif.entities.pet_profile.PetProfile;
import com.elif.entities.pet_profile.enums.PetSpecies;
import com.elif.exceptions.pet_profile.PetProfileNotFoundException;
import com.elif.exceptions.pet_profile.UnauthorizedPetAccessException;
import com.elif.repositories.user.UserRepository;
import com.elif.repositories.pet_profile.PetHealthRecordRepository;
import com.elif.repositories.pet_profile.PetProfileRepository;
import com.elif.services.pet_profile.interfaces.PetProfileService;
import com.elif.services.pet_transit.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Service
@Transactional
public class PetProfileServiceImpl implements PetProfileService {

    private final PetProfileRepository petProfileRepository;
    private final PetHealthRecordRepository petHealthRecordRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public PetProfileServiceImpl(PetProfileRepository petProfileRepository,
                                 PetHealthRecordRepository petHealthRecordRepository,
                                 UserRepository userRepository,
                                 FileStorageService fileStorageService) {
        this.petProfileRepository = petProfileRepository;
        this.petHealthRecordRepository = petHealthRecordRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
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
    public PetProfile uploadMyPetPhoto(Long userId, Long petId, MultipartFile file) {
        ensureUserExists(userId);
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Pet image file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        if (file.getSize() > 5L * 1024L * 1024L) {
            throw new IllegalArgumentException("Image size must be 5MB or less");
        }

        PetProfile existing = petProfileRepository.findByIdAndUserId(petId, userId)
                .orElseThrow(() -> new PetProfileNotFoundException(petId));
        deleteManagedPhotoIfAny(existing.getPhotoUrl());
        String storedUrl = fileStorageService.storeFile(file, "pets/photos");

        existing.setPhotoUrl(storedUrl);
        return petProfileRepository.save(existing);
    }

    @Override
    public void deleteMyPet(Long userId, Long petId) {
        ensureUserExists(userId);
        PetProfile existing = petProfileRepository.findByIdAndUserId(petId, userId)
                .orElseThrow(() -> new PetProfileNotFoundException(petId));
        petHealthRecordRepository.deleteByPetId(existing.getId());
        deleteManagedPhotoIfAny(existing.getPhotoUrl());
        petProfileRepository.delete(existing);
    }

    @Override
    public List<PetHealthRecord> findMyPetHealthHistory(Long userId, Long petId) {
        PetProfile pet = findMyPetById(userId, petId);
        return petHealthRecordRepository.findByPetIdOrderByRecordDateDescCreatedAtDesc(pet.getId());
    }

    @Override
    public PetHealthRecord createMyPetHealthRecord(Long userId, Long petId, PetHealthRecordRequestDTO request) {
        PetProfile pet = findMyPetById(userId, petId);
        PetHealthRecord record = new PetHealthRecord();
        record.setPet(pet);
        applyHealthRecordRequest(record, request);
        return petHealthRecordRepository.save(record);
    }

    @Override
    public PetHealthRecord updateMyPetHealthRecord(Long userId, Long petId, Long recordId, PetHealthRecordRequestDTO request) {
        findMyPetById(userId, petId);
        PetHealthRecord existing = petHealthRecordRepository.findByIdAndPetId(recordId, petId)
                .orElseThrow(() -> new IllegalArgumentException("Health record not found for this pet"));
        applyHealthRecordRequest(existing, request);
        return petHealthRecordRepository.save(existing);
    }

    @Override
    public void deleteMyPetHealthRecord(Long userId, Long petId, Long recordId) {
        findMyPetById(userId, petId);
        PetHealthRecord existing = petHealthRecordRepository.findByIdAndPetId(recordId, petId)
                .orElseThrow(() -> new IllegalArgumentException("Health record not found for this pet"));
        petHealthRecordRepository.delete(existing);
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
    public PetProfile uploadPetPhotoAsAdmin(Long adminUserId, Long petId, MultipartFile file) {
        ensureAdmin(adminUserId);
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Pet image file is required");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        if (file.getSize() > 5L * 1024L * 1024L) {
            throw new IllegalArgumentException("Image size must be 5MB or less");
        }

        PetProfile profile = petProfileRepository.findById(petId)
                .orElseThrow(() -> new PetProfileNotFoundException(petId));
        deleteManagedPhotoIfAny(profile.getPhotoUrl());
        String storedUrl = fileStorageService.storeFile(file, "pets/photos");

        profile.setPhotoUrl(storedUrl);
        return petProfileRepository.save(profile);
    }

    @Override
    public void deletePetAsAdmin(Long adminUserId, Long petId) {
        ensureAdmin(adminUserId);
        PetProfile profile = petProfileRepository.findById(petId)
                .orElseThrow(() -> new PetProfileNotFoundException(petId));
        petHealthRecordRepository.deleteByPetId(profile.getId());
        deleteManagedPhotoIfAny(profile.getPhotoUrl());
        petProfileRepository.delete(profile);
    }

    private void applyHealthRecordRequest(PetHealthRecord record, PetHealthRecordRequestDTO request) {
        record.setRecordDate(request.getRecordDate());
        record.setVisitType(request.getVisitType().trim());
        record.setVeterinarian(normalize(request.getVeterinarian()));
        record.setClinicName(normalize(request.getClinicName()));
        record.setDiagnosis(normalize(request.getDiagnosis()));
        record.setTreatment(normalize(request.getTreatment()));
        record.setMedications(normalize(request.getMedications()));
        record.setNotes(normalize(request.getNotes()));
        record.setNextVisitDate(request.getNextVisitDate());
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
        String previousPhotoUrl = profile.getPhotoUrl();
        profile.setName(request.getName().trim());
        profile.setWeight(request.getWeight());
        profile.setSpecies(request.getSpecies());
        profile.setBreed(normalize(request.getBreed()));
        profile.setDateOfBirth(request.getDateOfBirth());
        profile.setGender(request.getGender());
        String normalizedUrl = normalize(request.getPhotoUrl());
        profile.setPhotoUrl(normalizedUrl);

        if (isManagedUploadUrl(previousPhotoUrl) && !sameText(previousPhotoUrl, normalizedUrl)) {
            deleteManagedPhotoIfAny(previousPhotoUrl);
        }
    }

    private void deleteManagedPhotoIfAny(String photoUrl) {
        if (!isManagedUploadUrl(photoUrl)) {
            return;
        }

        String normalizedForDeletion = photoUrl;
        if (normalizedForDeletion.startsWith("/elif/uploads/")) {
            normalizedForDeletion = normalizedForDeletion.substring("/elif".length());
        }
        if (normalizedForDeletion.startsWith("uploads/")) {
            normalizedForDeletion = "/" + normalizedForDeletion;
        }

        fileStorageService.deleteFile(normalizedForDeletion);
    }

    private boolean isManagedUploadUrl(String photoUrl) {
        if (photoUrl == null || photoUrl.trim().isEmpty()) {
            return false;
        }
        return photoUrl.startsWith("/uploads/")
                || photoUrl.startsWith("uploads/")
                || photoUrl.startsWith("/elif/uploads/");
    }

    private boolean sameText(String first, String second) {
        if (first == null) {
            return second == null;
        }
        return first.equals(second);
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    public static String formatAge(Integer ageInMonths) {
        if (ageInMonths == null || ageInMonths < 0) {
            return "Unknown";
        }
        if (ageInMonths == 0) {
            return "Newborn";
        }
        if (ageInMonths < 12) {
            return ageInMonths + " month" + (ageInMonths > 1 ? "s" : "");
        }
        int years = ageInMonths / 12;
        int months = ageInMonths % 12;
        if (months == 0) {
            return years + " year" + (years > 1 ? "s" : "");
        }
        return years + " year" + (years > 1 ? "s" : "") + " " + months + " month" + (months > 1 ? "s" : "");
    }
}
