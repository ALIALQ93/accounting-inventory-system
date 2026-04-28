/**
 * Cost Centers Module - إدارة مراكز الكلف
 * Manages cost centers for expense and revenue tracking across departments/branches/projects.
 */

const CostCentersModule = {
    currentPage: 1,
    itemsPerPage: 10,
    allCostCenters: [],
    filteredCostCenters: [],
    editingCostCenter: null,

    /**
     * Get HTML for cost centers module
     */
    getHTML() {
        return `
            <section id="cost-centers" class="cost-centers-module">
                <!-- Header -->
                <div class="cost-centers-header-modern">
                    <div class="header-content-wrapper">
                        <div class="header-icon-box">
                            <i class="fas fa-cubes"></i>
                        </div>
                        <div class="header-text-box">
                            <h1 class="header-title">مراكز الكلف</h1>
                            <p class="header-subtitle">إدارة تكاليف الأقسام والفروع والمشاريع</p>
                        </div>
                    </div>
                    <div class="header-actions-box">
                        <button class="btn-modern btn-modern-primary" id="addCostCenterBtn">
                            <i class="fas fa-plus-circle"></i>
                            <span>إضافة مركز كلفة</span>
                        </button>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="cost-centers-stats-modern">
                    <div class="stat-card-modern stat-primary">
                        <div class="stat-icon">
                            <i class="fas fa-cubes"></i>
                        </div>
                        <div class="stat-details">
                            <div class="stat-value" id="totalCostCentersCount">0</div>
                            <div class="stat-label">إجمالي المراكز</div>
                        </div>
                    </div>
                    
                    <div class="stat-card-modern stat-success">
                        <div class="stat-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-details">
                            <div class="stat-value" id="activeCostCentersCount">0</div>
                            <div class="stat-label">المراكز النشطة</div>
                        </div>
                    </div>
                    
                    <div class="stat-card-modern stat-warning">
                        <div class="stat-icon">
                            <i class="fas fa-building"></i>
                        </div>
                        <div class="stat-details">
                            <div class="stat-value" id="departmentsCount">0</div>
                            <div class="stat-label">الأقسام</div>
                        </div>
                    </div>
                    
                    <div class="stat-card-modern stat-info">
                        <div class="stat-icon">
                            <i class="fas fa-project-diagram"></i>
                        </div>
                        <div class="stat-details">
                            <div class="stat-value" id="projectsCount">0</div>
                            <div class="stat-label">المشاريع</div>
                        </div>
                    </div>
                </div>

                <!-- Controls -->
                <div class="cost-centers-controls-modern">
                    <div class="controls-left">
                        <!-- Type Filter -->
                        <div class="select-box-modern">
                            <i class="fas fa-filter"></i>
                            <select class="select-modern" id="costCenterTypeFilter">
                                <option value="">كل الأنواع</option>
                                <option value="department">قسم</option>
                                <option value="branch">فرع</option>
                                <option value="project">مشروع</option>
                                <option value="other">أخرى</option>
                            </select>
                        </div>
                        
                        <!-- Status Filter -->
                        <div class="select-box-modern">
                            <i class="fas fa-toggle-on"></i>
                            <select class="select-modern" id="costCenterStatusFilter">
                                <option value="">كل الحالات</option>
                                <option value="active">نشط</option>
                                <option value="inactive">غير نشط</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="controls-right">
                        <!-- Search -->
                        <div class="search-box-modern">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" class="search-input-modern" id="searchCostCenters" 
                                   placeholder="ابحث عن مركز كلفة...">
                        </div>
                        
                        <button class="btn-modern btn-modern-clear" id="clearCostCenterFiltersBtn">
                            <i class="fas fa-times-circle"></i>
                            <span>مسح</span>
                        </button>
                    </div>
                </div>

                <!-- Cost Centers Table -->
                <div class="cost-centers-table-modern">
                    <div class="table-wrapper-modern">
                        <table class="table-modern cost-centers-table">
                            <thead>
                                <tr>
                                    <th width="10%">الكود</th>
                                    <th width="25%">اسم المركز</th>
                                    <th width="15%">النوع</th>
                                    <th width="20%">المسؤول</th>
                                    <th width="10%">الحالة</th>
                                    <th width="20%">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="costCentersTableBody">
                                <!-- Table rows will be rendered here -->
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Pagination -->
                    <div class="pagination-wrapper">
                        <nav>
                            <ul class="pagination mb-0" id="costCentersPagination"></ul>
                        </nav>
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
     * Initialize the Cost Centers module.
     */
    async initialize() {
        try {
            console.log('🏢 Initializing Cost Centers module...');
            this.render();
            
            // Wait a bit for DOM to be ready
            await new Promise(resolve => setTimeout(resolve, 100));
            
            this.setupEventListeners();
            await this.loadCostCenters();
            console.log('✅ Cost Centers module initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Cost Centers module:', error);
            this.showError('خطأ في تهيئة مراكز الكلف');
        }
    },

    /**
     * Load the module (alias for initialize)
     */
    async load() {
        await this.initialize();
    },

    /**
     * Setup event listeners for the module.
     */
    setupEventListeners() {
        console.log('🔧 Setting up event listeners for cost centers module...');
        
        // Add cost center button - use event delegation to handle dynamic content
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            // Remove old listener if exists
            if (this.handleAddButtonClick) {
                contentArea.removeEventListener('click', this.handleAddButtonClick);
            }
            
            // Add new listener with bound context
            this.handleAddButtonClick = (e) => {
                // Check if click is on button or its children
                const addBtn = e.target.closest('#addCostCenterBtn') || 
                              (e.target.id === 'addCostCenterBtn' ? e.target : null) ||
                              (e.target.closest('button')?.id === 'addCostCenterBtn' ? e.target.closest('button') : null);
                
                if (addBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('➕ Add cost center button clicked (event delegation)');
                    this.showAddEditCostCenterModal();
                }
            };
            
            contentArea.addEventListener('click', this.handleAddButtonClick);
            console.log('✅ Add cost center button listener attached (event delegation)');
        } else {
            console.warn('⚠️ Content area not found');
        }
        
        // Also try direct attachment as fallback
        setTimeout(() => {
            const addBtn = document.getElementById('addCostCenterBtn');
            if (addBtn) {
                // Remove old listener by cloning
                const newAddBtn = addBtn.cloneNode(true);
                addBtn.parentNode.replaceChild(newAddBtn, addBtn);
                
                newAddBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('➕ Add cost center button clicked (direct)');
                    this.showAddEditCostCenterModal();
                });
                console.log('✅ Add cost center button listener attached (direct)');
            } else {
                console.warn('⚠️ Add cost center button not found (will use event delegation)');
            }
        }, 200);

        // Save cost center button - use event delegation for modal button
        // The button is in the modal which might not exist when setupEventListeners is called
        // So we'll attach the listener when the modal is shown
        const saveBtn = document.getElementById('saveCostCenterBtn');
        if (saveBtn) {
            // Remove any existing listeners first
            const newSaveBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
            
            newSaveBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('💾 Save cost center button clicked');
                await this.saveCostCenter();
            });
            console.log('✅ Save cost center button listener attached');
        } else {
            console.warn('⚠️ Save cost center button not found (may be in modal)');
            // Attach listener when modal is shown
            const modalElement = document.getElementById('costCenterModal');
            if (modalElement) {
                modalElement.addEventListener('shown.bs.modal', () => {
                    const saveBtnInModal = document.getElementById('saveCostCenterBtn');
                    if (saveBtnInModal) {
                        // Remove any existing listeners
                        const newSaveBtn = saveBtnInModal.cloneNode(true);
                        saveBtnInModal.parentNode.replaceChild(newSaveBtn, saveBtnInModal);
                        
                        newSaveBtn.addEventListener('click', async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('💾 Save cost center button clicked (from modal event)');
                            await this.saveCostCenter();
                        });
                        console.log('✅ Save cost center button listener attached (from modal event)');
                    }
                }, { once: false });
            }
        }

        // Search cost centers
        document.getElementById('searchCostCenters')?.addEventListener('input', () => {
            this.filterCostCenters();
        });

        // Type filter
        document.getElementById('costCenterTypeFilter')?.addEventListener('change', () => {
            this.filterCostCenters();
        });

        // Status filter
        document.getElementById('costCenterStatusFilter')?.addEventListener('change', () => {
            this.filterCostCenters();
        });

        // Clear filters
        document.getElementById('clearCostCenterFiltersBtn')?.addEventListener('click', () => {
            this.clearFilters();
        });
    },

    /**
     * Load cost centers from Firebase.
     */
    async loadCostCenters() {
        try {
            console.log('📊 Loading cost centers from database...');
            
            if (!db) {
                console.error('❌ Firebase database not initialized');
                this.showError('قاعدة البيانات غير متصلة. يرجى تسجيل الدخول أولاً.');
                return;
            }

            const costCentersSnapshot = await db.collection('costCenters')
                .orderBy('code', 'asc')
                .get();

            this.allCostCenters = [];
            costCentersSnapshot.forEach(doc => {
                this.allCostCenters.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.filteredCostCenters = [...this.allCostCenters];
            this.renderTable();
            this.updateStats();

            console.log(`✅ Loaded ${this.allCostCenters.length} cost centers from database`);
        } catch (error) {
            console.error('❌ Error loading cost centers:', error);
            
            if (error.code === 'permission-denied') {
                this.showError('ليس لديك صلاحية الوصول إلى مراكز الكلف. يرجى التحقق من صلاحياتك.');
            } else {
                this.showError('خطأ في تحميل مراكز الكلف: ' + (error.message || 'خطأ غير معروف'));
            }
        }
    },

    /**
     * Filter cost centers based on search and filters.
     */
    filterCostCenters() {
        const searchTerm = document.getElementById('searchCostCenters').value.toLowerCase();
        const typeFilter = document.getElementById('costCenterTypeFilter').value;
        const statusFilter = document.getElementById('costCenterStatusFilter').value;

        this.filteredCostCenters = this.allCostCenters.filter(costCenter => {
            const matchesSearch = !searchTerm ||
                costCenter.name.toLowerCase().includes(searchTerm) ||
                costCenter.code.toLowerCase().includes(searchTerm) ||
                (costCenter.manager && costCenter.manager.toLowerCase().includes(searchTerm));

            const matchesType = !typeFilter || costCenter.type === typeFilter;
            const matchesStatus = !statusFilter || costCenter.status === statusFilter;

            return matchesSearch && matchesType && matchesStatus;
        });

        this.currentPage = 1;
        this.renderTable();
        this.updateStats();
    },

    /**
     * Clear all filters.
     */
    clearFilters() {
        document.getElementById('searchCostCenters').value = '';
        document.getElementById('costCenterTypeFilter').value = '';
        document.getElementById('costCenterStatusFilter').value = '';
        this.filterCostCenters();
    },

    /**
     * Render the cost centers table.
     */
    renderTable() {
        const tbody = document.getElementById('costCentersTableBody');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageCostCenters = this.filteredCostCenters.slice(startIndex, endIndex);

        tbody.innerHTML = '';

        if (pageCostCenters.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <i class="fas fa-cubes fa-3x text-muted mb-3"></i>
                        <p class="text-muted">لا توجد مراكز كلفة. اضغط "إضافة مركز كلفة" للبدء</p>
                        <button class="btn btn-primary" onclick="CostCentersModule.showAddEditCostCenterModal()">
                            <i class="fas fa-plus"></i> إضافة أول مركز
                        </button>
                    </td>
                </tr>
            `;
            this.renderPagination();
            return;
        }

        pageCostCenters.forEach(costCenter => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="cost-center-code-cell">${costCenter.code}</div>
                </td>
                <td>
                    <div class="cost-center-name-cell">
                        <strong>${costCenter.name}</strong>
                        ${costCenter.description ? `<br><small class="text-muted">${costCenter.description}</small>` : ''}
                    </div>
                </td>
                <td class="text-center">
                    <span class="type-badge type-${costCenter.type}">
                        ${this.getTypeIcon(costCenter.type)} ${this.getTypeText(costCenter.type)}
                    </span>
                </td>
                <td>
                    <div class="manager-cell">
                        ${costCenter.manager ? `<i class="fas fa-user-tie text-muted"></i> ${costCenter.manager}` : '<span class="text-muted">غير محدد</span>'}
                    </div>
                </td>
                <td class="text-center">
                    <span class="status-badge ${this.getStatusClass(costCenter.status)}">
                        ${this.getStatusText(costCenter.status)}
                    </span>
                </td>
                <td class="text-center">
                    <div class="action-buttons">
                        <button class="action-btn-modern action-edit" 
                                onclick="CostCentersModule.editCostCenter('${costCenter.id}')" 
                                title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn-modern action-delete" 
                                onclick="CostCentersModule.deleteCostCenter('${costCenter.id}')" 
                                title="حذف">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        this.renderPagination();
    },

    /**
     * Render pagination for the cost centers table.
     */
    renderPagination() {
        const totalPages = Math.ceil(this.filteredCostCenters.length / this.itemsPerPage);
        const pagination = document.getElementById('costCentersPagination');

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="CostCentersModule.goToPage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="CostCentersModule.goToPage(${i})">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        // Next button
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="CostCentersModule.goToPage(${this.currentPage + 1})">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;

        pagination.innerHTML = paginationHTML;
    },

    /**
     * Go to a specific page.
     */
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredCostCenters.length / this.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderTable();
        }
    },

    /**
     * Update statistics.
     */
    updateStats() {
        const totalCount = this.allCostCenters.length;
        const activeCount = this.allCostCenters.filter(cc => cc.status === 'active').length;
        const departmentsCount = this.allCostCenters.filter(cc => cc.type === 'department').length;
        const projectsCount = this.allCostCenters.filter(cc => cc.type === 'project').length;

        document.getElementById('totalCostCentersCount').textContent = totalCount;
        document.getElementById('activeCostCentersCount').textContent = activeCount;
        document.getElementById('departmentsCount').textContent = departmentsCount;
        document.getElementById('projectsCount').textContent = projectsCount;
    },

    /**
     * Show add/edit cost center modal.
     */
    showAddEditCostCenterModal(costCenterId = null) {
        console.log('📋 Showing cost center modal, costCenterId:', costCenterId);
        
        // Check authentication first
        if (!auth || !auth.currentUser) {
            console.error('❌ User not authenticated');
            this.showError('يجب تسجيل الدخول أولاً. يرجى تسجيل الدخول ثم المحاولة مرة أخرى.');
            return;
        }
        
        // Check database connection
        if (!db) {
            console.error('❌ Database not initialized');
            this.showError('قاعدة البيانات غير متصلة. يرجى تحديث الصفحة.');
            return;
        }
        
        this.editingCostCenter = null;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('costCenterModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal dynamically (like other modules)
        const modalHTML = `
            <div class="modal fade" id="costCenterModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-gradient">
                            <h5 class="modal-title" id="costCenterModalTitle">
                                <i class="fas fa-cubes me-2"></i>
                                ${costCenterId ? 'تعديل مركز الكلفة' : 'إضافة مركز كلفة جديد'}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4">
                            <form id="costCenterForm">
                                <!-- Basic Info Section -->
                                <div class="form-section mb-4">
                                    <div class="section-header">
                                        <i class="fas fa-info-circle text-primary"></i>
                                        <span class="section-title">المعلومات الأساسية</span>
                                    </div>
                                    <div class="row g-3">
                                        <div class="col-md-4">
                                            <label class="form-label fw-bold">
                                                <i class="fas fa-hashtag text-muted"></i> الكود *
                                            </label>
                                            <input type="text" class="form-control" id="costCenterCode" 
                                                   placeholder="مثال: CC001" required>
                                            <div class="form-text">يُنشأ تلقائياً</div>
                                        </div>
                                        
                                        <div class="col-md-8">
                                            <label class="form-label fw-bold">
                                                <i class="fas fa-signature text-muted"></i> اسم مركز الكلفة *
                                            </label>
                                            <input type="text" class="form-control" id="costCenterName" 
                                                   placeholder="مثال: قسم المبيعات" required autofocus>
                                        </div>
                                    </div>
                                </div>

                                <!-- Properties Section -->
                                <div class="form-section mb-4">
                                    <div class="section-header">
                                        <i class="fas fa-cog text-success"></i>
                                        <span class="section-title">الخصائص</span>
                                    </div>
                                    <div class="row g-3">
                                        <div class="col-md-4">
                                            <label class="form-label fw-bold">
                                                <i class="fas fa-building text-muted"></i> النوع *
                                            </label>
                                            <select class="form-select" id="costCenterType" required>
                                                <option value="department">قسم</option>
                                                <option value="branch">فرع</option>
                                                <option value="project">مشروع</option>
                                                <option value="other">أخرى</option>
                                            </select>
                                        </div>
                                        
                                        <div class="col-md-4">
                                            <label class="form-label fw-bold">
                                                <i class="fas fa-user text-muted"></i> المدير
                                            </label>
                                            <input type="text" class="form-control" id="costCenterManager" 
                                                   placeholder="اسم المدير">
                                        </div>
                                        
                                        <div class="col-md-4">
                                            <label class="form-label fw-bold">
                                                <i class="fas fa-toggle-on text-muted"></i> الحالة
                                            </label>
                                            <select class="form-select" id="costCenterStatus">
                                                <option value="active">✅ نشط</option>
                                                <option value="inactive">⏸️ غير نشط</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <!-- Description Section -->
                                <div class="form-section">
                                    <div class="section-header">
                                        <i class="fas fa-comment-alt text-secondary"></i>
                                        <span class="section-title">ملاحظات إضافية</span>
                                    </div>
                                    <textarea class="form-control" id="costCenterDescription" rows="3" 
                                              placeholder="وصف تفصيلي لمركز الكلفة..."></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer bg-light">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-1"></i> إلغاء
                            </button>
                            <button type="button" class="btn btn-primary btn-lg" id="saveCostCenterBtn">
                                <i class="fas fa-save me-1"></i> حفظ المركز
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        const modalElement = document.getElementById('costCenterModal');
        if (!modalElement) {
            console.error('❌ Failed to create cost center modal');
            this.showError('فشل في إنشاء النافذة. يرجى تحديث الصفحة.');
            return;
        }
        
        console.log('✅ Modal element created:', modalElement);

        // Setup form data
        const form = document.getElementById('costCenterForm');
        if (form) {
            form.reset();
            console.log('✅ Form reset');
        }

        // Setup form data after modal is created
        if (costCenterId) {
            // Edit mode
            console.log('✏️ Edit mode');
            const costCenter = this.allCostCenters.find(cc => cc.id === costCenterId);
            if (costCenter) {
                this.editingCostCenter = costCenter;
            } else {
                console.error('❌ Cost center not found:', costCenterId);
                this.showError('مركز الكلفة غير موجود');
                return;
            }
        } else {
            // Add mode
            console.log('➕ Add mode');
        }

        // Wait a bit to ensure DOM is updated, then show modal
        setTimeout(() => {
            try {
                // Check if Bootstrap is available
                if (typeof bootstrap === 'undefined' || !bootstrap.Modal) {
                    console.error('❌ Bootstrap Modal is not available');
                    this.showError('Bootstrap غير متاح. يرجى تحديث الصفحة.');
                    return;
                }
                
                const modal = new bootstrap.Modal(modalElement, {
                    backdrop: true,
                    keyboard: true,
                    focus: true
                });
                
                // Setup save button listener
                const saveBtn = document.getElementById('saveCostCenterBtn');
                if (saveBtn) {
                    saveBtn.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('💾 Save button clicked');
                        await this.saveCostCenter();
                    });
                    console.log('✅ Save button listener attached');
                }
                
                // Show modal
                modal.show();
                console.log('✅ Modal.show() called');
                
                // Setup event listener for when modal is shown
                modalElement.addEventListener('shown.bs.modal', () => {
                    console.log('✅ Modal shown event fired');
                    
                    // Populate form data
                    if (costCenterId && this.editingCostCenter) {
                        // Edit mode - populate form
                        const costCenter = this.editingCostCenter;
                        const codeEl = document.getElementById('costCenterCode');
                        const nameEl = document.getElementById('costCenterName');
                        const typeEl = document.getElementById('costCenterType');
                        const managerEl = document.getElementById('costCenterManager');
                        const statusEl = document.getElementById('costCenterStatus');
                        const descEl = document.getElementById('costCenterDescription');
                        
                        if (codeEl) codeEl.value = costCenter.code || '';
                        if (nameEl) nameEl.value = costCenter.name || '';
                        if (typeEl) typeEl.value = costCenter.type || 'department';
                        if (managerEl) managerEl.value = costCenter.manager || '';
                        if (statusEl) statusEl.value = costCenter.status || 'active';
                        if (descEl) descEl.value = costCenter.description || '';
                        
                        console.log('✅ Form populated with cost center data');
                    } else {
                        // Add mode - initialize form
                        const nextCode = this.generateNextCode();
                        const codeEl = document.getElementById('costCenterCode');
                        const typeEl = document.getElementById('costCenterType');
                        const statusEl = document.getElementById('costCenterStatus');
                        
                        if (codeEl) codeEl.value = nextCode;
                        if (typeEl) typeEl.value = 'department';
                        if (statusEl) statusEl.value = 'active';
                        
                        console.log('✅ Form initialized for new cost center');
                    }
                    
                    // Focus on first input
                    const firstInput = modalElement.querySelector('#costCenterName');
                    if (firstInput) {
                        setTimeout(() => {
                            firstInput.focus();
                            console.log('✅ Focus set on first input');
                        }, 100);
                    }
                }, { once: true });
                
            } catch (error) {
                console.error('❌ Error showing modal:', error);
                this.showError('خطأ في عرض النافذة: ' + (error.message || 'خطأ غير معروف'));
            }
        }, 50);
    },

    /**
     * Generate next cost center code.
     */
    generateNextCode() {
        if (this.allCostCenters.length === 0) {
            return 'CC001';
        }

        // Find highest number
        let maxNumber = 0;
        this.allCostCenters.forEach(cc => {
            const match = cc.code.match(/CC(\d+)/);
            if (match) {
                const num = parseInt(match[1]);
                if (num > maxNumber) {
                    maxNumber = num;
                }
            }
        });

        return `CC${String(maxNumber + 1).padStart(3, '0')}`;
    },

    /**
     * Edit cost center.
     */
    editCostCenter(id) {
        this.showAddEditCostCenterModal(id);
    },

    /**
     * Save cost center (add or edit).
     */
    async saveCostCenter() {
        try {
            console.log('💾 saveCostCenter() called');
            
            // Check if db is available
            if (!db) {
                console.error('❌ Database (db) is not available');
                this.showError('قاعدة البيانات غير متصلة. يرجى تسجيل الدخول أولاً.');
                return;
            }
            
            // Check if firebase is available
            if (!firebase || !firebase.firestore) {
                console.error('❌ Firebase is not available');
                this.showError('Firebase غير متاح. يرجى تحديث الصفحة.');
                return;
            }
            
            // Validate form
            console.log('🔍 Validating form...');
            if (!this.validateCostCenterForm()) {
                console.log('❌ Form validation failed');
                return;
            }
            console.log('✅ Form validation passed');

            // Show loading
            if (typeof showLoading === 'function') {
                showLoading();
            } else {
                console.warn('⚠️ showLoading function not available');
            }

            // Get form values
            const codeInput = document.getElementById('costCenterCode');
            const nameInput = document.getElementById('costCenterName');
            const typeInput = document.getElementById('costCenterType');
            const managerInput = document.getElementById('costCenterManager');
            const statusInput = document.getElementById('costCenterStatus');
            const descriptionInput = document.getElementById('costCenterDescription');
            
            if (!codeInput || !nameInput || !typeInput || !statusInput) {
                console.error('❌ Required form fields not found');
                this.showError('بعض حقول النموذج غير موجودة. يرجى تحديث الصفحة.');
                if (typeof hideLoading === 'function') hideLoading();
                return;
            }

            const code = codeInput.value.trim();
            const name = nameInput.value.trim();
            const type = typeInput.value;
            const manager = managerInput ? managerInput.value.trim() : '';
            const status = statusInput.value;
            const description = descriptionInput ? descriptionInput.value.trim() : '';

            console.log('📝 Form data:', { code, name, type, manager, status, description });

            const formData = {
                code: code,
                name: name,
                type: type,
                manager: manager || null,
                status: status,
                description: description || '',
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (this.editingCostCenter) {
                // Update existing cost center
                console.log('🔄 Updating cost center:', this.editingCostCenter.id);
                await db.collection('costCenters').doc(this.editingCostCenter.id).update(formData);
                console.log('✅ Cost center updated successfully');
                this.showSuccess('تم تحديث مركز الكلفة بنجاح');
            } else {
                // Add new cost center
                console.log('➕ Adding new cost center...');
                formData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                const docRef = await db.collection('costCenters').add(formData);
                console.log('✅ Cost center added successfully with ID:', docRef.id);
                this.showSuccess('تم إضافة مركز الكلفة بنجاح');
            }

            // Hide loading
            if (typeof hideLoading === 'function') {
                hideLoading();
            }

            // Close modal
            const modalElement = document.getElementById('costCenterModal');
            if (modalElement) {
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                } else {
                    // If modal instance doesn't exist, try to create one and hide it
                    const newModal = new bootstrap.Modal(modalElement);
                    newModal.hide();
                }
            } else {
                console.warn('⚠️ Cost center modal not found');
            }

            // Reload cost centers
            console.log('🔄 Reloading cost centers...');
            await this.loadCostCenters();
            console.log('✅ Cost centers reloaded');
            
        } catch (error) {
            console.error('❌ Error saving cost center:', error);
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            
            // Hide loading
            if (typeof hideLoading === 'function') {
                hideLoading();
            }
            
            // Show error message
            let errorMessage = 'خطأ في حفظ مركز الكلفة';
            if (error.code === 'permission-denied') {
                errorMessage = 'ليس لديك صلاحية لحفظ مركز الكلفة. يرجى التحقق من صلاحياتك.';
            } else if (error.code === 'unavailable') {
                errorMessage = 'قاعدة البيانات غير متاحة. يرجى التحقق من الاتصال بالإنترنت.';
            } else if (error.message) {
                errorMessage += ': ' + error.message;
            }
            
            this.showError(errorMessage);
        }
    },

    /**
     * Delete cost center.
     */
    async deleteCostCenter(id) {
        const costCenter = this.allCostCenters.find(cc => cc.id === id);
        if (!costCenter) return;

        const result = await Swal.fire({
            title: 'هل أنت متأكد؟',
            text: `هل تريد حذف مركز الكلفة "${costCenter.name}" (${costCenter.code})؟`,
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
                await db.collection('costCenters').doc(id).delete();
                hideLoading();
                this.showSuccess('تم حذف مركز الكلفة بنجاح');
                await this.loadCostCenters();
            } catch (error) {
                hideLoading();
                console.error('❌ Error deleting cost center:', error);
                this.showError('خطأ في حذف مركز الكلفة: ' + error.message);
            }
        }
    },

    /**
     * Validate cost center form.
     */
    validateCostCenterForm() {
        const code = document.getElementById('costCenterCode').value.trim();
        const name = document.getElementById('costCenterName').value.trim();
        const type = document.getElementById('costCenterType').value;

        if (!code) {
            this.showError('يرجى إدخال كود مركز الكلفة');
            document.getElementById('costCenterCode').focus();
            return false;
        }

        if (!name) {
            this.showError('يرجى إدخال اسم مركز الكلفة');
            document.getElementById('costCenterName').focus();
            return false;
        }

        if (!type) {
            this.showError('يرجى اختيار نوع مركز الكلفة');
            document.getElementById('costCenterType').focus();
            return false;
        }

        // Check if code already exists (for new cost centers or changed codes)
        if (!this.editingCostCenter || this.editingCostCenter.code !== code) {
            const existingCode = this.allCostCenters.find(cc => cc.code === code);
            if (existingCode) {
                this.showError('كود مركز الكلفة موجود بالفعل. يرجى استخدام كود آخر.');
                document.getElementById('costCenterCode').focus();
                return false;
            }
        }

        return true;
    },

    /**
     * Get type text.
     */
    getTypeText(type) {
        const types = {
            'department': 'قسم',
            'branch': 'فرع',
            'project': 'مشروع',
            'other': 'أخرى'
        };
        return types[type] || type;
    },

    /**
     * Get type icon.
     */
    getTypeIcon(type) {
        const icons = {
            'department': '<i class="fas fa-building"></i>',
            'branch': '<i class="fas fa-map-marker-alt"></i>',
            'project': '<i class="fas fa-project-diagram"></i>',
            'other': '<i class="fas fa-cube"></i>'
        };
        return icons[type] || '<i class="fas fa-cube"></i>';
    },

    /**
     * Get status class.
     */
    getStatusClass(status) {
        return status === 'active' ? 'status-active' : 'status-inactive';
    },

    /**
     * Get status text.
     */
    getStatusText(status) {
        return status === 'active' ? 'نشط' : 'غير نشط';
    },

    /**
     * Show success message.
     */
    showSuccess(message) {
        Swal.fire({
            title: 'نجح!',
            text: message,
            icon: 'success',
            confirmButtonText: 'حسناً',
            timer: 2000
        });
    },

    /**
     * Show error message.
     */
    showError(message) {
        Swal.fire({
            title: 'خطأ!',
            text: message,
            icon: 'error',
            confirmButtonText: 'حسناً'
        });
    },

    /**
     * Show info message.
     */
    showInfo(message) {
        Swal.fire({
            title: 'معلومة',
            text: message,
            icon: 'info',
            confirmButtonText: 'حسناً'
        });
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CostCentersModule;
}
