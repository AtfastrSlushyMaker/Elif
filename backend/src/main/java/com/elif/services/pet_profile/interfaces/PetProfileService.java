package com.elif.services.pet_profile.interfaces;

import com.elif.dto.pet_profile.request.PetProfileRequestDTO;
import com.elif.entities.pet_profile.PetProfile;
import com.elif.entities.pet_profile.enums.PetSpecies;

import java.util.List;

public interface PetProfileService {
    List<PetProfile> findMyPets(Long userId, PetSpecies species);
    PetProfile findMyPetById(Long userId, Long petId);
    PetProfile createMyPet(Long userId, PetProfileRequestDTO request);
    PetProfile updateMyPet(Long userId, Long petId, PetProfileRequestDTO request);
    void deleteMyPet(Long userId, Long petId);

    List<PetProfile> findAllPetsForAdmin(Long adminUserId, PetSpecies species);
    PetProfile updatePetAsAdmin(Long adminUserId, Long petId, PetProfileRequestDTO request);
    void deletePetAsAdmin(Long adminUserId, Long petId);
}
