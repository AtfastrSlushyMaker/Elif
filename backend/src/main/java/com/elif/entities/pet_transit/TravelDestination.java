package com.elif.entities.pet_transit;

import com.elif.entities.pet_transit.enums.DestinationStatus;
import com.elif.entities.pet_transit.enums.DestinationType;
import com.elif.entities.pet_transit.enums.DocumentType;
import com.elif.entities.pet_transit.enums.TransportType;
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
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "travel_destination")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelDestination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 100)
    private String country;

    @Column(length = 100)
    private String region;

    @Enumerated(EnumType.STRING)
    @Column(name = "destination_type", nullable = false, length = 30)
    private DestinationType destinationType;

    @Enumerated(EnumType.STRING)
    @Column(name = "recommended_transport_type", nullable = false, length = 20)
    private TransportType recommendedTransportType;

    @Column(name = "pet_friendly_level")
    private Integer petFriendlyLevel;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "safety_tips", columnDefinition = "TEXT")
    private String safetyTips;

    @ElementCollection(targetClass = DocumentType.class)
    @CollectionTable(name = "travel_destination_required_document", joinColumns = @JoinColumn(name = "travel_destination_id"))
    @Column(name = "document_type", nullable = false, length = 40)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private List<DocumentType> requiredDocuments = new ArrayList<>();

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DestinationStatus status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "destination", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<TravelPlan> travelPlans = new ArrayList<>();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
