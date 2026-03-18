package com.elif.entities.pet_transit;

import com.elif.entities.pet_transit.enums.CurrencyCode;
import com.elif.entities.pet_transit.enums.SafetyStatus;
import com.elif.entities.pet_transit.enums.TransportType;
import com.elif.entities.pet_transit.enums.TravelPlanStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "travel_plan")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(name = "pet_id", nullable = false)
    private Long petId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private TravelDestination destination;

    @Column(nullable = false, length = 150)
    private String origin;

    @Column(name = "destination_label", nullable = false, length = 150)
    private String destinationLabel;

    @Enumerated(EnumType.STRING)
    @Column(name = "transport_type", nullable = false, length = 20)
    private TransportType transportType;

    @Column(name = "travel_date", nullable = false)
    private LocalDate travelDate;

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Column(name = "estimated_travel_hours")
    private Integer estimatedTravelHours;

    @Column(name = "estimated_travel_cost", precision = 12, scale = 2)
    private BigDecimal estimatedTravelCost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private CurrencyCode currency;

    @Column(name = "animal_weight", precision = 8, scale = 2)
    private BigDecimal animalWeight;

    @Column(name = "cage_length", precision = 8, scale = 2)
    private BigDecimal cageLength;

    @Column(name = "cage_width", precision = 8, scale = 2)
    private BigDecimal cageWidth;

    @Column(name = "cage_height", precision = 8, scale = 2)
    private BigDecimal cageHeight;

    @Column(name = "hydration_frequency")
    private Integer hydrationFrequency;

    @Column(name = "required_stops")
    private Integer requiredStops;

    @Enumerated(EnumType.STRING)
    @Column(name = "safety_status", nullable = false, length = 20)
    private SafetyStatus safetyStatus;

    @Column(name = "readiness_score", precision = 5, scale = 2)
    private BigDecimal readinessScore;

    @Column(name = "admin_decision_comment", columnDefinition = "TEXT")
    private String adminDecisionComment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private TravelPlanStatus status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "travelPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<TravelDocument> travelDocuments = new ArrayList<>();

    @OneToMany(mappedBy = "travelPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<SafetyChecklist> safetyChecklists = new ArrayList<>();

    @OneToMany(mappedBy = "travelPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<TravelFeedback> travelFeedbacks = new ArrayList<>();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
