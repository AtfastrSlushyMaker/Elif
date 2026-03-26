package com.elif.services.events.interfaces;

import com.elif.dto.events.request.EventParticipantRequest;
import com.elif.dto.events.response.EventParticipantResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IEventParticipantService {

    /** S'inscrire à un événement avec un nombre de places choisi */
    EventParticipantResponse registerToEvent(Long eventId, Long userId,
                                             EventParticipantRequest request);

    /** Se désinscrire d'un événement (libère les places) */
    void cancelRegistration(Long eventId, Long userId);

    /** Liste des participants d'un événement (organisateur uniquement) */
    Page<EventParticipantResponse> getEventParticipants(Long eventId, Long requesterId,
                                                        Pageable pageable);

    /** Mes inscriptions */
    Page<EventParticipantResponse> getMyRegistrations(Long userId, Pageable pageable);

    /** Vérifier si un user est inscrit à un événement */
    boolean isUserRegistered(Long eventId, Long userId);
}