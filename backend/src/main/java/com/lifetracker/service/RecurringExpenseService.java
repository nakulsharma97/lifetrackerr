package com.lifetracker.service;

import com.lifetracker.dto.RecurringExpenseRequest;
import com.lifetracker.dto.RecurringExpenseResponse;
import com.lifetracker.entity.*;
import com.lifetracker.repository.CategoryRepository;
import com.lifetracker.repository.ExpenseRepository;
import com.lifetracker.repository.RecurringExpenseRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class RecurringExpenseService {

    private final RecurringExpenseRepository recurringExpenseRepository;
    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;

    public List<RecurringExpenseResponse> getAll(Long userId) {
        return recurringExpenseRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public RecurringExpenseResponse create(Long userId, RecurringExpenseRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        RecurringExpense re = RecurringExpense.builder()
                .name(request.getName())
                .amount(request.getAmount())
                .description(request.getDescription())
                .dayOfMonth(request.getDayOfMonth())
                .frequency(RecurringExpense.Frequency.valueOf(request.getFrequency()))
                .active(true)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .lastGenerated(LocalDate.now())
                .category(category)
                .user(UserReference.of(userId))
                .build();

        re = recurringExpenseRepository.save(re);
        return toResponse(re);
    }

    public RecurringExpenseResponse update(Long userId, Long id, RecurringExpenseRequest request) {
        RecurringExpense re = recurringExpenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Recurring expense not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        re.setName(request.getName());
        re.setAmount(request.getAmount());
        re.setDescription(request.getDescription());
        re.setDayOfMonth(request.getDayOfMonth());
        re.setFrequency(RecurringExpense.Frequency.valueOf(request.getFrequency()));
        re.setCategory(category);
        re.setStartDate(request.getStartDate());
        re.setEndDate(request.getEndDate());

        return toResponse(recurringExpenseRepository.save(re));
    }

    public void delete(Long userId, Long id) {
        RecurringExpense re = recurringExpenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Recurring expense not found"));
        recurringExpenseRepository.delete(re);
    }

    public RecurringExpenseResponse toggleActive(Long userId, Long id) {
        RecurringExpense re = recurringExpenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Recurring expense not found"));
        re.setActive(!re.isActive());
        return toResponse(recurringExpenseRepository.save(re));
    }

    /**
     * Scheduled task: runs daily at 6:00 AM, checks all active recurring expenses
     * and creates expense entries for those due today.
     */
    @Scheduled(cron = "0 0 6 * * *")
    public void processRecurringExpenses() {
        LocalDate today = LocalDate.now();
        List<RecurringExpense> activeExpenses = recurringExpenseRepository.findByActiveTrue();

        for (RecurringExpense re : activeExpenses) {
            try {
                if (shouldGenerate(re, today)) {
                    Expense expense = Expense.builder()
                            .amount(re.getAmount())
                            .description(re.getName() + (re.getDescription() != null ? " - " + re.getDescription() : ""))
                            .date(today)
                            .category(re.getCategory())
                            .user(re.getUser())
                            .build();
                    expenseRepository.save(expense);
                    re.setLastGenerated(today);
                    recurringExpenseRepository.save(re);
                    log.info("Auto-created recurring expense '{}' for user {}", re.getName(), re.getUser().getId());
                }
            } catch (Exception e) {
                log.error("Failed to process recurring expense {}: {}", re.getId(), e.getMessage());
            }
        }
    }

    private boolean shouldGenerate(RecurringExpense re, LocalDate today) {
        if (re.getEndDate() != null && today.isAfter(re.getEndDate())) {
            return false;
        }
        if (today.isBefore(re.getStartDate())) {
            return false;
        }

        LocalDate lastGen = re.getLastGenerated();
        if (lastGen != null && lastGen.equals(today)) {
            return false; // Already generated today
        }

        return switch (re.getFrequency()) {
            case MONTHLY -> today.getDayOfMonth() == re.getDayOfMonth();
            case WEEKLY -> today.getDayOfWeek().getValue() == (re.getDayOfMonth() % 7); // 1=Mon...7=Sun
            case YEARLY -> today.getDayOfYear() == re.getDayOfMonth();
        };
    }

    private RecurringExpenseResponse toResponse(RecurringExpense re) {
        return RecurringExpenseResponse.builder()
                .id(re.getId())
                .name(re.getName())
                .amount(re.getAmount())
                .description(re.getDescription())
                .dayOfMonth(re.getDayOfMonth())
                .frequency(re.getFrequency().name())
                .active(re.isActive())
                .startDate(re.getStartDate())
                .endDate(re.getEndDate())
                .lastGenerated(re.getLastGenerated())
                .categoryId(re.getCategory().getId())
                .categoryName(re.getCategory().getName())
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
