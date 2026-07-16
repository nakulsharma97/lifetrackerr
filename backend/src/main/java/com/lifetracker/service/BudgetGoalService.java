package com.lifetracker.service;

import com.lifetracker.dto.BudgetGoalRequest;
import com.lifetracker.dto.BudgetGoalResponse;
import com.lifetracker.entity.*;
import com.lifetracker.repository.BudgetGoalRepository;
import com.lifetracker.repository.CategoryRepository;
import com.lifetracker.repository.ExpenseRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BudgetGoalService {

    private final BudgetGoalRepository budgetGoalRepository;
    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;

    public List<BudgetGoalResponse> getCurrentBudgets(Long userId) {
        YearMonth current = YearMonth.now();
        return budgetGoalRepository.findByUserIdAndYearMonth(userId, current)
                .stream()
                .map(bg -> buildResponse(bg, userId))
                .collect(Collectors.toList());
    }

    public List<BudgetGoalResponse> getBudgetsForMonth(Long userId, YearMonth yearMonth) {
        return budgetGoalRepository.findByUserIdAndYearMonth(userId, yearMonth)
                .stream()
                .map(bg -> buildResponse(bg, userId))
                .collect(Collectors.toList());
    }

    public BudgetGoalResponse createOrUpdate(Long userId, BudgetGoalRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        YearMonth yearMonth = request.getYearMonth() != null
                ? YearMonth.parse(request.getYearMonth())
                : YearMonth.now();

        // Upsert: find existing budget for this user + category + month
        BudgetGoal budgetGoal = budgetGoalRepository
                .findByUserIdAndCategoryIdAndYearMonth(userId, request.getCategoryId(), yearMonth)
                .orElse(BudgetGoal.builder()
                        .category(category)
                        .user(UserReference.of(userId))
                        .yearMonth(yearMonth)
                        .build());

        budgetGoal.setBudgetAmount(request.getBudgetAmount());
        budgetGoal.setActive(request.isActive());
        budgetGoal = budgetGoalRepository.save(budgetGoal);

        return buildResponse(budgetGoal, userId);
    }

    public void delete(Long userId, Long id) {
        BudgetGoal bg = budgetGoalRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new EntityNotFoundException("Budget goal not found"));
        budgetGoalRepository.delete(bg);
    }

    private BudgetGoalResponse buildResponse(BudgetGoal bg, Long userId) {
        // Calculate spent amount for this category in the current month
        YearMonth ym = bg.getYearMonth();
        LocalDate from = ym.atDay(1);
        LocalDate to = ym.atEndOfMonth();

        List<Expense> expenses = expenseRepository
                .findByUserIdAndCategoryIdAndDateBetweenOrderByDateDesc(
                        userId, bg.getCategory().getId(), from, to);

        BigDecimal spent = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = bg.getBudgetAmount().subtract(spent);
        double spentPercentage = bg.getBudgetAmount().compareTo(BigDecimal.ZERO) > 0
                ? spent.divide(bg.getBudgetAmount(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(1, RoundingMode.HALF_UP)
                        .doubleValue()
                : 0;

        return BudgetGoalResponse.builder()
                .id(bg.getId())
                .categoryId(bg.getCategory().getId())
                .categoryName(bg.getCategory().getName())
                .budgetAmount(bg.getBudgetAmount())
                .spentAmount(spent)
                .remainingAmount(remaining)
                .spentPercentage(spentPercentage)
                .yearMonth(ym.toString())
                .active(bg.isActive())
                .exceeded(spent.compareTo(bg.getBudgetAmount()) > 0)
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
