/**
 * Database Migration Helper
 * مساعد تحويل قاعدة البيانات
 */

/**
 * Run products data migration
 * تشغيل تحويل بيانات المنتجات
 */
async function runProductsMigration() {
    try {
        console.log('🚀 Starting database migration...');
        
        // Check if user is authenticated
        if (!auth.currentUser) {
            throw new Error('يجب تسجيل الدخول أولاً');
        }
        
        // Show confirmation dialog
        const result = await Swal.fire({
            title: 'تحويل قاعدة البيانات',
            text: 'هل تريد تحويل بيانات المنتجات الموجودة إلى الهيكل الجديد؟',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'نعم، ابدأ التحويل',
            cancelButtonText: 'إلغاء',
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#dc3545'
        });
        
        if (!result.isConfirmed) {
            console.log('❌ Migration cancelled by user');
            return;
        }
        
        // Show loading
        Swal.fire({
            title: 'جاري التحويل...',
            text: 'يرجى الانتظار',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        // Run migration
        const migrationResult = await Collections.migrateProductsData();
        
        // Show success
        await Swal.fire({
            title: 'تم التحويل بنجاح!',
            text: `تم تحديث ${migrationResult.migratedCount} منتج`,
            icon: 'success',
            confirmButtonText: 'موافق'
        });
        
        console.log('✅ Migration completed successfully');
        
        // Reload products if we're in products module
        if (typeof ProductsModule !== 'undefined' && ProductsModule.load) {
            await ProductsModule.load();
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        
        await Swal.fire({
            title: 'فشل التحويل',
            text: error.message,
            icon: 'error',
            confirmButtonText: 'موافق'
        });
    }
}

/**
 * Check if migration is needed
 * التحقق من الحاجة للتحويل
 */
async function checkMigrationNeeded() {
    try {
        const products = await Collections.getProducts();
        
        if (products.length === 0) {
            return { needed: false, reason: 'لا توجد منتجات' };
        }
        
        // Check if any product needs migration
        const needsMigration = products.some(product => 
            product.price && !product.sellingPrice ||
            product.stock && !product.currentStock ||
            product.sku && !product.code ||
            !product.createdBy ||
            !product.updatedBy ||
            !product.currency
        );
        
        return { 
            needed: needsMigration, 
            reason: needsMigration ? 'توجد منتجات تحتاج تحويل' : 'جميع المنتجات محدثة'
        };
        
    } catch (error) {
        console.error('Error checking migration:', error);
        return { needed: false, reason: 'خطأ في التحقق' };
    }
}

/**
 * Show migration notification if needed
 * عرض إشعار التحويل إذا لزم الأمر
 */
async function showMigrationNotification() {
    try {
        const check = await checkMigrationNeeded();
        
        if (check.needed) {
            const result = await Swal.fire({
                title: 'تحويل قاعدة البيانات مطلوب',
                text: 'يوجد منتجات تحتاج تحويل إلى الهيكل الجديد. هل تريد المتابعة؟',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'تحويل الآن',
                cancelButtonText: 'لاحقاً',
                confirmButtonColor: '#17a2b8',
                cancelButtonColor: '#6c757d'
            });
            
            if (result.isConfirmed) {
                await runProductsMigration();
            }
        }
    } catch (error) {
        console.error('Error showing migration notification:', error);
    }
}

// Export functions for global use
window.runProductsMigration = runProductsMigration;
window.checkMigrationNeeded = checkMigrationNeeded;
window.showMigrationNotification = showMigrationNotification;

console.log('✅ Database migration helper loaded');





