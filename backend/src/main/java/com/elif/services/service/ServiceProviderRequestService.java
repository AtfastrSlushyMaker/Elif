package com.elif.services.service;

import com.elif.dto.service.MissionMatchDTO;
import com.elif.dto.service.ServiceProviderRequestDTO;
import com.elif.entities.service.ServiceProviderRequest;
import com.elif.entities.service.ServiceProviderRequest.RequestStatus;
import com.elif.exceptions.ResourceNotFoundException;
import com.elif.repositories.service.ServiceProviderRequestRepository;
import com.elif.repositories.service.ServiceRepository;
import com.elif.repositories.user.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ServiceProviderRequestService {

    private final ServiceProviderRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final ServiceRepository serviceRepository;
    private final CvAnalysisService cvAnalysisService;
    private final Path fileStorageLocation;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ServiceProviderRequestService(
            ServiceProviderRequestRepository requestRepository,
            UserRepository userRepository,
            ServiceRepository serviceRepository,
            CvAnalysisService cvAnalysisService) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.serviceRepository = serviceRepository;
        this.cvAnalysisService = cvAnalysisService;

        this.fileStorageLocation = Paths.get("./uploads/cv").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    // ── Créer une demande ──────────────────────────────────────────────────────
    public ServiceProviderRequestDTO createRequest(Long userId, String fullName, String email,
                                                    String phone, String description, MultipartFile cv) {
        Optional<ServiceProviderRequest> existing = requestRepository.findByUserId(userId);

        String cvFileName = null;
        if (cv != null && !cv.isEmpty()) {
            cvFileName = storeFile(cv);
        }

        ServiceProviderRequest req;

        if (existing.isPresent()) {
            RequestStatus s = existing.get().getStatus();
            if (s == RequestStatus.PENDING) {
                throw new IllegalStateException("Une demande est déjà en attente pour cet utilisateur.");
            }
            if (s == RequestStatus.APPROVED) {
                throw new IllegalStateException("Cet utilisateur est déjà approuvé.");
            }
            // REJECTED → re-soumission autorisée
            req = existing.get();
            req.setFullName(fullName);
            req.setEmail(email);
            req.setPhone(phone);
            req.setDescription(description);
            if (cvFileName != null) {
                req.setCvUrl(cvFileName);
            }
            req.setStatus(RequestStatus.PENDING);
            req.setReviewedAt(null);
        } else {
            userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

            req = ServiceProviderRequest.builder()
                    .userId(userId)
                    .fullName(fullName)
                    .email(email)
                    .phone(phone)
                    .description(description)
                    .cvUrl(cvFileName)
                    .status(RequestStatus.PENDING)
                    .build();
        }

        // ── Analyse intelligente du CV (lire depuis disque, plus fiable) ────────
        if (cvFileName != null) {
            try {
                Path storedCvPath = this.fileStorageLocation.resolve(cvFileName);
                String cvText = cvAnalysisService.extractTextFromPath(storedCvPath);
                List<com.elif.entities.service.Service> services = serviceRepository.findAll();
                CvAnalysisService.CvAnalysisResult result = cvAnalysisService.analyze(cvText, services);

                req.setCvSummary(result.summary);
                req.setCoherenceScore(result.coherenceScore);
                req.setMatchingSuggestions(objectMapper.writeValueAsString(result.missions));
            } catch (Exception e) {
                System.err.println("[CV Analysis] Erreur non-bloquante : " + e.getMessage());
                req.setCvSummary("Analyse du CV non disponible.");
                req.setCoherenceScore(null);
                req.setMatchingSuggestions("[]");
            }
        }

        return toDTO(requestRepository.save(req));
    }

    private String storeFile(MultipartFile file) {
        String originalFileName = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "cv.pdf");
        String fileExtension = "";
        try {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        } catch (Exception e) {
            fileExtension = ".pdf";
        }
        String fileName = UUID.randomUUID().toString() + fileExtension;

        try {
            if (fileName.contains("..")) {
                throw new RuntimeException("Sorry! Filename contains invalid path sequence " + fileName);
            }
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName + ". Please try again!", ex);
        }
    }

    // ── Approuver ──────────────────────────────────────────────────────────────
    public ServiceProviderRequestDTO approveRequest(Long id) {
        ServiceProviderRequest req = findById(id);
        req.setStatus(RequestStatus.APPROVED);
        req.setReviewedAt(LocalDateTime.now());
        return toDTO(requestRepository.save(req));
    }

    // ── Refuser ────────────────────────────────────────────────────────────────
    public ServiceProviderRequestDTO rejectRequest(Long id) {
        ServiceProviderRequest req = findById(id);
        req.setStatus(RequestStatus.REJECTED);
        req.setReviewedAt(LocalDateTime.now());
        return toDTO(requestRepository.save(req));
    }

    // ── Récupérer la demande d'un user ─────────────────────────────────────────
    public ServiceProviderRequestDTO getRequestByUser(Long userId) {
        return requestRepository.findByUserId(userId)
                .map(this::toDTO)
                .orElse(null);
    }

    // ── Toutes les demandes (admin) ────────────────────────────────────────────
    public List<ServiceProviderRequestDTO> getAllRequests() {
        return requestRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ── Vérifier si un user est approuvé ──────────────────────────────────────
    public boolean isUserApproved(Long userId) {
        return requestRepository.existsByUserIdAndStatus(userId, RequestStatus.APPROVED);
    }

    // ── Helper : findById ──────────────────────────────────────────────────────
    private ServiceProviderRequest findById(Long id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceProviderRequest not found with id: " + id));
    }

    // ── Charger un fichier ───────────────────────────────────────────────────
    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found " + fileName);
            }
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("File not found " + fileName);
        }
    }

    // ── Mapper entité → DTO ────────────────────────────────────────────────────
    private ServiceProviderRequestDTO toDTO(ServiceProviderRequest req) {
        // Désérialiser le JSON des missions matchées
        List<MissionMatchDTO> missions = List.of();
        if (req.getMatchingSuggestions() != null && !req.getMatchingSuggestions().isBlank()) {
            try {
                missions = objectMapper.readValue(
                        req.getMatchingSuggestions(),
                        new TypeReference<List<MissionMatchDTO>>() {});
            } catch (Exception ignored) {
                // Si le JSON est corrompu on retourne une liste vide
            }
        }

        return ServiceProviderRequestDTO.builder()
                .id(req.getId())
                .userId(req.getUserId())
                .fullName(req.getFullName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .cvUrl(req.getCvUrl())
                .description(req.getDescription())
                .status(req.getStatus())
                .createdAt(req.getCreatedAt())
                .reviewedAt(req.getReviewedAt())
                .cvSummary(req.getCvSummary())
                .coherenceScore(req.getCoherenceScore())
                .missions(missions)
                .build();
    }
}
