document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Encapsulated State Management ---
    const state = {
        testSmells: [],
        refactorDataLine: "",
        buttonList: [],
        testSmellObjectList: []
    };

    // --- 2. Cached DOM Elements ---
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

    // --- 3. Constants ---
    const TEST_SMELL_TYPES = {
        ASSERTION_ROULETTE: "Assertion Roulette",
        CONSTRUCTOR_INITIALIZATION: "Constructor Initialization",
        EXCEPTION_HANDLING: "Exception Handling",
        IGNORED_TEST: "Ignored Test",
        EMPTY_TEST: "Empty Test",
        DUPLICATE_ASSERT: "Duplicate Assert",
        UNNECESSARY_PRINT: "Unnecessary Print",
        REDUNDANT_ASSERTION: "Redundant Assertion",
        MYSTERY_GUEST: "Mystery Guest",
        MAGIC_NUMBER: "Magic Number",
        GENERAL_FIXTURE: "General Fixture"
    };

    // --- 4. Event Listeners Setup ---
    function initializeEventListeners() {
        ui.form.addEventListener('submit', handleDetectSmells);
        ui.fileInput.addEventListener('change', handleFileLoad);
        ui.sortOptions.addEventListener('change', handleSortChange);
    }

    // --- 5. Utility Functions ---
    function resetUI() {
        ui.sortOptions.value = "testSmell";
        ui.testSmellList.innerHTML = "";
        ui.refactoredCodeContainer.innerHTML = "";
        ui.originalCodePre.setAttribute('data-line', "");
        ui.refactoredCodePre.setAttribute('data-line', "");
        
        // Reset state
        state.testSmells = [];
        state.refactorDataLine = "";
        state.buttonList = [];
        state.testSmellObjectList = [];
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
        
        // Modern clipboard API with fallback
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

    // --- 6. Main Event Handlers ---
    function handleDetectSmells(event) {
        event.preventDefault();
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
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
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
            
            // Add success icon to response
            if (data.message) {
                ui.responseDiv.innerHTML += `
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" style="fill: var(--green);" viewBox="0 0 512 512">
                        <path d="M256 0c53 0 96 43 96 96v3.6c0 15.7-12.7 28.4-28.4 28.4H188.4c-15.7 0-28.4-12.7-28.4-28.4V96c0-53 43-96 96-96zM41.4 105.4c12.5-12.5 32.8-12.5 45.3 0l64 64c.7 .7 1.3 1.4 1.9 2.1c14.2-7.3 30.4-11.4 47.5-11.4H312c17.1 0 33.2 4.1 47.5 11.4c.6-.7 1.2-1.4 1.9-2.1l64-64c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-64 64c-.7 .7-1.4 1.3-2.1 1.9c6.2 12 10.1 25.3 11.1 39.5H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H416c0 24.6-5.5 47.8-15.4 68.6c2.2 1.3 4.2 2.9 6 4.8l64 64c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0l-63.1-63.1c-24.5 21.8-55.8 36.2-90.3 39.6V240c0-8.8-7.2-16-16-16s-16 7.2-16 16V479.2c-34.5-3.4-65.8-17.8-90.3-39.6L86.6 502.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l64-64c1.9-1.9 3.9-3.4 6-4.8C101.5 367.8 96 344.6 96 320H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H96.3c1.1-14.1 5-27.5 11.1-39.5c-.7-.6-1.4-1.2-2.1-1.9l-64-64c-12.5-12.5-12.5-32.8 0-45.3z"/>
                    </svg>
                `;
            }
            
            ui.responseDiv.className = 'response';
            renderSmellList();
            Prism.highlightElement(ui.originalCodeContainer);
            
            console.log("Received data:", data);
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
        
        state.testSmells.forEach((smell, index) => {
            console.log(`${index}: ${smell.lineBegin} to ${smell.lineEnd}`);
            linesWithSmells.push(`${smell.lineBegin}-${smell.lineEnd}`);
            
            // Ensure backward compatibility with existing data structure
            smell.refactor2 = smell.refactor2 || false;
            
            // Handle special cases for method names
            if (smell.type.displayName === TEST_SMELL_TYPES.EXCEPTION_HANDLING ||
                smell.type.displayName === TEST_SMELL_TYPES.MYSTERY_GUEST) {
                smell.method += "()";
            } else if (smell.type.displayName === TEST_SMELL_TYPES.GENERAL_FIXTURE) {
                smell.refactor1 = "Make Fixture Unique";
            }
            
            state.testSmellObjectList.push({ key: index, value: smell });
            
            const lineDiv = createTestSmellElement(index, smell);
            ui.testSmellList.appendChild(lineDiv);
        });

        // Add "Refactor All" button
        if (state.testSmells.length > 0) {
            addRefactorAllButton();
            ui.testSmellList.classList.remove("smells-list-refactored");
        }

        ui.originalCodePre.setAttribute('data-line', linesWithSmells.join(','));
    }

    function createTestSmellElement(index, smell) {
        const lineDiv = document.createElement('li');
        lineDiv.className = 'line';

        const description = document.createElement('a');
        const popUpText = getPopupText(smell.type.displayName);
        
        description.innerHTML = `
            <span class="popup">
                <a class="smell"><b>${smell.type.displayName}</b></a>
                <span class="popuptext">${popUpText}</span>
            </span> 
            detected in method <a class="method">${smell.method}</a> at line ${smell.lineBegin}.
        `;

        const button = document.createElement("button");
        button.className = smell.refactor2 ? "button-refactored" : "button";
        button.textContent = smell.refactor2 ? "Refactored!" : (smell.type.refactorAction || smell.refactor1 || "Refactor");
        
        if (!smell.refactor2) {
            if (smell.type.displayName === TEST_SMELL_TYPES.ASSERTION_ROULETTE) {
                button.onclick = () => performRefactor(smell, button);
            } else {
                // Handle legacy refactor methods - these should eventually be unified
                button.onclick = () => performLegacyRefactor(smell, button);
            }
        }

        lineDiv.appendChild(description);
        lineDiv.appendChild(button);
        
        state.buttonList.push(button);
        return lineDiv;
    }

    function getPopupText(smellType) {
        const descriptions = {
            [TEST_SMELL_TYPES.ASSERTION_ROULETTE]: "Multiple unexplained assertions in a test method hinder readability and understanding, making test failures unclear.",
            [TEST_SMELL_TYPES.CONSTRUCTOR_INITIALIZATION]: "Test suites should avoid using constructors; fields should be initialized in a setUp() method.",
            [TEST_SMELL_TYPES.EXCEPTION_HANDLING]: "Test cases should avoid relying on the production code throwing an error or exception; instead use JUnit's assertThrows.",
            [TEST_SMELL_TYPES.IGNORED_TEST]: "Ignored JUnit 4 test methods add compilation overhead and complexity, impacting code comprehension.",
            [TEST_SMELL_TYPES.EMPTY_TEST]: "Empty test methods pose risks; JUnit passes them, potentially masking behavior-breaking changes in production classes.",
            [TEST_SMELL_TYPES.DUPLICATE_ASSERT]: "Repeated testing of the same condition within a test method is a test smell. Use separate methods for varying values/tests.",
            [TEST_SMELL_TYPES.UNNECESSARY_PRINT]: "Print statements in unit tests are redundant; used for debugging, they often remain forgotten, adding no value to automated testing.",
            [TEST_SMELL_TYPES.REDUNDANT_ASSERTION]: "Test methods with constant true/false assertions are a smell, often introduced for debugging and inadvertently left behind.",
            [TEST_SMELL_TYPES.MYSTERY_GUEST]: "Using external resources in test methods leads to stability and performance issues. Utilize mock objects instead.",
            [TEST_SMELL_TYPES.MAGIC_NUMBER]: "Using numeric literals in assert statements (magic numbers) is a smell. Substitute them with constants/variables for clarity.",
            [TEST_SMELL_TYPES.GENERAL_FIXTURE]: "Overly general test fixtures, initializing unused fields, lead to unnecessary work during test execution."
        };
        return descriptions[smellType] || "Test smell detected.";
    }

    function addRefactorAllButton() {
        const lineDiv = document.createElement('li');
        const buttonRefactorAll = document.createElement("button");
        buttonRefactorAll.classList.add("button", "refactorAll");
        buttonRefactorAll.innerHTML = "Refactor All";
        buttonRefactorAll.onclick = () => refactorAll(buttonRefactorAll);
        
        lineDiv.appendChild(buttonRefactorAll);
        ui.testSmellList.appendChild(lineDiv);
    }

    // --- 7. Refactoring Functions ---
    function performRefactor(smell, button) {
        const currentCode = ui.inputText.value;

        const formData = new URLSearchParams();
        formData.append('code', currentCode);
        formData.append('smellType', smell.type.name);
        formData.append('line', smell.lineBegin);

        fetch('/api/refactor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        })
        .then(response => response.json())
        .then(data => {
            const { refactoredCode, changedLines, message } = data;
            console.log(message);

            ui.refactoredCodeContainer.textContent = refactoredCode;
            ui.inputText.value = refactoredCode;

            state.refactorDataLine += changedLines.join(',') + ",";
            ui.refactoredCodePre.setAttribute('data-line', state.refactorDataLine);
            Prism.highlightElement(ui.refactoredCodeContainer);

            smell.refactor2 = true;
            button.className = "button-refactored";
            button.textContent = "Refactored!";
            button.disabled = true;
        })
        .catch(error => {
            console.error("Refactoring failed:", error);
            alert("An error occurred during refactoring.");
        });
    }

    // Legacy refactor function for backward compatibility
    function performLegacyRefactor(smell, button) {
        // This would call the appropriate legacy endpoint based on smell type
        // For now, we'll use the unified approach
        performRefactor(smell, button);
    }

    function refactorAll(buttonRefactorAll) {
        const formData = new URLSearchParams();

        fetch('/refactorAll', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.retVal);
            const jsonData = JSON.parse(data.retVal);
            
            ui.refactoredCodeContainer.textContent = jsonData[0];
            state.refactorDataLine += jsonData[1];
            ui.refactoredCodePre.setAttribute('data-line', state.refactorDataLine);
            Prism.highlightElement(ui.refactoredCodeContainer);

            buttonRefactorAll.classList.add("refactorAll-clicked");
            buttonRefactorAll.innerHTML = `
                Refactored! 
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 30 30">
                    <path fill="var(--green)" d="M 27.5 7.53125 L 24.464844 4.542969 C 24.15625 4.238281 23.65625 4.238281 23.347656 4.542969 L 11.035156 16.667969 L 6.824219 12.523438 C 6.527344 12.230469 6 12.230469 5.703125 12.523438 L 2.640625 15.539062 C 2.332031 15.84375 2.332031 16.335938 2.640625 16.640625 L 10.445312 24.324219 C 10.59375 24.472656 10.796875 24.554688 11.007812 24.554688 C 11.214844 24.554688 11.417969 24.472656 11.566406 24.324219 L 27.5 8.632812 C 27.648438 8.488281 27.734375 8.289062 27.734375 8.082031 C 27.734375 7.875 27.648438 7.679688 27.5 7.53125 Z"/>
                </svg>
            `;

            state.testSmellObjectList.forEach((item, index) => {
                item.value.refactor2 = true;
                const button = state.buttonList[index];
                button.className = "button-refactored";
                button.textContent = "Refactored!";
            });
        })
        .catch(error => {
            console.error("Refactor All failed:", error);
            alert("An error occurred during batch refactoring.");
        });
    }

    function handleSortChange() {
        console.log(ui.sortOptions.value);
        if (state.testSmells.length === 0) return;

        if (ui.sortOptions.value === "testSmell") {
            state.testSmells.sort((a, b) => {
                if (a.type.displayName > b.type.displayName) return 1;
                return -1;
            });
        } else if (ui.sortOptions.value === "line") {
            state.testSmells.sort((a, b) => a.lineBegin - b.lineBegin);
        }

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
        ui.fileInput.value = ""; // Reset for next upload
    }

    // --- 8. Initialize Application ---
    initializeEventListeners();
    
    // Expose utility functions to global scope if needed
    window.copyToClipboard = copyToClipboard;
});