package com.elif.entities.pet_transit;

import com.elif.entities.pet_transit.enums.FeedbackType;
import com.elif.entities.pet_transit.enums.ProcessingStatus;
import com.elif.entities.pet_transit.enums.UrgencyLevel;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "travel_feedback")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "travel_plan_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private TravelPlan travelPlan;

    @Enumerated(EnumType.STRING)
    @Column(name = "feedback_type", nullable = false, length = 20)
    private FeedbackType feedbackType;

    @Column(nullable = false)
    private Integer rating;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "user_comment", columnDefinition = "TEXT")
    private String userComment;

    @Column(name = "incident_reported", nullable = false)
    private Boolean incidentReported;

    @Column(name = "incident_location", length = 200)
    private String incidentLocation;

    @Column(name = "incident_latitude", precision = 10, scale = 7)
    private BigDecimal incidentLatitude;

    @Column(name = "incident_longitude", precision = 10, scale = 7)
    private BigDecimal incidentLongitude;

    @Column(name = "ai_sentiment_score", precision = 5, scale = 2)
    private BigDecimal aiSentimentScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "urgency_level", nullable = false, length = 10)
    private UrgencyLevel urgencyLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "processing_status", nullable = false, length = 20)
    private ProcessingStatus processingStatus;

    @Column(name = "admin_response", columnDefinition = "TEXT")
    private String adminResponse;

    @Column(name = "responded_by_admin_id")
    private Long respondedByAdminId;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
