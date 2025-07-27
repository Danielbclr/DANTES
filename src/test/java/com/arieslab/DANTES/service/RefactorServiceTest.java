package com.arieslab.DANTES.service;

import com.arieslab.DANTES.dto.RefactorResponse;
import com.arieslab.DANTES.enums.SmellType;
import com.arieslab.DANTES.refactor.ITestSmellRefactor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) // Enables Mockito annotations
class RefactorServiceTest {

    // Mocks for the dependencies (the strategies)
    @Mock
    private ITestSmellRefactor assertionRouletteStrategy;
    @Mock
    private ITestSmellRefactor emptyTestStrategy;

    // The class we are testing
    private RefactorService refactorService;

    @BeforeEach
    void setUp() {
        // Configure the behavior of our mock strategies
        when(assertionRouletteStrategy.getSmellType()).thenReturn(SmellType.ASSERTION_ROULETTE);
        when(emptyTestStrategy.getSmellType()).thenReturn(SmellType.EMPTY_TEST);

        // Manually construct the service with our list of mocks, simulating Spring's dependency injection.
        refactorService = new RefactorService(List.of(assertionRouletteStrategy, emptyTestStrategy));
    }

    @Test
    @DisplayName("Should execute the correct strategy when a match is found")
    void shouldExecuteCorrectStrategyOnMatch() {
        // ARRANGE
        String originalCode = "class Test { @Test void t() { assertEquals(1,1); } }";
        int lineOfSmell = 3;
        SmellType smellToFix = SmellType.ASSERTION_ROULETTE;

        // Define the expected response from the mock strategy
        RefactorResponse expectedResponse = new RefactorResponse("...refactored code...", List.of(3), "Success", 0);
        when(assertionRouletteStrategy.refactor(originalCode, lineOfSmell)).thenReturn(expectedResponse);

        // ACT: Call the service method we are testing.
        RefactorResponse actualResponse = refactorService.performRefactoring(originalCode, smellToFix, lineOfSmell);

        // ASSERT
        // 1. Check that the response from the service is the one we defined for our mock.
        assertNotNull(actualResponse);
        assertEquals(expectedResponse, actualResponse);

        // 2. Verify that the 'refactor' method on the correct strategy was called exactly once.
        verify(assertionRouletteStrategy, times(1)).refactor(originalCode, lineOfSmell);

        // 3. Verify that the other strategies were NOT called.
        verify(emptyTestStrategy, never()).refactor(anyString(), anyInt());
    }

    @Test
    @DisplayName("Should return a failure response when no matching strategy is found")
    void shouldReturnFailureResponseWhenNoStrategyFound() {
        // ARRANGE
        String originalCode = "class Test { ... }";
        int lineOfSmell = 5;
        // Use a smell type for which we have not provided a mock strategy.
        SmellType unhandledSmell = SmellType.CONDITIONAL_TEST_LOGIC;

        // ACT: Call the service method.
        RefactorResponse actualResponse = refactorService.performRefactoring(originalCode, unhandledSmell, lineOfSmell);

        // ASSERT
        // 1. Check that the response contains the original code and an error message.
        assertNotNull(actualResponse);
        assertEquals(originalCode, actualResponse.getRefactoredCode());
        assertTrue(actualResponse.getMessage().contains("No refactoring strategy available"));

        // 2. Verify that NO refactoring strategies were called.
        verify(assertionRouletteStrategy, never()).refactor(anyString(), anyInt());
        verify(emptyTestStrategy, never()).refactor(anyString(), anyInt());
    }
}