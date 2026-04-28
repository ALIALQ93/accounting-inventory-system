# تقرير التحقق من عرض الكميات المتوفرة في الفواتير

## 📋 ملخص تنفيذي

تم التحقق من آلية عرض الكميات المتوفرة في فواتير المبيعات:
- ✅ **حساب الكميات المتوفرة** - يتم بشكل صحيح
- ✅ **تحويل الكمية إلى الوحدة المختارة** - يتم بشكل صحيح
- ✅ **عرض الكمية في النافذة** - يتم بشكل صحيح
- ✅ **التحقق من الكمية المتاحة** - يتم بشكل صحيح

## 🔍 1. آلية عرض الكميات المتوفرة في المبيعات

### أ. حساب الكميات المتوفرة (`getAvailableQuantitiesForSale`)

#### الخطوة 1: جمع الكميات من المشتريات (السطر 7464-7528)

```javascript
// جمع جميع المشتريات المكتملة للمنتج في المستودع
const purchasesSnapshot = await db.collection('purchases')
    .where('warehouseId', '==', warehouseId)
    .where('status', '==', 'completed')
    .get();

purchasesSnapshot.forEach(purchaseDoc => {
    purchase.items.forEach(item => {
        if (item.productId === productId) {
            // تحويل الكمية إلى الوحدة الأساسية
            let quantityInMainUnit = parseFloat(item.quantity) || 0;
            if (item.unitId && item.unitId !== product.unitId) {
                const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
                if (subUnit && subUnit.conversionFactor && subUnit.conversionFactor > 0) {
                    const conversionType = subUnit.conversionType || 'multiply';
                    if (conversionType === 'multiply') {
                        quantityInMainUnit = quantityInMainUnit * subUnit.conversionFactor;  // ✅ صحيح
                    } else {
                        quantityInMainUnit = quantityInMainUnit / subUnit.conversionFactor;  // ✅ صحيح
                    }
                }
            }
            existing.quantityInMainUnit += quantityInMainUnit;  // ✅ إضافة للكمية المتوفرة
        }
    });
});
```

**التحقق:**
- ✅ يتم تحويل الكمية من الوحدة المستخدمة في الفاتورة إلى الوحدة الأساسية
- ✅ يتم استخدام `conversionType` بشكل صحيح
- ✅ يتم جمع الكميات بشكل صحيح

#### الخطوة 2: طرح الكميات المباعة (السطر 7530-7578)

```javascript
// طرح جميع المبيعات المكتملة للمنتج في المستودع
const salesSnapshot = await db.collection('sales')
    .where('warehouseId', '==', warehouseId)
    .where('status', '==', 'completed')
    .get();

salesSnapshot.forEach(saleDoc => {
    sale.items.forEach(item => {
        if (item.productId === productId) {
            // تحويل الكمية إلى الوحدة الأساسية
            let quantityInMainUnit = parseFloat(item.quantity) || 0;
            if (item.unitId && item.unitId !== product.unitId) {
                const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
                if (subUnit && subUnit.conversionFactor && subUnit.conversionFactor > 0) {
                    const conversionType = subUnit.conversionType || 'multiply';
                    if (conversionType === 'multiply') {
                        quantityInMainUnit = quantityInMainUnit * subUnit.conversionFactor;  // ✅ صحيح
                    } else {
                        quantityInMainUnit = quantityInMainUnit / subUnit.conversionFactor;  // ✅ صحيح
                    }
                }
            }
            existing.quantityInMainUnit -= quantityInMainUnit;  // ✅ طرح من الكمية المتوفرة
        }
    });
});
```

**التحقق:**
- ✅ يتم تحويل الكمية إلى الوحدة الأساسية قبل الطرح
- ✅ يتم استخدام `conversionType` بشكل صحيح
- ✅ يتم طرح الكميات بشكل صحيح

#### الخطوة 3: إضافة مرتجع المشتريات (السطر 7580-7628)

نفس الآلية، لكن يتم **إضافة** الكميات بدلاً من طرحها.

**التحقق:**
- ✅ يتم إضافة الكميات بشكل صحيح

#### الخطوة 4: طرح مرتجع المبيعات (السطر 7630-7678)

نفس الآلية، لكن يتم **طرح** الكميات.

**التحقق:**
- ✅ يتم طرح الكميات بشكل صحيح

### ب. تحويل الكمية إلى الوحدة المختارة (السطر 7680-7709)

```javascript
// Convert quantities to selected unit and filter out zero/negative quantities
const quantities = Array.from(itemMap.values())
    .filter(item => item.quantityInMainUnit > 0)
    .map(item => {
        // Convert from main unit to selected unit
        let quantityInSelectedUnit = item.quantityInMainUnit;
        if (unitId !== product.unitId) {
            const subUnit = product.subUnits?.find(su => su.unitId === unitId);
            if (subUnit && subUnit.conversionFactor && subUnit.conversionFactor > 0) {
                const conversionType = subUnit.conversionType || 'multiply';
                if (conversionType === 'multiply') {
                    // الوحدة الفرعية أكبر: قسمة
                    // مثال: 120 قطعة / 12 = 10 صندوق
                    quantityInSelectedUnit = item.quantityInMainUnit / subUnit.conversionFactor;  // ✅ صحيح
                } else {
                    // الوحدة الفرعية أصغر: ضرب
                    // مثال: 1 طن * 1000 = 1000 كيلو
                    quantityInSelectedUnit = item.quantityInMainUnit * subUnit.conversionFactor;  // ✅ صحيح
                }
            }
        }
        item.quantityInSelectedUnit = quantityInSelectedUnit;
        return item;
    });
```

**التحقق:**
- ✅ إذا كانت الوحدة المختارة هي الوحدة الأساسية: `quantityInSelectedUnit = quantityInMainUnit` ✅
- ✅ إذا كانت الوحدة المختارة هي وحدة فرعية:
  - `conversionType === 'multiply'`: `quantityInSelectedUnit = quantityInMainUnit / conversionFactor` ✅
  - `conversionType === 'divide'`: `quantityInSelectedUnit = quantityInMainUnit * conversionFactor` ✅

**أمثلة:**

1. **مثال 1: الوحدة الأساسية = قطعة، الوحدة الفرعية = صندوق (12 قطعة)**
   - المخزون: 120 قطعة
   - الوحدة المختارة: صندوق
   - `conversionType = 'multiply'`, `conversionFactor = 12`
   - `quantityInSelectedUnit = 120 / 12 = 10 صندوق` ✅

2. **مثال 2: الوحدة الأساسية = طن، الوحدة الفرعية = كيلو (1000 كيلو = 1 طن)**
   - المخزون: 2 طن
   - الوحدة المختارة: كيلو
   - `conversionType = 'divide'`, `conversionFactor = 1000`
   - `quantityInSelectedUnit = 2 * 1000 = 2000 كيلو` ✅

### ج. عرض الكمية في النافذة (السطر 7325-7354)

```javascript
tbody.innerHTML = quantities.map((item, index) => `
    <tr>
        <td>${item.expiryDate ? formatDate(new Date(item.expiryDate)) : '-'}</td>
        <td>${item.serialNumber || '-'}</td>
        <td class="text-end">${formatNumber(item.quantityInMainUnit)}</td>  <!-- ✅ عرض الكمية بالوحدة الأساسية -->
        <td class="text-end">${formatNumber(item.quantityInSelectedUnit)}</td>  <!-- ✅ عرض الكمية بالوحدة المختارة -->
        <td>
            <input type="number" 
                   class="form-control form-control-sm sale-qty-select-input" 
                   min="0" 
                   max="${item.quantityInSelectedUnit}"  <!-- ✅ تحديد الحد الأقصى بالوحدة المختارة -->
                   step="0.01" 
                   value="0"
                   data-max-qty="${item.quantityInSelectedUnit}">
        </td>
        ...
    </tr>
`).join('');
```

**التحقق:**
- ✅ يتم عرض الكمية بالوحدة الأساسية في عمود منفصل
- ✅ يتم عرض الكمية بالوحدة المختارة في عمود منفصل
- ✅ يتم تحديد `max` لحقل الإدخال بالكمية المتوفرة بالوحدة المختارة
- ✅ يتم حفظ `max-qty` في `data-max-qty` للتحقق

### د. التحقق من الكمية المتاحة عند الحفظ (السطر 2920-2951)

```javascript
// تحويل الكمية إلى الوحدة الأساسية للتحقق
let quantityInMainUnit = item.quantity;
if (item.unitId && item.unitId !== product.unitId) {
    const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
    if (subUnit && subUnit.conversionFactor && subUnit.conversionFactor > 0) {
        if (subUnit.conversionType === 'multiply') {
            quantityInMainUnit = item.quantity * subUnit.conversionFactor;  // ✅ صحيح
        } else {
            quantityInMainUnit = item.quantity / subUnit.conversionFactor;  // ✅ صحيح
        }
    }
}

if (totalAvailable < quantityInMainUnit) {
    showError(`الكمية المتاحة: ${formatNumber(totalAvailable)} ${unitName}\n` +
              `الكمية المطلوبة: ${formatNumber(quantityInMainUnit)} ${unitName}`);
    return false;
}
```

**التحقق:**
- ✅ يتم تحويل الكمية المطلوبة إلى الوحدة الأساسية
- ✅ يتم مقارنتها بالكمية المتوفرة (بالوحدة الأساسية)
- ✅ يتم عرض رسالة خطأ واضحة بالوحدة الأساسية

## 🔍 2. آلية عرض الكميات في المشتريات

**ملاحظة:** في المشتريات، لا توجد نافذة لعرض الكميات المتوفرة لأن المشتريات تضيف للمخزون ولا تحتاج للتحقق من الكمية المتوفرة.

## ✅ الخلاصة

### ما يعمل بشكل صحيح:

1. **حساب الكميات المتوفرة:**
   - ✅ يتم جمع الكميات من المشتريات وتحويلها إلى الوحدة الأساسية
   - ✅ يتم طرح الكميات المباعة وتحويلها إلى الوحدة الأساسية
   - ✅ يتم إضافة مرتجع المشتريات وتحويلها إلى الوحدة الأساسية
   - ✅ يتم طرح مرتجع المبيعات وتحويلها إلى الوحدة الأساسية

2. **تحويل الكمية إلى الوحدة المختارة:**
   - ✅ يتم تحويل الكمية من الوحدة الأساسية إلى الوحدة المختارة بشكل صحيح
   - ✅ يتم استخدام `conversionType` بشكل صحيح:
     - `multiply`: قسمة (من الأساسية إلى الفرعية)
     - `divide`: ضرب (من الأساسية إلى الفرعية)

3. **عرض الكمية في النافذة:**
   - ✅ يتم عرض الكمية بالوحدة الأساسية
   - ✅ يتم عرض الكمية بالوحدة المختارة
   - ✅ يتم تحديد الحد الأقصى بالوحدة المختارة

4. **التحقق من الكمية المتاحة:**
   - ✅ يتم تحويل الكمية المطلوبة إلى الوحدة الأساسية
   - ✅ يتم مقارنتها بالكمية المتوفرة (بالوحدة الأساسية)
   - ✅ يتم عرض رسالة خطأ واضحة

### مثال عملي:

**المنتج:** منتج أ
- **الوحدة الأساسية:** قطعة
- **الوحدة الفرعية:** صندوق (12 قطعة)
- **معامل التحويل:** 12
- **نوع التحويل:** `multiply`

**المخزون:**
- شراء: 5 صناديق = 60 قطعة
- بيع: 20 قطعة
- **المتوفرة:** 40 قطعة

**في نافذة الكميات المتوفرة:**
- **الكمية المتوفرة (الوحدة الأساسية):** 40 قطعة
- **الكمية المتوفرة (الوحدة المختارة - صندوق):** 40 / 12 = 3.33 صندوق ✅

**عند إدخال الكمية:**
- الحد الأقصى: 3.33 صندوق
- إذا أدخل المستخدم 4 صناديق، سيتم رفضها ✅

---

**تاريخ المراجعة:** 2024  
**الحالة:** ✅ تم التحقق - النظام يعمل بشكل صحيح  
**التقييم الإجمالي:** 5/5 ⭐⭐⭐⭐⭐



