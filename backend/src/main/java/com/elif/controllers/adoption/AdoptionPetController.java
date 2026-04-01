package com.elif.controllers.adoption;

import com.elif.dto.adoption.request.AdoptionPetRequestDTO;
import com.elif.dto.adoption.response.AdoptionPetListDTO;
import com.elif.dto.adoption.response.AdoptionPetResponseDTO;
import com.elif.entities.adoption.AdoptionPet;
import com.elif.entities.adoption.enums.AdoptionPetType;
import com.elif.entities.adoption.enums.AdoptionPetSize;
import com.elif.services.adoption.interfaces.AdoptionPetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/adoption/pets")
@CrossOrigin(origins = "http://localhost:4200")
public class AdoptionPetController {

    private final AdoptionPetService petService;

    // ============================================================
    // CONSTRUCTEUR
    // ============================================================

    public AdoptionPetController(AdoptionPetService petService) {
        this.petService = petService;
    }

    // ============================================================
    // MÉTHODES DE BASE CRUD
    // ============================================================

    @GetMapping
    public ResponseEntity<List<AdoptionPetResponseDTO>> getAllPets() {
        List<AdoptionPet> pets = petService.findAll();
        List<AdoptionPetResponseDTO> response = pets.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/available")
    public ResponseEntity<List<AdoptionPetResponseDTO>> getAvailablePets() {
        List<AdoptionPet> pets = petService.findAvailable();
        List<AdoptionPetResponseDTO> response = pets.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list")
    public ResponseEntity<List<AdoptionPetListDTO>> getPetsList() {
        List<AdoptionPet> pets = petService.findAvailable();
        List<AdoptionPetListDTO> response = pets.stream()
                .map(this::toListDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdoptionPetResponseDTO> getPetById(@PathVariable Long id) {
        AdoptionPet pet = petService.findById(id);
        return ResponseEntity.ok(toResponseDTO(pet));
    }

    @GetMapping("/shelter/{shelterId}")
    public ResponseEntity<List<AdoptionPetResponseDTO>> getPetsByShelter(@PathVariable Long shelterId) {
        List<AdoptionPet> pets = petService.findByShelterId(shelterId);
        List<AdoptionPetResponseDTO> response = pets.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<AdoptionPetResponseDTO> createPet(
            @RequestBody AdoptionPetRequestDTO request,
            @RequestParam Long shelterId) {
        AdoptionPet pet = toEntity(request);
        AdoptionPet created = petService.create(pet, shelterId);
        return new ResponseEntity<>(toResponseDTO(created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdoptionPetResponseDTO> updatePet(
            @PathVariable Long id,
            @RequestBody AdoptionPetRequestDTO request) {
        AdoptionPet pet = toEntity(request);
        AdoptionPet updated = petService.update(id, pet);
        return ResponseEntity.ok(toResponseDTO(updated));
    }

    @PutMapping("/{id}/adopt")
    public ResponseEntity<AdoptionPetResponseDTO> markAsAdopted(@PathVariable Long id) {
        AdoptionPet adopted = petService.markAsAdopted(id);
        return ResponseEntity.ok(toResponseDTO(adopted));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePet(@PathVariable Long id) {
        petService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ============================================================
    // MÉTHODES DE RECHERCHE ET FILTRAGE
    // ============================================================

    @GetMapping("/type/{type}")
    public ResponseEntity<List<AdoptionPetResponseDTO>> getPetsByType(@PathVariable AdoptionPetType type) {
        List<AdoptionPet> pets = petService.findAvailableByType(type);
        List<AdoptionPetResponseDTO> response = pets.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/size/{size}")
    public ResponseEntity<List<AdoptionPetResponseDTO>> getPetsBySize(@PathVariable AdoptionPetSize size) {
        List<AdoptionPet> pets = petService.findAvailableBySize(size);
        List<AdoptionPetResponseDTO> response = pets.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/breed/{breed}")
    public ResponseEntity<List<AdoptionPetResponseDTO>> getPetsByBreed(@PathVariable String breed) {
        List<AdoptionPet> pets = petService.findByBreed(breed);
        List<AdoptionPetResponseDTO> response = pets.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<AdoptionPetResponseDTO>> advancedSearch(
            @RequestParam(required = false) AdoptionPetType type,
            @RequestParam(required = false) String breed,
            @RequestParam(required = false) Integer minAge,
            @RequestParam(required = false) Integer maxAge,
            @RequestParam(required = false) AdoptionPetSize size,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) Boolean spayedNeutered) {
        List<AdoptionPet> pets = petService.advancedSearch(type, breed, minAge, maxAge, size, gender, spayedNeutered);
        List<AdoptionPetResponseDTO> response = pets.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // ============================================================
    // MÉTHODES DE RECOMMANDATION
    // ============================================================

    @GetMapping("/{id}/similar")
    public ResponseEntity<List<AdoptionPetResponseDTO>> getSimilarPets(
            @PathVariable Long id,
            @RequestParam(defaultValue = "5") Long limit) {
        List<AdoptionPet> pets = petService.findSimilarPets(id, limit);
        List<AdoptionPetResponseDTO> response = pets.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/urgent")
    public ResponseEntity<List<AdoptionPetResponseDTO>> getUrgentPets() {
        List<AdoptionPet> pets = petService.findUrgentPets();
        List<AdoptionPetResponseDTO> response = pets.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<AdoptionPetResponseDTO>> getRecentlyAdded(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "30") int days) {
        List<AdoptionPet> pets = petService.findRecentlyAdded(limit, days);
        List<AdoptionPetResponseDTO> response = pets.stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // ============================================================
    // MÉTHODES DE STATISTIQUES
    // ============================================================

    @GetMapping("/count/available")
    public ResponseEntity<Long> countAvailable() {
        return ResponseEntity.ok(petService.countAvailable());
    }

    @GetMapping("/stats/by-type")
    public ResponseEntity<List<Object[]>> getCountByType() {
        return ResponseEntity.ok(petService.countByType());
    }

    @GetMapping("/stats/by-size")
    public ResponseEntity<List<Object[]>> getCountBySize() {
        return ResponseEntity.ok(petService.countBySize());
    }

    @GetMapping("/stats/most-requested")
    public ResponseEntity<List<Object[]>> getMostRequestedPets(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(petService.findMostRequestedPets(limit));
    }

    // ============================================================
    // MÉTHODES DE CONVERSION
    // ============================================================

    private AdoptionPetResponseDTO toResponseDTO(AdoptionPet pet) {
        if (pet == null) {
            return null;
        }
        return AdoptionPetResponseDTO.builder()
                .id(pet.getId())
                .name(pet.getName())
                .type(pet.getType())
                .breed(pet.getBreed())
                .age(pet.getAge())
                .gender(pet.getGender())
                .size(pet.getSize())
                .color(pet.getColor())
                .healthStatus(pet.getHealthStatus())
                .spayedNeutered(pet.getSpayedNeutered())
                .specialNeeds(pet.getSpecialNeeds())
                .description(pet.getDescription())
                .photos(pet.getPhotos())
                .available(pet.getAvailable())
                .shelterId(pet.getShelter() != null ? pet.getShelter().getId() : null)
                .shelterName(pet.getShelter() != null ? pet.getShelter().getName() : null)
                .createdAt(pet.getCreatedAt())
                .adoptedAt(pet.getAdoptedAt())
                .build();
    }

    private AdoptionPetListDTO toListDTO(AdoptionPet pet) {
        if (pet == null) {
            return null;
        }
        return AdoptionPetListDTO.builder()
                .id(pet.getId())
                .name(pet.getName())
                .type(pet.getType())
                .breed(pet.getBreed())
                .age(pet.getAge())
                .size(pet.getSize())
                .shelterId(pet.getShelter() != null ? pet.getShelter().getId() : null)
                .shelterName(pet.getShelter() != null ? pet.getShelter().getName() : null)
                .build();
    }

    private AdoptionPet toEntity(AdoptionPetRequestDTO dto) {
        AdoptionPet pet = new AdoptionPet();
        pet.setName(dto.getName());
        pet.setType(dto.getType());
        pet.setBreed(dto.getBreed());
        pet.setAge(dto.getAge());
        pet.setGender(dto.getGender());
        pet.setSize(dto.getSize());
        pet.setColor(dto.getColor());
        pet.setHealthStatus(dto.getHealthStatus());
        pet.setSpayedNeutered(dto.getSpayedNeutered());
        pet.setSpecialNeeds(dto.getSpecialNeeds());
        pet.setDescription(dto.getDescription());
        pet.setPhotos(dto.getPhotos());
        return pet;
    }
}