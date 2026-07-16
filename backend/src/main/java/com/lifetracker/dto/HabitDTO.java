package com.lifetracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitRequest {

    @NotBlank(message = "Habit name is required")
    @Size(max = 150, message = "Name must be at most 150 characters")
    private String name;

    @Builder.Default
    private String frequency = "DAILY";
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitResponse {

    private Long id;
    private String name;
    private String frequency;
    private String createdAt;
    private int currentStreak;
    private int longestStreak;
    private int totalCompletions;
    private List<HabitLogEntry> recentLogs;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitLogRequest {

    private LocalDate date;

    @Builder.Default
    private boolean completed = true;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitLogEntry {

    private Long id;
    private LocalDate date;
    private boolean completed;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StreakResponse {

    private Long habitId;
    private String habitName;
    private int currentStreak;
    private int longestStreak;
    private int totalCompletions;
}
