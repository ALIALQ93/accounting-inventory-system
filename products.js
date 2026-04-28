/**
 * Products Management Module - Clean Version
 * وحدة إدارة المنتجات - النسخة النظيفة
 */

const ProductsModule = {
    // Data storage
    products: [],
    categories: [],
    units: [],
    currencies: [],
    filteredProducts: [],
    currentPage: 1,
    itemsPerPage: 20,
    currentBulkImportType: null,
    bulkData: null,

    /**
     * Get HTML for products module
     */
    getHTML() {
        return `
            <div class="products-module">
                <!-- Header -->
                <div class="products-header">
                    <h1 class="module-title">
                        <i class="fas fa-boxes"></i>
                        إدارة المنتجات
                    </h1>
                    <p class="module-subtitle">نظام متكامل لإدارة المنتجات والفئات والوحدات</p>
                    <div class="header-actions">
                        <button id="addProductBtn" class="btn-modern btn-modern-primary">
                            <i class="fas fa-plus"></i>
                            إضافة منتج جديد
                        </button>
                        </div>
                        </div>

                <!-- Summary Cards -->
                <div class="row mb-4">
                    <div class="col-md-4">
                        <div class="card text-white bg-primary">
                            <div class="card-body">
                                <h5 class="card-title">المنتجات</h5>
                                <h2 id="productsCount">0</h2>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card text-white bg-success">
                            <div class="card-body">
                                <h5 class="card-title">الفئات</h5>
                                <h2 id="categoriesCount">0</h2>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card text-white bg-info">
                            <div class="card-body">
                                <h5 class="card-title">الوحدات</h5>
                                <h2 id="unitsCount">0</h2>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Navigation Tabs -->
                <ul class="nav nav-tabs" id="productsTabs">
                    <li class="nav-item">
                        <a class="nav-link active" id="productsTab" data-bs-toggle="tab" href="#products-pane">
                            المنتجات
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" id="categoriesTab" data-bs-toggle="tab" href="#categories-pane">
                            الفئات
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" id="unitsTab" data-bs-toggle="tab" href="#units-pane">
                            الوحدات
                        </a>
                    </li>
                </ul>

                <!-- Tab Content -->
                <div class="tab-content" id="productsTabContent">
                    <!-- Products Tab -->
                    <div class="tab-pane fade show active" id="products-pane">
                        <div class="card mt-3">
                            <div class="card-header">
                                <div class="d-flex justify-content-between align-items-center">
                                    <h5 class="mb-0">قائمة المنتجات</h5>
                                    <div class="d-flex gap-2">
                                        <div class="btn-group" role="group">
                                            <button class="btn-modern btn-modern-success btn-modern-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" title="تصدير">
                                            <i class="fas fa-download"></i>
                                        </button>
                                            <ul class="dropdown-menu">
                                                <li><a class="dropdown-item" href="#" onclick="ProductsModule.exportProducts('csv')">تصدير CSV</a></li>
                                                <li><a class="dropdown-item" href="#" onclick="ProductsModule.exportProducts('excel')">تصدير Excel</a></li>
                                                <li><a class="dropdown-item" href="#" onclick="ProductsModule.exportProducts('json')">تصدير JSON</a></li>
                                            </ul>
                                        </div>
                                        <div class="btn-group" role="group">
                                            <button class="btn-modern btn-modern-info btn-modern-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" title="نسخ احتياطية">
                                                <i class="fas fa-database"></i>
                                            </button>
                                            <ul class="dropdown-menu">
                                                <li><a class="dropdown-item" href="#" onclick="ProductsModule.backupProductsData()">إنشاء نسخة احتياطية</a></li>
                                                <li><a class="dropdown-item" href="#" onclick="document.getElementById('restoreFile').click()">استعادة من نسخة احتياطية</a></li>
                                            </ul>
                                        </div>
                                        <div class="btn-group" role="group">
                                            <button class="btn-modern btn-modern-warning btn-modern-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" title="إدراج متعدد">
                                                <i class="fas fa-upload"></i>
                                            </button>
                                            <ul class="dropdown-menu">
                                                <li><a class="dropdown-item" href="#" onclick="ProductsModule.showBulkImportModal('products')">إدراج منتجات متعدد</a></li>
                                                <li><a class="dropdown-item" href="#" onclick="ProductsModule.showBulkImportModal('categories')">إدراج فئات متعدد</a></li>
                                                <li><a class="dropdown-item" href="#" onclick="ProductsModule.showBulkImportModal('units')">إدراج وحدات متعدد</a></li>
                                            </ul>
                                        </div>
                                        <button class="btn-modern btn-modern-primary btn-modern-sm" onclick="ProductsModule.showAddProductModal()" title="إضافة منتج">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                    <input type="file" id="restoreFile" accept=".json" style="display: none;" onchange="ProductsModule.restoreProductsData(this.files[0])">
                                </div>
                            </div>
                            <div class="card-body">
                                <!-- Search and Filter Section -->
                                <div class="row mb-3">
                                    <div class="col-md-4">
                                        <div class="input-group">
                                            <span class="input-group-text"><i class="fas fa-search"></i></span>
                                            <input type="text" id="productSearch" class="form-control" placeholder="البحث في المنتجات..." onkeyup="ProductsModule.filterProducts()">
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <select id="categoryFilter" class="form-select" onchange="ProductsModule.filterProducts()">
                                            <option value="">جميع الفئات</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <select id="statusFilter" class="form-select" onchange="ProductsModule.filterProducts()">
                                            <option value="">جميع الحالات</option>
                                            <option value="active">نشط</option>
                                            <option value="inactive">غير نشط</option>
                                        </select>
                                    </div>
                                    <div class="col-md-2">
                                        <button class="btn-modern btn-modern-outline-secondary w-100" onclick="ProductsModule.clearFilters()" title="مسح الفلاتر">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>

                                <!-- Products Summary -->
                                <div class="row mb-3">
                                    <div class="col-md-12">
                                        <div class="alert alert-info d-flex justify-content-between align-items-center">
                                            <span id="productsSummary">جاري التحميل...</span>
                                            <div>
                                                <span class="badge bg-primary me-2" id="totalProducts">0</span>
                                                <span class="badge bg-success me-2" id="activeProducts">0</span>
                                                <span class="badge bg-warning" id="lowStockProducts">0</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="products-table">
                                    <div class="table-responsive">
                                        <table class="table">
                                            <thead>
                                                <tr>
                                                    <th width="5%">#</th>
                                                    <th width="25%">اسم المنتج</th>
                                                    <th width="10%">الكود</th>
                                                    <th width="12%">الفئة</th>
                                                    <th width="10%">الوحدة</th>
                                                    <th width="15%">السعر</th>
                                                    <th width="13%">المخزون</th>
                                                    <th width="10%">الإجراءات</th>
                                                </tr>
                                            </thead>
                                            <tbody id="productsTableBody">
                                                <tr>
                                                    <td colspan="8" class="text-center">
                                                        <div class="loading-state">
                                                            <div class="spinner-border loading-spinner" role="status">
                                                                <span class="visually-hidden">جاري التحميل...</span>
                                                            </div>
                                                            <h5 class="loading-text">جاري تحميل المنتجات...</h5>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <!-- Pagination -->
                                <nav aria-label="Products pagination" class="mt-3">
                                    <ul class="pagination justify-content-center" id="productsPagination">
                                        <!-- Pagination will be generated here -->
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>

                    <!-- Categories Tab -->
                    <div class="tab-pane fade" id="categories-pane">
                        <!-- Categories Header with Stats -->
                        <div class="categories-header mb-4">
                            <div class="row">
                                <div class="col-md-8">
                                    <div class="categories-stats">
                                        <div class="stat-item">
                                            <span class="stat-number" id="totalCategoriesCount">0</span>
                                            <span class="stat-label">إجمالي الفئات</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-number" id="activeCategoriesCount">0</span>
                                            <span class="stat-label">نشط</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-number" id="totalProductsInCategories">0</span>
                                            <span class="stat-label">إجمالي المنتجات</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 text-end">
                                    <button id="addCategoryBtn" class="btn-modern btn-modern-primary">
                                        <i class="fas fa-plus"></i>
                                        إضافة فئة جديدة
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Search and Filters -->
                        <div class="categories-toolbar mb-3">
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="search-box">
                                        <i class="fas fa-search"></i>
                                        <input type="text" id="categorySearch" class="form-control" placeholder="البحث في الفئات..." onkeyup="ProductsModule.filterCategories()">
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <select id="categoryStatusFilter" class="form-select" onchange="ProductsModule.filterCategories()">
                                        <option value="">جميع الفئات</option>
                                        <option value="active">نشط</option>
                                        <option value="inactive">غير نشط</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <select id="categorySortBy" class="form-select" onchange="ProductsModule.sortCategories()">
                                        <option value="name">ترتيب حسب الاسم</option>
                                        <option value="products">ترتيب حسب عدد المنتجات</option>
                                        <option value="created">ترتيب حسب تاريخ الإنشاء</option>
                                    </select>
                                </div>
                                <div class="col-md-2">
                                    <button class="btn btn-outline-secondary w-100" onclick="ProductsModule.clearCategoryFilters()" title="مسح الفلاتر">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="view-toggle mb-3">
                            <div class="view-actions">
                                <button class="btn btn-success btn-sm" onclick="ProductsModule.exportCategories()" title="تصدير الفئات">
                                    <i class="fas fa-download"></i>
                                </button>
                                <button class="btn btn-warning btn-sm" onclick="ProductsModule.showBulkImportModal('categories')" title="إدراج فئات متعدد">
                                    <i class="fas fa-upload"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Categories Content -->
                        <div class="categories-content">
                            <!-- Table View -->
                            <div class="categories-table" id="categoriesTableView">
                                <div class="card">
                                    <div class="card-body">
                                        <div class="table-responsive">
                                            <table class="table table-striped table-hover">
                                                <thead class="table-dark">
                                                    <tr>
                                                        <th width="5%">#</th>
                                                        <th width="15%">الأيقونة</th>
                                                        <th width="25%">اسم الفئة</th>
                                                        <th width="20%">الوصف</th>
                                                        <th width="15%">عدد المنتجات</th>
                                                        <th width="10%">الحالة</th>
                                                        <th width="10%">الإجراءات</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="categoriesTableBody">
                                                    <tr>
                                                        <td colspan="7" class="text-center">
                                                            <div class="spinner-border" role="status">
                                                                <span class="visually-hidden">جاري التحميل...</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Units Tab -->
                    <div class="tab-pane fade" id="units-pane">
                        <!-- Units Header with Stats -->
                        <div class="categories-header mb-4">
                            <div class="row">
                                <div class="col-md-8">
                                    <div class="categories-stats">
                                        <div class="stat-item">
                                            <span class="stat-number" id="totalUnitsCount">0</span>
                                            <span class="stat-label">إجمالي الوحدات</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-number" id="activeUnitsCount">0</span>
                                            <span class="stat-label">نشط</span>
                                        </div>
                                        <div class="stat-item">
                                            <span class="stat-number" id="totalProductsInUnits">0</span>
                                            <span class="stat-label">إجمالي المنتجات</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4 text-end">
                                    <button id="addUnitBtn" class="btn btn-primary">
                                        <i class="fas fa-plus"></i>
                                        إضافة وحدة جديدة
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Search and Filters -->
                        <div class="categories-toolbar mb-3">
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="search-box">
                                        <i class="fas fa-search"></i>
                                        <input type="text" id="unitSearch" class="form-control" placeholder="البحث في الوحدات..." onkeyup="ProductsModule.filterUnits()">
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <select id="unitStatusFilter" class="form-select" onchange="ProductsModule.filterUnits()">
                                        <option value="">جميع الوحدات</option>
                                        <option value="active">نشط</option>
                                        <option value="inactive">غير نشط</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <select id="unitSortBy" class="form-select" onchange="ProductsModule.sortUnits()">
                                        <option value="name">ترتيب حسب الاسم</option>
                                        <option value="products">ترتيب حسب عدد المنتجات</option>
                                        <option value="created">ترتيب حسب تاريخ الإنشاء</option>
                                    </select>
                                </div>
                                <div class="col-md-2">
                                    <button class="btn btn-outline-secondary w-100" onclick="ProductsModule.clearUnitFilters()" title="مسح الفلاتر">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="view-toggle mb-3">
                            <div class="view-actions">
                                <button class="btn btn-success btn-sm" onclick="ProductsModule.exportUnits()" title="تصدير الوحدات">
                                    <i class="fas fa-download"></i>
                                </button>
                                <button class="btn btn-warning btn-sm" onclick="ProductsModule.showBulkImportModal('units')" title="إدراج وحدات متعدد">
                                    <i class="fas fa-upload"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Units Content -->
                        <div class="categories-content">
                            <!-- Table View -->
                            <div class="units-table" id="unitsTableView">
                                <div class="card">
                                    <div class="card-body">
                                        <div class="table-responsive">
                                            <table class="table table-striped table-hover">
                                                <thead class="table-dark">
                                                    <tr>
                                                        <th width="5%">#</th>
                                                        <th width="12%">الرمز</th>
                                                        <th width="20%">اسم الوحدة</th>
                                                        <th width="23%">الوصف</th>
                                                        <th width="12%">عدد المنتجات</th>
                                                        <th width="8%">الحالة</th>
                                                        <th width="8%">الإجراءات</th>
                                                    </tr>
                                                </thead>
                                                <tbody id="unitsTableBody">
                                                    <tr>
                                                        <td colspan="7" class="text-center">
                                                            <div class="spinner-border" role="status">
                                                                <span class="visually-hidden">جاري التحميل...</span>
                                                            </div>
                                                        </td>
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
            </div>
        `;
    },

    /**
     * Load module
     */
    async load() {
        try {
            console.log('🚀 Loading Products Module (Clean Version)...');
            
            // Render HTML
            this.render();
            
            // Wait for DOM
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load data
            await this.loadData();
            
            // Render tables
            this.renderAllTables();
            
            // Update summary cards
            this.updateSummaryCards();
            
            // Update filter options
            this.updateFilterOptions();
            
            // Setup real-time sync
            this.setupProductsSync();
            
            console.log('✅ Products Module loaded successfully');
            console.log(`📊 Final Data: Products: ${this.products.length}, Categories: ${this.categories.length}, Units: ${this.units.length}`);
            
            // Ensure first tab is shown
            setTimeout(() => {
                this.showTab('products-pane');
            }, 100);
            
            // Initialize tooltips
            this.initializeTooltips();
            
        } catch (error) {
            console.error('❌ Error loading products module:', error);
            this.showError('خطأ في تحميل وحدة المنتجات: ' + error.message);
        }
    },

    /**
     * Initialize tooltips
     * تهيئة التلميحات
     */
    initializeTooltips() {
        try {
            // Initialize Bootstrap tooltips
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
            
            // Initialize popovers
            const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
            popoverTriggerList.map(function (popoverTriggerEl) {
                return new bootstrap.Popover(popoverTriggerEl);
            });
            
            console.log('✅ Tooltips and popovers initialized');
        } catch (error) {
            console.error('❌ Error initializing tooltips:', error);
        }
    },

    /**
     * Render module HTML
     */
    render() {
        console.log('🎨 Rendering products module...');
        
        const contentArea = document.getElementById('content-area');
        if (!contentArea) {
            console.error('❌ Content area not found!');
            return;
        }
        
        contentArea.innerHTML = this.getHTML();
        console.log('✅ Products HTML rendered');
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Add product button
        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                this.showAddProductModal();
            });
            console.log('✅ Add product button event listener set');
        } else {
            console.warn('⚠️ Add product button not found');
        }

        // Add category button
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => {
                this.showAddCategoryModal();
            });
            console.log('✅ Add category button event listener set');
        } else {
            console.warn('⚠️ Add category button not found');
        }

        // Add unit button
        const addUnitBtn = document.getElementById('addUnitBtn');
        if (addUnitBtn) {
            addUnitBtn.addEventListener('click', () => {
                this.showAddUnitModal();
            });
            console.log('✅ Add unit button event listener set');
        } else {
            console.warn('⚠️ Add unit button not found');
        }

        // Save category button
        const saveCategoryBtn = document.getElementById('saveCategoryBtn');
        if (saveCategoryBtn) {
            saveCategoryBtn.addEventListener('click', () => {
                this.saveCategory();
            });
            console.log('✅ Save category button event listener set');
        } else {
            console.warn('⚠️ Save category button not found');
        }

        // Save unit button
        const saveUnitBtn = document.getElementById('saveUnitBtn');
        if (saveUnitBtn) {
            saveUnitBtn.addEventListener('click', () => {
                this.saveUnit();
            });
            console.log('✅ Save unit button event listener set');
        } else {
            console.warn('⚠️ Save unit button not found');
        }

        // Product form event listeners
        this.setupProductFormListeners();

        // Setup tab event listeners
        this.setupTabListeners();
        
        // Setup icon picker event listeners
        this.setupIconPickerListeners();
        
        console.log('✅ Event listeners setup completed');
    },

    /**
     * Setup icon picker event listeners
     * إعداد مستمعي أحداث اختيار الأيقونة
     */
    setupIconPickerListeners() {
        console.log('🎨 Setting up icon picker event listeners...');
        
        // Wait for DOM to be ready
        setTimeout(() => {
            const iconPickerItems = document.querySelectorAll('.icon-picker-item');
            
            iconPickerItems.forEach(item => {
                item.addEventListener('click', () => {
                    const iconClass = item.getAttribute('data-icon');
                    this.selectCategoryIcon(iconClass);
                });
            });
            
            console.log(`✅ Icon picker event listeners set for ${iconPickerItems.length} icons`);
        }, 100);
    },

    /**
     * Select category icon
     * اختيار أيقونة الفئة
     */
    selectCategoryIcon(iconClass) {
        console.log('🎨 Selecting category icon:', iconClass);
        
        // Update hidden input
        const categoryIconInput = document.getElementById('categoryIcon');
        if (categoryIconInput) {
            categoryIconInput.value = iconClass;
        }
        
        // Update preview with color
        const categoryIconPreview = document.getElementById('categoryIconPreview');
        if (categoryIconPreview) {
            const iconElement = categoryIconPreview.querySelector('i');
            if (iconElement) {
                iconElement.className = iconClass;
            }
            // Update preview background with current color
            this.updateCategoryIconPreview();
        }
        
        // Update selected text
        const selectedIconText = document.getElementById('selectedIconText');
        if (selectedIconText) {
            selectedIconText.textContent = iconClass;
        }
        
        // Update all icon picker items to remove active class
        const iconPickerItems = document.querySelectorAll('.icon-picker-item');
        iconPickerItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to selected icon
        const selectedItem = document.querySelector(`[data-icon="${iconClass}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
        
        console.log('✅ Category icon selected:', iconClass);
    },

    /**
     * Setup color picker event listener
     * إعداد مستمع أحداث اختيار اللون
     */
    setupColorPickerListener() {
        console.log('🎨 Setting up color picker event listener...');
        
        const colorPicker = document.getElementById('categoryColor');
        if (colorPicker) {
            colorPicker.addEventListener('change', () => {
                this.updateCategoryIconPreview();
            });
            console.log('✅ Color picker event listener set');
        } else {
            console.warn('⚠️ Color picker not found');
        }
    },

    /**
     * Update category icon preview
     * تحديث معاينة أيقونة الفئة
     */
    updateCategoryIconPreview() {
        const colorPicker = document.getElementById('categoryColor');
        const iconPreview = document.getElementById('categoryIconPreview');
        
        if (colorPicker && iconPreview) {
            const color = colorPicker.value;
            const lighterColor = this.lightenColor(color, 30);
            iconPreview.style.background = `linear-gradient(135deg, ${color} 0%, ${lighterColor} 100%)`;
            iconPreview.style.boxShadow = `0 4px 15px ${color}66`;
            console.log('✅ Category icon preview updated with color:', color);
        }
    },

    /**
     * Setup tab event listeners
     * إعداد مستمعي أحداث التبويبات
     */
    setupTabListeners() {
        console.log('🔧 Setting up tab event listeners...');
        
        // Products tab
        const productsTab = document.getElementById('productsTab');
        if (productsTab) {
            productsTab.addEventListener('click', (e) => {
                e.preventDefault();
                this.showTab('products-pane');
                console.log('✅ Products tab clicked');
            });
        }
        
        // Categories tab
        const categoriesTab = document.getElementById('categoriesTab');
        if (categoriesTab) {
            categoriesTab.addEventListener('click', (e) => {
                e.preventDefault();
                this.showTab('categories-pane');
                console.log('✅ Categories tab clicked');
            });
        }
        
        // Units tab
        const unitsTab = document.getElementById('unitsTab');
        if (unitsTab) {
            unitsTab.addEventListener('click', (e) => {
                e.preventDefault();
                this.showTab('units-pane');
                console.log('✅ Units tab clicked');
            });
        }
        
        console.log('✅ Tab event listeners setup completed');
    },

    /**
     * Show specific tab
     * عرض تبويب محدد
     */
    showTab(tabId) {
        console.log(`🔧 Showing tab: ${tabId}`);
        
        // Hide all tabs
        const allTabs = document.querySelectorAll('.tab-pane');
        allTabs.forEach(tab => {
            tab.classList.remove('show', 'active');
            tab.style.display = 'none';
        });
        
        // Remove active class from all nav links
        const allNavLinks = document.querySelectorAll('.nav-link');
        allNavLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Show selected tab
        const selectedTab = document.getElementById(tabId);
        if (selectedTab) {
            selectedTab.classList.add('show', 'active');
            selectedTab.style.display = 'block';
            console.log(`✅ Tab ${tabId} shown`);
        }
        
        // Add active class to corresponding nav link
        const navLink = document.querySelector(`[href="#${tabId}"]`);
        if (navLink) {
            navLink.classList.add('active');
            console.log(`✅ Nav link for ${tabId} activated`);
        }
        
        // Render tables for the active tab
        if (tabId === 'products-pane') {
            this.renderProductsTable();
        } else if (tabId === 'categories-pane') {
            this.renderCategoriesTable();
        } else if (tabId === 'units-pane') {
            this.renderUnitsTable();
        }
    },

    /**
     * Setup product form event listeners
     * إعداد مستمعي أحداث نموذج المنتج
     */
    setupProductFormListeners(preserveValues = {}) {
        // Save current values before replacing elements, or use provided values
        const categoryValue = preserveValues.categoryId || document.getElementById('productCategory')?.value || '';
        const unitValue = preserveValues.unitId || document.getElementById('productUnit')?.value || '';
        const currencyValue = preserveValues.currency || document.getElementById('productCurrency')?.value || '';
        const expiryValue = preserveValues.hasExpiryDate !== undefined ? preserveValues.hasExpiryDate : (document.getElementById('hasExpiryDate')?.checked || false);
        const forceExpiryOnInputValue = preserveValues.forceExpiryOnInput !== undefined ? preserveValues.forceExpiryOnInput : (document.getElementById('forceExpiryOnInput')?.checked || false);
        const forceExpiryOnOutputValue = preserveValues.forceExpiryOnOutput !== undefined ? preserveValues.forceExpiryOnOutput : (document.getElementById('forceExpiryOnOutput')?.checked || false);
        const serialValue = preserveValues.hasSerialNumber !== undefined ? preserveValues.hasSerialNumber : (document.getElementById('hasSerialNumber')?.checked || false);
        const forceSerialOnInputValue = preserveValues.forceSerialOnInput !== undefined ? preserveValues.forceSerialOnInput : (document.getElementById('forceSerialOnInput')?.checked || false);
        const forceSerialOnOutputValue = preserveValues.forceSerialOnOutput !== undefined ? preserveValues.forceSerialOnOutput : (document.getElementById('forceSerialOnOutput')?.checked || false);
        const expiryWarningValue = preserveValues.expiryWarningDays || document.getElementById('expiryWarningDays')?.value || '30';
        
        console.log('🔧 Saving current values before setup:', {
            category: categoryValue,
            unit: unitValue,
            currency: currencyValue,
            expiry: expiryValue,
            forceExpiryOnInput: forceExpiryOnInputValue,
            forceExpiryOnOutput: forceExpiryOnOutputValue,
            serial: serialValue,
            forceSerialOnInput: forceSerialOnInputValue,
            forceSerialOnOutput: forceSerialOnOutputValue,
            expiryWarning: expiryWarningValue
        });
        
        // Save product button - remove existing listeners first
        const saveBtn = document.getElementById('saveProductBtn');
        if (saveBtn) {
            // Clone the button to remove all event listeners
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
            
            newSaveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveProduct();
            });
        }

        // Category change - regenerate code
        const categorySelect = document.getElementById('productCategory');
        if (categorySelect) {
            // Remove existing listeners
            const newCategorySelect = categorySelect.cloneNode(true);
            categorySelect.parentNode.replaceChild(newCategorySelect, categorySelect);
            
            // Restore the saved value
            if (categoryValue) {
                newCategorySelect.value = categoryValue;
                console.log('🔧 Restored category value:', categoryValue);
            }
            
            newCategorySelect.addEventListener('change', () => {
                this.generateProductCode();
            });
        }

        // Expiry date checkbox
        const expiryCheckbox = document.getElementById('hasExpiryDate');
        if (expiryCheckbox) {
            // Remove existing listeners
            const newExpiryCheckbox = expiryCheckbox.cloneNode(true);
            expiryCheckbox.parentNode.replaceChild(newExpiryCheckbox, expiryCheckbox);
            
            // Restore the saved value
            newExpiryCheckbox.checked = expiryValue;
            console.log('🔧 Restored expiry checkbox value:', expiryValue);
            
            newExpiryCheckbox.addEventListener('change', () => {
                this.toggleExpirySettings();
            });
        }

        // Serial number checkbox
        const serialCheckbox = document.getElementById('hasSerialNumber');
        if (serialCheckbox) {
            // Remove existing listeners
            const newSerialCheckbox = serialCheckbox.cloneNode(true);
            serialCheckbox.parentNode.replaceChild(newSerialCheckbox, serialCheckbox);
            
            // Restore the saved value
            newSerialCheckbox.checked = serialValue;
            console.log('🔧 Restored serial checkbox value:', serialValue);
            
            newSerialCheckbox.addEventListener('change', () => {
                this.toggleSerialSettings();
            });
        }

        // Image upload
        const imageInput = document.getElementById('productImage');
        if (imageInput) {
            // Remove existing listeners
            const newImageInput = imageInput.cloneNode(true);
            imageInput.parentNode.replaceChild(newImageInput, imageInput);
            
            newImageInput.addEventListener('change', (e) => {
                this.handleImageUpload(e);
            });
        }

        // Unit change - enable/disable sub units and update existing sub units
        const unitSelect = document.getElementById('productUnit');
        if (unitSelect) {
            // Remove existing listeners
            const newUnitSelect = unitSelect.cloneNode(true);
            unitSelect.parentNode.replaceChild(newUnitSelect, unitSelect);
            
            // Restore the saved value
            if (unitValue) {
                newUnitSelect.value = unitValue;
                console.log('🔧 Restored unit value:', unitValue);
            }
            
            newUnitSelect.addEventListener('change', () => {
                this.toggleSubUnitsButton();
                this.updateExistingSubUnits();
            });
        }

        // Add sub unit button
        const addSubUnitBtn = document.getElementById('addSubUnitBtn');
        if (addSubUnitBtn) {
            // Remove existing listeners
            const newAddSubUnitBtn = addSubUnitBtn.cloneNode(true);
            addSubUnitBtn.parentNode.replaceChild(newAddSubUnitBtn, addSubUnitBtn);
            
            newAddSubUnitBtn.addEventListener('click', () => {
                this.addSubUnit();
            });
        }

        // Main unit price change listeners
        const purchasePriceField = document.getElementById('purchasePrice');
        const sellingPriceField = document.getElementById('sellingPrice');
        const wholesalePriceField = document.getElementById('wholesalePrice');

        if (purchasePriceField) {
            purchasePriceField.addEventListener('input', () => {
                this.updateAllSubUnitPrices();
            });
        }

        if (sellingPriceField) {
            sellingPriceField.addEventListener('input', () => {
                this.updateAllSubUnitPrices();
            });
        }

        if (wholesalePriceField) {
            wholesalePriceField.addEventListener('input', () => {
                this.updateAllSubUnitPrices();
            });
        }

        // Currency change listener
        const currencySelect = document.getElementById('productCurrency');
        if (currencySelect) {
            // Remove existing listeners
            const newCurrencySelect = currencySelect.cloneNode(true);
            currencySelect.parentNode.replaceChild(newCurrencySelect, currencySelect);
            
            // Restore the saved value
            if (currencyValue) {
                newCurrencySelect.value = currencyValue;
                console.log('🔧 Restored currency value:', currencyValue);
                // Update currency suffixes immediately after restoring value
                setTimeout(() => {
                    this.updateCurrencySuffixes(currencyValue);
                }, 100);
            } else {
                // Get current value and update suffixes
                const currentCurrency = newCurrencySelect.value || 'IQD';
                setTimeout(() => {
                    this.updateCurrencySuffixes(currentCurrency);
                }, 100);
            }
            
            newCurrencySelect.addEventListener('change', () => {
                this.updateCurrencySuffixes(newCurrencySelect.value);
            });
        }
        
        // Update visibility of advanced settings after restoring values
        console.log('🔧 Updating advanced settings visibility...');
        // Use setTimeout to ensure DOM is updated after element replacement
        setTimeout(() => {
            this.toggleExpirySettings();
            this.toggleSerialSettings();
        }, 50);
    },

    /**
     * Toggle sub units button
     * تبديل زر الوحدات الفرعية
     */
    toggleSubUnitsButton() {
        const unitSelect = document.getElementById('productUnit');
        const addSubUnitBtn = document.getElementById('addSubUnitBtn');
        
        if (unitSelect && addSubUnitBtn) {
            if (unitSelect.value) {
                addSubUnitBtn.disabled = false;
            } else {
                addSubUnitBtn.disabled = true;
                // Clear sub units container
                const container = document.getElementById('subUnitsContainer');
                if (container) {
                    container.innerHTML = '';
                }
            }
        }
    },

    /**
     * Get selected sub unit IDs
     * الحصول على معرفات الوحدات الفرعية المختارة
     */
    getSelectedSubUnitIds() {
        const selectedIds = [];
        const subUnitItems = document.querySelectorAll('.sub-unit-item');
        
        subUnitItems.forEach(item => {
            const unitSelect = item.querySelector('.sub-unit-unit');
            if (unitSelect && unitSelect.value) {
                selectedIds.push(unitSelect.value);
            }
        });
        
        return selectedIds;
    },

    /**
     * Check if unit is already selected as sub unit
     * التحقق من اختيار الوحدة كوحدة فرعية مسبقاً
     */
    isUnitAlreadySelected(unitId) {
        const selectedIds = this.getSelectedSubUnitIds();
        return selectedIds.includes(unitId);
    },

    /**
     * Add sub unit
     * إضافة وحدة فرعية
     */
    async addSubUnit() {
        const container = document.getElementById('subUnitsContainer');
        if (!container) return;

        // Allow adding new sub units - no restrictions

        // Check if units are loaded
        if (!this.units || this.units.length === 0) {
            this.showError('يجب تحميل الوحدات أولاً');
            return;
        }

        // Load currencies if not loaded
        if (!this.currencies || this.currencies.length === 0) {
            await this.loadCurrencies();
        }

        // Get selected main unit
        const mainUnitId = document.getElementById('productUnit').value;
        if (!mainUnitId) {
            this.showError('يجب اختيار الوحدة الأساسية أولاً');
            return;
        }

        const subUnitId = 'subUnit_' + Date.now();
        
        // Get already selected sub unit IDs
        const selectedSubUnitIds = this.getSelectedSubUnitIds();
        
        // Create units dropdown options (exclude main unit and already selected units)
        const unitsOptions = this.units
            .filter(unit => unit.id !== mainUnitId && !selectedSubUnitIds.includes(unit.id))
            .map(unit => `<option value="${unit.id}">${unit.name}</option>`)
            .join('');

        // Note: Currency is now unified at product level, not per sub-unit
        // All sub-units use the product's main currency

        const subUnitHtml = `
            <div class="sub-unit-item border rounded p-3 mb-3" id="${subUnitId}">
                <div class="row">
                    <div class="col-md-3">
                        <label class="form-label">الوحدة الفرعية</label>
                        <select class="form-control sub-unit-unit" required onchange="ProductsModule.updateConversionNote('${subUnitId}'); ProductsModule.forceRecalculateSubUnitPrices('${subUnitId}'); ProductsModule.updateSubUnitDropdownOptions()">
                            <option value="">اختر الوحدة</option>
                            ${unitsOptions}
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label">نوع التحويل</label>
                        <select class="form-control sub-unit-conversion-type" onchange="ProductsModule.updateConversionNote('${subUnitId}'); ProductsModule.forceRecalculateSubUnitPrices('${subUnitId}'); ProductsModule.updateSubUnitDropdownOptions()">
                            <option value="multiply">ضرب (×)</option>
                            <option value="divide">قسمة (÷)</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">التعادل</label>
                        <div class="input-group">
                            <input type="number" class="form-control sub-unit-conversion-value" placeholder="12" min="1" step="0.01" onchange="ProductsModule.updateConversionNote('${subUnitId}'); ProductsModule.forceRecalculateSubUnitPrices('${subUnitId}'); ProductsModule.updateSubUnitDropdownOptions()">
                            <button class="btn btn-outline-info" type="button" onclick="ProductsModule.showConversionDetails('${subUnitId}')" title="عرض تفاصيل الحساب">
                                <i class="fas fa-calculator"></i>
                            </button>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">سعر الشراء</label>
                        <input type="number" class="form-control sub-unit-purchase-price" placeholder="0.00" min="0" step="0.01">
                    </div>
                    <div class="col-md-2">
                        <label class="form-label">&nbsp;</label>
                        <button type="button" class="btn btn-outline-danger btn-sm w-100" onclick="ProductsModule.removeSubUnit('${subUnitId}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-md-3">
                        <label class="form-label">سعر الجملة</label>
                        <input type="number" class="form-control sub-unit-wholesale-price" placeholder="0.00" min="0" step="0.01">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">سعر المفرد</label>
                        <input type="number" class="form-control sub-unit-retail-price" placeholder="0.00" min="0" step="0.01">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">&nbsp;</label>
                        <button type="button" class="btn btn-outline-primary btn-sm w-100" onclick="ProductsModule.calculateSubUnitPrices('${subUnitId}')" title="إعادة حساب الأسعار">
                            <i class="fas fa-calculator"></i> إعادة حساب
                        </button>
                    </div>
                </div>
                <div class="row mt-2">
                    <div class="col-12">
                        <div class="conversion-note alert alert-info" id="conversionNote_${subUnitId}" style="display: none;">
                            <!-- Conversion note content will be dynamically inserted here -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', subUnitHtml);
        
        // Setup event listeners for sub-unit price fields to convert back to main unit
        setTimeout(() => {
            this.setupSubUnitPriceListeners(subUnitId);
        }, 50);
        
        // Auto-calculate prices for the new sub unit after a short delay
        setTimeout(() => {
            this.forceRecalculateSubUnitPrices(subUnitId);
        }, 100);
    },

    /**
     * Update sub unit dropdown options
     * تحديث خيارات قائمة الوحدات الفرعية
     */
    updateSubUnitDropdownOptions() {
        const mainUnitId = document.getElementById('productUnit').value;
        const subUnitItems = document.querySelectorAll('.sub-unit-item');
        
        subUnitItems.forEach(item => {
            const unitSelect = item.querySelector('.sub-unit-unit');
            if (!unitSelect) return;
            
            const currentValue = unitSelect.value;
            
            // Get already selected sub unit IDs (excluding current item)
            const selectedSubUnitIds = [];
            document.querySelectorAll('.sub-unit-item').forEach(otherItem => {
                if (otherItem !== item) {
                    const otherUnitSelect = otherItem.querySelector('.sub-unit-unit');
                    if (otherUnitSelect && otherUnitSelect.value) {
                        selectedSubUnitIds.push(otherUnitSelect.value);
                    }
                }
            });
            
            // Clear existing options
            unitSelect.innerHTML = '<option value="">اختر الوحدة</option>';
            
            // Add new options (exclude main unit and already selected units)
            if (this.units && this.units.length > 0) {
                this.units
                    .filter(unit => unit.id !== mainUnitId && !selectedSubUnitIds.includes(unit.id))
                    .forEach(unit => {
                        const option = document.createElement('option');
                        option.value = unit.id;
                        option.textContent = unit.name;
                        if (unit.id === currentValue) {
                            option.selected = true;
                        }
                        unitSelect.appendChild(option);
                    });
            }
        });
    },

    /**
     * Update existing sub units when main unit changes
     * تحديث الوحدات الفرعية الموجودة عند تغيير الوحدة الأساسية
     */
    updateExistingSubUnits() {
        // Update dropdown options
        this.updateSubUnitDropdownOptions();
        
        // Update conversion notes
        const subUnitItems = document.querySelectorAll('.sub-unit-item');
        subUnitItems.forEach(item => {
            const subUnitId = item.id;
            this.updateConversionNote(subUnitId);
        });
    },

    /**
     * Update all sub unit prices when main unit prices change
     * تحديث جميع أسعار الوحدات الفرعية عند تغيير أسعار الوحدة الأساسية
     */
    updateAllSubUnitPrices() {
        const subUnitItems = document.querySelectorAll('.sub-unit-item');
        subUnitItems.forEach(item => {
            const subUnitId = item.id;
            this.calculateSubUnitPrices(subUnitId);
        });
    },

    /**
     * Get currency exchange rate from currencies management module
     * الحصول على سعر صرف العملة من إدارة العملات
     * 
     * IMPORTANT: All exchange rates MUST come from currencies management module
     * All conversions: fromCurrency -> IQD (base) -> toCurrency
     */
    async getCurrencyExchangeRate(fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return 1;
        
        try {
            // Ensure currencies are loaded from currencies management
            if (!this.currencies || this.currencies.length === 0) {
                console.warn('⚠️ Currencies not loaded, loading from currencies management...');
                await this.loadCurrencies();
            }
            
            // Find currencies in currencies management
            const fromCurrencyObj = this.currencies.find(c => c.code === fromCurrency);
            const toCurrencyObj = this.currencies.find(c => c.code === toCurrency);
            
            // If currencies not found, try reloading
            if (!fromCurrencyObj) {
                console.warn(`⚠️ Currency ${fromCurrency} not found, reloading currencies...`);
                await this.loadCurrencies();
                const reloadedFromCurrencyObj = this.currencies.find(c => c.code === fromCurrency);
                if (!reloadedFromCurrencyObj) {
                    console.error(`❌ CRITICAL: Currency ${fromCurrency} not found in currencies management!`);
                    console.error(`Available currencies:`, this.currencies.map(c => `${c.code} (${c.name})`).join(', '));
                    if (typeof showError === 'function') {
                        showError(`خطأ: العملة ${fromCurrency} غير موجودة في إدارة العملات. يرجى إضافتها أولاً.`);
                    }
                    return 1; // Return 1 to avoid breaking, but conversion will be incorrect
                }
            }
            
            if (!toCurrencyObj) {
                console.warn(`⚠️ Currency ${toCurrency} not found, reloading currencies...`);
                await this.loadCurrencies();
                const reloadedToCurrencyObj = this.currencies.find(c => c.code === toCurrency);
                if (!reloadedToCurrencyObj) {
                    console.error(`❌ CRITICAL: Currency ${toCurrency} not found in currencies management!`);
                    console.error(`Available currencies:`, this.currencies.map(c => `${c.code} (${c.name})`).join(', '));
                    if (typeof showError === 'function') {
                        showError(`خطأ: العملة ${toCurrency} غير موجودة في إدارة العملات. يرجى إضافتها أولاً.`);
                    }
                    return 1; // Return 1 to avoid breaking, but conversion will be incorrect
                }
            }
            
            // Get exchange rates from currencies management
            // All rates are relative to IQD (base currency)
            const fromExchangeRate = fromCurrencyObj?.exchangeRate || (fromCurrency === 'IQD' ? 1 : null);
            const toExchangeRate = toCurrencyObj?.exchangeRate || (toCurrency === 'IQD' ? 1 : null);
            
            if (!fromExchangeRate || !toExchangeRate) {
                console.error(`❌ CRITICAL: Exchange rates not found in currencies management!`);
                console.error(`   - ${fromCurrency}: ${fromExchangeRate || 'NOT FOUND'}`);
                console.error(`   - ${toCurrency}: ${toExchangeRate || 'NOT FOUND'}`);
                if (typeof showError === 'function') {
                    showError(`خطأ: أسعار الصرف غير موجودة في إدارة العملات للعملات ${fromCurrency} و ${toCurrency}.`);
                }
                return 1;
            }
            
            // Convert: fromCurrency -> IQD -> toCurrency
            // If fromCurrency is IQD, we just need to divide by toExchangeRate
            // If toCurrency is IQD, we just multiply by fromExchangeRate
            // Otherwise, we convert: fromCurrency -> IQD -> toCurrency
            
            let exchangeRate;
            if (fromCurrency === 'IQD') {
                // IQD -> other currency: divide by target currency rate
                exchangeRate = 1 / toExchangeRate;
                console.log(`💱 Exchange rate from currencies management: ${fromCurrency} -> ${toCurrency} = 1 / ${toExchangeRate} = ${exchangeRate}`);
            } else if (toCurrency === 'IQD') {
                // Other currency -> IQD: multiply by source currency rate
                exchangeRate = fromExchangeRate;
                console.log(`💱 Exchange rate from currencies management: ${fromCurrency} -> ${toCurrency} = ${fromExchangeRate}`);
            } else {
                // Other currency -> Other currency: convert via IQD
                // Step 1: fromCurrency -> IQD (multiply by fromExchangeRate)
                // Step 2: IQD -> toCurrency (divide by toExchangeRate)
                exchangeRate = fromExchangeRate / toExchangeRate;
                console.log(`💱 Exchange rate from currencies management: ${fromCurrency} -> ${toCurrency} = ${fromExchangeRate} / ${toExchangeRate} = ${exchangeRate} (via IQD)`);
            }
            
            console.log(`✅ Using exchange rate from currencies management: ${fromCurrency} -> ${toCurrency} = ${exchangeRate}`);
            return exchangeRate;
            
        } catch (error) {
            console.error('❌ Error getting exchange rate from currencies management:', error);
            return 1; // Return 1 to avoid breaking the calculation
        }
    },

    /**
     * Get exchange rate from database
     * الحصول على سعر الصرف من قاعدة البيانات
     */
    async getExchangeRateFromDatabase(fromCurrency, toCurrency) {
        try {
            const doc = await db.collection('exchangeRates').doc(`${fromCurrency}_${toCurrency}`).get();
            if (doc.exists) {
                const data = doc.data();
                return data.rate || null;
            }
            return null;
        } catch (error) {
            console.error('❌ Error getting exchange rate from database:', error);
            return null;
        }
    },

    /**
     * Get exchange rate from external API
     * الحصول على سعر الصرف من API خارجي
     */
    async getExchangeRateFromAPI(fromCurrency, toCurrency) {
        try {
            // Using a free exchange rate API
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
            if (response.ok) {
                const data = await response.json();
                return data.rates[toCurrency] || null;
            }
            return null;
        } catch (error) {
            console.error('❌ Error getting exchange rate from API:', error);
            return null;
        }
    },

    /**
     * Save exchange rate to database
     * حفظ سعر الصرف في قاعدة البيانات
     */
    async saveExchangeRateToDatabase(fromCurrency, toCurrency, rate) {
        try {
            await db.collection('exchangeRates').doc(`${fromCurrency}_${toCurrency}`).set({
                fromCurrency,
                toCurrency,
                rate,
                updatedAt: new Date(),
                source: 'API'
            });
            console.log(`💾 Saved exchange rate: ${fromCurrency} to ${toCurrency} = ${rate}`);
        } catch (error) {
            console.error('❌ Error saving exchange rate:', error);
        }
    },

    /**
     * Convert price between currencies using currencies management
     * تحويل السعر بين العملات باستخدام إدارة العملات
     * 
     * IMPORTANT: All conversions go through IQD (base currency)
     * Process: fromCurrency -> IQD -> toCurrency
     */
    async convertCurrency(price, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return price;
        
        console.log(`💱 Converting ${price} ${fromCurrency} to ${toCurrency} using currencies management`);
        
        // Ensure currencies are loaded
        if (!this.currencies || this.currencies.length === 0) {
            await this.loadCurrencies();
        }
        
        // Find currencies in currencies management
        const fromCurrencyObj = this.currencies.find(c => c.code === fromCurrency);
        const toCurrencyObj = this.currencies.find(c => c.code === toCurrency);
        
        if (!fromCurrencyObj || !toCurrencyObj) {
            console.error(`❌ CRITICAL: Currency not found in currencies management!`);
            console.error(`   - ${fromCurrency}: ${fromCurrencyObj ? 'FOUND' : 'NOT FOUND'}`);
            console.error(`   - ${toCurrency}: ${toCurrencyObj ? 'FOUND' : 'NOT FOUND'}`);
            if (typeof showError === 'function') {
                showError(`خطأ: العملة غير موجودة في إدارة العملات. يرجى إضافتها أولاً.`);
            }
            return price; // Return original price if conversion fails
        }
        
        // Get exchange rates from currencies management
        const fromExchangeRate = fromCurrencyObj.exchangeRate || (fromCurrency === 'IQD' ? 1 : null);
        const toExchangeRate = toCurrencyObj.exchangeRate || (toCurrency === 'IQD' ? 1 : null);
        
        if (!fromExchangeRate || !toExchangeRate) {
            console.error(`❌ CRITICAL: Exchange rates not found in currencies management!`);
            console.error(`   - ${fromCurrency}: ${fromExchangeRate || 'NOT FOUND'}`);
            console.error(`   - ${toCurrency}: ${toExchangeRate || 'NOT FOUND'}`);
            return price; // Return original price if conversion fails
        }
        
        // Convert: fromCurrency -> IQD -> toCurrency
        let convertedPrice;
        if (fromCurrency === 'IQD') {
            // IQD -> other currency: divide by target currency rate
            convertedPrice = price / toExchangeRate;
            console.log(`💱 Step 1: ${price} IQD ÷ ${toExchangeRate} = ${convertedPrice.toFixed(2)} ${toCurrency}`);
        } else if (toCurrency === 'IQD') {
            // Other currency -> IQD: multiply by source currency rate
            convertedPrice = price * fromExchangeRate;
            console.log(`💱 Step 1: ${price} ${fromCurrency} × ${fromExchangeRate} = ${convertedPrice.toFixed(2)} IQD`);
        } else {
            // Other currency -> Other currency: convert via IQD
            // Step 1: fromCurrency -> IQD
            const priceInIQD = price * fromExchangeRate;
            console.log(`💱 Step 1: ${price} ${fromCurrency} × ${fromExchangeRate} = ${priceInIQD.toFixed(2)} IQD`);
            // Step 2: IQD -> toCurrency
            convertedPrice = priceInIQD / toExchangeRate;
            console.log(`💱 Step 2: ${priceInIQD.toFixed(2)} IQD ÷ ${toExchangeRate} = ${convertedPrice.toFixed(2)} ${toCurrency}`);
        }
        
        console.log(`✅ Final conversion: ${price} ${fromCurrency} → ${convertedPrice.toFixed(2)} ${toCurrency} (using currencies management)`);
        return convertedPrice;
    },

    /**
     * Get current exchange rates display
     * عرض أسعار الصرف الحالية
     */
    async getCurrentExchangeRates() {
        try {
            const currencies = ['IQD', 'USD', 'EUR'];
            const rates = {};
            
            for (const fromCurrency of currencies) {
                rates[fromCurrency] = {};
                for (const toCurrency of currencies) {
                    if (fromCurrency === toCurrency) {
                        rates[fromCurrency][toCurrency] = 1;
                    } else {
                        const rate = await this.getExchangeRateFromDatabase(fromCurrency, toCurrency);
                        rates[fromCurrency][toCurrency] = rate || 'غير متوفر';
                    }
                }
            }
            
            return rates;
        } catch (error) {
            console.error('❌ Error getting current exchange rates:', error);
            return null;
        }
    },

    /**
     * Force recalculate sub unit prices (used when conversion type changes)
     * إعادة حساب أسعار الوحدة الفرعية بالقوة (عند تغيير نوع التحويل)
     */
    async forceRecalculateSubUnitPrices(subUnitId) {
        const element = document.getElementById(subUnitId);
        if (!element) return;

        const conversionType = element.querySelector('.sub-unit-conversion-type').value;
        const conversionValue = parseFloat(element.querySelector('.sub-unit-conversion-value').value) || 0;

        if (!conversionValue || conversionValue <= 0) return;

        // Get main unit prices and currency (unified currency for all units)
        const mainPurchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
        const mainWholesalePrice = parseFloat(document.getElementById('wholesalePrice').value) || 0;
        const mainRetailPrice = parseFloat(document.getElementById('sellingPrice').value) || 0;
        const mainCurrency = document.getElementById('productCurrency').value || 'IQD';

        // All units use the product's main currency (no separate currency per sub-unit)

        // Calculate sub unit prices in main currency first
        let subPurchasePrice, subWholesalePrice, subRetailPrice;

        console.log(`🧮 Calculating prices with conversion factor: ${conversionValue} (${conversionType})`);
        console.log(`📊 Main unit prices: Purchase: ${mainPurchasePrice}, Wholesale: ${mainWholesalePrice}, Retail: ${mainRetailPrice}`);

        if (conversionType === 'multiply') {
            // If multiply: 1 sub unit = conversionValue * main unit
            // So sub unit price = main unit price * conversionValue
            // Example: 1 carton = 24 pieces, so carton_price = piece_price * 24
            subPurchasePrice = mainPurchasePrice * conversionValue;
            subWholesalePrice = mainWholesalePrice * conversionValue;
            subRetailPrice = mainRetailPrice * conversionValue; // Retail price from main unit retail price
            
            console.log(`✖️ Multiply conversion: Sub unit = Main unit × ${conversionValue}`);
            console.log(`📈 Calculated sub prices: Purchase: ${subPurchasePrice.toFixed(2)}, Wholesale: ${subWholesalePrice.toFixed(2)}, Retail: ${subRetailPrice.toFixed(2)}`);
        } else {
            // If divide: 1 main unit = conversionValue * sub unit
            // So sub unit price = main unit price / conversionValue
            // Example: 1 piece = 24 cartons, so piece_price = carton_price / 24
            subPurchasePrice = mainPurchasePrice / conversionValue;
            subWholesalePrice = mainWholesalePrice / conversionValue;
            subRetailPrice = mainRetailPrice / conversionValue; // Retail price from main unit retail price
            
            console.log(`➗ Divide conversion: Sub unit = Main unit ÷ ${conversionValue}`);
            console.log(`📈 Calculated sub prices: Purchase: ${subPurchasePrice.toFixed(2)}, Wholesale: ${subWholesalePrice.toFixed(2)}, Retail: ${subRetailPrice.toFixed(2)}`);
        }

        // All units use the same currency (product's main currency), no conversion needed

        // Force update all price fields
        const purchasePriceField = element.querySelector('.sub-unit-purchase-price');
        const wholesalePriceField = element.querySelector('.sub-unit-wholesale-price');
        const retailPriceField = element.querySelector('.sub-unit-retail-price');

        purchasePriceField.value = subPurchasePrice.toFixed(2);
        wholesalePriceField.value = subWholesalePrice.toFixed(2);
        retailPriceField.value = subRetailPrice.toFixed(2);
        
        console.log(`✅ Sub unit prices recalculated successfully`);
        console.log(`💰 Final prices: Purchase: ${subPurchasePrice.toFixed(2)}, Wholesale: ${subWholesalePrice.toFixed(2)}, Retail: ${subRetailPrice.toFixed(2)}`);
    },

    /**
     * Calculate sub unit prices based on main unit prices and conversion
     * حساب أسعار الوحدة الفرعية بناءً على أسعار الوحدة الأساسية والتحويل
     */
    calculateSubUnitPrices(subUnitId) {
        const element = document.getElementById(subUnitId);
        if (!element) return;

        const conversionType = element.querySelector('.sub-unit-conversion-type').value;
        const conversionValue = parseFloat(element.querySelector('.sub-unit-conversion-value').value) || 0;

        if (!conversionValue || conversionValue <= 0) return;

        // Get main unit prices (all three prices)
        const mainPurchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
        const mainWholesalePrice = parseFloat(document.getElementById('wholesalePrice').value) || 0;
        const mainRetailPrice = parseFloat(document.getElementById('sellingPrice').value) || 0;

        // Calculate sub unit prices
        let subPurchasePrice, subWholesalePrice, subRetailPrice;

        console.log(`🧮 Calculating prices with conversion factor: ${conversionValue} (${conversionType})`);
        console.log(`📊 Main unit prices: Purchase: ${mainPurchasePrice}, Wholesale: ${mainWholesalePrice}, Retail: ${mainRetailPrice}`);

        if (conversionType === 'multiply') {
            // If multiply: 1 sub unit = conversionValue * main unit
            // So sub unit price = main unit price * conversionValue
            // Example: 1 carton = 24 pieces, so carton_price = piece_price * 24
            subPurchasePrice = mainPurchasePrice * conversionValue;
            subWholesalePrice = mainWholesalePrice * conversionValue;
            subRetailPrice = mainRetailPrice * conversionValue; // Retail price from main unit retail price
            
            console.log(`✖️ Multiply conversion: Sub unit = Main unit × ${conversionValue}`);
            console.log(`📈 Calculated sub prices: Purchase: ${subPurchasePrice.toFixed(2)}, Wholesale: ${subWholesalePrice.toFixed(2)}, Retail: ${subRetailPrice.toFixed(2)}`);
        } else {
            // If divide: 1 main unit = conversionValue * sub unit
            // So sub unit price = main unit price / conversionValue
            // Example: 1 piece = 24 cartons, so piece_price = carton_price / 24
            subPurchasePrice = mainPurchasePrice / conversionValue;
            subWholesalePrice = mainWholesalePrice / conversionValue;
            subRetailPrice = mainRetailPrice / conversionValue; // Retail price from main unit retail price
            
            console.log(`➗ Divide conversion: Sub unit = Main unit ÷ ${conversionValue}`);
            console.log(`📈 Calculated sub prices: Purchase: ${subPurchasePrice.toFixed(2)}, Wholesale: ${subWholesalePrice.toFixed(2)}, Retail: ${subRetailPrice.toFixed(2)}`);
        }

        // Update price fields
        const purchasePriceField = element.querySelector('.sub-unit-purchase-price');
        const wholesalePriceField = element.querySelector('.sub-unit-wholesale-price');
        const retailPriceField = element.querySelector('.sub-unit-retail-price');

        // Always update prices when conversion changes
        purchasePriceField.value = subPurchasePrice.toFixed(2);
        wholesalePriceField.value = subWholesalePrice.toFixed(2);
        retailPriceField.value = subRetailPrice.toFixed(2);
        
        console.log(`✅ Sub unit prices updated successfully`);
        console.log(`💰 Final prices: Purchase: ${subPurchasePrice.toFixed(2)}, Wholesale: ${subWholesalePrice.toFixed(2)}, Retail: ${subRetailPrice.toFixed(2)}`);
    },

    /**
     * Convert sub-unit price back to main unit when manually changed
     * تحويل سعر الوحدة الفرعية إلى الوحدة الأساسية عند التعديل اليدوي
     * @param {string} subUnitId - ID of the sub-unit element
     * @param {string} priceType - Type of price: 'purchase', 'wholesale', or 'retail'
     */
    convertSubUnitPriceToMainUnit(subUnitId, priceType) {
        const element = document.getElementById(subUnitId);
        if (!element) return;

        const conversionType = element.querySelector('.sub-unit-conversion-type').value;
        const conversionValue = parseFloat(element.querySelector('.sub-unit-conversion-value').value) || 0;

        if (!conversionValue || conversionValue <= 0) {
            console.warn('⚠️ Invalid conversion value for sub-unit:', subUnitId);
            return;
        }

        // Get the manually entered sub-unit price
        let subUnitPrice = 0;
        const priceField = element.querySelector(`.sub-unit-${priceType}-price`);
        
        if (!priceField) {
            console.warn(`⚠️ Price field not found for type: ${priceType}`);
            return;
        }

        subUnitPrice = parseFloat(priceField.value) || 0;
        
        if (subUnitPrice <= 0) {
            console.log(`ℹ️ Sub-unit ${priceType} price is zero or empty, skipping conversion`);
            return;
        }

        // Convert from sub-unit price to main unit price
        let mainUnitPrice = 0;
        
        if (conversionType === 'multiply') {
            // If multiply: 1 sub unit = conversionValue * main unit
            // So: 1 main unit = 1 sub unit / conversionValue
            // Main unit price = sub unit price / conversionValue
            mainUnitPrice = subUnitPrice / conversionValue;
            console.log(`🔄 Converting sub-unit ${priceType} price: ${subUnitPrice} ÷ ${conversionValue} = ${mainUnitPrice.toFixed(2)} (multiply type)`);
        } else {
            // If divide: 1 main unit = conversionValue * sub unit
            // So: 1 main unit = conversionValue * sub unit
            // Main unit price = sub unit price * conversionValue
            mainUnitPrice = subUnitPrice * conversionValue;
            console.log(`🔄 Converting sub-unit ${priceType} price: ${subUnitPrice} × ${conversionValue} = ${mainUnitPrice.toFixed(2)} (divide type)`);
        }

        // Update the main unit price field
        // Note: 'retail' in sub-unit corresponds to 'sellingPrice' in main unit
        const mainPriceFieldId = priceType === 'purchase' ? 'purchasePrice' : 
                                  priceType === 'wholesale' ? 'wholesalePrice' : 
                                  priceType === 'retail' ? 'sellingPrice' : 'sellingPrice';
        
        const mainPriceField = document.getElementById(mainPriceFieldId);
        if (mainPriceField) {
            mainPriceField.value = mainUnitPrice.toFixed(2);
            console.log(`✅ Updated main unit ${priceType} price to: ${mainUnitPrice.toFixed(2)}`);
            
            // Trigger input event to update all other sub-units (but prevent infinite loop)
            const event = new Event('input', { bubbles: true });
            mainPriceField.dispatchEvent(event);
        } else {
            console.warn(`⚠️ Main unit price field not found: ${mainPriceFieldId}`);
        }
    },

    /**
     * Show conversion details modal
     * عرض تفاصيل معامل التحويل
     */
    showConversionDetails(subUnitId) {
        const element = document.getElementById(subUnitId);
        if (!element) return;

        const conversionType = element.querySelector('.sub-unit-conversion-type').value;
        const conversionValue = parseFloat(element.querySelector('.sub-unit-conversion-value').value) || 0;
        const subUnitName = element.querySelector('.sub-unit-unit option:selected').textContent;
        
        // Get main unit info
        const mainUnitId = document.getElementById('productUnit').value;
        const mainUnit = this.units.find(u => u.id === mainUnitId);
        const mainUnitName = mainUnit?.name || 'الوحدة الأساسية';
        
        // Get prices
        const mainPurchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
        const mainWholesalePrice = parseFloat(document.getElementById('wholesalePrice').value) || 0;
        
        // Calculate sub unit prices
        let subPurchasePrice, subWholesalePrice;
        
        if (conversionType === 'multiply') {
            // If multiply: 1 sub unit = conversionValue * main unit
            // So sub unit price = main unit price * conversionValue
            subPurchasePrice = mainPurchasePrice * conversionValue;
            subWholesalePrice = mainWholesalePrice * conversionValue;
        } else {
            // If divide: 1 main unit = conversionValue * sub unit
            // So sub unit price = main unit price / conversionValue
            subPurchasePrice = mainPurchasePrice / conversionValue;
            subWholesalePrice = mainWholesalePrice / conversionValue;
        }

        // Create modal HTML
        const modalHtml = `
            <div class="modal fade" id="conversionDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-info text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-calculator me-2"></i>
                                تفاصيل معامل التحويل
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6 class="text-primary mb-3">
                                        <i class="fas fa-info-circle me-2"></i>
                                        معلومات التحويل
                                    </h6>
                                    <div class="card bg-light">
                                        <div class="card-body">
                                            <p><strong>الوحدة الأساسية:</strong> ${mainUnitName}</p>
                                            <p><strong>الوحدة الفرعية:</strong> ${subUnitName}</p>
                                            <p><strong>نوع التحويل:</strong> 
                                                <span class="badge ${conversionType === 'multiply' ? 'bg-success' : 'bg-warning'}">
                                                    ${conversionType === 'multiply' ? 'ضرب (×)' : 'قسمة (÷)'}
                                                </span>
                                            </p>
                                            <p><strong>معامل التحويل:</strong> 
                                                <span class="badge bg-info fs-6">${conversionValue}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="text-success mb-3">
                                        <i class="fas fa-chart-line me-2"></i>
                                        حساب الأسعار
                                    </h6>
                                    <div class="card bg-light">
                                        <div class="card-body">
                                            <div class="mb-2">
                                                <small class="text-muted">سعر الشراء:</small><br>
                                                <strong>${mainPurchasePrice.toFixed(2)}</strong> 
                                                ${conversionType === 'multiply' ? '÷' : '×'} 
                                                <strong>${conversionValue}</strong> 
                                                = <span class="text-success">${subPurchasePrice.toFixed(2)}</span>
                                            </div>
                                            <div class="mb-2">
                                                <small class="text-muted">سعر الجملة:</small><br>
                                                <strong>${mainWholesalePrice.toFixed(2)}</strong> 
                                                ${conversionType === 'multiply' ? '÷' : '×'} 
                                                <strong>${conversionValue}</strong> 
                                                = <span class="text-success">${subWholesalePrice.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row mt-3">
                                <div class="col-12">
                                    <h6 class="text-warning mb-3">
                                        <i class="fas fa-lightbulb me-2"></i>
                                        مثال توضيحي
                                    </h6>
                                    <div class="alert alert-info">
                                        ${conversionType === 'multiply' 
                                            ? `إذا كان سعر الشراء للوحدة الأساسية ${mainUnitName} = ${mainPurchasePrice.toFixed(2)} دينار<br>ومعامل التحويل = ${conversionValue} (ضرب)<br>فإن سعر الشراء للوحدة الفرعية ${subUnitName} = ${mainPurchasePrice.toFixed(2)} × ${conversionValue} = ${subPurchasePrice.toFixed(2)} دينار`
                                            : `إذا كان سعر الشراء للوحدة الأساسية ${mainUnitName} = ${mainPurchasePrice.toFixed(2)} دينار<br>ومعامل التحويل = ${conversionValue} (قسمة)<br>فإن سعر الشراء للوحدة الفرعية ${subUnitName} = ${mainPurchasePrice.toFixed(2)} ÷ ${conversionValue} = ${subPurchasePrice.toFixed(2)} دينار`
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إغلاق</button>
                            <button type="button" class="btn btn-primary" onclick="ProductsModule.forceRecalculateSubUnitPrices('${subUnitId}')">
                                <i class="fas fa-sync-alt me-2"></i>
                                إعادة حساب الأسعار
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('conversionDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('conversionDetailsModal'));
        modal.show();

        // Remove modal from DOM when hidden
        document.getElementById('conversionDetailsModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    },

    /**
     * Update conversion note
     * تحديث ملاحظة التحويل
     */
    updateConversionNote(subUnitId) {
        const element = document.getElementById(subUnitId);
        if (!element) return;

        const unitSelect = element.querySelector('.sub-unit-unit');
        const conversionType = element.querySelector('.sub-unit-conversion-type');
        const conversionValue = element.querySelector('.sub-unit-conversion-value');
        const noteElement = element.querySelector('.conversion-note');

        if (!unitSelect || !conversionType || !conversionValue || !noteElement) return;

        const selectedUnitId = unitSelect.value;
        const type = conversionType.value;
        const value = parseFloat(conversionValue.value);

        if (!selectedUnitId || !value || value <= 0) {
            noteElement.style.display = 'none';
            return;
        }

        // Get main unit and sub unit names
        const mainUnitId = document.getElementById('productUnit').value;
        const mainUnit = this.units.find(u => u.id === mainUnitId);
        const subUnit = this.units.find(u => u.id === selectedUnitId);

        if (!mainUnit || !subUnit) return;

        const mainUnitName = mainUnit.name;
        const subUnitName = subUnit.name;

        // Create more interactive and clear conversion text
        let conversionText = '';
        let alertClass = 'alert-info';
        
        if (type === 'multiply') {
            alertClass = 'alert-success';
            conversionText = `
                <div class="d-flex align-items-center mb-2">
                    <i class="fas fa-exchange-alt text-success me-2"></i>
                    <strong>معادلة التحويل:</strong>
                </div>
                <div class="conversion-equation mb-2">
                    <span class="badge bg-primary fs-6 me-2">1 ${subUnitName}</span>
                    <i class="fas fa-equals text-success mx-2"></i>
                    <span class="badge bg-success fs-6 me-2">${value} ${mainUnitName}</span>
                </div>
                <div class="conversion-explanation">
                    <div class="alert alert-light border-start border-success border-3 mb-2">
                        <i class="fas fa-info-circle text-success me-1"></i>
                        <strong>مثال:</strong> كل <span class="text-primary fw-bold">1 ${subUnitName}</span> يحتوي على <span class="text-success fw-bold">${value} ${mainUnitName}</span>
                    </div>
                    <div class="alert alert-light border-start border-info border-3">
                        <i class="fas fa-calculator text-info me-1"></i>
                        <strong>حساب السعر:</strong> سعر ${subUnitName} = سعر ${mainUnitName} × ${value}
                    </div>
                </div>
            `;
        } else {
            alertClass = 'alert-warning';
            conversionText = `
                <div class="d-flex align-items-center mb-2">
                    <i class="fas fa-exchange-alt text-warning me-2"></i>
                    <strong>معادلة التحويل:</strong>
                </div>
                <div class="conversion-equation mb-2">
                    <span class="badge bg-primary fs-6 me-2">1 ${mainUnitName}</span>
                    <i class="fas fa-equals text-warning mx-2"></i>
                    <span class="badge bg-warning fs-6 me-2">${value} ${subUnitName}</span>
                </div>
                <div class="conversion-explanation">
                    <div class="alert alert-light border-start border-warning border-3 mb-2">
                        <i class="fas fa-info-circle text-warning me-1"></i>
                        <strong>مثال:</strong> كل <span class="text-primary fw-bold">1 ${mainUnitName}</span> يحتوي على <span class="text-warning fw-bold">${value} ${subUnitName}</span>
                    </div>
                    <div class="alert alert-light border-start border-info border-3">
                        <i class="fas fa-calculator text-info me-1"></i>
                        <strong>حساب السعر:</strong> سعر ${subUnitName} = سعر ${mainUnitName} ÷ ${value}
                    </div>
                </div>
            `;
        }

        // Update note element with better styling
        noteElement.className = `conversion-note alert ${alertClass} border`;
        noteElement.innerHTML = conversionText;
        noteElement.style.display = 'block';
        
        // Add smooth animation
        noteElement.style.opacity = '0';
        noteElement.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            noteElement.style.transition = 'all 0.3s ease';
            noteElement.style.opacity = '1';
            noteElement.style.transform = 'translateY(0)';
        }, 50);
    },

    /**
     * Remove sub unit
     * إزالة وحدة فرعية
     */
    async removeSubUnit(subUnitId) {
        // Check if this specific sub unit has transactions
        if (this.currentEditId) {
            const hasSpecificSubUnitTransactions = await this.hasSpecificSubUnitTransactions(this.currentEditId, subUnitId);
            if (hasSpecificSubUnitTransactions) {
                this.showError('لا يمكن حذف هذه الوحدة الفرعية لأن المنتج له حركات عليها');
                return;
            }
        }

        const element = document.getElementById(subUnitId);
        if (element) {
            element.remove();
            // Update dropdown options after removal
            this.updateSubUnitDropdownOptions();
        }
    },

    /**
     * Get sub units data
     * الحصول على بيانات الوحدات الفرعية
     */
    getSubUnitsData() {
        const subUnits = [];
        const subUnitItems = document.querySelectorAll('.sub-unit-item');
        
        // Get product's main currency (all sub-units use the same currency)
        const productCurrency = document.getElementById('productCurrency')?.value || 'IQD';
        
        subUnitItems.forEach(item => {
            const unitId = item.querySelector('.sub-unit-unit').value;
            const conversionType = item.querySelector('.sub-unit-conversion-type').value;
            const conversionValue = parseFloat(item.querySelector('.sub-unit-conversion-value').value) || 0;
            const purchasePrice = parseFloat(item.querySelector('.sub-unit-purchase-price').value) || 0;
            const wholesalePrice = parseFloat(item.querySelector('.sub-unit-wholesale-price').value) || 0;
            const retailPrice = parseFloat(item.querySelector('.sub-unit-retail-price').value) || 0;
            
            if (unitId && conversionValue > 0) {
                // Find unit name
                const unit = this.units.find(u => u.id === unitId);
                const unitName = unit ? unit.name : 'غير محدد';
                
                subUnits.push({
                    unitId: unitId,
                    unitName: unitName,
                    conversionType: conversionType,
                    conversionValue: conversionValue,
                    // All sub-units use the product's main currency
                    purchasePrice: purchasePrice,
                    wholesalePrice: wholesalePrice,
                    retailPrice: retailPrice
                });
            }
        });
        
        return subUnits;
    },

    /**
     * Load sub units data
     * تحميل بيانات الوحدات الفرعية
     */
    loadSubUnitsData(subUnits) {
        const container = document.getElementById('subUnitsContainer');
        if (!container || !subUnits || subUnits.length === 0) return;

        container.innerHTML = '';
        
        // Check if units are loaded
        if (!this.units || this.units.length === 0) {
            console.warn('⚠️ Units not loaded for sub units');
            return;
        }
        
        // Get main unit ID to exclude it from options
        const mainUnitId = document.getElementById('productUnit').value;
        console.log('🔍 Loading sub units data, main unit ID:', mainUnitId);
        
        // If main unit is not set yet, wait a bit more
        if (!mainUnitId) {
            console.log('🔍 Main unit not set yet, waiting...');
            setTimeout(() => {
                this.loadSubUnitsData(subUnits);
            }, 100);
            return;
        }
        
        subUnits.forEach(subUnit => {
            console.log('🔍 Processing sub unit:', subUnit);
            const subUnitId = 'subUnit_' + Date.now() + '_' + Math.random();
            const selectedUnitId = subUnit.unitId || subUnit.unit || '';
            const conversionType = subUnit.conversionType || 'multiply';
            const conversionValue = subUnit.conversionValue || subUnit.quantity || '';
            
            console.log('🔍 Sub unit details:', {
                selectedUnitId,
                conversionType,
                conversionValue
            });
            
            // Create units dropdown options (exclude main unit)
            const availableUnits = this.units.filter(unit => unit.id !== mainUnitId);
            console.log('🔍 Available units for sub unit:', availableUnits);
            
            const unitsOptionsWithSelection = availableUnits
                .map(unit => {
                    const selected = unit.id === selectedUnitId ? 'selected' : '';
                    console.log('🔍 Unit option:', unit.id, unit.name, 'selected:', selected);
                    return `<option value="${unit.id}" ${selected}>${unit.name}</option>`;
                }).join('');

            // Note: Currency is unified at product level, not per sub-unit
            
            const subUnitHtml = `
                <div class="sub-unit-item border rounded p-3 mb-3" id="${subUnitId}">
                    <div class="row">
                        <div class="col-md-3">
                            <label class="form-label">الوحدة الفرعية</label>
                            <select class="form-control sub-unit-unit" required onchange="ProductsModule.updateConversionNote('${subUnitId}'); ProductsModule.forceRecalculateSubUnitPrices('${subUnitId}'); ProductsModule.updateSubUnitDropdownOptions()">
                                <option value="">اختر الوحدة</option>
                                ${unitsOptionsWithSelection}
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">نوع التحويل</label>
                            <select class="form-control sub-unit-conversion-type" onchange="ProductsModule.updateConversionNote('${subUnitId}'); ProductsModule.forceRecalculateSubUnitPrices('${subUnitId}'); ProductsModule.updateSubUnitDropdownOptions()">
                                <option value="multiply" ${conversionType === 'multiply' ? 'selected' : ''}>ضرب (×)</option>
                                <option value="divide" ${conversionType === 'divide' ? 'selected' : ''}>قسمة (÷)</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">التعادل</label>
                            <input type="number" class="form-control sub-unit-conversion-value" value="${conversionValue}" placeholder="12" min="1" step="0.01" onchange="ProductsModule.updateConversionNote('${subUnitId}'); ProductsModule.forceRecalculateSubUnitPrices('${subUnitId}'); ProductsModule.updateSubUnitDropdownOptions()">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">سعر الشراء</label>
                            <input type="number" class="form-control sub-unit-purchase-price" value="${subUnit.purchasePrice || ''}" placeholder="0.00" min="0" step="0.01">
                        </div>
                        <div class="col-md-1">
                            <label class="form-label">&nbsp;</label>
                            <button type="button" class="btn btn-outline-danger btn-sm w-100" onclick="ProductsModule.removeSubUnit('${subUnitId}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="row mt-2">
                        <div class="col-md-3">
                            <label class="form-label">سعر الجملة</label>
                            <input type="number" class="form-control sub-unit-wholesale-price" value="${subUnit.wholesalePrice || ''}" placeholder="0.00" min="0" step="0.01">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">سعر المفرد</label>
                            <input type="number" class="form-control sub-unit-retail-price" value="${subUnit.retailPrice || ''}" placeholder="0.00" min="0" step="0.01">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">&nbsp;</label>
                            <button type="button" class="btn btn-outline-primary btn-sm w-100" onclick="ProductsModule.calculateSubUnitPrices('${subUnitId}')" title="إعادة حساب الأسعار">
                                <i class="fas fa-calculator"></i> إعادة حساب
                            </button>
                        </div>
                    </div>
                    <div class="row mt-2">
                        <div class="col-12">
                            <div class="conversion-note alert alert-info" id="conversionNote_${subUnitId}" style="display: none;">
                                <!-- Conversion note content will be dynamically inserted here -->
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', subUnitHtml);
            console.log('🔍 Added sub unit HTML to container');
            
            // Setup event listeners for sub-unit price fields to convert back to main unit
            setTimeout(() => {
                const element = document.getElementById(subUnitId);
                if (element) {
                    this.setupSubUnitPriceListeners(subUnitId);
                }
            }, 50);
            
            // Update conversion note after loading
            setTimeout(() => {
                this.updateConversionNote(subUnitId);
            }, 100);
        });
        
        console.log('🔍 Finished loading sub units data');
    },

    /**
     * Setup event listeners for sub-unit price fields
     * إعداد مستمعي الأحداث لحقول أسعار الوحدة الفرعية
     * @param {string} subUnitId - ID of the sub-unit element
     */
    setupSubUnitPriceListeners(subUnitId) {
        const element = document.getElementById(subUnitId);
        if (!element) return;

        const purchasePriceField = element.querySelector('.sub-unit-purchase-price');
        const wholesalePriceField = element.querySelector('.sub-unit-wholesale-price');
        const retailPriceField = element.querySelector('.sub-unit-retail-price');
        
        // Track manual price changes
        let isManualPriceChange = false;
        
        // Purchase price change - convert back to main unit
        if (purchasePriceField) {
            // Remove existing listeners by cloning
            const newPurchaseField = purchasePriceField.cloneNode(true);
            purchasePriceField.parentNode.replaceChild(newPurchaseField, purchasePriceField);
            
            newPurchaseField.addEventListener('focus', () => {
                isManualPriceChange = true;
            });
            
            newPurchaseField.addEventListener('input', () => {
                if (isManualPriceChange) {
                    this.convertSubUnitPriceToMainUnit(subUnitId, 'purchase');
                }
            });
            
            newPurchaseField.addEventListener('blur', () => {
                isManualPriceChange = false;
            });
        }
        
        // Wholesale price change - convert back to main unit
        if (wholesalePriceField) {
            // Remove existing listeners by cloning
            const newWholesaleField = wholesalePriceField.cloneNode(true);
            wholesalePriceField.parentNode.replaceChild(newWholesaleField, wholesalePriceField);
            
            newWholesaleField.addEventListener('focus', () => {
                isManualPriceChange = true;
            });
            
            newWholesaleField.addEventListener('input', () => {
                if (isManualPriceChange) {
                    this.convertSubUnitPriceToMainUnit(subUnitId, 'wholesale');
                }
            });
            
            newWholesaleField.addEventListener('blur', () => {
                isManualPriceChange = false;
            });
        }
        
        // Retail price change - convert back to main unit
        if (retailPriceField) {
            // Remove existing listeners by cloning
            const newRetailField = retailPriceField.cloneNode(true);
            retailPriceField.parentNode.replaceChild(newRetailField, retailPriceField);
            
            newRetailField.addEventListener('focus', () => {
                isManualPriceChange = true;
            });
            
            newRetailField.addEventListener('input', () => {
                if (isManualPriceChange) {
                    this.convertSubUnitPriceToMainUnit(subUnitId, 'retail');
                }
            });
            
            newRetailField.addEventListener('blur', () => {
                isManualPriceChange = false;
            });
        }
    },

    /**
     * Handle image upload
     * التعامل مع رفع الصورة
     */
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showError('يرجى اختيار ملف صورة صالح');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            this.showError('حجم الصورة يجب أن يكون أقل من 2 ميجابايت');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = `
                <img src="${e.target.result}" class="img-thumbnail" style="max-width: 150px; max-height: 150px;">
                <button type="button" class="btn btn-sm btn-danger mt-2" onclick="this.parentElement.style.display='none'; document.getElementById('productImage').value='';">
                    <i class="fas fa-times"></i> إزالة
                </button>
            `;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    },

    /**
     * Load all data
     */
    async loadData() {
        console.log('📊 Loading data...');
        
        try {
            // Load currencies
            await this.loadCurrencies();
            
            // Load categories
            await this.loadCategories();
            
            // Load units
            await this.loadUnits();
            
            // Load products
            await this.loadProducts();
            
            // Collections loaded successfully
            console.log('✅ Collections loaded successfully');
            
            console.log('✅ Data loaded successfully');
            console.log(`📊 Categories: ${this.categories.length}, Units: ${this.units.length}, Products: ${this.products.length}`);
            
        } catch (error) {
            console.error('❌ Error loading data:', error);
            this.showError('خطأ في تحميل البيانات: ' + error.message);
        }
    },

    /**
     * Load currencies
     */
    async loadCurrencies() {
        try {
            console.log('📥 Loading currencies from currencies management module...');
            // Load currencies from currencies collection (currencies management module)
            const snapshot = await db.collection('currencies').get();
            this.currencies = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    code: data.code || '',
                    name: data.name || '',
                    symbol: data.symbol || data.code || '',
                    exchangeRate: data.exchangeRate || 1, // Exchange rate from currencies management
                    isBaseCurrency: data.isBaseCurrency || false,
                    status: data.status || 'active',
                    ...data
                };
            });
            
            // Ensure IQD exists with exchange rate 1 if not found in currencies management
            if (!this.currencies.find(c => c.code === 'IQD')) {
                console.warn('⚠️ IQD not found in currencies management, adding as fallback');
                this.currencies.push({
                    id: 'IQD',
                    code: 'IQD',
                    name: 'دينار عراقي',
                    symbol: 'د.ع',
                    exchangeRate: 1,
                    isBaseCurrency: true,
                    status: 'active'
                });
            }
            
            console.log(`✅ Loaded ${this.currencies.length} currencies from currencies management with exchange rates`);
            console.log('💱 Currencies from management:', this.currencies.map(c => `${c.code} (${c.name}): ${c.exchangeRate}`));
            console.log('📋 All currencies and exchange rates are from currencies management module');
        } catch (error) {
            console.error('❌ Error loading currencies from currencies management:', error);
            this.currencies = [];
            // Fallback: add default IQD currency
            this.currencies.push({
                id: 'IQD',
                code: 'IQD',
                name: 'دينار عراقي',
                symbol: 'د.ع',
                exchangeRate: 1,
                isBaseCurrency: true,
                status: 'active'
            });
        }
    },


    /**
     * Load categories
     */
    async loadCategories() {
        try {
            console.log('🔄 Loading categories from database...');
            const snapshot = await db.collection('categories').get();
            this.categories = [];
            snapshot.forEach(doc => {
                this.categories.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            console.log(`✅ Loaded ${this.categories.length} categories from database`);
            
            // Store original categories for filtering
            this.originalCategories = [...this.categories];
            
            // Update statistics after loading
            this.updateCategoriesStats();
        } catch (error) {
            console.error('❌ Error loading categories:', error);
            this.categories = [];
            this.showError('خطأ في تحميل الفئات: ' + error.message);
        }
    },

    /**
     * Load units
     */
    async loadUnits() {
        try {
            console.log('🔄 Loading units from database...');
            const snapshot = await db.collection('units').get();
            this.units = [];
            snapshot.forEach(doc => {
                this.units.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            console.log(`✅ Loaded ${this.units.length} units from database`);
            
            // Store original units for filtering
            this.originalUnits = [...this.units];
            
            // Update statistics after loading
            this.updateUnitsStats();
        } catch (error) {
            console.error('❌ Error loading units:', error);
            this.units = [];
            this.showError('خطأ في تحميل الوحدات: ' + error.message);
        }
    },

    /**
     * Load products
     */
    async loadProducts() {
        try {
            console.log('🔄 Loading products from database...');
            const startTime = performance.now();
            
            // Use Collections.getProducts with cache support
            const products = await Collections.getProducts({ limit: 1000 });
            
            this.products = products.map(product => ({
                id: product.id,
                ...product
            }));
            
            this.filteredProducts = [...this.products];
            
            const endTime = performance.now();
            const loadTime = ((endTime - startTime) / 1000).toFixed(2);
            console.log(`✅ Loaded ${this.products.length} products from database in ${loadTime}s`);
            
            // Products loaded successfully
            console.log('✅ Products loaded successfully');
        } catch (error) {
            console.error('❌ Error loading products:', error);
            this.products = [];
            this.filteredProducts = [];
        }
    },



    /**
     * Render all tables
     */
    renderAllTables() {
        console.log('🎨 Rendering all tables...');
        console.log(`📊 Data: Products: ${this.products.length}, Categories: ${this.categories.length}, Units: ${this.units.length}`);
        
        this.renderProductsTable();
        this.renderCategoriesTable();
        this.renderUnitsTable();
        this.updateCategoriesStats();
        this.updateUnitsStats();
        
        console.log('✅ All tables rendered successfully');
    },

    /**
     * Render products table
     */
    renderProductsTable() {
        console.log('🎨 Rendering products table...');
        
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) {
            console.warn('⚠️ Products table body not found - module may not be rendered yet');
            return;
        }
        
        // Add loading animation
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="loading-state">
                        <div class="spinner-border loading-spinner" role="status">
                            <span class="visually-hidden">جاري التحميل...</span>
                        </div>
                        <h5 class="loading-text">جاري تحميل المنتجات...</h5>
                    </div>
                </td>
            </tr>
        `;
        
        // Use filtered products if available, otherwise use all products
        const productsToRender = this.filteredProducts || this.products;
        
        // Simulate loading delay for better UX
        setTimeout(() => {
            if (productsToRender.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center">
                            <div class="empty-state">
                                <i class="fas fa-box-open empty-state-icon"></i>
                                <h4 class="empty-state-title">لا توجد منتجات</h4>
                                <p class="empty-state-description">ابدأ بإضافة منتج جديد إلى نظامك</p>
                                <div class="empty-state-actions">
                                    <button class="btn btn-primary btn-lg" onclick="ProductsModule.showAddProductModal()">
                                        <i class="fas fa-plus me-2"></i> إضافة منتج جديد
                                    </button>
                                    <button class="btn btn-outline-warning btn-lg" onclick="ProductsModule.recodeAll()">
                                        <i class="fas fa-sync-alt me-2"></i> إعادة ترميز
                                    </button>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
                this.updateProductsSummary();
                this.renderPagination();
                return;
            }

            tbody.innerHTML = '';
            productsToRender.forEach((product, index) => {
            // Find category and unit with better error handling
            const category = this.categories ? this.categories.find(c => c.id === product.categoryId) : null;
            const unit = this.units ? this.units.find(u => u.id === product.unitId) : null;
            
            console.log(`Product ${product.name}: categoryId=${product.categoryId}, unitId=${product.unitId}`);
            console.log(`Found category: ${category?.name || 'Not found'}, unit: ${unit?.name || 'Not found'}`);
            
            const currentStock = product.currentStock || product.stock || 0;
            const minStock = product.minStock || 0;
            const isLowStock = currentStock <= minStock;
            const status = product.status || 'active';
            
            const row = document.createElement('tr');
            row.className = `product-row ${status === 'inactive' ? 'table-secondary' : ''}`;
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            row.style.transition = 'all 0.3s ease';
            
            // Add entrance animation with delay
            setTimeout(() => {
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, index * 50);
            
            row.innerHTML = `
                <td class="text-center">
                    <span class="badge-enhanced badge-category">${index + 1}</span>
                </td>
                <td>
                    <div class="product-info">
                        <div class="product-icon">
                            <i class="fas fa-box"></i>
                        </div>
                        <div>
                            <div class="product-name">${product.name || '-'}</div>
                            ${product.name2 ? `<div class="product-name2">${product.name2}</div>` : ''}
                            ${product.brand ? `<div class="product-brand"><i class="fas fa-tag me-1"></i>${product.brand}</div>` : ''}
                        </div>
                    </div>
                </td>
                <td>
                    <div class="text-center">
                        <span class="badge-enhanced badge-code">${product.code || '-'}</span>
                        ${product.barcode ? `<div class="mt-1"><small class="text-muted"><i class="fas fa-barcode me-1"></i>${product.barcode}</small></div>` : ''}
                    </div>
                </td>
                <td>
                    <div class="text-center">
                        <span class="badge-enhanced badge-category">
                            <i class="fas fa-tags me-1"></i>${category?.name || 'غير محدد'}
                        </span>
                    </div>
                </td>
                <td>
                    <div class="text-center">
                        <span class="badge-enhanced badge-unit">
                            <i class="fas fa-ruler me-1"></i>${unit?.name || 'غير محدد'}
                        </span>
                    </div>
                </td>
                <td>
                    <div class="price-display">
                        <div class="price-main">
                            <i class="fas fa-dollar-sign"></i>
                            ${(product.sellingPrice || product.price || 0).toLocaleString()} 
                            <span class="text-muted">${this.getCurrencyName(product.currency || 'IQD')}</span>
                        </div>
                        ${product.wholesalePrice ? `<div class="price-secondary"><i class="fas fa-layer-group me-1"></i>جملة: ${product.wholesalePrice.toLocaleString()}</div>` : ''}
                        ${product.purchasePrice ? `<div class="price-tertiary"><i class="fas fa-shopping-cart me-1"></i>شراء: ${product.purchasePrice.toLocaleString()}</div>` : ''}
                    </div>
                </td>
                <td>
                    <div class="stock-display">
                        <span class="stock-badge ${isLowStock ? 'stock-low' : currentStock === 0 ? 'stock-zero' : 'stock-normal'}">
                            <i class="fas fa-boxes"></i>
                            ${currentStock.toLocaleString()}
                        </span>
                        ${minStock > 0 ? `<div class="mt-1"><small class="text-muted"><i class="fas fa-exclamation-circle me-1"></i>حد أدنى: ${minStock}</small></div>` : ''}
                        ${currentStock === 0 ? `<div class="stock-warning text-danger"><i class="fas fa-times-circle me-1"></i>نفد المخزون</div>` : ''}
                        ${isLowStock && currentStock > 0 ? `<div class="stock-warning text-warning"><i class="fas fa-exclamation-triangle me-1"></i>مخزون منخفض</div>` : ''}
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn action-btn-primary" onclick="ProductsModule.showEditProductModal('${product.id}')" title="تعديل المنتج">
                            <i class="fas fa-edit"></i>تعديل
                        </button>
                        <button class="action-btn action-btn-info" onclick="ProductsModule.viewProductDetails('${product.id}')" title="عرض تفاصيل المنتج">
                            <i class="fas fa-eye"></i>عرض
                        </button>
                        <button class="action-btn action-btn-danger" onclick="ProductsModule.showDeleteConfirmation('${product.id}')" title="حذف المنتج">
                            <i class="fas fa-trash"></i>حذف
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        this.updateProductsSummary();
        this.renderPagination();
        console.log(`✅ Rendered ${productsToRender.length} products`);
        
        }, 300); // End of setTimeout
    },

    /**
     * Filter products based on search and filters
     * تصفية المنتجات حسب البحث والفلاتر
     */
    filterProducts() {
        const searchTerm = document.getElementById('productSearch')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';

        this.filteredProducts = this.products.filter(product => {
            // Search filter
            const matchesSearch = !searchTerm || 
                (product.name && product.name.toLowerCase().includes(searchTerm)) ||
                (product.name2 && product.name2.toLowerCase().includes(searchTerm)) ||
                (product.code && product.code.toLowerCase().includes(searchTerm)) ||
                (product.barcode && product.barcode.toLowerCase().includes(searchTerm)) ||
                (product.brand && product.brand.toLowerCase().includes(searchTerm));

            // Category filter
            const matchesCategory = !categoryFilter || product.categoryId === categoryFilter;

            // Status filter
            const matchesStatus = !statusFilter || (product.status || 'active') === statusFilter;

            return matchesSearch && matchesCategory && matchesStatus;
        });

        this.renderProductsTable();
    },

    /**
     * Clear all filters
     * مسح جميع الفلاتر
     */
    clearFilters() {
        document.getElementById('productSearch').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('statusFilter').value = '';
        this.filteredProducts = [...this.products];
        this.renderProductsTable();
    },

    /**
     * Update products summary
     * تحديث ملخص المنتجات
     */
    updateProductsSummary() {
        console.log('📊 Updating products summary...');
        
        const totalProducts = this.products ? this.products.length : 0;
        const activeProducts = this.products ? this.products.filter(p => (p.status || 'active') === 'active').length : 0;
        const lowStockProducts = this.products ? this.products.filter(p => {
            const currentStock = p.currentStock || p.stock || 0;
            const minStock = p.minStock || 0;
            return currentStock <= minStock;
        }).length : 0;

        const filteredCount = this.filteredProducts ? this.filteredProducts.length : totalProducts;

        console.log(`📊 Summary: Total: ${totalProducts}, Active: ${activeProducts}, Low Stock: ${lowStockProducts}, Filtered: ${filteredCount}`);

        // Update summary text
        const summaryElement = document.getElementById('productsSummary');
        if (summaryElement) {
            summaryElement.textContent = `عرض ${filteredCount} من أصل ${totalProducts} منتج`;
        }

        // Update badges
        const totalBadge = document.getElementById('totalProducts');
        const activeBadge = document.getElementById('activeProducts');
        const lowStockBadge = document.getElementById('lowStockProducts');

        if (totalBadge) {
            totalBadge.textContent = totalProducts;
            // Add animation
            totalBadge.style.transform = 'scale(1.1)';
            setTimeout(() => {
                totalBadge.style.transform = 'scale(1)';
            }, 200);
        }
        
        if (activeBadge) {
            activeBadge.textContent = activeProducts;
            // Add animation
            activeBadge.style.transform = 'scale(1.1)';
            setTimeout(() => {
                activeBadge.style.transform = 'scale(1)';
            }, 200);
        }
        
        if (lowStockBadge) {
            lowStockBadge.textContent = lowStockProducts;
            // Add animation
            lowStockBadge.style.transform = 'scale(1.1)';
            setTimeout(() => {
                lowStockBadge.style.transform = 'scale(1)';
            }, 200);
        }

        // Also update the main products count card
        const productsCountCard = document.getElementById('productsCount');
        if (productsCountCard) {
            productsCountCard.textContent = totalProducts;
            // Add animation
            productsCountCard.style.transform = 'scale(1.1)';
            setTimeout(() => {
                productsCountCard.style.transform = 'scale(1)';
            }, 200);
        }

        console.log('✅ Products summary updated successfully');
    },

    /**
     * Render pagination
     * عرض الترقيم
     */
    renderPagination() {
        const paginationElement = document.getElementById('productsPagination');
        if (!paginationElement) return;

        const itemsPerPage = 20;
        const totalItems = this.filteredProducts ? this.filteredProducts.length : this.products.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        if (totalPages <= 1) {
            paginationElement.innerHTML = '';
            return;
        }

        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="ProductsModule.goToPage(${this.currentPage - 1})">السابق</a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="ProductsModule.goToPage(${i})">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        // Next button
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="ProductsModule.goToPage(${this.currentPage + 1})">التالي</a>
            </li>
        `;

        paginationElement.innerHTML = paginationHTML;
    },

    /**
     * Go to specific page
     * الانتقال إلى صفحة محددة
     */
    goToPage(page) {
        const totalItems = this.filteredProducts ? this.filteredProducts.length : this.products.length;
        const totalPages = Math.ceil(totalItems / 20);
        
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderProductsTable();
    },

    /**
     * View product details
     * عرض تفاصيل المنتج
     */
    async viewProductDetails(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            this.showError('المنتج غير موجود');
            return;
        }

        const category = this.categories.find(c => c.id === product.categoryId);
        const unit = this.units.find(u => u.id === product.unitId);
        const currentStock = product.currentStock || product.stock || 0;
        const minStock = product.minStock || 0;
        const isLowStock = currentStock <= minStock;
        
        // Format dates
        const formatDate = (date) => {
            if (!date) return '-';
            const d = date.toDate ? date.toDate() : new Date(date);
            return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
        };

        // Sub units HTML
        let subUnitsHTML = '';
        if (product.subUnits && product.subUnits.length > 0) {
            subUnitsHTML = `
                <div class="row mt-3">
                    <div class="col-md-12">
                        <h6><i class="fas fa-layer-group me-2"></i>الوحدات الفرعية</h6>
                        <div class="table-responsive">
                            <table class="table table-sm table-bordered">
                                <thead>
                                    <tr>
                                        <th>الوحدة</th>
                                        <th>عامل التحويل</th>
                                        <th>نوع التحويل</th>
                                        <th>سعر الشراء</th>
                                        <th>سعر الجملة</th>
                                        <th>سعر البيع</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${product.subUnits.map(subUnit => {
                                        const subUnitObj = this.units.find(u => u.id === subUnit.unitId);
                                        return `
                                            <tr>
                                                <td>${subUnitObj?.name || subUnit.unitName || '-'}</td>
                                                <td>${subUnit.conversionFactor || subUnit.conversionValue || '-'}</td>
                                                <td><span class="badge bg-info">${subUnit.conversionType === 'multiply' ? 'ضرب' : 'قسمة'}</span></td>
                                                <td>${(subUnit.purchasePrice || 0).toLocaleString()} ${product.currency || 'IQD'}</td>
                                                <td>${(subUnit.wholesalePrice || 0).toLocaleString()} ${product.currency || 'IQD'}</td>
                                                <td>${(subUnit.retailPrice || 0).toLocaleString()} ${product.currency || 'IQD'}</td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }

        // Tracking info HTML
        let trackingHTML = '';
        if (product.hasExpiryDate || product.hasSerialNumber) {
            trackingHTML = `
                <div class="row mt-3">
                    <div class="col-md-12">
                        <h6><i class="fas fa-tasks me-2"></i>التتبع المتقدم</h6>
                        <div class="row">
                            ${product.hasExpiryDate ? `
                                <div class="col-md-6">
                                    <div class="alert alert-info mb-2">
                                        <i class="fas fa-calendar-check me-2"></i>
                                        <strong>تتبع تاريخ الانتهاء:</strong> مفعّل
                                        ${product.forceExpiryOnInput ? '<br><small>✓ إجبار عند الإدخال</small>' : ''}
                                        ${product.forceExpiryOnOutput ? '<br><small>✓ إجبار عند الإخراج</small>' : ''}
                                        ${product.expiryWarningDays ? `<br><small>أيام التحذير: ${product.expiryWarningDays}</small>` : ''}
                                    </div>
                                </div>
                            ` : ''}
                            ${product.hasSerialNumber ? `
                                <div class="col-md-6">
                                    <div class="alert alert-info mb-2">
                                        <i class="fas fa-barcode me-2"></i>
                                        <strong>تتبع الرقم التسلسلي:</strong> مفعّل
                                        ${product.forceSerialOnInput ? '<br><small>✓ إجبار عند الإدخال</small>' : ''}
                                        ${product.forceSerialOnOutput ? '<br><small>✓ إجبار عند الإخراج</small>' : ''}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }

        const detailsHTML = `
            ${product.image ? `
                <div class="row mb-3">
                    <div class="col-md-12 text-center">
                        <img src="${product.image}" class="img-thumbnail" style="max-width: 200px; max-height: 200px;" alt="${product.name}">
                    </div>
                </div>
            ` : ''}
            <div class="row">
                <div class="col-md-6">
                    <h6><i class="fas fa-info-circle me-2"></i>المعلومات الأساسية</h6>
                    <table class="table table-sm table-bordered">
                        <tr><td><strong>اسم المنتج:</strong></td><td>${product.name || '-'}</td></tr>
                        ${product.name2 ? `<tr><td><strong>الاسم الثانوي:</strong></td><td>${product.name2}</td></tr>` : ''}
                        <tr><td><strong>كود المنتج:</strong></td><td><span class="badge bg-primary">${product.code || '-'}</span></td></tr>
                        ${product.barcode ? `<tr><td><strong>الباركود:</strong></td><td><span class="badge bg-secondary">${product.barcode}</span></td></tr>` : ''}
                        ${product.brand ? `<tr><td><strong>العلامة التجارية:</strong></td><td>${product.brand}</td></tr>` : ''}
                        <tr><td><strong>العملة:</strong></td><td>${this.getCurrencyName(product.currency || 'IQD')}</td></tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h6><i class="fas fa-tags me-2"></i>التصنيف والمخزون</h6>
                    <table class="table table-sm table-bordered">
                        <tr><td><strong>الفئة:</strong></td><td><span class="badge bg-success">${category?.name || 'غير محدد'}</span></td></tr>
                        <tr><td><strong>الوحدة الأساسية:</strong></td><td><span class="badge bg-info">${unit?.name || 'غير محدد'}</span></td></tr>
                        <tr><td><strong>المخزون الحالي:</strong></td><td>
                            <span class="stock-badge ${isLowStock ? 'stock-low' : currentStock === 0 ? 'stock-zero' : 'stock-normal'}">
                                ${currentStock.toLocaleString()}
                            </span>
                        </td></tr>
                        <tr><td><strong>الحد الأدنى:</strong></td><td>${minStock.toLocaleString()}</td></tr>
                        <tr><td><strong>الحالة:</strong></td><td><span class="badge ${(product.status || 'active') === 'active' ? 'bg-success' : 'bg-secondary'}">${(product.status || 'active') === 'active' ? 'نشط' : 'غير نشط'}</span></td></tr>
                    </table>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col-md-12">
                    <h6><i class="fas fa-dollar-sign me-2"></i>التسعير</h6>
                    <div class="row">
                        <div class="col-md-4">
                            <div class="card border-primary">
                                <div class="card-body text-center">
                                    <h6 class="text-muted">سعر الشراء</h6>
                                    <h4 class="text-primary">${(product.purchasePrice || 0).toLocaleString()}</h4>
                                    <small class="text-muted">${product.currency || 'IQD'}</small>
                </div>
            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card border-success">
                                <div class="card-body text-center">
                                    <h6 class="text-muted">سعر البيع</h6>
                                    <h4 class="text-success">${(product.sellingPrice || product.price || 0).toLocaleString()}</h4>
                                    <small class="text-muted">${product.currency || 'IQD'}</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card border-info">
                                <div class="card-body text-center">
                                    <h6 class="text-muted">سعر الجملة</h6>
                                    <h4 class="text-info">${(product.wholesalePrice || 0).toLocaleString()}</h4>
                                    <small class="text-muted">${product.currency || 'IQD'}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ${subUnitsHTML}
            ${trackingHTML}
            ${product.description ? `
                <div class="row mt-3">
                    <div class="col-md-12">
                        <h6><i class="fas fa-align-right me-2"></i>الوصف</h6>
                        <p class="text-muted p-3 bg-light rounded">${product.description}</p>
                    </div>
                </div>
            ` : ''}
            ${product.notes ? `
                <div class="row mt-3">
                    <div class="col-md-12">
                        <h6><i class="fas fa-sticky-note me-2"></i>الملاحظات</h6>
                        <p class="text-muted p-3 bg-light rounded">${product.notes}</p>
                    </div>
                </div>
            ` : ''}
            <div class="row mt-3">
                <div class="col-md-12">
                    <h6><i class="fas fa-clock me-2"></i>معلومات النظام</h6>
                    <table class="table table-sm table-bordered">
                        ${product.createdAt ? `<tr><td><strong>تاريخ الإنشاء:</strong></td><td>${formatDate(product.createdAt)}</td></tr>` : ''}
                        ${product.updatedAt ? `<tr><td><strong>آخر تحديث:</strong></td><td>${formatDate(product.updatedAt)}</td></tr>` : ''}
                    </table>
                </div>
            </div>
        `;

        Swal.fire({
            title: `<i class="fas fa-box me-2"></i>${product.name}`,
            html: detailsHTML,
            width: '900px',
            showCloseButton: true,
            showConfirmButton: true,
            confirmButtonText: 'تعديل',
            showCancelButton: true,
            cancelButtonText: 'إغلاق',
            customClass: {
                popup: 'swal-wide'
            },
            didOpen: () => {
                const confirmButton = Swal.getConfirmButton();
                if (confirmButton) {
                    confirmButton.addEventListener('click', () => {
                        Swal.close();
                        this.showEditProductModal(productId);
                    });
                }
            }
        });
    },

    /**
     * Export products to CSV
     * تصدير المنتجات إلى CSV
     */
    exportProducts() {
        try {
            const productsToExport = this.filteredProducts || this.products;
            
            if (productsToExport.length === 0) {
                this.showError('لا توجد منتجات للتصدير');
                return;
            }

            // Prepare CSV data
            const headers = [
                'اسم المنتج', 'الاسم الثانوي', 'كود المنتج', 'الباركود', 'العلامة التجارية',
                'الفئة', 'الوحدة', 'سعر الشراء', 'سعر البيع', 'سعر الجملة',
                'المخزون الحالي', 'الحد الأدنى', 'العملة', 'الحالة', 'الوصف'
            ];

            const csvData = productsToExport.map(product => {
                const category = this.categories.find(c => c.id === product.categoryId);
                const unit = this.units.find(u => u.id === product.unitId);
                
                return [
                    product.name || '',
                    product.name2 || '',
                    product.code || '',
                    product.barcode || '',
                    product.brand || '',
                    category?.name || '',
                    unit?.name || '',
                    product.purchasePrice || 0,
                    product.sellingPrice || product.price || 0,
                    product.wholesalePrice || 0,
                    product.currentStock || product.stock || 0,
                    product.minStock || 0,
                    product.currency || 'IQD',
                    (product.status || 'active') === 'active' ? 'نشط' : 'غير نشط',
                    product.description || ''
                ];
            });

            // Create CSV content
            const csvContent = [headers, ...csvData]
                .map(row => row.map(field => `"${field}"`).join(','))
                .join('\n');

            // Download CSV
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showSuccess(`تم تصدير ${productsToExport.length} منتج بنجاح`);

        } catch (error) {
            console.error('❌ Error exporting products:', error);
            this.showError('خطأ في تصدير المنتجات: ' + error.message);
        }
    },

    /**
     * Update filter options
     * تحديث خيارات الفلاتر
     */
    updateFilterOptions() {
        console.log('🔧 Updating filter options...');
        
        // Update category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="">جميع الفئات</option>';
            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categoryFilter.appendChild(option);
            });
            console.log(`🔧 Category filter updated with ${this.categories.length} categories`);
        }
        
        console.log('✅ Filter options updated');
    },

    /**
     * Render categories table
     */
    renderCategoriesTable() {
        console.log('🎨 Rendering categories table...');
        
        const tbody = document.getElementById('categoriesTableBody');
        if (!tbody) {
            console.warn('⚠️ Categories table body not found - module may not be rendered yet');
            return;
        }

        // Add loading animation
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <div class="spinner-border text-success mb-3" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">جاري التحميل...</span>
                    </div>
                    <h5 class="text-muted">جاري تحميل الفئات...</h5>
                </td>
            </tr>
        `;

        // Simulate loading delay for better UX
        setTimeout(() => {
            if (this.categories.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center py-5">
                            <div class="text-muted">
                                <i class="fas fa-folder-open fa-4x mb-4 text-success" style="opacity: 0.3;"></i>
                                <h4 class="mb-3">لا توجد فئات</h4>
                                <p class="mb-4">ابدأ بإضافة فئة جديدة لتنظيم منتجاتك</p>
                                <div class="d-flex gap-2 justify-content-center">
                                    <button class="btn btn-success btn-lg" onclick="ProductsModule.showAddCategoryModal()">
                                        <i class="fas fa-plus me-2"></i> إضافة فئة جديدة
                                    </button>
                                    <button class="btn btn-outline-warning btn-lg" onclick="ProductsModule.recodeAll()">
                                        <i class="fas fa-sync-alt me-2"></i> إعادة ترميز
                                    </button>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = '';
            this.categories.forEach((category, index) => {
            const productsCount = this.products.filter(p => p.categoryId === category.id).length;
            
            const row = document.createElement('tr');
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            row.style.transition = 'all 0.3s ease';
            
            // Add entrance animation with delay
            setTimeout(() => {
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, index * 50);
            
            // Calculate lighter color for gradient
            const categoryColor = category.color || '#10b981';
            const lighterColor = this.lightenColor(categoryColor, 30);
            
            row.innerHTML = `
                <td class="text-center">
                    <span class="badge bg-gradient-success text-white fw-bold">${index + 1}</span>
                </td>
                <td class="text-center">
                    <div class="category-icon-display-enhanced" style="background: linear-gradient(135deg, ${categoryColor} 0%, ${lighterColor} 100%); color: white; width: 60px; height: 60px; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; box-shadow: 0 4px 15px rgba(0,0,0,0.15); transition: all 0.3s ease; margin: 0 auto;">
                        <i class="${category.icon || 'fas fa-folder'}"></i>
                    </div>
                    <div class="mt-2">
                        <div class="category-color-badge" style="background: ${categoryColor}; width: 30px; height: 8px; border-radius: 4px; margin: 0 auto; box-shadow: 0 2px 8px rgba(0,0,0,0.2);"></div>
                    </div>
                </td>
                <td>
                    <div class="category-info">
                        <div class="fw-bold text-success fs-6">${category.name || 'غير محدد'}</div>
                        <div class="mt-1"><small class="text-muted"><i class="fas fa-hashtag me-1"></i>${category.code || ''}</small></div>
                    </div>
                </td>
                <td>
                    <div class="category-description">
                        <span class="text-muted">${category.description || 'لا يوجد وصف'}</span>
                    </div>
                </td>
                <td class="text-center">
                    <span class="badge bg-gradient-info text-white fs-6">
                        <i class="fas fa-boxes me-1"></i>${productsCount} منتج
                    </span>
                </td>
                <td class="text-center">
                    <span class="badge bg-gradient-success text-white fs-6">
                        <i class="fas fa-check-circle me-1"></i>نشط
                    </span>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="ProductsModule.showEditCategoryModal('${category.id}')" title="تعديل الفئة">
                            <i class="fas fa-edit me-1"></i>تعديل
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="ProductsModule.showDeleteCategoryConfirmation('${category.id}')" title="حذف الفئة">
                            <i class="fas fa-trash me-1"></i>حذف
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        console.log(`✅ Rendered ${this.categories.length} categories`);
        
        }, 300); // End of setTimeout
    },

    /**
     * Render units table
     */
    renderUnitsTable() {
        console.log('🎨 Rendering units table...');
        
        const tbody = document.getElementById('unitsTableBody');
        if (!tbody) {
            console.warn('⚠️ Units table body not found - module may not be rendered yet');
            return;
        }

        // Add loading animation
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <div class="spinner-border text-info mb-3" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">جاري التحميل...</span>
                    </div>
                    <h5 class="text-muted">جاري تحميل الوحدات...</h5>
                </td>
            </tr>
        `;

        // Simulate loading delay for better UX
        setTimeout(() => {
            if (this.units.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center py-5">
                            <div class="text-muted">
                                <i class="fas fa-ruler-combined fa-4x mb-4 text-info" style="opacity: 0.3;"></i>
                                <h4 class="mb-3">لا توجد وحدات</h4>
                                <p class="mb-4">ابدأ بإضافة وحدة جديدة لقياس منتجاتك</p>
                                <div class="d-flex gap-2 justify-content-center">
                                    <button class="btn btn-info btn-lg" onclick="ProductsModule.showAddUnitModal()">
                                        <i class="fas fa-plus me-2"></i> إضافة وحدة جديدة
                                    </button>
                                    <button class="btn btn-outline-warning btn-lg" onclick="ProductsModule.recodeAll()">
                                        <i class="fas fa-sync-alt me-2"></i> إعادة ترميز
                                    </button>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = '';
            this.units.forEach((unit, index) => {
            const productsCount = this.products.filter(p => p.unitId === unit.id).length;
            
            const row = document.createElement('tr');
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            row.style.transition = 'all 0.3s ease';
            
            // Add entrance animation with delay
            setTimeout(() => {
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, index * 50);
            
            row.innerHTML = `
                <td class="text-center">
                    <span class="badge bg-gradient-info text-white fw-bold">${index + 1}</span>
                </td>
                <td class="text-center">
                    <span class="badge bg-gradient-secondary text-white fs-6">
                        <i class="fas fa-ruler me-1"></i>${unit.symbol || unit.code || '-'}
                    </span>
                </td>
                <td>
                    <div class="unit-info">
                        <div class="fw-bold text-info fs-6">${unit.name || 'غير محدد'}</div>
                        <div class="mt-1"><small class="text-muted"><i class="fas fa-hashtag me-1"></i>${unit.code || ''}</small></div>
                    </div>
                </td>
                <td>
                    <div class="unit-description">
                        <span class="text-muted">${unit.description || 'لا يوجد وصف'}</span>
                    </div>
                </td>
                <td class="text-center">
                    <span class="badge bg-gradient-info text-white fs-6">
                        <i class="fas fa-boxes me-1"></i>${productsCount} منتج
                    </span>
                </td>
                <td class="text-center">
                    <span class="badge bg-gradient-success text-white fs-6">
                        <i class="fas fa-check-circle me-1"></i>نشط
                    </span>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="ProductsModule.showEditUnitModal('${unit.id}')" title="تعديل الوحدة">
                            <i class="fas fa-edit me-1"></i>تعديل
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="ProductsModule.showDeleteUnitConfirmation('${unit.id}')" title="حذف الوحدة">
                            <i class="fas fa-trash me-1"></i>حذف
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        console.log(`✅ Rendered ${this.units.length} units`);
        
        }, 300); // End of setTimeout
    },

    /**
     * Update summary cards
     */
    updateSummaryCards() {
        console.log('📊 Updating summary cards...');
        
        const productsCount = document.getElementById('productsCount');
        const categoriesCount = document.getElementById('categoriesCount');
        const unitsCount = document.getElementById('unitsCount');
        
        if (productsCount) {
            const totalProducts = this.products ? this.products.length : 0;
            productsCount.textContent = totalProducts;
            console.log(`📊 Products count: ${totalProducts}`);
            
            // Add animation to the count
            productsCount.style.transform = 'scale(1.1)';
            setTimeout(() => {
                productsCount.style.transform = 'scale(1)';
            }, 200);
        }
        
        if (categoriesCount) {
            const totalCategories = this.categories ? this.categories.length : 0;
            categoriesCount.textContent = totalCategories;
            console.log(`📊 Categories count: ${totalCategories}`);
            
            // Add animation to the count
            categoriesCount.style.transform = 'scale(1.1)';
            setTimeout(() => {
                categoriesCount.style.transform = 'scale(1)';
            }, 200);
        }
        
        if (unitsCount) {
            const totalUnits = this.units ? this.units.length : 0;
            unitsCount.textContent = totalUnits;
            console.log(`📊 Units count: ${totalUnits}`);
            
            // Add animation to the count
            unitsCount.style.transform = 'scale(1.1)';
            setTimeout(() => {
                unitsCount.style.transform = 'scale(1)';
            }, 200);
        }
        
        // Also update navbar stats
        this.updateNavbarStats();
        
        console.log('✅ Summary cards updated');
    },

    /**
     * Update navbar statistics
     * تحديث إحصائيات شريط التنقل
     */
    updateNavbarStats() {
        try {
            const totalProducts = this.products ? this.products.length : 0;
            
            // Update navbar products count
            const navProductsCount = document.getElementById('navProductsCount');
            if (navProductsCount) {
                navProductsCount.textContent = totalProducts;
            }
            
            // Update sidebar products count
            const sidebarProductsCount = document.getElementById('sidebarProductsCount');
            if (sidebarProductsCount) {
                sidebarProductsCount.textContent = totalProducts;
            }
            
            console.log(`📊 Navbar stats updated: ${totalProducts} products`);
        } catch (error) {
            console.error('❌ Error updating navbar stats:', error);
        }
    },

    /**
     * Show success message
     */
    showSuccess(message) {
        if (typeof showSuccess === 'function') {
            showSuccess(message);
            } else {
            alert('✅ ' + message);
            }
    },

    /**
     * Show error message
     */
    showError(message) {
        if (typeof showError === 'function') {
            showError(message);
                    } else {
            alert('❌ ' + message);
        }
    },

    /**
     * Show info message
     */
    showInfo(message) {
        if (typeof showInfo === 'function') {
            showInfo(message);
            } else {
            alert('ℹ️ ' + message);
        }
    },

    /**
     * Populate all dropdowns asynchronously
     * ملء جميع القوائم المنسدلة بشكل متزامن
     */
    async populateDropdownsAsync() {
        console.log('📋 Populating all dropdowns asynchronously...');
        
        try {
            // Always reload data to ensure we have the latest
            console.log('🔄 Loading fresh data...');
            await this.loadCategories();
            await this.loadUnits();
            await this.loadCurrencies();
            
            console.log('📊 Data loaded - Categories:', this.categories.length, 'Units:', this.units.length, 'Currencies:', this.currencies.length);
            
            // Populate all dropdowns
            await this.populateCategoryDropdownAsync();
            await this.populateUnitDropdownAsync();
            await this.populateCurrencyDropdownAsync();
            
            console.log('✅ All dropdowns populated successfully');
        } catch (error) {
            console.error('❌ Error populating dropdowns:', error);
            this.showError('خطأ في ملء القوائم المنسدلة: ' + error.message);
        }
    },

    /**
     * Show add product modal
     * عرض نافذة إضافة منتج
     */
    async showAddProductModal() {
        console.log('📦 Showing add product modal...');
        
        // Check if modal exists first
        const productModal = document.getElementById('productModal');
        if (!productModal) {
            console.error('❌ Product modal not found!');
            this.showError('نافذة المنتج غير موجودة');
            return;
        }
        
        // Reset current edit ID to ensure we're adding, not editing
        this.currentEditId = null;
        
        // Show modal first
        const bootstrapModal = new bootstrap.Modal(productModal);
        bootstrapModal.show();
        
        // Wait for modal to be ready and then setup form
        await this.waitForModalReady('productModal', async () => {
            console.log('📦 Modal ready, setting up form...');
            
            // Reset form
            this.resetProductForm();
            
            // Populate dropdowns asynchronously
            await this.populateDropdownsAsync();
            
            // Set modal title with animation
            const modalTitle = document.getElementById('modalTitle');
            if (modalTitle) {
                modalTitle.innerHTML = `
                    <i class="fas fa-plus-circle text-success me-2"></i>
                    إضافة منتج جديد
                `;
                
                // Add success animation to modal title
                modalTitle.style.animation = 'fadeInUp 0.5s ease-out';
            }
            
            // Generate product code after dropdowns are populated
            setTimeout(() => {
                this.generateProductCode();
                // Setup form listeners with default values for new product
                this.setupProductFormListeners({
                    categoryId: '',
                    unitId: '',
                    currency: 'IQD',
                    hasExpiryDate: false,
                    forceExpiryOnInput: false,
                    forceExpiryOnOutput: false,
                    hasSerialNumber: false,
                    forceSerialOnInput: false,
                    forceSerialOnOutput: false,
                    expiryWarningDays: 30
                });
                
            // Add entrance animation to form fields
            this.animateFormFields();
            
            // Hide restore button for new product
            const restoreBtn = document.getElementById('resetProductFormBtn');
            if (restoreBtn) {
                restoreBtn.style.display = 'none';
            }
            this.originalProductData = null;
            
            console.log('✅ Add product modal setup completed');
                
            }, 300);
            
            // Add animation to modal content
            const modalContent = productModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.animation = 'modalSlideIn 0.3s ease-out';
            }
        });
    },

    /**
     * Wait for modal to be ready and then execute callback
     * انتظار النموذج حتى يكون جاهزاً ثم تنفيذ الاستدعاء
     */
    async waitForModalReady(modalId, callback) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`❌ Modal ${modalId} not found!`);
            return false;
        }
        
        return new Promise((resolve) => {
            const handleModalShown = async () => {
                console.log(`📦 Modal ${modalId} shown, executing callback...`);
                
                // Wait a bit more for modal content to be ready
                await new Promise(resolve => setTimeout(resolve, 200));
                
                try {
                    await callback();
                    console.log(`✅ Modal ${modalId} callback completed successfully`);
                    resolve(true);
                } catch (error) {
                    console.error(`❌ Error in modal callback:`, error);
                    resolve(false);
                }
            };
            
            modal.addEventListener('shown.bs.modal', handleModalShown, { once: true });
        });
    },
    showModalLoading() {
        const modalBody = document.querySelector('#productModal .modal-body');
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">جاري التحميل...</span>
                    </div>
                    <h5 class="text-muted">جاري تحضير النموذج...</h5>
                    <p class="text-muted">يرجى الانتظار</p>
                </div>
            `;
        }
    },

    /**
     * Hide modal loading animation
     * إخفاء تحميل النافذة
     */
    hideModalLoading() {
        console.log('🔄 Hiding modal loading...');
        
        // Simply remove the loading spinner and let the form show
        const modalBody = document.querySelector('#productModal .modal-body');
        if (modalBody) {
            // The form should already be there, just remove loading
            const loadingDiv = modalBody.querySelector('.text-center.py-5');
            if (loadingDiv) {
                loadingDiv.remove();
                console.log('✅ Modal loading hidden');
            } else {
                console.log('✅ Modal loading already hidden');
            }
        } else {
            console.warn('⚠️ Modal body not found');
        }
    },

    /**
     * Animate form fields entrance
     * تحريك حقول النموذج عند الدخول
     */
    animateFormFields() {
        const formGroups = document.querySelectorAll('#productModal .form-group, #productModal .mb-3');
        formGroups.forEach((group, index) => {
            group.style.opacity = '0';
            group.style.transform = 'translateY(20px)';
            group.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                group.style.opacity = '1';
                group.style.transform = 'translateY(0)';
            }, index * 50);
        });
    },

    /**
     * Show edit product modal
     * عرض نافذة تعديل منتج
     */
    async showEditProductModal(productId) {
        console.log('✏️ Showing edit product modal for:', productId);
        
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            console.error('❌ Product not found:', productId);
            this.showError('المنتج غير موجود');
            return;
        }

        console.log('✏️ Found product:', product);
        
        // Check if modal exists first
        const productModal = document.getElementById('productModal');
        if (!productModal) {
            console.error('❌ Product modal not found!');
            this.showError('نافذة المنتج غير موجودة');
            return;
        }
        
        // Store current product ID
        this.currentEditId = productId;
        
        // Show modal first
        const bootstrapModal = new bootstrap.Modal(productModal);
        bootstrapModal.show();
        
        // Wait for modal to be ready and then setup form
        await this.waitForModalReady('productModal', async () => {
            console.log('✏️ Modal ready, setting up edit form...');
            
            // Set modal title with animation
            const modalTitle = document.getElementById('modalTitle');
            if (modalTitle) {
                modalTitle.innerHTML = `
                    <i class="fas fa-edit text-warning me-2"></i>
                    تعديل منتج: <span class="text-primary">${product.name}</span>
                `;
                modalTitle.style.animation = 'fadeInUp 0.5s ease-out';
            }
            
            // Reset form while preserving edit ID
            this.resetProductForm(true); // Pass true to preserve currentEditId
            
            // Populate dropdowns asynchronously and wait for completion
            await this.populateDropdownsAsync();
            
            // Wait a bit more to ensure dropdowns are fully populated
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Fill form with product data after dropdowns are ready
            this.fillProductForm(product);
            
            // Setup form listeners with product values to preserve them
            this.setupProductFormListeners({
                categoryId: product.categoryId,
                unitId: product.unitId,
                currency: product.currency,
                hasExpiryDate: product.hasExpiryDate,
                forceExpiryOnInput: product.forceExpiryOnInput,
                forceExpiryOnOutput: product.forceExpiryOnOutput,
                hasSerialNumber: product.hasSerialNumber,
                forceSerialOnInput: product.forceSerialOnInput,
                forceSerialOnOutput: product.forceSerialOnOutput,
                expiryWarningDays: product.expiryWarningDays
            });
            
            // Check if tracking constraints are protected
            this.hasProductTransactions(productId).then(hasTransactions => {
                if (hasTransactions) {
                    this.showTrackingConstraintsProtection();
                }
            });
            
            // Check if sub units are protected
            this.hasSubUnitTransactions(productId).then(hasSubUnitTransactions => {
                if (hasSubUnitTransactions) {
                    this.showSubUnitsProtection();
                }
            });
            
            // Add entrance animation to form fields
            setTimeout(() => {
                this.animateFormFields();
            }, 50);
            
            // Show and setup restore button
            const restoreBtn = document.getElementById('resetProductFormBtn');
            if (restoreBtn) {
                restoreBtn.style.display = 'inline-block';
                // Store original product data for restore
                this.originalProductData = JSON.parse(JSON.stringify(product));
                
                // Remove existing listeners
                const newRestoreBtn = restoreBtn.cloneNode(true);
                restoreBtn.parentNode.replaceChild(newRestoreBtn, restoreBtn);
                
                newRestoreBtn.addEventListener('click', async () => {
                    if (this.originalProductData) {
                        // Ensure dropdowns are populated before restoring
                        await this.populateDropdownsAsync();
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                        // Restore form data
                        this.fillProductForm(this.originalProductData);
                        
                        // Re-setup form listeners with original values
                        this.setupProductFormListeners({
                            categoryId: this.originalProductData.categoryId,
                            unitId: this.originalProductData.unitId,
                            currency: this.originalProductData.currency,
                            hasExpiryDate: this.originalProductData.hasExpiryDate,
                            forceExpiryOnInput: this.originalProductData.forceExpiryOnInput,
                            forceExpiryOnOutput: this.originalProductData.forceExpiryOnOutput,
                            hasSerialNumber: this.originalProductData.hasSerialNumber,
                            forceSerialOnInput: this.originalProductData.forceSerialOnInput,
                            forceSerialOnOutput: this.originalProductData.forceSerialOnOutput,
                            expiryWarningDays: this.originalProductData.expiryWarningDays
                        });
                        
                        this.showSuccess('تم استعادة البيانات الأصلية');
                    }
                });
            }
            
            console.log('✅ Edit product modal setup completed');
            
            // Add animation to modal content
            const modalContent = productModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.animation = 'modalSlideIn 0.3s ease-out';
            }
        });
    },

    /**
     * Show delete confirmation
     * عرض تأكيد الحذف
     */
    async showDeleteConfirmation(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            this.showError('المنتج غير موجود');
            return;
        }
        
        const result = await Swal.fire({
            title: 'تأكيد الحذف',
            text: `هل أنت متأكد من حذف المنتج "${product.name}"؟`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d'
        });
        
        if (result.isConfirmed) {
            await this.deleteProduct(productId);
        }
    },

    /**
     * Reset product form
     * إعادة تعيين نموذج المنتج
     */
    resetProductForm(preserveEditId = false) {
        console.log('🔄 Resetting product form...', preserveEditId ? '(preserving edit ID)' : '');
        
        // Save currentEditId if we need to preserve it
        const savedEditId = preserveEditId ? this.currentEditId : null;
        
        // Check if form exists before resetting
        const productForm = document.getElementById('productForm');
        if (productForm) {
            try {
                productForm.reset();
                console.log('✅ Form reset successfully');
            } catch (error) {
                console.warn('⚠️ Form reset failed:', error);
            }
        } else {
            console.warn('⚠️ Product form not found');
        }
        
        // Reset individual fields with safety checks
        const fields = [
            'productCode', 'currentStock', 'minStock', 'productStatus', 
            'productCurrency', 'hasExpiryDate', 'forceExpiryOnInput', 
            'forceExpiryOnOutput', 'hasSerialNumber', 'forceSerialOnInput', 
            'forceSerialOnOutput'
        ];
        
        fields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                try {
                    if (element.type === 'checkbox') {
                        element.checked = false;
                    } else {
                        element.value = '';
                    }
                } catch (error) {
                    console.warn(`⚠️ Failed to reset field ${fieldId}:`, error);
                }
            } else {
                console.warn(`⚠️ Field ${fieldId} not found`);
            }
        });
        
        // Set default values with safety checks
        const defaultValues = {
            'currentStock': '0',
            'minStock': '10',
            'productStatus': 'active',
            'productCurrency': 'IQD'
        };
        
        Object.entries(defaultValues).forEach(([fieldId, value]) => {
            const element = document.getElementById(fieldId);
            if (element) {
                try {
                    element.value = value;
                } catch (error) {
                    console.warn(`⚠️ Failed to set default value for ${fieldId}:`, error);
                }
            }
        });
        
        // Only clear currentEditId if we're not preserving it
        if (!preserveEditId) {
            this.currentEditId = null;
        } else {
            // Restore the saved edit ID
            this.currentEditId = savedEditId;
        }
        this.currentImageData = null;
        
        // Reset category and unit dropdowns
        const categorySelect = document.getElementById('productCategory');
        if (categorySelect) {
            categorySelect.value = '';
        }
        
        const unitSelect = document.getElementById('productUnit');
        if (unitSelect) {
            unitSelect.value = '';
        }
        
        // Hide advanced settings with safety checks
        const expirySettings = document.getElementById('expiryDateSettings');
        const serialSettings = document.getElementById('serialNumberSettings');
        const imagePreview = document.getElementById('imagePreview');
        
        if (expirySettings) {
            try {
                expirySettings.style.display = 'none';
            } catch (error) {
                console.warn('⚠️ Failed to hide expiry settings:', error);
            }
        }
        
        if (serialSettings) {
            try {
                serialSettings.style.display = 'none';
            } catch (error) {
                console.warn('⚠️ Failed to hide serial settings:', error);
            }
        }
        
        if (imagePreview) {
            try {
                imagePreview.style.display = 'none';
            } catch (error) {
                console.warn('⚠️ Failed to hide image preview:', error);
            }
        }
        
        // Clear image input
        const productImage = document.getElementById('productImage');
        if (productImage) {
            try {
                productImage.value = '';
            } catch (error) {
                console.warn('⚠️ Failed to clear image input:', error);
            }
        }
        
        // Clear sub units
        const container = document.getElementById('subUnitsContainer');
        if (container) {
            try {
                container.innerHTML = '';
            } catch (error) {
                console.warn('⚠️ Failed to clear sub units:', error);
            }
        }
        
        console.log('✅ Product form reset completed');
    },

    /**
     * Fill product form with data
     * ملء نموذج المنتج بالبيانات
     */
    fillProductForm(product) {
        console.log('📝 Filling product form with data:', product);
        console.log('📝 Product categoryId:', product.categoryId);
        console.log('📝 Product unitId:', product.unitId);
        console.log('📝 Product subUnits:', product.subUnits);
        
        document.getElementById('productCode').value = product.code || '';
        document.getElementById('productName').value = product.name || '';
        document.getElementById('productName2').value = product.name2 || '';
        
        // Set category value with validation
        const categorySelect = document.getElementById('productCategory');
        console.log('📝 Category select element found:', !!categorySelect);
        console.log('📝 Product categoryId exists:', !!product.categoryId);
        console.log('📝 Product categoryId value:', product.categoryId);
        console.log('📝 Product categoryId type:', typeof product.categoryId);
        
        if (categorySelect && product.categoryId) {
            console.log('📝 Setting category value:', product.categoryId);
            console.log('📝 Available category options:', Array.from(categorySelect.options).map(opt => ({ value: opt.value, text: opt.text })));
            console.log('📝 Category select element:', categorySelect);
            console.log('📝 Category select options count:', categorySelect.options.length);
            console.log('📝 Product object keys:', Object.keys(product));
            
            // Check if the category exists in the dropdown
            const categoryExists = Array.from(categorySelect.options).some(option => option.value === product.categoryId);
            console.log('📝 Category exists check:', categoryExists);
            
            if (categoryExists) {
                categorySelect.value = product.categoryId;
                console.log('✅ Category set to:', product.categoryId);
                console.log('✅ Category select value after setting:', categorySelect.value);
                
                // Trigger change event to ensure any dependent logic runs
                categorySelect.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
                console.warn('⚠️ Category not found in dropdown:', product.categoryId);
                console.warn('⚠️ Available options:', Array.from(categorySelect.options).map(opt => opt.value));
                categorySelect.value = '';
            }
        } else {
            console.warn('⚠️ Category select not found or product.categoryId is empty');
            console.warn('⚠️ Category select:', categorySelect);
            console.warn('⚠️ Product categoryId:', product.categoryId);
            console.warn('⚠️ Product object:', product);
        }
        
        // Set unit value with validation
        const unitSelect = document.getElementById('productUnit');
        console.log('📝 Unit select element found:', !!unitSelect);
        console.log('📝 Product unitId exists:', !!product.unitId);
        console.log('📝 Product unitId value:', product.unitId);
        console.log('📝 Product unitId type:', typeof product.unitId);
        
        if (unitSelect && product.unitId) {
            console.log('📝 Setting unit value:', product.unitId);
            console.log('📝 Available unit options:', Array.from(unitSelect.options).map(opt => ({ value: opt.value, text: opt.text })));
            console.log('📝 Unit select element:', unitSelect);
            console.log('📝 Unit select options count:', unitSelect.options.length);
            
            // Check if the unit exists in the dropdown
            const unitExists = Array.from(unitSelect.options).some(option => option.value === product.unitId);
            console.log('📝 Unit exists check:', unitExists);
            
            if (unitExists) {
                unitSelect.value = product.unitId;
                console.log('✅ Unit set to:', product.unitId);
                console.log('✅ Unit select value after setting:', unitSelect.value);
                
                // Trigger change event to ensure any dependent logic runs
                unitSelect.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
                console.warn('⚠️ Unit not found in dropdown:', product.unitId);
                console.warn('⚠️ Available options:', Array.from(unitSelect.options).map(opt => opt.value));
                unitSelect.value = '';
            }
        } else {
            console.warn('⚠️ Unit select not found or product.unitId is empty');
            console.warn('⚠️ Unit select:', unitSelect);
            console.warn('⚠️ Product unitId:', product.unitId);
            console.warn('⚠️ Product object:', product);
        }
        
        document.getElementById('productCurrency').value = product.currency || 'IQD';
        
        // Update currency suffixes to show correct currency symbol in price fields
        this.updateCurrencySuffixes(product.currency || 'IQD');
        
        document.getElementById('productBrand').value = product.brand || '';
        document.getElementById('productBarcode').value = product.barcode || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('purchasePrice').value = product.purchasePrice || 0;
        document.getElementById('sellingPrice').value = product.sellingPrice || product.price || 0;
        document.getElementById('wholesalePrice').value = product.wholesalePrice || 0;
        document.getElementById('currentStock').value = product.currentStock || product.stock || 0;
        document.getElementById('minStock').value = product.minStock || 10;
        document.getElementById('productStatus').value = product.status || 'active';
        document.getElementById('productNotes').value = product.notes || '';
        
        console.log('📝 Set basic product fields');
        
        // Advanced tracking
        document.getElementById('hasExpiryDate').checked = product.hasExpiryDate || false;
        document.getElementById('forceExpiryOnInput').checked = product.forceExpiryOnInput || false;
        document.getElementById('forceExpiryOnOutput').checked = product.forceExpiryOnOutput || false;
        document.getElementById('expiryWarningDays').value = product.expiryWarningDays || 30;
        document.getElementById('hasSerialNumber').checked = product.hasSerialNumber || false;
        document.getElementById('forceSerialOnInput').checked = product.forceSerialOnInput || false;
        document.getElementById('forceSerialOnOutput').checked = product.forceSerialOnOutput || false;
        
        console.log('📝 Set advanced tracking fields');
        
        // Show/hide advanced settings
        this.toggleExpirySettings();
        this.toggleSerialSettings();
        
        // Load sub units data after ensuring main unit is set
        console.log('📝 Loading sub units data...');
        this.loadSubUnitsData(product.subUnits || []);
        
        // Toggle sub units button
        this.toggleSubUnitsButton();
        
        // Load product image if exists
        if (product.image) {
            console.log('📝 Loading product image...');
            const imagePreview = document.getElementById('imagePreview');
            if (imagePreview) {
                imagePreview.innerHTML = `
                    <img src="${product.image}" class="img-thumbnail" style="max-width: 200px; max-height: 200px;">
                    <div class="mt-2">
                        <button type="button" class="btn btn-sm btn-danger" onclick="ProductsModule.removeImage()">
                            <i class="fas fa-trash"></i> حذف الصورة
                        </button>
                    </div>
                `;
                imagePreview.style.display = 'block';
            }
            // Store current image data
            this.currentImageData = product.image;
        } else {
            // Clear image preview if no image
            const imagePreview = document.getElementById('imagePreview');
            if (imagePreview) {
                imagePreview.innerHTML = '<p class="text-muted">لم يتم اختيار صورة</p>';
                imagePreview.style.display = 'none';
            }
            this.currentImageData = null;
        }
        
        console.log('📝 Finished filling product form');
    },

    /**
     * Populate category dropdown asynchronously
     * ملء القائمة المنسدلة للفئات بشكل متزامن
     */
    async populateCategoryDropdownAsync() {
        console.log('📋 Populating category dropdown asynchronously...');
        console.log('📋 Available categories:', this.categories);
        
        const categorySelect = document.getElementById('productCategory');
        if (!categorySelect) {
            console.warn('⚠️ Category dropdown not found');
            return;
        }
        
        // Categories should already be loaded by populateDropdownsAsync
        if (!this.categories || this.categories.length === 0) {
            console.error('❌ Categories not loaded - this should not happen');
            return;
        }
        
        // Clear existing options
        categorySelect.innerHTML = '<option value="">اختر الفئة</option>';
        
        // Add categories
        if (this.categories && this.categories.length > 0) {
            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
                console.log('📋 Added category option:', category.id, category.name);
            });
            console.log(`✅ Added ${this.categories.length} categories to dropdown`);
            console.log('📋 Final category dropdown options:', Array.from(categorySelect.options).map(opt => ({ value: opt.value, text: opt.text })));
        } else {
            console.warn('⚠️ No categories available to populate dropdown');
            console.warn('⚠️ Categories array:', this.categories);
        }
    },

    /**
     * Populate category dropdown
     * ملء القائمة المنسدلة للفئات
     */
    populateCategoryDropdown() {
        console.log('📋 Populating category dropdown...');
        console.log('📋 Available categories:', this.categories);
        
        const categorySelect = document.getElementById('productCategory');
        if (!categorySelect) {
            console.warn('⚠️ Category dropdown not found');
            return;
        }
        
        // Check if categories are loaded
        if (!this.categories || this.categories.length === 0) {
            console.warn('⚠️ No categories loaded, attempting to load...');
            this.loadCategories().then(() => {
                this.populateCategoryDropdown();
            });
            return;
        }
        
        // Clear existing options
        categorySelect.innerHTML = '<option value="">اختر الفئة</option>';
        
        // Add categories
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
            console.log('📋 Added category option:', category.id, category.name);
        });
        
        console.log(`✅ Added ${this.categories.length} categories to dropdown`);
    },

    /**
     * Populate unit dropdown asynchronously
     * ملء القائمة المنسدلة للوحدات بشكل متزامن
     */
    async populateUnitDropdownAsync() {
        console.log('📋 Populating unit dropdown asynchronously...');
        console.log('📋 Available units:', this.units);
        
        const unitSelect = document.getElementById('productUnit');
        if (!unitSelect) {
            console.warn('⚠️ Unit dropdown not found');
            return;
        }
        
        // Units should already be loaded by populateDropdownsAsync
        if (!this.units || this.units.length === 0) {
            console.error('❌ Units not loaded - this should not happen');
            return;
        }
        
        // Clear existing options
        unitSelect.innerHTML = '<option value="">اختر الوحدة</option>';
        
        // Add units
        if (this.units && this.units.length > 0) {
            this.units.forEach(unit => {
                const option = document.createElement('option');
                option.value = unit.id;
                option.textContent = unit.name;
                unitSelect.appendChild(option);
                console.log('📋 Added unit option:', unit.id, unit.name);
            });
            console.log(`✅ Added ${this.units.length} units to dropdown`);
            console.log('📋 Final unit dropdown options:', Array.from(unitSelect.options).map(opt => ({ value: opt.value, text: opt.text })));
        } else {
            console.warn('⚠️ No units available to populate dropdown');
            console.warn('⚠️ Units array:', this.units);
        }
    },

    /**
     * Populate unit dropdown
     * ملء القائمة المنسدلة للوحدات
     */
    populateUnitDropdown() {
        console.log('📋 Populating unit dropdown...');
        console.log('📋 Available units:', this.units);
        
        const unitSelect = document.getElementById('productUnit');
        if (!unitSelect) {
            console.warn('⚠️ Unit dropdown not found');
            return;
        }
        
        // Check if units are loaded
        if (!this.units || this.units.length === 0) {
            console.warn('⚠️ No units loaded, attempting to load...');
            this.loadUnits().then(() => {
                this.populateUnitDropdown();
            });
            return;
        }
        
        // Clear existing options
        unitSelect.innerHTML = '<option value="">اختر الوحدة</option>';
        
        // Add units
        this.units.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit.id;
            option.textContent = unit.name;
            unitSelect.appendChild(option);
            console.log('📋 Added unit option:', unit.id, unit.name);
        });
        
        console.log(`✅ Added ${this.units.length} units to dropdown`);
    },

    /**
     * Populate currency dropdown asynchronously
     * ملء القائمة المنسدلة للعملات بشكل متزامن
     */
    async populateCurrencyDropdownAsync() {
        console.log('💰 Populating currency dropdown asynchronously...');
        console.log('💰 Available currencies:', this.currencies);
        
        const currencySelect = document.getElementById('productCurrency');
        if (!currencySelect) {
            console.warn('⚠️ Currency dropdown not found');
            return;
        }
        
        // Currencies should already be loaded by populateDropdownsAsync
        if (!this.currencies || this.currencies.length === 0) {
            console.error('❌ Currencies not loaded - this should not happen');
            return;
        }
        
        // Clear existing options
        currencySelect.innerHTML = '<option value="">اختر العملة</option>';
        
        // Add currencies
        if (this.currencies && this.currencies.length > 0) {
            this.currencies.forEach(currency => {
                const option = document.createElement('option');
                option.value = currency.code || currency.symbol;
                option.textContent = `${currency.name} (${currency.code || currency.symbol})`;
                currencySelect.appendChild(option);
                console.log('💰 Added currency option:', currency.code || currency.symbol, currency.name);
            });
            console.log(`✅ Added ${this.currencies.length} currencies to dropdown`);
        } else {
            console.warn('⚠️ No currencies available to populate dropdown');
        }
    },

    /**
     * Populate currency dropdown
     * ملء القائمة المنسدلة للعملات
     */
    populateCurrencyDropdown() {
        console.log('💰 Populating currency dropdown...');
        console.log('💰 Available currencies:', this.currencies);
        
        const currencySelect = document.getElementById('productCurrency');
        if (!currencySelect) {
            console.warn('⚠️ Currency dropdown not found');
            return;
        }
        
        // Check if currencies are loaded
        if (!this.currencies || this.currencies.length === 0) {
            console.warn('⚠️ No currencies loaded, attempting to load...');
            this.loadCurrencies().then(() => {
                this.populateCurrencyDropdown();
            });
            return;
        }
        
        // Save current value before clearing
        const currentValue = currencySelect.value || 'IQD';
        
        // Clear existing options
        currencySelect.innerHTML = '<option value="">اختر العملة</option>';
        
        // Add currencies
        this.currencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency.code || currency.symbol;
            option.textContent = `${currency.name} (${currency.code || currency.symbol})`;
            currencySelect.appendChild(option);
            console.log('💰 Added currency option:', currency.code || currency.symbol, currency.name);
        });
        
        // Restore the saved value or use IQD as default
        if (currentValue && currencySelect.querySelector(`option[value="${currentValue}"]`)) {
            currencySelect.value = currentValue;
            console.log('💰 Restored currency value:', currentValue);
        } else {
            currencySelect.value = 'IQD';
            console.log('💰 Set default currency to IQD');
        }
        
        // Update currency suffixes to reflect the selected currency
        this.updateCurrencySuffixes(currencySelect.value);
        
        console.log(`✅ Added ${this.currencies.length} currencies to dropdown`);
    },

    /**
     * Update currency suffixes in price fields
     * تحديث لاحقة العملة في حقول الأسعار
     */
    updateCurrencySuffixes(currencyCode) {
        console.log('💰 Updating currency suffixes to:', currencyCode);
        
        const currency = this.currencies.find(c => c.code === currencyCode || c.symbol === currencyCode);
        const currencySymbol = currency ? (currency.symbol || currency.code) : (currencyCode || 'IQD');
        
        // Update currency suffixes in price fields
        const purchasePriceCurrency = document.getElementById('purchasePriceCurrency');
        const sellingPriceCurrency = document.getElementById('sellingPriceCurrency');
        const wholesalePriceCurrency = document.getElementById('wholesalePriceCurrency');
        
        if (purchasePriceCurrency) {
            purchasePriceCurrency.textContent = currencySymbol;
        }
        if (sellingPriceCurrency) {
            sellingPriceCurrency.textContent = currencySymbol;
        }
        if (wholesalePriceCurrency) {
            wholesalePriceCurrency.textContent = currencySymbol;
        }
        
        console.log(`✅ Updated currency suffixes to: ${currencySymbol}`);
    },

    /**
     * Get currency name by code
     * الحصول على اسم العملة من الكود
     */
    getCurrencyName(currencyCode) {
        const currency = this.currencies.find(c => c.code === currencyCode || c.symbol === currencyCode);
        return currency ? currency.name : currencyCode;
    },

    /**
     * Show bulk import modal
     * عرض نافذة الإدراج المتعدد
     */
        showBulkImportModal(type) {
            console.log(`📦 Showing bulk import modal for: ${type}`);
            
            this.currentBulkImportType = type;
            
            // Set modal title based on type
            const titles = {
                'products': 'إدراج منتجات متعدد',
                'categories': 'إدراج فئات متعدد',
                'units': 'إدراج وحدات متعدد'
            };
            
            const titleElement = document.getElementById('bulkImportTitle');
            if (titleElement) {
                titleElement.textContent = titles[type] || 'إدراج متعدد';
            }
            
            // Initialize table based on type
            this.initializeBulkImportTable(type);
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('bulkImportModal'));
            modal.show();
        },

        initializeBulkImportTable(type) {
            const tbody = document.getElementById('bulkImportTableBody');
            if (!tbody) {
                console.error('❌ bulkImportTableBody not found');
                return;
            }
            
            tbody.innerHTML = '';
            
            // Update table headers based on type
            this.updateBulkImportTableHeaders(type);
            
            // Add initial empty row based on type
            switch(type) {
                case 'products':
            this.addNewProductRow();
                    break;
                case 'categories':
                    this.addNewCategoryRow();
                    break;
                case 'units':
                    this.addNewUnitRow();
                    break;
                default:
                    console.warn('⚠️ Unknown bulk import type:', type);
            }
        },

        /**
         * Update table headers based on import type
         * تحديث رؤوس الجدول حسب نوع الإدراج
         */
        updateBulkImportTableHeaders(type) {
            const thead = document.querySelector('#bulkImportTable thead tr');
            if (!thead) return;

            const headers = {
                'products': `
                    <th style="min-width: 50px; width: 50px;">#</th>
                    <th style="min-width: 200px; width: 220px;"><i class="fas fa-tag"></i> اسم المنتج *</th>
                    <th style="min-width: 140px; width: 160px;"><i class="fas fa-qrcode"></i> الكود (تلقائي)</th>
                    <th style="min-width: 150px; width: 170px;"><i class="fas fa-folder"></i> الفئة</th>
                    <th style="min-width: 130px; width: 150px;"><i class="fas fa-ruler"></i> الوحدة</th>
                    <th style="min-width: 100px; width: 120px;"><i class="fas fa-coins"></i> العملة</th>
                    <th style="min-width: 120px; width: 130px;"><i class="fas fa-shopping-cart"></i> سعر الشراء</th>
                    <th style="min-width: 120px; width: 130px;"><i class="fas fa-dollar-sign"></i> سعر البيع</th>
                    <th style="min-width: 120px; width: 130px;"><i class="fas fa-boxes"></i> سعر الجملة</th>
                    <th style="min-width: 100px; width: 110px;"><i class="fas fa-cubes"></i> المخزون</th>
                    <th style="min-width: 100px; width: 110px;"><i class="fas fa-flag"></i> الحد الأدنى</th>
                    <th style="min-width: 60px; width: 70px;"><i class="fas fa-trash"></i></th>
                `,
                'categories': `
                    <th style="width: 60px;">#</th>
                    <th style="width: 300px;"><i class="fas fa-tag"></i> اسم الفئة *</th>
                    <th style="width: 180px;"><i class="fas fa-qrcode"></i> الكود (تلقائي)</th>
                    <th style="width: 200px;"><i class="fas fa-align-right"></i> الوصف</th>
                    <th style="width: 150px;"><i class="fas fa-palette"></i> اللون</th>
                    <th style="width: 150px;"><i class="fas fa-icons"></i> الأيقونة</th>
                    <th style="width: 80px;"><i class="fas fa-trash"></i></th>
                `,
                'units': `
                    <th style="width: 60px;">#</th>
                    <th style="width: 250px;"><i class="fas fa-tag"></i> اسم الوحدة *</th>
                    <th style="width: 180px;"><i class="fas fa-qrcode"></i> الكود (تلقائي)</th>
                    <th style="width: 150px;"><i class="fas fa-font"></i> الرمز</th>
                    <th style="width: 200px;"><i class="fas fa-align-right"></i> الوصف</th>
                    <th style="width: 80px;"><i class="fas fa-trash"></i></th>
                `
            };

            if (headers[type]) {
                thead.innerHTML = headers[type];
            }
        },

        addNewProductRow() {
            const tbody = document.getElementById('bulkImportTableBody');
            const rowIndex = tbody.children.length + 1;
            
            const row = document.createElement('tr');
            row.className = 'product-import-row';
            row.innerHTML = `
                <td class="text-center">
                    <div class="row-number">${rowIndex}</div>
                </td>
                <td>
                    <input type="text" class="form-control form-control-sm" placeholder="اسم المنتج" data-field="name" required>
                </td>
                <td>
                    <input type="text" class="form-control form-control-sm auto-generated-code" placeholder="سيتم توليده تلقائياً" data-field="code" readonly 
                           title="سيتم توليد الكود تلقائياً بناءً على الفئة المختارة">
                </td>
                <td>
                    <select class="form-select form-select-sm category-select" data-field="category" onchange="ProductsModule.generateBulkRowCode(this)">
                        <option value="">اختر فئة</option>
                        ${this.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <select class="form-select form-select-sm" data-field="unit">
                        <option value="">اختر وحدة</option>
                        ${this.units.map(unit => `<option value="${unit.id}">${unit.name}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <select class="form-select form-select-sm" data-field="currency">
                        <option value="">اختر عملة</option>
                        ${this.currencies.map(currency => `<option value="${currency.code}">${currency.code}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm" placeholder="0" data-field="purchasePrice" step="0.01">
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm" placeholder="0" data-field="sellingPrice" step="0.01">
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm" placeholder="0" data-field="wholesalePrice" step="0.01">
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm" placeholder="0" data-field="stock" step="0.01">
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm" placeholder="10" data-field="minStock" step="0.01">
                </td>
                <td class="text-center">
                    <button type="button" class="btn-delete-row" onclick="ProductsModule.removeProductRow(this)" title="حذف الصف">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
            
            // Add paste functionality
            this.addPasteFunctionality(row);
            
            // Update stats
            this.updateBulkStats();
        },

        /**
         * Generate product code for bulk import row
         * توليد كود المنتج لصف الإدراج المتعدد
         */
        generateBulkRowCode(categorySelect) {
            console.log('🔢 Generating bulk row product code...');
            
            const row = categorySelect.closest('tr');
            if (!row) {
                console.warn('⚠️ Row not found for category select');
                return;
            }
            
            const codeInput = row.querySelector('input[data-field="code"]');
            if (!codeInput) {
                console.warn('⚠️ Code input not found in row');
                return;
            }
            
            const categoryId = categorySelect.value;
            if (!categoryId) {
                // Clear code if no category selected
                codeInput.value = '';
                codeInput.placeholder = 'اختر فئة أولاً';
                console.log('🔄 Cleared code - no category selected');
                return;
            }
            
            // Find category
            const category = this.categories.find(c => c.id === categoryId);
            if (!category) {
                console.warn('⚠️ Category not found for ID:', categoryId);
                codeInput.value = '';
                return;
            }
            
            // Generate code based on category
            const categoryCode = category.code || 'PRD';
            const nextNumber = this.getNextProductNumber(categoryCode);
            const productCode = `${categoryCode}-${nextNumber}`;
            
            codeInput.value = productCode;
            codeInput.placeholder = 'تم التوليد تلقائياً';
            
            console.log(`✅ Generated bulk product code: ${productCode} for category: ${category.name}`);
        },

        /**
         * Add bulk row based on current type
         * إضافة صف بناءً على النوع الحالي
         */
        addBulkRow() {
            const type = this.currentBulkImportType || 'products';
            switch(type) {
                case 'products':
                    this.addNewProductRow();
                    break;
                case 'categories':
                    this.addNewCategoryRow();
                    break;
                case 'units':
                    this.addNewUnitRow();
                    break;
            }
        },

        /**
         * Add new category row for bulk import
         * إضافة صف فئة جديد للإدراج المتعدد
         */
        addNewCategoryRow() {
            const tbody = document.getElementById('bulkImportTableBody');
            if (!tbody) return;
            
            const rowIndex = tbody.children.length + 1;
            const row = document.createElement('tr');
            row.className = 'category-import-row';
            row.innerHTML = `
                <td class="text-center">
                    <div class="row-number">${rowIndex}</div>
                </td>
                <td>
                    <input type="text" class="form-control form-control" placeholder="اسم الفئة" data-field="name" required>
                </td>
                <td>
                    <input type="text" class="form-control auto-generated-code" placeholder="سيتم توليده تلقائياً" data-field="code" readonly 
                           title="سيتم توليد الكود تلقائياً">
                </td>
                <td>
                    <textarea class="form-control form-control" placeholder="الوصف (اختياري)" data-field="description" rows="2"></textarea>
                </td>
                <td>
                    <input type="color" class="form-control form-control-color" data-field="color" value="#3498db" title="اختر لون الفئة">
                </td>
                <td>
                    <select class="form-select form-select" data-field="icon">
                        <option value="fas fa-folder">مجلد</option>
                        <option value="fas fa-box">صندوق</option>
                        <option value="fas fa-tag">علامة</option>
                        <option value="fas fa-tags">علامات</option>
                        <option value="fas fa-layer-group">طبقات</option>
                        <option value="fas fa-folder-open">مجلد مفتوح</option>
                    </select>
                </td>
                <td class="text-center">
                    <button type="button" class="btn-delete-row" onclick="ProductsModule.removeBulkRow(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
            this.updateBulkStats();
        },

        /**
         * Add new unit row for bulk import
         * إضافة صف وحدة جديد للإدراج المتعدد
         */
        addNewUnitRow() {
            const tbody = document.getElementById('bulkImportTableBody');
            if (!tbody) return;
            
            const rowIndex = tbody.children.length + 1;
            const row = document.createElement('tr');
            row.className = 'unit-import-row';
            row.innerHTML = `
                <td class="text-center">
                    <div class="row-number">${rowIndex}</div>
                </td>
                <td>
                    <input type="text" class="form-control form-control" placeholder="اسم الوحدة" data-field="name" required>
                </td>
                <td>
                    <input type="text" class="form-control auto-generated-code" placeholder="سيتم توليده تلقائياً" data-field="code" readonly 
                           title="سيتم توليد الكود تلقائياً">
                </td>
                <td>
                    <input type="text" class="form-control form-control" placeholder="الرمز (مثل: كغ، م)" data-field="symbol">
                </td>
                <td>
                    <textarea class="form-control form-control" placeholder="الوصف (اختياري)" data-field="description" rows="2"></textarea>
                </td>
                <td class="text-center">
                    <button type="button" class="btn-delete-row" onclick="ProductsModule.removeBulkRow(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
            this.updateBulkStats();
        },

        /**
         * Remove bulk import row (generic)
         * حذف صف من الإدراج المتعدد (عام)
         */
        removeBulkRow(button) {
            const row = button.closest('tr');
            if (!row) return;
            
            // Add animation before removing
            row.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                row.remove();
                this.updateRowNumbers();
                this.updateBulkStats();
            }, 300);
        },

        removeProductRow(button) {
            this.removeBulkRow(button);
        },

        updateRowNumbers() {
            const rows = document.querySelectorAll('#bulkImportTableBody tr');
            rows.forEach((row, index) => {
                const rowNumber = row.querySelector('.row-number');
                if (rowNumber) {
                    rowNumber.textContent = index + 1;
                }
            });
        },

        /**
         * Update bulk import statistics
         * تحديث إحصائيات الإدراج المتعدد
         */
        updateBulkStats() {
            const rows = document.querySelectorAll('#bulkImportTableBody tr');
            const totalRows = rows.length;
            let validRows = 0;
            let invalidRows = 0;

            rows.forEach(row => {
                const nameInput = row.querySelector('input[data-field="name"]');
                const isValid = nameInput && nameInput.value.trim().length > 0;
                
                if (isValid) {
                    validRows++;
                    row.classList.remove('row-error');
                    row.classList.add('row-success');
                } else {
                    invalidRows++;
                    row.classList.remove('row-success');
                    if (nameInput && nameInput.value.trim().length === 0 && nameInput !== document.activeElement) {
                        row.classList.add('row-error');
                    }
                }
            });

            // Update badges
            const rowsCountEl = document.getElementById('bulkRowsCount');
            const validCountEl = document.getElementById('bulkValidCount');
            const invalidCountEl = document.getElementById('bulkInvalidCount');
            
            if (rowsCountEl) rowsCountEl.textContent = `${totalRows} صف`;
            if (validCountEl) validCountEl.textContent = `${validRows} صالح`;
            if (invalidCountEl) invalidCountEl.textContent = `${invalidRows} خطأ`;
        },

        /**
         * Fill sample data for testing
         * ملء بيانات تجريبية للاختبار
         */
        fillSampleData() {
            const type = this.currentBulkImportType || 'products';
            console.log(`🧪 Filling sample data for ${type}...`);
            
            // Clear existing rows
            this.clearTable();

            if (type === 'products') {
            const sampleData = [
                { name: 'لابتوب Dell Inspiron', category: 'electronics', price: 1500 },
                { name: 'أرز بسمتي 5 كيلو', category: 'food', price: 25 },
                { name: 'قميص قطني أزرق', category: 'clothing', price: 75 },
                { name: 'كتاب البرمجة الحديثة', category: 'books', price: 45 }
            ];

                sampleData.forEach((item) => {
                this.addNewProductRow();
                const lastRow = document.querySelector('#bulkImportTableBody tr:last-child');
                
                if (lastRow) {
                    const nameInput = lastRow.querySelector('input[data-field="name"]');
                    const priceInput = lastRow.querySelector('input[data-field="sellingPrice"]');
                    
                    if (nameInput) nameInput.value = item.name;
                    if (priceInput) priceInput.value = item.price;
                    
                    const categorySelect = lastRow.querySelector('select[data-field="category"]');
                    if (categorySelect && this.categories.length > 0) {
                        const matchingCategory = this.categories.find(cat => 
                            cat.name.toLowerCase().includes(item.category) || 
                            cat.code.toLowerCase().includes(item.category)
                        );
                        if (matchingCategory) {
                            categorySelect.value = matchingCategory.id;
                            this.generateBulkRowCode(categorySelect);
                        }
                    }
                }
            });
            } else if (type === 'categories') {
                const sampleData = [
                    { name: 'إلكترونيات', color: '#3498db', icon: 'fas fa-laptop' },
                    { name: 'مواد غذائية', color: '#e74c3c', icon: 'fas fa-utensils' },
                    { name: 'ملابس', color: '#9b59b6', icon: 'fas fa-tshirt' },
                    { name: 'كتب', color: '#f39c12', icon: 'fas fa-book' }
                ];

                sampleData.forEach((item) => {
                    this.addNewCategoryRow();
                    const lastRow = document.querySelector('#bulkImportTableBody tr:last-child');
                    
                    if (lastRow) {
                        const nameInput = lastRow.querySelector('input[data-field="name"]');
                        const colorInput = lastRow.querySelector('input[data-field="color"]');
                        const iconSelect = lastRow.querySelector('select[data-field="icon"]');
                        
                        if (nameInput) nameInput.value = item.name;
                        if (colorInput) colorInput.value = item.color;
                        if (iconSelect) iconSelect.value = item.icon;
                    }
                });
            } else if (type === 'units') {
                const sampleData = [
                    { name: 'كيلوجرام', symbol: 'كغ', description: 'وحدة الوزن' },
                    { name: 'متر', symbol: 'م', description: 'وحدة الطول' },
                    { name: 'لتر', symbol: 'ل', description: 'وحدة الحجم' },
                    { name: 'قطعة', symbol: 'قطعة', description: 'وحدة العدد' }
                ];

                sampleData.forEach((item) => {
                    this.addNewUnitRow();
                    const lastRow = document.querySelector('#bulkImportTableBody tr:last-child');
                    
                    if (lastRow) {
                        const nameInput = lastRow.querySelector('input[data-field="name"]');
                        const symbolInput = lastRow.querySelector('input[data-field="symbol"]');
                        const descTextarea = lastRow.querySelector('textarea[data-field="description"]');
                        
                        if (nameInput) nameInput.value = item.name;
                        if (symbolInput) symbolInput.value = item.symbol;
                        if (descTextarea) descTextarea.value = item.description;
                    }
                });
            }

            this.updateBulkStats();
            console.log(`✅ Sample data filled successfully for ${type}`);
        },

        /**
         * Download Excel template
         * تحميل قالب Excel
         */
        downloadTemplate() {
            const type = this.currentBulkImportType || 'products';
            console.log(`📥 Downloading Excel template for ${type}...`);
            
            let headers, sampleData, fileName;
            
            if (type === 'products') {
                headers = [
                'اسم المنتج', 'الفئة', 'الوحدة', 'العملة', 
                'سعر الشراء', 'سعر البيع', 'سعر الجملة', 
                'المخزون', 'الحد الأدنى', 'الوصف'
            ];
                sampleData = [
                ['لابتوب Dell', 'إلكترونيات', 'قطعة', 'IQD', '1200', '1500', '1400', '10', '2', 'لابتوب للألعاب'],
                ['أرز بسمتي', 'مواد غذائية', 'كيلوجرام', 'IQD', '20', '25', '23', '100', '10', 'أرز هندي أصلي'],
                ['قميص قطني', 'ملابس', 'قطعة', 'IQD', '50', '75', '65', '25', '5', 'قميص رجالي']
            ];
                fileName = 'قالب_المنتجات.csv';
            } else if (type === 'categories') {
                headers = ['اسم الفئة', 'الوصف', 'اللون', 'الأيقونة'];
                sampleData = [
                    ['إلكترونيات', 'منتجات إلكترونية', '#3498db', 'fas fa-laptop'],
                    ['مواد غذائية', 'مواد غذائية متنوعة', '#e74c3c', 'fas fa-utensils'],
                    ['ملابس', 'ملابس وأزياء', '#9b59b6', 'fas fa-tshirt']
                ];
                fileName = 'قالب_الفئات.csv';
            } else if (type === 'units') {
                headers = ['اسم الوحدة', 'الرمز', 'الوصف'];
                sampleData = [
                    ['كيلوجرام', 'كغ', 'وحدة الوزن'],
                    ['متر', 'م', 'وحدة الطول'],
                    ['لتر', 'ل', 'وحدة الحجم']
                ];
                fileName = 'قالب_الوحدات.csv';
            } else {
                return;
            }

            // Create CSV content
            const csvContent = [
                headers.join(','),
                ...sampleData.map(row => row.join(','))
            ].join('\n');

            // Create and download file
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('✅ Template downloaded successfully');
        },

        clearTable() {
            const tbody = document.getElementById('bulkImportTableBody');
            tbody.innerHTML = '';
            this.addNewProductRow();
            this.updateBulkStats();
        },

        addPasteFunctionality(row) {
            const inputs = row.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.addEventListener('paste', (e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text');
                    this.handlePasteData(pastedData, row);
                });
            });
        },

        handlePasteData(data, startRow) {
            const lines = data.split('\n').filter(line => line.trim());
            if (lines.length === 0) return;
            
            const rows = document.querySelectorAll('.product-import-row');
            const startIndex = Array.from(rows).indexOf(startRow);
            
            lines.forEach((line, lineIndex) => {
                const values = line.split('\t'); // Tab-separated values
                
                let targetRow;
                if (startIndex + lineIndex < rows.length) {
                    targetRow = rows[startIndex + lineIndex];
                } else {
                    this.addNewProductRow();
                    const newRows = document.querySelectorAll('.product-import-row');
                    targetRow = newRows[newRows.length - 1];
                }
                
                this.fillRowData(targetRow, values);
            });
            
            this.updateRowNumbers();
        },

        fillRowData(row, values) {
            const fields = ['name', 'code', 'category', 'unit', 'currency', 'purchasePrice', 'sellingPrice', 'wholesalePrice', 'stock', 'minStock', 'description', 'brand', 'barcode'];
            
            fields.forEach((field, index) => {
                const input = row.querySelector(`[data-field="${field}"]`);
                if (input && values[index]) {
                    if (input.tagName === 'SELECT') {
                        // For dropdowns, try to find by name first, then by ID
                        const value = values[index].trim();
                        const option = Array.from(input.options).find(opt => 
                            opt.textContent === value || opt.value === value
                        );
                        if (option) {
                            input.value = option.value;
                        }
                    } else {
                        input.value = values[index].trim();
                    }
                }
            });
        },

        async importBulkProducts() {
            const type = this.currentBulkImportType || 'products';
            console.log(`📦 Importing bulk ${type}...`);
            
            const rows = document.querySelectorAll('#bulkImportTableBody tr');
            if (rows.length === 0) {
                const typeNames = {
                    'products': 'منتجات',
                    'categories': 'فئات',
                    'units': 'وحدات'
                };
                this.showError(`لا توجد ${typeNames[type] || 'عناصر'} للإدراج`);
                return;
            }
            
            const importBtn = document.getElementById('importBtn');
            if (importBtn) {
            importBtn.disabled = true;
            importBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإدراج...';
            }
            
            try {
                let successCount = 0;
                let errorCount = 0;
                const errors = [];
                
                for (const row of rows) {
                    try {
                        let data;
                        switch(type) {
                            case 'products':
                                data = this.extractProductDataFromRow(row);
                                if (!data.name) {
                            throw new Error('اسم المنتج مطلوب');
                        }
                                await this.saveProductData(data);
                                break;
                            case 'categories':
                                data = this.extractCategoryDataFromRow(row);
                                if (!data.name) {
                                    throw new Error('اسم الفئة مطلوب');
                                }
                                await Collections.addCategory(data);
                                break;
                            case 'units':
                                data = this.extractUnitDataFromRow(row);
                                if (!data.name) {
                                    throw new Error('اسم الوحدة مطلوب');
                                }
                                await Collections.addUnit(data);
                                break;
                        }
                        successCount++;
                    } catch (error) {
                        errorCount++;
                        const rowNumber = Array.from(rows).indexOf(row) + 1;
                        errors.push(`الصف ${rowNumber}: ${error.message}`);
                    }
                }
                
                this.showImportResults(successCount, errorCount, errors);
                
                // Reload data after import
                if (successCount > 0) {
                    await this.loadProducts();
                    if (type === 'categories') await this.loadCategories();
                    if (type === 'units') await this.loadUnits();
                    this.renderProductsTable();
                    this.renderCategoriesTable();
                    this.renderUnitsTable();
                }
                
            } catch (error) {
                console.error(`❌ Error importing bulk ${type}:`, error);
                const typeNames = {
                    'products': 'المنتجات',
                    'categories': 'الفئات',
                    'units': 'الوحدات'
                };
                this.showError(`خطأ في إدراج ${typeNames[type] || 'البيانات'}: ` + error.message);
            } finally {
                if (importBtn) {
                importBtn.disabled = false;
                    const typeNames = {
                        'products': 'المنتجات',
                        'categories': 'الفئات',
                        'units': 'الوحدات'
                    };
                    importBtn.innerHTML = `<i class="fas fa-upload"></i> إدراج ${typeNames[type] || 'البيانات'}`;
                }
            }
        },

        extractProductDataFromRow(row) {
            const data = {};
            const inputs = row.querySelectorAll('input, select');
            
            inputs.forEach(input => {
                const field = input.getAttribute('data-field');
                if (field) {
                    if (input.type === 'number') {
                        data[field] = parseFloat(input.value) || 0;
                    } else {
                        data[field] = input.value || '';
                    }
                }
            });
            
            // Auto-generate code if empty and category is provided
            if (!data.code && data.category) {
                const category = this.categories.find(c => c.id === data.category);
                if (category) {
                    const categoryCode = category.code || 'PRD';
                    const nextNumber = this.getNextProductNumber(categoryCode);
                    data.code = `${categoryCode}-${nextNumber}`;
                    
                    // Update the input field to show generated code
                    const codeInput = row.querySelector('input[data-field="code"]');
                    if (codeInput) {
                        codeInput.value = data.code;
                    }
                    
                    console.log(`🔢 Auto-generated product code in extraction: ${data.code}`);
                }
            }
            
            return data;
        },

        /**
         * Extract category data from row
         * استخراج بيانات الفئة من الصف
         */
        extractCategoryDataFromRow(row) {
            const data = {};
            const inputs = row.querySelectorAll('input, select, textarea');
            
            inputs.forEach(input => {
                const field = input.getAttribute('data-field');
                if (field) {
                    if (input.type === 'color') {
                        data[field] = input.value;
                    } else {
                        data[field] = input.value.trim();
                    }
                }
            });
            
            // Auto-generate code if empty
            if (!data.code && data.name) {
                data.code = this.generateCategoryCode();
                const codeInput = row.querySelector('input[data-field="code"]');
                if (codeInput) {
                    codeInput.value = data.code;
                }
            }
            
            // Set defaults
            if (!data.color) data.color = '#3498db';
            if (!data.icon) data.icon = 'fas fa-folder';
            if (!data.status) data.status = 'active';
            
            return data;
        },

        /**
         * Extract unit data from row
         * استخراج بيانات الوحدة من الصف
         */
        extractUnitDataFromRow(row) {
            const data = {};
            const inputs = row.querySelectorAll('input, textarea');
            
            inputs.forEach(input => {
                const field = input.getAttribute('data-field');
                if (field) {
                    data[field] = input.value.trim();
                }
            });
            
            // Auto-generate code if empty
            if (!data.code && data.name) {
                data.code = this.generateUnitCode();
                const codeInput = row.querySelector('input[data-field="code"]');
                if (codeInput) {
                    codeInput.value = data.code;
                }
            }
            
            // Set defaults
            if (!data.status) data.status = 'active';
            
            return data;
        },

        async saveProductData(productData) {
            // Find category and unit
            const category = this.categories.find(c => c.id === productData.category);
            const unit = this.units.find(u => u.id === productData.unit);
            
            const finalProductData = {
                name: productData.name,
                code: productData.code,
                categoryId: category ? category.id : null,
                categoryName: category ? category.name : '',
                unitId: unit ? unit.id : null,
                unitName: unit ? unit.name : '',
                currency: productData.currency || 'IQD',
                purchasePrice: productData.purchasePrice || 0,
                sellingPrice: productData.sellingPrice || 0,
                wholesalePrice: productData.wholesalePrice || 0,
                currentStock: productData.stock || 0,
                minStock: productData.minStock || 10,
                description: productData.description || '',
                brand: productData.brand || '',
                barcode: productData.barcode || '',
                status: 'active',
                createdAt: new Date()
            };
            
            await db.collection('products').add(finalProductData);
        },

        showImportResults(successCount, errorCount, errors) {
            const resultsDiv = document.getElementById('importResults');
            const contentDiv = document.getElementById('importResultsContent');
            
            let html = `
                <div class="row">
                    <div class="col-md-6">
                        <div class="alert alert-success">
                            <h6><i class="fas fa-check-circle"></i> تم الإدراج بنجاح</h6>
                            <p class="mb-0">عدد المنتجات المدرجة: <strong>${successCount}</strong></p>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="alert alert-danger">
                            <h6><i class="fas fa-exclamation-triangle"></i> أخطاء</h6>
                            <p class="mb-0">عدد الأخطاء: <strong>${errorCount}</strong></p>
                        </div>
                    </div>
                </div>
            `;
            
            if (errors.length > 0) {
                html += `
                    <div class="mt-3">
                        <h6>تفاصيل الأخطاء:</h6>
                        <ul class="list-group">
                            ${errors.map(error => `<li class="list-group-item text-danger">${error}</li>`).join('')}
                        </ul>
                    </div>
                `;
            }
            
            contentDiv.innerHTML = html;
            resultsDiv.style.display = 'block';
            
            // Reload data
            this.loadData();
            
            console.log(`✅ Import completed: ${successCount} success, ${errorCount} errors`);
        },

        resetBulkImportForm() {
            document.getElementById('bulkImportFile').value = '';
            document.getElementById('bulkImportText').value = '';
            document.getElementById('previewSection').style.display = 'none';
            document.getElementById('importResults').style.display = 'none';
            document.getElementById('databaseSelectionSection').style.display = 'none';
            document.getElementById('previewBtn').disabled = true;
            document.getElementById('importBtn').disabled = true;
            
            // Reset method to paste
            document.getElementById('importMethodSelect').value = 'paste';
            this.changeImportMethod();
        },

        changeImportType() {
            const type = document.getElementById('importTypeSelect').value;
            this.currentBulkImportType = type;
            
            // Update title
            const titles = {
                'products': 'إدراج منتجات متعدد',
                'categories': 'إدراج فئات متعدد',
                'units': 'إدراج وحدات متعدد'
            };
            document.getElementById('bulkImportTitle').textContent = titles[type];
            
            // Load instructions
            this.loadBulkImportInstructions(type);
            
            // Load database options
            this.loadDatabaseOptions();
            
            // Reset form
            this.resetBulkImportForm();
        },

        changeImportMethod() {
            const method = document.getElementById('importMethodSelect').value;
            
            // Hide all sections
            document.getElementById('fileUploadSection').style.display = 'none';
            document.getElementById('textPasteSection').style.display = 'none';
            document.getElementById('organizedTableSection').style.display = 'none';
            document.getElementById('databaseSelectionSection').style.display = 'none';
            
            // Show selected section
            switch(method) {
                case 'file':
                    document.getElementById('fileUploadSection').style.display = 'block';
                    break;
                case 'paste':
                    document.getElementById('textPasteSection').style.display = 'block';
                    break;
                case 'table':
                    document.getElementById('organizedTableSection').style.display = 'block';
                    document.getElementById('databaseSelectionSection').style.display = 'block';
                    this.createOrganizedTable();
                    break;
            }
        },

        loadDatabaseOptions() {
            // Load categories
            const categorySelect = document.getElementById('defaultCategorySelect');
            categorySelect.innerHTML = '<option value="">اختر فئة افتراضية</option>';
            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
            
            // Load units
            const unitSelect = document.getElementById('defaultUnitSelect');
            unitSelect.innerHTML = '<option value="">اختر وحدة افتراضية</option>';
            this.units.forEach(unit => {
                const option = document.createElement('option');
                option.value = unit.id;
                option.textContent = unit.name;
                unitSelect.appendChild(option);
            });
            
            // Load currencies
            const currencySelect = document.getElementById('defaultCurrencySelect');
            currencySelect.innerHTML = '<option value="">اختر عملة افتراضية</option>';
            this.currencies.forEach(currency => {
                const option = document.createElement('option');
                option.value = currency.code;
                option.textContent = `${currency.name} (${currency.code})`;
                currencySelect.appendChild(option);
            });
        },

        createOrganizedTable() {
            const headersRow = document.getElementById('organizedTableHeaders');
            const tbody = document.getElementById('organizedTableBody');
            
            // Clear existing content
            headersRow.innerHTML = '';
            tbody.innerHTML = '';
            
            // Define headers based on import type
            const headers = this.getTableHeaders();
            
            // Create header row
            headers.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header.label;
                th.className = 'text-center';
                headersRow.appendChild(th);
            });
            
            // Add action column
            const actionTh = document.createElement('th');
            actionTh.textContent = 'الإجراءات';
            actionTh.className = 'text-center';
            headersRow.appendChild(actionTh);
            
            // Add initial row
            this.addNewRow();
        },

        getTableHeaders() {
            switch(this.currentBulkImportType) {
                case 'products':
                    return [
                        { key: 'name', label: 'اسم المنتج' },
                        { key: 'code', label: 'كود المنتج' },
                        { key: 'category', label: 'الفئة' },
                        { key: 'unit', label: 'الوحدة' },
                        { key: 'currency', label: 'العملة' },
                        { key: 'purchasePrice', label: 'سعر الشراء' },
                        { key: 'sellingPrice', label: 'سعر البيع' },
                        { key: 'wholesalePrice', label: 'سعر الجملة' },
                        { key: 'stock', label: 'المخزون' },
                        { key: 'minStock', label: 'الحد الأدنى' },
                        { key: 'description', label: 'الوصف' },
                        { key: 'brand', label: 'الماركة' },
                        { key: 'barcode', label: 'الباركود' }
                    ];
                case 'categories':
                    return [
                        { key: 'name', label: 'اسم الفئة' },
                        { key: 'code', label: 'كود الفئة' },
                        { key: 'description', label: 'الوصف' },
                        { key: 'icon', label: 'الأيقونة' }
                    ];
                case 'units':
                    return [
                        { key: 'name', label: 'اسم الوحدة' },
                        { key: 'code', label: 'كود الوحدة' },
                        { key: 'symbol', label: 'رمز الوحدة' },
                        { key: 'description', label: 'الوصف' }
                    ];
                default:
                    return [];
            }
        },

        addNewRow() {
            const tbody = document.getElementById('organizedTableBody');
            const headers = this.getTableHeaders();
            
            const row = document.createElement('tr');
            row.className = 'import-row';
            
            // Add data cells
            headers.forEach(header => {
                const td = document.createElement('td');
                
                if (header.key === 'category' && this.currentBulkImportType === 'products') {
                    // Category dropdown
                    const select = document.createElement('select');
                    select.className = 'form-select form-select';
                    select.innerHTML = '<option value="">اختر فئة</option>';
                    this.categories.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category.id;
                        option.textContent = category.name;
                        select.appendChild(option);
                    });
                    td.appendChild(select);
                } else if (header.key === 'unit' && this.currentBulkImportType === 'products') {
                    // Unit dropdown
                    const select = document.createElement('select');
                    select.className = 'form-select form-select';
                    select.innerHTML = '<option value="">اختر وحدة</option>';
                    this.units.forEach(unit => {
                        const option = document.createElement('option');
                        option.value = unit.id;
                        option.textContent = unit.name;
                        select.appendChild(option);
                    });
                    td.appendChild(select);
                } else if (header.key === 'currency' && this.currentBulkImportType === 'products') {
                    // Currency dropdown
                    const select = document.createElement('select');
                    select.className = 'form-select form-select';
                    select.innerHTML = '<option value="">اختر عملة</option>';
                    this.currencies.forEach(currency => {
                        const option = document.createElement('option');
                        option.value = currency.code;
                        option.textContent = `${currency.name} (${currency.code})`;
                        select.appendChild(option);
                    });
                    td.appendChild(select);
                } else {
                    // Regular input
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.className = 'form-control form-control';
                    input.placeholder = header.label;
                    td.appendChild(input);
                }
                
                row.appendChild(td);
            });
            
            // Add action cell
            const actionTd = document.createElement('td');
            actionTd.className = 'text-center';
            actionTd.innerHTML = `
                <button type="button" class="btn btn-sm btn-danger" onclick="ProductsModule.removeRow(this)">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            row.appendChild(actionTd);
            
            tbody.appendChild(row);
        },

        removeRow(button) {
            const row = button.closest('tr');
            row.remove();
        },

    /**
     * Load bulk import instructions
     * تحميل تعليمات الإدراج المتعدد
     */
    loadBulkImportInstructions(type) {
        const instructionsDiv = document.getElementById('bulkImportInstructions');
        
        const instructions = {
            'products': `
                <h6>تنسيق البيانات للمنتجات:</h6>
                <p>يجب أن تحتوي البيانات على الأعمدة التالية:</p>
                <ul>
                    <li><strong>name</strong> - اسم المنتج (مطلوب)</li>
                    <li><strong>code</strong> - كود المنتج (مطلوب)</li>
                    <li><strong>category</strong> - اسم الفئة</li>
                    <li><strong>unit</strong> - اسم الوحدة</li>
                    <li><strong>currency</strong> - العملة (افتراضي: IQD)</li>
                    <li><strong>purchasePrice</strong> - سعر الشراء</li>
                    <li><strong>sellingPrice</strong> - سعر البيع</li>
                    <li><strong>wholesalePrice</strong> - سعر الجملة</li>
                    <li><strong>stock</strong> - المخزون الحالي</li>
                    <li><strong>minStock</strong> - الحد الأدنى للمخزون</li>
                    <li><strong>description</strong> - الوصف</li>
                    <li><strong>brand</strong> - الماركة</li>
                    <li><strong>barcode</strong> - الباركود</li>
                </ul>
                <p><strong>مثال:</strong></p>
                <pre>name,code,category,unit,currency,purchasePrice,sellingPrice,stock
لابتوب ديل,LAP001,إلكترونيات,قطعة,IQD,2000,2500,10
قميص قطني,SHI001,ملابس,قطعة,IQD,30,50,25</pre>
            `,
            'categories': `
                <h6>تنسيق البيانات للفئات:</h6>
                <p>يجب أن تحتوي البيانات على الأعمدة التالية:</p>
                <ul>
                    <li><strong>name</strong> - اسم الفئة (مطلوب)</li>
                    <li><strong>code</strong> - كود الفئة</li>
                    <li><strong>description</strong> - الوصف</li>
                    <li><strong>icon</strong> - الأيقونة</li>
                </ul>
                <p><strong>مثال:</p>
                <pre>name,code,description,icon
إلكترونيات,ELEC,منتجات إلكترونية,fas fa-laptop
ملابس,CLOTH,ملابس وأزياء,fas fa-tshirt</pre>
            `,
            'units': `
                <h6>تنسيق البيانات للوحدات:</h6>
                <p>يجب أن تحتوي البيانات على الأعمدة التالية:</p>
                <ul>
                    <li><strong>name</strong> - اسم الوحدة (مطلوب)</li>
                    <li><strong>code</strong> - كود الوحدة</li>
                    <li><strong>symbol</strong> - رمز الوحدة</li>
                    <li><strong>description</strong> - الوصف</li>
                </ul>
                <p><strong>مثال:</p>
                <pre>name,code,symbol,description
قطعة,PCS,قطعة,وحدة القطعة
كيلوغرام,KG,كغ,وحدة الوزن
متر,M,m,وحدة الطول</pre>
            `
        };
        
        instructionsDiv.innerHTML = instructions[type];
    },

    /**
     * Preview bulk data
     * معاينة البيانات المتعددة
     */
    previewBulkData() {
        console.log('👁️ Previewing bulk data...');
        
        const method = document.getElementById('importMethodSelect').value;
        
        if (method === 'table') {
            this.previewOrganizedTable();
        } else {
            const fileInput = document.getElementById('bulkImportFile');
            const textInput = document.getElementById('bulkImportText');
            
            let data = '';
            
            if (fileInput.files.length > 0) {
                // Handle file upload
                this.handleFileUpload(fileInput.files[0]);
            } else if (textInput.value.trim()) {
                // Handle text input
                data = textInput.value.trim();
                this.parseBulkData(data);
            } else {
                this.showError('يرجى إدخال البيانات أو رفع ملف');
                return;
            }
        }
    },

    previewOrganizedTable() {
        console.log('👁️ Previewing organized table data...');
        
        const tbody = document.getElementById('organizedTableBody');
        const rows = tbody.querySelectorAll('.import-row');
        
        if (rows.length === 0) {
            this.showError('لا توجد بيانات في الجدول');
            return;
        }
        
        const headers = this.getTableHeaders();
        const data = [];
        
        rows.forEach((row, index) => {
            const rowData = {};
            const cells = row.querySelectorAll('td');
            
            headers.forEach((header, cellIndex) => {
                const cell = cells[cellIndex];
                const input = cell.querySelector('input, select');
                
                if (input) {
                    rowData[header.key] = input.value || '';
                }
            });
            
            // Check if row has any data
            const hasData = Object.values(rowData).some(value => value.trim() !== '');
            if (hasData) {
                data.push(rowData);
            }
        });
        
        if (data.length === 0) {
            this.showError('لا توجد بيانات صحيحة في الجدول');
            return;
        }
        
        this.bulkData = { 
            headers: headers.map(h => h.label), 
            rows: data 
        };
        this.showPreview();
    },

    /**
     * Handle file upload
     * معالجة رفع الملف
     */
    handleFileUpload(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const data = e.target.result;
            this.parseBulkData(data);
        };
        
        if (file.name.endsWith('.csv')) {
            reader.readAsText(file);
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            // For Excel files, we'll use a simple CSV approach
            reader.readAsText(file);
        }
    },

    /**
     * Parse bulk data
     * تحليل البيانات المتعددة
     */
    parseBulkData(data) {
        try {
            const lines = data.split('\n').filter(line => line.trim());
            if (lines.length < 2) {
                this.showError('البيانات غير صحيحة. يجب أن تحتوي على عنوان وأقل من سطر واحد من البيانات');
                return;
            }
            
            const headers = lines[0].split(',').map(h => h.trim());
            const rows = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim());
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                return row;
            });
            
            this.bulkData = { headers, rows };
            this.showPreview();
            
        } catch (error) {
            console.error('❌ Error parsing bulk data:', error);
            this.showError('خطأ في تحليل البيانات: ' + error.message);
        }
    },

    /**
     * Show preview
     * عرض المعاينة
     */
    showPreview() {
        const previewSection = document.getElementById('previewSection');
        const previewTable = document.getElementById('previewTable');
        
        // Clear previous content
        previewTable.innerHTML = '';
        
        // Create headers
        const thead = document.createElement('thead');
        thead.className = 'table-light';
        const headerRow = document.createElement('tr');
        
        this.bulkData.headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        previewTable.appendChild(thead);
        
        // Create body
        const tbody = document.createElement('tbody');
        
        this.bulkData.rows.slice(0, 10).forEach(row => { // Show only first 10 rows
            const tr = document.createElement('tr');
            
            this.bulkData.headers.forEach(header => {
                const td = document.createElement('td');
                td.textContent = row[header] || '';
                tr.appendChild(td);
            });
            
            tbody.appendChild(tr);
        });
        
        previewTable.appendChild(tbody);
        
        // Show preview section
        previewSection.style.display = 'block';
        
        // Enable buttons
        document.getElementById('previewBtn').disabled = false;
        document.getElementById('importBtn').disabled = false;
        
        console.log(`✅ Preview shown for ${this.bulkData.rows.length} rows`);
    },

    /**
     * Import bulk data
     * إدراج البيانات المتعددة
     */
    async importBulkData() {
        console.log(`📦 Importing bulk data for: ${this.currentBulkImportType}`);
        
        if (!this.bulkData || !this.bulkData.rows.length) {
            this.showError('لا توجد بيانات للإدراج');
            return;
        }
        
        const importBtn = document.getElementById('importBtn');
        importBtn.disabled = true;
        importBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإدراج...';
        
        try {
            let successCount = 0;
            let errorCount = 0;
            const errors = [];
            
            for (const row of this.bulkData.rows) {
                try {
                    await this.importSingleRow(row);
                    successCount++;
                } catch (error) {
                    errorCount++;
                    errors.push(`السطر ${successCount + errorCount}: ${error.message}`);
                }
            }
            
            this.showImportResults(successCount, errorCount, errors);
            
        } catch (error) {
            console.error('❌ Error importing bulk data:', error);
            this.showError('خطأ في إدراج البيانات: ' + error.message);
        } finally {
            importBtn.disabled = false;
            importBtn.innerHTML = 'إدراج البيانات';
        }
    },

    /**
     * Import single row
     * إدراج سطر واحد
     */
    async importSingleRow(row) {
        switch (this.currentBulkImportType) {
            case 'products':
                await this.importProductRow(row);
                break;
            case 'categories':
                await this.importCategoryRow(row);
                break;
            case 'units':
                await this.importUnitRow(row);
                break;
            default:
                throw new Error('نوع الإدراج غير صحيح');
        }
    },

    /**
     * Import product row
     * إدراج سطر منتج
     */
    async importProductRow(row) {
        console.log('📦 Importing product row:', row);
        
        // Validate required fields
        if (!row.name) {
            throw new Error('اسم المنتج مطلوب');
        }
        
        // Auto-generate code if empty and category is provided
        if (!row.code && row.category) {
            const category = this.categories.find(c => c.id === row.category);
            if (category) {
                const categoryCode = category.code || 'PRD';
                const nextNumber = this.getNextProductNumber(categoryCode);
                row.code = `${categoryCode}-${nextNumber}`;
                console.log(`🔢 Auto-generated product code: ${row.code} for category: ${category.name}`);
            }
        }
        
        // Fallback to default code if still empty
        if (!row.code) {
            const nextNumber = this.getNextProductNumber('PRD');
            row.code = `PRD-${nextNumber}`;
            console.log(`🔢 Generated default product code: ${row.code}`);
        }
        
        // Get default values from dropdowns
        const defaultCategoryId = document.getElementById('defaultCategorySelect').value;
        const defaultUnitId = document.getElementById('defaultUnitSelect').value;
        const defaultCurrency = document.getElementById('defaultCurrencySelect').value;
        
        // Find category (by ID or name)
        let category = null;
        if (row.category) {
            if (row.category.startsWith('cat_')) {
                category = this.categories.find(c => c.id === row.category);
            } else {
                category = this.categories.find(c => c.name === row.category);
            }
        }
        if (!category && defaultCategoryId) {
            category = this.categories.find(c => c.id === defaultCategoryId);
        }
        
        // Find unit (by ID or name)
        let unit = null;
        if (row.unit) {
            if (row.unit.startsWith('unit_')) {
                unit = this.units.find(u => u.id === row.unit);
            } else {
                unit = this.units.find(u => u.name === row.unit);
            }
        }
        if (!unit && defaultUnitId) {
            unit = this.units.find(u => u.id === defaultUnitId);
        }
        
        // Get currency
        const currency = row.currency || defaultCurrency || 'IQD';
        
        const productData = {
            name: row.name,
            code: row.code,
            categoryId: category ? category.id : null,
            categoryName: category ? category.name : (row.category || ''),
            unitId: unit ? unit.id : null,
            unitName: unit ? unit.name : (row.unit || ''),
            currency: currency,
            purchasePrice: parseFloat(row.purchasePrice) || 0,
            sellingPrice: parseFloat(row.sellingPrice) || 0,
            wholesalePrice: parseFloat(row.wholesalePrice) || 0,
            currentStock: parseFloat(row.stock) || 0,
            minStock: parseFloat(row.minStock) || 10,
            description: row.description || '',
            brand: row.brand || '',
            barcode: row.barcode || '',
            status: 'active',
            createdAt: new Date()
        };
        
        await db.collection('products').add(productData);
    },

    /**
     * Import category row
     * إدراج سطر فئة
     */
    async importCategoryRow(row) {
        if (!row.name) {
            throw new Error('اسم الفئة مطلوب');
        }
        
        const categoryData = {
            name: row.name,
            code: row.code || '',
            description: row.description || '',
            icon: row.icon || 'fas fa-folder',
            isActive: true,
            createdAt: new Date()
        };
        
        await db.collection('categories').add(categoryData);
    },

    /**
     * Import unit row
     * إدراج سطر وحدة
     */
    async importUnitRow(row) {
        if (!row.name) {
            throw new Error('اسم الوحدة مطلوب');
        }
        
        const unitData = {
            name: row.name,
            code: row.code || '',
            symbol: row.symbol || '',
            description: row.description || '',
            isActive: true,
            createdAt: new Date()
        };
        
        await db.collection('units').add(unitData);
    },

    /**
     * Show import results
     * عرض نتائج الإدراج
     */
    showImportResults(successCount, errorCount, errors) {
        const resultsDiv = document.getElementById('importResults');
        const contentDiv = document.getElementById('importResultsContent');
        
        let html = `
            <div class="row">
                <div class="col-md-6">
                    <div class="alert alert-success">
                        <h6><i class="fas fa-check-circle"></i> تم الإدراج بنجاح</h6>
                        <p class="mb-0">عدد العناصر المدرجة: <strong>${successCount}</strong></p>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="alert alert-danger">
                        <h6><i class="fas fa-exclamation-triangle"></i> أخطاء</h6>
                        <p class="mb-0">عدد الأخطاء: <strong>${errorCount}</strong></p>
                    </div>
                </div>
            </div>
        `;
        
        if (errors.length > 0) {
            html += `
                <div class="mt-3">
                    <h6>تفاصيل الأخطاء:</h6>
                    <ul class="list-group">
                        ${errors.map(error => `<li class="list-group-item text-danger">${error}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        contentDiv.innerHTML = html;
        resultsDiv.style.display = 'block';
        
        // Reload data
        this.loadData();
        
        console.log(`✅ Import completed: ${successCount} success, ${errorCount} errors`);
    },

    /**
     * Generate product code
     * توليد كود المنتج
     */
    generateProductCode() {
        console.log('🔢 Generating product code...');
        
        const categorySelect = document.getElementById('productCategory');
        const categoryId = categorySelect ? categorySelect.value : null;
        
        if (!categoryId) {
            // Default code if no category selected
            const defaultCode = this.getNextProductNumber('PRD');
            const productCode = `PRD-${defaultCode}`;
            const codeInput = document.getElementById('productCode');
            if (codeInput) {
                codeInput.value = productCode;
                console.log('✅ Generated default product code: ' + productCode);
            } else {
                console.warn('⚠️ Product code input not found');
            }
            return;
        }
        
        // Find category
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) {
            console.warn('⚠️ Category not found for ID:', categoryId);
            return;
        }
        
        // Generate code based on category
        const categoryCode = category.code || 'PRD';
        const nextNumber = this.getNextProductNumber(categoryCode);
        const productCode = `${categoryCode}-${nextNumber}`;
        
        const codeInput = document.getElementById('productCode');
        if (codeInput) {
            codeInput.value = productCode;
            console.log(`✅ Generated product code: ${productCode} for category: ${category.name}`);
        } else {
            console.warn('⚠️ Product code input not found');
        }
    },

    /**
     * Get next product number for category
     * الحصول على الرقم التالي للمنتج في الفئة
     */
    getNextProductNumber(categoryCode) {
        console.log(`🔢 Getting next product number for category: ${categoryCode}`);
        
        const categoryProducts = this.products.filter(p => 
            p.code && p.code.startsWith(categoryCode + '-')
        );
        
        console.log(`📊 Found ${categoryProducts.length} products in category ${categoryCode}`);
        
        if (categoryProducts.length === 0) {
            console.log('✅ No products found, starting with 0001');
            return '0001';
        }
        
        const numbers = categoryProducts.map(p => {
            const match = p.code.match(/-(\d+)$/);
            return match ? parseInt(match[1]) : 0;
        });
        
        const maxNumber = Math.max(...numbers);
        const nextNumber = String(maxNumber + 1).padStart(4, '0');
        
        console.log(`✅ Next product number: ${nextNumber}`);
        return nextNumber;
    },

    /**
     * Show tracking constraints protection message
     * إظهار رسالة حماية قيود التتبع
     */
    showTrackingConstraintsProtection() {
        // Add protection indicators to checkboxes
        const expiryCheckbox = document.getElementById('hasExpiryDate');
        const serialCheckbox = document.getElementById('hasSerialNumber');
        
        if (expiryCheckbox) {
            expiryCheckbox.disabled = true;
            expiryCheckbox.title = 'لا يمكن تعديل هذا الخيار لأن المنتج له حركات في النظام';
        }
        
        if (serialCheckbox) {
            serialCheckbox.disabled = true;
            serialCheckbox.title = 'لا يمكن تعديل هذا الخيار لأن المنتج له حركات في النظام';
        }
        
        // Add protection indicators to constraint checkboxes
        const forceExpiryOnInput = document.getElementById('forceExpiryOnInput');
        const forceExpiryOnOutput = document.getElementById('forceExpiryOnOutput');
        const forceSerialOnInput = document.getElementById('forceSerialOnInput');
        const forceSerialOnOutput = document.getElementById('forceSerialOnOutput');
        
        if (forceExpiryOnInput) {
            forceExpiryOnInput.disabled = true;
            forceExpiryOnInput.title = 'لا يمكن تعديل هذا الخيار لأن المنتج له حركات في النظام';
        }
        
        if (forceExpiryOnOutput) {
            forceExpiryOnOutput.disabled = true;
            forceExpiryOnOutput.title = 'لا يمكن تعديل هذا الخيار لأن المنتج له حركات في النظام';
        }
        
        if (forceSerialOnInput) {
            forceSerialOnInput.disabled = true;
            forceSerialOnInput.title = 'لا يمكن تعديل هذا الخيار لأن المنتج له حركات في النظام';
        }
        
        if (forceSerialOnOutput) {
            forceSerialOnOutput.disabled = true;
            forceSerialOnOutput.title = 'لا يمكن تعديل هذا الخيار لأن المنتج له حركات في النظام';
        }
        
        // Show info message
        this.showInfo('تم حماية قيود التتبع لأن المنتج له حركات في النظام');
        
        console.log('🔒 Tracking constraints protected due to existing transactions');
    },

    /**
     * Show sub units protection message
     * إظهار رسالة حماية الوحدات الفرعية
     */
    async showSubUnitsProtection() {
        // Keep add sub unit button enabled - allow adding new sub units
        const addSubUnitBtn = document.getElementById('addSubUnitBtn');
        if (addSubUnitBtn) {
            addSubUnitBtn.disabled = false;
            addSubUnitBtn.title = 'إضافة وحدة فرعية جديدة';
            addSubUnitBtn.innerHTML = '<i class="fas fa-plus"></i> إضافة وحدة فرعية';
        }
        
        // Check each existing sub unit individually
        const subUnitItems = document.querySelectorAll('.sub-unit-item');
        let protectedCount = 0;
        
        for (const item of subUnitItems) {
            const subUnitId = item.id;
            const hasTransactions = await this.hasSpecificSubUnitTransactions(this.currentEditId, subUnitId);
            
            if (hasTransactions) {
                protectedCount++;
                // Disable all inputs and selects for this specific sub unit
                const inputs = item.querySelectorAll('input, select');
                inputs.forEach(input => {
                    input.disabled = true;
                    input.title = 'لا يمكن تعديل هذا الحقل لأن المنتج له حركات على هذه الوحدة';
                });
                
                // Disable remove button for this specific sub unit
                const removeBtn = item.querySelector('button[onclick*="removeSubUnit"]');
                if (removeBtn) {
                    removeBtn.disabled = true;
                    removeBtn.title = 'لا يمكن حذف هذه الوحدة لأن المنتج له حركات عليها';
                    removeBtn.innerHTML = '<i class="fas fa-lock"></i>';
                }
                
                // Add visual indicator
                item.style.opacity = '0.7';
                item.style.border = '2px solid #ffc107';
            }
        }
        
        if (protectedCount > 0) {
            // Show info message
            this.showInfo(`تم حماية ${protectedCount} وحدة فرعية لأن المنتج له حركات عليها. يمكن إضافة وحدات فرعية جديدة.`);
        }
        
        console.log('🔒 Sub units protection applied:', protectedCount, 'protected units');
    },

    /**
     * Check if product has transactions
     * فحص وجود حركات على المنتج
     */
    async hasProductTransactions(productId) {
        try {
            // Check sales
            const sales = await Collections.getSales({ productId: productId });
            if (sales && sales.length > 0) {
                console.log('📊 Product has sales transactions:', sales.length);
                return true;
            }
            
            // Check purchases
            const purchases = await Collections.getPurchases({ productId: productId });
            if (purchases && purchases.length > 0) {
                console.log('📊 Product has purchase transactions:', purchases.length);
                return true;
            }
            
            // Check inventory movements
            const inventory = await Collections.getInventoryMovements({ productId: productId });
            if (inventory && inventory.length > 0) {
                console.log('📊 Product has inventory movements:', inventory.length);
                return true;
            }
            
            console.log('📊 Product has no transactions');
            return false;
        } catch (error) {
            console.error('❌ Error checking product transactions:', error);
            return false;
        }
    },

    /**
     * Check if specific sub unit has transactions
     * فحص وجود حركات على وحدة فرعية محددة
     */
    async hasSpecificSubUnitTransactions(productId, subUnitId) {
        try {
            // Get the sub unit element to find its unit ID
            const subUnitElement = document.getElementById(subUnitId);
            if (!subUnitElement) return false;

            const unitSelect = subUnitElement.querySelector('.sub-unit-unit');
            if (!unitSelect || !unitSelect.value) return false;

            const unitId = unitSelect.value;

            // Check sales with this specific sub unit
            const sales = await Collections.getSales({ 
                productId: productId,
                unitId: unitId 
            });
            if (sales && sales.length > 0) {
                console.log('📊 Specific sub unit has sales transactions:', unitId, sales.length);
                return true;
            }
            
            // Check purchases with this specific sub unit
            const purchases = await Collections.getPurchases({ 
                productId: productId,
                unitId: unitId 
            });
            if (purchases && purchases.length > 0) {
                console.log('📊 Specific sub unit has purchase transactions:', unitId, purchases.length);
                return true;
            }
            
            console.log('📊 Specific sub unit has no transactions:', unitId);
            return false;
        } catch (error) {
            console.error('❌ Error checking specific sub unit transactions:', error);
            return false;
        }
    },

    /**
     * Check if product has sub unit transactions
     * فحص وجود حركات على الوحدات الفرعية للمنتج
     */
    async hasSubUnitTransactions(productId) {
        try {
            // Get product data to check sub units
            const product = this.products.find(p => p.id === productId);
            if (!product || !product.subUnits || product.subUnits.length === 0) {
                return false;
            }

            // Check if any sub unit has been used in transactions
            for (const subUnit of product.subUnits) {
                // Check sales with this sub unit
                const sales = await Collections.getSales({ 
                    productId: productId,
                    unitId: subUnit.unitId 
                });
                if (sales && sales.length > 0) {
                    console.log('📊 Sub unit has sales transactions:', subUnit.unitId, sales.length);
                    return true;
                }
                
                // Check purchases with this sub unit
                const purchases = await Collections.getPurchases({ 
                    productId: productId,
                    unitId: subUnit.unitId 
                });
                if (purchases && purchases.length > 0) {
                    console.log('📊 Sub unit has purchase transactions:', subUnit.unitId, purchases.length);
                    return true;
                }
            }
            
            console.log('📊 Product sub units have no transactions');
            return false;
        } catch (error) {
            console.error('❌ Error checking sub unit transactions:', error);
            return false;
        }
    },

    /**
     * Toggle expiry date settings
     * تبديل إعدادات تاريخ الصلاحية
     */
    async toggleExpirySettings() {
        const checkbox = document.getElementById('hasExpiryDate');
        const settings = document.getElementById('expiryDateSettings');
        
        console.log('🔧 Toggle expiry settings - checkbox checked:', checkbox?.checked);
        
        if (checkbox && settings) {
            if (checkbox.checked) {
                settings.style.display = 'block';
                console.log('✅ Expiry settings shown');
            } else {
                // Check if we can disable expiry tracking
                if (this.currentEditId) {
                    const hasTransactions = await this.hasProductTransactions(this.currentEditId);
                    if (hasTransactions) {
                        checkbox.checked = true; // Re-check the checkbox
                        this.showError('لا يمكن إلغاء تتبع تاريخ الصلاحية لأن المنتج له حركات في النظام');
                        return;
                    }
                }
                settings.style.display = 'none';
                console.log('✅ Expiry settings hidden');
            }
        } else {
            console.warn('⚠️ Expiry checkbox or settings not found');
        }
    },

    /**
     * Toggle serial number settings
     * تبديل إعدادات الرقم التسلسلي
     */
    async toggleSerialSettings() {
        const checkbox = document.getElementById('hasSerialNumber');
        const settings = document.getElementById('serialNumberSettings');
        
        console.log('🔧 Toggle serial settings - checkbox checked:', checkbox?.checked);
        
        if (checkbox && settings) {
            if (checkbox.checked) {
                settings.style.display = 'block';
                console.log('✅ Serial settings shown');
            } else {
                // Check if we can disable serial tracking
                if (this.currentEditId) {
                    const hasTransactions = await this.hasProductTransactions(this.currentEditId);
                    if (hasTransactions) {
                        checkbox.checked = true; // Re-check the checkbox
                        this.showError('لا يمكن إلغاء تتبع الأرقام التسلسلية لأن المنتج له حركات في النظام');
                        return;
                    }
                }
                settings.style.display = 'none';
                console.log('✅ Serial settings hidden');
            }
        } else {
            console.warn('⚠️ Serial checkbox or settings not found');
        }
    },

    /**
     * Save product
     * حفظ المنتج
     */
    async saveProduct() {
        try {
            console.log('💾 Saving product...');
            
            // Prevent multiple saves
            const saveBtn = document.getElementById('saveProductBtn');
            if (saveBtn.disabled) {
                console.log('⚠️ Save already in progress, ignoring duplicate call');
                return;
            }
            
            // Validate form
            if (!this.validateProductForm()) {
                return;
            }
            
            // Collect form data
            const productData = await this.collectProductData();
            
            console.log('💾 About to save product data:', productData);
            console.log('💾 Tracking constraints:', {
                hasExpiryDate: productData.hasExpiryDate,
                forceExpiryOnInput: productData.forceExpiryOnInput,
                forceExpiryOnOutput: productData.forceExpiryOnOutput,
                hasSerialNumber: productData.hasSerialNumber,
                forceSerialOnInput: productData.forceSerialOnInput,
                forceSerialOnOutput: productData.forceSerialOnOutput,
                expiryWarningDays: productData.expiryWarningDays
            });
            
            // Show loading and disable button
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
            saveBtn.disabled = true;
            
            // Additional validation - check for duplicates in database
            if (!this.currentEditId) {
                const existingProduct = this.products.find(p => 
                    p.code === productData.code || p.name === productData.name
                );
                
                if (existingProduct) {
                    this.showError('المنتج موجود مسبقاً في قاعدة البيانات');
                    saveBtn.innerHTML = originalText;
                    saveBtn.disabled = false;
                    return;
                }
            }
            
            // Save product
            if (this.currentEditId) {
                // Update product
                await Collections.updateProduct(this.currentEditId, productData);
                
                // Update local array immediately for better performance
                const productIndex = this.products.findIndex(p => p.id === this.currentEditId);
                if (productIndex !== -1) {
                    this.products[productIndex] = {
                        ...this.products[productIndex],
                        ...productData,
                        id: this.currentEditId
                    };
                    this.filteredProducts = [...this.products];
                }
                
                // إشعار الوحدات الأخرى بتحديث المنتج
                this.notifyModulesOfProductUpdate(this.currentEditId, productData);
                
                this.showSuccess('تم تحديث المنتج بنجاح');
            } else {
                // Add new product
                const newProduct = await Collections.addProduct(productData);
                
                // Add to local array immediately
                if (newProduct && newProduct.id) {
                    this.products.unshift({
                        id: newProduct.id,
                        ...productData
                    });
                    this.filteredProducts = [...this.products];
                    
                    // إشعار الوحدات الأخرى بإضافة منتج جديد
                    this.notifyModulesOfProductUpdate(newProduct.id, productData);
                }
                
                this.showSuccess('تم إضافة المنتج بنجاح');
            }
            
            // Hide modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
            if (modal) {
                modal.hide();
            }
            
            // Update UI without full reload (faster)
            this.renderProductsTable();
            this.updateSummaryCards();
            
            // Reload data in background to ensure consistency (optional)
            setTimeout(async () => {
                await this.loadProducts();
                this.renderProductsTable();
                this.updateSummaryCards();
            }, 500);
            
        } catch (error) {
            console.error('❌ Error saving product:', error);
            this.showError('خطأ في حفظ المنتج: ' + error.message);
        } finally {
            // Reset button
            const saveBtn = document.getElementById('saveProductBtn');
            if (saveBtn) {
                saveBtn.innerHTML = '<i class="fas fa-save"></i> حفظ';
                saveBtn.disabled = false;
            }
        }
    },

    /**
     * Validate product form
     * التحقق من صحة نموذج المنتج
     */
    validateProductForm() {
        const requiredFields = [
            { id: 'productCode', name: 'كود المنتج' },
            { id: 'productName', name: 'اسم المنتج' },
            { id: 'productCategory', name: 'الفئة' },
            { id: 'productUnit', name: 'الوحدة' },
            { id: 'purchasePrice', name: 'سعر الشراء' },
            { id: 'sellingPrice', name: 'سعر البيع' }
        ];
        
        for (const field of requiredFields) {
            const element = document.getElementById(field.id);
            if (!element || !element.value.trim()) {
                this.showError(`حقل ${field.name} مطلوب`);
                if (element) element.focus();
                return false;
            }
        }
        
        // Check for duplicate code
        const code = document.getElementById('productCode').value.trim();
        const existingProduct = this.products.find(p => 
            p.code === code && p.id !== this.currentEditId
        );
        
        if (existingProduct) {
            this.showError('كود المنتج موجود مسبقاً');
            document.getElementById('productCode').focus();
            return false;
        }
        
        // Check for duplicate name
        const name = document.getElementById('productName').value.trim();
        const existingProductName = this.products.find(p => 
            p.name === name && p.id !== this.currentEditId
        );
        
        if (existingProductName) {
            this.showError('اسم المنتج موجود مسبقاً');
            document.getElementById('productName').focus();
            return false;
        }
        
        // Check for duplicate barcode
        const barcode = document.getElementById('productBarcode')?.value.trim();
        if (barcode) {
            const existingBarcode = this.products.find(p => 
                p.barcode && p.barcode === barcode && p.id !== this.currentEditId
            );
            
            if (existingBarcode) {
                this.showError('الباركود موجود مسبقاً');
                document.getElementById('productBarcode').focus();
                return false;
            }
        }
        
        // Validate prices
        const purchasePrice = parseFloat(document.getElementById('purchasePrice').value) || 0;
        const sellingPrice = parseFloat(document.getElementById('sellingPrice').value) || 0;
        const wholesalePrice = parseFloat(document.getElementById('wholesalePrice')?.value) || 0;
        
        // Check if selling price is less than purchase price
        if (sellingPrice > 0 && purchasePrice > 0 && sellingPrice < purchasePrice) {
            this.showError('سعر البيع يجب أن يكون أكبر من أو يساوي سعر الشراء');
            document.getElementById('sellingPrice').focus();
            return false;
        }
        
        // Check if wholesale price is valid
        if (wholesalePrice > 0) {
            if (wholesalePrice < purchasePrice) {
                this.showError('سعر الجملة يجب أن يكون أكبر من أو يساوي سعر الشراء');
                document.getElementById('wholesalePrice').focus();
                return false;
            }
            if (wholesalePrice > sellingPrice) {
                this.showError('سعر الجملة يجب أن يكون أقل من أو يساوي سعر البيع');
                document.getElementById('wholesalePrice').focus();
                return false;
            }
        }
        
        // Check stock warning
        const currentStock = parseFloat(document.getElementById('currentStock')?.value) || 0;
        const minStock = parseFloat(document.getElementById('minStock')?.value) || 0;
        
        if (minStock > 0 && currentStock < minStock) {
            // Show warning but don't prevent save
            console.warn('⚠️ Current stock is below minimum stock');
        }
        
        return true;
    },

    /**
     * Collect product data from form
     * جمع بيانات المنتج من النموذج
     */
    async collectProductData() {
        const categoryId = document.getElementById('productCategory').value;
        const unitId = document.getElementById('productUnit').value;
        
        console.log('📝 Collecting product data:');
        console.log('Category ID:', categoryId);
        console.log('Unit ID:', unitId);
        console.log('Category select element:', document.getElementById('productCategory'));
        console.log('Unit select element:', document.getElementById('productUnit'));
        console.log('Category select value:', document.getElementById('productCategory').value);
        console.log('Unit select value:', document.getElementById('productUnit').value);
        console.log('Category select options:', Array.from(document.getElementById('productCategory').options).map(opt => ({ value: opt.value, text: opt.text })));
        console.log('Unit select options:', Array.from(document.getElementById('productUnit').options).map(opt => ({ value: opt.value, text: opt.text })));
        
        // Validate that category and unit are selected
        if (!categoryId) {
            console.warn('⚠️ No category selected');
        }
        if (!unitId) {
            console.warn('⚠️ No unit selected');
        }
        
        // Check if we're editing and if tracking constraints can be modified
        let trackingConstraints = {
            hasExpiryDate: document.getElementById('hasExpiryDate').checked,
            forceExpiryOnInput: document.getElementById('forceExpiryOnInput').checked,
            forceExpiryOnOutput: document.getElementById('forceExpiryOnOutput').checked,
            hasSerialNumber: document.getElementById('hasSerialNumber').checked,
            forceSerialOnInput: document.getElementById('forceSerialOnInput').checked,
            forceSerialOnOutput: document.getElementById('forceSerialOnOutput').checked
        };
        
        // If editing, check if constraints can be modified
        if (this.currentEditId) {
            const hasTransactions = await this.hasProductTransactions(this.currentEditId);
            if (hasTransactions) {
                // Get original product data to preserve tracking constraints
                const originalProduct = this.products.find(p => p.id === this.currentEditId);
                if (originalProduct) {
                    console.log('🔒 Preserving tracking constraints due to existing transactions');
                    trackingConstraints = {
                        hasExpiryDate: originalProduct.hasExpiryDate || false,
                        forceExpiryOnInput: originalProduct.forceExpiryOnInput || false,
                        forceExpiryOnOutput: originalProduct.forceExpiryOnOutput || false,
                        hasSerialNumber: originalProduct.hasSerialNumber || false,
                        forceSerialOnInput: originalProduct.forceSerialOnInput || false,
                        forceSerialOnOutput: originalProduct.forceSerialOnOutput || false
                    };
                }
            }
        }
        
        // Get category and unit names
        const category = this.categories.find(c => c.id === categoryId);
        const unit = this.units.find(u => u.id === unitId);
        const categoryName = category ? category.name : '';
        const unitName = unit ? unit.name : '';

        const data = {
            code: document.getElementById('productCode').value.trim(),
            name: document.getElementById('productName').value.trim(),
            name2: document.getElementById('productName2').value.trim(),
            categoryId: categoryId,
            categoryName: categoryName,
            unitId: unitId,
            unitName: unitName,
            brand: document.getElementById('productBrand').value.trim(),
            barcode: document.getElementById('productBarcode').value.trim(),
            description: document.getElementById('productDescription').value.trim(),
            purchasePrice: parseFloat(document.getElementById('purchasePrice').value) || 0,
            sellingPrice: parseFloat(document.getElementById('sellingPrice').value) || 0,
            wholesalePrice: parseFloat(document.getElementById('wholesalePrice').value) || 0,
            currentStock: parseFloat(document.getElementById('currentStock').value) || 0,
            minStock: parseFloat(document.getElementById('minStock').value) || 0,
            currency: document.getElementById('productCurrency').value || 'IQD',
            status: document.getElementById('productStatus').value,
            ...trackingConstraints,
            expiryWarningDays: parseInt(document.getElementById('expiryWarningDays').value) || 30,
            notes: document.getElementById('productNotes').value.trim()
        };

        // Add image if uploaded
        if (this.currentImageData) {
            data.image = this.currentImageData;
        }

        // Add sub units data - always use current form data
        // This ensures all changes (including prices) are saved
        const currentSubUnits = this.getSubUnitsData();
        
        console.log('📝 Sub units collected from form:', currentSubUnits.length, 'units');
        console.log('📝 Sub units data:', currentSubUnits);
        
        // If editing, check if we need to preserve protected sub units
        if (this.currentEditId) {
            const originalProduct = this.products.find(p => p.id === this.currentEditId);
            const originalSubUnits = originalProduct ? originalProduct.subUnits || [] : [];
            
            // Check if any sub units have transactions
            const hasSubUnitTransactions = await this.hasSubUnitTransactions(this.currentEditId);
            
            if (hasSubUnitTransactions && originalSubUnits.length > 0) {
                console.log('🔒 Sub units have transactions, merging with price updates...');
                
                // Merge: update existing sub units with new prices, preserve structure
                const mergedSubUnits = [];
                
                // First, update existing sub units with new data (especially prices)
                for (const originalSubUnit of originalSubUnits) {
                    const currentSubUnit = currentSubUnits.find(csu => 
                        csu.unitId === originalSubUnit.unitId && 
                        csu.conversionType === originalSubUnit.conversionType &&
                        Math.abs(csu.conversionValue - originalSubUnit.conversionValue) < 0.001 // Float comparison
                    );
                    
                    if (currentSubUnit) {
                        // Update with new prices and data
                        mergedSubUnits.push({
                            ...originalSubUnit,
                            purchasePrice: currentSubUnit.purchasePrice,
                            wholesalePrice: currentSubUnit.wholesalePrice,
                            retailPrice: currentSubUnit.retailPrice,
                            unitName: currentSubUnit.unitName // Update unit name in case it changed
                        });
                        console.log('✅ Updated sub unit prices:', originalSubUnit.unitId, {
                            purchasePrice: currentSubUnit.purchasePrice,
                            wholesalePrice: currentSubUnit.wholesalePrice,
                            retailPrice: currentSubUnit.retailPrice
                        });
                    } else {
                        // Keep original if not found in current (protected)
                        mergedSubUnits.push(originalSubUnit);
                        console.log('🔒 Preserved protected sub unit:', originalSubUnit.unitId);
                    }
                }
                
                // Add new sub units that don't exist in original
                for (const currentSubUnit of currentSubUnits) {
                    const exists = originalSubUnits.some(orig => 
                        orig.unitId === currentSubUnit.unitId && 
                        orig.conversionType === currentSubUnit.conversionType &&
                        Math.abs(orig.conversionValue - currentSubUnit.conversionValue) < 0.001
                    );
                    
                    if (!exists) {
                        mergedSubUnits.push(currentSubUnit);
                        console.log('➕ Added new sub unit:', currentSubUnit.unitId);
                    }
                }
                
                data.subUnits = mergedSubUnits;
                console.log('🔒 Sub units merged (with price updates):', mergedSubUnits.length, 'total units');
            } else {
                // No transactions, use current data directly - update everything
                data.subUnits = currentSubUnits;
                console.log('✅ Sub units updated (no transactions):', currentSubUnits.length, 'units');
            }
        } else {
            // New product, use current data
            data.subUnits = currentSubUnits;
            console.log('✅ Sub units for new product:', currentSubUnits.length, 'units');
        }

        console.log('📝 Collected product data:', data);
        console.log('📝 Data categoryId:', data.categoryId);
        console.log('📝 Data unitId:', data.unitId);
        console.log('📝 Data hasExpiryDate:', data.hasExpiryDate);
        console.log('📝 Data forceExpiryOnInput:', data.forceExpiryOnInput);
        console.log('📝 Data forceExpiryOnOutput:', data.forceExpiryOnOutput);
        console.log('📝 Data hasSerialNumber:', data.hasSerialNumber);
        console.log('📝 Data forceSerialOnInput:', data.forceSerialOnInput);
        console.log('📝 Data forceSerialOnOutput:', data.forceSerialOnOutput);
        console.log('📝 Data expiryWarningDays:', data.expiryWarningDays);
        return data;
    },

    /**
     * Check product transactions details
     * فحص تفاصيل معاملات المنتج
     */
    async checkProductTransactionsDetails(productId) {
        const details = {
            hasTransactions: false,
            salesCount: 0,
            purchasesCount: 0,
            purchaseReturnsCount: 0,
            salesReturnsCount: 0,
            inventoryMovementsCount: 0,
            currentStock: 0,
            messages: []
        };

        try {
            const product = this.products.find(p => p.id === productId);
            if (product) {
                details.currentStock = product.currentStock || product.stock || 0;
            }

            // Check sales
            try {
                const salesSnapshot = await db.collection('sales')
                    .where('status', '==', 'completed')
                    .get();
                
                let salesWithProduct = 0;
                salesSnapshot.forEach(doc => {
                    const sale = doc.data();
                    if (sale.items && sale.items.some(item => item.productId === productId)) {
                        salesWithProduct++;
                    }
                });
                
                if (salesWithProduct > 0) {
                    details.hasTransactions = true;
                    details.salesCount = salesWithProduct;
                    details.messages.push(`فواتير مبيعات (${salesWithProduct})`);
                }
            } catch (error) {
                console.warn('⚠️ Error checking sales:', error);
            }

            // Check purchases
            try {
                const purchasesSnapshot = await db.collection('purchases')
                    .where('status', '==', 'completed')
                    .get();
                
                let purchasesWithProduct = 0;
                purchasesSnapshot.forEach(doc => {
                    const purchase = doc.data();
                    if (purchase.items && purchase.items.some(item => item.productId === productId)) {
                        purchasesWithProduct++;
                    }
                });
                
                if (purchasesWithProduct > 0) {
                    details.hasTransactions = true;
                    details.purchasesCount = purchasesWithProduct;
                    details.messages.push(`فواتير مشتريات (${purchasesWithProduct})`);
                }
            } catch (error) {
                console.warn('⚠️ Error checking purchases:', error);
            }

            // Check purchase returns
            try {
                const purchaseReturnsSnapshot = await db.collection('purchaseReturns')
                    .where('status', '==', 'completed')
                    .get();
                
                let returnsWithProduct = 0;
                purchaseReturnsSnapshot.forEach(doc => {
                    const returnData = doc.data();
                    if (returnData.items && returnData.items.some(item => item.productId === productId)) {
                        returnsWithProduct++;
                    }
                });
                
                if (returnsWithProduct > 0) {
                    details.hasTransactions = true;
                    details.purchaseReturnsCount = returnsWithProduct;
                    details.messages.push(`مرتجعات مشتريات (${returnsWithProduct})`);
                }
            } catch (error) {
                console.warn('⚠️ Error checking purchase returns:', error);
            }

            // Check sales returns
            try {
                const salesReturnsSnapshot = await db.collection('salesReturns')
                    .where('status', '==', 'completed')
                    .get();
                
                let returnsWithProduct = 0;
                salesReturnsSnapshot.forEach(doc => {
                    const returnData = doc.data();
                    if (returnData.items && returnData.items.some(item => item.productId === productId)) {
                        returnsWithProduct++;
                    }
                });
                
                if (returnsWithProduct > 0) {
                    details.hasTransactions = true;
                    details.salesReturnsCount = returnsWithProduct;
                    details.messages.push(`مرتجعات مبيعات (${returnsWithProduct})`);
                }
            } catch (error) {
                console.warn('⚠️ Error checking sales returns:', error);
            }

            // Check inventory movements
            try {
                const movementsSnapshot = await db.collection('inventoryMovements')
                    .where('productId', '==', productId)
                    .get();
                
                if (!movementsSnapshot.empty) {
                    details.hasTransactions = true;
                    details.inventoryMovementsCount = movementsSnapshot.size;
                    details.messages.push(`حركات مخزون (${movementsSnapshot.size})`);
                }
            } catch (error) {
                console.warn('⚠️ Error checking inventory movements:', error);
            }

            // Check stock
            if (details.currentStock > 0) {
                details.hasTransactions = true;
                details.messages.push(`مخزون متاح (${details.currentStock})`);
            }

            return details;
        } catch (error) {
            console.error('❌ Error checking product transactions details:', error);
            return details;
        }
    },

    /**
     * Delete product
     * حذف المنتج
     */
    async deleteProduct(productId) {
        try {
            console.log('🗑️ Deleting product:', productId);
            
            // Check for transactions before deletion
            const transactionDetails = await this.checkProductTransactionsDetails(productId);
            
            if (transactionDetails.hasTransactions) {
                const product = this.products.find(p => p.id === productId);
                const productName = product ? product.name : 'هذا المنتج';
                
                let message = `🚫 لا يمكن حذف المنتج "${productName}"!\n\n`;
                message += `🔒 السبب: المنتج مرتبط بالمعاملات التالية:\n\n`;
                transactionDetails.messages.forEach(msg => {
                    message += `• ${msg}\n`;
                });
                message += `\n⚠️ لحذف المنتج:\n`;
                message += `• يجب حذف جميع المعاملات المرتبطة به أولاً\n`;
                message += `• أو تعطيل المنتج بدلاً من حذفه\n`;
                
                this.showError(message);
                return;
            }
            
            // Confirm deletion
            const product = this.products.find(p => p.id === productId);
            const productName = product ? product.name : 'المنتج';
            
            if (typeof Swal !== 'undefined') {
                const result = await Swal.fire({
                    title: 'تأكيد الحذف',
                    html: `هل أنت متأكد من حذف المنتج "<strong>${productName}</strong>"؟<br><br>هذا الإجراء لا يمكن التراجع عنه.`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'نعم، احذف',
                    cancelButtonText: 'إلغاء',
                    reverseButtons: true
                });
                
                if (!result.isConfirmed) {
                    return;
                }
            }
            
            await Collections.deleteProduct(productId);
            this.showSuccess('تم حذف المنتج بنجاح');
            
            // Reload data
            await this.loadProducts();
            this.renderProductsTable();
            this.updateSummaryCards();
            
        } catch (error) {
            console.error('❌ Error deleting product:', error);
            this.showError('خطأ في حذف المنتج: ' + error.message);
        }
    },

    /**
     * Show success message
     * عرض رسالة نجاح
     */
    showSuccess(message) {
        if (typeof showSuccess === 'function') {
            showSuccess(message);
        } else {
            Swal.fire({
                title: 'نجح!',
                text: message,
                icon: 'success',
                confirmButtonText: 'موافق'
            });
        }
    },

    /**
     * Show error message
     * عرض رسالة خطأ
     */
    showError(message) {
        if (typeof showError === 'function') {
            showError(message);
        } else {
            Swal.fire({
                title: 'خطأ!',
                text: message,
                icon: 'error',
                confirmButtonText: 'موافق'
            });
        }
    },

    // ==========================================================================
    // CATEGORIES MANAGEMENT
    // إدارة الفئات
    // ==========================================================================

    /**
     * Show add category modal
     * عرض نافذة إضافة فئة
     */
    showAddCategoryModal() {
        console.log('📁 Showing add category modal...');
        
        // Reset form
        document.getElementById('categoryForm').reset();
        document.getElementById('categoryCode').value = this.generateCategoryCode();
        
        // Set modal title
        document.getElementById('categoryModalTitle').textContent = 'إضافة فئة جديدة';
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
        modal.show();
        
        // Setup icon picker after modal is shown
        setTimeout(() => {
            this.setupIconPickerListeners();
            this.setupColorPickerListener();
            // Update preview with default color
            this.updateCategoryIconPreview();
        }, 300);
    },

    /**
     * Show edit category modal
     * عرض نافذة تعديل فئة
     */
    showEditCategoryModal(categoryId) {
        console.log('✏️ Showing edit category modal for:', categoryId);
        
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) {
            this.showError('الفئة غير موجودة');
            return;
        }
        
        // Fill form
        document.getElementById('categoryName').value = category.name || '';
        document.getElementById('categoryCode').value = category.code || '';
        document.getElementById('categoryDescription').value = category.description || '';
        document.getElementById('categoryColor').value = category.color || '#3498db';
        document.getElementById('categoryIcon').value = category.icon || 'fas fa-folder';
        document.getElementById('categoryStatus').value = category.status || 'active';
        
        // Set modal title
        document.getElementById('categoryModalTitle').textContent = 'تعديل فئة';
        
        // Store current category ID
        this.currentEditCategoryId = categoryId;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
        modal.show();
        
        // Setup icon picker after modal is shown
        setTimeout(() => {
            this.setupIconPickerListeners();
            this.setupColorPickerListener();
            // Set the current icon if editing
            if (category.icon) {
                this.selectCategoryIcon(category.icon);
            }
            // Update preview with category color
            this.updateCategoryIconPreview();
        }, 300);
    },

    /**
     * Generate category code
     * توليد كود الفئة
     */
    generateCategoryCode() {
        console.log('🔢 Generating category code...');
        
        const existingCodes = this.categories.map(c => c.code).filter(code => code);
        let nextNumber = 1;
        
        while (existingCodes.includes(`CAT-${String(nextNumber).padStart(4, '0')}`)) {
            nextNumber++;
        }
        
        const categoryCode = `CAT-${String(nextNumber).padStart(4, '0')}`;
        console.log(`✅ Generated category code: ${categoryCode}`);
        return categoryCode;
    },

    /**
     * Save category
     * حفظ الفئة
     */
    async saveCategory() {
        try {
            console.log('💾 Saving category...');
            
            // Validate form
            if (!this.validateCategoryForm()) {
                return;
            }
            
            // Collect form data
            const categoryData = {
                name: document.getElementById('categoryName').value.trim(),
                code: document.getElementById('categoryCode').value.trim(),
                description: document.getElementById('categoryDescription').value.trim(),
                color: document.getElementById('categoryColor').value || '#3498db',
                icon: document.getElementById('categoryIcon').value || 'fas fa-folder',
                status: document.getElementById('categoryStatus').value,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: auth.currentUser?.uid || 'system',
                updatedBy: auth.currentUser?.uid || 'system'
            };
            
            // Show loading
            const saveBtn = document.getElementById('saveCategoryBtn');
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
            saveBtn.disabled = true;
            
            // Save category
            if (this.currentEditCategoryId) {
                await Collections.updateCategory(this.currentEditCategoryId, categoryData);
                this.showSuccess('تم تحديث الفئة بنجاح');
            } else {
                await Collections.addCategory(categoryData);
                this.showSuccess('تم إضافة الفئة بنجاح');
            }
            
            // Hide modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
            modal.hide();
            
            // Reload data
            await this.loadCategories();
            this.renderCategoriesTable();
            this.updateSummaryCards();
            
        } catch (error) {
            console.error('❌ Error saving category:', error);
            this.showError('خطأ في حفظ الفئة: ' + error.message);
        } finally {
            // Reset button
            const saveBtn = document.getElementById('saveCategoryBtn');
            saveBtn.innerHTML = '<i class="fas fa-save"></i> حفظ';
            saveBtn.disabled = false;
        }
    },

    /**
     * Validate category form
     * التحقق من صحة نموذج الفئة
     */
    validateCategoryForm() {
        const name = document.getElementById('categoryName').value.trim();
        const code = document.getElementById('categoryCode').value.trim();
        
        if (!name) {
            this.showError('اسم الفئة مطلوب');
            document.getElementById('categoryName').focus();
            return false;
        }
        
        if (!code) {
            this.showError('كود الفئة مطلوب');
            document.getElementById('categoryCode').focus();
            return false;
        }
        
        // Check for duplicate code
        const existingCategory = this.categories.find(c => 
            c.code === code && c.id !== this.currentEditCategoryId
        );
        
        if (existingCategory) {
            this.showError('كود الفئة موجود مسبقاً');
            document.getElementById('categoryCode').focus();
            return false;
        }
        
        // Check for duplicate name
        const existingCategoryName = this.categories.find(c => 
            c.name === name && c.id !== this.currentEditCategoryId
        );
        
        if (existingCategoryName) {
            this.showError('اسم الفئة موجود مسبقاً');
            document.getElementById('categoryName').focus();
            return false;
        }
        
        return true;
    },

    // ==========================================================================
    // UNITS MANAGEMENT
    // إدارة الوحدات
    // ==========================================================================

    /**
     * Show add unit modal
     * عرض نافذة إضافة وحدة
     */
    showAddUnitModal() {
        console.log('📏 Showing add unit modal...');
        
        // Reset form
        document.getElementById('unitForm').reset();
        document.getElementById('unitCode').value = this.generateUnitCode();
        
        // Set modal title
        document.getElementById('unitModalTitle').textContent = 'إضافة وحدة جديدة';
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('unitModal'));
        modal.show();
    },

    /**
     * Show edit unit modal
     * عرض نافذة تعديل وحدة
     */
    showEditUnitModal(unitId) {
        console.log('✏️ Showing edit unit modal for:', unitId);
        
        const unit = this.units.find(u => u.id === unitId);
        if (!unit) {
            this.showError('الوحدة غير موجودة');
            return;
        }
        
        // Fill form
        document.getElementById('unitName').value = unit.name || '';
        document.getElementById('unitCode').value = unit.code || '';
        document.getElementById('unitSymbol').value = unit.symbol || '';
        document.getElementById('unitDescription').value = unit.description || '';
        document.getElementById('unitStatus').value = unit.status || 'active';
        
        // Set modal title
        document.getElementById('unitModalTitle').textContent = 'تعديل وحدة';
        
        // Store current unit ID
        this.currentEditUnitId = unitId;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('unitModal'));
        modal.show();
    },

    /**
     * Generate unit code
     * توليد كود الوحدة
     */
    generateUnitCode() {
        console.log('🔢 Generating unit code...');
        
        const existingCodes = this.units.map(u => u.code).filter(code => code);
        let nextNumber = 1;
        
        while (existingCodes.includes(`UNT-${String(nextNumber).padStart(4, '0')}`)) {
            nextNumber++;
        }
        
        const unitCode = `UNT-${String(nextNumber).padStart(4, '0')}`;
        console.log(`✅ Generated unit code: ${unitCode}`);
        return unitCode;
    },

    /**
     * Save unit
     * حفظ الوحدة
     */
    async saveUnit() {
        try {
            console.log('💾 Saving unit...');
            
            // Validate form
            if (!this.validateUnitForm()) {
                return;
            }
            
            // Collect form data
            const unitData = {
                name: document.getElementById('unitName').value.trim(),
                code: document.getElementById('unitCode').value.trim(),
                symbol: document.getElementById('unitSymbol').value.trim(),
                description: document.getElementById('unitDescription').value.trim(),
                status: document.getElementById('unitStatus').value,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: auth.currentUser?.uid || 'system',
                updatedBy: auth.currentUser?.uid || 'system'
            };
            
            // Show loading
            const saveBtn = document.getElementById('saveUnitBtn');
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
            saveBtn.disabled = true;
            
            // Save unit
            if (this.currentEditUnitId) {
                await Collections.updateUnit(this.currentEditUnitId, unitData);
                this.showSuccess('تم تحديث الوحدة بنجاح');
            } else {
                await Collections.addUnit(unitData);
                this.showSuccess('تم إضافة الوحدة بنجاح');
            }
            
            // Hide modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('unitModal'));
            modal.hide();
            
            // Reload data
            await this.loadUnits();
            this.renderUnitsTable();
            this.updateSummaryCards();
            
        } catch (error) {
            console.error('❌ Error saving unit:', error);
            this.showError('خطأ في حفظ الوحدة: ' + error.message);
        } finally {
            // Reset button
            const saveBtn = document.getElementById('saveUnitBtn');
            saveBtn.innerHTML = '<i class="fas fa-save"></i> حفظ';
            saveBtn.disabled = false;
        }
    },

    /**
     * Validate unit form
     * التحقق من صحة نموذج الوحدة
     */
    validateUnitForm() {
        const name = document.getElementById('unitName').value.trim();
        const code = document.getElementById('unitCode').value.trim();
        const symbol = document.getElementById('unitSymbol').value.trim();
        
        if (!name) {
            this.showError('اسم الوحدة مطلوب');
            document.getElementById('unitName').focus();
            return false;
        }
        
        if (!code) {
            this.showError('كود الوحدة مطلوب');
            document.getElementById('unitCode').focus();
            return false;
        }
        
        if (!symbol) {
            this.showError('رمز الوحدة مطلوب');
            document.getElementById('unitSymbol').focus();
            return false;
        }
        
        // Check for duplicate code
        const existingUnit = this.units.find(u => 
            u.code === code && u.id !== this.currentEditUnitId
        );
        
        if (existingUnit) {
            this.showError('كود الوحدة موجود مسبقاً');
            document.getElementById('unitCode').focus();
            return false;
        }
        
        // Check for duplicate name
        const existingUnitName = this.units.find(u => 
            u.name === name && u.id !== this.currentEditUnitId
        );
        
        if (existingUnitName) {
            this.showError('اسم الوحدة موجود مسبقاً');
            document.getElementById('unitName').focus();
            return false;
        }
        
        // Check for duplicate symbol
        const existingUnitSymbol = this.units.find(u => 
            u.symbol === symbol && u.id !== this.currentEditUnitId
        );
        
        if (existingUnitSymbol) {
            this.showError('رمز الوحدة موجود مسبقاً');
            document.getElementById('unitSymbol').focus();
            return false;
        }
        
        return true;
    },

    /**
     * Recode all items (products, categories, units)
     * إعادة ترميز جميع العناصر
     */
    async recodeAll() {
        try {
            console.log('🔄 Starting recode process...');
            
            const confirmed = confirm('هل أنت متأكد من إعادة ترميز جميع العناصر؟\nسيتم إعادة ترقيم جميع الأكواد.');
            
            if (!confirmed) {
                return;
            }
            
            // Show loading
            this.showInfo('جاري إعادة الترميز...');
            
            // Recode categories
            await this.recodeCategories();
            
            // Recode units
            await this.recodeUnits();
            
            // Recode products
            await this.recodeProducts();
            
            // Reload all data
            await this.loadData();
            this.renderAllTables();
            this.updateSummaryCards();
            
            this.showSuccess('تم إعادة الترميز بنجاح');
            
        } catch (error) {
            console.error('❌ Error during recode:', error);
            this.showError('خطأ في إعادة الترميز: ' + error.message);
        }
    },

    /**
     * Recode categories
     * إعادة ترميز الفئات
     */
    async recodeCategories() {
        console.log('🔄 Recoding categories...');
        
        for (let i = 0; i < this.categories.length; i++) {
            const category = this.categories[i];
            const newCode = `CAT-${String(i + 1).padStart(4, '0')}`;
            
            if (category.code !== newCode) {
                await Collections.updateCategory(category.id, { code: newCode });
                console.log(`✅ Updated category ${category.name}: ${category.code} → ${newCode}`);
            }
        }
    },

    /**
     * Recode units
     * إعادة ترميز الوحدات
     */
    async recodeUnits() {
        console.log('🔄 Recoding units...');
        
        for (let i = 0; i < this.units.length; i++) {
            const unit = this.units[i];
            const newCode = `UNT-${String(i + 1).padStart(4, '0')}`;
            
            if (unit.code !== newCode) {
                await Collections.updateUnit(unit.id, { code: newCode });
                console.log(`✅ Updated unit ${unit.name}: ${unit.code} → ${newCode}`);
            }
        }
    },

    /**
     * Recode products
     * إعادة ترميز المنتجات
     */
    async recodeProducts() {
        console.log('🔄 Recoding products...');
        
        // Group products by category
        const productsByCategory = {};
        this.products.forEach(product => {
            const categoryCode = product.categoryId ? 
                this.categories.find(c => c.id === product.categoryId)?.code || 'PRD' : 
                'PRD';
            
            if (!productsByCategory[categoryCode]) {
                productsByCategory[categoryCode] = [];
            }
            productsByCategory[categoryCode].push(product);
        });
        
        // Recode products in each category
        for (const [categoryCode, products] of Object.entries(productsByCategory)) {
            for (let i = 0; i < products.length; i++) {
                const product = products[i];
                const newCode = `${categoryCode}-${String(i + 1).padStart(4, '0')}`;
                
                if (product.code !== newCode) {
                    await Collections.updateProduct(product.id, { code: newCode });
                    console.log(`✅ Updated product ${product.name}: ${product.code} → ${newCode}`);
                }
            }
        }
    },

    /**
     * Show delete category confirmation
     * عرض تأكيد حذف الفئة
     */
    async showDeleteCategoryConfirmation(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) {
            this.showError('الفئة غير موجودة');
            return;
        }
        
        // Check if category has products
        const productsCount = this.products.filter(p => p.categoryId === categoryId).length;
        if (productsCount > 0) {
            this.showError(`لا يمكن حذف الفئة "${category.name}" لأنها تحتوي على ${productsCount} منتج`);
            return;
        }
        
        const result = await Swal.fire({
            title: 'تأكيد الحذف',
            text: `هل أنت متأكد من حذف الفئة "${category.name}"؟`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d'
        });
        
        if (result.isConfirmed) {
            await this.deleteCategory(categoryId);
        }
    },

    /**
     * Delete category
     * حذف الفئة
     */
    async deleteCategory(categoryId) {
        try {
            console.log('🗑️ Deleting category:', categoryId);
            
            await Collections.deleteCategory(categoryId);
            this.showSuccess('تم حذف الفئة بنجاح');
            
            // Reload data
            await this.loadCategories();
            this.renderCategoriesTable();
            this.updateSummaryCards();
            
        } catch (error) {
            console.error('❌ Error deleting category:', error);
            this.showError('خطأ في حذف الفئة: ' + error.message);
        }
    },

    /**
     * Show delete unit confirmation
     * عرض تأكيد حذف الوحدة
     */
    async showDeleteUnitConfirmation(unitId) {
        const unit = this.units.find(u => u.id === unitId);
        if (!unit) {
            this.showError('الوحدة غير موجودة');
            return;
        }
        
        // Check if unit has products
        const productsCount = this.products.filter(p => p.unitId === unitId).length;
        if (productsCount > 0) {
            this.showError(`لا يمكن حذف الوحدة "${unit.name}" لأنها مستخدمة في ${productsCount} منتج`);
            return;
        }
        
        const result = await Swal.fire({
            title: 'تأكيد الحذف',
            text: `هل أنت متأكد من حذف الوحدة "${unit.name}"؟`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d'
        });
        
        if (result.isConfirmed) {
            await this.deleteUnit(unitId);
        }
    },

    /**
     * Delete unit
     * حذف الوحدة
     */
    async deleteUnit(unitId) {
        try {
            console.log('🗑️ Deleting unit:', unitId);
            
            await Collections.deleteUnit(unitId);
            this.showSuccess('تم حذف الوحدة بنجاح');
            
            // Reload data
            await this.loadUnits();
            this.renderUnitsTable();
            this.updateSummaryCards();
            
        } catch (error) {
            console.error('❌ Error deleting unit:', error);
            this.showError('خطأ في حذف الوحدة: ' + error.message);
        }
    },



    /**
     * Filter categories based on search and status
     */
    filterCategories() {
        const searchTerm = document.getElementById('categorySearch')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('categoryStatusFilter')?.value || '';
        
        // Store original categories if not already stored
        if (!this.originalCategories) {
            this.originalCategories = [...this.categories];
        }
        
        let filteredCategories = this.originalCategories.filter(category => {
            const matchesSearch = !searchTerm || 
                category.name?.toLowerCase().includes(searchTerm) ||
                category.description?.toLowerCase().includes(searchTerm) ||
                category.code?.toLowerCase().includes(searchTerm);
            
            const matchesStatus = !statusFilter || category.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });

        // Update display with filtered categories
        this.categories = filteredCategories;
        this.renderCategoriesTable();
        this.updateCategoriesStats();
    },

    /**
     * Sort categories
     */
    sortCategories() {
        const sortBy = document.getElementById('categorySortBy')?.value || 'name';
        
        this.categories.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                case 'products':
                    const aCount = this.products.filter(p => p.categoryId === a.id).length;
                    const bCount = this.products.filter(p => p.categoryId === b.id).length;
                    return bCount - aCount;
                case 'created':
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                default:
                    return 0;
            }
        });

        this.renderCategoriesTable();
    },

    /**
     * Clear category filters
     */
    clearCategoryFilters() {
        document.getElementById('categorySearch').value = '';
        document.getElementById('categoryStatusFilter').value = '';
        document.getElementById('categorySortBy').value = 'name';
        
        // Restore original categories
        if (this.originalCategories) {
            this.categories = [...this.originalCategories];
        }
        
        this.renderCategoriesTable();
        this.updateCategoriesStats();
    },

    /**
     * Update categories statistics
     */
    updateCategoriesStats() {
        const totalCategories = this.categories.length;
        const activeCategories = this.categories.filter(c => c.status === 'active' || !c.status).length;
        const totalProducts = this.categories.reduce((sum, category) => {
            return sum + this.products.filter(p => p.categoryId === category.id).length;
        }, 0);

        const totalCategoriesEl = document.getElementById('totalCategoriesCount');
        if (totalCategoriesEl) totalCategoriesEl.textContent = totalCategories;
        
        const activeCategoriesEl = document.getElementById('activeCategoriesCount');
        if (activeCategoriesEl) activeCategoriesEl.textContent = activeCategories;
        
        const totalProductsEl = document.getElementById('totalProductsInCategories');
        if (totalProductsEl) totalProductsEl.textContent = totalProducts;
    },

    /**
     * Export categories to CSV
     */
    exportCategories() {
        try {
            if (this.categories.length === 0) {
                this.showError('لا توجد فئات للتصدير');
                return;
            }

            // Prepare CSV data
            const headers = ['اسم الفئة', 'الكود', 'الوصف', 'اللون', 'الأيقونة', 'عدد المنتجات', 'الحالة'];

            const csvData = this.categories.map(category => {
                const productsCount = this.products.filter(p => p.categoryId === category.id).length;
                return [
                    category.name || '',
                    category.code || '',
                    category.description || '',
                    category.color || '',
                    category.icon || '',
                    productsCount,
                    (category.status || 'active') === 'active' ? 'نشط' : 'غير نشط'
                ];
            });

            // Create CSV content
            const csvContent = [headers, ...csvData]
                .map(row => row.map(field => `"${field}"`).join(','))
                .join('\n');

            // Download CSV
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `categories_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showSuccess('تم تصدير الفئات بنجاح');
        } catch (error) {
            console.error('❌ Error exporting categories:', error);
            this.showError('خطأ في تصدير الفئات: ' + error.message);
        }
    },


    /**
     * Toggle unit view between grid and table
     */

    /**
     * Filter units based on search and status
     */
    filterUnits() {
        const searchTerm = document.getElementById('unitSearch')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('unitStatusFilter')?.value || '';
        
        // Store original units if not already stored
        if (!this.originalUnits) {
            this.originalUnits = [...this.units];
        }
        
        let filteredUnits = this.originalUnits.filter(unit => {
            const matchesSearch = !searchTerm || 
                unit.name?.toLowerCase().includes(searchTerm) ||
                unit.description?.toLowerCase().includes(searchTerm) ||
                unit.code?.toLowerCase().includes(searchTerm);
            
            const matchesStatus = !statusFilter || unit.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });

        // Update display with filtered units
        this.units = filteredUnits;
        this.renderUnitsTable();
        this.updateUnitsStats();
    },

    /**
     * Sort units
     */
    sortUnits() {
        const sortBy = document.getElementById('unitSortBy')?.value || 'name';
        
        this.units.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                case 'products':
                    const aCount = this.products.filter(p => p.unitId === a.id).length;
                    const bCount = this.products.filter(p => p.unitId === b.id).length;
                    return bCount - aCount;
                case 'created':
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                default:
                    return 0;
            }
        });

        this.renderUnitsTable();
    },

    /**
     * Clear unit filters
     */
    clearUnitFilters() {
        document.getElementById('unitSearch').value = '';
        document.getElementById('unitStatusFilter').value = '';
        document.getElementById('unitSortBy').value = 'name';
        
        // Restore original units
        if (this.originalUnits) {
            this.units = [...this.originalUnits];
        }
        
        this.renderUnitsTable();
        this.updateUnitsStats();
    },

    /**
     * Update units statistics
     */
    updateUnitsStats() {
        // Initialize arrays if not defined
        if (!this.units) this.units = [];
        if (!this.products) this.products = [];
        
        const totalUnits = this.units.length;
        const activeUnits = this.units.filter(u => u.status === 'active' || !u.status).length;
        const totalProducts = this.units.reduce((sum, unit) => {
            return sum + this.products.filter(p => p.unitId === unit.id).length;
        }, 0);

        // Safely update units statistics
        if (window.DOMUtils) {
            const updates = {
                'totalUnitsCount': totalUnits.toString(),
                'activeUnitsCount': activeUnits.toString(),
                'totalProductsInUnits': totalProducts.toString(),
                'unitsCount': totalUnits.toString()
            };
            
            const results = window.DOMUtils.batchUpdateText(updates);
            console.log('📊 Units stats updated:', results);
        } else {
            // Fallback with safety checks
            const totalUnitsCountEl = document.getElementById('totalUnitsCount');
            const activeUnitsCountEl = document.getElementById('activeUnitsCount');
            const totalProductsInUnitsEl = document.getElementById('totalProductsInUnits');
            const unitsCountEl = document.getElementById('unitsCount');
            
            if (totalUnitsCountEl) totalUnitsCountEl.textContent = totalUnits;
            if (activeUnitsCountEl) activeUnitsCountEl.textContent = activeUnits;
            if (totalProductsInUnitsEl) totalProductsInUnitsEl.textContent = totalProducts;
            if (unitsCountEl) unitsCountEl.textContent = totalUnits;
        }
    },

    /**
     * Export units to CSV
     */
    exportUnits() {
        try {
            if (this.units.length === 0) {
                this.showError('لا توجد وحدات للتصدير');
                return;
            }

            // Prepare CSV data
            const headers = ['اسم الوحدة', 'الكود', 'الوصف', 'عدد المنتجات', 'الحالة'];

            const csvData = this.units.map(unit => {
                const productsCount = this.products.filter(p => p.unitId === unit.id).length;
                return [
                    unit.name || '',
                    unit.code || '',
                    unit.description || '',
                    productsCount,
                    (unit.status || 'active') === 'active' ? 'نشط' : 'غير نشط'
                ];
            });

            // Create CSV content
            const csvContent = [headers, ...csvData]
                .map(row => row.map(field => `"${field}"`).join(','))
                .join('\n');

            // Download CSV
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `units_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showSuccess('تم تصدير الوحدات بنجاح');
        } catch (error) {
            console.error('❌ Error exporting units:', error);
            this.showError('خطأ في تصدير الوحدات: ' + error.message);
        }
    },

    /**
     * Filter categories
     */
    filterCategories() {
        const searchTerm = document.getElementById('categorySearch')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('categoryStatusFilter')?.value || '';
        
        // Store original categories if not already stored
        if (!this.originalCategories) {
            this.originalCategories = [...this.categories];
        }
        
        const filteredCategories = this.originalCategories.filter(category => {
            const matchesSearch = !searchTerm || 
                category.name?.toLowerCase().includes(searchTerm) ||
                category.description?.toLowerCase().includes(searchTerm);
            
            const matchesStatus = !statusFilter || category.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });

        // Update display with filtered categories
        this.categories = filteredCategories;
        this.renderCategoriesTable();
        this.updateCategoriesStats();
    },

    /**
     * Sort categories
     */
    sortCategories() {
        const sortBy = document.getElementById('categorySortBy')?.value || 'name';
        
        this.categories.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                case 'products':
                    const aCount = this.products.filter(p => p.categoryId === a.id).length;
                    const bCount = this.products.filter(p => p.categoryId === b.id).length;
                    return bCount - aCount;
                case 'created':
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
                default:
                    return 0;
            }
        });

        this.renderCategoriesTable();
    },

    /**
     * Clear category filters
     */
    clearCategoryFilters() {
        document.getElementById('categorySearch').value = '';
        document.getElementById('categoryStatusFilter').value = '';
        document.getElementById('categorySortBy').value = 'name';
        
        // Restore original categories
        if (this.originalCategories) {
            this.categories = [...this.originalCategories];
        }
        
        this.renderCategoriesTable();
        this.updateCategoriesStats();
    },

    /**
     * Update categories statistics
     */
    updateCategoriesStats() {
        const totalCategories = this.categories.length;
        const activeCategories = this.categories.filter(c => c.status === 'active' || !c.status).length;
        const totalProducts = this.categories.reduce((sum, category) => {
            return sum + this.products.filter(p => p.categoryId === category.id).length;
        }, 0);

        const totalCategoriesEl = document.getElementById('totalCategoriesCount');
        if (totalCategoriesEl) totalCategoriesEl.textContent = totalCategories;
        
        const activeCategoriesEl = document.getElementById('activeCategoriesCount');
        if (activeCategoriesEl) activeCategoriesEl.textContent = activeCategories;
        
        const totalProductsEl = document.getElementById('totalProductsInCategories');
        if (totalProductsEl) totalProductsEl.textContent = totalProducts;
    },





    /**
     * Enhanced image upload with multiple storage options
     */
    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showError('يرجى اختيار ملف صورة صالح (JPG, PNG, GIF)');
            return;
        }

        // Validate file size (max 2MB for better performance)
        if (file.size > 2 * 1024 * 1024) {
            this.showError('حجم الصورة يجب أن يكون أقل من 2 ميجابايت');
            return;
        }

        try {
            // Show loading
            const preview = document.getElementById('imagePreview');
            if (preview) {
                preview.innerHTML = '<div class="spinner-border" role="status"><span class="visually-hidden">جاري معالجة الصورة...</span></div>';
            }

            // Try multiple upload services
            let imageUrl = await this.uploadToCloudinary(file);
            
            if (!imageUrl) {
                imageUrl = await this.uploadToImgBB(file);
            }
            
            if (!imageUrl) {
                // Fallback to compressed base64
                const compressedImage = await this.compressImage(file, 400, 0.6);
                imageUrl = await this.convertToBase64(compressedImage);
            }
            
            // Show preview
            if (preview) {
                preview.innerHTML = `
                    <img src="${imageUrl}" class="img-thumbnail" style="max-width: 200px; max-height: 200px;">
                    <div class="mt-2">
                        <button type="button" class="btn btn-sm btn-danger" onclick="ProductsModule.removeImage()">
                            <i class="fas fa-trash"></i> حذف الصورة
                        </button>
                    </div>
                `;
            }
            
            // Store image data
            this.currentImageData = imageUrl;

        } catch (error) {
            console.error('Error processing image:', error);
            this.showError('خطأ في معالجة الصورة: ' + error.message);
        }
    },

    /**
     * Upload image to Cloudinary (free tier)
     */
    async uploadToCloudinary(file) {
        try {
            // Check if Cloudinary is configured
            if (typeof ImageStorageConfig === 'undefined' || !ImageStorageConfig.cloudinary.enabled) {
                console.log('Cloudinary not enabled, using base64 fallback');
                return null;
            }

            const config = ImageStorageConfig.getCloudinaryConfig();
            
            if (!config.cloudName || config.cloudName === 'your-cloud-name') {
                console.log('Cloudinary not configured, using base64 fallback');
                return null;
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', config.uploadPreset);
            formData.append('folder', config.folder);

            const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Image uploaded to Cloudinary:', data.secure_url);
                return data.secure_url;
            } else {
                console.log('❌ Cloudinary upload failed, using base64 fallback');
                return null;
            }
        } catch (error) {
            console.log('❌ Cloudinary error, using base64 fallback:', error);
            return null;
        }
    },

    /**
     * Upload image to ImgBB (completely free)
     */
    async uploadToImgBB(file) {
        try {
            // Check if ImgBB is configured
            if (typeof ImageStorageConfig === 'undefined' || !ImageStorageConfig.imgbb.enabled) {
                console.log('ImgBB not enabled, using base64 fallback');
                return null;
            }

            const config = ImageStorageConfig.getImgBBConfig();
            
            if (!config.apiKey || config.apiKey === 'your-imgbb-api-key') {
                console.log('ImgBB not configured, using base64 fallback');
                return null;
            }

            const formData = new FormData();
            formData.append('image', file);
            formData.append('key', config.apiKey);

            const response = await fetch('https://api.imgbb.com/1/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    console.log('✅ Image uploaded to ImgBB:', data.data.url);
                    return data.data.url;
                }
            }
            
            console.log('❌ ImgBB upload failed, using base64 fallback');
            return null;
        } catch (error) {
            console.log('❌ ImgBB error, using base64 fallback:', error);
            return null;
        }
    },

    /**
     * Convert file to base64
     */
    async convertToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    /**
     * Compress image to reduce file size
     */
    async compressImage(file, maxWidth = 800, quality = 0.8) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions
                let { width, height } = img;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(resolve, file.type, quality);
            };

            img.src = URL.createObjectURL(file);
        });
    },

    /**
     * Remove uploaded image
     */
    removeImage() {
        const preview = document.getElementById('imagePreview');
        const input = document.getElementById('productImage');
        
        if (preview) {
            preview.innerHTML = '<p class="text-muted">لم يتم اختيار صورة</p>';
        }
        
        if (input) {
            input.value = '';
        }
        
        this.currentImageData = null;
    },



    /**
     * Enhanced export with multiple formats
     */
    exportProducts(format = 'csv') {
        try {
            const productsToExport = this.filteredProducts.length > 0 ? this.filteredProducts : this.products;
            
            if (productsToExport.length === 0) {
                this.showError('لا توجد منتجات للتصدير');
                return;
            }

            if (format === 'csv') {
                this.exportProductsToCSV(productsToExport);
            } else if (format === 'excel') {
                this.exportProductsToExcel(productsToExport);
            } else if (format === 'json') {
                this.exportProductsToJSON(productsToExport);
            }

        } catch (error) {
            console.error('❌ Error exporting products:', error);
            this.showError('خطأ في تصدير المنتجات: ' + error.message);
        }
    },

    /**
     * Export products to Excel format
     */
    exportProductsToExcel(products) {
        // Create Excel-like CSV with BOM for Arabic support
        const headers = [
            'كود المنتج', 'اسم المنتج', 'الاسم الثاني', 'الفئة', 'الوحدة', 
            'الوصف', 'الباركود', 'العلامة التجارية', 'سعر الشراء', 
            'سعر البيع', 'سعر الجملة', 'المخزون الحالي', 'الحد الأدنى', 
            'العملة', 'تاريخ الانتهاء', 'رقم تسلسلي', 'الحالة', 'الملاحظات'
        ];

        const excelData = products.map(product => {
            const category = this.categories.find(c => c.id === product.categoryId);
            const unit = this.units.find(u => u.id === product.unitId);
            
            return [
                product.code || '',
                product.name || '',
                product.name2 || '',
                category?.name || '',
                unit?.name || '',
                product.description || '',
                product.barcode || '',
                product.brand || '',
                product.purchasePrice || 0,
                product.sellingPrice || 0,
                product.wholesalePrice || 0,
                product.currentStock || 0,
                product.minStock || 0,
                product.currency || 'IQD',
                product.hasExpiryDate ? 'نعم' : 'لا',
                product.hasSerialNumber ? 'نعم' : 'لا',
                (product.status || 'active') === 'active' ? 'نشط' : 'غير نشط',
                product.notes || ''
            ];
        });

        // Create Excel content with BOM
        const excelContent = [headers, ...excelData]
            .map(row => row.map(field => `"${field}"`).join('\t'))
            .join('\n');

        const blob = new Blob(['\ufeff' + excelContent], { 
            type: 'application/vnd.ms-excel;charset=utf-8;' 
        });
        
        this.downloadFile(blob, `products_${new Date().toISOString().split('T')[0]}.xls`);
        this.showSuccess('تم تصدير المنتجات إلى Excel بنجاح');
    },

    /**
     * Export products to JSON format
     */
    exportProductsToJSON(products) {
        const jsonData = {
            exportDate: new Date().toISOString(),
            totalProducts: products.length,
            products: products.map(product => ({
                ...product,
                categoryName: this.categories.find(c => c.id === product.categoryId)?.name || '',
                unitName: this.units.find(u => u.id === product.unitId)?.name || ''
            }))
        };

        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { 
            type: 'application/json;charset=utf-8;' 
        });
        
        this.downloadFile(blob, `products_${new Date().toISOString().split('T')[0]}.json`);
        this.showSuccess('تم تصدير المنتجات إلى JSON بنجاح');
    },

    /**
     * Download file helper
     */
    downloadFile(blob, filename) {
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    /**
     * Backup all products data
     */
    async backupProductsData() {
        try {
            const backupData = {
                timestamp: new Date().toISOString(),
                products: this.products,
                categories: this.categories,
                units: this.units,
                currencies: this.currencies
            };

            const blob = new Blob([JSON.stringify(backupData, null, 2)], { 
                type: 'application/json;charset=utf-8;' 
            });
            
            this.downloadFile(blob, `products_backup_${new Date().toISOString().split('T')[0]}.json`);
            this.showSuccess('تم إنشاء نسخة احتياطية بنجاح');
            
        } catch (error) {
            console.error('❌ Error creating backup:', error);
            this.showError('خطأ في إنشاء النسخة الاحتياطية: ' + error.message);
        }
    },

    /**
     * Restore products data from backup
     */
    async restoreProductsData(file) {
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const backupData = JSON.parse(e.target.result);
                    
                    // Validate backup data
                    if (!backupData.products || !Array.isArray(backupData.products)) {
                        throw new Error('ملف النسخة الاحتياطية غير صالح');
                    }

                    // Show confirmation
                    const result = await Swal.fire({
                        title: 'تأكيد الاستعادة',
                        text: `سيتم استعادة ${backupData.products.length} منتج. هل أنت متأكد؟`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonText: 'نعم، استعد',
                        cancelButtonText: 'إلغاء',
                        confirmButtonColor: '#dc3545',
                        cancelButtonColor: '#6c757d'
                    });

                    if (result.isConfirmed) {
                        // Restore data
                        this.products = backupData.products || [];
                        this.categories = backupData.categories || [];
                        this.units = backupData.units || [];
                        this.currencies = backupData.currencies || [];

                        // Refresh display
                        this.renderAllTables();
                        this.updateSummaryCards();
                        
                        this.showSuccess('تم استعادة البيانات بنجاح');
                    }
                    
                } catch (error) {
                    console.error('❌ Error parsing backup:', error);
                    this.showError('خطأ في قراءة ملف النسخة الاحتياطية: ' + error.message);
                }
            };
            
            reader.readAsText(file);
            
        } catch (error) {
            console.error('❌ Error restoring backup:', error);
            this.showError('خطأ في استعادة النسخة الاحتياطية: ' + error.message);
        }
    },

    // ========== CORE FUNCTIONS (Enhanced and Integrated) ==========
    
    /**
     * Core product loading function (enhanced version)
     * دالة تحميل المنتجات الأساسية (نسخة محسنة)
     */
    async loadProductsCore() {
        try {
            console.log('🔄 Core: Loading products from database...');
            const snapshot = await db.collection('products').get();
            this.products = [];
            snapshot.forEach(doc => {
                this.products.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            this.filteredProducts = [...this.products];
            console.log(`✅ Core: Loaded ${this.products.length} products`);
        } catch (error) {
            console.error('❌ Core: Error loading products:', error);
            this.products = [];
            this.filteredProducts = [];
        }
    },

    /**
     * Core filtering function (enhanced version)
     * دالة التصفية الأساسية (نسخة محسنة)
     */
    filterProductsCore() {
        const searchTerm = document.getElementById('productSearch')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        const statusFilter = document.getElementById('statusFilter')?.value || '';
        
        this.filteredProducts = this.products.filter(product => {
            const matchesSearch = !searchTerm || 
                (product.name && product.name.toLowerCase().includes(searchTerm)) ||
                (product.code && product.code.toLowerCase().includes(searchTerm)) ||
                (product.brand && product.brand.toLowerCase().includes(searchTerm));
            
            const matchesCategory = !categoryFilter || product.categoryId === categoryFilter;
            const matchesStatus = !statusFilter || product.status === statusFilter;
            
            return matchesSearch && matchesCategory && matchesStatus;
        });
        
        this.renderProductsTable();
        this.updateSummaryCards();
    },

    /**
     * Core summary update function (enhanced version)
     * دالة تحديث الملخص الأساسية (نسخة محسنة)
     */
    updateProductsSummaryCore() {
        const totalProducts = this.products.length;
        const activeProducts = this.products.filter(p => p.status === 'active' || !p.status).length;
        const lowStockProducts = this.products.filter(p => {
            const stock = p.currentStock || p.stock || 0;
            const minStock = p.minStock || 0;
            return stock <= minStock;
        }).length;

        // Update summary elements if they exist
        const productsCountEl = document.getElementById('productsCount');
        const totalProductsEl = document.getElementById('totalProducts');
        const activeProductsEl = document.getElementById('activeProducts');
        const lowStockProductsEl = document.getElementById('lowStockProducts');
        
        if (productsCountEl) productsCountEl.textContent = totalProducts;
        if (totalProductsEl) totalProductsEl.textContent = totalProducts;
        if (activeProductsEl) activeProductsEl.textContent = activeProducts;
        if (lowStockProductsEl) lowStockProductsEl.textContent = lowStockProducts;
        
        const summary = document.getElementById('productsSummary');
        if (summary) {
            const filteredCount = this.filteredProducts ? this.filteredProducts.length : totalProducts;
            summary.textContent = `عرض ${filteredCount} من ${totalProducts} منتج`;
        }
    },

    /**
     * Core product code generation (enhanced version)
     * توليد كود المنتج الأساسي (نسخة محسنة)
     */
    generateProductCodeCore() {
        console.log('🔢 Core: Generating product code...');
        
        const categorySelect = document.getElementById('productCategory');
        const codeInput = document.getElementById('productCode');
        
        if (!codeInput) {
            console.warn('⚠️ Core: Product code input not found');
            return;
        }
        
        if (!categorySelect) {
            console.warn('⚠️ Core: Category select not found');
            return;
        }
        
        const categoryId = categorySelect.value;
        if (categoryId) {
            // Generate code based on category
            const category = this.categories?.find(c => c.id === categoryId);
            if (category) {
                const nextNumber = this.getNextProductNumberCore(category.code);
                codeInput.value = `${category.code}-${String(nextNumber).padStart(4, '0')}`;
                console.log('✅ Core: Generated category-based product code:', codeInput.value);
            }
        } else {
            // Generate default code
            const nextNumber = this.getNextProductNumberCore('PRD');
            codeInput.value = `PRD-${String(nextNumber).padStart(4, '0')}`;
            console.log('✅ Core: Generated default product code:', codeInput.value);
        }
    },

    /**
     * Get next product number (core version)
     * الحصول على رقم المنتج التالي (نسخة أساسية)
     */
    getNextProductNumberCore(categoryCode) {
        const productsWithSameCategory = this.products.filter(p => {
            if (!p.code) return false;
            return p.code.startsWith(categoryCode);
        });
        
        let maxNumber = 0;
        productsWithSameCategory.forEach(product => {
            const match = product.code.match(new RegExp(`${categoryCode}-(\\d+)`));
            if (match) {
                const number = parseInt(match[1]);
                if (number > maxNumber) {
                    maxNumber = number;
                }
            }
        });
        
        return maxNumber + 1;
    },

    /**
     * Core validation function (enhanced version)
     * دالة التحقق الأساسية (نسخة محسنة)
     */
    validateProductFormCore() {
        const requiredFields = [
            { id: 'productCode', name: 'كود المنتج' },
            { id: 'productName', name: 'اسم المنتج' },
            { id: 'productCategory', name: 'الفئة' },
            { id: 'productUnit', name: 'الوحدة' },
            { id: 'purchasePrice', name: 'سعر الشراء' },
            { id: 'sellingPrice', name: 'سعر البيع' }
        ];
        
        for (const field of requiredFields) {
            const element = document.getElementById(field.id);
            if (!element || !element.value.trim()) {
                this.showError(`حقل ${field.name} مطلوب`);
                if (element) element.focus();
                return false;
            }
        }

        // Check for duplicate code
        const code = document.getElementById('productCode').value.trim();
        const existingProduct = this.products.find(p =>
            p.code === code && p.id !== this.currentEditId
        );

        if (existingProduct) {
            this.showError('كود المنتج موجود مسبقاً');
            document.getElementById('productCode').focus();
            return false;
        }

        // Check for duplicate name
        const name = document.getElementById('productName').value.trim();
        const existingProductName = this.products.find(p =>
            p.name === name && p.id !== this.currentEditId
        );

        if (existingProductName) {
            this.showError('اسم المنتج موجود مسبقاً');
            document.getElementById('productName').focus();
            return false;
        }

        return true;
    },

    /**
     * Core data collection function (enhanced version)
     * دالة جمع البيانات الأساسية (نسخة محسنة)
     */
    collectProductDataCore() {
        const data = {
            code: document.getElementById('productCode')?.value.trim() || '',
            name: document.getElementById('productName')?.value.trim() || '',
            name2: document.getElementById('productName2')?.value.trim() || '',
            categoryId: document.getElementById('productCategory')?.value || '',
            unitId: document.getElementById('productUnit')?.value || '',
            brand: document.getElementById('productBrand')?.value.trim() || '',
            barcode: document.getElementById('productBarcode')?.value.trim() || '',
            description: document.getElementById('productDescription')?.value.trim() || '',
            purchasePrice: parseFloat(document.getElementById('purchasePrice')?.value) || 0,
            sellingPrice: parseFloat(document.getElementById('sellingPrice')?.value) || 0,
            wholesalePrice: parseFloat(document.getElementById('wholesalePrice')?.value) || 0,
            currentStock: parseFloat(document.getElementById('currentStock')?.value) || 0,
            minStock: parseFloat(document.getElementById('minStock')?.value) || 0,
            currency: document.getElementById('productCurrency')?.value || 'IQD',
            status: document.getElementById('productStatus')?.value || 'active',
            hasExpiryDate: document.getElementById('hasExpiryDate')?.checked || false,
            expiryWarningDays: parseInt(document.getElementById('expiryWarningDays')?.value) || 30,
            hasSerialNumber: document.getElementById('hasSerialNumber')?.checked || false,
            notes: document.getElementById('productNotes')?.value.trim() || ''
        };

        // Add image if uploaded
        if (this.currentImageData) {
            data.image = this.currentImageData;
        }

        return data;
    },

    /**
     * Core reset form function (enhanced version)
     * دالة إعادة تعيين النموذج الأساسية (نسخة محسنة)
     */
    resetProductFormCore() {
        console.log('🔄 Core: Resetting product form...');
        
        // Check if form exists before resetting
        const productForm = document.getElementById('productForm');
        if (productForm) {
            try {
                productForm.reset();
                console.log('✅ Core: Form reset successfully');
            } catch (error) {
                console.warn('⚠️ Core: Form reset failed:', error);
            }
        } else {
            console.warn('⚠️ Core: Product form not found');
        }
        
        // Reset individual fields with safety checks
        const fields = [
            'productCode', 'productName', 'productName2', 'productCategory', 
            'productUnit', 'productBrand', 'productBarcode', 'productDescription',
            'purchasePrice', 'sellingPrice', 'wholesalePrice', 'currentStock', 
            'minStock', 'productCurrency', 'productStatus', 'hasExpiryDate', 
            'expiryWarningDays', 'hasSerialNumber', 'productNotes'
        ];
        
        fields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                try {
                    if (element.type === 'checkbox') {
                        element.checked = false;
                    } else {
                        element.value = '';
                    }
                } catch (error) {
                    console.warn(`⚠️ Core: Failed to reset field ${fieldId}:`, error);
                }
            } else {
                console.warn(`⚠️ Core: Field ${fieldId} not found`);
            }
        });
        
        // Set default values with safety checks
        const defaultValues = {
            'currentStock': '0',
            'minStock': '10',
            'productStatus': 'active',
            'productCurrency': 'IQD',
            'expiryWarningDays': '30'
        };
        
        Object.entries(defaultValues).forEach(([fieldId, value]) => {
            const element = document.getElementById(fieldId);
            if (element) {
                try {
                    element.value = value;
                } catch (error) {
                    console.warn(`⚠️ Core: Failed to set default value for ${fieldId}:`, error);
                }
            }
        });
        
        this.currentEditId = null;
        this.currentImageData = null;
        
        // Reset image preview
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            try {
                imagePreview.innerHTML = '<i class="fas fa-image fa-3x text-muted"></i>';
            } catch (error) {
                console.warn('⚠️ Core: Failed to reset image preview:', error);
            }
        }
        
        console.log('✅ Core: Product form reset completed');
    },

    /**
     * Setup real-time sync for products module
     */
    /**
     * Notify other modules when product is updated/added
     * إشعار الوحدات الأخرى عند تحديث/إضافة منتج
     */
    notifyModulesOfProductUpdate(productId, productData) {
        try {
            // Dispatch custom event for other modules
            const event = new CustomEvent('productUpdated', {
                detail: {
                    productId: productId,
                    productData: productData,
                    timestamp: new Date()
                }
            });
            window.dispatchEvent(event);
            
            // Also trigger SyncManager if available
            if (typeof SyncManager !== 'undefined' && SyncManager.triggerSync) {
                SyncManager.triggerSync('products');
            }
        } catch (error) {
            console.warn('⚠️ Error notifying modules of product update:', error);
        }
    },

    setupProductsSync() {
        // Sync products
        if (typeof SyncManager !== 'undefined') {
            SyncManager.onCollectionSync('products', (data, syncType) => {
                this.products = data;
                this.filteredProducts = [...data];
                this.renderProductsTable();
                this.updateSummaryCards();
                this.updateFilterOptions();
                console.log(`🔄 Products updated via ${syncType} sync`);
            });

            // Sync categories
            SyncManager.onCollectionSync('categories', (data, syncType) => {
                this.categories = data;
                this.originalCategories = [...data];
                this.renderCategoriesTable();
                this.updateSummaryCards();
                this.updateFilterOptions();
                this.updateCategoriesStats();
                console.log(`🔄 Categories updated via ${syncType} sync`);
            });

            // Sync units
            SyncManager.onCollectionSync('units', (data, syncType) => {
                this.units = data;
                this.originalUnits = [...data];
                this.renderUnitsTable();
                this.updateSummaryCards();
                this.updateUnitsStats();
                console.log(`🔄 Units updated via ${syncType} sync`);
            });

            // Sync currencies
            SyncManager.onCollectionSync('currencies', (data, syncType) => {
                this.currencies = data;
                console.log(`🔄 Currencies updated via ${syncType} sync`);
            });
        }

        // Also listen to custom events
        window.addEventListener('dataSync', (event) => {
            const { collection, data } = event.detail;
            if (collection === 'products') {
                this.products = data;
                this.filteredProducts = [...data];
                this.renderProductsTable();
                this.updateSummaryCards();
                this.updateFilterOptions();
            } else if (collection === 'categories') {
                this.categories = data;
                this.originalCategories = [...data];
                this.renderCategoriesTable();
                this.updateSummaryCards();
                this.updateFilterOptions();
                this.updateCategoriesStats();
            } else if (collection === 'units') {
                this.units = data;
                this.originalUnits = [...data];
                this.renderUnitsTable();
                this.updateSummaryCards();
                this.updateUnitsStats();
            } else if (collection === 'currencies') {
                this.currencies = data;
            }
        });
    },

    /**
     * Lighten a color by a percentage
     * تفتيح لون بنسبة مئوية
     */
    lightenColor(color, percent) {
        // Remove # if present
        const hex = color.replace('#', '');
        
        // Convert to RGB
        const num = parseInt(hex, 16);
        const r = (num >> 16) + Math.round((255 - (num >> 16)) * (percent / 100));
        const g = ((num >> 8) & 0x00FF) + Math.round((255 - ((num >> 8) & 0x00FF)) * (percent / 100));
        const b = (num & 0x0000FF) + Math.round((255 - (num & 0x0000FF)) * (percent / 100));
        
        // Convert back to hex
        return '#' + ((1 << 24) + (Math.min(255, r) << 16) + (Math.min(255, g) << 8) + Math.min(255, b)).toString(16).slice(1);
    }
};

console.log('✅ Products Module (Enhanced Version) loaded');
