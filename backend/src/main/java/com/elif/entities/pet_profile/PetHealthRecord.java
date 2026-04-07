package com.elif.entities.pet_profile;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pet_health_record")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetHealthRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private PetProfile pet;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Column(name = "visit_type", nullable = false, length = 80)
    private String visitType;

    @Column(name = "veterinarian", length = 120)
    private String veterinarian;

    @Column(name = "clinic_name", length = 120)
    private String clinicName;

    @Column(name = "diagnosis", length = 255)
    private String diagnosis;

    @Column(name = "treatment", length = 500)
    private String treatment;

    @Column(name = "medications", length = 500)
    private String medications;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "next_visit_date")
    private LocalDate nextVisitDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
