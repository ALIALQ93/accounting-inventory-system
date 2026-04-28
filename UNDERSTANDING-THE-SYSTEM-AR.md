# فهم شامل لنظام المحاسبة والمخزون
## Comprehensive System Understanding

**التاريخ:** 2024  
**النسخة:** 11.1  
**نوع النظام:** Single Page Application (SPA) - نظام صفحة واحدة

---

## 📋 نظرة عامة | Overview

نظام متكامل لإدارة **المحاسبة والمخزون** مبني على:
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla - بدون إطارات عمل)
- **Backend:** Firebase (Firestore Database, Authentication, Storage)
- **البنية:** Modular Architecture (وحدات منفصلة)
- **الواجهة:** Bootstrap 5 + CSS مخصص

---

## 🏗️ البنية المعمارية | Architecture

### 1. الهيكل العام للبرنامج

```
┌─────────────────────────────────────┐
│         index.html                  │  ← نقطة الدخول الوحيدة
│    (Single Page Application)       │
└──────────────┬──────────────────────┘
               │
               ├─── Firebase SDK
               │    ├── Authentication
               │    ├── Firestore (Database)
               │    └── Storage (الصور)
               │
               ├─── js/config.js
               │    └── إعدادات Firebase والتطبيق
               │
               ├─── js/app.js
               │    └── Application Class (إدارة الوحدات)
               │
               ├─── js/auth.js
               │    └── AuthService (المصادقة)
               │
               ├─── js/database.js
               │    ├── DatabaseService (عمليات قاعدة البيانات)
               │    └── Collections (دوال مساعدة لكل Collection)
               │
               ├─── js/utils.js
               │    └── وظائف مساعدة (formatCurrency, showError, etc.)
               │
               └─── js/modules/ (19 وحدة)
                    ├── dashboard.js
                    ├── products.js
                    ├── sales.js
                    ├── purchases.js
                    ├── sales-returns.js
                    ├── purchase-returns.js
                    ├── inventory.js
                    ├── parties.js
                    ├── vouchers.js
                    ├── chart-of-accounts.js
                    ├── reports.js
                    ├── warehouses.js
                    ├── settings.js
                    ├── period-lock.js
                    ├── users.js
                    ├── currencies.js
                    ├── cost-centers.js
                    ├── sales-reps.js
                    └── accounts.js
```

### 2. التدفق الرئيسي للتطبيق

```
1. تحميل index.html
   ↓
2. تحميل Firebase SDK (من CDN)
   ↓
3. تحميل config.js (إعدادات Firebase)
   ↓
4. تهيئة Application (app.js)
   ↓
5. التحقق من المصادقة (auth.js)
   ├─ إذا مسجل دخول → عرض Dashboard
   └─ إذا غير مسجل → عرض صفحة تسجيل الدخول
   ↓
6. عند النقر على قائمة → app.showModule()
   ↓
7. تحميل الوحدة المناسبة (loadModuleData)
   ↓
8. الوحدة تعرض HTML وتحمّل البيانات من Firestore
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

### Collections الرئيسية

#### 1. **products** - المنتجات
```javascript
{
  id: "product-id",
  code: "PRD0001",              // كود المنتج (فريد)
  name: "اسم المنتج",
  name2: "Product Name (EN)",   // الاسم بالإنجليزية
  categoryId: "category-id",
  categoryName: "اسم الفئة",
  unitId: "unit-id",            // الوحدة الأساسية
  unitName: "كيلو",
  
  // الأسعار
  purchasePrice: 1000,          // سعر الشراء
  sellingPrice: 1500,           // سعر البيع
  wholesalePrice: 1200,         // سعر الجملة
  
  // المخزون
  currentStock: 150,            // المخزون الإجمالي
  warehouseStock: {              // المخزون حسب المستودع
    "warehouse-id-1": 100,
    "warehouse-id-2": 50
  },
  minStock: 10,                  // الحد الأدنى
  
  // الوحدات الفرعية
  subUnits: [
    {
      unitId: "sub-unit-id",
      unitName: "جرام",
      conversionFactor: 1000,    // 1 كيلو = 1000 جرام
      conversionType: "multiply" // أو "divide"
    }
  ],
  
  // معلومات إضافية
  barcode: "123456789",
  brand: "العلامة التجارية",
  description: "وصف المنتج",
  image: "url-to-image",
  hasExpiryDate: false,
  hasSerialNumber: false,
  status: "active",
  
  // تتبع
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: "user-id",
  updatedBy: "user-id"
}
```

#### 2. **sales** - المبيعات
```javascript
{
  id: "sale-id",
  invoiceNo: "INV-2024-0001",
  partyId: "party-id",          // العميل
  partyName: "اسم العميل",
  date: Timestamp,
  warehouseId: "warehouse-id",
  warehouseName: "اسم المستودع",
  
  // البنود
  items: [
    {
      productId: "product-id",
      productName: "اسم المنتج",
      productCode: "PRD0001",
      unitId: "unit-id",
      unitName: "كيلو",
      quantity: 10,
      quantityInMainUnit: 10,   // الكمية بالوحدة الأساسية
      unitPrice: 1500,
      discountAmount: 0,
      additionAmount: 0,
      netPrice: 1500,
      total: 15000
    }
  ],
  
  // المبالغ
  subtotal: 15000,
  discountAmount: 0,
  additionAmount: 0,
  taxAmount: 0,
  total: 15000,
  
  // الدفع
  paymentStatus: "paid|partial|credit",
  paymentMethod: "cash|bank|credit",
  paidAmount: 15000,
  remainingAmount: 0,
  
  // العملة
  currency: "IQD",
  exchangeRate: 1,
  
  // المحاسبة
  generalEntryId: "entry-id",   // رابط القيد المحاسبي
  
  // تتبع
  status: "posted",
  notes: "ملاحظات",
  createdAt: Timestamp,
  createdBy: "user-id"
}
```

#### 3. **purchases** - المشتريات
```javascript
{
  id: "purchase-id",
  invoiceNo: "PUR-2024-0001",
  partyId: "party-id",          // المورد
  partyName: "اسم المورد",
  date: Timestamp,
  warehouseId: "warehouse-id",
  
  items: [...],                 // نفس هيكل sales.items
  subtotal: 10000,
  total: 10000,
  paymentStatus: "paid|partial|credit",
  generalEntryId: "entry-id",
  // ... نفس الحقول الأخرى
}
```

#### 4. **inventoryMovements** - حركات المخزون
```javascript
{
  id: "movement-id",
  type: "in|out|transfer|adjustment",
  productId: "product-id",
  productName: "اسم المنتج",
  warehouseId: "warehouse-id",
  warehouseName: "اسم المستودع",
  fromWarehouseId: null,        // للتحويلات
  fromWarehouseName: null,
  
  unitId: "unit-id",
  quantity: 10,                  // الكمية بالوحدة المستخدمة
  quantityInMainUnit: 10,        // الكمية بالوحدة الأساسية
  
  unitPrice: 1000,
  totalCost: 10000,
  
  previousQuantity: 90,
  newQuantity: 100,
  
  reference: "INV-2024-0001",     // رقم المرجع
  referenceType: "sale|purchase|sale_return|purchase_return",
  sourceType: "sale",
  sourceId: "sale-id",
  
  date: Timestamp,
  userId: "user-id",
  notes: "ملاحظات",
  createdAt: Timestamp
}
```

#### 5. **parties** - الأطراف (عملاء/موردين)
```javascript
{
  id: "party-id",
  code: "C001",
  name: "اسم الطرف",
  type: "customer|supplier|both",
  
  // الحساب المحاسبي
  accountId: "chart-of-account-id",
  accountName: "حساب العميل",
  accountCode: "1-2-001",
  
  // الأرصدة
  balance: 150000,               // الرصيد الحالي
  creditLimit: 500000,           // الحد الائتماني
  
  // معلومات الاتصال
  phone: "07901234567",
  email: "email@example.com",
  address: "العنوان",
  
  // تتبع
  status: "active",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 6. **generalEntries** - القيود المحاسبية
```javascript
{
  id: "entry-id",
  voucherId: "voucher-id",       // رابط السند (إن وجد)
  voucherNo: "VR-2024-0001",
  
  // القيود
  entries: [
    {
      accountId: "account-id",
      accountName: "حساب العميل",
      accountCode: "1-2-001",
      debit: 50000,              // مدين
      credit: 0,                 // دائن
      description: "فاتورة مبيعات رقم INV-2024-0001",
      originalAmount: 50000,
      originalCurrency: "IQD"
    },
    {
      accountId: "sales-account-id",
      accountName: "حساب المبيعات",
      debit: 0,
      credit: 50000,
      description: "فاتورة مبيعات رقم INV-2024-0001"
    }
  ],
  
  // التوازن
  totalDebit: 50000,
  totalCredit: 50000,
  isBalanced: true,              // يجب أن يكون true
  
  // المرجع
  reference: "INV-2024-0001",
  referenceType: "sale|purchase|voucher",
  
  date: Timestamp,
  createdAt: Timestamp,
  createdBy: "user-id"
}
```

#### 7. **vouchers** - السندات
```javascript
{
  id: "voucher-id",
  type: "receipt|payment|journal|entry",
  voucherNo: "VR-2024-0001",
  date: Timestamp,
  
  entries: [...],                // نفس هيكل generalEntries.entries
  totalDebit: 10000,
  totalCredit: 10000,
  isBalanced: true,
  
  status: "draft|posted",
  notes: "ملاحظات",
  createdAt: Timestamp,
  createdBy: "user-id"
}
```

#### 8. **chartOfAccounts** - دليل الحسابات
```javascript
{
  id: "account-id",
  code: "1-1-001",               // كود الحساب (فريد)
  name: "اسم الحساب",
  name2: "Account Name (EN)",
  
  parentId: "parent-account-id", // الحساب الأب (للشجرة)
  parentCode: "1-1",
  parentName: "اسم الحساب الأب",
  
  accountType: "asset|liability|equity|income|expense",
  level: 1|2|3,                  // مستوى الحساب في الشجرة
  
  balance: 0,                    // الرصيد الحالي
  debitBalance: 0,               // رصيد مدين
  creditBalance: 0,              // رصيد دائن
  
  isParent: false,               // هل الحساب أب (له حسابات فرعية)
  isActive: true,
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 9. **warehouses** - المستودعات
```javascript
{
  id: "warehouse-id",
  code: "WH001",
  name: "اسم المستودع",
  address: "العنوان",
  phone: "07901234567",
  manager: "اسم المدير",
  status: "active",
  createdAt: Timestamp
}
```

---

## 🔄 التكامل بين الوحدات | Module Integration

### 1. تدفق المبيعات | Sales Flow

```
فاتورة مبيعات جديدة
    ↓
التحقق من الكمية المتاحة في المخزون
    ├─ إذا غير متوفر → خطأ (إلا إذا كان مسموحاً)
    └─ إذا متوفر → المتابعة
    ↓
حفظ فاتورة المبيعات (sales collection)
    ↓
تقليل المخزون (updateProductWarehouseStock)
    ├─ تحديث warehouseStock[warehouseId]
    └─ تحديث currentStock (المجموع)
    ↓
تسجيل حركة مخزون (inventoryMovements collection)
    └─ type: 'out'
    ↓
توليد القيد المحاسبي (generateGeneralEntry)
    ├─ مدين: حساب العميل (من parties.accountId)
    └─ دائن: حساب المبيعات (من الإعدادات)
    ↓
حفظ القيد في generalEntries
    ↓
تحديث رصيد العميل في parties.balance
    └─ balance += total (زيادة الدين)
```

### 2. تدفق المشتريات | Purchases Flow

```
فاتورة مشتريات جديدة
    ↓
حفظ فاتورة المشتريات (purchases collection)
    ↓
زيادة المخزون (updateProductWarehouseStock)
    ├─ تحديث warehouseStock[warehouseId]
    └─ تحديث currentStock
    ↓
تسجيل حركة مخزون (inventoryMovements)
    └─ type: 'in'
    ↓
تحديث سعر الشراء للمنتج (إذا كان أفضل)
    └─ product.purchasePrice = min(oldPrice, newPrice)
    ↓
توليد القيد المحاسبي (generateGeneralEntry)
    ├─ مدين: حساب المشتريات (من الإعدادات)
    └─ دائن: حساب المورد (من parties.accountId)
    ↓
حفظ القيد في generalEntries
    ↓
تحديث رصيد المورد في parties.balance
    └─ balance -= total (زيادة الدين)
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
تسجيل حركة مخزون (inventoryMovements)
    └─ type: 'in'
    ↓
عكس القيد المحاسبي الأصلي
    ├─ مدين: حساب المبيعات (ناقص)
    └─ دائن: حساب العميل (ناقص)
    ↓
تحديث رصيد العميل
    └─ balance -= returnTotal (تقليل الدين)
```

#### مرتجع المشتريات (Purchase Returns):
```
مرتجع مشتريات جديد
    ↓
حفظ مرتجع المشتريات (purchaseReturns collection)
    ↓
خصم المنتجات من المخزون (updateProductWarehouseStock - subtract)
    ↓
تسجيل حركة مخزون (inventoryMovements)
    └─ type: 'out'
    ↓
عكس القيد المحاسبي الأصلي
    ├─ مدين: حساب المورد (ناقص)
    └─ دائن: حساب المشتريات (ناقص)
    ↓
تحديث رصيد المورد
    └─ balance += returnTotal (تقليل الدين)
```

### 4. تدفق المخزون | Inventory Flow

```
حركة مخزون (إدخال يدوي أو تلقائي)
    ↓
التحقق من الكمية المتاحة (للعمليات التي تقلل المخزون)
    ↓
تحديث warehouseStock في المنتج
    ├─ للزيادة: warehouseStock[warehouseId] += quantity
    └─ للنقصان: warehouseStock[warehouseId] -= quantity
    ↓
حساب currentStock الإجمالي
    └─ currentStock = sum of all warehouseStock values
    ↓
تسجيل الحركة في inventoryMovements collection
    ↓
تحديث المنتج (products collection)
```

---

## 🧩 الوحدات الرئيسية | Main Modules

### 1. **DashboardModule** (`js/modules/dashboard.js`)
- لوحة معلومات رئيسية
- إحصائيات سريعة (المبيعات، المشتريات، المخزون)
- روابط سريعة للوحدات

### 2. **ProductsModule** (`js/modules/products.js`)
- إدارة المنتجات (إضافة، تعديل، حذف)
- إدارة التصنيفات (ضمن المنتجات)
- إدارة الوحدات (ضمن المنتجات)
- تحويل الوحدات الفرعية
- رفع صور المنتجات

### 3. **SalesModule** (`js/modules/sales.js`)
- فواتير المبيعات
- تحديث المخزون تلقائياً
- توليد القيود المحاسبية
- ربط بالأطراف (عملاء)
- دعم العملات المتعددة

### 4. **PurchasesModule** (`js/modules/purchases.js`)
- فواتير المشتريات
- تحديث المخزون تلقائياً
- تحديث أسعار الشراء
- توليد القيود المحاسبية
- ربط بالأطراف (موردين)

### 5. **SalesReturnsModule** (`js/modules/sales-returns.js`)
- مرتجعات المبيعات
- إعادة المنتجات للمخزون
- عكس القيود المحاسبية

### 6. **PurchaseReturnsModule** (`js/modules/purchase-returns.js`)
- مرتجعات المشتريات
- خصم من المخزون
- عكس القيود المحاسبية

### 7. **InventoryModule** (`js/modules/inventory.js`)
- عرض المخزون حسب المستودع
- حركات المخزون
- إدخال حركات يدوية
- تحويل بين المستودعات
- تعديلات المخزون

### 8. **PartiesModule** (`js/modules/parties.js`)
- إدارة العملاء والموردين
- عرض الأرصدة
- ربط بالحسابات المحاسبية
- إدارة الحد الائتماني

### 9. **VouchersModule** (`js/modules/vouchers.js`)
- سندات القبض (Receipt)
- سندات الصرف (Payment)
- سندات القيد (Entry)
- سندات اليومية (Journal)
- التحقق من التوازن (مدين = دائن)

### 10. **ChartOfAccountsModule** (`js/modules/chart-of-accounts.js`)
- دليل الحسابات (شجرة)
- إدارة الحسابات (إضافة، تعديل، حذف)
- حساب الأرصدة (تجميع من الحسابات الفرعية)
- عرض الأرصدة حسب النوع

### 11. **ReportsModule** (`js/modules/reports.js`)
- تقارير المبيعات (حسب الفترة، المنتج، العميل)
- تقارير المشتريات (حسب الفترة، المنتج، المورد)
- تقارير المخزون (الكميات، القيم، المنتجات المنخفضة)
- التقارير المحاسبية:
  - الميزانية العمومية
  - قائمة الأرباح والخسائر
  - قائمة التدفقات النقدية
  - أرصدة الحسابات

### 12. **WarehousesModule** (`js/modules/warehouses.js`)
- إدارة المستودعات
- عرض المخزون حسب المستودع

### 13. **SettingsModule** (`js/modules/settings.js`)
- إعدادات النظام
- إعدادات الفواتير
- إعدادات المحاسبة
- إعدادات العملات

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

### 19. **AccountsModule** (`js/modules/accounts.js`)
- إدارة الحسابات (ربما مكرر مع ChartOfAccountsModule)

---

## 🔧 الخدمات المساعدة | Helper Services

### 1. **DatabaseService** (`js/database.js`)
```javascript
class DatabaseService {
  // عمليات CRUD الأساسية
  getDocument(collectionName, docId)
  getDocuments(collectionName, options)
  addDocument(collectionName, data)
  updateDocument(collectionName, docId, data)
  deleteDocument(collectionName, docId)
  
  // عمليات متقدمة
  batchWrite(operations)        // عمليات متعددة دفعة واحدة
  runTransaction(updateFunction) // معاملات
  clearCache()                  // مسح التخزين المؤقت
}
```

### 2. **Collections** (`js/database.js`)
دوال مساعدة لكل Collection:

```javascript
const Collections = {
  // Products
  getProducts(options)
  getProduct(productId)
  addProduct(productData)
  updateProduct(productId, productData)
  deleteProduct(productId)
  updateProductWarehouseStock(productId, warehouseId, quantity, operation)
  
  // Sales
  getSales(options)
  getSale(saleId)
  addSale(saleData)
  updateSale(saleId, saleData)
  deleteSale(saleId)
  
  // Purchases
  getPurchases(options)
  getPurchase(purchaseId)
  addPurchase(purchaseData)
  updatePurchase(purchaseId, purchaseData)
  deletePurchase(purchaseId)
  
  // Inventory
  addInventoryMovement(movementData)
  getInventoryMovements(options)
  
  // Parties
  getParties(options)
  getParty(partyId)
  addParty(partyData)
  updateParty(partyId, partyData)
  updatePartyBalance(partyId, amount, operation)
  
  // General Entries
  addGeneralEntry(entryData)
  getGeneralEntries(options)
  deleteGeneralEntry(entryId)
  
  // Chart of Accounts
  getAccounts(options)
  getAccount(accountId)
  addAccount(accountData)
  updateAccount(accountId, accountData)
  updateAccountBalance(accountId, debit, credit)
  
  // ... وغيرها
}
```

### 3. **Utils** (`js/utils.js`)
```javascript
// التنسيق
formatCurrency(amount)          // تنسيق العملة
formatNumber(number, decimals)   // تنسيق الأرقام
formatDate(date)                 // تنسيق التاريخ
formatDateTime(date)             // تنسيق التاريخ والوقت

// الرسائل
showLoading()                     // عرض مؤشر التحميل
hideLoading()                     // إخفاء مؤشر التحميل
showError(message)                // رسالة خطأ
showSuccess(message, timer)       // رسالة نجاح
showInfo(message, timer)          // رسالة معلومات

// المساعدة
handleAsync(asyncFn)             // معالجة العمليات غير المتزامنة
getTimestamp()                    // الحصول على Timestamp
validateEmail(email)              // التحقق من البريد الإلكتروني
validatePhone(phone)              // التحقق من الهاتف
```

---

## 💡 المميزات الرئيسية | Key Features

### 1. **إدارة المخزون متعدد المستودعات**
- كل منتج له مخزون في كل مستودع
- `warehouseStock` كـ Object في المنتج:
  ```javascript
  warehouseStock: {
    "warehouse-id-1": 100,
    "warehouse-id-2": 50
  }
  ```
- `currentStock` كمجموع جميع المستودعات

### 2. **تحويل الوحدات**
- دعم الوحدات الفرعية (Sub-units)
- تحويل تلقائي عند المبيعات/المشتريات
- نوعان:
  - `multiply`: الكمية × عامل التحويل
  - `divide`: الكمية ÷ عامل التحويل
- مثال: 1 كيلو = 1000 جرام (multiply)

### 3. **القيود المحاسبية التلقائية**
- توليد تلقائي عند المبيعات/المشتريات
- توازن تلقائي (مدين = دائن)
- ربط بالأطراف والحسابات
- دعم العملات المتعددة

### 4. **عملات متعددة**
- دعم العملات المختلفة (IQD, USD, EUR, TRY)
- تحويل تلقائي للعملة الأساسية (IQD)
- حفظ المبلغ الأصلي والعملة
- أسعار صرف قابلة للتحديث

### 5. **إغلاق الفترات المحاسبية**
- إغلاق الفترات لمنع التعديل
- حماية القيود القديمة
- منع التلاعب بالبيانات التاريخية

### 6. **التخزين المؤقت (Caching)**
- تخزين مؤقت للبيانات لمدة 5 دقائق
- تحسين الأداء
- مسح تلقائي عند التحديث

---

## 🔄 التدفقات المعقدة | Complex Flows

### عند تعديل فاتورة مبيعات:

```
1. استرجاع البيانات القديمة
   ↓
2. عكس التغييرات القديمة:
   ├─ إعادة المنتجات للمخزون (بالكميات القديمة)
   ├─ حذف القيود المحاسبية القديمة
   └─ تحديث رصيد العميل (تقليل الدين)
   ↓
3. تطبيق التغييرات الجديدة:
   ├─ تقليل المخزون (بالقيم الجديدة)
   ├─ إنشاء قيود جديدة
   └─ تحديث رصيد العميل (زيادة الدين)
```

### عند حذف فاتورة:

```
1. استرجاع بيانات الفاتورة
   ↓
2. إعادة المنتجات للمخزون (كله)
   ↓
3. حذف القيود المحاسبية
   ↓
4. تحديث رصيد الطرف
   └─ balance -= total (تقليل الدين)
   ↓
5. حذف الفاتورة
```

### عند تعديل رصيد حساب:

```
1. حساب الفرق بين الرصيد القديم والجديد
   ↓
2. تحديث الحساب مباشرة
   ↓
3. إذا كان الحساب أب:
   ├─ تحديث جميع الحسابات الفرعية
   └─ إعادة حساب الرصيد الإجمالي
   ↓
4. تحديث الحسابات الأب (إن وجدت)
```

---

## 📈 التقارير | Reports

### أنواع التقارير:

1. **تقارير المبيعات**
   - حسب الفترة (يومي، أسبوعي، شهري، سنوي)
   - حسب المنتج
   - حسب العميل
   - حسب المستودع

2. **تقارير المشتريات**
   - حسب الفترة
   - حسب المنتج
   - حسب المورد
   - حسب المستودع

3. **تقارير المخزون**
   - الكميات الحالية
   - القيم (بسعر الشراء/البيع)
   - المنتجات المنخفضة (أقل من الحد الأدنى)
   - حركات المخزون

4. **التقارير المحاسبية:**
   - الميزانية العمومية
   - قائمة الأرباح والخسائر
   - قائمة التدفقات النقدية
   - أرصدة الحسابات
   - ميزان المراجعة

---

## 🎯 نقاط القوة | Strengths

1. ✅ **بنية معمارية جيدة** - وحدات منفصلة وسهلة الصيانة
2. ✅ **تكامل قوي** - بين المبيعات والمشتريات والمخزون والمحاسبة
3. ✅ **دقة محاسبية** - قيود متوازنة تلقائياً
4. ✅ **مرونة في المخزون** - مستودعات متعددة
5. ✅ **أمان جيد** - قواعد Firestore محكمة
6. ✅ **واجهة عصرية** - Bootstrap 5 + CSS مخصص
7. ✅ **دعم متعدد اللغات** - عربي/إنجليزي
8. ✅ **دعم العملات المتعددة** - تحويل تلقائي

---

## ⚠️ نقاط تحتاج تحسين | Areas for Improvement

1. ⚠️ **معالجة الأخطاء** - يمكن تحسينها في بعض الأماكن
2. ⚠️ **الأداء** - مع البيانات الكبيرة قد يحتاج تحسين (Pagination)
3. ⚠️ **التوثيق** - بعض الدوال تحتاج توثيق أفضل
4. ⚠️ **الاختبارات** - لا توجد اختبارات تلقائية
5. ⚠️ **التحقق من البيانات** - يمكن تحسين التحقق من صحة البيانات
6. ⚠️ **التخزين المؤقت** - يمكن تحسين استراتيجية التخزين المؤقت

---

## 🔍 نقاط مهمة للفهم | Important Points

### 1. تحويل الوحدات
عند البيع/الشراء بوحدة فرعية:
```javascript
// مثال: بيع 500 جرام (الوحدة الأساسية: كيلو)
quantityInMainUnit = 500 / 1000 = 0.5 كيلو
```

### 2. تحديث المخزون
```javascript
// للزيادة (مشتريات)
warehouseStock[warehouseId] += quantityInMainUnit
currentStock = sum of all warehouseStock values

// للنقصان (مبيعات)
warehouseStock[warehouseId] -= quantityInMainUnit
currentStock = sum of all warehouseStock values
```

### 3. القيود المحاسبية
```javascript
// يجب أن يكون:
totalDebit === totalCredit

// مثال:
// مدين: حساب العميل = 50000
// دائن: حساب المبيعات = 50000
// ✅ متوازن
```

### 4. تحديث الأرصدة
```javascript
// للعملاء (المبيعات)
party.balance += saleTotal  // زيادة الدين

// للموردين (المشتريات)
party.balance -= purchaseTotal  // زيادة الدين (سالبة = دائن)
```

---

## 🎓 الخلاصة | Summary

النظام هو **نظام محاسبة ومخزون متكامل** يتضمن:

- ✅ **19 وحدة** منفصلة
- ✅ **تكامل كامل** بين جميع الأجزاء
- ✅ **إدارة مخزون متقدمة** (مستودعات متعددة)
- ✅ **محاسبة متكاملة** (قيود تلقائية)
- ✅ **أمان محكم** (Firestore rules)
- ✅ **واجهة عصرية** (Bootstrap + CSS مخصص)
- ✅ **دعم متعدد اللغات** (عربي/إنجليزي)
- ✅ **دعم العملات المتعددة**

النظام **جاهز للإنتاج** لكن يحتاج **تدقيق شامل** قبل النشر.

---

## 📚 الملفات المرجعية | Reference Files

- `SYSTEM-UNDERSTANDING-SUMMARY.md` - ملخص سريع
- `MODULES-COMPREHENSIVE-REVIEW.md` - مراجعة شاملة للوحدات
- `MODULES-INTEGRATION-REVIEW.md` - مراجعة التكامل
- `TEST-SCENARIOS-CHECKLIST.md` - قائمة سيناريوهات الاختبار
- `PRE-RELEASE-AUDIT-CHECKLIST.md` - قائمة التدقيق قبل النشر

---

**تم الفهم بواسطة:** AI Assistant  
**التاريخ:** 2024  
**النسخة:** 11.1







