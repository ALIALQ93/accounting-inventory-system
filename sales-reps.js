/**
 * Sales Representatives Module - Complete Sales Reps Management
 * @module modules/sales-reps
 */

const SalesRepsModule = {
    // Data storage
    currentTab: 'dashboard',
    salesReps: [],
    currentPage: 1,
    itemsPerPage: 10,
    editingSalesRep: null,

    getHTML() {
        return `
            <div class="sales-reps-module">
                <!-- Header -->
                <div class="module-header">
                    <div class="header-content">
                        <h2><i class="fas fa-users"></i> إدارة المندوبين</h2>
                        <p>إدارة شاملة لمندوبي المبيعات والمشتريات</p>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-primary" id="newSalesRepBtn">
                            <i class="fas fa-plus"></i> إضافة مندوب
                        </button>
                    </div>
                </div>

                <!-- Navigation Tabs -->
                <ul class="nav nav-tabs" id="salesRepsTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="dashboard-tab" data-bs-toggle="tab" data-bs-target="#dashboard" type="button" role="tab">
                            <i class="fas fa-tachometer-alt"></i> لوحة التحكم
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="sales-reps-tab" data-bs-toggle="tab" data-bs-target="#sales-reps" type="button" role="tab">
                            <i class="fas fa-users"></i> المندوبين
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="reports-tab" data-bs-toggle="tab" data-bs-target="#reports" type="button" role="tab">
                            <i class="fas fa-chart-line"></i> التقارير
                        </button>
                    </li>
                </ul>

                <!-- Tab Content -->
                <div class="tab-content" id="salesRepsTabContent">
                    <!-- Dashboard Tab -->
                    <div class="tab-pane fade show active" id="dashboard" role="tabpanel">
                        <div class="dashboard-content">
                            <!-- Summary Cards -->
                            <div class="row mb-4">
                                <div class="col-md-3">
                                    <div class="summary-card">
                                        <div class="card-icon">
                                            <i class="fas fa-users"></i>
                                        </div>
                                        <div class="card-content">
                                            <h3 id="totalSalesRepsCount">0</h3>
                                            <p>إجمالي المندوبين</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="summary-card">
                                        <div class="card-icon">
                                            <i class="fas fa-user-check"></i>
                                        </div>
                                        <div class="card-content">
                                            <h3 id="activeSalesRepsCount">0</h3>
                                            <p>المندوبين النشطين</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="summary-card">
                                        <div class="card-icon">
                                            <i class="fas fa-user-times"></i>
                                        </div>
                                        <div class="card-content">
                                            <h3 id="inactiveSalesRepsCount">0</h3>
                                            <p>المندوبين غير النشطين</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="summary-card">
                                        <div class="card-icon">
                                            <i class="fas fa-chart-line"></i>
                                        </div>
                                        <div class="card-content">
                                            <h3 id="totalCommissions">0</h3>
                                            <p>إجمالي العمولات</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Action Cards -->
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="action-card" onclick="SalesRepsModule.switchTab('sales-reps')">
                                        <div class="action-icon">
                                            <i class="fas fa-users"></i>
                                        </div>
                                        <div class="action-content">
                                            <h4>إدارة المندوبين</h4>
                                            <p>عرض وإدارة جميع المندوبين</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="action-card" onclick="SalesRepsModule.switchTab('reports')">
                                        <div class="action-icon">
                                            <i class="fas fa-chart-line"></i>
                                        </div>
                                        <div class="action-content">
                                            <h4>تقارير المندوبين</h4>
                                            <p>تقارير مفصلة عن أداء المندوبين</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sales Reps Tab -->
                    <div class="tab-pane fade" id="sales-reps" role="tabpanel">
                        <div class="sales-reps-content">
                            <!-- Search and Filter -->
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                                        <input type="text" class="form-control" id="salesRepSearch" placeholder="البحث في المندوبين...">
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <select class="form-select" id="salesRepStatusFilter">
                                        <option value="">جميع الحالات</option>
                                        <option value="active">نشط</option>
                                        <option value="inactive">غير نشط</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <button class="btn btn-outline-secondary" id="clearSalesRepFilters">
                                        <i class="fas fa-times"></i> مسح الفلاتر
                                    </button>
                                </div>
                            </div>

                            <!-- Sales Reps Table -->
                            <div class="card">
                                <div class="card-header">
                                    <h5><i class="fas fa-users"></i> قائمة المندوبين</h5>
                                </div>
                                <div class="card-body">
                                    <div class="table-responsive">
                                        <table class="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>اسم المندوب</th>
                                                    <th>الهاتف</th>
                                                    <th>البريد الإلكتروني</th>
                                                    <th>نوع المندوب</th>
                                                    <th>نسبة العمولة</th>
                                                    <th>الحالة</th>
                                                    <th>الإجراءات</th>
                                                </tr>
                                            </thead>
                                            <tbody id="salesRepsTable">
                                                <tr>
                                                    <td colspan="7" class="text-center text-muted">لا توجد مندوبين</td>
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
                                        <option value="summary">ملخص المندوبين</option>
                                        <option value="performance">أداء المندوبين</option>
                                        <option value="commissions">العمولات</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <button class="btn btn-primary" id="generateSalesRepReport">
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
                                    <div id="salesRepReportContent">
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

    async load() {
        console.log('👥 Loading sales reps module...');
        this.render();
        await this.loadData();
        console.log('✅ Sales reps module loaded');
    },

    render() {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = this.getHTML();
            this.setupEventListeners();
        } else {
            console.error('❌ Content area not found!');
        }
    },

    async loadData() {
        try {
            console.log('🔄 Loading sales reps data...');
            await this.loadSalesReps();
            this.updateDashboard();
            console.log('✅ All sales reps data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading sales reps data:', error);
        }
    },

    async loadSalesReps() {
        try {
            const salesReps = await Collections.getSalesReps();
            this.salesReps = salesReps;
            console.log(`✅ Loaded ${salesReps.length} sales reps`);
        } catch (error) {
            console.error('❌ Error loading sales reps:', error);
            this.salesReps = [];
        }
    },

    updateDashboard() {
        // Safely update dashboard elements using DOMUtils if available
        if (window.DOMUtils) {
            const activeSalesReps = this.salesReps.filter(rep => rep.status === 'active');
            const inactiveSalesReps = this.salesReps.filter(rep => rep.status === 'inactive');
            const totalCommissions = this.salesReps.reduce((sum, rep) => sum + (rep.totalCommissions || 0), 0);

            const updates = {
                'totalSalesRepsCount': this.salesReps.length.toString(),
                'activeSalesRepsCount': activeSalesReps.length.toString(),
                'inactiveSalesRepsCount': inactiveSalesReps.length.toString(),
                'totalCommissions': totalCommissions.toLocaleString('ar-IQ')
            };
            window.DOMUtils.batchUpdateText(updates);
        } else {
            // Fallback with safety checks
            const totalSalesRepsEl = document.getElementById('totalSalesRepsCount');
            const activeSalesRepsEl = document.getElementById('activeSalesRepsCount');
            const inactiveSalesRepsEl = document.getElementById('inactiveSalesRepsCount');
            const totalCommissionsEl = document.getElementById('totalCommissions');

            if (totalSalesRepsEl) totalSalesRepsEl.textContent = this.salesReps.length;
            
            const activeSalesReps = this.salesReps.filter(rep => rep.status === 'active');
            if (activeSalesRepsEl) activeSalesRepsEl.textContent = activeSalesReps.length;
            
            const inactiveSalesReps = this.salesReps.filter(rep => rep.status === 'inactive');
            if (inactiveSalesRepsEl) inactiveSalesRepsEl.textContent = inactiveSalesReps.length;
            
            const totalCommissions = this.salesReps.reduce((sum, rep) => sum + (rep.totalCommissions || 0), 0);
            if (totalCommissionsEl) totalCommissionsEl.textContent = totalCommissions.toLocaleString('ar-IQ');
        }
    },

    setupEventListeners() {
        // Tab switching
        const tabElements = document.querySelectorAll('[data-bs-toggle="tab"]');
        if (tabElements.length > 0) {
            tabElements.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    const targetTab = e.target.getAttribute('data-bs-target').replace('#', '');
                    this.switchTab(targetTab);
                });
            });
        }

        // New sales rep button
        const newSalesRepBtn = document.getElementById('newSalesRepBtn');
        if (newSalesRepBtn) {
            newSalesRepBtn.addEventListener('click', () => {
                this.showNewSalesRepModal();
            });
        }

        // Search and filter
        const salesRepSearch = document.getElementById('salesRepSearch');
        if (salesRepSearch) {
            salesRepSearch.addEventListener('input', () => {
                this.filterSalesReps();
            });
        }

        const salesRepStatusFilter = document.getElementById('salesRepStatusFilter');
        if (salesRepStatusFilter) {
            salesRepStatusFilter.addEventListener('change', () => {
                this.filterSalesReps();
            });
        }

        const clearFiltersBtn = document.getElementById('clearSalesRepFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Generate report
        const generateReportBtn = document.getElementById('generateSalesRepReport');
        if (generateReportBtn) {
            generateReportBtn.addEventListener('click', () => {
                this.generateSalesRepReport();
            });
        }
    },

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update active tab
        document.querySelectorAll('.nav-link').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Update active content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('show', 'active');
        });
        document.getElementById(tabName).classList.add('show', 'active');

        // Load tab-specific data
        if (tabName === 'sales-reps') {
            this.renderSalesRepsTable();
        }
    },

    renderSalesRepsTable() {
        const tbody = document.getElementById('salesRepsTable');
        if (!tbody) return;

        if (this.salesReps.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">لا توجد مندوبين</td></tr>';
            return;
        }

        tbody.innerHTML = this.salesReps.map(salesRep => {
            const name = typeof sanitizeInput !== 'undefined' ? sanitizeInput(salesRep.name) : salesRep.name;
            const phone = typeof sanitizeInput !== 'undefined' ? sanitizeInput(salesRep.phone || '-') : (salesRep.phone || '-');
            const email = typeof sanitizeInput !== 'undefined' ? sanitizeInput(salesRep.email || '-') : (salesRep.email || '-');
            return `
            <tr>
                <td>${name}</td>
                <td>${phone}</td>
                <td>${email}</td>
                <td>
                    <span class="badge ${salesRep.type === 'sales' ? 'bg-success' : 'bg-info'}">
                        ${salesRep.type === 'sales' ? 'مبيعات' : 'مشتريات'}
                    </span>
                </td>
                <td>${salesRep.commissionRate || 0}%</td>
                <td>
                    <span class="badge ${salesRep.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                        ${salesRep.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="SalesRepsModule.editSalesRep('${salesRep.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="SalesRepsModule.deleteSalesRep('${salesRep.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        }).join('');
    },

    filterSalesReps() {
        const searchInput = document.getElementById('salesRepSearch');
        const statusInput = document.getElementById('salesRepStatusFilter');
        
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const statusFilter = statusInput ? statusInput.value : '';

        let filteredSalesReps = this.salesReps.filter(salesRep => {
            const matchesSearch = salesRep.name.toLowerCase().includes(searchTerm) ||
                                (salesRep.phone && salesRep.phone.includes(searchTerm)) ||
                                (salesRep.email && salesRep.email.toLowerCase().includes(searchTerm));
            
            const matchesStatus = !statusFilter || salesRep.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });

        // Update table with filtered results
        const tbody = document.getElementById('salesRepsTable');
        if (filteredSalesReps.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">لا توجد نتائج</td></tr>';
            return;
        }

        tbody.innerHTML = filteredSalesReps.map(salesRep => {
            const name = typeof sanitizeInput !== 'undefined' ? sanitizeInput(salesRep.name) : salesRep.name;
            const phone = typeof sanitizeInput !== 'undefined' ? sanitizeInput(salesRep.phone || '-') : (salesRep.phone || '-');
            const email = typeof sanitizeInput !== 'undefined' ? sanitizeInput(salesRep.email || '-') : (salesRep.email || '-');
            return `
            <tr>
                <td>${name}</td>
                <td>${phone}</td>
                <td>${email}</td>
                <td>
                    <span class="badge ${salesRep.type === 'sales' ? 'bg-success' : 'bg-info'}">
                        ${salesRep.type === 'sales' ? 'مبيعات' : 'مشتريات'}
                    </span>
                </td>
                <td>${salesRep.commissionRate || 0}%</td>
                <td>
                    <span class="badge ${salesRep.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                        ${salesRep.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="SalesRepsModule.editSalesRep('${salesRep.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="SalesRepsModule.deleteSalesRep('${salesRep.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        }).join('');
    },

    clearFilters() {
        const searchInput = document.getElementById('salesRepSearch');
        const statusInput = document.getElementById('salesRepStatusFilter');
        
        if (searchInput) searchInput.value = '';
        if (statusInput) statusInput.value = '';
        
        this.renderSalesRepsTable();
    },

    showNewSalesRepModal() {
        this.editingSalesRep = null;
        this.showSalesRepModal();
    },

    showSalesRepModal() {
        const modalHTML = `
            <div class="modal fade" id="salesRepModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-user"></i>
                                ${this.editingSalesRep ? 'تعديل المندوب' : 'إضافة مندوب جديد'}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="salesRepForm">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="salesRepName" class="form-label">اسم المندوب *</label>
                                            <input type="text" id="salesRepName" class="form-control" required>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="salesRepType" class="form-label">نوع المندوب *</label>
                                            <select id="salesRepType" class="form-select" required>
                                                <option value="">اختر النوع</option>
                                                <option value="sales">مبيعات</option>
                                                <option value="purchases">مشتريات</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="salesRepPhone" class="form-label">الهاتف</label>
                                            <input type="tel" id="salesRepPhone" class="form-control">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="salesRepEmail" class="form-label">البريد الإلكتروني</label>
                                            <input type="email" id="salesRepEmail" class="form-control">
                                        </div>
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="salesRepCommissionRate" class="form-label">نسبة العمولة %</label>
                                            <input type="number" id="salesRepCommissionRate" class="form-control" min="0" max="100" step="0.01" value="0">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group">
                                            <label for="salesRepStatus" class="form-label">الحالة</label>
                                            <select id="salesRepStatus" class="form-select">
                                                <option value="active">نشط</option>
                                                <option value="inactive">غير نشط</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-12">
                                        <div class="form-group">
                                            <label for="salesRepNotes" class="form-label">ملاحظات</label>
                                            <textarea id="salesRepNotes" class="form-control" rows="3"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">إلغاء</button>
                            <button type="button" class="btn btn-primary" id="saveSalesRepBtn">
                                <i class="fas fa-save"></i> حفظ المندوب
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('salesRepModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('salesRepModal'));
        modal.show();

        // Setup modal event listeners
        this.setupSalesRepModalListeners();

        // Populate form if editing
        if (this.editingSalesRep) {
            this.populateSalesRepForm();
        }
    },

    setupSalesRepModalListeners() {
        document.getElementById('saveSalesRepBtn').addEventListener('click', () => {
            this.saveSalesRep();
        });
    },

    populateSalesRepForm() {
        if (!this.editingSalesRep) return;

        document.getElementById('salesRepName').value = this.editingSalesRep.name || '';
        document.getElementById('salesRepType').value = this.editingSalesRep.type || '';
        document.getElementById('salesRepPhone').value = this.editingSalesRep.phone || '';
        document.getElementById('salesRepEmail').value = this.editingSalesRep.email || '';
        document.getElementById('salesRepCommissionRate').value = this.editingSalesRep.commissionRate || 0;
        document.getElementById('salesRepStatus').value = this.editingSalesRep.status || 'active';
        document.getElementById('salesRepNotes').value = this.editingSalesRep.notes || '';
    },

    async saveSalesRep() {
        try {
            const formData = this.collectSalesRepData();
            
            if (!this.validateSalesRepForm(formData)) {
                return;
            }

            showLoading();

            if (this.editingSalesRep) {
                await Collections.updateSalesRep(this.editingSalesRep.id, formData);
                if (typeof showSuccess === 'function') {
                    showSuccess('تم تحديث المندوب بنجاح');
                } else {
                    console.log('✅ تم تحديث المندوب بنجاح');
                }
            } else {
                await Collections.addSalesRep(formData);
                if (typeof showSuccess === 'function') {
                    showSuccess('تم إضافة المندوب بنجاح');
                } else {
                    console.log('✅ تم إضافة المندوب بنجاح');
                }
            }

            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('salesRepModal'));
            modal.hide();

            // Reload data
            await this.loadSalesReps();
            this.updateDashboard();
            this.renderSalesRepsTable();

            hideLoading();

        } catch (error) {
            console.error('Error saving sales rep:', error);
            if (typeof showError === 'function') {
                showError('فشل في حفظ المندوب: ' + error.message);
            } else {
                console.error('❌ فشل في حفظ المندوب:', error.message);
            }
            hideLoading();
        }
    },

    collectSalesRepData() {
        const data = {
            name: document.getElementById('salesRepName').value.trim(),
            type: document.getElementById('salesRepType').value,
            phone: document.getElementById('salesRepPhone').value.trim(),
            email: document.getElementById('salesRepEmail').value.trim(),
            commissionRate: parseFloat(document.getElementById('salesRepCommissionRate').value) || 0,
            status: document.getElementById('salesRepStatus').value,
            notes: document.getElementById('salesRepNotes').value.trim(),
            updatedAt: new Date()
        };
        
        // Only include createdAt for new records
        if (!this.editingSalesRep) {
            data.createdAt = new Date();
        }
        
        return data;
    },

    validateSalesRepForm(data) {
        if (!data.name) {
            if (typeof showError === 'function') {
                showError('يرجى إدخال اسم المندوب');
            } else {
                console.error('❌ يرجى إدخال اسم المندوب');
            }
            return false;
        }

        if (!data.type) {
            if (typeof showError === 'function') {
                showError('يرجى اختيار نوع المندوب');
            } else {
                console.error('❌ يرجى اختيار نوع المندوب');
            }
            return false;
        }

        return true;
    },

    async editSalesRep(salesRepId) {
        try {
            const salesRep = await Collections.getSalesRep(salesRepId);
            this.editingSalesRep = salesRep;
            this.showSalesRepModal();
        } catch (error) {
            console.error('Error loading sales rep:', error);
            if (typeof showError === 'function') {
                showError('فشل في تحميل بيانات المندوب: ' + error.message);
            } else {
                console.error('❌ فشل في تحميل بيانات المندوب:', error.message);
            }
        }
    },

    async deleteSalesRep(salesRepId) {
        try {
            const result = await Swal.fire({
                title: 'هل أنت متأكد؟',
                text: 'لن تتمكن من التراجع عن هذا الإجراء!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'نعم، احذف!',
                cancelButtonText: 'إلغاء'
            });

            if (result.isConfirmed) {
                showLoading();
                
                await Collections.deleteSalesRep(salesRepId);
                
                if (typeof showSuccess === 'function') {
                    showSuccess('تم حذف المندوب بنجاح');
                } else {
                    console.log('✅ تم حذف المندوب بنجاح');
                }

                // Reload data
                await this.loadSalesReps();
                this.updateDashboard();
                this.renderSalesRepsTable();

                hideLoading();
            }
        } catch (error) {
            console.error('Error deleting sales rep:', error);
            if (typeof showError === 'function') {
                showError('فشل في حذف المندوب: ' + error.message);
            } else {
                console.error('❌ فشل في حذف المندوب:', error.message);
            }
            hideLoading();
        }
    },

    generateSalesRepReport() {
        const dateFrom = document.getElementById('reportDateFrom').value;
        const dateTo = document.getElementById('reportDateTo').value;
        const reportType = document.getElementById('reportType').value;

        const reportContent = document.getElementById('salesRepReportContent');
        
        if (reportType === 'summary') {
            this.generateSummaryReport(reportContent);
        } else if (reportType === 'performance') {
            this.generatePerformanceReport(reportContent);
        } else if (reportType === 'commissions') {
            this.generateCommissionsReport(reportContent);
        }
    },

    generateSummaryReport(container) {
        const activeSalesReps = this.salesReps.filter(rep => rep.status === 'active');
        const inactiveSalesReps = this.salesReps.filter(rep => rep.status === 'inactive');
        const salesReps = this.salesReps.filter(rep => rep.type === 'sales');
        const purchaseReps = this.salesReps.filter(rep => rep.type === 'purchases');

        container.innerHTML = `
            <div class="report-summary">
                <h5><i class="fas fa-chart-pie"></i> ملخص المندوبين</h5>
                <div class="row">
                    <div class="col-md-6">
                        <div class="summary-item">
                            <strong>إجمالي المندوبين:</strong> ${this.salesReps.length}
                        </div>
                        <div class="summary-item">
                            <strong>المندوبين النشطين:</strong> ${activeSalesReps.length}
                        </div>
                        <div class="summary-item">
                            <strong>المندوبين غير النشطين:</strong> ${inactiveSalesReps.length}
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="summary-item">
                            <strong>مندوبي المبيعات:</strong> ${salesReps.length}
                        </div>
                        <div class="summary-item">
                            <strong>مندوبي المشتريات:</strong> ${purchaseReps.length}
                        </div>
                        <div class="summary-item">
                            <strong>متوسط نسبة العمولة:</strong> ${this.calculateAverageCommission()}%
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    generatePerformanceReport(container) {
        container.innerHTML = `
            <div class="report-performance">
                <h5><i class="fas fa-chart-line"></i> تقرير أداء المندوبين</h5>
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>اسم المندوب</th>
                                <th>النوع</th>
                                <th>نسبة العمولة</th>
                                <th>الحالة</th>
                                <th>تاريخ الإنشاء</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.salesReps.map(rep => {
                                const name = typeof sanitizeInput !== 'undefined' ? sanitizeInput(rep.name) : rep.name;
                                return `
                                <tr>
                                    <td>${name}</td>
                                    <td>
                                        <span class="badge ${rep.type === 'sales' ? 'bg-success' : 'bg-info'}">
                                            ${rep.type === 'sales' ? 'مبيعات' : 'مشتريات'}
                                        </span>
                                    </td>
                                    <td>${rep.commissionRate || 0}%</td>
                                    <td>
                                        <span class="badge ${rep.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                                            ${rep.status === 'active' ? 'نشط' : 'غير نشط'}
                                        </span>
                                    </td>
                                    <td>${new Date(rep.createdAt).toLocaleDateString('ar-IQ')}</td>
                                </tr>
                            `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    generateCommissionsReport(container) {
        const totalCommissions = this.salesReps.reduce((sum, rep) => sum + (rep.totalCommissions || 0), 0);
        const averageCommission = this.calculateAverageCommission();

        container.innerHTML = `
            <div class="report-commissions">
                <h5><i class="fas fa-dollar-sign"></i> تقرير العمولات</h5>
                <div class="row mb-3">
                    <div class="col-md-4">
                        <div class="commission-summary">
                            <h6>إجمالي العمولات</h6>
                            <h4>${totalCommissions.toLocaleString('ar-IQ')}</h4>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="commission-summary">
                            <h6>متوسط نسبة العمولة</h6>
                            <h4>${averageCommission}%</h4>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="commission-summary">
                            <h6>عدد المندوبين</h6>
                            <h4>${this.salesReps.length}</h4>
                        </div>
                    </div>
                </div>
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>اسم المندوب</th>
                                <th>نسبة العمولة</th>
                                <th>إجمالي العمولات</th>
                                <th>النوع</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.salesReps.map(rep => {
                                const name = typeof sanitizeInput !== 'undefined' ? sanitizeInput(rep.name) : rep.name;
                                return `
                                <tr>
                                    <td>${name}</td>
                                    <td>${rep.commissionRate || 0}%</td>
                                    <td>${(rep.totalCommissions || 0).toLocaleString('ar-IQ')}</td>
                                    <td>
                                        <span class="badge ${rep.type === 'sales' ? 'bg-success' : 'bg-info'}">
                                            ${rep.type === 'sales' ? 'مبيعات' : 'مشتريات'}
                                        </span>
                                    </td>
                                </tr>
                            `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    calculateAverageCommission() {
        if (this.salesReps.length === 0) return 0;
        const totalCommission = this.salesReps.reduce((sum, rep) => sum + (rep.commissionRate || 0), 0);
        return (totalCommission / this.salesReps.length).toFixed(2);
    }
};

console.log('✅ Sales Reps module loaded');

