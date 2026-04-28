/**
 * Navbar Statistics Module
 * Updates navbar stats from Firebase
 */

const NavbarStats = {
    /**
     * Initialize navbar stats
     */
    async initialize() {
        console.log('📊 Initializing navbar statistics...');
        
        // Update stats on load
        await this.updateAllStats();
        
        // Update stats every 30 seconds
        setInterval(() => {
            this.updateAllStats();
        }, 30000);
        
        console.log('✅ Navbar statistics initialized');
    },
    
    /**
     * Update all statistics
     */
    async updateAllStats() {
        try {
            await Promise.all([
                this.updateProductsCount(),
                this.updateSalesToday(),
                this.updateCashBalance()
            ]);
        } catch (error) {
            console.error('❌ Error updating navbar stats:', error);
        }
    },
    
    /**
     * Update products count
     */
    async updateProductsCount() {
        try {
            const productsSnapshot = await db.collection('products').get();
            const count = productsSnapshot.size;
            
            // استخدام الـ ID الصحيح من HTML
            const navProductsCount = document.getElementById('productsCount');
            const sidebarProductsCount = document.getElementById('sidebarProductsCount');
            
            if (navProductsCount) {
                navProductsCount.textContent = count;
                this.animateNumber(navProductsCount);
            }
            
            if (sidebarProductsCount) {
                sidebarProductsCount.textContent = count;
            }
            
            console.log(`📦 Products count updated: ${count}`);
        } catch (error) {
            console.error('Error updating products count:', error);
        }
    },
    
    /**
     * Update today's sales
     */
    async updateSalesToday() {
        try {
            // Get today's date range
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const salesSnapshot = await db.collection('sales')
                .where('createdAt', '>=', today)
                .where('createdAt', '<', tomorrow)
                .get();
            
            const count = salesSnapshot.size;
            
            // استخدام الـ ID الصحيح من HTML
            const navSalesToday = document.getElementById('salesCount');
            const sidebarSalesCount = document.getElementById('sidebarSalesCount');
            
            if (navSalesToday) {
                navSalesToday.textContent = count;
                this.animateNumber(navSalesToday);
            }
            
            if (sidebarSalesCount) {
                sidebarSalesCount.textContent = count;
            }
            
            console.log(`🛒 Today's sales updated: ${count}`);
        } catch (error) {
            console.error('Error updating sales today:', error);
            // If error (maybe no createdAt field), just show 0
            const navSalesToday = document.getElementById('salesCount');
            if (navSalesToday) navSalesToday.textContent = '0';
        }
    },
    
    /**
     * Update cash balance
     * Gets balance from vouchers or general entries
     */
    async updateCashBalance() {
        try {
            // استخدام الـ ID الصحيح من HTML
            const navCashBalance = document.getElementById('cashBalance');
            
            if (!navCashBalance) {
                return; // Element doesn't exist, skip
            }
            
            // Initialize balance
            let balance = 0;
            
            try {
                // Try to get cash accounts from chartOfAccounts
                const accountsSnapshot = await db.collection('chartOfAccounts')
                    .where('type', 'in', ['cash', 'bank'])
                    .limit(10)
                    .get();
                
                if (!accountsSnapshot.empty) {
                    // Get account IDs
                    const accountIds = accountsSnapshot.docs.map(doc => doc.id);
                    
                    // Get balance from general entries for cash accounts
                    const entriesSnapshot = await db.collection('generalEntries')
                        .where('status', '==', 'posted')
                        .limit(100) // Limit to avoid performance issues
                        .get();
                    
                    // Calculate balance from entries
                    entriesSnapshot.forEach(doc => {
                        const entry = doc.data();
                        if (entry.entries && Array.isArray(entry.entries)) {
                            entry.entries.forEach(e => {
                                if (e.accountId && accountIds.includes(e.accountId)) {
                                    // Debit increases cash, credit decreases
                                    const debit = parseFloat(e.debit) || 0;
                                    const credit = parseFloat(e.credit) || 0;
                                    balance += (debit - credit);
                                }
                            });
                        }
                    });
                }
            } catch (err) {
                console.warn('Could not calculate cash balance:', err);
                balance = 0;
            }
            
            // Update display
            navCashBalance.textContent = new Intl.NumberFormat('ar-IQ').format(Math.max(0, balance)) + ' د.ع';
            this.animateNumber(navCashBalance);
            
            console.log(`💰 Cash balance updated: ${balance}`);
        } catch (error) {
            console.error('Error updating cash balance:', error);
            // If error, show 0
            const navCashBalance = document.getElementById('cashBalance');
            if (navCashBalance) navCashBalance.textContent = '0 د.ع';
        }
    },
    
    /**
     * Update parties count
     */
    async updatePartiesCount() {
        try {
            const partiesSnapshot = await db.collection('parties').get();
            const count = partiesSnapshot.size;
            
            const sidebarPartiesCount = document.getElementById('sidebarPartiesCount');
            if (sidebarPartiesCount) {
                sidebarPartiesCount.textContent = count;
            }
            
            console.log(`👥 Parties count updated: ${count}`);
        } catch (error) {
            console.error('Error updating parties count:', error);
        }
    },
    
    /**
     * Update purchases count
     */
    async updatePurchasesCount() {
        try {
            const purchasesSnapshot = await db.collection('purchases').get();
            const count = purchasesSnapshot.size;
            
            const sidebarPurchasesCount = document.getElementById('sidebarPurchasesCount');
            if (sidebarPurchasesCount) {
                sidebarPurchasesCount.textContent = count;
            }
            
            console.log(`🛍️ Purchases count updated: ${count}`);
        } catch (error) {
            console.error('Error updating purchases count:', error);
        }
    },
    
    /**
     * Animate number change
     */
    animateNumber(element) {
        if (!element) return;
        
        element.style.transform = 'scale(1.2)';
        element.style.color = '#ffd700';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = '';
        }, 300);
    }
};

// Initialize when DOM is ready and user is authenticated
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase auth
    auth.onAuthStateChanged(user => {
        if (user) {
            NavbarStats.initialize();
            
            // Also update sidebar counts
            setTimeout(() => {
                NavbarStats.updatePartiesCount();
                NavbarStats.updatePurchasesCount();
            }, 1000);
        }
    });
});

