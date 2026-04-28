# 📚 دليل خصائص حسابات العملاء والموردين

## 🔍 كيفية تحديد خصائص الحساب للعميل أو المورد

---

## 1️⃣ 📋 البيانات الأساسية

### في جدول `parties` (العملاء والموردين):
```javascript
{
    id: "party_id",
    name: "اسم العميل/المورد",
    code: "كود العميل/المورد",
    type: "customer" | "supplier", // ✅ يحدد النوع
    accountId: "parent_account_id", // الحساب الرئيسي (الأب)
    subAccountId: "sub_account_id", // ✅ الحساب الفرعي المرتبط
    // ... بيانات أخرى
}
```

### في جدول `chartOfAccounts` (شجرة الحسابات):
```javascript
{
    id: "sub_account_id",
    code: "1-2-1.001", // كود الحساب (كود الأب + . + كود العميل/المورد)
    name: "اسم العميل/المورد",
    parentId: "parent_account_id", // ✅ رابط للحساب الرئيسي
    
    // ✅ الخصائص المحددة حسب نوع الطرف:
    isCustomerAccount: true/false,  // ✅ إذا كان مرتبطاً بعميل
    isSupplierAccount: true/false,  // ✅ إذا كان مرتبطاً بمورد
    
    // ✅ خصائص الحماية:
    isSystemProtected: true,        // محمي من التعديل/الحذف
    allowTypeChange: false,         // لا يمكن تحويله إلى حساب رئيسي
    canHaveChildren: false,         // لا يمكن إضافة حسابات فرعية تحته
    isLeafAccount: true,            // حساب نهائي
    
    // ✅ بيانات إضافية:
    type: parentAccount.type,       // نفس نوع الحساب الرئيسي
    category: parentAccount.category,
    description: "حساب فرعي لـ [الاسم] (عميل/مورد) - حساب نهائي محمي"
}
```

---

## 2️⃣ 🔄 آلية الربط

### أ) عند إنشاء عميل/مورد جديد:

```javascript
// 1. تحديد نوع الطرف
partyType = "customer" | "supplier"  // ✅ يتم تحديده من الفورم

// 2. اختيار الحساب الرئيسي
parentAccountId = data.accountId     // من القائمة المنسدلة

// 3. إنشاء الحساب الفرعي
const subAccountId = await createSubAccount(
    parentAccountId,  // الحساب الرئيسي
    partyName,        // اسم العميل/المورد
    partyCode,        // كود العميل/المورد
    partyType         // ✅ النوع (customer/supplier)
);

// 4. ربط الحساب بالعميل/المورد
await db.collection('parties').doc(partyId).update({
    subAccountId: subAccountId  // ✅ الربط يتم هنا
});
```

### ب) في دالة `createSubAccount()`:

```javascript
async createSubAccount(parentAccountId, partyName, partyCode, partyType) {
    // ✅ تحديد الخصائص بناءً على النوع:
    const subAccountData = {
        // ... البيانات الأساسية ...
        
        // ✅ التمييز بين العملاء والموردين:
        isCustomerAccount: partyType === 'customer',  // true للعملاء
        isSupplierAccount: partyType === 'supplier',  // true للموردين
        
        // ✅ خصائص الحماية:
        isSystemProtected: true,        // محمي دائماً
        allowTypeChange: false,         // لا يمكن تغيير النوع
        canHaveChildren: false,         // لا يمكن إضافة حسابات فرعية
        isLeafAccount: true,            // حساب نهائي فقط
        
        // ✅ الوصف:
        description: `حساب فرعي لـ ${partyName} (${partyType === 'customer' ? 'عميل' : 'مورد'}) - حساب نهائي محمي`
    };
    
    // حفظ في قاعدة البيانات
    const docRef = await db.collection('chartOfAccounts').add(subAccountData);
    return docRef.id;  // ✅ يتم إرجاع ID الحساب الفرعي
}
```

---

## 3️⃣ 🎯 الخصائص الرئيسية المستخدمة

### ✅ `isCustomerAccount`
- **الوظيفة**: يحدد أن الحساب مرتبط بعميل
- **القيمة**: `true` للعملاء، `false` أو غير موجود للموردين
- **الاستخدام**: 
  - عرض أيقونة 👔 في الشجرة
  - منع التعديل/الحذف من شجرة الحسابات
  - رسائل الخطأ المخصصة

### ✅ `isSupplierAccount`
- **الوظيفة**: يحدد أن الحساب مرتبط بمورد
- **القيمة**: `true` للموردين، `false` أو غير موجود للعملاء
- **الاستخدام**:
  - عرض أيقونة 🚚 في الشجرة
  - منع التعديل/الحذف من شجرة الحسابات
  - رسائل الخطأ المخصصة

### ✅ `isSystemProtected`
- **الوظيفة**: يحمي الحساب من التعديل/الحذف
- **القيمة**: دائماً `true` للحسابات المرتبطة بالعملاء/الموردين
- **الاستخدام**:
  - منع التعديل من شجرة الحسابات
  - منع الحذف من شجرة الحسابات
  - منع تحويله إلى حساب رئيسي

### ✅ `subAccountId` (في جدول `parties`)
- **الوظيفة**: الربط بين العميل/المورد وحسابه الفرعي
- **القيمة**: ID الحساب الفرعي في `chartOfAccounts`
- **الاستخدام**:
  - الربط بين العميل/المورد وحسابه
  - حذف الحساب عند حذف العميل/المورد

---

## 4️⃣ 🔒 آلية الحماية

### عند محاولة التعديل:
```javascript
if (account.isCustomerAccount === true || 
    account.isSupplierAccount === true) {
    // ✅ منع التعديل
    showError('🚫 لا يمكن تعديل حساب عميل/مورد من شجرة الحسابات');
    return;
}
```

### عند محاولة الحذف:
```javascript
if (account.isCustomerAccount === true || 
    account.isSupplierAccount === true) {
    // ✅ منع الحذف
    showError('🚫 يجب حذف العميل/المورد أولاً من وحدة العملاء والموردين');
    return;
}
```

### عند حذف العميل/المورد:
```javascript
async deleteParty(partyId) {
    const party = await db.collection('parties').doc(partyId).get();
    
    if (party.data().subAccountId) {
        // ✅ حذف الحساب الفرعي تلقائياً
        await deleteLinkedAccount(party.data().subAccountId);
    }
    
    // ✅ حذف العميل/المورد
    await db.collection('parties').doc(partyId).delete();
}
```

---

## 5️⃣ 📊 أمثلة عملية

### مثال 1: إنشاء عميل جديد
```javascript
// بيانات العميل:
{
    name: "شركة الأمل للتجارة",
    code: "C001",
    type: "customer",           // ✅ تحديد النوع
    accountId: "parent_123"     // الحساب الرئيسي
}

// النتيجة في chartOfAccounts:
{
    id: "sub_account_456",
    code: "1-2-1.C001",
    name: "شركة الأمل للتجارة",
    parentId: "parent_123",
    
    // ✅ الخصائص المحددة:
    isCustomerAccount: true,     // ✅ لأن type === "customer"
    isSupplierAccount: false,
    isSystemProtected: true,
    // ...
}

// النتيجة في parties:
{
    id: "party_789",
    name: "شركة الأمل للتجارة",
    subAccountId: "sub_account_456"  // ✅ الربط
}
```

### مثال 2: إنشاء مورد جديد
```javascript
// بيانات المورد:
{
    name: "مورد المواد الخام",
    code: "S001",
    type: "supplier",           // ✅ تحديد النوع
    accountId: "parent_789"     // الحساب الرئيسي
}

// النتيجة في chartOfAccounts:
{
    id: "sub_account_012",
    code: "2-1-1.S001",
    name: "مورد المواد الخام",
    parentId: "parent_789",
    
    // ✅ الخصائص المحددة:
    isCustomerAccount: false,
    isSupplierAccount: true,     // ✅ لأن type === "supplier"
    isSystemProtected: true,
    // ...
}
```

---

## 6️⃣ ✅ الخلاصة

| الخاصية | الموقع | القيمة | الوظيفة |
|---------|---------|---------|----------|
| `type` | `parties` | `"customer"` أو `"supplier"` | تحديد نوع الطرف |
| `isCustomerAccount` | `chartOfAccounts` | `true/false` | تحديد أن الحساب مرتبط بعميل |
| `isSupplierAccount` | `chartOfAccounts` | `true/false` | تحديد أن الحساب مرتبط بمورد |
| `subAccountId` | `parties` | `account_id` | الربط بين الطرف وحسابه |
| `parentId` | `chartOfAccounts` | `parent_account_id` | الربط بالحساب الرئيسي |
| `isSystemProtected` | `chartOfAccounts` | `true` | حماية الحساب من التعديل |

---

**💡 ملاحظة مهمة**: 
- ✅ الخصائص يتم تحديدها تلقائياً عند إنشاء الحساب الفرعي
- ✅ يتم تحديد النوع من `partyType` (customer/supplier)
- ✅ الربط يتم عبر `subAccountId` في جدول `parties`
- ✅ الحسابات محمية من التعديل/الحذف من شجرة الحسابات

