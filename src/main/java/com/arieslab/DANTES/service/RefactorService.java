package com.arieslab.DANTES.service;

import com.arieslab.DANTES.dto.RefactorResponse; // Import the DTO
import com.arieslab.DANTES.enums.SmellType;
import com.arieslab.DANTES.refactor.ITestSmellRefactor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * The central service for orchestrating all code refactoring operations.
 * It uses the Strategy Pattern to delegate refactoring tasks to specialized
 * components, making the system modular and extensible.
 */
@Service
public class RefactorService {

    /**
     * A map where the key is the SmellType and the value is the specific
     * refactoring strategy that can fix it. Spring populates this map automatically.
     */
    private final Map<SmellType, ITestSmellRefactor> refactoringStrategies;

    /**
     * Uses constructor injection to receive all available ITestSmellRefactor beans.
     * It then converts the list of strategies into a Map for efficient lookups.
     *
     * @param strategies A list of all beans implementing ITestSmellRefactor,
     *                   provided by Spring's dependency injection.
     */
    @Autowired
    public RefactorService(List<ITestSmellRefactor> strategies) {
        this.refactoringStrategies = strategies.stream()
                .collect(Collectors.toUnmodifiableMap(ITestSmellRefactor::getSmellType, Function.identity()));
        System.out.println("Loaded " + this.refactoringStrategies.size() + " refactoring strategies.");
    }

    /**
     * Selects and executes the appropriate refactoring strategy for a given smell.
     *
     * @param javaCode    The full Java source code to be refactored.
     * @param smellType   The type of smell to fix.
     * @param lineOfSmell The line number where the smell was detected.
     * @return A {@link RefactorResponse} object containing the refactored code and metadata.
     */
    public RefactorResponse performRefactoring(String javaCode, SmellType smellType, int lineOfSmell) {
        ITestSmellRefactor strategy = refactoringStrategies.get(smellType);

        if (strategy == null) {
            System.err.println("No refactoring strategy found for smell type: " + smellType);
            // On failure, return a response with the original code and a failure message.
            return new RefactorResponse(javaCode, List.of(), "No refactoring strategy available for this smell.");
        }

        System.out.println("Executing refactoring strategy for: " + smellType);
        // The strategy already returns the correct DTO type, so we just pass it through.
        return strategy.refactor(javaCode, lineOfSmell);
    }
}