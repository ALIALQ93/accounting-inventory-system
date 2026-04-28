/**
 * Firebase Configuration
 * @module config
 */

// Firebase Configuration
// إعدادات مشروع Firebase الفعلية
const firebaseConfig = {
    apiKey: "AIzaSyAl3kOC_5R2wHBKnP5hwZORGuqCzHke2Hs",
    authDomain: "accounting-inventory-system.firebaseapp.com",
    projectId: "accounting-inventory-system",
    storageBucket: "accounting-inventory-system.firebasestorage.app",
    messagingSenderId: "524991557419",
    appId: "1:524991557419:web:ed5ce7699a5b7e405d1f6e",
    measurementId: "G-FWKG0JC14H"
};

// Initialize Firebase (using v8 SDK - compatible with current code)
firebase.initializeApp(firebaseConfig);

// Firebase Services
const auth = firebase.auth();
const db = firebase.firestore();
// Storage will be initialized when needed
// const storage = firebase.storage();

// Enable offline persistence
db.enablePersistence()
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
            console.warn('⚠️ The current browser does not support persistence.');
        } else if (err.message && err.message.includes('newer version')) {
            console.warn('⚠️ Firebase SDK version mismatch. Clearing IndexedDB data...');
            // Clear IndexedDB data for this app
            if (typeof indexedDB !== 'undefined') {
                indexedDB.deleteDatabase('firebaseLocalStorageDb');
                indexedDB.deleteDatabase('firestore');
            }
        } else {
            console.warn('⚠️ Error enabling persistence:', err.message);
        }
    });

// App Configuration
const appConfig = {
    // Currency settings
    currency: 'IQD',
    currencySymbol: 'د.ع',
    decimalPlaces: 0,
    
    // Number formatting settings
    numberFormat: 'en-US', // Use English numbers (0-9) with thousands separators
    useEnglishNumbers: true, // Force English numbers in all displays
    thousandsSeparator: ',', // Thousands separator
    
    // Date and time settings
    dateFormat: 'en-US', // Use English numbers in dates (Gregorian calendar)
    calendarType: 'gregorian', // 'gregorian' or 'hijri'
    timeZone: 'Asia/Baghdad',
    
    // App settings
    appName: 'نظام المحاسبة والمخزون',
    appVersion: '1.0.0',
    companyName: 'شركة روزماري',
    companyNameEn: 'ROSEMARY Company',
    
    // Pagination
    itemsPerPage: 10,
    
    // File upload settings
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    
    // Exchange rates (default values)
    exchangeRates: {
        USD: 1460,
        EUR: 1580,
        TRY: 45
    },
    
    // Tax settings (default values)
    taxSettings: {
        vatRate: 15,
        incomeTaxRate: 5,
        corporateTaxRate: 10,
        serviceTaxRate: 8
    },
    
    // Stock settings
    lowStockThreshold: 10,
    criticalStockThreshold: 5,
    
    // Invoice settings
    invoicePrefix: {
        sales: 'INV',
        purchase: 'PUR',
        journal: 'JE'
    },
    
    // Roles and permissions
    roles: {
        SUPER_ADMIN: 'super_admin',
        MANAGER: 'manager',
        ACCOUNTANT: 'accountant',
        SALES: 'sales',
        WAREHOUSE: 'warehouse'
    },
    
    // Status options
    status: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        SUSPENDED: 'suspended',
        DRAFT: 'draft',
        POSTED: 'posted',
        CANCELLED: 'cancelled'
    },
    
    // Party types
    partyTypes: {
        CUSTOMER: 'customer',
        SUPPLIER: 'supplier',
        BOTH: 'both'
    },
    
    // Transaction types
    transactionTypes: {
        INCOME: 'income',
        EXPENSE: 'expense'
    },
    
    // Payment methods
    paymentMethods: {
        CASH: 'cash',
        BANK: 'bank',
        CHECK: 'check',
        CREDIT_CARD: 'credit_card',
        DEBIT_CARD: 'debit_card',
        MOBILE_WALLET: 'mobile_wallet'
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, appConfig, auth, db };
}

console.log('✅ Config module loaded');
console.log('📱 App:', appConfig.appName, 'v' + appConfig.appVersion);

/**
 * ملاحظات هامة:
 * 
 * 1. يجب استبدال قيم firebaseConfig بقيم مشروعك الفعلية من Firebase Console
 * 2. للحصول على إعدادات Firebase:
 *    - اذهب إلى https://console.firebase.google.com
 *    - اختر مشروعك
 *    - اذهب إلى Project Settings > General
 *    - في قسم "Your apps" انسخ firebaseConfig
 * 
 * 3. بعد نسخ الإعدادات، قم بتفعيل:
 *    - Authentication > Sign-in method > Email/Password
 *    - Firestore Database > Create database
 *    - Storage > Get started
 * 
 * 4. ارفع firestore.rules إلى Firebase Console
 */

