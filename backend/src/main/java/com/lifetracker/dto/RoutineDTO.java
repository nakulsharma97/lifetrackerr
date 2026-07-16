package com.lifetracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoutineRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotBlank(message = "Schedule type is required")
    private String scheduleType;

    private String priority;

    private String customDays;

    private LocalDate specificDate;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;

    private Integer repeatInterval;

    private Integer durationDays;

    private String scheduledTime;

    private boolean reminderEnabled;

    private String color;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoutineResponse {

    private Long id;
    private String name;
    private String description;
    private String scheduleType;
    private String priority;
    private String customDays;
    private LocalDate specificDate;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer repeatInterval;
    private Integer durationDays;
    private String scheduledTime;
    private boolean reminderEnabled;
    private String color;
    private boolean active;
    private String createdAt;

    // Computed stats
    private int currentStreak;
    private int longestStreak;
    private int totalCompleted;
    private int totalMissed;
    private double completionPercentage;
    private LocalDate lastCompletedDate;
    private int currentDay;
    private int daysRemaining;
    private double progressPercent;
    private boolean isDueToday;
    private boolean isCompletedToday;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarDayResponse {

    private LocalDate date;
    private int totalRoutines;
    private int completedRoutines;
    private double completionPercentage;
    private List<RoutineResponse> routines;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalendarMonthResponse {

    private int year;
    private int month;
    private Map<String, CalendarDayResponse> days;
    private int totalRoutines;
    private int completedRoutines;
    private double monthlyCompletionRate;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoutineStatsResponse {

    private int totalActiveRoutines;
    private int completedToday;
    private int missedToday;
    private double completionRate;
    private int currentStreak;
    private int longestStreak;
    private int totalDaysTracked;

    // Analytics
    private String bestWeek;
    private String bestMonth;
    private double avgDailyCompletion;
    private String mostConsistentRoutine;
    private String mostMissedRoutine;
    private int productivityScore;
    private Map<String, Integer> weeklyReport;
    private Map<String, Integer> monthlyReport;
    private List<HeatmapEntry> heatmap;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeatmapEntry {

    private String date;
    private int count;
    private int level; // 0-4 for color intensity
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoutineCompletionRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    private boolean completed;

    private boolean skipped;

    private String note;

    private String completedAt;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoutineCompletionResponse {

    private Long id;
    private Long routineId;
    private LocalDate date;
    private boolean completed;
    private boolean skipped;
    private String note;
    private String completedAt;
}
