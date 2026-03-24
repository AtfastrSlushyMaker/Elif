package com.elif.controllers.pet_transit;

import com.elif.dto.pet_transit.request.TravelPlanCreateRequest;
import com.elif.dto.pet_transit.request.TravelPlanUpdateRequest;
import com.elif.dto.pet_transit.response.TravelPlanResponse;
import com.elif.dto.pet_transit.response.TravelPlanSummaryResponse;
import com.elif.services.pet_transit.TravelPlanService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/travel-plans")
@AllArgsConstructor
public class TravelPlanController {

    private final TravelPlanService travelPlanService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TravelPlanResponse createTravelPlan(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody TravelPlanCreateRequest request) {
        return travelPlanService.createTravelPlan(userId, request);
    }

    @GetMapping("/my")
    public List<TravelPlanSummaryResponse> getMyPlans(
            @RequestHeader("X-User-Id") Long userId) {
        return travelPlanService.getMyPlans(userId);
    }

    @GetMapping("/{id}")
    public TravelPlanResponse getPlanById(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        return travelPlanService.getPlanById(id, userId);
    }

    @PutMapping("/{id}")
    public TravelPlanResponse updateTravelPlan(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody TravelPlanUpdateRequest request) {
        return travelPlanService.updateTravelPlan(id, userId, request);
    }

    @PostMapping("/{id}/submit")
    public TravelPlanResponse submitPlan(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        return travelPlanService.submitPlan(id, userId);
    }

    @PostMapping("/{id}/complete")
    public TravelPlanResponse completePlan(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        return travelPlanService.completePlan(id, userId);
    }

    @PostMapping("/{id}/cancel")
    public TravelPlanResponse cancelPlan(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        return travelPlanService.cancelPlan(id, userId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePlan(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        travelPlanService.deletePlan(id, userId);
    }

    @GetMapping("/admin/submitted")
    public List<TravelPlanResponse> getSubmittedPlans(
            @RequestHeader("X-User-Id") Long adminId) {
        return travelPlanService.getSubmittedPlans(adminId);
    }

    @PostMapping("/{id}/approve")
    public TravelPlanResponse approvePlan(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long adminId,
            @RequestParam(required = false) String comment) {
        return travelPlanService.approvePlan(id, adminId, comment);
    }

    @PostMapping("/{id}/reject")
    public TravelPlanResponse rejectPlan(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long adminId,
            @RequestParam(required = false) String comment) {
        return travelPlanService.rejectPlan(id, adminId, comment);
    }
}


