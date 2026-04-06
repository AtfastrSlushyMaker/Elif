package com.elif.repositories.events;

import com.elif.entities.events.Event;
import com.elif.entities.events.EventStatus;
import com.elif.entities.events.ParticipantStatus;
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

    // ─── Requêtes de base ──────────────────────────────────────────────
    Page<Event> findByStatus(EventStatus status, Pageable pageable);

    Page<Event> findByCreatedByIdOrderByStartDateDesc(Long userId, Pageable pageable);

    Page<Event> findByCategoryIdAndStatus(Long categoryId, EventStatus status, Pageable pageable);

    List<Event> findByStartDateBetween(LocalDateTime start, LocalDateTime end);

    // ─── Recherche par mot-clé ─────────────────────────────────────────
    @Query("SELECT e FROM Event e WHERE e.status = :status AND " +
            "(LOWER(e.title) LIKE :keyword OR LOWER(e.description) LIKE :keyword)")
    Page<Event> searchByKeyword(
            @Param("keyword") String keyword,
            @Param("status")  EventStatus status,
            Pageable pageable);

    // ─── Détection de doublons ─────────────────────────────────────────
    @Query("SELECT COUNT(e) > 0 FROM Event e " +
            "WHERE LOWER(e.title) = LOWER(:title) " +
            "AND LOWER(e.location) = LOWER(:location) " +
            "AND e.status != :cancelled " +
            "AND e.status != :completed " +
            "AND e.startDate < :endDate AND e.endDate > :startDate")
    boolean existsDuplicate(
            @Param("title")     String title,
            @Param("location")  String location,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate")   LocalDateTime endDate,
            @Param("cancelled") EventStatus cancelled,
            @Param("completed") EventStatus completed);

    // ─── Événements suggérés ───────────────────────────────────────────
    @Query("SELECT e FROM Event e WHERE e.category.id = :categoryId " +
            "AND e.id != :excludeEventId " +
            "AND e.status = :plannedStatus " +
            "AND e.startDate > :now " +
            "AND e.remainingSlots > 0 " +
            "ORDER BY e.startDate ASC")
    List<Event> findSuggestedEvents(
            @Param("categoryId")     Long categoryId,
            @Param("excludeEventId") Long excludeEventId,
            @Param("now")            LocalDateTime now,
            @Param("plannedStatus")  EventStatus plannedStatus,
            Pageable pageable);

    // ─── Schedulers ───────────────────────────────────────────────────
    @Query("SELECT e FROM Event e WHERE e.endDate < :now AND e.status NOT IN :excludedStatuses")
    List<Event> findEventsToMarkCompleted(
            @Param("now")              LocalDateTime now,
            @Param("excludedStatuses") List<EventStatus> excludedStatuses);

    @Query("SELECT e FROM Event e WHERE e.status IN :statuses AND e.startDate <= :now")
    List<Event> findEventsToMarkOngoing(
            @Param("now")      LocalDateTime now,
            @Param("statuses") List<EventStatus> statuses);

    // ─── Statistiques ─────────────────────────────────────────────────
    @Query("SELECT e.status, COUNT(e) FROM Event e GROUP BY e.status")
    List<Object[]> countEventsByStatus();

    @Query("SELECT e.category.name, COUNT(e) FROM Event e " +
            "WHERE e.category IS NOT NULL GROUP BY e.category.name ORDER BY COUNT(e) DESC")
    List<Object[]> countEventsByCategory();

    @Query("SELECT COUNT(e) FROM Event e WHERE e.startDate >= :start AND e.startDate < :end")
    long countEventsCreatedBetween(
            @Param("start") LocalDateTime start,
            @Param("end")   LocalDateTime end);

    @Query("SELECT COALESCE(SUM(p.numberOfSeats), 0) FROM EventParticipant p " +
            "WHERE p.status = :confirmedStatus")
    long countTotalParticipants(@Param("confirmedStatus") ParticipantStatus confirmedStatus);

    @Query("SELECT AVG((1.0 * (e.maxParticipants - e.remainingSlots) / e.maxParticipants) * 100) " +
            "FROM Event e WHERE e.status IN :statuses AND e.maxParticipants > 0")
    Double getAverageFillRate(@Param("statuses") List<EventStatus> statuses);

    /** Top événements par taux de remplissage (remainingSlots ASC = les plus remplis en premier) */
    @Query("SELECT e FROM Event e ORDER BY e.remainingSlots ASC")
    List<Event> findTop5Events(Pageable pageable);
    // EventRepository.java

    // Recherche par mot-clé sans filtre status
    @Query("SELECT e FROM Event e WHERE LOWER(e.title) LIKE :keyword OR LOWER(e.location) LIKE :keyword")
    Page<Event> searchByKeywordAllStatus(@Param("keyword") String keyword, Pageable pageable);

    // Recherche par catégorie sans filtre status
    Page<Event> findByCategoryId(Long categoryId, Pageable pageable);
}