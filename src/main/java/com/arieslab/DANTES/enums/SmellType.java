package com.arieslab.DANTES.enums;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * A type-safe enum representing all detectable test smells.
 * It holds all relevant metadata, allowing the backend to send a rich object
 * to the frontend, which simplifies the client-side logic.
 */
@Getter
@RequiredArgsConstructor
@JsonFormat(shape = JsonFormat.Shape.OBJECT) // Tells Jackson to serialize the whole enum object
public enum SmellType {

    ASSERTION_ROULETTE(
            "Assertion Roulette",
            "Add Assertion Explanation",
            "assertion-roulette",
            "Multiple unexplained assertions in a test method hinder readability and understanding, making test failures unclear."
    ),
    CONSTRUCTOR_INITIALIZATION(
            "Constructor Initialization",
            "Use @BeforeEach",
            "constructor-initialization",
            "Test suites should avoid using constructors; fields should be initialized in a setUp()/@BeforeEach method."
    ),
    EMPTY_TEST(
            "Empty Test",
            "Add Implementation",
            "empty-test",
            "Empty test methods pose risks; JUnit passes them, potentially masking behavior-breaking changes in production classes."
    );
    // ... Add all other smell types here following the same pattern

    private final String displayName;
    private final String refactorAction;
    private final String endpointSlug;
    private final String description;

    // This allows Jackson to find an enum by its displayName if needed, though not required for serialization.
    public static SmellType fromDisplayName(String name) {
        for (SmellType smell : SmellType.values()) {
            if (smell.displayName.equalsIgnoreCase(name)) {
                return smell;
            }
        }
        return null;
    }
}