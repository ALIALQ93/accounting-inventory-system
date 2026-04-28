# ملخص عمليات المشتريات
## Purchases Operations Summary

**التاريخ:** 2024  
**الوحدة:** `js/modules/purchases.js`

---

## 📋 نظرة عامة

هذا المستند يشرح كيفية التعامل مع فواتير المشتريات عند:
1. **إضافة فاتورة جديدة**
2. **تعديل فاتورة موجودة**
3. **حذف فاتورة**

---

## 1️⃣ إضافة فاتورة جديدة

### العملية: `savePurchase()` - حالة جديدة

#### الخطوات:

1. **جمع البيانات من النموذج**
   ```javascript
   const formData = this.collectPurchaseData();
   ```

2. **التحقق من صحة البيانات**
   ```javascript
   if (!this.validatePurchaseForm(formData)) {
       return;
   }
   ```

3. **حفظ الفاتورة في قاعدة البيانات**
   ```javascript
   const purchaseResult = await Collections.addPurchase(formData);
   const purchaseId = extractIdFromResult(purchaseResult);
   ```

4. **تحديث المخزون** ✅
   ```javascript
   await this.updateInventory(formData);
   ```
   - يضيف المنتجات المشتراة إلى المخزون
   - ينشئ سجلات `inventoryMovements` لكل منتج

5. **توليد القيد العام** ✅
   ```javascript
   generalEntryId = await this.generateGeneralEntry(formData);
   ```
   - ينشئ قيد محاسبي تلقائياً
   - المدين: حساب المشتريات/المخزون
   - الدائن: حساب المورد (آجل) أو النقدية (نقدي)

6. **تحديث رصيد المورد** ✅
   ```javascript
   await this.updateSupplierBalance(formData, 'add');
   ```
   - يزيد رصيد المورد في حالة الدفع الآجل

7. **إعادة تحميل البيانات**
   ```javascript
   this.loadPurchases();
   this.loadSuppliers();
   this.updateDashboard();
   ```

---

## 2️⃣ تعديل فاتورة موجودة

### العملية: `savePurchase()` - حالة التعديل

#### الخطوات:

1. **جمع البيانات الجديدة من النموذج**
   ```javascript
   const formData = this.collectPurchaseData();
   ```

2. **التحقق من صحة البيانات**
   ```javascript
   if (!this.validatePurchaseForm(formData)) {
       return;
   }
   ```

3. **تحديث المخزون** ✅ (عكس القديم + تطبيق الجديد)
   ```javascript
   await this.updateInventoryOnEdit(this.editingPurchase, formData);
   ```
   - **يطرح الكميات القديمة** من المخزون
   - **يضيف الكميات الجديدة** إلى المخزون
   - **يحدث سجلات `inventoryMovements`**

4. **تحديث الفاتورة في قاعدة البيانات**
   ```javascript
   await Collections.updatePurchase(this.editingPurchase.id, formData);
   ```

5. **تحديث رصيد المورد** ✅ (عكس القديم + تطبيق الجديد)
   ```javascript
   await this.updateSupplierBalanceOnEdit(this.editingPurchase, formData);
   ```
   - **يطرح المبلغ القديم** من رصيد المورد
   - **يضيف المبلغ الجديد** إلى رصيد المورد

6. **تحديث أو إعادة إنشاء القيد العام** ✅
   ```javascript
   await this.updateOrCreateGeneralEntry(formData);
   ```
   - يحذف القيد القديم (إن وجد)
   - ينشئ قيد جديد بالبيانات المحدثة

7. **إعادة تحميل البيانات**
   ```javascript
   this.loadPurchases();
   this.loadSuppliers();
   this.updateDashboard();
   ```

---

## 3️⃣ حذف فاتورة

### العملية: `deletePurchase(purchaseId)`

#### الخطوات:

1. **طلب التأكيد من المستخدم**
   ```javascript
   const result = await Swal.fire({
       title: 'تأكيد الحذف',
       text: 'هل أنت متأكد من حذف هذه الفاتورة؟',
       icon: 'warning',
       showCancelButton: true
   });
   ```

2. **عكس تحديثات المخزون** ✅
   ```javascript
   await this.reverseInventoryChanges(purchase);
   ```
   - **يطرح الكميات المشتراة** من المخزون
   - **يحذف سجلات `inventoryMovements`** المرتبطة بالفاتورة

3. **حذف القيد العام** ✅
   ```javascript
   await this.deleteGeneralEntryBySourceId(purchaseId);
   ```
   - يبحث عن القيد العام المرتبط بالفاتورة
   - يحذفه من قاعدة البيانات

4. **عكس رصيد المورد** ✅
   ```javascript
   await this.updateSupplierBalance(purchase, 'subtract');
   ```
   - **يطرح المبلغ** من رصيد المورد

5. **حذف الفاتورة من قاعدة البيانات**
   ```javascript
   await Collections.deletePurchase(purchaseId);
   ```

6. **إعادة تحميل البيانات**
   ```javascript
   this.loadPurchases();
   this.loadSuppliers();
   this.updateDashboard();
   ```

---

## 🔄 وظائف المخزون

### `updateInventory(purchaseData)` - للفاتورة الجديدة

**الوظيفة:**
- إضافة المنتجات المشتراة إلى المخزون
- إنشاء سجلات `inventoryMovements` لكل منتج

**الخطوات:**
1. لكل منتج في الفاتورة:
   - البحث عن المنتج في المخزون
   - إضافة الكمية المشتراة
   - تحديث `lastPurchaseDate` و `lastPurchasePrice`
2. إنشاء سجل `inventoryMovement`:
   - نوع: `purchase`
   - الكمية: إيجابية (إضافة)
   - المصدر: `purchaseId`

---

### `updateInventoryOnEdit(oldPurchaseData, newPurchaseData)` - للتعديل

**الوظيفة:**
- عكس التغييرات القديمة
- تطبيق التغييرات الجديدة

**الخطوات:**
1. **عكس التغييرات القديمة:**
   - طرح الكميات القديمة من المخزون
   - حذف سجلات `inventoryMovements` القديمة

2. **تطبيق التغييرات الجديدة:**
   - إضافة الكميات الجديدة إلى المخزون
   - إنشاء سجلات `inventoryMovements` جديدة

---

### `reverseInventoryChanges(purchase)` - للحذف

**الوظيفة:**
- عكس جميع التغييرات التي تمت على المخزون

**الخطوات:**
1. لكل منتج في الفاتورة:
   - طرح الكمية المشتراة من المخزون
2. حذف جميع سجلات `inventoryMovements` المرتبطة بالفاتورة

---

## 📊 وظائف القيود المحاسبية

### `generateGeneralEntry(purchaseData)`

**الوظيفة:**
- توليد قيد محاسبي تلقائياً للفاتورة

**المنطق:**

#### حالة الدفع النقدي:
- **المدين:** حساب المشتريات/المخزون (قيمة المنتجات)
- **الدائن:** حساب النقدية/الصندوق (قيمة المنتجات)

#### حالة الدفع الآجل:
- **المدين:** حساب المشتريات/المخزون (قيمة المنتجات)
- **الدائن:** حساب المورد (قيمة المنتجات)

#### حالة الدفعة الجزئية:
- **المدين:** حساب المشتريات/المخزون (القيمة الكاملة)
- **الدائن:** حساب المورد (القيمة الكاملة)
- **المدين:** حساب الدفع (المبلغ المدفوع)
- **الدائن:** حساب المورد (المبلغ المدفوع) - لسداد جزء من الدين

#### الخصومات والإضافات:
- لكل خصم/إضافة في `discountAdditionRows`:
  - **الخصم:** دائن حساب الخصم، مدين الحساب المقابل
  - **الإضافة:** مدين حساب الإضافة، دائن الحساب المقابل

**التحقق:**
- ✅ المدين = الدائن (متوازن)
- ✅ كل قيد له حساب صحيح
- ✅ لا يوجد قيد بدون مدين أو دائن

---

### `updateOrCreateGeneralEntry(purchaseData)` - للتعديل

**الوظيفة:**
- تحديث أو إعادة إنشاء القيد العام

**الخطوات:**
1. البحث عن القيد القديم المرتبط بالفاتورة
2. حذف القيد القديم (إن وجد)
3. إنشاء قيد جديد بالبيانات المحدثة

---

### `deleteGeneralEntryBySourceId(sourceId)` - للحذف

**الوظيفة:**
- حذف القيد العام المرتبط بالفاتورة

**الخطوات:**
1. البحث عن القيد باستخدام `sourceId` و `type='purchase'`
2. حذف القيد من قاعدة البيانات

---

## 💰 وظائف رصيد المورد

### `updateSupplierBalance(purchaseData, operation)` - للإضافة/الحذف

**الوظيفة:**
- تحديث رصيد المورد في `parties` collection

**المنطق:**
- **`operation = 'add'`:** يزيد الرصيد (للإضافة)
- **`operation = 'subtract'`:** يقلل الرصيد (للحذف)

**الخطوات:**
1. الحصول على بيانات المورد
2. حساب المبلغ (حسب طريقة الدفع):
   - **نقدي:** لا يؤثر على الرصيد
   - **آجل:** يؤثر على الرصيد
3. تحديث `balance` في `parties` collection

---

### `updateSupplierBalanceOnEdit(oldPurchaseData, newPurchaseData)` - للتعديل

**الوظيفة:**
- عكس الرصيد القديم وتطبيق الرصيد الجديد

**الخطوات:**
1. **عكس الرصيد القديم:**
   - طرح المبلغ القديم من رصيد المورد
2. **تطبيق الرصيد الجديد:**
   - إضافة المبلغ الجديد إلى رصيد المورد

---

## ✅ الخلاصة

### عند إضافة فاتورة:
1. ✅ حفظ الفاتورة
2. ✅ تحديث المخزون (إضافة)
3. ✅ توليد القيد العام
4. ✅ تحديث رصيد المورد (إن كان آجل)

### عند تعديل فاتورة:
1. ✅ عكس التغييرات القديمة (مخزون + رصيد)
2. ✅ تحديث الفاتورة
3. ✅ تطبيق التغييرات الجديدة (مخزون + رصيد)
4. ✅ تحديث القيد العام

### عند حذف فاتورة:
1. ✅ عكس تحديثات المخزون
2. ✅ حذف القيد العام
3. ✅ عكس رصيد المورد
4. ✅ حذف الفاتورة

---

**جميع العمليات متكاملة وتعمل بشكل صحيح!** ✅







