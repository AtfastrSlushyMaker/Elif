package com.elif.services.events.implementations;

import com.elif.dto.events.response.EventRecommendationResponse;
import com.elif.dto.events.response.EventSummaryResponse;
import com.elif.entities.events.Event;
import com.elif.entities.events.EventStatus;
import com.elif.entities.events.ParticipantStatus;
import com.elif.repositories.events.EventParticipantRepository;
import com.elif.repositories.events.EventRepository;
import com.elif.repositories.events.EventReviewRepository;
import com.elif.services.events.interfaces.IEventRecommendationEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class EventRecommendationEngine implements IEventRecommendationEngine {

    private final EventRepository eventRepository;
    private final EventParticipantRepository participantRepository;
    private final EventReviewRepository reviewRepository;

    private static final double WEIGHT_CATEGORY   = 0.35;
    private static final double WEIGHT_POPULARITY = 0.25;
    private static final double WEIGHT_RATING     = 0.20;
    private static final double WEIGHT_PROXIMITY  = 0.15;
    private static final double WEIGHT_SLOTS      = 0.05;

    private static final double THRESHOLD_CATEGORY_MATCH = 0.5;
    private static final double THRESHOLD_POPULARITY     = 0.7;
    private static final double THRESHOLD_RATING         = 0.8;
    private static final double THRESHOLD_PROXIMITY      = 0.6;

    @Override
    @Cacheable(value = "recommendations", key = "#userId + '_' + #limit", unless = "#result.isEmpty()")
    public List<EventRecommendationResponse> getPersonalizedRecommendations(Long userId, int limit) {
        long startTime = System.currentTimeMillis();

        int safeLimit = Math.min(Math.max(limit, 1), 20);

        log.info("🎯 Generating recommendations for user {}", userId);

        Set<Long> joinedEventIds = getJoinedEventIds(userId);
        log.debug("📋 User {} has already joined {} event(s)", userId, joinedEventIds.size());

        Map<Long, Long> categoryFrequency = computeCategoryFrequency(userId);
        log.debug("📊 Category frequencies for userId {}: {}", userId, categoryFrequency);

        List<Event> candidates = getCandidateEvents(joinedEventIds);

        if (candidates.isEmpty()) {
            log.info("⚠️ No candidate events for userId={}", userId);
            return Collections.emptyList();
        }

        log.debug("🔍 {} candidate events found", candidates.size());

        List<EventRecommendationResponse> recommendations = candidates.stream()
                .map(event -> computeScore(event, categoryFrequency))
                .sorted(Comparator.comparingDouble(EventRecommendationResponse::getScore).reversed())
                .limit(safeLimit)
                .collect(Collectors.toList());

        long elapsedTime = System.currentTimeMillis() - startTime;
        log.info("✅ {} recommendations generated in {} ms for userId={}",
                recommendations.size(), elapsedTime, userId);

        return recommendations;
    }

    @Override
    public List<EventSummaryResponse> getTrendingEvents(int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 10);

        log.info("📈 Generating trending events (limit={})", safeLimit);

        return eventRepository.findAll()
                .stream()
                .filter(e -> e.getStartDate().isAfter(LocalDateTime.now()))
                .filter(e -> e.getStatus() == EventStatus.PLANNED
                        || e.getStatus() == EventStatus.ONGOING
                        || e.getStatus() == EventStatus.FULL)
                .sorted(Comparator.comparingDouble(this::computePopularityScore).reversed())
                .limit(safeLimit)
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @CacheEvict(value = "recommendations", key = "#userId")
    public void refreshUserRecommendations(Long userId) {
        log.info("🔄 Cache cleared for user {}", userId);
    }

    private Set<Long> getJoinedEventIds(Long userId) {
        return participantRepository
                .findByUserIdOrderByRegisteredAtDesc(userId, null)
                .getContent()
                .stream()
                .filter(p -> p.getStatus() == ParticipantStatus.CONFIRMED
                        || p.getStatus() == ParticipantStatus.ATTENDED)
                .map(p -> p.getEvent().getId())
                .collect(Collectors.toSet());
    }

    private Map<Long, Long> computeCategoryFrequency(Long userId) {
        return participantRepository
                .findByUserIdOrderByRegisteredAtDesc(userId, null)
                .getContent()
                .stream()
                .filter(p -> p.getStatus() == ParticipantStatus.CONFIRMED
                        || p.getStatus() == ParticipantStatus.ATTENDED)
                .filter(p -> p.getEvent().getCategory() != null)
                .collect(Collectors.groupingBy(
                        p -> p.getEvent().getCategory().getId(),
                        Collectors.counting()
                ));
    }

    private List<Event> getCandidateEvents(Set<Long> joinedEventIds) {
        return eventRepository.findAll()
                .stream()
                .filter(e -> !joinedEventIds.contains(e.getId()))
                .filter(e -> e.getStatus() == EventStatus.PLANNED
                        || e.getStatus() == EventStatus.FULL)
                .filter(e -> e.getStartDate().isAfter(LocalDateTime.now()))
                .collect(Collectors.toList());
    }

    private EventRecommendationResponse computeScore(Event event, Map<Long, Long> categoryFrequency) {

        double scoreCategory   = computeCategoryScore(event, categoryFrequency);
        double scorePopularity = computePopularityScore(event);
        double scoreRating     = computeRatingScore(event);
        double scoreProximity  = computeProximityScore(event);
        double scoreSlots      = computeSlotsScore(event);

        double totalScore = (WEIGHT_CATEGORY   * scoreCategory)
                + (WEIGHT_POPULARITY * scorePopularity)
                + (WEIGHT_RATING     * scoreRating)
                + (WEIGHT_PROXIMITY  * scoreProximity)
                + (WEIGHT_SLOTS      * scoreSlots);

        double finalScore = Math.round(totalScore * 1000.0) / 10.0;

        String reason = buildExplanation(scoreCategory, scorePopularity,
                scoreRating, scoreProximity, event);

        boolean matchedByCategory = scoreCategory >= THRESHOLD_CATEGORY_MATCH;
        boolean matchedByPopularity = scorePopularity >= THRESHOLD_POPULARITY;
        boolean matchedByRating = scoreRating >= THRESHOLD_RATING;

        EventRecommendationResponse.ScoreBreakdown breakdown =
                EventRecommendationResponse.ScoreBreakdown.builder()
                        .categoryScore(Math.round(scoreCategory * 35 * 10.0) / 10.0)
                        .popularityScore(Math.round(scorePopularity * 25 * 10.0) / 10.0)
                        .ratingScore(Math.round(scoreRating * 20 * 10.0) / 10.0)
                        .proximityScore(Math.round(scoreProximity * 15 * 10.0) / 10.0)
                        .slotsScore(Math.round(scoreSlots * 5 * 10.0) / 10.0)
                        .totalScore(finalScore)
                        .build();

        return EventRecommendationResponse.builder()
                .event(toSummaryResponse(event))
                .score(finalScore)
                .reason(reason)
                .matchedByCategory(matchedByCategory)
                .matchedByPopularity(matchedByPopularity)
                .matchedByRating(matchedByRating)
                .breakdown(breakdown)
                .build();
    }

    private double computeCategoryScore(Event event, Map<Long, Long> categoryFrequency) {
        if (event.getCategory() == null) {
            return 0.3;
        }

        if (categoryFrequency.isEmpty()) {
            return 0.3;
        }

        Long categoryId = event.getCategory().getId();

        if (!categoryFrequency.containsKey(categoryId)) {
            return 0.0;
        }

        long maxFrequency = categoryFrequency.values().stream()
                .max(Long::compare)
                .orElse(1L);

        return (double) categoryFrequency.get(categoryId) / maxFrequency;
    }

    private double computePopularityScore(Event event) {
        if (event.getMaxParticipants() == null || event.getMaxParticipants() <= 0) {
            return 0.5;
        }

        int usedSeats = event.getMaxParticipants() - event.getRemainingSlots();
        return (double) usedSeats / event.getMaxParticipants();
    }

    private double computeRatingScore(Event event) {
        Double averageRating = reviewRepository.findAverageRatingByEventId(event.getId());

        if (averageRating == null || averageRating == 0.0) {
            return 0.5;
        }

        return averageRating / 5.0;
    }

    private double computeProximityScore(Event event) {
        long daysUntil = ChronoUnit.DAYS.between(LocalDateTime.now(), event.getStartDate());

        if (daysUntil < 0) {
            return 0.0;
        }
        if (daysUntil > 30) {
            return 0.0;
        }

        return 1.0 - (daysUntil / 30.0);
    }

    private double computeSlotsScore(Event event) {
        return event.getRemainingSlots() > 0 ? 1.0 : 0.0;
    }

    private String buildExplanation(double scoreCategory, double scorePopularity,
                                    double scoreRating, double scoreProximity,
                                    Event event) {
        List<String> reasons = new ArrayList<>();

        if (scoreCategory >= THRESHOLD_CATEGORY_MATCH && event.getCategory() != null) {
            reasons.add("matches your favorite categories (" + event.getCategory().getName() + ")");
        }

        if (scorePopularity >= THRESHOLD_POPULARITY) {
            int fillPercent = (int) (scorePopularity * 100);
            reasons.add("very popular (" + fillPercent + "% of seats already taken)");
        }

        if (scoreRating >= THRESHOLD_RATING) {
            reasons.add("highly rated by participants");
        }

        if (scoreProximity >= THRESHOLD_PROXIMITY) {
            long daysUntil = ChronoUnit.DAYS.between(LocalDateTime.now(), event.getStartDate());
            reasons.add("coming soon (in " + daysUntil + " day" + (daysUntil > 1 ? "s" : "") + ")");
        }

        if (reasons.isEmpty()) {
            return "Selected for you among upcoming events.";
        }

        if (reasons.size() == 1) {
            return "Recommended because " + reasons.get(0) + ".";
        } else {
            String lastReason = reasons.remove(reasons.size() - 1);
            return "Recommended because " + String.join(", ", reasons) + " and " + lastReason + ".";
        }
    }

    private EventSummaryResponse toSummaryResponse(Event event) {
        Double averageRating = reviewRepository.findAverageRatingByEventId(event.getId());
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
                .organizerName(event.getCreatedBy() != null
                        ? event.getCreatedBy().getFirstName() + " " + event.getCreatedBy().getLastName()
                        : null)
                .averageRating(averageRating != null ? Math.round(averageRating * 10.0) / 10.0 : 0.0)
                .reviewCount((int) reviewCount)
                .build();
    }
}