package com.elif.controllers.veterinarian;

import com.elif.dto.veterinarian.VeterinarianDTO;
import com.elif.entities.veterinarian.Veterinarian;
import com.elif.services.veterinarian.VeterinarianService;
import com.elif.exceptions.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/veterinarians")
public class VeterinarianController {

    private final VeterinarianService veterinarianService;

    public VeterinarianController(VeterinarianService veterinarianService) {
        this.veterinarianService = veterinarianService;
    }

    /**
     * GET /api/veterinarians
     * Récupère tous les vétérinaires
     */
    @GetMapping
    public ResponseEntity<List<Veterinarian>> getAll() {
        List<Veterinarian> veterinarians = veterinarianService.getAll();
        return ResponseEntity.ok(veterinarians);
    }

    /**
     * GET /api/veterinarians/{id}
     * Récupère un vétérinaire par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Veterinarian> getById(@PathVariable Long id) {
        Veterinarian veterinarian = veterinarianService.getById(id);
        return ResponseEntity.ok(veterinarian);
    }

    /**
     * GET /api/veterinarians/available
     * Récupère tous les vétérinaires disponibles
     */
    @GetMapping("/available")
    public ResponseEntity<List<Veterinarian>> getAvailable() {
        List<Veterinarian> veterinarians = veterinarianService.getAvailable();
        return ResponseEntity.ok(veterinarians);
    }

    /**
     * GET /api/veterinarians/speciality/{speciality}
     * Récupère tous les vétérinaires par spécialité
     */
    @GetMapping("/speciality/{speciality}")
    public ResponseEntity<List<Veterinarian>> getBySpeciality(@PathVariable String speciality) {
        List<Veterinarian> veterinarians = veterinarianService.getBySpeciality(speciality);
        return ResponseEntity.ok(veterinarians);
    }

    /**
     * POST /api/veterinarians
     * Crée un nouveau vétérinaire
     */
    @PostMapping
    public ResponseEntity<Veterinarian> create(@RequestBody VeterinarianDTO veterinarianDTO) {
        Veterinarian created = veterinarianService.create(veterinarianDTO);
        return ResponseEntity.status(201).body(created);
    }

    /**
     * PUT /api/veterinarians/{id}
     * Met à jour un vétérinaire existant
     */
    @PutMapping("/{id}")
    public ResponseEntity<Veterinarian> update(@PathVariable Long id, @RequestBody VeterinarianDTO veterinarianDTO) {
        Veterinarian updated = veterinarianService.update(id, veterinarianDTO);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/veterinarians/{id}
     * Supprime un vétérinaire
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        veterinarianService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /api/veterinarians/{id}/availability
     * Met à jour la disponibilité d'un vétérinaire
     */
    @PatchMapping("/{id}/availability")
    public ResponseEntity<Veterinarian> updateAvailability(
            @PathVariable Long id,
            @RequestParam boolean available) {
        Veterinarian updated = veterinarianService.updateAvailability(id, available);
        return ResponseEntity.ok(updated);
    }
}
