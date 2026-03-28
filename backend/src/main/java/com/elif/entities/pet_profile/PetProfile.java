package com.elif.entities.pet_profile;

import com.elif.entities.user.User;
import com.elif.entities.pet_profile.enums.PetGender;
import com.elif.entities.pet_profile.enums.PetSpecies;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pet_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(precision = 8, scale = 2)
    private BigDecimal weight;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PetSpecies species;

    @Column(length = 100)
    private String breed;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "age_years")
    private Integer age;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PetGender gender;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
