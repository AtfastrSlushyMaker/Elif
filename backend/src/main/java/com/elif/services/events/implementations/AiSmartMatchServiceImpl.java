package com.elif.services.events.implementations;

import com.elif.config.AiGeminiConfig;
import com.elif.dto.events.request.SmartMatchRequest;
import com.elif.dto.events.response.AiStreamChunkDto;
import com.elif.entities.events.EventStatus;
import com.elif.repositories.events.EventRepository;
import com.elif.services.events.interfaces.IAiSmartMatchService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import reactor.core.publisher.Flux;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ════════════════════════════════════════════════════════════════
 *  AiSmartMatchServiceImpl — VERSION CORRIGÉE
 *
 *  BUGS CORRIGÉS :
 *  1. Le chunk "done" était envoyé avec content="" → Angular
 *     ne pouvait pas parser le JSON → panelState restait "streaming"
 *     → RIEN ne s'affichait.
 *     FIX : Le JSON complet est maintenant envoyé dans le chunk "done".
 *
 *  2. GROQ n'est pas configuré → on utilise Gemini (déjà configuré !)
 *     au lieu du mock statique, pour un vrai résultat IA.
 *
 *  3. Le JSON mock avait des eventIds hardcodés (45, 42) qui
 *     n'existent pas en base → matches enrichis à []
 *     FIX : on charge les vrais eventIds de la base.
 * ════════════════════════════════════════════════════════════════
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiSmartMatchServiceImpl implements IAiSmartMatchService {

    private final EventRepository  eventRepository;
    private final ObjectMapper     objectMapper;
    private final AiGeminiConfig   geminiConfig;  // ✅ Utilise Gemini (déjà configuré)
    private final RestTemplate     restTemplate;

    @Override
    public Flux<AiStreamChunkDto> streamSmartMatch(SmartMatchRequest request) {
        List<Map<String, Object>> eventsContext = buildEventsContext(request);

        if (eventsContext.isEmpty()) {
            String noEvent = toJson(Map.of(
                    "summary", "No active events found for your search.",
                    "matches", List.of()
            ));
            // ✅ FIX BUG 1 : Le JSON va dans le chunk "done", pas dans "token"
            return Flux.just(new AiStreamChunkDto("done", noEvent));
        }

        log.info("🤖 AI Smart Match — query='{}', events={}",
                request.getQuery(), eventsContext.size());

        try {
            String resultJson = callGemini(request.getQuery(), eventsContext);
            // ✅ FIX BUG 1 : JSON complet dans "done", streamBuffer dans "token"
            return Flux.just(
                    new AiStreamChunkDto("token", "🤖 Analyzing your request..."),
                    new AiStreamChunkDto("done", resultJson)
            );
        } catch (Exception e) {
            log.error("Smart match error: {}", e.getMessage());
            // Fallback gracieux avec les vrais events
            String fallbackJson = buildFallbackJson(eventsContext, request.getQuery());
            return Flux.just(
                    new AiStreamChunkDto("token", "Using smart ranking..."),
                    new AiStreamChunkDto("done", fallbackJson)
            );
        }
    }

    // ── Appel Gemini ──────────────────────────────────────────────

    private String callGemini(String query, List<Map<String, Object>> events) throws Exception {
        String url = geminiConfig.getApiUrl() + "/" + geminiConfig.getModel()
                + ":generateContent?key=" + geminiConfig.getApiKey();

        String prompt = buildPrompt(query, events);

        Map<String, Object> body = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{Map.of("text", prompt)})
                },
                "generationConfig", Map.of(
                        "temperature",     0.4,  // Plus déterministe pour du JSON
                        "maxOutputTokens", 1024
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        ResponseEntity<String> response = restTemplate.postForEntity(
                url, new HttpEntity<>(body, headers), String.class);

        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Gemini error: " + response.getStatusCode());
        }

        var root    = objectMapper.readTree(response.getBody());
        String text = root.path("candidates").path(0)
                .path("content").path("parts").path(0)
                .path("text").asText("");

        if (text.isBlank()) throw new RuntimeException("Empty Gemini response");

        // Nettoyer les ```json ... ``` éventuels
        text = text.trim()
                .replaceAll("(?s)```json\\s*", "")
                .replaceAll("```", "")
                .trim();

        // Valider que c'est du JSON valide
        objectMapper.readTree(text);
        log.info("✅ Gemini smart match OK — {} chars", text.length());
        return text;
    }

    // ── Prompt ────────────────────────────────────────────────────

    private String buildPrompt(String query, List<Map<String, Object>> events) {
        String eventsJson = toJson(events);
        return """
            You are an expert pet event matchmaker for the ELIF platform.
            
            USER REQUEST: "%s"
            
            AVAILABLE EVENTS (JSON):
            %s
            
            Analyze the user's request and rank the events by relevance. Return ONLY valid JSON:
            {
              "summary": "One sentence in the user's language describing the best matches",
              "matches": [
                {
                  "eventId": <id from events list>,
                  "score": <integer 0-100>,
                  "label": "<perfect|great|good|maybe>",
                  "reason": "2 sentences explaining why this event fits the user's pet/needs",
                  "eligible": <true|false based on competition/requirements>,
                  "eligibilityNote": "Brief note if not eligible or any attention needed"
                }
              ]
            }
            
            RULES:
            - label: perfect=85-100, great=70-84, good=50-69, maybe=0-49
            - Return maximum 5 matches, ordered by score descending
            - Only include events with score >= 40
            - Use the EXACT eventId from the list provided
            - If no events match well, return {"summary":"...", "matches":[], "noMatchReason":"..."}
            - Respond ONLY with JSON, no markdown, no explanation
            """.formatted(query, eventsJson);
    }

    // ── Context builder ───────────────────────────────────────────

    private List<Map<String, Object>> buildEventsContext(SmartMatchRequest request) {
        int limit = Math.min(request.getMaxEvents(), 20);

        return eventRepository.findAll(PageRequest.of(0, limit * 2))
                .getContent()
                .stream()
                .filter(e -> e.getStatus() == EventStatus.PLANNED
                        || e.getStatus() == EventStatus.FULL)
                .filter(e -> e.getStartDate().isAfter(LocalDateTime.now()))
                .filter(e -> request.getCategoryId() == null
                        || (e.getCategory() != null
                        && e.getCategory().getId().equals(request.getCategoryId())))
                .limit(limit)
                .map(e -> {
                    Map<String, Object> ctx = new LinkedHashMap<>();
                    ctx.put("id",            e.getId());
                    ctx.put("title",         e.getTitle());
                    ctx.put("category",      e.getCategory() != null
                            ? e.getCategory().getName() : "General");
                    ctx.put("isCompetition", e.getCategory() != null
                            && Boolean.TRUE.equals(e.getCategory().getCompetitionMode()));
                    ctx.put("location",      e.getLocation());
                    ctx.put("date",          e.getStartDate().toString());
                    ctx.put("slotsLeft",     e.getRemainingSlots());
                    ctx.put("description",   e.getDescription() != null
                            ? e.getDescription().substring(0,
                            Math.min(100, e.getDescription().length()))
                            : "");
                    return ctx;
                })
                .collect(Collectors.toList());
    }

    // ── Fallback (si Gemini échoue) ───────────────────────────────

    /**
     * Fallback intelligent : classe les events par pertinence basique
     * (matching mots-clés de la query avec le titre/catégorie)
     * pour toujours afficher quelque chose même sans IA.
     */
    private String buildFallbackJson(List<Map<String, Object>> events, String query) {
        String queryLower = query.toLowerCase();

        List<Map<String, Object>> matches = events.stream()
                .map(e -> {
                    String title    = String.valueOf(e.get("title")).toLowerCase();
                    String category = String.valueOf(e.get("category")).toLowerCase();
                    boolean isComp  = Boolean.TRUE.equals(e.get("isCompetition"));

                    int score = 50; // base
                    if (title.contains("agility") || queryLower.contains("agility"))   score += 20;
                    if (title.contains("competition") || queryLower.contains("competition")) score += 15;
                    if (queryLower.contains(category))  score += 25;
                    if (isComp && queryLower.contains("competition")) score += 10;

                    score = Math.min(score, 95);

                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("eventId", e.get("id"));
                    m.put("score",   score);
                    m.put("label",   score >= 85 ? "perfect" : score >= 70 ? "great" : "good");
                    m.put("reason",  "This event matches your search criteria based on category and type.");
                    m.put("eligible", true);
                    return m;
                })
                .sorted((a, b) -> Integer.compare((int)b.get("score"), (int)a.get("score")))
                .limit(4)
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("summary", "Here are the best available events for your search.");
        result.put("matches", matches);
        return toJson(result);
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }
}