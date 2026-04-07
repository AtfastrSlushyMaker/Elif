package com.elif.services.pet_profile.interfaces;

import com.elif.dto.pet_profile.request.PetProfileRequestDTO;
import com.elif.dto.pet_profile.request.PetHealthRecordRequestDTO;
import com.elif.entities.pet_profile.PetHealthRecord;
import com.elif.entities.pet_profile.PetProfile;
import com.elif.entities.pet_profile.enums.PetSpecies;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PetProfileService {
    List<PetProfile> findMyPets(Long userId, PetSpecies species);
    PetProfile findMyPetById(Long userId, Long petId);
    PetProfile createMyPet(Long userId, PetProfileRequestDTO request);
    PetProfile updateMyPet(Long userId, Long petId, PetProfileRequestDTO request);
    PetProfile uploadMyPetPhoto(Long userId, Long petId, MultipartFile file);
    void deleteMyPet(Long userId, Long petId);
    List<PetHealthRecord> findMyPetHealthHistory(Long userId, Long petId);
    PetHealthRecord createMyPetHealthRecord(Long userId, Long petId, PetHealthRecordRequestDTO request);
    PetHealthRecord updateMyPetHealthRecord(Long userId, Long petId, Long recordId, PetHealthRecordRequestDTO request);
    void deleteMyPetHealthRecord(Long userId, Long petId, Long recordId);

    List<PetProfile> findAllPetsForAdmin(Long adminUserId, PetSpecies species);
    PetProfile updatePetAsAdmin(Long adminUserId, Long petId, PetProfileRequestDTO request);
    PetProfile uploadPetPhotoAsAdmin(Long adminUserId, Long petId, MultipartFile file);
    void deletePetAsAdmin(Long adminUserId, Long petId);
}
