# تقرير الدوال المكررة في ملفات الفواتير والمخزون
## Duplicate Functions Report

**التاريخ:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

---

## 📋 الملخص التنفيذي

تم اكتشاف عدة دوال مكررة عبر ملفات الفواتير والمخزون. هذه الدوال المكررة تزيد من حجم الكود وتجعله صعب الصيانة. يُنصح بإنشاء ملف مشترك للدوال المساعدة (utils) أو دمجها في ملف واحد.

---

## 🔴 الدوال المكررة المكتشفة

### 1. ✅ `convertToMainUnit()` - مكررة 3 مرات

**الملفات:**
- `js/modules/purchases.js` (السطر 12397)
- `js/modules/purchase-returns.js` (السطر 2750)

**الوصف:**
- تحويل الكمية من وحدة فرعية إلى الوحدة الأساسية
- نفس الكود تماماً في كلا الملفين

**الكود:**
```javascript
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
        console.warn(`⚠️ Unknown conversion type "${conversionType}"...`);
        return quantity * conversionFactor;
    }
}
```

**التوصية:**
- نقل الدالة إلى `js/utils.js` أو إنشاء `js/utils/invoice-utils.js`
- استخدامها من جميع الوحدات

---

### 2. ✅ `escapeHtml()` - مكررة 4 مرات

**الملفات:**
- `js/modules/purchases.js` (السطر 63)
- `js/modules/sales.js` (السطر 33) - مكررة مرتين في نفس الملف!
- `js/modules/purchase-returns.js` (السطر 40)
- `js/modules/sales-returns.js` (السطر 40)

**الوصف:**
- تحويل HTML entities لمنع XSS attacks
- نفس الكود في جميع الملفات

**الكود:**
```javascript
escapeHtml(text) {
    if (text == null) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

**التوصية:**
- نقل الدالة إلى `js/utils.js`
- إزالة جميع النسخ المكررة

---

### 3. ✅ `deleteInventoryMovementsBySource()` - مكررة 4 مرات

**الملفات:**
- `js/modules/purchases.js` (السطر 8984)
- `js/modules/sales.js` (السطر 4486)
- `js/modules/purchase-returns.js` (السطر 4951)
- `js/modules/sales-returns.js` (السطر 3748)

**الوصف:**
- حذف جميع حركات المخزون المرتبطة بمصدر معين (فاتورة، مرتجع، إلخ)
- نفس الكود في جميع الملفات

**الكود (مثال من purchases.js):**
```javascript
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
}
```

**التوصية:**
- نقل الدالة إلى `js/database.js` في `Collections`
- استخدامها من جميع الوحدات

---

### 4. ⚠️ `convertToBaseCurrency()` - مكررة بشكل جزئي

**الملفات:**
- `js/modules/purchases.js` (السطر 1105) - كدالة عضو
- `js/modules/sales.js` - كدالة محلية داخل `generateGeneralEntry` (عدة مرات)
- `js/modules/purchase-returns.js` - كدالة محلية داخل `generateGeneralEntry`
- `js/modules/sales-returns.js` - كدالة محلية داخل `generateGeneralEntry`

**الوصف:**
- تحويل المبلغ من عملة معينة إلى العملة الأساسية
- في `purchases.js` كدالة عضو، في البقية كدوال محلية

**الكود من purchases.js:**
```javascript
convertToBaseCurrency(amount, currency, exchangeRate) {
    if (!amount || amount === 0) return 0;
    
    const baseCurrency = this.currencies.find(c => c.isBaseCurrency);
    if (!baseCurrency) {
        console.warn('⚠️ No base currency found, using amount as-is');
        return amount;
    }
    
    if (currency === baseCurrency.code) {
        return amount;
    }
    
    return amount * (exchangeRate || 1);
}
```

**التوصية:**
- توحيد الاستخدام: نقل الدالة إلى `js/utils.js`
- إزالة الدوال المحلية المكررة

---

## 📊 جدول الدوال المكررة

| الدالة | عدد التكرارات | الملفات | الأولوية |
|--------|--------------|---------|---------|
| `convertToMainUnit()` | 2 | purchases.js, purchase-returns.js | 🔴 عالية |
| `escapeHtml()` | 5 (4 ملفات) | purchases.js, sales.js (2x), purchase-returns.js, sales-returns.js | 🔴 عالية |
| `deleteInventoryMovementsBySource()` | 4 | purchases.js, sales.js, purchase-returns.js, sales-returns.js | 🔴 عالية |
| `convertToBaseCurrency()` | 4+ (جزئي) | جميع ملفات الفواتير | 🟡 متوسطة |

---

## 💡 التوصيات

### 1. إنشاء ملف utils مشترك

**الملف المقترح:** `js/utils/invoice-utils.js`

```javascript
/**
 * Invoice Utilities - Shared functions for invoice modules
 */

const InvoiceUtils = {
    /**
     * Convert quantity from sub-unit to main unit
     */
    convertToMainUnit(quantity, unitId, product) {
        // ... الكود المكرر
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        // ... الكود المكرر
    },

    /**
     * Convert amount to base currency
     */
    convertToBaseCurrency(amount, currency, exchangeRate, baseCurrency) {
        // ... الكود المكرر
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InvoiceUtils;
}
```

### 2. إضافة الدالة إلى Collections

**في `js/database.js`:**

```javascript
const Collections = {
    // ... دوال موجودة

    /**
     * Delete inventory movements by source
     */
    async deleteInventoryMovementsBySource(sourceType, sourceId) {
        // ... الكود المكرر
    }
};
```

### 3. خطة الإصلاح

#### المرحلة 1: إنشاء ملفات Utils
1. ✅ إنشاء `js/utils/invoice-utils.js`
2. ✅ نقل `convertToMainUnit` إلى `InvoiceUtils`
3. ✅ نقل `escapeHtml` إلى `InvoiceUtils` (أو utils.js إذا كانت عامة)
4. ✅ نقل `convertToBaseCurrency` إلى `InvoiceUtils`

#### المرحلة 2: إضافة إلى Collections
1. ✅ إضافة `deleteInventoryMovementsBySource` إلى `Collections`

#### المرحلة 3: تحديث الوحدات
1. ✅ تحديث `purchases.js` لاستخدام الدوال المشتركة
2. ✅ تحديث `sales.js` لاستخدام الدوال المشتركة
3. ✅ تحديث `purchase-returns.js` لاستخدام الدوال المشتركة
4. ✅ تحديث `sales-returns.js` لاستخدام الدوال المشتركة

#### المرحلة 4: الاختبار
1. ✅ اختبار جميع الوحدات بعد التغييرات
2. ✅ التأكد من عدم كسر أي وظائف

---

## 📝 ملاحظات إضافية

### 1. دوال أخرى قد تكون مكررة
- `updateInventory()` - لها نسخ مشابهة في جميع الوحدات (لكن مختلفة قليلاً)
- `updateInventoryOnEdit()` - لها نسخ مشابهة
- `generateGeneralEntry()` - لها نسخ مشابهة لكن مختلفة في التفاصيل

### 2. دوال غير مكررة (لكن مشابهة)
- `collectPurchaseData()` و `collectSaleData()` - مشابهة لكن مختلفة
- `validatePurchaseForm()` و `validateSaleForm()` - مشابهة لكن مختلفة

---

## ✅ الفوائد المتوقعة

1. **تقليل حجم الكود:** تقليل حجم الملفات بنسبة 5-10%
2. **سهولة الصيانة:** تحديث دالة واحدة بدلاً من 4-5
3. **تقليل الأخطاء:** ضمان استخدام نفس الكود في جميع الأماكن
4. **تحسين الأداء:** قد يسمح بتحسينات أفضل في المستقبل

---

## 🔍 إحصائيات

- **عدد الدوال المكررة المكتشفة:** 4 دوال رئيسية
- **إجمالي التكرارات:** ~15 تكرار
- **الحجم المتوقع للتقليل:** ~200-300 سطر من الكود

---

**تم إعداد التقرير بواسطة:** Auto (Cursor AI Assistant)  
**تاريخ التقرير:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")


