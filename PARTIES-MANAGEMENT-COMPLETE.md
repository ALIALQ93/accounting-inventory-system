# 📋 تقرير إكمال وحدة إدارة العملاء والموردين - Parties Management Module

## ✅ التاريخ: 19 أكتوبر 2025

---

## 🎯 الهدف من الوحدة

إنشاء نظام متكامل لإدارة العملاء والموردين مع **ربط كل عميل/مورد بحساب محاسبي** من شجرة الحسابات. هذا الربط ضروري لتوليد **القيود المحاسبية التلقائية** من الفواتير.

---

## 📁 الملفات المعدلة والمضافة

### 1. **js/modules/parties.js** - الوحدة الرئيسية
#### الميزات الأساسية:
- ✅ **ربط الحساب المحاسبي**: كل عميل/مورد مرتبط بحساب من شجرة الحسابات
- ✅ **واجهة حديثة بـ 4 تبويبات**:
  - لوحة المعلومات (Dashboard)
  - العملاء (Customers)
  - الموردين (Suppliers)
  - التقارير (Reports)
- ✅ **إحصائيات شاملة**:
  - إجمالي العملاء
  - العملاء النشطين
  - إجمالي الموردين
  - الأرصدة المدينة
- ✅ **قوائم Top 10**:
  - أعلى 10 عملاء
  - أعلى 10 موردين

#### الدوال الرئيسية:

##### 1. **loadAccountsForSelection(partyType)**
```javascript
// تحميل الحسابات المناسبة للاختيار
// - للعملاء: حسابات المدينين (1-2-xxx)
// - للموردين: حسابات الدائنين (2-1-xxx)
```

##### 2. **getAccountName(accountId)**
```javascript
// الحصول على اسم الحساب المحاسبي بصيغة: "الكود - الاسم"
```

##### 3. **showPartyModal(type)**
```javascript
// نافذة إضافة/تعديل عميل أو مورد
// تتضمن اختيار الحساب المحاسبي (إلزامي)
```

##### 4. **saveParty(data)**
```javascript
// حفظ بيانات العميل/المورد مع الحساب المحاسبي
// البيانات المحفوظة:
// - code: الكود
// - name: الاسم
// - accountId: معرف الحساب المحاسبي (IMPORTANT)
// - phone: الهاتف
// - email: البريد الإلكتروني
// - address: العنوان
// - creditLimit: حد الائتمان
// - status: الحالة (active/inactive)
// - balance: الرصيد (يبدأ بـ 0)
```

##### 5. **getPartyById(partyId)**
```javascript
// الحصول على بيانات عميل/مورد بواسطة ID
// تستخدم في الفواتير والمبيعات والمشتريات
```

##### 6. **getActiveCustomers()**
```javascript
// الحصول على قائمة العملاء النشطين
// للاستخدام في فواتير المبيعات
```

##### 7. **getActiveSuppliers()**
```javascript
// الحصول على قائمة الموردين النشطين
// للاستخدام في فواتير المشتريات
```

##### 8. **updatePartyBalance(partyId, amount, operation)**
```javascript
// تحديث رصيد العميل/المورد
// operation: 'add', 'subtract', أو 'set'
// تُستدعى عند إنشاء/تعديل/حذف الفواتير
```

---

### 2. **css/parties-modern.css** - التصميم العصري

#### الأنماط الرئيسية:
```css
/* رأس الوحدة بتدرج لوني جذاب */
.parties-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* تبويبات تفاعلية */
.party-tab.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

/* بطاقات الإحصائيات */
.stat-card-party {
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    transition: all 0.3s ease;
}

/* جداول عصرية */
.table-modern thead {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}
```

---

## 🔗 ربط الحسابات المحاسبية - CRITICAL FEATURE

### آلية الربط:

#### 1. **عند إضافة عميل جديد**:
```javascript
// النظام يعرض قائمة منسدلة بالحسابات المناسبة:
// - حسابات المدينين (1-2-xxx) للعملاء
// - حسابات الدائنين (2-1-xxx) للموردين

// المستخدم يختار الحساب المحاسبي (إلزامي)
// يتم حفظ accountId في قاعدة البيانات
```

#### 2. **عند إنشاء فاتورة مبيعات**:
```javascript
// 1. المستخدم يختار العميل
const customer = await PartiesModule.getPartyById(customerId);

// 2. النظام يحصل على الحساب المحاسبي المرتبط
const customerAccountId = customer.accountId;

// 3. عند توليد القيد المحاسبي التلقائي:
const journalEntry = {
    entries: [
        {
            accountId: customerAccountId,  // حساب العميل (مدين)
            debit: totalAmount,
            credit: 0
        },
        {
            accountId: salesAccountId,     // حساب المبيعات (دائن)
            debit: 0,
            credit: totalAmount
        }
    ]
};
```

#### 3. **عند إنشاء فاتورة مشتريات**:
```javascript
// 1. المستخدم يختار المورد
const supplier = await PartiesModule.getPartyById(supplierId);

// 2. النظام يحصل على الحساب المحاسبي المرتبط
const supplierAccountId = supplier.accountId;

// 3. عند توليد القيد المحاسبي التلقائي:
const journalEntry = {
    entries: [
        {
            accountId: purchasesAccountId, // حساب المشتريات (مدين)
            debit: totalAmount,
            credit: 0
        },
        {
            accountId: supplierAccountId,  // حساب المورد (دائن)
            debit: 0,
            credit: totalAmount
        }
    ]
};
```

---

## 📊 هيكل البيانات في Firestore

### Collection: `parties`

```javascript
{
    id: "auto-generated-id",
    code: "C001",                    // كود العميل/المورد
    name: "شركة الأمل للتجارة",       // الاسم
    type: "customer",                 // customer, supplier, or both
    accountId: "account-doc-id",      // معرف الحساب المحاسبي المرتبط (IMPORTANT)
    phone: "07701234567",             // الهاتف
    email: "info@amal.com",           // البريد الإلكتروني
    address: "بغداد - الكرادة",       // العنوان
    balance: 150000,                  // الرصيد الحالي
    creditLimit: 500000,              // حد الائتمان
    status: "active",                 // active or inactive
    lastTransactionDate: Timestamp,   // آخر معاملة
    createdAt: Timestamp,
    createdBy: "user-uid",
    updatedAt: Timestamp,
    updatedBy: "user-uid"
}
```

---

## 🎨 واجهة المستخدم

### 1. **لوحة المعلومات** (Dashboard Tab)
- 4 بطاقات إحصائية ملونة
- قائمة أعلى 10 عملاء (حسب الرصيد)
- قائمة أعلى 10 موردين (حسب الرصيد)

### 2. **تبويب العملاء** (Customers Tab)
| الكود | الاسم | الحساب المحاسبي | الهاتف | الرصيد | حد الائتمان | الحالة | إجراءات |
|------|------|----------------|--------|--------|------------|--------|---------|
| C001 | شركة الأمل | 🔗 1-2-001 - عميل الأمل | 077... | 150,000 | 500,000 | نشط | 👁️ ✏️ 🗑️ |

### 3. **تبويب الموردين** (Suppliers Tab)
| الكود | الاسم | الحساب المحاسبي | الهاتف | الرصيد | حد الائتمان | الحالة | إجراءات |
|------|------|----------------|--------|--------|------------|--------|---------|
| S001 | مورد النجاح | 🔗 2-1-001 - مورد النجاح | 078... | -200,000 | 1,000,000 | نشط | 👁️ ✏️ 🗑️ |

### 4. **نافذة إضافة/تعديل**
```
┌─────────────────────────────────────────┐
│  إضافة عميل جديد                       │
├─────────────────────────────────────────┤
│  الكود *: [_____]   الاسم *: [_____]  │
│                                          │
│  🔗 الحساب المحاسبي المرتبط *          │
│  [▼ اختر الحساب المحاسبي        ]      │
│  ℹ️ سيتم استخدام هذا الحساب في القيود  │
│     المحاسبية المتولدة من الفواتير     │
│                                          │
│  الهاتف: [_____]  البريد: [_____]      │
│  العنوان: [________________]            │
│  حد الائتمان: [_____]  الحالة: [نشط]  │
│                                          │
│  [إلغاء]              [إضافة]          │
└─────────────────────────────────────────┘
```

---

## 🔧 دوال مساعدة للوحدات الأخرى

### استخدام في وحدة المبيعات (Sales Module):

```javascript
// 1. تحميل قائمة العملاء في الفاتورة
const customers = await PartiesModule.getActiveCustomers();

// 2. عند اختيار عميل
const customer = await PartiesModule.getPartyById(selectedCustomerId);
const customerAccountId = customer.accountId; // للقيد المحاسبي

// 3. عند حفظ الفاتورة
await PartiesModule.updatePartyBalance(customerId, invoiceTotal, 'add');

// 4. توليد القيد المحاسبي
const entry = {
    entries: [
        {
            accountId: customer.accountId,  // من هنا!
            debit: invoiceTotal,
            credit: 0
        },
        // ... باقي القيود
    ]
};
```

### استخدام في وحدة المشتريات (Purchases Module):

```javascript
// 1. تحميل قائمة الموردين في الفاتورة
const suppliers = await PartiesModule.getActiveSuppliers();

// 2. عند اختيار مورد
const supplier = await PartiesModule.getPartyById(selectedSupplierId);
const supplierAccountId = supplier.accountId; // للقيد المحاسبي

// 3. عند حفظ الفاتورة
await PartiesModule.updatePartyBalance(supplierId, invoiceTotal, 'add');

// 4. توليد القيد المحاسبي
const entry = {
    entries: [
        // ... قيود المشتريات
        {
            accountId: supplier.accountId,  // من هنا!
            debit: 0,
            credit: invoiceTotal
        }
    ]
};
```

---

## 🚀 الميزات المتقدمة

### 1. **البحث والتصفية**
- بحث فوري في جدول العملاء
- بحث فوري في جدول الموردين

### 2. **الإحصائيات الذكية**
- حساب إجمالي العملاء تلقائياً
- حساب إجمالي العملاء النشطين
- حساب إجمالي الأرصدة المدينة
- ترتيب القوائم حسب الرصيد

### 3. **عرض التفاصيل**
- عرض كامل معلومات العميل/المورد
- عرض **الحساب المحاسبي المرتبط** بوضوح
- خيار التعديل المباشر من نافذة العرض

### 4. **التحقق من البيانات**
- التحقق من إدخال الكود والاسم (إلزامي)
- التحقق من اختيار الحساب المحاسبي (إلزامي)
- رسائل خطأ واضحة

---

## 📈 التكامل مع الوحدات الأخرى

### الوحدات التي ستستخدم هذه الوحدة:

1. **Sales Module** (وحدة المبيعات)
   - استخدام `getActiveCustomers()` لاختيار العميل
   - استخدام `customer.accountId` في القيود المحاسبية
   - استخدام `updatePartyBalance()` عند الحفظ

2. **Purchases Module** (وحدة المشتريات)
   - استخدام `getActiveSuppliers()` لاختيار المورد
   - استخدام `supplier.accountId` في القيود المحاسبية
   - استخدام `updatePartyBalance()` عند الحفظ

3. **Accounting Module** (النظام المحاسبي)
   - استخدام `getPartyById()` لعرض تفاصيل العميل/المورد
   - استخدام `customer.accountId` أو `supplier.accountId` في التقارير

4. **Reports Module** (وحدة التقارير)
   - تقرير أعمار الديون (Aging Report)
   - تقرير المتأخرين في السداد
   - كشف حساب العميل/المورد

---

## ✅ قائمة المهام المكتملة

- [x] إنشاء ملف `js/modules/parties.js`
- [x] إنشاء ملف `css/parties-modern.css`
- [x] إضافة رابط CSS في `index.html`
- [x] تصميم واجهة المستخدم بـ 4 تبويبات
- [x] لوحة معلومات بالإحصائيات
- [x] جدول العملاء مع البحث
- [x] جدول الموردين مع البحث
- [x] **نافذة إضافة/تعديل مع اختيار الحساب المحاسبي**
- [x] **دالة تحميل الحسابات المناسبة حسب النوع**
- [x] **دالة الحصول على اسم الحساب**
- [x] دالة الحفظ مع الحساب المحاسبي
- [x] دالة العرض مع الحساب المحاسبي
- [x] دالة الحذف
- [x] **دوال مساعدة للوحدات الأخرى**:
  - [x] `getPartyById()`
  - [x] `getActiveCustomers()`
  - [x] `getActiveSuppliers()`
  - [x] `updatePartyBalance()`
- [x] عرض الحساب المحاسبي في الجداول
- [x] إضافة أيقونات توضيحية
- [x] تنسيق الأرصدة بالألوان
- [x] تنسيق العملات بالفواصل

---

## 📝 ملاحظات مهمة للمطورين

### 1. **الحساب المحاسبي إلزامي**
```javascript
// عند إضافة عميل/مورد جديد، يجب اختيار الحساب المحاسبي
if (!accountId) {
    Swal.showValidationMessage('يرجى اختيار الحساب المحاسبي المرتبط');
    return false;
}
```

### 2. **تصفية الحسابات حسب النوع**
```javascript
// العملاء: حسابات المدينين (1-2-xxx)
if (partyType === 'customer') {
    if (account.code.startsWith('1-2') || account.code.startsWith('12')) {
        accounts.push(account);
    }
}

// الموردين: حسابات الدائنين (2-1-xxx)
if (partyType === 'supplier') {
    if (account.code.startsWith('2-1') || account.code.startsWith('21')) {
        accounts.push(account);
    }
}
```

### 3. **تحديث الرصيد عند الفواتير**
```javascript
// عند إنشاء فاتورة مبيعات
await PartiesModule.updatePartyBalance(customerId, invoiceTotal, 'add');

// عند إلغاء فاتورة مبيعات
await PartiesModule.updatePartyBalance(customerId, invoiceTotal, 'subtract');

// عند تعديل فاتورة
// 1. طرح القيمة القديمة
await PartiesModule.updatePartyBalance(customerId, oldTotal, 'subtract');
// 2. إضافة القيمة الجديدة
await PartiesModule.updatePartyBalance(customerId, newTotal, 'add');
```

---

## 🎯 الخطوات التالية (Future Enhancements)

### 1. **التقارير** (قيد التطوير)
- [ ] تقرير أعمار الديون (Aging Report)
- [ ] تقرير المتأخرين في السداد
- [ ] كشف حساب العميل/المورد التفصيلي
- [ ] تقرير العملاء حسب الرصيد
- [ ] تقرير الموردين حسب الرصيد

### 2. **ميزات إضافية**
- [ ] استيراد العملاء من Excel
- [ ] تصدير قائمة العملاء إلى Excel
- [ ] إرسال رسائل SMS للعملاء
- [ ] إرسال بريد إلكتروني للعملاء
- [ ] مرفقات للعميل/المورد (ملفات، صور)
- [ ] سجل المعاملات لكل عميل/مورد

### 3. **التكامل**
- [ ] ربط مع وحدة المبيعات
- [ ] ربط مع وحدة المشتريات
- [ ] ربط مع وحدة المخازن
- [ ] ربط مع وحدة نقاط البيع (POS)

---

## 🏆 النتيجة النهائية

تم إنشاء **وحدة متكاملة وعصرية** لإدارة العملاء والموردين مع:

✅ **ربط محاسبي كامل**: كل عميل/مورد مرتبط بحساب محاسبي من شجرة الحسابات

✅ **واجهة مستخدم حديثة**: تصميم عصري بألوان جذابة وانتقالات سلسة

✅ **إحصائيات شاملة**: لوحة معلومات بإحصائيات فورية ودقيقة

✅ **سهولة الاستخدام**: بحث فوري، إضافة وتعديل سريع، حذف آمن

✅ **جاهزة للتكامل**: دوال مساعدة جاهزة للاستخدام في وحدات المبيعات والمشتريات

✅ **قابلة للتوسع**: بنية كود منظمة وقابلة لإضافة ميزات جديدة

---

**تم الإنجاز بنجاح! 🎉**

**المطور**: AI Assistant  
**التاريخ**: 19 أكتوبر 2025  
**الحالة**: ✅ مكتمل وجاهز للاستخدام




## ✅ التاريخ: 19 أكتوبر 2025

---

## 🎯 الهدف من الوحدة

إنشاء نظام متكامل لإدارة العملاء والموردين مع **ربط كل عميل/مورد بحساب محاسبي** من شجرة الحسابات. هذا الربط ضروري لتوليد **القيود المحاسبية التلقائية** من الفواتير.

---

## 📁 الملفات المعدلة والمضافة

### 1. **js/modules/parties.js** - الوحدة الرئيسية
#### الميزات الأساسية:
- ✅ **ربط الحساب المحاسبي**: كل عميل/مورد مرتبط بحساب من شجرة الحسابات
- ✅ **واجهة حديثة بـ 4 تبويبات**:
  - لوحة المعلومات (Dashboard)
  - العملاء (Customers)
  - الموردين (Suppliers)
  - التقارير (Reports)
- ✅ **إحصائيات شاملة**:
  - إجمالي العملاء
  - العملاء النشطين
  - إجمالي الموردين
  - الأرصدة المدينة
- ✅ **قوائم Top 10**:
  - أعلى 10 عملاء
  - أعلى 10 موردين

#### الدوال الرئيسية:

##### 1. **loadAccountsForSelection(partyType)**
```javascript
// تحميل الحسابات المناسبة للاختيار
// - للعملاء: حسابات المدينين (1-2-xxx)
// - للموردين: حسابات الدائنين (2-1-xxx)
```

##### 2. **getAccountName(accountId)**
```javascript
// الحصول على اسم الحساب المحاسبي بصيغة: "الكود - الاسم"
```

##### 3. **showPartyModal(type)**
```javascript
// نافذة إضافة/تعديل عميل أو مورد
// تتضمن اختيار الحساب المحاسبي (إلزامي)
```

##### 4. **saveParty(data)**
```javascript
// حفظ بيانات العميل/المورد مع الحساب المحاسبي
// البيانات المحفوظة:
// - code: الكود
// - name: الاسم
// - accountId: معرف الحساب المحاسبي (IMPORTANT)
// - phone: الهاتف
// - email: البريد الإلكتروني
// - address: العنوان
// - creditLimit: حد الائتمان
// - status: الحالة (active/inactive)
// - balance: الرصيد (يبدأ بـ 0)
```

##### 5. **getPartyById(partyId)**
```javascript
// الحصول على بيانات عميل/مورد بواسطة ID
// تستخدم في الفواتير والمبيعات والمشتريات
```

##### 6. **getActiveCustomers()**
```javascript
// الحصول على قائمة العملاء النشطين
// للاستخدام في فواتير المبيعات
```

##### 7. **getActiveSuppliers()**
```javascript
// الحصول على قائمة الموردين النشطين
// للاستخدام في فواتير المشتريات
```

##### 8. **updatePartyBalance(partyId, amount, operation)**
```javascript
// تحديث رصيد العميل/المورد
// operation: 'add', 'subtract', أو 'set'
// تُستدعى عند إنشاء/تعديل/حذف الفواتير
```

---

### 2. **css/parties-modern.css** - التصميم العصري

#### الأنماط الرئيسية:
```css
/* رأس الوحدة بتدرج لوني جذاب */
.parties-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* تبويبات تفاعلية */
.party-tab.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

/* بطاقات الإحصائيات */
.stat-card-party {
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    transition: all 0.3s ease;
}

/* جداول عصرية */
.table-modern thead {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}
```

---

## 🔗 ربط الحسابات المحاسبية - CRITICAL FEATURE

### آلية الربط:

#### 1. **عند إضافة عميل جديد**:
```javascript
// النظام يعرض قائمة منسدلة بالحسابات المناسبة:
// - حسابات المدينين (1-2-xxx) للعملاء
// - حسابات الدائنين (2-1-xxx) للموردين

// المستخدم يختار الحساب المحاسبي (إلزامي)
// يتم حفظ accountId في قاعدة البيانات
```

#### 2. **عند إنشاء فاتورة مبيعات**:
```javascript
// 1. المستخدم يختار العميل
const customer = await PartiesModule.getPartyById(customerId);

// 2. النظام يحصل على الحساب المحاسبي المرتبط
const customerAccountId = customer.accountId;

// 3. عند توليد القيد المحاسبي التلقائي:
const journalEntry = {
    entries: [
        {
            accountId: customerAccountId,  // حساب العميل (مدين)
            debit: totalAmount,
            credit: 0
        },
        {
            accountId: salesAccountId,     // حساب المبيعات (دائن)
            debit: 0,
            credit: totalAmount
        }
    ]
};
```

#### 3. **عند إنشاء فاتورة مشتريات**:
```javascript
// 1. المستخدم يختار المورد
const supplier = await PartiesModule.getPartyById(supplierId);

// 2. النظام يحصل على الحساب المحاسبي المرتبط
const supplierAccountId = supplier.accountId;

// 3. عند توليد القيد المحاسبي التلقائي:
const journalEntry = {
    entries: [
        {
            accountId: purchasesAccountId, // حساب المشتريات (مدين)
            debit: totalAmount,
            credit: 0
        },
        {
            accountId: supplierAccountId,  // حساب المورد (دائن)
            debit: 0,
            credit: totalAmount
        }
    ]
};
```

---

## 📊 هيكل البيانات في Firestore

### Collection: `parties`

```javascript
{
    id: "auto-generated-id",
    code: "C001",                    // كود العميل/المورد
    name: "شركة الأمل للتجارة",       // الاسم
    type: "customer",                 // customer, supplier, or both
    accountId: "account-doc-id",      // معرف الحساب المحاسبي المرتبط (IMPORTANT)
    phone: "07701234567",             // الهاتف
    email: "info@amal.com",           // البريد الإلكتروني
    address: "بغداد - الكرادة",       // العنوان
    balance: 150000,                  // الرصيد الحالي
    creditLimit: 500000,              // حد الائتمان
    status: "active",                 // active or inactive
    lastTransactionDate: Timestamp,   // آخر معاملة
    createdAt: Timestamp,
    createdBy: "user-uid",
    updatedAt: Timestamp,
    updatedBy: "user-uid"
}
```

---

## 🎨 واجهة المستخدم

### 1. **لوحة المعلومات** (Dashboard Tab)
- 4 بطاقات إحصائية ملونة
- قائمة أعلى 10 عملاء (حسب الرصيد)
- قائمة أعلى 10 موردين (حسب الرصيد)

### 2. **تبويب العملاء** (Customers Tab)
| الكود | الاسم | الحساب المحاسبي | الهاتف | الرصيد | حد الائتمان | الحالة | إجراءات |
|------|------|----------------|--------|--------|------------|--------|---------|
| C001 | شركة الأمل | 🔗 1-2-001 - عميل الأمل | 077... | 150,000 | 500,000 | نشط | 👁️ ✏️ 🗑️ |

### 3. **تبويب الموردين** (Suppliers Tab)
| الكود | الاسم | الحساب المحاسبي | الهاتف | الرصيد | حد الائتمان | الحالة | إجراءات |
|------|------|----------------|--------|--------|------------|--------|---------|
| S001 | مورد النجاح | 🔗 2-1-001 - مورد النجاح | 078... | -200,000 | 1,000,000 | نشط | 👁️ ✏️ 🗑️ |

### 4. **نافذة إضافة/تعديل**
```
┌─────────────────────────────────────────┐
│  إضافة عميل جديد                       │
├─────────────────────────────────────────┤
│  الكود *: [_____]   الاسم *: [_____]  │
│                                          │
│  🔗 الحساب المحاسبي المرتبط *          │
│  [▼ اختر الحساب المحاسبي        ]      │
│  ℹ️ سيتم استخدام هذا الحساب في القيود  │
│     المحاسبية المتولدة من الفواتير     │
│                                          │
│  الهاتف: [_____]  البريد: [_____]      │
│  العنوان: [________________]            │
│  حد الائتمان: [_____]  الحالة: [نشط]  │
│                                          │
│  [إلغاء]              [إضافة]          │
└─────────────────────────────────────────┘
```

---

## 🔧 دوال مساعدة للوحدات الأخرى

### استخدام في وحدة المبيعات (Sales Module):

```javascript
// 1. تحميل قائمة العملاء في الفاتورة
const customers = await PartiesModule.getActiveCustomers();

// 2. عند اختيار عميل
const customer = await PartiesModule.getPartyById(selectedCustomerId);
const customerAccountId = customer.accountId; // للقيد المحاسبي

// 3. عند حفظ الفاتورة
await PartiesModule.updatePartyBalance(customerId, invoiceTotal, 'add');

// 4. توليد القيد المحاسبي
const entry = {
    entries: [
        {
            accountId: customer.accountId,  // من هنا!
            debit: invoiceTotal,
            credit: 0
        },
        // ... باقي القيود
    ]
};
```

### استخدام في وحدة المشتريات (Purchases Module):

```javascript
// 1. تحميل قائمة الموردين في الفاتورة
const suppliers = await PartiesModule.getActiveSuppliers();

// 2. عند اختيار مورد
const supplier = await PartiesModule.getPartyById(selectedSupplierId);
const supplierAccountId = supplier.accountId; // للقيد المحاسبي

// 3. عند حفظ الفاتورة
await PartiesModule.updatePartyBalance(supplierId, invoiceTotal, 'add');

// 4. توليد القيد المحاسبي
const entry = {
    entries: [
        // ... قيود المشتريات
        {
            accountId: supplier.accountId,  // من هنا!
            debit: 0,
            credit: invoiceTotal
        }
    ]
};
```

---

## 🚀 الميزات المتقدمة

### 1. **البحث والتصفية**
- بحث فوري في جدول العملاء
- بحث فوري في جدول الموردين

### 2. **الإحصائيات الذكية**
- حساب إجمالي العملاء تلقائياً
- حساب إجمالي العملاء النشطين
- حساب إجمالي الأرصدة المدينة
- ترتيب القوائم حسب الرصيد

### 3. **عرض التفاصيل**
- عرض كامل معلومات العميل/المورد
- عرض **الحساب المحاسبي المرتبط** بوضوح
- خيار التعديل المباشر من نافذة العرض

### 4. **التحقق من البيانات**
- التحقق من إدخال الكود والاسم (إلزامي)
- التحقق من اختيار الحساب المحاسبي (إلزامي)
- رسائل خطأ واضحة

---

## 📈 التكامل مع الوحدات الأخرى

### الوحدات التي ستستخدم هذه الوحدة:

1. **Sales Module** (وحدة المبيعات)
   - استخدام `getActiveCustomers()` لاختيار العميل
   - استخدام `customer.accountId` في القيود المحاسبية
   - استخدام `updatePartyBalance()` عند الحفظ

2. **Purchases Module** (وحدة المشتريات)
   - استخدام `getActiveSuppliers()` لاختيار المورد
   - استخدام `supplier.accountId` في القيود المحاسبية
   - استخدام `updatePartyBalance()` عند الحفظ

3. **Accounting Module** (النظام المحاسبي)
   - استخدام `getPartyById()` لعرض تفاصيل العميل/المورد
   - استخدام `customer.accountId` أو `supplier.accountId` في التقارير

4. **Reports Module** (وحدة التقارير)
   - تقرير أعمار الديون (Aging Report)
   - تقرير المتأخرين في السداد
   - كشف حساب العميل/المورد

---

## ✅ قائمة المهام المكتملة

- [x] إنشاء ملف `js/modules/parties.js`
- [x] إنشاء ملف `css/parties-modern.css`
- [x] إضافة رابط CSS في `index.html`
- [x] تصميم واجهة المستخدم بـ 4 تبويبات
- [x] لوحة معلومات بالإحصائيات
- [x] جدول العملاء مع البحث
- [x] جدول الموردين مع البحث
- [x] **نافذة إضافة/تعديل مع اختيار الحساب المحاسبي**
- [x] **دالة تحميل الحسابات المناسبة حسب النوع**
- [x] **دالة الحصول على اسم الحساب**
- [x] دالة الحفظ مع الحساب المحاسبي
- [x] دالة العرض مع الحساب المحاسبي
- [x] دالة الحذف
- [x] **دوال مساعدة للوحدات الأخرى**:
  - [x] `getPartyById()`
  - [x] `getActiveCustomers()`
  - [x] `getActiveSuppliers()`
  - [x] `updatePartyBalance()`
- [x] عرض الحساب المحاسبي في الجداول
- [x] إضافة أيقونات توضيحية
- [x] تنسيق الأرصدة بالألوان
- [x] تنسيق العملات بالفواصل

---

## 📝 ملاحظات مهمة للمطورين

### 1. **الحساب المحاسبي إلزامي**
```javascript
// عند إضافة عميل/مورد جديد، يجب اختيار الحساب المحاسبي
if (!accountId) {
    Swal.showValidationMessage('يرجى اختيار الحساب المحاسبي المرتبط');
    return false;
}
```

### 2. **تصفية الحسابات حسب النوع**
```javascript
// العملاء: حسابات المدينين (1-2-xxx)
if (partyType === 'customer') {
    if (account.code.startsWith('1-2') || account.code.startsWith('12')) {
        accounts.push(account);
    }
}

// الموردين: حسابات الدائنين (2-1-xxx)
if (partyType === 'supplier') {
    if (account.code.startsWith('2-1') || account.code.startsWith('21')) {
        accounts.push(account);
    }
}
```

### 3. **تحديث الرصيد عند الفواتير**
```javascript
// عند إنشاء فاتورة مبيعات
await PartiesModule.updatePartyBalance(customerId, invoiceTotal, 'add');

// عند إلغاء فاتورة مبيعات
await PartiesModule.updatePartyBalance(customerId, invoiceTotal, 'subtract');

// عند تعديل فاتورة
// 1. طرح القيمة القديمة
await PartiesModule.updatePartyBalance(customerId, oldTotal, 'subtract');
// 2. إضافة القيمة الجديدة
await PartiesModule.updatePartyBalance(customerId, newTotal, 'add');
```

---

## 🎯 الخطوات التالية (Future Enhancements)

### 1. **التقارير** (قيد التطوير)
- [ ] تقرير أعمار الديون (Aging Report)
- [ ] تقرير المتأخرين في السداد
- [ ] كشف حساب العميل/المورد التفصيلي
- [ ] تقرير العملاء حسب الرصيد
- [ ] تقرير الموردين حسب الرصيد

### 2. **ميزات إضافية**
- [ ] استيراد العملاء من Excel
- [ ] تصدير قائمة العملاء إلى Excel
- [ ] إرسال رسائل SMS للعملاء
- [ ] إرسال بريد إلكتروني للعملاء
- [ ] مرفقات للعميل/المورد (ملفات، صور)
- [ ] سجل المعاملات لكل عميل/مورد

### 3. **التكامل**
- [ ] ربط مع وحدة المبيعات
- [ ] ربط مع وحدة المشتريات
- [ ] ربط مع وحدة المخازن
- [ ] ربط مع وحدة نقاط البيع (POS)

---

## 🏆 النتيجة النهائية

تم إنشاء **وحدة متكاملة وعصرية** لإدارة العملاء والموردين مع:

✅ **ربط محاسبي كامل**: كل عميل/مورد مرتبط بحساب محاسبي من شجرة الحسابات

✅ **واجهة مستخدم حديثة**: تصميم عصري بألوان جذابة وانتقالات سلسة

✅ **إحصائيات شاملة**: لوحة معلومات بإحصائيات فورية ودقيقة

✅ **سهولة الاستخدام**: بحث فوري، إضافة وتعديل سريع، حذف آمن

✅ **جاهزة للتكامل**: دوال مساعدة جاهزة للاستخدام في وحدات المبيعات والمشتريات

✅ **قابلة للتوسع**: بنية كود منظمة وقابلة لإضافة ميزات جديدة

---

**تم الإنجاز بنجاح! 🎉**

**المطور**: AI Assistant  
**التاريخ**: 19 أكتوبر 2025  
**الحالة**: ✅ مكتمل وجاهز للاستخدام



