/**
 * Purchases Module - Complete Purchases Management
 * @module modules/purchases
 */

// Simple logging utility - only logs in development mode
const Logger = {
    isDevelopment: () => {
        // Check if we're in development mode
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.search.includes('debug=true');
    },
    log: (...args) => {
        if (Logger.isDevelopment()) {
            console.log(...args);
        }
    },
    warn: (...args) => {
        // Always show warnings
        console.warn(...args);
    },
    error: (...args) => {
        // Always show errors
        console.error(...args);
    },
    info: (...args) => {
        if (Logger.isDevelopment()) {
            console.info(...args);
        }
    }
};

const PurchasesModule = {
    // Data storage
    currentTab: 'dashboard',
    purchases: [],
    suppliers: [],
    products: [],
    categories: [],
    units: [],
    currencies: [],
    warehouses: [],
    costCenters: [],
    salesReps: [],
    accounts: [],
    currentPage: 1,
    itemsPerPage: 10,
    editingPurchase: null,
    editingSupplier: null,
    currentPurchaseItems: [],
    currentPurchaseCurrency: 'IQD',
    currentPurchaseExchangeRate: 1,
    copiedRow: null,
    copiedRows: [], // Store multiple copied rows for bulk operations
    currentSalesRepNumber: null, // Track which sales rep picker is open (1 or 2)

    /**
     * Escape HTML to prevent XSS attacks
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    // ✅ Using shared utility function from InvoiceUtils
    escapeHtml(text) {
        return InvoiceUtils.escapeHtml(text);
    },

    getHTML() {
        return `
            <div class="purchases-module">
                <!-- Header -->
                <div class="module-header">
                    <div class="header-content">
                        <div class="header-title">
                            <i class="fas fa-cart-plus"></i>
                            <h2>إدارة المشتريات</h2>
                        </div>
                        <div class="header-actions">
                            <button class="btn btn-primary" id="newPurchaseBtn">
                                <i class="fas fa-plus"></i> إضافة فاتورة شراء
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Navigation Tabs -->
                <ul class="nav nav-tabs" id="purchasesTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="dashboard-tab" data-bs-toggle="tab" data-bs-target="#dashboard" type="button" role="tab">
                            <i class="fas fa-tachometer-alt"></i> لوحة التحكم
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="purchases-tab" data-bs-toggle="tab" data-bs-target="#purchases" type="button" role="tab">
                            <i class="fas fa-shopping-cart"></i> فواتير المشتريات
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="settings-tab" data-bs-toggle="tab" data-bs-target="#settings" type="button" role="tab">
                            <i class="fas fa-cogs"></i> الإعدادات
                        </button>
                    </li>
                </ul>

                <!-- Tab Content -->
                <div class="tab-content" id="purchasesTabContent">
                    <!-- Dashboard Tab -->
                    <div class="tab-pane fade show active" id="dashboard" role="tabpanel">
                        <div class="dashboard-content">
                            <!-- Summary Cards -->
                            <div class="row mb-4">
                                <div class="col-md-3">
                                    <div class="summary-card">
                                        <div class="card-icon">
                                            <i class="fas fa-shopping-cart text-primary"></i>
                                        </div>
                                        <div class="card-content">
                                            <h3 id="totalPurchases">0</h3>
                                            <p>إجمالي المشتريات</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="summary-card">
                                        <div class="card-icon">
                                            <i class="fas fa-dollar-sign text-success"></i>
                                        </div>
                                        <div class="card-content">
                                            <h3 id="totalAmount">0</h3>
                                            <p>إجمالي المبلغ</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="summary-card">
                                        <div class="card-icon">
                                            <i class="fas fa-truck text-warning"></i>
                                        </div>
                                        <div class="card-content">
                                            <h3 id="totalSuppliers">0</h3>
                                            <p>إجمالي الموردين</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="summary-card">
                                        <div class="card-icon">
                                            <i class="fas fa-clock text-info"></i>
                                        </div>
                                        <div class="card-content">
                                            <h3 id="pendingPurchases">0</h3>
                                            <p>مشتريات معلقة</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Recent Purchases -->
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-clock"></i> آخر المشتريات</h5>
                                </div>
                                <div class="card-body">
                                    <div class="table-responsive">
                                        <table class="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>رقم الفاتورة</th>
                                                    <th>التاريخ</th>
                                                    <th>المورد</th>
                                                    <th>المبلغ</th>
                                                    <th>الحالة</th>
                                                    <th>الإجراءات</th>
                                                </tr>
                                            </thead>
                                            <tbody id="recentPurchasesTable">
                                                <tr>
                                                    <td colspan="6" class="text-center text-muted">لا توجد مشتريات</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Purchases Tab -->
                    <div class="tab-pane fade" id="purchases" role="tabpanel">
                        <div class="purchases-content">
                            <!-- Search and Filter -->
                            <div class="row mb-3">
                                <div class="col-md-4">
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                                        <input type="text" class="form-control" id="purchaseSearch" placeholder="البحث في المشتريات...">
                                    </div>
                                </div>
                                <div class="col-md-2">
                                    <input type="date" class="form-control" id="purchaseDateFrom" placeholder="من تاريخ">
                                </div>
                                <div class="col-md-2">
                                    <input type="date" class="form-control" id="purchaseDateTo" placeholder="إلى تاريخ">
                                </div>
                                <div class="col-md-2">
                                    <select class="form-select" id="purchaseStatusFilter">
                                        <option value="">جميع الحالات</option>
                                        <option value="completed">مكتمل</option>
                                        <option value="pending">معلق</option>
                                        <option value="cancelled">ملغي</option>
                                    </select>
                                </div>
                                <div class="col-md-2">
                                    <button class="btn btn-outline-secondary" id="clearPurchaseFilters">
                                        <i class="fas fa-times"></i> مسح الفلاتر
                                    </button>
                                </div>
                            </div>

                            <!-- Purchases Table -->
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-shopping-cart"></i> قائمة المشتريات</h5>
                                </div>
                                <div class="card-body">
                                    <div class="table-responsive">
                                        <table class="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>رقم الفاتورة</th>
                                                    <th>التاريخ</th>
                                                    <th>المورد</th>
                                                    <th>المبلغ الإجمالي</th>
                                                    <th>المدفوع</th>
                                                    <th>المتبقي</th>
                                                    <th>الحالة</th>
                                                    <th>الإجراءات</th>
                                                </tr>
                                            </thead>
                                            <tbody id="purchasesTable">
                                                <tr>
                                                    <td colspan="8" class="text-center text-muted">لا توجد مشتريات</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Settings Tab -->
                    <div class="tab-pane fade" id="settings" role="tabpanel">
                        <div class="settings-content">
                            <div class="settings-header">
                                <h3><i class="fas fa-cogs"></i> إعدادات المشتريات</h3>
                                <p>تكوين الإعدادات الافتراضية لفواتير المشتريات</p>
                            </div>
                            
                            <div class="row">
                                <!-- Default Values Settings -->
                                <div class="col-md-6">
                                    <div class="settings-card">
                                        <div class="card-header">
                                            <h5><i class="fas fa-sliders-h text-primary"></i> القيم الافتراضية</h5>
                                            <p class="text-muted">تحديد القيم الافتراضية لفواتير المشتريات الجديدة</p>
                                        </div>
                                        <div class="card-body">
                                            <!-- Default Currency -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-coins text-warning"></i>
                                                    العملة الافتراضية
                                                </label>
                                                <select class="form-select" id="defaultPurchaseCurrency">
                                                    <option value="IQD">دينار عراقي (IQD)</option>
                                                    <option value="USD">دولار أمريكي (USD)</option>
                                                    <option value="EUR">يورو (EUR)</option>
                                                </select>
                                                <small class="text-muted">
                                                    العملة الافتراضية لفواتير المشتريات الجديدة
                                                </small>
                                            </div>
                                            
                                            <!-- Default Payment Method -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-credit-card text-success"></i>
                                                    طريقة الدفع الافتراضية
                                                </label>
                                                <select class="form-select" id="defaultPaymentMethod">
                                                    <option value="cash">نقدي</option>
                                                    <option value="credit">آجل</option>
                                                </select>
                                                <small class="text-muted">
                                                    طريقة الدفع الافتراضية لفواتير المشتريات الجديدة
                                                </small>
                                            </div>
                                            
                                            <!-- Default Warehouse -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-warehouse text-info"></i>
                                                    المستودع الافتراضي
                                                </label>
                                                <select class="form-select" id="defaultWarehouse">
                                                    <option value="">-- اختر المستودع الافتراضي --</option>
                                                </select>
                                                <small class="text-muted">
                                                    المستودع الافتراضي لتخزين المشتريات الجديدة
                                                </small>
                                            </div>
                                            
                                            <!-- Default Cost Center -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-building text-danger"></i>
                                                    مركز الكلفة الافتراضي
                                                </label>
                                                <select class="form-select" id="defaultCostCenter">
                                                    <option value="">-- اختر مركز الكلفة الافتراضي --</option>
                                                </select>
                                                <small class="text-muted">
                                                    مركز الكلفة الافتراضي لفواتير المشتريات الجديدة
                                                </small>
                                            </div>
                                            
                                            <!-- Save Default Values Button -->
                                            <div class="d-grid">
                                                <button class="btn btn-primary" onclick="PurchasesModule.saveDefaultValues()">
                                                    <i class="fas fa-save"></i> حفظ القيم الافتراضية
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- General Settings -->
                                <div class="col-md-6">
                                    <div class="settings-card">
                                        <div class="card-header">
                                            <h5><i class="fas fa-cog text-info"></i> إعدادات عامة</h5>
                                            <p class="text-muted">تكوين الإعدادات العامة لوحدة المشتريات</p>
                                        </div>
                                        <div class="card-body">
                                            <!-- Auto Generate Invoice Numbers -->
                                            <div class="mb-4">
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input" type="checkbox" id="autoGenerateInvoiceNumbers" checked>
                                                    <label class="form-check-label" for="autoGenerateInvoiceNumbers">
                                                        <i class="fas fa-magic text-primary"></i>
                                                        توليد أرقام الفواتير تلقائياً
                                                    </label>
                                                </div>
                                                <small class="text-muted">
                                                    توليد أرقام فواتير المشتريات تلقائياً عند الإنشاء
                                                </small>
                                            </div>
                                            
                                            <!-- Auto Update Stock -->
                                            <div class="mb-4">
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input" type="checkbox" id="autoUpdateStock" checked>
                                                    <label class="form-check-label" for="autoUpdateStock">
                                                        <i class="fas fa-boxes text-success"></i>
                                                        تحديث المخزون تلقائياً
                                                    </label>
                                                </div>
                                                <small class="text-muted">
                                                    تحديث كميات المخزون تلقائياً عند حفظ فاتورة الشراء
                                                </small>
                                            </div>
                                            
                                            <!-- Auto Generate General Entry -->
                                            <div class="mb-4">
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input" type="checkbox" id="autoGenerateGeneralEntry" checked>
                                                    <label class="form-check-label" for="autoGenerateGeneralEntry">
                                                        <i class="fas fa-balance-scale text-warning"></i>
                                                        توليد القيد العام تلقائياً
                                                    </label>
                                                </div>
                                                <small class="text-muted">
                                                    توليد القيد المحاسبي تلقائياً عند حفظ فاتورة الشراء
                                                </small>
                                            </div>
                                            
                                            <!-- Default Tax Rate -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-percentage text-danger"></i>
                                                    معدل الضريبة الافتراضي
                                                </label>
                                                <input type="number" class="form-control" id="defaultTaxRate" value="0" min="0" max="100" step="0.01">
                                                <small class="text-muted">
                                                    معدل الضريبة الافتراضي لفواتير المشتريات الجديدة (%)
                                                </small>
                                            </div>
                                            
                                            <!-- Default Counter Account (Debit Account) -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-exchange-alt text-secondary"></i>
                                                    الحساب المدين الافتراضي (المشتريات/المخزون)
                                                </label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" id="defaultCounterAccountDisplay" placeholder="اختر من شجرة الحسابات" readonly style="background-color: #f8f9fa;">
                                                    <input type="hidden" id="defaultCounterAccount" value="">
                                                    <button type="button" class="btn btn-outline-secondary" id="openDefaultCounterAccountPicker" title="اختر من شجرة الحسابات">
                                                        <i class="fas fa-sitemap"></i>
                                                    </button>
                                                </div>
                                                <small class="text-muted">
                                                    سيتم استخدام هذا الحساب كمدين مقابل فاتورة الشراء (يمكن تغييره داخل الفاتورة).
                                                </small>
                                            </div>
                                            
                                            <!-- Default Credit Account (for Cash payments) -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-credit-card text-primary"></i>
                                                    الحساب الدائن الافتراضي (للدفع النقدي)
                                                </label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" id="defaultCreditAccountDisplay" placeholder="اختر من شجرة الحسابات" readonly style="background-color: #f8f9fa;">
                                                    <input type="hidden" id="defaultCreditAccount" value="">
                                                    <button type="button" class="btn btn-outline-secondary" id="openDefaultCreditAccountPicker" title="اختر من شجرة الحسابات">
                                                        <i class="fas fa-sitemap"></i>
                                                    </button>
                                                </div>
                                                <small class="text-muted">
                                                    سيتم استخدام هذا الحساب كدائن في حالة الدفع النقدي (مثل: النقدية، الصندوق).
                                                </small>
                                            </div>
                                            
                                            <!-- Default Payment Account (for partial payments) -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-wallet text-success"></i>
                                                    حساب الدفع الافتراضي (للدفعات الجزئية)
                                                </label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" id="defaultPaymentAccountDisplay" placeholder="اختر من شجرة الحسابات" readonly style="background-color: #f8f9fa;">
                                                    <input type="hidden" id="defaultPaymentAccount" value="">
                                                    <button type="button" class="btn btn-outline-secondary" id="openDefaultPaymentAccountPicker" title="اختر من شجرة الحسابات">
                                                        <i class="fas fa-sitemap"></i>
                                                    </button>
                                                </div>
                                                <small class="text-muted">
                                                    سيتم استخدام هذا الحساب كمدين عند إدخال دفعة جزئية (مثل: النقدية، الصندوق، البنك).
                                                </small>
                                            </div>
                                            
                                            <!-- Default Counter Account for Additions -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-plus-circle text-success"></i>
                                                    الحساب المقابل للإضافات (مدين الإضافات)
                                                </label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" id="defaultAdditionCounterAccountDisplay" placeholder="اختر من شجرة الحسابات" readonly style="background-color: #f8f9fa;">
                                                    <input type="hidden" id="defaultAdditionCounterAccount" value="">
                                                    <button type="button" class="btn btn-outline-secondary" id="openDefaultAdditionCounterAccountPicker" title="اختر من شجرة الحسابات">
                                                        <i class="fas fa-sitemap"></i>
                                                    </button>
                                                </div>
                                                <small class="text-muted">
                                                    سيتم استخدام هذا الحساب كمدين مقابل حسابات الإضافات (افتراضي: حساب المورد).
                                                </small>
                                            </div>
                                            
                                            <!-- Default Counter Account for Discounts -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-minus-circle text-danger"></i>
                                                    الحساب المقابل للخصومات (دائن الخصومات)
                                                </label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" id="defaultDiscountCounterAccountDisplay" placeholder="اختر من شجرة الحسابات" readonly style="background-color: #f8f9fa;">
                                                    <input type="hidden" id="defaultDiscountCounterAccount" value="">
                                                    <button type="button" class="btn btn-outline-secondary" id="openDefaultDiscountCounterAccountPicker" title="اختر من شجرة الحسابات">
                                                        <i class="fas fa-sitemap"></i>
                                                    </button>
                                                </div>
                                                <small class="text-muted">
                                                    سيتم استخدام هذا الحساب كدائن مقابل حسابات الخصومات (افتراضي: حساب المورد).
                                                </small>
                                            </div>
                                            
                                            <!-- Save General Settings Button -->
                                            <div class="d-grid">
                                                <button class="btn btn-success" onclick="PurchasesModule.saveGeneralSettings()">
                                                    <i class="fas fa-save"></i> حفظ الإعدادات العامة
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Print Fields Settings -->
                            <div class="row mt-4">
                                <div class="col-12">
                                    <div class="settings-card">
                                        <div class="card-header">
                                            <h5><i class="fas fa-print text-primary"></i> إعدادات الحقول المطبوعة</h5>
                                            <p class="text-muted">اختر الحقول التي تريد طباعتها في فاتورة الشراء</p>
                                        </div>
                                        <div class="card-body">
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <h6 class="mb-3"><i class="fas fa-info-circle text-info"></i> معلومات الفاتورة</h6>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printInvoiceNo" checked>
                                                        <label class="form-check-label" for="printInvoiceNo">
                                                            رقم الفاتورة
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printDate" checked>
                                                        <label class="form-check-label" for="printDate">
                                                            التاريخ
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printPaymentMethod" checked>
                                                        <label class="form-check-label" for="printPaymentMethod">
                                                            طريقة الدفع
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printStatus" checked>
                                                        <label class="form-check-label" for="printStatus">
                                                            الحالة
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printCostCenter" checked>
                                                        <label class="form-check-label" for="printCostCenter">
                                                            مركز الكلفة
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printWarehouse" checked>
                                                        <label class="form-check-label" for="printWarehouse">
                                                            المستودع
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <h6 class="mb-3"><i class="fas fa-user text-success"></i> معلومات المورد</h6>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printSupplierName" checked>
                                                        <label class="form-check-label" for="printSupplierName">
                                                            اسم المورد
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printSupplierPhone" checked>
                                                        <label class="form-check-label" for="printSupplierPhone">
                                                            هاتف المورد
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printSupplierAddress" checked>
                                                        <label class="form-check-label" for="printSupplierAddress">
                                                            عنوان المورد
                                                        </label>
                                                    </div>
                                                    
                                                    <h6 class="mb-3 mt-4"><i class="fas fa-calculator text-warning"></i> المبالغ المالية</h6>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printSubtotal" checked>
                                                        <label class="form-check-label" for="printSubtotal">
                                                            المجموع الفرعي
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printDiscount" checked>
                                                        <label class="form-check-label" for="printDiscount">
                                                            الخصم
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printAddition" checked>
                                                        <label class="form-check-label" for="printAddition">
                                                            الإضافة
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printTotal" checked>
                                                        <label class="form-check-label" for="printTotal">
                                                            الإجمالي
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printPaid" checked>
                                                        <label class="form-check-label" for="printPaid">
                                                            المدفوع
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printRemaining" checked>
                                                        <label class="form-check-label" for="printRemaining">
                                                            المتبقي
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printNotes" checked>
                                                        <label class="form-check-label" for="printNotes">
                                                            الملاحظات
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="row mt-4">
                                                <div class="col-12">
                                                    <h6 class="mb-3"><i class="fas fa-box text-primary"></i> حقول جدول المنتجات</h6>
                                                    <div class="row">
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printProductName" checked>
                                                                <label class="form-check-label" for="printProductName">
                                                                    اسم المنتج
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printProductQuantity" checked>
                                                                <label class="form-check-label" for="printProductQuantity">
                                                                    الكمية
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printProductUnit" checked>
                                                                <label class="form-check-label" for="printProductUnit">
                                                                    الوحدة
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printProductUnitPrice" checked>
                                                                <label class="form-check-label" for="printProductUnitPrice">
                                                                    سعر الوحدة
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printProductNetPrice" checked>
                                                                <label class="form-check-label" for="printProductNetPrice">
                                                                    صافي السعر
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printProductTotal" checked>
                                                                <label class="form-check-label" for="printProductTotal">
                                                                    إجمالي المنتج
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printProductDiscount" checked>
                                                                <label class="form-check-label" for="printProductDiscount">
                                                                    خصم المنتج
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printProductAddition" checked>
                                                                <label class="form-check-label" for="printProductAddition">
                                                                    إضافة المنتج
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printProductExpiryDate" checked>
                                                                <label class="form-check-label" for="printProductExpiryDate">
                                                                    تاريخ الصلاحية
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printProductSerialNumber" checked>
                                                                <label class="form-check-label" for="printProductSerialNumber">
                                                                    الرقم التسلسلي
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printProductNotes" checked>
                                                                <label class="form-check-label" for="printProductNotes">
                                                                    ملاحظات المنتج
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="d-grid mt-4">
                                                <button class="btn btn-primary" onclick="PurchasesModule.savePrintFieldsSettings()">
                                                    <i class="fas fa-save"></i> حفظ إعدادات الحقول المطبوعة
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Quick Actions -->
                            <div class="row mt-4">
                                <div class="col-12">
                                    <div class="settings-card">
                                        <div class="card-header">
                                            <h5><i class="fas fa-bolt text-warning"></i> إجراءات سريعة</h5>
                                        </div>
                                        <div class="card-body">
                                            <div class="row">
                                                <div class="col-md-3">
                                                    <button class="btn btn-outline-primary w-100" onclick="PurchasesModule.resetToDefaults()">
                                                        <i class="fas fa-undo"></i>
                                                        <br>إعادة تعيين الافتراضي
                                                    </button>
                                                </div>
                                                <div class="col-md-3">
                                                    <button class="btn btn-outline-info w-100" onclick="PurchasesModule.exportSettings()">
                                                        <i class="fas fa-download"></i>
                                                        <br>تصدير الإعدادات
                                                    </button>
                                                </div>
                                                <div class="col-md-3">
                                                    <button class="btn btn-outline-success w-100" onclick="PurchasesModule.importSettings()">
                                                        <i class="fas fa-upload"></i>
                                                        <br>استيراد الإعدادات
                                                    </button>
                                                </div>
                                                <div class="col-md-3">
                                                    <button class="btn btn-outline-warning w-100" onclick="PurchasesModule.testSettings()">
                                                        <i class="fas fa-vial"></i>
                                                        <br>اختبار الإعدادات
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    render() {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = this.getHTML();
            this.setupEventListeners();
        }
    },

    async load() {
        Logger.log('🛍️ Loading purchases module...');
        this.render();
        await this.loadData();
        
        // Setup real-time sync
        this.setupPurchasesSync();
        
        Logger.log('✅ Purchases module loaded');
    },

    async loadData() {
        try {
            Logger.log('🔄 Loading purchases data...');
            
            // Load all data in parallel
            await Promise.all([
                this.loadPurchases(),
                this.loadSuppliers(),
                this.loadProducts(),
                this.loadCategories(),
                this.loadUnits(),
                this.loadCurrencies(),
                this.loadWarehouses(),
                this.loadCostCenters(),
                this.loadSalesReps(),
                this.loadAccounts()
            ]);
            
            this.updateDashboard();
            Logger.log('✅ All purchases data loaded successfully');
            Logger.log(`📊 Data summary: ${this.purchases.length} purchases, ${this.suppliers.length} suppliers, ${this.products.length} products, ${this.warehouses.length} warehouses, ${this.costCenters.length} cost centers`);
            
        } catch (error) {
            Logger.error('❌ Error loading purchases data:', error);
        }
    },

    async loadPurchases() {
        try {
            const snapshot = await db.collection('purchases').get();
            this.purchases = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.renderPurchasesTable();
        } catch (error) {
            Logger.error('Error loading purchases:', error);
        }
    },
    
    /**
     * Setup real-time sync for purchases
     */
    setupPurchasesSync() {
        // Register callback with SyncManager
        if (typeof SyncManager !== 'undefined') {
            // Sync purchases
            SyncManager.onCollectionSync('purchases', (data, syncType) => {
                this.purchases = data;
                this.renderPurchasesTable();
                this.updateDashboard();
                Logger.log(`🔄 Purchases updated via ${syncType} sync`);
            });

            // Sync suppliers (from parties)
            SyncManager.onCollectionSync('parties', (data, syncType) => {
                this.suppliers = data
                    .filter(party => party.type === 'supplier' || party.type === 'both')
                    .map(party => ({
                        id: party.id,
                        name: party.name || '',
                        code: party.code || '',
                        phone: party.phone || '',
                        email: party.email || '',
                        address: party.address || '',
                        // ⚠️ CRITICAL: الحفاظ على كل من subAccountId و accountId منفصلين
                        subAccountId: party.subAccountId || null, // ✅ الحساب المرتبط (يُستخدم في المعاملات)
                        accountId: party.accountId || null, // الحساب الرئيسي (لا يُستخدم في المعاملات)
                        balance: party.balance || 0,
                        creditLimit: party.creditLimit || 0,
                        status: party.status || 'active',
                        ...party
                    }));
                if (document.getElementById('suppliersTable')) {
                    this.renderSuppliersTable();
                }
                Logger.log(`🔄 Suppliers updated via ${syncType} sync`);
            });

            // Sync products
            SyncManager.onCollectionSync('products', (data, syncType) => {
                this.products = data;
                Logger.log(`🔄 Products updated via ${syncType} sync`);
            });

            // Sync currencies
            SyncManager.onCollectionSync('currencies', (data, syncType) => {
                this.currencies = data;
                Logger.log(`🔄 Currencies updated via ${syncType} sync`);
            });

            // Sync warehouses
            SyncManager.onCollectionSync('warehouses', (data, syncType) => {
                this.warehouses = data;
                Logger.log(`🔄 Warehouses updated via ${syncType} sync`);
            });

            // Sync cost centers
            SyncManager.onCollectionSync('costCenters', (data, syncType) => {
                this.costCenters = data;
                Logger.log(`🔄 Cost centers updated via ${syncType} sync`);
            });

            // Sync sales reps
            SyncManager.onCollectionSync('salesReps', (data, syncType) => {
                this.salesReps = data;
                Logger.log(`🔄 Sales reps updated via ${syncType} sync`);
            });

            // Sync chart of accounts (not 'accounts' collection)
            SyncManager.onCollectionSync('chartOfAccounts', (data, syncType) => {
                this.accounts = data;
                Logger.log(`🔄 Chart of accounts updated via ${syncType} sync`);
            });
        }
        
        // ✅ Listen to product update events from Products module (with cleanup)
        if (!this._productUpdatedHandler) {
            this._productUpdatedHandler = (event) => {
                const { productId, productData } = event.detail;
                // تحديث قائمة المنتجات المحلية عند تحديث منتج في وحدة المنتجات
                const productIndex = this.products.findIndex(p => p.id === productId);
                if (productIndex !== -1) {
                    this.products[productIndex] = { ...this.products[productIndex], ...productData, id: productId };
                } else if (productData) {
                    // إذا كان منتج جديد، أضفه للقائمة
                    this.products.push({ id: productId, ...productData });
                }
                // إعادة تحميل قائمة المنتجات إذا كانت النافذة مفتوحة
                if (document.getElementById('purchaseModal')?.classList.contains('show')) {
                    // يمكن إعادة تحميل قائمة المنتجات في autocomplete إذا لزم الأمر
                }
            };
            window.addEventListener('productUpdated', this._productUpdatedHandler);
        }

        // ✅ Also listen to custom events (with cleanup)
        if (!this._dataSyncHandler) {
            this._dataSyncHandler = (event) => {
            const { collection, data } = event.detail;
            if (collection === 'purchases') {
                this.purchases = data;
                this.renderPurchasesTable();
                this.updateDashboard();
            } else if (collection === 'parties') {
                this.suppliers = data
                    .filter(party => party.type === 'supplier' || party.type === 'both')
                    .map(party => ({
                        id: party.id,
                        name: party.name || '',
                        code: party.code || '',
                        phone: party.phone || '',
                        email: party.email || '',
                        address: party.address || '',
                        // ⚠️ CRITICAL: الحفاظ على كل من subAccountId و accountId منفصلين
                        subAccountId: party.subAccountId || null, // ✅ الحساب المرتبط (يُستخدم في المعاملات)
                        accountId: party.accountId || null, // الحساب الرئيسي (لا يُستخدم في المعاملات)
                        balance: party.balance || 0,
                        creditLimit: party.creditLimit || 0,
                        status: party.status || 'active',
                        ...party
                    }));
                if (document.getElementById('suppliersTable')) {
                    this.renderSuppliersTable();
                }
            } else if (collection === 'products') {
                this.products = data;
            } else if (collection === 'currencies') {
                this.currencies = data;
            } else if (collection === 'warehouses') {
                this.warehouses = data;
            } else if (collection === 'costCenters') {
                this.costCenters = data;
            } else if (collection === 'salesReps') {
                this.salesReps = data;
            } else if (collection === 'chartOfAccounts') {
                this.accounts = data;
            }
            };
            window.addEventListener('dataSync', this._dataSyncHandler);
        }
    },

    async loadSuppliers() {
        try {
            // Load all parties and filter suppliers in JavaScript to avoid Firebase index requirement
            const snapshot = await db.collection('parties').get();
            const allParties = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Filter suppliers (type === 'supplier' or type === 'both')
            this.suppliers = allParties
                .filter(party => party.type === 'supplier' || party.type === 'both')
                .map(party => ({
                    id: party.id,
                    name: party.name || '',
                    code: party.code || '',
                    phone: party.phone || '',
                    email: party.email || '',
                    address: party.address || '',
                    // ⚠️ CRITICAL: الحفاظ على كل من subAccountId و accountId منفصلين
                    // subAccountId: الحساب الفرعي المرتبط (الحساب النهائي المستخدم في المعاملات)
                    // accountId: الحساب الرئيسي (الحساب الأب في شجرة الحسابات)
                    subAccountId: party.subAccountId || null, // ✅ الحساب المرتبط (يُستخدم في المعاملات)
                    accountId: party.accountId || null, // الحساب الرئيسي (لا يُستخدم في المعاملات)
                    // ✅ accountId للاستخدام في القيد: subAccountId أولاً، ثم accountId كبديل
                    // لكن نستخدم accountId فقط للعرض في الجداول، والقيد يستخدم subAccountId مباشرة
                    balance: party.balance || 0,
                    creditLimit: party.creditLimit || 0,
                    status: party.status || 'active',
                    ...party
                }));
            
            // Only render suppliers table if it exists (for backward compatibility)
            if (document.getElementById('suppliersTable')) {
                this.renderSuppliersTable();
            }
        } catch (error) {
            Logger.error('Error loading suppliers:', error);
        }
    },

    async loadProducts() {
        try {
            const snapshot = await db.collection('products').get();
            this.products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            Logger.error('Error loading products:', error);
        }
    },

    async loadCategories() {
        try {
            const snapshot = await db.collection('categories').get();
            this.categories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            Logger.error('Error loading categories:', error);
        }
    },

    async loadUnits() {
        try {
            const snapshot = await db.collection('units').get();
            this.units = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            Logger.error('Error loading units:', error);
        }
    },

    async loadCurrencies() {
        try {
            const snapshot = await db.collection('currencies').get();
            this.currencies = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            Logger.log(`✅ Loaded ${this.currencies.length} currencies`);
        } catch (error) {
            Logger.error('Error loading currencies:', error);
            this.currencies = [];
        }
    },

    async loadWarehouses() {
        try {
            const warehouses = await Collections.getWarehouses();
            this.warehouses = warehouses;
            Logger.log(`✅ Loaded ${warehouses.length} warehouses`);
        } catch (error) {
            Logger.error('❌ Error loading warehouses:', error);
            this.warehouses = [];
        }
    },

    async loadCostCenters() {
        try {
            const costCenters = await Collections.getCostCenters();
            this.costCenters = costCenters;
            Logger.log(`✅ Loaded ${costCenters.length} cost centers`);
        } catch (error) {
            Logger.error('❌ Error loading cost centers:', error);
            this.costCenters = [];
        }
    },

    async loadSalesReps() {
        try {
            const salesReps = await Collections.getSalesReps();
            this.salesReps = salesReps;
            Logger.log(`✅ Loaded ${salesReps.length} sales reps`);
        } catch (error) {
            Logger.error('❌ Error loading sales reps:', error);
            this.salesReps = [];
        }
    },

    async loadAccounts() {
        try {
            const accounts = await Collections.getAccounts();
            this.accounts = accounts;
            Logger.log(`✅ Loaded ${accounts.length} accounts`);
        } catch (error) {
            Logger.error('❌ Error loading accounts:', error);
            this.accounts = [];
        }
    },


    updateDashboard() {
        document.getElementById('totalPurchases').textContent = this.purchases.length;
        
        // Get base currency for display
        const baseCurrency = this.currencies.find(c => c.isBaseCurrency);
        const baseCurrencySymbol = baseCurrency?.symbol || '';
        
        // Calculate total amount in base currency
        const totalAmount = this.purchases.reduce((sum, purchase) => {
            const purchaseCurrency = purchase.currency || 'IQD';
            const purchaseExchangeRate = purchase.exchangeRate || 1;
            const purchaseTotal = purchase.total || 0;
            
            // Convert to base currency
            const convertedAmount = InvoiceUtils.convertToBaseCurrency(purchaseTotal, purchaseCurrency, purchaseExchangeRate, this.currencies);
            return sum + convertedAmount;
        }, 0);
        
        // Display total amount with base currency symbol
        const totalAmountElement = document.getElementById('totalAmount');
        if (totalAmountElement) {
            totalAmountElement.textContent = formatNumber(totalAmount) + (baseCurrencySymbol ? ' ' + baseCurrencySymbol : '');
        }
        
        document.getElementById('totalSuppliers').textContent = this.suppliers.length;
        
        const pendingPurchases = this.purchases.filter(p => p.status === 'pending').length;
        document.getElementById('pendingPurchases').textContent = pendingPurchases;
        
        this.renderRecentPurchases();
    },

    renderPurchasesTable() {
        // Check if there are any active filters
        const searchTerm = (document.getElementById('purchaseSearch')?.value || '').trim();
        const status = document.getElementById('purchaseStatusFilter')?.value || '';
        const dateFrom = document.getElementById('purchaseDateFrom')?.value || '';
        const dateTo = document.getElementById('purchaseDateTo')?.value || '';
        
        // If any filter is active, use applyPurchaseFilters instead
        if (searchTerm || status || dateFrom || dateTo) {
            this.applyPurchaseFilters();
            return;
        }

        // Otherwise, render all purchases
        const tbody = document.getElementById('purchasesTable');
        if (!tbody) return;

        if (this.purchases.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">لا توجد مشتريات</td></tr>';
            return;
        }

        tbody.innerHTML = this.purchases.map(purchase => {
            const statusClass = purchase.status === 'completed' ? 'success' : purchase.status === 'pending' ? 'warning' : 'danger';
            const statusText = purchase.status === 'completed' ? 'مكتمل' : purchase.status === 'pending' ? 'معلق' : 'ملغي';
            
            return `
                <tr>
                    <td>${purchase.invoiceNo || 'N/A'}</td>
                    <td>${formatDate(purchase.date)}</td>
                    <td>${purchase.supplierName || 'N/A'}</td>
                    <td>${formatNumber(purchase.total || 0)}</td>
                    <td>${formatNumber(purchase.paid || 0)}</td>
                    <td>${formatNumber(purchase.remaining || 0)}</td>
                    <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="PurchasesModule.viewPurchase('${purchase.id}')" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="PurchasesModule.viewPurchaseGeneralEntry('${purchase.id}')" title="عرض القيد العام">
                            <i class="fas fa-file-contract"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="PurchasesModule.printPurchase('${purchase.id}')" title="طباعة الفاتورة">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="PurchasesModule.editPurchase('${purchase.id}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="PurchasesModule.deletePurchase('${purchase.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    renderSuppliersTable() {
        const tbody = document.getElementById('suppliersTable');
        if (!tbody) return;

        if (this.suppliers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">لا توجد موردين</td></tr>';
            return;
        }

        tbody.innerHTML = this.suppliers.map(supplier => {
            const totalPurchases = this.purchases
                .filter(p => p.supplierId === supplier.id)
                .reduce((sum, p) => sum + (p.total || 0), 0);
            
            return `
                <tr>
                    <td>${supplier.name || 'N/A'}</td>
                    <td>${supplier.phone || 'N/A'}</td>
                    <td>${supplier.email || 'N/A'}</td>
                    <td>${supplier.address || 'N/A'}</td>
                    <td>${formatNumber(totalPurchases)}</td>
                    <td><span class="badge bg-${supplier.status === 'active' ? 'success' : 'secondary'}">${supplier.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="PurchasesModule.viewSupplier('${supplier.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="PurchasesModule.editSupplier('${supplier.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    renderRecentPurchases() {
        const tbody = document.getElementById('recentPurchasesTable');
        if (!tbody) return;

        const recentPurchases = this.purchases.slice(0, 5);
        
        if (recentPurchases.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">لا توجد مشتريات</td></tr>';
            return;
        }

        // Get base currency for display
        const baseCurrency = this.currencies.find(c => c.isBaseCurrency);
        const baseCurrencySymbol = baseCurrency?.symbol || '';

        tbody.innerHTML = recentPurchases.map(purchase => {
            const statusClass = purchase.status === 'completed' ? 'success' : purchase.status === 'pending' ? 'warning' : 'danger';
            const statusText = purchase.status === 'completed' ? 'مكتمل' : purchase.status === 'pending' ? 'معلق' : 'ملغي';
            
            // Convert amount to base currency
            const purchaseCurrency = purchase.currency || 'IQD';
            const purchaseExchangeRate = purchase.exchangeRate || 1;
            const purchaseTotal = purchase.total || 0;
            const convertedAmount = InvoiceUtils.convertToBaseCurrency(purchaseTotal, purchaseCurrency, purchaseExchangeRate, this.currencies);
            
            return `
                <tr>
                    <td>${purchase.invoiceNo || 'N/A'}</td>
                    <td>${formatDate(purchase.date)}</td>
                    <td>${purchase.supplierName || 'N/A'}</td>
                    <td>${formatNumber(convertedAmount)}${baseCurrencySymbol ? ' ' + baseCurrencySymbol : ''}</td>
                    <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="PurchasesModule.viewPurchase('${purchase.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('#purchasesTabs button').forEach(button => {
            button.addEventListener('click', async (e) => {
                const target = e.target.getAttribute('data-bs-target');
                if (target) {
                    this.currentTab = target.replace('#', '');
                    // Load settings when settings tab is opened
                    if (this.currentTab === 'settings') {
                        // Reload accounts to ensure we have the latest from chartOfAccounts
                        await this.loadAccounts();
                        await this.loadSettings();
                    }
                }
            });
        });

        // Search functionality
        const purchaseSearch = document.getElementById('purchaseSearch');
        if (purchaseSearch) {
            purchaseSearch.addEventListener('input', () => {
                this.applyPurchaseFilters();
            });
        }

        const supplierSearch = document.getElementById('supplierSearch');
        if (supplierSearch) {
            supplierSearch.addEventListener('input', (e) => {
                this.filterSuppliers(e.target.value);
            });
        }

        // Filter functionality
        const purchaseStatusFilter = document.getElementById('purchaseStatusFilter');
        if (purchaseStatusFilter) {
            purchaseStatusFilter.addEventListener('change', () => {
                this.applyPurchaseFilters();
            });
        }

        // Date filter functionality
        const purchaseDateFrom = document.getElementById('purchaseDateFrom');
        if (purchaseDateFrom) {
            purchaseDateFrom.addEventListener('change', () => {
                this.applyPurchaseFilters();
            });
        }

        const purchaseDateTo = document.getElementById('purchaseDateTo');
        if (purchaseDateTo) {
            purchaseDateTo.addEventListener('change', () => {
                this.applyPurchaseFilters();
            });
        }

        // Clear filters
        const clearPurchaseFilters = document.getElementById('clearPurchaseFilters');
        if (clearPurchaseFilters) {
            clearPurchaseFilters.addEventListener('click', () => {
                this.clearPurchaseFilters();
            });
        }

        const clearSupplierFilters = document.getElementById('clearSupplierFilters');
        if (clearSupplierFilters) {
            clearSupplierFilters.addEventListener('click', () => {
                this.clearSupplierFilters();
            });
        }

        // Action buttons
        const newPurchaseBtn = document.getElementById('newPurchaseBtn');
        if (newPurchaseBtn) {
            newPurchaseBtn.addEventListener('click', () => {
                this.showNewPurchaseModal();
            });
        }

        const newSupplierBtn = document.getElementById('newSupplierBtn');
        if (newSupplierBtn) {
            newSupplierBtn.addEventListener('click', () => {
                this.showNewSupplierModal();
            });
        }

        // Report generation
        const generatePurchaseReport = document.getElementById('generatePurchaseReport');
        if (generatePurchaseReport) {
            generatePurchaseReport.addEventListener('click', () => {
                this.generatePurchaseReport();
            });
        }

        // Account picker buttons in settings (setup as backup)
        this.setupSettingsAccountPickerButtons();
    },

    /**
     * Setup account picker buttons in settings tab
     */
    setupSettingsAccountPickerButtons() {
        // Use event delegation on the settings tab content to avoid multiple listeners
        const settingsTab = document.getElementById('settings');
        if (settingsTab && !settingsTab.dataset.accountPickersSetup) {
            settingsTab.dataset.accountPickersSetup = 'true';
            settingsTab.addEventListener('click', (e) => {
                const target = e.target.closest('button');
                if (!target) return;
                
                if (target.id === 'openDefaultCounterAccountPicker') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openAccountPicker('defaultCounterAccount', 'defaultCounterAccountDisplay');
                } else if (target.id === 'openDefaultCreditAccountPicker') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openAccountPicker('defaultCreditAccount', 'defaultCreditAccountDisplay');
                } else if (target.id === 'openDefaultAdditionCounterAccountPicker') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openAccountPicker('defaultAdditionCounterAccount', 'defaultAdditionCounterAccountDisplay');
                } else if (target.id === 'openDefaultDiscountCounterAccountPicker') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openAccountPicker('defaultDiscountCounterAccount', 'defaultDiscountCounterAccountDisplay');
                } else if (target.id === 'openDefaultPaymentAccountPicker') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openAccountPicker('defaultPaymentAccount', 'defaultPaymentAccountDisplay');
                }
            });
        }
    },

    /**
     * Apply all purchase filters (search, status, date) together
     */
    applyPurchaseFilters() {
        const searchTerm = (document.getElementById('purchaseSearch')?.value || '').trim();
        const status = document.getElementById('purchaseStatusFilter')?.value || '';
        const dateFrom = document.getElementById('purchaseDateFrom')?.value || '';
        const dateTo = document.getElementById('purchaseDateTo')?.value || '';

        let filteredPurchases = [...this.purchases];

        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filteredPurchases = filteredPurchases.filter(purchase => {
                const invoiceNo = (purchase.invoiceNo || '').toLowerCase();
                const supplierName = (purchase.supplierName || '').toLowerCase();
                return invoiceNo.includes(searchLower) || supplierName.includes(searchLower);
            });
        }

        // Apply status filter
        if (status) {
            filteredPurchases = filteredPurchases.filter(purchase => purchase.status === status);
        }

        // Apply date filters
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            fromDate.setHours(0, 0, 0, 0);
            filteredPurchases = filteredPurchases.filter(purchase => {
                if (!purchase.date) return false;
                const purchaseDate = new Date(purchase.date);
                purchaseDate.setHours(0, 0, 0, 0);
                return purchaseDate >= fromDate;
            });
        }

        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            filteredPurchases = filteredPurchases.filter(purchase => {
                if (!purchase.date) return false;
                const purchaseDate = new Date(purchase.date);
                purchaseDate.setHours(0, 0, 0, 0);
                return purchaseDate <= toDate;
            });
        }

        this.renderFilteredPurchases(filteredPurchases);
    },


    renderFilteredPurchases(purchases) {
        const tbody = document.getElementById('purchasesTable');
        if (!tbody) return;

        if (purchases.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">لا توجد مشتريات</td></tr>';
            return;
        }

        tbody.innerHTML = purchases.map(purchase => {
            const statusClass = purchase.status === 'completed' ? 'success' : purchase.status === 'pending' ? 'warning' : 'danger';
            const statusText = purchase.status === 'completed' ? 'مكتمل' : purchase.status === 'pending' ? 'معلق' : 'ملغي';
            
            return `
                <tr>
                    <td>${purchase.invoiceNo || 'N/A'}</td>
                    <td>${formatDate(purchase.date)}</td>
                    <td>${purchase.supplierName || 'N/A'}</td>
                    <td>${formatNumber(purchase.total || 0)}</td>
                    <td>${formatNumber(purchase.paid || 0)}</td>
                    <td>${formatNumber(purchase.remaining || 0)}</td>
                    <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="PurchasesModule.viewPurchase('${purchase.id}')" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="PurchasesModule.viewPurchaseGeneralEntry('${purchase.id}')" title="عرض القيد العام">
                            <i class="fas fa-file-contract"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="PurchasesModule.printPurchase('${purchase.id}')" title="طباعة">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="PurchasesModule.editPurchase('${purchase.id}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="PurchasesModule.deletePurchase('${purchase.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    filterSuppliers(searchTerm) {
        const searchLower = (searchTerm || '').toLowerCase().trim();
        
        if (!searchLower) {
            this.renderSuppliersTable();
            return;
        }

        const filteredSuppliers = this.suppliers.filter(supplier => {
            const name = (supplier.name || '').toLowerCase();
            const phone = (supplier.phone || '').toLowerCase();
            return name.includes(searchLower) || phone.includes(searchLower);
        });
        
        this.renderFilteredSuppliers(filteredSuppliers);
    },

    renderFilteredSuppliers(suppliers) {
        const tbody = document.getElementById('suppliersTable');
        if (!tbody) return;

        if (suppliers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">لا توجد موردين</td></tr>';
            return;
        }

        tbody.innerHTML = suppliers.map(supplier => {
            const totalPurchases = this.purchases
                .filter(p => p.supplierId === supplier.id)
                .reduce((sum, p) => sum + (p.total || 0), 0);
            
            return `
                <tr>
                    <td>${supplier.name || 'N/A'}</td>
                    <td>${supplier.phone || 'N/A'}</td>
                    <td>${supplier.email || 'N/A'}</td>
                    <td>${supplier.address || 'N/A'}</td>
                    <td>${formatNumber(totalPurchases)}</td>
                    <td><span class="badge bg-${supplier.status === 'active' ? 'success' : 'secondary'}">${supplier.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="PurchasesModule.viewSupplier('${supplier.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="PurchasesModule.editSupplier('${supplier.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    clearPurchaseFilters() {
        const purchaseSearch = document.getElementById('purchaseSearch');
        const purchaseDateFrom = document.getElementById('purchaseDateFrom');
        const purchaseDateTo = document.getElementById('purchaseDateTo');
        const purchaseStatusFilter = document.getElementById('purchaseStatusFilter');
        
        if (purchaseSearch) purchaseSearch.value = '';
        if (purchaseDateFrom) purchaseDateFrom.value = '';
        if (purchaseDateTo) purchaseDateTo.value = '';
        if (purchaseStatusFilter) purchaseStatusFilter.value = '';
        
        this.renderPurchasesTable();
    },

    clearSupplierFilters() {
        document.getElementById('supplierSearch').value = '';
        document.getElementById('supplierStatusFilter').value = '';
        this.renderSuppliersTable();
    },


    viewPurchase(purchaseId) {
        const purchase = this.purchases.find(p => p.id === purchaseId);
        if (purchase) {
            Swal.fire({
                title: `فاتورة شراء ${purchase.invoiceNo || 'N/A'}`,
                html: `
                    <div class="text-start">
                        <p><strong>التاريخ:</strong> ${formatDate(purchase.date)}</p>
                        <p><strong>المورد:</strong> ${purchase.supplierName || 'N/A'}</p>
                        <p><strong>المبلغ الإجمالي:</strong> ${formatNumber(purchase.total || 0)}</p>
                        <p><strong>المدفوع:</strong> ${formatNumber(purchase.paid || 0)}</p>
                        <p><strong>المتبقي:</strong> ${formatNumber(purchase.remaining || 0)}</p>
                        <p><strong>الحالة:</strong> ${purchase.status === 'completed' ? 'مكتمل' : purchase.status === 'pending' ? 'معلق' : 'ملغي'}</p>
                    </div>
                `,
                icon: 'info'
            });
        }
    },

    /**
     * Print purchase invoice
     */
    async printPurchase(purchaseId) {
        try {
            let purchase = this.purchases.find(p => p.id === purchaseId);
            if (!purchase) {
                // Try to load from database
                purchase = await Collections.getPurchase(purchaseId);
                if (!purchase) {
                    if (typeof showError === 'function') {
                        showError('فاتورة الشراء غير موجودة');
                    } else {
                        Logger.error('❌ فاتورة الشراء غير موجودة');
                    }
                    return;
                }
            }
            await this.printPurchaseInvoice(purchase);
        } catch (error) {
            Logger.error('Error printing purchase:', error);
            if (typeof showError === 'function') {
                showError('فشل في طباعة الفاتورة: ' + error.message);
            } else {
                Logger.error('❌ فشل في طباعة الفاتورة:', error.message);
            }
        }
    },

    /**
     * Generate and print purchase invoice HTML
     */
    async printPurchaseInvoice(purchase) {
        try {
            // Store reference to main window before opening print window
            const mainWindow = window;
            const self = this;
            
            // Get print fields settings
            const settings = await this.getSettings();
            const printFields = settings.printFields || {
                invoiceNo: true,
                date: true,
                paymentMethod: true,
                status: true,
                costCenter: true,
                warehouse: true,
                supplierName: true,
                supplierPhone: true,
                supplierAddress: true,
                subtotal: true,
                discount: true,
                addition: true,
                total: true,
                paid: true,
                remaining: true,
                notes: true,
                productName: true,
                productQuantity: true,
                productUnit: true,
                productUnitPrice: true,
                productNetPrice: true,
                productTotal: true,
                productDiscount: true,
                productAddition: true,
                productExpiryDate: true,
                productSerialNumber: true,
                productNotes: true
            };
            
            // Get supplier details
            const supplier = this.suppliers.find(s => s.id === purchase.supplierId);
            const warehouse = this.warehouses.find(w => w.id === purchase.warehouseId);
            const costCenter = this.costCenters.find(c => c.id === purchase.costCenterId);
            const currency = this.currencies.find(c => c.code === (purchase.currency || 'IQD'));

            // Build invoice HTML
            const invoiceHTML = `
                <!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>فاتورة شراء ${purchase.invoiceNo || 'N/A'}</title>
                    <style>
                        @media print {
                            body { margin: 0; padding: 20px; }
                            .no-print { display: none !important; }
                            @page { margin: 1cm; }
                        }
                        body {
                            font-family: 'Arial', 'Tahoma', sans-serif;
                            direction: rtl;
                            margin: 0;
                            padding: 20px;
                            background: #fff;
                        }
                        .invoice-container {
                            max-width: 800px;
                            margin: 0 auto;
                            background: #fff;
                            padding: 30px;
                            border: 1px solid #ddd;
                        }
                        .invoice-header {
                            text-align: center;
                            border-bottom: 2px solid #333;
                            padding-bottom: 20px;
                            margin-bottom: 30px;
                        }
                        .invoice-header h1 {
                            margin: 0;
                            font-size: 28px;
                            color: #333;
                        }
                        .invoice-header h2 {
                            margin: 10px 0 0 0;
                            font-size: 20px;
                            color: #666;
                        }
                        .invoice-info {
                            display: flex;
                            justify-content: space-between;
                            margin-bottom: 30px;
                        }
                        .info-section {
                            flex: 1;
                        }
                        .info-section h3 {
                            margin: 0 0 10px 0;
                            font-size: 16px;
                            color: #333;
                            border-bottom: 1px solid #ddd;
                            padding-bottom: 5px;
                        }
                        .info-section p {
                            margin: 5px 0;
                            font-size: 14px;
                            color: #555;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 20px 0;
                        }
                        table th, table td {
                            border: 1px solid #ddd;
                            padding: 10px;
                            text-align: right;
                        }
                        table th {
                            background-color: #f5f5f5;
                            font-weight: bold;
                        }
                        .text-left { text-align: left; }
                        .text-right { text-align: right; }
                        .text-center { text-align: center; }
                        .totals {
                            margin-top: 20px;
                            text-align: left;
                        }
                        .totals table {
                            width: 300px;
                            margin-left: auto;
                        }
                        .totals td {
                            font-weight: bold;
                        }
                        .footer {
                            margin-top: 40px;
                            text-align: center;
                            border-top: 1px solid #ddd;
                            padding-top: 20px;
                            color: #666;
                            font-size: 12px;
                        }
                        .print-actions {
                            text-align: center;
                            margin: 20px 0;
                        }
                        .print-actions button {
                            margin: 0 10px;
                            padding: 10px 20px;
                            font-size: 16px;
                            cursor: pointer;
                        }
                    </style>
                </head>
                <body>
                    <div class="invoice-container">
                        <div class="invoice-header">
                            <h1>فاتورة شراء</h1>
                            ${printFields.invoiceNo ? `<h2>رقم الفاتورة: ${purchase.invoiceNo || 'N/A'}</h2>` : ''}
                        </div>

                        <div class="invoice-info">
                            <div class="info-section">
                                <h3>معلومات الفاتورة</h3>
                                ${printFields.date ? `<p><strong>التاريخ:</strong> ${formatDate(purchase.date)}</p>` : ''}
                                ${printFields.paymentMethod ? `<p><strong>طريقة الدفع:</strong> ${purchase.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}</p>` : ''}
                                ${printFields.status ? `<p><strong>الحالة:</strong> ${purchase.status === 'completed' ? 'مكتمل' : purchase.status === 'pending' ? 'معلق' : 'ملغي'}</p>` : ''}
                                ${printFields.costCenter && costCenter ? `<p><strong>مركز الكلفة:</strong> ${costCenter.name}</p>` : ''}
                            </div>
                            <div class="info-section">
                                <h3>معلومات المورد</h3>
                                ${printFields.supplierName ? `<p><strong>الاسم:</strong> ${supplier?.name || purchase.supplierName || 'N/A'}</p>` : ''}
                                ${printFields.supplierPhone && supplier?.phone ? `<p><strong>الهاتف:</strong> ${supplier.phone}</p>` : ''}
                                ${printFields.supplierAddress && supplier?.address ? `<p><strong>العنوان:</strong> ${supplier.address}</p>` : ''}
                            </div>
                        </div>

                        ${printFields.warehouse && warehouse ? `
                        <div class="info-section">
                            <p><strong>المستودع:</strong> ${warehouse.name}</p>
                        </div>
                        ` : ''}

                        ${(printFields.productName || printFields.productQuantity || printFields.productUnit || printFields.productUnitPrice || printFields.productNetPrice || printFields.productTotal || printFields.productDiscount || printFields.productAddition || printFields.productExpiryDate || printFields.productSerialNumber || printFields.productNotes) ? `
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    ${printFields.productName ? '<th>المنتج</th>' : ''}
                                    ${printFields.productQuantity ? '<th>الكمية</th>' : ''}
                                    ${printFields.productUnit ? '<th>الوحدة</th>' : ''}
                                    ${printFields.productUnitPrice ? '<th>سعر الوحدة</th>' : ''}
                                    ${printFields.productNetPrice ? '<th>صافي السعر</th>' : ''}
                                    ${printFields.productDiscount ? '<th>الخصم</th>' : ''}
                                    ${printFields.productAddition ? '<th>الإضافة</th>' : ''}
                                    ${printFields.productTotal ? '<th>الإجمالي</th>' : ''}
                                    ${printFields.productExpiryDate ? '<th>تاريخ الصلاحية</th>' : ''}
                                    ${printFields.productSerialNumber ? '<th>الرقم التسلسلي</th>' : ''}
                                    ${printFields.productNotes ? '<th>ملاحظات</th>' : ''}
                                </tr>
                            </thead>
                            <tbody>
                                ${(purchase.items || []).map((item, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        ${printFields.productName ? `<td>${item.productName || 'N/A'}</td>` : ''}
                                        ${printFields.productQuantity ? `<td>${formatNumber(item.quantity || 0)}</td>` : ''}
                                        ${printFields.productUnit ? `<td>${item.unitName || 'N/A'}</td>` : ''}
                                        ${printFields.productUnitPrice ? `<td>${formatNumber(item.unitPrice || 0)} ${currency?.code || 'IQD'}</td>` : ''}
                                        ${printFields.productNetPrice ? `<td>${formatNumber(item.netPrice || 0)} ${currency?.code || 'IQD'}</td>` : ''}
                                        ${printFields.productDiscount ? `<td>${(item.discountAmount || 0) > 0 ? '-' + formatNumber(item.discountAmount || 0) + ' ' + (currency?.code || 'IQD') : '-'}</td>` : ''}
                                        ${printFields.productAddition ? `<td>${(item.additionAmount || 0) > 0 ? '+' + formatNumber(item.additionAmount || 0) + ' ' + (currency?.code || 'IQD') : '-'}</td>` : ''}
                                        ${printFields.productTotal ? `<td>${formatNumber(item.total || 0)} ${currency?.code || 'IQD'}</td>` : ''}
                                        ${printFields.productExpiryDate ? `<td>${item.expiryDate ? formatDate(item.expiryDate) : '-'}</td>` : ''}
                                        ${printFields.productSerialNumber ? `<td>${item.serialNumber || '-'}</td>` : ''}
                                        ${printFields.productNotes ? `<td>${item.notes || '-'}</td>` : ''}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        ` : '<p class="text-muted text-center">لا توجد منتجات للعرض</p>'}

                        <div class="totals">
                            <table>
                                ${printFields.subtotal ? `
                                <tr>
                                    <td>المجموع الفرعي:</td>
                                    <td>${formatNumber(purchase.subtotal || 0)} ${currency?.code || 'IQD'}</td>
                                </tr>
                                ` : ''}
                                ${printFields.discount && (purchase.discount || 0) > 0 ? `
                                <tr>
                                    <td>الخصم:</td>
                                    <td>-${formatNumber(purchase.discount || 0)} ${currency?.code || 'IQD'}</td>
                                </tr>
                                ` : ''}
                                ${printFields.addition && (purchase.addition || 0) > 0 ? `
                                <tr>
                                    <td>الإضافة:</td>
                                    <td>+${formatNumber(purchase.addition || 0)} ${currency?.code || 'IQD'}</td>
                                </tr>
                                ` : ''}
                                ${printFields.total ? `
                                <tr>
                                    <td><strong>الإجمالي:</strong></td>
                                    <td><strong>${formatNumber(purchase.total || 0)} ${currency?.code || 'IQD'}</strong></td>
                                </tr>
                                ` : ''}
                                ${printFields.paid ? `
                                <tr>
                                    <td>المدفوع:</td>
                                    <td>${formatNumber(purchase.paid || 0)} ${currency?.code || 'IQD'}</td>
                                </tr>
                                ` : ''}
                                ${printFields.remaining ? `
                                <tr>
                                    <td>المتبقي:</td>
                                    <td>${formatNumber(purchase.remaining || 0)} ${currency?.code || 'IQD'}</td>
                                </tr>
                                ` : ''}
                            </table>
                        </div>

                        ${printFields.notes && purchase.notes ? `
                        <div class="info-section" style="margin-top: 20px;">
                            <h3>ملاحظات</h3>
                            <p>${purchase.notes}</p>
                        </div>
                        ` : ''}

                        <div class="footer">
                            <p>شكراً لتعاملكم معنا</p>
                            <p>تم الطباعة في: ${formatDateTime(new Date())}</p>
                        </div>
                    </div>

                    <div class="print-actions no-print">
                        <button onclick="window.print()">طباعة</button>
                        <button onclick="window.close()">إغلاق</button>
                    </div>
                </body>
                </html>
            `;

            // Open print window
            const printWindow = mainWindow.open('', '_blank', 'width=800,height=600');
            if (!printWindow) {
                throw new Error('فشل في فتح نافذة الطباعة. يرجى السماح للنوافذ المنبثقة.');
            }
            
            printWindow.document.write(invoiceHTML);
            printWindow.document.close();
            
            // Flag to track if focus has been restored to avoid duplicate calls
            let focusRestored = false;
            
            // Function to restore focus to main window (only once)
            const restoreFocus = () => {
                if (focusRestored) return; // Already restored, skip
                
                try {
                    // Use requestAnimationFrame to ensure DOM is ready
                    requestAnimationFrame(() => {
                        try {
                            if (mainWindow && !mainWindow.closed && mainWindow.document) {
                                // Try multiple methods to restore focus
                                mainWindow.focus();
                                
                                // Also try to focus on body
                                if (mainWindow.document.body) {
                                    mainWindow.document.body.focus();
                                }
                                
                                // Also try to blur print window if it exists
                                if (printWindow && !printWindow.closed) {
                                    try {
                                        printWindow.blur();
                                    } catch (e) {
                                        // Ignore blur errors
                                    }
                                }
                                
                                focusRestored = true; // Mark as restored
                            }
                        } catch (e) {
                            Logger.warn('⚠️ Could not restore focus:', e);
                        }
                    });
                } catch (e) {
                    Logger.warn('⚠️ Error in restoreFocus:', e);
                }
            };
            
            // Wait for content to load, then print
            printWindow.onload = () => {
                setTimeout(() => {
                    try {
                        printWindow.print();
                        // After print dialog closes (or is cancelled), restore focus
                        // Single attempt after a reasonable delay
                        setTimeout(() => {
                            restoreFocus();
                        }, 500);
                    } catch (printError) {
                        Logger.error('❌ Error printing:', printError);
                        // Restore focus even on error
                        restoreFocus();
                    }
                }, 250);
            };
            
            // Fallback: if onload doesn't fire, try after a delay
            setTimeout(() => {
                if (printWindow && !printWindow.closed) {
                    try {
                        printWindow.print();
                        // After print dialog closes, restore focus (single attempt)
                        setTimeout(() => {
                            restoreFocus();
                        }, 500);
                    } catch (printError) {
                        Logger.error('❌ Error printing (fallback):', printError);
                        // Restore focus even on error
                        restoreFocus();
                    }
                }
            }, 1000);
            
            // Monitor if print window is closed manually
            const checkClosed = setInterval(() => {
                if (printWindow.closed) {
                    clearInterval(checkClosed);
                    // Restore focus when print window is closed
                    restoreFocus();
                }
            }, 500);
            
            // Clear interval after 30 seconds to avoid memory leak
            setTimeout(() => {
                clearInterval(checkClosed);
            }, 30000);
            
            // Also listen for beforeunload event on print window
            printWindow.addEventListener('beforeunload', () => {
                restoreFocus();
            });
        } catch (error) {
            Logger.error('Error generating print invoice:', error);
            throw error;
        }
    },

    async editPurchase(purchaseId) {
        try {
            const purchase = await Collections.getPurchase(purchaseId);
            this.editingPurchase = purchase;
            
            // Reset flag to allow population
            this.isPopulatingForm = false;
            
            // Show modal first
            this.showPurchaseModal();
            
            // Wait for modal to be created and shown, then populate form
            // Use a more reliable approach: wait for modal to be in DOM, then wait for shown event
            const waitForModalAndPopulate = () => {
                const modalElement = document.getElementById('purchaseModal');
                if (!modalElement) {
                    // Modal not in DOM yet, retry
                    setTimeout(waitForModalAndPopulate, 100);
                    return;
                }
                
                // Modal is in DOM, now wait for it to be shown
                let populateCalled = false;
                
                const populateAfterShow = () => {
                    if (populateCalled) {
                        return;
                    }
                    populateCalled = true;
                    
                    // Wait for all initialization to complete
                    setTimeout(() => {
                        // Double check that editingPurchase is still set
                        if (!this.editingPurchase) {
                            Logger.error('❌ editingPurchase is null when trying to populate');
                            return;
                        }
                        
                        // Verify DOM elements exist
                        const invoiceNoInput = document.getElementById('purchaseInvoiceNo');
                        if (!invoiceNoInput) {
                            Logger.error('❌ purchaseInvoiceNo not found, retrying...');
                            setTimeout(() => {
                                if (this.editingPurchase) {
                                    this.populatePurchaseForm();
                                }
                            }, 200);
                            return;
                        }
                        
                        // All checks passed, populate form
                        Logger.log('📝 All checks passed, populating form...');
                        this.populatePurchaseForm();
                    }, 500); // Wait for all initialization (autocomplete, listeners, etc.)
                };
                
                // Check if modal is already shown
                if (modalElement.classList.contains('show')) {
                    // Modal already shown, populate after a delay
                    populateAfterShow();
                } else {
                    // Wait for shown event
                    modalElement.addEventListener('shown.bs.modal', populateAfterShow, { once: true });
                }
            };
            
            // Start waiting for modal
            setTimeout(waitForModalAndPopulate, 100);
        } catch (error) {
            Logger.error('Error loading purchase:', error);
            this.isPopulatingForm = false;
            this.editingPurchase = null;
            if (typeof showError === 'function') {
                showError('فشل في تحميل فاتورة الشراء: ' + error.message);
            } else {
                Logger.error('❌ فشل في تحميل فاتورة الشراء:', error.message);
            }
        }
    },

    viewSupplier(supplierId) {
        const supplier = this.suppliers.find(s => s.id === supplierId);
        if (supplier) {
            const totalPurchases = this.purchases
                .filter(p => p.supplierId === supplierId)
                .reduce((sum, p) => sum + (p.total || 0), 0);
            
            Swal.fire({
                title: supplier.name,
                html: `
                    <div class="text-start">
                        <p><strong>الهاتف:</strong> ${supplier.phone || 'N/A'}</p>
                        <p><strong>البريد الإلكتروني:</strong> ${supplier.email || 'N/A'}</p>
                        <p><strong>العنوان:</strong> ${supplier.address || 'N/A'}</p>
                        <p><strong>إجمالي المشتريات:</strong> ${formatNumber(totalPurchases)}</p>
                        <p><strong>الحالة:</strong> ${supplier.status === 'active' ? 'نشط' : 'غير نشط'}</p>
                    </div>
                `,
                icon: 'info'
            });
        }
    },

    async editSupplier(supplierId) {
        try {
            const supplier = this.suppliers.find(s => s.id === supplierId);
            if (supplier) {
                this.editingSupplier = supplier;
                this.showSupplierModal();
                this.populateSupplierForm();
            }
        } catch (error) {
            Logger.error('Error loading supplier:', error);
            if (typeof showError === 'function') {
                showError('فشل في تحميل المورد: ' + error.message);
            } else {
                Logger.error('❌ فشل في تحميل المورد:', error.message);
            }
        }
    },

    /**
     * Show new supplier modal
     */
    showNewSupplierModal() {
        this.editingSupplier = null;
        this.showSupplierModal();
    },

    /**
     * Show supplier modal
     */
    showSupplierModal() {
        const modalHTML = `
            <div class="modal fade" id="supplierModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-truck"></i>
                                ${this.editingSupplier ? 'تعديل المورد' : 'إضافة مورد جديد'}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="supplierForm">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label for="supplierName" class="form-label">اسم المورد *</label>
                                            <input type="text" id="supplierName" class="form-control" required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label for="supplierCode" class="form-label">كود المورد</label>
                                            <input type="text" id="supplierCode" class="form-control" readonly style="background-color: #f8f9fa;">
                                            <small class="form-text text-muted">سيتم توليد الكود تلقائياً</small>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label for="supplierPhone" class="form-label">الهاتف</label>
                                            <input type="tel" id="supplierPhone" class="form-control">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label for="supplierEmail" class="form-label">البريد الإلكتروني</label>
                                            <input type="email" id="supplierEmail" class="form-control">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="form-group mb-3">
                                            <label for="supplierAddress" class="form-label">العنوان</label>
                                            <textarea id="supplierAddress" class="form-control" rows="3"></textarea>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label for="supplierContactPerson" class="form-label">الشخص المسؤول</label>
                                            <input type="text" id="supplierContactPerson" class="form-control">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label for="supplierStatus" class="form-label">الحالة</label>
                                            <select id="supplierStatus" class="form-select">
                                                <option value="active">نشط</option>
                                                <option value="inactive">غير نشط</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-12">
                                        <div class="form-group mb-3">
                                            <label for="supplierNotes" class="form-label">ملاحظات</label>
                                            <textarea id="supplierNotes" class="form-control" rows="3"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                            <button type="button" class="btn btn-primary" id="saveSupplierBtn">
                                <i class="fas fa-save"></i> حفظ المورد
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('supplierModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('supplierModal'));
        modal.show();

        // Setup modal event listeners
        this.setupSupplierModalListeners();

        // Generate code for new supplier
        if (!this.editingSupplier) {
            this.generateSupplierCode();
        }
    },

    /**
     * Setup supplier modal event listeners
     */
    setupSupplierModalListeners() {
        // Save supplier button
        document.getElementById('saveSupplierBtn').addEventListener('click', () => {
            this.saveSupplier();
        });
    },

    /**
     * Generate supplier code
     */
    generateSupplierCode() {
        const prefix = 'SUP';
        const existingCodes = this.suppliers.map(s => s.code).filter(code => code && code.startsWith(prefix));
        
        let counter = 1;
        let newCode;
        
        do {
            newCode = `${prefix}${counter.toString().padStart(3, '0')}`;
            counter++;
        } while (existingCodes.includes(newCode));
        
        document.getElementById('supplierCode').value = newCode;
    },

    /**
     * Populate supplier form for editing
     */
    populateSupplierForm() {
        if (!this.editingSupplier) return;

        document.getElementById('supplierName').value = this.editingSupplier.name || '';
        document.getElementById('supplierCode').value = this.editingSupplier.code || '';
        document.getElementById('supplierPhone').value = this.editingSupplier.phone || '';
        document.getElementById('supplierEmail').value = this.editingSupplier.email || '';
        document.getElementById('supplierAddress').value = this.editingSupplier.address || '';
        document.getElementById('supplierContactPerson').value = this.editingSupplier.contactPerson || '';
        document.getElementById('supplierStatus').value = this.editingSupplier.status || 'active';
        document.getElementById('supplierNotes').value = this.editingSupplier.notes || '';
    },

    /**
     * Save supplier
     */
    async saveSupplier() {
        try {
            const formData = this.collectSupplierData();
            
            if (!this.validateSupplierForm(formData)) {
                return;
            }

            showLoading();

            if (this.editingSupplier) {
                await Collections.updateSupplier(this.editingSupplier.id, formData);
                if (typeof showSuccess === 'function') {
                    showSuccess('تم تحديث المورد بنجاح');
                } else {
                    Logger.log('✅ تم تحديث المورد بنجاح');
                }
            } else {
                await Collections.addSupplier(formData);
                if (typeof showSuccess === 'function') {
                    showSuccess('تم إضافة المورد بنجاح');
                } else {
                    Logger.log('✅ تم إضافة المورد بنجاح');
                }
            }

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('supplierModal'));
            modal.hide();

            // Reload data
            await this.loadSuppliers();
            this.updateDashboard();

            hideLoading();

        } catch (error) {
            Logger.error('Error saving supplier:', error);
            if (typeof showError === 'function') {
                showError('فشل في حفظ المورد: ' + error.message);
            } else {
                Logger.error('❌ فشل في حفظ المورد:', error.message);
            }
            hideLoading();
        }
    },

    /**
     * Collect supplier form data
     */
    collectSupplierData() {
        return {
            name: document.getElementById('supplierName').value.trim(),
            code: document.getElementById('supplierCode').value.trim(),
            phone: document.getElementById('supplierPhone').value.trim(),
            email: document.getElementById('supplierEmail').value.trim(),
            address: document.getElementById('supplierAddress').value.trim(),
            contactPerson: document.getElementById('supplierContactPerson').value.trim(),
            status: document.getElementById('supplierStatus').value,
            notes: document.getElementById('supplierNotes').value.trim(),
            createdAt: this.editingSupplier ? this.editingSupplier.createdAt : new Date(),
            updatedAt: new Date(),
            createdBy: this.editingSupplier ? this.editingSupplier.createdBy : auth.currentUser?.uid || 'system',
            updatedBy: auth.currentUser?.uid || 'system'
        };
    },

    /**
     * Validate supplier form
     */
    validateSupplierForm(data) {
        if (!data.name) {
            if (typeof showError === 'function') {
                showError('اسم المورد مطلوب');
            } else {
                Logger.error('❌ اسم المورد مطلوب');
            }
            return false;
        }

        if (!data.code) {
            if (typeof showError === 'function') {
                showError('كود المورد مطلوب');
            } else {
                Logger.error('❌ كود المورد مطلوب');
            }
            return false;
        }

        return true;
    },

    /**
     * Show new purchase modal
     */
    showNewPurchaseModal() {
        console.log('🆕 showNewPurchaseModal called');
        Logger.log('🆕 showNewPurchaseModal called');
        this.editingPurchase = null;
        this.showPurchaseModal();
    },

    /**
     * Show purchase modal
     */
    showPurchaseModal() {
        console.log('📋 showPurchaseModal called');
        console.log('   - editingPurchase:', this.editingPurchase);
        Logger.log('📋 showPurchaseModal called');
        Logger.log('   - editingPurchase:', this.editingPurchase);
        
        const modalHTML = `
            <div class="modal fade" id="purchaseModal" tabindex="-1">
                <div class="modal-dialog modal-fullscreen">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-shopping-cart"></i>
                                ${this.editingPurchase ? 'تعديل فاتورة الشراء' : 'إضافة فاتورة شراء جديدة'}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="purchaseForm">
                                <!-- Purchase Header -->
                                <div class="row mb-3">
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="purchaseInvoiceNo" class="form-label">رقم الفاتورة</label>
                                            <input type="text" id="purchaseInvoiceNo" class="form-control" readonly style="background-color: #f8f9fa;">
                                            <small class="form-text text-muted">سيتم توليد الرقم تلقائياً</small>
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="purchaseDate" class="form-label">تاريخ الفاتورة *</label>
                                            <input type="date" id="purchaseDate" class="form-control" required>
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="purchaseSupplier" class="form-label">المورد *</label>
                                            <div class="input-group">
                                                <input type="text" id="purchaseSupplierDisplay" class="form-control" placeholder="اختر المورد" readonly style="background-color: #f8f9fa;">
                                                <input type="hidden" id="purchaseSupplierId" value="">
                                                <button type="button" class="btn btn-outline-danger" id="clearSupplier" title="مسح المورد" style="display: none;">
                                                    <i class="fas fa-times"></i>
                                                </button>
                                                <button type="button" class="btn btn-outline-secondary" id="openSupplierPicker" title="اختر المورد">
                                                    <i class="fas fa-search"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="purchaseCurrency" class="form-label">عملة الفاتورة</label>
                                            <select id="purchaseCurrency" class="form-select">
                                                ${this.currencies.map(currency => `
                                                    <option value="${currency.code}" ${currency.code === 'IQD' ? 'selected' : ''}>${currency.name}</option>
                                                `).join('')}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="purchaseExchangeRate" class="form-label">سعر الصرف</label>
                                            <input type="number" id="purchaseExchangeRate" class="form-control" value="1" min="0" step="0.0001">
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="purchaseWarehouse" class="form-label">المستودع *</label>
                                            <div class="input-group">
                                                <input type="text" id="purchaseWarehouseDisplay" class="form-control" placeholder="اختر المستودع" readonly style="background-color: #f8f9fa;">
                                                <input type="hidden" id="purchaseWarehouseId" value="">
                                                <button type="button" class="btn btn-outline-secondary" id="openWarehousePicker" title="اختر المستودع">
                                                    <i class="fas fa-search"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Additional Header Fields -->
                                <div class="row mb-3">
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="purchaseCostCenter" class="form-label">مركز الكلفة</label>
                                            <div class="input-group">
                                                <input type="text" id="purchaseCostCenterDisplay" class="form-control" placeholder="اختر مركز الكلفة" readonly style="background-color: #f8f9fa;">
                                                <input type="hidden" id="purchaseCostCenterId" value="">
                                                <button type="button" class="btn btn-outline-secondary" id="openCostCenterPicker" title="اختر مركز الكلفة">
                                                    <i class="fas fa-search"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="purchasePaymentTerms" class="form-label">شروط الدفع</label>
                                            <input type="text" id="purchasePaymentTerms" class="form-control" placeholder="مثال: صافي 30 يوم">
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="purchaseSalesRep1" class="form-label">المندوب الأول</label>
                                            <div class="input-group">
                                                <input type="text" id="purchaseSalesRep1Display" class="form-control" placeholder="اختر المندوب الأول" readonly style="background-color: #f8f9fa;">
                                                <input type="hidden" id="purchaseSalesRep1Id" value="">
                                                <button type="button" class="btn btn-outline-secondary" id="openSalesRep1Picker" title="اختر المندوب الأول">
                                                    <i class="fas fa-search"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="purchaseSalesRep2" class="form-label">المندوب الثاني</label>
                                            <div class="input-group">
                                                <input type="text" id="purchaseSalesRep2Display" class="form-control" placeholder="اختر المندوب الثاني" readonly style="background-color: #f8f9fa;">
                                                <input type="hidden" id="purchaseSalesRep2Id" value="">
                                                <button type="button" class="btn btn-outline-secondary" id="openSalesRep2Picker" title="اختر المندوب الثاني">
                                                    <i class="fas fa-search"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Purchase Items - Advanced Excel-like Table -->
                                <div class="row mb-3">
                                    <div class="col-12">
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <h6><i class="fas fa-table"></i> تفاصيل المنتجات (مثل Excel)</h6>
                                            <div>
                                                <button type="button" class="btn btn-sm btn-outline-primary me-2" id="addPurchaseItem">
                                                    <i class="fas fa-plus"></i> إضافة منتج
                                                </button>
                                                <button type="button" class="btn btn-sm btn-outline-success me-2" id="copySelectedRows">
                                                    <i class="fas fa-copy"></i> نسخ المحدد
                                                </button>
                                                <button type="button" class="btn btn-sm btn-outline-info me-2" id="pasteRows">
                                                    <i class="fas fa-paste"></i> لصق
                                                </button>
                                                <button type="button" class="btn btn-sm btn-outline-danger me-2" id="deleteSelectedRows">
                                                    <i class="fas fa-trash"></i> حذف المحدد
                                                </button>
                                                <button type="button" class="btn btn-sm btn-outline-secondary" id="toggleColumns">
                                                    <i class="fas fa-eye"></i> إظهار/إخفاء الأعمدة
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <!-- Column Visibility Controls -->
                                        <div class="column-controls mb-2" id="columnControls" style="display: none;">
                                            <div class="row">
                                <div class="col-md-12">
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input column-toggle" type="checkbox" id="col-product" checked>
                                        <label class="form-check-label" for="col-product">المنتج</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input column-toggle" type="checkbox" id="col-quantity" checked>
                                        <label class="form-check-label" for="col-quantity">الكمية</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input column-toggle" type="checkbox" id="col-unit" checked>
                                        <label class="form-check-label" for="col-unit">الوحدة</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input column-toggle" type="checkbox" id="col-price" checked>
                                        <label class="form-check-label" for="col-price">سعر الوحدة</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input column-toggle" type="checkbox" id="col-discount" checked>
                                        <label class="form-check-label" for="col-discount">الخصم %</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input column-toggle" type="checkbox" id="col-addition-percent" checked>
                                        <label class="form-check-label" for="col-addition-percent">نسبة الإضافة %</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input column-toggle" type="checkbox" id="col-addition" checked>
                                        <label class="form-check-label" for="col-addition">مبلغ الإضافة</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input column-toggle" type="checkbox" id="col-net-price" checked>
                                        <label class="form-check-label" for="col-net-price">صافي السعر</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input column-toggle" type="checkbox" id="col-expiry" checked>
                                        <label class="form-check-label" for="col-expiry">تاريخ الصلاحية</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input column-toggle" type="checkbox" id="col-serial" checked>
                                        <label class="form-check-label" for="col-serial">الرقم التسلسلي</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input column-toggle" type="checkbox" id="col-notes" checked>
                                        <label class="form-check-label" for="col-notes">ملاحظات</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                                        
                                        <div class="position-relative">
                                            <div class="table-responsive" id="purchaseItemsTableContainer" 
                                                 style="max-height: 500px; overflow-x: auto; overflow-y: auto; position: relative; border: 2px solid #d0d7e5; border-radius: 4px; background: #fff;">
                                                <!-- Custom Scrollbars -->
                                                <style>
                                                    #purchaseItemsTableContainer {
                                                        overflow-x: auto !important;
                                                        overflow-y: auto !important;
                                                        scrollbar-width: thin;
                                                        scrollbar-color: #888 #f1f1f1;
                                                    }
                                                    #purchaseItemsTableContainer::-webkit-scrollbar {
                                                        width: 16px;
                                                        height: 16px;
                                                    }
                                                    #purchaseItemsTableContainer::-webkit-scrollbar-track {
                                                        background: #f1f1f1;
                                                        border-radius: 4px;
                                                    }
                                                    #purchaseItemsTableContainer::-webkit-scrollbar-thumb {
                                                        background: #888;
                                                        border-radius: 4px;
                                                        border: 2px solid #f1f1f1;
                                                    }
                                                    #purchaseItemsTableContainer::-webkit-scrollbar-thumb:hover {
                                                        background: #555;
                                                    }
                                                    #purchaseItemsTableContainer::-webkit-scrollbar-corner {
                                                        background: #f1f1f1;
                                                    }
                                                    /* Required field styling for constraints */
                                                    .required-field {
                                                        border: 2px solid #dc3545 !important;
                                                        background-color: #fff5f5 !important;
                                                    }
                                                    .required-field:focus {
                                                        border-color: #dc3545 !important;
                                                        box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
                                                    }
                                                    .required-field::placeholder {
                                                        color: #dc3545;
                                                        font-weight: bold;
                                                    }
                                                    .is-invalid {
                                                        border-color: #dc3545 !important;
                                                    }
                                                    .resize-handle {
                                                        position: absolute;
                                                        top: 0;
                                                        right: -5px;
                                                        width: 10px;
                                                        height: 100%;
                                                        cursor: col-resize;
                                                        z-index: 100;
                                                        background: transparent;
                                                    }
                                                    .resize-handle:hover {
                                                        background: rgba(49, 106, 197, 0.3);
                                                    }
                                                    .resize-handle.active {
                                                        background: rgba(49, 106, 197, 0.5);
                                                    }
                                                    th.resizable {
                                                        position: relative;
                                                        user-select: none;
                                                    }
                                                </style>
                                                <table class="table table-bordered mb-0" id="purchaseItemsTable" 
                                                       style="margin-bottom: 0; font-size: 0.9rem; border-collapse: collapse; width: 100%; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #fff; min-width: 2000px;">
                                                    <thead style="background: #f2f3f4; position: sticky; top: 0; z-index: 10;">
                                                        <tr>
                                                            <th width="3%" class="resizable" data-col="0" style="border: 1px solid #d0d7e5; padding: 8px; text-align: center; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 50px; position: relative;">
                                                                <input type="checkbox" id="selectAllRows" title="تحديد الكل" style="cursor: pointer; width: 18px; height: 18px;">
                                                                <div class="resize-handle" data-col="0"></div>
                                                            </th>
                                                            <th width="4%" class="resizable" data-col="1" style="border: 1px solid #d0d7e5; padding: 8px; text-align: center; min-width: 50px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; position: relative;">#
                                                                <div class="resize-handle" data-col="1"></div>
                                                            </th>
                                                            <th width="17%" class="resizable col-product" data-col="2" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 150px; position: relative;">المنتج *
                                                                <div class="resize-handle" data-col="2"></div>
                                                            </th>
                                                            <th width="7%" class="resizable col-quantity" data-col="3" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 80px; position: relative;">الكمية *
                                                                <div class="resize-handle" data-col="3"></div>
                                                            </th>
                                                            <th width="7%" class="resizable col-unit" data-col="4" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 80px; position: relative;">الوحدة
                                                                <div class="resize-handle" data-col="4"></div>
                                                            </th>
                                                            <th width="8%" class="resizable col-price" data-col="5" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 100px; position: relative;">سعر الوحدة *
                                                                <div class="resize-handle" data-col="5"></div>
                                                            </th>
                                                            <th width="6%" class="resizable col-discount" data-col="6" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 80px; position: relative;">الخصم %
                                                                <div class="resize-handle" data-col="6"></div>
                                                            </th>
                                                            <th width="6%" class="resizable" data-col="7" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 100px; position: relative;">مبلغ الخصم
                                                                <div class="resize-handle" data-col="7"></div>
                                                            </th>
                                                            <th width="6%" class="resizable col-addition-percent" data-col="8" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 80px; position: relative;">نسبة الإضافة %
                                                                <div class="resize-handle" data-col="8"></div>
                                                            </th>
                                                            <th width="6%" class="resizable col-addition" data-col="9" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 100px; position: relative;">مبلغ الإضافة
                                                                <div class="resize-handle" data-col="9"></div>
                                                            </th>
                                                            <th width="8%" class="resizable col-net-price" data-col="10" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 100px; position: relative;">صافي السعر
                                                                <div class="resize-handle" data-col="10"></div>
                                                            </th>
                                                            <th width="8%" class="resizable" data-col="11" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 100px; position: relative;">المجموع
                                                                <div class="resize-handle" data-col="11"></div>
                                                            </th>
                                                            <th width="8%" class="resizable col-expiry" data-col="12" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 120px; position: relative;">تاريخ الصلاحية
                                                                <div class="resize-handle" data-col="12"></div>
                                                            </th>
                                                            <th width="8%" class="resizable col-serial" data-col="13" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 120px; position: relative;">الرقم التسلسلي
                                                                <div class="resize-handle" data-col="13"></div>
                                                            </th>
                                                            <th width="12%" class="resizable col-notes" data-col="14" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 150px; position: relative;">ملاحظات
                                                                <div class="resize-handle" data-col="14"></div>
                                                            </th>
                                                            <th width="4%" class="resizable" data-col="15" style="border: 1px solid #d0d7e5; padding: 8px; text-align: center; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 60px; position: relative;">الإجراءات
                                                                <div class="resize-handle" data-col="15"></div>
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="purchaseItemsBody">
                                                        <!-- Will be populated by JavaScript -->
                                                    </tbody>
                                                </table>
                                            </div>
                                            <!-- Scroll Buttons -->
                                            <button type="button" class="btn btn-sm btn-outline-primary table-scroll-btn table-scroll-up" id="scrollTableUp" title="تمرير لأعلى" style="position: absolute; top: 10px; right: 10px; z-index: 20; display: none; border-radius: 50%; width: 40px; height: 40px; padding: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                                                <i class="fas fa-chevron-up"></i>
                                            </button>
                                            <button type="button" class="btn btn-sm btn-outline-primary table-scroll-btn table-scroll-down" id="scrollTableDown" title="تمرير لأسفل" style="position: absolute; bottom: 10px; right: 10px; z-index: 20; display: none; border-radius: 50%; width: 40px; height: 40px; padding: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
                                                <i class="fas fa-chevron-down"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Discounts and Additions Table -->
                                <div class="row mb-3">
                                    <div class="col-12">
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <h6><i class="fas fa-calculator"></i> الخصومات والإضافات</h6>
                                            <div>
                                                <button type="button" class="btn btn-sm btn-outline-warning me-2" id="addDiscount">
                                                    <i class="fas fa-minus"></i> إضافة خصم
                                                </button>
                                                <button type="button" class="btn btn-sm btn-outline-success" id="addAddition">
                                                    <i class="fas fa-plus"></i> إضافة إضافة
                                                </button>
                                            </div>
                                        </div>
                                        <div class="table-responsive">
                                            <table class="table table-bordered table-hover" id="discountsAdditionsTable">
                                                <thead class="table-dark">
                                                    <tr>
                                                        <th width="5%">#</th>
                                                        <th width="12%">النوع</th>
                                                        <th width="20%">اسم الحساب</th>
                                                        <th width="20%">الحساب المقابل</th>
                                                        <th width="12%">المبلغ</th>
                                                        <th width="8%">العملة</th>
                                                        <th width="15%">الملاحظات</th>
                                                        <th width="8%">الإجراءات</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="discountsAdditionsBody">
                                                    <!-- Will be populated by JavaScript -->
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <!-- Purchase Summary -->
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="purchaseNotes" class="form-label">ملاحظات</label>
                                            <textarea id="purchaseNotes" class="form-control" rows="3"></textarea>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="purchase-summary">
                                            <h6><i class="fas fa-calculator"></i> ملخص الفاتورة</h6>
                                            <div class="row mb-2">
                                                <div class="col-6">
                                                    <label class="form-label">المجموع الفرعي:</label>
                                                </div>
                                                <div class="col-6">
                                                    <span id="purchaseSubtotal">0.00</span> <span id="subtotalCurrency">IQD</span>
                                                </div>
                                            </div>
                                            
                                            <div class="row mb-2">
                                                <div class="col-6">
                                                    <label class="form-label">إجمالي الخصومات:</label>
                                                </div>
                                                <div class="col-6">
                                                    <span id="totalDiscounts">0.00</span> <span id="discountCurrency">IQD</span>
                                                </div>
                                            </div>
                                            
                                            <div class="row mb-2">
                                                <div class="col-6">
                                                    <label class="form-label">إجمالي الإضافات:</label>
                                                </div>
                                                <div class="col-6">
                                                    <span id="totalAdditions">0.00</span> <span id="additionCurrency">IQD</span>
                                                </div>
                                            </div>
                                            
                                            <hr>
                                            <div class="row mb-2">
                                                <div class="col-6">
                                                    <label class="form-label"><strong>المجموع الإجمالي:</strong></label>
                                                </div>
                                                <div class="col-6">
                                                    <strong><span id="purchaseTotal">0.00</span> <span id="totalCurrency">IQD</span></strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Payment Information & General Entry -->
                                <div class="row mt-3">
                                    <div class="col-md-12">
                                        <h6><i class="fas fa-credit-card"></i> معلومات الدفع وتوليد القيد العام</h6>
                                        <div class="row">
                                            <div class="col-md-3">
                                                <div class="form-group">
                                                    <label for="purchasePaymentMethod" class="form-label">طريقة الدفع</label>
                                                    <select id="purchasePaymentMethod" class="form-select">
                                                        <option value="cash">نقدي</option>
                                                        <option value="credit">آجل</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="form-group">
                                                    <label for="purchasePaidAmount" class="form-label">المبلغ المدفوع</label>
                                                    <input type="number" id="purchasePaidAmount" class="form-control" min="0" step="0.01" value="0">
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="form-group">
                                                    <label for="purchaseDueDate" class="form-label">تاريخ الاستحقاق</label>
                                                    <input type="date" id="purchaseDueDate" class="form-control">
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="form-group">
                                                    <label for="purchaseRemainingAmount" class="form-label">المبلغ المتبقي</label>
                                                    <input type="number" id="purchaseRemainingAmount" class="form-control" readonly style="background-color: #f8f9fa;">
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Payment Status and Payment Account -->
                                        <div class="row mt-2">
                                            <div class="col-md-3">
                                                <div class="form-group">
                                                    <label for="purchasePaymentStatus" class="form-label">حالة الدفع</label>
                                                    <select id="purchasePaymentStatus" class="form-select" disabled style="background-color: #f8f9fa; cursor: not-allowed;" title="يتم تحديث حالة الدفع تلقائياً بناءً على المبلغ المدفوع">
                                                        <option value="unpaid">غير مدفوع</option>
                                                        <option value="partial">مدفوع جزئياً</option>
                                                        <option value="paid">مدفوع بالكامل</option>
                                                    </select>
                                                    <small class="text-muted">
                                                        <i class="fas fa-info-circle"></i> يتم تحديثها تلقائياً بناءً على المبلغ المدفوع
                                                    </small>
                                                </div>
                                            </div>
                                            <div class="col-md-9">
                                                <div class="form-group">
                                                    <label for="purchasePaymentAccount" class="form-label">حساب الدفع</label>
                                                    <div class="input-group">
                                                        <input type="text" class="form-control" id="purchasePaymentAccountDisplay" placeholder="اختر حساب الدفع من شجرة الحسابات" readonly style="background-color: #f8f9fa;">
                                                        <input type="hidden" id="purchasePaymentAccount" value="">
                                                        <button type="button" class="btn btn-outline-secondary" id="openPurchasePaymentAccountPicker" title="اختر حساب الدفع من شجرة الحسابات">
                                                            <i class="fas fa-sitemap"></i>
                                                        </button>
                                                    </div>
                                                    <small class="text-muted">
                                                        <i class="fas fa-info-circle"></i> الحساب الذي يتحرك عند الدفع (مثل: النقدية، الصندوق، البنك)
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- General Entry Generation -->
                                        <div class="row mt-3">
                                            <div class="col-md-12">
                                                <div class="card">
                                                    <div class="card-header">
                                                        <h6><i class="fas fa-book"></i> توليد القيد العام</h6>
                                                    </div>
                                                    <div class="card-body">
                                                        <div class="row">
                                                            <div class="col-md-6">
                                                                <div class="form-check">
                                                                    <input class="form-check-input" type="checkbox" id="generateGeneralEntry" checked>
                                                                    <label class="form-check-label" for="generateGeneralEntry">
                                                                        توليد قيد عام تلقائي
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <div class="col-md-6">
                                                                <div class="form-group">
                                                                    <label for="generalEntryDescription" class="form-label">وصف القيد</label>
                                                                    <input type="text" id="generalEntryDescription" class="form-control" placeholder="وصف القيد العام">
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="row">
                                                            <div class="col-md-12">
                                                                <div class="alert alert-info">
                                                                    <i class="fas fa-info-circle"></i>
                                                                    <strong>ملاحظة:</strong> سيتم توليد القيد العام تلقائياً عند حفظ الفاتورة مع ربط الحسابات التالية:
                                                                    <ul class="mb-0 mt-2">
                                                                        <li>مدين: حساب المشتريات أو المخزون</li>
                                                                        <li>دائن: حساب المورد أو النقدية</li>
                                                                        <li>إضافي: حسابات الضرائب والخصومات</li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="row mt-3">
                                                            <div class="col-md-12">
                                                                <button type="button" class="btn btn-outline-info btn-sm" id="previewGeneralEntryBtn">
                                                                    <i class="fas fa-eye"></i> معاينة القيد المتوقع
                                                                </button>
                                                                <button type="button" class="btn btn-outline-secondary btn-sm ms-2" id="refreshGeneralEntryPreviewBtn" style="display: none;">
                                                                    <i class="fas fa-sync-alt"></i> تحديث المعاينة
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div class="row mt-2">
                                                            <div class="col-md-12">
                                                                <div id="generalEntryPreview" style="display: none;">
                                                                    <div class="card border-info">
                                                                        <div class="card-header bg-info text-white">
                                                                            <h6 class="mb-0"><i class="fas fa-file-contract"></i> معاينة القيد المتوقع</h6>
                                                                        </div>
                                                                        <div class="card-body">
                                                                            <div id="generalEntryPreviewContent">
                                                                                <div class="text-center text-muted">
                                                                                    <i class="fas fa-spinner fa-spin"></i> جاري حساب القيد...
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" id="cancelPurchaseBtn" data-bs-dismiss="modal">إلغاء</button>
                            <button type="button" class="btn btn-primary" id="savePurchaseBtn">
                                <i class="fas fa-save"></i> حفظ الفاتورة
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Supplier Picker Modal -->
            <div class="modal fade" id="supplierPickerModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-truck"></i> اختر المورد</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <input type="text" id="supplierPickerSearch" class="form-control" placeholder="ابحث عن المورد...">
                            </div>
                            <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                                <table class="table table-hover">
                                    <thead class="table-light sticky-top">
                                        <tr>
                                            <th>الاسم</th>
                                            <th>الكود</th>
                                            <th>الهاتف</th>
                                            <th>الإجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody id="supplierPickerTableBody">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Warehouse Picker Modal -->
            <div class="modal fade" id="warehousePickerModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-warehouse"></i> اختر المستودع</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <input type="text" id="warehousePickerSearch" class="form-control" placeholder="ابحث عن المستودع...">
                            </div>
                            <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                                <table class="table table-hover">
                                    <thead class="table-light sticky-top">
                                        <tr>
                                            <th>الاسم</th>
                                            <th>الكود</th>
                                            <th>الموقع</th>
                                            <th>الإجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody id="warehousePickerTableBody">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Cost Center Picker Modal -->
            <div class="modal fade" id="costCenterPickerModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-building"></i> اختر مركز الكلفة</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <input type="text" id="costCenterPickerSearch" class="form-control" placeholder="ابحث عن مركز الكلفة...">
                            </div>
                            <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                                <table class="table table-hover">
                                    <thead class="table-light sticky-top">
                                        <tr>
                                            <th>الاسم</th>
                                            <th>الكود</th>
                                            <th>الوصف</th>
                                            <th>الإجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody id="costCenterPickerTableBody">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Sales Rep Picker Modal -->
            <div class="modal fade" id="salesRepPickerModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-user-tie"></i> اختر المندوب</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <input type="text" id="salesRepPickerSearch" class="form-control" placeholder="ابحث عن المندوب...">
                            </div>
                            <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                                <table class="table table-hover">
                                    <thead class="table-light sticky-top">
                                        <tr>
                                            <th>الاسم</th>
                                            <th>الكود</th>
                                            <th>الهاتف</th>
                                            <th>الإجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody id="salesRepPickerTableBody">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('purchaseModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Show modal - wait a bit to ensure DOM is updated
        setTimeout(() => {
            const modalElement = document.getElementById('purchaseModal');
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement, {
                    backdrop: true,
                    keyboard: true,
                    focus: true
                });
                
                // Fix for backdrop blocking interaction and accessibility
                modalElement.addEventListener('shown.bs.modal', () => {
                    // ✅ Fix accessibility: Remove aria-hidden and ensure proper focus management
                    const fixAccessibility = () => {
                        // Remove aria-hidden immediately if modal is shown
                        if (modalElement.classList.contains('show') && modalElement.hasAttribute('aria-hidden')) {
                            modalElement.removeAttribute('aria-hidden');
                        }
                        modalElement.setAttribute('aria-modal', 'true');
                        
                        // ✅ Handle focus properly - move focus away from btn-close or cancel button if they have focus
                        const activeElement = document.activeElement;
                        const btnClose = modalElement.querySelector('.btn-close');
                        const cancelBtn = modalElement.querySelector('#cancelPurchaseBtn');
                        
                        // If btn-close or cancel button has focus, move it to first input
                        if ((activeElement === btnClose || activeElement === cancelBtn) && modalElement.classList.contains('show')) {
                            // Find first focusable element (not btn-close or cancel button)
                            const firstInput = modalElement.querySelector('input:not([readonly]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not(.btn-close):not(#cancelPurchaseBtn)');
                            if (firstInput) {
                                setTimeout(() => {
                                    firstInput.focus();
                                }, 50);
                            }
                        }
                    };
                    
                    // Fix immediately
                    fixAccessibility();
                    
                    // ✅ Use MutationObserver to watch for aria-hidden and class changes
                    const observer = new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                            if (mutation.type === 'attributes') {
                                if (mutation.attributeName === 'aria-hidden' || mutation.attributeName === 'class') {
                                    // If modal is shown but has aria-hidden, fix it
                                    if (modalElement.classList.contains('show') && modalElement.hasAttribute('aria-hidden')) {
                                        fixAccessibility();
                                    }
                                }
                            }
                        });
                    });
                    
                    // Start observing the modal for aria-hidden and class changes
                    observer.observe(modalElement, {
                        attributes: true,
                        attributeFilter: ['aria-hidden', 'class']
                    });
                    
                    // ✅ Also watch for focus changes to prevent accessibility warnings
                    const handleFocus = (e) => {
                        const btnClose = modalElement.querySelector('.btn-close');
                        const cancelBtn = modalElement.querySelector('#cancelPurchaseBtn');
                        // If focus is on btn-close or cancel button, and modal has aria-hidden, fix it
                        if ((e.target === btnClose || e.target === cancelBtn) && modalElement.hasAttribute('aria-hidden') && modalElement.classList.contains('show')) {
                            fixAccessibility();
                        }
                    };
                    
                    modalElement.addEventListener('focusin', handleFocus, { passive: true });
                    
                    // Store observer and handler for cleanup when modal is hidden
                    modalElement._accessibilityObserver = observer;
                    modalElement._accessibilityFocusHandler = handleFocus;
                    
                    // Keep observing for longer (Bootstrap may add aria-hidden multiple times)
                    // Don't disconnect automatically - let it run until modal is hidden
                    
                    // Ensure modal content is interactive
                    const modalContent = modalElement.querySelector('.modal-content');
                    if (modalContent) {
                        modalContent.style.pointerEvents = 'auto';
                        modalContent.style.zIndex = '1051';
                    }
                    
                    // Fix backdrop z-index
                    const backdrops = document.querySelectorAll('.modal-backdrop');
                    backdrops.forEach((backdrop, index) => {
                        if (index === backdrops.length - 1) {
                            // Last backdrop (for purchase modal) should be below modal
                            backdrop.style.zIndex = '1049';
                        }
                    });
                    
                    // Ensure all interactive elements are clickable
                    const interactiveElements = modalElement.querySelectorAll('input, select, textarea, button, a, table, tbody, tr, td');
                    interactiveElements.forEach(el => {
                        el.style.pointerEvents = 'auto';
                    });
                }, { once: true });
                
                // ✅ Clean up observer and event handlers when modal is hidden
                modalElement.addEventListener('hidden.bs.modal', () => {
                    if (modalElement._accessibilityObserver) {
                        modalElement._accessibilityObserver.disconnect();
                        delete modalElement._accessibilityObserver;
                    }
                    if (modalElement._accessibilityFocusHandler) {
                        modalElement.removeEventListener('focusin', modalElement._accessibilityFocusHandler);
                        delete modalElement._accessibilityFocusHandler;
                    }
                }, { once: true });
                
                modal.show();
            } else {
                Logger.error('❌ purchaseModal not found after insertion');
            }
        }, 50);

        // Reload suppliers to ensure we have the latest data
        this.loadSuppliers().then(() => {
            // Initialize autocomplete fields after data is loaded
            // Small delay to ensure modal is fully rendered
            setTimeout(() => {
                this.initializeAutocompleteFields();
                Logger.log('✅ Autocomplete fields initialized');
                // Setup column resizing after modal is shown
                setTimeout(() => {
                    this.setupColumnResizing();
                }, 300);
            }, 150);
        });
        
        // Also initialize when modal is fully shown (backup)
        const modalElement = document.getElementById('purchaseModal');
        if (modalElement) {
            const handleModalShown = () => {
                setTimeout(async () => {
                    // Initialize autocomplete fields first
                    this.initializeAutocompleteFields();
                    Logger.log('✅ Autocomplete fields initialized (from modal shown event)');
                    
                    // Then apply default values after autocomplete fields are created
                    if (!this.editingPurchase) {
                        // Wait a bit more to ensure autocomplete fields are fully created
                        setTimeout(async () => {
                            await this.applyDefaultValues();
                        }, 200);
                    }
                }, 100);
            };
            modalElement.addEventListener('shown.bs.modal', handleModalShown, { once: true });
        }

        // ✅ Setup modal event listeners AFTER modal is added to DOM
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            console.log('⏰ Setting up purchase modal listeners...');
            Logger.log('⏰ Setting up purchase modal listeners...');
            this.setupPurchaseModalListeners();
            console.log('✅ setupPurchaseModalListeners called');
            Logger.log('✅ setupPurchaseModalListeners called');
        }, 50);

        // Generate invoice number for new purchase
        if (!this.editingPurchase) {
            // Wait for modal to be fully rendered before generating invoice number
            setTimeout(() => {
                const invoiceNoInput = document.getElementById('purchaseInvoiceNo');
                if (invoiceNoInput) {
                    this.generatePurchaseInvoiceNumber();
                } else {
                    Logger.warn('⚠️ purchaseInvoiceNo not found, retrying...');
                    setTimeout(() => {
                        if (document.getElementById('purchaseInvoiceNo')) {
                            this.generatePurchaseInvoiceNumber();
                        }
                    }, 200);
                }
            }, 100);
        }

        // Set today's date
        const purchaseDateInput = document.getElementById('purchaseDate');
        if (purchaseDateInput) {
            purchaseDateInput.value = new Date().toISOString().split('T')[0];
        } else {
            // Retry after modal is fully shown
            setTimeout(() => {
                const retryDateInput = document.getElementById('purchaseDate');
                if (retryDateInput) {
                    retryDateInput.value = new Date().toISOString().split('T')[0];
                }
            }, 200);
        }

        // Apply default values from settings (only for new purchases)
        // Note: This is a backup call, main call is in handleModalShown after autocomplete fields are initialized
        if (!this.editingPurchase) {
            setTimeout(async () => {
                // Check if picker fields exist before applying defaults
                // Note: The fields are purchaseWarehouseId/purchaseWarehouseDisplay, not purchaseWarehouse
                const warehouseDisplay = document.getElementById('purchaseWarehouseDisplay');
                const warehouseIdInput = document.getElementById('purchaseWarehouseId');
                const costCenterDisplay = document.getElementById('purchaseCostCenterDisplay');
                const costCenterIdInput = document.getElementById('purchaseCostCenterId');
                
                // Only apply if picker fields are already created
                if (warehouseDisplay && warehouseIdInput && costCenterDisplay && costCenterIdInput) {
                    await this.applyDefaultValues();
                } else {
                    Logger.warn('⚠️ Picker fields not found, will retry in handleModalShown event');
                }
                
                // Initialize 6 empty rows for new purchase
                console.log('⏰ Checking for purchaseItemsBody to initialize rows...');
                Logger.log('⏰ Checking for purchaseItemsBody to initialize rows...');
                const tbody = document.getElementById('purchaseItemsBody');
                if (tbody) {
                    console.log('✅ purchaseItemsBody found, initializing empty rows...');
                    Logger.log('✅ purchaseItemsBody found, initializing empty rows...');
                    this.initializeEmptyRows(6);
                } else {
                    console.warn('⚠️ purchaseItemsBody not found, retrying...');
                    Logger.warn('⚠️ purchaseItemsBody not found, retrying...');
                    setTimeout(() => {
                        const retryTbody = document.getElementById('purchaseItemsBody');
                        if (retryTbody) {
                            console.log('✅ purchaseItemsBody found on retry, initializing empty rows...');
                            Logger.log('✅ purchaseItemsBody found on retry, initializing empty rows...');
                            this.initializeEmptyRows(6);
                        } else {
                            console.error('❌ purchaseItemsBody still not found after retry');
                            Logger.error('❌ purchaseItemsBody still not found after retry');
                        }
                    }, 200);
                }
            }, 500);
        }
    },

    /**
     * ✅ Cleanup autocomplete fields event listeners to prevent duplicates
     */
    cleanupAutocompleteFieldsListeners() {
        // Supplier picker button
        const openSupplierPicker = document.getElementById('openSupplierPicker');
        if (openSupplierPicker?._supplierPickerHandler) {
            openSupplierPicker.removeEventListener('click', openSupplierPicker._supplierPickerHandler);
            delete openSupplierPicker._supplierPickerHandler;
        }

        // Clear supplier button
        const clearSupplierBtn = document.getElementById('clearSupplier');
        if (clearSupplierBtn?._clearSupplierHandler) {
            clearSupplierBtn.removeEventListener('click', clearSupplierBtn._clearSupplierHandler);
            delete clearSupplierBtn._clearSupplierHandler;
        }

        // Warehouse picker button
        const openWarehousePicker = document.getElementById('openWarehousePicker');
        if (openWarehousePicker?._warehousePickerHandler) {
            openWarehousePicker.removeEventListener('click', openWarehousePicker._warehousePickerHandler);
            delete openWarehousePicker._warehousePickerHandler;
        }

        // Cost Center picker button
        const openCostCenterPicker = document.getElementById('openCostCenterPicker');
        if (openCostCenterPicker?._costCenterPickerHandler) {
            openCostCenterPicker.removeEventListener('click', openCostCenterPicker._costCenterPickerHandler);
            delete openCostCenterPicker._costCenterPickerHandler;
        }

        // Sales Rep 1 picker button
        const openSalesRep1Picker = document.getElementById('openSalesRep1Picker');
        if (openSalesRep1Picker?._salesRep1Handler) {
            openSalesRep1Picker.removeEventListener('click', openSalesRep1Picker._salesRep1Handler);
            delete openSalesRep1Picker._salesRep1Handler;
        }

        // Sales Rep 2 picker button
        const openSalesRep2Picker = document.getElementById('openSalesRep2Picker');
        if (openSalesRep2Picker?._salesRep2Handler) {
            openSalesRep2Picker.removeEventListener('click', openSalesRep2Picker._salesRep2Handler);
            delete openSalesRep2Picker._salesRep2Handler;
        }
    },

    /**
     * Initialize autocomplete fields in purchase form (now using picker modals)
     */
    initializeAutocompleteFields() {
        // ✅ Cleanup existing listeners first to prevent duplicates
        this.cleanupAutocompleteFieldsListeners();
        
        // Setup Supplier picker button
        const openSupplierPicker = document.getElementById('openSupplierPicker');
        if (openSupplierPicker) {
            const supplierPickerHandler = () => {
                this.openSupplierPicker();
            };
            openSupplierPicker.addEventListener('click', supplierPickerHandler);
            openSupplierPicker._supplierPickerHandler = supplierPickerHandler;
        }

        // Setup Clear supplier button
        const clearSupplierBtn = document.getElementById('clearSupplier');
        if (clearSupplierBtn) {
            const clearSupplierHandler = () => {
                this.clearSupplier();
            };
            clearSupplierBtn.addEventListener('click', clearSupplierHandler);
            clearSupplierBtn._clearSupplierHandler = clearSupplierHandler;
        }

        // Setup Warehouse picker button
        const openWarehousePicker = document.getElementById('openWarehousePicker');
        if (openWarehousePicker) {
            const warehousePickerHandler = () => {
                this.openWarehousePicker();
            };
            openWarehousePicker.addEventListener('click', warehousePickerHandler);
            openWarehousePicker._warehousePickerHandler = warehousePickerHandler;
        }

        // Setup Cost Center picker button
        const openCostCenterPicker = document.getElementById('openCostCenterPicker');
        if (openCostCenterPicker) {
            const costCenterPickerHandler = () => {
                this.openCostCenterPicker();
            };
            openCostCenterPicker.addEventListener('click', costCenterPickerHandler);
            openCostCenterPicker._costCenterPickerHandler = costCenterPickerHandler;
        }

        // Setup Sales Rep 1 picker button
        const openSalesRep1Picker = document.getElementById('openSalesRep1Picker');
        if (openSalesRep1Picker) {
            const salesRep1Handler = () => {
                this.openSalesRepPicker(1);
            };
            openSalesRep1Picker.addEventListener('click', salesRep1Handler);
            openSalesRep1Picker._salesRep1Handler = salesRep1Handler;
        }

        // Setup Sales Rep 2 picker button
        const openSalesRep2Picker = document.getElementById('openSalesRep2Picker');
        if (openSalesRep2Picker) {
            const salesRep2Handler = () => {
                this.openSalesRepPicker(2);
            };
            openSalesRep2Picker.addEventListener('click', salesRep2Handler);
            openSalesRep2Picker._salesRep2Handler = salesRep2Handler;
        }

        // If editing, populate the fields (but only if not already populating)
        // Note: populatePurchaseForm is now called from editPurchase with proper timing
        // This call here is redundant and can cause duplication, so we skip it
        // if (this.editingPurchase && !this.isPopulatingForm) {
        //     this.populatePurchaseForm(this.editingPurchase);
        // }
    },

    /**
     * Open supplier picker modal
     */
    openSupplierPicker() {
        const modalElement = document.getElementById('supplierPickerModal');
        if (!modalElement) {
            console.error('❌ supplierPickerModal not found in DOM');
            return;
        }
        
        // Check if modal instance already exists
        let modal = bootstrap.Modal.getInstance(modalElement);
        if (!modal) {
            modal = new bootstrap.Modal(modalElement);
        }
        
        // إعداد event listener عند فتح النافذة
        const handleModalShown = () => {
            Logger.log('📋 Supplier picker modal shown, initializing...');
            // انتظر قليلاً لضمان أن النافذة مرئية بالكامل
            setTimeout(() => {
                this.populateSupplierPicker();
                // Focus على حقل البحث بعد فتح النافذة
                setTimeout(() => {
                    const searchInput = document.getElementById('supplierPickerSearch');
                    if (searchInput) {
                        searchInput.focus();
                        searchInput.select();
                        Logger.log('✅ Supplier picker search input focused and ready');
                    } else {
                        Logger.error('❌ supplierPickerSearch not found after modal shown');
                    }
                }, 150);
            }, 100);
        };
        
        // إزالة event listener القديم إذا كان موجوداً
        modalElement.removeEventListener('shown.bs.modal', handleModalShown);
        // إضافة event listener جديد
        modalElement.addEventListener('shown.bs.modal', handleModalShown, { once: true });
        
        // إذا كانت النافذة مفتوحة بالفعل، استدعي populateSupplierPicker مباشرة
        if (modalElement.classList.contains('show')) {
            setTimeout(() => {
                this.populateSupplierPicker();
                const searchInput = document.getElementById('supplierPickerSearch');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }, 100);
        }
        
        modal.show();
    },

    /**
     * Populate supplier picker table
     */
    populateSupplierPicker(searchTerm = '') {
        const tbody = document.getElementById('supplierPickerTableBody');
        if (!tbody) return;

        const searchLower = searchTerm.toLowerCase();
        const filteredSuppliers = this.suppliers.filter(supplier => {
            if (!searchTerm) return true;
            const name = (supplier.name || '').toLowerCase();
            const code = (supplier.code || '').toLowerCase();
            const phone = (supplier.phone || '').toLowerCase();
            return name.includes(searchLower) || code.includes(searchLower) || phone.includes(searchLower);
        });

        if (filteredSuppliers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">لا توجد موردين</td></tr>';
            return;
        }

        tbody.innerHTML = filteredSuppliers.map(supplier => `
            <tr>
                <td>${this.escapeHtml(supplier.name || '')}</td>
                <td>${this.escapeHtml(supplier.code || '')}</td>
                <td>${this.escapeHtml(supplier.phone || '')}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="PurchasesModule.selectSupplier('${supplier.id}')">
                        <i class="fas fa-check"></i> اختر
                    </button>
                </td>
            </tr>
        `).join('');

        // Setup search - إعداد event listener للبحث
        // ✅ استخدام setTimeout لضمان أن العنصر موجود في DOM
        setTimeout(() => {
            const searchInput = document.getElementById('supplierPickerSearch');
            if (searchInput) {
                // تعيين القيمة
                searchInput.value = searchTerm;
                
                // إزالة event listeners القديمة
                searchInput.oninput = null;
                searchInput.onkeyup = null;
                searchInput.onkeydown = null;
                
                // استخدام oninput مباشرة (أبسط وأكثر موثوقية)
                searchInput.oninput = (e) => {
                    const value = e.target.value || '';
                    Logger.log('🔍 Supplier search input:', value);
                    this.populateSupplierPicker(value);
                };
                
                // إضافة event listeners إضافية للتأكد من عمل البحث
                searchInput.onkeyup = (e) => {
                    const value = e.target.value || '';
                    this.populateSupplierPicker(value);
                };
                
                // إضافة keydown أيضاً
                searchInput.onkeydown = (e) => {
                    // السماح بجميع المفاتيح
                    return true;
                };
                
                Logger.log('✅ Supplier picker search input initialized');
            } else {
                Logger.error('❌ supplierPickerSearch input not found after timeout');
            }
        }, 100);
    },

    /**
     * Select supplier from picker
     */
    selectSupplier(supplierId) {
        const supplier = this.suppliers.find(s => s.id === supplierId);
        if (!supplier) {
            console.warn(`⚠️ Supplier with ID ${supplierId} not found`);
            return;
        }
        
        const supplierIdInput = document.getElementById('purchaseSupplierId');
        const supplierDisplayInput = document.getElementById('purchaseSupplierDisplay');
        
        if (!supplierIdInput || !supplierDisplayInput) {
            console.error('❌ Purchase supplier input fields not found');
            return;
        }
        
        supplierIdInput.value = supplierId;
        supplierDisplayInput.value = supplier.name || '';
        
        // Show clear button
        const clearSupplierBtn = document.getElementById('clearSupplier');
        if (clearSupplierBtn) {
            clearSupplierBtn.style.display = 'block';
        }
        
        // Close modal
        const modalElement = document.getElementById('supplierPickerModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
        }

        // Trigger preview update if needed
        const previewDiv = document.getElementById('generalEntryPreview');
        if (previewDiv && previewDiv.style.display !== 'none') {
            this.previewGeneralEntry();
        }
    },

    /**
     * Clear supplier selection
     */
    clearSupplier() {
        const supplierIdInput = document.getElementById('purchaseSupplierId');
        const supplierDisplayInput = document.getElementById('purchaseSupplierDisplay');
        const clearSupplierBtn = document.getElementById('clearSupplier');
        
        if (supplierIdInput) {
            supplierIdInput.value = '';
        }
        if (supplierDisplayInput) {
            supplierDisplayInput.value = '';
        }
        if (clearSupplierBtn) {
            clearSupplierBtn.style.display = 'none';
        }
        
        // Trigger preview update if needed
        const previewDiv = document.getElementById('generalEntryPreview');
        if (previewDiv && previewDiv.style.display !== 'none') {
            this.previewGeneralEntry();
        }
    },

    /**
     * Open warehouse picker modal
     */
    openWarehousePicker() {
        const modalElement = document.getElementById('warehousePickerModal');
        if (!modalElement) {
            console.error('❌ warehousePickerModal not found in DOM');
            return;
        }
        
        // Check if modal instance already exists
        let modal = bootstrap.Modal.getInstance(modalElement);
        if (!modal) {
            modal = new bootstrap.Modal(modalElement);
        }
        
        // إعداد event listener عند فتح النافذة
        const handleModalShown = () => {
            Logger.log('📋 Warehouse picker modal shown, initializing...');
            // انتظر قليلاً لضمان أن النافذة مرئية بالكامل
            setTimeout(() => {
                this.populateWarehousePicker();
                // Focus على حقل البحث بعد فتح النافذة
                setTimeout(() => {
                    const searchInput = document.getElementById('warehousePickerSearch');
                    if (searchInput) {
                        searchInput.focus();
                        searchInput.select();
                        Logger.log('✅ Warehouse picker search input focused and ready');
                    } else {
                        Logger.error('❌ warehousePickerSearch not found after modal shown');
                    }
                }, 150);
            }, 100);
        };
        
        // إزالة event listener القديم إذا كان موجوداً
        modalElement.removeEventListener('shown.bs.modal', handleModalShown);
        // إضافة event listener جديد
        modalElement.addEventListener('shown.bs.modal', handleModalShown, { once: true });
        
        // إذا كانت النافذة مفتوحة بالفعل، استدعي populateWarehousePicker مباشرة
        if (modalElement.classList.contains('show')) {
            setTimeout(() => {
                this.populateWarehousePicker();
                const searchInput = document.getElementById('warehousePickerSearch');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }, 100);
        }
        
        modal.show();
    },

    /**
     * Populate warehouse picker table
     */
    populateWarehousePicker(searchTerm = '') {
        const tbody = document.getElementById('warehousePickerTableBody');
        if (!tbody) return;

        const searchLower = searchTerm.toLowerCase();
        const filteredWarehouses = this.warehouses.filter(warehouse => {
            if (!searchTerm) return true;
            const name = (warehouse.name || '').toLowerCase();
            const code = (warehouse.code || '').toLowerCase();
            const location = (warehouse.location || '').toLowerCase();
            return name.includes(searchLower) || code.includes(searchLower) || location.includes(searchLower);
        });

        if (filteredWarehouses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">لا توجد مستودعات</td></tr>';
            return;
        }

        tbody.innerHTML = filteredWarehouses.map(warehouse => `
            <tr>
                <td>${this.escapeHtml(warehouse.name || '')}</td>
                <td>${this.escapeHtml(warehouse.code || '')}</td>
                <td>${this.escapeHtml(warehouse.location || '')}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="PurchasesModule.selectWarehouse('${warehouse.id}')">
                        <i class="fas fa-check"></i> اختر
                    </button>
                </td>
            </tr>
        `).join('');

        // Setup search - إعداد event listener للبحث
        // ✅ استخدام setTimeout لضمان أن العنصر موجود في DOM
        setTimeout(() => {
            const searchInput = document.getElementById('warehousePickerSearch');
            if (searchInput) {
                // تعيين القيمة
                searchInput.value = searchTerm;
                
                // إزالة event listeners القديمة
                searchInput.oninput = null;
                searchInput.onkeyup = null;
                searchInput.onkeydown = null;
                
                // استخدام oninput مباشرة (أبسط وأكثر موثوقية)
                searchInput.oninput = (e) => {
                    const value = e.target.value || '';
                    Logger.log('🔍 Warehouse search input:', value);
                    this.populateWarehousePicker(value);
                };
                
                // إضافة event listeners إضافية للتأكد من عمل البحث
                searchInput.onkeyup = (e) => {
                    const value = e.target.value || '';
                    this.populateWarehousePicker(value);
                };
                
                // إضافة keydown أيضاً
                searchInput.onkeydown = (e) => {
                    // السماح بجميع المفاتيح
                    return true;
                };
                
                Logger.log('✅ Warehouse picker search input initialized');
            } else {
                Logger.error('❌ warehousePickerSearch input not found after timeout');
            }
        }, 100);
    },

    /**
     * Select warehouse from picker
     */
    selectWarehouse(warehouseId) {
        const warehouse = this.warehouses.find(w => w.id === warehouseId);
        if (!warehouse) {
            console.warn(`⚠️ Warehouse with ID ${warehouseId} not found`);
            return;
        }
        
        const warehouseIdInput = document.getElementById('purchaseWarehouseId');
        const warehouseDisplayInput = document.getElementById('purchaseWarehouseDisplay');
        
        if (!warehouseIdInput || !warehouseDisplayInput) {
            console.error('❌ Purchase warehouse input fields not found');
            return;
        }
        
        warehouseIdInput.value = warehouseId;
        warehouseDisplayInput.value = warehouse.name || '';
        
        // Close modal
        const modalElement = document.getElementById('warehousePickerModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
        }
    },

    /**
     * Open cost center picker modal
     */
    openCostCenterPicker() {
        const modalElement = document.getElementById('costCenterPickerModal');
        if (!modalElement) {
            console.error('❌ costCenterPickerModal not found in DOM');
            return;
        }
        
        // Check if modal instance already exists
        let modal = bootstrap.Modal.getInstance(modalElement);
        if (!modal) {
            modal = new bootstrap.Modal(modalElement);
        }
        
        // إعداد event listener عند فتح النافذة
        const handleModalShown = () => {
            Logger.log('📋 Cost center picker modal shown, initializing...');
            // انتظر قليلاً لضمان أن النافذة مرئية بالكامل
            setTimeout(() => {
                this.populateCostCenterPicker();
                // Focus على حقل البحث بعد فتح النافذة
                setTimeout(() => {
                    const searchInput = document.getElementById('costCenterPickerSearch');
                    if (searchInput) {
                        searchInput.focus();
                        searchInput.select();
                        Logger.log('✅ Cost center picker search input focused and ready');
                    } else {
                        Logger.error('❌ costCenterPickerSearch not found after modal shown');
                    }
                }, 150);
            }, 100);
        };
        
        // إزالة event listener القديم إذا كان موجوداً
        modalElement.removeEventListener('shown.bs.modal', handleModalShown);
        // إضافة event listener جديد
        modalElement.addEventListener('shown.bs.modal', handleModalShown, { once: true });
        
        // إذا كانت النافذة مفتوحة بالفعل، استدعي populateCostCenterPicker مباشرة
        if (modalElement.classList.contains('show')) {
            setTimeout(() => {
                this.populateCostCenterPicker();
                const searchInput = document.getElementById('costCenterPickerSearch');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }, 100);
        }
        
        modal.show();
    },

    /**
     * Populate cost center picker table
     */
    populateCostCenterPicker(searchTerm = '') {
        const tbody = document.getElementById('costCenterPickerTableBody');
        if (!tbody) return;

        const searchLower = searchTerm.toLowerCase();
        const filteredCostCenters = this.costCenters.filter(costCenter => {
            if (!searchTerm) return true;
            const name = (costCenter.name || '').toLowerCase();
            const code = (costCenter.code || '').toLowerCase();
            const description = (costCenter.description || '').toLowerCase();
            return name.includes(searchLower) || code.includes(searchLower) || description.includes(searchLower);
        });

        if (filteredCostCenters.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">لا توجد مراكز كلفة</td></tr>';
            return;
        }

        tbody.innerHTML = filteredCostCenters.map(costCenter => `
            <tr>
                <td>${this.escapeHtml(costCenter.name || '')}</td>
                <td>${this.escapeHtml(costCenter.code || '')}</td>
                <td>${this.escapeHtml(costCenter.description || '')}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="PurchasesModule.selectCostCenter('${costCenter.id}')">
                        <i class="fas fa-check"></i> اختر
                    </button>
                </td>
            </tr>
        `).join('');

        // Setup search - إعداد event listener للبحث
        // ✅ استخدام setTimeout لضمان أن العنصر موجود في DOM
        setTimeout(() => {
            const searchInput = document.getElementById('costCenterPickerSearch');
            if (searchInput) {
                // تعيين القيمة
                searchInput.value = searchTerm;
                
                // إزالة event listeners القديمة
                searchInput.oninput = null;
                searchInput.onkeyup = null;
                searchInput.onkeydown = null;
                
                // استخدام oninput مباشرة (أبسط وأكثر موثوقية)
                searchInput.oninput = (e) => {
                    const value = e.target.value || '';
                    Logger.log('🔍 Cost center search input:', value);
                    this.populateCostCenterPicker(value);
                };
                
                // إضافة event listeners إضافية للتأكد من عمل البحث
                searchInput.onkeyup = (e) => {
                    const value = e.target.value || '';
                    this.populateCostCenterPicker(value);
                };
                
                // إضافة keydown أيضاً
                searchInput.onkeydown = (e) => {
                    // السماح بجميع المفاتيح
                    return true;
                };
                
                Logger.log('✅ Cost center picker search input initialized');
            } else {
                Logger.error('❌ costCenterPickerSearch input not found after timeout');
            }
        }, 100);
    },

    /**
     * Select cost center from picker
     */
    selectCostCenter(costCenterId) {
        const costCenter = this.costCenters.find(c => c.id === costCenterId);
        if (!costCenter) {
            console.warn(`⚠️ Cost center with ID ${costCenterId} not found`);
            return;
        }
        
        const costCenterIdInput = document.getElementById('purchaseCostCenterId');
        const costCenterDisplayInput = document.getElementById('purchaseCostCenterDisplay');
        
        if (!costCenterIdInput || !costCenterDisplayInput) {
            console.error('❌ Purchase cost center input fields not found');
            return;
        }
        
        costCenterIdInput.value = costCenterId;
        costCenterDisplayInput.value = costCenter.name || '';
        
        // Close modal
        const modalElement = document.getElementById('costCenterPickerModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
        }
    },

    /**
     * Open sales rep picker modal
     */
    openSalesRepPicker(repNumber) {
        this.currentSalesRepNumber = repNumber;
        
        const modalElement = document.getElementById('salesRepPickerModal');
        if (!modalElement) {
            console.error('❌ salesRepPickerModal not found in DOM');
            return;
        }
        
        // Check if modal instance already exists
        let modal = bootstrap.Modal.getInstance(modalElement);
        if (!modal) {
            modal = new bootstrap.Modal(modalElement);
        }
        
        // إعداد event listener عند فتح النافذة
        const handleModalShown = () => {
            Logger.log('📋 Sales rep picker modal shown, initializing...');
            // انتظر قليلاً لضمان أن النافذة مرئية بالكامل
            setTimeout(() => {
                this.populateSalesRepPicker();
                // Focus على حقل البحث بعد فتح النافذة
                setTimeout(() => {
                    const searchInput = document.getElementById('salesRepPickerSearch');
                    if (searchInput) {
                        searchInput.focus();
                        searchInput.select();
                        Logger.log('✅ Sales rep picker search input focused and ready');
                    } else {
                        Logger.error('❌ salesRepPickerSearch not found after modal shown');
                    }
                }, 150);
            }, 100);
        };
        
        // إزالة event listener القديم إذا كان موجوداً
        modalElement.removeEventListener('shown.bs.modal', handleModalShown);
        // إضافة event listener جديد
        modalElement.addEventListener('shown.bs.modal', handleModalShown, { once: true });
        
        // إذا كانت النافذة مفتوحة بالفعل، استدعي populateSalesRepPicker مباشرة
        if (modalElement.classList.contains('show')) {
            setTimeout(() => {
                this.populateSalesRepPicker();
                const searchInput = document.getElementById('salesRepPickerSearch');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }, 100);
        }
        
        modal.show();
    },

    /**
     * Populate sales rep picker table
     */
    populateSalesRepPicker(searchTerm = '') {
        const tbody = document.getElementById('salesRepPickerTableBody');
        if (!tbody) return;

        const searchLower = searchTerm.toLowerCase();
        const filteredSalesReps = this.salesReps.filter(salesRep => {
            if (!searchTerm) return true;
            const name = (salesRep.name || '').toLowerCase();
            const code = (salesRep.code || '').toLowerCase();
            const phone = (salesRep.phone || '').toLowerCase();
            return name.includes(searchLower) || code.includes(searchLower) || phone.includes(searchLower);
        });

        if (filteredSalesReps.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">لا توجد مندوبين</td></tr>';
            return;
        }

        tbody.innerHTML = filteredSalesReps.map(salesRep => `
            <tr>
                <td>${this.escapeHtml(salesRep.name || '')}</td>
                <td>${this.escapeHtml(salesRep.code || '')}</td>
                <td>${this.escapeHtml(salesRep.phone || '')}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="PurchasesModule.selectSalesRep('${salesRep.id}')">
                        <i class="fas fa-check"></i> اختر
                    </button>
                </td>
            </tr>
        `).join('');

        // Setup search - إعداد event listener للبحث
        // ✅ استخدام setTimeout لضمان أن العنصر موجود في DOM
        setTimeout(() => {
            const searchInput = document.getElementById('salesRepPickerSearch');
            if (searchInput) {
                // تعيين القيمة
                searchInput.value = searchTerm;
                
                // إزالة event listeners القديمة
                searchInput.oninput = null;
                searchInput.onkeyup = null;
                searchInput.onkeydown = null;
                
                // استخدام oninput مباشرة (أبسط وأكثر موثوقية)
                searchInput.oninput = (e) => {
                    const value = e.target.value || '';
                    Logger.log('🔍 Sales rep search input:', value);
                    this.populateSalesRepPicker(value);
                };
                
                // إضافة event listeners إضافية للتأكد من عمل البحث
                searchInput.onkeyup = (e) => {
                    const value = e.target.value || '';
                    this.populateSalesRepPicker(value);
                };
                
                // إضافة keydown أيضاً
                searchInput.onkeydown = (e) => {
                    // السماح بجميع المفاتيح
                    return true;
                };
                
                Logger.log('✅ Sales rep picker search input initialized');
            } else {
                Logger.error('❌ salesRepPickerSearch input not found after timeout');
            }
        }, 100);
    },

    /**
     * Select sales rep from picker
     */
    selectSalesRep(salesRepId) {
        if (!this.currentSalesRepNumber) {
            console.warn('⚠️ No sales rep number set');
            return;
        }
        
        const salesRep = this.salesReps.find(s => s.id === salesRepId);
        if (!salesRep) {
            console.warn(`⚠️ Sales rep with ID ${salesRepId} not found`);
            return;
        }
        
        const repNumber = this.currentSalesRepNumber;
        const salesRepIdInput = document.getElementById(`purchaseSalesRep${repNumber}Id`);
        const salesRepDisplayInput = document.getElementById(`purchaseSalesRep${repNumber}Display`);
        
        if (!salesRepIdInput || !salesRepDisplayInput) {
            console.error(`❌ Purchase sales rep ${repNumber} input fields not found`);
            return;
        }
        
        salesRepIdInput.value = salesRepId;
        salesRepDisplayInput.value = salesRep.name || '';
        
        // Close modal
        const modalElement = document.getElementById('salesRepPickerModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
        }
    },

    /**
     * ✅ Cleanup purchase modal event listeners to prevent duplicates
     */
    cleanupPurchaseModalListeners() {
        // Add item button
        const addPurchaseItemBtn = document.getElementById('addPurchaseItem');
        if (addPurchaseItemBtn?._addItemHandler) {
            addPurchaseItemBtn.removeEventListener('click', addPurchaseItemBtn._addItemHandler);
            delete addPurchaseItemBtn._addItemHandler;
        }

        // Copy selected rows button
        const copySelectedBtn = document.getElementById('copySelectedRows');
        if (copySelectedBtn?._copyHandler) {
            copySelectedBtn.removeEventListener('click', copySelectedBtn._copyHandler);
            delete copySelectedBtn._copyHandler;
        }

        // Paste rows button
        const pasteRowsBtn = document.getElementById('pasteRows');
        if (pasteRowsBtn?._pasteHandler) {
            pasteRowsBtn.removeEventListener('click', pasteRowsBtn._pasteHandler);
            delete pasteRowsBtn._pasteHandler;
        }

        // Delete selected rows button
        const deleteSelectedBtn = document.getElementById('deleteSelectedRows');
        if (deleteSelectedBtn?._deleteHandler) {
            deleteSelectedBtn.removeEventListener('click', deleteSelectedBtn._deleteHandler);
            delete deleteSelectedBtn._deleteHandler;
        }

        // Select all rows checkbox
        const selectAllCheckbox = document.getElementById('selectAllRows');
        if (selectAllCheckbox?._selectAllHandler) {
            selectAllCheckbox.removeEventListener('change', selectAllCheckbox._selectAllHandler);
            delete selectAllCheckbox._selectAllHandler;
        }

        // Toggle columns button
        const toggleColumnsBtn = document.getElementById('toggleColumns');
        if (toggleColumnsBtn?._toggleHandler) {
            toggleColumnsBtn.removeEventListener('click', toggleColumnsBtn._toggleHandler);
            delete toggleColumnsBtn._toggleHandler;
        }

        // Add discount button
        const addDiscountBtn = document.getElementById('addDiscount');
        if (addDiscountBtn?._addDiscountHandler) {
            addDiscountBtn.removeEventListener('click', addDiscountBtn._addDiscountHandler);
            delete addDiscountBtn._addDiscountHandler;
        }

        // Add addition button
        const addAdditionBtn = document.getElementById('addAddition');
        if (addAdditionBtn?._addAdditionHandler) {
            addAdditionBtn.removeEventListener('click', addAdditionBtn._addAdditionHandler);
            delete addAdditionBtn._addAdditionHandler;
        }

        // Save purchase button
        const savePurchaseBtn = document.getElementById('savePurchaseBtn');
        if (savePurchaseBtn?._saveHandler) {
            savePurchaseBtn.removeEventListener('click', savePurchaseBtn._saveHandler);
            delete savePurchaseBtn._saveHandler;
        }

        // Payment method change
        const purchasePaymentMethod = document.getElementById('purchasePaymentMethod');
        if (purchasePaymentMethod?._paymentMethodChangeHandler) {
            purchasePaymentMethod.removeEventListener('change', purchasePaymentMethod._paymentMethodChangeHandler);
            delete purchasePaymentMethod._paymentMethodChangeHandler;
        }
        if (purchasePaymentMethod?._paymentMethodPreviewHandler) {
            purchasePaymentMethod.removeEventListener('change', purchasePaymentMethod._paymentMethodPreviewHandler);
            delete purchasePaymentMethod._paymentMethodPreviewHandler;
        }

        // Paid amount change
        const purchasePaidAmount = document.getElementById('purchasePaidAmount');
        if (purchasePaidAmount?._paidAmountHandler) {
            purchasePaidAmount.removeEventListener('input', purchasePaidAmount._paidAmountHandler);
            delete purchasePaidAmount._paidAmountHandler;
        }

        // Payment account picker
        const openPurchasePaymentAccountPicker = document.getElementById('openPurchasePaymentAccountPicker');
        if (openPurchasePaymentAccountPicker?._paymentAccountHandler) {
            openPurchasePaymentAccountPicker.removeEventListener('click', openPurchasePaymentAccountPicker._paymentAccountHandler);
            delete openPurchasePaymentAccountPicker._paymentAccountHandler;
        }

        // Currency change
        const purchaseCurrency = document.getElementById('purchaseCurrency');
        if (purchaseCurrency?._currencyChangeHandler) {
            purchaseCurrency.removeEventListener('change', purchaseCurrency._currencyChangeHandler);
            delete purchaseCurrency._currencyChangeHandler;
        }

        // Exchange rate change
        const purchaseExchangeRate = document.getElementById('purchaseExchangeRate');
        if (purchaseExchangeRate?._exchangeRateHandler) {
            purchaseExchangeRate.removeEventListener('input', purchaseExchangeRate._exchangeRateHandler);
            delete purchaseExchangeRate._exchangeRateHandler;
        }

        // Preview general entry button
        const previewBtn = document.getElementById('previewGeneralEntryBtn');
        if (previewBtn?._previewHandler) {
            previewBtn.removeEventListener('click', previewBtn._previewHandler);
            delete previewBtn._previewHandler;
        }

        // Refresh preview button
        const refreshPreviewBtn = document.getElementById('refreshGeneralEntryPreviewBtn');
        if (refreshPreviewBtn?._refreshPreviewHandler) {
            refreshPreviewBtn.removeEventListener('click', refreshPreviewBtn._refreshPreviewHandler);
            delete refreshPreviewBtn._refreshPreviewHandler;
        }

        // Generate general entry checkbox
        const generateGeneralEntryCheckbox = document.getElementById('generateGeneralEntry');
        if (generateGeneralEntryCheckbox?._generateEntryHandler) {
            generateGeneralEntryCheckbox.removeEventListener('change', generateGeneralEntryCheckbox._generateEntryHandler);
            delete generateGeneralEntryCheckbox._generateEntryHandler;
        }

        // Supplier changes
        const purchaseSupplierId = document.getElementById('purchaseSupplierId');
        if (purchaseSupplierId?._supplierChangeHandler) {
            purchaseSupplierId.removeEventListener('change', purchaseSupplierId._supplierChangeHandler);
            delete purchaseSupplierId._supplierChangeHandler;
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancelPurchaseBtn');
        if (cancelBtn?._cancelHandler) {
            cancelBtn.removeEventListener('click', cancelBtn._cancelHandler);
            delete cancelBtn._cancelHandler;
        }

        // Modal hidden event
        const purchaseModal = document.getElementById('purchaseModal');
        if (purchaseModal?._handleModalHidden) {
            purchaseModal.removeEventListener('hidden.bs.modal', purchaseModal._handleModalHidden);
            delete purchaseModal._handleModalHidden;
        }
    },

    /**
     * Setup purchase modal event listeners
     */
    setupPurchaseModalListeners() {
        // ✅ Cleanup existing listeners first to prevent duplicates
        this.cleanupPurchaseModalListeners();
        
        // Add item button
        const addPurchaseItemBtn = document.getElementById('addPurchaseItem');
        if (addPurchaseItemBtn) {
            const addItemHandler = () => {
                this.addPurchaseItem();
            };
            addPurchaseItemBtn.addEventListener('click', addItemHandler);
            // Store handler for cleanup
            addPurchaseItemBtn._addItemHandler = addItemHandler;
        } else {
            Logger.warn('⚠️ addPurchaseItem button not found');
        }

        // Copy selected rows button
        const copySelectedBtn = document.getElementById('copySelectedRows');
        if (copySelectedBtn) {
            const copyHandler = () => {
                this.copySelectedRows();
            };
            copySelectedBtn.addEventListener('click', copyHandler);
            copySelectedBtn._copyHandler = copyHandler;
        }

        // Paste rows button
        const pasteRowsBtn = document.getElementById('pasteRows');
        if (pasteRowsBtn) {
            const pasteHandler = () => {
                this.pasteRows();
            };
            pasteRowsBtn.addEventListener('click', pasteHandler);
            pasteRowsBtn._pasteHandler = pasteHandler;
        }

        // Delete selected rows button
        const deleteSelectedBtn = document.getElementById('deleteSelectedRows');
        if (deleteSelectedBtn) {
            const deleteHandler = () => {
                this.deleteSelectedRows();
            };
            deleteSelectedBtn.addEventListener('click', deleteHandler);
            deleteSelectedBtn._deleteHandler = deleteHandler;
        }

        // Select all rows checkbox
        const selectAllCheckbox = document.getElementById('selectAllRows');
        if (selectAllCheckbox) {
            const selectAllHandler = (e) => {
                this.toggleSelectAllRows(e.target.checked);
            };
            selectAllCheckbox.addEventListener('change', selectAllHandler);
            selectAllCheckbox._selectAllHandler = selectAllHandler;
        }

        // Toggle columns button
        const toggleColumnsBtn = document.getElementById('toggleColumns');
        if (toggleColumnsBtn) {
            const toggleHandler = () => {
                this.toggleColumnControls();
            };
            toggleColumnsBtn.addEventListener('click', toggleHandler);
            toggleColumnsBtn._toggleHandler = toggleHandler;
        } else {
            Logger.warn('⚠️ toggleColumns button not found');
        }

        // Add discount button
        const addDiscountBtn = document.getElementById('addDiscount');
        if (addDiscountBtn) {
            const addDiscountHandler = () => {
                this.addDiscount();
            };
            addDiscountBtn.addEventListener('click', addDiscountHandler);
            addDiscountBtn._addDiscountHandler = addDiscountHandler;
        } else {
            Logger.warn('⚠️ addDiscount button not found');
        }

        // Add addition button
        const addAdditionBtn = document.getElementById('addAddition');
        if (addAdditionBtn) {
            const addAdditionHandler = () => {
                this.addAddition();
            };
            addAdditionBtn.addEventListener('click', addAdditionHandler);
            addAdditionBtn._addAdditionHandler = addAdditionHandler;
        } else {
            Logger.warn('⚠️ addAddition button not found');
        }

        // Save purchase button
        const savePurchaseBtn = document.getElementById('savePurchaseBtn');
        if (savePurchaseBtn) {
            const saveHandler = () => {
                this.savePurchase();
            };
            savePurchaseBtn.addEventListener('click', saveHandler);
            savePurchaseBtn._saveHandler = saveHandler;
        } else {
            Logger.error('❌ savePurchaseBtn button not found - this is critical!');
        }

        // Payment method change - ✅ Store handler to prevent duplicates
        let purchasePaymentMethod = document.getElementById('purchasePaymentMethod');
        if (purchasePaymentMethod) {
            const paymentMethodChangeHandler = () => {
                this.updatePaymentFields();
            };
            purchasePaymentMethod.addEventListener('change', paymentMethodChangeHandler);
            purchasePaymentMethod._paymentMethodChangeHandler = paymentMethodChangeHandler;
        } else {
            Logger.warn('⚠️ purchasePaymentMethod not found');
        }

        // Paid amount change
        const purchasePaidAmount = document.getElementById('purchasePaidAmount');
        if (purchasePaidAmount) {
            const paidAmountHandler = async () => {
                const paymentMethod = document.getElementById('purchasePaymentMethod')?.value;
                if (paymentMethod === 'credit') {
                    // في الدفع الآجل: التحقق من الحد الأقصى
                    const maxPayable = parseFloat(purchasePaidAmount.getAttribute('data-max-payable')) || 0;
                    const currentPaid = parseFloat(purchasePaidAmount.value) || 0;
                    if (maxPayable > 0 && currentPaid > maxPayable) {
                        purchasePaidAmount.value = maxPayable;
                        if (typeof showWarning === 'function') {
                            showWarning(`لا يمكن الدفع أكثر من ${maxPayable.toFixed(2)} (القيمة القابلة للدفع)`);
                        }
                    }
                }
                await this.calculateRemainingAmount();
            };
            purchasePaidAmount.addEventListener('input', paidAmountHandler);
            purchasePaidAmount._paidAmountHandler = paidAmountHandler;
        } else {
            Logger.warn('⚠️ purchasePaidAmount not found');
        }

        // Payment account picker
        const openPurchasePaymentAccountPicker = document.getElementById('openPurchasePaymentAccountPicker');
        if (openPurchasePaymentAccountPicker) {
            const paymentAccountHandler = () => {
                this.openAccountPicker('purchasePaymentAccount', 'purchasePaymentAccountDisplay');
            };
            openPurchasePaymentAccountPicker.addEventListener('click', paymentAccountHandler);
            openPurchasePaymentAccountPicker._paymentAccountHandler = paymentAccountHandler;
        } else {
            Logger.warn('⚠️ openPurchasePaymentAccountPicker not found');
        }

        // Currency change
        const purchaseCurrency = document.getElementById('purchaseCurrency');
        if (purchaseCurrency) {
            const currencyChangeHandler = () => {
                this.updateExchangeRate();
            };
            purchaseCurrency.addEventListener('change', currencyChangeHandler);
            purchaseCurrency._currencyChangeHandler = currencyChangeHandler;
        } else {
            Logger.warn('⚠️ purchaseCurrency not found');
        }

        // Exchange rate change
        const purchaseExchangeRate = document.getElementById('purchaseExchangeRate');
        if (purchaseExchangeRate) {
            const exchangeRateHandler = () => {
                this.recalculateAllItemPrices();
            };
            purchaseExchangeRate.addEventListener('input', exchangeRateHandler);
            purchaseExchangeRate._exchangeRateHandler = exchangeRateHandler;
        } else {
            Logger.warn('⚠️ purchaseExchangeRate not found');
        }

        // Set current date only for new purchases (not when editing)
        const purchaseDate = document.getElementById('purchaseDate');
        if (purchaseDate && !this.editingPurchase) {
            purchaseDate.value = new Date().toISOString().split('T')[0];
        } else if (purchaseDate && this.editingPurchase) {
            // Date will be set by populatePurchaseForm()
            // Don't override it here
        } else {
            Logger.warn('⚠️ purchaseDate not found');
        }

        // Setup column controls
        this.setupColumnVisibilityControls();
        this.setupColumnResizing();

        // Preview general entry button
        const previewBtn = document.getElementById('previewGeneralEntryBtn');
        if (previewBtn) {
            const previewHandler = () => {
                this.previewGeneralEntry();
            };
            previewBtn.addEventListener('click', previewHandler);
            previewBtn._previewHandler = previewHandler;
        }

        // Refresh preview button
        const refreshPreviewBtn = document.getElementById('refreshGeneralEntryPreviewBtn');
        if (refreshPreviewBtn) {
            const refreshPreviewHandler = () => {
                this.previewGeneralEntry();
            };
            refreshPreviewBtn.addEventListener('click', refreshPreviewHandler);
            refreshPreviewBtn._refreshPreviewHandler = refreshPreviewHandler;
        }

        // Auto-update preview when relevant fields change
        // Note: purchaseSupplier is actually purchaseSupplierId and purchaseSupplierDisplay
        const generateGeneralEntryCheckbox = document.getElementById('generateGeneralEntry');
        const purchaseSupplierId = document.getElementById('purchaseSupplierId');
        const purchaseSupplierDisplay = document.getElementById('purchaseSupplierDisplay');
        
        // Listen to payment method changes for preview updates
        // ✅ Use stored handler reference to prevent duplicates
        if (purchasePaymentMethod) {
            const paymentMethodPreviewHandler = () => {
                const previewDiv = document.getElementById('generalEntryPreview');
                if (previewDiv && previewDiv.style.display !== 'none') {
                    this.previewGeneralEntry();
                }
            };
            purchasePaymentMethod.addEventListener('change', paymentMethodPreviewHandler);
            purchasePaymentMethod._paymentMethodPreviewHandler = paymentMethodPreviewHandler;
        }
        
        // Listen to generate general entry checkbox changes
        if (generateGeneralEntryCheckbox) {
            const generateEntryHandler = () => {
                const previewDiv = document.getElementById('generalEntryPreview');
                if (previewDiv && previewDiv.style.display !== 'none') {
                    this.previewGeneralEntry();
                }
            };
            generateGeneralEntryCheckbox.addEventListener('change', generateEntryHandler);
            generateGeneralEntryCheckbox._generateEntryHandler = generateEntryHandler;
        }
        
        // Listen to supplier changes (both ID and Display fields)
        if (purchaseSupplierId) {
            const supplierChangeHandler = () => {
                const previewDiv = document.getElementById('generalEntryPreview');
                if (previewDiv && previewDiv.style.display !== 'none') {
                    this.previewGeneralEntry();
                }
            };
            purchaseSupplierId.addEventListener('change', supplierChangeHandler);
            purchaseSupplierId._supplierChangeHandler = supplierChangeHandler;
        }
        
        // ✅ Listen to total changes via MutationObserver (with cleanup)
        const purchaseTotalElement = document.getElementById('purchaseTotal');
        if (purchaseTotalElement) {
            // Use MutationObserver to watch for text content changes
            const totalObserver = new MutationObserver(() => {
                const previewDiv = document.getElementById('generalEntryPreview');
                if (previewDiv && previewDiv.style.display !== 'none') {
                    this.previewGeneralEntry();
                }
            });
            totalObserver.observe(purchaseTotalElement, { childList: true, subtree: true, characterData: true });
            // Store observer for cleanup
            purchaseTotalElement._totalObserver = totalObserver;
        }

        // Cancel button - تنظيف النموذج وإعادة تعيين المتغيرات عند الإلغاء
        const cancelBtn = document.getElementById('cancelPurchaseBtn');
        if (cancelBtn) {
            const cancelHandler = () => {
                this.cancelPurchaseForm();
            };
            cancelBtn.addEventListener('click', cancelHandler);
            cancelBtn._cancelHandler = cancelHandler;
        }

        // ✅ Handle modal close event (when clicking X or backdrop) - with cleanup
        const purchaseModal = document.getElementById('purchaseModal');
        if (purchaseModal) {
            // ✅ Remove existing handler first to prevent duplicates
            if (purchaseModal._handleModalHidden) {
                purchaseModal.removeEventListener('hidden.bs.modal', purchaseModal._handleModalHidden);
            }
            
            // Cleanup observers and handlers when modal is hidden
            const handleModalHidden = () => {
                this.cancelPurchaseForm();
            };
            
            purchaseModal.addEventListener('hidden.bs.modal', handleModalHidden, { once: false });
            purchaseModal._handleModalHidden = handleModalHidden;
        }
    },

    /**
     * Generate purchase invoice number
     */
    generatePurchaseInvoiceNumber() {
        const invoiceNoInput = document.getElementById('purchaseInvoiceNo');
        if (!invoiceNoInput) {
            console.warn('⚠️ purchaseInvoiceNo input not found');
            return;
        }
        
        const prefix = 'PUR';
        const existingNumbers = this.purchases.map(p => p.invoiceNo).filter(no => no && no.startsWith(prefix));
        
        let counter = 1;
        let newNumber;
        
        do {
            newNumber = `${prefix}${counter.toString().padStart(4, '0')}`;
            counter++;
        } while (existingNumbers.includes(newNumber));
        
        invoiceNoInput.value = newNumber;
        Logger.log(`✅ Generated invoice number: ${newNumber}`);
    },

    /**
     * Apply default values from settings to purchase form
     */
    async applyDefaultValues() {
        try {
            const settings = await this.getSettings();
            
            // Apply default currency
            const currencySelect = document.getElementById('purchaseCurrency');
            if (currencySelect && settings.defaultCurrency) {
                currencySelect.value = settings.defaultCurrency;
                Logger.log(`✅ Default currency applied: ${settings.defaultCurrency}`);
                // Update exchange rate based on selected currency
                this.updateExchangeRate();
            }
            
            // Apply default warehouse
            if (settings.defaultWarehouse) {
                const warehouse = this.warehouses.find(w => w.id === settings.defaultWarehouse);
                if (warehouse) {
                    const warehouseDisplay = document.getElementById('purchaseWarehouseDisplay');
                    const warehouseIdInput = document.getElementById('purchaseWarehouseId');
                    if (warehouseDisplay && warehouseIdInput) {
                        warehouseDisplay.value = warehouse.name;
                        warehouseIdInput.value = warehouse.id;
                        Logger.log(`✅ Default warehouse applied: ${warehouse.name}`);
                    } else {
                        Logger.warn('⚠️ Warehouse picker fields not found, retrying...');
                        // Retry after a short delay
                        setTimeout(() => {
                            const retryWarehouseDisplay = document.getElementById('purchaseWarehouseDisplay');
                            const retryWarehouseIdInput = document.getElementById('purchaseWarehouseId');
                            if (retryWarehouseDisplay && retryWarehouseIdInput) {
                                retryWarehouseDisplay.value = warehouse.name;
                                retryWarehouseIdInput.value = warehouse.id;
                                Logger.log(`✅ Default warehouse applied (retry): ${warehouse.name}`);
                            }
                        }, 100);
                    }
                }
            }
            
            // Apply default cost center
            if (settings.defaultCostCenter) {
                const costCenter = this.costCenters.find(c => c.id === settings.defaultCostCenter);
                if (costCenter) {
                    const costCenterDisplay = document.getElementById('purchaseCostCenterDisplay');
                    const costCenterIdInput = document.getElementById('purchaseCostCenterId');
                    if (costCenterDisplay && costCenterIdInput) {
                        costCenterDisplay.value = costCenter.name;
                        costCenterIdInput.value = costCenter.id;
                        Logger.log(`✅ Default cost center applied: ${costCenter.name}`);
                    } else {
                        Logger.warn('⚠️ Cost center picker fields not found, retrying...');
                        // Retry after a short delay
                        setTimeout(() => {
                            const retryCostCenterDisplay = document.getElementById('purchaseCostCenterDisplay');
                            const retryCostCenterIdInput = document.getElementById('purchaseCostCenterId');
                            if (retryCostCenterDisplay && retryCostCenterIdInput) {
                                retryCostCenterDisplay.value = costCenter.name;
                                retryCostCenterIdInput.value = costCenter.id;
                                Logger.log(`✅ Default cost center applied (retry): ${costCenter.name}`);
                            }
                        }, 100);
                    }
                }
            }
            
            // Apply default payment method
            const paymentMethodSelect = document.getElementById('purchasePaymentMethod');
            if (paymentMethodSelect && settings.defaultPaymentMethod) {
                paymentMethodSelect.value = settings.defaultPaymentMethod;
                Logger.log(`✅ Default payment method applied: ${settings.defaultPaymentMethod}`);
                // Update payment fields based on payment method
                this.updatePaymentFields();
            }
            
            // Apply default payment account
            if (settings.defaultPaymentAccountId) {
                const paymentAccount = this.accounts.find(a => a.id === settings.defaultPaymentAccountId);
                if (paymentAccount) {
                    const paymentAccountDisplay = document.getElementById('purchasePaymentAccountDisplay');
                    const paymentAccountIdInput = document.getElementById('purchasePaymentAccount');
                    if (paymentAccountDisplay && paymentAccountIdInput) {
                        paymentAccountDisplay.value = paymentAccount.name;
                        paymentAccountIdInput.value = paymentAccount.id;
                        Logger.log(`✅ Default payment account applied: ${paymentAccount.name}`);
                    } else {
                        Logger.warn('⚠️ Payment account picker fields not found, retrying...');
                        // Retry after a short delay
                        setTimeout(() => {
                            const retryPaymentAccountDisplay = document.getElementById('purchasePaymentAccountDisplay');
                            const retryPaymentAccountIdInput = document.getElementById('purchasePaymentAccount');
                            if (retryPaymentAccountDisplay && retryPaymentAccountIdInput) {
                                retryPaymentAccountDisplay.value = paymentAccount.name;
                                retryPaymentAccountIdInput.value = paymentAccount.id;
                                Logger.log(`✅ Default payment account applied (retry): ${paymentAccount.name}`);
                            }
                        }, 100);
                    }
                }
            }
            
            Logger.log('✅ All default values applied successfully');
        } catch (error) {
            Logger.error('Error applying default values:', error);
        }
    },

    /**
     * Add purchase item row (Advanced Excel-like)
     */
    addPurchaseItem() {
        // ✅ Always log to console for debugging
        console.log('🔄 addPurchaseItem called');
        Logger.log('🔄 addPurchaseItem called');
        const tbody = document.getElementById('purchaseItemsBody');
        if (!tbody) {
            console.error('❌ addPurchaseItem: purchaseItemsBody not found');
            Logger.error('❌ addPurchaseItem: purchaseItemsBody not found');
            return;
        }

        const rowIndex = tbody.children.length + 1;
        console.log(`   - Creating row ${rowIndex}`);
        Logger.log(`   - Creating row ${rowIndex}`);
        const row = document.createElement('tr');
        row.dataset.rowIndex = rowIndex;
        row.innerHTML = `
            <td class="excel-cell" data-row="${rowIndex}" data-col="0" style="border: 1px solid #d0d7e5; text-align: center; padding: 6px 8px; vertical-align: middle; background: #f8f9fa;">
                <input type="checkbox" class="row-select-checkbox" data-row-index="${rowIndex}" style="cursor: pointer; width: 18px; height: 18px;">
            </td>
            <td class="excel-cell" data-row="${rowIndex}" data-col="1" style="border: 1px solid #d0d7e5; text-align: center; padding: 6px 8px; vertical-align: middle; font-weight: 600; min-width: 40px; background: #f8f9fa; color: #495057; font-size: 0.9rem;">${rowIndex}</td>
            <td class="excel-cell col-product" data-row="${rowIndex}" data-col="2" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <div class="input-group input-group-sm" style="margin: 0;">
                    <input type="text" class="form-control form-control-sm product-display-input" placeholder="اختر المنتج..." readonly style="background-color: #f8f9fa; cursor: pointer; border: 1px solid #d0d7e5; border-radius: 0;" data-row-index="${rowIndex}">
                    <input type="hidden" class="product-select-id" value="">
                    <button type="button" class="btn btn-outline-secondary btn-sm product-picker-btn" data-row-index="${rowIndex}" title="اختر منتج" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </td>
            <td class="excel-cell col-quantity" data-row="${rowIndex}" data-col="3" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="number" class="form-control form-control-sm quantity-input" min="0" step="0.01" value="1" required style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="excel-cell col-unit" data-row="${rowIndex}" data-col="4" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <div class="unit-autocomplete-container" style="position: relative; width: 100%;"></div>
                <input type="hidden" class="unit-select-id" value="">
            </td>
            <td class="excel-cell col-price" data-row="${rowIndex}" data-col="5" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="number" class="form-control form-control-sm price-input" min="0" step="0.01" value="0" required style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="excel-cell col-discount" data-row="${rowIndex}" data-col="6" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="number" class="form-control form-control-sm discount-percent-input" min="0" max="100" step="0.01" value="0" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="excel-cell" data-row="${rowIndex}" data-col="7" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="number" class="form-control form-control-sm discount-amount-input" min="0" step="0.01" value="0" placeholder="أو أدخل المبلغ" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="excel-cell col-addition-percent" data-row="${rowIndex}" data-col="8" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="number" class="form-control form-control-sm addition-percent-input" min="0" max="100" step="0.01" value="0" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="excel-cell col-addition" data-row="${rowIndex}" data-col="9" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="number" class="form-control form-control-sm addition-amount-input" min="0" step="0.01" value="0" placeholder="أو أدخل المبلغ" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="excel-cell col-net-price" data-row="${rowIndex}" data-col="10" style="border: 1px solid #d0d7e5; padding: 4px; background: #f8f9fa;">
                <input type="number" class="form-control form-control-sm net-price-input" min="0" step="0.01" value="0" readonly style="background-color: #f8f9fa; font-weight: bold; border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="excel-cell" data-row="${rowIndex}" data-col="11" style="border: 1px solid #d0d7e5; padding: 4px; background: #f8f9fa;">
                <input type="number" class="form-control form-control-sm total-input" min="0" step="0.01" value="0" readonly style="background-color: #f8f9fa; font-weight: bold; border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="excel-cell col-expiry" data-row="${rowIndex}" data-col="12" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="date" class="form-control form-control-sm expiry-date-input" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="excel-cell col-serial" data-row="${rowIndex}" data-col="13" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="text" class="form-control form-control-sm serial-number-input" placeholder="رقم تسلسلي" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="excel-cell col-notes" data-row="${rowIndex}" data-col="14" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="text" class="form-control form-control-sm notes-input" placeholder="ملاحظات" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="excel-cell" data-row="${rowIndex}" data-col="15" style="border: 1px solid #d0d7e5; text-align: center; padding: 4px; background: #fff;">
                <button type="button" class="btn btn-sm btn-outline-danger remove-item" title="حذف الصف" style="border: 1px solid #dc3545; border-radius: 0; padding: 4px 8px;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);
        
        console.log(`📝 Added purchase item row ${rowIndex} to DOM`);
        Logger.log(`📝 Added purchase item row ${rowIndex} to DOM`);
        
        // ✅ Setup listeners in correct order: Excel navigation first, then product picker
        // This ensures product picker listeners are added last and won't be overridden
        this.setupExcelNavigation(row);
        this.setupPurchaseItemListeners(row);
        this.updateRowNumbers();
        
        console.log(`✅ Setup listeners for row ${rowIndex} completed`);
        Logger.log(`✅ Setup listeners for row ${rowIndex} completed`);
        
        // Update scroll buttons visibility after adding row
        setTimeout(() => {
            const container = document.getElementById('purchaseItemsTableContainer');
            if (container) {
                // Trigger scroll event to update buttons
                container.dispatchEvent(new Event('scroll'));
            }
        }, 50);
        this.calculatePurchaseTotals();
    },

    /**
     * Initialize empty rows for new purchase
     */
    initializeEmptyRows(count = 6) {
        console.log(`🔄 initializeEmptyRows called with count: ${count}`);
        Logger.log(`🔄 initializeEmptyRows called with count: ${count}`);
        const tbody = document.getElementById('purchaseItemsBody');
        if (!tbody) {
            console.error('❌ initializeEmptyRows: purchaseItemsBody not found');
            Logger.error('❌ initializeEmptyRows: purchaseItemsBody not found');
            return;
        }
        
        console.log(`🔄 Initializing ${count} empty rows...`);
        Logger.log(`🔄 Initializing ${count} empty rows...`);
        
        // Clear existing rows if any
        tbody.innerHTML = '';
        
        // Add empty rows
        for (let i = 0; i < count; i++) {
            console.log(`   - Adding row ${i + 1}/${count}`);
            Logger.log(`   - Adding row ${i + 1}/${count}`);
            this.addPurchaseItem();
        }
        
        // Setup scroll buttons after rows are added
        setTimeout(() => {
            this.setupTableScrollButtons();
            this.setupColumnResizing();
            console.log(`✅ Initialized ${count} empty rows and setup table features`);
            Logger.log(`✅ Initialized ${count} empty rows and setup table features`);
        }, 100);
    },

    /**
     * Setup scroll buttons for the purchase items table
     */
    setupTableScrollButtons() {
        const container = document.getElementById('purchaseItemsTableContainer');
        const scrollUpBtn = document.getElementById('scrollTableUp');
        const scrollDownBtn = document.getElementById('scrollTableDown');
        
        if (!container || !scrollUpBtn || !scrollDownBtn) return;
        
        // Function to update button visibility
        const updateScrollButtons = () => {
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            const maxScroll = scrollHeight - clientHeight;
            
            // Show/hide scroll up button
            if (scrollTop > 50) {
                scrollUpBtn.style.display = 'block';
            } else {
                scrollUpBtn.style.display = 'none';
            }
            
            // Show/hide scroll down button
            if (scrollTop < maxScroll - 50) {
                scrollDownBtn.style.display = 'block';
            } else {
                scrollDownBtn.style.display = 'none';
            }
        };
        
        // Initial check
        updateScrollButtons();
        
        // Update on scroll
        container.addEventListener('scroll', updateScrollButtons);
        
        // Update when rows are added/removed
        const observer = new MutationObserver(() => {
            setTimeout(updateScrollButtons, 100);
        });
        observer.observe(container, { childList: true, subtree: true });
        
        // Scroll up button click
        scrollUpBtn.addEventListener('click', () => {
            const scrollAmount = 200; // Scroll 200px up
            container.scrollBy({
                top: -scrollAmount,
                behavior: 'smooth'
            });
        });
        
        // Scroll down button click
        scrollDownBtn.addEventListener('click', () => {
            const scrollAmount = 200; // Scroll 200px down
            container.scrollBy({
                top: scrollAmount,
                behavior: 'smooth'
            });
        });
        
        // ✅ Also update on window resize (with cleanup)
        if (!container._resizeHandler) {
            container._resizeHandler = updateScrollButtons;
            window.addEventListener('resize', container._resizeHandler);
        }
        
        // ✅ Store observer for cleanup
        container._scrollObserver = observer;
    },

    /**
     * Open product picker modal for selecting a product
     * @param {HTMLElement} row - The table row element
     */
    openProductPicker(row) {
        // ✅ Always log to console for debugging
        console.log('🔍 ========== openProductPicker CALLED ==========');
        console.log('   - Row:', row);
        console.log('   - Row element:', row?.tagName, row?.className);
        console.log('   - Row dataset:', row?.dataset);
        
        Logger.log('🔍 ========== openProductPicker CALLED ==========');
        Logger.log('   - Row:', row);
        Logger.log('   - Row element:', row?.tagName, row?.className);
        Logger.log('   - Row dataset:', row?.dataset);
        
        if (!row) {
            console.error('❌ openProductPicker: row is null or undefined');
            Logger.error('❌ openProductPicker: row is null or undefined');
            return;
        }
        
        // ✅ Check if row is still in DOM
        if (!row.parentNode || !document.body.contains(row)) {
            console.error('❌ openProductPicker: row is not in DOM');
            Logger.error('❌ openProductPicker: row is not in DOM');
            return;
        }
        
        // ✅ Cleanup any existing keyboard handler first (important!)
        if (document._productPickerKeyboardHandler) {
            Logger.log('🧹 Removing existing product picker keyboard handler before opening new picker...');
            document.removeEventListener('keydown', document._productPickerKeyboardHandler);
            document._productPickerKeyboardHandler = null;
        }
        
        // ✅ SweetAlert automatically prevents multiple modals
        // We don't need to check here - SweetAlert will handle it
        // Just log if there's an existing modal
        if (typeof Swal !== 'undefined' && Swal.isVisible()) {
            Logger.log('ℹ️ Another SweetAlert modal is visible, SweetAlert will handle it automatically');
        }
        
        const productDisplayInput = row.querySelector('.product-display-input');
        const productHiddenInput = row.querySelector('.product-select-id');
        
        Logger.log('   - productDisplayInput found:', !!productDisplayInput);
        Logger.log('   - productHiddenInput found:', !!productHiddenInput);
        
        if (!productDisplayInput || !productHiddenInput) {
            Logger.error('❌ openProductPicker: Required elements not found', {
                productDisplayInput: !!productDisplayInput,
                productHiddenInput: !!productHiddenInput,
                rowHTML: row.outerHTML.substring(0, 200)
            });
            return;
        }
        
        const allProducts = this.products || [];
        const currentProductId = productHiddenInput.value;
        
        // Filter active products
        const activeProducts = allProducts.filter(p => p.status !== 'inactive');
        
        // Create product picker content with Excel-like table
        const content = `
            <div style="text-align: start;">
                <div class="mb-3">
                    <div class="input-group input-group-lg">
                        <span class="input-group-text" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none;">
                            <i class="fas fa-search"></i>
                        </span>
                        <input type="text" id="productPickerSearch" class="form-control form-control-lg" 
                               placeholder="ابحث عن المنتج بالاسم أو الكود..." 
                               autocomplete="off"
                               spellcheck="false"
                               style="border-right: none; font-size: 1rem; pointer-events: auto !important; cursor: text !important;">
                        <span class="input-group-text" style="background: #f8f9fa; border-left: none;">
                            <span class="badge bg-primary" id="productPickerCount">${activeProducts.length}</span>
                        </span>
                    </div>
                </div>
                <div class="table-responsive" style="max-height: 450px; overflow-y: auto; border: 2px solid #d0d7e5; border-radius: 4px; background: #fff;">
                    <table class="table table-bordered mb-0" id="productPickerTable" 
                           style="margin-bottom: 0; border-collapse: collapse; width: 100%; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                        <thead style="background: #f2f3f4; position: sticky; top: 0; z-index: 10;">
                            <tr>
                                <th width="5%" style="border: 1px solid #d0d7e5; padding: 8px; text-align: center; font-weight: 600; font-size: 0.85rem; background: #e7e9ec !important;">
                                    <input type="checkbox" id="selectAllProducts" style="cursor: pointer;" title="تحديد الكل">
                                </th>
                                <th width="5%" style="border: 1px solid #d0d7e5; padding: 8px; text-align: center; font-weight: 600; font-size: 0.85rem; background: #e7e9ec !important;">#</th>
                                <th width="25%" style="border: 1px solid #d0d7e5; padding: 8px; font-weight: 600; font-size: 0.85rem; background: #e7e9ec !important;">اسم المنتج</th>
                                <th width="15%" style="border: 1px solid #d0d7e5; padding: 8px; font-weight: 600; font-size: 0.85rem; background: #e7e9ec !important;">الكود</th>
                                <th width="20%" style="border: 1px solid #d0d7e5; padding: 8px; font-weight: 600; font-size: 0.85rem; background: #e7e9ec !important;">الفئة</th>
                                <th width="15%" style="border: 1px solid #d0d7e5; padding: 8px; font-weight: 600; font-size: 0.85rem; background: #e7e9ec !important;">الوحدة</th>
                                <th width="15%" style="border: 1px solid #d0d7e5; padding: 8px; text-align: center; font-weight: 600; font-size: 0.85rem; background: #e7e9ec !important;">السعر</th>
                            </tr>
                        </thead>
                        <tbody id="productPickerList" style="background-color: #fff;">
                            ${activeProducts.length > 0 ? activeProducts.map((product, index) => {
                                const category = this.categories.find(c => c.id === product.categoryId);
                                const unit = this.units.find(u => u.id === product.unitId);
                                const isSelected = product.id === currentProductId;
                                const rowId = `product-row-${product.id}`;
                                return `
                                    <tr class="product-pick-item" 
                                        data-id="${product.id}" 
                                        data-name="${product.name}"
                                        data-code="${product.code || ''}"
                                        id="${rowId}"
                                        style="cursor: pointer; ${isSelected ? 'background-color: #316ac5 !important; color: white;' : ''}">
                                        <td class="excel-cell" 
                                            data-row="${index}" 
                                            data-col="0"
                                            style="border: 1px solid #d0d7e5; padding: 6px 8px; text-align: center; background: ${isSelected ? '#316ac5' : '#f8f9fa'}; color: ${isSelected ? 'white' : '#495057'}; font-size: 0.85rem; min-width: 50px;">
                                            <input type="checkbox" class="product-select-checkbox" data-product-id="${product.id}" style="cursor: pointer;" ${isSelected ? 'checked' : ''}>
                                        </td>
                                        <td class="excel-cell" 
                                            data-row="${index}" 
                                            data-col="1"
                                            style="border: 1px solid #d0d7e5; padding: 6px 8px; text-align: center; background: ${isSelected ? '#316ac5' : '#f8f9fa'}; color: ${isSelected ? 'white' : '#495057'}; font-weight: 600; font-size: 0.85rem; min-width: 50px;">
                                            ${index + 1}
                                        </td>
                                        <td class="excel-cell" 
                                            data-row="${index}" 
                                            data-col="2"
                                            style="border: 1px solid #d0d7e5; padding: 6px 8px; background: ${isSelected ? '#316ac5' : '#fff'}; color: ${isSelected ? 'white' : '#212529'}; font-size: 0.9rem; min-width: 200px;">
                                            ${this.escapeHtml(product.name)}
                                        </td>
                                        <td class="excel-cell" 
                                            data-row="${index}" 
                                            data-col="3"
                                            style="border: 1px solid #d0d7e5; padding: 6px 8px; background: ${isSelected ? '#316ac5' : '#fff'}; color: ${isSelected ? 'white' : '#495057'}; font-size: 0.9rem; min-width: 120px;">
                                            ${this.escapeHtml(product.code || '-')}
                                        </td>
                                        <td class="excel-cell" 
                                            data-row="${index}" 
                                            data-col="4"
                                            style="border: 1px solid #d0d7e5; padding: 6px 8px; background: ${isSelected ? '#316ac5' : '#fff'}; color: ${isSelected ? 'white' : '#495057'}; font-size: 0.9rem; min-width: 150px;">
                                            ${category ? this.escapeHtml(category.name) : '-'}
                                        </td>
                                        <td class="excel-cell" 
                                            data-row="${index}" 
                                            data-col="5"
                                            style="border: 1px solid #d0d7e5; padding: 6px 8px; background: ${isSelected ? '#316ac5' : '#fff'}; color: ${isSelected ? 'white' : '#495057'}; font-size: 0.9rem; min-width: 100px;">
                                            ${unit ? this.escapeHtml(unit.name) : '-'}
                                        </td>
                                        <td class="excel-cell" 
                                            data-row="${index}" 
                                            data-col="6"
                                            style="border: 1px solid #d0d7e5; padding: 6px 8px; text-align: center; background: ${isSelected ? '#316ac5' : '#fff'}; color: ${isSelected ? 'white' : '#28a745'}; font-weight: 600; font-size: 0.9rem; min-width: 100px;">
                                            ${product.price ? formatNumber(product.price) : '0'}
                                        </td>
                                    </tr>
                                `;
                            }).join('') : `
                                <tr>
                                    <td colspan="7" class="text-center" style="padding: 40px; border: 1px solid #d0d7e5;">
                                        <i class="fas fa-box-open fa-3x text-muted mb-3" style="opacity: 0.5;"></i>
                                        <p class="text-muted mb-0" style="font-size: 1.1rem;">لا توجد منتجات متاحة</p>
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
                <div class="mt-3 p-2" style="background: #f8f9fa; border-radius: 6px; border-right: 4px solid #667eea;">
                    <small class="text-muted" style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem;">
                        <i class="fas fa-info-circle text-primary"></i>
                        <span>استخدم الأسهم للتنقل، Enter للاختيار، Tab للانتقال بين الخلايا. اضغط مرتين للاختيار السريع.</span>
                    </small>
                </div>
            </div>
        `;
        
        Logger.log('🚀 About to call Swal.fire for product picker...');
        Logger.log('   - Active products count:', activeProducts.length);
        Logger.log('   - Current product ID:', currentProductId);
        
        Swal.fire({
            title: 'اختيار منتج/منتجات',
            html: content,
            width: 950,
            showCancelButton: true,
            confirmButtonText: 'إضافة المنتجات المحددة',
            cancelButtonText: 'إلغاء',
            focusConfirm: false,
            allowOutsideClick: true,
            allowEscapeKey: true,
            allowEnterKey: true,
            didOpen: () => {
                Logger.log('📋 ✅ Product picker modal opened successfully, initializing search...');
                
                // ✅ تعريف المتغيرات في نطاق أعلى لتكون متاحة لجميع الدوال
                // استخدام activeProducts من نطاق openProductPicker
                let selectedId = null;
                let selectedProduct = null;
                let currentCell = null;
                let currentRowIndex = -1;
                let currentColIndex = -1;
                let searchInput = null; // ✅ تعريف searchInput في نطاق أعلى
                let items = []; // ✅ تعريف items في نطاق أعلى
                let cells = []; // ✅ تعريف cells في نطاق أعلى
                
                // ✅ دالة تهيئة البحث
                const initializeSearch = () => {
                    // محاولة الوصول بعدة طرق لضمان الموثوقية
                    // ✅ البحث في SweetAlert container أولاً (الأسرع)
                    const swalContainer = document.querySelector('.swal2-container');
                    if (swalContainer) {
                        searchInput = swalContainer.querySelector('#productPickerSearch');
                    }
                    
                    // طريقة بديلة: البحث في body مباشرة
                    if (!searchInput) {
                        searchInput = document.getElementById('productPickerSearch');
                    }
                    
                    // طريقة بديلة: البحث باستخدام querySelector
                    if (!searchInput) {
                        searchInput = document.querySelector('#productPickerSearch');
                    }
                    
                    // طريقة بديلة: البحث في body مباشرة
                    if (!searchInput) {
                        searchInput = document.querySelector('input[id="productPickerSearch"]');
                    }
                    
                    // ✅ محاولة أخيرة: البحث في جميع inputs
                    if (!searchInput) {
                        const allInputs = document.querySelectorAll('input[type="text"]');
                        searchInput = Array.from(allInputs).find(input => input.id === 'productPickerSearch');
                    }
                    
                    // ✅ التأكد من أن searchInput متاح في النطاق الخارجي
                    if (searchInput) {
                        // حفظ reference في متغير النطاق الخارجي
                        window._currentProductSearchInput = searchInput;
                    }
                    
                    if (!searchInput) {
                        Logger.error('❌ productPickerSearch input not found in DOM, retrying...');
                        // إعادة المحاولة بعد 50ms مع زيادة العداد
                        let retryCount = (initializeSearch._retryCount || 0) + 1;
                        initializeSearch._retryCount = retryCount;
                        
                        // إيقاف إعادة المحاولة بعد 20 محاولة (1 ثانية)
                        if (retryCount > 20) {
                            Logger.error('❌ Failed to find productPickerSearch after 20 retries');
                            return;
                        }
                        
                        setTimeout(initializeSearch, 50);
                        return;
                    }
                    
                    // إعادة تعيين عداد إعادة المحاولة عند النجاح
                    initializeSearch._retryCount = 0;
                    
                    // ✅ تعريف cells و items بعد أن يكون DOM جاهزاً
                    items = Array.from(document.querySelectorAll('.product-pick-item'));
                    cells = Array.from(document.querySelectorAll('.excel-cell'));
                    
                    Logger.log('✅ Product picker search input found:', searchInput);
                    Logger.log('✅ Found items:', items.length, 'cells:', cells.length);
                    
                    // ✅ التأكد من أن الحقل غير معطل وغير محجوب
                    searchInput.disabled = false;
                    searchInput.readOnly = false;
                    searchInput.removeAttribute('readonly');
                    searchInput.removeAttribute('disabled');
                    searchInput.setAttribute('autocomplete', 'off');
                    searchInput.setAttribute('spellcheck', 'false');
                    searchInput.setAttribute('tabindex', '0');
                    
                    // ✅ إزالة أي styles قد تمنع الكتابة
                    searchInput.style.pointerEvents = 'auto';
                    searchInput.style.opacity = '1';
                    searchInput.style.cursor = 'text';
                    searchInput.style.userSelect = 'text';
                    searchInput.style.webkitUserSelect = 'text';
                    searchInput.style.mozUserSelect = 'text';
                    searchInput.style.msUserSelect = 'text';
                    
                    // ✅ التأكد من أن الحقل قابل للتفاعل
                    searchInput.tabIndex = 0;
                    
                    // ✅ إزالة أي event listeners قد تمنع الكتابة
                    // Clone and replace to remove all event listeners
                    const newInput = searchInput.cloneNode(true);
                    searchInput.parentNode.replaceChild(newInput, searchInput);
                    searchInput = newInput;
                    
                    // ✅ إعادة تعيين القيم
                    searchInput.disabled = false;
                    searchInput.readOnly = false;
                    searchInput.style.pointerEvents = 'auto';
                    searchInput.style.opacity = '1';
                    searchInput.style.cursor = 'text';
                    
                    Logger.log('✅ Search input prepared and ready for typing');
                    
                    // ✅ Setup search input event listeners - يجب أن يكون داخل initializeSearch
                    // إزالة event listeners القديمة أولاً
                    const oldInputHandler = searchInput._inputHandler;
                    const oldKeyupHandler = searchInput._keyupHandler;
                    const oldKeydownHandler = searchInput._keydownHandler;
                    
                    if (oldInputHandler) {
                        searchInput.removeEventListener('input', oldInputHandler);
                    }
                    if (oldKeyupHandler) {
                        searchInput.removeEventListener('keyup', oldKeyupHandler);
                    }
                    if (oldKeydownHandler) {
                        searchInput.removeEventListener('keydown', oldKeydownHandler);
                    }
                    
                    // إنشاء handlers جديدة
                    const inputHandler = (e) => {
                        Logger.log('🔍 Product search input event:', e.target.value);
                        filter();
                    };
                    
                    const keyupHandler = (e) => {
                        filter();
                    };
                    
                    const keydownHandler = (e) => {
                        // ✅ السماح بالكتابة العادية - لا نمنع أي مفاتيح إلا إذا كان ضرورياً
                        // فقط معالجة Enter و ArrowDown للتنقل السريع
                        if (e.key === 'Enter') {
                            // إذا كان هناك نص في الحقل، لا نفعل شيئاً (السماح بالبحث)
                            if (searchInput.value.trim() === '') {
                                e.preventDefault();
                                const currentItems = Array.from(document.querySelectorAll('.product-pick-item'));
                                const firstVisible = currentItems.find(item => item.style.display !== 'none');
                                if (firstVisible) {
                                    const firstCell = firstVisible.querySelector('.excel-cell');
                                    if (firstCell) {
                                        selectCell(firstCell);
                                        searchInput.blur();
                                    }
                                }
                            }
                            // إذا كان هناك نص، نترك Enter يعمل بشكل طبيعي (قد يكون المستخدم يريد البحث)
                        } else if (e.key === 'ArrowDown' && searchInput.value.trim() === '') {
                            // فقط إذا كان الحقل فارغاً، نسمح بالتنقل
                            e.preventDefault();
                            const currentItems = Array.from(document.querySelectorAll('.product-pick-item'));
                            const firstVisible = currentItems.find(item => item.style.display !== 'none');
                            if (firstVisible) {
                                const firstCell = firstVisible.querySelector('.excel-cell');
                                if (firstCell) {
                                    selectCell(firstCell);
                                    searchInput.blur();
                                }
                            }
                        }
                        // ✅ السماح بجميع المفاتيح الأخرى (أحرف، أرقام، إلخ) للكتابة العادية
                    };
                    
                    // إضافة event listeners
                    searchInput.addEventListener('input', inputHandler, { passive: true });
                    searchInput.addEventListener('keyup', keyupHandler, { passive: true });
                    searchInput.addEventListener('keydown', keydownHandler, { passive: false });
                    
                    // حفظ المراجع للتنظيف لاحقاً
                    searchInput._inputHandler = inputHandler;
                    searchInput._keyupHandler = keyupHandler;
                    searchInput._keydownHandler = keydownHandler;
                    
                    // إضافة event listener للصق (paste)
                    const pasteHandler = () => {
                        setTimeout(() => filter(), 10);
                    };
                    searchInput.addEventListener('paste', pasteHandler, { passive: true });
                    searchInput._pasteHandler = pasteHandler;
                    
                    // إضافة event listener للتغيير (change) كنسخة احتياطية
                    const changeHandler = () => {
                        Logger.log('🔍 Product search change event:', searchInput.value);
                        filter();
                    };
                    searchInput.addEventListener('change', changeHandler);
                    searchInput._changeHandler = changeHandler;
                    
                    Logger.log('✅ Search event listeners attached successfully');
                    
                    // ✅ Focus the search input after modal is opened - مع محاولات متعددة
                    const focusInput = () => {
                        try {
                            if (searchInput && document.body.contains(searchInput)) {
                                searchInput.focus();
                                searchInput.select();
                                
                                // ✅ اختبار الكتابة - محاولة كتابة حرف اختباري ثم حذفه
                                const testValue = searchInput.value;
                                searchInput.value = 'test';
                                if (searchInput.value === 'test') {
                                    searchInput.value = testValue;
                                    Logger.log('✅ Product picker search input is writable and focused');
                                } else {
                                    Logger.warn('⚠️ Search input may not be writable');
                                }
                            } else {
                                Logger.warn('⚠️ Search input not in DOM, retrying...');
                                setTimeout(focusInput, 100);
                            }
                        } catch (err) {
                            Logger.warn('⚠️ Could not focus search input:', err);
                            setTimeout(focusInput, 100);
                        }
                    };
                    
                    // محاولة فورية
                    setTimeout(focusInput, 100);
                    // محاولة إضافية بعد تأخير أطول
                    setTimeout(focusInput, 300);
                    setTimeout(focusInput, 500);
                };
                
                // Excel-like cell selection
                const selectCell = (cell) => {
                    if (!cell) return;
                    
                    // Remove previous selection
                    cells.forEach(c => {
                        c.style.outline = '';
                        c.style.outlineOffset = '';
                    });
                    
                    // Add selection outline (Excel-like)
                    cell.style.outline = '2px solid #316ac5';
                    cell.style.outlineOffset = '-2px';
                    
                    currentCell = cell;
                    currentRowIndex = parseInt(cell.dataset.row) || 0;
                    currentColIndex = parseInt(cell.dataset.col) || 0;
                    
                    // Highlight entire row
                    const row = cell.closest('tr');
                    if (row) {
                        items.forEach(r => {
                            const rowCells = r.querySelectorAll('.excel-cell');
                            rowCells.forEach(c => {
                                if (r === row) {
                                    c.style.backgroundColor = '#316ac5';
                                    c.style.color = 'white';
                                } else {
                                    const colIndex = parseInt(c.dataset.col) || 0;
                                    c.style.backgroundColor = colIndex === 0 ? '#f8f9fa' : '#fff';
                                    c.style.color = colIndex === 0 ? '#495057' : (colIndex === 5 ? '#28a745' : '#212529');
                                }
                            });
                        });
                        
                        selectedId = row.dataset.id;
                        const allProducts = this.products || [];
                        const activeProductsList = allProducts.filter(p => p.status !== 'inactive');
                        selectedProduct = activeProductsList.find(p => p.id === selectedId);
                    }
                    
                    // Scroll to cell
                    cell.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                };
                
                // Navigate to cell (updated for new column structure)
                const navigateToCell = (rowOffset, colOffset) => {
                    // الحصول على العناصر المرئية فقط من DOM
                    const visibleItems = Array.from(document.querySelectorAll('.product-pick-item'))
                        .filter(item => item.style.display !== 'none');
                    
                    if (visibleItems.length === 0) return;
                    
                    // العثور على الصف الحالي في قائمة العناصر المرئية
                    let currentVisibleIndex = -1;
                    if (currentCell) {
                        const currentRow = currentCell.closest('tr');
                        currentVisibleIndex = visibleItems.findIndex(item => item === currentRow);
                    }
                    
                    const newVisibleIndex = currentVisibleIndex + rowOffset;
                    const newCol = currentColIndex + colOffset;
                    
                    if (newVisibleIndex < 0 || newVisibleIndex >= visibleItems.length || newCol < 0 || newCol > 6) {
                        return; // Max 7 columns (0-6)
                    }
                    
                    const targetRow = visibleItems[newVisibleIndex];
                    if (!targetRow || targetRow.style.display === 'none') return;
                    
                    const targetCells = targetRow.querySelectorAll('.excel-cell');
                    const targetCell = Array.from(targetCells).find(c => parseInt(c.dataset.col) === newCol);
                    
                    if (targetCell) {
                        selectCell(targetCell);
                    }
                };
                
                // Filter function - يحصل على العناصر من DOM في كل مرة لضمان التحديث
                const filter = () => {
                    // ✅ الحصول على searchInput من النطاق الخارجي أو من DOM
                    const currentSearchInput = searchInput || document.getElementById('productPickerSearch') || window._currentProductSearchInput;
                    
                    if (!currentSearchInput) {
                        Logger.warn('⚠️ Search input not found in filter function');
                        return;
                    }
                    
                    // الحصول على العناصر من DOM في كل مرة للتأكد من التحديث
                    const currentItems = Array.from(document.querySelectorAll('.product-pick-item'));
                    const query = (currentSearchInput.value || '').toLowerCase().trim();
                    let visibleCount = 0;
                    
                    Logger.log('🔍 Filtering products with query:', query, 'Total items:', currentItems.length);
                    
                    if (!query) {
                        currentItems.forEach(item => {
                            item.style.display = '';
                            visibleCount++;
                        });
                    } else {
                        // الحصول على activeProducts من نطاق openProductPicker
                        const allProducts = this.products || [];
                        const activeProductsList = allProducts.filter(p => p.status !== 'inactive');
                        
                        currentItems.forEach(item => {
                            // Get product data from row attributes
                            const productId = item.dataset.id;
                            const productName = (item.dataset.name || '').toLowerCase();
                            const productCode = (item.dataset.code || '').toLowerCase();
                            
                            // Try to find category from product data
                            const product = activeProductsList.find(p => p.id === productId);
                            let categoryName = '';
                            if (product) {
                                const category = this.categories.find(c => c.id === product.categoryId);
                                categoryName = category ? category.name.toLowerCase() : '';
                            }
                            
                            // البحث في النص الكامل (الاسم، الكود، الفئة)
                            const searchText = `${productName} ${productCode} ${categoryName}`.trim();
                            const isVisible = searchText.includes(query);
                            item.style.display = isVisible ? '' : 'none';
                            if (isVisible) visibleCount++;
                        });
                    }
                    
                    // Update count badge
                    const countBadge = document.getElementById('productPickerCount');
                    if (countBadge) {
                        countBadge.textContent = visibleCount;
                        countBadge.className = visibleCount > 0 ? 'badge bg-primary' : 'badge bg-danger';
                    }
                    
                    Logger.log('✅ Filter completed. Visible items:', visibleCount);
                    
                    // Select first visible cell
                    const firstVisible = currentItems.find(item => item.style.display !== 'none');
                    if (firstVisible && !currentCell) {
                        const firstCell = firstVisible.querySelector('.excel-cell');
                        if (firstCell) selectCell(firstCell);
                    }
                };
                
                // Excel-like keyboard navigation
                const keyboardHandler = (e) => {
                    // ✅ Check if SweetAlert modal is still open
                    const swalContainer = document.querySelector('.swal2-container');
                    if (!swalContainer || swalContainer.style.display === 'none' || !swalContainer.classList.contains('swal2-show')) {
                        // Modal is closed, remove handler
                        if (document._productPickerKeyboardHandler) {
                            document.removeEventListener('keydown', document._productPickerKeyboardHandler);
                            document._productPickerKeyboardHandler = null;
                        }
                        return;
                    }
                    
                    // ✅ إذا كان المستخدم يكتب في حقل البحث، لا تتداخل معه
                    const activeElement = document.activeElement;
                    if (activeElement && (activeElement.id === 'productPickerSearch' || activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                        // السماح بالكتابة في حقل البحث أو أي حقل إدخال
                        // فقط معالجة الأسهم إذا كان المستخدم يريد التنقل
                        if (activeElement.id === 'productPickerSearch' && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                            // السماح بالتنقل فقط إذا كان الحقل فارغاً أو تم الضغط على Ctrl
                            if (activeElement.value.trim() === '' || e.ctrlKey) {
                                e.preventDefault();
                                const currentItems = Array.from(document.querySelectorAll('.product-pick-item'))
                                    .filter(item => item.style.display !== 'none');
                                const firstVisible = currentItems.find(item => item.style.display !== 'none');
                                if (firstVisible) {
                                    const firstCell = firstVisible.querySelector('.excel-cell');
                                    if (firstCell) {
                                        selectCell(firstCell);
                                        activeElement.blur();
                                    }
                                }
                            }
                        }
                        return; // لا تتداخل مع الكتابة
                    }
                    
                    // ✅ Check if we're inside the product picker modal (swalContainer already defined above)
                    if (swalContainer && !swalContainer.contains(activeElement)) {
                        // User is clicking outside the modal, ignore
                        return;
                    }
                    
                    // ✅ إذا لم يكن المستخدم يكتب في حقل البحث، استخدم التنقل العادي
                    if (!currentCell) return;
                    
                    switch(e.key) {
                        case 'ArrowUp':
                            e.preventDefault();
                            navigateToCell(-1, 0);
                            break;
                        case 'ArrowDown':
                            e.preventDefault();
                            navigateToCell(1, 0);
                            break;
                        case 'ArrowLeft':
                            e.preventDefault();
                            navigateToCell(0, -1);
                            break;
                        case 'ArrowRight':
                            e.preventDefault();
                            navigateToCell(0, 1);
                            break;
                        case 'Tab':
                            e.preventDefault();
                            navigateToCell(0, e.shiftKey ? -1 : 1);
                            break;
                        case 'Enter':
                            e.preventDefault();
                            if (selectedProduct) {
                                productHiddenInput.value = selectedProduct.id;
                                productDisplayInput.value = `${selectedProduct.name}${selectedProduct.code ? ' - ' + selectedProduct.code : ''}`;
                                // ✅ Cleanup keyboard handler before closing
                                if (document._productPickerKeyboardHandler) {
                                    document.removeEventListener('keydown', document._productPickerKeyboardHandler);
                                    document._productPickerKeyboardHandler = null;
                                }
                                Swal.close();
                                this.handleProductSelection(row, selectedProduct);
                            }
                            break;
                    }
                };
                
                // ✅ استدعاء initializeSearch لتهيئة البحث وإعداد event listeners
                initializeSearch();
                
                // ✅ انتظار حتى يتم تهيئة searchInput قبل إضافة keyboard handler
                const setupKeyboardHandler = () => {
                    // إزالة keyboard handler القديم إذا كان موجوداً
                    if (document._productPickerKeyboardHandler) {
                        document.removeEventListener('keydown', document._productPickerKeyboardHandler);
                        document._productPickerKeyboardHandler = null;
                    }
                    
                    // Cell click handler
                    if (cells.length > 0) {
                        cells.forEach(cell => {
                            // إزالة listeners القديمة أولاً
                            const newCell = cell.cloneNode(true);
                            cell.parentNode.replaceChild(newCell, cell);
                            
                            newCell.addEventListener('click', () => {
                                selectCell(newCell);
                            });
                        });
                    }
                    
                    // Add keyboard navigation listener - مرة واحدة فقط
                    document.addEventListener('keydown', keyboardHandler);
                    document._productPickerKeyboardHandler = keyboardHandler;
                    
                    // Store handler reference for cleanup
                    if (searchInput) {
                        searchInput._keyboardHandler = keyboardHandler;
                    }
                };
                
                // تأخير إعداد keyboard handler حتى يتم تهيئة searchInput
                setTimeout(setupKeyboardHandler, 200);
                    
                    // Row click handler (select entire row)
                    items.forEach(item => {
                        item.addEventListener('click', (e) => {
                            if (e.target.classList.contains('excel-cell')) return;
                            const firstCell = item.querySelector('.excel-cell');
                            if (firstCell) selectCell(firstCell);
                        });
                        
                        // Double click to select immediately
                        item.addEventListener('dblclick', () => {
                            selectedId = item.dataset.id;
                            const allProducts = this.products || [];
                            const activeProductsList = allProducts.filter(p => p.status !== 'inactive');
                            selectedProduct = activeProductsList.find(p => p.id === selectedId);
                            if (selectedProduct) {
                                productHiddenInput.value = selectedProduct.id;
                                productDisplayInput.value = `${selectedProduct.name}${selectedProduct.code ? ' - ' + selectedProduct.code : ''}`;
                                // ✅ Cleanup keyboard handler before closing
                                if (document._productPickerKeyboardHandler) {
                                    document.removeEventListener('keydown', document._productPickerKeyboardHandler);
                                    document._productPickerKeyboardHandler = null;
                                }
                                Swal.close();
                                this.handleProductSelection(row, selectedProduct);
                            }
                        });
                    });
                    
                    // Preselect current product
                    if (currentProductId) {
                        const current = items.find(x => x.dataset.id === currentProductId);
                        if (current) {
                            const firstCell = current.querySelector('.excel-cell');
                            if (firstCell) {
                                selectCell(firstCell);
                                setTimeout(() => {
                                    firstCell.scrollIntoView({ block: 'center', behavior: 'smooth' });
                                }, 100);
                            }
                        }
                    } else {
                        // Select first cell
                        const firstCell = cells[0];
                        if (firstCell) selectCell(firstCell);
                    }
                    
                    // Select all checkbox handler
                    const selectAllCheckbox = document.getElementById('selectAllProducts');
                    if (selectAllCheckbox) {
                        selectAllCheckbox.addEventListener('change', (e) => {
                            const checkboxes = document.querySelectorAll('.product-select-checkbox');
                            checkboxes.forEach(cb => {
                                if (cb.closest('tr').style.display !== 'none') {
                                    cb.checked = e.target.checked;
                                }
                            });
                        });
                    }
                    
                    // Update select all checkbox state when individual checkboxes change
                    items.forEach(item => {
                        const checkbox = item.querySelector('.product-select-checkbox');
                        if (checkbox) {
                            checkbox.addEventListener('change', () => {
                                const visibleCheckboxes = Array.from(document.querySelectorAll('.product-select-checkbox'))
                                    .filter(cb => cb.closest('tr').style.display !== 'none');
                                const checkedCheckboxes = visibleCheckboxes.filter(cb => cb.checked);
                                if (selectAllCheckbox) {
                                    selectAllCheckbox.checked = visibleCheckboxes.length > 0 && 
                                        checkedCheckboxes.length === visibleCheckboxes.length;
                                    selectAllCheckbox.indeterminate = checkedCheckboxes.length > 0 && 
                                        checkedCheckboxes.length < visibleCheckboxes.length;
                                }
                            });
                        }
                    });
                    
                    // Initial count update
                    filter();
                    
                    // Attach confirm handler - add multiple selected products
                    const confirmBtn = Swal.getConfirmButton();
                    confirmBtn.addEventListener('click', async () => {
                    const selectedCheckboxes = Array.from(document.querySelectorAll('.product-select-checkbox:checked'));
                    
                    if (selectedCheckboxes.length === 0) {
                        // If no checkboxes selected, use single selection (backward compatibility)
                        if (selectedId && selectedProduct) {
                            // Check if current row is empty, if not, find empty row or add new
                            const tbody = document.getElementById('purchaseItemsBody');
                            let targetRow = row;
                            
                            if (tbody) {
                                const currentProductId = productHiddenInput.value;
                                // If current row already has a product, find empty row or add new
                                if (currentProductId && currentProductId.trim() !== '') {
                                    const allRows = Array.from(tbody.querySelectorAll('tr'));
                                    const emptyRow = allRows.find(r => {
                                        const ph = r.querySelector('.product-select-id');
                                        return !ph || !ph.value || ph.value.trim() === '';
                                    });
                                    
                                    if (emptyRow) {
                                        targetRow = emptyRow;
                                    } else {
                                        this.addPurchaseItem();
                                        targetRow = tbody.querySelector('tr:last-child');
                                    }
                                    
                                    if (targetRow) {
                                        const targetProductInput = targetRow.querySelector('.product-display-input');
                                        const targetProductHidden = targetRow.querySelector('.product-select-id');
                                        if (targetProductInput && targetProductHidden) {
                                            targetProductHidden.value = selectedProduct.id;
                                            targetProductInput.value = `${selectedProduct.name}${selectedProduct.code ? ' - ' + selectedProduct.code : ''}`;
                                            await this.handleProductSelection(targetRow, selectedProduct);
                                        }
                                    }
                                } else {
                                    // Current row is empty, use it
                                    productHiddenInput.value = selectedProduct.id;
                                    productDisplayInput.value = `${selectedProduct.name}${selectedProduct.code ? ' - ' + selectedProduct.code : ''}`;
                                    await this.handleProductSelection(row, selectedProduct);
                                }
                            } else {
                                // Fallback to original behavior
                                productHiddenInput.value = selectedProduct.id;
                                productDisplayInput.value = `${selectedProduct.name}${selectedProduct.code ? ' - ' + selectedProduct.code : ''}`;
                                await this.handleProductSelection(row, selectedProduct);
                            }
                        }
                    } else {
                        // Add multiple products
                        const tbody = document.getElementById('purchaseItemsBody');
                        if (!tbody) return;
                        
                        const productsToAdd = [];
                        const allProducts = this.products || [];
                        const activeProductsList = allProducts.filter(p => p.status !== 'inactive');
                        for (const checkbox of selectedCheckboxes) {
                            const productId = checkbox.dataset.productId;
                            const product = activeProductsList.find(p => p.id === productId);
                            if (product) {
                                productsToAdd.push(product);
                            }
                        }
                        
                        // Find all empty rows first (rows without product selected)
                        const allRows = Array.from(tbody.querySelectorAll('tr'));
                        const emptyRows = allRows.filter(row => {
                            const productHidden = row.querySelector('.product-select-id');
                            return !productHidden || !productHidden.value || productHidden.value.trim() === '';
                        });
                        
                        // Add products one by one - use empty rows first, then add new rows
                        for (let i = 0; i < productsToAdd.length; i++) {
                            const product = productsToAdd[i];
                            let targetRow = null;
                            
                            // Try to use empty row first
                            if (i < emptyRows.length) {
                                targetRow = emptyRows[i];
                            } else {
                                // No empty rows available, add new row
                                this.addPurchaseItem();
                                targetRow = tbody.querySelector('tr:last-child');
                            }
                            
                            if (targetRow) {
                                const productInput = targetRow.querySelector('.product-display-input');
                                const productHidden = targetRow.querySelector('.product-select-id');
                                if (productInput && productHidden) {
                                    productHidden.value = product.id;
                                    productInput.value = `${product.name}${product.code ? ' - ' + product.code : ''}`;
                                    await this.handleProductSelection(targetRow, product);
                                }
                            }
                            
                            // Small delay to prevent UI blocking for large selections
                            if (i < productsToAdd.length - 1) {
                                await new Promise(resolve => setTimeout(resolve, 50));
                            }
                        }
                        
                        // Show success message
                        if (productsToAdd.length > 0) {
                            if (typeof showSuccess === 'function') {
                                showSuccess(`تم إضافة ${productsToAdd.length} منتج بنجاح`);
                            } else {
                                Logger.log(`✅ تم إضافة ${productsToAdd.length} منتج بنجاح`);
                            }
                        }
                    }
                    Swal.close();
                }, { once: true });
            },
            // ✅ Cleanup keyboard handler when modal is closed (for any reason: cancel, escape, outside click)
            willClose: () => {
                Logger.log('🧹 Cleaning up product picker keyboard handler...');
                // Remove keyboard handler
                if (document._productPickerKeyboardHandler) {
                    document.removeEventListener('keydown', document._productPickerKeyboardHandler);
                    document._productPickerKeyboardHandler = null;
                    Logger.log('✅ Product picker keyboard handler removed');
                }
                // Cleanup search input reference
                if (window._currentProductSearchInput) {
                    delete window._currentProductSearchInput;
                }
            }
        });
    },

    /**
     * Open unit picker modal for selecting a unit
     * @param {HTMLElement} row - The table row element
     * @param {Array} availableUnits - Array of available units for the product
     * @param {Object} product - The product object
     */
    openUnitPicker(row, availableUnits, product) {
        if (!row || !availableUnits || availableUnits.length === 0) return;
        
        const unitDisplayInput = row.querySelector('.unit-display-input');
        const unitHiddenInput = row.querySelector('.unit-select-id');
        const currentUnitId = unitHiddenInput?.value || '';
        
        // Get invoice currency and exchange rate
        const invoiceCurrency = document.getElementById('purchaseCurrency')?.value || 'IQD';
        const invoiceExchangeRate = parseFloat(document.getElementById('purchaseExchangeRate')?.value) || 1;
        const currencies = this.currencies || [];
        
        // Helper function to convert price from unit currency to invoice currency
        const convertPriceToInvoiceCurrency = (unitPrice, unitCurrency) => {
            if (!unitPrice || unitPrice <= 0) return { price: 0, currency: invoiceCurrency };
            
            // If currencies are the same, no conversion needed
            if (unitCurrency === invoiceCurrency) {
                return { price: unitPrice, currency: invoiceCurrency };
            }
            
            // Get currency objects
            const unitCurrencyObj = currencies.find(c => c.code === unitCurrency);
            const invoiceCurrencyObj = currencies.find(c => c.code === invoiceCurrency);
            
            if (!unitCurrencyObj || !invoiceCurrencyObj) {
                // Fallback: use invoice exchange rate if available
                if (invoiceExchangeRate && invoiceExchangeRate > 0 && invoiceExchangeRate !== 1) {
                    return { price: unitPrice * invoiceExchangeRate, currency: invoiceCurrency };
                }
                return { price: unitPrice, currency: unitCurrency };
            }
            
            // Get base currency
            const baseCurrency = currencies.find(c => c.isBaseCurrency)?.code || 'IQD';
            
            // Convert: unit currency -> base currency -> invoice currency
            let priceInBase = unitPrice;
            
            // Step 1: Convert from unit currency to base currency
            if (unitCurrency !== baseCurrency) {
                if (unitCurrencyObj.exchangeRate && unitCurrencyObj.exchangeRate > 0) {
                    priceInBase = unitPrice / unitCurrencyObj.exchangeRate;
                } else {
                    Logger.warn(`⚠️ Exchange rate not found for unit currency: ${unitCurrency}`);
                    return { price: unitPrice, currency: unitCurrency };
                }
            }
            
            // Step 2: Convert from base currency to invoice currency
            let convertedPrice = priceInBase;
            if (invoiceCurrency !== baseCurrency) {
                if (invoiceCurrencyObj.exchangeRate && invoiceCurrencyObj.exchangeRate > 0) {
                    convertedPrice = priceInBase * invoiceCurrencyObj.exchangeRate;
                } else {
                    Logger.warn(`⚠️ Exchange rate not found for invoice currency: ${invoiceCurrency}`);
                    convertedPrice = priceInBase;
                }
            }
            
            return { price: convertedPrice, currency: invoiceCurrency };
        };
        
        // Create unit picker content
        const content = `
            <div style="text-align: start;">
                <div class="mb-3">
                    <div class="input-group input-group-lg">
                        <span class="input-group-text" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none;">
                            <i class="fas fa-search"></i>
                        </span>
                        <input type="text" id="unitPickerSearch" class="form-control form-control-lg" 
                               placeholder="ابحث عن الوحدة..." 
                               style="border-right: none; font-size: 1rem;">
                        <span class="input-group-text" style="background: #f8f9fa; border-left: none;">
                            <span class="badge bg-primary" id="unitPickerCount">${availableUnits.length}</span>
                        </span>
                    </div>
                </div>
                <div class="table-responsive" style="max-height: 400px; overflow-y: auto; border: 2px solid #d0d7e5; border-radius: 4px; background: #fff;">
                    <table class="table table-bordered mb-0" id="unitPickerTable" 
                           style="margin-bottom: 0; border-collapse: collapse; width: 100%; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                        <thead style="background: #f2f3f4; position: sticky; top: 0; z-index: 10;">
                            <tr>
                                <th width="10%" style="border: 1px solid #d0d7e5; padding: 8px; text-align: center; font-weight: 600; font-size: 0.85rem; background: #e7e9ec !important;">#</th>
                                <th width="30%" style="border: 1px solid #d0d7e5; padding: 8px; font-weight: 600; font-size: 0.85rem; background: #e7e9ec !important;">اسم الوحدة</th>
                                <th width="20%" style="border: 1px solid #d0d7e5; padding: 8px; font-weight: 600; font-size: 0.85rem; background: #e7e9ec !important;">النوع</th>
                                <th width="20%" style="border: 1px solid #d0d7e5; padding: 8px; font-weight: 600; font-size: 0.85rem; background: #e7e9ec !important;">معامل التحويل</th>
                                <th width="20%" style="border: 1px solid #d0d7e5; padding: 8px; text-align: center; font-weight: 600; font-size: 0.85rem; background: #e7e9ec !important;">السعر</th>
                            </tr>
                        </thead>
                        <tbody id="unitPickerList" style="background-color: #fff;">
                            ${availableUnits.map((unitItem, index) => {
                                const isSelected = unitItem.unit.id === currentUnitId;
                                const rowId = `unit-row-${unitItem.unit.id}`;
                                let typeText = '';
                                if (unitItem.isMain) {
                                    typeText = 'الوحدة الأساسية';
                                } else {
                                    typeText = unitItem.conversionType === 'multiply' ? 'ضرب' : 'قسمة';
                                }
                                
                                // Convert price to invoice currency
                                const unitPrice = unitItem.price || 0;
                                const unitCurrency = unitItem.currency || 'IQD';
                                const converted = convertPriceToInvoiceCurrency(unitPrice, unitCurrency);
                                
                                return `
                                    <tr class="unit-pick-item" 
                                        data-id="${unitItem.unit.id}" 
                                        data-unit-item='${JSON.stringify(unitItem).replace(/'/g, "&apos;")}'
                                        id="${rowId}"
                                        style="cursor: pointer; ${isSelected ? 'background-color: #316ac5 !important; color: white;' : ''}">
                                        <td class="excel-cell" 
                                            data-row="${index}" 
                                            data-col="0"
                                            style="border: 1px solid #d0d7e5; padding: 6px 8px; text-align: center; background: ${isSelected ? '#316ac5' : '#f8f9fa'}; color: ${isSelected ? 'white' : '#495057'}; font-weight: 600; font-size: 0.85rem; min-width: 50px;">
                                            ${index + 1}
                                        </td>
                                        <td class="excel-cell" 
                                            data-row="${index}" 
                                            data-col="1"
                                            style="border: 1px solid #d0d7e5; padding: 6px 8px; background: ${isSelected ? '#316ac5' : '#fff'}; color: ${isSelected ? 'white' : '#212529'}; font-size: 0.9rem; min-width: 150px;">
                                            ${this.escapeHtml(unitItem.unit.name)}
                                        </td>
                                        <td class="excel-cell" 
                                            data-row="${index}" 
                                            data-col="2"
                                            style="border: 1px solid #d0d7e5; padding: 6px 8px; background: ${isSelected ? '#316ac5' : '#fff'}; color: ${isSelected ? 'white' : '#495057'}; font-size: 0.9rem; min-width: 100px;">
                                            ${typeText}
                                        </td>
                                        <td class="excel-cell" 
                                            data-row="${index}" 
                                            data-col="3"
                                            style="border: 1px solid #d0d7e5; padding: 6px 8px; background: ${isSelected ? '#316ac5' : '#fff'}; color: ${isSelected ? 'white' : '#495057'}; font-size: 0.9rem; min-width: 100px;">
                                            ${unitItem.isMain ? '-' : unitItem.conversion}
                                        </td>
                                        <td class="excel-cell" 
                                            data-row="${index}" 
                                            data-col="4"
                                            style="border: 1px solid #d0d7e5; padding: 6px 8px; text-align: center; background: ${isSelected ? '#316ac5' : '#fff'}; color: ${isSelected ? 'white' : '#28a745'}; font-weight: 600; font-size: 0.9rem; min-width: 100px;">
                                            ${formatNumber(converted.price)} ${converted.currency}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="mt-3 p-2" style="background: #f8f9fa; border-radius: 6px; border-right: 4px solid #667eea;">
                    <small class="text-muted" style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem;">
                        <i class="fas fa-info-circle text-primary"></i>
                        <span>انقر على الوحدة للاختيار، أو استخدم الأسهم للتنقل و Enter للاختيار</span>
                    </small>
                </div>
            </div>
        `;
        
        Swal.fire({
            title: 'اختيار الوحدة',
            html: content,
            width: 800,
            showCancelButton: true,
            confirmButtonText: 'اختيار',
            cancelButtonText: 'إلغاء',
            focusConfirm: false,
            didOpen: () => {
                const searchInput = document.getElementById('unitPickerSearch');
                // Focus the search input after modal is opened (accessibility fix)
                if (searchInput) {
                    setTimeout(() => {
                        searchInput.focus();
                    }, 100);
                }
                const items = Array.from(document.querySelectorAll('.unit-pick-item'));
                let selectedUnitItem = null;
                
                // Filter function
                const filter = () => {
                    const query = (searchInput.value || '').toLowerCase().trim();
                    let visibleCount = 0;
                    
                    if (!query) {
                        items.forEach(item => {
                            item.style.display = '';
                            visibleCount++;
                        });
                    } else {
                        items.forEach(item => {
                            try {
                                const unitItem = JSON.parse(item.dataset.unitItem.replace(/&apos;/g, "'"));
                                const unit = unitItem.unit || {};
                                const searchText = `${unit.name || ''}`.toLowerCase();
                                const isVisible = searchText.includes(query);
                                item.style.display = isVisible ? '' : 'none';
                                if (isVisible) visibleCount++;
                            } catch (e) {
                                item.style.display = 'none';
                            }
                        });
                    }
                    
                    // Update count badge
                    const countBadge = document.getElementById('unitPickerCount');
                    if (countBadge) {
                        countBadge.textContent = visibleCount;
                        countBadge.className = visibleCount > 0 ? 'badge bg-primary' : 'badge bg-danger';
                    }
                };
                
                // Setup search input event listeners
                if (searchInput) {
                    searchInput.addEventListener('input', filter);
                    // Also trigger filter on keyup for better responsiveness
                    searchInput.addEventListener('keyup', filter);
                    // Trigger filter on paste
                    searchInput.addEventListener('paste', () => {
                        setTimeout(filter, 10);
                    });
                }
                
                // Row click handler
                items.forEach(item => {
                    item.addEventListener('click', () => {
                        // Remove previous selection
                        items.forEach(i => {
                            i.style.backgroundColor = '';
                            i.style.color = '';
                            i.querySelectorAll('.excel-cell').forEach(cell => {
                                cell.style.backgroundColor = '';
                                cell.style.color = '';
                            });
                        });
                        
                        // Highlight selected row
                        item.style.backgroundColor = '#316ac5';
                        item.style.color = 'white';
                        item.querySelectorAll('.excel-cell').forEach(cell => {
                            cell.style.backgroundColor = '#316ac5';
                            cell.style.color = 'white';
                        });
                        
                        try {
                            selectedUnitItem = JSON.parse(item.dataset.unitItem.replace(/&apos;/g, "'"));
                        } catch (e) {
                            console.error('Error parsing unit item:', e);
                        }
                    });
                    
                    // Double click to select immediately
                    item.addEventListener('dblclick', () => {
                        try {
                            selectedUnitItem = JSON.parse(item.dataset.unitItem.replace(/&apos;/g, "'"));
                            if (selectedUnitItem && selectedUnitItem.unit) {
                                this.selectUnit(row, selectedUnitItem, product);
                                Swal.close();
                            }
                        } catch (e) {
                            console.error('Error parsing unit item:', e);
                        }
                    });
                });
                
                // Keyboard navigation
                searchInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const firstVisible = items.find(item => item.style.display !== 'none');
                        if (firstVisible) {
                            try {
                                selectedUnitItem = JSON.parse(firstVisible.dataset.unitItem.replace(/&apos;/g, "'"));
                                if (selectedUnitItem && selectedUnitItem.unit) {
                                    this.selectUnit(row, selectedUnitItem, product);
                                    Swal.close();
                                }
                            } catch (err) {
                                console.error('Error parsing unit item:', err);
                            }
                        }
                    } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        const visibleItems = items.filter(item => item.style.display !== 'none');
                        const currentIndex = visibleItems.findIndex(item => item.style.backgroundColor === '#316ac5');
                        const nextIndex = currentIndex < visibleItems.length - 1 ? currentIndex + 1 : 0;
                        if (visibleItems[nextIndex]) {
                            visibleItems[nextIndex].click();
                        }
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        const visibleItems = items.filter(item => item.style.display !== 'none');
                        const currentIndex = visibleItems.findIndex(item => item.style.backgroundColor === '#316ac5');
                        const prevIndex = currentIndex > 0 ? currentIndex - 1 : visibleItems.length - 1;
                        if (visibleItems[prevIndex]) {
                            visibleItems[prevIndex].click();
                        }
                    }
                });
                
                // Preselect current unit
                if (currentUnitId) {
                    const current = items.find(x => {
                        try {
                            const unitItem = JSON.parse(x.dataset.unitItem.replace(/&apos;/g, "'"));
                            return unitItem.unit && unitItem.unit.id === currentUnitId;
                        } catch (e) {
                            return false;
                        }
                    });
                    if (current) {
                        current.click();
                        setTimeout(() => {
                            current.scrollIntoView({ block: 'center', behavior: 'smooth' });
                        }, 100);
                    }
                } else {
                    // Select first item
                    if (items.length > 0) {
                        items[0].click();
                    }
                }
                
                // Initial filter
                filter();
                
                // Attach confirm handler
                const confirmBtn = Swal.getConfirmButton();
                confirmBtn.addEventListener('click', () => {
                    if (selectedUnitItem && selectedUnitItem.unit) {
                        this.selectUnit(row, selectedUnitItem, product);
                    }
                    Swal.close();
                }, { once: true });
            }
        });
    },

    /**
     * Select unit and update row
     */
    selectUnit(row, unitItem, product) {
        const unitDisplayInput = row.querySelector('.unit-display-input');
        const unitHiddenInput = row.querySelector('.unit-select-id');
        
        if (unitDisplayInput && unitHiddenInput && unitItem && unitItem.unit) {
            let displayName = unitItem.unit.name;
            const hasSubUnits = product.subUnits && product.subUnits.length > 0;
            if (unitItem.isMain && hasSubUnits) {
                displayName = `${unitItem.unit.name} (الوحدة الأساسية)`;
            } else if (!unitItem.isMain) {
                displayName = `${unitItem.unit.name} (${unitItem.conversion})`;
            }
            
            unitDisplayInput.value = displayName;
            unitHiddenInput.value = unitItem.unit.id;
            
            // Trigger unit selection to update price
            this.handleUnitSelection(row, unitItem, product);
        }
    },

    /**
     * Update row numbers after adding/removing rows
     */
    updateRowNumbers() {
        const tbody = document.getElementById('purchaseItemsBody');
        if (!tbody) return;
        
        // Use children instead of querySelectorAll for better performance
        const rows = tbody.children;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowIndex = i + 1;
            row.dataset.rowIndex = rowIndex;
            
            // Update row number cell
            const numberCell = row.querySelector('td:nth-child(2)');
            if (numberCell) {
                numberCell.textContent = rowIndex;
            }
            
            // Update checkbox data attribute
            const checkbox = row.querySelector('.row-select-checkbox');
            if (checkbox) {
                checkbox.dataset.rowIndex = rowIndex;
            }
        }
    },

    /**
     * Setup Excel-like navigation (Tab and Enter)
     */
    setupExcelNavigation(row) {
        // ✅ Check if already setup to prevent duplicates
        if (row.dataset.excelNavigationSetup === 'true') {
            Logger.log('⚠️ Excel navigation already setup for this row, skipping...');
            return;
        }
        
        // Get all editable inputs in the row (excluding readonly and disabled)
        // Order: product, quantity, price, discount-percent, discount-amount, addition-percent, addition-amount, expiry, serial, notes
        const inputSelectors = [
            '.product-display-input',
            '.quantity-input',
            '.price-input',
            '.discount-percent-input',
            '.discount-amount-input',
            '.addition-percent-input',
            '.addition-amount-input',
            '.expiry-date-input',
            '.serial-number-input',
            '.notes-input'
        ];
        
        const editableInputs = [];
        inputSelectors.forEach(selector => {
            const input = row.querySelector(selector);
            if (input && !input.readOnly && !input.disabled) {
                editableInputs.push(input);
            }
        });
        
        editableInputs.forEach((input, index) => {
            // ✅ Create handler function and store it for cleanup
            const excelKeydownHandler = (e) => {
                if (e.key === 'Tab' && !e.shiftKey) {
                    e.preventDefault();
                    
                    // Find next editable input in same row
                    const nextIndex = index + 1;
                    if (nextIndex < editableInputs.length) {
                        editableInputs[nextIndex].focus();
                        editableInputs[nextIndex].select();
                    } else {
                        // Move to first input of next row - use nextElementSibling for better performance
                        const nextRow = row.nextElementSibling;
                        
                        if (nextRow) {
                            const firstInput = nextRow.querySelector(inputSelectors[0]);
                            if (firstInput) {
                                firstInput.focus();
                                firstInput.select();
                            }
                        } else {
                            // If no next row, add a new row
                            this.addPurchaseItem();
                            setTimeout(() => {
                                const tbody = row.closest('tbody');
                                const newRow = tbody.querySelector('tr:last-child');
                                if (newRow) {
                                    const firstInput = newRow.querySelector(inputSelectors[0]);
                                    if (firstInput) {
                                        firstInput.focus();
                                        firstInput.select();
                                    }
                                }
                            }, 100);
                        }
                    }
                } else if (e.key === 'Tab' && e.shiftKey) {
                    e.preventDefault();
                    
                    // Find previous editable input in same row
                    const prevIndex = index - 1;
                    if (prevIndex >= 0) {
                        editableInputs[prevIndex].focus();
                        editableInputs[prevIndex].select();
                    } else {
                        // Move to last input of previous row - use previousElementSibling for better performance
                        const prevRow = row.previousElementSibling;
                        
                        if (prevRow) {
                            const lastInput = prevRow.querySelector(inputSelectors[inputSelectors.length - 1]);
                            if (lastInput) {
                                lastInput.focus();
                                lastInput.select();
                            }
                        }
                    }
                }
                
                // Enter key - move to next row, same column (Excel-like behavior)
                if (e.key === 'Enter') {
                    // For product picker, open picker on Enter
                    if (input.classList.contains('product-display-input')) {
                        const row = input.closest('tr');
                        if (row) {
                            this.openProductPicker(row);
                        }
                        return;
                    }
                    
                    // Check if this is an autocomplete field with dropdown open
                    const autocompleteContainer = input.closest('.autocomplete-container');
                    if (autocompleteContainer) {
                        const dropdown = autocompleteContainer.querySelector('.autocomplete-dropdown');
                        // If dropdown is visible, don't handle Enter here - let autocomplete handle it
                        if (dropdown && dropdown.style.display !== 'none' && dropdown.style.display !== '') {
                            // Dropdown is open, let autocomplete handle selection
                            // The selectItem function will handle moving to next row after selection
                            return;
                        }
                    }
                    
                    e.preventDefault();
                    e.stopPropagation(); // Prevent autocomplete from handling Enter
                    
                    // Close any open autocomplete dropdowns first
                    const openDropdowns = document.querySelectorAll('.autocomplete-dropdown[style*="display: block"], .autocomplete-dropdown[style*="display:block"]');
                    openDropdowns.forEach(dropdown => {
                        dropdown.style.display = 'none';
                    });
                    
                    // Find the same column in the next row - use nextElementSibling for better performance
                    const currentColumnIndex = Array.from(row.cells).indexOf(input.closest('td'));
                    const nextRow = row.nextElementSibling;
                    
                    if (nextRow) {
                        const nextCell = nextRow.cells[currentColumnIndex];
                        if (nextCell) {
                            // Find the same type of input in next row
                            // For product picker, find the display input
                            let nextInput = null;
                            
                            if (input.classList.contains('product-display-input')) {
                                nextInput = nextCell.querySelector('.product-display-input');
                            } else {
                                const autocompleteContainer = nextCell.querySelector('.autocomplete-container');
                                if (autocompleteContainer) {
                                    nextInput = autocompleteContainer.querySelector('input[type="text"]');
                                } else {
                                    nextInput = nextCell.querySelector(input.tagName === 'INPUT' ? 'input:not([readonly]):not([disabled])' : 'select:not([disabled])');
                                }
                            }
                            
                            if (nextInput) {
                                nextInput.focus();
                                if (nextInput.tagName === 'INPUT' && nextInput.type === 'text') {
                                    nextInput.select();
                                }
                            }
                        }
                    } else {
                        // If no next row, add a new row and focus on the same column
                        this.addPurchaseItem();
                        setTimeout(() => {
                            const newRow = tbody.querySelector('tr:last-child');
                            if (newRow) {
                                const newCell = newRow.cells[currentColumnIndex];
                                if (newCell) {
                                    // For product picker, find the display input
                                    let newInput = null;
                                    
                                    if (input.classList.contains('product-display-input')) {
                                        newInput = newCell.querySelector('.product-display-input');
                                    } else {
                                        const autocompleteContainer = newCell.querySelector('.autocomplete-container');
                                        if (autocompleteContainer) {
                                            newInput = autocompleteContainer.querySelector('input[type="text"]');
                                        } else {
                                            newInput = newCell.querySelector(input.tagName === 'INPUT' ? 'input:not([readonly]):not([disabled])' : 'select:not([disabled])');
                                        }
                                    }
                                    
                                    if (newInput) {
                                        newInput.focus();
                                        if (newInput.tagName === 'INPUT' && newInput.type === 'text') {
                                            newInput.select();
                                        }
                                    }
                                }
                            }
                        }, 100);
                    }
                }
            };
            
            // ✅ Remove existing handler if any
            if (input._excelKeydownHandler) {
                input.removeEventListener('keydown', input._excelKeydownHandler);
            }
            
            // ✅ Store handler and add listener
            input._excelKeydownHandler = excelKeydownHandler;
            input.addEventListener('keydown', excelKeydownHandler);
        });
        
        // Add checkbox event listener
        const checkbox = row.querySelector('.row-select-checkbox');
        if (checkbox) {
            // ✅ Create handler function and store it for cleanup
            const checkboxChangeHandler = () => {
                // Update select all checkbox state
                const allCheckboxes = document.querySelectorAll('.row-select-checkbox');
                const checkedCheckboxes = document.querySelectorAll('.row-select-checkbox:checked');
                const selectAllCheckbox = document.getElementById('selectAllRows');
                if (selectAllCheckbox) {
                    selectAllCheckbox.checked = allCheckboxes.length === checkedCheckboxes.length && allCheckboxes.length > 0;
                    selectAllCheckbox.indeterminate = checkedCheckboxes.length > 0 && checkedCheckboxes.length < allCheckboxes.length;
                }
            };
            
            // ✅ Remove existing handler if any
            if (checkbox._checkboxChangeHandler) {
                checkbox.removeEventListener('change', checkbox._checkboxChangeHandler);
            }
            
            // ✅ Store handler and add listener
            checkbox._checkboxChangeHandler = checkboxChangeHandler;
            checkbox.addEventListener('change', checkboxChangeHandler);
        }
        
        // ✅ Mark row as setup
        row.dataset.excelNavigationSetup = 'true';
    },

    /**
     * Copy selected rows
     */
    copySelectedRows() {
        const selectedRows = this.getSelectedRows();
        if (selectedRows.length === 0) {
            if (typeof showError === 'function') {
                showError('يرجى تحديد صف واحد على الأقل للنسخ');
            } else {
                alert('يرجى تحديد صف واحد على الأقل للنسخ');
            }
            return;
        }
        
        // Store copied rows data
        this.copiedRows = selectedRows.map(row => {
            const rowData = {
                productId: row.querySelector('.product-select-id')?.value || '',
                productName: row.querySelector('.product-display-input')?.value || '',
                quantity: row.querySelector('.quantity-input')?.value || '1',
                unitId: row.querySelector('.unit-select-id')?.value || '',
                unitName: row.querySelector('.unit-autocomplete-container input')?.value || '',
                price: row.querySelector('.price-input')?.value || '0',
                discountPercent: row.querySelector('.discount-percent-input')?.value || '0',
                discountAmount: row.querySelector('.discount-amount-input')?.value || '0',
                additionPercent: row.querySelector('.addition-percent-input')?.value || '0',
                additionAmount: row.querySelector('.addition-amount-input')?.value || '0',
                expiryDate: row.querySelector('.expiry-date-input')?.value || '',
                serialNumber: row.querySelector('.serial-number-input')?.value || '',
                notes: row.querySelector('.notes-input')?.value || ''
            };
            return rowData;
        });
        
        if (typeof showSuccess === 'function') {
            showSuccess(`تم نسخ ${selectedRows.length} صف بنجاح`);
        } else {
            Logger.log(`✅ Copied ${selectedRows.length} rows`);
        }
    },

    /**
     * Paste rows
     */
    async pasteRows() {
        if (!this.copiedRows || this.copiedRows.length === 0) {
            if (typeof showError === 'function') {
                showError('لا توجد صفوف منسوخة للصق');
            } else {
                alert('لا توجد صفوف منسوخة للصق');
            }
            return;
        }
        
        const tbody = document.getElementById('purchaseItemsBody');
        if (!tbody) return;
        
        // Add new rows for each copied row
        for (const rowData of this.copiedRows) {
            this.addPurchaseItem();
            const newRow = tbody.querySelector('tr:last-child');
            
                    if (newRow && rowData.productId) {
                        // Set product
                        const productInput = newRow.querySelector('.product-display-input');
                        const productHiddenInput = newRow.querySelector('.product-select-id');
                
                if (productInput && productHiddenInput) {
                    productInput.value = rowData.productName;
                    productHiddenInput.value = rowData.productId;
                    
                    // Trigger product selection to load units
                    const product = this.products.find(p => p.id === rowData.productId);
                    if (product) {
                        await this.handleProductSelection(newRow, product);
                        
                        // After units are loaded, set the unit
                        if (rowData.unitId) {
                            setTimeout(() => {
                                const unitInput = newRow.querySelector('.unit-autocomplete-container input[type="text"]');
                                const unitHiddenInput = newRow.querySelector('.unit-select-id');
                                if (unitInput) unitInput.value = rowData.unitName;
                                if (unitHiddenInput) unitHiddenInput.value = rowData.unitId;
                            }, 200);
                        }
                    }
                }
                
                // Set other fields
                const quantityInput = newRow.querySelector('.quantity-input');
                const priceInput = newRow.querySelector('.price-input');
                const discountPercentInput = newRow.querySelector('.discount-percent-input');
                const discountAmountInput = newRow.querySelector('.discount-amount-input');
                const additionPercentInput = newRow.querySelector('.addition-percent-input');
                const additionAmountInput = newRow.querySelector('.addition-amount-input');
                const expiryDateInput = newRow.querySelector('.expiry-date-input');
                const serialNumberInput = newRow.querySelector('.serial-number-input');
                const notesInput = newRow.querySelector('.notes-input');
                
                if (quantityInput) quantityInput.value = rowData.quantity;
                if (priceInput) priceInput.value = rowData.price;
                if (discountPercentInput) discountPercentInput.value = rowData.discountPercent;
                if (discountAmountInput) discountAmountInput.value = rowData.discountAmount;
                if (additionPercentInput) additionPercentInput.value = rowData.additionPercent;
                if (additionAmountInput) additionAmountInput.value = rowData.additionAmount;
                if (expiryDateInput) expiryDateInput.value = rowData.expiryDate;
                if (serialNumberInput) serialNumberInput.value = rowData.serialNumber;
                if (notesInput) notesInput.value = rowData.notes;
                
                // Calculate total
                this.calculateItemTotal(newRow);
            }
        }
        
        this.updateRowNumbers();
        this.calculatePurchaseTotals();
        
        if (typeof showSuccess === 'function') {
            showSuccess(`تم لصق ${this.copiedRows.length} صف بنجاح`);
        } else {
            Logger.log(`✅ Pasted ${this.copiedRows.length} rows`);
        }
    },

    /**
     * Delete selected rows
     */
    deleteSelectedRows() {
        const selectedRows = this.getSelectedRows();
        if (selectedRows.length === 0) {
            if (typeof showError === 'function') {
                showError('يرجى تحديد صف واحد على الأقل للحذف');
            } else {
                alert('يرجى تحديد صف واحد على الأقل للحذف');
            }
            return;
        }
        
        // Confirm deletion
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'تأكيد الحذف',
                text: `هل أنت متأكد من حذف ${selectedRows.length} صف؟`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'نعم، احذف',
                cancelButtonText: 'إلغاء',
                confirmButtonColor: '#dc3545'
            }).then((result) => {
                        if (result.isConfirmed) {
                            selectedRows.forEach(row => row.remove());
                            this.updateRowNumbers();
                            this.calculatePurchaseTotals();
                            
                            // Update scroll buttons after deletion
                            setTimeout(() => {
                                const container = document.getElementById('purchaseItemsTableContainer');
                                if (container) {
                                    container.dispatchEvent(new Event('scroll'));
                                }
                            }, 50);
                            
                            if (typeof showSuccess === 'function') {
                                showSuccess(`تم حذف ${selectedRows.length} صف بنجاح`);
                            }
                        }
            });
        } else {
                    if (confirm(`هل أنت متأكد من حذف ${selectedRows.length} صف؟`)) {
                        selectedRows.forEach(row => row.remove());
                        this.updateRowNumbers();
                        this.calculatePurchaseTotals();
                        
                        // Update scroll buttons after deletion
                        setTimeout(() => {
                            const container = document.getElementById('purchaseItemsTableContainer');
                            if (container) {
                                container.dispatchEvent(new Event('scroll'));
                            }
                        }, 50);
                    }
        }
    },

    /**
     * Get selected rows
     */
    getSelectedRows() {
        const checkboxes = document.querySelectorAll('.row-select-checkbox:checked');
        const selectedRows = [];
        
        checkboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            if (row) {
                selectedRows.push(row);
            }
        });
        
        return selectedRows;
    },

    /**
     * Toggle select all rows
     */
    toggleSelectAllRows(checked) {
        const checkboxes = document.querySelectorAll('.row-select-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
    },

    /**
     * Handle product selection and initialize unit autocomplete
     */
    async handleProductSelection(row, product) {
        try {
            // Get full product data
            const fullProduct = await Collections.getProduct(product.id);
            if (!fullProduct) {
                if (typeof showError === 'function') {
                    showError('المنتج المحدد غير موجود');
                }
                return;
            }

            // Get available units for this product
            const availableUnits = [];
            const productCurrency = fullProduct.currency || 'IQD';
            const hasSubUnits = fullProduct.subUnits && fullProduct.subUnits.length > 0;

            // Add main unit
            if (fullProduct.unitId) {
                const mainUnit = this.units.find(u => u.id === fullProduct.unitId);
                if (mainUnit) {
                    availableUnits.push({
                        unit: mainUnit,
                        price: fullProduct.purchasePrice || 0,
                        currency: productCurrency,
                        conversion: 1,
                        conversionType: 'multiply',
                        isMain: true
                    });
                }
            }

            // Add sub-units
            if (hasSubUnits) {
                const mainUnitPrice = fullProduct.purchasePrice || 0;
                fullProduct.subUnits.forEach(subUnit => {
                    const unit = this.units.find(u => u.id === subUnit.unitId);
                    if (unit) {
                        let subUnitPrice;
                        if (subUnit.purchasePrice !== undefined && subUnit.purchasePrice !== null && subUnit.purchasePrice > 0) {
                            subUnitPrice = subUnit.purchasePrice;
                        } else {
                            const conversionType = subUnit.conversionType || 'multiply';
                            const conversionFactor = parseFloat(subUnit.conversionValue || subUnit.conversionFactor) || 1;
                            if (mainUnitPrice > 0) {
                                if (conversionType === 'multiply') {
                                    subUnitPrice = mainUnitPrice * conversionFactor;
                                } else if (conversionType === 'divide') {
                                    subUnitPrice = mainUnitPrice / conversionFactor;
                                } else {
                                    subUnitPrice = mainUnitPrice;
                                }
                            } else {
                                subUnitPrice = 0;
                            }
                        }
                        availableUnits.push({
                            unit: unit,
                            price: subUnitPrice,
                            currency: productCurrency,
                            conversion: parseFloat(subUnit.conversionValue || subUnit.conversionFactor) || 1,
                            conversionType: subUnit.conversionType || 'multiply',
                            isMain: false
                        });
                    }
                });
            }

            // Initialize unit picker (modal instead of autocomplete)
            const unitContainer = row.querySelector('.unit-autocomplete-container');
            const unitHiddenInput = row.querySelector('.unit-select-id');
            if (unitContainer && unitHiddenInput && availableUnits.length > 0) {
                // Create input field with button to open unit picker
                unitContainer.innerHTML = `
                    <div class="input-group">
                        <input type="text" class="form-control form-control-sm unit-display-input" 
                               placeholder="اختر الوحدة" 
                               readonly 
                               style="background-color: #f8f9fa; cursor: pointer;"
                               data-row-id="${row.dataset.rowId || ''}">
                        <button class="btn btn-outline-secondary btn-sm unit-picker-btn" type="button" title="اختر الوحدة">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                `;
                
                const unitDisplayInput = unitContainer.querySelector('.unit-display-input');
                const unitPickerBtn = unitContainer.querySelector('.unit-picker-btn');
                
                // Store available units in row dataset
                row.dataset.availableUnits = JSON.stringify(availableUnits);
                row.dataset.productId = fullProduct.id;
                
                // Open unit picker on click
                if (unitDisplayInput) {
                    unitDisplayInput.addEventListener('click', () => {
                        this.openUnitPicker(row, availableUnits, fullProduct);
                    });
                }
                if (unitPickerBtn) {
                    unitPickerBtn.addEventListener('click', () => {
                        this.openUnitPicker(row, availableUnits, fullProduct);
                    });
                }
                
                // Set default unit (main unit) - use setTimeout to ensure DOM is ready
                setTimeout(() => {
                    const mainUnitItem = availableUnits.find(u => u.isMain);
                    if (mainUnitItem && unitDisplayInput) {
                        let displayName = mainUnitItem.unit.name;
                        if (mainUnitItem.isMain && hasSubUnits) {
                            displayName = `${mainUnitItem.unit.name} (الوحدة الأساسية)`;
                        }
                        unitDisplayInput.value = displayName;
                        unitHiddenInput.value = mainUnitItem.unit.id;
                        // Trigger unit selection to update price
                        this.handleUnitSelection(row, mainUnitItem, fullProduct);
                    }
                }, 100);
            }

            // Store product data in row
            row.dataset.productCurrency = productCurrency;
            row.dataset.productId = fullProduct.id;

            // Show/hide expiry date and serial number fields based on product constraints
            const expiryDateInput = row.querySelector('.expiry-date-input');
            const serialNumberInput = row.querySelector('.serial-number-input');
            
            if (expiryDateInput) {
                const hasExpiry = fullProduct.hasExpiryDate || false;
                const forceExpiry = fullProduct.forceExpiryOnInput || false;
                
                // Show field if product has expiry date tracking
                expiryDateInput.style.display = hasExpiry ? 'block' : 'none';
                
                // Make required if hasExpiryDate OR forceExpiryOnInput is true
                // If product has expiry tracking, it should be required even if not forced
                expiryDateInput.required = hasExpiry || forceExpiry;
                
                // Add visual indicator if required
                if (hasExpiry || forceExpiry) {
                    expiryDateInput.classList.add('required-field');
                    expiryDateInput.setAttribute('data-constraint', 'expiry-required');
                } else {
                    expiryDateInput.classList.remove('required-field');
                    expiryDateInput.removeAttribute('data-constraint');
                }
                
                if (!hasExpiry) {
                    expiryDateInput.value = '';
                }
            }

            if (serialNumberInput) {
                const hasSerial = fullProduct.hasSerialNumber || false;
                const forceSerial = fullProduct.forceSerialOnInput || false;
                
                // Show field if product has serial number tracking
                serialNumberInput.style.display = hasSerial ? 'block' : 'none';
                
                // Make required if hasSerialNumber OR forceSerialOnInput is true
                // If product has serial tracking, it should be required even if not forced
                serialNumberInput.required = hasSerial || forceSerial;
                
                // Add visual indicator if required
                if (hasSerial || forceSerial) {
                    serialNumberInput.classList.add('required-field');
                    serialNumberInput.setAttribute('data-constraint', 'serial-required');
                } else {
                    serialNumberInput.classList.remove('required-field');
                    serialNumberInput.removeAttribute('data-constraint');
                }
                
                if (!hasSerial) {
                    serialNumberInput.value = '';
                }
            }
            
            // Store constraint flags in row dataset for validation
            row.dataset.hasExpiry = (fullProduct.hasExpiryDate || false).toString();
            row.dataset.hasSerial = (fullProduct.hasSerialNumber || false).toString();
            row.dataset.forceExpiry = (fullProduct.forceExpiryOnInput || false).toString();
            row.dataset.forceSerial = (fullProduct.forceSerialOnInput || false).toString();

            // ✅ لا نستدعي calculateItemTotal هنا لأن الوحدة الافتراضية لم يتم تعيينها بعد
            // سيتم استدعاؤها تلقائياً من handleUnitSelection → updatePriceForSelectedUnit → calculateItemTotal
            // this.calculateItemTotal(row); // ❌ تم إزالة هذا الاستدعاء لأن الوحدة لم يتم تعيينها بعد
            
            // Validate constraints after product selection
            this.validateProductConstraints(row);

        } catch (error) {
            Logger.error('Error handling product selection:', error);
            if (typeof showError === 'function') {
                showError('خطأ في تحميل بيانات المنتج: ' + error.message);
            }
        }
    },

    /**
     * Validate product constraints for a row
     * التحقق من قيود المنتج في الصف
     */
    validateProductConstraints(row) {
        const productHiddenInput = row.querySelector('.product-select-id');
        if (!productHiddenInput || !productHiddenInput.value) {
            return true; // No product selected, no constraints to validate
        }

        const productId = productHiddenInput.value;
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            return true; // Product not found, skip validation
        }

        let isValid = true;
        const hasExpiry = product.hasExpiryDate || false;
        const hasSerial = product.hasSerialNumber || false;
        const forceExpiry = product.forceExpiryOnInput || false;
        const forceSerial = product.forceSerialOnInput || false;

        // Validate expiry date constraint
        // Check if expiry is required (either forceExpiryOnInput OR hasExpiryDate is true)
        if (hasExpiry || forceExpiry) {
            const expiryDateInput = row.querySelector('.expiry-date-input');
            if (expiryDateInput) {
                // Check if field is visible (should be visible if hasExpiry is true)
                const isVisible = expiryDateInput.style.display !== 'none';
                if (isVisible && (!expiryDateInput.value || expiryDateInput.value.trim() === '')) {
                    expiryDateInput.classList.add('is-invalid', 'required-field');
                    expiryDateInput.setAttribute('placeholder', 'تاريخ الصلاحية مطلوب *');
                    isValid = false;
                } else {
                    expiryDateInput.classList.remove('is-invalid');
                    expiryDateInput.removeAttribute('placeholder');
                }
            }
        }

        // Validate serial number constraint
        // Check if serial is required (either forceSerialOnInput OR hasSerialNumber is true)
        if (hasSerial || forceSerial) {
            const serialNumberInput = row.querySelector('.serial-number-input');
            if (serialNumberInput) {
                // Check if field is visible (should be visible if hasSerial is true)
                const isVisible = serialNumberInput.style.display !== 'none';
                if (isVisible) {
                    const quantity = parseFloat(row.querySelector('.quantity-input')?.value) || 0;
                    
                    // If quantity > 1 and forceSerialOnInput, we might need multiple serial numbers
                    // For now, we'll just check if at least one serial number is entered
                    if (!serialNumberInput.value || serialNumberInput.value.trim() === '') {
                        serialNumberInput.classList.add('is-invalid', 'required-field');
                        serialNumberInput.setAttribute('placeholder', quantity > 1 ? 
                            `الرقم التسلسلي مطلوب (${quantity} أرقام)` : 'الرقم التسلسلي مطلوب *');
                        isValid = false;
                    } else {
                        serialNumberInput.classList.remove('is-invalid');
                        serialNumberInput.removeAttribute('placeholder');
                    }
                }
            }
        }

        return isValid;
    },

    /**
     * Handle unit selection
     */
    handleUnitSelection(row, unitItem, product) {
        const priceInput = row.querySelector('.price-input');
        if (priceInput && unitItem) {
            // Store unit data in row
            row.dataset.selectedUnitId = unitItem.unit.id;
            row.dataset.unitPrice = unitItem.price;
            row.dataset.unitCurrency = unitItem.currency;
            row.dataset.unitConversion = unitItem.conversion;
            row.dataset.unitConversionType = unitItem.conversionType;

            // Update price
            this.updatePriceForSelectedUnit(row);
        }
    },

    /**
     * Setup purchase item row event listeners (Advanced Excel-like)
     */
    setupPurchaseItemListeners(row) {
        if (!row) {
            Logger.warn('⚠️ setupPurchaseItemListeners: row is null or undefined');
            return;
        }
        
        // ✅ Check if already setup to prevent duplicates
        if (row.dataset.purchaseItemListenersSetup === 'true') {
            Logger.log('⚠️ Purchase item listeners already setup for this row, skipping...');
            return;
        }
        
        // Initialize Product picker button
        const productDisplayInput = row.querySelector('.product-display-input');
        const productHiddenInput = row.querySelector('.product-select-id');
        const productPickerBtn = row.querySelector('.product-picker-btn');
        
        // ✅ Always log to console for debugging (not just in dev mode)
        console.log('🔧 setupPurchaseItemListeners called for row:', row);
        console.log('   - productDisplayInput:', !!productDisplayInput, productDisplayInput);
        console.log('   - productHiddenInput:', !!productHiddenInput, productHiddenInput);
        console.log('   - productPickerBtn:', !!productPickerBtn, productPickerBtn);
        
        Logger.log('🔧 setupPurchaseItemListeners called for row:', row);
        Logger.log('   - productDisplayInput:', !!productDisplayInput, productDisplayInput);
        Logger.log('   - productHiddenInput:', !!productHiddenInput, productHiddenInput);
        Logger.log('   - productPickerBtn:', !!productPickerBtn, productPickerBtn);
        
        if (!productDisplayInput || !productHiddenInput || !productPickerBtn) {
            console.error('❌ setupPurchaseItemListeners: Required elements not found', {
                productDisplayInput: !!productDisplayInput,
                productHiddenInput: !!productHiddenInput,
                productPickerBtn: !!productPickerBtn,
                rowHTML: row.outerHTML.substring(0, 300)
            });
            Logger.error('❌ setupPurchaseItemListeners: Required elements not found', {
                productDisplayInput: !!productDisplayInput,
                productHiddenInput: !!productHiddenInput,
                productPickerBtn: !!productPickerBtn,
                rowHTML: row.outerHTML.substring(0, 300)
            });
            return;
        }
        
        // ✅ Create handler function - store it on the element for potential cleanup
        const openPickerHandler = (e) => {
            // ✅ Always log to console for debugging
            console.log('🖱️ ========== Product picker CLICKED ==========');
            console.log('   - Event type:', e.type);
            console.log('   - Target:', e.target);
            console.log('   - Current target:', e.currentTarget);
            console.log('   - Row:', row);
            console.log('   - Button element:', productPickerBtn);
            
            Logger.log('🖱️ ========== Product picker CLICKED ==========');
            Logger.log('   - Event type:', e.type);
            Logger.log('   - Target:', e.target);
            Logger.log('   - Current target:', e.currentTarget);
            Logger.log('   - Row:', row);
            Logger.log('   - Button element:', productPickerBtn);
            
            e.stopPropagation(); // ✅ Prevent event bubbling
            e.preventDefault(); // ✅ Prevent default behavior
            
            try {
                console.log('   - Calling openProductPicker...');
                Logger.log('   - Calling openProductPicker...');
                this.openProductPicker(row);
                console.log('   - ✅ openProductPicker called successfully');
                Logger.log('   - ✅ openProductPicker called successfully');
            } catch (error) {
                console.error('   - ❌ Error calling openProductPicker:', error);
                console.error('   - Error stack:', error.stack);
                Logger.error('   - ❌ Error calling openProductPicker:', error);
                Logger.error('   - Error stack:', error.stack);
            }
        };
        
        // ✅ Create keydown handler
        const keydownHandler = (e) => {
            if (e.key === 'Enter') {
                console.log('⌨️ Enter key pressed in product input');
                Logger.log('⌨️ Enter key pressed in product input');
                e.preventDefault();
                e.stopPropagation();
                try {
                    this.openProductPicker(row);
                } catch (error) {
                    console.error('❌ Error calling openProductPicker from keydown:', error);
                    Logger.error('❌ Error calling openProductPicker from keydown:', error);
                }
            }
        };
        
        // ✅ Remove any existing listeners first (if any)
        if (productDisplayInput._openPickerHandler) {
            productDisplayInput.removeEventListener('click', productDisplayInput._openPickerHandler);
            console.log('🧹 Removed old click listener from productDisplayInput');
            Logger.log('🧹 Removed old click listener from productDisplayInput');
        }
        if (productDisplayInput._keydownHandler) {
            productDisplayInput.removeEventListener('keydown', productDisplayInput._keydownHandler);
            console.log('🧹 Removed old keydown listener from productDisplayInput');
            Logger.log('🧹 Removed old keydown listener from productDisplayInput');
        }
        if (productPickerBtn._openPickerHandler) {
            productPickerBtn.removeEventListener('click', productPickerBtn._openPickerHandler);
            console.log('🧹 Removed old click listener from productPickerBtn');
            Logger.log('🧹 Removed old click listener from productPickerBtn');
        }
        
        // ✅ Store handlers on elements for potential cleanup
        productDisplayInput._openPickerHandler = openPickerHandler;
        productDisplayInput._keydownHandler = keydownHandler;
        productPickerBtn._openPickerHandler = openPickerHandler;
        
        // ✅ Use onclick as fallback in addition to addEventListener
        // This ensures the handler works even if addEventListener fails
        productDisplayInput.onclick = (e) => {
            console.log('🖱️ onclick handler triggered on productDisplayInput');
            Logger.log('🖱️ onclick handler triggered on productDisplayInput');
            openPickerHandler(e);
        };
        
        productPickerBtn.onclick = (e) => {
            console.log('🖱️ onclick handler triggered on productPickerBtn');
            Logger.log('🖱️ onclick handler triggered on productPickerBtn');
            openPickerHandler(e);
        };
        
        // Make input clickable to open picker
        productDisplayInput.addEventListener('click', openPickerHandler, { passive: false, capture: false });
        console.log('✅ Added click listener to productDisplayInput');
        Logger.log('✅ Added click listener to productDisplayInput');
        
        // Make button open picker
        productPickerBtn.addEventListener('click', openPickerHandler, { passive: false, capture: false });
        console.log('✅ Added click listener to productPickerBtn');
        Logger.log('✅ Added click listener to productPickerBtn');
        
        // Allow Enter key to open picker (Excel mode)
        productDisplayInput.addEventListener('keydown', keydownHandler, { passive: false, capture: false });
        console.log('✅ Added keydown listener to productDisplayInput');
        Logger.log('✅ Added keydown listener to productDisplayInput');
        
        // ✅ Also add mousedown and mouseup to catch all click variations
        productPickerBtn.addEventListener('mousedown', (e) => {
            console.log('🖱️ mousedown on productPickerBtn');
            Logger.log('🖱️ mousedown on productPickerBtn');
        }, { passive: false });
        
        productPickerBtn.addEventListener('mouseup', (e) => {
            console.log('🖱️ mouseup on productPickerBtn');
            Logger.log('🖱️ mouseup on productPickerBtn');
            openPickerHandler(e);
        }, { passive: false });
        
        // ✅ Test if listeners are working by checking if element is clickable
        console.log('✅ Product picker event listeners attached successfully');
        console.log('   - productDisplayInput.style.pointerEvents:', productDisplayInput.style.pointerEvents);
        console.log('   - productPickerBtn.style.pointerEvents:', productPickerBtn.style.pointerEvents);
        console.log('   - productDisplayInput.disabled:', productDisplayInput.disabled);
        console.log('   - productPickerBtn.disabled:', productPickerBtn.disabled);
        console.log('   - productPickerBtn.onclick:', productPickerBtn.onclick);
        console.log('   - productPickerBtn type:', productPickerBtn.type);
        
        Logger.log('✅ Product picker event listeners attached successfully');
        Logger.log('   - productDisplayInput.style.pointerEvents:', productDisplayInput.style.pointerEvents);
        Logger.log('   - productPickerBtn.style.pointerEvents:', productPickerBtn.style.pointerEvents);
        Logger.log('   - productDisplayInput.disabled:', productDisplayInput.disabled);
        Logger.log('   - productPickerBtn.disabled:', productPickerBtn.disabled);
        Logger.log('   - productPickerBtn.onclick:', productPickerBtn.onclick);
        Logger.log('   - productPickerBtn type:', productPickerBtn.type);
        
        // ✅ Test click programmatically to verify listener works
        setTimeout(() => {
            console.log('🧪 Testing if button is clickable...');
            Logger.log('🧪 Testing if button is clickable...');
            const rect = productPickerBtn.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(productPickerBtn);
            console.log('   - Button position:', rect);
            console.log('   - Button visible:', rect.width > 0 && rect.height > 0);
            console.log('   - Button computed pointer-events:', computedStyle.pointerEvents);
            console.log('   - Button computed display:', computedStyle.display);
            console.log('   - Button computed visibility:', computedStyle.visibility);
            console.log('   - Button computed opacity:', computedStyle.opacity);
            console.log('   - Button computed z-index:', computedStyle.zIndex);
            
            Logger.log('   - Button position:', rect);
            Logger.log('   - Button visible:', rect.width > 0 && rect.height > 0);
            Logger.log('   - Button computed pointer-events:', computedStyle.pointerEvents);
            Logger.log('   - Button computed display:', computedStyle.display);
            Logger.log('   - Button computed visibility:', computedStyle.visibility);
            Logger.log('   - Button computed opacity:', computedStyle.opacity);
            Logger.log('   - Button computed z-index:', computedStyle.zIndex);
            
            // ✅ Test if button is actually clickable by checking if it's covered
            const elementAtPoint = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
            console.log('   - Element at button center:', elementAtPoint);
            console.log('   - Is button itself?', elementAtPoint === productPickerBtn || productPickerBtn.contains(elementAtPoint));
            Logger.log('   - Element at button center:', elementAtPoint);
            Logger.log('   - Is button itself?', elementAtPoint === productPickerBtn || productPickerBtn.contains(elementAtPoint));
        }, 100);

        // Initialize Unit autocomplete (will be populated when product is selected)
        const unitContainer = row.querySelector('.unit-autocomplete-container');
        const unitHiddenInput = row.querySelector('.unit-select-id');
        if (unitContainer && unitHiddenInput) {
            // Add placeholder text until product is selected
            unitContainer.innerHTML = `
                <input type="text" class="form-control form-control-sm" 
                       placeholder="اختر المنتج أولاً" 
                       disabled 
                       style="width: 100%; background-color: #f8f9fa; cursor: not-allowed;">
            `;
            // Unit autocomplete will be initialized when product is selected
            row.dataset.unitContainerReady = 'true';
        }

        const priceInput = row.querySelector('.price-input');
        const expiryDateInput = row.querySelector('.expiry-date-input');
        const serialNumberInput = row.querySelector('.serial-number-input');
        
        // Validate constraints on expiry date input
        if (expiryDateInput) {
            expiryDateInput.addEventListener('input', () => {
                this.validateProductConstraints(row);
            });
            expiryDateInput.addEventListener('blur', () => {
                this.validateProductConstraints(row);
            });
        }
        
        // Validate constraints on serial number input
        if (serialNumberInput) {
            serialNumberInput.addEventListener('input', () => {
                this.validateProductConstraints(row);
            });
            serialNumberInput.addEventListener('blur', () => {
                this.validateProductConstraints(row);
            });
        }

        // Old product select and unit select code removed - now using autocomplete
        // The old select elements no longer exist in the HTML

        // Quantity, price, discount, addition percentage changes
        const quantityInput = row.querySelector('.quantity-input');
        const discountPercentInput = row.querySelector('.discount-percent-input');
        const discountAmountInput = row.querySelector('.discount-amount-input');
        const additionPercentInput = row.querySelector('.addition-percent-input');
        const additionAmountInput = row.querySelector('.addition-amount-input');

        // Validate quantity input
        if (quantityInput) {
            quantityInput.addEventListener('input', () => {
                const quantity = parseFloat(quantityInput.value) || 0;
                if (quantity < 0) {
                    quantityInput.value = '0';
                }
                this.calculateItemTotal(row);
                // Validate constraints when quantity changes (for serial numbers per quantity)
                this.validateProductConstraints(row);
            });
            
            quantityInput.addEventListener('blur', () => {
                const quantity = parseFloat(quantityInput.value) || 0;
                if (quantity <= 0) {
                    quantityInput.setCustomValidity('الكمية يجب أن تكون أكبر من صفر');
                    quantityInput.reportValidity();
                } else {
                    quantityInput.setCustomValidity('');
                }
                // Validate constraints on blur
                this.validateProductConstraints(row);
            });
        }

        // Validate price input and track manual price changes (single implementation)
        if (priceInput) {
            let isManualPriceChange = false;
            
            priceInput.addEventListener('focus', () => {
                // Mark that user is about to manually edit the price
                isManualPriceChange = true;
            });
            
            priceInput.addEventListener('input', () => {
                const price = parseFloat(priceInput.value) || 0;
                if (price < 0) {
                    priceInput.value = '0';
                }
                
                // Mark that price was manually changed
                if (isManualPriceChange) {
                    row.dataset.manualPriceChange = 'true';
                }
                
                this.calculateItemTotal(row);
            });
            
            priceInput.addEventListener('blur', () => {
                const price = parseFloat(priceInput.value) || 0;
                const productHiddenInput = row.querySelector('.product-select-id');
                
                if (productHiddenInput && productHiddenInput.value && price <= 0) {
                    priceInput.setCustomValidity('السعر يجب أن يكون أكبر من صفر');
                    priceInput.reportValidity();
                } else {
                    priceInput.setCustomValidity('');
                }
                
                isManualPriceChange = false;
            });
        }

        // Other inputs
        [discountPercentInput, additionPercentInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    this.calculateItemTotal(row);
                });
            }
        });

        // Discount percentage to amount conversion
        // عند إدخال نسبة الخصم، يتم حساب المبلغ تلقائياً
        if (discountPercentInput) {
            discountPercentInput.addEventListener('input', () => {
                const quantity = parseFloat(quantityInput.value) || 0;
                const price = parseFloat(priceInput.value) || 0;
                const discountPercent = parseFloat(discountPercentInput.value) || 0;
                const subtotal = quantity * price;
                
                if (subtotal > 0 && discountPercent > 0) {
                    const discountAmount = (subtotal * discountPercent) / 100;
                    if (discountAmountInput) {
                        discountAmountInput.value = discountAmount.toFixed(2);
                    }
                } else if (discountPercent === 0) {
                    if (discountAmountInput) {
                        discountAmountInput.value = '0';
                    }
                }
                this.calculateItemTotal(row);
            });
        }

        // Discount amount to percentage conversion
        // عند إدخال مبلغ الخصم، يتم حساب النسبة تلقائياً
        if (discountAmountInput) {
            discountAmountInput.addEventListener('blur', () => {
                // عند الانتهاء من الكتابة، قم بالحساب
                const quantity = parseFloat(quantityInput.value) || 0;
                const price = parseFloat(priceInput.value) || 0;
                const discountAmount = parseFloat(discountAmountInput.value) || 0;
                const subtotal = quantity * price;
                
                if (subtotal > 0 && discountAmount > 0) {
                    const discountPercent = (discountAmount / subtotal) * 100;
                    if (discountPercentInput && discountPercent <= 100) {
                        discountPercentInput.value = discountPercent.toFixed(2);
                    } else if (discountPercent > 100) {
                        // إذا تجاوزت النسبة 100%، امسح النسبة واترك المبلغ كما هو
                        if (discountPercentInput) {
                            discountPercentInput.value = '0';
                        }
                    }
                } else if (discountAmount === 0) {
                    if (discountPercentInput) {
                        discountPercentInput.value = '0';
                    }
                }
                this.calculateItemTotal(row);
            });
        }

        // Addition percentage to amount conversion
        // عند إدخال نسبة الإضافة، يتم حساب المبلغ تلقائياً
        if (additionPercentInput) {
            additionPercentInput.addEventListener('input', () => {
                const quantity = parseFloat(quantityInput.value) || 0;
                const price = parseFloat(priceInput.value) || 0;
                const additionPercent = parseFloat(additionPercentInput.value) || 0;
                const subtotal = quantity * price;
                
                if (subtotal > 0 && additionPercent > 0) {
                    const additionAmount = (subtotal * additionPercent) / 100;
                    if (additionAmountInput) {
                        additionAmountInput.value = additionAmount.toFixed(2);
                    }
                } else if (additionPercent === 0) {
                    if (additionAmountInput) {
                        additionAmountInput.value = '0';
                    }
                }
                this.calculateItemTotal(row);
            });
        }

        // Addition amount to percentage conversion
        // عند إدخال مبلغ الإضافة، يتم حساب النسبة تلقائياً
        if (additionAmountInput) {
            additionAmountInput.addEventListener('blur', () => {
                // عند الانتهاء من الكتابة، قم بالحساب
                const quantity = parseFloat(quantityInput.value) || 0;
                const price = parseFloat(priceInput.value) || 0;
                const additionAmount = parseFloat(additionAmountInput.value) || 0;
                const subtotal = quantity * price;
                
                if (subtotal > 0 && additionAmount > 0) {
                    const additionPercent = (additionAmount / subtotal) * 100;
                    if (additionPercentInput && additionPercent <= 100) {
                        additionPercentInput.value = additionPercent.toFixed(2);
                    } else if (additionPercent > 100) {
                        // إذا تجاوزت النسبة 100%، امسح النسبة واترك المبلغ كما هو
                        if (additionPercentInput) {
                            additionPercentInput.value = '0';
                        }
                    }
                } else if (additionAmount === 0) {
                    if (additionPercentInput) {
                        additionPercentInput.value = '0';
                    }
                }
                this.calculateItemTotal(row);
            });
        }

        // Remove item
        // Setup Excel-like navigation (Tab and Enter)
        this.setupExcelNavigation(row);

        const removeBtn = row.querySelector('.remove-item');
        if (removeBtn) {
            const removeHandler = () => {
                row.remove();
                this.updateRowNumbers();
                this.calculatePurchaseTotals();
                
                // Update scroll buttons after deletion
                setTimeout(() => {
                    const container = document.getElementById('purchaseItemsTableContainer');
                    if (container) {
                        container.dispatchEvent(new Event('scroll'));
                    }
                }, 50);
            };
            removeBtn.addEventListener('click', removeHandler);
            removeBtn._removeHandler = removeHandler;
        }
        
        // ✅ Mark row as setup
        row.dataset.purchaseItemListenersSetup = 'true';
    },

    /**
     * Update price based on selected unit
     * Converts price from product currency to invoice currency
     * Note: Product prices are stored in product's currency and converted to invoice currency
     * @param {HTMLElement} row - The table row element
     */
    updatePriceForSelectedUnit(row) {
        const priceInput = row.querySelector('.price-input');
        
        if (!priceInput) {
            Logger.warn('⚠️ Price input not found in row');
            return;
        }
        
        // Get unit data from row dataset (set by handleUnitSelection)
        const unitPrice = parseFloat(row.dataset.unitPrice) || 0;
        const productCurrency = row.dataset.unitCurrency || 'IQD';
        
        if (unitPrice > 0) {
            const invoiceCurrency = document.getElementById('purchaseCurrency')?.value || 'IQD';
            const invoiceExchangeRate = parseFloat(document.getElementById('purchaseExchangeRate')?.value) || 1;
            
            // Validate price
            if (isNaN(unitPrice) || unitPrice < 0) {
                Logger.warn('⚠️ Invalid unit price:', unitPrice);
                priceInput.value = '0';
                this.calculateItemTotal(row);
                return;
            }
            
            // Additional validation: ensure price is greater than 0
            if (unitPrice === 0) {
                Logger.warn('⚠️ Unit price is zero');
            }
            
            // Convert price from product currency to invoice currency
            let convertedPrice = unitPrice;
            
            if (productCurrency !== invoiceCurrency) {
                // Get exchange rates for both currencies
                const productCurrencyObj = this.currencies.find(c => c.code === productCurrency);
                const invoiceCurrencyObj = this.currencies.find(c => c.code === invoiceCurrency);
                
                if (productCurrencyObj && invoiceCurrencyObj) {
                    // Get base currency
                    const baseCurrency = this.currencies.find(c => c.isBaseCurrency)?.code || 'IQD';
                    
                    // Convert: product currency -> base currency -> invoice currency
                    let priceInBase = unitPrice;
                    
                    // Step 1: Convert from product currency to base currency
                    if (productCurrency !== baseCurrency) {
                        if (productCurrencyObj.exchangeRate && productCurrencyObj.exchangeRate > 0) {
                            // If product currency is not base, divide by exchange rate to get base currency value
                            priceInBase = unitPrice / productCurrencyObj.exchangeRate;
                        } else {
                            Logger.warn(`⚠️ Exchange rate not found for product currency: ${productCurrency}`);
                        }
                    }
                    
                    // Step 2: Convert from base currency to invoice currency
                    if (invoiceCurrency !== baseCurrency) {
                        if (invoiceCurrencyObj.exchangeRate && invoiceCurrencyObj.exchangeRate > 0) {
                            // If invoice currency is not base, multiply by exchange rate to get invoice currency value
                            convertedPrice = priceInBase * invoiceCurrencyObj.exchangeRate;
                        } else {
                            Logger.warn(`⚠️ Exchange rate not found for invoice currency: ${invoiceCurrency}`);
                            convertedPrice = priceInBase;
                        }
                    } else {
                        convertedPrice = priceInBase;
                    }
                } else {
                    // Fallback: use invoice exchange rate if available
                    if (invoiceExchangeRate && invoiceExchangeRate > 0 && invoiceExchangeRate !== 1) {
                        // If product currency not found, assume it's in base currency and convert using invoice rate
                        convertedPrice = unitPrice * invoiceExchangeRate;
                    } else {
                        Logger.warn('⚠️ Currency objects not found, using original price');
                        convertedPrice = unitPrice;
                    }
                }
            }
            
            // Validate converted price
            if (isNaN(convertedPrice) || convertedPrice < 0) {
                Logger.warn('⚠️ Invalid converted price:', convertedPrice);
                convertedPrice = 0;
            }
            
            priceInput.value = convertedPrice.toFixed(2);
            
            // Store original price and currency in row data for reference
            row.dataset.originalPrice = unitPrice.toString();
            row.dataset.originalCurrency = productCurrency;
            row.dataset.convertedPrice = convertedPrice.toString();
            row.dataset.invoiceCurrency = invoiceCurrency;
            
            // Recalculate item total after price update
            this.calculateItemTotal(row);
        } else {
            // No unit price, clear price
            priceInput.value = '0';
            delete row.dataset.originalPrice;
            delete row.dataset.originalCurrency;
            delete row.dataset.convertedPrice;
            delete row.dataset.invoiceCurrency;
            this.calculateItemTotal(row);
        }
    },

    /**
     * Calculate total for a single item (Excel-like)
     */
    calculateItemTotal(row, skipDiscountUpdate = false, skipAdditionUpdate = false) {
        const quantity = parseFloat(row.querySelector('.quantity-input').value) || 0;
        const price = parseFloat(row.querySelector('.price-input').value) || 0;
        const subtotal = quantity * price;
        
        // Get discount values
        const discountPercentInput = row.querySelector('.discount-percent-input');
        const discountAmountInput = row.querySelector('.discount-amount-input');
        const discountPercent = discountPercentInput ? parseFloat(discountPercentInput.value) || 0 : 0;
        const discountAmountEntered = discountAmountInput ? parseFloat(discountAmountInput.value) || 0 : 0;
        
        // Check if discount amount input is focused (user is typing)
        const isDiscountFocused = discountAmountInput && document.activeElement === discountAmountInput;
        
        // Calculate discount amount
        // إذا كانت النسبة محددة، احسب المبلغ من النسبة
        // إذا كان المبلغ مدخل يدوياً، استخدمه مباشرة
        let discountAmount = 0;
        if (discountPercent > 0 && subtotal > 0) {
            const calculatedDiscountAmount = (subtotal * discountPercent) / 100;
            // إذا كان المبلغ المدخل يطابق المحسوب (مع هامش خطأ صغير)، استخدم المحسوب
            // وإلا استخدم المبلغ المدخل (المستخدم أدخل مبلغاً يدوياً)
            if (Math.abs(discountAmountEntered - calculatedDiscountAmount) < 0.01) {
                discountAmount = calculatedDiscountAmount;
            } else {
                discountAmount = discountAmountEntered;
            }
        } else {
            discountAmount = discountAmountEntered;
        }
        
        // Get addition values
        const additionPercentInput = row.querySelector('.addition-percent-input');
        const additionAmountInput = row.querySelector('.addition-amount-input');
        const additionPercent = additionPercentInput ? parseFloat(additionPercentInput.value) || 0 : 0;
        const additionAmountEntered = additionAmountInput ? parseFloat(additionAmountInput.value) || 0 : 0;
        
        // Check if addition amount input is focused (user is typing)
        const isAdditionFocused = additionAmountInput && document.activeElement === additionAmountInput;
        
        // Calculate addition amount
        // إذا كانت النسبة محددة، احسب المبلغ من النسبة
        // إذا كان المبلغ مدخل يدوياً، استخدمه مباشرة
        let additionAmount = 0;
        if (additionPercent > 0 && subtotal > 0) {
            const calculatedAdditionAmount = (subtotal * additionPercent) / 100;
            // إذا كان المبلغ المدخل يطابق المحسوب (مع هامش خطأ صغير)، استخدم المحسوب
            // وإلا استخدم المبلغ المدخل (المستخدم أدخل مبلغاً يدوياً)
            if (Math.abs(additionAmountEntered - calculatedAdditionAmount) < 0.01) {
                additionAmount = calculatedAdditionAmount;
            } else {
                additionAmount = additionAmountEntered;
            }
        } else {
            additionAmount = additionAmountEntered;
        }
        
        const total = subtotal - discountAmount + additionAmount;
        
        // Calculate net price per unit (صافي السعر للوحدة)
        // صافي السعر = سعر الوحدة - (مبلغ الخصم / الكمية) + (مبلغ الإضافة / الكمية)
        let netPrice = price;
        if (quantity > 0) {
            const discountPerUnit = discountAmount / quantity;
            const additionPerUnit = additionAmount / quantity;
            netPrice = price - discountPerUnit + additionPerUnit;
        }
        // التأكد من أن صافي السعر غير سالب
        netPrice = Math.max(0, netPrice);

        // Update display values - لا تقم بتحديث الحقل إذا كان المستخدم يكتب فيه
        if (discountAmountInput && !skipDiscountUpdate && !isDiscountFocused) {
            discountAmountInput.value = discountAmount.toFixed(2);
        }
        if (additionAmountInput && !skipAdditionUpdate && !isAdditionFocused) {
            additionAmountInput.value = additionAmount.toFixed(2);
        }
        
        // Update net price input
        const netPriceInput = row.querySelector('.net-price-input');
        if (netPriceInput) {
            netPriceInput.value = netPrice.toFixed(2);
        }
        
        row.querySelector('.total-input').value = total.toFixed(2);
        
        this.calculatePurchaseTotals();
    },


    /**
     * Copy row data
     */
    copyRow() {
        const selectedRow = document.querySelector('#purchaseItemsBody tr.selected');
        if (!selectedRow) {
            if (typeof showError === 'function') {
                showError('يرجى تحديد صف للنسخ');
            } else {
                Logger.log('⚠️ يرجى تحديد صف للنسخ');
            }
            return;
        }

        // Get product and unit IDs from autocomplete hidden inputs
        const productHiddenInput = selectedRow.querySelector('.product-select-id');
        const unitHiddenInput = selectedRow.querySelector('.unit-select-id');
        
        this.copiedRow = {
            productId: productHiddenInput ? productHiddenInput.value : '',
            quantity: selectedRow.querySelector('.quantity-input').value,
            unitId: unitHiddenInput ? unitHiddenInput.value : '',
            price: selectedRow.querySelector('.price-input').value,
            discountPercent: selectedRow.querySelector('.discount-percent-input').value
        };

        if (typeof showSuccess === 'function') {
            showSuccess('تم نسخ الصف بنجاح');
        } else {
            Logger.log('✅ تم نسخ الصف بنجاح');
        }
    },

    /**
     * Paste row data
     */
    pasteRow() {
        if (!this.copiedRow) {
            if (typeof showError === 'function') {
                showError('لا يوجد صف منسوخ للصق');
            } else {
                Logger.log('⚠️ لا يوجد صف منسوخ للصق');
            }
            return;
        }

        this.addPurchaseItem();
        const lastRow = document.querySelector('#purchaseItemsBody tr:last-child');
        
        // Populate with copied data using autocomplete fields
        if (this.copiedRow.productId) {
            const product = this.products.find(p => p.id === this.copiedRow.productId);
            if (product) {
                const productInput = lastRow.querySelector('.product-display-input');
                const productHiddenInput = lastRow.querySelector('.product-select-id');
                if (productInput) productInput.value = `${product.name}${product.code ? ' - ' + product.code : ''}`;
                if (productHiddenInput) productHiddenInput.value = product.id;
                
                // Trigger product selection to load units
                this.handleProductSelection(lastRow, product).then(() => {
                    // After units are loaded, set the unit
                    if (this.copiedRow.unitId) {
                        const unit = this.units.find(u => u.id === this.copiedRow.unitId);
                        if (unit) {
                            const unitInput = lastRow.querySelector('.unit-autocomplete-container input[type="text"]');
                            const unitHiddenInput = lastRow.querySelector('.unit-select-id');
                            if (unitInput) unitInput.value = unit.name;
                            if (unitHiddenInput) unitHiddenInput.value = unit.id;
                            
                            // Find the unit item and trigger selection
                            const fullProduct = this.products.find(p => p.id === this.copiedRow.productId);
                            if (fullProduct) {
                                // Get available units from product
                                const availableUnits = [];
                                const productCurrency = fullProduct.currency || 'IQD';
                                const hasSubUnits = fullProduct.subUnits && fullProduct.subUnits.length > 0;
                                
                                if (fullProduct.unitId) {
                                    const mainUnit = this.units.find(u => u.id === fullProduct.unitId);
                                    if (mainUnit) {
                                        availableUnits.push({
                                            unit: mainUnit,
                                            price: fullProduct.purchasePrice || 0,
                                            currency: productCurrency,
                                            conversion: 1,
                                            conversionType: 'multiply',
                                            isMain: true
                                        });
                                    }
                                }
                                
                                if (hasSubUnits) {
                                    const mainUnitPrice = fullProduct.purchasePrice || 0;
                                    fullProduct.subUnits.forEach(subUnit => {
                                        const unit = this.units.find(u => u.id === subUnit.unitId);
                                        if (unit) {
                                            let subUnitPrice;
                                            if (subUnit.purchasePrice !== undefined && subUnit.purchasePrice !== null && subUnit.purchasePrice > 0) {
                                                subUnitPrice = subUnit.purchasePrice;
                                            } else {
                                                const conversionType = subUnit.conversionType || 'multiply';
                                                const conversionFactor = parseFloat(subUnit.conversionValue || subUnit.conversionFactor) || 1;
                                                if (mainUnitPrice > 0) {
                                                    if (conversionType === 'multiply') {
                                                        subUnitPrice = mainUnitPrice * conversionFactor;
                                                    } else if (conversionType === 'divide') {
                                                        subUnitPrice = mainUnitPrice / conversionFactor;
                                                    } else {
                                                        subUnitPrice = mainUnitPrice;
                                                    }
                                                } else {
                                                    subUnitPrice = 0;
                                                }
                                            }
                                            availableUnits.push({
                                                unit: unit,
                                                price: subUnitPrice,
                                                currency: productCurrency,
                                                conversion: parseFloat(subUnit.conversionValue || subUnit.conversionFactor) || 1,
                                                conversionType: subUnit.conversionType || 'multiply',
                                                isMain: false
                                            });
                                        }
                                    });
                                }
                                
                                const unitItem = availableUnits.find(u => u.unit.id === this.copiedRow.unitId);
                                if (unitItem) {
                                    this.handleUnitSelection(lastRow, unitItem, fullProduct);
                                }
                            }
                        }
                    }
                });
            }
        }
        
        lastRow.querySelector('.quantity-input').value = this.copiedRow.quantity;
        lastRow.querySelector('.price-input').value = this.copiedRow.price;
        lastRow.querySelector('.discount-percent-input').value = this.copiedRow.discountPercent;
        
        this.calculateItemTotal(lastRow);

        if (typeof showSuccess === 'function') {
            showSuccess('تم لصق الصف بنجاح');
        } else {
            Logger.log('✅ تم لصق الصف بنجاح');
        }
    },

    /**
     * Calculate purchase totals (Updated for new structure)
     */
    calculatePurchaseTotals() {
        const tbody = document.getElementById('purchaseItemsBody');
        if (!tbody) return;
        
        // Use children instead of querySelectorAll for better performance
        const rows = tbody.children;
        let subtotal = 0;

        // Calculate subtotal from all items - use for loop for better performance
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const total = parseFloat(row.querySelector('.total-input')?.value) || 0;
            subtotal += total;
        }

        // Calculate discounts and additions from table
        const discountRows = document.querySelectorAll('#discountsAdditionsBody tr');
        let totalDiscounts = 0;
        let totalAdditions = 0;

        // Get invoice currency and exchange rate
        const invoiceCurrency = document.getElementById('purchaseCurrency')?.value || 'IQD';
        const invoiceExchangeRate = parseFloat(document.getElementById('purchaseExchangeRate')?.value) || 1;
        const baseCurrency = this.currencies.find(c => c.isBaseCurrency)?.code || 'IQD';

        discountRows.forEach(row => {
            const type = row.querySelector('.type-select')?.value;
            const amount = parseFloat(row.querySelector('.amount-input')?.value) || 0;
            const currency = row.querySelector('.currency-select')?.value || invoiceCurrency;
            
            // Convert amount to invoice currency if needed
            let convertedAmount = amount;
            if (currency !== invoiceCurrency) {
                // If discount/addition is in different currency, convert it
                // Find exchange rate for the discount/addition currency
                const discountCurrency = this.currencies.find(c => c.code === currency);
                const discountExchangeRate = discountCurrency?.exchangeRate || 1;
                
                // Convert from discount currency to base currency, then to invoice currency
                if (currency !== baseCurrency) {
                    convertedAmount = amount / discountExchangeRate; // Convert to base currency
                }
                if (invoiceCurrency !== baseCurrency) {
                    convertedAmount = convertedAmount * invoiceExchangeRate; // Convert to invoice currency
                }
            }
            
            if (type === 'discount') {
                totalDiscounts += convertedAmount;
            } else if (type === 'addition') {
                totalAdditions += convertedAmount;
            }
        });

        // Calculate final total
        const finalTotal = subtotal - totalDiscounts + totalAdditions;

        // Update display
        document.getElementById('purchaseSubtotal').textContent = subtotal.toFixed(2);
        document.getElementById('subtotalCurrency').textContent = invoiceCurrency;
        
        document.getElementById('totalDiscounts').textContent = totalDiscounts.toFixed(2);
        document.getElementById('discountCurrency').textContent = invoiceCurrency;
        
        document.getElementById('totalAdditions').textContent = totalAdditions.toFixed(2);
        document.getElementById('additionCurrency').textContent = invoiceCurrency;
        
        document.getElementById('purchaseTotal').textContent = finalTotal.toFixed(2);
        document.getElementById('totalCurrency').textContent = invoiceCurrency;
        
        // Update remaining amount and payable amount max
        // ملاحظة: يجب استخدام await لأن الدوال async
        // ✅ عند التعديل: نحافظ على القيمة الأصلية
        // ⚠️ عند التعديل: لا نعيد حساب القيم إلا إذا كان النموذج جاهزاً (بعد انتهاء التعبئة)
        if (!this.isPopulatingForm) {
            // عند الإضافة أو بعد انتهاء التعديل: حساب مباشر
            (async () => {
                await this.calculateRemainingAmount();
                if (document.getElementById('purchasePaymentMethod')?.value === 'credit') {
                    await this.updatePaidAmountMax(false);
                }
            })();
        } else {
            // عند التعديل: نؤجل الحساب حتى يتم تعيين جميع القيم
            // سيتم استدعاء calculateRemainingAmount() من populatePurchaseForm() بعد انتهاء التعبئة
            Logger.log('ℹ️ Skipping payment calculation during form population (will be calculated after population completes)');
        }
    },

    /**
     * Preview general entry that will be generated (before saving)
     */
    async previewGeneralEntry() {
        try {
            const previewDiv = document.getElementById('generalEntryPreview');
            const previewContent = document.getElementById('generalEntryPreviewContent');
            const refreshBtn = document.getElementById('refreshGeneralEntryPreviewBtn');
            
            if (!previewDiv || !previewContent) return;

            // Show preview div
            previewDiv.style.display = 'block';
            if (refreshBtn) refreshBtn.style.display = 'inline-block';
            
            previewContent.innerHTML = '<div class="text-center text-muted"><i class="fas fa-spinner fa-spin"></i> جاري حساب القيد...</div>';

            // Get current form data
            const formData = await this.collectPurchaseData();
            
            // Check if generation is enabled
            const generateEntry = document.getElementById('generateGeneralEntry')?.checked;
            if (!generateEntry) {
                previewContent.innerHTML = `
                    <div class="alert alert-warning mb-0">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>تنبيه:</strong> توليد القيد العام معطل. يرجى تفعيله أولاً.
                    </div>
                `;
                return;
            }

            // Calculate expected entry
            const entryData = await this.calculateExpectedGeneralEntry(formData);
            
            if (!entryData || !entryData.entries || entryData.entries.length === 0) {
                previewContent.innerHTML = `
                    <div class="alert alert-warning mb-0">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>تنبيه:</strong> لا يمكن توليد القيد. يرجى التحقق من:
                        <ul class="mb-0 mt-2">
                            <li>تحديد المورد (للدفع الآجل)</li>
                            <li>تحديد حساب المشتريات في الإعدادات</li>
                            <li>تحديد حساب النقدية (للدفع النقدي)</li>
                        </ul>
                    </div>
                `;
                return;
            }

            // Calculate totals
            const totalDebit = entryData.entries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
            const totalCredit = entryData.entries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);
            const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

            // Build preview HTML
            let previewHTML = `
                <div class="general-entry-preview">
                    <div class="row mb-2">
                        <div class="col-md-6">
                            <strong>الوصف:</strong> ${this.escapeHtml(entryData.description || '')}
                        </div>
                        <div class="col-md-6">
                            <strong>المرجع:</strong> ${this.escapeHtml(entryData.reference || '')}
                        </div>
                    </div>
                    ${entryData.costCenterName ? `
                    <div class="row mb-2">
                        <div class="col-md-12">
                            <strong>مركز الكلفة:</strong> ${this.escapeHtml(entryData.costCenterName || '')}
                        </div>
                    </div>
                    ` : ''}
                    <div class="table-responsive">
                        <table class="table table-sm table-bordered">
                            <thead class="table-dark">
                                <tr>
                                    <th>#</th>
                                    <th>الحساب</th>
                                    <th class="text-end">مدين</th>
                                    <th class="text-end">دائن</th>
                                    <th>الوصف</th>
                                    <th>مركز الكلفة</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            entryData.entries.forEach((entry, index) => {
                const account = this.accounts.find(a => a.id === entry.accountId);
                const accountName = account ? account.name : `حساب غير موجود (${entry.accountId})`;
                const costCenterName = entry.costCenterName || '-';
                previewHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${this.escapeHtml(accountName)}</td>
                        <td class="text-end">${(entry.debit || 0).toFixed(2)}</td>
                        <td class="text-end">${(entry.credit || 0).toFixed(2)}</td>
                        <td>${this.escapeHtml(entry.description || '')}</td>
                        <td>${this.escapeHtml(costCenterName)}</td>
                    </tr>
                `;
            });

            previewHTML += `
                            </tbody>
                            <tfoot class="table-secondary">
                                <tr>
                                    <th colspan="2" class="text-end">الإجمالي:</th>
                                    <th class="text-end">${totalDebit.toFixed(2)}</th>
                                    <th class="text-end">${totalCredit.toFixed(2)}</th>
                                    <th>
                                        ${isBalanced ? 
                                            '<span class="badge bg-success"><i class="fas fa-check"></i> متوازن</span>' : 
                                            '<span class="badge bg-danger"><i class="fas fa-times"></i> غير متوازن</span>'
                                        }
                                    </th>
                                    <th></th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            `;

            previewContent.innerHTML = previewHTML;

        } catch (error) {
            Logger.error('Error previewing general entry:', error);
            const previewContent = document.getElementById('generalEntryPreviewContent');
            if (previewContent) {
                previewContent.innerHTML = `
                    <div class="alert alert-danger mb-0">
                        <i class="fas fa-exclamation-circle"></i>
                        <strong>خطأ:</strong> ${this.escapeHtml(error.message || 'حدث خطأ أثناء حساب القيد')}
                    </div>
                `;
            }
        }
    },

    /**
     * Calculate expected general entry (without saving)
     */
    async calculateExpectedGeneralEntry(purchaseData) {
        try {
            const paymentMethod = purchaseData.paymentMethod || 'credit';
            const settings = await this.getSettings();

            // Get supplier account (if supplier is selected)
            // ⚠️ CRITICAL: يجب استخدام الحساب الفرعي المرتبط في بطاقة المورد (subAccountId) وليس الحساب الرئيسي (accountId)
            // القاعدة: الحساب الرئيسي لا يستخدم في المعاملات، فقط الحساب النهائي (subAccountId)
            const supplier = purchaseData.supplierId ? this.suppliers.find(s => s.id === purchaseData.supplierId) : null;
            
            // ⚠️ CRITICAL: استخدام subAccountId فقط - لا نستخدم accountId كبديل لأنه الحساب الرئيسي
            const supplierAccountId = supplier?.subAccountId || null;
            const supplierName = supplier?.name || 'غير محدد';
            
            // Log supplier account info for debugging
            if (supplier) {
                Logger.log(`📋 معلومات المورد (معاينة القيد):`, {
                    supplierId: supplier.id,
                    supplierName: supplier.name,
                    subAccountId: supplier.subAccountId,
                    accountId: supplier.accountId, // الحساب الرئيسي (لا يُستخدم)
                    supplierAccountId: supplierAccountId, // الحساب المستخدم فعلياً (subAccountId فقط)
                    hasSubAccountId: !!supplier.subAccountId,
                    hasAccountId: !!supplier.accountId
                });
                
                // Verify supplier account exists in accounts list
                if (supplierAccountId) {
                    const accountInList = this.accounts.find(a => a.id === supplierAccountId);
                    if (accountInList) {
                        Logger.log(`✅ حساب المورد المرتبط موجود في قائمة الحسابات:`, {
                            accountId: accountInList.id,
                            accountName: accountInList.name,
                            accountCode: accountInList.code,
                            isSubAccount: !!accountInList.parentId
                        });
                    } else {
                        console.error(`❌ حساب المورد المرتبط غير موجود في قائمة الحسابات! supplierAccountId: ${supplierAccountId}`);
                    }
                } else {
                    console.warn(`⚠️ لم يتم تحديد حساب فرعي للمورد في بطاقة المورد! supplierId: ${supplier.id}, supplierName: ${supplier.name}`);
                    console.warn(`   الحساب الرئيسي موجود: ${supplier.accountId ? 'نعم (' + supplier.accountId + ')' : 'لا'}`);
                    console.warn(`   يجب إنشاء حساب فرعي للمورد أولاً من بطاقة المورد`);
                }
            } else {
                console.warn(`⚠️ المورد غير موجود. supplierId: ${purchaseData.supplierId}`);
            }

            // For credit payments, supplier is required
            if (paymentMethod === 'credit' && !supplierAccountId) {
                Logger.warn('⚠️ Supplier subAccountId not found for credit payment, cannot preview general entry');
                return null;
            }

            // Generate voucher number for preview
            const voucherNumber = purchaseData.invoiceNo ? `GE-${purchaseData.invoiceNo}` : 'GE-PREVIEW';

            // Get base currency and exchange rate
            const invoiceCurrency = purchaseData.currency || 'IQD';
            const invoiceExchangeRate = parseFloat(purchaseData.exchangeRate) || 1;
            const baseCurrency = this.currencies.find(c => c.isBaseCurrency)?.code || 'IQD';
            
            // Helper function to convert amount to base currency
            // Exchange rate represents: 1 base currency = exchangeRate currency units
            // Example: USD exchangeRate = 1460 means 1 IQD = 1460 USD
            // To convert 100 USD to IQD: 100 / 1460 = amount in IQD
            const convertToBaseCurrency = (amount, currency, exchangeRate) => {
                if (!amount || amount === 0) return 0;
                
                if (currency === baseCurrency) {
                    return amount;
                }
                
                // Get exchange rate from currency object if available
                const currencyObj = this.currencies.find(c => c.code === currency);
                const rate = currencyObj?.exchangeRate || exchangeRate || 1;
                
                if (!rate || rate === 0) {
                    console.warn(`⚠️ Invalid exchange rate for ${currency}: ${rate}`);
                    return amount;
                }
                
                // Convert: amount in currency / exchangeRate = amount in base currency
                // Example: 100 USD / 1460 = amount in IQD (if 1 IQD = 1460 USD)
                const converted = amount / rate;
                
                return converted;
            };

            // Prepare general entry data (always in base currency)
            const entryData = {
                date: purchaseData.date || new Date().toISOString().split('T')[0],
                description: document.getElementById('generalEntryDescription')?.value || `فاتورة شراء رقم ${purchaseData.invoiceNo || 'جديد'}`,
                reference: purchaseData.invoiceNo || 'جديد',
                voucherNumber: voucherNumber,
                voucherType: 'general',
                type: 'purchase',
                sourceId: purchaseData.id || 'preview',
                mainCurrency: baseCurrency, // Always use base currency
                invoiceCurrency: invoiceCurrency, // Store original invoice currency
                exchangeRate: invoiceExchangeRate, // Store exchange rate used
                costCenterId: purchaseData.costCenterId || null, // ✅ إضافة مركز الكلفة للقيد العام
                costCenterName: purchaseData.costCenterId ? (this.costCenters.find(c => c.id === purchaseData.costCenterId)?.name || null) : null, // ✅ اسم مركز الكلفة
                entries: []
            };

            // Get purchase account (debit account for purchases/inventory)
            const purchaseAccount = await this.getPurchaseAccount(purchaseData);
            if (!purchaseAccount) {
                return null;
            }

            // Helper function to add account info to entry
            const addAccountInfo = (entry, accountId) => {
                const account = this.accounts.find(a => a.id === accountId);
                if (account) {
                    entry.accountName = account.name || '';
                    entry.accountCode = account.code || '';
                    entry.currency = baseCurrency; // Always use base currency for entries
                }
                // ✅ إضافة مركز الكلفة لكل قيد في القيد العام
                if (purchaseData.costCenterId) {
                    entry.costCenterId = purchaseData.costCenterId;
                    const costCenter = this.costCenters.find(c => c.id === purchaseData.costCenterId);
                    if (costCenter) {
                        entry.costCenterName = costCenter.name || '';
                    }
                }
                return entry;
            };

            // ✅ المبلغ = مجموع عمود "المجموع" في جدول تفاصيل المنتجات (item.total لكل منتج)
            let itemsNetAmount = 0;
            if (purchaseData.items && purchaseData.items.length > 0) {
                purchaseData.items.forEach((item) => {
                    // جمع المجموع (total) لكل منتج مباشرة
                    const itemTotal = parseFloat(item.total) || 0;
                    itemsNetAmount += itemTotal;
                });
            }
            
            // إذا لم يكن هناك items، استخدم subtotal كبديل
            if (itemsNetAmount === 0 && purchaseData.subtotal !== undefined && purchaseData.subtotal !== null) {
                itemsNetAmount = parseFloat(purchaseData.subtotal) || 0;
            }
            
            const itemsNetAmountInBase = convertToBaseCurrency(itemsNetAmount, invoiceCurrency, invoiceExchangeRate);

            // Handle payment method
            const paidAmount = parseFloat(purchaseData.paidAmount) || 0;
            const remainingAmount = (purchaseData.total || 0) - paidAmount;
            
            if (paymentMethod === 'cash') {
                // Cash Payment
                // ========== الجزء الأول: القيد الناتج عن تفاصيل المنتجات ==========
                // Debit: Purchase account (itemsNetAmount in base currency)
                let purchaseEntry = {
                    accountId: purchaseAccount.id,
                    debit: itemsNetAmountInBase,
                    credit: 0,
                    originalAmount: itemsNetAmount,
                    originalCurrency: invoiceCurrency,
                    description: supplierName ? `شراء نقدي من ${supplierName}` : `فاتورة شراء نقدي رقم ${purchaseData.invoiceNo || 'جديد'}`
                };
                entryData.entries.push(addAccountInfo(purchaseEntry, purchaseAccount.id));

                // Check if there's a partial payment with supplier
                if (paidAmount > 0 && paidAmount < (purchaseData.total || 0) && supplierAccountId) {
                    // Cash payment with partial payment and supplier
                    // القيد الأساسي: دائن حساب المورد (لأن هناك دفعة جزئية)
                    Logger.log(`💰 معالجة دفعة جزئية في الدفع النقدي (معاينة): ${paidAmount} من ${purchaseData.total || 0}`);
                    
                    // Credit: Supplier account (total amount) - دائن حساب المورد (القيمة الكاملة)
                    const supplierAccount = this.accounts.find(a => a.id === supplierAccountId);
                    if (!supplierAccount) {
                        console.error(`❌ حساب المورد غير موجود في قائمة الحسابات. supplierAccountId: ${supplierAccountId}, supplierName: ${supplierName}`);
                        return null;
                    }
                    
                    let supplierEntry = {
                        accountId: supplierAccountId,
                        debit: 0,
                        credit: itemsNetAmountInBase, // ✅ دائن حساب المورد بقيمة itemsNetAmount
                        originalAmount: itemsNetAmount,
                        originalCurrency: invoiceCurrency,
                        description: `فاتورة شراء نقدي مع دفعة جزئية رقم ${purchaseData.invoiceNo || 'جديد'} - ${supplierName}`
                    };
                    entryData.entries.push(addAccountInfo(supplierEntry, supplierAccountId));
                    
                    // Get payment account (from invoice or settings)
                    let paymentAccountId = purchaseData.paymentAccountId || null;
                    if (!paymentAccountId) {
                        paymentAccountId = settings.defaultPaymentAccountId || settings.defaultCreditAccountId || null;
                    }
                    
                    if (!paymentAccountId) {
                        // Auto-detect payment account
                        const paymentAccount = this.accounts.find(a => 
                            a.type === 'asset' && 
                            (a.name.includes('نقدية') || a.name.includes('صندوق') || a.name.includes('بنك') || 
                             a.name.toLowerCase().includes('cash') || a.name.toLowerCase().includes('bank'))
                        );
                        if (paymentAccount) {
                            paymentAccountId = paymentAccount.id;
                        }
                    }
                    
                    if (!paymentAccountId) {
                        Logger.warn('⚠️ حساب الدفع غير موجود، سيتم تخطي قيد الدفعة الجزئية في المعاينة');
                    } else {
                        const paymentAccount = this.accounts.find(a => a.id === paymentAccountId);
                        if (!paymentAccount) {
                            console.warn(`⚠️ حساب الدفع غير موجود في قائمة الحسابات: ${paymentAccountId}`);
                        } else {
                            const paidAmountInBase = convertToBaseCurrency(paidAmount, invoiceCurrency, invoiceExchangeRate);
                            
                            // قيد الدفعة: دائن حساب الدفع (ننفق منه)، مدين حساب المورد (نسدد دينه)
                            // Credit: Payment account (دائن حساب الدفع) - لأننا ننفق منه
                            let paymentEntry = {
                                accountId: paymentAccountId,
                                debit: 0,
                                credit: paidAmountInBase,
                                originalAmount: paidAmount,
                                originalCurrency: invoiceCurrency,
                                description: `دفعة جزئية - فاتورة شراء رقم ${purchaseData.invoiceNo || 'جديد'} - ${supplierName}`
                            };
                            entryData.entries.push(addAccountInfo(paymentEntry, paymentAccountId));
                            
                            // Debit: Supplier account (مدين حساب المورد) - لسداد جزء من الدين
                            let paymentSupplierEntry = {
                                accountId: supplierAccountId,
                                debit: paidAmountInBase,
                                credit: 0,
                                originalAmount: paidAmount,
                                originalCurrency: invoiceCurrency,
                                description: `دفعة جزئية - فاتورة شراء رقم ${purchaseData.invoiceNo || 'جديد'} - ${supplierName}`
                            };
                            entryData.entries.push(addAccountInfo(paymentSupplierEntry, supplierAccountId));
                        }
                    }
                } else {
                    // Cash payment full amount (no supplier or full payment)
                    // Credit: Cash account (from settings or auto-detect)
                    let cashAccount = null;
                    const cashAccountId = settings.defaultCreditAccountId || null;
                    if (cashAccountId) {
                        cashAccount = this.accounts.find(a => a.id === cashAccountId);
                    }
                    if (!cashAccount) {
                        // Auto-detect cash account
                        cashAccount = this.accounts.find(a => 
                            a.type === 'asset' && 
                            (a.name.includes('نقدية') || a.name.includes('صندوق') || a.name.toLowerCase().includes('cash'))
                        );
                    }
                    if (!cashAccount) {
                        return null;
                    }
                    let cashEntry = {
                        accountId: cashAccount.id,
                        debit: 0,
                        credit: itemsNetAmountInBase,
                        originalAmount: itemsNetAmount,
                        originalCurrency: invoiceCurrency,
                        description: `دفع نقدي - فاتورة شراء رقم ${purchaseData.invoiceNo || 'جديد'}`
                    };
                    entryData.entries.push(addAccountInfo(cashEntry, cashAccount.id));
                }
            } else {
                // Credit Payment: Supplier account
                if (!supplierAccountId) {
                    return null;
                }

                // ✅ الجزء الأول: القيد الناتج عن تفاصيل المنتجات
                // Debit: Purchase account (itemsNetAmount in base currency)
                let purchaseEntry = {
                    accountId: purchaseAccount.id,
                    debit: itemsNetAmountInBase, // ✅ استخدام itemsNetAmount (subtotal - خصومات + إضافات)
                    credit: 0,
                    originalAmount: itemsNetAmount,
                    originalCurrency: invoiceCurrency,
                    description: supplierName ? `شراء آجل من ${supplierName}` : `فاتورة شراء آجل رقم ${purchaseData.invoiceNo || 'جديد'}`
                };
                entryData.entries.push(addAccountInfo(purchaseEntry, purchaseAccount.id));

                // Credit: Supplier account - دائن حساب المورد بقيمة itemsNetAmount
                const supplierAccount = this.accounts.find(a => a.id === supplierAccountId);
                if (!supplierAccount) {
                    console.error(`❌ حساب المورد غير موجود في قائمة الحسابات. supplierAccountId: ${supplierAccountId}, supplierName: ${supplierName}`);
                    return null;
                }
                
                // التأكد من أن الحساب المستخدم هو الحساب المرتبط في بطاقة المورد وليس حساب افتراضي
                if (supplierAccount.id !== supplierAccountId) {
                    console.error(`❌ خطأ: الحساب المستخدم (${supplierAccount.id}) لا يطابق حساب المورد (${supplierAccountId})`);
                    return null;
                }
                
                let supplierEntry = {
                    accountId: supplierAccountId,
                    debit: 0,
                    credit: itemsNetAmountInBase, // ✅ دائن حساب المورد بقيمة itemsNetAmount
                    originalAmount: itemsNetAmount,
                    originalCurrency: invoiceCurrency,
                    description: `فاتورة شراء آجل رقم ${purchaseData.invoiceNo || 'جديد'} - ${supplierName}`
                };
                entryData.entries.push(addAccountInfo(supplierEntry, supplierAccountId));
                
                // Verify that the account name was set correctly - التأكد من استخدام الحساب الصحيح
                const addedEntry = entryData.entries[entryData.entries.length - 1];
                if (addedEntry.accountName !== supplierAccount.name) {
                    console.warn(`⚠️ تحذير: اسم الحساب في القيد (${addedEntry.accountName}) لا يطابق اسم حساب المورد (${supplierAccount.name})`);
                    // Force correct account name - فرض اسم الحساب الصحيح
                    addedEntry.accountName = supplierAccount.name;
                    addedEntry.accountCode = supplierAccount.code || '';
                }
                
                // التأكد النهائي من أن الحساب المستخدم هو الحساب المرتبط في بطاقة المورد
                if (addedEntry.accountId !== supplierAccountId) {
                    console.error(`❌ خطأ حرج: الحساب المستخدم في القيد (${addedEntry.accountId}) لا يطابق حساب المورد (${supplierAccountId})`);
                    return null;
                }
                
                // Handle payment (partial or full) - معالجة الدفعة (جزئية أو كاملة)
                // في الدفع الآجل: إذا كان هناك دفعة (جزئية أو كاملة)، يجب توليد قيد الدفعة
                if (paidAmount > 0) {
                    const isPartialPayment = paidAmount < (purchaseData.total || 0);
                    const paymentType = isPartialPayment ? 'جزئية' : 'كاملة';
                    Logger.log(`💰 معالجة دفعة ${paymentType} (معاينة): ${paidAmount} من ${purchaseData.total || 0}`);
                    
                    // Get payment account (from invoice or settings)
                    let paymentAccountId = purchaseData.paymentAccountId || null;
                    if (!paymentAccountId) {
                        // Use default payment account from settings
                        paymentAccountId = settings.defaultPaymentAccountId || settings.defaultCreditAccountId || null;
                    }
                    
                    if (!paymentAccountId) {
                        // Auto-detect payment account
                        const paymentAccount = this.accounts.find(a => 
                            a.type === 'asset' && 
                            (a.name.includes('نقدية') || a.name.includes('صندوق') || a.name.includes('بنك') || 
                             a.name.toLowerCase().includes('cash') || a.name.toLowerCase().includes('bank'))
                        );
                        if (paymentAccount) {
                            paymentAccountId = paymentAccount.id;
                        }
                    }
                    
                    if (!paymentAccountId) {
                        console.warn(`⚠️ حساب الدفع غير موجود، سيتم تخطي قيد الدفعة ${paymentType} في المعاينة`);
                    } else {
                        const paymentAccount = this.accounts.find(a => a.id === paymentAccountId);
                        if (!paymentAccount) {
                            console.warn(`⚠️ حساب الدفع غير موجود في قائمة الحسابات: ${paymentAccountId}`);
                        } else {
                            const paidAmountInBase = convertToBaseCurrency(paidAmount, invoiceCurrency, invoiceExchangeRate);
                            
                            // Credit: Payment account (دائن حساب الدفع) - لأننا ننفق منه
                            let paymentEntry = {
                                accountId: paymentAccountId,
                                debit: 0,
                                credit: paidAmountInBase,
                                originalAmount: paidAmount,
                                originalCurrency: invoiceCurrency,
                                description: `دفعة ${paymentType} - فاتورة شراء رقم ${purchaseData.invoiceNo || 'جديد'} - ${supplierName}`
                            };
                            entryData.entries.push(addAccountInfo(paymentEntry, paymentAccountId));
                            
                            // Debit: Supplier account (مدين حساب المورد) - لسداد الدين
                            let paymentSupplierEntry = {
                                accountId: supplierAccountId,
                                debit: paidAmountInBase,
                                credit: 0,
                                originalAmount: paidAmount,
                                originalCurrency: invoiceCurrency,
                                description: `دفعة ${paymentType} - فاتورة شراء رقم ${purchaseData.invoiceNo || 'جديد'} - ${supplierName}`
                            };
                            entryData.entries.push(addAccountInfo(paymentSupplierEntry, supplierAccountId));
                            
                            Logger.log(`✅ تم إضافة قيد الدفعة ${paymentType} في المعاينة: ${paidAmount} ${invoiceCurrency} (${paidAmountInBase} ${baseCurrency})`);
                        }
                    }
                }
            }

            // ✅ تم حذف الدوال التي تولد قيود منفصلة للخصومات والإضافات على الأسطر
            // لأن الخصومات والإضافات على الأسطر (من items) أصبحت جزء من itemsNetAmount في الجزء الأول
            // فقط الخصومات والإضافات على الفاتورة ككل (من discountAdditionRows) لها قيود منفصلة في الجزء الثاني

            // ========== الجزء الثاني: الخصومات والإضافات لكل سطر (من discountAdditionRows) ==========
            // قيد تفصيلي لكل سطر من discountAdditionRows
            // الإضافات: مدين حساب الإضافة (مصروف)، دائن الحساب المقابل (المحدد في الصف أو حساب المورد/الدائن حسب طريقة الدفع)
            // الخصومات: دائن حساب الخصم، مدين الحساب المقابل (المحدد في الصف أو حساب المورد/الدائن حسب طريقة الدفع)
            if (purchaseData.discountAdditionRows && purchaseData.discountAdditionRows.length > 0) {
                // ⚠️ CRITICAL FIX: استخدام for...of بدلاً من forEach لتجنب مشكلة return
                for (const row of purchaseData.discountAdditionRows) {
                    // Get row currency and exchange rate
                    const rowCurrency = row.currency || invoiceCurrency;
                    const rowExchangeRate = row.exchangeRate || invoiceExchangeRate;
                    
                    // Convert amount to base currency
                    const amountInBaseCurrency = convertToBaseCurrency(row.amount || 0, rowCurrency, rowExchangeRate);
                    
                    if (row.type === 'addition' && row.amount > 0) {
                        // ✅ قيد لكل إضافة من discountAdditionRows
                        // الإضافة: مدين حساب الإضافة، دائن الحساب المقابل (إذا كان محدد) أو حساب المورد (إذا لم يكن محدد)
                        let additionCounterAccountId = row.counterAccountId;
                        
                        // إذا لم يكن هناك حساب مقابل محدد في الصف، نستخدم حساب المورد
                        if (!additionCounterAccountId) {
                            if (paymentMethod === 'credit' && supplierAccountId) {
                                additionCounterAccountId = supplierAccountId; // حساب المورد
                            } else if (paymentMethod === 'cash') {
                                additionCounterAccountId = settings.defaultCreditAccountId || null; // الحساب الدائن
                            }
                        }
                        
                        if (!additionCounterAccountId) {
                            Logger.warn('⚠️ لم يتم تحديد الحساب المقابل للإضافة، سيتم تخطي القيد');
                            continue;
                        }
                        
                        // ⚠️ CRITICAL: التحقق من وجود حساب الإضافة
                        if (!row.accountId) {
                            Logger.warn('⚠️ لم يتم تحديد حساب الإضافة في الصف، سيتم تخطي القيد');
                            continue;
                        }
                        
                        // Debit: Addition account (from row) - حساب الإضافة (مصروف)
                        const additionAccount = this.accounts.find(a => a.id === row.accountId);
                        if (!additionAccount) {
                            console.warn(`⚠️ حساب الإضافة غير موجود في قائمة الحسابات: ${row.accountId}`);
                            continue;
                        }
                        
                        let additionEntry = {
                            accountId: row.accountId,
                            debit: amountInBaseCurrency,
                            credit: 0,
                            originalAmount: row.amount,
                            originalCurrency: rowCurrency,
                            description: `إضافة - ${row.notes || `فاتورة شراء رقم ${purchaseData.invoiceNo || 'جديد'}`}`
                        };
                        entryData.entries.push(addAccountInfo(additionEntry, row.accountId));

                        // Credit: Counter account - الحساب المقابل
                        const additionCounterAccount = this.accounts.find(a => a.id === additionCounterAccountId);
                        if (!additionCounterAccount) {
                            console.error(`❌ حساب المقابل للإضافة غير موجود: ${additionCounterAccountId}`);
                            throw new Error(`حساب المقابل للإضافة غير موجود في قائمة الحسابات`);
                        }
                        
                        let additionCounterEntry = {
                            accountId: additionCounterAccount.id,
                            debit: 0,
                            credit: amountInBaseCurrency,
                            originalAmount: row.amount,
                            originalCurrency: rowCurrency,
                            description: `إضافة - ${row.notes || `فاتورة شراء رقم ${purchaseData.invoiceNo || 'جديد'}`}`
                        };
                        entryData.entries.push(addAccountInfo(additionCounterEntry, additionCounterAccount.id));
                    } else if (row.type === 'discount' && row.amount > 0) {
                        // ✅ قيد لكل خصم من discountAdditionRows
                        // الخصم: دائن حساب الخصم، مدين الحساب المقابل (إذا كان محدد) أو حساب المورد (إذا لم يكن محدد)
                        let discountCounterAccountId = row.counterAccountId;
                        
                        // إذا لم يكن هناك حساب مقابل محدد في الصف، نستخدم حساب المورد
                        if (!discountCounterAccountId) {
                            if (paymentMethod === 'credit' && supplierAccountId) {
                                discountCounterAccountId = supplierAccountId; // حساب المورد
                            } else if (paymentMethod === 'cash') {
                                discountCounterAccountId = settings.defaultCreditAccountId || null; // الحساب الدائن
                            }
                        }
                        
                        if (!discountCounterAccountId) {
                            Logger.warn('⚠️ لم يتم تحديد الحساب المقابل للخصم، سيتم تخطي القيد');
                            continue;
                        }
                        
                        // ⚠️ CRITICAL: التحقق من وجود حساب الخصم
                        if (!row.accountId) {
                            Logger.warn('⚠️ لم يتم تحديد حساب الخصم في الصف، سيتم تخطي القيد');
                            continue;
                        }

                        // Credit: Discount account (from row) - حساب الخصم (دائن)
                        const discountAccount = this.accounts.find(a => a.id === row.accountId);
                        if (!discountAccount) {
                            console.warn(`⚠️ حساب الخصم غير موجود في قائمة الحسابات: ${row.accountId}`);
                            continue;
                        }
                        
                        let discountEntry = {
                            accountId: row.accountId,
                            debit: 0,
                            credit: amountInBaseCurrency,
                            originalAmount: row.amount,
                            originalCurrency: rowCurrency,
                            description: `خصم - ${row.notes || `فاتورة شراء رقم ${purchaseData.invoiceNo || 'جديد'}`}`
                        };
                        entryData.entries.push(addAccountInfo(discountEntry, row.accountId));

                        // Debit: Counter account - الحساب المقابل (مدين)
                        const discountCounterAccount = this.accounts.find(a => a.id === discountCounterAccountId);
                        if (!discountCounterAccount) {
                            console.error(`❌ حساب المقابل للخصم غير موجود: ${discountCounterAccountId}`);
                            throw new Error(`حساب المقابل للخصم غير موجود في قائمة الحسابات`);
                        }
                        
                        let discountCounterEntry = {
                            accountId: discountCounterAccount.id,
                            debit: amountInBaseCurrency,
                            credit: 0,
                            originalAmount: row.amount,
                            originalCurrency: rowCurrency,
                            description: `خصم - ${row.notes || `فاتورة شراء رقم ${purchaseData.invoiceNo || 'جديد'}`}`
                        };
                        entryData.entries.push(addAccountInfo(discountCounterEntry, discountCounterAccount.id));
                    }
                }
            }

            return entryData;
        } catch (error) {
            console.error('Error calculating expected general entry:', error);
            return null;
        }
    },

    /**
     * Generate general entry for purchase
     */
    async generateGeneralEntry(purchaseData) {
        try {
            const generateEntry = document.getElementById('generateGeneralEntry').checked;
            if (!generateEntry) return;

            Logger.log('📝 Generating general entry for purchase:', purchaseData.invoiceNo);
            Logger.log('📊 Purchase Data for General Entry:', {
                invoiceNo: purchaseData.invoiceNo,
                paymentMethod: purchaseData.paymentMethod,
                total: purchaseData.total,
                paidAmount: purchaseData.paidAmount,
                paymentAccountId: purchaseData.paymentAccountId,
                supplierId: purchaseData.supplierId,
                supplierName: purchaseData.supplierName
            });

            const paymentMethod = purchaseData.paymentMethod || 'credit';
            const settings = await this.getSettings();

            // Get supplier account (if supplier is selected)
            // ⚠️ CRITICAL: يجب استخدام الحساب الفرعي المرتبط في بطاقة المورد (subAccountId) وليس الحساب الرئيسي (accountId)
            // القاعدة: الحساب الرئيسي لا يستخدم في المعاملات، فقط الحساب النهائي (subAccountId)
            const supplier = purchaseData.supplierId ? this.suppliers.find(s => s.id === purchaseData.supplierId) : null;
            
            // ⚠️ CRITICAL: استخدام subAccountId فقط - لا نستخدم accountId كبديل لأنه الحساب الرئيسي
            // إذا لم يكن subAccountId موجوداً، يجب إيقاف توليد القيد لأن الحساب الرئيسي لا يُستخدم في المعاملات
            const supplierAccountId = supplier?.subAccountId || null;
            const supplierName = supplier?.name || 'غير محدد';
            
            // Log supplier account info for debugging
            if (supplier) {
                Logger.log(`📋 معلومات المورد (توليد القيد):`, {
                    supplierId: supplier.id,
                    supplierName: supplier.name,
                    subAccountId: supplier.subAccountId,
                    accountId: supplier.accountId, // الحساب الرئيسي (لا يُستخدم)
                    supplierAccountId: supplierAccountId, // الحساب المستخدم فعلياً (subAccountId فقط)
                    hasSubAccountId: !!supplier.subAccountId,
                    hasAccountId: !!supplier.accountId
                });
                
                // ⚠️ CRITICAL: التحقق من وجود subAccountId
                if (!supplier.subAccountId) {
                    console.error(`❌ خطأ حرج: المورد "${supplier.name}" لا يحتوي على حساب فرعي مرتبط (subAccountId)!`);
                    console.error(`   الحساب الرئيسي موجود: ${supplier.accountId ? 'نعم (' + supplier.accountId + ')' : 'لا'}`);
                    console.error(`   يجب إنشاء حساب فرعي للمورد أولاً من بطاقة المورد`);
                    throw new Error(`المورد "${supplier.name}" لا يحتوي على حساب محاسبي مرتبط (حساب فرعي). يرجى إنشاء حساب فرعي للمورد من بطاقة المورد أولاً. الحساب الرئيسي لا يُستخدم في المعاملات المالية.`);
                }
                
                // Verify supplier account exists in accounts list
                if (supplierAccountId) {
                    const accountInList = this.accounts.find(a => a.id === supplierAccountId);
                    if (accountInList) {
                        Logger.log(`✅ حساب المورد المرتبط موجود في قائمة الحسابات:`, {
                            accountId: accountInList.id,
                            accountName: accountInList.name,
                            accountCode: accountInList.code,
                            isSubAccount: !!accountInList.parentId
                        });
                        
                        // ⚠️ التحقق من أن الحساب هو حساب فرعي وليس حساب رئيسي
                        if (!accountInList.parentId) {
                            console.warn(`⚠️ تحذير: الحساب المستخدم (${accountInList.name}) ليس حساب فرعي!`);
                            console.warn(`   يجب أن يكون الحساب المرتبط حساب فرعي (subAccountId) وليس حساب رئيسي`);
                        }
                    } else {
                        console.error(`❌ حساب المورد المرتبط غير موجود في قائمة الحسابات! supplierAccountId: ${supplierAccountId}`);
                        throw new Error(`حساب المورد المرتبط في بطاقة المورد (${supplierName}) غير موجود في قائمة الحسابات. يرجى التحقق من إعدادات المورد.`);
                    }
                } else {
                    console.error(`❌ لم يتم تحديد حساب فرعي للمورد في بطاقة المورد! supplierId: ${supplier.id}, supplierName: ${supplier.name}`);
                    throw new Error(`لم يتم تحديد حساب محاسبي مرتبط (حساب فرعي) للمورد (${supplierName}) في بطاقة المورد. يرجى إنشاء حساب فرعي للمورد من بطاقة المورد أولاً.`);
                }
            } else {
                console.warn(`⚠️ المورد غير موجود. supplierId: ${purchaseData.supplierId}`);
            }

            // For credit payments, supplier is required
            if (paymentMethod === 'credit' && !supplierAccountId) {
                Logger.error('❌ Supplier subAccountId not found for credit payment, cannot generate general entry');
                throw new Error('لا يمكن توليد القيد العام: المورد لا يحتوي على حساب محاسبي مرتبط (حساب فرعي). يرجى إنشاء حساب فرعي للمورد من بطاقة المورد أولاً.');
            }

            // Generate voucher number for general entry (use invoice number with prefix)
            const voucherNumber = `GE-${purchaseData.invoiceNo}`;

            // Get base currency and exchange rate
            const invoiceCurrency = purchaseData.currency || 'IQD';
            const invoiceExchangeRate = parseFloat(purchaseData.exchangeRate) || 1;
            const baseCurrency = this.currencies.find(c => c.isBaseCurrency)?.code || 'IQD';
            
            // Helper function to convert amount to base currency
            // Exchange rate represents: 1 base currency = exchangeRate currency units
            // Example: USD exchangeRate = 1460 means 1 IQD = 1460 USD
            // To convert 100 USD to IQD: 100 / 1460 = amount in IQD
            const convertToBaseCurrency = (amount, currency, exchangeRate) => {
                if (!amount || amount === 0) return 0;
                
                if (currency === baseCurrency) {
                    return amount;
                }
                
                // Get exchange rate from currency object if available
                const currencyObj = this.currencies.find(c => c.code === currency);
                const rate = currencyObj?.exchangeRate || exchangeRate || 1;
                
                if (!rate || rate === 0) {
                    console.warn(`⚠️ Invalid exchange rate for ${currency}: ${rate}`);
                    return amount;
                }
                
                // Convert: amount in currency / exchangeRate = amount in base currency
                // Example: 100 USD / 1460 = amount in IQD (if 1 IQD = 1460 USD)
                const converted = amount / rate;
                
                return converted;
            };

            // Prepare general entry data (always in base currency)
            // ⚠️ CRITICAL: Ensure purchaseData.id exists for sourceId
            if (!purchaseData.id) {
                Logger.error('❌ purchaseData.id is missing! Cannot create general entry without sourceId.');
                throw new Error('معرف فاتورة الشراء غير موجود. لا يمكن توليد القيد العام بدون معرف الفاتورة.');
            }
            
            // ⚠️ CRITICAL: Convert sourceId to string to avoid [object Object] issue
            // Handle case where purchaseData.id might be an object
            let sourceId;
            if (typeof purchaseData.id === 'string') {
                sourceId = purchaseData.id;
            } else if (purchaseData.id && typeof purchaseData.id === 'object' && purchaseData.id.id) {
                // If it's an object with id property, extract it
                sourceId = String(purchaseData.id.id);
            } else if (purchaseData.id) {
                // Try to extract string value
                sourceId = String(purchaseData.id);
            } else {
                Logger.error('❌ purchaseData.id is invalid:', purchaseData.id);
                throw new Error('معرف فاتورة الشراء غير صحيح. لا يمكن توليد القيد العام.');
            }
            
            // Final validation: ensure sourceId is not [object Object]
            if (sourceId === '[object Object]' || sourceId.includes('[object')) {
                Logger.error('❌ sourceId is still an object string:', sourceId, 'original:', purchaseData.id);
                // Try to get the actual ID from the purchase data
                if (purchaseData.id && typeof purchaseData.id === 'object') {
                    // Try to find id property
                    const actualId = purchaseData.id.id || purchaseData.id.toString?.() || JSON.stringify(purchaseData.id);
                    if (actualId && actualId !== '[object Object]') {
                        sourceId = String(actualId);
                        Logger.log(`✅ Fixed sourceId from object: ${sourceId}`);
                    } else {
                        throw new Error('لا يمكن تحديد معرف فاتورة الشراء بشكل صحيح.');
                    }
                } else {
                    throw new Error('معرف فاتورة الشراء غير صحيح.');
                }
            }
            
            Logger.log(`📝 Creating general entry with sourceId: ${sourceId} (type: ${typeof sourceId}, original: ${typeof purchaseData.id})`);
            
            const entryData = {
                date: purchaseData.date,
                description: document.getElementById('generalEntryDescription')?.value || `فاتورة شراء رقم ${purchaseData.invoiceNo}`,
                reference: purchaseData.invoiceNo,
                voucherNumber: voucherNumber,
                voucherType: 'general',
                type: 'purchase',
                sourceId: sourceId, // ⚠️ CRITICAL: This links the general entry to the purchase invoice (always as string)
                mainCurrency: baseCurrency, // Always use base currency
                invoiceCurrency: invoiceCurrency, // Store original invoice currency
                exchangeRate: invoiceExchangeRate, // Store exchange rate used
                costCenterId: purchaseData.costCenterId || null, // ✅ إضافة مركز الكلفة للقيد العام
                costCenterName: purchaseData.costCenterId ? (this.costCenters.find(c => c.id === purchaseData.costCenterId)?.name || null) : null, // ✅ اسم مركز الكلفة
                entries: []
            };

            // Get purchase account (debit account for purchases/inventory)
            const purchaseAccount = await this.getPurchaseAccount(purchaseData);
            if (!purchaseAccount) {
                Logger.warn('⚠️ Purchase account not found, skipping general entry generation');
                return;
            }

            // Helper function to add account info to entry
            const addAccountInfo = (entry, accountId) => {
                const account = this.accounts.find(a => a.id === accountId);
                if (account) {
                    entry.accountName = account.name || '';
                    entry.accountCode = account.code || '';
                    entry.currency = baseCurrency; // Always use base currency for entries
                }
                // ✅ إضافة مركز الكلفة لكل قيد في القيد العام
                if (purchaseData.costCenterId) {
                    entry.costCenterId = purchaseData.costCenterId;
                    const costCenter = this.costCenters.find(c => c.id === purchaseData.costCenterId);
                    if (costCenter) {
                        entry.costCenterName = costCenter.name || '';
                    }
                }
                return entry;
            };

            // ✅ تقسيم القيد إلى 3 أجزاء:
            // الجزء الأول: القيد الناتج عن تفاصيل المنتجات
            //   مجموع المبالغ = (كمية كل منتج × السعر) - الخصم + الإضافي على الأسطر
            // الجزء الثاني: الخصومات والإضافات لكل سطر (من discountAdditionRows) - قيد لكل سطر
            // الجزء الثالث: قيد الدفعة إن وجدت
            
            // ========== الجزء الأول: حساب القيد الناتج عن تفاصيل المنتجات ==========
            // ✅ المبلغ = مجموع عمود "المجموع" في جدول تفاصيل المنتجات (item.total لكل منتج)
            let itemsNetAmount = 0;
            if (purchaseData.items && purchaseData.items.length > 0) {
                purchaseData.items.forEach((item) => {
                    // جمع المجموع (total) لكل منتج مباشرة
                    const itemTotal = parseFloat(item.total) || 0;
                    itemsNetAmount += itemTotal;
                });
            }
            
            // إذا لم يكن هناك items، استخدم subtotal كبديل
            if (itemsNetAmount === 0 && purchaseData.subtotal !== undefined && purchaseData.subtotal !== null) {
                itemsNetAmount = parseFloat(purchaseData.subtotal) || 0;
            }
            
            const itemsNetAmountInBase = convertToBaseCurrency(itemsNetAmount, invoiceCurrency, invoiceExchangeRate);
            
            Logger.log(`💰 الجزء الأول - المبلغ من مجموع عمود "المجموع" في جدول المنتجات:`, {
                itemsNetAmount: itemsNetAmount.toFixed(2),
                itemsNetAmountInBase: itemsNetAmountInBase.toFixed(2),
                itemsCount: purchaseData.items ? purchaseData.items.length : 0,
                note: '✅ هذا المبلغ هو مجموع عمود "المجموع" (item.total) لكل منتج في الجدول'
            });

            // Handle payment method
            const paidAmount = parseFloat(purchaseData.paidAmount) || 0;
            const remainingAmount = purchaseData.total - paidAmount;
            
            Logger.log(`💰 Payment Info in General Entry:`, {
                paymentMethod,
                total: purchaseData.total,
                paidAmount,
                remainingAmount,
                paymentAccountId: purchaseData.paymentAccountId,
                supplierAccountId: supplierAccountId,
                supplierName: supplierName
            });
            
            // ========== الجزء الأول: القيد الناتج عن تفاصيل المنتجات ==========
            if (paymentMethod === 'cash') {
                // Cash Payment
                // Debit: Purchase account (itemsNetAmount in base currency)
                let purchaseEntry = {
                    accountId: purchaseAccount.id,
                    debit: itemsNetAmountInBase,
                    credit: 0,
                    originalAmount: itemsNetAmount,
                    originalCurrency: invoiceCurrency,
                    description: supplierName ? `شراء نقدي من ${supplierName}` : `فاتورة شراء نقدي رقم ${purchaseData.invoiceNo}`
                };
                entryData.entries.push(addAccountInfo(purchaseEntry, purchaseAccount.id));

                // Check if there's a partial payment with supplier
                // في الدفع النقدي: إذا كان هناك دفعة جزئية مع مورد، يجب أن يكون القيد الأساسي دائن حساب المورد
                // وإذا كان الدفع كامل، يكون دائن حساب النقدية
                if (paidAmount > 0 && paidAmount < purchaseData.total && supplierAccountId) {
                    // Cash payment with partial payment and supplier
                    // القيد الأساسي: دائن حساب المورد (لأن هناك دفعة جزئية)
                    Logger.log(`💰 معالجة دفعة جزئية في الدفع النقدي: ${paidAmount} من ${purchaseData.total}`);
                    
                    // Credit: Supplier account - دائن حساب المورد بقيمة itemsNetAmount
                    const supplierAccount = this.accounts.find(a => a.id === supplierAccountId);
                    if (!supplierAccount) {
                        console.error(`❌ حساب المورد غير موجود في قائمة الحسابات. supplierAccountId: ${supplierAccountId}, supplierName: ${supplierName}`);
                        throw new Error(`حساب المورد المرتبط في بطاقة المورد (${supplierName}) غير موجود في قائمة الحسابات. يرجى التحقق من إعدادات المورد.`);
                    }
                    
                    // حساب المبلغ الأصلي في عملة الفاتورة
                    const supplierAccountOriginalAmount = invoiceCurrency === baseCurrency 
                        ? itemsNetAmountInBase 
                        : itemsNetAmountInBase * invoiceExchangeRate;
                    
                    let supplierEntry = {
                        accountId: supplierAccountId,
                        debit: 0,
                        credit: itemsNetAmountInBase, // ✅ دائن حساب المورد بقيمة itemsNetAmount
                        originalAmount: itemsNetAmount,
                        originalCurrency: invoiceCurrency,
                        description: `فاتورة شراء نقدي مع دفعة جزئية رقم ${purchaseData.invoiceNo} - ${supplierName}`
                    };
                    entryData.entries.push(addAccountInfo(supplierEntry, supplierAccountId));
                    
                    // Get payment account (from invoice or settings)
                    let paymentAccountId = purchaseData.paymentAccountId || null;
                    if (!paymentAccountId) {
                        paymentAccountId = settings.defaultPaymentAccountId || settings.defaultCreditAccountId || null;
                    }
                    
                    if (!paymentAccountId) {
                        // Auto-detect payment account
                        const paymentAccount = this.accounts.find(a => 
                            a.type === 'asset' && 
                            (a.name.includes('نقدية') || a.name.includes('صندوق') || a.name.includes('بنك') || 
                             a.name.toLowerCase().includes('cash') || a.name.toLowerCase().includes('bank'))
                        );
                        if (paymentAccount) {
                            paymentAccountId = paymentAccount.id;
                        }
                    }
                    
                    if (!paymentAccountId) {
                        Logger.warn('⚠️ حساب الدفع غير موجود، سيتم تخطي قيد الدفعة الجزئية');
                    } else {
                        const paymentAccount = this.accounts.find(a => a.id === paymentAccountId);
                        if (!paymentAccount) {
                            console.warn(`⚠️ حساب الدفع غير موجود في قائمة الحسابات: ${paymentAccountId}`);
                        } else {
                            const paidAmountInBase = convertToBaseCurrency(paidAmount, invoiceCurrency, invoiceExchangeRate);
                            
                            // قيد الدفعة: دائن حساب الدفع (ننفق منه)، مدين حساب المورد (نسدد دينه)
                            // Credit: Payment account (دائن حساب الدفع) - لأننا ننفق منه
                            let paymentEntry = {
                                accountId: paymentAccountId,
                                debit: 0,
                                credit: paidAmountInBase,
                                originalAmount: paidAmount,
                                originalCurrency: invoiceCurrency,
                                description: `دفعة جزئية - فاتورة شراء رقم ${purchaseData.invoiceNo} - ${supplierName}`
                            };
                            entryData.entries.push(addAccountInfo(paymentEntry, paymentAccountId));
                            
                            // Debit: Supplier account (مدين حساب المورد) - لسداد جزء من الدين
                            let paymentSupplierEntry = {
                                accountId: supplierAccountId,
                                debit: paidAmountInBase,
                                credit: 0,
                                originalAmount: paidAmount,
                                originalCurrency: invoiceCurrency,
                                description: `دفعة جزئية - فاتورة شراء رقم ${purchaseData.invoiceNo} - ${supplierName}`
                            };
                            entryData.entries.push(addAccountInfo(paymentSupplierEntry, supplierAccountId));
                            
                            Logger.log(`✅ تم إضافة قيد الدفعة الجزئية: ${paidAmount} ${invoiceCurrency} (${paidAmountInBase} ${baseCurrency})`);
                        }
                    }
                } else {
                    // Cash payment full amount (no supplier or full payment)
                    // Credit: Cash account (from settings or auto-detect)
                    let cashAccount = null;
                    const cashAccountId = settings.defaultCreditAccountId || null;
                    if (cashAccountId) {
                        cashAccount = this.accounts.find(a => a.id === cashAccountId);
                    }
                    if (!cashAccount) {
                        // Auto-detect cash account
                        cashAccount = this.accounts.find(a => 
                            a.type === 'asset' && 
                            (a.name.includes('نقدية') || a.name.includes('صندوق') || a.name.toLowerCase().includes('cash'))
                        );
                    }
                    if (!cashAccount) {
                        Logger.warn('⚠️ Cash account not found, skipping general entry generation');
                        return;
                    }
                    let cashEntry = {
                        accountId: cashAccount.id,
                        debit: 0,
                        credit: itemsNetAmountInBase,
                        originalAmount: itemsNetAmount,
                        originalCurrency: invoiceCurrency,
                        description: `دفع نقدي - فاتورة شراء رقم ${purchaseData.invoiceNo}`
                    };
                    entryData.entries.push(addAccountInfo(cashEntry, cashAccount.id));
                }
            } else {
                // Credit Payment: Supplier account
                if (!supplierAccountId) {
                    Logger.warn('⚠️ Supplier account not found for credit payment, skipping general entry generation');
                    return;
                }

                // ✅ الجزء الأول: القيد الناتج عن تفاصيل المنتجات
                // Debit: Purchase account (itemsNetAmount in base currency)
                let purchaseEntry = {
                    accountId: purchaseAccount.id,
                    debit: itemsNetAmountInBase, // ✅ استخدام itemsNetAmount (subtotal - خصومات + إضافات)
                    credit: 0,
                    originalAmount: itemsNetAmount,
                    originalCurrency: invoiceCurrency,
                    description: supplierName ? `شراء آجل من ${supplierName}` : `فاتورة شراء آجل رقم ${purchaseData.invoiceNo}`
                };
                entryData.entries.push(addAccountInfo(purchaseEntry, purchaseAccount.id));

                // Credit: Supplier account - دائن حساب المورد بقيمة itemsNetAmount
                const supplierAccount = this.accounts.find(a => a.id === supplierAccountId);
                if (!supplierAccount) {
                    console.error(`❌ حساب المورد غير موجود في قائمة الحسابات. supplierAccountId: ${supplierAccountId}, supplierName: ${supplierName}`);
                    throw new Error(`حساب المورد المرتبط في بطاقة المورد (${supplierName}) غير موجود في قائمة الحسابات. يرجى التحقق من إعدادات المورد.`);
                }
                
                // التأكد من أن الحساب المستخدم هو الحساب المرتبط في بطاقة المورد وليس حساب افتراضي
                if (supplierAccount.id !== supplierAccountId) {
                    console.error(`❌ خطأ: الحساب المستخدم (${supplierAccount.id}) لا يطابق حساب المورد (${supplierAccountId})`);
                    throw new Error(`خطأ في تحديد حساب المورد. يرجى التحقق من إعدادات المورد.`);
                }
                
                // حساب المبلغ الأصلي في عملة الفاتورة
                const supplierAccountOriginalAmount = invoiceCurrency === baseCurrency 
                    ? itemsNetAmountInBase 
                    : itemsNetAmountInBase * invoiceExchangeRate;
                
                let supplierEntry = {
                    accountId: supplierAccountId,
                    debit: 0,
                    credit: itemsNetAmountInBase, // ✅ دائن حساب المورد بقيمة itemsNetAmount
                    originalAmount: itemsNetAmount,
                    originalCurrency: invoiceCurrency,
                    description: `فاتورة شراء آجل رقم ${purchaseData.invoiceNo} - ${supplierName}`
                };
                entryData.entries.push(addAccountInfo(supplierEntry, supplierAccountId));
                
                // Verify that the account name was set correctly - التأكد من استخدام الحساب الصحيح
                const addedEntry = entryData.entries[entryData.entries.length - 1];
                if (addedEntry.accountName !== supplierAccount.name) {
                    console.warn(`⚠️ تحذير: اسم الحساب في القيد (${addedEntry.accountName}) لا يطابق اسم حساب المورد (${supplierAccount.name})`);
                    // Force correct account name - فرض اسم الحساب الصحيح
                    addedEntry.accountName = supplierAccount.name;
                    addedEntry.accountCode = supplierAccount.code || '';
                }
                
                // التأكد النهائي من أن الحساب المستخدم هو الحساب المرتبط في بطاقة المورد
                if (addedEntry.accountId !== supplierAccountId) {
                    console.error(`❌ خطأ حرج: الحساب المستخدم في القيد (${addedEntry.accountId}) لا يطابق حساب المورد (${supplierAccountId})`);
                    throw new Error(`خطأ في تحديد حساب المورد في القيد. يرجى التحقق من إعدادات المورد.`);
                }
                
                // ========== الجزء الثالث: قيد الدفعة إن وجدت ==========
                // Handle payment (partial or full) - معالجة الدفعة (جزئية أو كاملة)
                // في الدفع الآجل: إذا كان هناك دفعة (جزئية أو كاملة)، يجب توليد قيد الدفعة
                if (paidAmount > 0) {
                    const isPartialPayment = paidAmount < purchaseData.total;
                    const paymentType = isPartialPayment ? 'جزئية' : 'كاملة';
                    Logger.log(`💰 معالجة دفعة ${paymentType}: ${paidAmount} من ${purchaseData.total}`);
                    
                    // Get payment account (from invoice or settings)
                    let paymentAccountId = purchaseData.paymentAccountId || null;
                    if (!paymentAccountId) {
                        // Use default payment account from settings
                        paymentAccountId = settings.defaultPaymentAccountId || settings.defaultCreditAccountId || null;
                    }
                    
                    if (!paymentAccountId) {
                        // Auto-detect payment account
                        const paymentAccount = this.accounts.find(a => 
                            a.type === 'asset' && 
                            (a.name.includes('نقدية') || a.name.includes('صندوق') || a.name.includes('بنك') || 
                             a.name.toLowerCase().includes('cash') || a.name.toLowerCase().includes('bank'))
                        );
                        if (paymentAccount) {
                            paymentAccountId = paymentAccount.id;
                        }
                    }
                    
                    if (!paymentAccountId) {
                        console.warn(`⚠️ حساب الدفع غير موجود، سيتم تخطي قيد الدفعة ${paymentType}`);
                    } else {
                        const paymentAccount = this.accounts.find(a => a.id === paymentAccountId);
                        if (!paymentAccount) {
                            console.warn(`⚠️ حساب الدفع غير موجود في قائمة الحسابات: ${paymentAccountId}`);
                        } else {
                            const paidAmountInBase = convertToBaseCurrency(paidAmount, invoiceCurrency, invoiceExchangeRate);
                            
                            // Credit: Payment account (دائن حساب الدفع) - لأننا ننفق منه
                            let paymentEntry = {
                                accountId: paymentAccountId,
                                debit: 0,
                                credit: paidAmountInBase,
                                originalAmount: paidAmount,
                                originalCurrency: invoiceCurrency,
                                description: `دفعة ${paymentType} - فاتورة شراء رقم ${purchaseData.invoiceNo} - ${supplierName}`
                            };
                            entryData.entries.push(addAccountInfo(paymentEntry, paymentAccountId));
                            
                            // Debit: Supplier account (مدين حساب المورد) - لسداد الدين
                            let paymentSupplierEntry = {
                                accountId: supplierAccountId,
                                debit: paidAmountInBase,
                                credit: 0,
                                originalAmount: paidAmount,
                                originalCurrency: invoiceCurrency,
                                description: `دفعة ${paymentType} - فاتورة شراء رقم ${purchaseData.invoiceNo} - ${supplierName}`
                            };
                            entryData.entries.push(addAccountInfo(paymentSupplierEntry, supplierAccountId));
                            
                            Logger.log(`✅ تم إضافة قيد الدفعة ${paymentType}: ${paidAmount} ${invoiceCurrency} (${paidAmountInBase} ${baseCurrency})`);
                        }
                    }
                }
            }

            // ========== الجزء الثاني: الخصومات والإضافات لكل سطر (من discountAdditionRows) ==========
            // قيد تفصيلي لكل سطر من discountAdditionRows
            // الإضافات: مدين حساب الإضافة (مصروف)، دائن الحساب المقابل (المحدد في الصف أو حساب المورد/الدائن حسب طريقة الدفع)
            // الخصومات: دائن حساب الخصم، مدين الحساب المقابل (المحدد في الصف أو حساب المورد/الدائن حسب طريقة الدفع)
            if (purchaseData.discountAdditionRows && purchaseData.discountAdditionRows.length > 0) {
                // ⚠️ CRITICAL FIX: استخدام for...of بدلاً من forEach لتجنب مشكلة return
                for (const row of purchaseData.discountAdditionRows) {
                    // Get row currency and exchange rate
                    const rowCurrency = row.currency || invoiceCurrency;
                    const rowExchangeRate = row.exchangeRate || invoiceExchangeRate;
                    
                    // Convert amount to base currency
                    const amountInBaseCurrency = convertToBaseCurrency(row.amount, rowCurrency, rowExchangeRate);
                    
                    if (row.type === 'addition' && row.amount > 0) {
                        // ⚠️ CRITICAL FIX: إذا كان هناك حساب مقابل محدد في الصف (row.counterAccountId)
                        // فإن هذا يعني أن الإضافة لها حساب مقابل منفصل، ولا يجب أن تتحرك في حساب المورد
                        // لأن حساب المورد تم تحريكه بالفعل في القيد الأساسي بعد طرح/إضافة هذه القيم
                        
                        let additionCounterAccountId = row.counterAccountId;
                        
                        // ⚠️ إذا كان هناك حساب مقابل محدد في الصف، نستخدمه مباشرة
                        // إذا لم يكن هناك حساب مقابل محدد، لا نضيف قيد تفصيلي لأن:
                        // 1. حساب الإضافة: مدين (سيتم إضافته أدناه)
                        // 2. حساب المورد: تم تحريكه في القيد الأساسي بـ (total + addition)
                        // القيد متوازن بالفعل!
                        
                        // ✅ إذا لم يكن هناك حساب مقابل محدد في الصف، نستخدم حساب المورد
                        if (!additionCounterAccountId) {
                            if (paymentMethod === 'credit' && supplierAccountId) {
                                additionCounterAccountId = supplierAccountId; // حساب المورد
                            } else if (paymentMethod === 'cash') {
                                additionCounterAccountId = settings.defaultCreditAccountId || null; // الحساب الدائن
                            }
                        }
                        
                        if (!additionCounterAccountId) {
                            Logger.warn('⚠️ لم يتم تحديد الحساب المقابل للإضافة، سيتم تخطي القيد');
                            continue;
                        }
                        
                        // ⚠️ CRITICAL: التحقق من وجود حساب الإضافة
                        if (!row.accountId) {
                            Logger.warn('⚠️ لم يتم تحديد حساب الإضافة في الصف، سيتم تخطي القيد');
                            continue;
                        }
                        
                        // Debit: Addition account (from row) - حساب الإضافة (مصروف)
                        const additionAccount = this.accounts.find(a => a.id === row.accountId);
                        if (!additionAccount) {
                            console.warn(`⚠️ حساب الإضافة غير موجود في قائمة الحسابات: ${row.accountId}`);
                            continue;
                        }
                        
                        let additionEntry = {
                            accountId: row.accountId,
                            debit: amountInBaseCurrency,
                            credit: 0,
                            originalAmount: row.amount,
                            originalCurrency: rowCurrency,
                            description: `إضافة - ${row.notes || `فاتورة شراء رقم ${purchaseData.invoiceNo}`}`
                        };
                        entryData.entries.push(addAccountInfo(additionEntry, row.accountId));

                        // Credit: Counter account - الحساب المقابل
                        const additionCounterAccount = this.accounts.find(a => a.id === additionCounterAccountId);
                        if (!additionCounterAccount) {
                            console.error(`❌ حساب المقابل للإضافة غير موجود: ${additionCounterAccountId}`);
                            throw new Error(`حساب المقابل للإضافة غير موجود في قائمة الحسابات`);
                        }
                        
                        let additionCounterEntry = {
                            accountId: additionCounterAccount.id,
                            debit: 0,
                            credit: amountInBaseCurrency,
                            originalAmount: row.amount,
                            originalCurrency: rowCurrency,
                            description: `إضافة - ${row.notes || `فاتورة شراء رقم ${purchaseData.invoiceNo}`}`
                        };
                        entryData.entries.push(addAccountInfo(additionCounterEntry, additionCounterAccount.id));
                    } else if (row.type === 'discount' && row.amount > 0) {
                        // ⚠️ CRITICAL FIX: إذا كان هناك حساب مقابل محدد في الصف (row.counterAccountId)
                        // فإن هذا يعني أن الخصم له حساب مقابل منفصل، ولا يجب أن تتحرك في حساب المورد
                        // لأن حساب المورد تم تحريكه بالفعل في القيد الأساسي بعد طرح/إضافة هذه القيم
                        
                        let discountCounterAccountId = row.counterAccountId;
                        
                        // ⚠️ إذا كان هناك حساب مقابل محدد في الصف، نستخدمه مباشرة
                        // إذا لم يكن هناك حساب مقابل محدد، لا نضيف قيد تفصيلي لأن:
                        // 1. حساب الخصم: دائن (سيتم إضافته أدناه)
                        // 2. حساب المورد: تم تحريكه في القيد الأساسي بـ (total - discount)
                        // القيد متوازن بالفعل!
                        
                        // ✅ إذا لم يكن هناك حساب مقابل محدد في الصف، نستخدم حساب المورد
                        if (!discountCounterAccountId) {
                            if (paymentMethod === 'credit' && supplierAccountId) {
                                discountCounterAccountId = supplierAccountId; // حساب المورد
                            } else if (paymentMethod === 'cash') {
                                discountCounterAccountId = settings.defaultCreditAccountId || null; // الحساب الدائن
                            }
                        }
                        
                        if (!discountCounterAccountId) {
                            Logger.warn('⚠️ لم يتم تحديد الحساب المقابل للخصم، سيتم تخطي القيد');
                            continue;
                        }
                        
                        // ⚠️ CRITICAL: التحقق من وجود حساب الخصم
                        if (!row.accountId) {
                            Logger.warn('⚠️ لم يتم تحديد حساب الخصم في الصف، سيتم تخطي القيد');
                            continue;
                        }

                        // Credit: Discount account (from row) - حساب الخصم (دائن)
                        const discountAccount = this.accounts.find(a => a.id === row.accountId);
                        if (!discountAccount) {
                            console.warn(`⚠️ حساب الخصم غير موجود في قائمة الحسابات: ${row.accountId}`);
                            continue;
                        }
                        
                        let discountEntry = {
                            accountId: row.accountId,
                            debit: 0,
                            credit: amountInBaseCurrency,
                            originalAmount: row.amount,
                            originalCurrency: rowCurrency,
                            description: `خصم - ${row.notes || `فاتورة شراء رقم ${purchaseData.invoiceNo}`}`
                        };
                        entryData.entries.push(addAccountInfo(discountEntry, row.accountId));

                        // Debit: Counter account - الحساب المقابل (مدين)
                        const discountCounterAccount = this.accounts.find(a => a.id === discountCounterAccountId);
                        if (!discountCounterAccount) {
                            console.error(`❌ حساب المقابل للخصم غير موجود: ${discountCounterAccountId}`);
                            throw new Error(`حساب المقابل للخصم غير موجود في قائمة الحسابات`);
                        }
                        
                        let discountCounterEntry = {
                            accountId: discountCounterAccount.id,
                            debit: amountInBaseCurrency,
                            credit: 0,
                            originalAmount: row.amount,
                            originalCurrency: rowCurrency,
                            description: `خصم - ${row.notes || `فاتورة شراء رقم ${purchaseData.invoiceNo}`}`
                        };
                        entryData.entries.push(addAccountInfo(discountCounterEntry, discountCounterAccount.id));
                    }
                }
            }

            // ⚠️ CRITICAL: Validate entry balance before saving
            // التحقق من التوازن هو أساس القيد المحاسبي - يجب أن يكون المدين = الدائن تماماً
            if (!entryData.entries || entryData.entries.length === 0) {
                Logger.error('❌ لا توجد قيود في القيد العام!');
                throw new Error('القيد العام فارغ - لا توجد قيود محاسبية');
            }
            
            const totalDebit = entryData.entries.reduce((sum, e) => {
                const debit = parseFloat(e.debit) || 0;
                if (isNaN(debit) || debit < 0) {
                    Logger.error('❌ قيمة مدين غير صحيحة:', e);
                    throw new Error(`قيمة مدين غير صحيحة في القيد: ${JSON.stringify(e)}`);
                }
                return sum + debit;
            }, 0);
            
            const totalCredit = entryData.entries.reduce((sum, e) => {
                const credit = parseFloat(e.credit) || 0;
                if (isNaN(credit) || credit < 0) {
                    Logger.error('❌ قيمة دائن غير صحيحة:', e);
                    throw new Error(`قيمة دائن غير صحيحة في القيد: ${JSON.stringify(e)}`);
                }
                return sum + credit;
            }, 0);
            
            const balanceDifference = Math.abs(totalDebit - totalCredit);
            
            // ⚠️ CRITICAL: يجب أن يكون الفرق صفر تماماً (مع مراعاة أخطاء التقريب)
            if (balanceDifference > 0.01) {
                Logger.error('❌ CRITICAL ERROR: القيد العام غير متوازن!', {
                    totalDebit: totalDebit.toFixed(2),
                    totalCredit: totalCredit.toFixed(2),
                    difference: balanceDifference.toFixed(2),
                    entriesCount: entryData.entries.length,
                    entries: entryData.entries.map(e => ({
                        accountId: e.accountId,
                        accountName: e.accountName,
                        debit: e.debit,
                        credit: e.credit
                    }))
                });
                throw new Error(`❌ خطأ حرج: القيد العام غير متوازن!\n\nالمدين: ${totalDebit.toFixed(2)}\nالدائن: ${totalCredit.toFixed(2)}\nالفرق: ${balanceDifference.toFixed(2)}\n\nهذا خطأ في المنطق المحاسبي ويجب إصلاحه قبل الحفظ.`);
            }
            
            // ✅ التحقق من أن كل قيد له حساب صحيح
            for (const entry of entryData.entries) {
                if (!entry.accountId) {
                    Logger.error('❌ قيد بدون حساب:', entry);
                    throw new Error(`قيد بدون حساب محاسبي: ${JSON.stringify(entry)}`);
                }
                
                const account = this.accounts.find(a => a.id === entry.accountId);
                if (!account) {
                    Logger.error('❌ حساب غير موجود في قائمة الحسابات:', entry.accountId);
                    throw new Error(`الحساب ${entry.accountId} غير موجود في قائمة الحسابات`);
                }
                
                // التحقق من أن القيد إما مدين أو دائن (وليس كلاهما)
                const hasDebit = (parseFloat(entry.debit) || 0) > 0;
                const hasCredit = (parseFloat(entry.credit) || 0) > 0;
                if (hasDebit && hasCredit) {
                    Logger.warn('⚠️ قيد يحتوي على مدين ودائن معاً:', entry);
                }
                if (!hasDebit && !hasCredit) {
                    Logger.error('❌ قيد بدون مدين أو دائن:', entry);
                    throw new Error(`قيد بدون مدين أو دائن: ${JSON.stringify(entry)}`);
                }
            }

            // Add totals to entry data for validation
            entryData.totalDebit = totalDebit;
            entryData.totalCredit = totalCredit;
            entryData.isBalanced = true;
            
            Logger.log('✅ القيد العام متوازن:', {
                totalDebit: totalDebit.toFixed(2),
                totalCredit: totalCredit.toFixed(2),
                entriesCount: entryData.entries.length
            });

            // ✅ Validate entry balance before saving
            if (typeof AccuracyValidator !== 'undefined' && AccuracyValidator) {
                const balanceValidation = AccuracyValidator.validateEntryBalance(entryData.entries);
                if (!balanceValidation.isValid) {
                    const errorMsg = `القيد غير متوازن: مدين=${balanceValidation.totalDebit}, دائن=${balanceValidation.totalCredit}, الفرق=${balanceValidation.difference}`;
                    Logger.error('❌', errorMsg);
                    throw new Error(errorMsg);
                }
                
                // ✅ Validate general entry structure
                const entryValidation = AccuracyValidator.validateGeneralEntry(entryData);
                if (!entryValidation.isValid) {
                    const errorMsg = `أخطاء في القيد: ${entryValidation.errors.join(', ')}`;
                    Logger.error('❌', errorMsg);
                    throw new Error(errorMsg);
                }
                
                if (entryValidation.warnings.length > 0) {
                    Logger.warn('⚠️ تحذيرات في القيد:', entryValidation.warnings);
                }
            } else {
                // Fallback validation if AccuracyValidator is not available
                const totalDebit = entryData.entries.reduce((sum, e) => sum + parseFloat(e.debit || 0), 0);
                const totalCredit = entryData.entries.reduce((sum, e) => sum + parseFloat(e.credit || 0), 0);
                const difference = Math.abs(totalDebit - totalCredit);
                if (difference > 0.01) {
                    const errorMsg = `القيد غير متوازن: مدين=${totalDebit.toFixed(2)}, دائن=${totalCredit.toFixed(2)}, الفرق=${difference.toFixed(2)}`;
                    Logger.error('❌', errorMsg);
                    throw new Error(errorMsg);
                }
            }

            // Save general entry
            const generalEntryResult = await Collections.addGeneralEntry(entryData);
            // ⚠️ CRITICAL: Extract ID from result (addDocument returns object with id property)
            const generalEntryId = generalEntryResult?.id || generalEntryResult;
            
            Logger.log('✅ General entry generated successfully', {
                id: generalEntryId,
                resultType: typeof generalEntryResult,
                totalDebit: totalDebit.toFixed(2),
                totalCredit: totalCredit.toFixed(2),
                entriesCount: entryData.entries.length,
                validated: true
            });

            return generalEntryId;

           } catch (error) {
               console.error('❌ Error generating general entry:', error);
               // Don't throw error to avoid breaking the purchase flow
               return null;
           }
       },

       /**
        * Show generated general entry after saving purchase
        */
       async showGeneratedGeneralEntry(purchaseId) {
           try {
               Logger.log(`🎯 showGeneratedGeneralEntry called with purchaseId: ${purchaseId}`);
               
               // Wait a bit to ensure modal is fully closed and DOM is stable
               // This prevents conflicts between Bootstrap modal and SweetAlert
               await new Promise(resolve => setTimeout(resolve, 200));
               
               // ⚠️ CRITICAL: Convert purchaseId to string for proper matching
               const sourceIdString = String(purchaseId);
               
               Logger.log(`🔍 Searching for general entry with sourceId: ${sourceIdString}`);
               
               // Find general entry by sourceId
               // ⚠️ Note: We search by sourceId and type only (can't use FieldValue in where() queries)
               let snapshot;
               try {
                   // Use a simple query that doesn't involve FieldValue fields
                   snapshot = await db.collection('generalEntries')
                       .where('sourceId', '==', sourceIdString)
                       .where('type', '==', 'purchase')
                       .limit(1)
                       .get();
               } catch (queryError) {
                   Logger.error('❌ Error querying general entries:', queryError);
                   console.error('Query error details:', {
                       message: queryError.message,
                       code: queryError.code,
                       sourceId: sourceIdString
                   });
                   
                   // If query fails due to FieldValue issue, try to get all entries and filter manually
                   // This is a workaround for the FieldValue.serverTimestamp() issue
                   try {
                       Logger.log('🔄 Trying alternative: get all purchase entries and filter manually...');
                       const allEntries = await db.collection('generalEntries')
                           .where('type', '==', 'purchase')
                           .get();
                       
                       const matchingEntry = allEntries.docs.find(doc => {
                           const data = doc.data();
                           const storedSourceId = String(data.sourceId || '');
                           return storedSourceId === sourceIdString;
                       });
                       
                       if (matchingEntry) {
                           snapshot = {
                               docs: [matchingEntry],
                               empty: false,
                               size: 1
                           };
                           Logger.log('✅ Found entry using alternative method');
                       } else {
                           Logger.log('ℹ️ No matching entry found using alternative method');
                           return;
                       }
                   } catch (altError) {
                       Logger.error('❌ Alternative method also failed:', altError);
                       return;
                   }
               }

               if (snapshot.empty) {
                   Logger.log(`ℹ️ No general entry found for sourceId: ${sourceIdString}`);
                   return;
               }

               const generalEntryDoc = snapshot.docs[0];
               const generalEntryData = generalEntryDoc.data();
               
               Logger.log(`✅ Found general entry: ${generalEntryDoc.id}`);
               
               // Clean up FieldValue.serverTimestamp() from createdAt and all nested objects
               // Convert it to a proper date or remove it to avoid query errors
               // FieldValue objects cannot be used in queries, so we need to convert them
               const cleanFieldValue = (value) => {
                   if (value === null || value === undefined) {
                       return value;
                   }
                   
                   // Check if it's a Firestore Timestamp
                   if (value && typeof value === 'object' && value.toDate && typeof value.toDate === 'function') {
                       try {
                           return value.toDate();
                       } catch (e) {
                           return new Date();
                       }
                   }
                   
                   // Check if it's a FieldValue (serverTimestamp, etc.)
                   // FieldValue has a _method property or _delegate property
                   if (value && typeof value === 'object' && (
                       value._method === 'serverTimestamp' || 
                       value._delegate || 
                       (value.constructor && value.constructor.name === 'FieldValue') ||
                       (value.toString && value.toString().includes('FieldValue'))
                   )) {
                       // Convert to current date or remove
                       return new Date();
                   }
                   
                   // If it's an array, clean each element
                   if (Array.isArray(value)) {
                       return value.map(item => cleanFieldValue(item));
                   }
                   
                   // If it's an object, clean all properties recursively
                   if (typeof value === 'object' && !(value instanceof Date)) {
                       const cleaned = {};
                       for (const key in value) {
                           if (value.hasOwnProperty(key)) {
                               cleaned[key] = cleanFieldValue(value[key]);
                           }
                       }
                       return cleaned;
                   }
                   
                   return value;
               };
               
               // Clean the data recursively
               const cleanedData = cleanFieldValue(generalEntryData);
               
               // Ensure createdAt and updatedAt are proper Date objects
               if (cleanedData.createdAt && !(cleanedData.createdAt instanceof Date)) {
                   if (cleanedData.createdAt && typeof cleanedData.createdAt === 'object') {
                       // If it's still an object (FieldValue), convert to Date
                       cleanedData.createdAt = new Date();
                   } else if (cleanedData.createdAt && typeof cleanedData.createdAt.toDate === 'function') {
                       cleanedData.createdAt = cleanedData.createdAt.toDate();
                   }
               }
               
               if (cleanedData.updatedAt && !(cleanedData.updatedAt instanceof Date)) {
                   if (cleanedData.updatedAt && typeof cleanedData.updatedAt === 'object') {
                       cleanedData.updatedAt = new Date();
                   } else if (cleanedData.updatedAt && typeof cleanedData.updatedAt.toDate === 'function') {
                       cleanedData.updatedAt = cleanedData.updatedAt.toDate();
                   }
               }
               
               const generalEntry = {
                   id: generalEntryDoc.id,
                   ...cleanedData
               };
               
               // Final safety check: remove any FieldValue objects
               if (generalEntry.createdAt && typeof generalEntry.createdAt === 'object' && !(generalEntry.createdAt instanceof Date)) {
                   // Check if it's a FieldValue by trying to detect it
                   if (generalEntry.createdAt._method === 'serverTimestamp' || 
                       generalEntry.createdAt._delegate ||
                       (generalEntry.createdAt.toString && generalEntry.createdAt.toString().includes('FieldValue'))) {
                       generalEntry.createdAt = new Date();
                   }
               }
               
               if (generalEntry.updatedAt && typeof generalEntry.updatedAt === 'object' && !(generalEntry.updatedAt instanceof Date)) {
                   if (generalEntry.updatedAt._method === 'serverTimestamp' || 
                       generalEntry.updatedAt._delegate ||
                       (generalEntry.updatedAt.toString && generalEntry.updatedAt.toString().includes('FieldValue'))) {
                       generalEntry.updatedAt = new Date();
                   }
               }

               // Always use our own SweetAlert dialog (don't use VouchersModule.displayGeneralEntry)
               // This ensures consistent behavior and prevents multiple dialogs
               if (typeof Swal !== 'undefined') {
                   Logger.log('✅ SweetAlert is available, preparing dialog...');
                   
                   // Get purchase data for print button
                   let purchase = null;
                   try {
                       purchase = await Collections.getPurchase(purchaseId);
                       Logger.log('✅ Purchase data loaded for dialog:', purchase?.invoiceNo || 'N/A');
                   } catch (e) {
                       Logger.warn('⚠️ Could not load purchase for print button:', e);
                   }
                   
                   // Store references for button handlers
                   const self = this;
                   const entryId = generalEntryDoc.id;
                   
                   // Ensure any modal backdrop is removed before showing SweetAlert
                   const existingBackdrop = document.querySelector('.modal-backdrop');
                   if (existingBackdrop) {
                       existingBackdrop.remove();
                       Logger.log('✅ Removed existing modal backdrop');
                   }
                   
                   // Remove modal-open class from body if it exists
                   if (document.body.classList.contains('modal-open')) {
                       document.body.classList.remove('modal-open');
                       document.body.style.overflow = '';
                       document.body.style.paddingRight = '';
                       Logger.log('✅ Removed modal-open class from body');
                   }
                   
                   // Small delay to ensure DOM is clean
                   await new Promise(resolve => setTimeout(resolve, 100));
                   
                   Logger.log('📢 Showing SweetAlert dialog...');
                   
                   // Dialog with options: Print Invoice, Print General Entry, or Cancel
                   Swal.fire({
                       title: 'تم حفظ فاتورة الشراء بنجاح',
                       html: `
                           <div class="text-center mb-3">
                               <p><strong>رقم الفاتورة:</strong> ${this.escapeHtml(purchase?.invoiceNo || generalEntry.reference || 'N/A')}</p>
                               <p><strong>التاريخ:</strong> ${formatDate(generalEntry.date)}</p>
                           </div>
                           <p class="text-center mb-3">ماذا تريد طباعته؟</p>
                       `,
                       icon: 'success',
                       showCancelButton: true,
                       showDenyButton: true,
                       confirmButtonText: 'طباعة الفاتورة',
                       cancelButtonText: 'طباعة القيد العام',
                       denyButtonText: 'إلغاء',
                       confirmButtonColor: '#28a745',
                       cancelButtonColor: '#17a2b8',
                       denyButtonColor: '#6c757d',
                       allowOutsideClick: true,
                       allowEscapeKey: true,
                       focusConfirm: false,
                       backdrop: true,
                       didOpen: () => {
                           // Ensure body doesn't have modal-open class when SweetAlert is open
                           if (document.body.classList.contains('modal-open')) {
                               document.body.classList.remove('modal-open');
                           }
                       }
                   }).then(async (result) => {
                       // Flag to track if form has been reset to avoid duplicate calls
                       let formReset = false;
                       
                       const resetFormOnce = () => {
                           if (!formReset) {
                               formReset = true;
                               self.cancelPurchaseForm();
                           }
                       };
                       
                       const restoreFocus = () => {
                           try {
                               if (window && !window.closed) {
                                   window.focus();
                               }
                           } catch (e) {
                               Logger.warn('⚠️ Could not restore focus:', e);
                           }
                       };
                       
                       try {
                           if (result.isConfirmed && purchase) {
                               // Print purchase invoice
                               await self.printPurchaseInvoice(purchase);
                               // Reset form after printing
                               resetFormOnce();
                           } else if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
                               // Print general entry
                               if (typeof VouchersModule !== 'undefined' && VouchersModule.printGeneralEntry) {
                                   await VouchersModule.printGeneralEntry(entryId);
                               } else {
                                   Logger.warn('⚠️ VouchersModule.printGeneralEntry not available');
                                   await Swal.fire({
                                       title: 'تحذير',
                                       text: 'وظيفة طباعة القيد العام غير متاحة حالياً',
                                       icon: 'warning',
                                       confirmButtonText: 'حسناً'
                                   });
                               }
                               // Reset form after printing
                               resetFormOnce();
                           } else {
                               // If denied or dismissed (user clicked "إلغاء"), just reset form
                               resetFormOnce();
                           }
                           
                           // Always restore focus after dialog closes
                           setTimeout(restoreFocus, 100);
                       } catch (error) {
                           Logger.error('❌ Error handling print action:', error);
                           
                           // Ensure form is reset even on error
                           resetFormOnce();
                           
                           // Show error message
                           if (typeof showError === 'function') {
                               showError('فشل في الطباعة: ' + (error.message || 'خطأ غير معروف'));
                           } else {
                               await Swal.fire({
                                   title: 'خطأ',
                                   text: 'فشل في الطباعة: ' + (error.message || 'خطأ غير معروف'),
                                   icon: 'error',
                                   confirmButtonText: 'حسناً'
                               });
                           }
                           
                           // Restore focus after error
                           setTimeout(restoreFocus, 100);
                       }
                   });
               } else {
                   // No Swal available - just log and reset form
                   Logger.warn('⚠️ SweetAlert not available, cannot show dialog');
                   this.cancelPurchaseForm();
               }
           } catch (error) {
               console.error('❌ Error showing generated general entry:', error);
               // Ensure form is reset even on error
               this.cancelPurchaseForm();
           }
       },

       /**
        * Update or create general entry for purchase (used when editing)
        */
       async updateOrCreateGeneralEntry(purchaseData) {
           try {
               // ⚠️ CRITICAL: Ensure purchaseData.id is a string
               if (!purchaseData.id) {
                   Logger.error('❌ purchaseData.id is missing in updateOrCreateGeneralEntry');
                   return;
               }
               
               const purchaseId = String(purchaseData.id);
               
               const generateEntry = document.getElementById('generateGeneralEntry')?.checked;
               if (!generateEntry) {
                   // If generation is disabled, delete existing entry if any
                   await this.deleteGeneralEntryBySourceId(purchaseId);
                   return;
               }

               Logger.log('🔄 Updating general entry for purchase:', purchaseData.invoiceNo, 'ID:', purchaseId);

               // Find and delete existing general entry
               await this.deleteGeneralEntryBySourceId(purchaseId);

               // Generate new general entry
               await this.generateGeneralEntry(purchaseData);

           } catch (error) {
               Logger.error('❌ Error updating general entry:', error);
               // Don't throw error to avoid breaking the purchase flow
           }
       },

       /**
        * Delete inventory movements by source ID and type
        * @param {string} sourceType - The source type (e.g., 'purchase', 'sale')
        * @param {string} sourceId - The source ID (invoice ID)
        * @returns {Promise<number>} Number of deleted movements
        */
       // ✅ Using shared function from Collections
       async deleteInventoryMovementsBySource(sourceType, sourceId) {
           return await Collections.deleteInventoryMovementsBySource(sourceType, sourceId);
       },

       /**
        * Delete general entry by sourceId (purchase ID)
        * @param {string} sourceId - The purchase ID
        * @returns {Promise<number>} Number of deleted entries
        */
       async deleteGeneralEntryBySourceId(sourceId) {
           try {
               if (!sourceId) {
                   Logger.warn('⚠️ sourceId is required for deleting general entry');
                   return 0;
               }

               // ⚠️ CRITICAL: Convert sourceId to string to ensure proper matching
               const sourceIdString = String(sourceId);
               Logger.log(`🔍 البحث عن القيود المحاسبية المرتبطة بفاتورة الشراء: ${sourceIdString} (original type: ${typeof sourceId})`);
               let totalDeleted = 0;
               const deletedDocIds = new Set(); // Track deleted document IDs to avoid double deletion
               const foundEntries = []; // Track all found entries for debugging

               // First, try to find general entry by sourceId and type (preferred method)
               try {
                   Logger.log(`📋 البحث باستخدام sourceId و type='purchase'...`);
                   const snapshot = await db.collection('generalEntries')
                       .where('sourceId', '==', sourceIdString)
                       .where('type', '==', 'purchase')
                       .get();

                   Logger.log(`📊 النتيجة: ${snapshot.size} قيد محاسبي موجود`);

                   if (!snapshot.empty) {
                       snapshot.docs.forEach(doc => {
                           const data = doc.data();
                           foundEntries.push({
                               id: doc.id,
                               sourceId: data.sourceId,
                               type: data.type,
                               reference: data.reference,
                               voucherNumber: data.voucherNumber
                           });
                           Logger.log(`  - القيد: ${doc.id}, المرجع: ${data.reference || 'N/A'}, النوع: ${data.type || 'N/A'}`);
                       });

                       const batch = db.batch();
                       snapshot.docs.forEach(doc => {
                           batch.delete(doc.ref);
                           deletedDocIds.add(doc.id);
                       });
                       await batch.commit();
                       totalDeleted += snapshot.size;
                       Logger.log(`✅ تم حذف ${snapshot.size} قيد محاسبي مرتبط بفاتورة الشراء ${sourceIdString} (من خلال البحث بالـ type)`);
                   }
               } catch (typeQueryError) {
                   Logger.warn('⚠️ خطأ في البحث بالـ type، سيتم البحث بدون type:', typeQueryError);
                   console.error('تفاصيل الخطأ:', typeQueryError.message, typeQueryError.stack);
               }

               // Fallback: Search by sourceId only (in case type field is missing or different)
               // This ensures we catch all entries even if type field wasn't set correctly
               try {
                   Logger.log(`📋 البحث البديل باستخدام sourceId فقط...`);
                   
                   // Get purchase data for reference matching (if sourceId doesn't match)
                   let purchase = null;
                   try {
                       purchase = await Collections.getPurchase(sourceIdString);
                       if (purchase) {
                           Logger.log(`📋 بيانات الفاتورة للمطابقة: ${purchase.invoiceNo || 'N/A'}`);
                       }
                   } catch (e) {
                       Logger.warn('⚠️ Could not load purchase for reference matching:', e);
                   }
                   
                   const fallbackSnapshot = await db.collection('generalEntries')
                       .where('sourceId', '==', sourceIdString)
                       .get();

                   Logger.log(`📊 النتيجة البديلة: ${fallbackSnapshot.size} قيد محاسبي موجود`);

                   if (!fallbackSnapshot.empty) {
                       // Filter out entries that were already deleted and only get purchase-related entries
                       const entriesToDelete = fallbackSnapshot.docs.filter(doc => {
                           // Skip if already deleted in the first batch
                           if (deletedDocIds.has(doc.id)) {
                               return false;
                           }
                           
                           const data = doc.data();
                           // ⚠️ CRITICAL: Convert stored sourceId to string for comparison
                           // Handle case where sourceId might be stored as [object Object] string
                           let storedSourceId = '';
                           if (data.sourceId) {
                               if (typeof data.sourceId === 'string') {
                                   storedSourceId = data.sourceId;
                                   // If it's [object Object], try to extract from reference
                                   if (storedSourceId === '[object Object]' || storedSourceId.includes('[object')) {
                                       console.warn(`  ⚠️ sourceId stored as [object Object] string, will match by reference instead`);
                                       storedSourceId = ''; // Clear to force reference matching
                                   }
                               } else if (typeof data.sourceId === 'object' && data.sourceId.id) {
                                   storedSourceId = String(data.sourceId.id);
                               } else {
                                   storedSourceId = String(data.sourceId);
                               }
                           }
                           
                           Logger.log(`  - فحص القيد: ${doc.id}, sourceId: ${storedSourceId} (stored type: ${typeof data.sourceId}), type: ${data.type || 'N/A'}, reference: ${data.reference || 'N/A'}`);
                           
                           // Check if sourceId matches (as string)
                           const sourceIdMatches = storedSourceId && storedSourceId === sourceIdString;
                           
                           // Also check by reference if sourceId doesn't match (for old entries with [object Object])
                           const referenceMatches = data.reference && typeof data.reference === 'string' && 
                                                   data.reference === purchase?.invoiceNo;
                           
                           // Only delete if it's a purchase-related entry (check type or reference pattern)
                           const isPurchaseEntry = (sourceIdMatches || referenceMatches) && (
                               data.type === 'purchase' || 
                               !data.type || 
                               (data.reference && typeof data.reference === 'string' && (
                                   data.reference.startsWith('PUR-') ||
                                   data.reference.match(/^P\d+$/) || // Pattern like P123
                                   data.reference.match(/^\d+$/) // Just numbers (could be invoice number)
                               )) ||
                               (data.voucherNumber && typeof data.voucherNumber === 'string' && 
                                data.voucherNumber.includes('GE-'))
                           );
                           
                           if (isPurchaseEntry) {
                               Logger.log(`    ✓ تم تحديده كقيد مشتريات - سيتم حذفه (sourceId match: ${sourceIdMatches}, reference match: ${referenceMatches})`);
                           } else {
                               Logger.log(`    ✗ ليس قيد مشتريات - لن يتم حذفه (sourceId match: ${sourceIdMatches}, reference match: ${referenceMatches})`);
                           }
                           
                           return isPurchaseEntry;
                       });

                       if (entriesToDelete.length > 0) {
                           const batch = db.batch();
                           entriesToDelete.forEach(doc => {
                               batch.delete(doc.ref);
                               deletedDocIds.add(doc.id);
                           });
                           await batch.commit();
                           totalDeleted += entriesToDelete.length;
                           Logger.log(`✅ تم حذف ${entriesToDelete.length} قيد محاسبي إضافي مرتبط بفاتورة الشراء ${sourceIdString} (من خلال البحث بدون type)`);
                       } else {
                           Logger.log(`ℹ️ لم يتم العثور على قيود إضافية للحذف`);
                       }
                   }
               } catch (fallbackError) {
                   Logger.error('❌ خطأ في البحث البديل:', fallbackError);
                   console.error('تفاصيل الخطأ:', fallbackError.message, fallbackError.stack);
               }

               // Final summary
               if (totalDeleted > 0) {
                   Logger.log(`✅ إجمالي القيود المحاسبية المحذوفة: ${totalDeleted} لفاتورة الشراء ${sourceIdString}`);
                   Logger.log(`📋 ملخص القيود التي تم العثور عليها:`, foundEntries);
                   return totalDeleted;
               } else {
                   Logger.log(`ℹ️ لا يوجد قيد محاسبي مرتبط بفاتورة الشراء ${sourceIdString}`);
                   Logger.log(`📋 القيود التي تم فحصها:`, foundEntries);
                   
                   // Additional diagnostic: Try to find any entry with similar reference
                   try {
                       const purchase = await Collections.getPurchase(sourceIdString);
                       if (purchase && purchase.invoiceNo) {
                           Logger.log(`🔍 محاولة البحث باستخدام رقم الفاتورة: ${purchase.invoiceNo}`);
                           const refSnapshot = await db.collection('generalEntries')
                               .where('reference', '==', purchase.invoiceNo)
                               .get();
                           
                           if (!refSnapshot.empty) {
                               console.warn(`⚠️ تم العثور على ${refSnapshot.size} قيد باستخدام رقم الفاتورة، لكن sourceId غير متطابق!`);
                               refSnapshot.docs.forEach(doc => {
                                   const data = doc.data();
                                   const storedSourceId = String(data.sourceId || 'غير موجود');
                                   console.warn(`  - القيد: ${doc.id}, sourceId: ${storedSourceId} (type: ${typeof data.sourceId}), reference: ${data.reference}`);
                               });
                           }
                       }
                   } catch (diagError) {
                       Logger.warn('⚠️ خطأ في التشخيص الإضافي:', diagError);
                   }
                   
                   return 0;
               }
           } catch (error) {
               console.error('❌ خطأ في حذف القيد المحاسبي:', error);
               console.error('تفاصيل الخطأ الكاملة:', error.message, error.stack);
               throw error; // Re-throw to allow caller to handle
           }
       },

       /**
        * View general entry for a purchase
        */
       async viewPurchaseGeneralEntry(purchaseId) {
           try {
               showLoading();

               // Find general entry by sourceId
               const snapshot = await db.collection('generalEntries')
                   .where('sourceId', '==', purchaseId)
                   .where('type', '==', 'purchase')
                   .limit(1)
                   .get();

               if (snapshot.empty) {
                   hideLoading();
                   if (typeof Swal !== 'undefined') {
                       Swal.fire({
                           title: 'لا يوجد قيد عام',
                           text: 'لم يتم العثور على قيد عام لهذه الفاتورة',
                           icon: 'info',
                           confirmButtonText: 'حسناً'
                       });
                   } else {
                       alert('لم يتم العثور على قيد عام لهذه الفاتورة');
                   }
                   return;
               }

               const generalEntryDoc = snapshot.docs[0];
               const generalEntryData = generalEntryDoc.data();
               
               // Clean up FieldValue.serverTimestamp() from createdAt and all nested objects
               const cleanFieldValue = (value) => {
                   if (value === null || value === undefined) {
                       return value;
                   }
                   
                   // Check if it's a Firestore Timestamp
                   if (value && typeof value === 'object' && value.toDate && typeof value.toDate === 'function') {
                       try {
                           return value.toDate();
                       } catch (e) {
                           return new Date();
                       }
                   }
                   
                   // Check if it's a FieldValue (serverTimestamp, etc.)
                   if (value && typeof value === 'object' && (
                       value._method === 'serverTimestamp' || 
                       value._delegate || 
                       (value.constructor && value.constructor.name === 'FieldValue') ||
                       (value.toString && value.toString().includes('FieldValue'))
                   )) {
                       return new Date();
                   }
                   
                   // If it's an array, clean each element
                   if (Array.isArray(value)) {
                       return value.map(item => cleanFieldValue(item));
                   }
                   
                   // If it's an object, clean all properties recursively
                   if (typeof value === 'object' && !(value instanceof Date)) {
                       const cleaned = {};
                       for (const key in value) {
                           if (value.hasOwnProperty(key)) {
                               cleaned[key] = cleanFieldValue(value[key]);
                           }
                       }
                       return cleaned;
                   }
                   
                   return value;
               };
               
               const cleanedData = cleanFieldValue(generalEntryData);
               
               // Ensure createdAt and updatedAt are proper Date objects
               if (cleanedData.createdAt && !(cleanedData.createdAt instanceof Date)) {
                   if (cleanedData.createdAt && typeof cleanedData.createdAt === 'object') {
                       cleanedData.createdAt = new Date();
                   } else if (cleanedData.createdAt && typeof cleanedData.createdAt.toDate === 'function') {
                       cleanedData.createdAt = cleanedData.createdAt.toDate();
                   }
               }
               
               if (cleanedData.updatedAt && !(cleanedData.updatedAt instanceof Date)) {
                   if (cleanedData.updatedAt && typeof cleanedData.updatedAt === 'object') {
                       cleanedData.updatedAt = new Date();
                   } else if (cleanedData.updatedAt && typeof cleanedData.updatedAt.toDate === 'function') {
                       cleanedData.updatedAt = cleanedData.updatedAt.toDate();
                   }
               }
               
               const generalEntry = {
                   id: generalEntryDoc.id,
                   ...cleanedData
               };
               
               // Final safety check: remove any FieldValue objects
               if (generalEntry.createdAt && typeof generalEntry.createdAt === 'object' && !(generalEntry.createdAt instanceof Date)) {
                   if (generalEntry.createdAt._method === 'serverTimestamp' || 
                       generalEntry.createdAt._delegate ||
                       (generalEntry.createdAt.toString && generalEntry.createdAt.toString().includes('FieldValue'))) {
                       generalEntry.createdAt = new Date();
                   }
               }
               
               if (generalEntry.updatedAt && typeof generalEntry.updatedAt === 'object' && !(generalEntry.updatedAt instanceof Date)) {
                   if (generalEntry.updatedAt._method === 'serverTimestamp' || 
                       generalEntry.updatedAt._delegate ||
                       (generalEntry.updatedAt.toString && generalEntry.updatedAt.toString().includes('FieldValue'))) {
                       generalEntry.updatedAt = new Date();
                   }
               }

               hideLoading();

               // Use VouchersModule to display the general entry
               if (typeof VouchersModule !== 'undefined' && VouchersModule.displayGeneralEntry) {
                   await VouchersModule.displayGeneralEntry(generalEntry);
               } else {
                   // Fallback: show basic info
                   if (typeof Swal !== 'undefined') {
                       Swal.fire({
                           title: 'قيد عام',
                           html: `
                               <p><strong>رقم الفاتورة:</strong> ${generalEntry.reference || 'N/A'}</p>
                               <p><strong>التاريخ:</strong> ${formatDate(generalEntry.date)}</p>
                               <p><strong>عدد القيود:</strong> ${generalEntry.entries?.length || 0}</p>
                           `,
                           icon: 'info',
                           confirmButtonText: 'حسناً'
                       });
                   }
               }

           } catch (error) {
               hideLoading();
               console.error('❌ Error viewing purchase general entry:', error);
               if (typeof showError === 'function') {
                   showError('خطأ في عرض القيد العام: ' + error.message);
               } else {
                   alert('خطأ في عرض القيد العام: ' + error.message);
               }
           }
       },

    /**
     * Get purchase account (debit account)
     * Priority: 1. From purchaseData (if provided), 2. From settings, 3. Auto-detect
     */
    async getPurchaseAccount(purchaseData = null) {
        try {
            // Priority 1: From purchaseData (if provided)
            if (purchaseData && purchaseData.purchaseCounterAccount) {
                const account = this.accounts.find(a => a.id === purchaseData.purchaseCounterAccount);
                if (account) return account;
            }

            // Priority 2: From settings
            const settings = await this.getSettings();
            if (settings.defaultCounterAccountId) {
                const account = this.accounts.find(a => a.id === settings.defaultCounterAccountId);
                if (account) return account;
            }

            // Priority 3: Auto-detect
            const account = this.accounts.find(a => 
                a.type === 'expense' && 
                (a.name.includes('مشتريات') || a.name.includes('المشتريات') || a.name.toLowerCase().includes('purchases'))
            );
            if (account) return account;

            return null;
        } catch (error) {
            console.error('Error getting purchase account:', error);
            return null;
        }
    },

    /**
     * Get tax account
     */
    async getTaxAccount() {
        try {
            const snapshot = await db.collection('chartOfAccounts')
                .where('type', '==', 'liability')
                .where('name', 'in', ['الضرائب المستحقة', 'ضرائب مستحقة', 'Tax Payable'])
                .limit(1)
                .get();
            
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting tax account:', error);
            return null;
        }
    },

    /**
     * Get discount account
     */
    async getDiscountAccount() {
        try {
            const snapshot = await db.collection('chartOfAccounts')
                .where('type', '==', 'expense')
                .where('name', 'in', ['الخصومات', 'خصومات', 'Discounts'])
                .limit(1)
                .get();
            
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting discount account:', error);
            return null;
        }
    },

    /**
     * Update payment fields based on payment method
     */
    updatePaymentFields() {
        const paymentMethod = document.getElementById('purchasePaymentMethod')?.value;
        const paidAmountInput = document.getElementById('purchasePaidAmount');
        const paidAmountLabel = document.querySelector('label[for="purchasePaidAmount"]');
        const paidAmountContainer = paidAmountInput?.closest('.form-group') || paidAmountInput?.parentElement;
        const dueDateInput = document.getElementById('purchaseDueDate');

        if (!paymentMethod || !paidAmountInput) return;

        if (paymentMethod === 'cash') {
            // في الدفع النقدي: تعطيل حقل الدفعة (لا نحتاج إلى إدخال دفعة)
            paidAmountInput.disabled = true;
            // عند التعديل: نحافظ على القيمة الأصلية من قاعدة البيانات
            // عند الإضافة: نترك الحقل فارغاً (سيتم تعيينه في calculateRemainingAmount)
            if (!this.isPopulatingForm) {
                paidAmountInput.value = '';
            }
            paidAmountInput.style.backgroundColor = '#f8f9fa';
            paidAmountInput.style.cursor = 'not-allowed';
            if (paidAmountLabel) {
                paidAmountLabel.style.opacity = '0.6';
            }
            if (paidAmountContainer) {
                paidAmountContainer.style.opacity = '0.6';
            }
            dueDateInput.value = '';
            dueDateInput.disabled = true;
        } else if (paymentMethod === 'credit') {
            // في الدفع الآجل: تفعيل حقل الدفعة
            paidAmountInput.disabled = false;
            // عند التعديل: نحافظ على القيمة الأصلية من قاعدة البيانات
            // عند الإضافة: نعين القيمة إلى 0 إذا كانت فارغة
            if (this.isPopulatingForm) {
                // عند التعديل: لا نغير القيمة حتى لو كانت 0 أو فارغة
                // القيمة تم تعيينها بالفعل في populatePurchaseForm()
            } else {
                // عند الإضافة: نعين القيمة إلى 0 إذا كانت فارغة
                if (!paidAmountInput.value || paidAmountInput.value === '') {
                    paidAmountInput.value = 0;
                }
            }
            paidAmountInput.style.backgroundColor = '';
            paidAmountInput.style.cursor = '';
            if (paidAmountLabel) {
                paidAmountLabel.style.opacity = '1';
            }
            if (paidAmountContainer) {
                paidAmountContainer.style.opacity = '1';
            }
            dueDateInput.disabled = false;
            // Set due date to 30 days from now only if not already set
            // عند التعديل: نحافظ على التاريخ المحفوظ
            if (!this.isPopulatingForm && !dueDateInput.value) {
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + 30);
                dueDateInput.value = dueDate.toISOString().split('T')[0];
            }
            
            // تحديث الحد الأقصى للدفعة بناءً على القيمة القابلة للدفع
            // عند التعديل: نحدّث الحد الأقصى فقط دون تغيير القيمة
            if (this.isPopulatingForm) {
                // عند التعديل: تحديث الحد الأقصى فقط دون تغيير القيمة
                this.updatePaidAmountMax(true); // Pass flag to preserve value
            } else {
                // عند الإضافة: تحديث الحد الأقصى وتصحيح القيمة إذا لزم الأمر
                this.updatePaidAmountMax(false);
            }
        } else {
            // For other methods, enable both fields
            paidAmountInput.disabled = false;
            // عند التعديل: نحافظ على القيمة الأصلية من قاعدة البيانات
            // عند الإضافة: نعين القيمة إلى 0 إذا كانت فارغة
            if (this.isPopulatingForm) {
                // عند التعديل: لا نغير القيمة حتى لو كانت 0 أو فارغة
                // القيمة تم تعيينها بالفعل في populatePurchaseForm()
            } else {
                // عند الإضافة: نعين القيمة إلى 0 إذا كانت فارغة
                if (!paidAmountInput.value || paidAmountInput.value === '') {
                    paidAmountInput.value = 0;
                }
            }
            paidAmountInput.style.backgroundColor = '';
            paidAmountInput.style.cursor = '';
            if (paidAmountLabel) {
                paidAmountLabel.style.opacity = '1';
            }
            if (paidAmountContainer) {
                paidAmountContainer.style.opacity = '1';
            }
            dueDateInput.disabled = false;
        }

        // ✅ التحكم في الحساب المقابل في صفوف الخصومات والإضافات بناءً على طريقة الدفع
        // في حالة الدفع النقدي: لا يُسمح باختيار حساب مقابل في صفوف الخصومات والإضافات
        // في حالة الدفع الآجل (أو غيره): يُسمح باختيار الحساب المقابل
        const discountsAdditionsRows = document.querySelectorAll('#discountsAdditionsBody tr');
        discountsAdditionsRows.forEach(row => {
            const counterAccountPickerBtn = row.querySelector('.open-counter-account-picker-btn');
            const counterAccountSelect = row.querySelector('.counter-account-select');
            const counterAccountNameDisplay = row.querySelector('.counter-account-name-display');

            if (!counterAccountPickerBtn || !counterAccountSelect || !counterAccountNameDisplay) {
                return;
            }

            if (paymentMethod === 'cash') {
                // مسح أي حساب مقابل مُسجّل سابقاً
                counterAccountSelect.value = '';
                counterAccountNameDisplay.value = '';

                // تعطيل زر اختيار الحساب المقابل ومنع النقر
                counterAccountPickerBtn.disabled = true;
                counterAccountPickerBtn.classList.add('disabled');
                counterAccountPickerBtn.style.cursor = 'not-allowed';
                counterAccountPickerBtn.title = 'لا يمكن اختيار حساب مقابل في حالة الدفع النقدي';
            } else {
                // تمكين زر الحساب المقابل في الحالات غير النقدية (مثل الآجل)
                counterAccountPickerBtn.disabled = false;
                counterAccountPickerBtn.classList.remove('disabled');
                counterAccountPickerBtn.style.cursor = '';
                counterAccountPickerBtn.title = 'اختر الحساب المقابل';
            }
        });

        // ملاحظة: يجب استخدام await لأن الدالة async
        // عند التعديل: ننتظر قليلاً قبل حساب المبلغ المتبقي لضمان أن جميع القيم تم تعيينها
        if (this.isPopulatingForm) {
            // عند التعديل: نؤجل حساب المبلغ المتبقي حتى يتم تعيين جميع القيم
            setTimeout(async () => {
                await this.calculateRemainingAmount();
            }, 100);
        } else {
            // عند الإضافة: حساب مباشر
            (async () => {
                await this.calculateRemainingAmount();
            })();
        }
    },
    
    /**
     * Calculate payable amount
     * القيمة القابلة للدفع = subtotal - الخصومات بدون حساب مقابل + الإضافات بدون حساب مقابل
     * 
     * المنطق:
     * - الخصومات/الإضافات التي لها حساب مقابل: لا تحسب ضمن القيمة القابلة للدفع (لأنها لا تؤثر على حساب المورد)
     * - الخصم بدون حساب مقابل: يقلل القيمة القابلة للدفع (لأنه يقلل من حساب المورد)
     * - الإضافة بدون حساب مقابل: تزيد القيمة القابلة للدفع (لأنها تزيد من حساب المورد)
     */
    async calculatePayableAmount() {
        try {
            const paymentMethod = document.getElementById('purchasePaymentMethod')?.value;
            const isPopulating = this.isPopulatingForm;
            
            // في الدفع النقدي، القيمة القابلة للدفع = الإجمالي
            if (paymentMethod === 'cash') {
                const totalEl = document.getElementById('purchaseTotal');
                let total = totalEl ? parseFloat(totalEl.textContent) || 0 : 0;
                
                // ✅ أثناء التحميل: الانتظار حتى تكون البيانات جاهزة
                if (total === 0 && isPopulating && this.editingPurchase) {
                    // ننتظر حتى يكون total محسوباً (حتى 5 محاولات = 500ms)
                    for (let i = 0; i < 5 && total === 0; i++) {
                        this.calculatePurchaseTotals();
                        await new Promise(resolve => setTimeout(resolve, 100));
                        total = totalEl ? parseFloat(totalEl.textContent) || 0 : 0;
                    }
                }
                
                return total;
            }
            
            // في الدفع الآجل: القيمة القابلة للدفع = subtotal - الخصومات بدون حساب مقابل + الإضافات بدون حساب مقابل
            const subtotalEl = document.getElementById('purchaseSubtotal');
            let subtotal = subtotalEl ? parseFloat(subtotalEl.textContent) || 0 : 0;
            
            // ✅ أثناء التحميل: الانتظار حتى تكون البيانات جاهزة
            if (subtotal === 0 && isPopulating && this.editingPurchase) {
                // ننتظر حتى يكون subtotal محسوباً (حتى 5 محاولات = 500ms)
                for (let i = 0; i < 5 && subtotal === 0; i++) {
                    this.calculatePurchaseTotals();
                    await new Promise(resolve => setTimeout(resolve, 100));
                    subtotal = subtotalEl ? parseFloat(subtotalEl.textContent) || 0 : 0;
                }
            }
            
            const settings = await this.getSettings();
            // ملاحظة: هذا الكود يطبق فقط على قسم الخصومات والإضافات (#discountsAdditionsBody)
            // ولا يؤثر على صفوف المنتجات (#purchaseItemsBody)
            const discountRows = document.querySelectorAll('#discountsAdditionsBody tr');
            const invoiceCurrency = document.getElementById('purchaseCurrency')?.value || 'IQD';
            const invoiceExchangeRate = parseFloat(document.getElementById('purchaseExchangeRate')?.value) || 1;
            const baseCurrency = this.currencies.find(c => c.isBaseCurrency)?.code || 'IQD';
            
            let discountsWithoutCounter = 0; // الخصومات التي بدون حساب مقابل (من قسم الخصومات والإضافات فقط)
            let additionsWithoutCounter = 0; // الإضافات التي بدون حساب مقابل (من قسم الخصومات والإضافات فقط)
            
            // معالجة صفوف الخصومات والإضافات فقط (ليس صفوف المنتجات)
            discountRows.forEach((row, index) => {
                const type = row.querySelector('.type-select')?.value;
                const amount = parseFloat(row.querySelector('.amount-input')?.value) || 0;
                const currency = row.querySelector('.currency-select')?.value || invoiceCurrency;
                // البحث عن الحساب المقابل - استخدم .counter-account-select (الـ class الأساسي)
                const counterAccountSelect = row.querySelector('.counter-account-select');
                const counterAccountId = counterAccountSelect?.value || null;
                
                // تسجيل تشخيصي مفصل لكل صف
                Logger.log(`📋 صف ${index + 1} (${type}):`, {
                    amount,
                    currency,
                    counterAccountId: counterAccountId,
                    counterAccountIdType: typeof counterAccountId,
                    counterAccountIdLength: counterAccountId ? String(counterAccountId).length : 0,
                    counterAccountIdTrimmed: counterAccountId ? String(counterAccountId).trim() : '',
                    counterAccountSelect: counterAccountSelect ? 'موجود' : 'غير موجود',
                    counterAccountSelectValue: counterAccountSelect?.value,
                    counterAccountSelectValueType: typeof counterAccountSelect?.value,
                    rowHTML: row.innerHTML.substring(0, 200) // أول 200 حرف من HTML للتحقق
                });
                
                if (amount <= 0) return;
                
                // Convert amount to invoice currency if needed
                let convertedAmount = amount;
                if (currency !== invoiceCurrency) {
                    const discountCurrency = this.currencies.find(c => c.code === currency);
                    const discountExchangeRate = discountCurrency?.exchangeRate || 1;
                    
                    if (currency !== baseCurrency) {
                        convertedAmount = amount / discountExchangeRate;
                    }
                    if (invoiceCurrency !== baseCurrency) {
                        convertedAmount = convertedAmount * invoiceExchangeRate;
                    }
                }
                
                // تحديد ما إذا كان هناك حساب مقابل
                // في حال وجود حساب مقابل في الخصومات أو الإضافات: لا تحسب ضمن القيمة القابلة للدفع
                // تحقق من أن counterAccountId ليس فارغاً أو null أو undefined
                const hasCounterAccountInRow = counterAccountId && String(counterAccountId).trim() !== '';
                
                // الحصول على الإعدادات الافتراضية
                // ملاحظة: الإعدادات الافتراضية لا تُطبق تلقائياً - فقط إذا كان الحقل في الصف فارغاً
                // لكن المستخدم قال أن الحساب المقابل يجب أن يكون محدداً في الصف نفسه
                const defaultDiscountCounter = settings.defaultDiscountCounterAccountId && String(settings.defaultDiscountCounterAccountId).trim() !== '';
                const defaultAdditionCounter = settings.defaultAdditionCounterAccountId && String(settings.defaultAdditionCounterAccountId).trim() !== '';
                
                // المنطق: الحساب المقابل موجود فقط إذا كان محدداً في الصف نفسه
                // الإعدادات الافتراضية لا تُطبق تلقائياً - المستخدم يجب أن يحدد الحساب المقابل في الصف
                let hasCounterAccount = hasCounterAccountInRow;
                
                if (type === 'discount') {
                    Logger.log(`  🔍 خصم - حساب مقابل في الصف: ${hasCounterAccountInRow} (${counterAccountId}), افتراضي: ${defaultDiscountCounter}, النتيجة النهائية: ${hasCounterAccount}`);
                } else if (type === 'addition') {
                    Logger.log(`  🔍 إضافة - حساب مقابل في الصف: ${hasCounterAccountInRow} (${counterAccountId}), افتراضي: ${defaultAdditionCounter}, النتيجة النهائية: ${hasCounterAccount}`);
                }
                
                // جمع الخصومات والإضافات التي بدون حساب مقابل فقط
                // (التي لها حساب مقابل لا تحسب لأنها لا تؤثر على حساب المورد)
                if (type === 'discount' && !hasCounterAccount) {
                    discountsWithoutCounter += convertedAmount;
                    Logger.log(`  ✅ خصم بدون حساب مقابل: ${convertedAmount} (إجمالي حتى الآن: ${discountsWithoutCounter})`);
                } else if (type === 'addition' && !hasCounterAccount) {
                    additionsWithoutCounter += convertedAmount;
                    Logger.log(`  ✅ إضافة بدون حساب مقابل: ${convertedAmount} (إجمالي حتى الآن: ${additionsWithoutCounter})`);
                } else {
                    Logger.log(`  ⏭️ ${type} مع حساب مقابل: ${convertedAmount} (لا يحسب في القيمة القابلة للدفع)`);
                }
            });
            
            // القيمة القابلة للدفع = subtotal - الخصومات بدون حساب مقابل + الإضافات بدون حساب مقابل
            // الخصم بدون حساب مقابل: يقلل القيمة القابلة للدفع (لأنه يقلل من حساب المورد)
            // الإضافة بدون حساب مقابل: تزيد القيمة القابلة للدفع (لأنها تزيد من حساب المورد)
            const payableAmount = subtotal - discountsWithoutCounter + additionsWithoutCounter;
            
            Logger.log(`💰 حساب القيمة القابلة للدفع (calculatePayableAmount):`, {
                subtotal,
                discountsWithoutCounter,
                additionsWithoutCounter,
                payableAmount,
                paymentMethod,
                formula: `payableAmount = ${subtotal} - ${discountsWithoutCounter} + ${additionsWithoutCounter} = ${payableAmount}`,
                note: 'الخصم بدون حساب مقابل يقلل والإضافة بدون حساب مقابل تزيد من القيمة القابلة للدفع',
                settings: {
                    defaultDiscountCounterAccountId: settings.defaultDiscountCounterAccountId,
                    defaultAdditionCounterAccountId: settings.defaultAdditionCounterAccountId
                },
                discountRowsCount: discountRows.length
            });
            
            return Math.max(0, payableAmount); // التأكد من أن القيمة غير سالبة
        } catch (error) {
            console.error('Error calculating payable amount:', error);
            const total = parseFloat(document.getElementById('purchaseTotal')?.textContent) || 0;
            return total; // Fallback to total if error
        }
    },
    
    /**
     * Update maximum value for paid amount input based on payable amount
     * @param {boolean} preserveValue - If true, preserve current value even if it exceeds max (for editing)
     */
    async updatePaidAmountMax(preserveValue = false) {
        const paidAmountInput = document.getElementById('purchasePaidAmount');
        if (!paidAmountInput) return;
        
        const payableAmount = await this.calculatePayableAmount();
        paidAmountInput.max = payableAmount;
        paidAmountInput.setAttribute('data-max-payable', payableAmount);
        
        // عند التعديل (preserveValue = true): نحافظ على القيمة حتى لو تجاوزت الحد الأقصى
        // عند الإضافة (preserveValue = false): نصحح القيمة إذا تجاوزت الحد الأقصى
        if (!preserveValue) {
            const currentPaid = parseFloat(paidAmountInput.value) || 0;
            if (currentPaid > payableAmount && payableAmount > 0) {
                // ✅ فقط إذا كانت payableAmount > 0 (أي البيانات جاهزة)
                paidAmountInput.value = payableAmount;
                this.calculateRemainingAmount();
            }
        } else {
            // ✅ عند التعديل: فقط تحديث الحد الأقصى دون تغيير القيمة أو عرض تحذير
            // لا نعرض أي تحذير أثناء التحميل
            if (!this.isPopulatingForm) {
                Logger.log(`📊 Updated max payable to ${payableAmount} (preserving current value: ${paidAmountInput.value})`);
            }
        }
    },

    /**
     * Open account picker modal (uses accounts loaded from Chart of Accounts)
     * @param {string} targetSelectId - ID of the hidden input to store account ID
     * @param {string} displayFieldId - Optional ID of the display field to show account name
     */
    openAccountPicker(targetSelectId, displayFieldId = null) {
        const target = document.getElementById(targetSelectId);
        if (!target) return;
        const displayField = displayFieldId ? document.getElementById(displayFieldId) : null;
        const allAccounts = this.accounts || [];
        
        // Filter to get only leaf accounts (accounts that don't have children)
        // A leaf account is one that is not a parent of any other account
        const leafAccounts = allAccounts.filter(account => {
            // Check if this account is a parent of any other account
            const hasChildren = allAccounts.some(otherAccount => {
                // Check if otherAccount has parentId pointing to this account
                return (otherAccount.parentId === account.id) || 
                       (otherAccount.parent === account.id) ||
                       (otherAccount.parentAccountId === account.id);
            });
            // Return only accounts that don't have children (leaf accounts)
            return !hasChildren;
        });
        
        // If a current account is selected and it's not a leaf account, 
        // find it and add it to the list (for display purposes only)
        let currentAccount = null;
        if (target.value) {
            currentAccount = allAccounts.find(a => a.id === target.value);
            if (currentAccount && !leafAccounts.find(a => a.id === currentAccount.id)) {
                // Current account is not a leaf, but we'll still show it in the list
                // with a warning that it's not recommended
                leafAccounts.push(currentAccount);
            }
        }
        
        const content = `
            <div style="text-align: start;">
                <div class="mb-2">
                    <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                        <input type="text" id="accountPickerSearch" class="form-control" placeholder="ابحث في الحسابات النهائية...">
                    </div>
                    <small class="text-muted d-block mt-1">
                        <i class="fas fa-info-circle"></i> يتم عرض الحسابات النهائية فقط (التي لا تحتوي على حسابات فرعية)
                    </small>
                </div>
                <div class="list-group" id="accountPickerList" style="max-height: 360px; overflow:auto;">
                    ${leafAccounts.length > 0 ? leafAccounts.map(acc => `
                        <button type="button" class="list-group-item list-group-item-action account-pick-item" data-id="${acc.id}" data-name="${acc.name}">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <div><strong>${acc.name}</strong></div>
                                    <small class="text-muted">${acc.code || ''} • ${acc.type || ''}</small>
                                </div>
                                <i class="fas fa-check text-success" style="display:none;"></i>
                            </div>
                        </button>
                    `).join('') : '<div class="list-group-item text-center text-muted">لا توجد حسابات نهائية</div>'}
                </div>
            </div>
        `;
        
        Swal.fire({
            title: 'اختيار حساب من شجرة الحسابات',
            html: content,
            width: 700,
            showCancelButton: true,
            confirmButtonText: 'اختيار',
            cancelButtonText: 'إلغاء',
            focusConfirm: false,
            didOpen: () => {
                const searchInput = document.getElementById('accountPickerSearch');
                const items = Array.from(document.querySelectorAll('.account-pick-item'));
                let selectedId = null;
                let selectedName = null;
                
                const filter = () => {
                    const q = (searchInput.value || '').toLowerCase();
                    items.forEach(el => {
                        const acc = leafAccounts.find(a => a.id === el.dataset.id);
                        const text = `${acc?.name || ''} ${acc?.code || ''} ${acc?.type || ''}`.toLowerCase();
                        el.style.display = text.includes(q) ? '' : 'none';
                    });
                };
                searchInput.addEventListener('input', filter);
                
                items.forEach(el => {
                    el.addEventListener('click', () => {
                        items.forEach(x => x.querySelector('i.fas.fa-check')?.style && (x.querySelector('i.fas.fa-check').style.display = 'none'));
                        el.querySelector('i.fas.fa-check').style.display = '';
                        selectedId = el.dataset.id;
                        selectedName = el.dataset.name;
                    });
                });
                
                // Preselect current
                if (target.value) {
                    const current = items.find(x => x.dataset.id === target.value);
                    if (current) {
                        current.click();
                        current.scrollIntoView({ block: 'nearest' });
                    }
                }
                
                // Attach confirm handler
                const confirmBtn = Swal.getConfirmButton();
                confirmBtn.addEventListener('click', () => {
                    if (selectedId) {
                        target.value = selectedId;
                        if (displayField && selectedName) {
                            displayField.value = selectedName;
                        }
                    }
                }, { once: true });
            }
        });
    },

    /**
     * Open account picker for discount/addition row
     * @param {HTMLElement} row - The table row element
     * @param {HTMLElement} accountSelect - The hidden input to store account ID
     * @param {HTMLElement} accountNameDisplay - The display input to show account name
     */
    openAccountPickerForRow(row, accountSelect, accountNameDisplay) {
        const allAccounts = this.accounts || [];
        
        // Filter to get only leaf accounts (accounts that don't have children)
        const leafAccounts = allAccounts.filter(account => {
            const hasChildren = allAccounts.some(otherAccount => {
                return (otherAccount.parentId === account.id) || 
                       (otherAccount.parent === account.id) ||
                       (otherAccount.parentAccountId === account.id);
            });
            return !hasChildren;
        });
        
        // If a current account is selected and it's not a leaf account, add it to the list
        if (accountSelect.value) {
            const currentAccount = allAccounts.find(a => a.id === accountSelect.value);
            if (currentAccount && !leafAccounts.find(a => a.id === currentAccount.id)) {
                leafAccounts.push(currentAccount);
            }
        }
        
        const content = `
            <div style="text-align: start;">
                <div class="mb-2">
                    <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                        <input type="text" id="accountPickerSearch" class="form-control" placeholder="ابحث في الحسابات النهائية...">
                    </div>
                    <small class="text-muted d-block mt-1">
                        <i class="fas fa-info-circle"></i> يتم عرض الحسابات النهائية فقط (التي لا تحتوي على حسابات فرعية)
                    </small>
                </div>
                <div class="list-group" id="accountPickerList" style="max-height: 360px; overflow:auto;">
                    ${leafAccounts.length > 0 ? leafAccounts.map(acc => `
                        <button type="button" class="list-group-item list-group-item-action account-pick-item" data-id="${acc.id}" data-name="${acc.name}">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <div><strong>${acc.name}</strong></div>
                                    <small class="text-muted">${acc.code || ''} • ${acc.type || ''}</small>
                                </div>
                                <i class="fas fa-check text-success" style="display:none;"></i>
                            </div>
                        </button>
                    `).join('') : '<div class="list-group-item text-center text-muted">لا توجد حسابات نهائية</div>'}
                </div>
            </div>
        `;
        
        Swal.fire({
            title: 'اختيار حساب من شجرة الحسابات',
            html: content,
            width: 700,
            showCancelButton: true,
            confirmButtonText: 'اختيار',
            cancelButtonText: 'إلغاء',
            focusConfirm: false,
            didOpen: () => {
                const searchInput = document.getElementById('accountPickerSearch');
                const items = Array.from(document.querySelectorAll('.account-pick-item'));
                let selectedId = null;
                let selectedName = null;
                
                const filter = () => {
                    const q = (searchInput.value || '').toLowerCase();
                    items.forEach(el => {
                        const acc = leafAccounts.find(a => a.id === el.dataset.id);
                        const text = `${acc?.name || ''} ${acc?.code || ''} ${acc?.type || ''}`.toLowerCase();
                        el.style.display = text.includes(q) ? '' : 'none';
                    });
                };
                searchInput.addEventListener('input', filter);
                
                items.forEach(el => {
                    el.addEventListener('click', () => {
                        items.forEach(x => x.querySelector('i.fas.fa-check')?.style && (x.querySelector('i.fas.fa-check').style.display = 'none'));
                        el.querySelector('i.fas.fa-check').style.display = '';
                        selectedId = el.dataset.id;
                        selectedName = el.dataset.name;
                    });
                });
                
                // Preselect current
                if (accountSelect.value) {
                    const current = items.find(x => x.dataset.id === accountSelect.value);
                    if (current) {
                        current.click();
                        current.scrollIntoView({ block: 'nearest' });
                    }
                }
                
                // Attach confirm handler
                const confirmBtn = Swal.getConfirmButton();
                confirmBtn.addEventListener('click', () => {
                    if (selectedId) {
                        accountSelect.value = selectedId;
                        if (accountNameDisplay && selectedName) {
                            accountNameDisplay.value = selectedName;
                        }
                    }
                }, { once: true });
            }
        });
    },

    /**
     * Calculate remaining amount
     */
    async calculateRemainingAmount() {
        const totalElement = document.getElementById('purchaseTotal');
        const paidAmountElement = document.getElementById('purchasePaidAmount');
        const remainingAmountElement = document.getElementById('purchaseRemainingAmount');
        const paymentStatusSelect = document.getElementById('purchasePaymentStatus');
        const paymentMethod = document.getElementById('purchasePaymentMethod')?.value;
        
        // Check if elements exist - silently return if modal is not ready
        if (!totalElement || !paidAmountElement || !remainingAmountElement || !paymentStatusSelect) {
            // Don't log warning if modal is not shown yet
            const modal = document.getElementById('purchaseModal');
            if (!modal || !modal.classList.contains('show')) {
                return;
            }
            // Only log if modal is shown but elements are missing
            console.warn('⚠️ Payment elements not found, skipping calculation');
            return;
        }
        
        const total = parseFloat(totalElement.textContent) || 0;
        const subtotal = parseFloat(document.getElementById('purchaseSubtotal')?.textContent) || 0;
        let paidAmount = parseFloat(paidAmountElement.value) || 0;
        
        // التحقق من أننا لسنا في وضع تعبئة النموذج (تعديل فاتورة موجودة)
        // في هذه الحالة، نحافظ على القيمة الأصلية من قاعدة البيانات
        const isPopulating = this.isPopulatingForm;
        
        // في الدفع النقدي: المبلغ المدفوع = الإجمالي دائماً
        // لكن فقط إذا لم نكن في وضع التعديل (لأن القيمة المحفوظة قد تكون مختلفة)
        // عند التعديل: نحافظ على القيمة الأصلية من قاعدة البيانات حتى في حالة الدفع النقدي
        if (paymentMethod === 'cash' && !isPopulating) {
            paidAmount = total;
            paidAmountElement.value = total.toFixed(2);
        } else if (paymentMethod === 'cash' && isPopulating) {
            // عند التعديل في حالة الدفع النقدي: نحافظ على القيمة الأصلية
            // لا نغيرها حتى لو كانت مختلفة عن total
            paidAmount = parseFloat(paidAmountElement.value) || 0;
            Logger.log(`💰 الدفع النقدي عند التعديل: نحافظ على القيمة الأصلية ${paidAmount} (total: ${total})`);
        }
        
        // في الدفع الآجل: استخدام القيمة القابلة للدفع بدلاً من الإجمالي
        let payableAmount = total;
        if (paymentMethod === 'credit') {
            payableAmount = await this.calculatePayableAmount();
            
            Logger.log(`🔍 calculateRemainingAmount - في الدفع الآجل:`, {
                subtotal,
                total,
                calculatedPayableAmount: payableAmount,
                paidAmount,
                isPopulating,
                note: 'يجب أن تكون payableAmount = subtotal - الخصومات بدون حساب مقابل + الإضافات بدون حساب مقابل'
            });
            
            // ✅ عند التعديل: إذا كان المبلغ المدفوع أكبر من القيمة القابلة للدفع، 
            // فهذا يعني أن البيانات لم تكتمل بعد - نعيد الحساب أو ننتظر
            if (paidAmount > payableAmount && isPopulating && this.editingPurchase) {
                // البيانات لم تكتمل بعد - نعيد الحساب بعد الانتظار
                Logger.log(`🔄 أثناء التحميل: المبلغ المدفوع (${paidAmount}) أعلى من القيمة القابلة للدفع المحسوبة (${payableAmount}) - إعادة الحساب...`);
                
                // إعادة حساب الإجماليات
                this.calculatePurchaseTotals();
                await new Promise(resolve => setTimeout(resolve, 150));
                
                // إعادة حساب القيمة القابلة للدفع
                payableAmount = await this.calculatePayableAmount();
                
                // إذا كانت القيمة لا تزال غير صحيحة، ننتظر مرة أخرى
                if (paidAmount > payableAmount && payableAmount > 0) {
                    Logger.log(`🔄 إعادة الحساب مرة أخرى...`);
                    this.calculatePurchaseTotals();
                    await new Promise(resolve => setTimeout(resolve, 150));
                    payableAmount = await this.calculatePayableAmount();
                }
                
                Logger.log(`✅ بعد إعادة الحساب: المبلغ المدفوع (${paidAmount})، القيمة القابلة للدفع (${payableAmount})`);
            } else if (paidAmount > payableAmount && !isPopulating) {
                // عند الإضافة: لا يمكن أن يكون المبلغ المدفوع أكبر من القيمة القابلة للدفع
                paidAmount = payableAmount;
                paidAmountElement.value = payableAmount.toFixed(2);
                if (typeof showWarning === 'function') {
                    showWarning(`لا يمكن الدفع أكثر من ${payableAmount.toFixed(2)} (القيمة القابلة للدفع بعد استبعاد الخصومات والإضافات التي لها حساب مقابل)`);
                }
            }
        } else {
            Logger.log(`🔍 calculateRemainingAmount - في الدفع النقدي:`, {
                total,
                paidAmount,
                isPopulating,
                note: 'في الدفع النقدي، payableAmount = total'
            });
        }
        
        const remainingAmount = payableAmount - paidAmount;
        remainingAmountElement.value = remainingAmount.toFixed(2);

        // Update payment status based on paid amount
        // الحالة تعتمد على المبلغ المدفوع
        if (paidAmount <= 0) {
            // لا يوجد مبلغ مدفوع = غير مدفوع
            paymentStatusSelect.value = 'unpaid';
        } else if (paidAmount >= payableAmount) {
            // المبلغ المدفوع >= القيمة القابلة للدفع = مدفوع بالكامل
            paymentStatusSelect.value = 'paid';
        } else {
            // المبلغ المدفوع > 0 و < القيمة القابلة للدفع = مدفوع جزئياً
            paymentStatusSelect.value = 'partial';
        }
        
        Logger.log(`💰 حساب المبلغ المتبقي (calculateRemainingAmount):`, {
            total,
            payableAmount,
            paidAmount,
            remainingAmount,
            paymentMethod,
            formula: `remainingAmount = ${payableAmount} - ${paidAmount} = ${remainingAmount}`,
            status: paymentStatusSelect.value,
            note: paymentMethod === 'credit' ? 'في الدفع الآجل، يتم استخدام القيمة القابلة للدفع (بعد استبعاد الخصومات والإضافات التي لها حساب مقابل)' : 'في الدفع النقدي، يتم استخدام الإجمالي'
        });
    },

    /**
     * Save purchase
     * ✅ Improved with rollback mechanism and better error handling
     * ✅ Enhanced with performance monitoring and accuracy validation
     */
    async savePurchase() {
        // Start performance monitoring
        const isNewPurchase = !this.editingPurchase;
        const operationLabel = isNewPurchase ? 'savePurchase-new' : 'savePurchase-edit';
        
        if (typeof PerformanceMonitor !== 'undefined' && PerformanceMonitor) {
            PerformanceMonitor.start(operationLabel, {
                invoiceNo: this.editingPurchase?.invoiceNo || 'new'
            });
        }
        
        let rollbackActions = []; // Store rollback functions
        let inventoryUpdated = false;
        let supplierBalanceUpdated = false;
        let generalEntryCreated = false;
        let purchaseSaved = false;
        
        try {
            // Step 1: Collect form data
            if (typeof PerformanceMonitor !== 'undefined' && PerformanceMonitor) {
                PerformanceMonitor.start('collectPurchaseData');
            }
            const formData = await this.collectPurchaseData();
            if (typeof PerformanceMonitor !== 'undefined' && PerformanceMonitor) {
                PerformanceMonitor.end('collectPurchaseData');
            }
            
            // Check if formData is valid
            if (!formData) {
                Logger.error('❌ Failed to collect purchase data');
                if (typeof PerformanceMonitor !== 'undefined' && PerformanceMonitor) {
                    PerformanceMonitor.end(operationLabel, { success: false, reason: 'Invalid form data' });
                }
                if (typeof showError === 'function') {
                    showError('فشل في جمع بيانات الفاتورة. يرجى التحقق من النموذج.');
                } else {
                    alert('فشل في جمع بيانات الفاتورة. يرجى التحقق من النموذج.');
                }
                return;
            }
            
            // Step 2: Validate form
            if (typeof PerformanceMonitor !== 'undefined' && PerformanceMonitor) {
                PerformanceMonitor.start('validatePurchaseForm');
            }
            if (!this.validatePurchaseForm(formData)) {
                if (typeof PerformanceMonitor !== 'undefined' && PerformanceMonitor) {
                    PerformanceMonitor.end('validatePurchaseForm');
                    PerformanceMonitor.end(operationLabel, { success: false, reason: 'Validation failed' });
                }
                return;
            }
            if (typeof PerformanceMonitor !== 'undefined' && PerformanceMonitor) {
                PerformanceMonitor.end('validatePurchaseForm');
            }

            showLoading();

            // Declare variables outside if-else to use them later
            let generalEntryId = null;
            let purchaseId = null;

            if (this.editingPurchase) {
                // Update purchase
                purchaseId = this.editingPurchase.id;
                if (!purchaseId) {
                    throw new Error('معرف فاتورة الشراء غير موجود');
                }
                formData.id = purchaseId;
                
                // ✅ Save old purchase data for rollback
                const oldPurchaseData = { ...this.editingPurchase };
                
                // ✅ Step 1: Update inventory FIRST (before saving purchase)
                // This way, if it fails, we don't have inconsistent data
                try {
                    await this.updateInventoryOnEdit(this.editingPurchase, formData);
                    inventoryUpdated = true;
                    
                    // Add rollback action
                    rollbackActions.push(async () => {
                        try {
                            Logger.log('🔄 Rolling back inventory changes...');
                            // ✅ Use oldPurchaseData instead of this.editingPurchase (which may have changed)
                            await this.updateInventoryOnEdit(formData, oldPurchaseData);
                        } catch (rollbackError) {
                            Logger.error('❌ Error rolling back inventory:', rollbackError);
                        }
                    });
                } catch (inventoryError) {
                    Logger.error('❌ خطأ في تحديث المخزون:', inventoryError);
                    hideLoading();
                    throw new Error(`فشل في تحديث المخزون: ${inventoryError.message}`);
                }
                
                // ✅ Step 2: Update supplier balance
                try {
                    await this.updateSupplierBalanceOnEdit(this.editingPurchase, formData);
                    supplierBalanceUpdated = true;
                    
                    // Add rollback action
                    rollbackActions.push(async () => {
                        try {
                            Logger.log('🔄 Rolling back supplier balance changes...');
                            await this.updateSupplierBalanceOnEdit(formData, oldPurchaseData);
                        } catch (rollbackError) {
                            Logger.error('❌ Error rolling back supplier balance:', rollbackError);
                        }
                    });
                } catch (balanceError) {
                    Logger.error('❌ خطأ في تحديث رصيد المورد:', balanceError);
                    // Rollback inventory if supplier balance update fails
                    if (inventoryUpdated) {
                        try {
                            await this.updateInventoryOnEdit(formData, oldPurchaseData);
                        } catch (rollbackError) {
                            Logger.error('❌ Error rolling back inventory after balance error:', rollbackError);
                        }
                    }
                    hideLoading();
                    throw new Error(`فشل في تحديث رصيد المورد: ${balanceError.message}`);
                }
                
                // ✅ Step 3: Save purchase document
                try {
                    await Collections.updatePurchase(this.editingPurchase.id, formData);
                    purchaseSaved = true;
                } catch (saveError) {
                    Logger.error('❌ خطأ في حفظ الفاتورة:', saveError);
                    // Rollback previous changes
                    for (const rollbackAction of rollbackActions.reverse()) {
                        await rollbackAction();
                    }
                    hideLoading();
                    throw new Error(`فشل في حفظ الفاتورة: ${saveError.message}`);
                }
                
                // ✅ Step 4: Update or recreate general entry (after purchase is saved)
                try {
                    await this.updateOrCreateGeneralEntry(formData);
                    generalEntryCreated = true;
                } catch (entryError) {
                    Logger.error('❌ خطأ في تحديث القيد العام:', entryError);
                    // Log error but don't fail the entire operation
                    // General entry can be fixed manually if needed
                    Logger.warn('⚠️ تم تحديث الفاتورة بنجاح، لكن حدث خطأ في تحديث القيد المحاسبي. يمكن إصلاحه يدوياً.');
                }
                
                if (typeof showSuccess === 'function') {
                    showSuccess('تم تحديث فاتورة الشراء بنجاح');
                } else {
                    Logger.log('✅ تم تحديث فاتورة الشراء بنجاح');
                }
                
                // For edit, close modal and reset form immediately
                const modal = bootstrap.Modal.getInstance(document.getElementById('purchaseModal'));
                if (modal) {
                    modal.hide();
                }
                this.cancelPurchaseForm();
            } else {
                // ✅ New purchase - improved order: Save first, then update dependencies
                
                // Step 1: Save purchase document first to get ID
                try {
                    if (typeof PerformanceMonitor !== 'undefined' && PerformanceMonitor) {
                        PerformanceMonitor.start('savePurchaseDocument');
                    }
                    const purchaseResult = await Collections.addPurchase(formData);
                    // ⚠️ CRITICAL: Extract ID from result (addDocument returns object with id property)
                    if (typeof purchaseResult === 'string') {
                        purchaseId = purchaseResult;
                    } else if (purchaseResult && typeof purchaseResult === 'object') {
                        purchaseId = purchaseResult.id || purchaseResult.toString?.() || String(purchaseResult);
                        // Ensure it's not [object Object]
                        if (purchaseId === '[object Object]' || purchaseId.includes('[object')) {
                            // Try to get the actual ID
                            purchaseId = purchaseResult.id || null;
                            if (!purchaseId) {
                                Logger.error('❌ Cannot extract purchase ID from result:', purchaseResult);
                                throw new Error('فشل في الحصول على معرف فاتورة الشراء');
                            }
                        }
                    } else {
                        purchaseId = String(purchaseResult);
                    }
                    
                    // Ensure purchaseId is a valid string
                    purchaseId = String(purchaseId);
                    formData.id = purchaseId;
                    purchaseSaved = true;
                    
                    if (typeof PerformanceMonitor !== 'undefined' && PerformanceMonitor) {
                        PerformanceMonitor.end('savePurchaseDocument', { purchaseId });
                    }
                    
                    // Add rollback action to delete purchase if subsequent steps fail
                    rollbackActions.push(async () => {
                        try {
                            Logger.log('🔄 Rolling back: Deleting purchase...');
                            await Collections.deletePurchase(purchaseId);
                        } catch (rollbackError) {
                            Logger.error('❌ Error rolling back purchase deletion:', rollbackError);
                        }
                    });
                    
                    Logger.log(`📝 Purchase saved with ID: ${purchaseId} (type: ${typeof purchaseId}, result type: ${typeof purchaseResult})`);
                } catch (saveError) {
                    if (typeof PerformanceMonitor !== 'undefined' && PerformanceMonitor) {
                        PerformanceMonitor.end('savePurchaseDocument', { success: false, error: saveError.message });
                    }
                    Logger.error('❌ خطأ في حفظ الفاتورة:', saveError);
                    hideLoading();
                    throw new Error(`فشل في حفظ الفاتورة: ${saveError.message}`);
                }
                
                // Step 2: Update inventory (requires purchaseId)
                try {
                    if (typeof PerformanceMonitor !== 'undefined' && PerformanceMonitor) {
                        PerformanceMonitor.start('updateInventory-purchases', {
                            itemsCount: formData.items?.length || 0
                        });
                    }
                    await this.updateInventory(formData);
                    inventoryUpdated = true;
                    
                    if (typeof PerformanceMonitor !== 'undefined' && PerformanceMonitor) {
                        PerformanceMonitor.end('updateInventory-purchases', { success: true });
                    }
                    
                    // Add rollback action
                    rollbackActions.push(async () => {
                        try {
                            Logger.log('🔄 Rolling back inventory changes...');
                            await this.reverseInventoryChangesForPurchase(formData);
                        } catch (rollbackError) {
                            Logger.error('❌ Error rolling back inventory:', rollbackError);
                        }
                    });
                } catch (inventoryError) {
                    if (typeof PerformanceMonitor !== 'undefined' && PerformanceMonitor) {
                        PerformanceMonitor.end('updateInventory-purchases', { success: false, error: inventoryError.message });
                    }
                    Logger.error('❌ خطأ في تحديث المخزون:', inventoryError);
                    // Rollback: Delete purchase
                    if (purchaseSaved) {
                        try {
                            await Collections.deletePurchase(purchaseId);
                        } catch (rollbackError) {
                            Logger.error('❌ Error rolling back purchase:', rollbackError);
                        }
                    }
                    hideLoading();
                    throw new Error(`فشل في تحديث المخزون: ${inventoryError.message}`);
                }
                
                // Step 3: Generate general entry
                try {
                    if (typeof PerformanceMonitor !== 'undefined' && PerformanceMonitor) {
                        PerformanceMonitor.start('generateGeneralEntry-purchases', {
                            invoiceNo: formData.invoiceNo,
                            supplierId: formData.supplierId
                        });
                    }
                    generalEntryId = await this.generateGeneralEntry(formData);
                    if (generalEntryId) {
                        generalEntryCreated = true;
                        if (typeof PerformanceMonitor !== 'undefined' && PerformanceMonitor) {
                            PerformanceMonitor.end('generateGeneralEntry-purchases', { 
                                success: true,
                                entryId: generalEntryId 
                            });
                        }
                        // Add rollback action
                        rollbackActions.push(async () => {
                            try {
                                Logger.log('🔄 Rolling back general entry...');
                                await this.deleteGeneralEntryBySourceId(purchaseId);
                            } catch (rollbackError) {
                                Logger.error('❌ Error rolling back general entry:', rollbackError);
                            }
                        });
                    }
                } catch (entryError) {
                    Logger.error('❌ خطأ في توليد القيد العام:', entryError);
                    // Rollback previous changes
                    for (const rollbackAction of rollbackActions.reverse()) {
                        await rollbackAction();
                    }
                    hideLoading();
                    throw new Error(`فشل في توليد القيد المحاسبي: ${entryError.message}`);
                }
                
                // Step 4: Update supplier balance (for credit purchases)
                try {
                    if (typeof PerformanceMonitor !== 'undefined' && PerformanceMonitor) {
                        PerformanceMonitor.start('updateSupplierBalance-purchases');
                    }
                    await this.updateSupplierBalance(formData, 'add');
                    supplierBalanceUpdated = true;
                    if (typeof PerformanceMonitor !== 'undefined' && PerformanceMonitor) {
                        PerformanceMonitor.end('updateSupplierBalance-purchases', { success: true });
                    }
                    
                    // Add rollback action
                    rollbackActions.push(async () => {
                        try {
                            Logger.log('🔄 Rolling back supplier balance...');
                            await this.updateSupplierBalance(formData, 'subtract');
                        } catch (rollbackError) {
                            Logger.error('❌ Error rolling back supplier balance:', rollbackError);
                        }
                    });
                } catch (balanceError) {
                    if (typeof PerformanceMonitor !== 'undefined' && PerformanceMonitor) {
                        PerformanceMonitor.end('updateSupplierBalance-purchases', { 
                            success: false,
                            error: balanceError.message 
                        });
                    }
                    Logger.error('❌ خطأ في تحديث رصيد المورد:', balanceError);
                    // Rollback previous changes
                    for (const rollbackAction of rollbackActions.reverse()) {
                        await rollbackAction();
                    }
                    hideLoading();
                    throw new Error(`فشل في تحديث رصيد المورد: ${balanceError.message}`);
                }
                
                if (typeof showSuccess === 'function') {
                    showSuccess('تم إضافة فاتورة الشراء بنجاح');
                } else {
                    Logger.log('✅ تم إضافة فاتورة الشراء بنجاح');
                }

                // Show generated general entry if it was created
                // Wait for modal to close first, then show the success dialog
                if (generalEntryId) {
                    // Close modal first and wait for it to fully close
                    const modal = bootstrap.Modal.getInstance(document.getElementById('purchaseModal'));
                    if (modal) {
                        // Hide modal first
                        modal.hide();
                        
                        // Wait for modal to fully close (Bootstrap modal transition is ~300ms)
                        const modalElement = document.getElementById('purchaseModal');
                        if (modalElement) {
                            // Use a one-time event listener to wait for modal to fully close
                            modalElement.addEventListener('hidden.bs.modal', async () => {
                                // Additional delay to ensure modal backdrop is removed and DOM is stable
                                // This prevents conflicts between modal and SweetAlert
                                setTimeout(async () => {
                                    try {
                                        await this.showGeneratedGeneralEntry(purchaseId);
                                    } catch (error) {
                                        Logger.error('❌ Error showing general entry dialog:', error);
                                        // Even if dialog fails, reset form
                                        this.cancelPurchaseForm();
                                    }
                                }, 400); // Increased delay for smoother transition
                            }, { once: true });
                        } else {
                            // Fallback if modal element not found
                            setTimeout(async () => {
                                try {
                                    await this.showGeneratedGeneralEntry(purchaseId);
                                } catch (error) {
                                    Logger.error('❌ Error showing general entry dialog:', error);
                                    this.cancelPurchaseForm();
                                }
                            }, 600);
                        }
                    } else {
                        // Modal not found, show directly after a delay
                        setTimeout(async () => {
                            try {
                                await this.showGeneratedGeneralEntry(purchaseId);
                            } catch (error) {
                                Logger.error('❌ Error showing general entry dialog:', error);
                                this.cancelPurchaseForm();
                            }
                        }, 300);
                    }
                } else {
                    // No general entry, just close modal and reset form
                    const modal = bootstrap.Modal.getInstance(document.getElementById('purchaseModal'));
                    if (modal) {
                        modal.hide();
                    }
                    this.cancelPurchaseForm();
                }
            }

            // Note: Form reset is handled inside each branch (edit or new purchase)

            // Reload data (don't await to avoid blocking)
            this.loadPurchases().catch(err => Logger.error('Error reloading purchases:', err));
            this.loadSuppliers().catch(err => Logger.error('Error reloading suppliers:', err));
            this.updateDashboard();

            hideLoading();
            
            // Log success metrics
            Logger.log('✅ Purchase saved successfully:', {
                purchaseId,
                generalEntryId,
                inventoryUpdated,
                supplierBalanceUpdated,
                generalEntryCreated
            });
            
            // End performance monitoring with success
            if (typeof PerformanceMonitor !== 'undefined' && PerformanceMonitor) {
                PerformanceMonitor.end(operationLabel, {
                    success: true,
                    purchaseId,
                    generalEntryId,
                    inventoryUpdated,
                    supplierBalanceUpdated,
                    generalEntryCreated
                });
            }

        } catch (error) {
            // End performance monitoring with error
            if (typeof PerformanceMonitor !== 'undefined' && PerformanceMonitor) {
                PerformanceMonitor.end(operationLabel, {
                    success: false,
                    error: error.message
                });
            }
            
            console.error('❌ Error saving purchase:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            // ✅ Execute rollback actions in reverse order
            if (rollbackActions.length > 0) {
                Logger.log(`🔄 Executing ${rollbackActions.length} rollback actions...`);
                try {
                    for (const rollbackAction of rollbackActions.reverse()) {
                        await rollbackAction();
                    }
                    Logger.log('✅ Rollback completed');
                } catch (rollbackError) {
                    Logger.error('❌ Error during rollback:', rollbackError);
                    Logger.error('⚠️ Some rollback actions may have failed. Please check the data manually.');
                }
            }
            
            // Ensure loading is hidden
            try {
                hideLoading();
            } catch (e) {
                Logger.warn('⚠️ Error hiding loading:', e);
            }
            
            // Show error to user
            const errorMessage = error.message || 'خطأ غير معروف';
            if (typeof showError === 'function') {
                showError('فشل في حفظ فاتورة الشراء: ' + errorMessage);
            } else if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'خطأ في الحفظ',
                    text: 'فشل في حفظ فاتورة الشراء: ' + errorMessage,
                    icon: 'error',
                    confirmButtonText: 'حسناً'
                });
            } else {
                alert('فشل في حفظ فاتورة الشراء: ' + errorMessage);
            }
        }
    },

    /**
     * Collect purchase form data
     */
    async collectPurchaseData() {
        // Check if modal is open
        const modal = document.getElementById('purchaseModal');
        if (!modal || !modal.classList.contains('show')) {
            console.error('❌ Purchase modal is not open');
            return null;
        }
        
        const items = [];
        const tbody = document.getElementById('purchaseItemsBody');
        if (!tbody) {
            console.error('❌ purchaseItemsBody not found in DOM');
            // Return empty object with required structure instead of undefined
            return {
                invoiceNo: '',
                date: '',
                supplierId: '',
                supplierName: '',
                currency: 'IQD',
                exchangeRate: 1,
                warehouseId: '',
                costCenterId: '',
                salesRep1Id: '',
                salesRep2Id: '',
                items: [],
                subtotal: 0,
                totalDiscounts: 0,
                totalAdditions: 0,
                total: 0,
                paidAmount: 0,
                remainingAmount: 0,
                paymentMethod: 'cash',
                paymentStatus: 'unpaid',
                status: 'pending',
                notes: '',
                discountAdditionRows: []
            };
        }
        
        // Use children instead of querySelectorAll for better performance
        const rows = tbody.children;

        // Use for loop instead of forEach for better performance
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            // Get product ID from autocomplete hidden input
            const productHiddenInput = row.querySelector('.product-select-id');
            const productId = productHiddenInput?.value || '';
            
            // Get product name from autocomplete input
            const productInput = row.querySelector('.product-display-input');
            const productName = productInput?.value || '';
            
            const quantityInput = row.querySelector('.quantity-input');
            const priceInput = row.querySelector('.price-input');
            const quantity = quantityInput ? parseFloat(quantityInput.value) || 0 : 0;
            const price = priceInput ? parseFloat(priceInput.value) || 0 : 0;
            const discountPercent = parseFloat(row.querySelector('.discount-percent-input')?.value) || 0;
            const discountAmount = parseFloat(row.querySelector('.discount-amount-input')?.value) || 0;
            const additionPercent = parseFloat(row.querySelector('.addition-percent-input')?.value) || 0;
            const additionAmount = parseFloat(row.querySelector('.addition-amount-input')?.value) || 0;
            const total = parseFloat(row.querySelector('.total-input')?.value) || 0;
            const netPrice = parseFloat(row.querySelector('.net-price-input')?.value) || 0;
            
            // Get unit ID from autocomplete hidden input
            const unitHiddenInput = row.querySelector('.unit-select-id');
            const unitId = unitHiddenInput?.value || '';
            
            const expiryDateInput = row.querySelector('.expiry-date-input');
            const serialNumberInput = row.querySelector('.serial-number-input');
            const notesInput = row.querySelector('.notes-input');

            if (productId && quantity > 0 && price > 0) {
                // Get product data to save original currency and price
                const product = this.products.find(p => p.id === productId);
                const productCurrency = product?.currency || 'IQD';
                
                // Get original price from row dataset (stored when unit was selected)
                const originalUnitPrice = parseFloat(row.dataset.unitPrice) || price;
                const originalCurrency = row.dataset.unitCurrency || productCurrency;
                
                // Get invoice currency for reference
                const invoiceCurrency = document.getElementById('purchaseCurrency')?.value || 'IQD';
                const invoiceExchangeRate = parseFloat(document.getElementById('purchaseExchangeRate')?.value) || 1;
                
                items.push({
                    productId: productId,
                    productName: productName,
                    quantity: quantity,
                    unitId: unitId,
                    unitPrice: price, // Price in invoice currency (converted)
                    netPrice: netPrice, // Net price per unit (after discount and addition)
                    originalUnitPrice: originalUnitPrice, // Original price in product currency
                    originalCurrency: originalCurrency, // Product currency
                    invoiceCurrency: invoiceCurrency, // Invoice currency
                    exchangeRate: invoiceExchangeRate, // Exchange rate used for conversion
                    discountPercent: discountPercent,
                    discountAmount: discountAmount,
                    additionPercent: additionPercent,
                    additionAmount: additionAmount,
                    total: total,
                    expiryDate: expiryDateInput?.value || '',
                    serialNumber: serialNumberInput?.value || '',
                    notes: notesInput?.value || ''
                });
            }
        }

        // Collect discount/addition rows
        const discountAdditionRows = [];
        const discountRows = document.querySelectorAll('#discountsAdditionsBody tr');
        discountRows.forEach(row => {
            const type = row.querySelector('.type-select')?.value;
            const accountSelect = row.querySelector('.account-select');
            const accountId = accountSelect?.value || '';
            const accountName = row.querySelector('.account-name-display')?.value || '';
            const counterAccountSelect = row.querySelector('.counter-account-select');
            const counterAccountId = counterAccountSelect?.value || '';
            const counterAccountName = row.querySelector('.counter-account-name-display')?.value || '';
            const amount = parseFloat(row.querySelector('.amount-input')?.value) || 0;
            const currency = row.querySelector('.currency-select')?.value || 'IQD';
            const notes = row.querySelector('.notes-input')?.value || '';

            if (type && accountId && amount > 0) {
                discountAdditionRows.push({
                    type: type,
                    accountId: accountId,
                    accountName: accountName,
                    counterAccountId: counterAccountId,
                    counterAccountName: counterAccountName,
                    amount: amount,
                    currency: currency,
                    notes: notes
                });
            }
        });

        // Calculate totals from discount/addition rows
        let totalDiscounts = 0;
        let totalAdditions = 0;
        discountAdditionRows.forEach(row => {
            if (row.type === 'discount') {
                totalDiscounts += row.amount;
            } else if (row.type === 'addition') {
                totalAdditions += row.amount;
            }
        });

        // Get payment status
        const totalEl = document.getElementById('purchaseTotal');
        const paidAmountEl = document.getElementById('purchasePaidAmount');
        const paymentMethodEl = document.getElementById('purchasePaymentMethod');
        const paymentMethod = paymentMethodEl?.value || 'cash';
        const total = totalEl ? parseFloat(totalEl.textContent) || 0 : 0;
        
        // في الدفع النقدي: المبلغ المدفوع = الإجمالي (لأن الدفع كامل)
        // في الدفع الآجل: المبلغ المدفوع من الحقل (حتى لو كان 0)
        // ✅ عند التعديل: نقرأ القيمة الجديدة من الحقل (يسمح للمستخدم بتعديل المبلغ المدفوع)
        let paidAmount = 0;
        if (paymentMethod === 'cash') {
            // في الدفع النقدي: المبلغ المدفوع = الإجمالي
            paidAmount = total;
            Logger.log(`💰 الدفع النقدي: المبلغ المدفوع = الإجمالي = ${paidAmount}`);
        } else {
            // في الدفع الآجل: المبلغ المدفوع من الحقل (سواء عند الإضافة أو التعديل)
            paidAmount = paidAmountEl ? parseFloat(paidAmountEl.value) || 0 : 0;
            if (this.editingPurchase) {
                Logger.log(`💰 عند التعديل: المبلغ المدفوع من الحقل = ${paidAmount} (كان ${this.editingPurchase.paidAmount || 0} في الأصل)`);
            } else {
                Logger.log(`💰 الدفع الآجل: المبلغ المدفوع من الحقل = ${paidAmount} (من إجمالي ${total})`);
            }
        }
        
        let paymentStatus = 'unpaid';
        let payableAmount = total; // القيمة الافتراضية للدفع النقدي
        
        if (paymentMethod === 'cash') {
            // في الدفع النقدي: دائماً مدفوع بالكامل
            paymentStatus = 'paid';
        } else {
            // في الدفع الآجل: حسب المبلغ المدفوع
            // استخدام القيمة القابلة للدفع المحسوبة بدقة (بعد استبعاد الخصومات والإضافات التي لها حساب مقابل)
            payableAmount = await this.calculatePayableAmount();
            
            // ✅ عند التعديل: إذا كان المبلغ المدفوع أكبر من القيمة القابلة للدفع، 
            // فهذا يعني أن البيانات لم تكتمل بعد - نعيد الحساب
            if (paidAmount > payableAmount && this.editingPurchase) {
                Logger.log(`🔄 عند التعديل: المبلغ المدفوع (${paidAmount}) أعلى من القيمة القابلة للدفع (${payableAmount}) - إعادة الحساب...`);
                
                // إعادة حساب الإجماليات
                this.calculatePurchaseTotals();
                await new Promise(resolve => setTimeout(resolve, 200));
                
                // إعادة حساب القيمة القابلة للدفع
                payableAmount = await this.calculatePayableAmount();
                
                // إذا كانت القيمة لا تزال غير صحيحة، ننتظر مرة أخرى
                if (paidAmount > payableAmount && payableAmount > 0) {
                    Logger.log(`🔄 إعادة الحساب مرة أخرى...`);
                    this.calculatePurchaseTotals();
                    await new Promise(resolve => setTimeout(resolve, 200));
                    payableAmount = await this.calculatePayableAmount();
                }
                
                // بعد إعادة الحساب، إذا كان المبلغ المدفوع لا يزال أكبر، 
                // فهذا يعني أن القيمة الأصلية صحيحة (قد تكون هناك خصومات/إضافات تم حذفها)
                if (paidAmount > payableAmount) {
                    Logger.log(`ℹ️ بعد إعادة الحساب: المبلغ المدفوع (${paidAmount}) لا يزال أعلى من القيمة القابلة للدفع (${payableAmount}) - نحافظ على القيمة الأصلية`);
                } else {
                    Logger.log(`✅ بعد إعادة الحساب: المبلغ المدفوع (${paidAmount})، القيمة القابلة للدفع (${payableAmount})`);
                }
            } else if (paidAmount > payableAmount && !this.editingPurchase) {
                // عند الإضافة: لا يمكن أن يكون المبلغ المدفوع أكبر من القيمة القابلة للدفع
                console.warn(`⚠️ المبلغ المدفوع (${paidAmount}) يتجاوز القيمة القابلة للدفع (${payableAmount})، سيتم تصحيحه إلى ${payableAmount}`);
                paidAmount = payableAmount;
                // تحديث الحقل في الواجهة
                if (paidAmountEl) {
                    paidAmountEl.value = payableAmount.toFixed(2);
                }
            }
            
            if (paidAmount >= payableAmount) {
                paymentStatus = 'paid';
            } else if (paidAmount > 0) {
                paymentStatus = 'partial';
            } else {
                paymentStatus = 'unpaid';
            }
        }
        
        Logger.log(`📊 Payment Info Collected:`, {
            paymentMethod,
            total,
            payableAmount,
            paidAmount,
            remainingAmount: payableAmount - paidAmount,
            paymentStatus,
            paymentAccountId: document.getElementById('purchasePaymentAccount')?.value || ''
        });

        // Get values from supplier picker fields
        const supplierId = document.getElementById('purchaseSupplierId')?.value || '';
        const supplierDisplay = document.getElementById('purchaseSupplierDisplay');
        // Get supplier name from display field or lookup from suppliers list
        let supplierName = supplierDisplay?.value || '';
        // If display field is empty but supplierId exists, lookup supplier name
        if (!supplierName && supplierId) {
            const supplier = this.suppliers.find(s => s.id === supplierId);
            supplierName = supplier?.name || '';
        }
        
        const warehouseId = document.getElementById('purchaseWarehouseId')?.value || '';
        const costCenterId = document.getElementById('purchaseCostCenterId')?.value || '';
        const salesRep1Id = document.getElementById('purchaseSalesRep1Id')?.value || '';
        const salesRep2Id = document.getElementById('purchaseSalesRep2Id')?.value || '';

        // Safely get all form values with null checks
        const invoiceNoEl = document.getElementById('purchaseInvoiceNo');
        const dateEl = document.getElementById('purchaseDate');
        const currencyEl = document.getElementById('purchaseCurrency');
        const exchangeRateEl = document.getElementById('purchaseExchangeRate');
        const subtotalEl = document.getElementById('purchaseSubtotal');
        const notesEl = document.getElementById('purchaseNotes');
        // paymentMethodEl already defined above
        const remainingAmountEl = document.getElementById('purchaseRemainingAmount');
        const dueDateEl = document.getElementById('purchaseDueDate');
        const paymentAccountEl = document.getElementById('purchasePaymentAccount');

        // Validate critical fields
        if (!invoiceNoEl) {
            console.error('❌ purchaseInvoiceNo not found');
            return null;
        }
        if (!dateEl) {
            console.error('❌ purchaseDate not found');
            return null;
        }
        if (!currencyEl) {
            console.error('❌ purchaseCurrency not found');
            return null;
        }

        // Calculate remaining amount if not set (for credit purchases)
        let remainingAmount = 0;
        if (remainingAmountEl) {
            remainingAmount = parseFloat(remainingAmountEl.value) || 0;
        } else {
            // Calculate from total - paidAmount if element not found
            remainingAmount = total - paidAmount;
            console.warn('⚠️ purchaseRemainingAmount not found, calculated from total - paidAmount');
        }

        return {
            invoiceNo: invoiceNoEl.value.trim() || '',
            date: dateEl.value || '',
            supplierId: supplierId,
            supplierName: supplierName,
            currency: currencyEl.value || 'IQD',
            exchangeRate: exchangeRateEl ? parseFloat(exchangeRateEl.value) || 1 : 1,
            warehouseId: warehouseId,
            costCenterId: costCenterId,
            salesRep1Id: salesRep1Id,
            salesRep2Id: salesRep2Id,
            items: items,
            subtotal: subtotalEl ? parseFloat(subtotalEl.textContent) || 0 : 0,
            totalDiscounts: totalDiscounts,
            totalAdditions: totalAdditions,
            discountAdditionRows: discountAdditionRows,
            total: total,
            notes: notesEl?.value?.trim() || '',
            status: 'completed',
            // Payment information
            paymentMethod: paymentMethodEl?.value || 'cash',
            paidAmount: paidAmount,
            remainingAmount: remainingAmount,
            paymentStatus: paymentStatus,
            dueDate: dueDateEl?.value || null,
            paymentAccountId: paymentAccountEl?.value || '',
            createdAt: new Date(),
            createdBy: auth.currentUser?.uid || 'system'
        };
    },

    /**
     * Validate purchase form
     */
    validatePurchaseForm(data) {
        if (!data.invoiceNo) {
            if (typeof showError === 'function') {
                showError('رقم الفاتورة مطلوب');
            } else {
                Logger.error('❌ رقم الفاتورة مطلوب');
            }
            return false;
        }

        if (!data.date) {
            if (typeof showError === 'function') {
                showError('تاريخ الفاتورة مطلوب');
            } else {
                Logger.error('❌ تاريخ الفاتورة مطلوب');
            }
            return false;
        }

        // Supplier is required only for credit payments
        // لا يتم حفظ الفاتورة الآجلة إلا إذا تم اختيار مورد وله حساب محاسبي مرتبط
        if (data.paymentMethod === 'credit') {
            if (!data.supplierId) {
                if (typeof showError === 'function') {
                    showError('المورد مطلوب في حالة الدفع الآجل');
                } else {
                    Logger.error('❌ المورد مطلوب في حالة الدفع الآجل');
                }
                return false;
            }
            
            // التحقق من وجود حساب محاسبي مرتبط في بطاقة المورد
            const supplier = this.suppliers.find(s => s.id === data.supplierId);
            if (!supplier) {
                if (typeof showError === 'function') {
                    showError('المورد المحدد غير موجود');
                } else {
                    Logger.error('❌ المورد المحدد غير موجود');
                }
                return false;
            }
            
            // ⚠️ CRITICAL: التحقق من subAccountId (الحساب المرتبط) وليس accountId (الحساب الرئيسي)
            if (!supplier.subAccountId) {
                if (typeof showError === 'function') {
                    showError(`المورد "${supplier.name}" لا يحتوي على حساب محاسبي مرتبط (حساب فرعي). يرجى إنشاء حساب فرعي للمورد من بطاقة المورد أولاً. الحساب الرئيسي لا يُستخدم في المعاملات المالية.`);
                } else {
                    Logger.error(`❌ المورد "${supplier.name}" لا يحتوي على حساب محاسبي مرتبط (subAccountId)`);
                    Logger.error(`   الحساب الرئيسي موجود: ${supplier.accountId ? 'نعم (' + supplier.accountId + ')' : 'لا'}`);
                }
                return false;
            }
            
            // التحقق من أن الحساب موجود في قائمة الحسابات
            const supplierAccount = this.accounts.find(a => a.id === supplier.subAccountId);
            if (!supplierAccount) {
                if (typeof showError === 'function') {
                    showError(`حساب المورد المرتبط في بطاقة المورد "${supplier.name}" غير موجود في قائمة الحسابات. يرجى التحقق من إعدادات المورد.`);
                } else {
                    Logger.error(`❌ حساب المورد المرتبط في بطاقة المورد "${supplier.name}" غير موجود في قائمة الحسابات`);
                }
                return false;
            }
        }

        if (!data.items || data.items.length === 0) {
            if (typeof showError === 'function') {
                showError('يجب إضافة منتج واحد على الأقل');
            } else {
                Logger.error('❌ يجب إضافة منتج واحد على الأقل');
            }
            return false;
        }

        // Validate each item
        for (let i = 0; i < data.items.length; i++) {
            const item = data.items[i];
            
            // Validate product ID
            if (!item.productId) {
                if (typeof showError === 'function') {
                    showError(`الصف ${i + 1}: يجب تحديد منتج`);
                } else {
                    Logger.error(`❌ الصف ${i + 1}: يجب تحديد منتج`);
                }
                return false;
            }
            
            // Validate quantity
            if (!item.quantity || item.quantity <= 0) {
                if (typeof showError === 'function') {
                    showError(`الصف ${i + 1}: الكمية يجب أن تكون أكبر من صفر`);
                } else {
                    Logger.error(`❌ الصف ${i + 1}: الكمية يجب أن تكون أكبر من صفر`);
                }
                return false;
            }
            
            // Validate unit
            if (!item.unitId) {
                if (typeof showError === 'function') {
                    showError(`الصف ${i + 1}: يجب تحديد وحدة`);
                } else {
                    Logger.error(`❌ الصف ${i + 1}: يجب تحديد وحدة`);
                }
                return false;
            }
            
            // Validate price
            if (!item.unitPrice || item.unitPrice <= 0) {
                if (typeof showError === 'function') {
                    showError(`الصف ${i + 1}: السعر يجب أن يكون أكبر من صفر`);
                } else {
                    Logger.error(`❌ الصف ${i + 1}: السعر يجب أن يكون أكبر من صفر`);
                }
                return false;
            }
            
            // Validate total
            if (!item.total || item.total <= 0) {
                if (typeof showError === 'function') {
                    showError(`الصف ${i + 1}: الإجمالي يجب أن يكون أكبر من صفر`);
                } else {
                    Logger.error(`❌ الصف ${i + 1}: الإجمالي يجب أن يكون أكبر من صفر`);
                }
                return false;
            }
        }

        // Validate serial numbers and expiry dates for items
        const rows = document.querySelectorAll('#purchaseItemsBody tr');
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const productHiddenInput = row.querySelector('.product-select-id');
            if (!productHiddenInput || !productHiddenInput.value) continue;

            // Get product data to check requirements
            const productId = productHiddenInput.value;
            const product = this.products.find(p => p.id === productId);
            
            if (product) {
                const hasExpiry = product.hasExpiryDate || false;
                const hasSerial = product.hasSerialNumber || false;
                const forceExpiry = product.forceExpiryOnInput || false;
                const forceSerial = product.forceSerialOnInput || false;

                // Check expiry date requirement - check if hasExpiryDate OR forceExpiryOnInput
                if (hasExpiry || forceExpiry) {
                    const expiryDateInput = row.querySelector('.expiry-date-input');
                    if (expiryDateInput) {
                        // Check if field is visible (should be visible if hasExpiry is true)
                        const isVisible = expiryDateInput.style.display !== 'none';
                        if (isVisible && (!expiryDateInput.value || expiryDateInput.value.trim() === '')) {
                            expiryDateInput.focus();
                            expiryDateInput.classList.add('is-invalid');
                            if (typeof showError === 'function') {
                                showError(`المنتج "${product.name}" يتطلب إدخال تاريخ صلاحية`);
                            } else {
                                Logger.error(`❌ المنتج "${product.name}" يتطلب إدخال تاريخ صلاحية`);
                            }
                            return false;
                        } else {
                            expiryDateInput.classList.remove('is-invalid');
                        }
                    }
                }

                // Check serial number requirement - check if hasSerialNumber OR forceSerialOnInput
                if (hasSerial || forceSerial) {
                    const serialNumberInput = row.querySelector('.serial-number-input');
                    if (serialNumberInput) {
                        // Check if field is visible (should be visible if hasSerial is true)
                        const isVisible = serialNumberInput.style.display !== 'none';
                        if (isVisible && (!serialNumberInput.value || serialNumberInput.value.trim() === '')) {
                            serialNumberInput.focus();
                            serialNumberInput.classList.add('is-invalid');
                            if (typeof showError === 'function') {
                                showError(`المنتج "${product.name}" يتطلب إدخال رقم تسلسلي`);
                            } else {
                                Logger.error(`❌ المنتج "${product.name}" يتطلب إدخال رقم تسلسلي`);
                            }
                            return false;
                        } else {
                            serialNumberInput.classList.remove('is-invalid');
                        }
                    }
                }
            }
        }

        return true;
    },

    /**
     * Populate purchase form for editing
     */
    populatePurchaseForm() {
        if (!this.editingPurchase) {
            Logger.warn('⚠️ populatePurchaseForm: editingPurchase is null');
            return;
        }
        
        // Prevent multiple simultaneous calls
        if (this.isPopulatingForm) {
            Logger.warn('⚠️ populatePurchaseForm already in progress, skipping duplicate call...');
            return;
        }
        
        this.isPopulatingForm = true;
        Logger.log('📝 populatePurchaseForm: Starting to populate form for purchase:', this.editingPurchase.invoiceNo || this.editingPurchase.id);

        // Populate header fields
        const invoiceNoInput = document.getElementById('purchaseInvoiceNo');
        if (invoiceNoInput) {
            invoiceNoInput.value = this.editingPurchase.invoiceNo || '';
            Logger.log('📝 Set invoiceNo:', this.editingPurchase.invoiceNo);
        } else {
            Logger.error('❌ purchaseInvoiceNo input not found');
        }
        
        // Handle date - convert Firestore Timestamp if needed
        const dateInput = document.getElementById('purchaseDate');
        if (dateInput) {
            if (this.editingPurchase.date) {
                // Check if it's a Firestore Timestamp
                if (this.editingPurchase.date.toDate && typeof this.editingPurchase.date.toDate === 'function') {
                    const date = this.editingPurchase.date.toDate();
                    dateInput.value = date.toISOString().split('T')[0];
                } else if (this.editingPurchase.date instanceof Date) {
                    dateInput.value = this.editingPurchase.date.toISOString().split('T')[0];
                } else if (typeof this.editingPurchase.date === 'string') {
                    // If it's already a string, use it directly
                    dateInput.value = this.editingPurchase.date;
                } else {
                    // Try to parse as date
                    const date = new Date(this.editingPurchase.date);
                    if (!isNaN(date.getTime())) {
                        dateInput.value = date.toISOString().split('T')[0];
                    }
                }
            }
        }
        
        // Populate currency
        const currencyInput = document.getElementById('purchaseCurrency');
        if (currencyInput) {
            currencyInput.value = this.editingPurchase.currency || 'IQD';
            Logger.log('📝 Set currency:', this.editingPurchase.currency);
        } else {
            Logger.error('❌ purchaseCurrency input not found');
        }
        
        // Populate exchange rate
        const exchangeRateInput = document.getElementById('purchaseExchangeRate');
        if (exchangeRateInput) {
            exchangeRateInput.value = this.editingPurchase.exchangeRate || 1;
            Logger.log('📝 Set exchangeRate:', this.editingPurchase.exchangeRate);
        } else {
            Logger.error('❌ purchaseExchangeRate input not found');
        }
        
        // Populate notes
        const notesInput = document.getElementById('purchaseNotes');
        if (notesInput) {
            notesInput.value = this.editingPurchase.notes || '';
            Logger.log('📝 Set notes:', this.editingPurchase.notes);
        } else {
            Logger.error('❌ purchaseNotes input not found');
        }
        
        // Populate picker fields
        // Supplier
        if (this.editingPurchase.supplierId) {
            const supplier = this.suppliers.find(s => s.id === this.editingPurchase.supplierId);
            if (supplier) {
                const supplierDisplay = document.getElementById('purchaseSupplierDisplay');
                const supplierIdInput = document.getElementById('purchaseSupplierId');
                const clearSupplierBtn = document.getElementById('clearSupplier');
                if (supplierDisplay) supplierDisplay.value = supplier.name;
                if (supplierIdInput) supplierIdInput.value = supplier.id;
                // Show clear supplier button when supplier is selected
                if (clearSupplierBtn) clearSupplierBtn.style.display = 'block';
            }
        }
        
        // Warehouse
        if (this.editingPurchase.warehouseId) {
            const warehouse = this.warehouses.find(w => w.id === this.editingPurchase.warehouseId);
            if (warehouse) {
                const warehouseDisplay = document.getElementById('purchaseWarehouseDisplay');
                const warehouseIdInput = document.getElementById('purchaseWarehouseId');
                if (warehouseDisplay) warehouseDisplay.value = warehouse.name;
                if (warehouseIdInput) warehouseIdInput.value = warehouse.id;
            }
        }
        
        // Cost Center
        if (this.editingPurchase.costCenterId) {
            const costCenter = this.costCenters.find(c => c.id === this.editingPurchase.costCenterId);
            if (costCenter) {
                const costCenterDisplay = document.getElementById('purchaseCostCenterDisplay');
                const costCenterIdInput = document.getElementById('purchaseCostCenterId');
                if (costCenterDisplay) costCenterDisplay.value = costCenter.name;
                if (costCenterIdInput) costCenterIdInput.value = costCenter.id;
            }
        }
        
        // Sales Rep 1
        if (this.editingPurchase.salesRep1Id) {
            const salesRep1 = this.salesReps.find(r => r.id === this.editingPurchase.salesRep1Id);
            if (salesRep1) {
                const salesRep1Display = document.getElementById('purchaseSalesRep1Display');
                const salesRep1IdInput = document.getElementById('purchaseSalesRep1Id');
                if (salesRep1Display) salesRep1Display.value = salesRep1.name;
                if (salesRep1IdInput) salesRep1IdInput.value = salesRep1.id;
            }
        }
        
        // Sales Rep 2
        if (this.editingPurchase.salesRep2Id) {
            const salesRep2 = this.salesReps.find(r => r.id === this.editingPurchase.salesRep2Id);
            if (salesRep2) {
                const salesRep2Display = document.getElementById('purchaseSalesRep2Display');
                const salesRep2IdInput = document.getElementById('purchaseSalesRep2Id');
                if (salesRep2Display) salesRep2Display.value = salesRep2.name;
                if (salesRep2IdInput) salesRep2IdInput.value = salesRep2.id;
            }
        }

        // Populate summary fields
        const subtotalEl = document.getElementById('purchaseSubtotal');
        if (subtotalEl) {
            subtotalEl.textContent = (this.editingPurchase.subtotal || 0).toFixed(2);
            Logger.log('📝 Set subtotal:', this.editingPurchase.subtotal);
        } else {
            Logger.error('❌ purchaseSubtotal not found');
        }
        
        const totalEl = document.getElementById('purchaseTotal');
        if (totalEl) {
            totalEl.textContent = (this.editingPurchase.total || 0).toFixed(2);
            Logger.log('📝 Set total:', this.editingPurchase.total);
        } else {
            Logger.error('❌ purchaseTotal not found');
        }

        // Populate payment fields
        const paymentMethodEl = document.getElementById('purchasePaymentMethod');
        if (paymentMethodEl) {
            paymentMethodEl.value = this.editingPurchase.paymentMethod || 'cash';
            Logger.log('📝 Set paymentMethod:', this.editingPurchase.paymentMethod);
        } else {
            Logger.error('❌ purchasePaymentMethod not found');
        }
        
        // ✅ المبلغ المدفوع سيتم تحميله في النهاية بعد اكتمال جميع البيانات
        // نحفظ القيمة الأصلية فقط للاستخدام لاحقاً
        const originalPaidAmount = this.editingPurchase.paidAmount || 0;
        
        // تحديث حقول الدفع بناءً على طريقة الدفع المحددة
        // هذا مهم لضمان تحديث حالة الدفع بشكل صحيح
        // ملاحظة: updatePaymentFields() لن تغير paidAmount عند التعديل لأن isPopulatingForm = true
        this.updatePaymentFields();
        // لا نعين المبلغ المتبقي مباشرة - سيتم حسابه تلقائياً من calculateRemainingAmount
        // document.getElementById('purchaseRemainingAmount').value = this.editingPurchase.remainingAmount || 0;
        // لا نعين حالة الدفع مباشرة - سيتم حسابها تلقائياً من calculateRemainingAmount بناءً على القيمة القابلة للدفع الفعلية
        // (هذا مهم خاصة إذا كانت هناك خصومات أو إضافات لها حساب مقابل)
        // const paymentStatusEl = document.getElementById('purchasePaymentStatus');
        // if (paymentStatusEl) {
        //     paymentStatusEl.value = this.editingPurchase.paymentStatus || 'unpaid';
        // }
        // Handle due date - convert Firestore Timestamp if needed
        const dueDateInput = document.getElementById('purchaseDueDate');
        if (dueDateInput && this.editingPurchase.dueDate) {
            // Check if it's a Firestore Timestamp
            if (this.editingPurchase.dueDate.toDate && typeof this.editingPurchase.dueDate.toDate === 'function') {
                const dueDate = this.editingPurchase.dueDate.toDate();
                dueDateInput.value = dueDate.toISOString().split('T')[0];
            } else if (this.editingPurchase.dueDate instanceof Date) {
                dueDateInput.value = this.editingPurchase.dueDate.toISOString().split('T')[0];
            } else if (typeof this.editingPurchase.dueDate === 'string') {
                dueDateInput.value = this.editingPurchase.dueDate;
            } else {
                // Try to parse as date
                const dueDate = new Date(this.editingPurchase.dueDate);
                if (!isNaN(dueDate.getTime())) {
                    dueDateInput.value = dueDate.toISOString().split('T')[0];
                }
            }
        } else if (dueDateInput) {
            dueDateInput.value = '';
        }
        
        // Populate payment account
        if (this.editingPurchase.paymentAccountId) {
            const paymentAccount = this.accounts.find(a => a.id === this.editingPurchase.paymentAccountId);
            if (paymentAccount) {
                const paymentAccountDisplay = document.getElementById('purchasePaymentAccountDisplay');
                const paymentAccountIdInput = document.getElementById('purchasePaymentAccount');
                if (paymentAccountDisplay) paymentAccountDisplay.value = paymentAccount.name;
                if (paymentAccountIdInput) paymentAccountIdInput.value = paymentAccount.id;
            }
        }

        // Clear existing items
        const tbody = document.getElementById('purchaseItemsBody');
        tbody.innerHTML = '';

        // Add items
        if (this.editingPurchase.items && this.editingPurchase.items.length > 0) {
            // ✅ إزالة التكرارات الدفاعية من بيانات الأصناف قبل تعبئة النموذج
            // هذا مهم لأن بعض الفواتير القديمة قد تحتوي على أصناف مكررة في قاعدة البيانات
            let items = Array.isArray(this.editingPurchase.items)
                ? [...this.editingPurchase.items]
                : [];

            const seenKeys = new Set();
            const uniqueItems = [];

            for (const item of items) {
                // نحدد التكرار بناءً على مجموعة من الحقول الأساسية
                const keyParts = [
                    item.productId || '',
                    item.unitId || '',
                    item.quantity || 0,
                    item.unitPrice || 0,
                    item.discountPercent || 0,
                    item.additionPercent || 0,
                    item.expiryDate || '',
                    item.serialNumber || ''
                ];
                const key = keyParts.join('|');

                if (seenKeys.has(key)) {
                    Logger.warn('⚠️ Duplicate purchase item detected and skipped in UI only:', {
                        key,
                        item
                    });
                    continue;
                }

                seenKeys.add(key);
                uniqueItems.push(item);
            }

            Logger.log(
                '📝 populatePurchaseForm: items count before dedupe =',
                this.editingPurchase.items.length,
                'after dedupe =',
                uniqueItems.length
            );

            // Use async forEach to handle product loading
            const populateItems = async () => {
                for (const item of uniqueItems) {
                    this.addPurchaseItem();
                    const lastRow = tbody.lastElementChild;
                    
                    // Populate item data using autocomplete
                    const product = this.products.find(p => p.id === item.productId);
                    if (product) {
                        const productInput = lastRow.querySelector('.product-display-input');
                        const productHiddenInput = lastRow.querySelector('.product-select-id');
                        if (productInput) productInput.value = `${product.name}${product.code ? ' - ' + product.code : ''}`;
                        if (productHiddenInput) productHiddenInput.value = product.id;
                        
                        // Trigger product selection to load units
                        await this.handleProductSelection(lastRow, product);
                        
                        // Wait for units to load
                        await new Promise(resolve => setTimeout(resolve, 200));
                        
                        // Now set the unit after units are loaded
                        if (item.unitId) {
                            const unit = this.units.find(u => u.id === item.unitId);
                            if (unit) {
                                const unitInput = lastRow.querySelector('.unit-autocomplete-container input[type="text"]');
                                const unitHiddenInput = lastRow.querySelector('.unit-select-id');
                                if (unitInput) unitInput.value = unit.name;
                                if (unitHiddenInput) unitHiddenInput.value = unit.id;
                                
                                // Find the unit item from available units and trigger selection
                                // We need to get the available units from the product
                                const fullProduct = await Collections.getProduct(product.id);
                                if (fullProduct) {
                                    const availableUnits = [];
                                    const productCurrency = fullProduct.currency || 'IQD';
                                    const hasSubUnits = fullProduct.subUnits && fullProduct.subUnits.length > 0;
                                    
                                    if (fullProduct.unitId) {
                                        const mainUnit = this.units.find(u => u.id === fullProduct.unitId);
                                        if (mainUnit) {
                                            availableUnits.push({
                                                unit: mainUnit,
                                                price: fullProduct.purchasePrice || 0,
                                                currency: productCurrency,
                                                conversion: 1,
                                                conversionType: 'multiply',
                                                isMain: true
                                            });
                                        }
                                    }
                                    
                                    if (hasSubUnits) {
                                        const mainUnitPrice = fullProduct.purchasePrice || 0;
                                        fullProduct.subUnits.forEach(subUnit => {
                                            const unit = this.units.find(u => u.id === subUnit.unitId);
                                            if (unit) {
                                                let subUnitPrice;
                                                if (subUnit.purchasePrice !== undefined && subUnit.purchasePrice !== null && subUnit.purchasePrice > 0) {
                                                    subUnitPrice = subUnit.purchasePrice;
                                                } else {
                                                    const conversionType = subUnit.conversionType || 'multiply';
                                                    const conversionFactor = parseFloat(subUnit.conversionValue || subUnit.conversionFactor) || 1;
                                                    if (mainUnitPrice > 0) {
                                                        if (conversionType === 'multiply') {
                                                            subUnitPrice = mainUnitPrice * conversionFactor;
                                                        } else if (conversionType === 'divide') {
                                                            subUnitPrice = mainUnitPrice / conversionFactor;
                                                        } else {
                                                            subUnitPrice = mainUnitPrice;
                                                        }
                                                    } else {
                                                        subUnitPrice = 0;
                                                    }
                                                }
                                                availableUnits.push({
                                                    unit: unit,
                                                    price: subUnitPrice,
                                                    currency: productCurrency,
                                                    conversion: parseFloat(subUnit.conversionValue || subUnit.conversionFactor) || 1,
                                                    conversionType: subUnit.conversionType || 'multiply',
                                                    isMain: false
                                                });
                                            }
                                        });
                                    }
                                    
                                    const unitItem = availableUnits.find(u => u.unit.id === item.unitId);
                                    if (unitItem) {
                                        await this.handleUnitSelection(lastRow, unitItem, fullProduct);
                                    }
                                }
                            }
                        }
                    }
                    
                    const quantityInput = lastRow.querySelector('.quantity-input');
                    if (quantityInput) quantityInput.value = item.quantity;
                    
                    const priceInput = lastRow.querySelector('.price-input');
                    if (priceInput) priceInput.value = item.unitPrice || 0;
                    
                    const discountPercentInput = lastRow.querySelector('.discount-percent-input');
                    if (discountPercentInput) discountPercentInput.value = item.discountPercent || 0;
                    
                    const discountAmountInput = lastRow.querySelector('.discount-amount-input');
                    if (discountAmountInput) {
                        const quantity = parseFloat(item.quantity) || 0;
                        const price = parseFloat(item.unitPrice) || 0;
                        const discountPercent = parseFloat(item.discountPercent) || 0;
                        const subtotal = quantity * price;
                        const discountAmount = (subtotal * discountPercent) / 100;
                        discountAmountInput.value = discountAmount.toFixed(2);
                    }
                    
                    const additionPercentInput = lastRow.querySelector('.addition-percent-input');
                    if (additionPercentInput) additionPercentInput.value = item.additionPercent || 0;
                    
                    const additionAmountInput = lastRow.querySelector('.addition-amount-input');
                    if (additionAmountInput) {
                        // If additionPercent exists, calculate from it, otherwise use saved amount
                        if (item.additionPercent && item.additionPercent > 0) {
                            const quantity = parseFloat(item.quantity) || 0;
                            const price = parseFloat(item.unitPrice) || 0;
                            const additionPercent = parseFloat(item.additionPercent) || 0;
                            const subtotal = quantity * price;
                            const additionAmount = (subtotal * additionPercent) / 100;
                            additionAmountInput.value = additionAmount.toFixed(2);
                        } else {
                            additionAmountInput.value = item.additionAmount || 0;
                        }
                    }
                    
                    const expiryDateInput = lastRow.querySelector('.expiry-date-input');
                    if (expiryDateInput && item.expiryDate) expiryDateInput.value = item.expiryDate;
                    
                    const serialNumberInput = lastRow.querySelector('.serial-number-input');
                    if (serialNumberInput && item.serialNumber) serialNumberInput.value = item.serialNumber;
                    
                    const notesInput = lastRow.querySelector('.notes-input');
                    if (notesInput && item.notes) notesInput.value = item.notes;
                    
                    // Calculate and set total
                    this.calculateItemTotal(lastRow);
                }
                
                // ✅ لا نعيد تعيين isPopulatingForm هنا لأن هناك عمليات غير متزامنة أخرى (الخصومات والإضافات)
                // سيتم إعادة تعيينه في نهاية populateDiscountsAdditions أو في setTimeout
                Logger.log('✅ populateItems: Completed populating all items');
            };
            
            populateItems().catch((error) => {
                Logger.error('❌ Error populating items:', error);
                // ✅ إعادة تعيين flag في حالة الخطأ إذا لم تكن هناك خصومات أو إضافات
                // (سيتم إعادة تعيينه في finalizePaymentCalculation إذا كانت هناك خصومات أو إضافات)
                if (!this.editingPurchase.discounts || this.editingPurchase.discounts.length === 0) {
                    if (!this.editingPurchase.additions || this.editingPurchase.additions.length === 0) {
                        this.isPopulatingForm = false;
                        Logger.warn('⚠️ Error in populateItems, resetting isPopulatingForm flag');
                    }
                }
            });
        }
        // ✅ لا نعيد تعيين isPopulatingForm هنا لأن هناك عمليات غير متزامنة (الخصومات والإضافات)

        // Clear existing discount/addition rows
        const discountsAdditionsBody = document.getElementById('discountsAdditionsBody');
        if (discountsAdditionsBody) {
            discountsAdditionsBody.innerHTML = '';
        }

        // Populate discount/addition rows
        if (this.editingPurchase.discountAdditionRows && this.editingPurchase.discountAdditionRows.length > 0) {
            const populateDiscountsAdditions = async () => {
                try {
                    for (const row of this.editingPurchase.discountAdditionRows) {
                    if (row.type === 'discount') {
                        this.addDiscount();
                    } else if (row.type === 'addition') {
                        this.addAddition();
                    }
                    
                    const lastRow = discountsAdditionsBody.lastElementChild;
                    if (lastRow) {
                        // Set type
                        const typeSelect = lastRow.querySelector('.type-select');
                        if (typeSelect) typeSelect.value = row.type;
                        
                        // Set account
                        const accountSelect = lastRow.querySelector('.account-select');
                        const accountNameDisplay = lastRow.querySelector('.account-name-display');
                        if (accountSelect && accountNameDisplay) {
                            accountSelect.value = row.accountId || '';
                            accountNameDisplay.value = row.accountName || '';
                        }
                        
                        // Set counter account
                        const counterAccountSelect = lastRow.querySelector('.counter-account-select');
                        const counterAccountNameDisplay = lastRow.querySelector('.counter-account-name-display');
                        if (counterAccountSelect && counterAccountNameDisplay) {
                            counterAccountSelect.value = row.counterAccountId || '';
                            counterAccountNameDisplay.value = row.counterAccountName || '';
                        }
                        
                        // Set amount
                        const amountInput = lastRow.querySelector('.amount-input');
                        if (amountInput) amountInput.value = row.amount || 0;
                        
                        // Set currency
                        const currencySelect = lastRow.querySelector('.currency-select');
                        if (currencySelect) currencySelect.value = row.currency || 'IQD';
                        
                        // Set notes
                        const notesInput = lastRow.querySelector('.notes-input');
                        if (notesInput) notesInput.value = row.notes || '';
                        
                        // Setup event listeners for the new row
                        this.setupDiscountAdditionListeners(lastRow);
                    }
                }
                
                // ✅ المبلغ المدفوع: آخر حقل يتم تحميله بعد اكتمال جميع البيانات
                const finalizePaymentCalculation = async () => {
                    // ✅ الانتظار حتى تكون البيانات جاهزة (subtotal > 0 أو total > 0)
                    const waitForDataReady = async () => {
                        const subtotalEl = document.getElementById('purchaseSubtotal');
                        const totalEl = document.getElementById('purchaseTotal');
                        
                        for (let i = 0; i < 15; i++) {
                            const subtotal = subtotalEl ? parseFloat(subtotalEl.textContent) || 0 : 0;
                            const total = totalEl ? parseFloat(totalEl.textContent) || 0 : 0;
                            
                            if (subtotal > 0 || total > 0) {
                                return true; // البيانات جاهزة
                            }
                            
                            // إعادة حساب الإجماليات
                            this.calculatePurchaseTotals();
                            await new Promise(resolve => setTimeout(resolve, 100));
                        }
                        
                        return false; // البيانات غير جاهزة بعد 15 محاولة
                    };
                    
                    // الانتظار حتى تكون البيانات جاهزة
                    const dataReady = await waitForDataReady();
                    
                    if (!dataReady) {
                        Logger.warn('⚠️ البيانات لم تكتمل بعد، لكننا نستمر في الحساب');
                    }
                    
                    // إعادة حساب الإجماليات مرة أخيرة للتأكد
                    this.calculatePurchaseTotals();
                    await new Promise(resolve => setTimeout(resolve, 150));
                    
                    // ✅ الآن بعد اكتمال جميع البيانات، نحمّل المبلغ المدفوع (آخر حقل)
                    const paidAmountEl = document.getElementById('purchasePaidAmount');
                    if (paidAmountEl) {
                        const originalPaidAmount = this.editingPurchase.paidAmount || 0;
                        paidAmountEl.value = originalPaidAmount;
                        Logger.log('✅ تم تحميل المبلغ المدفوع (آخر حقل) بعد اكتمال جميع البيانات:', originalPaidAmount);
                    }
                    
                    // تحديث حقول الدفع بعد تحميل المبلغ المدفوع
                    this.updatePaymentFields();
                    
                    // تحديث الحد الأقصى للدفعة (مع الحفاظ على القيمة عند التعديل)
                    if (document.getElementById('purchasePaymentMethod')?.value === 'credit') {
                        await this.updatePaidAmountMax(true);
                    }
                    
                    // حساب المبلغ المتبقي (لن يغير paidAmount أثناء التحميل)
                    await this.calculateRemainingAmount();
                    
                    // التأكد من الحفاظ على القيمة الأصلية
                    if (paidAmountEl) {
                        const currentValue = parseFloat(paidAmountEl.value) || 0;
                        const originalValue = this.editingPurchase.paidAmount || 0;
                        if (Math.abs(currentValue - originalValue) > 0.01) {
                            paidAmountEl.value = originalValue;
                            await this.calculateRemainingAmount();
                        }
                    }
                    
                    // إعادة تعيين flag بعد اكتمال جميع العمليات
                    this.isPopulatingForm = false;
                    Logger.log('✅ populatePurchaseForm: Payment calculations completed - جميع البيانات محملة');
                };
                
                // بدء العملية بعد وقت قصير
                setTimeout(finalizePaymentCalculation, 200);
                } catch (error) {
                    Logger.error('❌ Error populating discounts/additions:', error);
                    // ✅ إعادة تعيين flag في حالة الخطأ
                    this.isPopulatingForm = false;
                }
            };
            
            populateDiscountsAdditions().catch((error) => {
                Logger.error('❌ Error in populateDiscountsAdditions:', error);
                // ✅ إعادة تعيين flag في حالة الخطأ
                this.isPopulatingForm = false;
            });
        } else {
            // إذا لم يكن هناك خصومات أو إضافات، احسب المبلغ المتبقي مباشرة
            // ✅ المبلغ المدفوع: آخر حقل يتم تحميله بعد اكتمال جميع البيانات
            const finalizePaymentCalculation = async () => {
                // ✅ الانتظار حتى تكون البيانات جاهزة (subtotal > 0 أو total > 0)
                const waitForDataReady = async () => {
                    const subtotalEl = document.getElementById('purchaseSubtotal');
                    const totalEl = document.getElementById('purchaseTotal');
                    
                    for (let i = 0; i < 15; i++) {
                        const subtotal = subtotalEl ? parseFloat(subtotalEl.textContent) || 0 : 0;
                        const total = totalEl ? parseFloat(totalEl.textContent) || 0 : 0;
                        
                        if (subtotal > 0 || total > 0) {
                            return true; // البيانات جاهزة
                        }
                        
                        // إعادة حساب الإجماليات
                        this.calculatePurchaseTotals();
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    
                    return false; // البيانات غير جاهزة بعد 15 محاولة
                };
                
                // الانتظار حتى تكون البيانات جاهزة
                const dataReady = await waitForDataReady();
                
                if (!dataReady) {
                    Logger.warn('⚠️ البيانات لم تكتمل بعد، لكننا نستمر في الحساب');
                }
                
                // إعادة حساب الإجماليات مرة أخيرة للتأكد
                this.calculatePurchaseTotals();
                await new Promise(resolve => setTimeout(resolve, 150));
                
                // ✅ الآن بعد اكتمال جميع البيانات، نحمّل المبلغ المدفوع (آخر حقل)
                const paidAmountEl = document.getElementById('purchasePaidAmount');
                if (paidAmountEl) {
                    const originalPaidAmount = this.editingPurchase.paidAmount || 0;
                    paidAmountEl.value = originalPaidAmount;
                    Logger.log('✅ تم تحميل المبلغ المدفوع (آخر حقل) بعد اكتمال جميع البيانات:', originalPaidAmount);
                }
                
                // تحديث حقول الدفع بعد تحميل المبلغ المدفوع
                this.updatePaymentFields();
                
                // تحديث الحد الأقصى للدفعة (مع الحفاظ على القيمة عند التعديل)
                if (document.getElementById('purchasePaymentMethod')?.value === 'credit') {
                    await this.updatePaidAmountMax(true);
                }
                
                // حساب المبلغ المتبقي (لن يغير paidAmount أثناء التحميل)
                await this.calculateRemainingAmount();
                
                // التأكد من الحفاظ على القيمة الأصلية
                if (paidAmountEl) {
                    const currentValue = parseFloat(paidAmountEl.value) || 0;
                    const originalValue = this.editingPurchase.paidAmount || 0;
                    if (Math.abs(currentValue - originalValue) > 0.01) {
                        paidAmountEl.value = originalValue;
                        await this.calculateRemainingAmount();
                    }
                }
                
                // إعادة تعيين flag بعد اكتمال جميع العمليات
                this.isPopulatingForm = false;
                Logger.log('✅ populatePurchaseForm: Completed (no discounts/additions) - جميع البيانات محملة');
            };
            
            // بدء العملية بعد وقت قصير
            setTimeout(finalizePaymentCalculation, 200);
        }
        
        // Log completion for synchronous parts
        if (!this.editingPurchase.items || this.editingPurchase.items.length === 0) {
            Logger.log('✅ populatePurchaseForm: Header fields populated (no items)');
        } else {
            Logger.log('📝 populatePurchaseForm: Header fields populated, items will be populated asynchronously');
        }
    },

    /**
     * Delete purchase
     * ✅ Improved with better rollback mechanism and error handling
     */
    async deletePurchase(purchaseId) {
        const rollbackActions = []; // Store rollback functions
        let supplierBalanceReversed = false;
        let inventoryReversed = false;
        let movementsDeleted = false;
        let generalEntryDeleted = false;
        
        try {
            const result = await Swal.fire({
                title: 'هل أنت متأكد؟',
                text: 'لن تتمكن من التراجع عن هذا الإجراء! سيتم حذف الفاتورة والقيد المحاسبي المرتبط بها.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'نعم، احذف!',
                cancelButtonText: 'إلغاء'
            });

            if (result.isConfirmed) {
                showLoading();
                
                // ✅ Get purchase data before deletion to reverse inventory changes
                let purchaseData = null;
                try {
                    purchaseData = await Collections.getPurchase(purchaseId);
                    if (!purchaseData) {
                        throw new Error('فاتورة الشراء غير موجودة');
                    }
                } catch (error) {
                    Logger.error('❌ خطأ في جلب بيانات الفاتورة:', error);
                    hideLoading();
                    throw new Error(`فشل في جلب بيانات الفاتورة: ${error.message}`);
                }
                
                // ✅ Step 1: Reverse supplier balance FIRST (before any deletions)
                if (purchaseData && purchaseData.supplierId) {
                    try {
                        await this.updateSupplierBalance(purchaseData, 'subtract');
                        supplierBalanceReversed = true;
                        
                        // Add rollback action
                        rollbackActions.push(async () => {
                            try {
                                Logger.log('🔄 Rolling back supplier balance reversal...');
                                await this.updateSupplierBalance(purchaseData, 'add');
                            } catch (rollbackError) {
                                Logger.error('❌ Error rolling back supplier balance:', rollbackError);
                            }
                        });
                        
                        Logger.log('✅ Reversed supplier balance for deleted purchase');
                    } catch (error) {
                        Logger.error('❌ خطأ في عكس رصيد المورد:', error);
                        hideLoading();
                        throw new Error(`فشل في عكس رصيد المورد: ${error.message}`);
                    }
                }
                
                // Reverse inventory changes (subtract quantities from warehouse) before deleting movements
                if (purchaseData && purchaseData.items) {
                    try {
                        const settings = await this.getSettings();
                        if (settings.autoUpdateStock) {
                            Logger.log('📦 Reversing inventory changes for deleted purchase:', purchaseData.invoiceNo);
                            
                            for (const item of purchaseData.items) {
                                // Get product to check unit conversion
                                const product = await Collections.getProduct(item.productId);
                                if (!product || !product.unitId) {
                                    console.warn(`⚠️ Product ${item.productId} not found or has no main unit, skipping inventory reversal`);
                                    continue;
                                }
                                
                                // Convert quantity to main unit if needed
                                const quantityInMainUnit = InvoiceUtils.convertToMainUnit(item.quantity, item.unitId, product);
                                
                                // ⚠️ CRITICAL: Check if enough stock is available before subtracting
                                const warehouseId = purchaseData.warehouseId || 'default';
                                const currentStock = await Collections.getProductWarehouseStock(item.productId);
                                const stockInWarehouse = currentStock?.[warehouseId] || 0;
                                
                                // Check if product requires serial/expiry tracking
                                const hasExpiry = product.hasExpiryDate || false;
                                const hasSerial = product.hasSerialNumber || false;
                                
                                if (hasExpiry || hasSerial) {
                                    // For products with expiry/serial tracking, check specific quantities
                                    const availableItems = await Collections.getAvailableInventoryItems(
                                        item.productId,
                                        warehouseId
                                    );
                                    
                                    let availableQuantity = 0;
                                    
                                    if (hasExpiry && hasSerial && item.expiryDate && item.serialNumber) {
                                        // Both expiry and serial: find exact match
                                        const matchingItem = availableItems.find(availItem => 
                                            availItem.expiryDate === item.expiryDate && 
                                            availItem.serialNumber === item.serialNumber
                                        );
                                        availableQuantity = matchingItem?.quantity || 0;
                                    } else if (hasExpiry && item.expiryDate) {
                                        // Only expiry: find by expiry date
                                        const matchingItems = availableItems.filter(availItem => 
                                            availItem.expiryDate === item.expiryDate
                                        );
                                        availableQuantity = matchingItems.reduce((sum, availItem) => sum + (availItem.quantity || 0), 0);
                                    } else if (hasSerial && item.serialNumber) {
                                        // Only serial: find by serial number
                                        const matchingItems = availableItems.filter(availItem => 
                                            availItem.serialNumber === item.serialNumber
                                        );
                                        availableQuantity = matchingItems.reduce((sum, availItem) => sum + (availItem.quantity || 0), 0);
                                    } else {
                                        // No tracking info in item, use total stock
                                        availableQuantity = stockInWarehouse;
                                    }
                                    
                                    if (availableQuantity < quantityInMainUnit) {
                                        const errorMsg = `⚠️ لا يمكن حذف الفاتورة: الكمية المتاحة (${availableQuantity}) أقل من الكمية المشتراة (${quantityInMainUnit}) للمنتج ${product.name}${item.expiryDate ? ` بتاريخ صلاحية ${item.expiryDate}` : ''}${item.serialNumber ? ` برقم تسلسلي ${item.serialNumber}` : ''}. قد يكون المنتج تم بيعه أو إرجاعه.`;
                                        console.error(errorMsg);
                                        
                                        // Show error to user and stop deletion
                                        hideLoading();
                                        if (typeof showError === 'function') {
                                            showError(errorMsg);
                                        } else if (typeof Swal !== 'undefined') {
                                            await Swal.fire({
                                                title: 'خطأ في الحذف',
                                                text: errorMsg,
                                                icon: 'error',
                                                confirmButtonText: 'حسناً'
                                            });
                                        }
                                        return; // Stop deletion
                                    }
                                } else {
                                    // For products without expiry/serial tracking, check total stock
                                    if (stockInWarehouse < quantityInMainUnit) {
                                        console.warn(`⚠️ الرصيد الحالي (${stockInWarehouse}) أقل من الكمية المشتراة (${quantityInMainUnit}) للمنتج ${product.name}. سيتم التحقق من الحركات المرتبطة قبل منع الحذف.`);

                                        // ✅ منطق محسّن:
                                        // بدلاً من منع الحذف مباشرةً، نفحص ما إذا كانت هناك حركات مخزون أخرى (مبيعات / مرتجعات / حركات يدوية)
                                        // مرتبطة بهذا المنتج في هذا المستودع غير حركة الشراء الحالية.
                                        // إذا لم توجد حركات أخرى، نسمح بالحذف حتى لو كان الرصيد أقل من الكمية المشتراة،
                                        // لأن الخلل هنا غالباً من تعديل يدوي أو خلل قديم في الرصيد.

                                        try {
                                            const movementsSnapshot = await db.collection('inventoryMovements')
                                                .where('productId', '==', item.productId)
                                                .where('warehouseId', '==', warehouseId)
                                                .get();

                                            let hasDependentMovements = false;
                                            movementsSnapshot.forEach(doc => {
                                                const movement = doc.data();
                                                const movementSourceId = movement.sourceId ? String(movement.sourceId) : null;
                                                const purchaseIdStr = String(purchaseId);

                                                // نعتبر الحركة "تابعة" إذا لم تكن من نفس فاتورة الشراء هذه
                                                // أو إذا كان نوع المصدر مختلفاً عن "purchase"
                                                if (movement.sourceType !== 'purchase' || movementSourceId !== purchaseIdStr) {
                                                    hasDependentMovements = true;
                                                }
                                            });

                                            if (hasDependentMovements) {
                                                const errorMsg = `⚠️ لا يمكن حذف الفاتورة: الرصيد الحالي (${stockInWarehouse}) أقل من الكمية المشتراة (${quantityInMainUnit}) للمنتج ${product.name}، وهناك حركات مخزون أخرى (مثل مبيعات أو مرتجعات) مرتبطة بهذا المنتج في هذا المستودع.`;
                                                console.error(errorMsg);
                                                
                                                // Show error to user and stop deletion
                                                hideLoading();
                                                if (typeof showError === 'function') {
                                                    showError(errorMsg);
                                                } else if (typeof Swal !== 'undefined') {
                                                    await Swal.fire({
                                                        title: 'خطأ في الحذف',
                                                        text: errorMsg,
                                                        icon: 'error',
                                                        confirmButtonText: 'حسناً'
                                                    });
                                                }
                                                return; // Stop deletion
                                            } else {
                                                Logger.warn('⚠️ لا توجد حركات مخزون أخرى مرتبطة بهذا المنتج في هذا المستودع، سيتم السماح بحذف الفاتورة رغم اختلاف الرصيد.');
                                                // نسمح بالاستمرار في الحذف بدون إرجاع
                                            }
                                        } catch (movementError) {
                                            Logger.error('❌ خطأ أثناء التحقق من حركات المخزون قبل الحذف:', movementError);
                                            const errorMsg = `⚠️ لا يمكن حذف الفاتورة حالياً بسبب خطأ أثناء التحقق من حركات المخزون: ${movementError.message}`;
                                            
                                            hideLoading();
                                            if (typeof showError === 'function') {
                                                showError(errorMsg);
                                            } else if (typeof Swal !== 'undefined') {
                                                await Swal.fire({
                                                    title: 'خطأ في الحذف',
                                                    text: errorMsg,
                                                    icon: 'error',
                                                    confirmButtonText: 'حسناً'
                                                });
                                            }
                                            return; // Stop deletion on error
                                        }
                                    }
                                }
                                
                                // Safe to subtract
                                await Collections.updateProductWarehouseStock(
                                    item.productId,
                                    warehouseId,
                                    quantityInMainUnit,
                                    'subtract'
                                );
                                
                                Logger.log(`➖ Reversed ${quantityInMainUnit} ${product.unitId} from warehouse ${warehouseId} for product ${item.productId}`);
                            }
                            
                            inventoryReversed = true;
                            
                            // Add rollback action to restore inventory
                            rollbackActions.push(async () => {
                                try {
                                    Logger.log('🔄 Rolling back inventory reversal...');
                                    for (const item of purchaseData.items) {
                                        const product = await Collections.getProduct(item.productId);
                                        if (!product || !product.unitId) continue;
                                        
                                        const quantityInMainUnit = InvoiceUtils.convertToMainUnit(item.quantity, item.unitId, product);
                                        const warehouseId = purchaseData.warehouseId || 'default';
                                        
                                        await Collections.updateProductWarehouseStock(
                                            item.productId,
                                            warehouseId,
                                            quantityInMainUnit,
                                            'add'
                                        );
                                    }
                                } catch (rollbackError) {
                                    Logger.error('❌ Error rolling back inventory:', rollbackError);
                                }
                            });
                            
                            Logger.log('✅ Inventory reversed successfully for deleted purchase');
                        } else {
                            Logger.log('ℹ️ Auto-update stock is disabled, skipping inventory reversal');
                        }
                    } catch (error) {
                        Logger.error('❌ خطأ في عكس تغييرات المخزون:', error);
                        // Rollback supplier balance if inventory reversal fails
                        if (supplierBalanceReversed) {
                            try {
                                await this.updateSupplierBalance(purchaseData, 'add');
                            } catch (rollbackError) {
                                Logger.error('❌ Error rolling back supplier balance:', rollbackError);
                            }
                        }
                        hideLoading();
                        if (typeof showError === 'function') {
                            showError('خطأ في عكس تغييرات المخزون: ' + error.message);
                        } else if (typeof Swal !== 'undefined') {
                            await Swal.fire({
                                title: 'خطأ في الحذف',
                                text: 'خطأ في عكس تغييرات المخزون: ' + error.message,
                                icon: 'error',
                                confirmButtonText: 'حسناً'
                            });
                        }
                        throw error; // Re-throw to trigger catch block
                    }
                }
                
                // ✅ Step 3: Delete inventory movements after reversing stock changes
                try {
                    const deletedMovements = await this.deleteInventoryMovementsBySource('purchase', purchaseId);
                    if (deletedMovements > 0) {
                        movementsDeleted = true;
                        Logger.log(`✅ تم حذف ${deletedMovements} حركة مخزون مرتبطة بالفاتورة`);
                    }
                    
                    // ✅ إعادة حساب رصيد المنتجات من inventoryMovements بعد حذف الحركات
                    // هذا يضمن أن warehouseStock دقيق حتى بعد حذف الفاتورة
                    if (purchaseData && purchaseData.items) {
                        const uniqueProductIds = [...new Set(purchaseData.items.map(item => item.productId))];
                        for (const productId of uniqueProductIds) {
                            try {
                                await Collections.recalculateProductWarehouseStock(productId);
                                Logger.log(`✅ تم إعادة حساب رصيد المنتج ${productId} من inventoryMovements`);
                            } catch (recalcError) {
                                console.error(`❌ خطأ في إعادة حساب رصيد المنتج ${productId}:`, recalcError);
                                // Continue with other products even if one fails
                            }
                        }
                    }
                } catch (error) {
                    Logger.error('❌ خطأ في حذف حركات المخزون:', error);
                    // Rollback previous changes
                    for (const rollbackAction of rollbackActions.reverse()) {
                        await rollbackAction();
                    }
                    hideLoading();
                    throw new Error(`فشل في حذف حركات المخزون: ${error.message}`);
                }

                // ✅ Step 4: Delete associated general entry - حذف القيد العام المتولد عن الفاتورة
                let generalEntryError = null;
                try {
                    const deletedCount = await this.deleteGeneralEntryBySourceId(purchaseId);
                    if (deletedCount > 0) {
                        generalEntryDeleted = true;
                        Logger.log(`✅ تم حذف ${deletedCount} قيد محاسبي مرتبط بالفاتورة`);
                    } else {
                        Logger.log('ℹ️ لا يوجد قيد محاسبي مرتبط بهذه الفاتورة');
                    }
                } catch (error) {
                    generalEntryError = error;
                    Logger.error('❌ خطأ في حذف القيد المحاسبي:', error);
                    // Log but don't fail deletion - general entry can be deleted manually
                    Logger.warn('⚠️ تمت عمليات الحذف الأخرى بنجاح، لكن حدث خطأ في حذف القيد المحاسبي');
                }
                
                // ✅ Step 5: Delete the purchase (last step)
                try {
                    await Collections.deletePurchase(purchaseId);
                    Logger.log('✅ تم حذف الفاتورة بنجاح');
                } catch (error) {
                    Logger.error('❌ خطأ في حذف الفاتورة:', error);
                    // Rollback all previous changes
                    for (const rollbackAction of rollbackActions.reverse()) {
                        await rollbackAction();
                    }
                    hideLoading();
                    throw new Error(`فشل في حذف الفاتورة: ${error.message}`);
                }
                
                // Show appropriate success message
                if (generalEntryDeleted) {
                    if (typeof showSuccess === 'function') {
                        showSuccess('تم حذف فاتورة الشراء والقيد المحاسبي المرتبط بها بنجاح');
                    } else {
                        Logger.log('✅ تم حذف فاتورة الشراء والقيد المحاسبي المرتبط بها بنجاح');
                    }
                } else if (generalEntryError) {
                    if (typeof showSuccess === 'function') {
                        showSuccess('تم حذف فاتورة الشراء، لكن حدث خطأ في حذف القيد المحاسبي. يرجى التحقق يدوياً.');
                    } else {
                        Logger.warn('⚠️ تم حذف فاتورة الشراء، لكن حدث خطأ في حذف القيد المحاسبي');
                    }
                } else {
                    if (typeof showSuccess === 'function') {
                        showSuccess('تم حذف فاتورة الشراء بنجاح');
                    } else {
                        Logger.log('✅ تم حذف فاتورة الشراء بنجاح');
                    }
                }
                
                await this.loadPurchases();
                this.updateDashboard();
                
                // Reload vouchers list if VouchersModule is available to reflect the deletion
                if (typeof VouchersModule !== 'undefined' && VouchersModule.loadVouchers) {
                    try {
                        await VouchersModule.loadVouchers();
                        Logger.log('✅ تم تحديث قائمة السندات بعد حذف القيد المحاسبي');
                    } catch (reloadError) {
                        Logger.warn('⚠️ خطأ في تحديث قائمة السندات:', reloadError);
                    }
                }
                
                hideLoading();
            }
        } catch (error) {
            console.error('❌ Error deleting purchase:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            // ✅ Execute rollback actions in reverse order
            if (rollbackActions.length > 0) {
                Logger.log(`🔄 Executing ${rollbackActions.length} rollback actions...`);
                try {
                    for (const rollbackAction of rollbackActions.reverse()) {
                        await rollbackAction();
                    }
                    Logger.log('✅ Rollback completed');
                } catch (rollbackError) {
                    Logger.error('❌ Error during rollback:', rollbackError);
                    Logger.error('⚠️ Some rollback actions may have failed. Please check the data manually.');
                }
            }
            
            // Ensure loading is hidden
            try {
                hideLoading();
            } catch (e) {
                Logger.warn('⚠️ Error hiding loading:', e);
            }
            
            // Show error to user
            const errorMessage = error.message || 'خطأ غير معروف';
            if (typeof showError === 'function') {
                showError('فشل في حذف فاتورة الشراء: ' + errorMessage);
            } else if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'خطأ في الحذف',
                    text: 'فشل في حذف فاتورة الشراء: ' + errorMessage,
                    icon: 'error',
                    confirmButtonText: 'حسناً'
                });
            } else {
                Logger.error('❌ فشل في حذف فاتورة الشراء:', errorMessage);
            }
        }
    },

    /**
     * Reverse inventory changes for a purchase (used for rollback)
     * @param {Object} purchaseData - Purchase data
     */
    async reverseInventoryChangesForPurchase(purchaseData) {
        try {
            Logger.log('🔄 Reversing inventory changes for purchase:', purchaseData.invoiceNo || purchaseData.id);
            
            if (!purchaseData.items || purchaseData.items.length === 0) {
                return;
            }
            
            const settings = await this.getSettings();
            if (!settings.autoUpdateStock) {
                return;
            }
            
            const warehouseId = purchaseData.warehouseId || 'default';
            
            for (const item of purchaseData.items) {
                const product = await Collections.getProduct(item.productId);
                if (!product || !product.unitId) {
                    continue;
                }
                
                const quantityInMainUnit = this.convertToMainUnit(item.quantity, item.unitId, product);
                
                // Subtract the quantity that was added
                await Collections.updateProductWarehouseStock(
                    item.productId,
                    warehouseId,
                    quantityInMainUnit,
                    'subtract'
                );
                
                Logger.log(`➖ Reversed ${quantityInMainUnit} from warehouse ${warehouseId} for product ${item.productId}`);
            }
            
            // Delete inventory movements
            if (purchaseData.id) {
                await this.deleteInventoryMovementsBySource('purchase', purchaseData.id);
            }
            
            Logger.log('✅ Inventory changes reversed successfully');
        } catch (error) {
            console.error('❌ Error reversing inventory changes:', error);
            throw error;
        }
    },

    /**
     * Update inventory after purchase
     */
    async updateInventory(purchaseData) {
        try {
            Logger.log('📦 Updating inventory for purchase:', purchaseData.invoiceNo);
            
            // Check if auto-update stock is enabled
            const settings = await this.getSettings();
            if (!settings.autoUpdateStock) {
                Logger.log('ℹ️ Auto-update stock is disabled, skipping inventory update');
                return;
            }
            
            for (const item of purchaseData.items) {
                // Get product to check unit conversion
                const product = await Collections.getProduct(item.productId);
                if (!product) {
                    console.warn(`⚠️ Product ${item.productId} not found, skipping inventory update`);
                    continue;
                }
                
                // Validate product has main unit
                if (!product.unitId) {
                    console.warn(`⚠️ Product ${product.name || item.productId} does not have a main unit, skipping inventory update`);
                    continue;
                }
                
                // Convert quantity to main unit if needed
                const quantityInMainUnit = this.convertToMainUnit(item.quantity, item.unitId, product);
                if (item.unitId && item.unitId !== product.unitId) {
                    Logger.log(`🔄 Converting ${item.quantity} ${item.unitId} to ${quantityInMainUnit} ${product.unitId}`);
                }
                
                // Get current stock before update
                const currentStock = await Collections.getProductWarehouseStock(item.productId);
                const stockInWarehouse = currentStock?.[purchaseData.warehouseId || 'default'] || 0;
                const previousQuantity = stockInWarehouse;
                const newQuantity = previousQuantity + quantityInMainUnit;
                
                // Update product stock (always in main unit)
                await Collections.updateProductWarehouseStock(
                    item.productId,
                    purchaseData.warehouseId || 'default',
                    quantityInMainUnit,
                    'add'
                );
                
                // Record inventory movement
                const warehouse = await Collections.getWarehouse(purchaseData.warehouseId || 'default');
                const warehouseName = warehouse?.name || 'المستودع الافتراضي';
                
                // Use net price for inventory cost calculation (صافي السعر مهم للمخزون)
                // If netPrice is not available, calculate it from unitPrice, discount, and addition
                let netPrice = item.netPrice;
                if (!netPrice && item.unitPrice) {
                    const quantity = item.quantity || 1;
                    const discountPerUnit = (item.discountAmount || 0) / quantity;
                    const additionPerUnit = (item.additionAmount || 0) / quantity;
                    netPrice = item.unitPrice - discountPerUnit + additionPerUnit;
                    netPrice = Math.max(0, netPrice); // Ensure non-negative
                }
                // Fallback to unitPrice if netPrice is still not available
                const costPrice = netPrice || item.unitPrice || 0;
                
                const movementRecord = {
                    type: 'in',
                    productId: item.productId,
                    productName: product.name,
                    warehouseId: purchaseData.warehouseId || 'default',
                    warehouseName: warehouseName,
                    toWarehouseId: null,
                    toWarehouseName: null,
                    unitId: item.unitId || product.unitId,
                    quantity: quantityInMainUnit,
                    quantityInMainUnit: quantityInMainUnit,
                    expiryDate: item.expiryDate || null,
                    serialNumber: item.serialNumber || null,
                    unitPrice: costPrice, // Use net price (صافي السعر) for inventory cost
                    totalCost: costPrice * quantityInMainUnit,
                    previousQuantity: previousQuantity,
                    newQuantity: newQuantity,
                    reference: purchaseData.invoiceNo || `فاتورة شراء ${purchaseData.id || ''}`,
                    notes: `فاتورة شراء - ${purchaseData.supplierName || ''}`,
                    date: purchaseData.date ? new Date(purchaseData.date) : new Date(),
                    userId: auth.currentUser?.uid || 'system',
                    createdAt: new Date(),
                    sourceType: 'purchase',
                    sourceId: purchaseData.id || null
                };
                
                // ✅ Validate movement before saving
                if (typeof InventoryMovementValidator !== 'undefined' && InventoryMovementValidator) {
                    const validation = InventoryMovementValidator.validateMovement(movementRecord, product);
                    if (!validation.isValid) {
                        const errorMsg = `خطأ في حركة المخزون: ${validation.errors.join(', ')}`;
                        Logger.error('❌', errorMsg);
                        throw new Error(errorMsg);
                    }
                    if (validation.warnings.length > 0) {
                        Logger.warn('⚠️ تحذيرات في حركة المخزون:', validation.warnings);
                    }
                }
                
                await db.collection('inventoryMovements').add(movementRecord);
                Logger.log(`📝 Inventory movement recorded for purchase: ${item.productName}`);
                
                // Update product purchase price if needed (use net price for cost)
                if (costPrice > 0) {
                    // Convert unit price to main unit price if needed
                    let priceInMainUnit = costPrice;
                    if (item.unitId && item.unitId !== product.unitId) {
                        const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
                        const conversionFactor = parseFloat(subUnit?.conversionValue || subUnit?.conversionFactor) || 0;
                        if (subUnit && conversionFactor > 0) {
                            // Convert price based on conversion type
                            const conversionType = subUnit.conversionType || 'multiply';
                            if (conversionType === 'multiply') {
                                // If sub-unit is larger (e.g., box = 12 pieces)
                                // Price per main unit = price per sub-unit / conversion factor
                                // Example: 120 IQD per box / 12 = 10 IQD per piece
                                priceInMainUnit = costPrice / conversionFactor;
                            } else if (conversionType === 'divide') {
                                // If sub-unit is smaller (e.g., kg vs ton)
                                // Price per main unit = price per sub-unit * conversion factor
                                // Example: 1000 IQD per kg * 1000 = 1,000,000 IQD per ton
                                priceInMainUnit = costPrice * conversionFactor;
                            } else {
                                // Default to divide for backward compatibility
                                priceInMainUnit = costPrice / conversionFactor;
                            }
                        }
                    }
                    
                    // Update purchase price if it's higher (better deal)
                    if (!product.purchasePrice || priceInMainUnit > product.purchasePrice) {
                        await Collections.updateProduct(item.productId, {
                            purchasePrice: priceInMainUnit
                        });
                    }
                }
            }
            
            Logger.log('✅ Inventory updated successfully');
            
        } catch (error) {
            console.error('❌ Error updating inventory:', error);
            // Don't throw error to avoid breaking the purchase flow
            // Just log it for debugging
        }
    },


    /**
     * Update inventory when editing a purchase (subtract old quantities, add new quantities)
     */
    async updateInventoryOnEdit(oldPurchaseData, newPurchaseData) {
        try {
            Logger.log('📦 Updating inventory for edited purchase:', newPurchaseData.invoiceNo);
            
            // Validate input data
            if (!oldPurchaseData || !newPurchaseData) {
                throw new Error('بيانات الفاتورة غير صحيحة');
            }
            
            if (!oldPurchaseData.id && !newPurchaseData.id) {
                throw new Error('معرف فاتورة الشراء غير موجود');
            }
            
            // Check if auto-update stock is enabled
            const settings = await this.getSettings();
            if (!settings.autoUpdateStock) {
                Logger.log('ℹ️ Auto-update stock is disabled, skipping inventory update');
                return;
            }
            
            // Delete old inventory movements before updating stock
            // This ensures we don't have duplicate movements for the same purchase
            try {
                const purchaseId = String(oldPurchaseData.id || newPurchaseData.id);
                if (!purchaseId || purchaseId === 'undefined' || purchaseId === 'null') {
                    throw new Error('معرف فاتورة الشراء غير صالح');
                }
                const deletedMovements = await this.deleteInventoryMovementsBySource('purchase', purchaseId);
                if (deletedMovements > 0) {
                    Logger.log(`✅ تم حذف ${deletedMovements} حركة مخزون قديمة قبل التحديث`);
                }
            } catch (error) {
                Logger.error('❌ خطأ في حذف حركات المخزون القديمة:', error);
                // Continue with inventory update even if movement deletion fails
            }
            
            const oldItemsMap = new Map();
            const newItemsMap = new Map();
            
            // Create maps for old and new items by productId and unitId for comparison
            if (oldPurchaseData.items) {
                oldPurchaseData.items.forEach(item => {
                    const key = `${item.productId}_${item.unitId || 'default'}`;
                    oldItemsMap.set(key, item);
                });
            }
            
            if (newPurchaseData.items) {
                newPurchaseData.items.forEach(item => {
                    const key = `${item.productId}_${item.unitId || 'default'}`;
                    newItemsMap.set(key, item);
                });
            }
            
            // Get warehouse IDs (old and new)
            const oldWarehouseId = oldPurchaseData.warehouseId || 'default';
            const newWarehouseId = newPurchaseData.warehouseId || 'default';
            
            // Process all items (old and new) to handle additions, removals, and changes
            const allProductKeys = new Set([...oldItemsMap.keys(), ...newItemsMap.keys()]);
            
            for (const key of allProductKeys) {
                const oldItem = oldItemsMap.get(key);
                const newItem = newItemsMap.get(key);
                
                // Get product to check unit conversion
                const productId = newItem?.productId || oldItem?.productId;
                if (!productId) continue;
                
                const product = await Collections.getProduct(productId);
                if (!product) {
                    console.warn(`⚠️ Product ${productId} not found, skipping inventory update`);
                    continue;
                }
                
                // Validate product has main unit
                if (!product.unitId) {
                    console.warn(`⚠️ Product ${product.name || productId} does not have a main unit, skipping inventory update`);
                    continue;
                }
                
                // Calculate old quantity in main unit using helper function
                const oldQuantityInMainUnit = oldItem ? 
                    InvoiceUtils.convertToMainUnit(oldItem.quantity, oldItem.unitId, product) : 0;
                
                // Calculate new quantity in main unit using helper function
                const newQuantityInMainUnit = newItem ? 
                    InvoiceUtils.convertToMainUnit(newItem.quantity, newItem.unitId, product) : 0;
                
                // Calculate difference
                const quantityDifference = newQuantityInMainUnit - oldQuantityInMainUnit;
                
                // If warehouse changed, subtract from old warehouse and add to new warehouse
                if (oldWarehouseId !== newWarehouseId) {
                    // Subtract old quantity from old warehouse
                    if (oldQuantityInMainUnit > 0) {
                        // ⚠️ CRITICAL: Check if enough stock is available before subtracting
                        const currentStock = await Collections.getProductWarehouseStock(productId);
                        const stockInOldWarehouse = currentStock?.[oldWarehouseId] || 0;
                        
                        // Check if product requires serial/expiry tracking
                        const hasExpiry = product.hasExpiryDate || false;
                        const hasSerial = product.hasSerialNumber || false;
                        
                        if (hasExpiry || hasSerial) {
                            // For products with expiry/serial tracking, check specific quantities
                            const availableItems = await Collections.getAvailableInventoryItems(
                                productId,
                                oldWarehouseId
                            );
                            
                            let availableQuantity = 0;
                            
                            if (hasExpiry && hasSerial && oldItem.expiryDate && oldItem.serialNumber) {
                                // Both expiry and serial: find exact match
                                const matchingItem = availableItems.find(availItem => 
                                    availItem.expiryDate === oldItem.expiryDate && 
                                    availItem.serialNumber === oldItem.serialNumber
                                );
                                availableQuantity = matchingItem?.quantity || 0;
                            } else if (hasExpiry && oldItem.expiryDate) {
                                // Only expiry: find by expiry date
                                const matchingItems = availableItems.filter(availItem => 
                                    availItem.expiryDate === oldItem.expiryDate
                                );
                                availableQuantity = matchingItems.reduce((sum, availItem) => sum + (availItem.quantity || 0), 0);
                            } else if (hasSerial && oldItem.serialNumber) {
                                // Only serial: find by serial number
                                const matchingItems = availableItems.filter(availItem => 
                                    availItem.serialNumber === oldItem.serialNumber
                                );
                                availableQuantity = matchingItems.reduce((sum, availItem) => sum + (availItem.quantity || 0), 0);
                            } else {
                                // No tracking info in old item, use total stock
                                availableQuantity = stockInOldWarehouse;
                            }
                            
                            if (availableQuantity < oldQuantityInMainUnit) {
                                const errorMsg = `⚠️ لا يمكن تعديل الفاتورة: الكمية المتاحة (${availableQuantity}) أقل من الكمية القديمة (${oldQuantityInMainUnit}) للمنتج ${product.name} في المستودع ${oldWarehouseId}${oldItem.expiryDate ? ` بتاريخ صلاحية ${oldItem.expiryDate}` : ''}${oldItem.serialNumber ? ` برقم تسلسلي ${oldItem.serialNumber}` : ''}`;
                                console.error(errorMsg);
                                throw new Error(errorMsg);
                            }
                        } else {
                            // For products without expiry/serial tracking, check total stock
                            if (stockInOldWarehouse < oldQuantityInMainUnit) {
                                const errorMsg = `⚠️ لا يمكن تعديل الفاتورة: الرصيد الحالي (${stockInOldWarehouse}) أقل من الكمية القديمة (${oldQuantityInMainUnit}) للمنتج ${product.name} في المستودع ${oldWarehouseId}`;
                                console.error(errorMsg);
                                throw new Error(errorMsg);
                            }
                        }
                        
                        // Safe to subtract
                        await Collections.updateProductWarehouseStock(
                            productId,
                            oldWarehouseId,
                            oldQuantityInMainUnit,
                            'subtract'
                        );
                        Logger.log(`➖ Subtracted ${oldQuantityInMainUnit} from warehouse ${oldWarehouseId} for product ${productId}`);
                    }
                    
                    // Add new quantity to new warehouse
                    if (newQuantityInMainUnit > 0) {
                        await Collections.updateProductWarehouseStock(
                            productId,
                            newWarehouseId,
                            newQuantityInMainUnit,
                            'add'
                        );
                        Logger.log(`➕ Added ${newQuantityInMainUnit} to warehouse ${newWarehouseId} for product ${productId}`);
                    }
                } else {
                    // Same warehouse: just adjust by the difference
                    if (quantityDifference !== 0) {
                        if (quantityDifference > 0) {
                            // Quantity increased: add the difference
                            await Collections.updateProductWarehouseStock(
                                productId,
                                newWarehouseId,
                                quantityDifference,
                                'add'
                            );
                            Logger.log(`➕ Added ${quantityDifference} to warehouse ${newWarehouseId} for product ${productId}`);
                        } else {
                            // Quantity decreased: subtract the difference
                            // ⚠️ CRITICAL: Check if enough stock is available before subtracting
                            const currentStock = await Collections.getProductWarehouseStock(productId);
                            const stockInWarehouse = currentStock?.[newWarehouseId] || 0;
                            const quantityToSubtract = Math.abs(quantityDifference);
                            
                            // Check if product requires serial/expiry tracking
                            const hasExpiry = product.hasExpiryDate || false;
                            const hasSerial = product.hasSerialNumber || false;
                            
                            if (hasExpiry || hasSerial) {
                                // For products with expiry/serial tracking, check specific quantities
                                // Get available inventory items for this product
                                const availableItems = await Collections.getAvailableInventoryItems(
                                    productId,
                                    newWarehouseId
                                );
                                
                                // Check if we have enough of the specific items being edited/deleted
                                if (oldItem) {
                                    let availableQuantity = 0;
                                    
                                    if (hasExpiry && hasSerial && oldItem.expiryDate && oldItem.serialNumber) {
                                        // Both expiry and serial: find exact match
                                        const matchingItem = availableItems.find(item => 
                                            item.expiryDate === oldItem.expiryDate && 
                                            item.serialNumber === oldItem.serialNumber
                                        );
                                        availableQuantity = matchingItem?.quantity || 0;
                                    } else if (hasExpiry && oldItem.expiryDate) {
                                        // Only expiry: find by expiry date
                                        const matchingItems = availableItems.filter(item => 
                                            item.expiryDate === oldItem.expiryDate
                                        );
                                        availableQuantity = matchingItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
                                    } else if (hasSerial && oldItem.serialNumber) {
                                        // Only serial: find by serial number
                                        const matchingItems = availableItems.filter(item => 
                                            item.serialNumber === oldItem.serialNumber
                                        );
                                        availableQuantity = matchingItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
                                    } else {
                                        // No tracking info in old item, use total stock
                                        availableQuantity = stockInWarehouse;
                                    }
                                    
                                    // Convert old quantity to main unit for comparison
                                    const oldQuantityInMainUnit = InvoiceUtils.convertToMainUnit(
                                        oldItem.quantity || 0,
                                        oldItem.unitId || product.unitId,
                                        product
                                    );
                                    
                                    if (availableQuantity < oldQuantityInMainUnit) {
                                        const errorMsg = `⚠️ لا يمكن تعديل الفاتورة: الكمية المتاحة (${availableQuantity}) أقل من الكمية القديمة (${oldQuantityInMainUnit}) للمنتج ${product.name}${oldItem.expiryDate ? ` بتاريخ صلاحية ${oldItem.expiryDate}` : ''}${oldItem.serialNumber ? ` برقم تسلسلي ${oldItem.serialNumber}` : ''}`;
                                        console.error(errorMsg);
                                        throw new Error(errorMsg);
                                    }
                                }
                            } else {
                                // ✅ For products without expiry/serial tracking, check if we have the old quantity
                                // We need to ensure we can subtract the old quantity before applying changes
                                if (oldQuantityInMainUnit > 0 && stockInWarehouse < oldQuantityInMainUnit) {
                                    // Check if there are other movements (sales/returns) that might have reduced stock
                                    try {
                                        const purchaseIdStr = String(newPurchaseData.id || oldPurchaseData.id);
                                        const movementsSnapshot = await db.collection('inventoryMovements')
                                            .where('productId', '==', productId)
                                            .where('warehouseId', '==', newWarehouseId)
                                            .get();

                                        let hasDependentMovements = false;
                                        movementsSnapshot.forEach(doc => {
                                            const movement = doc.data();
                                            const movementSourceId = movement.sourceId ? String(movement.sourceId) : null;
                                            
                                            // Check if there are movements other than this purchase
                                            if (movement.sourceType !== 'purchase' || movementSourceId !== purchaseIdStr) {
                                                hasDependentMovements = true;
                                            }
                                        });

                                        if (hasDependentMovements && stockInWarehouse < oldQuantityInMainUnit) {
                                            const errorMsg = `⚠️ لا يمكن تعديل الفاتورة: الرصيد الحالي (${stockInWarehouse}) أقل من الكمية القديمة (${oldQuantityInMainUnit}) للمنتج ${product.name}، وهناك حركات مخزون أخرى (مثل مبيعات أو مرتجعات) مرتبطة بهذا المنتج في هذا المستودع.`;
                                            Logger.error(errorMsg);
                                            throw new Error(errorMsg);
                                        } else if (!hasDependentMovements && stockInWarehouse < oldQuantityInMainUnit) {
                                            // No dependent movements, allow the edit but log a warning
                                            Logger.warn(`⚠️ الرصيد الحالي (${stockInWarehouse}) أقل من الكمية القديمة (${oldQuantityInMainUnit})، لكن لا توجد حركات أخرى. سيتم المتابعة.`);
                                        }
                                    } catch (movementError) {
                                        Logger.error('❌ خطأ أثناء التحقق من حركات المخزون:', movementError);
                                        // If check fails, still check basic quantity
                                        if (stockInWarehouse < quantityToSubtract) {
                                            const errorMsg = `⚠️ لا يمكن تعديل الفاتورة: الرصيد الحالي (${stockInWarehouse}) أقل من الكمية المطلوب طرحها (${quantityToSubtract}) للمنتج ${product.name}`;
                                            Logger.error(errorMsg);
                                            throw new Error(errorMsg);
                                        }
                                    }
                                } else if (stockInWarehouse < quantityToSubtract) {
                                    // Fallback: check quantity to subtract
                                    const errorMsg = `⚠️ لا يمكن تعديل الفاتورة: الرصيد الحالي (${stockInWarehouse}) أقل من الكمية المطلوب طرحها (${quantityToSubtract}) للمنتج ${product.name}`;
                                    Logger.error(errorMsg);
                                    throw new Error(errorMsg);
                                }
                            }
                            
                            // Safe to subtract
                            await Collections.updateProductWarehouseStock(
                                productId,
                                newWarehouseId,
                                quantityToSubtract,
                                'subtract'
                            );
                            Logger.log(`➖ Subtracted ${quantityToSubtract} from warehouse ${newWarehouseId} for product ${productId}`);
                        }
                    }
                }
                
                // Update product purchase price if needed (same logic as in updateInventory)
                if (newItem && newItem.unitPrice > 0) {
                    let priceInMainUnit = newItem.unitPrice;
                    if (newItem.unitId && newItem.unitId !== product.unitId) {
                        const subUnit = product.subUnits?.find(su => su.unitId === newItem.unitId);
                        const conversionFactor = parseFloat(subUnit?.conversionValue || subUnit?.conversionFactor) || 0;
                        if (subUnit && conversionFactor > 0) {
                            // Convert price based on conversion type
                            const conversionType = subUnit.conversionType || 'multiply';
                            if (conversionType === 'multiply') {
                                // If sub-unit is larger (e.g., box = 12 pieces)
                                // Price per main unit = price per sub-unit / conversion factor
                                priceInMainUnit = newItem.unitPrice / conversionFactor;
                            } else if (conversionType === 'divide') {
                                // If sub-unit is smaller (e.g., kg vs ton)
                                // Price per main unit = price per sub-unit * conversion factor
                                priceInMainUnit = newItem.unitPrice * conversionFactor;
                            } else {
                                // Default to divide for backward compatibility
                                priceInMainUnit = newItem.unitPrice / conversionFactor;
                            }
                        }
                    }
                    
                    if (!product.purchasePrice || priceInMainUnit > product.purchasePrice) {
                        await Collections.updateProduct(productId, {
                            purchasePrice: priceInMainUnit
                        });
                    }
                }
                
                // ✅ IMPORTANT: Always create a new inventory movement for the new item
                // This ensures the movement history is complete and accurate
                // We deleted the old movements, so we need to create new ones for the current state
                if (newItem && newQuantityInMainUnit > 0) {
                    // Use net price for inventory cost calculation (صافي السعر مهم للمخزون)
                    let netPrice = newItem.netPrice;
                    if (!netPrice && newItem.unitPrice) {
                        const quantity = newItem.quantity || 1;
                        const discountPerUnit = (newItem.discountAmount || 0) / quantity;
                        const additionPerUnit = (newItem.additionAmount || 0) / quantity;
                        netPrice = newItem.unitPrice - discountPerUnit + additionPerUnit;
                        netPrice = Math.max(0, netPrice); // Ensure non-negative
                    }
                    const costPrice = netPrice || newItem.unitPrice || 0;
                    
                    const warehouse = await Collections.getWarehouse(newWarehouseId);
                    const warehouseName = warehouse?.name || 'المستودع الافتراضي';
                    
                    // Get current stock after update
                    const currentStock = await Collections.getProductWarehouseStock(productId);
                    const stockInWarehouse = currentStock?.[newWarehouseId] || 0;
                    
                    // Calculate previous quantity (before this purchase)
                    const previousQuantity = stockInWarehouse - newQuantityInMainUnit;
                    
                    const movementRecord = {
                        type: 'in',
                        productId: productId,
                        productName: product.name,
                        warehouseId: newWarehouseId,
                        warehouseName: warehouseName,
                        toWarehouseId: null,
                        toWarehouseName: null,
                        unitId: newItem.unitId || product.unitId,
                        quantity: newQuantityInMainUnit, // Record the full new quantity
                        quantityInMainUnit: newQuantityInMainUnit,
                        expiryDate: newItem.expiryDate || null,
                        serialNumber: newItem.serialNumber || null,
                        unitPrice: costPrice || 0,
                        totalCost: (costPrice || 0) * newQuantityInMainUnit,
                        previousQuantity: previousQuantity,
                        newQuantity: stockInWarehouse,
                        reference: newPurchaseData.invoiceNo || `فاتورة شراء ${newPurchaseData.id || ''}`,
                        notes: `تعديل فاتورة شراء - ${newPurchaseData.supplierName || ''}`,
                        date: newPurchaseData.date ? new Date(newPurchaseData.date) : new Date(),
                        userId: auth.currentUser?.uid || 'system',
                        createdAt: new Date(),
                        sourceType: 'purchase',
                        sourceId: String(newPurchaseData.id || '')
                    };
                    
                    await db.collection('inventoryMovements').add(movementRecord);
                    Logger.log(`📝 Inventory movement recorded for edited purchase: ${product.name}, quantity: ${newQuantityInMainUnit}`);
                }
                // Note: The case for warehouse change is already handled above
                // We always create movements for new items regardless of warehouse changes
            }
            
            Logger.log('✅ Inventory updated successfully for edited purchase');
            
        } catch (error) {
            Logger.error('❌ Error updating inventory on edit:', error);
            // ✅ Throw error to allow rollback in savePurchase
            throw error;
        }
    },

    /**
     * Update supplier balance when creating/updating purchase
     * @param {Object} purchaseData - Purchase data
     * @param {string} operation - 'add' or 'subtract'
     */
    async updateSupplierBalance(purchaseData, operation = 'add') {
        try {
            // Only update balance for credit purchases
            if (purchaseData.paymentMethod !== 'credit') {
                Logger.log('ℹ️ Payment method is not credit, skipping supplier balance update');
                return;
            }
            
            if (!purchaseData.supplierId) {
                Logger.warn('⚠️ Supplier ID not found, skipping balance update');
                return;
            }
            
            // Get base currency and exchange rate
            const invoiceCurrency = purchaseData.currency || 'IQD';
            const invoiceExchangeRate = parseFloat(purchaseData.exchangeRate) || 1;
            const baseCurrency = this.currencies.find(c => c.isBaseCurrency)?.code || 'IQD';
            
            // Convert total to base currency
            let totalInBase = purchaseData.total || 0;
            if (invoiceCurrency !== baseCurrency && invoiceExchangeRate > 0) {
                totalInBase = totalInBase / invoiceExchangeRate;
            }
            
            // Update party balance using PartiesModule
            if (typeof PartiesModule !== 'undefined' && PartiesModule.updatePartyBalance) {
                await PartiesModule.updatePartyBalance(
                    purchaseData.supplierId,
                    totalInBase,
                    operation
                );
                Logger.log(`✅ Supplier balance updated: ${operation === 'add' ? '+' : '-'}${totalInBase} ${baseCurrency}`);
            } else {
                // Fallback: Update directly using Collections
                try {
                    const supplier = await Collections.getParty(purchaseData.supplierId);
                    if (supplier) {
                        const currentBalance = parseFloat(supplier.balance) || 0;
                        let newBalance;
                        if (operation === 'add') {
                            newBalance = currentBalance + totalInBase;
                        } else {
                            newBalance = currentBalance - totalInBase;
                        }
                        await Collections.updateParty(purchaseData.supplierId, {
                            balance: newBalance,
                            lastTransactionDate: new Date(),
                            updatedAt: new Date()
                        });
                        Logger.log(`✅ Supplier balance updated (fallback): ${operation === 'add' ? '+' : '-'}${totalInBase} ${baseCurrency}`);
                    }
                } catch (error) {
                    Logger.error('❌ Error updating supplier balance (fallback):', error);
                }
            }
        } catch (error) {
            Logger.error('❌ Error updating supplier balance:', error);
            // Don't throw error to avoid breaking the purchase flow
        }
    },

    /**
     * Update supplier balance when editing purchase (reverse old and apply new)
     * @param {Object} oldPurchaseData - Old purchase data
     * @param {Object} newPurchaseData - New purchase data
     */
    async updateSupplierBalanceOnEdit(oldPurchaseData, newPurchaseData) {
        try {
            // ✅ تحسين المنطق لتجنب التكرار:
            // 1. إذا تغير المورد: عكس رصيد المورد القديم (إذا كان credit) وإضافة رصيد المورد الجديد (إذا كان credit)
            // 2. إذا لم يتغير المورد لكن تغيرت طريقة الدفع: عكس القديم وإضافة الجديد
            // 3. إذا لم يتغير شيء: عكس القديم وإضافة الجديد
            
            const supplierChanged = oldPurchaseData.supplierId !== newPurchaseData.supplierId;
            const paymentMethodChanged = oldPurchaseData.paymentMethod !== newPurchaseData.paymentMethod;
            
            // عكس رصيد المورد القديم (إذا كان credit)
            if (oldPurchaseData.paymentMethod === 'credit' && oldPurchaseData.supplierId) {
                await this.updateSupplierBalance(oldPurchaseData, 'subtract');
                Logger.log(`➖ Reversed old supplier balance for supplier ${oldPurchaseData.supplierId}`);
            }
            
            // إضافة رصيد المورد الجديد (إذا كان credit)
            if (newPurchaseData.paymentMethod === 'credit' && newPurchaseData.supplierId) {
                await this.updateSupplierBalance(newPurchaseData, 'add');
                Logger.log(`➕ Added new supplier balance for supplier ${newPurchaseData.supplierId}`);
            }
            
            Logger.log('✅ Supplier balance updated for edited purchase', {
                supplierChanged,
                paymentMethodChanged,
                oldSupplier: oldPurchaseData.supplierId,
                newSupplier: newPurchaseData.supplierId,
                oldPaymentMethod: oldPurchaseData.paymentMethod,
                newPaymentMethod: newPurchaseData.paymentMethod
            });
        } catch (error) {
            Logger.error('❌ Error updating supplier balance on edit:', error);
            // Don't throw error to avoid breaking the purchase flow
        }
    },

    /**
     * Generate purchase report
     */
    async generatePurchaseReport() {
        try {
            showLoading();

            const reportData = {
                totalPurchases: this.purchases.length,
                totalAmount: this.purchases.reduce((sum, p) => sum + (p.total || 0), 0),
                paidAmount: this.purchases.reduce((sum, p) => sum + (p.paidAmount || 0), 0),
                remainingAmount: this.purchases.reduce((sum, p) => sum + (p.remainingAmount || 0), 0),
                suppliers: this.suppliers.length,
                averagePurchase: this.purchases.length > 0 ? 
                    this.purchases.reduce((sum, p) => sum + (p.total || 0), 0) / this.purchases.length : 0
            };

            // Generate report HTML
            const reportHTML = `
                <div class="purchase-report">
                    <div class="report-header">
                        <h3><i class="fas fa-chart-line"></i> تقرير المشتريات</h3>
                        <p>تاريخ التقرير: ${formatDate(new Date())}</p>
                    </div>
                    
                    <div class="report-summary">
                        <div class="row">
                            <div class="col-md-3">
                                <div class="summary-item">
                                    <h4>${reportData.totalPurchases}</h4>
                                    <p>إجمالي المشتريات</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="summary-item">
                                    <h4>${formatNumber(reportData.totalAmount)}</h4>
                                    <p>إجمالي المبلغ</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="summary-item">
                                    <h4>${formatNumber(reportData.paidAmount)}</h4>
                                    <p>المبلغ المدفوع</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="summary-item">
                                    <h4>${formatNumber(reportData.remainingAmount)}</h4>
                                    <p>المبلغ المتبقي</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="report-details">
                        <h4>تفاصيل المشتريات</h4>
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>رقم الفاتورة</th>
                                        <th>التاريخ</th>
                                        <th>المورد</th>
                                        <th>المبلغ</th>
                                        <th>المدفوع</th>
                                        <th>المتبقي</th>
                                        <th>حالة الدفع</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.purchases.map(purchase => `
                                        <tr>
                                            <td>${purchase.invoiceNo}</td>
                                            <td>${formatDate(purchase.date)}</td>
                                            <td>${purchase.supplierName}</td>
                                            <td>${formatNumber(purchase.total || 0)}</td>
                                            <td>${formatNumber(purchase.paidAmount || 0)}</td>
                                            <td>${formatNumber(purchase.remainingAmount || 0)}</td>
                                            <td>
                                                <span class="badge bg-${purchase.paymentStatus === 'paid' ? 'success' : 
                                                    purchase.paymentStatus === 'partial' ? 'warning' : 'danger'}">
                                                    ${purchase.paymentStatus === 'paid' ? 'مدفوع' : 
                                                        purchase.paymentStatus === 'partial' ? 'جزئي' : 'غير مدفوع'}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            // Show report in modal
        Swal.fire({
                title: 'تقرير المشتريات',
                html: reportHTML,
                width: '90%',
                showCloseButton: true,
                showConfirmButton: false,
                customClass: {
                    popup: 'purchase-report-popup'
                }
            });

            hideLoading();

        } catch (error) {
            console.error('Error generating purchase report:', error);
            if (typeof showError === 'function') {
                showError('فشل في توليد التقرير: ' + error.message);
            } else {
                Logger.error('❌ فشل في توليد التقرير:', error.message);
            }
            hideLoading();
        }
    },

    /**
     * Generate supplier report
     */
    async generateSupplierReport() {
        try {
            showLoading();

            const supplierData = this.suppliers.map(supplier => {
                const supplierPurchases = this.purchases.filter(p => p.supplierId === supplier.id);
                const totalAmount = supplierPurchases.reduce((sum, p) => sum + (p.total || 0), 0);
                const paidAmount = supplierPurchases.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
                const remainingAmount = supplierPurchases.reduce((sum, p) => sum + (p.remainingAmount || 0), 0);

                return {
                    ...supplier,
                    purchaseCount: supplierPurchases.length,
                    totalAmount,
                    paidAmount,
                    remainingAmount
                };
            });

            // Generate report HTML
            const reportHTML = `
                <div class="supplier-report">
                    <div class="report-header">
                        <h3><i class="fas fa-truck"></i> تقرير الموردين</h3>
                        <p>تاريخ التقرير: ${formatDate(new Date())}</p>
                    </div>
                    
                    <div class="report-summary">
                        <div class="row">
                            <div class="col-md-4">
                                <div class="summary-item">
                                    <h4>${supplierData.length}</h4>
                                    <p>إجمالي الموردين</p>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="summary-item">
                                    <h4>${formatNumber(supplierData.reduce((sum, s) => sum + s.totalAmount, 0))}</h4>
                                    <p>إجمالي المشتريات</p>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="summary-item">
                                    <h4>${formatNumber(supplierData.reduce((sum, s) => sum + s.remainingAmount, 0))}</h4>
                                    <p>إجمالي المتأخرات</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="report-details">
                        <h4>تفاصيل الموردين</h4>
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>اسم المورد</th>
                                        <th>الهاتف</th>
                                        <th>البريد الإلكتروني</th>
                                        <th>عدد المشتريات</th>
                                        <th>إجمالي المبلغ</th>
                                        <th>المتبقي</th>
                                        <th>الحالة</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${supplierData.map(supplier => `
                                        <tr>
                                            <td>${supplier.name}</td>
                                            <td>${supplier.phone || 'غير محدد'}</td>
                                            <td>${supplier.email || 'غير محدد'}</td>
                                            <td>${supplier.purchaseCount}</td>
                                            <td>${formatNumber(supplier.totalAmount)}</td>
                                            <td>${formatNumber(supplier.remainingAmount)}</td>
                                            <td>
                                                <span class="badge bg-${supplier.status === 'active' ? 'success' : 'secondary'}">
                                                    ${supplier.status === 'active' ? 'نشط' : 'غير نشط'}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;

            // Show report in modal
            Swal.fire({
                title: 'تقرير الموردين',
                html: reportHTML,
                width: '90%',
                showCloseButton: true,
                showConfirmButton: false,
                customClass: {
                    popup: 'supplier-report-popup'
                }
            });

            hideLoading();

        } catch (error) {
            console.error('Error generating supplier report:', error);
            if (typeof showError === 'function') {
                showError('فشل في توليد التقرير: ' + error.message);
            } else {
                Logger.error('❌ فشل في توليد التقرير:', error.message);
            }
            hideLoading();
        }
    },

    /**
     * Add discount row
     */
    addDiscount() {
        const tbody = document.getElementById('discountsAdditionsBody');
        if (!tbody) return;

        const rowIndex = tbody.children.length + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rowIndex}</td>
            <td>
                <select class="form-select form-select-sm type-select">
                    <option value="discount">خصم</option>
                </select>
            </td>
            <td>
                <div class="input-group input-group-sm">
                    <input type="text" class="form-control form-control-sm account-name-display" placeholder="اختر من شجرة الحسابات" readonly style="background-color: #f8f9fa;">
                    <input type="hidden" class="account-select" value="">
                    <button type="button" class="btn btn-outline-secondary btn-sm open-account-picker-btn" title="اختر من شجرة الحسابات">
                        <i class="fas fa-sitemap"></i>
                    </button>
                </div>
            </td>
            <td>
                <div class="input-group input-group-sm">
                    <input type="text" class="form-control form-control-sm counter-account-name-display" placeholder="اختر الحساب المقابل" readonly style="background-color: #f8f9fa;">
                    <input type="hidden" class="counter-account-select counter-account-id" value="">
                    <button type="button" class="btn btn-outline-secondary btn-sm open-counter-account-picker-btn" title="اختر الحساب المقابل">
                        <i class="fas fa-sitemap"></i>
                    </button>
                </div>
            </td>
            <td>
                <input type="number" class="form-control form-control-sm amount-input" min="0" step="0.01" value="0" required>
            </td>
            <td>
                <select class="form-select form-select-sm currency-select">
                    ${this.currencies.map(currency => `
                        <option value="${currency.code}" ${currency.code === 'IQD' ? 'selected' : ''}>${currency.code}</option>
                    `).join('')}
                </select>
            </td>
            <td>
                <input type="text" class="form-control form-control-sm notes-input" placeholder="ملاحظات">
            </td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-danger remove-discount-addition" title="حذف الصف">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);
        this.setupDiscountAdditionListeners(row);
        this.calculatePurchaseTotals();
        // تطبيق قواعد طريقة الدفع على الصف الجديد (خصوصاً منع الحساب المقابل في الدفع النقدي)
        this.updatePaymentFields();
    },

    /**
     * Add addition row
     */
    addAddition() {
        const tbody = document.getElementById('discountsAdditionsBody');
        if (!tbody) return;

        const rowIndex = tbody.children.length + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rowIndex}</td>
            <td>
                <select class="form-select form-select-sm type-select">
                    <option value="addition">إضافة</option>
                </select>
            </td>
            <td>
                <div class="input-group input-group-sm">
                    <input type="text" class="form-control form-control-sm account-name-display" placeholder="اختر من شجرة الحسابات" readonly style="background-color: #f8f9fa;">
                    <input type="hidden" class="account-select" value="">
                    <button type="button" class="btn btn-outline-secondary btn-sm open-account-picker-btn" title="اختر من شجرة الحسابات">
                        <i class="fas fa-sitemap"></i>
                    </button>
                </div>
            </td>
            <td>
                <div class="input-group input-group-sm">
                    <input type="text" class="form-control form-control-sm counter-account-name-display" placeholder="اختر الحساب المقابل" readonly style="background-color: #f8f9fa;">
                    <input type="hidden" class="counter-account-select counter-account-id" value="">
                    <button type="button" class="btn btn-outline-secondary btn-sm open-counter-account-picker-btn" title="اختر الحساب المقابل">
                        <i class="fas fa-sitemap"></i>
                    </button>
                </div>
            </td>
            <td>
                <input type="number" class="form-control form-control-sm amount-input" min="0" step="0.01" value="0" required>
            </td>
            <td>
                <select class="form-select form-select-sm currency-select">
                    ${this.currencies.map(currency => `
                        <option value="${currency.code}" ${currency.code === 'IQD' ? 'selected' : ''}>${currency.code}</option>
                    `).join('')}
                </select>
            </td>
            <td>
                <input type="text" class="form-control form-control-sm notes-input" placeholder="ملاحظات">
            </td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-danger remove-discount-addition" title="حذف الصف">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);
        this.setupDiscountAdditionListeners(row);
        this.calculatePurchaseTotals();
        // تطبيق قواعد طريقة الدفع على الصف الجديد (خصوصاً منع الحساب المقابل في الدفع النقدي)
        this.updatePaymentFields();
    },

    /**
     * Setup discount/addition row event listeners
     */
    setupDiscountAdditionListeners(row) {
        const amountInput = row.querySelector('.amount-input');
        const currencySelect = row.querySelector('.currency-select');
        const removeBtn = row.querySelector('.remove-discount-addition');
        const accountPickerBtn = row.querySelector('.open-account-picker-btn');
        const accountSelect = row.querySelector('.account-select');
        const accountNameDisplay = row.querySelector('.account-name-display');

        amountInput.addEventListener('input', async () => {
            this.calculatePurchaseTotals();
            // تحديث الحد الأقصى للدفعة والمبلغ المتبقي عند تغيير المبلغ
            if (document.getElementById('purchasePaymentMethod')?.value === 'credit') {
                // عند التعديل: نحافظ على القيمة، عند الإضافة: نصحح القيمة إذا لزم الأمر
                await this.updatePaidAmountMax(this.isPopulatingForm);
                await this.calculateRemainingAmount();
            }
        });

        // Currency change - convert amount automatically
        if (currencySelect) {
            // Store original currency and amount when currency is first selected or changed
            let previousCurrency = currencySelect.value;
            let previousAmount = parseFloat(amountInput.value) || 0;
            
            currencySelect.addEventListener('change', () => {
                const currentAmount = parseFloat(amountInput.value) || 0;
                const newCurrency = currencySelect.value;
                const baseCurrency = this.currencies.find(c => c.isBaseCurrency)?.code || 'IQD';
                
                // Only convert if there's an amount and currency actually changed
                if (currentAmount > 0 && previousCurrency !== newCurrency) {
                    // Get exchange rates
                    const oldCurrencyObj = this.currencies.find(c => c.code === previousCurrency);
                    const newCurrencyObj = this.currencies.find(c => c.code === newCurrency);
                    
                    const oldExchangeRate = oldCurrencyObj?.exchangeRate || 1;
                    const newExchangeRate = newCurrencyObj?.exchangeRate || 1;
                    
                    // Convert: old currency -> base currency -> new currency
                    let amountInBase = currentAmount;
                    
                    // Convert from old currency to base currency
                    if (previousCurrency !== baseCurrency && oldExchangeRate > 0) {
                        amountInBase = currentAmount / oldExchangeRate;
                    }
                    
                    // Convert from base currency to new currency
                    let convertedAmount = amountInBase;
                    if (newCurrency !== baseCurrency && newExchangeRate > 0) {
                        convertedAmount = amountInBase * newExchangeRate;
                    }
                    
                    // Update amount input with converted value
                    amountInput.value = convertedAmount.toFixed(2);
                    
                    Logger.log(`💱 Converted ${currentAmount} ${previousCurrency} to ${convertedAmount.toFixed(2)} ${newCurrency}`);
                }
                
                // Update previous currency for next change
                previousCurrency = newCurrency;
                
                // Recalculate totals
                this.calculatePurchaseTotals();
            });
        }

        removeBtn.addEventListener('click', () => {
            row.remove();
            this.updateDiscountAdditionRowNumbers();
            this.calculatePurchaseTotals();
        });

        // Account picker button
        if (accountPickerBtn && accountSelect && accountNameDisplay) {
            accountPickerBtn.addEventListener('click', () => {
                this.openAccountPickerForRow(row, accountSelect, accountNameDisplay);
            });
        }

        // Counter account picker button
        const counterAccountPickerBtn = row.querySelector('.open-counter-account-picker-btn');
        const counterAccountSelect = row.querySelector('.counter-account-select');
        const counterAccountNameDisplay = row.querySelector('.counter-account-name-display');
        if (counterAccountPickerBtn && counterAccountSelect && counterAccountNameDisplay) {
            counterAccountPickerBtn.addEventListener('click', async () => {
                await this.openAccountPickerForRow(row, counterAccountSelect, counterAccountNameDisplay);
                // تحديث الحد الأقصى للدفعة والمبلغ المتبقي عند تغيير الحساب المقابل
                if (document.getElementById('purchasePaymentMethod')?.value === 'credit') {
                    // عند التعديل: نحافظ على القيمة، عند الإضافة: نصحح القيمة إذا لزم الأمر
                    await this.updatePaidAmountMax(this.isPopulatingForm);
                    await this.calculateRemainingAmount();
                }
            });
        }
        
        // ✅ Listen for counter account changes (with cleanup)
        if (counterAccountSelect) {
            const observer = new MutationObserver(async () => {
                if (document.getElementById('purchasePaymentMethod')?.value === 'credit') {
                    // عند التعديل: نحافظ على القيمة، عند الإضافة: نصحح القيمة إذا لزم الأمر
                    await this.updatePaidAmountMax(this.isPopulatingForm);
                    await this.calculateRemainingAmount();
                }
            });
            observer.observe(counterAccountSelect, { attributes: true, attributeFilter: ['value'] });
            // Store observer for cleanup
            counterAccountSelect._counterAccountObserver = observer;
        }
    },

    /**
     * Update discount/addition row numbers
     */
    updateDiscountAdditionRowNumbers() {
        const tbody = document.getElementById('discountsAdditionsBody');
        if (!tbody) return;

        Array.from(tbody.children).forEach((row, index) => {
            row.cells[0].textContent = index + 1;
        });
    },

    /**
     * Toggle column visibility controls
     */
    toggleColumnControls() {
        const controls = document.getElementById('columnControls');
        if (controls.style.display === 'none') {
            controls.style.display = 'block';
        } else {
            controls.style.display = 'none';
        }
    },

    /**
     * Setup column visibility controls
     */
    setupColumnVisibilityControls() {
        const toggles = document.querySelectorAll('.column-toggle');
        toggles.forEach(toggle => {
            // Remove existing listeners to avoid duplicates
            const newToggle = toggle.cloneNode(true);
            toggle.parentNode.replaceChild(newToggle, toggle);
            
            newToggle.addEventListener('change', (e) => {
                const columnId = e.target.id; // e.g., "col-product"
                const columnClass = columnId.replace('col-', ''); // e.g., "product"
                // Search for both .col-{name} and .{name} classes
                const columns = document.querySelectorAll(`.col-${columnClass}, .${columnClass}`);
                columns.forEach(col => {
                    if (col.classList.contains(`col-${columnClass}`) || col.classList.contains(columnClass)) {
                        col.style.display = e.target.checked ? '' : 'none';
                    }
                });
            });
        });
    },

    /**
     * Setup column resizing
     */
    setupColumnResizing() {
        const resizableColumns = document.querySelectorAll('.resizable');
        resizableColumns.forEach(column => {
            column.style.position = 'relative';
            
            // Add resize handle
            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'resize-handle';
            resizeHandle.style.cssText = `
                position: absolute;
                top: 0;
                right: 0;
                width: 5px;
                height: 100%;
                background: #007bff;
                cursor: col-resize;
                opacity: 0;
                transition: opacity 0.2s;
            `;
            
            column.appendChild(resizeHandle);
            
            // Show handle on hover
            column.addEventListener('mouseenter', () => {
                resizeHandle.style.opacity = '1';
            });
            
            column.addEventListener('mouseleave', () => {
                resizeHandle.style.opacity = '0';
            });
            
            // Handle resize
            let isResizing = false;
            let startX = 0;
            let startWidth = 0;
            
            resizeHandle.addEventListener('mousedown', (e) => {
                isResizing = true;
                startX = e.clientX;
                startWidth = column.offsetWidth;
                
                document.addEventListener('mousemove', handleResize);
                document.addEventListener('mouseup', stopResize);
                
                e.preventDefault();
            });
            
            function handleResize(e) {
                if (!isResizing) return;
                
                const newWidth = startWidth + (e.clientX - startX);
                if (newWidth > 50) { // Minimum width
                    column.style.width = newWidth + 'px';
                }
            }
            
            function stopResize() {
                isResizing = false;
                document.removeEventListener('mousemove', handleResize);
                document.removeEventListener('mouseup', stopResize);
            }
        });
    },

    /**
     * Update exchange rate based on selected currency
     */
    updateExchangeRate() {
        const selectedCurrency = document.getElementById('purchaseCurrency').value;
        const exchangeRateInput = document.getElementById('purchaseExchangeRate');
        
        // Find currency in currencies list
        const currency = this.currencies.find(c => c.code === selectedCurrency);
        if (currency && currency.exchangeRate) {
            exchangeRateInput.value = currency.exchangeRate;
        } else {
            exchangeRateInput.value = 1;
        }
        
        // Recalculate all item prices
        this.recalculateAllItemPrices();
    },

    /**
     * Recalculate all item prices based on new exchange rate or currency change
     * This recalculates prices for all items without reloading units
     * Important: This preserves the original product currency and converts to new invoice currency
     */
    recalculateAllItemPrices() {
        const tbody = document.getElementById('purchaseItemsBody');
        if (!tbody) return;
        
        // Use children instead of querySelectorAll for better performance
        const rows = tbody.children;
        // Use for loop instead of forEach for better performance
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const unitHiddenInput = row.querySelector('.unit-select-id');
            const productHiddenInput = row.querySelector('.product-select-id');
            
            if (unitHiddenInput && unitHiddenInput.value && productHiddenInput && productHiddenInput.value) {
                // Recalculate price for the selected unit with new currency
                this.updatePriceForSelectedUnit(row);
            }
        }
    },

    /**
     * Load settings when settings tab is opened
     */
    async loadSettings() {
        try {
            Logger.log('⚙️ Loading purchases settings...');
            
            // Load default values
            await this.loadDefaultValues();
            
            // Load general settings
            await this.loadGeneralSettings();
            
            // Load print fields settings
            await this.loadPrintFieldsSettings();
            
            Logger.log('✅ Settings loaded successfully');
            
        } catch (error) {
            Logger.error('Error loading settings:', error);
            showError('خطأ في تحميل الإعدادات');
        }
    },

    /**
     * Load default values for settings
     */
    async loadDefaultValues() {
        try {
            // Load warehouses
            const warehouseSelect = document.getElementById('defaultWarehouse');
            if (warehouseSelect) {
                warehouseSelect.innerHTML = '<option value="">-- اختر المستودع الافتراضي --</option>';
                this.warehouses.forEach(warehouse => {
                    warehouseSelect.innerHTML += `
                        <option value="${warehouse.id}">${warehouse.name}</option>
                    `;
                });
            }

            // Load cost centers
            const costCenterSelect = document.getElementById('defaultCostCenter');
            if (costCenterSelect) {
                costCenterSelect.innerHTML = '<option value="">-- اختر مركز الكلفة الافتراضي --</option>';
                this.costCenters.forEach(costCenter => {
                    costCenterSelect.innerHTML += `
                        <option value="${costCenter.id}">${costCenter.name}</option>
                    `;
                });
            }

            // Load saved settings
            const settings = await this.getSettings();
            
            // Set default currency
            const currencySelect = document.getElementById('defaultPurchaseCurrency');
            if (currencySelect) {
                currencySelect.value = settings.defaultCurrency || 'IQD';
            }

            // Set default payment method
            const paymentMethodSelect = document.getElementById('defaultPaymentMethod');
            if (paymentMethodSelect) {
                paymentMethodSelect.value = settings.defaultPaymentMethod || 'cash';
            }

            // Set default warehouse
            if (warehouseSelect) {
                warehouseSelect.value = settings.defaultWarehouse || '';
            }

            // Set default cost center
            if (costCenterSelect) {
                costCenterSelect.value = settings.defaultCostCenter || '';
            }

        } catch (error) {
            console.error('Error loading default values:', error);
        }
    },

    /**
     * Load general settings
     */
    async loadGeneralSettings() {
        try {
            const settings = await this.getSettings();
            
            // Wait a bit to ensure DOM is ready
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Auto generate invoice numbers
            const autoGenerateInvoiceNumbers = document.getElementById('autoGenerateInvoiceNumbers');
            if (autoGenerateInvoiceNumbers) {
                autoGenerateInvoiceNumbers.checked = settings.autoGenerateInvoiceNumbers !== false;
            }

            // Auto update stock
            const autoUpdateStock = document.getElementById('autoUpdateStock');
            if (autoUpdateStock) {
                autoUpdateStock.checked = settings.autoUpdateStock !== false;
            }

            // Auto generate general entry
            const autoGenerateGeneralEntry = document.getElementById('autoGenerateGeneralEntry');
            if (autoGenerateGeneralEntry) {
                autoGenerateGeneralEntry.checked = settings.autoGenerateGeneralEntry !== false;
            }

            // Default tax rate
            const defaultTaxRate = document.getElementById('defaultTaxRate');
            if (defaultTaxRate) {
                defaultTaxRate.value = settings.defaultTaxRate || 0;
            }
            
            // Default counter account (Debit Account)
            const defaultCounterAccount = document.getElementById('defaultCounterAccount');
            const defaultCounterAccountDisplay = document.getElementById('defaultCounterAccountDisplay');
            if (defaultCounterAccount && settings.defaultCounterAccountId) {
                defaultCounterAccount.value = settings.defaultCounterAccountId;
                const account = this.accounts.find(a => a.id === settings.defaultCounterAccountId);
                if (defaultCounterAccountDisplay && account) {
                    defaultCounterAccountDisplay.value = account.name;
                }
            }
            // Picker button for counter account
            const openDefaultPickerBtn = document.getElementById('openDefaultCounterAccountPicker');
            if (openDefaultPickerBtn) {
                // Remove old listeners by cloning
                const newBtn = openDefaultPickerBtn.cloneNode(true);
                newBtn.id = 'openDefaultCounterAccountPicker'; // Ensure ID is preserved
                openDefaultPickerBtn.parentNode.replaceChild(newBtn, openDefaultPickerBtn);
                // Add new listener
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    Logger.log('🔍 Opening account picker for defaultCounterAccount');
                    this.openAccountPicker('defaultCounterAccount', 'defaultCounterAccountDisplay');
                });
                Logger.log('✅ Setup account picker button for defaultCounterAccount');
            } else {
                Logger.warn('⚠️ Button openDefaultCounterAccountPicker not found');
            }
            
            // Default credit account (for Cash payments)
            const defaultCreditAccount = document.getElementById('defaultCreditAccount');
            const defaultCreditAccountDisplay = document.getElementById('defaultCreditAccountDisplay');
            if (defaultCreditAccount && settings.defaultCreditAccountId) {
                defaultCreditAccount.value = settings.defaultCreditAccountId;
                const account = this.accounts.find(a => a.id === settings.defaultCreditAccountId);
                if (defaultCreditAccountDisplay && account) {
                    defaultCreditAccountDisplay.value = account.name;
                }
            }
            // Picker button for credit account
            const openCreditPickerBtn = document.getElementById('openDefaultCreditAccountPicker');
            if (openCreditPickerBtn) {
                const newBtn = openCreditPickerBtn.cloneNode(true);
                newBtn.id = 'openDefaultCreditAccountPicker'; // Ensure ID is preserved
                openCreditPickerBtn.parentNode.replaceChild(newBtn, openCreditPickerBtn);
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    Logger.log('🔍 Opening account picker for defaultCreditAccount');
                    this.openAccountPicker('defaultCreditAccount', 'defaultCreditAccountDisplay');
                });
                Logger.log('✅ Setup account picker button for defaultCreditAccount');
            } else {
                Logger.warn('⚠️ Button openDefaultCreditAccountPicker not found');
            }
            
            // Default payment account (for partial payments)
            const defaultPaymentAccount = document.getElementById('defaultPaymentAccount');
            const defaultPaymentAccountDisplay = document.getElementById('defaultPaymentAccountDisplay');
            if (defaultPaymentAccount && settings.defaultPaymentAccountId) {
                defaultPaymentAccount.value = settings.defaultPaymentAccountId;
                const account = this.accounts.find(a => a.id === settings.defaultPaymentAccountId);
                if (defaultPaymentAccountDisplay && account) {
                    defaultPaymentAccountDisplay.value = account.name;
                }
            }
            // Picker button for payment account
            const openPaymentPickerBtn = document.getElementById('openDefaultPaymentAccountPicker');
            if (openPaymentPickerBtn) {
                const newBtn = openPaymentPickerBtn.cloneNode(true);
                newBtn.id = 'openDefaultPaymentAccountPicker'; // Ensure ID is preserved
                openPaymentPickerBtn.parentNode.replaceChild(newBtn, openPaymentPickerBtn);
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    Logger.log('🔍 Opening account picker for defaultPaymentAccount');
                    this.openAccountPicker('defaultPaymentAccount', 'defaultPaymentAccountDisplay');
                });
                Logger.log('✅ Setup account picker button for defaultPaymentAccount');
            } else {
                Logger.warn('⚠️ Button openDefaultPaymentAccountPicker not found');
            }
            
            // Default addition counter account
            const defaultAdditionCounterAccount = document.getElementById('defaultAdditionCounterAccount');
            const defaultAdditionCounterAccountDisplay = document.getElementById('defaultAdditionCounterAccountDisplay');
            if (defaultAdditionCounterAccount && settings.defaultAdditionCounterAccountId) {
                defaultAdditionCounterAccount.value = settings.defaultAdditionCounterAccountId;
                const account = this.accounts.find(a => a.id === settings.defaultAdditionCounterAccountId);
                if (defaultAdditionCounterAccountDisplay && account) {
                    defaultAdditionCounterAccountDisplay.value = account.name;
                }
            }
            // Picker button for addition counter account
            const openAdditionCounterPickerBtn = document.getElementById('openDefaultAdditionCounterAccountPicker');
            if (openAdditionCounterPickerBtn) {
                const newBtn = openAdditionCounterPickerBtn.cloneNode(true);
                newBtn.id = 'openDefaultAdditionCounterAccountPicker'; // Ensure ID is preserved
                openAdditionCounterPickerBtn.parentNode.replaceChild(newBtn, openAdditionCounterPickerBtn);
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    Logger.log('🔍 Opening account picker for defaultAdditionCounterAccount');
                    this.openAccountPicker('defaultAdditionCounterAccount', 'defaultAdditionCounterAccountDisplay');
                });
                Logger.log('✅ Setup account picker button for defaultAdditionCounterAccount');
            } else {
                Logger.warn('⚠️ Button openDefaultAdditionCounterAccountPicker not found');
            }
            
            // Default discount counter account
            const defaultDiscountCounterAccount = document.getElementById('defaultDiscountCounterAccount');
            const defaultDiscountCounterAccountDisplay = document.getElementById('defaultDiscountCounterAccountDisplay');
            if (defaultDiscountCounterAccount && settings.defaultDiscountCounterAccountId) {
                defaultDiscountCounterAccount.value = settings.defaultDiscountCounterAccountId;
                const account = this.accounts.find(a => a.id === settings.defaultDiscountCounterAccountId);
                if (defaultDiscountCounterAccountDisplay && account) {
                    defaultDiscountCounterAccountDisplay.value = account.name;
                }
            }
            // Picker button for discount counter account
            const openDiscountCounterPickerBtn = document.getElementById('openDefaultDiscountCounterAccountPicker');
            if (openDiscountCounterPickerBtn) {
                const newBtn = openDiscountCounterPickerBtn.cloneNode(true);
                newBtn.id = 'openDefaultDiscountCounterAccountPicker'; // Ensure ID is preserved
                openDiscountCounterPickerBtn.parentNode.replaceChild(newBtn, openDiscountCounterPickerBtn);
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    Logger.log('🔍 Opening account picker for defaultDiscountCounterAccount');
                    this.openAccountPicker('defaultDiscountCounterAccount', 'defaultDiscountCounterAccountDisplay');
                });
                Logger.log('✅ Setup account picker button for defaultDiscountCounterAccount');
            } else {
                Logger.warn('⚠️ Button openDefaultDiscountCounterAccountPicker not found');
            }

        } catch (error) {
            console.error('Error loading general settings:', error);
        }
    },

    /**
     * Save default values settings
     */
    async saveDefaultValues() {
        try {
            const defaultCurrency = document.getElementById('defaultPurchaseCurrency').value;
            const defaultPaymentMethod = document.getElementById('defaultPaymentMethod').value;
            const defaultWarehouse = document.getElementById('defaultWarehouse').value;
            const defaultCostCenter = document.getElementById('defaultCostCenter').value;

            const settings = await this.getSettings();
            settings.defaultCurrency = defaultCurrency;
            settings.defaultPaymentMethod = defaultPaymentMethod;
            settings.defaultWarehouse = defaultWarehouse;
            settings.defaultCostCenter = defaultCostCenter;

            await this.saveSettings(settings);
            showSuccess('تم حفظ القيم الافتراضية بنجاح');

        } catch (error) {
            console.error('Error saving default values:', error);
            showError('خطأ في حفظ القيم الافتراضية');
        }
    },

    /**
     * Save general settings
     */
    async saveGeneralSettings() {
        try {
            const autoGenerateInvoiceNumbers = document.getElementById('autoGenerateInvoiceNumbers').checked;
            const autoUpdateStock = document.getElementById('autoUpdateStock').checked;
            const autoGenerateGeneralEntry = document.getElementById('autoGenerateGeneralEntry').checked;
            const defaultTaxRate = parseFloat(document.getElementById('defaultTaxRate').value) || 0;
            
            const defaultCounterAccount = document.getElementById('defaultCounterAccount');
            const defaultCounterAccountId = defaultCounterAccount ? defaultCounterAccount.value : '';
            
            const defaultCreditAccount = document.getElementById('defaultCreditAccount');
            const defaultCreditAccountId = defaultCreditAccount ? defaultCreditAccount.value : '';
            
            const defaultAdditionCounterAccount = document.getElementById('defaultAdditionCounterAccount');
            const defaultAdditionCounterAccountId = defaultAdditionCounterAccount ? defaultAdditionCounterAccount.value : '';
            
            const defaultDiscountCounterAccount = document.getElementById('defaultDiscountCounterAccount');
            const defaultDiscountCounterAccountId = defaultDiscountCounterAccount ? defaultDiscountCounterAccount.value : '';
            
            const defaultPaymentAccount = document.getElementById('defaultPaymentAccount');
            const defaultPaymentAccountId = defaultPaymentAccount ? defaultPaymentAccount.value : '';

            const settings = await this.getSettings();
            settings.autoGenerateInvoiceNumbers = autoGenerateInvoiceNumbers;
            settings.autoUpdateStock = autoUpdateStock;
            settings.autoGenerateGeneralEntry = autoGenerateGeneralEntry;
            settings.defaultTaxRate = defaultTaxRate;
            settings.defaultCounterAccountId = defaultCounterAccountId || '';
            settings.defaultCreditAccountId = defaultCreditAccountId || '';
            settings.defaultAdditionCounterAccountId = defaultAdditionCounterAccountId || '';
            settings.defaultDiscountCounterAccountId = defaultDiscountCounterAccountId || '';
            settings.defaultPaymentAccountId = defaultPaymentAccountId || '';

            await this.saveSettings(settings);
            showSuccess('تم حفظ الإعدادات العامة بنجاح');

        } catch (error) {
            console.error('Error saving general settings:', error);
            showError('خطأ في حفظ الإعدادات العامة');
        }
    },

    /**
     * Save print fields settings
     */
    async savePrintFieldsSettings() {
        try {
            const printFields = {
                invoiceNo: document.getElementById('printInvoiceNo').checked,
                date: document.getElementById('printDate').checked,
                paymentMethod: document.getElementById('printPaymentMethod').checked,
                status: document.getElementById('printStatus').checked,
                costCenter: document.getElementById('printCostCenter').checked,
                warehouse: document.getElementById('printWarehouse').checked,
                supplierName: document.getElementById('printSupplierName').checked,
                supplierPhone: document.getElementById('printSupplierPhone').checked,
                supplierAddress: document.getElementById('printSupplierAddress').checked,
                subtotal: document.getElementById('printSubtotal').checked,
                discount: document.getElementById('printDiscount').checked,
                addition: document.getElementById('printAddition').checked,
                total: document.getElementById('printTotal').checked,
                paid: document.getElementById('printPaid').checked,
                remaining: document.getElementById('printRemaining').checked,
                notes: document.getElementById('printNotes').checked,
                productName: document.getElementById('printProductName').checked,
                productQuantity: document.getElementById('printProductQuantity').checked,
                productUnit: document.getElementById('printProductUnit').checked,
                productUnitPrice: document.getElementById('printProductUnitPrice').checked,
                productNetPrice: document.getElementById('printProductNetPrice').checked,
                productTotal: document.getElementById('printProductTotal').checked,
                productDiscount: document.getElementById('printProductDiscount').checked,
                productAddition: document.getElementById('printProductAddition').checked,
                productExpiryDate: document.getElementById('printProductExpiryDate').checked,
                productSerialNumber: document.getElementById('printProductSerialNumber').checked,
                productNotes: document.getElementById('printProductNotes').checked
            };

            const settings = await this.getSettings();
            settings.printFields = printFields;

            await this.saveSettings(settings);
            showSuccess('تم حفظ إعدادات الحقول المطبوعة بنجاح');

        } catch (error) {
            console.error('Error saving print fields settings:', error);
            showError('خطأ في حفظ إعدادات الحقول المطبوعة');
        }
    },

    /**
     * Load print fields settings
     */
    async loadPrintFieldsSettings() {
        try {
            const settings = await this.getSettings();
            const printFields = settings.printFields || {
                invoiceNo: true,
                date: true,
                paymentMethod: true,
                status: true,
                costCenter: true,
                warehouse: true,
                supplierName: true,
                supplierPhone: true,
                supplierAddress: true,
                subtotal: true,
                discount: true,
                addition: true,
                total: true,
                paid: true,
                remaining: true,
                notes: true,
                productName: true,
                productQuantity: true,
                productUnit: true,
                productUnitPrice: true,
                productTotal: true
            };

            // Set checkboxes
            const fields = [
                'invoiceNo', 'date', 'paymentMethod', 'status', 'costCenter', 'warehouse',
                'supplierName', 'supplierPhone', 'supplierAddress',
                'subtotal', 'discount', 'addition', 'total', 'paid', 'remaining', 'notes',
                'productName', 'productQuantity', 'productUnit', 'productUnitPrice', 'productNetPrice', 'productTotal',
                'productDiscount', 'productAddition', 'productExpiryDate', 'productSerialNumber', 'productNotes'
            ];

            fields.forEach(field => {
                const checkbox = document.getElementById(`print${field.charAt(0).toUpperCase() + field.slice(1)}`);
                if (checkbox) {
                    checkbox.checked = printFields[field] !== false; // Default to true if not set
                }
            });

        } catch (error) {
            console.error('Error loading print fields settings:', error);
        }
    },

    /**
     * Get settings from database
     */
    async getSettings() {
        try {
            const doc = await db.collection('purchasesSettings').doc('default').get();
            if (doc.exists) {
                return doc.data();
            }
            
            // ✅ استخدام العملة الأساسية كافتراضي
            const baseCurrency = this.currencies.find(c => c.isBaseCurrency);
            const defaultCurrency = baseCurrency ? baseCurrency.code : 'IQD';
            
            return {
                defaultCurrency: defaultCurrency,
                defaultPaymentMethod: 'cash',
                defaultWarehouse: '',
                defaultCostCenter: '',
                autoGenerateInvoiceNumbers: true,
                autoUpdateStock: true,
                autoGenerateGeneralEntry: true,
                defaultTaxRate: 0,
                defaultCounterAccountId: '',
                defaultCreditAccountId: '',
                defaultAdditionCounterAccountId: '',
                defaultDiscountCounterAccountId: '',
                printFields: {
                    invoiceNo: true,
                    date: true,
                    paymentMethod: true,
                    status: true,
                    costCenter: true,
                    warehouse: true,
                    supplierName: true,
                    supplierPhone: true,
                    supplierAddress: true,
                    subtotal: true,
                    discount: true,
                    addition: true,
                    total: true,
                    paid: true,
                    remaining: true,
                    notes: true,
                    productName: true,
                    productQuantity: true,
                    productUnit: true,
                    productUnitPrice: true,
                    productTotal: true,
                    productDiscount: true,
                    productAddition: true,
                    productExpiryDate: true,
                    productSerialNumber: true,
                    productNotes: true
                }
            };
        } catch (error) {
            console.error('Error getting settings:', error);
            
            // ✅ استخدام العملة الأساسية كافتراضي في حالة الخطأ
            const baseCurrency = this.currencies.find(c => c.isBaseCurrency);
            const defaultCurrency = baseCurrency ? baseCurrency.code : 'IQD';
            
            return {
                defaultCurrency: defaultCurrency,
                defaultPaymentMethod: 'cash',
                defaultWarehouse: '',
                defaultCostCenter: '',
                autoGenerateInvoiceNumbers: true,
                autoUpdateStock: true,
                autoGenerateGeneralEntry: true,
                defaultTaxRate: 0,
                defaultCounterAccountId: '',
                defaultCreditAccountId: '',
                defaultAdditionCounterAccountId: '',
                defaultDiscountCounterAccountId: '',
                printFields: {
                    invoiceNo: true,
                    date: true,
                    paymentMethod: true,
                    status: true,
                    costCenter: true,
                    warehouse: true,
                    supplierName: true,
                    supplierPhone: true,
                    supplierAddress: true,
                    subtotal: true,
                    discount: true,
                    addition: true,
                    total: true,
                    paid: true,
                    remaining: true,
                    notes: true,
                    productName: true,
                    productQuantity: true,
                    productUnit: true,
                    productUnitPrice: true,
                    productTotal: true,
                    productDiscount: true,
                    productAddition: true,
                    productExpiryDate: true,
                    productSerialNumber: true,
                    productNotes: true
                }
            };
        }
    },

    /**
     * Save settings to database
     */
    async saveSettings(settings) {
        try {
            await db.collection('purchasesSettings').doc('default').set({
                ...settings,
                updatedAt: new Date(),
                updatedBy: auth.currentUser?.uid || 'system'
            });
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    },

    /**
     * Reset to default settings
     */
    async resetToDefaults() {
        try {
            const result = await Swal.fire({
                title: 'تأكيد إعادة التعيين',
                text: 'هل أنت متأكد من إعادة تعيين جميع الإعدادات إلى القيم الافتراضية؟',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'نعم، إعادة تعيين',
                cancelButtonText: 'إلغاء',
                confirmButtonColor: '#dc3545'
            });

            if (result.isConfirmed) {
                // ✅ استخدام العملة الأساسية من قاعدة البيانات
                const baseCurrency = this.currencies.find(c => c.isBaseCurrency);
                const defaultCurrency = baseCurrency ? baseCurrency.code : 'IQD';
                
                const defaultSettings = {
                    defaultCurrency: defaultCurrency,
                    defaultPaymentMethod: 'cash',
                    defaultWarehouse: '',
                    defaultCostCenter: '',
                    autoGenerateInvoiceNumbers: true,
                    autoUpdateStock: true,
                    autoGenerateGeneralEntry: true,
                    defaultTaxRate: 0,
                    defaultCounterAccountId: '',
                    defaultCreditAccountId: '',
                    defaultAdditionCounterAccountId: '',
                    defaultDiscountCounterAccountId: '',
                    printFields: {
                        invoiceNo: true,
                        date: true,
                        paymentMethod: true,
                        status: true,
                        costCenter: true,
                        warehouse: true,
                        supplierName: true,
                        supplierPhone: true,
                        supplierAddress: true,
                        subtotal: true,
                        discount: true,
                        addition: true,
                        total: true,
                        paid: true,
                        remaining: true,
                        notes: true,
                        productName: true,
                        productQuantity: true,
                        productUnit: true,
                        productUnitPrice: true,
                        productTotal: true,
                        productDiscount: true,
                        productAddition: true,
                        productExpiryDate: true,
                        productSerialNumber: true,
                        productNotes: true
                    }
                };

                await this.saveSettings(defaultSettings);
                await this.loadSettings();
                showSuccess('تم إعادة تعيين الإعدادات بنجاح');
            }

        } catch (error) {
            console.error('Error resetting settings:', error);
            showError('خطأ في إعادة تعيين الإعدادات');
        }
    },

    /**
     * Export settings
     */
    async exportSettings() {
        try {
            const settings = await this.getSettings();
            const dataStr = JSON.stringify(settings, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = 'purchases-settings.json';
            link.click();
            
            showSuccess('تم تصدير الإعدادات بنجاح');

        } catch (error) {
            console.error('Error exporting settings:', error);
            showError('خطأ في تصدير الإعدادات');
        }
    },

    /**
     * Import settings
     */
    async importSettings() {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const text = await file.text();
                const settings = JSON.parse(text);
                
                await this.saveSettings(settings);
                await this.loadSettings();
                showSuccess('تم استيراد الإعدادات بنجاح');
            };
            
            input.click();

        } catch (error) {
            console.error('Error importing settings:', error);
            showError('خطأ في استيراد الإعدادات');
        }
    },

    /**
     * Test settings
     */
    async testSettings() {
        try {
            const settings = await this.getSettings();
            
            let testResults = [];
            
            // Test default currency
            testResults.push(`✅ العملة الافتراضية: ${settings.defaultCurrency}`);
            
            // Test default payment method
            testResults.push(`✅ طريقة الدفع الافتراضية: ${settings.defaultPaymentMethod === 'cash' ? 'نقدي' : 'آجل'}`);
            
            // Test default warehouse
            if (settings.defaultWarehouse) {
                const warehouse = this.warehouses.find(w => w.id === settings.defaultWarehouse);
                testResults.push(`✅ المستودع الافتراضي: ${warehouse ? warehouse.name : 'غير موجود'}`);
            } else {
                testResults.push('⚠️ لم يتم تحديد المستودع الافتراضي');
            }

            // Test default cost center
            if (settings.defaultCostCenter) {
                const costCenter = this.costCenters.find(c => c.id === settings.defaultCostCenter);
                testResults.push(`✅ مركز الكلفة الافتراضي: ${costCenter ? costCenter.name : 'غير موجود'}`);
            } else {
                testResults.push('⚠️ لم يتم تحديد مركز الكلفة الافتراضي');
            }

            // Test general settings
            testResults.push(`✅ توليد أرقام الفواتير تلقائياً: ${settings.autoGenerateInvoiceNumbers ? 'مفعل' : 'معطل'}`);
            testResults.push(`✅ تحديث المخزون تلقائياً: ${settings.autoUpdateStock ? 'مفعل' : 'معطل'}`);
            testResults.push(`✅ توليد القيد العام تلقائياً: ${settings.autoGenerateGeneralEntry ? 'مفعل' : 'معطل'}`);
            testResults.push(`✅ معدل الضريبة الافتراضي: ${settings.defaultTaxRate}%`);

            Swal.fire({
                title: 'نتائج اختبار الإعدادات',
                html: testResults.map(result => `<p>${result}</p>`).join(''),
                icon: 'info',
                confirmButtonText: 'موافق'
            });

        } catch (error) {
            console.error('Error testing settings:', error);
            showError('خطأ في اختبار الإعدادات');
        }
    },

    /**
     * Create autocomplete field helper function
     * @param {string} inputId - ID of the input field
     * @param {Array} dataList - Array of items to search in
     * @param {Function} getDisplayText - Function to get display text from item
     * @param {Function} getValue - Function to get value from item
     * @param {Function} onSelect - Callback when item is selected
     * @param {string} placeholder - Placeholder text
     * @param {boolean} required - Is field required
     */
    createAutocompleteField(inputId, dataList, getDisplayText, getValue, onSelect, placeholder = '', required = false, excelMode = false) {
        const container = document.createElement('div');
        container.className = 'autocomplete-container';
        container.style.position = 'relative';
        container.style.overflow = 'visible'; // Important: allow dropdown to overflow
        container.style.width = '100%'; // Ensure full width
        
        const input = document.createElement('input');
        input.type = 'text';
        input.id = inputId;
        input.className = 'form-control form-control-sm autocomplete-input';
        input.placeholder = placeholder;
        input.autocomplete = 'off';
        input.style.width = '100%'; // Ensure input takes full width
        input.style.border = '1px solid #d0d7e5';
        input.style.borderRadius = '0';
        input.style.padding = '4px 8px';
        if (required) input.required = true;
        
        // Hidden input to store the selected ID
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id = `${inputId}Id`;
        
        const dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown';
        dropdown.style.display = 'none';
        dropdown.style.position = 'absolute';
        dropdown.style.top = '100%';
        dropdown.style.left = '0';
        dropdown.style.right = '0';
        dropdown.style.zIndex = '99999'; // Very high z-index to appear above modals (Bootstrap modals use 1050)
        dropdown.style.backgroundColor = 'white';
        dropdown.style.border = '1px solid #ddd';
        dropdown.style.borderRadius = '4px';
        dropdown.style.maxHeight = '200px';
        dropdown.style.overflowY = 'auto';
        dropdown.style.overflowX = 'hidden';
        dropdown.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        dropdown.style.marginTop = '2px';
        dropdown.style.width = '100%';
        dropdown.style.minWidth = '200px';
        
        // Ensure dropdown is not clipped by parent containers
        dropdown.setAttribute('data-autocomplete-dropdown', 'true');
        
        container.appendChild(input);
        container.appendChild(hiddenInput);
        container.appendChild(dropdown);
        
        let selectedIndex = -1;
        let filteredItems = [];
        
        // Filter function
        const filterItems = (searchText, showAll = false) => {
            // If showAll is true, show all items even if searchText is empty
            if (showAll && (!searchText || searchText.length < 1)) {
                filteredItems = [...dataList]; // Show all items
                Logger.log(`🔍 Showing all ${filteredItems.length} items`);
            } else if (!searchText || searchText.length < 1) {
                filteredItems = [];
                dropdown.style.display = 'none';
                return;
            } else {
                const searchLower = searchText.toLowerCase();
                filteredItems = dataList.filter(item => {
                    const displayText = getDisplayText(item).toLowerCase();
                    return displayText.includes(searchLower);
                });
                
                Logger.log(`🔍 Autocomplete search for "${searchText}": Found ${filteredItems.length} items`);
            }
            
            if (filteredItems.length > 0) {
                renderDropdown();
                dropdown.style.display = 'block';
                selectedIndex = -1; // Reset selection
                
                // Force reflow to ensure dropdown is visible
                dropdown.offsetHeight;
                
                Logger.log(`✅ Dropdown displayed with ${filteredItems.length} items`);
            } else {
                dropdown.style.display = 'none';
                Logger.log('⚠️ No items found, hiding dropdown');
            }
        };
        
        // Render dropdown
        const renderDropdown = () => {
            dropdown.innerHTML = '';
            filteredItems.forEach((item, index) => {
                const option = document.createElement('div');
                option.className = 'autocomplete-option';
                option.style.padding = '8px 12px';
                option.style.cursor = 'pointer';
                option.style.borderBottom = '1px solid #eee';
                option.style.transition = 'background-color 0.2s';
                option.textContent = getDisplayText(item);
                
                if (index === selectedIndex) {
                    option.style.backgroundColor = '#e3f2fd';
                    option.style.fontWeight = '500';
                } else {
                    option.style.backgroundColor = 'transparent';
                    option.style.fontWeight = 'normal';
                }
                
                option.addEventListener('mouseenter', () => {
                    selectedIndex = index;
                    renderDropdown();
                });
                
                option.addEventListener('click', () => {
                    selectItem(item);
                });
                
                dropdown.appendChild(option);
            });
            
            // Ensure dropdown is visible
            dropdown.style.display = 'block';
        };
        
        // Select item
        const selectItem = (item) => {
            input.value = getDisplayText(item);
            hiddenInput.value = getValue(item);
            dropdown.style.display = 'none';
            selectedIndex = -1;
            
            if (onSelect) {
                onSelect(item);
            }
            
            // In Excel mode, after selecting item, move to next cell
            if (excelMode) {
                // Use setTimeout to ensure onSelect callback completes first
                setTimeout(() => {
                    const currentRow = input.closest('tr');
                    if (currentRow) {
                        const currentColumnIndex = Array.from(currentRow.cells).indexOf(input.closest('td'));
                        // Use nextElementSibling for better performance
                        const nextRow = currentRow.nextElementSibling;
                        
                        if (nextRow) {
                            const nextCell = nextRow.cells[currentColumnIndex];
                            if (nextCell) {
                                const autocompleteContainer = nextCell.querySelector('.autocomplete-container');
                                let nextInput = null;
                                
                                if (autocompleteContainer) {
                                    nextInput = autocompleteContainer.querySelector('input[type="text"]');
                                } else {
                                    nextInput = nextCell.querySelector('input:not([readonly]):not([disabled])');
                                }
                                
                                if (nextInput) {
                                    nextInput.focus();
                                    if (nextInput.tagName === 'INPUT' && nextInput.type === 'text') {
                                        nextInput.select();
                                    }
                                }
                            }
                        }
                    }
                }, 100);
            }
        };
        
        // Input event listener
        input.addEventListener('input', (e) => {
            const searchText = e.target.value;
            if (searchText.length >= 1) {
                filterItems(searchText);
            } else {
                dropdown.style.display = 'none';
                hiddenInput.value = '';
                selectedIndex = -1;
            }
        });
        
        // Focus event listener - show dropdown if there's text
        input.addEventListener('focus', () => {
            const searchText = input.value;
            if (searchText && searchText.length >= 1) {
                filterItems(searchText);
            }
        });
        
        // Click event listener - show dropdown if there's text
        input.addEventListener('click', () => {
            const searchText = input.value;
            if (searchText && searchText.length >= 1) {
                filterItems(searchText);
            }
        });
        
        // Double-click or Ctrl+Click to show all items
        input.addEventListener('dblclick', () => {
            filterItems('', true); // Show all items
        });
        
        // Keyboard navigation
        input.addEventListener('keydown', (e) => {
            // Handle Enter key
            if (e.key === 'Enter') {
                // In Excel mode, handle Enter differently
                if (excelMode) {
                    // If dropdown is visible and has items, select the highlighted item
                    if (dropdown.style.display !== 'none' && filteredItems.length > 0) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (selectedIndex >= 0 && selectedIndex < filteredItems.length) {
                            selectItem(filteredItems[selectedIndex]);
                        } else if (filteredItems.length === 1) {
                            // If only one result, select it automatically
                            selectItem(filteredItems[0]);
                        } else if (filteredItems.length > 0 && selectedIndex === -1) {
                            // If no item selected but there are results, select first one
                            selectItem(filteredItems[0]);
                        }
                        return;
                    } else {
                        // Dropdown is hidden - don't open it, let Excel navigation handle it
                        // Don't prevent default or stop propagation - let Excel navigation handler take over
                        return;
                    }
                }
                
                // Non-Excel mode: If Enter is pressed and dropdown is hidden, show it
                if (dropdown.style.display === 'none') {
                    const searchText = input.value;
                    if (searchText && searchText.length >= 1) {
                        // If there's text, filter by it
                        filterItems(searchText);
                    } else {
                        // If no text, show all items
                        filterItems('', true);
                    }
                    e.preventDefault();
                    return;
                }
            }
            
            // If dropdown is hidden or no items, don't handle navigation (except Enter which is handled above)
            if (dropdown.style.display === 'none' || filteredItems.length === 0) {
                return;
            }
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, filteredItems.length - 1);
                renderDropdown();
                // Scroll to selected item
                const options = dropdown.querySelectorAll('.autocomplete-option');
                if (options[selectedIndex]) {
                    options[selectedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                renderDropdown();
                // Scroll to selected item
                if (selectedIndex >= 0) {
                    const options = dropdown.querySelectorAll('.autocomplete-option');
                    if (options[selectedIndex]) {
                        options[selectedIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                    }
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < filteredItems.length) {
                    selectItem(filteredItems[selectedIndex]);
                } else if (filteredItems.length === 1) {
                    // If only one result, select it automatically
                    selectItem(filteredItems[0]);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                dropdown.style.display = 'none';
                selectedIndex = -1;
            }
        });
        
        // Close dropdown when clicking outside
        const handleClickOutside = (e) => {
            if (!container.contains(e.target)) {
                dropdown.style.display = 'none';
                selectedIndex = -1;
            }
        };
        
        // Use capture phase to ensure we catch the event
        document.addEventListener('click', handleClickOutside, true);
        
        // Store cleanup function (if needed in future)
        container._cleanup = () => {
            document.removeEventListener('click', handleClickOutside, true);
        };
        
        return container;
    },

    /**
     * Cancel purchase form - تنظيف النموذج وإعادة تعيين المتغيرات عند الإلغاء
     */
    cancelPurchaseForm() {
        Logger.log('🔄 تنظيف نموذج فاتورة المشتريات...');
        
        // ✅ Cleanup all modal event listeners
        this.cleanupPurchaseModalListeners();
        
        // ✅ Cleanup autocomplete fields listeners
        this.cleanupAutocompleteFieldsListeners();
        
        // ✅ Cleanup observers and handlers
        const purchaseTotalElement = document.getElementById('purchaseTotal');
        if (purchaseTotalElement?._totalObserver) {
            purchaseTotalElement._totalObserver.disconnect();
            delete purchaseTotalElement._totalObserver;
        }
        
        const counterAccountSelect = document.getElementById('purchaseCounterAccount');
        if (counterAccountSelect?._counterAccountObserver) {
            counterAccountSelect._counterAccountObserver.disconnect();
            delete counterAccountSelect._counterAccountObserver;
        }
        
        // ✅ Cleanup scroll buttons resize handler
        const container = document.getElementById('purchaseItemsTableContainer');
        if (container?._resizeHandler) {
            window.removeEventListener('resize', container._resizeHandler);
            delete container._resizeHandler;
        }
        if (container?._scrollObserver) {
            container._scrollObserver.disconnect();
            delete container._scrollObserver;
        }
        
        // ✅ Cleanup accessibility observer
        const purchaseModal = document.getElementById('purchaseModal');
        if (purchaseModal?._accessibilityObserver) {
            purchaseModal._accessibilityObserver.disconnect();
            delete purchaseModal._accessibilityObserver;
        }
        if (purchaseModal?._accessibilityFocusHandler) {
            purchaseModal.removeEventListener('focusin', purchaseModal._accessibilityFocusHandler);
            delete purchaseModal._accessibilityFocusHandler;
        }
        
        // إعادة تعيين المتغيرات
        this.editingPurchase = null;
        this.isPopulatingForm = false; // ✅ إعادة تعيين flag التعديل
        this.currentPurchaseItems = [];
        this.copiedRow = null;
        this.copiedRows = [];
        this.currentSalesRepNumber = null;
        
        // إعادة تعيين العملة وسعر الصرف
        this.currentPurchaseCurrency = 'IQD';
        this.currentPurchaseExchangeRate = 1;
        
        // تنظيف جدول العناصر
        const purchaseItemsBody = document.getElementById('purchaseItemsBody');
        if (purchaseItemsBody) {
            purchaseItemsBody.innerHTML = '';
        }
        
        // تنظيف جدول الخصومات والإضافات
        const discountsAdditionsBody = document.getElementById('discountsAdditionsBody');
        if (discountsAdditionsBody) {
            discountsAdditionsBody.innerHTML = '';
        }
        
        // إعادة تعيين الإجماليات
        const purchaseTotal = document.getElementById('purchaseTotal');
        if (purchaseTotal) {
            purchaseTotal.textContent = '0.00';
        }
        
        const purchasePaidAmount = document.getElementById('purchasePaidAmount');
        if (purchasePaidAmount) {
            purchasePaidAmount.value = '0';
        }
        
        const purchaseRemainingAmount = document.getElementById('purchaseRemainingAmount');
        if (purchaseRemainingAmount) {
            purchaseRemainingAmount.value = '0.00';
        }
        
        // تنظيف النموذج (إذا كان موجوداً)
        const purchaseForm = document.getElementById('purchaseForm');
        if (purchaseForm) {
            purchaseForm.reset();
        }
        
        // إخفاء معاينة القيد العام
        const previewDiv = document.getElementById('generalEntryPreview');
        if (previewDiv) {
            previewDiv.style.display = 'none';
        }
        
        // إعادة تعيين زر تحديث المعاينة
        const refreshBtn = document.getElementById('refreshGeneralEntryPreviewBtn');
        if (refreshBtn) {
            refreshBtn.style.display = 'none';
        }
        
        // إعادة تعيين حالة التعديل في العنوان
        const modalTitle = document.querySelector('#purchaseModal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'إضافة فاتورة شراء جديدة';
        }
        
        // إعادة تعيين زر الحفظ
        const saveBtn = document.getElementById('savePurchaseBtn');
        if (saveBtn) {
            saveBtn.textContent = 'حفظ';
            saveBtn.innerHTML = '<i class="fas fa-save"></i> حفظ';
        }
        
        Logger.log('✅ تم تنظيف نموذج فاتورة المشتريات بنجاح');
    },
    
    /**
     * ✅ Cleanup function - تنظيف جميع event listeners و observers عند إغلاق الوحدة
     */
    cleanup() {
        Logger.log('🧹 Cleaning up Purchases Module...');
        
        // Remove window event listeners
        if (this._productUpdatedHandler) {
            window.removeEventListener('productUpdated', this._productUpdatedHandler);
            delete this._productUpdatedHandler;
        }
        
        if (this._dataSyncHandler) {
            window.removeEventListener('dataSync', this._dataSyncHandler);
            delete this._dataSyncHandler;
        }
        
        // Cleanup scroll buttons
        const container = document.getElementById('purchaseItemsTableContainer');
        if (container?._resizeHandler) {
            window.removeEventListener('resize', container._resizeHandler);
            delete container._resizeHandler;
        }
        if (container?._scrollObserver) {
            container._scrollObserver.disconnect();
            delete container._scrollObserver;
        }
        
        // Cleanup dropdown click outside handler
        const dropdowns = document.querySelectorAll('[data-cleanup]');
        dropdowns.forEach(dropdown => {
            if (dropdown._cleanup) {
                dropdown._cleanup();
            }
        });
        
        Logger.log('✅ Purchases Module cleaned up');
    }
};

Logger.log('✅ Purchases module loaded');







