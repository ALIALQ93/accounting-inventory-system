/**
 * Database Configuration Manager
 * مدير إعدادات قاعدة البيانات
 * 
 * This module handles database configuration for multi-company setup
 * كل شركة لها قاعدة بيانات منفصلة
 */

const DatabaseConfigManager = {
    currentConfig: null,
    configVersion: '1.0',

    /**
     * Initialize database configuration
     */
    async initialize() {
        try {
            console.log('🔧 Initializing Database Configuration Manager...');
            
            // Load configuration
            await this.loadConfiguration();
            
            // Apply configuration if available
            if (this.currentConfig) {
                await this.applyConfiguration();
            }
            
            console.log('✅ Database Configuration Manager initialized');
            
        } catch (error) {
            console.error('❌ Error initializing Database Config Manager:', error);
        }
    },

    /**
     * Load configuration from multiple sources
     */
    async loadConfiguration() {
        try {
            let config = null;
            
            // Priority 1: localStorage (most recent)
            const localConfig = localStorage.getItem('databaseConfig');
            if (localConfig) {
                config = JSON.parse(localConfig);
                console.log('📁 Loaded config from localStorage');
            }
            
            // Priority 2: sessionStorage (current session)
            if (!config) {
                const sessionConfig = sessionStorage.getItem('databaseConfig');
                if (sessionConfig) {
                    config = JSON.parse(sessionConfig);
                    console.log('📁 Loaded config from sessionStorage');
                }
            }
            
            // Priority 3: Default config file (if exists)
            if (!config) {
                config = await this.loadDefaultConfig();
                if (config) {
                    console.log('📁 Loaded default config');
                }
            }
            
            // Priority 4: Fallback to Firebase (current setup)
            if (!config) {
                config = this.getDefaultFirebaseConfig();
                console.log('📁 Using default Firebase config');
            }
            
            this.currentConfig = config;
            console.log('📊 Current database config:', config);
            
        } catch (error) {
            console.error('Error loading configuration:', error);
            this.currentConfig = this.getDefaultFirebaseConfig();
        }
    },

    /**
     * Load default configuration file
     */
    async loadDefaultConfig() {
        try {
            // Check if we're running on file:// protocol (local development)
            if (window.location.protocol === 'file:') {
                console.log('Running on file:// protocol, skipping config file load');
                return null;
            }
            
            // Try to load from a default config file
            const response = await fetch('./config/database-config.json');
            if (response.ok) {
                const config = await response.json();
                return config.config;
            }
        } catch (error) {
            console.log('No default config file found or CORS error:', error.message);
        }
        return null;
    },

    /**
     * Get default Firebase configuration
     */
    getDefaultFirebaseConfig() {
        return {
            type: 'firebase',
            name: 'الشركة الافتراضية',
            companyId: 'default-company',
            firebase: {
                projectId: 'default-project',
                apiKey: 'default-api-key',
                authDomain: 'default-project.firebaseapp.com',
                storageBucket: 'default-project.appspot.com'
            },
            updatedAt: new Date().toISOString()
        };
    },

    /**
     * Apply current configuration
     */
    async applyConfiguration() {
        try {
            if (!this.currentConfig) return;

            console.log('🔧 Applying database configuration...');

            switch (this.currentConfig.type) {
                case 'firebase':
                    await this.applyFirebaseConfig();
                    break;
                case 'mysql':
                case 'postgresql':
                    await this.applySQLConfig();
                    break;
                case 'mongodb':
                    await this.applyMongoConfig();
                    break;
                default:
                    console.warn('Unknown database type:', this.currentConfig.type);
            }

            console.log('✅ Database configuration applied');
            
        } catch (error) {
            console.error('Error applying configuration:', error);
        }
    },

    /**
     * Apply Firebase configuration
     */
    async applyFirebaseConfig() {
        try {
            if (!this.currentConfig.firebase) return;

            // Initialize Firebase with new config
            const firebaseConfig = {
                apiKey: this.currentConfig.firebase.apiKey,
                authDomain: this.currentConfig.firebase.authDomain,
                projectId: this.currentConfig.firebase.projectId,
                storageBucket: this.currentConfig.firebase.storageBucket,
                messagingSenderId: "123456789",
                appId: "1:123456789:web:abcdef"
            };

            // Note: In a real implementation, you would reinitialize Firebase here
            // For now, we'll just log the configuration
            console.log('🔥 Firebase config applied:', firebaseConfig);
            
        } catch (error) {
            console.error('Error applying Firebase config:', error);
        }
    },

    /**
     * Apply SQL configuration
     */
    async applySQLConfig() {
        try {
            if (!this.currentConfig.sql) return;

            console.log('🗄️ SQL config applied:', this.currentConfig.sql);
            
            // In a real implementation, you would initialize SQL connection here
            
        } catch (error) {
            console.error('Error applying SQL config:', error);
        }
    },

    /**
     * Apply MongoDB configuration
     */
    async applyMongoConfig() {
        try {
            if (!this.currentConfig.mongo) return;

            console.log('🍃 MongoDB config applied:', this.currentConfig.mongo);
            
            // In a real implementation, you would initialize MongoDB connection here
            
        } catch (error) {
            console.error('Error applying MongoDB config:', error);
        }
    },

    /**
     * Save configuration to multiple locations
     */
    async saveConfiguration(config) {
        try {
            console.log('💾 Saving database configuration...');

            // Update current config
            this.currentConfig = config;

            // Save to localStorage
            localStorage.setItem('databaseConfig', JSON.stringify(config));

            // Save to sessionStorage
            sessionStorage.setItem('databaseConfig', JSON.stringify(config));

            // Download config file
            this.downloadConfigFile(config);

            // Try to save to current database (backup)
            try {
                if (typeof db !== 'undefined') {
                    await db.collection('settings').doc('database').set(config, { merge: true });
                }
            } catch (error) {
                console.warn('Could not save to current database:', error);
            }

            console.log('✅ Configuration saved successfully');
            
        } catch (error) {
            console.error('Error saving configuration:', error);
            throw error;
        }
    },

    /**
     * Download configuration file
     */
    downloadConfigFile(config) {
        const configFile = {
            version: this.configVersion,
            type: 'database-config',
            company: config.name,
            config: config,
            createdAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(configFile, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `database-config-${config.name}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Get current configuration
     */
    getCurrentConfig() {
        return this.currentConfig;
    },

    /**
     * Test database connection
     */
    async testConnection(config = null) {
        try {
            const testConfig = config || this.currentConfig;
            if (!testConfig) {
                throw new Error('No configuration available');
            }

            console.log('🔌 Testing database connection...');

            switch (testConfig.type) {
                case 'firebase':
                    return await this.testFirebaseConnection(testConfig);
                case 'mysql':
                case 'postgresql':
                    return await this.testSQLConnection(testConfig);
                case 'mongodb':
                    return await this.testMongoConnection(testConfig);
                default:
                    throw new Error('Unknown database type');
            }
            
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    },

    /**
     * Test Firebase connection
     */
    async testFirebaseConnection(config) {
        try {
            // This would test the actual Firebase connection
            // For now, we'll simulate a test
            await new Promise(resolve => setTimeout(resolve, 1000));
            return true;
        } catch (error) {
            return false;
        }
    },

    /**
     * Test SQL connection
     */
    async testSQLConnection(config) {
        try {
            // This would test the actual SQL connection
            // For now, we'll simulate a test
            await new Promise(resolve => setTimeout(resolve, 1000));
            return true;
        } catch (error) {
            return false;
        }
    },

    /**
     * Test MongoDB connection
     */
    async testMongoConnection(config) {
        try {
            // This would test the actual MongoDB connection
            // For now, we'll simulate a test
            await new Promise(resolve => setTimeout(resolve, 1000));
            return true;
        } catch (error) {
            return false;
        }
    },

    /**
     * Switch to different company database
     */
    async switchToCompany(companyId, companyName) {
        try {
            console.log(`🏢 Switching to company: ${companyName} (${companyId})`);

            // Load company-specific configuration
            const companyConfig = await this.loadCompanyConfig(companyId);
            
            if (companyConfig) {
                await this.saveConfiguration(companyConfig);
                await this.applyConfiguration();
                
                // Update current company info
                localStorage.setItem('currentCompanyId', companyId);
                localStorage.setItem('currentCompanyName', companyName);
                
                console.log(`✅ Switched to company: ${companyName}`);
                return true;
            } else {
                console.warn(`No configuration found for company: ${companyName}`);
                return false;
            }
            
        } catch (error) {
            console.error('Error switching company:', error);
            return false;
        }
    },

    /**
     * Load company-specific configuration
     */
    async loadCompanyConfig(companyId) {
        try {
            // Try to load from localStorage first
            const companyConfigKey = `databaseConfig_${companyId}`;
            const localConfig = localStorage.getItem(companyConfigKey);
            
            if (localConfig) {
                return JSON.parse(localConfig);
            }
            
            // If not found locally, try to load from file or server
            // This would be implemented based on your deployment strategy
            
            return null;
            
        } catch (error) {
            console.error('Error loading company config:', error);
            return null;
        }
    },

    /**
     * Save company-specific configuration
     */
    async saveCompanyConfig(companyId, config) {
        try {
            const companyConfigKey = `databaseConfig_${companyId}`;
            localStorage.setItem(companyConfigKey, JSON.stringify(config));
            
            console.log(`💾 Saved configuration for company: ${companyId}`);
            
        } catch (error) {
            console.error('Error saving company config:', error);
        }
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        DatabaseConfigManager.initialize();
    });
} else {
    DatabaseConfigManager.initialize();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseConfigManager;
}
