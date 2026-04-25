package com.elif.dto.events.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class EventIntelligenceRequest {
    private String title;
    private String description;
    private LocalDateTime date;
    private String location;
    private BigDecimal price;
    private List<String> expectedAnimalTypes;
}
