# دليل فحص الأمان قبل النشر
## Security Audit Guide - Pre-Release

**النظام:** نظام المحاسبة والمخزون  
**النسخة:** 11.1

---

## 🔒 1. فحص قواعد Firestore | Firestore Rules Audit

### 1.1 قواعد المصادقة | Authentication Rules

#### ✅ يجب التحقق من:

1. **جميع Collections تتطلب المصادقة**
   ```javascript
   // ✅ صحيح
   allow read, write: if request.auth != null;
   
   // ❌ خطأ - يسمح بالوصول بدون مصادقة
   allow read, write: if true;
   ```

2. **Collections الحساسة محمية بشكل خاص**
   - `generalEntries` - لا يمكن تحديثها (update: false)
   - `journal_entries` - لا يمكن حذفها (delete: false)
   - `inventoryMovements` - لا يمكن حذفها (delete: false)

#### 🔍 فحص يدوي:

افتح `firestore.rules` وتحقق من:

```javascript
// التحقق 1: generalEntries
match /generalEntries/{entryId} {
  allow read: if request.auth != null;      // ✅
  allow create: if request.auth != null;    // ✅
  allow update: if false;                   // ✅ صحيح - لا يمكن التحديث
  allow delete: if request.auth != null;    // ✅
}

// التحقق 2: journal_entries
match /journal_entries/{entryId} {
  allow delete: if false;                   // ✅ صحيح - لا يمكن الحذف
}

// التحقق 3: inventoryMovements
match /inventory/{movementId} {
  allow delete: if false;                   // ✅ صحيح - لا يمكن حذف الحركات
}
```

### 1.2 قواعد الصلاحيات | Permission Rules

#### ✅ يجب التحقق من:

1. **صلاحيات الأدوار محددة بشكل صحيح**
   ```javascript
   function isAdmin() {
     return isAuthenticated() && 
            (getRole() == 'super_admin' || getRole() == 'manager');
   }
   
   function isSuperAdmin() {
     return isAuthenticated() && getRole() == 'super_admin';
   }
   ```

2. **المستخدمون لا يمكنهم تعديل حسابات الآخرين**
   ```javascript
   match /users/{userId} {
     allow write: if isOwner(userId) || isAdmin();
   }
   ```

#### 🔍 فحص يدوي:

- [ ] تحقق من أن `getRole()` يستخدم collection صحيح (`USERS`)
- [ ] تحقق من أن الأدوار محددة بشكل صحيح
- [ ] تحقق من أن الصلاحيات متدرجة (super_admin > manager > accountant > sales/warehouse)

### 1.3 فحص قاعدة Fallback | Fallback Rule

#### ⚠️ تنبيه هام:

```javascript
// Fallback rule - يجب أن تكون في النهاية
match /{document=**} {
  allow read, write: if request.auth != null;
}
```

هذه القاعدة تطبق على جميع Collections غير المحددة صراحة. يجب:
- [ ] أن تكون في النهاية
- [ ] تتطلب المصادقة على الأقل
- [ ] لا تسمح بالوصول بدون مصادقة

---

## 🔐 2. فحص مصادقة المستخدم | User Authentication Audit

### 2.1 تسجيل الدخول | Login

#### ✅ يجب التحقق من:

- [ ] جميع الصفحات تتحقق من تسجيل الدخول
- [ ] إعادة توجيه لصفحة تسجيل الدخول عند عدم تسجيل الدخول
- [ ] الجلسات لا تنتهي بشكل غير متوقع

#### 🔍 اختبار يدوي:

1. افتح المتصفح في وضع التصفح الخاص
2. حاول الوصول لصفحة المبيعات مباشرة
3. يجب إعادة التوجيه لصفحة تسجيل الدخول

### 2.2 تسجيل الخروج | Logout

#### ✅ يجب التحقق من:

- [ ] زر تسجيل الخروج يعمل
- [ ] بعد تسجيل الخروج، لا يمكن الوصول للصفحات المحمية
- [ ] البيانات الحساسة لا تبقى في الذاكرة

### 2.3 استعادة كلمة المرور | Password Reset

#### ✅ يجب التحقق من:

- [ ] رابط استعادة كلمة المرور يعمل
- [ ] البريد الإلكتروني يُرسل بشكل صحيح
- [ ] يمكن تغيير كلمة المرور

---

## 🛡️ 3. فحص حماية البيانات | Data Protection Audit

### 3.1 البيانات الحساسة | Sensitive Data

#### ❌ يجب عدم وجود:

- [ ] مفاتيح API في الكود
- [ ] بيانات المستخدمين في console.log
- [ ] كلمات مرور في الكود
- [ ] معلومات قاعدة البيانات مكشوفة

#### 🔍 فحص يدوي:

ابحث في الكود عن:
```javascript
// ❌ خطأ - مفتاح API مكشوف
apiKey: "AIzaSy..."
```

#### ✅ يجب أن تكون في:

- ملفات config منفصلة
- متغيرات البيئة (environment variables)
- إعدادات Firebase منفصلة

### 3.2 حماية البيانات المالية | Financial Data Protection

#### ✅ يجب التحقق من:

- [ ] المبالغ المالية محمية من التلاعب
- [ ] القيود المحاسبية لا يمكن تعديلها بعد الإنشاء
- [ ] حركات المخزون لا يمكن حذفها
- [ ] السندات المحاسبية محمية

---

## 🔍 4. فحص XSS و Injection | XSS & Injection Audit

### 4.1 XSS (Cross-Site Scripting)

#### ✅ يجب التحقق من:

- [ ] جميع مدخلات المستخدم يتم تنظيفها (sanitize)
- [ ] لا يتم استخدام `innerHTML` مع بيانات المستخدم
- [ ] استخدام `textContent` بدلاً من `innerHTML` حيثما أمكن

#### 🔍 مثال:

```javascript
// ❌ خطأ - عرضة لـ XSS
element.innerHTML = userInput;

// ✅ صحيح
element.textContent = userInput;
// أو
element.innerHTML = escapeHtml(userInput);
```

### 4.2 SQL/NoSQL Injection

#### ✅ يجب التحقق من:

- [ ] استخدام Firestore parameterized queries
- [ ] لا يتم بناء الاستعلامات من سلسلة نصية مباشرة

#### 🔍 مثال:

```javascript
// ❌ خطأ - عرضة لـ Injection
const query = `where('name', '==', '${userInput}')`;

// ✅ صحيح
db.collection('products').where('name', '==', userInput)
```

---

## 🔐 5. فحص CORS و CSP | CORS & CSP Audit

### 5.1 CORS (Cross-Origin Resource Sharing)

#### ✅ يجب التحقق من:

- [ ] إعدادات CORS في Firebase صحيحة
- [ ] لا تسمح بجميع الأصول (`*`)
- [ ] محددة لنطاقات معينة فقط

### 5.2 CSP (Content Security Policy)

#### ✅ يجب التحقق من:

- [ ] وجود CSP headers
- [ ] السماح فقط لمصادر موثوقة
- [ ] منع inline scripts غير الضرورية

---

## 🧪 6. اختبارات اختراق بسيطة | Simple Penetration Tests

### 6.1 اختبار الصلاحيات | Permission Testing

#### اختبار يدوي:

1. **تسجيل دخول كـ accountant:**
   - [ ] محاولة الوصول لصفحة الإعدادات (يجب رفضها)
   - [ ] محاولة حذف منتج (يجب رفضها)
   - [ ] محاولة تعديل سند محاسبي قديم (يجب رفضها)

2. **تسجيل دخول كـ sales:**
   - [ ] محاولة الوصول لصفحة المحاسبة (يجب رفضها)
   - [ ] محاولة إنشاء سند محاسبي (يجب رفضها)

### 6.2 اختبار التلاعب بالبيانات | Data Manipulation Testing

#### اختبار يدوي:

1. **في المتصفح (Developer Tools):**
   - [ ] محاولة تعديل البيانات في LocalStorage
   - [ ] محاولة إرسال طلب مباشر لـ Firestore
   - [ ] يجب أن ترفضها قواعد Firestore

2. **في الكود:**
   - [ ] محاولة تعديل قيم المبالغ قبل الإرسال
   - [ ] يجب أن يتم التحقق من القيم في السيرفر أيضاً

---

## 📋 7. قائمة فحص الأمان | Security Checklist

### قبل النشر:

- [ ] جميع قواعد Firestore محدثة ومختبرة
- [ ] جميع Collections محمية
- [ ] الصلاحيات محددة بشكل صحيح
- [ ] لا توجد مفاتيح API مكشوفة
- [ ] تسجيل الدخول مطلوب في جميع الصفحات
- [ ] البيانات المالية محمية
- [ ] تم اختبار الصلاحيات مع أدوار مختلفة
- [ ] تم اختبار الحماية من XSS
- [ ] تم اختبار الحماية من Injection
- [ ] تم اختبار التلاعب بالبيانات

---

## 🛠️ 8. أدوات مساعدة | Helper Tools

### 8.1 فحص قواعد Firestore

استخدم Firebase Emulator لاختبار القواعد:

```bash
firebase emulators:start --only firestore
```

### 8.2 فحص الكود

ابحث في الكود عن:

```bash
# مفاتيح API
grep -r "AIzaSy" .

# console.log مع بيانات حساسة
grep -r "console.log.*password" .
grep -r "console.log.*token" .
```

### 8.3 فحص الشبكة

استخدم Developer Tools > Network:
- [ ] تحقق من أن الطلبات تحتوي على token المصادقة
- [ ] تحقق من عدم إرسال بيانات حساسة في URLs

---

## ⚠️ 9. مشاكل أمنية شائعة | Common Security Issues

### 9.1 مشاكل شائعة يجب تجنبها:

1. **قواعد Firestore مفتوحة جداً**
   ```javascript
   // ❌ خطأ
   allow read, write: if true;
   ```

2. **عدم التحقق من الصلاحيات في الكود**
   ```javascript
   // ❌ خطأ - يعتمد فقط على القواعد
   // يجب التحقق في الكود أيضاً
   ```

3. **مفاتيح API مكشوفة**
   ```javascript
   // ❌ خطأ
   const apiKey = "AIzaSy...";
   ```

4. **بيانات حساسة في console.log**
   ```javascript
   // ❌ خطأ
   console.log('User data:', userData);
   ```

---

## 📝 10. تقرير فحص الأمان | Security Audit Report

**تاريخ الفحص:** ___________

**الفحص بواسطة:** ___________

### النتائج:

#### ✅ نقاط القوة:
1. 
2. 
3. 

#### ❌ المشاكل المكتشفة:
1. 
2. 
3. 

#### ⚠️ التحسينات المقترحة:
1. 
2. 
3. 

### التوصية النهائية:

☐ **جاهز للنشر** - الأمان كافٍ  
☐ **يحتاج إصلاحات** - توجد مشاكل أمنية  
☐ **غير جاهز** - مشاكل أمنية حرجة

---

## ✍️ التوقيع | Signature

**مدقق الأمان:** _________________ **التاريخ:** ___________

**المراجع:** _________________ **التاريخ:** ___________







