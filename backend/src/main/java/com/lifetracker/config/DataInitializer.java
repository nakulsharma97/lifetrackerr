package com.lifetracker.config;

import com.lifetracker.entity.Category;
import com.lifetracker.entity.User;
import com.lifetracker.repository.CategoryRepository;
import com.lifetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create demo user if not exists
        if (!userRepository.existsByUsername("demo")) {
            User demoUser = User.builder()
                    .username("demo")
                    .email("demo@lifetracker.app")
                    .passwordHash(passwordEncoder.encode("demo123"))
                    .build();
            demoUser = userRepository.save(demoUser);

            // Seed expense categories
            String[] expenseCategories = {"General", "Food & Dining", "Transport", "Utilities", "Entertainment"};
            for (String name : expenseCategories) {
                Category category = Category.builder()
                        .name(name)
                        .type(Category.Type.EXPENSE)
                        .user(demoUser)
                        .build();
                categoryRepository.save(category);
            }

            // Seed habit categories
            String[] habitCategories = {"Health", "Learning", "Productivity"};
            for (String name : habitCategories) {
                Category category = Category.builder()
                        .name(name)
                        .type(Category.Type.HABIT)
                        .user(demoUser)
                        .build();
                categoryRepository.save(category);
            }

            System.out.println("✅ Demo user created: demo / demo123");
        }
    }
}
