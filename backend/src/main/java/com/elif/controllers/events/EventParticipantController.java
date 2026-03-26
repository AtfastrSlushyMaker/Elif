package com.elif.controllers.events;

import com.elif.dto.events.request.EventParticipantRequest;
import com.elif.dto.events.response.EventParticipantResponse;
import com.elif.entities.user.Role;
import com.elif.services.events.interfaces.IEventParticipantService;
import com.elif.services.user.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventParticipantController {

    private final IEventParticipantService participantService;
    private final IUserService userService;

    // ✅ Seul USER peut s'inscrire (pas ADMIN)
    @PostMapping("/{id}/join")
    public ResponseEntity<EventParticipantResponse> joinEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventParticipantRequest request,
            @RequestParam Long userId) {

        // Vérifier que l'utilisateur existe et n'est pas ADMIN
        com.elif.entities.user.User user = userService.findUser(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        // Seul USER peut participer (pas ADMIN, pas VET, pas SERVICE_PROVIDER)
        if (user.getRole() != Role.USER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(participantService.registerToEvent(id, userId, request));
    }

    // ✅ Seul USER peut se désinscrire
    @DeleteMapping("/{id}/leave")
    public ResponseEntity<Void> leaveEvent(
            @PathVariable Long id,
            @RequestParam Long userId) {

        com.elif.entities.user.User user = userService.findUser(userId);
        if (user == null || user.getRole() != Role.USER) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        participantService.cancelRegistration(id, userId);
        return ResponseEntity.noContent().build();
    }

    // ✅ ADMIN peut voir la liste des participants d'un événement
    @GetMapping("/{id}/participants")
    public ResponseEntity<Page<EventParticipantResponse>> getParticipants(
            @PathVariable Long id,
            @RequestParam Long requesterId,
            @PageableDefault(size = 20) Pageable pageable) {

        // Seul ADMIN peut voir les participants
        com.elif.entities.user.User user = userService.findUser(requesterId);
        if (user == null || user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(participantService.getEventParticipants(id, requesterId, pageable));
    }

    // ✅ Tout le monde peut voir ses propres inscriptions
    @GetMapping("/registrations/my")
    public ResponseEntity<Page<EventParticipantResponse>> getMyRegistrations(
            @RequestParam Long userId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(participantService.getMyRegistrations(userId, pageable));
    }
}