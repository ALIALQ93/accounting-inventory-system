# دليل التعامل مع حالات المنتج في مرتجع المشتريات

## نظرة عامة

في نظام مرتجع المشتريات، هناك ثلاث حالات ممكنة للمنتج بناءً على خصائصه:

1. **لا يملك تاريخ صلاحية ولا رقم تسلسلي**
2. **يملك تاريخ صلاحية ولا يملك رقم تسلسلي**
3. **لا يملك تاريخ صلاحية ويملك رقم تسلسلي**

## الحالة الأولى: لا يملك تاريخ صلاحية ولا رقم تسلسلي

### التعامل:
- **إخفاء الحقول**: يتم إخفاء حقول تاريخ الصلاحية والرقم التسلسلي تماماً
- **عدم الحاجة للتحقق**: لا يحتاج المنتج للتحقق من تاريخ صلاحية أو رقم تسلسلي
- **تحديث المخزون**: يتم تحديث المخزون مباشرة بالكمية المحددة بالوحدة الأساسية

### مثال في الكود:
```javascript
if (!hasExpiry && !hasSerial) {
    // إخفاء الحقول
    expiryDateCell.style.display = 'none';
    serialNumberCell.style.display = 'none';
    // لا حاجة للتحقق من وجودها في المخزون
}
```

## الحالة الثانية: يملك تاريخ صلاحية ولا يملك رقم تسلسلي

### التعامل:
- **إظهار تاريخ الصلاحية فقط**: يتم إظهار حقل تاريخ الصلاحية وإخفاء حقل الرقم التسلسلي
- **التحقق من تاريخ الصلاحية**: يجب التأكد من وجود المنتج في المخزون بتاريخ الصلاحية المحدد
- **تحديث المخزون**: يتم تحديث المخزون مع مراعاة تاريخ الصلاحية فقط

### مثال في الكود:
```javascript
if (hasExpiry && !hasSerial) {
    // إظهار تاريخ الصلاحية فقط
    expiryDateCell.style.display = '';
    serialNumberCell.style.display = 'none';
    
    // التحقق من توفر المنتج بتاريخ الصلاحية المحدد
    const matchingItems = inventoryItems.filter(inv => inv.expiryDate === item.expiryDate);
    const totalAvailable = matchingItems.reduce((sum, inv) => sum + inv.quantity, 0);
}
```

## الحالة الثالثة: لا يملك تاريخ صلاحية ويملك رقم تسلسلي

### التعامل:
- **إظهار الرقم التسلسلي فقط**: يتم إظهار حقل الرقم التسلسلي وإخفاء حقل تاريخ الصلاحية
- **التحقق من الرقم التسلسلي**: يجب التأكد من وجود المنتج في المخزون بالرقم التسلسلي المحدد
- **تحديث المخزون**: يتم تحديث المخزون مع مراعاة الرقم التسلسلي فقط

### مثال في الكود:
```javascript
if (!hasExpiry && hasSerial) {
    // إظهار الرقم التسلسلي فقط
    expiryDateCell.style.display = 'none';
    serialNumberCell.style.display = '';
    
    // التحقق من توفر المنتج بالرقم التسلسلي المحدد
    const matchingItems = inventoryItems.filter(inv => inv.serialNumber === item.serialNumber);
    const totalAvailable = matchingItems.reduce((sum, inv) => sum + inv.quantity, 0);
}
```

## التعامل مع المخزون وفق الوحدات وتعادلها

### المبدأ الأساسي:
- يتم تخزين المخزون دائماً بالوحدة الأساسية
- عند إرجاع المنتج بوحدة فرعية، يتم تحويل الكمية إلى الوحدة الأساسية أولاً
- يتم تحديث المخزون بالكمية المحولة إلى الوحدة الأساسية

### معامل التحويل:
- **ضرب**: إذا كانت الوحدة الفرعية أكبر من الوحدة الأساسية (مثل: صندوق = 12 قطعة)
  - الكمية بالوحدة الأساسية = الكمية × معامل التحويل
- **قسمة**: إذا كانت الوحدة الفرعية أصغر من الوحدة الأساسية (مثل: كيلوغرام مقابل طن)
  - الكمية بالوحدة الأساسية = الكمية ÷ معامل التحويل

### مثال في الكود:
```javascript
// تحويل الكمية إلى الوحدة الأساسية
let quantityInMainUnit = item.quantity;
if (item.unitId && item.unitId !== product.unitId) {
    const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
    if (subUnit && subUnit.conversionFactor) {
        if (subUnit.conversionType === 'multiply') {
            quantityInMainUnit = item.quantity * subUnit.conversionFactor;
        } else {
            quantityInMainUnit = item.quantity / subUnit.conversionFactor;
        }
    }
}

// تحديث المخزون بالكمية المحولة
await Collections.updateProductWarehouseStock(
    item.productId,
    warehouseId,
    quantityInMainUnit, // الكمية بالوحدة الأساسية
    'subtract' // تقليل المخزون (للإرجاع)
);
```

## التحقق من المخزون قبل الإرجاع

### القواعد:
1. **التحقق من الكمية المتاحة**: يجب التأكد من أن الكمية المتاحة في المخزون كافية للكمية المطلوب إرجاعها
2. **التحقق من تاريخ الصلاحية**: إذا كان المنتج يملك تاريخ صلاحية، يجب التحقق من توفر الكمية بتاريخ الصلاحية المحدد
3. **التحقق من الرقم التسلسلي**: إذا كان المنتج يملك رقم تسلسلي، يجب التحقق من توفر الكمية بالرقم التسلسلي المحدد
4. **الإعداد**: يمكن تفعيل/تعطيل التحقق من المخزون من خلال إعداد `allowReturnWithoutStock`

### مثال في الكود:
```javascript
// التحقق من المخزون (إلا إذا كان مسموحاً بالإرجاع بدون مخزون)
if (!allowReturnWithoutStock) {
    const currentStock = warehouseStockObj?.[warehouseId] || 0;
    
    if (currentStock < quantityInMainUnit) {
        showError('الرصيد المتاح غير كافٍ');
        return false;
    }
}

// التحقق من تاريخ الصلاحية والرقم التسلسلي
if (hasExpiry || hasSerial) {
    const inventoryItems = await Collections.getAvailableInventoryItems(
        item.productId,
        warehouseId
    );
    
    // التحقق حسب الحالة
    if (hasExpiry && hasSerial) {
        // التحقق من كلاهما معاً
    } else if (hasExpiry) {
        // التحقق من تاريخ الصلاحية فقط
    } else if (hasSerial) {
        // التحقق من الرقم التسلسلي فقط
    }
}
```

## ملاحظات مهمة

1. **تحديث المخزون**: عند حفظ فاتورة المرتجع، يتم تقليل المخزون بالكمية المحولة إلى الوحدة الأساسية
2. **القيد العام**: يتم توليد القيد المحاسبي تلقائياً حسب الإعدادات
3. **التحقق الإجباري**: إذا كان المنتج يملك خاصية `forceExpiryOnInput` أو `forceSerialOnInput`، يصبح إدخال القيمة إجبارياً
4. **التوافق مع المشتريات**: يجب أن يكون التعامل مع المنتج في المرتجع متناسقاً مع المشتريات الأصلية




