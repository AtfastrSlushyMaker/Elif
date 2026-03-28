package com.elif.services.adoption.interfaces;

import com.elif.dto.adoption.response.AdminStatisticsResponseDTO;
import com.elif.dto.adoption.response.ShelterAdminDTO;

import java.util.List;

public interface IAdminService {
    AdminStatisticsResponseDTO getStatistics();
    List<ShelterAdminDTO> getAllShelters();
    ShelterAdminDTO getShelterById(Long id);  // ← AJOUTER
}