package com.arieslab.DANTES.controller;

import com.arieslab.DANTES.dto.RefactorResponse;
import com.arieslab.DANTES.enums.SmellType;
import com.arieslab.DANTES.service.RefactorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller that serves as the API endpoint for all code refactoring requests.
 * It receives the source code and details about a specific test smell, then delegates
 * the refactoring logic to the {@link RefactorService}.
 */
@RestController
@RequestMapping("/api/refactor")
public class RefactorController {

    private final RefactorService refactorService;

    /**
     * Constructs the controller with a dependency on the RefactorService.
     *
     * @param refactorService The service responsible for orchestrating the refactoring logic.
     *                        Spring injects this dependency automatically.
     */
    @Autowired
    public RefactorController(RefactorService refactorService) {
        this.refactorService = refactorService;
    }

    /**
     * Handles a POST request to refactor a specific test smell within a given Java code snippet.
     *
     * This endpoint is the primary entry point for applying automated refactorings. It uses the
     * "Strategy" pattern via the {@link RefactorService} to select and apply the correct fix.
     *
     * @param javaCode    The complete Java source code as a string, which needs to be refactored.
     * @param smellType   The type of the test smell to be fixed (e.g., ASSERTION_ROULETTE).
     *                    This is used to select the appropriate refactoring strategy.
     * @param lineOfSmell The line number where the smell was detected. The refactoring strategy
     *                    will use this to locate the specific code block to modify.
     * @return A {@link ResponseEntity} containing:
     *         <ul>
     *             <li><b>On success (200 OK):</b> A {@link RefactorResponse} object with the refactored code
     *                 and a list of changed line numbers.</li>
     *             <li><b>On failure (500 Internal Server Error):</b> A {@link RefactorResponse} object
     *                 containing the original code and an error message.</li>
     *         </ul>
     */
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
            // It's good practice to log the full exception for debugging purposes.
            e.printStackTrace();
            // Return a structured error response as well
            RefactorResponse errorResponse = new RefactorResponse(javaCode, List.of(), "An unexpected server error occurred.", 0);
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}