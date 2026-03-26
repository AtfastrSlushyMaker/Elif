package com.elif.dto.events.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventCategoryResponse {
    private Long id;
    private String name;
    private String description;
}