/**
 * Dashboard Module for Accounting & Inventory System
 * @module modules/dashboard
 */

const DashboardModule = {
    /**
     * Get HTML for dashboard
     */
    getHTML() {
        return `
            <section id="dashboard" class="dashboard-modern">
                <!-- Welcome Header -->
                <div class="dashboard-header">
                    <div class="welcome-content">
                        <div class="welcome-icon">
                            <i class="fas fa-spa"></i>
                        </div>
                        <div class="welcome-text">
                            <h1>مرحباً بك في نظام ROSEMARY</h1>
                            <p>نظام متكامل لإدارة المحاسبة والمخزون</p>
                        </div>
                    </div>
                    <div class="welcome-actions">
                        <button class="btn btn-outline-light" id="refreshDashboardBtn">
                            <i class="fas fa-sync-alt"></i> تحديث
                        </button>
                    </div>
                </div>

                <!-- Statistics Cards -->
                <div class="stats-grid">
                    <div class="stat-card stat-primary">
                        <div class="stat-icon">
                            <i class="fas fa-box"></i>
                        </div>
                        <div class="stat-details">
                            <h3 id="dashProductsCount">
                                <span class="count-animation">0</span>
                            </h3>
                            <p>المنتجات</p>
                            <small class="stat-trend">
                                <i class="fas fa-arrow-up"></i> نشط
                            </small>
                        </div>
                    </div>

                    <div class="stat-card stat-success">
                        <div class="stat-icon">
                            <i class="fas fa-shopping-cart"></i>
                        </div>
                        <div class="stat-details">
                            <h3 id="dashSalesCount">
                                <span class="count-animation">0</span>
                            </h3>
                            <p>المبيعات</p>
                            <small class="stat-trend">
                                <i class="fas fa-arrow-up"></i> اليوم
                            </small>
                        </div>
                    </div>

                    <div class="stat-card stat-warning">
                        <div class="stat-icon">
                            <i class="fas fa-cart-plus"></i>
                        </div>
                        <div class="stat-details">
                            <h3 id="dashPurchasesCount">
                                <span class="count-animation">0</span>
                            </h3>
                            <p>المشتريات</p>
                            <small class="stat-trend">
                                <i class="fas fa-arrow-up"></i> الشهر
                            </small>
                        </div>
                    </div>

                </div>

                <!-- Quick Actions -->
                <div class="quick-actions-section">
                    <h3 class="section-title">
                        <i class="fas fa-bolt"></i> إجراءات سريعة
                    </h3>
                    <div class="quick-actions-grid">
                        <button class="quick-action-btn" data-action="new-sale">
                            <i class="fas fa-shopping-cart"></i>
                            <span>فاتورة مبيعات جديدة</span>
                        </button>
                        <button class="quick-action-btn" data-action="new-purchase">
                            <i class="fas fa-cart-plus"></i>
                            <span>فاتورة شراء جديدة</span>
                        </button>
                        <button class="quick-action-btn" data-action="new-product">
                            <i class="fas fa-box"></i>
                            <span>إضافة منتج</span>
                        </button>
                        <button class="quick-action-btn" data-action="reports">
                            <i class="fas fa-chart-line"></i>
                            <span>عرض التقارير</span>
                        </button>
                    </div>
                </div>

                <!-- Main Content Grid -->
                <div class="dashboard-main-content">
                    <!-- Modules Section -->
                    <div class="modules-section">
                        <h3 class="section-title">
                            <i class="fas fa-th-large"></i> الوحدات الرئيسية
                        </h3>
                        <div class="modules-grid-modern">
                            <!-- Sales Module -->
                            <div class="module-card-modern" data-module="sales">
                                <div class="module-card-header">
                                    <div class="module-icon-modern sales-gradient">
                                        <i class="fas fa-shopping-cart"></i>
                                    </div>
                                    <span class="module-status">
                                        <i class="fas fa-circle"></i> جاهز
                                    </span>
                                </div>
                                <div class="module-card-body">
                                    <h4>المبيعات</h4>
                                    <p>إدارة فواتير المبيعات والعملاء</p>
                                    <div class="module-stats">
                                        <span><i class="fas fa-file-invoice"></i> <span id="moduleSalesCount">0</span> فاتورة</span>
                                    </div>
                                </div>
                                <div class="module-card-footer">
                                    <span class="module-go">
                                        انتقل للوحدة <i class="fas fa-arrow-left"></i>
                                    </span>
                                </div>
                            </div>

                            <!-- Sales Returns Module -->
                            <div class="module-card-modern" data-module="sales-returns">
                                <div class="module-card-header">
                                    <div class="module-icon-modern sales-returns-gradient">
                                        <i class="fas fa-undo"></i>
                                    </div>
                                    <span class="module-status">
                                        <i class="fas fa-circle"></i> جاهز
                                    </span>
                                </div>
                                <div class="module-card-body">
                                    <h4>مرتجع المبيعات</h4>
                                    <p>إدارة فواتير مرتجع المبيعات</p>
                                    <div class="module-stats">
                                        <span><i class="fas fa-file-invoice"></i> <span id="moduleSalesReturnsCount">0</span> فاتورة</span>
                                    </div>
                                </div>
                                <div class="module-card-footer">
                                    <span class="module-go">
                                        انتقل للوحدة <i class="fas fa-arrow-left"></i>
                                    </span>
                                </div>
                            </div>

                            <!-- Purchases Module -->
                            <div class="module-card-modern" data-module="purchases">
                                <div class="module-card-header">
                                    <div class="module-icon-modern purchases-gradient">
                                        <i class="fas fa-cart-plus"></i>
                                    </div>
                                    <span class="module-status">
                                        <i class="fas fa-circle"></i> جاهز
                                    </span>
                                </div>
                                <div class="module-card-body">
                                    <h4>المشتريات</h4>
                                    <p>إدارة فواتير المشتريات والموردين</p>
                                    <div class="module-stats">
                                        <span><i class="fas fa-file-invoice"></i> <span id="modulePurchasesCount">0</span> فاتورة</span>
                                    </div>
                                </div>
                                <div class="module-card-footer">
                                    <span class="module-go">
                                        انتقل للوحدة <i class="fas fa-arrow-left"></i>
                                    </span>
                                </div>
                            </div>

                            <!-- Products Module -->
                            <div class="module-card-modern" data-module="products">
                                <div class="module-card-header">
                                    <div class="module-icon-modern products-gradient">
                                        <i class="fas fa-box"></i>
                                    </div>
                                    <span class="module-status active">
                                        <i class="fas fa-circle"></i> نشط
                                    </span>
                                </div>
                                <div class="module-card-body">
                                    <h4>المنتجات</h4>
                                    <p>إدارة المنتجات والفئات والوحدات</p>
                                    <div class="module-stats">
                                        <span><i class="fas fa-box"></i> <span id="moduleProductsCount">0</span> منتج</span>
                                    </div>
                                </div>
                                <div class="module-card-footer">
                                    <span class="module-go">
                                        انتقل للوحدة <i class="fas fa-arrow-left"></i>
                                    </span>
                                </div>
                            </div>

                            <!-- Inventory Module -->
                            <div class="module-card-modern" data-module="inventory">
                                <div class="module-card-header">
                                    <div class="module-icon-modern inventory-gradient">
                                        <i class="fas fa-warehouse"></i>
                                    </div>
                                    <span class="module-status">
                                        <i class="fas fa-circle"></i> جاهز
                                    </span>
                                </div>
                                <div class="module-card-body">
                                    <h4>المخزون</h4>
                                    <p>إدارة المخازن وحركة المخزون</p>
                                    <div class="module-stats">
                                        <span><i class="fas fa-cubes"></i> تتبع المخزون</span>
                                    </div>
                                </div>
                                <div class="module-card-footer">
                                    <span class="module-go">
                                        انتقل للوحدة <i class="fas fa-arrow-left"></i>
                                    </span>
                                </div>
                            </div>

                            <!-- Parties Module -->
                            <div class="module-card-modern" data-module="parties">
                                <div class="module-card-header">
                                    <div class="module-icon-modern parties-gradient">
                                        <i class="fas fa-users"></i>
                                    </div>
                                    <span class="module-status">
                                        <i class="fas fa-circle"></i> جاهز
                                    </span>
                                </div>
                                <div class="module-card-body">
                                    <h4>العملاء والموردون</h4>
                                    <p>إدارة العملاء والموردين</p>
                                    <div class="module-stats">
                                        <span><i class="fas fa-user-tie"></i> <span id="modulePartiesCount">0</span> طرف</span>
                                    </div>
                                </div>
                                <div class="module-card-footer">
                                    <span class="module-go">
                                        انتقل للوحدة <i class="fas fa-arrow-left"></i>
                                    </span>
                                </div>
                            </div>


                            <!-- Reports Module -->
                            <div class="module-card-modern" data-module="reports">
                                <div class="module-card-header">
                                    <div class="module-icon-modern reports-gradient">
                                        <i class="fas fa-chart-line"></i>
                                    </div>
                                    <span class="module-status">
                                        <i class="fas fa-circle"></i> جاهز
                                    </span>
                                </div>
                                <div class="module-card-body">
                                    <h4>التقارير</h4>
                                    <p>تقارير مفصلة عن جميع العمليات</p>
                                    <div class="module-stats">
                                        <span><i class="fas fa-file-chart-line"></i> تقارير شاملة</span>
                                    </div>
                                </div>
                                <div class="module-card-footer">
                                    <span class="module-go">
                                        انتقل للوحدة <i class="fas fa-arrow-left"></i>
                                    </span>
                                </div>
                            </div>

                            <!-- Users Module -->
                            <div class="module-card-modern" data-module="users">
                                <div class="module-card-header">
                                    <div class="module-icon-modern users-gradient">
                                        <i class="fas fa-user-shield"></i>
                                    </div>
                                    <span class="module-status">
                                        <i class="fas fa-circle"></i> جاهز
                                    </span>
                                </div>
                                <div class="module-card-body">
                                    <h4>المستخدمون</h4>
                                    <p>إدارة مستخدمي النظام والصلاحيات</p>
                                    <div class="module-stats">
                                        <span><i class="fas fa-users-cog"></i> التحكم الكامل</span>
                                    </div>
                                </div>
                                <div class="module-card-footer">
                                    <span class="module-go">
                                        انتقل للوحدة <i class="fas fa-arrow-left"></i>
                                    </span>
                                </div>
                            </div>

                            <!-- Settings Module -->
                            <div class="module-card-modern" data-module="settings">
                                <div class="module-card-header">
                                    <div class="module-icon-modern settings-gradient">
                                        <i class="fas fa-cogs"></i>
                                    </div>
                                    <span class="module-status">
                                        <i class="fas fa-circle"></i> جاهز
                                    </span>
                                </div>
                                <div class="module-card-body">
                                    <h4>الإعدادات</h4>
                                    <p>إعدادات النظام والشركة</p>
                                    <div class="module-stats">
                                        <span><i class="fas fa-sliders-h"></i> تخصيص النظام</span>
                                    </div>
                                </div>
                                <div class="module-card-footer">
                                    <span class="module-go">
                                        انتقل للوحدة <i class="fas fa-arrow-left"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Activity & Notifications Sidebar -->
                    <div class="activity-sidebar">
                        <div class="activity-card">
                            <h3 class="section-title">
                                <i class="fas fa-bell"></i> الإشعارات
                            </h3>
                            <div class="notifications-list" id="notificationsList">
                                <div class="notification-item new">
                                    <i class="fas fa-info-circle text-primary"></i>
                                    <div>
                                        <p>مرحباً بك في نظام ROSEMARY</p>
                                        <small>الآن</small>
                                    </div>
                                </div>
                                <div class="notification-item">
                                    <i class="fas fa-check-circle text-success"></i>
                                    <div>
                                        <p>النظام جاهز للاستخدام</p>
                                        <small>منذ دقيقة</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="activity-card">
                            <h3 class="section-title">
                                <i class="fas fa-clock"></i> النشاط الأخير
                            </h3>
                            <div class="activity-timeline" id="activityTimeline">
                                <div class="activity-item">
                                    <div class="activity-icon">
                                        <i class="fas fa-sign-in-alt"></i>
                                    </div>
                                    <div class="activity-content">
                                        <p>تسجيل دخول للنظام</p>
                                        <small id="loginTime">الآن</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    },

    /**
     * Render dashboard to DOM
     */
    render() {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = this.getHTML();
            this.setupEventListeners();
            this.setupModuleNavigation();
            this.setupQuickActions();
        }
    },

    /**
     * Load dashboard
     */
    async load() {
        try {
            console.log('📊 Loading dashboard...');

            // Render HTML
            this.render();

            // Load statistics with animation
            await this.loadStatistics();

            // Set login time
            this.setLoginTime();

            // Setup real-time sync for dashboard
            this.setupDashboardSync();

            console.log('✅ Dashboard loaded successfully');
        } catch (error) {
            console.error('❌ Error loading dashboard:', error);
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshDashboardBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refresh();
            });
        }
    },

    /**
     * Setup quick actions
     */
    setupQuickActions() {
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.dataset.action;
                DashboardModule.handleQuickAction(action);
            });
        });
    },

    /**
     * Handle quick action clicks
     */
    handleQuickAction(action) {
        console.log('🚀 Quick action:', action);
        
        switch(action) {
            case 'new-sale':
                app.showModule('sales');
                break;
            case 'new-purchase':
                app.showModule('purchases');
                break;
            case 'new-product':
                app.showModule('products');
                // After short delay, trigger add product modal
                setTimeout(() => {
                    const addBtn = document.getElementById('addProductBtn');
                    if (addBtn) addBtn.click();
                }, 500);
                break;
            case 'reports':
                app.showModule('reports');
                break;
            default:
                console.log('Unknown action:', action);
        }
    },
    
    /**
     * Setup module card navigation
     */
    setupModuleNavigation() {
        const cards = document.querySelectorAll('.module-card-modern');
        console.log(`🔧 Setting up navigation for ${cards.length} module cards`);
        
        cards.forEach(card => {
            const moduleName = card.dataset.module;
            console.log(`   - Card: ${moduleName}`);
            
            card.addEventListener('click', function() {
                const clickedModule = this.dataset.module;
                console.log('');
                console.log('==================================================');
                console.log(`🖱️ MODULE CARD CLICKED: ${clickedModule}`);
                console.log('==================================================');
                
                if (clickedModule && typeof app !== 'undefined') {
                    console.log(`📌 Navigating to module: ${clickedModule}`);
                    console.log(`📌 app exists: ${typeof app !== 'undefined'}`);
                    console.log(`📌 app.showModule exists: ${typeof app.showModule === 'function'}`);
                    
                    // Add click animation
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 200);
                    
                    // Navigate after animation
                    setTimeout(() => {
                        console.log(`🚀 Calling app.showModule('${clickedModule}')`);
                        app.showModule(clickedModule);
                        
                        // Update sidebar active state
                        document.querySelectorAll('.sidebar-menu .nav-link').forEach(link => {
                            link.classList.remove('active');
                            if (link.dataset.module === clickedModule) {
                                link.classList.add('active');
                            }
                        });
                    }, 200);
                } else {
                    console.error('❌ Cannot navigate: ', {
                        moduleName: clickedModule,
                        appExists: typeof app !== 'undefined'
                    });
                }
            });
        });
        console.log('✅ Module navigation setup complete');
    },

    /**
     * Load statistics with animation
     */
    async loadStatistics() {
        try {
            console.log('📊 Loading dashboard statistics...');

            // Get all data
            const [products, sales, salesReturns, purchases, parties] = await Promise.all([
                db.collection('products').get(),
                db.collection('sales').get(),
                db.collection('saleReturns').get(),
                db.collection('purchases').get(),
                db.collection('parties').get()
            ]);

            // Count products
            const productsCount = products.size;
            this.animateCount('dashProductsCount', productsCount);
            this.animateCount('moduleProductsCount', productsCount);

            // Count sales
            const salesCount = sales.size;
            this.animateCount('dashSalesCount', salesCount);
            this.animateCount('moduleSalesCount', salesCount);

            // Count sales returns
            const salesReturnsCount = salesReturns.size;
            this.animateCount('moduleSalesReturnsCount', salesReturnsCount);

            // Count purchases
            const purchasesCount = purchases.size;
            this.animateCount('dashPurchasesCount', purchasesCount);
            this.animateCount('modulePurchasesCount', purchasesCount);

            // Count parties
            const partiesCount = parties.size;
            this.animateCount('modulePartiesCount', partiesCount);

            console.log('✅ Statistics loaded:', {
                products: productsCount,
                sales: salesCount,
                salesReturns: salesReturnsCount,
                purchases: purchasesCount,
                parties: partiesCount
            });

        } catch (error) {
            console.error('❌ Error loading statistics:', error);
            // Set default values
            this.setDefaultCounts();
        }
    },

    /**
     * Animate counter from 0 to target
     */
    animateCount(elementId, targetCount, isCurrency = false) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const countSpan = element.querySelector('.count-animation') || element;
        const duration = 1000; // 1 second
        const steps = 20;
        const increment = targetCount / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= targetCount) {
                current = targetCount;
                clearInterval(timer);
            }

            if (isCurrency) {
                countSpan.textContent = new Intl.NumberFormat('en-US', { numberingSystem: 'latn' }).format(Math.round(current));
            } else {
                countSpan.textContent = Math.round(current);
            }
        }, duration / steps);
    },

    /**
     * Set default counts
     */
    setDefaultCounts() {
        const ids = [
            'dashProductsCount', 'dashSalesCount', 'dashPurchasesCount',
            'moduleProductsCount', 'moduleSalesCount', 'moduleSalesReturnsCount', 'modulePurchasesCount', 'modulePartiesCount'
        ];
        ids.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const countSpan = element.querySelector('.count-animation') || element;
                countSpan.textContent = '0';
            }
        });
    },

    /**
     * Set login time
     */
    setLoginTime() {
        const loginTimeElement = document.getElementById('loginTime');
        if (loginTimeElement) {
            const now = new Date();
            loginTimeElement.textContent = now.toLocaleTimeString('ar-IQ', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        }
    },

    /**
     * Refresh dashboard
     */
    async refresh() {
        console.log('🔄 Refreshing dashboard...');
        
        // Add loading animation
        const refreshBtn = document.getElementById('refreshDashboardBtn');
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            icon.classList.add('fa-spin');
            refreshBtn.disabled = true;
        }

        await this.loadStatistics();

        // Remove loading animation
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            setTimeout(() => {
                icon.classList.remove('fa-spin');
                refreshBtn.disabled = false;
            }, 500);
        }

        console.log('✅ Dashboard refreshed');
    },

    /**
     * Setup real-time sync for dashboard
     */
    setupDashboardSync() {
        if (typeof SyncManager !== 'undefined') {
            // Sync products
            SyncManager.onCollectionSync('products', (data, syncType) => {
                this.loadStatistics();
                console.log(`🔄 Dashboard products updated via ${syncType} sync`);
            });

            // Sync sales
            SyncManager.onCollectionSync('sales', (data, syncType) => {
                this.loadStatistics();
                console.log(`🔄 Dashboard sales updated via ${syncType} sync`);
            });

            // Sync sales returns
            SyncManager.onCollectionSync('saleReturns', (data, syncType) => {
                this.loadStatistics();
                console.log(`🔄 Dashboard sales returns updated via ${syncType} sync`);
            });

            // Sync purchases
            SyncManager.onCollectionSync('purchases', (data, syncType) => {
                this.loadStatistics();
                console.log(`🔄 Dashboard purchases updated via ${syncType} sync`);
            });

            // Sync parties
            SyncManager.onCollectionSync('parties', (data, syncType) => {
                this.loadStatistics();
                console.log(`🔄 Dashboard parties updated via ${syncType} sync`);
            });
        }

        // Also listen to custom events
        window.addEventListener('dataSync', (event) => {
            const { collection } = event.detail;
            if (['products', 'sales', 'saleReturns', 'purchases', 'parties'].includes(collection)) {
                this.loadStatistics();
            }
        });
    }
};

console.log('✅ Dashboard module loaded');






