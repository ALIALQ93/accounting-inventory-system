/**
 * Reports Module - Complete Reports Management
 * @module modules/reports
 */

const ReportsModule = {
    // Data storage
    currentTab: 'dashboard',
    reports: [],
    currentReport: null,
    reportData: {},

    getHTML() {
        return `
            <div class="reports-module">
                <!-- Header -->
                <div class="module-header">
                    <div class="header-content">
                        <div class="header-title">
                            <i class="fas fa-chart-line"></i>
                            <h2>إدارة التقارير</h2>
                        </div>
                        <div class="header-actions">
                            <button class="btn btn-primary" id="generateReportBtn">
                                <i class="fas fa-plus"></i> توليد تقرير
                            </button>
                            <button class="btn btn-success" id="exportReportBtn">
                                <i class="fas fa-download"></i> تصدير
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Navigation Tabs -->
                <ul class="nav nav-tabs" id="reportsTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="dashboard-tab" data-bs-toggle="tab" data-bs-target="#dashboard" type="button" role="tab">
                            <i class="fas fa-tachometer-alt"></i> لوحة التحكم
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="financial-tab" data-bs-toggle="tab" data-bs-target="#financial" type="button" role="tab">
                            <i class="fas fa-calculator"></i> التقارير المالية
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="inventory-tab" data-bs-toggle="tab" data-bs-target="#inventory" type="button" role="tab">
                            <i class="fas fa-boxes"></i> تقارير المخزون
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="sales-tab" data-bs-toggle="tab" data-bs-target="#sales" type="button" role="tab">
                            <i class="fas fa-shopping-cart"></i> تقارير المبيعات
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="custom-tab" data-bs-toggle="tab" data-bs-target="#custom" type="button" role="tab">
                            <i class="fas fa-cog"></i> تقارير مخصصة
                        </button>
                    </li>
                </ul>

                <!-- Tab Content -->
                <div class="tab-content" id="reportsTabContent">
                    <!-- Dashboard Tab -->
                    <div class="tab-pane fade show active" id="dashboard" role="tabpanel">
                        <div class="dashboard-content">
                            <!-- Summary Cards -->
                            <div class="row mb-4">
                                <div class="col-md-3">
                                    <div class="summary-card">
                                        <div class="card-icon">
                                            <i class="fas fa-file-alt text-primary"></i>
                                        </div>
                                        <div class="card-content">
                                            <h3 id="totalReports">0</h3>
                                            <p>إجمالي التقارير</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="summary-card">
                                        <div class="card-icon">
                                            <i class="fas fa-chart-line text-success"></i>
                                        </div>
                                        <div class="card-content">
                                            <h3 id="financialReports">0</h3>
                                            <p>التقارير المالية</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="summary-card">
                                        <div class="card-icon">
                                            <i class="fas fa-boxes text-warning"></i>
                                        </div>
                                        <div class="card-content">
                                            <h3 id="inventoryReports">0</h3>
                                            <p>تقارير المخزون</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="summary-card">
                                        <div class="card-icon">
                                            <i class="fas fa-shopping-cart text-info"></i>
                                        </div>
                                        <div class="card-content">
                                            <h3 id="salesReports">0</h3>
                                            <p>تقارير المبيعات</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Recent Reports -->
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-clock"></i> آخر التقارير</h5>
                                </div>
                                <div class="card-body">
                                    <div class="table-responsive">
                                        <table class="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>اسم التقرير</th>
                                                    <th>النوع</th>
                                                    <th>التاريخ</th>
                                                    <th>الحالة</th>
                                                    <th>الإجراءات</th>
                                                </tr>
                                            </thead>
                                            <tbody id="recentReportsTable">
                                                <tr>
                                                    <td colspan="5" class="text-center text-muted">لا توجد تقارير</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Financial Reports Tab -->
                    <div class="tab-pane fade" id="financial" role="tabpanel">
                        <div class="financial-reports-content">
                            <!-- Report Filters -->
                            <div class="row mb-3">
                                <div class="col-md-3">
                                    <input type="date" class="form-control" id="financialDateFrom" placeholder="من تاريخ">
                                </div>
                                <div class="col-md-3">
                                    <input type="date" class="form-control" id="financialDateTo" placeholder="إلى تاريخ">
                                </div>
                                <div class="col-md-3">
                                    <select class="form-select" id="financialReportType">
                                        <option value="income_statement">قائمة الدخل</option>
                                        <option value="balance_sheet">الميزانية العمومية</option>
                                        <option value="cash_flow">قائمة التدفق النقدي</option>
                                        <option value="trial_balance">ميزان المراجعة</option>
                                        <option value="general_ledger">دفتر الأستاذ</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <button class="btn btn-primary" id="generateFinancialReport">
                                        <i class="fas fa-chart-line"></i> توليد التقرير
                                    </button>
                                </div>
                            </div>

                            <!-- Financial Reports Grid -->
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <div class="card report-card" onclick="ReportsModule.generateReport('income_statement')">
                                        <div class="card-body text-center">
                                            <i class="fas fa-chart-line fa-3x text-success mb-3"></i>
                                            <h5>قائمة الدخل</h5>
                                            <p class="text-muted">تقرير الإيرادات والمصروفات</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="card report-card" onclick="ReportsModule.generateReport('balance_sheet')">
                                        <div class="card-body text-center">
                                            <i class="fas fa-balance-scale fa-3x text-primary mb-3"></i>
                                            <h5>الميزانية العمومية</h5>
                                            <p class="text-muted">تقرير الأصول والخصوم</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="card report-card" onclick="ReportsModule.generateReport('cash_flow')">
                                        <div class="card-body text-center">
                                            <i class="fas fa-money-bill-wave fa-3x text-warning mb-3"></i>
                                            <h5>قائمة التدفق النقدي</h5>
                                            <p class="text-muted">تقرير التدفقات النقدية</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="card report-card" onclick="ReportsModule.generateReport('trial_balance')">
                                        <div class="card-body text-center">
                                            <i class="fas fa-balance-scale fa-3x text-secondary mb-3"></i>
                                            <h5>ميزان المراجعة</h5>
                                            <p class="text-muted">أرصدة جميع الحسابات</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="card report-card" onclick="ReportsModule.generateReport('general_ledger')">
                                        <div class="card-body text-center">
                                            <i class="fas fa-book fa-3x text-info mb-3"></i>
                                            <h5>دفتر الأستاذ</h5>
                                            <p class="text-muted">جميع الحسابات وحركاتها</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Inventory Reports Tab -->
                    <div class="tab-pane fade" id="inventory" role="tabpanel">
                        <div class="inventory-reports-content">
                            <!-- Report Filters -->
                            <div class="row mb-3">
                                <div class="col-md-3">
                                    <input type="date" class="form-control" id="inventoryDateFrom" placeholder="من تاريخ">
                                </div>
                                <div class="col-md-3">
                                    <input type="date" class="form-control" id="inventoryDateTo" placeholder="إلى تاريخ">
                                </div>
                                <div class="col-md-3">
                                    <select class="form-select" id="inventoryReportType">
                                        <option value="stock_status">حالة المخزون</option>
                                        <option value="stock_movement">حركة المخزون</option>
                                        <option value="low_stock">منتجات منخفضة</option>
                                        <option value="expired_products">منتجات منتهية</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <button class="btn btn-primary" id="generateInventoryReport">
                                        <i class="fas fa-boxes"></i> توليد التقرير
                                    </button>
                                </div>
                            </div>

                            <!-- Inventory Reports Grid -->
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <div class="card report-card" onclick="ReportsModule.generateReport('stock_status')">
                                        <div class="card-body text-center">
                                            <i class="fas fa-boxes fa-3x text-info mb-3"></i>
                                            <h5>حالة المخزون</h5>
                                            <p class="text-muted">تقرير حالة المنتجات</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="card report-card" onclick="ReportsModule.generateReport('stock_movement')">
                                        <div class="card-body text-center">
                                            <i class="fas fa-exchange-alt fa-3x text-warning mb-3"></i>
                                            <h5>حركة المخزون</h5>
                                            <p class="text-muted">تقرير حركة المنتجات</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="card report-card" onclick="ReportsModule.generateReport('low_stock')">
                                        <div class="card-body text-center">
                                            <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                                            <h5>منتجات منخفضة</h5>
                                            <p class="text-muted">تقرير المنتجات المنخفضة</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sales Reports Tab -->
                    <div class="tab-pane fade" id="sales" role="tabpanel">
                        <div class="sales-reports-content">
                            <!-- Report Filters -->
                            <div class="row mb-3">
                                <div class="col-md-3">
                                    <input type="date" class="form-control" id="salesDateFrom" placeholder="من تاريخ">
                                </div>
                                <div class="col-md-3">
                                    <input type="date" class="form-control" id="salesDateTo" placeholder="إلى تاريخ">
                                </div>
                                <div class="col-md-3">
                                    <select class="form-select" id="salesReportType">
                                        <option value="sales_summary">ملخص المبيعات</option>
                                        <option value="sales_by_product">المبيعات حسب المنتج</option>
                                        <option value="sales_by_customer">المبيعات حسب العميل</option>
                                        <option value="sales_trends">اتجاهات المبيعات</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <button class="btn btn-primary" id="generateSalesReport">
                                        <i class="fas fa-shopping-cart"></i> توليد التقرير
                                    </button>
                                </div>
                            </div>

                            <!-- Sales Reports Grid -->
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <div class="card report-card" onclick="ReportsModule.generateReport('sales_summary')">
                                        <div class="card-body text-center">
                                            <i class="fas fa-chart-bar fa-3x text-success mb-3"></i>
                                            <h5>ملخص المبيعات</h5>
                                            <p class="text-muted">تقرير إجمالي المبيعات</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="card report-card" onclick="ReportsModule.generateReport('sales_by_product')">
                                        <div class="card-body text-center">
                                            <i class="fas fa-box fa-3x text-primary mb-3"></i>
                                            <h5>المبيعات حسب المنتج</h5>
                                            <p class="text-muted">تقرير مبيعات المنتجات</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <div class="card report-card" onclick="ReportsModule.generateReport('sales_by_customer')">
                                        <div class="card-body text-center">
                                            <i class="fas fa-users fa-3x text-info mb-3"></i>
                                            <h5>المبيعات حسب العميل</h5>
                                            <p class="text-muted">تقرير مبيعات العملاء</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Custom Reports Tab -->
                    <div class="tab-pane fade" id="custom" role="tabpanel">
                        <div class="custom-reports-content">
                            <!-- Custom Report Builder -->
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-cog"></i> منشئ التقارير المخصصة</h5>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">اسم التقرير</label>
                                                <input type="text" class="form-control" id="customReportName" placeholder="أدخل اسم التقرير">
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">نوع التقرير</label>
                                                <select class="form-select" id="customReportType">
                                                    <option value="table">جدول</option>
                                                    <option value="chart">رسم بياني</option>
                                                    <option value="summary">ملخص</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <label class="form-label">من تاريخ</label>
                                                <input type="date" class="form-control" id="customDateFrom">
                                            </div>
                                            <div class="mb-3">
                                                <label class="form-label">إلى تاريخ</label>
                                                <input type="date" class="form-control" id="customDateTo">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row">
                                        <div class="col-12">
                                            <button class="btn btn-primary" id="createCustomReport">
                                                <i class="fas fa-plus"></i> إنشاء التقرير
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Report Viewer Modal -->
                <div class="modal fade" id="reportViewerModal" tabindex="-1">
                    <div class="modal-dialog modal-xl">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="reportViewerTitle">عرض التقرير</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div id="reportContent">
                                    <div class="text-center text-muted">
                                        <i class="fas fa-chart-line fa-3x mb-3"></i>
                                        <p>جاري تحميل التقرير...</p>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                                <button type="button" class="btn btn-primary" id="printReportBtn">
                                    <i class="fas fa-print"></i> طباعة
                                </button>
                                <button type="button" class="btn btn-success" id="exportReportBtn">
                                    <i class="fas fa-download"></i> تصدير
                                </button>
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
        console.log('📊 Loading reports module...');
        this.render();
        await this.loadData();
        console.log('✅ Reports module loaded');
    },

    async loadData() {
        try {
            await this.loadReports();
            this.updateDashboard();
        } catch (error) {
            console.error('Error loading reports data:', error);
        }
    },

    async loadReports() {
        try {
            const snapshot = await db.collection('reports').get();
            this.reports = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.renderRecentReports();
        } catch (error) {
            console.error('Error loading reports:', error);
        }
    },

    updateDashboard() {
        document.getElementById('totalReports').textContent = this.reports.length;
        
        const financialReports = this.reports.filter(r => r.category === 'financial').length;
        const inventoryReports = this.reports.filter(r => r.category === 'inventory').length;
        const salesReports = this.reports.filter(r => r.category === 'sales').length;
        
        document.getElementById('financialReports').textContent = financialReports;
        document.getElementById('inventoryReports').textContent = inventoryReports;
        document.getElementById('salesReports').textContent = salesReports;
    },

    renderRecentReports() {
        const tbody = document.getElementById('recentReportsTable');
        if (!tbody) return;

        const recentReports = this.reports.slice(0, 5);
        
        if (recentReports.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">لا توجد تقارير</td></tr>';
            return;
        }

        tbody.innerHTML = recentReports.map(report => {
            const statusClass = report.status === 'completed' ? 'success' : 'warning';
            const statusText = report.status === 'completed' ? 'مكتمل' : 'قيد التجهيز';
            
            return `
                <tr>
                    <td>${report.name || 'N/A'}</td>
                    <td><span class="badge bg-secondary">${this.getReportCategoryName(report.category)}</span></td>
                    <td>${new Date(report.createdAt).toLocaleDateString('ar-SA')}</td>
                    <td><span class="badge bg-${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="ReportsModule.viewReport('${report.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="ReportsModule.editReport('${report.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    getReportCategoryName(category) {
        const categories = {
            'financial': 'مالي',
            'inventory': 'مخزون',
            'sales': 'مبيعات',
            'custom': 'مخصص'
        };
        return categories[category] || category;
    },

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('#reportsTabs button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.currentTab = e.target.getAttribute('data-bs-target').replace('#', '');
            });
        });

        // Report generation buttons
        const generateFinancialReport = document.getElementById('generateFinancialReport');
        if (generateFinancialReport) {
            generateFinancialReport.addEventListener('click', () => {
                const reportType = document.getElementById('financialReportType').value;
                this.generateReport(reportType);
            });
        }

        const generateInventoryReport = document.getElementById('generateInventoryReport');
        if (generateInventoryReport) {
            generateInventoryReport.addEventListener('click', () => {
                const reportType = document.getElementById('inventoryReportType').value;
                this.generateReport(reportType);
            });
        }

        const generateSalesReport = document.getElementById('generateSalesReport');
        if (generateSalesReport) {
            generateSalesReport.addEventListener('click', () => {
                const reportType = document.getElementById('salesReportType').value;
                this.generateReport(reportType);
            });
        }

        const createCustomReport = document.getElementById('createCustomReport');
        if (createCustomReport) {
            createCustomReport.addEventListener('click', () => {
                this.createCustomReport();
            });
        }

        // Report viewer buttons
        const printReportBtn = document.getElementById('printReportBtn');
        if (printReportBtn) {
            printReportBtn.addEventListener('click', () => {
                this.printReport();
            });
        }

        const exportReportBtn = document.getElementById('exportReportBtn');
        if (exportReportBtn) {
            exportReportBtn.addEventListener('click', () => {
                this.exportReport();
            });
        }
    },

    async generateReport(reportType) {
        try {
            // Show loading
            const reportContent = document.getElementById('reportContent');
            if (reportContent) {
                reportContent.innerHTML = `
                    <div class="text-center text-muted">
                        <i class="fas fa-spinner fa-spin fa-3x mb-3"></i>
                        <p>جاري توليد التقرير...</p>
                    </div>
                `;
            }

            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('reportViewerModal'));
            modal.show();

            // Generate report based on type
            switch(reportType) {
                case 'income_statement':
                    await this.generateIncomeStatement();
                    break;
                case 'balance_sheet':
                    await this.generateBalanceSheet();
                    break;
                case 'cash_flow':
                    await this.generateCashFlow();
                    break;
                case 'trial_balance':
                    await this.generateTrialBalance();
                    break;
                case 'general_ledger':
                    await this.generateGeneralLedger();
                    break;
                case 'stock_status':
                    await this.generateStockStatus();
                    break;
                case 'stock_movement':
                    await this.generateStockMovement();
                    break;
                case 'low_stock':
                    await this.generateLowStock();
                    break;
                case 'expired_products':
                    await this.generateExpiredProducts();
                    break;
                case 'sales_summary':
                    await this.generateSalesSummary();
                    break;
                case 'sales_by_product':
                    await this.generateSalesByProduct();
                    break;
                case 'sales_by_customer':
                    await this.generateSalesByCustomer();
                    break;
                case 'sales_trends':
                    await this.generateSalesTrends();
                    break;
                default:
                    this.showReportError('نوع التقرير غير مدعوم');
            }

            // Update modal title
            document.getElementById('reportViewerTitle').textContent = this.getReportTitle(reportType);

        } catch (error) {
            console.error('Error generating report:', error);
            this.showReportError('حدث خطأ في توليد التقرير');
        }
    },

    async generateIncomeStatement() {
        const reportContent = document.getElementById('reportContent');
        
        try {
            // Load data
            const sales = await this.loadSalesData();
            const purchases = await this.loadPurchasesData();
            
            let totalRevenue = 0;
            let totalExpenses = 0;

            sales.forEach(sale => {
                totalRevenue += sale.total || 0;
            });

            purchases.forEach(purchase => {
                totalExpenses += purchase.total || 0;
            });

            const netProfit = totalRevenue - totalExpenses;

            reportContent.innerHTML = `
                <div class="report-header text-center mb-4">
                    <h4>قائمة الدخل</h4>
                    <p>للفترة المنتهية في ${new Date().toLocaleDateString('ar-SA')}</p>
                </div>
                <table class="table table-bordered">
                    <tbody>
                        <tr><td><strong>الإيرادات:</strong></td><td></td></tr>
                        <tr><td class="ps-4">إيرادات المبيعات</td><td>${totalRevenue.toLocaleString()}</td></tr>
                        <tr class="table-primary"><td><strong>إجمالي الإيرادات</strong></td><td><strong>${totalRevenue.toLocaleString()}</strong></td></tr>
                        <tr><td><strong>المصروفات:</strong></td><td></td></tr>
                        <tr><td class="ps-4">تكلفة المبيعات والمصروفات</td><td>${totalExpenses.toLocaleString()}</td></tr>
                        <tr class="table-primary"><td><strong>إجمالي المصروفات</strong></td><td><strong>${totalExpenses.toLocaleString()}</strong></td></tr>
                        <tr class="${netProfit >= 0 ? 'table-success' : 'table-danger'}">
                            <td><strong>صافي ${netProfit >= 0 ? 'الربح' : 'الخسارة'}</strong></td>
                            <td><strong>${Math.abs(netProfit).toLocaleString()}</strong></td>
                        </tr>
                    </tbody>
                </table>
            `;
        } catch (error) {
            this.showReportError('خطأ في توليد قائمة الدخل');
        }
    },

    async generateBalanceSheet() {
        const reportContent = document.getElementById('reportContent');
        reportContent.innerHTML = '<div class="alert alert-info">تقرير الميزانية العمومية قيد التطوير</div>';
    },

    async generateCashFlow() {
        const reportContent = document.getElementById('reportContent');
        reportContent.innerHTML = '<div class="alert alert-info">تقرير التدفق النقدي قيد التطوير</div>';
    },

    async generateTrialBalance() {
        const reportContent = document.getElementById('reportContent');
        reportContent.innerHTML = '<div class="alert alert-info">ميزان المراجعة قيد التطوير</div>';
    },

    async generateGeneralLedger() {
        const reportContent = document.getElementById('reportContent');
        
        try {
            // عرض واجهة دفتر الأستاذ المتقدم
            this.renderAdvancedGeneralLedgerInterface(reportContent);
            
            // تحميل البيانات الأولية
            await this.loadGeneralLedgerInitialData();
            
        } catch (error) {
            console.error('Error generating general ledger:', error);
            this.showReportError('خطأ في توليد دفتر الأستاذ: ' + error.message);
        }
    },

    renderAdvancedGeneralLedgerInterface(container) {
        container.innerHTML = `
            <div class="advanced-ledger-container">
                <!-- Header -->
                <div class="ledger-header mb-3">
                    <h4 class="mb-0">
                        <i class="fas fa-book"></i> دفتر الأستاذ المتقدم
                    </h4>
                    <div class="ledger-actions">
                        <button class="btn btn-sm btn-primary" id="applyLedgerFilter">
                            <i class="fas fa-filter"></i> تطبيق الفلتر
                        </button>
                        <button class="btn btn-sm btn-secondary" id="resetLedgerFilter">
                            <i class="fas fa-redo"></i> إعادة تعيين
                        </button>
                        <button class="btn btn-sm btn-success" id="exportLedgerPDF">
                            <i class="fas fa-file-pdf"></i> PDF
                        </button>
                        <button class="btn btn-sm btn-info" id="exportLedgerExcel">
                            <i class="fas fa-file-excel"></i> Excel
                        </button>
                        <button class="btn btn-sm btn-dark" id="printLedger">
                            <i class="fas fa-print"></i> طباعة
                        </button>
                    </div>
                </div>

                <div class="row g-3">
                    <!-- Left Panel - Date and Period -->
                    <div class="col-md-3">
                        <div class="card">
                            <div class="card-header bg-light">
                                <h6 class="mb-0"><i class="fas fa-calendar"></i> التاريخ والفترة</h6>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <label class="form-label d-flex align-items-center">
                                        <input type="checkbox" class="form-check-input me-2" id="ledgerDateFromCheck" checked>
                                        من تاريخ
                                    </label>
                                    <input type="date" class="form-control form-control-sm" id="ledgerDateFrom" value="${new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]}">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label d-flex align-items-center">
                                        <input type="checkbox" class="form-check-input me-2" id="ledgerDateToCheck" checked>
                                        إلى تاريخ
                                    </label>
                                    <input type="date" class="form-control form-control-sm" id="ledgerDateTo" value="${new Date().toISOString().split('T')[0]}">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">الفترة</label>
                                    <select class="form-select form-select-sm" id="ledgerPeriod">
                                        <option value="">بدون</option>
                                        <option value="month">شهري</option>
                                        <option value="quarter">ربع سنوي</option>
                                        <option value="year">سنوي</option>
                                    </select>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="showOpeningBalance" checked>
                                    <label class="form-check-label" for="showOpeningBalance">
                                        إظهار الرصيد السابق
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Panel - Advanced Filters -->
                    <div class="col-md-9">
                        <div class="card">
                            <div class="card-header">
                                <ul class="nav nav-tabs card-header-tabs" id="ledgerFilterTabs" role="tablist">
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link active" id="search-tab" data-bs-toggle="tab" data-bs-target="#search-options" type="button" role="tab">
                                            <i class="fas fa-search"></i> خيارات البحث
                                        </button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="sources-tab" data-bs-toggle="tab" data-bs-target="#sources-options" type="button" role="tab">
                                            <i class="fas fa-file-invoice"></i> المصادر
                                        </button>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <button class="nav-link" id="advanced-tab" data-bs-toggle="tab" data-bs-target="#advanced-options" type="button" role="tab">
                                            <i class="fas fa-cog"></i> خيارات متقدمة
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div class="card-body">
                                <div class="tab-content" id="ledgerFilterTabContent">
                                    <!-- Search Options Tab -->
                                    <div class="tab-pane fade show active" id="search-options" role="tabpanel">
                                        <div class="row g-3">
                                            <div class="col-md-6">
                                                <label class="form-label">الحساب</label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control form-control-sm" id="ledgerAccountSearch" placeholder="ابحث عن الحساب..." readonly>
                                                    <input type="hidden" id="ledgerAccountId">
                                                    <button class="btn btn-outline-secondary btn-sm" type="button" id="openAccountPicker">
                                                        <i class="fas fa-search"></i>
                                                    </button>
                                                    <button class="btn btn-outline-danger btn-sm" type="button" id="clearAccountFilter" style="display:none;">
                                                        <i class="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label">الحساب المقابل</label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control form-control-sm" id="ledgerCounterAccountSearch" placeholder="ابحث عن الحساب المقابل..." readonly>
                                                    <input type="hidden" id="ledgerCounterAccountId">
                                                    <button class="btn btn-outline-secondary btn-sm" type="button" id="openCounterAccountPicker">
                                                        <i class="fas fa-search"></i>
                                                    </button>
                                                    <button class="btn btn-outline-danger btn-sm" type="button" id="clearCounterAccountFilter" style="display:none;">
                                                        <i class="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label">مركز الكلفة</label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control form-control-sm" id="ledgerCostCenterSearch" placeholder="ابحث عن مركز الكلفة..." readonly>
                                                    <input type="hidden" id="ledgerCostCenterId">
                                                    <button class="btn btn-outline-secondary btn-sm" type="button" id="openCostCenterPicker">
                                                        <i class="fas fa-search"></i>
                                                    </button>
                                                    <button class="btn btn-outline-danger btn-sm" type="button" id="clearCostCenterFilter" style="display:none;">
                                                        <i class="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label">العملة</label>
                                                <select class="form-select form-select-sm" id="ledgerCurrency">
                                                    <option value="">جميع العملات</option>
                                                </select>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label">المستخدم</label>
                                                <select class="form-select form-select-sm" id="ledgerUser">
                                                    <option value="">جميع المستخدمين</option>
                                                </select>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label">رقم السند</label>
                                                <input type="text" class="form-control form-control-sm" id="ledgerVoucherNo" placeholder="ابحث عن رقم السند...">
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Sources Options Tab -->
                                    <div class="tab-pane fade" id="sources-options" role="tabpanel">
                                        <div class="row">
                                            <div class="col-md-6">
                                                <h6 class="mb-3">أنواع الحركات</h6>
                                                <div class="form-check">
                                                    <input class="form-check-input ledger-source-filter" type="checkbox" value="sale" id="sourceSale" checked>
                                                    <label class="form-check-label" for="sourceSale">مبيعات</label>
                                                </div>
                                                <div class="form-check">
                                                    <input class="form-check-input ledger-source-filter" type="checkbox" value="purchase" id="sourcePurchase" checked>
                                                    <label class="form-check-label" for="sourcePurchase">مشتريات</label>
                                                </div>
                                                <div class="form-check">
                                                    <input class="form-check-input ledger-source-filter" type="checkbox" value="sale_return" id="sourceSaleReturn" checked>
                                                    <label class="form-check-label" for="sourceSaleReturn">مرتجعات مبيعات</label>
                                                </div>
                                                <div class="form-check">
                                                    <input class="form-check-input ledger-source-filter" type="checkbox" value="purchase_return" id="sourcePurchaseReturn" checked>
                                                    <label class="form-check-label" for="sourcePurchaseReturn">مرتجعات مشتريات</label>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <h6 class="mb-3">أنواع السندات</h6>
                                                <div class="form-check">
                                                    <input class="form-check-input ledger-source-filter" type="checkbox" value="receipt" id="sourceReceipt" checked>
                                                    <label class="form-check-label" for="sourceReceipt">سند قبض</label>
                                                </div>
                                                <div class="form-check">
                                                    <input class="form-check-input ledger-source-filter" type="checkbox" value="payment" id="sourcePayment" checked>
                                                    <label class="form-check-label" for="sourcePayment">سند صرف</label>
                                                </div>
                                                <div class="form-check">
                                                    <input class="form-check-input ledger-source-filter" type="checkbox" value="journal" id="sourceJournal" checked>
                                                    <label class="form-check-label" for="sourceJournal">سند يومية</label>
                                                </div>
                                                <div class="form-check">
                                                    <input class="form-check-input ledger-source-filter" type="checkbox" value="entry" id="sourceEntry" checked>
                                                    <label class="form-check-label" for="sourceEntry">سند قيد</label>
                                                </div>
                                                <div class="form-check">
                                                    <input class="form-check-input ledger-source-filter" type="checkbox" value="general" id="sourceGeneral" checked>
                                                    <label class="form-check-label" for="sourceGeneral">قيد عام</label>
                                                </div>
                                                <div class="mt-2">
                                                    <button class="btn btn-sm btn-outline-primary" id="selectAllSources">تحديد الكل</button>
                                                    <button class="btn btn-sm btn-outline-secondary" id="deselectAllSources">إلغاء التحديد</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Advanced Options Tab -->
                                    <div class="tab-pane fade" id="advanced-options" role="tabpanel">
                                        <div class="row g-3">
                                            <div class="col-md-6">
                                                <label class="form-label">فلترة حسب المبلغ</label>
                                                <div class="input-group input-group-sm">
                                                    <select class="form-select" id="ledgerAmountFilterType">
                                                        <option value="">بدون</option>
                                                        <option value="greater">أكبر من</option>
                                                        <option value="less">أقل من</option>
                                                        <option value="between">بين</option>
                                                    </select>
                                                    <input type="number" class="form-control" id="ledgerAmountFrom" placeholder="من" step="0.01">
                                                    <input type="number" class="form-control" id="ledgerAmountTo" placeholder="إلى" step="0.01" style="display:none;">
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label">خيارات العرض</label>
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="showAccountsWithoutTransactions">
                                                    <label class="form-check-label" for="showAccountsWithoutTransactions">
                                                        إظهار الحسابات بدون حركات
                                                    </label>
                                                </div>
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" id="groupByParentAccount" checked>
                                                    <label class="form-check-label" for="groupByParentAccount">
                                                        تجميع حسب الحساب الرئيسي
                                                    </label>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label">ترتيب حسب</label>
                                                <select class="form-select form-select-sm" id="ledgerSortBy">
                                                    <option value="code">الكود</option>
                                                    <option value="name">الاسم</option>
                                                    <option value="balance">الرصيد</option>
                                                    <option value="transactions">عدد الحركات</option>
                                                </select>
                                            </div>
                                            <div class="col-md-6">
                                                <label class="form-label">اتجاه الترتيب</label>
                                                <select class="form-select form-select-sm" id="ledgerSortOrder">
                                                    <option value="asc">تصاعدي</option>
                                                    <option value="desc">تنازلي</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Summary Cards -->
                <div class="row g-3 mt-3" id="ledgerSummaryCards" style="display:none;">
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h5 class="card-title text-primary" id="ledgerAccountsCount">0</h5>
                                <p class="card-text text-muted mb-0">عدد الحسابات</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h5 class="card-title text-success" id="ledgerTransactionsCount">0</h5>
                                <p class="card-text text-muted mb-0">عدد الحركات</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h5 class="card-title text-info" id="ledgerTotalDebit">0</h5>
                                <p class="card-text text-muted mb-0">إجمالي المدين</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card text-center">
                            <div class="card-body">
                                <h5 class="card-title text-warning" id="ledgerTotalCredit">0</h5>
                                <p class="card-text text-muted mb-0">إجمالي الدائن</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Results Area -->
                <div id="ledgerResults" class="mt-4"></div>
            </div>
        `;

        // إعداد Event Listeners
        this.setupGeneralLedgerEventListeners();
    },

    async loadGeneralLedgerInitialData() {
        try {
            // تحميل العملات
            const currenciesSnapshot = await db.collection('currencies').get();
            const currencySelect = document.getElementById('ledgerCurrency');
            if (currencySelect) {
                currenciesSnapshot.forEach(doc => {
                    const currency = doc.data();
                    const option = document.createElement('option');
                    option.value = currency.code;
                    option.textContent = `${currency.code} - ${currency.name || currency.code}`;
                    currencySelect.appendChild(option);
                });
            }

            // تحميل المستخدمين
            const usersSnapshot = await db.collection('USERS').get();
            const userSelect = document.getElementById('ledgerUser');
            if (userSelect) {
                usersSnapshot.forEach(doc => {
                    const user = doc.data();
                    const option = document.createElement('option');
                    option.value = doc.id;
                    option.textContent = user.name || user.email || doc.id;
                    userSelect.appendChild(option);
                });
            }

            // إعداد فلترة المبلغ
            const amountFilterType = document.getElementById('ledgerAmountFilterType');
            if (amountFilterType) {
                amountFilterType.addEventListener('change', (e) => {
                    const amountTo = document.getElementById('ledgerAmountTo');
                    if (e.target.value === 'between') {
                        amountTo.style.display = 'block';
                    } else {
                        amountTo.style.display = 'none';
                    }
                });
            }

            // تطبيق الفلتر تلقائياً عند التحميل
            setTimeout(() => {
                this.applyGeneralLedgerFilter();
            }, 500);

        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    },

    setupGeneralLedgerEventListeners() {
        // تطبيق الفلتر
        const applyBtn = document.getElementById('applyLedgerFilter');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applyGeneralLedgerFilter());
        }

        // إعادة تعيين
        const resetBtn = document.getElementById('resetLedgerFilter');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetGeneralLedgerFilter());
        }

        // تحديد/إلغاء تحديد جميع المصادر
        const selectAllBtn = document.getElementById('selectAllSources');
        const deselectAllBtn = document.getElementById('deselectAllSources');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                document.querySelectorAll('.ledger-source-filter').forEach(cb => cb.checked = true);
            });
        }
        if (deselectAllBtn) {
            deselectAllBtn.addEventListener('click', () => {
                document.querySelectorAll('.ledger-source-filter').forEach(cb => cb.checked = false);
            });
        }

        // فتح منتقي الحسابات
        const accountPickerBtn = document.getElementById('openAccountPicker');
        if (accountPickerBtn) {
            accountPickerBtn.addEventListener('click', () => this.openAccountPicker('ledgerAccountId', 'ledgerAccountSearch'));
        }

        const counterAccountPickerBtn = document.getElementById('openCounterAccountPicker');
        if (counterAccountPickerBtn) {
            counterAccountPickerBtn.addEventListener('click', () => this.openAccountPicker('ledgerCounterAccountId', 'ledgerCounterAccountSearch'));
        }

        // فتح منتقي مراكز الكلفة
        const costCenterPickerBtn = document.getElementById('openCostCenterPicker');
        if (costCenterPickerBtn) {
            costCenterPickerBtn.addEventListener('click', () => this.openCostCenterPicker());
        }

        // مسح الفلترات
        const clearAccountBtn = document.getElementById('clearAccountFilter');
        if (clearAccountBtn) {
            clearAccountBtn.addEventListener('click', () => {
                document.getElementById('ledgerAccountId').value = '';
                document.getElementById('ledgerAccountSearch').value = '';
                clearAccountBtn.style.display = 'none';
            });
        }

        const clearCounterAccountBtn = document.getElementById('clearCounterAccountFilter');
        if (clearCounterAccountBtn) {
            clearCounterAccountBtn.addEventListener('click', () => {
                document.getElementById('ledgerCounterAccountId').value = '';
                document.getElementById('ledgerCounterAccountSearch').value = '';
                clearCounterAccountBtn.style.display = 'none';
            });
        }

        const clearCostCenterBtn = document.getElementById('clearCostCenterFilter');
        if (clearCostCenterBtn) {
            clearCostCenterBtn.addEventListener('click', () => {
                document.getElementById('ledgerCostCenterId').value = '';
                document.getElementById('ledgerCostCenterSearch').value = '';
                clearCostCenterBtn.style.display = 'none';
            });
        }

        // التصدير والطباعة
        const exportPDFBtn = document.getElementById('exportLedgerPDF');
        if (exportPDFBtn) {
            exportPDFBtn.addEventListener('click', () => this.exportLedgerToPDF());
        }

        const exportExcelBtn = document.getElementById('exportLedgerExcel');
        if (exportExcelBtn) {
            exportExcelBtn.addEventListener('click', () => this.exportLedgerToExcel());
        }

        const printBtn = document.getElementById('printLedger');
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printLedger());
        }
    },

    async applyGeneralLedgerFilter() {
        const resultsArea = document.getElementById('ledgerResults');
        if (!resultsArea) return;

        try {
            resultsArea.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-spinner fa-spin fa-3x mb-3"></i>
                    <p>جاري تحميل البيانات...</p>
                </div>
            `;

            // تحميل البيانات
            const [accounts, generalEntries] = await Promise.all([
                this.loadAccountsData(),
                this.loadGeneralEntriesData()
            ]);

            // حساب الرصيد الافتتاحي إذا كان مطلوباً
            let openingBalances = {};
            if (document.getElementById('showOpeningBalance')?.checked) {
                openingBalances = await this.calculateOpeningBalances(accounts);
            }

            // تجميع الحركات حسب الحساب
            const ledgerData = this.groupEntriesByAccount(accounts, generalEntries, openingBalances);

            // تطبيق فلترة المبلغ
            const amountFilterType = document.getElementById('ledgerAmountFilterType')?.value;
            const amountFrom = parseFloat(document.getElementById('ledgerAmountFrom')?.value) || 0;
            const amountTo = parseFloat(document.getElementById('ledgerAmountTo')?.value) || 0;

            if (amountFilterType) {
                Object.keys(ledgerData).forEach(accountId => {
                    const accountData = ledgerData[accountId];
                    const totalAmount = Math.max(accountData.totalDebit, accountData.totalCredit);
                    
                    let shouldFilter = false;
                    if (amountFilterType === 'greater' && totalAmount <= amountFrom) shouldFilter = true;
                    if (amountFilterType === 'less' && totalAmount >= amountFrom) shouldFilter = true;
                    if (amountFilterType === 'between' && (totalAmount < amountFrom || totalAmount > amountTo)) shouldFilter = true;
                    
                    if (shouldFilter && accountData.transactions.length === 0) {
                        delete ledgerData[accountId];
                    }
                });
            }

            // عرض النتائج
            this.renderAdvancedGeneralLedger(ledgerData);

            // تحديث الملخص
            this.updateLedgerSummary(ledgerData);

        } catch (error) {
            console.error('Error applying filter:', error);
            resultsArea.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    خطأ في تحميل البيانات: ${error.message}
                </div>
            `;
        }
    },

    async calculateOpeningBalances(accounts) {
        const openingBalances = {};
        const dateFrom = document.getElementById('ledgerDateFrom')?.value;
        
        if (!dateFrom || !document.getElementById('showOpeningBalance')?.checked) {
            return openingBalances;
        }

        try {
            const fromDate = new Date(dateFrom);
            const snapshot = await db.collection('generalEntries')
                .where('status', '==', 'posted')
                .where('date', '<', fromDate)
                .get();

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.entries && Array.isArray(data.entries)) {
                    data.entries.forEach(entry => {
                        const accountId = entry.accountId;
                        if (!openingBalances[accountId]) {
                            openingBalances[accountId] = { debit: 0, credit: 0 };
                        }
                        openingBalances[accountId].debit += parseFloat(entry.debit) || 0;
                        openingBalances[accountId].credit += parseFloat(entry.credit) || 0;
                    });
                }
            });

            return openingBalances;
        } catch (error) {
            console.error('Error calculating opening balances:', error);
            return openingBalances;
        }
    },

    resetGeneralLedgerFilter() {
        // إعادة تعيين جميع الحقول
        document.getElementById('ledgerDateFrom')?.value && (document.getElementById('ledgerDateFrom').value = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
        document.getElementById('ledgerDateTo')?.value && (document.getElementById('ledgerDateTo').value = new Date().toISOString().split('T')[0]);
        document.getElementById('ledgerDateFromCheck') && (document.getElementById('ledgerDateFromCheck').checked = true);
        document.getElementById('ledgerDateToCheck') && (document.getElementById('ledgerDateToCheck').checked = true);
        document.getElementById('ledgerPeriod') && (document.getElementById('ledgerPeriod').value = '');
        document.getElementById('showOpeningBalance') && (document.getElementById('showOpeningBalance').checked = true);
        
        document.getElementById('ledgerAccountId') && (document.getElementById('ledgerAccountId').value = '');
        document.getElementById('ledgerAccountSearch') && (document.getElementById('ledgerAccountSearch').value = '');
        document.getElementById('ledgerCounterAccountId') && (document.getElementById('ledgerCounterAccountId').value = '');
        document.getElementById('ledgerCounterAccountSearch') && (document.getElementById('ledgerCounterAccountSearch').value = '');
        document.getElementById('ledgerCostCenterId') && (document.getElementById('ledgerCostCenterId').value = '');
        document.getElementById('ledgerCostCenterSearch') && (document.getElementById('ledgerCostCenterSearch').value = '');
        document.getElementById('ledgerCurrency') && (document.getElementById('ledgerCurrency').value = '');
        document.getElementById('ledgerUser') && (document.getElementById('ledgerUser').value = '');
        document.getElementById('ledgerVoucherNo') && (document.getElementById('ledgerVoucherNo').value = '');
        
        document.querySelectorAll('.ledger-source-filter').forEach(cb => cb.checked = true);
        document.getElementById('ledgerAmountFilterType') && (document.getElementById('ledgerAmountFilterType').value = '');
        document.getElementById('ledgerAmountFrom') && (document.getElementById('ledgerAmountFrom').value = '');
        document.getElementById('ledgerAmountTo') && (document.getElementById('ledgerAmountTo').value = '');
        document.getElementById('showAccountsWithoutTransactions') && (document.getElementById('showAccountsWithoutTransactions').checked = false);
        document.getElementById('groupByParentAccount') && (document.getElementById('groupByParentAccount').checked = true);
        document.getElementById('ledgerSortBy') && (document.getElementById('ledgerSortBy').value = 'code');
        document.getElementById('ledgerSortOrder') && (document.getElementById('ledgerSortOrder').value = 'asc');

        // تطبيق الفلتر
        this.applyGeneralLedgerFilter();
    },

    async loadAccountsData() {
        try {
            const snapshot = await db.collection('chartOfAccounts').get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading accounts:', error);
            return [];
        }
    },

    async loadGeneralEntriesData(filters = {}) {
        try {
            // الحصول على الفلترات
            const dateFrom = filters.dateFrom || document.getElementById('ledgerDateFrom')?.value || document.getElementById('financialDateFrom')?.value;
            const dateTo = filters.dateTo || document.getElementById('ledgerDateTo')?.value || document.getElementById('financialDateTo')?.value;
            const accountId = filters.accountId || document.getElementById('ledgerAccountId')?.value;
            const counterAccountId = filters.counterAccountId || document.getElementById('ledgerCounterAccountId')?.value;
            const costCenterId = filters.costCenterId || document.getElementById('ledgerCostCenterId')?.value;
            const currency = filters.currency || document.getElementById('ledgerCurrency')?.value;
            const voucherNo = filters.voucherNo || document.getElementById('ledgerVoucherNo')?.value;
            const sourceTypes = filters.sourceTypes || this.getSelectedSourceTypes();
            
            let query = db.collection('generalEntries')
                .where('status', '==', 'posted');
            
            // إضافة فلترة التاريخ إذا كانت موجودة
            if (dateFrom && document.getElementById('ledgerDateFromCheck')?.checked !== false) {
                const fromDate = new Date(dateFrom);
                query = query.where('date', '>=', fromDate);
            }
            if (dateTo && document.getElementById('ledgerDateToCheck')?.checked !== false) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999);
                query = query.where('date', '<=', toDate);
            }
            
            const snapshot = await query.get();
            let entries = [];
            
            snapshot.forEach(doc => {
                const data = doc.data();
                // تنظيف FieldValue objects
                const date = data.date?.toDate ? data.date.toDate() : new Date(data.date);
                const entryType = data.type || data.voucherType || 'general';
                
                // فلترة حسب نوع المصدر
                if (sourceTypes.length > 0 && !sourceTypes.includes(entryType)) {
                    return;
                }
                
                // فلترة حسب رقم السند
                if (voucherNo) {
                    const voucherNumber = data.voucherNo || data.voucherNumber || '';
                    if (!voucherNumber.toLowerCase().includes(voucherNo.toLowerCase())) {
                        return;
                    }
                }
                
                entries.push({
                    id: doc.id,
                    date: date,
                    voucherNo: data.voucherNo || data.voucherNumber || '',
                    description: data.description || '',
                    type: entryType,
                    entries: data.entries || [],
                    costCenterId: data.costCenterId,
                    currency: data.mainCurrency || data.currency,
                    createdBy: data.createdBy,
                    ...data
                });
            });
            
            // فلترة حسب الحساب، الحساب المقابل، مركز الكلفة، العملة
            if (accountId || counterAccountId || costCenterId || currency) {
                entries = entries.filter(entry => {
                    if (entry.entries && Array.isArray(entry.entries)) {
                        return entry.entries.some(transaction => {
                            if (accountId && transaction.accountId !== accountId) return false;
                            if (costCenterId && transaction.costCenterId !== costCenterId) return false;
                            if (currency && (transaction.currency || entry.currency) !== currency) return false;
                            return true;
                        });
                    }
                    return false;
                });
            }
            
            // فلترة حسب الحساب المقابل (يحتاج فحص جميع الحركات في القيد)
            if (counterAccountId) {
                entries = entries.filter(entry => {
                    if (entry.entries && Array.isArray(entry.entries)) {
                        return entry.entries.some(transaction => transaction.accountId === counterAccountId);
                    }
                    return false;
                });
            }
            
            // ترتيب حسب التاريخ
            entries.sort((a, b) => a.date - b.date);
            
            return entries;
        } catch (error) {
            console.error('Error loading general entries:', error);
            // Fallback: جلب جميع القيود بدون فلترة
            try {
                const snapshot = await db.collection('generalEntries')
                    .where('status', '==', 'posted')
                    .get();
                const entries = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const date = data.date?.toDate ? data.date.toDate() : new Date(data.date);
                    entries.push({
                        id: doc.id,
                        date: date,
                        voucherNo: data.voucherNo || data.voucherNumber || '',
                        description: data.description || '',
                        type: data.type || data.voucherType || 'general',
                        entries: data.entries || [],
                        ...data
                    });
                });
                entries.sort((a, b) => a.date - b.date);
                return entries;
            } catch (fallbackError) {
                console.error('Fallback error:', fallbackError);
                return [];
            }
        }
    },

    getSelectedSourceTypes() {
        const checkboxes = document.querySelectorAll('.ledger-source-filter:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    },

    groupEntriesByAccount(accounts, generalEntries, openingBalances = {}) {
        const ledgerData = {};
        
        // تهيئة جميع الحسابات
        accounts.forEach(account => {
            const openingBalance = openingBalances[account.id] || { debit: 0, credit: 0 };
            ledgerData[account.id] = {
                account: account,
                transactions: [],
                openingBalance: openingBalance,
                totalDebit: openingBalance.debit,
                totalCredit: openingBalance.credit,
                closingBalance: { debit: 0, credit: 0 }
            };
        });
        
        // تجميع الحركات حسب الحساب
        generalEntries.forEach(entry => {
            if (entry.entries && Array.isArray(entry.entries)) {
                entry.entries.forEach(transaction => {
                    const accountId = transaction.accountId;
                    if (ledgerData[accountId]) {
                        const debit = parseFloat(transaction.debit) || 0;
                        const credit = parseFloat(transaction.credit) || 0;
                        
                        ledgerData[accountId].transactions.push({
                            date: entry.date,
                            voucherNo: entry.voucherNo,
                            description: transaction.description || entry.description || '',
                            debit: debit,
                            credit: credit,
                            reference: entry.voucherNo || entry.id,
                            type: entry.type,
                            costCenterId: transaction.costCenterId,
                            costCenterName: transaction.costCenterName
                        });
                        
                        ledgerData[accountId].totalDebit += debit;
                        ledgerData[accountId].totalCredit += credit;
                    }
                });
            }
        });
        
        // حساب الأرصدة الختامية
        Object.keys(ledgerData).forEach(accountId => {
            const accountData = ledgerData[accountId];
            const account = accountData.account;
            
            // تحديد نوع الحساب
            const accountType = account.accountType || account.type || '';
            const isDebitNormal = ['asset', 'expense'].includes(accountType);
            
            // حساب الرصيد (الافتتاحي + الحركات)
            const balance = accountData.totalDebit - accountData.totalCredit;
            
            if (isDebitNormal) {
                // الحسابات التي طبيعتها مدين
                if (balance >= 0) {
                    accountData.closingBalance.debit = balance;
                    accountData.closingBalance.credit = 0;
                } else {
                    accountData.closingBalance.debit = 0;
                    accountData.closingBalance.credit = Math.abs(balance);
                }
            } else {
                // الحسابات التي طبيعتها دائن
                if (balance >= 0) {
                    accountData.closingBalance.debit = balance;
                    accountData.closingBalance.credit = 0;
                } else {
                    accountData.closingBalance.debit = 0;
                    accountData.closingBalance.credit = Math.abs(balance);
                }
            }
        });
        
        return ledgerData;
    },

    renderAdvancedGeneralLedger(ledgerData) {
        const resultsArea = document.getElementById('ledgerResults');
        if (!resultsArea) return;

        const dateFrom = document.getElementById('ledgerDateFrom')?.value || document.getElementById('financialDateFrom')?.value || '';
        const dateTo = document.getElementById('ledgerDateTo')?.value || document.getElementById('financialDateTo')?.value || '';
        const showAccountsWithoutTransactions = document.getElementById('showAccountsWithoutTransactions')?.checked || false;
        const sortBy = document.getElementById('ledgerSortBy')?.value || 'code';
        const sortOrder = document.getElementById('ledgerSortOrder')?.value || 'asc';

        // فلترة الحسابات
        let accountsToShow = Object.values(ledgerData);
        if (!showAccountsWithoutTransactions) {
            accountsToShow = accountsToShow.filter(data => data.transactions.length > 0 || 
                (data.openingBalance.debit > 0 || data.openingBalance.credit > 0));
        }

        // الترتيب
        accountsToShow.sort((a, b) => {
            let comparison = 0;
            switch(sortBy) {
                case 'code':
                    comparison = (a.account.code || '').localeCompare(b.account.code || '');
                    break;
                case 'name':
                    comparison = (a.account.name || '').localeCompare(b.account.name || '');
                    break;
                case 'balance':
                    const balanceA = Math.abs(a.closingBalance.debit - a.closingBalance.credit);
                    const balanceB = Math.abs(b.closingBalance.debit - b.closingBalance.credit);
                    comparison = balanceA - balanceB;
                    break;
                case 'transactions':
                    comparison = a.transactions.length - b.transactions.length;
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        if (accountsToShow.length === 0) {
            resultsArea.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-info-circle"></i>
                    لا توجد حركات محاسبية في الفترة المحددة
                </div>
            `;
            return;
        }

        let html = `
            <div class="report-header text-center mb-4">
                <h5>نتائج دفتر الأستاذ</h5>
                <p class="text-muted">${dateFrom && dateTo ? `من ${dateFrom} إلى ${dateTo}` : 'جميع الفترات'} | بتاريخ ${new Date().toLocaleDateString('ar-SA')}</p>
            </div>
        `;

        accountsToShow.forEach((accountData) => {
            const account = accountData.account;
            const transactions = accountData.transactions;
            
            // ترتيب الحركات حسب التاريخ
            transactions.sort((a, b) => a.date - b.date);
            
            const accountType = account.accountType || account.type || '';
            const isDebitNormal = ['asset', 'expense'].includes(accountType);
            
            // حساب الرصيد الجاري (يبدأ من الرصيد الافتتاحي)
            let runningBalance = 0;
            if (isDebitNormal) {
                runningBalance = accountData.openingBalance.debit - accountData.openingBalance.credit;
            } else {
                runningBalance = accountData.openingBalance.credit - accountData.openingBalance.debit;
            }

            const hasOpeningBalance = accountData.openingBalance.debit > 0 || accountData.openingBalance.credit > 0;
            const showOpeningBalance = document.getElementById('showOpeningBalance')?.checked && hasOpeningBalance;

            html += `
                <div class="account-section mb-4">
                    <div class="card">
                        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-0">
                                    <i class="fas fa-book"></i>
                                    ${account.code || ''} - ${account.name || 'بدون اسم'}
                                </h6>
                                <small>${this.getAccountTypeText(accountType)}</small>
                            </div>
                            <button class="btn btn-sm btn-light" onclick="this.closest('.account-section').querySelector('.card-body').classList.toggle('d-none')">
                                <i class="fas fa-chevron-up"></i>
                            </button>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-bordered table-hover mb-0">
                                    <thead class="table-light">
                                        <tr>
                                            <th style="width: 10%;">التاريخ</th>
                                            <th style="width: 10%;">رقم السند</th>
                                            <th style="width: 25%;">الوصف</th>
                                            <th style="width: 10%;">النوع</th>
                                            <th style="width: 12%;" class="text-end">مدين</th>
                                            <th style="width: 12%;" class="text-end">دائن</th>
                                            <th style="width: 21%;" class="text-end">الرصيد</th>
                                        </tr>
                                    </thead>
                                    <tbody>
            `;

            // عرض الرصيد الافتتاحي
            if (showOpeningBalance) {
                const openingBalanceDisplay = runningBalance >= 0 ? 
                    `<span class="text-success">${Math.abs(runningBalance).toLocaleString('ar-IQ', {minimumFractionDigits: 2})}</span>` :
                    `<span class="text-danger">${Math.abs(runningBalance).toLocaleString('ar-IQ', {minimumFractionDigits: 2})}</span>`;
                
                html += `
                    <tr class="table-info">
                        <td colspan="3" class="text-end"><strong>الرصيد الافتتاحي</strong></td>
                        <td>-</td>
                        <td class="text-end">${accountData.openingBalance.debit > 0 ? accountData.openingBalance.debit.toLocaleString('ar-IQ', {minimumFractionDigits: 2}) : '-'}</td>
                        <td class="text-end">${accountData.openingBalance.credit > 0 ? accountData.openingBalance.credit.toLocaleString('ar-IQ', {minimumFractionDigits: 2}) : '-'}</td>
                        <td class="text-end"><strong>${openingBalanceDisplay}</strong></td>
                    </tr>
                `;
            }

            // عرض الحركات
            transactions.forEach(transaction => {
                const debit = transaction.debit || 0;
                const credit = transaction.credit || 0;
                
                if (isDebitNormal) {
                    runningBalance += debit - credit;
                } else {
                    runningBalance += credit - debit;
                }
                
                const balanceDisplay = runningBalance >= 0 ? 
                    `<span class="text-success">${Math.abs(runningBalance).toLocaleString('ar-IQ', {minimumFractionDigits: 2})}</span>` :
                    `<span class="text-danger">${Math.abs(runningBalance).toLocaleString('ar-IQ', {minimumFractionDigits: 2})}</span>`;
                
                html += `
                    <tr>
                        <td>${transaction.date.toLocaleDateString('ar-SA')}</td>
                        <td>${transaction.voucherNo || '-'}</td>
                        <td>${transaction.description || '-'}</td>
                        <td><span class="badge bg-secondary">${this.getSourceTypeText(transaction.type)}</span></td>
                        <td class="text-end">${debit > 0 ? debit.toLocaleString('ar-IQ', {minimumFractionDigits: 2}) : '-'}</td>
                        <td class="text-end">${credit > 0 ? credit.toLocaleString('ar-IQ', {minimumFractionDigits: 2}) : '-'}</td>
                        <td class="text-end">${balanceDisplay}</td>
                    </tr>
                `;
            });
            
            // إجمالي الحساب
            const closingBalanceDisplay = accountData.closingBalance.debit > 0 ? 
                `<span class="text-success">${accountData.closingBalance.debit.toLocaleString('ar-IQ', {minimumFractionDigits: 2})}</span>` :
                `<span class="text-danger">${accountData.closingBalance.credit.toLocaleString('ar-IQ', {minimumFractionDigits: 2})}</span>`;
            
            html += `
                                    </tbody>
                                    <tfoot class="table-primary">
                                        <tr>
                                            <td colspan="4" class="text-end"><strong>الإجمالي / الرصيد الختامي</strong></td>
                                            <td class="text-end"><strong>${accountData.totalDebit.toLocaleString('ar-IQ', {minimumFractionDigits: 2})}</strong></td>
                                            <td class="text-end"><strong>${accountData.totalCredit.toLocaleString('ar-IQ', {minimumFractionDigits: 2})}</strong></td>
                                            <td class="text-end"><strong>${closingBalanceDisplay}</strong></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        resultsArea.innerHTML = html;
    },

    getAccountTypeText(type) {
        const types = {
            'asset': 'أصول',
            'liability': 'خصوم',
            'equity': 'حقوق ملكية',
            'income': 'إيرادات',
            'expense': 'مصروفات'
        };
        return types[type] || type || 'غير محدد';
    },

    getSourceTypeText(type) {
        const types = {
            'sale': 'مبيعات',
            'purchase': 'مشتريات',
            'sale_return': 'مرتجع مبيعات',
            'purchase_return': 'مرتجع مشتريات',
            'receipt': 'سند قبض',
            'payment': 'سند صرف',
            'journal': 'سند يومية',
            'entry': 'سند قيد',
            'general': 'قيد عام'
        };
        return types[type] || type || 'عام';
    },

    updateLedgerSummary(ledgerData) {
        const summaryCards = document.getElementById('ledgerSummaryCards');
        if (!summaryCards) return;

        const accountsWithTransactions = Object.values(ledgerData)
            .filter(data => data.transactions.length > 0 || 
                (data.openingBalance.debit > 0 || data.openingBalance.credit > 0));

        let totalTransactions = 0;
        let totalDebit = 0;
        let totalCredit = 0;

        accountsWithTransactions.forEach(accountData => {
            totalTransactions += accountData.transactions.length;
            totalDebit += accountData.totalDebit;
            totalCredit += accountData.totalCredit;
        });

        document.getElementById('ledgerAccountsCount').textContent = accountsWithTransactions.length;
        document.getElementById('ledgerTransactionsCount').textContent = totalTransactions;
        document.getElementById('ledgerTotalDebit').textContent = totalDebit.toLocaleString('ar-IQ', {minimumFractionDigits: 2});
        document.getElementById('ledgerTotalCredit').textContent = totalCredit.toLocaleString('ar-IQ', {minimumFractionDigits: 2});

        summaryCards.style.display = 'flex';
    },

    async openAccountPicker(accountIdField, accountDisplayField) {
        try {
            // تحميل الحسابات
            const accounts = await this.loadAccountsData();
            
            // فلترة الحسابات النهائية فقط
            const leafAccounts = accounts.filter(account => {
                const hasChildren = accounts.some(otherAccount => {
                    return (otherAccount.parentId === account.id) || 
                           (otherAccount.parent === account.id) ||
                           (otherAccount.parentAccountId === account.id);
                });
                return !hasChildren;
            });

            const content = `
                <div style="text-align: start; max-height: 80vh; display: flex; flex-direction: column;">
                    <div class="mb-3">
                        <div class="input-group input-group-lg">
                            <span class="input-group-text"><i class="fas fa-search"></i></span>
                            <input type="text" id="ledgerAccountPickerSearch" class="form-control" placeholder="ابحث في الحسابات..." autofocus>
                        </div>
                        <small class="text-muted d-block mt-2">
                            <i class="fas fa-info-circle"></i> يتم عرض الحسابات النهائية فقط (التي لا تحتوي على حسابات فرعية)
                        </small>
                    </div>
                    <div class="list-group" id="ledgerAccountPickerList" style="max-height: 60vh; overflow-y: auto; border: 1px solid #dee2e6; border-radius: 0.375rem;">
                        ${leafAccounts.length > 0 ? leafAccounts.map(acc => `
                            <button type="button" class="list-group-item list-group-item-action ledger-account-pick-item" data-id="${acc.id}" data-code="${acc.code || ''}" data-name="${acc.name || ''}" style="border-left: 3px solid transparent; transition: all 0.2s;">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="flex-grow-1">
                                        <div class="fw-bold mb-1">${acc.name || 'بدون اسم'}</div>
                                        <small class="text-muted d-block">
                                            <span class="badge bg-secondary me-2">${acc.code || 'بدون كود'}</span>
                                            <span>${this.getAccountTypeText(acc.accountType || acc.type || '')}</span>
                                        </small>
                                    </div>
                                    <i class="fas fa-check text-success ms-3" style="display:none; font-size: 1.2rem;"></i>
                                </div>
                            </button>
                        `).join('') : '<div class="list-group-item text-center text-muted py-5"><i class="fas fa-inbox fa-2x mb-2"></i><br>لا توجد حسابات</div>'}
                    </div>
                    <div class="mt-3 text-muted small">
                        <i class="fas fa-info-circle"></i> إجمالي الحسابات: <strong>${leafAccounts.length}</strong>
                    </div>
                </div>
            `;
            
            Swal.fire({
                title: '<i class="fas fa-book-open text-primary"></i> اختيار حساب',
                html: content,
                width: '90%',
                maxWidth: '900px',
                showCancelButton: true,
                confirmButtonText: '<i class="fas fa-check"></i> اختيار',
                cancelButtonText: '<i class="fas fa-times"></i> إلغاء',
                confirmButtonColor: '#0d6efd',
                cancelButtonColor: '#6c757d',
                focusConfirm: false,
                customClass: {
                    popup: 'swal2-popup-fullscreen',
                    htmlContainer: 'text-start'
                },
                didOpen: () => {
                    const searchInput = document.getElementById('ledgerAccountPickerSearch');
                    const items = Array.from(document.querySelectorAll('.ledger-account-pick-item'));
                    let selectedId = null;
                    let selectedAccount = null;
                    
                    const filter = () => {
                        const q = (searchInput.value || '').toLowerCase();
                        let visibleCount = 0;
                        items.forEach(el => {
                            const acc = leafAccounts.find(a => a.id === el.dataset.id);
                            const text = `${acc?.name || ''} ${acc?.code || ''} ${acc?.type || ''}`.toLowerCase();
                            const isVisible = text.includes(q);
                            el.style.display = isVisible ? '' : 'none';
                            if (isVisible) visibleCount++;
                        });
                    };
                    searchInput.addEventListener('input', filter);
                    
                    items.forEach(el => {
                        el.addEventListener('click', () => {
                            items.forEach(x => {
                                x.classList.remove('active');
                                x.style.borderLeftColor = 'transparent';
                                x.style.backgroundColor = '';
                                x.querySelector('i.fas.fa-check')?.style && (x.querySelector('i.fas.fa-check').style.display = 'none');
                            });
                            el.classList.add('active');
                            el.style.borderLeftColor = '#0d6efd';
                            el.style.backgroundColor = '#e7f1ff';
                            el.querySelector('i.fas.fa-check').style.display = '';
                            selectedId = el.dataset.id;
                            selectedAccount = {
                                id: el.dataset.id,
                                code: el.dataset.code,
                                name: el.dataset.name
                            };
                        });
                    });
                    
                    // Preselect current
                    const currentId = document.getElementById(accountIdField)?.value;
                    if (currentId) {
                        const current = items.find(x => x.dataset.id === currentId);
                        if (current) {
                            current.click();
                            current.scrollIntoView({ block: 'center', behavior: 'smooth' });
                        }
                    }
                    
                    // Enter key to select
                    searchInput.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' && selectedId) {
                            e.preventDefault();
                            Swal.clickConfirm();
                        }
                    });
                    
                    // Attach confirm handler
                    const confirmBtn = Swal.getConfirmButton();
                    confirmBtn.addEventListener('click', () => {
                        if (selectedId && selectedAccount) {
                            document.getElementById(accountIdField).value = selectedId;
                            document.getElementById(accountDisplayField).value = `${selectedAccount.code || ''} - ${selectedAccount.name || ''}`;
                            const clearBtn = accountIdField === 'ledgerAccountId' ? 
                                document.getElementById('clearAccountFilter') : 
                                document.getElementById('clearCounterAccountFilter');
                            if (clearBtn) clearBtn.style.display = 'block';
                        }
                    }, { once: true });
                }
            });
        } catch (error) {
            console.error('Error opening account picker:', error);
            Swal.fire({
                title: 'خطأ',
                text: 'حدث خطأ في تحميل الحسابات: ' + error.message,
                icon: 'error'
            });
        }
    },

    async openCostCenterPicker() {
        try {
            // تحميل مراكز الكلفة
            const costCentersSnapshot = await db.collection('costCenters').get();
            const costCenters = costCentersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const content = `
                <div style="text-align: start; max-height: 80vh; display: flex; flex-direction: column;">
                    <div class="mb-3">
                        <div class="input-group input-group-lg">
                            <span class="input-group-text"><i class="fas fa-search"></i></span>
                            <input type="text" id="ledgerCostCenterPickerSearch" class="form-control" placeholder="ابحث في مراكز الكلفة..." autofocus>
                        </div>
                    </div>
                    <div class="list-group" id="ledgerCostCenterPickerList" style="max-height: 60vh; overflow-y: auto; border: 1px solid #dee2e6; border-radius: 0.375rem;">
                        ${costCenters.length > 0 ? costCenters.map(cc => `
                            <button type="button" class="list-group-item list-group-item-action ledger-costcenter-pick-item" data-id="${cc.id}" data-name="${cc.name || ''}" style="border-left: 3px solid transparent; transition: all 0.2s;">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div class="flex-grow-1">
                                        <div class="fw-bold mb-1">${cc.name || 'بدون اسم'}</div>
                                        ${cc.code ? `<small class="text-muted"><span class="badge bg-secondary">${cc.code}</span></small>` : ''}
                                    </div>
                                    <i class="fas fa-check text-success ms-3" style="display:none; font-size: 1.2rem;"></i>
                                </div>
                            </button>
                        `).join('') : '<div class="list-group-item text-center text-muted py-5"><i class="fas fa-inbox fa-2x mb-2"></i><br>لا توجد مراكز كلفة</div>'}
                    </div>
                    <div class="mt-3 text-muted small">
                        <i class="fas fa-info-circle"></i> إجمالي مراكز الكلفة: <strong>${costCenters.length}</strong>
                    </div>
                </div>
            `;
            
            Swal.fire({
                title: '<i class="fas fa-building text-primary"></i> اختيار مركز الكلفة',
                html: content,
                width: '90%',
                maxWidth: '800px',
                showCancelButton: true,
                confirmButtonText: '<i class="fas fa-check"></i> اختيار',
                cancelButtonText: '<i class="fas fa-times"></i> إلغاء',
                confirmButtonColor: '#0d6efd',
                cancelButtonColor: '#6c757d',
                focusConfirm: false,
                customClass: {
                    popup: 'swal2-popup-fullscreen',
                    htmlContainer: 'text-start'
                },
                didOpen: () => {
                    const searchInput = document.getElementById('ledgerCostCenterPickerSearch');
                    const items = Array.from(document.querySelectorAll('.ledger-costcenter-pick-item'));
                    let selectedId = null;
                    let selectedName = null;
                    
                    const filter = () => {
                        const q = (searchInput.value || '').toLowerCase();
                        items.forEach(el => {
                            const name = el.dataset.name.toLowerCase();
                            el.style.display = name.includes(q) ? '' : 'none';
                        });
                    };
                    searchInput.addEventListener('input', filter);
                    
                    items.forEach(el => {
                        el.addEventListener('click', () => {
                            items.forEach(x => {
                                x.classList.remove('active');
                                x.style.borderLeftColor = 'transparent';
                                x.style.backgroundColor = '';
                                x.querySelector('i.fas.fa-check')?.style && (x.querySelector('i.fas.fa-check').style.display = 'none');
                            });
                            el.classList.add('active');
                            el.style.borderLeftColor = '#0d6efd';
                            el.style.backgroundColor = '#e7f1ff';
                            el.querySelector('i.fas.fa-check').style.display = '';
                            selectedId = el.dataset.id;
                            selectedName = el.dataset.name;
                        });
                    });
                    
                    // Preselect current
                    const currentId = document.getElementById('ledgerCostCenterId')?.value;
                    if (currentId) {
                        const current = items.find(x => x.dataset.id === currentId);
                        if (current) {
                            current.click();
                            current.scrollIntoView({ block: 'center', behavior: 'smooth' });
                        }
                    }
                    
                    // Enter key to select
                    searchInput.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' && selectedId) {
                            e.preventDefault();
                            Swal.clickConfirm();
                        }
                    });
                    
                    // Attach confirm handler
                    const confirmBtn = Swal.getConfirmButton();
                    confirmBtn.addEventListener('click', () => {
                        if (selectedId && selectedName) {
                            document.getElementById('ledgerCostCenterId').value = selectedId;
                            document.getElementById('ledgerCostCenterSearch').value = selectedName;
                            const clearBtn = document.getElementById('clearCostCenterFilter');
                            if (clearBtn) clearBtn.style.display = 'block';
                        }
                    }, { once: true });
                }
            });
        } catch (error) {
            console.error('Error opening cost center picker:', error);
            Swal.fire({
                title: 'خطأ',
                text: 'حدث خطأ في تحميل مراكز الكلفة: ' + error.message,
                icon: 'error'
            });
        }
    },

    exportLedgerToPDF() {
        const resultsArea = document.getElementById('ledgerResults');
        if (!resultsArea || !resultsArea.innerHTML.trim()) {
            Swal.fire({
                title: 'لا توجد بيانات',
                text: 'لا توجد بيانات للتصدير. يرجى تطبيق الفلتر أولاً.',
                icon: 'warning'
            });
            return;
        }

        const dateFrom = document.getElementById('ledgerDateFrom')?.value || '';
        const dateTo = document.getElementById('ledgerDateTo')?.value || '';
        const fileName = `دفتر_الأستاذ_${dateFrom || 'all'}_${dateTo || 'all'}_${new Date().toISOString().split('T')[0]}.html`;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>دفتر الأستاذ - PDF</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <style>
                    @media print {
                        @page {
                            size: A4;
                            margin: 1cm;
                        }
                        body {
                            margin: 0;
                            padding: 20px;
                        }
                        .no-print { display: none !important; }
                    }
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        padding: 20px;
                        background: white;
                    }
                    .report-header {
                        text-align: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 3px solid #0d6efd;
                    }
                    .report-header h5 {
                        color: #0d6efd;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    .account-section {
                        page-break-inside: avoid;
                        margin-bottom: 30px;
                    }
                    .card {
                        border: 1px solid #dee2e6;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .card-header {
                        background: linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%);
                        color: white;
                        font-weight: bold;
                    }
                    table {
                        font-size: 0.9rem;
                    }
                    .text-end {
                        text-align: left !important;
                    }
                    .print-actions {
                        position: fixed;
                        top: 20px;
                        left: 20px;
                        z-index: 1000;
                    }
                    .print-actions button {
                        margin: 5px;
                        padding: 10px 20px;
                        background: #0d6efd;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    }
                    .print-actions button:hover {
                        background: #0a58ca;
                    }
                </style>
            </head>
            <body>
                <div class="print-actions no-print">
                    <button onclick="window.print()"><i class="fas fa-print"></i> طباعة</button>
                    <button onclick="window.close()"><i class="fas fa-times"></i> إغلاق</button>
                </div>
                ${resultsArea.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        
        Swal.fire({
            title: 'تم فتح النافذة',
            text: 'تم فتح النافذة للطباعة. استخدم زر الطباعة في المتصفح لحفظ كـ PDF.',
            icon: 'success',
            timer: 3000,
            showConfirmButton: false
        });
    },

    exportLedgerToPDF() {
        const resultsArea = document.getElementById('ledgerResults');
        if (!resultsArea || !resultsArea.innerHTML.trim()) {
            Swal.fire({
                title: 'لا توجد بيانات',
                text: 'لا توجد بيانات للتصدير. يرجى تطبيق الفلتر أولاً.',
                icon: 'warning'
            });
            return;
        }

        try {
            const dateFrom = document.getElementById('ledgerDateFrom')?.value || '';
            const dateTo = document.getElementById('ledgerDateTo')?.value || '';
            const fileName = `دفتر_الأستاذ_${dateFrom || 'all'}_${dateTo || 'all'}_${new Date().toISOString().split('T')[0]}.xls`;

            // إنشاء جدول HTML يمكن فتحه في Excel
            let excelContent = `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
                <head>
                    <meta charset="UTF-8">
                    <meta name="ProgId" content="Excel.Sheet">
                    <meta name="Generator" content="Microsoft Excel">
                    <style>
                        body { font-family: Arial, sans-serif; direction: rtl; }
                        table { border-collapse: collapse; width: 100%; }
                        th { background-color: #0d6efd; color: white; font-weight: bold; padding: 8px; border: 1px solid #ddd; }
                        td { padding: 6px; border: 1px solid #ddd; }
                        .text-end { text-align: left; }
                        .account-header { background-color: #e7f1ff; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h2>دفتر الأستاذ</h2>
                    <p>من ${dateFrom || 'الكل'} إلى ${dateTo || 'الكل'} | بتاريخ ${new Date().toLocaleDateString('ar-SA')}</p>
            `;

            // استخراج البيانات من الجداول
            const tables = resultsArea.querySelectorAll('table');
            tables.forEach((table, index) => {
                const accountHeader = table.closest('.account-section')?.querySelector('.card-header h6')?.textContent || `حساب ${index + 1}`;
                excelContent += `<h3>${accountHeader}</h3>`;
                excelContent += table.outerHTML;
            });

            excelContent += `
                </body>
                </html>
            `;

            // إنشاء blob وتحميل الملف
            const blob = new Blob(['\ufeff' + excelContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            Swal.fire({
                title: 'تم التصدير',
                text: 'تم تصدير البيانات بنجاح إلى ملف Excel.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            Swal.fire({
                title: 'خطأ',
                text: 'حدث خطأ أثناء التصدير: ' + error.message,
                icon: 'error'
            });
        }
    },

    printLedger() {
        const resultsArea = document.getElementById('ledgerResults');
        if (!resultsArea) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>دفتر الأستاذ</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css" rel="stylesheet">
                    <style>
                        @media print {
                            body { margin: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    ${resultsArea.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    },

    renderGeneralLedger(ledgerData) {
        // استخدام الدالة المتقدمة
        this.renderAdvancedGeneralLedger(ledgerData);
    },

    async generateStockStatus() {
        const reportContent = document.getElementById('reportContent');
        
        try {
            const products = await this.loadProductsData();
            let tableRows = '';
            let totalValue = 0;

            products.forEach(product => {
                const value = (product.currentStock || 0) * (product.purchasePrice || 0);
                totalValue += value;
                
                const stockClass = (product.currentStock || 0) <= (product.minStock || 0) ? 'table-warning' : '';
                tableRows += `
                    <tr class="${stockClass}">
                        <td>${product.code || 'N/A'}</td>
                        <td>${product.name || 'N/A'}</td>
                        <td>${product.category || 'N/A'}</td>
                        <td>${product.currentStock || 0}</td>
                        <td>${(product.purchasePrice || 0).toLocaleString()}</td>
                        <td>${(product.sellingPrice || 0).toLocaleString()}</td>
                        <td>${value.toLocaleString()}</td>
                    </tr>
                `;
            });

            reportContent.innerHTML = `
                <div class="report-header text-center mb-4">
                    <h4>تقرير حالة المخزون</h4>
                    <p>بتاريخ ${new Date().toLocaleDateString('ar-SA')}</p>
                </div>
                <table class="table table-bordered table-hover">
                    <thead>
                        <tr>
                            <th>الكود</th>
                            <th>المنتج</th>
                            <th>التصنيف</th>
                            <th>الكمية</th>
                            <th>سعر الشراء</th>
                            <th>سعر البيع</th>
                            <th>القيمة</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                    <tfoot>
                        <tr class="table-primary">
                            <td colspan="6"><strong>إجمالي قيمة المخزون</strong></td>
                            <td><strong>${totalValue.toLocaleString()}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            `;
        } catch (error) {
            this.showReportError('خطأ في توليد تقرير حالة المخزون');
        }
    },

    async generateStockMovement() {
        const reportContent = document.getElementById('reportContent');
        reportContent.innerHTML = '<div class="alert alert-info">تقرير حركة المخزون قيد التطوير</div>';
    },

    async generateLowStock() {
        const reportContent = document.getElementById('reportContent');
        reportContent.innerHTML = '<div class="alert alert-info">تقرير المنتجات المنخفضة قيد التطوير</div>';
    },

    async generateExpiredProducts() {
        const reportContent = document.getElementById('reportContent');
        reportContent.innerHTML = '<div class="alert alert-info">تقرير المنتجات المنتهية قيد التطوير</div>';
    },

    async generateSalesSummary() {
        const reportContent = document.getElementById('reportContent');
        reportContent.innerHTML = '<div class="alert alert-info">ملخص المبيعات قيد التطوير</div>';
    },

    async generateSalesByProduct() {
        const reportContent = document.getElementById('reportContent');
        reportContent.innerHTML = '<div class="alert alert-info">المبيعات حسب المنتج قيد التطوير</div>';
    },

    async generateSalesByCustomer() {
        const reportContent = document.getElementById('reportContent');
        reportContent.innerHTML = '<div class="alert alert-info">المبيعات حسب العميل قيد التطوير</div>';
    },

    async generateSalesTrends() {
        const reportContent = document.getElementById('reportContent');
        reportContent.innerHTML = '<div class="alert alert-info">اتجاهات المبيعات قيد التطوير</div>';
    },

    async loadSalesData() {
        try {
            const snapshot = await db.collection('sales').get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading sales data:', error);
            return [];
        }
    },

    async loadPurchasesData() {
        try {
            const snapshot = await db.collection('purchases').get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading purchases data:', error);
            return [];
        }
    },

    async loadProductsData() {
        try {
            const snapshot = await db.collection('products').get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error loading products data:', error);
            return [];
        }
    },

    getReportTitle(reportType) {
        const titles = {
            'income_statement': 'قائمة الدخل',
            'balance_sheet': 'الميزانية العمومية',
            'cash_flow': 'قائمة التدفق النقدي',
            'trial_balance': 'ميزان المراجعة',
            'general_ledger': 'دفتر الأستاذ',
            'stock_status': 'حالة المخزون',
            'stock_movement': 'حركة المخزون',
            'low_stock': 'المنتجات المنخفضة',
            'expired_products': 'المنتجات المنتهية',
            'sales_summary': 'ملخص المبيعات',
            'sales_by_product': 'المبيعات حسب المنتج',
            'sales_by_customer': 'المبيعات حسب العميل',
            'sales_trends': 'اتجاهات المبيعات'
        };
        return titles[reportType] || 'تقرير';
    },

    showReportError(message) {
        const reportContent = document.getElementById('reportContent');
        if (reportContent) {
            reportContent.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    ${message}
                </div>
            `;
        }
    },

    createCustomReport() {
        const name = document.getElementById('customReportName').value;
        const type = document.getElementById('customReportType').value;
        const dateFrom = document.getElementById('customDateFrom').value;
        const dateTo = document.getElementById('customDateTo').value;

        if (!name) {
            Swal.fire({
                title: 'خطأ',
                text: 'يرجى إدخال اسم التقرير',
                icon: 'error'
            });
            return;
        }

        // TODO: Implement custom report creation
        Swal.fire({
            title: 'إنشاء تقرير مخصص',
            text: `سيتم إنشاء تقرير ${name} من نوع ${type}`,
            icon: 'info'
        });
    },

    printReport() {
        const reportContent = document.getElementById('reportContent');
        if (reportContent) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>تقرير</title>
                        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css" rel="stylesheet">
                        <style>
                            @media print {
                                body { margin: 0; }
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        ${reportContent.innerHTML}
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    },

    exportReport() {
        // TODO: Implement report export
        Swal.fire({
            title: 'تصدير التقرير',
            text: 'سيتم إضافة ميزة التصدير قريباً',
            icon: 'info'
        });
    },

    viewReport(reportId) {
        const report = this.reports.find(r => r.id === reportId);
        if (report) {
            Swal.fire({
                title: report.name,
                html: `
                    <div class="text-start">
                        <p><strong>النوع:</strong> ${this.getReportCategoryName(report.category)}</p>
                        <p><strong>التاريخ:</strong> ${new Date(report.createdAt).toLocaleDateString('ar-SA')}</p>
                        <p><strong>الحالة:</strong> ${report.status === 'completed' ? 'مكتمل' : 'قيد التجهيز'}</p>
                        <p><strong>الوصف:</strong> ${report.description || 'N/A'}</p>
                    </div>
                `,
                icon: 'info'
            });
        }
    },

    editReport(reportId) {
        // TODO: Implement edit report functionality
        Swal.fire({
            title: 'تعديل التقرير',
            text: 'سيتم إضافة هذه الميزة قريباً',
            icon: 'info'
        });
    }
};

console.log('✅ Reports module loaded');




