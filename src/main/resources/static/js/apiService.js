/**
 * Fetches test smell detections from the backend.
 * @param {string} javaCode - The Java code to be analyzed.
 * @returns {Promise<object>} A promise that resolves to the server's JSON response.
 */
export async function detectSmells(javaCode) {
    const formData = new URLSearchParams();
    formData.append('inputText', javaCode);

    const response = await fetch('/process-input', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}

/**
 * Requests a refactoring for a specific test smell from the backend.
 * @param {string} originalCode - The full original Java code.
 * @param {object} smell - The smell object to be refactored.
 * @returns {Promise<object>} A promise that resolves to the refactoring result from the server.
 */
export async function performRefactor(code, smell) {
    const formData = new URLSearchParams();
    formData.append('code', code);
    formData.append('smellType', smell.type);
    formData.append('line', smell.actualLine);

    const response = await fetch('/api/refactor', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText}`);
    }
    return response.json();
}