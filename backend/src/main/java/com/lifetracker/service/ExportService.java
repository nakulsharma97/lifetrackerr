package com.lifetracker.service;

import com.lifetracker.entity.Expense;
import com.lifetracker.entity.Habit;
import com.lifetracker.entity.HabitLog;
import com.lifetracker.repository.ExpenseRepository;
import com.lifetracker.repository.HabitLogRepository;
import com.lifetracker.repository.HabitRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final ExpenseRepository expenseRepository;
    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    public Map<String, Object> exportAllData(Long userId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("exportedAt", java.time.LocalDateTime.now().toString());
        data.put("version", "1.0");

        // Expenses
        List<Expense> expenses = expenseRepository.findByUserId(userId);
        data.put("expenses", expenses.stream().map(e -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", e.getId());
            m.put("amount", e.getAmount());
            m.put("description", e.getDescription());
            m.put("date", e.getDate().toString());
            m.put("category", e.getCategory().getName());
            return m;
        }).collect(Collectors.toList()));

        // Habits + logs
        List<Habit> habits = habitRepository.findByUserId(userId);
        data.put("habits", habits.stream().map(h -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", h.getId());
            m.put("name", h.getName());
            m.put("frequency", h.getFrequency().name());
            m.put("createdAt", h.getCreatedAt().toString());

            List<HabitLog> logs = habitLogRepository.findByHabitIdOrderByDateDesc(h.getId());
            m.put("logs", logs.stream().map(l -> {
                Map<String, Object> lm = new LinkedHashMap<>();
                lm.put("date", l.getDate().toString());
                lm.put("completed", l.isCompleted());
                lm.put("note", l.getNote());
                return lm;
            }).collect(Collectors.toList()));

            return m;
        }).collect(Collectors.toList()));

        return data;
    }

    public byte[] exportAsJsonBytes(Long userId) {
        try {
            return objectMapper.writerWithDefaultPrettyPrinter()
                    .writeValueAsBytes(exportAllData(userId));
        } catch (Exception e) {
            throw new RuntimeException("Failed to export data as JSON", e);
        }
    }

    public byte[] exportAsCsv(Long userId) {
        Map<String, Object> data = exportAllData(userId);
        StringBuilder sb = new StringBuilder();

        // Expenses CSV
        sb.append("=== EXPENSES ===\n");
        sb.append("ID,Amount,Description,Date,Category\n");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> expenses = (List<Map<String, Object>>) data.get("expenses");
        for (Map<String, Object> e : expenses) {
            sb.append(e.get("id")).append(",")
                    .append(e.get("amount")).append(",")
                    .append(escapeCsv((String) e.get("description"))).append(",")
                    .append(e.get("date")).append(",")
                    .append(escapeCsv((String) e.get("category"))).append("\n");
        }

        // Habits CSV
        sb.append("\n=== HABITS ===\n");
        sb.append("Habit ID,Habit Name,Frequency,Created At,Log Date,Completed,Note\n");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> habits = (List<Map<String, Object>>) data.get("habits");
        for (Map<String, Object> h : habits) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> logs = (List<Map<String, Object>>) h.get("logs");
            if (logs.isEmpty()) {
                sb.append(h.get("id")).append(",")
                        .append(escapeCsv((String) h.get("name"))).append(",")
                        .append(h.get("frequency")).append(",")
                        .append(h.get("createdAt")).append(",,,,\n");
            } else {
                for (Map<String, Object> l : logs) {
                    sb.append(h.get("id")).append(",")
                            .append(escapeCsv((String) h.get("name"))).append(",")
                            .append(h.get("frequency")).append(",")
                            .append(h.get("createdAt")).append(",")
                            .append(l.get("date")).append(",")
                            .append(l.get("completed")).append(",")
                            .append(escapeCsv((String) l.get("note"))).append("\n");
                }
            }
        }

        return sb.toString().getBytes();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
