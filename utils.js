/**
 * Utility Functions for Accounting & Inventory System
 * @module utils
 */

/**
 * Format amount as currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat(appConfig.numberFormat, {
        style: 'currency',
        currency: appConfig.currency,
        minimumFractionDigits: appConfig.decimalPlaces,
        maximumFractionDigits: appConfig.decimalPlaces,
        numberingSystem: 'latn' // Use Latin (English) numbers
    }).format(amount || 0);
}

/**
 * Format number with thousands separator
 * @param {number} number - Number to format
 * @param {number} decimals - Number of decimal places (optional)
 * @returns {string} Formatted number string
 */
function formatNumber(number, decimals = null) {
    if (number === null || number === undefined || isNaN(number)) return '0';
    const decimalPlaces = decimals !== null ? decimals : appConfig.decimalPlaces;
    return new Intl.NumberFormat(appConfig.numberFormat, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
        numberingSystem: 'latn' // Use Latin (English) numbers
    }).format(number);
}

/**
 * Format date to localized string with English numbers
 * @param {Date|Timestamp} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
    if (!date) return '-';
    try {
        const d = date.toDate ? date.toDate() : new Date(date);
        // Use Gregorian calendar with English numbers
        return d.toLocaleDateString(appConfig.dateFormat, {
            calendar: 'gregory',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            numberingSystem: 'latn' // Use Latin (English) numbers
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return '-';
    }
}

/**
 * Format date and time to localized string with English numbers
 * @param {Date|Timestamp} date - Date to format
 * @returns {string} Formatted datetime string
 */
function formatDateTime(date) {
    if (!date) return '-';
    try {
        const d = date.toDate ? date.toDate() : new Date(date);
        // Use Gregorian calendar with English numbers
        return d.toLocaleString(appConfig.dateFormat, {
            calendar: 'gregory',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            numberingSystem: 'latn' // Use Latin (English) numbers
        });
    } catch (error) {
        console.error('Error formatting datetime:', error);
        return '-';
    }
}

/**
 * Show loading spinner
 */
function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.add('show');
    }
}

/**
 * Hide loading spinner
 */
function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.remove('show');
        // Force hide with inline style as backup
        spinner.style.display = 'none';
        spinner.style.pointerEvents = 'none';
        spinner.style.opacity = '0';
    }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
    Swal.fire({
        icon: 'error',
        title: 'خطأ!',
        text: message,
        confirmButtonText: 'حسناً',
        confirmButtonColor: '#e74c3c'
    });
}

/**
 * Show success message
 * @param {string} message - Success message to display
 * @param {number} timer - Auto close timer in ms
 */
function showSuccess(message, timer = 2000) {
    Swal.fire({
        icon: 'success',
        title: 'نجح!',
        text: message,
        confirmButtonText: 'حسناً',
        confirmButtonColor: '#27ae60',
        timer: timer
    });
}

/**
 * Show info message
 * @param {string} message - Info message to display
 * @param {number} timer - Auto close timer in ms
 */
function showInfo(message, timer = 2000) {
    Swal.fire({
        icon: 'info',
        title: 'معلومة',
        text: message,
        confirmButtonText: 'حسناً',
        confirmButtonColor: '#3498db',
        timer: timer,
        toast: true,
        position: 'top-end',
        showConfirmButton: false
    });
}

/**
 * Show confirmation dialog
 * @param {string} title - Dialog title
 * @param {string} text - Dialog text
 * @returns {Promise} Promise resolving to user's choice
 */
function showConfirm(title, text) {
    return Swal.fire({
        icon: 'question',
        title: title,
        text: text,
        showCancelButton: true,
        confirmButtonText: 'نعم',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#3498db',
        cancelButtonColor: '#95a5a6'
    });
}


/**
 * Show warning message
 * @param {string} message - Warning message to display
 */
function showWarning(message) {
    Swal.fire({
        icon: 'warning',
        title: 'تنبيه!',
        text: message,
        confirmButtonText: 'حسناً',
        confirmButtonColor: '#f39c12'
    });
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Validate phone number (Iraqi format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
function validatePhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    const phoneRegex = /^(\+964|0)?7[3-9]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate positive number
 * @param {*} value - Value to validate
 * @returns {boolean} True if valid positive number
 */
function validatePositiveNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0;
}

/**
 * Validate required field
 * @param {*} value - Value to validate
 * @returns {boolean} True if not empty
 */
function validateRequired(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return !isNaN(value);
    return true;
}

/**
 * Sanitize input string
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeInput(input) {
    if (!input || typeof input !== 'string') return '';
    return input.trim()
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
function deepClone(obj) {
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (error) {
        console.error('Error cloning object:', error);
        return obj;
    }
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit time in ms
 * @returns {Function} Throttled function
 */
function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Handle async operations with loading and error handling
 * @param {Function} asyncFn - Async function to execute
 * @param {string} successMessage - Success message to display
 * @param {boolean} showLoadingSpinner - Whether to show loading spinner
 * @returns {Promise} Result of async function
 */
async function handleAsync(asyncFn, successMessage = null, showLoadingSpinner = true) {
    if (showLoadingSpinner) showLoading();
    try {
        const result = await asyncFn();
        if (successMessage) {
            showSuccess(successMessage);
        }
        return result;
    } catch (error) {
        console.error('Async operation failed:', error);
        showError(error.message || 'حدث خطأ غير متوقع');
        throw error;
    } finally {
        if (showLoadingSpinner) hideLoading();
    }
}

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Calculate percentage
 * @param {number} value - Value
 * @param {number} total - Total
 * @returns {number} Percentage
 */
function calculatePercentage(value, total) {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100 * 100) / 100;
}

/**
 * Get date range for period
 * @param {string} period - Period type (today, week, month, year)
 * @returns {Object} Object with start and end dates
 */
function getDateRange(period) {
    const now = new Date();
    const start = new Date();
    let end = new Date();
    
    switch(period) {
        case 'today':
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            break;
        case 'week':
            start.setDate(now.getDate() - 7);
            start.setHours(0, 0, 0, 0);
            break;
        case 'month':
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            break;
        case 'year':
            start.setMonth(0, 1);
            start.setHours(0, 0, 0, 0);
            break;
        default:
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
    }
    
    return { start, end };
}

/**
 * Export data to CSV
 * @param {Array} data - Array of objects to export
 * @param {string} filename - CSV filename
 */
function exportToCSV(data, filename = 'export.csv') {
    if (!data || data.length === 0) {
        showWarning('لا توجد بيانات للتصدير');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const value = row[header];
            return typeof value === 'string' ? `"${value}"` : value;
        }).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

/**
 * Print element content
 * @param {string} elementId - ID of element to print
 */
function printElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        showError('العنصر المراد طباعته غير موجود');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>طباعة</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css" rel="stylesheet">
            <link href="css/style.css" rel="stylesheet">
            <style>
                @media print {
                    .no-print { display: none !important; }
                    body { margin: 20px; }
                }
            </style>
        </head>
        <body onload="window.print(); window.close();">
            ${element.innerHTML}
        </body>
        </html>
    `);
    printWindow.document.close();
}

/**
 * Check if online
 * @returns {boolean} True if online
 */
function isOnline() {
    return navigator.onLine;
}

/**
 * Get current timestamp
 * @returns {Object} Firebase server timestamp
 */
function getTimestamp() {
    return firebase.firestore.FieldValue.serverTimestamp();
}

/**
 * Convert currency
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @param {Object} rates - Exchange rates object
 * @returns {number} Converted amount
 */
function convertCurrency(amount, fromCurrency, toCurrency, rates) {
    if (!amount || !rates) return 0;
    if (fromCurrency === toCurrency) return amount;
    
    // Convert to base currency (IQD) first
    let amountInBase = amount;
    if (fromCurrency !== 'IQD') {
        amountInBase = amount * (rates[fromCurrency] || 1);
    }
    
    // Convert to target currency
    if (toCurrency === 'IQD') {
        return amountInBase;
    }
    return amountInBase / (rates[toCurrency] || 1);
}

// Ensure loading overlay is hidden when utils loads
if (typeof hideLoading === 'function') {
    hideLoading();
}

console.log('✅ Utils module loaded');


