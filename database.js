/**
 * Database Operations for Accounting & Inventory System
 * @module database
 */

/**
 * Get Firestore timestamp
 * @returns {Object} Firestore server timestamp
 */
function getTimestamp() {
    if (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue) {
        return firebase.firestore.FieldValue.serverTimestamp();
    }
    // Fallback to current date if Firebase is not available
    return new Date();
}

/**
 * Database service class
 */
class DatabaseService {
    constructor() {
        this.db = db;
        this.cache = new Map();
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Get collection reference
     * @param {string} collectionName - Collection name
     * @returns {Object} Collection reference
     */
    collection(collectionName) {
        return this.db.collection(collectionName);
    }

    /**
     * Get document with caching
     * @param {string} collectionName - Collection name
     * @param {string} docId - Document ID
     * @param {boolean} useCache - Whether to use cache
     * @returns {Promise<Object>} Document data
     */
    async getDocument(collectionName, docId, useCache = true) {
        const cacheKey = `${collectionName}/${docId}`;
        
        // Check cache
        if (useCache && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheDuration) {
                console.log(`📦 Cache hit: ${cacheKey}`);
                return cached.data;
            }
        }

        // Fetch from database
        const doc = await this.collection(collectionName).doc(docId).get();
        if (!doc.exists) {
            throw new Error('المستند غير موجود');
        }

        const data = { id: doc.id, ...doc.data() };
        
        // Update cache
        if (useCache) {
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
        }

        return data;
    }

    /**
     * Get documents with query
     * @param {string} collectionName - Collection name
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Array of documents
     */
    async getDocuments(collectionName, options = {}) {
        let query = this.collection(collectionName);

        // Apply where clauses
        if (options.where) {
            options.where.forEach(([field, operator, value]) => {
                query = query.where(field, operator, value);
            });
        }

        // Apply orderBy
        if (options.orderBy) {
            const [field, direction = 'asc'] = options.orderBy;
            query = query.orderBy(field, direction);
        }

        // Apply limit
        if (options.limit) {
            query = query.limit(options.limit);
        }

        // Apply startAfter for pagination
        if (options.startAfter) {
            query = query.startAfter(options.startAfter);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    /**
     * Add document to collection
     * @param {string} collectionName - Collection name
     * @param {Object} data - Document data
     * @returns {Promise<Object>} Created document
     */
    async addDocument(collectionName, data) {
        const docData = {
            ...data,
            createdAt: getTimestamp(),
            updatedAt: getTimestamp()
        };

        const docRef = await this.collection(collectionName).add(docData);
        
        // Clear related cache
        this.clearCacheByCollection(collectionName);
        
        return {
            id: docRef.id,
            ...docData
        };
    }

    /**
     * Update document
     * @param {string} collectionName - Collection name
     * @param {string} docId - Document ID
     * @param {Object} data - Update data
     * @returns {Promise<void>}
     */
    async updateDocument(collectionName, docId, data) {
        const updateData = {
            ...data,
            updatedAt: getTimestamp()
        };

        await this.collection(collectionName).doc(docId).update(updateData);
        
        // Clear cache
        const cacheKey = `${collectionName}/${docId}`;
        this.cache.delete(cacheKey);
        this.clearCacheByCollection(collectionName);
    }

    /**
     * Set document (create or overwrite)
     * @param {string} collectionName - Collection name
     * @param {string} docId - Document ID
     * @param {Object} data - Document data
     * @param {boolean} merge - Whether to merge with existing data
     * @returns {Promise<void>}
     */
    async setDocument(collectionName, docId, data, merge = false) {
        const docData = {
            ...data,
            updatedAt: getTimestamp()
        };

        if (!merge) {
            docData.createdAt = getTimestamp();
        }

        await this.collection(collectionName).doc(docId).set(docData, { merge });
        
        // Clear cache
        const cacheKey = `${collectionName}/${docId}`;
        this.cache.delete(cacheKey);
        this.clearCacheByCollection(collectionName);
    }

    /**
     * Delete document
     * @param {string} collectionName - Collection name
     * @param {string} docId - Document ID
     * @returns {Promise<void>}
     */
    async deleteDocument(collectionName, docId) {
        await this.collection(collectionName).doc(docId).delete();
        
        // Clear cache
        const cacheKey = `${collectionName}/${docId}`;
        this.cache.delete(cacheKey);
        this.clearCacheByCollection(collectionName);
    }

    /**
     * Batch write operations
     * @param {Array} operations - Array of operations
     * @returns {Promise<void>}
     */
    async batchWrite(operations) {
        const batch = this.db.batch();

        operations.forEach(op => {
            const ref = this.collection(op.collection).doc(op.id);
            
            switch(op.type) {
                case 'set':
                    batch.set(ref, op.data);
                    break;
                case 'update':
                    batch.update(ref, op.data);
                    break;
                case 'delete':
                    batch.delete(ref);
                    break;
            }
        });

        await batch.commit();
        
        // Clear all cache
        this.clearCache();
    }

    /**
     * Run transaction
     * @param {Function} updateFunction - Transaction update function
     * @returns {Promise<*>} Transaction result
     */
    async runTransaction(updateFunction) {
        return await this.db.runTransaction(updateFunction);
    }

    /**
     * Clear cache by collection
     * @param {string} collectionName - Collection name
     */
    clearCacheByCollection(collectionName) {
        for (const key of this.cache.keys()) {
            if (key.startsWith(collectionName + '/')) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear all cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache cleared');
    }

    /**
     * Get cache size
     * @returns {number} Cache size
     */
    getCacheSize() {
        return this.cache.size;
    }
}

/**
 * Query builder class
 */
class QueryBuilder {
    constructor(collectionName) {
        this.collectionName = collectionName;
        this.whereClause = [];
        this.orderByClause = null;
        this.limitValue = null;
        this.startAfterDoc = null;
    }

    where(field, operator, value) {
        this.whereClause.push([field, operator, value]);
        return this;
    }

    orderBy(field, direction = 'asc') {
        this.orderByClause = [field, direction];
        return this;
    }

    limit(limit) {
        this.limitValue = limit;
        return this;
    }

    startAfter(doc) {
        this.startAfterDoc = doc;
        return this;
    }

    async execute() {
        return await dbService.getDocuments(this.collectionName, {
            where: this.whereClause.length > 0 ? this.whereClause : undefined,
            orderBy: this.orderByClause,
            limit: this.limitValue,
            startAfter: this.startAfterDoc
        });
    }
}

// Create database service instance
const dbService = new DatabaseService();

/**
 * Create query builder
 * @param {string} collectionName - Collection name
 * @returns {QueryBuilder} Query builder instance
 */
function query(collectionName) {
    return new QueryBuilder(collectionName);
}

/**
 * Specific collection helpers
 */
const Collections = {
    // Products
    async getProducts(options = {}) {
        return await dbService.getDocuments('products', {
            orderBy: ['createdAt', 'desc'],
            limit: options.limit || 100,
            ...options
        });
    },

    async getProduct(productId) {
        return await dbService.getDocument('products', productId);
    },

    async addProduct(productData) {
        // Validate product data
        if (!productData.code && !productData.sku) {
            throw new Error('كود المنتج مطلوب');
        }
        if (!productData.name) {
            throw new Error('اسم المنتج مطلوب');
        }

        // Check for duplicates in database
        const code = productData.code || productData.sku;
        const name = productData.name;
        
        const existingProducts = await db.collection('products')
            .where('code', '==', code)
            .get();
            
        if (!existingProducts.empty) {
            throw new Error('كود المنتج موجود مسبقاً في قاعدة البيانات');
        }
        
        const existingProductsByName = await db.collection('products')
            .where('name', '==', name)
            .get();
            
        if (!existingProductsByName.empty) {
            throw new Error('اسم المنتج موجود مسبقاً في قاعدة البيانات');
        }

        // Prepare product data with proper field mapping
        const product = {
            // Basic info
            code: productData.code || productData.sku,
            name: productData.name,
            name2: productData.name2 || '',
            description: productData.description || '',
            barcode: productData.barcode || '',
            brand: productData.brand || '',
            
            // Classification
            categoryId: productData.categoryId,
            categoryName: productData.categoryName || '',
            unitId: productData.unitId,
            unitName: productData.unitName || '',
            warehouseId: productData.warehouseId || null, // Default warehouse
            
            // Pricing - map old field names to new ones
            purchasePrice: productData.purchasePrice || 0,
            sellingPrice: productData.sellingPrice || productData.price || 0,
            wholesalePrice: productData.wholesalePrice || 0,
            
            // Inventory
            currentStock: productData.currentStock || productData.stock || 0,
            minStock: productData.minStock || 0,
            warehouseStock: productData.warehouseStock || {}, // Stock per warehouse
            
            // Currency
            currency: productData.currency || 'IQD',
            
            // Advanced tracking
            hasExpiryDate: productData.hasExpiryDate || false,
            expiryWarningDays: productData.expiryWarningDays || 30,
            hasSerialNumber: productData.hasSerialNumber || false,
            
            // Sub units
            subUnits: productData.subUnits || [],
            
            // Status
            status: productData.status || 'active',
            
            // Timestamps and user tracking
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: auth.currentUser?.uid || 'system',
            updatedBy: auth.currentUser?.uid || 'system',
            
            // Notes
            notes: productData.notes || '',
            
            // Image
            image: productData.image || null
        };

        const result = await dbService.addDocument('products', product);
        
        // Return the created product with ID
        return {
            id: result.id,
            ...product
        };
    },

    async updateProduct(productId, productData) {
        console.log('💾 Updating product:', productId);
        console.log('💾 Product data:', productData);
        
        // Prepare update data with proper field mapping
        const updateData = {
            ...productData,
            updatedAt: new Date(),
            updatedBy: auth.currentUser?.uid || 'system'
        };

        // Map old field names to new ones if they exist
        if (productData.price && !productData.sellingPrice) {
            updateData.sellingPrice = productData.price;
        }
        if (productData.stock && !productData.currentStock) {
            updateData.currentStock = productData.stock;
        }
        if (productData.sku && !productData.code) {
            updateData.code = productData.sku;
        }
        
        // Ensure categoryName and unitName are preserved if not provided
        // Only fetch if really needed (optimization)
        if ((!updateData.categoryName && updateData.categoryId) || (!updateData.unitName && updateData.unitId)) {
            try {
                const existingProduct = await this.getProduct(productId);
                if (existingProduct) {
                    if (!updateData.categoryName && updateData.categoryId && existingProduct.categoryName) {
                        updateData.categoryName = existingProduct.categoryName;
                    }
                    if (!updateData.unitName && updateData.unitId && existingProduct.unitName) {
                        updateData.unitName = existingProduct.unitName;
                    }
                }
            } catch (e) {
                console.warn('⚠️ Could not fetch existing product for names, using provided data');
            }
        }

        console.log('💾 Final update data:', updateData);
        await dbService.updateDocument('products', productId, updateData);
        
        // Return updated product data
        return {
            id: productId,
            ...updateData
        };
    },

    async deleteProduct(productId) {
        return await dbService.deleteDocument('products', productId);
    },

    /**
     * Migrate existing product data to new schema
     * تحويل بيانات المنتجات الموجودة إلى الهيكل الجديد
     */
    async migrateProductsData() {
        try {
            console.log('🔄 Starting products data migration...');
            
            const products = await this.getProducts();
            let migratedCount = 0;
            
            for (const product of products) {
                const updateData = {};
                let needsUpdate = false;
                
                // Map old field names to new ones
                if (product.price && !product.sellingPrice) {
                    updateData.sellingPrice = product.price;
                    needsUpdate = true;
                }
                
                if (product.stock && !product.currentStock) {
                    updateData.currentStock = product.stock;
                    needsUpdate = true;
                }
                
                if (product.sku && !product.code) {
                    updateData.code = product.sku;
                    needsUpdate = true;
                }
                
                // Add missing fields
                if (!product.createdBy) {
                    updateData.createdBy = 'system';
                    needsUpdate = true;
                }
                
                if (!product.updatedBy) {
                    updateData.updatedBy = 'system';
                    needsUpdate = true;
                }
                
                if (!product.currency) {
                    updateData.currency = 'IQD';
                    needsUpdate = true;
                }
                
                if (needsUpdate) {
                    await this.updateProduct(product.id, updateData);
                    migratedCount++;
                    console.log(`✅ Migrated product: ${product.name}`);
                }
            }
            
            console.log(`🎉 Migration completed! ${migratedCount} products updated.`);
            return { success: true, migratedCount };
            
        } catch (error) {
            console.error('❌ Migration failed:', error);
            throw error;
        }
    },

    // Sales
    async getSales(options = {}) {
        return await dbService.getDocuments('sales', {
            orderBy: ['createdAt', 'desc'],
            limit: options.limit || 50,
            ...options
        });
    },

    async getSale(saleId) {
        return await dbService.getDocument('sales', saleId);
    },

    async addSale(saleData) {
        // Validate sale data
        if (!saleData.items || saleData.items.length === 0) {
            throw new Error('يجب إضافة منتج واحد على الأقل');
        }

        return await dbService.addDocument('sales', saleData);
    },

    async updateSale(saleId, saleData) {
        if (!saleId) {
            throw new Error('معرّف الفاتورة غير موجود للتحديث');
        }
        // Basic validation to avoid empty items
        if (saleData && saleData.items && saleData.items.length === 0) {
            throw new Error('يجب إضافة منتج واحد على الأقل');
        }
        return await dbService.updateDocument('sales', saleId, saleData);
    },
    
    async deleteSale(saleId) {
        if (!saleId) {
            throw new Error('معرّف الفاتورة غير موجود للحذف');
        }
        return await dbService.deleteDocument('sales', saleId);
    },

    // Purchases
    async getPurchases(options = {}) {
        return await dbService.getDocuments('purchases', {
            orderBy: ['createdAt', 'desc'],
            limit: options.limit || 50,
            ...options
        });
    },

    async getPurchase(purchaseId) {
        return await dbService.getDocument('purchases', purchaseId);
    },

    async addPurchase(purchaseData) {
        // Validate purchase data
        if (!purchaseData.items || purchaseData.items.length === 0) {
            throw new Error('يجب إضافة منتج واحد على الأقل');
        }

        return await dbService.addDocument('purchases', purchaseData);
    },

    async updatePurchase(purchaseId, purchaseData) {
        if (!purchaseId) {
            throw new Error('معرّف الفاتورة غير موجود للتحديث');
        }
        // Basic validation to avoid empty items
        if (purchaseData && purchaseData.items && purchaseData.items.length === 0) {
            throw new Error('يجب إضافة منتج واحد على الأقل');
        }
        return await dbService.updateDocument('purchases', purchaseId, purchaseData);
    },
    
    async deletePurchase(purchaseId) {
        if (!purchaseId) {
            throw new Error('معرّف الفاتورة غير موجود للحذف');
        }
        return await dbService.deleteDocument('purchases', purchaseId);
    },

    // Purchase Returns
    async getPurchaseReturns(options = {}) {
        return await dbService.getDocuments('purchaseReturns', {
            orderBy: ['createdAt', 'desc'],
            limit: options.limit || 50,
            ...options
        });
    },

    async getPurchaseReturn(returnId) {
        return await dbService.getDocument('purchaseReturns', returnId);
    },

    async addPurchaseReturn(returnData) {
        // Validate return data
        if (!returnData.items || returnData.items.length === 0) {
            throw new Error('يجب إضافة منتج واحد على الأقل');
        }
        // Mark as return type
        returnData.type = 'purchase_return';
        return await dbService.addDocument('purchaseReturns', returnData);
    },

    async updatePurchaseReturn(returnId, returnData) {
        if (!returnId) {
            throw new Error('معرّف فاتورة المرتجع غير موجود للتحديث');
        }
        if (returnData && returnData.items && returnData.items.length === 0) {
            throw new Error('يجب إضافة منتج واحد على الأقل');
        }
        return await dbService.updateDocument('purchaseReturns', returnId, returnData);
    },
    
    async deletePurchaseReturn(returnId) {
        if (!returnId) {
            throw new Error('معرّف فاتورة المرتجع غير موجود للحذف');
        }
        return await dbService.deleteDocument('purchaseReturns', returnId);
    },

    // Sales Returns
    async getSalesReturns(options = {}) {
        return await dbService.getDocuments('salesReturns', {
            orderBy: ['createdAt', 'desc'],
            limit: options.limit || 50,
            ...options
        });
    },

    async getSalesReturn(returnId) {
        return await dbService.getDocument('salesReturns', returnId);
    },

    async addSalesReturn(returnData) {
        // Validate return data
        if (!returnData.items || returnData.items.length === 0) {
            throw new Error('يجب إضافة منتج واحد على الأقل');
        }
        // Mark as return type
        returnData.type = 'sales_return';
        return await dbService.addDocument('salesReturns', returnData);
    },

    async updateSalesReturn(returnId, returnData) {
        if (!returnId) {
            throw new Error('معرّف فاتورة المرتجع غير موجود للتحديث');
        }
        if (returnData && returnData.items && returnData.items.length === 0) {
            throw new Error('يجب إضافة منتج واحد على الأقل');
        }
        return await dbService.updateDocument('salesReturns', returnId, returnData);
    },
    
    async deleteSalesReturn(returnId) {
        if (!returnId) {
            throw new Error('معرّف فاتورة المرتجع غير موجود للحذف');
        }
        return await dbService.deleteDocument('salesReturns', returnId);
    },

    /**
     * General Entries (for vouchers/auto entries)
     */
    async addGeneralEntry(entryData) {
        const payload = {
            ...entryData,
            createdAt: entryData?.createdAt || new Date(),
            updatedAt: new Date()
        };
        return await dbService.addDocument('generalEntries', payload);
    },

    // Parties (Customers & Suppliers)
    async getParties(type = null, options = {}) {
        const queryOptions = {
            orderBy: ['createdAt', 'desc'],
            ...options
        };

        if (type) {
            queryOptions.where = [['type', 'in', type === 'customer' ? ['customer', 'both'] : ['supplier', 'both']]];
        }

        return await dbService.getDocuments('parties', queryOptions);
    },

    async getParty(partyId) {
        return await dbService.getDocument('parties', partyId);
    },

    async addParty(partyData) {
        // Validate party data
        if (!partyData.name || !partyData.type) {
            throw new Error('الاسم والنوع مطلوبان');
        }

        return await dbService.addDocument('parties', partyData);
    },

    async updateParty(partyId, partyData) {
        return await dbService.updateDocument('parties', partyId, partyData);
    },

    // Settings
    async getSettings(settingName) {
        return await dbService.getDocument('settings', settingName, true);
    },

    async saveSettings(settingName, settingData) {
        return await dbService.setDocument('settings', settingName, settingData, true);
    },

    // Inventory
    async getInventoryMovements(options = {}) {
        return await dbService.getDocuments('inventoryMovements', {
            orderBy: ['createdAt', 'desc'],
            limit: options.limit || 100,
            ...options
        });
    },

    async addInventoryMovement(movementData) {
        return await dbService.addDocument('inventoryMovements', movementData);
    },

    /**
     * Delete inventory movements by source type and source ID
     * @param {string} sourceType - Source type (e.g., 'purchase', 'sale', 'purchase_return', 'sale_return')
     * @param {string} sourceId - Source ID
     * @returns {Promise<number>} Number of deleted movements
     */
    async deleteInventoryMovementsBySource(sourceType, sourceId) {
        try {
            const sourceIdStr = String(sourceId);
            
            // Query inventory movements by sourceType and sourceId
            let snapshot;
            try {
                snapshot = await db.collection('inventoryMovements')
                    .where('sourceType', '==', sourceType)
                    .where('sourceId', '==', sourceIdStr)
                    .get();
            } catch (error) {
                console.warn('⚠️ Direct query failed, trying fallback:', error);
                // Fallback: fetch all and filter
                const allSnapshot = await db.collection('inventoryMovements').get();
                const allMovements = allSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const matchingMovements = allMovements.filter(m => 
                    String(m.sourceId) === sourceIdStr && m.sourceType === sourceType
                );
                
                if (matchingMovements.length > 0) {
                    for (const movement of matchingMovements) {
                        await db.collection('inventoryMovements').doc(movement.id).delete();
                    }
                    return matchingMovements.length;
                }
                return 0;
            }

            if (!snapshot.empty) {
                let deletedCount = 0;
                for (const doc of snapshot.docs) {
                    await db.collection('inventoryMovements').doc(doc.id).delete();
                    deletedCount++;
                }
                return deletedCount;
            }
            return 0;
        } catch (error) {
            console.error('❌ Error deleting inventory movements:', error);
            throw error;
        }
    },

    // Cashflow
    async getCashflowTransactions(options = {}) {
        return await dbService.getDocuments('cashflow', {
            orderBy: ['createdAt', 'desc'],
            limit: options.limit || 100,
            ...options
        });
    },

    async addCashflowTransaction(transactionData) {
        return await dbService.addDocument('cashflow', transactionData);
    },

    // Warehouses
    async getWarehouses(options = {}) {
        const queryOptions = {
            orderBy: ['createdAt', 'desc'],
            limit: options.limit || 100,
            ...options
        };

        // If no specific status filter, get all warehouses
        if (!options.status) {
            delete queryOptions.where;
        }

        return await dbService.getDocuments('warehouses', queryOptions);
    },

    async getWarehouse(warehouseId) {
        return await dbService.getDocument('warehouses', warehouseId);
    },

    async addWarehouse(warehouseData) {
        // Validate warehouse data
        if (!warehouseData.code) {
            throw new Error('كود المستودع مطلوب');
        }
        if (!warehouseData.name) {
            throw new Error('اسم المستودع مطلوب');
        }
        if (!warehouseData.type) {
            throw new Error('نوع المستودع مطلوب');
        }

        // Check for duplicate code
        const existingWarehouses = await db.collection('warehouses')
            .where('code', '==', warehouseData.code)
            .get();
            
        if (!existingWarehouses.empty) {
            throw new Error('كود المستودع موجود مسبقاً');
        }

        const warehouse = {
            code: warehouseData.code,
            name: warehouseData.name,
            description: warehouseData.description || '',
            type: warehouseData.type,
            status: warehouseData.status || 'active',
            location: warehouseData.location || '',
            manager: warehouseData.manager || '',
            phone: warehouseData.phone || '',
            email: warehouseData.email || '',
            notes: warehouseData.notes || '',
            productsCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: auth.currentUser?.uid || 'system',
            updatedBy: auth.currentUser?.uid || 'system'
        };

        return await dbService.addDocument('warehouses', warehouse);
    },

    async updateWarehouse(warehouseId, warehouseData) {
        const updateData = {
            ...warehouseData,
            updatedAt: new Date(),
            updatedBy: auth.currentUser?.uid || 'system'
        };

        return await dbService.updateDocument('warehouses', warehouseId, updateData);
    },

    async deleteWarehouse(warehouseId) {
        // Check if warehouse has products
        const products = await db.collection('products')
            .where('warehouseId', '==', warehouseId)
            .get();
            
        if (!products.empty) {
            throw new Error('لا يمكن حذف المستودع لأنه يحتوي على منتجات');
        }

        return await dbService.deleteDocument('warehouses', warehouseId);
    },

    // Warehouse Inventory
    async getWarehouseInventory(warehouseId) {
        return await dbService.getDocuments('warehouse_inventory', {
            where: [['warehouseId', '==', warehouseId]],
            orderBy: ['updatedAt', 'desc']
        });
    },

    async addWarehouseInventory(inventoryData) {
        return await dbService.addDocument('warehouse_inventory', inventoryData);
    },

    async updateWarehouseInventory(inventoryId, inventoryData) {
        return await dbService.updateDocument('warehouse_inventory', inventoryId, inventoryData);
    },

    // ⚠️ Warehouse Movements - DEPRECATED
    // تم إلغاء استخدام حركات المستودع (warehouse_movements) بشكل كامل
    // إدارة المخزون فقط (inventoryMovements) هي المسؤولة عن جميع حركات المخزون
    // هذه الدوال موجودة فقط للتوافق مع الكود القديم، لكن لا يتم استدعاؤها من أي مكان
    
    async getWarehouseMovements(warehouseId, options = {}) {
        // ⚠️ DEPRECATED: لا تستخدم هذه الدالة - استخدم inventoryMovements بدلاً منها
        console.warn('⚠️ getWarehouseMovements is deprecated. Use inventoryMovements collection instead.');
        return [];
    },

    async addWarehouseMovement(movementData) {
        // ⚠️ DEPRECATED: لا تستخدم هذه الدالة - استخدم inventoryMovements بدلاً منها
        // إدارة المخزون فقط (inventoryMovements) هي المسؤولة عن جميع حركات المخزون
        console.warn('⚠️ addWarehouseMovement is deprecated. Use inventoryMovements collection instead.');
        // لا ننشئ أي حركة في warehouse_movements
        return null;
    },

    // Multi-Warehouse Inventory Management
    async updateProductWarehouseStock(productId, warehouseId, quantity, operation = 'set') {
        try {
            const product = await this.getProduct(productId);
            if (!product) {
                throw new Error('المنتج غير موجود');
            }

            const warehouseStock = product.warehouseStock || {};
            
            switch(operation) {
                case 'add':
                    warehouseStock[warehouseId] = (warehouseStock[warehouseId] || 0) + quantity;
                    break;
                case 'subtract':
                    const currentStock = warehouseStock[warehouseId] || 0;
                    // ⚠️ CRITICAL: Check if enough stock is available before subtracting
                    // Note: This is a general check. Specific checks for expiry/serial should be done before calling this function
                    if (currentStock < quantity) {
                        console.warn(`⚠️ Warning: Attempting to subtract ${quantity} from stock ${currentStock} for product ${productId} in warehouse ${warehouseId}. Result will be 0.`);
                        // Don't throw error here - let the caller handle it
                        // But log a warning for debugging
                    }
                    warehouseStock[warehouseId] = Math.max(0, currentStock - quantity);
                    break;
                case 'set':
                default:
                    warehouseStock[warehouseId] = quantity;
                    break;
            }

            // Update total stock
            const totalStock = Object.values(warehouseStock).reduce((sum, stock) => sum + stock, 0);

            await this.updateProduct(productId, {
                warehouseStock: warehouseStock,
                currentStock: totalStock
            });

            // ✅ لم نعد ننشئ حركة منفصلة في warehouse_movements هنا.
            // الحركات التفصيلية للمشتريات/المبيعات/المرتجعات تُسجَّل في مجموعة inventoryMovements
            // من داخل وحدات المبيعات والمشتريات والمخزون.

            return warehouseStock[warehouseId];

        } catch (error) {
            console.error('Error updating warehouse stock:', error);
            throw error;
        }
    },

    async getProductWarehouseStock(productId) {
        try {
            const product = await this.getProduct(productId);
            return product?.warehouseStock || {};
        } catch (error) {
            console.error('Error getting product warehouse stock:', error);
            throw error;
        }
    },

    /**
     * Recalculate and update warehouse stock for a product based on inventoryMovements
     * ✅ هذه الدالة تحسب الرصيد من inventoryMovements مباشرة وتحدّث warehouseStock
     * @param {string} productId - Product ID
     * @returns {Promise<Object>} Updated warehouseStock object
     */
    async recalculateProductWarehouseStock(productId) {
        try {
            // Get all inventory movements for this product
            const movementsSnapshot = await db.collection('inventoryMovements')
                .where('productId', '==', productId)
                .get();

            const warehouseStock = {}; // { warehouseId: quantity }

            // Process all movements
            movementsSnapshot.forEach(movementDoc => {
                const movement = movementDoc.data();
                const warehouseId = movement.warehouseId || 'default';
                const toWarehouseId = movement.toWarehouseId || null;
                const quantityInMainUnit = Math.abs(movement.quantityInMainUnit || movement.quantity || 0);

                // Update quantity based on movement type
                if (movement.type === 'in') {
                    // Entry: add quantity to source warehouse
                    if (!warehouseStock[warehouseId]) {
                        warehouseStock[warehouseId] = 0;
                    }
                    warehouseStock[warehouseId] += quantityInMainUnit;
                } else if (movement.type === 'out') {
                    // Exit: subtract quantity from source warehouse
                    if (!warehouseStock[warehouseId]) {
                        warehouseStock[warehouseId] = 0;
                    }
                    warehouseStock[warehouseId] = Math.max(0, warehouseStock[warehouseId] - quantityInMainUnit);
                } else if (movement.type === 'transfer') {
                    // Transfer: subtract from source warehouse, add to destination warehouse
                    // Source warehouse (from)
                    if (!warehouseStock[warehouseId]) {
                        warehouseStock[warehouseId] = 0;
                    }
                    warehouseStock[warehouseId] = Math.max(0, warehouseStock[warehouseId] - quantityInMainUnit);
                    
                    // Destination warehouse (to)
                    if (toWarehouseId) {
                        if (!warehouseStock[toWarehouseId]) {
                            warehouseStock[toWarehouseId] = 0;
                        }
                        warehouseStock[toWarehouseId] += quantityInMainUnit;
                    }
                } else if (movement.type === 'adjustment') {
                    // Manual adjustment: set quantity directly for the warehouse
                    if (!warehouseStock[warehouseId]) {
                        warehouseStock[warehouseId] = 0;
                    }
                    warehouseStock[warehouseId] = movement.newQuantity || 0;
                }
            });

            // Calculate total stock
            const totalStock = Object.values(warehouseStock).reduce((sum, stock) => sum + stock, 0);

            // Update product with recalculated stock
            await this.updateProduct(productId, {
                warehouseStock: warehouseStock,
                currentStock: totalStock
            });

            console.log(`✅ Recalculated warehouse stock for product ${productId}:`, warehouseStock, `Total: ${totalStock}`);

            return warehouseStock;
        } catch (error) {
            console.error('Error recalculating product warehouse stock:', error);
            throw error;
        }
    },

    async getWarehouseProducts(warehouseId) {
        try {
            const products = await this.getProducts();
            return products.filter(product => 
                product.warehouseStock && product.warehouseStock[warehouseId] > 0
            );
        } catch (error) {
            console.error('Error getting warehouse products:', error);
            throw error;
        }
    },

    async transferProductBetweenWarehouses(productId, fromWarehouseId, toWarehouseId, quantity) {
        try {
            const product = await this.getProduct(productId);
            if (!product) {
                throw new Error('المنتج غير موجود');
            }

            const warehouseStock = product.warehouseStock || {};
            const fromStock = warehouseStock[fromWarehouseId] || 0;
            
            if (fromStock < quantity) {
                throw new Error('الكمية المتاحة غير كافية');
            }

            // Update stock
            warehouseStock[fromWarehouseId] = fromStock - quantity;
            warehouseStock[toWarehouseId] = (warehouseStock[toWarehouseId] || 0) + quantity;

            // Update total stock
            const totalStock = Object.values(warehouseStock).reduce((sum, stock) => sum + stock, 0);

            await this.updateProduct(productId, {
                warehouseStock: warehouseStock,
                currentStock: totalStock
            });

            // ✅ لم نعد ننشئ حركات في warehouse_movements
            // حركات النقل بين المستودعات يجب أن تُسجّل في inventoryMovements
            // من داخل وحدة إدارة المخزون (InventoryModule) وليس من هنا
            // هذه الدالة فقط تحدّث رصيد المنتج في المستودعات

            return true;

        } catch (error) {
            console.error('Error transferring product:', error);
            throw error;
        }
    },

    // Categories
    async getCategories(options = {}) {
        return await dbService.getDocuments('categories', {
            orderBy: ['createdAt', 'desc'],
            limit: options.limit || 100,
            ...options
        });
    },

    async getCategory(categoryId) {
        return await dbService.getDocument('categories', categoryId);
    },

    async addCategory(categoryData) {
        // Validate category data
        if (!categoryData.name) {
            throw new Error('اسم الفئة مطلوب');
        }
        if (!categoryData.code) {
            throw new Error('كود الفئة مطلوب');
        }

        const category = {
            name: categoryData.name,
            code: categoryData.code,
            description: categoryData.description || '',
            color: categoryData.color || '#3498db',
            icon: categoryData.icon || 'fas fa-folder',
            status: categoryData.status || 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: auth.currentUser?.uid || 'system',
            updatedBy: auth.currentUser?.uid || 'system'
        };

        return await dbService.addDocument('categories', category);
    },

    async updateCategory(categoryId, categoryData) {
        const updateData = {
            ...categoryData,
            updatedAt: new Date(),
            updatedBy: auth.currentUser?.uid || 'system'
        };

        return await dbService.updateDocument('categories', categoryId, updateData);
    },

    async deleteCategory(categoryId) {
        return await dbService.deleteDocument('categories', categoryId);
    },

    // Units
    async getUnits(options = {}) {
        return await dbService.getDocuments('units', {
            orderBy: ['createdAt', 'desc'],
            limit: options.limit || 100,
            ...options
        });
    },

    async getUnit(unitId) {
        return await dbService.getDocument('units', unitId);
    },

    async addUnit(unitData) {
        // Validate unit data
        if (!unitData.name) {
            throw new Error('اسم الوحدة مطلوب');
        }
        if (!unitData.code) {
            throw new Error('كود الوحدة مطلوب');
        }

        const unit = {
            name: unitData.name,
            code: unitData.code,
            symbol: unitData.symbol || '',
            description: unitData.description || '',
            status: unitData.status || 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: auth.currentUser?.uid || 'system',
            updatedBy: auth.currentUser?.uid || 'system'
        };

        return await dbService.addDocument('units', unit);
    },

    async updateUnit(unitId, unitData) {
        const updateData = {
            ...unitData,
            updatedAt: new Date(),
            updatedBy: auth.currentUser?.uid || 'system'
        };

        return await dbService.updateDocument('units', unitId, updateData);
    },

    async deleteUnit(unitId) {
        return await dbService.deleteDocument('units', unitId);
    },

    // Sales Reps
    async getSalesReps() {
        try {
            const snapshot = await db.collection('salesReps').get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting sales reps:', error);
            throw error;
        }
    },

    async getSalesRep(salesRepId) {
        try {
            const doc = await db.collection('salesReps').doc(salesRepId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            } else {
                throw new Error('Sales rep not found');
            }
        } catch (error) {
            console.error('Error getting sales rep:', error);
            throw error;
        }
    },

    async addSalesRep(salesRepData) {
        try {
            // Remove createdAt and updatedAt from data if they exist, we'll set them properly
            const { createdAt, updatedAt, ...cleanData } = salesRepData;
            const docRef = await db.collection('salesReps').add({
                ...cleanData,
                createdAt: createdAt || new Date(),
                updatedAt: new Date()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error adding sales rep:', error);
            throw error;
        }
    },

    async updateSalesRep(salesRepId, salesRepData) {
        try {
            await db.collection('salesReps').doc(salesRepId).update({
                ...salesRepData,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error updating sales rep:', error);
            throw error;
        }
    },

    async deleteSalesRep(salesRepId) {
        try {
            await db.collection('salesReps').doc(salesRepId).delete();
        } catch (error) {
            console.error('Error deleting sales rep:', error);
            throw error;
        }
    },

    // Cost Centers
    async getCostCenters() {
        try {
            const snapshot = await db.collection('costCenters').get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting cost centers:', error);
            throw error;
        }
    },

    async getCostCenter(costCenterId) {
        try {
            const doc = await db.collection('costCenters').doc(costCenterId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            } else {
                throw new Error('Cost center not found');
            }
        } catch (error) {
            console.error('Error getting cost center:', error);
            throw error;
        }
    },

    async addCostCenter(costCenterData) {
        try {
            const docRef = await db.collection('costCenters').add({
                ...costCenterData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error adding cost center:', error);
            throw error;
        }
    },

    async updateCostCenter(costCenterId, costCenterData) {
        try {
            await db.collection('costCenters').doc(costCenterId).update({
                ...costCenterData,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error updating cost center:', error);
            throw error;
        }
    },

    async deleteCostCenter(costCenterId) {
        try {
            await db.collection('costCenters').doc(costCenterId).delete();
        } catch (error) {
            console.error('Error deleting cost center:', error);
            throw error;
        }
    },

    // Accounts
    async getAccounts() {
        try {
            return await ChartOfAccountsModule.getAccounts();
        } catch (error) {
            console.error('Error getting accounts:', error);
            throw error;
        }
    },

    async getAccount(accountId) {
        try {
            await ChartOfAccountsModule.getAccounts();
            const account = ChartOfAccountsModule.getAccountById(accountId);
            if (account) return account;
            throw new Error('Account not found');
        } catch (error) {
            console.error('Error getting account:', error);
            throw error;
        }
    },

    // Note: Account operations are handled by ChartOfAccountsModule
    // which uses 'chartOfAccounts' collection, not 'accounts' collection

    /**
     * Get available inventory items with expiry dates and serial numbers for a product in a warehouse
     * @param {string} productId - Product ID
     * @param {string} warehouseId - Warehouse ID
     * @returns {Promise<Array>} Array of inventory items with expiry dates and serial numbers
     */
    async getAvailableInventoryItems(productId, warehouseId) {
        try {
            // ✅ إعادة كتابة الدالة لتعتمد على inventoryMovements بدلاً من فواتير المشتريات مباشرة
            // هذا يضمن أن الأرصدة دقيقة حتى بعد حذف الفواتير
            
            // Get product to check tracking requirements
            const product = await this.getProduct(productId);
            const hasExpiry = product?.hasExpiryDate || false;
            const hasSerial = product?.hasSerialNumber || false;
            
            // ✅ الحصول على جميع حركات المخزون لهذا المنتج في هذا المستودع من inventoryMovements
            // نحتاج إلى حركات حيث warehouseId هو هذا المستودع (دخول/خروج/نقل من)
            // أو حركات نقل حيث toWarehouseId هو هذا المستودع (نقل إلى)
            const movementsSnapshot = await db.collection('inventoryMovements')
                .where('productId', '==', productId)
                .get();
            
            // تصفية الحركات المتعلقة بهذا المستودع
            const relevantMovements = movementsSnapshot.docs
                .map(doc => doc.data())
                .filter(movement => {
                    // حركة في هذا المستودع (دخول/خروج/تعديل)
                    if (movement.warehouseId === warehouseId) {
                        return true;
                    }
                    // حركة نقل إلى هذا المستودع
                    if (movement.type === 'transfer' && movement.toWarehouseId === warehouseId) {
                        return true;
                    }
                    return false;
                });

            const inventoryItems = [];
            const itemMap = new Map(); // Map to track unique items based on tracking type

            // معالجة كل حركة مخزون
            relevantMovements.forEach(movement => {
                
                // بناء المفتاح بناءً على متطلبات التتبع
                let key = '';
                let trackingData = {};
                
                if (hasExpiry && hasSerial) {
                    // كلاهما: تتبع بالاثنين
                    if (movement.expiryDate && movement.serialNumber) {
                        key = `expiry_${movement.expiryDate}_serial_${movement.serialNumber}`;
                        trackingData = {
                            expiryDate: movement.expiryDate,
                            serialNumber: movement.serialNumber
                        };
                    } else {
                        return; // تخطي العناصر بدون الاثنين إذا كان مطلوباً
                    }
                } else if (hasExpiry) {
                    // فقط تاريخ الصلاحية: تتبع بتاريخ الصلاحية
                    key = `expiry_${movement.expiryDate || 'none'}`;
                    trackingData = {
                        expiryDate: movement.expiryDate || null
                    };
                } else if (hasSerial) {
                    // فقط الرقم التسلسلي: تتبع بالرقم التسلسلي
                    key = `serial_${movement.serialNumber || 'none'}`;
                    trackingData = {
                        serialNumber: movement.serialNumber || null
                    };
                } else {
                    // بدون تتبع: إدخال عنصر واحد
                    key = 'no_tracking';
                    trackingData = {};
                }
                
                // تهيئة العنصر في الخريطة إذا لم يكن موجوداً
                if (!itemMap.has(key)) {
                    itemMap.set(key, {
                        ...trackingData,
                        quantity: 0,
                        purchaseInvoiceNo: movement.reference || '',
                        purchaseDate: movement.date || movement.createdAt
                    });
                }
                
                // تحديث الكمية بناءً على نوع الحركة
                const existing = itemMap.get(key);
                const quantityInMainUnit = Math.abs(movement.quantityInMainUnit || movement.quantity || 0);
                
                if (movement.type === 'in' || movement.type === 'transfer') {
                    // حركة دخول أو نقل: زيادة الكمية
                    existing.quantity += quantityInMainUnit;
                } else if (movement.type === 'out') {
                    // حركة خروج: تقليل الكمية
                    existing.quantity = Math.max(0, existing.quantity - quantityInMainUnit);
                } else if (movement.type === 'adjustment') {
                    // تعديل يدوي: تعيين الكمية مباشرة (من newQuantity)
                    existing.quantity = movement.newQuantity || 0;
                }
            });

            // تحويل الخريطة إلى مصفوفة وتصفية العناصر ذات الكمية صفر
            itemMap.forEach((value, key) => {
                if (value.quantity > 0) {
                    inventoryItems.push(value);
                }
            });

            // ترتيب حسب تاريخ الصلاحية (تصاعدي) إذا كان متاحاً
            if (hasExpiry) {
                inventoryItems.sort((a, b) => {
                    const dateA = a.expiryDate ? new Date(a.expiryDate) : new Date(0);
                    const dateB = b.expiryDate ? new Date(b.expiryDate) : new Date(0);
                    return dateA - dateB;
                });
            }

            return inventoryItems;
        } catch (error) {
            console.error('Error getting available inventory items:', error);
            throw error;
        }
    },

    /**
     * Get available serial numbers for a product with a specific expiry date
     * @param {string} productId - Product ID
     * @param {string} warehouseId - Warehouse ID
     * @param {string} expiryDate - Expiry date (YYYY-MM-DD format)
     * @returns {Promise<Array>} Array of available serial numbers
     */
    async getAvailableSerialNumbers(productId, warehouseId, expiryDate) {
        try {
            const inventoryItems = await this.getAvailableInventoryItems(productId, warehouseId);
            return inventoryItems
                .filter(item => item.expiryDate === expiryDate)
                .map(item => ({
                    serialNumber: item.serialNumber,
                    quantity: item.quantity
                }));
        } catch (error) {
            console.error('Error getting available serial numbers:', error);
            throw error;
        }
    },

    /**
     * Get available expiry dates for a product with a specific serial number
     * @param {string} productId - Product ID
     * @param {string} warehouseId - Warehouse ID
     * @param {string} serialNumber - Serial number
     * @returns {Promise<Array>} Array of available expiry dates
     */
    async getAvailableExpiryDates(productId, warehouseId, serialNumber) {
        try {
            const inventoryItems = await this.getAvailableInventoryItems(productId, warehouseId);
            return inventoryItems
                .filter(item => item.serialNumber === serialNumber)
                .map(item => ({
                    expiryDate: item.expiryDate,
                    quantity: item.quantity
                }));
        } catch (error) {
            console.error('Error getting available expiry dates:', error);
            throw error;
        }
    }
};

console.log('✅ Database module loaded');


