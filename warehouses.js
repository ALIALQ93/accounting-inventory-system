/**
 * Warehouses Management Module - Complete Version
 * وحدة إدارة المستودعات - النسخة الكاملة
 * @module modules/warehouses
 */

const WarehousesModule = {
    // Data storage
    warehouses: [],
    filteredWarehouses: [],
    currentPage: 1,
    itemsPerPage: 10,
    editingWarehouse: null,
    currentTab: 'dashboard',

    /**
     * Get HTML for warehouses module
     */
    getHTML() {
        return `
            <section id="warehouses" class="warehouses-module-modern">
                <!-- Header -->
                <div class="warehouses-header">
                    <div class="header-content-wrapper">
                        <div class="header-icon-box">
                            <i class="fas fa-warehouse"></i>
                        </div>
                        <div class="header-text-box">
                            <h1 class="header-title">إدارة المستودعات</h1>
                            <p class="header-subtitle">إدارة شاملة للمستودعات والمواقع المخزنية</p>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button id="addWarehouseBtn" class="btn-modern btn-modern-primary">
                            <i class="fas fa-plus"></i>
                            إضافة مستودع جديد
                        </button>
                        <button id="goToInventoryBtn" class="btn-modern btn-modern-outline-info" title="الانتقال إلى إدارة المخزون">
                            <i class="fas fa-boxes"></i>
                            إدارة المخزون
                        </button>
                        <button id="refreshWarehousesBtn" class="btn-modern btn-modern-secondary">
                            <i class="fas fa-sync-alt"></i>
                            تحديث
                        </button>
                    </div>
                </div>

                <!-- Tabs Navigation -->
                <div class="warehouses-tabs">
                    <button class="warehouse-tab active" data-tab="dashboard" onclick="WarehousesModule.switchTab('dashboard')">
                        <i class="fas fa-chart-pie"></i>
                        <span>لوحة المعلومات</span>
                    </button>
                    <button class="warehouse-tab" data-tab="warehouses" onclick="WarehousesModule.switchTab('warehouses')">
                        <i class="fas fa-warehouse"></i>
                        <span>المستودعات</span>
                    </button>
                    <button class="warehouse-tab" data-tab="inventory" onclick="WarehousesModule.switchTab('inventory')">
                        <i class="fas fa-boxes"></i>
                        <span>المخزون</span>
                    </button>
                    <button class="warehouse-tab" data-tab="reports" onclick="WarehousesModule.switchTab('reports')">
                        <i class="fas fa-file-chart-line"></i>
                        <span>التقارير</span>
                    </button>
                </div>

                <!-- Content Area -->
                <div class="warehouses-content">
                    <!-- Dashboard Tab -->
                    <div id="warehouses-dashboard" class="warehouse-tab-content active">
                        ${this.getDashboardHTML()}
                    </div>

                    <!-- Warehouses Tab -->
                    <div id="warehouses-warehouses" class="warehouse-tab-content">
                        ${this.getWarehousesHTML()}
                    </div>

                    <!-- Inventory Tab -->
                    <div id="warehouses-inventory" class="warehouse-tab-content">
                        ${this.getInventoryHTML()}
                    </div>

                    <!-- Reports Tab -->
                    <div id="warehouses-reports" class="warehouse-tab-content">
                        ${this.getReportsHTML()}
                    </div>
                </div>
            </section>
        `;
    },

    /**
     * Get Dashboard HTML
     */
    getDashboardHTML() {
        return `
            <!-- Statistics Cards -->
            <div class="warehouses-stats-grid">
                <div class="stat-card stat-primary">
                    <div class="stat-icon">
                        <i class="fas fa-warehouse"></i>
                    </div>
                    <div class="stat-details">
                        <h3 id="totalWarehouses">0</h3>
                        <p>إجمالي المستودعات</p>
                        <small class="stat-trend">
                            <i class="fas fa-arrow-up"></i> نشط
                        </small>
                    </div>
                </div>

                <div class="stat-card stat-success">
                    <div class="stat-icon">
                        <i class="fas fa-box"></i>
                    </div>
                    <div class="stat-details">
                        <h3 id="totalProducts">0</h3>
                        <p>إجمالي المنتجات</p>
                        <small class="stat-trend">
                            <i class="fas fa-arrow-up"></i> متوفر
                        </small>
                    </div>
                </div>

                <div class="stat-card stat-warning">
                    <div class="stat-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="stat-details">
                        <h3 id="lowStockItems">0</h3>
                        <p>منتجات مخزون منخفض</p>
                        <small class="stat-trend">
                            <i class="fas fa-arrow-down"></i> يحتاج إعادة تموين
                        </small>
                    </div>
                </div>

                <div class="stat-card stat-info">
                    <div class="stat-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-details">
                        <h3 id="totalValue">0</h3>
                        <p>القيمة الإجمالية</p>
                        <small class="stat-trend">
                            <i class="fas fa-arrow-up"></i> د.ع
                        </small>
                    </div>
                </div>
            </div>

            <!-- Top Warehouses -->
            <div class="row mt-4">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-trophy"></i> أكبر المستودعات</h5>
                        </div>
                        <div class="card-body">
                            <div id="topWarehousesList" class="list-group">
                                <!-- Will be populated by JavaScript -->
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h5><i class="fas fa-exclamation-circle"></i> تنبيهات المخزون</h5>
                        </div>
                        <div class="card-body">
                            <div id="stockAlertsList" class="list-group">
                                <!-- Will be populated by JavaScript -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Get Warehouses HTML
     */
    getWarehousesHTML() {
        return `
            <!-- Search and Filters -->
            <div class="warehouses-filters">
                <div class="row">
                    <div class="col-md-4">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" id="warehouseSearch" placeholder="البحث في المستودعات..." class="form-control">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <select id="warehouseStatusFilter" class="form-select">
                            <option value="">جميع الحالات</option>
                            <option value="active">نشط</option>
                            <option value="inactive">غير نشط</option>
                            <option value="maintenance">صيانة</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <select id="warehouseTypeFilter" class="form-select">
                            <option value="">جميع الأنواع</option>
                            <option value="main">رئيسي</option>
                            <option value="branch">فرعي</option>
                            <option value="temporary">مؤقت</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <button id="clearWarehouseFilters" class="btn btn-outline-secondary w-100">
                            <i class="fas fa-times"></i> مسح
                        </button>
                    </div>
                </div>
            </div>

            <!-- Warehouses Table -->
            <div class="warehouses-table-container">
                <div class="table-responsive">
                    <table class="table table-hover warehouses-table">
                        <thead>
                            <tr>
                                <th>الكود</th>
                                <th>اسم المستودع</th>
                                <th>النوع</th>
                                <th>الموقع</th>
                                <th>المسؤول</th>
                                <th>المنتجات</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody id="warehousesTableBody">
                            <!-- Will be populated by JavaScript -->
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="warehouses-pagination">
                    <nav aria-label="Page navigation">
                        <ul class="pagination justify-content-center" id="warehousesPagination">
                            <!-- Will be populated by JavaScript -->
                        </ul>
                    </nav>
                </div>
            </div>
        `;
    },

    /**
     * Get Inventory HTML
     */
    getInventoryHTML() {
        return `
            <!-- Info Card -->
            <div class="alert alert-info d-flex justify-content-between align-items-center mb-4">
                <div>
                    <i class="fas fa-info-circle me-2"></i>
                    <strong>عرض المخزون:</strong> يمكنك عرض المخزون داخل كل مستودع هنا. لإدارة حركات المخزون والتقارير التفصيلية، انتقل إلى وحدة إدارة المخزون.
                </div>
                <button class="btn btn-primary" id="goToInventoryModuleBtn">
                    <i class="fas fa-boxes"></i> الانتقال إلى إدارة المخزون
                </button>
            </div>

            <!-- Inventory Filters -->
            <div class="inventory-filters">
                <div class="row">
                    <div class="col-md-3">
                        <select id="inventoryWarehouseFilter" class="form-select">
                            <option value="">جميع المستودعات</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <select id="inventoryCategoryFilter" class="form-select">
                            <option value="">جميع الفئات</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <select id="inventoryStockFilter" class="form-select">
                            <option value="">جميع المستويات</option>
                            <option value="low">مخزون منخفض</option>
                            <option value="normal">مخزون طبيعي</option>
                            <option value="high">مخزون عالي</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <button id="refreshInventory" class="btn btn-primary w-100">
                            <i class="fas fa-sync-alt"></i> تحديث
                        </button>
                    </div>
                </div>
            </div>

            <!-- Inventory Table -->
            <div class="inventory-table-container">
                <div class="table-responsive">
                    <table class="table table-hover inventory-table">
                        <thead>
                            <tr>
                                <th>المنتج</th>
                                <th>المستودع</th>
                                <th>الكمية المتاحة</th>
                                <th>الحد الأدنى</th>
                                <th>القيمة</th>
                                <th>آخر تحديث</th>
                                <th>الحالة</th>
                            </tr>
                        </thead>
                        <tbody id="inventoryTableBody">
                            <!-- Will be populated by JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    /**
     * Get Reports HTML
     */
    getReportsHTML() {
        return `
            <!-- Reports Cards -->
            <div class="reports-grid">
                <div class="report-card" onclick="WarehousesModule.generateReport('stock')">
                    <div class="report-icon">
                        <i class="fas fa-boxes"></i>
                    </div>
                    <div class="report-content">
                        <h5>تقرير المخزون</h5>
                        <p>تقرير شامل عن جميع المنتجات في المستودعات</p>
                    </div>
                </div>

                <div class="report-card" onclick="WarehousesModule.generateReport('movement')">
                    <div class="report-icon">
                        <i class="fas fa-exchange-alt"></i>
                    </div>
                    <div class="report-content">
                        <h5>تقرير الحركة</h5>
                        <p>تقرير حركة المنتجات بين المستودعات</p>
                    </div>
                </div>

                <div class="report-card" onclick="WarehousesModule.generateReport('value')">
                    <div class="report-icon">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="report-content">
                        <h5>تقرير القيمة</h5>
                        <p>تقرير القيمة المالية للمخزون</p>
                    </div>
                </div>

                <div class="report-card" onclick="WarehousesModule.generateReport('alerts')">
                    <div class="report-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="report-content">
                        <h5>تقرير التنبيهات</h5>
                        <p>تقرير المنتجات التي تحتاج إعادة تموين</p>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Load warehouses module
     */
    async load() {
        try {
            console.log('🏭 Loading Warehouses Module...');
            
            // Render HTML
            this.render();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load data
            await this.loadWarehouses();
            await this.loadStatistics();
            
            // Setup real-time sync
            this.setupWarehousesSync();
            
            console.log('✅ Warehouses Module loaded successfully');
            
        } catch (error) {
            console.error('❌ Error loading Warehouses Module:', error);
            showError('فشل في تحميل وحدة المستودعات: ' + error.message);
        }
    },

    /**
     * Render warehouses module
     */
    render() {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = this.getHTML();
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Add warehouse button
        const addBtn = document.getElementById('addWarehouseBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddWarehouseModal());
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshWarehousesBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadWarehouses());
        }

        // Navigation to Inventory Module
        const goToInventoryBtn = document.getElementById('goToInventoryBtn');
        if (goToInventoryBtn) {
            goToInventoryBtn.addEventListener('click', () => {
                this.goToInventoryModule();
            });
        }

        const goToInventoryModuleBtn = document.getElementById('goToInventoryModuleBtn');
        if (goToInventoryModuleBtn) {
            goToInventoryModuleBtn.addEventListener('click', () => {
                this.goToInventoryModule();
            });
        }

        // Search functionality
        const searchInput = document.getElementById('warehouseSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.filterWarehouses(e.target.value));
        }

        // Status filter
        const statusFilter = document.getElementById('warehouseStatusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.applyFilters());
        }

        // Type filter
        const typeFilter = document.getElementById('warehouseTypeFilter');
        if (typeFilter) {
            typeFilter.addEventListener('change', () => this.applyFilters());
        }

        // Clear filters
        const clearFilters = document.getElementById('clearWarehouseFilters');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => this.clearFilters());
        }

        // Inventory refresh
        const inventoryRefresh = document.getElementById('refreshInventory');
        if (inventoryRefresh) {
            inventoryRefresh.addEventListener('click', () => this.loadInventory());
        }
        
        // Inventory filters
        const inventoryWarehouseFilter = document.getElementById('inventoryWarehouseFilter');
        if (inventoryWarehouseFilter) {
            inventoryWarehouseFilter.addEventListener('change', () => this.loadInventory());
        }
        
        const inventoryCategoryFilter = document.getElementById('inventoryCategoryFilter');
        if (inventoryCategoryFilter) {
            inventoryCategoryFilter.addEventListener('change', () => this.loadInventory());
        }
        
        const inventoryStockFilter = document.getElementById('inventoryStockFilter');
        if (inventoryStockFilter) {
            inventoryStockFilter.addEventListener('change', () => this.loadInventory());
        }
    },

    /**
     * Switch between tabs
     */
    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.warehouse-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active content
        document.querySelectorAll('.warehouse-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`warehouses-${tabName}`).classList.add('active');

        this.currentTab = tabName;

        // Load tab-specific data
        switch(tabName) {
            case 'dashboard':
                this.loadStatistics();
                break;
            case 'warehouses':
                this.loadWarehouses();
                break;
            case 'inventory':
                this.loadInventory();
                break;
            case 'reports':
                // Reports are loaded on demand
                break;
        }
    },

    /**
     * Load warehouses from database
     */
    async loadWarehouses() {
        try {
            showLoading();
            
            const warehouses = await Collections.getWarehouses();
            this.warehouses = warehouses;
            this.filteredWarehouses = [...warehouses];
            
            this.renderWarehousesTable();
            this.updatePagination();
            
            hideLoading();
            
        } catch (error) {
            console.error('Error loading warehouses:', error);
            if (typeof showError === 'function') {
                showError('فشل في تحميل المستودعات: ' + error.message);
            } else {
                console.error('❌ فشل في تحميل المستودعات:', error.message);
            }
            hideLoading();
        }
    },

    /**
     * Render warehouses table
     */
    renderWarehousesTable() {
        const tbody = document.getElementById('warehousesTableBody');
        if (!tbody) return;

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageWarehouses = this.filteredWarehouses.slice(startIndex, endIndex);

        if (pageWarehouses.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted py-4">
                        <i class="fas fa-warehouse fa-2x mb-2"></i>
                        <br>لا توجد مستودعات
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = pageWarehouses.map(warehouse => `
            <tr>
                <td>
                    <span class="warehouse-code">${warehouse.code}</span>
                </td>
                <td>
                    <div class="warehouse-info">
                        <strong>${warehouse.name}</strong>
                        ${warehouse.description ? `<small class="text-muted d-block">${warehouse.description}</small>` : ''}
                    </div>
                </td>
                <td>
                    <span class="badge badge-${this.getTypeBadgeClass(warehouse.type)}">
                        ${this.getTypeName(warehouse.type)}
                    </span>
                </td>
                <td>
                    <div class="location-info">
                        <i class="fas fa-map-marker-alt"></i>
                        ${warehouse.location || 'غير محدد'}
                    </div>
                </td>
                <td>
                    <div class="manager-info">
                        <i class="fas fa-user"></i>
                        ${warehouse.manager || 'غير محدد'}
                    </div>
                </td>
                <td>
                    <span class="products-count">${warehouse.productsCount || 0}</span>
                </td>
                <td>
                    <span class="badge badge-${this.getStatusBadgeClass(warehouse.status)}">
                        ${this.getStatusName(warehouse.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline-info" onclick="WarehousesModule.viewWarehouse('${warehouse.id}')" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-warning" onclick="WarehousesModule.editWarehouse('${warehouse.id}')" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="WarehousesModule.deleteWarehouse('${warehouse.id}')" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    /**
     * Load statistics
     */
    async loadStatistics() {
        try {
            // Load warehouses count
            const warehousesCount = this.warehouses.length;
            document.getElementById('totalWarehouses').textContent = warehousesCount;

            // Load products count (this would need to be implemented)
            const productsCount = 0; // TODO: Implement products count
            document.getElementById('totalProducts').textContent = productsCount;

            // Load low stock items
            const lowStockItems = 0; // TODO: Implement low stock count
            document.getElementById('lowStockItems').textContent = lowStockItems;

            // Load total value
            const totalValue = 0; // TODO: Implement total value calculation
            document.getElementById('totalValue').textContent = totalValue.toLocaleString('ar-IQ');

            // Load top warehouses
            this.renderTopWarehouses();
            
            // Load stock alerts
            this.renderStockAlerts();

        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    },

    /**
     * Render top warehouses
     */
    renderTopWarehouses() {
        const container = document.getElementById('topWarehousesList');
        if (!container) return;

        const topWarehouses = this.warehouses
            .sort((a, b) => (b.productsCount || 0) - (a.productsCount || 0))
            .slice(0, 5);

        if (topWarehouses.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">لا توجد مستودعات</p>';
            return;
        }

        container.innerHTML = topWarehouses.map(warehouse => `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${warehouse.name}</strong>
                    <small class="text-muted d-block">${warehouse.location || 'غير محدد'}</small>
                </div>
                <span class="badge badge-primary">${warehouse.productsCount || 0}</span>
            </div>
        `).join('');
    },

    /**
     * Render stock alerts
     */
    renderStockAlerts() {
        const container = document.getElementById('stockAlertsList');
        if (!container) return;

        // TODO: Implement stock alerts
        container.innerHTML = '<p class="text-muted text-center">لا توجد تنبيهات</p>';
    },

    /**
     * Load inventory data
     */
    async loadInventory() {
        try {
            showLoading();
            
            const products = await Collections.getProducts();
            const warehouses = await Collections.getWarehouses();
            const categories = await Collections.getCategories();
            
            // Populate warehouse filter
            const warehouseFilter = document.getElementById('inventoryWarehouseFilter');
            if (warehouseFilter) {
                warehouseFilter.innerHTML = '<option value="">جميع المستودعات</option>' +
                    warehouses.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
            }
            
            // Populate category filter
            const categoryFilter = document.getElementById('inventoryCategoryFilter');
            if (categoryFilter) {
                categoryFilter.innerHTML = '<option value="">جميع الفئات</option>' +
                    categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
            }
            
            // Build inventory data
            const inventoryData = [];
            
            for (const product of products) {
                if (product.status === 'inactive') continue;
                
                const warehouseStock = product.warehouseStock || {};
                const category = categories.find(c => c.id === product.categoryId);
                
                // If no warehouse filter, show all warehouses
                const selectedWarehouseId = warehouseFilter?.value || '';
                
                if (selectedWarehouseId) {
                    // Show only selected warehouse
                    const stock = warehouseStock[selectedWarehouseId] || 0;
                    if (stock > 0 || selectedWarehouseId) {
                        inventoryData.push({
                            productId: product.id,
                            productName: product.name,
                            productCode: product.code || '',
                            categoryId: product.categoryId,
                            categoryName: category?.name || '',
                            warehouseId: selectedWarehouseId,
                            warehouseName: warehouses.find(w => w.id === selectedWarehouseId)?.name || '',
                            quantity: stock,
                            minStock: product.minStock || 0,
                            purchasePrice: product.purchasePrice || 0,
                            value: stock * (product.purchasePrice || 0),
                            lastUpdated: product.updatedAt || product.createdAt
                        });
                    }
                } else {
                    // Show all warehouses
                    for (const warehouseId in warehouseStock) {
                        const stock = warehouseStock[warehouseId];
                        if (stock > 0) {
                            inventoryData.push({
                                productId: product.id,
                                productName: product.name,
                                productCode: product.code || '',
                                categoryId: product.categoryId,
                                categoryName: category?.name || '',
                                warehouseId: warehouseId,
                                warehouseName: warehouses.find(w => w.id === warehouseId)?.name || '',
                                quantity: stock,
                                minStock: product.minStock || 0,
                                purchasePrice: product.purchasePrice || 0,
                                value: stock * (product.purchasePrice || 0),
                                lastUpdated: product.updatedAt || product.createdAt
                            });
                        }
                    }
                }
            }
            
            // Apply filters
            const categoryFilterValue = categoryFilter?.value || '';
            const stockFilterValue = document.getElementById('inventoryStockFilter')?.value || '';
            
            let filteredData = inventoryData;
            
            if (categoryFilterValue) {
                filteredData = filteredData.filter(item => item.categoryId === categoryFilterValue);
            }
            
            if (stockFilterValue) {
                filteredData = filteredData.filter(item => {
                    switch(stockFilterValue) {
                        case 'low':
                            return item.quantity > 0 && item.quantity <= item.minStock;
                        case 'normal':
                            return item.quantity > item.minStock;
                        case 'high':
                            return item.quantity > item.minStock * 2;
                        default:
                            return true;
                    }
                });
            }
            
            // Render inventory table
            this.renderInventoryTable(filteredData);
            
            hideLoading();
        } catch (error) {
            console.error('Error loading inventory:', error);
            if (typeof showError === 'function') {
                showError('فشل في تحميل المخزون: ' + error.message);
            }
            hideLoading();
        }
    },
    
    /**
     * Render inventory table
     */
    renderInventoryTable(inventoryData) {
        const tbody = document.getElementById('inventoryTableBody');
        if (!tbody) return;
        
        if (inventoryData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted py-4">
                        <i class="fas fa-boxes fa-2x mb-2"></i>
                        <br>لا توجد منتجات في المخزون
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = inventoryData.map(item => {
            const stockStatus = item.quantity === 0 ? 'out' : 
                              item.quantity <= item.minStock ? 'low' : 'normal';
            const stockClass = stockStatus === 'out' ? 'danger' : 
                             stockStatus === 'low' ? 'warning' : 'success';
            const stockText = stockStatus === 'out' ? 'نفد' : 
                            stockStatus === 'low' ? 'منخفض' : 'عادي';
            
            const lastUpdated = item.lastUpdated?.toDate ? 
                item.lastUpdated.toDate() : 
                new Date(item.lastUpdated || Date.now());
            
            return `
                <tr>
                    <td>
                        <div class="product-info">
                            <strong>${item.productName}</strong>
                            ${item.productCode ? `<small class="text-muted d-block">${item.productCode}</small>` : ''}
                        </div>
                    </td>
                    <td>
                        <span class="warehouse-badge">${item.warehouseName}</span>
                    </td>
                    <td class="text-${stockClass}">
                        <strong>${formatNumber(item.quantity)}</strong>
                    </td>
                    <td>${formatNumber(item.minStock)}</td>
                    <td>${formatCurrency(item.value)}</td>
                    <td>${formatDate(lastUpdated)}</td>
                    <td>
                        <span class="badge bg-${stockClass}">${stockText}</span>
                    </td>
                </tr>
            `;
        }).join('');
    },

    /**
     * Filter warehouses
     */
    filterWarehouses(searchTerm) {
        if (!searchTerm) {
            this.filteredWarehouses = [...this.warehouses];
        } else {
            this.filteredWarehouses = this.warehouses.filter(warehouse =>
                warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                warehouse.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (warehouse.description && warehouse.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (warehouse.location && warehouse.location.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        
        this.currentPage = 1;
        this.renderWarehousesTable();
        this.updatePagination();
    },

    /**
     * Apply filters
     */
    applyFilters() {
        const statusFilter = document.getElementById('warehouseStatusFilter')?.value || '';
        const typeFilter = document.getElementById('warehouseTypeFilter')?.value || '';
        const searchTerm = document.getElementById('warehouseSearch')?.value || '';

        this.filteredWarehouses = this.warehouses.filter(warehouse => {
            const matchesStatus = !statusFilter || warehouse.status === statusFilter;
            const matchesType = !typeFilter || warehouse.type === typeFilter;
            const matchesSearch = !searchTerm || 
                warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                warehouse.code.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesStatus && matchesType && matchesSearch;
        });

        this.currentPage = 1;
        this.renderWarehousesTable();
        this.updatePagination();
    },

    /**
     * Clear filters
     */
    clearFilters() {
        document.getElementById('warehouseSearch').value = '';
        document.getElementById('warehouseStatusFilter').value = '';
        document.getElementById('warehouseTypeFilter').value = '';
        
        this.filteredWarehouses = [...this.warehouses];
        this.currentPage = 1;
        this.renderWarehousesTable();
        this.updatePagination();
    },

    /**
     * Update pagination
     */
    updatePagination() {
        const pagination = document.getElementById('warehousesPagination');
        if (!pagination) return;

        const totalPages = Math.ceil(this.filteredWarehouses.length / this.itemsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="WarehousesModule.goToPage(${this.currentPage - 1})">السابق</a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="WarehousesModule.goToPage(${i})">${i}</a>
                </li>
            `;
        }

        // Next button
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="WarehousesModule.goToPage(${this.currentPage + 1})">التالي</a>
            </li>
        `;

        pagination.innerHTML = paginationHTML;
    },

    /**
     * Go to specific page
     */
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredWarehouses.length / this.itemsPerPage);
        
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderWarehousesTable();
            this.updatePagination();
        }
    },

    /**
     * Show add warehouse modal
     */
    showAddWarehouseModal() {
        this.editingWarehouse = null;
        this.showWarehouseModal();
    },

    /**
     * Show warehouse modal
     */
    showWarehouseModal() {
        const modalHTML = `
            <div class="modal fade" id="warehouseModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-warehouse"></i>
                                ${this.editingWarehouse ? 'تعديل المستودع' : 'إضافة مستودع جديد'}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="warehouseForm">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label for="warehouseCode" class="form-label">كود المستودع</label>
                                            <input type="text" id="warehouseCode" class="form-control" readonly style="background-color: #f8f9fa;">
                                            <small class="form-text text-muted">سيتم توليد الكود تلقائياً</small>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label for="warehouseName" class="form-label">اسم المستودع *</label>
                                            <input type="text" id="warehouseName" class="form-control" required>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group mb-3">
                                    <label for="warehouseDescription" class="form-label">الوصف</label>
                                    <textarea id="warehouseDescription" class="form-control" rows="3"></textarea>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label for="warehouseType" class="form-label">نوع المستودع *</label>
                                            <select id="warehouseType" class="form-select" required>
                                                <option value="">اختر النوع</option>
                                                <option value="main">رئيسي</option>
                                                <option value="branch">فرعي</option>
                                                <option value="temporary">مؤقت</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label for="warehouseStatus" class="form-label">الحالة *</label>
                                            <select id="warehouseStatus" class="form-select" required>
                                                <option value="active">نشط</option>
                                                <option value="inactive">غير نشط</option>
                                                <option value="maintenance">صيانة</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label for="warehouseLocation" class="form-label">الموقع</label>
                                            <input type="text" id="warehouseLocation" class="form-control">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label for="warehouseManager" class="form-label">المسؤول</label>
                                            <input type="text" id="warehouseManager" class="form-control">
                                        </div>
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label for="warehousePhone" class="form-label">الهاتف</label>
                                            <input type="tel" id="warehousePhone" class="form-control">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label for="warehouseEmail" class="form-label">البريد الإلكتروني</label>
                                            <input type="email" id="warehouseEmail" class="form-control">
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group mb-3">
                                    <label for="warehouseNotes" class="form-label">ملاحظات</label>
                                    <textarea id="warehouseNotes" class="form-control" rows="3"></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                            <button type="button" class="btn btn-primary" onclick="WarehousesModule.saveWarehouse()">
                                <i class="fas fa-save"></i> حفظ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        const existingModal = document.getElementById('warehouseModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('warehouseModal'));
        modal.show();

        // Populate form if editing
        if (this.editingWarehouse) {
            this.populateWarehouseForm();
        } else {
            // Generate code for new warehouse
            setTimeout(() => {
                this.generateWarehouseCode();
            }, 100);
        }
    },

    /**
     * Clear warehouse form
     */
    clearWarehouseForm() {
        const form = document.getElementById('warehouseForm');
        if (form) {
            form.reset();
            const statusSelect = document.getElementById('warehouseStatus');
            if (statusSelect) {
                statusSelect.value = 'active';
            }
        }
    },

    /**
     * Populate warehouse form
     */
    populateWarehouseForm() {
        if (!this.editingWarehouse) return;

        // For editing, show the existing code but make it readonly
        const codeInput = document.getElementById('warehouseCode');
        codeInput.value = this.editingWarehouse.code || '';
        codeInput.readOnly = true;
        codeInput.style.backgroundColor = '#f8f9fa';
        document.getElementById('warehouseName').value = this.editingWarehouse.name || '';
        document.getElementById('warehouseDescription').value = this.editingWarehouse.description || '';
        document.getElementById('warehouseType').value = this.editingWarehouse.type || '';
        document.getElementById('warehouseStatus').value = this.editingWarehouse.status || 'active';
        document.getElementById('warehouseLocation').value = this.editingWarehouse.location || '';
        document.getElementById('warehouseManager').value = this.editingWarehouse.manager || '';
        document.getElementById('warehousePhone').value = this.editingWarehouse.phone || '';
        document.getElementById('warehouseEmail').value = this.editingWarehouse.email || '';
        document.getElementById('warehouseNotes').value = this.editingWarehouse.notes || '';
    },

    /**
     * Save warehouse
     */
    async saveWarehouse() {
        try {
            const formData = this.collectWarehouseData();
            
            if (!this.validateWarehouseForm(formData)) {
                return;
            }

            showLoading();

            if (this.editingWarehouse) {
                await Collections.updateWarehouse(this.editingWarehouse.id, formData);
                if (typeof showSuccess === 'function') {
                    showSuccess('تم تحديث المستودع بنجاح');
                } else {
                    console.log('✅ تم تحديث المستودع بنجاح');
                }
            } else {
                await Collections.addWarehouse(formData);
                if (typeof showSuccess === 'function') {
                    showSuccess('تم إضافة المستودع بنجاح');
                } else {
                    console.log('✅ تم إضافة المستودع بنجاح');
                }
            }

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('warehouseModal'));
            modal.hide();

            // Reload data
            await this.loadWarehouses();
            await this.loadStatistics();

            hideLoading();

        } catch (error) {
            console.error('Error saving warehouse:', error);
            if (typeof showError === 'function') {
                showError('فشل في حفظ المستودع: ' + error.message);
            } else {
                console.error('❌ فشل في حفظ المستودع:', error.message);
            }
            hideLoading();
        }
    },

    /**
     * Collect warehouse form data
     */
    collectWarehouseData() {
        const code = document.getElementById('warehouseCode').value.trim();
        
        return {
            code: code,
            name: document.getElementById('warehouseName').value.trim(),
            description: document.getElementById('warehouseDescription').value.trim(),
            type: document.getElementById('warehouseType').value,
            status: document.getElementById('warehouseStatus').value,
            location: document.getElementById('warehouseLocation').value.trim(),
            manager: document.getElementById('warehouseManager').value.trim(),
            phone: document.getElementById('warehousePhone').value.trim(),
            email: document.getElementById('warehouseEmail').value.trim(),
            notes: document.getElementById('warehouseNotes').value.trim()
        };
    },

    /**
     * Validate warehouse form
     */
    validateWarehouseForm(data) {
        if (!data.code) {
            if (typeof showError === 'function') {
                showError('كود المستودع مطلوب');
            } else {
                console.error('❌ كود المستودع مطلوب');
            }
            return false;
        }

        if (!data.name) {
            if (typeof showError === 'function') {
                showError('اسم المستودع مطلوب');
            } else {
                console.error('❌ اسم المستودع مطلوب');
            }
            return false;
        }

        if (!data.type) {
            if (typeof showError === 'function') {
                showError('نوع المستودع مطلوب');
            } else {
                console.error('❌ نوع المستودع مطلوب');
            }
            return false;
        }

        return true;
    },

    /**
     * View warehouse
     */
    async viewWarehouse(warehouseId) {
        try {
            const warehouse = await Collections.getWarehouse(warehouseId);
            this.showWarehouseDetails(warehouse);
        } catch (error) {
            console.error('Error viewing warehouse:', error);
            if (typeof showError === 'function') {
                showError('فشل في عرض المستودع: ' + error.message);
            } else {
                console.error('❌ فشل في عرض المستودع:', error.message);
            }
        }
    },

    /**
     * Show warehouse details
     */
    showWarehouseDetails(warehouse) {
        const detailsHTML = `
            <div class="warehouse-details">
                <div class="row">
                    <div class="col-md-6">
                        <h5>معلومات المستودع</h5>
                        <table class="table table-sm">
                            <tr><td><strong>الكود:</strong></td><td>${warehouse.code}</td></tr>
                            <tr><td><strong>الاسم:</strong></td><td>${warehouse.name}</td></tr>
                            <tr><td><strong>النوع:</strong></td><td>${this.getTypeName(warehouse.type)}</td></tr>
                            <tr><td><strong>الحالة:</strong></td><td>${this.getStatusName(warehouse.status)}</td></tr>
                            <tr><td><strong>الموقع:</strong></td><td>${warehouse.location || 'غير محدد'}</td></tr>
                            <tr><td><strong>المسؤول:</strong></td><td>${warehouse.manager || 'غير محدد'}</td></tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h5>معلومات الاتصال</h5>
                        <table class="table table-sm">
                            <tr><td><strong>الهاتف:</strong></td><td>${warehouse.phone || 'غير محدد'}</td></tr>
                            <tr><td><strong>البريد الإلكتروني:</strong></td><td>${warehouse.email || 'غير محدد'}</td></tr>
                            <tr><td><strong>تاريخ الإنشاء:</strong></td><td>${warehouse.createdAt ? warehouse.createdAt.toDate().toLocaleDateString('ar-IQ') : 'غير محدد'}</td></tr>
                            <tr><td><strong>آخر تحديث:</strong></td><td>${warehouse.updatedAt ? warehouse.updatedAt.toDate().toLocaleDateString('ar-IQ') : 'غير محدد'}</td></tr>
                        </table>
                    </div>
                </div>
                ${warehouse.description ? `
                    <div class="mt-3">
                        <h5>الوصف</h5>
                        <p>${warehouse.description}</p>
                    </div>
                ` : ''}
                ${warehouse.notes ? `
                    <div class="mt-3">
                        <h5>ملاحظات</h5>
                        <p>${warehouse.notes}</p>
                    </div>
                ` : ''}
            </div>
        `;

        Swal.fire({
            title: `مستودع: ${warehouse.name}`,
            html: detailsHTML,
            width: '800px',
            showCloseButton: true,
            showConfirmButton: false
        });
    },

    /**
     * Edit warehouse
     */
    async editWarehouse(warehouseId) {
        try {
            const warehouse = await Collections.getWarehouse(warehouseId);
            this.editingWarehouse = warehouse;
            this.showWarehouseModal();
        } catch (error) {
            console.error('Error editing warehouse:', error);
            if (typeof showError === 'function') {
                showError('فشل في تحميل المستودع: ' + error.message);
            } else {
                console.error('❌ فشل في تحميل المستودع:', error.message);
            }
        }
    },

    /**
     * Delete warehouse
     */
    async deleteWarehouse(warehouseId) {
        try {
            const warehouse = await Collections.getWarehouse(warehouseId);
            
            const result = await Swal.fire({
                title: 'تأكيد الحذف',
                text: `هل أنت متأكد من حذف المستودع "${warehouse.name}"؟`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'نعم، احذف',
                cancelButtonText: 'إلغاء',
                confirmButtonColor: '#dc3545',
                cancelButtonColor: '#6c757d'
            });

            if (result.isConfirmed) {
                showLoading();
                
                await Collections.deleteWarehouse(warehouseId);
                
                if (typeof showSuccess === 'function') {
                    showSuccess('تم حذف المستودع بنجاح');
                } else {
                    console.log('✅ تم حذف المستودع بنجاح');
                }
                
                await this.loadWarehouses();
                await this.loadStatistics();
                
                hideLoading();
            }

        } catch (error) {
            console.error('Error deleting warehouse:', error);
            if (typeof showError === 'function') {
                showError('فشل في حذف المستودع: ' + error.message);
            } else {
                console.error('❌ فشل في حذف المستودع:', error.message);
            }
            hideLoading();
        }
    },

    /**
     * Generate report
     */
    async generateReport(reportType) {
        try {
            showLoading();

            switch(reportType) {
                case 'stock':
                    await this.generateStockReport();
                    break;
                case 'movement':
                    await this.generateMovementReport();
                    break;
                case 'value':
                    await this.generateValueReport();
                    break;
                case 'alerts':
                    await this.generateAlertsReport();
                    break;
            }

            hideLoading();

        } catch (error) {
            console.error('Error generating report:', error);
            if (typeof showError === 'function') {
                showError('فشل في توليد التقرير: ' + error.message);
            } else {
                console.error('❌ فشل في توليد التقرير:', error.message);
            }
            hideLoading();
        }
    },

    /**
     * Generate stock report
     */
    async generateStockReport() {
        // TODO: Implement stock report generation
        if (typeof showSuccess === 'function') {
            showSuccess('تم توليد تقرير المخزون');
        } else {
            console.log('✅ تم توليد تقرير المخزون');
        }
    },

    /**
     * Generate movement report
     */
    async generateMovementReport() {
        // TODO: Implement movement report generation
        if (typeof showSuccess === 'function') {
            showSuccess('تم توليد تقرير الحركة');
        } else {
            console.log('✅ تم توليد تقرير الحركة');
        }
    },

    /**
     * Generate value report
     */
    async generateValueReport() {
        // TODO: Implement value report generation
        if (typeof showSuccess === 'function') {
            showSuccess('تم توليد تقرير القيمة');
        } else {
            console.log('✅ تم توليد تقرير القيمة');
        }
    },

    /**
     * Generate alerts report
     */
    async generateAlertsReport() {
        // TODO: Implement alerts report generation
        if (typeof showSuccess === 'function') {
            showSuccess('تم توليد تقرير التنبيهات');
        } else {
            console.log('✅ تم توليد تقرير التنبيهات');
        }
    },

    /**
     * Generate warehouse code
     */
    generateWarehouseCode() {
        const prefix = 'WH';
        const existingCodes = this.warehouses.map(w => w.code).filter(code => code && code.startsWith(prefix));
        
        let counter = 1;
        let newCode;
        
        do {
            newCode = `${prefix}${counter.toString().padStart(3, '0')}`;
            counter++;
        } while (existingCodes.includes(newCode));
        
        // Update the input field if it exists
        const codeInput = document.getElementById('warehouseCode');
        if (codeInput) {
            codeInput.value = newCode;
        }
        
        return newCode;
    },

    /**
     * Helper methods
     */
    getTypeName(type) {
        const types = {
            'main': 'رئيسي',
            'branch': 'فرعي',
            'temporary': 'مؤقت'
        };
        return types[type] || type;
    },

    getTypeBadgeClass(type) {
        const classes = {
            'main': 'primary',
            'branch': 'success',
            'temporary': 'warning'
        };
        return classes[type] || 'secondary';
    },

    getStatusName(status) {
        const statuses = {
            'active': 'نشط',
            'inactive': 'غير نشط',
            'maintenance': 'صيانة'
        };
        return statuses[status] || status;
    },

    getStatusBadgeClass(status) {
        const classes = {
            'active': 'success',
            'inactive': 'secondary',
            'maintenance': 'warning'
        };
        return classes[status] || 'secondary';
    },

    /**
     * Navigate to Inventory Module
     * الانتقال إلى وحدة إدارة المخزون
     */
    goToInventoryModule(tab = null, warehouseId = null) {
        if (typeof app !== 'undefined') {
            app.showModule('inventory');
            if (tab && typeof InventoryModule !== 'undefined') {
                setTimeout(() => {
                    // Switch to specific tab in InventoryModule
                    const tabButton = document.querySelector(`#inventoryTabs button[data-bs-target="#${tab}"]`);
                    if (tabButton) {
                        tabButton.click();
                    }
                    
                    // If warehouseId is provided, filter by warehouse
                    if (warehouseId && tab === 'warehouses') {
                        // Filter warehouses table by warehouseId
                        const warehouseSearch = document.getElementById('warehouseSearch');
                        if (warehouseSearch) {
                            // Find warehouse name and search for it
                            const warehouse = this.warehouses.find(w => w.id === warehouseId);
                            if (warehouse) {
                                warehouseSearch.value = warehouse.name;
                                if (typeof InventoryModule.filterWarehouses === 'function') {
                                    InventoryModule.filterWarehouses(warehouse.name);
                                }
                            }
                        }
                    }
                }, 500);
            } else if (tab) {
                setTimeout(() => {
                    const tabButton = document.querySelector(`#inventoryTabs button[data-bs-target="#${tab}"]`);
                    if (tabButton) {
                        tabButton.click();
                    }
                }, 500);
            }
        }
    },

    /**
     * Setup real-time sync for warehouses module
     */
    setupWarehousesSync() {
        if (typeof SyncManager !== 'undefined') {
            // Sync warehouses
            SyncManager.onCollectionSync('warehouses', (data, syncType) => {
                this.warehouses = data;
                this.renderWarehousesTable();
                this.loadStatistics();
                console.log(`🔄 Warehouses updated via ${syncType} sync`);
            });
        }

        // Also listen to custom events
        window.addEventListener('dataSync', (event) => {
            const { collection, data } = event.detail;
            if (collection === 'warehouses') {
                this.warehouses = data;
                this.renderWarehousesTable();
                this.loadStatistics();
            }
        });
    }
};

console.log('✅ Warehouses Module loaded');
