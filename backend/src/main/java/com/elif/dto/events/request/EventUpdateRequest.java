package com.elif.dto.events.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventUpdateRequest {

    @Size(min = 3, max = 150)
    private String title;

    @Size(max = 5000)
    private String description;

    @Size(max = 200)
    private String location;

    @Future(message = "La date de début doit être dans le futur")
    private LocalDateTime startDate;

    @Future(message = "La date de fin doit être dans le futur")
    private LocalDateTime endDate;

    @Min(value = 1)
    @Max(value = 10000)
    private Integer maxParticipants;

    private Long categoryId;


    private String coverImageUrl;
}