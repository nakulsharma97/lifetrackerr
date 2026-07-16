package com.lifetracker.repository;

import com.lifetracker.entity.HabitLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HabitLogRepository extends JpaRepository<HabitLog, Long> {

    List<HabitLog> findByHabitIdOrderByDateDesc(Long habitId);

    List<HabitLog> findByHabitIdAndDateBetweenOrderByDateDesc(
            Long habitId, LocalDate from, LocalDate to);

    Optional<HabitLog> findByHabitIdAndDate(Long habitId, LocalDate date);
}
