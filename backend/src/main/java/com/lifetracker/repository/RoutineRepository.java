package com.lifetracker.repository;

import com.lifetracker.entity.Routine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoutineRepository extends JpaRepository<Routine, Long> {

    List<Routine> findByUserId(Long userId);

    Optional<Routine> findByIdAndUserId(Long id, Long userId);

    List<Routine> findByUserIdAndActiveTrue(Long userId);

    @Query("SELECT r FROM Routine r WHERE r.user.id = ?1 AND r.active = true AND " +
           "(r.endDate IS NULL OR r.endDate >= ?2)")
    List<Routine> findActiveRoutinesForDate(Long userId, LocalDate date);
}
