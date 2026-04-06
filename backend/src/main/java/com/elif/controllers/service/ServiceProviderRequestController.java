package com.elif.controllers.service;

import com.elif.dto.service.ServiceProviderRequestDTO;
import com.elif.exceptions.ResourceNotFoundException;
import com.elif.services.service.ServiceProviderRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/service-provider")
@CrossOrigin(origins = "http://localhost:4200")
public class ServiceProviderRequestController {

    private final ServiceProviderRequestService requestService;

    public ServiceProviderRequestController(ServiceProviderRequestService requestService) {
        this.requestService = requestService;
    }

    // POST /api/service-provider/request
    // Body: { "userId": 1, "message": "Je veux devenir provider" }
    @PostMapping("/request")
    public ResponseEntity<?> createRequest(@RequestBody Map<String, Object> body) {
        try {
            Long userId = Long.valueOf(body.get("userId").toString());
            String message = body.getOrDefault("message", "").toString();
            ServiceProviderRequestDTO dto = requestService.createRequest(userId, message);
            return ResponseEntity.status(201).body(dto);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // GET /api/service-provider/request/{userId}
    @GetMapping("/request/{userId}")
    public ResponseEntity<?> getRequestByUser(@PathVariable Long userId) {
        ServiceProviderRequestDTO dto = requestService.getRequestByUser(userId);
        if (dto == null) {
            return ResponseEntity.ok(Map.of("status", "NONE"));
        }
        return ResponseEntity.ok(dto);
    }

    // GET /api/service-provider/requests  (admin)
    @GetMapping("/requests")
    public ResponseEntity<List<ServiceProviderRequestDTO>> getAllRequests() {
        return ResponseEntity.ok(requestService.getAllRequests());
    }

    // PUT /api/service-provider/request/{id}/approve
    @PutMapping("/request/{id}/approve")
    public ResponseEntity<?> approveRequest(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(requestService.approveRequest(id));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    // PUT /api/service-provider/request/{id}/reject
    @PutMapping("/request/{id}/reject")
    public ResponseEntity<?> rejectRequest(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(requestService.rejectRequest(id));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    // GET /api/service-provider/check/{userId}  (vérification rapide)
    @GetMapping("/check/{userId}")
    public ResponseEntity<Map<String, Object>> checkApproval(@PathVariable Long userId) {
        boolean approved = requestService.isUserApproved(userId);
        return ResponseEntity.ok(Map.of("approved", approved, "userId", userId));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<String> handleNotFound(ResourceNotFoundException e) {
        return ResponseEntity.status(404).body(e.getMessage());
    }
}
