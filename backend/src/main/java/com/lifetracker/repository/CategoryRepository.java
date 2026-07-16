package com.lifetracker.repository;

import com.lifetracker.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByUserIdAndType(Long userId, Category.Type type);

    Optional<Category> findByIdAndUserId(Long id, Long userId);
}
