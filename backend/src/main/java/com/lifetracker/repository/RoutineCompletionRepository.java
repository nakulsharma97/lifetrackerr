package com.lifetracker.repository;

import com.lifetracker.entity.RoutineCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoutineCompletionRepository extends JpaRepository<RoutineCompletion, Long> {

    Optional<RoutineCompletion> findByRoutineIdAndDate(Long routineId, LocalDate date);

    List<RoutineCompletion> findByRoutineIdOrderByDateDesc(Long routineId);

    List<RoutineCompletion> findByRoutineIdAndDateBetweenOrderByDateDesc(
            Long routineId, LocalDate from, LocalDate to);

    @Query("SELECT rc FROM RoutineCompletion rc WHERE rc.routine.user.id = ?1 " +
           "AND rc.date BETWEEN ?2 AND ?3 ORDER BY rc.date DESC")
    List<RoutineCompletion> findByUserIdAndDateBetween(
            Long userId, LocalDate from, LocalDate to);

    @Query("SELECT rc FROM RoutineCompletion rc WHERE rc.routine.user.id = ?1 " +
           "AND rc.date = ?2")
    List<RoutineCompletion> findByUserIdAndDate(Long userId, LocalDate date);

    long countByRoutineIdAndCompletedTrue(Long routineId);

    long countByRoutineIdAndCompletedFalseAndSkippedFalse(Long routineId);

    void deleteByRoutineId(Long routineId);
}
