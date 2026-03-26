package com.elif.services.events.implementations;

import com.elif.dto.events.request.EventParticipantRequest;
import com.elif.dto.events.response.EventParticipantResponse;
import com.elif.entities.events.Event;
import com.elif.entities.events.EventParticipant;
import com.elif.entities.events.ParticipantStatus;
import com.elif.entities.user.User;
import com.elif.repositories.events.EventParticipantRepository;
import com.elif.repositories.events.EventRepository;
import com.elif.repositories.user.UserRepository;
import com.elif.services.events.interfaces.IEventParticipantService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class EventParticipantServiceImpl implements IEventParticipantService {

    private final EventRepository eventRepository;
    private final EventParticipantRepository participantRepository;
    private final UserRepository userRepository;

    @Override
    public EventParticipantResponse registerToEvent(Long eventId, Long userId,
                                                    EventParticipantRequest request) {
        Event event = findEventOrThrow(eventId);

        if (!event.isJoinable()) {
            throw new RuntimeException(
                    "Impossible de s'inscrire : l'événement est " + event.getStatus().name().toLowerCase());
        }

        if (participantRepository.existsByEventIdAndUserId(eventId, userId)) {
            throw new RuntimeException("Vous êtes déjà inscrit à cet événement.");
        }

        int requested = request.getNumberOfSeats();
        if (event.getRemainingSlots() < requested) {
            throw new RuntimeException(
                    "Seulement " + event.getRemainingSlots() + " place(s) disponible(s). " +
                            "Vous en avez demandé " + requested + ".");
        }

        event.decrementSlots(requested);
        eventRepository.save(event);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        EventParticipant participant = EventParticipant.builder()
                .event(event)
                .user(user)
                .numberOfSeats(requested)
                .status(ParticipantStatus.CONFIRMED)
                .build();

        EventParticipant saved = participantRepository.save(participant);
        return toResponse(saved);
    }

    @Override
    public void cancelRegistration(Long eventId, Long userId) {
        EventParticipant participant = participantRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new RuntimeException("Inscription introuvable."));

        if (participant.getStatus() == ParticipantStatus.CANCELLED) {
            throw new RuntimeException("Cette inscription est déjà annulée.");
        }

        Event event = participant.getEvent();

        if (event.getStatus() == com.elif.entities.events.EventStatus.COMPLETED) {
            throw new RuntimeException("Impossible d'annuler une inscription à un événement terminé.");
        }

        event.releaseSlots(participant.getNumberOfSeats());
        eventRepository.save(event);

        participant.setStatus(ParticipantStatus.CANCELLED);
        participantRepository.save(participant);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventParticipantResponse> getEventParticipants(Long eventId, Long requesterId,
                                                               Pageable pageable) {
        Event event = findEventOrThrow(eventId);

        if (!event.getCreatedBy().getId().equals(requesterId)) {
            throw new RuntimeException("Accès refusé.");
        }

        return participantRepository.findByEventIdAndStatus(eventId, ParticipantStatus.CONFIRMED, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventParticipantResponse> getMyRegistrations(Long userId, Pageable pageable) {
        return participantRepository.findByUserIdOrderByRegisteredAtDesc(userId, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isUserRegistered(Long eventId, Long userId) {
        return participantRepository.existsByEventIdAndUserId(eventId, userId);
    }

    private Event findEventOrThrow(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Événement introuvable : " + id));
    }

    private EventParticipantResponse toResponse(EventParticipant p) {
        return EventParticipantResponse.builder()
                .id(p.getId())
                .eventId(p.getEvent().getId())
                .eventTitle(p.getEvent().getTitle())
                .userId(p.getUser() != null ? p.getUser().getId() : null)
                .userName(p.getUser() != null ?
                        p.getUser().getFirstName() + " " + p.getUser().getLastName() : null)
                .numberOfSeats(p.getNumberOfSeats())
                .status(p.getStatus())
                .registeredAt(p.getRegisteredAt())
                .build();
    }
}