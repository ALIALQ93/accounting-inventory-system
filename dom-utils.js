/**
 * DOM Utilities - Safe DOM Operations
 * @module utils/dom-utils
 */

const DOMUtils = {
    /**
     * Safely set text content of an element
     * @param {string} elementId - Element ID
     * @param {string} content - Content to set
     * @param {string} defaultValue - Default value if content is null/undefined
     */
    safeSetText(elementId, content, defaultValue = '0') {
        try {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = content !== null && content !== undefined ? content : defaultValue;
                return true;
            } else {
                console.warn(`⚠️ Element not found: ${elementId}`);
                return false;
            }
        } catch (error) {
            console.error(`❌ Error setting text for ${elementId}:`, error);
            return false;
        }
    },

    /**
     * Safely set innerHTML of an element
     * @param {string} elementId - Element ID
     * @param {string} content - HTML content to set
     */
    safeSetHTML(elementId, content) {
        try {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = content || '';
                return true;
            } else {
                console.warn(`⚠️ Element not found: ${elementId}`);
                return false;
            }
        } catch (error) {
            console.error(`❌ Error setting HTML for ${elementId}:`, error);
            return false;
        }
    },

    /**
     * Check if element exists
     * @param {string} elementId - Element ID
     * @returns {boolean} - True if element exists
     */
    elementExists(elementId) {
        return document.getElementById(elementId) !== null;
    },

    /**
     * Wait for element to exist
     * @param {string} elementId - Element ID
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise<Element|null>} - Element or null if timeout
     */
    waitForElement(elementId, timeout = 5000) {
        return new Promise((resolve) => {
            const element = document.getElementById(elementId);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver(() => {
                const element = document.getElementById(elementId);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            // Timeout fallback
            setTimeout(() => {
                observer.disconnect();
                resolve(null);
            }, timeout);
        });
    },

    /**
     * Batch update multiple elements safely
     * @param {Object} updates - Object with elementId as key and content as value
     */
    batchUpdateText(updates) {
        const results = {};
        for (const [elementId, content] of Object.entries(updates)) {
            results[elementId] = this.safeSetText(elementId, content);
        }
        return results;
    },

    /**
     * Get element safely with error handling
     * @param {string} elementId - Element ID
     * @returns {Element|null} - Element or null if not found
     */
    safeGetElement(elementId) {
        try {
            return document.getElementById(elementId);
        } catch (error) {
            console.error(`❌ Error getting element ${elementId}:`, error);
            return null;
        }
    },

    /**
     * Clear element content safely
     * @param {string} elementId - Element ID
     */
    safeClear(elementId) {
        try {
            const element = document.getElementById(elementId);
            if (element) {
                element.innerHTML = '';
                return true;
            }
            return false;
        } catch (error) {
            console.error(`❌ Error clearing element ${elementId}:`, error);
            return false;
        }
    },

    /**
     * Add class safely
     * @param {string} elementId - Element ID
     * @param {string} className - Class name to add
     */
    safeAddClass(elementId, className) {
        try {
            const element = document.getElementById(elementId);
            if (element) {
                element.classList.add(className);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`❌ Error adding class to ${elementId}:`, error);
            return false;
        }
    },

    /**
     * Remove class safely
     * @param {string} elementId - Element ID
     * @param {string} className - Class name to remove
     */
    safeRemoveClass(elementId, className) {
        try {
            const element = document.getElementById(elementId);
            if (element) {
                element.classList.remove(className);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`❌ Error removing class from ${elementId}:`, error);
            return false;
        }
    }
};

// Export for use in modules
window.DOMUtils = DOMUtils;

console.log('✅ DOM Utils loaded');


