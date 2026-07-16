package com.lifetracker.controller;

import com.lifetracker.config.SecurityUtil;
import com.lifetracker.dto.*;
import com.lifetracker.service.HabitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/habits")
@RequiredArgsConstructor
public class HabitController {

    private final HabitService habitService;
    private final SecurityUtil securityUtil;

    @GetMapping
    public ResponseEntity<List<HabitResponse>> getHabits() {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(habitService.getHabits(userId));
    }

    @GetMapping("/streaks")
    public ResponseEntity<List<StreakResponse>> getStreaks() {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(habitService.getAllStreaks(userId));
    }

    @PostMapping
    public ResponseEntity<HabitResponse> createHabit(@Valid @RequestBody HabitRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        HabitResponse habit = habitService.createHabit(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(habit);
    }

    @PutMapping("/{id}")
    public ResponseEntity<HabitResponse> updateHabit(
            @PathVariable Long id,
            @Valid @RequestBody HabitRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(habitService.updateHabit(userId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabit(@PathVariable Long id) {
        Long userId = securityUtil.getCurrentUserId();
        habitService.deleteHabit(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/log")
    public ResponseEntity<HabitLogEntry> logHabit(
            @PathVariable Long id,
            @Valid @RequestBody HabitLogRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        HabitLogEntry log = habitService.logHabit(userId, id, request);
        return ResponseEntity.ok(log);
    }
}
