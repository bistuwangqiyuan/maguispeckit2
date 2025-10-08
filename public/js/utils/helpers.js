/**
 * Helper Functions
 * 工具函数库 - 通用辅助函数
 */

// Date Formatting
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

// Debounce
export function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Throttle
export function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

// Deep Clone
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Validate Form
export function validateForm(data, rules) {
    const errors = {};
    
    for (const [field, fieldRules] of Object.entries(rules)) {
        const value = data[field];
        
        if (fieldRules.required && !value) {
            errors[field] = `${field} is required`;
        }
        
        if (fieldRules.min && value && value.length < fieldRules.min) {
            errors[field] = `${field} must be at least ${fieldRules.min} characters`;
        }
        
        if (fieldRules.pattern && value && !fieldRules.pattern.test(value)) {
            errors[field] = `${field} format is invalid`;
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

// Format File Size
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Generate UUID
export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Export all
window.MagSpecKit = window.MagSpecKit || {};
window.MagSpecKit.Helpers = {
    formatDate,
    debounce,
    throttle,
    deepClone,
    validateForm,
    formatFileSize,
    generateUUID,
};

