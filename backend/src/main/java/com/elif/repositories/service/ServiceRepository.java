package com.elif.repositories.service;


import org.springframework.data.jpa.repository.JpaRepository;
import com.elif.entities.service.Service;
import java.util.List;

public interface ServiceRepository extends JpaRepository<Service, Long> {
    List<Service> findByCategoryId(Long categoryId);
    List<Service> findByStatus(String status);
}