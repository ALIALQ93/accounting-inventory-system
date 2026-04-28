/**
 * Re-post Entries Audit Module
 * وحدة إعادة ترحيل القيود للفواتير والسندات
 * @module modules/repost-entries-audit
 */

const RepostAuditModule = {
    // Data storage
    allItems: [],
    filteredItems: [],
    selectedItems: new Set(),
    
    /**
     * Initialize module
     */
    async init() {
        console.log('🔍 Initializing Repost Audit Module...');
        // Load required data
        await this.loadRequiredData();
    },
    
    /**
     * Load required data (accounts, suppliers, etc.)
     */
    async loadRequiredData() {
        try {
            // Accounts are loaded from chartOfAccounts collection via Collections.getAccounts()
            
            // Load suppliers if available
            if (typeof SuppliersModule !== 'undefined') {
                await SuppliersModule.loadSuppliers();
            }
            
            // Load customers if available
            if (typeof CustomersModule !== 'undefined') {
                await CustomersModule.loadCustomers();
            }
            
            console.log('✅ Required data loaded');
        } catch (error) {
            console.error('❌ Error loading required data:', error);
        }
    },
    
    /**
     * Scan for invoices/vouchers without entries
     */
    async scanMissingEntries() {
        try {
            this.showLoading(true);
            this.clearResults();
            
            const results = {
                purchases: [],
                sales: [],
                purchaseReturns: [],
                saleReturns: [],
                vouchers: []
            };
            
            // Scan purchases
            console.log('🔍 Scanning purchases...');
            const purchasesSnapshot = await db.collection('purchases').get();
            for (const doc of purchasesSnapshot.docs) {
                const purchase = { id: doc.id, ...doc.data() };
                const entryStatus = await this.checkEntryStatus('purchase', purchase.id);
                results.purchases.push({
                    ...purchase,
                    entryStatus,
                    type: 'purchase',
                    typeLabel: 'فاتورة شراء'
                });
            }
            
            // Scan sales
            console.log('🔍 Scanning sales...');
            const salesSnapshot = await db.collection('sales').get();
            for (const doc of salesSnapshot.docs) {
                const sale = { id: doc.id, ...doc.data() };
                const entryStatus = await this.checkEntryStatus('sale', sale.id);
                results.sales.push({
                    ...sale,
                    entryStatus,
                    type: 'sale',
                    typeLabel: 'فاتورة مبيعات'
                });
            }
            
            // Scan purchase returns
            console.log('🔍 Scanning purchase returns...');
            const purchaseReturnsSnapshot = await db.collection('purchaseReturns').get();
            for (const doc of purchaseReturnsSnapshot.docs) {
                const return_ = { id: doc.id, ...doc.data() };
                const entryStatus = await this.checkEntryStatus('purchase_return', return_.id);
                results.purchaseReturns.push({
                    ...return_,
                    entryStatus,
                    type: 'purchase_return',
                    typeLabel: 'مرتجع شراء'
                });
            }
            
            // Scan sale returns
            console.log('🔍 Scanning sale returns...');
            const saleReturnsSnapshot = await db.collection('saleReturns').get();
            for (const doc of saleReturnsSnapshot.docs) {
                const return_ = { id: doc.id, ...doc.data() };
                const entryStatus = await this.checkEntryStatus('sale_return', return_.id);
                results.saleReturns.push({
                    ...return_,
                    entryStatus,
                    type: 'sale_return',
                    typeLabel: 'مرتجع مبيعات'
                });
            }
            
            // Scan vouchers
            console.log('🔍 Scanning vouchers...');
            const vouchersSnapshot = await db.collection('vouchers').get();
            for (const doc of vouchersSnapshot.docs) {
                const voucher = { id: doc.id, ...doc.data() };
                const entryStatus = await this.checkEntryStatus('voucher', voucher.id);
                results.vouchers.push({
                    ...voucher,
                    entryStatus,
                    type: 'voucher',
                    typeLabel: 'سند'
                });
            }
            
            // Combine all results
            this.allItems = [
                ...results.purchases,
                ...results.sales,
                ...results.purchaseReturns,
                ...results.saleReturns,
                ...results.vouchers
            ];
            
            this.filteredItems = [...this.allItems];
            this.displayResults();
            this.updateStats();
            
            this.showLoading(false);
            
            Swal.fire({
                icon: 'success',
                title: 'اكتمل المسح',
                text: `تم العثور على ${this.allItems.length} فاتورة/سند`,
                timer: 2000
            });
            
        } catch (error) {
            console.error('❌ Error scanning:', error);
            this.showLoading(false);
            Swal.fire({
                icon: 'error',
                title: 'خطأ',
                text: 'حدث خطأ أثناء المسح: ' + error.message
            });
        }
    },
    
    /**
     * Check entry status for a source
     */
    async checkEntryStatus(sourceType, sourceId) {
        try {
            const sourceIdStr = String(sourceId);
            let snapshot;
            
            try {
                snapshot = await db.collection('generalEntries')
                    .where('sourceId', '==', sourceIdStr)
                    .where('type', '==', sourceType)
                    .get();
            } catch (error) {
                // Fallback: fetch all and filter
                console.warn('⚠️ Direct query failed, trying fallback:', error);
                const allSnapshot = await db.collection('generalEntries').get();
                const allEntries = allSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const matchingEntries = allEntries.filter(e => 
                    String(e.sourceId) === sourceIdStr && e.type === sourceType
                );
                
                return {
                    count: matchingEntries.length,
                    entries: matchingEntries,
                    status: matchingEntries.length === 0 ? 'no_entry' : 
                           matchingEntries.length === 1 ? 'has_entry' : 'multiple'
                };
            }
            
            const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            return {
                count: entries.length,
                entries: entries,
                status: entries.length === 0 ? 'no_entry' : 
                       entries.length === 1 ? 'has_entry' : 'multiple'
            };
        } catch (error) {
            console.error('❌ Error checking entry status:', error);
            return {
                count: 0,
                entries: [],
                status: 'error'
            };
        }
    },
    
    /**
     * Analyze all entries
     */
    async analyzeAllEntries() {
        try {
            this.showLoading(true);
            this.clearResults();
            
            // Get all general entries
            const entriesSnapshot = await db.collection('generalEntries').get();
            const allEntries = entriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Group by source
            const entriesBySource = {};
            for (const entry of allEntries) {
                const key = `${entry.type}_${entry.sourceId}`;
                if (!entriesBySource[key]) {
                    entriesBySource[key] = [];
                }
                entriesBySource[key].push(entry);
            }
            
            // Find sources with multiple entries
            const multipleEntries = [];
            for (const [key, entries] of Object.entries(entriesBySource)) {
                if (entries.length > 1) {
                    const [type, sourceId] = key.split('_');
                    multipleEntries.push({
                        type,
                        sourceId,
                        count: entries.length,
                        entries
                    });
                }
            }
            
            // Display results
            let resultsHTML = '<h5>القيود المتعددة | Multiple Entries</h5>';
            if (multipleEntries.length === 0) {
                resultsHTML += '<p class="text-success">✅ لا توجد قيود متعددة</p>';
            } else {
                resultsHTML += `<p class="text-warning">⚠️ تم العثور على ${multipleEntries.length} مصدر بقيد متعدد</p>`;
                resultsHTML += '<ul>';
                for (const item of multipleEntries) {
                    resultsHTML += `<li>${item.type} (${item.sourceId}): ${item.count} قيود</li>`;
                }
                resultsHTML += '</ul>';
            }
            
            document.getElementById('resultsContent').innerHTML = resultsHTML;
            document.getElementById('resultsContainer').style.display = 'block';
            
            this.showLoading(false);
            
        } catch (error) {
            console.error('❌ Error analyzing entries:', error);
            this.showLoading(false);
            Swal.fire({
                icon: 'error',
                title: 'خطأ',
                text: 'حدث خطأ أثناء التحليل: ' + error.message
            });
        }
    },
    
    /**
     * Display results in table
     */
    displayResults() {
        const tbody = document.getElementById('resultsTableBody');
        tbody.innerHTML = '';
        
        if (this.filteredItems.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center">لا توجد نتائج</td></tr>';
            document.getElementById('resultsTable').style.display = 'none';
            return;
        }
        
        for (const item of this.filteredItems) {
            const row = document.createElement('tr');
            
            // Checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'form-check-input item-checkbox';
            checkbox.value = `${item.type}_${item.id}`;
            checkbox.onchange = () => this.toggleItemSelection(checkbox.value);
            
            const tdCheckbox = document.createElement('td');
            tdCheckbox.appendChild(checkbox);
            row.appendChild(tdCheckbox);
            
            // Type
            const tdType = document.createElement('td');
            tdType.textContent = item.typeLabel || item.type;
            row.appendChild(tdType);
            
            // Invoice/Voucher number
            const tdNumber = document.createElement('td');
            tdNumber.textContent = item.invoiceNo || item.voucherNumber || item.id;
            row.appendChild(tdNumber);
            
            // Date
            const tdDate = document.createElement('td');
            if (item.date) {
                const date = item.date.toDate ? item.date.toDate() : new Date(item.date);
                tdDate.textContent = date.toLocaleDateString('ar-EG');
            } else {
                tdDate.textContent = '-';
            }
            row.appendChild(tdDate);
            
            // Amount
            const tdAmount = document.createElement('td');
            tdAmount.textContent = (item.total || item.amount || 0).toFixed(2);
            row.appendChild(tdAmount);
            
            // Entry status
            const tdStatus = document.createElement('td');
            const status = item.entryStatus?.status || 'no_entry';
            const badge = document.createElement('span');
            badge.className = 'badge-status';
            
            if (status === 'has_entry') {
                badge.className += ' status-has-entry';
                badge.textContent = 'مع قيد';
            } else if (status === 'no_entry') {
                badge.className += ' status-no-entry';
                badge.textContent = 'بدون قيد';
            } else if (status === 'multiple') {
                badge.className += ' status-multiple';
                badge.textContent = 'قيد متعدد';
            } else {
                badge.textContent = 'خطأ';
            }
            
            tdStatus.appendChild(badge);
            row.appendChild(tdStatus);
            
            // Entry count
            const tdCount = document.createElement('td');
            tdCount.textContent = item.entryStatus?.count || 0;
            row.appendChild(tdCount);
            
            // Actions
            const tdActions = document.createElement('td');
            const btnRepost = document.createElement('button');
            btnRepost.className = 'btn btn-sm btn-success';
            btnRepost.textContent = 'إعادة ترحيل';
            btnRepost.onclick = () => this.repostSingleItem(item);
            tdActions.appendChild(btnRepost);
            
            if (item.entryStatus?.count > 0) {
                const btnView = document.createElement('button');
                btnView.className = 'btn btn-sm btn-info ms-2';
                btnView.textContent = 'عرض';
                btnView.onclick = () => this.viewEntry(item);
                tdActions.appendChild(btnView);
            }
            
            row.appendChild(tdActions);
            
            tbody.appendChild(row);
        }
        
        document.getElementById('resultsTable').style.display = 'block';
    },
    
    /**
     * Update statistics
     */
    updateStats() {
        const total = this.filteredItems.length;
        const noEntry = this.filteredItems.filter(i => i.entryStatus?.status === 'no_entry').length;
        const hasEntry = this.filteredItems.filter(i => i.entryStatus?.status === 'has_entry').length;
        const multiple = this.filteredItems.filter(i => i.entryStatus?.status === 'multiple').length;
        
        document.getElementById('totalCount').textContent = total;
        document.getElementById('noEntryCount').textContent = noEntry;
        document.getElementById('hasEntryCount').textContent = hasEntry;
        document.getElementById('multipleEntryCount').textContent = multiple;
        
        document.getElementById('statsContainer').style.display = 'flex';
    },
    
    /**
     * Apply filters
     */
    applyFilters() {
        const typeFilter = document.getElementById('filterType').value;
        const statusFilter = document.getElementById('filterStatus').value;
        const dateFrom = document.getElementById('filterDateFrom').value;
        const dateTo = document.getElementById('filterDateTo').value;
        
        this.filteredItems = this.allItems.filter(item => {
            // Type filter
            if (typeFilter !== 'all' && item.type !== typeFilter) {
                return false;
            }
            
            // Status filter
            if (statusFilter !== 'all') {
                const status = item.entryStatus?.status || 'no_entry';
                if (statusFilter === 'no_entry' && status !== 'no_entry') return false;
                if (statusFilter === 'has_entry' && status !== 'has_entry') return false;
                if (statusFilter === 'multiple' && status !== 'multiple') return false;
            }
            
            // Date filter
            if (dateFrom || dateTo) {
                const itemDate = item.date?.toDate ? item.date.toDate() : new Date(item.date);
                if (dateFrom && itemDate < new Date(dateFrom)) return false;
                if (dateTo && itemDate > new Date(dateTo)) return false;
            }
            
            return true;
        });
        
        this.displayResults();
        this.updateStats();
    },
    
    /**
     * Toggle select all
     */
    toggleSelectAll() {
        const selectAll = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('.item-checkbox');
        
        checkboxes.forEach(cb => {
            cb.checked = selectAll.checked;
            if (selectAll.checked) {
                this.selectedItems.add(cb.value);
            } else {
                this.selectedItems.delete(cb.value);
            }
        });
    },
    
    /**
     * Toggle item selection
     */
    toggleItemSelection(value) {
        const checkbox = document.querySelector(`.item-checkbox[value="${value}"]`);
        if (checkbox.checked) {
            this.selectedItems.add(value);
        } else {
            this.selectedItems.delete(value);
        }
    },
    
    /**
     * Repost selected items
     */
    async repostSelected() {
        if (this.selectedItems.size === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'تحذير',
                text: 'يرجى تحديد عناصر لإعادة ترحيلها'
            });
            return;
        }
        
        const result = await Swal.fire({
            title: 'تأكيد',
            text: `هل تريد إعادة ترحيل ${this.selectedItems.size} عنصر؟`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'نعم',
            cancelButtonText: 'لا'
        });
        
        if (!result.isConfirmed) return;
        
        this.showLoading(true);
        
        let success = 0;
        let failed = 0;
        
        for (const itemKey of this.selectedItems) {
            const [type, id] = itemKey.split('_');
            const item = this.allItems.find(i => i.type === type && i.id === id);
            
            if (item) {
                try {
                    await this.repostSingleItem(item, false);
                    success++;
                } catch (error) {
                    console.error(`❌ Error reposting ${itemKey}:`, error);
                    failed++;
                }
            }
        }
        
        this.showLoading(false);
        
        Swal.fire({
            icon: success > 0 ? 'success' : 'error',
            title: 'اكتمل',
            text: `نجح: ${success}, فشل: ${failed}`
        });
        
        // Refresh scan
        await this.scanMissingEntries();
    },
    
    /**
     * Repost all missing entries
     */
    async repostAllMissing() {
        const missing = this.allItems.filter(i => i.entryStatus?.status === 'no_entry');
        
        if (missing.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'معلومات',
                text: 'لا توجد عناصر بدون قيود'
            });
            return;
        }
        
        const result = await Swal.fire({
            title: 'تأكيد',
            text: `هل تريد إعادة ترحيل ${missing.length} عنصر بدون قيد؟`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'نعم',
            cancelButtonText: 'لا'
        });
        
        if (!result.isConfirmed) return;
        
        this.showLoading(true);
        
        let success = 0;
        let failed = 0;
        
        for (const item of missing) {
            try {
                await this.repostSingleItem(item, false);
                success++;
            } catch (error) {
                console.error(`❌ Error reposting ${item.id}:`, error);
                failed++;
            }
        }
        
        this.showLoading(false);
        
        Swal.fire({
            icon: success > 0 ? 'success' : 'error',
            title: 'اكتمل',
            text: `نجح: ${success}, فشل: ${failed}`
        });
        
        // Refresh scan
        await this.scanMissingEntries();
    },
    
    /**
     * Repost single item
     */
    async repostSingleItem(item, showAlert = true) {
        try {
            console.log(`🔄 Reposting ${item.type} ${item.id}...`);
            
            // Delete existing entries first
            if (item.entryStatus?.entries && item.entryStatus.entries.length > 0) {
                for (const entry of item.entryStatus.entries) {
                    await db.collection('generalEntries').doc(entry.id).delete();
                    console.log(`✅ Deleted entry: ${entry.id}`);
                }
            }
            
            // Generate new entry based on type
            let entryData = null;
            
            // Create temporary DOM elements if needed
            const tempCheckbox = document.createElement('input');
            tempCheckbox.type = 'checkbox';
            tempCheckbox.checked = true;
            tempCheckbox.id = 'tempGenerateEntry';
            
            const tempDescription = document.createElement('input');
            tempDescription.type = 'text';
            tempDescription.id = 'tempGeneralEntryDescription';
            tempDescription.value = '';
            
            // Add to body temporarily
            document.body.appendChild(tempCheckbox);
            document.body.appendChild(tempDescription);
            
            try {
                switch (item.type) {
                    case 'purchase':
                        if (typeof PurchasesModule !== 'undefined') {
                            // Ensure checkbox exists
                            const purchaseCheckbox = document.getElementById('generateGeneralEntry') || tempCheckbox;
                            if (!purchaseCheckbox.checked) {
                                purchaseCheckbox.checked = true;
                            }
                            entryData = await PurchasesModule.generateGeneralEntry(item);
                        }
                        break;
                    case 'sale':
                        if (typeof SalesModule !== 'undefined') {
                            const saleCheckbox = document.getElementById('generateGeneralEntry') || tempCheckbox;
                            if (!saleCheckbox.checked) {
                                saleCheckbox.checked = true;
                            }
                            entryData = await SalesModule.generateGeneralEntry(item);
                        }
                        break;
                    case 'purchase_return':
                        if (typeof PurchaseReturnsModule !== 'undefined') {
                            const returnCheckbox = document.getElementById('generateReturnGeneralEntry') || tempCheckbox;
                            if (!returnCheckbox.checked) {
                                returnCheckbox.checked = true;
                            }
                            entryData = await PurchaseReturnsModule.generateGeneralEntry(item);
                        }
                        break;
                    case 'sale_return':
                        if (typeof SalesReturnsModule !== 'undefined') {
                            const saleReturnCheckbox = document.getElementById('generateReturnGeneralEntry') || tempCheckbox;
                            if (!saleReturnCheckbox.checked) {
                                saleReturnCheckbox.checked = true;
                            }
                            entryData = await SalesReturnsModule.generateGeneralEntry(item);
                        }
                        break;
                    case 'voucher':
                        if (typeof VouchersModule !== 'undefined') {
                            entryData = await VouchersModule.createGeneralEntry(item.id, item);
                        }
                        break;
                }
            } finally {
                // Clean up temporary elements
                if (tempCheckbox.parentNode) {
                    tempCheckbox.parentNode.removeChild(tempCheckbox);
                }
                if (tempDescription.parentNode) {
                    tempDescription.parentNode.removeChild(tempDescription);
                }
            }
            
            if (entryData) {
                // Ensure entryData has required fields
                if (!entryData.sourceId) {
                    entryData.sourceId = String(item.id);
                }
                if (!entryData.type) {
                    entryData.type = item.type;
                }
                if (!entryData.date) {
                    entryData.date = item.date || new Date();
                }
                
                // Save to Firestore
                const docRef = await db.collection('generalEntries').add(entryData);
                console.log(`✅ Created new entry: ${docRef.id}`);
                
                if (showAlert) {
                    Swal.fire({
                        icon: 'success',
                        title: 'نجح',
                        text: 'تم إعادة ترحيل القيد بنجاح'
                    });
                }
                
                return docRef.id;
            } else {
                throw new Error('Failed to generate entry data - module returned null');
            }
            
        } catch (error) {
            console.error(`❌ Error reposting ${item.type} ${item.id}:`, error);
            if (showAlert) {
                Swal.fire({
                    icon: 'error',
                    title: 'خطأ',
                    text: 'حدث خطأ أثناء إعادة الترحيل: ' + error.message
                });
            }
            throw error;
        }
    },
    
    /**
     * Delete and repost entries
     */
    async deleteAndRepost() {
        if (this.selectedItems.size === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'تحذير',
                text: 'يرجى تحديد عناصر'
            });
            return;
        }
        
        const result = await Swal.fire({
            title: 'تحذير',
            text: 'سيتم حذف القيود الحالية وإعادة إنشائها. هل أنت متأكد؟',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'نعم، احذف وأعد الإنشاء',
            cancelButtonText: 'إلغاء',
            confirmButtonColor: '#dc3545'
        });
        
        if (!result.isConfirmed) return;
        
        this.showLoading(true);
        
        let success = 0;
        let failed = 0;
        
        for (const itemKey of this.selectedItems) {
            const [type, id] = itemKey.split('_');
            const item = this.allItems.find(i => i.type === type && i.id === id);
            
            if (item) {
                try {
                    await this.repostSingleItem(item, false);
                    success++;
                } catch (error) {
                    console.error(`❌ Error:`, error);
                    failed++;
                }
            }
        }
        
        this.showLoading(false);
        
        Swal.fire({
            icon: success > 0 ? 'success' : 'error',
            title: 'اكتمل',
            text: `نجح: ${success}, فشل: ${failed}`
        });
        
        // Refresh scan
        await this.scanMissingEntries();
    },
    
    /**
     * View entry details
     */
    async viewEntry(item) {
        if (!item.entryStatus?.entries || item.entryStatus.entries.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'معلومات',
                text: 'لا يوجد قيد مرتبط'
            });
            return;
        }
        
        const entry = item.entryStatus.entries[0];
        
        let html = `
            <h5>تفاصيل القيد</h5>
            <p><strong>الوصف:</strong> ${entry.description || '-'}</p>
            <p><strong>المرجع:</strong> ${entry.reference || '-'}</p>
            <p><strong>عدد القيود الفرعية:</strong> ${entry.entries?.length || 0}</p>
        `;
        
        if (entry.entries && entry.entries.length > 0) {
            html += '<table class="table table-sm mt-3"><thead><tr><th>الحساب</th><th>مدين</th><th>دائن</th></tr></thead><tbody>';
            for (const e of entry.entries) {
                html += `<tr>
                    <td>${e.accountName || e.accountId}</td>
                    <td>${(e.debit || 0).toFixed(2)}</td>
                    <td>${(e.credit || 0).toFixed(2)}</td>
                </tr>`;
            }
            html += '</tbody></table>';
        }
        
        Swal.fire({
            title: 'تفاصيل القيد',
            html: html,
            width: '800px',
            confirmButtonText: 'إغلاق'
        });
    },
    
    /**
     * Show/hide loading indicator
     */
    showLoading(show) {
        document.getElementById('loadingIndicator').style.display = show ? 'block' : 'none';
    },
    
    /**
     * Clear results
     */
    clearResults() {
        document.getElementById('resultsContainer').style.display = 'none';
        document.getElementById('resultsTable').style.display = 'none';
        document.getElementById('statsContainer').style.display = 'none';
        this.selectedItems.clear();
    }
};

// Export module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RepostAuditModule;
}

