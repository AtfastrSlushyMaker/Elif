package com.elif.repositories.events;

import com.elif.entities.events.Event;
import com.elif.entities.events.EventInteraction;
import com.elif.entities.events.InteractionType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventInteractionRepository
        extends JpaRepository<EventInteraction, Long> {

    // ─── Déduplication vues ────────────────────────────────────────────
    boolean existsByEventIdAndSessionIdAndTypeAndCreatedAtAfter(
            Long eventId, String sessionId,
            InteractionType type, LocalDateTime after);

    // ─── Comptage simple ───────────────────────────────────────────────
    long countByEventIdAndType(Long eventId, InteractionType type);
    long countByEventId(Long eventId);
    long countByCreatedAtAfter(LocalDateTime since);

    // ─── Score de popularité pondéré (JPQL avec CAST) ──────────────────
    @Query("""
        SELECT i.event.id,
               SUM(CASE 
                   WHEN i.type = com.elif.entities.events.InteractionType.VIEW THEN 1
                   WHEN i.type = com.elif.entities.events.InteractionType.SEARCH_CLICK THEN 3
                   WHEN i.type = com.elif.entities.events.InteractionType.DETAIL_OPEN THEN 5
                   WHEN i.type = com.elif.entities.events.InteractionType.WAITLIST_JOIN THEN 10
                   WHEN i.type = com.elif.entities.events.InteractionType.REVIEW_POSTED THEN 15
                   WHEN i.type = com.elif.entities.events.InteractionType.REGISTRATION THEN 20
                   ELSE 0
               END)
        FROM EventInteraction i
        WHERE i.createdAt >= :since
        GROUP BY i.event.id
        ORDER BY 2 DESC
        """)
    List<Object[]> findPopularityScoresSince(@Param("since") LocalDateTime since);

    // ─── Vues uniques (par session) ───────────────────────────────────
    @Query("""
        SELECT COUNT(DISTINCT i.sessionId)
        FROM EventInteraction i
        WHERE i.event.id = :eventId
          AND i.type = com.elif.entities.events.InteractionType.VIEW
          AND i.createdAt >= :since
        """)
    long countUniqueViewsSince(
            @Param("eventId") Long eventId,
            @Param("since") LocalDateTime since);

    // ─── Taux de conversion ────────────────────────────────────────────
    @Query("""
        SELECT
            SUM(CASE WHEN i.type = com.elif.entities.events.InteractionType.VIEW THEN 1 ELSE 0 END),
            SUM(CASE WHEN i.type = com.elif.entities.events.InteractionType.REGISTRATION THEN 1 ELSE 0 END)
        FROM EventInteraction i
        WHERE i.event.id = :eventId
        """)
    Object[] findConversionData(@Param("eventId") Long eventId);

    // ─── Événements négligés ───────────────────────────────────────────
    @Query("""
        SELECT e FROM Event e
        WHERE e.status = 'PLANNED'
          AND e.startDate > :now
          AND (
              SELECT COUNT(i) FROM EventInteraction i
              WHERE i.event = e 
                AND i.type = com.elif.entities.events.InteractionType.VIEW
          ) < :threshold
        ORDER BY e.startDate ASC
        """)
    List<Event> findNeglectedEvents(
            @Param("now") LocalDateTime now,
            @Param("threshold") long threshold,
            Pageable pageable);

    // ─── Breakdown par type ───────────────────────────────────────────
    @Query("""
        SELECT i.type, COUNT(i)
        FROM EventInteraction i
        WHERE i.createdAt >= :since
        GROUP BY i.type
        """)
    List<Object[]> countByTypeSince(@Param("since") LocalDateTime since);

    // ─── Comptage par période (pour les tendances) ─────────────────────
    @Query("""
        SELECT COUNT(i)
        FROM EventInteraction i
        WHERE i.event.id = :eventId
          AND i.type = :type
          AND i.createdAt BETWEEN :from AND :to
        """)
    long countByEventIdAndTypeAndCreatedAtBetween(
            @Param("eventId") Long eventId,
            @Param("type") InteractionType type,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    // ─── Cleanup ───────────────────────────────────────────────────────
    @Modifying
    @Transactional
    @Query("DELETE FROM EventInteraction i WHERE i.createdAt < :before")
    int deleteOlderThan(@Param("before") LocalDateTime before);
}