package com.elif.services.pet_transit;

import com.elif.dto.pet_transit.request.TravelDestinationCreateRequest;
import com.elif.dto.pet_transit.request.TravelDestinationUpdateRequest;
import com.elif.dto.pet_transit.response.TravelDestinationResponse;
import com.elif.dto.pet_transit.response.TravelDestinationSummaryResponse;
import com.elif.entities.pet_transit.TravelDestination;
import com.elif.entities.pet_transit.enums.DestinationStatus;
import com.elif.entities.pet_transit.enums.DocumentType;
import com.elif.entities.user.Role;
import com.elif.entities.user.User;
import com.elif.exceptions.pet_transit.TravelDestinationNotFoundException;
import com.elif.exceptions.pet_transit.UnauthorizedTravelAccessException;
import com.elif.repositories.pet_transit.TravelDestinationRepository;
import com.elif.repositories.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
public class TravelDestinationService {

    private final TravelDestinationRepository travelDestinationRepository;
    private final UserRepository userRepository;

    public TravelDestinationResponse createDestination(Long adminId, TravelDestinationCreateRequest req) {
        getAdminUser(adminId);

        Set<DocumentType> requiredDocs = req.getRequiredDocuments() != null
                ? req.getRequiredDocuments()
                : new HashSet<>();

        TravelDestination destination = TravelDestination.builder()
                .title(req.getTitle())
                .country(req.getCountry())
                .region(req.getRegion())
                .destinationType(req.getDestinationType())
                .recommendedTransportType(req.getRecommendedTransportType())
                .petFriendlyLevel(req.getPetFriendlyLevel())
                .description(req.getDescription())
                .safetyTips(req.getSafetyTips())
                .requiredDocuments(requiredDocs)
                .coverImageUrl(req.getCoverImageUrl())
                .latitude(req.getLatitude())
                .longitude(req.getLongitude())
                .status(DestinationStatus.DRAFT)
                .build();

        TravelDestination saved = travelDestinationRepository.save(destination);
        return toResponse(saved);
    }

    public TravelDestinationResponse updateDestination(Long id, Long adminId, TravelDestinationUpdateRequest req) {
        getAdminUser(adminId);

        TravelDestination destination = travelDestinationRepository.findById(id)
                .orElseThrow(() -> new TravelDestinationNotFoundException("Destination not found with id: " + id));

        if (req.getTitle() != null) {
            destination.setTitle(req.getTitle());
        }
        if (req.getCountry() != null) {
            destination.setCountry(req.getCountry());
        }
        if (req.getRegion() != null) {
            destination.setRegion(req.getRegion());
        }
        if (req.getDestinationType() != null) {
            destination.setDestinationType(req.getDestinationType());
        }
        if (req.getRecommendedTransportType() != null) {
            destination.setRecommendedTransportType(req.getRecommendedTransportType());
        }
        if (req.getPetFriendlyLevel() != null) {
            destination.setPetFriendlyLevel(req.getPetFriendlyLevel());
        }
        if (req.getDescription() != null) {
            destination.setDescription(req.getDescription());
        }
        if (req.getSafetyTips() != null) {
            destination.setSafetyTips(req.getSafetyTips());
        }
        if (req.getRequiredDocuments() != null) {
            destination.setRequiredDocuments(req.getRequiredDocuments());
        }
        if (req.getCoverImageUrl() != null) {
            destination.setCoverImageUrl(req.getCoverImageUrl());
        }
        if (req.getLatitude() != null) {
            destination.setLatitude(req.getLatitude());
        }
        if (req.getLongitude() != null) {
            destination.setLongitude(req.getLongitude());
        }

        TravelDestination updated = travelDestinationRepository.save(destination);
        return toResponse(updated);
    }

    public TravelDestinationResponse publishDestination(Long id, Long adminId) {
        getAdminUser(adminId);

        TravelDestination destination = travelDestinationRepository.findById(id)
                .orElseThrow(() -> new TravelDestinationNotFoundException("Destination not found with id: " + id));

        destination.setStatus(DestinationStatus.PUBLISHED);
        destination.setPublishedAt(LocalDateTime.now());
        destination.setScheduledPublishAt(null);

        TravelDestination updated = travelDestinationRepository.save(destination);
        return toResponse(updated);
    }

    public TravelDestinationResponse scheduleDestination(Long id, Long adminId, LocalDateTime scheduledAt) {
        getAdminUser(adminId);

        if (scheduledAt == null) {
            throw new IllegalArgumentException("scheduledAt is required");
        }

        TravelDestination destination = travelDestinationRepository.findById(id)
                .orElseThrow(() -> new TravelDestinationNotFoundException("Destination not found with id: " + id));

        destination.setStatus(DestinationStatus.SCHEDULED);
        destination.setScheduledPublishAt(scheduledAt);

        TravelDestination updated = travelDestinationRepository.save(destination);
        return toResponse(updated);
    }

    public TravelDestinationResponse archiveDestination(Long id, Long adminId) {
        getAdminUser(adminId);

        TravelDestination destination = travelDestinationRepository.findById(id)
                .orElseThrow(() -> new TravelDestinationNotFoundException("Destination not found with id: " + id));

        destination.setStatus(DestinationStatus.ARCHIVED);
        destination.setScheduledPublishAt(null);

        TravelDestination updated = travelDestinationRepository.save(destination);
        return toResponse(updated);
    }

    public void deleteDestination(Long id, Long adminId) {
        archiveDestination(id, adminId);
    }

    public List<TravelDestinationSummaryResponse> getPublishedDestinations() {
        return travelDestinationRepository.findByStatusOrderByCreatedAtDesc(DestinationStatus.PUBLISHED)
                .stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    public List<TravelDestinationResponse> getAllDestinations(Long adminId) {
        getAdminUser(adminId);

        return travelDestinationRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TravelDestinationResponse getById(Long id) {
        TravelDestination destination = travelDestinationRepository.findById(id)
                .orElseThrow(() -> new TravelDestinationNotFoundException("Destination not found with id: " + id));

        if (destination.getStatus() != DestinationStatus.PUBLISHED) {
            throw new TravelDestinationNotFoundException("Published destination not found with id: " + id);
        }

        return toResponse(destination);
    }

    private User getAdminUser(Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new UnauthorizedTravelAccessException("Admin user not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new UnauthorizedTravelAccessException("User " + adminId + " is not an admin");
        }

        return admin;
    }

    private TravelDestinationResponse toResponse(TravelDestination destination) {
        Set<String> requiredDocs = destination.getRequiredDocuments() != null
                ? destination.getRequiredDocuments().stream()
                .map(Enum::name)
                .collect(Collectors.toSet())
                : new HashSet<>();

        return TravelDestinationResponse.builder()
                .id(destination.getId())
                .title(destination.getTitle())
                .country(destination.getCountry())
                .region(destination.getRegion())
                .destinationType(destination.getDestinationType())
                .recommendedTransportType(destination.getRecommendedTransportType())
                .petFriendlyLevel(destination.getPetFriendlyLevel())
                .description(destination.getDescription())
                .safetyTips(destination.getSafetyTips())
                .requiredDocuments(requiredDocs)
                .coverImageUrl(destination.getCoverImageUrl())
                .latitude(destination.getLatitude())
                .longitude(destination.getLongitude())
                .status(destination.getStatus())
                .scheduledPublishAt(destination.getScheduledPublishAt())
                .publishedAt(destination.getPublishedAt())
                .createdAt(destination.getCreatedAt())
                .updatedAt(destination.getUpdatedAt())
                .build();
    }

    private TravelDestinationSummaryResponse toSummaryResponse(TravelDestination destination) {
        return TravelDestinationSummaryResponse.builder()
                .id(destination.getId())
                .title(destination.getTitle())
                .country(destination.getCountry())
                .region(destination.getRegion())
                .destinationType(destination.getDestinationType())
                .recommendedTransportType(destination.getRecommendedTransportType())
                .petFriendlyLevel(destination.getPetFriendlyLevel())
                .coverImageUrl(destination.getCoverImageUrl())
                .status(destination.getStatus())
                .build();
    }
}