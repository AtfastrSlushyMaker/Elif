package com.elif.entities.events;

import com.elif.entities.user.User;
import com.elif.entities.events.EventStatus;
import com.elif.entities.events.ParticipantStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "event")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"participants", "reviews"})
@EqualsAndHashCode(exclude = {"participants", "reviews"})
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 200)
    private String location;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    // Capacité totale de l'événement
    @Column(nullable = false)
    private Integer maxParticipants;

    // Places restantes — décrémentées à chaque inscription
    @Column(nullable = false)
    private Integer remainingSlots;

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private EventStatus status = EventStatus.PLANNED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private EventCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL,
            fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    private List<EventParticipant> participants = new ArrayList<>();

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL,
            fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    private List<EventReview> reviews = new ArrayList<>();
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL,
            fetch = FetchType.LAZY, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    private List<EventEligibilityRule> eligibilityRules = new ArrayList<>();
    @Builder.Default
    @Column(name = "is_online", nullable = false)
    private Boolean isOnline = false;

    /**
     * Lien vers la salle virtuelle (null si isOnline=false ou non encore créée).
     */
    @OneToOne(mappedBy = "event", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private EventVirtualSession virtualSession;
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        // remainingSlots = maxParticipants à la création
        if (this.remainingSlots == null) {
            this.remainingSlots = this.maxParticipants;
        }
    }

    // --- Méthodes métier ---

    public boolean isFull() {
        return this.remainingSlots != null && this.remainingSlots <= 0;
    }

    public boolean isJoinable() {
        return this.status == EventStatus.PLANNED && !isFull();
    }

    /**
     * Décrémente les places restantes du nombre demandé.
     * Met le statut à FULL si plus de places.
     */
    public void decrementSlots(int count) {
        if (this.remainingSlots < count) {
            throw new IllegalStateException("Pas assez de places disponibles.");
        }
        this.remainingSlots -= count;
        if (this.remainingSlots == 0) {
            this.status = EventStatus.FULL;
        }
    }

    /**
     * Libère des places (lors d'une désinscription).
     * Repasse le statut à PLANNED si l'événement était FULL.
     */
    public void releaseSlots(int count) {
        this.remainingSlots += count;
        if (this.status == EventStatus.FULL && this.remainingSlots > 0) {
            this.status = EventStatus.PLANNED;
        }
    }

    public double getAverageRating() {
        if (reviews == null || reviews.isEmpty()) return 0.0;
        return reviews.stream()
                .mapToInt(EventReview::getRating)
                .average()
                .orElse(0.0);
    }
}
