package com.elif.services.service;

import com.elif.dto.service.ServiceProviderRequestDTO;
import com.elif.entities.service.ServiceProviderRequest;
import com.elif.entities.service.ServiceProviderRequest.RequestStatus;
import com.elif.entities.user.User;
import com.elif.exceptions.ResourceNotFoundException;
import com.elif.repositories.service.ServiceProviderRequestRepository;
import com.elif.repositories.user.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ServiceProviderRequestService {

    private final ServiceProviderRequestRepository requestRepository;
    private final UserRepository userRepository;

    public ServiceProviderRequestService(
            ServiceProviderRequestRepository requestRepository,
            UserRepository userRepository) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
    }

    // ── Créer une demande ──────────────────────────────────────────────────────
    public ServiceProviderRequestDTO createRequest(Long userId, String message) {
        // Un user ne peut avoir qu'une seule demande active (PENDING ou APPROVED)
        Optional<ServiceProviderRequest> existing = requestRepository.findByUserId(userId);
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
            req.setMessage(message);
            req.setStatus(RequestStatus.PENDING);
            req.setReviewedAt(null);
            return toDTO(requestRepository.save(req));
        }

        // Vérifier que l'utilisateur existe
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        ServiceProviderRequest req = ServiceProviderRequest.builder()
                .userId(userId)
                .message(message)
                .status(RequestStatus.PENDING)
                .build();

        return toDTO(requestRepository.save(req));
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
        String fullName = "";
        Optional<User> user = userRepository.findById(req.getUserId());
        if (user.isPresent()) {
            fullName = user.get().getFirstName() + " " + user.get().getLastName();
        }
        return ServiceProviderRequestDTO.builder()
                .id(req.getId())
                .userId(req.getUserId())
                .userFullName(fullName)
                .message(req.getMessage())
                .status(req.getStatus())
                .createdAt(req.getCreatedAt())
                .reviewedAt(req.getReviewedAt())
                .build();
    }
}
