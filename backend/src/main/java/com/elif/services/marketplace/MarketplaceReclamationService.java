package com.elif.services.marketplace;

import com.elif.dto.marketplace.CreateMarketplaceReclamationRequest;
import com.elif.dto.marketplace.MarketplaceReclamationResponse;
import com.elif.entities.marketplace.MarketplaceReclamation;
import com.elif.entities.marketplace.Order;
import com.elif.repositories.marketplace.MarketplaceReclamationRepository;
import com.elif.repositories.marketplace.OrderRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class MarketplaceReclamationService implements IMarketplaceReclamationService {

    private final MarketplaceReclamationRepository reclamationRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional
    public MarketplaceReclamationResponse createReclamation(CreateMarketplaceReclamationRequest request) {
        if (request.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        if (request.getOrderId() == null) {
            throw new IllegalArgumentException("Order ID is required");
        }
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new IllegalArgumentException("Title is required");
        }
        if (request.getDescription() == null || request.getDescription().isBlank()) {
            throw new IllegalArgumentException("Description is required");
        }

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getUserId().equals(request.getUserId())) {
            throw new IllegalArgumentException("Order does not belong to this user");
        }

        if (request.getProductId() != null) {
            boolean productInOrder = order.getOrderItems().stream()
                    .anyMatch(item -> item.getProductId().equals(request.getProductId()));
            if (!productInOrder) {
                throw new IllegalArgumentException("Selected product is not part of this order");
            }
        }

        MarketplaceReclamation.ReclamationType type = resolveType(request.getType());

        MarketplaceReclamation reclamation = MarketplaceReclamation.builder()
                .userId(request.getUserId())
                .orderId(request.getOrderId())
                .productId(request.getProductId())
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .type(type)
                .status(MarketplaceReclamation.ReclamationStatus.OPEN)
                .build();

        return mapToResponse(reclamationRepository.save(reclamation));
    }

    @Override
    public List<MarketplaceReclamationResponse> getByUserId(Long userId) {
        return reclamationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<MarketplaceReclamationResponse> getAll() {
        return reclamationRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public MarketplaceReclamationResponse updateStatus(Long id, String status, String responseMalek) {
        MarketplaceReclamation reclamation = reclamationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reclamation not found"));

        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }

        MarketplaceReclamation.ReclamationStatus targetStatus;
        try {
            targetStatus = MarketplaceReclamation.ReclamationStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status. Allowed: OPEN, IN_REVIEW, RESOLVED, REJECTED");
        }

        reclamation.setStatus(targetStatus);
        reclamation.setResponseMalek(responseMalek == null ? null : responseMalek.trim());

        if (targetStatus == MarketplaceReclamation.ReclamationStatus.RESOLVED
                || targetStatus == MarketplaceReclamation.ReclamationStatus.REJECTED) {
            reclamation.setResolvedAt(LocalDateTime.now());
        } else {
            reclamation.setResolvedAt(null);
        }

        return mapToResponse(reclamationRepository.save(reclamation));
    }

    private MarketplaceReclamation.ReclamationType resolveType(String type) {
        if (type == null || type.isBlank()) {
            return MarketplaceReclamation.ReclamationType.OTHER;
        }

        try {
            return MarketplaceReclamation.ReclamationType.valueOf(type.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return MarketplaceReclamation.ReclamationType.OTHER;
        }
    }

    private MarketplaceReclamationResponse mapToResponse(MarketplaceReclamation reclamation) {
        return MarketplaceReclamationResponse.builder()
                .id(reclamation.getId())
                .userId(reclamation.getUserId())
                .orderId(reclamation.getOrderId())
                .productId(reclamation.getProductId())
                .title(reclamation.getTitle())
                .description(reclamation.getDescription())
                .type(reclamation.getType().name())
                .status(reclamation.getStatus().name())
                .responseMalek(reclamation.getResponseMalek())
                .resolvedAt(reclamation.getResolvedAt())
                .createdAt(reclamation.getCreatedAt())
                .updatedAt(reclamation.getUpdatedAt())
                .build();
    }
}
