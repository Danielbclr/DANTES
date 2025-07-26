/**
 * A self-contained module to manage language switching for the application.
 * It creates its own UI toggle, loads language resources, and provides
 * a mechanism to notify the main application when the language changes.
 */
(function(window, document) {
    // --- State and UI Elements ---
    const state = {
        textResources: {},
        currentLanguage: 'en'
    };

    const ui = {
        button: document.createElement('button'),
        flagContainer: document.createElement('span')
    };

    let onLanguageChangeCallback = () => {}; // Placeholder for the callback

    // --- Core Functions ---

    async function loadLanguage(lang) {
        try {
            const module = await import(`./ui-text-${lang}.js`);
            state.textResources = { ...module.SMELL_TEXT_RESOURCES, ...module.UI_TEXT };
            localStorage.setItem('preferredLanguage', lang);
        } catch (error) {
            console.error(`Failed to load language file for '${lang}'. Defaulting to English.`, error);
            const enModule = await import('../ui-text-en.js');
            state.textResources = { ...enModule.SMELL_TEXT_RESOURCES, ...enModule.UI_TEXT };
        }
    }

    function updateUIText() {
        const txt = state.textResources;
        document.title = txt.appTitle;
        document.getElementById('inputText').placeholder = txt.placeholder;
        document.querySelector('input[type="submit"]').value = txt.detectButton;
        document.querySelector('input.file-button').value = txt.uploadButton;
        document.querySelector('#sortOptions option[value="testSmell"]').textContent = txt.sortSmell;
        document.querySelector('#sortOptions option[value="line"]').textContent = txt.sortLine;
        const titles = document.querySelectorAll('.code-container .font-size-20');
        document.getElementById('analysis-title').textContent = txt.analysisTitle;
        document.getElementById('original-code-title').textContent = txt.originalCode;
        document.getElementById('refactored-code-title').textContent = txt.refactoredCode;
    }

    function updateLanguageToggleIcon() {
        let flagPath, altText;
        if (state.currentLanguage === 'en') {
            flagPath = '/svg/br-flag.svg';
            altText = 'Mudar para Português';
        } else {
            flagPath = '/svg/us-flag.svg';
            altText = 'Switch to English';
        }
        ui.flagContainer.innerHTML = `<img src="${flagPath}" alt="${altText}" class="language-flag-icon">`;
    }

    async function handleLanguageToggle() {
        state.currentLanguage = (state.currentLanguage === 'en') ? 'pt' : 'en';
        await loadLanguage(state.currentLanguage);
        console.log(`Language changed to: ${state.currentLanguage}`);
        updateUIText();
        updateLanguageToggleIcon();
        onLanguageChangeCallback(); // Notify the main app to re-render its dynamic content
    }

    // --- Initialization ---
    async function init() {
        const preferredLanguage = localStorage.getItem('preferredLanguage') || navigator.language.split('-')[0];
        state.currentLanguage = ['en', 'pt'].includes(preferredLanguage) ? preferredLanguage : 'en';

        await loadLanguage(state.currentLanguage);
        updateUIText();
        updateLanguageToggleIcon();

        // Configure the button
        ui.button.id = 'language-toggle';
        ui.button.className = 'language-toggle-button';
        ui.button.title = 'Change Language';
        ui.button.appendChild(ui.flagContainer);
        ui.button.addEventListener('click', handleLanguageToggle);

        // Append to the shared actions container
        const actionsContainer = document.getElementById('actions-container');
        if (actionsContainer) {
            actionsContainer.appendChild(ui.button);
        } else {
            console.error('Actions container not found for language toggle.');
        }

        onLanguageChangeCallback();
    }

    // Expose a public interface on the window object
    window.LanguageManager = {
        init: function(callback) {
            if (typeof callback === 'function') {
                onLanguageChangeCallback = callback;
            }
            return init();
        },
        getTextResources: function() {
            return state.textResources;
        }
    };

})(window, document);