package com.elif.repositories.events;

import com.elif.entities.events.EventParticipant;
import com.elif.entities.events.ParticipantStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventParticipantRepository extends JpaRepository<EventParticipant, Long> {

    // Vérifie si un utilisateur est déjà inscrit à un événement
    boolean existsByEventIdAndUserId(Long eventId, Long userId);

    Optional<EventParticipant> findByEventIdAndUserId(Long eventId, Long userId);

    Page<EventParticipant> findByEventIdAndStatus(Long eventId, ParticipantStatus status, Pageable pageable);

    Page<EventParticipant> findByUserIdOrderByRegisteredAtDesc(Long userId, Pageable pageable);

    // Somme des places confirmées pour un événement
    @Query("SELECT COALESCE(SUM(p.numberOfSeats), 0) FROM EventParticipant p " +
            "WHERE p.event.id = :eventId AND p.status = 'CONFIRMED'")
    Integer sumConfirmedSeatsByEventId(@Param("eventId") Long eventId);

    // Met à jour le statut d'un participant
    @Modifying
    @Transactional
    @Query("UPDATE EventParticipant p SET p.status = :newStatus WHERE p.id = :participantId")
    int updateParticipantStatus(@Param("participantId") Long participantId,
                                @Param("newStatus") ParticipantStatus newStatus);

    // Annule tous les participants d'un événement
    @Modifying
    @Transactional
    @Query("UPDATE EventParticipant p SET p.status = 'CANCELLED' WHERE p.event.id = :eventId")
    int cancelAllParticipants(@Param("eventId") Long eventId);

    // Récupère toutes les inscriptions actives d'un utilisateur sur un événement
    @Query("SELECT p FROM EventParticipant p WHERE p.event.id = :eventId " +
            "AND p.user.id = :userId AND p.status != 'CANCELLED'")
    List<EventParticipant> findAllByEventIdAndUserId(
            @Param("eventId") Long eventId,
            @Param("userId") Long userId);

    // Total des places confirmées sur tous les événements
    @Query("SELECT COALESCE(SUM(p.numberOfSeats), 0) FROM EventParticipant p WHERE p.status = 'CONFIRMED'")
    long countTotalConfirmedSeats();
}