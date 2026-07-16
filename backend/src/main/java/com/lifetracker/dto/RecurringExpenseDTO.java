package com.lifetracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurringExpenseRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    private String description;

    @NotNull(message = "Day of month is required")
    private Integer dayOfMonth;

    @Builder.Default
    private String frequency = "MONTHLY";

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecurringExpenseResponse {

    private Long id;
    private String name;
    private BigDecimal amount;
    private String description;
    private Integer dayOfMonth;
    private String frequency;
    private boolean active;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate lastGenerated;
    private Long categoryId;
    private String categoryName;
}
