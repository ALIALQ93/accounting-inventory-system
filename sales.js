/**
 * Sales Module - Complete Sales Management
 * @module modules/sales
 */

const SalesModule = {
    // Data storage
    currentTab: 'dashboard',
    sales: [],
    customers: [],
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
    editingSale: null,
    editingCustomer: null,
    currentSaleItems: [],
    currentSaleCurrency: 'IQD',
    currentSaleExchangeRate: 1,
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

    getHTML() {
        return `
            <div class="sales-module">
                <!-- Header -->
                <div class="module-header">
                    <div class="header-content">
                        <div class="header-title">
                            <i class="fas fa-shopping-cart"></i>
                            <h2>إدارة المبيعات</h2>
                        </div>
                        <div class="header-actions">
                            <button class="btn btn-primary" id="newSaleBtn">
                                <i class="fas fa-plus"></i> إضافة فاتورة مبيعات
                            </button>
                            <button class="btn btn-success" id="newCustomerBtn">
                                <i class="fas fa-plus"></i> إضافة عميل
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Navigation Tabs -->
                <ul class="nav nav-tabs" id="salesTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="dashboard-tab" data-bs-toggle="tab" data-bs-target="#dashboard" type="button" role="tab">
                            <i class="fas fa-tachometer-alt"></i> لوحة التحكم
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="sales-tab" data-bs-toggle="tab" data-bs-target="#sales" type="button" role="tab">
                            <i class="fas fa-shopping-cart"></i> فواتير المبيعات
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="customers-tab" data-bs-toggle="tab" data-bs-target="#customers" type="button" role="tab">
                            <i class="fas fa-users"></i> العملاء
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="settings-tab" data-bs-toggle="tab" data-bs-target="#settings" type="button" role="tab">
                            <i class="fas fa-cogs"></i> الإعدادات
                        </button>
                    </li>
                </ul>

                <!-- Tab Content -->
                <div class="tab-content" id="salesTabContent">
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
                                            <h3 id="totalSales">0</h3>
                                            <p>إجمالي المبيعات</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="summary-card">
                                        <div class="card-icon">
                                            <i class="fas fa-dollar-sign text-success"></i>
                                        </div>
                                        <div class="card-content">
                                            <h3 id="totalRevenue">0</h3>
                                            <p>إجمالي الإيرادات</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="summary-card">
                                        <div class="card-icon">
                                            <i class="fas fa-users text-warning"></i>
                                        </div>
                                        <div class="card-content">
                                            <h3 id="totalCustomers">0</h3>
                                            <p>إجمالي العملاء</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="summary-card">
                                        <div class="card-icon">
                                            <i class="fas fa-clock text-info"></i>
                                        </div>
                                        <div class="card-content">
                                            <h3 id="pendingSales">0</h3>
                                            <p>مبيعات معلقة</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Recent Sales -->
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-clock"></i> آخر المبيعات</h5>
                                </div>
                                <div class="card-body">
                                    <div class="table-responsive">
                                        <table class="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>رقم الفاتورة</th>
                                                    <th>التاريخ</th>
                                                    <th>العميل</th>
                                                    <th>المبلغ</th>
                                                    <th>الحالة</th>
                                                    <th>الإجراءات</th>
                                                </tr>
                                            </thead>
                                            <tbody id="recentSalesTable">
                                                <tr>
                                                    <td colspan="6" class="text-center text-muted">لا توجد مبيعات</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sales Tab -->
                    <div class="tab-pane fade" id="sales" role="tabpanel">
                        <div class="sales-content">
                            <!-- Search and Filter -->
                            <div class="row mb-3">
                                <div class="col-md-4">
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                                        <input type="text" class="form-control" id="saleSearch" placeholder="البحث في المبيعات...">
                                    </div>
                                </div>
                                <div class="col-md-2">
                                    <input type="date" class="form-control" id="saleDateFrom" placeholder="من تاريخ">
                                </div>
                                <div class="col-md-2">
                                    <input type="date" class="form-control" id="saleDateTo" placeholder="إلى تاريخ">
                                </div>
                                <div class="col-md-2">
                                    <select class="form-select" id="saleStatusFilter">
                                        <option value="">جميع الحالات</option>
                                        <option value="completed">مكتمل</option>
                                        <option value="pending">معلق</option>
                                        <option value="cancelled">ملغي</option>
                                    </select>
                                </div>
                                <div class="col-md-2">
                                    <button class="btn btn-outline-secondary" id="clearSaleFilters">
                                        <i class="fas fa-times"></i> مسح الفلاتر
                                    </button>
                                </div>
                            </div>

                            <!-- Sales Table -->
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-shopping-cart"></i> قائمة المبيعات</h5>
                                </div>
                                <div class="card-body">
                                    <div class="table-responsive">
                                        <table class="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>رقم الفاتورة</th>
                                                    <th>التاريخ</th>
                                                    <th>العميل</th>
                                                    <th>المبلغ الإجمالي</th>
                                                    <th>المدفوع</th>
                                                    <th>المتبقي</th>
                                                    <th>الحالة</th>
                                                    <th>الإجراءات</th>
                                                </tr>
                                            </thead>
                                            <tbody id="salesTable">
                                                <tr>
                                                    <td colspan="8" class="text-center text-muted">لا توجد مبيعات</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Customers Tab -->
                    <div class="tab-pane fade" id="customers" role="tabpanel">
                        <div class="customers-content">
                            <!-- Search and Filter -->
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                                        <input type="text" class="form-control" id="customerSearch" placeholder="البحث في العملاء...">
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <select class="form-select" id="customerStatusFilter">
                                        <option value="">جميع الحالات</option>
                                        <option value="active">نشط</option>
                                        <option value="inactive">غير نشط</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <button class="btn btn-outline-secondary" id="clearCustomerFilters">
                                        <i class="fas fa-times"></i> مسح الفلاتر
                                    </button>
                                </div>
                            </div>

                            <!-- Customers Table -->
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-users"></i> قائمة العملاء</h5>
                                </div>
                                <div class="card-body">
                                    <div class="table-responsive">
                                        <table class="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>اسم العميل</th>
                                                    <th>الهاتف</th>
                                                    <th>البريد الإلكتروني</th>
                                                    <th>العنوان</th>
                                                    <th>إجمالي المشتريات</th>
                                                    <th>الرصيد</th>
                                                    <th>الحالة</th>
                                                    <th>الإجراءات</th>
                                                </tr>
                                            </thead>
                                            <tbody id="customersTable">
                                                <tr>
                                                    <td colspan="8" class="text-center text-muted">لا توجد عملاء</td>
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
                                <h3><i class="fas fa-cogs"></i> إعدادات المبيعات</h3>
                                <p>تكوين الإعدادات الافتراضية لفواتير المبيعات</p>
                            </div>
                            
                            <div class="row">
                                <!-- Default Values Settings -->
                                <div class="col-md-6">
                                    <div class="settings-card">
                                        <div class="card-header">
                                            <h5><i class="fas fa-sliders-h text-primary"></i> القيم الافتراضية</h5>
                                            <p class="text-muted">تحديد القيم الافتراضية لفواتير المبيعات الجديدة</p>
                                        </div>
                                        <div class="card-body">
                                            <!-- Default Currency -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-coins text-warning"></i>
                                                    العملة الافتراضية
                                                </label>
                                                <select class="form-select" id="defaultSaleCurrency">
                                                    <option value="IQD">دينار عراقي (IQD)</option>
                                                    <option value="USD">دولار أمريكي (USD)</option>
                                                    <option value="EUR">يورو (EUR)</option>
                                                </select>
                                                <small class="text-muted">
                                                    العملة الافتراضية لفواتير المبيعات الجديدة
                                                </small>
                                            </div>
                                            
                                            <!-- Default Payment Method -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-credit-card text-success"></i>
                                                    طريقة الدفع الافتراضية
                                                </label>
                                                <select class="form-select" id="defaultSalePaymentMethod">
                                                    <option value="cash">نقدي</option>
                                                    <option value="credit">آجل</option>
                                                </select>
                                                <small class="text-muted">
                                                    طريقة الدفع الافتراضية لفواتير المبيعات الجديدة
                                                </small>
                                            </div>
                                            
                                            <!-- Default Warehouse -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-warehouse text-info"></i>
                                                    المستودع الافتراضي
                                                </label>
                                                <select class="form-select" id="defaultSaleWarehouse">
                                                    <option value="">-- اختر المستودع الافتراضي --</option>
                                                </select>
                                                <small class="text-muted">
                                                    المستودع الافتراضي لفواتير المبيعات الجديدة
                                                </small>
                                            </div>
                                            
                                            <!-- Default Cost Center -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-building text-danger"></i>
                                                    مركز الكلفة الافتراضي
                                                </label>
                                                <select class="form-select" id="defaultSaleCostCenter">
                                                    <option value="">-- اختر مركز الكلفة الافتراضي --</option>
                                                </select>
                                                <small class="text-muted">
                                                    مركز الكلفة الافتراضي لفواتير المبيعات الجديدة
                                                </small>
                                            </div>
                                            
                                            <!-- Save Default Values Button -->
                                            <div class="d-grid">
                                                <button class="btn btn-primary" onclick="SalesModule.saveDefaultValues()">
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
                                            <p class="text-muted">تكوين الإعدادات العامة لوحدة المبيعات</p>
                                        </div>
                                        <div class="card-body">
                                            <!-- Auto Generate Invoice Numbers -->
                                            <div class="mb-4">
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input" type="checkbox" id="autoGenerateSaleInvoiceNumbers" checked>
                                                    <label class="form-check-label" for="autoGenerateSaleInvoiceNumbers">
                                                        <i class="fas fa-magic text-primary"></i>
                                                        توليد أرقام الفواتير تلقائياً
                                                    </label>
                                                </div>
                                                <small class="text-muted">
                                                    توليد أرقام فواتير المبيعات تلقائياً عند الإنشاء
                                                </small>
                                            </div>
                                            
                                            <!-- Auto Update Stock -->
                                            <div class="mb-4">
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input" type="checkbox" id="autoUpdateSaleStock" checked>
                                                    <label class="form-check-label" for="autoUpdateSaleStock">
                                                        <i class="fas fa-boxes text-success"></i>
                                                        تحديث المخزون تلقائياً (تقليل)
                                                    </label>
                                                </div>
                                                <small class="text-muted">
                                                    تقليل كميات المخزون تلقائياً عند حفظ فاتورة المبيعات
                                                </small>
                                            </div>
                                            
                                            <!-- Allow Sale Without Stock -->
                                            <div class="mb-4">
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input" type="checkbox" id="allowSaleWithoutStock">
                                                    <label class="form-check-label" for="allowSaleWithoutStock">
                                                        <i class="fas fa-exclamation-triangle text-warning"></i>
                                                        السماح بالبيع دون رصيد
                                                    </label>
                                                </div>
                                                <small class="text-muted">
                                                    السماح ببيع منتجات حتى لو لم يكن هناك رصيد كافٍ في المخزون (غير مستحسن)
                                                </small>
                                            </div>
                                            
                                            <!-- Auto Generate General Entry -->
                                            <div class="mb-4">
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input" type="checkbox" id="autoGenerateSaleGeneralEntry" checked>
                                                    <label class="form-check-label" for="autoGenerateSaleGeneralEntry">
                                                        <i class="fas fa-balance-scale text-warning"></i>
                                                        توليد القيد العام تلقائياً
                                                    </label>
                                                </div>
                                                <small class="text-muted">
                                                    توليد القيد المحاسبي تلقائياً عند حفظ فاتورة المبيعات (العميل مدين، المبيعات دائن)
                                                </small>
                                            </div>
                                            
                                            <!-- Default Tax Rate -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-percentage text-danger"></i>
                                                    معدل الضريبة الافتراضي
                                                </label>
                                                <input type="number" class="form-control" id="defaultSaleTaxRate" value="0" min="0" max="100" step="0.01">
                                                <small class="text-muted">
                                                    معدل الضريبة الافتراضي لفواتير المبيعات الجديدة (%)
                                                </small>
                                            </div>
                                            
                                            <!-- Default Pricing Mode -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-tags text-info"></i>
                                                    نمط التسعير الافتراضي
                                                </label>
                                                <select class="form-select" id="defaultSalePricingMode">
                                                    <option value="retail">سعر البيع المفرد</option>
                                                    <option value="wholesale">سعر البيع الجملة</option>
                                                </select>
                                                <small class="text-muted">
                                                    نمط التسعير المستخدم في فواتير المبيعات الجديدة (سعر البيع المفرد أم الجملة)
                                                </small>
                                            </div>
                                            
                                            <!-- Default Sales Account (Credit Account for Sales) -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-exchange-alt text-secondary"></i>
                                                    الحساب الدائن الافتراضي (المبيعات/الإيرادات)
                                                </label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" id="defaultSaleSalesAccountDisplay" placeholder="اختر من شجرة الحسابات" readonly style="background-color: #f8f9fa;">
                                                    <input type="hidden" id="defaultSaleSalesAccount" value="">
                                                    <button type="button" class="btn btn-outline-secondary" id="openDefaultSaleSalesAccountPicker" title="اختر من شجرة الحسابات">
                                                        <i class="fas fa-sitemap"></i>
                                                    </button>
                                                </div>
                                                <small class="text-muted">
                                                    سيتم استخدام هذا الحساب كدائن مقابل فاتورة المبيعات (يمكن تغييره داخل الفاتورة).
                                                </small>
                                            </div>
                                            
                                            <!-- Default Debit Account (for Cash payments) -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-credit-card text-primary"></i>
                                                    الحساب المدين الافتراضي (للدفع النقدي)
                                                </label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" id="defaultSaleDebitAccountDisplay" placeholder="اختر من شجرة الحسابات" readonly style="background-color: #f8f9fa;">
                                                    <input type="hidden" id="defaultSaleDebitAccount" value="">
                                                    <button type="button" class="btn btn-outline-secondary" id="openDefaultSaleDebitAccountPicker" title="اختر من شجرة الحسابات">
                                                        <i class="fas fa-sitemap"></i>
                                                    </button>
                                                </div>
                                                <small class="text-muted">
                                                    سيتم استخدام هذا الحساب كمدين في حالة الدفع النقدي (مثل: النقدية، الصندوق).
                                                </small>
                                            </div>
                                            
                                            <!-- Default Payment Account (for partial payments) -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-wallet text-success"></i>
                                                    حساب الدفع الافتراضي (للدفعات الجزئية)
                                                </label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" id="defaultSalePaymentAccountDisplay" placeholder="اختر من شجرة الحسابات" readonly style="background-color: #f8f9fa;">
                                                    <input type="hidden" id="defaultSalePaymentAccount" value="">
                                                    <button type="button" class="btn btn-outline-secondary" id="openDefaultSalePaymentAccountPicker" title="اختر من شجرة الحسابات">
                                                        <i class="fas fa-sitemap"></i>
                                                    </button>
                                                </div>
                                                <small class="text-muted">
                                                    سيتم استخدام هذا الحساب كمدين عند استلام دفعة جزئية (مثل: النقدية، الصندوق، البنك).
                                                </small>
                                            </div>
                                            
                                            <!-- Default Counter Account for Additions -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-plus-circle text-success"></i>
                                                    الحساب المقابل للإضافات (مدين الإضافات)
                                                </label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" id="defaultSaleAdditionCounterAccountDisplay" placeholder="اختر من شجرة الحسابات" readonly style="background-color: #f8f9fa;">
                                                    <input type="hidden" id="defaultSaleAdditionCounterAccount" value="">
                                                    <button type="button" class="btn btn-outline-secondary" id="openDefaultSaleAdditionCounterAccountPicker" title="اختر من شجرة الحسابات">
                                                        <i class="fas fa-sitemap"></i>
                                                    </button>
                                                </div>
                                                <small class="text-muted">
                                                    سيتم استخدام هذا الحساب كمدين مقابل حسابات الإضافات (افتراضي: حساب العميل).
                                                </small>
                                            </div>
                                            
                                            <!-- Default Counter Account for Discounts -->
                                            <div class="mb-4">
                                                <label class="form-label">
                                                    <i class="fas fa-minus-circle text-danger"></i>
                                                    الحساب المقابل للخصومات (دائن الخصومات)
                                                </label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" id="defaultSaleDiscountCounterAccountDisplay" placeholder="اختر من شجرة الحسابات" readonly style="background-color: #f8f9fa;">
                                                    <input type="hidden" id="defaultSaleDiscountCounterAccount" value="">
                                                    <button type="button" class="btn btn-outline-secondary" id="openDefaultSaleDiscountCounterAccountPicker" title="اختر من شجرة الحسابات">
                                                        <i class="fas fa-sitemap"></i>
                                                    </button>
                                                </div>
                                                <small class="text-muted">
                                                    سيتم استخدام هذا الحساب كدائن مقابل حسابات الخصومات (افتراضي: حساب العميل).
                                                </small>
                                            </div>
                                            
                                            <!-- Save General Settings Button -->
                                            <div class="d-grid">
                                                <button class="btn btn-success" onclick="SalesModule.saveGeneralSettings()">
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
                                            <p class="text-muted">اختر الحقول التي تريد طباعتها في فاتورة المبيعات</p>
                                        </div>
                                        <div class="card-body">
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <h6 class="mb-3"><i class="fas fa-info-circle text-info"></i> معلومات الفاتورة</h6>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printSaleInvoiceNo" checked>
                                                        <label class="form-check-label" for="printSaleInvoiceNo">
                                                            رقم الفاتورة
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printSaleDate" checked>
                                                        <label class="form-check-label" for="printSaleDate">
                                                            التاريخ
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printSalePaymentMethod" checked>
                                                        <label class="form-check-label" for="printSalePaymentMethod">
                                                            طريقة الدفع
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printSaleStatus" checked>
                                                        <label class="form-check-label" for="printSaleStatus">
                                                            الحالة
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printSaleCostCenter" checked>
                                                        <label class="form-check-label" for="printSaleCostCenter">
                                                            مركز الكلفة
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printSaleWarehouse" checked>
                                                        <label class="form-check-label" for="printSaleWarehouse">
                                                            المستودع
                                                        </label>
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <h6 class="mb-3"><i class="fas fa-user text-success"></i> معلومات العميل</h6>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printSaleCustomerName" checked>
                                                        <label class="form-check-label" for="printSaleCustomerName">
                                                            اسم العميل
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printSaleCustomerPhone" checked>
                                                        <label class="form-check-label" for="printSaleCustomerPhone">
                                                            هاتف العميل
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printSaleCustomerAddress" checked>
                                                        <label class="form-check-label" for="printSaleCustomerAddress">
                                                            عنوان العميل
                                                        </label>
                                                    </div>
                                                    
                                                    <h6 class="mb-3 mt-4"><i class="fas fa-calculator text-warning"></i> المبالغ المالية</h6>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printSaleSubtotal" checked>
                                                        <label class="form-check-label" for="printSaleSubtotal">
                                                            المجموع الفرعي
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printSaleDiscount" checked>
                                                        <label class="form-check-label" for="printSaleDiscount">
                                                            الخصم
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printSaleAddition" checked>
                                                        <label class="form-check-label" for="printSaleAddition">
                                                            الإضافة
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printSaleTotal" checked>
                                                        <label class="form-check-label" for="printSaleTotal">
                                                            الإجمالي
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printSalePaid" checked>
                                                        <label class="form-check-label" for="printSalePaid">
                                                            المدفوع
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printSaleRemaining" checked>
                                                        <label class="form-check-label" for="printSaleRemaining">
                                                            المتبقي
                                                        </label>
                                                    </div>
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="printSaleNotes" checked>
                                                        <label class="form-check-label" for="printSaleNotes">
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
                                                                <input class="form-check-input" type="checkbox" id="printSaleProductName" checked>
                                                                <label class="form-check-label" for="printSaleProductName">
                                                                    اسم المنتج
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printSaleProductQuantity" checked>
                                                                <label class="form-check-label" for="printSaleProductQuantity">
                                                                    الكمية
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printSaleProductUnit" checked>
                                                                <label class="form-check-label" for="printSaleProductUnit">
                                                                    الوحدة
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printSaleProductUnitPrice" checked>
                                                                <label class="form-check-label" for="printSaleProductUnitPrice">
                                                                    سعر الوحدة
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printSaleProductTotal" checked>
                                                                <label class="form-check-label" for="printSaleProductTotal">
                                                                    إجمالي المنتج
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printSaleProductDiscount" checked>
                                                                <label class="form-check-label" for="printSaleProductDiscount">
                                                                    خصم المنتج
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printSaleProductAddition" checked>
                                                                <label class="form-check-label" for="printSaleProductAddition">
                                                                    إضافة المنتج
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printSaleProductExpiryDate" checked>
                                                                <label class="form-check-label" for="printSaleProductExpiryDate">
                                                                    تاريخ الصلاحية
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printSaleProductSerialNumber" checked>
                                                                <label class="form-check-label" for="printSaleProductSerialNumber">
                                                                    الرقم التسلسلي
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div class="col-md-3">
                                                            <div class="form-check mb-2">
                                                                <input class="form-check-input" type="checkbox" id="printSaleProductNotes" checked>
                                                                <label class="form-check-label" for="printSaleProductNotes">
                                                                    ملاحظات المنتج
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="d-grid mt-4">
                                                <button class="btn btn-primary" onclick="SalesModule.savePrintFieldsSettings()">
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
                                                    <button class="btn btn-outline-primary w-100" onclick="SalesModule.resetToDefaults()">
                                                        <i class="fas fa-undo"></i>
                                                        <br>إعادة تعيين الافتراضي
                                                    </button>
                                                </div>
                                                <div class="col-md-3">
                                                    <button class="btn btn-outline-info w-100" onclick="SalesModule.exportSettings()">
                                                        <i class="fas fa-download"></i>
                                                        <br>تصدير الإعدادات
                                                    </button>
                                                </div>
                                                <div class="col-md-3">
                                                    <button class="btn btn-outline-success w-100" onclick="SalesModule.importSettings()">
                                                        <i class="fas fa-upload"></i>
                                                        <br>استيراد الإعدادات
                                                    </button>
                                                </div>
                                                <div class="col-md-3">
                                                    <button class="btn btn-outline-warning w-100" onclick="SalesModule.testSettings()">
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
        console.log('🛒 Loading sales module...');
        this.render();
        await this.loadData();
        
        // Setup real-time sync
        this.setupSalesSync();
        
        console.log('✅ Sales module loaded');
    },

    async loadData() {
        try {
            console.log('🔄 Loading sales data...');
            
            // Load all data in parallel
            await Promise.all([
                this.loadSales(),
                this.loadCustomers(),
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
            console.log('✅ All sales data loaded successfully');
            console.log(`📊 Data summary: ${this.sales.length} sales, ${this.customers.length} customers, ${this.products.length} products, ${this.warehouses.length} warehouses`);
            
        } catch (error) {
            console.error('❌ Error loading sales data:', error);
        }
    },

    async loadSales() {
        try {
            const snapshot = await db.collection('sales').get();
            this.sales = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.renderSalesTable();
        } catch (error) {
            console.error('Error loading sales:', error);
        }
    },

    async loadCustomers() {
        try {
            // Load all parties and filter customers in JavaScript
            const snapshot = await db.collection('parties').get();
            const allParties = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Filter customers (type === 'customer' or type === 'both')
            this.customers = allParties
                .filter(party => party.type === 'customer' || party.type === 'both')
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
            
            this.renderCustomersTable();
        } catch (error) {
            console.error('Error loading customers:', error);
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

    async loadCategories() {
        try {
            const snapshot = await db.collection('categories').get();
            this.categories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading categories:', error);
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

    async loadSalesReps() {
        try {
            const snapshot = await db.collection('salesReps').get();
            this.salesReps = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading sales reps:', error);
        }
    },

    async loadAccounts() {
        try {
            this.accounts = await ChartOfAccountsModule.getAccounts();
        } catch (error) {
            console.error('Error loading accounts:', error);
            this.accounts = [];
        }
    },

    updateDashboard() {
        // Initialize arrays if not defined
        if (!this.sales) this.sales = [];
        if (!this.customers) this.customers = [];
        
        const totalRevenue = this.sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        const pendingSales = this.sales.filter(s => s.status === 'pending').length;
        
        // Safely update dashboard statistics
        if (window.DOMUtils) {
            const updates = {
                'totalSales': this.sales.length.toString(),
                'totalRevenue': totalRevenue.toLocaleString(),
                'totalCustomers': this.customers.length.toString(),
                'pendingSales': pendingSales.toString()
            };
            
            const results = window.DOMUtils.batchUpdateText(updates);
            console.log('📊 Sales Dashboard stats updated:', results);
        } else {
            // Fallback with safety checks
            const totalSalesEl = document.getElementById('totalSales');
            const totalRevenueEl = document.getElementById('totalRevenue');
            const totalCustomersEl = document.getElementById('totalCustomers');
            const pendingSalesEl = document.getElementById('pendingSales');
            
            if (totalSalesEl) totalSalesEl.textContent = this.sales.length;
            if (totalRevenueEl) totalRevenueEl.textContent = totalRevenue.toLocaleString();
            if (totalCustomersEl) totalCustomersEl.textContent = this.customers.length;
            if (pendingSalesEl) pendingSalesEl.textContent = pendingSales;
        }
        
        this.renderRecentSales();
    },

    renderSalesTable() {
        const tbody = document.getElementById('salesTable');
        if (!tbody) return;

        if (this.sales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">لا توجد مبيعات</td></tr>';
            return;
        }

        tbody.innerHTML = this.sales.map(sale => {
            const statusClass = sale.status === 'completed' ? 'success' : sale.status === 'pending' ? 'warning' : 'danger';
            const statusText = sale.status === 'completed' ? 'مكتمل' : sale.status === 'pending' ? 'معلق' : 'ملغي';
            
            return `
                <tr>
                    <td>${sale.invoiceNo || 'N/A'}</td>
                    <td>${formatDate(sale.date)}</td>
                    <td>${sale.customerName || 'N/A'}</td>
                    <td>${formatNumber(sale.total || 0)}</td>
                    <td>${formatNumber(sale.paid || 0)}</td>
                    <td>${formatNumber(sale.remaining || 0)}</td>
                    <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="SalesModule.viewSale('${sale.id}')" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="SalesModule.viewSaleGeneralEntry('${sale.id}')" title="عرض القيد العام">
                            <i class="fas fa-file-contract"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="SalesModule.printSale('${sale.id}')" title="طباعة الفاتورة">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="SalesModule.editSale('${sale.id}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="SalesModule.deleteSale('${sale.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    renderCustomersTable() {
        const tbody = document.getElementById('customersTable');
        if (!tbody) return;

        if (this.customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">لا توجد عملاء</td></tr>';
            return;
        }

        tbody.innerHTML = this.customers.map(customer => {
            const totalPurchases = this.sales
                .filter(s => s.customerId === customer.id)
                .reduce((sum, s) => sum + (s.total || 0), 0);
            
            return `
                <tr>
                    <td>${customer.name || 'N/A'}</td>
                    <td>${customer.phone || 'N/A'}</td>
                    <td>${customer.email || 'N/A'}</td>
                    <td>${customer.address || 'N/A'}</td>
                    <td>${totalPurchases.toLocaleString()}</td>
                    <td class="${(customer.balance || 0) >= 0 ? 'text-success' : 'text-danger'}">${(customer.balance || 0).toLocaleString()}</td>
                    <td><span class="badge bg-${customer.status === 'active' ? 'success' : 'secondary'}">${customer.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="SalesModule.viewCustomer('${customer.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="SalesModule.editCustomer('${customer.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    renderRecentSales() {
        const tbody = document.getElementById('recentSalesTable');
        if (!tbody) return;

        const recentSales = this.sales.slice(0, 5);
        
        if (recentSales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">لا توجد مبيعات</td></tr>';
            return;
        }

        tbody.innerHTML = recentSales.map(sale => {
            const statusClass = sale.status === 'completed' ? 'success' : sale.status === 'pending' ? 'warning' : 'danger';
            const statusText = sale.status === 'completed' ? 'مكتمل' : sale.status === 'pending' ? 'معلق' : 'ملغي';
            
            return `
                <tr>
                    <td>${sale.invoiceNo || 'N/A'}</td>
                    <td>${formatDate(sale.date)}</td>
                    <td>${sale.customerName || 'N/A'}</td>
                    <td>${formatNumber(sale.total || 0)}</td>
                    <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="SalesModule.viewSale('${sale.id}')" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('#salesTabs button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.currentTab = e.target.getAttribute('data-bs-target').replace('#', '');
                
                // Load settings when settings tab is opened
                if (this.currentTab === 'settings') {
                    this.loadSettings();
                    this.setupSettingsAccountPickerButtons();
                }
            });
        });

        // Search functionality
        const saleSearch = document.getElementById('saleSearch');
        if (saleSearch) {
            saleSearch.addEventListener('input', (e) => {
                this.filterSales(e.target.value);
            });
        }

        const customerSearch = document.getElementById('customerSearch');
        if (customerSearch) {
            customerSearch.addEventListener('input', (e) => {
                this.filterCustomers(e.target.value);
            });
        }

        // Filter functionality
        const saleStatusFilter = document.getElementById('saleStatusFilter');
        if (saleStatusFilter) {
            saleStatusFilter.addEventListener('change', (e) => {
                this.filterSalesByStatus(e.target.value);
            });
        }

        // Clear filters
        const clearSaleFilters = document.getElementById('clearSaleFilters');
        if (clearSaleFilters) {
            clearSaleFilters.addEventListener('click', () => {
                this.clearSaleFilters();
            });
        }

        const clearCustomerFilters = document.getElementById('clearCustomerFilters');
        if (clearCustomerFilters) {
            clearCustomerFilters.addEventListener('click', () => {
                this.clearCustomerFilters();
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

        // Action buttons
        const newSaleBtn = document.getElementById('newSaleBtn');
        if (newSaleBtn) {
            newSaleBtn.addEventListener('click', () => {
                this.showNewSaleModal();
            });
        }

        const newCustomerBtn = document.getElementById('newCustomerBtn');
        if (newCustomerBtn) {
            newCustomerBtn.addEventListener('click', () => {
                this.showNewCustomerModal();
            });
        }

        // Report generation
        const generateSalesReport = document.getElementById('generateSalesReport');
        if (generateSalesReport) {
            generateSalesReport.addEventListener('click', () => {
                this.generateSalesReport();
            });
        }
    },

    filterSales(searchTerm) {
        const filteredSales = this.sales.filter(sale => 
            sale.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.customerName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderFilteredSales(filteredSales);
    },

    filterSalesByStatus(status) {
        if (!status) {
            this.renderSalesTable();
            return;
        }
        
        const filteredSales = this.sales.filter(sale => sale.status === status);
        this.renderFilteredSales(filteredSales);
    },

    renderFilteredSales(sales) {
        const tbody = document.getElementById('salesTable');
        if (!tbody) return;

        if (sales.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">لا توجد مبيعات</td></tr>';
            return;
        }

        tbody.innerHTML = sales.map(sale => {
            const statusClass = sale.status === 'completed' ? 'success' : sale.status === 'pending' ? 'warning' : 'danger';
            const statusText = sale.status === 'completed' ? 'مكتمل' : sale.status === 'pending' ? 'معلق' : 'ملغي';
            
            return `
                <tr>
                    <td>${sale.invoiceNo || 'N/A'}</td>
                    <td>${new Date(sale.date).toLocaleDateString('ar-SA')}</td>
                    <td>${sale.customerName || 'N/A'}</td>
                    <td>${(sale.total || 0).toLocaleString()}</td>
                    <td>${(sale.paid || 0).toLocaleString()}</td>
                    <td>${(sale.remaining || 0).toLocaleString()}</td>
                    <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="SalesModule.viewSale('${sale.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="SalesModule.editSale('${sale.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="SalesModule.deleteSale('${sale.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    filterCustomers(searchTerm) {
        const filteredCustomers = this.customers.filter(customer => 
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderFilteredCustomers(filteredCustomers);
    },

    renderFilteredCustomers(customers) {
        const tbody = document.getElementById('customersTable');
        if (!tbody) return;

        if (customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">لا توجد عملاء</td></tr>';
            return;
        }

        tbody.innerHTML = customers.map(customer => {
            const totalPurchases = this.sales
                .filter(s => s.customerId === customer.id)
                .reduce((sum, s) => sum + (s.total || 0), 0);
            
            return `
                <tr>
                    <td>${customer.name || 'N/A'}</td>
                    <td>${customer.phone || 'N/A'}</td>
                    <td>${customer.email || 'N/A'}</td>
                    <td>${customer.address || 'N/A'}</td>
                    <td>${totalPurchases.toLocaleString()}</td>
                    <td class="${(customer.balance || 0) >= 0 ? 'text-success' : 'text-danger'}">${(customer.balance || 0).toLocaleString()}</td>
                    <td><span class="badge bg-${customer.status === 'active' ? 'success' : 'secondary'}">${customer.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="SalesModule.viewCustomer('${customer.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="SalesModule.editCustomer('${customer.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    clearSaleFilters() {
        document.getElementById('saleSearch').value = '';
        document.getElementById('saleDateFrom').value = '';
        document.getElementById('saleDateTo').value = '';
        document.getElementById('saleStatusFilter').value = '';
        this.renderSalesTable();
    },

    clearCustomerFilters() {
        document.getElementById('customerSearch').value = '';
        document.getElementById('customerStatusFilter').value = '';
        this.renderCustomersTable();
    },

    showNewSaleModal() {
        this.editingSale = null;
        this.showSaleModal();
    },

    /**
     * Show sale modal (placeholder - will be implemented fully)
     */
    showSaleModal() {
        const modalHTML = `
            <div class="modal fade" id="saleModal" tabindex="-1">
                <div class="modal-dialog modal-fullscreen">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-shopping-cart"></i>
                                ${this.editingSale ? 'تعديل فاتورة المبيعات' : 'إضافة فاتورة مبيعات جديدة'}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="saleForm">
                                <!-- Sale Header -->
                                <div class="row mb-3">
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="saleInvoiceNo" class="form-label">رقم الفاتورة</label>
                                            <input type="text" id="saleInvoiceNo" class="form-control" readonly style="background-color: #f8f9fa;">
                                            <small class="form-text text-muted">سيتم توليد الرقم تلقائياً</small>
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="saleDate" class="form-label">تاريخ الفاتورة *</label>
                                            <input type="date" id="saleDate" class="form-control" required>
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="saleCustomer" class="form-label">العميل *</label>
                                            <div class="input-group">
                                                <input type="text" id="saleCustomerDisplay" class="form-control" placeholder="اختر العميل" readonly style="background-color: #f8f9fa;">
                                                <input type="hidden" id="saleCustomerId" value="">
                                                <button type="button" class="btn btn-outline-secondary" id="openCustomerPicker" title="اختر العميل">
                                                    <i class="fas fa-search"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="saleCurrency" class="form-label">عملة الفاتورة</label>
                                            <select id="saleCurrency" class="form-select">
                                                ${this.currencies.map(currency => `
                                                    <option value="${currency.code}" ${currency.code === 'IQD' ? 'selected' : ''}>${currency.name}</option>
                                                `).join('')}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="saleExchangeRate" class="form-label">سعر الصرف</label>
                                            <input type="number" id="saleExchangeRate" class="form-control" value="1" min="0" step="0.0001">
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="saleWarehouse" class="form-label">المستودع *</label>
                                            <div class="input-group">
                                                <input type="text" id="saleWarehouseDisplay" class="form-control" placeholder="اختر المستودع" readonly style="background-color: #f8f9fa;">
                                                <input type="hidden" id="saleWarehouseId" value="">
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
                                            <label for="saleCostCenter" class="form-label">مركز الكلفة</label>
                                            <div class="input-group">
                                                <input type="text" id="saleCostCenterDisplay" class="form-control" placeholder="اختر مركز الكلفة" readonly style="background-color: #f8f9fa;">
                                                <input type="hidden" id="saleCostCenterId" value="">
                                                <button type="button" class="btn btn-outline-secondary" id="openCostCenterPicker" title="اختر مركز الكلفة">
                                                    <i class="fas fa-search"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="salePaymentTerms" class="form-label">شروط الدفع</label>
                                            <input type="text" id="salePaymentTerms" class="form-control" placeholder="مثال: صافي 30 يوم">
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="saleSalesRep1" class="form-label">المندوب الأول</label>
                                            <div class="input-group">
                                                <input type="text" id="saleSalesRep1Display" class="form-control" placeholder="اختر المندوب الأول" readonly style="background-color: #f8f9fa;">
                                                <input type="hidden" id="saleSalesRep1Id" value="">
                                                <button type="button" class="btn btn-outline-secondary" id="openSalesRep1Picker" title="اختر المندوب الأول">
                                                    <i class="fas fa-search"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="saleSalesRep2" class="form-label">المندوب الثاني</label>
                                            <div class="input-group">
                                                <input type="text" id="saleSalesRep2Display" class="form-control" placeholder="اختر المندوب الثاني" readonly style="background-color: #f8f9fa;">
                                                <input type="hidden" id="saleSalesRep2Id" value="">
                                                <button type="button" class="btn btn-outline-secondary" id="openSalesRep2Picker" title="اختر المندوب الثاني">
                                                    <i class="fas fa-search"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Sale Items - Advanced Excel-like Table -->
                                <div class="row mb-3">
                                    <div class="col-12">
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <h6><i class="fas fa-table"></i> تفاصيل المنتجات (مثل Excel)</h6>
                                            <div>
                                                <button type="button" class="btn btn-sm btn-outline-primary me-2" id="addSaleItem">
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
                                            <div class="table-responsive" id="saleItemsTableContainer" 
                                                 style="max-height: 500px; overflow-x: auto; overflow-y: auto; position: relative; border: 2px solid #d0d7e5; border-radius: 4px; background: #fff;">
                                                <!-- Custom Scrollbars -->
                                                <style>
                                                    #saleItemsTableContainer {
                                                        overflow-x: auto !important;
                                                        overflow-y: auto !important;
                                                        scrollbar-width: thin;
                                                        scrollbar-color: #888 #f1f1f1;
                                                    }
                                                    #saleItemsTableContainer::-webkit-scrollbar {
                                                        width: 16px;
                                                        height: 16px;
                                                    }
                                                    #saleItemsTableContainer::-webkit-scrollbar-track {
                                                        background: #f1f1f1;
                                                        border-radius: 4px;
                                                    }
                                                    #saleItemsTableContainer::-webkit-scrollbar-thumb {
                                                        background: #888;
                                                        border-radius: 4px;
                                                        border: 2px solid #f1f1f1;
                                                    }
                                                    #saleItemsTableContainer::-webkit-scrollbar-thumb:hover {
                                                        background: #555;
                                                    }
                                                    #saleItemsTableContainer::-webkit-scrollbar-corner {
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
                                                <table class="table table-bordered mb-0" id="saleItemsTable" 
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
                                                            <th width="8%" class="resizable" data-col="10" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 100px; position: relative;">المجموع
                                                                <div class="resize-handle" data-col="10"></div>
                                                            </th>
                                                            <th width="8%" class="resizable col-expiry" data-col="11" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 120px; position: relative;">تاريخ الصلاحية
                                                                <div class="resize-handle" data-col="11"></div>
                                                            </th>
                                                            <th width="8%" class="resizable col-serial" data-col="12" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 120px; position: relative;">الرقم التسلسلي
                                                                <div class="resize-handle" data-col="12"></div>
                                                            </th>
                                                            <th width="12%" class="resizable col-notes" data-col="13" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 150px; position: relative;">ملاحظات
                                                                <div class="resize-handle" data-col="13"></div>
                                                            </th>
                                                            <th width="4%" class="resizable" data-col="14" style="border: 1px solid #d0d7e5; padding: 8px; text-align: center; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 60px; position: relative;">الإجراءات
                                                                <div class="resize-handle" data-col="14"></div>
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="saleItemsBody">
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

                                <!-- Sale Summary -->
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="saleNotes" class="form-label">ملاحظات</label>
                                            <textarea id="saleNotes" class="form-control" rows="3"></textarea>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="sale-summary">
                                            <h6><i class="fas fa-calculator"></i> ملخص الفاتورة</h6>
                                            <div class="row mb-2">
                                                <div class="col-6">
                                                    <label class="form-label">المجموع الفرعي:</label>
                                                </div>
                                                <div class="col-6">
                                                    <span id="saleSubtotal">0.00</span> <span id="subtotalCurrency">IQD</span>
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
                                                    <strong><span id="saleTotal">0.00</span> <span id="totalCurrency">IQD</span></strong>
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
                                                    <label for="salePaymentMethod" class="form-label">طريقة الدفع</label>
                                                    <select id="salePaymentMethod" class="form-select">
                                                        <option value="cash">نقدي</option>
                                                        <option value="credit">آجل</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="form-group">
                                                    <label for="salePaidAmount" class="form-label">المبلغ المدفوع</label>
                                                    <input type="number" id="salePaidAmount" class="form-control" min="0" step="0.01" value="0">
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="form-group">
                                                    <label for="saleDueDate" class="form-label">تاريخ الاستحقاق</label>
                                                    <input type="date" id="saleDueDate" class="form-control">
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="form-group">
                                                    <label for="saleRemainingAmount" class="form-label">المبلغ المتبقي</label>
                                                    <input type="number" id="saleRemainingAmount" class="form-control" readonly style="background-color: #f8f9fa;">
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Payment Account (for partial payments) -->
                                        <div class="row mt-2">
                                            <div class="col-md-6">
                                                <div class="form-group">
                                                    <label for="salePaymentAccountDisplay" class="form-label">حساب الدفع (للدفعات الجزئية)</label>
                                                    <div class="input-group">
                                                        <input type="text" class="form-control" id="salePaymentAccountDisplay" placeholder="اختر من شجرة الحسابات" readonly style="background-color: #f8f9fa;">
                                                        <input type="hidden" id="salePaymentAccountId" value="">
                                                        <button type="button" class="btn btn-outline-secondary" id="openSalePaymentAccountPicker" title="اختر من شجرة الحسابات">
                                                            <i class="fas fa-sitemap"></i>
                                                        </button>
                                                    </div>
                                                    <small class="text-muted">سيتم استخدام هذا الحساب عند استلام دفعة جزئية</small>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Payment Status -->
                                        <div class="row mt-2">
                                            <div class="col-md-3">
                                                <div class="form-group">
                                                    <label for="salePaymentStatus" class="form-label">حالة الدفع</label>
                                                    <select id="salePaymentStatus" class="form-select" disabled style="background-color: #f8f9fa; cursor: not-allowed;" title="يتم تحديث حالة الدفع تلقائياً بناءً على المبلغ المدفوع">
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
                                                                        <li>مدين: حساب النقدية أو العميل</li>
                                                                        <li>دائن: حساب المبيعات</li>
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
                            <button type="button" class="btn btn-secondary" id="cancelSaleBtn" data-bs-dismiss="modal">إلغاء</button>
                            <button type="button" class="btn btn-primary" id="saveSaleBtn">
                                <i class="fas fa-save"></i> حفظ الفاتورة
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Customer Picker Modal -->
            <div class="modal fade" id="customerPickerModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-truck"></i> اختر العميل</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <input type="text" id="customerPickerSearch" class="form-control" placeholder="ابحث عن العميل...">
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
                                    <tbody id="customerPickerTableBody">
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
            
            <!-- Available Quantities Modal -->
            <div class="modal fade" id="saleAvailableQuantitiesModal" tabindex="-1">
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
                                        <strong>المنتج:</strong> <span id="saleAvailableQtyProductName">-</span>
                                    </div>
                                    <div class="col-md-4">
                                        <strong>الوحدة:</strong> <span id="saleAvailableQtyUnitName">-</span>
                                    </div>
                                    <div class="col-md-4">
                                        <strong>المستودع:</strong> <span id="saleAvailableQtyWarehouseName">-</span>
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
                                            <th>الكمية المباعة</th>
                                            <th>فاتورة الشراء</th>
                                            <th>تاريخ الشراء</th>
                                            <th>الإجراء</th>
                                        </tr>
                                    </thead>
                                    <tbody id="saleAvailableQuantitiesTableBody">
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
        const existingModal = document.getElementById('saleModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Show modal - wait a bit to ensure DOM is updated
        setTimeout(() => {
            const modalElement = document.getElementById('saleModal');
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement, {
                    backdrop: true,
                    keyboard: true,
                    focus: true
                });
                
                // Fix for backdrop blocking interaction and accessibility
                modalElement.addEventListener('shown.bs.modal', () => {
                    // Fix accessibility: Remove aria-hidden from modal using MutationObserver
                    // Bootstrap may add it back, so we need to watch for changes
                    const observer = new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                            if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
                                if (modalElement.hasAttribute('aria-hidden')) {
                                    // Remove focus from btn-close if it has focus to prevent accessibility warning
                                    const btnClose = modalElement.querySelector('.btn-close');
                                    if (btnClose && document.activeElement === btnClose) {
                                        // Move focus to modal content instead
                                        const firstInput = modalElement.querySelector('input, select, textarea, button:not(.btn-close)');
                                        if (firstInput) {
                                            firstInput.focus();
                                        }
                                    }
                                    modalElement.removeAttribute('aria-hidden');
                                    modalElement.setAttribute('aria-modal', 'true');
                                }
                            }
                        });
                    });
                    
                    // Start observing the modal for aria-hidden changes
                    observer.observe(modalElement, {
                        attributes: true,
                        attributeFilter: ['aria-hidden']
                    });
                    
                    // Also remove it immediately and handle focus
                    const btnClose = modalElement.querySelector('.btn-close');
                    if (btnClose && document.activeElement === btnClose) {
                        // Move focus away from btn-close to prevent accessibility warning
                        const firstInput = modalElement.querySelector('input, select, textarea, button:not(.btn-close)');
                        if (firstInput) {
                            setTimeout(() => firstInput.focus(), 0);
                        }
                    }
                    modalElement.removeAttribute('aria-hidden');
                    modalElement.setAttribute('aria-modal', 'true');
                    
                    // Stop observing after 2 seconds (enough time for Bootstrap to finish)
                    setTimeout(() => {
                        observer.disconnect();
                    }, 2000);
                    
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
                            // Last backdrop (for sale modal) should be below modal
                            backdrop.style.zIndex = '1049';
                        }
                    });
                    
                    // Ensure all interactive elements are clickable
                    const interactiveElements = modalElement.querySelectorAll('input, select, textarea, button, a, table, tbody, tr, td');
                    interactiveElements.forEach(el => {
                        el.style.pointerEvents = 'auto';
                    });
                }, { once: true });
                
                // Ensure aria-hidden is removed when modal is hidden
                modalElement.addEventListener('hidden.bs.modal', () => {
                    modalElement.setAttribute('aria-hidden', 'true');
                    modalElement.removeAttribute('aria-modal');
                }, { once: false });
                
                modal.show();
            } else {
                console.error('❌ saleModal not found after insertion');
            }
        }, 50);

        // Reload suppliers to ensure we have the latest data
        this.loadCustomers().then(() => {
            // Initialize autocomplete fields after data is loaded
            // Small delay to ensure modal is fully rendered
            setTimeout(() => {
                this.initializeAutocompleteFields();
                console.log('✅ Autocomplete fields initialized');
                // Setup column resizing after modal is shown
                setTimeout(() => {
                    this.setupColumnResizing();
                }, 300);
            }, 150);
        });
        
        // Also initialize when modal is fully shown (backup)
        const modalElement = document.getElementById('saleModal');
        if (modalElement) {
            const handleModalShown = () => {
                setTimeout(async () => {
                    // Initialize autocomplete fields first
                    this.initializeAutocompleteFields();
                    console.log('✅ Autocomplete fields initialized (from modal shown event)');
                    
                    // Then apply default values after autocomplete fields are created
                    if (!this.editingSale) {
                        // Wait a bit more to ensure autocomplete fields are fully created
                        setTimeout(async () => {
                            await this.applyDefaultValues();
                        }, 200);
                    }
                    
                    // Update available quantities buttons for existing rows
                    setTimeout(() => {
                        const tbody = document.getElementById('saleItemsBody');
                        if (tbody) {
                            const rows = Array.from(tbody.children);
                            rows.forEach(row => {
                                this.updateAvailableQuantitiesButton(row);
                            });
                        }
                    }, 300);
                }, 100);
            };
            modalElement.addEventListener('shown.bs.modal', handleModalShown, { once: true });
        }

        // Setup modal event listeners
        this.setupSaleModalListeners();

        // Generate invoice number for new sale
        if (!this.editingSale) {
            this.generateSaleInvoiceNumber();
        }

        // Set today's date
        const saleDateInput = document.getElementById('saleDate');
        if (saleDateInput) {
            saleDateInput.value = new Date().toISOString().split('T')[0];
        }

        // Apply default values from settings (only for new sales)
        // Note: This is a backup call, main call is in handleModalShown after autocomplete fields are initialized
        if (!this.editingSale) {
            setTimeout(async () => {
                // Check if autocomplete fields exist before applying defaults
                const warehouseInput = document.getElementById('saleWarehouse');
                const costCenterInput = document.getElementById('saleCostCenter');
                
                // Only apply if autocomplete fields are already created
                if (warehouseInput && costCenterInput) {
                    await this.applyDefaultValues();
                }
                
                // Initialize 6 empty rows for new sale
                this.initializeEmptyRows(6);
            }, 500);
        }
    },

    /**
     * Calculate sale totals (subtotal, discounts, additions, final total)
     */
    calculateSaleTotals() {
        const tbody = document.getElementById('saleItemsBody');
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
        const invoiceCurrency = document.getElementById('saleCurrency')?.value || 'IQD';
        const invoiceExchangeRate = parseFloat(document.getElementById('saleExchangeRate')?.value) || 1;
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
        document.getElementById('saleSubtotal').textContent = subtotal.toFixed(2);
        document.getElementById('subtotalCurrency').textContent = invoiceCurrency;
        
        document.getElementById('totalDiscounts').textContent = totalDiscounts.toFixed(2);
        document.getElementById('discountCurrency').textContent = invoiceCurrency;
        
        document.getElementById('totalAdditions').textContent = totalAdditions.toFixed(2);
        document.getElementById('additionCurrency').textContent = invoiceCurrency;
        
        document.getElementById('saleTotal').textContent = finalTotal.toFixed(2);
        document.getElementById('totalCurrency').textContent = invoiceCurrency;
        
        // Update remaining amount
        this.calculateRemainingAmount();
    },

    /**
     * Initialize empty rows for new sale
     */
    initializeEmptyRows(count = 6) {
        const tbody = document.getElementById('saleItemsBody');
        if (!tbody) return;
        
        // Clear existing rows if any
        tbody.innerHTML = '';
        
        // Add empty rows
        for (let i = 0; i < count; i++) {
            this.addSaleItem();
        }
        
        // Setup scroll buttons after rows are added
        this.setupTableScrollButtons();
        this.setupColumnResizing();
        
        console.log(`✅ Initialized ${count} empty rows`);
    },


    /**
     * Update product historical prices after sale
     */
    async updateProductHistoricalPrices(saleData) {
        try {
            console.log('📊 Updating product historical prices for sale:', saleData.invoiceNo);
            
            if (!saleData.items || saleData.items.length === 0) {
                return;
            }

            for (const item of saleData.items) {
                const product = await Collections.getProduct(item.productId);
                if (!product) {
                    console.warn(`⚠️ Product ${item.productId} not found, skipping price update`);
                    continue;
                }

                // Get all sales for this product to calculate average
                const allSales = await db.collection('sales')
                    .where('status', '==', 'completed')
                    .get();
                
                let totalSalePrice = 0;
                let saleCount = 0;
                let lastSalePrice = item.unitPrice || 0;

                allSales.forEach(doc => {
                    const sale = doc.data();
                    if (sale.items && Array.isArray(sale.items)) {
                        sale.items.forEach(saleItem => {
                            if (saleItem.productId === item.productId) {
                                totalSalePrice += (saleItem.unitPrice || 0);
                                saleCount++;
                                // Get the most recent sale price
                                const saleDate = sale.date ? new Date(sale.date) : new Date(0);
                                const currentDate = saleData.date ? new Date(saleData.date) : new Date();
                                if (saleDate <= currentDate) {
                                    lastSalePrice = saleItem.unitPrice || 0;
                                }
                            }
                        });
                    }
                });

                // Calculate average sale price
                const averageSale = saleCount > 0 ? totalSalePrice / saleCount : item.unitPrice || 0;

                // Get all purchases for this product to calculate average purchase
                const allPurchases = await db.collection('purchases')
                    .where('status', '==', 'completed')
                    .get();
                
                let totalPurchasePrice = 0;
                let purchaseCount = 0;
                let lastPurchasePrice = product.lastPurchasePrice || 0;

                allPurchases.forEach(doc => {
                    const purchase = doc.data();
                    if (purchase.items && Array.isArray(purchase.items)) {
                        purchase.items.forEach(purchaseItem => {
                            if (purchaseItem.productId === item.productId) {
                                totalPurchasePrice += (purchaseItem.unitPrice || 0);
                                purchaseCount++;
                                // Get the most recent purchase price
                                const purchaseDate = purchase.date ? new Date(purchase.date) : new Date(0);
                                const currentDate = saleData.date ? new Date(saleData.date) : new Date();
                                if (purchaseDate <= currentDate) {
                                    lastPurchasePrice = purchaseItem.unitPrice || 0;
                                }
                            }
                        });
                    }
                });

                // Calculate average purchase price
                const averagePurchase = purchaseCount > 0 ? totalPurchasePrice / purchaseCount : product.lastPurchasePrice || 0;

                // Update product with historical prices
                await db.collection('products').doc(item.productId).update({
                    lastSalePrice: lastSalePrice,
                    averageSale: averageSale,
                    lastPurchasePrice: lastPurchasePrice,
                    averagePurchase: averagePurchase,
                    lastUpdated: new Date()
                });

                console.log(`✅ Updated historical prices for product: ${product.name}`);
            }
            
            console.log('✅ Product historical prices updated successfully');
            
        } catch (error) {
            console.error('❌ Error updating product historical prices:', error);
            // Don't throw error - price history update is not critical
        }
    },

    /**
     * Update inventory after sale (subtract stock and record movement)
     */
    async updateInventory(saleData) {
        try {
            console.log('📦 Updating inventory for sale:', saleData.invoiceNo);
            
            // Check if auto-update stock is enabled
            const settings = await this.getSettings();
            if (!settings.autoUpdateStock) {
                console.log('ℹ️ Auto-update stock is disabled, skipping inventory update');
                return;
            }
            
            if (!saleData.items || saleData.items.length === 0) {
                console.warn('⚠️ No items to update inventory');
                return;
            }

            const warehouseId = saleData.warehouseId || 'default';

            for (const item of saleData.items) {
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
                let quantityInMainUnit = item.quantity;
                if (item.unitId && item.unitId !== product.unitId) {
                    // Find the sub-unit to get conversion factor
                    const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
                    if (subUnit && subUnit.conversionFactor && subUnit.conversionFactor > 0) {
                        // Convert from sub-unit to main unit based on conversionType
                        const conversionType = subUnit.conversionType || 'multiply';
                        if (conversionType === 'multiply') {
                            quantityInMainUnit = item.quantity * subUnit.conversionFactor;
                        } else if (conversionType === 'divide') {
                            quantityInMainUnit = item.quantity / subUnit.conversionFactor;
                        } else {
                            // Default to multiply for backward compatibility
                            quantityInMainUnit = item.quantity * subUnit.conversionFactor;
                        }
                        console.log(`🔄 Converting ${item.quantity} ${item.unitId} to ${quantityInMainUnit} ${product.unitId} (type: ${conversionType}, factor: ${subUnit.conversionFactor})`);
                    } else {
                        console.warn(`⚠️ Conversion factor not found or invalid for unit ${item.unitId}, using quantity as-is`);
                    }
                }
                
                // Get current stock before update
                const currentStock = await Collections.getProductWarehouseStock(item.productId);
                const stockInWarehouse = currentStock?.[warehouseId] || 0;
                const previousQuantity = stockInWarehouse;
                
                // Check if enough stock is available (unless allowSaleWithoutStock is enabled)
                if (stockInWarehouse < quantityInMainUnit) {
                    if (!settings.allowSaleWithoutStock) {
                        throw new Error(`الكمية المتاحة غير كافية للمنتج ${product.name}. المتاح: ${stockInWarehouse}, المطلوب: ${quantityInMainUnit}`);
                    } else {
                        console.warn(`⚠️ Warning: Insufficient stock for product ${product.name}. Available: ${stockInWarehouse}, Required: ${quantityInMainUnit}. Sale allowed due to allowSaleWithoutStock setting.`);
                    }
                }
                
                const newQuantity = previousQuantity - quantityInMainUnit;
                
                // Update product stock (always in main unit) - subtract for sales
                await Collections.updateProductWarehouseStock(
                    item.productId,
                    warehouseId,
                    quantityInMainUnit,
                    'subtract'
                );
                
                // Record inventory movement
                const warehouse = await Collections.getWarehouse(warehouseId);
                const warehouseName = warehouse?.name || 'المستودع الافتراضي';
                
                const movementRecord = {
                    type: 'out',
                    productId: item.productId,
                    productName: product.name,
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
                    reference: saleData.invoiceNo || `فاتورة مبيعات ${saleData.id || ''}`,
                    notes: `فاتورة مبيعات - ${saleData.customerName || ''}`,
                    date: saleData.date ? new Date(saleData.date) : new Date(),
                    userId: auth.currentUser?.uid || 'system',
                    createdAt: new Date(),
                    sourceType: 'sale',
                    sourceId: saleData.id || null
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
                console.log(`📝 Inventory movement recorded for sale: ${product.name}`);
            }
            
            console.log('✅ Inventory updated successfully for sale');
            
        } catch (error) {
            console.error('❌ Error updating inventory for sale:', error);
            throw error;
        }
    },

    /**
     * Collect sale form data
     */
    collectSaleData() {
        // Similar to collectPurchaseData but for sales
        const items = [];
        const tbody = document.getElementById('saleItemsBody');
        if (!tbody) return {};
        
        const rows = tbody.children;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const productHiddenInput = row.querySelector('.product-select-id');
            const productId = productHiddenInput?.value || '';
            const productInput = row.querySelector('.product-display-input');
            const productName = productInput?.value || '';
            
            const quantity = parseFloat(row.querySelector('.quantity-input')?.value) || 0;
            const price = parseFloat(row.querySelector('.price-input')?.value) || 0;
            const discountPercent = parseFloat(row.querySelector('.discount-percent-input')?.value) || 0;
            const discountAmount = parseFloat(row.querySelector('.discount-amount-input')?.value) || 0;
            const additionPercent = parseFloat(row.querySelector('.addition-percent-input')?.value) || 0;
            const additionAmount = parseFloat(row.querySelector('.addition-amount-input')?.value) || 0;
            const total = parseFloat(row.querySelector('.total-input')?.value) || 0;
            
            const unitHiddenInput = row.querySelector('.unit-select-id');
            const unitId = unitHiddenInput?.value || '';
            
            const expiryDateInput = row.querySelector('.expiry-date-input');
            const serialNumberInput = row.querySelector('.serial-number-input');
            const notesInput = row.querySelector('.notes-input');

            if (productId && quantity > 0 && price > 0) {
                const product = this.products.find(p => p.id === productId);
                const productCurrency = product?.currency || 'IQD';
                const originalUnitPrice = parseFloat(row.dataset.unitPrice) || price;
                const originalCurrency = row.dataset.unitCurrency || productCurrency;
                const invoiceCurrency = document.getElementById('saleCurrency')?.value || 'IQD';
                const invoiceExchangeRate = parseFloat(document.getElementById('saleExchangeRate')?.value) || 1;
                
                items.push({
                    productId: productId,
                    productName: productName,
                    quantity: quantity,
                    unitId: unitId,
                    unitPrice: price,
                    originalUnitPrice: originalUnitPrice,
                    originalCurrency: originalCurrency,
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
        const discountRows = document.querySelectorAll('#saleDiscountsAdditionsBody tr');
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

        // Calculate totals
        let totalDiscounts = 0;
        let totalAdditions = 0;
        discountAdditionRows.forEach(row => {
            if (row.type === 'discount') {
                totalDiscounts += row.amount;
            } else if (row.type === 'addition') {
                totalAdditions += row.amount;
            }
        });

        const total = parseFloat(document.getElementById('saleTotal')?.textContent) || 0;
        const paidAmount = parseFloat(document.getElementById('salePaidAmount')?.value) || 0;
        let paymentStatus = 'unpaid';
        if (paidAmount >= total) {
            paymentStatus = 'paid';
        } else if (paidAmount > 0) {
            paymentStatus = 'partial';
        }

        const customerId = document.getElementById('saleCustomerId')?.value || '';
        const customerDisplay = document.getElementById('saleCustomerDisplay');
        let customerName = customerDisplay?.value || '';
        if (!customerName && customerId) {
            const customer = this.customers.find(c => c.id === customerId);
            customerName = customer?.name || '';
        }
        
        const warehouseId = document.getElementById('saleWarehouseId')?.value || '';
        const costCenterId = document.getElementById('saleCostCenterId')?.value || '';
        const salesRep1Id = document.getElementById('saleSalesRep1Id')?.value || '';
        const salesRep2Id = document.getElementById('saleSalesRep2Id')?.value || '';
        const paymentAccountId = document.getElementById('salePaymentAccountId')?.value || '';

        return {
            invoiceNo: document.getElementById('saleInvoiceNo')?.value.trim() || '',
            date: document.getElementById('saleDate')?.value || '',
            customerId: customerId,
            customerName: customerName,
            currency: document.getElementById('saleCurrency')?.value || 'IQD',
            exchangeRate: parseFloat(document.getElementById('saleExchangeRate')?.value) || 1,
            warehouseId: warehouseId,
            costCenterId: costCenterId,
            salesRep1Id: salesRep1Id,
            salesRep2Id: salesRep2Id,
            items: items,
            subtotal: parseFloat(document.getElementById('saleSubtotal')?.textContent) || 0,
            totalDiscounts: totalDiscounts,
            totalAdditions: totalAdditions,
            discountAdditionRows: discountAdditionRows,
            total: total,
            notes: document.getElementById('saleNotes')?.value.trim() || '',
            status: 'completed',
            paymentMethod: document.getElementById('salePaymentMethod')?.value || 'cash',
            paidAmount: paidAmount,
            remainingAmount: parseFloat(document.getElementById('saleRemainingAmount')?.value) || 0,
            paymentStatus: paymentStatus,
            paymentAccountId: paymentAccountId,
            dueDate: document.getElementById('saleDueDate')?.value || null,
            createdAt: new Date(),
            createdBy: auth.currentUser?.uid || 'system'
        };
    },

    /**
     * Validate sale form
     */
    async validateSaleForm(data) {
        if (!data.invoiceNo) {
            if (typeof showError === 'function') {
                showError('رقم الفاتورة مطلوب');
            }
            return false;
        }

        if (!data.date) {
            if (typeof showError === 'function') {
                showError('تاريخ الفاتورة مطلوب');
            }
            return false;
        }

        // Customer is required only for credit payments
        if (data.paymentMethod === 'credit') {
            if (!data.customerId) {
                if (typeof showError === 'function') {
                    showError('العميل مطلوب في حالة الدفع الآجل');
                }
                return false;
            }
            
            const customer = this.customers.find(c => c.id === data.customerId);
            if (!customer) {
                if (typeof showError === 'function') {
                    showError('العميل المحدد غير موجود');
                }
                return false;
            }
            
            if (!customer.subAccountId) {
                if (typeof showError === 'function') {
                    showError(`العميل "${customer.name}" لا يحتوي على حساب محاسبي مرتبط (حساب فرعي). يرجى إنشاء حساب فرعي للعميل من بطاقة العميل أولاً.`);
                }
                return false;
            }
            
            const customerAccount = this.accounts.find(a => a.id === customer.subAccountId);
            if (!customerAccount) {
                if (typeof showError === 'function') {
                    showError(`حساب العميل المرتبط في بطاقة العميل "${customer.name}" غير موجود في قائمة الحسابات. يرجى التحقق من إعدادات العميل.`);
                }
                return false;
            }
        }

        if (!data.items || data.items.length === 0) {
            if (typeof showError === 'function') {
                showError('يجب إضافة منتج واحد على الأقل');
            }
            return false;
        }

        // Get settings to check if sale without stock is allowed
        const settings = await this.getSettings();
        const allowSaleWithoutStock = settings.allowSaleWithoutStock || false;

        // Validate each item - check stock availability and tracking constraints
        for (let i = 0; i < data.items.length; i++) {
            const item = data.items[i];
            
            if (!item.productId) {
                if (typeof showError === 'function') {
                    showError(`الصف ${i + 1}: يجب تحديد منتج`);
                }
                return false;
            }
            
            if (!item.quantity || item.quantity <= 0) {
                if (typeof showError === 'function') {
                    showError(`الصف ${i + 1}: الكمية يجب أن تكون أكبر من صفر`);
                }
                return false;
            }
            
            if (!item.unitId) {
                if (typeof showError === 'function') {
                    showError(`الصف ${i + 1}: يجب تحديد وحدة`);
                }
                return false;
            }
            
            if (!item.unitPrice || item.unitPrice <= 0) {
                if (typeof showError === 'function') {
                    showError(`الصف ${i + 1}: السعر يجب أن يكون أكبر من صفر`);
                }
                return false;
            }

            // Get product to check unit conversion and tracking
            const product = await Collections.getProduct(item.productId);
            if (!product) {
                if (typeof showError === 'function') {
                    showError(`الصف ${i + 1}: المنتج غير موجود`);
                }
                return false;
            }

            // Validate that product has a main unit (required)
            if (!product.unitId) {
                if (typeof showError === 'function') {
                    showError(`الصف ${i + 1}: المنتج "${item.productName}" لا يحتوي على وحدة أساسية. يجب إضافة وحدة أساسية للمنتج قبل استخدامه في المبيعات.`);
                }
                return false;
            }

            // Get warehouse ID from form data
            const warehouseId = data.warehouseId || 'default';

            // Check stock availability (unless allowed to sell without stock)
            if (!allowSaleWithoutStock) {
                // Get current stock in warehouse
                const warehouseStockObj = await Collections.getProductWarehouseStock(item.productId);
                const currentStock = warehouseStockObj?.[warehouseId] || 0;

                // Convert sale quantity to main unit
                let quantityInMainUnit = item.quantity;
                if (item.unitId && item.unitId !== product.unitId) {
                    const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
                    if (subUnit && subUnit.conversionFactor && subUnit.conversionFactor > 0) {
                        // تحديد نوع التحويل: ضرب أو قسمة
                        if (subUnit.conversionType === 'multiply') {
                            // الوحدة الفرعية أكبر من الأساسية (مثل: صندوق = 12 قطعة)
                            quantityInMainUnit = item.quantity * subUnit.conversionFactor;
                        } else {
                            // الوحدة الفرعية أصغر من الأساسية (مثل: كيلوغرام مقابل طن)
                            quantityInMainUnit = item.quantity / subUnit.conversionFactor;
                        }
                    }
                }

                if (currentStock < quantityInMainUnit) {
                    const unit = this.units?.find(u => u.id === product.unitId);
                    const unitName = unit ? unit.name : 'N/A';
                    if (typeof showError === 'function') {
                        showError(
                            `الصف ${i + 1}: الرصيد المتاح للمنتج "${item.productName}" في المستودع المختار غير كافٍ.\n` +
                            `الرصيد الحالي: ${formatNumber(currentStock)} ${unitName}\n` +
                            `الكمية المطلوبة للبيع: ${formatNumber(quantityInMainUnit)} ${unitName}`
                        );
                    }
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
                    if (typeof showError === 'function') {
                        showError(`الصف ${i + 1}: تاريخ الصلاحية مطلوب للمنتج "${item.productName}"`);
                    }
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
                        let quantityInMainUnit = item.quantity;
                        if (item.unitId && item.unitId !== product.unitId) {
                            const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
                            if (subUnit && subUnit.conversionFactor && subUnit.conversionFactor > 0) {
                                if (subUnit.conversionType === 'multiply') {
                                    quantityInMainUnit = item.quantity * subUnit.conversionFactor;
                                } else {
                                    quantityInMainUnit = item.quantity / subUnit.conversionFactor;
                                }
                            }
                        }
                        
                        if (totalAvailable < quantityInMainUnit) {
                            const unit = this.units?.find(u => u.id === product.unitId);
                            const unitName = unit ? unit.name : 'N/A';
                            if (typeof showError === 'function') {
                                showError(
                                    `الصف ${i + 1}: المنتج "${item.productName}" مع التاريخ "${formatDate(new Date(item.expiryDate))}" ` +
                                    `غير متاح بالكمية المطلوبة في المستودع المختار.\n` +
                                    `الكمية المتاحة: ${formatNumber(totalAvailable)} ${unitName}\n` +
                                    `الكمية المطلوبة: ${formatNumber(quantityInMainUnit)} ${unitName}`
                                );
                            }
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
                        if (typeof showError === 'function') {
                            showError(`خطأ في التحقق من توفر المنتج "${item.productName}" في المخزون`);
                        }
                        return false;
                    }
                }
            }
            
            // الحالة الثالثة: لا يملك تاريخ صلاحية ويملك رقم تسلسلي
            else if (!hasExpiry && hasSerial) {
                // التحقق من إجبارية الرقم التسلسلي
                if (forceSerial) {
                    if (!item.serialNumber || item.serialNumber.trim() === '') {
                        if (typeof showError === 'function') {
                            showError(`الصف ${i + 1}: الرقم التسلسلي مطلوب للمنتج "${item.productName}"`);
                        }
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
                        let quantityInMainUnit = item.quantity;
                        if (item.unitId && item.unitId !== product.unitId) {
                            const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
                            if (subUnit && subUnit.conversionFactor && subUnit.conversionFactor > 0) {
                                if (subUnit.conversionType === 'multiply') {
                                    quantityInMainUnit = item.quantity * subUnit.conversionFactor;
                                } else {
                                    quantityInMainUnit = item.quantity / subUnit.conversionFactor;
                                }
                            }
                        }
                        
                        if (totalAvailable < quantityInMainUnit) {
                            const unit = this.units?.find(u => u.id === product.unitId);
                            const unitName = unit ? unit.name : 'N/A';
                            if (typeof showError === 'function') {
                                showError(
                                    `الصف ${i + 1}: المنتج "${item.productName}" مع الرقم التسلسلي "${item.serialNumber}" ` +
                                    `غير متاح بالكمية المطلوبة في المستودع المختار.\n` +
                                    `الكمية المتاحة: ${formatNumber(totalAvailable)} ${unitName}\n` +
                                    `الكمية المطلوبة: ${formatNumber(quantityInMainUnit)} ${unitName}`
                                );
                            }
                            return false;
                        }
                    } catch (error) {
                        console.error('Error validating inventory items with serial number:', error);
                        if (typeof showError === 'function') {
                            showError(`خطأ في التحقق من توفر المنتج "${item.productName}" في المخزون`);
                        }
                        return false;
                    }
                }
            }
            
            // الحالة الرابعة: يملك تاريخ صلاحية ورقم تسلسلي معاً
            else if (hasExpiry && hasSerial) {
                // التحقق من إجبارية القيم
                if (forceExpiry && !item.expiryDate) {
                    if (typeof showError === 'function') {
                        showError(`الصف ${i + 1}: تاريخ الصلاحية مطلوب للمنتج "${item.productName}"`);
                    }
                    return false;
                }
                if (forceSerial && (!item.serialNumber || item.serialNumber.trim() === '')) {
                    if (typeof showError === 'function') {
                        showError(`الصف ${i + 1}: الرقم التسلسلي مطلوب للمنتج "${item.productName}"`);
                    }
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
                            if (typeof showError === 'function') {
                                showError(
                                    `الصف ${i + 1}: المنتج "${item.productName}" مع التاريخ "${formatDate(new Date(item.expiryDate))}" ` +
                                    `والرقم التسلسلي "${item.serialNumber}" غير موجود في المستودع المختار.`
                                );
                            }
                            return false;
                        }
                        
                        // تحويل الكمية إلى الوحدة الأساسية للتحقق
                        let quantityInMainUnit = item.quantity;
                        if (item.unitId && item.unitId !== product.unitId) {
                            const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
                            if (subUnit && subUnit.conversionFactor && subUnit.conversionFactor > 0) {
                                if (subUnit.conversionType === 'multiply') {
                                    quantityInMainUnit = item.quantity * subUnit.conversionFactor;
                                } else {
                                    quantityInMainUnit = item.quantity / subUnit.conversionFactor;
                                }
                            }
                        }
                        
                        if (matchingItem.quantity < quantityInMainUnit) {
                            const unit = this.units?.find(u => u.id === product.unitId);
                            const unitName = unit ? unit.name : '';
                            if (typeof showError === 'function') {
                                showError(
                                    `الصف ${i + 1}: المنتج "${item.productName}" مع التاريخ "${formatDate(new Date(item.expiryDate))}" ` +
                                    `والرقم التسلسلي "${item.serialNumber}" غير متاح بالكمية المطلوبة.\n` +
                                    `الكمية المتاحة: ${formatNumber(matchingItem.quantity)} ${unitName}\n` +
                                    `الكمية المطلوبة: ${formatNumber(quantityInMainUnit)} ${unitName}`
                                );
                            }
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
                        if (typeof showError === 'function') {
                            showError(`خطأ في التحقق من توفر المنتج "${item.productName}" في المخزون`);
                        }
                        return false;
                    }
                }
            }
        }

        return true;
    },

    /**
     * Save sale
     */
    async saveSale() {
        try {
            const formData = this.collectSaleData();
            
            if (!(await this.validateSaleForm(formData))) {
                return;
            }

            showLoading();

            let generalEntryId = null;
            let saleId = null;

            if (this.editingSale) {
                // Update sale
                saleId = this.editingSale.id;
                formData.id = saleId;
                
                // Update inventory: reverse old quantities and apply new quantities
                await this.updateInventoryOnEdit(this.editingSale, formData);
                
                await Collections.updateSale(this.editingSale.id, formData);
                
                // Update or recreate general entry if it exists
                await this.updateOrCreateGeneralEntry(formData);
                
                if (typeof showSuccess === 'function') {
                    showSuccess('تم تحديث فاتورة المبيعات بنجاح');
                }
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('saleModal'));
                if (modal) {
                    modal.hide();
                }
                this.cancelSaleForm();
            } else {
                // Add new sale
                const saleResult = await Collections.addSale(formData);
                
                // Extract ID from result
                if (typeof saleResult === 'string') {
                    saleId = saleResult;
                } else if (saleResult && typeof saleResult === 'object') {
                    saleId = saleResult.id || saleResult.toString?.() || String(saleResult);
                    if (saleId === '[object Object]' || saleId.includes('[object')) {
                        saleId = saleResult.id || null;
                        if (!saleId) {
                            throw new Error('فشل في الحصول على معرف فاتورة المبيعات');
                        }
                    }
                } else {
                    saleId = String(saleResult);
                }
                
                saleId = String(saleId);
                formData.id = saleId;
                
                console.log(`📝 Sale saved with ID: ${saleId}`);
                
                // Update inventory for new sale
                await this.updateInventory(formData);
                
                // Update product historical prices
                await this.updateProductHistoricalPrices(formData);
                
                // Generate general entry for sale
                generalEntryId = await this.generateGeneralEntry(formData);
                
                if (typeof showSuccess === 'function') {
                    showSuccess('تم إضافة فاتورة المبيعات بنجاح');
                }
                
                // Show generated general entry if it was created
                if (generalEntryId) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('saleModal'));
                    if (modal) {
                        modal.hide();
                        const modalElement = document.getElementById('saleModal');
                        if (modalElement) {
                            modalElement.addEventListener('hidden.bs.modal', async () => {
                                setTimeout(async () => {
                                    try {
                                        await this.showGeneratedGeneralEntry(saleId);
                                    } catch (error) {
                                        console.error('❌ Error showing general entry dialog:', error);
                                        this.cancelSaleForm();
                                    }
                                }, 400);
                            }, { once: true });
                        }
                    }
                } else {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('saleModal'));
                    if (modal) {
                        modal.hide();
                    }
                    this.cancelSaleForm();
                }
            }

            // Reload data
            this.loadSales().catch(err => console.error('Error reloading sales:', err));
            this.loadCustomers().catch(err => console.error('Error reloading customers:', err));
            this.updateDashboard();

            hideLoading();

        } catch (error) {
            console.error('❌ Error saving sale:', error);
            hideLoading();
            
            if (typeof showError === 'function') {
                showError('فشل في حفظ فاتورة المبيعات: ' + (error.message || 'خطأ غير معروف'));
            } else if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'خطأ في الحفظ',
                    text: 'فشل في حفظ فاتورة المبيعات: ' + (error.message || 'خطأ غير معروف'),
                    icon: 'error',
                    confirmButtonText: 'حسناً'
                });
            } else {
                alert('فشل في حفظ فاتورة المبيعات: ' + (error.message || 'خطأ غير معروف'));
            }
        }
    },

    /**
     * Populate sale form with data for editing
     */
    async populateSaleForm() {
        if (!this.editingSale) return;

        // Populate header fields
        const saleInvoiceNo = document.getElementById('saleInvoiceNo');
        const saleDate = document.getElementById('saleDate');
        const saleCurrency = document.getElementById('saleCurrency');
        const saleNotes = document.getElementById('saleNotes');
        
        if (saleInvoiceNo) saleInvoiceNo.value = this.editingSale.invoiceNo || '';
        if (saleDate) saleDate.value = this.editingSale.date || '';
        if (saleCurrency) saleCurrency.value = this.editingSale.currency || 'IQD';
        if (saleNotes) saleNotes.value = this.editingSale.notes || '';
        
        // Populate picker fields
        // Customer
        if (this.editingSale.customerId) {
            const customer = this.customers.find(c => c.id === this.editingSale.customerId);
            if (customer) {
                const customerDisplay = document.getElementById('saleCustomerDisplay');
                const customerIdInput = document.getElementById('saleCustomerId');
                if (customerDisplay) customerDisplay.value = customer.name;
                if (customerIdInput) customerIdInput.value = customer.id;
            }
        }
        
        // Warehouse
        if (this.editingSale.warehouseId) {
            const warehouse = this.warehouses.find(w => w.id === this.editingSale.warehouseId);
            if (warehouse) {
                const warehouseDisplay = document.getElementById('saleWarehouseDisplay');
                const warehouseIdInput = document.getElementById('saleWarehouseId');
                if (warehouseDisplay) warehouseDisplay.value = warehouse.name;
                if (warehouseIdInput) warehouseIdInput.value = warehouse.id;
            }
        }
        
        // Cost Center
        if (this.editingSale.costCenterId) {
            const costCenter = this.costCenters.find(c => c.id === this.editingSale.costCenterId);
            if (costCenter) {
                const costCenterDisplay = document.getElementById('saleCostCenterDisplay');
                const costCenterIdInput = document.getElementById('saleCostCenterId');
                if (costCenterDisplay) costCenterDisplay.value = costCenter.name;
                if (costCenterIdInput) costCenterIdInput.value = costCenter.id;
            }
        }

        // Populate summary fields
        const subtotalEl = document.getElementById('saleSubtotal');
        const totalEl = document.getElementById('saleTotal');
        if (subtotalEl) subtotalEl.textContent = (this.editingSale.subtotal || 0).toFixed(2);
        if (totalEl) totalEl.textContent = (this.editingSale.total || 0).toFixed(2);

        // Populate payment fields
        const paymentMethodEl = document.getElementById('salePaymentMethod');
        const paidAmountEl = document.getElementById('salePaidAmount');
        const remainingAmountEl = document.getElementById('saleRemainingAmount');
        const dueDateEl = document.getElementById('saleDueDate');
        
        if (paymentMethodEl) paymentMethodEl.value = this.editingSale.paymentMethod || 'cash';
        if (paidAmountEl) paidAmountEl.value = this.editingSale.paidAmount || 0;
        if (remainingAmountEl) remainingAmountEl.value = this.editingSale.remainingAmount || 0;
        if (dueDateEl) dueDateEl.value = this.editingSale.dueDate || '';
        
        // Payment account
        if (this.editingSale.paymentAccountId) {
            const paymentAccount = this.accounts.find(a => a.id === this.editingSale.paymentAccountId);
            if (paymentAccount) {
                const paymentAccountDisplay = document.getElementById('salePaymentAccountDisplay');
                const paymentAccountIdInput = document.getElementById('salePaymentAccountId');
                if (paymentAccountDisplay) paymentAccountDisplay.value = paymentAccount.name;
                if (paymentAccountIdInput) paymentAccountIdInput.value = paymentAccount.id;
            }
        }

        // Clear existing items
        const tbody = document.getElementById('saleItemsBody');
        if (tbody) {
            tbody.innerHTML = '';
        }

        // Add items
        if (this.editingSale.items && this.editingSale.items.length > 0) {
            // Use async forEach to handle product loading
            const populateItems = async () => {
                for (const item of this.editingSale.items) {
                    this.addSaleItem();
                    const lastRow = tbody.lastElementChild;
                    if (!lastRow) continue;
                    
                    // Populate item data using autocomplete
                    const product = this.products.find(p => p.id === item.productId);
                    if (product) {
                        const productInput = lastRow.querySelector('.product-display-input');
                        const productHiddenInput = lastRow.querySelector('.product-select-id');
                        if (productInput) productInput.value = `${product.name}${product.code ? ' - ' + product.code : ''}`;
                        if (productHiddenInput) productHiddenInput.value = product.id;
                        
                        // Trigger product selection to load units
                        if (typeof this.handleProductSelection === 'function') {
                            await this.handleProductSelection(lastRow, product);
                        }
                        
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
                                const fullProduct = await Collections.getProduct(product.id);
                                if (fullProduct && typeof this.handleUnitSelection === 'function') {
                                    const availableUnits = [];
                                    const productCurrency = fullProduct.currency || 'IQD';
                                    const hasSubUnits = fullProduct.subUnits && fullProduct.subUnits.length > 0;
                                    
                                    if (fullProduct.unitId) {
                                        const mainUnit = this.units.find(u => u.id === fullProduct.unitId);
                                        if (mainUnit) {
                                            availableUnits.push({
                                                unit: mainUnit,
                                                price: fullProduct.salePrice || 0,
                                                currency: productCurrency,
                                                conversion: 1,
                                                conversionType: 'multiply',
                                                isMain: true
                                            });
                                        }
                                    }
                                    
                                    if (hasSubUnits) {
                                        const mainUnitPrice = fullProduct.salePrice || 0;
                                        fullProduct.subUnits.forEach(subUnit => {
                                            const unit = this.units.find(u => u.id === subUnit.unitId);
                                            if (unit) {
                                                let subUnitPrice;
                                                if (subUnit.salePrice !== undefined && subUnit.salePrice !== null && subUnit.salePrice > 0) {
                                                    subUnitPrice = subUnit.salePrice;
                                                } else {
                                                    const conversionType = subUnit.conversionType || 'multiply';
                                                    const conversionFactor = parseFloat(subUnit.conversionFactor) || 1;
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
                                                    conversion: parseFloat(subUnit.conversionFactor) || 1,
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
                    if (typeof this.calculateSaleItemTotal === 'function') {
                        this.calculateSaleItemTotal(lastRow);
                    }
                }
                
                // Recalculate totals after populating items
                setTimeout(() => {
                    if (typeof this.calculateSaleTotals === 'function') {
                        this.calculateSaleTotals();
                    }
                }, 100);
            };
            
            populateItems();
        }

        // Clear existing discount/addition rows
        const discountsAdditionsBody = document.getElementById('discountsAdditionsBody');
        if (discountsAdditionsBody) {
            discountsAdditionsBody.innerHTML = '';
        }

        // Populate discount/addition rows
        if (this.editingSale.discountAdditionRows && this.editingSale.discountAdditionRows.length > 0) {
            const populateDiscountsAdditions = async () => {
                for (const row of this.editingSale.discountAdditionRows) {
                    if (row.type === 'discount') {
                        if (typeof this.addSaleDiscount === 'function') {
                            this.addSaleDiscount();
                        }
                    } else if (row.type === 'addition') {
                        if (typeof this.addSaleAddition === 'function') {
                            this.addSaleAddition();
                        }
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
                    }
                }
                
                // Recalculate totals after populating discounts/additions
                setTimeout(() => {
                    if (typeof this.calculateSaleTotals === 'function') {
                        this.calculateSaleTotals();
                    }
                }, 100);
            };
            
            populateDiscountsAdditions();
        }
    },

    /**
     * Cancel sale form
     */
    cancelSaleForm() {
        this.editingSale = null;
        this.currentSaleItems = [];
        this.copiedRows = [];
        
        // Reset form fields
        const saleInvoiceNo = document.getElementById('saleInvoiceNo');
        const saleDate = document.getElementById('saleDate');
        const saleCustomerDisplay = document.getElementById('saleCustomerDisplay');
        const saleCustomerId = document.getElementById('saleCustomerId');
        const saleWarehouseDisplay = document.getElementById('saleWarehouseDisplay');
        const saleWarehouseId = document.getElementById('saleWarehouseId');
        const saleCostCenterDisplay = document.getElementById('saleCostCenterDisplay');
        const saleCostCenterId = document.getElementById('saleCostCenterId');
        const saleCurrency = document.getElementById('saleCurrency');
        const saleNotes = document.getElementById('saleNotes');
        const salePaymentMethod = document.getElementById('salePaymentMethod');
        const salePaidAmount = document.getElementById('salePaidAmount');
        const saleRemainingAmount = document.getElementById('saleRemainingAmount');
        const saleDueDate = document.getElementById('saleDueDate');
        
        if (saleInvoiceNo) saleInvoiceNo.value = '';
        if (saleDate) saleDate.value = new Date().toISOString().split('T')[0];
        if (saleCustomerDisplay) saleCustomerDisplay.value = '';
        if (saleCustomerId) saleCustomerId.value = '';
        if (saleWarehouseDisplay) saleWarehouseDisplay.value = '';
        if (saleWarehouseId) saleWarehouseId.value = '';
        if (saleCostCenterDisplay) saleCostCenterDisplay.value = '';
        if (saleCostCenterId) saleCostCenterId.value = '';
        if (saleCurrency) saleCurrency.value = 'IQD';
        if (saleNotes) saleNotes.value = '';
        if (salePaymentMethod) salePaymentMethod.value = 'cash';
        if (salePaidAmount) salePaidAmount.value = '0';
        if (saleRemainingAmount) saleRemainingAmount.value = '0';
        if (saleDueDate) saleDueDate.value = '';
        
        const tbody = document.getElementById('saleItemsBody');
        if (tbody) {
            tbody.innerHTML = '';
        }
        
        const discountsBody = document.getElementById('discountsAdditionsBody');
        if (discountsBody) {
            discountsBody.innerHTML = '';
        }
        
        // Reset totals
        const subtotalEl = document.getElementById('saleSubtotal');
        const totalEl = document.getElementById('saleTotal');
        if (subtotalEl) subtotalEl.textContent = '0.00';
        if (totalEl) totalEl.textContent = '0.00';
    },

    /**
     * Get settings for sales module
     */
    async getSettings() {
        try {
            const settingsDoc = await db.collection('salesSettings').doc('default').get();
            if (settingsDoc.exists) {
                return settingsDoc.data();
            }
            // Return default settings if not found
            return {
                defaultCurrency: 'IQD',
                defaultPaymentMethod: 'cash',
                defaultWarehouse: '',
                defaultCostCenter: '',
                autoGenerateInvoiceNumbers: true,
                autoUpdateStock: true,
                autoGenerateGeneralEntry: true,
                allowSaleWithoutStock: false,
                defaultTaxRate: 0,
                defaultSalesAccountId: '',
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
                    customerName: true,
                    customerPhone: true,
                    customerAddress: true,
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
            console.error('Error loading sales settings:', error);
            return {};
        }
    },

    /**
     * Save settings to database
     */
    async saveSettings(settings) {
        try {
            await db.collection('salesSettings').doc('default').set({
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
     * Get sales account (credit account for sales/revenue)
     */
    async getSalesAccount(saleData) {
        const settings = await this.getSettings();
        const salesAccountId = settings.defaultSalesAccountId || null;
        
        if (salesAccountId) {
            const salesAccount = this.accounts.find(a => a.id === salesAccountId);
            if (salesAccount) {
                return salesAccount;
            }
        }
        
        // Auto-detect sales account
        const salesAccount = this.accounts.find(a => 
            a.type === 'revenue' && 
            (a.name.includes('مبيعات') || a.name.includes('إيرادات') || a.name.toLowerCase().includes('sales') || a.name.toLowerCase().includes('revenue'))
        );
        
        if (salesAccount) {
            return salesAccount;
        }
        
        return null;
    },

    /**
     * Generate general entry for sale
     */
    async generateGeneralEntry(saleData) {
        try {
            const generateEntry = document.getElementById('generateGeneralEntry')?.checked;
            if (!generateEntry) return null;

            console.log('📝 Generating general entry for sale:', saleData.invoiceNo);

            const paymentMethod = saleData.paymentMethod || 'cash';
            const settings = await this.getSettings();

            // Get customer account (if customer is selected)
            const customer = saleData.customerId ? this.customers.find(c => c.id === saleData.customerId) : null;
            const customerAccountId = customer?.subAccountId || null;
            const customerName = customer?.name || 'غير محدد';
            
            if (customer && !customer.subAccountId) {
                console.error(`❌ خطأ حرج: العميل "${customer.name}" لا يحتوي على حساب فرعي مرتبط!`);
                throw new Error(`العميل "${customer.name}" لا يحتوي على حساب محاسبي مرتبط (حساب فرعي). يرجى إنشاء حساب فرعي للعميل من بطاقة العميل أولاً.`);
            }

            // For credit payments, customer is required
            if (paymentMethod === 'credit' && !customerAccountId) {
                console.error('❌ Customer subAccountId not found for credit payment, cannot generate general entry');
                throw new Error('لا يمكن توليد القيد العام: العميل لا يحتوي على حساب محاسبي مرتبط (حساب فرعي). يرجى إنشاء حساب فرعي للعميل من بطاقة العميل أولاً.');
            }

            // Generate voucher number
            const voucherNumber = `GE-${saleData.invoiceNo}`;

            // Get base currency and exchange rate
            const invoiceCurrency = saleData.currency || 'IQD';
            const invoiceExchangeRate = parseFloat(saleData.exchangeRate) || 1;
            const baseCurrency = this.currencies.find(c => c.isBaseCurrency)?.code || 'IQD';
            
            // ✅ Using shared utility function from InvoiceUtils

            // Prepare general entry data
            if (!saleData.id) {
                console.error('❌ saleData.id is missing! Cannot create general entry without sourceId.');
                throw new Error('معرف فاتورة المبيعات غير موجود. لا يمكن توليد القيد العام بدون معرف الفاتورة.');
            }
            
            let sourceId = String(saleData.id);
            if (sourceId === '[object Object]' || sourceId.includes('[object')) {
                throw new Error('معرف فاتورة المبيعات غير صحيح.');
            }
            
            const entryData = {
                date: saleData.date,
                description: document.getElementById('generalEntryDescription')?.value || `فاتورة مبيعات رقم ${saleData.invoiceNo}`,
                reference: saleData.invoiceNo,
                voucherNumber: voucherNumber,
                voucherType: 'general',
                type: 'sale',
                sourceId: sourceId,
                mainCurrency: baseCurrency,
                invoiceCurrency: invoiceCurrency,
                exchangeRate: invoiceExchangeRate,
                costCenterId: saleData.costCenterId || null,
                costCenterName: saleData.costCenterId ? (this.costCenters.find(c => c.id === saleData.costCenterId)?.name || null) : null,
                entries: []
            };

            // Get sales account (credit account for sales/revenue)
            const salesAccount = await this.getSalesAccount(saleData);
            if (!salesAccount) {
                console.warn('⚠️ Sales account not found, skipping general entry generation');
                return null;
            }

            // Helper function to add account info to entry
            const addAccountInfo = (entry, accountId) => {
                const account = this.accounts.find(a => a.id === accountId);
                if (account) {
                    entry.accountName = account.name || '';
                    entry.accountCode = account.code || '';
                    entry.currency = baseCurrency;
                }
                if (saleData.costCenterId) {
                    entry.costCenterId = saleData.costCenterId;
                    const costCenter = this.costCenters.find(c => c.id === saleData.costCenterId);
                    if (costCenter) {
                        entry.costCenterName = costCenter.name || '';
                    }
                }
                return entry;
            };

            // Convert total to base currency
            const totalInBaseCurrency = InvoiceUtils.convertToBaseCurrency(saleData.total, invoiceCurrency, invoiceExchangeRate, this.currencies);

            // Handle payment method
            if (paymentMethod === 'cash') {
                // Cash Payment: Direct entry
                // Debit: Cash account (from settings or auto-detect)
                let cashAccount = null;
                const cashAccountId = settings.defaultDebitAccountId || null;
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
                    console.warn('⚠️ Cash account not found, skipping general entry generation');
                    return null;
                }
                
                let cashEntry = {
                    accountId: cashAccount.id,
                    debit: totalInBaseCurrency,
                    credit: 0,
                    originalAmount: saleData.total,
                    originalCurrency: invoiceCurrency,
                    description: `استلام نقدي - فاتورة مبيعات رقم ${saleData.invoiceNo}`
                };
                entryData.entries.push(addAccountInfo(cashEntry, cashAccount.id));

                // Credit: Sales account (total in base currency)
                let salesEntry = {
                    accountId: salesAccount.id,
                    debit: 0,
                    credit: totalInBaseCurrency,
                    originalAmount: saleData.total,
                    originalCurrency: invoiceCurrency,
                    description: customerName ? `مبيعات نقدي لـ ${customerName}` : `فاتورة مبيعات نقدي رقم ${saleData.invoiceNo}`
                };
                entryData.entries.push(addAccountInfo(salesEntry, salesAccount.id));
            } else {
                // Credit Payment: Customer account
                if (!customerAccountId) {
                    console.warn('⚠️ Customer account not found for credit payment, skipping general entry generation');
                    return null;
                }

                // Get paid amount for partial payment handling
                const paidAmount = saleData.paidAmount || 0;
                const paidAmountInBaseCurrency = InvoiceUtils.convertToBaseCurrency(paidAmount, invoiceCurrency, invoiceExchangeRate, this.currencies);
                const remainingAmountInBaseCurrency = totalInBaseCurrency - paidAmountInBaseCurrency;

                const customerAccount = this.accounts.find(a => a.id === customerAccountId);
                if (!customerAccount) {
                    console.error(`❌ حساب العميل غير موجود في قائمة الحسابات. customerAccountId: ${customerAccountId}, customerName: ${customerName}`);
                    throw new Error(`حساب العميل المرتبط في بطاقة العميل (${customerName}) غير موجود في قائمة الحسابات. يرجى التحقق من إعدادات العميل.`);
                }
                
                // Debit: Customer account (total in base currency)
                let customerEntry = {
                    accountId: customerAccountId,
                    debit: totalInBaseCurrency,
                    credit: 0,
                    originalAmount: saleData.total,
                    originalCurrency: invoiceCurrency,
                    description: `فاتورة مبيعات آجل رقم ${saleData.invoiceNo} - ${customerName}`
                };
                entryData.entries.push(addAccountInfo(customerEntry, customerAccountId));

                // Credit: Sales account (total in base currency)
                let salesEntry = {
                    accountId: salesAccount.id,
                    debit: 0,
                    credit: totalInBaseCurrency,
                    originalAmount: saleData.total,
                    originalCurrency: invoiceCurrency,
                    description: customerName ? `مبيعات آجل لـ ${customerName}` : `فاتورة مبيعات آجل رقم ${saleData.invoiceNo}`
                };
                entryData.entries.push(addAccountInfo(salesEntry, salesAccount.id));

                // Handle partial payment: if paidAmount > 0, create payment entry
                if (paidAmount > 0 && paidAmount < saleData.total) {
                    // Get payment account (cash/bank account for receiving payment)
                    let paymentAccount = null;
                    const paymentAccountId = saleData.paymentAccountId || settings.defaultPaymentAccountId || settings.defaultDebitAccountId || null;
                    if (paymentAccountId) {
                        paymentAccount = this.accounts.find(a => a.id === paymentAccountId);
                    }
                    if (!paymentAccount) {
                        // Auto-detect cash account
                        paymentAccount = this.accounts.find(a => 
                            a.type === 'asset' && 
                            (a.name.includes('نقدية') || a.name.includes('صندوق') || a.name.toLowerCase().includes('cash'))
                        );
                    }
                    
                    if (paymentAccount) {
                        // Debit: Payment account (cash/bank) for received payment
                        let paymentEntry = {
                            accountId: paymentAccount.id,
                            debit: paidAmountInBaseCurrency,
                            credit: 0,
                            originalAmount: paidAmount,
                            originalCurrency: invoiceCurrency,
                            description: `دفعة جزئية - فاتورة مبيعات رقم ${saleData.invoiceNo} - ${customerName}`
                        };
                        entryData.entries.push(addAccountInfo(paymentEntry, paymentAccount.id));

                        // Credit: Customer account (reduce customer debt)
                        let paymentCustomerEntry = {
                            accountId: customerAccountId,
                            debit: 0,
                            credit: paidAmountInBaseCurrency,
                            originalAmount: paidAmount,
                            originalCurrency: invoiceCurrency,
                            description: `دفعة جزئية - فاتورة مبيعات رقم ${saleData.invoiceNo} - ${customerName}`
                        };
                        entryData.entries.push(addAccountInfo(paymentCustomerEntry, customerAccountId));
                    } else {
                        console.warn('⚠️ Payment account not found for partial payment, skipping payment entry');
                    }
                }
            }

            // Handle item-level discounts and additions (similar to purchases but reversed)
            // For sales: discounts reduce revenue, additions increase revenue
            if (saleData.items && saleData.items.length > 0) {
                saleData.items.forEach((item) => {
                    const itemCurrency = item.invoiceCurrency || invoiceCurrency;
                    const itemExchangeRate = item.exchangeRate || invoiceExchangeRate;
                    
                    // Handle item discount (reduces revenue)
                    if (item.discountAmount && item.discountAmount > 0) {
                        const discountAmountInBase = InvoiceUtils.convertToBaseCurrency(item.discountAmount, itemCurrency, itemExchangeRate, this.currencies);
                        
                        // Debit: Discount account (reduces revenue)
                        const discountAccountId = settings.defaultDiscountAccountId || null;
                        if (discountAccountId) {
                            const discountAccount = this.accounts.find(a => a.id === discountAccountId);
                            if (discountAccount) {
                                let discountEntry = {
                                    accountId: discountAccountId,
                                    debit: discountAmountInBase,
                                    credit: 0,
                                    originalAmount: item.discountAmount,
                                    originalCurrency: itemCurrency,
                                    description: `خصم على منتج: ${item.productName || 'منتج'} - فاتورة مبيعات رقم ${saleData.invoiceNo}`
                                };
                                entryData.entries.push(addAccountInfo(discountEntry, discountAccountId));
                                
                                // Credit: Counter account
                                let discountCounterAccountId = null;
                                if (paymentMethod === 'credit' && customerAccountId) {
                                    discountCounterAccountId = customerAccountId;
                                } else if (paymentMethod === 'cash') {
                                    discountCounterAccountId = settings.defaultDebitAccountId || null;
                                }
                                
                                if (discountCounterAccountId) {
                                    const discountCounterAccount = this.accounts.find(a => a.id === discountCounterAccountId);
                                    if (discountCounterAccount) {
                                        let discountCounterEntry = {
                                            accountId: discountCounterAccountId,
                                            debit: 0,
                                            credit: discountAmountInBase,
                                            originalAmount: item.discountAmount,
                                            originalCurrency: itemCurrency,
                                            description: `خصم على منتج: ${item.productName || 'منتج'} - فاتورة مبيعات رقم ${saleData.invoiceNo}`
                                        };
                                        entryData.entries.push(addAccountInfo(discountCounterEntry, discountCounterAccountId));
                                    }
                                }
                            }
                        }
                    }
                    
                    // Handle item addition (increases revenue)
                    if (item.additionAmount && item.additionAmount > 0) {
                        const additionAmountInBase = InvoiceUtils.convertToBaseCurrency(item.additionAmount, itemCurrency, itemExchangeRate, this.currencies);
                        
                        // Credit: Addition account (increases revenue)
                        const additionAccountId = settings.defaultAdditionAccountId || null;
                        if (additionAccountId) {
                            const additionAccount = this.accounts.find(a => a.id === additionAccountId);
                            if (additionAccount) {
                                let additionEntry = {
                                    accountId: additionAccountId,
                                    debit: 0,
                                    credit: additionAmountInBase,
                                    originalAmount: item.additionAmount,
                                    originalCurrency: itemCurrency,
                                    description: `إضافة على منتج: ${item.productName || 'منتج'} - فاتورة مبيعات رقم ${saleData.invoiceNo}`
                                };
                                entryData.entries.push(addAccountInfo(additionEntry, additionAccountId));
                                
                                // Debit: Counter account
                                let additionCounterAccountId = null;
                                if (paymentMethod === 'credit' && customerAccountId) {
                                    additionCounterAccountId = customerAccountId;
                                } else if (paymentMethod === 'cash') {
                                    additionCounterAccountId = settings.defaultDebitAccountId || null;
                                }
                                
                                if (additionCounterAccountId) {
                                    const additionCounterAccount = this.accounts.find(a => a.id === additionCounterAccountId);
                                    if (additionCounterAccount) {
                                        let additionCounterEntry = {
                                            accountId: additionCounterAccountId,
                                            debit: additionAmountInBase,
                                            credit: 0,
                                            originalAmount: item.additionAmount,
                                            originalCurrency: itemCurrency,
                                            description: `إضافة على منتج: ${item.productName || 'منتج'} - فاتورة مبيعات رقم ${saleData.invoiceNo}`
                                        };
                                        entryData.entries.push(addAccountInfo(additionCounterEntry, additionCounterAccountId));
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // Validate entry balance
            if (!entryData.entries || entryData.entries.length === 0) {
                console.error('❌ لا توجد قيود في القيد العام!');
                throw new Error('القيد العام فارغ - لا توجد قيود محاسبية');
            }
            
            const totalDebit = entryData.entries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
            const totalCredit = entryData.entries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);
            const balanceDifference = Math.abs(totalDebit - totalCredit);
            
            if (balanceDifference > 0.01) {
                console.error('❌ CRITICAL ERROR: القيد العام غير متوازن!', {
                    totalDebit: totalDebit.toFixed(2),
                    totalCredit: totalCredit.toFixed(2),
                    difference: balanceDifference.toFixed(2)
                });
                throw new Error(`❌ خطأ حرج: القيد العام غير متوازن!\n\nالمدين: ${totalDebit.toFixed(2)}\nالدائن: ${totalCredit.toFixed(2)}\nالفرق: ${balanceDifference.toFixed(2)}`);
            }

            entryData.totalDebit = totalDebit;
            entryData.totalCredit = totalCredit;
            entryData.isBalanced = true;

            // Save general entry
            const generalEntryResult = await Collections.addGeneralEntry(entryData);
            const generalEntryId = generalEntryResult?.id || generalEntryResult;
            
            console.log('✅ General entry generated successfully for sale', {
                id: generalEntryId,
                totalDebit: totalDebit.toFixed(2),
                totalCredit: totalCredit.toFixed(2)
            });

            return generalEntryId;

        } catch (error) {
            console.error('❌ Error generating general entry for sale:', error);
            return null;
        }
    },

    /**
     * Update inventory on edit (for sales - reverses old and applies new)
     */
    async updateInventoryOnEdit(oldSaleData, newSaleData) {
        try {
            console.log('📦 Updating inventory on edit for sale:', newSaleData.invoiceNo);
            
            // Check if auto-update stock is enabled
            const settings = await this.getSettings();
            if (!settings.autoUpdateStock) {
                console.log('ℹ️ Auto-update stock is disabled, skipping inventory update');
                return;
            }
            
            // Delete old inventory movements before updating stock
            try {
                const saleId = String(oldSaleData.id || newSaleData.id);
                const deletedMovements = await this.deleteInventoryMovementsBySource('sale', saleId);
                if (deletedMovements > 0) {
                    console.log(`✅ تم حذف ${deletedMovements} حركة مخزون قديمة قبل التحديث`);
                }
            } catch (error) {
                console.error('❌ خطأ في حذف حركات المخزون القديمة:', error);
                // Continue with inventory update even if movement deletion fails
            }
            
            // First, reverse the old sale (add back the stock)
            if (oldSaleData.items && oldSaleData.items.length > 0) {
                for (const item of oldSaleData.items) {
                    const product = await Collections.getProduct(item.productId);
                    if (!product) continue;
                    
                    // تحويل الكمية إلى الوحدة الأساسية مع مراعاة نوع التحويل
                    let quantityInMainUnit = item.quantity;
                    if (item.unitId && item.unitId !== product.unitId) {
                        const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
                        if (subUnit && subUnit.conversionFactor && subUnit.conversionFactor > 0) {
                            // تحديد نوع التحويل: ضرب أو قسمة
                            if (subUnit.conversionType === 'multiply') {
                                quantityInMainUnit = item.quantity * subUnit.conversionFactor;
                            } else {
                                quantityInMainUnit = item.quantity / subUnit.conversionFactor;
                            }
                        }
                    }
                    
                    // Add back the stock (reverse the sale)
                    await Collections.updateProductWarehouseStock(
                        item.productId,
                        oldSaleData.warehouseId || 'default',
                        quantityInMainUnit,
                        'add'
                    );
                }
            }
            
            // Then, apply the new sale (subtract the stock)
            if (newSaleData.items && newSaleData.items.length > 0) {
                for (const item of newSaleData.items) {
                    const product = await Collections.getProduct(item.productId);
                    if (!product) continue;
                    
                    // تحويل الكمية إلى الوحدة الأساسية مع مراعاة نوع التحويل
                    let quantityInMainUnit = item.quantity;
                    if (item.unitId && item.unitId !== product.unitId) {
                        const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
                        if (subUnit && subUnit.conversionFactor && subUnit.conversionFactor > 0) {
                            // تحديد نوع التحويل: ضرب أو قسمة
                            if (subUnit.conversionType === 'multiply') {
                                quantityInMainUnit = item.quantity * subUnit.conversionFactor;
                            } else {
                                quantityInMainUnit = item.quantity / subUnit.conversionFactor;
                            }
                        }
                    }
                    
                    // Get current stock before update
                    const currentStock = await Collections.getProductWarehouseStock(item.productId);
                    const warehouseId = newSaleData.warehouseId || 'default';
                    const stockInWarehouse = currentStock?.[warehouseId] || 0;
                    const previousQuantity = stockInWarehouse;
                    
                    // Check if enough stock is available (unless allowSaleWithoutStock is enabled)
                    if (stockInWarehouse < quantityInMainUnit) {
                        if (!settings.allowSaleWithoutStock) {
                            throw new Error(`الكمية المتاحة غير كافية للمنتج ${product.name}. المتاح: ${stockInWarehouse}, المطلوب: ${quantityInMainUnit}`);
                        } else {
                            console.warn(`⚠️ Warning: Insufficient stock for product ${product.name}. Available: ${stockInWarehouse}, Required: ${quantityInMainUnit}. Sale allowed due to allowSaleWithoutStock setting.`);
                        }
                    }
                    
                    const newQuantity = previousQuantity - quantityInMainUnit;
                    
                    // Subtract the stock (apply the sale)
                    await Collections.updateProductWarehouseStock(
                        item.productId,
                        warehouseId,
                        quantityInMainUnit,
                        'subtract'
                    );
                    
                    // Record inventory movement
                    const warehouse = await Collections.getWarehouse(warehouseId);
                    const warehouseName = warehouse?.name || 'المستودع الافتراضي';
                    
                    const movementRecord = {
                        type: 'out',
                        productId: item.productId,
                        productName: product.name,
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
                        reference: newSaleData.invoiceNo || `فاتورة مبيعات ${newSaleData.id || ''}`,
                        notes: `تعديل فاتورة مبيعات - ${newSaleData.customerName || ''}`,
                        date: newSaleData.date ? new Date(newSaleData.date) : new Date(),
                        userId: auth.currentUser?.uid || 'system',
                        createdAt: new Date(),
                        sourceType: 'sale',
                        sourceId: String(newSaleData.id || '')
                    };
                    
                    await db.collection('inventoryMovements').add(movementRecord);
                    console.log(`📝 Inventory movement recorded for edited sale: ${product.name}`);
                }
            }
            
            console.log('✅ Inventory updated successfully on edit');
        } catch (error) {
            console.error('❌ Error updating inventory on edit:', error);
            throw error;
        }
    },

    /**
     * Update or create general entry (for sales)
     */
    async updateOrCreateGeneralEntry(saleData) {
        try {
            // Find existing general entry
            const sourceId = String(saleData.id);
            const snapshot = await db.collection('generalEntries')
                .where('sourceId', '==', sourceId)
                .where('type', '==', 'sale')
                .limit(1)
                .get();
            
            if (!snapshot.empty) {
                // Update existing entry
                const existingEntry = snapshot.docs[0];
                const newEntryData = await this.calculateExpectedGeneralEntry(saleData);
                if (newEntryData) {
                    await db.collection('generalEntries').doc(existingEntry.id).update({
                        ...newEntryData,
                        updatedAt: new Date(),
                        updatedBy: auth.currentUser?.uid || 'system'
                    });
                }
            } else {
                // Create new entry
                await this.generateGeneralEntry(saleData);
            }
        } catch (error) {
            console.error('❌ Error updating/creating general entry:', error);
        }
    },

    /**
     * Calculate expected general entry (for preview/update)
     */
    async calculateExpectedGeneralEntry(saleData) {
        // This is a simplified version - you may want to implement a full calculation
        // For now, we'll just call generateGeneralEntry logic
        try {
            const paymentMethod = saleData.paymentMethod || 'cash';
            const settings = await this.getSettings();

            // Get customer account
            const customer = saleData.customerId ? this.customers.find(c => c.id === saleData.customerId) : null;
            const customerAccountId = customer?.subAccountId || null;
            const customerName = customer?.name || 'غير محدد';

            // For credit payments, customer is required
            if (paymentMethod === 'credit' && !customerAccountId) {
                return null;
            }

            // Get base currency and exchange rate
            const invoiceCurrency = saleData.currency || 'IQD';
            const invoiceExchangeRate = parseFloat(saleData.exchangeRate) || 1;
            const baseCurrency = this.currencies.find(c => c.isBaseCurrency)?.code || 'IQD';
            
            // ✅ Using shared utility function from InvoiceUtils

            // Prepare general entry data
            const entryData = {
                date: saleData.date || new Date().toISOString().split('T')[0],
                description: `فاتورة مبيعات رقم ${saleData.invoiceNo || 'جديد'}`,
                reference: saleData.invoiceNo || 'جديد',
                voucherNumber: saleData.invoiceNo ? `GE-${saleData.invoiceNo}` : 'GE-PREVIEW',
                voucherType: 'general',
                type: 'sale',
                sourceId: saleData.id || 'preview',
                mainCurrency: baseCurrency,
                invoiceCurrency: invoiceCurrency,
                exchangeRate: invoiceExchangeRate,
                costCenterId: saleData.costCenterId || null,
                costCenterName: saleData.costCenterId ? (this.costCenters.find(c => c.id === saleData.costCenterId)?.name || null) : null,
                entries: []
            };

            // Get sales account
            const salesAccount = await this.getSalesAccount(saleData);
            if (!salesAccount) {
                return null;
            }

            // Convert total to base currency
            const totalInBaseCurrency = InvoiceUtils.convertToBaseCurrency(saleData.total || 0, invoiceCurrency, invoiceExchangeRate, this.currencies);

            // Helper function to add account info to entry
            const addAccountInfo = (entry, accountId) => {
                const account = this.accounts.find(a => a.id === accountId);
                if (account) {
                    entry.accountName = account.name || '';
                    entry.accountCode = account.code || '';
                    entry.currency = baseCurrency;
                }
                if (saleData.costCenterId) {
                    entry.costCenterId = saleData.costCenterId;
                    const costCenter = this.costCenters.find(c => c.id === saleData.costCenterId);
                    if (costCenter) {
                        entry.costCenterName = costCenter.name || '';
                    }
                }
                return entry;
            };

            if (paymentMethod === 'cash') {
                // Cash Payment: Debit Cash, Credit Sales
                const cashAccountId = settings.defaultCashAccountId || null;
                if (!cashAccountId) {
                    return null;
                }

                let cashEntry = {
                    accountId: cashAccountId,
                    debit: totalInBaseCurrency,
                    credit: 0,
                    originalAmount: saleData.total || 0,
                    originalCurrency: invoiceCurrency,
                    description: customerName ? `فاتورة مبيعات نقدي من ${customerName}` : `فاتورة مبيعات نقدي رقم ${saleData.invoiceNo || 'جديد'}`
                };
                entryData.entries.push(addAccountInfo(cashEntry, cashAccountId));

                let salesEntry = {
                    accountId: salesAccount.id,
                    debit: 0,
                    credit: totalInBaseCurrency,
                    originalAmount: saleData.total || 0,
                    originalCurrency: invoiceCurrency,
                    description: customerName ? `فاتورة مبيعات نقدي من ${customerName}` : `فاتورة مبيعات نقدي رقم ${saleData.invoiceNo || 'جديد'}`
                };
                entryData.entries.push(addAccountInfo(salesEntry, salesAccount.id));
            } else {
                // Credit Payment: Debit Customer, Credit Sales
                if (!customerAccountId) {
                    return null;
                }

                let customerEntry = {
                    accountId: customerAccountId,
                    debit: totalInBaseCurrency,
                    credit: 0,
                    originalAmount: saleData.total || 0,
                    originalCurrency: invoiceCurrency,
                    description: `فاتورة مبيعات آجل رقم ${saleData.invoiceNo || 'جديد'} - ${customerName}`
                };
                entryData.entries.push(addAccountInfo(customerEntry, customerAccountId));

                let salesEntry = {
                    accountId: salesAccount.id,
                    debit: 0,
                    credit: totalInBaseCurrency,
                    originalAmount: saleData.total || 0,
                    originalCurrency: invoiceCurrency,
                    description: customerName ? `فاتورة مبيعات آجل من ${customerName}` : `فاتورة مبيعات آجل رقم ${saleData.invoiceNo || 'جديد'}`
                };
                entryData.entries.push(addAccountInfo(salesEntry, salesAccount.id));
            }

            return entryData;
        } catch (error) {
            console.error('❌ Error calculating expected general entry:', error);
            return null;
        }
    },

    /**
     * Delete general entry by source ID
     */
    /**
     * Delete inventory movements by source ID and type
     */
    // ✅ Using shared function from Collections
    async deleteInventoryMovementsBySource(sourceType, sourceId) {
        return await Collections.deleteInventoryMovementsBySource(sourceType, sourceId);
    },

    async deleteGeneralEntryBySourceId(sourceId) {
        try {
            const sourceIdStr = String(sourceId);
            
            // Try direct query first
            let snapshot;
            try {
                snapshot = await db.collection('generalEntries')
                    .where('sourceId', '==', sourceIdStr)
                    .where('type', '==', 'sale')
                    .get();
            } catch (error) {
                console.warn('⚠️ Direct query failed, trying fallback:', error);
                // Fallback: fetch all and filter
                const allSnapshot = await db.collection('generalEntries').get();
                const allEntries = allSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const matchingEntries = allEntries.filter(e => 
                    String(e.sourceId) === sourceIdStr && e.type === 'sale'
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
     * Show generated general entry dialog after saving sale
     */
    async showGeneratedGeneralEntry(saleId) {
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
            const sourceId = String(saleId);
            let generalEntry = null;
            
            try {
                const snapshot = await db.collection('generalEntries')
                    .where('sourceId', '==', sourceId)
                    .where('type', '==', 'sale')
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
                    String(e.sourceId) === sourceId && e.type === 'sale'
                );
            }
            
            if (!generalEntry) {
                console.warn('⚠️ General entry not found for sale:', saleId);
                this.cancelSaleForm();
                return;
            }
            
            const entryId = generalEntry.id;
            
            // Show dialog with options
            const result = await Swal.fire({
                title: 'تم حفظ فاتورة المبيعات بنجاح',
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
                const saleData = await Collections.getSale(saleId);
                if (saleData) {
                    // TODO: Implement printSaleInvoice
                    console.log('Print sale invoice:', saleData);
                }
            } else if (result.isDenied) {
                // Print general entry
                if (typeof VouchersModule !== 'undefined' && VouchersModule.printGeneralEntry) {
                    await VouchersModule.printGeneralEntry(entryId);
                }
            }
            
            // Reset form after dialog closes
            this.cancelSaleForm();
            
            // Restore focus to main window
            window.focus();
            
        } catch (error) {
            console.error('❌ Error showing generated general entry:', error);
            this.cancelSaleForm();
        }
    },

    showNewCustomerModal() {
        // TODO: Implement new customer modal
        Swal.fire({
            title: 'إضافة عميل جديد',
            text: 'سيتم إضافة هذه الميزة قريباً',
            icon: 'info'
        });
    },

    generateSalesReport() {
        const reportType = document.getElementById('reportType').value;
        const dateFrom = document.getElementById('reportDateFrom').value;
        const dateTo = document.getElementById('reportDateTo').value;
        
        // TODO: Implement report generation
        Swal.fire({
            title: 'توليد التقرير',
            text: `سيتم إضافة تقرير ${reportType} قريباً`,
            icon: 'info'
        });
    },

    viewSale(saleId) {
        const sale = this.sales.find(s => s.id === saleId);
        if (sale) {
            Swal.fire({
                title: `فاتورة مبيعات ${sale.invoiceNo || 'N/A'}`,
                html: `
                    <div class="text-start">
                        <p><strong>التاريخ:</strong> ${new Date(sale.date).toLocaleDateString('ar-SA')}</p>
                        <p><strong>العميل:</strong> ${sale.customerName || 'N/A'}</p>
                        <p><strong>المبلغ الإجمالي:</strong> ${(sale.total || 0).toLocaleString()}</p>
                        <p><strong>المدفوع:</strong> ${(sale.paid || 0).toLocaleString()}</p>
                        <p><strong>المتبقي:</strong> ${(sale.remaining || 0).toLocaleString()}</p>
                        <p><strong>الحالة:</strong> ${sale.status === 'completed' ? 'مكتمل' : sale.status === 'pending' ? 'معلق' : 'ملغي'}</p>
                    </div>
                `,
                icon: 'info'
            });
        }
    },

    async editSale(saleId) {
        try {
            const sale = await Collections.getSale(saleId);
            this.editingSale = sale;
            
            // Show modal first
            this.showSaleModal();
            
            // Wait for modal to be created and shown, then populate form
            setTimeout(() => {
                const modalElement = document.getElementById('saleModal');
                if (modalElement) {
                    // Use event listener to populate form after modal is fully shown
                    const populateAfterShow = () => {
                        setTimeout(() => {
                            this.populateSaleForm();
                        }, 200); // Wait for modal animation to complete
                        modalElement.removeEventListener('shown.bs.modal', populateAfterShow);
                    };
                    
                    modalElement.addEventListener('shown.bs.modal', populateAfterShow);
                    
                    // If modal is already shown, populate immediately
                    if (modalElement.classList.contains('show')) {
                        setTimeout(() => {
                            this.populateSaleForm();
                        }, 200);
                    }
                } else {
                    // Fallback: try again after a delay
                    setTimeout(() => {
                        this.populateSaleForm();
                    }, 500);
                }
            }, 100);
        } catch (error) {
            console.error('Error loading sale:', error);
            if (typeof showError === 'function') {
                showError('فشل في تحميل فاتورة المبيعات: ' + error.message);
            } else {
                console.error('❌ فشل في تحميل فاتورة المبيعات:', error.message);
            }
        }
    },

    async deleteSale(saleId) {
        try {
            const result = await Swal.fire({
                title: 'تأكيد الحذف',
                text: 'هل أنت متأكد من حذف فاتورة المبيعات؟ سيتم حذف القيد العام المرتبط أيضاً وإعادة المخزون.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'نعم، احذف',
                cancelButtonText: 'إلغاء',
                confirmButtonColor: '#dc3545'
            });

            if (!result.isConfirmed) return;

            showLoading();

            // Get sale data first to reverse inventory
            const saleData = await Collections.getSale(saleId);
            if (saleData) {
                // Reverse inventory (add back the stock)
                if (saleData.items && saleData.items.length > 0) {
                    for (const item of saleData.items) {
                        const product = await Collections.getProduct(item.productId);
                        if (!product) continue;
                        
                        let quantityInMainUnit = item.quantity;
                        if (item.unitId && item.unitId !== product.unitId) {
                            const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
                            if (subUnit && subUnit.conversionFactor && subUnit.conversionFactor > 0) {
                                if (subUnit.conversionType === 'multiply') {
                                    quantityInMainUnit = item.quantity * subUnit.conversionFactor;
                                } else {
                                    quantityInMainUnit = item.quantity / subUnit.conversionFactor;
                                }
                            }
                        }
                        
                        // Add back the stock (reverse the sale)
                        await Collections.updateProductWarehouseStock(
                            item.productId,
                            saleData.warehouseId || 'default',
                            quantityInMainUnit,
                            'add'
                        );
                    }
                }

                // Delete inventory movements
                await this.deleteInventoryMovementsBySource('sale', saleId);

                // Delete general entry
                const sourceId = String(saleId);
                await this.deleteGeneralEntryBySourceId(sourceId);
            }

            // Delete sale
            await Collections.deleteSale(saleId);

            // Reload data
            await this.loadSales();
            this.updateDashboard();

            hideLoading();
            showSuccess('تم حذف فاتورة المبيعات بنجاح');

        } catch (error) {
            console.error('Error deleting sale:', error);
            hideLoading();
            showError('فشل في حذف فاتورة المبيعات: ' + (error.message || 'خطأ غير معروف'));
        }
    },

    viewCustomer(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (customer) {
            const totalPurchases = this.sales
                .filter(s => s.customerId === customerId)
                .reduce((sum, s) => sum + (s.total || 0), 0);
            
            Swal.fire({
                title: customer.name,
                html: `
                    <div class="text-start">
                        <p><strong>الهاتف:</strong> ${customer.phone || 'N/A'}</p>
                        <p><strong>البريد الإلكتروني:</strong> ${customer.email || 'N/A'}</p>
                        <p><strong>العنوان:</strong> ${customer.address || 'N/A'}</p>
                        <p><strong>إجمالي المشتريات:</strong> ${totalPurchases.toLocaleString()}</p>
                        <p><strong>الرصيد:</strong> ${(customer.balance || 0).toLocaleString()}</p>
                        <p><strong>الحالة:</strong> ${customer.status === 'active' ? 'نشط' : 'غير نشط'}</p>
                    </div>
                `,
                icon: 'info'
            });
        }
    },

    editCustomer(customerId) {
        // TODO: Implement edit customer functionality
        Swal.fire({
            title: 'تعديل العميل',
            text: 'سيتم إضافة هذه الميزة قريباً',
            icon: 'info'
        });
    },

    /**
     * Setup sale modal event listeners
     */
    setupSaleModalListeners() {
        // Add item button
        const addSaleItemBtn = document.getElementById('addSaleItem');
        if (addSaleItemBtn) {
            addSaleItemBtn.addEventListener('click', () => {
                this.addSaleItem();
            });
        }

        // Copy selected rows button
        const copySelectedBtn = document.getElementById('copySelectedRows');
        if (copySelectedBtn) {
            copySelectedBtn.addEventListener('click', () => {
                this.copySelectedRows();
            });
        }

        // Paste rows button
        const pasteRowsBtn = document.getElementById('pasteRows');
        if (pasteRowsBtn) {
            pasteRowsBtn.addEventListener('click', () => {
                this.pasteRows();
            });
        }

        // Delete selected rows button
        const deleteSelectedBtn = document.getElementById('deleteSelectedRows');
        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener('click', () => {
                this.deleteSelectedRows();
            });
        }

        // Select all rows checkbox
        const selectAllCheckbox = document.getElementById('selectAllRows');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                this.toggleSelectAllRows(e.target.checked);
            });
        }

        // Toggle columns button
        const toggleColumnsBtn = document.getElementById('toggleColumns');
        if (toggleColumnsBtn) {
            toggleColumnsBtn.addEventListener('click', () => {
                this.toggleColumnControls();
            });
        }

        // Add discount button
        const addDiscountBtn = document.getElementById('addDiscount');
        if (addDiscountBtn) {
            addDiscountBtn.addEventListener('click', () => {
                this.addDiscount();
            });
        }

        // Add addition button
        const addAdditionBtn = document.getElementById('addAddition');
        if (addAdditionBtn) {
            addAdditionBtn.addEventListener('click', () => {
                this.addAddition();
            });
        }

        // Save sale button
        const saveSaleBtn = document.getElementById('saveSaleBtn');
        if (saveSaleBtn) {
            saveSaleBtn.addEventListener('click', () => {
                this.saveSale();
            });
        }

        // Payment method change
        const paymentMethodSelect = document.getElementById('salePaymentMethod');
        if (paymentMethodSelect) {
            paymentMethodSelect.addEventListener('change', () => {
                this.updatePaymentFields();
            });
        }

        // Paid amount change
        const paidAmountInput = document.getElementById('salePaidAmount');
        if (paidAmountInput) {
            paidAmountInput.addEventListener('input', () => {
                this.calculateRemainingAmount();
            });
        }

        // Currency change
        const currencySelect = document.getElementById('saleCurrency');
        if (currencySelect) {
            currencySelect.addEventListener('change', () => {
                this.updateExchangeRate();
            });
        }

        // Exchange rate change
        const exchangeRateInput = document.getElementById('saleExchangeRate');
        if (exchangeRateInput) {
            exchangeRateInput.addEventListener('input', () => {
                this.recalculateAllItemPrices();
            });
        }

        // Setup column controls
        this.setupColumnVisibilityControls();
        this.setupColumnResizing();

        // Payment account picker button
        const openSalePaymentAccountPickerBtn = document.getElementById('openSalePaymentAccountPicker');
        if (openSalePaymentAccountPickerBtn) {
            openSalePaymentAccountPickerBtn.addEventListener('click', () => {
                this.openAccountPicker('salePaymentAccountId', 'salePaymentAccountDisplay');
            });
        }

        // Preview general entry button
        const previewGeneralEntryBtn = document.getElementById('previewGeneralEntryBtn');
        if (previewGeneralEntryBtn) {
            previewGeneralEntryBtn.addEventListener('click', () => {
                this.previewGeneralEntry();
            });
        }

        // Refresh general entry preview button
        const refreshGeneralEntryPreviewBtn = document.getElementById('refreshGeneralEntryPreviewBtn');
        if (refreshGeneralEntryPreviewBtn) {
            refreshGeneralEntryPreviewBtn.addEventListener('click', () => {
                this.previewGeneralEntry();
            });
        }

        // Handle modal close event
        const saleModal = document.getElementById('saleModal');
        if (saleModal) {
            saleModal.addEventListener('hidden.bs.modal', () => {
                this.cancelSaleForm();
            });
        }

        // Update preview when totals change
        const observer = new MutationObserver(() => {
            const previewDiv = document.getElementById('generalEntryPreview');
            if (previewDiv && previewDiv.style.display !== 'none') {
                this.previewGeneralEntry();
            }
        });
        const totalElement = document.getElementById('saleTotal');
        if (totalElement) {
            observer.observe(totalElement, { childList: true, characterData: true, subtree: true });
        }
    },

    /**
     * Generate sale invoice number
     */
    generateSaleInvoiceNumber() {
        const prefix = 'SAL';
        const existingNumbers = this.sales.map(s => s.invoiceNo).filter(no => no && no.startsWith(prefix));
        
        let counter = 1;
        let newNumber;
        
        do {
            newNumber = `${prefix}${counter.toString().padStart(4, '0')}`;
            counter++;
        } while (existingNumbers.includes(newNumber));
        
        const invoiceNoInput = document.getElementById('saleInvoiceNo');
        if (invoiceNoInput) {
            invoiceNoInput.value = newNumber;
        }
    },

    /**
     * Apply default values from settings to sale form
     */
    async applyDefaultValues() {
        try {
            const settings = await this.getSettings();
            
            // Apply default currency
            const currencySelect = document.getElementById('saleCurrency');
            if (currencySelect && settings.defaultCurrency) {
                currencySelect.value = settings.defaultCurrency;
                console.log(`✅ Default currency applied: ${settings.defaultCurrency}`);
                this.updateExchangeRate();
            }
            
            // Apply default warehouse
            if (settings.defaultWarehouse) {
                const warehouse = this.warehouses.find(w => w.id === settings.defaultWarehouse);
                if (warehouse) {
                    const warehouseDisplay = document.getElementById('saleWarehouseDisplay');
                    const warehouseIdInput = document.getElementById('saleWarehouseId');
                    if (warehouseDisplay && warehouseIdInput) {
                        warehouseDisplay.value = warehouse.name;
                        warehouseIdInput.value = warehouse.id;
                        console.log(`✅ Default warehouse applied: ${warehouse.name}`);
                    } else {
                        setTimeout(() => {
                            const retryWarehouseDisplay = document.getElementById('saleWarehouseDisplay');
                            const retryWarehouseIdInput = document.getElementById('saleWarehouseId');
                            if (retryWarehouseDisplay && retryWarehouseIdInput) {
                                retryWarehouseDisplay.value = warehouse.name;
                                retryWarehouseIdInput.value = warehouse.id;
                                console.log(`✅ Default warehouse applied (retry): ${warehouse.name}`);
                            }
                        }, 100);
                    }
                }
            }
            
            // Apply default cost center
            if (settings.defaultCostCenter) {
                const costCenter = this.costCenters.find(c => c.id === settings.defaultCostCenter);
                if (costCenter) {
                    const costCenterDisplay = document.getElementById('saleCostCenterDisplay');
                    const costCenterIdInput = document.getElementById('saleCostCenterId');
                    if (costCenterDisplay && costCenterIdInput) {
                        costCenterDisplay.value = costCenter.name;
                        costCenterIdInput.value = costCenter.id;
                        console.log(`✅ Default cost center applied: ${costCenter.name}`);
                    } else {
                        setTimeout(() => {
                            const retryCostCenterDisplay = document.getElementById('saleCostCenterDisplay');
                            const retryCostCenterIdInput = document.getElementById('saleCostCenterId');
                            if (retryCostCenterDisplay && retryCostCenterIdInput) {
                                retryCostCenterDisplay.value = costCenter.name;
                                retryCostCenterIdInput.value = costCenter.id;
                                console.log(`✅ Default cost center applied (retry): ${costCenter.name}`);
                            }
                        }, 100);
                    }
                }
            }
            
            // Apply default payment method
            const paymentMethodSelect = document.getElementById('salePaymentMethod');
            if (paymentMethodSelect && settings.defaultPaymentMethod) {
                paymentMethodSelect.value = settings.defaultPaymentMethod;
                console.log(`✅ Default payment method applied: ${settings.defaultPaymentMethod}`);
                this.updatePaymentFields();
            }
            
            // Apply default payment account
            if (settings.defaultPaymentAccountId) {
                const paymentAccount = this.accounts.find(a => a.id === settings.defaultPaymentAccountId);
                if (paymentAccount) {
                    const paymentAccountDisplay = document.getElementById('salePaymentAccountDisplay');
                    const paymentAccountIdInput = document.getElementById('salePaymentAccountId');
                    if (paymentAccountDisplay && paymentAccountIdInput) {
                        paymentAccountDisplay.value = paymentAccount.name;
                        paymentAccountIdInput.value = paymentAccount.id;
                        console.log(`✅ Default payment account applied: ${paymentAccount.name}`);
                    } else {
                        setTimeout(() => {
                            const retryPaymentAccountDisplay = document.getElementById('salePaymentAccountDisplay');
                            const retryPaymentAccountIdInput = document.getElementById('salePaymentAccountId');
                            if (retryPaymentAccountDisplay && retryPaymentAccountIdInput) {
                                retryPaymentAccountDisplay.value = paymentAccount.name;
                                retryPaymentAccountIdInput.value = paymentAccount.id;
                                console.log(`✅ Default payment account applied (retry): ${paymentAccount.name}`);
                            }
                        }, 100);
                    }
                }
            }
            
            console.log('✅ All default values applied successfully');
        } catch (error) {
            console.error('Error applying default values:', error);
        }
    },

    /**
     * Initialize empty rows for new sale
     */
    initializeEmptyRows(count = 6) {
        const tbody = document.getElementById('saleItemsBody');
        if (!tbody) return;
        
        // Clear existing rows if any
        tbody.innerHTML = '';
        
        // Add empty rows
        for (let i = 0; i < count; i++) {
            this.addSaleItem();
        }
        
        // Setup scroll buttons after rows are added
        this.setupTableScrollButtons();
        this.setupColumnResizing();
        
        console.log(`✅ Initialized ${count} empty rows`);
    },

    /**
     * Add sale item row (Advanced Excel-like)
     */
    addSaleItem() {
        const tbody = document.getElementById('saleItemsBody');
        if (!tbody) return;

        const rowIndex = tbody.children.length + 1;
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
                <div class="input-group">
                    <input type="number" class="form-control form-control-sm quantity-input" min="0" step="0.01" value="1" required style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
                    <button type="button" class="btn btn-sm btn-outline-info sale-show-available-qty-btn" title="عرض الكميات المتوفرة" style="display: none; border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
                        <i class="fas fa-boxes"></i>
                    </button>
                </div>
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
            <td class="excel-cell" data-row="${rowIndex}" data-col="10" style="border: 1px solid #d0d7e5; padding: 4px; background: #f8f9fa;">
                <input type="number" class="form-control form-control-sm total-input" min="0" step="0.01" value="0" readonly style="background-color: #f8f9fa; font-weight: bold; border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="excel-cell col-expiry" data-row="${rowIndex}" data-col="11" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="date" class="form-control form-control-sm expiry-date-input" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="excel-cell col-serial" data-row="${rowIndex}" data-col="12" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="text" class="form-control form-control-sm serial-number-input" placeholder="رقم تسلسلي" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="excel-cell col-notes" data-row="${rowIndex}" data-col="13" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="text" class="form-control form-control-sm notes-input" placeholder="ملاحظات" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="excel-cell" data-row="${rowIndex}" data-col="14" style="border: 1px solid #d0d7e5; text-align: center; padding: 4px; background: #fff;">
                <button type="button" class="btn btn-sm btn-outline-danger remove-item" title="حذف الصف" style="border: 1px solid #dc3545; border-radius: 0; padding: 4px 8px;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);
        
        // Debug: Check if button exists immediately after appending
        const quantityCell = row.querySelector('.col-quantity');
        const inputGroup = quantityCell?.querySelector('.input-group');
        const button = quantityCell?.querySelector('.sale-show-available-qty-btn');
        
        this.setupSaleItemListeners(row);
        this.setupExcelNavigation(row);
        this.updateRowNumbers();
        
        // Update available quantities button after row is added to DOM
        setTimeout(() => {
            this.updateAvailableQuantitiesButton(row);
        }, 50);
        
        // Update scroll buttons visibility after adding row
        setTimeout(() => {
            const container = document.getElementById('saleItemsTableContainer');
            if (container) {
                container.dispatchEvent(new Event('scroll'));
            }
        }, 50);
        this.calculateSaleTotals();
    },

    /**
     * Initialize autocomplete fields in sale form (now using picker modals)
     */
    initializeAutocompleteFields() {
        // Setup Customer picker button
        const openCustomerPicker = document.getElementById('openCustomerPicker');
        if (openCustomerPicker) {
            openCustomerPicker.addEventListener('click', () => {
                this.openCustomerPicker();
            });
        }

        // Setup Warehouse picker button
        const openWarehousePicker = document.getElementById('openWarehousePicker');
        if (openWarehousePicker) {
            openWarehousePicker.addEventListener('click', () => {
                this.openWarehousePicker();
            });
        }

        // Setup Cost Center picker button
        const openCostCenterPicker = document.getElementById('openCostCenterPicker');
        if (openCostCenterPicker) {
            openCostCenterPicker.addEventListener('click', () => {
                this.openCostCenterPicker();
            });
        }

        // Setup Sales Rep 1 picker button
        const openSalesRep1Picker = document.getElementById('openSalesRep1Picker');
        if (openSalesRep1Picker) {
            openSalesRep1Picker.addEventListener('click', () => {
                this.openSalesRepPicker(1);
            });
        }

        // Setup Sales Rep 2 picker button
        const openSalesRep2Picker = document.getElementById('openSalesRep2Picker');
        if (openSalesRep2Picker) {
            openSalesRep2Picker.addEventListener('click', () => {
                this.openSalesRepPicker(2);
            });
        }

        // If editing, populate the fields
        if (this.editingSale) {
            this.populateSaleForm(this.editingSale);
        }
    },

    /**
     * Setup column resizing for sale items table
     */
    setupColumnResizing() {
        const table = document.getElementById('saleItemsTable');
        if (!table) return;

        const headers = table.querySelectorAll('th.resizable');
        let isResizing = false;
        let currentHeader = null;
        let startX = 0;
        let startWidth = 0;

        headers.forEach(header => {
            const handle = header.querySelector('.resize-handle');
            if (!handle) return;

            handle.addEventListener('mousedown', (e) => {
                isResizing = true;
                currentHeader = header;
                startX = e.clientX;
                startWidth = header.offsetWidth;
                
                document.body.style.cursor = 'col-resize';
                document.body.style.userSelect = 'none';
                
                e.preventDefault();
                e.stopPropagation();
            });
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing || !currentHeader) return;

            const diff = e.clientX - startX;
            const newWidth = startWidth + diff;
            
            if (newWidth > 50) { // Minimum width
                currentHeader.style.width = `${newWidth}px`;
                currentHeader.style.minWidth = `${newWidth}px`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                currentHeader = null;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });
    },

    /**
     * Calculate sale totals
     */
    calculateSaleTotals() {
        const tbody = document.getElementById('saleItemsBody');
        if (!tbody) return;
        
        const rows = tbody.children;
        let subtotal = 0;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const total = parseFloat(row.querySelector('.total-input')?.value) || 0;
            subtotal += total;
        }

        // Calculate discounts and additions from table
        const discountRows = document.querySelectorAll('#discountsAdditionsBody tr');
        let totalDiscounts = 0;
        let totalAdditions = 0;

        const invoiceCurrency = document.getElementById('saleCurrency')?.value || 'IQD';
        const invoiceExchangeRate = parseFloat(document.getElementById('saleExchangeRate')?.value) || 1;
        const baseCurrency = this.currencies.find(c => c.isBaseCurrency)?.code || 'IQD';

        discountRows.forEach(row => {
            const type = row.querySelector('.type-select')?.value;
            const amount = parseFloat(row.querySelector('.amount-input')?.value) || 0;
            const currency = row.querySelector('.currency-select')?.value || invoiceCurrency;
            
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
            
            if (type === 'discount') {
                totalDiscounts += convertedAmount;
            } else if (type === 'addition') {
                totalAdditions += convertedAmount;
            }
        });

        const finalTotal = subtotal - totalDiscounts + totalAdditions;

        // Update display
        const subtotalEl = document.getElementById('saleSubtotal');
        const totalDiscountsEl = document.getElementById('totalDiscounts');
        const totalAdditionsEl = document.getElementById('totalAdditions');
        const saleTotalEl = document.getElementById('saleTotal');
        
        if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2);
        if (totalDiscountsEl) totalDiscountsEl.textContent = totalDiscounts.toFixed(2);
        if (totalAdditionsEl) totalAdditionsEl.textContent = totalAdditions.toFixed(2);
        if (saleTotalEl) saleTotalEl.textContent = finalTotal.toFixed(2);
        
        const currencyEls = document.querySelectorAll('#subtotalCurrency, #discountCurrency, #additionCurrency, #totalCurrency');
        currencyEls.forEach(el => {
            if (el) el.textContent = invoiceCurrency;
        });
        
        this.calculateRemainingAmount();
    },

    /**
     * Setup scroll buttons for the sale items table
     */
    setupTableScrollButtons() {
        const container = document.getElementById('saleItemsTableContainer');
        const scrollUpBtn = document.getElementById('scrollTableUp');
        const scrollDownBtn = document.getElementById('scrollTableDown');
        
        if (!container || !scrollUpBtn || !scrollDownBtn) return;
        
        const updateScrollButtons = () => {
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            const maxScroll = scrollHeight - clientHeight;
            
            if (scrollTop > 50) {
                scrollUpBtn.style.display = 'block';
            } else {
                scrollUpBtn.style.display = 'none';
            }
            
            if (scrollTop < maxScroll - 50) {
                scrollDownBtn.style.display = 'block';
            } else {
                scrollDownBtn.style.display = 'none';
            }
        };
        
        updateScrollButtons();
        container.addEventListener('scroll', updateScrollButtons);
        
        const observer = new MutationObserver(() => {
            setTimeout(updateScrollButtons, 100);
        });
        observer.observe(container, { childList: true, subtree: true });
        
        scrollUpBtn.addEventListener('click', () => {
            container.scrollBy({ top: -200, behavior: 'smooth' });
        });
        
        scrollDownBtn.addEventListener('click', () => {
            container.scrollBy({ top: 200, behavior: 'smooth' });
        });
        
        window.addEventListener('resize', updateScrollButtons);
    },

    /**
     * Get selected rows
     */
    getSelectedRows() {
        const checkboxes = document.querySelectorAll('.row-select-checkbox:checked');
        const selectedRows = [];
        checkboxes.forEach(checkbox => {
            const row = checkbox.closest('tr');
            if (row) selectedRows.push(row);
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
     * Copy selected rows
     */
    copySelectedRows() {
        const selectedRows = this.getSelectedRows();
        if (selectedRows.length === 0) {
            if (typeof showError === 'function') {
                showError('يرجى تحديد صف واحد على الأقل للنسخ');
            }
            return;
        }
        
        this.copiedRows = selectedRows.map(row => ({
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
        }));
        
        if (typeof showSuccess === 'function') {
            showSuccess(`تم نسخ ${selectedRows.length} صف بنجاح`);
        }
    },

    /**
     * Paste rows
     */
    async pasteRows() {
        if (!this.copiedRows || this.copiedRows.length === 0) {
            if (typeof showError === 'function') {
                showError('لا توجد صفوف منسوخة للصق');
            }
            return;
        }
        
        const tbody = document.getElementById('saleItemsBody');
        if (!tbody) return;
        
        for (const rowData of this.copiedRows) {
            this.addSaleItem();
            const newRow = tbody.querySelector('tr:last-child');
            
            if (newRow && rowData.productId) {
                const productInput = newRow.querySelector('.product-display-input');
                const productHiddenInput = newRow.querySelector('.product-select-id');
                
                if (productInput && productHiddenInput) {
                    productInput.value = rowData.productName;
                    productHiddenInput.value = rowData.productId;
                    
                    const product = this.products.find(p => p.id === rowData.productId);
                    if (product) {
                        await this.handleProductSelection(newRow, product);
                        
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
                
                this.calculateItemTotal(newRow);
            }
        }
        
        this.updateRowNumbers();
        this.calculateSaleTotals();
        
        if (typeof showSuccess === 'function') {
            showSuccess(`تم لصق ${this.copiedRows.length} صف بنجاح`);
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
            }
            return;
        }
        
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
                    this.calculateSaleTotals();
                    
                    setTimeout(() => {
                        const container = document.getElementById('saleItemsTableContainer');
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
                this.calculateSaleTotals();
            }
        }
    },

    /**
     * Toggle column controls visibility
     */
    toggleColumnControls() {
        const controls = document.getElementById('columnControls');
        if (controls) {
            controls.style.display = controls.style.display === 'none' ? 'block' : 'none';
        }
    },

    /**
     * Setup column visibility controls
     */
    setupColumnVisibilityControls() {
        const toggles = document.querySelectorAll('.column-toggle');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', () => {
                const columnClass = toggle.id.replace('col-', '');
                const columns = document.querySelectorAll(`.col-${columnClass}`);
                columns.forEach(col => {
                    col.style.display = toggle.checked ? '' : 'none';
                });
            });
        });
    },

    /**
     * Update payment fields based on payment method
     */
    updatePaymentFields() {
        const paymentMethod = document.getElementById('salePaymentMethod')?.value || 'cash';
        const paidAmountInput = document.getElementById('salePaidAmount');
        const dueDateInput = document.getElementById('saleDueDate');
        
        if (paymentMethod === 'cash') {
            // في الدفع النقدي: تعطيل حقل المبلغ المدفوع وتعيينه للإجمالي
            if (paidAmountInput) {
                const total = parseFloat(document.getElementById('saleTotal')?.textContent || 0);
                paidAmountInput.value = total.toFixed(2);
                paidAmountInput.disabled = true;
            }
            if (dueDateInput) {
                dueDateInput.disabled = true;
                dueDateInput.value = '';
            }
        } else {
            // في الدفع الآجل: تفعيل حقل المبلغ المدفوع
            if (paidAmountInput) {
                paidAmountInput.disabled = false;
                if (parseFloat(paidAmountInput.value || 0) === 0) {
                    paidAmountInput.value = '0';
                }
            }
            if (dueDateInput) {
                dueDateInput.disabled = false;
            }
        }
        
        this.calculateRemainingAmount();
    },

    /**
     * Calculate remaining amount
     */
    calculateRemainingAmount() {
        const total = parseFloat(document.getElementById('saleTotal')?.textContent || 0);
        const paid = parseFloat(document.getElementById('salePaidAmount')?.value || 0);
        const remaining = total - paid;
        
        const remainingInput = document.getElementById('saleRemainingAmount');
        if (remainingInput) {
            remainingInput.value = remaining.toFixed(2);
        }
        
        const paymentStatusSelect = document.getElementById('salePaymentStatus');
        if (paymentStatusSelect) {
            if (remaining <= 0.01) {
                paymentStatusSelect.value = 'paid';
            } else if (paid > 0) {
                paymentStatusSelect.value = 'partial';
            } else {
                paymentStatusSelect.value = 'unpaid';
            }
        }
    },

    /**
     * Update exchange rate based on selected currency
     */
    updateExchangeRate() {
        const currencySelect = document.getElementById('saleCurrency');
        if (!currencySelect) return;
        
        const selectedCurrency = currencySelect.value;
        const currency = this.currencies.find(c => c.code === selectedCurrency);
        const exchangeRateInput = document.getElementById('saleExchangeRate');
        
        if (currency && exchangeRateInput) {
            exchangeRateInput.value = (currency.exchangeRate || 1).toFixed(4);
        }
    },

    /**
     * Recalculate all item prices based on exchange rate
     */
    recalculateAllItemPrices() {
        const tbody = document.getElementById('saleItemsBody');
        if (!tbody) return;
        
        const rows = tbody.children;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const productId = row.querySelector('.product-select-id')?.value;
            if (productId) {
                const product = this.products.find(p => p.id === productId);
                if (product) {
                    // Re-trigger unit selection to update price
                    const unitId = row.querySelector('.unit-select-id')?.value;
                    if (unitId) {
                        // Price will be updated automatically when unit is selected
                        // This is a placeholder - actual implementation would re-select unit
                    }
                }
            }
        }
    },


    /**
     * Update row numbers after adding/removing rows
     */
    updateRowNumbers() {
        const tbody = document.getElementById('saleItemsBody');
        if (!tbody) return;
        
        const rows = tbody.children;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowIndex = i + 1;
            row.dataset.rowIndex = rowIndex;
            
            const numberCell = row.querySelector('td:nth-child(2)');
            if (numberCell) {
                numberCell.textContent = rowIndex;
            }
            
            const checkbox = row.querySelector('.row-select-checkbox');
            if (checkbox) {
                checkbox.dataset.rowIndex = rowIndex;
            }
        }
    },

    /**
     * Open customer picker modal
     */
    openCustomerPicker() {
        const modal = new bootstrap.Modal(document.getElementById('customerPickerModal'));
        this.populateCustomerPicker();
        this.setupCustomerPickerSearch();
        modal.show();
    },

    /**
     * Populate customer picker table
     */
    populateCustomerPicker(searchTerm = '') {
        const tbody = document.getElementById('customerPickerTableBody');
        if (!tbody) return;

        const searchLower = searchTerm.toLowerCase();
        const filteredCustomers = this.customers.filter(customer => {
            if (!searchTerm) return true;
            const name = (customer.name || '').toLowerCase();
            const code = (customer.code || '').toLowerCase();
            const phone = (customer.phone || '').toLowerCase();
            return name.includes(searchLower) || code.includes(searchLower) || phone.includes(searchLower);
        });

        if (filteredCustomers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">لا توجد عملاء</td></tr>';
            return;
        }

        tbody.innerHTML = filteredCustomers.map(customer => `
            <tr>
                <td>${this.escapeHtml(customer.name || '')}</td>
                <td>${this.escapeHtml(customer.code || '')}</td>
                <td>${this.escapeHtml(customer.phone || '')}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="SalesModule.selectCustomer('${customer.id}')">
                        <i class="fas fa-check"></i> اختر
                    </button>
                </td>
            </tr>
        `).join('');
    },

    /**
     * Setup customer picker search
     */
    setupCustomerPickerSearch() {
        const searchInput = document.getElementById('customerPickerSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.populateCustomerPicker(e.target.value);
            });
        }
    },

    /**
     * Select customer from picker
     */
    selectCustomer(customerId) {
        const customer = this.customers.find(c => c.id === customerId);
        if (customer) {
            const customerDisplay = document.getElementById('saleCustomerDisplay');
            const customerIdInput = document.getElementById('saleCustomerId');
            
            if (customerDisplay) customerDisplay.value = customer.name;
            if (customerIdInput) customerIdInput.value = customer.id;
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('customerPickerModal'));
            if (modal) modal.hide();
        }
    },

    /**
     * Open warehouse picker modal
     */
    openWarehousePicker() {
        const modal = new bootstrap.Modal(document.getElementById('warehousePickerModal'));
        this.populateWarehousePicker();
        this.setupWarehousePickerSearch();
        modal.show();
    },

    /**
     * Setup warehouse picker search
     */
    setupWarehousePickerSearch() {
        const searchInput = document.getElementById('warehousePickerSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.populateWarehousePicker(e.target.value);
            });
        }
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
                    <button class="btn btn-sm btn-primary" onclick="SalesModule.selectWarehouse('${warehouse.id}')">
                        <i class="fas fa-check"></i> اختر
                    </button>
                </td>
            </tr>
        `).join('');
    },

    /**
     * Select warehouse from picker
     */
    async selectWarehouse(warehouseId) {
        const warehouse = this.warehouses.find(w => w.id === warehouseId);
        if (warehouse) {
            const warehouseDisplay = document.getElementById('saleWarehouseDisplay');
            const warehouseIdInput = document.getElementById('saleWarehouseId');
            
            if (warehouseDisplay) warehouseDisplay.value = warehouse.name;
            if (warehouseIdInput) warehouseIdInput.value = warehouse.id;
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('warehousePickerModal'));
            if (modal) modal.hide();

            // Reload inventory details for all rows when warehouse changes
            const tbody = document.getElementById('saleItemsBody');
            if (tbody) {
                const rows = Array.from(tbody.children);
                for (const row of rows) {
                    const productHiddenInput = row.querySelector('.product-select-id');
                    if (productHiddenInput?.value) {
                        await this.loadProductInventoryDetails(row);
                    }
                    // Update available quantities button for all rows
                    this.updateAvailableQuantitiesButton(row);
                }
            }
        }
    },

    /**
     * Open cost center picker modal
     */
    openCostCenterPicker() {
        const modal = new bootstrap.Modal(document.getElementById('costCenterPickerModal'));
        this.populateCostCenterPicker();
        this.setupCostCenterPickerSearch();
        modal.show();
    },

    /**
     * Setup cost center picker search
     */
    setupCostCenterPickerSearch() {
        const searchInput = document.getElementById('costCenterPickerSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.populateCostCenterPicker(e.target.value);
            });
        }
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
                    <button class="btn btn-sm btn-primary" onclick="SalesModule.selectCostCenter('${costCenter.id}')">
                        <i class="fas fa-check"></i> اختر
                    </button>
                </td>
            </tr>
        `).join('');
    },

    /**
     * Select cost center from picker
     */
    selectCostCenter(costCenterId) {
        const costCenter = this.costCenters.find(c => c.id === costCenterId);
        if (costCenter) {
            const costCenterDisplay = document.getElementById('saleCostCenterDisplay');
            const costCenterIdInput = document.getElementById('saleCostCenterId');
            
            if (costCenterDisplay) costCenterDisplay.value = costCenter.name;
            if (costCenterIdInput) costCenterIdInput.value = costCenter.id;
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('costCenterPickerModal'));
            if (modal) modal.hide();
        }
    },

    /**
     * Open sales rep picker modal
     */
    openSalesRepPicker(number) {
        this.currentSalesRepNumber = number;
        const modal = new bootstrap.Modal(document.getElementById('salesRepPickerModal'));
        this.populateSalesRepPicker();
        this.setupSalesRepPickerSearch();
        modal.show();
    },

    /**
     * Setup sales rep picker search
     */
    setupSalesRepPickerSearch() {
        const searchInput = document.getElementById('salesRepPickerSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.populateSalesRepPicker(e.target.value);
            });
        }
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
                    <button class="btn btn-sm btn-primary" onclick="SalesModule.selectSalesRep('${salesRep.id}')">
                        <i class="fas fa-check"></i> اختر
                    </button>
                </td>
            </tr>
        `).join('');
    },

    /**
     * Select sales rep from picker
     */
    selectSalesRep(salesRepId) {
        const salesRep = this.salesReps.find(s => s.id === salesRepId);
        if (salesRep && this.currentSalesRepNumber) {
            const displayId = this.currentSalesRepNumber === 1 ? 'saleSalesRep1Display' : 'saleSalesRep2Display';
            const idInputId = this.currentSalesRepNumber === 1 ? 'saleSalesRep1Id' : 'saleSalesRep2Id';
            
            const salesRepDisplay = document.getElementById(displayId);
            const salesRepIdInput = document.getElementById(idInputId);
            
            if (salesRepDisplay) salesRepDisplay.value = salesRep.name;
            if (salesRepIdInput) salesRepIdInput.value = salesRep.id;
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('salesRepPickerModal'));
            if (modal) modal.hide();
        }
    },

    /**
     * Setup sale item row event listeners
     */
    setupSaleItemListeners(row) {
        const productDisplayInput = row.querySelector('.product-display-input');
        const productHiddenInput = row.querySelector('.product-select-id');
        const productPickerBtn = row.querySelector('.product-picker-btn');
        
        if (productDisplayInput && productHiddenInput && productPickerBtn) {
            productDisplayInput.addEventListener('click', () => {
                this.openProductPicker(row);
            });
            
            productPickerBtn.addEventListener('click', () => {
                this.openProductPicker(row);
            });
            
            productDisplayInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.openProductPicker(row);
                }
            });
        }

        const unitContainer = row.querySelector('.unit-autocomplete-container');
        const unitHiddenInput = row.querySelector('.unit-select-id');
        if (unitContainer && unitHiddenInput) {
            unitContainer.innerHTML = `
                <input type="text" class="form-control form-control-sm" 
                       placeholder="اختر المنتج أولاً" 
                       disabled 
                       style="width: 100%; background-color: #f8f9fa; cursor: not-allowed;">
            `;
            row.dataset.unitContainerReady = 'true';
        }

        const quantityInput = row.querySelector('.quantity-input');
        const priceInput = row.querySelector('.price-input');
        const discountPercentInput = row.querySelector('.discount-percent-input');
        const discountAmountInput = row.querySelector('.discount-amount-input');
        const additionPercentInput = row.querySelector('.addition-percent-input');
        const additionAmountInput = row.querySelector('.addition-amount-input');
        const expiryDateInput = row.querySelector('.expiry-date-input');
        const serialNumberInput = row.querySelector('.serial-number-input');

        if (quantityInput) {
            quantityInput.addEventListener('input', () => {
                const quantity = parseFloat(quantityInput.value) || 0;
                if (quantity < 0) quantityInput.value = '0';
                this.calculateItemTotal(row);
            });
        }

        // Add event listeners for expiry date and serial number changes
        if (expiryDateInput) {
            expiryDateInput.addEventListener('change', async () => {
                await this.handleExpiryDateSelection(row);
            });
        }

        if (serialNumberInput) {
            serialNumberInput.addEventListener('change', async () => {
                await this.handleSerialNumberSelection(row);
            });
        }

        // Available quantities button
        const availableQtyBtn = row.querySelector('.sale-show-available-qty-btn');
        if (availableQtyBtn) {
            availableQtyBtn.addEventListener('click', () => {
                this.showAvailableQuantities(row);
            });
        }

        if (priceInput) {
            priceInput.addEventListener('input', () => {
                const price = parseFloat(priceInput.value) || 0;
                if (price < 0) priceInput.value = '0';
                this.calculateItemTotal(row);
            });
        }

        [discountPercentInput, additionPercentInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    this.calculateItemTotal(row);
                });
            }
        });

        [discountAmountInput, additionAmountInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    this.calculateItemTotal(row);
                });
            }
        });

        const removeBtn = row.querySelector('.remove-item');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                row.remove();
                this.updateRowNumbers();
                this.calculateSaleTotals();
                
                setTimeout(() => {
                    const container = document.getElementById('saleItemsTableContainer');
                    if (container) {
                        container.dispatchEvent(new Event('scroll'));
                    }
                }, 50);
            });
        }
    },

    /**
     * Setup Excel-like navigation (Tab and Enter)
     */
    setupExcelNavigation(row) {
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
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Tab' && !e.shiftKey) {
                    e.preventDefault();
                    const nextIndex = index + 1;
                    if (nextIndex < editableInputs.length) {
                        editableInputs[nextIndex].focus();
                        editableInputs[nextIndex].select();
                    } else {
                        const nextRow = row.nextElementSibling;
                        if (nextRow) {
                            const firstInput = nextRow.querySelector(inputSelectors[0]);
                            if (firstInput) {
                                firstInput.focus();
                                firstInput.select();
                            }
                        } else {
                            this.addSaleItem();
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
                    const prevIndex = index - 1;
                    if (prevIndex >= 0) {
                        editableInputs[prevIndex].focus();
                        editableInputs[prevIndex].select();
                    } else {
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
                
                if (e.key === 'Enter') {
                    if (input.classList.contains('product-display-input')) {
                        e.preventDefault();
                        this.openProductPicker(row);
                        return;
                    }
                    
                    e.preventDefault();
                    const currentColumnIndex = Array.from(row.cells).indexOf(input.closest('td'));
                    const nextRow = row.nextElementSibling;
                    
                    if (nextRow) {
                        const nextCell = nextRow.cells[currentColumnIndex];
                        if (nextCell) {
                            let nextInput = null;
                            if (input.classList.contains('product-display-input')) {
                                nextInput = nextCell.querySelector('.product-display-input');
                            } else {
                                nextInput = nextCell.querySelector(input.tagName === 'INPUT' ? 'input:not([readonly]):not([disabled])' : 'select:not([disabled])');
                            }
                            
                            if (nextInput) {
                                nextInput.focus();
                                if (nextInput.tagName === 'INPUT' && nextInput.type === 'text') {
                                    nextInput.select();
                                }
                            }
                        }
                    } else {
                        this.addSaleItem();
                        setTimeout(() => {
                            const tbody = row.closest('tbody');
                            const newRow = tbody.querySelector('tr:last-child');
                            if (newRow) {
                                const newCell = newRow.cells[currentColumnIndex];
                                if (newCell) {
                                    let newInput = null;
                                    if (input.classList.contains('product-display-input')) {
                                        newInput = newCell.querySelector('.product-display-input');
                                    } else {
                                        newInput = newCell.querySelector(input.tagName === 'INPUT' ? 'input:not([readonly]):not([disabled])' : 'select:not([disabled])');
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
            });
        });
        
        const checkbox = row.querySelector('.row-select-checkbox');
        if (checkbox) {
            checkbox.addEventListener('change', () => {
                const allCheckboxes = document.querySelectorAll('.row-select-checkbox');
                const checkedCheckboxes = document.querySelectorAll('.row-select-checkbox:checked');
                const selectAllCheckbox = document.getElementById('selectAllRows');
                if (selectAllCheckbox) {
                    selectAllCheckbox.checked = allCheckboxes.length === checkedCheckboxes.length && allCheckboxes.length > 0;
                    selectAllCheckbox.indeterminate = checkedCheckboxes.length > 0 && checkedCheckboxes.length < allCheckboxes.length;
                }
            });
        }
    },

    /**
     * Calculate total for a single item
     */
    calculateItemTotal(row) {
        const quantity = parseFloat(row.querySelector('.quantity-input')?.value) || 0;
        const price = parseFloat(row.querySelector('.price-input')?.value) || 0;
        const subtotal = quantity * price;
        
        const discountPercentInput = row.querySelector('.discount-percent-input');
        const discountAmountInput = row.querySelector('.discount-amount-input');
        const discountPercent = discountPercentInput ? parseFloat(discountPercentInput.value) || 0 : 0;
        const discountAmountEntered = discountAmountInput ? parseFloat(discountAmountInput.value) || 0 : 0;
        
        let discountAmount = 0;
        if (discountPercent > 0 && subtotal > 0) {
            const calculatedDiscountAmount = (subtotal * discountPercent) / 100;
            if (Math.abs(discountAmountEntered - calculatedDiscountAmount) < 0.01) {
                discountAmount = calculatedDiscountAmount;
            } else {
                discountAmount = discountAmountEntered;
            }
        } else {
            discountAmount = discountAmountEntered;
        }
        
        const additionPercentInput = row.querySelector('.addition-percent-input');
        const additionAmountInput = row.querySelector('.addition-amount-input');
        const additionPercent = additionPercentInput ? parseFloat(additionPercentInput.value) || 0 : 0;
        const additionAmountEntered = additionAmountInput ? parseFloat(additionAmountInput.value) || 0 : 0;
        
        let additionAmount = 0;
        if (additionPercent > 0 && subtotal > 0) {
            const calculatedAdditionAmount = (subtotal * additionPercent) / 100;
            if (Math.abs(additionAmountEntered - calculatedAdditionAmount) < 0.01) {
                additionAmount = calculatedAdditionAmount;
            } else {
                additionAmount = additionAmountEntered;
            }
        } else {
            additionAmount = additionAmountEntered;
        }
        
        const total = subtotal - discountAmount + additionAmount;

        const isDiscountFocused = discountAmountInput && document.activeElement === discountAmountInput;
        const isAdditionFocused = additionAmountInput && document.activeElement === additionAmountInput;
        
        if (discountAmountInput && !isDiscountFocused) {
            discountAmountInput.value = discountAmount.toFixed(2);
        }
        if (additionAmountInput && !isAdditionFocused) {
            additionAmountInput.value = additionAmount.toFixed(2);
        }
        
        const totalInput = row.querySelector('.total-input');
        if (totalInput) {
            totalInput.value = total.toFixed(2);
        }
        
        this.calculateSaleTotals();
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
                <input type="text" class="form-control form-control-sm account-name-input" placeholder="اسم الحساب" readonly>
                <input type="hidden" class="account-id-input">
                <button type="button" class="btn btn-sm btn-outline-secondary account-picker-btn">
                    <i class="fas fa-search"></i>
                </button>
            </td>
            <td>
                <input type="text" class="form-control form-control-sm counter-account-name-input" placeholder="الحساب المقابل" readonly>
                <input type="hidden" class="counter-account-id-input">
                <button type="button" class="btn btn-sm btn-outline-secondary counter-account-picker-btn">
                    <i class="fas fa-search"></i>
                </button>
            </td>
            <td>
                <input type="number" class="form-control form-control-sm amount-input" min="0" step="0.01" value="0">
            </td>
            <td>
                <select class="form-select form-select-sm currency-select">
                    ${this.currencies.map(c => `<option value="${c.code}" ${c.code === 'IQD' ? 'selected' : ''}>${c.code}</option>`).join('')}
                </select>
            </td>
            <td>
                <input type="text" class="form-control form-control-sm notes-input" placeholder="ملاحظات">
            </td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-danger remove-discount-addition">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
        
        const removeBtn = row.querySelector('.remove-discount-addition');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                row.remove();
                this.updateDiscountAdditionNumbers();
                this.calculateSaleTotals();
            });
        }
        
        const amountInput = row.querySelector('.amount-input');
        if (amountInput) {
            amountInput.addEventListener('input', () => {
                this.calculateSaleTotals();
            });
        }
        
        this.calculateSaleTotals();
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
                <input type="text" class="form-control form-control-sm account-name-input" placeholder="اسم الحساب" readonly>
                <input type="hidden" class="account-id-input">
                <button type="button" class="btn btn-sm btn-outline-secondary account-picker-btn">
                    <i class="fas fa-search"></i>
                </button>
            </td>
            <td>
                <input type="text" class="form-control form-control-sm counter-account-name-input" placeholder="الحساب المقابل" readonly>
                <input type="hidden" class="counter-account-id-input">
                <button type="button" class="btn btn-sm btn-outline-secondary counter-account-picker-btn">
                    <i class="fas fa-search"></i>
                </button>
            </td>
            <td>
                <input type="number" class="form-control form-control-sm amount-input" min="0" step="0.01" value="0">
            </td>
            <td>
                <select class="form-select form-select-sm currency-select">
                    ${this.currencies.map(c => `<option value="${c.code}" ${c.code === 'IQD' ? 'selected' : ''}>${c.code}</option>`).join('')}
                </select>
            </td>
            <td>
                <input type="text" class="form-control form-control-sm notes-input" placeholder="ملاحظات">
            </td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-danger remove-discount-addition">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
        
        const removeBtn = row.querySelector('.remove-discount-addition');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                row.remove();
                this.updateDiscountAdditionNumbers();
                this.calculateSaleTotals();
            });
        }
        
        const amountInput = row.querySelector('.amount-input');
        if (amountInput) {
            amountInput.addEventListener('input', () => {
                this.calculateSaleTotals();
            });
        }
        
        this.calculateSaleTotals();
    },

    /**
     * Update discount/addition row numbers
     */
    updateDiscountAdditionNumbers() {
        const tbody = document.getElementById('discountsAdditionsBody');
        if (!tbody) return;
        
        const rows = tbody.children;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const numberCell = row.querySelector('td:first-child');
            if (numberCell) {
                numberCell.textContent = i + 1;
            }
        }
    },

    /**
     * Preview general entry that will be generated
     */
    async previewGeneralEntry() {
        try {
            const previewDiv = document.getElementById('generalEntryPreview');
            const previewContent = document.getElementById('generalEntryPreviewContent');
            const refreshBtn = document.getElementById('refreshGeneralEntryPreviewBtn');
            
            if (!previewDiv || !previewContent) return;

            previewDiv.style.display = 'block';
            if (refreshBtn) refreshBtn.style.display = 'inline-block';
            
            previewContent.innerHTML = '<div class="text-center text-muted"><i class="fas fa-spinner fa-spin"></i> جاري حساب القيد...</div>';

            const formData = this.collectSaleData();
            
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

            const entryData = await this.calculateExpectedGeneralEntry(formData);
            
            if (!entryData || !entryData.entries || entryData.entries.length === 0) {
                previewContent.innerHTML = `
                    <div class="alert alert-warning mb-0">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>تنبيه:</strong> لا يمكن توليد القيد. يرجى التحقق من:
                        <ul class="mb-0 mt-2">
                            <li>تحديد العميل (للدفع الآجل)</li>
                            <li>تحديد حساب المبيعات في الإعدادات</li>
                            <li>تحديد حساب النقدية (للدفع النقدي)</li>
                        </ul>
                    </div>
                `;
                return;
            }

            const totalDebit = entryData.entries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
            const totalCredit = entryData.entries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);
            const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

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
                    <div class="table-responsive">
                        <table class="table table-sm table-bordered">
                            <thead class="table-dark">
                                <tr>
                                    <th>#</th>
                                    <th>الحساب</th>
                                    <th class="text-end">مدين</th>
                                    <th class="text-end">دائن</th>
                                    <th>الوصف</th>
                                </tr>
                            </thead>
                            <tbody>
            `;

            entryData.entries.forEach((entry, index) => {
                const account = this.accounts.find(a => a.id === entry.accountId);
                const accountName = account ? account.name : `حساب غير موجود (${entry.accountId})`;
                previewHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${this.escapeHtml(accountName)}</td>
                        <td class="text-end">${(entry.debit || 0).toFixed(2)}</td>
                        <td class="text-end">${(entry.credit || 0).toFixed(2)}</td>
                        <td>${this.escapeHtml(entry.description || '')}</td>
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
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            `;

            previewContent.innerHTML = previewHTML;

        } catch (error) {
            console.error('Error previewing general entry:', error);
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
    async calculateExpectedGeneralEntry(saleData) {
        try {
            const paymentMethod = saleData.paymentMethod || 'cash';
            const settings = await this.getSettings();

            // Get customer account (if customer is selected)
            const customer = saleData.customerId ? this.customers.find(c => c.id === saleData.customerId) : null;
            const customerAccountId = customer?.subAccountId || null;
            const customerName = customer?.name || 'غير محدد';

            // For credit payments, customer is required
            if (paymentMethod === 'credit' && !customerAccountId) {
                console.warn('⚠️ Customer subAccountId not found for credit payment, cannot preview general entry');
                return null;
            }

            const voucherNumber = saleData.invoiceNo ? `GE-${saleData.invoiceNo}` : 'GE-PREVIEW';
            const invoiceCurrency = saleData.currency || 'IQD';
            const invoiceExchangeRate = parseFloat(saleData.exchangeRate) || 1;
            const baseCurrency = this.currencies.find(c => c.isBaseCurrency)?.code || 'IQD';
            
            // ✅ Using shared utility function from InvoiceUtils

            const entryData = {
                date: saleData.date || new Date().toISOString().split('T')[0],
                description: document.getElementById('generalEntryDescription')?.value || `فاتورة مبيعات رقم ${saleData.invoiceNo || 'جديد'}`,
                reference: saleData.invoiceNo || 'جديد',
                voucherNumber: voucherNumber,
                voucherType: 'general',
                type: 'sale',
                sourceId: saleData.id || 'preview',
                mainCurrency: baseCurrency,
                invoiceCurrency: invoiceCurrency,
                exchangeRate: invoiceExchangeRate,
                costCenterId: saleData.costCenterId || null,
                costCenterName: saleData.costCenterId ? (this.costCenters.find(c => c.id === saleData.costCenterId)?.name || null) : null,
                entries: []
            };

            // Get sales account (credit account for sales)
            const salesAccount = await this.getSalesAccount(saleData);
            if (!salesAccount) {
                return null;
            }

            const addAccountInfo = (entry, accountId) => {
                const account = this.accounts.find(a => a.id === accountId);
                if (account) {
                    entry.accountName = account.name || '';
                    entry.accountCode = account.code || '';
                    entry.currency = baseCurrency;
                }
                if (saleData.costCenterId) {
                    entry.costCenterId = saleData.costCenterId;
                    const costCenter = this.costCenters.find(c => c.id === saleData.costCenterId);
                    if (costCenter) {
                        entry.costCenterName = costCenter.name || '';
                    }
                }
                return entry;
            };

            const totalInBaseCurrency = InvoiceUtils.convertToBaseCurrency(saleData.total || 0, invoiceCurrency, invoiceExchangeRate, this.currencies);

            // Handle payment method
            if (paymentMethod === 'cash') {
                // Cash Payment: Debit Cash, Credit Sales
                let cashAccount = null;
                const cashAccountId = settings.defaultCreditAccountId || null;
                if (cashAccountId) {
                    cashAccount = this.accounts.find(a => a.id === cashAccountId);
                }
                if (!cashAccount) {
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
                    debit: totalInBaseCurrency,
                    credit: 0,
                    originalAmount: saleData.total || 0,
                    originalCurrency: invoiceCurrency,
                    description: customerName ? `مبيعات نقدي إلى ${customerName}` : `فاتورة مبيعات نقدي رقم ${saleData.invoiceNo || 'جديد'}`
                };
                entryData.entries.push(addAccountInfo(cashEntry, cashAccount.id));

                let salesEntry = {
                    accountId: salesAccount.id,
                    debit: 0,
                    credit: totalInBaseCurrency,
                    originalAmount: saleData.total || 0,
                    originalCurrency: invoiceCurrency,
                    description: `فاتورة مبيعات نقدي رقم ${saleData.invoiceNo || 'جديد'}`
                };
                entryData.entries.push(addAccountInfo(salesEntry, salesAccount.id));
            } else {
                // Credit Payment: Debit Customer, Credit Sales
                if (!customerAccountId) {
                    return null;
                }

                const customerAccount = this.accounts.find(a => a.id === customerAccountId);
                if (!customerAccount) {
                    return null;
                }
                
                let customerEntry = {
                    accountId: customerAccountId,
                    debit: totalInBaseCurrency,
                    credit: 0,
                    originalAmount: saleData.total || 0,
                    originalCurrency: invoiceCurrency,
                    description: customerName ? `مبيعات آجل إلى ${customerName}` : `فاتورة مبيعات آجل رقم ${saleData.invoiceNo || 'جديد'}`
                };
                entryData.entries.push(addAccountInfo(customerEntry, customerAccountId));

                let salesEntry = {
                    accountId: salesAccount.id,
                    debit: 0,
                    credit: totalInBaseCurrency,
                    originalAmount: saleData.total || 0,
                    originalCurrency: invoiceCurrency,
                    description: `فاتورة مبيعات آجل رقم ${saleData.invoiceNo || 'جديد'} - ${customerName}`
                };
                entryData.entries.push(addAccountInfo(salesEntry, salesAccount.id));
            }

            // Handle discounts and additions from table
            if (saleData.discounts && saleData.discounts.length > 0) {
                saleData.discounts.forEach(discount => {
                    const discountCurrency = discount.currency || invoiceCurrency;
                    const discountExchangeRate = discount.exchangeRate || invoiceExchangeRate;
                    const discountAmountInBase = InvoiceUtils.convertToBaseCurrency(discount.amount || 0, discountCurrency, discountExchangeRate, this.currencies);
                    
                    if (discountAmountInBase > 0) {
                        // Debit: Discount account
                        if (discount.accountId) {
                            let discountEntry = {
                                accountId: discount.accountId,
                                debit: discountAmountInBase,
                                credit: 0,
                                originalAmount: discount.amount || 0,
                                originalCurrency: discountCurrency,
                                description: discount.notes || `خصم - فاتورة مبيعات رقم ${saleData.invoiceNo || 'جديد'}`
                            };
                            entryData.entries.push(addAccountInfo(discountEntry, discount.accountId));
                        }
                        
                        // Credit: Counter account (customer or cash)
                        const counterAccountId = paymentMethod === 'cash' ? 
                            (this.accounts.find(a => a.type === 'asset' && (a.name.includes('نقدية') || a.name.includes('صندوق')))?.id || null) :
                            customerAccountId;
                        if (counterAccountId) {
                            let counterEntry = {
                                accountId: counterAccountId,
                                debit: 0,
                                credit: discountAmountInBase,
                                originalAmount: discount.amount || 0,
                                originalCurrency: discountCurrency,
                                description: discount.notes || `خصم - فاتورة مبيعات رقم ${saleData.invoiceNo || 'جديد'}`
                            };
                            entryData.entries.push(addAccountInfo(counterEntry, counterAccountId));
                        }
                    }
                });
            }

            if (saleData.additions && saleData.additions.length > 0) {
                saleData.additions.forEach(addition => {
                    const additionCurrency = addition.currency || invoiceCurrency;
                    const additionExchangeRate = addition.exchangeRate || invoiceExchangeRate;
                    const additionAmountInBase = InvoiceUtils.convertToBaseCurrency(addition.amount || 0, additionCurrency, additionExchangeRate, this.currencies);
                    
                    if (additionAmountInBase > 0) {
                        // Credit: Addition account
                        if (addition.accountId) {
                            let additionEntry = {
                                accountId: addition.accountId,
                                debit: 0,
                                credit: additionAmountInBase,
                                originalAmount: addition.amount || 0,
                                originalCurrency: additionCurrency,
                                description: addition.notes || `إضافة - فاتورة مبيعات رقم ${saleData.invoiceNo || 'جديد'}`
                            };
                            entryData.entries.push(addAccountInfo(additionEntry, addition.accountId));
                        }
                        
                        // Debit: Counter account (customer or cash)
                        const counterAccountId = paymentMethod === 'cash' ? 
                            (this.accounts.find(a => a.type === 'asset' && (a.name.includes('نقدية') || a.name.includes('صندوق')))?.id || null) :
                            customerAccountId;
                        if (counterAccountId) {
                            let counterEntry = {
                                accountId: counterAccountId,
                                debit: additionAmountInBase,
                                credit: 0,
                                originalAmount: addition.amount || 0,
                                originalCurrency: additionCurrency,
                                description: addition.notes || `إضافة - فاتورة مبيعات رقم ${saleData.invoiceNo || 'جديد'}`
                            };
                            entryData.entries.push(addAccountInfo(counterEntry, counterAccountId));
                        }
                    }
                });
            }

            return entryData;

        } catch (error) {
            console.error('Error calculating expected general entry:', error);
            return null;
        }
    },

    /**
     * Populate sale form for editing
     */
    populateSaleForm() {
        if (!this.editingSale) return;

        // Populate header fields
        const invoiceNoInput = document.getElementById('saleInvoiceNo');
        const dateInput = document.getElementById('saleDate');
        const currencySelect = document.getElementById('saleCurrency');
        const notesInput = document.getElementById('saleNotes');
        
        if (invoiceNoInput) invoiceNoInput.value = this.editingSale.invoiceNo || '';
        if (dateInput) dateInput.value = this.editingSale.date || '';
        if (currencySelect) currencySelect.value = this.editingSale.currency || 'IQD';
        if (notesInput) notesInput.value = this.editingSale.notes || '';

        // Populate customer
        if (this.editingSale.customerId) {
            const customer = this.customers.find(c => c.id === this.editingSale.customerId);
            if (customer) {
                const customerDisplay = document.getElementById('saleCustomerDisplay');
                const customerIdInput = document.getElementById('saleCustomerId');
                if (customerDisplay) customerDisplay.value = customer.name;
                if (customerIdInput) customerIdInput.value = customer.id;
            }
        }

        // Populate warehouse
        if (this.editingSale.warehouseId) {
            const warehouse = this.warehouses.find(w => w.id === this.editingSale.warehouseId);
            if (warehouse) {
                const warehouseDisplay = document.getElementById('saleWarehouseDisplay');
                const warehouseIdInput = document.getElementById('saleWarehouseId');
                if (warehouseDisplay) warehouseDisplay.value = warehouse.name;
                if (warehouseIdInput) warehouseIdInput.value = warehouse.id;
            }
        }

        // Populate cost center
        if (this.editingSale.costCenterId) {
            const costCenter = this.costCenters.find(c => c.id === this.editingSale.costCenterId);
            if (costCenter) {
                const costCenterDisplay = document.getElementById('saleCostCenterDisplay');
                const costCenterIdInput = document.getElementById('saleCostCenterId');
                if (costCenterDisplay) costCenterDisplay.value = costCenter.name;
                if (costCenterIdInput) costCenterIdInput.value = costCenter.id;
            }
        }

        // Populate payment info
        const paymentMethodSelect = document.getElementById('salePaymentMethod');
        const paidAmountInput = document.getElementById('salePaidAmount');
        const dueDateInput = document.getElementById('saleDueDate');
        
        if (paymentMethodSelect) paymentMethodSelect.value = this.editingSale.paymentMethod || 'cash';
        if (paidAmountInput) paidAmountInput.value = this.editingSale.paid || 0;
        if (dueDateInput) dueDateInput.value = this.editingSale.dueDate || '';

        this.updatePaymentFields();

        // Populate items
        if (this.editingSale.items && this.editingSale.items.length > 0) {
            const tbody = document.getElementById('saleItemsBody');
            if (tbody) {
                tbody.innerHTML = '';
                this.editingSale.items.forEach(async (item) => {
                    this.addSaleItem();
                    const newRow = tbody.querySelector('tr:last-child');
                    if (newRow) {
                        // Set product
                        const product = this.products.find(p => p.id === item.productId);
                        if (product) {
                            const productDisplayInput = newRow.querySelector('.product-display-input');
                            const productHiddenInput = newRow.querySelector('.product-select-id');
                            if (productDisplayInput && productHiddenInput) {
                                productDisplayInput.value = `${product.name}${product.code ? ' - ' + product.code : ''}`;
                                productHiddenInput.value = product.id;
                                await this.handleProductSelection(newRow, product);
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

                        if (quantityInput) quantityInput.value = item.quantity || 1;
                        if (priceInput) priceInput.value = item.unitPrice || 0;
                        if (discountPercentInput) discountPercentInput.value = item.discountPercent || 0;
                        if (discountAmountInput) discountAmountInput.value = item.discountAmount || 0;
                        if (additionPercentInput) additionPercentInput.value = item.additionPercent || 0;
                        if (additionAmountInput) additionAmountInput.value = item.additionAmount || 0;
                        if (expiryDateInput) expiryDateInput.value = item.expiryDate || '';
                        if (serialNumberInput) serialNumberInput.value = item.serialNumber || '';
                        if (notesInput) notesInput.value = item.notes || '';

                        this.calculateItemTotal(newRow);
                    }
                });
            }
        }

        // Populate discounts and additions
        if (this.editingSale.discounts && this.editingSale.discounts.length > 0) {
            this.editingSale.discounts.forEach(discount => {
                this.addDiscount();
                const tbody = document.getElementById('discountsAdditionsBody');
                const newRow = tbody.querySelector('tr:last-child');
                if (newRow) {
                    // Populate discount row fields
                    // This is simplified - full implementation would populate all fields
                }
            });
        }

        if (this.editingSale.additions && this.editingSale.additions.length > 0) {
            this.editingSale.additions.forEach(addition => {
                this.addAddition();
                const tbody = document.getElementById('discountsAdditionsBody');
                const newRow = tbody.querySelector('tr:last-child');
                if (newRow) {
                    // Populate addition row fields
                    // This is simplified - full implementation would populate all fields
                }
            });
        }

        this.calculateSaleTotals();
    },

    /**
     * Open product picker modal for selecting a product
     */
    openProductPicker(row) {
        if (!row) return;
        
        const productDisplayInput = row.querySelector('.product-display-input');
        const productHiddenInput = row.querySelector('.product-select-id');
        
        if (!productDisplayInput || !productHiddenInput) return;
        
        const allProducts = this.products || [];
        const currentProductId = productHiddenInput.value;
        const activeProducts = allProducts.filter(p => p.status !== 'inactive');
        
        // Create product picker content (simplified version - full version would be similar to purchases.js)
        const content = `
            <div style="text-align: start;">
                <div class="mb-3">
                    <input type="text" id="productPickerSearch" class="form-control" 
                           placeholder="ابحث عن المنتج بالاسم أو الكود...">
                </div>
                <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                    <table class="table table-bordered">
                        <thead class="table-light">
                            <tr>
                                <th>اسم المنتج</th>
                                <th>الكود</th>
                                <th>السعر</th>
                                <th>الإجراء</th>
                            </tr>
                        </thead>
                        <tbody id="productPickerList">
                            ${activeProducts.map(product => `
                                <tr class="product-pick-item" data-id="${product.id}" style="cursor: pointer;">
                                    <td>${this.escapeHtml(product.name)}</td>
                                    <td>${this.escapeHtml(product.code || '-')}</td>
                                    <td>${product.price ? formatNumber(product.price) : '0'}</td>
                                    <td>
                                        <button class="btn btn-sm btn-primary" onclick="SalesModule.selectProductFromPicker('${product.id}', '${row.dataset.rowIndex}')">
                                            <i class="fas fa-check"></i> اختر
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        Swal.fire({
            title: 'اختيار منتج',
            html: content,
            width: 800,
            showCancelButton: true,
            confirmButtonText: 'إلغاء',
            focusConfirm: false,
            didOpen: () => {
                const searchInput = document.getElementById('productPickerSearch');
                if (searchInput) {
                    // Focus the search input after modal is opened (accessibility fix)
                    setTimeout(() => {
                        searchInput.focus();
                    }, 100);
                    
                    searchInput.addEventListener('input', (e) => {
                        const query = e.target.value.toLowerCase();
                        const items = document.querySelectorAll('.product-pick-item');
                        items.forEach(item => {
                            const name = item.querySelector('td:first-child')?.textContent.toLowerCase() || '';
                            const code = item.querySelector('td:nth-child(2)')?.textContent.toLowerCase() || '';
                            if (name.includes(query) || code.includes(query)) {
                                item.style.display = '';
                            } else {
                                item.style.display = 'none';
                            }
                        });
                    });
                }
            }
        });
    },

    /**
     * Select product from picker
     */
    async selectProductFromPicker(productId, rowIndex) {
        const tbody = document.getElementById('saleItemsBody');
        if (!tbody) return;
        
        const row = Array.from(tbody.querySelectorAll('tr')).find(r => r.dataset.rowIndex === rowIndex);
        if (!row) return;
        
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const productDisplayInput = row.querySelector('.product-display-input');
        const productHiddenInput = row.querySelector('.product-select-id');
        
        if (productDisplayInput && productHiddenInput) {
            productDisplayInput.value = `${product.name}${product.code ? ' - ' + product.code : ''}`;
            productHiddenInput.value = product.id;
            await this.handleProductSelection(row, product);
        }
        
        Swal.close();
    },

    /**
     * Handle product selection and initialize unit autocomplete
     */
    async handleProductSelection(row, product) {
        try {
            const fullProduct = await Collections.getProduct(product.id);
            if (!fullProduct) {
                if (typeof showError === 'function') {
                    showError('المنتج المحدد غير موجود');
                }
                return;
            }

            // Get pricing mode from settings
            const settings = await this.getSettings();
            const pricingMode = settings.defaultPricingMode || 'retail'; // 'retail' or 'wholesale'

            const availableUnits = [];
            const productCurrency = fullProduct.currency || 'IQD';
            const hasSubUnits = fullProduct.subUnits && fullProduct.subUnits.length > 0;

            // Determine main unit price based on pricing mode
            let mainUnitPrice = 0;
            if (pricingMode === 'wholesale') {
                mainUnitPrice = fullProduct.wholesalePrice || fullProduct.salePrice || 0;
            } else {
                mainUnitPrice = fullProduct.salePrice || fullProduct.price || 0;
            }

            // Add main unit
            if (fullProduct.unitId) {
                const mainUnit = this.units.find(u => u.id === fullProduct.unitId);
                if (mainUnit) {
                    availableUnits.push({
                        unit: mainUnit,
                        price: mainUnitPrice,
                        currency: productCurrency,
                        conversion: 1,
                        conversionType: 'multiply',
                        isMain: true
                    });
                }
            }

            // Add sub-units
            if (hasSubUnits) {
                fullProduct.subUnits.forEach(subUnit => {
                    const unit = this.units.find(u => u.id === subUnit.unitId);
                    if (unit) {
                        let subUnitPrice;
                        // Check if sub-unit has specific price for the pricing mode
                        if (pricingMode === 'wholesale') {
                            if (subUnit.wholesalePrice !== undefined && subUnit.wholesalePrice !== null && subUnit.wholesalePrice > 0) {
                                subUnitPrice = subUnit.wholesalePrice;
                            } else if (subUnit.salePrice !== undefined && subUnit.salePrice !== null && subUnit.salePrice > 0) {
                                subUnitPrice = subUnit.salePrice;
                            } else {
                                // Calculate from main unit price
                                const conversionType = subUnit.conversionType || 'multiply';
                                const conversionFactor = parseFloat(subUnit.conversionFactor) || 1;
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
                        } else {
                            // Retail pricing mode
                            if (subUnit.salePrice !== undefined && subUnit.salePrice !== null && subUnit.salePrice > 0) {
                                subUnitPrice = subUnit.salePrice;
                            } else if (subUnit.price !== undefined && subUnit.price !== null && subUnit.price > 0) {
                                subUnitPrice = subUnit.price;
                            } else {
                                // Calculate from main unit price
                                const conversionType = subUnit.conversionType || 'multiply';
                                const conversionFactor = parseFloat(subUnit.conversionFactor) || 1;
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
                        }
                        availableUnits.push({
                            unit: unit,
                            price: subUnitPrice,
                            currency: productCurrency,
                            conversion: parseFloat(subUnit.conversionFactor) || 1,
                            conversionType: subUnit.conversionType || 'multiply',
                            isMain: false
                        });
                    }
                });
            }

            // Initialize unit picker
            const unitContainer = row.querySelector('.unit-autocomplete-container');
            const unitHiddenInput = row.querySelector('.unit-select-id');
            if (unitContainer && unitHiddenInput && availableUnits.length > 0) {
                unitContainer.innerHTML = `
                    <div class="input-group">
                        <input type="text" class="form-control form-control-sm unit-display-input" 
                               placeholder="اختر الوحدة" 
                               readonly 
                               style="background-color: #f8f9fa; cursor: pointer;">
                        <button class="btn btn-outline-secondary btn-sm unit-picker-btn" type="button" title="اختر الوحدة">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                `;
                
                const unitDisplayInput = unitContainer.querySelector('.unit-display-input');
                const unitPickerBtn = unitContainer.querySelector('.unit-picker-btn');
                
                row.dataset.availableUnits = JSON.stringify(availableUnits);
                row.dataset.productId = fullProduct.id;
                
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
                
                setTimeout(() => {
                    const mainUnitItem = availableUnits.find(u => u.isMain);
                    if (mainUnitItem && unitDisplayInput) {
                        let displayName = mainUnitItem.unit.name;
                        if (mainUnitItem.isMain && hasSubUnits) {
                            displayName = `${mainUnitItem.unit.name} (الوحدة الأساسية)`;
                        }
                        unitDisplayInput.value = displayName;
                        unitHiddenInput.value = mainUnitItem.unit.id;
                        this.handleUnitSelection(row, mainUnitItem, fullProduct);
                    }
                    // Also update available quantities button after unit is set
                    setTimeout(() => {
                        this.updateAvailableQuantitiesButton(row);
                    }, 50);
                }, 100);
            }

            row.dataset.productCurrency = productCurrency;
            row.dataset.productId = fullProduct.id;

            // Show/hide expiry date and serial number fields
            const expiryDateInput = row.querySelector('.expiry-date-input');
            const serialNumberInput = row.querySelector('.serial-number-input');
            
            if (expiryDateInput) {
                const hasExpiry = fullProduct.hasExpiryDate || false;
                const forceExpiry = fullProduct.forceExpiryOnInput || false;
                expiryDateInput.style.display = hasExpiry ? 'block' : 'none';
                expiryDateInput.required = hasExpiry || forceExpiry;
                if (hasExpiry || forceExpiry) {
                    expiryDateInput.classList.add('required-field');
                } else {
                    expiryDateInput.classList.remove('required-field');
                }
                if (!hasExpiry) {
                    expiryDateInput.value = '';
                }
            }

            if (serialNumberInput) {
                const hasSerial = fullProduct.hasSerialNumber || false;
                const forceSerial = fullProduct.forceSerialOnInput || false;
                serialNumberInput.style.display = hasSerial ? 'block' : 'none';
                serialNumberInput.required = hasSerial || forceSerial;
                if (hasSerial || forceSerial) {
                    serialNumberInput.classList.add('required-field');
                } else {
                    serialNumberInput.classList.remove('required-field');
                }
                if (!hasSerial) {
                    serialNumberInput.value = '';
                }
            }
            
            row.dataset.hasExpiry = (fullProduct.hasExpiryDate || false).toString();
            row.dataset.hasSerial = (fullProduct.hasSerialNumber || false).toString();
            row.dataset.forceExpiry = (fullProduct.forceExpiryOnInput || false).toString();
            row.dataset.forceSerial = (fullProduct.forceSerialOnInput || false).toString();

            // Load inventory details (expiry dates, serial numbers) based on warehouse
            await this.loadProductInventoryDetails(row);

            // Update available quantities button visibility
            this.updateAvailableQuantitiesButton(row);

            this.calculateItemTotal(row);
            this.validateProductConstraints(row);

        } catch (error) {
            console.error('Error handling product selection:', error);
            if (typeof showError === 'function') {
                showError('خطأ في تحميل بيانات المنتج: ' + error.message);
            }
        }
    },

    /**
     * Update available quantities button visibility
     */
    updateAvailableQuantitiesButton(row) {
        if (!row) {
            return;
        }

        // Try multiple selectors to find the button
        // First, try direct search in row
        let availableQtyBtn = row.querySelector('.sale-show-available-qty-btn');
        
        // If not found, try finding it in the quantity cell
        if (!availableQtyBtn) {
            const quantityCell = row.querySelector('.col-quantity');
            if (quantityCell) {
                // Try direct search in quantity cell
                availableQtyBtn = quantityCell.querySelector('.sale-show-available-qty-btn');
                
                // If still not found, try finding it in the input-group
                if (!availableQtyBtn) {
                    const inputGroup = quantityCell.querySelector('.input-group');
                    if (inputGroup) {
                        availableQtyBtn = inputGroup.querySelector('.sale-show-available-qty-btn');
                    }
                }
                
                // If still not found, try finding all buttons in quantity cell
                if (!availableQtyBtn) {
                    const allButtons = quantityCell.querySelectorAll('button');
                    allButtons.forEach(btn => {
                        if (btn.classList.contains('sale-show-available-qty-btn')) {
                            availableQtyBtn = btn;
                        }
                    });
                }
            }
        }
        
        // If still not found, try finding it by searching all buttons in the row
        if (!availableQtyBtn) {
            const allButtons = row.querySelectorAll('button');
            allButtons.forEach(btn => {
                if (btn.classList.contains('sale-show-available-qty-btn')) {
                    availableQtyBtn = btn;
                }
            });
        }

        if (!availableQtyBtn) {
            // Button not found - check if row has the correct structure
            const quantityCell = row.querySelector('.col-quantity');
            const inputGroup = quantityCell?.querySelector('.input-group');
            const hasQuantityInput = quantityCell?.querySelector('.quantity-input');
            const allButtonsInCell = quantityCell?.querySelectorAll('button') || [];
            
            console.warn('Available quantities button not found in row', {
                rowIndex: row.dataset.rowIndex,
                hasRow: !!row,
                hasQuantityCell: !!quantityCell,
                hasInputGroup: !!inputGroup,
                hasQuantityInput: !!hasQuantityInput,
                buttonsInCell: allButtonsInCell.length,
                buttonClasses: Array.from(allButtonsInCell).map(btn => btn.className),
                quantityCellHTML: quantityCell?.innerHTML?.substring(0, 500) || 'N/A'
            });
            return;
        }

        const productId = row.querySelector('.product-select-id')?.value;
        const unitId = row.querySelector('.unit-select-id')?.value;
        const warehouseId = document.getElementById('saleWarehouseId')?.value;

        // Show button only if product, unit, and warehouse are selected
        if (productId && unitId && warehouseId) {
            availableQtyBtn.style.display = 'inline-block';
        } else {
            availableQtyBtn.style.display = 'none';
        }
    },

    /**
     * Show available quantities modal
     */
    async showAvailableQuantities(row) {
        const productId = row.querySelector('.product-select-id')?.value;
        const unitId = row.querySelector('.unit-select-id')?.value;
        const warehouseId = document.getElementById('saleWarehouseId')?.value;

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
        const productNameEl = document.getElementById('saleAvailableQtyProductName');
        const unitNameEl = document.getElementById('saleAvailableQtyUnitName');
        const warehouseNameEl = document.getElementById('saleAvailableQtyWarehouseName');

        if (productNameEl) productNameEl.textContent = product.name || '-';
        if (unitNameEl) unitNameEl.textContent = unit.name || '-';
        if (warehouseNameEl) warehouseNameEl.textContent = warehouse.name || '-';

        // Show loading
        const tbody = document.getElementById('saleAvailableQuantitiesTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted">
                        <i class="fas fa-spinner fa-spin"></i> جاري التحميل...
                    </td>
                </tr>
            `;
        }

        // Open modal
        const modal = new bootstrap.Modal(document.getElementById('saleAvailableQuantitiesModal'));
        modal.show();

        // Load available quantities
        try {
            const quantities = await this.getAvailableQuantitiesForSale(productId, unitId, warehouseId, product);
            
            // Store row reference for later use (store row index instead of row object)
            const modalEl = document.getElementById('saleAvailableQuantitiesModal');
            if (modalEl && row) {
                modalEl.dataset.currentRowIndex = row.dataset.rowIndex || '';
            }

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
                            <td>${item.expiryDate ? formatDate(new Date(item.expiryDate)) : '-'}</td>
                            <td>${item.serialNumber || '-'}</td>
                            <td class="text-end">${formatNumber(item.quantityInMainUnit)}</td>
                            <td class="text-end">${formatNumber(item.quantityInSelectedUnit)}</td>
                            <td>
                                <input type="number" 
                                       class="form-control form-control-sm sale-qty-select-input" 
                                       min="0" 
                                       max="${item.quantityInSelectedUnit}" 
                                       step="0.01" 
                                       value="0"
                                       data-index="${index}"
                                       data-max-qty="${item.quantityInSelectedUnit}"
                                       style="width: 100px; margin: 0 auto;"
                                       oninput="this.value = Math.min(this.value, ${item.quantityInSelectedUnit})">
                            </td>
                            <td>${item.purchaseInvoiceNo || '-'}</td>
                            <td>${item.purchaseDate ? formatDate(new Date(item.purchaseDate)) : '-'}</td>
                            <td>
                                <button class="btn btn-sm btn-primary apply-sale-qty-btn" 
                                        data-index="${index}"
                                        data-row-data='${JSON.stringify(item).replace(/'/g, "&apos;")}'
                                        title="تطبيق الكمية المباعة">
                                    <i class="fas fa-check"></i> تطبيق
                                </button>
                            </td>
                        </tr>
                    `).join('');
                    
                    // Setup event listeners for quantity inputs to prevent exceeding available quantity
                    const qtyInputs = tbody.querySelectorAll('.sale-qty-select-input');
                    qtyInputs.forEach(input => {
                        input.addEventListener('input', () => {
                            const maxQty = parseFloat(input.dataset.maxQty) || 0;
                            const currentValue = parseFloat(input.value) || 0;
                            if (currentValue > maxQty) {
                                input.value = maxQty;
                                showError(`الكمية لا يمكن أن تتجاوز ${formatNumber(maxQty)}`);
                            }
                        });
                    });
                    
                    // Setup event listeners for apply buttons
                    const applyButtons = tbody.querySelectorAll('.apply-sale-qty-btn');
                    applyButtons.forEach(btn => {
                        btn.addEventListener('click', () => {
                            const index = parseInt(btn.dataset.index);
                            const itemData = JSON.parse(btn.dataset.rowData.replace(/&apos;/g, "'"));
                            const qtyInput = tbody.querySelector(`input[data-index="${index}"]`);
                            const selectedQty = parseFloat(qtyInput?.value) || 0;
                            
                            if (selectedQty > 0 && selectedQty <= itemData.quantityInSelectedUnit) {
                                this.applySelectedSaleQuantity(row, itemData, selectedQty);
                                const modalInstance = bootstrap.Modal.getInstance(document.getElementById('saleAvailableQuantitiesModal'));
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
     * Apply selected sale quantity to row
     */
    async applySelectedSaleQuantity(row, itemData, quantity) {
        // Update quantity input
        const quantityInput = row.querySelector('.quantity-input');
        if (quantityInput) {
            quantityInput.value = quantity;
        }

        // Update expiry date if available
        if (itemData.expiryDate) {
            const expiryDateInput = row.querySelector('.expiry-date-input');
            if (expiryDateInput) {
                if (expiryDateInput.tagName === 'SELECT') {
                    expiryDateInput.value = itemData.expiryDate;
                } else {
                    expiryDateInput.value = itemData.expiryDate;
                }
                // Trigger change event to load serial numbers if needed
                expiryDateInput.dispatchEvent(new Event('change'));
            }
        }

        // Update serial number if available
        if (itemData.serialNumber) {
            const serialNumberInput = row.querySelector('.serial-number-input');
            if (serialNumberInput) {
                // Wait a bit for expiry date change to complete, then set serial number
                setTimeout(() => {
                    if (serialNumberInput.tagName === 'SELECT') {
                        serialNumberInput.value = itemData.serialNumber;
                    } else {
                        serialNumberInput.value = itemData.serialNumber;
                    }
                }, 100);
            }
        }

        // Recalculate totals
        this.calculateItemTotal(row);
        this.calculateSaleTotals();

        const expiryInfo = itemData.expiryDate ? `تاريخ الصلاحية: ${formatDate(new Date(itemData.expiryDate))}` : '';
        const serialInfo = itemData.serialNumber ? `الرقم التسلسلي: ${itemData.serialNumber}` : '';
        const detailsInfo = [expiryInfo, serialInfo].filter(Boolean).join(', ');
        
        showSuccess(`تم تطبيق الكمية ${formatNumber(quantity)} بنجاح${detailsInfo ? ` (${detailsInfo})` : ''}`);
    },

    /**
     * Get available quantities for sale
     */
    async getAvailableQuantitiesForSale(productId, unitId, warehouseId, product) {
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
                                if (subUnit && subUnit.conversionFactor && subUnit.conversionFactor > 0) {
                                    const conversionType = subUnit.conversionType || 'multiply';
                                    if (conversionType === 'multiply') {
                                        quantityInMainUnit = quantityInMainUnit * subUnit.conversionFactor;
                                    } else {
                                        quantityInMainUnit = quantityInMainUnit / subUnit.conversionFactor;
                                    }
                                }
                            }

                            const existing = itemMap.get(key);
                            existing.quantityInMainUnit += quantityInMainUnit;
                        }
                    });
                }
            });

            // Get all sales for this product in this warehouse (subtract from available)
            const salesSnapshot = await db.collection('sales')
                .where('warehouseId', '==', warehouseId)
                .where('status', '==', 'completed')
                .get();

            salesSnapshot.forEach(saleDoc => {
                const sale = saleDoc.data();
                if (sale.items && Array.isArray(sale.items)) {
                    sale.items.forEach(item => {
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
                                // Convert sale quantity to main unit
                                let quantityInMainUnit = parseFloat(item.quantity) || 0;
                                if (item.unitId && item.unitId !== product.unitId) {
                                    const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
                                    if (subUnit && subUnit.conversionFactor && subUnit.conversionFactor > 0) {
                                        const conversionType = subUnit.conversionType || 'multiply';
                                        if (conversionType === 'multiply') {
                                            quantityInMainUnit = quantityInMainUnit * subUnit.conversionFactor;
                                        } else {
                                            quantityInMainUnit = quantityInMainUnit / subUnit.conversionFactor;
                                        }
                                    }
                                }

                                const existing = itemMap.get(key);
                                existing.quantityInMainUnit -= quantityInMainUnit;
                            }
                        }
                    });
                }
            });

            // Get all purchase returns for this product in this warehouse (add back to available)
            const purchaseReturnsSnapshot = await db.collection('purchaseReturns')
                .where('warehouseId', '==', warehouseId)
                .where('status', '==', 'completed')
                .get();

            purchaseReturnsSnapshot.forEach(returnDoc => {
                const returnData = returnDoc.data();
                if (returnData.items && Array.isArray(returnData.items)) {
                    returnData.items.forEach(item => {
                        if (item.productId === productId) {
                            // Build key same way
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
                                    if (subUnit && subUnit.conversionFactor && subUnit.conversionFactor > 0) {
                                        const conversionType = subUnit.conversionType || 'multiply';
                                        if (conversionType === 'multiply') {
                                            quantityInMainUnit = quantityInMainUnit * subUnit.conversionFactor;
                                        } else {
                                            quantityInMainUnit = quantityInMainUnit / subUnit.conversionFactor;
                                        }
                                    }
                                }

                                const existing = itemMap.get(key);
                                existing.quantityInMainUnit += quantityInMainUnit;
                            }
                        }
                    });
                }
            });

            // Get all sale returns for this product in this warehouse (add back to available)
            const saleReturnsSnapshot = await db.collection('saleReturns')
                .where('warehouseId', '==', warehouseId)
                .where('status', '==', 'completed')
                .get();

            saleReturnsSnapshot.forEach(returnDoc => {
                const returnData = returnDoc.data();
                if (returnData.items && Array.isArray(returnData.items)) {
                    returnData.items.forEach(item => {
                        if (item.productId === productId) {
                            // Build key same way
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
                                    if (subUnit && subUnit.conversionFactor) {
                                        const conversionType = subUnit.conversionType || 'multiply';
                                        if (conversionType === 'multiply') {
                                            quantityInMainUnit = quantityInMainUnit * subUnit.conversionFactor;
                                        } else {
                                            quantityInMainUnit = quantityInMainUnit / subUnit.conversionFactor;
                                        }
                                    }
                                }

                                const existing = itemMap.get(key);
                                existing.quantityInMainUnit += quantityInMainUnit;
                            }
                        }
                    });
                }
            });

            // Convert quantities to selected unit and filter out zero/negative quantities
            const quantities = Array.from(itemMap.values())
                .filter(item => item.quantityInMainUnit > 0)
                .map(item => {
                    // Convert from main unit to selected unit
                    let quantityInSelectedUnit = item.quantityInMainUnit;
                    if (unitId !== product.unitId) {
                        const subUnit = product.subUnits?.find(su => su.unitId === unitId);
                        if (subUnit && subUnit.conversionFactor && subUnit.conversionFactor > 0) {
                            const conversionType = subUnit.conversionType || 'multiply';
                            if (conversionType === 'multiply') {
                                quantityInSelectedUnit = item.quantityInMainUnit / subUnit.conversionFactor;
                            } else {
                                quantityInSelectedUnit = item.quantityInMainUnit * subUnit.conversionFactor;
                            }
                        }
                    }
                    item.quantityInSelectedUnit = quantityInSelectedUnit;
                    return item;
                })
                .sort((a, b) => {
                    // Sort by expiry date (if available), then by serial number
                    if (a.expiryDate && b.expiryDate) {
                        return new Date(a.expiryDate) - new Date(b.expiryDate);
                    }
                    if (a.serialNumber && b.serialNumber) {
                        return a.serialNumber.localeCompare(b.serialNumber);
                    }
                    return 0;
                });

            return quantities;
        } catch (error) {
            console.error('Error getting available quantities for sale:', error);
            throw error;
        }
    },

    /**
     * Load available expiry dates and serial numbers when product is selected
     * Similar to purchase returns module
     */
    async loadProductInventoryDetails(row) {
        const productHiddenInput = row.querySelector('.product-select-id');
        const warehouseId = document.getElementById('saleWarehouseId')?.value;
        const expiryDateInput = row.querySelector('.expiry-date-input');
        const serialNumberInput = row.querySelector('.serial-number-input');

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
            const uniqueExpiryDates = [...new Set(inventoryItems.map(item => item.expiryDate).filter(d => d))].sort();
            const uniqueSerialNumbers = [...new Set(inventoryItems.map(item => item.serialNumber).filter(s => s))].sort();

            // Update expiry date input if product has expiry tracking
            if (hasExpiry && expiryDateInput) {
                // Convert to select dropdown if not already
                if (expiryDateInput.tagName === 'INPUT' && expiryDateInput.type === 'date') {
                    // Keep as date input but show available stock info
                    expiryDateInput.setAttribute('title', `متاح: ${uniqueExpiryDates.length} تاريخ صلاحية`);
                } else if (expiryDateInput.tagName === 'SELECT') {
                    expiryDateInput.innerHTML = '<option value="">-- اختر تاريخ الصلاحية --</option>';
                    uniqueExpiryDates.forEach(expiryDate => {
                        const option = document.createElement('option');
                        option.value = expiryDate;
                        const formattedDate = formatDate(new Date(expiryDate));
                        const count = inventoryItems.filter(item => item.expiryDate === expiryDate).length;
                        option.textContent = `${formattedDate} (${count} رقم تسلسلي)`;
                        expiryDateInput.appendChild(option);
                    });

                    if (uniqueExpiryDates.length === 0) {
                        const option = document.createElement('option');
                        option.value = '';
                        option.textContent = 'لا توجد تواريخ صلاحية متاحة';
                        option.disabled = true;
                        expiryDateInput.appendChild(option);
                    }
                }
            }

            // Update serial number input if product has serial tracking
            if (hasSerial && serialNumberInput) {
                // Convert to select dropdown if not already
                if (serialNumberInput.tagName === 'INPUT' && serialNumberInput.type === 'text') {
                    // Keep as text input but show available stock info
                    serialNumberInput.setAttribute('title', `متاح: ${uniqueSerialNumbers.length} رقم تسلسلي`);
                } else if (serialNumberInput.tagName === 'SELECT') {
                    serialNumberInput.innerHTML = '<option value="">-- اختر الرقم التسلسلي --</option>';
                    uniqueSerialNumbers.forEach(serialNumber => {
                        const option = document.createElement('option');
                        option.value = serialNumber;
                        const count = inventoryItems.filter(item => item.serialNumber === serialNumber).length;
                        option.textContent = `${serialNumber} (${count} تاريخ صلاحية)`;
                        serialNumberInput.appendChild(option);
                    });

                    if (uniqueSerialNumbers.length === 0) {
                        const option = document.createElement('option');
                        option.value = '';
                        option.textContent = 'لا توجد أرقام تسلسلية متاحة';
                        option.disabled = true;
                        serialNumberInput.appendChild(option);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading inventory details:', error);
        }
    },

    /**
     * Handle expiry date selection - load available serial numbers
     */
    async handleExpiryDateSelection(row) {
        const productHiddenInput = row.querySelector('.product-select-id');
        const warehouseId = document.getElementById('saleWarehouseId')?.value;
        const expiryDateInput = row.querySelector('.expiry-date-input');
        const serialNumberInput = row.querySelector('.serial-number-input');

        if (!productHiddenInput?.value || !warehouseId || !expiryDateInput?.value) {
            return;
        }

        try {
            const serialNumbers = await Collections.getAvailableSerialNumbers(
                productHiddenInput.value,
                warehouseId,
                expiryDateInput.value
            );

            // Update serial number input
            if (serialNumberInput && serialNumberInput.tagName === 'SELECT') {
                serialNumberInput.innerHTML = '<option value="">-- اختر الرقم التسلسلي --</option>';
                serialNumbers.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.serialNumber;
                    option.textContent = `${item.serialNumber} (متاح: ${formatNumber(item.quantity)})`;
                    serialNumberInput.appendChild(option);
                });

                if (serialNumbers.length === 0) {
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = 'لا توجد أرقام تسلسلية متاحة';
                    option.disabled = true;
                    serialNumberInput.appendChild(option);
                }
            }
        } catch (error) {
            console.error('Error loading serial numbers:', error);
        }
    },

    /**
     * Handle serial number selection - load available expiry dates
     */
    async handleSerialNumberSelection(row) {
        const productHiddenInput = row.querySelector('.product-select-id');
        const warehouseId = document.getElementById('saleWarehouseId')?.value;
        const expiryDateInput = row.querySelector('.expiry-date-input');
        const serialNumberInput = row.querySelector('.serial-number-input');

        if (!productHiddenInput?.value || !warehouseId || !serialNumberInput?.value) {
            return;
        }

        try {
            const expiryDates = await Collections.getAvailableExpiryDates(
                productHiddenInput.value,
                warehouseId,
                serialNumberInput.value
            );

            // Update expiry date input
            if (expiryDateInput && expiryDateInput.tagName === 'SELECT') {
                expiryDateInput.innerHTML = '<option value="">-- اختر تاريخ الصلاحية --</option>';
                expiryDates.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.expiryDate;
                    const formattedDate = formatDate(new Date(item.expiryDate));
                    option.textContent = `${formattedDate} (متاح: ${formatNumber(item.quantity)})`;
                    expiryDateInput.appendChild(option);
                });

                if (expiryDates.length === 0) {
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = 'لا توجد تواريخ صلاحية متاحة';
                    option.disabled = true;
                    expiryDateInput.appendChild(option);
                }
            }
        } catch (error) {
            console.error('Error loading expiry dates:', error);
        }
    },

    /**
     * Validate product constraints for a row
     */
    validateProductConstraints(row) {
        const productHiddenInput = row.querySelector('.product-select-id');
        if (!productHiddenInput || !productHiddenInput.value) {
            return true;
        }

        const productId = productHiddenInput.value;
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            return true;
        }

        let isValid = true;
        const hasExpiry = product.hasExpiryDate || false;
        const hasSerial = product.hasSerialNumber || false;
        const forceExpiry = product.forceExpiryOnInput || false;
        const forceSerial = product.forceSerialOnInput || false;

        if (hasExpiry || forceExpiry) {
            const expiryDateInput = row.querySelector('.expiry-date-input');
            if (expiryDateInput) {
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

        if (hasSerial || forceSerial) {
            const serialNumberInput = row.querySelector('.serial-number-input');
            if (serialNumberInput) {
                const isVisible = serialNumberInput.style.display !== 'none';
                if (isVisible) {
                    const quantity = parseFloat(row.querySelector('.quantity-input')?.value) || 0;
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
     * Open unit picker modal for selecting a unit
     */
    openUnitPicker(row, availableUnits, product) {
        if (!row || !availableUnits || availableUnits.length === 0) return;
        
        const unitDisplayInput = row.querySelector('.unit-display-input');
        const unitHiddenInput = row.querySelector('.unit-select-id');
        const currentUnitId = unitHiddenInput?.value || '';
        
        const content = `
            <div style="text-align: start;">
                <div class="mb-3">
                    <input type="text" id="unitPickerSearch" class="form-control" 
                           placeholder="ابحث عن الوحدة...">
                </div>
                <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                    <table class="table table-bordered">
                        <thead class="table-light">
                            <tr>
                                <th>اسم الوحدة</th>
                                <th>النوع</th>
                                <th>معامل التحويل</th>
                                <th>السعر</th>
                                <th>الإجراء</th>
                            </tr>
                        </thead>
                        <tbody id="unitPickerList">
                            ${availableUnits.map((unitItem, index) => {
                                const isSelected = unitItem.unit.id === currentUnitId;
                                let typeText = '';
                                if (unitItem.isMain) {
                                    typeText = 'الوحدة الأساسية';
                                } else {
                                    typeText = unitItem.conversionType === 'multiply' ? 'ضرب' : 'قسمة';
                                }
                                return `
                                    <tr class="unit-pick-item" data-unit-item='${JSON.stringify(unitItem).replace(/'/g, "&apos;")}' 
                                        style="cursor: pointer; ${isSelected ? 'background-color: #316ac5 !important; color: white;' : ''}">
                                        <td>${this.escapeHtml(unitItem.unit.name)}</td>
                                        <td>${typeText}</td>
                                        <td>${unitItem.isMain ? '-' : unitItem.conversion}</td>
                                        <td>${unitItem.price ? formatNumber(unitItem.price) : '0'} ${unitItem.currency || 'IQD'}</td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" onclick="SalesModule.selectUnitFromPicker('${row.dataset.rowIndex}', '${unitItem.unit.id}')">
                                                <i class="fas fa-check"></i> اختر
                                            </button>
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
            width: 800,
            showCancelButton: true,
            confirmButtonText: 'إلغاء',
            focusConfirm: false,
            didOpen: () => {
                const searchInput = document.getElementById('unitPickerSearch');
                if (searchInput) {
                    // Focus the search input after modal is opened (accessibility fix)
                    setTimeout(() => {
                        searchInput.focus();
                    }, 100);
                }
            }
        });
    },

    /**
     * Select unit from picker
     */
    selectUnitFromPicker(rowIndex, unitId) {
        const tbody = document.getElementById('saleItemsBody');
        if (!tbody) return;
        
        const row = Array.from(tbody.querySelectorAll('tr')).find(r => r.dataset.rowIndex === rowIndex);
        if (!row) return;
        
        const availableUnitsStr = row.dataset.availableUnits;
        if (!availableUnitsStr) return;
        
        try {
            const availableUnits = JSON.parse(availableUnitsStr);
            const unitItem = availableUnits.find(u => u.unit.id === unitId);
            if (!unitItem) return;
            
            const productId = row.dataset.productId;
            const product = this.products.find(p => p.id === productId);
            if (!product) return;
            
            this.selectUnit(row, unitItem, product);
            Swal.close();
        } catch (error) {
            console.error('Error selecting unit:', error);
        }
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
            this.handleUnitSelection(row, unitItem, product);
        }
    },

    /**
     * Handle unit selection
     */
    handleUnitSelection(row, unitItem, product) {
        const priceInput = row.querySelector('.price-input');
        if (priceInput && unitItem) {
            row.dataset.selectedUnitId = unitItem.unit.id;
            row.dataset.unitPrice = unitItem.price;
            row.dataset.unitCurrency = unitItem.currency;
            row.dataset.unitConversion = unitItem.conversion;
            row.dataset.unitConversionType = unitItem.conversionType;

            this.updatePriceForSelectedUnit(row);
            
            // Update available quantities button visibility
            this.updateAvailableQuantitiesButton(row);
        }
    },

    /**
     * Update price based on selected unit
     */
    updatePriceForSelectedUnit(row) {
        const priceInput = row.querySelector('.price-input');
        if (!priceInput) return;
        
        const unitPrice = parseFloat(row.dataset.unitPrice) || 0;
        const productCurrency = row.dataset.unitCurrency || 'IQD';
        
        if (unitPrice > 0) {
            const invoiceCurrency = document.getElementById('saleCurrency')?.value || 'IQD';
            const invoiceExchangeRate = parseFloat(document.getElementById('saleExchangeRate')?.value) || 1;
            const baseCurrency = this.currencies.find(c => c.isBaseCurrency)?.code || 'IQD';
            
            let convertedPrice = unitPrice;
            
            if (productCurrency !== invoiceCurrency) {
                const productCurrencyObj = this.currencies.find(c => c.code === productCurrency);
                const invoiceCurrencyObj = this.currencies.find(c => c.code === invoiceCurrency);
                
                if (productCurrencyObj && invoiceCurrencyObj) {
                    let priceInBase = unitPrice;
                    
                    if (productCurrency !== baseCurrency) {
                        if (productCurrencyObj.exchangeRate && productCurrencyObj.exchangeRate > 0) {
                            priceInBase = unitPrice / productCurrencyObj.exchangeRate;
                        }
                    }
                    
                    if (invoiceCurrency !== baseCurrency) {
                        if (invoiceCurrencyObj.exchangeRate && invoiceCurrencyObj.exchangeRate > 0) {
                            convertedPrice = priceInBase * invoiceCurrencyObj.exchangeRate;
                        } else {
                            convertedPrice = priceInBase;
                        }
                    } else {
                        convertedPrice = priceInBase;
                    }
                }
            }
            
            priceInput.value = convertedPrice.toFixed(2);
            row.dataset.originalPrice = unitPrice.toString();
            row.dataset.originalCurrency = productCurrency;
            row.dataset.convertedPrice = convertedPrice.toString();
            row.dataset.invoiceCurrency = invoiceCurrency;
            
            this.calculateItemTotal(row);
        } else {
            priceInput.value = '0';
            delete row.dataset.originalPrice;
            delete row.dataset.originalCurrency;
            delete row.dataset.convertedPrice;
            delete row.dataset.invoiceCurrency;
            this.calculateItemTotal(row);
        }
    },

    /**
     * Setup real-time sync for sales module
     */
    setupSalesSync() {
        // Sync sales
        if (typeof SyncManager !== 'undefined') {
            SyncManager.onCollectionSync('sales', (data, syncType) => {
                this.sales = data;
                this.renderSalesTable();
                this.updateDashboard();
                console.log(`🔄 Sales updated via ${syncType} sync`);
            });

            // Sync customers (from parties collection)
            SyncManager.onCollectionSync('parties', (data, syncType) => {
                // Filter customers only
                this.customers = data.filter(p => p.type === 'customer');
                this.renderCustomersTable();
                this.updateDashboard();
                console.log(`🔄 Customers updated via ${syncType} sync`);
            });
        }

        // Also listen to custom events
        window.addEventListener('dataSync', (event) => {
            const { collection, data } = event.detail;
            if (collection === 'sales') {
                this.sales = data;
                this.renderSalesTable();
                this.updateDashboard();
            } else if (collection === 'parties') {
                this.customers = data.filter(p => p.type === 'customer');
                this.renderCustomersTable();
                this.updateDashboard();
            }
        });
    },

    /**
     * Load settings
     */
    async loadSettings() {
        try {
            console.log('⚙️ Loading sales settings...');
            
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
            const warehouseSelect = document.getElementById('defaultSaleWarehouse');
            if (warehouseSelect) {
                warehouseSelect.innerHTML = '<option value="">-- اختر المستودع الافتراضي --</option>';
                this.warehouses.forEach(warehouse => {
                    warehouseSelect.innerHTML += `
                        <option value="${warehouse.id}">${warehouse.name}</option>
                    `;
                });
            }

            // Load cost centers
            const costCenterSelect = document.getElementById('defaultSaleCostCenter');
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
            const currencySelect = document.getElementById('defaultSaleCurrency');
            if (currencySelect) {
                currencySelect.value = settings.defaultCurrency || 'IQD';
            }

            // Set default payment method
            const paymentMethodSelect = document.getElementById('defaultSalePaymentMethod');
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
            const autoGenerateInvoiceNumbers = document.getElementById('autoGenerateSaleInvoiceNumbers');
            if (autoGenerateInvoiceNumbers) {
                autoGenerateInvoiceNumbers.checked = settings.autoGenerateInvoiceNumbers !== false;
            }

            // Auto update stock
            const autoUpdateStock = document.getElementById('autoUpdateSaleStock');
            if (autoUpdateStock) {
                autoUpdateStock.checked = settings.autoUpdateStock !== false;
            }

            // Auto generate general entry
            const autoGenerateGeneralEntry = document.getElementById('autoGenerateSaleGeneralEntry');
            if (autoGenerateGeneralEntry) {
                autoGenerateGeneralEntry.checked = settings.autoGenerateGeneralEntry !== false;
            }

            // Allow sale without stock
            const allowSaleWithoutStock = document.getElementById('allowSaleWithoutStock');
            if (allowSaleWithoutStock) {
                allowSaleWithoutStock.checked = settings.allowSaleWithoutStock === true;
            }

            // Default tax rate
            const defaultTaxRate = document.getElementById('defaultSaleTaxRate');
            if (defaultTaxRate) {
                defaultTaxRate.value = settings.defaultTaxRate || 0;
            }

            // Default pricing mode
            const defaultPricingMode = document.getElementById('defaultSalePricingMode');
            if (defaultPricingMode) {
                defaultPricingMode.value = settings.defaultPricingMode || 'retail';
            }
            
            // Default sales account (Credit Account for Sales)
            const defaultSalesAccount = document.getElementById('defaultSaleSalesAccount');
            const defaultSalesAccountDisplay = document.getElementById('defaultSaleSalesAccountDisplay');
            if (defaultSalesAccount && settings.defaultSalesAccountId) {
                defaultSalesAccount.value = settings.defaultSalesAccountId;
                const account = this.accounts.find(a => a.id === settings.defaultSalesAccountId);
                if (defaultSalesAccountDisplay && account) {
                    defaultSalesAccountDisplay.value = account.name;
                }
            }
            
            // Default debit account (for Cash payments)
            const defaultDebitAccount = document.getElementById('defaultSaleDebitAccount');
            const defaultDebitAccountDisplay = document.getElementById('defaultSaleDebitAccountDisplay');
            if (defaultDebitAccount && settings.defaultDebitAccountId) {
                defaultDebitAccount.value = settings.defaultDebitAccountId;
                const account = this.accounts.find(a => a.id === settings.defaultDebitAccountId);
                if (defaultDebitAccountDisplay && account) {
                    defaultDebitAccountDisplay.value = account.name;
                }
            }
            
            // Default payment account (for partial payments)
            const defaultPaymentAccount = document.getElementById('defaultSalePaymentAccount');
            const defaultPaymentAccountDisplay = document.getElementById('defaultSalePaymentAccountDisplay');
            if (defaultPaymentAccount && settings.defaultPaymentAccountId) {
                defaultPaymentAccount.value = settings.defaultPaymentAccountId;
                const account = this.accounts.find(a => a.id === settings.defaultPaymentAccountId);
                if (defaultPaymentAccountDisplay && account) {
                    defaultPaymentAccountDisplay.value = account.name;
                }
            }
            
            // Default addition counter account
            const defaultAdditionCounterAccount = document.getElementById('defaultSaleAdditionCounterAccount');
            const defaultAdditionCounterAccountDisplay = document.getElementById('defaultSaleAdditionCounterAccountDisplay');
            if (defaultAdditionCounterAccount && settings.defaultAdditionCounterAccountId) {
                defaultAdditionCounterAccount.value = settings.defaultAdditionCounterAccountId;
                const account = this.accounts.find(a => a.id === settings.defaultAdditionCounterAccountId);
                if (defaultAdditionCounterAccountDisplay && account) {
                    defaultAdditionCounterAccountDisplay.value = account.name;
                }
            }
            
            // Default discount counter account
            const defaultDiscountCounterAccount = document.getElementById('defaultSaleDiscountCounterAccount');
            const defaultDiscountCounterAccountDisplay = document.getElementById('defaultSaleDiscountCounterAccountDisplay');
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
            const defaultCurrency = document.getElementById('defaultSaleCurrency').value;
            const defaultPaymentMethod = document.getElementById('defaultSalePaymentMethod').value;
            const defaultWarehouse = document.getElementById('defaultSaleWarehouse').value;
            const defaultCostCenter = document.getElementById('defaultSaleCostCenter').value;
            const defaultPricingMode = document.getElementById('defaultSalePricingMode')?.value || 'retail';

            const settings = await this.getSettings();
            settings.defaultCurrency = defaultCurrency;
            settings.defaultPaymentMethod = defaultPaymentMethod;
            settings.defaultWarehouse = defaultWarehouse;
            settings.defaultCostCenter = defaultCostCenter;
            settings.defaultPricingMode = defaultPricingMode;

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
            const autoGenerateInvoiceNumbers = document.getElementById('autoGenerateSaleInvoiceNumbers').checked;
            const autoUpdateStock = document.getElementById('autoUpdateSaleStock').checked;
            const autoGenerateGeneralEntry = document.getElementById('autoGenerateSaleGeneralEntry').checked;
            const allowSaleWithoutStock = document.getElementById('allowSaleWithoutStock')?.checked || false;
            const defaultTaxRate = parseFloat(document.getElementById('defaultSaleTaxRate').value) || 0;
            
            const defaultSalesAccount = document.getElementById('defaultSaleSalesAccount');
            const defaultSalesAccountId = defaultSalesAccount ? defaultSalesAccount.value : '';
            
            const defaultDebitAccount = document.getElementById('defaultSaleDebitAccount');
            const defaultDebitAccountId = defaultDebitAccount ? defaultDebitAccount.value : '';
            
            const defaultAdditionCounterAccount = document.getElementById('defaultSaleAdditionCounterAccount');
            const defaultAdditionCounterAccountId = defaultAdditionCounterAccount ? defaultAdditionCounterAccount.value : '';
            
            const defaultDiscountCounterAccount = document.getElementById('defaultSaleDiscountCounterAccount');
            const defaultDiscountCounterAccountId = defaultDiscountCounterAccount ? defaultDiscountCounterAccount.value : '';
            
            const defaultPaymentAccount = document.getElementById('defaultSalePaymentAccount');
            const defaultPaymentAccountId = defaultPaymentAccount ? defaultPaymentAccount.value : '';

            const settings = await this.getSettings();
            settings.autoGenerateInvoiceNumbers = autoGenerateInvoiceNumbers;
            settings.autoUpdateStock = autoUpdateStock;
            settings.autoGenerateGeneralEntry = autoGenerateGeneralEntry;
            settings.allowSaleWithoutStock = allowSaleWithoutStock;
            settings.defaultTaxRate = defaultTaxRate;
            settings.defaultSalesAccountId = defaultSalesAccountId || '';
            settings.defaultDebitAccountId = defaultDebitAccountId || '';
            settings.defaultPaymentAccountId = defaultPaymentAccountId || '';
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
                invoiceNo: document.getElementById('printSaleInvoiceNo').checked,
                date: document.getElementById('printSaleDate').checked,
                paymentMethod: document.getElementById('printSalePaymentMethod').checked,
                status: document.getElementById('printSaleStatus').checked,
                costCenter: document.getElementById('printSaleCostCenter').checked,
                warehouse: document.getElementById('printSaleWarehouse').checked,
                customerName: document.getElementById('printSaleCustomerName').checked,
                customerPhone: document.getElementById('printSaleCustomerPhone').checked,
                customerAddress: document.getElementById('printSaleCustomerAddress').checked,
                subtotal: document.getElementById('printSaleSubtotal').checked,
                discount: document.getElementById('printSaleDiscount').checked,
                addition: document.getElementById('printSaleAddition').checked,
                total: document.getElementById('printSaleTotal').checked,
                paid: document.getElementById('printSalePaid').checked,
                remaining: document.getElementById('printSaleRemaining').checked,
                notes: document.getElementById('printSaleNotes').checked,
                productName: document.getElementById('printSaleProductName').checked,
                productQuantity: document.getElementById('printSaleProductQuantity').checked,
                productUnit: document.getElementById('printSaleProductUnit').checked,
                productUnitPrice: document.getElementById('printSaleProductUnitPrice').checked,
                productTotal: document.getElementById('printSaleProductTotal').checked,
                productDiscount: document.getElementById('printSaleProductDiscount').checked,
                productAddition: document.getElementById('printSaleProductAddition').checked,
                productExpiryDate: document.getElementById('printSaleProductExpiryDate').checked,
                productSerialNumber: document.getElementById('printSaleProductSerialNumber').checked,
                productNotes: document.getElementById('printSaleProductNotes').checked
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
                customerName: true,
                customerPhone: true,
                customerAddress: true,
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
                'customerName', 'customerPhone', 'customerAddress',
                'subtotal', 'discount', 'addition', 'total', 'paid', 'remaining', 'notes',
                'productName', 'productQuantity', 'productUnit', 'productUnitPrice', 'productTotal',
                'productDiscount', 'productAddition', 'productExpiryDate', 'productSerialNumber', 'productNotes'
            ];

            fields.forEach(field => {
                const checkbox = document.getElementById(`printSale${field.charAt(0).toUpperCase() + field.slice(1)}`);
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
                    allowSaleWithoutStock: false,
                    defaultTaxRate: 0,
                    defaultSalesAccountId: '',
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
                        customerName: true,
                        customerPhone: true,
                        customerAddress: true,
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
            link.download = 'sales-settings.json';
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
                
                if (target.id === 'openDefaultSaleSalesAccountPicker') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openAccountPicker('defaultSaleSalesAccount', 'defaultSaleSalesAccountDisplay');
                } else if (target.id === 'openDefaultSaleDebitAccountPicker') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openAccountPicker('defaultSaleDebitAccount', 'defaultSaleDebitAccountDisplay');
                } else if (target.id === 'openDefaultSaleAdditionCounterAccountPicker') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openAccountPicker('defaultSaleAdditionCounterAccount', 'defaultSaleAdditionCounterAccountDisplay');
                } else if (target.id === 'openDefaultSaleDiscountCounterAccountPicker') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openAccountPicker('defaultSaleDiscountCounterAccount', 'defaultSaleDiscountCounterAccountDisplay');
                } else if (target.id === 'openDefaultSalePaymentAccountPicker') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openAccountPicker('defaultSalePaymentAccount', 'defaultSalePaymentAccountDisplay');
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
                        <input type="text" id="saleAccountPickerSearch" class="form-control" placeholder="ابحث في الحسابات النهائية...">
                    </div>
                    <small class="text-muted d-block mt-1">
                        <i class="fas fa-info-circle"></i> يتم عرض الحسابات النهائية فقط (التي لا تحتوي على حسابات فرعية)
                    </small>
                </div>
                <div class="list-group" id="saleAccountPickerList" style="max-height: 360px; overflow:auto;">
                    ${leafAccounts.length > 0 ? leafAccounts.map(acc => `
                        <button type="button" class="list-group-item list-group-item-action sale-account-pick-item" data-id="${acc.id}" data-name="${acc.name}">
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
                const searchInput = document.getElementById('saleAccountPickerSearch');
                const items = Array.from(document.querySelectorAll('.sale-account-pick-item'));
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
    }
};

console.log('✅ Sales module loaded');







