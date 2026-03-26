package com.elif.repositories.events;  // ← Correction: repository → repositories

import com.elif.entities.events.EventParticipant;
import com.elif.entities.events.ParticipantStatus;  // ← Correction: enums → entities.events
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EventParticipantRepository extends JpaRepository<EventParticipant, Long> {

    // Vérifier si un user est déjà inscrit à un événement
    boolean existsByEventIdAndUserId(Long eventId, Long userId);

    // Récupérer l'inscription d'un user pour un événement
    Optional<EventParticipant> findByEventIdAndUserId(Long eventId, Long userId);

    // Toutes les inscriptions d'un événement (pour l'organisateur)
    Page<EventParticipant> findByEventIdAndStatus(Long eventId, ParticipantStatus status, Pageable pageable);

    // Toutes les inscriptions d'un user
    Page<EventParticipant> findByUserIdOrderByRegisteredAtDesc(Long userId, Pageable pageable);

    // Compter les places confirmées pour un événement
    @Query("SELECT COALESCE(SUM(p.numberOfSeats), 0) FROM EventParticipant p " +
            "WHERE p.event.id = :eventId AND p.status = 'CONFIRMED'")
    Integer sumConfirmedSeatsByEventId(@Param("eventId") Long eventId);

    // Mise à jour du statut d'une inscription
    @Modifying
    @Transactional
    @Query("UPDATE EventParticipant p SET p.status = :newStatus WHERE p.id = :participantId")
    int updateParticipantStatus(@Param("participantId") Long participantId,
                                @Param("newStatus") ParticipantStatus newStatus);

    // Annulation en masse (quand l'événement est annulé)
    @Modifying
    @Transactional
    @Query("UPDATE EventParticipant p SET p.status = 'CANCELLED' WHERE p.event.id = :eventId")
    int cancelAllParticipants(@Param("eventId") Long eventId);


}