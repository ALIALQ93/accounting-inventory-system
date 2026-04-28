/**
 * Invoice Utilities - Shared functions for invoice modules
 * @module utils/invoice-utils
 * 
 * This module contains utility functions that are used across multiple invoice modules
 * (purchases, sales, purchase-returns, sales-returns) to avoid code duplication.
 */

const InvoiceUtils = {
    /**
     * Convert quantity from sub-unit to main unit
     * @param {number} quantity - Quantity in the selected unit
     * @param {string} unitId - Selected unit ID
     * @param {Object} product - Product object with subUnits
     * @returns {number} Quantity in main unit
     */
    convertToMainUnit(quantity, unitId, product) {
        if (!quantity || quantity <= 0) return 0;
        if (!unitId || !product || !product.unitId) return quantity;
        if (unitId === product.unitId) return quantity;
        
        const subUnit = product.subUnits?.find(su => su.unitId === unitId);
        const conversionFactor = parseFloat(subUnit?.conversionValue || subUnit?.conversionFactor) || 0;
        if (!subUnit || conversionFactor <= 0) {
            return quantity;
        }
        
        const conversionType = subUnit.conversionType || 'multiply';
        if (conversionType === 'multiply') {
            return quantity * conversionFactor;
        } else if (conversionType === 'divide') {
            return quantity / conversionFactor;
        } else {
            // Unknown conversion type - log warning and use multiply as fallback
            console.warn(`⚠️ Unknown conversion type "${conversionType}" for product ${product.id || product.name}, unit ${unitId}. Using multiply as fallback.`);
            return quantity * conversionFactor;
        }
    },

    /**
     * Escape HTML to prevent XSS attacks
     * @param {string} text - Text to escape
     * @returns {string} Escaped HTML string
     */
    escapeHtml(text) {
        if (text == null) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Convert amount from a currency to base currency
     * @param {number} amount - Amount to convert
     * @param {string} currency - Currency code (e.g., 'USD', 'IQD')
     * @param {number} exchangeRate - Exchange rate to use (optional, will use currency object if available)
     * @param {Array} currencies - Array of currency objects (must include baseCurrency)
     * @returns {number} Converted amount in base currency
     */
    convertToBaseCurrency(amount, currency, exchangeRate, currencies) {
        if (!amount || amount === 0) return 0;
        
        // Get base currency
        const baseCurrency = currencies?.find(c => c.isBaseCurrency)?.code || 'IQD';
        
        // If already in base currency, return as is
        if (currency === baseCurrency || !currency) {
            return amount;
        }
        
        // Get exchange rate from currency object if available
        const currencyObj = currencies?.find(c => c.code === currency);
        const rate = currencyObj?.exchangeRate || exchangeRate || 1;
        
        if (!rate || rate === 0) {
            console.warn(`⚠️ Invalid exchange rate for ${currency}: ${rate}`);
            return amount;
        }
        
        // Convert: amount in currency / exchangeRate = amount in base currency
        // Example: 100 USD / 1460 = amount in IQD (if 1 IQD = 1460 USD)
        const converted = amount / rate;
        
        return converted;
    }
};

// Export for use in modules (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InvoiceUtils;
}


