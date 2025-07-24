import { SMELL_TEXT_RESOURCES } from './ui-text-constants.js';

document.addEventListener('DOMContentLoaded', () => {
    const state = {
        testSmells: [],
    };

    const ui = {
        form: document.getElementById('myForm'),
        inputText: document.getElementById('inputText'),
        originalCodeContainer: document.getElementById('originalCode'),
        originalCodePre: document.getElementById('originalCodePre'),
        refactoredCodePre: document.getElementById('refactoredCodePre'),
        refactoredCodeContainer: document.getElementById('refactoredCode'),
        responseDiv: document.getElementById('response'),
        testSmellList: document.getElementById('testSmellsList'),
        sortOptions: document.getElementById('sortOptions'),
        fileInput: document.getElementById('fileInput')
    };

    function initializeEventListeners() {
        ui.form.addEventListener('submit', handleDetectSmells);
        ui.fileInput.addEventListener('change', handleFileLoad);
        ui.sortOptions.addEventListener('change', handleSortChange);
    }

    function resetUI() {
        ui.sortOptions.value = "testSmell";
        ui.testSmellList.innerHTML = "";
        ui.refactoredCodeContainer.innerHTML = "";
        ui.originalCodePre.setAttribute('data-line', "");
        ui.refactoredCodePre.setAttribute('data-line', "");

        state.testSmells = [];
    }

    function showSuccessMessage() {
        const successHTML = `
            <a style="color: var(--green);font-size: 20px;">No test smells found!</a>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 30 30" style="fill: var(--green);">
                <path d="M 27.5 7.53125 L 24.464844 4.542969 C 24.15625 4.238281 23.65625 4.238281 23.347656 4.542969 L 11.035156 16.667969 L 6.824219 12.523438 C 6.527344 12.230469 6 12.230469 5.703125 12.523438 L 2.640625 15.539062 C 2.332031 15.84375 2.332031 16.335938 2.640625 16.640625 L 10.445312 24.324219 C 10.59375 24.472656 10.796875 24.554688 11.007812 24.554688 C 11.214844 24.554688 11.417969 24.472656 11.566406 24.324219 L 27.5 8.632812 C 27.648438 8.488281 27.734375 8.289062 27.734375 8.082031 C 27.734375 7.875 27.648438 7.679688 27.5 7.53125 Z"/>
            </svg>
        `;
        ui.testSmellList.innerHTML = successHTML;
        ui.testSmellList.classList.add("smells-list-refactored");
    }

    function copyToClipboard(code, button) {
        const codeElement = document.getElementById(code);
        const text = codeElement.innerText;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                updateCopyButton(button);
            }).catch(() => {
                fallbackCopyToClipboard(text, button);
            });
        } else {
            fallbackCopyToClipboard(text, button);
        }
    }

    function fallbackCopyToClipboard(text, button) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        updateCopyButton(button);
    }

    function updateCopyButton(button) {
        button.innerHTML = `
            <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none"/>
                <path d="M9 16.17L5.83 13l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
        `;
        button.classList.add("copy-button-clicked");

        setTimeout(() => {
            button.innerHTML = `
                <svg viewBox="304.219 221.26 16 16" width="24" height="24" style="fill: var(--bg);">
                    <path d="M 304.219 228.01 C 304.219 227.044 305.003 226.26 305.969 226.26 L 307.469 226.26 C 308.047 226.26 308.408 226.885 308.119 227.385 C 307.985 227.617 307.737 227.76 307.469 227.76 L 305.969 227.76 C 305.831 227.76 305.719 227.872 305.719 228.01 L 305.719 235.51 C 305.719 235.648 305.831 235.76 305.969 235.76 L 313.469 235.76 C 313.607 235.76 313.719 235.648 313.719 235.51 L 313.719 234.01 C 313.719 233.433 314.344 233.072 314.844 233.36 C 315.076 233.494 315.219 233.742 315.219 234.01 L 315.219 235.51 C 315.219 236.476 314.436 237.26 313.469 237.26 L 305.969 237.26 C 305.003 237.26 304.219 236.476 304.219 235.51 L 304.219 228.01 Z" style="fill: var(--text);"/>
                    <path d="M 309.219 223.01 C 309.219 222.044 310.003 221.26 310.969 221.26 L 318.469 221.26 C 319.435 221.26 320.219 222.044 320.219 223.01 L 320.219 230.51 C 320.219 231.476 319.436 232.26 318.469 232.26 L 310.969 232.26 C 310.003 232.26 309.219 231.476 309.219 230.51 L 309.219 223.01 Z M 310.969 222.76 C 310.831 222.76 310.719 222.872 310.719 223.01 L 310.719 230.51 C 310.719 230.648 310.831 230.76 310.969 230.76 L 318.469 230.76 C 318.607 230.76 318.719 230.648 318.719 230.51 L 318.719 223.01 C 318.719 222.872 318.607 222.76 318.469 222.76 L 310.969 222.76 Z" style="fill: var(--text);"/>
                </svg>
            `;
            button.classList.remove("copy-button-clicked");
        }, 3000);
    }

    function handleDetectSmells(event) {
        if (event) {
            event.preventDefault();
        }
        resetUI();

        const javaCode = ui.inputText.value;
        if (!javaCode.trim()) {
            ui.responseDiv.textContent = 'Please enter some Java code to analyze.';
            return;
        }

        ui.originalCodeContainer.textContent = javaCode;

        const formData = new URLSearchParams();
        formData.append('inputText', javaCode);

        fetch('/process-input', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            state.testSmells = data.retVal || [];
            ui.responseDiv.textContent = data.message;
            renderSmellList();
            Prism.highlightElement(ui.originalCodeContainer);
        })
        .catch(error => {
            console.error('Error:', error);
            ui.responseDiv.textContent = 'Error occurred while processing input. Check the console for details.';
        });
    }

    function renderSmellList() {
        ui.testSmellList.innerHTML = "";
        if (state.testSmells.length === 0) {
            showSuccessMessage();
            return;
        }
        const linesWithSmells = [];
        state.testSmells.forEach(smell => {
            linesWithSmells.push(`${smell.lineBegin}-${smell.lineEnd}`);
            const smellElement = createTestSmellElement(smell);
            ui.testSmellList.appendChild(smellElement);
        });
        ui.originalCodePre.setAttribute('data-line', linesWithSmells.join(','));
        ui.testSmellList.classList.remove("smells-list-refactored");
    }

    function createTestSmellElement(smell) {
        const lineDiv = document.createElement('li');
        lineDiv.className = 'line';

        const resources = SMELL_TEXT_RESOURCES[smell.type] || SMELL_TEXT_RESOURCES.DEFAULT;

        const description = document.createElement('a');
        description.innerHTML = `
            <span class="popup">
                <a class="smell"><b>${resources.displayName}</b></a>
                <span class="popuptext">${resources.description}</span>
            </span>
            detected in method <a class="method">${smell.method}</a> at line ${smell.lineBegin}.
        `;

        const button = document.createElement("button");
        button.className = "button";
        button.textContent = resources.refactorAction;
        button.onclick = () => performRefactor(smell, button);

        lineDiv.appendChild(description);
        lineDiv.appendChild(button);
        return lineDiv;
    }

    /**
     * Performs a refactoring and displays the result in the "Refactored Code" panel.
     * This does NOT alter the original code or re-run detection, providing a stable UI.
     */
    function performRefactor(smell, button) {
        button.disabled = true;
        button.textContent = "Refactoring...";

        const originalCode = ui.inputText.value;

        const formData = new URLSearchParams();
        formData.append('code', originalCode);
        formData.append('smellType', smell.type);
        formData.append('line', smell.lineBegin);

        fetch('/api/refactor', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(`Server responded with ${response.status}: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            const { refactoredCode, changedLines, message } = data;
            console.log(message);

            ui.refactoredCodeContainer.textContent = refactoredCode;

            ui.refactoredCodePre.setAttribute('data-line', changedLines.join(','));
            Prism.highlightElement(ui.refactoredCodeContainer);

            button.textContent = "Refactored!";
            button.className = "button-refactored"; // A new class for styling the completed button.

        })
        .catch(error => {
            console.error("Refactoring failed:", error);
            alert("An error occurred during refactoring. Check the console for details.");

            button.disabled = false;
            const resources = SMELL_TEXT_RESOURCES[smell.type] || SMELL_TEXT_RESOURCES.DEFAULT;
            button.textContent = resources.refactorAction;
        });
    }

    function handleSortChange() {
        if (state.testSmells.length === 0) return;
        const sortBy = ui.sortOptions.value;
        state.testSmells.sort((a, b) => {
            if (sortBy === 'line') {
                return a.lineBegin - b.lineBegin;
            }
            const nameA = (SMELL_TEXT_RESOURCES[a.type] || SMELL_TEXT_RESOURCES.DEFAULT).displayName;
            const nameB = (SMELL_TEXT_RESOURCES[b.type] || SMELL_TEXT_RESOURCES.DEFAULT).displayName;
            return nameA.localeCompare(nameB);
        });
        renderSmellList();
    }

    function handleFileLoad() {
        const file = ui.fileInput.files[0];
        if (!file) {
            console.log("No file selected.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            console.log("File Content:", content);
            ui.inputText.value = content;
        };
        reader.readAsText(file);
        ui.fileInput.value = "";
    }

    initializeEventListeners();

    window.copyToClipboard = copyToClipboard;
});