package com.elif.controllers.marketplace;

import com.elif.dto.marketplace.CreateMarketplaceReclamationRequest;
import com.elif.dto.marketplace.MarketplaceReclamationResponse;
import com.elif.dto.marketplace.UpdateMarketplaceReclamationStatusRequest;
import com.elif.services.marketplace.IMarketplaceReclamationService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/marketplace-reclamation")
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class MarketplaceReclamationController {

    private final IMarketplaceReclamationService marketplaceReclamationService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateMarketplaceReclamationRequest request) {
        try {
            MarketplaceReclamationResponse created = marketplaceReclamationService.createReclamation(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create reclamation"));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MarketplaceReclamationResponse>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(marketplaceReclamationService.getByUserId(userId));
    }

    @GetMapping
    public ResponseEntity<List<MarketplaceReclamationResponse>> getAll() {
        return ResponseEntity.ok(marketplaceReclamationService.getAll());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateMarketplaceReclamationStatusRequest request
    ) {
        try {
            return ResponseEntity.ok(
                    marketplaceReclamationService.updateStatus(id, request.getStatus(), request.getResponseMalek())
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update reclamation"));
        }
    }
}
