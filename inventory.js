/**
 * Inventory Module - Complete Inventory Management
 * @module modules/inventory
 */

const InventoryModule = {
    // Data storage
    currentTab: 'dashboard',
    products: [],
    movements: [],
    warehouses: [],
    units: [], // Initialize units array
    currentPage: 1,
    itemsPerPage: 10,

    getHTML() {
        return `
            <div class="inventory-module">
                <!-- Header -->
                <div class="module-header">
                    <div class="header-content">
                        <div class="header-title">
                            <i class="fas fa-warehouse"></i>
                            <h2>إدارة المخزون</h2>
                        </div>
                        <div class="header-actions">
                            <button class="btn btn-primary" id="newMovementBtn">
                                <i class="fas fa-plus"></i> إضافة حركة مخزون
                            </button>
                            <button class="btn btn-outline-info" id="goToWarehousesBtn" title="الانتقال إلى إدارة المستودعات">
                                <i class="fas fa-warehouse"></i> إدارة المستودعات
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Navigation Tabs -->
                <ul class="nav nav-tabs" id="inventoryTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="dashboard-tab" data-bs-toggle="tab" data-bs-target="#dashboard" type="button" role="tab">
                            <i class="fas fa-tachometer-alt"></i> لوحة التحكم
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="products-tab" data-bs-toggle="tab" data-bs-target="#products" type="button" role="tab">
                            <i class="fas fa-boxes"></i> المنتجات
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="movements-tab" data-bs-toggle="tab" data-bs-target="#movements" type="button" role="tab">
                            <i class="fas fa-exchange-alt"></i> حركات المخزون
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="warehouses-tab" data-bs-toggle="tab" data-bs-target="#warehouses" type="button" role="tab">
                            <i class="fas fa-warehouse"></i> المستودعات
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="reports-tab" data-bs-toggle="tab" data-bs-target="#reports" type="button" role="tab">
                            <i class="fas fa-chart-line"></i> التقارير
                        </button>
                    </li>
                </ul>

                <!-- Tab Content -->
                <div class="tab-content" id="inventoryTabContent">
                    <!-- Dashboard Tab -->
                    <div class="tab-pane fade show active" id="dashboard" role="tabpanel">
                        <div class="dashboard-content">
                            <!-- Summary Cards -->
                            <div class="row mb-4">
                                <div class="col-md-3">
                                    <div class="summary-card">
                                        <div class="card-icon">
                                            <i class="fas fa-boxes text-primary"></i>
                                        </div>
                                        <div class="card-content">
                                            <h3 id="totalProducts">0</h3>
                                            <p>إجمالي المنتجات</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="summary-card">
                                        <div class="card-icon">
                                            <i class="fas fa-exclamation-triangle text-warning"></i>
                                        </div>
                                        <div class="card-content">
                                            <h3 id="lowStockProducts">0</h3>
                                            <p>منتجات منخفضة المخزون</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="summary-card">
                                        <div class="card-icon">
                                            <i class="fas fa-warehouse text-info"></i>
                                        </div>
                                        <div class="card-content">
                                            <h3 id="totalWarehouses">0</h3>
                                            <p>إجمالي المستودعات</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="summary-card">
                                        <div class="card-icon">
                                            <i class="fas fa-exchange-alt text-success"></i>
                                        </div>
                                        <div class="card-content">
                                            <h3 id="totalMovements">0</h3>
                                            <p>إجمالي الحركات</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Inventory KPIs -->
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <div class="summary-card">
                                        <div class="card-icon">
                                            <i class="fas fa-cubes text-secondary"></i>
                                        </div>
                                        <div class="card-content">
                                            <h3 id="totalStockQuantity">0</h3>
                                            <p>إجمالي كمية المخزون (كل المستودعات)</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="summary-card">
                                        <div class="card-icon">
                                            <i class="fas fa-coins text-success"></i>
                                        </div>
                                        <div class="card-content">
                                            <h3 id="totalStockValue">0</h3>
                                            <p>إجمالي قيمة المخزون التقديرية</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Recent Movements & Warehouse Stock Summary -->
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="card mb-3">
                                        <div class="card-header">
                                            <h5><i class="fas fa-clock"></i> آخر حركات المخزون</h5>
                                        </div>
                                        <div class="card-body">
                                            <div class="table-responsive">
                                                <table class="table table-hover mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>التاريخ</th>
                                                            <th>النوع</th>
                                                            <th>المنتج</th>
                                                            <th>الكمية</th>
                                                            <th>المستودع</th>
                                                            <th>المرجع</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="recentMovementsTable">
                                                        <tr>
                                                            <td colspan="6" class="text-center text-muted">لا توجد حركات</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="card mb-3">
                                        <div class="card-header">
                                            <h5><i class="fas fa-warehouse"></i> ملخص المخزون حسب المستودع</h5>
                                        </div>
                                        <div class="card-body">
                                            <div class="table-responsive">
                                                <table class="table table-hover mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>المستودع</th>
                                                            <th>إجمالي الكمية</th>
                                                            <th>إجمالي القيمة</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="warehouseStockSummaryBody">
                                                        <tr>
                                                            <td colspan="3" class="text-center text-muted">لا توجد بيانات مخزون</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Products Tab -->
                    <div class="tab-pane fade" id="products" role="tabpanel">
                        <div class="products-content">
                            <!-- Search and Filter -->
                            <div class="row mb-3">
                                <div class="col-md-4">
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                                        <input type="text" class="form-control" id="productSearch" placeholder="البحث في المنتجات...">
                                    </div>
                                </div>
                                <div class="col-md-2">
                                    <select class="form-select" id="productCategoryFilter">
                                        <option value="">جميع الفئات</option>
                                    </select>
                                </div>
                                <div class="col-md-2">
                                    <select class="form-select" id="productStatusFilter">
                                        <option value="">جميع الحالات</option>
                                        <option value="active">نشط</option>
                                        <option value="inactive">غير نشط</option>
                                    </select>
                                </div>
                                <div class="col-md-2">
                                    <select class="form-select" id="stockStatusFilter">
                                        <option value="">جميع المخزون</option>
                                        <option value="low">منخفض</option>
                                        <option value="out">نفد</option>
                                        <option value="normal">عادي</option>
                                    </select>
                                </div>
                                <div class="col-md-2">
                                    <button class="btn btn-outline-secondary" id="clearProductFilters">
                                        <i class="fas fa-times"></i> مسح الفلاتر
                                    </button>
                                </div>
                            </div>

                            <!-- Products Table -->
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-boxes"></i> قائمة المنتجات</h5>
                                </div>
                                <div class="card-body">
                                    <div class="table-responsive">
                                        <table class="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>كود المنتج</th>
                                                    <th>اسم المنتج</th>
                                                    <th>الفئة</th>
                                                    <th>الكمية المتاحة</th>
                                                    <th>الحد الأدنى</th>
                                                    <th>الحالة</th>
                                                    <th>الإجراءات</th>
                                                </tr>
                                            </thead>
                                            <tbody id="productsTable">
                                                <tr>
                                                    <td colspan="7" class="text-center text-muted">لا توجد منتجات</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Movements Tab -->
                    <div class="tab-pane fade" id="movements" role="tabpanel">
                        <div class="movements-content">
                            <!-- Search and Filter -->
                            <div class="row mb-3">
                                <div class="col-md-3">
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                                        <input type="text" class="form-control" id="movementSearch" placeholder="البحث في الحركات...">
                                    </div>
                                </div>
                                <div class="col-md-2">
                                    <input type="date" class="form-control" id="movementDateFrom" placeholder="من تاريخ">
                                </div>
                                <div class="col-md-2">
                                    <input type="date" class="form-control" id="movementDateTo" placeholder="إلى تاريخ">
                                </div>
                                <div class="col-md-2">
                                    <select class="form-select" id="movementTypeFilter">
                                        <option value="">جميع الأنواع</option>
                                        <option value="in">دخول</option>
                                        <option value="out">خروج</option>
                                        <option value="transfer">نقل</option>
                                        <option value="adjustment">تعديل</option>
                                    </select>
                                </div>
                                <div class="col-md-2">
                                    <select class="form-select" id="movementWarehouseFilter">
                                        <option value="">جميع المستودعات</option>
                                    </select>
                                </div>
                                <div class="col-md-2">
                                    <label class="form-label small text-muted mb-1">عرض الكميات بوحدة:</label>
                                    <select class="form-select" id="movementUnitFilter">
                                        <option value="">جميع الوحدات (عرض بالوحدة الأساسية)</option>
                                    </select>
                                </div>
                                <div class="col-md-1">
                                    <button class="btn btn-outline-secondary" id="clearMovementFilters">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>

                            <!-- Movements Table -->
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-exchange-alt"></i> قائمة حركات المخزون</h5>
                                </div>
                                <div class="card-body">
                                    <div class="table-responsive">
                                        <table class="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>التاريخ</th>
                                                    <th>النوع</th>
                                                    <th>المنتج</th>
                                                    <th>الوحدة</th>
                                                    <th>الكمية</th>
                                                    <th>سعر الوحدة</th>
                                                    <th>التكلفة</th>
                                                    <th>رصيد قبل</th>
                                                    <th>رصيد بعد</th>
                                                    <th>المستودع</th>
                                                    <th>تاريخ الصلاحية</th>
                                                    <th>الرقم التسلسلي</th>
                                                    <th>المرجع</th>
                                                    <th>الإجراءات</th>
                                                </tr>
                                            </thead>
                                            <tbody id="movementsTable">
                                                <tr>
                                                    <td colspan="14" class="text-center text-muted">لا توجد حركات</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Warehouses Tab -->
                    <div class="tab-pane fade" id="warehouses" role="tabpanel">
                        <div class="warehouses-content">
                            <!-- Info Card -->
                            <div class="alert alert-info d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <i class="fas fa-info-circle me-2"></i>
                                    <strong>عرض المستودعات:</strong> يمكنك عرض المستودعات والمخزون حسب المستودع هنا. لإدارة المستودعات (إضافة/تعديل/حذف)، انتقل إلى وحدة إدارة المستودعات.
                                </div>
                                <button class="btn btn-primary" id="goToWarehousesModuleBtn">
                                    <i class="fas fa-warehouse"></i> الانتقال إلى إدارة المستودعات
                                </button>
                            </div>

                            <!-- Search and Filter -->
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                                        <input type="text" class="form-control" id="warehouseSearch" placeholder="البحث في المستودعات...">
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <select class="form-select" id="warehouseStatusFilter">
                                        <option value="">جميع الحالات</option>
                                        <option value="active">نشط</option>
                                        <option value="inactive">غير نشط</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <button class="btn btn-outline-secondary" id="clearWarehouseFilters">
                                        <i class="fas fa-times"></i> مسح الفلاتر
                                    </button>
                                </div>
                            </div>

                            <!-- Warehouses Table (View Only) -->
                            <div class="card">
                                <div class="card-header d-flex justify-content-between align-items-center">
                                    <h5 class="mb-0"><i class="fas fa-warehouse"></i> قائمة المستودعات</h5>
                                    <button class="btn btn-sm btn-outline-primary" id="viewWarehouseStockBtn">
                                        <i class="fas fa-boxes"></i> عرض المخزون حسب المستودع
                                    </button>
                                </div>
                                <div class="card-body">
                                    <div class="table-responsive">
                                        <table class="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>اسم المستودع</th>
                                                    <th>الموقع</th>
                                                    <th>المسؤول</th>
                                                    <th>عدد المنتجات</th>
                                                    <th>إجمالي المخزون</th>
                                                    <th>الحالة</th>
                                                    <th>الإجراءات</th>
                                                </tr>
                                            </thead>
                                            <tbody id="warehousesTable">
                                                <tr>
                                                    <td colspan="7" class="text-center text-muted">جاري التحميل...</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Reports Tab -->
                    <div class="tab-pane fade" id="reports" role="tabpanel">
                        <div class="reports-content">
                            <!-- Report Filters -->
                            <div class="row mb-3">
                                <div class="col-md-3">
                                    <input type="date" class="form-control" id="reportDateFrom" placeholder="من تاريخ">
                                </div>
                                <div class="col-md-3">
                                    <input type="date" class="form-control" id="reportDateTo" placeholder="إلى تاريخ">
                                </div>
                                <div class="col-md-3">
                                    <select class="form-select" id="reportType">
                                        <option value="stock_status">حالة المخزون</option>
                                        <option value="stock_movement">حركة المخزون</option>
                                        <option value="low_stock">منتجات منخفضة المخزون</option>
                                        <option value="expired_products">منتجات منتهية الصلاحية</option>
                                        <option value="warehouse_summary">ملخص المستودعات</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <button class="btn btn-primary" id="generateInventoryReport">
                                        <i class="fas fa-chart-line"></i> توليد التقرير
                                    </button>
                                </div>
                            </div>

                            <!-- Report Content -->
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-chart-line"></i> التقرير</h5>
                                </div>
                                <div class="card-body">
                                    <div id="inventoryReportContent">
                                        <div class="text-center text-muted">
                                            <i class="fas fa-chart-line fa-3x mb-3"></i>
                                            <p>اختر نوع التقرير واضغط على "توليد التقرير"</p>
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
        console.log('📦 Loading inventory module...');
        this.render();
        await this.loadData();
        
        // Setup real-time sync
        this.setupInventorySync();
        
        console.log('✅ Inventory module loaded');
    },

    async loadData() {
        try {
            await this.loadProducts();
            await this.loadUnits(); // Load units before movements (movements need units for display)
            await this.loadMovements();
            await this.loadWarehouses();
            this.updateDashboard();
            this.updateUnitFilters();
        } catch (error) {
            console.error('Error loading inventory data:', error);
        }
    },

    async loadProducts() {
        try {
            const products = await Collections.getProducts();
            this.products = products;
            await this.renderProductsTable();
            this.updateProductFilters();
        } catch (error) {
            console.error('Error loading products:', error);
        }
    },

    async loadMovements() {
        try {
            const snapshot = await db.collection('inventoryMovements').get();
            this.movements = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            this.renderMovementsTable();
            this.updateUnitFilters(); // Update unit filters when movements are loaded
        } catch (error) {
            console.error('Error loading movements:', error);
        }
    },

    async loadWarehouses() {
        try {
            const warehouses = await Collections.getWarehouses();
            this.warehouses = warehouses;
            this.renderWarehousesTable();
            this.updateWarehouseFilters();
        } catch (error) {
            console.error('Error loading warehouses:', error);
        }
    },

    async loadUnits() {
        try {
            const units = await Collections.getUnits();
            this.units = Array.isArray(units) ? units : [];
        } catch (error) {
            console.error('Error loading units:', error);
            this.units = []; // Ensure units is always an array
        }
    },

    updateDashboard() {
        // إجمالي المنتجات
        const totalProductsEl = document.getElementById('totalProducts');
        if (totalProductsEl) {
            totalProductsEl.textContent = this.products.length;
        }
        
        // المنتجات منخفضة المخزون
        const lowStockProducts = this.products.filter(p => 
            (p.currentStock || 0) <= (p.minStock || 0)
        ).length;
        const lowStockEl = document.getElementById('lowStockProducts');
        if (lowStockEl) {
            lowStockEl.textContent = lowStockProducts;
        }
        
        // إجمالي المستودعات
        const totalWarehousesEl = document.getElementById('totalWarehouses');
        if (totalWarehousesEl) {
            totalWarehousesEl.textContent = this.warehouses.length;
        }
        
        // إجمالي الحركات
        const totalMovementsEl = document.getElementById('totalMovements');
        if (totalMovementsEl) {
            totalMovementsEl.textContent = this.movements.length;
        }
        
        // إجمالي كمية وقيمة المخزون (كل المستودعات)
        let totalStockQuantity = 0;
        let totalStockValue = 0;
        this.products.forEach(product => {
            const qty = product.currentStock || 0;
            const price = product.purchasePrice || product.costPrice || 0;
            totalStockQuantity += qty;
            totalStockValue += qty * price;
        });
        
        const totalStockQtyEl = document.getElementById('totalStockQuantity');
        if (totalStockQtyEl) {
            totalStockQtyEl.textContent = formatNumber(totalStockQuantity || 0);
        }
        
        const totalStockValueEl = document.getElementById('totalStockValue');
        if (totalStockValueEl) {
            totalStockValueEl.textContent = formatNumber(totalStockValue || 0);
        }
        
        // آخر الحركات
        this.renderRecentMovements();
        // ملخص المخزون حسب المستودع
        this.renderWarehouseStockSummary();
    },

    async renderProductsTable() {
        const tbody = document.getElementById('productsTable');
        if (!tbody) return;

        if (this.products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">لا توجد منتجات</td></tr>';
            return;
        }

        // Get warehouses for stock display
        const warehouses = await Collections.getWarehouses();
        
        tbody.innerHTML = this.products.map(product => {
            const currentStock = product.currentStock || 0;
            const minStock = product.minStock || 0;
            const stockStatus = currentStock === 0 ? 'out' : currentStock <= minStock ? 'low' : 'normal';
            const stockClass = stockStatus === 'out' ? 'danger' : stockStatus === 'low' ? 'warning' : 'success';
            const stockText = stockStatus === 'out' ? 'نفد' : stockStatus === 'low' ? 'منخفض' : 'عادي';
            
            // Get warehouse stock breakdown
            const warehouseStock = product.warehouseStock || {};
            const warehouseStockInfo = warehouses
                .filter(w => warehouseStock[w.id] > 0)
                .map(w => `${w.name}: ${formatNumber(warehouseStock[w.id] || 0)}`)
                .join(', ') || 'لا يوجد مخزون';
            
            return `
                <tr>
                    <td>${product.code || 'N/A'}</td>
                    <td>
                        <div>
                            <strong>${product.name || 'N/A'}</strong>
                            ${warehouseStockInfo !== 'لا يوجد مخزون' ? `<br><small class="text-muted">${warehouseStockInfo}</small>` : ''}
                        </div>
                    </td>
                    <td>${product.categoryName || 'N/A'}</td>
                    <td class="text-${stockClass}">
                        <strong>${formatNumber(currentStock)}</strong>
                    </td>
                    <td>${formatNumber(minStock)}</td>
                    <td><span class="badge bg-${product.status === 'active' ? 'success' : 'secondary'}">${product.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="InventoryModule.viewProduct('${product.id}')" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="InventoryModule.adjustStock('${product.id}')" title="تعديل المخزون">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="InventoryModule.recalculateProductStock('${product.id}')" title="إعادة حساب الرصيد من حركات المخزون">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    /**
     * Convert quantity from main unit to selected unit
     * تحويل الكمية من الوحدة الأساسية إلى الوحدة المختارة
     */
    convertQuantityToUnit(quantityInMainUnit, product, targetUnitId) {
        // Safety checks
        if (!product || !targetUnitId || quantityInMainUnit === 0 || quantityInMainUnit === null || quantityInMainUnit === undefined) {
            return { quantity: quantityInMainUnit || 0, unitName: 'N/A' };
        }

        // Ensure units array exists and is valid
        if (!this.units || !Array.isArray(this.units)) {
            return { quantity: quantityInMainUnit, unitName: 'N/A' };
        }

        // If target unit is main unit, return as is
        if (product.unitId === targetUnitId) {
            const mainUnit = this.units.find(u => u && u.id === product.unitId);
            return {
                quantity: quantityInMainUnit,
                unitName: mainUnit ? mainUnit.name : 'N/A'
            };
        }

        // Check if target unit is a sub-unit
        if (product.subUnits && Array.isArray(product.subUnits) && product.subUnits.length > 0) {
            // Check first sub-unit (second unit)
            if (product.subUnits[0] && product.subUnits[0].unitId === targetUnitId) {
                const subUnit = product.subUnits[0];
                const conversionFactor = subUnit.conversionFactor || 1;
                const conversionType = subUnit.conversionType || 'multiply';
                const unit = this.units.find(u => u && u.id === targetUnitId);
                
                let convertedQuantity;
                if (conversionFactor > 0) {
                    if (conversionType === 'multiply') {
                        // Convert from main to sub: divide by factor
                        // Example: 100 pieces / 10 = 10 boxes
                        convertedQuantity = quantityInMainUnit / conversionFactor;
                    } else {
                        // Convert from main to sub: multiply by factor
                        convertedQuantity = quantityInMainUnit * conversionFactor;
                    }
                } else {
                    convertedQuantity = quantityInMainUnit;
                }
                
                return {
                    quantity: convertedQuantity,
                    unitName: unit ? unit.name : 'N/A'
                };
            }
            
            // Check second sub-unit (third unit)
            if (product.subUnits[1] && product.subUnits[1].unitId === targetUnitId) {
                const subUnit = product.subUnits[1];
                const conversionFactor = subUnit.conversionFactor || 1;
                const conversionType = subUnit.conversionType || 'multiply';
                const unit = this.units.find(u => u && u.id === targetUnitId);
                
                let convertedQuantity;
                if (conversionFactor > 0) {
                    if (conversionType === 'multiply') {
                        convertedQuantity = quantityInMainUnit / conversionFactor;
                    } else {
                        convertedQuantity = quantityInMainUnit * conversionFactor;
                    }
                } else {
                    convertedQuantity = quantityInMainUnit;
                }
                
                return {
                    quantity: convertedQuantity,
                    unitName: unit ? unit.name : 'N/A'
                };
            }
        }

        // If unit not found in product, return main unit
        const mainUnit = this.units.find(u => u && u.id === product.unitId);
        return {
            quantity: quantityInMainUnit,
            unitName: mainUnit ? mainUnit.name : 'N/A'
        };
    },

    renderMovementsTable() {
        const tbody = document.getElementById('movementsTable');
        if (!tbody) return;

        if (this.movements.length === 0) {
            tbody.innerHTML = '<tr><td colspan="14" class="text-center text-muted">لا توجد حركات</td></tr>';
            return;
        }

        // Get selected unit filter
        const unitFilter = document.getElementById('movementUnitFilter')?.value || '';

        // Sort movements by date (newest first)
        const sortedMovements = [...this.movements].sort((a, b) => {
            const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || a.createdAt);
            const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || b.createdAt);
            return dateB - dateA;
        });

        tbody.innerHTML = sortedMovements.map(movement => {
            const typeClass = movement.type === 'in' ? 'success' : movement.type === 'out' ? 'danger' : movement.type === 'transfer' ? 'info' : 'warning';
            const typeText = movement.type === 'in' ? 'دخول' : movement.type === 'out' ? 'خروج' : movement.type === 'transfer' ? 'نقل' : 'تعديل';
            
            const movementDate = movement.date?.toDate ? movement.date.toDate() : new Date(movement.date || movement.createdAt);
            const quantityInMainUnit = movement.quantityInMainUnit || Math.abs(movement.quantity || 0);
            const previousQuantityInMainUnit = movement.previousQuantity || 0;
            const newQuantityInMainUnit = movement.newQuantity !== undefined ? movement.newQuantity : (previousQuantityInMainUnit + (movement.quantity || 0));
            const unitPrice = movement.unitPrice || 0;
            const totalCost = movement.totalCost || (quantityInMainUnit * unitPrice);
            
            // Get product for unit conversion (with safety checks)
            const product = (this.products && Array.isArray(this.products)) 
                ? this.products.find(p => p && p.id === movement.productId) 
                : null;
            
            // Convert quantities based on selected unit filter
            let displayQuantity, displayUnitName, displayPreviousQuantity, displayNewQuantity;
            
            if (unitFilter && product && this.units && Array.isArray(this.units)) {
                // Convert to selected unit
                const converted = this.convertQuantityToUnit(quantityInMainUnit, product, unitFilter);
                displayQuantity = converted.quantity;
                displayUnitName = converted.unitName;
                
                const convertedPrevious = this.convertQuantityToUnit(previousQuantityInMainUnit, product, unitFilter);
                displayPreviousQuantity = convertedPrevious.quantity;
                
                const convertedNew = this.convertQuantityToUnit(newQuantityInMainUnit, product, unitFilter);
                displayNewQuantity = convertedNew.quantity;
            } else {
                // Display in main unit (default)
                displayQuantity = quantityInMainUnit;
                displayPreviousQuantity = previousQuantityInMainUnit;
                displayNewQuantity = newQuantityInMainUnit;
                
                // Try to get unit name safely
                if (product && this.units && Array.isArray(this.units)) {
                    const mainUnit = this.units.find(u => u && u.id === product.unitId);
                    displayUnitName = mainUnit ? mainUnit.name : (movement.unitName || 'N/A');
                } else {
                    displayUnitName = movement.unitName || 'N/A';
                }
            }
            
            // Format expiry date
            const expiryDate = movement.expiryDate ? formatDate(new Date(movement.expiryDate)) : '-';
            const serialNumber = movement.serialNumber || '-';
            
            return `
                <tr>
                    <td>${formatDate(movementDate)}</td>
                    <td><span class="badge bg-${typeClass}">${typeText}</span></td>
                    <td><strong>${movement.productName || 'N/A'}</strong></td>
                    <td><small class="text-muted">${displayUnitName}</small></td>
                    <td class="text-${movement.quantity > 0 ? 'success' : 'danger'}">
                        <strong>${movement.quantity > 0 ? '+' : ''}${formatNumber(Math.abs(displayQuantity))}</strong>
                    </td>
                    <td>${unitPrice > 0 ? formatNumber(unitPrice) : '-'}</td>
                    <td><strong class="text-primary">${totalCost > 0 ? formatNumber(totalCost) : '-'}</strong></td>
                    <td><span class="badge bg-secondary">${formatNumber(displayPreviousQuantity)}</span></td>
                    <td><span class="badge bg-${newQuantityInMainUnit >= previousQuantityInMainUnit ? 'success' : 'warning'}">${formatNumber(displayNewQuantity)}</span></td>
                    <td>${movement.warehouseName || movement.warehouse || 'N/A'}</td>
                    <td><small>${expiryDate}</small></td>
                    <td><small class="text-muted">${serialNumber}</small></td>
                    <td>${movement.reference || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="InventoryModule.viewMovement('${movement.id}')" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    async renderWarehousesTable() {
        const tbody = document.getElementById('warehousesTable');
        if (!tbody) return;

        if (this.warehouses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">لا توجد مستودعات</td></tr>';
            return;
        }

        // Calculate total stock for each warehouse
        const warehouseStockData = {};
        this.products.forEach(product => {
            const warehouseStock = product.warehouseStock || {};
            Object.keys(warehouseStock).forEach(warehouseId => {
                if (!warehouseStockData[warehouseId]) {
                    warehouseStockData[warehouseId] = 0;
                }
                warehouseStockData[warehouseId] += warehouseStock[warehouseId] || 0;
            });
        });

        tbody.innerHTML = this.warehouses.map(warehouse => {
            const totalStock = warehouseStockData[warehouse.id] || 0;
            const productCount = this.products.filter(p => {
                const ws = p.warehouseStock || {};
                return ws[warehouse.id] > 0;
            }).length;
            
            return `
                <tr>
                    <td><strong>${warehouse.name || 'N/A'}</strong></td>
                    <td>${warehouse.location || 'N/A'}</td>
                    <td>${warehouse.manager || 'N/A'}</td>
                    <td><span class="badge bg-info">${productCount}</span></td>
                    <td><span class="badge bg-primary">${formatNumber(totalStock)}</span></td>
                    <td><span class="badge bg-${warehouse.status === 'active' ? 'success' : 'secondary'}">${warehouse.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="InventoryModule.viewWarehouseStock('${warehouse.id}')" title="عرض المخزون">
                            <i class="fas fa-boxes"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="InventoryModule.goToWarehousesModule('${warehouse.id}')" title="إدارة المستودع">
                            <i class="fas fa-cog"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    renderRecentMovements() {
        const tbody = document.getElementById('recentMovementsTable');
        if (!tbody) return;

        const recentMovements = this.movements.slice(0, 5);
        
        if (recentMovements.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">لا توجد حركات</td></tr>';
            return;
        }

        tbody.innerHTML = recentMovements.map(movement => {
            const typeClass = movement.type === 'in' ? 'success' : movement.type === 'out' ? 'danger' : movement.type === 'transfer' ? 'info' : 'warning';
            const typeText = movement.type === 'in' ? 'دخول' : movement.type === 'out' ? 'خروج' : movement.type === 'transfer' ? 'نقل' : 'تعديل';
            
            const movementDate = movement.date?.toDate ? movement.date.toDate() : new Date(movement.date || movement.createdAt);
            const quantity = movement.quantity || 0;
            
            return `
                <tr>
                    <td>${formatDate(movementDate)}</td>
                    <td><span class="badge bg-${typeClass}">${typeText}</span></td>
                    <td>${movement.productName || 'N/A'}</td>
                    <td class="text-${quantity > 0 ? 'success' : 'danger'}">${quantity > 0 ? '+' : ''}${formatNumber(Math.abs(quantity))}</td>
                    <td>${movement.warehouseName || movement.warehouse || 'N/A'}</td>
                    <td>${movement.reference || 'N/A'}</td>
                </tr>
            `;
        }).join('');
    },

    /**
     * Render warehouse stock summary in dashboard
     * ملخص المخزون حسب المستودع (كمية وقيمة)
     */
    renderWarehouseStockSummary() {
        const tbody = document.getElementById('warehouseStockSummaryBody');
        if (!tbody) return;

        if (!this.warehouses || this.warehouses.length === 0 || !this.products || this.products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">لا توجد بيانات مخزون</td></tr>';
            return;
        }

        // تجميع الكميات والقيم لكل مستودع
        const summaryMap = new Map();

        this.warehouses.forEach(wh => {
            summaryMap.set(wh.id, {
                warehouseId: wh.id,
                warehouseName: wh.name || 'بدون اسم',
                quantity: 0,
                value: 0
            });
        });

        this.products.forEach(product => {
            const warehouseStock = product.warehouseStock || {};
            const price = product.purchasePrice || product.costPrice || 0;

            Object.entries(warehouseStock).forEach(([warehouseId, qty]) => {
                const entry = summaryMap.get(warehouseId);
                if (!entry) return;
                const quantity = Number(qty) || 0;
                entry.quantity += quantity;
                entry.value += quantity * price;
            });
        });

        const rows = Array.from(summaryMap.values())
            // إظهار فقط المستودعات التي لديها حركة/مخزون أو كلها حسب الحاجة
            .filter(entry => entry.quantity !== 0 || entry.value !== 0 || this.products.length > 0)
            .sort((a, b) => a.warehouseName.localeCompare(b.warehouseName, 'ar'));

        if (rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">لا توجد بيانات مخزون</td></tr>';
            return;
        }

        tbody.innerHTML = rows.map(entry => `
            <tr>
                <td>${entry.warehouseName}</td>
                <td>${formatNumber(entry.quantity || 0)}</td>
                <td>${formatNumber(entry.value || 0)}</td>
            </tr>
        `).join('');
    },

    updateProductFilters() {
        const categoryFilter = document.getElementById('productCategoryFilter');
        if (categoryFilter) {
            const categories = [...new Set(this.products.map(p => p.categoryName).filter(Boolean))];
            categoryFilter.innerHTML = '<option value="">جميع الفئات</option>' + 
                categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        }
    },

    updateWarehouseFilters() {
        const warehouseFilter = document.getElementById('movementWarehouseFilter');
        if (warehouseFilter) {
            warehouseFilter.innerHTML = '<option value="">جميع المستودعات</option>' + 
                this.warehouses.map(wh => `<option value="${wh.id}">${wh.name}</option>`).join('');
        }
    },

    /**
     * Update unit filters based on movements
     * تحديث فلاتر الوحدات بناءً على الحركات
     */
    updateUnitFilters() {
        const unitFilter = document.getElementById('movementUnitFilter');
        if (!unitFilter) return;

        // Collect all unique units from products
        // الوحدة الأساسية = الوحدة الأولى
        // الوحدة الفرعية الأولى = الوحدة الثانية
        // الوحدة الفرعية الثانية = الوحدة الثالثة
        const unitsMap = new Map();
        
        // Add main units from products (الوحدة الأولى - الأساسية)
        this.products.forEach(product => {
            if (product.unitId && this.units && Array.isArray(this.units)) {
                const unit = this.units.find(u => u.id === product.unitId);
                if (unit && !unitsMap.has(unit.id)) {
                    unitsMap.set(unit.id, {
                        id: unit.id,
                        name: unit.name,
                        order: 1, // الوحدة الأولى - الأساسية
                        isMain: true,
                        productId: product.id // Store product ID for reference
                    });
                }
            }
        });

        // Add sub-units from products (الوحدة الثانية والثالثة)
        this.products.forEach(product => {
            if (product.subUnits && Array.isArray(product.subUnits) && this.units && Array.isArray(this.units)) {
                // الوحدة الفرعية الأولى (index 0) = الوحدة الثانية
                // الوحدة الفرعية الثانية (index 1) = الوحدة الثالثة
                product.subUnits.forEach((subUnit, index) => {
                    // Limit to first two sub-units only (second and third units)
                    if (index < 2) {
                        const unit = this.units.find(u => u.id === subUnit.unitId);
                        if (unit && !unitsMap.has(unit.id)) {
                            unitsMap.set(unit.id, {
                                id: unit.id,
                                name: unit.name,
                                order: index + 2, // 2 for first sub-unit, 3 for second sub-unit
                                isMain: false,
                                productId: product.id,
                                subUnitIndex: index,
                                conversionFactor: subUnit.conversionFactor || 1,
                                conversionType: subUnit.conversionType || 'multiply'
                            });
                        }
                    }
                });
            }
        });

        // Sort units: main units first (order 1), then first sub-unit (order 2), then second sub-unit (order 3)
        const sortedUnits = Array.from(unitsMap.values()).sort((a, b) => {
            return a.order - b.order;
        });

        // Build options with unit order labels
        let options = '<option value="">جميع الوحدات (عرض بالوحدة الأساسية)</option>';
        sortedUnits.forEach((unitData) => {
            let label = unitData.name;
            const orderNames = ['', 'الأولى', 'الثانية', 'الثالثة'];
            const orderName = orderNames[unitData.order] || `#${unitData.order}`;
            
            if (unitData.isMain) {
                label = `${unitData.name} (الوحدة ${orderName} - الأساسية)`;
            } else {
                label = `${unitData.name} (الوحدة ${orderName})`;
            }
            options += `<option value="${unitData.id}" data-order="${unitData.order}" data-is-main="${unitData.isMain}">${label}</option>`;
        });

        unitFilter.innerHTML = options;
    },

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('#inventoryTabs button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.currentTab = e.target.getAttribute('data-bs-target').replace('#', '');
            });
        });

        // Search functionality
        const productSearch = document.getElementById('productSearch');
        if (productSearch) {
            productSearch.addEventListener('input', (e) => {
                this.filterProducts(e.target.value);
            });
        }

        const movementSearch = document.getElementById('movementSearch');
        if (movementSearch) {
            movementSearch.addEventListener('input', () => {
                this.filterMovements();
            });
        }

        const warehouseSearch = document.getElementById('warehouseSearch');
        if (warehouseSearch) {
            warehouseSearch.addEventListener('input', (e) => {
                this.filterWarehouses(e.target.value);
            });
        }

        // Filter functionality
        const productCategoryFilter = document.getElementById('productCategoryFilter');
        if (productCategoryFilter) {
            productCategoryFilter.addEventListener('change', (e) => {
                this.filterProductsByCategory(e.target.value);
            });
        }

        const stockStatusFilter = document.getElementById('stockStatusFilter');
        if (stockStatusFilter) {
            stockStatusFilter.addEventListener('change', (e) => {
                this.filterProductsByStockStatus(e.target.value);
            });
        }

        const movementTypeFilter = document.getElementById('movementTypeFilter');
        if (movementTypeFilter) {
            movementTypeFilter.addEventListener('change', (e) => {
                this.filterMovements();
            });
        }

        // Date filters
        const movementDateFrom = document.getElementById('movementDateFrom');
        const movementDateTo = document.getElementById('movementDateTo');
        if (movementDateFrom) {
            movementDateFrom.addEventListener('change', () => {
                this.filterMovements();
            });
        }
        if (movementDateTo) {
            movementDateTo.addEventListener('change', () => {
                this.filterMovements();
            });
        }

        // Warehouse filter
        const movementWarehouseFilter = document.getElementById('movementWarehouseFilter');
        if (movementWarehouseFilter) {
            movementWarehouseFilter.addEventListener('change', () => {
                this.filterMovements();
            });
        }

        // Unit filter
        const movementUnitFilter = document.getElementById('movementUnitFilter');
        if (movementUnitFilter) {
            movementUnitFilter.addEventListener('change', () => {
                // عند تغيير الوحدة، نعيد عرض الجدول بتحويل الكميات وفق الوحدة المختارة
                // لا نفلتر الحركات، بل نعرضها جميعاً بتحويل الكميات
                this.filterMovements();
            });
        }

        // Clear filters
        const clearProductFilters = document.getElementById('clearProductFilters');
        if (clearProductFilters) {
            clearProductFilters.addEventListener('click', () => {
                this.clearProductFilters();
            });
        }

        const clearMovementFilters = document.getElementById('clearMovementFilters');
        if (clearMovementFilters) {
            clearMovementFilters.addEventListener('click', () => {
                this.clearMovementFilters();
            });
        }

        // Set default date filters to fiscal period (async, no await needed)
        this.setDefaultFiscalPeriodFilters().catch(err => {
            console.error('Error setting default fiscal period filters:', err);
        });

        const clearWarehouseFilters = document.getElementById('clearWarehouseFilters');
        if (clearWarehouseFilters) {
            clearWarehouseFilters.addEventListener('click', () => {
                this.clearWarehouseFilters();
            });
        }

        // Action buttons
        const newMovementBtn = document.getElementById('newMovementBtn');
        if (newMovementBtn) {
            newMovementBtn.addEventListener('click', () => {
                this.showNewMovementModal();
            });
        }

        // Navigation to Warehouses Module
        const goToWarehousesBtn = document.getElementById('goToWarehousesBtn');
        if (goToWarehousesBtn) {
            goToWarehousesBtn.addEventListener('click', () => {
                this.goToWarehousesModule();
            });
        }

        const goToWarehousesModuleBtn = document.getElementById('goToWarehousesModuleBtn');
        if (goToWarehousesModuleBtn) {
            goToWarehousesModuleBtn.addEventListener('click', () => {
                this.goToWarehousesModule();
            });
        }

        const viewWarehouseStockBtn = document.getElementById('viewWarehouseStockBtn');
        if (viewWarehouseStockBtn) {
            viewWarehouseStockBtn.addEventListener('click', () => {
                this.goToWarehousesModule('inventory');
            });
        }

        // Report generation
        const generateInventoryReport = document.getElementById('generateInventoryReport');
        if (generateInventoryReport) {
            generateInventoryReport.addEventListener('click', () => {
                this.generateInventoryReport();
            });
        }
    },

    async filterProducts(searchTerm) {
        const filteredProducts = this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
        await this.renderFilteredProducts(filteredProducts);
    },

    async filterProductsByCategory(category) {
        if (!category) {
            await this.renderProductsTable();
            return;
        }
        
        const filteredProducts = this.products.filter(product => product.categoryName === category);
        await this.renderFilteredProducts(filteredProducts);
    },

    async filterProductsByStockStatus(status) {
        if (!status) {
            await this.renderProductsTable();
            return;
        }
        
        const filteredProducts = this.products.filter(product => {
            const currentStock = product.currentStock || 0;
            const minStock = product.minStock || 0;
            
            switch (status) {
                case 'low':
                    return currentStock > 0 && currentStock <= minStock;
                case 'out':
                    return currentStock === 0;
                case 'normal':
                    return currentStock > minStock;
                default:
                    return true;
            }
        });
        await this.renderFilteredProducts(filteredProducts);
    },

    async renderFilteredProducts(products) {
        const tbody = document.getElementById('productsTable');
        if (!tbody) return;

        if (products.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">لا توجد منتجات</td></tr>';
            return;
        }

        // Get warehouses for stock display
        const warehouses = await Collections.getWarehouses();
        
        tbody.innerHTML = products.map(product => {
            const currentStock = product.currentStock || 0;
            const minStock = product.minStock || 0;
            const stockStatus = currentStock === 0 ? 'out' : currentStock <= minStock ? 'low' : 'normal';
            const stockClass = stockStatus === 'out' ? 'danger' : stockStatus === 'low' ? 'warning' : 'success';
            const stockText = stockStatus === 'out' ? 'نفد' : stockStatus === 'low' ? 'منخفض' : 'عادي';
            
            // Get warehouse stock breakdown
            const warehouseStock = product.warehouseStock || {};
            const warehouseStockInfo = warehouses
                .filter(w => warehouseStock[w.id] > 0)
                .map(w => `${w.name}: ${formatNumber(warehouseStock[w.id] || 0)}`)
                .join(', ') || 'لا يوجد مخزون';
            
            return `
                <tr>
                    <td>${product.code || 'N/A'}</td>
                    <td>
                        <div>
                            <strong>${product.name || 'N/A'}</strong>
                            ${warehouseStockInfo !== 'لا يوجد مخزون' ? `<br><small class="text-muted">${warehouseStockInfo}</small>` : ''}
                        </div>
                    </td>
                    <td>${product.categoryName || 'N/A'}</td>
                    <td class="text-${stockClass}">
                        <strong>${formatNumber(currentStock)}</strong>
                    </td>
                    <td>${formatNumber(minStock)}</td>
                    <td><span class="badge bg-${product.status === 'active' ? 'success' : 'secondary'}">${product.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="InventoryModule.viewProduct('${product.id}')" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="InventoryModule.adjustStock('${product.id}')" title="تعديل المخزون">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" onclick="InventoryModule.recalculateProductStock('${product.id}')" title="إعادة حساب الرصيد من حركات المخزون">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    filterMovements() {
        const searchTerm = document.getElementById('movementSearch')?.value || '';
        const typeFilter = document.getElementById('movementTypeFilter')?.value || '';
        const dateFrom = document.getElementById('movementDateFrom')?.value || '';
        const dateTo = document.getElementById('movementDateTo')?.value || '';
        const warehouseFilter = document.getElementById('movementWarehouseFilter')?.value || '';
        const unitFilter = document.getElementById('movementUnitFilter')?.value || '';
        
        let filteredMovements = [...this.movements];
        
        // Search filter
        if (searchTerm) {
            filteredMovements = filteredMovements.filter(movement => 
                (movement.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (movement.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (movement.serialNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Type filter
        if (typeFilter) {
            filteredMovements = filteredMovements.filter(movement => movement.type === typeFilter);
        }
        
        // ⚠️ IMPORTANT: لا نفلتر الحركات حسب الوحدة، بل نعرضها جميعاً ولكن بتحويل الكميات وفق الوحدة المختارة
        // Unit filter removed - we will display all movements but convert quantities based on selected unit
        
        // Date filters
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            fromDate.setHours(0, 0, 0, 0);
            filteredMovements = filteredMovements.filter(movement => {
                const movementDate = movement.date?.toDate ? movement.date.toDate() : new Date(movement.date || movement.createdAt);
                return movementDate >= fromDate;
            });
        }
        
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            filteredMovements = filteredMovements.filter(movement => {
                const movementDate = movement.date?.toDate ? movement.date.toDate() : new Date(movement.date || movement.createdAt);
                return movementDate <= toDate;
            });
        }
        
        // Warehouse filter
        if (warehouseFilter) {
            filteredMovements = filteredMovements.filter(movement => 
                movement.warehouseId === warehouseFilter || movement.warehouse === warehouseFilter
            );
        }
        
        // Pass selected unit filter to render function for quantity conversion
        this.renderFilteredMovements(filteredMovements, unitFilter);
    },

    filterMovementsByType(type) {
        this.filterMovements();
    },

    renderFilteredMovements(movements, selectedUnitId = '') {
        const tbody = document.getElementById('movementsTable');
        if (!tbody) return;

        if (movements.length === 0) {
            tbody.innerHTML = '<tr><td colspan="14" class="text-center text-muted">لا توجد حركات</td></tr>';
            return;
        }

        // Sort movements by date (newest first)
        const sortedMovements = [...movements].sort((a, b) => {
            const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date || a.createdAt);
            const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date || b.createdAt);
            return dateB - dateA;
        });

        tbody.innerHTML = sortedMovements.map(movement => {
            const typeClass = movement.type === 'in' ? 'success' : movement.type === 'out' ? 'danger' : movement.type === 'transfer' ? 'info' : 'warning';
            const typeText = movement.type === 'in' ? 'دخول' : movement.type === 'out' ? 'خروج' : movement.type === 'transfer' ? 'نقل' : 'تعديل';
            
            const movementDate = movement.date?.toDate ? movement.date.toDate() : new Date(movement.date || movement.createdAt);
            const quantityInMainUnit = movement.quantityInMainUnit || Math.abs(movement.quantity || 0);
            const previousQuantityInMainUnit = movement.previousQuantity || 0;
            const newQuantityInMainUnit = movement.newQuantity !== undefined ? movement.newQuantity : (previousQuantityInMainUnit + (movement.quantity || 0));
            const unitPrice = movement.unitPrice || 0;
            const totalCost = movement.totalCost || (quantityInMainUnit * unitPrice);
            
            // Get product for unit conversion (with safety checks)
            const product = (this.products && Array.isArray(this.products)) 
                ? this.products.find(p => p && p.id === movement.productId) 
                : null;
            
            // Convert quantities based on selected unit filter
            let displayQuantity, displayUnitName, displayPreviousQuantity, displayNewQuantity;
            
            if (selectedUnitId && product && this.units && Array.isArray(this.units)) {
                // Convert to selected unit
                const converted = this.convertQuantityToUnit(quantityInMainUnit, product, selectedUnitId);
                displayQuantity = converted.quantity;
                displayUnitName = converted.unitName;
                
                const convertedPrevious = this.convertQuantityToUnit(previousQuantityInMainUnit, product, selectedUnitId);
                displayPreviousQuantity = convertedPrevious.quantity;
                
                const convertedNew = this.convertQuantityToUnit(newQuantityInMainUnit, product, selectedUnitId);
                displayNewQuantity = convertedNew.quantity;
            } else {
                // Display in main unit (default)
                displayQuantity = quantityInMainUnit;
                displayPreviousQuantity = previousQuantityInMainUnit;
                displayNewQuantity = newQuantityInMainUnit;
                
                // Try to get unit name safely
                if (product && this.units && Array.isArray(this.units)) {
                    const mainUnit = this.units.find(u => u && u.id === product.unitId);
                    displayUnitName = mainUnit ? mainUnit.name : (movement.unitName || 'N/A');
                } else {
                    displayUnitName = movement.unitName || 'N/A';
                }
            }
            
            // Format expiry date
            const expiryDate = movement.expiryDate ? formatDate(new Date(movement.expiryDate)) : '-';
            const serialNumber = movement.serialNumber || '-';
            
            return `
                <tr>
                    <td>${formatDate(movementDate)}</td>
                    <td><span class="badge bg-${typeClass}">${typeText}</span></td>
                    <td><strong>${movement.productName || 'N/A'}</strong></td>
                    <td><small class="text-muted">${displayUnitName}</small></td>
                    <td class="text-${movement.quantity > 0 ? 'success' : 'danger'}">
                        <strong>${movement.quantity > 0 ? '+' : ''}${formatNumber(Math.abs(displayQuantity))}</strong>
                    </td>
                    <td>${unitPrice > 0 ? formatNumber(unitPrice) : '-'}</td>
                    <td><strong class="text-primary">${totalCost > 0 ? formatNumber(totalCost) : '-'}</strong></td>
                    <td><span class="badge bg-secondary">${formatNumber(displayPreviousQuantity)}</span></td>
                    <td><span class="badge bg-${newQuantityInMainUnit >= previousQuantityInMainUnit ? 'success' : 'warning'}">${formatNumber(displayNewQuantity)}</span></td>
                    <td>${movement.warehouseName || movement.warehouse || 'N/A'}</td>
                    <td><small>${expiryDate}</small></td>
                    <td><small class="text-muted">${serialNumber}</small></td>
                    <td>${movement.reference || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="InventoryModule.viewMovement('${movement.id}')" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    filterWarehouses(searchTerm) {
        const filteredWarehouses = this.warehouses.filter(warehouse => 
            warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            warehouse.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderFilteredWarehouses(filteredWarehouses);
    },

    renderFilteredWarehouses(warehouses) {
        const tbody = document.getElementById('warehousesTable');
        if (!tbody) return;

        if (warehouses.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">لا توجد مستودعات</td></tr>';
            return;
        }

        tbody.innerHTML = warehouses.map(warehouse => {
            const productCount = this.products.filter(p => p.warehouse === warehouse.id).length;
            
            return `
                <tr>
                    <td>${warehouse.name || 'N/A'}</td>
                    <td>${warehouse.location || 'N/A'}</td>
                    <td>${warehouse.manager || 'N/A'}</td>
                    <td>${productCount}</td>
                    <td><span class="badge bg-${warehouse.status === 'active' ? 'success' : 'secondary'}">${warehouse.status === 'active' ? 'نشط' : 'غير نشط'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="InventoryModule.viewWarehouse('${warehouse.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="InventoryModule.editWarehouse('${warehouse.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    },

    async clearProductFilters() {
        document.getElementById('productSearch').value = '';
        document.getElementById('productCategoryFilter').value = '';
        document.getElementById('productStatusFilter').value = '';
        document.getElementById('stockStatusFilter').value = '';
        await this.renderProductsTable();
    },

    clearMovementFilters() {
        const searchInput = document.getElementById('movementSearch');
        const dateFromInput = document.getElementById('movementDateFrom');
        const dateToInput = document.getElementById('movementDateTo');
        const typeFilter = document.getElementById('movementTypeFilter');
        const warehouseFilter = document.getElementById('movementWarehouseFilter');
        const unitFilter = document.getElementById('movementUnitFilter');
        
        if (searchInput) searchInput.value = '';
        if (dateFromInput) dateFromInput.value = '';
        if (dateToInput) dateToInput.value = '';
        if (typeFilter) typeFilter.value = '';
        if (warehouseFilter) warehouseFilter.value = '';
        if (unitFilter) unitFilter.value = '';
        
        // Reset to fiscal period defaults
        this.setDefaultFiscalPeriodFilters();
        this.renderMovementsTable();
    },

    clearWarehouseFilters() {
        document.getElementById('warehouseSearch').value = '';
        document.getElementById('warehouseStatusFilter').value = '';
        this.renderWarehousesTable();
    },

    async showNewMovementModal() {
        try {
            const products = await Collections.getProducts();
            const warehouses = await Collections.getWarehouses();
            const units = await Collections.getUnits();
            
            const content = `
                <form id="movementForm">
                    <div class="mb-3">
                        <label class="form-label">نوع الحركة *</label>
                        <select id="movementType" class="form-select" required>
                            <option value="">اختر النوع</option>
                            <option value="in">دخول</option>
                            <option value="out">خروج</option>
                            <option value="transfer">نقل</option>
                            <option value="adjustment">تعديل</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">المنتج *</label>
                        <select id="movementProduct" class="form-select" required>
                            <option value="">اختر المنتج</option>
                            ${products.map(p => `<option value="${p.id}" data-has-expiry="${p.hasExpiryDate || false}" data-has-serial="${p.hasSerialNumber || false}" data-unit-id="${p.unitId || ''}">${p.name} (${p.code || 'N/A'})</option>`).join('')}
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">المستودع *</label>
                        <select id="movementWarehouse" class="form-select" required>
                            <option value="">اختر المستودع</option>
                            ${warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="mb-3" id="transferToWarehouseContainer" style="display: none;">
                        <label class="form-label">نقل إلى مستودع</label>
                        <select id="transferToWarehouse" class="form-select">
                            <option value="">اختر المستودع</option>
                            ${warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">الوحدة *</label>
                        <select id="movementUnit" class="form-select" required>
                            <option value="">اختر الوحدة</option>
                        </select>
                        <small class="text-muted" id="unitConversionInfo"></small>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">الكمية *</label>
                        <input type="number" id="movementQuantity" class="form-control" min="0" step="0.01" required>
                        <small class="text-muted" id="quantityInMainUnit"></small>
                    </div>
                    <div class="mb-3" id="expiryDateContainer" style="display: none;">
                        <label class="form-label">تاريخ الصلاحية</label>
                        <input type="date" id="movementExpiryDate" class="form-control">
                    </div>
                    <div class="mb-3" id="serialNumberContainer" style="display: none;">
                        <label class="form-label">الرقم التسلسلي</label>
                        <input type="text" id="movementSerialNumber" class="form-control" placeholder="أدخل الرقم التسلسلي">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">سعر الوحدة</label>
                        <input type="number" id="movementUnitPrice" class="form-control" min="0" step="0.01" placeholder="سيتم ملؤه تلقائياً">
                        <small class="text-muted">سيتم استخدام سعر آخر شراء أو سعر التكلفة حسب الإعدادات</small>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">التكلفة الإجمالية</label>
                        <input type="number" id="movementTotalCost" class="form-control" min="0" step="0.01" readonly style="background-color: #f8f9fa;">
                        <small class="text-muted">يتم حسابها تلقائياً بناءً على طريقة حساب التكلفة المختارة</small>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">التاريخ *</label>
                        <input type="date" id="movementDate" class="form-control" required value="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">المرجع</label>
                        <input type="text" id="movementReference" class="form-control" placeholder="رقم المرجع أو الفاتورة">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">الملاحظات</label>
                        <textarea id="movementNotes" class="form-control" rows="3"></textarea>
                    </div>
                </form>
            `;
            
            const result = await Swal.fire({
                title: 'إضافة حركة مخزون جديدة',
                html: content,
                width: 600,
                showCancelButton: true,
                confirmButtonText: 'حفظ',
                cancelButtonText: 'إلغاء',
                focusConfirm: false,
                didOpen: async () => {
                    const typeSelect = document.getElementById('movementType');
                    const transferContainer = document.getElementById('transferToWarehouseContainer');
                    const productSelect = document.getElementById('movementProduct');
                    const unitSelect = document.getElementById('movementUnit');
                    const expiryContainer = document.getElementById('expiryDateContainer');
                    const serialContainer = document.getElementById('serialNumberContainer');
                    const quantityInput = document.getElementById('movementQuantity');
                    const unitPriceInput = document.getElementById('movementUnitPrice');
                    const totalCostInput = document.getElementById('movementTotalCost');
                    const dateInput = document.getElementById('movementDate');
                    
                    // Set default date to today
                    if (dateInput) {
                        dateInput.value = new Date().toISOString().split('T')[0];
                    }
                    
                    // Movement type change handler
                    if (typeSelect) {
                        typeSelect.addEventListener('change', (e) => {
                            if (e.target.value === 'transfer') {
                                transferContainer.style.display = 'block';
                            } else {
                                transferContainer.style.display = 'none';
                            }
                        });
                    }
                    
                    // Product change handler
                    if (productSelect) {
                        productSelect.addEventListener('change', async (e) => {
                            const productId = e.target.value;
                            if (!productId) {
                                unitSelect.innerHTML = '<option value="">اختر الوحدة</option>';
                                expiryContainer.style.display = 'none';
                                serialContainer.style.display = 'none';
                                return;
                            }
                            
                            const selectedOption = productSelect.options[productSelect.selectedIndex];
                            const hasExpiry = selectedOption.dataset.hasExpiry === 'true';
                            const hasSerial = selectedOption.dataset.hasSerial === 'true';
                            const mainUnitId = selectedOption.dataset.unitId;
                            
                            // Show/hide expiry and serial fields
                            expiryContainer.style.display = hasExpiry ? 'block' : 'none';
                            serialContainer.style.display = hasSerial ? 'block' : 'none';
                            
                            // Load product to get units
                            const product = await Collections.getProduct(productId);
                            if (product) {
                                // Populate units dropdown
                                let unitOptions = '<option value="">اختر الوحدة</option>';
                                
                                // Add main unit
                                const mainUnit = units.find(u => u.id === mainUnitId);
                                if (mainUnit) {
                                    unitOptions += `<option value="${mainUnit.id}" data-is-main="true" data-conversion="1">${mainUnit.name} (الوحدة الأساسية)</option>`;
                                }
                                
                                // Add sub-units
                                if (product.subUnits && Array.isArray(product.subUnits)) {
                                    product.subUnits.forEach(subUnit => {
                                        const subUnitObj = units.find(u => u.id === subUnit.unitId);
                                        if (subUnitObj) {
                                            unitOptions += `<option value="${subUnit.unitId}" data-is-main="false" data-conversion="${subUnit.conversionFactor || 1}">${subUnitObj.name} (${subUnit.conversionFactor || 1} ${subUnitObj.name} = 1 ${mainUnit?.name || 'وحدة أساسية'})</option>`;
                                        }
                                    });
                                }
                                
                                unitSelect.innerHTML = unitOptions;
                                
                                // Load pricing
                                await this.loadMovementPricing(productId, null, null, null);
                            }
                        });
                    }
                    
                    // Unit change handler - update quantity conversion
                    if (unitSelect && quantityInput) {
                        unitSelect.addEventListener('change', () => {
                            this.updateMovementQuantityConversion();
                        });
                        
                        quantityInput.addEventListener('input', () => {
                            this.updateMovementQuantityConversion();
                            this.calculateMovementTotalCost();
                        });
                    }
                    
                    // Unit price change handler
                    if (unitPriceInput) {
                        unitPriceInput.addEventListener('input', () => {
                            this.calculateMovementTotalCost();
                        });
                    }
                },
                preConfirm: () => {
                    const form = document.getElementById('movementForm');
                    if (!form.checkValidity()) {
                        Swal.showValidationMessage('يرجى ملء جميع الحقول المطلوبة');
                        return false;
                    }
                    
                    const productId = document.getElementById('movementProduct').value;
                    const unitId = document.getElementById('movementUnit').value;
                    const quantity = parseFloat(document.getElementById('movementQuantity').value);
                    const expiryDate = document.getElementById('movementExpiryDate').value;
                    const serialNumber = document.getElementById('movementSerialNumber').value;
                    
                    // Validate expiry date if product requires it
                    const productSelect = document.getElementById('movementProduct');
                    const selectedProduct = productSelect.options[productSelect.selectedIndex];
                    if (selectedProduct && selectedProduct.dataset.hasExpiry === 'true' && !expiryDate) {
                        Swal.showValidationMessage('يجب إدخال تاريخ الصلاحية لهذا المنتج');
                        return false;
                    }
                    
                    // Validate serial number if product requires it
                    if (selectedProduct && selectedProduct.dataset.hasSerial === 'true' && !serialNumber) {
                        Swal.showValidationMessage('يجب إدخال الرقم التسلسلي لهذا المنتج');
                        return false;
                    }
                    
                    return {
                        type: document.getElementById('movementType').value,
                        productId: productId,
                        warehouseId: document.getElementById('movementWarehouse').value,
                        toWarehouseId: document.getElementById('transferToWarehouse').value,
                        unitId: unitId,
                        quantity: quantity,
                        quantityInMainUnit: parseFloat(document.getElementById('quantityInMainUnit')?.textContent.replace(/[^0-9.]/g, '') || quantity),
                        expiryDate: expiryDate || null,
                        serialNumber: serialNumber || null,
                        unitPrice: parseFloat(document.getElementById('movementUnitPrice').value) || 0,
                        totalCost: parseFloat(document.getElementById('movementTotalCost').value) || 0,
                        date: document.getElementById('movementDate').value,
                        reference: document.getElementById('movementReference').value,
                        notes: document.getElementById('movementNotes').value
                    };
                }
            });
            
            if (result.isConfirmed && result.value) {
                await this.saveMovement(result.value);
            }
        } catch (error) {
            console.error('Error showing movement modal:', error);
            showError('فشل في فتح نافذة إضافة الحركة: ' + error.message);
        }
    },
    
    async saveMovement(movementData) {
        try {
            showLoading();
            
            const productDoc = await Collections.getProduct(movementData.productId);
            if (!productDoc) {
                throw new Error('المنتج غير موجود');
            }
            
            const warehouse = await Collections.getWarehouse(movementData.warehouseId);
            if (!warehouse) {
                throw new Error('المستودع غير موجود');
            }
            
            // Get current stock
            const currentStock = await Collections.getProductWarehouseStock(movementData.productId);
            const stockInWarehouse = currentStock?.[movementData.warehouseId] || 0;
            
            // Convert quantity to main unit if needed (calculate once at the beginning)
            let quantityInMainUnit = movementData.quantityInMainUnit || movementData.quantity;
            const product = this.products.find(p => p.id === movementData.productId) || productDoc;
            if (product && movementData.unitId && movementData.unitId !== product.unitId) {
                const subUnit = product.subUnits?.find(su => su.unitId === movementData.unitId);
                if (subUnit && subUnit.conversionFactor) {
                    const conversionType = subUnit.conversionType || 'multiply';
                    if (conversionType === 'multiply') {
                        quantityInMainUnit = movementData.quantity * subUnit.conversionFactor;
                    } else if (conversionType === 'divide') {
                        quantityInMainUnit = movementData.quantity / subUnit.conversionFactor;
                    } else {
                        quantityInMainUnit = movementData.quantity * subUnit.conversionFactor;
                    }
                }
            }
            
            let newQuantity = stockInWarehouse;
            let operation = 'set';
            
            switch(movementData.type) {
                case 'in':
                    newQuantity = stockInWarehouse + quantityInMainUnit;
                    operation = 'add';
                    break;
                case 'out':
                    if (stockInWarehouse < quantityInMainUnit) {
                        throw new Error(`الكمية المتاحة غير كافية. المتاح: ${stockInWarehouse}`);
                    }
                    newQuantity = stockInWarehouse - quantityInMainUnit;
                    operation = 'subtract';
                    break;
                case 'transfer':
                    if (!movementData.toWarehouseId) {
                        throw new Error('يجب اختيار مستودع الوجهة');
                    }
                    if (stockInWarehouse < quantityInMainUnit) {
                        throw new Error(`الكمية المتاحة غير كافية. المتاح: ${stockInWarehouse}`);
                    }
                    
                    // Subtract from source warehouse - use quantityInMainUnit
                    await Collections.updateProductWarehouseStock(
                        movementData.productId,
                        movementData.warehouseId,
                        quantityInMainUnit,
                        'subtract'
                    );
                    // Add to destination warehouse - use quantityInMainUnit
                    await Collections.updateProductWarehouseStock(
                        movementData.productId,
                        movementData.toWarehouseId,
                        quantityInMainUnit,
                        'add'
                    );
                    newQuantity = stockInWarehouse - quantityInMainUnit;
                    break;
                case 'adjustment':
                    newQuantity = quantityInMainUnit;
                    operation = 'set';
                    break;
            }
            
            // Update stock if not transfer (transfer already handled) - use quantityInMainUnit
            if (movementData.type !== 'transfer') {
                await Collections.updateProductWarehouseStock(
                    movementData.productId,
                    movementData.warehouseId,
                    quantityInMainUnit,
                    operation
                );
            }
            
            // Save movement record
            const movementRecord = {
                type: movementData.type,
                productId: movementData.productId,
                productName: product.name,
                warehouseId: movementData.warehouseId,
                warehouseName: warehouse.name,
                fromWarehouseId: null,
                fromWarehouseName: null,
                toWarehouseId: movementData.toWarehouseId || null,
                toWarehouseName: movementData.toWarehouseId ? (await Collections.getWarehouse(movementData.toWarehouseId))?.name : null,
                unitId: movementData.unitId || product.unitId,
                quantity: quantityInMainUnit, // ✅ قيمة موجبة دائماً (type يحدد الاتجاه)
                quantityInMainUnit: quantityInMainUnit,
                expiryDate: movementData.expiryDate || null,
                serialNumber: movementData.serialNumber || null,
                unitPrice: movementData.unitPrice || 0,
                totalCost: movementData.totalCost || 0,
                previousQuantity: stockInWarehouse,
                newQuantity: newQuantity,
                reference: movementData.reference || '',
                notes: movementData.notes || '',
                date: movementData.date ? new Date(movementData.date) : new Date(),
                userId: auth.currentUser?.uid || 'system',
                createdAt: new Date(),
                sourceType: 'inventory', // ✅ إدارة المخزون هي المصدر لحركات النقل والتعديلات اليدوية
                sourceId: null // حركات يدوية ليس لها sourceId
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
            
            // Reload data
            await this.loadMovements();
            await this.loadProducts();
            this.updateDashboard();
            
            hideLoading();
            showSuccess('تم إضافة حركة المخزون بنجاح');
        } catch (error) {
            console.error('Error saving movement:', error);
            hideLoading();
            showError('فشل في حفظ الحركة: ' + error.message);
        }
    },

    showNewWarehouseModal() {
        // Redirect to warehouses module to add new warehouse
        this.goToWarehousesModule(null, 'warehouses');
        setTimeout(() => {
            if (typeof WarehousesModule !== 'undefined' && typeof WarehousesModule.showAddWarehouseModal === 'function') {
                WarehousesModule.showAddWarehouseModal();
            }
        }, 500);
    },

    generateInventoryReport() {
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

    async viewProduct(productId) {
        try {
            // ✅ الحصول على أحدث بيانات المنتج من قاعدة البيانات لضمان دقة currentStock
            const product = await Collections.getProduct(productId);
            if (!product) {
                showError('المنتج غير موجود');
                return;
            }
            
            const warehouses = await Collections.getWarehouses();
            const warehouseStock = product.warehouseStock || {};
            
            // ✅ حساب الرصيد الإجمالي من warehouseStock للتأكد من دقته
            const calculatedTotalStock = Object.values(warehouseStock).reduce((sum, stock) => sum + (stock || 0), 0);
            const displayedStock = product.currentStock || calculatedTotalStock || 0;
            
            // ✅ تحذير إذا كان هناك اختلاف بين currentStock و warehouseStock
            const stockDifference = Math.abs(displayedStock - calculatedTotalStock);
            const stockWarning = stockDifference > 0.01 ? `
                <div class="alert alert-warning mt-2 mb-0">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>تنبيه:</strong> يوجد اختلاف بين الرصيد المسجل (${formatNumber(displayedStock)}) والرصيد المحسوب من المستودعات (${formatNumber(calculatedTotalStock)}).
                    <br>
                    <button class="btn btn-sm btn-outline-primary mt-2" onclick="Swal.close(); InventoryModule.recalculateProductStock('${productId}');">
                        <i class="fas fa-sync-alt"></i> إعادة حساب الرصيد
                    </button>
                </div>
            ` : '';
            
            const warehouseStockHTML = warehouses.length > 0 ? `
                <h6 class="mt-3 mb-2">المخزون حسب المستودع:</h6>
                <table class="table table-sm table-bordered">
                    <thead>
                        <tr>
                            <th>المستودع</th>
                            <th>الكمية</th>
                            <th>القيمة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${warehouses.map(w => {
                            const stock = warehouseStock[w.id] || 0;
                            const value = stock * (product.purchasePrice || 0);
                            return `
                                <tr>
                                    <td>${w.name}</td>
                                    <td>${formatNumber(stock)}</td>
                                    <td>${formatCurrency(value)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="table-info">
                            <th>الإجمالي</th>
                            <th>${formatNumber(calculatedTotalStock)}</th>
                            <th>${formatCurrency(calculatedTotalStock * (product.purchasePrice || 0))}</th>
                        </tr>
                    </tfoot>
                </table>
            ` : '';
            
            Swal.fire({
                title: product.name,
                html: `
                    <div class="text-start">
                        <p><strong>كود المنتج:</strong> ${product.code || 'N/A'}</p>
                        <p><strong>الفئة:</strong> ${product.categoryName || 'N/A'}</p>
                        <p><strong>الكمية الإجمالية (currentStock):</strong> <strong class="text-primary">${formatNumber(displayedStock)}</strong></p>
                        <p><strong>الحد الأدنى:</strong> ${formatNumber(product.minStock || 0)}</p>
                        <p><strong>سعر الشراء:</strong> ${formatCurrency(product.purchasePrice || 0)}</p>
                        <p><strong>سعر البيع:</strong> ${formatCurrency(product.sellingPrice || 0)}</p>
                        <p><strong>الحالة:</strong> ${product.status === 'active' ? 'نشط' : 'غير نشط'}</p>
                        ${stockWarning}
                        ${warehouseStockHTML}
                    </div>
                `,
                width: 700,
                icon: 'info',
                showConfirmButton: true,
                confirmButtonText: 'إعادة حساب الرصيد',
                showCancelButton: true,
                cancelButtonText: 'إغلاق'
            }).then((result) => {
                if (result.isConfirmed) {
                    // إعادة حساب الرصيد عند الضغط على الزر
                    this.recalculateProductStock(productId);
                }
            });
        } catch (error) {
            console.error('Error viewing product:', error);
            showError('فشل في عرض المنتج: ' + error.message);
        }
    },

    async adjustStock(productId) {
        try {
            const product = await Collections.getProduct(productId);
            if (!product) {
                showError('المنتج غير موجود');
                return;
            }
            
            const warehouses = await Collections.getWarehouses();
            const currentStock = await Collections.getProductWarehouseStock(productId);
            
            const warehouseOptions = warehouses.map(w => {
                const stock = currentStock?.[w.id] || 0;
                return `<option value="${w.id}">${w.name} (المتاح: ${formatNumber(stock)})</option>`;
            }).join('');
            
            const content = `
                <form id="adjustStockForm">
                    <div class="mb-3">
                        <label class="form-label">المستودع *</label>
                        <select id="adjustWarehouse" class="form-select" required>
                            <option value="">اختر المستودع</option>
                            ${warehouseOptions}
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">الكمية الجديدة *</label>
                        <input type="number" id="adjustQuantity" class="form-control" min="0" step="0.01" required>
                        <small class="form-text text-muted">أدخل الكمية الجديدة للمخزون</small>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">سبب التعديل</label>
                        <textarea id="adjustReason" class="form-control" rows="3" placeholder="مثال: جرد سنوي، تلف، إلخ"></textarea>
                    </div>
                </form>
            `;
            
            const result = await Swal.fire({
                title: `تعديل مخزون: ${product.name}`,
                html: content,
                width: 600,
                showCancelButton: true,
                confirmButtonText: 'حفظ',
                cancelButtonText: 'إلغاء',
                focusConfirm: false,
                preConfirm: () => {
                    const form = document.getElementById('adjustStockForm');
                    if (!form.checkValidity()) {
                        Swal.showValidationMessage('يرجى ملء جميع الحقول المطلوبة');
                        return false;
                    }
                    
                    return {
                        warehouseId: document.getElementById('adjustWarehouse').value,
                        quantity: parseFloat(document.getElementById('adjustQuantity').value),
                        reason: document.getElementById('adjustReason').value
                    };
                }
            });
            
            if (result.isConfirmed && result.value) {
                await this.saveStockAdjustment(productId, product, result.value);
            }
        } catch (error) {
            console.error('Error adjusting stock:', error);
            showError('فشل في تعديل المخزون: ' + error.message);
        }
    },
    
    async saveStockAdjustment(productId, product, adjustmentData) {
        try {
            showLoading();
            
            const warehouse = await Collections.getWarehouse(adjustmentData.warehouseId);
            if (!warehouse) {
                throw new Error('المستودع غير موجود');
            }
            
            // Get current stock
            const currentStock = await Collections.getProductWarehouseStock(productId);
            const previousQuantity = currentStock?.[adjustmentData.warehouseId] || 0;
            
            // Update stock
            await Collections.updateProductWarehouseStock(
                productId,
                adjustmentData.warehouseId,
                adjustmentData.quantity,
                'set'
            );
            
            // Save movement record
            const movementRecord = {
                type: 'adjustment',
                productId: productId,
                productName: product.name,
                warehouseId: adjustmentData.warehouseId,
                warehouseName: warehouse.name,
                quantity: adjustmentData.quantity - previousQuantity,
                previousQuantity: previousQuantity,
                newQuantity: adjustmentData.quantity,
                reference: 'تعديل يدوي',
                notes: adjustmentData.reason || 'تعديل مخزون يدوي',
                date: new Date(),
                userId: auth.currentUser?.uid || 'system',
                createdAt: new Date(),
                sourceType: 'inventory', // ✅ إدارة المخزون هي المصدر لحركات التعديل اليدوية
                sourceId: null // حركات يدوية ليس لها sourceId
            };
            
            await db.collection('inventoryMovements').add(movementRecord);
            
            // Reload data
            await this.loadMovements();
            await this.loadProducts();
            this.updateDashboard();
            
            hideLoading();
            showSuccess('تم تعديل المخزون بنجاح');
        } catch (error) {
            console.error('Error saving stock adjustment:', error);
            hideLoading();
            showError('فشل في حفظ التعديل: ' + error.message);
        }
    },

    /**
     * Recalculate product stock from inventoryMovements
     * إعادة حساب رصيد المنتج من حركات المخزون
     */
    async recalculateProductStock(productId) {
        try {
            const result = await Swal.fire({
                title: 'إعادة حساب الرصيد',
                text: 'هل تريد إعادة حساب رصيد هذا المنتج من حركات المخزون؟ سيتم تحديث رصيد المنتج في جميع المستودعات بناءً على حركات المخزون الفعلية.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'نعم، إعادة الحساب',
                cancelButtonText: 'إلغاء'
            });

            if (!result.isConfirmed) {
                return;
            }

            showLoading();

            // Recalculate stock from inventoryMovements
            const updatedWarehouseStock = await Collections.recalculateProductWarehouseStock(productId);

            // Reload products to show updated stock
            await this.loadProducts();
            this.updateDashboard();

            hideLoading();

            // Show success message with updated stock info
            const warehouseInfo = Object.entries(updatedWarehouseStock)
                .map(([warehouseId, quantity]) => {
                    const warehouse = this.warehouses.find(w => w.id === warehouseId);
                    return `${warehouse ? warehouse.name : warehouseId}: ${formatNumber(quantity)}`;
                })
                .join(', ') || 'لا يوجد مخزون';

            showSuccess(`تم إعادة حساب رصيد المنتج بنجاح. الرصيد الحالي: ${warehouseInfo}`);
        } catch (error) {
            console.error('Error recalculating product stock:', error);
            hideLoading();
            showError('فشل في إعادة حساب الرصيد: ' + error.message);
        }
    },

    /**
     * Update quantity conversion when unit or quantity changes
     * تحديث تحويل الكمية عند تغيير الوحدة أو الكمية
     */
    updateMovementQuantityConversion() {
        const productSelect = document.getElementById('movementProduct');
        const unitSelect = document.getElementById('movementUnit');
        const quantityInput = document.getElementById('movementQuantity');
        const quantityInMainUnitDisplay = document.getElementById('quantityInMainUnit');
        
        if (!productSelect || !unitSelect || !quantityInput) return;
        
        const productId = productSelect.value;
        const unitId = unitSelect.value;
        const quantity = parseFloat(quantityInput.value) || 0;
        
        if (!productId || !unitId || quantity <= 0) {
            if (quantityInMainUnitDisplay) {
                quantityInMainUnitDisplay.textContent = '';
            }
            return;
        }
        
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const selectedOption = unitSelect.options[unitSelect.selectedIndex];
        const isMain = selectedOption?.dataset.isMain === 'true';
        const conversionFactor = parseFloat(selectedOption?.dataset.conversion) || 1;
        
        let quantityInMainUnit = quantity;
        
        if (!isMain && product.subUnits) {
            const subUnit = product.subUnits.find(su => su.unitId === unitId);
            if (subUnit) {
                const conversionType = subUnit.conversionType || 'multiply';
                if (conversionType === 'multiply') {
                    quantityInMainUnit = quantity * (subUnit.conversionFactor || conversionFactor);
                } else if (conversionType === 'divide') {
                    quantityInMainUnit = quantity / (subUnit.conversionFactor || conversionFactor);
                } else {
                    quantityInMainUnit = quantity * (subUnit.conversionFactor || conversionFactor);
                }
            }
        }
        
        if (quantityInMainUnitDisplay) {
            if (quantityInMainUnit !== quantity) {
                const mainUnit = this.units.find(u => u.id === product.unitId);
                const mainUnitName = mainUnit ? mainUnit.name : 'أساسي';
                quantityInMainUnitDisplay.textContent = `= ${formatNumber(quantityInMainUnit)} ${mainUnitName}`;
                quantityInMainUnitDisplay.style.display = 'block';
            } else {
                quantityInMainUnitDisplay.textContent = '';
                quantityInMainUnitDisplay.style.display = 'none';
            }
        }
    },

    /**
     * Calculate movement total cost
     * حساب التكلفة الإجمالية للحركة
     */
    calculateMovementTotalCost() {
        const quantityInput = document.getElementById('movementQuantity');
        const unitPriceInput = document.getElementById('movementUnitPrice');
        const totalCostInput = document.getElementById('movementTotalCost');
        const quantityInMainUnitDisplay = document.getElementById('quantityInMainUnit');
        
        if (!quantityInput || !unitPriceInput || !totalCostInput) return;
        
        const quantity = parseFloat(quantityInput.value) || 0;
        const unitPrice = parseFloat(unitPriceInput.value) || 0;
        
        // Get quantity in main unit
        let quantityInMainUnit = quantity;
        if (quantityInMainUnitDisplay && quantityInMainUnitDisplay.textContent) {
            const match = quantityInMainUnitDisplay.textContent.match(/[\d.]+/);
            if (match) {
                quantityInMainUnit = parseFloat(match[0]);
            }
        }
        
        const totalCost = quantityInMainUnit * unitPrice;
        totalCostInput.value = formatNumber(totalCost, 2);
    },

    /**
     * Load movement pricing based on product and settings
     * تحميل تسعير الحركة بناءً على المنتج والإعدادات
     */
    async loadMovementPricing(productId, unitId, warehouseId, expiryDate) {
        if (!productId) return;
        
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const unitPriceInput = document.getElementById('movementUnitPrice');
        if (!unitPriceInput) return;
        
        try {
            // Get inventory settings
            const settingsDoc = await db.collection('SYSTEM_SETTINGS').doc('inventorySettings').get();
            const settings = settingsDoc.exists ? settingsDoc.data() : {};
            const pricingPattern = settings.pricingPattern || 'lastPurchasePrice';
            
            let defaultPrice = 0;
            
            if (pricingPattern === 'lastPurchasePrice') {
                // Get last purchase price
                if (typeof CostingMethods !== 'undefined') {
                    defaultPrice = await CostingMethods.getLastPurchasePrice(productId, warehouseId, unitId);
                }
            } else if (pricingPattern === 'calculatedCost') {
                // Calculate cost based on costing method
                const quantity = parseFloat(document.getElementById('movementQuantity')?.value || 1);
                if (typeof CostingMethods !== 'undefined') {
                    const totalCost = await CostingMethods.calculateProductCost(productId, quantity, warehouseId, unitId);
                    defaultPrice = quantity > 0 ? totalCost / quantity : 0;
                }
            }
            
            // If no price found, use product purchase price
            if (defaultPrice === 0) {
                defaultPrice = product.purchasePrice || 0;
            }
            
            unitPriceInput.value = formatNumber(defaultPrice, 2);
            
            // Recalculate total cost
            this.calculateMovementTotalCost();
        } catch (error) {
            console.error('Error loading movement pricing:', error);
        }
    },

    async viewMovement(movementId) {
        const movement = this.movements.find(m => m.id === movementId);
        if (!movement) {
            showError('الحركة غير موجودة');
            return;
        }
        
        try {
            const typeText = movement.type === 'in' ? 'دخول' : movement.type === 'out' ? 'خروج' : movement.type === 'transfer' ? 'نقل' : 'تعديل';
            const typeClass = movement.type === 'in' ? 'success' : movement.type === 'out' ? 'danger' : movement.type === 'transfer' ? 'info' : 'warning';
            
            const movementDate = movement.date?.toDate ? movement.date.toDate() : new Date(movement.date || movement.createdAt);
            const quantity = movement.quantity || 0;
            const quantityInMainUnit = movement.quantityInMainUnit || Math.abs(quantity);
            const previousQuantity = movement.previousQuantity || 0;
            const newQuantity = movement.newQuantity !== undefined ? movement.newQuantity : (previousQuantity + quantity);
            const unitPrice = movement.unitPrice || 0;
            const totalCost = movement.totalCost || (quantityInMainUnit * unitPrice);
            
            // Get unit name
            const unitId = movement.unitId;
            const unit = (this.units && Array.isArray(this.units)) ? this.units.find(u => u.id === unitId) : null;
            const unitName = unit ? unit.name : (movement.unitName || 'N/A');
            
            // Format expiry date and serial number
            const expiryDate = movement.expiryDate ? formatDate(new Date(movement.expiryDate)) : 'غير محدد';
            const serialNumber = movement.serialNumber || 'غير محدد';
            
            const transferInfo = movement.type === 'transfer' && movement.toWarehouseName ? `
                <div class="row mb-2">
                    <div class="col-6"><strong>من مستودع:</strong> ${movement.warehouseName || movement.warehouse || 'N/A'}</div>
                    <div class="col-6"><strong>إلى مستودع:</strong> ${movement.toWarehouseName}</div>
                </div>
            ` : `<p><strong>المستودع:</strong> ${movement.warehouseName || movement.warehouse || 'N/A'}</p>`;
            
            Swal.fire({
                title: `تفاصيل حركة المخزون - ${typeText}`,
                html: `
                    <div class="text-start">
                        <div class="row mb-3">
                            <div class="col-6">
                                <p><strong>التاريخ:</strong> ${formatDate(movementDate)}</p>
                                <p><strong>النوع:</strong> <span class="badge bg-${typeClass}">${typeText}</span></p>
                                <p><strong>المنتج:</strong> ${movement.productName || 'N/A'}</p>
                            </div>
                            <div class="col-6">
                                <p><strong>الوحدة:</strong> ${unitName}</p>
                                <p><strong>الكمية:</strong> <span class="text-${quantity > 0 ? 'success' : 'danger'}">${quantity > 0 ? '+' : ''}${formatNumber(Math.abs(quantity))}</span></p>
                                ${quantityInMainUnit !== Math.abs(quantity) ? `<p><small class="text-muted">(${formatNumber(quantityInMainUnit)} بالوحدة الأساسية)</small></p>` : ''}
                            </div>
                        </div>
                        
                        <hr>
                        
                        <div class="row mb-3">
                            <div class="col-6">
                                <p><strong>سعر الوحدة:</strong> ${unitPrice > 0 ? formatNumber(unitPrice) : 'غير محدد'}</p>
                                <p><strong>التكلفة الإجمالية:</strong> <span class="text-primary"><strong>${totalCost > 0 ? formatNumber(totalCost) : 'غير محدد'}</strong></span></p>
                            </div>
                            <div class="col-6">
                                <p><strong>رصيد قبل:</strong> <span class="badge bg-secondary">${formatNumber(previousQuantity)}</span></p>
                                <p><strong>رصيد بعد:</strong> <span class="badge bg-${newQuantity >= previousQuantity ? 'success' : 'warning'}">${formatNumber(newQuantity)}</span></p>
                            </div>
                        </div>
                        
                        <hr>
                        
                        ${transferInfo}
                        
                        <div class="row mb-2">
                            <div class="col-6">
                                <p><strong>تاريخ الصلاحية:</strong> ${expiryDate}</p>
                            </div>
                            <div class="col-6">
                                <p><strong>الرقم التسلسلي:</strong> ${serialNumber}</p>
                            </div>
                        </div>
                        
                        <hr>
                        
                        <p><strong>المرجع:</strong> ${movement.reference || 'غير محدد'}</p>
                        <p><strong>الملاحظات:</strong> ${movement.notes || 'لا توجد ملاحظات'}</p>
                        
                        ${movement.userId ? `<p><small class="text-muted"><strong>المستخدم:</strong> ${movement.userId}</small></p>` : ''}
                    </div>
                `,
                width: 700,
                icon: 'info',
                confirmButtonText: 'إغلاق'
            });
        } catch (error) {
            console.error('Error viewing movement:', error);
            showError('فشل في عرض تفاصيل الحركة: ' + error.message);
        }
    },

    viewWarehouse(warehouseId) {
        const warehouse = this.warehouses.find(w => w.id === warehouseId);
        if (warehouse) {
            const productCount = this.products.filter(p => p.warehouse === warehouseId).length;
            
            Swal.fire({
                title: warehouse.name,
                html: `
                    <div class="text-start">
                        <p><strong>الموقع:</strong> ${warehouse.location || 'N/A'}</p>
                        <p><strong>المسؤول:</strong> ${warehouse.manager || 'N/A'}</p>
                        <p><strong>عدد المنتجات:</strong> ${productCount}</p>
                        <p><strong>الحالة:</strong> ${warehouse.status === 'active' ? 'نشط' : 'غير نشط'}</p>
                        <p><strong>الوصف:</strong> ${warehouse.description || 'N/A'}</p>
                    </div>
                `,
                icon: 'info'
            });
        }
    },

    /**
     * Navigate to Warehouses Module
     * الانتقال إلى وحدة إدارة المستودعات
     */
    goToWarehousesModule(warehouseId = null, tab = null) {
        if (typeof app !== 'undefined') {
            app.showModule('warehouses');
            if (warehouseId && typeof WarehousesModule !== 'undefined') {
                setTimeout(() => {
                    if (tab === 'inventory') {
                        // Switch to inventory tab and filter by warehouse
                        if (typeof WarehousesModule.switchTab === 'function') {
                            WarehousesModule.switchTab('inventory');
                        }
                        // Set warehouse filter if available
                        const warehouseFilter = document.getElementById('inventoryWarehouseFilter');
                        if (warehouseFilter) {
                            warehouseFilter.value = warehouseId;
                            if (typeof WarehousesModule.loadInventory === 'function') {
                                WarehousesModule.loadInventory();
                            }
                        }
                    } else if (warehouseId) {
                        // Edit specific warehouse
                        if (typeof WarehousesModule.editWarehouse === 'function') {
                            WarehousesModule.editWarehouse(warehouseId);
                        }
                    } else if (tab) {
                        // Switch to specific tab
                        if (typeof WarehousesModule.switchTab === 'function') {
                            WarehousesModule.switchTab(tab);
                        }
                    }
                }, 500);
            } else if (tab) {
                setTimeout(() => {
                    if (typeof WarehousesModule !== 'undefined' && typeof WarehousesModule.switchTab === 'function') {
                        WarehousesModule.switchTab(tab);
                    }
                }, 500);
            }
        }
    },

    /**
     * View warehouse stock in Warehouses Module
     * عرض مخزون المستودع في وحدة المستودعات
     */
    viewWarehouseStock(warehouseId) {
        this.goToWarehousesModule(warehouseId, 'inventory');
    },

    editWarehouse(warehouseId) {
        // Redirect to warehouses module
        this.goToWarehousesModule(warehouseId);
    },

    /**
     * Set default date filters to fiscal period
     * تعيين فلاتر التاريخ الافتراضية للفترة المالية
     */
    async setDefaultFiscalPeriodFilters() {
        try {
            // Get fiscal period from settings
            const settingsDoc = await db.collection('settings').doc('vouchers').get();
            if (settingsDoc.exists) {
                const settings = settingsDoc.data();
                const fiscalYearStart = settings.fiscalYearStart;
                const fiscalYearEnd = settings.fiscalYearEnd;
                
                const dateFromInput = document.getElementById('movementDateFrom');
                const dateToInput = document.getElementById('movementDateTo');
                
                if (dateFromInput && fiscalYearStart) {
                    dateFromInput.value = fiscalYearStart;
                }
                if (dateToInput && fiscalYearEnd) {
                    dateToInput.value = fiscalYearEnd;
                }
                
                // Apply filters if dates are set
                if (fiscalYearStart || fiscalYearEnd) {
                    setTimeout(() => {
                        this.filterMovements();
                    }, 500);
                }
            }
        } catch (error) {
            console.error('Error setting default fiscal period filters:', error);
        }
    },

    /**
     * Setup real-time sync for inventory module
     */
    setupInventorySync() {
        if (typeof SyncManager !== 'undefined') {
            // Sync products
            SyncManager.onCollectionSync('products', (data, syncType) => {
                this.products = data;
                this.renderProductsTable();
                this.updateProductFilters();
                console.log(`🔄 Inventory products updated via ${syncType} sync`);
            });

            // Sync inventory movements
            SyncManager.onCollectionSync('inventoryMovements', (data, syncType) => {
                this.movements = data;
                this.renderMovementsTable();
                this.updateDashboard();
                this.updateUnitFilters(); // Update unit filters when movements are synced
                console.log(`🔄 Inventory movements updated via ${syncType} sync`);
            });

            // Sync warehouses
            SyncManager.onCollectionSync('warehouses', (data, syncType) => {
                this.warehouses = data;
                this.updateDashboard();
                console.log(`🔄 Warehouses updated via ${syncType} sync`);
            });
        }

        // Also listen to custom events
        window.addEventListener('dataSync', (event) => {
            const { collection, data } = event.detail;
            if (collection === 'products') {
                this.products = data;
                this.renderProductsTable();
                this.updateProductFilters();
            } else if (collection === 'inventoryMovements') {
                this.movements = data;
                this.renderMovementsTable();
                this.updateDashboard();
                this.updateUnitFilters(); // Update unit filters when movements are synced
            } else if (collection === 'warehouses') {
                this.warehouses = data;
                this.updateDashboard();
            }
        });
    },

    /**
     * Calculate inventory value at a specific date
     * حساب قيمة المخزون في تاريخ محدد
     * @param {Date|string} date - Date to calculate inventory value
     * @param {string} warehouseId - Optional warehouse ID
     * @returns {Promise<{totalValue: number, items: Array}>} Inventory value and items
     */
    async calculateInventoryValue(date = null, warehouseId = null) {
        try {
            const targetDate = date ? new Date(date) : new Date();
            targetDate.setHours(23, 59, 59, 999);
            
            // Get all movements up to the target date
            let query = db.collection('inventoryMovements')
                .where('date', '<=', targetDate)
                .orderBy('date', 'asc');
            
            const snapshot = await query.get();
            const movements = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Calculate stock for each product
            const productStock = {};
            const productValues = {};
            
            movements.forEach(movement => {
                if (warehouseId && movement.warehouseId !== warehouseId) {
                    return; // Skip if warehouse filter is applied
                }
                
                const productId = movement.productId;
                if (!productStock[productId]) {
                    productStock[productId] = 0;
                    productValues[productId] = {
                        productId: productId,
                        productName: movement.productName,
                        quantity: 0,
                        averageCost: 0,
                        totalValue: 0
                    };
                }
                
                // Update quantity
                productStock[productId] += (movement.quantity || 0);
                productValues[productId].quantity = productStock[productId];
                
                // Calculate average cost
                if (movement.totalCost && movement.quantityInMainUnit) {
                    const currentValue = productValues[productId].totalValue;
                    const newValue = currentValue + (movement.totalCost || 0);
                    const newQty = productValues[productId].quantity;
                    
                    productValues[productId].totalValue = newValue;
                    productValues[productId].averageCost = newQty > 0 ? newValue / newQty : 0;
                }
            });
            
            // Calculate total value
            const items = Object.values(productValues).filter(item => item.quantity > 0);
            const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
            
            return {
                totalValue: totalValue,
                items: items,
                date: targetDate
            };
        } catch (error) {
            console.error('Error calculating inventory value:', error);
            throw error;
        }
    },

    /**
     * Get beginning inventory value for a period
     * الحصول على قيمة مخزون بداية المدة
     * @param {Date|string} periodStart - Period start date
     * @param {string} warehouseId - Optional warehouse ID
     * @returns {Promise<number>} Beginning inventory value
     */
    async getBeginningInventoryValue(periodStart, warehouseId = null) {
        try {
            const startDate = new Date(periodStart);
            startDate.setHours(0, 0, 0, 0);
            
            const inventoryValue = await this.calculateInventoryValue(startDate, warehouseId);
            return inventoryValue.totalValue;
        } catch (error) {
            console.error('Error getting beginning inventory value:', error);
            return 0;
        }
    },

    /**
     * Get ending inventory value for a period
     * الحصول على قيمة مخزون نهاية المدة
     * @param {Date|string} periodEnd - Period end date
     * @param {string} warehouseId - Optional warehouse ID
     * @returns {Promise<number>} Ending inventory value
     */
    async getEndingInventoryValue(periodEnd, warehouseId = null) {
        try {
            const endDate = new Date(periodEnd);
            endDate.setHours(23, 59, 59, 999);
            
            const inventoryValue = await this.calculateInventoryValue(endDate, warehouseId);
            return inventoryValue.totalValue;
        } catch (error) {
            console.error('Error getting ending inventory value:', error);
            return 0;
        }
    },

    /**
     * Get inventory movement impact on profit and loss
     * الحصول على تأثير حركات المخزون على الأرباح والخسائر
     * @param {Date|string} periodStart - Period start date
     * @param {Date|string} periodEnd - Period end date
     * @param {string} warehouseId - Optional warehouse ID
     * @returns {Promise<{beginningValue: number, endingValue: number, costOfGoodsSold: number, impact: number}>} P&L impact
     */
    async getInventoryImpactOnPL(periodStart, periodEnd, warehouseId = null) {
        try {
            const beginningValue = await this.getBeginningInventoryValue(periodStart, warehouseId);
            const endingValue = await this.getEndingInventoryValue(periodEnd, warehouseId);
            
            // Get purchases during the period
            let purchasesQuery = db.collection('purchases')
                .where('status', '==', 'completed');
            
            if (periodStart) {
                purchasesQuery = purchasesQuery.where('date', '>=', new Date(periodStart));
            }
            if (periodEnd) {
                purchasesQuery = purchasesQuery.where('date', '<=', new Date(periodEnd));
            }
            
            const purchasesSnapshot = await purchasesQuery.get();
            let totalPurchases = 0;
            
            purchasesSnapshot.forEach(doc => {
                const purchase = doc.data();
                if (warehouseId && purchase.warehouseId !== warehouseId) {
                    return;
                }
                totalPurchases += (purchase.total || 0);
            });
            
            // Get purchase returns during the period
            let returnsQuery = db.collection('purchaseReturns')
                .where('status', '==', 'completed');
            
            if (periodStart) {
                returnsQuery = returnsQuery.where('date', '>=', new Date(periodStart));
            }
            if (periodEnd) {
                returnsQuery = returnsQuery.where('date', '<=', new Date(periodEnd));
            }
            
            const returnsSnapshot = await returnsQuery.get();
            let totalReturns = 0;
            
            returnsSnapshot.forEach(doc => {
                const returnData = doc.data();
                if (warehouseId && returnData.warehouseId !== warehouseId) {
                    return;
                }
                totalReturns += (returnData.total || 0);
            });
            
            // Calculate Cost of Goods Sold (COGS)
            // COGS = Beginning Inventory + Purchases - Purchase Returns - Ending Inventory
            const costOfGoodsSold = beginningValue + totalPurchases - totalReturns - endingValue;
            
            // Impact on profit = Change in inventory value
            const impact = endingValue - beginningValue;
            
            return {
                beginningValue: beginningValue,
                endingValue: endingValue,
                purchases: totalPurchases,
                purchaseReturns: totalReturns,
                costOfGoodsSold: costOfGoodsSold,
                impact: impact
            };
        } catch (error) {
            console.error('Error calculating inventory impact on P&L:', error);
            throw error;
        }
    }
};

console.log('✅ Inventory module loaded');




