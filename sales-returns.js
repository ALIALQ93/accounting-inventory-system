/**
 * Sales Returns Module - Complete Sales Returns Management
 * @module modules/sales-returns
 * 
 * This module handles sales returns (مرتجع المبيعات)
 * Key differences from sales:
 * - Inventory: adds stock instead of subtracting (يزيد المخزون)
 * - Accounting: customer is credited instead of debited (العميل دائن)
 * - Invoice prefix: "SRET-" instead of "SAL-"
 * - Type: 'sale_return' instead of 'sale'
 */

const SalesReturnsModule = {
    // Data storage
    currentTab: 'dashboard',
    saleReturns: [],
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
    editingReturn: null,
    editingCustomer: null,
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
            <div class="sales-returns-module">
                <!-- Header -->
                <div class="module-header">
                    <div class="header-content">
                        <div class="header-title">
                            <i class="fas fa-undo"></i>
                            <h2>إدارة مرتجع المبيعات</h2>
                        </div>
                        <div class="header-actions">
                            <button class="btn btn-primary" id="newSaleReturnBtn">
                                <i class="fas fa-plus"></i> إضافة مرتجع مبيعات
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Navigation Tabs -->
                <ul class="nav nav-tabs" id="saleReturnsTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="dashboard-tab" data-bs-toggle="tab" data-bs-target="#dashboard" type="button" role="tab">
                            <i class="fas fa-tachometer-alt"></i> لوحة التحكم
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="returns-tab" data-bs-toggle="tab" data-bs-target="#returns" type="button" role="tab">
                            <i class="fas fa-undo"></i> مرتجع المبيعات
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="settings-tab" data-bs-toggle="tab" data-bs-target="#settings" type="button" role="tab">
                            <i class="fas fa-cogs"></i> الإعدادات
                        </button>
                    </li>
                </ul>

                <!-- Tab Content -->
                <div class="tab-content" id="saleReturnsTabContent">
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
                                                    <th>العميل</th>
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
                                    <h5><i class="fas fa-undo"></i> قائمة مرتجع المبيعات</h5>
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
                                <h3><i class="fas fa-cogs"></i> إعدادات مرتجع المبيعات</h3>
                                <p>تكوين الإعدادات الافتراضية لفواتير مرتجع المبيعات</p>
                            </div>
                            
                            <div class="row">
                                <!-- Default Values Settings -->
                                <div class="col-md-6">
                                    <div class="settings-card">
                                        <div class="card-header">
                                            <h5><i class="fas fa-sliders-h text-primary"></i> القيم الافتراضية</h5>
                                            <p class="text-muted">تحديد القيم الافتراضية لفواتير مرتجع المبيعات الجديدة</p>
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
                                                    العملة الافتراضية لفواتير مرتجع المبيعات الجديدة
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
                                                    طريقة الدفع الافتراضية لفواتير مرتجع المبيعات الجديدة
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
                                                    المستودع الافتراضي لمرتجع المبيعات الجديدة
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
                                                    مركز الكلفة الافتراضي لفواتير مرتجع المبيعات الجديدة
                                                </small>
                                            </div>
                                            
                                            <!-- Save Default Values Button -->
                                            <div class="d-grid">
                                                <button class="btn btn-primary" onclick="SalesReturnsModule.saveDefaultValues()">
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
                                            <p class="text-muted">تكوين الإعدادات العامة لوحدة مرتجع المبيعات</p>
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
                                                    توليد أرقام فواتير مرتجع المبيعات تلقائياً عند الإنشاء
                                                </small>
                                            </div>
                                            
                                            <!-- Auto Update Stock -->
                                            <div class="mb-4">
                                                <div class="form-check form-switch">
                                                    <input class="form-check-input" type="checkbox" id="autoUpdateReturnStock" checked>
                                                    <label class="form-check-label" for="autoUpdateReturnStock">
                                                        <i class="fas fa-boxes text-success"></i>
                                                        تحديث المخزون تلقائياً (زيادة)
                                                    </label>
                                                </div>
                                                <small class="text-muted">
                                                    زيادة كميات المخزون تلقائياً عند حفظ فاتورة مرتجع المبيعات
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
                                                    توليد القيد المحاسبي تلقائياً عند حفظ فاتورة مرتجع المبيعات (العميل دائن)
                                                </small>
                                            </div>
                                            
                                            <!-- Save General Settings Button -->
                                            <div class="d-grid">
                                                <button class="btn btn-success" onclick="SalesReturnsModule.saveGeneralSettings()">
                                                    <i class="fas fa-save"></i> حفظ الإعدادات العامة
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
        console.log('🔄 Loading sales returns module...');
        this.render();
        await this.loadData();
        this.setupReturnsSync();
        console.log('✅ Sales returns module loaded');
    },

    async loadData() {
        try {
            console.log('🔄 Loading sales returns data...');
            await Promise.all([
                this.loadSaleReturns(),
                this.loadCustomers(),
                this.loadProducts(),
                this.loadUnits(),
                this.loadCurrencies(),
                this.loadWarehouses(),
                this.loadCostCenters(),
                this.loadAccounts()
            ]);
            this.updateDashboard();
            console.log('✅ All sales returns data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading sales returns data:', error);
        }
    },

    async loadSaleReturns() {
        try {
            const snapshot = await db.collection('saleReturns').get();
            this.saleReturns = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.renderReturnsTable();
        } catch (error) {
            console.error('Error loading sale returns:', error);
        }
    },

    async loadCustomers() {
        try {
            const snapshot = await db.collection('parties').get();
            this.customers = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(party => party.type === 'customer' || party.type === 'both');
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
        const totalCustomersEl = document.getElementById('totalCustomers');
        const pendingReturnsEl = document.getElementById('pendingReturns');

        if (totalReturnsEl) {
            totalReturnsEl.textContent = (this.saleReturns || []).length;
        }
        
        if (totalAmountEl) {
            const totalAmount = (this.saleReturns || []).reduce((sum, ret) => sum + (ret.total || 0), 0);
            totalAmountEl.textContent = formatNumber(totalAmount);
        }
        
        if (totalCustomersEl) {
            totalCustomersEl.textContent = (this.customers || []).length;
        }
        
        if (pendingReturnsEl) {
            const pendingReturns = (this.saleReturns || []).filter(r => r.status === 'pending').length;
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

        const recentReturns = (this.saleReturns || []).slice(0, 5);
        
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
                    <td>${ret.customerName || 'N/A'}</td>
                    <td>${formatNumber(ret.total || 0)}</td>
                    <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="SalesReturnsModule.viewReturn('${ret.id}')" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="SalesReturnsModule.printReturn('${ret.id}')" title="طباعة">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="SalesReturnsModule.editReturn('${ret.id}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="SalesReturnsModule.deleteReturn('${ret.id}')" title="حذف">
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
        let filteredReturns = (this.saleReturns || []);
        
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filteredReturns = filteredReturns.filter(ret => {
                const invoiceNo = (ret.invoiceNo || '').toLowerCase();
                const customerName = (ret.customerName || '').toLowerCase();
                return invoiceNo.includes(searchLower) || customerName.includes(searchLower);
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
                    <td>${ret.customerName || 'N/A'}</td>
                    <td>${formatNumber(ret.total || 0)}</td>
                    <td>${formatNumber(ret.paidAmount || 0)}</td>
                    <td>${formatNumber(ret.remainingAmount || 0)}</td>
                    <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="SalesReturnsModule.viewReturn('${ret.id}')" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="SalesReturnsModule.viewReturnGeneralEntry('${ret.id}')" title="عرض القيد العام">
                            <i class="fas fa-file-contract"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="SalesReturnsModule.printReturn('${ret.id}')" title="طباعة الفاتورة">
                            <i class="fas fa-print"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="SalesReturnsModule.editReturn('${ret.id}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="SalesReturnsModule.deleteReturn('${ret.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    setupReturnsSync() {
        if (typeof SyncManager !== 'undefined') {
            // Sync sale returns
            SyncManager.onCollectionSync('saleReturns', (data, syncType) => {
                this.saleReturns = data;
                this.renderReturnsTable();
                this.updateDashboard();
                console.log(`🔄 Sale returns updated via ${syncType} sync`);
            });

            // Sync customers (from parties)
            SyncManager.onCollectionSync('parties', (data, syncType) => {
                this.customers = data
                    .filter(party => party.type === 'customer' || party.type === 'both')
                    .map(party => ({
                        id: party.id,
                        name: party.name || '',
                        ...party
                    }));
                console.log(`🔄 Customers updated via ${syncType} sync`);
            });
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // New return button
        const newReturnBtn = document.getElementById('newSaleReturnBtn');
        if (newReturnBtn) {
            newReturnBtn.addEventListener('click', () => {
                this.showNewReturnModal();
            });
        }

        // Search and filter
        const searchInput = document.getElementById('returnSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.renderReturnsTable();
            });
        }

        const statusFilter = document.getElementById('returnStatusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.renderReturnsTable();
            });
        }

        const dateFrom = document.getElementById('returnDateFrom');
        if (dateFrom) {
            dateFrom.addEventListener('change', () => {
                this.renderReturnsTable();
            });
        }

        const dateTo = document.getElementById('returnDateTo');
        if (dateTo) {
            dateTo.addEventListener('change', () => {
                this.renderReturnsTable();
            });
        }

        const clearFiltersBtn = document.getElementById('clearReturnFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearReturnFilters();
            });
        }

        // Report generation
        const generateReportBtn = document.getElementById('generateReturnReport');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => {
                this.generateReport();
            });
        }
    },

    /**
     * Clear return filters
     */
    clearReturnFilters() {
        document.getElementById('returnSearch').value = '';
        document.getElementById('returnDateFrom').value = '';
        document.getElementById('returnDateTo').value = '';
        document.getElementById('returnStatusFilter').value = '';
        this.renderReturnsTable();
    },

    /**
     * Show new return modal
     */
    showNewReturnModal() {
        this.editingReturn = null;
        this.showSaleReturnModal();
    },

    /**
     * Show sale return modal (similar to purchase return modal but for sales)
     */
    showSaleReturnModal() {
        const modalHTML = `
            <div class="modal fade" id="saleReturnModal" tabindex="-1">
                <div class="modal-dialog modal-fullscreen">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-undo"></i>
                                ${this.editingReturn ? 'تعديل فاتورة مرتجع المبيعات' : 'إضافة فاتورة مرتجع مبيعات جديدة'}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="saleReturnForm">
                                <!-- Return Header -->
                                <div class="row mb-3">
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="saleReturnInvoiceNo" class="form-label">رقم الفاتورة</label>
                                            <input type="text" id="saleReturnInvoiceNo" class="form-control" readonly style="background-color: #f8f9fa;">
                                            <small class="form-text text-muted">سيتم توليد الرقم تلقائياً (SRET-)</small>
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="saleReturnDate" class="form-label">تاريخ الفاتورة *</label>
                                            <input type="date" id="saleReturnDate" class="form-control" required>
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="saleReturnCustomer" class="form-label">العميل *</label>
                                            <div class="input-group">
                                                <input type="text" id="saleReturnCustomerDisplay" class="form-control" placeholder="اختر العميل" readonly style="background-color: #f8f9fa;">
                                                <input type="hidden" id="saleReturnCustomerId" value="">
                                                <button type="button" class="btn btn-outline-secondary" id="openSaleReturnCustomerPicker" title="اختر العميل">
                                                    <i class="fas fa-search"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="saleReturnCurrency" class="form-label">عملة الفاتورة</label>
                                            <select id="saleReturnCurrency" class="form-select">
                                                ${this.currencies.map(currency => `
                                                    <option value="${currency.code}" ${currency.code === 'IQD' ? 'selected' : ''}>${currency.name}</option>
                                                `).join('')}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="saleReturnExchangeRate" class="form-label">سعر الصرف</label>
                                            <input type="number" id="saleReturnExchangeRate" class="form-control" value="1" min="0" step="0.0001">
                                        </div>
                                    </div>
                                    <div class="col-md-2">
                                        <div class="form-group">
                                            <label for="saleReturnWarehouse" class="form-label">المستودع *</label>
                                            <div class="input-group">
                                                <input type="text" id="saleReturnWarehouseDisplay" class="form-control" placeholder="اختر المستودع" readonly style="background-color: #f8f9fa;">
                                                <input type="hidden" id="saleReturnWarehouseId" value="">
                                                <button type="button" class="btn btn-outline-secondary" id="openSaleReturnWarehousePicker" title="اختر المستودع">
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
                                            <label for="saleReturnCostCenter" class="form-label">مركز الكلفة</label>
                                            <div class="input-group">
                                                <input type="text" id="saleReturnCostCenterDisplay" class="form-control" placeholder="اختر مركز الكلفة" readonly style="background-color: #f8f9fa;">
                                                <input type="hidden" id="saleReturnCostCenterId" value="">
                                                <button type="button" class="btn btn-outline-secondary" id="openSaleReturnCostCenterPicker" title="اختر مركز الكلفة">
                                                    <i class="fas fa-search"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="saleReturnPaymentTerms" class="form-label">شروط الدفع</label>
                                            <input type="text" id="saleReturnPaymentTerms" class="form-control" placeholder="مثال: صافي 30 يوم">
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="saleReturnSalesRep1" class="form-label">المندوب الأول</label>
                                            <div class="input-group">
                                                <input type="text" id="saleReturnSalesRep1Display" class="form-control" placeholder="اختر المندوب الأول" readonly style="background-color: #f8f9fa;">
                                                <input type="hidden" id="saleReturnSalesRep1Id" value="">
                                                <button type="button" class="btn btn-outline-secondary" id="openSaleReturnSalesRep1Picker" title="اختر المندوب الأول">
                                                    <i class="fas fa-search"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="form-group">
                                            <label for="saleReturnSalesRep2" class="form-label">المندوب الثاني</label>
                                            <div class="input-group">
                                                <input type="text" id="saleReturnSalesRep2Display" class="form-control" placeholder="اختر المندوب الثاني" readonly style="background-color: #f8f9fa;">
                                                <input type="hidden" id="saleReturnSalesRep2Id" value="">
                                                <button type="button" class="btn btn-outline-secondary" id="openSaleReturnSalesRep2Picker" title="اختر المندوب الثاني">
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
                                                <button type="button" class="btn btn-sm btn-outline-primary me-2" id="addSaleReturnItem">
                                                    <i class="fas fa-plus"></i> إضافة منتج
                                                </button>
                                                <button type="button" class="btn btn-sm btn-outline-success me-2" id="copySelectedSaleReturnRows">
                                                    <i class="fas fa-copy"></i> نسخ المحدد
                                                </button>
                                                <button type="button" class="btn btn-sm btn-outline-info me-2" id="pasteSaleReturnRows">
                                                    <i class="fas fa-paste"></i> لصق
                                                </button>
                                                <button type="button" class="btn btn-sm btn-outline-danger me-2" id="deleteSelectedSaleReturnRows">
                                                    <i class="fas fa-trash"></i> حذف المحدد
                                                </button>
                                                <button type="button" class="btn btn-sm btn-outline-secondary" id="toggleSaleReturnColumns">
                                                    <i class="fas fa-eye"></i> إظهار/إخفاء الأعمدة
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <!-- Column Visibility Controls -->
                                        <div class="column-controls mb-2" id="saleReturnColumnControls" style="display: none;">
                                            <div class="row">
                                                <div class="col-md-12">
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input column-toggle" type="checkbox" id="saleReturn-col-product" checked>
                                                        <label class="form-check-label" for="saleReturn-col-product">المنتج</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input column-toggle" type="checkbox" id="saleReturn-col-quantity" checked>
                                                        <label class="form-check-label" for="saleReturn-col-quantity">الكمية</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input column-toggle" type="checkbox" id="saleReturn-col-unit" checked>
                                                        <label class="form-check-label" for="saleReturn-col-unit">الوحدة</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input column-toggle" type="checkbox" id="saleReturn-col-price" checked>
                                                        <label class="form-check-label" for="saleReturn-col-price">سعر الوحدة</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input column-toggle" type="checkbox" id="saleReturn-col-discount" checked>
                                                        <label class="form-check-label" for="saleReturn-col-discount">الخصم %</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input column-toggle" type="checkbox" id="saleReturn-col-addition-percent" checked>
                                                        <label class="form-check-label" for="saleReturn-col-addition-percent">نسبة الإضافة %</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input column-toggle" type="checkbox" id="saleReturn-col-addition" checked>
                                                        <label class="form-check-label" for="saleReturn-col-addition">مبلغ الإضافة</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input column-toggle" type="checkbox" id="saleReturn-col-expiry" checked>
                                                        <label class="form-check-label" for="saleReturn-col-expiry">تاريخ الصلاحية</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input column-toggle" type="checkbox" id="saleReturn-col-serial" checked>
                                                        <label class="form-check-label" for="saleReturn-col-serial">الرقم التسلسلي</label>
                                                    </div>
                                                    <div class="form-check form-check-inline">
                                                        <input class="form-check-input column-toggle" type="checkbox" id="saleReturn-col-notes" checked>
                                                        <label class="form-check-label" for="saleReturn-col-notes">ملاحظات</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="position-relative">
                                            <div class="table-responsive" id="saleReturnItemsTableContainer" 
                                                 style="max-height: 500px; overflow-x: auto; overflow-y: auto; position: relative; border: 2px solid #d0d7e5; border-radius: 4px; background: #fff;">
                                                <style>
                                                    #saleReturnItemsTableContainer {
                                                        overflow-x: auto !important;
                                                        overflow-y: auto !important;
                                                        scrollbar-width: thin;
                                                        scrollbar-color: #888 #f1f1f1;
                                                    }
                                                    #saleReturnItemsTableContainer::-webkit-scrollbar {
                                                        width: 16px;
                                                        height: 16px;
                                                    }
                                                    #saleReturnItemsTableContainer::-webkit-scrollbar-track {
                                                        background: #f1f1f1;
                                                        border-radius: 4px;
                                                    }
                                                    #saleReturnItemsTableContainer::-webkit-scrollbar-thumb {
                                                        background: #888;
                                                        border-radius: 4px;
                                                        border: 2px solid #f1f1f1;
                                                    }
                                                    #saleReturnItemsTableContainer::-webkit-scrollbar-thumb:hover {
                                                        background: #555;
                                                    }
                                                    .required-field {
                                                        border: 2px solid #dc3545 !important;
                                                        background-color: #fff5f5 !important;
                                                    }
                                                </style>
                                                <table class="table table-bordered mb-0" id="saleReturnItemsTable" 
                                                       style="margin-bottom: 0; font-size: 0.9rem; border-collapse: collapse; width: 100%; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #fff; min-width: 2000px;">
                                                    <thead style="background: #f2f3f4; position: sticky; top: 0; z-index: 10;">
                                                        <tr>
                                                            <th width="3%" style="border: 1px solid #d0d7e5; padding: 8px; text-align: center; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 50px;">
                                                                <input type="checkbox" id="selectAllSaleReturnRows" title="تحديد الكل" style="cursor: pointer; width: 18px; height: 18px;">
                                                            </th>
                                                            <th width="4%" style="border: 1px solid #d0d7e5; padding: 8px; text-align: center; min-width: 50px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem;">#</th>
                                                            <th width="17%" class="saleReturn-col-product" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 150px;">المنتج *</th>
                                                            <th width="7%" class="saleReturn-col-quantity" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 80px;">الكمية *</th>
                                                            <th width="7%" class="saleReturn-col-unit" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 80px;">الوحدة</th>
                                                            <th width="6%" class="saleReturn-col-available-qty" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 80px; text-align: center;">الكميات</th>
                                                            <th width="8%" class="saleReturn-col-price" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 100px;">سعر الوحدة *</th>
                                                            <th width="6%" class="saleReturn-col-discount" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 80px;">الخصم %</th>
                                                            <th width="6%" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 100px;">مبلغ الخصم</th>
                                                            <th width="6%" class="saleReturn-col-addition-percent" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 80px;">نسبة الإضافة %</th>
                                                            <th width="6%" class="saleReturn-col-addition" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 100px;">مبلغ الإضافة</th>
                                                            <th width="8%" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 100px;">المجموع</th>
                                                            <th width="8%" class="saleReturn-col-expiry" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 120px;">تاريخ الصلاحية</th>
                                                            <th width="8%" class="saleReturn-col-serial" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 120px;">الرقم التسلسلي</th>
                                                            <th width="12%" class="saleReturn-col-notes" style="border: 1px solid #d0d7e5; padding: 8px; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 150px;">ملاحظات</th>
                                                            <th width="4%" style="border: 1px solid #d0d7e5; padding: 8px; text-align: center; background: #e7e9ec !important; font-weight: 600; font-size: 0.85rem; min-width: 60px;">الإجراءات</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="saleReturnItemsBody">
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
                                                <button type="button" class="btn btn-sm btn-outline-warning me-2" id="addSaleReturnDiscount">
                                                    <i class="fas fa-minus"></i> إضافة خصم
                                                </button>
                                                <button type="button" class="btn btn-sm btn-outline-success" id="addSaleReturnAddition">
                                                    <i class="fas fa-plus"></i> إضافة إضافة
                                                </button>
                                            </div>
                                        </div>
                                        <div class="table-responsive">
                                            <table class="table table-bordered table-hover" id="saleReturnDiscountsAdditionsTable">
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
                                                <tbody id="saleReturnDiscountsAdditionsBody">
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
                                            <label for="saleReturnNotes" class="form-label">ملاحظات</label>
                                            <textarea id="saleReturnNotes" class="form-control" rows="3"></textarea>
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
                                                    <span id="saleReturnSubtotal">0.00</span> <span id="saleReturnSubtotalCurrency">IQD</span>
                                                </div>
                                            </div>
                                            
                                            <div class="row mb-2">
                                                <div class="col-6">
                                                    <label class="form-label">إجمالي الخصومات:</label>
                                                </div>
                                                <div class="col-6">
                                                    <span id="saleReturnTotalDiscounts">0.00</span> <span id="saleReturnDiscountCurrency">IQD</span>
                                                </div>
                                            </div>
                                            
                                            <div class="row mb-2">
                                                <div class="col-6">
                                                    <label class="form-label">إجمالي الإضافات:</label>
                                                </div>
                                                <div class="col-6">
                                                    <span id="saleReturnTotalAdditions">0.00</span> <span id="saleReturnAdditionCurrency">IQD</span>
                                                </div>
                                            </div>
                                            
                                            <hr>
                                            <div class="row mb-2">
                                                <div class="col-6">
                                                    <label class="form-label"><strong>المجموع الإجمالي:</strong></label>
                                                </div>
                                                <div class="col-6">
                                                    <strong><span id="saleReturnTotal">0.00</span> <span id="saleReturnTotalCurrency">IQD</span></strong>
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
                                                    <label for="saleReturnPaymentMethod" class="form-label">طريقة الدفع</label>
                                                    <select id="saleReturnPaymentMethod" class="form-select">
                                                        <option value="cash">نقدي</option>
                                                        <option value="credit">آجل</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="form-group">
                                                    <label for="saleReturnPaidAmount" class="form-label">المبلغ المدفوع</label>
                                                    <input type="number" id="saleReturnPaidAmount" class="form-control" min="0" step="0.01" value="0">
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="form-group">
                                                    <label for="saleReturnDueDate" class="form-label">تاريخ الاستحقاق</label>
                                                    <input type="date" id="saleReturnDueDate" class="form-control">
                                                </div>
                                            </div>
                                            <div class="col-md-3">
                                                <div class="form-group">
                                                    <label for="saleReturnRemainingAmount" class="form-label">المبلغ المتبقي</label>
                                                    <input type="number" id="saleReturnRemainingAmount" class="form-control" readonly style="background-color: #f8f9fa;">
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Payment Status -->
                                        <div class="row mt-2">
                                            <div class="col-md-3">
                                                <div class="form-group">
                                                    <label for="saleReturnPaymentStatus" class="form-label">حالة الدفع</label>
                                                    <select id="saleReturnPaymentStatus" class="form-select" disabled style="background-color: #f8f9fa; cursor: not-allowed;" title="يتم تحديث حالة الدفع تلقائياً بناءً على المبلغ المدفوع">
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
                                                                    <input class="form-check-input" type="checkbox" id="generateSaleReturnGeneralEntry" checked>
                                                                    <label class="form-check-label" for="generateSaleReturnGeneralEntry">
                                                                        توليد قيد عام تلقائي
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <div class="col-md-6">
                                                                <div class="form-group">
                                                                    <label for="saleReturnGeneralEntryDescription" class="form-label">وصف القيد</label>
                                                                    <input type="text" id="saleReturnGeneralEntryDescription" class="form-control" placeholder="وصف القيد العام">
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="row">
                                                            <div class="col-md-12">
                                                                <div class="alert alert-info">
                                                                    <i class="fas fa-info-circle"></i>
                                                                    <strong>ملاحظة:</strong> سيتم توليد القيد العام تلقائياً عند حفظ الفاتورة مع ربط الحسابات التالية:
                                                                    <ul class="mb-0 mt-2">
                                                                        <li>مدين: حساب مرتجع المبيعات</li>
                                                                        <li>دائن: حساب العميل أو النقدية (دائن)</li>
                                                                        <li>إضافي: حسابات الضرائب والخصومات</li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="row mt-3">
                                                            <div class="col-md-12">
                                                                <button type="button" class="btn btn-outline-info btn-sm" id="previewSaleReturnGeneralEntryBtn">
                                                                    <i class="fas fa-eye"></i> معاينة القيد المتوقع
                                                                </button>
                                                                <button type="button" class="btn btn-outline-secondary btn-sm ms-2" id="refreshSaleReturnGeneralEntryPreviewBtn" style="display: none;">
                                                                    <i class="fas fa-sync-alt"></i> تحديث المعاينة
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div class="row mt-2">
                                                            <div class="col-md-12">
                                                                <div id="saleReturnGeneralEntryPreview" style="display: none;">
                                                                    <div class="card border-info">
                                                                        <div class="card-header bg-info text-white">
                                                                            <h6 class="mb-0"><i class="fas fa-file-contract"></i> معاينة القيد المتوقع</h6>
                                                                        </div>
                                                                        <div class="card-body">
                                                                            <div id="saleReturnGeneralEntryPreviewContent">
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
                            <button type="button" class="btn btn-secondary" id="cancelSaleReturnBtn" data-bs-dismiss="modal">إلغاء</button>
                            <button type="button" class="btn btn-primary" id="saveSaleReturnBtn">
                                <i class="fas fa-save"></i> حفظ الفاتورة
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Customer Picker Modal -->
            <div class="modal fade" id="saleReturnCustomerPickerModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-truck"></i> اختر العميل</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <input type="text" id="saleReturnCustomerPickerSearch" class="form-control" placeholder="ابحث عن العميل...">
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
                                    <tbody id="saleReturnCustomerPickerTableBody">
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
            <div class="modal fade" id="saleReturnWarehousePickerModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-warehouse"></i> اختر المستودع</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <input type="text" id="saleReturnWarehousePickerSearch" class="form-control" placeholder="ابحث عن المستودع...">
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
                                    <tbody id="saleReturnWarehousePickerTableBody">
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
            <div class="modal fade" id="saleReturnCostCenterPickerModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-building"></i> اختر مركز الكلفة</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <input type="text" id="saleReturnCostCenterPickerSearch" class="form-control" placeholder="ابحث عن مركز الكلفة...">
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
                                    <tbody id="saleReturnCostCenterPickerTableBody">
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
            <div class="modal fade" id="saleReturnSalesRepPickerModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-user-tie"></i> اختر المندوب</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <input type="text" id="saleReturnSalesRepPickerSearch" class="form-control" placeholder="ابحث عن المندوب...">
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
                                    <tbody id="saleReturnSalesRepPickerTableBody">
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
            <div class="modal fade" id="saleReturnAvailableQuantitiesModal" tabindex="-1">
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
                                        <strong>المنتج:</strong> <span id="saleReturnAvailableQtyProductName">-</span>
                                    </div>
                                    <div class="col-md-4">
                                        <strong>الوحدة:</strong> <span id="saleReturnAvailableQtyUnitName">-</span>
                                    </div>
                                    <div class="col-md-4">
                                        <strong>المستودع:</strong> <span id="saleReturnAvailableQtyWarehouseName">-</span>
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
                                    <tbody id="saleReturnAvailableQuantitiesTableBody">
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
        const existingModal = document.getElementById('saleReturnModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('saleReturnModal'));
        modal.show();

        // Reload customers to ensure we have the latest data
        this.loadCustomers().then(() => {
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
        document.getElementById('saleReturnDate').value = new Date().toISOString().split('T')[0];

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
     * Generate return invoice number (SRET- prefix)
     */
    async generateReturnInvoiceNo() {
        try {
            const settings = await this.getSettings();
            if (!settings.autoGenerateInvoiceNumbers) {
                return '';
            }

            const prefix = 'SRET-';
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
            return `SRET-${Date.now()}`;
        }
    },

    /**
     * Collect return form data
     */
    collectReturnData() {
        const items = [];
        const tbody = document.getElementById('saleReturnItemsBody');
        if (!tbody) return null;
        
        const rows = tbody.children;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const productHiddenInput = row.querySelector('.saleReturn-product-select-id');
            const productId = productHiddenInput?.value || '';
            
            const productInput = row.querySelector('.saleReturn-product-display-input');
            const productName = productInput?.value || '';
            
            const quantity = parseFloat(row.querySelector('.saleReturn-quantity-input')?.value) || 0;
            const price = parseFloat(row.querySelector('.saleReturn-price-input')?.value) || 0;
            const discountPercent = parseFloat(row.querySelector('.saleReturn-discount-percent-input')?.value) || 0;
            const discountAmount = parseFloat(row.querySelector('.saleReturn-discount-amount-input')?.value) || 0;
            const additionPercent = parseFloat(row.querySelector('.saleReturn-addition-percent-input')?.value) || 0;
            const additionAmount = parseFloat(row.querySelector('.saleReturn-addition-amount-input')?.value) || 0;
            const total = parseFloat(row.querySelector('.saleReturn-total-input')?.value) || 0;
            
            const unitHiddenInput = row.querySelector('.saleReturn-unit-select-id');
            const unitId = unitHiddenInput?.value || '';
            
            const expiryDateInput = row.querySelector('.saleReturn-expiry-date-input');
            const serialNumberInput = row.querySelector('.saleReturn-serial-number-input');
            const notesInput = row.querySelector('.saleReturn-notes-input');

            if (productId && quantity > 0 && price > 0) {
                const product = this.products.find(p => p.id === productId);
                const productCurrency = product?.currency || 'IQD';
                
                const invoiceCurrency = document.getElementById('saleReturnCurrency')?.value || 'IQD';
                const invoiceExchangeRate = parseFloat(document.getElementById('saleReturnExchangeRate')?.value) || 1;
                
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
        const discountRows = document.querySelectorAll('#saleReturnDiscountsAdditionsBody tr');
        discountRows.forEach(row => {
            const type = row.querySelector('.saleReturn-type-select')?.value;
            const accountSelect = row.querySelector('.return-account-select');
            const accountId = accountSelect?.value || '';
            const accountName = row.querySelector('.return-account-name-display')?.value || '';
            const counterAccountSelect = row.querySelector('.return-counter-account-select');
            const counterAccountId = counterAccountSelect?.value || '';
            const counterAccountName = row.querySelector('.return-counter-account-name-display')?.value || '';
            const amount = parseFloat(row.querySelector('.saleReturn-amount-input')?.value) || 0;
            const currency = row.querySelector('.return-currency-select')?.value || 'IQD';
            const notes = row.querySelector('.saleReturn-notes-input')?.value || '';

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

        const total = parseFloat(document.getElementById('saleReturnTotal')?.textContent) || 0;
        const paidAmount = parseFloat(document.getElementById('saleReturnPaidAmount')?.value) || 0;
        let paymentStatus = 'unpaid';
        if (paidAmount >= total) {
            paymentStatus = 'paid';
        } else if (paidAmount > 0) {
            paymentStatus = 'partial';
        }

        const customerId = document.getElementById('saleReturnCustomerId')?.value || '';
        const customerDisplay = document.getElementById('saleReturnCustomerDisplay');
        let customerName = customerDisplay?.value || '';
        if (!customerName && customerId) {
            const customer = this.customers.find(s => s.id === customerId);
            customerName = customer?.name || '';
        }
        
        const warehouseId = document.getElementById('saleReturnWarehouseId')?.value || '';
        const costCenterId = document.getElementById('saleReturnCostCenterId')?.value || '';
        const salesRep1Id = document.getElementById('saleReturnSalesRep1Id')?.value || '';
        const salesRep2Id = document.getElementById('saleReturnSalesRep2Id')?.value || '';

        return {
            invoiceNo: document.getElementById('saleReturnInvoiceNo')?.value.trim() || '',
            date: document.getElementById('saleReturnDate')?.value || new Date().toISOString().split('T')[0],
            customerId: customerId,
            customerName: customerName,
            currency: document.getElementById('saleReturnCurrency')?.value || 'IQD',
            exchangeRate: parseFloat(document.getElementById('saleReturnExchangeRate')?.value) || 1,
            warehouseId: warehouseId,
            costCenterId: costCenterId,
            salesRep1Id: salesRep1Id,
            salesRep2Id: salesRep2Id,
            items: items,
            subtotal: parseFloat(document.getElementById('saleReturnSubtotal')?.textContent) || 0,
            totalDiscounts: totalDiscounts,
            totalAdditions: totalAdditions,
            discountAdditionRows: discountAdditionRows,
            total: total,
            notes: document.getElementById('saleReturnNotes')?.value.trim() || '',
            status: 'completed',
            paymentMethod: document.getElementById('saleReturnPaymentMethod')?.value || 'cash',
            paidAmount: paidAmount,
            remainingAmount: parseFloat(document.getElementById('saleReturnRemainingAmount')?.value) || 0,
            paymentStatus: paymentStatus,
            dueDate: document.getElementById('saleReturnDueDate')?.value || null,
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

        if (!formData.customerId) {
            showError('العميل مطلوب');
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

                // Convert return quantity to main unit
                let quantityInMainUnit = item.quantity;
                if (item.unitId && item.unitId !== product.unitId) {
                    const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
                    if (subUnit && subUnit.conversionFactor) {
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
                
                showSuccess('تم تحديث فاتورة مرتجع المبيعات بنجاح');
                
                // Close modal and reset form
                const modal = bootstrap.Modal.getInstance(document.getElementById('saleReturnModal'));
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
                
                // Generate general entry (sales returns account is debited, customer/cash is credited)
                const generalEntryId = await this.generateSaleReturnGeneralEntry(formData);
                
                showSuccess('تم إضافة فاتورة مرتجع المبيعات بنجاح');
                
                // Show generated general entry if it was created
                if (generalEntryId) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('saleReturnModal'));
                    if (modal) {
                        modal.hide();
                        const modalElement = document.getElementById('saleReturnModal');
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
                    const modal = bootstrap.Modal.getInstance(document.getElementById('saleReturnModal'));
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
            showError('فشل في حفظ فاتورة مرتجع المبيعات: ' + (error.message || 'خطأ غير معروف'));
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
        
        const saleReturnForm = document.getElementById('saleReturnForm');
        if (saleReturnForm) {
            saleReturnForm.reset();
        }
        
        const saleReturnItemsBody = document.getElementById('saleReturnItemsBody');
        if (saleReturnItemsBody) {
            saleReturnItemsBody.innerHTML = '';
        }
        
        const discountsAdditionsBody = document.getElementById('saleReturnDiscountsAdditionsBody');
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
                title: 'تم حفظ فاتورة مرتجع المبيعات بنجاح',
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
    /**
     * Update inventory for sale return (adds stock)
     */
    async updateInventory(returnData) {
        try {
            console.log('📦 Updating inventory for sale return:', returnData.invoiceNo);
            
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

                // تحويل الكمية إلى الوحدة الأساسية
                let quantityInMainUnit = item.quantity;
                
                // إذا كانت الوحدة المختارة مختلفة عن الوحدة الأساسية
                if (item.unitId && item.unitId !== product.unitId) {
                    const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
                    if (subUnit && subUnit.conversionFactor) {
                        // تحديد نوع التحويل: ضرب أو قسمة
                        if (subUnit.conversionType === 'multiply') {
                            // الوحدة الفرعية أكبر من الأساسية (مثل: صندوق = 12 قطعة)
                            quantityInMainUnit = item.quantity * subUnit.conversionFactor;
                        } else {
                            // الوحدة الفرعية أصغر من الأساسية (مثل: كيلوغرام مقابل طن)
                            quantityInMainUnit = item.quantity / subUnit.conversionFactor;
                        }
                        
                        console.log(`🔄 Unit conversion: ${item.quantity} ${item.unitId} = ${quantityInMainUnit} ${product.unitId} (${subUnit.conversionType})`);
                    } else {
                        console.warn(`⚠️ No conversion factor found for unit ${item.unitId}, using quantity as is`);
                    }
                }

                // التحقق من تاريخ الصلاحية والرقم التسلسلي إذا كان المنتج يحتاجهما
                const hasExpiry = product.hasExpiryDate || false;
                const hasSerial = product.hasSerialNumber || false;
                
                // Get current stock before update
                const currentStock = await Collections.getProductWarehouseStock(item.productId);
                const stockInWarehouse = currentStock?.[warehouseId] || 0;
                const previousQuantity = stockInWarehouse;
                const newQuantity = previousQuantity + quantityInMainUnit;
                
                // تحديث المخزون حسب الحالة
                if (hasExpiry || hasSerial) {
                    // إذا كان المنتج يحتوي على تاريخ صلاحية أو رقم تسلسلي،
                    // يجب تحديث المخزون مع مراعاة هذه المعلومات
                    // (هذا يتطلب تحديث في Collections.updateProductWarehouseStock)
                    
                    // حالياً، نقوم بتحديث المخزون العام بالكمية المحولة
                    await Collections.updateProductWarehouseStock(
                        item.productId,
                        warehouseId,
                        quantityInMainUnit,
                        'add' // إضافة المخزون (للمرتجع)
                    );
                    
                    console.log(`📈 Added ${quantityInMainUnit} ${product.unitId || ''} to ${item.productName} in warehouse ${warehouseId}`);
                } else {
                    // المنتج لا يحتوي على تاريخ صلاحية أو رقم تسلسلي
                    // تحديث المخزون مباشرة
                    await Collections.updateProductWarehouseStock(
                        item.productId,
                        warehouseId,
                        quantityInMainUnit,
                        'add' // إضافة المخزون (للمرتجع)
                    );
                    
                    console.log(`📈 Added ${quantityInMainUnit} ${product.unitId || ''} to ${item.productName} in warehouse ${warehouseId}`);
                }
                
                // Record inventory movement
                const warehouse = await Collections.getWarehouse(warehouseId);
                const warehouseName = warehouse ? warehouse.name : 'المستودع الافتراضي';
                
                const movementRecord = {
                    type: 'in',
                    productId: item.productId,
                    productName: item.productName || product.name,
                    warehouseId: warehouseId,
                    warehouseName: warehouseName,
                    fromWarehouseId: null,
                    fromWarehouseName: null,
                    unitId: item.unitId || product.unitId,
                    quantity: quantityInMainUnit,
                    quantityInMainUnit: quantityInMainUnit,
                    expiryDate: item.expiryDate || null,
                    serialNumber: item.serialNumber || null,
                    unitPrice: item.unitPrice || 0,
                    totalCost: (item.unitPrice || 0) * quantityInMainUnit,
                    previousQuantity: previousQuantity,
                    newQuantity: newQuantity,
                    reference: returnData.invoiceNo || `مرتجع مبيعات ${returnData.id || ''}`,
                    notes: `مرتجع مبيعات - ${returnData.customerName || ''}`,
                    date: returnData.date ? new Date(returnData.date) : new Date(),
                    userId: auth.currentUser?.uid || 'system',
                    createdAt: new Date(),
                    sourceType: 'sale_return',
                    sourceId: returnData.id || null
                };
                
                await db.collection('inventoryMovements').add(movementRecord);
                console.log(`📝 Inventory movement recorded for sale return: ${item.productName || product.name}`);
            }

            console.log('✅ Inventory updated successfully for sale return');
        } catch (error) {
            console.error('❌ Error updating inventory for sale return:', error);
            throw error;
        }
    },

    async updateInventoryOnEdit(oldReturnData, newReturnData) {
        try {
            console.log('📦 Updating inventory on edit for sale return:', newReturnData.invoiceNo);
            
            // First, reverse the old return (subtract the stock that was added)
            if (oldReturnData.items && oldReturnData.items.length > 0) {
                for (const item of oldReturnData.items) {
                    const product = await Collections.getProduct(item.productId);
                    if (!product) continue;
                    
                    // تحويل الكمية إلى الوحدة الأساسية مع مراعاة نوع التحويل
                    let quantityInMainUnit = item.quantity;
                    if (item.unitId && item.unitId !== product.unitId) {
                        const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
                        if (subUnit && subUnit.conversionFactor) {
                            // تحديد نوع التحويل: ضرب أو قسمة
                            if (subUnit.conversionType === 'multiply') {
                                quantityInMainUnit = item.quantity * subUnit.conversionFactor;
                            } else {
                                quantityInMainUnit = item.quantity / subUnit.conversionFactor;
                            }
                        }
                    }
                    
                    // Subtract the stock (reverse the return)
                    await Collections.updateProductWarehouseStock(
                        item.productId,
                        oldReturnData.warehouseId || 'default',
                        quantityInMainUnit,
                        'subtract'
                    );
                }
            }
            
            // Then, apply the new return (add the stock)
            if (newReturnData.items && newReturnData.items.length > 0) {
                for (const item of newReturnData.items) {
                    const product = await Collections.getProduct(item.productId);
                    if (!product) continue;
                    
                    // تحويل الكمية إلى الوحدة الأساسية مع مراعاة نوع التحويل
                    let quantityInMainUnit = item.quantity;
                    if (item.unitId && item.unitId !== product.unitId) {
                        const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
                        if (subUnit && subUnit.conversionFactor) {
                            // تحديد نوع التحويل: ضرب أو قسمة
                            if (subUnit.conversionType === 'multiply') {
                                quantityInMainUnit = item.quantity * subUnit.conversionFactor;
                            } else {
                                quantityInMainUnit = item.quantity / subUnit.conversionFactor;
                            }
                        }
                    }
                    
                    // Add the stock (apply the return)
                    await Collections.updateProductWarehouseStock(
                        item.productId,
                        newReturnData.warehouseId || 'default',
                        quantityInMainUnit,
                        'add'
                    );
                }
            }
            
            console.log('✅ Inventory updated successfully on edit');
        } catch (error) {
            console.error('❌ Error updating inventory on edit:', error);
            throw error;
        }
    },

    /**
     * Update or create general entry (for sale returns)
     */
    async updateOrCreateGeneralEntry(returnData) {
        try {
            // Find existing general entry
            const sourceId = String(returnData.id);
            const snapshot = await db.collection('generalEntries')
                .where('sourceId', '==', sourceId)
                .where('type', '==', 'sale_return')
                .limit(1)
                .get();
            
            if (!snapshot.empty) {
                // Update existing entry
                const existingEntry = snapshot.docs[0];
                const newEntryData = await this.calculateExpectedSaleReturnGeneralEntry(returnData);
                await db.collection('generalEntries').doc(existingEntry.id).update({
                    ...newEntryData,
                    updatedAt: new Date(),
                    updatedBy: auth.currentUser?.uid || 'system'
                });
            } else {
                // Create new entry
                await this.generateSaleReturnGeneralEntry(returnData);
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

            // Get customer account (subAccountId only)
            const customer = returnData.customerId ? this.customers.find(s => s.id === returnData.customerId) : null;
            const customerAccountId = customer?.subAccountId || null;
            const customerName = customer?.name || 'غير محدد';

            // For credit payments, customer is required
            if (paymentMethod === 'credit' && !customerAccountId) {
                return null;
            }

            // Get base currency and exchange rate
            const invoiceCurrency = returnData.currency || 'IQD';
            const invoiceExchangeRate = parseFloat(returnData.exchangeRate) || 1;
            const baseCurrency = this.currencies.find(c => c.isBaseCurrency)?.code || 'IQD';

            // ✅ Using shared utility function from InvoiceUtils

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
            const totalInBaseCurrency = InvoiceUtils.convertToBaseCurrency(returnData.total || 0, invoiceCurrency, invoiceExchangeRate, this.currencies);

            // For purchase returns (reversed from purchases):
            // - Customer is DEBITED (العميل مدين)
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
                    description: customerName ? `مرتجع شراء نقدي من ${customerName}` : `مرتجع شراء نقدي رقم ${returnData.invoiceNo || 'جديد'}`
                };
                entryData.entries.push(addAccountInfo(purchaseEntry, purchaseAccountId));
            } else {
                // Credit Payment: Customer account
                if (!customerAccountId) {
                    return null;
                }

                // Debit: Customer account (العميل مدين)
                let customerEntry = {
                    accountId: customerAccountId,
                    debit: totalInBaseCurrency,
                    credit: 0,
                    originalAmount: returnData.total || 0,
                    originalCurrency: invoiceCurrency,
                    description: customerName ? `مرتجع شراء آجل من ${customerName}` : `مرتجع شراء آجل رقم ${returnData.invoiceNo || 'جديد'}`
                };
                entryData.entries.push(addAccountInfo(customerEntry, customerAccountId));

                // Credit: Purchases/Inventory account (المشتريات/المخزون دائن)
                let purchaseEntry = {
                    accountId: purchaseAccountId,
                    debit: 0,
                    credit: totalInBaseCurrency,
                    originalAmount: returnData.total || 0,
                    originalCurrency: invoiceCurrency,
                    description: `مرتجع شراء آجل رقم ${returnData.invoiceNo || 'جديد'} - ${customerName}`
                };
                entryData.entries.push(addAccountInfo(purchaseEntry, purchaseAccountId));
            }

            // Handle discounts and additions (reversed from purchases)
            if (returnData.discountAdditionRows && returnData.discountAdditionRows.length > 0) {
                returnData.discountAdditionRows.forEach(row => {
                    const rowCurrency = row.currency || invoiceCurrency;
                    const rowExchangeRate = row.exchangeRate || invoiceExchangeRate;
                    const amountInBaseCurrency = InvoiceUtils.convertToBaseCurrency(row.amount || 0, rowCurrency, rowExchangeRate, this.currencies);

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

                        const discountCounterAccountId = row.counterAccountId || customerAccountId || settings.defaultReturnDiscountCounterAccount || null;
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

                        const additionCounterAccountId = row.counterAccountId || customerAccountId || settings.defaultReturnAdditionCounterAccount || null;
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
                customerName: document.getElementById('printReturnCustomerName').checked,
                customerPhone: document.getElementById('printReturnCustomerPhone').checked,
                customerAddress: document.getElementById('printReturnCustomerAddress').checked,
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
        const addItemBtn = document.getElementById('addSaleReturnItem');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => {
                this.addSaleReturnItem();
            });
        }

        // Add discount button
        const addDiscountBtn = document.getElementById('addSaleReturnDiscount');
        if (addDiscountBtn) {
            addDiscountBtn.addEventListener('click', () => {
                this.addSaleReturnDiscount();
            });
        }

        // Add addition button
        const addAdditionBtn = document.getElementById('addSaleReturnAddition');
        if (addAdditionBtn) {
            addAdditionBtn.addEventListener('click', () => {
                this.addSaleReturnAddition();
            });
        }

        // Save return button
        const saveBtn = document.getElementById('saveSaleReturnBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveReturn();
            });
        }

        // Payment method change
        const paymentMethod = document.getElementById('saleReturnPaymentMethod');
        if (paymentMethod) {
            paymentMethod.addEventListener('change', () => {
                this.updateReturnPaymentFields();
            });
        }

        // Paid amount change
        const paidAmount = document.getElementById('saleReturnPaidAmount');
        if (paidAmount) {
            paidAmount.addEventListener('input', () => {
                this.calculateReturnRemainingAmount();
            });
        }

        // Currency change
        const currencySelect = document.getElementById('saleReturnCurrency');
        if (currencySelect) {
            currencySelect.addEventListener('change', () => {
                this.calculateReturnTotals();
            });
        }

        // Exchange rate change
        const exchangeRateInput = document.getElementById('saleReturnExchangeRate');
        if (exchangeRateInput) {
            exchangeRateInput.addEventListener('input', () => {
                this.calculateReturnTotals();
            });
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancelSaleReturnBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.cancelReturnForm();
            });
        }

        // Handle modal close event
        const saleReturnModal = document.getElementById('saleReturnModal');
        if (saleReturnModal) {
            saleReturnModal.addEventListener('hidden.bs.modal', () => {
                this.cancelReturnForm();
            });
        }

        // Select all rows checkbox
        const selectAllCheckbox = document.getElementById('selectAllSaleReturnRows');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.saleReturn-row-select-checkbox');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                });
            });
        }

        // Toggle columns button
        const toggleColumnsBtn = document.getElementById('toggleSaleReturnColumns');
        if (toggleColumnsBtn) {
            toggleColumnsBtn.addEventListener('click', () => {
                const controls = document.getElementById('saleReturnColumnControls');
                if (controls) {
                    controls.style.display = controls.style.display === 'none' ? 'block' : 'none';
                }
            });
        }

        // Column visibility controls
        const columnToggles = document.querySelectorAll('#saleReturnColumnControls .column-toggle');
        columnToggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const columnClass = e.target.id.replace('saleReturn-col-', 'saleReturn-col-');
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
        // Setup Customer picker button
        const openCustomerPicker = document.getElementById('openSaleReturnCustomerPicker');
        if (openCustomerPicker) {
            openCustomerPicker.addEventListener('click', () => {
                this.openSaleReturnCustomerPicker();
            });
        }

        // Setup Warehouse picker button
        const openWarehousePicker = document.getElementById('openSaleReturnWarehousePicker');
        if (openWarehousePicker) {
            openWarehousePicker.addEventListener('click', () => {
                this.openSaleReturnWarehousePicker();
            });
        }

        // Setup Cost Center picker button
        const openCostCenterPicker = document.getElementById('openSaleReturnCostCenterPicker');
        if (openCostCenterPicker) {
            openCostCenterPicker.addEventListener('click', () => {
                this.openSaleReturnCostCenterPicker();
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
            const invoiceNoInput = document.getElementById('saleReturnInvoiceNo');
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
            const currencySelect = document.getElementById('saleReturnCurrency');
            if (currencySelect && settings.defaultCurrency) {
                currencySelect.value = settings.defaultCurrency;
            }
            
            // Apply default warehouse
            if (settings.defaultWarehouse) {
                const warehouse = this.warehouses.find(w => w.id === settings.defaultWarehouse);
                if (warehouse) {
                    const warehouseDisplay = document.getElementById('saleReturnWarehouseDisplay');
                    const warehouseIdInput = document.getElementById('saleReturnWarehouseId');
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
                    const costCenterDisplay = document.getElementById('saleReturnCostCenterDisplay');
                    const costCenterIdInput = document.getElementById('saleReturnCostCenterId');
                    if (costCenterDisplay && costCenterIdInput) {
                        costCenterDisplay.value = costCenter.name;
                        costCenterIdInput.value = costCenter.id;
                    }
                }
            }
            
            // Apply default payment method
            const paymentMethodSelect = document.getElementById('saleReturnPaymentMethod');
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
        const tbody = document.getElementById('saleReturnItemsBody');
        if (!tbody) return;
        
        // Clear existing rows if any
        tbody.innerHTML = '';
        
        // Add empty rows
        for (let i = 0; i < count; i++) {
            this.addSaleReturnItem();
        }
        
        console.log(`✅ Initialized ${count} empty return rows`);
    },

    /**
     * Add return item row
     */
    addSaleReturnItem() {
        const tbody = document.getElementById('saleReturnItemsBody');
        if (!tbody) return;

        const rowIndex = tbody.children.length + 1;
        const row = document.createElement('tr');
        row.dataset.rowIndex = rowIndex;
        row.innerHTML = `
            <td style="border: 1px solid #d0d7e5; text-align: center; padding: 6px 8px; vertical-align: middle; background: #f8f9fa;">
                <input type="checkbox" class="saleReturn-row-select-checkbox" data-row-index="${rowIndex}" style="cursor: pointer; width: 18px; height: 18px;">
            </td>
            <td style="border: 1px solid #d0d7e5; text-align: center; padding: 6px 8px; vertical-align: middle; font-weight: 600; min-width: 40px; background: #f8f9fa; color: #495057; font-size: 0.9rem;">${rowIndex}</td>
            <td class="saleReturn-col-product" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <div class="input-group input-group-sm" style="margin: 0;">
                    <input type="text" class="form-control form-control-sm saleReturn-product-display-input" placeholder="اختر المنتج..." readonly style="background-color: #f8f9fa; cursor: pointer; border: 1px solid #d0d7e5; border-radius: 0;" data-row-index="${rowIndex}">
                    <input type="hidden" class="saleReturn-product-select-id" value="">
                    <button type="button" class="btn btn-outline-secondary btn-sm saleReturn-product-picker-btn" data-row-index="${rowIndex}" title="اختر منتج" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </td>
            <td class="saleReturn-col-quantity" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="number" class="form-control form-control-sm saleReturn-quantity-input" min="0" step="0.01" value="1" required style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="saleReturn-col-unit" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <div class="saleReturn-unit-autocomplete-container" style="position: relative; width: 100%; min-height: 32px; display: flex; align-items: center; color: #6c757d; font-size: 0.875rem;">
                    <span style="padding: 0 8px;">اختر المنتج أولاً</span>
                </div>
                <input type="hidden" class="saleReturn-unit-select-id" value="">
            </td>
            <td class="saleReturn-col-available-qty" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff; text-align: center;">
                <button type="button" class="btn btn-sm btn-outline-info saleReturn-show-available-qty-btn" title="عرض الكميات المتوفرة" style="display: none;">
                    <i class="fas fa-boxes"></i> الكميات
                </button>
            </td>
            <td class="saleReturn-col-price" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="number" class="form-control form-control-sm saleReturn-price-input" min="0" step="0.01" value="0" required style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="saleReturn-col-discount" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="number" class="form-control form-control-sm saleReturn-discount-percent-input" min="0" max="100" step="0.01" value="0" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="number" class="form-control form-control-sm saleReturn-discount-amount-input" min="0" step="0.01" value="0" placeholder="أو أدخل المبلغ" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="saleReturn-col-addition-percent" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="number" class="form-control form-control-sm saleReturn-addition-percent-input" min="0" max="100" step="0.01" value="0" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="saleReturn-col-addition" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="number" class="form-control form-control-sm saleReturn-addition-amount-input" min="0" step="0.01" value="0" placeholder="أو أدخل المبلغ" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td style="border: 1px solid #d0d7e5; padding: 4px; background: #f8f9fa;">
                <input type="number" class="form-control form-control-sm saleReturn-total-input" min="0" step="0.01" value="0" readonly style="background-color: #f8f9fa; font-weight: bold; border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td class="saleReturn-col-expiry" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <select class="form-select form-select-sm saleReturn-expiry-date-input" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
                    <option value="">-- اختر تاريخ الصلاحية --</option>
                </select>
            </td>
            <td class="saleReturn-col-serial" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <select class="form-select form-select-sm saleReturn-serial-number-input" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
                    <option value="">-- اختر الرقم التسلسلي --</option>
                </select>
            </td>
            <td class="saleReturn-col-notes" style="border: 1px solid #d0d7e5; padding: 4px; background: #fff;">
                <input type="text" class="form-control form-control-sm saleReturn-notes-input" placeholder="ملاحظات" style="border: 1px solid #d0d7e5; border-radius: 0; padding: 4px 8px;">
            </td>
            <td style="border: 1px solid #d0d7e5; text-align: center; padding: 4px; background: #fff;">
                <button type="button" class="btn btn-sm btn-outline-danger saleReturn-remove-item" title="حذف الصف" style="border: 1px solid #dc3545; border-radius: 0; padding: 4px 8px;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);
        
        // Setup row listeners
        this.setupSaleReturnItemListeners(row);
        this.calculateSaleReturnTotals();
    },

    /**
     * View return
     */
    viewReturn(returnId) {
        // TODO: Implement view return
        console.log('Viewing return:', returnId);
    },

    /**
     * Edit return
     */
    editReturn(returnId) {
        // TODO: Implement edit return
        console.log('Editing return:', returnId);
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
                    .where('type', '==', 'sale_return')
                    .get();
            } catch (error) {
                console.warn('⚠️ Direct query failed, trying fallback:', error);
                // Fallback: fetch all and filter
                const allSnapshot = await db.collection('generalEntries').get();
                const allEntries = allSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const matchingEntries = allEntries.filter(e => 
                    String(e.sourceId) === sourceIdStr && e.type === 'sale_return'
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
     * Delete return
     */
    async deleteReturn(returnId) {
        try {
            const result = await Swal.fire({
                title: 'تأكيد الحذف',
                text: 'هل أنت متأكد من حذف فاتورة المرتجع؟ سيتم حذف القيد العام المرتبط أيضاً وإعادة المخزون.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'نعم، احذف',
                cancelButtonText: 'إلغاء',
                confirmButtonColor: '#dc3545'
            });

            if (!result.isConfirmed) return;

            showLoading();

            // Get return data first to reverse inventory
            const returnData = await Collections.getSalesReturn(returnId);
            if (returnData) {
                // Reverse inventory (subtract the stock that was added by the return)
                if (returnData.items && returnData.items.length > 0) {
                    for (const item of returnData.items) {
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
                        
                        // Subtract the stock (reverse the return - sale returns add stock, so we subtract)
                        await Collections.updateProductWarehouseStock(
                            item.productId,
                            returnData.warehouseId || 'default',
                            quantityInMainUnit,
                            'subtract'
                        );
                    }
                }

                // Delete inventory movements
                await this.deleteInventoryMovementsBySource('sale_return', returnId);

                // Delete general entry
                const sourceId = String(returnId);
                await this.deleteGeneralEntryBySourceId(sourceId);
            }

            // Delete return
            await Collections.deleteSalesReturn(returnId);

            // Reload data
            if (this.loadSalesReturns) {
                await this.loadSalesReturns();
            }
            if (this.updateDashboard) {
                this.updateDashboard();
            }

            hideLoading();
            showSuccess('تم حذف فاتورة المرتجع بنجاح');

        } catch (error) {
            console.error('Error deleting return:', error);
            hideLoading();
            showError('فشل في حذف فاتورة المرتجع: ' + (error.message || 'خطأ غير معروف'));
        }
    },

    /**
     * Print return
     */
    printReturn(returnId) {
        // TODO: Implement print return
        console.log('Printing return:', returnId);
    },

    /**
     * View return general entry
     */
    viewReturnGeneralEntry(returnId) {
        // TODO: Implement view general entry
        console.log('Viewing general entry for return:', returnId);
    },

    /**
     * Generate report
     */
    generateReport() {
        // TODO: Implement report generation
        console.log('Generating report...');
    },

    /**
     * Save default values
     */
    saveDefaultValues() {
        // TODO: Implement save default values
        console.log('Saving default values...');
    },

    /**
     * Save general settings
     */
    saveGeneralSettings() {
        // TODO: Implement save general settings
        console.log('Saving general settings...');
    },

    // Helper functions for sale return modal
    setupSaleReturnModalListeners() {
        // Add item button
        const addItemBtn = document.getElementById('addSaleReturnItem');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => {
                this.addSaleReturnItem();
            });
        }

        // Add discount button
        const addDiscountBtn = document.getElementById('addSaleReturnDiscount');
        if (addDiscountBtn) {
            addDiscountBtn.addEventListener('click', () => {
                this.addSaleReturnDiscount();
            });
        }

        // Add addition button
        const addAdditionBtn = document.getElementById('addSaleReturnAddition');
        if (addAdditionBtn) {
            addAdditionBtn.addEventListener('click', () => {
                this.addSaleReturnAddition();
            });
        }

        // Save return button
        const saveBtn = document.getElementById('saveSaleReturnBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSaleReturn();
            });
        }

        // Payment method change
        const paymentMethod = document.getElementById('saleReturnPaymentMethod');
        if (paymentMethod) {
            paymentMethod.addEventListener('change', () => {
                this.updateSaleReturnPaymentFields();
            });
        }

        // Paid amount change
        const paidAmount = document.getElementById('saleReturnPaidAmount');
        if (paidAmount) {
            paidAmount.addEventListener('input', () => {
                this.calculateSaleReturnRemainingAmount();
            });
        }

        // Currency change
        const currencySelect = document.getElementById('saleReturnCurrency');
        if (currencySelect) {
            currencySelect.addEventListener('change', () => {
                this.calculateSaleReturnTotals();
            });
        }

        // Exchange rate change
        const exchangeRateInput = document.getElementById('saleReturnExchangeRate');
        if (exchangeRateInput) {
            exchangeRateInput.addEventListener('input', () => {
                this.calculateSaleReturnTotals();
            });
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancelSaleReturnBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.cancelSaleReturnForm();
            });
        }

        // Handle modal close event
        const saleReturnModal = document.getElementById('saleReturnModal');
        if (saleReturnModal) {
            saleReturnModal.addEventListener('hidden.bs.modal', () => {
                this.cancelSaleReturnForm();
            });
        }

        // Select all rows checkbox
        const selectAllCheckbox = document.getElementById('selectAllSaleReturnRows');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                const checkboxes = document.querySelectorAll('.saleReturn-row-select-checkbox');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                });
            });
        }

        // Toggle columns button
        const toggleColumnsBtn = document.getElementById('toggleSaleReturnColumns');
        if (toggleColumnsBtn) {
            toggleColumnsBtn.addEventListener('click', () => {
                const controls = document.getElementById('saleReturnColumnControls');
                if (controls) {
                    controls.style.display = controls.style.display === 'none' ? 'block' : 'none';
                }
            });
        }

        // Column visibility controls
        const columnToggles = document.querySelectorAll('#saleReturnColumnControls .column-toggle');
        columnToggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const columnClass = e.target.id.replace('saleReturn-col-', 'saleReturn-col-');
                const columns = document.querySelectorAll(`.${columnClass}`);
                columns.forEach(col => {
                    col.style.display = e.target.checked ? '' : 'none';
                });
            });
        });
    },

    initializeSaleReturnAutocompleteFields() {
        // Setup Customer picker button
        const openCustomerPicker = document.getElementById('openSaleReturnCustomerPicker');
        if (openCustomerPicker) {
            openCustomerPicker.addEventListener('click', () => {
                this.openSaleReturnCustomerPicker();
            });
        }

        // Setup Warehouse picker button
        const openWarehousePicker = document.getElementById('openSaleReturnWarehousePicker');
        if (openWarehousePicker) {
            openWarehousePicker.addEventListener('click', () => {
                this.openSaleReturnWarehousePicker();
            });
        }

        // Setup Cost Center picker button
        const openCostCenterPicker = document.getElementById('openSaleReturnCostCenterPicker');
        if (openCostCenterPicker) {
            openCostCenterPicker.addEventListener('click', () => {
                this.openSaleReturnCostCenterPicker();
            });
        }
    },

    async generateSaleReturnInvoiceNo() {
        try {
            const settings = await this.getSettings();
            if (!settings.autoGenerateInvoiceNumbers) {
                return '';
            }

            // Get last invoice number
            const snapshot = await db.collection('saleReturns')
                .orderBy('invoiceNo', 'desc')
                .limit(1)
                .get();

            let lastNumber = 0;
            if (!snapshot.empty) {
                const lastInvoiceNo = snapshot.docs[0].data().invoiceNo || '';
                const match = lastInvoiceNo.match(/SRET-(\d+)/);
                if (match) {
                    lastNumber = parseInt(match[1]) || 0;
                }
            }

            const newNumber = lastNumber + 1;
            return `SRET-${String(newNumber).padStart(6, '0')}`;
        } catch (error) {
            console.error('Error generating sale return invoice number:', error);
            return '';
        }
    },

    async applySaleReturnDefaultValues() {
        try {
            const settings = await this.getSettings();
            
            // Apply default currency
            const currencySelect = document.getElementById('saleReturnCurrency');
            if (currencySelect && settings.defaultCurrency) {
                currencySelect.value = settings.defaultCurrency;
            }
            
            // Apply default warehouse
            if (settings.defaultWarehouse) {
                const warehouse = this.warehouses.find(w => w.id === settings.defaultWarehouse);
                if (warehouse) {
                    const warehouseDisplay = document.getElementById('saleReturnWarehouseDisplay');
                    const warehouseIdInput = document.getElementById('saleReturnWarehouseId');
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
                    const costCenterDisplay = document.getElementById('saleReturnCostCenterDisplay');
                    const costCenterIdInput = document.getElementById('saleReturnCostCenterId');
                    if (costCenterDisplay && costCenterIdInput) {
                        costCenterDisplay.value = costCenter.name;
                        costCenterIdInput.value = costCenter.id;
                    }
                }
            }
            
            // Apply default payment method
            const paymentMethodSelect = document.getElementById('saleReturnPaymentMethod');
            if (paymentMethodSelect && settings.defaultPaymentMethod) {
                paymentMethodSelect.value = settings.defaultPaymentMethod;
                this.updateSaleReturnPaymentFields();
            }
        } catch (error) {
            console.error('Error applying default values:', error);
        }
    },

    /**
     * Calculate sale return totals
     */
    calculateSaleReturnTotals() {
        const tbody = document.getElementById('saleReturnItemsBody');
        if (!tbody) return;
        
        const rows = tbody.children;
        let subtotal = 0;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const total = parseFloat(row.querySelector('.saleReturn-total-input')?.value) || 0;
            subtotal += total;
        }

        // Calculate discounts and additions from table
        const discountRows = document.querySelectorAll('#saleReturnDiscountsAdditionsBody tr');
        let totalDiscounts = 0;
        let totalAdditions = 0;

        const invoiceCurrency = document.getElementById('saleReturnCurrency')?.value || 'IQD';

        discountRows.forEach(row => {
            const type = row.querySelector('.saleReturn-type-select')?.value;
            const amount = parseFloat(row.querySelector('.saleReturn-amount-input')?.value) || 0;
            
            if (type === 'discount') {
                totalDiscounts += amount;
            } else if (type === 'addition') {
                totalAdditions += amount;
            }
        });

        const finalTotal = subtotal - totalDiscounts + totalAdditions;

        // Update display
        const subtotalEl = document.getElementById('saleReturnSubtotal');
        if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2);
        
        const subtotalCurrencyEl = document.getElementById('saleReturnSubtotalCurrency');
        if (subtotalCurrencyEl) subtotalCurrencyEl.textContent = invoiceCurrency;
        
        const totalDiscountsEl = document.getElementById('saleReturnTotalDiscounts');
        if (totalDiscountsEl) totalDiscountsEl.textContent = totalDiscounts.toFixed(2);
        
        const discountCurrencyEl = document.getElementById('saleReturnDiscountCurrency');
        if (discountCurrencyEl) discountCurrencyEl.textContent = invoiceCurrency;
        
        const totalAdditionsEl = document.getElementById('saleReturnTotalAdditions');
        if (totalAdditionsEl) totalAdditionsEl.textContent = totalAdditions.toFixed(2);
        
        const additionCurrencyEl = document.getElementById('saleReturnAdditionCurrency');
        if (additionCurrencyEl) additionCurrencyEl.textContent = invoiceCurrency;
        
        const totalEl = document.getElementById('saleReturnTotal');
        if (totalEl) totalEl.textContent = finalTotal.toFixed(2);
        
        const totalCurrencyEl = document.getElementById('saleReturnTotalCurrency');
        if (totalCurrencyEl) totalCurrencyEl.textContent = invoiceCurrency;

        // Update remaining amount
        this.calculateSaleReturnRemainingAmount();
    },

    /**
     * Calculate sale return remaining amount
     */
    calculateSaleReturnRemainingAmount() {
        const total = parseFloat(document.getElementById('saleReturnTotal')?.textContent) || 0;
        const paidAmount = parseFloat(document.getElementById('saleReturnPaidAmount')?.value) || 0;
        const remaining = total - paidAmount;

        const remainingInput = document.getElementById('saleReturnRemainingAmount');
        if (remainingInput) {
            remainingInput.value = remaining.toFixed(2);
        }

        // Update payment status
        const paymentStatusSelect = document.getElementById('saleReturnPaymentStatus');
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
     * Update sale return payment fields
     */
    updateSaleReturnPaymentFields() {
        const paymentMethod = document.getElementById('saleReturnPaymentMethod')?.value;
        const paidAmountInput = document.getElementById('saleReturnPaidAmount');
        const dueDateInput = document.getElementById('saleReturnDueDate');

        if (paymentMethod === 'cash') {
            const total = parseFloat(document.getElementById('saleReturnTotal')?.textContent) || 0;
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

        this.calculateSaleReturnRemainingAmount();
    },

    /**
     * Add sale return discount row
     */
    addSaleReturnDiscount() {
        const tbody = document.getElementById('saleReturnDiscountsAdditionsBody');
        if (!tbody) return;

        const rowIndex = tbody.children.length + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rowIndex}</td>
            <td>
                <select class="form-select form-select-sm saleReturn-type-select">
                    <option value="discount" selected>خصم</option>
                    <option value="addition">إضافة</option>
                </select>
            </td>
            <td>
                <div class="input-group">
                    <input type="text" class="form-control form-control-sm saleReturn-account-name-display" placeholder="اسم الحساب" readonly style="background-color: #f8f9fa;">
                    <input type="hidden" class="saleReturn-account-select" value="">
                    <button type="button" class="btn btn-outline-secondary btn-sm saleReturn-open-account-picker" title="اختر الحساب">
                        <i class="fas fa-sitemap"></i>
                    </button>
                </div>
            </td>
            <td>
                <div class="input-group">
                    <input type="text" class="form-control form-control-sm saleReturn-counter-account-name-display" placeholder="الحساب المقابل" readonly style="background-color: #f8f9fa;">
                    <input type="hidden" class="saleReturn-counter-account-select" value="">
                    <button type="button" class="btn btn-outline-secondary btn-sm saleReturn-open-counter-account-picker" title="اختر الحساب المقابل">
                        <i class="fas fa-sitemap"></i>
                    </button>
                </div>
            </td>
            <td>
                <input type="number" class="form-control form-control-sm saleReturn-amount-input" min="0" step="0.01" value="0">
            </td>
            <td>
                <select class="form-select form-select-sm saleReturn-currency-select">
                    ${this.currencies.map(c => `<option value="${c.code}">${c.code}</option>`).join('')}
                </select>
            </td>
            <td>
                <input type="text" class="form-control form-control-sm saleReturn-notes-input" placeholder="ملاحظات">
            </td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-danger saleReturn-remove-discount-addition" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);

        // Setup listeners
        const removeBtn = row.querySelector('.saleReturn-remove-discount-addition');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                row.remove();
                this.updateSaleReturnDiscountAdditionNumbers();
                this.calculateSaleReturnTotals();
            });
        }

        const accountPickerBtn = row.querySelector('.saleReturn-open-account-picker');
        if (accountPickerBtn) {
            accountPickerBtn.addEventListener('click', () => {
                this.openAccountPickerForSaleReturnRow(row, row.querySelector('.saleReturn-account-select'), row.querySelector('.saleReturn-account-name-display'));
            });
        }

        const counterAccountPickerBtn = row.querySelector('.saleReturn-open-counter-account-picker');
        if (counterAccountPickerBtn) {
            counterAccountPickerBtn.addEventListener('click', () => {
                this.openAccountPickerForSaleReturnRow(row, row.querySelector('.saleReturn-counter-account-select'), row.querySelector('.saleReturn-counter-account-name-display'));
            });
        }

        const amountInput = row.querySelector('.saleReturn-amount-input');
        if (amountInput) {
            amountInput.addEventListener('input', () => {
                this.calculateSaleReturnTotals();
            });
        }

        this.calculateSaleReturnTotals();
    },

    /**
     * Add sale return addition row
     */
    addSaleReturnAddition() {
        const tbody = document.getElementById('saleReturnDiscountsAdditionsBody');
        if (!tbody) return;

        const rowIndex = tbody.children.length + 1;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${rowIndex}</td>
            <td>
                <select class="form-select form-select-sm saleReturn-type-select">
                    <option value="discount">خصم</option>
                    <option value="addition" selected>إضافة</option>
                </select>
            </td>
            <td>
                <div class="input-group">
                    <input type="text" class="form-control form-control-sm saleReturn-account-name-display" placeholder="اسم الحساب" readonly style="background-color: #f8f9fa;">
                    <input type="hidden" class="saleReturn-account-select" value="">
                    <button type="button" class="btn btn-outline-secondary btn-sm saleReturn-open-account-picker" title="اختر الحساب">
                        <i class="fas fa-sitemap"></i>
                    </button>
                </div>
            </td>
            <td>
                <div class="input-group">
                    <input type="text" class="form-control form-control-sm saleReturn-counter-account-name-display" placeholder="الحساب المقابل" readonly style="background-color: #f8f9fa;">
                    <input type="hidden" class="saleReturn-counter-account-select" value="">
                    <button type="button" class="btn btn-outline-secondary btn-sm saleReturn-open-counter-account-picker" title="اختر الحساب المقابل">
                        <i class="fas fa-sitemap"></i>
                    </button>
                </div>
            </td>
            <td>
                <input type="number" class="form-control form-control-sm saleReturn-amount-input" min="0" step="0.01" value="0">
            </td>
            <td>
                <select class="form-select form-select-sm saleReturn-currency-select">
                    ${this.currencies.map(c => `<option value="${c.code}">${c.code}</option>`).join('')}
                </select>
            </td>
            <td>
                <input type="text" class="form-control form-control-sm saleReturn-notes-input" placeholder="ملاحظات">
            </td>
            <td>
                <button type="button" class="btn btn-sm btn-outline-danger saleReturn-remove-discount-addition" title="حذف">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tbody.appendChild(row);

        // Setup listeners (same as discount)
        const removeBtn = row.querySelector('.saleReturn-remove-discount-addition');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                row.remove();
                this.updateSaleReturnDiscountAdditionNumbers();
                this.calculateSaleReturnTotals();
            });
        }

        const accountPickerBtn = row.querySelector('.saleReturn-open-account-picker');
        if (accountPickerBtn) {
            accountPickerBtn.addEventListener('click', () => {
                this.openAccountPickerForSaleReturnRow(row, row.querySelector('.saleReturn-account-select'), row.querySelector('.saleReturn-account-name-display'));
            });
        }

        const counterAccountPickerBtn = row.querySelector('.saleReturn-open-counter-account-picker');
        if (counterAccountPickerBtn) {
            counterAccountPickerBtn.addEventListener('click', () => {
                this.openAccountPickerForSaleReturnRow(row, row.querySelector('.saleReturn-counter-account-select'), row.querySelector('.saleReturn-counter-account-name-display'));
            });
        }

        const amountInput = row.querySelector('.saleReturn-amount-input');
        if (amountInput) {
            amountInput.addEventListener('input', () => {
                this.calculateSaleReturnTotals();
            });
        }

        this.calculateSaleReturnTotals();
    },

    /**
     * Update sale return discount/addition row numbers
     */
    updateSaleReturnDiscountAdditionNumbers() {
        const tbody = document.getElementById('saleReturnDiscountsAdditionsBody');
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
     * Open account picker for sale return discount/addition row
     */
    openAccountPickerForSaleReturnRow(row, accountSelect, accountNameDisplay) {
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
                        <input type="text" id="saleReturnAccountPickerSearch" class="form-control" placeholder="ابحث في الحسابات النهائية...">
                    </div>
                </div>
                <div class="list-group" id="saleReturnAccountPickerList" style="max-height: 360px; overflow:auto;">
                    ${leafAccounts.length > 0 ? leafAccounts.map(acc => `
                        <button type="button" class="list-group-item list-group-item-action saleReturn-account-pick-item" data-id="${acc.id}" data-name="${acc.name}">
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
                const searchInput = document.getElementById('saleReturnAccountPickerSearch');
                const items = Array.from(document.querySelectorAll('.saleReturn-account-pick-item'));
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
     * Open sale return customer picker
     */
    openSaleReturnCustomerPicker() {
        const modal = new bootstrap.Modal(document.getElementById('saleReturnCustomerPickerModal'));
        this.populateSaleReturnCustomerPicker();
        modal.show();
    },

    /**
     * Open sale return warehouse picker
     */
    openSaleReturnWarehousePicker() {
        const modal = new bootstrap.Modal(document.getElementById('saleReturnWarehousePickerModal'));
        this.populateSaleReturnWarehousePicker();
        modal.show();
    },

    /**
     * Open sale return cost center picker
     */
    openSaleReturnCostCenterPicker() {
        const modal = new bootstrap.Modal(document.getElementById('saleReturnCostCenterPickerModal'));
        this.populateSaleReturnCostCenterPicker();
        modal.show();
    },

    /**
     * Collect sale return data
     */
    collectSaleReturnData() {
        const items = [];
        const tbody = document.getElementById('saleReturnItemsBody');
        if (!tbody) return null;
        
        const rows = tbody.children;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const productHiddenInput = row.querySelector('.saleReturn-product-select-id');
            const productId = productHiddenInput?.value || '';
            
            const productInput = row.querySelector('.saleReturn-product-display-input');
            const productName = productInput?.value || '';
            
            const quantity = parseFloat(row.querySelector('.saleReturn-quantity-input')?.value) || 0;
            const price = parseFloat(row.querySelector('.saleReturn-price-input')?.value) || 0;
            const discountPercent = parseFloat(row.querySelector('.saleReturn-discount-percent-input')?.value) || 0;
            const discountAmount = parseFloat(row.querySelector('.saleReturn-discount-amount-input')?.value) || 0;
            const additionPercent = parseFloat(row.querySelector('.saleReturn-addition-percent-input')?.value) || 0;
            const additionAmount = parseFloat(row.querySelector('.saleReturn-addition-amount-input')?.value) || 0;
            const total = parseFloat(row.querySelector('.saleReturn-total-input')?.value) || 0;
            
            const unitHiddenInput = row.querySelector('.saleReturn-unit-select-id');
            const unitId = unitHiddenInput?.value || '';
            
            const expiryDateInput = row.querySelector('.saleReturn-expiry-date-input');
            const serialNumberInput = row.querySelector('.saleReturn-serial-number-input');
            const notesInput = row.querySelector('.saleReturn-notes-input');

            if (productId && quantity > 0 && price > 0) {
                const product = this.products.find(p => p.id === productId);
                const productCurrency = product?.currency || 'IQD';
                
                const invoiceCurrency = document.getElementById('saleReturnCurrency')?.value || 'IQD';
                const invoiceExchangeRate = parseFloat(document.getElementById('saleReturnExchangeRate')?.value) || 1;
                
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
        const discountRows = document.querySelectorAll('#saleReturnDiscountsAdditionsBody tr');
        discountRows.forEach(row => {
            const type = row.querySelector('.saleReturn-type-select')?.value;
            const accountSelect = row.querySelector('.saleReturn-account-select');
            const accountId = accountSelect?.value || '';
            const accountName = row.querySelector('.saleReturn-account-name-display')?.value || '';
            const counterAccountSelect = row.querySelector('.saleReturn-counter-account-select');
            const counterAccountId = counterAccountSelect?.value || '';
            const counterAccountName = row.querySelector('.saleReturn-counter-account-name-display')?.value || '';
            const amount = parseFloat(row.querySelector('.saleReturn-amount-input')?.value) || 0;
            const currency = row.querySelector('.saleReturn-currency-select')?.value || 'IQD';
            const notes = row.querySelector('.saleReturn-notes-input')?.value || '';

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

        const total = parseFloat(document.getElementById('saleReturnTotal')?.textContent) || 0;
        const paidAmount = parseFloat(document.getElementById('saleReturnPaidAmount')?.value) || 0;
        let paymentStatus = 'unpaid';
        if (paidAmount >= total) {
            paymentStatus = 'paid';
        } else if (paidAmount > 0) {
            paymentStatus = 'partial';
        }

        const customerId = document.getElementById('saleReturnCustomerId')?.value || '';
        const customerDisplay = document.getElementById('saleReturnCustomerDisplay');
        let customerName = customerDisplay?.value || '';
        if (!customerName && customerId) {
            const customer = this.customers.find(c => c.id === customerId);
            customerName = customer?.name || '';
        }
        
        const warehouseId = document.getElementById('saleReturnWarehouseId')?.value || '';
        const costCenterId = document.getElementById('saleReturnCostCenterId')?.value || '';
        const salesRep1Id = document.getElementById('saleReturnSalesRep1Id')?.value || '';
        const salesRep2Id = document.getElementById('saleReturnSalesRep2Id')?.value || '';

        return {
            invoiceNo: document.getElementById('saleReturnInvoiceNo')?.value.trim() || '',
            date: document.getElementById('saleReturnDate')?.value || new Date().toISOString().split('T')[0],
            customerId: customerId,
            customerName: customerName,
            currency: document.getElementById('saleReturnCurrency')?.value || 'IQD',
            exchangeRate: parseFloat(document.getElementById('saleReturnExchangeRate')?.value) || 1,
            warehouseId: warehouseId,
            costCenterId: costCenterId,
            salesRep1Id: salesRep1Id,
            salesRep2Id: salesRep2Id,
            items: items,
            subtotal: parseFloat(document.getElementById('saleReturnSubtotal')?.textContent) || 0,
            totalDiscounts: totalDiscounts,
            totalAdditions: totalAdditions,
            discountAdditionRows: discountAdditionRows,
            total: total,
            notes: document.getElementById('saleReturnNotes')?.value.trim() || '',
            status: 'completed',
            paymentMethod: document.getElementById('saleReturnPaymentMethod')?.value || 'cash',
            paidAmount: paidAmount,
            remainingAmount: parseFloat(document.getElementById('saleReturnRemainingAmount')?.value) || 0,
            paymentStatus: paymentStatus,
            dueDate: document.getElementById('saleReturnDueDate')?.value || null,
            type: 'sale_return',
            createdAt: new Date(),
            createdBy: auth.currentUser?.uid || 'system'
        };
    },

    /**
     * Validate sale return form
     */
    async validateSaleReturnForm(formData) {
        if (!formData.date) {
            showError('تاريخ الفاتورة مطلوب');
            return false;
        }

        if (!formData.customerId) {
            showError('العميل مطلوب');
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

        // Validate items
        const settings = await this.getSettings();
        const allowReturnWithoutStock = settings.allowReturnWithoutStock || false;

        for (const item of formData.items) {
            const product = await Collections.getProduct(item.productId);
            if (!product) {
                showError(`المنتج "${item.productName}" غير موجود`);
                return false;
            }

            if (!product.unitId) {
                showError(`المنتج "${item.productName}" لا يحتوي على وحدة أساسية. يجب إضافة وحدة أساسية للمنتج قبل استخدامه في مرتجع المبيعات.`);
                return false;
            }

            if (!item.unitId) {
                showError(`يجب اختيار الوحدة للمنتج "${item.productName}"`);
                return false;
            }

            const unit = this.units.find(u => u.id === item.unitId);
            if (!unit) {
                showError(`الوحدة المختارة للمنتج "${item.productName}" غير موجودة`);
                return false;
            }
        }

        return true;
    },

    /**
     * Save sale return
     */
    async saveSaleReturn() {
        try {
            const formData = this.collectSaleReturnData();
            
            if (!(await this.validateSaleReturnForm(formData))) {
                return;
            }

            showLoading();

            let returnId = null;

            if (this.editingReturn) {
                // Update return
                returnId = this.editingReturn.id;
                formData.id = returnId;
                
                // Update inventory: reverse old quantities and add new quantities
                await this.updateSaleReturnInventoryOnEdit(this.editingReturn, formData);
                
                await Collections.updateSaleReturn(this.editingReturn.id, formData);
                
                // Update or recreate general entry if it exists
                await this.updateOrCreateSaleReturnGeneralEntry(formData);
                
                showSuccess('تم تحديث فاتورة مرتجع المبيعات بنجاح');
                
                // Close modal and reset form
                const modal = bootstrap.Modal.getInstance(document.getElementById('saleReturnModal'));
                if (modal) {
                    modal.hide();
                }
                this.cancelSaleReturnForm();
            } else {
                // Generate invoice number if not exists
                if (!formData.invoiceNo) {
                    formData.invoiceNo = await this.generateSaleReturnInvoiceNo();
                }

                // Add new return
                const returnResult = await Collections.addSaleReturn(formData);
                
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
                
                console.log(`📝 Sale return saved with ID: ${returnId}`);
                
                // Update inventory (add stock - sales returns increase inventory)
                await this.updateSaleReturnInventory(formData);
                
                // Generate general entry (customer is credited, sales returns is debited)
                const generalEntryId = await this.generateSaleReturnGeneralEntry(formData);
                
                showSuccess('تم إضافة فاتورة مرتجع المبيعات بنجاح');
                
                // Show generated general entry if it was created
                if (generalEntryId) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('saleReturnModal'));
                    if (modal) {
                        modal.hide();
                        const modalElement = document.getElementById('saleReturnModal');
                        if (modalElement) {
                            modalElement.addEventListener('hidden.bs.modal', async () => {
                                setTimeout(async () => {
                                    try {
                                        await this.showGeneratedSaleReturnGeneralEntry(returnId);
                                    } catch (error) {
                                        console.error('❌ Error showing general entry dialog:', error);
                                        this.cancelSaleReturnForm();
                                    }
                                }, 400);
                            }, { once: true });
                        }
                    }
                } else {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('saleReturnModal'));
                    if (modal) {
                        modal.hide();
                    }
                    this.cancelSaleReturnForm();
                }
            }

            // Reload data
            this.loadSalesReturns().catch(err => console.error('Error reloading returns:', err));
            this.updateDashboard();

            hideLoading();

        } catch (error) {
            console.error('❌ Error saving sale return:', error);
            hideLoading();
            showError('فشل في حفظ فاتورة مرتجع المبيعات: ' + (error.message || 'خطأ غير معروف'));
        }
    },

    /**
     * Cancel sale return form
     */
    cancelSaleReturnForm() {
        this.editingReturn = null;
        this.currentReturnItems = [];
        this.copiedRow = null;
        this.copiedRows = [];
        this.currentSalesRepNumber = null;
        this.currentReturnCurrency = 'IQD';
        this.currentReturnExchangeRate = 1;
        
        const saleReturnForm = document.getElementById('saleReturnForm');
        if (saleReturnForm) {
            saleReturnForm.reset();
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('saleReturnModal'));
        if (modal) {
            modal.hide();
        }

        // Remove modal from DOM
        const modalElement = document.getElementById('saleReturnModal');
        if (modalElement) {
            modalElement.remove();
        }
    },

    /**
     * Get settings
     */
    async getSettings() {
        try {
            const doc = await db.collection('saleReturnsSettings').doc('default').get();
            if (doc.exists) {
                return doc.data();
            }
            return {};
        } catch (error) {
            console.error('Error getting settings:', error);
            return {};
        }
    },

    /**
     * Save settings
     */
    async saveSettings(settings) {
        try {
            await db.collection('saleReturnsSettings').doc('default').set(settings, { merge: true });
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    },

    /**
     * Load settings
     */
    async loadSettings() {
        try {
            console.log('⚙️ Loading sale returns settings...');
            
            // Ensure accounts are loaded before loading settings
            if (!this.accounts || this.accounts.length === 0) {
                console.log('📊 Accounts not loaded yet, loading accounts first...');
                await this.loadAccounts();
            }

            await this.loadDefaultValues();
            await this.loadGeneralSettings();
            await this.loadPrintFieldsSettings();
            this.setupSettingsAccountPickerButtons();
            
            console.log('✅ Sale returns settings loaded');
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    },

    /**
     * Load default values
     */
    async loadDefaultValues() {
        try {
            // Load warehouses
            const warehouseSelect = document.getElementById('defaultSaleReturnWarehouse');
            if (warehouseSelect) {
                warehouseSelect.innerHTML = '<option value="">-- اختر المستودع الافتراضي --</option>';
                this.warehouses.forEach(warehouse => {
                    warehouseSelect.innerHTML += `
                        <option value="${warehouse.id}">${this.escapeHtml(warehouse.name)}</option>
                    `;
                });
            }

            // Load cost centers
            const costCenterSelect = document.getElementById('defaultSaleReturnCostCenter');
            if (costCenterSelect) {
                costCenterSelect.innerHTML = '<option value="">-- اختر مركز الكلفة الافتراضي --</option>';
                this.costCenters.forEach(costCenter => {
                    costCenterSelect.innerHTML += `
                        <option value="${costCenter.id}">${this.escapeHtml(costCenter.name)}</option>
                    `;
                });
            }

            const settings = await this.getSettings();
            
            // Apply default currency
            const currencySelect = document.getElementById('defaultSaleReturnCurrency');
            if (currencySelect && settings.defaultCurrency) {
                currencySelect.value = settings.defaultCurrency;
            }
            
            // Apply default payment method
            const paymentMethodSelect = document.getElementById('defaultSaleReturnPaymentMethod');
            if (paymentMethodSelect && settings.defaultPaymentMethod) {
                paymentMethodSelect.value = settings.defaultPaymentMethod;
            }
            
            // Apply default warehouse
            if (warehouseSelect && settings.defaultWarehouse) {
                warehouseSelect.value = settings.defaultWarehouse;
            }
            
            // Apply default cost center
            if (costCenterSelect && settings.defaultCostCenter) {
                costCenterSelect.value = settings.defaultCostCenter;
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

            // Load auto generate invoice numbers
            const autoGenerateInvoiceNumbers = document.getElementById('autoGenerateSaleReturnInvoiceNumbers');
            if (autoGenerateInvoiceNumbers) {
                autoGenerateInvoiceNumbers.checked = settings.autoGenerateInvoiceNumbers !== false;
            }

            // Load auto update stock
            const autoUpdateStock = document.getElementById('autoUpdateSaleReturnStock');
            if (autoUpdateStock) {
                autoUpdateStock.checked = settings.autoUpdateStock !== false;
            }

            // Load auto generate general entry
            const autoGenerateGeneralEntry = document.getElementById('autoGenerateSaleReturnGeneralEntry');
            if (autoGenerateGeneralEntry) {
                autoGenerateGeneralEntry.checked = settings.autoGenerateGeneralEntry !== false;
            }

            // Load allow return without stock
            const allowReturnWithoutStock = document.getElementById('allowSaleReturnWithoutStock');
            if (allowReturnWithoutStock) {
                allowReturnWithoutStock.checked = settings.allowReturnWithoutStock || false;
            }

            // Load default tax rate
            const defaultTaxRate = document.getElementById('defaultSaleReturnTaxRate');
            if (defaultTaxRate) {
                defaultTaxRate.value = settings.defaultTaxRate || 0;
            }

            // Load default counter account (Sales Returns account - debit)
            if (settings.defaultCounterAccountId) {
                const account = this.accounts.find(a => a.id === settings.defaultCounterAccountId);
                if (account) {
                    const accountDisplay = document.getElementById('defaultSaleReturnCounterAccountDisplay');
                    const accountIdInput = document.getElementById('defaultSaleReturnCounterAccount');
                    if (accountDisplay) accountDisplay.value = `${account.code} - ${account.name}`;
                    if (accountIdInput) accountIdInput.value = account.id;
                }
            }

            // Load default credit account (for cash payments)
            if (settings.defaultCreditAccountId) {
                const account = this.accounts.find(a => a.id === settings.defaultCreditAccountId);
                if (account) {
                    const accountDisplay = document.getElementById('defaultSaleReturnCreditAccountDisplay');
                    const accountIdInput = document.getElementById('defaultSaleReturnCreditAccount');
                    if (accountDisplay) accountDisplay.value = `${account.code} - ${account.name}`;
                    if (accountIdInput) accountIdInput.value = account.id;
                }
            }

            // Load default addition counter account
            if (settings.defaultAdditionCounterAccountId) {
                const account = this.accounts.find(a => a.id === settings.defaultAdditionCounterAccountId);
                if (account) {
                    const accountDisplay = document.getElementById('defaultSaleReturnAdditionCounterAccountDisplay');
                    const accountIdInput = document.getElementById('defaultSaleReturnAdditionCounterAccount');
                    if (accountDisplay) accountDisplay.value = `${account.code} - ${account.name}`;
                    if (accountIdInput) accountIdInput.value = account.id;
                }
            }

            // Load default discount counter account
            if (settings.defaultDiscountCounterAccountId) {
                const account = this.accounts.find(a => a.id === settings.defaultDiscountCounterAccountId);
                if (account) {
                    const accountDisplay = document.getElementById('defaultSaleReturnDiscountCounterAccountDisplay');
                    const accountIdInput = document.getElementById('defaultSaleReturnDiscountCounterAccount');
                    if (accountDisplay) accountDisplay.value = `${account.code} - ${account.name}`;
                    if (accountIdInput) accountIdInput.value = account.id;
                }
            }
        } catch (error) {
            console.error('Error loading general settings:', error);
        }
    },

    /**
     * Save default values
     */
    async saveDefaultValues() {
        try {
            const defaultCurrency = document.getElementById('defaultSaleReturnCurrency').value;
            const defaultPaymentMethod = document.getElementById('defaultSaleReturnPaymentMethod').value;
            const defaultWarehouse = document.getElementById('defaultSaleReturnWarehouse').value;
            const defaultCostCenter = document.getElementById('defaultSaleReturnCostCenter').value;

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
            const autoGenerateInvoiceNumbers = document.getElementById('autoGenerateSaleReturnInvoiceNumbers').checked;
            const autoUpdateStock = document.getElementById('autoUpdateSaleReturnStock').checked;
            const autoGenerateGeneralEntry = document.getElementById('autoGenerateSaleReturnGeneralEntry').checked;
            const allowSaleReturnWithoutStock = document.getElementById('allowSaleReturnWithoutStock')?.checked || false;
            const defaultTaxRate = parseFloat(document.getElementById('defaultSaleReturnTaxRate').value) || 0;
            
            const defaultCounterAccount = document.getElementById('defaultSaleReturnCounterAccount');
            const defaultCounterAccountId = defaultCounterAccount ? defaultCounterAccount.value : '';
            
            const defaultCreditAccount = document.getElementById('defaultSaleReturnCreditAccount');
            const defaultCreditAccountId = defaultCreditAccount ? defaultCreditAccount.value : '';
            
            const defaultAdditionCounterAccount = document.getElementById('defaultSaleReturnAdditionCounterAccount');
            const defaultAdditionCounterAccountId = defaultAdditionCounterAccount ? defaultAdditionCounterAccount.value : '';
            
            const defaultDiscountCounterAccount = document.getElementById('defaultSaleReturnDiscountCounterAccount');
            const defaultDiscountCounterAccountId = defaultDiscountCounterAccount ? defaultDiscountCounterAccount.value : '';

            const settings = await this.getSettings();
            settings.autoGenerateInvoiceNumbers = autoGenerateInvoiceNumbers;
            settings.autoUpdateStock = autoUpdateStock;
            settings.autoGenerateGeneralEntry = autoGenerateGeneralEntry;
            settings.allowReturnWithoutStock = allowSaleReturnWithoutStock;
            settings.defaultTaxRate = defaultTaxRate;
            settings.defaultCounterAccountId = defaultCounterAccountId || '';
            settings.defaultCreditAccountId = defaultCreditAccountId || '';
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
                invoiceNo: document.getElementById('printSaleReturnInvoiceNo').checked,
                date: document.getElementById('printSaleReturnDate').checked,
                paymentMethod: document.getElementById('printSaleReturnPaymentMethod').checked,
                status: document.getElementById('printSaleReturnStatus').checked,
                costCenter: document.getElementById('printSaleReturnCostCenter').checked,
                warehouse: document.getElementById('printSaleReturnWarehouse').checked,
                customerName: document.getElementById('printSaleReturnCustomerName').checked,
                customerPhone: document.getElementById('printSaleReturnCustomerPhone').checked,
                customerAddress: document.getElementById('printSaleReturnCustomerAddress').checked,
                subtotal: document.getElementById('printSaleReturnSubtotal').checked,
                discount: document.getElementById('printSaleReturnDiscount').checked,
                addition: document.getElementById('printSaleReturnAddition').checked,
                total: document.getElementById('printSaleReturnTotal').checked,
                paid: document.getElementById('printSaleReturnPaid').checked,
                remaining: document.getElementById('printSaleReturnRemaining').checked,
                notes: document.getElementById('printSaleReturnNotes').checked,
                productName: document.getElementById('printSaleReturnProductName').checked,
                productQuantity: document.getElementById('printSaleReturnProductQuantity').checked,
                productUnit: document.getElementById('printSaleReturnProductUnit').checked,
                productUnitPrice: document.getElementById('printSaleReturnProductUnitPrice').checked,
                productTotal: document.getElementById('printSaleReturnProductTotal').checked,
                productDiscount: document.getElementById('printSaleReturnProductDiscount').checked,
                productAddition: document.getElementById('printSaleReturnProductAddition').checked,
                productExpiryDate: document.getElementById('printSaleReturnProductExpiryDate').checked,
                productSerialNumber: document.getElementById('printSaleReturnProductSerialNumber').checked,
                productNotes: document.getElementById('printSaleReturnProductNotes').checked
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
                const checkbox = document.getElementById(`printSaleReturn${field.charAt(0).toUpperCase() + field.slice(1)}`);
                if (checkbox) {
                    checkbox.checked = printFields[field] !== false;
                }
            });

        } catch (error) {
            console.error('Error loading print fields settings:', error);
        }
    },

    /**
     * Update sale return inventory (add stock - sales returns increase inventory)
     */
    async updateSaleReturnInventory(returnData) {
        try {
            console.log('📦 Updating inventory for sale return:', returnData.invoiceNo);
            
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

                // Convert quantity to main unit
                let quantityInMainUnit = item.quantity;
                
                if (item.unitId && item.unitId !== product.unitId) {
                    const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
                    if (subUnit && subUnit.conversionFactor) {
                        if (subUnit.conversionType === 'multiply') {
                            quantityInMainUnit = item.quantity * subUnit.conversionFactor;
                        } else {
                            quantityInMainUnit = item.quantity / subUnit.conversionFactor;
                        }
                        console.log(`🔄 Unit conversion: ${item.quantity} ${item.unitId} = ${quantityInMainUnit} ${product.unitId} (${subUnit.conversionType})`);
                    }
                }

                // Get current stock before update
                const currentStock = await Collections.getProductWarehouseStock(item.productId);
                const stockInWarehouse = currentStock?.[warehouseId] || 0;
                const previousQuantity = stockInWarehouse;
                const newQuantity = previousQuantity + quantityInMainUnit;

                // For sales returns, we ADD stock (increase inventory)
                await Collections.updateProductWarehouseStock(
                    item.productId,
                    warehouseId,
                    quantityInMainUnit,
                    'add' // Add stock (sales returns increase inventory)
                );
                
                console.log(`📈 Added ${quantityInMainUnit} ${product.unitId || ''} to ${item.productName} in warehouse ${warehouseId}`);
                
                // Record inventory movement (type: 'in' for sales returns)
                const warehouse = await Collections.getWarehouse(warehouseId);
                const warehouseName = warehouse ? warehouse.name : 'المستودع الافتراضي';
                
                const movementRecord = {
                    type: 'in', // Sales returns increase inventory
                    productId: item.productId,
                    productName: item.productName || product.name,
                    warehouseId: warehouseId,
                    warehouseName: warehouseName,
                    fromWarehouseId: null,
                    fromWarehouseName: null,
                    toWarehouseId: null,
                    toWarehouseName: null,
                    unitId: item.unitId || product.unitId,
                    quantity: quantityInMainUnit,
                    quantityInMainUnit: quantityInMainUnit,
                    expiryDate: item.expiryDate || null,
                    serialNumber: item.serialNumber || null,
                    unitPrice: item.unitPrice || 0,
                    totalCost: (item.unitPrice || 0) * quantityInMainUnit,
                    previousQuantity: previousQuantity,
                    newQuantity: newQuantity,
                    reference: returnData.invoiceNo || '',
                    notes: `مرتجع مبيعات رقم ${returnData.invoiceNo}`,
                    date: returnData.date || new Date(),
                    userId: auth.currentUser?.uid || 'system',
                    createdAt: new Date(),
                    sourceType: 'sale_return',
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
            }

            console.log('✅ Inventory updated successfully for sale return');
        } catch (error) {
            console.error('❌ Error updating inventory for sale return:', error);
            throw error;
        }
    },

    /**
     * Update sale return inventory on edit (reverse old and apply new)
     */
    async updateSaleReturnInventoryOnEdit(oldReturnData, newReturnData) {
        try {
            console.log('📦 Updating inventory on edit for sale return:', newReturnData.invoiceNo);
            
            // First, reverse the old return (subtract the stock that was added)
            if (oldReturnData.items && oldReturnData.items.length > 0) {
                for (const item of oldReturnData.items) {
                    const product = await Collections.getProduct(item.productId);
                    if (!product) continue;
                    
                    let quantityInMainUnit = item.quantity;
                    if (item.unitId && item.unitId !== product.unitId) {
                        const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
                        if (subUnit && subUnit.conversionFactor) {
                            if (subUnit.conversionType === 'multiply') {
                                quantityInMainUnit = item.quantity * subUnit.conversionFactor;
                            } else {
                                quantityInMainUnit = item.quantity / subUnit.conversionFactor;
                            }
                        }
                    }
                    
                    // Subtract the stock (reverse the return)
                    await Collections.updateProductWarehouseStock(
                        item.productId,
                        oldReturnData.warehouseId || 'default',
                        quantityInMainUnit,
                        'subtract'
                    );
                }
            }
            
            // Then, apply the new return (add the stock)
            if (newReturnData.items && newReturnData.items.length > 0) {
                for (const item of newReturnData.items) {
                    const product = await Collections.getProduct(item.productId);
                    if (!product) continue;
                    
                    let quantityInMainUnit = item.quantity;
                    if (item.unitId && item.unitId !== product.unitId) {
                        const subUnit = product.subUnits?.find(su => su.unitId === item.unitId);
                        if (subUnit && subUnit.conversionFactor) {
                            if (subUnit.conversionType === 'multiply') {
                                quantityInMainUnit = item.quantity * subUnit.conversionFactor;
                            } else {
                                quantityInMainUnit = item.quantity / subUnit.conversionFactor;
                            }
                        }
                    }
                    
                    // Add the stock (apply the return)
                    await Collections.updateProductWarehouseStock(
                        item.productId,
                        newReturnData.warehouseId || 'default',
                        quantityInMainUnit,
                        'add'
                    );
                }
            }
            
            console.log('✅ Inventory updated successfully on edit');
        } catch (error) {
            console.error('❌ Error updating inventory on edit:', error);
            throw error;
        }
    },

    /**
     * Generate sale return general entry
     * For sales returns:
     * - Debit: Sales Returns account
     * - Credit: Customer account (if credit) or Cash account (if cash)
     */
    async generateSaleReturnGeneralEntry(returnData) {
        try {
            const settings = await this.getSettings();
            if (!settings.autoGenerateGeneralEntry) {
                console.log('⚠️ Auto generate general entry is disabled');
                return null;
            }

            const generateEntry = document.getElementById('generateSaleReturnGeneralEntry')?.checked;
            if (!generateEntry) {
                console.log('⚠️ Generate general entry checkbox is unchecked');
                return null;
            }

            const entryData = await this.calculateExpectedSaleReturnGeneralEntry(returnData);
            if (!entryData) {
                console.warn('⚠️ Could not calculate general entry data');
                return null;
            }

            // Save to database
            const docRef = await db.collection('generalEntries').add(entryData);
            console.log(`✅ General entry created with ID: ${docRef.id}`);

            return docRef.id;
        } catch (error) {
            console.error('❌ Error generating general entry:', error);
            return null;
        }
    },

    /**
     * Calculate expected sale return general entry (for preview)
     * For sales returns:
     * - Debit: Sales Returns account
     * - Credit: Customer account (if credit) or Cash account (if cash)
     */
    async calculateExpectedSaleReturnGeneralEntry(returnData) {
        try {
            const paymentMethod = returnData.paymentMethod || 'credit';
            const settings = await this.getSettings();

            // Get customer account (subAccountId only)
            const customer = returnData.customerId ? this.customers.find(c => c.id === returnData.customerId) : null;
            const customerAccountId = customer?.subAccountId || null;
            const customerName = customer?.name || 'غير محدد';

            // For credit payments, customer is required
            if (paymentMethod === 'credit' && !customerAccountId) {
                return null;
            }

            // Get base currency and exchange rate
            const invoiceCurrency = returnData.currency || 'IQD';
            const invoiceExchangeRate = parseFloat(returnData.exchangeRate) || 1;
            const baseCurrency = this.currencies.find(c => c.isBaseCurrency)?.code || 'IQD';

            // ✅ Using shared utility function from InvoiceUtils

            // Prepare general entry data (always in base currency)
            const entryData = {
                date: returnData.date || new Date().toISOString().split('T')[0],
                description: `مرتجع مبيعات رقم ${returnData.invoiceNo || 'جديد'}`,
                reference: returnData.invoiceNo || 'جديد',
                voucherNumber: returnData.invoiceNo ? `GE-SRET-${returnData.invoiceNo}` : 'GE-SRET-PREVIEW',
                voucherType: 'general',
                type: 'sale_return',
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
            const totalInBaseCurrency = InvoiceUtils.convertToBaseCurrency(returnData.total || 0, invoiceCurrency, invoiceExchangeRate, this.currencies);

            // For sales returns:
            // - Sales Returns account is DEBITED (مرتجع المبيعات مدين)
            // - Customer account is CREDITED (العميل دائن)

            // Get sales returns account (debit account)
            const salesReturnsAccountId = settings.defaultCounterAccountId || null;
            if (!salesReturnsAccountId) {
                return null;
            }

            if (paymentMethod === 'cash') {
                // Cash Payment: Direct entry
                // Debit: Sales Returns account
                let salesReturnsEntry = {
                    accountId: salesReturnsAccountId,
                    debit: totalInBaseCurrency,
                    credit: 0,
                    originalAmount: returnData.total || 0,
                    originalCurrency: invoiceCurrency,
                    description: `مرتجع مبيعات نقدي رقم ${returnData.invoiceNo || 'جديد'}`
                };
                entryData.entries.push(addAccountInfo(salesReturnsEntry, salesReturnsAccountId));

                // Credit: Cash account
                const cashAccountId = settings.defaultCreditAccountId || null;
                if (!cashAccountId) {
                    return null;
                }
                let cashEntry = {
                    accountId: cashAccountId,
                    debit: 0,
                    credit: totalInBaseCurrency,
                    originalAmount: returnData.total || 0,
                    originalCurrency: invoiceCurrency,
                    description: customerName ? `مرتجع مبيعات نقدي من ${customerName}` : `مرتجع مبيعات نقدي رقم ${returnData.invoiceNo || 'جديد'}`
                };
                entryData.entries.push(addAccountInfo(cashEntry, cashAccountId));
            } else {
                // Credit Payment: Customer account
                if (!customerAccountId) {
                    return null;
                }

                // Debit: Sales Returns account (مرتجع المبيعات مدين)
                let salesReturnsEntry = {
                    accountId: salesReturnsAccountId,
                    debit: totalInBaseCurrency,
                    credit: 0,
                    originalAmount: returnData.total || 0,
                    originalCurrency: invoiceCurrency,
                    description: customerName ? `مرتجع مبيعات آجل من ${customerName}` : `مرتجع مبيعات آجل رقم ${returnData.invoiceNo || 'جديد'}`
                };
                entryData.entries.push(addAccountInfo(salesReturnsEntry, salesReturnsAccountId));

                // Credit: Customer account (العميل دائن)
                let customerEntry = {
                    accountId: customerAccountId,
                    debit: 0,
                    credit: totalInBaseCurrency,
                    originalAmount: returnData.total || 0,
                    originalCurrency: invoiceCurrency,
                    description: `مرتجع مبيعات آجل رقم ${returnData.invoiceNo || 'جديد'} - ${customerName}`
                };
                entryData.entries.push(addAccountInfo(customerEntry, customerAccountId));
            }

            // Handle discounts and additions
            if (returnData.discountAdditionRows && returnData.discountAdditionRows.length > 0) {
                returnData.discountAdditionRows.forEach(row => {
                    const rowCurrency = row.currency || invoiceCurrency;
                    const rowExchangeRate = row.exchangeRate || invoiceExchangeRate;
                    const amountInBaseCurrency = InvoiceUtils.convertToBaseCurrency(row.amount || 0, rowCurrency, rowExchangeRate, this.currencies);

                    if (row.type === 'discount' && row.amount > 0) {
                        // Discount: Debit discount account, Credit counter account
                        if (row.accountId) {
                            let discountEntry = {
                                accountId: row.accountId,
                                debit: amountInBaseCurrency,
                                credit: 0,
                                originalAmount: row.amount,
                                originalCurrency: rowCurrency,
                                description: `خصم - ${row.notes || `مرتجع مبيعات رقم ${returnData.invoiceNo || 'جديد'}`}`
                            };
                            entryData.entries.push(addAccountInfo(discountEntry, row.accountId));
                        }

                        const discountCounterAccountId = row.counterAccountId || customerAccountId || settings.defaultDiscountCounterAccountId || null;
                        if (discountCounterAccountId) {
                            let discountCounterEntry = {
                                accountId: discountCounterAccountId,
                                debit: 0,
                                credit: amountInBaseCurrency,
                                originalAmount: row.amount,
                                originalCurrency: rowCurrency,
                                description: `خصم - ${row.notes || `مرتجع مبيعات رقم ${returnData.invoiceNo || 'جديد'}`}`
                            };
                            entryData.entries.push(addAccountInfo(discountCounterEntry, discountCounterAccountId));
                        }
                    } else if (row.type === 'addition' && row.amount > 0) {
                        // Addition: Credit addition account, Debit counter account
                        if (row.accountId) {
                            let additionEntry = {
                                accountId: row.accountId,
                                debit: 0,
                                credit: amountInBaseCurrency,
                                originalAmount: row.amount,
                                originalCurrency: rowCurrency,
                                description: `إضافة - ${row.notes || `مرتجع مبيعات رقم ${returnData.invoiceNo || 'جديد'}`}`
                            };
                            entryData.entries.push(addAccountInfo(additionEntry, row.accountId));
                        }

                        const additionCounterAccountId = row.counterAccountId || customerAccountId || settings.defaultAdditionCounterAccountId || null;
                        if (additionCounterAccountId) {
                            let additionCounterEntry = {
                                accountId: additionCounterAccountId,
                                debit: amountInBaseCurrency,
                                credit: 0,
                                originalAmount: row.amount,
                                originalCurrency: rowCurrency,
                                description: `إضافة - ${row.notes || `مرتجع مبيعات رقم ${returnData.invoiceNo || 'جديد'}`}`
                            };
                            entryData.entries.push(addAccountInfo(additionCounterEntry, additionCounterAccountId));
                        }
                    }
                });
            }

            return entryData;
        } catch (error) {
            console.error('Error calculating expected general entry for sale return:', error);
            return null;
        }
    },

    /**
     * Update or create sale return general entry
     */
    async updateOrCreateSaleReturnGeneralEntry(returnData) {
        try {
            // Find existing general entry
            const sourceId = String(returnData.id);
            const snapshot = await db.collection('generalEntries')
                .where('sourceId', '==', sourceId)
                .where('type', '==', 'sale_return')
                .limit(1)
                .get();
            
            if (!snapshot.empty) {
                // Update existing entry
                const existingEntry = snapshot.docs[0];
                const newEntryData = await this.calculateExpectedSaleReturnGeneralEntry(returnData);
                await db.collection('generalEntries').doc(existingEntry.id).update({
                    ...newEntryData,
                    updatedAt: new Date(),
                    updatedBy: auth.currentUser?.uid || 'system'
                });
            } else {
                // Create new entry
                await this.generateSaleReturnGeneralEntry(returnData);
            }
        } catch (error) {
            console.error('❌ Error updating/creating general entry:', error);
        }
    },

    /**
     * Show generated sale return general entry dialog
     */
    async showGeneratedSaleReturnGeneralEntry(returnId) {
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
                    .where('type', '==', 'sale_return')
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
                    String(e.sourceId) === sourceId && e.type === 'sale_return'
                );
            }
            
            if (!generalEntry) {
                console.warn('⚠️ General entry not found for sale return:', returnId);
                this.cancelSaleReturnForm();
                return;
            }
            
            const entryId = generalEntry.id;
            
            // Show dialog with options
            const result = await Swal.fire({
                title: 'تم حفظ فاتورة مرتجع المبيعات بنجاح',
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
                const returnData = await Collections.getSaleReturn(returnId);
                if (returnData) {
                    await this.printSaleReturnInvoice(returnData);
                }
            } else if (result.isDenied) {
                // Print general entry
                if (typeof VouchersModule !== 'undefined' && VouchersModule.printGeneralEntry) {
                    await VouchersModule.printGeneralEntry(entryId);
                }
            }
            
            // Reset form after dialog closes
            this.cancelSaleReturnForm();
            
            // Restore focus to main window
            window.focus();
            
        } catch (error) {
            console.error('❌ Error showing generated general entry:', error);
            this.cancelSaleReturnForm();
        }
    },

    /**
     * Print sale return invoice (placeholder)
     */
    async printSaleReturnInvoice(returnData) {
        // TODO: Implement print functionality
        console.log('Printing sale return invoice:', returnData);
    },

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

    async exportSettings() {
        try {
            const settings = await this.getSettings();
            const dataStr = JSON.stringify(settings, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'sale-returns-settings.json';
            link.click();
            URL.revokeObjectURL(url);
            showSuccess('تم تصدير الإعدادات بنجاح');
        } catch (error) {
            console.error('Error exporting settings:', error);
            showError('خطأ في تصدير الإعدادات');
        }
    },

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

    setupSettingsAccountPickerButtons() {
        // Use event delegation on the settings tab content to avoid multiple listeners
        const settingsTab = document.getElementById('settings');
        if (settingsTab && !settingsTab.dataset.accountPickersSetup) {
            settingsTab.dataset.accountPickersSetup = 'true';
            settingsTab.addEventListener('click', (e) => {
                const target = e.target.closest('button');
                if (!target) return;
                
                if (target.id === 'openDefaultSaleReturnCounterAccountPicker') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openAccountPicker('defaultSaleReturnCounterAccount', 'defaultSaleReturnCounterAccountDisplay');
                } else if (target.id === 'openDefaultSaleReturnCreditAccountPicker') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openAccountPicker('defaultSaleReturnCreditAccount', 'defaultSaleReturnCreditAccountDisplay');
                } else if (target.id === 'openDefaultSaleReturnAdditionCounterAccountPicker') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openAccountPicker('defaultSaleReturnAdditionCounterAccount', 'defaultSaleReturnAdditionCounterAccountDisplay');
                } else if (target.id === 'openDefaultSaleReturnDiscountCounterAccountPicker') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openAccountPicker('defaultSaleReturnDiscountCounterAccount', 'defaultSaleReturnDiscountCounterAccountDisplay');
                }
            });
        }
    },

    async generateSaleReturnInvoiceNumber() {
        try {
            const invoiceNo = await this.generateSaleReturnInvoiceNo();
            const invoiceNoInput = document.getElementById('saleReturnInvoiceNo');
            if (invoiceNoInput) {
                invoiceNoInput.value = invoiceNo;
            }
        } catch (error) {
            console.error('Error generating sale return invoice number:', error);
        }
    },

    /**
     * Initialize empty rows for new sale return
     */
    initializeEmptySaleReturnRows(count = 6) {
        const tbody = document.getElementById('saleReturnItemsBody');
        if (!tbody) return;
        
        // Clear existing rows if any
        tbody.innerHTML = '';
        
        // Add empty rows
        for (let i = 0; i < count; i++) {
            this.addSaleReturnItem();
        }
        
        console.log(`✅ Initialized ${count} empty sale return rows`);
    },

    /**
     * Setup sale return item row listeners
     */
    setupSaleReturnItemListeners(row) {
        // Remove item button
        const removeBtn = row.querySelector('.saleReturn-remove-item');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                row.remove();
                this.calculateSaleReturnTotals();
            });
        }

        // Product picker button
        const productPickerBtn = row.querySelector('.saleReturn-product-picker-btn');
        if (productPickerBtn) {
            productPickerBtn.addEventListener('click', () => {
                this.openSaleReturnProductPicker(row);
            });
        }

        // Available quantities button
        const availableQtyBtn = row.querySelector('.saleReturn-show-available-qty-btn');
        if (availableQtyBtn) {
            availableQtyBtn.addEventListener('click', () => {
                this.showSaleReturnAvailableQuantities(row);
            });
        }

        // Calculate total on input change
        const inputs = row.querySelectorAll('.saleReturn-price-input, .saleReturn-discount-percent-input, .saleReturn-discount-amount-input, .saleReturn-addition-percent-input, .saleReturn-addition-amount-input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.calculateSaleReturnItemTotal(row);
                this.calculateSaleReturnTotals();
            });
            input.addEventListener('blur', () => {
                if (input.value === '' || input.value === null) {
                    input.value = 0;
                    this.calculateSaleReturnItemTotal(row);
                    this.calculateSaleReturnTotals();
                }
            });
        });

        // Validate quantity input
        const quantityInput = row.querySelector('.saleReturn-quantity-input');
        if (quantityInput) {
            quantityInput.addEventListener('input', async () => {
                await this.validateSaleReturnQuantity(row);
                this.calculateSaleReturnItemTotal(row);
                this.calculateSaleReturnTotals();
            });
            quantityInput.addEventListener('blur', async () => {
                if (quantityInput.value === '' || quantityInput.value === null) {
                    quantityInput.value = 0;
                }
                await this.validateSaleReturnQuantity(row);
                this.calculateSaleReturnItemTotal(row);
                this.calculateSaleReturnTotals();
            });
        }

        // Expiry date and serial number linking
        const expiryDateSelect = row.querySelector('.saleReturn-expiry-date-input');
        const serialNumberSelect = row.querySelector('.saleReturn-serial-number-input');

        if (expiryDateSelect) {
            expiryDateSelect.addEventListener('change', async () => {
                await this.handleSaleReturnExpiryDateSelection(row);
            });
        }

        if (serialNumberSelect) {
            serialNumberSelect.addEventListener('change', async () => {
                await this.handleSaleReturnSerialNumberSelection(row);
            });
        }
    },

    /**
     * Calculate sale return item total
     */
    calculateSaleReturnItemTotal(row) {
        const quantity = parseFloat(row.querySelector('.saleReturn-quantity-input')?.value) || 0;
        const price = parseFloat(row.querySelector('.saleReturn-price-input')?.value) || 0;
        const discountPercent = parseFloat(row.querySelector('.saleReturn-discount-percent-input')?.value) || 0;
        const discountAmount = parseFloat(row.querySelector('.saleReturn-discount-amount-input')?.value) || 0;
        const additionPercent = parseFloat(row.querySelector('.saleReturn-addition-percent-input')?.value) || 0;
        const additionAmount = parseFloat(row.querySelector('.saleReturn-addition-amount-input')?.value) || 0;

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

        const totalInput = row.querySelector('.saleReturn-total-input');
        if (totalInput) {
            totalInput.value = subtotal.toFixed(2);
        }
    },

    /**
     * Populate sale return customer picker
     */
    populateSaleReturnCustomerPicker(searchTerm = '') {
        const tbody = document.getElementById('saleReturnCustomerPickerTableBody');
        if (!tbody) return;

        const searchLower = searchTerm.toLowerCase();
        const filteredCustomers = this.customers.filter(customer => {
            if (!searchTerm) return true;
            const name = (customer.name || '').toLowerCase();
            const code = (customer.code || '').toLowerCase();
            const phone = (customer.phone || '').toLowerCase();
            return name.includes(searchLower) || code.includes(searchLower) || phone.includes(searchLower);
        });

        tbody.innerHTML = filteredCustomers.map(customer => `
            <tr style="cursor: pointer;">
                <td>${this.escapeHtml(customer.name || '')}</td>
                <td>${this.escapeHtml(customer.code || '')}</td>
                <td>${this.escapeHtml(customer.phone || '')}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="SalesReturnsModule.selectSaleReturnCustomer('${customer.id}', '${this.escapeHtml(customer.name)}')">
                        <i class="fas fa-check"></i> اختيار
                    </button>
                </td>
            </tr>
        `).join('');

        // Setup search
        const searchInput = document.getElementById('saleReturnCustomerPickerSearch');
        if (searchInput) {
            searchInput.value = searchTerm;
            searchInput.addEventListener('input', (e) => {
                this.populateSaleReturnCustomerPicker(e.target.value);
            });
        }
    },

    /**
     * Select sale return customer
     */
    selectSaleReturnCustomer(customerId, customerName) {
        const customerDisplay = document.getElementById('saleReturnCustomerDisplay');
        const customerIdInput = document.getElementById('saleReturnCustomerId');
        if (customerDisplay) customerDisplay.value = customerName;
        if (customerIdInput) customerIdInput.value = customerId;

        const modal = bootstrap.Modal.getInstance(document.getElementById('saleReturnCustomerPickerModal'));
        if (modal) modal.hide();
    },

    /**
     * Populate sale return warehouse picker
     */
    populateSaleReturnWarehousePicker(searchTerm = '') {
        const tbody = document.getElementById('saleReturnWarehousePickerTableBody');
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
                    <button class="btn btn-sm btn-primary" onclick="SalesReturnsModule.selectSaleReturnWarehouse('${warehouse.id}', '${this.escapeHtml(warehouse.name)}')">
                        <i class="fas fa-check"></i> اختيار
                    </button>
                </td>
            </tr>
        `).join('');

        const searchInput = document.getElementById('saleReturnWarehousePickerSearch');
        if (searchInput) {
            searchInput.value = searchTerm;
            searchInput.addEventListener('input', (e) => {
                this.populateSaleReturnWarehousePicker(e.target.value);
            });
        }
    },

    /**
     * Select sale return warehouse
     */
    async selectSaleReturnWarehouse(warehouseId, warehouseName) {
        const warehouseDisplay = document.getElementById('saleReturnWarehouseDisplay');
        const warehouseIdInput = document.getElementById('saleReturnWarehouseId');
        if (warehouseDisplay) warehouseDisplay.value = warehouseName;
        if (warehouseIdInput) warehouseIdInput.value = warehouseId;

        const modal = bootstrap.Modal.getInstance(document.getElementById('saleReturnWarehousePickerModal'));
        if (modal) modal.hide();

        // Reload inventory details for all rows when warehouse changes
        const tbody = document.getElementById('saleReturnItemsBody');
        if (tbody) {
            const rows = tbody.querySelectorAll('tr');
            rows.forEach(row => {
                this.updateSaleReturnAvailableQuantitiesButton(row);
            });
        }
        if (tbody) {
            const rows = Array.from(tbody.children);
            for (const row of rows) {
                const productHiddenInput = row.querySelector('.saleReturn-product-select-id');
                if (productHiddenInput?.value) {
                    await this.loadSaleReturnProductInventoryDetails(row);
                }
            }
        }
    },

    /**
     * Populate sale return cost center picker
     */
    populateSaleReturnCostCenterPicker(searchTerm = '') {
        const tbody = document.getElementById('saleReturnCostCenterPickerTableBody');
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
                    <button class="btn btn-sm btn-primary" onclick="SalesReturnsModule.selectSaleReturnCostCenter('${costCenter.id}', '${this.escapeHtml(costCenter.name)}')">
                        <i class="fas fa-check"></i> اختيار
                    </button>
                </td>
            </tr>
        `).join('');

        const searchInput = document.getElementById('saleReturnCostCenterPickerSearch');
        if (searchInput) {
            searchInput.value = searchTerm;
            searchInput.addEventListener('input', (e) => {
                this.populateSaleReturnCostCenterPicker(e.target.value);
            });
        }
    },

    /**
     * Select sale return cost center
     */
    selectSaleReturnCostCenter(costCenterId, costCenterName) {
        const costCenterDisplay = document.getElementById('saleReturnCostCenterDisplay');
        const costCenterIdInput = document.getElementById('saleReturnCostCenterId');
        if (costCenterDisplay) costCenterDisplay.value = costCenterName;
        if (costCenterIdInput) costCenterIdInput.value = costCenterId;

        const modal = bootstrap.Modal.getInstance(document.getElementById('saleReturnCostCenterPickerModal'));
        if (modal) modal.hide();
    },

    /**
     * Handle sale return expiry date selection
     */
    async handleSaleReturnExpiryDateSelection(row) {
        const productHiddenInput = row.querySelector('.saleReturn-product-select-id');
        const warehouseId = document.getElementById('saleReturnWarehouseId')?.value;
        const expiryDateSelect = row.querySelector('.saleReturn-expiry-date-input');
        const serialNumberSelect = row.querySelector('.saleReturn-serial-number-input');

        if (!productHiddenInput?.value || !warehouseId || !expiryDateSelect?.value) {
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

            if (serialNumberSelect) {
                serialNumberSelect.innerHTML = '<option value="">-- اختر الرقم التسلسلي --</option>';
                serialNumbers.forEach(item => {
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
     * Handle sale return serial number selection
     */
    async handleSaleReturnSerialNumberSelection(row) {
        const productHiddenInput = row.querySelector('.saleReturn-product-select-id');
        const warehouseId = document.getElementById('saleReturnWarehouseId')?.value;
        const expiryDateSelect = row.querySelector('.saleReturn-expiry-date-input');
        const serialNumberSelect = row.querySelector('.saleReturn-serial-number-input');

        if (!productHiddenInput?.value || !warehouseId || !serialNumberSelect?.value) {
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

            if (expiryDateSelect) {
                expiryDateSelect.innerHTML = '<option value="">-- اختر تاريخ الصلاحية --</option>';
                expiryDates.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.expiryDate;
                    const formattedDate = formatDate(new Date(item.expiryDate));
                    option.textContent = `${formattedDate} (متاح: ${formatNumber(item.quantity)})`;
                    expiryDateSelect.appendChild(option);
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
     * Load sale return product inventory details
     */
    async loadSaleReturnProductInventoryDetails(row) {
        const productHiddenInput = row.querySelector('.saleReturn-product-select-id');
        const warehouseId = document.getElementById('saleReturnWarehouseId')?.value;
        const expiryDateSelect = row.querySelector('.saleReturn-expiry-date-input');
        const serialNumberSelect = row.querySelector('.saleReturn-serial-number-input');

        if (!productHiddenInput?.value || !warehouseId) {
            return;
        }

        const product = this.products.find(p => p.id === productHiddenInput.value);
        if (!product) {
            return;
        }

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

            const uniqueExpiryDates = [...new Set(inventoryItems.map(item => item.expiryDate))].sort();
            const uniqueSerialNumbers = [...new Set(inventoryItems.map(item => item.serialNumber))].sort();

            if (hasExpiry && expiryDateSelect) {
                expiryDateSelect.innerHTML = '<option value="">-- اختر تاريخ الصلاحية --</option>';
                uniqueExpiryDates.forEach(expiryDate => {
                    const option = document.createElement('option');
                    option.value = expiryDate;
                    const formattedDate = formatDate(new Date(expiryDate));
                    const count = inventoryItems.filter(item => item.expiryDate === expiryDate).length;
                    option.textContent = `${formattedDate} (${count} رقم تسلسلي)`;
                    expiryDateSelect.appendChild(option);
                });

                if (uniqueExpiryDates.length === 0) {
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = 'لا توجد تواريخ صلاحية متاحة';
                    option.disabled = true;
                    expiryDateSelect.appendChild(option);
                }
            }

            if (hasSerial && serialNumberSelect) {
                serialNumberSelect.innerHTML = '<option value="">-- اختر الرقم التسلسلي --</option>';
                uniqueSerialNumbers.forEach(serialNumber => {
                    const option = document.createElement('option');
                    option.value = serialNumber;
                    const count = inventoryItems.filter(item => item.serialNumber === serialNumber).length;
                    option.textContent = `${serialNumber} (${count} تاريخ صلاحية)`;
                    serialNumberSelect.appendChild(option);
                });

                if (uniqueSerialNumbers.length === 0) {
                    const option = document.createElement('option');
                    option.value = '';
                    option.textContent = 'لا توجد أرقام تسلسلية متاحة';
                    option.disabled = true;
                    serialNumberSelect.appendChild(option);
                }
            }
        } catch (error) {
            console.error('Error loading inventory details:', error);
        }
    },

    /**
     * Validate sale return quantity (placeholder)
     */
    async validateSaleReturnQuantity(row) {
        // TODO: Implement validation logic for sales returns
    },

    /**
     * Update sale return available quantities button visibility
     */
    updateSaleReturnAvailableQuantitiesButton(row) {
        const productHiddenInput = row.querySelector('.saleReturn-product-select-id');
        const warehouseId = document.getElementById('saleReturnWarehouseId')?.value;
        const availableQtyBtn = row.querySelector('.saleReturn-show-available-qty-btn');

        if (availableQtyBtn) {
            if (productHiddenInput?.value && warehouseId) {
                availableQtyBtn.style.display = '';
            } else {
                availableQtyBtn.style.display = 'none';
            }
        }
    },

    /**
     * Show sale return available quantities (placeholder)
     */
    async showSaleReturnAvailableQuantities(row) {
        // TODO: Implement similar to purchase returns but for sales returns
        console.log('Showing available quantities for sale return...');
    },

    /**
     * Open sale return product picker (placeholder)
     */
    openSaleReturnProductPicker(row) {
        // TODO: Implement similar to purchase returns
        console.log('Opening product picker for sale return...');
    }

};