/**
 * A centralized dictionary for all UI text related to test smells.
 * This provides a single source of truth, making maintenance and
 * internationalization much easier.
 *
 * The keys (e.g., "ASSERTION_ROULETTE") match the enum 'name' property
 * sent from the backend, creating a clean and robust contract.
 */
export const UI_TEXT = {
    appTitle: "DANTES - Test Smell Detector",
    placeholder: "Insert your test code here...",
    detectButton: "Detect",
    uploadButton: "Upload a file",
    languageLabel: "Language:",
    analysisTitle: "Analysis result and refactoring:",
    sortSmell: "Order by Smell Type",
    sortLine: "Order by Position in Code",
    originalCode: "Original Code:",
    refactoredCode: "Refactored Code:",
    errorProcessing: "Error occurred while processing input. Check the console for details.",
    errorNoCode: "Please enter some Java code to analyze.",
    successMessage: "No test smells found!",
    refactoring: "Refactoring...",
    refactored: "Refactored!",
    refactorError: "An error occurred during refactoring. Check the console for details."
};
export const SMELL_TEXT_RESOURCES = {
    ASSERTION_ROULETTE: {
        displayName: "Assertion Roulette",
        refactorAction: "Add Assertion Explanation",
        description: "Multiple unexplained assertions in a test method hinder readability and understanding, making test failures unclear."
    },
    CONSTRUCTOR_INITIALIZATION: {
        displayName: "Constructor Initialization",
        refactorAction: "Use @BeforeEach",
        description: "Test suites should avoid using constructors; fields should be initialized in a setUp()/@BeforeEach method."
    },
    EMPTY_TEST: {
        displayName: "Empty Test",
        refactorAction: "Add Implementation",
        description: "Empty test methods pose risks; JUnit passes them, potentially masking behavior-breaking changes in production classes."
    },
    CONDITIONAL_TEST_LOGIC: {
        displayName: "Conditional Test Logic",
        refactorAction: "Extract 'then' to new test",
        description: "A test with conditional logic (if, for, while) can hide bugs. It should be split into simpler tests, each covering a single execution path."
    },
    // ... Add all other smell types here in the same format
    DEFAULT: {
        displayName: "Unknown Smell",
        refactorAction: "Refactor",
        description: "A test smell was detected. See documentation for more details."
    }
};