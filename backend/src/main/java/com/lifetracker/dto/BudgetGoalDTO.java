package com.lifetracker.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.YearMonth;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetGoalRequest {

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Budget amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal budgetAmount;

    private String yearMonth;

    @Builder.Default
    private boolean active = true;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetGoalResponse {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private BigDecimal budgetAmount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private double spentPercentage;
    private String yearMonth;
    private boolean active;
    private boolean exceeded;
}
