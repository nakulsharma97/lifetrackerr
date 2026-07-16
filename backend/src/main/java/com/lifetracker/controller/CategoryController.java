package com.lifetracker.controller;

import com.lifetracker.config.SecurityUtil;
import com.lifetracker.dto.CategoryResponse;
import com.lifetracker.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final SecurityUtil securityUtil;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories(
            @RequestParam(required = false) String type) {
        Long userId = securityUtil.getCurrentUserId();
        // If no type specified, default to EXPENSE
        String categoryType = type != null ? type : "EXPENSE";
        List<CategoryResponse> categories = categoryService.getCategoriesByType(userId, categoryType);
        return ResponseEntity.ok(categories);
    }
}
