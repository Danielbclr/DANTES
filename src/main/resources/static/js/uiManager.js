/**
 * This module is responsible for all direct DOM manipulation.
 * It receives data and instructions and updates the UI accordingly,
 * but does not contain any application state or business logic.
 */

// Centralized object for all UI element queries
export const ui = {
    form: document.getElementById('myForm'),
    inputText: document.getElementById('inputText'),
    originalCodeContainer: document.getElementById('originalCode'),
    originalCodePre: document.getElementById('originalCodePre'),
    refactoredCodePre: document.getElementById('refactoredCodePre'),
    refactoredCodeContainer: document.getElementById('refactoredCode'),
    responseDiv: document.getElementById('response'),
    testSmellList: document.getElementById('testSmellsList'),
    sortOptions: document.getElementById('sortOptions'),
    fileInput: document.getElementById('fileInput'),
};

/**
 * Resets the UI to its initial state before a new detection.
 */
export function resetUI() {
    ui.sortOptions.value = "testSmell";
    ui.testSmellList.innerHTML = "";
    ui.refactoredCodeContainer.textContent = ""; // Use textContent to clear
    ui.originalCodePre.setAttribute('data-line', "");
    ui.refactoredCodePre.setAttribute('data-line', "");
    ui.responseDiv.textContent = "";
    ui.testSmellList.classList.remove("smells-list-refactored");
}

/**
 * Displays a success message when no test smells are found.
 * @param {object} textResources - The localized text strings.
 */
function showSuccessMessage(textResources) {
    const successHTML = `
        <a style="color: var(--color-primary);font-size: 20px;">${textResources.successMessage}</a>
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 30 30" style="fill: var(--color-primary);">
            <path d="M 27.5 7.53125 L 24.464844 4.542969 C 24.15625 4.238281 23.65625 4.238281 23.347656 4.542969 L 11.035156 16.667969 L 6.824219 12.523438 C 6.527344 12.230469 6 12.230469 5.703125 12.523438 L 2.640625 15.539062 C 2.332031 15.84375 2.332031 16.335938 2.640625 16.640625 L 10.445312 24.324219 C 10.59375 24.472656 10.796875 24.554688 11.007812 24.554688 C 11.214844 24.554688 11.417969 24.472656 11.566406 24.324219 L 27.5 8.632812 C 27.648438 8.488281 27.734375 8.289062 27.734375 8.082031 C 27.734375 7.875 27.648438 7.679688 27.5 7.53125 Z"/>
        </svg>
    `;
    ui.testSmellList.innerHTML = successHTML;
    ui.testSmellList.classList.add("smells-list-refactored");
}

/**
 * Renders the list of detected test smells.
 * @param {Array<object>} testSmells - The list of smell objects.
 * @param {object} textResources - The localized text strings.
 * @param {Function} onRefactorClick - The callback function to execute when a refactor button is clicked.
 */
export function renderSmellList(testSmells, textResources, onRefactorClick) {
     ui.testSmellList.innerHTML = "";

     const linesWithSmells = testSmells.map(smell => `${smell.lineBegin}-${smell.lineEnd}`);
     ui.originalCodePre.setAttribute('data-line', linesWithSmells.join(','));

     if (testSmells.length === 0) {
         showSuccessMessage(textResources);
     } else {
         testSmells.forEach(smell => {
             const smellElement = createTestSmellElement(smell, textResources, onRefactorClick);
             ui.testSmellList.appendChild(smellElement);
         });
         ui.testSmellList.classList.remove("smells-list-refactored");
     }

     Prism.highlightElement(ui.originalCodeContainer);
}

/**
 * Creates a single list item element for a test smell.
 * @param {object} smell - The smell object.
 * @param {object} textResources - The localized text strings.
 * @param {Function} onRefactorClick - The callback for the refactor button.
 * @returns {HTMLElement} The created list item element.
 */
function createTestSmellElement(smell, textResources, onRefactorClick) {
    const lineDiv = document.createElement('li');
    lineDiv.className = 'line';

    const resources = textResources[smell.type] || {
        displayName: textResources.unknownSmell || smell.type,
        description: textResources.unknownSmellDescription,
        refactorAction: textResources.unknownSmellAction
    };

    const template = textResources.smellDescriptionTemplate || 'detected in method <a class="method">{method}</a> at line {line}.';
    const smellDetails = template
        .replace('{method}', smell.method)
        .replace('{line}', smell.lineBegin);

    const description = document.createElement('a');
    description.innerHTML = `
        <span class="popup">
            <a class="smell"><b>${resources.displayName}</b></a>
            <span class="popuptext">${resources.description}</span>
        </span>
        ${smellDetails}
    `;

    const button = document.createElement("button");
    if (smell.isRefactored) {
        button.className = "button-refactored";
        button.textContent = textResources.refactored;
        button.disabled = true;
    } else {
        button.className = "button";
        button.textContent = resources.refactorAction;
        button.onclick = () => onRefactorClick(smell, button);
    }

    lineDiv.appendChild(description);
    lineDiv.appendChild(button);
    return lineDiv;
}

/**
 * Updates the original code block with new content and highlights it.
 * @param {string} code - The Java code to display.
 */
export function displayOriginalCode(code) {
    ui.originalCodeContainer.textContent = code;
}

/**
 * Updates the refactored code block with new content and highlights it.
 * @param {string} code - The refactored code.
 * @param {Array<string>} changedLines - The lines that were changed.
 */
export function displayRefactoredCode(code, changedLines) {
    ui.refactoredCodeContainer.textContent = code;
    ui.refactoredCodePre.setAttribute('data-line', changedLines.join(','));
    Prism.highlightElement(ui.refactoredCodeContainer);
}

/**
 * Updates the text content of the main response message area.
 * @param {string} message - The message to display.
 */
export function setResponseMessage(message) {
    ui.responseDiv.textContent = message;
}

/**
 * Updates the content of the file input text area.
 * @param {string} content - The text content from the loaded file.
 */
export function setInputText(content) {
    ui.inputText.value = content;
}