package com.elif.services.pet_profile.impl;

import com.elif.dto.pet_profile.request.PetProfileRequestDTO;
import com.elif.dto.pet_profile.request.PetHealthRecordRequestDTO;
import com.elif.dto.pet_profile.request.PetCareTaskRequestDTO;
import com.elif.dto.pet_profile.request.PetLocationUpdateRequestDTO;
import com.elif.dto.pet_profile.request.AdminPetBulkDeleteRequestDTO;
import com.elif.dto.pet_profile.request.AdminPetBulkUpdateRequestDTO;
import com.elif.dto.pet_profile.response.AdminPetBulkOperationResultDTO;
import com.elif.dto.pet_profile.response.AdminPetDashboardStatsDTO;
import com.elif.entities.user.Role;
import com.elif.entities.user.User;
import com.elif.entities.pet_profile.PetCareTask;
import com.elif.entities.pet_profile.PetHealthRecord;
import com.elif.entities.pet_profile.PetProfile;
import com.elif.entities.pet_profile.enums.PetTaskRecurrence;
import com.elif.entities.pet_profile.enums.PetSpecies;
import com.elif.exceptions.pet_profile.PetProfileNotFoundException;
import com.elif.exceptions.pet_profile.UnauthorizedPetAccessException;
import com.elif.repositories.user.UserRepository;
import com.elif.repositories.pet_profile.PetCareTaskRepository;
import com.elif.repositories.pet_profile.PetHealthRecordRepository;
import com.elif.repositories.pet_profile.PetProfileRepository;
import com.elif.services.pet_profile.interfaces.PetProfileService;
import com.elif.services.pet_transit.FileStorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class PetProfileServiceImpl implements PetProfileService {

    private final PetProfileRepository petProfileRepository;
    private final PetHealthRecordRepository petHealthRecordRepository;
    private final PetCareTaskRepository petCareTaskRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public PetProfileServiceImpl(PetProfileRepository petProfileRepository,
                                 PetHealthRecordRepository petHealthRecordRepository,
                                 PetCareTaskRepository petCareTaskRepository,
                                 UserRepository userRepository,
                                 FileStorageService fileStorageService) {
        this.petProfileRepository = petProfileRepository;
        this.petHealthRecordRepository = petHealthRecordRepository;
        this.petCareTaskRepository = petCareTaskRepository;
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
    public PetProfile updateMyPetLocation(Long userId, Long petId, PetLocationUpdateRequestDTO request) {
        ensureUserExists(userId);
        PetProfile profile = petProfileRepository.findByIdAndUserId(petId, userId)
                .orElseThrow(() -> new PetProfileNotFoundException(petId));
        profile.setLatitude(request.getLatitude());
        profile.setLongitude(request.getLongitude());
        profile.setLocationUpdatedAt(LocalDateTime.now());
        return petProfileRepository.save(profile);
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
        petCareTaskRepository.deleteByPetId(existing.getId());
        deleteManagedPhotoIfAny(existing.getPhotoUrl());
        petProfileRepository.delete(existing);
    }

    @Override
    public List<PetCareTask> findMyPetTasks(Long userId, Long petId) {
        PetProfile pet = findMyPetById(userId, petId);
        return petCareTaskRepository.findByPetIdOrderByUpdatedAtDesc(pet.getId());
    }

    @Override
    public PetCareTask createMyPetTask(Long userId, Long petId, PetCareTaskRequestDTO request) {
        PetProfile pet = findMyPetById(userId, petId);
        PetCareTask task = new PetCareTask();
        task.setPet(pet);
        applyTaskRequest(task, request);
        return petCareTaskRepository.save(task);
    }

    @Override
    public PetCareTask updateMyPetTask(Long userId, Long petId, Long taskId, PetCareTaskRequestDTO request) {
        findMyPetById(userId, petId);
        PetCareTask existing = petCareTaskRepository.findByIdAndPetId(taskId, petId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found for this pet"));
        applyTaskRequest(existing, request);
        return petCareTaskRepository.save(existing);
    }

    @Override
    public void deleteMyPetTask(Long userId, Long petId, Long taskId) {
        findMyPetById(userId, petId);
        PetCareTask existing = petCareTaskRepository.findByIdAndPetId(taskId, petId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found for this pet"));
        petCareTaskRepository.delete(existing);
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
        petCareTaskRepository.deleteByPetId(profile.getId());
        deleteManagedPhotoIfAny(profile.getPhotoUrl());
        petProfileRepository.delete(profile);
    }

    @Override
    public AdminPetBulkOperationResultDTO bulkUpdatePetsAsAdmin(Long adminUserId, AdminPetBulkUpdateRequestDTO request) {
        ensureAdmin(adminUserId);

        List<Long> petIds = sanitizePetIds(request.getPetIds());
        List<String> errors = new ArrayList<>();
        int succeeded = 0;

        for (Long petId : petIds) {
            try {
                PetProfile profile = petProfileRepository.findById(petId)
                        .orElseThrow(() -> new PetProfileNotFoundException(petId));

                if (request.getSpecies() != null) {
                    profile.setSpecies(request.getSpecies());
                }
                if (request.getGender() != null) {
                    profile.setGender(request.getGender());
                }
                if (request.getBreed() != null) {
                    profile.setBreed(normalize(request.getBreed()));
                }

                petProfileRepository.save(profile);
                succeeded++;
            } catch (Exception ex) {
                errors.add("Pet #" + petId + ": " + ex.getMessage());
            }
        }

        return AdminPetBulkOperationResultDTO.builder()
                .requested(petIds.size())
                .succeeded(succeeded)
                .failed(petIds.size() - succeeded)
                .errors(errors)
                .build();
    }

    @Override
    public AdminPetBulkOperationResultDTO bulkDeletePetsAsAdmin(Long adminUserId, AdminPetBulkDeleteRequestDTO request) {
        ensureAdmin(adminUserId);

        List<Long> petIds = sanitizePetIds(request.getPetIds());
        List<String> errors = new ArrayList<>();
        int succeeded = 0;

        for (Long petId : petIds) {
            try {
                PetProfile profile = petProfileRepository.findById(petId)
                        .orElseThrow(() -> new PetProfileNotFoundException(petId));

                petHealthRecordRepository.deleteByPetId(profile.getId());
                petCareTaskRepository.deleteByPetId(profile.getId());
                deleteManagedPhotoIfAny(profile.getPhotoUrl());
                petProfileRepository.delete(profile);
                succeeded++;
            } catch (Exception ex) {
                errors.add("Pet #" + petId + ": " + ex.getMessage());
            }
        }

        return AdminPetBulkOperationResultDTO.builder()
                .requested(petIds.size())
                .succeeded(succeeded)
                .failed(petIds.size() - succeeded)
                .errors(errors)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminPetDashboardStatsDTO getAdminPetDashboardStats(Long adminUserId) {
        ensureAdmin(adminUserId);
        List<PetProfile> pets = petProfileRepository.findAllByOrderByCreatedAtDesc();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime createdThreshold = now.minusDays(30);
        LocalDateTime updatedThreshold = now.minusDays(7);

        Map<String, Long> speciesBreakdown = new LinkedHashMap<>();
        for (PetSpecies species : PetSpecies.values()) {
            speciesBreakdown.put(species.name(), 0L);
        }

        long withPhoto = 0;
        long withGps = 0;
        long createdLast30Days = 0;
        long updatedLast7Days = 0;

        for (PetProfile pet : pets) {
            String speciesKey = pet.getSpecies() != null ? pet.getSpecies().name() : "OTHER";
            speciesBreakdown.put(speciesKey, speciesBreakdown.getOrDefault(speciesKey, 0L) + 1L);

            if (normalize(pet.getPhotoUrl()) != null) {
                withPhoto++;
            }
            if (pet.getLatitude() != null && pet.getLongitude() != null) {
                withGps++;
            }
            if (pet.getCreatedAt() != null && !pet.getCreatedAt().isBefore(createdThreshold)) {
                createdLast30Days++;
            }
            if (pet.getUpdatedAt() != null && !pet.getUpdatedAt().isBefore(updatedThreshold)) {
                updatedLast7Days++;
            }
        }

        return AdminPetDashboardStatsDTO.builder()
                .totalPets(pets.size())
                .petsWithPhoto(withPhoto)
                .petsWithGps(withGps)
                .createdLast30Days(createdLast30Days)
                .updatedLast7Days(updatedLast7Days)
                .speciesBreakdown(speciesBreakdown)
                .build();
    }

    private void applyTaskRequest(PetCareTask task, PetCareTaskRequestDTO request) {
        task.setTitle(request.getTitle().trim());
        task.setCategory(normalize(request.getCategory()) != null ? normalize(request.getCategory()) : "Other");
        task.setUrgency(request.getUrgency());
        task.setStatus(request.getStatus());
        task.setDueDate(request.getDueDate());
        task.setNotes(normalize(request.getNotes()));
        task.setRecurrence(request.getRecurrence() != null ? request.getRecurrence() : PetTaskRecurrence.NONE);
    }

    private void applyHealthRecordRequest(PetHealthRecord record, PetHealthRecordRequestDTO request) {
        record.setRecordDate(request.getRecordDate());
        record.setVisitType(request.getVisitType().trim());
        record.setVeterinarian(normalize(request.getVeterinarian()));
        record.setClinicName(normalize(request.getClinicName()));
        record.setBloodType(normalize(request.getBloodType()));
        record.setSpayedNeutered(normalize(request.getSpayedNeutered()));
        record.setAllergies(normalize(request.getAllergies()));
        record.setChronicConditions(normalize(request.getChronicConditions()));
        record.setPreviousOperations(normalize(request.getPreviousOperations()));
        record.setVaccinationHistory(normalize(request.getVaccinationHistory()));
        record.setSpecialDiet(normalize(request.getSpecialDiet()));
        record.setParasitePrevention(normalize(request.getParasitePrevention()));
        record.setEmergencyInstructions(normalize(request.getEmergencyInstructions()));
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
        if (request.getLatitude() != null && request.getLongitude() != null) {
            profile.setLatitude(request.getLatitude());
            profile.setLongitude(request.getLongitude());
            profile.setLocationUpdatedAt(LocalDateTime.now());
        }

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

    private List<Long> sanitizePetIds(List<Long> petIds) {
        if (petIds == null || petIds.isEmpty()) {
            throw new IllegalArgumentException("At least one pet id is required");
        }

        List<Long> sanitized = petIds.stream()
                .filter(id -> id != null && id > 0)
                .distinct()
                .toList();

        if (sanitized.isEmpty()) {
            throw new IllegalArgumentException("No valid pet ids were provided");
        }

        return sanitized;
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
