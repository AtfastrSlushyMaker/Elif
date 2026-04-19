package com.elif.dto.events.popularity.response;

public record EventPopularityDetailDTO(
        Long eventId,
        String title,
        long totalViews,
        long uniqueViews,
        long searchClicks,
        long detailOpens,
        long waitlistJoins,
        long registrations,
        long reviewsPosted,
        double conversionRate,
        long popularityScore,
        String trend
) {}