package com.elif.entities.pet_transit;

import com.elif.entities.pet_transit.enums.ChecklistCategory;
import com.elif.entities.pet_transit.enums.PriorityLevel;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "safety_checklist")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SafetyChecklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "travel_plan_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private TravelPlan travelPlan;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ChecklistCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority_level", nullable = false, length = 10)
    private PriorityLevel priorityLevel;

    @Column(name = "is_mandatory", nullable = false)
    private Boolean isMandatory;

    @Column(name = "is_completed", nullable = false)
    private Boolean isCompleted;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "generated_by_ai", nullable = false)
    private Boolean generatedByAI;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
