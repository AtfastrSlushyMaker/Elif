package com.elif.controllers.events;

import com.elif.dto.events.request.EventCreateRequest;
import com.elif.dto.events.request.EventUpdateRequest;
import com.elif.dto.events.response.EventDetailResponse;
import com.elif.dto.events.response.EventSummaryResponse;
import com.elif.entities.events.EventStatus;
import com.elif.entities.user.Role;
import com.elif.services.events.interfaces.IEventService;
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
public class EventController {

    private final IEventService eventService;
    private final IUserService userService;  // ← AJOUTER pour vérifier les rôles

    // ✅ Seul ADMIN peut créer un événement
    @PostMapping
    public ResponseEntity<EventDetailResponse> createEvent(
            @Valid @RequestBody EventCreateRequest request,
            @RequestParam Long userId) {

        // Vérifier que l'utilisateur est ADMIN
        com.elif.entities.user.User user = userService.findUser(userId);
        if (user == null || user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(eventService.createEvent(request, userId));
    }

    // ✅ Tout le monde peut voir les événements (public)
    @GetMapping
    public ResponseEntity<Page<EventSummaryResponse>> getAllEvents(
            @RequestParam(required = false) EventStatus status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 12, sort = "startDate") Pageable pageable) {
        return ResponseEntity.ok(eventService.getAllEvents(status, categoryId, keyword, pageable));
    }

    // ✅ Tout le monde peut voir un événement
    @GetMapping("/{id}")
    public ResponseEntity<EventDetailResponse> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    // ✅ Seul ADMIN peut modifier un événement
    @PutMapping("/{id}")
    public ResponseEntity<EventDetailResponse> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventUpdateRequest request,
            @RequestParam Long userId) {

        // Vérifier que l'utilisateur est ADMIN
        com.elif.entities.user.User user = userService.findUser(userId);
        if (user == null || user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(eventService.updateEvent(id, request, userId));
    }

    // ✅ Seul ADMIN peut annuler un événement
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<EventDetailResponse> cancelEvent(
            @PathVariable Long id,
            @RequestParam Long userId) {

        // Vérifier que l'utilisateur est ADMIN
        com.elif.entities.user.User user = userService.findUser(userId);
        if (user == null || user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(eventService.updateEventStatus(id, EventStatus.CANCELLED, userId));
    }

    // ✅ Seul ADMIN peut supprimer un événement
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable Long id,
            @RequestParam Long userId) {

        // Vérifier que l'utilisateur est ADMIN
        com.elif.entities.user.User user = userService.findUser(userId);
        if (user == null || user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        eventService.deleteEvent(id, userId);
        return ResponseEntity.noContent().build();
    }

    // ✅ Tout le monde peut voir ses propres événements organisés
    @GetMapping("/my")
    public ResponseEntity<Page<EventSummaryResponse>> getMyEvents(
            @RequestParam Long userId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(eventService.getMyOrganizedEvents(userId, pageable));
    }
}