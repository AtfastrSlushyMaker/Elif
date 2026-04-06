package com.elif.controllers.events;

import com.elif.dto.events.request.EventParticipantRequest;
import com.elif.dto.events.response.EventParticipantResponse;
import com.elif.dto.events.response.WaitlistResponse;
import com.elif.entities.user.Role;
import com.elif.entities.user.User;
import com.elif.services.events.interfaces.IEventParticipantService;
import com.elif.services.events.interfaces.IEventWaitlistService;
import com.elif.services.user.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur des participants et de la liste d'attente.
 *
 * ✅ CORRECTIONS :
 *  - Endpoints liste d'attente ajoutés ici (cohérence REST)
 *  - Vérifications de rôle uniformisées
 *  - Retour 404 si utilisateur introuvable (pas 403)
 */
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventParticipantController {

    private final IEventParticipantService participantService;
    private final IEventWaitlistService    waitlistService;
    private final IUserService             userService;

    // ─── INSCRIPTION ──────────────────────────────────────────────────

    /** POST /api/events/{id}/join — S'inscrire à un événement (USER) */
    @PostMapping("/{id}/join")
    public ResponseEntity<EventParticipantResponse> joinEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventParticipantRequest request,
            @RequestParam Long userId) {

        User user = userService.findUser(userId);
        if (user == null) return ResponseEntity.notFound().build();
        if (user.getRole() != Role.USER) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(participantService.registerToEvent(id, userId, request));
    }

    /** DELETE /api/events/{id}/leave — Se désinscrire (USER) */
    @DeleteMapping("/{id}/leave")
    public ResponseEntity<Void> leaveEvent(
            @PathVariable Long id,
            @RequestParam Long userId) {

        User user = userService.findUser(userId);
        if (user == null || user.getRole() != Role.USER)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        participantService.cancelRegistration(id, userId);
        return ResponseEntity.noContent().build();
    }

    // ─── LECTURE ADMIN ────────────────────────────────────────────────

    /** GET /api/events/{id}/participants — Participants CONFIRMED (ADMIN) */
    @GetMapping("/{id}/participants")
    public ResponseEntity<Page<EventParticipantResponse>> getParticipants(
            @PathVariable Long id,
            @RequestParam Long requesterId,
            @PageableDefault(size = 20) Pageable pageable) {

        if (!isAdmin(requesterId)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(participantService.getEventParticipants(id, requesterId, pageable));
    }

    /** GET /api/events/{id}/participants/pending — Inscriptions PENDING (ADMIN) */
    @GetMapping("/{id}/participants/pending")
    public ResponseEntity<Page<EventParticipantResponse>> getPendingParticipants(
            @PathVariable Long id,
            @RequestParam Long adminId,
            @PageableDefault(size = 20) Pageable pageable) {

        if (!isAdmin(adminId)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(participantService.getPendingParticipants(id, adminId, pageable));
    }

    /** PATCH /api/events/participants/{participantId}/approve — Approuver (ADMIN) */
    @PatchMapping("/participants/{participantId}/approve")
    public ResponseEntity<EventParticipantResponse> approveParticipant(
            @PathVariable Long participantId,
            @RequestParam Long adminId) {

        if (!isAdmin(adminId)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(participantService.approveParticipant(participantId, adminId));
    }

    /** PATCH /api/events/participants/{participantId}/reject — Rejeter (ADMIN) */
    @PatchMapping("/participants/{participantId}/reject")
    public ResponseEntity<EventParticipantResponse> rejectParticipant(
            @PathVariable Long participantId,
            @RequestParam Long adminId) {

        if (!isAdmin(adminId)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(participantService.rejectParticipant(participantId, adminId));
    }

    /** GET /api/events/registrations/my — Mes inscriptions */
    @GetMapping("/registrations/my")
    public ResponseEntity<Page<EventParticipantResponse>> getMyRegistrations(
            @RequestParam Long userId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(participantService.getMyRegistrations(userId, pageable));
    }

    // ─── LISTE D'ATTENTE ──────────────────────────────────────────────

    /**
     * POST /api/events/{id}/waitlist — Rejoindre la liste d'attente (USER)
     * Disponible uniquement quand l'événement est FULL.
     */
    @PostMapping("/{id}/waitlist")
    public ResponseEntity<WaitlistResponse> joinWaitlist(
            @PathVariable Long id,
            @Valid @RequestBody EventParticipantRequest request,
            @RequestParam Long userId) {

        User user = userService.findUser(userId);
        if (user == null) return ResponseEntity.notFound().build();
        if (user.getRole() != Role.USER) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(waitlistService.joinWaitlist(id, userId, request));
    }

    /**
     * DELETE /api/events/{id}/waitlist — Quitter la liste d'attente (USER)
     */
    @DeleteMapping("/{id}/waitlist")
    public ResponseEntity<Void> leaveWaitlist(
            @PathVariable Long id,
            @RequestParam Long userId) {

        User user = userService.findUser(userId);
        if (user == null || user.getRole() != Role.USER)
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        waitlistService.leaveWaitlist(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/events/{id}/waitlist/my — Ma position dans la liste d'attente
     */
    @GetMapping("/{id}/waitlist/my")
    public ResponseEntity<WaitlistResponse> getMyWaitlistEntry(
            @PathVariable Long id,
            @RequestParam Long userId) {
        return ResponseEntity.ok(waitlistService.getMyWaitlistEntry(id, userId));
    }

    /**
     * GET /api/events/{id}/waitlist — Voir la liste d'attente complète (ADMIN)
     */
    @GetMapping("/{id}/waitlist")
    public ResponseEntity<Page<WaitlistResponse>> getWaitlist(
            @PathVariable Long id,
            @RequestParam Long adminId,
            @PageableDefault(size = 20) Pageable pageable) {

        if (!isAdmin(adminId)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(waitlistService.getWaitlist(id, adminId, pageable));
    }

    /**
     * GET /api/events/waitlist/my — Toutes mes listes d'attente
     */
    @GetMapping("/waitlist/my")
    public ResponseEntity<Page<WaitlistResponse>> getMyWaitlistEntries(
            @RequestParam Long userId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(waitlistService.getMyWaitlistEntries(userId, pageable));
    }

    // ─── Helper ───────────────────────────────────────────────────────

    private boolean isAdmin(Long userId) {
        User user = userService.findUser(userId);
        return user != null && user.getRole() == Role.ADMIN;
    }
}
