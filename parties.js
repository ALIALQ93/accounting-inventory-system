/**
 * Parties Module (Customers & Suppliers) - ADVANCED VERSION
 * @module modules/parties
 */

const PartiesModule = {
    currentTab: 'dashboard',
    allParties: [],
    filteredParties: [],
    editingParty: null,
    partyGroups: [],
    editingGroup: null,
    allCurrencies: [], // ✅ إضافة قائمة العملات
    
    /**
     * Get HTML for parties module
     */
    getHTML() {
        return `
            <section id="parties" class="parties-module-modern">
                <!-- Header -->
                <div class="parties-header">
                    <div class="header-content-wrapper">
                        <div class="header-icon-box">
                            <i class="fas fa-users"></i>
                        </div>
                        <div class="header-text-box">
                            <h1 class="header-title">إدارة العملاء والموردين</h1>
                            <p class="header-subtitle">إدارة شاملة للعملاء والموردين مع الحسابات والأرصدة</p>
                        </div>
                    </div>
                </div>
                
                <!-- Tabs Navigation -->
                <div class="parties-tabs">
                    <button class="party-tab active" data-tab="dashboard" onclick="PartiesModule.switchTab('dashboard')">
                        <i class="fas fa-chart-pie"></i>
                        <span>لوحة المعلومات</span>
                    </button>
                    <button class="party-tab" data-tab="customers" onclick="PartiesModule.switchTab('customers')">
                        <i class="fas fa-user-tie"></i>
                        <span>العملاء</span>
                    </button>
                    <button class="party-tab" data-tab="suppliers" onclick="PartiesModule.switchTab('suppliers')">
                        <i class="fas fa-truck"></i>
                        <span>الموردين</span>
                    </button>
                    <button class="party-tab" data-tab="groups" onclick="PartiesModule.switchTab('groups')">
                        <i class="fas fa-layer-group"></i>
                        <span>المجموعات</span>
                    </button>
                    <button class="party-tab" data-tab="reports" onclick="PartiesModule.switchTab('reports')">
                        <i class="fas fa-file-chart-line"></i>
                        <span>التقارير</span>
                    </button>
                    <button class="party-tab" data-tab="settings" onclick="PartiesModule.switchTab('settings')">
                        <i class="fas fa-cogs"></i>
                        <span>الإعدادات</span>
                    </button>
                </div>
                
                <!-- Dashboard Tab -->
                <div id="parties-dashboard" class="party-tab-content active" style="display: block;">
                    <div class="parties-summary">
                        <div class="row">
                            <div class="col-md-3">
                                <div class="summary-card">
                                    <div class="card-icon">
                                        <i class="fas fa-users"></i>
                                    </div>
                                    <div class="card-content">
                                        <h3 id="totalPartiesCount">0</h3>
                                        <p>إجمالي العملاء والموردين</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="summary-card">
                                    <div class="card-icon">
                                        <i class="fas fa-user-tie"></i>
                                    </div>
                                    <div class="card-content">
                                        <h3 id="totalCustomersCount">0</h3>
                                        <p>إجمالي العملاء</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="summary-card">
                                    <div class="card-icon">
                                        <i class="fas fa-truck"></i>
                                    </div>
                                    <div class="card-content">
                                        <h3 id="totalSuppliersCount">0</h3>
                                        <p>إجمالي الموردين</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="summary-card">
                                    <div class="card-icon">
                                        <i class="fas fa-chart-line"></i>
                                    </div>
                                    <div class="card-content">
                                        <h3 id="activePartiesCount">0</h3>
                                        <p>النشطين</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="parties-actions">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="action-card">
                                    <h4><i class="fas fa-user-tie"></i> إدارة العملاء</h4>
                                    <p>إضافة وتعديل وحذف العملاء</p>
                                    <button class="btn btn-primary" onclick="PartiesModule.switchTab('customers')">
                                        <i class="fas fa-arrow-left"></i> الانتقال للعملاء
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="action-card">
                                    <h4><i class="fas fa-truck"></i> إدارة الموردين</h4>
                                    <p>إضافة وتعديل وحذف الموردين</p>
                                    <button class="btn btn-primary" onclick="PartiesModule.switchTab('suppliers')">
                                        <i class="fas fa-arrow-left"></i> الانتقال للموردين
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Party Groups Tab -->
                <div id="parties-groups" class="party-tab-content" style="display: none;">
                    <div class="groups-header">
                        <h3><i class="fas fa-layer-group"></i> المجموعات</h3>
                        <p>إدارة وتنظيم العملاء والموردين في مجموعات مشتركة لسهولة التصنيف والإدارة</p>
                    </div>
                    
                    <div class="content-toolbar">
                        <div class="toolbar-left">
                            <div class="search-box">
                                <i class="fas fa-search"></i>
                                <input type="text" id="groupSearch" placeholder="ابحث عن مجموعة..." onkeyup="PartiesModule.filterGroups()">
                            </div>
                        </div>
                        <div class="toolbar-right">
                            <button class="btn btn-primary" onclick="PartiesModule.addPartyGroup()">
                                <i class="fas fa-plus"></i> إضافة مجموعة جديدة
                            </button>
                        </div>
                    </div>

                    <!-- Groups Stats -->
                    <div class="row mb-4">
                        <div class="col-md-3">
                            <div class="summary-card">
                                <div class="card-icon">
                                    <i class="fas fa-layer-group"></i>
                                </div>
                                <div class="card-content">
                                    <h3 id="totalGroupsCount">0</h3>
                                    <p>إجمالي المجموعات</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="summary-card">
                                <div class="card-icon">
                                    <i class="fas fa-users"></i>
                                </div>
                                <div class="card-content">
                                    <h3 id="groupedPartiesCount">0</h3>
                                    <p>الأطراف المصنفة</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="summary-card">
                                <div class="card-icon">
                                    <i class="fas fa-user-friends"></i>
                                </div>
                                <div class="card-content">
                                    <h3 id="avgGroupSizeCount">0</h3>
                                    <p>متوسط حجم المجموعة</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="summary-card">
                                <div class="card-icon">
                                    <i class="fas fa-chart-pie"></i>
                                </div>
                                <div class="card-content">
                                    <h3 id="activeGroupsCount">0</h3>
                                    <p>المجموعات النشطة</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="table-container">
                        <table class="table table-modern">
                            <thead>
                                <tr>
                                    <th width="8%">الكود</th>
                                    <th width="20%">اسم المجموعة</th>
                                    <th width="25%">الوصف</th>
                                    <th width="12%">عدد الأطراف</th>
                                    <th width="10%">اللون</th>
                                    <th width="8%">الحالة</th>
                                    <th width="10%">تاريخ الإنشاء</th>
                                    <th width="12%">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="groupsTableBody">
                                <tr>
                                    <td colspan="8" class="text-center text-muted">
                                        <i class="fas fa-spinner fa-spin"></i> جاري التحميل...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Reports Tab -->
                <div id="parties-reports" class="party-tab-content" style="display: none;">
                    <div class="reports-header">
                        <h3><i class="fas fa-file-chart-line"></i> تقارير العملاء والموردين</h3>
                        <p>تقارير شاملة وتحليلات متقدمة للعملاء والموردين</p>
                    </div>
                    
                    <div class="reports-grid">
                        <div class="row">
                            <div class="col-md-4">
                                <div class="report-card">
                                    <div class="report-icon">
                                        <i class="fas fa-users"></i>
                                    </div>
                                    <div class="report-content">
                                        <h4>التقرير الشامل</h4>
                                        <p>تقرير شامل لجميع العملاء والموردين مع الإحصائيات</p>
                                        <button class="btn btn-primary" onclick="PartiesModule.generatePartiesReport()">
                                            <i class="fas fa-file-alt"></i> عرض التقرير
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="report-card">
                                    <div class="report-icon">
                                        <i class="fas fa-chart-pie"></i>
                                    </div>
                                    <div class="report-content">
                                        <h4>تحليل العملاء</h4>
                                        <p>تحليل متقدم للعملاء حسب الرصيد وحد الائتمان</p>
                                        <button class="btn btn-success" onclick="PartiesModule.generateCustomerAnalysis()">
                                            <i class="fas fa-chart-pie"></i> عرض التحليل
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="report-card">
                                    <div class="report-icon">
                                        <i class="fas fa-chart-bar"></i>
                                    </div>
                                    <div class="report-content">
                                        <h4>تحليل الموردين</h4>
                                        <p>تحليل متقدم للموردين حسب الرصيد والأداء</p>
                                        <button class="btn btn-info" onclick="PartiesModule.generateSupplierAnalysis()">
                                            <i class="fas fa-chart-bar"></i> عرض التحليل
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Settings Tab -->
                <div id="parties-settings" class="party-tab-content" style="display: none;">
                    <div class="settings-header">
                        <h3><i class="fas fa-cogs"></i> إعدادات العملاء والموردين</h3>
                        <p>تكوين الإعدادات الافتراضية للعملاء والموردين</p>
                    </div>
                    
                    <div class="settings-content">
                        <div class="row">
                            <!-- Default Accounts Settings -->
                            <div class="col-md-6">
                                <div class="settings-card">
                                    <div class="card-header">
                                        <h5><i class="fas fa-link text-primary"></i> الحسابات الرئيسية</h5>
                                        <p class="text-muted">تحديد الحسابات الرئيسية التي سيتم إنشاء الحسابات الفرعية تحتها</p>
                                    </div>
                                    <div class="card-body">
                                        <!-- Default Customer Account -->
                                        <div class="mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-user-tie text-success"></i>
                                                الحساب الرئيسي للعملاء
                                            </label>
                                            <select class="form-select" id="defaultCustomerAccount">
                                                <option value="">-- اختر الحساب الرئيسي --</option>
                                            </select>
                                            <small class="text-muted">
                                                سيتم إنشاء حساب فرعي تلقائياً تحت هذا الحساب لكل عميل جديد
                                            </small>
                                        </div>
                                        
                                        <!-- Default Supplier Account -->
                                        <div class="mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-truck text-warning"></i>
                                                الحساب الرئيسي للموردين
                                            </label>
                                            <select class="form-select" id="defaultSupplierAccount">
                                                <option value="">-- اختر الحساب الرئيسي --</option>
                                            </select>
                                            <small class="text-muted">
                                                سيتم إنشاء حساب فرعي تلقائياً تحت هذا الحساب لكل مورد جديد
                                            </small>
                                        </div>
                                        
                                        <!-- Save Settings Button -->
                                        <div class="d-grid">
                                            <button class="btn btn-primary" onclick="PartiesModule.saveDefaultAccounts()">
                                                <i class="fas fa-save"></i> حفظ الإعدادات
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Party Settings -->
                            <div class="col-md-6">
                                <div class="settings-card">
                                    <div class="card-header">
                                        <h5><i class="fas fa-sliders-h text-info"></i> إعدادات عامة</h5>
                                        <p class="text-muted">تكوين الإعدادات العامة للعملاء والموردين</p>
                                    </div>
                                    <div class="card-body">
                                        <!-- Auto Generate Codes -->
                                        <div class="mb-4">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="autoGenerateCodes" checked>
                                                <label class="form-check-label" for="autoGenerateCodes">
                                                    <i class="fas fa-magic text-primary"></i>
                                                    توليد الأكواد تلقائياً
                                                </label>
                                            </div>
                                            <small class="text-muted">
                                                توليد أكواد العملاء والموردين تلقائياً عند الإضافة
                                            </small>
                                        </div>
                                        
                                        <!-- Default Status -->
                                        <div class="mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-toggle-on text-success"></i>
                                                الحالة الافتراضية
                                            </label>
                                            <select class="form-select" id="defaultPartyStatus">
                                                <option value="active" selected>نشط</option>
                                                <option value="inactive">معطل</option>
                                            </select>
                                            <small class="text-muted">
                                                الحالة الافتراضية للعملاء والموردين الجدد
                                            </small>
                                        </div>
                                        
                                        <!-- Default Credit Limit -->
                                        <div class="mb-4">
                                            <label class="form-label">
                                                <i class="fas fa-credit-card text-warning"></i>
                                                حد الائتمان الافتراضي
                                            </label>
                                            <input type="number" class="form-control" id="defaultCreditLimit" value="0" min="0" step="100">
                                            <small class="text-muted">
                                                حد الائتمان الافتراضي للعملاء والموردين الجدد
                                            </small>
                                        </div>
                                        
                                        <!-- Save General Settings Button -->
                                        <div class="d-grid">
                                            <button class="btn btn-success" onclick="PartiesModule.saveGeneralSettings()">
                                                <i class="fas fa-save"></i> حفظ الإعدادات العامة
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
                                                <button class="btn btn-outline-primary w-100" onclick="PartiesModule.resetToDefaults()">
                                                    <i class="fas fa-undo"></i>
                                                    <br>إعادة تعيين الافتراضي
                                                </button>
                                            </div>
                                            <div class="col-md-3">
                                                <button class="btn btn-outline-info w-100" onclick="PartiesModule.exportSettings()">
                                                    <i class="fas fa-download"></i>
                                                    <br>تصدير الإعدادات
                                                </button>
                                            </div>
                                            <div class="col-md-3">
                                                <button class="btn btn-outline-success w-100" onclick="PartiesModule.importSettings()">
                                                    <i class="fas fa-upload"></i>
                                                    <br>استيراد الإعدادات
                                                </button>
                                            </div>
                                            <div class="col-md-3">
                                                <button class="btn btn-outline-warning w-100" onclick="PartiesModule.testSettings()">
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
                
                <!-- Customers Tab -->
                <div id="parties-customers" class="party-tab-content" style="display: none;">
                    <div class="content-toolbar">
                        <div class="toolbar-left">
                            <div class="search-box">
                                <i class="fas fa-search"></i>
                                <input type="text" id="customerSearch" placeholder="ابحث عن عميل..." onkeyup="PartiesModule.filterParties('customer')">
                            </div>
                        </div>
                        <div class="toolbar-right">
                            <button class="btn btn-primary" onclick="PartiesModule.addParty('customer')">
                                <i class="fas fa-plus"></i> إضافة عميل جديد
                            </button>
                        </div>
                    </div>
                    
                    <div class="table-container">
                        <table class="table table-modern">
                            <thead>
                                <tr>
                                    <th width="7%">الكود</th>
                                    <th width="14%">الاسم</th>
                                    <th width="10%">المجموعة</th>
                                    <th width="13%">الحساب المحاسبي</th>
                                    <th width="8%">الهاتف</th>
                                    <th width="8%">الرصيد</th>
                                    <th width="8%">حد الائتمان</th>
                                    <th width="8%">العملة</th>
                                    <th width="7%">الحالة</th>
                                    <th width="11%">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="customersTableBody">
                                <tr>
                                    <td colspan="10" class="text-center text-muted">
                                        <i class="fas fa-spinner fa-spin"></i> جاري التحميل...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Suppliers Tab -->
                <div id="parties-suppliers" class="party-tab-content" style="display: none;">
                    <div class="content-toolbar">
                        <div class="toolbar-left">
                            <div class="search-box">
                                <i class="fas fa-search"></i>
                                <input type="text" id="supplierSearch" placeholder="ابحث عن مورد..." onkeyup="PartiesModule.filterParties('supplier')">
                            </div>
                        </div>
                        <div class="toolbar-right">
                            <button class="btn btn-primary" onclick="PartiesModule.addParty('supplier')">
                                <i class="fas fa-plus"></i> إضافة مورد جديد
                            </button>
                        </div>
                    </div>
                    
                    <div class="table-container">
                        <table class="table table-modern">
                            <thead>
                                <tr>
                                    <th width="8%">الكود</th>
                    <th width="18%">الاسم</th>
                    <th width="12%">المجموعة</th>
                    <th width="15%">الحساب المحاسبي</th>
                    <th width="10%">الهاتف</th>
                    <th width="10%">الرصيد</th>
                    <th width="9%">حد الائتمان</th>
                    <th width="8%">الحالة</th>
                    <th width="12%">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="suppliersTableBody">
                                <tr>
                                    <td colspan="9" class="text-center text-muted">
                                        <i class="fas fa-spinner fa-spin"></i> جاري التحميل...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        `;
    },

    /**
     * Render parties HTML to DOM
     */
    render() {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = this.getHTML();
        }
    },

    /**
     * Initialize module
     */
    async initialize() {
        console.log('🔄 Initializing parties module...');
        await this.loadCurrencies(); // ✅ تحميل العملات أولاً
        await this.loadAllParties();
        await this.updateDashboard();
        this.updateSummary();
        
        // Ensure dashboard tab is active by default
        this.switchTab('dashboard');
        
        // Setup real-time sync
        this.setupPartiesSync();
        
        console.log('✅ Parties module initialized');
    },

    /**
     * Update summary statistics
     */
    updateSummary() {
        const customers = this.allParties.filter(p => p.type === 'customer' || p.type === 'both');
        const suppliers = this.allParties.filter(p => p.type === 'supplier' || p.type === 'both');
        const activeParties = this.allParties.filter(p => p.status === 'active');
        
        // Safely update summary counts
        if (window.DOMUtils) {
            const updates = {
                'totalPartiesCount': this.allParties.length.toString(),
                'totalCustomersCount': customers.length.toString(),
                'totalSuppliersCount': suppliers.length.toString(),
                'activePartiesCount': activeParties.length.toString()
            };
            
            window.DOMUtils.batchUpdateText(updates);
        } else {
            // Fallback with manual safety checks
            const totalPartiesEl = document.getElementById('totalPartiesCount');
            const totalCustomersEl = document.getElementById('totalCustomersCount');
            const totalSuppliersEl = document.getElementById('totalSuppliersCount');
            const activePartiesEl = document.getElementById('activePartiesCount');
            
            if (totalPartiesEl) totalPartiesEl.textContent = this.allParties.length;
            if (totalCustomersEl) totalCustomersEl.textContent = customers.length;
            if (totalSuppliersEl) totalSuppliersEl.textContent = suppliers.length;
            if (activePartiesEl) activePartiesEl.textContent = activeParties.length;
        }
    },
    
    /**
     * Load parties module
     */
    async load() {
        console.log('🔄 Loading parties module...');
        this.render();
        await this.initialize();
        console.log('✅ Parties module loaded');
    },

    /**
     * Load currencies from Firebase.
     */
    async loadCurrencies() {
        try {
            console.log('💱 Loading currencies for parties module...');
            
            if (!db) {
                console.error('❌ Firebase database not initialized');
                return;
            }

            const currenciesSnapshot = await db.collection('currencies').get();
            this.allCurrencies = [];

            currenciesSnapshot.forEach(doc => {
                const currency = {
                    id: doc.id,
                    ...doc.data()
                };
                this.allCurrencies.push(currency);
            });

            // Sort currencies: base currency first, then by code
            this.allCurrencies.sort((a, b) => {
                if (a.isBaseCurrency) return -1;
                if (b.isBaseCurrency) return 1;
                return (a.code || '').localeCompare(b.code || '');
            });

            console.log(`✅ Loaded ${this.allCurrencies.length} currencies for parties module`);
        } catch (error) {
            console.error('❌ Error loading currencies:', error);
            this.allCurrencies = [];
        }
    },

    /**
     * Generate currency options HTML for select dropdown.
     */
    generateCurrencyOptions(selectedCurrency = null) {
        if (this.allCurrencies.length === 0) {
            return `
                <option value="">IQD - الدينار العراقي (افتراضي)</option>
                <option value="USD">USD - الدولار الأمريكي</option>
                <option value="EUR">EUR - اليورو</option>
                <option value="GBP">GBP - الجنيه الإسترليني</option>
                <option value="SAR">SAR - الريال السعودي</option>
                <option value="AED">AED - الدرهم الإماراتي</option>
                <option value="TRY">TRY - الليرة التركية</option>
            `;
        }

        let optionsHTML = '';
        
        this.allCurrencies.forEach(currency => {
            const isSelected = selectedCurrency === currency.code ? 'selected' : '';
            const isBase = currency.isBaseCurrency ? ' (أساسية)' : '';
            const isActive = currency.status === 'active' ? '' : ' (غير نشط)';
            
            optionsHTML += `
                <option value="${currency.code}" ${isSelected}>
                    ${currency.code} - ${currency.name}${isBase}${isActive}
                </option>
            `;
        });

        return optionsHTML;
    },

    /**
     * Get currency display name.
     */
    getCurrencyDisplayName(currencyCode) {
        if (!currencyCode) return 'IQD';
        
        const currency = this.allCurrencies.find(c => c.code === currencyCode);
        if (currency) {
            return `${currency.code} - ${currency.name}`;
        }
        
        return currencyCode; // Fallback to code if not found
    },
    
    /**
     * Switch between tabs
     */
    switchTab(tab) {
        console.log(`🔄 Switching to tab: ${tab}`);
        this.currentTab = tab;
        
        // Update tab buttons
        document.querySelectorAll('.party-tab').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tab) {
                btn.classList.add('active');
            }
        });
        
        // Hide all tab contents
        document.querySelectorAll('.party-tab-content').forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });
        
        // Map tabs to their content IDs (simplified - one ID per tab)
        const tabMap = {
            'dashboard': 'parties-dashboard',
            'customers': 'parties-customers',
            'suppliers': 'parties-suppliers',
            'groups': 'parties-groups',
            'reports': 'parties-reports',
            'settings': 'parties-settings'
        };
        
        // Show the active tab content
        const contentId = tabMap[tab];
        if (contentId) {
            const element = document.getElementById(contentId);
            if (element) {
                element.classList.add('active');
                element.style.display = 'block';
                console.log(`✅ Tab ${tab} activated`);
            } else {
                console.error(`❌ Element not found: ${contentId}`);
            }
        } else {
            console.error(`❌ No mapping found for tab: ${tab}`);
        }
        
        // Load data based on tab
        if (tab === 'customers') {
            this.loadCustomersTable();
        } else if (tab === 'suppliers') {
            this.loadSuppliersTable();
        } else if (tab === 'groups') {
            this.loadPartyGroups();
        } else if (tab === 'dashboard') {
            this.updateDashboard();
        } else if (tab === 'settings') {
            this.loadSettings();
        } else if (tab === 'reports') {
            // Load reports data if needed
        }
    },
    
    /**
     * Load all parties from database
     */
    async loadAllParties() {
        try {
            console.log('🔄 Loading all parties from database...');
            const snapshot = await db.collection('parties').get();
            this.allParties = [];
            snapshot.forEach(doc => {
                const partyData = { id: doc.id, ...doc.data() };
                this.allParties.push(partyData);
            });
            console.log(`✅ Loaded ${this.allParties.length} parties from database`);
            
            // Update tables if they exist
            if (document.getElementById('customersTableBody')) {
                await this.loadCustomersTable();
            }
            if (document.getElementById('suppliersTableBody')) {
                await this.loadSuppliersTable();
            }
            
            // Update dashboard stats
            await this.updateDashboard();
        } catch (error) {
            console.error('❌ Error loading parties:', error);
            showError('حدث خطأ أثناء تحميل بيانات العملاء والموردين');
        }
    },
    
    /**
     * Update dashboard statistics
     */
    async updateDashboard() {
        const customers = this.allParties.filter(p => p.type === 'customer' || p.type === 'both');
        const suppliers = this.allParties.filter(p => p.type === 'supplier' || p.type === 'both');
        
        const activeCustomers = customers.filter(c => c.status === 'active');
        const activeSuppliers = suppliers.filter(s => s.status === 'active');
        
        const totalDebit = customers.reduce((sum, c) => sum + (parseFloat(c.balance) || 0), 0);
        
        // Safely update dashboard statistics
        if (window.DOMUtils) {
            const updates = {
                'totalCustomersCount': customers.length.toString(),
                'totalSuppliersCount': suppliers.length.toString(),
                'activePartiesCount': (activeCustomers.length + activeSuppliers.length).toString(),
                'totalPartiesCount': this.allParties.length.toString()
            };
            
            const results = window.DOMUtils.batchUpdateText(updates);
            console.log('📊 Dashboard stats updated:', results);
        } else {
            // Fallback to manual update with safety checks
            const totalCustomersEl = document.getElementById('totalCustomersCount');
            const totalSuppliersEl = document.getElementById('totalSuppliersCount'); 
            const activePartiesEl = document.getElementById('activePartiesCount');
            
            if (totalCustomersEl) totalCustomersEl.textContent = customers.length;
            if (totalSuppliersEl) totalSuppliersEl.textContent = suppliers.length;
            if (activePartiesEl) activePartiesEl.textContent = activeCustomers.length + activeSuppliers.length;
        }
        
        // Top customers
        const topCustomers = [...customers]
            .sort((a, b) => (parseFloat(b.balance) || 0) - (parseFloat(a.balance) || 0))
            .slice(0, 10);
        
        const topCustomersList = document.getElementById('topCustomersList');
        if (topCustomersList) {
            topCustomersList.innerHTML = topCustomers.map((c, idx) => `
                <div class="top-party-item">
                    <span class="rank">${idx + 1}</span>
                    <span class="party-name">${c.name}</span>
                    <span class="party-balance">${this.formatCurrency(c.balance || 0)}</span>
                </div>
            `).join('') || '<p class="text-muted">لا يوجد عملاء</p>';
        }
        
        // Top suppliers
        const topSuppliers = [...suppliers]
            .sort((a, b) => (parseFloat(b.balance) || 0) - (parseFloat(a.balance) || 0))
            .slice(0, 10);
        
        const topSuppliersList = document.getElementById('topSuppliersList');
        if (topSuppliersList) {
            topSuppliersList.innerHTML = topSuppliers.map((s, idx) => `
                <div class="top-party-item">
                    <span class="rank">${idx + 1}</span>
                    <span class="party-name">${s.name}</span>
                    <span class="party-balance">${this.formatCurrency(s.balance || 0)}</span>
                </div>
            `).join('') || '<p class="text-muted">لا يوجد موردين</p>';
        }
    },
    
    /**
     * Load customers table
     */
    async loadCustomersTable() {
        const tbody = document.getElementById('customersTableBody');
        if (!tbody) return;
        
        const customers = this.allParties.filter(p => p.type === 'customer' || p.type === 'both');
        
        if (customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted">لا يوجد عملاء</td></tr>';
            return;
        }
        
        // Load account names for all customers
        const customersWithAccounts = await Promise.all(customers.map(async party => ({
            ...party,
            accountName: await this.getAccountName(party.accountId)
        })));
        
        // Load group names for customers
        const customersWithGroupsAndAccounts = await Promise.all(customersWithAccounts.map(async party => ({
            ...party,
            groupName: party.groupId ? this.getPartyGroupName(party.groupId) : null
        })));
        
        tbody.innerHTML = customersWithGroupsAndAccounts.map(party => {
            const balance = parseFloat(party.balance || 0);
            const balanceClass = balance > 0 ? 'positive' : balance < 0 ? 'negative' : 'zero';
            
            return `
            <tr>
                <td>
                    <div class="party-code-cell">${party.code || '-'}</div>
                </td>
                <td>
                    <div class="party-name-cell">${party.name}</div>
                </td>
                <td>
                    ${party.groupName ? 
                        `<span class="party-group-badge" style="background-color: ${party.groupName.color || '#6c757d'};">
                            <i class="fas fa-layer-group"></i> ${party.groupName.name}
                        </span>` : 
                        '<span class="text-muted">-</span>'
                    }
                </td>
                <td>
                    <div class="party-account-cell">
                        <i class="fas fa-link"></i>
                        <span>${party.accountName || '-'}</span>
                    </div>
                </td>
                <td>
                    <div class="party-phone-cell">${party.phone || '-'}</div>
                </td>
                <td class="text-end">
                    <div class="party-balance-cell ${balanceClass}">${this.formatCurrency(balance)}</div>
                </td>
                <td class="text-end">${this.formatCurrency(party.creditLimit || 0)}</td>
                <td class="text-center">
                    <div class="party-currency-cell">${this.getCurrencyDisplayName(party.currency)}</div>
                </td>
                <td class="text-center">
                    <span class="status-badge-party status-${party.status === 'active' ? 'active' : 'inactive'}">
                        ${party.status === 'active' ? 'نشط' : 'معطل'}
                    </span>
                </td>
                <td class="text-center">
                    <div class="action-buttons">
                        <button class="action-btn-modern action-view" 
                                onclick="PartiesModule.viewParty('${party.id}')" 
                                title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn-modern action-edit" 
                                onclick="PartiesModule.editParty('${party.id}')" 
                                title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn-modern action-delete" 
                                onclick="PartiesModule.deleteParty('${party.id}')" 
                                title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        }).join('');
    },
    
    /**
     * Load suppliers table
     */
    async loadSuppliersTable() {
        const tbody = document.getElementById('suppliersTableBody');
        if (!tbody) return;
        
        const suppliers = this.allParties.filter(p => p.type === 'supplier' || p.type === 'both');
        
        if (suppliers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">لا يوجد موردين</td></tr>';
            return;
        }
        
        // Load account names for all suppliers
        const suppliersWithAccounts = await Promise.all(suppliers.map(async party => ({
            ...party,
            accountName: await this.getAccountName(party.accountId)
        })));
        
        tbody.innerHTML = suppliersWithAccounts.map(party => {
            const balance = parseFloat(party.balance || 0);
            const balanceClass = balance < 0 ? 'negative' : balance > 0 ? 'positive' : 'zero';
            
            return `
            <tr>
                <td>
                    <div class="party-code-cell">${party.code || '-'}</div>
                </td>
                <td>
                    <div class="party-name-cell">${party.name}</div>
                </td>
                <td>
                    <div class="party-account-cell">
                        <i class="fas fa-link"></i>
                        <span>${party.accountName || '-'}</span>
                    </div>
                </td>
                <td>
                    <div class="party-phone-cell">${party.phone || '-'}</div>
                </td>
                <td class="text-end">
                    <div class="party-balance-cell ${balanceClass}">${this.formatCurrency(balance)}</div>
                </td>
                <td class="text-end">${this.formatCurrency(party.creditLimit || 0)}</td>
                <td class="text-center">
                    <span class="status-badge-party status-${party.status === 'active' ? 'active' : 'inactive'}">
                        ${party.status === 'active' ? 'نشط' : 'معطل'}
                    </span>
                </td>
                <td class="text-center">
                    <div class="action-buttons">
                        <button class="action-btn-modern action-view" 
                                onclick="PartiesModule.viewParty('${party.id}')" 
                                title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn-modern action-edit" 
                                onclick="PartiesModule.editParty('${party.id}')" 
                                title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn-modern action-delete" 
                                onclick="PartiesModule.deleteParty('${party.id}')" 
                                title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        }).join('');
    },
    
    /**
     * Format currency — delegates to the global formatCurrency() from utils.js
     */
    formatCurrency(amount) {
        return formatCurrency(amount);
    },
    
    /**
     * Add new party
     */
    async addParty(type) {
        this.editingParty = null;
        await this.loadCurrencies(); // ✅ تحميل العملات قبل عرض الفورم
        this.showPartyModal(type);
    },
    
    /**
     * Edit party
     */
    async editParty(id) {
        try {
            // ⚠️ IMPORTANT: Load party data directly from Firestore to ensure we have latest data including subAccountId
            const partyDoc = await db.collection('parties').doc(id).get();
            if (!partyDoc.exists) {
                showError('لم يتم العثور على بيانات العميل/المورد');
                return;
            }
            
            this.editingParty = { id: partyDoc.id, ...partyDoc.data() };
            
            // Update allParties array with latest data
            const index = this.allParties.findIndex(p => p.id === id);
            if (index !== -1) {
                this.allParties[index] = this.editingParty;
            } else {
                this.allParties.push(this.editingParty);
            }
            
            await this.loadCurrencies(); // ✅ تحميل العملات قبل عرض الفورم
            this.showPartyModal(this.editingParty.type);
        } catch (error) {
            console.error('❌ Error loading party for editing:', error);
            showError('حدث خطأ أثناء تحميل بيانات العميل/المورد');
        }
    },
    
    /**
     * View party details
     */
    async viewParty(id) {
        const party = this.allParties.find(p => p.id === id);
        if (!party) return;
        
        // Get linked account name
        const accountName = await this.getAccountName(party.accountId);
        
        Swal.fire({
            title: `<i class="fas fa-${party.type === 'customer' ? 'user-tie' : 'truck'}"></i> ${party.name}`,
            html: `
                <div class="text-end">
                    <p><strong>الكود:</strong> ${party.code || '-'}</p>
                    <p><strong>النوع:</strong> ${party.type === 'customer' ? 'عميل' : 'مورد'}</p>
                    <p><strong><i class="fas fa-link text-primary"></i> الحساب المحاسبي:</strong> ${accountName}</p>
                    <p><strong>الهاتف:</strong> ${party.phone || '-'}</p>
                    <p><strong>البريد:</strong> ${party.email || '-'}</p>
                    <p><strong>العنوان:</strong> ${party.address || '-'}</p>
                    <p><strong>الرصيد:</strong> ${this.formatCurrency(party.balance || 0)} د.ع</p>
                    <p><strong>حد الائتمان:</strong> ${this.formatCurrency(party.creditLimit || 0)} د.ع</p>
                    <p><strong>الحالة:</strong> <span class="badge ${party.status === 'active' ? 'bg-success' : 'bg-secondary'}">${party.status === 'active' ? 'نشط' : 'معطل'}</span></p>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'تعديل',
            cancelButtonText: 'إغلاق',
            confirmButtonColor: '#ffc107',
            width: '600px'
        }).then((result) => {
            if (result.isConfirmed) {
                this.editParty(id);
            }
        });
    },
    
    /**
     * Delete party
     */
    async deleteParty(id) {
        // ⚠️ IMPORTANT: Load party data directly from Firestore to ensure we have latest data including subAccountId
        let party;
        try {
            const partyDoc = await db.collection('parties').doc(id).get();
            if (!partyDoc.exists) {
                showError('لم يتم العثور على بيانات العميل/المورد');
                return;
            }
            party = { id: partyDoc.id, ...partyDoc.data() };
        } catch (error) {
            console.error('❌ Error loading party data:', error);
            showError('حدث خطأ أثناء تحميل بيانات العميل/المورد');
            return;
        }
        
        try {
            // 🔍 فحص العمليات المرتبطة بالعميل/المورد
            const hasTransactions = await this.checkPartyTransactions(party);
            
            if (hasTransactions.found) {
                Swal.fire({
                    title: '❌ لا يمكن حذف هذا العميل/المورد!',
                    html: `
                        <div style="text-align: right; direction: rtl;">
                            <h5>🔗 السبب: يوجد عمليات مرتبطة بهذا العميل/المورد</h5>
                            <br>
                            <div class="alert alert-warning">
                                <strong>📊 العمليات الموجودة:</strong><br>
                                ${hasTransactions.details.map(detail => `• ${detail}`).join('<br>')}
                            </div>
                            <br>
                            <h6>💡 للحذف يجب أولاً:</h6>
                            <ol>
                                <li>حذف أو تعديل جميع العمليات المرتبطة</li>
                                <li>التأكد من عدم وجود معاملات مالية</li>
                                <li>ثم إعادة المحاولة</li>
                            </ol>
                        </div>
                    `,
                    icon: 'error',
                    confirmButtonText: 'فهمت',
                    confirmButtonColor: '#dc3545'
                });
                return;
            }

            // 🔍 فحص المعاملات على الحساب الفرعي المرتبط بالعميل/المورد
            if (party.subAccountId) {
                const hasAccountTransactions = await this.checkAccountTransactions(party.subAccountId);
                
                if (hasAccountTransactions) {
                    Swal.fire({
                        title: '❌ لا يمكن حذف هذا العميل/المورد!',
                        html: `
                            <div style="text-align: right; direction: rtl;">
                                <h5>💰 السبب: يوجد معاملات مالية على الحساب المرتبط</h5>
                                <br>
                                <div class="alert alert-danger">
                                    <strong>🏦 الحساب المحاسبي المرتبط به معاملات مالية</strong><br>
                                    <small>لا يمكن حذف العميل/المورد إذا كان حسابه المحاسبي يحتوي على معاملات</small>
                                </div>
                                <br>
                                <h6>💡 للحذف يجب أولاً:</h6>
                                <ol>
                                    <li>مراجعة الحساب المحاسبي في شجرة الحسابات</li>
                                    <li>نقل أو حذف جميع المعاملات المالية</li>
                                    <li>التأكد من أن رصيد الحساب = صفر</li>
                                    <li>ثم إعادة المحاولة</li>
                                </ol>
                            </div>
                        `,
                        icon: 'error',
                        confirmButtonText: 'فهمت',
                        confirmButtonColor: '#dc3545'
                    });
                    return;
                }
            }

            // ✅ إذا لم توجد عمليات أو معاملات، السماح بالحذف
            const result = await Swal.fire({
                title: '⚠️ تأكيد الحذف',
                html: `
                    <div style="text-align: right; direction: rtl;">
                        <p><strong>هل أنت متأكد من حذف "${party.name}"؟</strong></p>
                        <br>
                        <div class="alert alert-info">
                            <strong>🗑️ سيتم حذف:</strong><br>
                            • بيانات ${party.type === 'customer' ? 'العميل' : 'المورد'}<br>
                            ${party.subAccountId ? '• الحساب الفرعي المرتبط (وليس الحساب الرئيسي)<br>' : ''}
                            • جميع البيانات المرتبطة
                        </div>
                        <br>
                        <p class="text-danger"><strong>⚠️ هذا الإجراء لا يمكن التراجع عنه!</strong></p>
                    </div>
                `,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: '🗑️ نعم، احذف نهائياً',
                cancelButtonText: '❌ إلغاء',
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d'
            });
            
            if (result.isConfirmed) {
                showLoading();
                
                try {
                    // 🗑️ حذف الحساب الفرعي المرتبط بالعميل/المورد أولاً (وليس الحساب الرئيسي!)
                    if (party.subAccountId) {
                        // ⚠️ فحص إضافي: التأكد من أن subAccountId مختلف عن accountId الرئيسي
                        if (party.subAccountId === party.accountId) {
                            console.error(`❌ ERROR: subAccountId matches accountId! This should never happen.`);
                            console.log(`Party: ${party.name}, accountId: ${party.accountId}, subAccountId: ${party.subAccountId}`);
                            
                            hideLoading();
                            Swal.fire({
                                title: '❌ خطأ في البنية',
                                html: `
                                    <div style="text-align: right; direction: rtl;">
                                        <p><strong>خطأ في بيانات العميل/المورد:</strong></p>
                                        <p>الحساب الرئيسي والحساب الفرعي متماثلان!</p>
                                        <br>
                                        <div class="alert alert-danger">
                                            <small>هذه مشكلة في البنية قد تسبب حذف حساب رئيسي عن طريق الخطأ.</small>
                                        </div>
                                        <br>
                                        <p>يرجى التواصل مع الدعم الفني لإصلاح هذه المشكلة.</p>
                                    </div>
                                `,
                                icon: 'error',
                                confirmButtonText: 'حسناً'
                            });
                            return;
                        }
                        
                        await this.deleteLinkedAccount(party.subAccountId, party.name);
                        console.log(`✅ Deleted sub-account: ${party.subAccountId} for party: ${party.name}`);
                    } else {
                        console.warn(`⚠️ No sub-account found for party: ${party.name}`);
                        console.log(`Party data:`, { accountId: party.accountId, subAccountId: party.subAccountId });
                    }
                    
                    // 🗑️ حذف العميل/المورد
                    await db.collection('parties').doc(id).delete();
                    
                    hideLoading();
                    showSuccess(`✅ تم حذف ${party.type === 'customer' ? 'العميل' : 'المورد'} ${party.subAccountId ? 'والحساب الفرعي المرتبط به' : ''} بنجاح`);
                    await this.loadAllParties();
                    this.switchTab(this.currentTab);
                    
                } catch (deleteError) {
                    hideLoading();
                    console.error('❌ Error during deletion:', deleteError);
                    
                    if (deleteError.message && deleteError.message.includes('خطأ أمني')) {
                        Swal.fire({
                            title: '❌ خطأ أمني',
                            html: `
                                <div style="text-align: right; direction: rtl;">
                                    <p><strong>تم إيقاف عملية الحذف لحماية شجرة الحسابات!</strong></p>
                                    <br>
                                    <div class="alert alert-danger">
                                        <strong>السبب:</strong><br>
                                        ${deleteError.message}
                                    </div>
                                    <br>
                                    <p>يرجى التواصل مع الدعم الفني.</p>
                                </div>
                            `,
                            icon: 'error',
                            confirmButtonText: 'حسناً'
                        });
                    } else {
                        showError('حدث خطأ أثناء عملية الحذف: ' + deleteError.message);
                    }
                }
            }
            
        } catch (error) {
            console.error('❌ Error deleting party:', error);
            Swal.fire({
                title: '❌ خطأ في الحذف',
                text: 'حدث خطأ أثناء محاولة الحذف. يرجى المحاولة مرة أخرى.',
                icon: 'error',
                confirmButtonText: 'حسناً'
            });
        }
    },

    /**
     * Check if party has related transactions
     */
    async checkPartyTransactions(party) {
        const details = [];
        let found = false;

        try {
            // 🔍 فحص فواتير المبيعات
            const salesQuery = await db.collection('sales')
                .where('customerId', '==', party.id)
                .limit(1)
                .get();
            
            if (!salesQuery.empty) {
                found = true;
                details.push(`فواتير مبيعات (${salesQuery.size} عنصر)`);
            }

            // 🔍 فحص فواتير المشتريات
            const purchasesQuery = await db.collection('purchases')
                .where('supplierId', '==', party.id)
                .limit(1)
                .get();
            
            if (!purchasesQuery.empty) {
                found = true;
                details.push(`فواتير مشتريات (${purchasesQuery.size} عنصر)`);
            }

            // 🔍 فحص إيصالات السند
            const receiptsQuery = await db.collection('receipts')
                .where('partyId', '==', party.id)
                .limit(1)
                .get();
            
            if (!receiptsQuery.empty) {
                found = true;
                details.push(`إيصالات وسندات (${receiptsQuery.size} عنصر)`);
            }

            // 🔍 فحص القيود المحاسبية
            const journalQuery = await db.collection('journalEntries')
                .where('partyId', '==', party.id)
                .limit(1)
                .get();
            
            if (!journalQuery.empty) {
                found = true;
                details.push(`قيود محاسبية (${journalQuery.size} عنصر)`);
            }


            console.log(`🔍 Party transactions check for ${party.name}:`, {found, details});
            
            return { found, details: details.length > 0 ? details : ['لا توجد عمليات'] };
            
        } catch (error) {
            console.error('❌ Error checking party transactions:', error);
            return { found: false, details: ['خطأ في فحص العمليات'] };
        }
    },

    /**
     * Check if account has transactions (using chart of accounts logic)
     */
    async checkAccountTransactions(accountId) {
        try {
            console.log(`🔍 Checking account transactions for: ${accountId}`);
            
            // 🔍 فحص الرصيد أولاً
            const accountDoc = await db.collection('chartOfAccounts').doc(accountId).get();
            
            if (!accountDoc.exists) {
                console.log('ℹ️ Account not found in chartOfAccounts');
                return false;
            }
            
            const accountData = accountDoc.data();
            const balance = accountData.balance || 0;
            const debit = accountData.debit || 0;
            const credit = accountData.credit || 0;
            
            console.log(`💰 Account balance check:`, {balance, debit, credit});
            
            // إذا كان هناك رصيد أو حركة دائنة/مدينة
            if (balance !== 0 || debit !== 0 || credit !== 0) {
                console.log('⚠️ Account has balance or transactions');
                return true;
            }

            // 🔍 فحص إضافي في جدول المعاملات المالية
            const transactionsQuery = await db.collection('accountTransactions')
                .where('accountId', '==', accountId)
                .limit(1)
                .get();
            
            if (!transactionsQuery.empty) {
                console.log('⚠️ Account has transaction records');
                return true;
            }

            // 🔍 فحص القيود المحاسبية
            const journalEntriesQuery = await db.collection('journalEntries')
                .where('accounts', 'array-contains', accountId)
                .limit(1)
                .get();
            
            if (!journalEntriesQuery.empty) {
                console.log('⚠️ Account found in journal entries');
                return true;
            }

            console.log('✅ Account is clean, no transactions found');
            return false;
            
        } catch (error) {
            console.error('❌ Error checking account transactions:', error);
            // في حالة الخطأ، نعتبر أن هناك معاملات لتجنب الحذف الخاطئ
            return true;
        }
    },

    /**
     * Delete linked accounting account
     */
    async deleteLinkedAccount(subAccountId, partyName) {
        try {
            console.log(`🗑️ Deleting sub-account: ${subAccountId} for party: ${partyName}`);
            console.log(`⚠️ IMPORTANT: Deleting SUB-ACCOUNT (not main account) to preserve chart structure`);
            
            // ⚠️ فحص إضافي: التأكد من أن subAccountId موجود وصحيح
            if (!subAccountId || subAccountId.trim() === '') {
                console.warn(`⚠️ Empty or invalid subAccountId provided: ${subAccountId}`);
                return;
            }
            
            // حذف من chartOfAccounts - الحساب الفرعي فقط
            const subAccountDoc = await db.collection('chartOfAccounts').doc(subAccountId).get();
            if (!subAccountDoc.exists) {
                console.warn(`⚠️ Sub-account ${subAccountId} not found in chartOfAccounts`);
                return;
            }
            
            const subAccountData = subAccountDoc.data();
            console.log(`🔍 Found sub-account: ${subAccountData.code} - ${subAccountData.name}`);
            console.log(`🔍 Parent Account ID: ${subAccountData.parentId}`);
            
            // ⚠️ فحص مهم: التأكد من أن هذا حساب فرعي وليس حساب رئيسي
            if (!subAccountData.parentId) {
                console.error(`❌ ERROR: Attempted to delete a main account (${subAccountId})! This should never happen.`);
                throw new Error('❌ خطأ أمني: محاولة حذف حساب رئيسي! تم إيقاف العملية لحماية شجرة الحسابات.');
            }
            
            // ✅ التأكد من أن هذا هو حساب فرعي صحيح
            if (subAccountData.isLeafAccount === false || subAccountData.canHaveChildren === true) {
                console.warn(`⚠️ Warning: Account ${subAccountId} may not be a leaf account. Proceeding with caution.`);
            }
            
            // ✅ حذف الحساب الفرعي فقط
            await db.collection('chartOfAccounts').doc(subAccountId).delete();
            console.log('✅ Sub-account deleted from chartOfAccounts');
            
            // ❌ لا نحذف من accounts collection لتجنب التضارب - فقط من chartOfAccounts
            
            console.log(`✅ Successfully deleted sub-account for ${partyName}`);
            
        } catch (error) {
            console.error('❌ Error deleting sub-account:', error);
            
            // في حالة خطأ أمني، نوقف العملية تماماً
            if (error.message && error.message.includes('خطأ أمني')) {
                throw error; // إيقاف العملية
            }
            
            // في حالة خطأ عادي، نحذف العميل/المورد فقط بدون الحساب الفرعي
            console.warn('⚠️ Continuing with party deletion despite sub-account deletion error');
        }
    },
    
    /**
     * Filter parties
     */
    filterParties(type) {
        const searchInput = type === 'customer' ? 
            document.getElementById('customerSearch') : 
            document.getElementById('supplierSearch');
        
        const searchTerm = searchInput.value.toLowerCase();
        
        if (type === 'customer') {
            this.loadCustomersTable();
        } else {
            this.loadSuppliersTable();
        }
        
        // Apply filter
        const tbody = type === 'customer' ? 
            document.getElementById('customersTableBody') : 
            document.getElementById('suppliersTableBody');
        
        if (tbody && searchTerm) {
            const rows = tbody.querySelectorAll('tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }
    },
    
    /**
     * Show party modal (add/edit)
     */
    async showPartyModal(type) {
        // ✅ تحميل العملات إذا لم تكن محملة
        if (this.allCurrencies.length === 0) {
            await this.loadCurrencies();
        }
        
        const isEdit = this.editingParty !== null;
        const title = isEdit ? 
            `تعديل ${type === 'customer' ? 'عميل' : 'مورد'}` : 
            `إضافة ${type === 'customer' ? 'عميل' : 'مورد'} جديد`;
        
        // Load accounts for selection
        const accounts = await this.loadAccountsForSelection(type);
        const accountsOptions = accounts.map(acc => 
            `<option value="${acc.id}" ${isEdit && this.editingParty.accountId === acc.id ? 'selected' : ''}>
                ${acc.code} - ${acc.name}
            </option>`
        ).join('');
        
        // Get default settings
        const settings = await this.getSettings();
        const defaultAccountId = type === 'customer' ? settings.defaultCustomerAccount : settings.defaultSupplierAccount;
        
        Swal.fire({
            title: title,
            html: `
                <div class="text-end">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">الكود <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="partyCode" value="${isEdit ? this.editingParty.code : ''}" ${isEdit ? 'readonly' : 'readonly'} 
                                   placeholder="سيتم توليده تلقائياً" title="سيتم توليد الكود تلقائياً عند اختيار المجموعة">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">الاسم <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="partyName" value="${isEdit ? this.editingParty.name : ''}">
                        </div>
                    </div>
                    
                    <!-- Group Selection (for both customers and suppliers) -->
                    ${(type === 'customer' || type === 'supplier') ? `
                    <div class="mb-3">
                        <label class="form-label">
                            <i class="fas fa-layer-group text-primary"></i>
                            المجموعة
                        </label>
                        <select class="form-select" id="partyGroupId" ${isEdit ? '' : `onchange="PartiesModule.generatePartyCode('${type}')"`}>
                            <option value="">-- اختر مجموعة --</option>
                            ${await this.loadPartyGroupsForSelect()}
                        </select>
                        <small class="text-muted">
                            <i class="fas fa-layer-group text-primary"></i>
                            ${isEdit ? `يمكن تغيير مجموعة ${type === 'customer' ? 'العميل' : 'المورد'} حسب الحاجة` : `سيتم توليد كود ${type === 'customer' ? 'العميل' : 'المورد'} تلقائياً عند اختيار المجموعة`}
                        </small>
                    </div>
                    ` : ''}
                    
                    <!-- Account Selection - IMPORTANT -->
                    <div class="mb-3">
                        <label class="form-label">
                            <i class="fas fa-link text-primary"></i>
                            الحساب المحاسبي الرئيسي <span class="text-danger">*</span>
                        </label>
                        <select class="form-select" id="partyAccountId" ${isEdit ? 'disabled' : ''}>
                            <option value="">-- اختر الحساب الرئيسي (أو سيتم استخدام الحساب الافتراضي) --</option>
                            ${accountsOptions}
                        </select>
                        <small class="text-muted">
                            <i class="fas fa-${isEdit ? 'shield-alt' : 'magic'} text-${isEdit ? 'warning' : 'success'}"></i>
                            ${isEdit ? 'لا يمكن تغيير الحساب المحاسبي الرئيسي بعد إنشاء العميل/المورد لضمان سلامة الروابط المحاسبية' : `سيتم إنشاء حساب فرعي تلقائياً باسم ${type === 'customer' ? 'العميل' : 'المورد'} تحت الحساب المحدد أو الحساب الافتراضي من الإعدادات`}
                        </small>
                    </div>
                    
                    <!-- Linked Account Display (for editing) -->
                    ${isEdit ? `
                    <div class="mb-3">
                        <label class="form-label">
                            <i class="fas fa-book text-info"></i>
                            الحساب المرتبط بالبطاقة
                        </label>
                        <div class="input-group">
                            <input type="text" class="form-control" id="partyLinkedAccountDisplay" 
                                   value="${await this.getAccountName(this.editingParty.subAccountId || this.editingParty.accountId)}" 
                                   readonly style="background-color: #f8f9fa; cursor: default;" 
                                   title="الحساب المستخدم في المعاملات المالية">
                            <button type="button" class="btn btn-outline-info" onclick="PartiesModule.viewLinkedAccount('${this.editingParty.id}')" title="عرض تفاصيل الحساب">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                        <small class="text-muted">
                            <i class="fas fa-info-circle text-info"></i>
                            ${this.editingParty.subAccountId ? 
                                'الحساب الفرعي المرتبط ببطاقة ' + (type === 'customer' ? 'العميل' : 'المورد') + ' (يُستخدم في جميع المعاملات المالية)' : 
                                'الحساب الرئيسي (لم يتم إنشاء حساب فرعي بعد)'}
                        </small>
                    </div>
                    ` : ''}
                    
                    <!-- Currency and Nature Selection -->
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">
                                <i class="fas fa-coins text-warning"></i>
                                العملة
                            </label>
                            <select class="form-select" id="partyCurrency">
                                ${this.generateCurrencyOptions(isEdit ? this.editingParty.currency : null)}
                            </select>
                            <small class="text-muted">
                                <i class="fas fa-info-circle text-info"></i>
                                ${isEdit ? 'عملة الحساب المحاسبي المرتبط (يمكن تحديثها)' : `سيتم استخدام هذه العملة لحساب ${type === 'customer' ? 'العميل' : 'المورد'} في شجرة الحسابات`}
                            </small>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">
                                <i class="fas fa-balance-scale text-primary"></i>
                                طبيعة الحساب
                            </label>
                            <select class="form-select" id="partyNature" ${isEdit ? 'disabled' : ''}>
                                <option value="" ${isEdit ? 'selected' : ''}>تلقائي حسب النوع</option>
                                <option value="debit" ${isEdit && this.editingParty.nature === 'debit' ? 'selected' : ''}>مدين (Debit)</option>
                                <option value="credit" ${isEdit && this.editingParty.nature === 'credit' ? 'selected' : ''}>دائن (Credit)</option>
                            </select>
                            <small class="text-muted">
                                <i class="fas fa-info-circle text-info"></i>
                                ${isEdit ? 'طبيعة الحساب محمية من التعديل' : `${type === 'customer' ? 'الافتراضي: مدين (Debit)' : 'الافتراضي: دائن (Credit)'} - يمكن تغييرها`}
                            </small>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">الهاتف</label>
                            <input type="text" class="form-control" id="partyPhone" value="${isEdit ? this.editingParty.phone || '' : ''}">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">البريد الإلكتروني</label>
                            <input type="email" class="form-control" id="partyEmail" value="${isEdit ? this.editingParty.email || '' : ''}">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">العنوان</label>
                        <textarea class="form-control" id="partyAddress" rows="2">${isEdit ? this.editingParty.address || '' : ''}</textarea>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">حد الائتمان</label>
                            <input type="number" class="form-control" id="partyCreditLimit" value="${isEdit ? this.editingParty.creditLimit || 0 : 0}">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">الحالة</label>
                            <select class="form-select" id="partyStatus">
                                <option value="active" ${isEdit && this.editingParty.status === 'active' ? 'selected' : ''}>نشط</option>
                                <option value="inactive" ${isEdit && this.editingParty.status === 'inactive' ? 'selected' : ''}>معطل</option>
                            </select>
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: isEdit ? 'حفظ التعديلات' : 'إضافة',
            cancelButtonText: 'إلغاء',
            width: '800px',
            preConfirm: () => {
                const code = document.getElementById('partyCode').value.trim();
                const name = document.getElementById('partyName').value.trim();
                const accountId = document.getElementById('partyAccountId').value;
                
                if (!code || !name) {
                    Swal.showValidationMessage('يرجى إدخال الكود والاسم');
                    return false;
                }
                
                if (!isEdit && !accountId) {
                    Swal.showValidationMessage('يرجى اختيار الحساب المحاسبي الرئيسي');
                    return false;
                }
                
                return {
                    code,
                    name,
                    type,
                    accountId: isEdit ? this.editingParty.accountId : accountId, // Keep original account if editing
                    phone: document.getElementById('partyPhone').value.trim(),
                    email: document.getElementById('partyEmail').value.trim(),
                    address: document.getElementById('partyAddress').value.trim(),
                    creditLimit: parseFloat(document.getElementById('partyCreditLimit').value) || 0,
                    status: document.getElementById('partyStatus').value,
                    groupId: (type === 'customer' || type === 'supplier') ? document.getElementById('partyGroupId').value : undefined,
                    currency: document.getElementById('partyCurrency').value || null, // ✅ العملة
                    nature: document.getElementById('partyNature').value || null // ✅ الطبيعة
                };
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                await this.saveParty(result.value);
            }
        });
        
        // Set default values and pre-select current group if editing
        setTimeout(() => {
            if (!isEdit && defaultAccountId) {
                const accountSelect = document.getElementById('partyAccountId');
                if (accountSelect) {
                    accountSelect.value = defaultAccountId;
                }
            }
            
            // Pre-select current group if editing customer or supplier
            if (isEdit && (type === 'customer' || type === 'supplier') && this.editingParty.groupId) {
                const groupSelect = document.getElementById('partyGroupId');
                if (groupSelect) {
                    groupSelect.value = this.editingParty.groupId;
                    console.log(`✅ Pre-selected group ${this.editingParty.groupId} for ${type}`);
                }
            }
        }, 100);
    },
    
    /**
     * Load accounts for selection dropdown
     */
    async loadAccountsForSelection(partyType) {
        try {
            console.log(`🔍 Loading main accounts for ${partyType}...`);
            
            // First, ensure we have basic chart of accounts
            await this.ensureBasicChartOfAccounts();
            
            const allAccts = await ChartOfAccountsModule.getAccounts();
            const accounts = [];

            allAccts.forEach(account => {
                // Only show main accounts (not sub-accounts)
                // Main accounts are those that can have sub-accounts
                if (account.isParentAccount) {
                    // Filter relevant accounts based on party type
                    if (partyType === 'customer') {
                        // Customers should be linked to receivables accounts
                        // Check for receivables type or accounts that typically contain customers
                        if (account.type === 'receivable' || 
                            account.type === 'assets' || // Assets can contain receivables
                            (account.code && (account.code.startsWith('1-2') || account.code.startsWith('12') || account.code === '1'))) {
                            accounts.push(account);
                        }
                    } else if (partyType === 'supplier') {
                        // Suppliers should be linked to payables accounts
                        // Check for payables type or accounts that typically contain suppliers
                        if (account.type === 'payable' || 
                            account.type === 'liabilities' || // Liabilities can contain payables
                            (account.code && (account.code.startsWith('2-1') || account.code.startsWith('21') || account.code === '2'))) {
                            accounts.push(account);
                        }
                    }
                }
            });
            
            // If no specific accounts found, return all main accounts
            if (accounts.length === 0) {
                snapshot.forEach(doc => {
                    const account = { id: doc.id, ...doc.data() };
                    if (account.isParentAccount) {
                        accounts.push(account);
                    }
                });
            }
            
            console.log(`✅ Found ${accounts.length} main accounts for ${partyType}`);
            return accounts.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
            
        } catch (error) {
            console.error('Error loading accounts:', error);
            return [];
        }
    },
    
    /**
     * Ensure basic chart of accounts exists
     */
    async ensureBasicChartOfAccounts() {
        try {
            const accounts = await ChartOfAccountsModule.getAccounts();
            if (!accounts || accounts.length === 0) {
                showError('لم يتم العثور على حسابات في شجرة الحسابات. يرجى إنشاء الحسابات من وحدة شجرة الحسابات أولاً.');
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error checking chart of accounts:', error);
            showError('خطأ في التحقق من شجرة الحسابات');
            return false;
        }
    },

    // ❌ OLD DUPLICATE FUNCTIONS REMOVED
    // استخدم createSubAccount الموجودة في نهاية الملف لإنشاء الحسابات الفرعية
    // generateSubAccountCode أيضاً متوفرة في الدالة الرئيسية
    
    /**
     * Get account name by ID
     */
    async getAccountName(accountId) {
        try {
            if (!accountId) return '-';
            
            // First check if it's a sub-account
            await ChartOfAccountsModule.getAccounts();
            const account = ChartOfAccountsModule.getAccountById(accountId);
            if (account) {
                // If it's a sub-account, show both main and sub account info
                if (account.parentId) {
                    const mainAccount = ChartOfAccountsModule.getAccountById(account.parentId);
                    if (mainAccount) {
                        return `${mainAccount.code} - ${mainAccount.name} → ${account.code} - ${account.name}`;
                    }
                }
                // Regular account
                return `${account.code || ''} - ${account.name || ''}`;
            }

            return '-';
        } catch (error) {
            console.error('Error getting account name:', error);
            return '-';
        }
    },
    
    /**
     * View linked account details
     */
    async viewLinkedAccount(partyId) {
        try {
            const party = this.allParties.find(p => p.id === partyId);
            if (!party) {
                showError('لم يتم العثور على بيانات العميل/المورد');
                return;
            }
            
            // Get the linked account ID (subAccountId if exists, otherwise accountId)
            const linkedAccountId = party.subAccountId || party.accountId;
            if (!linkedAccountId) {
                showError('لا يوجد حساب مرتبط بهذا العميل/المورد');
                return;
            }
            
            // Get account details
            const accountDoc = await db.collection('chartOfAccounts').doc(linkedAccountId).get();
            if (!accountDoc.exists) {
                showError('الحساب المرتبط غير موجود في شجرة الحسابات');
                return;
            }
            
            const account = accountDoc.data();
            let accountInfo = {
                code: account.code || '-',
                name: account.name || '-',
                type: account.type || '-',
                nature: account.nature || '-',
                currency: account.currency || '-',
                balance: account.balance || 0,
                debit: account.debit || 0,
                credit: account.credit || 0,
                isSubAccount: !!account.parentId,
                parentAccount: null
            };
            
            // If it's a sub-account, get parent account info
            if (account.parentId) {
                const parentDoc = await db.collection('chartOfAccounts').doc(account.parentId).get();
                if (parentDoc.exists) {
                    const parentAccount = parentDoc.data();
                    accountInfo.parentAccount = {
                        code: parentAccount.code || '-',
                        name: parentAccount.name || '-'
                    };
                }
            }
            
            // Display account details
            Swal.fire({
                title: `<i class="fas fa-book text-info"></i> الحساب المرتبط`,
                html: `
                    <div class="text-end" style="direction: rtl;">
                        <div class="alert alert-info">
                            <strong>${party.name}</strong><br>
                            <small>${party.type === 'customer' ? 'عميل' : 'مورد'}</small>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <div class="card border-primary">
                                    <div class="card-body">
                                        <h6 class="card-title"><i class="fas fa-hashtag text-primary"></i> كود الحساب</h6>
                                        <p class="card-text"><strong>${accountInfo.code}</strong></p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card border-success">
                                    <div class="card-body">
                                        <h6 class="card-title"><i class="fas fa-signature text-success"></i> اسم الحساب</h6>
                                        <p class="card-text"><strong>${accountInfo.name}</strong></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        ${accountInfo.isSubAccount && accountInfo.parentAccount ? `
                        <div class="alert alert-light border mb-3">
                            <strong><i class="fas fa-sitemap text-secondary"></i> الحساب الرئيسي:</strong><br>
                            <span class="text-secondary">${accountInfo.parentAccount.code} - ${accountInfo.parentAccount.name}</span>
                        </div>
                        ` : ''}
                        
                        <div class="row mb-3">
                            <div class="col-md-4">
                                <div class="card border-info">
                                    <div class="card-body text-center">
                                        <h6 class="card-title"><i class="fas fa-tag text-info"></i> النوع</h6>
                                        <p class="card-text"><strong>${accountInfo.type}</strong></p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card border-warning">
                                    <div class="card-body text-center">
                                        <h6 class="card-title"><i class="fas fa-balance-scale text-warning"></i> الطبيعة</h6>
                                        <p class="card-text"><strong>${accountInfo.nature === 'debit' ? 'مدين' : accountInfo.nature === 'credit' ? 'دائن' : accountInfo.nature}</strong></p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card border-secondary">
                                    <div class="card-body text-center">
                                        <h6 class="card-title"><i class="fas fa-coins text-secondary"></i> العملة</h6>
                                        <p class="card-text"><strong>${accountInfo.currency}</strong></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-4">
                                <div class="card border-primary">
                                    <div class="card-body text-center">
                                        <h6 class="card-title"><i class="fas fa-wallet text-primary"></i> الرصيد</h6>
                                        <p class="card-text"><strong class="text-primary">${this.formatCurrency(accountInfo.balance)}</strong></p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card border-danger">
                                    <div class="card-body text-center">
                                        <h6 class="card-title"><i class="fas fa-arrow-up text-danger"></i> المدين</h6>
                                        <p class="card-text"><strong class="text-danger">${this.formatCurrency(accountInfo.debit)}</strong></p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card border-success">
                                    <div class="card-body text-center">
                                        <h6 class="card-title"><i class="fas fa-arrow-down text-success"></i> الدائن</h6>
                                        <p class="card-text"><strong class="text-success">${this.formatCurrency(accountInfo.credit)}</strong></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="alert alert-light border">
                            <small>
                                <i class="fas fa-info-circle text-info"></i>
                                <strong>ملاحظة:</strong> هذا هو الحساب المستخدم في جميع المعاملات المالية المرتبطة بهذا ${party.type === 'customer' ? 'العميل' : 'المورد'}.
                            </small>
                        </div>
                    </div>
                `,
                width: '700px',
                showConfirmButton: true,
                confirmButtonText: 'حسناً',
                confirmButtonColor: '#3085d6'
            });
            
        } catch (error) {
            console.error('Error viewing linked account:', error);
            showError('حدث خطأ أثناء عرض تفاصيل الحساب');
        }
    },
    
    /**
     * Save party
     */
    async saveParty(data) {
        try {
            showLoading();
            
            if (this.editingParty) {
                // تحديث عميل/مورد موجود
                
                // فحص عدم تكرار الاسم (استثناء العميل الحالي)
                const duplicateName = this.allParties.find(p => 
                    p.name.toLowerCase().trim() === data.name.toLowerCase().trim() && 
                    p.id !== this.editingParty.id
                );
                
                if (duplicateName) {
                    hideLoading();
                    showError(`❌ اسم "${data.name}" مستخدم مسبقاً!\n\n🔍 موجود في:\n• الكود: ${duplicateName.code}\n• النوع: ${duplicateName.type === 'customer' ? 'عميل' : 'مورد'}\n\n💡 يرجى استخدام اسم مختلف لتجنب التضارب في شجرة الحسابات.`);
                    return;
                }
                
                // فحص عدم تكرار الكود (استثناء العميل الحالي) 
                const duplicateCode = this.allParties.find(p => 
                    p.code.toLowerCase().trim() === data.code.toLowerCase().trim() && 
                    p.id !== this.editingParty.id
                );
                
                if (duplicateCode) {
                    hideLoading();
                    showError(`❌ كود "${data.code}" مستخدم مسبقاً!\n\n🔍 موجود لـ: ${duplicateCode.name}\n• النوع: ${duplicateCode.type === 'customer' ? 'عميل' : 'مورد'}\n\n💡 يرجى استخدام كود مختلف.`);
                    return;
                }
                
                console.log(`💾 Updating party ${this.editingParty.id} in database...`);
                await db.collection('parties').doc(this.editingParty.id).update({
                    ...data,
                    updatedAt: new Date(),
                    updatedBy: auth.currentUser?.uid || 'system'
                });
                console.log(`✅ Party ${this.editingParty.id} updated successfully`);
                showSuccess('✅ تم تحديث بيانات العميل/المورد بنجاح');
            } else {
                // إضافة عميل/مورد جديد
                
                // 🔍 فحص عدم تكرار الاسم
                const duplicateName = this.allParties.find(p => 
                    p.name.toLowerCase().trim() === data.name.toLowerCase().trim()
                );
                
                if (duplicateName) {
                    hideLoading();
                    showError(`❌ اسم "${data.name}" مستخدم مسبقاً!\n\n🔍 موجود في:\n• الكود: ${duplicateName.code}\n• النوع: ${duplicateName.type === 'customer' ? 'عميل' : 'مورد'}\n\n💡 الأسماء المكررة تسبب مشاكل في شجرة الحسابات.\nيرجى استخدام اسم مختلف أو إضافة تمييز (مثل: اسم الشركة + المنطقة).`);
                    return;
                }
                
                // 🔍 فحص عدم تكرار الكود
                const duplicateCode = this.allParties.find(p => 
                    p.code.toLowerCase().trim() === data.code.toLowerCase().trim()
                );
                
                if (duplicateCode) {
                    hideLoading();
                    showError(`❌ كود "${data.code}" مستخدم مسبقاً!\n\n🔍 موجود لـ: ${duplicateCode.name}\n• النوع: ${duplicateCode.type === 'customer' ? 'عميل' : 'مورد'}\n\n💡 يرجى توليد كود جديد أو التعديل يدوياً.`);
                    return;
                }
                
                // 🔍 فحص عدم تكرار اسم الحساب في شجرة الحسابات
                if (data.accountId) {
                    const existingAccountByName = await db.collection('chartOfAccounts')
                        .where('name', '==', data.name)
                        .get();
                    
                    if (!existingAccountByName.empty) {
                        hideLoading();
                        showError(`❌ يوجد حساب محاسبي بنفس الاسم "${data.name}" في شجرة الحسابات!\n\n🏦 هذا سيسبب تضارب في الحسابات المحاسبية.\n\n💡 يرجى:\n• استخدام اسم مختلف\n• أو إضافة تمييز للاسم (مثل: رقم، منطقة، إلخ)`);
                        return;
                    }
                }
                
                console.log('💾 Creating new party in database...');
                const partyRef = await db.collection('parties').add({
                    ...data,
                    balance: 0,
                    createdAt: new Date(),
                    createdBy: auth.currentUser?.uid || 'system'
                });
                
                console.log(`✅ Party created with ID: ${partyRef.id}`);
                
                let subAccountId = null;
                let parentAccountId = data.accountId;
                
                // ⚠️ CRITICAL: إذا لم يتم اختيار حساب رئيسي، استخدم الحساب الافتراضي من الإعدادات
                if (!parentAccountId) {
                    const settings = await this.getSettings();
                    const defaultAccountId = data.type === 'customer' 
                        ? settings.defaultCustomerAccount 
                        : settings.defaultSupplierAccount;
                    
                    if (defaultAccountId) {
                        parentAccountId = defaultAccountId;
                        console.log(`📋 Using default account from settings: ${parentAccountId}`);
                        
                        // تحديث بيانات العميل/المورد بالحساب الافتراضي
                        await db.collection('parties').doc(partyRef.id).update({
                            accountId: parentAccountId,
                            updatedAt: new Date(),
                            updatedBy: auth.currentUser?.uid || 'system'
                        });
                    } else {
                        // ⚠️ لا يوجد حساب افتراضي محدد - يجب تحديد حساب
                        hideLoading();
                        showError(`❌ يجب تحديد الحساب الرئيسي لـ ${data.type === 'customer' ? 'العميل' : 'المورد'}!\n\n💡 يمكنك:\n• اختيار حساب رئيسي من القائمة\n• أو تحديد حساب افتراضي في إعدادات العملاء/الموردين`);
                        // حذف العميل/المورد الذي تم إنشاؤه بدون حساب
                        await db.collection('parties').doc(partyRef.id).delete();
                        return;
                    }
                }
                
                // ✅ إنشاء حساب فرعي تلقائياً (إجباري)
                try {
                    console.log('🏗️ Creating sub-account for new party...');
                    subAccountId = await this.createSubAccount(
                        parentAccountId, 
                        data.name, 
                        data.code, 
                        data.type,
                        data.currency || null,
                        data.nature || null
                    );
                    
                    console.log(`✅ Sub-account created with ID: ${subAccountId}`);
                    
                    // ربط الحساب الفرعي بالعميل/المورد
                    await db.collection('parties').doc(partyRef.id).update({
                        subAccountId: subAccountId,
                        accountId: parentAccountId, // تأكد من حفظ الحساب الرئيسي أيضاً
                        updatedAt: new Date(),
                        updatedBy: auth.currentUser?.uid || 'system'
                    });
                    
                    console.log(`✅ Linked sub-account ${subAccountId} to party ${partyRef.id}`);
                    
                } catch (subAccountError) {
                    console.error('❌ Error creating sub-account:', subAccountError);
                    hideLoading();
                    // ⚠️ CRITICAL: فشل إنشاء الحساب - يجب حذف العميل/المورد
                    await db.collection('parties').doc(partyRef.id).delete();
                    showError(`❌ فشل في إنشاء الحساب المحاسبي: ${subAccountError.message}\n\n💡 تم إلغاء إضافة ${data.type === 'customer' ? 'العميل' : 'المورد'} لأن الحساب المحاسبي مطلوب للقيود المحاسبية.`);
                    return;
                }
                
                showSuccess(`✅ تم إضافة ${data.type === 'customer' ? 'العميل' : 'المورد'} بنجاح مع الحساب الفرعي المرتبط (${subAccountId})`);
            }
            
            await this.loadAllParties();
            this.switchTab(this.currentTab);
            
        } catch (error) {
            console.error('Error saving party:', error);
            showError('حدث خطأ أثناء الحفظ');
        } finally {
            hideLoading();
        }
    },

    /**
     * Load parties data (legacy)
     */
    async loadPartiesDataLegacy() {
        await handleAsync(async () => {
            await this.loadCustomers();
            await this.loadSuppliers();
        }, null, true);
    },

    async loadCustomers() {
        const tbody = document.getElementById('customersTableBody');
        if (!tbody) return;

        const customers = await Collections.getParties('customer');
        tbody.innerHTML = '';

        if (customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">لا يوجد عملاء</td></tr>';
            return;
        }

        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${sanitizeInput(customer.code || '-')}</td>
                <td>${sanitizeInput(customer.name)}</td>
                <td>${sanitizeInput(customer.phone || '-')}</td>
                <td>${formatCurrency(customer.balance || 0)}</td>
                <td>${formatCurrency(customer.creditLimit || 0)}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="PartiesModule.viewStatement('${customer.id}')">
                        <i class="fas fa-file-alt"></i> كشف حساب
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    },

    async loadSuppliers() {
        const tbody = document.getElementById('suppliersTableBody');
        if (!tbody) return;

        const suppliers = await Collections.getParties('supplier');
        tbody.innerHTML = '';

        if (suppliers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">لا يوجد موردين</td></tr>';
            return;
        }

        suppliers.forEach(supplier => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${sanitizeInput(supplier.code || '-')}</td>
                <td>${sanitizeInput(supplier.name)}</td>
                <td>${sanitizeInput(supplier.phone || '-')}</td>
                <td>${formatCurrency(supplier.balance || 0)}</td>
                <td>${this.getCurrencyDisplayName(supplier.currency)}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="PartiesModule.viewStatement('${supplier.id}')">
                        <i class="fas fa-file-alt"></i> كشف حساب
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    },

    async viewStatement(partyId) {
        showInfo('كشف الحساب قيد التطوير');
    },
    
    /**
     * Get party by ID (used in invoices/sales/purchases)
     */
    async getPartyById(partyId) {
        try {
            const doc = await db.collection('parties').doc(partyId).get();
            if (doc.exists) {
                return { id: doc.id, ...doc.data() };
            }
            return null;
        } catch (error) {
            console.error('Error getting party:', error);
            return null;
        }
    },
    
    /**
     * Get all active customers (for invoices)
     */
    async getActiveCustomers() {
        try {
            const snapshot = await db.collection('parties')
                .where('type', 'in', ['customer', 'both'])
                .where('status', '==', 'active')
                .get();
            
            const customers = [];
            snapshot.forEach(doc => {
                customers.push({ id: doc.id, ...doc.data() });
            });
            
            return customers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        } catch (error) {
            console.error('Error getting active customers:', error);
            return [];
        }
    },
    
    /**
     * Get all active suppliers (for purchases)
     */
    async getActiveSuppliers() {
        try {
            const snapshot = await db.collection('parties')
                .where('type', 'in', ['supplier', 'both'])
                .where('status', '==', 'active')
                .get();
            
            const suppliers = [];
            snapshot.forEach(doc => {
                suppliers.push({ id: doc.id, ...doc.data() });
            });
            
            return suppliers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        } catch (error) {
            console.error('Error getting active suppliers:', error);
            return [];
        }
    },
    
    /**
     * Update party balance (called from invoices/sales/purchases)
     */
    async updatePartyBalance(partyId, amount, operation = 'add') {
        try {
            const partyRef = db.collection('parties').doc(partyId);
            const doc = await partyRef.get();
            
            if (!doc.exists) {
                throw new Error('Party not found');
            }
            
            const currentBalance = parseFloat(doc.data().balance) || 0;
            let newBalance;
            
            if (operation === 'add') {
                newBalance = currentBalance + amount;
            } else if (operation === 'subtract') {
                newBalance = currentBalance - amount;
            } else {
                newBalance = amount; // set directly
            }
            
            await partyRef.update({
                balance: newBalance,
                lastTransactionDate: new Date(),
                updatedAt: new Date()
            });
            
            return newBalance;
            
        } catch (error) {
            console.error('Error updating party balance:', error);
            throw error;
        }
    },

    /**
     * Generate comprehensive parties report
     */
    async generatePartiesReport() {
        try {
            showLoading();

            const customers = this.allParties.filter(p => p.type === 'customer' || p.type === 'both');
            const suppliers = this.allParties.filter(p => p.type === 'supplier' || p.type === 'both');
            
            const totalCustomers = customers.length;
            const totalSuppliers = suppliers.length;
            const totalParties = this.allParties.length;
            
            const activeCustomers = customers.filter(c => c.status === 'active').length;
            const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
            
            const totalCustomerBalance = customers.reduce((sum, c) => sum + (c.balance || 0), 0);
            const totalSupplierBalance = suppliers.reduce((sum, s) => sum + (s.balance || 0), 0);
            
            const reportHTML = `
                <div class="parties-report">
                    <div class="report-header">
                        <h3><i class="fas fa-users"></i> تقرير العملاء والموردين الشامل</h3>
                        <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-IQ')}</p>
                    </div>
                    
                    <div class="report-summary">
                        <div class="row">
                            <div class="col-md-3">
                                <div class="summary-item">
                                    <h4>${totalParties}</h4>
                                    <p>إجمالي العملاء والموردين</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="summary-item">
                                    <h4>${totalCustomers}</h4>
                                    <p>إجمالي العملاء</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="summary-item">
                                    <h4>${totalSuppliers}</h4>
                                    <p>إجمالي الموردين</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="summary-item">
                                    <h4>${activeCustomers + activeSuppliers}</h4>
                                    <p>النشطين</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="report-details">
                        <div class="row">
                            <div class="col-md-6">
                                <h4><i class="fas fa-user-tie"></i> تقرير العملاء</h4>
                                <div class="table-responsive">
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>الاسم</th>
                                                <th>الكود</th>
                                                <th>الرصيد</th>
                                                <th>حد الائتمان</th>
                                                <th>الحالة</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${customers.map(customer => `
                                                <tr>
                                                    <td>${customer.name}</td>
                                                    <td>${customer.code || '-'}</td>
                                                    <td>${this.formatCurrency(customer.balance || 0)}</td>
                                                    <td>${this.formatCurrency(customer.creditLimit || 0)}</td>
                                                    <td>
                                                        <span class="badge bg-${customer.status === 'active' ? 'success' : 'secondary'}">
                                                            ${customer.status === 'active' ? 'نشط' : 'معطل'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <h4><i class="fas fa-truck"></i> تقرير الموردين</h4>
                                <div class="table-responsive">
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>الاسم</th>
                                                <th>الكود</th>
                                                <th>الرصيد</th>
                                                <th>حد الائتمان</th>
                                                <th>الحالة</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${suppliers.map(supplier => `
                                                <tr>
                                                    <td>${supplier.name}</td>
                                                    <td>${supplier.code || '-'}</td>
                                                    <td>${this.formatCurrency(supplier.balance || 0)}</td>
                                                    <td>${this.formatCurrency(supplier.creditLimit || 0)}</td>
                                                    <td>
                                                        <span class="badge bg-${supplier.status === 'active' ? 'success' : 'secondary'}">
                                                            ${supplier.status === 'active' ? 'نشط' : 'معطل'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="report-summary mt-4">
                        <h4>ملخص الأرصدة</h4>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="balance-summary">
                                    <h5>أرصدة العملاء</h5>
                                    <p>إجمالي الأرصدة: <strong>${this.formatCurrency(totalCustomerBalance)}</strong></p>
                                    <p>متوسط الرصيد: <strong>${this.formatCurrency(totalCustomers > 0 ? totalCustomerBalance / totalCustomers : 0)}</strong></p>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="balance-summary">
                                    <h5>أرصدة الموردين</h5>
                                    <p>إجمالي الأرصدة: <strong>${this.formatCurrency(totalSupplierBalance)}</strong></p>
                                    <p>متوسط الرصيد: <strong>${this.formatCurrency(totalSuppliers > 0 ? totalSupplierBalance / totalSuppliers : 0)}</strong></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Show report in modal
            Swal.fire({
                title: 'تقرير العملاء والموردين',
                html: reportHTML,
                width: '95%',
                showCloseButton: true,
                showConfirmButton: false,
                customClass: {
                    popup: 'parties-report-popup'
                }
            });

            hideLoading();

        } catch (error) {
            console.error('Error generating parties report:', error);
            showError('فشل في توليد التقرير: ' + error.message);
            hideLoading();
        }
    },

    /**
     * Generate customer analysis report
     */
    async generateCustomerAnalysis() {
        try {
            showLoading();

            const customers = this.allParties.filter(p => p.type === 'customer' || p.type === 'both');
            
            // Analyze customers by balance ranges
            const highBalanceCustomers = customers.filter(c => (c.balance || 0) > 1000000);
            const mediumBalanceCustomers = customers.filter(c => (c.balance || 0) > 100000 && (c.balance || 0) <= 1000000);
            const lowBalanceCustomers = customers.filter(c => (c.balance || 0) <= 100000);
            
            // Analyze by credit limit
            const highCreditCustomers = customers.filter(c => (c.creditLimit || 0) > 5000000);
            const mediumCreditCustomers = customers.filter(c => (c.creditLimit || 0) > 1000000 && (c.creditLimit || 0) <= 5000000);
            const lowCreditCustomers = customers.filter(c => (c.creditLimit || 0) <= 1000000);

            const reportHTML = `
                <div class="customer-analysis-report">
                    <div class="report-header">
                        <h3><i class="fas fa-chart-pie"></i> تحليل العملاء</h3>
                        <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-IQ')}</p>
                    </div>
                    
                    <div class="analysis-sections">
                        <div class="row">
                            <div class="col-md-6">
                                <h4>توزيع العملاء حسب الرصيد</h4>
                                <div class="analysis-item">
                                    <div class="analysis-bar">
                                        <div class="bar-label">رصيد عالي (> 1,000,000)</div>
                                        <div class="bar-value">${highBalanceCustomers.length} عميل</div>
                                    </div>
                                    <div class="analysis-bar">
                                        <div class="bar-label">رصيد متوسط (100,000 - 1,000,000)</div>
                                        <div class="bar-value">${mediumBalanceCustomers.length} عميل</div>
                                    </div>
                                    <div class="analysis-bar">
                                        <div class="bar-label">رصيد منخفض (< 100,000)</div>
                                        <div class="bar-value">${lowBalanceCustomers.length} عميل</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <h4>توزيع العملاء حسب حد الائتمان</h4>
                                <div class="analysis-item">
                                    <div class="analysis-bar">
                                        <div class="bar-label">حد ائتمان عالي (> 5,000,000)</div>
                                        <div class="bar-value">${highCreditCustomers.length} عميل</div>
                                    </div>
                                    <div class="analysis-bar">
                                        <div class="bar-label">حد ائتمان متوسط (1,000,000 - 5,000,000)</div>
                                        <div class="bar-value">${mediumCreditCustomers.length} عميل</div>
                                    </div>
                                    <div class="analysis-bar">
                                        <div class="bar-label">حد ائتمان منخفض (< 1,000,000)</div>
                                        <div class="bar-value">${lowCreditCustomers.length} عميل</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row mt-4">
                            <div class="col-md-12">
                                <h4>أفضل العملاء حسب الرصيد</h4>
                                <div class="table-responsive">
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>الترتيب</th>
                                                <th>اسم العميل</th>
                                                <th>الكود</th>
                                                <th>الرصيد</th>
                                                <th>حد الائتمان</th>
                                                <th>نسبة الاستخدام</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${customers
                                                .sort((a, b) => (b.balance || 0) - (a.balance || 0))
                                                .slice(0, 10)
                                                .map((customer, index) => {
                                                    const usagePercentage = customer.creditLimit > 0 ? 
                                                        ((customer.balance || 0) / customer.creditLimit * 100).toFixed(1) : 0;
                                                    return `
                                                        <tr>
                                                            <td>${index + 1}</td>
                                                            <td>${customer.name}</td>
                                                            <td>${customer.code || '-'}</td>
                                                            <td>${this.formatCurrency(customer.balance || 0)}</td>
                                                            <td>${this.formatCurrency(customer.creditLimit || 0)}</td>
                                                            <td>
                                                                <span class="badge bg-${usagePercentage > 80 ? 'danger' : usagePercentage > 50 ? 'warning' : 'success'}">
                                                                    ${usagePercentage}%
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    `;
                                                }).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Show report in modal
            Swal.fire({
                title: 'تحليل العملاء',
                html: reportHTML,
                width: '95%',
                showCloseButton: true,
                showConfirmButton: false,
                customClass: {
                    popup: 'customer-analysis-popup'
                }
            });

            hideLoading();

        } catch (error) {
            console.error('Error generating customer analysis:', error);
            showError('فشل في توليد التحليل: ' + error.message);
            hideLoading();
        }
    },

    /**
     * Generate supplier analysis report
     */
    async generateSupplierAnalysis() {
        try {
            showLoading();

            const suppliers = this.allParties.filter(p => p.type === 'supplier' || p.type === 'both');
            
            // Analyze suppliers by balance ranges
            const highBalanceSuppliers = suppliers.filter(s => (s.balance || 0) > 1000000);
            const mediumBalanceSuppliers = suppliers.filter(s => (s.balance || 0) > 100000 && (s.balance || 0) <= 1000000);
            const lowBalanceSuppliers = suppliers.filter(s => (s.balance || 0) <= 100000);

            const reportHTML = `
                <div class="supplier-analysis-report">
                    <div class="report-header">
                        <h3><i class="fas fa-chart-bar"></i> تحليل الموردين</h3>
                        <p>تاريخ التقرير: ${new Date().toLocaleDateString('ar-IQ')}</p>
                    </div>
                    
                    <div class="analysis-sections">
                        <div class="row">
                            <div class="col-md-6">
                                <h4>توزيع الموردين حسب الرصيد</h4>
                                <div class="analysis-item">
                                    <div class="analysis-bar">
                                        <div class="bar-label">رصيد عالي (> 1,000,000)</div>
                                        <div class="bar-value">${highBalanceSuppliers.length} مورد</div>
                                    </div>
                                    <div class="analysis-bar">
                                        <div class="bar-label">رصيد متوسط (100,000 - 1,000,000)</div>
                                        <div class="bar-value">${mediumBalanceSuppliers.length} مورد</div>
                                    </div>
                                    <div class="analysis-bar">
                                        <div class="bar-label">رصيد منخفض (< 100,000)</div>
                                        <div class="bar-value">${lowBalanceSuppliers.length} مورد</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <h4>إحصائيات الموردين</h4>
                                <div class="stats-grid">
                                    <div class="stat-item">
                                        <h5>${suppliers.length}</h5>
                                        <p>إجمالي الموردين</p>
                                    </div>
                                    <div class="stat-item">
                                        <h5>${suppliers.filter(s => s.status === 'active').length}</h5>
                                        <p>الموردين النشطين</p>
                                    </div>
                                    <div class="stat-item">
                                        <h5>${this.formatCurrency(suppliers.reduce((sum, s) => sum + (s.balance || 0), 0))}</h5>
                                        <p>إجمالي الأرصدة</p>
                                    </div>
                                    <div class="stat-item">
                                        <h5>${this.formatCurrency(suppliers.reduce((sum, s) => sum + (s.creditLimit || 0), 0))}</h5>
                                        <p>إجمالي حدود الائتمان</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row mt-4">
                            <div class="col-md-12">
                                <h4>أكبر الموردين حسب الرصيد</h4>
                                <div class="table-responsive">
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>الترتيب</th>
                                                <th>اسم المورد</th>
                                                <th>الكود</th>
                                                <th>الرصيد</th>
                                                <th>حد الائتمان</th>
                                                <th>الحالة</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${suppliers
                                                .sort((a, b) => (b.balance || 0) - (a.balance || 0))
                                                .slice(0, 10)
                                                .map((supplier, index) => `
                                                    <tr>
                                                        <td>${index + 1}</td>
                                                        <td>${supplier.name}</td>
                                                        <td>${supplier.code || '-'}</td>
                                                        <td>${this.formatCurrency(supplier.balance || 0)}</td>
                                                        <td>${this.formatCurrency(supplier.creditLimit || 0)}</td>
                                                        <td>
                                                            <span class="badge bg-${supplier.status === 'active' ? 'success' : 'secondary'}">
                                                                ${supplier.status === 'active' ? 'نشط' : 'معطل'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Show report in modal
            Swal.fire({
                title: 'تحليل الموردين',
                html: reportHTML,
                width: '95%',
                showCloseButton: true,
                showConfirmButton: false,
                customClass: {
                    popup: 'supplier-analysis-popup'
                }
            });

            hideLoading();

        } catch (error) {
            console.error('Error generating supplier analysis:', error);
            showError('فشل في توليد التحليل: ' + error.message);
            hideLoading();
        }
    },

    /**
     * Load settings when settings tab is opened
     */
    async loadSettings() {
        try {
            console.log('⚙️ Loading parties settings...');
            
            // Load default accounts
            await this.loadDefaultAccounts();
            
            // Load general settings
            await this.loadGeneralSettings();
            
            console.log('✅ Settings loaded successfully');
            
        } catch (error) {
            console.error('Error loading settings:', error);
            showError('خطأ في تحميل الإعدادات');
        }
    },

    /**
     * Load default accounts for selection
     */
    async loadDefaultAccounts() {
        try {
            // Load customer accounts
            const customerAccounts = await this.loadAccountsForSelection('customer');
            const customerSelect = document.getElementById('defaultCustomerAccount');
            if (customerSelect) {
                customerSelect.innerHTML = '<option value="">-- اختر الحساب الرئيسي --</option>';
                customerAccounts.forEach(account => {
                    customerSelect.innerHTML += `
                        <option value="${account.id}">${account.code} - ${account.name}</option>
                    `;
                });
            }

            // Load supplier accounts
            const supplierAccounts = await this.loadAccountsForSelection('supplier');
            const supplierSelect = document.getElementById('defaultSupplierAccount');
            if (supplierSelect) {
                supplierSelect.innerHTML = '<option value="">-- اختر الحساب الرئيسي --</option>';
                supplierAccounts.forEach(account => {
                    supplierSelect.innerHTML += `
                        <option value="${account.id}">${account.code} - ${account.name}</option>
                    `;
                });
            }

            // Load saved settings
            const settings = await this.getSettings();
            if (settings.defaultCustomerAccount) {
                customerSelect.value = settings.defaultCustomerAccount;
            }
            if (settings.defaultSupplierAccount) {
                supplierSelect.value = settings.defaultSupplierAccount;
            }

        } catch (error) {
            console.error('Error loading default accounts:', error);
        }
    },

    /**
     * Load general settings
     */
    async loadGeneralSettings() {
        try {
            const settings = await this.getSettings();
            
            // Auto generate codes
            const autoGenerateCodes = document.getElementById('autoGenerateCodes');
            if (autoGenerateCodes) {
                autoGenerateCodes.checked = settings.autoGenerateCodes !== false;
            }

            // Default status
            const defaultStatus = document.getElementById('defaultPartyStatus');
            if (defaultStatus) {
                defaultStatus.value = settings.defaultPartyStatus || 'active';
            }

            // Default credit limit
            const defaultCreditLimit = document.getElementById('defaultCreditLimit');
            if (defaultCreditLimit) {
                defaultCreditLimit.value = settings.defaultCreditLimit || 0;
            }

        } catch (error) {
            console.error('Error loading general settings:', error);
        }
    },

    /**
     * Save default accounts settings
     */
    async saveDefaultAccounts() {
        try {
            const defaultCustomerAccount = document.getElementById('defaultCustomerAccount').value;
            const defaultSupplierAccount = document.getElementById('defaultSupplierAccount').value;

            const settings = await this.getSettings();
            settings.defaultCustomerAccount = defaultCustomerAccount;
            settings.defaultSupplierAccount = defaultSupplierAccount;

            await this.saveSettings(settings);
            showSuccess('تم حفظ إعدادات الحسابات الافتراضية بنجاح');

        } catch (error) {
            console.error('Error saving default accounts:', error);
            showError('خطأ في حفظ إعدادات الحسابات');
        }
    },

    /**
     * Save general settings
     */
    async saveGeneralSettings() {
        try {
            const autoGenerateCodes = document.getElementById('autoGenerateCodes').checked;
            const defaultPartyStatus = document.getElementById('defaultPartyStatus').value;
            const defaultCreditLimit = parseFloat(document.getElementById('defaultCreditLimit').value) || 0;

            const settings = await this.getSettings();
            settings.autoGenerateCodes = autoGenerateCodes;
            settings.defaultPartyStatus = defaultPartyStatus;
            settings.defaultCreditLimit = defaultCreditLimit;

            await this.saveSettings(settings);
            showSuccess('تم حفظ الإعدادات العامة بنجاح');

        } catch (error) {
            console.error('Error saving general settings:', error);
            showError('خطأ في حفظ الإعدادات العامة');
        }
    },

    /**
     * Get settings from database
     */
    async getSettings() {
        try {
            const doc = await db.collection('partiesSettings').doc('default').get();
            if (doc.exists) {
                return doc.data();
            }
            return {
                defaultCustomerAccount: '',
                defaultSupplierAccount: '',
                autoGenerateCodes: true,
                defaultPartyStatus: 'active',
                defaultCreditLimit: 0
            };
        } catch (error) {
            console.error('Error getting settings:', error);
            return {
                defaultCustomerAccount: '',
                defaultSupplierAccount: '',
                autoGenerateCodes: true,
                defaultPartyStatus: 'active',
                defaultCreditLimit: 0
            };
        }
    },

    /**
     * Save settings to database
     */
    async saveSettings(settings) {
        try {
            await db.collection('partiesSettings').doc('default').set({
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
                const defaultSettings = {
                    defaultCustomerAccount: '',
                    defaultSupplierAccount: '',
                    autoGenerateCodes: true,
                    defaultPartyStatus: 'active',
                    defaultCreditLimit: 0
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
            link.download = 'parties-settings.json';
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
            
            // Test default customer account
            if (settings.defaultCustomerAccount) {
                const account = await this.getAccountName(settings.defaultCustomerAccount);
                testResults.push(`✅ الحساب الافتراضي للعملاء: ${account}`);
            } else {
                testResults.push('⚠️ لم يتم تحديد الحساب الافتراضي للعملاء');
            }

            // Test default supplier account
            if (settings.defaultSupplierAccount) {
                const account = await this.getAccountName(settings.defaultSupplierAccount);
                testResults.push(`✅ الحساب الافتراضي للموردين: ${account}`);
            } else {
                testResults.push('⚠️ لم يتم تحديد الحساب الافتراضي للموردين');
            }

            // Test general settings
            testResults.push(`✅ توليد الأكواد تلقائياً: ${settings.autoGenerateCodes ? 'مفعل' : 'معطل'}`);
            testResults.push(`✅ الحالة الافتراضية: ${settings.defaultPartyStatus === 'active' ? 'نشط' : 'معطل'}`);
            testResults.push(`✅ حد الائتمان الافتراضي: ${this.formatCurrency(settings.defaultCreditLimit)}`);

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

    // ========== CUSTOMER GROUPS MANAGEMENT ==========

    /**
     * Load customer groups
     */
    async loadPartyGroups() {
        try {
            console.log('📋 Loading party groups...');
            
            const snapshot = await db.collection('partyGroups').orderBy('name', 'asc').get();
            this.partyGroups = [];
            
            snapshot.forEach(doc => {
                this.partyGroups.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`✅ Loaded ${this.partyGroups.length} party groups`);
            this.renderGroupsTable();
            this.updateGroupsStats();
            
        } catch (error) {
            console.error('Error loading party groups:', error);
            showError('فشل في تحميل المجموعات');
        }
    },

    /**
     * Render customer groups table
     */
    renderGroupsTable() {
        const tbody = document.getElementById('groupsTableBody');
        if (!tbody) {
            console.warn('⚠️ Groups table body not found');
            return;
        }

        if (this.partyGroups.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted">
                        <div class="empty-state">
                            <i class="fas fa-layer-group fa-3x text-muted mb-3"></i>
                            <h5>لا توجد مجموعات عملاء</h5>
                            <p>قم بإنشاء مجموعة جديدة لتنظيم العملاء</p>
                            <button class="btn btn-primary" onclick="PartiesModule.addPartyGroup()">
                                <i class="fas fa-plus"></i> إضافة مجموعة جديدة
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.partyGroups.map(group => {
            const partiesCount = this.getPartiesInGroup(group.id);
            const createdDate = group.createdAt ? new Date(group.createdAt.seconds * 1000).toLocaleDateString('ar') : '-';
            
            return `
                <tr>
                    <td>${group.code || '-'}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="color-indicator me-2" style="background-color: ${group.color || '#3498db'}; width: 16px; height: 16px; border-radius: 50%;"></div>
                            <strong>${group.name}</strong>
                        </div>
                    </td>
                    <td>${group.description || '-'}</td>
                    <td>
                        <span class="badge bg-info">${partiesCount}</span>
                    </td>
                    <td>
                        <div class="color-preview" style="background-color: ${group.color || '#3498db'}; width: 24px; height: 24px; border-radius: 4px; border: 1px solid #ddd;"></div>
                    </td>
                    <td>
                        <span class="badge bg-${group.status === 'active' ? 'success' : 'secondary'}">
                            ${group.status === 'active' ? 'نشط' : 'معطل'}
                        </span>
                    </td>
                    <td>${createdDate}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="PartiesModule.editPartyGroup('${group.id}')" title="تعديل">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-success" onclick="PartiesModule.viewGroupParties('${group.id}')" title="عرض الأطراف">
                                <i class="fas fa-users"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="PartiesModule.deletePartyGroup('${group.id}')" title="حذف">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    },

    /**
     * Update groups statistics
     */
    updateGroupsStats() {
        const totalGroups = this.partyGroups.length;
        const activeGroups = this.partyGroups.filter(g => g.status === 'active').length;
        const totalPartiesInGroups = this.allParties.filter(p => p.groupId).length;
        const avgGroupSize = totalGroups > 0 ? Math.round(totalPartiesInGroups / totalGroups) : 0;

        // Update stats using DOMUtils if available
        if (window.DOMUtils) {
            const updates = {
                'totalGroupsCount': totalGroups.toString(),
                'activeGroupsCount': activeGroups.toString(),
                'groupedPartiesCount': totalPartiesInGroups.toString(),
                'avgGroupSizeCount': avgGroupSize.toString()
            };
            window.DOMUtils.batchUpdateText(updates);
        } else {
            // Fallback
            const elements = {
                totalGroupsCount: totalGroups,
                activeGroupsCount: activeGroups,
                groupedPartiesCount: totalPartiesInGroups,
                avgGroupSizeCount: avgGroupSize
            };
            
            Object.entries(elements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) element.textContent = value;
            });
        }
    },

    /**
     * Get customer count for a specific group
     */
    getPartiesInGroup(groupId) {
        return this.allParties.filter(p => p.groupId === groupId).length;
    },

    /**
     * Add new party group
     */
    addPartyGroup() {
        this.editingGroup = null;
        this.showPartyGroupModal();
    },

    /**
     * Edit party group
     */
    editPartyGroup(groupId) {
        const group = this.partyGroups.find(g => g.id === groupId);
        if (!group) {
            showError('المجموعة غير موجودة');
            return;
        }
        
        this.editingGroup = group;
        this.showPartyGroupModal(group);
    },

    /**
     * Show party group modal
     */
    async showPartyGroupModal(group = null) {
        const isEdit = !!group;
        const title = isEdit ? 'تعديل مجموعة الأطراف' : 'إضافة مجموعة أطراف جديدة';
        
        const result = await Swal.fire({
            title: title,
            html: `
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">كود المجموعة</label>
                            <input type="text" id="groupCode" class="form-control" 
                                   value="${group?.code || this.generateGroupCode()}" 
                                   placeholder="GRP-0001" ${isEdit ? 'readonly' : ''}>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">اسم المجموعة *</label>
                            <input type="text" id="groupName" class="form-control" 
                                   value="${group?.name || ''}" 
                                   placeholder="اسم المجموعة" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">الوصف</label>
                            <textarea id="groupDescription" class="form-control" rows="3"
                                      placeholder="وصف المجموعة">${group?.description || ''}</textarea>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">لون المجموعة</label>
                            <input type="color" id="groupColor" class="form-control form-control-color" 
                                   value="${group?.color || '#3498db'}">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">الحالة</label>
                            <select id="groupStatus" class="form-select">
                                <option value="active" ${!group || group.status === 'active' ? 'selected' : ''}>نشط</option>
                                <option value="inactive" ${group?.status === 'inactive' ? 'selected' : ''}>معطل</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">ملاحظات</label>
                            <textarea id="groupNotes" class="form-control" rows="3"
                                      placeholder="ملاحظات إضافية">${group?.notes || ''}</textarea>
                        </div>
                    </div>
                </div>
            `,
            width: '800px',
            showCancelButton: true,
            confirmButtonText: isEdit ? 'تحديث' : 'إضافة',
            cancelButtonText: 'إلغاء',
            preConfirm: () => {
                const code = document.getElementById('groupCode').value.trim();
                const name = document.getElementById('groupName').value.trim();
                const description = document.getElementById('groupDescription').value.trim();
                const color = document.getElementById('groupColor').value;
                const status = document.getElementById('groupStatus').value;
                const notes = document.getElementById('groupNotes').value.trim();

                if (!name) {
                    Swal.showValidationMessage('اسم المجموعة مطلوب');
                    return false;
                }

                return {
                    code,
                    name,
                    description,
                    color,
                    status,
                    notes
                };
            }
        });

        if (result.isConfirmed) {
                await this.savePartyGroup(result.value);
        }
    },

    /**
     * Generate group code
     */
    generateGroupCode() {
        const existingCodes = this.partyGroups.map(g => g.code).filter(code => code);
        let nextNumber = 1;
        
        while (existingCodes.includes(`GRP-${String(nextNumber).padStart(4, '0')}`)) {
            nextNumber++;
        }
        
        return `GRP-${String(nextNumber).padStart(4, '0')}`;
    },

    /**
     * Save party group
     */
    async savePartyGroup(data) {
        try {
            showLoading();
            
            if (this.editingGroup) {
                // تحديث مجموعة موجودة
                
                // فحص عدم تكرار اسم المجموعة (استثناء المجموعة الحالية)
                const duplicateName = this.partyGroups.find(g => 
                    g.name.toLowerCase().trim() === data.name.toLowerCase().trim() && 
                    g.id !== this.editingGroup.id
                );
                
                if (duplicateName) {
                    hideLoading();
                    showError(`❌ اسم المجموعة "${data.name}" مستخدم مسبقاً!\n\n🔍 موجود تحت الكود: ${duplicateName.code}\n\n💡 يرجى استخدام اسم مختلف للمجموعة.`);
                    return;
                }
                
                // فحص عدم تكرار كود المجموعة (استثناء المجموعة الحالية)
                const duplicateCode = this.partyGroups.find(g => 
                    g.code.toLowerCase().trim() === data.code.toLowerCase().trim() && 
                    g.id !== this.editingGroup.id
                );
                
                if (duplicateCode) {
                    hideLoading();
                    showError(`❌ كود المجموعة "${data.code}" مستخدم مسبقاً!\n\n🔍 موجود للمجموعة: ${duplicateCode.name}\n\n💡 يرجى استخدام كود مختلف.`);
                    return;
                }
                
                await db.collection('partyGroups').doc(this.editingGroup.id).update({
                    ...data,
                    updatedAt: new Date()
                });
                showSuccess('تم تحديث المجموعة بنجاح');
            } else {
                // إضافة مجموعة جديدة
                
                // 🔍 فحص عدم تكرار اسم المجموعة
                const duplicateName = this.partyGroups.find(g => 
                    g.name.toLowerCase().trim() === data.name.toLowerCase().trim()
                );
                
                if (duplicateName) {
                    hideLoading();
                    showError(`❌ اسم المجموعة "${data.name}" مستخدم مسبقاً!\n\n🔍 موجود تحت الكود: ${duplicateName.code}\n\n💡 أسماء المجموعات يجب أن تكون فريدة لتجنب الالتباس في التصنيف.\nيرجى استخدام اسم مختلف للمجموعة.`);
                    return;
                }
                
                // 🔍 فحص عدم تكرار كود المجموعة
                const duplicateCode = this.partyGroups.find(g => 
                    g.code.toLowerCase().trim() === data.code.toLowerCase().trim()
                );
                
                if (duplicateCode) {
                    hideLoading();
                    showError(`❌ كود المجموعة "${data.code}" مستخدم مسبقاً!\n\n🔍 موجود للمجموعة: ${duplicateCode.name}\n\n💡 يرجى توليد كود جديد أو استخدام كود مختلف.`);
                    return;
                }
                
                // إضافة المجموعة الجديدة
                await db.collection('partyGroups').add({
                    ...data,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                showSuccess('تم إضافة المجموعة بنجاح');
            }
            
            await this.loadPartyGroups();
            
        } catch (error) {
            console.error('Error saving party group:', error);
            showError('حدث خطأ أثناء الحفظ');
        } finally {
            hideLoading();
        }
    },

    /**
     * Delete party group
     */
    async deletePartyGroup(groupId) {
        const group = this.partyGroups.find(g => g.id === groupId);
        if (!group) {
            showError('المجموعة غير موجودة');
            return;
        }

        // Check if group has customers
        const partiesCount = this.getPartiesInGroup(groupId);
        
        let confirmMessage = `هل أنت متأكد من حذف مجموعة "${group.name}"؟`;
        if (partiesCount > 0) {
            confirmMessage += `\n\nتحتوي هذه المجموعة على ${partiesCount} طرف. سيتم إلغاء تصنيف هؤلاء الأطراف.`;
        }

        const result = await Swal.fire({
            title: 'تأكيد الحذف',
            text: confirmMessage,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء'
        });

        if (result.isConfirmed) {
            try {
                showLoading();
                
                // Remove group reference from customers
                if (customersCount > 0) {
                    const customersToUpdate = this.allParties.filter(p => 
                        p.type === 'customer' && p.groupId === groupId
                    );
                    
                    for (const customer of customersToUpdate) {
                        await db.collection('parties').doc(customer.id).update({
                            groupId: null,
                            updatedAt: new Date()
                        });
                    }
                }
                
                // Delete the group
                await db.collection('partyGroups').doc(groupId).delete();
                
                showSuccess('تم حذف المجموعة بنجاح');
                await this.loadPartyGroups();
                await this.loadAllParties(); // Refresh parties data
                
            } catch (error) {
                console.error('Error deleting customer group:', error);
                showError('حدث خطأ أثناء الحذف');
            } finally {
                hideLoading();
            }
        }
    },

    /**
     * View parties in group
     */
    async viewGroupParties(groupId) {
        const group = this.partyGroups.find(g => g.id === groupId);
        if (!group) {
            showError('المجموعة غير موجودة');
            return;
        }

        const partiesInGroup = this.allParties.filter(p => 
            p.groupId === groupId
        );

        if (partiesInGroup.length === 0) {
            Swal.fire({
                title: `مجموعة "${group.name}"`,
                text: 'لا توجد أطراف في هذه المجموعة حالياً',
                icon: 'info'
            });
            return;
        }

        const partiesHTML = partiesInGroup.map(party => `
            <tr>
                <td>${customer.code || '-'}</td>
                <td>${customer.name}</td>
                <td>${customer.phone || '-'}</td>
                <td>${this.formatCurrency(customer.balance || 0)}</td>
                <td>
                    <span class="badge bg-${customer.status === 'active' ? 'success' : 'secondary'}">
                        ${customer.status === 'active' ? 'نشط' : 'معطل'}
                    </span>
                </td>
            </tr>
        `).join('');

        Swal.fire({
            title: `عملاء مجموعة "${group.name}"`,
            html: `
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>الكود</th>
                                <th>الاسم</th>
                                <th>الهاتف</th>
                                <th>الرصيد</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${partiesHTML}
                        </tbody>
                    </table>
                </div>
                <div class="mt-3">
                    <strong>إجمالي الأطراف: ${partiesInGroup.length}</strong>
                </div>
            `,
            width: '800px',
            showCloseButton: true,
            showConfirmButton: false
        });
    },

    /**
     * Filter customer groups
     */
    filterGroups() {
        const searchTerm = document.getElementById('groupSearch').value.toLowerCase();
        
        if (!searchTerm) {
            this.renderGroupsTable();
            return;
        }

        const filteredGroups = this.partyGroups.filter(group => 
            group.name.toLowerCase().includes(searchTerm) ||
            group.code.toLowerCase().includes(searchTerm) ||
            (group.description && group.description.toLowerCase().includes(searchTerm))
        );

        // Temporarily store current groups and render filtered
        const originalGroups = this.partyGroups;
        this.partyGroups = filteredGroups;
        this.renderGroupsTable();
        this.partyGroups = originalGroups;
    },


    /**
     * Generate party code based on selected group and type
     */
    async generatePartyCode(type) {
        const groupSelect = document.getElementById('partyGroupId');
        const codeInput = document.getElementById('partyCode');
        
        if (!groupSelect || !codeInput) return;
        
        const selectedGroupId = groupSelect.value;
        if (!selectedGroupId) {
            codeInput.value = '';
            return;
        }
        
        try {
            // Find the selected group
            const selectedGroup = this.partyGroups.find(g => g.id === selectedGroupId);
            if (!selectedGroup) return;
            
            // Get the group's code prefix (e.g., "GRP-0001" becomes "GRP")
            const groupPrefix = selectedGroup.code.includes('-') ? 
                selectedGroup.code.split('-')[0] : selectedGroup.code;
            
            // Get next party number for this group and type
            const partyNumber = await this.getNextPartyNumber(selectedGroupId, type);
            
            // Generate code: GroupPrefix-C001 or GroupPrefix-S001
            const typePrefix = type === 'customer' ? 'C' : 'S';
            const partyCode = `${selectedGroup.code}-${typePrefix}-${partyNumber.toString().padStart(3, '0')}`;
            
            codeInput.value = partyCode;
            
            console.log(`✅ Generated ${type} code: ${partyCode} for group: ${selectedGroup.name}`);
            
        } catch (error) {
            console.error('Error generating customer code:', error);
            // Fallback to simple sequential code
            const fallbackCode = `${type === 'customer' ? 'CUS' : 'SUP'}-${Date.now().toString().slice(-6)}`;
            codeInput.value = fallbackCode;
        }
    },

    /**
     * Get next customer number for a specific group
     */
    async getNextPartyNumber(groupId, type) {
        try {
            // Get all parties for this group and type
            const partiesInGroup = this.allParties.filter(p => 
                p.groupId === groupId && p.type === type
            );
            
            // Find the highest number for this type
            let maxNumber = 0;
            partiesInGroup.forEach(party => {
                if (party.code && party.code.includes(`-${type === 'customer' ? 'C' : 'S'}-`)) {
                    const parts = party.code.split('-');
                    const number = parseInt(parts[parts.length - 1]);
                    if (!isNaN(number) && number > maxNumber) {
                        maxNumber = number;
                    }
                }
            });
            
            return maxNumber + 1;
            
        } catch (error) {
            console.error('Error getting next party number:', error);
            return 1;
        }
    },






    /**
     * Edit supplier group
     */



    /**
     * Generate supplier group code
     */
    generateSupplierGroupCode() {
        const lastCode = this.supplierGroups
            .filter(g => g.code && g.code.startsWith('SUP-'))
            .map(g => parseInt(g.code.split('-')[1]))
            .filter(num => !isNaN(num))
            .sort((a, b) => b - a)[0] || 0;
        
        return `SUP-${String(lastCode + 1).padStart(4, '0')}`;
    },

    /**
     * Delete supplier group
     */
    async deleteSupplierGroup(groupId) {
        const group = this.supplierGroups.find(g => g.id === groupId);
        if (!group) return;

        // Check if group has suppliers
        const suppliersInGroup = this.getSuppliersInGroup(groupId);
        
        let confirmText = `هل أنت متأكد من حذف مجموعة "${group.name}"؟`;
        if (suppliersInGroup > 0) {
            confirmText += `\n\nتحتوي هذه المجموعة على ${suppliersInGroup} موردين. سيتم إلغاء ربطهم بالمجموعة.`;
        }

        const result = await Swal.fire({
            title: 'تأكيد الحذف',
            text: confirmText,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء',
            confirmButtonColor: '#dc3545'
        });

        if (result.isConfirmed) {
            try {
                showLoading();

                // Unlink suppliers from this group
                const suppliersToUpdate = this.allParties.filter(p => 
                    (p.type === 'supplier' || p.type === 'both') && p.groupId === groupId
                );

                const batch = db.batch();
                suppliersToUpdate.forEach(supplier => {
                    const supplierRef = db.collection('parties').doc(supplier.id);
                    batch.update(supplierRef, { groupId: null });
                });

                // Delete the group
                batch.delete(db.collection('supplierGroups').doc(groupId));
                
                await batch.commit();

                showSuccess('تم حذف المجموعة بنجاح');
                
                // Reload data
                await this.loadAllParties();
                await this.loadSupplierGroups();

                hideLoading();
            } catch (error) {
                console.error('Error deleting supplier group:', error);
                hideLoading();
                showError('حدث خطأ أثناء حذف المجموعة');
            }
        }
    },

    /**
     * View group suppliers
     */
    async viewGroupSuppliers(groupId) {
        const group = this.supplierGroups.find(g => g.id === groupId);
        if (!group) return;

        const suppliersInGroup = this.allParties.filter(p => 
            (p.type === 'supplier' || p.type === 'both') && p.groupId === groupId
        );

        let suppliersHtml = '';
        if (suppliersInGroup.length === 0) {
            suppliersHtml = '<p class="text-muted text-center">لا يوجد موردين في هذه المجموعة</p>';
        } else {
            suppliersHtml = `
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>الكود</th>
                                <th>الاسم</th>
                                <th>الهاتف</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${suppliersInGroup.map(supplier => `
                                <tr>
                                    <td><code>${supplier.code}</code></td>
                                    <td>${supplier.name}</td>
                                    <td>${supplier.phone || '-'}</td>
                                    <td>
                                        <span class="badge ${supplier.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                                            ${supplier.status === 'active' ? 'نشط' : 'معطل'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        Swal.fire({
            title: `موردين مجموعة "${group.name}"`,
            html: suppliersHtml,
            confirmButtonText: 'إغلاق',
            customClass: {
                popup: 'swal-wide'
            }
        });
    },

    /**
     * Filter supplier groups
     */
    filterSupplierGroups() {
        const searchTerm = document.getElementById('supplierGroupSearch')?.value?.toLowerCase() || '';
        
        if (!searchTerm) {
            this.renderSupplierGroupsTable();
            return;
        }

        const filteredGroups = this.supplierGroups.filter(group => 
            group.name.toLowerCase().includes(searchTerm) ||
            (group.code && group.code.toLowerCase().includes(searchTerm)) ||
            (group.description && group.description.toLowerCase().includes(searchTerm))
        );

        // Temporarily store original groups and render filtered
        const originalGroups = this.supplierGroups;
        this.supplierGroups = filteredGroups;
        this.renderSupplierGroupsTable();
        this.supplierGroups = originalGroups;
    },

    /**
     * Load supplier groups for select dropdown
     */
    async loadSupplierGroupsForSelect() {
        try {
            if (!this.supplierGroups || this.supplierGroups.length === 0) {
                const snapshot = await db.collection('supplierGroups').where('status', '==', 'active').get();
                this.supplierGroups = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
            }

            const activeGroups = this.supplierGroups.filter(g => g.status === 'active');
            let options = activeGroups.map(group => {
                const isSelected = this.editingParty && this.editingParty.groupId === group.id;
                return `<option value="${group.id}" ${isSelected ? 'selected' : ''}>${group.name}</option>`;
            }).join('');

            return options;
        } catch (error) {
            console.error('Error loading supplier groups for select:', error);
            return '';
        }
    },

    /**
     * Generate supplier code based on group
     */
    async generateSupplierCode() {
        const groupSelect = document.getElementById('partyGroupId');
        const codeInput = document.getElementById('partyCode');
        
        if (!groupSelect || !codeInput) return;
        
        const groupId = groupSelect.value;
        if (!groupId) {
            codeInput.value = '';
            return;
        }

        try {
            const group = this.supplierGroups.find(g => g.id === groupId);
            if (!group) {
                codeInput.value = '';
                return;
            }

            const nextNumber = await this.getNextSupplierNumber(groupId);
            const supplierCode = `${group.code}-${String(nextNumber).padStart(3, '0')}`;
            codeInput.value = supplierCode;
        } catch (error) {
            console.error('Error generating supplier code:', error);
        }
    },

    /**
     * Get next supplier number for group
     */
    async getNextSupplierNumber(groupId) {
        try {
            const group = this.supplierGroups.find(g => g.id === groupId);
            if (!group) return 1;

            const prefix = group.code;
            const suppliersInGroup = this.allParties.filter(p => 
                (p.type === 'supplier' || p.type === 'both') && 
                p.groupId === groupId && 
                p.code && 
                p.code.startsWith(prefix)
            );

            const existingNumbers = suppliersInGroup
                .map(s => s.code.split('-').pop())
                .map(num => parseInt(num))
                .filter(num => !isNaN(num))
                .sort((a, b) => a - b);

            // Find first gap or return next number
            for (let i = 1; i <= existingNumbers.length + 1; i++) {
                if (!existingNumbers.includes(i)) {
                    return i;
                }
            }

            return existingNumbers.length + 1;
        } catch (error) {
            console.error('Error getting next supplier number:', error);
            return 1;
        }
    },

    /**
     * Get supplier group name and color by ID
     */
    getSupplierGroupName(groupId) {
        if (!groupId || !this.supplierGroups) return null;
        
        const group = this.supplierGroups.find(g => g.id === groupId);
        return group ? {
            name: group.name,
            color: group.color || '#fd7e14'
        } : null;
    },

    /**
     * Get customer group name and color by ID
     */
    getPartyGroupName(groupId) {
        if (!groupId || !this.partyGroups) return null;
        
        const group = this.partyGroups.find(g => g.id === groupId);
        return group ? {
            name: group.name,
            color: group.color || '#6c757d'
        } : null;
    },

    /**
     * Load customer groups for select dropdown
     */
    async loadPartyGroupsForSelect() {
        try {
            // Load groups if not already loaded
            if (!this.partyGroups || this.partyGroups.length === 0) {
                await this.loadPartyGroups();
            }
            
            return this.partyGroups
                .filter(group => group.status === 'active')
                .map(group => `<option value="${group.id}">${group.name}</option>`)
                .join('');
                
        } catch (error) {
            console.error('Error loading party groups for select:', error);
            return '';
        }
    },

    /**
     * Create sub-account for party
     */
    async createSubAccount(parentAccountId, partyName, partyCode, partyType = null, partyCurrency = null, partyNature = null) {
        try {
            console.log(`🏗️ Starting sub-account creation process...`);
            console.log(`📋 Party Name: ${partyName}`);
            console.log(`📋 Party Code: ${partyCode}`);
            console.log(`📋 Parent Account ID: ${parentAccountId}`);
            console.log(`📋 Party Type: ${partyType || 'unknown'}`);
            console.log(`💰 Party Currency: ${partyCurrency || 'not specified'}`);
            console.log(`📊 Party Nature: ${partyNature || 'not specified'}`);
            
            // Get parent account details
            await ChartOfAccountsModule.getAccounts();
            const parentAccount = ChartOfAccountsModule.getAccountById(parentAccountId);
            if (!parentAccount) {
                throw new Error('الحساب الرئيسي غير موجود');
            }
            console.log(`📊 Parent Account Found: ${parentAccount.code} - ${parentAccount.name}`);
            
            // ✅ تحديد العملة: أولوية لبطاقة العميل/المورد، ثم الحساب الرئيسي، ثم الافتراضي
            const finalCurrency = partyCurrency || parentAccount.currency || 'IQD';
            
            // ✅ تحديد الطبيعة: أولوية لبطاقة العميل/المورد، ثم الحساب الرئيسي
            // للعملاء: دائماً مدين (debit)، للموردين: دائماً دائن (credit)
            let finalNature = partyNature;
            if (!finalNature) {
                if (partyType === 'customer') {
                    finalNature = 'debit'; // العملاء دائماً مدينين
                } else if (partyType === 'supplier') {
                    finalNature = 'credit'; // الموردين دائماً دائنين
                } else {
                    finalNature = parentAccount.nature || 'debit'; // من الحساب الرئيسي
                }
            }
            
            // Generate sub-account code
            const subAccountCode = `${parentAccount.code}.${partyCode}`;
            console.log(`🔢 Generated Sub-Account Code: ${subAccountCode}`);
            
            // 🔍 فحص عدم تكرار كود الحساب الفرعي
            const existingCodeSnapshot = await db.collection('chartOfAccounts')
                .where('code', '==', subAccountCode)
                .get();
            
            if (!existingCodeSnapshot.empty) {
                console.log('⚠️ Sub-account code already exists:', subAccountCode);
                throw new Error(`كود الحساب الفرعي "${subAccountCode}" موجود مسبقاً في شجرة الحسابات`);
            }
            
            // 🔍 فحص عدم تكرار اسم الحساب الفرعي  
            const existingNameSnapshot = await db.collection('chartOfAccounts')
                .where('name', '==', partyName)
                .get();
            
            if (!existingNameSnapshot.empty) {
                const existingAccount = existingNameSnapshot.docs[0].data();
                console.log('⚠️ Sub-account name already exists:', partyName);
                throw new Error(`اسم الحساب "${partyName}" موجود مسبقاً في شجرة الحسابات تحت الكود: ${existingAccount.code}\n\nهذا سيسبب تضارب في النظام المحاسبي. يرجى استخدام اسم مختلف للعميل/المورد.`);
            }
            
            // Create new sub-account in chartOfAccounts
            const subAccountData = {
                code: subAccountCode,
                name: partyName,
                type: parentAccount.type,
                category: parentAccount.category || 'assets', // Default category
                nature: finalNature, // ✅ استخدام الطبيعة من بطاقة العميل/المورد
                currency: finalCurrency, // ✅ استخدام العملة من بطاقة العميل/المورد
                parentId: parentAccountId,
                level: (parentAccount.level || 1) + 1,
                balance: 0,
                debit: 0,
                credit: 0,
                isActive: true,
                isParent: false,
                isLeafAccount: true, // Force as leaf account
                canHaveChildren: false, // Cannot have sub-accounts
                isCustomerAccount: partyType === 'customer', // Mark as customer account
                isSupplierAccount: partyType === 'supplier', // Mark as supplier account
                isSystemProtected: true, // Protected from structure changes
                allowTypeChange: false, // Cannot change from leaf to parent
                description: `حساب فرعي لـ ${partyName} (${partyType === 'customer' ? 'عميل' : partyType === 'supplier' ? 'مورد' : 'غير محدد'}) - ${finalCurrency} - ${finalNature === 'debit' ? 'مدين' : 'دائن'} - حساب نهائي محمي`,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: 'system'
            };
            
            console.log(`💰 Final Currency: ${finalCurrency}`);
            console.log(`📊 Final Nature: ${finalNature}`);
            
            console.log(`💾 Creating sub-account with data:`, subAccountData);
            
            const docRef = await db.collection('chartOfAccounts').add(subAccountData);
            console.log('✅ Successfully created sub-account:', subAccountCode);
            console.log('✅ Document ID:', docRef.id);
            
            // ❌ REMOVED DUPLICATE SAVE - الحساب يُحفظ مرة واحدة فقط في chartOfAccounts
            // إزالة الحفظ المكرر في accounts collection لمنع التكرار
            
            return docRef.id;
            
        } catch (error) {
            console.error('❌ Error creating sub-account:', error);
            console.error('❌ Error details:', error.message);
            throw error;
        }
    },

    /**
     * Setup real-time sync for parties module
     */
    setupPartiesSync() {
        // Sync parties
        if (typeof SyncManager !== 'undefined') {
            SyncManager.onCollectionSync('parties', (data, syncType) => {
                this.allParties = data;
                this.renderPartiesTable();
                this.updateDashboard();
                this.updateSummary();
                console.log(`🔄 Parties updated via ${syncType} sync`);
            });
        }

        // Also listen to custom events
        window.addEventListener('dataSync', (event) => {
            const { collection, data } = event.detail;
            if (collection === 'parties') {
                this.allParties = data;
                this.renderPartiesTable();
                this.updateDashboard();
                this.updateSummary();
            }
        });
    }
};

console.log('✅ Parties module loaded');
