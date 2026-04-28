/**
 * Currencies Module - إدارة العملات
 * Manages different currencies and exchange rates.
 */

const CurrenciesModule = {
    currentPage: 1,
    itemsPerPage: 10,
    allCurrencies: [],
    filteredCurrencies: [],
    editingCurrency: null,
    baseCurrency: null,

    getHTML() {
        return `
            <section id="currencies" class="currencies-module">
                <!-- Header -->
                <div class="currencies-header-modern">
                    <div class="header-content-wrapper">
                        <div class="header-icon-box">
                            <i class="fas fa-coins"></i>
                        </div>
                        <div class="header-text-box">
                            <h1 class="header-title">إدارة العملات</h1>
                            <p class="header-subtitle">إدارة العملات وأسعار الصرف</p>
                        </div>
                    </div>
                    <div class="header-actions-box">
                        <button class="btn-modern btn-modern-primary" id="addCurrencyBtn">
                            <i class="fas fa-plus-circle"></i>
                            <span>إضافة عملة جديدة</span>
                        </button>
                    </div>
                </div>

                <!-- Base Currency Info -->
                <div class="base-currency-card" id="baseCurrencyCard" style="display: none;">
                    <div class="base-currency-icon">
                        <i class="fas fa-star"></i>
                    </div>
                    <div class="base-currency-info">
                        <h6>العملة الأساسية</h6>
                        <h4 id="baseCurrencyName">-</h4>
                        <p class="text-muted mb-0">جميع الأسعار والمبالغ تُحسب بالنسبة لهذه العملة</p>
                    </div>
                    <div class="base-currency-badge">
                        <span class="badge bg-warning">
                            <i class="fas fa-crown"></i> افتراضية
                        </span>
                    </div>
                </div>

                <!-- Search & Filters -->
                <div class="currencies-filters-modern">
                    <div class="filters-container">
                        <div class="filter-item filter-search">
                            <div class="search-box-modern">
                                <i class="fas fa-search search-icon"></i>
                                <input type="text" class="search-input-modern" id="searchCurrencies" 
                                       placeholder="ابحث عن عملة...">
                            </div>
                        </div>
                        <div class="filter-item">
                            <div class="select-box-modern">
                                <i class="fas fa-filter"></i>
                                <select class="select-modern" id="currencyStatusFilter">
                                    <option value="">كل الحالات</option>
                                    <option value="active">نشط</option>
                                    <option value="inactive">غير نشط</option>
                                </select>
                            </div>
                        </div>
                        <div class="filter-item">
                            <button class="btn-modern btn-modern-clear" id="clearCurrencyFiltersBtn">
                                <i class="fas fa-times-circle"></i>
                                <span>مسح الفلاتر</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Currencies Table -->
                <div class="currencies-table-modern">
                    <div class="table-wrapper-modern">
                        <table class="table-modern currencies-table">
                            <thead>
                                <tr>
                                    <th width="5%">#</th>
                                    <th width="10%">الكود</th>
                                    <th width="25%">الاسم</th>
                                    <th width="10%">الرمز</th>
                                    <th width="15%">سعر الصرف</th>
                                    <th width="15%">آخر تحديث</th>
                                    <th width="10%">الحالة</th>
                                    <th width="10%">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="currenciesTableBody">
                                <tr class="loading-row">
                                    <td colspan="8">
                                        <div class="loading-state-modern">
                                            <div class="spinner-border loading-spinner" role="status">
                                                <span class="visually-hidden">جاري التحميل...</span>
                                            </div>
                                            <h5 class="loading-text">جاري تحميل العملات...</h5>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- Pagination -->
                    <div class="pagination-wrapper">
                        <nav>
                            <ul class="pagination mb-0" id="currenciesPagination"></ul>
                        </nav>
                    </div>
                </div>
            </section>
        `;
    },

    render() {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = this.getHTML();
        }
    },

    async load() {
        console.log('💱 Loading currencies module...');
        this.render();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load currencies
        await this.loadCurrencies();
        
        console.log('✅ Currencies module loaded');
    },

    /**
     * Initialize the Currencies module.
     */
    async initialize() {
        try {
            console.log('💱 Initializing Currencies module...');
            this.setupEventListeners();
            await this.loadCurrencies();
            console.log('✅ Currencies module initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Currencies module:', error);
            this.showError('خطأ في تهيئة إدارة العملات');
        }
    },

    /**
     * Setup event listeners for the module.
     */
    setupEventListeners() {
        // Set base currency button
        document.getElementById('setBaseCurrencyBtn')?.addEventListener('click', () => {
            this.showSetBaseCurrencyDialog();
        });

        // Add currency button
        document.getElementById('addCurrencyBtn')?.addEventListener('click', () => {
            this.showAddEditCurrencyModal();
        });

        // Save currency button
        document.getElementById('saveCurrencyBtn')?.addEventListener('click', () => {
            this.saveCurrency();
        });

        // Search currencies
        document.getElementById('searchCurrencies')?.addEventListener('input', () => {
            this.filterCurrencies();
        });

        // Currency status filter
        document.getElementById('currencyStatusFilter')?.addEventListener('change', () => {
            this.filterCurrencies();
        });

        // Clear filters
        document.getElementById('clearCurrencyFiltersBtn')?.addEventListener('click', () => {
            this.clearFilters();
        });
    },

    /**
     * Load currencies from Firebase.
     */
    async loadCurrencies() {
        try {
            console.log('💱 Loading currencies from database...');
            
            if (!db) {
                console.error('❌ Firebase database not initialized');
                this.showError('قاعدة البيانات غير متصلة. يرجى تسجيل الدخول أولاً.');
                return;
            }

            // Load all currencies without orderBy to avoid index requirement
            const currenciesSnapshot = await db.collection('currencies').get();

            this.allCurrencies = [];
            this.baseCurrency = null;

            currenciesSnapshot.forEach(doc => {
                const currency = {
                    id: doc.id,
                    ...doc.data()
                };
                this.allCurrencies.push(currency);
                
                if (currency.isBaseCurrency) {
                    this.baseCurrency = currency;
                }
            });

            // Sort in JavaScript: base currency first, then by code
            this.allCurrencies.sort((a, b) => {
                if (a.isBaseCurrency) return -1;
                if (b.isBaseCurrency) return 1;
                return (a.code || '').localeCompare(b.code || '');
            });

            this.filteredCurrencies = [...this.allCurrencies];
            this.renderTable();
            this.updateBaseCurrencyUI();

            console.log(`✅ Loaded ${this.allCurrencies.length} currencies from database`);
        } catch (error) {
            console.error('❌ Error loading currencies:', error);
            
            if (error.code === 'permission-denied') {
                this.showError('ليس لديك صلاحية الوصول إلى العملات. يرجى التحقق من صلاحياتك أو تحديث قواعد Firebase.');
            } else if (error.code === 'unavailable') {
                this.showError('لا يمكن الاتصال بقاعدة البيانات. يرجى التحقق من الاتصال بالإنترنت.');
            } else {
                this.showError('خطأ في تحميل العملات: ' + (error.message || 'خطأ غير معروف'));
            }
        }
    },

    /**
     * Update base currency UI elements.
     */
    updateBaseCurrencyUI() {
        const baseCurrencyCard = document.getElementById('baseCurrencyCard');
        const baseCurrencyName = document.getElementById('baseCurrencyName');

        if (this.baseCurrency && baseCurrencyCard && baseCurrencyName) {
            baseCurrencyCard.style.display = 'flex';
            baseCurrencyName.textContent = `${this.baseCurrency.name} (${this.baseCurrency.code}) - ${this.baseCurrency.symbol}`;
        } else if (baseCurrencyCard) {
            baseCurrencyCard.style.display = 'none';
        }
    },

    /**
     * Show set base currency dialog.
     */
    async showSetBaseCurrencyDialog() {
        const result = await Swal.fire({
            title: 'تعريف العملة الأساسية',
            html: `
                <p>ستقوم بتعريف العملة الأساسية للنظام</p>
                <p class="text-warning"><strong>⚠️ تنبيه:</strong></p>
                <ul class="text-start">
                    <li>العملة الأساسية لا يمكن تعديلها أو حذفها</li>
                    <li>سعر صرفها دائماً = 1</li>
                    <li>جميع العملات الأخرى ستُنسب إليها</li>
                </ul>
            `,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'متابعة',
            cancelButtonText: 'إلغاء'
        });

        if (result.isConfirmed) {
            this.showAddEditCurrencyModal(null, true);
        }
    },

    /**
     * Filter currencies based on search term and status.
     */
    filterCurrencies() {
        const searchTerm = document.getElementById('searchCurrencies').value.toLowerCase();
        const status = document.getElementById('currencyStatusFilter').value;

        this.filteredCurrencies = this.allCurrencies.filter(currency => {
            const matchesSearch = !searchTerm ||
                currency.name.toLowerCase().includes(searchTerm) ||
                currency.code.toLowerCase().includes(searchTerm) ||
                currency.symbol.toLowerCase().includes(searchTerm);

            const matchesStatus = !status || currency.status === status;

            return matchesSearch && matchesStatus;
        });

        this.currentPage = 1;
        this.renderTable();
    },

    /**
     * Clear all filters.
     */
    clearFilters() {
        document.getElementById('searchCurrencies').value = '';
        document.getElementById('currencyStatusFilter').value = '';
        this.filterCurrencies();
    },

    /**
     * Render the currencies table.
     */
    renderTable() {
        const tbody = document.getElementById('currenciesTableBody');
        if (!tbody) return;
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageCurrencies = this.filteredCurrencies.slice(startIndex, endIndex);

        tbody.innerHTML = '';

        if (this.filteredCurrencies.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state-row">
                    <td colspan="8">
                        <div class="empty-state-modern">
                            <div class="empty-icon">
                                <i class="fas fa-coins"></i>
                            </div>
                            <h4>لا توجد عملات</h4>
                            <p>ابدأ بإضافة العملة الأساسية للنظام</p>
                            <button class="btn-modern btn-modern-primary" onclick="CurrenciesModule.showAddEditCurrencyModal(null, true)">
                                <i class="fas fa-star"></i>
                                <span>تعريف العملة الأساسية</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            this.renderPagination();
            return;
        }

        pageCurrencies.forEach((currency, index) => {
            const isBase = currency.isBaseCurrency;
            const row = document.createElement('tr');
            row.className = isBase ? 'currency-row-modern base-currency-row' : 'currency-row-modern';
            row.innerHTML = `
                <td class="text-center">
                    <div class="row-number-modern">${startIndex + index + 1}</div>
                </td>
                <td>
                    <div class="currency-code-modern">
                        ${currency.code}
                        ${isBase ? '<i class="fas fa-star text-warning ms-2" title="العملة الأساسية"></i>' : ''}
                    </div>
                </td>
                <td>
                    <div class="currency-name-modern">${currency.name}</div>
                </td>
                <td class="text-center">
                    <div class="currency-symbol-modern">${currency.symbol}</div>
                </td>
                <td class="text-center">
                    <div class="exchange-rate-modern ${isBase ? 'base-rate' : ''}">
                        ${isBase ? '1.0000' : (currency.exchangeRate || 1).toFixed(4)}
                        ${isBase ? '<small>أساسية</small>' : `<small>/ ${this.baseCurrency ? this.baseCurrency.code : 'BASE'}</small>`}
                    </div>
                </td>
                <td class="text-center">
                    <small class="text-muted">
                        ${currency.updatedAt ? this.formatDate(currency.updatedAt) : '-'}
                    </small>
                </td>
                <td class="text-center">
                    <div class="status-badge-modern status-${currency.status}">
                        <i class="fas fa-circle"></i>
                        <span>${currency.status === 'active' ? 'نشط' : 'غير نشط'}</span>
                    </div>
                </td>
                <td class="text-center">
                    <div class="actions-modern">
                        ${!isBase && currency.rateHistory && currency.rateHistory.length > 1 ? `
                            <button class="action-btn-modern action-history" 
                                    onclick="CurrenciesModule.showRateHistory('${currency.id}')" 
                                    title="تاريخ الأسعار">
                                <i class="fas fa-history"></i>
                            </button>
                        ` : ''}
                        <button class="action-btn-modern action-edit ${isBase ? 'disabled' : ''}" 
                                onclick="CurrenciesModule.editCurrency('${currency.id}')" 
                                title="${isBase ? 'لا يمكن تعديل العملة الأساسية' : 'تعديل'}"
                                ${isBase ? 'disabled' : ''}>
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn-modern action-delete ${isBase ? 'disabled' : ''}" 
                                onclick="CurrenciesModule.deleteCurrency('${currency.id}')" 
                                title="${isBase ? 'لا يمكن حذف العملة الأساسية' : 'حذف'}"
                                ${isBase ? 'disabled' : ''}>
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
     * Render pagination.
     */
    renderPagination() {
        const totalPages = Math.ceil(this.filteredCurrencies.length / this.itemsPerPage);
        const pagination = document.getElementById('currenciesPagination');

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="CurrenciesModule.goToPage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="CurrenciesModule.goToPage(${i})">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="CurrenciesModule.goToPage(${this.currentPage + 1})">
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
        const totalPages = Math.ceil(this.filteredCurrencies.length / this.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderTable();
        }
    },

    /**
     * Show add/edit currency modal.
     */
    async showAddEditCurrencyModal(currencyId = null, isBaseCurrency = false) {
        this.editingCurrency = null;
        
        // Clear form
        const codeInput = document.getElementById('currencyCode');
        const nameInput = document.getElementById('currencyName');
        const symbolInput = document.getElementById('currencySymbol');
        const rateInput = document.getElementById('currencyExchangeRate');
        const statusSelect = document.getElementById('currencyStatus');
        
        if (codeInput) codeInput.value = '';
        if (nameInput) nameInput.value = '';
        if (symbolInput) symbolInput.value = '';
        if (rateInput) rateInput.value = '1';
        if (statusSelect) statusSelect.value = 'active';

        // Check if this is the first currency (will be base currency)
        const isFirstCurrency = this.allCurrencies.length === 0 || isBaseCurrency;

        if (currencyId) {
            const currency = this.allCurrencies.find(cur => cur.id === currencyId);
            if (currency) {
                // Prevent editing base currency
                if (currency.isBaseCurrency) {
                    this.showError('لا يمكن تعديل العملة الأساسية');
                    return;
                }

                this.editingCurrency = currency;
                
                if (codeInput) codeInput.value = currency.code;
                if (nameInput) nameInput.value = currency.name;
                if (symbolInput) symbolInput.value = currency.symbol;
                if (rateInput) rateInput.value = currency.exchangeRate || 1;
                if (statusSelect) statusSelect.value = currency.status;
                
                // Disable code editing for existing currency
                if (codeInput) codeInput.readOnly = true;
            }
        } else {
            if (codeInput) codeInput.readOnly = false;
            
            // Set default exchange rate for non-base currencies
            if (!isFirstCurrency && rateInput) {
                rateInput.value = '1';
            }
        }

        const modal = new bootstrap.Modal(document.getElementById('currencyModal'));
        modal.show();
    },

    /**
     * Edit currency
     */
    editCurrency(currencyId) {
        this.showAddEditCurrencyModal(currencyId, false);
    },

    /**
     * Save currency (add or edit).
     */
    async saveCurrency() {
        try {
            if (!this.validateCurrencyForm()) {
                return;
            }

            showLoading();

            const isFirstCurrency = this.allCurrencies.length === 0;
            const code = document.getElementById('currencyCode').value.trim().toUpperCase();
            const name = document.getElementById('currencyName').value.trim();
            const symbol = document.getElementById('currencySymbol').value.trim();
            const status = document.getElementById('currencyStatus').value;
            const notes = document.getElementById('currencyNotes')?.value.trim() || '';
            
            let exchangeRate = 1;
            if (!isFirstCurrency && !this.editingCurrency?.isBaseCurrency) {
                exchangeRate = parseFloat(document.getElementById('currencyExchangeRate').value) || 1;
            }

            const formData = {
                code: code,
                name: name,
                symbol: symbol,
                exchangeRate: exchangeRate,
                isBaseCurrency: isFirstCurrency,
                status: status,
                notes: notes,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (this.editingCurrency) {
                // Update existing currency
                console.log('🔄 Updating currency:', this.editingCurrency.id);
                
                // Check if exchange rate changed
                const rateChanged = this.editingCurrency.exchangeRate !== exchangeRate;
                
                if (rateChanged && !this.editingCurrency.isBaseCurrency) {
                    // Add new rate to history
                    const currentHistory = this.editingCurrency.rateHistory || [];
                    formData.rateHistory = [
                        ...currentHistory,
                        {
                            date: new Date(),
                            rate: exchangeRate,
                            previousRate: this.editingCurrency.exchangeRate,
                            updatedBy: authService.getCurrentUser()?.uid || 'system',
                            updatedAt: new Date()
                        }
                    ];
                    
                    console.log('📈 Exchange rate changed:', {
                        from: this.editingCurrency.exchangeRate,
                        to: exchangeRate,
                        historyLength: formData.rateHistory.length
                    });
                }
                
                await db.collection('currencies').doc(this.editingCurrency.id).update(formData);
                
                hideLoading();
                
                await Swal.fire({
                    title: 'تم التحديث!',
                    text: rateChanged ? 'تم تحديث العملة وحفظ السعر في التاريخ' : 'تم تحديث العملة بنجاح',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                // Add new currency
                console.log('➕ Adding new currency:', code);
                formData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                
                // Add rate history
                formData.rateHistory = [{
                    date: new Date(),
                    rate: exchangeRate,
                    updatedBy: 'system'
                }];
                
                await db.collection('currencies').add(formData);
                
                hideLoading();
                
                await Swal.fire({
                    title: isFirstCurrency ? '🎉 عملة أساسية!' : 'تمت الإضافة!',
                    text: isFirstCurrency ? 'تم تعريف العملة الأساسية بنجاح' : 'تم إضافة العملة بنجاح',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }

            const modalElement = document.getElementById('currencyModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            }
            
            await this.loadCurrencies();
            
        } catch (error) {
            hideLoading();
            console.error('❌ Error saving currency:', error);
            this.showError('خطأ في حفظ العملة: ' + error.message);
        }
    },

    /**
     * Delete currency.
     */
    async deleteCurrency(currencyId) {
        const currency = this.allCurrencies.find(cur => cur.id === currencyId);
        if (!currency) return;

        // Prevent deleting base currency
        if (currency.isBaseCurrency) {
            this.showError('لا يمكن حذف العملة الأساسية');
            return;
        }

        const result = await Swal.fire({
            title: 'تأكيد الحذف',
            text: `هل تريد حذف العملة "${currency.name}" (${currency.code})؟`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e74c3c',
            cancelButtonColor: '#95a5a6',
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء'
        });

        if (result.isConfirmed) {
            try {
                showLoading();
                
                // Check if currency is used by any product
                const productsSnapshot = await db.collection('products')
                    .where('currency', '==', currency.code)
                    .limit(1)
                    .get();
                
                if (!productsSnapshot.empty) {
                    hideLoading();
                    this.showError('لا يمكن حذف هذه العملة لأنها مستخدمة في منتجات. قم بتغيير عملة المنتجات أولاً.');
                    return;
                }
                
                await db.collection('currencies').doc(currencyId).delete();
                
                hideLoading();
                
                await Swal.fire({
                    title: 'تم الحذف!',
                    text: 'تم حذف العملة بنجاح',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                await this.loadCurrencies();
                
            } catch (error) {
                hideLoading();
                console.error('❌ Error deleting currency:', error);
                this.showError('خطأ في حذف العملة: ' + error.message);
            }
        }
    },

    /**
     * Validate currency form.
     */
    validateCurrencyForm() {
        const code = document.getElementById('currencyCode').value.trim().toUpperCase();
        const name = document.getElementById('currencyName').value.trim();
        const symbol = document.getElementById('currencySymbol').value.trim();
        const isFirstCurrency = this.allCurrencies.length === 0;

        if (!code || code.length !== 3) {
            document.getElementById('currencyCode').focus();
            this.showError('يرجى إدخال كود العملة (3 أحرف)');
            return false;
        }

        if (!name) {
            document.getElementById('currencyName').focus();
            this.showError('يرجى إدخال اسم العملة');
            return false;
        }

        if (!symbol) {
            document.getElementById('currencySymbol').focus();
            this.showError('يرجى إدخال رمز العملة');
            return false;
        }

        if (!isFirstCurrency && !this.editingCurrency?.isBaseCurrency) {
            const exchangeRate = parseFloat(document.getElementById('currencyExchangeRate').value);
            if (!exchangeRate || exchangeRate <= 0) {
                document.getElementById('currencyExchangeRate').focus();
                this.showError('يرجى إدخال سعر صرف صحيح');
                return false;
            }
        }

        // Check if code is unique
        const existingCode = this.allCurrencies.find(cur =>
            cur.code.toUpperCase() === code &&
            (!this.editingCurrency || cur.id !== this.editingCurrency.id)
        );
        if (existingCode) {
            document.getElementById('currencyCode').focus();
            this.showError('⚠️ كود العملة موجود مسبقاً!');
            return false;
        }

        return true;
    },

    /**
     * Format date
     */
    formatDate(date) {
        if (!date) return '-';
        try {
            const d = date.toDate ? date.toDate() : new Date(date);
            return d.toLocaleDateString('ar-EG', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (error) {
            return '-';
        }
    },

    /**
     * Get status class for styling.
     */
    getStatusClass(status) {
        return status === 'active' ? 'status-active' : 'status-inactive';
    },

    /**
     * Get status text in Arabic.
     */
    getStatusText(status) {
        return status === 'active' ? 'نشط' : 'غير نشط';
    },

    /**
     * Show rate history
     */
    async showRateHistory(currencyId) {
        const currency = this.allCurrencies.find(c => c.id === currencyId);
        if (!currency || !currency.rateHistory) return;

        const history = [...currency.rateHistory].reverse(); // أحدث أولاً
        
        let historyHTML = `
            <div class="rate-history-container">
                <h6 class="text-muted mb-3">
                    <i class="fas fa-coins me-2"></i>
                    ${currency.name} (${currency.code})
                </h6>
                <div class="table-responsive">
                    <table class="table table-sm table-hover">
                        <thead>
                            <tr>
                                <th>التاريخ</th>
                                <th>السعر</th>
                                <th>التغيير</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        history.forEach((record, index) => {
            const date = this.formatDate(record.date);
            const rate = record.rate.toFixed(4);
            let changeHTML = '-';
            
            if (record.previousRate) {
                const change = ((record.rate - record.previousRate) / record.previousRate * 100).toFixed(2);
                const changeClass = change >= 0 ? 'text-success' : 'text-danger';
                const changeIcon = change >= 0 ? '↑' : '↓';
                changeHTML = `<span class="${changeClass}">${changeIcon} ${Math.abs(change)}%</span>`;
            }
            
            historyHTML += `
                <tr>
                    <td><small>${date}</small></td>
                    <td><strong>${rate}</strong></td>
                    <td>${changeHTML}</td>
                </tr>
            `;
        });
        
        historyHTML += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        await Swal.fire({
            title: 'تاريخ أسعار الصرف',
            html: historyHTML,
            icon: 'info',
            confirmButtonText: 'إغلاق',
            width: '600px'
        });
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
            timer: 3000,
            timerProgressBar: true
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
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('currencies')) {
        CurrenciesModule.initialize();
    }
});
