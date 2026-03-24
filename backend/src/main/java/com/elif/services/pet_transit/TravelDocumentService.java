package com.elif.services.pet_transit;

import com.elif.dto.pet_transit.request.TravelDocumentOcrUpdateRequest;
import com.elif.dto.pet_transit.request.TravelDocumentUploadRequest;
import com.elif.dto.pet_transit.request.TravelDocumentValidateRequest;
import com.elif.dto.pet_transit.response.TravelDocumentResponse;
import com.elif.entities.pet_transit.TravelDocument;
import com.elif.entities.pet_transit.TravelPlan;
import com.elif.entities.pet_transit.enums.DocumentValidationStatus;
import com.elif.entities.user.Role;
import com.elif.entities.user.User;
import com.elif.exceptions.pet_transit.TravelDocumentNotFoundException;
import com.elif.exceptions.pet_transit.TravelPlanNotFoundException;
import com.elif.exceptions.pet_transit.UnauthorizedTravelAccessException;
import com.elif.repositories.pet_transit.TravelDocumentRepository;
import com.elif.repositories.pet_transit.TravelPlanRepository;
import com.elif.repositories.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
public class TravelDocumentService {

    private final TravelDocumentRepository travelDocumentRepository;
    private final TravelPlanRepository travelPlanRepository;
    private final UserRepository userRepository;
    private final ReadinessScoreService readinessScoreService;

    public TravelDocumentResponse uploadDocument(Long planId, TravelDocumentUploadRequest req, Long ownerId) {
        validateRequestPlanId(planId, req.getTravelPlanId());
        TravelPlan travelPlan = getPlanAndCheckOwnership(planId, ownerId);

        TravelDocument document = TravelDocument.builder()
                .travelPlan(travelPlan)
                .documentType(req.getDocumentType())
                .fileUrl(req.getFileUrl())
                .documentNumber(req.getDocumentNumber())
                .holderName(req.getHolderName())
                .issueDate(req.getIssueDate())
                .expiryDate(req.getExpiryDate())
                .issuingOrganization(req.getIssuingOrganization())
                .validationStatus(DocumentValidationStatus.PENDING)
                .isOcrProcessed(false)
                .build();

        TravelDocument saved = travelDocumentRepository.save(document);
        return toResponse(saved);
    }

    public TravelDocumentResponse updateAfterOcr(Long planId, Long docId, Long ownerId,
                                                 TravelDocumentOcrUpdateRequest req) {
        getPlanAndCheckOwnership(planId, ownerId);
        TravelDocument document = getDocumentAndVerifyPlan(docId, planId);

        if (req.getExtractedText() != null) {
            document.setExtractedText(req.getExtractedText());
        }
        if (req.getDocumentNumber() != null) {
            document.setDocumentNumber(req.getDocumentNumber());
        }
        if (req.getHolderName() != null) {
            document.setHolderName(req.getHolderName());
        }
        if (req.getIssueDate() != null) {
            document.setIssueDate(req.getIssueDate());
        }
        if (req.getExpiryDate() != null) {
            document.setExpiryDate(req.getExpiryDate());
        }
        if (req.getIssuingOrganization() != null) {
            document.setIssuingOrganization(req.getIssuingOrganization());
        }

        document.setIsOcrProcessed(true);

        TravelDocument updated = travelDocumentRepository.save(document);
        return toResponse(updated);
    }

    public TravelDocumentResponse validateDocument(Long planId, Long docId, Long adminId,
                                                   TravelDocumentValidateRequest req) {
        TravelDocument document = getDocumentAndVerifyPlan(docId, planId);

        if (req.getValidationStatus() == DocumentValidationStatus.REJECTED) {
            throw new IllegalArgumentException(
                    "Use rejectDocument() for REJECTED status. validateDocument() is for non-rejected statuses only."
            );
        }

        User admin = getAdminUser(adminId);

        document.setValidationStatus(req.getValidationStatus());
        document.setValidatedAt(LocalDateTime.now());
        document.setValidatedByAdmin(admin);
        document.setValidationComment(req.getValidationComment());

        TravelDocument updated = travelDocumentRepository.save(document);
        readinessScoreService.recalculateAndSave(planId);

        return toResponse(updated);
    }

    public TravelDocumentResponse rejectDocument(Long planId, Long docId, Long adminId, String comment) {
        TravelDocument document = getDocumentAndVerifyPlan(docId, planId);
        User admin = getAdminUser(adminId);

        document.setValidationStatus(DocumentValidationStatus.REJECTED);
        document.setValidatedAt(LocalDateTime.now());
        document.setValidatedByAdmin(admin);
        document.setValidationComment(comment);

        TravelDocument updated = travelDocumentRepository.save(document);
        readinessScoreService.recalculateAndSave(planId);

        return toResponse(updated);
    }

    public List<TravelDocumentResponse> getDocumentsForPlan(Long planId, Long ownerId) {
        getPlanAndCheckOwnership(planId, ownerId);

        return travelDocumentRepository.findByTravelPlanId(planId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TravelDocumentResponse getDocumentById(Long planId, Long docId, Long ownerId) {
        getPlanAndCheckOwnership(planId, ownerId);
        TravelDocument document = getDocumentAndVerifyPlan(docId, planId);
        return toResponse(document);
    }

    public void deleteDocument(Long planId, Long docId, Long ownerId) {
        getPlanAndCheckOwnership(planId, ownerId);
        TravelDocument document = getDocumentAndVerifyPlan(docId, planId);

        if (document.getValidationStatus() != DocumentValidationStatus.PENDING) {
            throw new IllegalStateException("Only PENDING documents can be deleted");
        }

        travelDocumentRepository.delete(document);
        readinessScoreService.recalculateAndSave(planId);
    }

    private TravelPlan getPlanAndCheckOwnership(Long planId, Long ownerId) {
        TravelPlan travelPlan = travelPlanRepository.findById(planId)
                .orElseThrow(() -> new TravelPlanNotFoundException("Plan not found: " + planId));

        if (!travelPlan.getOwner().getId().equals(ownerId)) {
            throw new UnauthorizedTravelAccessException("User " + ownerId + " is not the owner of this plan");
        }

        return travelPlan;
    }

    private TravelDocument getDocumentAndVerifyPlan(Long docId, Long planId) {
        TravelDocument document = travelDocumentRepository.findById(docId)
                .orElseThrow(() -> new TravelDocumentNotFoundException("Document not found: " + docId));

        if (!document.getTravelPlan().getId().equals(planId)) {
            throw new UnauthorizedTravelAccessException("Document does not belong to this plan");
        }

        return document;
    }

    private User getAdminUser(Long adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new UnauthorizedTravelAccessException("Admin user not found"));

        if (admin.getRole() != Role.ADMIN) {
            throw new UnauthorizedTravelAccessException("User " + adminId + " is not an admin");
        }

        return admin;
    }

    private void validateRequestPlanId(Long pathPlanId, Long bodyPlanId) {
        if (bodyPlanId != null && !bodyPlanId.equals(pathPlanId)) {
            throw new IllegalArgumentException("travelPlanId in request body must match planId in URL");
        }
    }

    private TravelDocumentResponse toResponse(TravelDocument document) {
        String validatedByAdminName = null;
        if (document.getValidatedByAdmin() != null) {
            validatedByAdminName = document.getValidatedByAdmin().getFirstName()
                    + " "
                    + document.getValidatedByAdmin().getLastName();
        }

        return TravelDocumentResponse.builder()
                .id(document.getId())
                .travelPlanId(document.getTravelPlan().getId())
                .documentType(document.getDocumentType())
                .fileUrl(document.getFileUrl())
                .documentNumber(document.getDocumentNumber())
                .holderName(document.getHolderName())
                .issueDate(document.getIssueDate())
                .expiryDate(document.getExpiryDate())
                .issuingOrganization(document.getIssuingOrganization())
                .extractedText(document.getExtractedText())
                .isOcrProcessed(document.getIsOcrProcessed())
                .validationStatus(document.getValidationStatus())
                .validationComment(document.getValidationComment())
                .uploadedAt(document.getUploadedAt())
                .updatedAt(document.getUpdatedAt())
                .validatedAt(document.getValidatedAt())
                .validatedByAdminName(validatedByAdminName)
                .build();
    }
}