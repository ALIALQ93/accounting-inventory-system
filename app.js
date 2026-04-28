/**
 * Main Application Module for Accounting & Inventory System
 * @module app
 */

/**
 * Application class
 */
class Application {
    constructor() {
        this.currentModule = 'dashboard';
        this.exchangeRates = { USD: 1460, EUR: 1580, TRY: 45 };
        this.nextInvoiceNumbers = {
            sale: 1,
            purchase: 1,
            journal: 1
        };
    }

    /**
     * Global lightweight, practical theme across the app
     */
    getGlobalStyles() {
        return `
            <style id="global-app-theme">
                /* Layout cards and sections */
                .module-header, .card, .purchase-summary, .report-summary, .summary-card {
                    border-radius: 10px;
                }
                .card { border: 1px solid #e9ecef; }
                .card-header { background: #f8f9fa; }
                /* Buttons */
                .btn { border-radius: 8px; }
                .btn-sm { padding: 4px 10px; border-radius: 6px; }
                /* Forms */
                .form-control, .form-select {
                    border-radius: 8px;
                }
                .form-label { font-size: 0.9rem; margin-bottom: 4px; }
                .form-group { margin-bottom: 10px; }
                .row.g-2 > [class^="col-"], .row.g-2 > [class*=" col-"] { padding-left: 8px; padding-right: 8px; }
                .row.g-1 > [class^="col-"], .row.g-1 > [class*=" col-"] { padding-left: 6px; padding-right: 6px; }
                /* Tables */
                table.table thead th {
                    position: sticky;
                    top: 0;
                    background: #212529;
                    color: #fff;
                    z-index: 1;
                }
                table.table tbody tr:nth-child(odd) { background: #fcfcfd; }
                table.table td, table.table th { vertical-align: middle; }
                table.table .form-control, table.table .form-select { height: 32px; padding: 4px 8px; font-size: 12px; }
                /* Modals */
                .modal-content { border-radius: 12px; }
                .modal-header { padding: 10px 14px; }
                .modal-title { font-size: 1rem; }
                .modal-body { padding: 14px; }
                .modal-footer { padding: 10px 14px; }
                /* Sidebar */
                #sidebar .active { background: rgba(13,110,253,.12); border-radius: 8px; }
                /* Utilities */
                .text-muted { color: #6c757d !important; }
                .compact .form-control, .compact .form-select { height: 34px; padding: 6px 10px; }
                .compact .btn { padding: 6px 12px; }
                .compact .card { border-radius: 8px; }
            </style>
        `;
    }

    injectGlobalStyles() {
        if (!document.getElementById('global-app-theme')) {
            document.head.insertAdjacentHTML('beforeend', this.getGlobalStyles());
        }
    }

    /**
     * Initialize application
     */
    async initialize() {
        try {
            console.log('🚀 Initializing application...');

            // Check Firebase availability
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase not loaded');
            }

            // Inject global theme styles
            this.injectGlobalStyles();

            // Initialize event listeners
            this.initializeEventListeners();

            // Check Firebase connection
            await this.checkFirebaseConnection();

            // Load exchange rates
            await this.loadExchangeRates();

            console.log('✅ Application initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing application:', error);
            showError('فشل في تهيئة التطبيق: ' + error.message);
        }
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Toggle sidebar
        const toggleBtn = document.getElementById('toggleSidebar');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleSidebar());
        }

        // Language switcher
        this.setupLanguageSwitcher();

        // Setup form listeners
        this.setupFormListeners();
        
        // Setup product tabs
        this.setupProductTabs();
    }

    /**
     * Handle navigation
     * @param {Event} e - Click event
     */
    handleNavigation(e) {
        e.preventDefault();
        const link = e.currentTarget;
        const module = link.dataset.module;

        if (module) {
            this.showModule(module);

            // Update active state
            document.querySelectorAll('.sidebar-menu a').forEach(a => {
                a.classList.remove('active');
            });
            link.classList.add('active');
        }
    }

    /**
     * Show module
     * @param {string} moduleName - Module name
     */
    showModule(moduleName) {
        console.log('');
        console.log('🎯 app.showModule() called');
        console.log(`🎯 Module name: ${moduleName}`);
        
        // Update current module
        this.currentModule = moduleName;
        console.log(`🎯 Current module updated to: ${this.currentModule}`);

        // Load module data (will render HTML automatically)
        console.log(`🎯 Calling loadModuleData('${moduleName}')`);
        this.loadModuleData(moduleName);
    }

    /**
     * Load module data
     * @param {string} moduleName - Module name
     */
    async loadModuleData(moduleName) {
        try {
            console.log(`🔄 loadModuleData called for: ${moduleName}`);
            
            switch(moduleName) {
                case 'dashboard':
                    console.log('📊 Loading Dashboard...');
                    await DashboardModule.load();
                    break;
                case 'settings':
                    console.log('⚙️ Loading Settings...');
                    await SettingsModule.load();
                    break;
                case 'inventory':
                    console.log('📦 Loading Inventory...');
                    await InventoryModule.load();
                    break;
                case 'parties':
                    console.log('👥 Loading Parties...');
                    await PartiesModule.load();
                    break;
                case 'period-lock':
                    console.log('🔒 Loading Period Lock...');
                    await PeriodLockModule.load();
                    break;
                case 'purchases':
                    console.log('🛍️ Loading Purchases...');
                    await PurchasesModule.load();
                    break;
                case 'purchase-returns':
                    console.log('↩️ Loading Purchase Returns...');
                    if (typeof PurchaseReturnsModule !== 'undefined') {
                        await PurchaseReturnsModule.load();
                    } else {
                        console.error('❌ PurchaseReturnsModule is not defined!');
                        throw new Error('PurchaseReturnsModule is not defined');
                    }
                    break;
                case 'sales':
                    console.log('🛒 Loading Sales...');
                    await SalesModule.load();
                    break;
                case 'sales-returns':
                    console.log('↩️ Loading Sales Returns...');
                    if (typeof SalesReturnsModule !== 'undefined') {
                        await SalesReturnsModule.load();
                    } else {
                        console.error('❌ SalesReturnsModule is not defined!');
                        throw new Error('SalesReturnsModule is not defined');
                    }
                    break;
                case 'reports':
                    console.log('📊 Loading Reports...');
                    await ReportsModule.load();
                    break;
                case 'products':
                    console.log('📦 Loading Products Module...');
                    console.log('📦 ProductsModule exists?', typeof ProductsModule !== 'undefined');
                    if (typeof ProductsModule !== 'undefined') {
                        await ProductsModule.load();
                    } else {
                        console.error('❌ ProductsModule is not defined!');
                    }
                    break;
        case 'warehouses':
            console.log('🏭 Loading Warehouses Module...');
            console.log('🏭 WarehousesModule exists?', typeof WarehousesModule !== 'undefined');
            if (typeof WarehousesModule !== 'undefined') {
                await WarehousesModule.load();
            } else {
                console.error('❌ WarehousesModule is not defined!');
            }
            break;
        case 'sales-reps':
            console.log('👥 Loading Sales Reps Module...');
            console.log('👥 SalesRepsModule exists?', typeof SalesRepsModule !== 'undefined');
            if (typeof SalesRepsModule !== 'undefined') {
                await SalesRepsModule.load();
            } else {
                console.error('❌ SalesRepsModule is not defined!');
            }
            break;
                case 'users':
                    console.log('👤 Loading Users...');
                    await UsersModule.load();
                    break;
                case 'chart-of-accounts':
                    await ChartOfAccountsModule.initialize();
                    break;
                case 'vouchers':
                    console.log('📋 Loading Vouchers Module...');
                    console.log('📋 VouchersModule exists?', typeof VouchersModule !== 'undefined');
                    if (typeof VouchersModule !== 'undefined') {
                        try {
                            if (typeof VouchersModule.initialize === 'function') {
                                await VouchersModule.initialize();
                            } else if (typeof VouchersModule.load === 'function') {
                                await VouchersModule.load();
                            } else {
                                throw new Error('No initialize or load method found');
                            }
                        } catch (error) {
                            console.error('❌ Error calling VouchersModule method:', error);
                            throw error;
                        }
                    } else {
                        console.error('❌ VouchersModule is not defined!');
                        throw new Error('VouchersModule is not defined');
                    }
                    break;
                case 'currencies':
                    console.log('💱 Loading Currencies Module...');
                    console.log('💱 CurrenciesModule exists?', typeof CurrenciesModule !== 'undefined');
                    if (typeof CurrenciesModule !== 'undefined') {
                        await CurrenciesModule.load();
                    } else {
                        console.error('❌ CurrenciesModule is not defined!');
                    }
                    break;
                case 'cost-centers':
                    await CostCentersModule.initialize();
                    break;
            }
        } catch (error) {
            console.error(`Error loading module ${moduleName}:`, error);
            showError(`فشل في تحميل ${moduleName}: ` + error.message);
        }
    }

    /**
     * Toggle sidebar
     */
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
    }

    /**
     * Setup language switcher
     */
    setupLanguageSwitcher() {
        // Update language display
        this.updateLanguageDisplay();
        
        // Language option clicks
        document.querySelectorAll('.language-option').forEach(option => {
            option.addEventListener('click', async (e) => {
                e.preventDefault();
                const lang = e.currentTarget.dataset.lang;
                if (lang && typeof i18n !== 'undefined') {
                    await i18n.changeLanguage(lang);
                }
            });
        });
        
        // Listen for language changes
        window.addEventListener('languageChanged', () => {
            this.updateLanguageDisplay();
        });
    }
    
    /**
     * Update language display in navbar
     */
    updateLanguageDisplay() {
        const display = document.getElementById('currentLanguageDisplay');
        if (display && typeof i18n !== 'undefined') {
            const currentLang = i18n.getCurrentLanguage();
            display.textContent = currentLang === 'ar' ? 'العربية' : 'English';
        }
    }
    
    /**
     * Setup form listeners
     */
    setupFormListeners() {
        // These will be handled by individual modules
        console.log('Form listeners setup');
    }

    /**
     * Setup product tabs
     */
    setupProductTabs() {
        // Product tabs are now handled within ProductsModule
        // No separate modules needed for categories and units
        console.log('✅ Product tabs setup - handled by ProductsModule');
    }

    /**
     * Check Firebase connection
     */
    async checkFirebaseConnection() {
        console.log('🔍 Checking Firebase connection...');

        try {
            // Check if user is authenticated first
            if (!auth.currentUser) {
                console.log('⚠️ User not authenticated, skipping connection test');
                this.updateConnectionStatus('disconnected');
                return false;
            }

            const testDoc = db.collection('_test').doc('connection');
            await testDoc.set({ timestamp: new Date() });
            
            console.log('✅ Firebase connection successful');
            this.updateConnectionStatus('connected');
            return true;
        } catch (error) {
            console.error('❌ Firebase connection failed:', error);
            this.updateConnectionStatus('disconnected');
            
            if (error.code === 'unavailable') {
                console.warn('لا يمكن الاتصال بـ Firebase. يرجى التحقق من الاتصال بالإنترنت.');
            } else if (error.code === 'permission-denied') {
                console.warn('مشكلة في الصلاحيات. قد تحتاج إلى تسجيل الدخول.');
            }
            
            return false;
        }
    }

    /**
     * Update connection status
     * @param {string} status - Connection status
     */
    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            statusElement.innerHTML = status === 'connected' ? 
                '<i class="fas fa-circle text-success"></i> متصل' : 
                '<i class="fas fa-circle text-danger"></i> غير متصل';
        }
    }

    /**
     * Load exchange rates
     */
    async loadExchangeRates() {
        try {
            // Only load if user is authenticated
            if (!auth.currentUser) {
                console.log('⚠️ Using default exchange rates (user not authenticated)');
                return;
            }

            const rates = await Collections.getSettings('exchangeRates');
            if (rates) {
                this.exchangeRates = {
                    USD: rates.USD || 1460,
                    EUR: rates.EUR || 1580,
                    TRY: rates.TRY || 45
                };
            }
        } catch (error) {
            console.error('Error loading exchange rates:', error);
            // Use default rates
        }
    }

    /**
     * Get exchange rate
     * @param {string} currency - Currency code
     * @returns {number} Exchange rate
     */
    getExchangeRate(currency) {
        return this.exchangeRates[currency] || 1;
    }

    /**
     * Generate next invoice number
     * @param {string} type - Invoice type (sale, purchase, journal)
     * @returns {string} Invoice number
     */
    generateInvoiceNumber(type) {
        const year = new Date().getFullYear();
        const number = String(this.nextInvoiceNumbers[type]).padStart(4, '0');
        this.nextInvoiceNumbers[type]++;
        
        const prefix = {
            sale: 'INV',
            purchase: 'PUR',
            journal: 'JE'
        }[type] || 'DOC';
        
        return `${prefix}-${year}-${number}`;
    }

    /**
     * Retry connection
     */
    async retryConnection() {
        showLoading();
        console.log('🔄 Retrying Firebase connection...');

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const connected = await this.checkFirebaseConnection();
            
            if (connected) {
                showSuccess('تم إعادة الاتصال بقاعدة البيانات بنجاح');
                
                // Reload current module
                if (this.currentModule) {
                    await this.loadModuleData(this.currentModule);
                }
            } else {
                throw new Error('فشل في إعادة الاتصال');
            }
        } catch (error) {
            const result = await Swal.fire({
                title: 'لا يزال هناك مشكلة',
                text: 'فشل في إعادة الاتصال. هل تريد المحاولة مرة أخرى؟',
                icon: 'error',
                showCancelButton: true,
                confirmButtonText: 'نعم، حاول مرة أخرى',
                cancelButtonText: 'إلغاء',
                confirmButtonColor: '#3498db',
                cancelButtonColor: '#95a5a6'
            });

            if (result.isConfirmed) {
                await this.retryConnection();
            }
        } finally {
            hideLoading();
        }
    }
}

/**
 * Global app instance
 */
const app = new Application();

/**
 * Initialize app on DOM ready
 */
document.addEventListener('DOMContentLoaded', async () => {
    // Ensure loading overlay is hidden on page load
    hideLoading();
    
    await app.initialize();
    console.log('✅ App initialized - waiting for authentication...');
    
    // Hide loading overlay again after initialization
    setTimeout(() => {
        hideLoading();
    }, 1000);
});

/**
 * Global helper functions for backward compatibility
 */

// Dashboard
async function loadDashboard() {
    await app.loadModuleData('dashboard');
}

// Connection
async function testDatabaseConnection() {
    return await app.checkFirebaseConnection();
}

async function retryConnection() {
    return await app.retryConnection();
}

// Invoice numbers
function generateInvoiceNumber(type) {
    return app.generateInvoiceNumber(type);
}

// Exchange rates
function getExchangeRate(currency) {
    return app.getExchangeRate(currency);
}

console.log('✅ App module loaded');




// Connection
async function testDatabaseConnection() {
    return await app.checkFirebaseConnection();
}

async function retryConnection() {
    return await app.retryConnection();
}

// Invoice numbers
function generateInvoiceNumber(type) {
    return app.generateInvoiceNumber(type);
}

// Exchange rates
function getExchangeRate(currency) {
    return app.getExchangeRate(currency);
}

console.log('✅ App module loaded');


