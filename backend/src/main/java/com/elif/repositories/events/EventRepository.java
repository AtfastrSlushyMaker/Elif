package com.elif.repositories.events;

import com.elif.entities.events.Event;
import com.elif.entities.events.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    // =====================
    // PAGINATION
    // =====================
    Page<Event> findByStatus(EventStatus status, Pageable pageable);
    Page<Event> findByCreatedByIdOrderByStartDateDesc(Long userId, Pageable pageable);
    Page<Event> findByCategoryIdAndStatus(Long categoryId, EventStatus status, Pageable pageable);

    // =====================
    // RECHERCHE AVANCÉE
    // =====================
    @Query("SELECT e FROM Event e WHERE e.status = :status AND " +
            "(LOWER(e.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Event> searchByKeyword(@Param("keyword") String keyword,
                                @Param("status") EventStatus status,
                                Pageable pageable);

    // =====================
    // SUGGESTIONS
    // =====================
    @Query("SELECT e FROM Event e WHERE e.category.id = :categoryId " +
            "AND e.id != :excludeEventId " +
            "AND e.status = 'PLANNED' " +
            "AND e.startDate > :now " +
            "AND e.remainingSlots > 0 " +
            "ORDER BY e.startDate ASC")
    List<Event> findSuggestedEvents(@Param("categoryId") Long categoryId,
                                    @Param("excludeEventId") Long excludeEventId,
                                    @Param("now") LocalDateTime now,
                                    Pageable pageable);

    // =====================
    // GESTION STATUTS
    // =====================
    @Query("SELECT e FROM Event e WHERE e.endDate < :now " +
            "AND e.status NOT IN ('COMPLETED', 'CANCELLED')")
    List<Event> findEventsToMarkCompleted(@Param("now") LocalDateTime now);

    // =====================
    // CONFLIT DATES
    // =====================
    @Query("SELECT COUNT(e) > 0 FROM Event e WHERE e.createdBy.id = :userId " +
            "AND e.status NOT IN ('CANCELLED', 'COMPLETED') " +
            "AND e.id != :excludeId " +
            "AND e.startDate < :endDate AND e.endDate > :startDate")
    boolean existsOverlappingEventForOrganizer(@Param("userId") Long userId,
                                               @Param("startDate") LocalDateTime startDate,
                                               @Param("endDate") LocalDateTime endDate,
                                               @Param("excludeId") Long excludeId);

    // =====================
    // STATISTIQUES ADMIN
    // =====================
    @Query("SELECT e.category.name, COUNT(e) FROM Event e GROUP BY e.category.name")
    List<Object[]> countEventsByCategory();
}