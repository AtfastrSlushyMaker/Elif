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

/**
 * ═══════════════════════════════════════════════════════════════════
 *  SERVICE MÉTIER AVANCÉ — Moteur de recommandations personnalisées
 * ═══════════════════════════════════════════════════════════════════
 *
 *  Cet algorithme analyse l'historique de l'utilisateur pour lui
 *  recommander les événements les plus pertinents.
 *
 *  FORMULE DE SCORING :
 *  ┌────────────────────────────────────────────────────────────────┐
 *  │                                                                │
 *  │  Score = (W_cat × S_cat) + (W_pop × S_pop) + (W_note × S_note) │
 *  │        + (W_prox × S_prox) + (W_slots × S_slots)               │
 *  │                                                                │
 *  │  Avec :                                                        │
 *  │  • W_cat = 0.35 (35%)  • S_cat = fréquence catégorie / max    │
 *  │  • W_pop = 0.25 (25%)  • S_pop = places_prises / capacité     │
 *  │  • W_note = 0.20 (20%) • S_note = note_moyenne / 5            │
 *  │  • W_prox = 0.15 (15%) • S_prox = 1 - (jours_restants / 30)   │
 *  │  • W_slots = 0.05 (5%) • S_slots = 1 si dispo, sinon 0        │
 *  │                                                                │
 *  └────────────────────────────────────────────────────────────────┘
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class EventRecommendationEngine implements IEventRecommendationEngine {

    // ─────────────────────────────────────────────────────────────────
    // DÉPENDANCES (repositories existants)
    // ─────────────────────────────────────────────────────────────────
    private final EventRepository            eventRepository;
    private final EventParticipantRepository participantRepository;
    private final EventReviewRepository      reviewRepository;

    // ─────────────────────────────────────────────────────────────────
    // PONDÉRATIONS DE L'ALGORITHME (configurables)
    // ─────────────────────────────────────────────────────────────────
    private static final double WEIGHT_CATEGORY   = 0.35;   // 35% - Historique utilisateur
    private static final double WEIGHT_POPULARITY = 0.25;   // 25% - Taux de remplissage
    private static final double WEIGHT_RATING     = 0.20;   // 20% - Note moyenne
    private static final double WEIGHT_PROXIMITY  = 0.15;   // 15% - Date proche
    private static final double WEIGHT_SLOTS      = 0.05;   // 5%  - Places disponibles

    // Seuils pour les explications et badges
    private static final double THRESHOLD_CATEGORY_MATCH = 0.5;   // 50% pour dire "catégorie favorite"
    private static final double THRESHOLD_POPULARITY     = 0.7;   // 70% pour dire "populaire"
    private static final double THRESHOLD_RATING         = 0.8;   // 4/5 pour dire "bien noté"
    private static final double THRESHOLD_PROXIMITY      = 0.6;   // 60% pour dire "bientôt"

    // ─────────────────────────────────────────────────────────────────
    // MÉTHODE PRINCIPALE : RECOMMANDATIONS PERSONNALISÉES
    // ─────────────────────────────────────────────────────────────────

    @Override
    @Cacheable(value = "recommendations", key = "#userId + '_' + #limit", unless = "#result.isEmpty()")
    public List<EventRecommendationResponse> getPersonalizedRecommendations(Long userId, int limit) {
        long startTime = System.currentTimeMillis();

        // Limiter le nombre de recommandations (entre 1 et 20)
        int safeLimit = Math.min(Math.max(limit, 1), 20);

        log.info("🎯 Génération de recommandations pour l'utilisateur {}", userId);

        // ─── ÉTAPE 1 : Récupérer les événements déjà rejoints ─────────────
        Set<Long> joinedEventIds = getJoinedEventIds(userId);
        log.debug("📋 Utilisateur {} a déjà rejoint {} événement(s)", userId, joinedEventIds.size());

        // ─── ÉTAPE 2 : Analyser les catégories préférées ───────────────────
        Map<Long, Long> categoryFrequency = computeCategoryFrequency(userId);
        log.debug("📊 Fréquences des catégories pour userId {} : {}", userId, categoryFrequency);

        // ─── ÉTAPE 3 : Récupérer les événements candidats ──────────────────
        List<Event> candidates = getCandidateEvents(joinedEventIds);

        if (candidates.isEmpty()) {
            log.info("⚠️ Aucun événement candidat pour userId={}", userId);
            return Collections.emptyList();
        }

        log.debug("🔍 {} événements candidats trouvés", candidates.size());

        // ─── ÉTAPE 4 : Calculer le score de chaque candidat ─────────────────
        List<EventRecommendationResponse> recommendations = candidates.stream()
                .map(event -> computeScore(event, categoryFrequency))
                .sorted(Comparator.comparingDouble(EventRecommendationResponse::getScore).reversed())
                .limit(safeLimit)
                .collect(Collectors.toList());

        long elapsedTime = System.currentTimeMillis() - startTime;
        log.info("✅ {} recommandations générées en {} ms pour userId={}",
                recommendations.size(), elapsedTime, userId);

        return recommendations;
    }

    // ─────────────────────────────────────────────────────────────────
    // MÉTHODE SECONDAIRE : ÉVÉNEMENTS TENDANCE
    // ─────────────────────────────────────────────────────────────────

    @Override
    public List<EventSummaryResponse> getTrendingEvents(int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 10);

        log.info("📈 Génération des événements tendance (limit={})", safeLimit);

        return eventRepository.findAll()
                .stream()
                // Filtrer : événements futurs et actifs
                .filter(e -> e.getStartDate().isAfter(LocalDateTime.now()))
                .filter(e -> e.getStatus() == EventStatus.PLANNED
                        || e.getStatus() == EventStatus.ONGOING
                        || e.getStatus() == EventStatus.FULL)
                // Trier par score de popularité
                .sorted(Comparator.comparingDouble(this::computePopularityScore).reversed())
                .limit(safeLimit)
                .map(this::toSummaryResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────
    // MÉTHODE : RAFRAÎCHIR LE CACHE
    // ─────────────────────────────────────────────────────────────────

    @Override
    @CacheEvict(value = "recommendations", key = "#userId")
    public void refreshUserRecommendations(Long userId) {
        log.info("🔄 Cache des recommandations vidé pour l'utilisateur {}", userId);
    }

    // ─────────────────────────────────────────────────────────────────
    // MÉTHODES PRIVÉES - ÉTAPE 1 : RÉCUPÉRATION DES DONNÉES
    // ─────────────────────────────────────────────────────────────────

    /**
     * Récupère les IDs des événements déjà rejoints par l'utilisateur.
     * Un événement déjà rejoint ne doit pas être recommandé.
     */
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

    /**
     * Calcule la fréquence de chaque catégorie dans l'historique de l'utilisateur.
     * Exemple de retour : {3: 5, 7: 2, 12: 1}
     * Signification : l'utilisateur a participé à 5 événements de catégorie 3,
     *                 2 événements de catégorie 7, etc.
     */
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

    /**
     * Récupère tous les événements candidats à la recommandation.
     * Critères :
     * - Non déjà rejoints par l'utilisateur
     * - Statut PLANNED ou FULL (actifs)
     * - Date de début dans le futur
     * - Places disponibles (optionnel, car FULL peut être intéressant)
     */
    private List<Event> getCandidateEvents(Set<Long> joinedEventIds) {
        return eventRepository.findAll()
                .stream()
                .filter(e -> !joinedEventIds.contains(e.getId()))
                .filter(e -> e.getStatus() == EventStatus.PLANNED
                        || e.getStatus() == EventStatus.FULL)
                .filter(e -> e.getStartDate().isAfter(LocalDateTime.now()))
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────────
    // MÉTHODES PRIVÉES - ÉTAPE 2 : CALCUL DES SCORES
    // ─────────────────────────────────────────────────────────────────

    /**
     * Calcule le score complet d'un événement pour un utilisateur.
     *
     * Formule :
     * Score = (35% × ScoreCatégorie) + (25% × ScorePopularité)
     *       + (20% × ScoreNote) + (15% × ScoreProximité)
     *       + (5% × ScorePlaces)
     */
    private EventRecommendationResponse computeScore(Event event, Map<Long, Long> categoryFrequency) {

        // Calcul des 5 scores individuels (chacun entre 0 et 1)
        double scoreCategory   = computeCategoryScore(event, categoryFrequency);
        double scorePopularity = computePopularityScore(event);
        double scoreRating     = computeRatingScore(event);
        double scoreProximity  = computeProximityScore(event);
        double scoreSlots      = computeSlotsScore(event);

        // Application des pondérations
        double totalScore = (WEIGHT_CATEGORY   * scoreCategory)
                + (WEIGHT_POPULARITY * scorePopularity)
                + (WEIGHT_RATING     * scoreRating)
                + (WEIGHT_PROXIMITY  * scoreProximity)
                + (WEIGHT_SLOTS      * scoreSlots);

        // Conversion en pourcentage (0-100) avec 1 décimale
        double finalScore = Math.round(totalScore * 1000.0) / 10.0;

        // Construction de l'explication lisible
        String reason = buildExplanation(scoreCategory, scorePopularity,
                scoreRating, scoreProximity, event);

        // Flags pour l'affichage (badges)
        boolean matchedByCategory = scoreCategory >= THRESHOLD_CATEGORY_MATCH;
        boolean matchedByPopularity = scorePopularity >= THRESHOLD_POPULARITY;
        boolean matchedByRating = scoreRating >= THRESHOLD_RATING;

        // Détail des scores pour débogage
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

    /**
     * Score de catégorie (0-1)
     *
     * Calcule à quel point l'utilisateur aime cette catégorie.
     * Principe : plus l'utilisateur a participé à des événements de cette catégorie,
     * plus le score est élevé.
     *
     * Exemple : Si l'utilisateur a participé à :
     * - 5 événements de catégorie Jazz (fréquence max = 5)
     * - 2 événements de catégorie Cuisine
     *
     * Alors :
     * - Score pour Jazz = 5/5 = 1.0
     * - Score pour Cuisine = 2/5 = 0.4
     * - Score pour Rock = 0/5 = 0.0 (catégorie jamais fréquentée)
     */
    private double computeCategoryScore(Event event, Map<Long, Long> categoryFrequency) {
        // Si l'événement n'a pas de catégorie, score neutre
        if (event.getCategory() == null) {
            return 0.3;
        }

        // Si l'utilisateur n'a pas d'historique, score neutre
        if (categoryFrequency.isEmpty()) {
            return 0.3;
        }

        Long categoryId = event.getCategory().getId();

        // Si l'utilisateur n'a jamais participé à cette catégorie
        if (!categoryFrequency.containsKey(categoryId)) {
            return 0.0;
        }

        // Fréquence maximale parmi toutes les catégories
        long maxFrequency = categoryFrequency.values().stream()
                .max(Long::compare)
                .orElse(1L);

        // Score = fréquence de cette catégorie / fréquence max
        return (double) categoryFrequency.get(categoryId) / maxFrequency;
    }

    /**
     * Score de popularité (0-1)
     *
     * Calcule le taux de remplissage de l'événement.
     * Plus l'événement est rempli, plus il est populaire.
     *
     * Exemple :
     * - Capacité 100, 80 inscrits → 80/100 = 0.8 (80% de remplissage)
     * - Capacité 50, 10 inscrits → 10/50 = 0.2 (20% de remplissage)
     */
    private double computePopularityScore(Event event) {
        if (event.getMaxParticipants() == null || event.getMaxParticipants() <= 0) {
            return 0.5; // Score neutre si capacité non définie
        }

        int usedSeats = event.getMaxParticipants() - event.getRemainingSlots();
        return (double) usedSeats / event.getMaxParticipants();
    }

    /**
     * Score de note moyenne (0-1)
     *
     * Calcule la note moyenne de l'événement normalisée sur 5.
     *
     * Exemple :
     * - Note moyenne 4.5/5 → 4.5/5 = 0.9 (90%)
     * - Note moyenne 3.0/5 → 3.0/5 = 0.6 (60%)
     * - Pas d'avis → 0.5 (score neutre)
     */
    private double computeRatingScore(Event event) {
        Double averageRating = reviewRepository.findAverageRatingByEventId(event.getId());

        if (averageRating == null || averageRating == 0.0) {
            return 0.5; // Score neutre pour les nouveaux événements
        }

        return averageRating / 5.0;
    }

    /**
     * Score de proximité temporelle (0-1)
     *
     * Plus l'événement est proche, plus le score est élevé.
     * Événement demain → score 1.0
     * Événement dans 30 jours → score 0.0
     *
     * Formule : 1 - (jours_restants / 30)
     */
    private double computeProximityScore(Event event) {
        long daysUntil = ChronoUnit.DAYS.between(LocalDateTime.now(), event.getStartDate());

        if (daysUntil < 0) {
            return 0.0; // Événement passé
        }
        if (daysUntil > 30) {
            return 0.0; // Trop loin (plus d'un mois)
        }

        return 1.0 - (daysUntil / 30.0);
    }

    /**
     * Score de disponibilité des places (0 ou 1)
     *
     * Binaire : 1 s'il reste des places, 0 sinon.
     * Un événement complet ne peut pas recevoir de nouvelles inscriptions.
     */
    private double computeSlotsScore(Event event) {
        return event.getRemainingSlots() > 0 ? 1.0 : 0.0;
    }

    // ─────────────────────────────────────────────────────────────────
    // MÉTHODES PRIVÉES - ÉTAPE 3 : EXPLICATIONS ET MAPPING
    // ─────────────────────────────────────────────────────────────────

    /**
     * Construit une explication lisible pour l'utilisateur.
     *
     * Exemples de sortie :
     * - "Recommandé car correspond à vos catégories favorites (Jazz)"
     * - "Recommandé car très populaire (85% complet)"
     * - "Recommandé car très bien noté (4.5/5)"
     * - "Recommandé car arrive bientôt (dans 3 jours)"
     * - "Recommandé car correspond à vos goûts et très populaire"
     */
    private String buildExplanation(double scoreCategory, double scorePopularity,
                                    double scoreRating, double scoreProximity,
                                    Event event) {
        List<String> reasons = new ArrayList<>();

        // Vérifier chaque critère qui dépasse le seuil
        if (scoreCategory >= THRESHOLD_CATEGORY_MATCH && event.getCategory() != null) {
            reasons.add("correspond à vos catégories favorites (" + event.getCategory().getName() + ")");
        }

        if (scorePopularity >= THRESHOLD_POPULARITY) {
            int fillPercent = (int) (scorePopularity * 100);
            reasons.add("très populaire (" + fillPercent + "% des places déjà prises)");
        }

        if (scoreRating >= THRESHOLD_RATING) {
            reasons.add("très bien noté par les participants");
        }

        if (scoreProximity >= THRESHOLD_PROXIMITY) {
            long daysUntil = ChronoUnit.DAYS.between(LocalDateTime.now(), event.getStartDate());
            reasons.add("arrive bientôt (dans " + daysUntil + " jour" + (daysUntil > 1 ? "s" : "") + ")");
        }

        // Si aucun critère n'a dépassé le seuil, message par défaut
        if (reasons.isEmpty()) {
            return "Sélectionné pour vous parmi les événements à venir.";
        }

        // Construire la phrase finale
        if (reasons.size() == 1) {
            return "Recommandé car " + reasons.get(0) + ".";
        } else {
            String lastReason = reasons.remove(reasons.size() - 1);
            return "Recommandé car " + String.join(", ", reasons) + " et " + lastReason + ".";
        }
    }

    /**
     * Convertit un événement en DTO de résumé.
     */
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