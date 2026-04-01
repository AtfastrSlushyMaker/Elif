package com.elif.services.marketplace;

import com.elif.dto.marketplace.*;
import com.elif.entities.marketplace.Order;
import com.elif.entities.marketplace.OrderItem;
import com.elif.entities.marketplace.Product;
import com.elif.repositories.marketplace.OrderRepository;
import com.elif.repositories.marketplace.ProductRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class OrderService implements IOrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderInvoiceEmailService orderInvoiceEmailService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();
        List<Product> updatedProducts = new ArrayList<>();

        Order order = Order.builder()
                .userId(request.getUserId())
                .status(Order.OrderStatus.PENDING)
                .paymentMethod(resolvePaymentMethod(request.getPaymentMethod()))
                .orderItems(orderItems)
                .build();

        for (OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Product not found: " + itemRequest.getProductId()));

            if (product.getStock() < itemRequest.getQuantity()) {
                throw new IllegalArgumentException(
                        "Insufficient stock for product: " + product.getName());
            }

            BigDecimal subtotal = product.getPrice()
                    .multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productId(product.getId())
                    .productName(product.getName())
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(product.getPrice())
                    .subtotal(subtotal)
                    .build();

            orderItems.add(orderItem);
            totalAmount = totalAmount.add(subtotal);

            // Reduce stock
            product.setStock(product.getStock() - itemRequest.getQuantity());
            updatedProducts.add(product);
        }

        productRepository.saveAll(updatedProducts);

        order.setTotalAmount(totalAmount);
        Order saved = orderRepository.save(order);
        OrderResponse response = mapToResponse(saved);

        try {
            eventPublisher.publishEvent(new OrderInvoiceRequestedEvent(saved.getId()));
        } catch (Exception ex) {
            log.warn("Order {} created but invoice event could not be published: {}", saved.getId(), ex.getMessage());
        }

        return response;
    }

    @Override
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        return mapToResponse(order);
    }

    @Override
    public List<OrderResponse> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public OrderResponse confirmOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new IllegalArgumentException("Only pending orders can be confirmed");
        }

        order.setStatus(Order.OrderStatus.CONFIRMED);
        Order updated = orderRepository.save(order);

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (order.getStatus() == Order.OrderStatus.DELIVERED ||
                order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot cancel this order");
        }

        // Restore stock
        for (OrderItem item : order.getOrderItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found"));
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        Order updated = orderRepository.save(order);

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (status == null || status.isBlank()) {
            throw new IllegalArgumentException("Status is required");
        }

        Order.OrderStatus targetStatus;
        try {
            targetStatus = Order.OrderStatus.valueOf(status.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid status. Allowed values: PENDING, CONFIRMED");
        }

        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Cancelled orders cannot be updated");
        }

        if (targetStatus != Order.OrderStatus.PENDING && targetStatus != Order.OrderStatus.CONFIRMED) {
            throw new IllegalArgumentException("Only PENDING or CONFIRMED can be set from admin dashboard");
        }

        if (order.getStatus() == targetStatus) {
            return mapToResponse(order);
        }

        if (order.getStatus() == Order.OrderStatus.PENDING && targetStatus == Order.OrderStatus.CONFIRMED) {
            order.setStatus(Order.OrderStatus.CONFIRMED);
        } else if (order.getStatus() == Order.OrderStatus.CONFIRMED && targetStatus == Order.OrderStatus.PENDING) {
            order.setStatus(Order.OrderStatus.PENDING);
        } else {
            throw new IllegalArgumentException("Unsupported status transition");
        }

        Order updated = orderRepository.save(order);
        return mapToResponse(updated);
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getOrderItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .status(order.getStatus().toString())
                .paymentMethod((order.getPaymentMethod() == null ? Order.PaymentMethod.CASH : order.getPaymentMethod()).toString())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .orderItems(itemResponses)
                .build();
    }

    private Order.PaymentMethod resolvePaymentMethod(String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            return Order.PaymentMethod.CASH;
        }

        try {
            return Order.PaymentMethod.valueOf(paymentMethod.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid payment method. Use CASH or ONLINE");
        }
    }
}
