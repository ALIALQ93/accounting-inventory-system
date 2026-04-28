/**
 * Accuracy Validator Tool
 * أداة التحقق من دقة العمليات المحاسبية
 */

class AccuracyValidator {
    static validations = [];
    
    /**
     * Validate that debit equals credit in an entry
     * @param {Array} entries - Array of entry objects
     * @returns {object} Validation result
     */
    static validateEntryBalance(entries) {
        const totalDebit = entries.reduce((sum, e) => {
            return sum + parseFloat(e.debit || 0);
        }, 0);
        
        const totalCredit = entries.reduce((sum, e) => {
            return sum + parseFloat(e.credit || 0);
        }, 0);
        
        const difference = Math.abs(totalDebit - totalCredit);
        const tolerance = 0.01; // Allow 0.01 difference for rounding
        
        const isValid = difference <= tolerance;
        
        const result = {
            isValid,
            totalDebit: parseFloat(totalDebit.toFixed(2)),
            totalCredit: parseFloat(totalCredit.toFixed(2)),
            difference: parseFloat(difference.toFixed(2)),
            tolerance,
            timestamp: new Date()
        };
        
        if (!isValid) {
            console.error('❌ Entry balance validation failed:', result);
        } else {
            console.log('✅ Entry balance validated:', result);
        }
        
        this.validations.push({
            type: 'entryBalance',
            result,
            timestamp: new Date()
        });
        
        return result;
    }
    
    /**
     * Validate account balance by recalculating from entries
     * @param {string} accountId - Account ID
     * @param {number} cachedBalance - Cached balance value
     * @param {Function} calculateFunction - Function to recalculate balance
     * @returns {Promise<object>} Validation result
     */
    static async validateAccountBalance(accountId, cachedBalance, calculateFunction) {
        try {
            const calculatedBalance = await calculateFunction(accountId);
            
            const difference = Math.abs(parseFloat(cachedBalance || 0) - parseFloat(calculatedBalance || 0));
            const tolerance = 0.01;
            
            const isValid = difference <= tolerance;
            
            const result = {
                isValid,
                accountId,
                cachedBalance: parseFloat(cachedBalance || 0),
                calculatedBalance: parseFloat(calculatedBalance || 0),
                difference: parseFloat(difference.toFixed(2)),
                tolerance,
                timestamp: new Date()
            };
            
            if (!isValid) {
                console.error(`❌ Account balance validation failed for ${accountId}:`, result);
            } else {
                console.log(`✅ Account balance validated for ${accountId}:`, result);
            }
            
            this.validations.push({
                type: 'accountBalance',
                accountId,
                result,
                timestamp: new Date()
            });
            
            return result;
        } catch (error) {
            console.error(`❌ Error validating account balance for ${accountId}:`, error);
            return {
                isValid: false,
                accountId,
                error: error.message,
                timestamp: new Date()
            };
        }
    }
    
    /**
     * Validate party balance
     * @param {string} partyId - Party ID
     * @param {number} cachedBalance - Cached balance
     * @param {Function} calculateFunction - Function to recalculate
     * @returns {Promise<object>} Validation result
     */
    static async validatePartyBalance(partyId, cachedBalance, calculateFunction) {
        try {
            const calculatedBalance = await calculateFunction(partyId);
            
            const difference = Math.abs(parseFloat(cachedBalance || 0) - parseFloat(calculatedBalance || 0));
            const tolerance = 0.01;
            
            const isValid = difference <= tolerance;
            
            const result = {
                isValid,
                partyId,
                cachedBalance: parseFloat(cachedBalance || 0),
                calculatedBalance: parseFloat(calculatedBalance || 0),
                difference: parseFloat(difference.toFixed(2)),
                tolerance,
                timestamp: new Date()
            };
            
            if (!isValid) {
                console.error(`❌ Party balance validation failed for ${partyId}:`, result);
            } else {
                console.log(`✅ Party balance validated for ${partyId}:`, result);
            }
            
            this.validations.push({
                type: 'partyBalance',
                partyId,
                result,
                timestamp: new Date()
            });
            
            return result;
        } catch (error) {
            console.error(`❌ Error validating party balance for ${partyId}:`, error);
            return {
                isValid: false,
                partyId,
                error: error.message,
                timestamp: new Date()
            };
        }
    }
    
    /**
     * Validate currency conversion
     * @param {number} originalAmount - Original amount
     * @param {string} originalCurrency - Original currency
     * @param {number} convertedAmount - Converted amount
     * @param {string} targetCurrency - Target currency
     * @param {number} exchangeRate - Exchange rate used
     * @returns {object} Validation result
     */
    static validateCurrencyConversion(originalAmount, originalCurrency, convertedAmount, targetCurrency, exchangeRate) {
        if (originalCurrency === targetCurrency) {
            const difference = Math.abs(originalAmount - convertedAmount);
            const isValid = difference <= 0.01;
            
            return {
                isValid,
                originalAmount,
                convertedAmount,
                difference: parseFloat(difference.toFixed(2)),
                message: 'Same currency, amounts should match'
            };
        }
        
        const expectedConverted = originalAmount * exchangeRate;
        const difference = Math.abs(convertedAmount - expectedConverted);
        const tolerance = 0.01;
        const isValid = difference <= tolerance;
        
        const result = {
            isValid,
            originalAmount,
            originalCurrency,
            convertedAmount,
            expectedConverted: parseFloat(expectedConverted.toFixed(2)),
            targetCurrency,
            exchangeRate,
            difference: parseFloat(difference.toFixed(2)),
            tolerance,
            timestamp: new Date()
        };
        
        if (!isValid) {
            console.error('❌ Currency conversion validation failed:', result);
        } else {
            console.log('✅ Currency conversion validated:', result);
        }
        
        this.validations.push({
            type: 'currencyConversion',
            result,
            timestamp: new Date()
        });
        
        return result;
    }
    
    /**
     * Validate general entry structure
     * @param {object} entry - General entry object
     * @returns {object} Validation result
     */
    static validateGeneralEntry(entry) {
        const errors = [];
        const warnings = [];
        
        // Check required fields
        if (!entry.entries || !Array.isArray(entry.entries)) {
            errors.push('Missing or invalid entries array');
        }
        
        if (!entry.date) {
            errors.push('Missing date');
        }
        
        if (!entry.status) {
            warnings.push('Missing status');
        }
        
        // Validate entries
        if (entry.entries && Array.isArray(entry.entries)) {
            if (entry.entries.length < 2) {
                errors.push('Entry must have at least 2 lines (debit and credit)');
            }
            
            // Validate balance
            const balanceResult = this.validateEntryBalance(entry.entries);
            if (!balanceResult.isValid) {
                errors.push(`Entry not balanced: difference = ${balanceResult.difference}`);
            }
            
            // Check each entry line
            entry.entries.forEach((line, index) => {
                if (!line.accountId) {
                    errors.push(`Entry line ${index + 1}: missing accountId`);
                }
                
                const hasDebit = parseFloat(line.debit || 0) > 0;
                const hasCredit = parseFloat(line.credit || 0) > 0;
                
                if (!hasDebit && !hasCredit) {
                    errors.push(`Entry line ${index + 1}: must have debit or credit`);
                }
                
                if (hasDebit && hasCredit) {
                    warnings.push(`Entry line ${index + 1}: has both debit and credit`);
                }
            });
        }
        
        const isValid = errors.length === 0;
        
        const result = {
            isValid,
            errors,
            warnings,
            entryId: entry.id,
            timestamp: new Date()
        };
        
        if (!isValid) {
            console.error('❌ General entry validation failed:', result);
        } else if (warnings.length > 0) {
            console.warn('⚠️ General entry validation passed with warnings:', result);
        } else {
            console.log('✅ General entry validated:', result);
        }
        
        this.validations.push({
            type: 'generalEntry',
            result,
            timestamp: new Date()
        });
        
        return result;
    }
    
    /**
     * Get validation report
     * @returns {object} Report
     */
    static getReport() {
        const total = this.validations.length;
        const passed = this.validations.filter(v => v.result.isValid !== false).length;
        const failed = total - passed;
        
        const byType = {};
        this.validations.forEach(v => {
            if (!byType[v.type]) {
                byType[v.type] = { total: 0, passed: 0, failed: 0 };
            }
            byType[v.type].total++;
            if (v.result.isValid !== false) {
                byType[v.type].passed++;
            } else {
                byType[v.type].failed++;
            }
        });
        
        return {
            total,
            passed,
            failed,
            successRate: total > 0 ? ((passed / total) * 100).toFixed(2) + '%' : '0%',
            byType,
            validations: this.validations
        };
    }
    
    /**
     * Print validation report
     */
    static printReport() {
        const report = this.getReport();
        
        console.group('🔍 Accuracy Validation Report');
        console.log(`Total Validations: ${report.total}`);
        console.log(`Passed: ${report.passed} ✅`);
        console.log(`Failed: ${report.failed} ❌`);
        console.log(`Success Rate: ${report.successRate}`);
        console.groupEnd();
        
        console.group('📊 By Type');
        Object.entries(report.byType).forEach(([type, stats]) => {
            const rate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(2) + '%' : '0%';
            console.log(`${type}: ${stats.passed}/${stats.total} passed (${rate})`);
        });
        console.groupEnd();
        
        // Show failed validations
        const failed = this.validations.filter(v => v.result.isValid === false);
        if (failed.length > 0) {
            console.group('❌ Failed Validations');
            failed.forEach(v => {
                console.error(v);
            });
            console.groupEnd();
        }
    }
    
    /**
     * Clear all validations
     */
    static clear() {
        this.validations = [];
        console.log('✅ Validation history cleared');
    }
    
    /**
     * Export validations
     * @returns {string} JSON string
     */
    static export() {
        return JSON.stringify({
            report: this.getReport(),
            exportedAt: new Date().toISOString()
        }, null, 2);
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.AccuracyValidator = AccuracyValidator;
}

console.log('✅ Accuracy Validator loaded');


