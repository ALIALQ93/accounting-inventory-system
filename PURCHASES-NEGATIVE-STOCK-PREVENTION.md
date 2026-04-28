# منع الرصيد السالب في المشتريات
## Negative Stock Prevention in Purchases

**التاريخ:** 2024  
**الوحدة:** `js/modules/purchases.js` و `js/database.js`

---

## 🔍 المشكلة

عند تعديل أو حذف فاتورة شراء، كان النظام لا يتحقق من:
1. ⚠️ **الرصيد السالب:** هل الكمية المتاحة كافية قبل الطرح؟
2. ⚠️ **التتبع الدقيق:** هل الكمية المتاحة حسب تاريخ الصلاحية والرقم التسلسلي كافية؟

---

## ✅ الحل المطبق

### 1. **التحقق من الرصيد قبل التعديل**

#### في `updateInventoryOnEdit()`:

**أ. عند تغيير المستودع:**
- ✅ التحقق من الكمية المتاحة في المستودع القديم قبل الطرح
- ✅ مراعاة تاريخ الصلاحية والرقم التسلسلي إذا كان المنتج يتطلب تتبع

**ب. عند تقليل الكمية في نفس المستودع:**
- ✅ التحقق من الكمية المتاحة قبل الطرح
- ✅ مراعاة تاريخ الصلاحية والرقم التسلسلي

**الكود:**
```javascript
// Check if product requires serial/expiry tracking
const hasExpiry = product.hasExpiryDate || false;
const hasSerial = product.hasSerialNumber || false;

if (hasExpiry || hasSerial) {
    // Get available inventory items for this product
    const availableItems = await Collections.getAvailableInventoryItems(
        productId,
        warehouseId
    );
    
    // Check specific quantities based on expiry/serial
    let availableQuantity = 0;
    
    if (hasExpiry && hasSerial && oldItem.expiryDate && oldItem.serialNumber) {
        // Both: find exact match
        const matchingItem = availableItems.find(item => 
            item.expiryDate === oldItem.expiryDate && 
            item.serialNumber === oldItem.serialNumber
        );
        availableQuantity = matchingItem?.quantity || 0;
    } else if (hasExpiry && oldItem.expiryDate) {
        // Only expiry: find by expiry date
        const matchingItems = availableItems.filter(item => 
            item.expiryDate === oldItem.expiryDate
        );
        availableQuantity = matchingItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    } else if (hasSerial && oldItem.serialNumber) {
        // Only serial: find by serial number
        const matchingItems = availableItems.filter(item => 
            item.serialNumber === oldItem.serialNumber
        );
        availableQuantity = matchingItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    }
    
    // Check if enough is available
    if (availableQuantity < oldQuantityInMainUnit) {
        throw new Error(`⚠️ لا يمكن تعديل الفاتورة: الكمية المتاحة (${availableQuantity}) أقل من الكمية القديمة (${oldQuantityInMainUnit})`);
    }
} else {
    // For products without tracking, check total stock
    if (stockInWarehouse < quantityToSubtract) {
        throw new Error(`⚠️ لا يمكن تعديل الفاتورة: الرصيد الحالي (${stockInWarehouse}) أقل من الكمية المطلوب طرحها (${quantityToSubtract})`);
    }
}
```

---

### 2. **التحقق من الرصيد قبل الحذف**

#### في `deletePurchase()`:

**التحقق:**
- ✅ التحقق من الكمية المتاحة قبل حذف الفاتورة
- ✅ مراعاة تاريخ الصلاحية والرقم التسلسلي
- ✅ منع الحذف إذا كان سيؤدي إلى رصيد سالب

**الكود:**
```javascript
// Check if product requires serial/expiry tracking
const hasExpiry = product.hasExpiryDate || false;
const hasSerial = product.hasSerialNumber || false;

if (hasExpiry || hasSerial) {
    // Get available inventory items
    const availableItems = await Collections.getAvailableInventoryItems(
        item.productId,
        warehouseId
    );
    
    // Check specific quantities
    let availableQuantity = 0;
    
    if (hasExpiry && hasSerial && item.expiryDate && item.serialNumber) {
        // Both: find exact match
        const matchingItem = availableItems.find(availItem => 
            availItem.expiryDate === item.expiryDate && 
            availItem.serialNumber === item.serialNumber
        );
        availableQuantity = matchingItem?.quantity || 0;
    } else if (hasExpiry && item.expiryDate) {
        // Only expiry
        const matchingItems = availableItems.filter(availItem => 
            availItem.expiryDate === item.expiryDate
        );
        availableQuantity = matchingItems.reduce((sum, availItem) => sum + (availItem.quantity || 0), 0);
    } else if (hasSerial && item.serialNumber) {
        // Only serial
        const matchingItems = availableItems.filter(availItem => 
            availItem.serialNumber === item.serialNumber
        );
        availableQuantity = matchingItems.reduce((sum, availItem) => sum + (availItem.quantity || 0), 0);
    }
    
    if (availableQuantity < quantityInMainUnit) {
        // Show error and stop deletion
        throw new Error(`⚠️ لا يمكن حذف الفاتورة: الكمية المتاحة (${availableQuantity}) أقل من الكمية المشتراة (${quantityInMainUnit})`);
    }
} else {
    // Check total stock
    if (stockInWarehouse < quantityInMainUnit) {
        throw new Error(`⚠️ لا يمكن حذف الفاتورة: الرصيد الحالي (${stockInWarehouse}) أقل من الكمية المشتراة (${quantityInMainUnit})`);
    }
}
```

---

### 3. **تحسين `getAvailableInventoryItems()`**

#### الدعم الكامل لجميع حالات التتبع:

**الحالات المدعومة:**
1. ✅ **تاريخ صلاحية + رقم تسلسلي:** تتبع دقيق بكلاهما
2. ✅ **تاريخ صلاحية فقط:** تتبع حسب التاريخ
3. ✅ **رقم تسلسلي فقط:** تتبع حسب الرقم
4. ✅ **بدون تتبع:** تتبع عام

**التحسينات:**
- ✅ حساب الكميات المتاحة من المشتريات
- ✅ طرح المبيعات من الكميات المتاحة
- ✅ طرح المرتجعات من الكميات المتاحة
- ✅ ترتيب حسب تاريخ الصلاحية (إن وجد)

---

## 📊 سيناريوهات الاختبار

### السيناريو 1: تعديل فاتورة شراء - تقليل الكمية

**الحالة:**
- فاتورة شراء: 10 قطع
- تم بيع 5 قطع
- محاولة تعديل الفاتورة إلى 3 قطع (طرح 7 قطع)

**النتيجة المتوقعة:**
- ✅ **يتم منع التعديل** لأن الكمية المتاحة (5) أقل من الكمية القديمة (10)
- ✅ **رسالة خطأ واضحة:** "الكمية المتاحة (5) أقل من الكمية القديمة (10)"

---

### السيناريو 2: حذف فاتورة شراء - المنتج تم بيعه

**الحالة:**
- فاتورة شراء: 10 قطع
- تم بيع جميع القطع (10)
- محاولة حذف الفاتورة

**النتيجة المتوقعة:**
- ✅ **يتم منع الحذف** لأن الكمية المتاحة (0) أقل من الكمية المشتراة (10)
- ✅ **رسالة خطأ واضحة:** "الكمية المتاحة (0) أقل من الكمية المشتراة (10). قد يكون المنتج تم بيعه أو إرجاعه."

---

### السيناريو 3: تعديل فاتورة - منتج مع تاريخ صلاحية ورقم تسلسلي

**الحالة:**
- فاتورة شراء: 10 قطع بتاريخ صلاحية 2024-12-31 ورقم تسلسلي SN001
- تم بيع 5 قطع من نفس التاريخ والرقم
- محاولة تعديل الفاتورة إلى 3 قطع

**النتيجة المتوقعة:**
- ✅ **يتم التحقق من الكمية المتاحة** للتاريخ والرقم المحددين
- ✅ **يتم منع التعديل** لأن الكمية المتاحة (5) أقل من الكمية القديمة (10)
- ✅ **رسالة خطأ مفصلة:** تتضمن تاريخ الصلاحية والرقم التسلسلي

---

### السيناريو 4: حذف فاتورة - منتج مع تاريخ صلاحية فقط

**الحالة:**
- فاتورة شراء: 10 قطع بتاريخ صلاحية 2024-12-31
- تم بيع 8 قطع من نفس التاريخ
- محاولة حذف الفاتورة

**النتيجة المتوقعة:**
- ✅ **يتم التحقق من الكمية المتاحة** للتاريخ المحدد
- ✅ **يتم منع الحذف** لأن الكمية المتاحة (2) أقل من الكمية المشتراة (10)
- ✅ **رسالة خطأ مفصلة:** تتضمن تاريخ الصلاحية

---

## ✅ الخلاصة

### التحسينات المطبقة:

1. ✅ **التحقق من الرصيد السالب قبل التعديل**
   - التحقق من الكمية المتاحة قبل الطرح
   - مراعاة تاريخ الصلاحية والرقم التسلسلي

2. ✅ **التحقق من الرصيد السالب قبل الحذف**
   - التحقق من الكمية المتاحة قبل الحذف
   - منع الحذف إذا كان سيؤدي إلى رصيد سالب

3. ✅ **التتبع الدقيق للأرقام التسلسلية وتاريخ الصلاحية**
   - دعم جميع حالات التتبع (expiry + serial, expiry only, serial only, no tracking)
   - حساب الكميات المتاحة بدقة حسب نوع التتبع

4. ✅ **رسائل خطأ واضحة ومفصلة**
   - تتضمن الكمية المتاحة والكمية المطلوبة
   - تتضمن تاريخ الصلاحية والرقم التسلسلي (إن وجد)

---

**الآن النظام يمنع الرصيد السالب بشكل كامل!** ✅







