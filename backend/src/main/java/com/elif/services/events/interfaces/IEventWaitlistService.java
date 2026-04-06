package com.elif.services.events.interfaces;

import com.elif.dto.events.request.EventParticipantRequest;
import com.elif.dto.events.response.WaitlistResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IEventWaitlistService {

    /** Ajouter l'utilisateur à la liste d'attente */
    WaitlistResponse joinWaitlist(Long eventId, Long userId, EventParticipantRequest request);

    /** Quitter la liste d'attente */
    void leaveWaitlist(Long eventId, Long userId);

    /** Ma position dans la liste d'attente */
    WaitlistResponse getMyWaitlistEntry(Long eventId, Long userId);

    /** ADMIN : voir la liste d'attente complète d'un événement */
    Page<WaitlistResponse> getWaitlist(Long eventId, Long adminId, Pageable pageable);

    /** Mes inscriptions en liste d'attente */
    Page<WaitlistResponse> getMyWaitlistEntries(Long userId, Pageable pageable);

    /**
     * Promotion automatique du premier de la liste.
     * Appelé quand une place se libère (annulation ou rejet).
     * Retourne true si quelqu'un a été promu.
     */
    boolean promoteNext(Long eventId);
}
