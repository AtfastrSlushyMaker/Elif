package com.elif.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
@ConfigurationProperties(prefix = "ai.gemini")
@Data
public class AiGeminiConfig {

    private static final Logger log = LoggerFactory.getLogger(AiGeminiConfig.class);

    private String apiKey;
    private String model = "gemini-2.0-flash";
    private String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models";
    private Integer maxTokens = 1024;
    private Double temperature = 0.7;

    @PostConstruct
    public void init() {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("⚠️ GEMINI_API_KEY is not set! AI features will not work.");
            log.warn("   Please set environment variable: GEMINI_API_KEY=your-key");
        } else {
            log.info("✅ GEMINI_API_KEY loaded (first {} chars...)",
                    apiKey.substring(0, Math.min(8, apiKey.length())));
        }
    }
}