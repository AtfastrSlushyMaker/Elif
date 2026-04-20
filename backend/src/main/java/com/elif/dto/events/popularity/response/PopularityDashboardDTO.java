package com.elif.dto.events.popularity.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public record PopularityDashboardDTO(
        List<PopularEventDTO> topEvents,
        List<PopularEventDTO> neglectedEvents,
        Map<String, Long> interactionsByType,
        long totalViewsToday,
        long totalInteractionsThisWeek,
        double averageConversionRate,
        PopularityPeriod period
) {
    public record PopularityPeriod(
            LocalDateTime from,
            LocalDateTime to,
            String label
    ) {}
}