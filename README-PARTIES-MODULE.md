# 🎯 وحدة العملاء والموردين - نظرة سريعة

## ✨ الميزة الأساسية

**ربط ذكي**: كل عميل أو مورد مرتبط بحساب محاسبي من شجرة الحسابات.

**الفائدة**: توليد تلقائي للقيود المحاسبية من الفواتير.

---

## 📁 الملفات

| الملف | الوصف |
|------|-------|
| `js/modules/parties.js` | الوحدة الرئيسية - جميع الوظائف |
| `css/parties-modern.css` | التصميم العصري |
| `PARTIES-MANAGEMENT-COMPLETE.md` | التقرير الشامل |
| `PARTIES-API-REFERENCE.md` | مرجع المطورين |
| `دليل-وحدة-العملاء-والموردين.md` | دليل المستخدم |
| `TEST-PARTIES-MODULE.md` | قائمة الاختبارات |

---

## 🚀 البدء السريع

### 1. للمستخدم النهائي

```
1. افتح "إدارة العملاء والموردين"
2. اضغط "إضافة عميل جديد"
3. املأ البيانات
4. ⭐ اختر الحساب المحاسبي (إلزامي)
5. احفظ
```

### 2. للمطور

```javascript
// استخدام في وحدة المبيعات
const customer = await PartiesModule.getPartyById(customerId);
const accountId = customer.accountId; // للقيد المحاسبي

await PartiesModule.updatePartyBalance(customerId, total, 'add');
```

---

## 🔑 الدوال الرئيسية

```javascript
// للحصول على العميل/المورد
await PartiesModule.getPartyById(id)

// للحصول على قائمة العملاء النشطين
await PartiesModule.getActiveCustomers()

// للحصول على قائمة الموردين النشطين
await PartiesModule.getActiveSuppliers()

// لتحديث الرصيد
await PartiesModule.updatePartyBalance(id, amount, operation)

// للحصول على اسم الحساب المحاسبي
await PartiesModule.getAccountName(accountId)
```

---

## 📊 البيانات المحفوظة

```javascript
{
    code: "C001",
    name: "شركة الأمل",
    accountId: "account-id",  // ⭐ الربط المحاسبي
    phone: "077...",
    balance: 150000,
    creditLimit: 500000,
    status: "active"
}
```

---

## 🎨 الواجهة

### تبويبات:
1. **لوحة المعلومات**: إحصائيات + Top 10
2. **العملاء**: جدول مع البحث والإجراءات
3. **الموردين**: جدول مع البحث والإجراءات
4. **التقارير**: (قيد التطوير)

### الجداول:
| الكود | الاسم | **الحساب المحاسبي** | الهاتف | الرصيد | إجراءات |
|------|------|---------------------|--------|--------|---------|
| C001 | الأمل | 🔗 1-2-1-001 - عميل | 077... | 150K | 👁️ ✏️ 🗑️ |

---

## 💡 مثال الاستخدام

### في وحدة المبيعات:

```javascript
// 1. اختيار العميل
const customer = await PartiesModule.getPartyById(selectedId);

// 2. حفظ الفاتورة
await db.collection('salesInvoices').add({
    customerId: customer.id,
    customerAccountId: customer.accountId, // ⭐
    total: 100000
});

// 3. تحديث الرصيد
await PartiesModule.updatePartyBalance(
    customer.id,
    100000,
    'add'
);

// 4. توليد القيد المحاسبي
const entry = {
    entries: [
        {
            accountId: customer.accountId, // ⭐ من هنا!
            debit: 100000,
            credit: 0
        },
        // ... باقي القيود
    ]
};
```

---

## ⚡ النقاط المهمة

1. ✅ **الحساب المحاسبي إلزامي** - لا يمكن الحفظ بدونه
2. ✅ **العملاء → حسابات المدينين** (1-2-xxx)
3. ✅ **الموردين → حسابات الدائنين** (2-1-xxx)
4. ✅ **تحديث الرصيد يدوي** من وحدات الفواتير
5. ✅ **القيود تُولّد تلقائياً** باستخدام `customer.accountId`

---

## 📚 للمزيد

- **للمستخدمين**: اقرأ `دليل-وحدة-العملاء-والموردين.md`
- **للمطورين**: اقرأ `PARTIES-API-REFERENCE.md`
- **للاختبار**: اقرأ `TEST-PARTIES-MODULE.md`
- **للتفاصيل**: اقرأ `PARTIES-MANAGEMENT-COMPLETE.md`

---

## 🎉 الحالة

✅ **مكتمل وجاهز للاستخدام**

**التاريخ**: 19 أكتوبر 2025  
**الإصدار**: 1.0.0




## ✨ الميزة الأساسية

**ربط ذكي**: كل عميل أو مورد مرتبط بحساب محاسبي من شجرة الحسابات.

**الفائدة**: توليد تلقائي للقيود المحاسبية من الفواتير.

---

## 📁 الملفات

| الملف | الوصف |
|------|-------|
| `js/modules/parties.js` | الوحدة الرئيسية - جميع الوظائف |
| `css/parties-modern.css` | التصميم العصري |
| `PARTIES-MANAGEMENT-COMPLETE.md` | التقرير الشامل |
| `PARTIES-API-REFERENCE.md` | مرجع المطورين |
| `دليل-وحدة-العملاء-والموردين.md` | دليل المستخدم |
| `TEST-PARTIES-MODULE.md` | قائمة الاختبارات |

---

## 🚀 البدء السريع

### 1. للمستخدم النهائي

```
1. افتح "إدارة العملاء والموردين"
2. اضغط "إضافة عميل جديد"
3. املأ البيانات
4. ⭐ اختر الحساب المحاسبي (إلزامي)
5. احفظ
```

### 2. للمطور

```javascript
// استخدام في وحدة المبيعات
const customer = await PartiesModule.getPartyById(customerId);
const accountId = customer.accountId; // للقيد المحاسبي

await PartiesModule.updatePartyBalance(customerId, total, 'add');
```

---

## 🔑 الدوال الرئيسية

```javascript
// للحصول على العميل/المورد
await PartiesModule.getPartyById(id)

// للحصول على قائمة العملاء النشطين
await PartiesModule.getActiveCustomers()

// للحصول على قائمة الموردين النشطين
await PartiesModule.getActiveSuppliers()

// لتحديث الرصيد
await PartiesModule.updatePartyBalance(id, amount, operation)

// للحصول على اسم الحساب المحاسبي
await PartiesModule.getAccountName(accountId)
```

---

## 📊 البيانات المحفوظة

```javascript
{
    code: "C001",
    name: "شركة الأمل",
    accountId: "account-id",  // ⭐ الربط المحاسبي
    phone: "077...",
    balance: 150000,
    creditLimit: 500000,
    status: "active"
}
```

---

## 🎨 الواجهة

### تبويبات:
1. **لوحة المعلومات**: إحصائيات + Top 10
2. **العملاء**: جدول مع البحث والإجراءات
3. **الموردين**: جدول مع البحث والإجراءات
4. **التقارير**: (قيد التطوير)

### الجداول:
| الكود | الاسم | **الحساب المحاسبي** | الهاتف | الرصيد | إجراءات |
|------|------|---------------------|--------|--------|---------|
| C001 | الأمل | 🔗 1-2-1-001 - عميل | 077... | 150K | 👁️ ✏️ 🗑️ |

---

## 💡 مثال الاستخدام

### في وحدة المبيعات:

```javascript
// 1. اختيار العميل
const customer = await PartiesModule.getPartyById(selectedId);

// 2. حفظ الفاتورة
await db.collection('salesInvoices').add({
    customerId: customer.id,
    customerAccountId: customer.accountId, // ⭐
    total: 100000
});

// 3. تحديث الرصيد
await PartiesModule.updatePartyBalance(
    customer.id,
    100000,
    'add'
);

// 4. توليد القيد المحاسبي
const entry = {
    entries: [
        {
            accountId: customer.accountId, // ⭐ من هنا!
            debit: 100000,
            credit: 0
        },
        // ... باقي القيود
    ]
};
```

---

## ⚡ النقاط المهمة

1. ✅ **الحساب المحاسبي إلزامي** - لا يمكن الحفظ بدونه
2. ✅ **العملاء → حسابات المدينين** (1-2-xxx)
3. ✅ **الموردين → حسابات الدائنين** (2-1-xxx)
4. ✅ **تحديث الرصيد يدوي** من وحدات الفواتير
5. ✅ **القيود تُولّد تلقائياً** باستخدام `customer.accountId`

---

## 📚 للمزيد

- **للمستخدمين**: اقرأ `دليل-وحدة-العملاء-والموردين.md`
- **للمطورين**: اقرأ `PARTIES-API-REFERENCE.md`
- **للاختبار**: اقرأ `TEST-PARTIES-MODULE.md`
- **للتفاصيل**: اقرأ `PARTIES-MANAGEMENT-COMPLETE.md`

---

## 🎉 الحالة

✅ **مكتمل وجاهز للاستخدام**

**التاريخ**: 19 أكتوبر 2025  
**الإصدار**: 1.0.0



