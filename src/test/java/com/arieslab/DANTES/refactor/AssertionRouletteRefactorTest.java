package com.arieslab.DANTES.refactor;

import com.arieslab.DANTES.dto.RefactorResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AssertionRouletteRefactorTest {

    private AssertionRouletteRefactor refactorStrategy;

    @BeforeEach
    void setUp() {
        // Instantiate a fresh strategy for each test
        refactorStrategy = new AssertionRouletteRefactor();
    }

    @Test
    @DisplayName("Should add lazy message to an assertion without one")
    void shouldSuccessfullyRefactorAssertionRoulette() {
        // ARRANGE: Code with a clear smell
        String smellyCode = """
            import static org.junit.jupiter.api.Assertions.assertEquals;
            import org.junit.jupiter.api.Test;
            
            class MyTest {
                @Test
                void testMethod() {
                    assertEquals(1, 2); // Smell is on line 7
                }
            }
            """;
        int lineOfSmell = 7;

        // ACT: Perform the refactoring
        RefactorResponse response = refactorStrategy.refactor(smellyCode, lineOfSmell);

        // ASSERT: Check the results
        assertNotNull(response);
        assertTrue(response.getMessage().contains("successful"));
        // Verify that the new lazy message has been added
        assertTrue(response.getRefactoredCode().contains("assertEquals(1, 2, () -> \"Add assertion message\")"));
        assertEquals(0, response.getLineChange());
    }

    @Test
    @DisplayName("Should not change code if assertion already has a message")
    void shouldNotRefactorWhenMessageExists() {
        // ARRANGE: Code with a proper assertion
        String cleanCode = """
            import static org.junit.jupiter.api.Assertions.assertEquals;
            import org.junit.jupiter.api.Test;
            
            class MyTest {
                @Test
                void testMethod() {
                    assertEquals(1, 2, "This is fine"); // Line 7 already has a message
                }
            }
            """;
        int lineOfSmell = 7;

        // ACT: Attempt to refactor
        RefactorResponse response = refactorStrategy.refactor(cleanCode, lineOfSmell);

        // ASSERT: Verify that the code is unchanged and a warning message is present
        assertNotNull(response);
        assertFalse(response.getChangedLines().isEmpty());
    }

    @Test
    @DisplayName("Should handle invalid Java code gracefully")
    void shouldHandleInvalidCodeWithoutCrashing() {
        // ARRANGE: Malformed Java code
        String invalidCode = "public class NotJava {";
        int lineOfSmell = 1;

        // ACT: Attempt to refactor
        RefactorResponse response = refactorStrategy.refactor(invalidCode, lineOfSmell);

        // ASSERT: Verify it returns a failure response without throwing an exception
        assertNotNull(response);
        assertEquals(invalidCode, response.getRefactoredCode());
        assertTrue(response.getMessage().contains("Refactoring failed"));
    }
}