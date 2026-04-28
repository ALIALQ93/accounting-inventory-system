/**
 * Costing Methods - طرق حساب التكلفة
 * FIFO, LIFO, Weighted Average
 */

const CostingMethods = {
    /**
     * Get inventory settings
     * الحصول على إعدادات المخزون
     */
    async getInventorySettings() {
        try {
            const settingsDoc = await db.collection('settings').doc('inventory').get();
            if (settingsDoc.exists) {
                return settingsDoc.data();
            }
            // Default settings
            return {
                costingMethod: 'fifo',
                purchasesAffectCost: true,
                purchaseReturnsAffectCost: true,
                adjustmentsAffectCost: false,
                transfersAffectCost: false
            };
        } catch (error) {
            console.error('Error loading inventory settings:', error);
            return {
                costingMethod: 'fifo',
                purchasesAffectCost: true,
                purchaseReturnsAffectCost: true,
                adjustmentsAffectCost: false,
                transfersAffectCost: false
            };
        }
    },

    /**
     * Calculate product cost using FIFO method
     * حساب تكلفة المنتج باستخدام طريقة FIFO
     * @param {string} productId - Product ID
     * @param {string} warehouseId - Warehouse ID (optional)
     * @param {number} quantity - Quantity to calculate cost for
     * @param {string} expiryDate - Expiry date (optional, for tracking)
     * @param {string} serialNumber - Serial number (optional, for tracking)
     * @returns {Promise<{cost: number, items: Array}>} Cost and items used
     */
    async calculateFIFOCost(productId, warehouseId = null, quantity = 0, expiryDate = null, serialNumber = null) {
        try {
            // Get all purchase movements for this product
            // Note: We need to get all purchases and filter by productId in items array
            let query = db.collection('purchases')
                .where('status', '==', 'completed')
                .orderBy('date', 'asc'); // FIFO: oldest first

            const purchasesSnapshot = await query.get();
            
            const availableItems = [];
            
            // Collect all purchase items
            purchasesSnapshot.forEach(purchaseDoc => {
                const purchase = purchaseDoc.data();
                if (purchase.items && Array.isArray(purchase.items)) {
                    purchase.items.forEach(item => {
                        if (item.productId === productId) {
                            // Check warehouse if specified
                            if (warehouseId && purchase.warehouseId !== warehouseId) {
                                return;
                            }
                            
                            // Check expiry date if specified
                            if (expiryDate && item.expiryDate !== expiryDate) {
                                return;
                            }
                            
                            // Check serial number if specified
                            if (serialNumber && item.serialNumber !== serialNumber) {
                                return;
                            }
                            
                            availableItems.push({
                                purchaseId: purchaseDoc.id,
                                purchaseDate: purchase.date?.toDate ? purchase.date.toDate() : new Date(purchase.date),
                                invoiceNo: purchase.invoiceNo,
                                quantity: item.quantity || 0,
                                unitPrice: item.unitPrice || item.price || 0,
                                unitId: item.unitId,
                                expiryDate: item.expiryDate,
                                serialNumber: item.serialNumber,
                                remainingQuantity: item.quantity || 0 // Track remaining quantity
                            });
                        }
                    });
                }
            });
            
            // Subtract returns
            const returnsSnapshot = await db.collection('purchaseReturns')
                .where('status', '==', 'completed')
                .orderBy('date', 'asc')
                .get();
            
            returnsSnapshot.forEach(returnDoc => {
                const returnData = returnDoc.data();
                if (returnData.items && Array.isArray(returnData.items)) {
                    returnData.items.forEach(returnItem => {
                        if (returnItem.productId === productId) {
                            // Match and subtract from FIFO items
                            let remainingReturnQty = returnItem.quantity || 0;
                            
                            for (let i = 0; i < availableItems.length && remainingReturnQty > 0; i++) {
                                const item = availableItems[i];
                                
                                // Match by expiry/serial if applicable
                                const expiryMatch = !expiryDate || item.expiryDate === returnItem.expiryDate;
                                const serialMatch = !serialNumber || item.serialNumber === returnItem.serialNumber;
                                
                                if (expiryMatch && serialMatch && item.remainingQuantity > 0) {
                                    const deductQty = Math.min(item.remainingQuantity, remainingReturnQty);
                                    item.remainingQuantity -= deductQty;
                                    remainingReturnQty -= deductQty;
                                }
                            }
                        }
                    });
                }
            });
            
            // Calculate cost using FIFO (oldest items first)
            let totalCost = 0;
            let remainingQty = quantity;
            const usedItems = [];
            
            for (const item of availableItems) {
                if (remainingQty <= 0) break;
                if (item.remainingQuantity <= 0) continue;
                
                const useQty = Math.min(item.remainingQuantity, remainingQty);
                const itemCost = useQty * item.unitPrice;
                
                totalCost += itemCost;
                remainingQty -= useQty;
                
                usedItems.push({
                    purchaseId: item.purchaseId,
                    purchaseDate: item.purchaseDate,
                    invoiceNo: item.invoiceNo,
                    quantity: useQty,
                    unitPrice: item.unitPrice,
                    cost: itemCost
                });
            }
            
            if (remainingQty > 0) {
                console.warn(`⚠️ Insufficient stock for FIFO calculation. Remaining: ${remainingQty}`);
            }
            
            return {
                cost: totalCost,
                averageCost: quantity > 0 ? totalCost / quantity : 0,
                items: usedItems,
                remainingQuantity: remainingQty
            };
            
        } catch (error) {
            console.error('Error calculating FIFO cost:', error);
            throw error;
        }
    },

    /**
     * Calculate product cost using LIFO method
     * حساب تكلفة المنتج باستخدام طريقة LIFO
     * @param {string} productId - Product ID
     * @param {string} warehouseId - Warehouse ID (optional)
     * @param {number} quantity - Quantity to calculate cost for
     * @param {string} expiryDate - Expiry date (optional, for tracking)
     * @param {string} serialNumber - Serial number (optional, for tracking)
     * @returns {Promise<{cost: number, items: Array}>} Cost and items used
     */
    async calculateLIFOCost(productId, warehouseId = null, quantity = 0, expiryDate = null, serialNumber = null) {
        try {
            // Get all purchase movements for this product (newest first for LIFO)
            let query = db.collection('purchases')
                .where('status', '==', 'completed')
                .orderBy('date', 'desc'); // LIFO: newest first

            const purchasesSnapshot = await query.get();
            
            const availableItems = [];
            
            // Collect all purchase items
            purchasesSnapshot.forEach(purchaseDoc => {
                const purchase = purchaseDoc.data();
                if (purchase.items && Array.isArray(purchase.items)) {
                    purchase.items.forEach(item => {
                        if (item.productId === productId) {
                            // Check warehouse if specified
                            if (warehouseId && purchase.warehouseId !== warehouseId) {
                                return;
                            }
                            
                            // Check expiry date if specified
                            if (expiryDate && item.expiryDate !== expiryDate) {
                                return;
                            }
                            
                            // Check serial number if specified
                            if (serialNumber && item.serialNumber !== serialNumber) {
                                return;
                            }
                            
                            availableItems.push({
                                purchaseId: purchaseDoc.id,
                                purchaseDate: purchase.date?.toDate ? purchase.date.toDate() : new Date(purchase.date),
                                invoiceNo: purchase.invoiceNo,
                                quantity: item.quantity || 0,
                                unitPrice: item.unitPrice || item.price || 0,
                                unitId: item.unitId,
                                expiryDate: item.expiryDate,
                                serialNumber: item.serialNumber,
                                remainingQuantity: item.quantity || 0
                            });
                        }
                    });
                }
            });
            
            // Subtract returns (process in reverse order for LIFO)
            const returnsSnapshot = await db.collection('purchaseReturns')
                .where('status', '==', 'completed')
                .orderBy('date', 'desc')
                .get();
            
            returnsSnapshot.forEach(returnDoc => {
                const returnData = returnDoc.data();
                if (returnData.items && Array.isArray(returnData.items)) {
                    returnData.items.forEach(returnItem => {
                        if (returnItem.productId === productId) {
                            // Match and subtract from LIFO items (newest first)
                            let remainingReturnQty = returnItem.quantity || 0;
                            
                            for (let i = 0; i < availableItems.length && remainingReturnQty > 0; i++) {
                                const item = availableItems[i];
                                
                                // Match by expiry/serial if applicable
                                const expiryMatch = !expiryDate || item.expiryDate === returnItem.expiryDate;
                                const serialMatch = !serialNumber || item.serialNumber === returnItem.serialNumber;
                                
                                if (expiryMatch && serialMatch && item.remainingQuantity > 0) {
                                    const deductQty = Math.min(item.remainingQuantity, remainingReturnQty);
                                    item.remainingQuantity -= deductQty;
                                    remainingReturnQty -= deductQty;
                                }
                            }
                        }
                    });
                }
            });
            
            // Calculate cost using LIFO (newest items first)
            let totalCost = 0;
            let remainingQty = quantity;
            const usedItems = [];
            
            for (const item of availableItems) {
                if (remainingQty <= 0) break;
                if (item.remainingQuantity <= 0) continue;
                
                const useQty = Math.min(item.remainingQuantity, remainingQty);
                const itemCost = useQty * item.unitPrice;
                
                totalCost += itemCost;
                remainingQty -= useQty;
                
                usedItems.push({
                    purchaseId: item.purchaseId,
                    purchaseDate: item.purchaseDate,
                    invoiceNo: item.invoiceNo,
                    quantity: useQty,
                    unitPrice: item.unitPrice,
                    cost: itemCost
                });
            }
            
            if (remainingQty > 0) {
                console.warn(`⚠️ Insufficient stock for LIFO calculation. Remaining: ${remainingQty}`);
            }
            
            return {
                cost: totalCost,
                averageCost: quantity > 0 ? totalCost / quantity : 0,
                items: usedItems,
                remainingQuantity: remainingQty
            };
            
        } catch (error) {
            console.error('Error calculating LIFO cost:', error);
            throw error;
        }
    },

    /**
     * Calculate product cost using Weighted Average method
     * حساب تكلفة المنتج باستخدام طريقة المتوسط المرجح
     * @param {string} productId - Product ID
     * @param {string} warehouseId - Warehouse ID (optional)
     * @param {string} expiryDate - Expiry date (optional, for tracking)
     * @param {string} serialNumber - Serial number (optional, for tracking)
     * @returns {Promise<{averageCost: number, totalQuantity: number, totalValue: number}>} Weighted average cost
     */
    async calculateWeightedAverageCost(productId, warehouseId = null, expiryDate = null, serialNumber = null) {
        try {
            // Get all purchase movements for this product
            let query = db.collection('purchases')
                .where('status', '==', 'completed');

            const purchasesSnapshot = await query.get();
            
            let totalQuantity = 0;
            let totalValue = 0;
            
            // Calculate total quantity and value from purchases
            purchasesSnapshot.forEach(purchaseDoc => {
                const purchase = purchaseDoc.data();
                if (purchase.items && Array.isArray(purchase.items)) {
                    purchase.items.forEach(item => {
                        if (item.productId === productId) {
                            // Check warehouse if specified
                            if (warehouseId && purchase.warehouseId !== warehouseId) {
                                return;
                            }
                            
                            // Check expiry date if specified
                            if (expiryDate && item.expiryDate !== expiryDate) {
                                return;
                            }
                            
                            // Check serial number if specified
                            if (serialNumber && item.serialNumber !== serialNumber) {
                                return;
                            }
                            
                            const qty = item.quantity || 0;
                            const price = item.unitPrice || item.price || 0;
                            
                            totalQuantity += qty;
                            totalValue += qty * price;
                        }
                    });
                }
            });
            
            // Subtract returns
            const returnsSnapshot = await db.collection('purchaseReturns')
                .where('status', '==', 'completed')
                .get();
            
            returnsSnapshot.forEach(returnDoc => {
                const returnData = returnDoc.data();
                if (returnData.items && Array.isArray(returnData.items)) {
                    returnData.items.forEach(returnItem => {
                        if (returnItem.productId === productId) {
                            // Check warehouse if specified
                            if (warehouseId && returnData.warehouseId !== warehouseId) {
                                return;
                            }
                            
                            // Check expiry date if specified
                            if (expiryDate && returnItem.expiryDate !== expiryDate) {
                                return;
                            }
                            
                            // Check serial number if specified
                            if (serialNumber && returnItem.serialNumber !== serialNumber) {
                                return;
                            }
                            
                            const qty = returnItem.quantity || 0;
                            const price = returnItem.unitPrice || returnItem.price || 0;
                            
                            totalQuantity -= qty;
                            totalValue -= qty * price;
                        }
                    });
                }
            });
            
            // Calculate weighted average
            const averageCost = totalQuantity > 0 ? totalValue / totalQuantity : 0;
            
            return {
                averageCost: averageCost,
                totalQuantity: Math.max(0, totalQuantity),
                totalValue: Math.max(0, totalValue)
            };
            
        } catch (error) {
            console.error('Error calculating weighted average cost:', error);
            throw error;
        }
    },

    /**
     * Calculate product cost based on settings
     * حساب تكلفة المنتج بناءً على الإعدادات
     * @param {string} productId - Product ID
     * @param {string} warehouseId - Warehouse ID (optional)
     * @param {number} quantity - Quantity to calculate cost for (for FIFO/LIFO)
     * @param {string} expiryDate - Expiry date (optional, for tracking)
     * @param {string} serialNumber - Serial number (optional, for tracking)
     * @returns {Promise<{cost: number, method: string, details: Object}>} Calculated cost
     */
    async calculateProductCost(productId, warehouseId = null, quantity = 0, expiryDate = null, serialNumber = null) {
        try {
            const settings = await this.getInventorySettings();
            const costingMethod = settings.costingMethod || 'fifo';
            
            let result;
            
            switch (costingMethod) {
                case 'fifo':
                    result = await this.calculateFIFOCost(productId, warehouseId, quantity, expiryDate, serialNumber);
                    return {
                        cost: result.cost,
                        averageCost: result.averageCost,
                        method: 'FIFO',
                        details: result
                    };
                    
                case 'lifo':
                    result = await this.calculateLIFOCost(productId, warehouseId, quantity, expiryDate, serialNumber);
                    return {
                        cost: result.cost,
                        averageCost: result.averageCost,
                        method: 'LIFO',
                        details: result
                    };
                    
                case 'weighted_average':
                    result = await this.calculateWeightedAverageCost(productId, warehouseId, expiryDate, serialNumber);
                    return {
                        cost: result.averageCost * quantity,
                        averageCost: result.averageCost,
                        method: 'Weighted Average',
                        details: result
                    };
                    
                default:
                    // Default to FIFO
                    result = await this.calculateFIFOCost(productId, warehouseId, quantity, expiryDate, serialNumber);
                    return {
                        cost: result.cost,
                        averageCost: result.averageCost,
                        method: 'FIFO',
                        details: result
                    };
            }
        } catch (error) {
            console.error('Error calculating product cost:', error);
            throw error;
        }
    },

    /**
     * Get last purchase price for a product
     * الحصول على سعر آخر شراء للمنتج
     * @param {string} productId - Product ID
     * @param {string} warehouseId - Warehouse ID (optional)
     * @returns {Promise<number>} Last purchase price
     */
    async getLastPurchasePrice(productId, warehouseId = null) {
        try {
            // Get all completed purchases and filter by productId
            let query = db.collection('purchases')
                .where('status', '==', 'completed')
                .orderBy('date', 'desc');

            const snapshot = await query.get();
            
            // Filter by warehouse if specified
            let purchases = [];
            snapshot.forEach(doc => {
                const purchase = doc.data();
                if (warehouseId && purchase.warehouseId !== warehouseId) {
                    return;
                }
                if (purchase.items && Array.isArray(purchase.items)) {
                    const hasProduct = purchase.items.some(item => item.productId === productId);
                    if (hasProduct) {
                        purchases.push({ id: doc.id, ...purchase });
                    }
                }
            });
            
            if (purchases.length === 0) {
                // Try to get from product default price
                const product = await Collections.getProduct(productId);
                return product?.purchasePrice || 0;
            }
            
            // Get price from first purchase (most recent)
            const purchase = purchases[0];
            if (purchase.items && Array.isArray(purchase.items)) {
                const item = purchase.items.find(i => i.productId === productId);
                if (item) {
                    return item.unitPrice || item.price || 0;
                }
            }
            
            return 0;
        } catch (error) {
            console.error('Error getting last purchase price:', error);
            // Fallback to product default price
            try {
                const product = await Collections.getProduct(productId);
                return product?.purchasePrice || 0;
            } catch (e) {
                return 0;
            }
        }
    }
};

console.log('✅ Costing Methods module loaded');

