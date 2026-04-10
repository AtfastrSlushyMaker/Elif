package com.elif.services.marketplace;

import com.elif.dto.marketplace.CreateMarketplaceReclamationRequest;
import com.elif.dto.marketplace.MarketplaceReclamationResponse;

import java.util.List;

public interface IMarketplaceReclamationService {
    MarketplaceReclamationResponse createReclamation(CreateMarketplaceReclamationRequest request);

    List<MarketplaceReclamationResponse> getByUserId(Long userId);

    List<MarketplaceReclamationResponse> getAll();

    MarketplaceReclamationResponse updateStatus(Long id, String status, String responseMalek);
}
