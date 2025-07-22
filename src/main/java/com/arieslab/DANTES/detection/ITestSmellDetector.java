package com.arieslab.DANTES.detection;

import com.arieslab.DANTES.dto.TestSmell;
import com.arieslab.DANTES.enums.SmellType;

import java.util.List;

/**
 * Defines the contract for all test smell detector components.
 *
 * Any class that implements this interface can be automatically discovered
 * and used by the DetectionService to find a specific type of test smell.
 * This approach makes the system highly extensible.
 */
public interface ITestSmellDetector {

    /**
     * Analyzes the given Java source code to find instances of a specific test smell.
     *
     * This method should be stateless and thread-safe, meaning it should not
     * rely on or modify any class member variables to store its results.
     *
     * @param javaCode The complete Java source code as a string to be analyzed.
     * @return A list of {@link TestSmell} objects found in the code. If no smells
     *         are found, this method should return an empty list, never null.
     */
    List<TestSmell> findSmells(String javaCode);

    /**
     * Returns the specific type of smell that this detector is responsible for.
     * This can be used for logging, categorization, or other metadata purposes.
     *
     * @return A string representing the name of the test smell (e.g., "Assertion Roulette").
     */
    SmellType getSmellType();
}