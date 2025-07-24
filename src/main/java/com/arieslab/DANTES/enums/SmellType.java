package com.arieslab.DANTES.enums;

/**
 * A type-safe enum representing all detectable test smells.
 *
 * The backend is only concerned with the type, not its presentation.
 * Jackson will serialize these to their string names by default (e.g., "ASSERTION_ROULETTE"),
 * which is exactly what the frontend now uses as a key.
 */
public enum SmellType {
    ASSERTION_ROULETTE,
    CONSTRUCTOR_INITIALIZATION,
    EMPTY_TEST,
    CONDITIONAL_TEST_LOGIC
    // ... Add all other smell types here
}