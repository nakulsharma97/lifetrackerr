package com.lifetracker.service;

import com.lifetracker.dto.*;
import com.lifetracker.entity.*;
import com.lifetracker.repository.RoutineCompletionRepository;
import com.lifetracker.repository.RoutineRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RoutineService {

    private final RoutineRepository routineRepository;
    private final RoutineCompletionRepository completionRepository;

    // ─── CRUD ───────────────────────────────────────────────

    public List<RoutineResponse> getAll(Long userId) {
        return routineRepository.findByUserId(userId).stream()
                .map(r -> buildResponse(r, userId))
                .collect(Collectors.toList());
    }

    public RoutineResponse getById(Long userId, Long id) {
        Routine routine = routineRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Routine not found"));
        return buildResponse(routine, userId);
    }

    public RoutineResponse create(Long userId, RoutineRequest request) {
        Routine routine = Routine.builder()
                .name(request.getName())
                .description(request.getDescription())
                .scheduleType(Routine.ScheduleType.valueOf(request.getScheduleType()))
                .priority(request.getPriority() != null
                        ? Routine.Priority.valueOf(request.getPriority())
                        : Routine.Priority.MEDIUM)
                .customDays(request.getCustomDays())
                .specificDate(request.getSpecificDate())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .repeatInterval(request.getRepeatInterval())
                .durationDays(request.getDurationDays())
                .scheduledTime(request.getScheduledTime() != null
                        ? LocalTime.parse(request.getScheduledTime())
                        : null)
                .reminderEnabled(request.isReminderEnabled())
                .color(request.getColor())
                .active(true)
                .user(UserReference.of(userId))
                .build();

        routine = routineRepository.save(routine);
        return buildResponse(routine, userId);
    }

    public RoutineResponse update(Long userId, Long id, RoutineRequest request) {
        Routine routine = routineRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Routine not found"));

        routine.setName(request.getName());
        routine.setDescription(request.getDescription());
        routine.setScheduleType(Routine.ScheduleType.valueOf(request.getScheduleType()));
        if (request.getPriority() != null) {
            routine.setPriority(Routine.Priority.valueOf(request.getPriority()));
        }
        routine.setCustomDays(request.getCustomDays());
        routine.setSpecificDate(request.getSpecificDate());
        routine.setStartDate(request.getStartDate());
        routine.setEndDate(request.getEndDate());
        routine.setRepeatInterval(request.getRepeatInterval());
        routine.setDurationDays(request.getDurationDays());
        routine.setScheduledTime(request.getScheduledTime() != null
                ? LocalTime.parse(request.getScheduledTime())
                : null);
        routine.setReminderEnabled(request.isReminderEnabled());
        routine.setColor(request.getColor());

        return buildResponse(routineRepository.save(routine), userId);
    }

    public void delete(Long userId, Long id) {
        Routine routine = routineRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Routine not found"));
        completionRepository.deleteByRoutineId(id);
        routineRepository.delete(routine);
    }

    // ─── Completions ────────────────────────────────────────

    public RoutineCompletionResponse toggleCompletion(Long userId, Long routineId, RoutineCompletionRequest request) {
        Routine routine = routineRepository.findByIdAndUserId(routineId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Routine not found"));

        LocalDate date = request.getDate();
        RoutineCompletion completion = completionRepository
                .findByRoutineIdAndDate(routineId, date)
                .orElse(RoutineCompletion.builder()
                        .routine(routine)
                        .date(date)
                        .build());

        completion.setCompleted(request.isCompleted());
        completion.setSkipped(request.isSkipped());
        if (request.getNote() != null) completion.setNote(request.getNote());
        if (request.isCompleted()) {
            completion.setCompletedAt(LocalTime.now());
        } else {
            completion.setCompletedAt(null);
        }

        completion = completionRepository.save(completion);
        return toCompletionResponse(completion);
    }

    // ─── Calendar ───────────────────────────────────────────

    public CalendarMonthResponse getCalendarMonth(Long userId, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate firstDay = yearMonth.atDay(1);
        LocalDate lastDay = yearMonth.atEndOfMonth();

        List<Routine> routines = routineRepository.findByUserIdAndActiveTrue(userId);
        List<RoutineCompletion> completions = completionRepository
                .findByUserIdAndDateBetween(userId, firstDay, lastDay);

        Map<String, CalendarDayResponse> days = new LinkedHashMap<>();
        int totalMonthRoutines = 0;
        int totalMonthCompleted = 0;

        for (int d = 1; d <= yearMonth.lengthOfMonth(); d++) {
            LocalDate date = yearMonth.atDay(d);
            String dateKey = date.toString();

            List<Routine> dueRoutines = getDueRoutines(routines, date);
            List<RoutineCompletion> dayCompletions = completions.stream()
                    .filter(c -> c.getDate().equals(date))
                    .collect(Collectors.toList());

            int completed = (int) dayCompletions.stream().filter(RoutineCompletion::isCompleted).count();
            int total = dueRoutines.size();
            totalMonthRoutines += total;
            totalMonthCompleted += completed;

            double pct = total > 0 ? (completed * 100.0 / total) : 0;

            List<RoutineResponse> routineResponses = dueRoutines.stream()
                    .map(r -> buildResponse(r, userId))
                    .collect(Collectors.toList());

            CalendarDayResponse dayResp = CalendarDayResponse.builder()
                    .date(date)
                    .totalRoutines(total)
                    .completedRoutines(completed)
                    .completionPercentage(Math.round(pct * 10.0) / 10.0)
                    .routines(routineResponses)
                    .build();

            days.put(dateKey, dayResp);
        }

        double monthPct = totalMonthRoutines > 0
                ? (totalMonthCompleted * 100.0 / totalMonthRoutines) : 0;

        return CalendarMonthResponse.builder()
                .year(year)
                .month(month)
                .days(days)
                .totalRoutines(totalMonthRoutines)
                .completedRoutines(totalMonthCompleted)
                .monthlyCompletionRate(Math.round(monthPct * 10.0) / 10.0)
                .build();
    }

    // ─── Stats / Analytics ──────────────────────────────────

    public RoutineStatsResponse getStats(Long userId) {
        List<Routine> routines = routineRepository.findByUserIdAndActiveTrue(userId);
        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minusDays(7);
        LocalDate monthAgo = today.minusDays(30);

        List<RoutineCompletion> allCompletions = completionRepository
                .findByUserIdAndDateBetween(userId, today.minusDays(365), today);

        List<RoutineCompletion> todayCompletions = completionRepository
                .findByUserIdAndDate(userId, today);

        // Today stats
        int totalDueToday = 0;
        int completedToday = 0;
        int missedToday = 0;

        for (Routine r : routines) {
            if (isDue(r, today)) {
                totalDueToday++;
                boolean done = todayCompletions.stream()
                        .anyMatch(c -> c.getRoutine().getId().equals(r.getId()) && c.isCompleted());
                if (done) completedToday++;
                else missedToday++;
            }
        }

        // Streaks
        int currentStreak = calculateGlobalStreak(userId, today);
        int longestStreak = calculateLongestGlobalStreak(userId, allCompletions);

        // Completion rate (last 30 days)
        List<RoutineCompletion> monthCompletions = allCompletions.stream()
                .filter(c -> !c.getDate().isBefore(monthAgo))
                .collect(Collectors.toList());

        int monthTotal = 0;
        int monthDone = 0;
        for (LocalDate d = monthAgo; d.isBefore(today) || d.isEqual(today); d = d.plusDays(1)) {
            int due = 0;
            int done = 0;
            for (Routine r : routines) {
                if (isDue(r, d)) {
                    due++;
                    boolean dDone = monthCompletions.stream()
                            .anyMatch(c -> c.getRoutine().getId().equals(r.getId())
                                    && c.getDate().equals(d) && c.isCompleted());
                    if (dDone) done++;
                }
            }
            monthTotal += due;
            monthDone += done;
        }

        double completionRate = monthTotal > 0 ? (monthDone * 100.0 / monthTotal) : 0;

        // Weekly/Monthly reports
        Map<String, Integer> weeklyReport = new LinkedHashMap<>();
        Map<String, Integer> monthlyReport = new LinkedHashMap<>();

        for (int i = 6; i >= 0; i--) {
            LocalDate wDate = today.minusDays(i);
            String key = wDate.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            int wDone = 0;
            for (Routine r : routines) {
                if (isDue(r, wDate)) {
                    boolean dDone = allCompletions.stream()
                            .anyMatch(c -> c.getRoutine().getId().equals(r.getId())
                                    && c.getDate().equals(wDate) && c.isCompleted());
                    if (dDone) wDone++;
                }
            }
            weeklyReport.put(key, wDone);
        }

        for (int i = 11; i >= 0; i--) {
            YearMonth ym = YearMonth.from(today).minusMonths(i);
            String key = ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            LocalDate mStart = ym.atDay(1);
            LocalDate mEnd = ym.atEndOfMonth();
            int mDone = 0;
            int mTotal = 0;
            for (Routine r : routines) {
                for (LocalDate d = mStart; !d.isAfter(mEnd); d = d.plusDays(1)) {
                    if (isDue(r, d)) {
                        mTotal++;
                        boolean dDone = allCompletions.stream()
                                .anyMatch(c -> c.getRoutine().getId().equals(r.getId())
                                        && c.getDate().equals(d) && c.isCompleted());
                        if (dDone) mDone++;
                    }
                }
            }
            monthlyReport.put(key, mTotal > 0 ? (int) (mDone * 100.0 / mTotal) : 0);
        }

        // Heatmap (last 365 days)
        List<HeatmapEntry> heatmap = new ArrayList<>();
        for (int i = 364; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            int due = 0;
            int done = 0;
            for (Routine r : routines) {
                if (isDue(r, d)) {
                    due++;
                    boolean dDone = allCompletions.stream()
                            .anyMatch(c -> c.getRoutine().getId().equals(r.getId())
                                    && c.getDate().equals(d) && c.isCompleted());
                    if (dDone) done++;
                }
            }
            int level = due > 0 ? (int) Math.round((done * 4.0) / due) : 0;
            heatmap.add(HeatmapEntry.builder()
                    .date(d.toString())
                    .count(done)
                    .level(Math.min(level, 4))
                    .build());
        }

        // Best/most consistent
        String mostConsistent = "";
        String mostMissed = "";
        int bestScore = 0;
        int worstScore = Integer.MAX_VALUE;

        for (Routine r : routines) {
            long done = completionRepository.countByRoutineIdAndCompletedTrue(r.getId());
            long missed = completionRepository.countByRoutineIdAndCompletedFalseAndSkippedFalse(r.getId());
            long total2 = done + missed;
            int pct = total2 > 0 ? (int) (done * 100.0 / total2) : 0;

            if (pct > bestScore) {
                bestScore = pct;
                mostConsistent = r.getName();
            }
            if (total2 > 0 && pct < worstScore) {
                worstScore = pct;
                mostMissed = r.getName();
            }
        }

        int totalDaysTracked = (int) allCompletions.stream()
                .map(RoutineCompletion::getDate)
                .distinct().count();

        double avgDaily = monthTotal > 0 ? Math.round((monthDone * 10.0) / Math.max(1, monthTotal / 30)) / 10.0 : 0;

        return RoutineStatsResponse.builder()
                .totalActiveRoutines(routines.size())
                .completedToday(completedToday)
                .missedToday(missedToday)
                .completionRate(Math.round(completionRate * 10.0) / 10.0)
                .currentStreak(currentStreak)
                .longestStreak(longestStreak)
                .totalDaysTracked(totalDaysTracked)
                .bestWeek(findBestWeek(allCompletions, routines))
                .bestMonth(findBestMonth(allCompletions, routines))
                .avgDailyCompletion(avgDaily)
                .mostConsistentRoutine(mostConsistent)
                .mostMissedRoutine(mostMissed)
                .productivityScore(calculateProductivityScore(completionRate, currentStreak, longestStreak, routines.size()))
                .weeklyReport(weeklyReport)
                .monthlyReport(monthlyReport)
                .heatmap(heatmap)
                .build();
    }

    // ─── Recurrence Engine ──────────────────────────────────

    public boolean isDue(Routine routine, LocalDate date) {
        if (!routine.isActive()) return false;
        if (routine.getEndDate() != null && date.isAfter(routine.getEndDate())) return false;
        if (date.isBefore(routine.getStartDate())) return false;
        if (routine.getDurationDays() != null) {
            LocalDate maxDate = routine.getStartDate().plusDays(routine.getDurationDays() - 1);
            if (date.isAfter(maxDate)) return false;
        }

        return switch (routine.getScheduleType()) {
            case TODAY_ONLY -> date.equals(routine.getStartDate());
            case TOMORROW_ONLY -> date.equals(routine.getStartDate().plusDays(1));
            case EVERY_DAY -> true;
            case WEEKDAYS -> date.getDayOfWeek().getValue() <= 5;
            case WEEKENDS -> date.getDayOfWeek().getValue() >= 6;
            case CUSTOM_DAYS -> {
                if (routine.getCustomDays() == null) yield false;
                Set<Integer> days = Arrays.stream(routine.getCustomDays().split(","))
                        .map(String::trim).map(Integer::parseInt).collect(Collectors.toSet());
                yield days.contains(date.getDayOfWeek().getValue());
            }
            case SPECIFIC_DATE -> routine.getSpecificDate() != null && date.equals(routine.getSpecificDate());
            case DATE_RANGE -> !date.isBefore(routine.getStartDate()) &&
                    (routine.getEndDate() == null || !date.isAfter(routine.getEndDate()));
            case REPEAT_X_DAYS -> {
                if (routine.getRepeatInterval() == null) yield false;
                long daysBetween = ChronoUnit.DAYS.between(routine.getStartDate(), date);
                yield daysBetween >= 0 && daysBetween % routine.getRepeatInterval() == 0;
            }
            case REPEAT_X_WEEKS -> {
                if (routine.getRepeatInterval() == null) yield false;
                long weeksBetween = ChronoUnit.WEEKS.between(routine.getStartDate(), date);
                yield weeksBetween >= 0 && weeksBetween % routine.getRepeatInterval() == 0;
            }
            case MONTHLY -> date.getDayOfMonth() == routine.getStartDate().getDayOfMonth()
                    && !date.isBefore(routine.getStartDate());
            case YEARLY -> date.getDayOfYear() == routine.getStartDate().getDayOfYear()
                    && !date.isBefore(routine.getStartDate());
        };
    }

    private List<Routine> getDueRoutines(List<Routine> routines, LocalDate date) {
        return routines.stream().filter(r -> isDue(r, date)).collect(Collectors.toList());
    }

    // ─── Helpers ────────────────────────────────────────────

    private RoutineResponse buildResponse(Routine routine, Long userId) {
        LocalDate today = LocalDate.now();

        List<RoutineCompletion> completions = completionRepository
                .findByRoutineIdOrderByDateDesc(routine.getId());

        List<RoutineCompletion> completedLogs = completions.stream()
                .filter(RoutineCompletion::isCompleted)
                .collect(Collectors.toList());

        int totalCompleted = completedLogs.size();
        int totalMissed = (int) completions.stream()
                .filter(c -> !c.isCompleted() && !c.isSkipped())
                .count();

        // Streaks
        int currentStreak = calculateStreak(completedLogs, today);
        int longestStreak = calculateLongestStreak(completedLogs);

        // Duration progress
        int currentDay = 0;
        int daysRemaining = 0;
        double progressPercent = 0;
        if (routine.getDurationDays() != null) {
            long daysSinceStart = ChronoUnit.DAYS.between(routine.getStartDate(), today);
            currentDay = (int) Math.min(daysSinceStart + 1, routine.getDurationDays());
            daysRemaining = Math.max(0, routine.getDurationDays() - currentDay);
            progressPercent = Math.round((currentDay * 100.0 / routine.getDurationDays()) * 10.0) / 10.0;
        }

        // Due today?
        boolean isDueToday = isDue(routine, today);
        boolean isCompletedToday = completions.stream()
                .anyMatch(c -> c.getDate().equals(today) && c.isCompleted());

        double pct = (totalCompleted + totalMissed) > 0
                ? Math.round((totalCompleted * 100.0 / (totalCompleted + totalMissed)) * 10.0) / 10.0
                : 0;

        LocalDate lastDate = completedLogs.isEmpty() ? null : completedLogs.get(0).getDate();

        return RoutineResponse.builder()
                .id(routine.getId())
                .name(routine.getName())
                .description(routine.getDescription())
                .scheduleType(routine.getScheduleType().name())
                .priority(routine.getPriority().name())
                .customDays(routine.getCustomDays())
                .specificDate(routine.getSpecificDate())
                .startDate(routine.getStartDate())
                .endDate(routine.getEndDate())
                .repeatInterval(routine.getRepeatInterval())
                .durationDays(routine.getDurationDays())
                .scheduledTime(routine.getScheduledTime() != null ? routine.getScheduledTime().toString() : null)
                .reminderEnabled(routine.isReminderEnabled())
                .color(routine.getColor())
                .active(routine.isActive())
                .currentStreak(currentStreak)
                .longestStreak(longestStreak)
                .totalCompleted(totalCompleted)
                .totalMissed(totalMissed)
                .completionPercentage(pct)
                .lastCompletedDate(lastDate)
                .currentDay(currentDay)
                .daysRemaining(daysRemaining)
                .progressPercent(progressPercent)
                .isDueToday(isDueToday)
                .isCompletedToday(isCompletedToday)
                .build();
    }

    private int calculateStreak(List<RoutineCompletion> completedLogs, LocalDate today) {
        if (completedLogs.isEmpty()) return 0;
        Set<LocalDate> dates = completedLogs.stream()
                .map(RoutineCompletion::getDate)
                .collect(Collectors.toSet());
        if (dates.isEmpty()) return 0;

        LocalDate mostRecent = Collections.max(dates);
        long daysSinceLast = ChronoUnit.DAYS.between(mostRecent, today);
        if (daysSinceLast > 1) return 0;

        int streak = 0;
        LocalDate cursor = mostRecent;
        while (dates.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private int calculateLongestStreak(List<RoutineCompletion> completedLogs) {
        if (completedLogs.isEmpty()) return 0;
        Set<LocalDate> dates = completedLogs.stream()
                .map(RoutineCompletion::getDate)
                .collect(Collectors.toSet());
        List<LocalDate> sorted = dates.stream().sorted(Comparator.reverseOrder())
                .collect(Collectors.toList());

        int longest = 0;
        int running = 1;
        for (int i = 0; i < sorted.size() - 1; i++) {
            if (ChronoUnit.DAYS.between(sorted.get(i + 1), sorted.get(i)) == 1) {
                running++;
            } else {
                longest = Math.max(longest, running);
                running = 1;
            }
        }
        return Math.max(longest, running);
    }

    private int calculateGlobalStreak(Long userId, LocalDate today) {
        List<Routine> routines = routineRepository.findByUserIdAndActiveTrue(userId);
        int streak = 0;
        LocalDate cursor = today;

        while (true) {
            boolean anyDue = false;
            boolean allDone = true;
            for (Routine r : routines) {
                if (isDue(r, cursor)) {
                    anyDue = true;
                    boolean done = completionRepository
                            .findByRoutineIdAndDate(r.getId(), cursor)
                            .filter(RoutineCompletion::isCompleted)
                            .isPresent();
                    if (!done) allDone = false;
                }
            }
            if (!anyDue) {
                cursor = cursor.minusDays(1);
                continue;
            }
            if (!allDone) break;
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private int calculateLongestGlobalStreak(Long userId, List<RoutineCompletion> allCompletions) {
        Set<LocalDate> completedDates = allCompletions.stream()
                .filter(RoutineCompletion::isCompleted)
                .map(RoutineCompletion::getDate)
                .collect(Collectors.toSet());

        List<LocalDate> sorted = completedDates.stream().sorted()
                .collect(Collectors.toList());

        if (sorted.isEmpty()) return 0;
        int longest = 1;
        int running = 1;
        for (int i = 1; i < sorted.size(); i++) {
            if (ChronoUnit.DAYS.between(sorted.get(i - 1), sorted.get(i)) == 1) {
                running++;
            } else {
                longest = Math.max(longest, running);
                running = 1;
            }
        }
        return Math.max(longest, running);
    }

    private String findBestWeek(List<RoutineCompletion> completions, List<Routine> routines) {
        Map<String, Integer> weekScores = new HashMap<>();
        for (RoutineCompletion c : completions) {
            if (!c.isCompleted()) continue;
            LocalDate date = c.getDate();
            LocalDate weekStart = date.with(DayOfWeek.MONDAY);
            String key = weekStart.toString();
            weekScores.merge(key, 1, Integer::sum);
        }
        return weekScores.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(e -> e.getKey())
                .orElse("N/A");
    }

    private String findBestMonth(List<RoutineCompletion> completions, List<Routine> routines) {
        Map<String, Integer> monthScores = new HashMap<>();
        for (RoutineCompletion c : completions) {
            if (!c.isCompleted()) continue;
            String key = YearMonth.from(c.getDate()).toString();
            monthScores.merge(key, 1, Integer::sum);
        }
        return monthScores.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(e -> e.getKey())
                .orElse("N/A");
    }

    private int calculateProductivityScore(double completionRate, int currentStreak, int longestStreak, int totalRoutines) {
        int score = 0;
        score += (int) Math.min(completionRate * 0.3, 30); // up to 30
        score += Math.min(currentStreak * 2, 20); // up to 20
        score += Math.min(longestStreak, 20); // up to 20
        score += Math.min(totalRoutines * 5, 15); // up to 15
        score += 15; // base
        return Math.min(score, 100);
    }

    private RoutineCompletionResponse toCompletionResponse(RoutineCompletion c) {
        return RoutineCompletionResponse.builder()
                .id(c.getId())
                .routineId(c.getRoutine().getId())
                .date(c.getDate())
                .completed(c.isCompleted())
                .skipped(c.isSkipped())
                .note(c.getNote())
                .completedAt(c.getCompletedAt() != null ? c.getCompletedAt().toString() : null)
                .build();
    }

    private static class UserReference extends com.lifetracker.entity.User {
        public static com.lifetracker.entity.User of(Long id) {
            com.lifetracker.entity.User u = new com.lifetracker.entity.User();
            u.setId(id);
            return u;
        }
    }
}
