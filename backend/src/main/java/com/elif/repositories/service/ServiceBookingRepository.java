package com.elif.repositories.service;


import org.springframework.data.jpa.repository.JpaRepository;
import com.elif.entities.service.ServiceBooking;
import java.util.List;

public interface ServiceBookingRepository extends JpaRepository<ServiceBooking, Long> {
    List<ServiceBooking> findByUserId(Long userId);
    List<ServiceBooking> findByServiceId(Long serviceId);
    List<ServiceBooking> findByStatus(String status);
}