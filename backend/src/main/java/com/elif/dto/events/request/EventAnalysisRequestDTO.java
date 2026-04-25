package com.elif.dto.events.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * DTO unique — supprime EventIntelligenceRequest (doublon)
 */
@Data
public class EventAnalysisRequestDTO {
    private String        title;
    private String        description;
    private LocalDateTime date;
    private String        location;
    private BigDecimal    price;

    /** Types d'animaux ciblés (ex: ["Dogs","Cats"]) */
    private List<String>  animalTypes    = new ArrayList<>();

    private int           maxCapacity;

    /** Résultat de l'analyse précédente (pour éviter de répéter les mêmes conseils) */
    private String        previousAnalysis;

    /** Corrections déjà appliquées par l'admin (ex: ["title","description"]) */
    private List<String>  appliedChanges = new ArrayList<>();
}