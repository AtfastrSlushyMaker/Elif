package com.elif.controllers.adoption;

import com.elif.dto.adoption.response.AdminStatisticsResponseDTO;
import com.elif.dto.adoption.response.ShelterAdminDTO;
import com.elif.entities.adoption.AdoptionPet;
import com.elif.services.adoption.interfaces.IAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class AdminController {

    private final IAdminService adminService;

    // ============================================================
    // STATISTIQUES
    // ============================================================

    @GetMapping("/statistics")
    public ResponseEntity<AdminStatisticsResponseDTO> getStatistics() {
        return ResponseEntity.ok(adminService.getStatistics());
    }

    // ============================================================
    // GESTION DES REFUGES
    // ============================================================

    @GetMapping("/shelters")
    public ResponseEntity<List<ShelterAdminDTO>> getAllShelters() {
        return ResponseEntity.ok(adminService.getAllShelters());
    }

    @GetMapping("/shelters/{id}")
    public ResponseEntity<ShelterAdminDTO> getShelterById(@PathVariable Long id) {
        ShelterAdminDTO shelter = adminService.getShelterById(id);
        return ResponseEntity.ok(shelter);
    }

    @PutMapping("/shelters/{id}")
    public ResponseEntity<ShelterAdminDTO> updateShelter(@PathVariable Long id, @RequestBody ShelterAdminDTO shelter) {
        ShelterAdminDTO updated = adminService.updateShelter(id, shelter);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/shelters/{id}")
    public ResponseEntity<Void> deleteShelter(@PathVariable Long id) {
        adminService.deleteShelter(id);
        return ResponseEntity.noContent().build();
    }

    // ============================================================
    // GESTION DES ANIMAUX (AJOUTER CES ENDPOINTS)
    // ============================================================

    @GetMapping("/pets")
    public ResponseEntity<List<AdoptionPet>> getAllPets() {
        return ResponseEntity.ok(adminService.getAllPets());
    }

    @GetMapping("/pets/{id}")
    public ResponseEntity<AdoptionPet> getPetById(@PathVariable Long id) {
        AdoptionPet pet = adminService.getPetById(id);
        return ResponseEntity.ok(pet);
    }

    @PostMapping("/pets")
    public ResponseEntity<AdoptionPet> createPet(@RequestBody AdoptionPet pet) {
        AdoptionPet created = adminService.createPet(pet);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/pets/{id}")
    public ResponseEntity<AdoptionPet> updatePet(@PathVariable Long id, @RequestBody AdoptionPet pet) {
        AdoptionPet updated = adminService.updatePet(id, pet);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/pets/{id}")
    public ResponseEntity<Void> deletePet(@PathVariable Long id) {
        adminService.deletePet(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/shelters")
    public ResponseEntity<ShelterAdminDTO> createShelter(@RequestBody ShelterAdminDTO shelter) {
        ShelterAdminDTO created = adminService.createShelter(shelter);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
}