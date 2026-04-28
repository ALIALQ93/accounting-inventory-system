/**
 * Notifications Module
 * نظام إدارة الإشعارات الديناميكي
 */

const NotificationManager = {
    notifications: [],
    unreadCount: 0,
    
    /**
     * Initialize notifications system
     */
    async initialize() {
        console.log('🔔 Initializing notifications system...');
        
        // Load notifications from Firebase
        await this.loadNotifications();
        
        // Setup real-time listener
        this.setupRealtimeListener();
        
        // Update every 60 seconds
        setInterval(() => {
            this.loadNotifications();
        }, 60000);
        
        console.log('✅ Notifications system initialized');
    },
    
    /**
     * Load notifications from Firebase
     */
    async loadNotifications() {
        try {
            if (!db) {
                console.warn('Database not initialized');
                return;
            }
            
            // Get unread notifications (you can customize this query)
            const notificationsSnapshot = await db.collection('notifications')
                .where('read', '==', false)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .get();
            
            this.notifications = [];
            notificationsSnapshot.forEach(doc => {
                this.notifications.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Also check for system notifications (low stock, expired products, etc.)
            await this.checkSystemNotifications();
            
            this.unreadCount = this.notifications.length;
            this.updateBadge();
            this.renderNotifications();
            
            console.log(`🔔 Loaded ${this.notifications.length} notifications`);
        } catch (error) {
            console.error('Error loading notifications:', error);
            // If notifications collection doesn't exist, use system notifications only
            await this.checkSystemNotifications();
        }
    },
    
    /**
     * Check for system notifications (low stock, expired products, etc.)
     */
    async checkSystemNotifications() {
        try {
            // Check for low stock products
            const productsSnapshot = await db.collection('products').get();
            let lowStockCount = 0;
            
            productsSnapshot.forEach(doc => {
                const product = doc.data();
                const stock = parseFloat(product.stock) || 0;
                const minStock = parseFloat(product.minStock) || 0;
                
                if (minStock > 0 && stock <= minStock) {
                    lowStockCount++;
                }
            });
            
            if (lowStockCount > 0) {
                const existingNotification = this.notifications.find(n => n.type === 'low_stock');
                if (!existingNotification) {
                    this.notifications.unshift({
                        id: 'system-low-stock',
                        type: 'low_stock',
                        title: 'مخزون منخفض',
                        message: `مخزون منخفض لـ ${lowStockCount} منتج${lowStockCount > 1 ? 'ات' : ''}`,
                        icon: 'fas fa-box',
                        iconColor: 'text-warning',
                        read: false,
                        createdAt: new Date(),
                        priority: 'high'
                    });
                } else {
                    existingNotification.message = `مخزون منخفض لـ ${lowStockCount} منتج${lowStockCount > 1 ? 'ات' : ''}`;
                }
            }
            
            // Check for expired products (if you have expiry date field)
            // You can add similar checks for other notifications
            
        } catch (error) {
            console.error('Error checking system notifications:', error);
        }
    },
    
    /**
     * Setup real-time listener for notifications
     */
    setupRealtimeListener() {
        try {
            if (!db) return;
            
            db.collection('notifications')
                .where('read', '==', false)
                .orderBy('createdAt', 'desc')
                .limit(10)
                .onSnapshot((snapshot) => {
                    this.notifications = [];
                    snapshot.forEach(doc => {
                        this.notifications.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });
                    
                    this.unreadCount = this.notifications.length;
                    this.updateBadge();
                    this.renderNotifications();
                });
        } catch (error) {
            console.error('Error setting up real-time listener:', error);
        }
    },
    
    /**
     * Update notification badge
     */
    updateBadge() {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
                badge.style.display = 'block';
            } else {
                badge.style.display = 'none';
            }
        }
    },
    
    /**
     * Render notifications in dropdown
     */
    renderNotifications() {
        const dropdown = document.getElementById('notificationDropdown');
        if (!dropdown) return;
        
        // Clear existing items (except header)
        const existingItems = dropdown.querySelectorAll('li:not(:first-child)');
        existingItems.forEach(item => item.remove());
        
        if (this.notifications.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.innerHTML = '<a class="dropdown-item text-center text-muted" href="#"><i class="fas fa-check-circle"></i> لا توجد إشعارات جديدة</a>';
            dropdown.appendChild(emptyItem);
            return;
        }
        
        // Render notifications
        this.notifications.forEach(notification => {
            const item = document.createElement('li');
            const iconClass = notification.icon || 'fas fa-bell';
            const iconColor = notification.iconColor || 'text-info';
            
            item.innerHTML = `
                <a class="dropdown-item notification-item" href="#" data-notification-id="${notification.id}">
                    <i class="${iconClass} ${iconColor}"></i>
                    <div class="notification-content">
                        <div class="notification-title">${notification.title || 'إشعار'}</div>
                        <div class="notification-message">${notification.message || ''}</div>
                        <div class="notification-time">${this.formatTime(notification.createdAt)}</div>
                    </div>
                </a>
            `;
            
            // Add click handler
            item.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                this.markAsRead(notification.id);
            });
            
            dropdown.appendChild(item);
        });
    },
    
    /**
     * Mark notification as read
     */
    async markAsRead(notificationId) {
        try {
            if (notificationId.startsWith('system-')) {
                // System notifications - just remove from list
                this.notifications = this.notifications.filter(n => n.id !== notificationId);
            } else {
                // Firebase notifications - update in database
                await db.collection('notifications').doc(notificationId).update({
                    read: true,
                    readAt: new Date()
                });
            }
            
            this.unreadCount = this.notifications.length;
            this.updateBadge();
            this.renderNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    },
    
    /**
     * Format time for display
     */
    formatTime(timestamp) {
        if (!timestamp) return '';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        if (hours < 24) return `منذ ${hours} ساعة`;
        if (days < 7) return `منذ ${days} يوم`;
        
        return date.toLocaleDateString('ar-IQ');
    },
    
    /**
     * Create a new notification
     */
    async createNotification(title, message, type = 'info', icon = 'fas fa-bell', iconColor = 'text-info') {
        try {
            if (!db) return;
            
            await db.collection('notifications').add({
                title,
                message,
                type,
                icon,
                iconColor,
                read: false,
                createdAt: new Date(),
                priority: 'normal'
            });
        } catch (error) {
            console.error('Error creating notification:', error);
        }
    }
};

// Initialize when DOM is ready and user is authenticated
document.addEventListener('DOMContentLoaded', () => {
    if (typeof auth !== 'undefined') {
        auth.onAuthStateChanged(user => {
            if (user) {
                setTimeout(() => {
                    NotificationManager.initialize();
                }, 2000);
            }
        });
    }
});
