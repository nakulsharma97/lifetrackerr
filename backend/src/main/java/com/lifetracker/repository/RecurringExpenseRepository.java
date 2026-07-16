package com.lifetracker.repository;

import com.lifetracker.entity.RecurringExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecurringExpenseRepository extends JpaRepository<RecurringExpense, Long> {

    List<RecurringExpense> findByUserId(Long userId);

    Optional<RecurringExpense> findByIdAndUserId(Long id, Long userId);

    List<RecurringExpense> findByActiveTrue();
}
