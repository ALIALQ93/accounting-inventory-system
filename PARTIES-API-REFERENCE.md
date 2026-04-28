# 📚 مرجع API لوحدة العملاء والموردين - Parties Module API Reference

## 🎯 نظرة عامة

هذا المرجع موجه للمطورين الذين سيستخدمون وحدة العملاء والموردين في وحدات أخرى (المبيعات، المشتريات، إلخ).

---

## 📦 استيراد الوحدة

```javascript
// الوحدة متاحة عالمياً كـ:
PartiesModule
```

---

## 🔧 الدوال العامة (Public Functions)

### 1. **getPartyById(partyId)**

الحصول على بيانات عميل/مورد بواسطة ID.

#### المعاملات (Parameters):
- `partyId` (string): معرف العميل/المورد في Firestore

#### القيمة المُرجعة (Returns):
- `Promise<Object|null>`: كائن بيانات العميل/المورد أو null إذا لم يُوجد

#### البيانات المُرجعة:
```javascript
{
    id: "party-doc-id",
    code: "C001",
    name: "شركة الأمل للتجارة",
    type: "customer",
    accountId: "account-doc-id",  // IMPORTANT: معرف الحساب المحاسبي
    phone: "07701234567",
    email: "info@amal.com",
    address: "بغداد - الكرادة",
    balance: 150000,
    creditLimit: 500000,
    status: "active",
    lastTransactionDate: Timestamp,
    createdAt: Timestamp,
    createdBy: "user-uid",
    updatedAt: Timestamp
}
```

#### مثال الاستخدام:
```javascript
// في وحدة المبيعات
const customer = await PartiesModule.getPartyById(selectedCustomerId);

if (customer) {
    console.log('اسم العميل:', customer.name);
    console.log('الحساب المحاسبي:', customer.accountId);
    console.log('الرصيد الحالي:', customer.balance);
    console.log('حد الائتمان:', customer.creditLimit);
    
    // التحقق من تجاوز حد الائتمان
    if (customer.balance + invoiceTotal > customer.creditLimit) {
        showWarning('تحذير: تجاوز حد الائتمان!');
    }
} else {
    showError('لم يتم العثور على العميل');
}
```

---

### 2. **getActiveCustomers()**

الحصول على قائمة بجميع العملاء النشطين.

#### المعاملات (Parameters):
- لا يوجد

#### القيمة المُرجعة (Returns):
- `Promise<Array>`: مصفوفة من كائنات العملاء، مرتبة أبجدياً حسب الاسم

#### مثال الاستخدام:
```javascript
// في وحدة المبيعات - ملء قائمة منسدلة بالعملاء
async function loadCustomersDropdown() {
    const customers = await PartiesModule.getActiveCustomers();
    
    const selectElement = document.getElementById('customerSelect');
    selectElement.innerHTML = '<option value="">-- اختر العميل --</option>';
    
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = `${customer.code} - ${customer.name}`;
        option.dataset.accountId = customer.accountId; // IMPORTANT
        option.dataset.balance = customer.balance;
        option.dataset.creditLimit = customer.creditLimit;
        selectElement.appendChild(option);
    });
}
```

---

### 3. **getActiveSuppliers()**

الحصول على قائمة بجميع الموردين النشطين.

#### المعاملات (Parameters):
- لا يوجد

#### القيمة المُرجعة (Returns):
- `Promise<Array>`: مصفوفة من كائنات الموردين، مرتبة أبجدياً حسب الاسم

#### مثال الاستخدام:
```javascript
// في وحدة المشتريات - ملء قائمة منسدلة بالموردين
async function loadSuppliersDropdown() {
    const suppliers = await PartiesModule.getActiveSuppliers();
    
    const selectElement = document.getElementById('supplierSelect');
    selectElement.innerHTML = '<option value="">-- اختر المورد --</option>';
    
    suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier.id;
        option.textContent = `${supplier.code} - ${supplier.name}`;
        option.dataset.accountId = supplier.accountId; // IMPORTANT
        option.dataset.balance = supplier.balance;
        selectElement.appendChild(option);
    });
}
```

---

### 4. **updatePartyBalance(partyId, amount, operation)**

تحديث رصيد عميل/مورد.

#### المعاملات (Parameters):
- `partyId` (string): معرف العميل/المورد
- `amount` (number): المبلغ
- `operation` (string): نوع العملية:
  - `'add'`: إضافة المبلغ للرصيد الحالي
  - `'subtract'`: طرح المبلغ من الرصيد الحالي
  - `'set'`: تعيين الرصيد مباشرة

#### القيمة المُرجعة (Returns):
- `Promise<number>`: الرصيد الجديد

#### Throws:
- `Error`: إذا لم يُوجد العميل/المورد

#### مثال الاستخدام:
```javascript
// عند حفظ فاتورة مبيعات
try {
    const invoiceTotal = 500000;
    const newBalance = await PartiesModule.updatePartyBalance(
        customerId,
        invoiceTotal,
        'add'
    );
    console.log('الرصيد الجديد:', newBalance);
} catch (error) {
    console.error('خطأ في تحديث الرصيد:', error);
    showError('فشل تحديث رصيد العميل');
}

// عند إلغاء فاتورة
await PartiesModule.updatePartyBalance(customerId, invoiceTotal, 'subtract');

// عند تعديل فاتورة
const oldTotal = 300000;
const newTotal = 500000;
// طرح القيمة القديمة
await PartiesModule.updatePartyBalance(customerId, oldTotal, 'subtract');
// إضافة القيمة الجديدة
await PartiesModule.updatePartyBalance(customerId, newTotal, 'add');
```

---

### 5. **getAccountName(accountId)**

الحصول على اسم الحساب المحاسبي بصيغة "الكود - الاسم".

#### المعاملات (Parameters):
- `accountId` (string): معرف الحساب المحاسبي

#### القيمة المُرجعة (Returns):
- `Promise<string>`: اسم الحساب بصيغة "1-2-1-001 - عميل شركة الأمل" أو "-" إذا لم يُوجد

#### مثال الاستخدام:
```javascript
// عرض اسم الحساب المحاسبي للعميل
const customer = await PartiesModule.getPartyById(customerId);
const accountName = await PartiesModule.getAccountName(customer.accountId);
console.log('الحساب المحاسبي للعميل:', accountName);
```

---

### 6. **loadAccountsForSelection(partyType)**

تحميل الحسابات المحاسبية المناسبة للعملاء أو الموردين.

#### المعاملات (Parameters):
- `partyType` (string): نوع الطرف ('customer' أو 'supplier')

#### القيمة المُرجعة (Returns):
- `Promise<Array>`: مصفوفة من كائنات الحسابات المحاسبية المناسبة

#### المنطق:
- للعملاء (`'customer'`): يُرجع الحسابات التي تبدأ بـ `1-2` أو `12` (المدينين)
- للموردين (`'supplier'`): يُرجع الحسابات التي تبدأ بـ `2-1` أو `21` (الدائنين)

#### مثال الاستخدام:
```javascript
// داخلي - يُستخدم في نافذة إضافة/تعديل العميل
const accounts = await PartiesModule.loadAccountsForSelection('customer');
console.log('الحسابات المتاحة:', accounts);
```

---

## 🔗 استخدام الحساب المحاسبي في القيود

### سيناريو: إنشاء فاتورة مبيعات

```javascript
/**
 * إنشاء فاتورة مبيعات وتوليد القيد المحاسبي التلقائي
 */
async function createSalesInvoice(invoiceData) {
    try {
        // 1. الحصول على بيانات العميل (بما فيها الحساب المحاسبي)
        const customer = await PartiesModule.getPartyById(invoiceData.customerId);
        
        if (!customer) {
            throw new Error('العميل غير موجود');
        }
        
        // 2. التحقق من حد الائتمان
        const newBalance = customer.balance + invoiceData.total;
        if (newBalance > customer.creditLimit) {
            const confirmed = await Swal.fire({
                title: 'تحذير',
                text: `سيتم تجاوز حد الائتمان (${customer.creditLimit})`,
                icon: 'warning',
                showCancelButton: true
            });
            if (!confirmed.isConfirmed) return;
        }
        
        // 3. حفظ الفاتورة في Firestore
        const invoiceRef = await db.collection('salesInvoices').add({
            ...invoiceData,
            customerId: customer.id,
            customerName: customer.name,
            customerAccountId: customer.accountId, // IMPORTANT
            createdAt: new Date(),
            createdBy: auth.currentUser.uid
        });
        
        // 4. تحديث رصيد العميل
        await PartiesModule.updatePartyBalance(
            customer.id,
            invoiceData.total,
            'add'
        );
        
        // 5. توليد القيد المحاسبي التلقائي
        const journalEntry = {
            date: invoiceData.date,
            reference: `فاتورة مبيعات رقم ${invoiceData.invoiceNumber}`,
            description: `فاتورة مبيعات للعميل ${customer.name}`,
            entries: [
                {
                    accountId: customer.accountId,  // من بيانات العميل!
                    accountName: await PartiesModule.getAccountName(customer.accountId),
                    debit: invoiceData.total,
                    credit: 0,
                    description: `مدين - ${customer.name}`
                },
                {
                    accountId: invoiceData.salesAccountId, // حساب المبيعات
                    accountName: 'حساب المبيعات',
                    debit: 0,
                    credit: invoiceData.total,
                    description: 'دائن - مبيعات بضاعة'
                }
            ],
            sourceType: 'salesInvoice',
            sourceId: invoiceRef.id,
            status: 'approved',
            createdAt: new Date(),
            createdBy: auth.currentUser.uid
        };
        
        // 6. حفظ القيد المحاسبي
        await db.collection('generalEntries').add(journalEntry);
        
        showSuccess('تم حفظ الفاتورة والقيد المحاسبي بنجاح');
        
    } catch (error) {
        console.error('خطأ في إنشاء فاتورة المبيعات:', error);
        showError('فشل حفظ الفاتورة');
    }
}
```

---

### سيناريو: إنشاء فاتورة مشتريات

```javascript
/**
 * إنشاء فاتورة مشتريات وتوليد القيد المحاسبي التلقائي
 */
async function createPurchaseInvoice(invoiceData) {
    try {
        // 1. الحصول على بيانات المورد (بما فيها الحساب المحاسبي)
        const supplier = await PartiesModule.getPartyById(invoiceData.supplierId);
        
        if (!supplier) {
            throw new Error('المورد غير موجود');
        }
        
        // 2. حفظ الفاتورة في Firestore
        const invoiceRef = await db.collection('purchaseInvoices').add({
            ...invoiceData,
            supplierId: supplier.id,
            supplierName: supplier.name,
            supplierAccountId: supplier.accountId, // IMPORTANT
            createdAt: new Date(),
            createdBy: auth.currentUser.uid
        });
        
        // 3. تحديث رصيد المورد
        await PartiesModule.updatePartyBalance(
            supplier.id,
            invoiceData.total,
            'add'
        );
        
        // 4. توليد القيد المحاسبي التلقائي
        const journalEntry = {
            date: invoiceData.date,
            reference: `فاتورة مشتريات رقم ${invoiceData.invoiceNumber}`,
            description: `فاتورة مشتريات من المورد ${supplier.name}`,
            entries: [
                {
                    accountId: invoiceData.purchasesAccountId, // حساب المشتريات
                    accountName: 'حساب المشتريات',
                    debit: invoiceData.total,
                    credit: 0,
                    description: 'مدين - مشتريات بضاعة'
                },
                {
                    accountId: supplier.accountId,  // من بيانات المورد!
                    accountName: await PartiesModule.getAccountName(supplier.accountId),
                    debit: 0,
                    credit: invoiceData.total,
                    description: `دائن - ${supplier.name}`
                }
            ],
            sourceType: 'purchaseInvoice',
            sourceId: invoiceRef.id,
            status: 'approved',
            createdAt: new Date(),
            createdBy: auth.currentUser.uid
        };
        
        // 5. حفظ القيد المحاسبي
        await db.collection('generalEntries').add(journalEntry);
        
        showSuccess('تم حفظ الفاتورة والقيد المحاسبي بنجاح');
        
    } catch (error) {
        console.error('خطأ في إنشاء فاتورة المشتريات:', error);
        showError('فشل حفظ الفاتورة');
    }
}
```

---

## 📊 هيكل البيانات

### Party Object (كائن العميل/المورد)

```typescript
interface Party {
    id: string;              // معرف Firestore (auto-generated)
    code: string;            // كود العميل/المورد (مثل C001, S001)
    name: string;            // الاسم
    type: 'customer' | 'supplier' | 'both';  // النوع
    accountId: string;       // معرف الحساب المحاسبي (CRITICAL)
    phone?: string;          // رقم الهاتف
    email?: string;          // البريد الإلكتروني
    address?: string;        // العنوان
    balance: number;         // الرصيد الحالي
    creditLimit: number;     // حد الائتمان
    status: 'active' | 'inactive';  // الحالة
    lastTransactionDate?: Timestamp;  // تاريخ آخر معاملة
    createdAt: Timestamp;    // تاريخ الإنشاء
    createdBy: string;       // معرف المستخدم المنشئ
    updatedAt?: Timestamp;   // تاريخ آخر تحديث
    updatedBy?: string;      // معرف المستخدم المحدث
}
```

---

## 🔄 دورة حياة الفاتورة مع الحساب المحاسبي

```
1. المستخدم ينشئ فاتورة مبيعات
        ↓
2. يختار العميل من القائمة
        ↓
3. النظام يحصل على customer.accountId
        ↓
4. يحفظ الفاتورة مع customerAccountId
        ↓
5. يحدّث رصيد العميل
        ↓
6. يولّد القيد المحاسبي التلقائي:
   - مدين: customer.accountId
   - دائن: salesAccountId
        ↓
7. يحفظ القيد في generalEntries
        ↓
✅ اكتمل - القيد المحاسبي مرتبط بالعميل!
```

---

## ⚠️ أفضل الممارسات

### 1. **دائماً تحقق من وجود العميل/المورد**
```javascript
const customer = await PartiesModule.getPartyById(customerId);
if (!customer) {
    showError('العميل غير موجود');
    return;
}
```

### 2. **تحقق من حد الائتمان**
```javascript
const newBalance = customer.balance + invoiceTotal;
if (newBalance > customer.creditLimit) {
    // اعرض تحذير أو امنع الحفظ
}
```

### 3. **تحقق من وجود الحساب المحاسبي**
```javascript
if (!customer.accountId) {
    showError('العميل غير مرتبط بحساب محاسبي');
    return;
}
```

### 4. **استخدم try-catch**
```javascript
try {
    await PartiesModule.updatePartyBalance(customerId, amount, 'add');
} catch (error) {
    console.error('خطأ في تحديث الرصيد:', error);
    showError('فشل تحديث الرصيد');
}
```

### 5. **حدّث الرصيد عند الحفظ/التعديل/الحذف**
```javascript
// عند الحفظ
await PartiesModule.updatePartyBalance(customerId, total, 'add');

// عند الحذف
await PartiesModule.updatePartyBalance(customerId, total, 'subtract');

// عند التعديل
await PartiesModule.updatePartyBalance(customerId, oldTotal, 'subtract');
await PartiesModule.updatePartyBalance(customerId, newTotal, 'add');
```

---

## 🚫 الأخطاء الشائعة

### ❌ **خطأ: عدم التحقق من accountId**
```javascript
// خطأ!
const entry = {
    accountId: customer.accountId  // قد يكون undefined
};
```

### ✅ **صحيح:**
```javascript
if (!customer.accountId) {
    throw new Error('العميل غير مرتبط بحساب محاسبي');
}
const entry = {
    accountId: customer.accountId
};
```

---

### ❌ **خطأ: نسيان تحديث الرصيد**
```javascript
// خطأ! حفظ الفاتورة بدون تحديث الرصيد
await db.collection('salesInvoices').add(invoiceData);
// النتيجة: الرصيد غير صحيح
```

### ✅ **صحيح:**
```javascript
await db.collection('salesInvoices').add(invoiceData);
await PartiesModule.updatePartyBalance(customerId, total, 'add');
```

---

### ❌ **خطأ: استخدام الحسابات غير النهائية**
```javascript
// خطأ! ربط العميل بحساب رئيسي
accountId: "1-2"  // حساب رئيسي، ليس نهائي
```

### ✅ **صحيح:**
```javascript
// ربط العميل بحساب نهائي
accountId: "1-2-1-001"  // حساب نهائي تحت المدينين
```

---

## 📝 ملاحظات للمطورين

1. **جميع الدوال async**: كل دوال الوحدة تُرجع Promises، استخدم `await`
2. **الحساب المحاسبي إلزامي**: لا يمكن حفظ عميل/مورد بدونه
3. **تحديث الرصيد يدوي**: يجب استدعاء `updatePartyBalance` يدوياً من وحدات الفواتير
4. **التاريخ التلقائي**: `lastTransactionDate` يُحدّث تلقائياً عند `updatePartyBalance`
5. **العملاء والموردين منفصلون**: استخدم الدوال المناسبة لكل نوع

---

## 🎓 مثال متكامل

```javascript
/**
 * مثال متكامل: إنشاء فاتورة مبيعات بقيد محاسبي تلقائي
 */
async function completeSalesInvoiceExample() {
    try {
        // 1. تحميل قائمة العملاء
        const customers = await PartiesModule.getActiveCustomers();
        console.log('العملاء المتاحون:', customers.length);
        
        // 2. افترض أن المستخدم اختار عميل
        const selectedCustomerId = customers[0].id;
        
        // 3. الحصول على بيانات العميل الكاملة
        const customer = await PartiesModule.getPartyById(selectedCustomerId);
        console.log('العميل المختار:', customer.name);
        console.log('الحساب المحاسبي:', customer.accountId);
        
        // 4. بيانات الفاتورة
        const invoiceData = {
            invoiceNumber: 'INV-001',
            date: new Date(),
            customerId: customer.id,
            items: [
                { productId: 'P001', quantity: 10, price: 5000, total: 50000 },
                { productId: 'P002', quantity: 5, price: 10000, total: 50000 }
            ],
            total: 100000
        };
        
        // 5. التحقق من حد الائتمان
        const newBalance = customer.balance + invoiceData.total;
        if (newBalance > customer.creditLimit) {
            console.warn('تحذير: تجاوز حد الائتمان');
        }
        
        // 6. حفظ الفاتورة
        const invoiceRef = await db.collection('salesInvoices').add({
            ...invoiceData,
            customerAccountId: customer.accountId,
            createdAt: new Date()
        });
        
        // 7. تحديث رصيد العميل
        const updatedBalance = await PartiesModule.updatePartyBalance(
            customer.id,
            invoiceData.total,
            'add'
        );
        console.log('الرصيد الجديد:', updatedBalance);
        
        // 8. توليد القيد المحاسبي
        const accountName = await PartiesModule.getAccountName(customer.accountId);
        const journalEntry = {
            date: invoiceData.date,
            reference: `فاتورة مبيعات ${invoiceData.invoiceNumber}`,
            entries: [
                {
                    accountId: customer.accountId,
                    accountName: accountName,
                    debit: invoiceData.total,
                    credit: 0
                },
                {
                    accountId: 'sales-account-id',
                    accountName: 'حساب المبيعات',
                    debit: 0,
                    credit: invoiceData.total
                }
            ],
            sourceType: 'salesInvoice',
            sourceId: invoiceRef.id,
            status: 'approved',
            createdAt: new Date()
        };
        
        await db.collection('generalEntries').add(journalEntry);
        
        console.log('✅ تم الحفظ بنجاح!');
        showSuccess('تم حفظ الفاتورة والقيد المحاسبي');
        
    } catch (error) {
        console.error('❌ خطأ:', error);
        showError('فشل العملية');
    }
}
```

---

**نهاية المرجع 📚**

للمزيد من المعلومات، راجع:
- `PARTIES-MANAGEMENT-COMPLETE.md`
- `دليل-وحدة-العملاء-والموردين.md`
- `TEST-PARTIES-MODULE.md`




## 🎯 نظرة عامة

هذا المرجع موجه للمطورين الذين سيستخدمون وحدة العملاء والموردين في وحدات أخرى (المبيعات، المشتريات، إلخ).

---

## 📦 استيراد الوحدة

```javascript
// الوحدة متاحة عالمياً كـ:
PartiesModule
```

---

## 🔧 الدوال العامة (Public Functions)

### 1. **getPartyById(partyId)**

الحصول على بيانات عميل/مورد بواسطة ID.

#### المعاملات (Parameters):
- `partyId` (string): معرف العميل/المورد في Firestore

#### القيمة المُرجعة (Returns):
- `Promise<Object|null>`: كائن بيانات العميل/المورد أو null إذا لم يُوجد

#### البيانات المُرجعة:
```javascript
{
    id: "party-doc-id",
    code: "C001",
    name: "شركة الأمل للتجارة",
    type: "customer",
    accountId: "account-doc-id",  // IMPORTANT: معرف الحساب المحاسبي
    phone: "07701234567",
    email: "info@amal.com",
    address: "بغداد - الكرادة",
    balance: 150000,
    creditLimit: 500000,
    status: "active",
    lastTransactionDate: Timestamp,
    createdAt: Timestamp,
    createdBy: "user-uid",
    updatedAt: Timestamp
}
```

#### مثال الاستخدام:
```javascript
// في وحدة المبيعات
const customer = await PartiesModule.getPartyById(selectedCustomerId);

if (customer) {
    console.log('اسم العميل:', customer.name);
    console.log('الحساب المحاسبي:', customer.accountId);
    console.log('الرصيد الحالي:', customer.balance);
    console.log('حد الائتمان:', customer.creditLimit);
    
    // التحقق من تجاوز حد الائتمان
    if (customer.balance + invoiceTotal > customer.creditLimit) {
        showWarning('تحذير: تجاوز حد الائتمان!');
    }
} else {
    showError('لم يتم العثور على العميل');
}
```

---

### 2. **getActiveCustomers()**

الحصول على قائمة بجميع العملاء النشطين.

#### المعاملات (Parameters):
- لا يوجد

#### القيمة المُرجعة (Returns):
- `Promise<Array>`: مصفوفة من كائنات العملاء، مرتبة أبجدياً حسب الاسم

#### مثال الاستخدام:
```javascript
// في وحدة المبيعات - ملء قائمة منسدلة بالعملاء
async function loadCustomersDropdown() {
    const customers = await PartiesModule.getActiveCustomers();
    
    const selectElement = document.getElementById('customerSelect');
    selectElement.innerHTML = '<option value="">-- اختر العميل --</option>';
    
    customers.forEach(customer => {
        const option = document.createElement('option');
        option.value = customer.id;
        option.textContent = `${customer.code} - ${customer.name}`;
        option.dataset.accountId = customer.accountId; // IMPORTANT
        option.dataset.balance = customer.balance;
        option.dataset.creditLimit = customer.creditLimit;
        selectElement.appendChild(option);
    });
}
```

---

### 3. **getActiveSuppliers()**

الحصول على قائمة بجميع الموردين النشطين.

#### المعاملات (Parameters):
- لا يوجد

#### القيمة المُرجعة (Returns):
- `Promise<Array>`: مصفوفة من كائنات الموردين، مرتبة أبجدياً حسب الاسم

#### مثال الاستخدام:
```javascript
// في وحدة المشتريات - ملء قائمة منسدلة بالموردين
async function loadSuppliersDropdown() {
    const suppliers = await PartiesModule.getActiveSuppliers();
    
    const selectElement = document.getElementById('supplierSelect');
    selectElement.innerHTML = '<option value="">-- اختر المورد --</option>';
    
    suppliers.forEach(supplier => {
        const option = document.createElement('option');
        option.value = supplier.id;
        option.textContent = `${supplier.code} - ${supplier.name}`;
        option.dataset.accountId = supplier.accountId; // IMPORTANT
        option.dataset.balance = supplier.balance;
        selectElement.appendChild(option);
    });
}
```

---

### 4. **updatePartyBalance(partyId, amount, operation)**

تحديث رصيد عميل/مورد.

#### المعاملات (Parameters):
- `partyId` (string): معرف العميل/المورد
- `amount` (number): المبلغ
- `operation` (string): نوع العملية:
  - `'add'`: إضافة المبلغ للرصيد الحالي
  - `'subtract'`: طرح المبلغ من الرصيد الحالي
  - `'set'`: تعيين الرصيد مباشرة

#### القيمة المُرجعة (Returns):
- `Promise<number>`: الرصيد الجديد

#### Throws:
- `Error`: إذا لم يُوجد العميل/المورد

#### مثال الاستخدام:
```javascript
// عند حفظ فاتورة مبيعات
try {
    const invoiceTotal = 500000;
    const newBalance = await PartiesModule.updatePartyBalance(
        customerId,
        invoiceTotal,
        'add'
    );
    console.log('الرصيد الجديد:', newBalance);
} catch (error) {
    console.error('خطأ في تحديث الرصيد:', error);
    showError('فشل تحديث رصيد العميل');
}

// عند إلغاء فاتورة
await PartiesModule.updatePartyBalance(customerId, invoiceTotal, 'subtract');

// عند تعديل فاتورة
const oldTotal = 300000;
const newTotal = 500000;
// طرح القيمة القديمة
await PartiesModule.updatePartyBalance(customerId, oldTotal, 'subtract');
// إضافة القيمة الجديدة
await PartiesModule.updatePartyBalance(customerId, newTotal, 'add');
```

---

### 5. **getAccountName(accountId)**

الحصول على اسم الحساب المحاسبي بصيغة "الكود - الاسم".

#### المعاملات (Parameters):
- `accountId` (string): معرف الحساب المحاسبي

#### القيمة المُرجعة (Returns):
- `Promise<string>`: اسم الحساب بصيغة "1-2-1-001 - عميل شركة الأمل" أو "-" إذا لم يُوجد

#### مثال الاستخدام:
```javascript
// عرض اسم الحساب المحاسبي للعميل
const customer = await PartiesModule.getPartyById(customerId);
const accountName = await PartiesModule.getAccountName(customer.accountId);
console.log('الحساب المحاسبي للعميل:', accountName);
```

---

### 6. **loadAccountsForSelection(partyType)**

تحميل الحسابات المحاسبية المناسبة للعملاء أو الموردين.

#### المعاملات (Parameters):
- `partyType` (string): نوع الطرف ('customer' أو 'supplier')

#### القيمة المُرجعة (Returns):
- `Promise<Array>`: مصفوفة من كائنات الحسابات المحاسبية المناسبة

#### المنطق:
- للعملاء (`'customer'`): يُرجع الحسابات التي تبدأ بـ `1-2` أو `12` (المدينين)
- للموردين (`'supplier'`): يُرجع الحسابات التي تبدأ بـ `2-1` أو `21` (الدائنين)

#### مثال الاستخدام:
```javascript
// داخلي - يُستخدم في نافذة إضافة/تعديل العميل
const accounts = await PartiesModule.loadAccountsForSelection('customer');
console.log('الحسابات المتاحة:', accounts);
```

---

## 🔗 استخدام الحساب المحاسبي في القيود

### سيناريو: إنشاء فاتورة مبيعات

```javascript
/**
 * إنشاء فاتورة مبيعات وتوليد القيد المحاسبي التلقائي
 */
async function createSalesInvoice(invoiceData) {
    try {
        // 1. الحصول على بيانات العميل (بما فيها الحساب المحاسبي)
        const customer = await PartiesModule.getPartyById(invoiceData.customerId);
        
        if (!customer) {
            throw new Error('العميل غير موجود');
        }
        
        // 2. التحقق من حد الائتمان
        const newBalance = customer.balance + invoiceData.total;
        if (newBalance > customer.creditLimit) {
            const confirmed = await Swal.fire({
                title: 'تحذير',
                text: `سيتم تجاوز حد الائتمان (${customer.creditLimit})`,
                icon: 'warning',
                showCancelButton: true
            });
            if (!confirmed.isConfirmed) return;
        }
        
        // 3. حفظ الفاتورة في Firestore
        const invoiceRef = await db.collection('salesInvoices').add({
            ...invoiceData,
            customerId: customer.id,
            customerName: customer.name,
            customerAccountId: customer.accountId, // IMPORTANT
            createdAt: new Date(),
            createdBy: auth.currentUser.uid
        });
        
        // 4. تحديث رصيد العميل
        await PartiesModule.updatePartyBalance(
            customer.id,
            invoiceData.total,
            'add'
        );
        
        // 5. توليد القيد المحاسبي التلقائي
        const journalEntry = {
            date: invoiceData.date,
            reference: `فاتورة مبيعات رقم ${invoiceData.invoiceNumber}`,
            description: `فاتورة مبيعات للعميل ${customer.name}`,
            entries: [
                {
                    accountId: customer.accountId,  // من بيانات العميل!
                    accountName: await PartiesModule.getAccountName(customer.accountId),
                    debit: invoiceData.total,
                    credit: 0,
                    description: `مدين - ${customer.name}`
                },
                {
                    accountId: invoiceData.salesAccountId, // حساب المبيعات
                    accountName: 'حساب المبيعات',
                    debit: 0,
                    credit: invoiceData.total,
                    description: 'دائن - مبيعات بضاعة'
                }
            ],
            sourceType: 'salesInvoice',
            sourceId: invoiceRef.id,
            status: 'approved',
            createdAt: new Date(),
            createdBy: auth.currentUser.uid
        };
        
        // 6. حفظ القيد المحاسبي
        await db.collection('generalEntries').add(journalEntry);
        
        showSuccess('تم حفظ الفاتورة والقيد المحاسبي بنجاح');
        
    } catch (error) {
        console.error('خطأ في إنشاء فاتورة المبيعات:', error);
        showError('فشل حفظ الفاتورة');
    }
}
```

---

### سيناريو: إنشاء فاتورة مشتريات

```javascript
/**
 * إنشاء فاتورة مشتريات وتوليد القيد المحاسبي التلقائي
 */
async function createPurchaseInvoice(invoiceData) {
    try {
        // 1. الحصول على بيانات المورد (بما فيها الحساب المحاسبي)
        const supplier = await PartiesModule.getPartyById(invoiceData.supplierId);
        
        if (!supplier) {
            throw new Error('المورد غير موجود');
        }
        
        // 2. حفظ الفاتورة في Firestore
        const invoiceRef = await db.collection('purchaseInvoices').add({
            ...invoiceData,
            supplierId: supplier.id,
            supplierName: supplier.name,
            supplierAccountId: supplier.accountId, // IMPORTANT
            createdAt: new Date(),
            createdBy: auth.currentUser.uid
        });
        
        // 3. تحديث رصيد المورد
        await PartiesModule.updatePartyBalance(
            supplier.id,
            invoiceData.total,
            'add'
        );
        
        // 4. توليد القيد المحاسبي التلقائي
        const journalEntry = {
            date: invoiceData.date,
            reference: `فاتورة مشتريات رقم ${invoiceData.invoiceNumber}`,
            description: `فاتورة مشتريات من المورد ${supplier.name}`,
            entries: [
                {
                    accountId: invoiceData.purchasesAccountId, // حساب المشتريات
                    accountName: 'حساب المشتريات',
                    debit: invoiceData.total,
                    credit: 0,
                    description: 'مدين - مشتريات بضاعة'
                },
                {
                    accountId: supplier.accountId,  // من بيانات المورد!
                    accountName: await PartiesModule.getAccountName(supplier.accountId),
                    debit: 0,
                    credit: invoiceData.total,
                    description: `دائن - ${supplier.name}`
                }
            ],
            sourceType: 'purchaseInvoice',
            sourceId: invoiceRef.id,
            status: 'approved',
            createdAt: new Date(),
            createdBy: auth.currentUser.uid
        };
        
        // 5. حفظ القيد المحاسبي
        await db.collection('generalEntries').add(journalEntry);
        
        showSuccess('تم حفظ الفاتورة والقيد المحاسبي بنجاح');
        
    } catch (error) {
        console.error('خطأ في إنشاء فاتورة المشتريات:', error);
        showError('فشل حفظ الفاتورة');
    }
}
```

---

## 📊 هيكل البيانات

### Party Object (كائن العميل/المورد)

```typescript
interface Party {
    id: string;              // معرف Firestore (auto-generated)
    code: string;            // كود العميل/المورد (مثل C001, S001)
    name: string;            // الاسم
    type: 'customer' | 'supplier' | 'both';  // النوع
    accountId: string;       // معرف الحساب المحاسبي (CRITICAL)
    phone?: string;          // رقم الهاتف
    email?: string;          // البريد الإلكتروني
    address?: string;        // العنوان
    balance: number;         // الرصيد الحالي
    creditLimit: number;     // حد الائتمان
    status: 'active' | 'inactive';  // الحالة
    lastTransactionDate?: Timestamp;  // تاريخ آخر معاملة
    createdAt: Timestamp;    // تاريخ الإنشاء
    createdBy: string;       // معرف المستخدم المنشئ
    updatedAt?: Timestamp;   // تاريخ آخر تحديث
    updatedBy?: string;      // معرف المستخدم المحدث
}
```

---

## 🔄 دورة حياة الفاتورة مع الحساب المحاسبي

```
1. المستخدم ينشئ فاتورة مبيعات
        ↓
2. يختار العميل من القائمة
        ↓
3. النظام يحصل على customer.accountId
        ↓
4. يحفظ الفاتورة مع customerAccountId
        ↓
5. يحدّث رصيد العميل
        ↓
6. يولّد القيد المحاسبي التلقائي:
   - مدين: customer.accountId
   - دائن: salesAccountId
        ↓
7. يحفظ القيد في generalEntries
        ↓
✅ اكتمل - القيد المحاسبي مرتبط بالعميل!
```

---

## ⚠️ أفضل الممارسات

### 1. **دائماً تحقق من وجود العميل/المورد**
```javascript
const customer = await PartiesModule.getPartyById(customerId);
if (!customer) {
    showError('العميل غير موجود');
    return;
}
```

### 2. **تحقق من حد الائتمان**
```javascript
const newBalance = customer.balance + invoiceTotal;
if (newBalance > customer.creditLimit) {
    // اعرض تحذير أو امنع الحفظ
}
```

### 3. **تحقق من وجود الحساب المحاسبي**
```javascript
if (!customer.accountId) {
    showError('العميل غير مرتبط بحساب محاسبي');
    return;
}
```

### 4. **استخدم try-catch**
```javascript
try {
    await PartiesModule.updatePartyBalance(customerId, amount, 'add');
} catch (error) {
    console.error('خطأ في تحديث الرصيد:', error);
    showError('فشل تحديث الرصيد');
}
```

### 5. **حدّث الرصيد عند الحفظ/التعديل/الحذف**
```javascript
// عند الحفظ
await PartiesModule.updatePartyBalance(customerId, total, 'add');

// عند الحذف
await PartiesModule.updatePartyBalance(customerId, total, 'subtract');

// عند التعديل
await PartiesModule.updatePartyBalance(customerId, oldTotal, 'subtract');
await PartiesModule.updatePartyBalance(customerId, newTotal, 'add');
```

---

## 🚫 الأخطاء الشائعة

### ❌ **خطأ: عدم التحقق من accountId**
```javascript
// خطأ!
const entry = {
    accountId: customer.accountId  // قد يكون undefined
};
```

### ✅ **صحيح:**
```javascript
if (!customer.accountId) {
    throw new Error('العميل غير مرتبط بحساب محاسبي');
}
const entry = {
    accountId: customer.accountId
};
```

---

### ❌ **خطأ: نسيان تحديث الرصيد**
```javascript
// خطأ! حفظ الفاتورة بدون تحديث الرصيد
await db.collection('salesInvoices').add(invoiceData);
// النتيجة: الرصيد غير صحيح
```

### ✅ **صحيح:**
```javascript
await db.collection('salesInvoices').add(invoiceData);
await PartiesModule.updatePartyBalance(customerId, total, 'add');
```

---

### ❌ **خطأ: استخدام الحسابات غير النهائية**
```javascript
// خطأ! ربط العميل بحساب رئيسي
accountId: "1-2"  // حساب رئيسي، ليس نهائي
```

### ✅ **صحيح:**
```javascript
// ربط العميل بحساب نهائي
accountId: "1-2-1-001"  // حساب نهائي تحت المدينين
```

---

## 📝 ملاحظات للمطورين

1. **جميع الدوال async**: كل دوال الوحدة تُرجع Promises، استخدم `await`
2. **الحساب المحاسبي إلزامي**: لا يمكن حفظ عميل/مورد بدونه
3. **تحديث الرصيد يدوي**: يجب استدعاء `updatePartyBalance` يدوياً من وحدات الفواتير
4. **التاريخ التلقائي**: `lastTransactionDate` يُحدّث تلقائياً عند `updatePartyBalance`
5. **العملاء والموردين منفصلون**: استخدم الدوال المناسبة لكل نوع

---

## 🎓 مثال متكامل

```javascript
/**
 * مثال متكامل: إنشاء فاتورة مبيعات بقيد محاسبي تلقائي
 */
async function completeSalesInvoiceExample() {
    try {
        // 1. تحميل قائمة العملاء
        const customers = await PartiesModule.getActiveCustomers();
        console.log('العملاء المتاحون:', customers.length);
        
        // 2. افترض أن المستخدم اختار عميل
        const selectedCustomerId = customers[0].id;
        
        // 3. الحصول على بيانات العميل الكاملة
        const customer = await PartiesModule.getPartyById(selectedCustomerId);
        console.log('العميل المختار:', customer.name);
        console.log('الحساب المحاسبي:', customer.accountId);
        
        // 4. بيانات الفاتورة
        const invoiceData = {
            invoiceNumber: 'INV-001',
            date: new Date(),
            customerId: customer.id,
            items: [
                { productId: 'P001', quantity: 10, price: 5000, total: 50000 },
                { productId: 'P002', quantity: 5, price: 10000, total: 50000 }
            ],
            total: 100000
        };
        
        // 5. التحقق من حد الائتمان
        const newBalance = customer.balance + invoiceData.total;
        if (newBalance > customer.creditLimit) {
            console.warn('تحذير: تجاوز حد الائتمان');
        }
        
        // 6. حفظ الفاتورة
        const invoiceRef = await db.collection('salesInvoices').add({
            ...invoiceData,
            customerAccountId: customer.accountId,
            createdAt: new Date()
        });
        
        // 7. تحديث رصيد العميل
        const updatedBalance = await PartiesModule.updatePartyBalance(
            customer.id,
            invoiceData.total,
            'add'
        );
        console.log('الرصيد الجديد:', updatedBalance);
        
        // 8. توليد القيد المحاسبي
        const accountName = await PartiesModule.getAccountName(customer.accountId);
        const journalEntry = {
            date: invoiceData.date,
            reference: `فاتورة مبيعات ${invoiceData.invoiceNumber}`,
            entries: [
                {
                    accountId: customer.accountId,
                    accountName: accountName,
                    debit: invoiceData.total,
                    credit: 0
                },
                {
                    accountId: 'sales-account-id',
                    accountName: 'حساب المبيعات',
                    debit: 0,
                    credit: invoiceData.total
                }
            ],
            sourceType: 'salesInvoice',
            sourceId: invoiceRef.id,
            status: 'approved',
            createdAt: new Date()
        };
        
        await db.collection('generalEntries').add(journalEntry);
        
        console.log('✅ تم الحفظ بنجاح!');
        showSuccess('تم حفظ الفاتورة والقيد المحاسبي');
        
    } catch (error) {
        console.error('❌ خطأ:', error);
        showError('فشل العملية');
    }
}
```

---

**نهاية المرجع 📚**

للمزيد من المعلومات، راجع:
- `PARTIES-MANAGEMENT-COMPLETE.md`
- `دليل-وحدة-العملاء-والموردين.md`
- `TEST-PARTIES-MODULE.md`



