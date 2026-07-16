package com.lifetracker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.YearMonth;

@Entity
@Table(name = "budget_goals",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "category_id", "year_month"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal budgetAmount;

    @Column(nullable = false)
    private YearMonth yearMonth;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;
}
