/**
 * Chart of Accounts Module - شجرة الحسابات
 * Manages the hierarchical chart of accounts for the accounting system.
 */

const ChartOfAccountsModule = {
    currentPage: 1,
    itemsPerPage: 10,
    allAccounts: [],
    filteredAccounts: [],
    editingAccount: null,
    viewMode: 'tree', // 'tree' or 'table'
    expandedNodes: new Set(),
    allExpanded: false,
    
    // Cache for balances
    balanceCache: {
        data: null,
        timestamp: null,
        duration: 5 * 60 * 1000 // 5 minutes
    },
    
    // Cache for currencies
    currenciesCache: {
        data: null,
        timestamp: null,
        duration: 10 * 60 * 1000 // 10 minutes
    },

    /**
     * Get HTML for chart of accounts module
     */
    getHTML() {
        return `
            <section id="chart-of-accounts" class="chart-of-accounts-module">
                <!-- Header -->
                <div class="accounts-header-modern">
                    <div class="header-content-wrapper">
                        <div class="header-icon-box">
                            <i class="fas fa-sitemap"></i>
                        </div>
                        <div class="header-text-box">
                            <h1 class="header-title">شجرة الحسابات</h1>
                            <p class="header-subtitle">نظام محاسبي متكامل</p>
                        </div>
                    </div>
                    <div class="header-actions-box">
                        <button class="btn-modern btn-modern-success" id="createMainAccountsBtn">
                            <i class="fas fa-magic"></i>
                            <span>إنشاء الحسابات الرئيسية</span>
                        </button>
                        <button class="btn-modern btn-modern-primary" id="addAccountBtn">
                            <i class="fas fa-plus-circle"></i>
                            <span>إضافة حساب</span>
                        </button>
                    </div>
                </div>

                <!-- View Controls -->
                <div class="accounts-controls-modern">
                    <div class="controls-left">
                        <!-- View Mode -->
                        <div class="view-mode-toggle">
                            <button class="view-btn active" data-view="tree" id="treeViewBtn">
                                <i class="fas fa-sitemap"></i>
                                <span>عرض شجري</span>
                            </button>
                            <button class="view-btn" data-view="table" id="tableViewBtn">
                                <i class="fas fa-table"></i>
                                <span>عرض جدولي</span>
                            </button>
                        </div>
                        
                        <!-- Expand/Collapse Button (Tree View Only) -->
                        <button class="btn-modern btn-modern-outline" id="expandCollapseAllBtn" style="display: none;">
                            <i class="fas fa-expand-arrows-alt"></i>
                            <span id="expandCollapseText">توسيع الكل</span>
                        </button>
                    </div>
                    
                    <div class="controls-right">
                        <!-- Search & Filters -->
                        <div class="search-box-modern">
                            <i class="fas fa-search search-icon"></i>
                            <input type="text" class="search-input-modern" id="searchAccounts" 
                                   placeholder="ابحث عن حساب...">
                        </div>
                        
                        <div class="select-box-modern">
                            <i class="fas fa-filter"></i>
                            <select class="select-modern" id="accountTypeFilter">
                                <option value="">كل الأنواع</option>
                                <option value="assets">الأصول</option>
                                <option value="liabilities">الخصوم</option>
                                <option value="equity">حقوق الملكية</option>
                                <option value="revenue">الإيرادات</option>
                                <option value="expenses">المصروفات</option>
                            </select>
                        </div>
                        
                        <button class="btn-modern btn-modern-clear" id="clearAccountFiltersBtn">
                            <i class="fas fa-times-circle"></i>
                            <span>مسح</span>
                        </button>
                    </div>
                </div>

                <!-- Tree View Container -->
                <div id="treeViewContainer" class="tree-view-container">
                    <div class="tree-view-modern">
                        <div id="accountsTree" class="accounts-tree">
                            <!-- Tree will be rendered here -->
                        </div>
                    </div>
                </div>

                <!-- Table View Container -->
                <div id="tableViewContainer" class="table-view-container" style="display: none;">
                    <div class="accounts-table-modern">
                        <div class="table-wrapper-modern">
                            <table class="table-modern accounts-table">
                                    <thead>
                                        <tr>
                                            <th width="8%">الكود</th>
                                            <th width="25%">اسم الحساب</th>
                                            <th width="10%">النوع</th>
                                            <th width="10%">الطبيعة</th>
                                            <th width="8%">العملة</th>
                                            <th width="12%">الرصيد</th>
                                            <th width="10%">الحالة</th>
                                            <th width="17%">الإجراءات</th>
                                        </tr>
                                    </thead>
                                <tbody id="accountsTableBody">
                                    <!-- Table rows will be rendered here -->
                                </tbody>
                            </table>
                        </div>

                        <!-- Table Footer: Summary + Page Size -->
                        <div class="table-footer-modern">
                            <div class="table-summary" id="accountsTableSummary">
                                <!-- سيتم تعبئة ملخص الجدول هنا -->
                            </div>
                            <div class="table-page-size">
                                <label for="itemsPerPageSelect">صفوف في الصفحة:</label>
                                <select id="itemsPerPageSelect">
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- Pagination -->
                        <div class="pagination-wrapper">
                            <nav>
                                <ul class="pagination mb-0" id="accountsPagination"></ul>
                            </nav>
                        </div>
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
     * Initialize the Chart of Accounts module.
     */
    async initialize() {
        try {
            console.log('🌳 Initializing Chart of Accounts module...');
            this.render();
            this.setupEventListeners();
            
            // Listen for general entries changes to invalidate balance cache
            if (typeof SyncManager !== 'undefined') {
                SyncManager.onCollectionSync('generalEntries', () => {
                    console.log('🔄 General entries changed, invalidating balance cache');
                    this.invalidateBalanceCache();
                    // Recalculate balances if module is visible
                    if (document.getElementById('chart-of-accounts')) {
                        this.calculateAndDisplayBalances();
                    }
                });
            }
            
            // Listen for currency changes to invalidate currency cache
            if (typeof SyncManager !== 'undefined') {
                SyncManager.onCollectionSync('currencies', () => {
                    console.log('🔄 Currencies changed, invalidating caches');
                    this.invalidateCurrenciesCache();
                    this.invalidateBalanceCache();
                    // Recalculate balances if module is visible
                    if (document.getElementById('chart-of-accounts')) {
                        this.calculateAndDisplayBalances();
                    }
                });
            }
            
            await this.loadAccounts();
            console.log('✅ Chart of Accounts module initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Chart of Accounts module:', error);
            this.showError('خطأ في تهيئة شجرة الحسابات');
        }
    },

    /**
     * Setup event listeners for the module.
     */
    setupEventListeners() {
        // Create main accounts button
        document.getElementById('createMainAccountsBtn')?.addEventListener('click', () => {
            this.createMainAccounts();
        });

        // Add account button
        document.getElementById('addAccountBtn')?.addEventListener('click', () => {
            this.showAddEditAccountModal();
        });

        // Save account button
        document.getElementById('saveAccountBtn')?.addEventListener('click', () => {
            this.saveAccount();
        });

        // Search accounts
        document.getElementById('searchAccounts')?.addEventListener('input', () => {
            this.filterAccounts();
        });

        // Account type filter
        document.getElementById('accountTypeFilter')?.addEventListener('change', () => {
            this.filterAccounts();
        });

        // View mode buttons
        document.getElementById('treeViewBtn')?.addEventListener('click', () => {
            this.switchViewMode('tree');
        });
        
        document.getElementById('tableViewBtn')?.addEventListener('click', () => {
            this.switchViewMode('table');
        });

        // Expand/Collapse all button
        document.getElementById('expandCollapseAllBtn')?.addEventListener('click', () => {
            this.toggleExpandCollapseAll();
        });

        // Clear filters
        document.getElementById('clearAccountFiltersBtn')?.addEventListener('click', () => {
            this.clearFilters();
        });

        // Rows per page selector (table view)
        const itemsPerPageSelect = document.getElementById('itemsPerPageSelect');
        if (itemsPerPageSelect) {
            itemsPerPageSelect.value = String(this.itemsPerPage);
            itemsPerPageSelect.addEventListener('change', (e) => {
                const value = parseInt(e.target.value, 10);
                if (!isNaN(value) && value > 0) {
                    this.itemsPerPage = value;
                    this.currentPage = 1;
                    this.renderTable();
                }
            });
        }

        // Auto-update when parent changes
        document.getElementById('parentAccount')?.addEventListener('change', (e) => {
            this.onParentAccountChange(e.target.value);
        });
        
        // Update help text when isParentAccount changes
        document.getElementById('isParentAccount')?.addEventListener('change', async (e) => {
            this.updateParentAccountHelpText(e.target.checked);
            
            // ✅ تحذير إذا كان الحساب به معاملات
            if (e.target.checked && this.editingAccount) {
                const wasNonParent = !this.editingAccount.isParentAccount;
                if (wasNonParent) {
                    const hasTransactions = await this.hasAccountTransactions(this.editingAccount.id);
                    if (hasTransactions) {
                        e.target.checked = false;
                        this.updateParentAccountHelpText(false);
                        this.showError('⚠️ لا يمكن تحويل هذا الحساب إلى رئيسي!\n\nيوجد معاملات مالية مسجلة عليه.');
                    }
                }
            }
        });
    },
    
    /**
     * Update help text for isParentAccount
     */
    updateParentAccountHelpText(isParent) {
        const helpText = document.getElementById('isParentHelpText');
        if (!helpText) return;
        
        if (isParent) {
            helpText.innerHTML = `
                <strong class="text-success">مفعّل:</strong> حساب رئيسي - يمكن إضافة حسابات فرعية تحته، لا يُستخدم في المعاملات
            `;
        } else {
            helpText.innerHTML = `
                <strong class="text-primary">غير مفعّل:</strong> حساب نهائي - يُستخدم مباشرة في المعاملات المالية
            `;
        }
    },

    /**
     * Create the 5 main accounts.
     */
    async createMainAccounts() {
        try {
            // Check if main accounts already exist
            const existingMainAccounts = this.allAccounts.filter(acc => 
                ['1', '2', '3', '4', '5', '6', '7'].includes(acc.code)
            );

            if (existingMainAccounts.length > 0) {
                const existingNames = existingMainAccounts.map(acc => acc.name).join('، ');
                
                const result = await Swal.fire({
                    title: 'تنبيه',
                    html: `
                        <p>بعض الحسابات الأساسية موجودة بالفعل:</p>
                        <p class="text-primary"><strong>${existingNames}</strong></p>
                        <p>هل تريد إضافة الحسابات المفقودة فقط؟</p>
                    `,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#28a745',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: 'نعم، أضف المفقودة',
                    cancelButtonText: 'إلغاء'
                });

                if (!result.isConfirmed) {
                    return;
                }
            }

            // Define the 7 main accounts
            const mainAccounts = [
                {
                    code: '1',
                    name: 'الأصول',
                    type: 'assets',
                    nature: 'debit',
                    currency: 'IQD',
                    description: 'جميع ما تملكه الشركة من أصول متداولة وثابتة'
                },
                {
                    code: '2',
                    name: 'الخصوم',
                    type: 'liabilities',
                    nature: 'credit',
                    currency: 'IQD',
                    description: 'جميع الالتزامات والديون على الشركة'
                },
                {
                    code: '3',
                    name: 'حقوق الملكية',
                    type: 'equity',
                    nature: 'credit',
                    currency: 'IQD',
                    description: 'رأس المال والاحتياطيات والأرباح المحتجزة'
                },
                {
                    code: '4',
                    name: 'الإيرادات',
                    type: 'revenue',
                    nature: 'credit',
                    currency: 'IQD',
                    description: 'جميع إيرادات الشركة من المبيعات والخدمات'
                },
                {
                    code: '5',
                    name: 'المصروفات',
                    type: 'expenses',
                    nature: 'debit',
                    currency: 'IQD',
                    description: 'جميع مصروفات وتكاليف الشركة'
                },
                {
                    code: '6',
                    name: 'صافي المبيعات',
                    name2: 'Net Sales',
                    type: 'revenue',
                    nature: 'credit',
                    currency: 'IQD',
                    description: 'حساب تجميعي لصافي إيرادات المبيعات (المبيعات - المرتجعات - الخصومات)'
                },
                {
                    code: '7',
                    name: 'صافي المشتريات',
                    name2: 'Net Purchases',
                    type: 'expenses',
                    nature: 'debit',
                    currency: 'IQD',
                    description: 'حساب تجميعي لصافي تكلفة المشتريات (المشتريات - المرتجعات + مصاريف المشتريات)'
                }
            ];

            let addedCount = 0;
            const batch = db.batch();

            for (const account of mainAccounts) {
                // Check if this specific account exists
                const exists = this.allAccounts.some(acc => acc.code === account.code);
                
                if (!exists) {
                    const docRef = db.collection('chartOfAccounts').doc();
                    batch.set(docRef, {
                        ...account,
                        parentId: null,
                        status: 'active',
                        isParentAccount: true,  // حساب رئيسي - لا يُستخدم في المعاملات
                        isFinalAccount: false,
                        finalAccountType: null,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                    addedCount++;
                }
            }

            if (addedCount === 0) {
                this.showInfo('جميع الحسابات الأساسية السبعة موجودة بالفعل ✓');
                return;
            }

            // Commit batch
            await batch.commit();

            // Reload accounts
            await this.loadAccounts();
            
            // Invalidate balance cache (accounts structure changed)
            this.invalidateBalanceCache();

            await Swal.fire({
                title: 'تم بنجاح! 🎉',
                html: `
                    <p>تم إضافة <strong>${addedCount}</strong> حساب أساسي</p>
                    <div class="text-start mt-3">
                        <small class="text-muted">الحسابات الأساسية السبعة:</small>
                        <ol class="mt-2">
                            <li>الأصول</li>
                            <li>الخصوم</li>
                            <li>حقوق الملكية</li>
                            <li>الإيرادات</li>
                            <li>المصروفات</li>
                            <li>صافي المبيعات</li>
                            <li>صافي المشتريات</li>
                        </ol>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'حسناً'
            });
            
        } catch (error) {
            console.error('❌ Error creating main accounts:', error);
            this.showError('خطأ في إنشاء الحسابات الرئيسية: ' + error.message);
        }
    },

    /**
     * Load accounts from Firebase.
     */
    async loadAccounts() {
        try {
            console.log('📊 Loading accounts from database...');
            
            // Check if Firebase is initialized
            if (!db) {
                console.error('❌ Firebase database not initialized');
                this.showError('قاعدة البيانات غير متصلة. يرجى تسجيل الدخول أولاً.');
                return;
            }

            const accountsSnapshot = await db.collection('chartOfAccounts')
                .orderBy('code', 'asc')
                .get();

            this.allAccounts = [];
            accountsSnapshot.forEach(doc => {
                this.allAccounts.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            this.filteredAccounts = [...this.allAccounts];
            this.renderView();
            this.updateParentAccountDropdown();
            this.updateCreateMainAccountsButton();

            console.log(`✅ Loaded ${this.allAccounts.length} accounts from database`);
            
            // Show info if no accounts exist
            if (this.allAccounts.length === 0) {
                console.log('ℹ️ No accounts found. User can create main accounts.');
            }
        } catch (error) {
            console.error('❌ Error loading accounts:', error);
            
            // Check if it's a permission error
            if (error.code === 'permission-denied') {
                this.showError('ليس لديك صلاحية الوصول إلى شجرة الحسابات. يرجى التحقق من صلاحياتك أو تحديث قواعد Firebase.');
            } else if (error.code === 'unavailable') {
                this.showError('لا يمكن الاتصال بقاعدة البيانات. يرجى التحقق من الاتصال بالإنترنت.');
            } else {
                this.showError('خطأ في تحميل شجرة الحسابات: ' + (error.message || 'خطأ غير معروف'));
            }
        }
    },

    /**
     * Update the create main accounts button visibility/text.
     */
    updateCreateMainAccountsButton() {
        const btn = document.getElementById('createMainAccountsBtn');
        if (!btn) return;

        const existingMainAccounts = this.allAccounts.filter(acc => 
            ['1', '2', '3', '4', '5', '6', '7'].includes(acc.code)
        );

        if (existingMainAccounts.length === 7) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-check-circle"></i> الحسابات الأساسية موجودة (7/7)';
            btn.classList.remove('btn-modern-success');
            btn.classList.add('btn-modern-outline');
        } else {
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-magic"></i> إنشاء الحسابات الأساسية (${existingMainAccounts.length}/7)`;
            btn.classList.remove('btn-modern-outline');
            btn.classList.add('btn-modern-success');
        }
    },

    /**
     * Switch between tree and table view.
     */
    switchViewMode(mode) {
        this.viewMode = mode;
        const treeContainer = document.getElementById('treeViewContainer');
        const tableContainer = document.getElementById('tableViewContainer');
        const expandBtn = document.getElementById('expandCollapseAllBtn');
        const treeViewBtn = document.getElementById('treeViewBtn');
        const tableViewBtn = document.getElementById('tableViewBtn');

        if (mode === 'tree') {
            // Show tree view
            treeContainer.style.display = 'block';
            tableContainer.style.display = 'none';
            if (expandBtn) expandBtn.style.display = 'inline-flex';
            
            // Update button states
            treeViewBtn?.classList.add('active');
            tableViewBtn?.classList.remove('active');
            
            this.renderTreeView();
        } else {
            // Show table view
            treeContainer.style.display = 'none';
            tableContainer.style.display = 'block';
            if (expandBtn) expandBtn.style.display = 'none';
            
            // Update button states
            treeViewBtn?.classList.remove('active');
            tableViewBtn?.classList.add('active');
            
            this.renderTable();
        }
        
        console.log(`👁️ Switched to ${mode} view`);
    },

    /**
     * Render the appropriate view based on viewMode.
     */
    renderView() {
        if (this.viewMode === 'tree') {
            this.renderTreeView();
        } else {
            this.renderTable();
        }
    },

    /**
     * Render tree view of accounts.
     */
    renderTreeView() {
        const treeContainer = document.getElementById('accountsTree');
        if (!treeContainer) return;
        
        const rootAccounts = this.filteredAccounts.filter(acc => !acc.parentId);

        if (rootAccounts.length === 0) {
            treeContainer.innerHTML = `
                <div class="empty-state-accounts">
                    <i class="fas fa-sitemap"></i>
                    <h4>لا توجد حسابات</h4>
                    <p>ابدأ بإنشاء الحسابات الرئيسية الخمسة</p>
                    <button class="btn-modern btn-modern-success" onclick="ChartOfAccountsModule.createMainAccounts()">
                        <i class="fas fa-magic"></i>
                        <span>إنشاء الحسابات الرئيسية</span>
                    </button>
                </div>
            `;
            return;
        }

        let html = '<div class="accounts-tree-root">';
        rootAccounts.forEach(account => {
            html += this.renderTreeNode(account, 0);
        });
        html += '</div>';
        
        treeContainer.innerHTML = html;
        
        console.log(`🌳 Rendered tree view with ${rootAccounts.length} root accounts`);
        
        // ✅ حساب الأرصدة لكل حساب بشكل غير متزامن
        this.calculateAndDisplayBalances();
    },

    /**
     * Render a single tree node.
     */
    renderTreeNode(account, level) {
        const children = this.filteredAccounts.filter(acc => acc.parentId === account.id);
        const hasChildren = children.length > 0;
        const isExpanded = this.expandedNodes.has(account.id) || this.allExpanded;
        const isParent = account.isParentAccount === true || account.isParentAccount === 'true';
        const isMainAccount = ['1', '2', '3', '4', '5', '6', '7'].includes(account.code);
        const typeClass = account.type || 'default';

        let html = `
            <div class="tree-node level-${level} ${isMainAccount ? 'main-account' : ''}" 
                 data-level="${level}" 
                 data-account-id="${account.id}">
                <div class="tree-node-content ${isMainAccount ? 'main-account' : level === 1 ? 'sub-account' : 'final-account'}">
                    ${hasChildren ? `
                        <div class="tree-toggle ${isExpanded ? 'expanded' : 'collapsed'}" 
                             onclick="ChartOfAccountsModule.toggleNode('${account.id}')">
                        </div>
                    ` : '<div class="tree-toggle-spacer"></div>'}
                    
                    <div class="tree-node-info">
                        <div class="tree-node-code">${account.code}</div>
                        <div class="tree-node-name-container">
                            <div class="tree-node-name">
                                ${account.name}
                                ${isMainAccount ? '<i class="fas fa-star text-warning ms-2" title="حساب أساسي"></i>' : ''}
                                ${account.isCustomerAccount ? '<i class="fas fa-user-tie text-success ms-2" title="حساب عميل - محمي"></i>' : ''}
                                ${account.isSupplierAccount ? '<i class="fas fa-truck text-warning ms-2" title="حساب مورد - محمي"></i>' : ''}
                                ${!account.isCustomerAccount && !account.isSupplierAccount && isParent ? '<i class="fas fa-folder-tree text-success ms-1" title="حساب رئيسي"></i>' : ''}
                                ${!account.isCustomerAccount && !account.isSupplierAccount && !isParent ? '<i class="fas fa-file-invoice text-info ms-1" title="حساب نهائي"></i>' : ''}
                            </div>
                            ${account.name2 ? `<div class="tree-node-name2"><i class="fas fa-globe"></i> ${account.name2}</div>` : ''}
                        </div>
                        <div class="tree-node-type">
                            ${account.isCustomerAccount ? '<span class="type-badge type-customer"><i class="fas fa-user-tie"></i> حساب عميل</span>' : 
                              account.isSupplierAccount ? '<span class="type-badge type-supplier"><i class="fas fa-truck"></i> حساب مورد</span>' :
                              isParent ? '<span class="type-badge type-parent"><i class="fas fa-sitemap"></i> رئيسي</span>' : 
                              '<span class="type-badge type-final"><i class="fas fa-check-circle"></i> نهائي</span>'}
                        </div>
                        <div class="tree-node-nature nature-${account.nature}">${this.getAccountNatureText(account.nature)}</div>
                        ${account.currency ? `<div class="tree-node-currency"><i class="fas fa-coins"></i> ${account.currency}</div>` : ''}
                        ${hasChildren ? `<div class="tree-node-children-badge"><i class="fas fa-layer-group"></i> ${children.length}</div>` : ''}
                        <div class="tree-node-balance" id="balance-${account.id}">
                            <i class="fas fa-spinner fa-spin"></i> جاري الحساب...
                        </div>
                    </div>
                    
                    <div class="tree-node-actions">
                        ${hasChildren && !account.isCustomerAccount && !account.isSupplierAccount && !account.isSystemProtected && account.canHaveChildren !== false ? `
                            <button class="action-btn-modern action-add" 
                                    onclick="ChartOfAccountsModule.showAddEditAccountModal(null, '${account.id}')" 
                                    title="إضافة حساب فرعي">
                                <i class="fas fa-plus"></i>
                            </button>
                        ` : hasChildren && (account.isCustomerAccount || account.isSupplierAccount || account.isSystemProtected || account.canHaveChildren === false) ? `
                            <button class="action-btn-modern action-add disabled" 
                                    title="🔒 حساب محمي - لا يمكن إضافة حسابات فرعية تحته${account.isCustomerAccount ? ' (حساب عميل)' : account.isSupplierAccount ? ' (حساب مورد)' : ''}"
                                    disabled>
                                <i class="fas fa-lock"></i>
                            </button>
                        ` : ''}
                        <button class="action-btn-modern action-edit ${account.isCustomerAccount || account.isSupplierAccount || account.isSystemProtected ? 'disabled' : ''}" 
                                onclick="ChartOfAccountsModule.editAccount('${account.id}')" 
                                title="${account.isCustomerAccount ? '🔒 حساب عميل محمي - لا يمكن تعديله من هنا' : account.isSupplierAccount ? '🔒 حساب مورد محمي - لا يمكن تعديله من هنا' : account.isSystemProtected ? '🔒 حساب محمي - لا يمكن تعديله' : isMainAccount ? 'تعديل العملة والاسم الثاني فقط' : 'تعديل'}"
                                ${account.isCustomerAccount || account.isSupplierAccount || account.isSystemProtected ? 'disabled' : ''}>
                            <i class="fas ${account.isCustomerAccount || account.isSupplierAccount || account.isSystemProtected ? 'fa-lock' : 'fa-edit'}"></i>
                        </button>
                        <button class="action-btn-modern action-delete ${isMainAccount || account.isCustomerAccount || account.isSupplierAccount || account.isSystemProtected ? 'disabled' : ''}" 
                                onclick="ChartOfAccountsModule.deleteAccount('${account.id}')" 
                                title="${account.isCustomerAccount ? '🔒 حساب عميل محمي - لا يمكن حذفه من هنا' : account.isSupplierAccount ? '🔒 حساب مورد محمي - لا يمكن حذفه من هنا' : account.isSystemProtected ? '🔒 حساب محمي - لا يمكن حذفه' : isMainAccount ? 'لا يمكن حذف الحسابات الأساسية' : 'حذف'}"
                                ${isMainAccount || account.isCustomerAccount || account.isSupplierAccount || account.isSystemProtected ? 'disabled' : ''}>
                            <i class="fas ${account.isCustomerAccount || account.isSupplierAccount || account.isSystemProtected ? 'fa-lock' : 'fa-trash-alt'}"></i>
                        </button>
                    </div>
                </div>
        `;

        if (hasChildren && isExpanded) {
            html += `<div class="tree-children">`;
            children.forEach(child => {
                html += this.renderTreeNode(child, level + 1);
            });
            html += '</div>';
        }

        html += '</div>';
        return html;
    },

    /**
     * Toggle a tree node expand/collapse.
     */
    toggleNode(accountId) {
        if (this.expandedNodes.has(accountId)) {
            this.expandedNodes.delete(accountId);
        } else {
            this.expandedNodes.add(accountId);
        }
        this.renderTreeView();
    },
    
    /**
     * Edit account
     */
    editAccount(accountId) {
        // 🛡️ فحص الحماية: منع تعديل الحسابات المحمية من النظام
        const account = this.allAccounts.find(acc => acc.id === accountId);
        
        if (account && (
            account.isCustomerAccount === true || 
            account.isSupplierAccount === true ||
            account.isSystemProtected === true ||
            account.allowTypeChange === false)) {
            
            const accountType = account.isCustomerAccount ? 'عميل' : account.isSupplierAccount ? 'مورد' : 'محمي';
            
            this.showError(`🚫 لا يمكن تعديل هذا الحساب!\n\n` +
                         `🔒 السبب: هذا حساب محمي من النظام (مرتبط بـ${accountType})\n\n` +
                         `⚠️ الحسابات المرتبطة بالعملاء والموردين محمية من التعديل:\n` +
                         `• لا يمكن تغيير نوعها أو هيكلها\n` +
                         `• محمية لضمان سلامة الروابط المحاسبية\n` +
                         `• لا يمكن تحويلها إلى حسابات رئيسية\n\n` +
                         `💡 لإجراء تغييرات على هذا الحساب:\n` +
                         `• اذهب إلى وحدة العملاء والموردين\n` +
                         `• قم بتعديل بيانات ${account.isCustomerAccount ? 'العميل' : account.isSupplierAccount ? 'المورد' : 'الكيان'} من هناك`);
            return;
        }
        
        this.showAddEditAccountModal(accountId);
    },

    /**
     * Toggle expand/collapse all nodes.
     */
    toggleExpandCollapseAll() {
        const btn = document.getElementById('expandCollapseAllBtn');
        
        if (this.allExpanded) {
            // Collapse all
            this.expandedNodes.clear();
            this.allExpanded = false;
            btn.innerHTML = '<i class="fas fa-expand"></i> توسيع الكل';
            btn.classList.remove('btn-outline-secondary');
            btn.classList.add('btn-outline-primary');
        } else {
            // Expand all
            this.allAccounts.forEach(acc => {
                const hasChildren = this.allAccounts.some(child => child.parentId === acc.id);
                if (hasChildren) {
                    this.expandedNodes.add(acc.id);
                }
            });
            this.allExpanded = true;
            btn.innerHTML = '<i class="fas fa-compress"></i> طي الكل';
            btn.classList.remove('btn-outline-primary');
            btn.classList.add('btn-outline-secondary');
        }
        
        this.renderTreeView();
    },

    /**
     * Get account type info (icon, color).
     */
    getAccountTypeInfo(type) {
        const types = {
            'assets': { icon: 'fas fa-building', color: '#28a745' },
            'liabilities': { icon: 'fas fa-hand-holding-usd', color: '#dc3545' },
            'equity': { icon: 'fas fa-user-tie', color: '#007bff' },
            'revenue': { icon: 'fas fa-arrow-up', color: '#17a2b8' },
            'expenses': { icon: 'fas fa-arrow-down', color: '#ffc107' }
        };
        return types[type] || { icon: 'fas fa-folder', color: '#6c757d' };
    },

    /**
     * Filter accounts based on search term and type.
     */
    filterAccounts() {
        const searchTerm = document.getElementById('searchAccounts').value.toLowerCase();
        const accountType = document.getElementById('accountTypeFilter').value;

        this.filteredAccounts = this.allAccounts.filter(account => {
            const matchesSearch = !searchTerm ||
                account.name.toLowerCase().includes(searchTerm) ||
                account.code.toLowerCase().includes(searchTerm);

            const matchesType = !accountType || account.type === accountType;

            return matchesSearch && matchesType;
        });

        this.currentPage = 1;
        this.renderView();
    },

    /**
     * Clear all filters.
     */
    clearFilters() {
        document.getElementById('searchAccounts').value = '';
        document.getElementById('accountTypeFilter').value = '';
        this.filterAccounts();
    },

    /**
     * Render the accounts table.
     */
    renderTable() {
        const tbody = document.getElementById('accountsTableBody');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageAccounts = this.filteredAccounts.slice(startIndex, endIndex);

        // تحديث ملخص الجدول (عدد الصفوف المعروضة من إجمالي الصفوف)
        const summaryEl = document.getElementById('accountsTableSummary');
        const totalAccounts = this.filteredAccounts.length;
        if (summaryEl) {
            if (totalAccounts === 0) {
                summaryEl.textContent = 'لا توجد حسابات لعرضها';
            } else {
                const from = startIndex + 1;
                const to = Math.min(endIndex, totalAccounts);
                summaryEl.textContent = `عرض ${from}–${to} من ${totalAccounts} حسابًا`;
            }
        }

        tbody.innerHTML = '';

        if (pageAccounts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4">
                        <i class="fas fa-sitemap fa-3x text-muted mb-3"></i>
                        <p class="text-muted">لا توجد حسابات. اضغط "إضافة حساب" للبدء</p>
                        <button class="btn btn-primary" onclick="ChartOfAccountsModule.showAddEditAccountModal()">
                            <i class="fas fa-plus"></i> إضافة حساب أول
                        </button>
                    </td>
                </tr>
            `;
            this.renderPagination();
            return;
        }

        pageAccounts.forEach((account, index) => {
            const isMainAccount = ['1', '2', '3', '4', '5', '6', '7'].includes(account.code);
            const isParent = account.isParentAccount === true || account.isParentAccount === 'true';
            const hasChildren = this.allAccounts.some(acc => acc.parentId === account.id);
            
            const row = document.createElement('tr');
            row.className = isMainAccount ? 'main-account' : hasChildren ? 'sub-account' : '';
            row.innerHTML = `
                <td>
                    <div class="account-code-cell">${account.code}</div>
                </td>
                <td>
                    <div class="account-name-cell">
                        <div class="account-name-primary">
                            <strong>${account.name}</strong>
                            ${isMainAccount ? '<i class="fas fa-star text-warning ms-2" title="حساب أساسي"></i>' : ''}
                        </div>
                        ${account.name2 ? `<div class="account-name-secondary"><i class="fas fa-globe"></i> ${account.name2}</div>` : ''}
                    </div>
                </td>
                <td class="text-center">
                    ${isParent ? 
                        '<span class="type-badge type-parent"><i class="fas fa-sitemap"></i> رئيسي</span>' : 
                        '<span class="type-badge type-final"><i class="fas fa-check-circle"></i> نهائي</span>'
                    }
                </td>
                <td class="text-center">
                    <span class="nature-badge nature-${account.nature}">
                        ${this.getAccountNatureText(account.nature)}
                    </span>
                </td>
                <td class="text-center">
                    <span class="currency-badge">
                        <i class="fas fa-coins"></i> ${account.currency || 'IQD'}
                    </span>
                </td>
                <td class="text-end">
                    <div class="balance-cell" id="table-balance-${account.id}">
                        <i class="fas fa-spinner fa-spin"></i> جاري...
                    </div>
                </td>
                <td class="text-center">
                    <span class="status-badge ${this.getStatusClass(account.status)}">
                        ${this.getStatusText(account.status)}
                    </span>
                </td>
                <td class="text-center">
                    <div class="action-buttons">
                        <button class="action-btn-modern action-edit ${account.isCustomerAccount || account.isSupplierAccount || account.isSystemProtected ? 'disabled' : ''}" 
                                onclick="ChartOfAccountsModule.editAccount('${account.id}')" 
                                title="${account.isCustomerAccount ? '🔒 حساب عميل محمي - لا يمكن تعديله من هنا' : account.isSupplierAccount ? '🔒 حساب مورد محمي - لا يمكن تعديله من هنا' : account.isSystemProtected ? '🔒 حساب محمي - لا يمكن تعديله' : isMainAccount ? 'تعديل العملة والاسم الثاني فقط' : 'تعديل'}"
                                ${account.isCustomerAccount || account.isSupplierAccount || account.isSystemProtected ? 'disabled' : ''}>
                            <i class="fas ${account.isCustomerAccount || account.isSupplierAccount || account.isSystemProtected ? 'fa-lock' : 'fa-edit'}"></i>
                        </button>
                        <button class="action-btn-modern action-delete ${isMainAccount || account.isCustomerAccount || account.isSupplierAccount || account.isSystemProtected ? 'disabled' : ''}" 
                                onclick="ChartOfAccountsModule.deleteAccount('${account.id}')" 
                                title="${account.isCustomerAccount ? '🔒 حساب عميل محمي - لا يمكن حذفه من هنا' : account.isSupplierAccount ? '🔒 حساب مورد محمي - لا يمكن حذفه من هنا' : account.isSystemProtected ? '🔒 حساب محمي - لا يمكن حذفه' : isMainAccount ? 'لا يمكن حذف الحسابات الأساسية' : 'حذف'}"
                                ${isMainAccount || account.isCustomerAccount || account.isSupplierAccount || account.isSystemProtected ? 'disabled' : ''}>
                            <i class="fas ${account.isCustomerAccount || account.isSupplierAccount || account.isSystemProtected ? 'fa-lock' : 'fa-trash-alt'}"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        this.renderPagination();
        
        // ✅ حساب وعرض الأرصدة في الجدول
        this.calculateAndDisplayTableBalances();
    },
    
    /**
     * Calculate and display balances in table view
     */
    async calculateAndDisplayTableBalances() {
        try {
            // Load all general entries
            const entriesSnapshot = await db.collection('generalEntries')
                .where('status', '==', 'posted')
                .get();
            
            // Calculate balance for each account
            const accountBalances = {};
            
            entriesSnapshot.forEach(doc => {
                const generalEntry = doc.data();
                if (generalEntry.entries && Array.isArray(generalEntry.entries)) {
                    generalEntry.entries.forEach(entry => {
                        const accountId = entry.accountId;
                        
                        if (!accountBalances[accountId]) {
                            accountBalances[accountId] = {
                                debit: 0,
                                credit: 0,
                                currency: entry.currency || 'IQD'
                            };
                        }
                        
                        accountBalances[accountId].debit += parseFloat(entry.debit) || 0;
                        accountBalances[accountId].credit += parseFloat(entry.credit) || 0;
                    });
                }
            });
            
            // Update table balances
            this.filteredAccounts.forEach(account => {
                const balanceEl = document.getElementById(`table-balance-${account.id}`);
                if (!balanceEl) return;
                
                const balance = accountBalances[account.id];
                
                if (balance) {
                    const netBalance = balance.debit - balance.credit;
                    const absBalance = Math.abs(netBalance);
                    const balanceType = netBalance >= 0 ? 'مدين' : 'دائن';
                    const balanceClass = netBalance >= 0 ? 'text-primary' : 'text-success';
                    
                    balanceEl.innerHTML = `
                        <span class="${balanceClass} fw-bold">${this.formatCurrency(absBalance)}</span>
                        <small class="text-muted d-block">${account.currency || 'IQD'} - ${balanceType}</small>
                    `;
                } else {
                    balanceEl.innerHTML = `
                        <span class="text-muted">0.00</span>
                        <small class="text-muted d-block">${account.currency || 'IQD'}</small>
                    `;
                }
            });
            
        } catch (error) {
            console.error('Error calculating table balances:', error);
        }
    },

    /**
     * Render pagination for the accounts table.
     */
    renderPagination() {
        const totalPages = Math.ceil(this.filteredAccounts.length / this.itemsPerPage);
        const pagination = document.getElementById('accountsPagination');

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // Previous button
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="ChartOfAccountsModule.goToPage(${this.currentPage - 1})">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="ChartOfAccountsModule.goToPage(${i})">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        // Next button
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="ChartOfAccountsModule.goToPage(${this.currentPage + 1})">
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
        const totalPages = Math.ceil(this.filteredAccounts.length / this.itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderTable();
        }
    },

    /**
     * Update the parent account dropdown in the modal.
     */
    updateParentAccountDropdown() {
        const parentAccountDropdown = document.getElementById('parentAccount');
        if (!parentAccountDropdown) return;
        
        const currentValue = parentAccountDropdown.value; // Save current value

        // ✅ التحقق: هل وصلنا للحد الأقصى من الحسابات الأساسية؟
        const existingMainAccounts = this.allAccounts.filter(acc => !acc.parentId);
        const canAddMainAccount = this.editingAccount || existingMainAccounts.length < 7;
        
        if (canAddMainAccount) {
            parentAccountDropdown.innerHTML = '<option value="">حساب أساسي (بدون حساب أب)</option>';
        } else {
            // ⚠️ منع اختيار "حساب أساسي" لأن العدد وصل 7
            parentAccountDropdown.innerHTML = '<option value="" disabled>لا يمكن إضافة أكثر من 7 حسابات أساسية - اختر حساباً أباً</option>';
        }

        // ✅ فلترة: فقط الحسابات الرئيسية (التي يمكن أن يكون لها فروع)
        const availableParents = this.allAccounts.filter(acc => {
            // استبعاد الحساب الحالي لمنع التداول الذاتي
            if (this.editingAccount && acc.id === this.editingAccount.id) {
                return false;
            }
            
            // ✅ تضمين الحسابات الأساسية (1-7) دائماً
            const isMainAccount = ['1', '2', '3', '4', '5', '6', '7'].includes(acc.code);
            if (isMainAccount) {
                return true;
            }
            
            // ✅ تضمين فقط الحسابات الرئيسية (isParentAccount = true)
            // استبعاد الحسابات النهائية (isFinalAccount = true)
            const isParent = acc.isParentAccount === true || acc.isParentAccount === 'true';
            return isParent;
        });

        availableParents.forEach(account => {
            const indent = this.getAccountLevel(account) > 0 ? '　'.repeat(this.getAccountLevel(account)) : '';
            const isParent = account.isParentAccount === true || account.isParentAccount === 'true';
            const icon = isParent ? '📁' : '⭐';
            const option = new Option(`${indent}${icon} ${account.code} - ${account.name}`, account.id);
            parentAccountDropdown.add(option);
        });

        // Restore previous value
        if (currentValue && parentAccountDropdown.querySelector(`option[value="${currentValue}"]`)) {
            parentAccountDropdown.value = currentValue;
        }
        
        // إذا لم يكن هناك قيمة محفوظة ولا يمكن إضافة حساب رئيسي، اختر أول حساب
        if (!currentValue && !canAddMainAccount && availableParents.length > 0) {
            parentAccountDropdown.value = availableParents[0].id;
        }
    },
    
    /**
     * Get account level (depth in tree)
     */
    getAccountLevel(account) {
        let level = 0;
        let current = account;
        while (current.parentId) {
            level++;
            current = this.allAccounts.find(acc => acc.id === current.parentId);
            if (!current) break;
        }
        return level;
    },

    /**
     * Handle parent account change - auto-generate code only
     */
    onParentAccountChange(parentId) {
        console.log('🔄 Parent account changed:', parentId);
        
        // Auto-generate code
        this.generateAccountCode();
    },
    
    /**
     * Generate account code based on parent account.
     */
    generateAccountCode() {
        const parentAccountId = document.getElementById('parentAccount')?.value;
        const accountCodeInput = document.getElementById('accountCode');
        if (!accountCodeInput) return;
        
        let newCode = '';

        if (parentAccountId) {
            const parentAccount = this.allAccounts.find(acc => acc.id === parentAccountId);
            if (parentAccount) {
                const children = this.allAccounts.filter(acc => acc.parentId === parentAccountId);
                const lastChildCode = children.length > 0 ?
                    Math.max(...children.map(c => parseInt((c.code || '').split('.').pop()) || 0)) : 0;
                newCode = `${parentAccount.code}.${lastChildCode + 1}`;
            }
        } else {
            // Top-level account
            const topLevelAccounts = this.allAccounts.filter(acc => !acc.parentId);
            const lastTopLevelCode = topLevelAccounts.length > 0 ?
                Math.max(...topLevelAccounts.map(c => parseInt(c.code || '0') || 0)) : 0;
            newCode = (lastTopLevelCode + 1).toString();
        }
        
        accountCodeInput.value = newCode;
        console.log('🔢 Generated code:', newCode);
    },
    
    /**
     * Load currencies for account
     */
    async loadAccountCurrencies() {
        try {
            const currencySelect = document.getElementById('accountCurrency');
            if (!currencySelect) return;
            
            // Load currencies from database
            const snapshot = await db.collection('currencies').get();
            
            const currencies = [];
            snapshot.forEach(doc => {
                const currencyData = { id: doc.id, ...doc.data() };
                if (currencyData.status === 'active') {
                    currencies.push(currencyData);
                }
            });
            
            // If no currencies, use defaults
            if (currencies.length === 0) {
                currencies.push(
                    { id: 'IQD', code: 'IQD', name: 'دينار عراقي', symbol: 'IQD' },
                    { id: 'USD', code: 'USD', name: 'دولار أمريكي', symbol: '$' },
                    { id: 'EUR', code: 'EUR', name: 'يورو', symbol: '€' }
                );
            }
            
            // Populate dropdown
            currencySelect.innerHTML = '<option value="">اختر العملة...</option>';
            currencies.forEach(currency => {
                const option = document.createElement('option');
                option.value = currency.code || currency.id;
                option.textContent = `${currency.name} (${currency.symbol || currency.code})`;
                currencySelect.appendChild(option);
            });
            
            // Set default to IQD
            currencySelect.value = 'IQD';
            
            console.log(`✅ Loaded ${currencies.length} currencies for account`);
        } catch (error) {
            console.error('❌ Error loading currencies:', error);
        }
    },

    /**
     * Show add/edit account modal.
     * @param {string} accountId - The ID of the account to edit, or null for a new account.
     */
    async showAddEditAccountModal(accountId = null, parentId = null) {
        // 🛡️ فحص الحماية: منع إضافة حسابات فرعية تحت الحسابات المحمية
        if (parentId && !accountId) {
            // هذا طلب إضافة حساب فرعي تحت parentId
            const parentAccount = this.allAccounts.find(acc => acc.id === parentId);
            
            if (parentAccount && (
                parentAccount.isCustomerAccount === true || 
                parentAccount.isSystemProtected === true ||
                parentAccount.canHaveChildren === false)) {
                
                this.showError('🚫 لا يمكن إضافة حسابات فرعية تحت هذا الحساب!\n\n' +
                             '🔒 السبب: هذا حساب محمي من النظام (مرتبط بعميل أو مورد)\n\n' +
                             '⚠️ الحسابات المرتبطة بالعملاء والموردين هي حسابات نهائية:\n' +
                             '• لا يمكن إضافة حسابات فرعية تحتها\n' +
                             '• محمية من التعديل الهيكلي\n' +
                             '• مُصممة للاستخدام المباشر في المعاملات\n\n' +
                             '💡 لإضافة حساب جديد:\n' +
                             '• اختر حساب رئيسي آخر غير محمي\n' +
                             '• أو أنشئ حساب جديد مستقل');
                return;
            }
        }
        
        this.editingAccount = null;
        const form = document.getElementById('accountForm');
        if (form) form.reset();
        
        // Load currencies first
        await this.loadAccountCurrencies();
        
        // Update parent dropdown
        this.updateParentAccountDropdown();

        if (accountId) {
            // Edit mode
            const account = this.allAccounts.find(acc => acc.id === accountId);
            if (account) {
                const isMainAccount = ['1', '2', '3', '4', '5', '6', '7'].includes(account.code);

                this.editingAccount = account;
                
                if (isMainAccount) {
                    document.getElementById('accountModalTitle').textContent = '⚙️ تعديل محدود - حساب أساسي';
                } else {
                    document.getElementById('accountModalTitle').textContent = 'تعديل الحساب';
                }
                
                // Fill form
                document.getElementById('accountCode').value = account.code;
                document.getElementById('accountName').value = account.name;
                document.getElementById('accountName2').value = account.name2 || '';
                document.getElementById('parentAccount').value = account.parentId || '';
                document.getElementById('accountNature').value = account.nature || 'debit';
                document.getElementById('accountCurrency').value = account.currency || 'IQD';
                document.getElementById('accountStatus').value = account.status || 'active';
                document.getElementById('accountDescription').value = account.description || '';
                
                // Set isParentAccount checkbox
                const isParentCheckbox = document.getElementById('isParentAccount');
                if (isParentCheckbox) {
                    isParentCheckbox.checked = account.isParentAccount || false;
                    this.updateParentAccountHelpText(account.isParentAccount || false);
                }
                
                // ✅ Disable most fields for main accounts (allow only name2 and currency)
                if (isMainAccount) {
                    document.getElementById('accountCode').disabled = true;
                    document.getElementById('accountName').disabled = true;
                    document.getElementById('parentAccount').disabled = true;
                    document.getElementById('accountNature').disabled = true;
                    document.getElementById('accountStatus').disabled = true;
                    document.getElementById('isParentAccount').disabled = true;
                    document.getElementById('accountDescription').disabled = true;
                    
                    // Keep these enabled
                    document.getElementById('accountName2').disabled = false;
                    document.getElementById('accountCurrency').disabled = false;
                    
                    // Add visual indicator
                    this.showInfo('💡 يمكنك فقط تعديل الاسم الثاني والعملة للحسابات الأساسية');
                } else {
                    // Enable all fields for non-main accounts
                    document.getElementById('accountCode').disabled = true; // Always readonly
                    document.getElementById('accountName').disabled = false;
                    document.getElementById('accountName2').disabled = false;
                    document.getElementById('parentAccount').disabled = false;
                    document.getElementById('accountNature').disabled = false;
                    document.getElementById('accountCurrency').disabled = false;
                    document.getElementById('accountStatus').disabled = false;
                    document.getElementById('isParentAccount').disabled = false;
                    document.getElementById('accountDescription').disabled = false;
                }
            }
        } else {
            // Add mode
            document.getElementById('accountModalTitle').textContent = parentId ? 'إضافة حساب فرعي' : 'إضافة حساب جديد';
            
            // Set parent if specified
            if (parentId) {
                document.getElementById('parentAccount').value = parentId;
                this.onParentAccountChange(parentId);
            } else {
                this.generateAccountCode();
            }
            
            // Set defaults
            document.getElementById('accountNature').value = 'debit';
            document.getElementById('accountCurrency').value = 'IQD';
            document.getElementById('accountStatus').value = 'active';
            
            // Default to non-parent (final account)
            const isParentCheckbox = document.getElementById('isParentAccount');
            if (isParentCheckbox) {
                isParentCheckbox.checked = false;
                this.updateParentAccountHelpText(false);
            }
            
            // Enable all fields for new account
            document.getElementById('accountCode').disabled = true; // Always readonly (auto-generated)
            document.getElementById('accountName').disabled = false;
            document.getElementById('accountName2').disabled = false;
            document.getElementById('parentAccount').disabled = false;
            document.getElementById('accountNature').disabled = false;
            document.getElementById('accountCurrency').disabled = false;
            document.getElementById('accountStatus').disabled = false;
            document.getElementById('isParentAccount').disabled = false;
            document.getElementById('accountDescription').disabled = false;
        }

        const modal = new bootstrap.Modal(document.getElementById('accountModal'));
        modal.show();
    },

    /**
     * Save account (add or edit).
     */
    async saveAccount() {
        try {
            if (!this.validateAccountForm()) {
                return;
            }

            showLoading();

            const parentId = document.getElementById('parentAccount').value || null;
            const code = document.getElementById('accountCode').value.trim();
            const name = document.getElementById('accountName').value.trim();
            const name2 = document.getElementById('accountName2').value.trim();
            const currency = document.getElementById('accountCurrency').value;
            const nature = document.getElementById('accountNature').value;
            
            // ✅ منع إضافة حساب أساسي ثامن
            if (!this.editingAccount && !parentId) {
                // هذا حساب أساسي جديد
                const existingMainAccounts = this.allAccounts.filter(acc => !acc.parentId);
                if (existingMainAccounts.length >= 7) {
                    hideLoading();
                    this.showError('⚠️ لا يمكن إضافة أكثر من 7 حسابات أساسية!\n\nالحسابات الأساسية المسموحة:\n1. الأصول\n2. الخصوم\n3. حقوق الملكية\n4. الإيرادات\n5. المصروفات\n6. صافي المبيعات\n7. صافي المشتريات\n\nالرجاء إضافة هذا الحساب كحساب فرعي.');
                    return;
                }
            }
            
            // ✅ التحقق من الحقول المطلوبة
            if (!name) {
                hideLoading();
                this.showError('الرجاء إدخال اسم الحساب');
                return;
            }
            
            if (!code) {
                hideLoading();
                this.showError('الرجاء إدخال كود الحساب');
                return;
            }
            
            if (!currency) {
                hideLoading();
                this.showError('الرجاء اختيار العملة');
                return;
            }
            
            if (!nature) {
                hideLoading();
                this.showError('الرجاء اختيار طبيعة الحساب (مدين/دائن)');
                return;
            }
            
            // Get type from parent (or null for main accounts)
            let type = null;
            if (parentId) {
                const parentAccount = this.allAccounts.find(acc => acc.id === parentId);
                if (parentAccount) {
                    type = parentAccount.type;
                }
            }
            
            // Get isParentAccount value
            const isParentCheckbox = document.getElementById('isParentAccount');
            const isParentAccount = isParentCheckbox?.checked || false;
            
            // ✅ التحقق 1: فحص الحماية للحسابات المحمية من النظام (حسابات العملاء/الموردين)
            if (this.editingAccount && isParentAccount) {
                // هذا تعديل لحساب موجود ويراد تحويله إلى رئيسي
                const wasNonParent = !this.editingAccount.isParentAccount;
                
                if (wasNonParent) {
                    // 🛡️ فحص الحماية للحسابات المرتبطة بالعملاء/الموردين
                    if (this.editingAccount.isCustomerAccount === true || 
                        this.editingAccount.isSupplierAccount === true ||
                        this.editingAccount.isSystemProtected === true ||
                        this.editingAccount.allowTypeChange === false) {
                        
                        const accountType = this.editingAccount.isCustomerAccount ? 'عميل' : this.editingAccount.isSupplierAccount ? 'مورد' : 'محمي';
                        
                        hideLoading();
                        this.showError(`🚫 لا يمكن تحويل هذا الحساب إلى حساب رئيسي!\n\n` +
                                     `🔒 السبب: هذا حساب محمي من النظام (مرتبط بـ${accountType})\n\n` +
                                     `⚠️ الحسابات المرتبطة بالعملاء والموردين يجب أن تبقى كحسابات نهائية لضمان:\n` +
                                     `• سلامة الروابط المحاسبية\n` +
                                     `• عدم إضافة حسابات فرعية تحتها\n` +
                                     `• الحفاظ على هياكل البيانات\n\n` +
                                     `💡 لإجراء تغييرات على هذا الحساب:\n` +
                                     `• اذهب إلى وحدة العملاء والموردين\n` +
                                     `• قم بتعديل بيانات ${this.editingAccount.isCustomerAccount ? 'العميل' : this.editingAccount.isSupplierAccount ? 'المورد' : 'الكيان'} هناك`);
                        return;
                    }
                    
                    // كان حساب نهائي، نريد تحويله إلى رئيسي
                    // تحقق من وجود معاملات
                    const hasTransactions = await this.hasAccountTransactions(this.editingAccount.id);
                    
                    if (hasTransactions) {
                        hideLoading();
                        this.showError('⚠️ لا يمكن تحويل هذا الحساب إلى حساب رئيسي!\n\n' +
                                     'السبب: يوجد معاملات مالية مسجلة على هذا الحساب.\n\n' +
                                     '💡 الحل:\n' +
                                     '1. انقل المعاملات إلى حساب آخر\n' +
                                     '2. أو أنشئ حساب رئيسي جديد\n' +
                                     '3. ثم انقل هذا الحساب كفرع تحته\n\n' +
                                     'الحسابات الرئيسية للتنظيم فقط - لا تُستخدم في المعاملات.');
                        return;
                    }
                }
            }
            
            // ✅ التحقق 2: منع تحويل حساب رئيسي إلى نهائي إذا كان له فروع
            if (this.editingAccount && !isParentAccount) {
                // هذا تعديل لحساب موجود ويراد تحويله إلى نهائي
                const wasParent = this.editingAccount.isParentAccount;
                
                if (wasParent) {
                    // كان حساب رئيسي، نريد تحويله إلى نهائي
                    // تحقق من وجود حسابات فرعية
                    const hasChildren = await this.hasChildAccounts(this.editingAccount.id);
                    
                    if (hasChildren) {
                        hideLoading();
                        this.showError('⚠️ لا يمكن تحويل هذا الحساب إلى حساب نهائي!\n\n' +
                                     'السبب: يوجد حسابات فرعية تحت هذا الحساب.\n\n' +
                                     '💡 الحل:\n' +
                                     '1. احذف جميع الحسابات الفرعية أولاً\n' +
                                     '2. أو انقلها إلى حساب رئيسي آخر\n' +
                                     '3. ثم يمكنك تحويل هذا الحساب إلى نهائي\n\n' +
                                     'الحسابات الرئيسية تحتوي على فروع - لا يمكن استخدامها مباشرة.');
                        return;
                    }
                }
            }
            
            // منع تكرار كود الحساب
            const codeConflict = this.allAccounts.find(
                acc => acc.code === code && acc.id !== this.editingAccount?.id
            );
            if (codeConflict) {
                hideLoading();
                this.showError(`كود الحساب "${code}" مستخدم مسبقاً من قِبَل "${codeConflict.name}". يرجى اختيار كود مختلف.`);
                return;
            }

            const formData = {
                name: name,
                name2: name2 || '',
                code: code,
                type: type, // يرث من الأب أو null للأساسية
                nature: nature,
                parentId: parentId,
                currency: currency,
                status: document.getElementById('accountStatus').value,
                description: document.getElementById('accountDescription').value.trim(),
                isParentAccount: isParentAccount,
                isFinalAccount: !isParentAccount, // عكس isParentAccount
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (this.editingAccount) {
                // Update existing account
                const isMainAccount = ['1', '2', '3', '4', '5', '6', '7'].includes(this.editingAccount.code);
                
                if (isMainAccount) {
                    // ✅ For main accounts, only update name2 and currency
                    const limitedFormData = {
                        name2: name2 || '',
                        currency: currency,
                        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    console.log('🔄 Updating main account (limited):', this.editingAccount.id, limitedFormData);
                    await db.collection('chartOfAccounts').doc(this.editingAccount.id).update(limitedFormData);
                } else {
                    // ✅ For non-main accounts, update all fields
                    console.log('🔄 Updating account:', this.editingAccount.id);
                    await db.collection('chartOfAccounts').doc(this.editingAccount.id).update(formData);
                }
                hideLoading();
                this.showSuccess('تم تحديث الحساب بنجاح');
            } else {
                // Add new account
                console.log('➕ Adding new account:', code);
                formData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('chartOfAccounts').add(formData);
                hideLoading();
                this.showSuccess('تم إضافة الحساب بنجاح');
            }

            const modalElement = document.getElementById('accountModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            }
            
            await this.loadAccounts(); // Reload to update tree and parent dropdown
            
            // Invalidate balance cache (account structure changed)
            this.invalidateBalanceCache();
            
        } catch (error) {
            hideLoading();
            console.error('❌ Error saving account:', error);
            this.showError('خطأ في حفظ الحساب: ' + error.message);
        }
    },

    /**
     * Delete account.
     * @param {string} accountId - The ID of the account to delete.
     */
    async deleteAccount(accountId) {
        const account = this.allAccounts.find(acc => acc.id === accountId);
        if (!account) return;

        // 🛡️ فحص الحماية: منع حذف الحسابات المحمية من النظام
        if (account.isCustomerAccount === true || 
            account.isSupplierAccount === true ||
            account.isSystemProtected === true ||
            account.allowTypeChange === false) {
            
            const accountType = account.isCustomerAccount ? 'عميل' : account.isSupplierAccount ? 'مورد' : 'محمي';
            
            this.showError(`🚫 لا يمكن حذف هذا الحساب!\n\n` +
                         `🔒 السبب: هذا حساب محمي من النظام (مرتبط بـ${accountType})\n\n` +
                         `⚠️ الحسابات المرتبطة بالعملاء والموردين محمية من الحذف:\n` +
                         `• لا يمكن حذفها من شجرة الحسابات مباشرة\n` +
                         `• محمية لضمان سلامة الروابط المحاسبية\n` +
                         `• يجب حذف ${account.isCustomerAccount ? 'العميل' : account.isSupplierAccount ? 'المورد' : 'الكيان المرتبط'} أولاً\n\n` +
                         `💡 لحذف هذا الحساب:\n` +
                         `• اذهب إلى وحدة العملاء والموردين\n` +
                         `• احذف ${account.isCustomerAccount ? 'العميل' : account.isSupplierAccount ? 'المورد' : 'الكيان'} المرتبط بهذا الحساب\n` +
                         `• سيتم حذف الحساب تلقائياً`);
            return;
        }

        // Check if it's a main account (cannot be deleted)
        const isMainAccount = ['1', '2', '3', '4', '5', '6', '7'].includes(account.code);
        if (isMainAccount) {
            this.showError('🔒 لا يمكن حذف الحسابات الأساسية السبعة!\n\nهذه الحسابات هي الأساس للنظام المحاسبي.');
            return;
        }

        // Check for child accounts
        const hasChildren = this.allAccounts.some(acc => acc.parentId === accountId);
        if (hasChildren) {
            this.showError('لا يمكن حذف هذا الحساب لأنه يحتوي على حسابات فرعية. يرجى حذف الحسابات الفرعية أولاً.');
            return;
        }

        // Check for transactions
        const hasTransactions = await this.hasAccountTransactions(accountId);
        if (hasTransactions) {
            this.showError('لا يمكن حذف هذا الحساب لأنه يحتوي على معاملات مالية. لا يمكن حذف حساب له سجلات محاسبية.');
            return;
        }

        const result = await Swal.fire({
            title: 'هل أنت متأكد؟',
            text: `هل تريد حذف الحساب "${account.name}" (${account.code})؟`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'إلغاء'
        });

        if (result.isConfirmed) {
            try {
                await db.collection('chartOfAccounts').doc(accountId).delete();
                await this.loadAccounts();
                
                // Invalidate balance cache (account deleted)
                this.invalidateBalanceCache();
                
                this.showSuccess('تم حذف الحساب بنجاح');
            } catch (error) {
                console.error('Error deleting account:', error);
                this.showError('خطأ في حذف الحساب: ' + error.message);
            }
        }
    },

    /**
     * Calculate entry balance in account currency
     * @param {Object} entry - General entry entry object
     * @param {Object} account - Account object
     * @returns {Object} - {debit, credit} in account currency
     */
    calculateEntryBalanceInAccountCurrency(entry, account) {
        const accountCurrency = account?.currency || entry.currency || 'IQD';
        const originalDebit = parseFloat(entry.originalDebit) || 0;
        const originalCredit = parseFloat(entry.originalCredit) || 0;
        const originalCurrency = entry.originalCurrency || entry.currency || 'IQD';
        const exchangeRate = parseFloat(entry.exchangeRate) || 1;
        
        let debitInAccountCurrency = 0;
        let creditInAccountCurrency = 0;
        
        if (originalCurrency === accountCurrency) {
            // نفس العملة - استخدام القيم الأصلية مباشرة
            debitInAccountCurrency = originalDebit || parseFloat(entry.debit) || 0;
            creditInAccountCurrency = originalCredit || parseFloat(entry.credit) || 0;
        } else if (accountCurrency === 'IQD') {
            // الحساب بالـ IQD - استخدام القيم المحولة
            debitInAccountCurrency = parseFloat(entry.debit) || 0;
            creditInAccountCurrency = parseFloat(entry.credit) || 0;
        } else {
            // الحساب بعملة أجنبية
            if (originalCurrency === accountCurrency && exchangeRate > 0) {
                debitInAccountCurrency = originalDebit || (parseFloat(entry.debit) || 0) / exchangeRate;
                creditInAccountCurrency = originalCredit || (parseFloat(entry.credit) || 0) / exchangeRate;
            } else {
                debitInAccountCurrency = parseFloat(entry.debit) || 0;
                creditInAccountCurrency = parseFloat(entry.credit) || 0;
            }
        }
        
        return { debit: debitInAccountCurrency, credit: creditInAccountCurrency };
    },

    /**
     * Calculate account balances from general entries
     * @returns {Promise<Object>} - Object with accountId as key and balance as value
     */
    async calculateAccountBalancesFromEntries() {
        const entriesSnapshot = await db.collection('generalEntries')
            .where('status', '==', 'posted')
            .get();
        
        const accountBalances = {};
        
        entriesSnapshot.forEach(doc => {
            const generalEntry = doc.data();
            if (generalEntry.entries && Array.isArray(generalEntry.entries)) {
                generalEntry.entries.forEach(entry => {
                    const accountId = entry.accountId;
                    const account = this.allAccounts.find(acc => acc.id === accountId);
                    
                    if (!accountBalances[accountId]) {
                        accountBalances[accountId] = {
                            debit: 0,
                            credit: 0,
                            currency: account?.currency || entry.currency || 'IQD'
                        };
                    }
                    
                    const balance = this.calculateEntryBalanceInAccountCurrency(entry, account);
                    accountBalances[accountId].debit += balance.debit;
                    accountBalances[accountId].credit += balance.credit;
                });
            }
        });
        
        return accountBalances;
    },

    /**
     * Aggregate parent account balances from children
     * @param {Object} accountBalances - Account balances object
     * @returns {Promise<Object>} - Updated account balances with parent balances
     */
    async aggregateParentAccountBalances(accountBalances) {
        // ترتيب من الأعمق للأسطح — يضمن معالجة الفروع قبل الآباء في أي تسلسل هرمي
        const getDepth = (accountId, visited = new Set()) => {
            if (visited.has(accountId)) return 0; // حماية من الدورات المرجعية
            visited.add(accountId);
            const acc = this.allAccounts.find(a => a.id === accountId);
            return acc?.parentId ? 1 + getDepth(acc.parentId, visited) : 0;
        };

        const sortedAccounts = [...this.allAccounts].sort(
            (a, b) => getDepth(b.id) - getDepth(a.id)
        );

        for (const account of sortedAccounts) {
            const children = this.allAccounts.filter(acc => acc.parentId === account.id);
            if (children.length === 0) continue;

            let totalDebit  = accountBalances[account.id]?.debit  || 0;
            let totalCredit = accountBalances[account.id]?.credit || 0;
            const accountCurrency = account.currency || 'IQD';

            // تحويل عملات الأبناء بالتوازي
            await Promise.all(children.map(async (child) => {
                const childBalance = accountBalances[child.id];
                if (!childBalance) return;

                const childCurrency = childBalance.currency || accountCurrency;
                try {
                    if (childCurrency === accountCurrency) {
                        totalDebit  += childBalance.debit  || 0;
                        totalCredit += childBalance.credit || 0;
                    } else {
                        const [cd, cc] = await Promise.all([
                            childBalance.debit  > 0 ? this.convertCurrency(childBalance.debit,  childCurrency, accountCurrency) : 0,
                            childBalance.credit > 0 ? this.convertCurrency(childBalance.credit, childCurrency, accountCurrency) : 0
                        ]);
                        totalDebit  += cd;
                        totalCredit += cc;
                    }
                } catch (conversionError) {
                    console.error(`❌ Error converting ${childCurrency} to ${accountCurrency}:`, conversionError);
                }
            }));

            accountBalances[account.id] = { debit: totalDebit, credit: totalCredit, currency: accountCurrency };
        }

        return accountBalances;
    },

    /**
     * Display account balances in tree and table views
     * @param {Object} accountBalances - Account balances object
     */
    displayAccountBalances(accountBalances) {
        this.allAccounts.forEach(account => {
            const balanceEl = document.getElementById(`balance-${account.id}`);
            const tableBalanceEl = document.getElementById(`table-balance-${account.id}`);
            const balance = accountBalances[account.id];
            
            const displayBalance = (element) => {
                if (!element) return;
                
                if (balance) {
                    const netBalance = balance.debit - balance.credit;
                    const absBalance = Math.abs(netBalance);
                    const balanceType = netBalance >= 0 ? 'مدين' : 'دائن';
                    const balanceClass = netBalance >= 0 ? 'text-primary' : 'text-success';
                    
                    element.innerHTML = `
                        <span class="${balanceClass} fw-bold">
                            ${this.formatCurrency(absBalance)}
                        </span>
                        <small class="text-muted">${account.currency || 'IQD'}</small>
                        <br>
                        <small class="badge ${netBalance >= 0 ? 'bg-primary' : 'bg-success'}" style="font-size: 0.7rem;">
                            ${balanceType}
                        </small>
                    `;
                } else {
                    element.innerHTML = `
                        <span class="text-muted">0.00</span>
                        <small class="text-muted">${account.currency || 'IQD'}</small>
                    `;
                }
            };
            
            displayBalance(balanceEl);
            displayBalance(tableBalanceEl);
        });
    },

    /**
     * Display zero balances for all accounts (error fallback)
     */
    displayZeroBalances() {
        this.allAccounts.forEach(account => {
            const balanceEl = document.getElementById(`balance-${account.id}`);
            const tableBalanceEl = document.getElementById(`table-balance-${account.id}`);
            
            const displayZero = (element) => {
                if (element) {
                    element.innerHTML = `
                        <span class="text-muted">0.00</span>
                        <small class="text-muted">${account.currency || 'IQD'}</small>
                    `;
                }
            };
            
            displayZero(balanceEl);
            displayZero(tableBalanceEl);
        });
    },

    /**
     * Check if balance cache is valid
     * @returns {boolean} - True if cache is valid, false otherwise
     */
    isBalanceCacheValid() {
        if (!this.balanceCache.data || !this.balanceCache.timestamp) {
            return false;
        }
        
        const age = Date.now() - this.balanceCache.timestamp;
        return age < this.balanceCache.duration;
    },

    /**
     * Invalidate balance cache (call when general entries change)
     */
    invalidateBalanceCache() {
        this.balanceCache.data = null;
        this.balanceCache.timestamp = null;
        console.log('🔄 Balance cache invalidated');
    },

    /**
     * Calculate and display balances for all accounts
     */
    async calculateAndDisplayBalances() {
        // Check cache first
        if (this.isBalanceCacheValid()) {
            console.log('📦 Using cached balances');
            this.displayAccountBalances(this.balanceCache.data);
            return;
        }
        
        console.log('💰 Calculating account balances...');
        
        try {
            // Step 1: Calculate balances from entries
            const accountBalances = await this.calculateAccountBalancesFromEntries();
            
            // Step 2: Aggregate parent account balances
            const aggregatedBalances = await this.aggregateParentAccountBalances(accountBalances);
            
            // Step 3: Update cache
            this.balanceCache.data = aggregatedBalances;
            this.balanceCache.timestamp = Date.now();
            
            // Step 4: Display balances
            this.displayAccountBalances(aggregatedBalances);
            
            console.log(`✅ Account balances calculated and displayed for ${this.allAccounts.length} accounts`);
            
        } catch (error) {
            console.error('❌ Error calculating account balances:', error);
            this.displayZeroBalances();
        }
    },

    /**
     * Format currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('ar-IQ', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount || 0);
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
     * Convert currency using exchange rates (with cache)
     */
    async convertCurrency(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) {
            return amount;
        }

        try {
            // Load currencies (with cache)
            const { currencies, baseCurrency } = await this.loadCurrencies();

            // If converting from foreign currency to base currency
            if (toCurrency === baseCurrency) {
                const sourceCurrency = currencies[fromCurrency];
                if (sourceCurrency) {
                    const rate = parseFloat(sourceCurrency.exchangeRate || 1);
                    if (rate > 0) {
                        return amount / rate;
                    }
                }
                return amount;
            } 
            // If converting from base currency to foreign currency
            else if (fromCurrency === baseCurrency) {
                const targetCurrency = currencies[toCurrency];
                if (targetCurrency) {
                    const rate = parseFloat(targetCurrency.exchangeRate || 1);
                    return amount * rate;
                }
                return amount;
            } 
            // Convert between two non-base currencies via base currency
            else {
                const baseAmount = await this.convertCurrency(amount, fromCurrency, baseCurrency);
                return await this.convertCurrency(baseAmount, baseCurrency, toCurrency);
            }
        } catch (error) {
            console.error('❌ Error converting currency:', error);
            return amount; // Return original amount if conversion fails
        }
    },

    /**
     * Check if account has child accounts
     * @param {string} accountId - The ID of the account to check
     * @returns {boolean} - True if account has children, false otherwise
     */
    async hasChildAccounts(accountId) {
        try {
            console.log('🔍 Checking for child accounts of:', accountId);
            
            // Check in allAccounts (already loaded)
            const children = this.allAccounts.filter(acc => acc.parentId === accountId);
            
            if (children.length > 0) {
                console.log(`⚠️ Found ${children.length} child account(s):`, children.map(c => c.code + ' - ' + c.name));
                return true;
            }
            
            // Double check in database
            const childrenSnapshot = await db.collection('chartOfAccounts')
                .where('parentId', '==', accountId)
                .limit(1)
                .get();
            
            const hasChildren = !childrenSnapshot.empty;
            console.log('✅ Has child accounts:', hasChildren);
            
            return hasChildren;
            
        } catch (error) {
            console.error('Error checking child accounts:', error);
            return false;
        }
    },

    /**
     * Check if account has transactions.
     * @param {string} accountId - The ID of the account to check.
     * @returns {boolean} - True if account has transactions, false otherwise.
     */
    async hasAccountTransactions(accountId) {
        try {
            console.log('🔍 Checking for transactions on account:', accountId);
            
            // ⚠️ IMPORTANT: Check in GENERAL ENTRIES (the source of truth for accounting)
            const generalEntriesSnapshot = await db.collection('generalEntries').get();
            
            let transactionCount = 0;
            generalEntriesSnapshot.forEach(doc => {
                const generalEntry = doc.data();
                if (generalEntry.entries && Array.isArray(generalEntry.entries)) {
                    generalEntry.entries.forEach(entry => {
                        if (entry.accountId === accountId) {
                            transactionCount++;
                        }
                    });
                }
            });
            
            if (transactionCount > 0) {
                console.log(`⚠️ Found ${transactionCount} transaction(s) in general entries`);
                return true;
            }
            
            console.log('✅ No transactions found');
            return false;
        } catch (error) {
            console.error('Error checking account transactions:', error);
            throw new Error('تعذر التحقق من معاملات الحساب: ' + error.message);
        }
    },

    /**
     * Validate account form.
     */
    validateAccountForm() {
        const name = document.getElementById('accountName').value.trim();
        const code = document.getElementById('accountCode').value.trim();
        const nature = document.getElementById('accountNature').value;
        const currency = document.getElementById('accountCurrency').value;
        const parentId = document.getElementById('parentAccount').value;

        if (!name) {
            document.getElementById('accountName').focus();
            this.showError('يرجى إدخال اسم الحساب');
            return false;
        }
        
        if (!code) {
            document.getElementById('accountCode').focus();
            this.showError('يرجى إدخال كود الحساب');
            return false;
        }
        
        if (!nature) {
            document.getElementById('accountNature').focus();
            this.showError('يرجى اختيار طبيعة الحساب (مدين أو دائن)');
            return false;
        }
        
        if (!currency) {
            document.getElementById('accountCurrency').focus();
            this.showError('يرجى اختيار عملة الحساب');
            return false;
        }
        
        // التحقق من اختيار الحساب الأب (للحسابات الفرعية)
        if (!parentId && !this.editingAccount) {
            const existingMainAccounts = this.allAccounts.filter(acc => !acc.parentId);
            if (existingMainAccounts.length >= 7) {
                this.showError('⚠️ لا يمكن إضافة أكثر من 7 حسابات أساسية!\nيرجى اختيار الحساب الأب من الحسابات الأساسية السبعة.');
                return false;
            }
        }

        // Check if code is unique
        const existingCode = this.allAccounts.find(acc =>
            acc.code.toLowerCase() === code.toLowerCase() &&
            (!this.editingAccount || acc.id !== this.editingAccount.id)
        );
        if (existingCode) {
            document.getElementById('accountCode').focus();
            this.showError('⚠️ كود الحساب موجود مسبقاً! يرجى اختيار كود آخر.');
            return false;
        }

        // Check if name is unique
        const existingName = this.allAccounts.find(acc =>
            acc.name.toLowerCase() === name.toLowerCase() &&
            (!this.editingAccount || acc.id !== this.editingAccount.id)
        );
        if (existingName) {
            document.getElementById('accountName').focus();
            this.showError('⚠️ اسم الحساب موجود مسبقاً! يرجى اختيار اسم آخر.');
            return false;
        }

        return true;
    },

    /**
     * Get account type text in Arabic.
     */
    getAccountTypeText(type) {
        const types = {
            'assets': 'الأصول',
            'liabilities': 'الخصوم',
            'equity': 'حقوق الملكية',
            'revenue': 'الإيرادات',
            'expenses': 'المصروفات'
        };
        return types[type] || type;
    },

    /**
     * Get account nature text in Arabic.
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
     * Get status class for styling.
     */
    getStatusClass(status) {
        const classes = {
            'active': 'status-active',
            'inactive': 'status-inactive'
        };
        return classes[status] || 'status-inactive';
    },

    /**
     * Get status text in Arabic.
     */
    getStatusText(status) {
        const statuses = {
            'active': 'نشط',
            'inactive': 'غير نشط'
        };
        return statuses[status] || status;
    },

    /**
     * Check if account can be used in transactions.
     * @param {string} accountId - The ID of the account to check.
     * @returns {object} - {canUse: boolean, message: string}
     */
    canUseAccountInTransaction(accountId) {
        const account = this.allAccounts.find(acc => acc.id === accountId);
        
        if (!account) {
            return { canUse: false, message: 'الحساب غير موجود' };
        }

        if (account.isParentAccount === true || account.isParentAccount === 'true') {
            return { 
                canUse: false, 
                message: `الحساب "${account.name}" هو حساب رئيسي ولا يمكن استخدامه في المعاملات. يرجى اختيار حساب فرعي.` 
            };
        }

        if (account.status === 'inactive') {
            return { 
                canUse: false, 
                message: `الحساب "${account.name}" غير نشط ولا يمكن استخدامه في المعاملات.` 
            };
        }

        return { canUse: true, message: '' };
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
     * Show info message.
     */
    showInfo(message) {
        Swal.fire({
            title: 'معلومة',
            text: message,
            icon: 'info',
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

// Initialize when DOM is ready (only once)
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if the module's section is present
    if (document.getElementById('chart-of-accounts')) {
        ChartOfAccountsModule.initialize();
    }
});

