package com.elif.services.veterinarian;

import com.elif.dto.veterinarian.VeterinarianDTO;
import com.elif.entities.veterinarian.Veterinarian;
import com.elif.exceptions.ResourceNotFoundException;
import com.elif.repositories.veterinarian.VeterinarianRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class VeterinarianService {

    private final VeterinarianRepository veterinarianRepository;

    public VeterinarianService(VeterinarianRepository veterinarianRepository) {
        this.veterinarianRepository = veterinarianRepository;
    }

    /**
     * Récupère tous les vétérinaires
     */
    public List<Veterinarian> getAll() {
        return veterinarianRepository.findAll();
    }

    /**
     * Récupère un vétérinaire par ID
     */
    public Veterinarian getById(Long id) {
        return veterinarianRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Veterinarian not found with id: " + id));
    }

    /**
     * Récupère tous les vétérinaires disponibles
     */
    public List<Veterinarian> getAvailable() {
        return veterinarianRepository.findByAvailable(true);
    }

    /**
     * Récupère tous les vétérinaires par spécialité
     */
    public List<Veterinarian> getBySpeciality(String speciality) {
        return veterinarianRepository.findBySpeciality(speciality);
    }

    /**
     * Crée un nouveau vétérinaire à partir d'un DTO
     */
    public Veterinarian create(VeterinarianDTO veterinarianDTO) {
        Veterinarian veterinarian = new Veterinarian();
        veterinarian.setName(veterinarianDTO.getName());
        veterinarian.setEmail(veterinarianDTO.getEmail());
        veterinarian.setPhone(veterinarianDTO.getPhone());
        veterinarian.setSpeciality(veterinarianDTO.getSpeciality());
        veterinarian.setExperienceYears(veterinarianDTO.getExperienceYears() != null ? veterinarianDTO.getExperienceYears() : 0);
        veterinarian.setClinicAddress(veterinarianDTO.getClinicAddress());
        veterinarian.setAvailable(veterinarianDTO.getAvailable() != null ? veterinarianDTO.getAvailable() : true);
        return veterinarianRepository.save(veterinarian);
    }

    /**
     * Met à jour un vétérinaire existant à partir d'un DTO
     */
    public Veterinarian update(Long id, VeterinarianDTO veterinarianDTO) {
        Veterinarian existing = getById(id);
        
        if (veterinarianDTO.getName() != null) {
            existing.setName(veterinarianDTO.getName());
        }
        if (veterinarianDTO.getEmail() != null) {
            existing.setEmail(veterinarianDTO.getEmail());
        }
        if (veterinarianDTO.getPhone() != null) {
            existing.setPhone(veterinarianDTO.getPhone());
        }
        if (veterinarianDTO.getSpeciality() != null) {
            existing.setSpeciality(veterinarianDTO.getSpeciality());
        }
        if (veterinarianDTO.getExperienceYears() != null && veterinarianDTO.getExperienceYears() > 0) {
            existing.setExperienceYears(veterinarianDTO.getExperienceYears());
        }
        if (veterinarianDTO.getClinicAddress() != null) {
            existing.setClinicAddress(veterinarianDTO.getClinicAddress());
        }
        if (veterinarianDTO.getAvailable() != null) {
            existing.setAvailable(veterinarianDTO.getAvailable());
        }
        
        return veterinarianRepository.save(existing);
    }

    /**
     * Supprime un vétérinaire
     */
    public void delete(Long id) {
        Veterinarian existing = getById(id);
        veterinarianRepository.delete(existing);
    }

    /**
     * Met à jour la disponibilité d'un vétérinaire
     */
    public Veterinarian updateAvailability(Long id, boolean available) {
        Veterinarian veterinarian = getById(id);
        veterinarian.setAvailable(available);
        return veterinarianRepository.save(veterinarian);
    }
}
