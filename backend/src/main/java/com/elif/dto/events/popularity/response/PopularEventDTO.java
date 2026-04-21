package com.elif.dto.events.popularity.response;

import java.time.LocalDateTime;

public record PopularEventDTO(
        Long eventId,
        String title,
        String categoryName,
        String categoryIcon,
        LocalDateTime startDate,
        String location,
        long popularityScore,
        long uniqueViews,
        long totalInteractions,
        double conversionRate,
        int remainingSlots
) {}