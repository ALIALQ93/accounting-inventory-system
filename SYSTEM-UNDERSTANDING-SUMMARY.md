# ملخص فهم النظام
## System Understanding Summary

**النظام:** نظام المحاسبة والمخزون المتكامل  
**النسخة:** 11.1  
**التاريخ:** 2024

---

## 📋 نظرة عامة | Overview

نظام متكامل لإدارة المحاسبة والمخزون مبني على:
- **Frontend:** HTML, CSS, JavaScript (Vanilla)
- **Backend:** Firebase (Firestore, Authentication, Storage)
- **Architecture:** Modular Architecture (وحدات منفصلة)

---

## 🏗️ البنية المعمارية | Architecture

### 1. الهيكل العام | General Structure

```
index.html (واجهة واحدة - Single Page Application)
    ↓
Firebase SDK (Authentication, Firestore, Storage)
    ↓
js/config.js (إعدادات Firebase والتطبيق)
    ↓
js/app.js (Application Class - التطبيق الرئيسي)
    ↓
js/modules/*.js (19 وحدة منفصلة)
    ↓
js/database.js (DatabaseService - طبقة قاعدة البيانات)
    ↓
js/utils.js (وظائف مساعدة)
```

### 2. التدفق الرئيسي | Main Flow

```
1. تحميل الصفحة (index.html)
   ↓
2. تحميل Firebase SDK
   ↓
3. تحميل config.js (إعدادات Firebase)
   ↓
4. تهيئة Application Class (app.js)
   ↓
5. التحقق من المصادقة (auth.js)
   ↓
6. إذا مسجل دخول → عرض Dashboard
   إذا غير مسجل → عرض صفحة تسجيل الدخول
   ↓
7. عند النقر على قائمة → تحميل الوحدة المناسبة
   ↓
8. الوحدة تعرض HTML وتحمّل البيانات
```

---

## 🔐 المصادقة والأمان | Authentication & Security

### المصادقة (Authentication)

- **الخدمة:** Firebase Authentication
- **الطريقة:** Email/Password
- **الإدارة:** `js/auth.js` - `AuthService` class
- **التدفق:**
  1. المستخدم يسجل الدخول
  2. Firebase يتحقق من البيانات
  3. `onAuthStateChanged` يستمع للتغييرات
  4. يتم عرض الواجهة المناسبة

### الأمان (Security)

- **قواعد Firestore:** `firestore.rules`
- **الصلاحيات:**
  - `super_admin` - صلاحيات كاملة
  - `manager` - إدارة
  - `accountant` - محاسبي
  - `sales` - مبيعات
  - `warehouse` - مستودعات
- **الحماية:**
  - جميع Collections تتطلب مصادقة
  - `generalEntries` - لا يمكن تحديثها (فقط إنشاء وحذف)
  - `inventoryMovements` - لا يمكن حذفها
  - `journal_entries` - لا يمكن حذفها

---

## 📊 قاعدة البيانات | Database Structure

### Collections الرئيسية | Main Collections

#### 1. **products** - المنتجات
```javascript
{
  code: "PRD0001",
  name: "اسم المنتج",
  categoryId: "ref",
  unitId: "ref",
  purchasePrice: 1000,
  price: 1500,
  warehouseStock: {
    "warehouse-id-1": 100,
    "warehouse-id-2": 50
  },
  currentStock: 150,
  status: "active"
}
```

#### 2. **sales** - المبيعات
```javascript
{
  invoiceNo: "INV-2024-0001",
  partyId: "party-id",
  date: Timestamp,
  items: [...],
  total: 50000,
  paymentStatus: "paid|partial|credit",
  paymentMethod: "cash|bank|credit",
  warehouseId: "warehouse-id"
}
```

#### 3. **purchases** - المشتريات
```javascript
{
  invoiceNo: "PUR-2024-0001",
  partyId: "party-id",
  date: Timestamp,
  items: [...],
  total: 40000,
  paymentStatus: "paid|partial|credit",
  warehouseId: "warehouse-id"
}
```

#### 4. **inventory** - حركات المخزون
```javascript
{
  type: "in|out|transfer|adjustment",
  productId: "product-id",
  warehouseId: "warehouse-id",
  quantity: 10,
  quantityInMainUnit: 10,
  reference: "INV-2024-0001",
  referenceType: "sale|purchase|sale_return|purchase_return",
  date: Timestamp
}
```

#### 5. **parties** - الأطراف (عملاء/موردين)
```javascript
{
  code: "C001",
  name: "اسم الطرف",
  type: "customer|supplier|both",
  accountId: "chart-of-account-id", // رابط للحساب المحاسبي
  balance: 150000,
  creditLimit: 500000
}
```

#### 6. **generalEntries** - القيود المحاسبية
```javascript
{
  voucherId: "voucher-id",
  entries: [
    {
      accountId: "account-id",
      debit: 50000,
      credit: 0,
      description: "..."
    },
    {
      accountId: "account-id-2",
      debit: 0,
      credit: 50000,
      description: "..."
    }
  ],
  isBalanced: true, // يجب أن يكون مدين = دائن
  date: Timestamp
}
```

#### 7. **vouchers** - السندات
```javascript
{
  type: "receipt|payment|journal|entry",
  voucherNo: "VR-2024-0001",
  date: Timestamp,
  entries: [...],
  status: "draft|posted"
}
```

#### 8. **chartOfAccounts** - دليل الحسابات
```javascript
{
  code: "1-1-001",
  name: "اسم الحساب",
  parentId: "parent-account-id",
  accountType: "asset|liability|equity|income|expense",
  level: 1|2|3,
  balance: 0
}
```

#### 9. **warehouses** - المستودعات
```javascript
{
  code: "WH001",
  name: "اسم المستودع",
  address: "...",
  status: "active"
}
```

---

## 🔄 التكامل بين الوحدات | Module Integration

### 1. تدفق المبيعات | Sales Flow

```
فاتورة مبيعات جديدة
    ↓
التحقق من الكمية المتاحة في المخزون
    ↓
حفظ فاتورة المبيعات (sales collection)
    ↓
تقليل المخزون (updateProductWarehouseStock)
    ↓
تسجيل حركة مخزون (inventory collection) - type: 'out'
    ↓
توليد القيد المحاسبي (generateGeneralEntry)
    ├─ مدين: حساب العميل
    └─ دائن: حساب المبيعات
    ↓
حفظ القيد في generalEntries
    ↓
تحديث رصيد العميل في parties collection
```

### 2. تدفق المشتريات | Purchases Flow

```
فاتورة مشتريات جديدة
    ↓
حفظ فاتورة المشتريات (purchases collection)
    ↓
زيادة المخزون (updateProductWarehouseStock)
    ↓
تسجيل حركة مخزون (inventory collection) - type: 'in'
    ↓
تحديث سعر الشراء للمنتج (إذا كان أفضل)
    ↓
توليد القيد المحاسبي (generateGeneralEntry)
    ├─ مدين: حساب المشتريات
    └─ دائن: حساب المورد
    ↓
حفظ القيد في generalEntries
    ↓
تحديث رصيد المورد في parties collection
```

### 3. تدفق المرتجعات | Returns Flow

#### مرتجع المبيعات (Sales Returns):
```
مرتجع مبيعات جديد
    ↓
حفظ مرتجع المبيعات (salesReturns collection)
    ↓
إعادة المنتجات للمخزون (updateProductWarehouseStock - add)
    ↓
تسجيل حركة مخزون (inventory collection) - type: 'in'
    ↓
عكس القيد المحاسبي الأصلي
    ├─ مدين: حساب المبيعات
    └─ دائن: حساب العميل
    ↓
تحديث رصيد العميل
```

#### مرتجع المشتريات (Purchase Returns):
```
مرتجع مشتريات جديد
    ↓
حفظ مرتجع المشتريات (purchaseReturns collection)
    ↓
خصم المنتجات من المخزون (updateProductWarehouseStock - subtract)
    ↓
تسجيل حركة مخزون (inventory collection) - type: 'out'
    ↓
عكس القيد المحاسبي الأصلي
    ├─ مدين: حساب المورد
    └─ دائن: حساب المشتريات
    ↓
تحديث رصيد المورد
```

### 4. تدفق المخزون | Inventory Flow

```
حركة مخزون (إدخال يدوي أو تلقائي)
    ↓
التحقق من الكمية المتاحة (للعمليات التي تقلل المخزون)
    ↓
تحديث warehouseStock في المنتج
    ↓
حساب currentStock الإجمالي
    ↓
تسجيل الحركة في inventory collection
    ↓
تحديث المنتج (products collection)
```

---

## 🧩 الوحدات الرئيسية | Main Modules

### 1. **DashboardModule** (`js/modules/dashboard.js`)
- لوحة معلومات رئيسية
- إحصائيات سريعة
- روابط سريعة للوحدات

### 2. **ProductsModule** (`js/modules/products.js`)
- إدارة المنتجات
- إدارة التصنيفات (ضمن المنتجات)
- إدارة الوحدات (ضمن المنتجات)
- تحويل الوحدات الفرعية

### 3. **SalesModule** (`js/modules/sales.js`)
- فواتير المبيعات
- تحديث المخزون
- توليد القيود المحاسبية
- ربط بالأطراف (عملاء)

### 4. **PurchasesModule** (`js/modules/purchases.js`)
- فواتير المشتريات
- تحديث المخزون
- تحديث أسعار الشراء
- توليد القيود المحاسبية
- ربط بالأطراف (موردين)

### 5. **SalesReturnsModule** (`js/modules/sales-returns.js`)
- مرتجعات المبيعات
- إعادة المنتجات للمخزون
- عكس القيود

### 6. **PurchaseReturnsModule** (`js/modules/purchase-returns.js`)
- مرتجعات المشتريات
- خصم من المخزون
- عكس القيود

### 7. **InventoryModule** (`js/modules/inventory.js`)
- عرض المخزون حسب المستودع
- حركات المخزون
- إدخال حركات يدوية
- تحويل بين المستودعات

### 8. **PartiesModule** (`js/modules/parties.js`)
- إدارة العملاء والموردين
- عرض الأرصدة
- ربط بالحسابات المحاسبية

### 9. **VouchersModule** (`js/modules/vouchers.js`)
- سندات القبض (Receipt)
- سندات الصرف (Payment)
- سندات القيد (Entry)
- سندات اليومية (Journal)
- التحقق من التوازن

### 10. **ChartOfAccountsModule** (`js/modules/chart-of-accounts.js`)
- دليل الحسابات (شجرة)
- إدارة الحسابات
- حساب الأرصدة

### 11. **ReportsModule** (`js/modules/reports.js`)
- تقارير المبيعات
- تقارير المشتريات
- تقارير المخزون
- تقارير محاسبية (الميزانية، الأرباح والخسائر)

### 12. **WarehousesModule** (`js/modules/warehouses.js`)
- إدارة المستودعات

### 13. **SettingsModule** (`js/modules/settings.js`)
- إعدادات النظام
- إعدادات الفواتير
- إعدادات المحاسبة

### 14. **PeriodLockModule** (`js/modules/period-lock.js`)
- إغلاق الفترات المحاسبية
- منع التعديل على القيود القديمة

### 15. **UsersModule** (`js/modules/users.js`)
- إدارة المستخدمين
- إدارة الصلاحيات

### 16. **CurrenciesModule** (`js/modules/currencies.js`)
- إدارة العملات
- أسعار الصرف

### 17. **CostCentersModule** (`js/modules/cost-centers.js`)
- مراكز الكلفة

### 18. **SalesRepsModule** (`js/modules/sales-reps.js`)
- مندوبي المبيعات

---

## 🔧 الخدمات المساعدة | Helper Services

### 1. **DatabaseService** (`js/database.js`)
- عمليات قاعدة البيانات الأساسية
- التخزين المؤقت (Caching)
- Batch operations

### 2. **Collections** (`js/database.js`)
- دوال مساعدة لكل Collection
- `getProducts()`, `getSales()`, `getPurchases()`, etc.
- `updateProductWarehouseStock()` - تحديث مخزون متعدد المستودعات
- `addInventoryMovement()` - إضافة حركة مخزون

### 3. **Utils** (`js/utils.js`)
- `showLoading()`, `hideLoading()`
- `showSuccess()`, `showError()`
- `formatCurrency()`, `formatDate()`
- `handleAsync()` - معالجة العمليات غير المتزامنة

---

## 💡 المميزات الرئيسية | Key Features

### 1. **إدارة المخزون متعدد المستودعات**
- كل منتج له مخزون في كل مستودع
- `warehouseStock` كـ Object في المنتج
- `currentStock` كمجموع جميع المستودعات

### 2. **تحويل الوحدات**
- دعم الوحدات الفرعية (Sub-units)
- تحويل تلقائي عند المبيعات/المشتريات
- نوعان: `multiply` و `divide`

### 3. **القيود المحاسبية التلقائية**
- توليد تلقائي عند المبيعات/المشتريات
- توازن تلقائي (مدين = دائن)
- ربط بالأطراف والحسابات

### 4. **عملات متعددة**
- دعم العملات المختلفة
- تحويل تلقائي للعملة الأساسية
- حفظ المبلغ الأصلي والعملة

### 5. **إغلاق الفترات المحاسبية**
- إغلاق الفترات لمنع التعديل
- حماية القيود القديمة

---

## 🔄 التدفقات المعقدة | Complex Flows

### عند تعديل فاتورة مبيعات:

```
1. استرجاع البيانات القديمة
2. عكس التغييرات القديمة:
   - إعادة المنتجات للمخزون
   - حذف القيود المحاسبية القديمة
   - تحديث رصيد العميل
3. تطبيق التغييرات الجديدة:
   - تقليل المخزون (بالقيم الجديدة)
   - إنشاء قيود جديدة
   - تحديث رصيد العميل
```

### عند حذف فاتورة:

```
1. إعادة المنتجات للمخزون (كله)
2. حذف القيود المحاسبية
3. تحديث رصيد الطرف
4. حذف الفاتورة
```

---

## 📈 التقارير | Reports

### أنواع التقارير:
1. **تقارير المبيعات** - حسب الفترة، المنتج، العميل
2. **تقارير المشتريات** - حسب الفترة، المنتج، المورد
3. **تقارير المخزون** - الكميات، القيم، المنتجات المنخفضة
4. **التقارير المحاسبية:**
   - الميزانية العمومية
   - قائمة الأرباح والخسائر
   - قائمة التدفقات النقدية
   - أرصدة الحسابات

---

## 🎯 نقاط القوة | Strengths

1. ✅ **بنية معمارية جيدة** - وحدات منفصلة
2. ✅ **تكامل قوي** - بين المبيعات والمشتريات والمخزون والمحاسبة
3. ✅ **دقة محاسبية** - قيود متوازنة تلقائياً
4. ✅ **مرونة في المخزون** - مستودعات متعددة
5. ✅ **أمان جيد** - قواعد Firestore محكمة

---

## ⚠️ نقاط تحتاج تحسين | Areas for Improvement

1. ⚠️ **معالجة الأخطاء** - يمكن تحسينها في بعض الأماكن
2. ⚠️ **الأداء** - مع البيانات الكبيرة قد يحتاج تحسين
3. ⚠️ **التوثيق** - بعض الدوال تحتاج توثيق أفضل
4. ⚠️ **الاختبارات** - لا توجد اختبارات تلقائية

---

## 🎓 الخلاصة | Summary

النظام هو **نظام محاسبة ومخزون متكامل** يتضمن:

- ✅ **19 وحدة** منفصلة
- ✅ **تكامل كامل** بين جميع الأجزاء
- ✅ **إدارة مخزون متقدمة** (مستودعات متعددة)
- ✅ **محاسبة متكاملة** (قيود تلقائية)
- ✅ **أمان محكم** (Firestore rules)
- ✅ **واجهة عصرية** (Bootstrap + CSS مخصص)

النظام **جاهز للإنتاج** لكن يحتاج **تدقيق شامل** قبل النشر - وهذا ما تم إعداده في أدوات التدقيق!

---

**تم الفهم بواسطة:** AI Assistant  
**التاريخ:** 2024







