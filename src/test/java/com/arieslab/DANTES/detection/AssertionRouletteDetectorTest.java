package com.arieslab.DANTES.detection;

import com.arieslab.DANTES.dto.TestSmell;
import com.arieslab.DANTES.enums.SmellType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AssertionRouletteDetectorTest {

    private AssertionRouletteDetector detector;

    @BeforeEach
    void setUp() {
        // Instantiate a fresh detector for each test to ensure isolation.
        detector = new AssertionRouletteDetector();
    }

    @Test
    @DisplayName("Should detect Assertion Roulette when an assertion is missing a message")
    void shouldDetectSmellWhenAssertionIsMissingMessage() {
        // ARRANGE: A test method with an assertEquals call that has no message.
        String javaCode = """
            import org.junit.jupiter.api.Test;
            import static org.junit.jupiter.api.Assertions.assertEquals;

            class MyTest {
                @Test
                void testMethodWithSmell() {
                    String expected = "hello";
                    String actual = "world";
                    assertEquals(expected, actual); // This is the smell
                }
            }
            """;

        // ACT: Run the detector on the code.
        List<TestSmell> smells = detector.findSmells(javaCode);

        // ASSERT: Verify that exactly one smell was found.
        assertNotNull(smells);
        assertEquals(1, smells.size());

        TestSmell foundSmell = smells.get(0);
        assertEquals(SmellType.ASSERTION_ROULETTE, foundSmell.getType());
        assertEquals("testMethodWithSmell()", foundSmell.getMethod());
        assertEquals(9, foundSmell.getLine()); // Check the line number
    }

    @Test
    @DisplayName("Should NOT detect a smell when an assertion has a message")
    void shouldNotDetectSmellWhenAssertionHasMessage() {
        // ARRANGE: A test method with a proper assertion that includes a message.
        String javaCode = """
            import org.junit.jupiter.api.Test;
            import static org.junit.jupiter.api.Assertions.assertEquals;

            class MyTest {
                @Test
                void testMethodWithoutSmell() {
                    assertEquals(1, 2, "This assertion has a message and is not a smell.");
                }
            }
            """;

        // ACT: Run the detector.
        List<TestSmell> smells = detector.findSmells(javaCode);

        // ASSERT: Verify that no smells were found.
        assertNotNull(smells);
        assertTrue(smells.isEmpty());
    }

    @Test
    @DisplayName("Should NOT detect a smell in a method without a @Test annotation")
    void shouldNotDetectSmellInNonTestMethod() {
        // ARRANGE: A regular method (no @Test) containing a "bad" assertion.
        String javaCode = """
            import static org.junit.jupiter.api.Assertions.assertEquals;

            class MyClass {
                void regularMethod() {
                    // This assertion would be a smell if it were in a test method.
                    assertEquals(1, 2);
                }
            }
            """;

        // ACT: Run the detector.
        List<TestSmell> smells = detector.findSmells(javaCode);

        // ASSERT: Verify no smells are found because the visitor ignores non-test methods.
        assertNotNull(smells);
        assertTrue(smells.isEmpty());
    }

    @Test
    @DisplayName("Should handle empty or invalid code gracefully")
    void shouldHandleInvalidCodeWithoutCrashing() {
        // ARRANGE: Invalid and empty code strings.
        String invalidCode = "public class NotJava {";
        String emptyCode = "";

        // ACT & ASSERT: Ensure no exceptions are thrown and the result is an empty list.
        assertDoesNotThrow(() -> {
            List<TestSmell> smells1 = detector.findSmells(invalidCode);
            assertTrue(smells1.isEmpty());

            List<TestSmell> smells2 = detector.findSmells(emptyCode);
            assertTrue(smells2.isEmpty());
        });
    }

    @Test
    @DisplayName("Should detect multiple smells in a single method")
    void shouldDetectMultipleSmells() {
        // ARRANGE: A test method with two problematic assertions.
        String javaCode = """
            import org.junit.jupiter.api.Test;
            import static org.junit.jupiter.api.Assertions.*;

            class MyTest {
                @Test
                void testWithMultipleSmells() {
                    assertTrue(false); // Smell 1
                    assertNull(new Object()); // Smell 2
                }
            }
            """;

        // ACT: Run the detector.
        List<TestSmell> smells = detector.findSmells(javaCode);

        // ASSERT: Verify that two smells were detected.
        assertNotNull(smells);
        assertEquals(2, smells.size());
        assertEquals(7, smells.get(0).getLine());
        assertEquals(8, smells.get(1).getLine());
    }
}