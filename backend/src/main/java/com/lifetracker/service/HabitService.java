package com.lifetracker.service;

import com.lifetracker.dto.*;
import com.lifetracker.entity.Habit;
import com.lifetracker.entity.HabitLog;
import com.lifetracker.entity.User;
import com.lifetracker.repository.HabitLogRepository;
import com.lifetracker.repository.HabitRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class HabitService {

    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;

    public List<HabitResponse> getHabits(Long userId) {
        List<Habit> habits = habitRepository.findByUserId(userId);
        return habits.stream().map(this::buildResponse).collect(Collectors.toList());
    }

    public HabitResponse createHabit(Long userId, HabitRequest request) {
        Habit habit = Habit.builder()
                .name(request.getName())
                .frequency(Habit.Frequency.valueOf(request.getFrequency().toUpperCase()))
                .user(UserReference.of(userId))
                .build();

        habit = habitRepository.save(habit);
        return buildResponse(habit);
    }

    public HabitResponse updateHabit(Long userId, Long habitId, HabitRequest request) {
        Habit habit = habitRepository.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Habit not found"));

        habit.setName(request.getName());
        if (request.getFrequency() != null) {
            habit.setFrequency(Habit.Frequency.valueOf(request.getFrequency().toUpperCase()));
        }

        habit = habitRepository.save(habit);
        return buildResponse(habit);
    }

    public void deleteHabit(Long userId, Long habitId) {
        Habit habit = habitRepository.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Habit not found"));
        habitLogRepository.findByHabitIdOrderByDateDesc(habitId)
                .forEach(hl -> habitLogRepository.delete(hl));
        habitRepository.delete(habit);
    }

    public HabitLogEntry logHabit(Long userId, Long habitId, HabitLogRequest request) {
        Habit habit = habitRepository.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Habit not found"));

        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();

        // Upsert — if a log already exists for this habit+date, update it
        HabitLog log = habitLogRepository.findByHabitIdAndDate(habitId, date)
                .orElse(HabitLog.builder()
                        .habit(habit)
                        .date(date)
                        .build());

        log.setCompleted(request.isCompleted());
        log = habitLogRepository.save(log);

        return HabitLogEntry.builder()
                .id(log.getId())
                .date(log.getDate())
                .completed(log.isCompleted())
                .build();
    }

    public List<StreakResponse> getAllStreaks(Long userId) {
        List<Habit> habits = habitRepository.findByUserId(userId);
        return habits.stream().map(habit -> {
            StreakData data = calculateStreaks(habit.getId());
            return StreakResponse.builder()
                    .habitId(habit.getId())
                    .habitName(habit.getName())
                    .currentStreak(data.currentStreak)
                    .longestStreak(data.longestStreak)
                    .totalCompletions(data.totalCompletions)
                    .build();
        }).collect(Collectors.toList());
    }

    // ─── Private helpers ────────────────────────────────────────

    private HabitResponse buildResponse(Habit habit) {
        StreakData data = calculateStreaks(habit.getId());

        // Fetch last 7 days of logs for the weekly view
        LocalDate sevenDaysAgo = LocalDate.now().minusDays(6);
        List<HabitLog> recentLogs = habitLogRepository
                .findByHabitIdAndDateBetweenOrderByDateDesc(habit.getId(), sevenDaysAgo, LocalDate.now());

        List<HabitLogEntry> logEntries = recentLogs.stream()
                .map(l -> HabitLogEntry.builder()
                        .id(l.getId())
                        .date(l.getDate())
                        .completed(l.isCompleted())
                        .build())
                .collect(Collectors.toList());

        return HabitResponse.builder()
                .id(habit.getId())
                .name(habit.getName())
                .frequency(habit.getFrequency().name())
                .createdAt(habit.getCreatedAt().toString())
                .currentStreak(data.currentStreak)
                .longestStreak(data.longestStreak)
                .totalCompletions(data.totalCompletions)
                .recentLogs(logEntries)
                .build();
    }

    /**
     * Streak logic: Query habit_logs ordered by date descending.
     * Count consecutive completed=true days starting from most recent.
     * Stop at first gap (missing date or completed=false).
     */
    private StreakData calculateStreaks(Long habitId) {
        List<HabitLog> logs = habitLogRepository.findByHabitIdOrderByDateDesc(habitId);

        int totalCompletions = (int) logs.stream().filter(HabitLog::isCompleted).count();
        if (logs.isEmpty()) {
            return new StreakData(0, 0, 0);
        }

        // Build a set of completed dates for efficient lookup
        Set<LocalDate> completedDates = logs.stream()
                .filter(HabitLog::isCompleted)
                .map(HabitLog::getDate)
                .collect(Collectors.toSet());

        if (completedDates.isEmpty()) {
            return new StreakData(0, 0, 0);
        }

        // Current streak: start from today (or most recent date), count backwards
        LocalDate today = LocalDate.now();
        LocalDate mostRecent = Collections.max(completedDates);

        // Only count current streak if the most recent completed date is today or yesterday
        // Otherwise the streak is broken
        long daysSinceLastCompletion = ChronoUnit.DAYS.between(mostRecent, today);
        int currentStreak = 0;

        if (daysSinceLastCompletion <= 1) {
            LocalDate cursor = mostRecent;
            while (completedDates.contains(cursor)) {
                currentStreak++;
                cursor = cursor.minusDays(1);
            }
        }

        // Longest streak: iterate through all completed dates
        List<LocalDate> sortedDates = completedDates.stream()
                .sorted(Comparator.reverseOrder())
                .collect(Collectors.toList());

        int longestStreak = 0;
        int runningStreak = 1;

        for (int i = 0; i < sortedDates.size() - 1; i++) {
            LocalDate current = sortedDates.get(i);
            LocalDate next = sortedDates.get(i + 1);

            if (ChronoUnit.DAYS.between(next, current) == 1) {
                runningStreak++;
            } else {
                longestStreak = Math.max(longestStreak, runningStreak);
                runningStreak = 1;
            }
        }
        longestStreak = Math.max(longestStreak, runningStreak);

        return new StreakData(currentStreak, longestStreak, totalCompletions);
    }

    @lombok.AllArgsConstructor
    private static class StreakData {
        final int currentStreak;
        final int longestStreak;
        final int totalCompletions;
    }

    private static class UserReference extends User {
        public static User of(Long id) {
            User u = new User();
            u.setId(id);
            return u;
        }
    }
}
