package com.elif.services.pet_transit;

import com.elif.dto.pet_transit.request.TravelPlanCreateRequest;
import com.elif.dto.pet_transit.request.TravelPlanUpdateRequest;
import com.elif.dto.pet_transit.response.TravelPlanResponse;
import com.elif.dto.pet_transit.response.TravelPlanSummaryResponse;
import com.elif.entities.pet_transit.TravelDestination;
import com.elif.entities.pet_transit.TravelPlan;
import com.elif.entities.pet_transit.enums.DestinationStatus;
import com.elif.entities.pet_transit.enums.TravelPlanStatus;
import com.elif.entities.user.Role;
import com.elif.entities.user.User;
import com.elif.exceptions.pet_transit.InvalidPlanStatusException;
import com.elif.exceptions.pet_transit.TravelDestinationNotFoundException;
import com.elif.exceptions.pet_transit.TravelPlanNotFoundException;
import com.elif.exceptions.pet_transit.UnauthorizedTravelAccessException;
import com.elif.repositories.pet_transit.TravelDestinationRepository;
import com.elif.repositories.pet_transit.TravelPlanRepository;
import com.elif.repositories.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
public class TravelPlanService {

    private static final BigDecimal MIN_SUBMIT_SCORE = BigDecimal.valueOf(80);
    private static final BigDecimal MIN_SCORE = BigDecimal.ZERO;
    private static final BigDecimal MAX_SCORE = BigDecimal.valueOf(100);

    private static final Set<TravelPlanStatus> DELETABLE_STATUSES = EnumSet.of(
            TravelPlanStatus.DRAFT,
            TravelPlanStatus.IN_PREPARATION,
            TravelPlanStatus.REJECTED,
            TravelPlanStatus.CANCELLED,
            TravelPlanStatus.COMPLETED
    );

    private final TravelPlanRepository travelPlanRepository;
    private final TravelDestinationRepository travelDestinationRepository;
    private final UserRepository userRepository;
    private final ChecklistGeneratorService checklistGeneratorService;
    private final ReadinessScoreService readinessScoreService;

    public TravelPlanResponse createTravelPlan(Long ownerId, TravelPlanCreateRequest req) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new UnauthorizedTravelAccessException("Owner user not found"));

        TravelDestination destination = travelDestinationRepository.findById(req.getDestinationId())
                .orElseThrow(() ->
                        new TravelDestinationNotFoundException("Destination not found with id: " + req.getDestinationId()));

        if (destination.getStatus() != DestinationStatus.PUBLISHED) {
            throw new TravelDestinationNotFoundException(
                    "Destination is not available for planning with id: " + req.getDestinationId());
        }

        TravelPlan travelPlan = TravelPlan.builder()
                .owner(owner)
                .petId(req.getPetId())
                .destination(destination)
                .origin(req.getOrigin())
                .transportType(req.getTransportType())
                .travelDate(req.getTravelDate())
                .returnDate(req.getReturnDate())
                .estimatedTravelHours(req.getEstimatedTravelHours())
                .estimatedTravelCost(req.getEstimatedTravelCost())
                .currency(req.getCurrency())
                .animalWeight(req.getAnimalWeight())
                .cageLength(req.getCageLength())
                .cageWidth(req.getCageWidth())
                .cageHeight(req.getCageHeight())
                .hydrationIntervalMinutes(req.getHydrationIntervalMinutes())
                .requiredStops(req.getRequiredStops())
                .status(TravelPlanStatus.IN_PREPARATION)
                .build();

        TravelPlan saved = travelPlanRepository.save(travelPlan);
        checklistGeneratorService.generateForPlan(saved);
        readinessScoreService.recalculateAndSave(saved.getId());
        return toResponse(saved);
    }

    public TravelPlanResponse updateTravelPlan(Long planId, Long ownerId, TravelPlanUpdateRequest req) {
        TravelPlan travelPlan = getTravelPlanAndCheckOwnership(planId, ownerId);

        if (travelPlan.getStatus() != TravelPlanStatus.DRAFT
                && travelPlan.getStatus() != TravelPlanStatus.IN_PREPARATION) {
            throw new InvalidPlanStatusException(
                    "Plan cannot be updated with status: " + travelPlan.getStatus());
        }

        if (req.getOrigin() != null) {
            travelPlan.setOrigin(req.getOrigin());
        }
        if (req.getTransportType() != null) {
            travelPlan.setTransportType(req.getTransportType());
        }
        if (req.getTravelDate() != null) {
            travelPlan.setTravelDate(req.getTravelDate());
        }
        if (req.getReturnDate() != null) {
            travelPlan.setReturnDate(req.getReturnDate());
        }
        if (req.getEstimatedTravelHours() != null) {
            travelPlan.setEstimatedTravelHours(req.getEstimatedTravelHours());
        }
        if (req.getEstimatedTravelCost() != null) {
            travelPlan.setEstimatedTravelCost(req.getEstimatedTravelCost());
        }
        if (req.getCurrency() != null) {
            travelPlan.setCurrency(req.getCurrency());
        }
        if (req.getAnimalWeight() != null) {
            travelPlan.setAnimalWeight(req.getAnimalWeight());
        }
        if (req.getCageLength() != null) {
            travelPlan.setCageLength(req.getCageLength());
        }
        if (req.getCageWidth() != null) {
            travelPlan.setCageWidth(req.getCageWidth());
        }
        if (req.getCageHeight() != null) {
            travelPlan.setCageHeight(req.getCageHeight());
        }
        if (req.getHydrationIntervalMinutes() != null) {
            travelPlan.setHydrationIntervalMinutes(req.getHydrationIntervalMinutes());
        }
        if (req.getRequiredStops() != null) {
            travelPlan.setRequiredStops(req.getRequiredStops());
        }

        TravelPlan updated = travelPlanRepository.save(travelPlan);
        BigDecimal recalculatedScore = readinessScoreService.recalculateAndSave(updated.getId());
        updated.setReadinessScore(recalculatedScore);
        return toResponse(updated);
    }

    public List<TravelPlanSummaryResponse> getMyPlans(Long ownerId) {
        return travelPlanRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId)
                .stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    public TravelPlanResponse getPlanById(Long planId, Long ownerId) {
        TravelPlan travelPlan = getTravelPlanAndCheckOwnership(planId, ownerId);
        return toResponse(travelPlan);
    }

    public TravelPlanResponse submitPlan(Long planId, Long ownerId) {
        TravelPlan travelPlan = getTravelPlanAndCheckOwnership(planId, ownerId);

        if (travelPlan.getStatus() != TravelPlanStatus.IN_PREPARATION) {
            throw new InvalidPlanStatusException(
                    "Plan cannot be submitted with status: " + travelPlan.getStatus());
        }

        BigDecimal recalculatedScore = readinessScoreService.recalculateAndSave(planId);
        travelPlan.setReadinessScore(recalculatedScore);

        if (recalculatedScore.compareTo(MIN_SUBMIT_SCORE) < 0) {
            throw new InvalidPlanStatusException("Plan readiness score must be >= 80 to submit");
        }

        travelPlan.setStatus(TravelPlanStatus.SUBMITTED);
        travelPlan.setSubmittedAt(LocalDateTime.now());

        TravelPlan updated = travelPlanRepository.save(travelPlan);
        return toResponse(updated);
    }

    public TravelPlanResponse approvePlan(Long planId, Long adminId, String comment) {
        TravelPlan travelPlan = travelPlanRepository.findById(planId)
                .orElseThrow(() -> new TravelPlanNotFoundException("Plan not found with id: " + planId));

        if (travelPlan.getStatus() != TravelPlanStatus.SUBMITTED) {
            throw new InvalidPlanStatusException(
                    "Plan cannot be approved with status: " + travelPlan.getStatus());
        }

        User admin = getAdminUser(adminId);

        travelPlan.setStatus(TravelPlanStatus.APPROVED);
        travelPlan.setReviewedAt(LocalDateTime.now());
        travelPlan.setReviewedByAdmin(admin);
        travelPlan.setAdminDecisionComment(comment);

        TravelPlan updated = travelPlanRepository.save(travelPlan);
        return toResponse(updated);
    }

    public TravelPlanResponse rejectPlan(Long planId, Long adminId, String comment) {
        TravelPlan travelPlan = travelPlanRepository.findById(planId)
                .orElseThrow(() -> new TravelPlanNotFoundException("Plan not found with id: " + planId));

        if (travelPlan.getStatus() != TravelPlanStatus.SUBMITTED) {
            throw new InvalidPlanStatusException(
                    "Plan cannot be rejected with status: " + travelPlan.getStatus());
        }

        User admin = getAdminUser(adminId);

        travelPlan.setStatus(TravelPlanStatus.REJECTED);
        travelPlan.setReviewedAt(LocalDateTime.now());
        travelPlan.setReviewedByAdmin(admin);
        travelPlan.setAdminDecisionComment(comment);

        TravelPlan updated = travelPlanRepository.save(travelPlan);
        return toResponse(updated);
    }

    public TravelPlanResponse completePlan(Long planId, Long ownerId) {
        TravelPlan travelPlan = getTravelPlanAndCheckOwnership(planId, ownerId);

        if (travelPlan.getStatus() != TravelPlanStatus.APPROVED) {
            throw new InvalidPlanStatusException(
                    "Plan cannot be completed with status: " + travelPlan.getStatus());
        }

        travelPlan.setStatus(TravelPlanStatus.COMPLETED);

        TravelPlan updated = travelPlanRepository.save(travelPlan);
        return toResponse(updated);
    }

    public TravelPlanResponse cancelPlan(Long planId, Long ownerId) {
        TravelPlan travelPlan = getTravelPlanAndCheckOwnership(planId, ownerId);

        if (travelPlan.getStatus() == TravelPlanStatus.COMPLETED) {
            throw new InvalidPlanStatusException("Cannot cancel a completed plan");
        }

        travelPlan.setStatus(TravelPlanStatus.CANCELLED);

        TravelPlan updated = travelPlanRepository.save(travelPlan);
        return toResponse(updated);
    }

    public void deletePlan(Long planId, Long requesterId) {
        TravelPlan travelPlan = getTravelPlanAndCheckDeleteAccess(planId, requesterId);

        if (!DELETABLE_STATUSES.contains(travelPlan.getStatus())) {
            throw new InvalidPlanStatusException(
                    "Travel plan can be permanently deleted only when status is DRAFT, IN_PREPARATION, REJECTED, CANCELLED or COMPLETED"
            );
        }

        travelPlanRepository.delete(travelPlan);
    }


    private TravelPlan getTravelPlanAndCheckDeleteAccess(Long planId, Long requesterId) {
        TravelPlan travelPlan = travelPlanRepository.findById(planId)
                .orElseThrow(() -> new TravelPlanNotFoundException("Plan not found with id: " + planId));

        boolean isOwner = travelPlan.getOwner().getId().equals(requesterId);

        boolean isAdmin = userRepository.findById(requesterId)
                .map(user -> user.getRole() == Role.ADMIN)
                .orElse(false);

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedTravelAccessException(
                    "User " + requesterId + " is not allowed to delete this plan"
            );
        }

        return travelPlan;
    }

    public List<TravelPlanResponse> getSubmittedPlans(Long adminId) {
        getAdminUser(adminId);

        return travelPlanRepository.findByStatusOrderByCreatedAtDesc(TravelPlanStatus.SUBMITTED)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public void updateReadinessScore(Long planId, BigDecimal score) {
        TravelPlan travelPlan = travelPlanRepository.findById(planId)
                .orElseThrow(() -> new TravelPlanNotFoundException("Plan not found with id: " + planId));

        if (score == null) {
            throw new IllegalArgumentException("Readiness score cannot be null");
        }

        BigDecimal boundedScore = score;
        if (boundedScore.compareTo(MIN_SCORE) < 0) {
            boundedScore = MIN_SCORE;
        } else if (boundedScore.compareTo(MAX_SCORE) > 0) {
            boundedScore = MAX_SCORE;
        }

        travelPlan.setReadinessScore(boundedScore);
        travelPlanRepository.save(travelPlan);
    }

    private TravelPlan getTravelPlanAndCheckOwnership(Long planId, Long ownerId) {
        TravelPlan travelPlan = travelPlanRepository.findById(planId)
                .orElseThrow(() -> new TravelPlanNotFoundException("Plan not found with id: " + planId));

        if (!travelPlan.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedTravelAccessException(
                    "User " + ownerId + " is not the owner of this plan");
        }

        return travelPlan;
    }

    private User getAdminUser(Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new UnauthorizedTravelAccessException("Admin user not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new UnauthorizedTravelAccessException("User " + adminId + " is not an admin");
        }

        return admin;
    }

    private TravelPlanResponse toResponse(TravelPlan travelPlan) {
        String ownerName = travelPlan.getOwner().getFirstName() + " " + travelPlan.getOwner().getLastName();

        Long destinationId = travelPlan.getDestination() != null ? travelPlan.getDestination().getId() : null;
        String destinationTitle = travelPlan.getDestination() != null ? travelPlan.getDestination().getTitle() : null;
        String destinationCountry = travelPlan.getDestination() != null ? travelPlan.getDestination().getCountry() : null;

        String reviewedByAdminName = null;
        if (travelPlan.getReviewedByAdmin() != null) {
            reviewedByAdminName = travelPlan.getReviewedByAdmin().getFirstName()
                    + " "
                    + travelPlan.getReviewedByAdmin().getLastName();
        }

        return TravelPlanResponse.builder()
                .id(travelPlan.getId())
                .ownerId(travelPlan.getOwner().getId())
                .ownerName(ownerName)
                .petId(travelPlan.getPetId())
                .destinationId(destinationId)
                .destinationTitle(destinationTitle)
                .destinationCountry(destinationCountry)
                .origin(travelPlan.getOrigin())
                .transportType(travelPlan.getTransportType())
                .travelDate(travelPlan.getTravelDate())
                .returnDate(travelPlan.getReturnDate())
                .estimatedTravelHours(travelPlan.getEstimatedTravelHours())
                .estimatedTravelCost(travelPlan.getEstimatedTravelCost())
                .currency(travelPlan.getCurrency())
                .animalWeight(travelPlan.getAnimalWeight())
                .cageLength(travelPlan.getCageLength())
                .cageWidth(travelPlan.getCageWidth())
                .cageHeight(travelPlan.getCageHeight())
                .hydrationIntervalMinutes(travelPlan.getHydrationIntervalMinutes())
                .requiredStops(travelPlan.getRequiredStops())
                .readinessScore(travelPlan.getReadinessScore())
                .safetyStatus(travelPlan.getSafetyStatus())
                .status(travelPlan.getStatus())
                .adminDecisionComment(travelPlan.getAdminDecisionComment())
                .reviewedByAdminName(reviewedByAdminName)
                .submittedAt(travelPlan.getSubmittedAt())
                .reviewedAt(travelPlan.getReviewedAt())
                .createdAt(travelPlan.getCreatedAt())
                .updatedAt(travelPlan.getUpdatedAt())
                .build();
    }

    private TravelPlanSummaryResponse toSummaryResponse(TravelPlan travelPlan) {
        String destinationTitle = travelPlan.getDestination() != null ? travelPlan.getDestination().getTitle() : null;
        String destinationCountry = travelPlan.getDestination() != null ? travelPlan.getDestination().getCountry() : null;

        return TravelPlanSummaryResponse.builder()
                .id(travelPlan.getId())
                .destinationTitle(destinationTitle)
                .destinationCountry(destinationCountry)
                .travelDate(travelPlan.getTravelDate())
                .status(travelPlan.getStatus())
                .readinessScore(travelPlan.getReadinessScore())
                .safetyStatus(travelPlan.getSafetyStatus())
                .createdAt(travelPlan.getCreatedAt())
                .build();
    }
}
