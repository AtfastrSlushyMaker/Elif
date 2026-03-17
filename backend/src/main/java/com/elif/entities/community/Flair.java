package com.elif.entities.community;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "flair")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Flair {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Community community;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 7)
    @Builder.Default
    private String color = "#52B788";

    @Column(name = "text_color", nullable = false, length = 7)
    @Builder.Default
    private String textColor = "#FFFFFF";
}
