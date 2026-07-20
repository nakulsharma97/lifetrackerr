package com.lifetracker.service;

import com.lifetracker.dto.*;
import com.lifetracker.entity.Category;
import com.lifetracker.entity.Expense;
import com.lifetracker.repository.CategoryRepository;
import com.lifetracker.repository.ExpenseRepository;
import com.lifetracker.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<ExpenseResponse> getExpenses(Long userId, LocalDate from, LocalDate to, Long categoryId) {
        List<Expense> expenses;
        if (categoryId != null) {
            expenses = expenseRepository
                    .findByUserIdAndCategoryIdAndDateBetweenOrderByDateDesc(userId, categoryId, from, to);
        } else {
            expenses = expenseRepository.findByUserIdAndDateBetweenOrderByDateDesc(userId, from, to);
        }
        return expenses.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ExpenseResponse createExpense(Long userId, ExpenseRequest request) {
        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        Expense expense = Expense.builder()
                .amount(request.getAmount())
                .description(request.getDescription())
                .date(request.getDate())
                .category(category)
                .user(userRepository.getReferenceById(userId))
                .build();

        expense = expenseRepository.save(expense);
        return toResponse(expense);
    }

    public ExpenseResponse updateExpense(Long userId, Long expenseId, ExpenseRequest request) {
        Expense expense = expenseRepository.findByIdAndUserId(expenseId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found"));

        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                .orElseThrow(() -> new EntityNotFoundException("Category not found"));

        expense.setAmount(request.getAmount());
        expense.setDescription(request.getDescription());
        expense.setDate(request.getDate());
        expense.setCategory(category);

        expense = expenseRepository.save(expense);
        return toResponse(expense);
    }

    public void deleteExpense(Long userId, Long expenseId) {
        Expense expense = expenseRepository.findByIdAndUserId(expenseId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Expense not found"));
        expenseRepository.delete(expense);
    }

    public ExpenseSummaryResponse getMonthlySummary(Long userId) {
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        List<Expense> expenses = expenseRepository
                .findByUserIdAndDateBetween(userId, startOfMonth, endOfMonth);

        BigDecimal totalAmount = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<Long, List<Expense>> grouped = expenses.stream()
                .collect(Collectors.groupingBy(e -> e.getCategory().getId()));

        List<ExpenseSummaryItem> breakdown = grouped.entrySet().stream()
                .map(entry -> {
                    Long catId = entry.getKey();
                    List<Expense> catExpenses = entry.getValue();
                    BigDecimal catTotal = catExpenses.stream()
                            .map(Expense::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    double percentage = totalAmount.compareTo(BigDecimal.ZERO) > 0
                            ? catTotal.divide(totalAmount, 4, RoundingMode.HALF_UP)
                                    .multiply(BigDecimal.valueOf(100))
                                    .setScale(1, RoundingMode.HALF_UP)
                                    .doubleValue()
                            : 0.0;

                    return ExpenseSummaryItem.builder()
                            .categoryId(catId)
                            .categoryName(catExpenses.get(0).getCategory().getName())
                            .total(catTotal)
                            .percentage(percentage)
                            .build();
                })
                .collect(Collectors.toList());

        return ExpenseSummaryResponse.builder()
                .totalAmount(totalAmount)
                .transactionCount(expenses.size())
                .breakdown(breakdown)
                .build();
    }

    private ExpenseResponse toResponse(Expense expense) {
        return ExpenseResponse.builder()
                .id(expense.getId())
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .date(expense.getDate())
                .categoryId(expense.getCategory().getId())
                .categoryName(expense.getCategory().getName())
                .build();
    }
}
