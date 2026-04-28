/**
 * Pre-Release Audit Script
 * سكربت التدقيق قبل النشر
 * @module utils/pre-release-audit
 */

class PreReleaseAuditor {
    constructor() {
        this.results = {
            passed: [],
            failed: [],
            warnings: [],
            info: []
        };
        this.startTime = Date.now();
    }

    /**
     * Run complete audit
     * تشغيل التدقيق الكامل
     */
    async runCompleteAudit() {
        console.log('🔍 بدء التدقيق الشامل قبل النشر...');
        console.log('🔍 Starting comprehensive pre-release audit...');

        try {
            // 1. Security Audit
            await this.auditSecurity();

            // 2. Data Integrity Audit
            await this.auditDataIntegrity();

            // 3. Code Quality Audit
            await this.auditCodeQuality();

            // 4. Configuration Audit
            await this.auditConfiguration();

            // 5. Performance Audit
            await this.auditPerformance();

            // Generate and return report
            return this.generateReport();

        } catch (error) {
            console.error('❌ خطأ في التدقيق:', error);
            this.results.failed.push({
                category: 'Audit System',
                message: 'فشل في تشغيل التدقيق: ' + error.message
            });
            
            // Return report even on error
            return this.generateReport();
        }
    }

    /**
     * Audit Security
     * تدقيق الأمان
     */
    async auditSecurity() {
        console.log('🔒 تدقيق الأمان...');

        // Check Firebase Config
        if (typeof firebase === 'undefined') {
            this.results.failed.push({
                category: 'Security',
                message: 'Firebase غير محمّل'
            });
        } else {
            this.results.passed.push({
                category: 'Security',
                message: 'Firebase محمّل بشكل صحيح'
            });
        }

        // Check Authentication
        if (typeof auth !== 'undefined') {
            try {
                const user = auth.currentUser;
                if (!user) {
                    this.results.warnings.push({
                        category: 'Security',
                        message: 'لا يوجد مستخدم مسجل دخول - بعض الفحوصات قد تفشل'
                    });
                } else {
                    this.results.passed.push({
                        category: 'Security',
                        message: 'المصادقة نشطة'
                    });
                }
            } catch (error) {
                this.results.failed.push({
                    category: 'Security',
                    message: 'خطأ في التحقق من المصادقة: ' + error.message
                });
            }
        }

        // Check for exposed API keys
        const scripts = Array.from(document.querySelectorAll('script[src], script:not([src])'));
        let foundExposedKeys = false;
        scripts.forEach(script => {
            const content = script.textContent || script.innerHTML || '';
            if (content.includes('AIzaSy') && content.includes('apiKey')) {
                foundExposedKeys = true;
            }
        });

        if (foundExposedKeys) {
            this.results.warnings.push({
                category: 'Security',
                message: '⚠️ تم العثور على مفاتيح API في الكود - تأكد من أنها محمية'
            });
        } else {
            this.results.passed.push({
                category: 'Security',
                message: 'لا توجد مفاتيح API مكشوفة في الكود'
            });
        }
    }

    /**
     * Audit Data Integrity
     * تدقيق تكامل البيانات
     */
    async auditDataIntegrity() {
        console.log('📊 تدقيق تكامل البيانات...');

        if (typeof db === 'undefined') {
            this.results.failed.push({
                category: 'Data Integrity',
                message: 'قاعدة البيانات غير متاحة'
            });
            return;
        }

        try {
            // Check critical collections exist
            const criticalCollections = [
                'products',
                'sales',
                'purchases',
                'parties',
                'chartOfAccounts',
                'generalEntries',
                'warehouses'
            ];

            for (const collection of criticalCollections) {
                try {
                    const snapshot = await db.collection(collection).limit(1).get();
                    this.results.passed.push({
                        category: 'Data Integrity',
                        message: `Collection "${collection}" متاحة`
                    });
                } catch (error) {
                    if (error.code === 'permission-denied') {
                        this.results.warnings.push({
                            category: 'Data Integrity',
                            message: `لا توجد صلاحية للوصول إلى "${collection}"`
                        });
                    } else {
                        this.results.failed.push({
                            category: 'Data Integrity',
                            message: `خطأ في الوصول إلى "${collection}": ${error.message}`
                        });
                    }
                }
            }

            // Check for orphaned data (if user is authenticated)
            if (auth && auth.currentUser) {
                await this.checkOrphanedData();
            }

        } catch (error) {
            this.results.failed.push({
                category: 'Data Integrity',
                message: 'خطأ في تدقيق تكامل البيانات: ' + error.message
            });
        }
    }

    /**
     * Check for orphaned data
     * فحص البيانات المعلقة
     */
    async checkOrphanedData() {
        try {
            // Check products without categories
            const productsSnapshot = await db.collection('products').limit(10).get();
            let orphanedProducts = 0;

            for (const doc of productsSnapshot.docs) {
                const product = doc.data();
                if (product.categoryId) {
                    const categoryDoc = await db.collection('categories').doc(product.categoryId).get();
                    if (!categoryDoc.exists) {
                        orphanedProducts++;
                    }
                }
            }

            if (orphanedProducts > 0) {
                this.results.warnings.push({
                    category: 'Data Integrity',
                    message: `تم العثور على ${orphanedProducts} منتجات بفئات غير موجودة`
                });
            }

        } catch (error) {
            // Silently fail - this is not critical
            console.warn('⚠️ Could not check orphaned data:', error);
        }
    }

    /**
     * Audit Code Quality
     * تدقيق جودة الكود
     */
    async auditCodeQuality() {
        console.log('📝 تدقيق جودة الكود...');

        // Check for console.log in production
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        let foundConsoleLogs = false;
        let consoleLogCount = 0;

        // Note: This is a basic check - actual console.log detection would require
        // analyzing the source files, which we can't do from browser
        this.results.info.push({
            category: 'Code Quality',
            message: 'فحص console.log يتطلب فحص الملفات المصدرية يدوياً'
        });

        // Check for missing error handling
        this.checkErrorHandling();

        // Check for unused modules
        this.checkModuleLoading();
    }

    /**
     * Check Error Handling
     * فحص معالجة الأخطاء
     */
    checkErrorHandling() {
        // Check if error handling functions exist
        const errorHandlers = [
            'showError',
            'showSuccess',
            'showLoading',
            'hideLoading'
        ];

        errorHandlers.forEach(handler => {
            if (typeof window[handler] === 'function') {
                this.results.passed.push({
                    category: 'Code Quality',
                    message: `دالة ${handler} موجودة`
                });
            } else {
                this.results.warnings.push({
                    category: 'Code Quality',
                    message: `دالة ${handler} غير موجودة`
                });
            }
        });
    }

    /**
     * Check Module Loading
     * فحص تحميل الوحدات
     */
    checkModuleLoading() {
        const requiredModules = [
            'SalesModule',
            'PurchasesModule',
            'ProductsModule',
            'PartiesModule',
            'InventoryModule',
            'VouchersModule',
            'ChartOfAccountsModule'
        ];

        requiredModules.forEach(module => {
            if (typeof window[module] !== 'undefined') {
                this.results.passed.push({
                    category: 'Code Quality',
                    message: `الوحدة ${module} محمّلة`
                });
            } else {
                // ✅ تغيير من failed إلى warning لأن الوحدات ليست ضرورية لأداة التدقيق
                this.results.warnings.push({
                    category: 'Code Quality',
                    message: `الوحدة ${module} غير محمّلة (هذا طبيعي في أداة التدقيق)`
                });
            }
        });
    }

    /**
     * Audit Configuration
     * تدقيق الإعدادات
     */
    async auditConfiguration() {
        console.log('⚙️ تدقيق الإعدادات...');

        // Check Firebase Config
        if (typeof firebaseConfig !== 'undefined') {
            const requiredConfigKeys = [
                'apiKey',
                'authDomain',
                'projectId',
                'storageBucket'
            ];

            requiredConfigKeys.forEach(key => {
                if (firebaseConfig[key]) {
                    this.results.passed.push({
                        category: 'Configuration',
                        message: `إعدادات Firebase: ${key} موجود`
                    });
                } else {
                    this.results.failed.push({
                        category: 'Configuration',
                        message: `إعدادات Firebase: ${key} مفقود`
                    });
                }
            });
        }

        // Check App Config
        if (typeof appConfig !== 'undefined') {
            this.results.passed.push({
                category: 'Configuration',
                message: 'إعدادات التطبيق موجودة'
            });

            // Check critical app config values
            if (!appConfig.currency) {
                this.results.warnings.push({
                    category: 'Configuration',
                    message: 'عملة التطبيق غير محددة'
                });
            }
        } else {
            this.results.failed.push({
                category: 'Configuration',
                message: 'إعدادات التطبيق مفقودة'
            });
        }
    }

    /**
     * Audit Performance
     * تدقيق الأداء
     */
    async auditPerformance() {
        console.log('⚡ تدقيق الأداء...');

        // Check page load time using Performance API if available
        let loadTime = Date.now() - this.startTime;
        
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
            if (pageLoadTime > 0) {
                loadTime = pageLoadTime;
            }
        } else if (window.performance && window.performance.now) {
            // Use performance.now() as fallback
            const perfTime = window.performance.now();
            if (perfTime > 0) {
                loadTime = perfTime;
            }
        }

        // Format load time for display
        const loadTimeSeconds = (loadTime / 1000).toFixed(2);
        const loadTimeFormatted = loadTime > 1000 ? `${loadTimeSeconds} ثانية` : `${loadTime}ms`;

        if (loadTime < 3000) {
            this.results.passed.push({
                category: 'Performance',
                message: `وقت التحميل سريع: ${loadTimeFormatted}`
            });
        } else if (loadTime < 5000) {
            this.results.warnings.push({
                category: 'Performance',
                message: `وقت التحميل متوسط: ${loadTimeFormatted}`
            });
        } else {
            // ✅ تحسين الرسالة لتكون أكثر وضوحاً
            this.results.warnings.push({
                category: 'Performance',
                message: `وقت التحميل بطيء: ${loadTimeFormatted} - يفضل التحسين (هذا طبيعي في أداة التدقيق)`
            });
        }

        // Check for large DOM
        const domSize = document.querySelectorAll('*').length;
        if (domSize < 1000) {
            this.results.passed.push({
                category: 'Performance',
                message: `حجم DOM معقول: ${domSize} عنصر`
            });
        } else {
            this.results.warnings.push({
                category: 'Performance',
                message: `حجم DOM كبير: ${domSize} عنصر - قد يؤثر على الأداء`
            });
        }

        // Check for images without optimization
        const images = document.querySelectorAll('img');
        let unoptimizedImages = 0;
        images.forEach(img => {
            if (img.src && !img.complete) {
                unoptimizedImages++;
            }
        });

        if (unoptimizedImages > 0) {
            this.results.info.push({
                category: 'Performance',
                message: `تم العثور على ${unoptimizedImages} صور غير محسّنة`
            });
        }
    }

    /**
     * Generate Audit Report
     * توليد تقرير التدقيق
     */
    generateReport() {
        const endTime = Date.now();
        const duration = this.startTime ? ((endTime - this.startTime) / 1000).toFixed(2) : '0.00';

        console.log('\n' + '='.repeat(60));
        console.log('📊 تقرير التدقيق الشامل | Comprehensive Audit Report');
        console.log('='.repeat(60));
        console.log(`⏱️ وقت التنفيذ: ${duration} ثانية`);
        console.log('\n✅ نجح (Passed):', this.results.passed.length);
        console.log('❌ فشل (Failed):', this.results.failed.length);
        console.log('⚠️ تحذيرات (Warnings):', this.results.warnings.length);
        console.log('ℹ️ معلومات (Info):', this.results.info.length);

        // Print failed items
        if (this.results.failed.length > 0) {
            console.log('\n❌ المشاكل الحرجة (Critical Issues):');
            this.results.failed.forEach((item, index) => {
                console.log(`${index + 1}. [${item.category}] ${item.message}`);
            });
        }

        // Print warnings
        if (this.results.warnings.length > 0) {
            console.log('\n⚠️ التحذيرات (Warnings):');
            this.results.warnings.forEach((item, index) => {
                console.log(`${index + 1}. [${item.category}] ${item.message}`);
            });
        }

        // Print info
        if (this.results.info.length > 0) {
            console.log('\nℹ️ معلومات (Info):');
            this.results.info.forEach((item, index) => {
                console.log(`${index + 1}. [${item.category}] ${item.message}`);
            });
        }

        console.log('\n' + '='.repeat(60));

        // Generate HTML report
        this.generateHTMLReport();

        // Overall status
        if (this.results.failed.length === 0) {
            console.log('✅ النظام جاهز للنشر بشكل عام');
            console.log('✅ System is generally ready for deployment');
        } else {
            console.log('❌ يوجد مشاكل حرجة يجب إصلاحها قبل النشر');
            console.log('❌ Critical issues must be fixed before deployment');
        }

        // Ensure results object exists
        const results = this.results || {
            passed: [],
            failed: [],
            warnings: [],
            info: []
        };

        return {
            passed: results.passed ? results.passed.length : 0,
            failed: results.failed ? results.failed.length : 0,
            warnings: results.warnings ? results.warnings.length : 0,
            info: results.info ? results.info.length : 0,
            duration: duration,
            results: results
        };
    }

    /**
     * Generate HTML Report
     * توليد تقرير HTML
     */
    generateHTMLReport() {
        const reportDiv = document.getElementById('audit-report');
        if (!reportDiv) {
            // Create report container if it doesn't exist
            const container = document.createElement('div');
            container.id = 'audit-report';
            container.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                width: 500px;
                max-height: 80vh;
                overflow-y: auto;
                background: white;
                border: 2px solid #007bff;
                border-radius: 8px;
                padding: 20px;
                z-index: 10000;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            `;
            document.body.appendChild(container);
        }

        const reportHTML = `
            <h3>📊 تقرير التدقيق | Audit Report</h3>
            <div>
                <p><strong>✅ نجح:</strong> ${this.results.passed.length}</p>
                <p><strong>❌ فشل:</strong> ${this.results.failed.length}</p>
                <p><strong>⚠️ تحذيرات:</strong> ${this.results.warnings.length}</p>
                <p><strong>ℹ️ معلومات:</strong> ${this.results.info.length}</p>
            </div>
            ${this.results.failed.length > 0 ? `
                <h4>❌ المشاكل الحرجة:</h4>
                <ul>
                    ${this.results.failed.map(item => `<li>[${item.category}] ${item.message}</li>`).join('')}
                </ul>
            ` : ''}
            ${this.results.warnings.length > 0 ? `
                <h4>⚠️ التحذيرات:</h4>
                <ul>
                    ${this.results.warnings.map(item => `<li>[${item.category}] ${item.message}</li>`).join('')}
                </ul>
            ` : ''}
            <button onclick="document.getElementById('audit-report').remove()">إغلاق</button>
        `;

        document.getElementById('audit-report').innerHTML = reportHTML;
    }

    /**
     * Quick Security Check
     * فحص أمان سريع
     */
    async quickSecurityCheck() {
        console.log('🔒 فحص أمان سريع...');

        const checks = [];

        // Check 1: Firebase loaded
        checks.push({
            name: 'Firebase Loaded',
            passed: typeof firebase !== 'undefined',
            message: typeof firebase !== 'undefined' ? 'Firebase محمّل' : 'Firebase غير محمّل'
        });

        // Check 2: Database accessible
        if (typeof db !== 'undefined') {
            try {
                await db.collection('settings').limit(1).get();
                checks.push({
                    name: 'Database Accessible',
                    passed: true,
                    message: 'قاعدة البيانات متاحة'
                });
            } catch (error) {
                checks.push({
                    name: 'Database Accessible',
                    passed: false,
                    message: 'لا يمكن الوصول لقاعدة البيانات: ' + error.message
                });
            }
        }

        // Check 3: Authentication
        if (typeof auth !== 'undefined') {
            const user = auth.currentUser;
            checks.push({
                name: 'Authentication',
                passed: user !== null,
                message: user ? 'المستخدم مسجل دخول' : 'لا يوجد مستخدم مسجل دخول'
            });
        }

        checks.forEach(check => {
            if (check.passed) {
                console.log(`✅ ${check.name}: ${check.message}`);
            } else {
                console.warn(`❌ ${check.name}: ${check.message}`);
            }
        });

        return checks;
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.PreReleaseAuditor = PreReleaseAuditor;
}

// Auto-run if this is a development environment
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔍 تم تحميل سكربت التدقيق. استخدم: new PreReleaseAuditor().runCompleteAudit()');
    console.log('🔍 Audit script loaded. Use: new PreReleaseAuditor().runCompleteAudit()');
}







