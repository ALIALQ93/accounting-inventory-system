/**
 * Vouchers Module - إدارة السندات
 * Professional voucher management with detailed entries
 */

const VouchersModule = {
    currentPage: 1,
    itemsPerPage: 10,
    allVouchers: [],
    filteredVouchers: [],
    editingVoucher: null,
    currentVoucherType: 'all',
    
    // Voucher entry items
    voucherEntries: [],
    
    // Column visibility settings
    columnSettings: {
        accountCode: true,
        credit: true,
        description: true,
        currency: true,
        costCenter: true,
        receipt: true
    },
    
    // Cache for currencies
    currenciesCache: {
        data: null,
        timestamp: null,
        duration: 10 * 60 * 1000 // 10 minutes
    },
    
    // Cache for cost centers
    costCentersCache: {
        data: null,
        timestamp: null,
        duration: 10 * 60 * 1000 // 10 minutes
    },
    
    // Debounce timer for updateTotal
    updateTotalDebounceTimer: null,

    /**
     * Get HTML for vouchers module
     */
    getHTML() {
        return `
            <section id="vouchers" class="vouchers-module">
                <!-- Header -->
                <div class="vouchers-header-modern">
                    <div class="header-content-wrapper">
                        <div class="header-icon-box">
                            <i class="fas fa-file-invoice-dollar"></i>
                        </div>
                        <div class="header-text-box">
                            <h1 class="header-title">السندات</h1>
                            <p class="header-subtitle">إدارة سندات القبض والصرف والقيد</p>
                        </div>
                    </div>
                    <div class="header-actions-box">
                        <button class="btn-modern btn-modern-success" id="addReceiptVoucherBtn">
                            <i class="fas fa-arrow-down"></i>
                            <span>سند قبض</span>
                        </button>
                        <button class="btn-modern btn-modern-danger" id="addPaymentVoucherBtn">
                            <i class="fas fa-arrow-up"></i>
                            <span>سند صرف</span>
                        </button>
                        <button class="btn-modern btn-modern-primary" id="addJournalVoucherBtn">
                            <i class="fas fa-book"></i>
                            <span>سند يومية</span>
                        </button>
                        <button class="btn-modern btn-modern-info" id="addEntryVoucherBtn">
                            <i class="fas fa-edit"></i>
                            <span>سند قيد</span>
                        </button>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="vouchers-stats-modern">
                    <div class="stat-card-modern stat-primary">
                        <div class="stat-icon">
                            <i class="fas fa-file-invoice"></i>
                        </div>
                        <div class="stat-details">
                            <div class="stat-value" id="totalVouchersCount">0</div>
                            <div class="stat-label">إجمالي السندات</div>
                        </div>
                    </div>
                    
                    <div class="stat-card-modern stat-success">
                        <div class="stat-icon">
                            <i class="fas fa-arrow-down"></i>
                        </div>
                        <div class="stat-details">
                            <div class="stat-value" id="receiptVouchersCount">0</div>
                            <div class="stat-label">سندات القبض</div>
                        </div>
                    </div>
                    
                    <div class="stat-card-modern stat-danger">
                        <div class="stat-icon">
                            <i class="fas fa-arrow-up"></i>
                        </div>
                        <div class="stat-details">
                            <div class="stat-value" id="paymentVouchersCount">0</div>
                            <div class="stat-label">سندات الصرف</div>
                        </div>
                    </div>
                    
                    <div class="stat-card-modern stat-info">
                        <div class="stat-icon">
                            <i class="fas fa-book"></i>
                        </div>
                        <div class="stat-details">
                            <div class="stat-value" id="journalVouchersCount">0</div>
                            <div class="stat-label">سندات اليومية</div>
                        </div>
                    </div>
                    
                    <div class="stat-card-modern stat-warning">
                        <div class="stat-icon">
                            <i class="fas fa-edit"></i>
                        </div>
                        <div class="stat-details">
                            <div class="stat-value" id="entryVouchersCount">0</div>
                            <div class="stat-label">سندات القيد</div>
                        </div>
                    </div>
                    
                    <div class="stat-card-modern stat-secondary">
                        <div class="stat-icon">
                            <i class="fas fa-file-contract"></i>
                        </div>
                        <div class="stat-details">
                            <div class="stat-value" id="generalEntriesCount">0</div>
                            <div class="stat-label">القيود العامة</div>
                        </div>
                    </div>
                </div>

                <!-- Type Tabs -->
                <div class="vouchers-tabs-modern">
                    <button class="tab-btn active" data-type="all" id="allVouchersTab">
                        <i class="fas fa-list"></i>
                        <span>جميع السندات</span>
                    </button>
                    <button class="tab-btn" data-type="receipt" id="receiptVouchersTab">
                        <i class="fas fa-arrow-down"></i>
                        <span>سندات القبض</span>
                    </button>
                    <button class="tab-btn" data-type="payment" id="paymentVouchersTab">
                        <i class="fas fa-arrow-up"></i>
                        <span>سندات الصرف</span>
                    </button>
                    <button class="tab-btn" data-type="journal" id="journalVouchersTab">
                        <i class="fas fa-book"></i>
                        <span>سندات اليومية</span>
                    </button>
                    <button class="tab-btn" data-type="entry" id="entryVouchersTab">
                        <i class="fas fa-edit"></i>
                        <span>سندات القيد</span>
                    </button>
                    <button class="tab-btn" data-type="general" id="generalEntriesTab">
                        <i class="fas fa-file-contract"></i>
                        <span>القيود العامة</span>
                    </button>
                </div>

                <!-- Controls -->
                <div class="vouchers-controls-modern">
                    <div class="controls-left">
                        <div class="date-range-modern">
                            <i class="fas fa-calendar"></i>
                            <input type="date" class="date-input-modern" id="voucherDateFrom" placeholder="من تاريخ">
                            <span>إلى</span>
                            <input type="date" class="date-input-modern" id="voucherDateTo" placeholder="إلى تاريخ">
                        </div>
                    </div>
                    
                    <div class="controls-right">
                        <div class="search-box-modern">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" class="search-input-modern" id="searchVouchers" 
                                   placeholder="ابحث عن سند...">
                        </div>
                        
                        <button class="btn-modern btn-modern-clear" id="clearVoucherFiltersBtn">
                            <i class="fas fa-times-circle"></i>
                            <span>مسح</span>
                        </button>
                    </div>
                </div>

                <!-- Vouchers Table -->
                <div class="vouchers-table-modern">
                    <div class="table-wrapper-modern">
                        <table class="table-modern vouchers-table">
                            <thead>
                                <tr>
                                    <th width="10%">رقم السند</th>
                                    <th width="10%">التاريخ</th>
                                    <th width="12%">النوع</th>
                                    <th width="18%">الحساب المقابل</th>
                                    <th width="15%">المبلغ الإجمالي</th>
                                    <th width="12%">مركز الكلفة</th>
                                    <th width="10%">الحالة</th>
                                    <th width="13%">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="vouchersTableBody">
                                <!-- Table rows will be rendered here -->
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Pagination -->
                    <div class="pagination-wrapper">
                        <nav>
                            <ul class="pagination mb-0" id="vouchersPagination"></ul>
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
     * Initialize the Vouchers module.
     */
    async initialize() {
        try {
            console.log('ًں“‌ Initializing Vouchers module...');
            
            // Check if required DOM elements exist
            if (!document.getElementById('content-area')) {
                throw new Error('Content area not found');
            }
            
            this.render();
            console.log('ًں“‌ Rendered HTML successfully');
            
            this.setupEventListeners();
            console.log('ًں“‌ Setup event listeners successfully');
            
            await this.loadVouchers();
            console.log('ًں"‌ Loaded vouchers successfully');
            
            // Setup real-time sync
            this.setupVouchersSync();
            
            console.log('âœ… Vouchers module initialized successfully');
        } catch (error) {
            console.error('â‌Œ Error initializing Vouchers module:', error);
            console.error('â‌Œ Error stack:', error.stack);
            
            // Try to show error message if possible
            try {
                this.showError('خطأ في تهيئة السندات: ' + error.message);
            } catch (showError) {
                console.error('â‌Œ Could not show error message:', showError);
                // Fallback: show browser alert
                alert('خطأ في تحميل وحدة السندات: ' + error.message);
            }
            
            // Re-throw error to be caught by app.js
            throw error;
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
        // Add voucher buttons - use newVoucher for clarity
        document.getElementById('addReceiptVoucherBtn')?.addEventListener('click', () => {
            this.newVoucher('receipt');
        });
        
        document.getElementById('addPaymentVoucherBtn')?.addEventListener('click', () => {
            this.newVoucher('payment');
        });
        
        document.getElementById('addJournalVoucherBtn')?.addEventListener('click', () => {
            this.newVoucher('journal');
        });
        
        document.getElementById('addEntryVoucherBtn')?.addEventListener('click', () => {
            this.newVoucher('entry');
        });

        // Tab buttons
        document.querySelectorAll('.vouchers-tabs-modern .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.currentTarget.dataset.type;
                this.switchVoucherType(type);
            });
        });

        // Search vouchers
        document.getElementById('searchVouchers')?.addEventListener('input', () => {
            this.filterVouchers();
        });

        // Date filters
        document.getElementById('voucherDateFrom')?.addEventListener('change', () => {
            this.filterVouchers();
        });
        
        document.getElementById('voucherDateTo')?.addEventListener('change', () => {
            this.filterVouchers();
        });

        // Clear filters
        document.getElementById('clearVoucherFiltersBtn')?.addEventListener('click', () => {
            this.clearFilters();
        });
        
        // Column visibility checkboxes
        document.querySelectorAll('#columnSettingsModal input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleColumn(e.target.id, e.target.checked);
            });
        });
        
        // ✅ Account search listeners will be set up when modal opens (setupAccountSearchListeners)
        // This prevents duplicate listeners and ensures fresh listeners each time
    },

    /**
     * Load vouchers from Firebase.
     */
    async loadVouchers() {
        try {
            console.log('ًں“ٹ Loading vouchers from database...');
            
            if (!db) {
                console.error('â‌Œ Firebase database not initialized');
                this.showError('قاعدة البيانات غير متصلة. يرجى تسجيل الدخول أولاً.');
                return;
            }

            const vouchersSnapshot = await db.collection('vouchers')
                .orderBy('date', 'desc')
                .get();

            this.allVouchers = [];
            vouchersSnapshot.forEach(doc => {
                this.allVouchers.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.filteredVouchers = [...this.allVouchers];
            // Only render table if the module is currently visible
            const vouchersModule = document.querySelector('.vouchers-module');
            if (vouchersModule && vouchersModule.offsetParent !== null) {
                this.renderTable();
            } else {
                console.log('ℹ️ Vouchers module not visible, skipping table render');
            }
            this.updateStats();

            console.log(`âœ… Loaded ${this.allVouchers.length} vouchers from database`);
        } catch (error) {
            console.error('â‌Œ Error loading vouchers:', error);
            
            if (error.code === 'permission-denied') {
                this.showError('ليس لديك صلاحية الوصول إلى السندات.');
            } else {
                this.showError('خطأ في تحميل السندات: ' + (error.message || 'خطأ غير معروف'));
            }
        }
    },

    /**
     * Switch voucher type tab
     */
    async switchVoucherType(type) {
        this.currentVoucherType = type;
        
        document.querySelectorAll('.vouchers-tabs-modern .tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.vouchers-tabs-modern .tab-btn[data-type="${type}"]`)?.classList.add('active');
        
        // âڑ ï¸ڈ IMPORTANT: General entries are loaded from a different collection
        if (type === 'general') {
            await this.loadAndDisplayGeneralEntries();
        } else {
        this.filterVouchers();
        }
    },

    /**
     * Load and display general entries from separate collection
     */
    async loadAndDisplayGeneralEntries() {
        try {
            console.log('ًں“ٹ Loading general entries from database...');
            showLoading();
            
            if (!db) {
                hideLoading();
                this.showError('قاعدة البيانات غير متصلة');
                return;
            }

            // Load general entries from separate collection
            // ⚠️ Note: We can't use orderBy with FieldValue.serverTimestamp(), so we'll sort manually if needed
            let generalEntriesSnapshot;
            try {
                generalEntriesSnapshot = await db.collection('generalEntries')
                    .orderBy('date', 'desc')
                    .get();
            } catch (orderByError) {
                // If orderBy fails (due to FieldValue issue), get all entries and sort manually
                console.warn('⚠️ orderBy failed, fetching all entries and sorting manually:', orderByError);
                generalEntriesSnapshot = await db.collection('generalEntries').get();
            }

            const generalEntries = [];
            generalEntriesSnapshot.forEach(doc => {
                const data = doc.data();
                // Clean FieldValue objects from data
                const cleanedData = this.cleanFieldValueObjects(data);
                generalEntries.push({
                    id: doc.id,
                    ...cleanedData
                });
            });
            
            // Sort by date if orderBy failed
            if (generalEntries.length > 0 && generalEntries[0].date) {
                generalEntries.sort((a, b) => {
                    const dateA = a.date instanceof Date ? a.date : (a.date?.toDate ? a.date.toDate() : new Date(a.date));
                    const dateB = b.date instanceof Date ? b.date : (b.date?.toDate ? b.date.toDate() : new Date(b.date));
                    return dateB - dateA; // Descending order
                });
            }

            console.log(`âœ… Loaded ${generalEntries.length} general entries`);

            // Display in table
            this.renderGeneralEntriesTable(generalEntries);
            hideLoading();

        } catch (error) {
            console.error('â‌Œ Error loading general entries:', error);
            hideLoading();
            
            if (error.code === 'permission-denied') {
                this.showError('ليس لديك صلاحية الوصول إلى القيود العامة');
            } else {
                this.showError('خطأ في تحميل القيود العامة: ' + error.message);
            }
        }
    },

    /**
     * Render general entries in table
     */
    renderGeneralEntriesTable(generalEntries) {
        const tbody = document.getElementById('vouchersTableBody');
        
        // ⚠️ Safety check: Ensure tbody exists before trying to update it
        if (!tbody) {
            console.warn('⚠️ vouchersTableBody not found in DOM, skipping general entries table render');
            return;
        }
        
        tbody.innerHTML = '';

        if (generalEntries.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4">
                        <i class="fas fa-file-contract fa-3x text-muted mb-3"></i>
                        <p class="text-muted">لا توجد قيود عامة</p>
                    </td>
                </tr>
            `;
            return;
        }

        generalEntries.forEach(entry => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="voucher-number-cell">${entry.voucherNumber || '-'}</div>
                </td>
                <td>
                    <div class="voucher-date-cell">${this.formatDate(entry.date)}</div>
                </td>
                <td class="text-center">
                    <span class="type-badge type-${entry.voucherType}">
                        ${this.getTypeIcon(entry.voucherType)} ${this.getTypeText(entry.voucherType)}
                    </span>
                </td>
                <td>
                    <div class="account-cell">
                        <small class="text-muted">${entry.entries?.length || 0} قيد</small>
                    </div>
                </td>
                <td class="text-end">
                    <div class="amount-cell">
                        <strong class="text-primary">${this.formatCurrency(entry.totalDebit || 0)}</strong>
                        <small class="d-block text-muted">مدين</small>
                        <strong class="text-success">${this.formatCurrency(entry.totalCredit || 0)}</strong>
                        <small class="d-block text-muted">دائن</small>
                    </div>
                </td>
                <td>
                    <div class="cost-center-cell">-</div>
                </td>
                <td class="text-center">
                    <span class="status-badge ${entry.isBalanced ? 'status-posted' : 'status-draft'}">
                        ${entry.isBalanced ? 
                            '<i class="fas fa-check-circle"></i> متوازن' : 
                            '<i class="fas fa-exclamation-triangle"></i> غير متوازن'
                        }
                    </span>
                </td>
                <td class="text-center">
                    <div class="action-buttons-cell">
                        <button class="btn-action btn-action-view" onclick="VouchersModule.viewGeneralEntryById('${entry.id}')" title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    },

    /**
     * Filter vouchers
     */
    filterVouchers() {
        const searchTerm = document.getElementById('searchVouchers').value.toLowerCase();
        const dateFrom = document.getElementById('voucherDateFrom').value;
        const dateTo = document.getElementById('voucherDateTo').value;

        this.filteredVouchers = this.allVouchers.filter(voucher => {
            const matchesSearch = !searchTerm ||
                voucher.voucherNumber?.toLowerCase().includes(searchTerm) ||
                voucher.contraAccountName?.toLowerCase().includes(searchTerm);

            const matchesType = this.currentVoucherType === 'all' || voucher.type === this.currentVoucherType;

            let matchesDate = true;
            if (dateFrom || dateTo) {
                const voucherDate = voucher.date;
                if (dateFrom && voucherDate < dateFrom) matchesDate = false;
                if (dateTo && voucherDate > dateTo) matchesDate = false;
            }

            return matchesSearch && matchesType && matchesDate;
        });

        this.currentPage = 1;
        this.renderTable();
        this.updateStats();
    },

    /**
     * Clear all filters.
     */
    clearFilters() {
        document.getElementById('searchVouchers').value = '';
        document.getElementById('voucherDateFrom').value = '';
        document.getElementById('voucherDateTo').value = '';
        this.filterVouchers();
    },

    /**
     * Render the vouchers table.
     */
    renderTable() {
        const tbody = document.getElementById('vouchersTableBody');
        
        // ⚠️ Safety check: Ensure tbody exists before trying to update it
        if (!tbody) {
            console.warn('⚠️ vouchersTableBody not found in DOM, skipping table render');
            return;
        }
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageVouchers = this.filteredVouchers.slice(startIndex, endIndex);

        tbody.innerHTML = '';

        if (pageVouchers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4">
                        <i class="fas fa-file-invoice fa-3x text-muted mb-3"></i>
                        <p class="text-muted">لا توجد سندات. اضغط على أحد الأزرار للبدء</p>
                    </td>
                </tr>
            `;
            this.renderPagination();
            return;
        }

        pageVouchers.forEach(voucher => {
            const totalAmount = voucher.entries?.reduce((sum, entry) => sum + (parseFloat(entry.credit) || 0), 0) || voucher.amount || 0;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="voucher-number-cell">${voucher.voucherNumber || '-'}</div>
                </td>
                <td>
                    <div class="voucher-date-cell">${this.formatDate(voucher.date)}</div>
                </td>
                <td class="text-center">
                    <span class="type-badge type-${voucher.type}">
                        ${this.getTypeIcon(voucher.type)} ${this.getTypeText(voucher.type)}
                    </span>
                </td>
                <td>
                    <div class="account-cell">
                        <div class="fw-bold">${voucher.contraAccountName || voucher.contraAccountCode || '-'}</div>
                    </div>
                </td>
                <td class="text-end">
                    <div class="amount-cell">
                        <strong>${this.formatCurrency(totalAmount)}</strong>
                        <small>${voucher.mainCurrency || voucher.currency || 'IQD'}</small>
                    </div>
                </td>
                <td class="text-center">
                    <div class="cost-center-cell">${voucher.costCenterName || '-'}</div>
                </td>
                <td class="text-center">
                    <span class="status-badge ${this.getStatusClass(voucher.status)}">
                        ${this.getStatusText(voucher.status)}
                    </span>
                </td>
                <td class="text-center">
                    <div class="action-buttons">
                        <button class="action-btn-modern action-view" 
                                onclick="VouchersModule.openVoucherInViewMode('${voucher.id}')" 
                                title="عرض">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn-modern action-print" 
                                onclick="VouchersModule.printVoucher('${voucher.id}')" 
                                title="طباعة">
                            <i class="fas fa-print"></i>
                        </button>
                        ${voucher.status === 'posted' ? `
                        <button class="action-btn-modern action-info" 
                                onclick="VouchersModule.viewGeneralEntry('${voucher.id}')" 
                                title="عرض القيد العام">
                            <i class="fas fa-file-contract"></i>
                        </button>
                        ` : ''}
                        <button class="action-btn-modern action-edit" 
                                onclick="VouchersModule.editVoucher('${voucher.id}')" 
                                title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn-modern action-delete" 
                                onclick="VouchersModule.deleteVoucher('${voucher.id}')" 
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
     * Render pagination
     */
    renderPagination() {
        const totalPages = Math.ceil(this.filteredVouchers.length / this.itemsPerPage);
        const pagination = document.getElementById('vouchersPagination');

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="VouchersModule.goToPage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="VouchersModule.goToPage(${i})">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="VouchersModule.goToPage(${this.currentPage + 1})">
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
        const totalPages = Math.ceil(this.filteredVouchers.length / this.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            // Only render table if the module is currently visible
            const vouchersModule = document.querySelector('.vouchers-module');
            if (vouchersModule && vouchersModule.offsetParent !== null) {
                this.renderTable();
            } else {
                console.log('ℹ️ Vouchers module not visible, skipping table render');
            }
        }
    },

    /**
     * Update statistics.
     */
    async updateStats() {
        const totalCount = this.allVouchers.length;
        const receiptCount = this.allVouchers.filter(v => v.type === 'receipt').length;
        const paymentCount = this.allVouchers.filter(v => v.type === 'payment').length;
        const journalCount = this.allVouchers.filter(v => v.type === 'journal').length;
        const entryCount = this.allVouchers.filter(v => v.type === 'entry').length;
        
        // âڑ ï¸ڈ IMPORTANT: General entries are in a SEPARATE collection, not vouchers
        let generalCount = 0;
        try {
            if (db) {
                const generalEntriesSnapshot = await db.collection('generalEntries').get();
                generalCount = generalEntriesSnapshot.size;
            }
        } catch (error) {
            console.warn('âڑ ï¸ڈ Could not load general entries count:', error);
            // Don't show error to user, just keep count as 0
        }

        // ⚠️ Safety check: Ensure elements exist before updating
        const totalVouchersEl = document.getElementById('totalVouchersCount');
        const receiptVouchersEl = document.getElementById('receiptVouchersCount');
        const paymentVouchersEl = document.getElementById('paymentVouchersCount');
        const journalVouchersEl = document.getElementById('journalVouchersCount');
        const entryVouchersEl = document.getElementById('entryVouchersCount');
        const generalEntriesEl = document.getElementById('generalEntriesCount');
        
        if (totalVouchersEl) totalVouchersEl.textContent = totalCount;
        if (receiptVouchersEl) receiptVouchersEl.textContent = receiptCount;
        if (paymentVouchersEl) paymentVouchersEl.textContent = paymentCount;
        if (journalVouchersEl) journalVouchersEl.textContent = journalCount;
        if (entryVouchersEl) entryVouchersEl.textContent = entryCount;
        if (generalEntriesEl) generalEntriesEl.textContent = generalCount;
    },

    /**
     * Show add/edit voucher modal
     */
    async showAddEditVoucherModal(voucherType = 'receipt', voucherId = null) {
        // Initialize for the specific type first
        await this.initializeVoucherModal(voucherType, voucherId);
        
        // Then show modal
        const modalEl = document.getElementById('voucherModal');
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();

        // Re-setup event listeners for modal elements
        this.setupModalEventListeners();
    },
    
    /**
     * Setup event listeners for modal elements
     */
    setupModalEventListeners() {
        // Add entry button
        const addEntryBtn = document.getElementById('addEntryBtn');
        if (addEntryBtn) {
            // Clone to remove old listeners
            const newBtn = addEntryBtn.cloneNode(true);
            addEntryBtn.parentNode.replaceChild(newBtn, addEntryBtn);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.addVoucherEntry();
            });
        }
        
        // Column settings button
        const colSettingsBtn = document.getElementById('columnSettingsBtn');
        if (colSettingsBtn) {
            const newBtn = colSettingsBtn.cloneNode(true);
            colSettingsBtn.parentNode.replaceChild(newBtn, colSettingsBtn);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showColumnSettings();
            });
        }
        
        // Save voucher button
        const saveBtn = document.getElementById('saveVoucherBtn');
        if (saveBtn) {
            const newBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newBtn, saveBtn);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveVoucher();
            });
        }
        
        // Search contra account button
        const searchContraBtn = document.getElementById('searchContraAccountBtn');
        if (searchContraBtn) {
            const newBtn = searchContraBtn.cloneNode(true);
            searchContraBtn.parentNode.replaceChild(newBtn, searchContraBtn);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showContraAccountSearch();
            });
        }
        
        // Contra account display input
        const contraDisplay = document.getElementById('voucherContraAccountDisplay');
        if (contraDisplay) {
            const newInput = contraDisplay.cloneNode(true);
            contraDisplay.parentNode.replaceChild(newInput, contraDisplay);
            
            newInput.addEventListener('click', (e) => {
                e.preventDefault();
                this.showContraAccountSearch();
            });
        }
        
        // Voucher type change
        const typeSelect = document.getElementById('voucherType');
        if (typeSelect) {
            const newSelect = typeSelect.cloneNode(true);
            // Preserve selected value
            const selectedValue = typeSelect.value;
            typeSelect.parentNode.replaceChild(newSelect, typeSelect);
            newSelect.value = selectedValue;
            
            newSelect.addEventListener('change', (e) => {
                // Clear existing entries when switching type — old rows have wrong structure
                const tbody = document.getElementById('voucherEntriesBody');
                if (tbody) tbody.innerHTML = '';
                this.clearTotals();
                this.updateVoucherFormByType(e.target.value);
                this.addVoucherEntry();
            });
        }
        
        // Main currency change - update contra account info and totals
        const mainCurrencySelect = document.getElementById('voucherMainCurrency');
        if (mainCurrencySelect) {
            const newSelect = mainCurrencySelect.cloneNode(true);
            const selectedValue = mainCurrencySelect.value;
            mainCurrencySelect.parentNode.replaceChild(newSelect, mainCurrencySelect);
            newSelect.value = selectedValue;
            
            newSelect.addEventListener('change', async (e) => {
                // Update contra account info if selected
                const contraAccountId = document.getElementById('voucherContraAccount').value;
                if (contraAccountId) {
                    await this.loadContraAccountInfo(contraAccountId);
                }
                
                // Update totals to reflect new main currency
                this.updateTotal(); // Uses debounce internally
            });
        }
        
        // Navigation buttons
        const prevBtn = document.getElementById('prevVoucherBtn');
        if (prevBtn) {
            const newBtn = prevBtn.cloneNode(true);
            prevBtn.parentNode.replaceChild(newBtn, prevBtn);
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateVoucher('prev');
            });
        }
        
        const nextBtn = document.getElementById('nextVoucherBtn');
        if (nextBtn) {
            const newBtn = nextBtn.cloneNode(true);
            nextBtn.parentNode.replaceChild(newBtn, nextBtn);
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateVoucher('next');
            });
        }
        
        // Update navigation buttons state
        this.updateNavigationButtons();
    },
    
    /**
     * Navigate to next/previous voucher
     */
    navigateVoucher(direction) {
        if (!this.editingVoucher) return;
        
        const currentIndex = this.filteredVouchers.findIndex(v => v.id === this.editingVoucher.id);
        if (currentIndex === -1) return;
        
        let targetIndex = -1;
        if (direction === 'next' && currentIndex < this.filteredVouchers.length - 1) {
            targetIndex = currentIndex + 1;
        } else if (direction === 'prev' && currentIndex > 0) {
            targetIndex = currentIndex - 1;
        }
        
        if (targetIndex >= 0) {
            const targetVoucher = this.filteredVouchers[targetIndex];
            // Close current modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('voucherModal'));
            if (modal) modal.hide();
            
            // Open target voucher
            setTimeout(() => {
                this.editVoucher(targetVoucher.id);
            }, 300);
        }
    },
    
    /**
     * Update navigation buttons state
     */
    updateNavigationButtons() {
        if (!this.editingVoucher) {
            // Hide buttons for new vouchers
            const prevBtn = document.getElementById('prevVoucherBtn');
            const nextBtn = document.getElementById('nextVoucherBtn');
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            return;
        }
        
        const currentIndex = this.filteredVouchers.findIndex(v => v.id === this.editingVoucher.id);
        
        const prevBtn = document.getElementById('prevVoucherBtn');
        const nextBtn = document.getElementById('nextVoucherBtn');
        
        if (prevBtn) {
            prevBtn.style.display = '';
            prevBtn.disabled = currentIndex <= 0;
        }
        
        if (nextBtn) {
            nextBtn.style.display = '';
            nextBtn.disabled = currentIndex >= this.filteredVouchers.length - 1;
        }
    },

    /**
     * Format currency — delegates to the global formatCurrency() from utils.js
     */
    formatCurrency(amount) {
        return formatCurrency(amount);
    },

    /**
     * Format date
     */
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-IQ');
    },

    /**
     * Get type text
     */
    getTypeText(type) {
        const types = {
            'receipt': 'سند قبض',
            'payment': 'سند صرف',
            'journal': 'سند يومية',
            'entry': 'سند قيد',
            'general': 'قيد عام'
        };
        return types[type] || type;
    },

    /**
     * Get type icon
     */
    getTypeIcon(type) {
        const icons = {
            'receipt': '<i class="fas fa-arrow-down"></i>',
            'payment': '<i class="fas fa-arrow-up"></i>',
            'journal': '<i class="fas fa-book"></i>',
            'entry': '<i class="fas fa-edit"></i>',
            'general': '<i class="fas fa-file-contract"></i>'
        };
        return icons[type] || '<i class="fas fa-file"></i>';
    },

    /**
     * Get status class
     */
    getStatusClass(status) {
        return status === 'posted' ? 'status-posted' : 'status-draft';
    },

    /**
     * Get status text
     */
    getStatusText(status) {
        return status === 'posted' ? 'مرحّل' : 'مسودة';
    },

    /**
     * Add a new entry row to the voucher
     */
    addVoucherEntry() {
        const tbody = document.getElementById('voucherEntriesBody');
        if (!tbody) return;
        
        const voucherType = document.getElementById('voucherType').value;
        const rowCount = tbody.children.length + 1;
        const row = document.createElement('tr');
        row.setAttribute('data-entry-index', rowCount);
        
        // Check if it's a journal or entry voucher (has both debit and credit)
        if (voucherType === 'journal' || voucherType === 'entry') {
            row.innerHTML = `
                <td class="text-center">${rowCount}</td>
                <td class="column-account">
                    <div class="input-group input-group-sm">
                        <input type="text" class="form-control form-control-sm entry-account-display"
                               placeholder="اضغط للبحث..." readonly
                               style="cursor: pointer; background: white;">
                        <input type="hidden" class="entry-account-id">
                        <button class="btn btn-outline-primary btn-sm entry-search-btn" type="button">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </td>
                <td class="column-accountCode">
                    <input type="text" class="form-control form-control-sm entry-code" readonly>
                </td>
                <td class="column-debit">
                    <input type="number" class="form-control form-control-sm entry-debit"
                           placeholder="0.00" step="0.01" min="0">
                </td>
                <td class="column-credit">
                    <input type="number" class="form-control form-control-sm entry-credit"
                           placeholder="0.00" step="0.01" min="0">
                </td>
                <td class="column-currency">
                    <select class="form-select form-select-sm entry-currency">
                        <option value="IQD" selected>IQD</option>
                    </select>
                </td>
                <td class="column-exchangeRate">
                    <input type="number" class="form-control form-control-sm entry-exchange-rate"
                           placeholder="1" value="1" step="0.0001" min="0.0001">
                </td>
                <td class="column-localAmount">
                    <input type="number" class="form-control form-control-sm entry-local-amount"
                           placeholder="0.00" readonly style="background: #f8f9fa;">
                </td>
                <td class="column-description">
                    <input type="text" class="form-control form-control-sm entry-description"
                           placeholder="البيان...">
                </td>
                <td class="column-costCenter">
                    <select class="form-select form-select-sm entry-costCenter">
                        <option value="">-</option>
                    </select>
                </td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-danger delete-entry-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        } else {
            // Receipt or Payment voucher
            row.innerHTML = `
                <td class="text-center">${rowCount}</td>
                <td class="column-account">
                    <div class="input-group input-group-sm">
                        <input type="text" class="form-control form-control-sm entry-account-display" 
                               placeholder="اضغط للبحث..." readonly 
                               style="cursor: pointer; background: white;">
                        <input type="hidden" class="entry-account-id">
                        <button class="btn btn-outline-primary btn-sm entry-search-btn" type="button">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                </td>
                <td class="column-accountCode">
                    <input type="text" class="form-control form-control-sm entry-code" readonly>
                </td>
                <td class="column-credit">
                    <input type="number" class="form-control form-control-sm entry-credit" 
                           placeholder="0.00" step="0.01" min="0" required>
                </td>
                <td class="column-currency">
                    <select class="form-select form-select-sm entry-currency">
                        <option value="IQD" selected>IQD</option>
                    </select>
                </td>
                <td class="column-exchangeRate">
                    <input type="number" class="form-control form-control-sm entry-exchange-rate" 
                           placeholder="1" value="1" step="0.0001" min="0.0001">
                </td>
                <td class="column-localAmount">
                    <input type="number" class="form-control form-control-sm entry-local-amount" 
                           placeholder="0.00" readonly style="background: #f8f9fa;">
                </td>
                <td class="column-description">
                    <input type="text" class="form-control form-control-sm entry-description" 
                           placeholder="البيان...">
                </td>
                <td class="column-costCenter">
                    <select class="form-select form-select-sm entry-costCenter">
                        <option value="">-</option>
                    </select>
                </td>
                <td class="column-receipt">
                    <input type="text" class="form-control form-control-sm entry-receipt" 
                           placeholder="رقم الإيصال">
                </td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-danger delete-entry-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
        }
        
        tbody.appendChild(row);
        
        // Populate cost center dropdown
        this.populateEntryCostCenterDropdown(row.querySelector('.entry-costCenter'));
        
        // Populate currency dropdown
        this.populateEntryCurrencyDropdown(row.querySelector('.entry-currency'));
        
        // Add click event to search button
        const searchBtn = row.querySelector('.entry-search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showAccountSearch(row);
            });
        }
        
        // Add click event to display input
        const displayInput = row.querySelector('.entry-account-display');
        if (displayInput) {
            displayInput.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAccountSearch(row);
            });
        }
        
        // Add delete button event
        const deleteBtn = row.querySelector('.delete-entry-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                row.remove();
                this.updateTotal(); // Uses debounce internally
                this.renumberEntries();
            });
        }
        
        // Update total when amounts change (with debounce)
        const creditInput = row.querySelector('.entry-credit');
        if (creditInput) {
            creditInput.addEventListener('input', async () => {
                await this.calculateLocalAmount(row);
                this.updateTotal(); // Uses debounce internally
            });
        }
        
        const debitInput = row.querySelector('.entry-debit');
        if (debitInput) {
            debitInput.addEventListener('input', async () => {
                await this.calculateLocalAmount(row);
                this.updateTotal(); // Uses debounce internally
            });
        }
        
        // Update exchange rate and local amount when currency or rate changes
        const currencySelect = row.querySelector('.entry-currency');
        if (currencySelect) {
            currencySelect.addEventListener('change', async () => {
                await this.loadExchangeRateForRow(row);
                await this.calculateLocalAmount(row);
                this.updateTotal(); // Uses debounce internally
                
                // If this is the first row and contra account is selected, update its info
                const tbody = document.getElementById('voucherEntriesBody');
                if (tbody) {
                    const firstRow = tbody.querySelector('tr');
                    if (firstRow === row) {
                        const contraAccountId = document.getElementById('voucherContraAccount').value;
                        if (contraAccountId) {
                            this.loadContraAccountInfo(contraAccountId);
                        }
                    }
                }
            });
        }
        
        const exchangeRateInput = row.querySelector('.entry-exchange-rate');
        if (exchangeRateInput) {
            exchangeRateInput.addEventListener('input', async () => {
                await this.calculateLocalAmount(row);
                this.updateTotal(); // Uses debounce internally
            });
        }
        
        // Load exchange rate for initial currency (after dropdown is populated)
        setTimeout(() => {
        this.loadExchangeRateForRow(row);
        }, 50);
        
        // Apply column visibility
        this.applyColumnVisibility();
    },
    
    /**
     * Renumber entries after deletion
     */
    renumberEntries() {
        const tbody = document.getElementById('voucherEntriesBody');
        if (!tbody) return;
        
        const rows = tbody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            row.querySelector('td:first-child').textContent = index + 1;
            row.setAttribute('data-entry-index', index + 1);
        });
    },
    
    /**
     * Load exchange rate for a row based on selected currency to main currency
     */
    async loadExchangeRateForRow(row) {
        try {
            const currencySelect = row.querySelector('.entry-currency');
            const exchangeRateInput = row.querySelector('.entry-exchange-rate');
            
            if (!currencySelect || !exchangeRateInput) {
                console.warn('Currency select or exchange rate input not found in row');
                return;
            }
        
            const selectedCurrency = currencySelect.value;
            const mainCurrency = document.getElementById('voucherMainCurrency')?.value;
            
            if (!mainCurrency) {
                exchangeRateInput.value = '1';
                exchangeRateInput.readOnly = false;
                return;
            }
            
            // If same currency, rate is always 1
            if (selectedCurrency === mainCurrency) {
                exchangeRateInput.value = '1';
                exchangeRateInput.readOnly = true;
                return;
            }
            
            // Use cached currencies data
            const { currencies, baseCurrency } = await this.loadCurrencies();
            
            // Calculate exchange rate from selected currency to main currency
            let rate = 1;
            
            if (selectedCurrency === baseCurrency) {
                // Converting from base currency to main currency
                const targetCurrency = currencies[mainCurrency];
                if (targetCurrency) {
                    const targetRate = parseFloat(targetCurrency.exchangeRate || 1);
                    if (targetRate > 0) {
                        rate = targetRate; // matches convertCurrency logic (base to foreign = multiply by rate)
                    }
                }
            } else if (mainCurrency === baseCurrency) {
                // Converting from selected currency to base currency
                const sourceCurrency = currencies[selectedCurrency];
                if (sourceCurrency) {
                    const sourceRate = parseFloat(sourceCurrency.exchangeRate || 1);
                    if (sourceRate > 0) {
                        rate = 1 / sourceRate; // Show reciprocal since convertCurrency divides by rate
                    }
                }
            } else {
                // Converting between two non-base currencies via base currency
                const sourceCurrency = currencies[selectedCurrency];
                const targetCurrency = currencies[mainCurrency];
                
                if (sourceCurrency && targetCurrency) {
                    const sourceRate = parseFloat(sourceCurrency.exchangeRate || 1);
                    const targetRate = parseFloat(targetCurrency.exchangeRate || 1);
                    
                    if (sourceRate > 0 && targetRate > 0) {
                        // Convert selected to base: 1/sourceRate, then base to main: targetRate
                        rate = (1 / sourceRate) * targetRate;
                    }
                }
            }
            
            exchangeRateInput.value = rate.toFixed(6);
            exchangeRateInput.readOnly = false;
            console.log(`✅ Calculated exchange rate from ${selectedCurrency} to ${mainCurrency}: ${rate.toFixed(6)}`);
            
        } catch (error) {
            console.error('❌ Error loading exchange rate:', error);
            const exchangeRateInput = row.querySelector('.entry-exchange-rate');
            if (exchangeRateInput) {
                exchangeRateInput.value = '1';
            exchangeRateInput.readOnly = false;
            }
        }
    },
    
    /**
     * Calculate local amount (in voucher main currency) for a row
     */
    async calculateLocalAmount(row) {
        const voucherType = document.getElementById('voucherType')?.value;
        const localAmountInput = row.querySelector('.entry-local-amount');
        const currencySelect = row.querySelector('.entry-currency');
        
        if (!localAmountInput || !currencySelect) return;
        
        const entryCurrency = currencySelect.value;
        const mainCurrency = document.getElementById('voucherMainCurrency')?.value;
        
        if (!mainCurrency) return;
        
        let entryAmount = 0;
        
        if (voucherType === 'journal') {
            // For journal, use whichever is entered (debit or credit)
            const debitInput = row.querySelector('.entry-debit');
            const creditInput = row.querySelector('.entry-credit');
            const debit = parseFloat(debitInput?.value) || 0;
            const credit = parseFloat(creditInput?.value) || 0;
            entryAmount = debit > 0 ? debit : credit;
        } else {
            // For receipt/payment, use credit
            const creditInput = row.querySelector('.entry-credit');
            entryAmount = parseFloat(creditInput?.value) || 0;
        }
        
        // Convert to main currency if different
        const amountInMainCurrency = await this.convertCurrency(entryAmount, entryCurrency, mainCurrency);
        localAmountInput.value = amountInMainCurrency.toFixed(2);
    },

    /**
     * Show account search modal for entry row
     */
    showAccountSearch(row) {
        this.currentSearchRow = row;
        this.currentSearchTarget = 'entry';
        this.setupAccountSearchListeners();
        this.searchAccounts();
        this._showStackedModal('accountSearchModal');
        
        // ✅ Focus على حقل البحث بعد فتح النافذة
        setTimeout(() => {
            const searchInput = document.getElementById('accountSearchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }, 300);
    },
    
    /**
     * Show account search modal for contra account
     */
    showContraAccountSearch() {
        this.currentSearchRow = null;
        this.currentSearchTarget = 'contra';
        this.setupAccountSearchListeners();
        this.searchAccounts();
        this._showStackedModal('accountSearchModal');
        
        // ✅ Focus على حقل البحث بعد فتح النافذة
        setTimeout(() => {
            const searchInput = document.getElementById('accountSearchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }, 300);
    },
    
    /**
     * Setup account search event listeners
     */
    setupAccountSearchListeners() {
        // Remove old listeners to prevent duplicates
        const searchInput = document.getElementById('accountSearchInput');
        const typeFilter = document.getElementById('accountSearchTypeFilter');
        
        if (searchInput) {
            // Clone to remove old listeners
            const newInput = searchInput.cloneNode(true);
            searchInput.parentNode.replaceChild(newInput, searchInput);
            
            let searchTimeout;
            newInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                // Show loading indicator
                const resultsBody = document.getElementById('accountSearchResults');
                if (resultsBody && e.target.value.trim().length > 0) {
                    resultsBody.innerHTML = `
                        <tr>
                            <td colspan="5" class="text-center py-3">
                                <div class="spinner-border spinner-border-sm text-primary" role="status">
                                    <span class="visually-hidden">جاري البحث...</span>
                                </div>
                                <span class="ms-2">جاري البحث...</span>
                            </td>
                        </tr>
                    `;
                }
                // Debounce: wait 300ms after user stops typing
                searchTimeout = setTimeout(() => {
                    this.searchAccounts();
                }, 300);
            });
        }
        
        if (typeFilter) {
            // Clone to remove old listeners
            const newFilter = typeFilter.cloneNode(true);
            const selectedValue = typeFilter.value;
            typeFilter.parentNode.replaceChild(newFilter, typeFilter);
            newFilter.value = selectedValue;
            
            newFilter.addEventListener('change', () => {
                this.searchAccounts();
            });
        }
    },
    
    /**
     * Search accounts and display results
     */
    async searchAccounts() {
        try {
            const searchTerm = document.getElementById('accountSearchInput')?.value.toLowerCase() || '';
            const typeFilter = document.getElementById('accountSearchTypeFilter')?.value || '';

            // Use ChartOfAccountsModule as the single source of truth
            await ChartOfAccountsModule.getAccounts();
            const filteredAccounts = ChartOfAccountsModule.getLeafAccounts();

            console.log(`✅ Leaf accounts found: ${filteredAccounts.length}`);

            // Apply search/type filters
            const results = [];
            filteredAccounts.forEach(account => {
                const matchesSearch = !searchTerm ||
                    account.name?.toLowerCase().includes(searchTerm) ||
                    account.code?.toLowerCase().includes(searchTerm) ||
                    (account.name2 && account.name2.toLowerCase().includes(searchTerm));

                const matchesType = !typeFilter || account.type === typeFilter;

                if (matchesSearch && matchesType) {
                    results.push(account);
                }
            });
            
            // Sort by code
            results.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
            
            console.log(`✅ Found ${results.length} leaf accounts for search`);
            
            // Display results
            this.displayAccountSearchResults(results);
            
        } catch (error) {
            console.error('Error searching accounts:', error);
            this.showError('خطأ في البحث عن الحسابات');
        }
    },
    
    /**
     * Display account search results
     */
    displayAccountSearchResults(accounts) {
        const tbody = document.getElementById('accountSearchResults');
        if (!tbody) {
            console.error('❌ accountSearchResults tbody not found!');
            return;
        }
        
        console.log(`📊 Displaying ${accounts.length} accounts in search results`);
        tbody.innerHTML = '';
        
        if (accounts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-3 text-muted">
                        <i class="fas fa-search fa-2x mb-2"></i>
                        <p>لا توجد نتائج</p>
                        <small class="text-muted">جرّب البحث بكلمات أخرى أو أزل الفلاتر</small>
                    </td>
                </tr>
            `;
            return;
        }
        
        accounts.forEach(account => {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.className = 'account-search-row';
            row.setAttribute('data-account-id', account.id);
            row.setAttribute('data-account-code', account.code);
            row.setAttribute('data-account-name', account.name);
            
            // Escape account name and code to prevent XSS issues
            const accountCode = (account.code || '').replace(/'/g, "&#39;");
            const accountName = (account.name || '').replace(/'/g, "&#39;");
            const accountName2 = account.name2 ? (account.name2 || '').replace(/'/g, "&#39;") : '';
            
            row.innerHTML = `
                <td><strong>${accountCode}</strong></td>
                <td>${accountName}${accountName2 ? `<br><small class="text-muted">${accountName2}</small>` : ''}</td>
                <td>${this.getAccountTypeText(account.type)}</td>
                <td>${this.getAccountNatureText(account.nature)}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-primary" onclick="VouchersModule.selectAccountFromSearch('${account.id}', '${accountCode}', '${accountName}', event)">
                        <i class="fas fa-check"></i> اختيار
                    </button>
                </td>
            `;
            
            // ✅ إصلاح: إضافة onclick على الصف بالكامل
            row.addEventListener('click', (e) => {
                // Don't trigger if clicking the button
                if (!e.target.closest('button')) {
                    this.selectAccountFromSearch(account.id, accountCode, accountName, e);
                }
            });
            
            // ✅ إضافة تأثير hover
            row.addEventListener('mouseenter', function() {
                this.classList.add('table-active');
            });
            row.addEventListener('mouseleave', function() {
                this.classList.remove('table-active');
            });
            
            tbody.appendChild(row);
        });
        
        // ✅ إصلاح: عرض عدد النتائج
        const countElement = document.getElementById('accountSearchCount');
        if (countElement) {
            countElement.textContent = `تم العثور على ${accounts.length} حساب`;
        }
        
        console.log(`✅ Displayed ${accounts.length} accounts successfully`);
    },
    
    /**
     * Select account from search results
     */
    selectAccountFromSearch(accountId, accountCode, accountName, event) {
        event.preventDefault();
        event.stopPropagation();
        
        if (this.currentSearchTarget === 'entry' && this.currentSearchRow) {
            // Fill entry row
            this.currentSearchRow.querySelector('.entry-account-id').value = accountId;
            this.currentSearchRow.querySelector('.entry-account-display').value = `${accountCode} - ${accountName}`;
            this.currentSearchRow.querySelector('.entry-code').value = accountCode;
            this.currentSearchRow.dataset.accountName = accountName;
        } else if (this.currentSearchTarget === 'contra') {
            // Fill contra account
            document.getElementById('voucherContraAccount').value = accountId;
            document.getElementById('voucherContraAccountDisplay').value = `${accountCode} - ${accountName}`;
            document.getElementById('voucherContraAccount').dataset.accountCode = accountCode;
            document.getElementById('voucherContraAccount').dataset.accountName = accountName;
            
            // Load account balance and currency
            this.loadContraAccountInfo(accountId);
        } else if (this.currentSearchTarget && this.currentSearchTarget.startsWith('settings-contra')) {
            // Fill settings default contra account
            if (window.SettingsModule) {
                SettingsModule.setDefaultContraAccount(accountId, accountCode, accountName);
            }
        }
        
        // Close search modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('accountSearchModal'));
        if (modal) modal.hide();
        
        // Clear search
        if (document.getElementById('accountSearchInput')) {
            document.getElementById('accountSearchInput').value = '';
        }
        if (document.getElementById('accountSearchTypeFilter')) {
            document.getElementById('accountSearchTypeFilter').value = '';
        }
    },
    
    /**
     * Get account type text
     */
    getAccountTypeText(type) {
        const types = {
            'assets': 'أصول',
            'liabilities': 'خصوم',
            'equity': 'حقوق ملكية',
            'revenue': 'إيرادات',
            'expenses': 'مصروفات'
        };
        return types[type] || '-';
    },
    
    /**
     * Get account nature text
     */
    getAccountNatureText(nature) {
        const natures = {
            'debit': 'مدين',
            'credit': 'دائن',
            'both': 'مدين/دائن'
        };
        return natures[nature] || '-';
    },

    /**
     * Populate account dropdown for entry row
     */
    async populateEntryAccountDropdown(selectElement) {
        if (!selectElement) return;

        try {
            await ChartOfAccountsModule.getAccounts();
            const leafAccounts = ChartOfAccountsModule.getLeafAccounts()
                .sort((a, b) => (a.code || '').localeCompare(b.code || ''));

            selectElement.innerHTML = '<option value="">اختر الحساب...</option>';

            leafAccounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account.id;
                option.textContent = `${account.code} - ${account.name}`;
                option.dataset.accountCode = account.code;
                option.dataset.accountName = account.name;
                selectElement.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading accounts:', error);
        }
    },

    /**
     * Populate cost center dropdown for entry row
     */
    async populateEntryCostCenterDropdown(selectElement) {
        if (!selectElement) return;
        
        try {
            // Use cached cost centers data
            const costCenters = await this.loadCostCentersData();
            
            selectElement.innerHTML = '<option value="">-</option>';
            
            costCenters.forEach(cc => {
                const option = document.createElement('option');
                option.value = cc.id;
                option.textContent = `${cc.code} - ${cc.name}`;
                option.dataset.ccName = cc.name;
                selectElement.appendChild(option);
            });
        } catch (error) {
            console.error('❌ Error loading cost centers:', error);
            selectElement.innerHTML = '<option value="">-</option>';
        }
    },
    
    /**
     * Populate currency dropdown for entry row
     */
    async populateEntryCurrencyDropdown(selectElement) {
        if (!selectElement) return;
        
        try {
            // Use cached currencies data
            const { currencies: currenciesObj, baseCurrency } = await this.loadCurrencies();
            
            // Convert currencies object to array and filter active ones
            const currencies = [];
            for (const code in currenciesObj) {
                const currency = currenciesObj[code];
                if (currency.isActive !== false) { // Include if isActive is true or undefined
                    currencies.push({ code, ...currency });
                }
            }
            
            // Sort: base currency first, then by code
            currencies.sort((a, b) => {
                if (a.isBaseCurrency) return -1;
                if (b.isBaseCurrency) return 1;
                return (a.code || '').localeCompare(b.code || '');
            });
            
            selectElement.innerHTML = '';
            
            currencies.forEach(currency => {
                const option = document.createElement('option');
                option.value = currency.code;
                option.textContent = `${currency.code}${currency.symbol ? ' (' + currency.symbol + ')' : ''}`;
                option.dataset.exchangeRate = currency.exchangeRate || 1;
                
                // Select base currency by default
                if (currency.isBaseCurrency) {
                    option.selected = true;
                }
                
                selectElement.appendChild(option);
            });
        } catch (error) {
            console.error('❌ Error loading currencies:', error);
            // Fallback to IQD if error
            selectElement.innerHTML = '<option value="IQD" selected>IQD</option>';
        }
    },

    /**
     * Populate main currency dropdown for voucher
     */
    async populateVoucherMainCurrencyDropdown() {
        const selectElement = document.getElementById('voucherMainCurrency');
        if (!selectElement) return;
        
        try {
            // Load all active currencies
            const currenciesSnapshot = await db.collection('currencies').get();
            
            const currencies = [];
            currenciesSnapshot.forEach(doc => {
                const currency = { id: doc.id, ...doc.data() };
                if (currency.isActive !== false) { // Include if isActive is true or undefined
                    currencies.push(currency);
                }
            });
            
            // Sort: base currency first, then by code
            currencies.sort((a, b) => {
                if (a.isBaseCurrency) return -1;
                if (b.isBaseCurrency) return 1;
                return (a.code || '').localeCompare(b.code || '');
            });
            
            selectElement.innerHTML = '<option value="">اختر العملة...</option>';
            
            currencies.forEach(currency => {
                const option = document.createElement('option');
                option.value = currency.code;
                option.textContent = `${currency.code}${currency.symbol ? ' (' + currency.symbol + ')' : ''}`;
                
                // Select base currency by default
                if (currency.isBaseCurrency) {
                    option.selected = true;
                }
                
                selectElement.appendChild(option);
            });
            
            console.log(`âœ… Loaded ${currencies.length} active currencies for voucher main currency`);
        } catch (error) {
            console.error('â‌Œ Error loading currencies for voucher main currency:', error);
            // Fallback to IQD if error
            selectElement.innerHTML = '<option value="">IQD</option>';
        }
    },

    /**
     * Get exchange rate between two currencies for display purposes
     */
    async getExchangeRate(fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) {
            return 1;
        }
        
        try {
            const amount = await this.convertCurrency(1, fromCurrency, toCurrency);
            return amount;
        } catch (error) {
            console.error('Error getting exchange rate:', error);
            return 1;
        }
    },

    /**
     * Load currencies with cache
     * @returns {Promise<Object>} - Object with currency code as key and currency data as value
     */
    async loadCurrencies() {
        // Check cache first
        if (this.currenciesCache.data && this.currenciesCache.timestamp) {
            const age = Date.now() - this.currenciesCache.timestamp;
            if (age < this.currenciesCache.duration) {
                return this.currenciesCache.data;
            }
        }
        
        // Load from database
        const currenciesSnapshot = await db.collection('currencies').get();
        const currencies = {};
        let baseCurrency = 'IQD';
        
        currenciesSnapshot.forEach(doc => {
            const currency = doc.data();
            currencies[currency.code] = currency;
            if (currency.isBaseCurrency) {
                baseCurrency = currency.code;
            }
        });
        
        // Update cache
        this.currenciesCache.data = { currencies, baseCurrency };
        this.currenciesCache.timestamp = Date.now();
        
        return this.currenciesCache.data;
    },

    /**
     * Invalidate currencies cache
     */
    invalidateCurrenciesCache() {
        this.currenciesCache.data = null;
        this.currenciesCache.timestamp = null;
    },

    /**
     * Convert amount from one currency to another using exchange rates (with cache)
     * 
     * REVERSED Exchange Rate Logic: If USD.exchangeRate = 1500
     * - To convert USD to IQD (base): amount / exchangeRate  
     * - To convert IQD (base) to USD: amount * exchangeRate
     * 
     * Note: This logic was corrected based on user feedback that the previous logic was inverted
     */
    async convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) {
            return amount;
        }

        try {
            // Load currencies (with cache)
            const { currencies, baseCurrency } = await this.loadCurrencies();

            // If converting from foreign currency to base currency
            // REVERSE LOGIC: If USD.exchangeRate = 1500, then amount should be divided, not multiplied
            if (toCurrency === baseCurrency) {
                const sourceCurrency = currencies[fromCurrency];
                if (sourceCurrency) {
                    const rate = parseFloat(sourceCurrency.exchangeRate || 1);
                    if (rate > 0) {
                        return amount / rate; // REVERSED: divide instead of multiply
                    }
                }
                return amount;
            } 
            // If converting from base currency to foreign currency
            // REVERSE LOGIC: If going to USD with rate 1500, multiply instead of divide
            else if (fromCurrency === baseCurrency) {
                const targetCurrency = currencies[toCurrency];
                if (targetCurrency) {
                    const rate = parseFloat(targetCurrency.exchangeRate || 1);
                    return amount * rate; // REVERSED: multiply instead of divide
                }
                return amount;
            } 
            // Convert between two non-base currencies via base currency
            else {
                const baseAmount = await this.convertCurrency(amount, fromCurrency, baseCurrency);
                return await this.convertCurrency(baseAmount, baseCurrency, toCurrency);
            }
        } catch (error) {
            console.error('Error converting currency:', error);
            return amount; // Return original amount if conversion fails
        }
    },

    /**
     * Update total amount in main currency (with debounce)
     */
    async updateTotal() {
        // Clear existing debounce timer
        if (this.updateTotalDebounceTimer) {
            clearTimeout(this.updateTotalDebounceTimer);
        }
        
        // Set new debounce timer (300ms)
        this.updateTotalDebounceTimer = setTimeout(async () => {
            await this._updateTotalInternal();
        }, 300);
    },
    
    /**
     * Internal method to update total (called after debounce)
     */
    async _updateTotalInternal() {
        const tbody = document.getElementById('voucherEntriesBody');
        if (!tbody) return;
        
        const voucherType = document.getElementById('voucherType').value;
        const mainCurrency = document.getElementById('voucherMainCurrency')?.value;
        
        if (!mainCurrency) return;
        
        if (voucherType === 'journal') {
            // Calculate both debit and credit in main currency
            let totalDebitInMainCurrency = 0;
            let totalCreditInMainCurrency = 0;
            
            const rows = tbody.querySelectorAll('tr');
            
            for (const row of rows) {
                const debitInput = row.querySelector('.entry-debit');
                const creditInput = row.querySelector('.entry-credit');
                const currencySelect = row.querySelector('.entry-currency');
                
                if (debitInput && creditInput && currencySelect) {
                    const debit = parseFloat(debitInput.value) || 0;
                    const credit = parseFloat(creditInput.value) || 0;
                    const entryCurrency = currencySelect.value;
                    
                    if (debit > 0) {
                        const debitInMainCurrency = await this.convertCurrency(debit, entryCurrency, mainCurrency);
                        totalDebitInMainCurrency += debitInMainCurrency;
                    }
                    
                    if (credit > 0) {
                        const creditInMainCurrency = await this.convertCurrency(credit, entryCurrency, mainCurrency);
                        totalCreditInMainCurrency += creditInMainCurrency;
                    }
                }
            }
            
            const totalDebitEl = document.getElementById('totalDebit');
            const totalCredit2El = document.getElementById('totalCredit2');
            const totalDebitCurrencyEl = document.getElementById('totalDebitCurrency');
            const totalCredit2CurrencyEl = document.getElementById('totalCredit2Currency');
            const balanceStatus = document.getElementById('balanceStatus');
            
            if (totalDebitEl) totalDebitEl.textContent = this.formatCurrency(totalDebitInMainCurrency);
            if (totalCredit2El) totalCredit2El.textContent = this.formatCurrency(totalCreditInMainCurrency);
            if (totalDebitCurrencyEl) totalDebitCurrencyEl.textContent = mainCurrency;
            if (totalCredit2CurrencyEl) totalCredit2CurrencyEl.textContent = mainCurrency;
            
            // Check balance
            if (balanceStatus) {
                const difference = Math.abs(totalDebitInMainCurrency - totalCreditInMainCurrency);
                if (difference < 0.01) {
                    balanceStatus.innerHTML = '<i class="fas fa-check-circle text-success"></i> متوازن';
                    balanceStatus.className = 'fw-bold text-success';
                } else {
                    balanceStatus.innerHTML = '<i class="fas fa-exclamation-triangle text-warning"></i> غير متوازن (الفرق: ' + this.formatCurrency(difference) + ')';
                    balanceStatus.className = 'fw-bold text-warning';
                }
            }
        } else {
            // Receipt or Payment voucher - calculate total credit in main currency
            let totalInMainCurrency = 0;
            
            const rows = tbody.querySelectorAll('tr');
            
            for (const row of rows) {
                const creditInput = row.querySelector('.entry-credit');
                const currencySelect = row.querySelector('.entry-currency');
                
                if (creditInput && currencySelect) {
                    const credit = parseFloat(creditInput.value) || 0;
                    const entryCurrency = currencySelect.value;
                    
                    if (credit > 0) {
                        const creditInMainCurrency = await this.convertCurrency(credit, entryCurrency, mainCurrency);
                        totalInMainCurrency += creditInMainCurrency;
                    }
                }
            }
            
            const totalCreditEl = document.getElementById('totalCredit');
            const totalCreditCurrencyEl = document.getElementById('totalCreditCurrency');
            
            if (totalCreditEl) {
                totalCreditEl.textContent = this.formatCurrency(totalInMainCurrency);
            }
            if (totalCreditCurrencyEl) {
                totalCreditCurrencyEl.textContent = mainCurrency;
            }
        }
    },

    /**
     * Show column settings modal
     */
    /**
     * Show a modal on top of an already-open modal (stacked modal).
     * Adjusts z-index so the new modal and its backdrop appear above the existing one.
     */
    _showStackedModal(modalId) {
        const el = document.getElementById(modalId);
        if (!el) return;
        el.style.zIndex = '1070';
        const modal = bootstrap.Modal.getOrCreateInstance(el);
        el.addEventListener('shown.bs.modal', () => {
            const backdrops = document.querySelectorAll('.modal-backdrop');
            if (backdrops.length > 1) {
                backdrops[backdrops.length - 1].style.zIndex = '1065';
            }
        }, { once: true });
        modal.show();
    },

    showColumnSettings() {
        this._showStackedModal('columnSettingsModal');
    },

    /**
     * Toggle column visibility
     */
    toggleColumn(columnId, visible) {
        const columnName = columnId.replace('col_', '');
        this.columnSettings[columnName] = visible;
        this.applyColumnVisibility();
    },

    /**
     * Apply column visibility settings
     */
    applyColumnVisibility() {
        const table = document.querySelector('.voucher-entries-table');
        if (!table) return;
        
        Object.keys(this.columnSettings).forEach(column => {
            const isVisible = this.columnSettings[column];
            const elements = table.querySelectorAll(`.column-${column}`);
            
            elements.forEach(el => {
                el.style.display = isVisible ? '' : 'none';
            });
        });
    },


    /**
     * Load cost centers with cache
     * @returns {Promise<Array>} - Array of active cost centers
     */
    async loadCostCentersData() {
        // Check cache first
        if (this.costCentersCache.data && this.costCentersCache.timestamp) {
            const age = Date.now() - this.costCentersCache.timestamp;
            if (age < this.costCentersCache.duration) {
                return this.costCentersCache.data;
            }
        }
        
        // Load from database
        const costCentersSnapshot = await db.collection('costCenters').get();
        const costCenters = [];
        
        costCentersSnapshot.forEach(doc => {
            const cc = { id: doc.id, ...doc.data() };
            if (cc.status === 'active') {
                costCenters.push(cc);
            }
        });
        
        // Sort by code
        costCenters.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
        
        // Update cache
        this.costCentersCache.data = costCenters;
        this.costCentersCache.timestamp = Date.now();
        
        return costCenters;
    },
    
    /**
     * Invalidate cost centers cache
     */
    invalidateCostCentersCache() {
        this.costCentersCache.data = null;
        this.costCentersCache.timestamp = null;
    },
    
    /**
     * Load cost centers for dropdown
     */
    async loadCostCenters() {
        try {
            const costCenters = await this.loadCostCentersData();
            
            const selectElement = document.getElementById('voucherCostCenter');
            if (selectElement) {
                selectElement.innerHTML = '<option value="">اختر مراكز الكلفة...</option>';
                
                costCenters.forEach(cc => {
                    const option = document.createElement('option');
                    option.value = cc.id;
                    option.textContent = `${cc.code} - ${cc.name}`;
                    option.dataset.ccName = cc.name;
                    selectElement.appendChild(option);
                });
                
                console.log(`✅ Loaded ${costCenters.length} active cost centers for main dropdown`);
            }
        } catch (error) {
            console.error('❌ Error loading cost centers:', error);
            this.showError('خطأ في تحميل مراكز الكلفة: ' + error.message);
        }
    },

    /**
     * Process receipt/payment entries and create general entries
     * Shared function to avoid code duplication between createGeneralEntry and updateGeneralEntry
     * @param {Array} entries - Voucher entries
     * @param {Object} voucherData - Voucher data (for contra account and cost center defaults)
     * @param {string} mainCurrency - Main currency code
     * @param {boolean} isReceipt - true for receipt voucher, false for payment voucher
     * @returns {Promise<Array>} - Array of general entry objects
     */
    async processReceiptPaymentEntries(entries, voucherData, mainCurrency, isReceipt) {
        const generalEntries = [];
        const costCenterGroups = {};
        
        for (const entry of entries) {
            const entryCredit = parseFloat(entry.credit || 0);
            const entryCurrency = entry.currency || mainCurrency;
            
            // Convert to main currency for accurate totals
            const amountInMainCurrency = await this.convertCurrency(entryCredit, entryCurrency, mainCurrency);
            
            // Determine cost center for this entry (entry-level has priority)
            const finalCostCenterId = entry.costCenterId || voucherData.costCenterId || 'no_cost_center';
            const finalCostCenterName = entry.costCenterName || 
                (entry.costCenterId ? null : voucherData.costCenterName) || 
                'بدون مركز كلفة';
            
            // Add the detail entry
            // Receipt: Credit detail accounts, Debit contra account
            // Payment: Debit detail accounts, Credit contra account
            generalEntries.push({
                accountId: entry.accountId,
                accountCode: entry.accountCode,
                accountName: entry.accountName,
                debit: isReceipt ? 0 : amountInMainCurrency,
                credit: isReceipt ? amountInMainCurrency : 0,
                description: entry.description || '',
                costCenterId: finalCostCenterId === 'no_cost_center' ? null : finalCostCenterId,
                costCenterName: finalCostCenterName,
                currency: mainCurrency,
                originalCurrency: entryCurrency,
                exchangeRate: await this.getExchangeRate(entryCurrency, mainCurrency),
                originalAmount: entryCredit
            });
            
            // Group by cost center for contra account
            const costCenterKey = finalCostCenterId === 'no_cost_center' ? 'no_cost_center' : finalCostCenterId;
            if (!costCenterGroups[costCenterKey]) {
                costCenterGroups[costCenterKey] = {
                    costCenterId: finalCostCenterId === 'no_cost_center' ? null : finalCostCenterId,
                    costCenterName: finalCostCenterName,
                    totalAmount: 0
                };
            }
            costCenterGroups[costCenterKey].totalAmount += amountInMainCurrency;
        }
        
        // Add contra account entries for each cost center
        // Receipt: Debit contra account, Payment: Credit contra account
        for (const costCenterKey in costCenterGroups) {
            const group = costCenterGroups[costCenterKey];
            generalEntries.push({
                accountId: voucherData.contraAccountId,
                accountCode: voucherData.contraAccountCode,
                accountName: voucherData.contraAccountName,
                debit: isReceipt ? group.totalAmount : 0,
                credit: isReceipt ? 0 : group.totalAmount,
                description: `حساب مقابل - ${group.costCenterName}`,
                costCenterId: group.costCenterId,
                costCenterName: group.costCenterName,
                currency: mainCurrency
            });
        }
        
        return generalEntries;
    },

    /**
     * Process journal entries and create general entries
     * Shared function to avoid code duplication between createGeneralEntry and updateGeneralEntry
     * @param {Array} entries - Voucher entries
     * @param {Object} voucherData - Voucher data (for contra account and cost center defaults)
     * @param {string} mainCurrency - Main currency code
     * @returns {Promise<Array>} - Array of general entry objects
     */
    async processJournalEntries(entries, voucherData, mainCurrency) {
        const generalEntries = [];
        const contraEntriesByCostCenter = {};

        for (const entry of entries) {
            const entryDebit = parseFloat(entry.debit || 0);
            const entryCredit = parseFloat(entry.credit || 0);
            const entryCurrency = entry.currency || mainCurrency;

            const debitInMainCurrency = entryDebit > 0 ?
                await this.convertCurrency(entryDebit, entryCurrency, mainCurrency) : 0;
            const creditInMainCurrency = entryCredit > 0 ?
                await this.convertCurrency(entryCredit, entryCurrency, mainCurrency) : 0;

            const finalCostCenterId = entry.costCenterId || voucherData.costCenterId || null;
            const finalCostCenterName = entry.costCenterName ||
                (entry.costCenterId ? null : voucherData.costCenterName) || null;

            generalEntries.push({
                accountId: entry.accountId,
                accountCode: entry.accountCode,
                accountName: entry.accountName,
                debit: debitInMainCurrency,
                credit: creditInMainCurrency,
                description: entry.description || '',
                costCenterId: finalCostCenterId,
                costCenterName: finalCostCenterName,
                currency: mainCurrency,
                originalCurrency: entryCurrency,
                exchangeRate: await this.getExchangeRate(entryCurrency, mainCurrency),
                originalDebit: entryDebit,
                originalCredit: entryCredit
            });

            const costCenterKey = finalCostCenterId || 'no_cost_center';

            if (!contraEntriesByCostCenter[costCenterKey]) {
                contraEntriesByCostCenter[costCenterKey] = {
                    costCenterId: finalCostCenterId,
                    costCenterName: finalCostCenterName,
                    debit: 0,
                    credit: 0
                };
            }

            contraEntriesByCostCenter[costCenterKey].debit += creditInMainCurrency;
            contraEntriesByCostCenter[costCenterKey].credit += debitInMainCurrency;
        }

        if (voucherData.contraAccountId) {
            for (const costCenterKey in contraEntriesByCostCenter) {
                const contraData = contraEntriesByCostCenter[costCenterKey];

                if (contraData.debit > 0.01) {
                    generalEntries.push({
                        accountId: voucherData.contraAccountId,
                        accountCode: voucherData.contraAccountCode,
                        accountName: voucherData.contraAccountName,
                        debit: contraData.debit,
                        credit: 0,
                        description: `حساب مقابل - سند يومية${contraData.costCenterName ? ' - ' + contraData.costCenterName : ''}`,
                        costCenterId: contraData.costCenterId,
                        costCenterName: contraData.costCenterName,
                        currency: mainCurrency
                    });
                }

                if (contraData.credit > 0.01) {
                    generalEntries.push({
                        accountId: voucherData.contraAccountId,
                        accountCode: voucherData.contraAccountCode,
                        accountName: voucherData.contraAccountName,
                        debit: 0,
                        credit: contraData.credit,
                        description: `حساب مقابل - سند يومية${contraData.costCenterName ? ' - ' + contraData.costCenterName : ''}`,
                        costCenterId: contraData.costCenterId,
                        costCenterName: contraData.costCenterName,
                        currency: mainCurrency
                    });
                }
            }
        }

        return generalEntries;
    },

    /**
     * Create general entry from voucher (when posting)
     */
    async createGeneralEntry(voucherId, voucherData) {
        try {
            console.log('ًں“‌ Creating general entry for voucher:', voucherId, voucherData);
            
            const generalEntries = [];
            const mainCurrency = voucherData.mainCurrency || voucherData.currency || 'IQD';
            
            if (voucherData.type === 'receipt') {
                // Receipt: Debit contra account, Credit detail accounts
                // Use shared function to process entries
                const entries = await this.processReceiptPaymentEntries(
                    voucherData.entries,
                    voucherData,
                    mainCurrency,
                    true // isReceipt = true
                );
                generalEntries.push(...entries);
                
            } else if (voucherData.type === 'payment') {
                // Payment: Debit detail accounts, Credit contra account
                // Use shared function to process entries
                const entries = await this.processReceiptPaymentEntries(
                    voucherData.entries,
                    voucherData,
                    mainCurrency,
                    false // isReceipt = false
                );
                generalEntries.push(...entries);
                
            } else if (voucherData.type === 'journal') {
                // Journal: Use shared function to process entries
                const journalEntries = await this.processJournalEntries(
                    voucherData.entries,
                    voucherData,
                    mainCurrency
                );
                generalEntries.push(...journalEntries);
            } else if (voucherData.type === 'entry') {
                // Entry: Convert all amounts to main currency (no contra account needed)
                for (const entry of voucherData.entries) {
                    const entryDebit = parseFloat(entry.debit || 0);
                    const entryCredit = parseFloat(entry.credit || 0);
                    const entryCurrency = entry.currency || mainCurrency;
                    
                    // Convert both debit and credit to main currency
                    const debitInMainCurrency = entryDebit > 0 ? 
                        await this.convertCurrency(entryDebit, entryCurrency, mainCurrency) : 0;
                    const creditInMainCurrency = entryCredit > 0 ? 
                        await this.convertCurrency(entryCredit, entryCurrency, mainCurrency) : 0;
                    
                    // Determine cost center for this entry (entry-level has priority)
                    const finalCostCenterId = entry.costCenterId || voucherData.costCenterId || null;
                    const finalCostCenterName = entry.costCenterName || 
                        (entry.costCenterId ? null : voucherData.costCenterName) || null;
                    
                    generalEntries.push({
                        accountId: entry.accountId,
                        accountCode: entry.accountCode,
                        accountName: entry.accountName,
                        debit: debitInMainCurrency,
                        credit: creditInMainCurrency,
                        description: entry.description || '',
                        costCenterId: finalCostCenterId,
                        costCenterName: finalCostCenterName,
                        currency: mainCurrency,
                        originalCurrency: entryCurrency,
                        exchangeRate: await this.getExchangeRate(entryCurrency, mainCurrency),
                        originalDebit: entryDebit,
                        originalCredit: entryCredit
                    });
                }
                
                // Entry vouchers are balanced without contra account (pure accounting entry)
            }
            
            // Validate cost center balance ONLY for ENTRY vouchers
            // Journal vouchers don't need this because contra account is the inverse
            if (voucherData.type === 'entry') {
                console.log('ًں”چ Validating cost center balance for ENTRY voucher...');
                const costCenterValidation = this.validateCostCenterBalance(generalEntries);
                if (!costCenterValidation.isBalanced) {
                    const errorMsg = `مركز الكلفة "${costCenterValidation.costCenterName}" غير متوازن! المدين: ${costCenterValidation.totalDebit}، الدائن: ${costCenterValidation.totalCredit}`;
                    console.error('â‌Œ Cost center balance validation failed:', errorMsg);
                    throw new Error(errorMsg);
                }
                console.log('âœ… Cost center balance validation passed');
            } else if (voucherData.type === 'journal') {
                console.log('â„¹ï¸ڈ Journal voucher - skipping cost center balance check (contra account handles balance)');
            }
            
            // Calculate totals in main currency (all entries are now in main currency)
            const totalDebit = generalEntries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
            const totalCredit = generalEntries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);
            
            console.log('ًں“ٹ General entry totals (all in', mainCurrency, '):', { totalDebit, totalCredit, entriesCount: generalEntries.length });
            
            // Validate balance - more strict check and prepare data
            let finalTotalDebit = totalDebit;
            let finalTotalCredit = totalCredit;
            const balanceDifference = Math.abs(totalDebit - totalCredit);
            
            if (balanceDifference > 0.01) {
                console.error('â‌Œ General entry is not balanced!', { 
                    totalDebit, 
                    totalCredit, 
                    difference: balanceDifference,
                    voucherType: voucherData.type,
                    voucherNumber: voucherData.voucherNumber
                });
                
                // Round to 2 decimal places and recalculate to fix minor rounding issues
                const roundedTotalDebit = Math.round(totalDebit * 100) / 100;
                const roundedTotalCredit = Math.round(totalCredit * 100) / 100;
                
                if (Math.abs(roundedTotalDebit - roundedTotalCredit) <= 0.01) {
                    console.log('ًں”„ Using rounded values to fix minor rounding differences');
                    finalTotalDebit = roundedTotalDebit;
                    finalTotalCredit = roundedTotalCredit;
                } else {
                    throw new Error(`Cannot create unbalanced general entry. Debit: ${totalDebit}, Credit: ${totalCredit}`);
                }
            }
            
            // Save general entry
            const generalEntryData = {
                voucherId: voucherId,
                voucherNumber: voucherData.voucherNumber,
                voucherType: voucherData.type,
                date: voucherData.date,
                entries: generalEntries,
                totalDebit: finalTotalDebit,
                totalCredit: finalTotalCredit,
                mainCurrency: mainCurrency,
                isBalanced: Math.abs(finalTotalDebit - finalTotalCredit) < 0.01,
                status: 'posted',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: firebase.auth().currentUser?.uid || 'unknown'
            };
            
            const docRef = await db.collection('generalEntries').add(generalEntryData);
            
            console.log('âœ… General entry created successfully with ID:', docRef.id);
            
            return docRef.id;
            
        } catch (error) {
            console.error('â‌Œ Error creating general entry:', error);
            throw error;
        }
    },

    /**
     * Update existing general entry when voucher is modified
     */
    async updateGeneralEntry(voucherId, voucherData) {
        try {
            console.log('ًں”„ Updating general entry for voucher:', voucherId);

            // Find existing general entry
            const generalEntriesSnapshot = await db.collection('generalEntries')
                .where('voucherId', '==', voucherId)
                .limit(1)
                .get();

            if (generalEntriesSnapshot.empty) {
                console.log('âڑ ï¸ڈ No existing general entry found, creating new one');
                return await this.createGeneralEntry(voucherId, voucherData);
            }

            const existingEntryDoc = generalEntriesSnapshot.docs[0];
            const existingEntryId = existingEntryDoc.id;

            // Create new general entry data using the same logic as createGeneralEntry
            const generalEntries = [];
            const mainCurrency = voucherData.mainCurrency || voucherData.currency || 'IQD';

                        if (voucherData.type === 'receipt') {
                // Receipt: Use shared function to process entries
                const entries = await this.processReceiptPaymentEntries(
                    voucherData.entries,
                    voucherData,
                    mainCurrency,
                    true // isReceipt = true
                );
                generalEntries.push(...entries);
                
            } else if (voucherData.type === 'payment') {
                // Payment: Use shared function to process entries
                const entries = await this.processReceiptPaymentEntries(
                    voucherData.entries,
                    voucherData,
                    mainCurrency,
                    false // isReceipt = false
                );
                generalEntries.push(...entries);
                
            } else if (voucherData.type === 'journal') {
                const journalEntries = await this.processJournalEntries(voucherData.entries, voucherData, mainCurrency);
                generalEntries.push(...journalEntries);
            } else if (voucherData.type === 'entry') {
                // Use same logic as createGeneralEntry for entry vouchers (no contra account)
                for (const entry of voucherData.entries) {
                    const entryDebit = parseFloat(entry.debit || 0);
                    const entryCredit = parseFloat(entry.credit || 0);
                    const entryCurrency = entry.currency || mainCurrency;
                    
                    const debitInMainCurrency = entryDebit > 0 ? 
                        await this.convertCurrency(entryDebit, entryCurrency, mainCurrency) : 0;
                    const creditInMainCurrency = entryCredit > 0 ? 
                        await this.convertCurrency(entryCredit, entryCurrency, mainCurrency) : 0;
                    
                    const finalCostCenterId = entry.costCenterId || voucherData.costCenterId || null;
                    const finalCostCenterName = entry.costCenterName || 
                        (entry.costCenterId ? null : voucherData.costCenterName) || null;
                    
                    generalEntries.push({
                        accountId: entry.accountId,
                        accountCode: entry.accountCode,
                        accountName: entry.accountName,
                        debit: debitInMainCurrency,
                        credit: creditInMainCurrency,
                        description: entry.description || '',
                        costCenterId: finalCostCenterId,
                        costCenterName: finalCostCenterName,
                        currency: mainCurrency,
                        originalCurrency: entryCurrency,
                        exchangeRate: await this.getExchangeRate(entryCurrency, mainCurrency),
                        originalDebit: entryDebit,
                        originalCredit: entryCredit
                    });
                }
            }

            // Calculate totals and validate balance
            const totalDebit = generalEntries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
            const totalCredit = generalEntries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);
            
            console.log('ًں“ٹ Updated general entry totals:', { totalDebit, totalCredit, entriesCount: generalEntries.length });

            // Update the existing general entry
            const updateData = {
                entries: generalEntries,
                totalDebit: totalDebit,
                totalCredit: totalCredit,
                mainCurrency: mainCurrency,
                isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('generalEntries').doc(existingEntryId).update(updateData);
            
            console.log('âœ… General entry updated successfully:', existingEntryId);
            return existingEntryId;

        } catch (error) {
            console.error('â‌Œ Error updating general entry:', error);
            throw error;
        }
    },

    /**
     * Show success message
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

    showError(message) {
        Swal.fire({
            title: 'خطأ!',
            text: message,
            icon: 'error',
            confirmButtonText: 'حسناً'
        });
    },

    showInfo(message) {
        Swal.fire({
            title: 'معلومة',
            text: message,
            icon: 'info',
            confirmButtonText: 'حسناً',
            timer: 3000
        });
    },

    /**
     * Initialize voucher modal
     */
    async initializeVoucherModal(type, id) {
        this.editingVoucher = null;
        const form = document.getElementById('voucherForm');
        if (form) form.reset();
        
        // Clear entries table
        const tbody = document.getElementById('voucherEntriesBody');
        if (tbody) tbody.innerHTML = '';
        
        // Clear contra account display and stale dataset attributes
        const contraInput = document.getElementById('voucherContraAccount');
        contraInput.value = '';
        contraInput.dataset.accountCode = '';
        contraInput.dataset.accountName = '';
        document.getElementById('voucherContraAccountDisplay').value = '';
        this.hideContraAccountInfo();
        
        // Load all data in parallel (all calls are independent)
        const [nextNumber] = await Promise.all([
            this.generateNextVoucherNumber(type),
            this.loadVoucherSettings(type),
            this.loadDefaultContraAccount(type),
            this.loadCostCenters(),
            this.populateVoucherMainCurrencyDropdown(),
        ]);

        // Set type and update form
        document.getElementById('voucherType').value = type;
        this.updateVoucherFormByType(type);

        // Set date
        document.getElementById('voucherDate').value = new Date().toISOString().split('T')[0];

        // Set default status from settings
        const defaultStatus = this.voucherSettings.defaultVoucherStatus || 'draft';
        document.getElementById('voucherStatus').value = defaultStatus;

        // Set voucher number
        document.getElementById('voucherNumber').value = nextNumber;

        // updateVoucherFormByType above already calls clearTotals + addVoucherEntry
        console.log('Voucher modal initialized for type:', type);
    },
    
    /**
     * Clear all totals to zero
     */
    clearTotals() {
        // Clear receipt/payment totals
        const totalCreditEl = document.getElementById('totalCredit');
        const totalCreditCurrencyEl = document.getElementById('totalCreditCurrency');
        if (totalCreditEl) totalCreditEl.textContent = '0.00';
        if (totalCreditCurrencyEl) totalCreditCurrencyEl.textContent = '';
        
        // Clear journal/entry totals
        const totalDebitEl = document.getElementById('totalDebit');
        const totalCredit2El = document.getElementById('totalCredit2');
        const totalDebitCurrencyEl = document.getElementById('totalDebitCurrency');
        const totalCredit2CurrencyEl = document.getElementById('totalCredit2Currency');
        const balanceStatus = document.getElementById('balanceStatus');
        
        if (totalDebitEl) totalDebitEl.textContent = '0.00';
        if (totalCredit2El) totalCredit2El.textContent = '0.00';
        if (totalDebitCurrencyEl) totalDebitCurrencyEl.textContent = '';
        if (totalCredit2CurrencyEl) totalCredit2CurrencyEl.textContent = '';
        if (balanceStatus) {
            balanceStatus.innerHTML = '<i class="fas fa-minus-circle text-muted"></i> فارغ';
            balanceStatus.className = 'fw-bold text-muted';
        }
        
        console.log('âœ… Totals cleared');
    },
    
    /**
     * Load voucher settings for specific type
     */
    async loadVoucherSettings(voucherType) {
        try {
            const settingsPath = `vouchers_${voucherType}`;
            const settingsDoc = await db.collection('settings').doc(settingsPath).get();
            
            if (settingsDoc.exists) {
                this.voucherSettings = settingsDoc.data();
                
                // Apply cost center required setting
                const costCenterSelect = document.getElementById('voucherCostCenter');
                if (costCenterSelect) {
                    const costCenterRequired = this.voucherSettings.costCenterRequired || false;
                    
                    console.log(`ًں“‌ Cost center required for ${voucherType}: ${costCenterRequired}`);
                    
                    if (costCenterRequired) {
                        costCenterSelect.setAttribute('required', 'required');
                        const label = costCenterSelect.closest('.col-md-6')?.querySelector('label');
                        if (label && !label.textContent.includes('*')) {
                            label.innerHTML = label.innerHTML.replace('مركز الكلفة', 'مركز الكلفة *');
                        }
                        console.log(`âœ… Cost center is now required for ${voucherType}`);
                    } else {
                        costCenterSelect.removeAttribute('required');
                        const label = costCenterSelect.closest('.col-md-6')?.querySelector('label');
                        if (label && label.textContent.includes('*')) {
                            label.innerHTML = label.innerHTML.replace(' *', '');
                        }
                        console.log(`â„¹ï¸ڈ Cost center is optional for ${voucherType}`);
                    }
                }
            } else {
                console.log(`No settings found for ${settingsPath}, using defaults`);
                this.voucherSettings = {};
            }
        } catch (error) {
            console.error('Error loading voucher settings:', error);
            this.voucherSettings = {};
        }
    },
    
    /**
     * Load default contra account from settings based on voucher type
     */
    async loadDefaultContraAccount(voucherType) {
        try {
            // Only load default contra account for receipt, payment, and journal vouchers
            if (voucherType === 'entry') {
                // Entry vouchers don't need contra accounts
                return;
            }
            
            let settingsPath = 'vouchers_receipt'; // default
            
            if (voucherType === 'receipt') {
                settingsPath = 'vouchers_receipt';
            } else if (voucherType === 'payment') {
                settingsPath = 'vouchers_payment';
            } else if (voucherType === 'journal') {
                settingsPath = 'vouchers_journal';
            } else {
                // Unknown type - don't load contra account
                return;
            }
            
            const settingsDoc = await db.collection('settings').doc(settingsPath).get();
            if (settingsDoc.exists) {
                const settings = settingsDoc.data();
                const defaultAccountId = settings.defaultContraAccount;
                
                console.log(`ًں“‌ Loading default contra account for ${voucherType}:`, defaultAccountId);
                
                if (defaultAccountId) {
                    await ChartOfAccountsModule.getAccounts();
                    const account = ChartOfAccountsModule.getAccountById(defaultAccountId);
                    if (account) {
                        document.getElementById('voucherContraAccount').value = defaultAccountId;
                        document.getElementById('voucherContraAccountDisplay').value = `${account.code} - ${account.name}`;
                        document.getElementById('voucherContraAccount').dataset.accountCode = account.code;
                        document.getElementById('voucherContraAccount').dataset.accountName = account.name;
                        
                        console.log(`âœ… Loaded default contra account: ${account.code} - ${account.name}`);
                        
                        // Load account balance and currency info
                        this.loadContraAccountInfo(defaultAccountId);
                    } else {
                        console.warn(`âڑ ï¸ڈ Default contra account ${defaultAccountId} not found in chartOfAccounts`);
                    }
                } else {
                    console.log(`â„¹ï¸ڈ No default contra account set for ${voucherType}`);
                }
            } else {
                console.log(`â„¹ï¸ڈ No settings document found for ${settingsPath}`);
            }
        } catch (error) {
            console.error(`â‌Œ Error loading default contra account for ${voucherType}:`, error);
        }
    },

    /**
     * Load contra account balance and currency information
     */
    async loadContraAccountInfo(accountId) {
        try {
            if (!accountId) {
                this.hideContraAccountInfo();
                return;
            }

            // Get account details
            await ChartOfAccountsModule.getAccounts();
            const account = ChartOfAccountsModule.getAccountById(accountId);
            if (!account) {
                this.hideContraAccountInfo();
                return;
            }
            
            // Calculate account balance from general entries (in account's currency)
            const balanceInAccountCurrency = await this.calculateAccountBalance(accountId);

            // Get main voucher currency
            const mainCurrency = document.getElementById('voucherMainCurrency')?.value || 'IQD';
            
            // Get account currency
            const accountCurrency = account.currency || 'IQD';

            // Convert balance to voucher main currency
            const balanceInMainCurrency = await this.convertCurrency(balanceInAccountCurrency, accountCurrency, mainCurrency);

            // Display account info using voucher main currency
            this.showContraAccountInfo(balanceInMainCurrency, mainCurrency);

        } catch (error) {
            console.error('Error loading contra account info:', error);
            this.hideContraAccountInfo();
        }
    },

    /**
     * Calculate account balance from general entries
     */
    async calculateAccountBalance(accountId) {
        try {
            let totalDebit = 0;
            let totalCredit = 0;

            // Get all general entries and filter manually (Firestore array-contains-any limitation)
            const entriesSnapshot = await db.collection('generalEntries').get();

            entriesSnapshot.forEach(doc => {
                const generalEntry = doc.data();
                if (generalEntry.entries && Array.isArray(generalEntry.entries)) {
                    generalEntry.entries.forEach(entry => {
                        if (entry.accountId === accountId) {
                            totalDebit += parseFloat(entry.debit || 0);
                            totalCredit += parseFloat(entry.credit || 0);
                        }
                    });
                }
            });

            // Calculate balance based on account type
            await ChartOfAccountsModule.getAccounts();
            const account = ChartOfAccountsModule.getAccountById(accountId);
            if (!account) return 0;

            const accountType = account.type;

            // For assets and expenses: debit - credit (positive = debit balance)
            // For liabilities, equity, and revenue: credit - debit (positive = credit balance)
            let balance = 0;
            if (accountType === 'assets' || accountType === 'expenses') {
                balance = totalDebit - totalCredit;
            } else {
                balance = totalCredit - totalDebit;
            }

            return Math.round(balance * 100) / 100; // Round to 2 decimal places

        } catch (error) {
            console.error('Error calculating account balance:', error);
            return 0;
        }
    },

    /**
     * Show contra account info
     */
    showContraAccountInfo(balance, currency) {
        const infoDiv = document.getElementById('contraAccountInfo');
        const balanceDiv = document.getElementById('contraAccountBalance');
        const currencyDiv = document.getElementById('contraAccountCurrency');

        if (infoDiv && balanceDiv && currencyDiv) {
            balanceDiv.textContent = this.formatCurrency(balance);
            currencyDiv.textContent = currency;
            infoDiv.style.display = 'block';
        }
    },

    /**
     * Hide contra account info
     */
    hideContraAccountInfo() {
        const infoDiv = document.getElementById('contraAccountInfo');
        if (infoDiv) {
            infoDiv.style.display = 'none';
        }
    },

    /**
     * Validate cost center balance for journal entries
     * Returns true if balanced, throws error if not
     */
    validateCostCenterBalance(entries) {
        const costCenterTotals = {};

        entries.forEach(entry => {
            // Use entry-level cost center if exists, otherwise use voucher-level
            const costCenterId = entry.costCenterId || 'voucher_level';
            const costCenterName = entry.costCenterName || 'مستوى السند';

            if (!costCenterTotals[costCenterId]) {
                costCenterTotals[costCenterId] = {
                    costCenterName: costCenterName,
                    totalDebit: 0,
                    totalCredit: 0
                };
            }

            costCenterTotals[costCenterId].totalDebit += parseFloat(entry.debit || 0);
            costCenterTotals[costCenterId].totalCredit += parseFloat(entry.credit || 0);
        });

        // Check balance for each cost center
        for (const costCenterId in costCenterTotals) {
            const totals = costCenterTotals[costCenterId];
            const difference = Math.abs(totals.totalDebit - totals.totalCredit);
            
            if (difference > 0.01) { // Allow small rounding differences
                return {
                    isBalanced: false,
                    costCenterName: totals.costCenterName,
                    totalDebit: totals.totalDebit,
                    totalCredit: totals.totalCredit,
                    difference: difference
                };
            }
        }

        return { isBalanced: true };
    },

    /**
     * Generate next voucher number
     */
    async generateNextVoucherNumber(type) {
        // Default prefixes (defined once to avoid repetition)
        const defaultPrefixes = {
            'receipt': 'RV',
            'payment': 'PV',
            'journal': 'JV',
            'entry': 'EV'
        };
        
        // Get prefix from settings
        let prefix = defaultPrefixes[type] || 'VOU';
        
        try {
            const settingsPath = `vouchers_${type}`;
            const settingsDoc = await db.collection('settings').doc(settingsPath).get();
            
            if (settingsDoc.exists) {
                const settings = settingsDoc.data();
                
                if (type === 'receipt' && settings.receiptPrefix) {
                    prefix = settings.receiptPrefix;
                } else if (type === 'payment' && settings.paymentPrefix) {
                    prefix = settings.paymentPrefix;
                } else if (type === 'journal' && settings.journalPrefix) {
                    prefix = settings.journalPrefix;
                } else if (type === 'entry' && settings.entryPrefix) {
                    prefix = settings.entryPrefix;
                } else {
                    // Use default prefix
                    prefix = defaultPrefixes[type] || 'VOU';
                }
            } else {
                // Use default prefix
                prefix = defaultPrefixes[type] || 'VOU';
            }
        } catch (error) {
            console.error('Error loading prefix from settings:', error);
            // Use default prefix on error
            prefix = defaultPrefixes[type] || 'VOU';
        }
        
        const year = new Date().getFullYear();
        
        try {
            // جلب جميع السندات من نفس النوع (بدون orderBy لتجنب الحاجة للفهرس المركب)
            const snapshot = await db.collection('vouchers')
                .where('type', '==', type)
                .get();
            
            let nextNum = 1;
            if (!snapshot.empty) {
                // فرز السندات حسب voucherNumber في JavaScript
                const vouchers = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                // فرز حسب voucherNumber تنازلياً
                vouchers.sort((a, b) => {
                    const numA = a.voucherNumber ? parseInt(a.voucherNumber.match(/\d+$/)?.[0] || '0') : 0;
                    const numB = b.voucherNumber ? parseInt(b.voucherNumber.match(/\d+$/)?.[0] || '0') : 0;
                    return numB - numA; // ترتيب تنازلي
                });
                
                if (vouchers.length > 0 && vouchers[0].voucherNumber) {
                    const lastNumber = vouchers[0].voucherNumber;
                    const match = lastNumber.match(/\d+$/);
                    if (match) {
                        nextNum = parseInt(match[0]) + 1;
                    }
                }
            }
            
            return `${prefix}${year}${String(nextNum).padStart(4, '0')}`;
        } catch (error) {
            console.error('Error generating voucher number:', error);
            return `${prefix}${year}0001`;
        }
    },

    /**
     * Update form appearance based on voucher type
     */
    updateVoucherFormByType(type) {
        const modalHeader = document.querySelector('#voucherModal .modal-header');
        const typeIcon = document.querySelector('#voucherModal .modal-title i');
        const title = document.getElementById('voucherModalTitle');
        const entriesTitle = document.getElementById('voucherEntriesTitle');
        
        // ✅ إصلاح: تحديث عنوان قسم التفاصيل حسب نوع السند
        if (entriesTitle) {
            if (type === 'receipt') {
                entriesTitle.textContent = 'تفاصيل السند (الحسابات الدائنة)';
            } else if (type === 'payment') {
                entriesTitle.textContent = 'تفاصيل السند (الحسابات المدينة)';
            } else if (type === 'journal' || type === 'entry') {
                entriesTitle.textContent = 'تفاصيل السند (المدين والدائن)';
            }
        }
        
        // Remove all type classes
        modalHeader.classList.remove('bg-gradient-receipt', 'bg-gradient-payment', 'bg-gradient-journal', 'bg-gradient-entry');
        
        // Switch headers and footers based on type
        const receiptPaymentHeader = document.getElementById('receiptPaymentHeader');
        const journalHeader = document.getElementById('journalHeader');
        const receiptPaymentFooter = document.getElementById('receiptPaymentFooter');
        const journalFooter = document.getElementById('journalFooter');
        
        // Update contra account requirement and visibility based on type
        const contraAccountInput = document.getElementById('voucherContraAccount');
        const contraAccountDisplay = document.getElementById('voucherContraAccountDisplay');
        const contraAccountRequired = document.getElementById('contraAccountRequired');
        const contraAccountHelp = document.getElementById('contraAccountHelp');
        const contraAccountInfo = document.getElementById('contraAccountInfo');
        const searchContraAccountBtn = document.getElementById('searchContraAccountBtn');
        const contraAccountRow = document.querySelector('label[for="voucherContraAccount"]')?.closest('.col-md-6') || 
                                document.querySelector('input[id="voucherContraAccount"]')?.closest('.col-md-6');
        
        if (type === 'entry') {
            // Hide contra account fields for entry vouchers only
            if (contraAccountRow) contraAccountRow.style.display = 'none';
            if (contraAccountInfo) contraAccountInfo.style.display = 'none';
            
            // Clear contra account data
            if (contraAccountInput) {
                contraAccountInput.removeAttribute('required');
                contraAccountInput.value = '';
            }
            if (contraAccountDisplay) contraAccountDisplay.value = '';
            
            // Update help text for clarity
            if (contraAccountHelp) contraAccountHelp.innerHTML = '<i class="fas fa-info-circle"></i> غير مطلوب لسند القيد العادي';
            if (contraAccountRequired) contraAccountRequired.style.display = 'none';
        } else {
            // Show and require contra account for receipt, payment, and journal vouchers
            if (contraAccountRow) contraAccountRow.style.display = '';
            
            // Required for receipt, payment, and journal
            if (contraAccountInput) {
                contraAccountInput.setAttribute('required', 'required');
            }
            if (contraAccountRequired) contraAccountRequired.style.display = '';
            if (contraAccountHelp) {
                if (type === 'journal') {
                    contraAccountHelp.innerHTML = '<i class="fas fa-exclamation-circle"></i> إلزامي لسند اليومية';
                } else {
                    contraAccountHelp.innerHTML = '<i class="fas fa-exclamation-circle"></i> إلزامي لسندات القبض والصرف';
                }
            }
        }
        
        // ✅ إصلاح: التأكد من إخفاء صف واحد فقط من الأعمدة
        // Force update header visibility to prevent duplication - متعدد المرات للتأكد
        const forceUpdateHeaders = () => {
            const receiptHeader = document.getElementById('receiptPaymentHeader');
            const journalHead = document.getElementById('journalHeader');
            const receiptFooter = document.getElementById('receiptPaymentFooter');
            const journalFoot = document.getElementById('journalFooter');
            
            if (receiptHeader && journalHead) {
                if (type === 'receipt' || type === 'payment') {
                    // ✅ إصلاح: استخدام 'table-row' بدلاً من '' لضمان العرض الصحيح
                    receiptHeader.style.display = 'table-row';
                    receiptHeader.style.visibility = 'visible';
                    journalHead.style.display = 'none';
                    journalHead.style.visibility = 'hidden';
                    if (receiptFooter) {
                        receiptFooter.style.display = 'table-row';
                        receiptFooter.style.visibility = 'visible';
                    }
                    if (journalFoot) {
                        journalFoot.style.display = 'none';
                        journalFoot.style.visibility = 'hidden';
                    }
                } else if (type === 'journal' || type === 'entry') {
                    receiptHeader.style.display = 'none';
                    receiptHeader.style.visibility = 'hidden';
                    journalHead.style.display = 'table-row';
                    journalHead.style.visibility = 'visible';
                    if (receiptFooter) {
                        receiptFooter.style.display = 'none';
                        receiptFooter.style.visibility = 'hidden';
                    }
                    if (journalFoot) {
                        journalFoot.style.display = 'table-row';
                        journalFoot.style.visibility = 'visible';
                    }
                }
                console.log(`✅ Headers updated for ${type}: receiptPayment=${receiptHeader.style.display}, journal=${journalHead.style.display}`);
            }
        };
        
        forceUpdateHeaders();
        
        // Add appropriate class and update title
        switch(type) {
            case 'receipt':
                modalHeader.classList.add('bg-gradient-receipt');
                typeIcon.className = 'fas fa-arrow-down me-2';
                title.innerHTML = '<i class="fas fa-arrow-down me-2"></i> سند قبض جديد';
                if (receiptPaymentHeader) {
                    receiptPaymentHeader.style.display = 'table-row';
                    receiptPaymentHeader.style.visibility = 'visible';
                }
                if (journalHeader) {
                    journalHeader.style.display = 'none';
                    journalHeader.style.visibility = 'hidden';
                }
                if (receiptPaymentFooter) {
                    receiptPaymentFooter.style.display = 'table-row';
                    receiptPaymentFooter.style.visibility = 'visible';
                }
                if (journalFooter) {
                    journalFooter.style.display = 'none';
                    journalFooter.style.visibility = 'hidden';
                }
                break;
            case 'payment':
                modalHeader.classList.add('bg-gradient-payment');
                typeIcon.className = 'fas fa-arrow-up me-2';
                title.innerHTML = '<i class="fas fa-arrow-up me-2"></i> سند صرف جديد';
                if (receiptPaymentHeader) {
                    receiptPaymentHeader.style.display = 'table-row';
                    receiptPaymentHeader.style.visibility = 'visible';
                }
                if (journalHeader) {
                    journalHeader.style.display = 'none';
                    journalHeader.style.visibility = 'hidden';
                }
                if (receiptPaymentFooter) {
                    receiptPaymentFooter.style.display = 'table-row';
                    receiptPaymentFooter.style.visibility = 'visible';
                }
                if (journalFooter) {
                    journalFooter.style.display = 'none';
                    journalFooter.style.visibility = 'hidden';
                }
                break;
            case 'journal':
                modalHeader.classList.add('bg-gradient-journal');
                typeIcon.className = 'fas fa-book me-2';
                title.innerHTML = '<i class="fas fa-book me-2"></i> سند يومية جديد';
                if (receiptPaymentHeader) {
                    receiptPaymentHeader.style.display = 'none';
                    receiptPaymentHeader.style.visibility = 'hidden';
                }
                if (journalHeader) {
                    journalHeader.style.display = 'table-row';
                    journalHeader.style.visibility = 'visible';
                }
                if (receiptPaymentFooter) {
                    receiptPaymentFooter.style.display = 'none';
                    receiptPaymentFooter.style.visibility = 'hidden';
                }
                if (journalFooter) {
                    journalFooter.style.display = 'table-row';
                    journalFooter.style.visibility = 'visible';
                }
                break;
            case 'entry':
                modalHeader.classList.add('bg-gradient-entry');
                typeIcon.className = 'fas fa-edit me-2';
                title.innerHTML = '<i class="fas fa-edit me-2"></i> سند قيد جديد';
                if (receiptPaymentHeader) {
                    receiptPaymentHeader.style.display = 'none';
                    receiptPaymentHeader.style.visibility = 'hidden';
                }
                if (journalHeader) {
                    journalHeader.style.display = 'table-row';
                    journalHeader.style.visibility = 'visible';
                }
                if (receiptPaymentFooter) {
                    receiptPaymentFooter.style.display = 'none';
                    receiptPaymentFooter.style.visibility = 'hidden';
                }
                if (journalFooter) {
                    journalFooter.style.display = 'table-row';
                    journalFooter.style.visibility = 'visible';
                }
                break;
        }
        
        // ✅ إصلاح: فقط عند تغيير النوع (وليس عند التعديل) - تم نقله للتحقق
        // لا نمسح السطور إذا كان السند قيد التعديل
        if (!this.editingVoucher) {
            const tbody = document.getElementById('voucherEntriesBody');
            if (tbody) {
                tbody.innerHTML = '';
                // ✅ تصفير الإجماليات عند تغيير النوع
                this.clearTotals();
                this.addVoucherEntry();
            }
        }
    },

    /**
     * View general entry by its ID directly
     */
    async viewGeneralEntryById(generalEntryId) {
        try {
            // Validate generalEntryId
            if (!generalEntryId || generalEntryId === 'undefined') {
                this.showError('معرف القيد العام غير صحيح');
                return;
            }
            
            showLoading();
            
            // Check if user is authenticated
            const currentUser = firebase.auth().currentUser;
            if (!currentUser) {
                hideLoading();
                this.showError('يجب تسجيل الدخول أولاً');
                return;
            }
            
            console.log('✅ User authenticated:', currentUser.uid);
            console.log('🔍 Loading general entry with ID:', generalEntryId);
            
            // Load general entry directly by ID
            const generalEntryDoc = await db.collection('generalEntries').doc(generalEntryId).get();
            
            if (!generalEntryDoc.exists) {
                hideLoading();
                console.error('â‌Œ No general entry found with ID:', generalEntryId);
                this.showError('لم يتم العثور على القيد العام');
                return;
            }
            
            const generalEntryData = generalEntryDoc.data();
            if (!generalEntryData || !generalEntryData.entries || !Array.isArray(generalEntryData.entries)) {
                hideLoading();
                console.error('â‌Œ Invalid general entry data structure:', generalEntryData);
                this.showError('بيانات القيد العام غير صحيحة أو تالفة');
                return;
            }
            
            const generalEntry = { 
                id: generalEntryDoc.id, 
                ...generalEntryData 
            };
            
            console.log('✅ General entry loaded successfully:', {
                id: generalEntry.id,
                voucherId: generalEntry.voucherId,
                entriesCount: generalEntry.entries.length
            });
            
            // Display the general entry
            await this.displayGeneralEntry(generalEntry);
            hideLoading();
            
        } catch (error) {
            hideLoading();
            console.error('â‌Œ Error loading general entry:', error);
            this.showError('خطأ في تحميل القيد العام: ' + (error.message || 'خطأ غير معروف'));
        }
    },

    /**
     * View general entry for posted voucher
     */
    async viewGeneralEntry(voucherId) {
        try {
            // Validate voucherId
            if (!voucherId || voucherId === 'undefined') {
                this.showError('معرف السند غير صحيح');
                return;
            }
            
            showLoading();
            
            // Check if user is authenticated
            const currentUser = firebase.auth().currentUser;
            if (!currentUser) {
                hideLoading();
                this.showError('يجب تسجيل الدخول أولاً');
                return;
            }
            
            console.log('✅ User authenticated:', currentUser.uid);
            console.log('🔍 Searching for general entry with voucherId:', voucherId);
            
            // Try multiple approaches to query the general entries
            let generalEntriesSnapshot;
            
            try {
                // Wait for auth token to be ready
                await currentUser.getIdToken(true);
                
                // First attempt: Simple query
                console.log('🔍 Attempting simple query...');
                generalEntriesSnapshot = await db.collection('generalEntries')
                .where('voucherId', '==', voucherId)
                .get();
                    
                console.log('✅ Query successful, found', generalEntriesSnapshot.docs.length, 'documents');
                
            } catch (queryError) {
                console.error('â‌Œ Query failed:', queryError);
                
                // Try alternative approach if permission denied
                if (queryError.code === 'permission-denied') {
                    console.log('⚠️ Permission denied - trying alternative approach...');
                    try {
                        // Wait a bit and try again with fresh token
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        await currentUser.getIdToken(true);
                        console.log('🔍 Retrying with fresh token...');
                        generalEntriesSnapshot = await db.collection('generalEntries')
                            .where('voucherId', '==', voucherId)
                            .get();
                        console.log('✅ Retry successful, found', generalEntriesSnapshot.docs.length, 'documents');
                    } catch (retryError) {
                        console.error('â‌Œ Retry also failed:', retryError);
                        hideLoading();
                        this.showError('لا توجد صلاحية للوصول إلى القيود العامة. تأكد من تطبيق قواعد Firestore الجديدة.');
                        return;
                    }
                } else {
                    hideLoading();
                    // Provide specific error handling for other errors
                    if (queryError.code === 'failed-precondition') {
                        console.log('âڑ ï¸ڈ Failed precondition - possible index issue');
                        this.showError('خطأ في قاعدة البيانات. يرجى المحاولة مرة أخرى أو التواصل مع المدير.');
                    } else {
                        console.log('â‌Œ Unknown error:', queryError);
                        this.showError('خطأ في الاتصال بقاعدة البيانات: ' + (queryError.message || 'خطأ غير معروف'));
                    }
                    return;
                }
            }
            
            if (generalEntriesSnapshot.empty) {
                hideLoading();
                console.error('â‌Œ No general entries found for voucher:', voucherId);
                this.showError('لم يتم العثور على القيد العام المربوط بهذا السند. تأكد من أن السند تم ترحيله بنجاح.');
                return;
            }
            
            // Get the most recent general entry (if multiple exist)
            let selectedDoc = generalEntriesSnapshot.docs[0];
            if (generalEntriesSnapshot.docs.length > 1) {
                console.log(`✅ Found ${generalEntriesSnapshot.docs.length} general entries, selecting the first one`);
                // You could add logic here to select based on createdAt timestamp if needed
            }
            
            const generalEntryData = selectedDoc.data();
            if (!generalEntryData || !generalEntryData.entries || !Array.isArray(generalEntryData.entries)) {
                hideLoading();
                console.error('â‌Œ Invalid general entry data structure:', generalEntryData);
                this.showError('بيانات القيد العام غير صحيحة أو تالفة');
                return;
            }
            
            const generalEntry = { 
                id: selectedDoc.id, 
                ...generalEntryData 
            };
            
            console.log('✅ General entry loaded successfully:', {
                id: generalEntry.id,
                voucherId: generalEntry.voucherId,
                entriesCount: generalEntry.entries.length
            });
            
            // Display the general entry
            await this.displayGeneralEntry(generalEntry);
            hideLoading();
            
        } catch (error) {
            hideLoading();
            console.error('â‌Œ Error loading general entry:', error);
            this.showError('خطأ في تحميل القيد العام: ' + (error.message || 'خطأ غير معروف'));
        }
    },

    /**
     * Display general entry in modal
     */
    async displayGeneralEntry(generalEntry) {
        try {
            // Calculate totals
            const totalDebit = generalEntry.totalDebit || generalEntry.entries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
            const totalCredit = generalEntry.totalCredit || generalEntry.entries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);
            const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
            const mainCurrency = generalEntry.mainCurrency || 'IQD';
            
            // Handle voucher number and type for entries from purchases/sales (not vouchers)
            const voucherNumber = generalEntry.voucherNumber || generalEntry.reference || generalEntry.id || 'غير محدد';
            const voucherType = generalEntry.voucherType || generalEntry.type || 'عام';
            const entrySource = generalEntry.type === 'purchase' ? 'فاتورة شراء' : 
                               generalEntry.type === 'sale' ? 'فاتورة بيع' : 
                               generalEntry.voucherType ? 'سند محاسبي' : 'قيد عام';
            
            // Build entries table HTML
        let entriesHTML = `
                <div class="table-responsive">
                    <table class="table table-hover table-bordered mt-3" style="font-size: 0.9rem;">
                <thead class="table-dark">
                    <tr>
                        <th width="5%" class="text-center">#</th>
                        <th width="12%">كود الحساب</th>
                        <th width="25%">اسم الحساب</th>
                        <th width="12%" class="text-end">المدين</th>
                        <th width="12%" class="text-end">الدائن</th>
                                <th width="10%">العملة</th>
                                <th width="15%">البيان</th>
                                <th width="9%">مركز الكلفة</th>
                    </tr>
                </thead>
                <tbody>
            `;
            
            generalEntry.entries.forEach((entry, index) => {
                entriesHTML += `
                    <tr>
                        <td class="text-center">${index + 1}</td>
                        <td><strong class="text-primary">${entry.accountCode || '-'}</strong></td>
                        <td>${entry.accountName || '-'}</td>
                        <td class="text-end ${entry.debit > 0 ? 'text-primary fw-bold' : 'text-muted'}">
                            ${entry.debit > 0 ? this.formatCurrency(entry.debit) : '-'}
                        </td>
                        <td class="text-end ${entry.credit > 0 ? 'text-success fw-bold' : 'text-muted'}">
                            ${entry.credit > 0 ? this.formatCurrency(entry.credit) : '-'}
                        </td>
                        <td class="text-center">
                            <span class="badge bg-secondary">${entry.currency || mainCurrency}</span>
                        </td>
                        <td>${entry.description || '-'}</td>
                        <td class="text-center">
                            ${entry.costCenterName ? `<span class="badge bg-info">${entry.costCenterName}</span>` : '-'}
                        </td>
                    </tr>
                `;
            });
            
            entriesHTML += `
                </tbody>
                <tfoot class="table-light border-top">
                    <tr class="fw-bold">
                        <td colspan="3" class="text-end bg-light">
                            <i class="fas fa-calculator me-1"></i>الإجمالي:
                        </td>
                        <td class="text-end text-primary">
                            ${this.formatCurrency(totalDebit)}
                            <small class="text-muted d-block">${mainCurrency}</small>
                        </td>
                        <td class="text-end text-success">
                            ${this.formatCurrency(totalCredit)}
                            <small class="text-muted d-block">${mainCurrency}</small>
                        </td>
                        <td class="text-center bg-light">-</td>
                        <td colspan="2" class="text-center bg-light">
                            ${isBalanced ? 
                                '<span class="badge bg-success fs-6"><i class="fas fa-check-circle"></i> متوازن</span>' :
                                '<span class="badge bg-warning fs-6"><i class="fas fa-exclamation-triangle"></i> غير متوازن</span>'
                            }
                        </td>
                    </tr>
                </tfoot>
            </table>
                </div>
            `;
            
            hideLoading();
            
            await Swal.fire({
                title: `<i class="fas fa-file-contract text-primary"></i> قيد عام - ${voucherNumber}`,
                html: `
                    <div class="text-end" style="direction: rtl;">
                        <div class="alert ${isBalanced ? 'alert-success' : 'alert-warning'} mb-3">
                            <i class="fas fa-${isBalanced ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
                            <strong>حالة القيد:</strong> 
                            ${isBalanced ? 'القيد متوازن بشكل صحيح' : 'تحذير: القيد غير متوازن'}
                        </div>
                        
                        <div class="row g-3 mb-4">
                            <div class="col-md-3">
                                <div class="card border-primary text-center h-100">
                                    <div class="card-body">
                                        <i class="fas fa-hashtag text-primary mb-2 fs-4"></i>
                                        <h6 class="card-title">${generalEntry.type === 'purchase' || generalEntry.type === 'sale' ? 'رقم الفاتورة' : 'رقم السند'}</h6>
                                        <span class="badge bg-primary fs-6">${voucherNumber}</span>
                            </div>
                            </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card border-secondary text-center h-100">
                                    <div class="card-body">
                                        <i class="fas fa-file-invoice-dollar text-secondary mb-2 fs-4"></i>
                                        <h6 class="card-title">${generalEntry.type === 'purchase' || generalEntry.type === 'sale' ? 'المصدر' : 'نوع السند'}</h6>
                                        <span class="badge bg-secondary fs-6">${this.getTypeText(voucherType)}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card border-dark text-center h-100">
                                    <div class="card-body">
                                        <i class="fas fa-calendar-alt text-dark mb-2 fs-4"></i>
                                        <h6 class="card-title">التاريخ</h6>
                                        <div class="fw-bold">${this.formatDate(generalEntry.date)}</div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="card border-info text-center h-100">
                                    <div class="card-body">
                                        <i class="fas fa-coins text-info mb-2 fs-4"></i>
                                        <h6 class="card-title">العملة</h6>
                                        <span class="badge bg-info fs-6">${mainCurrency}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="alert alert-light border mb-3">
                            <div class="row text-center">
                                <div class="col-md-6">
                                    <strong class="text-primary">
                                        <i class="fas fa-plus-circle"></i> إجمالي المدين: 
                                        ${this.formatCurrency(totalDebit)} ${mainCurrency}
                                    </strong>
                                </div>
                                <div class="col-md-6">
                                    <strong class="text-success">
                                        <i class="fas fa-minus-circle"></i> إجمالي الدائن: 
                                        ${this.formatCurrency(totalCredit)} ${mainCurrency}
                                    </strong>
                                </div>
                            </div>
                        </div>
                        
                        ${entriesHTML}
                        
                        <div class="alert alert-info mt-3">
                            <i class="fas fa-info-circle me-2"></i>
                            <strong>ملاحظة:</strong> القيد العام يُنشأ تلقائياً عند ترحيل السند ويتم استخدامه لتحديث أرصدة الحسابات في دليل الحسابات.
                        </div>
                    </div>
                `,
                width: '95%',
                showConfirmButton: true,
                showCancelButton: true,
                confirmButtonText: '<i class="fas fa-print"></i> ط·ط¨ط§ط¹ط©',
                cancelButtonText: '<i class="fas fa-times"></i> ط¥ط؛ظ„ط§ظ‚',
                customClass: {
                    popup: 'text-end',
                    htmlContainer: 'text-end'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    // Print general entry
                    this.printGeneralEntry(generalEntry);
                }
            });
        } catch (error) {
            hideLoading();
            console.error('❌ Error displaying general entry:', error);
            
            // Provide more specific error messages based on error type
            let errorMessage = 'خطأ في تحميل القيد العام';
            if (error.code === 'permission-denied') {
                errorMessage = 'لا توجد صلاحية للوصول إلى القيد العام';
            } else if (error.code === 'not-found') {
                errorMessage = 'القيد العام غير موجود';
            } else if (error.message) {
                errorMessage += ': ' + error.message;
            }
            
            this.showError(errorMessage);
        }
    },
    
    /**
     * View voucher details
     */
    async viewVoucher(id) {
        const voucher = this.allVouchers.find(v => v.id === id);
        if (!voucher) {
            this.showError('السند غير موجود');
            return;
        }

        const typeText = this.getTypeText(voucher.type);
        
        // Calculate total amount and balance based on voucher type
        let totalDebit = 0;
        let totalCredit = 0;
        let totalAmount = 0;
        
        if (voucher.entries && voucher.entries.length > 0) {
            if (voucher.type === 'journal' || voucher.type === 'entry') {
                // For journal and entry vouchers, calculate both debit and credit
                totalDebit = voucher.entries.reduce((sum, entry) => sum + (parseFloat(entry.debit || 0)), 0);
                totalCredit = voucher.entries.reduce((sum, entry) => sum + (parseFloat(entry.credit || 0)), 0);
                totalAmount = totalDebit; // For display purposes, use debit total
            } else {
                // For receipt and payment vouchers, use credit total
                totalAmount = voucher.entries.reduce((sum, entry) => sum + (parseFloat(entry.credit || 0)), 0);
                totalCredit = totalAmount;
            }
        }
        
        
        // Build entries table with proper columns
        let entriesHTML = '';
        if (voucher.entries && voucher.entries.length > 0) {
            entriesHTML = `
                <div class="mt-4">
                    <h6 class="fw-bold mb-3">
                        <i class="fas fa-list-alt text-primary"></i> طھظپط§طµظٹظ„ ط§ظ„ط³ظ†ط¯
                    </h6>
                    <div class="table-responsive">
                        <table class="table table-hover table-bordered" style="font-size: 0.9rem;">
                            <thead class="table-dark">
                                <tr>
                                    <th width="5%" class="text-center">#</th>
                                    <th width="12%">كود الحساب</th>
                                    <th width="25%">اسم الحساب</th>
                                    ${(voucher.type === 'journal' || voucher.type === 'entry') ? '<th width="12%" class="text-end">مدين</th><th width="12%" class="text-end">دائن</th>' : '<th width="15%" class="text-end">المبلغ</th>'}
                                    <th width="10%">العملة</th>
                                    <th width="20%">البيان</th>
                                </tr>
                            </thead>
                            <tbody>`;
            
            voucher.entries.forEach((entry, index) => {
                entriesHTML += `
                    <tr>
                        <td class="text-center">${index + 1}</td>
                        <td><strong class="text-primary">${entry.accountCode}</strong></td>
                        <td>${entry.accountName}</td>`;
                
                if (voucher.type === 'journal' || voucher.type === 'entry') {
                    entriesHTML += `
                        <td class="text-end ${entry.debit > 0 ? 'text-primary fw-bold' : ''}">
                            ${entry.debit > 0 ? this.formatCurrency(entry.debit) : '-'}
                        </td>
                        <td class="text-end ${entry.credit > 0 ? 'text-success fw-bold' : ''}">
                            ${entry.credit > 0 ? this.formatCurrency(entry.credit) : '-'}
                        </td>`;
                } else {
                    entriesHTML += `
                        <td class="text-end text-success fw-bold">
                            ${this.formatCurrency(entry.credit || 0)}
                        </td>`;
                }
                
                entriesHTML += `
                        <td class="text-center">
                            <span class="badge bg-secondary">${entry.currency || 'IQD'}</span>
                        </td>
                    <td>${entry.description || '-'}</td>
                </tr>`;
            });
            
            entriesHTML += `
                            </tbody>
                        </table>
                    </div>
                </div>`;
        }
        
        await Swal.fire({
            title: `<i class="fas fa-file-invoice-dollar text-primary"></i> ${typeText} - ${voucher.voucherNumber}`,
            html: `
                <div class="voucher-view-modern text-end" style="direction: rtl;">
                    <div class="row g-3 mb-4">
                        <div class="col-md-6">
                            <div class="card border-primary">
                                <div class="card-body text-center">
                                    <i class="fas fa-calendar-alt text-primary mb-2"></i>
                                    <h6 class="card-title">طھط§ط±ظٹط® ط§ظ„ط³ظ†ط¯</h6>
                                    <p class="card-text fw-bold">${this.formatDate(voucher.date)}</p>
                    </div>
                    </div>
                    </div>
                        <div class="col-md-6">
                            <div class="card border-${voucher.status === 'posted' ? 'success' : 'warning'}">
                                <div class="card-body text-center">
                                    <i class="fas fa-${voucher.status === 'posted' ? 'check-circle' : 'clock'} text-${voucher.status === 'posted' ? 'success' : 'warning'} mb-2"></i>
                                    <h6 class="card-title">ط­ط§ظ„ط© ط§ظ„ط³ظ†ط¯</h6>
                                    <p class="card-text fw-bold">${this.getStatusText(voucher.status)}</p>
                    </div>
                    </div>
                        </div>
                    </div>
                    
                    <div class="alert alert-light border">
                        <div class="row">
                            <div class="col-md-6">
                                <strong><i class="fas fa-wallet"></i> ط§ظ„ط­ط³ط§ط¨ ط§ظ„ظ…ظ‚ط§ط¨ظ„:</strong>
                                <div class="mt-1">${voucher.contraAccountCode && voucher.contraAccountName ? `${voucher.contraAccountCode} - ${voucher.contraAccountName}` : (voucher.contraAccountName || 'ط؛ظٹط± ظ…ط­ط¯ط¯')}</div>
                            </div>
                            <div class="col-md-6">
                                <strong><i class="fas fa-building"></i> مركز الكلفة:</strong>
                                <div class="mt-1">${voucher.costCenterName || 'غير محدد'}</div>
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-md-6">
                                <strong><i class="fas fa-coins"></i> العملة الرئيسية:</strong>
                                <div class="mt-1">
                                    <span class="badge bg-info fs-6">${voucher.mainCurrency || voucher.currency || 'IQD'}</span>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <strong><i class="fas fa-calculator"></i> ط§ظ„ظ…ط¨ط§ظ„ط؛:</strong>
                                <div class="mt-1">
                                    ${voucher.type === 'journal' || voucher.type === 'entry' ? 
                                        '<span class="badge bg-primary fs-6 me-2">مدين: ' + this.formatCurrency(totalDebit) + '</span>' +
                                        '<span class="badge bg-success fs-6 me-2">دائن: ' + this.formatCurrency(totalCredit) + '</span>' +
                                        '<span class="badge bg-' + (Math.abs(totalDebit - totalCredit) < 0.01 ? 'success' : 'danger') + ' fs-6">' +
                                            (Math.abs(totalDebit - totalCredit) < 0.01 ? 'متوازن' : 'غير متوازن') + '</span>' :
                                        '<span class="badge bg-success fs-5">' + this.formatCurrency(totalAmount) + ' ' + (voucher.mainCurrency || voucher.currency || 'IQD') + '</span>'}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    ${entriesHTML}
                </div>
            `,
            icon: 'info',
            confirmButtonText: '<i class="fas fa-times"></i> ط¥ط؛ظ„ط§ظ‚',
            showCancelButton: voucher.status === 'posted',
            cancelButtonText: '<i class="fas fa-file-contract"></i> عرض القيد العام',
            width: '90%',
            customClass: {
                popup: 'text-end',
                htmlContainer: 'text-end'
            }
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.cancel && voucher.status === 'posted') {
                // Show general entry
                this.viewGeneralEntry(voucher.id);
            }
        });
    },

    /**
     * Open voucher in view-only mode (read-only modal)
     */
    async openVoucherInViewMode(id) {
        console.log('ًں‘پï¸ڈ Opening voucher in view mode:', id);
        const voucher = this.allVouchers.find(v => v.id === id);
        if (!voucher) {
            console.error('â‌Œ Voucher not found with ID:', id);
            return;
        }
        
        // Set view mode flag before opening
        this.viewMode = true;
        this.editingVoucher = voucher;
        
        // Call editVoucher to populate the form
        await this.editVoucher(id);
        
        // Wait for modal to be fully rendered
        setTimeout(() => {
            console.log('âڈ° Timeout completed, applying view mode restrictions...');
            this.applyViewModeRestrictions();
        }, 500);
        
        console.log('âœ… Voucher opened in view mode');
    },

    /**
     * Apply view mode restrictions to the modal
     */
    applyViewModeRestrictions() {
        const modal = document.getElementById('voucherModal');
        if (!modal) {
            console.warn('âڑ ï¸ڈ Modal not found when applying view mode restrictions');
            return;
        }
        
        console.log('ًں”’ Applying view mode restrictions...');
        console.log('ًں“چ Modal element:', modal);
        
        // Get modal body and footer
        const modalBody = modal.querySelector('.modal-body');
        const modalFooter = modal.querySelector('.modal-footer');
        
        console.log('ًں“چ Modal body:', modalBody ? 'Found' : 'Not found');
        console.log('ًں“چ Modal footer:', modalFooter ? 'Found' : 'Not found');
        
        // Disable all inputs and selects in modal body only
        if (modalBody) {
            modalBody.querySelectorAll('input, select, textarea').forEach(el => {
                el.setAttribute('readonly', 'readonly');
                el.setAttribute('disabled', 'disabled');
                el.style.pointerEvents = 'none';
                el.style.opacity = '0.7';
            });
            
            // Disable all buttons in modal body EXCEPT navigation buttons
            modalBody.querySelectorAll('button').forEach(el => {
                if (el.id === 'prevVoucherBtn' || el.id === 'nextVoucherBtn') {
                    return; // Keep navigation buttons active
                }
                el.setAttribute('disabled', 'disabled');
                el.style.pointerEvents = 'none';
                el.style.opacity = '0.5';
            });
            
            console.log('ًں”’ All form elements in modal body disabled');
        }
        
        // Handle footer buttons
        if (modalFooter) {
            console.log('ًں“چ Modal footer found');
            
            // Hide save button
            const saveBtn = modalFooter.querySelector('#saveVoucherBtn');
            if (saveBtn) {
                saveBtn.style.display = 'none';
                console.log('ًں”’ Save button found and hidden');
            } else {
                console.warn('âڑ ï¸ڈ Save button not found!');
            }
            
            // Add or show edit button in action-buttons div
            const actionButtonsDiv = modalFooter.querySelector('.action-buttons');
            console.log('ًں“چ Action buttons div:', actionButtonsDiv ? 'Found' : 'Not found');
            
            if (actionButtonsDiv) {
                const buttonsInDiv = actionButtonsDiv.querySelectorAll('button');
                console.log('ًں“ٹ Current buttons in action-buttons:', buttonsInDiv.length);
                buttonsInDiv.forEach((btn, idx) => {
                    console.log(`   Button ${idx + 1}:`, btn.id || btn.textContent.trim());
                });
                let editBtn = actionButtonsDiv.querySelector('#enableEditModeBtn');
                if (!editBtn) {
                    editBtn = document.createElement('button');
                    editBtn.id = 'enableEditModeBtn';
                    editBtn.type = 'button';
                    editBtn.className = 'btn btn-warning btn-lg';
                    editBtn.innerHTML = '<i class="fas fa-edit me-2"></i>تفعيل وضع التعديل';
                    editBtn.onclick = () => this.enableEditMode();
                    
                    // Ensure the button is never disabled
                    editBtn.removeAttribute('disabled');
                    editBtn.style.pointerEvents = 'auto';
                    editBtn.style.opacity = '1';
                    
                    // Insert before save button
                    if (saveBtn) {
                        actionButtonsDiv.insertBefore(editBtn, saveBtn);
                        console.log('âœ… Edit button inserted before save button');
                    } else {
                        actionButtonsDiv.appendChild(editBtn);
                        console.log('âœ… Edit button appended to action-buttons');
                    }
                    
                    // Verify button was added
                    const verifyBtn = actionButtonsDiv.querySelector('#enableEditModeBtn');
                    console.log('ًں”چ Verification - Edit button in DOM:', verifyBtn ? 'YES âœ…' : 'NO â‌Œ');
                    console.log('ًں”چ Button HTML:', editBtn.outerHTML);
                } else {
                    editBtn.style.display = '';
                    editBtn.removeAttribute('disabled');
                    editBtn.style.pointerEvents = 'auto';
                    editBtn.style.opacity = '1';
                    console.log('âœ… Edit button shown and enabled');
                }
            } else {
                console.warn('âڑ ï¸ڈ action-buttons div not found in modal footer');
            }
        }
        
        console.log('âœ… View mode restrictions applied successfully');
    },

    /**
     * Enable edit mode from view mode
     */
    enableEditMode() {
        console.log('âœڈï¸ڈ Enabling edit mode');
        this.viewMode = false;
        
        const modal = document.getElementById('voucherModal');
        if (!modal) {
            console.warn('âڑ ï¸ڈ Modal not found when enabling edit mode');
            return;
        }
        
        console.log('ًں”“ Removing view mode restrictions...');
        
        const modalBody = modal.querySelector('.modal-body');
        const modalFooter = modal.querySelector('.modal-footer');
        
        // Enable all inputs, selects, and textareas in modal body
        if (modalBody) {
            modalBody.querySelectorAll('input, select, textarea').forEach(el => {
                el.removeAttribute('readonly');
                el.removeAttribute('disabled');
                el.style.pointerEvents = '';
                el.style.opacity = '';
            });
            
            // Enable all buttons in modal body
            modalBody.querySelectorAll('button').forEach(el => {
                el.removeAttribute('disabled');
                el.style.pointerEvents = '';
                el.style.opacity = '';
            });
            
            console.log('ًں”“ All form elements in modal body enabled');
        }
        
        // Handle footer buttons
        if (modalFooter) {
            const actionButtonsDiv = modalFooter.querySelector('.action-buttons');
            
            // Show save button
            const saveBtn = modalFooter.querySelector('#saveVoucherBtn');
            if (saveBtn) {
                saveBtn.style.display = '';
                saveBtn.removeAttribute('disabled');
                console.log('ًں”“ Save button shown');
            }
            
            // Hide edit button
            const editBtn = actionButtonsDiv ? 
                actionButtonsDiv.querySelector('#enableEditModeBtn') : 
                modalFooter.querySelector('#enableEditModeBtn');
            if (editBtn) {
                editBtn.style.display = 'none';
                console.log('ًں”“ Edit button hidden');
            }
        }
        
        console.log('âœ… Edit mode enabled successfully');
    },

    /**
     * Print general entry
     */
    printGeneralEntry(generalEntry) {
        console.log('ًں–¨ï¸ڈ Printing general entry:', generalEntry.id);
        
        // Generate print HTML
        const printHTML = this.generateGeneralEntryPrintHTML(generalEntry);
        
        // Create print window
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        printWindow.document.write(printHTML);
        printWindow.document.close();
        
        // Wait for content to load then print
        printWindow.onload = function() {
            printWindow.focus();
            printWindow.print();
        };
        
        console.log('âœ… Print window opened for general entry:', generalEntry.voucherNumber);
    },
    
    /**
     * Generate HTML for general entry printing
     */
    generateGeneralEntryPrintHTML(generalEntry) {
        const typeText = this.getTypeText(generalEntry.voucherType);
        const mainCurrency = generalEntry.mainCurrency || 'IQD';
        
        // Calculate totals
        const totalDebit = generalEntry.totalDebit || generalEntry.entries.reduce((sum, e) => sum + (parseFloat(e.debit) || 0), 0);
        const totalCredit = generalEntry.totalCredit || generalEntry.entries.reduce((sum, e) => sum + (parseFloat(e.credit) || 0), 0);
        const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
        
        // Build entries table
        let entriesHTML = '';
        generalEntry.entries.forEach((entry, index) => {
            entriesHTML += `
                <tr>
                    <td style="text-align: center; border: 1px solid #dee2e6; padding: 8px;">${index + 1}</td>
                    <td style="border: 1px solid #dee2e6; padding: 8px;"><strong>${entry.accountCode}</strong></td>
                    <td style="border: 1px solid #dee2e6; padding: 8px;">${entry.accountName}</td>
                    <td style="text-align: right; border: 1px solid #dee2e6; padding: 8px; ${entry.debit > 0 ? 'font-weight: bold; color: #0066cc;' : 'color: #999;'}">
                        ${entry.debit > 0 ? this.formatCurrency(entry.debit) : '-'}
                    </td>
                    <td style="text-align: right; border: 1px solid #dee2e6; padding: 8px; ${entry.credit > 0 ? 'font-weight: bold; color: #28a745;' : 'color: #999;'}">
                        ${entry.credit > 0 ? this.formatCurrency(entry.credit) : '-'}
                    </td>
                    <td style="text-align: center; border: 1px solid #dee2e6; padding: 8px;">
                        <span style="background: #e9ecef; padding: 3px 8px; border-radius: 3px; font-size: 11px;">
                            ${entry.currency || mainCurrency}
                        </span>
                    </td>
                    <td style="border: 1px solid #dee2e6; padding: 8px;">${entry.description || '-'}</td>
                    <td style="text-align: center; border: 1px solid #dee2e6; padding: 8px;">
                        ${entry.costCenterName ? `<span style="background: #d1ecf1; padding: 3px 8px; border-radius: 3px; font-size: 11px;">${entry.costCenterName}</span>` : '-'}
                    </td>
                </tr>
            `;
        });
        
        return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>طباعة قيد عام - ${generalEntry.voucherNumber}</title>
    <style>
        @media print {
            @page {
                size: A4;
                margin: 10mm;
            }
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .no-print {
                display: none !important;
            }
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 15px;
            background: white;
            color: #333;
        }
        
        .general-entry-print {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border: 2px solid #333;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px double #333;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .document-title {
            font-size: 22px;
            font-weight: bold;
            color: #6c63ff;
            margin: 10px 0;
        }
        
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            margin-top: 10px;
        }
        
        .status-balanced {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .status-unbalanced {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeeba;
        }
        
        .entry-info {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 5px;
        }
        
        .info-item {
            padding: 8px;
        }
        
        .info-label {
            font-weight: bold;
            color: #495057;
            font-size: 12px;
            display: block;
            margin-bottom: 5px;
        }
        
        .info-value {
            color: #212529;
            font-size: 14px;
            font-weight: 600;
        }
        
        .totals-summary {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 5px;
        }
        
        .total-box {
            text-align: center;
            padding: 10px;
        }
        
        .total-label {
            font-size: 12px;
            opacity: 0.9;
            margin-bottom: 5px;
        }
        
        .total-value {
            font-size: 20px;
            font-weight: bold;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        th {
            background: #343a40;
            color: white;
            padding: 10px 8px;
            text-align: center;
            border: 1px solid #dee2e6;
            font-weight: bold;
            font-size: 12px;
        }
        
        td {
            padding: 8px;
            border: 1px solid #dee2e6;
            font-size: 12px;
        }
        
        .totals-row {
            background: #f8f9fa;
            font-weight: bold;
            border-top: 3px solid #333;
        }
        
        .balance-footer {
            text-align: center;
            padding: 15px;
            margin: 20px 0;
            border: 2px solid;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
        }
        
        .balance-ok {
            background: #d4edda;
            color: #155724;
            border-color: #c3e6cb;
        }
        
        .balance-error {
            background: #f8d7da;
            color: #721c24;
            border-color: #f5c6cb;
        }
        
        .signatures {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
            margin-top: 50px;
            padding-top: 30px;
            border-top: 1px solid #dee2e6;
        }
        
        .signature-box {
            text-align: center;
        }
        
        .signature-line {
            border-top: 1px solid #333;
            margin-top: 50px;
            padding-top: 10px;
            font-size: 13px;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #dee2e6;
            font-size: 11px;
            color: #6c757d;
        }
        
        .print-button {
            position: fixed;
            top: 10px;
            left: 10px;
            padding: 10px 20px;
            background: #6c63ff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        
        .print-button:hover {
            background: #5a52d5;
        }
        
        .note-box {
            background: #e7f3ff;
            border-left: 4px solid #2196F3;
            padding: 12px;
            margin-top: 20px;
            font-size: 12px;
            color: #1976D2;
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">ًں–¨ï¸ڈ ط·ط¨ط§ط¹ط©</button>
    
    <div class="general-entry-print">
        <!-- Header -->
        <div class="header">
            <div class="company-name">ًںŒ؟ ROSEMARY - ظ†ط¸ط§ظ… ط§ظ„ظ…ط­ط§ط³ط¨ط©</div>
            <div class="document-title">ًں“„ ظ‚ظٹط¯ ط¹ط§ظ… - ${typeText}</div>
            <div class="status-badge ${isBalanced ? 'status-balanced' : 'status-unbalanced'}">
                ${isBalanced ? '✔ القيد متوازن' : '⚠️  القيد غير متوازن'}
            </div>
        </div>
        
        <!-- Entry Info -->
        <div class="entry-info">
            <div class="info-item">
                <span class="info-label">ط±ظ‚ظ… ط§ظ„ط³ظ†ط¯:</span>
                <span class="info-value">${generalEntry.voucherNumber || '-'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">ظ†ظˆط¹ ط§ظ„ط³ظ†ط¯:</span>
                <span class="info-value">${typeText}</span>
            </div>
            <div class="info-item">
                <span class="info-label">ط§ظ„طھط§ط±ظٹط®:</span>
                <span class="info-value">${this.formatDate(generalEntry.date)}</span>
            </div>
            <div class="info-item">
                <span class="info-label">ط§ظ„ط¹ظ…ظ„ط©:</span>
                <span class="info-value">${mainCurrency}</span>
            </div>
        </div>
        
        <!-- Totals Summary -->
        <div class="totals-summary">
            <div class="total-box">
                <div class="total-label">إجمالي المدين</div>
                <div class="total-value">${this.formatCurrency(totalDebit)} ${mainCurrency}</div>
            </div>
            <div class="total-box">
                <div class="total-label">إجمالي الدائن</div>
                <div class="total-value">${this.formatCurrency(totalCredit)} ${mainCurrency}</div>
            </div>
        </div>
        
        <!-- Entries Table -->
        <table>
            <thead>
                <tr>
                    <th width="4%">#</th>
                    <th width="10%">كود الحساب</th>
                    <th width="24%">اسم الحساب</th>
                    <th width="12%">المدين</th>
                    <th width="12%">الدائن</th>
                    <th width="8%">العملة</th>
                    <th width="18%">البيان</th>
                    <th width="12%">مركز الكلفة</th>
                </tr>
            </thead>
            <tbody>
                ${entriesHTML}
            </tbody>
            <tfoot>
                <tr class="totals-row">
                    <td colspan="3" style="text-align: right; padding-right: 20px;">الإجمالي</td>
                    <td style="text-align: right; color: #0066cc; font-size: 14px;">${this.formatCurrency(totalDebit)}</td>
                    <td style="text-align: right; color: #28a745; font-size: 14px;">${this.formatCurrency(totalCredit)}</td>
                    <td colspan="3" style="text-align: center;">${mainCurrency}</td>
                </tr>
            </tfoot>
        </table>
        
        <!-- Balance Status -->
        <div class="balance-footer ${isBalanced ? 'balance-ok' : 'balance-error'}">
            ${isBalanced ? 
                'âœ“ ط§ظ„ظ‚ظٹط¯ ظ…طھظˆط§ط²ظ† - ط§ظ„ظ…ط¯ظٹظ† ظٹط³ط§ظˆظٹ ط§ظ„ط¯ط§ط¦ظ†' : 
                `âڑ  ط§ظ„ظ‚ظٹط¯ ط؛ظٹط± ظ…طھظˆط§ط²ظ† - ط§ظ„ظپط±ظ‚: ${this.formatCurrency(Math.abs(totalDebit - totalCredit))} ${mainCurrency}`
            }
        </div>
        
        <!-- Note -->
        <div class="note-box">
            <strong>ظ…ظ„ط§ط­ط¸ط©:</strong> ط§ظ„ظ‚ظٹط¯ ط§ظ„ط¹ط§ظ… ظٹظڈظ†ط´ط£ طھظ„ظ‚ط§ط¦ظٹط§ظ‹ ط¹ظ†ط¯ طھط±ط­ظٹظ„ ط§ظ„ط³ظ†ط¯ ظˆظٹطھظ… ط§ط³طھط®ط¯ط§ظ…ظ‡ ظ„طھط­ط¯ظٹط« ط£ط±طµط¯ط© ط§ظ„ط­ط³ط§ط¨ط§طھ ظپظٹ ط¯ظ„ظٹظ„ ط§ظ„ط­ط³ط§ط¨ط§طھ.
            <br>
            <strong>ط¹ط¯ط¯ ط§ظ„ظ‚ظٹظˆط¯:</strong> ${generalEntry.entries?.length || 0} ظ‚ظٹط¯
        </div>
        
        <!-- Signatures -->
        <div class="signatures">
            <div class="signature-box">
                <div class="signature-line">ط§ظ„ظ…ط­ط§ط³ط¨</div>
            </div>
            <div class="signature-box">
                <div class="signature-line">ط§ظ„ظ…ط¯ظٹط± ط§ظ„ظ…ط§ظ„ظٹ</div>
            </div>
            <div class="signature-box">
                <div class="signature-line">ط§ظ„ظ…ط¯ظٹط± ط§ظ„ط¹ط§ظ…</div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            ط·ظڈط¨ط¹ ط¨طھط§ط±ظٹط®: ${new Date().toLocaleDateString('ar-IQ')} - ${new Date().toLocaleTimeString('ar-IQ')}
            <br>
            ظ†ط¸ط§ظ… ROSEMARY ط§ظ„ظ…ط­ط§ط³ط¨ظٹ آ© 2024 | ط§ظ„ظ‚ظٹط¯ ط§ظ„ط¹ط§ظ… ط±ظ‚ظ…: ${generalEntry.id || '-'}
        </div>
    </div>
</body>
</html>
        `;
    },
    
    /**
     * Print voucher
     */
    async printVoucher(id) {
        console.log('ًں–¨ï¸ڈ Printing voucher:', id);
        const voucher = this.allVouchers.find(v => v.id === id);
        if (!voucher) {
            this.showError('السند غير موجود');
            return;
        }
        
        // Generate print HTML
        const printHTML = this.generateVoucherPrintHTML(voucher);
        
        // Create print window
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(printHTML);
        printWindow.document.close();
        
        // Wait for content to load then print
        printWindow.onload = function() {
            printWindow.focus();
            printWindow.print();
        };
        
        console.log('âœ… Print window opened for voucher:', voucher.voucherNumber);
    },
    
    /**
     * Generate HTML for voucher printing
     */
    generateVoucherPrintHTML(voucher) {
        const typeText = this.getTypeText(voucher.type);
        const typeIcon = voucher.type === 'receipt' ? 'â†“' : voucher.type === 'payment' ? 'â†‘' : voucher.type === 'journal' ? 'ًں“ک' : 'âœڈï¸ڈ';
        
        // Build entries table
        let entriesHTML = '';
        let totalDebit = 0;
        let totalCredit = 0;
        
        if (voucher.entries && Array.isArray(voucher.entries)) {
            voucher.entries.forEach((entry, index) => {
                const debit = parseFloat(entry.debit) || 0;
                const credit = parseFloat(entry.credit) || 0;
                totalDebit += debit;
                totalCredit += credit;
                
                if (voucher.type === 'journal' || voucher.type === 'entry') {
                    entriesHTML += `
                        <tr>
                            <td style="text-align: center; border: 1px solid #dee2e6; padding: 8px;">${index + 1}</td>
                            <td style="border: 1px solid #dee2e6; padding: 8px;">${entry.accountCode || ''}</td>
                            <td style="border: 1px solid #dee2e6; padding: 8px;">${entry.accountName || ''}</td>
                            <td style="text-align: right; border: 1px solid #dee2e6; padding: 8px;">${debit > 0 ? this.formatCurrency(debit) : '-'}</td>
                            <td style="text-align: right; border: 1px solid #dee2e6; padding: 8px;">${credit > 0 ? this.formatCurrency(credit) : '-'}</td>
                            <td style="border: 1px solid #dee2e6; padding: 8px;">${entry.description || '-'}</td>
                            <td style="text-align: center; border: 1px solid #dee2e6; padding: 8px;">${entry.costCenterName || '-'}</td>
                        </tr>
                    `;
                } else {
                    entriesHTML += `
                        <tr>
                            <td style="text-align: center; border: 1px solid #dee2e6; padding: 8px;">${index + 1}</td>
                            <td style="border: 1px solid #dee2e6; padding: 8px;">${entry.accountCode || ''}</td>
                            <td style="border: 1px solid #dee2e6; padding: 8px;">${entry.accountName || ''}</td>
                            <td style="text-align: right; border: 1px solid #dee2e6; padding: 8px;">${this.formatCurrency(credit)}</td>
                            <td style="border: 1px solid #dee2e6; padding: 8px;">${entry.description || '-'}</td>
                            <td style="text-align: center; border: 1px solid #dee2e6; padding: 8px;">${entry.costCenterName || '-'}</td>
                            <td style="text-align: center; border: 1px solid #dee2e6; padding: 8px;">${entry.receipt || '-'}</td>
                        </tr>
                    `;
                }
            });
        }
        
        return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ط·ط¨ط§ط¹ط© ${typeText} - ${voucher.voucherNumber}</title>
    <style>
        @media print {
            @page {
                size: A4;
                margin: 10mm;
            }
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .no-print {
                display: none !important;
            }
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px;
            background: white;
            color: #333;
        }
        
        .voucher-print {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border: 2px solid #333;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px double #333;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .voucher-title {
            font-size: 20px;
            font-weight: bold;
            color: #34495e;
            margin: 10px 0;
        }
        
        .voucher-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
            padding: 15px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
        }
        
        .info-item {
            display: flex;
            padding: 5px 0;
        }
        
        .info-label {
            font-weight: bold;
            color: #495057;
            min-width: 100px;
        }
        
        .info-value {
            color: #212529;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        th {
            background: #343a40;
            color: white;
            padding: 10px;
            text-align: center;
            border: 1px solid #dee2e6;
            font-weight: bold;
        }
        
        td {
            padding: 8px;
            border: 1px solid #dee2e6;
        }
        
        .totals {
            background: #f8f9fa;
            font-weight: bold;
            padding: 10px;
            text-align: right;
            border-top: 2px solid #333;
            margin-top: 20px;
        }
        
        .signatures {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
            margin-top: 50px;
            padding-top: 30px;
            border-top: 1px solid #dee2e6;
        }
        
        .signature-box {
            text-align: center;
        }
        
        .signature-line {
            border-top: 1px solid #333;
            margin-top: 40px;
            padding-top: 10px;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #dee2e6;
            font-size: 12px;
            color: #6c757d;
        }
        
        .print-button {
            position: fixed;
            top: 10px;
            left: 10px;
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        }
        
        .print-button:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <button class="print-button no-print" onclick="window.print()">ًں–¨ï¸ڈ ط·ط¨ط§ط¹ط©</button>
    
    <div class="voucher-print">
        <!-- Header -->
        <div class="header">
            <div class="company-name">ًںŒ؟ ROSEMARY - ظ†ط¸ط§ظ… ط§ظ„ظ…ط­ط§ط³ط¨ط©</div>
            <div class="voucher-title">${typeIcon} ${typeText}</div>
        </div>
        
        <!-- Voucher Info -->
        <div class="voucher-info">
            <div class="info-item">
                <span class="info-label">ط±ظ‚ظ… ط§ظ„ط³ظ†ط¯:</span>
                <span class="info-value">${voucher.voucherNumber || '-'}</span>
            </div>
            <div class="info-item">
                <span class="info-label">ط§ظ„طھط§ط±ظٹط®:</span>
                <span class="info-value">${this.formatDate(voucher.date)}</span>
            </div>
            ${voucher.contraAccountName ? `
            <div class="info-item">
                <span class="info-label">ط§ظ„ط­ط³ط§ط¨ ط§ظ„ظ…ظ‚ط§ط¨ظ„:</span>
                <span class="info-value">${voucher.contraAccountCode || ''} - ${voucher.contraAccountName}</span>
            </div>
            ` : ''}
            <div class="info-item">
                <span class="info-label">الحالة:</span>
                <span class="info-value">${voucher.status === 'posted' ? '✅ مرحّل' : '📝 مسودة'}</span>
            </div>
            ${voucher.costCenterName ? `
            <div class="info-item">
                <span class="info-label">مركز الكلفة:</span>
                <span class="info-value">${voucher.costCenterName}</span>
            </div>
            ` : ''}
            <div class="info-item">
                <span class="info-label">ط§ظ„ط¹ظ…ظ„ط©:</span>
                <span class="info-value">${voucher.mainCurrency || voucher.currency || 'IQD'}</span>
            </div>
        </div>
        
        <!-- Entries Table -->
        <table>
            <thead>
                ${voucher.type === 'journal' || voucher.type === 'entry' ? `
                <tr>
                    <th width="5%">#</th>
                    <th width="10%">ط§ظ„ظƒظˆط¯</th>
                    <th width="25%">ط§ط³ظ… ط§ظ„ط­ط³ط§ط¨</th>
                    <th width="12%">ط§ظ„ظ…ط¯ظٹظ†</th>
                    <th width="12%">ط§ظ„ط¯ط§ط¦ظ†</th>
                    <th width="20%">ط§ظ„ط¨ظٹط§ظ†</th>
                    <th width="16%">مركز الكلفة</th>
                </tr>
                ` : `
                <tr>
                    <th width="5%">#</th>
                    <th width="10%">ط§ظ„ظƒظˆط¯</th>
                    <th width="25%">ط§ط³ظ… ط§ظ„ط­ط³ط§ط¨</th>
                    <th width="15%">ط§ظ„ظ…ط¨ظ„ط؛</th>
                    <th width="20%">ط§ظ„ط¨ظٹط§ظ†</th>
                    <th width="15%">مركز الكلفة</th>
                    <th width="10%">ط§ظ„ط¥ظٹطµط§ظ„</th>
                </tr>
                `}
            </thead>
            <tbody>
                ${entriesHTML}
            </tbody>
        </table>
        
        <!-- Totals -->
        <div class="totals">
            ${voucher.type === 'journal' || voucher.type === 'entry' ? `
                <div>إجمالي المدين: <strong>${this.formatCurrency(totalDebit)}</strong> ${voucher.mainCurrency || voucher.currency || 'IQD'}</div>
                <div>إجمالي الدائن: <strong>${this.formatCurrency(totalCredit)}</strong> ${voucher.mainCurrency || voucher.currency || 'IQD'}</div>
                <div style="color: ${Math.abs(totalDebit - totalCredit) < 0.01 ? 'green' : 'red'};">
                    ${Math.abs(totalDebit - totalCredit) < 0.01 ? 'âœ“ ظ…طھظˆط§ط²ظ†' : 'âڑ  ط؛ظٹط± ظ…طھظˆط§ط²ظ†'}
                </div>
            ` : `
                <div>الإجمالي: <strong>${this.formatCurrency(voucher.totalAmount || totalCredit)}</strong> ${voucher.mainCurrency || voucher.currency || 'IQD'}</div>
            `}
        </div>
        
        <!-- Signatures -->
        <div class="signatures">
            <div class="signature-box">
                <div class="signature-line">ط§ظ„ظ…ط­ط§ط³ط¨</div>
            </div>
            <div class="signature-box">
                <div class="signature-line">ط§ظ„ظ…ط¯ظٹط± ط§ظ„ظ…ط§ظ„ظٹ</div>
            </div>
            <div class="signature-box">
                <div class="signature-line">ط§ظ„ظ…ط¯ظٹط± ط§ظ„ط¹ط§ظ…</div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            ط·ظڈط¨ط¹ ط¨طھط§ط±ظٹط®: ${new Date().toLocaleDateString('ar-IQ')} - ${new Date().toLocaleTimeString('ar-IQ')}
            <br>
            ظ†ط¸ط§ظ… ROSEMARY ط§ظ„ظ…ط­ط§ط³ط¨ظٹ آ© 2024
        </div>
    </div>
</body>
</html>
        `;
    },

    /**
     * Create new voucher (separate from edit)
     */
    async newVoucher(type = 'receipt') {
        console.log('ًں†• Creating NEW voucher of type:', type);
        
        // Reset editing voucher
        this.editingVoucher = null;
        this.viewMode = false;
        
        // Open the modal using existing function
        await this.showAddEditVoucherModal(type);
        
        console.log('âœ… New voucher modal opened for type:', type);
    },

    /**
     * Edit existing voucher (separate from new)
     */
    async editVoucher(id) {
        console.log('âœڈï¸ڈ Starting EDIT for voucher ID:', id);
        
        // This is always a direct edit, not view mode
        this.viewMode = false;
        
        const voucher = this.allVouchers.find(v => v.id === id);
        if (!voucher) {
            console.error('â‌Œ Voucher not found with ID:', id);
            await Swal.fire({
                title: 'خطأ',
                text: 'لم يتم العثور على السند',
                icon: 'error',
                confirmButtonText: 'حسناً'
            });
            return;
        }
        
        console.log('ًں“‹ Editing voucher:', voucher.voucherNumber, 'Type:', voucher.type);
        console.log('ًں“ٹ Voucher data:', {
            id: voucher.id,
            type: voucher.type,
            voucherNumber: voucher.voucherNumber,
            entries: voucher.entries?.length || 0,
            mainCurrency: voucher.mainCurrency,
            currency: voucher.currency,
            contraAccountId: voucher.contraAccountId
        });
        
        this.editingVoucher = voucher;
        
        // Initialize modal
        const form = document.getElementById('voucherForm');
        if (form) form.reset();
        
        // Clear entries table
        const tbody = document.getElementById('voucherEntriesBody');
        if (tbody) tbody.innerHTML = '';
        
        try {
            await Promise.all([
                this.loadVoucherSettings(voucher.type),
                this.loadDefaultContraAccount(voucher.type),
                this.loadCostCenters(),
                this.populateVoucherMainCurrencyDropdown(),
            ]);
        } catch (error) {
            console.error('Error loading voucher settings and dropdowns:', error);
        }
        
        // Fill basic info
        document.getElementById('voucherType').value = voucher.type;
        document.getElementById('voucherNumber').value = voucher.voucherNumber;
        document.getElementById('voucherDate').value = voucher.date;
        document.getElementById('voucherStatus').value = voucher.status;
        
        // Fill main currency FIRST (needed for contra account info)
        if (voucher.mainCurrency) {
            document.getElementById('voucherMainCurrency').value = voucher.mainCurrency;
        } else if (voucher.currency) {
            // Fallback to old currency field if mainCurrency doesn't exist
            document.getElementById('voucherMainCurrency').value = voucher.currency;
        }
        
        // Fill contra account (only for receipt, payment, and journal vouchers)
        if ((voucher.type === 'receipt' || voucher.type === 'payment' || voucher.type === 'journal') && voucher.contraAccountId) {
            console.log('Loading contra account:', {
                id: voucher.contraAccountId,
                code: voucher.contraAccountCode,
                name: voucher.contraAccountName
            });
            
            document.getElementById('voucherContraAccount').value = voucher.contraAccountId;
            document.getElementById('voucherContraAccountDisplay').value = voucher.contraAccountCode + ' - ' + voucher.contraAccountName;
            document.getElementById('voucherContraAccount').dataset.accountCode = voucher.contraAccountCode;
            document.getElementById('voucherContraAccount').dataset.accountName = voucher.contraAccountName;
            
            // Load account balance and currency info AFTER main currency is set (non-blocking)
            setTimeout(async () => {
                try {
                    await this.loadContraAccountInfo(voucher.contraAccountId);
                    console.log('âœ… Contra account info loaded successfully');
                } catch (error) {
                    console.error('Error loading contra account info during edit:', error);
                }
            }, 50);
        } else {
            console.log('No contra account to load for voucher type:', voucher.type);
        }
        
        // Fill cost center
        if (voucher.costCenterId) {
            document.getElementById('voucherCostCenter').value = voucher.costCenterId;
        }
        
        // ✅ إصلاح: استخدام updateVoucherFormByType لتحديث العنوان والعناوين
        this.updateVoucherFormByType(voucher.type);
        
        // Apply column visibility without clearing entries
        this.applyColumnVisibility();
        
        // Fill entries - optimized for speed
        if (voucher.entries && voucher.entries.length > 0) {
            const promises = [];
            
            for (let i = 0; i < voucher.entries.length; i++) {
                const entry = voucher.entries[i];
                console.log(`Loading entry ${i + 1}:`, {
                    accountId: entry.accountId,
                    accountCode: entry.accountCode,
                    accountName: entry.accountName,
                    currency: entry.currency,
                    debit: entry.debit,
                    credit: entry.credit,
                    exchangeRate: entry.exchangeRate,
                    localAmount: entry.localAmount,
                    costCenterId: entry.costCenterId
                });
                this.addVoucherEntry();
                const lastRow = tbody.lastElementChild;
                
                if (lastRow) {
                    try {
                        // Fill account data immediately (no async)
                        const accountIdInput = lastRow.querySelector('.entry-account-id');
                        const accountDisplayInput = lastRow.querySelector('.entry-account-display');
                        const accountCodeInput = lastRow.querySelector('.entry-code');
                        
                        if (accountIdInput) accountIdInput.value = entry.accountId || '';
                        if (accountDisplayInput) accountDisplayInput.value = (entry.accountCode || '') + ' - ' + (entry.accountName || '');
                        if (accountCodeInput) accountCodeInput.value = entry.accountCode || '';
                        if (lastRow) lastRow.dataset.accountName = entry.accountName || '';
                    
                    // Fill amounts
                    if (voucher.type === 'journal') {
                        const debitInput = lastRow.querySelector('.entry-debit');
                        const creditInput = lastRow.querySelector('.entry-credit');
                        if (debitInput) debitInput.value = entry.debit || '';
                        if (creditInput) creditInput.value = entry.credit || '';
                    } else {
                        const creditInput = lastRow.querySelector('.entry-credit');
                        if (creditInput) creditInput.value = entry.credit || '';
                    }
                    
                    // Fill other fields
                    const descInput = lastRow.querySelector('.entry-description');
                    if (descInput) descInput.value = entry.description || '';
                    
                    const currencySelect = lastRow.querySelector('.entry-currency');
                        if (currencySelect) {
                            currencySelect.value = entry.currency || 'IQD';
                        }
                    
                    const costCenterSelect = lastRow.querySelector('.entry-costCenter');
                    if (costCenterSelect && entry.costCenterId) {
                        costCenterSelect.value = entry.costCenterId;
                    }
                    
                    const receiptInput = lastRow.querySelector('.entry-receipt');
                    if (receiptInput && entry.receipt) {
                        receiptInput.value = entry.receipt;
                    }
                        
                        // Fill saved exchange rate and local amount
                        const exchangeRateInput = lastRow.querySelector('.entry-exchange-rate');
                        if (exchangeRateInput) {
                            if (entry.exchangeRate && entry.exchangeRate > 0) {
                                exchangeRateInput.value = entry.exchangeRate;
                                console.log(`Row ${i}: Loaded saved exchange rate: ${entry.exchangeRate}`);
                            } else {
                                // Set default value if not saved
                                exchangeRateInput.value = '1';
                                console.log(`Row ${i}: Set default exchange rate: 1`);
                            }
                        }
                        
                        const localAmountInput = lastRow.querySelector('.entry-local-amount');
                        if (localAmountInput) {
                            if (entry.localAmount && entry.localAmount !== 0) {
                                localAmountInput.value = entry.localAmount;
                                console.log(`Row ${i}: Loaded saved local amount: ${entry.localAmount}`);
                            } else {
                                // Calculate and set local amount if not saved
                                const entryAmount = entry.debit || entry.credit || 0;
                                if (entryAmount > 0) {
                                    localAmountInput.value = entryAmount;
                                    console.log(`Row ${i}: Set local amount to entry amount: ${entryAmount}`);
                                }
                            }
                        }
                        
                        // Queue async operations for after modal shows
                        promises.push(async () => {
                            try {
                                // Populate currency dropdown if needed
                                if (currencySelect && currencySelect.options.length <= 1) {
                                    await this.populateEntryCurrencyDropdown(currencySelect);
                                }
                                // Set currency value after populating dropdown
                                if (currencySelect) {
                                    currencySelect.value = entry.currency || 'IQD';
                                    console.log(`Row ${i}: Set currency to: ${entry.currency || 'IQD'}`);
                                }
                                
                                // Only recalculate if exchange rate or local amount is not already set from saved data
                                setTimeout(async () => {
                                    try {
                                        const hasValidExchangeRate = exchangeRateInput && 
                                            exchangeRateInput.value && 
                                            exchangeRateInput.value.trim() !== '' &&
                                            !isNaN(parseFloat(exchangeRateInput.value)) && 
                                            parseFloat(exchangeRateInput.value) > 0;
                                            
                                        const hasValidLocalAmount = localAmountInput && 
                                            localAmountInput.value && 
                                            localAmountInput.value.trim() !== '' &&
                                            !isNaN(parseFloat(localAmountInput.value)) && 
                                            parseFloat(localAmountInput.value) > 0;
                                        
                                        console.log(`Row ${i}: hasValidExchangeRate=${hasValidExchangeRate}, hasValidLocalAmount=${hasValidLocalAmount}`);
                                        
                                        // Only recalculate if we don't have valid saved data
                                        if (!hasValidExchangeRate) {
                                            console.log(`Loading exchange rate for row ${i} - no valid saved data`);
                                            await this.loadExchangeRateForRow(lastRow);
                                        }
                                        if (!hasValidLocalAmount) {
                                            console.log(`Calculating local amount for row ${i} - no valid saved data`);
                                            await this.calculateLocalAmount(lastRow);
                                        }
                                    } catch (error) {
                                        console.error('Error updating row calculations:', error);
                                        // Fallback: try to load anyway if there's an error
                                        try {
                                            await this.loadExchangeRateForRow(lastRow);
                                            await this.calculateLocalAmount(lastRow);
                                        } catch (fallbackError) {
                                            console.error('Fallback calculation also failed:', fallbackError);
                                        }
                                    }
                                }, 100);
                            } catch (error) {
                                console.error('Error in async row operations:', error);
                            }
                        });
                        
                    } catch (error) {
                        console.error('Error filling entry row:', error);
                    }
                }
            }
            
            // Execute async operations after modal is visible
            setTimeout(async () => {
                for (const promise of promises) {
                    await promise();
                }
            }, 200);
        } else {
            // No entries - ensure we have at least one empty row for editing
            // tbody already defined above at line 2618
            if (tbody && tbody.children.length === 0) {
                this.addVoucherEntry();
            }
        }
        
        // Show modal immediately for better user experience
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('voucherModal'));
        modal.show();
        
        // Update totals and setup listeners after modal is visible (non-blocking)
        setTimeout(() => {
            try {
                this.updateTotal(); // Uses debounce internally
            } catch (error) {
                console.error('Error updating totals during edit:', error);
            }
        
        // Re-setup event listeners
        this.setupModalEventListeners();
        }, 100);
    },

    /**
     * Delete voucher
     */
    async deleteVoucher(id) {
        const voucher = this.allVouchers.find(v => v.id === id);
        if (!voucher) return;
        
        // Check if voucher is posted
        if (voucher.status === 'posted') {
            const confirmResult = await Swal.fire({
                title: 'تحذير!',
                html: `
                    <p>هذا السند <strong>مرحّل</strong> وله قيد عام مسجل.</p>
                    <p>حذفه سيؤثر على الحسابات.</p>
                    <p>هل أنت متأكد من الحذف؟</p>
                `,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'نعم، احذف السند والقيد',
                cancelButtonText: 'إلغاء'
            });
            
            if (!confirmResult.isConfirmed) return;
        } else {
            const result = await Swal.fire({
                title: 'هل أنت متأكد؟',
                text: `هل تريد حذف ${this.getTypeText(voucher.type)} "${voucher.voucherNumber}"؟`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'نعم، احذف',
                cancelButtonText: 'إلغاء'
            });
            
            if (!result.isConfirmed) return;
        }

        try {
            showLoading();
            
            // Delete voucher
            await db.collection('vouchers').doc(id).delete();
            
            // Delete associated general entry if exists
            const generalEntriesSnapshot = await db.collection('generalEntries')
                .where('voucherId', '==', id)
                .get();
            
            const deletePromises = [];
            generalEntriesSnapshot.forEach(doc => {
                deletePromises.push(db.collection('generalEntries').doc(doc.id).delete());
            });
            
            await Promise.all(deletePromises);
            
            hideLoading();
            this.showSuccess('تم حذف السند بنجاح' + (deletePromises.length > 0 ? ' مع القيد المرتبط به' : ''));
            await this.loadVouchers();
        } catch (error) {
            hideLoading();
            console.error('â‌Œ Error deleting voucher:', error);
            this.showError('خطأ في حذف السند: ' + error.message);
        }
    },

    /**
     * Save voucher
     */
    async saveVoucher() {
        try {
            // ⚠️ تعطيل الحقول أثناء الحفظ لمنع التعديلات
            const form = document.getElementById('voucherForm');
            const saveBtn = document.getElementById('saveVoucherBtn');
            
            if (saveBtn) {
                saveBtn.disabled = true;
                const originalText = saveBtn.innerHTML;
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';
                
                try {
                    await this.performSave();
                } finally {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = originalText;
                }
            } else {
                await this.performSave();
            }
        } catch (error) {
            hideLoading();
            console.error('❌ Error saving voucher:', error);
            this.showError('خطأ في حفظ السند: ' + (error.message || 'خطأ غير معروف'));
        }
    },

    /**
     * Perform the actual save operation
     */
    async performSave() {
        try {
            // Validate basic info
            const type = document.getElementById('voucherType').value;
            const voucherNumber = document.getElementById('voucherNumber').value.trim();
            const date = document.getElementById('voucherDate').value;
            const contraAccountId = document.getElementById('voucherContraAccount').value;
            const status = document.getElementById('voucherStatus').value;
            const mainCurrency = document.getElementById('voucherMainCurrency').value;
            
            // Get contra account info
            const contraAccountName = document.getElementById('voucherContraAccount').dataset.accountName;
            const contraAccountCode = document.getElementById('voucherContraAccount').dataset.accountCode;
            
            // Contra account is required for receipt/payment, but optional for journal/entry
            if (!voucherNumber || !date) {
                this.showError('يرجى ملء الحقول المطلوبة (نوع السند، الرقم، التاريخ)');
                return;
            }
            
            if ((type === 'receipt' || type === 'payment' || type === 'journal') && !contraAccountId) {
                this.showError('الحساب المقابل إلزامي لسندات القبض والصرف واليومية');
                return;
            }

            if (!mainCurrency) {
                this.showError('يرجى اختيار العملة الرئيسية للسند');
                return;
            }
            
            // Get cost center info
            const costCenterId = document.getElementById('voucherCostCenter').value;
            let costCenterName = null;
            if (costCenterId) {
                const costCenterSelect = document.getElementById('voucherCostCenter');
                const ccOption = costCenterSelect.options[costCenterSelect.selectedIndex];
                costCenterName = ccOption.dataset.ccName;
            }
            
            // Validate cost center requirement based on settings
            const costCenterRequired = this.voucherSettings?.costCenterRequired || false;
            if (costCenterRequired && !costCenterId) {
                this.showError('مركز الكلفة إلزامي لهذا النوع من السندات. يرجى اختيار مركز كلفة.');
                return;
            }
            
            // Collect entries
            const entries = [];
            const tbody = document.getElementById('voucherEntriesBody');
            const rows = tbody.querySelectorAll('tr');
            
            if (rows.length === 0) {
                this.showError('يرجى إضافة سطر واحد على الأقل في التفاصيل');
                return;
            }
            
            // ⚠️ فحص إضافي: التحقق من وجود بيانات صحيحة في الأقل سطر واحد
            let hasValidEntry = false;
            rows.forEach((row, idx) => {
                const accountId = row.querySelector('.entry-account-id')?.value;
                const creditInput = row.querySelector('.entry-credit');
                const debitInput = row.querySelector('.entry-debit');
                const credit = parseFloat(creditInput?.value || 0);
                const debit = parseFloat(debitInput?.value || 0);
                
                if (accountId && accountId.trim() !== '' && (credit > 0 || debit > 0)) {
                    hasValidEntry = true;
                }
            });
            
            if (!hasValidEntry) {
                this.showError('يرجى إدخال حساب ومبلغ صحيح في الأقل في سطر واحد');
                return;
            }
            
            // Collect entries with proper async handling for exchange rates
            for (let index = 0; index < rows.length; index++) {
                const row = rows[index];
                const accountId = row.querySelector('.entry-account-id').value;
                const accountCode = row.querySelector('.entry-code').value;
                const accountName = row.dataset.accountName;
                const description = row.querySelector('.entry-description').value.trim();
                const currency = row.querySelector('.entry-currency').value;
                const costCenterSelect = row.querySelector('.entry-costCenter');
                let entryCostCenterId = costCenterSelect.value;
                let entryCostCenterName = null;
                
                // If no cost center on entry, inherit from main voucher cost center
                if (!entryCostCenterId && costCenterId) {
                    entryCostCenterId = costCenterId;
                    entryCostCenterName = costCenterName;
                } else if (entryCostCenterId) {
                    // Use entry-level cost center (has priority)
                    entryCostCenterName = costCenterSelect.options[costCenterSelect.selectedIndex].dataset.ccName;
                }
                
                let debit = 0;
                let credit = 0;
                let receipt = '';
                let exchangeRate = 1;
                let localAmount = 0;
                
                if (type === 'journal' || type === 'entry') {
                    // Journal/Entry voucher has both debit and credit per row
                    const debitInput = row.querySelector('.entry-debit');
                    const creditInput = row.querySelector('.entry-credit');
                    debit = parseFloat(debitInput?.value) || 0;
                    credit = parseFloat(creditInput?.value) || 0;

                    if (!accountId || (debit === 0 && credit === 0)) {
                        throw new Error(`السطر ${index + 1}: يرجى اختيار الحساب وإدخال مبلغ في المدين أو الدائن`);
                    }

                    if (debit > 0 && credit > 0) {
                        throw new Error(`السطر ${index + 1}: لا يمكن إدخال مبلغ في المدين والدائن معاً`);
                    }

                    localAmount = debit || credit;
                } else {
                    // Receipt/Payment voucher
                    credit = parseFloat(row.querySelector('.entry-credit').value) || 0;
                    const receiptInput = row.querySelector('.entry-receipt');
                    receipt = receiptInput ? receiptInput.value.trim() : '';
                    localAmount = credit;

                    if (!accountId || credit <= 0) {
                        throw new Error(`السطر ${index + 1}: يرجى اختيار الحساب وإدخال مبلغ صحيح`);
                    }
                }
                
                // Get exchange rate from the row
                const exchangeRateInput = row.querySelector('.entry-exchange-rate');
                if (exchangeRateInput && exchangeRateInput.value) {
                    const rateValue = parseFloat(exchangeRateInput.value);
                    if (!isNaN(rateValue) && rateValue > 0) {
                        exchangeRate = rateValue;
                    }
                }
                
                // Get local amount from the row (if available)
                const localAmountInput = row.querySelector('.entry-local-amount');
                if (localAmountInput && localAmountInput.value && localAmountInput.value.trim() !== '') {
                    const localValue = parseFloat(localAmountInput.value);
                    if (!isNaN(localValue)) {
                        localAmount = localValue;
                    }
                } else {
                    // Calculate local amount if not set or invalid
                    try {
                        const originalAmount = debit || credit;
                        if (originalAmount > 0 && currency !== mainCurrency) {
                            localAmount = await this.convertCurrency(originalAmount, currency, mainCurrency);
                        } else {
                            localAmount = originalAmount;
                        }
                    } catch (error) {
                        console.warn('Could not calculate local amount for entry:', error);
                        localAmount = debit || credit; // fallback to original amount
                    }
                }
                
                entries.push({
                    accountId,
                    accountCode,
                    accountName,
                    debit,
                    credit,
                    description,
                    currency,
                    costCenterId: entryCostCenterId || null,
                    costCenterName: entryCostCenterName,
                    receipt: receipt || null,
                    exchangeRate: exchangeRate,
                    localAmount: localAmount
                });
            }
            
            // Calculate total in main currency — convert all entries in parallel
            const convertedAmounts = await Promise.all(
                entries.map(entry => {
                    const amount = (type === 'journal' || type === 'entry') ? entry.debit : entry.credit;
                    return this.convertCurrency(amount, entry.currency, mainCurrency);
                })
            );
            const totalAmountInMainCurrency = convertedAmounts.reduce((sum, v) => sum + v, 0);

            // âڑ ï¸ڈ IMPORTANT: Only ENTRY vouchers need balance validation
            // Journal vouchers DON'T need balance because contra account will be the inverse
            if (type === 'entry') {
                console.log('ًں”چ Validating ENTRY voucher balance...');
                
                // Check cost center balance
                const costCenterBalance = this.validateCostCenterBalance(entries);
                if (!costCenterBalance.isBalanced) {
                    throw new Error(`عدم التوازن في مركز الكلفة "${costCenterBalance.costCenterName}": المدين (${this.formatCurrency(costCenterBalance.totalDebit)}) ≠ الدائن (${this.formatCurrency(costCenterBalance.totalCredit)})`);
                }
                
                // Check overall balance (debit must equal credit)
                let totalDebitOverall = 0;
                let totalCreditOverall = 0;
                
                for (const entry of entries) {
                    totalDebitOverall += parseFloat(entry.debit || 0);
                    totalCreditOverall += parseFloat(entry.credit || 0);
                }
                
                if (Math.abs(totalDebitOverall - totalCreditOverall) > 0.01) {
                    throw new Error(`سند القيد غير متوازن! المدين (${this.formatCurrency(totalDebitOverall)}) ≠ الدائن (${this.formatCurrency(totalCreditOverall)})`);
                }
                
                console.log('âœ… Entry voucher is balanced');
            } else if (type === 'journal') {
                console.log('â„¹ï¸ڈ Journal voucher - no balance check needed (contra account will be inverse)');
            }
            
            showLoading();

            // Get contra account currency
            let contraAccountCurrency = null;
            if (contraAccountId) {
                try {
                    await ChartOfAccountsModule.getAccounts();
                    const account = ChartOfAccountsModule.getAccountById(contraAccountId);
                    if (account) {
                        contraAccountCurrency = account.currency || 'IQD';
                        
                        // If account doesn't have currency, get base currency
                        if (!account.currency) {
                            const currenciesSnapshot = await db.collection('currencies')
                                .where('isBaseCurrency', '==', true)
                                .limit(1)
                                .get();
                            
                            if (!currenciesSnapshot.empty) {
                                contraAccountCurrency = currenciesSnapshot.docs[0].data().code || 'IQD';
                            }
                        }
                    }
                } catch (error) {
                    console.log('Could not load contra account currency:', error);
                    contraAccountCurrency = 'IQD';
                }
            }

            // Build formData based on voucher type
            const formData = {
                type: type,
                voucherNumber: voucherNumber,
                date: date,
                mainCurrency: mainCurrency,
                costCenterId: costCenterId || null,
                costCenterName: costCenterName,
                entries: entries,
                totalAmount: totalAmountInMainCurrency,
                currency: mainCurrency, // Use main currency for voucher display
                status: status,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // Add contra account fields for receipt, payment, and journal vouchers (entry doesn't need it)
            if (type === 'receipt' || type === 'payment' || type === 'journal') {
                formData.contraAccountId = contraAccountId;
                formData.contraAccountName = contraAccountName;
                formData.contraAccountCode = contraAccountCode;
                formData.contraAccountCurrency = contraAccountCurrency;
            }

            if (this.editingVoucher) {
                // Check if status changed from draft to posted
                const oldStatus = this.editingVoucher.status;
                const newStatus = status;
                
                // ⚠️ تأكيد عند تعديل سند مرحّل
                if (oldStatus === 'posted' || newStatus === 'posted') {
                    const isModifyingPosted = oldStatus === 'posted';
                    const isPosting = oldStatus === 'draft' && newStatus === 'posted';
                    
                    if (isModifyingPosted || isPosting) {
                        const confirmMessage = isModifyingPosted ? 
                            '<p>هذا السند <strong>مرحّل</strong>.</p><p>التعديل سيحدث القيد العام المرتبط.</p><p>هل تريد المتابعة؟</p>' :
                            '<p>سيتم ترحيل هذا السند.</p><p>سيتم إنشاء قيد عام.</p><p>هل تريد المتابعة؟</p>';
                        
                        const confirm = await Swal.fire({
                            title: '⚠️ تأكيد العملية',
                            html: confirmMessage,
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'نعم، احفظ',
                            cancelButtonText: 'إلغاء',
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33'
                        });
                        
                        if (!confirm.isConfirmed) {
                            hideLoading();
                            return;
                        }
                    }
                }
                
                await db.collection('vouchers').doc(this.editingVoucher.id).update(formData);
                
                // Handle general entry updates
                if (oldStatus === 'draft' && newStatus === 'posted') {
                    // Creating new general entry when posting draft
                    await this.createGeneralEntry(this.editingVoucher.id, formData);
                } else if (oldStatus === 'posted' && newStatus === 'posted') {
                    // Updating existing general entry when modifying posted voucher
                    await this.updateGeneralEntry(this.editingVoucher.id, formData);
                }
                // Note: If changing from posted to draft, we don't delete the general entry
                // as the user might want to repost it later
                
                this.showSuccess('تم تحديث السند بنجاح');
            } else {
                formData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                formData.createdBy = firebase.auth().currentUser?.uid || 'unknown';
                const docRef = await db.collection('vouchers').add(formData);
                
                // If posting the voucher immediately, create general entry
                if (status === 'posted') {
                    await this.createGeneralEntry(docRef.id, formData);
                }
                
                this.showSuccess('تم إضافة السند بنجاح');
            }

            hideLoading();
            bootstrap.Modal.getOrCreateInstance(document.getElementById('voucherModal')).hide();
            await this.loadVouchers();
        } catch (error) {
            hideLoading();
            console.error('❌ Error in performSave:', error);
            // Re-throw to be handled by saveVoucher
            throw error;
        }
    },

    /**
     * Clean FieldValue objects from data (to avoid query errors)
     */
    cleanFieldValueObjects(data) {
        if (!data || typeof data !== 'object') {
            return data;
        }
        
        const cleaned = {};
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const value = data[key];
                
                // Check if it's a Firestore Timestamp
                if (value && typeof value === 'object' && value.toDate && typeof value.toDate === 'function') {
                    try {
                        cleaned[key] = value.toDate();
                    } catch (e) {
                        cleaned[key] = new Date();
                    }
                }
                // Check if it's a FieldValue (serverTimestamp, etc.)
                else if (value && typeof value === 'object' && (
                    value._method === 'serverTimestamp' || 
                    value._delegate || 
                    (value.constructor && value.constructor.name === 'FieldValue') ||
                    (value.toString && value.toString().includes('FieldValue'))
                )) {
                    // Convert to current date
                    cleaned[key] = new Date();
                }
                // If it's an array, clean each element
                else if (Array.isArray(value)) {
                    cleaned[key] = value.map(item => this.cleanFieldValueObjects(item));
                }
                // If it's an object, clean recursively
                else if (value && typeof value === 'object' && !(value instanceof Date)) {
                    cleaned[key] = this.cleanFieldValueObjects(value);
                }
                else {
                    cleaned[key] = value;
                }
            }
        }
        
        return cleaned;
    },

    /**
     * Setup real-time sync for vouchers module
     */
    setupVouchersSync() {
        if (typeof SyncManager !== 'undefined') {
            // Sync vouchers
            SyncManager.onCollectionSync('vouchers', (data, syncType) => {
                this.allVouchers = data;
                this.renderTable();
                console.log(`🔄 Vouchers updated via ${syncType} sync`);
            });

            // Sync general entries
            SyncManager.onCollectionSync('generalEntries', (data, syncType) => {
                console.log(`🔄 General entries updated via ${syncType} sync`);
            });

            // Sync chart of accounts
            SyncManager.onCollectionSync('chartOfAccounts', (data, syncType) => {
                ChartOfAccountsModule.allAccounts = data;
                console.log(`🔄 Chart of accounts updated via ${syncType} sync`);
            });

            // Sync cost centers
            SyncManager.onCollectionSync('costCenters', (data, syncType) => {
                console.log(`🔄 Cost centers updated via ${syncType} sync`);
            });

            // Sync currencies (invalidate cache on change)
            SyncManager.onCollectionSync('currencies', (data, syncType) => {
                console.log(`🔄 Currencies updated via ${syncType} sync`);
                this.invalidateCurrenciesCache();
            });
        }

        // Also listen to custom events
        window.addEventListener('dataSync', (event) => {
            const { collection, data } = event.detail;
            if (collection === 'vouchers') {
                this.allVouchers = data;
                this.renderTable();
            }
        });
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VouchersModule;
}


