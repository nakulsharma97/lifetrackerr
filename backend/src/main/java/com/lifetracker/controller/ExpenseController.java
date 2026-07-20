package com.lifetracker.controller;

import com.lifetracker.config.SecurityUtil;
import com.lifetracker.dto.ExpenseRequest;
import com.lifetracker.dto.ExpenseResponse;
import com.lifetracker.dto.ExpenseSummaryResponse;
import com.lifetracker.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final SecurityUtil securityUtil;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getExpenses(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Long userId = securityUtil.getCurrentUserId();
        LocalDate fromDate = from != null ? LocalDate.parse(from) : LocalDate.now().withDayOfMonth(1);
        LocalDate toDate = to != null ? LocalDate.parse(to) : LocalDate.now();

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date"));
        Page<ExpenseResponse> expensePage = expenseService.getExpenses(userId, fromDate, toDate, categoryId, pageable);

        Map<String, Object> response = Map.of(
                "content", expensePage.getContent(),
                "page", expensePage.getNumber(),
                "size", expensePage.getSize(),
                "totalElements", expensePage.getTotalElements(),
                "totalPages", expensePage.getTotalPages(),
                "last", expensePage.isLast()
        );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/summary")
    public ResponseEntity<ExpenseSummaryResponse> getSummary() {
        Long userId = securityUtil.getCurrentUserId();
        ExpenseSummaryResponse summary = expenseService.getMonthlySummary(userId);
        return ResponseEntity.ok(summary);
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(@Valid @RequestBody ExpenseRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        ExpenseResponse expense = expenseService.createExpense(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(expense);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable Long id,
            @Valid @RequestBody ExpenseRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        ExpenseResponse expense = expenseService.updateExpense(userId, id, request);
        return ResponseEntity.ok(expense);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        Long userId = securityUtil.getCurrentUserId();
        expenseService.deleteExpense(userId, id);
        return ResponseEntity.noContent().build();
    }
}
