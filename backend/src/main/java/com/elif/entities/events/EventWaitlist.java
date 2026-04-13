package com.elif.entities.events;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

import com.elif.entities.user.User;

/**
 * Liste d'attente pour les événements complets (FULL).
 * Quand une place se libère, le premier de la liste est promu automatiquement.
 */
@Entity
@Table(
        name = "event_waitlist",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_waitlist_event_user",
                columnNames = {"event_id", "user_id"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventWaitlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private User user;

    /** Nombre de places souhaitées */
    @Column(nullable = false)
    private int numberOfSeats;

    /** Position dans la file (1 = premier) */
    @Column(nullable = false)
    private int position;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    /** Notifié qu'une place est disponible */
    @Builder.Default
    @Column(nullable = false)
    private boolean notified = false;
}