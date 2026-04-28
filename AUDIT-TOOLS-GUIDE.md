# 🔧 دليل استخدام أدوات التدقيق
## Audit Tools Usage Guide

هذا الدليل يشرح كيفية استخدام أدوات قياس الأداء والتحقق من الدقة في النظام المحاسبي.

---

## 📦 الأدوات المتوفرة

### 1. PerformanceMonitor
أداة قياس الأداء لمراقبة سرعة العمليات المحاسبية.

### 2. AccuracyValidator
أداة التحقق من دقة العمليات المحاسبية والتأكد من صحة الحسابات.

---

## 🚀 كيفية الاستخدام

### استخدام PerformanceMonitor

#### 1. قياس عملية بسيطة
```javascript
// بدء القياس
PerformanceMonitor.start('generateGeneralEntry-sales');

// تنفيذ العملية
await generateGeneralEntry(saleData);

// إنهاء القياس
PerformanceMonitor.end('generateGeneralEntry-sales');
```

#### 2. قياس عملية async مع metadata
```javascript
// طريقة 1: يدوي
PerformanceMonitor.start('calculateBalances', { 
    accountCount: 100,
    userId: currentUser.id 
});

try {
    const balances = await calculateAllBalances();
    PerformanceMonitor.end('calculateBalances', { 
        success: true,
        balanceCount: balances.length 
    });
} catch (error) {
    PerformanceMonitor.end('calculateBalances', { 
        success: false,
        error: error.message 
    });
}

// طريقة 2: تلقائي (موصى بها)
const balances = await PerformanceMonitor.measure(
    'calculateBalances',
    async () => {
        return await calculateAllBalances();
    },
    { accountCount: 100 }
);
```

#### 3. عرض التقارير
```javascript
// عرض تقرير شامل
PerformanceMonitor.printReport();

// الحصول على إحصائيات عملية محددة
const stats = PerformanceMonitor.getStatistics('generateGeneralEntry-sales');
console.log(stats);
// {
//   label: 'generateGeneralEntry-sales',
//   count: 15,
//   average: 234.56,
//   min: 120.34,
//   max: 567.89,
//   median: 220.10,
//   threshold: 500,
//   aboveThreshold: 2
// }

// تصدير التقرير
const report = PerformanceMonitor.export();
console.log(report);
```

---

### استخدام AccuracyValidator

#### 1. التحقق من توازن القيد
```javascript
// قبل حفظ القيد
const entries = [
    { accountId: 'acc1', debit: 1000, credit: 0 },
    { accountId: 'acc2', debit: 0, credit: 1000 }
];

const validation = AccuracyValidator.validateEntryBalance(entries);

if (!validation.isValid) {
    throw new Error(`القيد غير متوازن: الفرق = ${validation.difference}`);
}
```

#### 2. التحقق من رصيد الحساب
```javascript
// بعد تحديث الرصيد
const accountId = 'acc-123';
const cachedBalance = 5000;

const validation = await AccuracyValidator.validateAccountBalance(
    accountId,
    cachedBalance,
    async (id) => {
        // إعادة حساب الرصيد من القيود
        return await recalculateBalanceFromEntries(id);
    }
);

if (!validation.isValid) {
    console.error('اختلاف في الرصيد!', validation);
    // إصلاح الرصيد
    await updateAccountBalance(accountId, validation.calculatedBalance);
}
```

#### 3. التحقق من تحويل العملات
```javascript
const validation = AccuracyValidator.validateCurrencyConversion(
    1000,      // originalAmount
    'USD',     // originalCurrency
    1500000,   // convertedAmount
    'IQD',     // targetCurrency
    1500       // exchangeRate
);

if (!validation.isValid) {
    console.error('خطأ في تحويل العملة!', validation);
}
```

#### 4. التحقق من صحة قيد محاسبي كامل
```javascript
const generalEntry = {
    id: 'entry-123',
    date: new Date(),
    status: 'posted',
    entries: [
        { accountId: 'acc1', debit: 1000, credit: 0 },
        { accountId: 'acc2', debit: 0, credit: 1000 }
    ]
};

const validation = AccuracyValidator.validateGeneralEntry(generalEntry);

if (!validation.isValid) {
    console.error('أخطاء في القيد:', validation.errors);
}
if (validation.warnings.length > 0) {
    console.warn('تحذيرات:', validation.warnings);
}
```

#### 5. عرض تقرير التحقق
```javascript
// عرض تقرير شامل
AccuracyValidator.printReport();

// الحصول على التقرير ككائن
const report = AccuracyValidator.getReport();
console.log(`نسبة النجاح: ${report.successRate}`);
```

---

## 🔌 التكامل مع الكود الحالي

### في ملفات المبيعات والمشتريات

#### قبل التحسين:
```javascript
async generateGeneralEntry(saleData) {
    // ... كود توليد القيد
    await db.collection('generalEntries').add(entryData);
}
```

#### بعد التحسين:
```javascript
async generateGeneralEntry(saleData) {
    return await PerformanceMonitor.measure(
        'generateGeneralEntry-sales',
        async () => {
            // التحقق من التوازن قبل الحفظ
            const balanceValidation = AccuracyValidator.validateEntryBalance(entryData.entries);
            if (!balanceValidation.isValid) {
                throw new Error(`القيد غير متوازن: ${balanceValidation.difference}`);
            }
            
            // التحقق من صحة القيد
            const entryValidation = AccuracyValidator.validateGeneralEntry(entryData);
            if (!entryValidation.isValid) {
                throw new Error(`أخطاء في القيد: ${entryValidation.errors.join(', ')}`);
            }
            
            // حفظ القيد
            const docRef = await db.collection('generalEntries').add(entryData);
            
            return docRef;
        },
        {
            invoiceNo: saleData.invoiceNo,
            customerId: saleData.customerId
        }
    );
}
```

---

## 📊 أمثلة عملية

### مثال 1: قياس أداء عملية المبيعات
```javascript
// في sales.js
async function saveSale(saleData) {
    await PerformanceMonitor.measure('saveSale', async () => {
        // 1. حفظ الفاتورة
        const invoiceRef = await db.collection('sales').add(saleData);
        
        // 2. تحديث المخزون
        await PerformanceMonitor.measure('updateInventory-sales', async () => {
            await updateInventory(saleData.items);
        });
        
        // 3. توليد القيد المحاسبي
        if (saleData.generateEntry) {
            await PerformanceMonitor.measure('generateGeneralEntry-sales', async () => {
                await generateGeneralEntry(saleData);
            });
        }
        
        // 4. تحديث رصيد العميل
        await PerformanceMonitor.measure('updatePartyBalance-sales', async () => {
            await updatePartyBalance(saleData.customerId, saleData.total);
        });
        
        return invoiceRef;
    }, {
        invoiceNo: saleData.invoiceNo,
        itemsCount: saleData.items.length
    });
}

// بعد الحفظ، عرض التقرير
PerformanceMonitor.printReport();
```

### مثال 2: التحقق الشامل من الدقة
```javascript
async function validateSystemAccuracy() {
    console.log('🔍 بدء التحقق من دقة النظام...');
    
    // 1. التحقق من جميع القيود غير المتوازنة
    const entries = await db.collection('generalEntries')
        .where('status', '==', 'posted')
        .get();
    
    let unbalancedCount = 0;
    entries.forEach(doc => {
        const entry = doc.data();
        const validation = AccuracyValidator.validateEntryBalance(entry.entries);
        if (!validation.isValid) {
            unbalancedCount++;
            console.error(`❌ قيد غير متوازن: ${doc.id}`, validation);
        }
    });
    
    // 2. التحقق من أرصدة الحسابات
    const accounts = await db.collection('chartOfAccounts').get();
    let invalidBalances = 0;
    
    for (const doc of accounts.docs) {
        const account = doc.data();
        const validation = await AccuracyValidator.validateAccountBalance(
            doc.id,
            account.balance || 0,
            async (id) => {
                return await recalculateBalance(id);
            }
        );
        
        if (!validation.isValid) {
            invalidBalances++;
            console.error(`❌ رصيد غير صحيح: ${account.name}`, validation);
        }
    }
    
    // 3. عرض التقرير
    AccuracyValidator.printReport();
    
    console.log(`📊 النتائج:`);
    console.log(`   - القيود غير المتوازنة: ${unbalancedCount}`);
    console.log(`   - الأرصدة غير الصحيحة: ${invalidBalances}`);
}
```

---

## 🎯 أفضل الممارسات

### 1. استخدام PerformanceMonitor
- ✅ استخدم أسماء واضحة للعمليات
- ✅ أضف metadata مفيدة (مثل invoiceNo، accountId)
- ✅ قم بقياس العمليات الحرجة فقط (لا تقيس كل شيء)
- ✅ راجع التقارير بانتظام
- ✅ اضبط الـ thresholds حسب احتياجاتك

### 2. استخدام AccuracyValidator
- ✅ تحقق من التوازن قبل الحفظ دائماً
- ✅ تحقق من الأرصدة بعد التحديثات المهمة
- ✅ استخدم validateGeneralEntry قبل حفظ القيود
- ✅ راجع التقارير بانتظام للكشف عن المشاكل

### 3. التكامل
- ✅ أضف التحقق في جميع نقاط الحفظ الحرجة
- ✅ استخدم measure() للعمليات async المعقدة
- ✅ اجمع التقارير بانتظام
- ✅ استخدم الأدوات في بيئة التطوير أولاً

---

## 📈 قراءة التقارير

### تقرير الأداء
```
📊 Performance Report
Total Operations: 45
Total Duration: 12345.67ms
Unique Operations: 5

📈 Operation Statistics
✅ generateGeneralEntry-sales:
   Count: 15
   Average: 234.56ms
   Min: 120.34ms
   Max: 567.89ms
   Median: 220.10ms
   Threshold: 500ms
⚠️ calculateBalances:
   Count: 3
   Average: 2345.67ms
   ...
   ⚠️ Above threshold: 2 times
```

### تقرير الدقة
```
🔍 Accuracy Validation Report
Total Validations: 120
Passed: 118 ✅
Failed: 2 ❌
Success Rate: 98.33%

📊 By Type
entryBalance: 50/50 passed (100%)
accountBalance: 65/67 passed (97.01%)
currencyConversion: 3/3 passed (100%)
```

---

## 🔍 استكشاف الأخطاء

### مشكلة: عملية بطيئة
```javascript
// 1. قم بقياس العملية
PerformanceMonitor.start('slowOperation');
await slowOperation();
PerformanceMonitor.end('slowOperation');

// 2. راجع التقرير
PerformanceMonitor.printReport();

// 3. قم بتقسيم العملية لمعرفة الجزء البطيء
PerformanceMonitor.start('slowOperation-part1');
await part1();
PerformanceMonitor.end('slowOperation-part1');

PerformanceMonitor.start('slowOperation-part2');
await part2();
PerformanceMonitor.end('slowOperation-part2');
```

### مشكلة: قيد غير متوازن
```javascript
// 1. تحقق من القيد
const validation = AccuracyValidator.validateEntryBalance(entries);

// 2. راجع التفاصيل
console.log(validation);
// {
//   totalDebit: 1000,
//   totalCredit: 999.99,
//   difference: 0.01
// }

// 3. ابحث عن السبب
entries.forEach((entry, index) => {
    console.log(`Entry ${index + 1}:`, entry);
});
```

---

## 📝 ملاحظات

- الأدوات متاحة بشكل عام عبر `window.PerformanceMonitor` و `window.AccuracyValidator`
- التقارير تُحفظ تلقائياً في localStorage عند إغلاق الصفحة (لتطوير فقط)
- استخدم الأدوات في بيئة التطوير أولاً
- راجع التقارير بانتظام للكشف عن المشاكل مبكراً

---

**آخر تحديث:** 2024  
**الحالة:** ✅ جاهز للاستخدام


