package com.arieslab.DANTES.controller;

import com.arieslab.DANTES.dto.DetectionResponse;
import com.arieslab.DANTES.dto.TestSmell;
import com.arieslab.DANTES.service.DetectionService;
import com.github.javaparser.StaticJavaParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * This class handles web requests for Detecting test smells.
 */
@RestController
public class DetectionController {

    private final DetectionService detectionService;

    @Autowired
    public DetectionController(DetectionService detectionService) {
        this.detectionService = detectionService;
    }

    @PostMapping("process-input")
    public ResponseEntity<Map<String, Object>> processInput(@RequestParam("inputText") String inputText) {
        Map<String, Object> response = new HashMap<>();
        try {
            DetectionResponse retVal = detectionService.detectSmells(inputText);

            response.put("retVal", retVal);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // In case of an unexpected error in the service layer, return an error response.
            e.printStackTrace(); // It's good practice to log the error server-side.
            response.put("message", "An error occurred during analysis: " + e.getMessage());
            response.put("retVal", List.of()); // Return an empty list on error.
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}