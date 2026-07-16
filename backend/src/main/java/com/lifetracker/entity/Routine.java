package com.lifetracker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "routines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Routine {

    public enum ScheduleType {
        TODAY_ONLY, TOMORROW_ONLY, EVERY_DAY, WEEKDAYS, WEEKENDS,
        CUSTOM_DAYS, SPECIFIC_DATE, DATE_RANGE,
        REPEAT_X_DAYS, REPEAT_X_WEEKS, MONTHLY, YEARLY
    }

    public enum Priority {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ScheduleType scheduleType;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    // For CUSTOM_DAYS — stores day-of-week numbers (1=Mon..7=Sun) as comma-separated
    @Column(length = 50)
    private String customDays;

    @Column
    private LocalDate specificDate;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column
    private LocalDate endDate;

    // For REPEAT_X_DAYS / REPEAT_X_WEEKS
    @Column
    private Integer repeatInterval;

    // Duration in days (challenge length)
    @Column
    private Integer durationDays;

    @Column
    private LocalTime scheduledTime;

    @Column
    @Builder.Default
    private boolean reminderEnabled = false;

    @Column(length = 50)
    private String color; // hex color for calendar display

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
