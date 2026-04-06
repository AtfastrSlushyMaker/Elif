package com.elif.services.events.implementations;

import com.elif.dto.events.response.WeatherResponse;
import com.elif.entities.events.Event;
import com.elif.exceptions.events.EventExceptions;
import com.elif.repositories.events.EventRepository;
import com.elif.services.events.interfaces.IWeatherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Service météo utilisant l'API OpenWeatherMap.
 * ✅ CORRECTIONS :
 *  - Utilise le cache Spring (@Cacheable "weather") au lieu d'un Map manuel
 *  - Implémente l'interface IWeatherService
 *  - Exceptions typées au lieu de RuntimeException brutes
 *  - Extraction de ville robuste
 *  - Éviction automatique du cache toutes les heures
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WeatherService implements IWeatherService {

    @Value("${weather.api.key:}")
    private String apiKey;

    @Value("${weather.api.url:https://api.openweathermap.org/data/2.5}")
    private String apiUrl;

    private final EventRepository eventRepository;
    private final RestTemplate    restTemplate = new RestTemplate();

    // ─── Par événement ────────────────────────────────────────────────

    @Override
    public WeatherResponse getWeatherForEvent(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new EventExceptions.EventNotFoundException(eventId));
        String city = extractCity(event.getLocation());
        return getWeatherByCity(city, event.getStartDate());
    }

    // ─── Par ville ────────────────────────────────────────────────────

    /**
     * ✅ Cache Spring : les résultats sont mis en cache 1h par ville.
     * La clé est normalisée en minuscules pour éviter les doublons "Tunis"/"tunis".
     */
    @Override
    @Cacheable(value = "weather", key = "#city.toLowerCase()")
    public WeatherResponse getWeatherByCity(String city, LocalDateTime eventDate) {
        if (hasValidApiKey()) {
            try {
                WeatherResponse data = fetchFromApi(city, eventDate);
                log.debug("🌤️ Météo récupérée depuis l'API pour : {}", city);
                return data;
            } catch (RestClientException e) {
                log.warn("⚠️ API météo indisponible pour '{}' : {}. Données mock retournées.",
                        city, e.getMessage());
            }
        }
        return buildMockWeather(city);
    }

    // ─── Éviction du cache toutes les heures ─────────────────────────

    @Scheduled(cron = "0 0 * * * *")
    @CacheEvict(value = "weather", allEntries = true)
    public void evictWeatherCache() {
        log.debug("🔄 Cache météo vidé");
    }

    // ─── Appel API ────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private WeatherResponse fetchFromApi(String city, LocalDateTime eventDate) {
        String url = apiUrl + "/weather?q=" + city
                + "&appid=" + apiKey + "&units=metric&lang=fr";

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        if (response == null) throw new RestClientException("Réponse API vide pour : " + city);

        Map<String, Object>       main    = (Map<String, Object>) response.get("main");
        Map<String, Object>       wind    = (Map<String, Object>) response.get("wind");
        List<Map<String, Object>> weather = (List<Map<String, Object>>) response.get("weather");

        if (main == null || wind == null || weather == null || weather.isEmpty()) {
            throw new RestClientException("Structure API météo inattendue pour : " + city);
        }

        double temp     = ((Number) main.get("temp")).doubleValue();
        int    humidity = ((Number) main.get("humidity")).intValue();
        double windSpd  = ((Number) wind.get("speed")).doubleValue() * 3.6; // m/s → km/h
        String desc     = (String) weather.get(0).get("description");
        String icon     = (String) weather.get(0).get("icon");
        String cond     = mapCondition((String) weather.get(0).get("main"));

        boolean isEventDay = eventDate.toLocalDate().equals(LocalDateTime.now().toLocalDate());

        return WeatherResponse.builder()
                .temperature(Math.round(temp * 10.0) / 10.0)
                .description(desc)
                .icon(icon)
                .humidity(humidity)
                .windSpeed(Math.round(windSpd * 10.0) / 10.0)
                .condition(cond)
                .recommendation(buildRecommendation(cond, windSpd, temp))
                .recommendationMsg(buildRecommendationMsg(cond, windSpd, temp))
                .eventDay(isEventDay)
                .city(city)
                .build();
    }

    // ─── Logique INDOOR / OUTDOOR ──────────────────────────────────────

    private String mapCondition(String main) {
        if (main == null) return "UNKNOWN";
        return switch (main.toUpperCase()) {
            case "CLEAR"              -> "SUNNY";
            case "CLOUDS"             -> "CLOUDY";
            case "RAIN", "DRIZZLE"    -> "RAINY";
            case "THUNDERSTORM"       -> "STORMY";
            case "SNOW"               -> "SNOWY";
            default                   -> "CLOUDY";
        };
    }

    private String buildRecommendation(String condition, double windKmh, double temp) {
        return switch (condition) {
            case "RAINY", "STORMY", "SNOWY" -> "INDOOR";
            case "SUNNY", "CLOUDY" -> (windKmh > 50 || temp < 5 || temp > 38) ? "INDOOR" : "OUTDOOR";
            default -> "OUTDOOR";
        };
    }

    private String buildRecommendationMsg(String condition, double windKmh, double temp) {
        return switch (condition) {
            case "RAINY"  -> "🌧️ Pluie prévue — préférez un lieu couvert ou prévoyez des tentes.";
            case "STORMY" -> "⛈️ Orage prévu — événement en intérieur fortement recommandé.";
            case "SNOWY"  -> "❄️ Neige prévue — événement en intérieur recommandé.";
            case "SUNNY"  -> temp > 35
                    ? "☀️ Forte chaleur — prévoyez de l'ombre et de l'eau. Intérieur climatisé conseillé."
                    : "☀️ Beau temps — conditions idéales pour un événement en extérieur !";
            case "CLOUDY" -> windKmh > 50
                    ? "💨 Vents forts — préférez un lieu abrité."
                    : "⛅ Temps nuageux — l'extérieur est envisageable avec des abris de secours.";
            default -> "🌤️ Vérifiez la météo locale avant l'événement.";
        };
    }

    // ─── Données mock ─────────────────────────────────────────────────

    private WeatherResponse buildMockWeather(String city) {
        log.debug("🔧 Météo mock retournée pour : {} (aucune clé API configurée)", city);
        return WeatherResponse.builder()
                .temperature(22.0)
                .description("Données de démonstration (configurez weather.api.key dans application.properties)")
                .icon("01d")
                .humidity(60)
                .windSpeed(15.0)
                .condition("SUNNY")
                .recommendation("OUTDOOR")
                .recommendationMsg("☀️ Beau temps prévu — conditions idéales pour un événement en extérieur !")
                .eventDay(false)
                .city(city)
                .build();
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    private boolean hasValidApiKey() {
        return apiKey != null && !apiKey.isBlank()
                && !apiKey.equals("YOUR_API_KEY_HERE")
                && !apiKey.equals("${weather.api.key}");
    }

    /**
     * Extrait la ville depuis une adresse complète.
     * "Parc El Mourouj, Tunis, Tunisie" → "Tunis"
     * "Ariana" → "Ariana"
     * null → "Tunis" (défaut)
     */
    private String extractCity(String location) {
        if (location == null || location.isBlank()) return "Tunis";
        String[] parts = location.split(",");
        // Prend l'avant-dernier s'il y a 3+ parties, sinon le dernier
        int idx = parts.length >= 3 ? parts.length - 2 : parts.length - 1;
        return parts[idx].trim();
    }
}
