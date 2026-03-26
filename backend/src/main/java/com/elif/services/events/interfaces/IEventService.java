package com.elif.services.events.interfaces;

import com.elif.dto.events.request.EventCreateRequest;
import com.elif.dto.events.request.EventUpdateRequest;
import com.elif.dto.events.response.EventDetailResponse;
import com.elif.dto.events.response.EventSummaryResponse;
import com.elif.entities.events.EventStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IEventService {

    /** Créer un nouvel événement */
    EventDetailResponse createEvent(EventCreateRequest request, Long organizerId);

    /** Obtenir le détail d'un événement.
     *  Si l'événement est FULL, inclut des suggestions d'événements similaires */
    EventDetailResponse getEventById(Long eventId);

    /** Liste paginée des événements avec filtre optionnel */
    Page<EventSummaryResponse> getAllEvents(EventStatus status, Long categoryId,
                                            String keyword, Pageable pageable);

    /** Mettre à jour un événement (organisateur uniquement) */
    EventDetailResponse updateEvent(Long eventId, EventUpdateRequest request, Long userId);

    /** Changer le statut d'un événement (annulation par ex.) */
    EventDetailResponse updateEventStatus(Long eventId, EventStatus newStatus, Long userId);

    /** Supprimer un événement (organisateur ou admin) */
    void deleteEvent(Long eventId, Long userId);

    /** Événements créés par un organisateur */
    Page<EventSummaryResponse> getMyOrganizedEvents(Long organizerId, Pageable pageable);

    /** Job schedulé — marque automatiquement les événements terminés */
    void markCompletedEvents();
}