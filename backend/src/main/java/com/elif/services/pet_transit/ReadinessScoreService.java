package com.elif.services.pet_transit;

import com.elif.entities.pet_transit.SafetyChecklist;
import com.elif.entities.pet_transit.TravelDocument;
import com.elif.entities.pet_transit.TravelPlan;
import com.elif.entities.pet_transit.enums.DocumentType;
import com.elif.entities.pet_transit.enums.DocumentValidationStatus;
import com.elif.exceptions.pet_transit.TravelPlanNotFoundException;
import com.elif.repositories.pet_transit.SafetyChecklistRepository;
import com.elif.repositories.pet_transit.TravelDocumentRepository;
import com.elif.repositories.pet_transit.TravelPlanRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@AllArgsConstructor
@Transactional
public class ReadinessScoreService {

    private static final BigDecimal DOCUMENT_WEIGHT_VALID = BigDecimal.ONE;
    private static final BigDecimal DOCUMENT_WEIGHT_PARTIAL = BigDecimal.valueOf(0.5);

    private final TravelPlanRepository travelPlanRepository;
    private final TravelDocumentRepository travelDocumentRepository;
    private final SafetyChecklistRepository safetyChecklistRepository;

    /**
     * Recalculate readiness score for a travel plan.
     * Score = 100 based on:
     * - 40% documents: required documents score
     * - 40% checklist: completed mandatory items / total mandatory items
     * - 20% optional data: completion of animalWeight, cageLength, cageWidth, cageHeight, hydrationIntervalMinutes
     *
     * For required documents (Option A):
     * - VALID      = 100% document contribution
     * - PENDING    = 50% document contribution
     * - INCOMPLETE = 50% document contribution
     * - REJECTED   = 0%
     * - EXPIRED    = 0%
     *
     * @param travelPlanId the travel plan ID
     * @return the final calculated readiness score (0-100)
     * @throws TravelPlanNotFoundException if plan not found
     */
    public BigDecimal recalculateAndSave(Long travelPlanId) {
        TravelPlan travelPlan = travelPlanRepository.findById(travelPlanId)
                .orElseThrow(() -> new TravelPlanNotFoundException("TravelPlan not found with id: " + travelPlanId));

        BigDecimal documentScore = calculateDocumentScore(travelPlan);
        BigDecimal checklistScore = calculateChecklistScore(travelPlan);
        BigDecimal optionalDataScore = calculateOptionalDataScore(travelPlan);

        // Weighted calculation: 40% + 40% + 20% = 100%
        BigDecimal finalScore = documentScore.multiply(BigDecimal.valueOf(0.40))
                .add(checklistScore.multiply(BigDecimal.valueOf(0.40)))
                .add(optionalDataScore.multiply(BigDecimal.valueOf(0.20)))
                .setScale(2, RoundingMode.HALF_UP);

        // Ensure score is between 0 and 100
        if (finalScore.compareTo(BigDecimal.ZERO) < 0) {
            finalScore = BigDecimal.ZERO;
        } else if (finalScore.compareTo(BigDecimal.valueOf(100)) > 0) {
            finalScore = BigDecimal.valueOf(100);
        }

        travelPlan.setReadinessScore(finalScore);
        travelPlanRepository.save(travelPlan);

        return finalScore;
    }

    private BigDecimal calculateDocumentScore(TravelPlan travelPlan) {
        Set<DocumentType> requiredDocs = travelPlan.getDestination() != null
                ? travelPlan.getDestination().getRequiredDocuments()
                : null;

        if (requiredDocs == null || requiredDocs.isEmpty()) {
            return BigDecimal.valueOf(100);
        }

        List<TravelDocument> uploadedDocuments = travelDocumentRepository.findByTravelPlanId(travelPlan.getId());
        Map<DocumentType, TravelDocument> latestDocumentByType = new EnumMap<>(DocumentType.class);

        for (TravelDocument document : uploadedDocuments) {
            DocumentType documentType = document.getDocumentType();
            if (documentType == null) {
                continue;
            }

            TravelDocument existing = latestDocumentByType.get(documentType);
            if (existing == null || isMoreRecent(document, existing)) {
                latestDocumentByType.put(documentType, document);
            }
        }

        BigDecimal achievedWeight = BigDecimal.ZERO;

        for (DocumentType requiredType : requiredDocs) {
            TravelDocument document = latestDocumentByType.get(requiredType);
            DocumentValidationStatus status = document != null ? document.getValidationStatus() : null;
            achievedWeight = achievedWeight.add(documentContribution(status));
        }

        BigDecimal ratio = achievedWeight
                .divide(BigDecimal.valueOf(requiredDocs.size()), 4, RoundingMode.HALF_UP);

        return ratio.multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal documentContribution(DocumentValidationStatus status) {
        if (status == null) {
            return BigDecimal.ZERO;
        }

        return switch (status) {
            case VALID -> DOCUMENT_WEIGHT_VALID;
            case PENDING, INCOMPLETE -> DOCUMENT_WEIGHT_PARTIAL;
            case REJECTED, EXPIRED -> BigDecimal.ZERO;
        };
    }

    private boolean isMoreRecent(TravelDocument candidate, TravelDocument existing) {
        LocalDateTime candidateTimestamp = resolveDocumentTimestamp(candidate);
        LocalDateTime existingTimestamp = resolveDocumentTimestamp(existing);

        int byTimestamp = candidateTimestamp.compareTo(existingTimestamp);
        if (byTimestamp != 0) {
            return byTimestamp > 0;
        }

        Long candidateId = candidate.getId();
        Long existingId = existing.getId();
        if (candidateId == null) {
            return false;
        }
        if (existingId == null) {
            return true;
        }

        return candidateId > existingId;
    }

    private LocalDateTime resolveDocumentTimestamp(TravelDocument document) {
        if (document.getUpdatedAt() != null) {
            return document.getUpdatedAt();
        }
        if (document.getUploadedAt() != null) {
            return document.getUploadedAt();
        }

        return LocalDateTime.MIN;
    }

    /**
     * Calculate checklist score (0-100).
     * Score = (completed mandatory items / total mandatory items) * 100
     * If no mandatory items, return 100.
     */
    private BigDecimal calculateChecklistScore(TravelPlan travelPlan) {
        List<SafetyChecklist> allItems = safetyChecklistRepository.findByTravelPlanId(travelPlan.getId());

        // Filter mandatory items
        long totalMandatory = allItems.stream()
                .filter(SafetyChecklist::isMandatory)
                .count();

        if (totalMandatory == 0) {
            return BigDecimal.valueOf(100);
        }

        long completedMandatory = allItems.stream()
                .filter(item -> item.isMandatory() && item.isCompleted())
                .count();

        BigDecimal ratio = BigDecimal.valueOf(completedMandatory)
                .divide(BigDecimal.valueOf(totalMandatory), 4, RoundingMode.HALF_UP);

        return ratio.multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate optional data score (0-100).
     * Score = (filled optional fields / total optional fields) * 100
     * Optional fields: animalWeight, cageLength, cageWidth, cageHeight, hydrationIntervalMinutes
     * Each field = 20% (5 fields total)
     */
    private BigDecimal calculateOptionalDataScore(TravelPlan travelPlan) {
        int filledCount = 0;

        if (travelPlan.getAnimalWeight() != null) {
            filledCount++;
        }
        if (travelPlan.getCageLength() != null) {
            filledCount++;
        }
        if (travelPlan.getCageWidth() != null) {
            filledCount++;
        }
        if (travelPlan.getCageHeight() != null) {
            filledCount++;
        }
        if (travelPlan.getHydrationIntervalMinutes() != null) {
            filledCount++;
        }

        return BigDecimal.valueOf(filledCount)
                .divide(BigDecimal.valueOf(5), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(2, RoundingMode.HALF_UP);
    }
}
