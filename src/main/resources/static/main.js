import * as api from './js/apiService.js';
import * as ui from './js/uiManager.js';

/**
 * This is the main application controller. It manages the application state
 * and orchestrates the flow of data between the API service and the UI manager.
 */
document.addEventListener('DOMContentLoaded', () => {

    // The single source of truth for the application's data.
    const state = {
        testSmells: [],
        textResources: {},
        originalCode: "",
        originalHighlightedLines: [],
        refactoredCode: "",
        refactoredLines: []
    };

    /**
     * Handles the form submission to detect test smells.
     */
    async function handleDetectSmells(event) {
        event.preventDefault();

        const javaCode = ui.ui.inputText.value;
        if (!javaCode.trim()) {
            ui.setResponseMessage(state.textResources.errorNoCode || "Please enter Java code to analyze.");
            return;
        }

        state.originalCode = javaCode;
        ui.resetUI();
        ui.displayOriginalCode(state.originalCode);
        ui.setResponseMessage(state.textResources.processing || "Analyzing code...");

        try {
            const data = await api.detectSmells(javaCode);
            state.testSmells = (data.retVal.detectedSmells || []).map(smell => ({
                ...smell,
                isRefactored: false
            }));

            state.originalHighlightedLines = data.retVal.highlightedLines || [];
            state.refactoredLines = [];
            state.refactoredCode = data.retVal.refactoredCode || "";
            ui.displayRefactoredCode(state.refactoredCode, state.refactoredLines);

            updateDetectionMessage();
            renderSmellList();

        } catch (error) {
            console.error('Error:', error);
            ui.setResponseMessage(state.textResources.errorProcessing || "An error occurred during processing.");
        }
    }

    function updateSmellPosition(lineBegin, lineChange) {
        for(let smell of state.testSmells) {
            if(smell.actualLine >= lineBegin) {
                smell.actualLine += lineChange;
            }
        }

        for (let i of state.refactoredLines) {
            if (i >= lineBegin) {
                i += lineChange;
            }
        }
    }


    /**
     * Handles the click on a "Refactor" button. This function is passed as a
     * callback to the uiManager, which attaches it to the buttons.
     * @param {object} smell - The smell object to be refactored.
     * @param {HTMLElement} button - The button element that was clicked.
     */
    async function handleRefactorClick(smell, button) {
        button.disabled = true;
        button.textContent = state.textResources.refactoring || "Refactoring...";

        try {
            const data = await api.performRefactor(state.refactoredCode, smell);


            state.refactoredCode = data.refactoredCode;
            const lineBegin = data.changedLines[0];
            updateSmellPosition(lineBegin, data.lineChange);
            state.refactoredLines.push(...data.changedLines);
            ui.displayRefactoredCode(state.refactoredCode, state.refactoredLines);

            const smellToUpdate = state.testSmells.find(s => s.actualLine === smell.actualLine && s.type === smell.type);
            if (smellToUpdate) {
                smellToUpdate.isRefactored = true;
            }

            renderSmellList();

        } catch (error) {
            console.error("Refactoring failed:", error);
            alert(state.textResources.refactorError || "Refactoring failed. See console for details.");
            renderSmellList();
        }
    }

    /**
     * Handles sorting the list of test smells based on user selection.
     */
    function handleSortChange() {
        if (state.testSmells.length === 0) return;

        const sortBy = ui.ui.sortOptions.value;
        state.testSmells.sort((a, b) => {
            if (sortBy === 'line') {
                return a.lineBegin - b.lineBegin;
            }
            // Default to sorting by smell name
            const nameA = (state.textResources[a.type] || {}).displayName || a.type;
            const nameB = (state.textResources[b.type] || {}).displayName || b.type;
            return nameA.localeCompare(nameB);
        });

        renderSmellList();
    }

    /**
     * Handles loading a file from the user's machine into the text area.
     */
    function handleFileLoad() {
        const file = ui.ui.fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            ui.setInputText(event.target.result);
        };
        reader.readAsText(file);
        ui.ui.fileInput.value = ""; // Reset for next upload
    }

    /**
     * A central function to render the smell list. It gets all necessary data
     * from the state and passes it to the UI manager.
     */
    function renderSmellList() {
        ui.renderSmellList(state.testSmells, state.textResources, state.originalHighlightedLines, handleRefactorClick);
    }

    /**
     * Updates the main response message based on the number of smells found.
     */
    function updateDetectionMessage() {
        const smellCount = state.testSmells.length;
        let message = "";
        if (smellCount === 0) {
            message = state.textResources.detectionSuccessNone;
        } else if (smellCount === 1) {
            message = state.textResources.detectionSuccessOne;
        } else {
            message = state.textResources.detectionSuccessOther.replace('{count}', smellCount);
        }
        ui.setResponseMessage(message);
    }

    /**
     * Callback for the LanguageManager to update text and re-render the UI.
     */
    function onLanguageUpdate() {
        state.textResources = window.LanguageManager.getTextResources();
        if (state.originalCode) {
            updateDetectionMessage();
            renderSmellList();
        }
    }

    /**
     * Attaches all the event listeners to the DOM elements.
     */
    function initializeEventListeners() {
        ui.ui.form.addEventListener('submit', handleDetectSmells);
        ui.ui.fileInput.addEventListener('change', handleFileLoad);
        ui.ui.sortOptions.addEventListener('change', handleSortChange);
    }

    /**
     * Initializes the application.
     */
    function initializeApp() {
        window.LanguageManager.init(onLanguageUpdate);
        initializeEventListeners();
    }

    initializeApp();
});