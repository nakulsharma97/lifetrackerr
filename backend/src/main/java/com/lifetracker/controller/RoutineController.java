package com.lifetracker.controller;

import com.lifetracker.config.SecurityUtil;
import com.lifetracker.dto.*;
import com.lifetracker.service.RoutineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routines")
@RequiredArgsConstructor
public class RoutineController {

    private final RoutineService routineService;
    private final SecurityUtil securityUtil;

    @GetMapping
    public ResponseEntity<List<RoutineResponse>> getAll() {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(routineService.getAll(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoutineResponse> getById(@PathVariable Long id) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(routineService.getById(userId, id));
    }

    @PostMapping
    public ResponseEntity<RoutineResponse> create(@Valid @RequestBody RoutineRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(routineService.create(userId, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoutineResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody RoutineRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(routineService.update(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        Long userId = securityUtil.getCurrentUserId();
        routineService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/toggle")
    public ResponseEntity<RoutineCompletionResponse> toggleCompletion(
            @PathVariable Long id,
            @Valid @RequestBody RoutineCompletionRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(routineService.toggleCompletion(userId, id, request));
    }

    @GetMapping("/calendar")
    public ResponseEntity<CalendarMonthResponse> getCalendar(
            @RequestParam int year,
            @RequestParam int month) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(routineService.getCalendarMonth(userId, year, month));
    }

    @GetMapping("/stats")
    public ResponseEntity<RoutineStatsResponse> getStats() {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(routineService.getStats(userId));
    }
}
