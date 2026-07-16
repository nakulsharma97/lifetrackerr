package com.lifetracker.service;

import com.lifetracker.dto.CategoryResponse;
import com.lifetracker.entity.Category;
import com.lifetracker.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryResponse> getCategoriesByType(Long userId, String type) {
        Category.Type categoryType = Category.Type.valueOf(type.toUpperCase());
        return categoryRepository.findByUserIdAndType(userId, categoryType)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CategoryResponse createDefaultExpenseCategory(Long userId) {
        // This will be called by the data initializer for new users
        Category category = Category.builder()
                .name("General")
                .type(Category.Type.EXPENSE)
                .user(UserReference.of(userId))
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

    /**
     * Minimal User reference for creating categories without loading full User entity.
     */
    private static class UserReference extends com.lifetracker.entity.User {
        public static com.lifetracker.entity.User of(Long id) {
            com.lifetracker.entity.User u = new com.lifetracker.entity.User();
            u.setId(id);
            return u;
        }
    }
}
