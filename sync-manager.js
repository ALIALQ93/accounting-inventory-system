/**
 * Data Synchronization Manager
 * نظام إدارة المزامنة من قاعدة البيانات
 * 
 * Supports:
 * - Real-time listeners (recommended - uses Firestore onSnapshot)
 * - Polling sync (fallback - uses setInterval)
 */

const SyncManager = {
    // Active listeners
    listeners: new Map(),
    
    // Polling intervals
    pollingIntervals: new Map(),
    
    // Authentication state
    isAuthenticated: false,
    
    // Configuration
    config: {
        // Default to real-time listeners
        useRealtime: true,
        
        // Polling interval in milliseconds (if real-time is disabled)
        pollingInterval: 3000, // 3 seconds
        
        // Collections to sync
        collections: [
            'purchases',
            'purchaseReturns',
            'sales',
            'saleReturns',
            'products',
            'parties',
            'warehouses',
            'accounts',
            'currencies',
            'categories',
            'units',
            'costCenters',
            'salesReps',
            'generalEntries',
            'vouchers',
            'inventoryMovements'
        ],
        
        // Callbacks for each collection
        callbacks: {}
    },
    
    /**
     * Check if user is authenticated
     */
    checkAuth() {
        try {
            if (typeof auth !== 'undefined' && auth && auth.currentUser) {
                return true;
            }
        } catch (error) {
            // Auth not available yet
            return false;
        }
        return false;
    },
    
    /**
     * Initialize sync manager
     */
    init(options = {}) {
        // Merge options with default config
        this.config = { ...this.config, ...options };
        
        console.log('🔄 Sync Manager initialized', {
            useRealtime: this.config.useRealtime,
            pollingInterval: this.config.pollingInterval,
            collections: this.config.collections.length
        });
        
        // Check authentication state
        this.isAuthenticated = this.checkAuth();
        
        // Listen to authentication state changes
        if (typeof auth !== 'undefined' && auth) {
            try {
                auth.onAuthStateChanged((user) => {
                    const wasAuthenticated = this.isAuthenticated;
                    this.isAuthenticated = !!user;
                    
                    if (this.isAuthenticated && !wasAuthenticated) {
                        // User just logged in - start syncing
                        console.log('✅ User authenticated, starting synchronization...');
                        if (this.config.useRealtime) {
                            this.startRealtimeSync();
                        } else {
                            this.startPollingSync();
                        }
                    } else if (!this.isAuthenticated && wasAuthenticated) {
                        // User just logged out - stop syncing
                        console.log('⚠️ User logged out, stopping synchronization...');
                        this.stop();
                    } else if (!this.isAuthenticated) {
                        // User not authenticated - don't start syncing
                        console.log('ℹ️ User not authenticated, skipping synchronization');
                        return;
                    }
                });
            } catch (error) {
                console.warn('⚠️ Could not set up auth state listener:', error);
            }
        }
        
        // Only start syncing if user is already authenticated
        if (this.isAuthenticated) {
            if (this.config.useRealtime) {
                this.startRealtimeSync();
            } else {
                this.startPollingSync();
            }
        } else {
            console.log('ℹ️ Waiting for user authentication before starting synchronization...');
        }
    },
    
    /**
     * Start real-time synchronization using Firestore listeners
     */
    startRealtimeSync() {
        // Check authentication before starting
        if (!this.checkAuth()) {
            console.warn('⚠️ Cannot start real-time sync: user not authenticated');
            return;
        }
        
        // Stop any existing sync first
        this.stop();
        
        console.log('📡 Starting real-time synchronization...');
        
        this.config.collections.forEach(collectionName => {
            try {
                // Create listener for collection
                const unsubscribe = db.collection(collectionName)
                    .onSnapshot(
                        (snapshot) => {
                            // Double-check authentication state
                            if (!this.checkAuth()) {
                                console.warn(`⚠️ Stopping sync for ${collectionName}: user not authenticated`);
                                this.stop();
                                return;
                            }
                            
                            const data = snapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            }));
                            
                            // Trigger callback(s) if exists
                            const callback = this.config.callbacks[collectionName];
                            if (callback) {
                                if (Array.isArray(callback)) {
                                    callback.forEach(cb => cb(data, 'realtime'));
                                } else {
                                    callback(data, 'realtime');
                                }
                            }
                            
                            // Dispatch custom event
                            window.dispatchEvent(new CustomEvent('dataSync', {
                                detail: {
                                    collection: collectionName,
                                    data: data,
                                    type: 'realtime',
                                    timestamp: new Date()
                                }
                            }));
                            
                            console.log(`✅ ${collectionName} synced (real-time): ${data.length} documents`);
                        },
                        (error) => {
                            // Only log permission errors if user is authenticated
                            // This prevents spam when user is not logged in
                            if (this.checkAuth()) {
                                console.error(`❌ Error in real-time sync for ${collectionName}:`, error);
                                
                                // Fallback to polling on error
                                if (error.code === 'permission-denied' || error.code === 'unavailable') {
                                    console.warn(`⚠️ Falling back to polling for ${collectionName}`);
                                    this.startPollingForCollection(collectionName);
                                }
                            }
                            // Silently ignore errors when user is not authenticated
                        }
                    );
                
                // Store listener
                this.listeners.set(collectionName, unsubscribe);
                
            } catch (error) {
                if (this.checkAuth()) {
                    console.error(`❌ Failed to start real-time sync for ${collectionName}:`, error);
                    // Fallback to polling
                    this.startPollingForCollection(collectionName);
                }
            }
        });
        
        console.log('✅ Real-time synchronization started');
    },
    
    /**
     * Start polling synchronization
     */
    startPollingSync() {
        // Check authentication before starting
        if (!this.checkAuth()) {
            console.warn('⚠️ Cannot start polling sync: user not authenticated');
            return;
        }
        
        // Stop any existing sync first
        this.stop();
        
        console.log(`⏱️ Starting polling synchronization (every ${this.config.pollingInterval}ms)...`);
        
        this.config.collections.forEach(collectionName => {
            this.startPollingForCollection(collectionName);
        });
        
        console.log('✅ Polling synchronization started');
    },
    
    /**
     * Start polling for a specific collection
     */
    startPollingForCollection(collectionName) {
        // Check authentication before starting
        if (!this.checkAuth()) {
            return;
        }
        
        // Clear existing interval if any
        if (this.pollingIntervals.has(collectionName)) {
            clearInterval(this.pollingIntervals.get(collectionName));
        }
        
        // Create polling function
        const poll = async () => {
            // Check authentication before each poll
            if (!this.checkAuth()) {
                console.warn(`⚠️ Stopping poll for ${collectionName}: user not authenticated`);
                this.stop();
                return;
            }
            
            try {
                const snapshot = await db.collection(collectionName).get();
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                // Trigger callback(s) if exists
                const callback = this.config.callbacks[collectionName];
                if (callback) {
                    if (Array.isArray(callback)) {
                        callback.forEach(cb => cb(data, 'polling'));
                    } else {
                        callback(data, 'polling');
                    }
                }
                
                // Dispatch custom event
                window.dispatchEvent(new CustomEvent('dataSync', {
                    detail: {
                        collection: collectionName,
                        data: data,
                        type: 'polling',
                        timestamp: new Date()
                    }
                }));
                
                console.log(`✅ ${collectionName} synced (polling): ${data.length} documents`);
                
            } catch (error) {
                // Only log errors if user is authenticated
                // This prevents spam when user is not logged in
                if (this.checkAuth()) {
                    // Check if it's a permission error
                    if (error.code === 'permission-denied') {
                        console.warn(`⚠️ Permission denied for ${collectionName}, stopping poll`);
                        this.stop();
                    } else {
                        console.error(`❌ Error polling ${collectionName}:`, error);
                    }
                }
                // Silently ignore errors when user is not authenticated
            }
        };
        
        // Initial load
        poll();
        
        // Set interval
        const intervalId = setInterval(poll, this.config.pollingInterval);
        this.pollingIntervals.set(collectionName, intervalId);
    },
    
    /**
     * Register callback for a collection
     */
    onCollectionSync(collectionName, callback) {
        if (!this.config.callbacks[collectionName]) {
            this.config.callbacks[collectionName] = callback;
        } else if (Array.isArray(this.config.callbacks[collectionName])) {
            this.config.callbacks[collectionName].push(callback);
        } else {
            // Convert to array if single callback exists
            this.config.callbacks[collectionName] = [
                this.config.callbacks[collectionName],
                callback
            ];
        }
    },
    
    /**
     * Stop synchronization
     */
    stop() {
        // Stop all real-time listeners
        this.listeners.forEach((unsubscribe, collectionName) => {
            unsubscribe();
            console.log(`🛑 Stopped real-time sync for ${collectionName}`);
        });
        this.listeners.clear();
        
        // Stop all polling intervals
        this.pollingIntervals.forEach((intervalId, collectionName) => {
            clearInterval(intervalId);
            console.log(`🛑 Stopped polling sync for ${collectionName}`);
        });
        this.pollingIntervals.clear();
        
        console.log('🛑 All synchronization stopped');
    },
    
    /**
     * Switch between real-time and polling
     */
    switchMode(useRealtime) {
        this.stop();
        this.config.useRealtime = useRealtime;
        
        if (useRealtime) {
            this.startRealtimeSync();
        } else {
            this.startPollingSync();
        }
        
        console.log(`🔄 Switched to ${useRealtime ? 'real-time' : 'polling'} mode`);
    },
    
    /**
     * Update polling interval
     */
    setPollingInterval(intervalMs) {
        this.config.pollingInterval = intervalMs;
        
        // Restart polling if active
        if (!this.config.useRealtime) {
            this.stop();
            this.startPollingSync();
        }
        
        console.log(`⏱️ Polling interval updated to ${intervalMs}ms`);
    },
    
    /**
     * Get sync status
     */
    getStatus() {
        return {
            mode: this.config.useRealtime ? 'realtime' : 'polling',
            pollingInterval: this.config.pollingInterval,
            activeListeners: this.listeners.size,
            activePolling: this.pollingIntervals.size,
            collections: this.config.collections
        };
    }
};

// Initialize on load (after Firebase is ready)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Wait for Firebase to be ready
        if (typeof db !== 'undefined') {
            SyncManager.init();
        } else {
            // Wait a bit for Firebase to initialize
            setTimeout(() => {
                if (typeof db !== 'undefined') {
                    SyncManager.init();
                }
            }, 1000);
        }
    });
} else {
    // Already loaded
    if (typeof db !== 'undefined') {
        SyncManager.init();
    } else {
        setTimeout(() => {
            if (typeof db !== 'undefined') {
                SyncManager.init();
            }
        }, 1000);
    }
}

