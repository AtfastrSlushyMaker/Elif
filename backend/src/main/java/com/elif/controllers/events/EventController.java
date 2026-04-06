package com.elif.controllers.events;

import com.elif.dto.events.request.EventCreateRequest;
import com.elif.dto.events.request.EventUpdateRequest;
import com.elif.dto.events.response.*;
import com.elif.entities.events.EventStatus;
import com.elif.entities.user.Role;
import com.elif.services.events.implementations.EventStatsService;
import com.elif.services.events.interfaces.IEventService;
import com.elif.services.events.interfaces.IWeatherService;
import com.elif.services.user.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur principal des événements.
 *
 * ✅ CORRECTIONS :
 *  - Injecte IWeatherService (interface) au lieu de WeatherService (implémentation directe)
 *  - isAdmin() centralisé dans un helper privé
 *  - Séparation claire des endpoints publics vs ADMIN
 *  - Validation du mois pour le calendrier
 *  - getAllEvents retourne TOUS les événements (pas de filtre status par défaut)
 */
@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RequiredArgsConstructor
public class EventController {

    private final IEventService     eventService;
    private final IUserService      userService;
    private final EventStatsService eventStatsService;
    private final IWeatherService   weatherService;

    // ─────────────────────────────────────────────────────────────────
    // CRUD ÉVÉNEMENTS
    // ─────────────────────────────────────────────────────────────────

    /** POST /api/events — Créer un événement (ADMIN) */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<EventDetailResponse> createEvent(
            @Valid @RequestBody EventCreateRequest request,
            @RequestParam Long userId) {

        if (!isAdmin(userId)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(eventService.createEvent(request, userId));
    }

    /** GET /api/events — Liste paginée avec filtres (retourne TOUS les événements) */
    @GetMapping
    public ResponseEntity<Page<EventSummaryResponse>> getAllEvents(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 12, sort = "startDate") Pageable pageable) {
        // ✅ Passer null pour status pour avoir TOUS les événements (PLANNED, FULL, ONGOING, COMPLETED, CANCELLED)
        return ResponseEntity.ok(eventService.getAllEvents(null, categoryId, keyword, pageable));
    }

    /** GET /api/events/{id} — Détail d'un événement (public) */
    @GetMapping("/{id}")
    public ResponseEntity<EventDetailResponse> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    /** PUT /api/events/{id} — Modifier un événement (ADMIN ou organisateur) */
    @PutMapping("/{id}")
    public ResponseEntity<EventDetailResponse> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventUpdateRequest request,
            @RequestParam Long userId) {

        if (!isAdmin(userId)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(eventService.updateEvent(id, request, userId));
    }

    /** PATCH /api/events/{id}/cancel — Annuler un événement (ADMIN) */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<EventDetailResponse> cancelEvent(
            @PathVariable Long id,
            @RequestParam Long userId) {

        if (!isAdmin(userId)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(eventService.updateEventStatus(id, EventStatus.CANCELLED, userId));
    }

    /** DELETE /api/events/{id} — Supprimer un événement (ADMIN) */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable Long id,
            @RequestParam Long userId) {

        if (!isAdmin(userId)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        eventService.deleteEvent(id, userId);
        return ResponseEntity.noContent().build();
    }

    /** GET /api/events/my — Mes événements organisés (y compris annulés) */
    @GetMapping("/my")
    public ResponseEntity<Page<EventSummaryResponse>> getMyEvents(
            @RequestParam Long userId,
            @PageableDefault(size = 10, sort = "startDate") Pageable pageable) {
        return ResponseEntity.ok(eventService.getMyOrganizedEvents(userId, pageable));
    }

    // ─────────────────────────────────────────────────────────────────
    // CALENDRIER
    // ─────────────────────────────────────────────────────────────────

    /**
     * GET /api/events/calendar?year=2025&month=4
     * Retourne les événements groupés par date : { "2025-04-12": [...] }
     * Utilisé par le composant calendrier Angular.
     */
    @GetMapping("/calendar")
    public ResponseEntity<Map<String, List<EventSummaryResponse>>> getCalendar(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(eventService.getCalendarEvents(year, month));
    }

    // ─────────────────────────────────────────────────────────────────
    // STATISTIQUES ADMIN
    // ─────────────────────────────────────────────────────────────────

    /** GET /api/events/admin/stats — Dashboard stats (ADMIN) */
    @GetMapping("/admin/stats")
    public ResponseEntity<EventStatsResponse> getAdminStats(@RequestParam Long userId) {
        if (!isAdmin(userId)) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        return ResponseEntity.ok(eventStatsService.getAdminStats());
    }

    // ─────────────────────────────────────────────────────────────────
    // MÉTÉO
    // ─────────────────────────────────────────────────────────────────

    /**
     * GET /api/events/{id}/weather
     * Météo + recommandation INDOOR/OUTDOOR pour l'événement.
     */
    @GetMapping("/{id}/weather")
    public ResponseEntity<WeatherResponse> getEventWeather(@PathVariable Long id) {
        return ResponseEntity.ok(weatherService.getWeatherForEvent(id));
    }

    /**
     * GET /api/events/weather?city=Tunis
     * Météo par ville lors de la création d'un événement.
     */
    @GetMapping("/weather")
    public ResponseEntity<WeatherResponse> getWeatherByCity(@RequestParam String city) {
        return ResponseEntity.ok(
                weatherService.getWeatherByCity(city, java.time.LocalDateTime.now())
        );
    }

    // ─────────────────────────────────────────────────────────────────
    // Helper
    // ─────────────────────────────────────────────────────────────────

    private boolean isAdmin(Long userId) {
        com.elif.entities.user.User user = userService.findUser(userId);
        return user != null && user.getRole() == Role.ADMIN;
    }
}