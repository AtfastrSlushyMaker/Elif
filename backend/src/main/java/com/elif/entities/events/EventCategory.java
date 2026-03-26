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
@ToString(exclude = "events")        // ← Important pour éviter les boucles
@EqualsAndHashCode(exclude = "events") // ← Important pour éviter les boucles
public class EventCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)  // ← Pour les performances
    private List<Event> events;
}