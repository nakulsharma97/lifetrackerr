package com.lifetracker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "routine_completions",
       uniqueConstraints = @UniqueConstraint(columnNames = {"routine_id", "date"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoutineCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routine_id", nullable = false)
    private Routine routine;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    @Builder.Default
    private boolean completed = false;

    @Column
    private LocalTime completedAt;

    @Column
    @Builder.Default
    private boolean skipped = false;

    @Column(length = 500)
    private String note;
}
