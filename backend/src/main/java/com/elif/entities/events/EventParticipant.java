package com.elif.entities.events;

import com.elif.entities.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "event_participant",
        uniqueConstraints = {
                // Un utilisateur ne peut pas s'inscrire deux fois au même événement
                @UniqueConstraint(columnNames = {"event_id", "user_id"})
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"event", "user"})
@EqualsAndHashCode(exclude = {"event", "user"})
public class EventParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Nombre de places réservées par cet utilisateur pour cet événement
    @Column(nullable = false)
    @Builder.Default
    private Integer numberOfSeats = 1;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private ParticipantStatus status = ParticipantStatus.CONFIRMED;

    @Column(nullable = false, updatable = false)
    private LocalDateTime registeredAt;

    @PrePersist
    public void prePersist() {
        this.registeredAt = LocalDateTime.now();
    }
}