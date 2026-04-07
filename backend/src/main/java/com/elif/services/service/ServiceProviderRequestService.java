package com.elif.services.service;

import com.elif.dto.service.ServiceProviderRequestDTO;
import com.elif.entities.service.ServiceProviderRequest;
import com.elif.entities.service.ServiceProviderRequest.RequestStatus;
import com.elif.exceptions.ResourceNotFoundException;
import com.elif.repositories.service.ServiceProviderRequestRepository;
import com.elif.repositories.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.io.IOException;
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
    private final Path fileStorageLocation;

    public ServiceProviderRequestService(
            ServiceProviderRequestRepository requestRepository,
            UserRepository userRepository) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        
        this.fileStorageLocation = Paths.get("./uploads/cv").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    // ── Créer une demande ──────────────────────────────────────────────────────
    public ServiceProviderRequestDTO createRequest(Long userId, String fullName, String email, String phone, String description, MultipartFile cv) {
        // Un user ne peut avoir qu'une seule demande active (PENDING)
        Optional<ServiceProviderRequest> existing = requestRepository.findByUserId(userId);
        
        String cvFileName = null;
        if (cv != null && !cv.isEmpty()) {
            cvFileName = storeFile(cv);
        }

        if (existing.isPresent()) {
            RequestStatus s = existing.get().getStatus();
            if (s == RequestStatus.PENDING) {
                throw new IllegalStateException("Une demande est déjà en attente pour cet utilisateur.");
            }
            if (s == RequestStatus.APPROVED) {
                throw new IllegalStateException("Cet utilisateur est déjà approuvé.");
            }
            // Si REJECTED → on permet de re-soumettre (on met à jour)
            ServiceProviderRequest req = existing.get();
            req.setFullName(fullName);
            req.setEmail(email);
            req.setPhone(phone);
            req.setDescription(description);
            if (cvFileName != null) {
                req.setCvUrl(cvFileName);
            }
            req.setStatus(RequestStatus.PENDING);
            req.setReviewedAt(null);
            return toDTO(requestRepository.save(req));
        }

        // Vérifier que l'utilisateur existe
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        ServiceProviderRequest req = ServiceProviderRequest.builder()
                .userId(userId)
                .fullName(fullName)
                .email(email)
                .phone(phone)
                .description(description)
                .cvUrl(cvFileName)
                .status(RequestStatus.PENDING)
                .build();

        return toDTO(requestRepository.save(req));
    }

    private String storeFile(MultipartFile file) {
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "cv.pdf");
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

    // ── Mapper entité → DTO ────────────────────────────────────────────────────
    private ServiceProviderRequestDTO toDTO(ServiceProviderRequest req) {
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
                .build();
    }
}
