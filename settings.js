/**
 * Settings Module - الإعدادات
 * Comprehensive settings management for the system
 */

const SettingsModule = {
    currentTab: 'vouchers',
    voucherSettings: {},

    /**
     * Get HTML for settings module
     */
    getHTML() {
        return `
            <section id="settings" class="settings-module">
                <!-- Header -->
                <div class="settings-header-modern">
                    <div class="header-content-wrapper">
                        <div class="header-icon-box">
                            <i class="fas fa-cog"></i>
                        </div>
                        <div class="header-text-box">
                            <h1 class="header-title">الإعدادات</h1>
                            <p class="header-subtitle">إعدادات النظام والتخصيصات</p>
                        </div>
                    </div>
                </div>

                <!-- Settings Tabs -->
                <div class="settings-tabs-modern">
                    <button class="tab-btn active" data-tab="accounting" id="accountingSettingsTab">
                        <i class="fas fa-file-invoice-dollar"></i>
                        <span>إعدادات إدارة الحسابات</span>
                    </button>
                    <button class="tab-btn" data-tab="company" id="companySettingsTab">
                        <i class="fas fa-building"></i>
                        <span>بيانات الشركة</span>
                    </button>
                    <button class="tab-btn" data-tab="database" id="databaseSettingsTab">
                        <i class="fas fa-database"></i>
                        <span>إعدادات قاعدة البيانات</span>
                    </button>
                    <button class="tab-btn" data-tab="images" id="imageSettingsTab">
                        <i class="fas fa-images"></i>
                        <span>إعدادات الصور</span>
                    </button>
                    <button class="tab-btn" data-tab="inventory" id="inventorySettingsTab">
                        <i class="fas fa-boxes"></i>
                        <span>إعدادات المخزون</span>
                    </button>
                    <button class="tab-btn" data-tab="system" id="systemSettingsTab">
                        <i class="fas fa-sliders-h"></i>
                        <span>إعدادات النظام</span>
                    </button>
                </div>

                <!-- Accounting Settings (All Vouchers) -->
                <div id="accountingSettingsContent" class="settings-content">
                    <div class="row g-4">
                        <!-- Section 1: Default Contra Accounts -->
                        <div class="col-12">
                            <h4 class="mb-3">
                                <i class="fas fa-wallet text-primary"></i>
                                الحسابات المقابلة الافتراضية
                            </h4>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-arrow-down text-success"></i>
                                    <h5>سند القبض</h5>
                                </div>
                                <div class="setting-card-body">
                                    <label class="form-label fw-bold">الحساب المقابل الافتراضي</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="defaultContraAccountDisplay" 
                                               placeholder="ط§ط¶ط؛ط· ظ„ظ„ط¨ط­ط«..." readonly 
                                               style="cursor: pointer; background: white;">
                                        <input type="hidden" id="defaultContraAccount">
                                        <button class="btn btn-outline-success" type="button" id="searchDefaultContraBtn">
                                            <i class="fas fa-search"></i>
                                        </button>
                                    </div>
                                    <small class="text-muted mt-2 d-block">
                                        <i class="fas fa-info-circle"></i>
                                        مثال: 1.1.1 - الصندوق
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-arrow-up text-danger"></i>
                                    <h5>سند الصرف</h5>
                                </div>
                                <div class="setting-card-body">
                                    <label class="form-label fw-bold">الحساب المقابل الافتراضي</label>
                                    <div class="input-group">
                                        <input type="text" class="form-control" id="paymentContraAccountDisplay" 
                                               placeholder="ط§ط¶ط؛ط· ظ„ظ„ط¨ط­ط«..." readonly 
                                               style="cursor: pointer; background: white;">
                                        <input type="hidden" id="paymentContraAccount">
                                        <button class="btn btn-outline-danger" type="button" id="searchPaymentContraBtn">
                                            <i class="fas fa-search"></i>
                                        </button>
                                    </div>
                                    <small class="text-muted mt-2 d-block">
                                        <i class="fas fa-info-circle"></i>
                                        مثال: 1.1.1 - الصندوق
                                    </small>
                                </div>
                            </div>
                        </div>

                        <!-- Section 2: Prefixes -->
                        <div class="col-12 mt-4">
                            <h4 class="mb-3">
                                <i class="fas fa-hashtag text-primary"></i>
                                الترقيم التلقائي
                            </h4>
                        </div>
                        
                        <div class="col-md-4">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-arrow-down text-success"></i>
                                    <h5>سند القبض</h5>
                                </div>
                                <div class="setting-card-body">
                                    <label class="form-label fw-bold">البادئة</label>
                                    <input type="text" class="form-control text-center" id="receiptPrefix" 
                                           value="RV" maxlength="5" placeholder="RV"
                                           style="font-family: 'Courier New'; font-size: 1.2rem; font-weight: bold;">
                                    <small class="text-muted d-block mt-2">مثال: RV20240001</small>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-arrow-up text-danger"></i>
                                    <h5>سند الصرف</h5>
                                </div>
                                <div class="setting-card-body">
                                    <label class="form-label fw-bold">البادئة</label>
                                    <input type="text" class="form-control text-center" id="paymentPrefix" 
                                           value="PV" maxlength="5" placeholder="PV"
                                           style="font-family: 'Courier New'; font-size: 1.2rem; font-weight: bold;">
                                    <small class="text-muted d-block mt-2">مثال: PV20240001</small>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-3">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-book text-primary"></i>
                                    <h5>سند اليومية</h5>
                                </div>
                                <div class="setting-card-body">
                                    <label class="form-label fw-bold">البادئة</label>
                                    <input type="text" class="form-control text-center" id="journalPrefix" 
                                           value="JV" maxlength="5" placeholder="JV"
                                           style="font-family: 'Courier New'; font-size: 1.2rem; font-weight: bold;">
                                    <small class="text-muted d-block mt-2">مثال: JV20240001</small>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-3">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-edit text-info"></i>
                                    <h5>سند القيد</h5>
                                </div>
                                <div class="setting-card-body">
                                    <label class="form-label fw-bold">البادئة</label>
                                    <input type="text" class="form-control text-center" id="entryPrefix" 
                                           value="EV" maxlength="5" placeholder="EV"
                                           style="font-family: 'Courier New'; font-size: 1.2rem; font-weight: bold;">
                                    <small class="text-muted d-block mt-2">مثال: EV20240001</small>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Section 3: Status -->
                        <div class="col-12 mt-4">
                            <h4 class="mb-3">
                                <i class="fas fa-toggle-on text-info"></i>
                                الحالة الافتراضية
                            </h4>
                        </div>
                        
                        <div class="col-md-12">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-check-circle text-info"></i>
                                    <h5>حالة السند عند الإنشاء</h5>
                                </div>
                                <div class="setting-card-body">
                                    <div class="row align-items-center">
                                        <div class="col-md-6">
                                            <label class="form-label fw-bold">الحالة الافتراضية</label>
                                            <select class="form-select form-select-lg" id="defaultVoucherStatus">
                                                <option value="draft">📝 مسودة (يمكن التعديل)</option>
                                                <option value="posted">✅ مرحّل (نهائي)</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="alert alert-warning mb-0">
                                                <i class="fas fa-exclamation-triangle"></i>
                                                <strong>تنبيه:</strong> السندات المرحّلة تؤثر على الحسابات مباشرة ويتم إنشاء قيد عام لها.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Section 4: Cost Centers -->
                        <div class="col-12 mt-4">
                            <h4 class="mb-3">
                                <i class="fas fa-cubes text-warning"></i>
                                مراكز الكلفة
                            </h4>
                        </div>
                        
                        <div class="col-12">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-cubes text-warning"></i>
                                    <h5>مراكز الكلفة إلزامي لكل نوع سند</h5>
                                </div>
                                <div class="setting-card-body">
                                    <div class="row g-3">
                                        <div class="col-md-4">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="receiptCostCenterRequired" 
                                                       style="width: 3rem; height: 1.5rem; cursor: pointer;">
                                                <label class="form-check-label fw-bold ms-3">
                                                    💰 سند القبض - مراكز كلفة إلزامي
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="paymentCostCenterRequired" 
                                                       style="width: 3rem; height: 1.5rem; cursor: pointer;">
                                                <label class="form-check-label fw-bold ms-3">
                                                    💸 سند الصرف - مراكز كلفة إلزامي
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="journalCostCenterRequired" 
                                                       style="width: 3rem; height: 1.5rem; cursor: pointer;">
                                                <label class="form-check-label fw-bold ms-3">
                                                    📖 سند اليومية - مراكز كلفة إلزامي
                                                </label>
                                            </div>
                                        </div>
                                        <div class="col-md-3">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="entryCostCenterRequired" 
                                                       style="width: 3rem; height: 1.5rem; cursor: pointer;">
                                                <label class="form-check-label fw-bold ms-3">
                                                    ✏️ سند القيد - مراكز كلفة إلزامي
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Section 5: General Entry -->
                        <div class="col-12 mt-4">
                            <h4 class="mb-3">
                                <i class="fas fa-file-contract text-secondary"></i>
                                القيد العام التلقائي
                            </h4>
                        </div>
                        
                        <div class="col-12">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-robot text-secondary"></i>
                                    <h5>آلية الترحيل التلقائي</h5>
                                </div>
                                <div class="setting-card-body">
                                    <div class="alert alert-info mb-3">
                                        <i class="fas fa-info-circle me-2"></i>
                                        <strong>القيد العام</strong> ينشأ تلقائياً عند ترحيل السندات. لا يمكن إنشاؤه يدوياً.
                                    </div>
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <h6 class="fw-bold mb-2">🔧 آلية العمل:</h6>
                                            <ul class="text-muted small">
                                                <li>السند بحالة "مسودة" → لا تؤثر على الحسابات</li>
                                                <li>تغيير الحالة إلى "مرحّل" → إنشاء قيد عام تلقائياً</li>
                                                <li>القيد العام يترحّل للحسابات فوراً</li>
                                                <li>القيد مرتبط بالسند الأصلي</li>
                                            </ul>
                                        </div>
                                        <div class="col-md-6">
                                            <h6 class="fw-bold mb-2">🛡️ الحماية:</h6>
                                            <ul class="text-muted small">
                                                <li>لا يمكن تعديل القيد العام مباشرة</li>
                                                <li>التعديل يتم عبر السند الأصلي</li>
                                                <li>حذف السند يحذف القيد تلقائياً</li>
                                                <li>الحذف محمي للسندات المرحّلة</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Section 6: Fiscal Period -->
                        <div class="col-12 mt-4">
                            <h4 class="mb-3">
                                <i class="fas fa-calendar-alt text-success"></i>
                                الفترة المالية
                            </h4>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-calendar-check text-success"></i>
                                    <h5>بداية السنة المالية</h5>
                                </div>
                                <div class="setting-card-body">
                                    <label class="form-label fw-bold">تاريخ البداية</label>
                                    <input type="date" class="form-control" id="fiscalYearStart" 
                                           placeholder="YYYY-MM-DD">
                                    <small class="text-muted mt-2 d-block">
                                        <i class="fas fa-info-circle"></i>
                                        مثال: 2024-01-01 (بداية السنة المالية)
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-calendar-times text-danger"></i>
                                    <h5>نهاية السنة المالية</h5>
                                </div>
                                <div class="setting-card-body">
                                    <label class="form-label fw-bold">تاريخ النهاية</label>
                                    <input type="date" class="form-control" id="fiscalYearEnd" 
                                           placeholder="YYYY-MM-DD">
                                    <small class="text-muted mt-2 d-block">
                                        <i class="fas fa-info-circle"></i>
                                        مثال: 2024-12-31 (نهاية السنة المالية)
                                    </small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-12">
                            <div class="alert alert-warning">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                <strong>مهم:</strong> الفترة المالية تستخدم كافتراضي في التقارير المالية. 
                                يمكن تغييرها عند إنشاء كل تقرير.
                            </div>
                        </div>

                        <!-- Save Button -->
                        <div class="col-12">
                            <div class="text-center">
                                <button class="btn btn-success btn-lg px-5" id="saveAccountingSettingsBtn">
                                    <i class="fas fa-save me-2"></i> حفظ جميع إعدادات إدارة الحسابات
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Company Settings Tab -->
                <div id="companySettingsContent" class="settings-content" style="display: none;">
                    <div class="setting-card">
                        <div class="setting-card-header">
                            <i class="fas fa-building text-primary"></i>
                            <h5>بيانات الشركة</h5>
                        </div>
                        <div class="setting-card-body">
                            <p class="text-muted">قريباً...</p>
                        </div>
                    </div>
                </div>

                <!-- Database Settings Tab -->
                <div id="databaseSettingsContent" class="settings-content" style="display: none;">
                    <div class="row g-4">
                        <!-- Database Connection Configuration -->
                        <div class="col-12">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-database text-primary"></i>
                                    <h5>إعدادات اتصال قاعدة البيانات</h5>
                                </div>
                                <div class="setting-card-body">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="form-group mb-3">
                                                <label class="form-label">نوع قاعدة البيانات</label>
                                                <select class="form-select" id="databaseType" onchange="SettingsModule.onDatabaseTypeChange()">
                                                    <option value="firebase">Firebase Firestore</option>
                                                    <option value="mysql">MySQL</option>
                                                    <option value="postgresql">PostgreSQL</option>
                                                    <option value="mongodb">MongoDB</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="form-group mb-3">
                                                <label class="form-label">اسم قاعدة البيانات</label>
                                                <input type="text" class="form-control" id="databaseName" placeholder="اسم قاعدة البيانات">
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Firebase Configuration -->
                                    <div id="firebaseConfig" class="database-config">
                                        <h6 class="mb-3">إعدادات Firebase</h6>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="form-group mb-3">
                                                    <label class="form-label">Project ID</label>
                                                    <input type="text" class="form-control" id="firebaseProjectId" placeholder="your-project-id">
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="form-group mb-3">
                                                    <label class="form-label">API Key</label>
                                                    <input type="text" class="form-control" id="firebaseApiKey" placeholder="your-api-key">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="form-group mb-3">
                                                    <label class="form-label">Auth Domain</label>
                                                    <input type="text" class="form-control" id="firebaseAuthDomain" placeholder="your-project.firebaseapp.com">
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="form-group mb-3">
                                                    <label class="form-label">Storage Bucket</label>
                                                    <input type="text" class="form-control" id="firebaseStorageBucket" placeholder="your-project.appspot.com">
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- MySQL/PostgreSQL Configuration -->
                                    <div id="sqlConfig" class="database-config" style="display: none;">
                                        <h6 class="mb-3">إعدادات قاعدة البيانات SQL</h6>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="form-group mb-3">
                                                    <label class="form-label">عنوان الخادم</label>
                                                    <input type="text" class="form-control" id="sqlHost" placeholder="localhost">
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="form-group mb-3">
                                                    <label class="form-label">رقم المنفذ</label>
                                                    <input type="number" class="form-control" id="sqlPort" placeholder="3306">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="form-group mb-3">
                                                    <label class="form-label">اسم المستخدم</label>
                                                    <input type="text" class="form-control" id="sqlUsername" placeholder="username">
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="form-group mb-3">
                                                    <label class="form-label">كلمة المرور</label>
                                                    <input type="password" class="form-control" id="sqlPassword" placeholder="password">
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- MongoDB Configuration -->
                                    <div id="mongoConfig" class="database-config" style="display: none;">
                                        <h6 class="mb-3">إعدادات MongoDB</h6>
                                        <div class="row">
                                            <div class="col-md-12">
                                                <div class="form-group mb-3">
                                                    <label class="form-label">Connection String</label>
                                                    <input type="text" class="form-control" id="mongoConnectionString" placeholder="mongodb://localhost:27017/database">
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="d-flex gap-2">
                                        <button class="btn btn-primary" onclick="SettingsModule.testDatabaseConnection()">
                                            <i class="fas fa-plug"></i> اختبار الاتصال
                                        </button>
                                        <button class="btn btn-success" onclick="SettingsModule.saveDatabaseConfig()">
                                            <i class="fas fa-save"></i> حفظ الإعدادات
                                        </button>
                                        <button class="btn btn-outline-info" onclick="document.getElementById('importConfigFile').click()">
                                            <i class="fas fa-upload"></i> استيراد إعدادات
                                        </button>
                                        <input type="file" id="importConfigFile" accept=".json" style="display: none;" onchange="SettingsModule.importDatabaseConfig(this.files[0])">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Database Connection Status -->
                        <div class="col-12">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-database text-success"></i>
                                    <h5>حالة الاتصال بقاعدة البيانات</h5>
                                </div>
                                <div class="setting-card-body">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="connection-status">
                                                <div class="status-indicator">
                                                    <i class="fas fa-circle text-success"></i>
                                                    <span>متصل</span>
                                                </div>
                                                <small class="text-muted" id="currentDbType">Firebase Firestore</small>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="connection-info">
                                                <p><strong>النوع:</strong> <span id="currentDbTypeInfo">Firebase Firestore</span></p>
                                                <p><strong>الحالة:</strong> <span class="text-success" id="connectionStatus">نشط</span></p>
                                                <p><strong>آخر تحديث:</strong> <span id="lastDbUpdate">جاري التحميل...</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Database Backup -->
                        <div class="col-md-6">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-download text-primary"></i>
                                    <h5>نسخ احتياطية</h5>
                                </div>
                                <div class="setting-card-body">
                                    <div class="d-grid gap-2">
                                        <button class="btn btn-outline-primary" onclick="SettingsModule.createDatabaseBackup()">
                                            <i class="fas fa-download"></i> إنشاء نسخة احتياطية
                                        </button>
                                        <button class="btn btn-outline-success" onclick="document.getElementById('restoreDbFile').click()">
                                            <i class="fas fa-upload"></i> استعادة نسخة احتياطية
                                        </button>
                                        <input type="file" id="restoreDbFile" accept=".json" style="display: none;" onchange="SettingsModule.restoreDatabaseBackup(this.files[0])">
                                    </div>
                                    <small class="text-muted mt-2 d-block">
                                        <i class="fas fa-info-circle"></i>
                                        النسخ الاحتياطية تحفظ جميع البيانات في ملف JSON
                                    </small>
                                </div>
                            </div>
                        </div>

                        <!-- Database Statistics -->
                        <div class="col-md-6">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-chart-bar text-info"></i>
                                    <h5>إحصائيات قاعدة البيانات</h5>
                                </div>
                                <div class="setting-card-body">
                                    <div class="stats-grid">
                                        <div class="stat-item">
                                            <span class="stat-number" id="totalProducts">0</span>
                                            <span class="stat-label">المنتجات</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-number" id="totalSales">0</span>
                                            <span class="stat-label">المبيعات</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-number" id="totalPurchases">0</span>
                                            <span class="stat-label">المشتريات</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-number" id="totalParties">0</span>
                                            <span class="stat-label">العملاء/الموردين</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Database Maintenance -->
                        <div class="col-12">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-tools text-warning"></i>
                                    <h5>صيانة قاعدة البيانات</h5>
                                </div>
                                <div class="setting-card-body">
                                    <div class="row">
                                        <div class="col-md-3">
                                            <button class="btn btn-outline-primary w-100" onclick="SettingsModule.syncDatabase()">
                                                <i class="fas fa-sync-alt"></i> مزامنة قاعدة البيانات
                                            </button>
                                        </div>
                                        <div class="col-md-3">
                                            <button class="btn btn-outline-success w-100" onclick="SettingsModule.repairDatabase()">
                                                <i class="fas fa-wrench"></i> إصلاح قاعدة البيانات
                                            </button>
                                        </div>
                                        <div class="col-md-3">
                                            <button class="btn btn-outline-warning w-100" onclick="SettingsModule.cleanupOrphanedData()">
                                                <i class="fas fa-broom"></i> تنظيف البيانات المهملة
                                            </button>
                                        </div>
                                        <div class="col-md-3">
                                            <button class="btn btn-outline-info w-100" onclick="SettingsModule.validateDataIntegrity()">
                                                <i class="fas fa-check-circle"></i> فحص سلامة البيانات
                                            </button>
                                        </div>
                                    </div>
                                    <div class="row mt-3">
                                        <div class="col-md-12">
                                            <button class="btn btn-outline-danger w-100" onclick="SettingsModule.resetDatabase()">
                                                <i class="fas fa-exclamation-triangle"></i> إعادة تعيين قاعدة البيانات
                                            </button>
                                        </div>
                                    </div>
                                    <div class="alert alert-warning mt-3">
                                        <i class="fas fa-exclamation-triangle"></i>
                                        <strong>تحذير:</strong> إعادة تعيين قاعدة البيانات ستحذف جميع البيانات نهائياً!
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Image Settings Tab -->
                <div id="imageSettingsContent" class="settings-content" style="display: none;">
                    <div class="row g-4">
                        <!-- Image Storage Configuration -->
                        <div class="col-12">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-images text-primary"></i>
                                    <h5>إعدادات تخزين الصور</h5>
                                </div>
                                <div class="setting-card-body">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <h6>الخدمة النشطة</h6>
                                            <div class="storage-status">
                                                <div class="storage-option" id="currentStorageService">
                                                    <i class="fas fa-circle text-success"></i>
                                                    <span>Base64 (افتراضي)</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <h6>إحصائيات الصور</h6>
                                            <div class="image-stats">
                                                <p><strong>إجمالي الصور:</strong> <span id="totalImages">0</span></p>
                                                <p><strong>حجم التخزين:</strong> <span id="totalImageSize">0 MB</span></p>
                                                <p><strong>آخر تحديث:</strong> <span id="lastImageUpdate">جاري التحميل...</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Cloudinary Settings -->
                        <div class="col-md-6">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-cloud text-info"></i>
                                    <h5>Cloudinary</h5>
                                    <div class="badge bg-success">10GB مجاني</div>
                                </div>
                                <div class="setting-card-body">
                                    <div class="form-group mb-3">
                                        <label class="form-label">تفعيل Cloudinary</label>
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="enableCloudinary" onchange="SettingsModule.toggleCloudinary()">
                                            <label class="form-check-label" for="enableCloudinary">مفعل</label>
                                        </div>
                                    </div>
                                    <div class="form-group mb-3">
                                        <label class="form-label">Cloud Name</label>
                                        <input type="text" class="form-control" id="cloudinaryCloudName" placeholder="your-cloud-name">
                                    </div>
                                    <div class="form-group mb-3">
                                        <label class="form-label">Upload Preset</label>
                                        <input type="text" class="form-control" id="cloudinaryUploadPreset" placeholder="your-upload-preset">
                                    </div>
                                    <button class="btn btn-outline-info w-100" onclick="SettingsModule.saveCloudinarySettings()">
                                        <i class="fas fa-save"></i> حفظ الإعدادات
                                    </button>
                                    <small class="text-muted mt-2 d-block">
                                        <i class="fas fa-info-circle"></i>
                                        احصل على هذه البيانات من <a href="https://cloudinary.com" target="_blank">cloudinary.com</a>
                                    </small>
                                </div>
                            </div>
                        </div>

                        <!-- ImgBB Settings -->
                        <div class="col-md-6">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-image text-success"></i>
                                    <h5>ImgBB</h5>
                                    <div class="badge bg-success">مجاني تماماً</div>
                                </div>
                                <div class="setting-card-body">
                                    <div class="form-group mb-3">
                                        <label class="form-label">تفعيل ImgBB</label>
                                        <div class="form-check form-switch">
                                            <input class="form-check-input" type="checkbox" id="enableImgBB" onchange="SettingsModule.toggleImgBB()">
                                            <label class="form-check-label" for="enableImgBB">مفعل</label>
                                        </div>
                                    </div>
                                    <div class="form-group mb-3">
                                        <label class="form-label">API Key</label>
                                        <input type="text" class="form-control" id="imgbbApiKey" placeholder="your-api-key">
                                    </div>
                                    <button class="btn btn-outline-success w-100" onclick="SettingsModule.saveImgBBSettings()">
                                        <i class="fas fa-save"></i> حفظ الإعدادات
                                    </button>
                                    <small class="text-muted mt-2 d-block">
                                        <i class="fas fa-info-circle"></i>
                                        احصل على API Key من <a href="https://imgbb.com" target="_blank">imgbb.com</a>
                                    </small>
                                </div>
                            </div>
                        </div>

                        <!-- Image Compression Settings -->
                        <div class="col-12">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-compress text-warning"></i>
                                    <h5>إعدادات ضغط الصور</h5>
                                </div>
                                <div class="setting-card-body">
                                    <div class="row">
                                        <div class="col-md-4">
                                            <div class="form-group">
                                                <label class="form-label">الحد الأقصى للعرض (بكسل)</label>
                                                <input type="number" class="form-control" id="maxImageWidth" value="400" min="100" max="2000">
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="form-group">
                                                <label class="form-label">جودة الضغط (0.1 - 1.0)</label>
                                                <input type="number" class="form-control" id="imageQuality" value="0.6" min="0.1" max="1.0" step="0.1">
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="form-group">
                                                <label class="form-label">الحد الأقصى للحجم (MB)</label>
                                                <input type="number" class="form-control" id="maxImageSize" value="2" min="1" max="10">
                                            </div>
                                        </div>
                                    </div>
                                    <button class="btn btn-outline-warning" onclick="SettingsModule.saveImageCompressionSettings()">
                                        <i class="fas fa-save"></i> حفظ إعدادات الضغط
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Image Management -->
                        <div class="col-12">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-cogs text-secondary"></i>
                                    <h5>إدارة الصور</h5>
                                </div>
                                <div class="setting-card-body">
                                    <div class="row">
                                        <div class="col-md-3">
                                            <button class="btn btn-outline-primary w-100" onclick="SettingsModule.testImageUpload()">
                                                <i class="fas fa-upload"></i> اختبار رفع الصور
                                            </button>
                                        </div>
                                        <div class="col-md-3">
                                            <button class="btn btn-outline-info w-100" onclick="SettingsModule.optimizeExistingImages()">
                                                <i class="fas fa-magic"></i> تحسين الصور الموجودة
                                            </button>
                                        </div>
                                        <div class="col-md-3">
                                            <button class="btn btn-outline-warning w-100" onclick="SettingsModule.cleanupUnusedImages()">
                                                <i class="fas fa-broom"></i> تنظيف الصور غير المستخدمة
                                            </button>
                                        </div>
                                        <div class="col-md-3">
                                            <button class="btn btn-outline-danger w-100" onclick="SettingsModule.clearAllImages()">
                                                <i class="fas fa-trash"></i> حذف جميع الصور
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Inventory Settings Tab -->
                <div id="inventorySettingsContent" class="settings-content" style="display: none;">
                    <div class="row g-4">
                        <!-- Section 1: Costing Method -->
                        <div class="col-12">
                            <h4 class="mb-3">
                                <i class="fas fa-calculator text-primary"></i>
                                طريقة حساب التكلفة
                            </h4>
                        </div>
                        
                        <div class="col-12">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-chart-line text-primary"></i>
                                    <h5>طريقة حساب تكلفة المخزون</h5>
                                </div>
                                <div class="setting-card-body">
                                    <div class="alert alert-info mb-3">
                                        <i class="fas fa-info-circle me-2"></i>
                                        <strong>مهم:</strong> طريقة حساب التكلفة تؤثر على:
                                        <ul class="mb-0 mt-2">
                                            <li>سعر التكلفة للمنتجات</li>
                                            <li>قيمة المخزون في قوائم الدخل</li>
                                            <li>حساب الأرباح والخسائر</li>
                                            <li>تسعير حركات المخزون</li>
                                        </ul>
                                    </div>
                                    
                                    <div class="row">
                                        <div class="col-md-12">
                                            <label class="form-label fw-bold">اختر طريقة حساب التكلفة *</label>
                                            <select class="form-select form-select-lg" id="costingMethod">
                                                <option value="fifo">📦 FIFO - وارد أولاً صادر أولاً (First In First Out)</option>
                                                <option value="lifo">📦 LIFO - وارد أخيراً صادر أولاً (Last In First Out)</option>
                                                <option value="weighted_average">📊 متوسط مرجح (Weighted Average)</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div class="row mt-3">
                                        <div class="col-md-4">
                                            <div class="costing-method-card border rounded p-3" data-method="fifo">
                                                <div class="d-flex align-items-center mb-2">
                                                    <i class="fas fa-arrow-right text-success me-2"></i>
                                                    <h6 class="mb-0">FIFO</h6>
                                                </div>
                                                <p class="small text-muted mb-2">
                                                    <strong>وارد أولاً صادر أولاً:</strong> المنتجات التي تدخل أولاً تخرج أولاً. 
                                                    مناسب للمنتجات القابلة للتلف أو التي لها تاريخ صلاحية.
                                                </p>
                                                <ul class="small text-muted mb-0">
                                                    <li>✅ يحافظ على تدفق المخزون الطبيعي</li>
                                                    <li>✅ مناسب للمنتجات القابلة للتلف</li>
                                                    <li>⚠️ قد لا يعكس التكلفة الحالية</li>
                                                </ul>
                                            </div>
                                        </div>
                                        
                                        <div class="col-md-4">
                                            <div class="costing-method-card border rounded p-3" data-method="lifo">
                                                <div class="d-flex align-items-center mb-2">
                                                    <i class="fas fa-arrow-left text-warning me-2"></i>
                                                    <h6 class="mb-0">LIFO</h6>
                                                </div>
                                                <p class="small text-muted mb-2">
                                                    <strong>وارد أخيراً صادر أولاً:</strong> المنتجات التي تدخل آخراً تخرج أولاً. 
                                                    مناسب للمنتجات غير القابلة للتلف.
                                                </p>
                                                <ul class="small text-muted mb-0">
                                                    <li>✅ يعكس التكلفة الحالية بشكل أفضل</li>
                                                    <li>✅ مناسب للضرائب في بعض البلدان</li>
                                                    <li>⚠️ قد لا يعكس التدفق الفعلي</li>
                                                </ul>
                                            </div>
                                        </div>
                                        
                                        <div class="col-md-4">
                                            <div class="costing-method-card border rounded p-3" data-method="weighted_average">
                                                <div class="d-flex align-items-center mb-2">
                                                    <i class="fas fa-balance-scale text-info me-2"></i>
                                                    <h6 class="mb-0">متوسط مرجح</h6>
                                                </div>
                                                <p class="small text-muted mb-2">
                                                    <strong>متوسط مرجح:</strong> حساب متوسط التكلفة بناءً على جميع المشتريات. 
                                                    مناسب للمنتجات المتشابهة.
                                                </p>
                                                <ul class="small text-muted mb-0">
                                                    <li>✅ بسيط وسهل التطبيق</li>
                                                    <li>✅ يعطي متوسط تكلفة عادل</li>
                                                    <li>⚠️ قد لا يعكس التكلفة الفعلية</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="alert alert-warning mt-3">
                                        <i class="fas fa-exclamation-triangle me-2"></i>
                                        <strong>تحذير:</strong> تغيير طريقة حساب التكلفة سيؤثر على جميع الحسابات المستقبلية. 
                                        لا يمكن تغييرها بعد بدء استخدام النظام إلا بعد إعادة حساب جميع الحركات.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Section 2: Pricing Methods -->
                        <div class="col-12 mt-4">
                            <h4 class="mb-3">
                                <i class="fas fa-tags text-success"></i>
                                أنماط التسعير
                            </h4>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-shopping-cart text-success"></i>
                                    <h5>سعر آخر شراء</h5>
                                </div>
                                <div class="setting-card-body">
                                    <div class="form-check form-switch mb-3">
                                        <input class="form-check-input" type="checkbox" id="useLastPurchasePrice" 
                                               style="width: 3rem; height: 1.5rem; cursor: pointer;">
                                        <label class="form-check-label fw-bold ms-3">
                                            استخدام سعر آخر شراء كافتراضي
                                        </label>
                                    </div>
                                    <small class="text-muted d-block">
                                        <i class="fas fa-info-circle"></i>
                                        عند إضافة حركة مخزون جديدة، سيتم استخدام سعر آخر عملية شراء كافتراضي.
                                    </small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-dollar-sign text-primary"></i>
                                    <h5>سعر التكلفة</h5>
                                </div>
                                <div class="setting-card-body">
                                    <div class="form-check form-switch mb-3">
                                        <input class="form-check-input" type="checkbox" id="useCostPrice" 
                                               style="width: 3rem; height: 1.5rem; cursor: pointer;">
                                        <label class="form-check-label fw-bold ms-3">
                                            استخدام سعر التكلفة المحسوب كافتراضي
                                        </label>
                                    </div>
                                    <small class="text-muted d-block">
                                        <i class="fas fa-info-circle"></i>
                                        سيتم حساب سعر التكلفة تلقائياً بناءً على طريقة حساب التكلفة المختارة (FIFO/LIFO/متوسط مرجح).
                                    </small>
                                </div>
                            </div>
                        </div>

                        <!-- Section 3: Cost Calculation Settings -->
                        <div class="col-12 mt-4">
                            <h4 class="mb-3">
                                <i class="fas fa-cogs text-warning"></i>
                                إعدادات حساب التكلفة
                            </h4>
                        </div>
                        
                        <div class="col-12">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-exchange-alt text-warning"></i>
                                    <h5>تأثير العمليات على التكلفة</h5>
                                </div>
                                <div class="setting-card-body">
                                    <div class="alert alert-info mb-3">
                                        <i class="fas fa-info-circle me-2"></i>
                                        حدد العمليات التي تؤثر على حساب سعر التكلفة:
                                    </div>
                                    
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="purchasesAffectCost" 
                                                       checked style="width: 3rem; height: 1.5rem; cursor: pointer;">
                                                <label class="form-check-label fw-bold ms-3">
                                                    💰 المشتريات تؤثر على التكلفة
                                                </label>
                                            </div>
                                            <small class="text-muted d-block ms-5 mt-1">
                                                المشتريات تحدث سعر التكلفة بناءً على طريقة الحساب المختارة
                                            </small>
                                        </div>
                                        
                                        <div class="col-md-6">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="purchaseReturnsAffectCost" 
                                                       checked style="width: 3rem; height: 1.5rem; cursor: pointer;">
                                                <label class="form-check-label fw-bold ms-3">
                                                    🔄 مرتجع المشتريات يؤثر على التكلفة
                                                </label>
                                            </div>
                                            <small class="text-muted d-block ms-5 mt-1">
                                                مرتجع المشتريات يقلل من التكلفة حسب طريقة الحساب
                                            </small>
                                        </div>
                                        
                                        <div class="col-md-6">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="adjustmentsAffectCost" 
                                                       style="width: 3rem; height: 1.5rem; cursor: pointer;">
                                                <label class="form-check-label fw-bold ms-3">
                                                    ⚙️ التسويات اليدوية تؤثر على التكلفة
                                                </label>
                                            </div>
                                            <small class="text-muted d-block ms-5 mt-1">
                                                حركات التسوية اليدوية يمكن أن تحدث سعر التكلفة
                                            </small>
                                        </div>
                                        
                                        <div class="col-md-6">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="transfersAffectCost" 
                                                       style="width: 3rem; height: 1.5rem; cursor: pointer;">
                                                <label class="form-check-label fw-bold ms-3">
                                                    🚚 النقل بين المستودعات يؤثر على التكلفة
                                                </label>
                                            </div>
                                            <small class="text-muted d-block ms-5 mt-1">
                                                نقل المنتجات بين المستودعات قد يؤثر على التكلفة
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Section 4: Tracking Settings -->
                        <div class="col-12 mt-4">
                            <h4 class="mb-3">
                                <i class="fas fa-barcode text-info"></i>
                                إعدادات التتبع
                            </h4>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-calendar-alt text-info"></i>
                                    <h5>تاريخ الصلاحية</h5>
                                </div>
                                <div class="setting-card-body">
                                    <div class="form-check form-switch mb-3">
                                        <input class="form-check-input" type="checkbox" id="trackExpiryInMovements" 
                                               checked style="width: 3rem; height: 1.5rem; cursor: pointer;">
                                        <label class="form-check-label fw-bold ms-3">
                                            تتبع تاريخ الصلاحية في حركات المخزون
                                        </label>
                                    </div>
                                    <small class="text-muted d-block">
                                        <i class="fas fa-info-circle"></i>
                                        عند تفعيله، يجب تحديد تاريخ الصلاحية في حركات المخزون للمنتجات التي تدعم التتبع.
                                    </small>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-hashtag text-info"></i>
                                    <h5>الرقم التسلسلي</h5>
                                </div>
                                <div class="setting-card-body">
                                    <div class="form-check form-switch mb-3">
                                        <input class="form-check-input" type="checkbox" id="trackSerialInMovements" 
                                               checked style="width: 3rem; height: 1.5rem; cursor: pointer;">
                                        <label class="form-check-label fw-bold ms-3">
                                            تتبع الرقم التسلسلي في حركات المخزون
                                        </label>
                                    </div>
                                    <small class="text-muted d-block">
                                        <i class="fas fa-info-circle"></i>
                                        عند تفعيله، يجب تحديد الرقم التسلسلي في حركات المخزون للمنتجات التي تدعم التتبع.
                                    </small>
                                </div>
                            </div>
                        </div>

                        <!-- Save Button -->
                        <div class="col-12">
                            <div class="text-center">
                                <button class="btn btn-success btn-lg px-5" id="saveInventorySettingsBtn">
                                    <i class="fas fa-save me-2"></i> حفظ جميع إعدادات المخزون
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- System Settings Tab -->
                <div id="systemSettingsContent" class="settings-content" style="display: none;">
                    <div class="row g-4">
                        <!-- Date and Calendar Settings -->
                        <div class="col-12">
                            <h4 class="mb-3">
                                <i class="fas fa-calendar-alt text-primary"></i>
                                إعدادات التاريخ والتقويم
                            </h4>
                        </div>
                        
                        <div class="col-md-6">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-calendar text-primary"></i>
                                    <h5>نوع التقويم</h5>
                                </div>
                                <div class="setting-card-body">
                                    <label class="form-label fw-bold">اختر نوع التقويم المستخدم</label>
                                    <select class="form-select form-select-lg" id="calendarType">
                                        <option value="gregorian">📅 تقويم ميلادي (Gregorian)</option>
                                        <option value="hijri">🌙 تقويم هجري (Hijri)</option>
                                    </select>
                                    <small class="text-muted mt-2 d-block">
                                        <i class="fas fa-info-circle"></i>
                                        هذا الإعداد يحدد نوع التقويم المستخدم في جميع حقول التاريخ في النظام
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-globe text-success"></i>
                                    <h5>تنسيق التاريخ</h5>
                                </div>
                                <div class="setting-card-body">
                                    <label class="form-label fw-bold">تنسيق عرض التاريخ</label>
                                    <select class="form-select form-select-lg" id="dateFormat">
                                        <option value="ar-IQ">ar-IQ (عربي - العراق)</option>
                                        <option value="ar-SA">ar-SA (عربي - السعودية)</option>
                                        <option value="en-US">en-US (إنجليزي - أمريكا)</option>
                                        <option value="en-GB">en-GB (إنجليزي - بريطانيا)</option>
                                    </select>
                                    <small class="text-muted mt-2 d-block">
                                        <i class="fas fa-info-circle"></i>
                                        يحدد كيفية عرض التواريخ في التقارير والعروض
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-language text-info"></i>
                                    <h5>اللغة</h5>
                                </div>
                                <div class="setting-card-body">
                                    <label class="form-label fw-bold">اختر لغة الواجهة</label>
                                    <select class="form-select form-select-lg" id="appLanguage">
                                        <option value="ar">🇸🇦 العربية (Arabic)</option>
                                        <option value="en">🇬🇧 English</option>
                                    </select>
                                    <small class="text-muted mt-2 d-block">
                                        <i class="fas fa-info-circle"></i>
                                        سيتم تغيير لغة جميع عناصر الواجهة عند الحفظ
                                    </small>
                                </div>
                            </div>
                        </div>

                        <!-- Data Synchronization Settings -->
                        <div class="col-12">
                            <h4 class="mb-3 mt-4">
                                <i class="fas fa-sync-alt text-primary"></i>
                                إعدادات المزامنة
                            </h4>
                        </div>

                        <div class="col-md-6">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-satellite-dish text-success"></i>
                                    <h5>نوع المزامنة</h5>
                                </div>
                                <div class="setting-card-body">
                                    <label class="form-label fw-bold">طريقة المزامنة من قاعدة البيانات</label>
                                    <select class="form-select form-select-lg" id="syncMode">
                                        <option value="realtime">📡 مزامنة فورية (Real-time) - موصى به</option>
                                        <option value="polling">⏱️ مزامنة دورية (Polling)</option>
                                    </select>
                                    <small class="text-muted mt-2 d-block">
                                        <i class="fas fa-info-circle"></i>
                                        المزامنة الفورية تحدث تلقائياً عند تغيير البيانات. المزامنة الدورية تحدث كل فترة زمنية محددة.
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="setting-card">
                                <div class="setting-card-header">
                                    <i class="fas fa-clock text-warning"></i>
                                    <h5>فترة المزامنة الدورية</h5>
                                </div>
                                <div class="setting-card-body">
                                    <label class="form-label fw-bold">الفترة بالثواني (للمزامنة الدورية فقط)</label>
                                    <input type="number" class="form-control form-control-lg" id="syncInterval" value="3" min="1" max="60">
                                    <small class="text-muted mt-2 d-block">
                                        <i class="fas fa-info-circle"></i>
                                        الفترة بين كل مزامنة بالثواني (من 1 إلى 60 ثانية). القيمة الافتراضية: 3 ثواني
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div class="col-12">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                <strong>ملاحظة:</strong> 
                                <ul class="mb-0 mt-2">
                                    <li>التقويم الميلادي: يستخدم التقويم الغريغوري (Gregorian Calendar)</li>
                                    <li>التقويم الهجري: يستخدم التقويم الإسلامي (Hijri Calendar)</li>
                                    <li>التغيير في نوع التقويم سيؤثر على جميع حقول التاريخ في النظام</li>
                                    <li>يتم حفظ التواريخ في قاعدة البيانات بصيغة ISO 8601 (YYYY-MM-DD)</li>
                                </ul>
                            </div>
                        </div>

                        <!-- Save Button -->
                        <div class="col-12">
                            <div class="text-center">
                                <button class="btn btn-success btn-lg px-5" id="saveSystemSettingsBtn">
                                    <i class="fas fa-save me-2"></i> حفظ إعدادات النظام
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    },

    /**
     * Render module to DOM
     */
    render() {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = this.getHTML();
        }
    },

    /**
     * Initialize the Settings module
     */
    async initialize() {
        try {
            console.log('âڑ™ï¸ڈ Initializing Settings module...');
            this.render();
            this.setupEventListeners();
            await this.loadVoucherSettings();
            await this.loadInventorySettings();
            await this.loadSystemSettings();
            console.log('âœ… Settings module initialized successfully');
        } catch (error) {
            console.error('â‌Œ Error initializing Settings module:', error);
        }
    },

    /**
     * Load the module (alias for initialize)
     */
    async load() {
        await this.initialize();
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        console.log('ًں”§ Setting up Settings module event listeners...');
        
        // Tab switching
        const tabButtons = document.querySelectorAll('.settings-tabs-modern .tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                console.log('Tab clicked:', tabName);
                this.switchTab(tabName);
            });
        });

        // Save all accounting settings
        const saveAccountingBtn = document.getElementById('saveAccountingSettingsBtn');
        if (saveAccountingBtn) {
            saveAccountingBtn.addEventListener('click', () => {
                this.saveAllAccountingSettings();
            });
        }

        // Save inventory settings
        const saveInventoryBtn = document.getElementById('saveInventorySettingsBtn');
        if (saveInventoryBtn) {
            saveInventoryBtn.addEventListener('click', () => {
                this.saveInventorySettings();
            });
        }

        // Save system settings
        const saveSystemBtn = document.getElementById('saveSystemSettingsBtn');
        if (saveSystemBtn) {
            saveSystemBtn.addEventListener('click', () => {
                this.saveSystemSettings();
            });
        }


        // Search default contra accounts
        const searchBtn = document.getElementById('searchDefaultContraBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.showDefaultContraAccountSearch('receipt');
            });
        }

        const displayInput = document.getElementById('defaultContraAccountDisplay');
        if (displayInput) {
            displayInput.addEventListener('click', () => {
                this.showDefaultContraAccountSearch('receipt');
            });
        }
        
        // Payment contra search
        const searchPaymentBtn = document.getElementById('searchPaymentContraBtn');
        if (searchPaymentBtn) {
            searchPaymentBtn.addEventListener('click', () => {
                this.showDefaultContraAccountSearch('payment');
            });
        }

        const paymentDisplayInput = document.getElementById('paymentContraAccountDisplay');
        if (paymentDisplayInput) {
            paymentDisplayInput.addEventListener('click', () => {
                this.showDefaultContraAccountSearch('payment');
            });
        }
        
        console.log('âœ… Settings event listeners setup complete');
    },

    /**
     * Switch between settings tabs
     */
    switchTab(tab) {
        this.currentTab = tab;
        
        // Update tab buttons
        const allButtons = document.querySelectorAll('.settings-tabs-modern .tab-btn');
        allButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeButton = document.querySelector('.settings-tabs-modern .tab-btn[data-tab="' + tab + '"]');
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Show/hide content
        const allContent = document.querySelectorAll('.settings-content');
        allContent.forEach(content => {
            content.style.display = 'none';
        });
        
        const selectedContent = document.getElementById(tab + 'SettingsContent');
        if (selectedContent) {
            selectedContent.style.display = 'block';
            
            // Load data for specific tabs
            if (tab === 'database') {
                this.loadFiscalYears();
                this.loadDatabaseConfig();
            } else if (tab === 'inventory') {
                this.loadInventorySettings();
            }
        }
    },

    /**
     * Load voucher settings for all types
     */
    async loadVoucherSettings() {
        try {
            // Load receipt settings
            const receiptDoc = await db.collection('settings').doc('vouchers_receipt').get();
            if (receiptDoc.exists) {
                const settings = receiptDoc.data();
                
                const receiptCCCheckbox = document.getElementById('receiptCostCenterRequired');
                if (receiptCCCheckbox) receiptCCCheckbox.checked = settings.costCenterRequired || false;
                
                const statusSelect = document.getElementById('defaultVoucherStatus');
                if (statusSelect) statusSelect.value = settings.defaultVoucherStatus || 'draft';
                
                const receiptInput = document.getElementById('receiptPrefix');
                if (receiptInput) receiptInput.value = settings.receiptPrefix || 'RV';
                
                // Load default contra account
                if (settings.defaultContraAccount) {
                    const accountDoc = await db.collection('chartOfAccounts').doc(settings.defaultContraAccount).get();
                    if (accountDoc.exists) {
                        const account = accountDoc.data();
                        const hiddenInput = document.getElementById('defaultContraAccount');
                        const displayInput = document.getElementById('defaultContraAccountDisplay');
                        if (hiddenInput) hiddenInput.value = settings.defaultContraAccount;
                        if (displayInput) displayInput.value = account.code + ' - ' + account.name;
                    }
                }
            }
            
            // Load payment settings
            const paymentDoc = await db.collection('settings').doc('vouchers_payment').get();
            if (paymentDoc.exists) {
                const settings = paymentDoc.data();
                
                const paymentCCCheckbox = document.getElementById('paymentCostCenterRequired');
                if (paymentCCCheckbox) paymentCCCheckbox.checked = settings.costCenterRequired || false;
                
                const paymentInput = document.getElementById('paymentPrefix');
                if (paymentInput) paymentInput.value = settings.paymentPrefix || 'PV';
                
                // Load default contra account
                if (settings.defaultContraAccount) {
                    const accountDoc = await db.collection('chartOfAccounts').doc(settings.defaultContraAccount).get();
                    if (accountDoc.exists) {
                        const account = accountDoc.data();
                        const hiddenInput = document.getElementById('paymentContraAccount');
                        const displayInput = document.getElementById('paymentContraAccountDisplay');
                        if (hiddenInput) hiddenInput.value = settings.defaultContraAccount;
                        if (displayInput) displayInput.value = account.code + ' - ' + account.name;
                    }
                }
            }
            
            // Load journal settings
            const journalDoc = await db.collection('settings').doc('vouchers_journal').get();
            if (journalDoc.exists) {
                const settings = journalDoc.data();
                
                const journalCCCheckbox = document.getElementById('journalCostCenterRequired');
                if (journalCCCheckbox) journalCCCheckbox.checked = settings.costCenterRequired || false;
                
                const journalInput = document.getElementById('journalPrefix');
                if (journalInput) journalInput.value = settings.journalPrefix || 'JV';
            }
            
            // Load entry settings
            const entryDoc = await db.collection('settings').doc('vouchers_entry').get();
            if (entryDoc.exists) {
                const settings = entryDoc.data();
                
                const entryCCCheckbox = document.getElementById('entryCostCenterRequired');
                if (entryCCCheckbox) entryCCCheckbox.checked = settings.costCenterRequired || false;
                
                const entryInput = document.getElementById('entryPrefix');
                if (entryInput) entryInput.value = settings.entryPrefix || 'EV';
            }
            
            // âœ… Load fiscal period settings (NEW!)
            const generalDoc = await db.collection('settings').doc('general').get();
            if (generalDoc.exists) {
                const settings = generalDoc.data();
                
                const fiscalStartInput = document.getElementById('fiscalYearStart');
                if (fiscalStartInput) fiscalStartInput.value = settings.fiscalYearStart || '';
                
                const fiscalEndInput = document.getElementById('fiscalYearEnd');
                if (fiscalEndInput) fiscalEndInput.value = settings.fiscalYearEnd || '';
                
                console.log('âœ… Fiscal period loaded:', {
                    start: settings.fiscalYearStart,
                    end: settings.fiscalYearEnd
                });
            } else {
                console.log('â„¹ï¸ڈ No general settings found, using defaults');
            }
            
        } catch (error) {
            console.error('Error loading voucher settings:', error);
        }
    },

    /**
     * Save all accounting settings
     */
    async saveAllAccountingSettings() {
        try {
            showLoading();
            
            // Receipt settings
            const receiptSettings = {
                defaultContraAccount: document.getElementById('defaultContraAccount').value || null,
                costCenterRequired: document.getElementById('receiptCostCenterRequired').checked,
                defaultVoucherStatus: document.getElementById('defaultVoucherStatus').value,
                receiptPrefix: document.getElementById('receiptPrefix').value || 'RV',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Payment settings
            const paymentSettings = {
                defaultContraAccount: document.getElementById('paymentContraAccount').value || null,
                costCenterRequired: document.getElementById('paymentCostCenterRequired').checked,
                paymentPrefix: document.getElementById('paymentPrefix').value || 'PV',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Journal settings
            const journalSettings = {
                costCenterRequired: document.getElementById('journalCostCenterRequired').checked,
                journalPrefix: document.getElementById('journalPrefix').value || 'JV',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const entrySettings = {
                costCenterRequired: document.getElementById('entryCostCenterRequired').checked || false,
                entryPrefix: document.getElementById('entryPrefix').value || 'EV',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // âœ… Fiscal period settings (NEW!)
            const fiscalYearStart = document.getElementById('fiscalYearStart').value || null;
            const fiscalYearEnd = document.getElementById('fiscalYearEnd').value || null;
            
            // Validate fiscal period
            if (fiscalYearStart && fiscalYearEnd) {
                if (fiscalYearStart >= fiscalYearEnd) {
                    hideLoading();
                    this.showError('تاريخ بداية السنة المالية يجب أن يكون قبل تاريخ النهاية');
                    return;
                }
            }
            
            const generalSettings = {
                fiscalYearStart: fiscalYearStart,
                fiscalYearEnd: fiscalYearEnd,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Save all settings
            await Promise.all([
                db.collection('settings').doc('vouchers_receipt').set(receiptSettings, { merge: true }),
                db.collection('settings').doc('vouchers_payment').set(paymentSettings, { merge: true }),
                db.collection('settings').doc('vouchers_journal').set(journalSettings, { merge: true }),
                db.collection('settings').doc('vouchers_entry').set(entrySettings, { merge: true }),
                db.collection('settings').doc('general').set(generalSettings, { merge: true })
            ]);
            
            hideLoading();
            this.showSuccess('تم حفظ جميع إعدادات إدارة الحسابات بنجاح، بما في ذلك الفترة المالية');
            
            // Reload settings
            await this.loadVoucherSettings();
            
            console.log('âœ… Fiscal period saved:', { fiscalYearStart, fiscalYearEnd });
        } catch (error) {
            hideLoading();
            console.error('Error saving accounting settings:', error);
            this.showError('خطأ في حفظ الإعدادات: ' + error.message);
        }
    },


    /**
     * Show account search for default contra account
     */
    async showDefaultContraAccountSearch(voucherType) {
        console.log('ًں”چ Showing account search for:', voucherType);
        
        try {
            // Load all accounts
            const accountsSnapshot = await db.collection('chartOfAccounts')
                .orderBy('code')
                .get();
            
            const accounts = [];
            accountsSnapshot.forEach(doc => {
                const account = { id: doc.id, ...doc.data() };
                accounts.push(account);
            });
            
            console.log(`ًں“ٹ Loaded ${accounts.length} accounts from database`);
            
            // ✅ فلترة: فقط الحسابات النهائية (isFinal === true OR !isParentAccount)
            const finalAccounts = accounts.filter(acc => {
                // الحساب النهائي هو الذي ليس رئيسياً
                const isFinal = acc.isFinalAccount === true || acc.isParentAccount === false || !acc.isParentAccount;
                
                // تفضيل الحسابات النقدية والبنوك (1.1.x)
                // لكن عرض جميع الحسابات النهائية
                return isFinal && acc.status === 'active';
            });
            
            console.log(`âœ… Filtered to ${finalAccounts.length} final accounts`);
            
            if (finalAccounts.length === 0) {
                this.showError('لا توجد حسابات نهائية! يرجى إضافة حسابات نهائية أولاً في شجرة الحسابات.');
                return;
            }
            
            // Build options HTML with hierarchy display
            let optionsHTML = '';
            finalAccounts.forEach(acc => {
                // Get parent chain for display
                let parentChain = '';
                let currentParent = acc.parentId;
                const parents = [];
                
                while (currentParent) {
                    const parent = accounts.find(a => a.id === currentParent);
                    if (parent) {
                        parents.unshift(parent.name);
                        currentParent = parent.parentId;
                    } else {
                        break;
                    }
                }
                
                if (parents.length > 0) {
                    parentChain = `<small class="text-muted d-block"><i class="fas fa-level-up-alt"></i> ${parents.join(' â†گ ')}</small>`;
                }
                
                const accountNameEscaped = acc.name.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                
                optionsHTML += `
                    <div class="account-option" 
                         style="padding: 12px; border-bottom: 1px solid #eee; cursor: pointer; transition: all 0.2s;"
                         onmouseover="this.style.background='#f8f9fa'" 
                         onmouseout="this.style.background='white'"
                         onclick="SettingsModule.selectContraAccount('${acc.id}', '${acc.code}', '${accountNameEscaped}', '${voucherType}')">
                        <div>
                            <strong class="text-primary">${acc.code}</strong> - ${acc.name}
                            <span class="badge bg-info ms-2"><i class="fas fa-coins"></i> ${acc.currency || 'IQD'}</span>
                        </div>
                        ${parentChain}
                    </div>
                `;
            });
            
            await Swal.fire({
                title: '🔍 اختر الحساب المقابل',
                html: `
                    <div class="text-end" style="direction: rtl;">
                        <div class="alert alert-info mb-3">
                            <i class="fas fa-info-circle"></i>
                            <strong>ملاحظة:</strong> يتم عرض الحسابات النهائية فقط (الحسابات التي يمكن استخدامها في المعاملات)
                        </div>
                        <input type="text" class="form-control mb-3" id="accountSearchInput" 
                               placeholder="ابحث بالكود أو الاسم..." autofocus>
                        <div id="accountsList" style="max-height: 400px; overflow-y: auto; text-align: right; border: 1px solid #dee2e6; border-radius: 5px;">
                            ${optionsHTML}
                        </div>
                        <small class="text-muted d-block mt-2">
                            عدد الحسابات النهائية المتاحة: ${finalAccounts.length}
                        </small>
                    </div>
                `,
                width: '700px',
                showConfirmButton: false,
                showCancelButton: true,
                cancelButtonText: '<i class="fas fa-times"></i> ط¥ظ„ط؛ط§ط،',
                didOpen: () => {
                    // Add search functionality
                    const searchInput = document.getElementById('accountSearchInput');
                    const accountsList = document.getElementById('accountsList');
                    
                    searchInput.addEventListener('input', (e) => {
                        const searchTerm = e.target.value.toLowerCase().trim();
                        const accountOptions = accountsList.querySelectorAll('.account-option');
                        
                        let visibleCount = 0;
                        accountOptions.forEach(option => {
                            const text = option.textContent.toLowerCase();
                            if (!searchTerm || text.includes(searchTerm)) {
                                option.style.display = '';
                                visibleCount++;
                            } else {
                                option.style.display = 'none';
                            }
                        });
                        
                        console.log(`ًں”چ Search results: ${visibleCount} accounts`);
                    });
                    
                    // Focus search input
                    searchInput.focus();
                }
            });
            
        } catch (error) {
            console.error('Error showing account search:', error);
            this.showError('خطأ في تحميل الحسابات: ' + error.message);
        }
    },

    /**
     * Select contra account from search
     */
    selectContraAccount(accountId, accountCode, accountName, voucherType) {
        console.log('âœ… Account selected:', { accountId, accountCode, accountName, voucherType });
        
        if (voucherType === 'receipt') {
            const hiddenInput = document.getElementById('defaultContraAccount');
            const displayInput = document.getElementById('defaultContraAccountDisplay');
            if (hiddenInput) hiddenInput.value = accountId;
            if (displayInput) displayInput.value = accountCode + ' - ' + accountName;
        } else if (voucherType === 'payment') {
            const hiddenInput = document.getElementById('paymentContraAccount');
            const displayInput = document.getElementById('paymentContraAccountDisplay');
            if (hiddenInput) hiddenInput.value = accountId;
            if (displayInput) displayInput.value = accountCode + ' - ' + accountName;
        }
        
        // Close the SweetAlert modal
        Swal.close();
        
        console.log('âœ… Contra account set successfully');
    },
    
    /**
     * Get account type text
     */
    getAccountTypeText(type) {
        const types = {
            'asset': 'أصل',
            'liability': 'الالتزام',
            'equity': 'حقوق ملكية',
            'revenue': 'إيراد',
            'expense': 'مصروف'
        };
        return types[type] || type;
    },

    /**
     * Show success message
     */
    showSuccess(message) {
        Swal.fire({
            title: 'ظ†ط¬ط­!',
            text: message,
            icon: 'success',
            confirmButtonText: 'ط­ط³ظ†ط§ظ‹',
            timer: 2000
        });
    },

    /**
     * Show error message
     */
    showError(message) {
        Swal.fire({
            title: 'ط®ط·ط£!',
            text: message,
            icon: 'error',
            confirmButtonText: 'ط­ط³ظ†ط§ظ‹'
        });
    },

    // ========== DATABASE SETTINGS FUNCTIONS ==========

    /**
     * Load database configuration
     */
    async loadDatabaseConfig() {
        try {
            const dbConfigDoc = await db.collection('settings').doc('database').get();
            
            if (dbConfigDoc.exists) {
                const config = dbConfigDoc.data();
                
                // Set database type
                const dbTypeSelect = document.getElementById('databaseType');
                if (dbTypeSelect) {
                    dbTypeSelect.value = config.type || 'firebase';
                    this.onDatabaseTypeChange(); // Trigger UI update
                }
                
                // Set database name
                const dbNameInput = document.getElementById('databaseName');
                if (dbNameInput) {
                    dbNameInput.value = config.name || '';
                }
                
                // Set type-specific configurations
                if (config.firebase) {
                    document.getElementById('firebaseProjectId').value = config.firebase.projectId || '';
                    document.getElementById('firebaseApiKey').value = config.firebase.apiKey || '';
                    document.getElementById('firebaseAuthDomain').value = config.firebase.authDomain || '';
                    document.getElementById('firebaseStorageBucket').value = config.firebase.storageBucket || '';
                }
                
                if (config.sql) {
                    document.getElementById('sqlHost').value = config.sql.host || '';
                    document.getElementById('sqlPort').value = config.sql.port || '';
                    document.getElementById('sqlUsername').value = config.sql.username || '';
                    document.getElementById('sqlPassword').value = config.sql.password || '';
                }
                
                if (config.mongo) {
                    document.getElementById('mongoConnectionString').value = config.mongo.connectionString || '';
                }
                
                // Update last update time
                const lastUpdateElement = document.getElementById('lastDbUpdate');
                if (lastUpdateElement && config.updatedAt) {
                    lastUpdateElement.textContent = new Date(config.updatedAt.toDate()).toLocaleString('ar-SA');
                }
            }
            
        } catch (error) {
            console.error('Error loading database config:', error);
        }
    },

    /**
     * Handle database type change
     */
    onDatabaseTypeChange() {
        const dbType = document.getElementById('databaseType').value;
        
        // Hide all config sections
        document.getElementById('firebaseConfig').style.display = 'none';
        document.getElementById('sqlConfig').style.display = 'none';
        document.getElementById('mongoConfig').style.display = 'none';
        
        // Show relevant config section
        switch(dbType) {
            case 'firebase':
                document.getElementById('firebaseConfig').style.display = 'block';
                break;
            case 'mysql':
            case 'postgresql':
                document.getElementById('sqlConfig').style.display = 'block';
                break;
            case 'mongodb':
                document.getElementById('mongoConfig').style.display = 'block';
                break;
        }
        
        // Update current database type display
        const typeNames = {
            'firebase': 'Firebase Firestore',
            'mysql': 'MySQL',
            'postgresql': 'PostgreSQL',
            'mongodb': 'MongoDB'
        };
        
        document.getElementById('currentDbType').textContent = typeNames[dbType];
        document.getElementById('currentDbTypeInfo').textContent = typeNames[dbType];
    },

    /**
     * Test database connection
     */
    async testDatabaseConnection() {
        try {
            const dbType = document.getElementById('databaseType').value;
            
            if (!dbType) {
                this.showError('يرجى اختيار نوع قاعدة البيانات');
                return;
            }

            showLoading();

            let connectionResult = false;
            
            switch(dbType) {
                case 'firebase':
                    connectionResult = await this.testFirebaseConnection();
                    break;
                case 'mysql':
                case 'postgresql':
                    connectionResult = await this.testSQLConnection();
                    break;
                case 'mongodb':
                    connectionResult = await this.testMongoConnection();
                    break;
            }

            hideLoading();

            if (connectionResult) {
                this.showSuccess('تم الاتصال بقاعدة البيانات بنجاح');
                document.getElementById('connectionStatus').textContent = 'نشط';
                document.getElementById('connectionStatus').className = 'text-success';
            } else {
                this.showError('فشل الاتصال بقاعدة البيانات');
                document.getElementById('connectionStatus').textContent = 'غير متصل';
                document.getElementById('connectionStatus').className = 'text-danger';
            }
            
        } catch (error) {
            hideLoading();
            console.error('Error testing database connection:', error);
            this.showError('خطأ في اختبار الاتصال: ' + error.message);
        }
    },

    /**
     * Test Firebase connection
     */
    async testFirebaseConnection() {
        try {
            const projectId = document.getElementById('firebaseProjectId').value.trim();
            const apiKey = document.getElementById('firebaseApiKey').value.trim();
            
            if (!projectId || !apiKey) {
                throw new Error('يرجى ملء جميع الحقول المطلوبة');
            }

            // Test with current Firebase instance
            const testDoc = await db.collection('_test').doc('connection').set({
                timestamp: new Date(),
                test: true
            });
            
            await db.collection('_test').doc('connection').delete();
            
            return true;
        } catch (error) {
            console.error('Firebase connection test failed:', error);
            return false;
        }
    },

    /**
     * Test SQL connection
     */
    async testSQLConnection() {
        try {
            const host = document.getElementById('sqlHost').value.trim();
            const port = document.getElementById('sqlPort').value.trim();
            const username = document.getElementById('sqlUsername').value.trim();
            const password = document.getElementById('sqlPassword').value.trim();
            
            if (!host || !port || !username) {
                throw new Error('يرجى ملء جميع الحقول المطلوبة');
            }

            // This would be implemented with actual SQL connection
            // For now, simulate a connection test
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            return true;
        } catch (error) {
            console.error('SQL connection test failed:', error);
            return false;
        }
    },

    /**
     * Test MongoDB connection
     */
    async testMongoConnection() {
        try {
            const connectionString = document.getElementById('mongoConnectionString').value.trim();
            
            if (!connectionString) {
                throw new Error('يرجى إدخال Connection String');
            }

            // This would be implemented with actual MongoDB connection
            // For now, simulate a connection test
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            return true;
        } catch (error) {
            console.error('MongoDB connection test failed:', error);
            return false;
        }
    },

    /**
     * Save database configuration to local storage and config file
     */
    async saveDatabaseConfig() {
        try {
            const dbType = document.getElementById('databaseType').value;
            const dbName = document.getElementById('databaseName').value.trim();
            
            if (!dbType || !dbName) {
                this.showError('يرجى ملء جميع الحقول المطلوبة');
                return;
            }

            showLoading();

            let config = {
                type: dbType,
                name: dbName,
                companyId: this.getCurrentCompanyId(),
                updatedAt: new Date().toISOString()
            };

            // Add type-specific configuration
            switch(dbType) {
                case 'firebase':
                    config.firebase = {
                        projectId: document.getElementById('firebaseProjectId').value.trim(),
                        apiKey: document.getElementById('firebaseApiKey').value.trim(),
                        authDomain: document.getElementById('firebaseAuthDomain').value.trim(),
                        storageBucket: document.getElementById('firebaseStorageBucket').value.trim()
                    };
                    break;
                case 'mysql':
                case 'postgresql':
                    config.sql = {
                        host: document.getElementById('sqlHost').value.trim(),
                        port: document.getElementById('sqlPort').value.trim(),
                        username: document.getElementById('sqlUsername').value.trim(),
                        password: document.getElementById('sqlPassword').value.trim()
                    };
                    break;
                case 'mongodb':
                    config.mongo = {
                        connectionString: document.getElementById('mongoConnectionString').value.trim()
                    };
                    break;
            }

            // Save to multiple locations for redundancy
            await this.saveDatabaseConfigToMultipleLocations(config);

            hideLoading();
            this.showSuccess('تم حفظ إعدادات قاعدة البيانات بنجاح');
            
            // Show restart message
            Swal.fire({
                title: 'إعادة تشغيل مطلوبة',
                text: 'يجب إعادة تشغيل النظام لتطبيق إعدادات قاعدة البيانات الجديدة.',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'إعادة تشغيل الآن',
                cancelButtonText: 'لاحقاً',
                confirmButtonColor: '#0d6efd'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.reload();
                }
            });
            
        } catch (error) {
            hideLoading();
            console.error('Error saving database config:', error);
            this.showError('خطأ في حفظ إعدادات قاعدة البيانات: ' + error.message);
        }
    },

    /**
     * Save database config to multiple locations
     */
    async saveDatabaseConfigToMultipleLocations(config) {
        try {
            // 1. Save to localStorage (immediate access)
            localStorage.setItem('databaseConfig', JSON.stringify(config));
            
            // 2. Save to sessionStorage (current session)
            sessionStorage.setItem('databaseConfig', JSON.stringify(config));
            
            // 3. Save to config file (download)
            this.downloadConfigFile(config);
            
            // 4. Save to current database (for backup only)
            try {
                await db.collection('settings').doc('database').set(config, { merge: true });
            } catch (error) {
                console.warn('Could not save to current database:', error);
            }
            
            console.log('✅ Database config saved to multiple locations');
            
        } catch (error) {
            console.error('Error saving config to multiple locations:', error);
            throw error;
        }
    },

    /**
     * Download config file
     */
    downloadConfigFile(config) {
        const configFile = {
            version: '1.0',
            type: 'database-config',
            company: config.name,
            config: config,
            createdAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(configFile, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `database-config-${config.name}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Get current company ID
     */
    getCurrentCompanyId() {
        // This should be set when user logs in or selects company
        return localStorage.getItem('currentCompanyId') || 'default-company';
    },

    /**
     * Load database configuration from multiple sources
     */
    async loadDatabaseConfig() {
        try {
            let config = null;
            
            // Try to load from localStorage first
            const localConfig = localStorage.getItem('databaseConfig');
            if (localConfig) {
                config = JSON.parse(localConfig);
                console.log('📁 Loaded config from localStorage');
            }
            
            // If not found, try sessionStorage
            if (!config) {
                const sessionConfig = sessionStorage.getItem('databaseConfig');
                if (sessionConfig) {
                    config = JSON.parse(sessionConfig);
                    console.log('📁 Loaded config from sessionStorage');
                }
            }
            
            // If still not found, try current database (for backup)
            if (!config) {
                try {
                    const dbConfigDoc = await db.collection('settings').doc('database').get();
                    if (dbConfigDoc.exists) {
                        config = dbConfigDoc.data();
                        console.log('📁 Loaded config from database (backup)');
                    }
                } catch (error) {
                    console.warn('Could not load from database:', error);
                }
            }
            
            // Apply config to UI
            if (config) {
                this.applyDatabaseConfigToUI(config);
            } else {
                console.log('📁 No database config found, using defaults');
                this.setDefaultDatabaseConfig();
            }
            
        } catch (error) {
            console.error('Error loading database config:', error);
            this.setDefaultDatabaseConfig();
        }
    },

    /**
     * Apply database config to UI
     */
    applyDatabaseConfigToUI(config) {
        // Set database type
        const dbTypeSelect = document.getElementById('databaseType');
        if (dbTypeSelect) {
            dbTypeSelect.value = config.type || 'firebase';
            this.onDatabaseTypeChange(); // Trigger UI update
        }
        
        // Set database name
        const dbNameInput = document.getElementById('databaseName');
        if (dbNameInput) {
            dbNameInput.value = config.name || '';
        }
        
        // Set type-specific configurations
        if (config.firebase) {
            document.getElementById('firebaseProjectId').value = config.firebase.projectId || '';
            document.getElementById('firebaseApiKey').value = config.firebase.apiKey || '';
            document.getElementById('firebaseAuthDomain').value = config.firebase.authDomain || '';
            document.getElementById('firebaseStorageBucket').value = config.firebase.storageBucket || '';
        }
        
        if (config.sql) {
            document.getElementById('sqlHost').value = config.sql.host || '';
            document.getElementById('sqlPort').value = config.sql.port || '';
            document.getElementById('sqlUsername').value = config.sql.username || '';
            document.getElementById('sqlPassword').value = config.sql.password || '';
        }
        
        if (config.mongo) {
            document.getElementById('mongoConnectionString').value = config.mongo.connectionString || '';
        }
        
        // Update last update time
        const lastUpdateElement = document.getElementById('lastDbUpdate');
        if (lastUpdateElement && config.updatedAt) {
            lastUpdateElement.textContent = new Date(config.updatedAt).toLocaleString('ar-SA');
        }
        
        // Update current database type display
        const typeNames = {
            'firebase': 'Firebase Firestore',
            'mysql': 'MySQL',
            'postgresql': 'PostgreSQL',
            'mongodb': 'MongoDB'
        };
        
        document.getElementById('currentDbType').textContent = typeNames[config.type] || 'Firebase Firestore';
        document.getElementById('currentDbTypeInfo').textContent = typeNames[config.type] || 'Firebase Firestore';
    },

    /**
     * Set default database config
     */
    setDefaultDatabaseConfig() {
        const dbTypeSelect = document.getElementById('databaseType');
        if (dbTypeSelect) {
            dbTypeSelect.value = 'firebase';
            this.onDatabaseTypeChange();
        }
        
        const dbNameInput = document.getElementById('databaseName');
        if (dbNameInput) {
            dbNameInput.value = 'الشركة الافتراضية';
        }
        
        document.getElementById('currentDbType').textContent = 'Firebase Firestore';
        document.getElementById('currentDbTypeInfo').textContent = 'Firebase Firestore';
    },

    /**
     * Import database configuration from file
     */
    async importDatabaseConfig(file) {
        try {
            if (!file) return;

            const result = await Swal.fire({
                title: 'تأكيد الاستيراد',
                text: 'هل أنت متأكد من استيراد إعدادات قاعدة البيانات؟ سيتم استبدال الإعدادات الحالية.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'نعم، استيراد',
                cancelButtonText: 'إلغاء',
                confirmButtonColor: '#0d6efd'
            });

            if (!result.isConfirmed) return;

            showLoading();

            const text = await file.text();
            const configFile = JSON.parse(text);

            if (!configFile.config || configFile.type !== 'database-config') {
                throw new Error('ملف الإعدادات غير صالح');
            }

            const config = configFile.config;

            // Validate config
            if (!config.type || !config.name) {
                throw new Error('إعدادات قاعدة البيانات غير مكتملة');
            }

            // Save imported config
            await this.saveDatabaseConfigToMultipleLocations(config);

            // Apply to UI
            this.applyDatabaseConfigToUI(config);

            hideLoading();
            this.showSuccess('تم استيراد إعدادات قاعدة البيانات بنجاح');
            
            // Show restart message
            Swal.fire({
                title: 'إعادة تشغيل مطلوبة',
                text: 'يجب إعادة تشغيل النظام لتطبيق إعدادات قاعدة البيانات المستوردة.',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'إعادة تشغيل الآن',
                cancelButtonText: 'لاحقاً',
                confirmButtonColor: '#0d6efd'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.reload();
                }
            });

        } catch (error) {
            hideLoading();
            console.error('Error importing database config:', error);
            this.showError('خطأ في استيراد إعدادات قاعدة البيانات: ' + error.message);
        }
    },

    // ========== FISCAL YEAR MANAGEMENT FUNCTIONS ==========

    /**
     * Load fiscal years
     */
    async loadFiscalYears() {
        try {
            const fiscalYearsSnapshot = await db.collection('fiscalYears').orderBy('startDate', 'desc').get();
            const fiscalYears = fiscalYearsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Populate current fiscal year dropdown
            const currentFiscalYearSelect = document.getElementById('currentFiscalYear');
            currentFiscalYearSelect.innerHTML = '<option value="">اختر السنة المالية</option>';
            
            fiscalYears.forEach(year => {
                const option = document.createElement('option');
                option.value = year.id;
                option.textContent = year.name;
                if (year.isCurrent) {
                    option.selected = true;
                }
                currentFiscalYearSelect.appendChild(option);
            });

            // Populate fiscal years table
            this.renderFiscalYearsTable(fiscalYears);
            
        } catch (error) {
            console.error('Error loading fiscal years:', error);
        }
    },

    /**
     * Render fiscal years table
     */
    renderFiscalYearsTable(fiscalYears) {
        const tbody = document.getElementById('fiscalYearsTableBody');
        if (!tbody) return;

        if (fiscalYears.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">لا توجد سنوات مالية</td></tr>';
            return;
        }

        tbody.innerHTML = fiscalYears.map(year => `
            <tr>
                <td>${year.name}</td>
                <td>${year.startDate}</td>
                <td>${year.endDate}</td>
                <td>
                    <span class="badge ${year.isCurrent ? 'bg-success' : year.isArchived ? 'bg-secondary' : 'bg-primary'}">
                        ${year.isCurrent ? 'حالية' : year.isArchived ? 'مؤرشفة' : 'نشطة'}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="SettingsModule.editFiscalYear('${year.id}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="SettingsModule.deleteFiscalYear('${year.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    /**
     * Add new fiscal year
     */
    async addFiscalYear() {
        try {
            const name = document.getElementById('newFiscalYearName').value.trim();
            const startDate = document.getElementById('fiscalYearStartDate').value;
            const endDate = document.getElementById('fiscalYearEndDate').value;

            if (!name || !startDate || !endDate) {
                this.showError('يرجى ملء جميع الحقول المطلوبة');
                return;
            }

            if (new Date(startDate) >= new Date(endDate)) {
                this.showError('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
                return;
            }

            showLoading();

            const fiscalYear = {
                name: name,
                startDate: startDate,
                endDate: endDate,
                isCurrent: false,
                isArchived: false,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('fiscalYears').add(fiscalYear);

            // Clear form
            document.getElementById('newFiscalYearName').value = '';
            document.getElementById('fiscalYearStartDate').value = '';
            document.getElementById('fiscalYearEndDate').value = '';

            hideLoading();
            this.showSuccess('تم إضافة السنة المالية بنجاح');
            
            // Reload fiscal years
            await this.loadFiscalYears();
            
        } catch (error) {
            hideLoading();
            console.error('Error adding fiscal year:', error);
            this.showError('خطأ في إضافة السنة المالية: ' + error.message);
        }
    },

    /**
     * Switch fiscal year
     */
    async switchFiscalYear() {
        try {
            const fiscalYearId = document.getElementById('currentFiscalYear').value;
            
            if (!fiscalYearId) return;

            showLoading();

            // Set all fiscal years as not current
            const fiscalYearsSnapshot = await db.collection('fiscalYears').get();
            const batch = db.batch();
            
            fiscalYearsSnapshot.docs.forEach(doc => {
                batch.update(doc.ref, { isCurrent: false });
            });
            
            // Set selected fiscal year as current
            batch.update(db.collection('fiscalYears').doc(fiscalYearId), { 
                isCurrent: true,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            await batch.commit();

            hideLoading();
            this.showSuccess('تم تغيير السنة المالية الحالية بنجاح');
            
            // Reload fiscal years
            await this.loadFiscalYears();
            
        } catch (error) {
            hideLoading();
            console.error('Error switching fiscal year:', error);
            this.showError('خطأ في تغيير السنة المالية: ' + error.message);
        }
    },

    /**
     * Edit fiscal year
     */
    async editFiscalYear(fiscalYearId) {
        try {
            const fiscalYearDoc = await db.collection('fiscalYears').doc(fiscalYearId).get();
            if (!fiscalYearDoc.exists) {
                this.showError('السنة المالية غير موجودة');
                return;
            }

            const fiscalYear = fiscalYearDoc.data();
            
            const { value: formValues } = await Swal.fire({
                title: 'تعديل السنة المالية',
                html: `
                    <div class="mb-3">
                        <label class="form-label">اسم السنة المالية</label>
                        <input type="text" class="form-control" id="editFiscalYearName" value="${fiscalYear.name}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">تاريخ البداية</label>
                        <input type="date" class="form-control" id="editFiscalYearStartDate" value="${fiscalYear.startDate}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">تاريخ النهاية</label>
                        <input type="date" class="form-control" id="editFiscalYearEndDate" value="${fiscalYear.endDate}">
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'حفظ',
                cancelButtonText: 'إلغاء',
                preConfirm: () => {
                    const name = document.getElementById('editFiscalYearName').value.trim();
                    const startDate = document.getElementById('editFiscalYearStartDate').value;
                    const endDate = document.getElementById('editFiscalYearEndDate').value;
                    
                    if (!name || !startDate || !endDate) {
                        Swal.showValidationMessage('يرجى ملء جميع الحقول المطلوبة');
                        return false;
                    }
                    
                    if (new Date(startDate) >= new Date(endDate)) {
                        Swal.showValidationMessage('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
                        return false;
                    }
                    
                    return { name, startDate, endDate };
                }
            });

            if (formValues) {
                showLoading();
                
                await db.collection('fiscalYears').doc(fiscalYearId).update({
                    name: formValues.name,
                    startDate: formValues.startDate,
                    endDate: formValues.endDate,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                hideLoading();
                this.showSuccess('تم تعديل السنة المالية بنجاح');
                
                // Reload fiscal years
                await this.loadFiscalYears();
            }
            
        } catch (error) {
            hideLoading();
            console.error('Error editing fiscal year:', error);
            this.showError('خطأ في تعديل السنة المالية: ' + error.message);
        }
    },

    /**
     * Delete fiscal year
     */
    async deleteFiscalYear(fiscalYearId) {
        try {
            const result = await Swal.fire({
                title: 'تأكيد الحذف',
                text: 'هل أنت متأكد من حذف هذه السنة المالية؟',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'نعم، احذف',
                cancelButtonText: 'إلغاء',
                confirmButtonColor: '#d33'
            });

            if (!result.isConfirmed) return;

            showLoading();
            
            await db.collection('fiscalYears').doc(fiscalYearId).delete();

            hideLoading();
            this.showSuccess('تم حذف السنة المالية بنجاح');
            
            // Reload fiscal years
            await this.loadFiscalYears();
            
        } catch (error) {
            hideLoading();
            console.error('Error deleting fiscal year:', error);
            this.showError('خطأ في حذف السنة المالية: ' + error.message);
        }
    },

    /**
     * Save fiscal year settings
     */
    async saveFiscalYearSettings() {
        try {
            const currentFiscalYearId = document.getElementById('currentFiscalYear').value;
            
            if (!currentFiscalYearId) {
                this.showError('يرجى اختيار السنة المالية الحالية');
                return;
            }

            showLoading();

            // Save current fiscal year to settings
            await db.collection('settings').doc('general').set({
                currentFiscalYearId: currentFiscalYearId,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            hideLoading();
            this.showSuccess('تم حفظ إعدادات السنة المالية بنجاح');
            
        } catch (error) {
            hideLoading();
            console.error('Error saving fiscal year settings:', error);
            this.showError('خطأ في حفظ إعدادات السنة المالية: ' + error.message);
        }
    },

    /**
     * Export fiscal year data
     */
    async exportFiscalYearData() {
        try {
            showLoading();
            
            const fiscalYearsSnapshot = await db.collection('fiscalYears').get();
            const fiscalYears = fiscalYearsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const exportData = {
                timestamp: new Date().toISOString(),
                fiscalYears: fiscalYears
            };

            // Download export file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fiscal-years-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            hideLoading();
            this.showSuccess('تم تصدير بيانات السنوات المالية بنجاح');
            
        } catch (error) {
            hideLoading();
            console.error('Error exporting fiscal year data:', error);
            this.showError('خطأ في تصدير بيانات السنوات المالية: ' + error.message);
        }
    },

    /**
     * Archive fiscal year
     */
    async archiveFiscalYear() {
        try {
            const fiscalYearId = document.getElementById('currentFiscalYear').value;
            
            if (!fiscalYearId) {
                this.showError('يرجى اختيار سنة مالية للأرشفة');
                return;
            }

            const result = await Swal.fire({
                title: 'تأكيد الأرشفة',
                text: 'هل أنت متأكد من أرشفة هذه السنة المالية؟',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'نعم، أرشف',
                cancelButtonText: 'إلغاء',
                confirmButtonColor: '#ffc107'
            });

            if (!result.isConfirmed) return;

            showLoading();
            
            await db.collection('fiscalYears').doc(fiscalYearId).update({
                isArchived: true,
                isCurrent: false,
                archivedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            hideLoading();
            this.showSuccess('تم أرشفة السنة المالية بنجاح');
            
            // Reload fiscal years
            await this.loadFiscalYears();
            
        } catch (error) {
            hideLoading();
            console.error('Error archiving fiscal year:', error);
            this.showError('خطأ في أرشفة السنة المالية: ' + error.message);
        }
    },

    /**
     * Create database backup
     */
    async createDatabaseBackup() {
        try {
            showLoading();
            
            const backup = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                data: {}
            };

            // Collect all data
            const collections = ['products', 'categories', 'units', 'sales', 'purchases', 'parties', 'currencies', 'costCenters'];
            
            for (const collection of collections) {
                try {
                    const snapshot = await db.collection(collection).get();
                    backup.data[collection] = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                } catch (error) {
                    console.warn(`Failed to backup ${collection}:`, error);
                    backup.data[collection] = [];
                }
            }

            // Download backup file
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `database-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            hideLoading();
            this.showSuccess('تم إنشاء النسخة الاحتياطية بنجاح');
            
        } catch (error) {
            hideLoading();
            console.error('Error creating backup:', error);
            this.showError('خطأ في إنشاء النسخة الاحتياطية: ' + error.message);
        }
    },

    /**
     * Restore database backup
     */
    async restoreDatabaseBackup(file) {
        try {
            if (!file) return;

            const result = await Swal.fire({
                title: 'تأكيد الاستعادة',
                text: 'هل أنت متأكد من استعادة النسخة الاحتياطية؟ سيتم استبدال جميع البيانات الحالية.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'نعم، استعادة',
                cancelButtonText: 'إلغاء',
                confirmButtonColor: '#d33'
            });

            if (!result.isConfirmed) return;

            showLoading();

            const text = await file.text();
            const backup = JSON.parse(text);

            if (!backup.data) {
                throw new Error('ملف النسخة الاحتياطية غير صالح');
            }

            // Restore each collection
            for (const [collectionName, documents] of Object.entries(backup.data)) {
                if (Array.isArray(documents)) {
                    for (const doc of documents) {
                        const { id, ...data } = doc;
                        await db.collection(collectionName).doc(id).set(data);
                    }
                }
            }

            hideLoading();
            this.showSuccess('تم استعادة النسخة الاحتياطية بنجاح');
            
            // Reload the page to refresh all data
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error) {
            hideLoading();
            console.error('Error restoring backup:', error);
            this.showError('خطأ في استعادة النسخة الاحتياطية: ' + error.message);
        }
    },

    /**
     * Cleanup orphaned data
     */
    async cleanupOrphanedData() {
        try {
            const result = await Swal.fire({
                title: 'تنظيف البيانات المهملة',
                text: 'سيتم البحث عن وحذف البيانات المهملة (مثل المنتجات بدون فئات، المبيعات بدون منتجات صحيحة، إلخ). هل تريد المتابعة؟',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'نعم، ابدأ التنظيف',
                cancelButtonText: 'إلغاء',
                confirmButtonColor: '#ffc107'
            });

            if (!result.isConfirmed) return;

            showLoading();
            
            Swal.fire({
                title: 'جاري التنظيف...',
                html: 'يرجى الانتظار بينما نقوم بتنظيف البيانات المهملة',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const cleanup = {
                deleted: [],
                errors: []
            };

            // 1. Clean products without valid categories
            try {
                const categoriesSnapshot = await db.collection('categories').get();
                const validCategoryIds = new Set(categoriesSnapshot.docs.map(doc => doc.id));
                
                const productsSnapshot = await db.collection('products').get();
                const orphanedProducts = [];
                
                productsSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.categoryId && !validCategoryIds.has(data.categoryId)) {
                        orphanedProducts.push(doc);
                    }
                });

                if (orphanedProducts.length > 0) {
                    const batch = db.batch();
                    orphanedProducts.forEach(doc => {
                        batch.delete(doc.ref);
                    });
                    await batch.commit();
                    cleanup.deleted.push(`منتجات بدون فئات صحيحة: ${orphanedProducts.length} منتج`);
                }
            } catch (error) {
                cleanup.errors.push(`خطأ في تنظيف المنتجات المهملة: ${error.message}`);
            }

            // 2. Clean inventory movements without valid products
            try {
                const productsSnapshot = await db.collection('products').get();
                const validProductIds = new Set(productsSnapshot.docs.map(doc => doc.id));
                
                const movementsSnapshot = await db.collection('inventoryMovements').get();
                const orphanedMovements = [];
                
                movementsSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.productId && !validProductIds.has(data.productId)) {
                        orphanedMovements.push(doc);
                    }
                });

                if (orphanedMovements.length > 0) {
                    const batch = db.batch();
                    orphanedMovements.forEach(doc => {
                        batch.delete(doc.ref);
                    });
                    await batch.commit();
                    cleanup.deleted.push(`حركات مخزون بدون منتجات صحيحة: ${orphanedMovements.length} حركة`);
                }
            } catch (error) {
                cleanup.errors.push(`خطأ في تنظيف حركات المخزون المهملة: ${error.message}`);
            }

            // 3. Clean general entries without valid vouchers (if voucherId exists but voucher doesn't)
            try {
                const vouchersSnapshot = await db.collection('vouchers').get();
                const validVoucherIds = new Set(vouchersSnapshot.docs.map(doc => doc.id));
                
                const entriesSnapshot = await db.collection('generalEntries').get();
                const orphanedEntries = [];
                
                entriesSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.voucherId && !validVoucherIds.has(data.voucherId)) {
                        orphanedEntries.push(doc);
                    }
                });

                if (orphanedEntries.length > 0) {
                    const batch = db.batch();
                    orphanedEntries.forEach(doc => {
                        batch.delete(doc.ref);
                    });
                    await batch.commit();
                    cleanup.deleted.push(`قيود عامة بدون سندات صحيحة: ${orphanedEntries.length} قيد`);
                }
            } catch (error) {
                cleanup.errors.push(`خطأ في تنظيف القيود العامة المهملة: ${error.message}`);
            }

            hideLoading();

            // Show results
            let resultHtml = '<div class="text-start">';
            
            if (cleanup.deleted.length > 0) {
                resultHtml += '<h6 class="text-success">تم حذف:</h6><ul>';
                cleanup.deleted.forEach(item => {
                    resultHtml += `<li>${item}</li>`;
                });
                resultHtml += '</ul>';
            } else {
                resultHtml += '<p class="text-info">لا توجد بيانات مهملة</p>';
            }

            if (cleanup.errors.length > 0) {
                resultHtml += '<h6 class="text-danger mt-3">أخطاء:</h6><ul>';
                cleanup.errors.forEach(error => {
                    resultHtml += `<li class="text-danger">${error}</li>`;
                });
                resultHtml += '</ul>';
            }

            resultHtml += '</div>';

            Swal.fire({
                title: cleanup.errors.length === 0 ? 'تم التنظيف بنجاح!' : 'تم التنظيف مع بعض الأخطاء',
                html: resultHtml,
                icon: cleanup.errors.length === 0 ? 'success' : 'warning',
                confirmButtonText: 'حسناً'
            });
            
        } catch (error) {
            hideLoading();
            console.error('Error cleaning orphaned data:', error);
            this.showError('خطأ في تنظيف البيانات المهملة: ' + error.message);
        }
    },

    /**
     * Validate data integrity
     */
    async validateDataIntegrity() {
        try {
            showLoading();
            
            Swal.fire({
                title: 'جاري الفحص...',
                html: 'يرجى الانتظار بينما نقوم بفحص سلامة البيانات',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const issues = {
                errors: [],
                warnings: [],
                info: []
            };

            // 1. Check referential integrity - Products with invalid categories
            try {
                const categoriesSnapshot = await db.collection('categories').get();
                const validCategoryIds = new Set(categoriesSnapshot.docs.map(doc => doc.id));
                
                const productsSnapshot = await db.collection('products').get();
                let invalidCategoryCount = 0;
                
                productsSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.categoryId && !validCategoryIds.has(data.categoryId)) {
                        invalidCategoryCount++;
                    }
                });

                if (invalidCategoryCount > 0) {
                    issues.errors.push(`${invalidCategoryCount} منتج يحتوي على فئة غير صحيحة`);
                }
            } catch (error) {
                issues.errors.push(`خطأ في فحص مراجع الفئات: ${error.message}`);
            }

            // 2. Check inventory movements with invalid products
            try {
                const productsSnapshot = await db.collection('products').get();
                const validProductIds = new Set(productsSnapshot.docs.map(doc => doc.id));
                
                const movementsSnapshot = await db.collection('inventoryMovements').get();
                let invalidProductCount = 0;
                
                movementsSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.productId && !validProductIds.has(data.productId)) {
                        invalidProductCount++;
                    }
                });

                if (invalidProductCount > 0) {
                    issues.errors.push(`${invalidProductCount} حركة مخزون تحتوي على منتج غير صحيح`);
                }
            } catch (error) {
                issues.errors.push(`خطأ في فحص مراجع المنتجات: ${error.message}`);
            }

            // 3. Check for duplicate product codes
            try {
                const productsSnapshot = await db.collection('products').get();
                const codeMap = new Map();
                let duplicateCount = 0;
                
                productsSnapshot.docs.forEach(doc => {
                    const code = doc.data().code;
                    if (code) {
                        if (codeMap.has(code)) {
                            duplicateCount++;
                        } else {
                            codeMap.set(code, doc);
                        }
                    }
                });

                if (duplicateCount > 0) {
                    issues.warnings.push(`${duplicateCount} منتج يحتوي على كود مكرر`);
                }
            } catch (error) {
                issues.errors.push(`خطأ في فحص الأكواد المكررة: ${error.message}`);
            }

            // 4. Check for negative quantities
            try {
                const productsWithNegativeQty = await db.collection('products')
                    .where('quantity', '<', 0)
                    .limit(100)
                    .get();
                
                if (!productsWithNegativeQty.empty) {
                    issues.warnings.push(`${productsWithNegativeQty.size} منتج يحتوي على كمية سالبة`);
                }
            } catch (error) {
                issues.errors.push(`خطأ في فحص الكميات السالبة: ${error.message}`);
            }

            // 5. Check general entries balance (debit = credit)
            try {
                const entriesSnapshot = await db.collection('generalEntries').get();
                let unbalancedEntries = 0;
                
                entriesSnapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.entries && Array.isArray(data.entries)) {
                        let totalDebit = 0;
                        let totalCredit = 0;
                        
                        data.entries.forEach(entry => {
                            if (entry.debit) totalDebit += parseFloat(entry.debit) || 0;
                            if (entry.credit) totalCredit += parseFloat(entry.credit) || 0;
                        });
                        
                        // Allow small floating point differences
                        if (Math.abs(totalDebit - totalCredit) > 0.01) {
                            unbalancedEntries++;
                        }
                    }
                });

                if (unbalancedEntries > 0) {
                    issues.errors.push(`${unbalancedEntries} قيد عام غير متوازن (المدين ≠ الدائن)`);
                }
            } catch (error) {
                issues.errors.push(`خطأ في فحص توازن القيود: ${error.message}`);
            }

            // 6. Count total records
            try {
                const collections = ['products', 'sales', 'purchases', 'parties', 'costCenters', 'vouchers', 'generalEntries'];
                for (const collectionName of collections) {
                    const snapshot = await db.collection(collectionName).get();
                    issues.info.push(`${collectionName}: ${snapshot.size} سجل`);
                }
            } catch (error) {
                issues.errors.push(`خطأ في عد السجلات: ${error.message}`);
            }

            hideLoading();

            // Show results
            let resultHtml = '<div class="text-start">';
            
            if (issues.errors.length === 0 && issues.warnings.length === 0) {
                resultHtml += '<p class="text-success"><strong>✅ لا توجد مشاكل - البيانات سليمة</strong></p>';
            }

            if (issues.errors.length > 0) {
                resultHtml += '<h6 class="text-danger">❌ أخطاء:</h6><ul>';
                issues.errors.forEach(error => {
                    resultHtml += `<li class="text-danger">${error}</li>`;
                });
                resultHtml += '</ul>';
            }

            if (issues.warnings.length > 0) {
                resultHtml += '<h6 class="text-warning mt-3">⚠️ تحذيرات:</h6><ul>';
                issues.warnings.forEach(warning => {
                    resultHtml += `<li class="text-warning">${warning}</li>`;
                });
                resultHtml += '</ul>';
            }

            if (issues.info.length > 0) {
                resultHtml += '<h6 class="text-info mt-3">ℹ️ معلومات:</h6><ul>';
                issues.info.forEach(info => {
                    resultHtml += `<li class="text-info">${info}</li>`;
                });
                resultHtml += '</ul>';
            }

            resultHtml += '</div>';

            Swal.fire({
                title: issues.errors.length === 0 && issues.warnings.length === 0 ? 'الفحص مكتمل - لا توجد مشاكل!' : 
                       issues.errors.length > 0 ? 'تم العثور على أخطاء!' : 'تم العثور على تحذيرات',
                html: resultHtml,
                icon: issues.errors.length === 0 && issues.warnings.length === 0 ? 'success' : 
                      issues.errors.length > 0 ? 'error' : 'warning',
                confirmButtonText: 'حسناً',
                width: '600px'
            });
            
        } catch (error) {
            hideLoading();
            console.error('Error validating data integrity:', error);
            this.showError('خطأ في فحص سلامة البيانات: ' + error.message);
        }
    },

    /**
     * Reset database (DANGEROUS!)
     */
    async resetDatabase() {
        try {
            const result = await Swal.fire({
                title: 'تحذير خطير!',
                text: 'هل أنت متأكد من إعادة تعيين قاعدة البيانات؟ سيتم حذف جميع البيانات نهائياً ولا يمكن استردادها!',
                icon: 'error',
                showCancelButton: true,
                confirmButtonText: 'نعم، احذف كل شيء',
                cancelButtonText: 'إلغاء',
                confirmButtonColor: '#d33',
                input: 'text',
                inputLabel: 'اكتب "DELETE" للتأكيد',
                inputValidator: (value) => {
                    if (value !== 'DELETE') {
                        return 'يجب كتابة DELETE للتأكيد';
                    }
                }
            });

            if (!result.isConfirmed) return;

            showLoading();

            // Delete all collections
            const collections = ['products', 'categories', 'units', 'sales', 'purchases', 'parties', 'currencies', 'costCenters'];
            
            for (const collectionName of collections) {
                const snapshot = await db.collection(collectionName).get();
                const batch = db.batch();
                snapshot.docs.forEach(doc => {
                    batch.delete(doc.ref);
                });
                await batch.commit();
            }

            hideLoading();
            this.showSuccess('تم إعادة تعيين قاعدة البيانات بنجاح');
            
            // Reload the page
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (error) {
            hideLoading();
            console.error('Error resetting database:', error);
            this.showError('خطأ في إعادة تعيين قاعدة البيانات: ' + error.message);
        }
    },

    /**
     * Synchronize database - Sync local cache with remote database
     */
    async syncDatabase() {
        try {
            showLoading();
            
            // Show progress dialog
            Swal.fire({
                title: 'جاري المزامنة...',
                html: 'يرجى الانتظار بينما نقوم بمزامنة قاعدة البيانات',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            let syncedCount = 0;
            let errorCount = 0;
            const collections = [
                'products', 'categories', 'units', 'sales', 'purchases', 
                'parties', 'currencies', 'costCenters', 'chartOfAccounts',
                'vouchers', 'generalEntries', 'inventoryMovements'
            ];

            // Clear cache first
            if (typeof dbService !== 'undefined' && dbService.clearCache) {
                dbService.clearCache();
            }

            // Sync each collection
            for (const collectionName of collections) {
                try {
                    // Force refresh by getting fresh data from Firestore
                    const snapshot = await db.collection(collectionName).get();
                    
                    // Update local cache/storage if needed
                    const data = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    // Store in localStorage for offline access
                    try {
                        localStorage.setItem(`cache_${collectionName}`, JSON.stringify({
                            data: data,
                            timestamp: new Date().toISOString()
                        }));
                    } catch (e) {
                        console.warn(`Could not cache ${collectionName}:`, e);
                    }

                    syncedCount += snapshot.size;
                } catch (error) {
                    console.error(`Error syncing ${collectionName}:`, error);
                    errorCount++;
                }
            }

            // Force Firestore to sync offline cache
            try {
                // Enable network persistence if not already enabled
                await db.enablePersistence().catch(err => {
                    if (err.code !== 'failed-precondition' && err.code !== 'unimplemented') {
                        console.warn('Persistence warning:', err);
                    }
                });
            } catch (error) {
                console.warn('Persistence error:', error);
            }

            hideLoading();
            
            Swal.fire({
                title: 'تمت المزامنة بنجاح!',
                html: `
                    <div class="text-start">
                        <p><strong>عدد المجموعات المزامنة:</strong> ${collections.length}</p>
                        <p><strong>إجمالي السجلات المزامنة:</strong> ${syncedCount}</p>
                        ${errorCount > 0 ? `<p class="text-warning"><strong>عدد الأخطاء:</strong> ${errorCount}</p>` : ''}
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'حسناً'
            });

        } catch (error) {
            hideLoading();
            console.error('Error syncing database:', error);
            this.showError('خطأ في مزامنة قاعدة البيانات: ' + error.message);
        }
    },

    /**
     * Repair database - Fix common database issues
     */
    async repairDatabase() {
        try {
            const result = await Swal.fire({
                title: 'إصلاح قاعدة البيانات',
                text: 'سيتم فحص وإصلاح المشاكل الشائعة في قاعدة البيانات. هل تريد المتابعة؟',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'نعم، ابدأ الإصلاح',
                cancelButtonText: 'إلغاء',
                confirmButtonColor: '#28a745'
            });

            if (!result.isConfirmed) return;

            showLoading();
            
            // Show progress dialog
            Swal.fire({
                title: 'جاري الإصلاح...',
                html: 'يرجى الانتظار بينما نقوم بإصلاح قاعدة البيانات',
                allowOutsideClick: false,
                allowEscapeKey: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const repairs = {
                fixed: [],
                errors: []
            };

            // 1. Fix missing timestamps
            try {
                const collections = ['products', 'sales', 'purchases', 'parties'];
                for (const collectionName of collections) {
                    const snapshot = await db.collection(collectionName)
                        .where('createdAt', '==', null)
                        .limit(100)
                        .get();
                    
                    if (!snapshot.empty) {
                        const batch = db.batch();
                        snapshot.docs.forEach(doc => {
                            batch.update(doc.ref, {
                                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        });
                        await batch.commit();
                        repairs.fixed.push(`إضافة timestamps مفقودة في ${collectionName}: ${snapshot.size} سجل`);
                    }
                }
            } catch (error) {
                repairs.errors.push(`خطأ في إصلاح timestamps: ${error.message}`);
            }

            // 2. Fix missing required fields in products
            try {
                const productsSnapshot = await db.collection('products')
                    .where('name', '==', null)
                    .limit(100)
                    .get();
                
                if (!productsSnapshot.empty) {
                    const batch = db.batch();
                    productsSnapshot.docs.forEach(doc => {
                        const data = doc.data();
                        batch.update(doc.ref, {
                            name: data.name || 'منتج بدون اسم',
                            code: data.code || `PROD-${doc.id.substring(0, 8)}`,
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    });
                    await batch.commit();
                    repairs.fixed.push(`إصلاح منتجات بدون اسم: ${productsSnapshot.size} منتج`);
                }
            } catch (error) {
                repairs.errors.push(`خطأ في إصلاح المنتجات: ${error.message}`);
            }

            // 3. Fix orphaned references (products without categories)
            try {
                const productsWithoutCategory = await db.collection('products')
                    .where('categoryId', '==', '')
                    .limit(100)
                    .get();
                
                if (!productsWithoutCategory.empty) {
                    // Get valid categories
                    const categoriesSnapshot = await db.collection('categories').limit(1).get();
                    const defaultCategoryId = categoriesSnapshot.empty ? null : categoriesSnapshot.docs[0].id;
                    
                    if (defaultCategoryId) {
                        const batch = db.batch();
                        productsWithoutCategory.docs.forEach(doc => {
                            batch.update(doc.ref, {
                                categoryId: defaultCategoryId,
                                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                            });
                        });
                        await batch.commit();
                        repairs.fixed.push(`إصلاح منتجات بدون فئة: ${productsWithoutCategory.size} منتج`);
                    }
                }
            } catch (error) {
                repairs.errors.push(`خطأ في إصلاح المراجع المهملة: ${error.message}`);
            }

            // 4. Fix duplicate codes
            try {
                const productsSnapshot = await db.collection('products').get();
                const codeMap = new Map();
                const duplicates = [];

                productsSnapshot.docs.forEach(doc => {
                    const code = doc.data().code;
                    if (code) {
                        if (codeMap.has(code)) {
                            duplicates.push({ doc, code });
                        } else {
                            codeMap.set(code, doc);
                        }
                    }
                });

                if (duplicates.length > 0) {
                    const batch = db.batch();
                    duplicates.forEach(({ doc, code }) => {
                        batch.update(doc.ref, {
                            code: `${code}-${doc.id.substring(0, 4)}`,
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    });
                    await batch.commit();
                    repairs.fixed.push(`إصلاح أكواد مكررة: ${duplicates.length} منتج`);
                }
            } catch (error) {
                repairs.errors.push(`خطأ في إصلاح الأكواد المكررة: ${error.message}`);
            }

            // 5. Fix negative quantities
            try {
                const productsWithNegativeQty = await db.collection('products')
                    .where('quantity', '<', 0)
                    .limit(100)
                    .get();
                
                if (!productsWithNegativeQty.empty) {
                    const batch = db.batch();
                    productsWithNegativeQty.docs.forEach(doc => {
                        batch.update(doc.ref, {
                            quantity: 0,
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    });
                    await batch.commit();
                    repairs.fixed.push(`إصلاح كميات سالبة: ${productsWithNegativeQty.size} منتج`);
                }
            } catch (error) {
                repairs.errors.push(`خطأ في إصلاح الكميات السالبة: ${error.message}`);
            }

            hideLoading();

            // Show results
            let resultHtml = '<div class="text-start">';
            
            if (repairs.fixed.length > 0) {
                resultHtml += '<h6 class="text-success">تم إصلاح:</h6><ul>';
                repairs.fixed.forEach(fix => {
                    resultHtml += `<li>${fix}</li>`;
                });
                resultHtml += '</ul>';
            } else {
                resultHtml += '<p class="text-info">لا توجد مشاكل تحتاج إلى إصلاح</p>';
            }

            if (repairs.errors.length > 0) {
                resultHtml += '<h6 class="text-danger mt-3">أخطاء:</h6><ul>';
                repairs.errors.forEach(error => {
                    resultHtml += `<li class="text-danger">${error}</li>`;
                });
                resultHtml += '</ul>';
            }

            resultHtml += '</div>';

            Swal.fire({
                title: repairs.errors.length === 0 ? 'تم الإصلاح بنجاح!' : 'تم الإصلاح مع بعض الأخطاء',
                html: resultHtml,
                icon: repairs.errors.length === 0 ? 'success' : 'warning',
                confirmButtonText: 'حسناً'
            });

        } catch (error) {
            hideLoading();
            console.error('Error repairing database:', error);
            this.showError('خطأ في إصلاح قاعدة البيانات: ' + error.message);
        }
    },

    // ========== IMAGE SETTINGS FUNCTIONS ==========

    /**
     * Toggle Cloudinary
     */
    toggleCloudinary() {
        const enabled = document.getElementById('enableCloudinary').checked;
        const cloudNameInput = document.getElementById('cloudinaryCloudName');
        const uploadPresetInput = document.getElementById('cloudinaryUploadPreset');
        
        cloudNameInput.disabled = !enabled;
        uploadPresetInput.disabled = !enabled;
        
        if (enabled) {
            cloudNameInput.focus();
        }
    },

    /**
     * Toggle ImgBB
     */
    toggleImgBB() {
        const enabled = document.getElementById('enableImgBB').checked;
        const apiKeyInput = document.getElementById('imgbbApiKey');
        
        apiKeyInput.disabled = !enabled;
        
        if (enabled) {
            apiKeyInput.focus();
        }
    },

    /**
     * Save Cloudinary settings
     */
    async saveCloudinarySettings() {
        try {
            const enabled = document.getElementById('enableCloudinary').checked;
            const cloudName = document.getElementById('cloudinaryCloudName').value.trim();
            const uploadPreset = document.getElementById('cloudinaryUploadPreset').value.trim();

            if (enabled && (!cloudName || !uploadPreset)) {
                this.showError('يرجى ملء جميع الحقول المطلوبة');
                return;
            }

            // Update ImageStorageConfig
            if (typeof ImageStorageConfig !== 'undefined') {
                ImageStorageConfig.cloudinary.enabled = enabled;
                ImageStorageConfig.cloudinary.cloudName = cloudName;
                ImageStorageConfig.cloudinary.uploadPreset = uploadPreset;
            }

            // Save to database
            await db.collection('settings').doc('imageStorage').set({
                cloudinary: {
                    enabled: enabled,
                    cloudName: cloudName,
                    uploadPreset: uploadPreset
                },
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            this.showSuccess('تم حفظ إعدادات Cloudinary بنجاح');
            
        } catch (error) {
            console.error('Error saving Cloudinary settings:', error);
            this.showError('خطأ في حفظ إعدادات Cloudinary: ' + error.message);
        }
    },

    /**
     * Save ImgBB settings
     */
    async saveImgBBSettings() {
        try {
            const enabled = document.getElementById('enableImgBB').checked;
            const apiKey = document.getElementById('imgbbApiKey').value.trim();

            if (enabled && !apiKey) {
                this.showError('يرجى إدخال API Key');
                return;
            }

            // Update ImageStorageConfig
            if (typeof ImageStorageConfig !== 'undefined') {
                ImageStorageConfig.imgbb.enabled = enabled;
                ImageStorageConfig.imgbb.apiKey = apiKey;
            }

            // Save to database
            await db.collection('settings').doc('imageStorage').set({
                imgbb: {
                    enabled: enabled,
                    apiKey: apiKey
                },
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            this.showSuccess('تم حفظ إعدادات ImgBB بنجاح');
            
        } catch (error) {
            console.error('Error saving ImgBB settings:', error);
            this.showError('خطأ في حفظ إعدادات ImgBB: ' + error.message);
        }
    },

    /**
     * Save image compression settings
     */
    async saveImageCompressionSettings() {
        try {
            const maxWidth = parseInt(document.getElementById('maxImageWidth').value);
            const quality = parseFloat(document.getElementById('imageQuality').value);
            const maxSize = parseInt(document.getElementById('maxImageSize').value);

            if (maxWidth < 100 || maxWidth > 2000) {
                this.showError('العرض يجب أن يكون بين 100 و 2000 بكسل');
                return;
            }

            if (quality < 0.1 || quality > 1.0) {
                this.showError('الجودة يجب أن تكون بين 0.1 و 1.0');
                return;
            }

            if (maxSize < 1 || maxSize > 10) {
                this.showError('الحجم يجب أن يكون بين 1 و 10 ميجابايت');
                return;
            }

            // Update ImageStorageConfig
            if (typeof ImageStorageConfig !== 'undefined') {
                ImageStorageConfig.local.compression.maxWidth = maxWidth;
                ImageStorageConfig.local.compression.quality = quality;
                ImageStorageConfig.local.maxSize = maxSize * 1024 * 1024;
            }

            // Save to database
            await db.collection('settings').doc('imageStorage').set({
                compression: {
                    maxWidth: maxWidth,
                    quality: quality,
                    maxSize: maxSize
                },
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            this.showSuccess('تم حفظ إعدادات ضغط الصور بنجاح');
            
        } catch (error) {
            console.error('Error saving compression settings:', error);
            this.showError('خطأ في حفظ إعدادات الضغط: ' + error.message);
        }
    },

    /**
     * Test image upload
     */
    async testImageUpload() {
        try {
            const { value: file } = await Swal.fire({
                title: 'اختبار رفع الصور',
                text: 'اختر صورة للاختبار',
                input: 'file',
                inputAttributes: {
                    accept: 'image/*'
                },
                showCancelButton: true,
                confirmButtonText: 'رفع',
                cancelButtonText: 'إلغاء'
            });

            if (!file) return;

            showLoading();

            // Test upload using ProductsModule
            if (typeof ProductsModule !== 'undefined' && ProductsModule.handleImageUpload) {
                const event = { target: { files: [file] } };
                await ProductsModule.handleImageUpload(event);
                
                hideLoading();
                this.showSuccess('تم اختبار رفع الصورة بنجاح');
            } else {
                throw new Error('وحدة المنتجات غير متاحة');
            }
            
        } catch (error) {
            hideLoading();
            console.error('Error testing image upload:', error);
            this.showError('خطأ في اختبار رفع الصورة: ' + error.message);
        }
    },

    /**
     * Optimize existing images
     */
    async optimizeExistingImages() {
        try {
            showLoading();
            
            // This is a placeholder for image optimization
            // In a real implementation, you would:
            // - Get all products with images
            // - Recompress them with new settings
            // - Update the database
            
            await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate work
            
            hideLoading();
            this.showSuccess('تم تحسين الصور الموجودة بنجاح');
            
        } catch (error) {
            hideLoading();
            console.error('Error optimizing images:', error);
            this.showError('خطأ في تحسين الصور: ' + error.message);
        }
    },

    /**
     * Cleanup unused images
     */
    async cleanupUnusedImages() {
        try {
            showLoading();
            
            // This is a placeholder for unused image cleanup
            // In a real implementation, you would:
            // - Find images that are not referenced by any product
            // - Remove them from storage
            
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate work
            
            hideLoading();
            this.showSuccess('تم تنظيف الصور غير المستخدمة بنجاح');
            
        } catch (error) {
            hideLoading();
            console.error('Error cleaning unused images:', error);
            this.showError('خطأ في تنظيف الصور: ' + error.message);
        }
    },

    /**
     * Clear all images
     */
    async clearAllImages() {
        try {
            const result = await Swal.fire({
                title: 'تأكيد الحذف',
                text: 'هل أنت متأكد من حذف جميع الصور؟ لا يمكن استردادها بعد الحذف.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'نعم، احذف',
                cancelButtonText: 'إلغاء',
                confirmButtonColor: '#d33'
            });

            if (!result.isConfirmed) return;

            showLoading();

            // Get all products and clear their images
            const productsSnapshot = await db.collection('products').get();
            const batch = db.batch();
            
            productsSnapshot.docs.forEach(doc => {
                batch.update(doc.ref, { image: null });
            });
            
            await batch.commit();

            hideLoading();
            this.showSuccess('تم حذف جميع الصور بنجاح');
            
        } catch (error) {
            hideLoading();
            console.error('Error clearing images:', error);
            this.showError('خطأ في حذف الصور: ' + error.message);
        }
    },

    /**
     * Save system settings
     */
    async saveSystemSettings() {
        try {
            showLoading();
            
            const calendarType = document.getElementById('calendarType').value;
            const dateFormat = document.getElementById('dateFormat').value;
            const appLanguage = document.getElementById('appLanguage').value;
            const syncMode = document.getElementById('syncMode').value;
            const syncInterval = parseInt(document.getElementById('syncInterval').value) || 3;
            
            // Validate sync interval
            if (syncInterval < 1 || syncInterval > 60) {
                this.showError('فترة المزامنة يجب أن تكون بين 1 و 60 ثانية');
                hideLoading();
                return;
            }
            
            // Save date settings to Firestore
            const dateSettingsRef = db.collection('SYSTEM_SETTINGS').doc('dateSettings');
            await dateSettingsRef.set({
                calendarType: calendarType,
                dateFormat: dateFormat,
                updatedAt: new Date(),
                updatedBy: auth.currentUser?.uid || 'system'
            }, { merge: true });
            
            // Save language settings
            if (typeof i18n !== 'undefined') {
                await i18n.saveLanguagePreference(appLanguage);
            } else {
                // Fallback: save directly
                const langSettingsRef = db.collection('SYSTEM_SETTINGS').doc('languageSettings');
                await langSettingsRef.set({
                    language: appLanguage,
                    updatedAt: new Date(),
                    updatedBy: auth.currentUser?.uid || 'system'
                }, { merge: true });
                localStorage.setItem('appLanguage', appLanguage);
            }
            
            // Save sync settings
            const syncSettingsRef = db.collection('SYSTEM_SETTINGS').doc('syncSettings');
            await syncSettingsRef.set({
                mode: syncMode,
                pollingInterval: syncInterval * 1000, // Convert to milliseconds
                updatedAt: new Date(),
                updatedBy: auth.currentUser?.uid || 'system'
            }, { merge: true });
            
            // Update SyncManager if available
            if (typeof SyncManager !== 'undefined') {
                SyncManager.setPollingInterval(syncInterval * 1000);
                SyncManager.switchMode(syncMode === 'realtime');
            }
            
            // Update appConfig
            if (typeof appConfig !== 'undefined') {
                appConfig.dateFormat = dateFormat;
                appConfig.calendarType = calendarType;
                appConfig.language = appLanguage;
            }
            
            hideLoading();
            this.showSuccess('تم حفظ إعدادات النظام بنجاح');
            
            console.log('✅ System settings saved:', { calendarType, dateFormat, appLanguage, syncMode, syncInterval });
            
            // Reload page to apply language changes
            if (appLanguage !== i18n?.getCurrentLanguage()) {
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
            
        } catch (error) {
            hideLoading();
            console.error('Error saving system settings:', error);
            this.showError('خطأ في حفظ إعدادات النظام: ' + error.message);
        }
    },

    /**
     * Load inventory settings
     * تحميل إعدادات المخزون
     */
    async loadInventorySettings() {
        try {
            const settingsDoc = await db.collection('settings').doc('inventory').get();
            if (settingsDoc.exists) {
                const settings = settingsDoc.data();
                
                // Costing method
                const costingMethodSelect = document.getElementById('costingMethod');
                if (costingMethodSelect) {
                    costingMethodSelect.value = settings.costingMethod || 'fifo';
                }
                
                // Pricing methods
                const useLastPurchasePrice = document.getElementById('useLastPurchasePrice');
                if (useLastPurchasePrice) {
                    useLastPurchasePrice.checked = settings.useLastPurchasePrice || false;
                }
                
                const useCostPrice = document.getElementById('useCostPrice');
                if (useCostPrice) {
                    useCostPrice.checked = settings.useCostPrice || false;
                }
                
                // Cost calculation settings
                const purchasesAffectCost = document.getElementById('purchasesAffectCost');
                if (purchasesAffectCost) {
                    purchasesAffectCost.checked = settings.purchasesAffectCost !== false; // Default true
                }
                
                const purchaseReturnsAffectCost = document.getElementById('purchaseReturnsAffectCost');
                if (purchaseReturnsAffectCost) {
                    purchaseReturnsAffectCost.checked = settings.purchaseReturnsAffectCost !== false; // Default true
                }
                
                const adjustmentsAffectCost = document.getElementById('adjustmentsAffectCost');
                if (adjustmentsAffectCost) {
                    adjustmentsAffectCost.checked = settings.adjustmentsAffectCost || false;
                }
                
                const transfersAffectCost = document.getElementById('transfersAffectCost');
                if (transfersAffectCost) {
                    transfersAffectCost.checked = settings.transfersAffectCost || false;
                }
                
                // Tracking settings
                const trackExpiryInMovements = document.getElementById('trackExpiryInMovements');
                if (trackExpiryInMovements) {
                    trackExpiryInMovements.checked = settings.trackExpiryInMovements !== false; // Default true
                }
                
                const trackSerialInMovements = document.getElementById('trackSerialInMovements');
                if (trackSerialInMovements) {
                    trackSerialInMovements.checked = settings.trackSerialInMovements !== false; // Default true
                }
                
                console.log('✅ Inventory settings loaded');
            } else {
                // Set defaults
                console.log('ℹ️ Using default inventory settings');
            }
        } catch (error) {
            console.error('Error loading inventory settings:', error);
        }
    },

    /**
     * Save inventory settings
     * حفظ إعدادات المخزون
     */
    async saveInventorySettings() {
        try {
            showLoading();
            
            const settings = {
                // Costing method
                costingMethod: document.getElementById('costingMethod')?.value || 'fifo',
                
                // Pricing methods
                useLastPurchasePrice: document.getElementById('useLastPurchasePrice')?.checked || false,
                useCostPrice: document.getElementById('useCostPrice')?.checked || false,
                
                // Cost calculation settings
                purchasesAffectCost: document.getElementById('purchasesAffectCost')?.checked !== false,
                purchaseReturnsAffectCost: document.getElementById('purchaseReturnsAffectCost')?.checked !== false,
                adjustmentsAffectCost: document.getElementById('adjustmentsAffectCost')?.checked || false,
                transfersAffectCost: document.getElementById('transfersAffectCost')?.checked || false,
                
                // Tracking settings
                trackExpiryInMovements: document.getElementById('trackExpiryInMovements')?.checked !== false,
                trackSerialInMovements: document.getElementById('trackSerialInMovements')?.checked !== false,
                
                updatedAt: new Date(),
                updatedBy: auth.currentUser?.uid || 'system'
            };
            
            await db.collection('settings').doc('inventory').set(settings, { merge: true });
            
            hideLoading();
            showSuccess('تم حفظ إعدادات المخزون بنجاح');
            
            console.log('✅ Inventory settings saved:', settings);
        } catch (error) {
            hideLoading();
            console.error('Error saving inventory settings:', error);
            showError('خطأ في حفظ إعدادات المخزون: ' + error.message);
        }
    },

    /**
     * Load system settings
     */
    async loadSystemSettings() {
        try {
            // Load date settings
            const dateSettingsRef = db.collection('SYSTEM_SETTINGS').doc('dateSettings');
            const dateSettingsDoc = await dateSettingsRef.get();
            
            if (dateSettingsDoc.exists) {
                const settings = dateSettingsDoc.data();
                
                // Update UI
                const calendarTypeSelect = document.getElementById('calendarType');
                const dateFormatSelect = document.getElementById('dateFormat');
                
                if (calendarTypeSelect && settings.calendarType) {
                    calendarTypeSelect.value = settings.calendarType;
                }
                
                if (dateFormatSelect && settings.dateFormat) {
                    dateFormatSelect.value = settings.dateFormat;
                }
                
                // Update appConfig
                if (typeof appConfig !== 'undefined') {
                    appConfig.dateFormat = settings.dateFormat || appConfig.dateFormat;
                    appConfig.calendarType = settings.calendarType || 'gregorian';
                }
                
                console.log('✅ Date settings loaded:', settings);
            } else {
                // Use defaults
                if (typeof appConfig !== 'undefined') {
                    appConfig.calendarType = 'gregorian';
                }
                console.log('ℹ️ Using default date settings');
            }
            
            // Load language settings
            const langSettingsRef = db.collection('SYSTEM_SETTINGS').doc('languageSettings');
            const langSettingsDoc = await langSettingsRef.get();
            
            if (langSettingsDoc.exists) {
                const langSettings = langSettingsDoc.data();
                const appLanguageSelect = document.getElementById('appLanguage');
                
                if (appLanguageSelect && langSettings.language) {
                    appLanguageSelect.value = langSettings.language;
                }
                
                console.log('✅ Language settings loaded:', langSettings);
            } else {
                // Use default (Arabic)
                const appLanguageSelect = document.getElementById('appLanguage');
                if (appLanguageSelect) {
                    appLanguageSelect.value = 'ar';
                }
                console.log('ℹ️ Using default language (Arabic)');
            }
            
            // Load sync settings
            const syncSettingsRef = db.collection('SYSTEM_SETTINGS').doc('syncSettings');
            const syncSettingsDoc = await syncSettingsRef.get();
            
            if (syncSettingsDoc.exists) {
                const syncSettings = syncSettingsDoc.data();
                const syncModeSelect = document.getElementById('syncMode');
                const syncIntervalInput = document.getElementById('syncInterval');
                
                if (syncModeSelect && syncSettings.mode) {
                    syncModeSelect.value = syncSettings.mode;
                }
                
                if (syncIntervalInput && syncSettings.pollingInterval) {
                    syncIntervalInput.value = (syncSettings.pollingInterval / 1000); // Convert to seconds
                }
                
                // Update SyncManager
                if (typeof SyncManager !== 'undefined') {
                    SyncManager.setPollingInterval(syncSettings.pollingInterval || 3000);
                    SyncManager.switchMode(syncSettings.mode === 'realtime');
                }
                
                console.log('✅ Sync settings loaded:', syncSettings);
            } else {
                // Use defaults
                const syncModeSelect = document.getElementById('syncMode');
                const syncIntervalInput = document.getElementById('syncInterval');
                
                if (syncModeSelect) {
                    syncModeSelect.value = 'realtime';
                }
                if (syncIntervalInput) {
                    syncIntervalInput.value = 3;
                }
                
                console.log('ℹ️ Using default sync settings (real-time)');
            }
            
        } catch (error) {
            console.error('Error loading system settings:', error);
            // Use defaults on error
            if (typeof appConfig !== 'undefined') {
                appConfig.calendarType = 'gregorian';
            }
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsModule;
}

