/**
 * Sidebar Toggle Functionality
 * Allows users to collapse/expand the sidebar
 */

const SidebarToggle = {
    sidebar: null,
    toggleBtn: null,
    isCollapsed: false,
    
    /**
     * Initialize sidebar toggle
     */
    initialize() {
        console.log('🎛️ Initializing sidebar toggle...');
        
        this.sidebar = document.getElementById('sidebar');
        this.toggleBtn = document.getElementById('toggleSidebar');
        
        if (!this.sidebar) {
            console.error('❌ Sidebar element not found (#sidebar)');
            return;
        }
        
        if (!this.toggleBtn) {
            console.error('❌ Toggle button not found (#toggleSidebar)');
            return;
        }
        
        console.log('✅ Sidebar and toggle button found');
        
        // Setup event listener
        this.toggleBtn.addEventListener('click', () => {
            this.toggle();
        });
        
        // Load saved state from localStorage
        this.loadState();
        
        // Add keyboard shortcut (Ctrl + B)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                this.toggle();
            }
        });
        
        console.log('✅ Sidebar toggle initialized');
    },
    
    /**
     * Toggle sidebar
     */
    toggle() {
        this.isCollapsed = !this.isCollapsed;
        
        if (this.isCollapsed) {
            this.collapse();
        } else {
            this.expand();
        }
        
        // Save state
        this.saveState();
        
        // Animate toggle button
        this.animateButton();
    },
    
    /**
     * Collapse sidebar
     */
    collapse() {
        this.sidebar.classList.add('collapsed');
        this.toggleBtn.innerHTML = '<i class="fas fa-angle-left"></i>';
        
        // Add collapsed class to body for better CSS targeting
        document.body.classList.add('sidebar-collapsed');
        
        console.log('📏 Sidebar collapsed');
    },
    
    /**
     * Expand sidebar
     */
    expand() {
        this.sidebar.classList.remove('collapsed');
        this.toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
        
        // Remove collapsed class from body
        document.body.classList.remove('sidebar-collapsed');
        
        console.log('📐 Sidebar expanded');
    },
    
    /**
     * Animate toggle button
     */
    animateButton() {
        this.toggleBtn.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            this.toggleBtn.style.transform = 'rotate(0deg)';
        }, 300);
    },
    
    /**
     * Save state to localStorage
     */
    saveState() {
        localStorage.setItem('sidebarCollapsed', this.isCollapsed);
        console.log('💾 Sidebar state saved:', this.isCollapsed);
    },
    
    /**
     * Load state from localStorage
     */
    loadState() {
        const savedState = localStorage.getItem('sidebarCollapsed');
        
        if (savedState === 'true') {
            this.isCollapsed = false; // Set to false first
            this.toggle(); // Then toggle to collapse
        }
        
        console.log('📂 Sidebar state loaded:', this.isCollapsed);
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for the sidebar to render
    setTimeout(() => {
        SidebarToggle.initialize();
    }, 500);
});

