package com.elif.entities.veterinarian;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "veterinarian")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Veterinarian {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String phone;
    
    @Column(nullable = false)
    private String speciality;
    
    @Column(nullable = false)
    private int experienceYears;
    
    @Column(nullable = false)
    private String clinicAddress;
    
    @Column(nullable = false)
    private boolean available;
}
