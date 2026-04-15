package com.elif.repositories.marketplace;

import com.elif.entities.marketplace.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Order> findByStripeSessionId(String stripeSessionId);

    boolean existsByStatusAndOrderItems_ProductId(Order.OrderStatus status, Long productId);
}
