package com.elif.entities.events;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "event_category")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "events")
@EqualsAndHashCode(exclude = "events")
public class EventCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 10)
    private String icon;

    @Column(length = 255)
    private String description;

    /**
     * ✅ NOUVEAU : si true, les inscriptions à cette catégorie
     * passent en PENDING et doivent être approuvées par l'admin.
     * Utilisé pour : Concours, Compétition, etc.
     */
    @Builder.Default
    @Column(nullable = false)
    private Boolean requiresApproval = false;

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    private List<Event> events;
}
