package com.elif.services.marketplace;

import com.elif.dto.marketplace.OrderItemRequest;
import com.elif.dto.marketplace.StripeCheckoutRequest;
import com.elif.dto.marketplace.StripeCheckoutResponse;
import com.elif.entities.marketplace.Product;
import com.elif.repositories.marketplace.ProductRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class StripePaymentService {

    private final ProductRepository productRepository;

    @Value("${stripe.secret-key:}")
    private String stripeSecretKey;

    public StripeCheckoutResponse createCheckoutSession(StripeCheckoutRequest request) {
        if (stripeSecretKey == null || stripeSecretKey.isBlank()) {
            throw new IllegalArgumentException("Stripe is not configured. Set STRIPE_SECRET_KEY environment variable.");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty.");
        }

        if (request.getSuccessUrl() == null || request.getSuccessUrl().isBlank() ||
                request.getCancelUrl() == null || request.getCancelUrl().isBlank()) {
            throw new IllegalArgumentException("Success and cancel URLs are required.");
        }

        Stripe.apiKey = stripeSecretKey;

        List<SessionCreateParams.LineItem> lineItems = new ArrayList<>();

        for (OrderItemRequest itemRequest : request.getItems()) {
            Long productId = Objects.requireNonNull(itemRequest.getProductId(),
                "Product id is required for Stripe checkout item.");

            Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + productId));

            if (itemRequest.getQuantity() == null || itemRequest.getQuantity() < 1) {
                throw new IllegalArgumentException("Invalid quantity for product: " + product.getName());
            }

            if (product.getStock() < itemRequest.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
            }

            long unitAmountInCents = toCents(product.getPrice());

            SessionCreateParams.LineItem lineItem = SessionCreateParams.LineItem.builder()
                    .setQuantity(itemRequest.getQuantity().longValue())
                    .setPriceData(
                            SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency("usd")
                                    .setUnitAmount(unitAmountInCents)
                                    .setProductData(
                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                    .setName(product.getName())
                                                    .build()
                                    )
                                    .build()
                    )
                    .build();

            lineItems.add(lineItem);
        }

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(request.getSuccessUrl())
                .setCancelUrl(request.getCancelUrl())
                .addAllLineItem(lineItems)
                .putMetadata("userId", String.valueOf(request.getUserId()))
                .build();

        try {
            Session session = Session.create(params);
            return StripeCheckoutResponse.builder()
                    .sessionId(session.getId())
                    .checkoutUrl(session.getUrl())
                    .build();
        } catch (StripeException e) {
            throw new IllegalArgumentException("Unable to create Stripe checkout session: " + e.getMessage());
        }
    }

    private long toCents(BigDecimal amount) {
        return amount
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValue();
    }
}
