package com.lifetracker.service;

import com.lifetracker.dto.CategoryResponse;
import com.lifetracker.entity.Category;
import com.lifetracker.repository.CategoryRepository;
import com.lifetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<CategoryResponse> getCategoriesByType(Long userId, String type) {
        Category.Type categoryType = Category.Type.valueOf(type.toUpperCase());
        return categoryRepository.findByUserIdAndType(userId, categoryType)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse createDefaultExpenseCategory(Long userId) {
        Category category = Category.builder()
                .name("General")
                .type(Category.Type.EXPENSE)
                .user(userRepository.getReferenceById(userId))
                .build();
        category = categoryRepository.save(category);
        return toResponse(category);
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType().name())
                .build();
    }
}
