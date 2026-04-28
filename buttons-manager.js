/**
 * Modern Buttons Manager
 * إدارة الأزرار الحديثة
 */

const ButtonsManager = {
    /**
     * Initialize buttons manager
     * تهيئة مدير الأزرار
     */
    init() {
        console.log('🔘 Initializing Buttons Manager...');
        this.setupGlobalButtonStyles();
        this.setupButtonAnimations();
        this.setupButtonGroups();
        console.log('✅ Buttons Manager initialized');
    },

    /**
     * Setup global button styles
     * إعداد الأنماط العامة للأزرار
     */
    setupGlobalButtonStyles() {
        // Add modern button classes to existing buttons
        const existingButtons = document.querySelectorAll('button, .btn, input[type="button"], input[type="submit"]');
        
        existingButtons.forEach(button => {
            if (!button.classList.contains('btn-modern')) {
                this.enhanceButton(button);
            }
        });
    },

    /**
     * Enhance existing button with modern styles
     * تحسين الأزرار الموجودة بأنماط حديثة
     */
    enhanceButton(button) {
        // Skip if already enhanced
        if (button.classList.contains('btn-modern')) return;

        // Determine button type based on existing classes
        let buttonType = 'primary';
        
        if (button.classList.contains('btn-primary')) {
            buttonType = 'primary';
        } else if (button.classList.contains('btn-secondary')) {
            buttonType = 'secondary';
        } else if (button.classList.contains('btn-success')) {
            buttonType = 'success';
        } else if (button.classList.contains('btn-warning')) {
            buttonType = 'warning';
        } else if (button.classList.contains('btn-danger')) {
            buttonType = 'danger';
        } else if (button.classList.contains('btn-info')) {
            buttonType = 'info';
        } else if (button.classList.contains('btn-outline-primary')) {
            buttonType = 'outline-primary';
        } else if (button.classList.contains('btn-outline-secondary')) {
            buttonType = 'outline-secondary';
        } else if (button.classList.contains('btn-outline-success')) {
            buttonType = 'outline-success';
        } else if (button.classList.contains('btn-outline-warning')) {
            buttonType = 'outline-warning';
        } else if (button.classList.contains('btn-outline-danger')) {
            buttonType = 'outline-danger';
        } else if (button.classList.contains('btn-outline-info')) {
            buttonType = 'outline-info';
        }

        // Add modern button classes
        button.classList.add('btn-modern');
        button.classList.add(`btn-modern-${buttonType}`);

        // Determine size
        if (button.classList.contains('btn-sm')) {
            button.classList.add('btn-modern-sm');
        } else if (button.classList.contains('btn-lg')) {
            button.classList.add('btn-modern-lg');
        }

        // Add loading state support
        this.addLoadingStateSupport(button);
    },

    /**
     * Add loading state support to button
     * إضافة دعم حالة التحميل للأزرار
     */
    addLoadingStateSupport(button) {
        const originalText = button.textContent || button.innerHTML;
        
        button.addEventListener('click', function(e) {
            // Check if button should show loading state
            if (this.dataset.loading === 'true') {
                this.classList.add('btn-modern-loading');
                this.dataset.originalText = originalText;
                this.textContent = '';
                
                // Remove loading state after 2 seconds (for demo)
                setTimeout(() => {
                    this.classList.remove('btn-modern-loading');
                    this.textContent = originalText;
                }, 2000);
            }
        });
    },

    /**
     * Setup button animations
     * إعداد حركات الأزرار
     */
    setupButtonAnimations() {
        // Add ripple effect
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-modern')) {
                ButtonsManager.createRippleEffect(e.target, e);
            }
        });
    },

    /**
     * Create ripple effect on button click
     * إنشاء تأثير التموج عند النقر على الزر
     */
    createRippleEffect(button, event) {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    },

    /**
     * Setup button groups
     * إعداد مجموعات الأزرار
     */
    setupButtonGroups() {
        const buttonGroups = document.querySelectorAll('.btn-group');
        
        buttonGroups.forEach(group => {
            group.classList.add('btn-group-modern');
        });
    },

    /**
     * Create modern button
     * إنشاء زر حديث
     */
    createButton(options = {}) {
        const {
            text = 'Button',
            type = 'primary',
            size = 'md',
            icon = null,
            loading = false,
            disabled = false,
            onClick = null,
            className = '',
            id = null
        } = options;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = `btn-modern btn-modern-${type} ${size !== 'md' ? `btn-modern-${size}` : ''} ${className}`;
        
        if (id) button.id = id;
        if (disabled) button.disabled = true;
        if (loading) button.dataset.loading = 'true';
        
        // Add icon if provided
        if (icon) {
            button.innerHTML = `<i class="${icon}"></i> ${text}`;
        } else {
            button.textContent = text;
        }
        
        // Add click handler
        if (onClick) {
            button.addEventListener('click', onClick);
        }
        
        return button;
    },

    /**
     * Create floating action button
     * إنشاء زر الإجراء العائم
     */
    createFAB(options = {}) {
        const {
            icon = 'fas fa-plus',
            onClick = null,
            position = 'bottom-right'
        } = options;

        const fab = document.createElement('button');
        fab.type = 'button';
        fab.className = 'btn-modern btn-modern-primary btn-modern-fab';
        fab.innerHTML = `<i class="${icon}"></i>`;
        
        if (onClick) {
            fab.addEventListener('click', onClick);
        }
        
        return fab;
    },

    /**
     * Create icon button
     * إنشاء زر أيقونة
     */
    createIconButton(options = {}) {
        const {
            icon = 'fas fa-edit',
            type = 'primary',
            size = 'md',
            onClick = null,
            title = ''
        } = options;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = `btn-modern btn-modern-${type} btn-modern-icon ${size !== 'md' ? `btn-modern-${size}` : ''}`;
        button.innerHTML = `<i class="${icon}"></i>`;
        button.title = title;
        
        if (onClick) {
            button.addEventListener('click', onClick);
        }
        
        return button;
    },

    /**
     * Update button state
     * تحديث حالة الزر
     */
    updateButtonState(button, state) {
        switch (state) {
            case 'loading':
                button.classList.add('btn-modern-loading');
                button.disabled = true;
                break;
            case 'success':
                button.classList.remove('btn-modern-loading');
                button.disabled = false;
                button.classList.add('btn-modern-success');
                setTimeout(() => {
                    button.classList.remove('btn-modern-success');
                }, 2000);
                break;
            case 'error':
                button.classList.remove('btn-modern-loading');
                button.disabled = false;
                button.classList.add('btn-modern-danger');
                setTimeout(() => {
                    button.classList.remove('btn-modern-danger');
                }, 2000);
                break;
            case 'disabled':
                button.disabled = true;
                break;
            case 'enabled':
                button.disabled = false;
                break;
        }
    },

    /**
     * Add pulse animation to button
     * إضافة حركة النبض للزر
     */
    addPulseAnimation(button) {
        button.classList.add('btn-modern-pulse');
    },

    /**
     * Remove pulse animation from button
     * إزالة حركة النبض من الزر
     */
    removePulseAnimation(button) {
        button.classList.remove('btn-modern-pulse');
    }
};

// Add CSS for ripple effect
const rippleCSS = `
@keyframes ripple {
    to {
        transform: scale(4);
        opacity: 0;
    }
}
`;

// Inject ripple CSS
const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    ButtonsManager.init();
});

// Export for use in other modules
window.ButtonsManager = ButtonsManager;



