package com.lifetracker.controller;

import com.lifetracker.config.SecurityUtil;
import com.lifetracker.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;
    private final SecurityUtil securityUtil;

    @GetMapping("/json")
    public ResponseEntity<Map<String, Object>> exportJson() {
        Long userId = securityUtil.getCurrentUserId();
        return ResponseEntity.ok(exportService.exportAllData(userId));
    }

    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadCsv(@RequestParam(defaultValue = "json") String format) {
        Long userId = securityUtil.getCurrentUserId();
        byte[] data;
        String filename;
        MediaType mediaType;

        if ("csv".equalsIgnoreCase(format)) {
            data = exportService.exportAsCsv(userId);
            filename = "lifetracker-export.csv";
            mediaType = MediaType.parseMediaType("text/csv");
        } else {
            data = exportService.exportAsJsonBytes(userId);
            filename = "lifetracker-export.json";
            mediaType = MediaType.APPLICATION_JSON;
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(mediaType)
                .body(data);
    }
}
