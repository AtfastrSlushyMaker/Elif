package com.elif.services.events.implementations;

import com.elif.dto.events.request.EventParticipantRequest;
import com.elif.dto.events.response.EventParticipantResponse;
import com.elif.entities.events.*;
import com.elif.entities.user.User;
import com.elif.exceptions.events.EventExceptions;
import com.elif.repositories.events.EventParticipantRepository;
import com.elif.repositories.events.EventRepository;
import com.elif.repositories.user.UserRepository;
import com.elif.services.events.interfaces.IEventParticipantService;
import com.elif.services.events.interfaces.IEventReminderService;
import com.elif.services.events.interfaces.IEventWaitlistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@Transactional
public class EventParticipantServiceImpl implements IEventParticipantService {

    private final EventRepository            eventRepository;
    private final EventParticipantRepository participantRepository;
    private final UserRepository             userRepository;
    private final IEventReminderService      reminderService;

    // @Lazy pour éviter la dépendance circulaire avec EventWaitlistServiceImpl
    private final IEventWaitlistService      waitlistService;

    public EventParticipantServiceImpl(
            EventRepository eventRepository,
            EventParticipantRepository participantRepository,
            UserRepository userRepository,
            IEventReminderService reminderService,
            @Lazy IEventWaitlistService waitlistService) {
        this.eventRepository      = eventRepository;
        this.participantRepository = participantRepository;
        this.userRepository       = userRepository;
        this.reminderService      = reminderService;
        this.waitlistService      = waitlistService;
    }

    // ─── INSCRIPTION ──────────────────────────────────────────────────

    @Override
    public EventParticipantResponse registerToEvent(Long eventId, Long userId,
                                                    EventParticipantRequest request) {
        Event event = findEventOrThrow(eventId);

        if (!event.isJoinable()) {
            throw new EventExceptions.EventNotJoinableException(event.getStatus().name().toLowerCase());
        }

        if (participantRepository.existsByEventIdAndUserId(eventId, userId)) {
            throw new EventExceptions.DuplicateRegistrationException(userId, eventId);
        }

        int requested = request.getNumberOfSeats();
        if (event.getRemainingSlots() < requested) {
            throw new EventExceptions.InsufficientSlotsException(event.getRemainingSlots(), requested);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EventExceptions.ParticipantNotFoundException(
                        "Utilisateur introuvable : " + userId));

        // Logique compétition : si la catégorie requiert approbation → PENDING
        boolean requiresApproval = event.getCategory() != null
                && Boolean.TRUE.equals(event.getCategory().getRequiresApproval());

        ParticipantStatus initialStatus = requiresApproval
                ? ParticipantStatus.PENDING
                : ParticipantStatus.CONFIRMED;

        // Décrémenter les slots seulement si confirmation directe
        if (!requiresApproval) {
            event.decrementSlots(requested);
            // Marquer FULL si plus de places
            if (event.getRemainingSlots() == 0) {
                event.setStatus(EventStatus.FULL);
            }
            eventRepository.save(event);
        }

        EventParticipant participant = EventParticipant.builder()
                .event(event)
                .user(user)
                .numberOfSeats(requested)
                .status(initialStatus)
                .build();

        EventParticipant saved = participantRepository.save(participant);

        if (initialStatus == ParticipantStatus.CONFIRMED) {
            reminderService.scheduleReminders(event, user);
            log.info("📅 Rappels programmés pour {} → '{}'", user.getEmail(), event.getTitle());
        } else {
            log.info("⏳ Inscription PENDING pour {} → '{}' (approbation requise)",
                    user.getEmail(), event.getTitle());
        }

        return toResponse(saved);
    }

    // ─── ANNULATION ──────────────────────────────────────────────────

    @Override
    public void cancelRegistration(Long eventId, Long userId) {
        EventParticipant participant = participantRepository
                .findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new EventExceptions.ParticipantNotFoundException(
                        "Inscription introuvable pour l'événement " + eventId + "."));

        if (participant.getStatus() == ParticipantStatus.CANCELLED) {
            throw new EventExceptions.EventNotEditableException("déjà annulée");
        }

        Event event = participant.getEvent();
        if (event.getStatus() == EventStatus.COMPLETED) {
            throw new EventExceptions.EventNotEditableException(
                    "terminé — impossible d'annuler une inscription");
        }

        // Libérer les slots uniquement si l'inscription était CONFIRMED
        if (participant.getStatus() == ParticipantStatus.CONFIRMED) {
            event.releaseSlots(participant.getNumberOfSeats());
            // Si l'événement était FULL, le repasser en PLANNED
            if (event.getStatus() == EventStatus.FULL) {
                event.setStatus(EventStatus.PLANNED);
            }
            eventRepository.save(event);

            // ✅ Promouvoir automatiquement le premier de la liste d'attente
            boolean promoted = waitlistService.promoteNext(eventId);
            if (promoted) {
                log.info("🎉 Promotion automatique depuis la liste d'attente pour l'événement {}",
                        eventId);
            }
        }

        participant.setStatus(ParticipantStatus.CANCELLED);
        participantRepository.save(participant);

        // Annuler les rappels
        reminderService.cancelReminders(eventId, userId);
        log.info("🗑️ Inscription annulée — userId={}, eventId={}", userId, eventId);
    }

    // ─── APPROBATION ADMIN ────────────────────────────────────────────

    @Override
    public EventParticipantResponse approveParticipant(Long participantId, Long adminId) {
        EventParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new EventExceptions.ParticipantNotFoundException(
                        "Inscription introuvable : " + participantId));

        if (participant.getStatus() != ParticipantStatus.PENDING) {
            throw new EventExceptions.RegistrationNotPendingException();
        }

        Event event = participant.getEvent();
        if (event.getRemainingSlots() < participant.getNumberOfSeats()) {
            throw new EventExceptions.InsufficientSlotsException(
                    event.getRemainingSlots(), participant.getNumberOfSeats());
        }

        event.decrementSlots(participant.getNumberOfSeats());
        if (event.getRemainingSlots() == 0) {
            event.setStatus(EventStatus.FULL);
        }
        eventRepository.save(event);

        participant.setStatus(ParticipantStatus.CONFIRMED);
        EventParticipant saved = participantRepository.save(participant);

        reminderService.scheduleReminders(event, participant.getUser());
        log.info("✅ Inscription {} approuvée par admin {} → '{}'",
                participantId, adminId, event.getTitle());

        return toResponse(saved);
    }

    @Override
    public EventParticipantResponse rejectParticipant(Long participantId, Long adminId) {
        EventParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new EventExceptions.ParticipantNotFoundException(
                        "Inscription introuvable : " + participantId));

        if (participant.getStatus() != ParticipantStatus.PENDING) {
            throw new EventExceptions.RegistrationNotPendingException();
        }

        participant.setStatus(ParticipantStatus.CANCELLED);
        log.info("❌ Inscription {} rejetée par admin {}", participantId, adminId);
        return toResponse(participantRepository.save(participant));
    }

    // ─── LECTURES ────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<EventParticipantResponse> getPendingParticipants(Long eventId, Long adminId,
                                                                 Pageable pageable) {
        findEventOrThrow(eventId);
        return participantRepository
                .findByEventIdAndStatus(eventId, ParticipantStatus.PENDING, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventParticipantResponse> getEventParticipants(Long eventId, Long requesterId,
                                                               Pageable pageable) {
        findEventOrThrow(eventId);
        return participantRepository
                .findByEventIdAndStatus(eventId, ParticipantStatus.CONFIRMED, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventParticipantResponse> getMyRegistrations(Long userId, Pageable pageable) {
        return participantRepository
                .findByUserIdOrderByRegisteredAtDesc(userId, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isUserRegistered(Long eventId, Long userId) {
        return participantRepository.existsByEventIdAndUserId(eventId, userId);
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    private Event findEventOrThrow(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new EventExceptions.EventNotFoundException(id));
    }

    private EventParticipantResponse toResponse(EventParticipant p) {
        return EventParticipantResponse.builder()
                .id(p.getId())
                .eventId(p.getEvent().getId())
                .eventTitle(p.getEvent().getTitle())
                .userId(p.getUser() != null ? p.getUser().getId() : null)
                .userName(p.getUser() != null
                        ? p.getUser().getFirstName() + " " + p.getUser().getLastName() : null)
                .numberOfSeats(p.getNumberOfSeats())
                .status(p.getStatus())
                .registeredAt(p.getRegisteredAt())
                .build();
    }
}
