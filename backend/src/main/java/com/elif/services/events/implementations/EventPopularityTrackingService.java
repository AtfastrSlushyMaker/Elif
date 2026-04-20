package com.elif.services.events.implementations;

import com.elif.dto.events.popularity.response.EventPopularityDetailDTO;
import com.elif.dto.events.popularity.response.PopularEventDTO;
import com.elif.dto.events.popularity.response.PopularityDashboardDTO;
import com.elif.entities.events.*;
import com.elif.repositories.events.EventInteractionRepository;
import com.elif.repositories.events.EventRepository;
import com.elif.services.events.interfaces.IEventPopularityTrackingService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  EventPopularityTrackingService                                  │
 * │                                                                  │
 * │  Service métier avancé de suivi de popularité.                   │
 * │                                                                  │
 *  │  Points clés :                                                   │
 * │  • Scoring pondéré multi-interactions (pas un simple COUNT)      │
 * │  • Déduplication des vues par session dans la fenêtre 1h         │
 * │  • Taux de conversion réel (vues → inscriptions)                 │
 * │  • Détection de tendance (RISING / STABLE / DECLINING)           │
 * │  • Identification des events négligés (< seuil vues)             │
 * └──────────────────────────────────────────────────────────────────┘
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EventPopularityTrackingService
        implements IEventPopularityTrackingService {

    private final EventInteractionRepository interactionRepository;
    private final EventRepository            eventRepository;

    // ══════════════════════════════════════════════════════════════════
    //  1. TRACK — Enregistrement d'une interaction
    // ══════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public void track(Long eventId, InteractionType type,
                      Long userId, String sessionId, String ipAddress) {

        // Déduplication vues par session
        if (type == InteractionType.VIEW && sessionId != null) {
            boolean alreadyViewed = interactionRepository
                    .existsByEventIdAndSessionIdAndTypeAndCreatedAtAfter(
                            eventId, sessionId,
                            InteractionType.VIEW,
                            LocalDateTime.now().minusHours(1));

            if (alreadyViewed) {
                log.debug("[POPULARITY] Vue dupliquée ignorée — eventId={} session={}",
                        eventId, sessionId);
                return;
            }
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Événement introuvable pour tracking : " + eventId));

        EventInteraction interaction = EventInteraction.builder()
                .event(event)
                .type(type)
                .sessionId(sessionId)
                .build();

        interactionRepository.save(interaction);

        log.debug("[POPULARITY] Tracked {} on event={} (user={}, session={}, ip={})",
                type, eventId, userId, sessionId, ipAddress);
    }

    @Async
    @Transactional
    @Override
    public void trackAsync(Long eventId, InteractionType type, Long userId,
                           String sessionId, String ipAddress) {
        track(eventId, type, userId, sessionId, ipAddress);
    }

    @Override
    @CacheEvict(value = "popularityDashboard", allEntries = true)
    public void invalidateCache() {
        log.info("[POPULARITY] Cache du dashboard invalidé");
    }

    // ══════════════════════════════════════════════════════════════════
    //  2. TOP POPULAR EVENTS
    // ══════════════════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "popularityTop", key = "#limit + '_' + #period")
    public List<PopularEventDTO> getTopPopularEvents(int limit, Period period) {
        LocalDateTime since = LocalDateTime.now().minus(period);

        List<Object[]> raw = interactionRepository.findPopularityScoresSince(since);

        return raw.stream()
                .limit(limit)
                .map(row -> {
                    Long   eventId = (Long)   row[0];
                    long   score   = ((Number) row[1]).longValue();

                    return eventRepository.findById(eventId).map(event -> {
                        long   uniqueViews = interactionRepository
                                .countUniqueViewsSince(eventId, since);
                        long   total       = interactionRepository
                                .countByEventId(eventId);
                        double convRate    = computeConversionRate(eventId);

                        return new PopularEventDTO(
                                eventId,
                                event.getTitle(),
                                event.getCategory() != null ? event.getCategory().getName() : "—",
                                event.getCategory() != null ? event.getCategory().getIcon() : "",
                                event.getStartDate(),
                                event.getLocation(),
                                score,
                                uniqueViews,
                                total,
                                convRate,
                                event.getRemainingSlots()
                        );
                    }).orElse(null);
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    // ══════════════════════════════════════════════════════════════════
    //  3. NEGLECTED EVENTS
    // ══════════════════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    public List<PopularEventDTO> getNeglectedEvents(int limit, long threshold) {
        List<Event> neglected = interactionRepository.findNeglectedEvents(
                LocalDateTime.now(),
                threshold,
                PageRequest.of(0, limit));

        return neglected.stream().map(event -> {
            long uniqueViews = interactionRepository
                    .countUniqueViewsSince(event.getId(), LocalDateTime.MIN);
            double convRate  = computeConversionRate(event.getId());

            return new PopularEventDTO(
                    event.getId(),
                    event.getTitle(),
                    event.getCategory() != null ? event.getCategory().getName() : "—",
                    event.getCategory() != null ? event.getCategory().getIcon() : "",
                    event.getStartDate(),
                    event.getLocation(),
                    0L,
                    uniqueViews,
                    interactionRepository.countByEventId(event.getId()),
                    convRate,
                    event.getRemainingSlots()
            );
        }).collect(Collectors.toList());
    }

    // ══════════════════════════════════════════════════════════════════
    //  4. ADMIN DASHBOARD
    // ══════════════════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "popularityDashboard")
    public PopularityDashboardDTO getAdminDashboard() {
        LocalDateTime now       = LocalDateTime.now();
        LocalDateTime since30d  = now.minusDays(30);
        LocalDateTime since7d   = now.minusDays(7);
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();

        List<PopularEventDTO> top = getTopPopularEvents(10, Period.ofDays(30));
        List<PopularEventDTO> neglected = getNeglectedEvents(10, 10L);

        // Breakdown par type (7 jours)
        List<Object[]> byTypeRaw = interactionRepository.countByTypeSince(since7d);
        Map<String, Long> byType = new LinkedHashMap<>();
        for (InteractionType t : InteractionType.values()) {
            byType.put(t.name(), 0L);
        }
        for (Object[] row : byTypeRaw) {
            byType.put(((InteractionType) row[0]).name(), ((Number) row[1]).longValue());
        }

        long viewsToday = interactionRepository.countByCreatedAtAfter(startOfDay);
        long totalThisWeek = interactionRepository.countByCreatedAtAfter(since7d);

        double avgConversion = top.stream()
                .mapToDouble(PopularEventDTO::conversionRate)
                .filter(r -> r > 0)
                .average()
                .orElse(0.0);

        return new PopularityDashboardDTO(
                top,
                neglected,
                byType,
                viewsToday,
                totalThisWeek,
                Math.round(avgConversion * 10.0) / 10.0,
                new PopularityDashboardDTO.PopularityPeriod(since30d, now, "Last 30 days")
        );
    }

    // ══════════════════════════════════════════════════════════════════
    //  5. EVENT POPULARITY DETAIL
    // ══════════════════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    public EventPopularityDetailDTO getEventPopularityDetail(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Événement introuvable : " + eventId));

        long views    = interactionRepository.countByEventIdAndType(eventId, InteractionType.VIEW);
        long unique   = interactionRepository.countUniqueViewsSince(eventId, LocalDateTime.MIN);
        long clicks   = interactionRepository.countByEventIdAndType(eventId, InteractionType.SEARCH_CLICK);
        long opens    = interactionRepository.countByEventIdAndType(eventId, InteractionType.DETAIL_OPEN);
        long waitlist = interactionRepository.countByEventIdAndType(eventId, InteractionType.WAITLIST_JOIN);
        long regs     = interactionRepository.countByEventIdAndType(eventId, InteractionType.REGISTRATION);
        long reviews  = interactionRepository.countByEventIdAndType(eventId, InteractionType.REVIEW_POSTED);

        double convRate = computeConversionRate(eventId);

        long score = (views    * InteractionType.VIEW.getWeight())
                + (clicks   * InteractionType.SEARCH_CLICK.getWeight())
                + (opens    * InteractionType.DETAIL_OPEN.getWeight())
                + (waitlist * InteractionType.WAITLIST_JOIN.getWeight())
                + (reviews  * InteractionType.REVIEW_POSTED.getWeight())
                + (regs     * InteractionType.REGISTRATION.getWeight());

        String trend = computeTrend(eventId);

        return new EventPopularityDetailDTO(
                eventId,
                event.getTitle(),
                views, unique, clicks, opens, waitlist, regs, reviews,
                convRate, score, trend
        );
    }

    // ══════════════════════════════════════════════════════════════════
    //  6. CLEANUP — Maintenance des données
    // ══════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public int cleanOldInteractions(int monthsToKeep) {
        LocalDateTime cutoff = LocalDateTime.now().minusMonths(monthsToKeep);
        int deleted = interactionRepository.deleteOlderThan(cutoff);
        log.info("[POPULARITY] Cleanup : {} interactions supprimées (avant {})",
                deleted, cutoff);
        invalidateCache(); // Nettoyer le cache après cleanup
        return deleted;
    }

    @Transactional
    @Override
    public void recalculateAllScores() {
        log.info("[POPULARITY] Recalcul de tous les scores...");
        invalidateCache();
        // Optionnel : déclencher un recalcul manuel
    }

    // ══════════════════════════════════════════════════════════════════
    //  HELPERS PRIVÉS
    // ══════════════════════════════════════════════════════════════════

    // ══════════════════════════════════════════════════════════════════
//  HELPERS PRIVÉS (CORRIGÉS)
// ══════════════════════════════════════════════════════════════════

    private double computeConversionRate(Long eventId) {
        try {
            Object[] data = interactionRepository.findConversionData(eventId);
            if (data == null || data.length == 0) return 0.0;

            long views = 0;
            long regs = 0;

            if (data[0] != null) {
                if (data[0] instanceof Number) {
                    views = ((Number) data[0]).longValue();
                }
            }

            if (data.length > 1 && data[1] != null) {
                if (data[1] instanceof Number) {
                    regs = ((Number) data[1]).longValue();
                }
            }

            if (views == 0) return 0.0;
            return Math.round((double) regs / views * 1000.0) / 10.0;

        } catch (Exception e) {
            log.error("Error computing conversion rate for event {}: {}", eventId, e.getMessage());
            return 0.0;
        }
    }

    private String computeTrend(Long eventId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        LocalDateTime fourteenDaysAgo = now.minusDays(14);

        long recentScore = computeScoreForPeriod(eventId, sevenDaysAgo, now);
        long prevScore = computeScoreForPeriod(eventId, fourteenDaysAgo, sevenDaysAgo);

        if (prevScore == 0) return "STABLE";
        double ratio = (double) recentScore / prevScore;

        if (ratio >= 1.2) return "RISING";
        if (ratio <= 0.8) return "DECLINING";
        return "STABLE";
    }

    private long computeScoreForPeriod(Long eventId,
                                       LocalDateTime from,
                                       LocalDateTime to) {
        long score = 0;
        for (InteractionType type : InteractionType.values()) {
            long count = interactionRepository.countByEventIdAndTypeAndCreatedAtBetween(
                    eventId, type, from, to);
            score += count * type.getWeight();
        }
        return score;
    }}