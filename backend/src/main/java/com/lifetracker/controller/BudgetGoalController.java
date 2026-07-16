package com.lifetracker.controller;

import com.lifetracker.config.SecurityUtil;
import com.lifetracker.dto.BudgetGoalRequest;
import com.lifetracker.dto.BudgetGoalResponse;
import com.lifetracker.service.BudgetGoalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetGoalController {

    private final BudgetGoalService budgetGoalService;
    private final SecurityUtil securityUtil;

    @GetMapping
    public ResponseEntity<List<BudgetGoalResponse>> getCurrentBudgets() {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(budgetGoalService.getCurrentBudgets(userId));
    }

    @GetMapping("/{yearMonth}")
    public ResponseEntity<List<BudgetGoalResponse>> getBudgetsForMonth(
            @PathVariable String yearMonth) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(
                budgetGoalService.getBudgetsForMonth(userId, YearMonth.parse(yearMonth)));
    }

    @PostMapping
    public ResponseEntity<BudgetGoalResponse> createOrUpdate(
            @Valid @RequestBody BudgetGoalRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(budgetGoalService.createOrUpdate(userId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Long userId = securityUtil.getCurrentUserId();
        budgetGoalService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
