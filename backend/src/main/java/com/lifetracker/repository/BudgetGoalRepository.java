package com.lifetracker.repository;

import com.lifetracker.entity.BudgetGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetGoalRepository extends JpaRepository<BudgetGoal, Long> {

    List<BudgetGoal> findByUserIdAndYearMonth(Long userId, YearMonth yearMonth);

    Optional<BudgetGoal> findByUserIdAndCategoryIdAndYearMonth(
            Long userId, Long categoryId, YearMonth yearMonth);

    Optional<BudgetGoal> findByIdAndUserId(Long id, Long userId);

    List<BudgetGoal> findByUserIdAndActiveTrue(Long userId);
}
