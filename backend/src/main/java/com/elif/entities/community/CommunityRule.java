package com.elif.entities.community;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "community_rule")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Community community;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "rule_order", nullable = false)
    @Builder.Default
    private int ruleOrder = 0;
}
