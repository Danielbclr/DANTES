package com.arieslab.DANTES.controller;

import com.arieslab.DANTES.dto.TestSmell;
import com.arieslab.DANTES.service.DetectionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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

    // Use constructor injection - it's the recommended way to inject dependencies.
    @Autowired
    public DetectionController(DetectionService detectionService) {
        this.detectionService = detectionService;
    }

    /**
     * An example endpoint that returns a JSON object.
     * Spring Boot automatically converts the returned Map into a JSON response.
     *
     * @return A Map representing a JSON object.
     */
    @PostMapping("process-input")
    public ResponseEntity<Map<String, Object>> processInput(@RequestParam("inputText") String inputText) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 1. Delegate the complex logic to the service layer
            List<TestSmell> smells = detectionService.detectSmells(inputText);

            // 2. Build the response object. Spring will serialize this map to JSON.
            // NOTE: We are returning the list of smells directly, not as a string.
            // This is a cleaner approach than the original Node.js server.
            response.put("message", "Code processed successfully. " + smells.size() + " smells found.");
            response.put("retVal", smells); // 'retVal' matches the old key for easier frontend migration.

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