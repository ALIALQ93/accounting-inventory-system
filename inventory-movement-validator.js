/**
 * Inventory Movement Validator
 * أداة التحقق من صحة حركات المخزون
 */

class InventoryMovementValidator {
    static validations = [];
    
    /**
     * Validate inventory movement data
     * @param {object} movement - Movement object
     * @param {object} product - Product object
     * @param {number} actualStock - Actual stock in warehouse
     * @returns {object} Validation result
     */
    static validateMovement(movement, product = null, actualStock = null) {
        const errors = [];
        const warnings = [];
        
        // 1. Check required fields
        if (!movement.productId) {
            errors.push('productId is required');
        }
        if (!movement.warehouseId) {
            errors.push('warehouseId is required');
        }
        if (!movement.type) {
            errors.push('type is required');
        }
        if (movement.quantityInMainUnit === undefined || movement.quantityInMainUnit === null) {
            errors.push('quantityInMainUnit is required');
        }
        
        // 2. Validate type
        if (movement.type !== 'in' && movement.type !== 'out' && movement.type !== 'transfer') {
            errors.push(`Invalid type: ${movement.type}. Must be 'in', 'out', or 'transfer'`);
        }
        
        // 3. Validate quantity
        if (movement.quantityInMainUnit <= 0) {
            errors.push('quantityInMainUnit must be positive');
        }
        
        // 4. Validate quantity consistency
        if (movement.type === 'in') {
            if (movement.quantity !== movement.quantityInMainUnit) {
                errors.push(`For type "in", quantity (${movement.quantity}) should equal quantityInMainUnit (${movement.quantityInMainUnit})`);
            }
        } else if (movement.type === 'out') {
            if (movement.quantity !== -movement.quantityInMainUnit) {
                errors.push(`For type "out", quantity (${movement.quantity}) should equal -quantityInMainUnit (${-movement.quantityInMainUnit})`);
            }
        }
        
        // 5. Validate newQuantity calculation
        if (movement.previousQuantity !== undefined && movement.newQuantity !== undefined) {
            const expectedNewQuantity = movement.type === 'in' 
                ? movement.previousQuantity + movement.quantityInMainUnit
                : movement.type === 'out'
                ? movement.previousQuantity - movement.quantityInMainUnit
                : movement.newQuantity; // transfer handled separately
            
            const difference = Math.abs(movement.newQuantity - expectedNewQuantity);
            if (difference > 0.01) {
                errors.push(`newQuantity mismatch: expected ${expectedNewQuantity.toFixed(2)}, got ${movement.newQuantity.toFixed(2)}, difference: ${difference.toFixed(2)}`);
            }
        }
        
        // 6. Validate against actual stock (if provided)
        if (actualStock !== null && actualStock !== undefined && movement.newQuantity !== undefined) {
            const stockDifference = Math.abs(actualStock - movement.newQuantity);
            if (stockDifference > 0.01) {
                errors.push(`Stock mismatch: movement.newQuantity (${movement.newQuantity}) does not match actual stock (${actualStock}), difference: ${stockDifference.toFixed(2)}`);
            }
        }
        
        // 7. Validate source information
        if (movement.sourceType) {
            if (!['purchase', 'sale', 'purchaseReturn', 'saleReturn', 'inventory', 'transfer'].includes(movement.sourceType)) {
                warnings.push(`Unknown sourceType: ${movement.sourceType}`);
            }
            
            if (movement.sourceType !== 'inventory' && !movement.sourceId) {
                warnings.push(`sourceType is "${movement.sourceType}" but sourceId is missing`);
            }
        }
        
        // 8. Validate reference
        if (!movement.reference) {
            warnings.push('reference is missing');
        }
        
        // 9. Validate dates
        if (movement.date && new Date(movement.date) > new Date()) {
            warnings.push('Movement date is in the future');
        }
        
        // 10. Validate cost calculation
        if (movement.unitPrice !== undefined && movement.totalCost !== undefined) {
            const expectedTotalCost = movement.unitPrice * movement.quantityInMainUnit;
            const costDifference = Math.abs(movement.totalCost - expectedTotalCost);
            if (costDifference > 0.01) {
                warnings.push(`totalCost mismatch: expected ${expectedTotalCost.toFixed(2)}, got ${movement.totalCost.toFixed(2)}, difference: ${costDifference.toFixed(2)}`);
            }
        }
        
        // 11. Validate product information
        if (product) {
            if (movement.productId !== product.id) {
                errors.push(`productId mismatch: movement has ${movement.productId}, product has ${product.id}`);
            }
            
            if (movement.productName && movement.productName !== product.name) {
                warnings.push(`productName mismatch: movement has "${movement.productName}", product has "${product.name}"`);
            }
        }
        
        const isValid = errors.length === 0;
        
        const result = {
            isValid,
            errors,
            warnings,
            movementId: movement.id || movement.sourceId,
            timestamp: new Date()
        };
        
        if (!isValid) {
            console.error('❌ Inventory movement validation failed:', result);
        } else if (warnings.length > 0) {
            console.warn('⚠️ Inventory movement validation passed with warnings:', result);
        } else {
            console.log('✅ Inventory movement validated:', {
                type: movement.type,
                productId: movement.productId,
                quantity: movement.quantityInMainUnit
            });
        }
        
        this.validations.push({
            type: 'movement',
            result,
            timestamp: new Date()
        });
        
        return result;
    }
    
    /**
     * Validate movement against actual stock
     * @param {string} productId - Product ID
     * @param {string} warehouseId - Warehouse ID
     * @param {object} movement - Movement object
     * @param {Function} getStockFunction - Function to get actual stock
     * @returns {Promise<object>} Validation result
     */
    static async validateAgainstStock(productId, warehouseId, movement, getStockFunction) {
        try {
            const actualStock = await getStockFunction(productId, warehouseId);
            return this.validateMovement(movement, null, actualStock);
        } catch (error) {
            console.error('❌ Error validating against stock:', error);
            return {
                isValid: false,
                errors: [`Error getting stock: ${error.message}`],
                warnings: [],
                timestamp: new Date()
            };
        }
    }
    
    /**
     * Validate all movements for an invoice
     * @param {string} sourceType - Source type ('purchase', 'sale', etc.)
     * @param {string} sourceId - Source ID (invoice ID)
     * @param {Function} getMovementsFunction - Function to get movements
     * @returns {Promise<object>} Validation result
     */
    static async validateInvoiceMovements(sourceType, sourceId, getMovementsFunction) {
        try {
            const movements = await getMovementsFunction(sourceType, sourceId);
            const results = [];
            
            for (const movement of movements) {
                const validation = this.validateMovement(movement);
                results.push({
                    movementId: movement.id,
                    validation
                });
            }
            
            const allValid = results.every(r => r.validation.isValid);
            const totalErrors = results.reduce((sum, r) => sum + r.validation.errors.length, 0);
            const totalWarnings = results.reduce((sum, r) => sum + r.validation.warnings.length, 0);
            
            return {
                isValid: allValid,
                movementsCount: movements.length,
                validCount: results.filter(r => r.validation.isValid).length,
                invalidCount: results.filter(r => !r.validation.isValid).length,
                totalErrors,
                totalWarnings,
                results,
                sourceType,
                sourceId,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('❌ Error validating invoice movements:', error);
            return {
                isValid: false,
                error: error.message,
                timestamp: new Date()
            };
        }
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
        
        console.group('🔍 Inventory Movement Validation Report');
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
    window.InventoryMovementValidator = InventoryMovementValidator;
}

console.log('✅ Inventory Movement Validator loaded');


