package com.elif.services.events.implementations;

import com.elif.dto.events.request.EventParticipantRequest;
import com.elif.dto.events.response.WaitlistResponse;
import com.elif.entities.events.*;
import com.elif.entities.user.User;
import com.elif.exceptions.events.EventExceptions;
import com.elif.repositories.events.EventParticipantRepository;
import com.elif.repositories.events.EventRepository;
import com.elif.repositories.events.EventWaitlistRepository;
import com.elif.repositories.user.UserRepository;
import com.elif.services.events.interfaces.IEventReminderService;
import com.elif.services.events.interfaces.IEventWaitlistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class EventWaitlistServiceImpl implements IEventWaitlistService {

    private final EventWaitlistRepository waitlistRepository;
    private final EventRepository         eventRepository;
    private final EventParticipantRepository participantRepository;
    private final UserRepository          userRepository;
    private final IEventReminderService   reminderService;

    @Override
    public WaitlistResponse joinWaitlist(Long eventId, Long userId, EventParticipantRequest request) {
        Event event = findEventOrThrow(eventId);

        // La liste d'attente n'est ouverte que pour les événements complets
        if (event.getStatus() != EventStatus.FULL) {
            throw new EventExceptions.WaitlistNotOpenException();
        }

        if (waitlistRepository.existsByEventIdAndUserId(eventId, userId)) {
            throw new EventExceptions.AlreadyOnWaitlistException();
        }

        // Un participant déjà inscrit ne peut pas rejoindre la liste d'attente
        if (participantRepository.existsByEventIdAndUserId(eventId, userId)) {
            throw new EventExceptions.DuplicateRegistrationException(userId, eventId);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EventExceptions.ParticipantNotFoundException(
                        "Utilisateur introuvable : " + userId));

        int nextPosition = waitlistRepository.findMaxPositionByEventId(eventId) + 1;

        EventWaitlist entry = EventWaitlist.builder()
                .event(event)
                .user(user)
                .numberOfSeats(request.getNumberOfSeats())
                .position(nextPosition)
                .notified(false)
                .build();

        EventWaitlist saved = waitlistRepository.save(entry);
        log.info("📋 Utilisateur {} ajouté en position {} sur la liste d'attente de '{}'",
                user.getEmail(), nextPosition, event.getTitle());

        return toResponse(saved);
    }

    @Override
    public void leaveWaitlist(Long eventId, Long userId) {
        EventWaitlist entry = waitlistRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new EventExceptions.ParticipantNotFoundException(
                        "Vous n'êtes pas sur la liste d'attente de cet événement."));

        int removedPosition = entry.getPosition();
        waitlistRepository.delete(entry);

        // Réajuster les positions des entrées suivantes
        waitlistRepository.findByEventIdOrderByPositionAsc(eventId).stream()
                .filter(w -> w.getPosition() > removedPosition)
                .forEach(w -> w.setPosition(w.getPosition() - 1));

        log.info("🗑️ Utilisateur {} retiré de la liste d'attente de l'événement {}",
                userId, eventId);
    }

    @Override
    @Transactional(readOnly = true)
    public WaitlistResponse getMyWaitlistEntry(Long eventId, Long userId) {
        EventWaitlist entry = waitlistRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new EventExceptions.ParticipantNotFoundException(
                        "Vous n'êtes pas sur la liste d'attente de cet événement."));
        return toResponse(entry);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<WaitlistResponse> getWaitlist(Long eventId, Long adminId, Pageable pageable) {
        findEventOrThrow(eventId);
        return waitlistRepository.findByEventIdOrderByPositionAsc(eventId, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<WaitlistResponse> getMyWaitlistEntries(Long userId, Pageable pageable) {
        return waitlistRepository.findByUserIdOrderByJoinedAtDesc(userId, pageable)
                .map(this::toResponse);
    }

    /**
     * Promotion automatique : appelée après une annulation ou un rejet.
     * Prend le premier de la liste si les places disponibles suffisent.
     */
    @Override
    public boolean promoteNext(Long eventId) {
        Event event = findEventOrThrow(eventId);
        if (event.getRemainingSlots() <= 0) return false;

        return waitlistRepository.findFirstByEventIdOrderByPositionAsc(eventId)
                .filter(first -> event.getRemainingSlots() >= first.getNumberOfSeats())
                .map(first -> {
                    // Créer l'inscription confirmée
                    EventParticipant participant = EventParticipant.builder()
                            .event(event)
                            .user(first.getUser())
                            .numberOfSeats(first.getNumberOfSeats())
                            .status(ParticipantStatus.CONFIRMED)
                            .build();
                    participantRepository.save(participant);

                    // Décrémenter les slots
                    event.decrementSlots(first.getNumberOfSeats());
                    eventRepository.save(event);

                    // Retirer de la liste d'attente
                    waitlistRepository.delete(first);

                    // Réajuster les positions
                    waitlistRepository.findByEventIdOrderByPositionAsc(eventId)
                            .forEach(w -> w.setPosition(w.getPosition() - 1));

                    // Programmer les rappels pour le promu
                    reminderService.scheduleReminders(event, first.getUser());

                    log.info("🎉 Utilisateur {} promu automatiquement sur '{}' (depuis la liste d'attente)",
                            first.getUser().getEmail(), event.getTitle());
                    return true;
                })
                .orElse(false);
    }

    private Event findEventOrThrow(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new EventExceptions.EventNotFoundException(id));
    }

    private WaitlistResponse toResponse(EventWaitlist w) {
        long ahead = waitlistRepository.countAhead(w.getEvent().getId(), w.getPosition());
        return WaitlistResponse.builder()
                .id(w.getId())
                .eventId(w.getEvent().getId())
                .eventTitle(w.getEvent().getTitle())
                .userId(w.getUser().getId())
                .userName(w.getUser().getFirstName() + " " + w.getUser().getLastName())
                .numberOfSeats(w.getNumberOfSeats())
                .position(w.getPosition())
                .peopleAhead(ahead)
                .joinedAt(w.getJoinedAt())
                .notified(w.isNotified())
                .build();
    }
}
