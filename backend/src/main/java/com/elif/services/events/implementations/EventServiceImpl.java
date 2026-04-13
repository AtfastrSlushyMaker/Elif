package com.elif.services.events.implementations;

import com.elif.dto.events.request.EventCreateRequest;
import com.elif.dto.events.request.EventUpdateRequest;
import com.elif.dto.events.response.EventCategoryResponse;
import com.elif.dto.events.response.EventDetailResponse;
import com.elif.dto.events.response.EventSummaryResponse;
import com.elif.entities.events.Event;
import com.elif.entities.events.EventCategory;
import com.elif.entities.events.EventStatus;
import com.elif.entities.user.Role;
import com.elif.entities.user.User;
import com.elif.exceptions.events.EventExceptions;
import com.elif.repositories.events.EventCategoryRepository;
import com.elif.repositories.events.EventParticipantRepository;
import com.elif.repositories.events.EventRepository;
import com.elif.repositories.events.EventReviewRepository;
import com.elif.repositories.user.UserRepository;
import com.elif.services.events.interfaces.IEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class EventServiceImpl implements IEventService {

    private final EventRepository            eventRepository;
    private final EventCategoryRepository    categoryRepository;
    private final EventReviewRepository      reviewRepository;
    private final EventParticipantRepository participantRepository;
    private final UserRepository             userRepository;

    // ─── CREATE ──────────────────────────────────────────────────────

    @Override
    public EventDetailResponse createEvent(EventCreateRequest request, Long organizerId) {
        validateFutureDates(request.getStartDate(), request.getEndDate());

        EventCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new EventExceptions.CategoryNotFoundException(request.getCategoryId()));

        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new EventExceptions.ParticipantNotFoundException(
                        "Utilisateur introuvable : " + organizerId));

        boolean duplicate = eventRepository.existsDuplicate(
                request.getTitle(),
                request.getLocation(),
                request.getStartDate(),
                request.getEndDate(),
                EventStatus.CANCELLED,
                EventStatus.COMPLETED);
        if (duplicate) {
            log.warn("⚠️ Tentative de création d'un événement doublon : '{}' à '{}'",
                    request.getTitle(), request.getLocation());
            throw new EventExceptions.DuplicateCategoryException(
                    "Un événement similaire (même titre, même lieu, dates qui se chevauchent) existe déjà.");
        }

        Event event = Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .location(request.getLocation())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .maxParticipants(request.getMaxParticipants())
                .remainingSlots(request.getMaxParticipants())
                .coverImageUrl(request.getCoverImageUrl())
                .category(category)
                .createdBy(organizer)
                .status(EventStatus.PLANNED)
                .build();

        Event saved = eventRepository.save(event);
        log.info("✅ Événement créé : '{}' (id={}) par userId={}", saved.getTitle(), saved.getId(), organizerId);
        return toDetailResponse(saved, List.of());
    }

    // ─── READ ─────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public EventDetailResponse getEventById(Long eventId) {
        Event event = findEventOrThrow(eventId);
        List<EventSummaryResponse> suggestions = List.of();

        if (event.getStatus() == EventStatus.FULL) {
            List<Event> suggested = eventRepository.findSuggestedEvents(
                    event.getCategory().getId(),
                    event.getId(),
                    LocalDateTime.now(),
                    EventStatus.PLANNED,
                    PageRequest.of(0, 5)
            );
            suggestions = suggested.stream()
                    .map(this::toSummaryResponse)
                    .collect(Collectors.toList());
        }
        return toDetailResponse(event, suggestions);
    }

    // EventServiceImpl.java - Modifier la méthode getAllEvents

    @Override
    @Transactional(readOnly = true)
    public Page<EventSummaryResponse> getAllEvents(EventStatus status, Long categoryId,
                                                   String keyword, Pageable pageable) {

        // ✅ Si status est null, on retourne TOUS les événements
        if (keyword != null && !keyword.isBlank()) {
            String likePattern = "%" + keyword.trim().toLowerCase() + "%";
            if (status != null) {
                return eventRepository.searchByKeyword(likePattern, status, pageable)
                        .map(this::toSummaryResponse);
            } else {
                // Recherche sans filtre status
                return eventRepository.searchByKeywordAllStatus(likePattern, pageable)
                        .map(this::toSummaryResponse);
            }
        }
        if (categoryId != null) {
            if (status != null) {
                return eventRepository.findByCategoryIdAndStatus(categoryId, status, pageable)
                        .map(this::toSummaryResponse);
            } else {
                return eventRepository.findByCategoryId(categoryId, pageable)
                        .map(this::toSummaryResponse);
            }
        }
        if (status != null) {
            return eventRepository.findByStatus(status, pageable)
                    .map(this::toSummaryResponse);
        } else {
            // ✅ Retourner TOUS les événements
            return eventRepository.findAll(pageable)
                    .map(this::toSummaryResponse);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventSummaryResponse> getMyOrganizedEvents(Long organizerId, Pageable pageable) {
        return eventRepository.findByCreatedByIdOrderByStartDateDesc(organizerId, pageable)
                .map(this::toSummaryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, List<EventSummaryResponse>> getCalendarEvents(int year, int month) {
        if (month < 1 || month > 12) {
            throw new EventExceptions.InvalidDateRangeException("Le mois doit être compris entre 1 et 12.");
        }
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end   = start.plusMonths(1).minusSeconds(1);
        List<Event> events  = eventRepository.findByStartDateBetween(start, end);

        return events.stream()
                .map(this::toSummaryResponse)
                .collect(Collectors.groupingBy(e -> e.getStartDate().toLocalDate().toString()));
    }

    // ─── UPDATE ───────────────────────────────────────────────────────

    @Override
    public EventDetailResponse updateEvent(Long eventId, EventUpdateRequest request, Long userId) {
        Event event = findEventOrThrow(eventId);
        assertCanEdit(event, userId);
        assertIsEditable(event);

        if (request.getTitle()        != null) event.setTitle(request.getTitle());
        if (request.getDescription()  != null) event.setDescription(request.getDescription());
        if (request.getLocation()     != null) event.setLocation(request.getLocation());
        if (request.getCoverImageUrl()!= null) event.setCoverImageUrl(request.getCoverImageUrl());

        // ✅ CORRECTION : on valide uniquement que start < end (pas de contrainte "futur"
        //    car un admin peut corriger une date sur un événement ONGOING)
        LocalDateTime newStart = request.getStartDate() != null ? request.getStartDate() : event.getStartDate();
        LocalDateTime newEnd   = request.getEndDate()   != null ? request.getEndDate()   : event.getEndDate();
        validateDateRange(newStart, newEnd);
        event.setStartDate(newStart);
        event.setEndDate(newEnd);

        if (request.getMaxParticipants() != null) {
            int usedSlots = event.getMaxParticipants() - event.getRemainingSlots();
            if (request.getMaxParticipants() < usedSlots) {
                throw new EventExceptions.CapacityReductionException(request.getMaxParticipants(), usedSlots);
            }
            event.setMaxParticipants(request.getMaxParticipants());
            event.setRemainingSlots(request.getMaxParticipants() - usedSlots);
        }

        if (request.getCategoryId() != null) {
            EventCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new EventExceptions.CategoryNotFoundException(request.getCategoryId()));
            event.setCategory(category);
        }

        Event saved = eventRepository.save(event);
        log.info("✏️ Événement {} modifié par userId={}", eventId, userId);
        return toDetailResponse(saved, List.of());
    }

    @Override
    public EventDetailResponse updateEventStatus(Long eventId, EventStatus newStatus, Long userId) {
        Event event = findEventOrThrow(eventId);
        assertCanEdit(event, userId);

        if (newStatus != EventStatus.CANCELLED) {
            throw new EventExceptions.EventNotEditableException(
                    "Seule l'annulation manuelle est autorisée via cet endpoint.");
        }
        if (event.getStatus() == EventStatus.COMPLETED) {
            throw new EventExceptions.EventNotEditableException("terminé");
        }
        if (event.getStatus() == EventStatus.CANCELLED) {
            throw new EventExceptions.EventNotEditableException("déjà annulé");
        }

        event.setStatus(EventStatus.CANCELLED);
        log.info("🚫 Événement {} annulé par userId={}", eventId, userId);
        return toDetailResponse(eventRepository.save(event), List.of());
    }

    // ─── DELETE ───────────────────────────────────────────────────────

    @Override
    public void deleteEvent(Long eventId, Long userId) {
        Event event = findEventOrThrow(eventId);
        assertCanEdit(event, userId);

        if (event.getStatus() == EventStatus.COMPLETED) {
            throw new EventExceptions.EventNotEditableException("terminé");
        }
        if (event.getStatus() == EventStatus.ONGOING) {
            throw new EventExceptions.EventNotEditableException(
                    "en cours — annulez-le d'abord avant de le supprimer.");
        }

        eventRepository.delete(event);
        log.info("🗑️ Événement {} supprimé par userId={}", eventId, userId);
    }

    // ─── SCHEDULER ───────────────────────────────────────────────────

    /**
     * Toutes les heures : met à jour les statuts PLANNED → ONGOING → COMPLETED.
     * ✅ CORRECTION : log ajouté + statuts FULL pris en compte pour ONGOING → COMPLETED.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Override
    public void markCompletedEvents() {
        LocalDateTime now = LocalDateTime.now();

        List<Event> toOngoing = eventRepository.findEventsToMarkOngoing(
                now, List.of(EventStatus.PLANNED, EventStatus.FULL));
        if (!toOngoing.isEmpty()) {
            toOngoing.forEach(e -> e.setStatus(EventStatus.ONGOING));
            eventRepository.saveAll(toOngoing);
            log.info("▶️ {} événement(s) passés en ONGOING", toOngoing.size());
        }

        List<Event> toComplete = eventRepository.findEventsToMarkCompleted(
                now, List.of(EventStatus.ONGOING));
        if (!toComplete.isEmpty()) {
            toComplete.forEach(e -> e.setStatus(EventStatus.COMPLETED));
            eventRepository.saveAll(toComplete);
            log.info("✅ {} événement(s) passés en COMPLETED", toComplete.size());
        }
    }

    // ─── Helpers privés ──────────────────────────────────────────────

    /**
     * Validation pour la création : les deux dates doivent être dans le futur.
     */
    private void validateFutureDates(LocalDateTime startDate, LocalDateTime endDate) {
        LocalDateTime now = LocalDateTime.now();
        if (startDate.isBefore(now))
            throw new EventExceptions.InvalidDateRangeException("La date de début doit être dans le futur.");
        validateDateRange(startDate, endDate);
    }

    /**
     * Validation pour la modification : uniquement start < end.
     */
    private void validateDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        if (!endDate.isAfter(startDate))
            throw new EventExceptions.InvalidDateRangeException(
                    "La date de fin doit être postérieure à la date de début.");
    }

    private void assertCanEdit(Event event, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EventExceptions.ParticipantNotFoundException(
                        "Utilisateur introuvable : " + userId));
        boolean isAdmin    = user.getRole() == Role.ADMIN;
        boolean isOrganizer = event.getCreatedBy().getId().equals(userId);
        if (!isAdmin && !isOrganizer) {
            throw new EventExceptions.AccessDeniedException(
                    "Vous n'êtes pas autorisé à modifier cet événement.");
        }
    }

    private void assertIsEditable(Event event) {
        if (event.getStatus() == EventStatus.COMPLETED || event.getStatus() == EventStatus.CANCELLED) {
            throw new EventExceptions.EventNotEditableException(
                    event.getStatus().name().toLowerCase());
        }
    }

    Event findEventOrThrow(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new EventExceptions.EventNotFoundException(id));
    }

    EventSummaryResponse toSummaryResponse(Event event) {
        Double avgRating = reviewRepository.findAverageRatingByEventId(event.getId());
        long   reviews   = reviewRepository.countByEventId(event.getId());
        return EventSummaryResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .location(event.getLocation())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .maxParticipants(event.getMaxParticipants())
                .remainingSlots(event.getRemainingSlots())
                .coverImageUrl(event.getCoverImageUrl())
                .status(event.getStatus())
                .category(toCategoryResponse(event.getCategory()))
                .organizerName(event.getCreatedBy() != null
                        ? event.getCreatedBy().getFirstName() + " " + event.getCreatedBy().getLastName()
                        : null)
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .reviewCount((int) reviews)
                .build();
    }

    private EventDetailResponse toDetailResponse(Event event, List<EventSummaryResponse> suggestions) {
        Double avgRating = reviewRepository.findAverageRatingByEventId(event.getId());
        long   reviews   = reviewRepository.countByEventId(event.getId());
        return EventDetailResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .location(event.getLocation())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .maxParticipants(event.getMaxParticipants())
                .remainingSlots(event.getRemainingSlots())
                .coverImageUrl(event.getCoverImageUrl())
                .status(event.getStatus())
                .category(toCategoryResponse(event.getCategory()))
                .organizerName(event.getCreatedBy() != null
                        ? event.getCreatedBy().getFirstName() + " " + event.getCreatedBy().getLastName()
                        : null)
                .organizerId(event.getCreatedBy() != null ? event.getCreatedBy().getId() : null)
                .createdAt(event.getCreatedAt())
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .reviewCount((int) reviews)
                .suggestedEvents(suggestions)
                .build();
    }

    private EventCategoryResponse toCategoryResponse(EventCategory c) {
        if (c == null) return null;
        return EventCategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .icon(c.getIcon())
                .description(c.getDescription())
                .requiresApproval(c.getRequiresApproval())
                .build();
    }
}
