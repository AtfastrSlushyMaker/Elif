package com.elif.entities.service;

import jakarta.persistence.*;
import lombok.*;
import com.elif.entities.user.User;
@Entity
@Table(name = "service")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Service {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private double price;
    private int duration; // en minutes
    private String status; // ACTIVE / INACTIVE

    @ManyToOne
    @JoinColumn(name = "category_id")
    private ServiceCategory category;

    @ManyToOne
    @JoinColumn(name = "provider_id")
    private User provider; // le provider qui offre ce service
}