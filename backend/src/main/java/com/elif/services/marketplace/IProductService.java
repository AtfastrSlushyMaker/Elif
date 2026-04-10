package com.elif.services.marketplace;

import com.elif.dto.marketplace.ProductRequest;
import com.elif.dto.marketplace.ProductResponse;

import java.util.List;

public interface IProductService {
    ProductResponse addProduct(ProductRequest request);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);

    ProductResponse getProductById(Long id);

    List<ProductResponse> getAllProducts();

    List<ProductResponse> getActiveProducts();

    List<ProductResponse> getProductsByCategory(String category);

    List<ProductResponse> searchProducts(String keyword);

    List<ProductResponse> getTrendingProducts(int limit);
}
