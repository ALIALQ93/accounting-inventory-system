/**
 * Purchase Returns Module - Complete Purchase Returns Management
 * @module modules/purchase-returns
 * 
 * This module handles purchase returns (مرتجع المشتريات)
 * Key differences from purchases:
 * - Inventory: subtracts stock instead of adding (يقلل المخزون)
 * - Accounting: supplier is debited instead of credited (المورد مدين)
 * - Invoice prefix: "PRET-" instead of "PUR-"
 * - Type: 'purchase_return' instead of 'purchase'
 */

const PurchaseReturnsModule = {
    // Data storage
    currentTab: 'dashboard',
    purchaseReturns: [],
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
    editingReturn: null,
    editingSupplier: null,
    currentReturnItems: [],
    currentReturnCurrency: 'IQD',
    currentReturnExchangeRate: 1,
    copiedRow: null,
    copiedRows: [],
    currentSalesRepNumber: null,

    /**
     * Escape HTML to prevent XSS attacks
     * ✅ Using shared utility function from InvoiceUtils
     */
    escapeHtml(text) {
        return InvoiceUtils.escapeHtml(text);
    },

    /**
     * Get HTML structure for the module
     */
    getHTML() {
        return `
            <div class="purchase-returns-module">
                <!-- Header -->
                <div class="module-header">
                    <div class="header-content">
                        <div class="header-title">
                            <i class="fas fa-undo"></i>
                            <h2>إدارة مرتجع المشتريات</h2>
                        </div>
                        <div class="header-actions">
                            <button class="btn btn-primary" id="newPurchaseReturnBtn">
                                <i class="fas fa-plus"></i> إضافة مرتجع شراء
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Navigation Tabs -->
                <ul class="nav nav-tabs" id="purchaseReturnsTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="dashboard-tab" data-bs-toggle="tab" data-bs-target="#dashboard" type="button" role="tab">
                            <i class="fas fa-tachometer-alt"></i> لوحة التحكم
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="returns-tab" data-bs-toggle="tab" data-bs-target="#returns" type="button" role="tab">
                            <i class="fas fa-undo"></i> مرتجع المشتريات
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="settings-tab" data-bs-toggle="tab" data-bs-target="#settings" type="button" role="tab">
                            <i class="fas fa-cogs"></i> الإعدادات
                        </button>
                    </li>
                </ul>

                <!-- Tab Content -->
                <div class="tab-content" id="purchaseReturnsTabContent">
                    <!-- Dashboard Tab -->
                    <div class="tab-pane fade show active" id="dashboard" role="tabpanel">
                        <div class="dashboard-content">
                            <!-- Summary Cards -->
                            <div class="row mb-4">
                                <div class="col-md-3">
                                    <div class="summary-card">
                                        <div class="card-icon">
                                            <i class="fas fa-undo text-primary"></i>
                                        </div>
                                        <div class="card-content">
                                            <h3 id="totalReturns">0</h3>
                                            <p>إجمالي المرتجعات</p>
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
                                            <h3 id="pendingReturns">0</h3>
                                            <p>مرتجعات معلقة</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Recent Returns -->
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-clock"></i> آخر المرتجعات</h5>
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
                                            <tbody id="recentReturnsTable">
                                                <tr>
                                                    <td colspan="6" class="text-center text-muted">لا توجد مرتجعات</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Returns Tab -->
                    <div class="tab-pane fade" id="returns" role="tabpanel">
                        <div class="returns-content">
                            <!-- Search and Filter -->
                            <div class="row mb-3">
                                <div class="col-md-4">
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                                        <input type="text" class="form-control" id="returnSearch" placeholder="البحث في المرتجعات...">
                                    </div>
                                </div>
                                <div class="col-md-2">
                                    <input type="date" class="form-control" id="returnDateFrom" placeholder="من تاريخ">
                                </div>
                                <div class="col-md-2">
                                    <input type="date" class="form-control" id="returnDateTo" placeholder="إلى تاريخ">
                                </div>
                                <div class="col-md-2">
                                    <select class="form-select" id="returnStatusFilter">
                                        <option value="">جميع الحالات</option>
                                        <option value="completed">مكتمل</option>
                                        <option value="pending">معلق</option>
                                        <option value="cancelled">ملغي</option>
                                    </select>
                                </div>
                                <div class="col-md-2">
                                    <button class="btn btn-outline-secondary" id="clearReturnFilters">
                                        <i class="fas fa-times"></i> مسح الفلاتر
                                    </button>
                                </div>
                            </div>

                            <!-- Returns Table -->
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-undo"></i> قائمة مرتجع المشتريات</h5>
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
                                            <tbody id="returnsTable">
                                                <tr>
                                                    <td colspan="8" class="text-center text-muted">لا توجد مرتجعات</td>
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
                                <h3><i class="fas fa-cogs"></i> إعدادات مرتجع المشتريات</h3>
                                <p>تكوين الإعدادات الافتراضية لفواتير مرتجع المشتريات</p>
                            </div>
                            
                            <div class="row">
                                <!-- Default Values Settings -->
                                <div class="col-md-6">
                                    <div class="settings-card">
                                        <div class="card-header">
                                            <h5><i class="fas fa-sliders-h text-primary"></i> القيم الافتراضية</h5>
                                            <p class="text-muted">تحديد القيم الافتراضية لفواتير مرتجع المشتريات الجديدة</p>
                                        </div>
                                        <div class="card-body">
                                            <!-- Default Currency -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-coins text-warning"></i>
                                                    العملة الافتراضية
                                                </label>
                                                <select class="form-select" id="defaultReturnCurrency">
                                                    <option value="IQD">دينار عراقي (IQD)</option>
                                                    <option value="USD">دولار أمريكي (USD)</option>
                                                    <option value="EUR">يورو (EUR)</option>
                                                </select>
                                                <small class="text-muted">
                                                    العملة الافتراضية لفواتير مرتجع المشتريات الجديدة
                                                </small>
                                            </div>
                                            
                                            <!-- Default Payment Method -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-credit-card text-success"></i>
                                                    طريقة الدفع الافتراضية
                                                </label>
                                                <select class="form-select" id="defaultReturnPaymentMethod">
                                                    <option value="cash">نقدي</option>
                                                    <option value="credit">آجل</option>
                                                </select>
                                                <small class="text-muted">
                                                    طريقة الدفع الافتراضية لفواتير مرتجع المشتريات الجديدة
                                                </small>
                                            </div>
                                            
                                            <!-- Default Warehouse -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-warehouse text-info"></i>
                                                    المستودع الافتراضي
                                                </label>
                                                <select class="form-select" id="defaultReturnWarehouse">
                                                    <option value="">-- اختر المستودع الافتراضي --</option>
                                                </select>
                                                <small class="text-muted">
                                                    المستودع الافتراضي لمرتجع المشتريات الجديدة
                                                </small>
                                            </div>
                                            
                                            <!-- Default Cost Center -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-building text-danger"></i>
                                                    مركز الكلفة الافتراضي
                                                </label>
                                                <select class="form-select" id="defaultReturnCostCenter">
                                                    <option value="">-- اختر مركز الكلفة الافتراضي --</option>
                                                </select>
                                                <small class="text-muted">
                                                    مركز الكلفة الافتراضي لفواتير مرتجع المشتريات الجديدة
                                                </small>
                                            </div>
                                            
                                            <!-- Save Default Values Button -->
                                            <div class="d-grid">
                                                <button class="btn btn-primary" onclick="PurchaseReturnsModule.saveDefaultValues()">
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
                                            <p class="text-muted">تكوين الإعدادات العامة لوحدة مرتجع المشتريات</p>
                                        </div>
                                        <div class="card-body">
                                            <!-- Auto Generate Invoice Numbers -->
                                            <div class="mb-4">
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input" type="checkbox" id="autoGenerateReturnInvoiceNumbers" checked>
                                                    <label class="form-check-label" for="autoGenerateReturnInvoiceNumbers">
                                                        <i class="fas fa-magic text-primary"></i>
                                                        توليد أرقام الفواتير تلقائياً
                                                    </label>
                                                </div>
                                                <small class="text-muted">
                                                    توليد أرقام فواتير مرتجع المشتريات تلقائياً عند الإنشاء
                                                </small>
                                            </div>
                                            
                                            <!-- Auto Update Stock -->
                                            <div class="mb-4">
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input" type="checkbox" id="autoUpdateReturnStock" checked>
                                                    <label class="form-check-label" for="autoUpdateReturnStock">
                                                        <i class="fas fa-boxes text-success"></i>
                                                        تحديث المخزون تلقائياً (تقليل)
                                                    </label>
                                                </div>
                                                <small class="text-muted">
                                                    تقليل كميات المخزون تلقائياً عند حفظ فاتورة مرتجع الشراء
                                                </small>
                                            </div>
                                            
                                            <!-- Allow Return Without Stock -->
                                            <div class="mb-4">
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input" type="checkbox" id="allowReturnWithoutStock">
                                                    <label class="form-check-label" for="allowReturnWithoutStock">
                                                        <i class="fas fa-exclamation-triangle text-warning"></i>
                                                        السماح بالإرجاع دون رصيد
                                                    </label>
                                                </div>
                                                <small class="text-muted">
                                                    السماح بإرجاع منتجات حتى لو لم يكن هناك رصيد كافٍ في المخزون (غير مستحسن)
                                                </small>
                                            </div>
                                            
                                            <!-- Auto Generate General Entry -->
                                            <div class="mb-4">
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input" type="checkbox" id="autoGenerateReturnGeneralEntry" checked>
                                                    <label class="form-check-label" for="autoGenerateReturnGeneralEntry">
                                                        <i class="fas fa-balance-scale text-warning"></i>
                                                        توليد القيد العام تلقائياً
                                                    </label>
                                                </div>
                                                <small class="text-muted">
                                                    توليد القيد المحاسبي تلقائياً عند حفظ فاتورة مرتجع الشراء (المورد مدين)
                                                </small>
                                            </div>
                                            
                                            <!-- Default Tax Rate -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-percentage text-danger"></i>
                                                    معدل الضريبة الافتراضي
                                                </label>
                                                <input type="number" class="form-control" id="defaultReturnTaxRate" value="0" min="0" max="100" step="0.01">
                                                <small class="text-muted">
                                                    معدل الضريبة الافتراضي لفواتير مرتجع المشتريات الجديدة (%)
                                                </small>
                                            </div>
                                            
                                            <!-- Default Counter Account (Credit Account for Returns) -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-exchange-alt text-secondary"></i>
                                                    الحساب الدائن الافتراضي (المشتريات/المخزون)
                                                </label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" id="defaultReturnCounterAccountDisplay" placeholder="اختر من شجرة الحسابات" readonly style="background-color: #f8f9fa;">
                                                    <input type="hidden" id="defaultReturnCounterAccount" value="">
                                                    <button type="button" class="btn btn-outline-secondary" id="openDefaultReturnCounterAccountPicker" title="اختر من شجرة الحسابات">
                                                        <i class="fas fa-sitemap"></i>
                                                    </button>
                                                </div>
                                                <small class="text-muted">
                                                    سيتم استخدام هذا الحساب كدائن مقابل فاتورة مرتجع الشراء (يمكن تغييره داخل الفاتورة).
                                                </small>
                                            </div>
                                            
                                            <!-- Default Debit Account (for Cash payments) -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-credit-card text-primary"></i>
                                                    الحساب المدين الافتراضي (للدفع النقدي)
                                                </label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" id="defaultReturnDebitAccountDisplay" placeholder="اختر من شجرة الحسابات" readonly style="background-color: #f8f9fa;">
                                                    <input type="hidden" id="defaultReturnDebitAccount" value="">
                                                    <button type="button" class="btn btn-outline-secondary" id="openDefaultReturnDebitAccountPicker" title="اختر من شجرة الحسابات">
                                                        <i class="fas fa-sitemap"></i>
                                                    </button>
                                                </div>
                                                <small class="text-muted">
                                                    سيتم استخدام هذا الحساب كمدين في حالة الدفع النقدي (مثل: النقدية، الصندوق).
                                                </small>
                                            </div>
                                            
                                            <!-- Default Counter Account for Additions -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-plus-circle text-success"></i>
                                                    الحساب المقابل للإضافات (دائن الإضافات)
                                                </label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" id="defaultReturnAdditionCounterAccountDisplay" placeholder="اختر من شجرة الحسابات" readonly style="background-color: #f8f9fa;">
                                                    <input type="hidden" id="defaultReturnAdditionCounterAccount" value="">
                                                    <button type="button" class="btn btn-outline-secondary" id="openDefaultReturnAdditionCounterAccountPicker" title="اختر من شجرة الحسابات">
                                                        <i class="fas fa-sitemap"></i>
                                                    </button>
                                                </div>
                                                <small class="text-muted">
                                                    سيتم استخدام هذا الحساب كدائن مقابل حسابات الإضافات (افتراضي: حساب المورد).
                                                </small>
                                            </div>
                                            
                                            <!-- Default Counter Account for Discounts -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-minus-circle text-danger"></i>
                                                    الحساب المقابل للخصومات (مدين الخصومات)
                                                </label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" id="defaultReturnDiscountCounterAccountDisplay" placeholder="اختر من شجرة الحسابات" readonly style="background-color: #f8f9fa;">
                                                    <input type="hidden" id="defaultReturnDiscountCounterAccount" value="">
                                                    <button type="button" class="btn btn-outline-secondary" id="openDefaultReturnDiscountCounterAccountPicker" title="اختر من شجرة الحسابات">
                                                        <i class="fas fa-sitemap"></i>
                                                    </button>
                                                </div>
                                                <small class="text-muted">
                                                    سيتم استخدام هذا الحساب كمدين مقابل حسابات الخصومات (افتراضي: حساب المورد).
                                                </small>
                                            </div>
                                            
                                            <!-- Save General Settings Button -->
                                            <div class="d-grid">
                                                <button class="btn btn-success" onclick="PurchaseReturnsModule.saveGeneralSettings()">
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
                                            <p class="text-muted">اختر الحقول التي تريد طباعتها في فاتورة مرتجع الشراء</p>
                                        </div>
                                        <div class="card-body">
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <h6 class="mb-3"><i class="fas fa-info-circle text-info"></i> معلومات الفاتورة</h6>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printReturnInvoiceNo" checked>
                                                        <label class="form-check-label" for="printReturnInvoiceNo">
                                                            رقم الفاتورة
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printReturnDate" checked>
                                                        <label class="form-check-label" for="printReturnDate">
                                                            التاريخ
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printReturnPaymentMethod" checked>
                                                        <label class="form-check-label" for="printReturnPaymentMethod">
                                                            طريقة الدفع
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printReturnStatus" checked>
                                                        <label class="form-check-label" for="printReturnStatus">
                                                            الحالة
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printReturnCostCenter" checked>
                                                        <label class="form-check-label" for="printReturnCostCenter">
                                                            مركز الكلفة
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printReturnWarehouse" checked>
                                                        <label class="form-check-label" for="printReturnWarehouse">
                                                            المستودع
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <h6 class="mb-3"><i class="fas fa-user text-success"></i> معلومات المورد</h6>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printReturnSupplierName" checked>
                                                        <label class="form-check-label" for="printReturnSupplierName">
                                                            اسم المورد
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printReturnSupplierPhone" checked>
                                                        <label class="form-check-label" for="printReturnSupplierPhone">
                                                            هاتف المورد
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printReturnSupplierAddress" checked>
                                                        <label class="form-check-label" for="printReturnSupplierAddress">
                                                            عنوان المورد
                                                        </label>
                                                    </div>
                                                    
                                                    <h6 class="mb-3 mt-4"><i class="fas fa-calculator text-warning"></i> المبالغ المالية</h6>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printReturnSubtotal" checked>
                                                        <label class="form-check-label" for="printReturnSubtotal">
                                                            المجموع الفرعي
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printReturnDiscount" checked>
                                                        <label class="form-check-label" for="printReturnDiscount">
                                                            الخصم
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printReturnAddition" checked>
                                                        <label class="form-check-label" for="printReturnAddition">
                                                            الإضافة
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printReturnTotal" checked>
                                                        <label class="form-check-label" for="printReturnTotal">
                                                            الإجمالي
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printReturnPaid" checked>
                                                        <label class="form-check-label" for="printReturnPaid">
                                                            المدفوع
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printReturnRemaining" checked>
                                                        <label class="form-check-label" for="printReturnRemaining">
                                                            المتبقي
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printReturnNotes" checked>
                                                        <label class="form-check-label" for="printReturnNotes">
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
                                                                <input class="form-check-input" type="checkbox" id="printReturnProductName" checked>
                                                                <label class="form-check-label" for="printReturnProductName">
                                                                    اسم المنتج
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printReturnProductQuantity" checked>
                                                                <label class="form-check-label" for="printReturnProductQuantity">
                                                                    الكمية
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printReturnProductUnit" checked>
                                                                <label class="form-check-label" for="printReturnProductUnit">
                                                                    الوحدة
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printReturnProductUnitPrice" checked>
                                                                <label class="form-check-label" for="printReturnProductUnitPrice">
                                                                    سعر الوحدة
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printReturnProductTotal" checked>
                                                                <label class="form-check-label" for="printReturnProductTotal">
                                                                    إجمالي المنتج
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printReturnProductDiscount" checked>
                                                                <label class="form-check-label" for="printReturnProductDiscount">
                                                                    خصم المنتج
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printReturnProductAddition" checked>
                                                                <label class="form-check-label" for="printReturnProductAddition">
                                                                    إضافة المنتج
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printReturnProductExpiryDate" checked>
                                                                <label class="form-check-label" for="printReturnProductExpiryDate">
                                                                    تاريخ الصلاحية
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printReturnProductSerialNumber" checked>
                                                                <label class="form-check-label" for="printReturnProductSerialNumber">
                                                                    الرقم التسلسلي
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printReturnProductNotes" checked>
                                                                <label class="form-check-label" for="printReturnProductNotes">
                                                                    ملاحظات المنتج
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="d-grid mt-4">
                                                <button class="btn btn-primary" onclick="PurchaseReturnsModule.savePrintFieldsSettings()">
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
                                                    <button class="btn btn-outline-primary w-100" onclick="PurchaseReturnsModule.resetToDefaults()">
                                                        <i class="fas fa-undo"></i>
                                                        <br>إعادة تعيين الافتراضي
                                                    </button>
                                                </div>
                                                <div class="col-md-3">
                                                    <button class="btn btn-outline-info w-100" onclick="PurchaseReturnsModule.exportSettings()">
                                                        <i class="fas fa-download"></i>
                                                        <br>تصدير الإعدادات
                                                    </button>
                                                </div>
                                                <div class="col-md-3">
                                                    <button class="btn btn-outline-success w-100" onclick="PurchaseReturnsModule.importSettings()">
                                                        <i class="fas fa-upload"></i>
                                                        <br>استيراد الإعدادات
                                                    </button>
                                                </div>
                                                <div class="col-md-3">
                                                    <button class="btn btn-outline-warning w-100" onclick="PurchaseReturnsModule.testSettings()">
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
        console.log('🔄 Loading purchase returns module...');
        this.render();
        await this.loadData();
        this.setupReturnsSync();
        console.log('✅ Purchase returns module loaded');
    },

    async loadData() {
        try {
            console.log('🔄 Loading purchase returns data...');
            await Promise.all([
                this.loadPurchaseReturns(),
                this.loadSuppliers(),
                this.loadProducts(),
                this.loadUnits(),
                this.loadCurrencies(),
                this.loadWarehouses(),
                this.loadCostCenters(),
                this.loadAccounts()
            ]);
            this.updateDashboard();
            console.log('✅ All purchase returns data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading purchase returns data:', error);
        }
    },

    async loadPurchaseReturns() {
        try {
            const snapshot = await db.collection('purchaseReturns').get();
            this.purchaseReturns = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.renderReturnsTable();
        } catch (error) {
            console.error('Error loading purchase returns:', error);
        }
    },

    async loadSuppliers() {
        try {
            const snapshot = await db.collection('parties').get();
            this.suppliers = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(party => party.type === 'supplier' || party.type === 'both');
        } catch (error) {
            console.error('Error loading suppliers:', error);
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
            console.error('Error loading products:', error);
        }
    },

    async loadUnits() {
        try {
            const snapshot = await db.collection('units').get();
            this.units = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log(`✅ Loaded ${this.units.length} units`);
        } catch (error) {
            console.error('Error loading units:', error);
        }
    },

    async loadCurrencies() {
        try {
            const snapshot = await db.collection('currencies').get();
            this.currencies = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading currencies:', error);
        }
    },

    async loadWarehouses() {
        try {
            const snapshot = await db.collection('warehouses').get();
            this.warehouses = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading warehouses:', error);
        }
    },

    async loadCostCenters() {
        try {
            const snapshot = await db.collection('costCenters').get();
            this.costCenters = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading cost centers:', error);
        }
    },

    async loadAccounts() {
        try {
            this.accounts = await ChartOfAccountsModule.getAccounts();
            console.log(`✅ Loaded ${this.accounts.length} accounts`);
        } catch (error) {
            console.error('❌ Error loading accounts:', error);
            this.accounts = [];
        }
    },

    /**
     * Update dashboard statistics
     */
    updateDashboard() {
        const totalReturnsEl = document.getElementById('totalReturns');
        const totalAmountEl = document.getElementById('totalAmount');
        const totalSuppliersEl = document.getElementById('totalSuppliers');
        const pendingReturnsEl = document.getElementById('pendingReturns');

        if (totalReturnsEl) {
            totalReturnsEl.textContent = (this.purchaseReturns || []).length;
        }
        
        if (totalAmountEl) {
            const totalAmount = (this.purchaseReturns || []).reduce((sum, ret) => sum + (ret.total || 0), 0);
            totalAmountEl.textContent = formatNumber(totalAmount);
        }
        
        if (totalSuppliersEl) {
            totalSuppliersEl.textContent = (this.suppliers || []).length;
        }
        
        if (pendingReturnsEl) {
            const pendingReturns = (this.purchaseReturns || []).filter(r => r.status === 'pending').length;
            pendingReturnsEl.textContent = pendingReturns;
        }
        
        this.renderRecentReturns();
    },

    /**
     * Render recent returns in dashboard
     */
    renderRecentReturns() {
        const tbody = document.getElementById('recentReturnsTable');
        if (!tbody) return;

        const recentReturns = (this.purchaseReturns || []).slice(0, 5);
        
        if (recentReturns.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">لا توجد مرتجعات</td></tr>';
            return;
        }

        tbody.innerHTML = recentReturns.map(ret => {
            const statusClass = ret.status === 'completed' ? 'success' : ret.status === 'pending' ? 'warning' : 'danger';
            const statusText = ret.status === 'completed' ? 'مكتمل' : ret.status === 'pending' ? 'معلق' : 'ملغي';
            
            return `
                <tr>
                    <td>${ret.invoiceNo || 'N/A'}</td>
                    <td>${formatDate(ret.date)}</td>
                    <td>${ret.supplierName || 'N/A'}</td>
                    <td>${formatNumber(ret.total || 0)}</td>
                    <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="PurchaseReturnsModule.viewReturn('${ret.id}')" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="PurchaseReturnsModule.printReturn('${ret.id}')" title="طباعة">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="PurchaseReturnsModule.editReturn('${ret.id}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="PurchaseReturnsModule.deleteReturn('${ret.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    /**
     * Render returns table
     */
    renderReturnsTable() {
        const tbody = document.getElementById('returnsTable');
        if (!tbody) return;

        // Check if there are any active filters
        const searchTerm = (document.getElementById('returnSearch')?.value || '').trim();
        const status = document.getElementById('returnStatusFilter')?.value || '';
        const dateFrom = document.getElementById('returnDateFrom')?.value || '';
        const dateTo = document.getElementById('returnDateTo')?.value || '';
        
        // Filter returns
        let filteredReturns = (this.purchaseReturns || []);
        
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filteredReturns = filteredReturns.filter(ret => {
                const invoiceNo = (ret.invoiceNo || '').toLowerCase();
                const supplierName = (ret.supplierName || '').toLowerCase();
                return invoiceNo.includes(searchLower) || supplierName.includes(searchLower);
            });
        }
        
        if (status) {
            filteredReturns = filteredReturns.filter(ret => ret.status === status);
        }
        
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            filteredReturns = filteredReturns.filter(ret => {
                const retDate = ret.date?.toDate ? ret.date.toDate() : new Date(ret.date);
                return retDate >= fromDate;
            });
        }
        
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            filteredReturns = filteredReturns.filter(ret => {
                const retDate = ret.date?.toDate ? ret.date.toDate() : new Date(ret.date);
                return retDate <= toDate;
            });
        }

        if (filteredReturns.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">لا توجد مرتجعات</td></tr>';
            return;
        }

        tbody.innerHTML = filteredReturns.map(ret => {
            const statusClass = ret.status === 'completed' ? 'success' : ret.status === 'pending' ? 'warning' : 'danger';
            const statusText = ret.status === 'completed' ? 'مكتمل' : ret.status === 'pending' ? 'معلق' : 'ملغي';
            
            return `
                <tr>
                    <td>${ret.invoiceNo || 'N/A'}</td>
                    <td>${formatDate(ret.date)}</td>
                    <td>${ret.supplierName || 'N/A'}</td>
                    <td>${formatNumber(ret.total || 0)}</td>
                    <td>${formatNumber(ret.paidAmount || 0)}</td>
                    <td>${formatNumber(ret.remainingAmount || 0)}</td>
                    <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="PurchaseReturnsModule.viewReturn('${ret.id}')" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="PurchaseReturnsModule.viewReturnGeneralEntry('${ret.id}')" title="عرض القيد العام">
                            <i class="fas fa-file-contract"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="PurchaseReturnsModule.printReturn('${ret.id}')" title="طباعة الفاتورة">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="PurchaseReturnsModule.editReturn('${ret.id}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="PurchaseReturnsModule.deleteReturn('${ret.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    setupReturnsSync() {
        if (typeof SyncManager !== 'undefined') {
            // Sync purchase returns
            SyncManager.onCollectionSync('purchaseReturns', (data, syncType) => {
                this.purchaseReturns = data;
                this.renderReturnsTable();
                this.updateDashboard();
                console.log(`🔄 Purchase returns updated via ${syncType} sync`);
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
                        subAccountId: party.subAccountId || null,
                        accountId: party.accountId || null,
                        balance: party.balance || 0,
                        creditLimit: party.creditLimit || 0,
                        status: party.status || 'active',
                        ...party
                    }));
                console.log(`🔄 Suppliers updated via ${syncType} sync`);
            });

            // Sync products - مهم جداً: تحديث قائمة المنتجات عند إضافة/تعديل منتج
            SyncManager.onCollectionSync('products', (data, syncType) => {
                this.products = data;
                console.log(`🔄 Products updated via ${syncType} sync in purchase returns`);
            });

            // Sync categories
            SyncManager.onCollectionSync('categories', (data, syncType) => {
                // يمكن استخدامها في المستقبل إذا لزم الأمر
                console.log(`🔄 Categories updated via ${syncType} sync`);
            });

            // Sync units
            SyncManager.onCollectionSync('units', (data, syncType) => {
                this.units = data;
                console.log(`🔄 Units updated via ${syncType} sync`);
            });

            // Sync currencies
            SyncManager.onCollectionSync('currencies', (data, syncType) => {
                this.currencies = data;
                console.log(`🔄 Currencies updated via ${syncType} sync`);
            });

            // Sync warehouses
            SyncManager.onCollectionSync('warehouses', (data, syncType) => {
                this.warehouses = data;
                console.log(`🔄 Warehouses updated via ${syncType} sync`);
            });

            // Sync cost centers
            SyncManager.onCollectionSync('costCenters', (data, syncType) => {
                this.costCenters = data;
                console.log(`🔄 Cost centers updated via ${syncType} sync`);
            });

            // Sync chart of accounts (not 'accounts' collection)
            SyncManager.onCollectionSync('chartOfAccounts', (data, syncType) => {
                this.accounts = data;
                ChartOfAccountsModule.allAccounts = data;
                console.log(`🔄 Chart of accounts updated via ${syncType} sync`);
            });
        }

        // Listen to product update events from Products module
        window.addEventListener('productUpdated', (event) => {
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
            if (document.getElementById('returnModal')?.classList.contains('show')) {
                // يمكن إعادة تحميل قائمة المنتجات في autocomplete إذا لزم الأمر
            }
        });
    },

    setupEventListeners() {
        // New purchase return button
        const newReturnBtn = document.getElementById('newPurchaseReturnBtn');
        if (newReturnBtn) {
            newReturnBtn.addEventListener('click', () => {
                this.showNewReturnModal();
            });
        }

        // Settings tab - load settings when opened
        const settingsTab = document.getElementById('settings-tab');
        if (settingsTab) {
            settingsTab.addEventListener('shown.bs.tab', () => {
                this.loadSettings();
                this.setupSettingsAccountPickerButtons();
            });
        }

        // Report generation
        const generateReturnReport = document.getElementById('generateReturnReport');
        if (generateReturnReport) {
            generateReturnReport.addEventListener('click', () => {
                this.generateReturnReport();
            });
        }

        // Search and filter listeners
        const returnSearch = document.getElementById('returnSearch');
        if (returnSearch) {
            returnSearch.addEventListener('input', () => {
                this.filterReturns();
            });
        }

        const returnDateFrom = document.getElementById('returnDateFrom');
        const returnDateTo = document.getElementById('returnDateTo');
        const returnStatusFilter = document.getElementById('returnStatusFilter');
        const clearReturnFilters = document.getElementById('clearReturnFilters');

        if (returnDateFrom) {
            returnDateFrom.addEventListener('change', () => this.filterReturns());
        }
        if (returnDateTo) {
            returnDateTo.addEventListener('change', () => this.filterReturns());
        }
        if (returnStatusFilter) {
            returnStatusFilter.addEventListener('change', () => this.filterReturns());
        }
        if (clearReturnFilters) {
            clearReturnFilters.addEventListener('click', () => {
                if (returnSearch) returnSearch.value = '';
                if (returnDateFrom) returnDateFrom.value = '';
                if (returnDateTo) returnDateTo.value = '';
                if (returnStatusFilter) returnStatusFilter.value = '';
                this.filterReturns();
            });
        }

        console.log('✅ Event listeners set up for purchase returns');
    },

    /**
     * Filter returns based on search criteria
     */
    filterReturns() {
        const searchTerm = document.getElementById('returnSearch')?.value.toLowerCase() || '';
        const dateFrom = document.getElementById('returnDateFrom')?.value || '';
        const dateTo = document.getElementById('returnDateTo')?.value || '';
        const statusFilter = document.getElementById('returnStatusFilter')?.value || '';

        let filtered = this.purchaseReturns.filter(returnItem => {
            const matchesSearch = !searchTerm || 
                (returnItem.invoiceNo || '').toLowerCase().includes(searchTerm) ||
                (returnItem.supplierName || '').toLowerCase().includes(searchTerm);
            
            const matchesDate = (!dateFrom || new Date(returnItem.date) >= new Date(dateFrom)) &&
                               (!dateTo || new Date(returnItem.date) <= new Date(dateTo));
            
            const matchesStatus = !statusFilter || returnItem.status === statusFilter;

            return matchesSearch && matchesDate && matchesStatus;
        });

        this.renderFilteredReturns(filtered);
    },

    /**
     * Render filtered returns
     */
    renderFilteredReturns(filteredReturns) {
        const tbody = document.getElementById('returnsTable');
        if (!tbody) return;

        if (filteredReturns.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">لا توجد مرتجعات</td></tr>';
            return;
        }

        tbody.innerHTML = filteredReturns.map(returnItem => `
            <tr>
                <td>${returnItem.invoiceNo || 'N/A'}</td>
                <td>${formatDate(returnItem.date)}</td>
                <td>${returnItem.supplierName || 'N/A'}</td>
                <td>${formatNumber(returnItem.total || 0)}</td>
                <td>${formatNumber(returnItem.paid || 0)}</td>
                <td>${formatNumber(returnItem.remaining || 0)}</td>
                <td><span class="badge bg-${returnItem.status === 'completed' ? 'success' : returnItem.status === 'pending' ? 'warning' : 'danger'}">${returnItem.status === 'completed' ? 'مكتمل' : returnItem.status === 'pending' ? 'معلق' : 'ملغي'}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="PurchaseReturnsModule.editReturn('${returnItem.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="PurchaseReturnsModule.deleteReturn('${returnItem.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn btn-sm btn-info" onclick="PurchaseReturnsModule.printReturn('${returnItem.id}')">
                        <i class="fas fa-print"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    /**
     * Show new return modal
     */
    showNewReturnModal() {
        this.editingReturn = null;
        this.showReturnModal();
    },

    /**
     * Show return modal (similar to purchase modal but for returns)
     */
    showReturnModal() {
        const modalHTML = `
            <div class="modal fade" id="returnModal" tabindex="-1">
                <div class="modal-dialog modal-fullscreen">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-undo"></i>
                                ${this.editingReturn ? 'تعديل فاتورة مرتجع الشراء' : 'إضافة فاتورة مرتجع شراء جديدة'}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="returnForm">
                                <!-- Return Header -->
                                <div class="row mb-3">
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="returnInvoiceNo" class="form-label">رقم الفاتورة</label>
                                            <input type="text" id="returnInvoiceNo" class="form-control" readonly style="background-color: #f8f9fa;">
                                            <small class="form-text text-muted">سيتم توليد الرقم تلقائياً (PRET-)</small>
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="returnDate" class="form-label">تاريخ الفاتورة *</label>
                                            <input type="date" id="returnDate" class="form-control" required>
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="returnSupplier" class="form-label">المورد *</label>
                                            <div class="input-group">
                                                <input type="text" id="returnSupplierDisplay" class="form-control" placeholder="اختر المورد" readonly style="background-color: #f8f9fa;">
                                                <input type="hidden" id="returnSupplierId" value="">
                                                <button type="button" class="btn btn-outline-secondary" id="openReturnSupplierPicker" title="اختر المورد">
                                                    <i class="fas fa-search"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="returnCurrency" class="form-label">عملة الفاتورة</label>
                                            <select id="returnCurrency" class="form-select">
                                                ${this.currencies.map(currency => `
                                                    <option value="${currency.code}" ${currency.code === 'IQD' ? 'selected' : ''}>${currency.name}</option>
                                                `).join('')}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="returnExchangeRate" class="form-label">سعر الصرف</label>
                                            <input type="number" id="returnExchangeRate" class="form-control" value="1" min="0" step="0.0001">
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="returnWarehouse" class="form-label">المستودع *</label>
                                            <div class="input-group">
                                                <input type="text" id="returnWarehouseDisplay" class="form-control" placeholder="اختر المستودع" readonly style="background-color: #f8f9fa;">
                                                <input type="hidden" id="returnWarehouseId" value="">
                                                <button type="button" class="btn btn-outline-secondary" id="openReturnWarehousePicker" title="اختر المستودع">
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
                                            <label for="returnCostCenter" class="form-label">مركز الكلفة</label>
                                            <div class="input-group">
                                                <input type="text" id="returnCostCenterDisplay" class="form-control" placeholder="اختر مركز الكلفة" readonly style="background-color: #f8f9fa;">
                                                <input type="hidden" id="returnCostCenterId" value="">
                                                <button type="button" class="btn btn-outline-secondary" id="openReturnCostCenterPicker" title="اختر مركز الكلفة">
                                                    <i class="fas fa-search"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="returnPaymentTerms" class="form-label">شروط الدفع</label>
                                            <input type="text" id="returnPaymentTerms" class="form-control" placeholder="مثال: صافي 30 يوم">
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="returnSalesRep1" class="form-label">المندوب الأول</label>
                                            <div class="input-group">
                                                <input type="text" id="returnSalesRep1Display" class="form-control" placeholder="اختر المندوب الأول" readonly style="background-color: #f8f9fa;">
                                                <input type="hidden" id="returnSalesRep1Id" value="">
                                                <button type="button" class="btn btn-outline-secondary" id="openReturnSalesRep1Picker" title="اختر المندوب الأول">
                                                    <i class="fas fa-search"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="returnSalesRep2" class="form-label">المندوب الثاني</label>
                                            <div class="input-group">
                                                <input type="text" id="returnSalesRep2Display" class="form-control" placeholder="اختر المندوب الثاني" readonly style="background-color: #f8f9fa;">
                                                <input type="hidden" id="returnSalesRep2Id" value="">
                                                <button type="button" class="btn btn-outline-secondary" id="openReturnSalesRep2Picker" title="اختر المندوب الثاني">
                                                    <i class="fas fa-search"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Return Items - Advanced Excel-like Table -->
                                <div class="row mb-3">
                                    <div class="col-12">
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <h6><i class="fas fa-table"></i> تفاصيل المنتجات (مثل Excel)</h6>
                                            <div>
                                                <button type="button" class="btn btn-sm btn-outline-primary me-2" id="addReturnItem">
                                                    <i class="fas fa-plus"></i> إضافة منتج
                                                </button>
                                                <button type="button" class="btn btn-sm btn-outline-success me-2" id="copySelectedReturnRows">
                                                    <i class="fas fa-copy"></i> نسخ المحدد
                                                </button>
                                                <button type="button" class="btn btn-sm btn-outline-info me-2" id="pasteReturnRows">
                                                    <i class="fas fa-paste"></i> لصق
                                                </button>
                                                <button type="button" class="btn btn-sm btn-outline-danger me-2" id="deleteSelectedReturnRows">
                                                    <i class="fas fa-trash"></i> حذف المحدد
                                                </button>
                                                <button type="button" class="btn btn-sm btn-outline-secondary" id="toggleReturnColumns">
                                                    <i class="fas fa-eye"></i> إظهار/إخفاء الأعمدة
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <!-- Column Visibility Controls -->
                                        <div class="column-controls mb-2" id="returnColumnControls" style="display: none;">
                                            <div class="row">
                                                <div class="col-md-12">
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input column-toggle" type="checkbox" id="return-col-product" checked>
                                                        <label class="form-check-label" for="return-col-product">المنتج</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input column-toggle" type="checkbox" id="return-col-quantity" checked>
                                                        <label class="form-check-label" for="return-col-quantity">الكمية</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input column-toggle" type="checkbox" id="return-col-unit" checked>
                                                        <label class="form-check-label" for="return-col-unit">الوحدة</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input column-toggle" type="checkbox" id="return-col-price" checked>
                                                        <label class="form-check-label" for="return-col-price">سعر الوحدة</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input column-toggle" type="checkbox" id="return-col-discount" checked>
                                                        <label class="form-check-label" for="return-col-discount">الخصم %</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input column-toggle" type="checkbox" id="return-col-addition-percent" checked>
                                                        <label class="form-check-label" for="return-col-addition-percent">نسبة الإضافة %</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input column-toggle" type="checkbox" id="return-col-addition" checked>
                                                        <label class="form-check-label" for="return-col-addition">مبلغ الإضافة</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input column-toggle" type="checkbox" id="return-col-expiry" checked>
                                                        <label class="form-check-label" for="return-col-expiry">تاريخ الصلاحية</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input column-toggle" type="checkbox" id="return-col-serial" checked>
                                                        <label class="form-check-label" for="return-col-serial">الرقم التسلسلي</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input column-toggle" type="checkbox" id="return-col-notes" checked>
                                                        <label class="form-check-label" for="return-col-notes">ملاحظات</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="position-relative">
                                            <div class="table-responsive" id="returnItemsTableContainer" 
                                                 style="max-height: 500px; overflow-x: auto; overflow-y: auto; position: relative; border: 2px solid #d0d7e5; border-radius: 4px; background: #fff;">
                                                <style>
                                                    #returnItemsTableContainer {
                                                        overflow-x: auto !important;
                                                        overflow-y: auto !important;
                                                        scrollbar-width: thin;
                                                        scrollbar-color: #888 #f1f1f1;
                                                    }
                                                    #returnItemsTableContainer::-webkit-scrollbar {
                                                        width: 16px;
                                                        height: 16px;
                                                    }
                                                    #returnItemsTableContainer::-webkit-scrollbar-track {
                                                        background: #f1f1f1;
                                                        border-radius: 4px;
                                                    }
                                                    #returnItemsTableContainer::-webkit-scrollbar-thumb {
                                                        background: #888;
                                                        border-radius: 4px;
                                                        border: 2px solid #f1f1f1;
                                                    }
                                                    #returnItemsTableContainer::-webkit-scrollbar-thumb:hover {
                                                        background: #555;
                                                    }
                                                    .required-field {
                                                        border: 2px solid #dc3545 !important;
                                                        background-color: #fff5f5 !important;
                                                    }
                                                </style>
                                                <table class="table table-bordered mb-0" id="returnItemsTable" 
                                                       style="margin-bottom: 0; font-size: 0.9rem; border-collapse: collapse; width: 100%; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #fff; min-width: 2000px;">
                                                    <thead style="background: #f2f3f4; position: sticky; top: 0; z-index: 10;">
                                                        <tr>
                                                            <th width="3%" style="border: 1px solid #d0d7e5; padding: 8px; text-align: center; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 50px;">
                                                                <input type="checkbox" id="selectAllReturnRows" title="تحديد الكل" style="cursor: pointer; width: 18px; height: 18px;">
                                                            </th>
                                                            <th width="4%" style="border: 1px solid #d0d7e5; padding: 8px; text-align: center; min-width: 50px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem;">#</th>
                                                            <th width="17%" class="return-col-product" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 150px;">المنتج *</th>
                                                            <th width="7%" class="return-col-quantity" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 80px;">الكمية *</th>
                                                            <th width="7%" class="return-col-unit" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 80px;">الوحدة</th>
                                                            <th width="6%" class="return-col-available-qty" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 80px; text-align: center;">الكميات</th>
                                                            <th width="8%" class="return-col-price" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 100px;">سعر الوحدة *</th>
                                                            <th width="6%" class="return-col-discount" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 80px;">الخصم %</th>
                                                            <th width="6%" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 100px;">مبلغ الخصم</th>
                                                            <th width="6%" class="return-col-addition-percent" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 80px;">نسبة الإضافة %</th>
                                                            <th width="6%" class="return-col-addition" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 100px;">مبلغ الإضافة</th>
                                                            <th width="8%" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 100px;">المجموع</th>
                                                            <th width="8%" class="return-col-expiry" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 120px;">تاريخ الصلاحية</th>
                                                            <th width="8%" class="return-col-serial" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 120px;">الرقم التسلسلي</th>
                                                            <th width="12%" class="return-col-notes" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 150px;">ملاحظات</th>
                                                            <th width="4%" style="border: 1px solid #d0d7e5; padding: 8px; text-align: center; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 60px;">الإجراءات</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="returnItemsBody">
                                                        <!-- Will be populated by JavaScript -->
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Discounts and Additions Table -->
                                <div class="row mb-3">
                                    <div class="col-12">
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <h6><i class="fas fa-calculator"></i> الخصومات والإضافات</h6>
                                            <div>
                                                <button type="button" class="btn btn-sm btn-outline-warning me-2" id="addReturnDiscount">
                                                    <i class="fas fa-minus"></i> إضافة خصم
                                                </button>
                                                <button type="button" class="btn btn-sm btn-outline-success" id="addReturnAddition">
                                                    <i class="fas fa-plus"></i> إضافة إضافة
                                                </button>
                                            </div>
                                        </div>
                                        <div class="table-responsive">
                                            <table class="table table-bordered table-hover" id="returnDiscountsAdditionsTable">
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
                                                <tbody id="returnDiscountsAdditionsBody">
                                                    <!-- Will be populated by JavaScript -->
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                <!-- Return Summary -->
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="returnNotes" class="form-label">ملاحظات</label>
                                            <textarea id="returnNotes" class="form-control" rows="3"></textarea>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="return-summary">
                                            <h6><i class="fas fa-calculator"></i> ملخص الفاتورة</h6>
                                            <div class="row mb-2">
                                                <div class="col-6">
                                                    <label class="form-label">المجموع الفرعي:</label>
                                                </div>
                                                <div class="col-6">
                                                    <span id="returnSubtotal">0.00</span> <span id="returnSubtotalCurrency">IQD</span>
                                                </div>
                                            </div>
                                            
                                            <div class="row mb-2">
                                                <div class="col-6">
                                                    <label class="form-label">إجمالي الخصومات:</label>
                                                </div>
                                                <div class="col-6">
                                                    <span id="returnTotalDiscounts">0.00</span> <span id="returnDiscountCurrency">IQD</span>
                                                </div>
                                            </div>
                                            
                                            <div class="row mb-2">
                                                <div class="col-6">
                                                    <label class="form-label">إجمالي الإضافات:</label>
                                                </div>
                                                <div class="col-6">
                                                    <span id="returnTotalAdditions">0.00</span> <span id="returnAdditionCurrency">IQD</span>
                                                </div>
                                            </div>
                                            
                                            <hr>
                                            <div class="row mb-2">
                                                <div class="col-6">
                                                    <label class="form-label"><strong>المجموع الإجمالي:</strong></label>
                                                </div>
                                                <div class="col-6">
                                                    <strong><span id="returnTotal">0.00</span> <span id="returnTotalCurrency">IQD</span></strong>
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
                                                    <label for="returnPaymentMethod" class="form-label">طريقة الدفع</label>
                                                    <select id="returnPaymentMethod" class="form-select">
                                                        <option value="cash">نقدي</option>
                                                        <option value="credit">آجل</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="form-group">
                                                    <label for="returnPaidAmount" class="form-label">المبلغ المدفوع</label>
                                                    <input type="number" id="returnPaidAmount" class="form-control" min="0" step="0.01" value="0">
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="form-group">
                                                    <label for="returnDueDate" class="form-label">تاريخ الاستحقاق</label>
                                                    <input type="date" id="returnDueDate" class="form-control">
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="form-group">
                                                    <label for="returnRemainingAmount" class="form-label">المبلغ المتبقي</label>
                                                    <input type="number" id="returnRemainingAmount" class="form-control" readonly style="background-color: #f8f9fa;">
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Payment Status -->
                                        <div class="row mt-2">
                                            <div class="col-md-3">
                                                <div class="form-group">
                                                    <label for="returnPaymentStatus" class="form-label">حالة الدفع</label>
                                                    <select id="returnPaymentStatus" class="form-select" disabled style="background-color: #f8f9fa; cursor: not-allowed;" title="يتم تحديث حالة الدفع تلقائياً بناءً على المبلغ المدفوع">
                                                        <option value="unpaid">غير مدفوع</option>
                                                        <option value="partial">مدفوع جزئياً</option>
                                                        <option value="paid">مدفوع بالكامل</option>
                                                    </select>
                                                    <small class="text-muted">
                                                        <i class="fas fa-info-circle"></i> يتم تحديثها تلقائياً بناءً على المبلغ المدفوع
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
                                                                    <input class="form-check-input" type="checkbox" id="generateReturnGeneralEntry" checked>
                                                                    <label class="form-check-label" for="generateReturnGeneralEntry">
                                                                        توليد قيد عام تلقائي
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <div class="col-md-6">
                                                                <div class="form-group">
                                                                    <label for="returnGeneralEntryDescription" class="form-label">وصف القيد</label>
                                                                    <input type="text" id="returnGeneralEntryDescription" class="form-control" placeholder="وصف القيد العام">
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="row">
                                                            <div class="col-md-12">
                                                                <div class="alert alert-info">
                                                                    <i class="fas fa-info-circle"></i>
                                                                    <strong>ملاحظة:</strong> سيتم توليد القيد العام تلقائياً عند حفظ الفاتورة مع ربط الحسابات التالية:
                                                                    <ul class="mb-0 mt-2">
                                                                        <li>مدين: حساب المورد (عكس المشتريات)</li>
                                                                        <li>دائن: حساب المشتريات أو المخزون (عكس المشتريات)</li>
                                                                        <li>إضافي: حسابات الضرائب والخصومات</li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="row mt-3">
                                                            <div class="col-md-12">
                                                                <button type="button" class="btn btn-outline-info btn-sm" id="previewReturnGeneralEntryBtn">
                                                                    <i class="fas fa-eye"></i> معاينة القيد المتوقع
                                                                </button>
                                                                <button type="button" class="btn btn-outline-secondary btn-sm ms-2" id="refreshReturnGeneralEntryPreviewBtn" style="display: none;">
                                                                    <i class="fas fa-sync-alt"></i> تحديث المعاينة
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div class="row mt-2">
                                                            <div class="col-md-12">
                                                                <div id="returnGeneralEntryPreview" style="display: none;">
                                                                    <div class="card border-info">
                                                                        <div class="card-header bg-info text-white">
                                                                            <h6 class="mb-0"><i class="fas fa-file-contract"></i> معاينة القيد المتوقع</h6>
                                                                        </div>
                                                                        <div class="card-body">
                                                                            <div id="returnGeneralEntryPreviewContent">
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
                            <button type="button" class="btn btn-secondary" id="cancelReturnBtn" data-bs-dismiss="modal">إلغاء</button>
                            <button type="button" class="btn btn-primary" id="saveReturnBtn">
                                <i class="fas fa-save"></i> حفظ الفاتورة
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Supplier Picker Modal -->
            <div class="modal fade" id="returnSupplierPickerModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-truck"></i> اختر المورد</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <input type="text" id="returnSupplierPickerSearch" class="form-control" placeholder="ابحث عن المورد...">
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
                                    <tbody id="returnSupplierPickerTableBody">
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
            <div class="modal fade" id="returnWarehousePickerModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-warehouse"></i> اختر المستودع</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <input type="text" id="returnWarehousePickerSearch" class="form-control" placeholder="ابحث عن المستودع...">
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
                                    <tbody id="returnWarehousePickerTableBody">
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
            <div class="modal fade" id="returnCostCenterPickerModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-building"></i> اختر مركز الكلفة</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <input type="text" id="returnCostCenterPickerSearch" class="form-control" placeholder="ابحث عن مركز الكلفة...">
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
                                    <tbody id="returnCostCenterPickerTableBody">
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
            <div class="modal fade" id="returnSalesRepPickerModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-user-tie"></i> اختر المندوب</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <input type="text" id="returnSalesRepPickerSearch" class="form-control" placeholder="ابحث عن المندوب...">
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
                                    <tbody id="returnSalesRepPickerTableBody">
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
            
            <!-- Available Quantities Modal -->
            <div class="modal fade" id="returnAvailableQuantitiesModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-boxes"></i> الكميات المتوفرة</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <div class="row">
                                    <div class="col-md-4">
                                        <strong>المنتج:</strong> <span id="availableQtyProductName">-</span>
                                    </div>
                                    <div class="col-md-4">
                                        <strong>الوحدة:</strong> <span id="availableQtyUnitName">-</span>
                                    </div>
                                    <div class="col-md-4">
                                        <strong>المستودع:</strong> <span id="availableQtyWarehouseName">-</span>
                                    </div>
                                </div>
                            </div>
                            <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
                                <table class="table table-hover table-bordered">
                                    <thead class="table-light sticky-top">
                                        <tr>
                                            <th>تاريخ الصلاحية</th>
                                            <th>الرقم التسلسلي</th>
                                            <th>الكمية المتوفرة (الوحدة الأساسية)</th>
                                            <th>الكمية المتوفرة (الوحدة المختارة)</th>
                                            <th>الكمية المرجعة</th>
                                            <th>فاتورة الشراء</th>
                                            <th>تاريخ الشراء</th>
                                            <th>الإجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody id="returnAvailableQuantitiesTableBody">
                                        <tr>
                                            <td colspan="8" class="text-center text-muted">
                                                <i class="fas fa-spinner fa-spin"></i> جاري التحميل...
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('returnModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Show modal - wait a bit to ensure DOM is updated
        setTimeout(() => {
            const modalElement = document.getElementById('returnModal');
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement, {
                    backdrop: true,
                    keyboard: true,
                    focus: true
                });
                
                // Fix for backdrop blocking interaction
                modalElement.addEventListener('shown.bs.modal', () => {
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
                            // Last backdrop (for return modal) should be below modal
                            backdrop.style.zIndex = '1049';
                        }
                    });
                    
                    // Ensure all interactive elements are clickable
                    const interactiveElements = modalElement.querySelectorAll('input, select, textarea, button, a, table, tbody, tr, td');
                    interactiveElements.forEach(el => {
                        el.style.pointerEvents = 'auto';
                    });
                }, { once: true });
                
                modal.show();
            } else {
                console.error('❌ returnModal not found after insertion');
            }
        }, 50);

        // Reload suppliers to ensure we have the latest data
        this.loadSuppliers().then(() => {
            setTimeout(() => {
                this.initializeReturnAutocompleteFields();
                console.log('✅ Return autocomplete fields initialized');
            }, 150);
        });
        
        // Setup modal event listeners
        this.setupReturnModalListeners();

        // Generate invoice number for new return
        if (!this.editingReturn) {
            this.generateReturnInvoiceNumber();
        }

        // Set today's date
        document.getElementById('returnDate').value = new Date().toISOString().split('T')[0];

        // Apply default values from settings (only for new returns)
        if (!this.editingReturn) {
            setTimeout(async () => {
                await this.applyReturnDefaultValues();
                // Initialize 6 empty rows for new return
                this.initializeEmptyReturnRows(6);
            }, 500);
        }
    },

    /**
     * Generate return invoice number (PRET- prefix)
     */
    async generateReturnInvoiceNo() {
        try {
            const settings = await this.getSettings();
            if (!settings.autoGenerateInvoiceNumbers) {
                return '';
            }

            const prefix = 'PRET-';
            const snapshot = await db.collection('purchaseReturns')
                .where('invoiceNo', '>=', prefix)
                .where('invoiceNo', '<', prefix + '\uf8ff')
                .orderBy('invoiceNo', 'desc')
                .limit(1)
                .get();

            let counter = 1;
            if (!snapshot.empty) {
                const lastInvoiceNo = snapshot.docs[0].data().invoiceNo;
                const lastNumber = parseInt(lastInvoiceNo.replace(prefix, '')) || 0;
                counter = lastNumber + 1;
            }

            return `${prefix}${counter.toString().padStart(6, '0')}`;
        } catch (error) {
            console.error('Error generating return invoice number:', error);
            return `PRET-${Date.now()}`;
        }
    },

    /**
     * Collect return form data
     */
    collectReturnData() {
        const items = [];
        const tbody = document.getElementById('returnItemsBody');
        if (!tbody) return null;
        
        const rows = tbody.children;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const productHiddenInput = row.querySelector('.return-product-select-id');
            const productId = productHiddenInput?.value || '';
            
            const productInput = row.querySelector('.return-product-display-input');
            const productName = productInput?.value || '';
            
            const quantity = parseFloat(row.querySelector('.return-quantity-input')?.value) || 0;
            const price = parseFloat(row.querySelector('.return-price-input')?.value) || 0;
            const discountPercent = parseFloat(row.querySelector('.return-discount-percent-input')?.value) || 0;
            const discountAmount = parseFloat(row.querySelector('.return-discount-amount-input')?.value) || 0;
            const additionPercent = parseFloat(row.querySelector('.return-addition-percent-input')?.value) || 0;
            const additionAmount = parseFloat(row.querySelector('.return-addition-amount-input')?.value) || 0;
            const total = parseFloat(row.querySelector('.return-total-input')?.value) || 0;
            
            const unitHiddenInput = row.querySelector('.return-unit-select-id');
            const unitId = unitHiddenInput?.value || '';
            
            const expiryDateInput = row.querySelector('.return-expiry-date-input');
            const serialNumberInput = row.querySelector('.return-serial-number-input');
            const notesInput = row.querySelector('.return-notes-input');

            if (productId && quantity > 0 && price > 0) {
                const product = this.products.find(p => p.id === productId);
                const productCurrency = product?.currency || 'IQD';
                
                const invoiceCurrency = document.getElementById('returnCurrency')?.value || 'IQD';
                const invoiceExchangeRate = parseFloat(document.getElementById('returnExchangeRate')?.value) || 1;
                
                items.push({
                    productId: productId,
                    productName: productName,
                    quantity: quantity,
                    unitId: unitId,
                    unitPrice: price,
                    originalUnitPrice: price,
                    originalCurrency: productCurrency,
                    invoiceCurrency: invoiceCurrency,
                    exchangeRate: invoiceExchangeRate,
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
        const discountRows = document.querySelectorAll('#returnDiscountsAdditionsBody tr');
        discountRows.forEach(row => {
            const type = row.querySelector('.return-type-select')?.value;
            const accountSelect = row.querySelector('.return-account-select');
            const accountId = accountSelect?.value || '';
            const accountName = row.querySelector('.return-account-name-display')?.value || '';
            const counterAccountSelect = row.querySelector('.return-counter-account-select');
            const counterAccountId = counterAccountSelect?.value || '';
            const counterAccountName = row.querySelector('.return-counter-account-name-display')?.value || '';
            const amount = parseFloat(row.querySelector('.return-amount-input')?.value) || 0;
            const currency = row.querySelector('.return-currency-select')?.value || 'IQD';
            const notes = row.querySelector('.return-notes-input')?.value || '';

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

        let totalDiscounts = 0;
        let totalAdditions = 0;
        discountAdditionRows.forEach(row => {
            if (row.type === 'discount') {
                totalDiscounts += row.amount;
            } else if (row.type === 'addition') {
                totalAdditions += row.amount;
            }
        });

        const total = parseFloat(document.getElementById('returnTotal')?.textContent) || 0;
        const paidAmount = parseFloat(document.getElementById('returnPaidAmount')?.value) || 0;
        let paymentStatus = 'unpaid';
        if (paidAmount >= total) {
            paymentStatus = 'paid';
        } else if (paidAmount > 0) {
            paymentStatus = 'partial';
        }

        const supplierId = document.getElementById('returnSupplierId')?.value || '';
        const supplierDisplay = document.getElementById('returnSupplierDisplay');
        let supplierName = supplierDisplay?.value || '';
        if (!supplierName && supplierId) {
            const supplier = this.suppliers.find(s => s.id === supplierId);
            supplierName = supplier?.name || '';
        }
        
        const warehouseId = document.getElementById('returnWarehouseId')?.value || '';
        const costCenterId = document.getElementById('returnCostCenterId')?.value || '';
        const salesRep1Id = document.getElementById('returnSalesRep1Id')?.value || '';
        const salesRep2Id = document.getElementById('returnSalesRep2Id')?.value || '';

        return {
            invoiceNo: document.getElementById('returnInvoiceNo')?.value.trim() || '',
            date: document.getElementById('returnDate')?.value || new Date().toISOString().split('T')[0],
            supplierId: supplierId,
            supplierName: supplierName,
            currency: document.getElementById('returnCurrency')?.value || 'IQD',
            exchangeRate: parseFloat(document.getElementById('returnExchangeRate')?.value) || 1,
            warehouseId: warehouseId,
            costCenterId: costCenterId,
            salesRep1Id: salesRep1Id,
            salesRep2Id: salesRep2Id,
            items: items,
            subtotal: parseFloat(document.getElementById('returnSubtotal')?.textContent) || 0,
            totalDiscounts: totalDiscounts,
            totalAdditions: totalAdditions,
            discountAdditionRows: discountAdditionRows,
            total: total,
            notes: document.getElementById('returnNotes')?.value.trim() || '',
            status: 'completed',
            paymentMethod: document.getElementById('returnPaymentMethod')?.value || 'cash',
            paidAmount: paidAmount,
            remainingAmount: parseFloat(document.getElementById('returnRemainingAmount')?.value) || 0,
            paymentStatus: paymentStatus,
            dueDate: document.getElementById('returnDueDate')?.value || null,
            type: 'purchase_return',
            createdAt: new Date(),
            createdBy: auth.currentUser?.uid || 'system'
        };
    },

    /**
     * Validate return form
     */
    async validateReturnForm(formData) {
        if (!formData.date) {
            showError('تاريخ الفاتورة مطلوب');
            return false;
        }

        if (!formData.supplierId) {
            showError('المورد مطلوب');
            return false;
        }

        if (!formData.warehouseId) {
            showError('المستودع مطلوب');
            return false;
        }

        if (!formData.items || formData.items.length === 0) {
            showError('يجب إضافة منتج واحد على الأقل');
            return false;
        }

        // Validate items: stock, expiry dates, and serial numbers
        const settings = await this.getSettings();
        const allowReturnWithoutStock = settings.allowReturnWithoutStock || false;

        for (const item of formData.items) {
            const product = await Collections.getProduct(item.productId);
            if (!product) {
                showError(`المنتج "${item.productName}" غير موجود`);
                return false;
            }

            // Validate that product has a main unit (required)
            if (!product.unitId) {
                showError(`المنتج "${item.productName}" لا يحتوي على وحدة أساسية. يجب إضافة وحدة أساسية للمنتج قبل استخدامه في مرتجع المشتريات.`);
                return false;
            }

            // Validate that unitId is set for the item
            if (!item.unitId) {
                showError(`يجب اختيار الوحدة للمنتج "${item.productName}"`);
                return false;
            }

            // Verify unit exists
            const unit = this.units.find(u => u.id === item.unitId);
            if (!unit) {
                showError(`الوحدة المختارة للمنتج "${item.productName}" غير موجودة`);
                return false;
            }

            // Get warehouse ID from form data
            const warehouseId = formData.warehouseId || 'default';

            // Check stock availability (unless allowed to return without stock)
            if (!allowReturnWithoutStock) {
                // Get current stock in warehouse
                const warehouseStockObj = await Collections.getProductWarehouseStock(item.productId);
                const currentStock = warehouseStockObj?.[warehouseId] || 0;

                // Convert return quantity to main unit using helper function
                const quantityInMainUnit = InvoiceUtils.convertToMainUnit(item.quantity, item.unitId, product);

                if (currentStock < quantityInMainUnit) {
                    const unit = this.units.find(u => u.id === product.unitId);
                    const unitName = unit ? unit.name : '';
                    showError(
                        `الرصيد المتاح للمنتج "${item.productName}" في المستودع المختار غير كافٍ.\n` +
                        `الرصيد الحالي: ${formatNumber(currentStock)} ${unitName}\n` +
                        `الكمية المطلوبة للإرجاع: ${formatNumber(quantityInMainUnit)} ${unitName}`
                    );
                    return false;
                }
            }

            // Validate expiry date and serial number if product has them
            const hasExpiry = product.hasExpiryDate || false;
            const hasSerial = product.hasSerialNumber || false;
            const forceExpiry = product.forceExpiryOnInput || false;
            const forceSerial = product.forceSerialOnInput || false;

            // الحالة الأولى: لا يملك تاريخ صلاحية ولا رقم تسلسلي
            // لا حاجة للتحقق من تاريخ الصلاحية أو الرقم التسلسلي
            
            // الحالة الثانية: يملك تاريخ صلاحية ولا يملك رقم تسلسلي
            if (hasExpiry && !hasSerial) {
                // التحقق من إجبارية تاريخ الصلاحية
                if (forceExpiry && !item.expiryDate) {
                    showError(`تاريخ الصلاحية مطلوب للمنتج "${item.productName}"`);
                    return false;
                }
                
                // التحقق من توفر المنتج بتاريخ الصلاحية المحدد في المخزون
                if (item.expiryDate) {
                    try {
                        const inventoryItems = await Collections.getAvailableInventoryItems(
                            item.productId,
                            warehouseId
                        );
                        
                        const matchingItems = inventoryItems.filter(inv => inv.expiryDate === item.expiryDate);
                        const totalAvailable = matchingItems.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
                        
                        // تحويل الكمية إلى الوحدة الأساسية للتحقق
                        if (totalAvailable < quantityInMainUnit) {
                            showError(
                                `المنتج "${item.productName}" مع التاريخ "${formatDate(new Date(item.expiryDate))}" ` +
                                `غير متاح بالكمية المطلوبة في المستودع المختار.\n` +
                                `الكمية المتاحة: ${formatNumber(totalAvailable)} ${unitName}\n` +
                                `الكمية المطلوبة: ${formatNumber(quantityInMainUnit)} ${unitName}`
                            );
                            return false;
                        }
                        
                        // التحقق من صلاحية التاريخ (اختياري للتحذير فقط)
                        const expiryDate = new Date(item.expiryDate);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (expiryDate < today) {
                            const result = await Swal.fire({
                                title: 'تحذير',
                                text: `تاريخ الصلاحية للمنتج "${item.productName}" منتهي. هل تريد المتابعة؟`,
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonText: 'نعم، متابعة',
                                cancelButtonText: 'إلغاء'
                            });
                            if (!result.isConfirmed) {
                                return false;
                            }
                        }
                    } catch (error) {
                        console.error('Error validating inventory items with expiry date:', error);
                        showError(`خطأ في التحقق من توفر المنتج "${item.productName}" في المخزون`);
                        return false;
                    }
                }
            }
            
            // الحالة الثالثة: لا يملك تاريخ صلاحية ويملك رقم تسلسلي
            else if (!hasExpiry && hasSerial) {
                // التحقق من إجبارية الرقم التسلسلي
                if (forceSerial) {
                    if (!item.serialNumber || item.serialNumber.trim() === '') {
                        showError(`الرقم التسلسلي مطلوب للمنتج "${item.productName}"`);
                        return false;
                    }
                }
                
                // التحقق من توفر المنتج بالرقم التسلسلي المحدد في المخزون
                if (item.serialNumber && item.serialNumber.trim() !== '') {
                    try {
                        const inventoryItems = await Collections.getAvailableInventoryItems(
                            item.productId,
                            warehouseId
                        );
                        
                        const matchingItems = inventoryItems.filter(inv => inv.serialNumber === item.serialNumber);
                        const totalAvailable = matchingItems.reduce((sum, inv) => sum + (inv.quantity || 0), 0);
                        
                        // تحويل الكمية إلى الوحدة الأساسية للتحقق
                        if (totalAvailable < quantityInMainUnit) {
                            showError(
                                `المنتج "${item.productName}" مع الرقم التسلسلي "${item.serialNumber}" ` +
                                `غير متاح بالكمية المطلوبة في المستودع المختار.\n` +
                                `الكمية المتاحة: ${formatNumber(totalAvailable)} ${unitName}\n` +
                                `الكمية المطلوبة: ${formatNumber(quantityInMainUnit)} ${unitName}`
                            );
                            return false;
                        }
                    } catch (error) {
                        console.error('Error validating inventory items with serial number:', error);
                        showError(`خطأ في التحقق من توفر المنتج "${item.productName}" في المخزون`);
                        return false;
                    }
                }
            }
            
            // الحالة الرابعة: يملك تاريخ صلاحية ورقم تسلسلي معاً
            else if (hasExpiry && hasSerial) {
                // التحقق من إجبارية القيم
                if (forceExpiry && !item.expiryDate) {
                    showError(`تاريخ الصلاحية مطلوب للمنتج "${item.productName}"`);
                    return false;
                }
                if (forceSerial && (!item.serialNumber || item.serialNumber.trim() === '')) {
                    showError(`الرقم التسلسلي مطلوب للمنتج "${item.productName}"`);
                    return false;
                }
                
                // التحقق من توفر المنتج بالتاريخ والرقم التسلسلي المحددين معاً
                if (item.expiryDate && item.serialNumber && item.serialNumber.trim() !== '') {
                    try {
                        const inventoryItems = await Collections.getAvailableInventoryItems(
                            item.productId,
                            warehouseId
                        );
                        
                        const matchingItem = inventoryItems.find(inv => 
                            inv.expiryDate === item.expiryDate && 
                            inv.serialNumber === item.serialNumber
                        );
                        
                        if (!matchingItem) {
                            showError(
                                `المنتج "${item.productName}" مع التاريخ "${formatDate(new Date(item.expiryDate))}" ` +
                                `والرقم التسلسلي "${item.serialNumber}" غير موجود في المستودع المختار.`
                            );
                            return false;
                        }
                        
                        // تحويل الكمية إلى الوحدة الأساسية للتحقق
                        if (matchingItem.quantity < quantityInMainUnit) {
                            showError(
                                `المنتج "${item.productName}" مع التاريخ "${formatDate(new Date(item.expiryDate))}" ` +
                                `والرقم التسلسلي "${item.serialNumber}" غير متاح بالكمية المطلوبة.\n` +
                                `الكمية المتاحة: ${formatNumber(matchingItem.quantity)} ${unitName}\n` +
                                `الكمية المطلوبة: ${formatNumber(quantityInMainUnit)} ${unitName}`
                            );
                            return false;
                        }
                        
                        // التحقق من صلاحية التاريخ (اختياري للتحذير فقط)
                        const expiryDate = new Date(item.expiryDate);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        if (expiryDate < today) {
                            const result = await Swal.fire({
                                title: 'تحذير',
                                text: `تاريخ الصلاحية للمنتج "${item.productName}" منتهي. هل تريد المتابعة؟`,
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonText: 'نعم، متابعة',
                                cancelButtonText: 'إلغاء'
                            });
                            if (!result.isConfirmed) {
                                return false;
                            }
                        }
                    } catch (error) {
                        console.error('Error validating inventory items with expiry and serial:', error);
                        showError(`خطأ في التحقق من توفر المنتج "${item.productName}" في المخزون`);
                        return false;
                    }
                }
            }
        }

        return true;
    },

    /**
     * Save return invoice
     */
    async saveReturn() {
        try {
            const formData = this.collectReturnData();
            
            if (!(await this.validateReturnForm(formData))) {
                return;
            }

            showLoading();

            let returnId = null;

            if (this.editingReturn) {
                // Update return
                returnId = this.editingReturn.id;
                formData.id = returnId;
                
                // Update inventory: add back old quantities and subtract new quantities
                await this.updateInventoryOnEdit(this.editingReturn, formData);
                
                await Collections.updatePurchaseReturn(this.editingReturn.id, formData);
                
                // Update or recreate general entry if it exists
                await this.updateOrCreateGeneralEntry(formData);
                
                showSuccess('تم تحديث فاتورة مرتجع الشراء بنجاح');
                
                // Close modal and reset form
                const modal = bootstrap.Modal.getInstance(document.getElementById('returnModal'));
                if (modal) {
                    modal.hide();
                }
                this.cancelReturnForm();
            } else {
                // Generate invoice number if not exists
                if (!formData.invoiceNo) {
                    formData.invoiceNo = await this.generateReturnInvoiceNo();
                }

                // Add new return
                const returnResult = await Collections.addPurchaseReturn(formData);
                
                // Extract ID from result
                if (typeof returnResult === 'string') {
                    returnId = returnResult;
                } else if (returnResult && typeof returnResult === 'object') {
                    returnId = returnResult.id || returnResult.toString?.() || String(returnResult);
                    if (returnId === '[object Object]' || returnId.includes('[object')) {
                        returnId = returnResult.id || null;
                        if (!returnId) {
                            throw new Error('فشل في الحصول على معرف فاتورة المرتجع');
                        }
                    }
                } else {
                    returnId = String(returnResult);
                }
                
                returnId = String(returnId);
                formData.id = returnId;
                
                console.log(`📝 Return saved with ID: ${returnId}`);
                
                // Update inventory (subtract stock)
                await this.updateInventory(formData);
                
                // Generate general entry (supplier is debited)
                const generalEntryId = await this.generateGeneralEntry(formData);
                
                showSuccess('تم إضافة فاتورة مرتجع الشراء بنجاح');
                
                // Show generated general entry if it was created
                if (generalEntryId) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('returnModal'));
                    if (modal) {
                        modal.hide();
                        const modalElement = document.getElementById('returnModal');
                        if (modalElement) {
                            modalElement.addEventListener('hidden.bs.modal', async () => {
                                setTimeout(async () => {
                                    try {
                                        await this.showGeneratedGeneralEntry(returnId);
                                    } catch (error) {
                                        console.error('❌ Error showing general entry dialog:', error);
                                        this.cancelReturnForm();
                                    }
                                }, 400);
                            }, { once: true });
                        }
                    }
                } else {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('returnModal'));
                    if (modal) {
                        modal.hide();
                    }
                    this.cancelReturnForm();
                }
            }

            // Reload data
            this.loadPurchaseReturns().catch(err => console.error('Error reloading returns:', err));
            this.updateDashboard();

            hideLoading();

        } catch (error) {
            console.error('❌ Error saving return:', error);
            hideLoading();
            showError('فشل في حفظ فاتورة مرتجع الشراء: ' + (error.message || 'خطأ غير معروف'));
        }
    },

    /**
     * Cancel return form
     */
    cancelReturnForm() {
        this.editingReturn = null;
        this.currentReturnItems = [];
        this.copiedRow = null;
        this.copiedRows = [];
        this.currentSalesRepNumber = null;
        this.currentReturnCurrency = 'IQD';
        this.currentReturnExchangeRate = 1;
        
        const returnForm = document.getElementById('returnForm');
        if (returnForm) {
            returnForm.reset();
        }
        
        const returnItemsBody = document.getElementById('returnItemsBody');
        if (returnItemsBody) {
            returnItemsBody.innerHTML = '';
        }
        
        const discountsAdditionsBody = document.getElementById('returnDiscountsAdditionsBody');
        if (discountsAdditionsBody) {
            discountsAdditionsBody.innerHTML = '';
        }
    },

    /**
     * Show generated general entry dialog (similar to purchases)
     */
    async showGeneratedGeneralEntry(returnId) {
        try {
            // Wait for DOM to stabilize
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Remove any existing modal backdrop
            const existingBackdrop = document.querySelector('.modal-backdrop');
            if (existingBackdrop) {
                existingBackdrop.remove();
            }
            
            // Remove modal-open class from body
            document.body.classList.remove('modal-open');
            
            // Find general entry by sourceId
            const sourceId = String(returnId);
            let generalEntry = null;
            
            try {
                const snapshot = await db.collection('generalEntries')
                    .where('sourceId', '==', sourceId)
                    .where('type', '==', 'purchase_return')
                    .limit(1)
                    .get();
                
                if (!snapshot.empty) {
                    generalEntry = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
                }
            } catch (error) {
                console.warn('⚠️ Direct query failed, trying fallback:', error);
                // Fallback: fetch all and filter
                const allSnapshot = await db.collection('generalEntries').get();
                const allEntries = allSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                generalEntry = allEntries.find(e => 
                    String(e.sourceId) === sourceId && e.type === 'purchase_return'
                );
            }
            
            if (!generalEntry) {
                console.warn('⚠️ General entry not found for return:', returnId);
                this.cancelReturnForm();
                return;
            }
            
            const entryId = generalEntry.id;
            
            // Show dialog with options
            const result = await Swal.fire({
                title: 'تم حفظ فاتورة مرتجع الشراء بنجاح',
                text: 'ما الذي تريد طباعته؟',
                icon: 'success',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: 'طباعة الفاتورة',
                denyButtonText: 'طباعة القيد العام',
                cancelButtonText: 'إلغاء',
                allowOutsideClick: true,
                allowEscapeKey: true,
                didOpen: () => {
                    // Ensure modal-open class is removed
                    document.body.classList.remove('modal-open');
                }
            });
            
            // Handle user choice
            if (result.isConfirmed) {
                // Print invoice
                const returnData = await Collections.getPurchaseReturn(returnId);
                if (returnData) {
                    await this.printReturnInvoice(returnData);
                }
            } else if (result.isDenied) {
                // Print general entry
                if (typeof VouchersModule !== 'undefined' && VouchersModule.printGeneralEntry) {
                    await VouchersModule.printGeneralEntry(entryId);
                }
            }
            
            // Reset form after dialog closes
            this.cancelReturnForm();
            
            // Restore focus to main window
            window.focus();
            
        } catch (error) {
            console.error('❌ Error showing generated general entry:', error);
            this.cancelReturnForm();
        }
    },

    /**
     * Update inventory on edit (for returns - reverses old and applies new)
     */
    async updateInventoryOnEdit(oldReturnData, newReturnData) {
        try {
            console.log('📦 Updating inventory on edit for return:', newReturnData.invoiceNo);
            
            // First, reverse the old return (add back the stock)
            if (oldReturnData.items && oldReturnData.items.length > 0) {
                for (const item of oldReturnData.items) {
                    const product = await Collections.getProduct(item.productId);
                    if (!product) continue;
                    
                    // Convert quantity to main unit using helper function
                    const quantityInMainUnit = InvoiceUtils.convertToMainUnit(item.quantity, item.unitId, product);
                    
                    // Add back the stock (reverse the return)
                    await Collections.updateProductWarehouseStock(
                        item.productId,
                        oldReturnData.warehouseId || 'default',
                        quantityInMainUnit,
                        'add'
                    );
                }
            }
            
            // Then, apply the new return (subtract the stock)
            if (newReturnData.items && newReturnData.items.length > 0) {
                for (const item of newReturnData.items) {
                    const product = await Collections.getProduct(item.productId);
                    if (!product) continue;
                    
                    // Convert quantity to main unit using helper function
                    const quantityInMainUnit = InvoiceUtils.convertToMainUnit(item.quantity, item.unitId, product);
                    
                    // Subtract the stock (apply the return)
                    await Collections.updateProductWarehouseStock(
                        item.productId,
                        newReturnData.warehouseId || 'default',
                        quantityInMainUnit,
                        'subtract'
                    );
                }
            }
            
            // ✅ إعادة حساب رصيد المنتجات من inventoryMovements بعد التعديل
            if (newReturnData.items && newReturnData.items.length > 0) {
                const uniqueProductIds = [...new Set(newReturnData.items.map(item => item.productId))];
                for (const productId of uniqueProductIds) {
                    try {
                        await Collections.recalculateProductWarehouseStock(productId);
                        console.log(`✅ تم إعادة حساب رصيد المنتج ${productId} من inventoryMovements بعد التعديل`);
                    } catch (recalcError) {
                        console.error(`❌ خطأ في إعادة حساب رصيد المنتج ${productId}:`, recalcError);
                        // Continue with other products even if one fails
                    }
                }
            }
            
            console.log('✅ Inventory updated successfully on edit');
        } catch (error) {
            console.error('❌ Error updating inventory on edit:', error);
            throw error;
        }
    },


    /**
     * Update or create general entry (for returns)
     */
    async updateOrCreateGeneralEntry(returnData) {
        try {
            // Find existing general entry
            const sourceId = String(returnData.id);
            const snapshot = await db.collection('generalEntries')
                .where('sourceId', '==', sourceId)
                .where('type', '==', 'purchase_return')
                .limit(1)
                .get();
            
            if (!snapshot.empty) {
                // Update existing entry
                const existingEntry = snapshot.docs[0];
                const newEntryData = await this.calculateExpectedGeneralEntry(returnData);
                await db.collection('generalEntries').doc(existingEntry.id).update({
                    ...newEntryData,
                    updatedAt: new Date(),
                    updatedBy: auth.currentUser?.uid || 'system'
                });
            } else {
                // Create new entry
                await this.generateGeneralEntry(returnData);
            }
        } catch (error) {
            console.error('❌ Error updating/creating general entry:', error);
        }
    },

    /**
     * Calculate expected general entry (for preview)
     * حساب القيد العام المتوقع للمرتجع (معكوس المشتريات)
     */
    async calculateExpectedGeneralEntry(returnData) {
        try {
            const paymentMethod = returnData.paymentMethod || 'credit';
            const settings = await this.getSettings();

            // Get supplier account (subAccountId only)
            const supplier = returnData.supplierId ? this.suppliers.find(s => s.id === returnData.supplierId) : null;
            const supplierAccountId = supplier?.subAccountId || null;
            const supplierName = supplier?.name || 'غير محدد';

            // For credit payments, supplier is required
            if (paymentMethod === 'credit' && !supplierAccountId) {
                return null;
            }

            // Get base currency and exchange rate
            const invoiceCurrency = returnData.currency || 'IQD';
            const invoiceExchangeRate = parseFloat(returnData.exchangeRate) || 1;
            const baseCurrency = this.currencies.find(c => c.isBaseCurrency)?.code || 'IQD';

            // Helper function to convert amount to base currency
            const convertToBaseCurrency = (amount, currency, exchangeRate) => {
                if (!amount || amount === 0) return 0;
                if (currency === baseCurrency) return amount;
                const currencyObj = this.currencies.find(c => c.code === currency);
                const rate = currencyObj?.exchangeRate || exchangeRate || 1;
                if (!rate || rate === 0) return amount;
                return amount / rate;
            };

            // Prepare general entry data (always in base currency)
            const entryData = {
                date: returnData.date || new Date().toISOString().split('T')[0],
                description: `مرتجع شراء رقم ${returnData.invoiceNo || 'جديد'}`,
                reference: returnData.invoiceNo || 'جديد',
                voucherNumber: returnData.invoiceNo ? `GE-RET-${returnData.invoiceNo}` : 'GE-RET-PREVIEW',
                voucherType: 'general',
                type: 'purchase_return',
                sourceId: returnData.id || 'preview',
                mainCurrency: baseCurrency,
                invoiceCurrency: invoiceCurrency,
                exchangeRate: invoiceExchangeRate,
                costCenterId: returnData.costCenterId || null,
                costCenterName: returnData.costCenterId ? (this.costCenters.find(c => c.id === returnData.costCenterId)?.name || null) : null,
                entries: []
            };

            // Helper function to add account info to entry
            const addAccountInfo = (entry, accountId) => {
                const account = this.accounts.find(a => a.id === accountId);
                if (account) {
                    entry.accountName = account.name || '';
                    entry.accountCode = account.code || '';
                    entry.currency = baseCurrency;
                }
                if (returnData.costCenterId) {
                    entry.costCenterId = returnData.costCenterId;
                    const costCenter = this.costCenters.find(c => c.id === returnData.costCenterId);
                    if (costCenter) {
                        entry.costCenterName = costCenter.name || '';
                    }
                }
                return entry;
            };

            // Convert total to base currency
            const totalInBaseCurrency = convertToBaseCurrency(returnData.total || 0, invoiceCurrency, invoiceExchangeRate);

            // For purchase returns (reversed from purchases):
            // - Supplier is DEBITED (المورد مدين)
            // - Purchases/Inventory is CREDITED (المشتريات/المخزون دائن)

            // Get purchase/inventory account (credit account for returns)
            const purchaseAccountId = settings.defaultReturnCounterAccount || settings.defaultCounterAccountId || null;
            if (!purchaseAccountId) {
                return null;
            }

            if (paymentMethod === 'cash') {
                // Cash Payment: Direct entry
                // Debit: Cash account
                const cashAccountId = settings.defaultReturnDebitAccount || settings.defaultCreditAccountId || null;
                if (!cashAccountId) {
                    return null;
                }
                let cashEntry = {
                    accountId: cashAccountId,
                    debit: totalInBaseCurrency,
                    credit: 0,
                    originalAmount: returnData.total || 0,
                    originalCurrency: invoiceCurrency,
                    description: `مرتجع شراء نقدي رقم ${returnData.invoiceNo || 'جديد'}`
                };
                entryData.entries.push(addAccountInfo(cashEntry, cashAccountId));

                // Credit: Purchases/Inventory account
                let purchaseEntry = {
                    accountId: purchaseAccountId,
                    debit: 0,
                    credit: totalInBaseCurrency,
                    originalAmount: returnData.total || 0,
                    originalCurrency: invoiceCurrency,
                    description: supplierName ? `مرتجع شراء نقدي من ${supplierName}` : `مرتجع شراء نقدي رقم ${returnData.invoiceNo || 'جديد'}`
                };
                entryData.entries.push(addAccountInfo(purchaseEntry, purchaseAccountId));
            } else {
                // Credit Payment: Supplier account
                if (!supplierAccountId) {
                    return null;
                }

                // Debit: Supplier account (المورد مدين)
                let supplierEntry = {
                    accountId: supplierAccountId,
                    debit: totalInBaseCurrency,
                    credit: 0,
                    originalAmount: returnData.total || 0,
                    originalCurrency: invoiceCurrency,
                    description: supplierName ? `مرتجع شراء آجل من ${supplierName}` : `مرتجع شراء آجل رقم ${returnData.invoiceNo || 'جديد'}`
                };
                entryData.entries.push(addAccountInfo(supplierEntry, supplierAccountId));

                // Credit: Purchases/Inventory account (المشتريات/المخزون دائن)
                let purchaseEntry = {
                    accountId: purchaseAccountId,
                    debit: 0,
                    credit: totalInBaseCurrency,
                    originalAmount: returnData.total || 0,
                    originalCurrency: invoiceCurrency,
                    description: `مرتجع شراء آجل رقم ${returnData.invoiceNo || 'جديد'} - ${supplierName}`
                };
                entryData.entries.push(addAccountInfo(purchaseEntry, purchaseAccountId));
            }

            // Handle discounts and additions (reversed from purchases)
            if (returnData.discountAdditionRows && returnData.discountAdditionRows.length > 0) {
                returnData.discountAdditionRows.forEach(row => {
                    const rowCurrency = row.currency || invoiceCurrency;
                    const rowExchangeRate = row.exchangeRate || invoiceExchangeRate;
                    const amountInBaseCurrency = convertToBaseCurrency(row.amount || 0, rowCurrency, rowExchangeRate);

                    if (row.type === 'discount' && row.amount > 0) {
                        // Discount: Credit discount account, Debit counter account (reversed from purchases)
                        if (row.accountId) {
                            let discountEntry = {
                                accountId: row.accountId,
                                debit: 0,
                                credit: amountInBaseCurrency,
                                originalAmount: row.amount,
                                originalCurrency: rowCurrency,
                                description: `خصم - ${row.notes || `مرتجع شراء رقم ${returnData.invoiceNo || 'جديد'}`}`
                            };
                            entryData.entries.push(addAccountInfo(discountEntry, row.accountId));
                        }

                        const discountCounterAccountId = row.counterAccountId || supplierAccountId || settings.defaultReturnDiscountCounterAccount || null;
                        if (discountCounterAccountId) {
                            let discountCounterEntry = {
                                accountId: discountCounterAccountId,
                                debit: amountInBaseCurrency,
                                credit: 0,
                                originalAmount: row.amount,
                                originalCurrency: rowCurrency,
                                description: `خصم - ${row.notes || `مرتجع شراء رقم ${returnData.invoiceNo || 'جديد'}`}`
                            };
                            entryData.entries.push(addAccountInfo(discountCounterEntry, discountCounterAccountId));
                        }
                    } else if (row.type === 'addition' && row.amount > 0) {
                        // Addition: Debit addition account, Credit counter account (reversed from purchases)
                        if (row.accountId) {
                            let additionEntry = {
                                accountId: row.accountId,
                                debit: amountInBaseCurrency,
                                credit: 0,
                                originalAmount: row.amount,
                                originalCurrency: rowCurrency,
                                description: `إضافة - ${row.notes || `مرتجع شراء رقم ${returnData.invoiceNo || 'جديد'}`}`
                            };
                            entryData.entries.push(addAccountInfo(additionEntry, row.accountId));
                        }

                        const additionCounterAccountId = row.counterAccountId || supplierAccountId || settings.defaultReturnAdditionCounterAccount || null;
                        if (additionCounterAccountId) {
                            let additionCounterEntry = {
                                accountId: additionCounterAccountId,
                                debit: 0,
                                credit: amountInBaseCurrency,
                                originalAmount: row.amount,
                                originalCurrency: rowCurrency,
                                description: `إضافة - ${row.notes || `مرتجع شراء رقم ${returnData.invoiceNo || 'جديد'}`}`
                            };
                            entryData.entries.push(addAccountInfo(additionCounterEntry, additionCounterAccountId));
                        }
                    }
                });
            }

            return entryData;
        } catch (error) {
            console.error('Error calculating expected general entry for return:', error);
            return null;
        }
    },

    /**
     * Print return invoice
     */
    async printReturn(returnId) {
        try {
            const returnItem = this.purchaseReturns.find(r => r.id === returnId);
            if (!returnItem) {
                const returnData = await Collections.getPurchaseReturn(returnId);
                if (returnData) {
                    await this.printReturnInvoice(returnData);
                } else {
                    showError('المرتجع غير موجود');
                }
            } else {
                await this.printReturnInvoice(returnItem);
            }
        } catch (error) {
            console.error('Error printing return:', error);
            showError('خطأ في طباعة المرتجع: ' + error.message);
        }
    },
    /**
     * Get settings from database
     */
    async getSettings() {
        try {
            const doc = await db.collection('purchaseReturnsSettings').doc('default').get();
            if (doc.exists) {
                return doc.data();
            }
            
            // Use base currency as default
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
                allowReturnWithoutStock: false, // Prevent returns without stock by default
                defaultTaxRate: 0,
                defaultCounterAccountId: '', // Credit account (Purchase/Inventory)
                defaultDebitAccountId: '', // Debit account (Cash)
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
                defaultDebitAccountId: '',
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
            await db.collection('purchaseReturnsSettings').doc('default').set({
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
     * Load settings when settings tab is opened
     */
    async loadSettings() {
        try {
            console.log('⚙️ Loading purchase returns settings...');
            
            // Ensure accounts are loaded before loading settings
            if (!this.accounts || this.accounts.length === 0) {
                console.log('📊 Accounts not loaded yet, loading accounts first...');
                await this.loadAccounts();
            }
            
            await this.loadDefaultValues();
            await this.loadGeneralSettings();
            await this.loadPrintFieldsSettings();
            
            console.log('✅ Settings loaded successfully');
        } catch (error) {
            console.error('Error loading settings:', error);
            showError('خطأ في تحميل الإعدادات');
        }
    },

    /**
     * Load default values for settings
     */
    async loadDefaultValues() {
        try {
            // Load warehouses
            const warehouseSelect = document.getElementById('defaultReturnWarehouse');
            if (warehouseSelect) {
                warehouseSelect.innerHTML = '<option value="">-- اختر المستودع الافتراضي --</option>';
                this.warehouses.forEach(warehouse => {
                    warehouseSelect.innerHTML += `
                        <option value="${warehouse.id}">${warehouse.name}</option>
                    `;
                });
            }

            // Load cost centers
            const costCenterSelect = document.getElementById('defaultReturnCostCenter');
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
            const currencySelect = document.getElementById('defaultReturnCurrency');
            if (currencySelect) {
                currencySelect.value = settings.defaultCurrency || 'IQD';
            }

            // Set default payment method
            const paymentMethodSelect = document.getElementById('defaultReturnPaymentMethod');
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
            
            // Ensure accounts are loaded before accessing them
            if (!this.accounts || this.accounts.length === 0) {
                console.log('📊 Loading accounts before displaying account settings...');
                await this.loadAccounts();
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Auto generate invoice numbers
            const autoGenerateInvoiceNumbers = document.getElementById('autoGenerateReturnInvoiceNumbers');
            if (autoGenerateInvoiceNumbers) {
                autoGenerateInvoiceNumbers.checked = settings.autoGenerateInvoiceNumbers !== false;
            }

            // Auto update stock
            const autoUpdateStock = document.getElementById('autoUpdateReturnStock');
            if (autoUpdateStock) {
                autoUpdateStock.checked = settings.autoUpdateStock !== false;
            }

            // Auto generate general entry
            const autoGenerateGeneralEntry = document.getElementById('autoGenerateReturnGeneralEntry');
            if (autoGenerateGeneralEntry) {
                autoGenerateGeneralEntry.checked = settings.autoGenerateGeneralEntry !== false;
            }

            // Allow return without stock
            const allowReturnWithoutStock = document.getElementById('allowReturnWithoutStock');
            if (allowReturnWithoutStock) {
                allowReturnWithoutStock.checked = settings.allowReturnWithoutStock === true;
            }

            // Default tax rate
            const defaultTaxRate = document.getElementById('defaultReturnTaxRate');
            if (defaultTaxRate) {
                defaultTaxRate.value = settings.defaultTaxRate || 0;
            }
            
            // Default counter account (Credit Account for Returns)
            const defaultCounterAccount = document.getElementById('defaultReturnCounterAccount');
            const defaultCounterAccountDisplay = document.getElementById('defaultReturnCounterAccountDisplay');
            if (defaultCounterAccount && settings.defaultCounterAccountId) {
                defaultCounterAccount.value = settings.defaultCounterAccountId;
                const account = this.accounts.find(a => a.id === settings.defaultCounterAccountId);
                if (defaultCounterAccountDisplay && account) {
                    defaultCounterAccountDisplay.value = account.name;
                }
            }
            
            // Default debit account (for Cash payments)
            const defaultDebitAccount = document.getElementById('defaultReturnDebitAccount');
            const defaultDebitAccountDisplay = document.getElementById('defaultReturnDebitAccountDisplay');
            if (defaultDebitAccount && settings.defaultDebitAccountId) {
                defaultDebitAccount.value = settings.defaultDebitAccountId;
                const account = this.accounts.find(a => a.id === settings.defaultDebitAccountId);
                if (defaultDebitAccountDisplay && account) {
                    defaultDebitAccountDisplay.value = account.name;
                }
            }
            
            // Default addition counter account
            const defaultAdditionCounterAccount = document.getElementById('defaultReturnAdditionCounterAccount');
            const defaultAdditionCounterAccountDisplay = document.getElementById('defaultReturnAdditionCounterAccountDisplay');
            if (defaultAdditionCounterAccount && settings.defaultAdditionCounterAccountId) {
                defaultAdditionCounterAccount.value = settings.defaultAdditionCounterAccountId;
                const account = this.accounts.find(a => a.id === settings.defaultAdditionCounterAccountId);
                if (defaultAdditionCounterAccountDisplay && account) {
                    defaultAdditionCounterAccountDisplay.value = account.name;
                }
            }
            
            // Default discount counter account
            const defaultDiscountCounterAccount = document.getElementById('defaultReturnDiscountCounterAccount');
            const defaultDiscountCounterAccountDisplay = document.getElementById('defaultReturnDiscountCounterAccountDisplay');
            if (defaultDiscountCounterAccount && settings.defaultDiscountCounterAccountId) {
                defaultDiscountCounterAccount.value = settings.defaultDiscountCounterAccountId;
                const account = this.accounts.find(a => a.id === settings.defaultDiscountCounterAccountId);
                if (defaultDiscountCounterAccountDisplay && account) {
                    defaultDiscountCounterAccountDisplay.value = account.name;
                }
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
            const defaultCurrency = document.getElementById('defaultReturnCurrency').value;
            const defaultPaymentMethod = document.getElementById('defaultReturnPaymentMethod').value;
            const defaultWarehouse = document.getElementById('defaultReturnWarehouse').value;
            const defaultCostCenter = document.getElementById('defaultReturnCostCenter').value;

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
            const autoGenerateInvoiceNumbers = document.getElementById('autoGenerateReturnInvoiceNumbers').checked;
            const autoUpdateStock = document.getElementById('autoUpdateReturnStock').checked;
            const autoGenerateGeneralEntry = document.getElementById('autoGenerateReturnGeneralEntry').checked;
            const allowReturnWithoutStock = document.getElementById('allowReturnWithoutStock')?.checked || false;
            const defaultTaxRate = parseFloat(document.getElementById('defaultReturnTaxRate').value) || 0;
            
            const defaultCounterAccount = document.getElementById('defaultReturnCounterAccount');
            const defaultCounterAccountId = defaultCounterAccount ? defaultCounterAccount.value : '';
            
            const defaultDebitAccount = document.getElementById('defaultReturnDebitAccount');
            const defaultDebitAccountId = defaultDebitAccount ? defaultDebitAccount.value : '';
            
            const defaultAdditionCounterAccount = document.getElementById('defaultReturnAdditionCounterAccount');
            const defaultAdditionCounterAccountId = defaultAdditionCounterAccount ? defaultAdditionCounterAccount.value : '';
            
            const defaultDiscountCounterAccount = document.getElementById('defaultReturnDiscountCounterAccount');
            const defaultDiscountCounterAccountId = defaultDiscountCounterAccount ? defaultDiscountCounterAccount.value : '';

            const settings = await this.getSettings();
            settings.autoGenerateInvoiceNumbers = autoGenerateInvoiceNumbers;
            settings.autoUpdateStock = autoUpdateStock;
            settings.autoGenerateGeneralEntry = autoGenerateGeneralEntry;
            settings.allowReturnWithoutStock = allowReturnWithoutStock;
            settings.defaultTaxRate = defaultTaxRate;
            settings.defaultCounterAccountId = defaultCounterAccountId || '';
            settings.defaultDebitAccountId = defaultDebitAccountId || '';
            settings.defaultAdditionCounterAccountId = defaultAdditionCounterAccountId || '';
            settings.defaultDiscountCounterAccountId = defaultDiscountCounterAccountId || '';

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
                invoiceNo: document.getElementById('printReturnInvoiceNo').checked,
                date: document.getElementById('printReturnDate').checked,
                paymentMethod: document.getElementById('printReturnPaymentMethod').checked,
                status: document.getElementById('printReturnStatus').checked,
                costCenter: document.getElementById('printReturnCostCenter').checked,
                warehouse: document.getElementById('printReturnWarehouse').checked,
                supplierName: document.getElementById('printReturnSupplierName').checked,
                supplierPhone: document.getElementById('printReturnSupplierPhone').checked,
                supplierAddress: document.getElementById('printReturnSupplierAddress').checked,
                subtotal: document.getElementById('printReturnSubtotal').checked,
                discount: document.getElementById('printReturnDiscount').checked,
                addition: document.getElementById('printReturnAddition').checked,
                total: document.getElementById('printReturnTotal').checked,
                paid: document.getElementById('printReturnPaid').checked,
                remaining: document.getElementById('printReturnRemaining').checked,
                notes: document.getElementById('printReturnNotes').checked,
                productName: document.getElementById('printReturnProductName').checked,
                productQuantity: document.getElementById('printReturnProductQuantity').checked,
                productUnit: document.getElementById('printReturnProductUnit').checked,
                productUnitPrice: document.getElementById('printReturnProductUnitPrice').checked,
                productTotal: document.getElementById('printReturnProductTotal').checked,
                productDiscount: document.getElementById('printReturnProductDiscount').checked,
                productAddition: document.getElementById('printReturnProductAddition').checked,
                productExpiryDate: document.getElementById('printReturnProductExpiryDate').checked,
                productSerialNumber: document.getElementById('printReturnProductSerialNumber').checked,
                productNotes: document.getElementById('printReturnProductNotes').checked
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
                productTotal: true,
                productDiscount: true,
                productAddition: true,
                productExpiryDate: true,
                productSerialNumber: true,
                productNotes: true
            };

            // Set checkboxes
            const fields = [
                'invoiceNo', 'date', 'paymentMethod', 'status', 'costCenter', 'warehouse',
                'supplierName', 'supplierPhone', 'supplierAddress',
                'subtotal', 'discount', 'addition', 'total', 'paid', 'remaining', 'notes',
                'productName', 'productQuantity', 'productUnit', 'productUnitPrice', 'productTotal',
                'productDiscount', 'productAddition', 'productExpiryDate', 'productSerialNumber', 'productNotes'
            ];

            fields.forEach(field => {
                const checkbox = document.getElementById(`printReturn${field.charAt(0).toUpperCase() + field.slice(1)}`);
                if (checkbox) {
                    checkbox.checked = printFields[field] !== false;
                }
            });

        } catch (error) {
            console.error('Error loading print fields settings:', error);
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
                    allowReturnWithoutStock: false,
                    defaultTaxRate: 0,
                    defaultCounterAccountId: '',
                    defaultDebitAccountId: '',
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
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'purchase-returns-settings.json';
            link.click();
            URL.revokeObjectURL(url);
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
                if (file) {
                    const text = await file.text();
                    const settings = JSON.parse(text);
                    await this.saveSettings(settings);
                    await this.loadSettings();
                    showSuccess('تم استيراد الإعدادات بنجاح');
                }
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
            Swal.fire({
                title: 'نتيجة اختبار الإعدادات',
                html: `
                    <div class="text-start">
                        <p><strong>العملة الافتراضية:</strong> ${settings.defaultCurrency || 'IQD'}</p>
                        <p><strong>طريقة الدفع الافتراضية:</strong> ${settings.defaultPaymentMethod || 'cash'}</p>
                        <p><strong>توليد أرقام الفواتير:</strong> ${settings.autoGenerateInvoiceNumbers ? 'نعم' : 'لا'}</p>
                        <p><strong>تحديث المخزون:</strong> ${settings.autoUpdateStock ? 'نعم' : 'لا'}</p>
                        <p><strong>توليد القيد العام:</strong> ${settings.autoGenerateGeneralEntry ? 'نعم' : 'لا'}</p>
                    </div>
                `,
                icon: 'info'
            });
        } catch (error) {
            console.error('Error testing settings:', error);
            showError('خطأ في اختبار الإعدادات');
        }
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
                
                if (target.id === 'openDefaultReturnCounterAccountPicker') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openAccountPicker('defaultReturnCounterAccount', 'defaultReturnCounterAccountDisplay');
                } else if (target.id === 'openDefaultReturnDebitAccountPicker') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openAccountPicker('defaultReturnDebitAccount', 'defaultReturnDebitAccountDisplay');
                } else if (target.id === 'openDefaultReturnAdditionCounterAccountPicker') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openAccountPicker('defaultReturnAdditionCounterAccount', 'defaultReturnAdditionCounterAccountDisplay');
                } else if (target.id === 'openDefaultReturnDiscountCounterAccountPicker') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openAccountPicker('defaultReturnDiscountCounterAccount', 'defaultReturnDiscountCounterAccountDisplay');
                }
            });
        }
    },

    /**
     * Open account picker dialog
     * @param {string} targetSelectId - ID of the hidden input to store account ID
     * @param {string} displayFieldId - ID of the display input to show account name
     */
    openAccountPicker(targetSelectId, displayFieldId = null) {
        const target = document.getElementById(targetSelectId);
        if (!target) return;
        const displayField = displayFieldId ? document.getElementById(displayFieldId) : null;
        const allAccounts = this.accounts || [];
        const leafAccounts = ChartOfAccountsModule.getLeafAccounts();

        // If the currently selected account is not a leaf, include it for display
        if (target.value) {
            const currentAccount = allAccounts.find(a => a.id === target.value);
            if (currentAccount && !leafAccounts.find(a => a.id === currentAccount.id)) {
                leafAccounts.push(currentAccount);
            }
        }

        const content = `
            <div style="text-align: start;">
                <div class="mb-2">
                    <div class="input-group">
                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                        <input type="text" id="returnAccountPickerSearch" class="form-control" placeholder="ابحث في الحسابات النهائية...">
                    </div>
                    <small class="text-muted d-block mt-1">
                        <i class="fas fa-info-circle"></i> يتم عرض الحسابات النهائية فقط (التي لا تحتوي على حسابات فرعية)
                    </small>
                </div>
                <div class="list-group" id="returnAccountPickerList" style="max-height: 360px; overflow:auto;">
                    ${leafAccounts.length > 0 ? leafAccounts.map(acc => `
                        <button type="button" class="list-group-item list-group-item-action return-account-pick-item" data-id="${acc.id}" data-name="${acc.name}">
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
                const searchInput = document.getElementById('returnAccountPickerSearch');
                const items = Array.from(document.querySelectorAll('.return-account-pick-item'));
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
                if (searchInput) {
                    searchInput.addEventListener('input', filter);
                }
                
                items.forEach(el => {
                    el.addEventListener('click', () => {
                        items.forEach(x => {
                            const checkIcon = x.querySelector('i.fas.fa-check');
                            if (checkIcon) checkIcon.style.display = 'none';
                        });
                        const checkIcon = el.querySelector('i.fas.fa-check');
                        if (checkIcon) checkIcon.style.display = '';
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
                if (confirmBtn) {
                    confirmBtn.addEventListener('click', () => {
                        if (selectedId) {
                            target.value = selectedId;
                            if (displayField && selectedName) {
                                displayField.value = selectedName;
                            }
                        }
                    }, { once: true });
                }
            }
        });
    },

    /**
     * Setup return modal event listeners
     */
    setupReturnModalListeners() {
        // Add item button
        const addItemBtn = document.getElementById('addReturnItem');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => {
                this.addReturnItem();
            });
        }

        // Add discount button
        const addDiscountBtn = document.getElementById('addReturnDiscount');
        if (addDiscountBtn) {
            addDiscountBtn.addEventListener('click', () => {
                this.addReturnDiscount();
            });
        }

        // Add addition button
        const addAdditionBtn = document.getElementById('addReturnAddition');
        if (addAdditionBtn) {
            addAdditionBtn.addEventListener('click', () => {
                this.addReturnAddition();
            });
        }

        // Save return button
        const saveBtn = document.getElementById('saveReturnBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveReturn();
            });
        }

        // Payment method change
        const paymentMethod = document.getElementById('returnPaymentMethod');
        if (paymentMethod) {
            paymentMethod.addEventListener('change', () => {
                this.updateReturnPaymentFields();
            });
        }

        // Paid amount change
        const paidAmount = document.getElementById('returnPaidAmount');
        if (paidAmount) {
            paidAmount.addEventListener('input', () => {
                this.calculateReturnRemainingAmount();
            });
        }

        // Currency change
        const currencySelect = document.getElementById('returnCurrency');
        if (currencySelect) {
            currencySelect.addEventListener('change', () => {
                this.calculateReturnTotals();
            });
        }

        // Exchange rate change
        const exchangeRateInput = document.getElementById('returnExchangeRate');
        if (exchangeRateInput) {
            exchangeRateInput.addEventListener('input', () => {
                this.calculateReturnTotals();
            });
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancelReturnBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.cancelReturnForm();
            });
        }

        // Handle modal close event
        const returnModal = document.getElementById('returnModal');
        if (returnModal) {
            returnModal.addEventListener('hidden.bs.modal', () => {
                this.cancelReturnForm();
            });
        }

        // Select all rows checkbox
        const selectAllCheckbox = document.getElementById('selectAllReturnRows');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.return-row-select-checkbox');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                });
            });
        }

        // Toggle columns button
        const toggleColumnsBtn = document.getElementById('toggleReturnColumns');
        if (toggleColumnsBtn) {
            toggleColumnsBtn.addEventListener('click', () => {
                const controls = document.getElementById('returnColumnControls');
                if (controls) {
                    controls.style.display = controls.style.display === 'none' ? 'block' : 'none';
                }
            });
        }

        // Column visibility controls
        const columnToggles = document.querySelectorAll('#returnColumnControls .column-toggle');
        columnToggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const columnClass = e.target.id.replace('return-col-', 'return-col-');
                const columns = document.querySelectorAll(`.${columnClass}`);
                columns.forEach(col => {
                    col.style.display = e.target.checked ? '' : 'none';
                });
            });
        });
    },

    /**
     * Initialize return autocomplete fields
     */
    initializeReturnAutocompleteFields() {
        // Setup Supplier picker button
        const openSupplierPicker = document.getElementById('openReturnSupplierPicker');
        if (openSupplierPicker) {
            openSupplierPicker.addEventListener('click', () => {
                this.openReturnSupplierPicker();
            });
        }

        // Setup Warehouse picker button
        const openWarehousePicker = document.getElementById('openReturnWarehousePicker');
        if (openWarehousePicker) {
            openWarehousePicker.addEventListener('click', () => {
                this.openReturnWarehousePicker();
            });
        }

        // Setup Cost Center picker button
        const openCostCenterPicker = document.getElementById('openReturnCostCenterPicker');
        if (openCostCenterPicker) {
            openCostCenterPicker.addEventListener('click', () => {
                this.openReturnCostCenterPicker();
            });
        }

        const openSalesRep1Picker = document.getElementById('openReturnSalesRep1Picker');
        if (openSalesRep1Picker) {
            openSalesRep1Picker.addEventListener('click', () => {
                this.openReturnSalesRepPicker(1);
            });
        }

        const openSalesRep2Picker = document.getElementById('openReturnSalesRep2Picker');
        if (openSalesRep2Picker) {
            openSalesRep2Picker.addEventListener('click', () => {
                this.openReturnSalesRepPicker(2);
            });
        }

        // If editing, populate the fields
        if (this.editingReturn) {
            this.populateReturnForm(this.editingReturn);
        }
    },

    /**
     * Generate return invoice number
     */
    async generateReturnInvoiceNumber() {
        try {
            const invoiceNo = await this.generateReturnInvoiceNo();
            const invoiceNoInput = document.getElementById('returnInvoiceNo');
            if (invoiceNoInput) {
                invoiceNoInput.value = invoiceNo;
            }
        } catch (error) {
            console.error('Error generating return invoice number:', error);
        }
    },

    /**
     * Apply default values from settings to return form
     */
    async applyReturnDefaultValues() {
        try {
            const settings = await this.getSettings();
            
            // Apply default currency
            const currencySelect = document.getElementById('returnCurrency');
            if (currencySelect && settings.defaultCurrency) {
                currencySelect.value = settings.defaultCurrency;
            }
            
            // Apply default warehouse
            if (settings.defaultWarehouse) {
                const warehouse = this.warehouses.find(w => w.id === settings.defaultWarehouse);
                if (warehouse) {
                    const warehouseDisplay = document.getElementById('returnWarehouseDisplay');
                    const warehouseIdInput = document.getElementById('returnWarehouseId');
                    if (warehouseDisplay && warehouseIdInput) {
                        warehouseDisplay.value = warehouse.name;
                        warehouseIdInput.value = warehouse.id;
                    }
                }
            }
            
            // Apply default cost center
            if (settings.defaultCostCenter) {
                const costCenter = this.costCenters.find(c => c.id === settings.defaultCostCenter);
                if (costCenter) {
                    const costCenterDisplay = document.getElementById('returnCostCenterDisplay');
                    const costCenterIdInput = document.getElementById('returnCostCenterId');
                    if (costCenterDisplay && costCenterIdInput) {
                        costCenterDisplay.value = costCenter.name;
                        costCenterIdInput.value = costCenter.id;
                    }
                }
            }
            
            // Apply default payment method
            const paymentMethodSelect = document.getElementById('returnPaymentMethod');
            if (paymentMethodSelect && settings.defaultPaymentMethod) {
                paymentMethodSelect.value = settings.defaultPaymentMethod;
                this.updateReturnPaymentFields();
            }
        } catch (error) {
            console.error('Error applying default values:', error);
        }
    },

    /**
     * Initialize empty rows for new return
     */
    initializeEmptyReturnRows(count = 6) {
        const tbody = document.getElementById('returnItemsBody');
        if (!tbody) return;
        
        // Clear existing rows if any
        tbody.innerHTML = '';
        
        // Add empty rows
        for (let i = 0; i < count; i++) {
            this.addReturnItem();
        }
        
        console.log(`✅ Initialized ${count} empty return rows`);
    },

    /**
     * Add return item row
     */
    addReturnItem() {
        const tbody = document.getElementById('returnItemsBody');
        if (!tbody) return;

        const rowIndex = tbody.children.length + 1;
        const row = document.createElement('tr');
        row.dataset.rowIndex = rowIndex;
        row.innerHTML = `
            <td style="border: 1px solid #d0d7e5; text-align: center; padding: 6px 8px; vertical-align: middle; background: #f8f9fa;">
                <input type="checkbox" class="return-row-select-checkbox" data-row-index="${rowIndex}" style="cursor: pointer; width: 18px; height: 18px;">
            </td>
            <td style="border: 1px solid #d0d7e5; text-align: center; padding: 6px 8px; vertical-align: middle; font-weight: 600; min-width: 40px; background: #f8f9fa; color: #495057; font-size: 0.9rem;">${rowIndex}</td>
            <td class="return-col-product" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <div class="input-group input-group-sm" style="margin: 0;">
                    <input type="text" class="form-control form-control-sm return-product-display-input" placeholder="اختر المنتج..." readonly style="background-color: #f8f9fa; cursor: pointer; border: 1px solid #d0d7e5; border-radius: 0;" data-row-index="${rowIndex}">
                    <input type="hidden" class="return-product-select-id" value="">
                    <button type="button" class="btn btn-outline-secondary btn-sm return-product-picker-btn" data-row-index="${rowIndex}" title="اختر منتج" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </td>
            <td class="return-col-quantity" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="number" class="form-control form-control-sm return-quantity-input" min="0" step="0.01" value="1" required style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="return-col-unit" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <div class="return-unit-autocomplete-container" style="position: relative; width: 100%; min-height: 32px; display: flex; align-items: center; color: #6c757d; font-size: 0.875rem;">
                    <span style="padding: 0 8px;">اختر المنتج أولاً</span>
                </div>
                <input type="hidden" class="return-unit-select-id" value="">
            </td>
            <td class="return-col-available-qty" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff; text-align: center;">
                <button type="button" class="btn btn-sm btn-outline-info return-show-available-qty-btn" title="عرض الكميات المتوفرة" style="display: none;">
                    <i class="fas fa-boxes"></i> الكميات
                </button>
            </td>
            <td class="return-col-price" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="number" class="form-control form-control-sm return-price-input" min="0" step="0.01" value="0" required style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="return-col-discount" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="number" class="form-control form-control-sm return-discount-percent-input" min="0" max="100" step="0.01" value="0" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="number" class="form-control form-control-sm return-discount-amount-input" min="0" step="0.01" value="0" placeholder="أو أدخل المبلغ" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="return-col-addition-percent" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="number" class="form-control form-control-sm return-addition-percent-input" min="0" max="100" step="0.01" value="0" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="return-col-addition" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="number" class="form-control form-control-sm return-addition-amount-input" min="0" step="0.01" value="0" placeholder="أو أدخل المبلغ" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td style="border: 1px solid #d0d7e5; padding: 4px; background: #f8f9fa;">
                <input type="number" class="form-control form-control-sm return-total-input" min="0" step="0.01" value="0" readonly style="background-color: #f8f9fa; font-weight: bold; border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="return-col-expiry" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <select class="form-select form-select-sm return-expiry-date-input" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
                    <option value="">-- اختر تاريخ الصلاحية --</option>
                </select>
            </td>
            <td class="return-col-serial" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <select class="form-select form-select-sm return-serial-number-input" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
                    <option value="">-- اختر الرقم التسلسلي --</option>
                </select>
            </td>
            <td class="return-col-notes" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="text" class="form-control form-control-sm return-notes-input" placeholder="ملاحظات" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td style="border: 1px solid #d0d7e5; text-align: center; padding: 4px; background: #fff;">
                <button type="button" class="btn btn-sm btn-outline-danger return-remove-item" title="حذف الصف" style="border: 1px solid #dc3545; border-radius: 0; padding: 4px 8px;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);
        
        // Setup row listeners
        this.setupReturnItemListeners(row);
        this.calculateReturnTotals();
    },

    /**
     * Setup return item row listeners
     */
    setupReturnItemListeners(row) {
        // Remove item button
        const removeBtn = row.querySelector('.return-remove-item');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                row.remove();
                this.calculateReturnTotals();
            });
        }

        // Product picker button
        const productPickerBtn = row.querySelector('.return-product-picker-btn');
        if (productPickerBtn) {
            productPickerBtn.addEventListener('click', () => {
                this.openReturnProductPicker(row);
            });
        }

        // Available quantities button
        const availableQtyBtn = row.querySelector('.return-show-available-qty-btn');
        if (availableQtyBtn) {
            availableQtyBtn.addEventListener('click', () => {
                this.showAvailableQuantities(row);
            });
        }

        // Calculate total on input change
        const inputs = row.querySelectorAll('.return-price-input, .return-discount-percent-input, .return-discount-amount-input, .return-addition-percent-input, .return-addition-amount-input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.calculateReturnItemTotal(row);
                this.calculateReturnTotals();
            });
            // Also listen to blur event to ensure calculation when field is cleared
            input.addEventListener('blur', () => {
                if (input.value === '' || input.value === null) {
                    input.value = 0;
                    this.calculateReturnItemTotal(row);
                    this.calculateReturnTotals();
                }
            });
        });

        // Validate quantity input - ensure it doesn't exceed available stock
        const quantityInput = row.querySelector('.return-quantity-input');
        if (quantityInput) {
            quantityInput.addEventListener('input', async () => {
                await this.validateReturnQuantity(row);
                // ✅ إعادة تحميل تفاصيل المخزون عند تغيير الكمية (للتأكد من تحديث القوائم)
                const hasExpiry = row.dataset.hasExpiry === 'true';
                const hasSerial = row.dataset.hasSerial === 'true';
                if (hasExpiry || hasSerial) {
                    await this.loadProductInventoryDetails(row);
                }
                this.calculateReturnItemTotal(row);
                this.calculateReturnTotals();
            });
            quantityInput.addEventListener('blur', async () => {
                if (quantityInput.value === '' || quantityInput.value === null) {
                    quantityInput.value = 0;
                }
                await this.validateReturnQuantity(row);
                // ✅ إعادة تحميل تفاصيل المخزون عند تغيير الكمية (للتأكد من تحديث القوائم)
                const hasExpiry = row.dataset.hasExpiry === 'true';
                const hasSerial = row.dataset.hasSerial === 'true';
                if (hasExpiry || hasSerial) {
                    await this.loadProductInventoryDetails(row);
                }
                this.calculateReturnItemTotal(row);
                this.calculateReturnTotals();
            });
        }

        // Expiry date and serial number linking
        const expiryDateSelect = row.querySelector('.return-expiry-date-input');
        const serialNumberSelect = row.querySelector('.return-serial-number-input');

        if (expiryDateSelect) {
            expiryDateSelect.addEventListener('change', async () => {
                await this.handleExpiryDateSelection(row);
            });
        }

        if (serialNumberSelect) {
            serialNumberSelect.addEventListener('change', async () => {
                await this.handleSerialNumberSelection(row);
            });
        }
    },

    /**
     * Handle expiry date selection - load available serial numbers
     */
    async handleExpiryDateSelection(row) {
        const productHiddenInput = row.querySelector('.return-product-select-id');
        const warehouseId = document.getElementById('returnWarehouseId')?.value;
        const expiryDateSelect = row.querySelector('.return-expiry-date-input');
        const serialNumberSelect = row.querySelector('.return-serial-number-input');

        if (!productHiddenInput?.value || !warehouseId || !expiryDateSelect?.value) {
            // Clear serial numbers if no expiry date selected
            if (serialNumberSelect) {
                serialNumberSelect.innerHTML = '<option value="">-- اختر الرقم التسلسلي --</option>';
            }
            return;
        }

        try {
            const serialNumbers = await Collections.getAvailableSerialNumbers(
                productHiddenInput.value,
                warehouseId,
                expiryDateSelect.value
            );

            // Update serial number select
            if (serialNumberSelect) {
                serialNumberSelect.innerHTML = '<option value="">-- اختر الرقم التسلسلي --</option>';
                serialNumbers.forEach(item => {
                    // ✅ التحقق من صحة الرقم التسلسلي قبل الاستخدام
                    if (!item.serialNumber || item.serialNumber === '' || item.serialNumber === null) {
                        return; // تخطي القيم غير الصحيحة
                    }
                    
                    const option = document.createElement('option');
                    option.value = item.serialNumber;
                    option.textContent = `${item.serialNumber} (متاح: ${formatNumber(item.quantity)})`;
                    serialNumberSelect.appendChild(option);
                });

                if (serialNumbers.length === 0) {
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = 'لا توجد أرقام تسلسلية متاحة';
                    option.disabled = true;
                    serialNumberSelect.appendChild(option);
                }
            }
        } catch (error) {
            console.error('Error loading serial numbers:', error);
            if (serialNumberSelect) {
                serialNumberSelect.innerHTML = '<option value="">خطأ في تحميل الأرقام التسلسلية</option>';
            }
        }
    },

    /**
     * Handle serial number selection - load available expiry dates
     */
    async handleSerialNumberSelection(row) {
        const productHiddenInput = row.querySelector('.return-product-select-id');
        const warehouseId = document.getElementById('returnWarehouseId')?.value;
        const expiryDateSelect = row.querySelector('.return-expiry-date-input');
        const serialNumberSelect = row.querySelector('.return-serial-number-input');

        if (!productHiddenInput?.value || !warehouseId || !serialNumberSelect?.value) {
            // Clear expiry dates if no serial number selected
            if (expiryDateSelect) {
                expiryDateSelect.innerHTML = '<option value="">-- اختر تاريخ الصلاحية --</option>';
            }
            return;
        }

        try {
            const expiryDates = await Collections.getAvailableExpiryDates(
                productHiddenInput.value,
                warehouseId,
                serialNumberSelect.value
            );

            // Update expiry date select
            if (expiryDateSelect) {
                expiryDateSelect.innerHTML = '<option value="">-- اختر تاريخ الصلاحية --</option>';
                expiryDates.forEach(item => {
                    // ✅ التحقق من صحة تاريخ الصلاحية قبل الاستخدام
                    if (!item.expiryDate || item.expiryDate === '' || item.expiryDate === null) {
                        return; // تخطي القيم غير الصحيحة
                    }
                    
                    try {
                        const expiryDateObj = new Date(item.expiryDate);
                        // ✅ التحقق من أن التاريخ صحيح
                        if (isNaN(expiryDateObj.getTime())) {
                            console.warn(`⚠️ تاريخ صلاحية غير صحيح: ${item.expiryDate}`);
                            return; // تخطي التواريخ غير الصحيحة
                        }
                        
                        const option = document.createElement('option');
                        option.value = item.expiryDate;
                        const formattedDate = formatDate(expiryDateObj);
                        option.textContent = `${formattedDate} (متاح: ${formatNumber(item.quantity)})`;
                        expiryDateSelect.appendChild(option);
                    } catch (error) {
                        console.error(`❌ خطأ في تنسيق تاريخ الصلاحية: ${item.expiryDate}`, error);
                        // تخطي هذا التاريخ
                    }
                });

                if (expiryDates.length === 0) {
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = 'لا توجد تواريخ صلاحية متاحة';
                    option.disabled = true;
                    expiryDateSelect.appendChild(option);
                }
            }
        } catch (error) {
            console.error('Error loading expiry dates:', error);
            if (expiryDateSelect) {
                expiryDateSelect.innerHTML = '<option value="">خطأ في تحميل تواريخ الصلاحية</option>';
            }
        }
    },

    /**
     * Load available expiry dates and serial numbers when product is selected
     */
    async loadProductInventoryDetails(row) {
        const productHiddenInput = row.querySelector('.return-product-select-id');
        const warehouseId = document.getElementById('returnWarehouseId')?.value;
        const expiryDateSelect = row.querySelector('.return-expiry-date-input');
        const serialNumberSelect = row.querySelector('.return-serial-number-input');

        if (!productHiddenInput?.value || !warehouseId) {
            return;
        }

        const product = this.products.find(p => p.id === productHiddenInput.value);
        if (!product) {
            return;
        }

        // Only load if product has expiry date or serial number tracking
        const hasExpiry = product.hasExpiryDate || false;
        const hasSerial = product.hasSerialNumber || false;

        if (!hasExpiry && !hasSerial) {
            return;
        }

        try {
            const inventoryItems = await Collections.getAvailableInventoryItems(
                productHiddenInput.value,
                warehouseId
            );

            // Get unique expiry dates and serial numbers
            // ✅ تصفية القيم null/undefined/empty قبل إضافتها للقائمة
            const uniqueExpiryDates = [...new Set(inventoryItems.map(item => item.expiryDate).filter(d => d && d !== '' && d !== null))].sort();
            const uniqueSerialNumbers = [...new Set(inventoryItems.map(item => item.serialNumber).filter(s => s && s !== '' && s !== null))].sort();

            // Update expiry date select if product has expiry tracking
            if (hasExpiry && expiryDateSelect) {
                // ✅ حفظ القيمة المختارة مسبقاً قبل إعادة التحميل
                const currentExpiryDate = expiryDateSelect.value;
                expiryDateSelect.innerHTML = '<option value="">-- اختر تاريخ الصلاحية --</option>';
                uniqueExpiryDates.forEach(expiryDate => {
                    // ✅ التحقق من صحة تاريخ الصلاحية قبل الاستخدام
                    if (!expiryDate || expiryDate === '' || expiryDate === null) {
                        return; // تخطي القيم غير الصحيحة
                    }
                    
                    try {
                        const expiryDateObj = new Date(expiryDate);
                        // ✅ التحقق من أن التاريخ صحيح
                        if (isNaN(expiryDateObj.getTime())) {
                            console.warn(`⚠️ تاريخ صلاحية غير صحيح: ${expiryDate}`);
                            return; // تخطي التواريخ غير الصحيحة
                        }
                        
                        const option = document.createElement('option');
                        option.value = expiryDate;
                        const formattedDate = formatDate(expiryDateObj);
                        const count = inventoryItems.filter(item => item.expiryDate === expiryDate).length;
                        
                        // ✅ استخدام نص مناسب حسب وجود رقم تسلسلي
                        if (hasSerial) {
                            // إذا كان المنتج يملك رقم تسلسلي، يعرض عدد الأرقام التسلسلية
                            option.textContent = `${formattedDate} (${count} رقم تسلسلي)`;
                        } else {
                            // إذا كان المنتج لا يملك رقم تسلسلي، يعرض عدد العناصر
                            option.textContent = `${formattedDate} (${count} عنصر)`;
                        }
                        expiryDateSelect.appendChild(option);
                    } catch (error) {
                        console.error(`❌ خطأ في تنسيق تاريخ الصلاحية: ${expiryDate}`, error);
                        // تخطي هذا التاريخ
                    }
                });

                if (uniqueExpiryDates.length === 0) {
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = 'لا توجد تواريخ صلاحية متاحة';
                    option.disabled = true;
                    expiryDateSelect.appendChild(option);
                } else {
                    // ✅ استعادة القيمة المختارة مسبقاً إذا كانت موجودة في القائمة الجديدة
                    if (currentExpiryDate && uniqueExpiryDates.includes(currentExpiryDate)) {
                        expiryDateSelect.value = currentExpiryDate;
                    }
                }
            }

            // Update serial number select if product has serial tracking
            if (hasSerial && serialNumberSelect) {
                // ✅ حفظ القيمة المختارة مسبقاً قبل إعادة التحميل
                const currentSerialNumber = serialNumberSelect.value;
                serialNumberSelect.innerHTML = '<option value="">-- اختر الرقم التسلسلي --</option>';
                uniqueSerialNumbers.forEach(serialNumber => {
                    // ✅ التحقق من صحة الرقم التسلسلي قبل الاستخدام
                    if (!serialNumber || serialNumber === '' || serialNumber === null) {
                        return; // تخطي القيم غير الصحيحة
                    }
                    
                    const option = document.createElement('option');
                    option.value = serialNumber;
                    const count = inventoryItems.filter(item => item.serialNumber === serialNumber).length;
                    
                    // ✅ استخدام نص مناسب حسب وجود تاريخ صلاحية
                    if (hasExpiry) {
                        // إذا كان المنتج يملك تاريخ صلاحية، يعرض عدد تواريخ الصلاحية
                        option.textContent = `${serialNumber} (${count} تاريخ صلاحية)`;
                    } else {
                        // إذا كان المنتج لا يملك تاريخ صلاحية، يعرض عدد العناصر
                        option.textContent = `${serialNumber} (${count} عنصر)`;
                    }
                    serialNumberSelect.appendChild(option);
                });

                if (uniqueSerialNumbers.length === 0) {
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = 'لا توجد أرقام تسلسلية متاحة';
                    option.disabled = true;
                    serialNumberSelect.appendChild(option);
                } else {
                    // ✅ استعادة القيمة المختارة مسبقاً إذا كانت موجودة في القائمة الجديدة
                    if (currentSerialNumber && uniqueSerialNumbers.includes(currentSerialNumber)) {
                        serialNumberSelect.value = currentSerialNumber;
                    }
                }
            }
        } catch (error) {
            console.error('Error loading inventory details:', error);
        }
    },

    /**
     * Calculate return item total
     */
    calculateReturnItemTotal(row) {
        const quantity = parseFloat(row.querySelector('.return-quantity-input')?.value) || 0;
        const price = parseFloat(row.querySelector('.return-price-input')?.value) || 0;
        const discountPercent = parseFloat(row.querySelector('.return-discount-percent-input')?.value) || 0;
        const discountAmount = parseFloat(row.querySelector('.return-discount-amount-input')?.value) || 0;
        const additionPercent = parseFloat(row.querySelector('.return-addition-percent-input')?.value) || 0;
        const additionAmount = parseFloat(row.querySelector('.return-addition-amount-input')?.value) || 0;

        let subtotal = quantity * price;
        
        // Apply discount
        if (discountPercent > 0) {
            subtotal -= (subtotal * discountPercent / 100);
        } else if (discountAmount > 0) {
            subtotal -= discountAmount;
        }
        
        // Apply addition
        if (additionPercent > 0) {
            subtotal += (subtotal * additionPercent / 100);
        } else if (additionAmount > 0) {
            subtotal += additionAmount;
        }

        const totalInput = row.querySelector('.return-total-input');
        if (totalInput) {
            totalInput.value = subtotal.toFixed(2);
        }
    },

    /**
     * Calculate return totals
     */
    calculateReturnTotals() {
        const tbody = document.getElementById('returnItemsBody');
        if (!tbody) return;
        
        const rows = tbody.children;
        let subtotal = 0;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const total = parseFloat(row.querySelector('.return-total-input')?.value) || 0;
            subtotal += total;
        }

        // Calculate discounts and additions from table
        const discountRows = document.querySelectorAll('#returnDiscountsAdditionsBody tr');
        let totalDiscounts = 0;
        let totalAdditions = 0;

        const invoiceCurrency = document.getElementById('returnCurrency')?.value || 'IQD';

        discountRows.forEach(row => {
            const type = row.querySelector('.return-type-select')?.value;
            const amount = parseFloat(row.querySelector('.return-amount-input')?.value) || 0;
            
            if (type === 'discount') {
                totalDiscounts += amount;
            } else if (type === 'addition') {
                totalAdditions += amount;
            }
        });

        const finalTotal = subtotal - totalDiscounts + totalAdditions;

        // Update display
        const subtotalEl = document.getElementById('returnSubtotal');
        if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2);
        
        const subtotalCurrencyEl = document.getElementById('returnSubtotalCurrency');
        if (subtotalCurrencyEl) subtotalCurrencyEl.textContent = invoiceCurrency;
        
        const totalDiscountsEl = document.getElementById('returnTotalDiscounts');
        if (totalDiscountsEl) totalDiscountsEl.textContent = totalDiscounts.toFixed(2);
        
        const discountCurrencyEl = document.getElementById('returnDiscountCurrency');
        if (discountCurrencyEl) discountCurrencyEl.textContent = invoiceCurrency;
        
        const totalAdditionsEl = document.getElementById('returnTotalAdditions');
        if (totalAdditionsEl) totalAdditionsEl.textContent = totalAdditions.toFixed(2);
        
        const additionCurrencyEl = document.getElementById('returnAdditionCurrency');
        if (additionCurrencyEl) additionCurrencyEl.textContent = invoiceCurrency;
        
        const totalEl = document.getElementById('returnTotal');
        if (totalEl) totalEl.textContent = finalTotal.toFixed(2);
        
        const totalCurrencyEl = document.getElementById('returnTotalCurrency');
        if (totalCurrencyEl) totalCurrencyEl.textContent = invoiceCurrency;

        // Update remaining amount
        this.calculateReturnRemainingAmount();
    },

    /**
     * Calculate return remaining amount
     */
    calculateReturnRemainingAmount() {
        const total = parseFloat(document.getElementById('returnTotal')?.textContent) || 0;
        const paidAmount = parseFloat(document.getElementById('returnPaidAmount')?.value) || 0;
        const remaining = total - paidAmount;

        const remainingInput = document.getElementById('returnRemainingAmount');
        if (remainingInput) {
            remainingInput.value = remaining.toFixed(2);
        }

        // Update payment status
        const paymentStatusSelect = document.getElementById('returnPaymentStatus');
        if (paymentStatusSelect) {
            if (paidAmount >= total) {
                paymentStatusSelect.value = 'paid';
            } else if (paidAmount > 0) {
                paymentStatusSelect.value = 'partial';
            } else {
                paymentStatusSelect.value = 'unpaid';
            }
        }
    },

    /**
     * Update return payment fields
     */
    updateReturnPaymentFields() {
        const paymentMethod = document.getElementById('returnPaymentMethod')?.value;
        const paidAmountInput = document.getElementById('returnPaidAmount');
        const dueDateInput = document.getElementById('returnDueDate');

        if (paymentMethod === 'cash') {
            const total = parseFloat(document.getElementById('returnTotal')?.textContent) || 0;
            if (paidAmountInput) paidAmountInput.value = total;
            if (dueDateInput) {
                dueDateInput.value = '';
                dueDateInput.disabled = true;
            }
        } else if (paymentMethod === 'credit') {
            if (paidAmountInput) paidAmountInput.value = 0;
            if (dueDateInput) {
                dueDateInput.disabled = false;
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + 30);
                dueDateInput.value = dueDate.toISOString().split('T')[0];
            }
        }

        this.calculateReturnRemainingAmount();
    },

    /**
     * Open return supplier picker
     */
    openReturnSupplierPicker() {
        const modal = new bootstrap.Modal(document.getElementById('returnSupplierPickerModal'));
        this.populateReturnSupplierPicker();
        modal.show();
    },

    /**
     * Populate return supplier picker
     */
    populateReturnSupplierPicker(searchTerm = '') {
        const tbody = document.getElementById('returnSupplierPickerTableBody');
        if (!tbody) return;

        const searchLower = searchTerm.toLowerCase();
        const filteredSuppliers = this.suppliers.filter(supplier => {
            if (!searchTerm) return true;
            const name = (supplier.name || '').toLowerCase();
            const code = (supplier.code || '').toLowerCase();
            const phone = (supplier.phone || '').toLowerCase();
            return name.includes(searchLower) || code.includes(searchLower) || phone.includes(searchLower);
        });

        tbody.innerHTML = filteredSuppliers.map(supplier => `
            <tr style="cursor: pointer;">
                <td>${this.escapeHtml(supplier.name || '')}</td>
                <td>${this.escapeHtml(supplier.code || '')}</td>
                <td>${this.escapeHtml(supplier.phone || '')}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="PurchaseReturnsModule.selectReturnSupplier('${supplier.id}', '${this.escapeHtml(supplier.name)}')">
                        <i class="fas fa-check"></i> اختيار
                    </button>
                </td>
            </tr>
        `).join('');

        // Setup search
        const searchInput = document.getElementById('returnSupplierPickerSearch');
        if (searchInput) {
            searchInput.value = searchTerm;
            searchInput.addEventListener('input', (e) => {
                this.populateReturnSupplierPicker(e.target.value);
            });
        }
    },

    /**
     * Select return supplier
     */
    selectReturnSupplier(supplierId, supplierName) {
        const supplierDisplay = document.getElementById('returnSupplierDisplay');
        const supplierIdInput = document.getElementById('returnSupplierId');
        if (supplierDisplay) supplierDisplay.value = supplierName;
        if (supplierIdInput) supplierIdInput.value = supplierId;

        const modal = bootstrap.Modal.getInstance(document.getElementById('returnSupplierPickerModal'));
        if (modal) modal.hide();
    },

    /**
     * Open return warehouse picker
     */
    openReturnWarehousePicker() {
        const modal = new bootstrap.Modal(document.getElementById('returnWarehousePickerModal'));
        this.populateReturnWarehousePicker();
        modal.show();
    },

    /**
     * Populate return warehouse picker
     */
    populateReturnWarehousePicker(searchTerm = '') {
        const tbody = document.getElementById('returnWarehousePickerTableBody');
        if (!tbody) return;

        const searchLower = searchTerm.toLowerCase();
        const filteredWarehouses = this.warehouses.filter(warehouse => {
            if (!searchTerm) return true;
            const name = (warehouse.name || '').toLowerCase();
            const code = (warehouse.code || '').toLowerCase();
            return name.includes(searchLower) || code.includes(searchLower);
        });

        tbody.innerHTML = filteredWarehouses.map(warehouse => `
            <tr style="cursor: pointer;">
                <td>${this.escapeHtml(warehouse.name || '')}</td>
                <td>${this.escapeHtml(warehouse.code || '')}</td>
                <td>${this.escapeHtml(warehouse.location || '')}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="PurchaseReturnsModule.selectReturnWarehouse('${warehouse.id}', '${this.escapeHtml(warehouse.name)}')">
                        <i class="fas fa-check"></i> اختيار
                    </button>
                </td>
            </tr>
        `).join('');

        const searchInput = document.getElementById('returnWarehousePickerSearch');
        if (searchInput) {
            searchInput.value = searchTerm;
            searchInput.addEventListener('input', (e) => {
                this.populateReturnWarehousePicker(e.target.value);
            });
        }
    },

    /**
     * Select return warehouse
     */
    async selectReturnWarehouse(warehouseId, warehouseName) {
        const warehouseDisplay = document.getElementById('returnWarehouseDisplay');
        const warehouseIdInput = document.getElementById('returnWarehouseId');
        if (warehouseDisplay) warehouseDisplay.value = warehouseName;
        if (warehouseIdInput) warehouseIdInput.value = warehouseId;

        const modal = bootstrap.Modal.getInstance(document.getElementById('returnWarehousePickerModal'));
        if (modal) modal.hide();

        // Reload inventory details for all rows when warehouse changes
        const tbody = document.getElementById('returnItemsBody');
        if (tbody) {
            // Update available quantities button for all rows
            const rows = tbody.querySelectorAll('tr');
            rows.forEach(row => {
                this.updateAvailableQuantitiesButton(row);
            });
        }
        if (tbody) {
            const rows = Array.from(tbody.children);
            for (const row of rows) {
                const productHiddenInput = row.querySelector('.return-product-select-id');
                if (productHiddenInput?.value) {
                    await this.loadProductInventoryDetails(row);
                }
            }
        }
    },

    /**
     * Open return cost center picker
     */
    openReturnCostCenterPicker() {
        const modal = new bootstrap.Modal(document.getElementById('returnCostCenterPickerModal'));
        this.populateReturnCostCenterPicker();
        modal.show();
    },

    /**
     * Populate return cost center picker
     */
    populateReturnCostCenterPicker(searchTerm = '') {
        const tbody = document.getElementById('returnCostCenterPickerTableBody');
        if (!tbody) return;

        const searchLower = searchTerm.toLowerCase();
        const filteredCostCenters = this.costCenters.filter(costCenter => {
            if (!searchTerm) return true;
            const name = (costCenter.name || '').toLowerCase();
            const code = (costCenter.code || '').toLowerCase();
            return name.includes(searchLower) || code.includes(searchLower);
        });

        tbody.innerHTML = filteredCostCenters.map(costCenter => `
            <tr style="cursor: pointer;">
                <td>${this.escapeHtml(costCenter.name || '')}</td>
                <td>${this.escapeHtml(costCenter.code || '')}</td>
                <td>${this.escapeHtml(costCenter.description || '')}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="PurchaseReturnsModule.selectReturnCostCenter('${costCenter.id}', '${this.escapeHtml(costCenter.name)}')">
                        <i class="fas fa-check"></i> اختيار
                    </button>
                </td>
            </tr>
        `).join('');

        const searchInput = document.getElementById('returnCostCenterPickerSearch');
        if (searchInput) {
            searchInput.value = searchTerm;
            searchInput.addEventListener('input', (e) => {
                this.populateReturnCostCenterPicker(e.target.value);
            });
        }
    },

    /**
     * Select return cost center
     */
    selectReturnCostCenter(costCenterId, costCenterName) {
        const costCenterDisplay = document.getElementById('returnCostCenterDisplay');
        const costCenterIdInput = document.getElementById('returnCostCenterId');
        if (costCenterDisplay) costCenterDisplay.value = costCenterName;
        if (costCenterIdInput) costCenterIdInput.value = costCenterId;

        const modal = bootstrap.Modal.getInstance(document.getElementById('returnCostCenterPickerModal'));
        if (modal) modal.hide();
    },

    /**
     * Open return sales rep picker
     */
    openReturnSalesRepPicker(repNumber) {
        const modal = new bootstrap.Modal(document.getElementById('returnSalesRepPickerModal'));
        this.currentSalesRepNumber = repNumber;
        this.populateReturnSalesRepPicker();
        modal.show();
    },

    /**
     * Populate return sales rep picker
     */
    populateReturnSalesRepPicker(searchTerm = '') {
        const tbody = document.getElementById('returnSalesRepPickerTableBody');
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
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">لا توجد مندوبين مبيعات</td></tr>';
            return;
        }

        tbody.innerHTML = filteredSalesReps.map(salesRep => `
            <tr style="cursor: pointer;">
                <td>${this.escapeHtml(salesRep.name || '')}</td>
                <td>${this.escapeHtml(salesRep.code || '')}</td>
                <td>${this.escapeHtml(salesRep.phone || '')}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="PurchaseReturnsModule.selectReturnSalesRep('${salesRep.id}', '${this.escapeHtml(salesRep.name)}')">
                        <i class="fas fa-check"></i> اختيار
                    </button>
                </td>
            </tr>
        `).join('');

        // Setup search
        const searchInput = document.getElementById('returnSalesRepPickerSearch');
        if (searchInput) {
            searchInput.value = searchTerm;
            // Remove old event listener if exists
            const newSearchInput = searchInput.cloneNode(true);
            searchInput.parentNode.replaceChild(newSearchInput, searchInput);
            
            // Add new event listener
            newSearchInput.addEventListener('input', (e) => {
                this.populateReturnSalesRepPicker(e.target.value);
            });
        }
    },

    /**
     * Select return sales rep
     */
    selectReturnSalesRep(salesRepId, salesRepName) {
        const repNumber = this.currentSalesRepNumber || 1;
        const salesRepDisplay = document.getElementById(`returnSalesRep${repNumber}Display`);
        const salesRepIdInput = document.getElementById(`returnSalesRep${repNumber}Id`);
        if (salesRepDisplay) salesRepDisplay.value = salesRepName;
        if (salesRepIdInput) salesRepIdInput.value = salesRepId;

        const modal = bootstrap.Modal.getInstance(document.getElementById('returnSalesRepPickerModal'));
        if (modal) modal.hide();
    },

    /**
     * Edit return invoice
     */
    async editReturn(returnId) {
        try {
            const returnData = await Collections.getPurchaseReturn(returnId);
            if (!returnData) {
                showError('فاتورة المرتجع غير موجودة');
                return;
            }

            this.editingReturn = returnData;
            
            // Show modal first
            this.showReturnModal();
            
            // Wait for modal to be created and shown, then populate form
            setTimeout(() => {
                const modalElement = document.getElementById('returnModal');
                if (modalElement) {
                    const populateAfterShow = () => {
                        setTimeout(() => {
                            this.populateReturnForm(returnData);
                        }, 200);
                        modalElement.removeEventListener('shown.bs.modal', populateAfterShow);
                    };
                    
                    modalElement.addEventListener('shown.bs.modal', populateAfterShow);
                    
                    if (modalElement.classList.contains('show')) {
                        setTimeout(() => {
                            this.populateReturnForm(returnData);
                        }, 200);
                    }
                } else {
                    setTimeout(() => {
                        this.populateReturnForm(returnData);
                    }, 500);
                }
            }, 100);
        } catch (error) {
            console.error('Error loading return:', error);
            showError('فشل في تحميل فاتورة المرتجع: ' + error.message);
        }
    },

    /**
     * Delete return invoice
     */
    async deleteReturn(returnId) {
        try {
            const result = await Swal.fire({
                title: 'تأكيد الحذف',
                text: 'هل أنت متأكد من حذف فاتورة المرتجع؟ سيتم حذف القيد العام المرتبط أيضاً.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'نعم، احذف',
                cancelButtonText: 'إلغاء',
                confirmButtonColor: '#dc3545'
            });

            if (!result.isConfirmed) return;

            showLoading();

            // Get return data first to reverse inventory
            const returnData = await Collections.getPurchaseReturn(returnId);
            if (returnData) {
                // Reverse inventory (add back the stock)
                if (returnData.items && returnData.items.length > 0) {
                    for (const item of returnData.items) {
                        const product = await Collections.getProduct(item.productId);
                        if (!product) continue;
                        
                        // Convert quantity to main unit using helper function
                        const quantityInMainUnit = InvoiceUtils.convertToMainUnit(item.quantity, item.unitId, product);
                        
                        // Add back the stock (reverse the return)
                        await Collections.updateProductWarehouseStock(
                            item.productId,
                            returnData.warehouseId || 'default',
                            quantityInMainUnit,
                            'add'
                        );
                    }
                }

                // Delete inventory movements
                await this.deleteInventoryMovementsBySource('purchase_return', returnId);
                
                // ✅ إعادة حساب رصيد المنتجات من inventoryMovements بعد حذف الحركات
                // هذا يضمن أن warehouseStock دقيق حتى بعد حذف المرتجع
                if (returnData.items && returnData.items.length > 0) {
                    const uniqueProductIds = [...new Set(returnData.items.map(item => item.productId))];
                    for (const productId of uniqueProductIds) {
                        try {
                            await Collections.recalculateProductWarehouseStock(productId);
                            console.log(`✅ تم إعادة حساب رصيد المنتج ${productId} من inventoryMovements`);
                        } catch (recalcError) {
                            console.error(`❌ خطأ في إعادة حساب رصيد المنتج ${productId}:`, recalcError);
                            // Continue with other products even if one fails
                        }
                    }
                }

                // Delete general entry
                const sourceId = String(returnId);
                await this.deleteGeneralEntryBySourceId(sourceId);
            }

            // Delete return
            await Collections.deletePurchaseReturn(returnId);

            // Reload data
            await this.loadPurchaseReturns();
            this.updateDashboard();

            hideLoading();
            showSuccess('تم حذف فاتورة المرتجع بنجاح');

        } catch (error) {
            console.error('Error deleting return:', error);
            hideLoading();
            showError('فشل في حذف فاتورة المرتجع: ' + (error.message || 'خطأ غير معروف'));
        }
    },

    /**
     * Delete inventory movements by source ID and type
     */
    // ✅ Using shared function from Collections
    async deleteInventoryMovementsBySource(sourceType, sourceId) {
        return await Collections.deleteInventoryMovementsBySource(sourceType, sourceId);
    },

    /**
     * Delete general entry by source ID
     */
    async deleteGeneralEntryBySourceId(sourceId) {
        try {
            const sourceIdStr = String(sourceId);
            
            // Try direct query first
            let snapshot;
            try {
                snapshot = await db.collection('generalEntries')
                    .where('sourceId', '==', sourceIdStr)
                    .where('type', '==', 'purchase_return')
                    .get();
            } catch (error) {
                console.warn('⚠️ Direct query failed, trying fallback:', error);
                // Fallback: fetch all and filter
                const allSnapshot = await db.collection('generalEntries').get();
                const allEntries = allSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const matchingEntries = allEntries.filter(e => 
                    String(e.sourceId) === sourceIdStr && e.type === 'purchase_return'
                );
                
                if (matchingEntries.length > 0) {
                    for (const entry of matchingEntries) {
                        await db.collection('generalEntries').doc(entry.id).delete();
                        console.log(`✅ Deleted general entry: ${entry.id}`);
                    }
                }
                return;
            }

            if (!snapshot.empty) {
                for (const doc of snapshot.docs) {
                    await db.collection('generalEntries').doc(doc.id).delete();
                    console.log(`✅ Deleted general entry: ${doc.id}`);
                }
            } else {
                console.warn(`⚠️ No general entry found for sourceId: ${sourceIdStr}`);
            }
        } catch (error) {
            console.error('❌ Error deleting general entry:', error);
            throw error;
        }
    },

    /**
     * Open return product picker (similar to purchases)
     */
    openReturnProductPicker(row) {
        if (!row) return;
        
        const productDisplayInput = row.querySelector('.return-product-display-input');
        const productHiddenInput = row.querySelector('.return-product-select-id');
        
        if (!productDisplayInput || !productHiddenInput) return;
        
        const allProducts = this.products || [];
        const currentProductId = productHiddenInput.value;
        
        // Filter active products that have a main unit (required)
        // Only show products with unitId to ensure they have a main unit
        const activeProducts = allProducts.filter(p => {
            return p.status !== 'inactive' && p.unitId; // Only show products with main unit
        });
        
        // Create product picker content
        const content = `
            <div style="text-align: start;">
                <div class="mb-3">
                    <div class="input-group input-group-lg">
                        <span class="input-group-text" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none;">
                            <i class="fas fa-search"></i>
                        </span>
                        <input type="text" id="returnProductPickerSearch" class="form-control form-control-lg" 
                               placeholder="ابحث عن المنتج بالاسم أو الكود..." 
                               autofocus
                               style="border-right: none; font-size: 1rem;">
                        <span class="input-group-text" style="background: #f8f9fa; border-left: none;">
                            <span class="badge bg-primary" id="returnProductPickerCount">${activeProducts.length}</span>
                        </span>
                    </div>
                </div>
                <div class="table-responsive" style="max-height: 450px; overflow-y: auto; border: 2px solid #d0d7e5; border-radius: 4px; background: #fff;">
                    <table class="table table-bordered mb-0">
                        <thead style="background: #f2f3f4; position: sticky; top: 0; z-index: 10;">
                            <tr>
                                <th width="5%">#</th>
                                <th width="25%">اسم المنتج</th>
                                <th width="15%">الكود</th>
                                <th width="20%">الفئة</th>
                                <th width="15%">الوحدة</th>
                                <th width="15%">السعر</th>
                                <th width="5%">الإجراء</th>
                            </tr>
                        </thead>
                        <tbody id="returnProductPickerList">
                            ${activeProducts.length > 0 ? activeProducts.map((product, index) => {
                                const category = this.categories.find(c => c.id === product.categoryId);
                                const unit = this.units.find(u => u.id === product.unitId);
                                const isSelected = product.id === currentProductId;
                                return `
                                    <tr class="return-product-pick-item" 
                                        data-id="${product.id}" 
                                        data-name="${product.name}"
                                        style="cursor: pointer; ${isSelected ? 'background-color: #316ac5 !important; color: white;' : ''}">
                                        <td>${index + 1}</td>
                                        <td>${this.escapeHtml(product.name)}</td>
                                        <td>${this.escapeHtml(product.code || '-')}</td>
                                        <td>${category ? this.escapeHtml(category.name) : '-'}</td>
                                        <td>${unit ? this.escapeHtml(unit.name) : '-'}</td>
                                        <td>${product.price ? formatNumber(product.price) : '0'}</td>
                                        <td>
                                            <button class="btn btn-sm btn-primary return-product-select-btn" data-product-id="${product.id}" data-product-name="${this.escapeHtml(product.name)}">
                                                <i class="fas fa-check"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('') : '<tr><td colspan="7" class="text-center text-muted">لا توجد منتجات</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        Swal.fire({
            title: 'اختيار منتج',
            html: content,
            width: 900,
            showCancelButton: true,
            confirmButtonText: 'اختيار',
            cancelButtonText: 'إلغاء',
            focusConfirm: false,
            didOpen: () => {
                const searchInput = document.getElementById('returnProductPickerSearch');
                const items = Array.from(document.querySelectorAll('.return-product-pick-item'));
                
                if (searchInput) {
                    searchInput.addEventListener('input', (e) => {
                        const q = e.target.value.toLowerCase();
                        items.forEach(item => {
                            const name = (item.dataset.name || '').toLowerCase();
                            const code = item.querySelector('td:nth-child(3)')?.textContent.toLowerCase() || '';
                            item.style.display = (name.includes(q) || code.includes(q)) ? '' : 'none';
                        });
                    });
                }
                
                // ✅ إضافة event listeners للصفوف والأزرار
                items.forEach(item => {
                    // النقر على الصف بالكامل
                    item.addEventListener('click', () => {
                        const productId = item.dataset.id;
                        const productName = item.dataset.name;
                        this.selectReturnProduct(row, productId, productName);
                        Swal.close();
                    });
                });
                
                // ✅ إضافة event listeners للأزرار (منع propagation)
                const selectButtons = Array.from(document.querySelectorAll('.return-product-select-btn'));
                selectButtons.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation(); // منع تفعيل event listener للصف
                        const productId = btn.dataset.productId;
                        const productName = btn.dataset.productName;
                        this.selectReturnProduct(row, productId, productName);
                        Swal.close();
                    });
                });
            }
        });
    },

    /**
     * Select return product
     */
    async selectReturnProduct(row, productId, productName) {
        const productDisplayInput = row.querySelector('.return-product-display-input');
        const productHiddenInput = row.querySelector('.return-product-select-id');
        
        if (productDisplayInput) productDisplayInput.value = productName;
        if (productHiddenInput) productHiddenInput.value = productId;
        
        // Get product data
        const product = await Collections.getProduct(productId);
        if (product) {
            // Set default price
            const priceInput = row.querySelector('.return-price-input');
            if (priceInput) {
                priceInput.value = product.purchasePrice || 0;
            }
            
            // Initialize unit picker
            await this.handleReturnProductSelection(row, product);
        }
        
        this.calculateReturnItemTotal(row);
        this.calculateReturnTotals();
        
        // Update available quantities button visibility
        this.updateAvailableQuantitiesButton(row);
    },

    /**
     * Handle return product selection
     */
    async handleReturnProductSelection(row, product) {
        try {
            const fullProduct = await Collections.getProduct(product.id);
            if (!fullProduct) return;

            // Validate that product has a main unit (required)
            if (!fullProduct.unitId) {
                showError(`المنتج "${fullProduct.name}" لا يحتوي على وحدة أساسية. يجب إضافة وحدة أساسية للمنتج قبل استخدامه في مرتجع المشتريات.`);
                
                // Clear product selection
                const productDisplayInput = row.querySelector('.return-product-display-input');
                const productHiddenInput = row.querySelector('.return-product-select-id');
                if (productDisplayInput) productDisplayInput.value = '';
                if (productHiddenInput) productHiddenInput.value = '';
                
                // Reset price
                const priceInput = row.querySelector('.return-price-input');
                if (priceInput) priceInput.value = 0;
                
                // Reset unit field
                const unitContainer = row.querySelector('.return-unit-autocomplete-container');
                const unitHiddenInput = row.querySelector('.return-unit-select-id');
                if (unitContainer) {
                    unitContainer.innerHTML = `
                        <span style="padding: 0 8px; min-height: 32px; display: flex; align-items: center; color: #6c757d; font-size: 0.875rem;">اختر المنتج أولاً</span>
                    `;
                }
                if (unitHiddenInput) unitHiddenInput.value = '';
                
                return;
            }

            // Verify main unit exists in units list
            const mainUnit = this.units.find(u => u.id === fullProduct.unitId);
            if (!mainUnit) {
                showError(`المنتج "${fullProduct.name}" يحتوي على وحدة أساسية غير موجودة في قائمة الوحدات.`);
                
                // Clear product selection
                const productDisplayInput = row.querySelector('.return-product-display-input');
                const productHiddenInput = row.querySelector('.return-product-select-id');
                if (productDisplayInput) productDisplayInput.value = '';
                if (productHiddenInput) productHiddenInput.value = '';
                
                // Reset price
                const priceInput = row.querySelector('.return-price-input');
                if (priceInput) priceInput.value = 0;
                
                // Reset unit field
                const unitContainer = row.querySelector('.return-unit-autocomplete-container');
                const unitHiddenInput = row.querySelector('.return-unit-select-id');
                if (unitContainer) {
                    unitContainer.innerHTML = `
                        <span style="padding: 0 8px; min-height: 32px; display: flex; align-items: center; color: #6c757d; font-size: 0.875rem;">اختر المنتج أولاً</span>
                    `;
                }
                if (unitHiddenInput) unitHiddenInput.value = '';
                
                return;
            }

            // Update expiry date and serial number fields visibility based on product properties
            this.updateExpirySerialFieldsVisibility(row, fullProduct);

            const availableUnits = [];
            const productCurrency = fullProduct.currency || 'IQD';

            // Add main unit (guaranteed to exist after validation above)
            availableUnits.push({
                unit: mainUnit,
                price: fullProduct.purchasePrice || 0,
                currency: productCurrency,
                conversion: 1,
                conversionType: 'multiply',
                isMain: true
            });

            // Add sub-units
            if (fullProduct.subUnits && fullProduct.subUnits.length > 0) {
                const mainUnitPrice = fullProduct.purchasePrice || 0;
                fullProduct.subUnits.forEach(subUnit => {
                    const unit = this.units.find(u => u.id === subUnit.unitId);
                    if (unit) {
                        const conversionType = subUnit.conversionType || 'multiply';
                        const conversionFactor = parseFloat(subUnit?.conversionValue || subUnit?.conversionFactor) || 1;
                        let subUnitPrice = subUnit.purchasePrice || 0;
                        
                        if (!subUnitPrice && mainUnitPrice > 0) {
                            if (conversionType === 'multiply') {
                                subUnitPrice = mainUnitPrice * conversionFactor;
                            } else if (conversionType === 'divide') {
                                subUnitPrice = mainUnitPrice / conversionFactor;
                            } else {
                                subUnitPrice = mainUnitPrice;
                            }
                        }
                        
                        availableUnits.push({
                            unit: unit,
                            price: subUnitPrice,
                            currency: productCurrency,
                            conversion: conversionFactor,
                            conversionType: conversionType,
                            isMain: false
                        });
                    }
                });
            }

            // Initialize unit picker
            const unitContainer = row.querySelector('.return-unit-autocomplete-container');
            const unitHiddenInput = row.querySelector('.return-unit-select-id');
            if (unitContainer && unitHiddenInput) {
                if (availableUnits.length > 0) {
                    unitContainer.innerHTML = `
                        <div class="input-group">
                            <input type="text" class="form-control form-control-sm return-unit-display-input" 
                                   placeholder="اختر الوحدة" 
                                   readonly 
                                   style="background-color: #f8f9fa; cursor: pointer;">
                            <button class="btn btn-outline-secondary btn-sm return-unit-picker-btn" type="button" title="اختر الوحدة">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    `;
                    
                    const unitDisplayInput = unitContainer.querySelector('.return-unit-display-input');
                    const unitPickerBtn = unitContainer.querySelector('.return-unit-picker-btn');
                    
                    row.dataset.availableUnits = JSON.stringify(availableUnits);
                    
                    if (unitDisplayInput) {
                        unitDisplayInput.addEventListener('click', () => {
                            this.openReturnUnitPicker(row, availableUnits, fullProduct);
                        });
                    }
                    if (unitPickerBtn) {
                        unitPickerBtn.addEventListener('click', () => {
                            this.openReturnUnitPicker(row, availableUnits, fullProduct);
                        });
                    }
                    
                    // Set default unit (main unit)
                    setTimeout(() => {
                        const mainUnitItem = availableUnits.find(u => u.isMain);
                        if (mainUnitItem && unitDisplayInput) {
                            unitDisplayInput.value = mainUnitItem.unit.name;
                            unitHiddenInput.value = mainUnitItem.unit.id;
                            // حفظ معامل التحويل للوحدة الأساسية (دائماً 1)
                            row.dataset.unitConversionFactor = '1';
                            row.dataset.unitConversionType = 'multiply';
                            const priceInput = row.querySelector('.return-price-input');
                            if (priceInput) {
                                priceInput.value = mainUnitItem.price || 0;
                            }
                            this.calculateReturnItemTotal(row);
                        }
                    }, 100);
                } else {
                    // This should never happen after validation, but handle it gracefully
                    showError('خطأ: المنتج لا يحتوي على وحدات متاحة');
                    console.error('Product has no units after validation:', fullProduct);
                    
                    // Clear product selection
                    const productDisplayInput = row.querySelector('.return-product-display-input');
                    const productHiddenInput = row.querySelector('.return-product-select-id');
                    if (productDisplayInput) productDisplayInput.value = '';
                    if (productHiddenInput) productHiddenInput.value = '';
                    
                    unitContainer.innerHTML = `
                        <span style="padding: 0 8px; min-height: 32px; display: flex; align-items: center; color: #6c757d; font-size: 0.875rem;">اختر المنتج أولاً</span>
                    `;
                    unitHiddenInput.value = '';
                }
            }

            // Load inventory details (expiry dates and serial numbers) if product has them
            await this.loadProductInventoryDetails(row);
            
            // Update available quantities button visibility
            this.updateAvailableQuantitiesButton(row);
        } catch (error) {
            console.error('Error handling return product selection:', error);
        }
    },

    /**
     * Update expiry date and serial number fields visibility based on product properties
     * التعامل مع الحالات الثلاث:
     * 1. لا يملك تاريخ صلاحية ولا رقم تسلسلي - إخفاء الحقول
     * 2. يملك تاريخ صلاحية ولا يملك رقم تسلسلي - إظهار تاريخ الصلاحية فقط
     * 3. لا يملك تاريخ صلاحية ويملك رقم تسلسلي - إظهار الرقم التسلسلي فقط
     */
    updateExpirySerialFieldsVisibility(row, product) {
        const hasExpiry = product.hasExpiryDate || false;
        const hasSerial = product.hasSerialNumber || false;
        
        const expiryDateCell = row.querySelector('.return-col-expiry')?.closest('td');
        const serialNumberCell = row.querySelector('.return-col-serial')?.closest('td');
        const expiryDateSelect = row.querySelector('.return-expiry-date-input');
        const serialNumberSelect = row.querySelector('.return-serial-number-input');
        
        // Get the header cells to hide/show them as well
        const expiryDateHeader = document.querySelector('thead .return-col-expiry')?.closest('th');
        const serialNumberHeader = document.querySelector('thead .return-col-serial')?.closest('th');
        
        if (hasExpiry) {
            // Show expiry date field
            if (expiryDateCell) expiryDateCell.style.display = '';
            if (expiryDateHeader) expiryDateHeader.style.display = '';
            if (expiryDateSelect) {
                expiryDateSelect.disabled = false;
                expiryDateSelect.style.backgroundColor = '#fff';
            }
        } else {
            // Hide expiry date field
            if (expiryDateCell) expiryDateCell.style.display = 'none';
            if (expiryDateHeader) expiryDateHeader.style.display = 'none';
            if (expiryDateSelect) {
                expiryDateSelect.value = '';
                expiryDateSelect.disabled = true;
                expiryDateSelect.style.backgroundColor = '#f8f9fa';
            }
        }
        
        if (hasSerial) {
            // Show serial number field
            if (serialNumberCell) serialNumberCell.style.display = '';
            if (serialNumberHeader) serialNumberHeader.style.display = '';
            if (serialNumberSelect) {
                serialNumberSelect.disabled = false;
                serialNumberSelect.style.backgroundColor = '#fff';
            }
        } else {
            // Hide serial number field
            if (serialNumberCell) serialNumberCell.style.display = 'none';
            if (serialNumberHeader) serialNumberHeader.style.display = 'none';
            if (serialNumberSelect) {
                serialNumberSelect.value = '';
                serialNumberSelect.disabled = true;
                serialNumberSelect.style.backgroundColor = '#f8f9fa';
            }
        }
        
        // Store product properties in row for later validation
        row.dataset.hasExpiry = hasExpiry;
        row.dataset.hasSerial = hasSerial;
        row.dataset.forceExpiry = product.forceExpiryOnInput || false;
        row.dataset.forceSerial = product.forceSerialOnInput || false;
    },

    /**
     * Open return unit picker
     */
    openReturnUnitPicker(row, availableUnits, product) {
        if (!row || !availableUnits || availableUnits.length === 0) return;
        
        const unitDisplayInput = row.querySelector('.return-unit-display-input');
        const unitHiddenInput = row.querySelector('.return-unit-select-id');
        const currentUnitId = unitHiddenInput?.value || '';
        
        // Create unit picker content
        const content = `
            <div style="text-align: start;">
                <div class="mb-3">
                    <div class="input-group input-group-lg">
                        <span class="input-group-text" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none;">
                            <i class="fas fa-search"></i>
                        </span>
                        <input type="text" id="returnUnitPickerSearch" class="form-control form-control-lg" 
                               placeholder="ابحث عن الوحدة..." 
                               autofocus
                               style="border-right: none; font-size: 1rem;">
                        <span class="input-group-text" style="background: #f8f9fa; border-left: none;">
                            <span class="badge bg-primary" id="returnUnitPickerCount">${availableUnits.length}</span>
                        </span>
                    </div>
                </div>
                <div class="table-responsive" style="max-height: 400px; overflow-y: auto; border: 2px solid #d0d7e5; border-radius: 4px; background: #fff;">
                    <table class="table table-bordered mb-0" id="returnUnitPickerTable" 
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
                        <tbody id="returnUnitPickerList" style="background-color: #fff;">
                            ${availableUnits.map((unitItem, index) => {
                                const isSelected = unitItem.unit.id === currentUnitId;
                                const rowId = `return-unit-row-${unitItem.unit.id}`;
                                let typeText = '';
                                if (unitItem.isMain) {
                                    typeText = 'الوحدة الأساسية';
                                } else {
                                    typeText = unitItem.conversionType === 'multiply' ? 'ضرب' : 'قسمة';
                                }
                                return `
                                    <tr class="return-unit-pick-item" 
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
                                            style="border: 1px solid #d0d7e5; padding: 6px 8px; color: ${isSelected ? 'white' : '#495057'}; font-size: 0.85rem;">
                                            ${this.escapeHtml(unitItem.unit.name)}${unitItem.isMain ? ' (الوحدة الأساسية)' : ''}
                                        </td>
                                        <td class="excel-cell" 
                                            data-row="${index}" 
                                            data-col="2"
                                            style="border: 1px solid #d0d7e5; padding: 6px 8px; color: ${isSelected ? 'white' : '#495057'}; font-size: 0.85rem;">
                                            ${typeText}
                                        </td>
                                        <td class="excel-cell" 
                                            data-row="${index}" 
                                            data-col="3"
                                            style="border: 1px solid #d0d7e5; padding: 6px 8px; color: ${isSelected ? 'white' : '#495057'}; font-size: 0.85rem;">
                                            ${unitItem.conversion || 1}
                                        </td>
                                        <td class="excel-cell" 
                                            data-row="${index}" 
                                            data-col="4"
                                            style="border: 1px solid #d0d7e5; padding: 6px 8px; text-align: center; color: ${isSelected ? 'white' : '#495057'}; font-size: 0.85rem; font-weight: 600;">
                                            ${formatNumber(unitItem.price || 0)}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        Swal.fire({
            title: 'اختيار الوحدة',
            html: content,
            width: 700,
            showCancelButton: true,
            confirmButtonText: 'إلغاء',
            cancelButtonText: 'إلغاء',
            focusConfirm: false,
            didOpen: () => {
                const searchInput = document.getElementById('returnUnitPickerSearch');
                const items = Array.from(document.querySelectorAll('.return-unit-pick-item'));
                
                if (searchInput) {
                    searchInput.addEventListener('input', (e) => {
                        const q = e.target.value.toLowerCase();
                        let visibleCount = 0;
                        items.forEach(item => {
                            const unitName = item.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
                            const isVisible = unitName.includes(q);
                            item.style.display = isVisible ? '' : 'none';
                            if (isVisible) visibleCount++;
                        });
                        const countBadge = document.getElementById('returnUnitPickerCount');
                        if (countBadge) countBadge.textContent = visibleCount;
                    });
                }
                
                items.forEach(item => {
                    item.addEventListener('click', () => {
                        const unitId = item.dataset.id;
                        const unitItemJson = item.dataset.unitItem;
                        if (unitItemJson) {
                            try {
                                const unitItem = JSON.parse(unitItemJson.replace(/&apos;/g, "'"));
                                this.selectReturnUnit(row, unitItem.unit.id, unitItem.unit.name, unitItem.price, unitItem.conversion || 1, unitItem.conversionType || 'multiply');
                            } catch (error) {
                                console.error('Error parsing unit item:', error);
                            }
                        }
                    });
                });
            }
        });
    },

    /**
     * Select return unit
     */
    selectReturnUnit(row, unitId, unitName, unitPrice, conversionFactor = 1, conversionType = 'multiply') {
        const unitDisplayInput = row.querySelector('.return-unit-display-input');
        const unitHiddenInput = row.querySelector('.return-unit-select-id');
        const priceInput = row.querySelector('.return-price-input');
        
        if (unitDisplayInput) unitDisplayInput.value = unitName;
        if (unitHiddenInput) unitHiddenInput.value = unitId;
        if (priceInput) priceInput.value = unitPrice || 0;
        
        // حفظ معامل التحويل في row.dataset للاستخدام لاحقاً
        row.dataset.unitConversionFactor = conversionFactor.toString();
        row.dataset.unitConversionType = conversionType;
        
        this.calculateReturnItemTotal(row);
        this.calculateReturnTotals();
        Swal.close();
        
        // Show available quantities button if product, unit, and warehouse are selected
        this.updateAvailableQuantitiesButton(row);
    },

    /**
     * Populate return form (for editing)
     */
    async populateReturnForm(returnData) {
        if (!returnData) return;

        // Populate header fields
        const invoiceNoInput = document.getElementById('returnInvoiceNo');
        if (invoiceNoInput) invoiceNoInput.value = returnData.invoiceNo || '';

        const dateInput = document.getElementById('returnDate');
        if (dateInput) {
            const returnDate = returnData.date?.toDate ? returnData.date.toDate() : new Date(returnData.date);
            dateInput.value = returnDate.toISOString().split('T')[0];
        }

        // Populate supplier
        if (returnData.supplierId) {
            const supplier = this.suppliers.find(s => s.id === returnData.supplierId);
            if (supplier) {
                const supplierDisplay = document.getElementById('returnSupplierDisplay');
                const supplierIdInput = document.getElementById('returnSupplierId');
                if (supplierDisplay) supplierDisplay.value = supplier.name;
                if (supplierIdInput) supplierIdInput.value = supplier.id;
            }
        }

        // Populate warehouse
        if (returnData.warehouseId) {
            const warehouse = this.warehouses.find(w => w.id === returnData.warehouseId);
            if (warehouse) {
                const warehouseDisplay = document.getElementById('returnWarehouseDisplay');
                const warehouseIdInput = document.getElementById('returnWarehouseId');
                if (warehouseDisplay) warehouseDisplay.value = warehouse.name;
                if (warehouseIdInput) warehouseIdInput.value = warehouse.id;
            }
        }

        // Populate cost center
        if (returnData.costCenterId) {
            const costCenter = this.costCenters.find(c => c.id === returnData.costCenterId);
            if (costCenter) {
                const costCenterDisplay = document.getElementById('returnCostCenterDisplay');
                const costCenterIdInput = document.getElementById('returnCostCenterId');
                if (costCenterDisplay) costCenterDisplay.value = costCenter.name;
                if (costCenterIdInput) costCenterIdInput.value = costCenter.id;
            }
        }

        // Populate currency and exchange rate
        const currencySelect = document.getElementById('returnCurrency');
        if (currencySelect) currencySelect.value = returnData.currency || 'IQD';

        const exchangeRateInput = document.getElementById('returnExchangeRate');
        if (exchangeRateInput) exchangeRateInput.value = returnData.exchangeRate || 1;

        // Populate payment method
        const paymentMethodSelect = document.getElementById('returnPaymentMethod');
        if (paymentMethodSelect) paymentMethodSelect.value = returnData.paymentMethod || 'cash';

        const paidAmountInput = document.getElementById('returnPaidAmount');
        if (paidAmountInput) paidAmountInput.value = returnData.paidAmount || 0;

        const dueDateInput = document.getElementById('returnDueDate');
        if (dueDateInput && returnData.dueDate) {
            const dueDate = returnData.dueDate?.toDate ? returnData.dueDate.toDate() : new Date(returnData.dueDate);
            dueDateInput.value = dueDate.toISOString().split('T')[0];
        }

        // Populate notes
        const notesInput = document.getElementById('returnNotes');
        if (notesInput) notesInput.value = returnData.notes || '';

        // Populate items
        const tbody = document.getElementById('returnItemsBody');
        if (tbody && returnData.items && returnData.items.length > 0) {
            tbody.innerHTML = '';
            // ✅ استخدام for...of بدلاً من forEach لدعم async/await
            for (const item of returnData.items) {
                this.addReturnItem();
                const lastRow = tbody.lastElementChild;
                if (lastRow) {
                    const productDisplayInput = lastRow.querySelector('.return-product-display-input');
                    const productHiddenInput = lastRow.querySelector('.return-product-select-id');
                    const quantityInput = lastRow.querySelector('.return-quantity-input');
                    const priceInput = lastRow.querySelector('.return-price-input');
                    const discountPercentInput = lastRow.querySelector('.return-discount-percent-input');
                    const discountAmountInput = lastRow.querySelector('.return-discount-amount-input');
                    const additionPercentInput = lastRow.querySelector('.return-addition-percent-input');
                    const additionAmountInput = lastRow.querySelector('.return-addition-amount-input');
                    const expiryDateInput = lastRow.querySelector('.return-expiry-date-input');
                    const serialNumberInput = lastRow.querySelector('.return-serial-number-input');
                    const notesInput = lastRow.querySelector('.return-notes-input');

                    if (productDisplayInput) productDisplayInput.value = item.productName || '';
                    if (productHiddenInput) productHiddenInput.value = item.productId || '';
                    if (quantityInput) quantityInput.value = item.quantity || 0;
                    if (priceInput) priceInput.value = item.unitPrice || 0;
                    if (discountPercentInput) discountPercentInput.value = item.discountPercent || 0;
                    if (discountAmountInput) discountAmountInput.value = item.discountAmount || 0;
                    if (additionPercentInput) additionPercentInput.value = item.additionPercent || 0;
                    if (additionAmountInput) additionAmountInput.value = item.additionAmount || 0;
                    // ✅ ملء تاريخ الصلاحية والرقم التسلسلي بعد تحميل تفاصيل المخزون
                    // يجب تحميل تفاصيل المخزون أولاً لملء القوائم، ثم تعيين القيم
                    if (item.productId) {
                        const product = this.products.find(p => p.id === item.productId);
                        if (product) {
                            // تحديث إظهار/إخفاء الحقول
                            this.updateExpirySerialFieldsVisibility(lastRow, product);
                            
                            // تحميل تفاصيل المخزون (للملء القوائم)
                            await this.loadProductInventoryDetails(lastRow);
                            
                            // ✅ بعد تحميل القوائم، تعيين القيم
                            if (expiryDateInput && item.expiryDate) {
                                // استخدام القيمة الأصلية (string) وليس تحويل التاريخ
                                expiryDateInput.value = item.expiryDate;
                                // ✅ إطلاق event change لتحميل الأرقام التسلسلية إذا لزم الأمر
                                expiryDateInput.dispatchEvent(new Event('change'));
                            }
                            
                            // ✅ انتظار قليلاً قبل تعيين الرقم التسلسلي (لإتاحة الوقت لتحميل القائمة)
                            if (serialNumberInput && item.serialNumber) {
                                setTimeout(() => {
                                    serialNumberInput.value = item.serialNumber || '';
                                }, 200);
                            }
                        }
                    } else {
                        // إذا لم يكن هناك منتج، تعيين القيم مباشرة (للحالات القديمة)
                        if (expiryDateInput && item.expiryDate) {
                            expiryDateInput.value = item.expiryDate;
                        }
                        if (serialNumberInput) {
                            serialNumberInput.value = item.serialNumber || '';
                        }
                    }
                    
                    if (notesInput) notesInput.value = item.notes || '';

                    // Set unit
                    if (item.unitId) {
                        const unit = this.units.find(u => u.id === item.unitId);
                        if (unit) {
                            const unitDisplayInput = lastRow.querySelector('.return-unit-display-input');
                            const unitHiddenInput = lastRow.querySelector('.return-unit-select-id');
                            if (unitDisplayInput) unitDisplayInput.value = unit.name;
                            if (unitHiddenInput) unitHiddenInput.value = unit.id;
                        }
                    }

                    this.calculateReturnItemTotal(lastRow);
                }
            }
        }

        // Populate discounts and additions
        const discountsAdditionsBody = document.getElementById('returnDiscountsAdditionsBody');
        if (discountsAdditionsBody && returnData.discountAdditionRows && returnData.discountAdditionRows.length > 0) {
            discountsAdditionsBody.innerHTML = '';
            returnData.discountAdditionRows.forEach(row => {
                if (row.type === 'discount') {
                    this.addReturnDiscount();
                } else if (row.type === 'addition') {
                    this.addReturnAddition();
                }
                const lastRow = discountsAdditionsBody.lastElementChild;
                if (lastRow) {
                    const typeSelect = lastRow.querySelector('.return-type-select');
                    const accountSelect = lastRow.querySelector('.return-account-select');
                    const accountNameDisplay = lastRow.querySelector('.return-account-name-display');
                    const counterAccountSelect = lastRow.querySelector('.return-counter-account-select');
                    const counterAccountNameDisplay = lastRow.querySelector('.return-counter-account-name-display');
                    const amountInput = lastRow.querySelector('.return-amount-input');
                    const currencySelect = lastRow.querySelector('.return-currency-select');
                    const notesInput = lastRow.querySelector('.return-notes-input');

                    if (typeSelect) typeSelect.value = row.type;
                    if (accountSelect) accountSelect.value = row.accountId || '';
                    if (accountNameDisplay) accountNameDisplay.value = row.accountName || '';
                    if (counterAccountSelect) counterAccountSelect.value = row.counterAccountId || '';
                    if (counterAccountNameDisplay) counterAccountNameDisplay.value = row.counterAccountName || '';
                    if (amountInput) amountInput.value = row.amount || 0;
                    if (currencySelect) currencySelect.value = row.currency || 'IQD';
                    if (notesInput) notesInput.value = row.notes || '';
                }
            });
        }

        // Recalculate totals
        this.calculateReturnTotals();
        this.updateReturnPaymentFields();
    },

    /**
     * Add return discount row
     */
    addReturnDiscount() {
        const tbody = document.getElementById('returnDiscountsAdditionsBody');
        if (!tbody) return;

        const rowIndex = tbody.children.length + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rowIndex}</td>
            <td>
                <select class="form-select form-select-sm return-type-select">
                    <option value="discount" selected>خصم</option>
                    <option value="addition">إضافة</option>
                </select>
            </td>
            <td>
                <div class="input-group">
                    <input type="text" class="form-control form-control-sm return-account-name-display" placeholder="اسم الحساب" readonly style="background-color: #f8f9fa;">
                    <input type="hidden" class="return-account-select" value="">
                    <button type="button" class="btn btn-outline-secondary btn-sm return-open-account-picker" title="اختر الحساب">
                        <i class="fas fa-sitemap"></i>
                    </button>
                </div>
            </td>
            <td>
                <div class="input-group">
                    <input type="text" class="form-control form-control-sm return-counter-account-name-display" placeholder="الحساب المقابل" readonly style="background-color: #f8f9fa;">
                    <input type="hidden" class="return-counter-account-select" value="">
                    <button type="button" class="btn btn-outline-secondary btn-sm return-open-counter-account-picker" title="اختر الحساب المقابل">
                        <i class="fas fa-sitemap"></i>
                    </button>
                </div>
            </td>
            <td>
                <input type="number" class="form-control form-control-sm return-amount-input" min="0" step="0.01" value="0">
            </td>
            <td>
                <select class="form-select form-select-sm return-currency-select">
                    ${this.currencies.map(c => `<option value="${c.code}">${c.code}</option>`).join('')}
                </select>
            </td>
            <td>
                <input type="text" class="form-control form-control-sm return-notes-input" placeholder="ملاحظات">
            </td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-danger return-remove-discount-addition" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);

        // Setup listeners
        const removeBtn = row.querySelector('.return-remove-discount-addition');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                row.remove();
                this.calculateReturnTotals();
            });
        }

        const accountPickerBtn = row.querySelector('.return-open-account-picker');
        if (accountPickerBtn) {
            accountPickerBtn.addEventListener('click', () => {
                this.openAccountPickerForReturnRow(row, row.querySelector('.return-account-select'), row.querySelector('.return-account-name-display'));
            });
        }

        const counterAccountPickerBtn = row.querySelector('.return-open-counter-account-picker');
        if (counterAccountPickerBtn) {
            counterAccountPickerBtn.addEventListener('click', () => {
                this.openAccountPickerForReturnRow(row, row.querySelector('.return-counter-account-select'), row.querySelector('.return-counter-account-name-display'));
            });
        }

        const amountInput = row.querySelector('.return-amount-input');
        if (amountInput) {
            amountInput.addEventListener('input', () => {
                this.calculateReturnTotals();
            });
        }

        this.calculateReturnTotals();
    },

    /**
     * Add return addition row
     */
    addReturnAddition() {
        const tbody = document.getElementById('returnDiscountsAdditionsBody');
        if (!tbody) return;

        const rowIndex = tbody.children.length + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rowIndex}</td>
            <td>
                <select class="form-select form-select-sm return-type-select">
                    <option value="discount">خصم</option>
                    <option value="addition" selected>إضافة</option>
                </select>
            </td>
            <td>
                <div class="input-group">
                    <input type="text" class="form-control form-control-sm return-account-name-display" placeholder="اسم الحساب" readonly style="background-color: #f8f9fa;">
                    <input type="hidden" class="return-account-select" value="">
                    <button type="button" class="btn btn-outline-secondary btn-sm return-open-account-picker" title="اختر الحساب">
                        <i class="fas fa-sitemap"></i>
                    </button>
                </div>
            </td>
            <td>
                <div class="input-group">
                    <input type="text" class="form-control form-control-sm return-counter-account-name-display" placeholder="الحساب المقابل" readonly style="background-color: #f8f9fa;">
                    <input type="hidden" class="return-counter-account-select" value="">
                    <button type="button" class="btn btn-outline-secondary btn-sm return-open-counter-account-picker" title="اختر الحساب المقابل">
                        <i class="fas fa-sitemap"></i>
                    </button>
                </div>
            </td>
            <td>
                <input type="number" class="form-control form-control-sm return-amount-input" min="0" step="0.01" value="0">
            </td>
            <td>
                <select class="form-select form-select-sm return-currency-select">
                    ${this.currencies.map(c => `<option value="${c.code}">${c.code}</option>`).join('')}
                </select>
            </td>
            <td>
                <input type="text" class="form-control form-control-sm return-notes-input" placeholder="ملاحظات">
            </td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-danger return-remove-discount-addition" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);

        // Setup listeners (same as discount)
        const removeBtn = row.querySelector('.return-remove-discount-addition');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                row.remove();
                this.calculateReturnTotals();
            });
        }

        const accountPickerBtn = row.querySelector('.return-open-account-picker');
        if (accountPickerBtn) {
            accountPickerBtn.addEventListener('click', () => {
                this.openAccountPickerForReturnRow(row, row.querySelector('.return-account-select'), row.querySelector('.return-account-name-display'));
            });
        }

        const counterAccountPickerBtn = row.querySelector('.return-open-counter-account-picker');
        if (counterAccountPickerBtn) {
            counterAccountPickerBtn.addEventListener('click', () => {
                this.openAccountPickerForReturnRow(row, row.querySelector('.return-counter-account-select'), row.querySelector('.return-counter-account-name-display'));
            });
        }

        const amountInput = row.querySelector('.return-amount-input');
        if (amountInput) {
            amountInput.addEventListener('input', () => {
                this.calculateReturnTotals();
            });
        }

        this.calculateReturnTotals();
    },

    /**
     * Open account picker for return discount/addition row
     */
    openAccountPickerForReturnRow(row, accountSelect, accountNameDisplay) {
        const allAccounts = this.accounts || [];
        const leafAccounts = ChartOfAccountsModule.getLeafAccounts();

        // If the currently selected account is not a leaf, include it for display
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
                        <input type="text" id="returnAccountPickerSearch" class="form-control" placeholder="ابحث في الحسابات النهائية...">
                    </div>
                </div>
                <div class="list-group" id="returnAccountPickerList" style="max-height: 360px; overflow:auto;">
                    ${leafAccounts.length > 0 ? leafAccounts.map(acc => `
                        <button type="button" class="list-group-item list-group-item-action return-account-pick-item" data-id="${acc.id}" data-name="${acc.name}">
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
                const searchInput = document.getElementById('returnAccountPickerSearch');
                const items = Array.from(document.querySelectorAll('.return-account-pick-item'));
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
                if (searchInput) searchInput.addEventListener('input', filter);
                
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
     * Update inventory for return (subtracts stock)
     */
    async updateInventory(returnData) {
        try {
            console.log('📦 Updating inventory for return:', returnData.invoiceNo);
            
            if (!returnData.items || returnData.items.length === 0) {
                console.warn('⚠️ No items to update inventory');
                return;
            }

            const settings = await this.getSettings();
            if (!settings.autoUpdateStock) {
                console.log('⚠️ Auto update stock is disabled in settings');
                return;
            }

            const warehouseId = returnData.warehouseId || 'default';

            for (const item of returnData.items) {
                const product = await Collections.getProduct(item.productId);
                if (!product) {
                    console.warn(`⚠️ Product not found: ${item.productId}`);
                    continue;
                }

                // Convert quantity to main unit using helper function
                const quantityInMainUnit = InvoiceUtils.convertToMainUnit(item.quantity, item.unitId, product);
                
                if (item.unitId && item.unitId !== product.unitId) {
                    console.log(`🔄 Unit conversion: ${item.quantity} ${item.unitId} = ${quantityInMainUnit} ${product.unitId}`);
                }

                // التحقق من تاريخ الصلاحية والرقم التسلسلي إذا كان المنتج يحتاجهما
                const hasExpiry = product.hasExpiryDate || false;
                const hasSerial = product.hasSerialNumber || false;
                
                // Get current stock before update
                const currentStock = await Collections.getProductWarehouseStock(item.productId);
                const stockInWarehouse = currentStock?.[warehouseId] || 0;
                const previousQuantity = stockInWarehouse;
                const newQuantity = previousQuantity - quantityInMainUnit;
                
                // ⚠️ التحقق من وجود مخزون كافٍ قبل التقليل
                if (stockInWarehouse < quantityInMainUnit) {
                    const errorMsg = `⚠️ لا يمكن إرجاع الكمية: الرصيد الحالي (${stockInWarehouse}) أقل من الكمية المراد إرجاعها (${quantityInMainUnit}) للمنتج ${product.name || item.productName || item.productId}`;
                    console.error(errorMsg);
                    throw new Error(errorMsg);
                }
                
                // تحديث المخزون حسب الحالة
                if (hasExpiry || hasSerial) {
                    // إذا كان المنتج يحتوي على تاريخ صلاحية أو رقم تسلسلي،
                    // نقوم بتحديث المخزون العام أولاً
                    await Collections.updateProductWarehouseStock(
                        item.productId,
                        warehouseId,
                        quantityInMainUnit,
                        'subtract' // تقليل المخزون (للإرجاع)
                    );
                    
                    // ✅ إعادة حساب المخزون من inventoryMovements لضمان الدقة
                    // هذا مهم للمنتجات التي لها تاريخ صلاحية أو رقم تسلسلي
                    // لأن المخزون التفصيلي يتم تتبعه في inventoryMovements
                    await Collections.recalculateProductWarehouseStock(item.productId);
                    
                    console.log(`📉 Subtracted ${quantityInMainUnit} ${product.unitId || ''} from ${item.productName} in warehouse ${warehouseId} (with expiry/serial tracking)`);
                } else {
                    // المنتج لا يحتوي على تاريخ صلاحية أو رقم تسلسلي
                    // تحديث المخزون مباشرة
                    await Collections.updateProductWarehouseStock(
                        item.productId,
                        warehouseId,
                        quantityInMainUnit,
                        'subtract' // تقليل المخزون (للإرجاع)
                    );
                    
                    console.log(`📉 Subtracted ${quantityInMainUnit} ${product.unitId || ''} from ${item.productName} in warehouse ${warehouseId}`);
                }
                
                // Record inventory movement
                const warehouse = await Collections.getWarehouse(warehouseId);
                const warehouseName = warehouse ? warehouse.name : 'المستودع الافتراضي';
                
                const movementRecord = {
                    type: 'out',
                    productId: item.productId,
                    productName: item.productName || product.name,
                    warehouseId: warehouseId,
                    warehouseName: warehouseName,
                    fromWarehouseId: null,
                    fromWarehouseName: null,
                    toWarehouseId: null,
                    toWarehouseName: null,
                    unitId: item.unitId || product.unitId,
                    quantity: quantityInMainUnit, // ✅ قيمة موجبة دائماً (type يحدد الاتجاه)
                    quantityInMainUnit: quantityInMainUnit,
                    expiryDate: item.expiryDate || null,
                    serialNumber: item.serialNumber || null,
                    unitPrice: item.unitPrice || 0,
                    totalCost: (item.unitPrice || 0) * quantityInMainUnit,
                    previousQuantity: previousQuantity,
                    newQuantity: newQuantity,
                    reference: returnData.invoiceNo || `مرتجع شراء ${returnData.id || ''}`,
                    notes: `مرتجع شراء - ${returnData.supplierName || ''}`,
                    date: returnData.date ? new Date(returnData.date) : new Date(),
                    userId: auth.currentUser?.uid || 'system',
                    createdAt: new Date(),
                    sourceType: 'purchase_return',
                    sourceId: returnData.id || null
                };
                
                // ✅ Validate movement before saving
                if (typeof InventoryMovementValidator !== 'undefined' && InventoryMovementValidator) {
                    const validation = InventoryMovementValidator.validateMovement(movementRecord, product);
                    if (!validation.isValid) {
                        const errorMsg = `خطأ في حركة المخزون: ${validation.errors.join(', ')}`;
                        console.error('❌', errorMsg);
                        throw new Error(errorMsg);
                    }
                    if (validation.warnings.length > 0) {
                        console.warn('⚠️ تحذيرات في حركة المخزون:', validation.warnings);
                    }
                }
                
                await db.collection('inventoryMovements').add(movementRecord);
                console.log(`📝 Inventory movement recorded for purchase return: ${item.productName || product.name}`);
            }

            console.log('✅ Inventory updated successfully for return');
        } catch (error) {
            console.error('❌ Error updating inventory for return:', error);
            throw error;
        }
    },

    /**
     * Generate general entry for return (supplier is debited, purchases/inventory is credited)
     */
    async generateGeneralEntry(returnData) {
        try {
            const settings = await this.getSettings();
            if (!settings.autoGenerateGeneralEntry) {
                console.log('⚠️ Auto generate general entry is disabled');
                return null;
            }

            const generateEntry = document.getElementById('generateReturnGeneralEntry')?.checked;
            if (!generateEntry) {
                console.log('⚠️ Generate general entry checkbox is unchecked');
                return null;
            }

            const entryData = {
                type: 'purchase_return',
                sourceId: String(returnData.id),
                description: document.getElementById('returnGeneralEntryDescription')?.value || `مرتجع شراء رقم ${returnData.invoiceNo}`,
                reference: returnData.invoiceNo || '',
                date: returnData.date || new Date(),
                entries: [],
                createdAt: new Date(),
                createdBy: auth.currentUser?.uid || 'system'
            };

            const invoiceCurrency = returnData.currency || 'IQD';
            const invoiceExchangeRate = returnData.exchangeRate || 1;
            const paymentMethod = returnData.paymentMethod || 'cash';
            const supplierId = returnData.supplierId;

            // Get supplier account
            let supplierAccountId = null;
            if (supplierId) {
                const supplier = this.suppliers.find(s => s.id === supplierId);
                if (supplier && supplier.subAccountId) {
                    supplierAccountId = supplier.subAccountId;
                }
            }

            // Helper function to convert to base currency
            const convertToBaseCurrency = (amount, currency, exchangeRate) => {
                if (currency === 'IQD' || !exchangeRate || exchangeRate === 1) {
                    return amount;
                }
                return amount / exchangeRate;
            };

            // Helper function to add account info
            const addAccountInfo = (entry, accountId) => {
                const account = this.accounts.find(a => a.id === accountId);
                return {
                    ...entry,
                    accountName: account ? account.name : `حساب غير موجود (${accountId})`,
                    accountCode: account ? account.code : ''
                };
            };

            // For purchase returns:
            // - Supplier is DEBITED (عكس المشتريات - المورد مدين) - في حالة الدفع الآجل
            // - Purchases/Inventory is CREDITED (عكس المشتريات - المشتريات/المخزون دائن)
            // - Cash is DEBITED (في حالة الدفع النقدي - نسترد النقد)

            // Main entry: Debit Supplier (if credit) or Cash (if cash), Credit Purchases/Inventory
            const totalInBaseCurrency = convertToBaseCurrency(returnData.total || 0, invoiceCurrency, invoiceExchangeRate);

            // Get purchase account (for credit side)
            const purchaseAccountId = settings.defaultCounterAccountId || null;

            if (paymentMethod === 'credit') {
                // ✅ الدفع الآجل: مدين المورد، دائن المشتريات
                // Debit: Supplier account
                if (supplierAccountId) {
                    const supplierEntry = {
                        accountId: supplierAccountId,
                        debit: totalInBaseCurrency,
                        credit: 0,
                        originalAmount: returnData.total || 0,
                        originalCurrency: invoiceCurrency,
                        description: `مرتجع شراء رقم ${returnData.invoiceNo} - ${returnData.supplierName || 'مورد'}`
                    };
                    entryData.entries.push(addAccountInfo(supplierEntry, supplierAccountId));
                }

                // Credit: Purchases/Inventory account
                if (purchaseAccountId) {
                    const purchaseEntry = {
                        accountId: purchaseAccountId,
                        debit: 0,
                        credit: totalInBaseCurrency,
                        originalAmount: returnData.total || 0,
                        originalCurrency: invoiceCurrency,
                        description: `مرتجع شراء رقم ${returnData.invoiceNo}`
                    };
                    entryData.entries.push(addAccountInfo(purchaseEntry, purchaseAccountId));
                }
            } else if (paymentMethod === 'cash') {
                // ✅ الدفع النقدي: مدين النقدية (نسترد النقد)، دائن المشتريات (نقلل المشتريات)
                // Debit: Cash account (نسترد النقد)
                const cashAccountId = settings.defaultCreditAccount || settings.defaultCreditAccountId || null;
                if (cashAccountId) {
                    const cashEntry = {
                        accountId: cashAccountId,
                        debit: totalInBaseCurrency, // ✅ مدين (نسترد النقد)
                        credit: 0,
                        originalAmount: returnData.total || 0,
                        originalCurrency: invoiceCurrency,
                        description: `مرتجع شراء رقم ${returnData.invoiceNo} - نقدي`
                    };
                    entryData.entries.push(addAccountInfo(cashEntry, cashAccountId));
                }

                // Credit: Purchases/Inventory account (نقلل المشتريات)
                if (purchaseAccountId) {
                    const purchaseEntry = {
                        accountId: purchaseAccountId,
                        debit: 0,
                        credit: totalInBaseCurrency,
                        originalAmount: returnData.total || 0,
                        originalCurrency: invoiceCurrency,
                        description: `مرتجع شراء رقم ${returnData.invoiceNo}`
                    };
                    entryData.entries.push(addAccountInfo(purchaseEntry, purchaseAccountId));
                } else {
                    // ⚠️ إذا لم يكن هناك حساب مشتريات، نستخدم حساب النقدية كدائن (fallback)
                    // لكن هذا غير مثالي - يجب إعداد حساب المشتريات
                    console.warn('⚠️ حساب المشتريات غير موجود، سيتم استخدام حساب النقدية كدائن (fallback)');
                    const cashAccountId = settings.defaultCreditAccount || settings.defaultCreditAccountId || null;
                    if (cashAccountId) {
                        const cashCreditEntry = {
                            accountId: cashAccountId,
                            debit: 0,
                            credit: totalInBaseCurrency,
                            originalAmount: returnData.total || 0,
                            originalCurrency: invoiceCurrency,
                            description: `مرتجع شراء رقم ${returnData.invoiceNo} - نقدي (fallback)`
                        };
                        entryData.entries.push(addAccountInfo(cashCreditEntry, cashAccountId));
                    }
                }
            }

            // Handle discounts and additions (similar to purchases but reversed)
            if (returnData.discountAdditionRows && returnData.discountAdditionRows.length > 0) {
                for (const row of returnData.discountAdditionRows) {
                    const rowCurrency = row.currency || invoiceCurrency;
                    const rowExchangeRate = row.exchangeRate || invoiceExchangeRate;
                    const amountInBaseCurrency = convertToBaseCurrency(row.amount, rowCurrency, rowExchangeRate);

                    if (row.type === 'discount' && row.amount > 0) {
                        // Discount: Credit discount account, Debit counter account
                        if (row.accountId) {
                            const discountEntry = {
                                accountId: row.accountId,
                                debit: 0,
                                credit: amountInBaseCurrency,
                                originalAmount: row.amount,
                                originalCurrency: rowCurrency,
                                description: `خصم - ${row.notes || `مرتجع شراء رقم ${returnData.invoiceNo}`}`
                            };
                            entryData.entries.push(addAccountInfo(discountEntry, row.accountId));
                        }

                        const discountCounterAccountId = row.counterAccountId || supplierAccountId || settings.defaultReturnDiscountCounterAccount || null;
                        if (discountCounterAccountId) {
                            const discountCounterEntry = {
                                accountId: discountCounterAccountId,
                                debit: amountInBaseCurrency,
                                credit: 0,
                                originalAmount: row.amount,
                                originalCurrency: rowCurrency,
                                description: `خصم - ${row.notes || `مرتجع شراء رقم ${returnData.invoiceNo}`}`
                            };
                            entryData.entries.push(addAccountInfo(discountCounterEntry, discountCounterAccountId));
                        }
                    } else if (row.type === 'addition' && row.amount > 0) {
                        // Addition: Debit addition account, Credit counter account
                        if (row.accountId) {
                            const additionEntry = {
                                accountId: row.accountId,
                                debit: amountInBaseCurrency,
                                credit: 0,
                                originalAmount: row.amount,
                                originalCurrency: rowCurrency,
                                description: `إضافة - ${row.notes || `مرتجع شراء رقم ${returnData.invoiceNo}`}`
                            };
                            entryData.entries.push(addAccountInfo(additionEntry, row.accountId));
                        }

                        const additionCounterAccountId = row.counterAccountId || supplierAccountId || settings.defaultReturnAdditionCounterAccount || null;
                        if (additionCounterAccountId) {
                            const additionCounterEntry = {
                                accountId: additionCounterAccountId,
                                debit: 0,
                                credit: amountInBaseCurrency,
                                originalAmount: row.amount,
                                originalCurrency: rowCurrency,
                                description: `إضافة - ${row.notes || `مرتجع شراء رقم ${returnData.invoiceNo}`}`
                            };
                            entryData.entries.push(addAccountInfo(additionCounterEntry, additionCounterAccountId));
                        }
                    }
                }
            }

            // Validate entry balance
            if (!entryData.entries || entryData.entries.length === 0) {
                console.error('❌ No entries in general entry!');
                throw new Error('القيد العام فارغ');
            }

            const totalDebit = entryData.entries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
            const totalCredit = entryData.entries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);
            const balanceDifference = Math.abs(totalDebit - totalCredit);

            if (balanceDifference > 0.01) {
                console.error('❌ General entry not balanced!', {
                    totalDebit: totalDebit.toFixed(2),
                    totalCredit: totalCredit.toFixed(2),
                    difference: balanceDifference.toFixed(2)
                });
                throw new Error(`القيد العام غير متوازن! المدين: ${totalDebit.toFixed(2)}, الدائن: ${totalCredit.toFixed(2)}`);
            }

            entryData.totalDebit = totalDebit;
            entryData.totalCredit = totalCredit;
            entryData.isBalanced = true;

            // Save general entry
            const generalEntryResult = await Collections.addGeneralEntry(entryData);
            const generalEntryId = generalEntryResult?.id || generalEntryResult;

            console.log('✅ General entry generated successfully for return', {
                id: generalEntryId,
                totalDebit: totalDebit.toFixed(2),
                totalCredit: totalCredit.toFixed(2),
                entriesCount: entryData.entries.length
            });

            return generalEntryId;

        } catch (error) {
            console.error('❌ Error generating general entry for return:', error);
            return null;
        }
    },

    /**
     * Print return invoice
     */
    async printReturnInvoice(returnData) {
        try {
            const settings = await this.getSettings();
            const printFields = settings.printFields || {};

            // Get supplier info
            const supplier = this.suppliers.find(s => s.id === returnData.supplierId);

            // Build invoice HTML
            let invoiceHTML = `
                <!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head>
                    <meta charset="UTF-8">
                    <title>فاتورة مرتجع شراء - ${returnData.invoiceNo}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .invoice-header { text-align: center; margin-bottom: 30px; }
                        .invoice-info { margin-bottom: 20px; }
                        .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                        .invoice-table th { background-color: #f2f2f2; }
                        .invoice-totals { text-align: left; margin-top: 20px; }
                        .invoice-footer { margin-top: 30px; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="invoice-header">
                        <h1>فاتورة مرتجع شراء</h1>
                        ${printFields.invoiceNo ? `<h2>رقم الفاتورة: ${returnData.invoiceNo || 'N/A'}</h2>` : ''}
                    </div>
                    
                    <div class="invoice-info">
                        ${printFields.date ? `<p><strong>التاريخ:</strong> ${formatDate(returnData.date)}</p>` : ''}
                        ${printFields.supplierName && supplier ? `<p><strong>المورد:</strong> ${supplier.name}</p>` : ''}
                        ${printFields.supplierPhone && supplier ? `<p><strong>الهاتف:</strong> ${supplier.phone || 'N/A'}</p>` : ''}
                        ${printFields.supplierAddress && supplier ? `<p><strong>العنوان:</strong> ${supplier.address || 'N/A'}</p>` : ''}
                        ${printFields.warehouse ? `<p><strong>المستودع:</strong> ${this.warehouses.find(w => w.id === returnData.warehouseId)?.name || 'N/A'}</p>` : ''}
                        ${printFields.paymentMethod ? `<p><strong>طريقة الدفع:</strong> ${returnData.paymentMethod === 'cash' ? 'نقدي' : 'آجل'}</p>` : ''}
                    </div>
                    
                    <table class="invoice-table">
                        <thead>
                            <tr>
                                ${printFields.productName ? '<th>اسم المنتج</th>' : ''}
                                ${printFields.productQuantity ? '<th>الكمية</th>' : ''}
                                ${printFields.productUnit ? '<th>الوحدة</th>' : ''}
                                ${printFields.productUnitPrice ? '<th>سعر الوحدة</th>' : ''}
                                ${printFields.productTotal ? '<th>الإجمالي</th>' : ''}
                                ${printFields.productDiscount ? '<th>الخصم</th>' : ''}
                                ${printFields.productAddition ? '<th>الإضافة</th>' : ''}
                                ${printFields.productExpiryDate ? '<th>تاريخ الصلاحية</th>' : ''}
                                ${printFields.productSerialNumber ? '<th>الرقم التسلسلي</th>' : ''}
                                ${printFields.productNotes ? '<th>ملاحظات</th>' : ''}
                            </tr>
                        </thead>
                        <tbody>
            `;

            // Add items
            if (returnData.items && returnData.items.length > 0) {
                returnData.items.forEach(item => {
                    invoiceHTML += '<tr>';
                    if (printFields.productName) invoiceHTML += `<td>${item.productName || 'N/A'}</td>`;
                    if (printFields.productQuantity) invoiceHTML += `<td>${formatNumber(item.quantity || 0)}</td>`;
                    if (printFields.productUnit) {
                        const unit = this.units.find(u => u.id === item.unitId);
                        invoiceHTML += `<td>${unit ? unit.name : 'N/A'}</td>`;
                    }
                    if (printFields.productUnitPrice) invoiceHTML += `<td>${formatNumber(item.unitPrice || 0)}</td>`;
                    if (printFields.productTotal) invoiceHTML += `<td>${formatNumber(item.total || 0)}</td>`;
                    if (printFields.productDiscount) invoiceHTML += `<td>${formatNumber(item.discountAmount || 0)}</td>`;
                    if (printFields.productAddition) invoiceHTML += `<td>${formatNumber(item.additionAmount || 0)}</td>`;
                    if (printFields.productExpiryDate) invoiceHTML += `<td>${item.expiryDate ? formatDate(new Date(item.expiryDate)) : 'N/A'}</td>`;
                    if (printFields.productSerialNumber) invoiceHTML += `<td>${item.serialNumber || 'N/A'}</td>`;
                    if (printFields.productNotes) invoiceHTML += `<td>${item.notes || 'N/A'}</td>`;
                    invoiceHTML += '</tr>';
                });
            }

            invoiceHTML += `
                        </tbody>
                    </table>
                    
                    <div class="invoice-totals">
                        ${printFields.subtotal ? `<p><strong>المجموع الفرعي:</strong> ${formatNumber(returnData.subtotal || 0)} ${returnData.currency || 'IQD'}</p>` : ''}
                        ${printFields.discount ? `<p><strong>إجمالي الخصومات:</strong> ${formatNumber(returnData.totalDiscounts || 0)} ${returnData.currency || 'IQD'}</p>` : ''}
                        ${printFields.addition ? `<p><strong>إجمالي الإضافات:</strong> ${formatNumber(returnData.totalAdditions || 0)} ${returnData.currency || 'IQD'}</p>` : ''}
                        ${printFields.total ? `<p><strong>المجموع الإجمالي:</strong> ${formatNumber(returnData.total || 0)} ${returnData.currency || 'IQD'}</p>` : ''}
                        ${printFields.paid ? `<p><strong>المدفوع:</strong> ${formatNumber(returnData.paidAmount || 0)} ${returnData.currency || 'IQD'}</p>` : ''}
                        ${printFields.remaining ? `<p><strong>المتبقي:</strong> ${formatNumber(returnData.remainingAmount || 0)} ${returnData.currency || 'IQD'}</p>` : ''}
                        ${printFields.notes && returnData.notes ? `<p><strong>ملاحظات:</strong> ${returnData.notes}</p>` : ''}
                    </div>
                    
                    <div class="invoice-footer">
                        <p>شكراً لاستخدامكم نظام إدارة المخزون والمحاسبة</p>
                    </div>
                </body>
                </html>
            `;

            // Open print window
            const printWindow = window.open('', '_blank');
            printWindow.document.write(invoiceHTML);
            printWindow.document.close();
            
            // Wait for content to load, then print
            printWindow.onload = () => {
                setTimeout(() => {
                    printWindow.print();
                }, 250);
            };

        } catch (error) {
            console.error('❌ Error printing return invoice:', error);
            showError('فشل في طباعة الفاتورة: ' + (error.message || 'خطأ غير معروف'));
        }
    },

    /**
     * Update available quantities button visibility
     */
    updateAvailableQuantitiesButton(row) {
        const availableQtyBtn = row?.querySelector('.return-show-available-qty-btn');
        if (!availableQtyBtn) return;

        const productId = row.querySelector('.return-product-select-id')?.value;
        const unitId = row.querySelector('.return-unit-select-id')?.value;
        const warehouseId = document.getElementById('returnWarehouseId')?.value;

        // Show button only if product, unit, and warehouse are selected
        if (productId && unitId && warehouseId) {
            availableQtyBtn.style.display = 'inline-block';
        } else {
            availableQtyBtn.style.display = 'none';
        }
    },

    /**
     * Validate return quantity - ensure it doesn't exceed available stock
     * التحقق من كمية المرتجع - التأكد من عدم تجاوز المخزون المتوفر
     */
    async validateReturnQuantity(row) {
        const productId = row.querySelector('.return-product-select-id')?.value;
        const unitId = row.querySelector('.return-unit-select-id')?.value;
        const warehouseId = document.getElementById('returnWarehouseId')?.value;
        const quantityInput = row.querySelector('.return-quantity-input');

        if (!productId || !unitId || !warehouseId || !quantityInput) {
            return;
        }

        const enteredQuantity = parseFloat(quantityInput.value) || 0;
        if (enteredQuantity <= 0) {
            return;
        }

        try {
            const product = await Collections.getProduct(productId);
            if (!product) return;

            // Get available stock for this product in this warehouse
            const warehouseStock = await Collections.getProductWarehouseStock(productId);
            const stockInWarehouse = warehouseStock[warehouseId] || 0;

            // Convert entered quantity to main unit
            const unit = this.units.find(u => u.id === unitId);
            if (!unit) return;

            let quantityInMainUnit = enteredQuantity;
            if (unitId !== product.unitId) {
                // Convert from sub-unit to main unit
                const subUnit = product.subUnits?.find(su => su.unitId === unitId);
                if (subUnit) {
                    const conversionFactor = parseFloat(subUnit?.conversionValue || subUnit?.conversionFactor) || 0;
                    if (conversionFactor > 0) {
                        const conversionType = subUnit.conversionType || 'multiply';
                        if (conversionType === 'multiply') {
                            // الوحدة الفرعية أكبر من الأساسية: 1 صندوق = 12 قطعة
                            // للتحويل من صندوق إلى قطعة: نضرب
                            quantityInMainUnit = enteredQuantity * conversionFactor;
                        } else if (conversionType === 'divide') {
                            // الوحدة الفرعية أصغر من الأساسية: 1 كيلو = 0.001 طن
                            // للتحويل من كيلو إلى طن: نقسم
                            quantityInMainUnit = enteredQuantity / conversionFactor;
                        } else {
                            console.warn(`⚠️ Unknown conversion type "${conversionType}" for product ${product.id || product.name}, unit ${unitId}. Using multiply as fallback.`);
                            quantityInMainUnit = enteredQuantity * conversionFactor;
                        }
                    }
                }
            }

            // Check if quantity exceeds available stock
            if (quantityInMainUnit > stockInWarehouse) {
                quantityInput.classList.add('is-invalid');
                quantityInput.setAttribute('max', stockInWarehouse);
                
                // Show warning message
                const warningMsg = `⚠️ الكمية المدخلة (${formatNumber(enteredQuantity)}) تتجاوز المخزون المتوفر (${formatNumber(stockInWarehouse)} ${product.unitId ? this.units.find(u => u.id === product.unitId)?.name || '' : ''})`;
                
                // Remove existing warning if any
                const existingWarning = row.querySelector('.return-quantity-warning');
                if (existingWarning) {
                    existingWarning.remove();
                }
                
                // Add warning message
                const warningDiv = document.createElement('div');
                warningDiv.className = 'return-quantity-warning text-danger small mt-1';
                warningDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${warningMsg}`;
                quantityInput.parentElement.appendChild(warningDiv);
                
                // Show tooltip
                quantityInput.title = `الحد الأقصى المتوفر: ${formatNumber(stockInWarehouse)}`;
            } else {
                quantityInput.classList.remove('is-invalid');
                quantityInput.removeAttribute('max');
                
                // Remove warning message
                const existingWarning = row.querySelector('.return-quantity-warning');
                if (existingWarning) {
                    existingWarning.remove();
                }
                
                quantityInput.title = '';
            }
        } catch (error) {
            console.error('Error validating return quantity:', error);
        }
    },

    /**
     * Show available quantities modal
     */
    async showAvailableQuantities(row) {
        const productId = row.querySelector('.return-product-select-id')?.value;
        const unitId = row.querySelector('.return-unit-select-id')?.value;
        const warehouseId = document.getElementById('returnWarehouseId')?.value;

        if (!productId || !unitId || !warehouseId) {
            showError('يجب اختيار المنتج والوحدة والمستودع أولاً');
            return;
        }

        const product = await Collections.getProduct(productId);
        if (!product) {
            showError('المنتج غير موجود');
            return;
        }

        const unit = this.units.find(u => u.id === unitId);
        if (!unit) {
            showError('الوحدة غير موجودة');
            return;
        }

        const warehouse = this.warehouses.find(w => w.id === warehouseId);
        if (!warehouse) {
            showError('المستودع غير موجود');
            return;
        }

        // Update modal header info
        const productNameEl = document.getElementById('availableQtyProductName');
        const unitNameEl = document.getElementById('availableQtyUnitName');
        const warehouseNameEl = document.getElementById('availableQtyWarehouseName');

        if (productNameEl) productNameEl.textContent = product.name || '-';
        if (unitNameEl) unitNameEl.textContent = unit.name || '-';
        if (warehouseNameEl) warehouseNameEl.textContent = warehouse.name || '-';

        // Show loading
        const tbody = document.getElementById('returnAvailableQuantitiesTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-muted">
                        <i class="fas fa-spinner fa-spin"></i> جاري التحميل...
                    </td>
                </tr>
            `;
        }

        // Open modal
        const modal = new bootstrap.Modal(document.getElementById('returnAvailableQuantitiesModal'));
        modal.show();

        // Load available quantities
        try {
            const quantities = await this.getAvailableQuantitiesForReturn(productId, unitId, warehouseId, product);
            
            // Store row reference and quantities for later use
            const modalInstance = { row, quantities };
            document.getElementById('returnAvailableQuantitiesModal').dataset.currentRow = '';

            // Display quantities
            if (tbody) {
                if (quantities.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="8" class="text-center text-muted">
                                لا توجد كميات متوفرة لهذا المنتج في هذا المستودع
                            </td>
                        </tr>
                    `;
                } else {
                    tbody.innerHTML = quantities.map((item, index) => `
                        <tr data-index="${index}" data-expiry="${item.expiryDate || ''}" data-serial="${item.serialNumber || ''}">
                            <td>${item.expiryDate || '-'}</td>
                            <td>${item.serialNumber || '-'}</td>
                            <td class="text-end">${formatNumber(item.quantityInMainUnit)}</td>
                            <td class="text-end">${formatNumber(item.quantityInSelectedUnit)}</td>
                            <td>
                                <input type="number" 
                                       class="form-control form-control-sm return-qty-select-input" 
                                       min="0" 
                                       max="${item.quantityInSelectedUnit}" 
                                       step="0.01" 
                                       value="0"
                                       data-index="${index}"
                                       style="width: 100px; margin: 0 auto;">
                            </td>
                            <td>${item.purchaseInvoiceNo || '-'}</td>
                            <td>${item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString('ar-IQ') : '-'}</td>
                            <td>
                                <button class="btn btn-sm btn-primary apply-return-qty-btn" 
                                        data-index="${index}"
                                        data-row-data='${JSON.stringify(item).replace(/'/g, "&apos;")}'
                                        title="تطبيق الكمية المرجعة">
                                    <i class="fas fa-check"></i> تطبيق
                                </button>
                            </td>
                        </tr>
                    `).join('');
                    
                    // Setup event listeners for apply buttons
                    const applyButtons = tbody.querySelectorAll('.apply-return-qty-btn');
                    applyButtons.forEach(btn => {
                        btn.addEventListener('click', () => {
                            const index = parseInt(btn.dataset.index);
                            const itemData = JSON.parse(btn.dataset.rowData.replace(/&apos;/g, "'"));
                            const qtyInput = tbody.querySelector(`input[data-index="${index}"]`);
                            const selectedQty = parseFloat(qtyInput?.value) || 0;
                            
                            if (selectedQty > 0 && selectedQty <= itemData.quantityInSelectedUnit) {
                                this.applySelectedReturnQuantity(row, itemData, selectedQty);
                                const modalInstance = bootstrap.Modal.getInstance(document.getElementById('returnAvailableQuantitiesModal'));
                                if (modalInstance) {
                                    modalInstance.hide();
                                } else {
                                    modal.hide();
                                }
                            } else {
                                showError(`الكمية يجب أن تكون أكبر من 0 وأقل من أو تساوي ${formatNumber(itemData.quantityInSelectedUnit)}`);
                            }
                        });
                    });
                }
            }
        } catch (error) {
            console.error('Error loading available quantities:', error);
            showError('خطأ في تحميل الكميات المتوفرة: ' + (error.message || 'خطأ غير معروف'));
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center text-danger">
                            <i class="fas fa-exclamation-triangle"></i> خطأ في تحميل البيانات
                        </td>
                    </tr>
                `;
            }
        }
    },

    /**
     * Apply selected return quantity to row
     * تطبيق الكمية المختارة على السطر مع التفاصيل
     */
    async applySelectedReturnQuantity(row, itemData, quantity) {
        // Update quantity input
        const quantityInput = row.querySelector('.return-quantity-input');
        if (quantityInput) {
            quantityInput.value = quantity;
        }

        // ✅ التحقق من أن المنتج يحتاج تاريخ صلاحية قبل الإدراج
        const hasExpiry = row.dataset.hasExpiry === 'true';
        if (hasExpiry && itemData.expiryDate) {
            const expiryDateSelect = row.querySelector('.return-expiry-date-input');
            // ✅ التحقق من أن الحقل موجود وغير معطل
            if (expiryDateSelect && !expiryDateSelect.disabled) {
                expiryDateSelect.value = itemData.expiryDate;
                // Trigger change event to load serial numbers if needed
                expiryDateSelect.dispatchEvent(new Event('change'));
            }
        }

        // ✅ التحقق من أن المنتج يحتاج رقم تسلسلي قبل الإدراج
        const hasSerial = row.dataset.hasSerial === 'true';
        if (hasSerial && itemData.serialNumber) {
            const serialNumberSelect = row.querySelector('.return-serial-number-input');
            // ✅ التحقق من أن الحقل موجود وغير معطل
            if (serialNumberSelect && !serialNumberSelect.disabled) {
                // Wait a bit for expiry date change to complete, then set serial number
                setTimeout(() => {
                    serialNumberSelect.value = itemData.serialNumber;
                }, 100);
            }
        }

        // Validate quantity after applying
        await this.validateReturnQuantity(row);

        // Recalculate totals
        this.calculateReturnItemTotal(row);
        this.calculateReturnTotals();

        const expiryInfo = itemData.expiryDate ? `تاريخ الصلاحية: ${formatDate(new Date(itemData.expiryDate))}` : '';
        const serialInfo = itemData.serialNumber ? `الرقم التسلسلي: ${itemData.serialNumber}` : '';
        const detailsInfo = [expiryInfo, serialInfo].filter(Boolean).join(', ');
        
        showSuccess(`تم تطبيق الكمية ${formatNumber(quantity)} بنجاح${detailsInfo ? ` (${detailsInfo})` : ''}`);
    },

    /**
     * Get available quantities for return
     */
    async getAvailableQuantitiesForReturn(productId, unitId, warehouseId, product) {
        try {
            // Get all purchases for this product in this warehouse
            const purchasesSnapshot = await db.collection('purchases')
                .where('warehouseId', '==', warehouseId)
                .where('status', '==', 'completed')
                .get();

            const itemMap = new Map(); // Map to track unique items

            purchasesSnapshot.forEach(purchaseDoc => {
                const purchase = purchaseDoc.data();
                if (purchase.items && Array.isArray(purchase.items)) {
                    purchase.items.forEach(item => {
                        if (item.productId === productId) {
                            // Build key based on tracking requirements
                            let key = '';
                            if (product.hasExpiryDate && product.hasSerialNumber) {
                                // Both expiry and serial: track by both
                                if (item.expiryDate && item.serialNumber) {
                                    key = `${item.expiryDate}_${item.serialNumber}`;
                                } else {
                                    return; // Skip items without both if required
                                }
                            } else if (product.hasExpiryDate) {
                                // Only expiry: track by expiry date
                                key = `expiry_${item.expiryDate || 'none'}`;
                            } else if (product.hasSerialNumber) {
                                // Only serial: track by serial number
                                key = `serial_${item.serialNumber || 'none'}`;
                            } else {
                                // No tracking: single item entry
                                key = 'no_tracking';
                            }

                            if (!itemMap.has(key)) {
                                itemMap.set(key, {
                                    expiryDate: item.expiryDate || null,
                                    serialNumber: item.serialNumber || null,
                                    quantityInMainUnit: 0,
                                    quantityInSelectedUnit: 0,
                                    purchaseInvoiceNo: purchase.invoiceNo || '',
                                    purchaseDate: purchase.date || purchase.createdAt
                                });
                            }

                            // Add quantity (convert to main unit if needed)
                            let quantityInMainUnit = parseFloat(item.quantity) || 0;
                            
                            // Convert from item unit to main unit if needed
                            if (item.unitId && item.unitId !== product.unitId) {
                                const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
                                const conversionFactor = parseFloat(subUnit?.conversionValue || subUnit?.conversionFactor) || 0;
                                if (subUnit && conversionFactor > 0) {
                                    const conversionType = subUnit.conversionType || 'multiply';
                                    if (conversionType === 'multiply') {
                                        quantityInMainUnit = quantityInMainUnit * conversionFactor;
                                    } else if (conversionType === 'divide') {
                                        quantityInMainUnit = quantityInMainUnit / conversionFactor;
                                    } else {
                                        console.warn(`⚠️ Unknown conversion type "${conversionType}" for product ${product.id || product.name}, unit ${item.unitId}. Using multiply as fallback.`);
                                        quantityInMainUnit = quantityInMainUnit * conversionFactor;
                                    }
                                }
                            }

                            const existing = itemMap.get(key);
                            existing.quantityInMainUnit += quantityInMainUnit;
                        }
                    });
                }
            });

            // Get all returns for this product in this warehouse (subtract from available)
            const returnsSnapshot = await db.collection('purchaseReturns')
                .where('warehouseId', '==', warehouseId)
                .where('status', '==', 'completed')
                .get();

            returnsSnapshot.forEach(returnDoc => {
                const returnData = returnDoc.data();
                if (returnData.items && Array.isArray(returnData.items)) {
                    returnData.items.forEach(item => {
                        if (item.productId === productId) {
                            // Build key same way as purchases
                            let key = '';
                            if (product.hasExpiryDate && product.hasSerialNumber) {
                                if (item.expiryDate && item.serialNumber) {
                                    key = `${item.expiryDate}_${item.serialNumber}`;
                                } else {
                                    return;
                                }
                            } else if (product.hasExpiryDate) {
                                key = `expiry_${item.expiryDate || 'none'}`;
                            } else if (product.hasSerialNumber) {
                                key = `serial_${item.serialNumber || 'none'}`;
                            } else {
                                key = 'no_tracking';
                            }

                            if (itemMap.has(key)) {
                                // Convert return quantity to main unit
                                let quantityInMainUnit = parseFloat(item.quantity) || 0;
                                
                                if (item.unitId && item.unitId !== product.unitId) {
                                    const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
                                    const conversionFactor = parseFloat(subUnit?.conversionValue || subUnit?.conversionFactor) || 0;
                                    if (subUnit && conversionFactor > 0) {
                                        const conversionType = subUnit.conversionType || 'multiply';
                                        if (conversionType === 'multiply') {
                                            quantityInMainUnit = quantityInMainUnit * conversionFactor;
                                        } else if (conversionType === 'divide') {
                                            quantityInMainUnit = quantityInMainUnit / conversionFactor;
                                        } else {
                                            console.warn(`⚠️ Unknown conversion type "${conversionType}" for product ${product.id || product.name}, unit ${item.unitId}. Using multiply as fallback.`);
                                            quantityInMainUnit = quantityInMainUnit * conversionFactor;
                                        }
                                    }
                                }

                                const existing = itemMap.get(key);
                                existing.quantityInMainUnit = Math.max(0, existing.quantityInMainUnit - quantityInMainUnit);
                            }
                        }
                    });
                }
            });

            // Convert to array and calculate quantity in selected unit
            const quantities = [];
            itemMap.forEach((value, key) => {
                if (value.quantityInMainUnit > 0) {
                    // Convert from main unit to selected unit
                    let quantityInSelectedUnit = value.quantityInMainUnit;
                    
                    if (unitId !== product.unitId) {
                        const subUnit = product.subUnits?.find(su => su.unitId === unitId);
                        const conversionFactor = parseFloat(subUnit?.conversionValue || subUnit?.conversionFactor) || 0;
                        if (subUnit && conversionFactor > 0) {
                            const conversionType = subUnit.conversionType || 'multiply';
                            if (conversionType === 'multiply') {
                                // للتحويل من الوحدة الأساسية إلى الفرعية (multiply): نقسم
                                // مثال: 60 قطعة / 12 = 5 صناديق
                                quantityInSelectedUnit = quantityInSelectedUnit / conversionFactor;
                            } else if (conversionType === 'divide') {
                                // للتحويل من الوحدة الأساسية إلى الفرعية (divide): نضرب
                                // مثال: 1 طن * 1000 = 1000 كيلو
                                quantityInSelectedUnit = quantityInSelectedUnit * conversionFactor;
                            } else {
                                console.warn(`⚠️ Unknown conversion type "${conversionType}" for product ${product.id || product.name}, unit ${unitId}. Using divide as fallback.`);
                                quantityInSelectedUnit = quantityInSelectedUnit / conversionFactor;
                            }
                        }
                    }

                    quantities.push({
                        ...value,
                        quantityInSelectedUnit: Math.max(0, quantityInSelectedUnit)
                    });
                }
            });

            // Sort by expiry date (if available), then by serial number
            quantities.sort((a, b) => {
                if (a.expiryDate && b.expiryDate) {
                    const dateA = new Date(a.expiryDate);
                    const dateB = new Date(b.expiryDate);
                    if (dateA.getTime() !== dateB.getTime()) {
                        return dateA - dateB;
                    }
                }
                if (a.serialNumber && b.serialNumber) {
                    return a.serialNumber.localeCompare(b.serialNumber);
                }
                return 0;
            });

            return quantities;
        } catch (error) {
            console.error('Error getting available quantities for return:', error);
            throw error;
        }
    },

    /**
     * Generate return report
     * توليد تقرير مرتجع المشتريات
     */
    async generateReturnReport() {
        try {
            showLoading();

            const reportType = document.getElementById('returnReportType')?.value || 'summary';
            const dateFrom = document.getElementById('returnReportDateFrom')?.value || '';
            const dateTo = document.getElementById('returnReportDateTo')?.value || '';

            // Filter returns by date if specified
            let filteredReturns = this.purchaseReturns || [];
            if (dateFrom) {
                const fromDate = new Date(dateFrom);
                filteredReturns = filteredReturns.filter(ret => {
                    const retDate = ret.date?.toDate ? ret.date.toDate() : new Date(ret.date);
                    return retDate >= fromDate;
                });
            }
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                filteredReturns = filteredReturns.filter(ret => {
                    const retDate = ret.date?.toDate ? ret.date.toDate() : new Date(ret.date);
                    return retDate <= toDate;
                });
            }

            let reportHTML = '';
            let reportTitle = '';

            switch (reportType) {
                case 'summary':
                    reportTitle = 'ملخص مرتجع المشتريات';
                    const reportData = {
                        totalReturns: filteredReturns.length,
                        totalAmount: filteredReturns.reduce((sum, r) => sum + (r.total || 0), 0),
                        paidAmount: filteredReturns.reduce((sum, r) => sum + (r.paidAmount || 0), 0),
                        remainingAmount: filteredReturns.reduce((sum, r) => sum + (r.remainingAmount || 0), 0),
                        suppliers: new Set(filteredReturns.map(r => r.supplierId)).size,
                        averageReturn: filteredReturns.length > 0 ? 
                            filteredReturns.reduce((sum, r) => sum + (r.total || 0), 0) / filteredReturns.length : 0
                    };

                    reportHTML = `
                        <div class="return-report">
                            <div class="report-header">
                                <h3><i class="fas fa-undo"></i> ${reportTitle}</h3>
                                <p>تاريخ التقرير: ${formatDate(new Date())}</p>
                                ${dateFrom || dateTo ? `<p>الفترة: ${dateFrom ? formatDate(dateFrom) : 'بداية'} - ${dateTo ? formatDate(dateTo) : 'نهاية'}</p>` : ''}
                            </div>
                            
                            <div class="report-summary">
                                <div class="row">
                                    <div class="col-md-3">
                                        <div class="summary-item">
                                            <h4>${reportData.totalReturns}</h4>
                                            <p>إجمالي المرتجعات</p>
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
                                <h4>تفاصيل المرتجعات</h4>
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
                                                <th>الحالة</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${filteredReturns.map(ret => `
                                                <tr>
                                                    <td>${ret.invoiceNo || 'N/A'}</td>
                                                    <td>${formatDate(ret.date)}</td>
                                                    <td>${ret.supplierName || 'N/A'}</td>
                                                    <td>${formatNumber(ret.total || 0)}</td>
                                                    <td>${formatNumber(ret.paidAmount || 0)}</td>
                                                    <td>${formatNumber(ret.remainingAmount || 0)}</td>
                                                    <td>
                                                        <span class="badge bg-${ret.status === 'completed' ? 'success' : 
                                                            ret.status === 'pending' ? 'warning' : 'danger'}">
                                                            ${ret.status === 'completed' ? 'مكتمل' : 
                                                                ret.status === 'pending' ? 'معلق' : 'ملغي'}
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
                    break;

                case 'by_supplier':
                    reportTitle = 'المرتجعات حسب المورد';
                    const supplierData = {};
                    filteredReturns.forEach(ret => {
                        const supplierId = ret.supplierId || 'unknown';
                        if (!supplierData[supplierId]) {
                            supplierData[supplierId] = {
                                supplierName: ret.supplierName || 'غير محدد',
                                returns: [],
                                totalAmount: 0,
                                count: 0
                            };
                        }
                        supplierData[supplierId].returns.push(ret);
                        supplierData[supplierId].totalAmount += ret.total || 0;
                        supplierData[supplierId].count++;
                    });

                    reportHTML = `
                        <div class="return-report">
                            <div class="report-header">
                                <h3><i class="fas fa-truck"></i> ${reportTitle}</h3>
                                <p>تاريخ التقرير: ${formatDate(new Date())}</p>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>المورد</th>
                                            <th>عدد المرتجعات</th>
                                            <th>إجمالي المبلغ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${Object.values(supplierData).map(data => `
                                            <tr>
                                                <td>${data.supplierName}</td>
                                                <td>${data.count}</td>
                                                <td>${formatNumber(data.totalAmount)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `;
                    break;

                case 'by_product':
                    reportTitle = 'المرتجعات حسب المنتج';
                    const productData = {};
                    filteredReturns.forEach(ret => {
                        if (ret.items) {
                            ret.items.forEach(item => {
                                const productId = item.productId || 'unknown';
                                if (!productData[productId]) {
                                    productData[productId] = {
                                        productName: item.productName || 'غير محدد',
                                        quantity: 0,
                                        totalAmount: 0,
                                        count: 0
                                    };
                                }
                                productData[productId].quantity += item.quantity || 0;
                                productData[productId].totalAmount += item.total || 0;
                                productData[productId].count++;
                            });
                        }
                    });

                    reportHTML = `
                        <div class="return-report">
                            <div class="report-header">
                                <h3><i class="fas fa-box"></i> ${reportTitle}</h3>
                                <p>تاريخ التقرير: ${formatDate(new Date())}</p>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>المنتج</th>
                                            <th>الكمية المرجعة</th>
                                            <th>إجمالي المبلغ</th>
                                            <th>عدد المرات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${Object.values(productData).map(data => `
                                            <tr>
                                                <td>${data.productName}</td>
                                                <td>${formatNumber(data.quantity)}</td>
                                                <td>${formatNumber(data.totalAmount)}</td>
                                                <td>${data.count}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `;
                    break;

                case 'monthly':
                    reportTitle = 'المرتجعات الشهرية';
                    const monthlyData = {};
                    filteredReturns.forEach(ret => {
                        const retDate = ret.date?.toDate ? ret.date.toDate() : new Date(ret.date);
                        const monthKey = `${retDate.getFullYear()}-${String(retDate.getMonth() + 1).padStart(2, '0')}`;
                        if (!monthlyData[monthKey]) {
                            monthlyData[monthKey] = {
                                month: monthKey,
                                count: 0,
                                totalAmount: 0
                            };
                        }
                        monthlyData[monthKey].count++;
                        monthlyData[monthKey].totalAmount += ret.total || 0;
                    });

                    reportHTML = `
                        <div class="return-report">
                            <div class="report-header">
                                <h3><i class="fas fa-calendar"></i> ${reportTitle}</h3>
                                <p>تاريخ التقرير: ${formatDate(new Date())}</p>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>الشهر</th>
                                            <th>عدد المرتجعات</th>
                                            <th>إجمالي المبلغ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month)).map(data => `
                                            <tr>
                                                <td>${data.month}</td>
                                                <td>${data.count}</td>
                                                <td>${formatNumber(data.totalAmount)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `;
                    break;

                default:
                    reportHTML = '<p class="text-muted">نوع التقرير غير معروف</p>';
            }

            // Display report
            const reportContent = document.getElementById('returnReportContent');
            if (reportContent) {
                reportContent.innerHTML = reportHTML;
            } else {
                // Fallback: show in modal
                Swal.fire({
                    title: reportTitle,
                    html: reportHTML,
                    width: '90%',
                    showCloseButton: true,
                    showConfirmButton: false,
                    customClass: {
                        popup: 'return-report-popup'
                    }
                });
            }

            hideLoading();
        } catch (error) {
            console.error('Error generating return report:', error);
            if (typeof showError === 'function') {
                showError('فشل في توليد التقرير: ' + error.message);
            }
            hideLoading();
        }
    }
};

console.log('✅ Purchase returns module loaded');

