package com.elif.controllers.events;

import com.elif.dto.events.popularity.request.TrackInteractionRequest;
import com.elif.dto.events.popularity.response.EventPopularityDetailDTO;
import com.elif.dto.events.popularity.response.PopularEventDTO;
import com.elif.dto.events.popularity.response.PopularityDashboardDTO;
import com.elif.entities.user.Role;
import com.elif.entities.user.User;
import com.elif.services.events.interfaces.IEventPopularityTrackingService;
import com.elif.services.user.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Period;
import java.util.List;

/**
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  EventPopularityController                                       │
 * │                                                                  │
 * │  Endpoints :                                                     │
 * │  POST /api/events/{id}/track              → Enregistrer          │
 * │  GET  /api/events/popular                 → Top events (public)  │
 * │  GET  /api/events/neglected               → Négligés (ADMIN)     │
 * │  GET  /api/events/{id}/popularity         → Détail (ADMIN)       │
 * │  GET  /api/events/admin/popularity/dashboard → Dashboard (ADMIN) │
 * └──────────────────────────────────────────────────────────────────┘
 */
@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Slf4j
public class EventPopularityController {

    private final IEventPopularityTrackingService popularityService;
    private final IUserService                    userService;

    // ══════════════════════════════════════════════════════════════════
    //  TRACKING (public — appelé par le frontend au chargement de page)
    // ══════════════════════════════════════════════════════════════════

    /**
     * POST /api/events/{id}/track
     *
     * Enregistre une interaction utilisateur sur un événement.
     * Appelé silencieusement par le frontend (fire-and-forget).
     *
     * Headers attendus :
     *   X-Session-Id: <uuid-session-anonyme>
     *   X-Forwarded-For: <ip-address> (optionnel)
     *
     * Body : TrackInteractionRequest (type requis, userId facultatif)
     *
     * Toujours 200 même si l'event n'existe pas — on ne bloque jamais
     * l'UX pour du tracking.
     */
    @PostMapping("/{id}/track")
    public ResponseEntity<Void> track(
            @PathVariable Long id,
            @Valid @RequestBody TrackInteractionRequest request,
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ipAddress) {

        try {
            Long userId = request.userId();
            String effectiveSessionId = sessionId != null ? sessionId : request.sessionId();
            String effectiveIp = ipAddress != null ? ipAddress : "unknown";

            popularityService.track(id, request.type(), userId, effectiveSessionId, effectiveIp);
        } catch (Exception ex) {
            // On logge mais on ne bloque jamais l'UX pour du tracking
            log.warn("[TRACKING] Erreur non-bloquante pour event {} : {}", id, ex.getMessage());
        }
        return ResponseEntity.ok().build();
    }

    // ══════════════════════════════════════════════════════════════════
    //  TOP EVENTS — Public (homepage, recommandations)
    // ══════════════════════════════════════════════════════════════════

    /**
     * GET /api/events/popular?limit=10&days=30
     *
     * Retourne les N événements les plus populaires sur une période.
     * Public : utilisé par la homepage du front-office.
     *
     * @param limit Nombre d'événements (défaut: 10, max: 50)
     * @param days  Fenêtre temporelle en jours (défaut: 30)
     */
    @GetMapping("/popular")
    public ResponseEntity<List<PopularEventDTO>> getPopularEvents(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "30") int days) {

        // Sécurité : éviter les requêtes excessives
        int safeDays  = Math.min(days, 365);
        int safeLimit = Math.min(limit, 50);

        List<PopularEventDTO> result =
                popularityService.getTopPopularEvents(safeLimit, Period.ofDays(safeDays));
        return ResponseEntity.ok(result);
    }

    // ══════════════════════════════════════════════════════════════════
    //  NEGLECTED EVENTS — Admin uniquement
    // ══════════════════════════════════════════════════════════════════

    /**
     * GET /api/events/neglected?adminId=1&limit=10&threshold=10
     *
     * Retourne les événements PLANNED avec peu de visibilité.
     * Aide l'admin à identifier les events qui ont besoin de promotion.
     *
     * @param adminId   ID de l'admin (pour vérification)
     * @param limit     Nombre d'événements retournés (défaut: 10)
     * @param threshold Seuil de vues (défaut: 10 — en dessous = négligé)
     */
    @GetMapping("/neglected")
    public ResponseEntity<List<PopularEventDTO>> getNeglectedEvents(
            @RequestParam Long adminId,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "10") long threshold) {

        if (!isAdmin(adminId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        int safeLimit = Math.min(limit, 50);
        return ResponseEntity.ok(popularityService.getNeglectedEvents(safeLimit, threshold));
    }

    // ══════════════════════════════════════════════════════════════════
    //  DASHBOARD — Admin uniquement
    // ══════════════════════════════════════════════════════════════════

    /**
     * GET /api/events/admin/popularity/dashboard?adminId=1
     *
     * Agrège toutes les métriques en un seul appel :
     *   - Top 10 events (30j)
     *   - Top 10 négligés
     *   - Répartition par type d'interaction (7j)
     *   - Total vues aujourd'hui
     *   - Total interactions cette semaine
     *   - Taux de conversion moyen
     */
    @GetMapping("/admin/popularity/dashboard")
    public ResponseEntity<PopularityDashboardDTO> getAdminDashboard(
            @RequestParam Long adminId) {

        if (!isAdmin(adminId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(popularityService.getAdminDashboard());
    }

    // ══════════════════════════════════════════════════════════════════
    //  DETAIL PAR EVENT — Admin uniquement
    // ══════════════════════════════════════════════════════════════════

    /**
     * GET /api/events/{id}/popularity?adminId=1
     *
     * Détail complet pour un événement spécifique :
     *   - Breakdown par type d'interaction
     *   - Taux de conversion
     *   - Tendance (RISING / STABLE / DECLINING)
     */
    @GetMapping("/{id}/popularity")
    public ResponseEntity<EventPopularityDetailDTO> getEventPopularity(
            @PathVariable Long id,
            @RequestParam Long adminId) {

        if (!isAdmin(adminId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(popularityService.getEventPopularityDetail(id));
    }

    // ══════════════════════════════════════════════════════════════════
    //  HELPERS
    // ══════════════════════════════════════════════════════════════════

    private boolean isAdmin(Long userId) {
        if (userId == null) return false;
        User user = userService.findUser(userId);
        return user != null && user.getRole() == Role.ADMIN;
    }
}