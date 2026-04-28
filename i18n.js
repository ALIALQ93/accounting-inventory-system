/**
 * Internationalization (i18n) Module
 * نظام الترجمة والدعم متعدد اللغات
 */

const i18n = {
    currentLanguage: 'ar',
    translations: {},
    
    /**
     * Initialize i18n system
     */
    async init() {
        try {
            // Load translations
            this.translations.ar = ar;
            this.translations.en = en;
            
            // Load saved language preference
            await this.loadLanguagePreference();
            
            // Apply language
            this.applyLanguage();
            
            console.log('✅ i18n module initialized');
        } catch (error) {
            console.error('Error initializing i18n:', error);
            // Default to Arabic
            this.currentLanguage = 'ar';
            this.applyLanguage();
        }
    },
    
    /**
     * Load language preference from database
     */
    async loadLanguagePreference() {
        // Check if user is authenticated before accessing Firebase
        const isAuthenticated = typeof auth !== 'undefined' && auth && auth.currentUser;
        
        if (!isAuthenticated) {
            // User not authenticated - use localStorage only
            const savedLang = localStorage.getItem('appLanguage');
            if (savedLang) {
                this.currentLanguage = savedLang;
            }
            return;
        }
        
        try {
            // Check if db is available
            if (typeof db === 'undefined' || !db) {
                throw new Error('Database not available');
            }
            
            const settingsRef = db.collection('SYSTEM_SETTINGS').doc('languageSettings');
            const settingsDoc = await settingsRef.get();
            
            if (settingsDoc.exists) {
                const settings = settingsDoc.data();
                this.currentLanguage = settings.language || 'ar';
            } else {
                // Check localStorage as fallback
                const savedLang = localStorage.getItem('appLanguage');
                if (savedLang) {
                    this.currentLanguage = savedLang;
                }
            }
        } catch (error) {
            // Silently fall back to localStorage if error is permission-related
            if (error.code === 'permission-denied' || error.message?.includes('permission')) {
                // User not authenticated or no permission - use localStorage
                const savedLang = localStorage.getItem('appLanguage');
                if (savedLang) {
                    this.currentLanguage = savedLang;
                }
            } else {
                console.error('Error loading language preference:', error);
                // Use localStorage as fallback
                const savedLang = localStorage.getItem('appLanguage');
                if (savedLang) {
                    this.currentLanguage = savedLang;
                }
            }
        }
    },
    
    /**
     * Save language preference
     */
    async saveLanguagePreference(language) {
        // Always save to localStorage first
        localStorage.setItem('appLanguage', language);
        this.currentLanguage = language;
        this.applyLanguage();
        
        // Check if user is authenticated before accessing Firebase
        const isAuthenticated = typeof auth !== 'undefined' && auth && auth.currentUser;
        
        if (!isAuthenticated) {
            // User not authenticated - only save to localStorage
            console.log('ℹ️ Language preference saved to localStorage (user not authenticated)');
            return;
        }
        
        try {
            // Check if db is available
            if (typeof db === 'undefined' || !db) {
                throw new Error('Database not available');
            }
            
            // Save to Firestore
            const settingsRef = db.collection('SYSTEM_SETTINGS').doc('languageSettings');
            await settingsRef.set({
                language: language,
                updatedAt: new Date(),
                updatedBy: auth.currentUser?.uid || 'system'
            }, { merge: true });
            
            console.log('✅ Language preference saved to database:', language);
        } catch (error) {
            // Silently ignore permission errors - already saved to localStorage
            if (error.code !== 'permission-denied' && !error.message?.includes('permission')) {
                console.error('Error saving language preference to database:', error);
            }
            // Language already saved to localStorage above, so it's fine
        }
    },
    
    /**
     * Get translation
     * @param {string} key - Translation key (e.g., 'common.save')
     * @param {object} params - Parameters to replace in translation
     * @returns {string} Translated text
     */
    t(key, params = {}) {
        const keys = key.split('.');
        let translation = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (translation && translation[k]) {
                translation = translation[k];
            } else {
                // Fallback to Arabic if translation not found
                if (this.currentLanguage !== 'ar') {
                    translation = this.translations.ar;
                    for (const k2 of keys) {
                        if (translation && translation[k2]) {
                            translation = translation[k2];
                        } else {
                            return key; // Return key if not found
                        }
                    }
                } else {
                    return key; // Return key if not found
                }
            }
        }
        
        // Replace parameters
        if (typeof translation === 'string' && Object.keys(params).length > 0) {
            return translation.replace(/\{\{(\w+)\}\}/g, (match, key) => {
                return params[key] || match;
            });
        }
        
        return translation || key;
    },
    
    /**
     * Apply language to the page
     */
    applyLanguage() {
        // Update HTML lang attribute
        document.documentElement.lang = this.currentLanguage;
        
        // Update dir attribute
        if (this.currentLanguage === 'ar') {
            document.documentElement.dir = 'rtl';
            // Switch to RTL Bootstrap
            const bootstrapCSS = document.getElementById('bootstrapCSS');
            if (bootstrapCSS) {
                bootstrapCSS.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css';
            }
        } else {
            document.documentElement.dir = 'ltr';
            // Switch to LTR Bootstrap
            const bootstrapCSS = document.getElementById('bootstrapCSS');
            if (bootstrapCSS) {
                bootstrapCSS.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
            }
        }
        
        // Update body class
        document.body.classList.remove('lang-ar', 'lang-en');
        document.body.classList.add(`lang-${this.currentLanguage}`);
        
        // Trigger custom event for modules to update
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: this.currentLanguage }
        }));
        
        console.log('✅ Language applied:', this.currentLanguage);
    },
    
    /**
     * Change language
     */
    async changeLanguage(language) {
        if (!this.translations[language]) {
            console.error('Language not supported:', language);
            return;
        }
        
        await this.saveLanguagePreference(language);
        
        // Show loading message
        if (typeof showLoading === 'function') {
            showLoading();
        }
        
        // Reload page to apply all translations and Bootstrap RTL/LTR
        setTimeout(() => {
            window.location.reload();
        }, 500);
    },
    
    /**
     * Get current language
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    },
    
    /**
     * Check if current language is RTL
     */
    isRTL() {
        return this.currentLanguage === 'ar';
    }
};

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        i18n.init();
    });
} else {
    i18n.init();
}

