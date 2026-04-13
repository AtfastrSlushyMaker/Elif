package com.elif.repositories.events;

import com.elif.entities.events.EventWaitlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventWaitlistRepository extends JpaRepository<EventWaitlist, Long> {

    boolean existsByEventIdAndUserId(Long eventId, Long userId);

    Optional<EventWaitlist> findByEventIdAndUserId(Long eventId, Long userId);

    /** Retourne la liste d'attente triée par position */
    List<EventWaitlist> findByEventIdOrderByPositionAsc(Long eventId);

    Page<EventWaitlist> findByEventIdOrderByPositionAsc(Long eventId, Pageable pageable);

    /** Inscriptions en attente d'un utilisateur */
    Page<EventWaitlist> findByUserIdOrderByJoinedAtDesc(Long userId, Pageable pageable);

    /** Position maximale actuelle sur un événement */
    @Query("SELECT COALESCE(MAX(w.position), 0) FROM EventWaitlist w WHERE w.event.id = :eventId")
    int findMaxPositionByEventId(@Param("eventId") Long eventId);

    /** Nombre de personnes devant un utilisateur */
    @Query("SELECT COUNT(w) FROM EventWaitlist w WHERE w.event.id = :eventId AND w.position < :position")
    long countAhead(@Param("eventId") Long eventId, @Param("position") int position);

    /** Nombre total de personnes en liste d'attente pour un événement */
    long countByEventId(Long eventId);

    /** Premier de la file (pour promotion automatique) */
    Optional<EventWaitlist> findFirstByEventIdOrderByPositionAsc(Long eventId);

    /** Supprime toutes les entrées de la liste d'attente d'un événement */
    @Modifying
    @Query("DELETE FROM EventWaitlist w WHERE w.event.id = :eventId")
    void deleteAllByEventId(@Param("eventId") Long eventId);
}
