package com.arieslab.DANTES.controller;

import com.arieslab.DANTES.dto.RefactorResponse; // Import the new DTO
import com.arieslab.DANTES.enums.SmellType;
import com.arieslab.DANTES.service.RefactorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/refactor")
public class RefactorController {

    private final RefactorService refactorService;

    @Autowired
    public RefactorController(RefactorService refactorService) {
        this.refactorService = refactorService;
    }

    @PostMapping
    public ResponseEntity<RefactorResponse> handleRefactor(
            @RequestParam("code") String javaCode,
            @RequestParam("smellType") SmellType smellType,
            @RequestParam("line") int lineOfSmell) {

        try {
            // The service now returns our clean DTO directly
            RefactorResponse response = refactorService.performRefactoring(javaCode, smellType, lineOfSmell);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            // Return a structured error response as well
            RefactorResponse errorResponse = new RefactorResponse(javaCode, List.of(), "An unexpected server error occurred.");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}