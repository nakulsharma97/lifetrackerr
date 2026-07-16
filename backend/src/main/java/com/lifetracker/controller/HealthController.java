package com.lifetracker.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @Value("${spring.application.name:lifetracker}")
    private String appName;

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", appName,
                "profile", activeProfile,
                "timestamp", Instant.now().toString()
        ));
    }

    @GetMapping("/version")
    public ResponseEntity<Map<String, Object>> version() {
        return ResponseEntity.ok(Map.of(
                "version", "1.0.0",
                "springBootVersion", org.springframework.boot.SpringBootVersion.getVersion(),
                "javaVersion", System.getProperty("java.version")
        ));
    }
}
