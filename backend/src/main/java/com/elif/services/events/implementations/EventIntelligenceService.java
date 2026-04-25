
        package com.elif.services.events.implementations;

import com.elif.dto.events.request.EventAnalysisRequestDTO;
import com.elif.dto.events.response.EventAnalysisResponseDTO;
import com.elif.dto.events.response.EventAnalysisResponseDTO.RecommendationDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ════════════════════════════════════════════════════════════════
 *  EventIntelligenceService — VERSION CORRIGÉE (BOUCLE INFINIE RÉSOLUE)
 *
 *  PROBLÈME RACINE :
 *  GROQ recommandait price=50 → admin applique → GROQ dit "mets 75"
 *  Cause : GROQ ignorait les "appliedChanges" car la comparaison
 *  dans wasAlreadyApplied() ne fonctionnait jamais.
 *  De plus, GROQ ne mémorisait pas les VALEURS déjà testées,
 *  seulement les champs — donc il pouvait recommander une valeur
 *  différente pour le même champ indéfiniment.
 *
 *  SOLUTION :
 *  1. appliedChanges stocke maintenant "field:value" (ex: "price:50")
 *     → GROQ sait exactement quelles valeurs ont déjà été essayées
 *  2. alreadyApplied() compare field ET valeur (plus seulement field)
 *  3. Seuil de convergence : si score >= 75 ET aucune reco critique
 *     → retourner "stable" et ne plus recommander
 *  4. Système de priorité (high/medium/low) pour filtrer intelligemment
 * ════════════════════════════════════════════════════════════════
 */
@Service
@Slf4j
public class EventIntelligenceService {

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    @Value("${ai.groq.api-key:}")
    private String groqApiKey;

    @Value("${ai.groq.model:llama-3.1-8b-instant}")
    private String groqModel;

    @Value("${ai.groq.api-url:https://api.groq.com/openai/v1/chat/completions}")
    private String groqApiUrl;

    @Value("${ai.groq.max-tokens:2048}")
    private int maxTokens;

    public EventIntelligenceService(ObjectMapper objectMapper, RestTemplateBuilder builder) {
        this.objectMapper = objectMapper;
        this.restTemplate = builder
                .connectTimeout(Duration.ofSeconds(10))
                .readTimeout(Duration.ofSeconds(30))
                .build();
    }

    // ─────────────────────────────────────────────────────────────
    // ENTRY POINT
    // ─────────────────────────────────────────────────────────────

    public EventAnalysisResponseDTO analyze(EventAnalysisRequestDTO request) {
        EventAnalysisRequestDTO normalized = normalize(request);

        log.info("🎯 Analyzing event: title='{}', capacity={}, appliedChanges={}",
                normalized.getTitle(), normalized.getMaxCapacity(), normalized.getAppliedChanges());

        // ✅ FIX BOUCLE — si score convergé, retourner état stable sans reco
        if (isConverged(normalized)) {
            log.info("✅ Convergence detected for event '{}'", normalized.getTitle());
            return buildConvergedResponse(normalized);
        }

        if (groqApiKey == null || groqApiKey.isBlank()) {
            log.warn("⚠️ ai.groq.api-key not set — using rule-based fallback");
            return buildFallback(normalized);
        }

        try {
            EventAnalysisResponseDTO raw = callGroq(normalized);
            EventAnalysisResponseDTO sanitized = sanitize(raw, normalized);
            log.info("✅ GROQ analysis completed: score={}, recommendations={}",
                    sanitized.getScore(), sanitized.getRecommendations().size());
            return sanitized;
        } catch (Exception e) {
            log.warn("⚠️ GROQ failed ({}), using rule-based fallback", e.getMessage());
            return buildFallback(normalized);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // ✅ DÉTECTION DE CONVERGENCE
    // ─────────────────────────────────────────────────────────────

    private boolean isConverged(EventAnalysisRequestDTO r) {
        if (r.getAppliedChanges() == null || r.getAppliedChanges().size() < 2) {
            return false;
        }

        // Compter les champs critiques déjà appliqués
        Set<String> appliedFields = r.getAppliedChanges().stream()
                .map(c -> c.contains(":") ? c.split(":")[0] : c)
                .collect(Collectors.toSet());

        // Vérifier les critères de qualité minimale
        boolean titleOk = !r.getTitle().isBlank() && r.getTitle().length() >= 15;
        boolean descOk = r.getDescription() != null && r.getDescription().length() >= 80;
        boolean locationOk = r.getLocation() != null && !r.getLocation().isBlank();

        // Si au moins 2 champs critiques ont été améliorés ET le titre est OK
        boolean hasCriticalImprovements = appliedFields.size() >= 2 && titleOk;

        // Score rapide estimé
        int quickScore = computeQuickScore(r);
        boolean scoreGood = quickScore >= 70;

        return hasCriticalImprovements && (scoreGood || (titleOk && descOk && locationOk));
    }

    private EventAnalysisResponseDTO buildConvergedResponse(EventAnalysisRequestDTO r) {
        int score = Math.max(computeQuickScore(r), 72);
        int predictedAtt = Math.min((int)(r.getMaxCapacity() * 0.75), r.getMaxCapacity());
        int predictedEng = Math.min(7 + r.getAppliedChanges().size(), 10);

        log.info("🏁 Convergence response: score={}, attendance={}, engagement={}",
                score, predictedAtt, predictedEng);

        return EventAnalysisResponseDTO.builder()
                .score(score)
                .predictionAttendance(Math.max(5, predictedAtt))
                .predictionEngagement(predictedEng)
                .analysis("Votre événement est bien configuré. Toutes les améliorations clés ont été appliquées — vous êtes prêt à publier !")
                .recommendations(new ArrayList<>()) // ✅ plus de recommandations si convergé
                .build();
    }

    // ─────────────────────────────────────────────────────────────
    // APPEL GROQ
    // ─────────────────────────────────────────────────────────────

    private EventAnalysisResponseDTO callGroq(EventAnalysisRequestDTO req) throws Exception {
        Map<String, Object> payload = Map.of(
                "model", groqModel,
                "messages", List.of(
                        Map.of("role", "system", "content", buildSystemPrompt()),
                        Map.of("role", "user", "content", buildUserPrompt(req))
                ),
                "temperature", 0.1,  // ✅ réduit la créativité → plus stable
                "max_tokens", maxTokens,
                "response_format", Map.of("type", "json_object")
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        log.debug("📡 Calling Groq API with model: {}", groqModel);

        ResponseEntity<String> response = restTemplate.postForEntity(
                groqApiUrl, new HttpEntity<>(payload, headers), String.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new IllegalStateException("GROQ returned " + response.getStatusCode());
        }

        JsonNode root = objectMapper.readTree(response.getBody());
        String content = root.path("choices").path(0).path("message").path("content").asText("");

        if (content.isBlank()) {
            throw new IllegalStateException("GROQ returned empty content");
        }

        String cleaned = content
                .replaceAll("(?s)```json\\s*", "")
                .replaceAll("(?s)```", "")
                .trim();

        log.debug("📥 Groq response cleaned: {}", cleaned.substring(0, Math.min(200, cleaned.length())));

        return objectMapper.readValue(cleaned, EventAnalysisResponseDTO.class);
    }

    // ─────────────────────────────────────────────────────────────
    // PROMPTS
    // ─────────────────────────────────────────────────────────────

    private String buildSystemPrompt() {
        return """
            Tu es ELIF Event Intelligence, un coach expert en événements pour animaux de compagnie.
            Retourne UNIQUEMENT un objet JSON valide. Pas de markdown, pas de texte en dehors du JSON.
            
            RÈGLES CRITIQUES:
            - Ne JAMAIS recommander une combinaison champ:valeur déjà listée dans "already_applied_values"
            - Si un champ a été essayé plusieurs fois, accepte la valeur actuelle comme finale
            - Si le score >= 75, retourne un tableau recommendations vide
            - Sois convergent: ne pas osciller entre plusieurs valeurs pour le même champ
            - Limite à 3 recommandations maximum
            - La prédiction de participation (prediction_attendance) ne doit PAS dépasser la capacité max
            
            Retourne ce JSON EXACT:
            {
              "score": <0-100>,
              "prediction_attendance": <entier>,
              "prediction_engagement": <1-10>,
              "analysis": "<max 200 caractères>",
              "recommendations": [
                {
                  "field": "title|description|date|location|price|animal_types|max_capacity",
                  "priority": "high|medium|low",
                  "reason": "<max 100 caractères>",
                  "suggested_value": <string, nombre, ou tableau>
                }
              ]
            }
            """;
    }

    private String buildUserPrompt(EventAnalysisRequestDTO r) {
        List<String> animals = r.getAnimalTypes() != null ? r.getAnimalTypes() : new ArrayList<>();
        List<String> applied = r.getAppliedChanges() != null ? r.getAppliedChanges() : new ArrayList<>();

        // Format des valeurs déjà appliquées
        String appliedSummary = applied.isEmpty() ? "aucune"
                : applied.stream().collect(Collectors.joining(", "));

        // Extraire les champs déjà appliqués (sans les valeurs)
        Set<String> appliedFields = applied.stream()
                .map(c -> c.contains(":") ? c.split(":")[0] : c)
                .collect(Collectors.toSet());

        String previousAnalysis = (r.getPreviousAnalysis() != null && !r.getPreviousAnalysis().isBlank())
                ? r.getPreviousAnalysis() : "aucune";

        return String.format("""
            Analyse ce projet d'événement pour animaux de compagnie.
            
            Titre        : %s
            Description  : %s (%d caractères)
            Date         : %s
            Lieu         : %s
            Prix         : %s
            Types animaux: %s
            Capacité max : %d
            
            DÉJÀ APPLIQUÉ (ne PAS recommander à nouveau ces valeurs exactes):
            [%s]
            
            Champs déjà corrigés: [%s]
            
            Analyse précédente: %s
            
            RÈGLES STRICTES:
            - Si score >= 75: recommendations = []
            - Maximum 3 recommandations
            - prediction_attendance <= %d
            - Ne JAMAIS recommander un champ déjà dans "Champs déjà corrigés"
            - Ne JAMAIS suggérer une valeur déjà dans la liste "DÉJÀ APPLIQUÉ"
            """,
                safe(r.getTitle()),
                safe(r.getDescription()), r.getDescription() != null ? r.getDescription().length() : 0,
                r.getDate() != null ? r.getDate().toString() : "non définie",
                safe(r.getLocation()),
                r.getPrice() != null ? r.getPrice().setScale(2, RoundingMode.HALF_UP).toString() : "non défini",
                animals.isEmpty() ? "non spécifiés" : String.join(", ", animals),
                r.getMaxCapacity(),
                appliedSummary,
                String.join(", ", appliedFields),
                previousAnalysis,
                r.getMaxCapacity()
        );
    }

    // ─────────────────────────────────────────────────────────────
    // SANITIZE - Validation et filtrage
    // ─────────────────────────────────────────────────────────────

    private EventAnalysisResponseDTO sanitize(EventAnalysisResponseDTO raw, EventAnalysisRequestDTO req) {
        if (raw == null) {
            return buildFallback(req);
        }

        // Clamp des valeurs
        raw.setScore(clamp(raw.getScore(), 0, 100));

        int minAttendance = Math.max(3, req.getMaxCapacity() / 10);
        raw.setPredictionAttendance(clamp(raw.getPredictionAttendance(), minAttendance, req.getMaxCapacity()));
        raw.setPredictionEngagement(clamp(raw.getPredictionEngagement(), 1, 10));

        String defaultAnalysis = "Analyse basée sur les données disponibles. Ajoutez plus de détails pour une meilleure précision.";
        raw.setAnalysis(safeText(raw.getAnalysis(), defaultAnalysis));

        // ✅ Filtrage : champ + valeur
        List<RecommendationDTO> validRecs = new ArrayList<>();

        if (raw.getRecommendations() != null) {
            for (RecommendationDTO rec : raw.getRecommendations()) {
                if (rec == null || rec.getField() == null || rec.getReason() == null) {
                    continue;
                }

                String normalizedField = normalizeField(rec.getField());
                if (normalizedField == null) {
                    continue;
                }

                // Vérifier si déjà appliqué
                if (alreadyApplied(normalizedField, rec.getSuggestedValue(), req.getAppliedChanges())) {
                    log.debug("Skipping already applied recommendation: {} -> {}", normalizedField, rec.getSuggestedValue());
                    continue;
                }

                validRecs.add(RecommendationDTO.builder()
                        .field(normalizedField)
                        .priority(normalizePriority(rec.getPriority()))
                        .reason(rec.getReason().trim())
                        .suggestedValue(rec.getSuggestedValue())
                        .build());
            }
        }

        // Trier par priorité
        validRecs.sort(Comparator.comparingInt(this::priorityOrder));

        // Limiter à 3 recommandations
        if (validRecs.size() > 3) {
            validRecs = validRecs.subList(0, 3);
        }

        raw.setRecommendations(validRecs);

        // Si score >= 75, ne garder que les recommandations high priority
        if (raw.getScore() >= 75 && !validRecs.isEmpty()) {
            boolean hasHighPriority = validRecs.stream().anyMatch(r -> "high".equals(r.getPriority()));
            if (!hasHighPriority) {
                raw.setRecommendations(new ArrayList<>());
            }
        }

        return raw;
    }

    // ─────────────────────────────────────────────────────────────
    // FALLBACK - Règles métier
    // ─────────────────────────────────────────────────────────────

    private EventAnalysisResponseDTO buildFallback(EventAnalysisRequestDTO r) {
        int score = computeQuickScore(r);

        int minAttendance = Math.max(3, r.getMaxCapacity() / 10);
        int predictedAttendance = clamp(score * r.getMaxCapacity() / 100, minAttendance, r.getMaxCapacity());
        int predictedEngagement = clamp(3 + score / 14, 1, 10);

        List<RecommendationDTO> recommendations = new ArrayList<>();
        List<String> applied = r.getAppliedChanges() != null ? r.getAppliedChanges() : new ArrayList<>();

        // Recommandation: Titre
        if ((r.getTitle() == null || r.getTitle().length() < 20) && !alreadyApplied("title", null, applied)) {
            recommendations.add(createRecommendation("title", "high",
                    "Un titre plus spécifique avec le type d'animal augmente les clics de 40%.",
                    suggestTitle(r)));
        }

        // Recommandation: Description
        int descLen = r.getDescription() != null ? r.getDescription().length() : 0;
        if (descLen < 120 && !alreadyApplied("description", null, applied)) {
            recommendations.add(createRecommendation("description", "high",
                    "Les événements avec une description détaillée (120+ mots) reçoivent 3x plus d'inscriptions.",
                    suggestDescription(r)));
        }

        // Recommandation: Date
        boolean dateTooSoon = (r.getDate() == null || r.getDate().isBefore(LocalDateTime.now().plusDays(3)));
        if (dateTooSoon && !alreadyApplied("date", null, applied)) {
            recommendations.add(createRecommendation("date", "medium",
                    "Un délai d'au moins 7 jours améliore significativement les inscriptions.",
                    LocalDateTime.now().plusDays(14).truncatedTo(ChronoUnit.MINUTES).toString()));
        }

        // Recommandation: Lieu
        if ((r.getLocation() == null || r.getLocation().isBlank()) && !alreadyApplied("location", null, applied)) {
            recommendations.add(createRecommendation("location", "medium",
                    "Un lieu précis inspire confiance et réduit l'hésitation.",
                    "Lieu central adapté aux animaux"));
        }

        // Recommandation: Types d'animaux
        if ((r.getAnimalTypes() == null || r.getAnimalTypes().isEmpty()) && !alreadyApplied("animal_types", null, applied)) {
            recommendations.add(createRecommendation("animal_types", "low",
                    "Préciser votre audience cible améliore le positionnement.",
                    List.of("Chiens", "Chats")));
        }

        // Trier et limiter
        recommendations.sort(Comparator.comparingInt(this::priorityOrder));
        if (recommendations.size() > 3) {
            recommendations = recommendations.subList(0, 3);
        }

        String analysis = buildFallbackAnalysis(r);

        log.debug("📊 Fallback analysis: score={}, attendance={}, recommendations={}",
                score, predictedAttendance, recommendations.size());

        return EventAnalysisResponseDTO.builder()
                .score(score)
                .predictionAttendance(predictedAttendance)
                .predictionEngagement(predictedEngagement)
                .analysis(analysis)
                .recommendations(recommendations)
                .build();
    }

    private String buildFallbackAnalysis(EventAnalysisRequestDTO r) {
        List<String> strengths = new ArrayList<>();

        if (r.getTitle() != null && r.getTitle().length() >= 10) {
            strengths.add("titre clair");
        }
        if (r.getDescription() != null && r.getDescription().length() >= 80) {
            strengths.add("description détaillée");
        }
        if (r.getAnimalTypes() != null && !r.getAnimalTypes().isEmpty()) {
            strengths.add("audience ciblée");
        }
        if (r.getLocation() != null && !r.getLocation().isBlank()) {
            strengths.add("lieu défini");
        }
        if (r.getAppliedChanges() != null && !r.getAppliedChanges().isEmpty()) {
            strengths.add("améliorations appliquées");
        }

        if (strengths.isEmpty()) {
            return "Ajoutez plus de détails spécifiques pour augmenter la confiance dans la participation et le potentiel d'engagement.";
        }

        return "Points forts: " + String.join(", ", strengths) + ". Affinez les détails manquants pour maximiser les résultats.";
    }

    // ─────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────

    private int computeQuickScore(EventAnalysisRequestDTO r) {
        int score = 30;

        if (r.getTitle() != null && !r.getTitle().isBlank()) {
            score += 10;
            if (r.getTitle().length() >= 20) score += 6;
        }

        if (r.getDescription() != null) {
            if (r.getDescription().length() >= 80) score += 12;
            if (r.getDescription().length() >= 200) score += 5;
        }

        if (r.getLocation() != null && !r.getLocation().isBlank()) score += 8;

        if (r.getDate() != null && r.getDate().isAfter(LocalDateTime.now())) score += 8;
        if (r.getDate() != null && r.getDate().isAfter(LocalDateTime.now().plusDays(7))) score += 4;

        if (r.getPrice() != null) score += 4;

        if (r.getAnimalTypes() != null && !r.getAnimalTypes().isEmpty()) score += 6;

        if (r.getAppliedChanges() != null) {
            score += Math.min(r.getAppliedChanges().size() * 3, 9);
        }

        return clamp(score, 20, 95);
    }

    /**
     * ✅ Vérifie si un champ:valeur a déjà été appliqué
     * Format appliedChanges : ["price:80", "title:Mon Événement", "description"]
     */
    private boolean alreadyApplied(String field, Object suggestedValue, List<String> applied) {
        if (applied == null || applied.isEmpty() || field == null) {
            return false;
        }

        String normalizedField = normalizeField(field);
        if (normalizedField == null) {
            return false;
        }

        String suggestedValueStr = suggestedValue != null ? String.valueOf(suggestedValue).toLowerCase().trim() : null;

        for (String entry : applied) {
            if (entry == null || entry.isBlank()) continue;

            String[] parts = entry.split(":", 2);
            String entryField = parts[0].trim().toLowerCase();

            if (!entryField.equals(normalizedField)) continue;

            // Si pas de valeur dans l'entrée → le champ est marqué comme appliqué
            if (parts.length == 1) {
                return true;
            }

            // Comparer la valeur
            String entryValue = parts[1].trim().toLowerCase();

            // Si la valeur suggérée est null, on considère que c'est un match
            if (suggestedValueStr == null) {
                return true;
            }

            if (entryValue.equals(suggestedValueStr)) {
                return true;
            }
        }

        return false;
    }

    private String normalizeField(String field) {
        if (field == null) return null;

        return switch (field.trim().toLowerCase()) {
            case "title" -> "title";
            case "description" -> "description";
            case "date", "startdate", "event_date" -> "date";
            case "location", "venue" -> "location";
            case "price", "ticket_price" -> "price";
            case "animal_types", "animaltypes", "expected_animal_types", "expectedanimaltypes" -> "animal_types";
            case "max_capacity", "maxcapacity", "capacity" -> "max_capacity";
            default -> {
                log.warn("Champ de recommandation inconnu: '{}'", field);
                yield null;
            }
        };
    }

    private String normalizePriority(String priority) {
        if (priority == null) return "medium";
        return switch (priority.trim().toLowerCase()) {
            case "high" -> "high";
            case "low" -> "low";
            default -> "medium";
        };
    }

    private int priorityOrder(RecommendationDTO rec) {
        String priority = rec.getPriority();
        if (priority == null) return 1;
        return switch (priority) {
            case "high" -> 0;
            case "low" -> 2;
            default -> 1;
        };
    }

    private int priorityOrder(String priority) {
        if (priority == null) return 1;
        return switch (priority) {
            case "high" -> 0;
            case "low" -> 2;
            default -> 1;
        };
    }

    private RecommendationDTO createRecommendation(String field, String priority, String reason, Object suggestedValue) {
        return RecommendationDTO.builder()
                .field(field)
                .priority(priority)
                .reason(reason)
                .suggestedValue(suggestedValue)
                .build();
    }

    private String suggestTitle(EventAnalysisRequestDTO r) {
        String animalFocus = (r.getAnimalTypes() == null || r.getAnimalTypes().isEmpty())
                ? "Communauté Animalière"
                : r.getAnimalTypes().stream().limit(2).collect(Collectors.joining(" & "));

        if (r.getTitle() == null || r.getTitle().isBlank()) {
            return animalFocus + " - Journée d'Expérience";
        }
        return r.getTitle().trim() + " — Édition " + animalFocus;
    }

    private String suggestDescription(EventAnalysisRequestDTO r) {
        String location = (r.getLocation() == null || r.getLocation().isBlank())
                ? "un lieu accueillant"
                : r.getLocation();

        String audience = (r.getAnimalTypes() == null || r.getAnimalTypes().isEmpty())
                ? "les amoureux des animaux"
                : String.join(", ", r.getAnimalTypes());

        return "Rejoignez-nous à " + location + " pour un événement pratique conçu pour " + audience
                + ". Attendez-vous à des conseils d'experts, des moments sociaux et des activités mémorables "
                + "qui maintiennent l'engagement des participants du début à la fin.";
    }

    private EventAnalysisRequestDTO normalize(EventAnalysisRequestDTO request) {
        EventAnalysisRequestDTO normalized = new EventAnalysisRequestDTO();

        normalized.setTitle(safe(request != null ? request.getTitle() : null));
        normalized.setDescription(safe(request != null ? request.getDescription() : null));
        normalized.setDate(request != null ? request.getDate() : null);
        normalized.setLocation(safe(request != null ? request.getLocation() : null));
        normalized.setPrice(request != null ? request.getPrice() : null);

        // Animal types - dédoublonnage et nettoyage
        List<String> animalTypes = new ArrayList<>();
        if (request != null && request.getAnimalTypes() != null) {
            animalTypes = request.getAnimalTypes().stream()
                    .filter(s -> s != null && !s.isBlank())
                    .map(String::trim)
                    .distinct()
                    .collect(Collectors.toList());
        }
        normalized.setAnimalTypes(animalTypes);

        // Max capacity - minimum 1
        normalized.setMaxCapacity(request != null && request.getMaxCapacity() > 0 ? request.getMaxCapacity() : 10);

        normalized.setPreviousAnalysis(safe(request != null ? request.getPreviousAnalysis() : null));

        // Applied changes - nettoyage
        List<String> appliedChanges = new ArrayList<>();
        if (request != null && request.getAppliedChanges() != null) {
            appliedChanges = request.getAppliedChanges().stream()
                    .filter(s -> s != null && !s.isBlank())
                    .map(String::trim)
                    .collect(Collectors.toList());
        }
        normalized.setAppliedChanges(appliedChanges);

        return normalized;
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private String safeText(String value, String fallback) {
        if (value == null || value.isBlank()) return fallback;
        return value.trim();
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }
}
