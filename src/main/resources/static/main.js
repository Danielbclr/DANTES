document.addEventListener('DOMContentLoaded', () => {
    const state = {
        testSmells: [],
        textResources: {},
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
        fileInput: document.getElementById('fileInput'),
    };

    /**
     * This function is passed to the LanguageManager. It ensures that whenever
     * the language changes, this module's state is updated before re-rendering UI.
     */
    function onLanguageUpdate() {
        // 1. Get the fresh text resources from the single source of truth (LanguageManager)
        state.textResources = window.LanguageManager.getTextResources();
        // 2. Re-render any dynamic content that depends on the new text
        renderSmellList();
    }


    function initializeEventListeners() {
        ui.form.addEventListener('submit', handleDetectSmells);
        ui.fileInput.addEventListener('change', handleFileLoad);
        ui.sortOptions.addEventListener('change', handleSortChange);
    }

    /**
     * Initializes the application.
     */
    async function initializeApp() {
        // FIX: Call init only once with the correct callback to prevent race conditions.
        window.LanguageManager.init(onLanguageUpdate);

        // Set up the main application event listeners
        initializeEventListeners();

        window.copyToClipboard = copyToClipboard;
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
            <a style="color: var(--color-primary);font-size: 20px;">${state.textResources.successMessage}</a>
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 30 30" style="fill: var(--color-primary);">
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
                    <path d="M 309.219 223.01 C 309.219 222.044 310.003 221.26 310.969 221.26 L 318.469 221.26 C 319.435 221.26 320.219 222.044 320.219 223.01 L 320.219 230.51 C 320.219 231.476 319.436 232.26 318.469 232.26 L 310.969 232.26 C 310.003 232.26 309.219 231.476 309.219 230.51 L 309.219 223.01 Z M 310.969 222.76 C 310.831 227.76 310.719 222.872 310.719 223.01 L 310.719 230.51 C 310.719 230.648 310.831 230.76 310.969 230.76 L 318.469 230.76 C 318.607 230.76 318.719 230.648 318.719 230.51 L 318.719 223.01 C 318.719 222.872 318.607 222.76 318.469 222.76 L 310.969 222.76 Z" style="fill: var(--text);"/>
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
            ui.responseDiv.textContent = state.textResources.errorNoCode;
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
            state.testSmells = (data.retVal || []).map(smell => ({
                ...smell,
                isRefactored: false
            }));

            // Construct the response message dynamically on the frontend.
            const smellCount = state.testSmells.length;
            if (smellCount === 0) {
                ui.responseDiv.textContent = state.textResources.detectionSuccessNone;
            } else if (smellCount === 1) {
                ui.responseDiv.textContent = state.textResources.detectionSuccessOne;
            } else if (smellCount > 1) {
                ui.responseDiv.textContent = state.textResources.detectionSuccessOther.replace('{count}', smellCount);
            }
            // If smellCount is 0, the responseDiv remains empty, as renderSmellList will show the success message.

            renderSmellList();
            Prism.highlightElement(ui.originalCodeContainer);
        })
        .catch(error => {
            console.error('Error:', error);
            ui.responseDiv.textContent = state.textResources.errorProcessing;
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

        let resources = state.textResources[smell.type] || state.textResources.DEFAULT;

        if (!resources) {
            console.warn(`No text resource found for smell type: '${smell.type}'. Using a default.`);
            // Use externalized strings for the fallback
            resources = {
                displayName: state.textResources.unknownSmell || smell.type,
                description: state.textResources.unknownSmellDescription,
                refactorAction: state.textResources.unknownSmellAction
            };
        }

        const description = document.createElement('a');

        // Use a template string from the language file
        const template = state.textResources.smellDescriptionTemplate || 'detected in method <a class="method">{method}</a> at line {line}.';
        const smellDetails = template
            .replace('{method}', smell.method)
            .replace('{line}', smell.lineBegin);

        description.innerHTML = `
            <span class="popup">
                <a class="smell"><b>${resources.displayName}</b></a>
                <span class="popuptext">${resources.description}</span>
            </span>
            ${smellDetails}
        `;

        const button = document.createElement("button");

        // Render the button based on the `isRefactored` state.
        if (smell.isRefactored) {
            button.className = "button-refactored";
            button.textContent = state.textResources.refactored;
            button.disabled = true;
        } else {
            button.className = "button";
            button.textContent = resources.refactorAction;
            button.onclick = () => performRefactor(smell, button);
        }

        lineDiv.appendChild(description);
        lineDiv.appendChild(button);
        return lineDiv;
    }

    function performRefactor(smell, button) {
        button.disabled = true;
        button.textContent = state.textResources.refactoring;

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

            // CHANGE 3: Update the central state to persist the change.
            smell.isRefactored = true;

            button.textContent = state.textResources.refactored;
            button.className = "button-refactored";

        })
        .catch(error => {
            console.error("Refactoring failed:", error);
            alert(state.textResources.refactorError);

            button.disabled = false;
            const resources = state.textResources[smell.type] || state.textResources.DEFAULT;
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
            const nameA = (state.textResources[a.type] || state.textResources.DEFAULT).displayName;
            const nameB = (state.textResources[b.type] || state.textResources.DEFAULT).displayName;
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
            ui.inputText.value = content;
        };
        reader.readAsText(file);
        ui.fileInput.value = "";
    }

    initializeApp();

    window.copyToClipboard = copyToClipboard;
});