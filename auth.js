/**
 * Authentication Module for Accounting & Inventory System
 * @module auth
 */

/**
 * Authentication service class
 */
class AuthService {
    constructor() {
        this.auth = auth;
        this.currentUser = null;
        this.authStateListeners = [];
    }

    /**
     * Initialize authentication
     */
    initialize() {
        this.auth.onAuthStateChanged(user => {
            this.currentUser = user;
            this.notifyAuthStateListeners(user);
            this.handleAuthStateChange(user);
        });

        // Setup login form
        this.setupLoginForm();
    }

    /**
     * Setup login form handler
     */
    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    /**
     * Handle authentication state change
     * @param {Object} user - Firebase user object
     */
    handleAuthStateChange(user) {
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        const currentUserElement = document.getElementById('currentUser');

        if (user) {
            console.log('✅ User authenticated:', user.email);
            
            if (loginScreen) loginScreen.style.display = 'none';
            if (mainApp) mainApp.style.display = 'block';
            if (currentUserElement) currentUserElement.textContent = user.email;
            
            this.updateConnectionStatus('connected');
            
            // Check if user exists in USERS collection, if not add them (async)
            this.ensureUserInCollection(user).catch(error => {
                console.error('Error ensuring user in collection:', error);
            });
            
            // Load dashboard
            setTimeout(() => {
                if (typeof DashboardModule !== 'undefined' && DashboardModule.load) {
                    console.log('🚀 Loading dashboard after authentication...');
                    DashboardModule.load();
                } else if (typeof loadDashboard === 'function') {
                    loadDashboard();
                }
                
                // Ensure loading overlay is hidden after authentication
                hideLoading();
            }, 500);
        } else {
            console.log('❌ User not authenticated');
            
            if (loginScreen) loginScreen.style.display = 'flex';
            if (mainApp) mainApp.style.display = 'none';
            
            this.updateConnectionStatus('disconnected');
        }
    }

    /**
     * Handle login form submission
     * @param {Event} e - Form submit event
     */
    async handleLogin(e) {
        e.preventDefault();
        
        const emailInput = document.getElementById('loginEmail');
        const passwordInput = document.getElementById('loginPassword');
        
        if (!emailInput || !passwordInput) {
            showError('عناصر النموذج غير موجودة');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Validate input
        if (!this.validateLoginInput(email, password)) {
            return;
        }

        showLoading();

        try {
            // Check internet connection
            if (!isOnline()) {
                throw new Error('لا يوجد اتصال بالإنترنت. يرجى التحقق من الاتصال والمحاولة مرة أخرى.');
            }

            // Try to sign in
            console.log('🔐 Attempting to login with:', email);
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            this.currentUser = userCredential.user;
            
            console.log('✅ Login successful:', this.currentUser.email);
            showSuccess(`تم تسجيل الدخول بنجاح كـ ${this.currentUser.email}`);

        } catch (error) {
            console.error('❌ Auth error:', error.code, error.message);
            await this.handleLoginError(error, email, password);
        } finally {
            hideLoading();
        }
    }

    /**
     * Validate login input
     * @param {string} email - Email address
     * @param {string} password - Password
     * @returns {boolean} True if valid
     */
    validateLoginInput(email, password) {
        if (!email || !password) {
            showError('يرجى إدخال البريد الإلكتروني وكلمة المرور');
            return false;
        }

        if (!validateEmail(email)) {
            showError('البريد الإلكتروني غير صحيح');
            return false;
        }

        if (password.length < 6) {
            showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return false;
        }

        return true;
    }

    /**
     * Handle login errors
     * @param {Object} error - Firebase auth error
     * @param {string} email - User email
     * @param {string} password - User password
     */
    async handleLoginError(error, email, password) {
        // Handle specific Firebase errors
        if (error.code === 'auth/user-not-found' || 
            error.code === 'auth/invalid-credential' ||
            error.code === 'auth/invalid-login-credentials') {
            
            // Offer to create account
            const result = await Swal.fire({
                title: 'الحساب غير موجود',
                text: 'هل تريد إنشاء حساب جديد بهذا البريد الإلكتروني؟',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'نعم، أنشئ حساب جديد',
                cancelButtonText: 'إلغاء',
                confirmButtonColor: '#3498db',
                cancelButtonColor: '#95a5a6'
            });

            if (result.isConfirmed) {
                await this.createAccount(email, password);
            }
        } else {
            this.showAuthError(error);
        }
    }

    /**
     * Create new account (simplified version)
     * @param {string} email - User email
     * @param {string} password - User password
     */
    async createAccount(email, password) {
        showLoading();
        try {
            console.log('📝 Creating new account for:', email);
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            this.currentUser = userCredential.user;
            
            console.log('✅ Account created successfully:', this.currentUser.email);

            // Create initial data
            await this.createInitialData();

            showSuccess(`تم إنشاء حساب جديد وتسجيل الدخول كـ ${this.currentUser.email}`);

        } catch (error) {
            console.error('❌ Account creation failed:', error);
            this.showAuthError(error);
        } finally {
            hideLoading();
        }
    }

    /**
     * Show authentication error message
     * @param {Object} error - Firebase auth error
     */
    showAuthError(error) {
        let errorMessage = 'حدث خطأ غير متوقع';

        switch(error.code) {
            case 'auth/wrong-password':
                errorMessage = 'كلمة المرور غير صحيحة';
                break;
            case 'auth/invalid-email':
                errorMessage = 'البريد الإلكتروني غير صحيح';
                break;
            case 'auth/weak-password':
                errorMessage = 'كلمة المرور ضعيفة. استخدم 6 أحرف على الأقل';
                break;
            case 'auth/email-already-in-use':
                errorMessage = 'البريد الإلكتروني مستخدم بالفعل';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'مشكلة في الاتصال بالإنترنت. يرجى التحقق من الاتصال';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'محاولات تسجيل دخول كثيرة. يرجى المحاولة لاحقاً';
                break;
            case 'auth/user-disabled':
                errorMessage = 'هذا الحساب معطل. يرجى الاتصال بالدعم';
                break;
            default:
                errorMessage = error.message || 'خطأ في تسجيل الدخول';
        }

        showError(errorMessage);
    }

    /**
     * Logout user
     */
    async logout() {
        const result = await Swal.fire({
            title: 'تأكيد تسجيل الخروج',
            text: 'هل أنت متأكد من تسجيل الخروج؟',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'نعم، سجل الخروج',
            cancelButtonText: 'إلغاء',
            confirmButtonColor: '#3498db',
            cancelButtonColor: '#95a5a6'
        });

        if (result.isConfirmed) {
            try {
                if (this.auth.currentUser) {
                    await this.auth.signOut();
                    console.log('✅ User signed out successfully');
                }
                
                this.currentUser = null;
                
                // Clear cache
                if (typeof dbService !== 'undefined') {
                    dbService.clearCache();
                }
                
                showSuccess('تم تسجيل الخروج بنجاح');
                
            } catch (error) {
                console.error('❌ Logout error:', error);
                showError('حدث خطأ أثناء تسجيل الخروج');
            }
        }
    }

    /**
     * Get current user
     * @returns {Object|null} Current user object
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} True if authenticated
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Update connection status in UI
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
     * Add auth state listener
     * @param {Function} listener - Listener function
     */
    addAuthStateListener(listener) {
        this.authStateListeners.push(listener);
    }

    /**
     * Notify auth state listeners
     * @param {Object} user - User object
     */
    notifyAuthStateListeners(user) {
        this.authStateListeners.forEach(listener => {
            try {
                listener(user);
            } catch (error) {
                console.error('Error in auth state listener:', error);
            }
        });
    }

    /**
     * Create initial data for new user
     */
    async createInitialData() {
        try {
            console.log('📝 Creating initial data for new user...');

            // Create default company settings
            await db.collection('settings').doc('company').set({
                name: 'شركة روزماري',
                phone: '07701234567',
                email: 'info@rosemary.com',
                address: 'بغداد - العراق',
                currency: 'IQD',
                createdAt: new Date()
            });

            // Create default exchange rates
            await db.collection('settings').doc('exchangeRates').set({
                USD: 1460,
                EUR: 1580,
                TRY: 45,
                updatedAt: new Date()
            });

            // Create default tax settings
            await db.collection('settings').doc('taxSettings').set({
                vatRate: 15,
                incomeTaxRate: 5,
                corporateTaxRate: 10,
                serviceTaxRate: 8,
                updatedAt: new Date()
            });

            // Create main warehouse
            await db.collection('warehouses').add({
                code: 'WH-001',
                name: 'المخزن الرئيسي',
                location: 'بغداد',
                status: 'active',
                createdAt: new Date()
            });

            // Create sample customer
            await db.collection('parties').add({
                code: 'CUS-001',
                name: 'عميل نقدي',
                type: 'customer',
                balance: 0,
                creditLimit: 0,
                createdAt: new Date()
            });

            // Create initial admin user in our system
            await db.collection('USERS').add({
                name: 'مدير النظام',
                email: this.currentUser.email,
                role: 'super_admin',
                status: 'active',
                firebaseUID: this.currentUser.uid,
                createdAt: new Date(),
                createdBy: 'system'
            });

            console.log('✅ Initial data created successfully');

        } catch (error) {
            console.error('❌ Error creating initial data:', error);
            // Don't throw error, just log it
        }
    }

    /**
     * Reset password
     * @param {string} email - User email
     */
    async resetPassword(email) {
        if (!validateEmail(email)) {
            showError('البريد الإلكتروني غير صحيح');
            return;
        }

        showLoading();
        try {
            await this.auth.sendPasswordResetEmail(email);
            showSuccess('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
        } catch (error) {
            console.error('Password reset error:', error);
            this.showAuthError(error);
        } finally {
            hideLoading();
        }
    }

    /**
     * Update user email
     * @param {string} newEmail - New email address
     */
    async updateEmail(newEmail) {
        if (!this.currentUser) {
            showError('يجب تسجيل الدخول أولاً');
            return;
        }

        if (!validateEmail(newEmail)) {
            showError('البريد الإلكتروني غير صحيح');
            return;
        }

        showLoading();
        try {
            await this.currentUser.updateEmail(newEmail);
            showSuccess('تم تحديث البريد الإلكتروني بنجاح');
        } catch (error) {
            console.error('Email update error:', error);
            this.showAuthError(error);
        } finally {
            hideLoading();
        }
    }

    /**
     * Update user password
     * @param {string} newPassword - New password
     */
    async updatePassword(newPassword) {
        if (!this.currentUser) {
            showError('يجب تسجيل الدخول أولاً');
            return;
        }

        if (newPassword.length < 6) {
            showError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        showLoading();
        try {
            await this.currentUser.updatePassword(newPassword);
            showSuccess('تم تحديث كلمة المرور بنجاح');
        } catch (error) {
            console.error('Password update error:', error);
            this.showAuthError(error);
        } finally {
            hideLoading();
        }
    }


    /**
     * Ensure user exists in USERS collection
     * @param {Object} user - Firebase user object
     */
    async ensureUserInCollection(user) {
        try {
            console.log('🔍 Checking if user exists in USERS collection:', user.email);
            
            // Check if user already exists in USERS collection
            const usersSnapshot = await db.collection('USERS')
                .where('firebaseUID', '==', user.uid)
                .get();

            if (usersSnapshot.empty) {
                console.log('📝 Adding user to USERS collection:', user.email);
                
                // Add user to USERS collection with User UID as document ID
                await db.collection('USERS').doc(user.uid).set({
                    name: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    role: 'manager',
                    status: 'active',
                    firebaseUID: user.uid,
                    fullAccess: true,
                    createdAt: new Date(),
                    createdBy: 'system',
                    lastLogin: new Date()
                }, { merge: true });
                
                console.log('✅ User added to USERS collection successfully');
            } else {
                console.log('✅ User already exists in USERS collection');
                
                // Update last login time
                const userDoc = usersSnapshot.docs[0];
                await db.collection('USERS').doc(userDoc.id).update({
                    lastLogin: new Date()
                });
            }
        } catch (error) {
            console.error('❌ Error ensuring user in collection:', error);
            // Don't throw error, just log it
        }
    }
}

// Create auth service instance
const authService = new AuthService();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    authService.initialize();
});

console.log('✅ Auth module loaded');



