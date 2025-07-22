package com.arieslab.DANTES.refactor;


import com.arieslab.DANTES.dto.RefactorResponse;
import com.arieslab.DANTES.enums.SmellType;

import java.util.List;

/**
 * Defines the contract for all refactoring strategy components.
 *
 * Each implementation of this interface is responsible for refactoring
 * a single, specific type of test smell. This makes the system modular
 * and easy to extend.
 */
public interface ITestSmellRefactor {


    RefactorResponse refactor(String javaCode, int lineOfSmell);

    /**
     * Returns the specific type of smell that this strategy is responsible for refactoring.
     * This allows the RefactoringService to select the correct strategy for a given smell.
     *
     * @return The {@link SmellType} this strategy handles.
     */
    SmellType getSmellType();
}