package com.elif.services.events.implementations;

import com.elif.dto.events.request.EventCreateRequest;
import com.elif.dto.events.request.EventUpdateRequest;
import com.elif.dto.events.response.EventCategoryResponse;
import com.elif.dto.events.response.EventDetailResponse;
import com.elif.dto.events.response.EventSummaryResponse;
import com.elif.entities.events.Event;
import com.elif.entities.events.EventCategory;
import com.elif.entities.events.EventStatus;
import com.elif.entities.user.User;
import com.elif.repositories.events.EventCategoryRepository;
import com.elif.repositories.events.EventRepository;
import com.elif.repositories.events.EventReviewRepository;
import com.elif.repositories.user.UserRepository;
import com.elif.services.events.interfaces.IEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EventServiceImpl implements IEventService {

    private final EventRepository eventRepository;
    private final EventCategoryRepository categoryRepository;
    private final EventReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Override
    public EventDetailResponse createEvent(EventCreateRequest request, Long organizerId) {

        validateDates(request.getStartDate(), request.getEndDate());

        EventCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable"));

        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

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
        return toDetailResponse(saved, List.of());
    }

    @Override
    @Transactional(readOnly = true)
    public EventDetailResponse getEventById(Long eventId) {
        Event event = findEventOrThrow(eventId);

        List<EventSummaryResponse> suggestions = List.of();

        if (event.getStatus() == EventStatus.FULL) {
            List<Event> suggestedEvents = eventRepository.findSuggestedEvents(
                    event.getCategory().getId(),
                    event.getId(),
                    LocalDateTime.now(),
                    PageRequest.of(0, 5)
            );
            suggestions = suggestedEvents.stream()
                    .map(this::toSummaryResponse)
                    .collect(Collectors.toList());
        }

        return toDetailResponse(event, suggestions);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventSummaryResponse> getAllEvents(EventStatus status, Long categoryId,
                                                   String keyword, Pageable pageable) {
        EventStatus filterStatus = status != null ? status : EventStatus.PLANNED;

        if (keyword != null && !keyword.isBlank()) {
            return eventRepository.searchByKeyword(keyword, filterStatus, pageable)
                    .map(this::toSummaryResponse);
        }
        if (categoryId != null) {
            return eventRepository.findByCategoryIdAndStatus(categoryId, filterStatus, pageable)
                    .map(this::toSummaryResponse);
        }
        return eventRepository.findByStatus(filterStatus, pageable)
                .map(this::toSummaryResponse);
    }

    @Override
    public EventDetailResponse updateEvent(Long eventId, EventUpdateRequest request, Long userId) {
        Event event = findEventOrThrow(eventId);
        assertIsOrganizer(event, userId);
        assertIsEditable(event);

        if (request.getTitle() != null)         event.setTitle(request.getTitle());
        if (request.getDescription() != null)   event.setDescription(request.getDescription());
        if (request.getLocation() != null)      event.setLocation(request.getLocation());
        if (request.getCoverImageUrl() != null) event.setCoverImageUrl(request.getCoverImageUrl());

        LocalDateTime newStart = request.getStartDate() != null ? request.getStartDate() : event.getStartDate();
        LocalDateTime newEnd   = request.getEndDate()   != null ? request.getEndDate()   : event.getEndDate();
        validateDates(newStart, newEnd);
        event.setStartDate(newStart);
        event.setEndDate(newEnd);

        if (request.getMaxParticipants() != null) {
            int usedSlots = event.getMaxParticipants() - event.getRemainingSlots();
            if (request.getMaxParticipants() < usedSlots) {
                throw new RuntimeException(
                        "La nouvelle capacité (" + request.getMaxParticipants() +
                                ") est inférieure aux places déjà réservées (" + usedSlots + ")");
            }
            event.setMaxParticipants(request.getMaxParticipants());
            event.setRemainingSlots(request.getMaxParticipants() - usedSlots);
        }

        if (request.getCategoryId() != null) {
            EventCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Catégorie introuvable"));
            event.setCategory(category);
        }

        return toDetailResponse(eventRepository.save(event), List.of());
    }

    @Override
    public EventDetailResponse updateEventStatus(Long eventId, EventStatus newStatus, Long userId) {
        Event event = findEventOrThrow(eventId);
        assertIsOrganizer(event, userId);

        if (newStatus != EventStatus.CANCELLED) {
            throw new RuntimeException("Seule l'annulation manuelle est autorisée.");
        }
        if (event.getStatus() == EventStatus.COMPLETED) {
            throw new RuntimeException("Impossible d'annuler un événement déjà terminé.");
        }

        event.setStatus(EventStatus.CANCELLED);
        return toDetailResponse(eventRepository.save(event), List.of());
    }

    @Override
    public void deleteEvent(Long eventId, Long userId) {
        Event event = findEventOrThrow(eventId);
        assertIsOrganizer(event, userId);

        if (event.getStatus() == EventStatus.COMPLETED) {
            throw new RuntimeException("Impossible de supprimer un événement terminé.");
        }
        eventRepository.delete(event);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventSummaryResponse> getMyOrganizedEvents(Long organizerId, Pageable pageable) {
        return eventRepository.findByCreatedByIdOrderByStartDateDesc(organizerId, pageable)
                .map(this::toSummaryResponse);
    }

    @Override
    @Scheduled(cron = "0 0 * * * *")
    public void markCompletedEvents() {
        List<Event> toComplete = eventRepository.findEventsToMarkCompleted(LocalDateTime.now());
        toComplete.forEach(e -> e.setStatus(EventStatus.COMPLETED));
        eventRepository.saveAll(toComplete);
    }

    // ---------- Méthodes utilitaires privées ----------

    private void validateDates(LocalDateTime startDate, LocalDateTime endDate) {
        LocalDateTime now = LocalDateTime.now();
        if (startDate.isBefore(now)) {
            throw new RuntimeException("La date de début doit être aujourd'hui ou dans le futur.");
        }
        if (endDate.isBefore(now)) {
            throw new RuntimeException("La date de fin doit être aujourd'hui ou dans le futur.");
        }
        if (!endDate.isAfter(startDate)) {
            throw new RuntimeException("La date de fin doit être postérieure à la date de début.");
        }
    }

    private void assertIsOrganizer(Event event, Long userId) {
        if (!event.getCreatedBy().getId().equals(userId)) {
            throw new RuntimeException("Accès refusé : vous n'êtes pas l'organisateur de cet événement.");
        }
    }

    private void assertIsEditable(Event event) {
        if (event.getStatus() == EventStatus.COMPLETED || event.getStatus() == EventStatus.CANCELLED) {
            throw new RuntimeException("Impossible de modifier un événement terminé ou annulé.");
        }
    }

    private Event findEventOrThrow(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Événement introuvable avec l'id : " + id));
    }

    // ---------- Mappers ----------

    private EventSummaryResponse toSummaryResponse(Event event) {
        Double avgRating = reviewRepository.findAverageRatingByEventId(event.getId());
        long reviewCount = reviewRepository.countByEventId(event.getId());

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
                .organizerName(event.getCreatedBy() != null ?
                        event.getCreatedBy().getFirstName() + " " + event.getCreatedBy().getLastName() : null)
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .reviewCount((int) reviewCount)
                .build();
    }

    private EventDetailResponse toDetailResponse(Event event, List<EventSummaryResponse> suggestions) {
        Double avgRating = reviewRepository.findAverageRatingByEventId(event.getId());
        long reviewCount = reviewRepository.countByEventId(event.getId());

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
                .organizerName(event.getCreatedBy() != null ?
                        event.getCreatedBy().getFirstName() + " " + event.getCreatedBy().getLastName() : null)
                .organizerId(event.getCreatedBy() != null ? event.getCreatedBy().getId() : null)
                .createdAt(event.getCreatedAt())
                .averageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0)
                .reviewCount((int) reviewCount)
                .suggestedEvents(suggestions)
                .build();
    }

    private EventCategoryResponse toCategoryResponse(EventCategory category) {
        if (category == null) return null;
        return EventCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .build();
    }
}