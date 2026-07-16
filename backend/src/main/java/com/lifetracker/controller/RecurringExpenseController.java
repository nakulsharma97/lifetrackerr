package com.lifetracker.controller;

import com.lifetracker.config.SecurityUtil;
import com.lifetracker.dto.RecurringExpenseRequest;
import com.lifetracker.dto.RecurringExpenseResponse;
import com.lifetracker.service.RecurringExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recurring")
@RequiredArgsConstructor
public class RecurringExpenseController {

    private final RecurringExpenseService recurringExpenseService;
    private final SecurityUtil securityUtil;

    @GetMapping
    public ResponseEntity<List<RecurringExpenseResponse>> getAll() {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(recurringExpenseService.getAll(userId));
    }

    @PostMapping
    public ResponseEntity<RecurringExpenseResponse> create(
            @Valid @RequestBody RecurringExpenseRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(recurringExpenseService.create(userId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecurringExpenseResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody RecurringExpenseRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(recurringExpenseService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Long userId = securityUtil.getCurrentUserId();
        recurringExpenseService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<RecurringExpenseResponse> toggleActive(@PathVariable Long id) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(recurringExpenseService.toggleActive(userId, id));
    }
}
