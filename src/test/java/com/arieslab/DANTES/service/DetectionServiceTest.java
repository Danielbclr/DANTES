package com.arieslab.DANTES.service;

import com.arieslab.DANTES.detection.ITestSmellDetector;
import com.arieslab.DANTES.dto.DetectionResponse;
import com.arieslab.DANTES.dto.TestSmell;
import com.arieslab.DANTES.enums.SmellType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DetectionServiceTest {

    @Mock
    private ITestSmellDetector mockDetector1;

    @Mock
    private ITestSmellDetector mockDetector2;

    private DetectionService detectionService;

    @BeforeEach
    void setUp() {
        detectionService = new DetectionService(List.of(mockDetector1, mockDetector2));
    }

    @Test
    @DisplayName("Should detect smells and correlate lines from original and parsed code")
    void shouldDetectAndCorrelateSmells() {
        // ARRANGE
        String originalCode = "class T{ @Test void t(){ assertTrue(true); } }";
        // This is what JavaParser will likely format the original code into.
        String parsedCode = """
            class T {

                @Test
                void t() {
                    assertTrue(true);
                }
            }""";

        // --- Mocking for the FIRST call to findSmellsInCode (with originalCode) ---
        TestSmell originalSmell = new TestSmell(SmellType.ASSERTION_ROULETTE, "t()", 1, 1, Set.of(1));
        when(mockDetector1.findSmells(originalCode)).thenReturn(List.of(originalSmell));

        // --- FIX: Mocking for the SECOND call to findSmellsInCode (with parsedCode) ---
        TestSmell parsedSmell = new TestSmell(SmellType.ASSERTION_ROULETTE, "t()", 1, 5, Set.of(5));
        when(mockDetector1.findSmells(parsedCode)).thenReturn(List.of(parsedSmell));
        when(mockDetector1.getSmellType()).thenReturn(SmellType.EMPTY_TEST); // Corrected smell type

        // Ensure the other mock always returns an empty list to avoid interference.
        when(mockDetector2.findSmells(anyString())).thenReturn(Collections.emptyList());

        // ACT
        DetectionResponse response = detectionService.detectSmells(originalCode);

        // ASSERT
        assertNotNull(response);
        assertEquals(1, response.getDetectedSmells().size());
        assertEquals(1, response.getHighlightedLines().size());
        assertTrue(response.getHighlightedLines().contains(1));

        TestSmell resultSmell = response.getDetectedSmells().get(0);
        assertEquals(1, resultSmell.getLine(), "The original line number should be preserved.");
        assertEquals(1, resultSmell.getActualLine(), "The actual line number should be updated from the parsed code.");
    }

    @Test
    @DisplayName("Should handle detector failure gracefully and return partial results")
    void shouldHandleDetectorException() {
        // ARRANGE
        // FIX: Use a syntactically valid, albeit simple, Java string to prevent a ParseProblemException.
        String validJavaCode = "class MyTest {}";

        // Simulate detector 1 throwing an error
        when(mockDetector1.findSmells(anyString())).thenThrow(new RuntimeException("Parser failed!"));
        when(mockDetector1.getSmellType()).thenReturn(SmellType.ASSERTION_ROULETTE);

        // Simulate detector 2 working correctly for both calls
        TestSmell smellFromDetector2 = new TestSmell(SmellType.EMPTY_TEST, "t2()", 5, 5, Set.of(5));
        when(mockDetector2.findSmells(anyString())).thenReturn(List.of(smellFromDetector2));

        // ACT
        DetectionResponse response = detectionService.detectSmells(validJavaCode);

        // ASSERT
        assertNotNull(response);
        assertEquals(1, response.getDetectedSmells().size());
        assertEquals(SmellType.EMPTY_TEST, response.getDetectedSmells().get(0).getType());
    }

    @Test
    @DisplayName("Should return an empty response when no detectors are configured")
    void shouldReturnEmptyResponseWithNoDetectors() {
        // ARRANGE
        DetectionService emptyService = new DetectionService(Collections.emptyList());
        String code = "class MyTest {}";

        // ACT
        DetectionResponse response = emptyService.detectSmells(code);

        // ASSERT
        assertNotNull(response);
        assertTrue(response.getDetectedSmells().isEmpty());
        assertTrue(response.getHighlightedLines().isEmpty());
    }
}