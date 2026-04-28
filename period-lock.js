/**
 * Period Lock Module - قفل الفترات المحاسبية
 * @module modules/period-lock
 */

const PeriodLockModule = {
    currentPeriod: null,
    lockedPeriods: [],
    
    /**
     * Get HTML for period lock module
     */
    getHTML() {
        return `
            <section id="period-lock" class="period-lock-module">
                <!-- Header -->
                <div class="period-lock-header">
                    <div class="header-content-wrapper">
                        <div class="header-icon-box">
                            <i class="fas fa-lock"></i>
                        </div>
                        <div class="header-text-box">
                            <h1 class="header-title">قفل الفترات المحاسبية</h1>
                            <p class="header-subtitle">إدارة وقفل الفترات المحاسبية لمنع التعديلات غير المصرح بها</p>
                        </div>
                    </div>
                </div>
                
                <!-- Current Period Status -->
                <div class="current-period-card">
                    <div class="row">
                        <div class="col-md-8">
                            <h5><i class="fas fa-calendar-alt"></i> الفترة المحاسبية الحالية</h5>
                            <div id="currentPeriodInfo" class="period-info">
                                <div class="period-detail">
                                    <span class="label">الشهر:</span>
                                    <span class="value" id="currentMonth">-</span>
                                </div>
                                <div class="period-detail">
                                    <span class="label">السنة:</span>
                                    <span class="value" id="currentYear">-</span>
                                </div>
                                <div class="period-detail">
                                    <span class="label">الحالة:</span>
                                    <span class="value" id="currentStatus">-</span>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4 text-end">
                            <button class="btn btn-warning btn-lg" onclick="PeriodLockModule.lockCurrentPeriod()">
                                <i class="fas fa-lock"></i> قفل الفترة الحالية
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Periods Table -->
                <div class="periods-table-card">
                    <div class="card-header">
                        <h5><i class="fas fa-list"></i> سجل الفترات المحاسبية</h5>
                        <div class="filters">
                            <select class="form-select form-select-sm" id="yearFilter" onchange="PeriodLockModule.filterPeriods()">
                                <option value="">كل السنوات</option>
                            </select>
                            <select class="form-select form-select-sm" id="statusFilter" onchange="PeriodLockModule.filterPeriods()">
                                <option value="">كل الحالات</option>
                                <option value="open">مفتوحة</option>
                                <option value="locked">مقفلة</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="table-container">
                        <table class="table table-modern">
                            <thead>
                                <tr>
                                    <th width="10%">السنة</th>
                                    <th width="15%">الشهر</th>
                                    <th width="15%">تاريخ البداية</th>
                                    <th width="15%">تاريخ النهاية</th>
                                    <th width="12%">عدد القيود</th>
                                    <th width="10%">الحالة</th>
                                    <th width="15%">قُفلت بواسطة</th>
                                    <th width="8%">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody id="periodsTableBody">
                                <tr>
                                    <td colspan="8" class="text-center text-muted">
                                        <i class="fas fa-spinner fa-spin"></i> جاري التحميل...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <!-- Warning Box -->
                <div class="warning-box">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>
                        <strong>تحذير مهم:</strong>
                        <ul>
                            <li>قفل الفترة يمنع أي تعديل أو حذف للقيود المحاسبية في تلك الفترة</li>
                            <li>لا يمكن فتح الفترة إلا من قبل المدير أو من له صلاحيات خاصة</li>
                            <li>تأكد من صحة جميع القيود قبل قفل الفترة</li>
                            <li>يُنصح بعمل نسخة احتياطية قبل قفل الفترة</li>
                        </ul>
                    </div>
                </div>
            </section>
        `;
    },
    
    /**
     * Render module
     */
    render() {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.innerHTML = this.getHTML();
        }
    },
    
    /**
     * Initialize module
     */
    async initialize() {
        console.log('🔒 Initializing period lock module...');
        await this.loadCurrentPeriod();
        await this.loadAllPeriods();
        await this.populateYearFilter();
        console.log('✅ Period lock module initialized');
    },
    
    /**
     * Load module
     */
    async load() {
        console.log('🔒 Loading period lock module...');
        this.render();
        await this.initialize();
        console.log('✅ Period lock module loaded');
    },
    
    /**
     * Load current period
     */
    async loadCurrentPeriod() {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        
        try {
            const snapshot = await db.collection('accountingPeriods')
                .where('year', '==', currentYear)
                .where('month', '==', currentMonth)
                .limit(1)
                .get();
            
            if (!snapshot.empty) {
                this.currentPeriod = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
            } else {
                // Create current period if not exists
                this.currentPeriod = await this.createPeriod(currentYear, currentMonth);
            }
            
            this.updateCurrentPeriodUI();
            
        } catch (error) {
            console.error('Error loading current period:', error);
        }
    },
    
    /**
     * Load all periods
     */
    async loadAllPeriods() {
        try {
            const snapshot = await db.collection('accountingPeriods')
                .orderBy('year', 'desc')
                .orderBy('month', 'desc')
                .get();
            
            this.lockedPeriods = [];
            snapshot.forEach(doc => {
                this.lockedPeriods.push({ id: doc.id, ...doc.data() });
            });
            
            this.renderPeriodsTable();
            
        } catch (error) {
            console.error('Error loading periods:', error);
        }
    },
    
    /**
     * Create new period
     */
    async createPeriod(year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        const periodData = {
            year,
            month,
            startDate: startDate,
            endDate: endDate,
            status: 'open',
            entriesCount: 0,
            createdAt: new Date(),
            createdBy: auth.currentUser?.uid || 'system'
        };
        
        const docRef = await db.collection('accountingPeriods').add(periodData);
        return { id: docRef.id, ...periodData };
    },
    
    /**
     * Update current period UI
     */
    updateCurrentPeriodUI() {
        if (!this.currentPeriod) return;
        
        const monthNames = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        
        document.getElementById('currentMonth').textContent = monthNames[this.currentPeriod.month - 1];
        document.getElementById('currentYear').textContent = this.currentPeriod.year;
        
        const statusEl = document.getElementById('currentStatus');
        if (this.currentPeriod.status === 'locked') {
            statusEl.innerHTML = '<span class="badge bg-danger"><i class="fas fa-lock"></i> مقفلة</span>';
        } else {
            statusEl.innerHTML = '<span class="badge bg-success"><i class="fas fa-lock-open"></i> مفتوحة</span>';
        }
    },
    
    /**
     * Render periods table
     */
    renderPeriodsTable() {
        const tbody = document.getElementById('periodsTableBody');
        if (!tbody) return;
        
        if (this.lockedPeriods.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">لا توجد فترات محاسبية</td></tr>';
            return;
        }
        
        const monthNames = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        
        tbody.innerHTML = this.lockedPeriods.map(period => `
            <tr>
                <td><strong>${period.year}</strong></td>
                <td>${monthNames[period.month - 1]}</td>
                <td>${this.formatDate(period.startDate)}</td>
                <td>${this.formatDate(period.endDate)}</td>
                <td class="text-center">${period.entriesCount || 0}</td>
                <td>
                    ${period.status === 'locked' 
                        ? '<span class="badge bg-danger"><i class="fas fa-lock"></i> مقفلة</span>'
                        : '<span class="badge bg-success"><i class="fas fa-lock-open"></i> مفتوحة</span>'
                    }
                </td>
                <td>
                    ${period.lockedBy 
                        ? `<small>${period.lockedByName || '-'}<br>${this.formatDate(period.lockedAt)}</small>`
                        : '-'
                    }
                </td>
                <td>
                    ${period.status === 'locked'
                        ? `<button class="btn btn-sm btn-warning" onclick="PeriodLockModule.unlockPeriod('${period.id}')">
                            <i class="fas fa-unlock"></i>
                           </button>`
                        : `<button class="btn btn-sm btn-danger" onclick="PeriodLockModule.lockPeriod('${period.id}')">
                            <i class="fas fa-lock"></i>
                           </button>`
                    }
                </td>
            </tr>
        `).join('');
    },
    
    /**
     * Lock current period
     */
    async lockCurrentPeriod() {
        if (!this.currentPeriod) {
            showError('لم يتم العثور على الفترة الحالية');
            return;
        }
        
        if (this.currentPeriod.status === 'locked') {
            showWarning('الفترة الحالية مقفلة بالفعل');
            return;
        }
        
        await this.lockPeriod(this.currentPeriod.id);
    },
    
    /**
     * Lock period
     */
    async lockPeriod(periodId) {
        const period = this.lockedPeriods.find(p => p.id === periodId);
        if (!period) {
            showError('لم يتم العثور على الفترة');
            return;
        }
        
        const monthNames = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        
        const result = await Swal.fire({
            title: 'تأكيد قفل الفترة',
            html: `
                <div class="text-end">
                    <p><strong>هل أنت متأكد من قفل الفترة المحاسبية؟</strong></p>
                    <p>الفترة: <strong>${monthNames[period.month - 1]} ${period.year}</strong></p>
                    <p class="text-danger">
                        <i class="fas fa-exclamation-triangle"></i>
                        تحذير: بعد القفل لن يمكن التعديل على أي قيود في هذه الفترة!
                    </p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، قفل الفترة',
            cancelButtonText: 'إلغاء',
            confirmButtonColor: '#dc3545'
        });
        
        if (result.isConfirmed) {
            try {
                showLoading();
                
                // Count entries in this period
                const entriesSnapshot = await db.collection('generalEntries')
                    .where('date', '>=', period.startDate)
                    .where('date', '<=', period.endDate)
                    .get();
                
                const entriesCount = entriesSnapshot.size;
                
                // Get current user name
                const user = auth.currentUser;
                let userName = 'مستخدم';
                if (user) {
                    const userDoc = await db.collection('users').doc(user.uid).get();
                    if (userDoc.exists) {
                        userName = userDoc.data().displayName || user.email;
                    }
                }
                
                // Lock the period
                await db.collection('accountingPeriods').doc(periodId).update({
                    status: 'locked',
                    lockedAt: new Date(),
                    lockedBy: user?.uid || 'system',
                    lockedByName: userName,
                    entriesCount: entriesCount
                });
                
                showSuccess('تم قفل الفترة المحاسبية بنجاح');
                await this.loadCurrentPeriod();
                await this.loadAllPeriods();
                
            } catch (error) {
                console.error('Error locking period:', error);
                showError('حدث خطأ أثناء قفل الفترة');
            } finally {
                hideLoading();
            }
        }
    },
    
    /**
     * Unlock period
     */
    async unlockPeriod(periodId) {
        const period = this.lockedPeriods.find(p => p.id === periodId);
        if (!period) {
            showError('لم يتم العثور على الفترة');
            return;
        }
        
        const monthNames = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        
        const result = await Swal.fire({
            title: 'تأكيد فتح الفترة',
            html: `
                <div class="text-end">
                    <p><strong>هل أنت متأكد من فتح الفترة المحاسبية؟</strong></p>
                    <p>الفترة: <strong>${monthNames[period.month - 1]} ${period.year}</strong></p>
                    <p class="text-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        تحذير: بعد الفتح سيمكن التعديل على القيود في هذه الفترة!
                    </p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، فتح الفترة',
            cancelButtonText: 'إلغاء',
            confirmButtonColor: '#ffc107'
        });
        
        if (result.isConfirmed) {
            try {
                showLoading();
                
                await db.collection('accountingPeriods').doc(periodId).update({
                    status: 'open',
                    unlockedAt: new Date(),
                    unlockedBy: auth.currentUser?.uid || 'system'
                });
                
                showSuccess('تم فتح الفترة المحاسبية بنجاح');
                await this.loadCurrentPeriod();
                await this.loadAllPeriods();
                
            } catch (error) {
                console.error('Error unlocking period:', error);
                showError('حدث خطأ أثناء فتح الفترة');
            } finally {
                hideLoading();
            }
        }
    },
    
    /**
     * Check if date is in locked period
     */
    async isDateLocked(date) {
        const dateObj = date instanceof Date ? date : new Date(date);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        
        try {
            const snapshot = await db.collection('accountingPeriods')
                .where('year', '==', year)
                .where('month', '==', month)
                .where('status', '==', 'locked')
                .limit(1)
                .get();
            
            return !snapshot.empty;
            
        } catch (error) {
            console.error('Error checking locked period:', error);
            return false;
        }
    },
    
    /**
     * Validate entry date (for use in other modules)
     */
    async validateEntryDate(date) {
        const isLocked = await this.isDateLocked(date);
        
        if (isLocked) {
            const dateObj = date instanceof Date ? date : new Date(date);
            const monthNames = [
                'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
            ];
            
            await Swal.fire({
                title: 'الفترة مقفلة',
                html: `
                    <p>لا يمكن إضافة أو تعديل قيود في فترة مقفلة</p>
                    <p>الفترة: <strong>${monthNames[dateObj.getMonth()]} ${dateObj.getFullYear()}</strong></p>
                `,
                icon: 'error',
                confirmButtonText: 'حسناً'
            });
            
            return false;
        }
        
        return true;
    },
    
    /**
     * Populate year filter
     */
    async populateYearFilter() {
        const yearFilter = document.getElementById('yearFilter');
        if (!yearFilter) return;
        
        const years = [...new Set(this.lockedPeriods.map(p => p.year))].sort((a, b) => b - a);
        
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
    },
    
    /**
     * Filter periods
     */
    filterPeriods() {
        const yearFilter = document.getElementById('yearFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        
        const tbody = document.getElementById('periodsTableBody');
        const rows = tbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const year = row.cells[0]?.textContent;
            const statusBadge = row.cells[5]?.textContent;
            
            let showYear = !yearFilter || year === yearFilter;
            let showStatus = !statusFilter || 
                (statusFilter === 'locked' && statusBadge.includes('مقفلة')) ||
                (statusFilter === 'open' && statusBadge.includes('مفتوحة'));
            
            row.style.display = (showYear && showStatus) ? '' : 'none';
        });
    },
    
    /**
     * Format date
     */
    formatDate(date) {
        if (!date) return '-';
        const dateObj = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);
        return dateObj.toLocaleDateString('ar-IQ');
    }
};

console.log('✅ Period lock module loaded');
