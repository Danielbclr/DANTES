package com.arieslab.DANTES.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;

/**
 * A dedicated DTO for returning the result of a refactoring operation.
 * This provides a clear, type-safe, and self-documenting API contract.
 */
@Getter
@RequiredArgsConstructor
public class RefactorResponse {
    /** The complete source code after the refactoring has been applied. */
    private final String refactoredCode;

    /** A list of line numbers that were modified or added during the refactor. */
    private final List<Integer> changedLines;

    /** An optional message describing the outcome of the operation. */
    private final String message;

    private final Integer lineChange;
}