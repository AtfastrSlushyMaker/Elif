package com.elif.services.events.implementations;

import com.elif.config.AiGeminiConfig;
import com.elif.dto.events.request.AiGenerationRequest;
import com.elif.dto.events.response.AiGenerationResponse;
import com.elif.dto.events.response.AiStreamChunkDto;
import com.elif.services.events.interfaces.IAiDescriptionService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import reactor.core.publisher.Flux;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * ✅ VERSION CORRIGÉE
 *
 * CHANGEMENTS :
 *  1. WebClient → RestTemplate  : résout le "Connection reset" sur environnements
 *     de dev avec proxy/firewall qui bloquent Reactor Netty
 *  2. Retry avec backoff sur 429 : gère le rate limit Gemini free tier
 *  3. Meilleure gestion d'erreur avec messages clairs pour le frontend
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiDescriptionServiceImpl implements IAiDescriptionService {

    private final AiGeminiConfig geminiConfig;
    private final ObjectMapper   objectMapper;
    private final RestTemplate   restTemplate; // ✅ RestTemplate au lieu de WebClient

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy", Locale.ENGLISH);

    // ─────────────────────────────────────────────────────────────
    // Stream (utilisé par le composant Angular pour l'effet live)
    // ─────────────────────────────────────────────────────────────

    @Override
    public Flux<AiStreamChunkDto> generateDescriptionStream(AiGenerationRequest request) {
        // ✅ On appelle la version sync et on émet token par token
        // pour simuler le streaming côté Angular
        return Flux.create(sink -> {
            try {
                AiGenerationResponse result = generateDescriptionSync(request);

                if (result.getText() == null || result.getText().isBlank()) {
                    sink.next(new AiStreamChunkDto("error", "No content generated. Check your API key."));
                    sink.complete();
                    return;
                }

                // Émettre token par token (simulation streaming)
                String[] words = result.getText().split("(?<=\\s)|(?=\\s)");
                for (String word : words) {
                    if (!word.isEmpty()) {
                        sink.next(new AiStreamChunkDto("token", word));
                    }
                }
                sink.next(new AiStreamChunkDto("done", ""));
                sink.complete();

            } catch (Exception e) {
                log.error("Stream error: {}", e.getMessage());
                sink.next(new AiStreamChunkDto("error", buildUserFriendlyError(e.getMessage())));
                sink.complete();
            }
        });
    }

    // ─────────────────────────────────────────────────────────────
    // Sync — appel REST standard avec RestTemplate
    // ─────────────────────────────────────────────────────────────

    @Override
    public AiGenerationResponse generateDescriptionSync(AiGenerationRequest request) {
        long start = System.currentTimeMillis();

        String text = callGeminiWithRetry(request, 2);

        long elapsed = System.currentTimeMillis() - start;
        return AiGenerationResponse.builder()
                .text(text)
                .wordCount(text.isBlank() ? 0 : text.split("\\s+").length)
                .charCount(text.length())
                .elapsedSeconds(elapsed / 1000.0)
                .tone(request.getTone())
                .language(request.getLanguage())
                .generatedAt(LocalDateTime.now())
                .build();
    }

    // ─────────────────────────────────────────────────────────────
    // Appel Gemini avec retry sur 429
    // ─────────────────────────────────────────────────────────────

    private String callGeminiWithRetry(AiGenerationRequest request, int maxRetries) {
        // ✅ URL sans "alt=sse" pour un appel REST classique
        String url = geminiConfig.getApiUrl() + "/" + geminiConfig.getModel()
                + ":generateContent?key=" + geminiConfig.getApiKey();

        String prompt = buildPrompt(request);

        Map<String, Object> body = Map.of(
                "contents", new Object[]{
                        Map.of("parts", new Object[]{Map.of("text", prompt)})
                },
                "generationConfig", Map.of(
                        "temperature",      geminiConfig.getTemperature(),
                        "maxOutputTokens",  geminiConfig.getMaxTokens()
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        for (int attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                log.info("📝 Calling Gemini API for event: '{}' (attempt {}/{})",
                        request.getTitle(), attempt + 1, maxRetries + 1);

                ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

                if (!response.getStatusCode().is2xxSuccessful()) {
                    throw new RuntimeException("Gemini returned: " + response.getStatusCode());
                }

                JsonNode root = objectMapper.readTree(response.getBody());

                // Vérifier erreur dans le JSON
                if (root.has("error")) {
                    String code = root.path("error").path("code").asText();
                    String msg  = root.path("error").path("message").asText();

                    if ("429".equals(code) && attempt < maxRetries) {
                        int waitSec = (attempt + 1) * 10; // 10s, 20s
                        log.warn("⏳ Gemini rate limit (429). Waiting {}s before retry...", waitSec);
                        Thread.sleep(waitSec * 1000L);
                        continue;
                    }
                    throw new RuntimeException("Gemini API error: " + msg);
                }

                // Extraire le texte généré
                String text = root.path("candidates")
                        .path(0).path("content").path("parts").path(0).path("text").asText("");

                if (text.isBlank()) {
                    throw new RuntimeException("Gemini returned empty content.");
                }

                log.info("✅ Gemini generated {} chars for '{}'", text.length(), request.getTitle());
                return text.trim();

            } catch (RuntimeException e) {
                if (attempt == maxRetries) throw e;
                log.warn("Attempt {} failed: {}. Retrying...", attempt + 1, e.getMessage());
                try { Thread.sleep(3000); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
            } catch (Exception e) {
                throw new RuntimeException("Gemini call failed: " + e.getMessage(), e);
            }
        }
        throw new RuntimeException("Gemini failed after " + maxRetries + " retries.");
    }

    // ─────────────────────────────────────────────────────────────
    // Prompt builder
    // ─────────────────────────────────────────────────────────────

    private String buildPrompt(AiGenerationRequest request) {
        String lang          = "en".equals(request.getLanguage()) ? "English" : "French";
        String toneGuide     = getToneInstructions(request.getTone());
        String dateText      = formatDate(request.getStartDate());
        String durationText  = computeDuration(request.getStartDate(), request.getEndDate());
        String rulesSection  = buildRulesSection(request.getRules());
        String eventType     = getEventType(request);
        String locationText  = getLocationText(request);

        return """
            You are a professional event copywriter for a pet events platform.
            
            TASK: Write a compelling event description in %s.
            
            TONE:
            %s
            
            EVENT DETAILS:
            Title       : %s
            Category    : %s %s
            Type        : %s
            Location    : %s
            Date        : %s
            Duration    : %s
            Capacity    : %d participants
            
            %s
            
            REQUIREMENTS:
            • Write exactly 3 paragraphs, separated by blank lines
            • Paragraph 1 (Hook): 2-3 sentences that grab attention
            • Paragraph 2 (Experience): 2-3 sentences about the event experience
            • Paragraph 3 (CTA): 2 sentences to encourage registration
            • No markdown, no bullet points, no titles
            • Output ONLY the 3 paragraphs, nothing else
            """.formatted(
                lang, toneGuide,
                request.getTitle(),
                request.getCategoryIcon(), request.getCategoryName(),
                eventType, locationText, dateText, durationText,
                request.getMaxParticipants() != null ? request.getMaxParticipants() : 0,
                rulesSection);
    }

    private String getToneInstructions(String tone) {
        return switch (tone != null ? tone : "professional") {
            case "friendly"  -> "Warm, conversational, inclusive voice. Use contractions. Max 1 exclamation mark.";
            case "exciting"  -> "High-energy, competitive, motivational. Short punchy sentences mixed with longer builds.";
            default          -> "Professional, authoritative, precise. No contractions. No exclamation marks.";
        };
    }

    private String getEventType(AiGenerationRequest request) {
        if (Boolean.TRUE.equals(request.getIsCompetition()))
            return Boolean.TRUE.equals(request.getRequiresApproval()) ? "Competition with jury approval" : "Competition";
        return "General pet event";
    }

    private String getLocationText(AiGenerationRequest request) {
        if (Boolean.TRUE.equals(request.getIsOnline())) return "Online – Virtual session";
        return request.getLocation() != null ? request.getLocation() : "Location TBD";
    }

    private String formatDate(LocalDateTime date) {
        if (date == null) return "Date TBD";
        try { return DATE_FMT.format(date); } catch (Exception e) { return "Date TBD"; }
    }

    private String computeDuration(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) return "TBD";
        long minutes = ChronoUnit.MINUTES.between(start, end);
        if (minutes <= 0) return "TBD";
        long h = minutes / 60, m = minutes % 60;
        if (h == 0) return m + " minutes";
        return m == 0 ? h + " hour" + (h > 1 ? "s" : "") : h + "h " + m + "min";
    }

    private String buildRulesSection(List<AiGenerationRequest.RuleSummary> rules) {
        if (rules == null || rules.isEmpty()) return "No specific eligibility requirements.";
        StringBuilder sb = new StringBuilder("ELIGIBILITY RULES:\n");
        rules.stream().filter(r -> Boolean.TRUE.equals(r.getIsHard()))
                .forEach(r -> sb.append("• ").append(r.getLabel()).append(": ").append(r.getValue()).append("\n"));
        rules.stream().filter(r -> !Boolean.TRUE.equals(r.getIsHard()))
                .forEach(r -> sb.append("• [advisory] ").append(r.getLabel()).append(": ").append(r.getValue()).append("\n"));
        return sb.toString();
    }

    private String buildUserFriendlyError(String raw) {
        if (raw == null) return "Unknown error.";
        if (raw.contains("429") || raw.contains("RESOURCE_EXHAUSTED"))
            return "Rate limit reached (free tier: 15 req/min). Please wait a moment and retry.";
        if (raw.contains("Connection reset") || raw.contains("SocketException"))
            return "Network connection error. Check your internet connection and API key.";
        if (raw.contains("API_KEY_INVALID") || raw.contains("401"))
            return "Invalid Gemini API key. Please check your configuration.";
        return "Generation failed: " + raw;
    }
}