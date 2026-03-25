package com.elif.controllers.pet_transit;

import com.elif.dto.pet_transit.request.TravelDocumentOcrUpdateRequest;
import com.elif.dto.pet_transit.request.TravelDocumentUploadRequest;
import com.elif.dto.pet_transit.request.TravelDocumentValidateRequest;
import com.elif.dto.pet_transit.response.TravelDocumentResponse;
import com.elif.services.pet_transit.TravelDocumentService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/travel-plans/{planId}/documents")
@AllArgsConstructor
public class TravelDocumentController {

    private final TravelDocumentService travelDocumentService;

    @GetMapping
    public List<TravelDocumentResponse> getDocumentsForPlan(
            @PathVariable Long planId,
            @RequestHeader("X-User-Id") Long userId) {
        return travelDocumentService.getDocumentsForPlan(planId, userId);
    }

    @GetMapping("/{docId}")
    public TravelDocumentResponse getDocumentById(
            @PathVariable Long planId,
            @PathVariable Long docId,
            @RequestHeader("X-User-Id") Long userId) {
        return travelDocumentService.getDocumentById(planId, docId, userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TravelDocumentResponse uploadDocument(
            @PathVariable Long planId,
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody TravelDocumentUploadRequest request) {
        return travelDocumentService.uploadDocument(planId, request, userId);
    }

    @PutMapping("/{docId}/ocr")
    public TravelDocumentResponse updateAfterOcr(
            @PathVariable Long planId,
            @PathVariable Long docId,
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody TravelDocumentOcrUpdateRequest request) {
        return travelDocumentService.updateAfterOcr(planId, docId, userId, request);
    }

    @PostMapping("/{docId}/validate")
    public TravelDocumentResponse validateDocument(
            @PathVariable Long planId,
            @PathVariable Long docId,
            @RequestHeader("X-User-Id") Long adminId,
            @Valid @RequestBody TravelDocumentValidateRequest request) {
        return travelDocumentService.validateDocument(planId, docId, adminId, request);
    }

    @PostMapping("/{docId}/reject")
    public TravelDocumentResponse rejectDocument(
            @PathVariable Long planId,
            @PathVariable Long docId,
            @RequestHeader("X-User-Id") Long adminId,
            @RequestParam(required = false) String comment) {
        return travelDocumentService.rejectDocument(planId, docId, adminId, comment);
    }

    @DeleteMapping("/{docId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDocument(
            @PathVariable Long planId,
            @PathVariable Long docId,
            @RequestHeader("X-User-Id") Long requesterId) {
        travelDocumentService.deleteDocument(planId, docId, requesterId);
    }
}


