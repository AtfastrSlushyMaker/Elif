package com.elif.repositories.pet_transit;

import com.elif.entities.pet_transit.TravelPlan;
import com.elif.entities.pet_transit.enums.TravelPlanStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TravelPlanRepository extends JpaRepository<TravelPlan, Long> {

    List<TravelPlan> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    List<TravelPlan> findByOwnerIdAndStatus(Long ownerId, TravelPlanStatus status);

    List<TravelPlan> findByStatusOrderByCreatedAtDesc(TravelPlanStatus status);

    List<TravelPlan> findByDestinationId(Long destinationId);
}
