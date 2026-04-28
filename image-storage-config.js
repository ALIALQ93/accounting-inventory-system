/**
 * Image Storage Configuration
 * إعدادات تخزين الصور
 */

const ImageStorageConfig = {
    // Cloudinary Configuration
    cloudinary: {
        enabled: false, // Set to true to enable Cloudinary
        cloudName: 'your-cloud-name', // Get from cloudinary.com
        uploadPreset: 'your-upload-preset', // Get from cloudinary.com
        folder: 'products'
    },

    // ImgBB Configuration
    imgbb: {
        enabled: false, // Set to true to enable ImgBB
        apiKey: 'your-imgbb-api-key' // Get from imgbb.com (free)
    },

    // Local Storage Configuration
    local: {
        enabled: true, // Always enabled as fallback
        maxSize: 2 * 1024 * 1024, // 2MB
        compression: {
            maxWidth: 400,
            quality: 0.6
        }
    },

    /**
     * Get active storage method
     */
    getActiveStorage() {
        if (this.cloudinary.enabled && this.cloudinary.cloudName !== 'your-cloud-name') {
            return 'cloudinary';
        }
        if (this.imgbb.enabled && this.imgbb.apiKey !== 'your-imgbb-api-key') {
            return 'imgbb';
        }
        return 'local';
    },

    /**
     * Get Cloudinary config
     */
    getCloudinaryConfig() {
        return {
            cloudName: this.cloudinary.cloudName,
            uploadPreset: this.cloudinary.uploadPreset,
            folder: this.cloudinary.folder
        };
    },

    /**
     * Get ImgBB config
     */
    getImgBBConfig() {
        return {
            apiKey: this.imgbb.apiKey
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageStorageConfig;
}



