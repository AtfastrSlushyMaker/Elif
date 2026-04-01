package com.elif.services.adoption.interfaces;

import com.elif.dto.adoption.response.AdminStatisticsResponseDTO;
import com.elif.dto.adoption.response.ShelterAdminDTO;
import com.elif.entities.adoption.AdoptionPet;

import java.util.List;

public interface IAdminService {
    AdminStatisticsResponseDTO getStatistics();
    List<ShelterAdminDTO> getAllShelters();
    ShelterAdminDTO getShelterById(Long id);
    ShelterAdminDTO updateShelter(Long id, ShelterAdminDTO shelter);
    void deleteShelter(Long id);

    // AJOUTER CES MÉTHODES
    List<AdoptionPet> getAllPets();
    AdoptionPet getPetById(Long id);
    AdoptionPet createPet(AdoptionPet pet);
    AdoptionPet updatePet(Long id, AdoptionPet pet);
    void deletePet(Long id);
    ShelterAdminDTO createShelter(ShelterAdminDTO shelter);
}