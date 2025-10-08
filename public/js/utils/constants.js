/**
 * Constants
 * 常量定义 - 应用程序常量
 */

// Colors - Industrial Theme
export const COLORS = {
    ORANGE: '#FF6B35',
    DARK_GRAY: '#2D2D2D',
    BLACK: '#000000',
    DEEP_BLACK: '#1A1A1A',
    GRID: '#333333',
    
    // Status Colors
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    INFO: '#3B82F6',
    
    // Waveform Colors
    WAVEFORM_X: '#FF0000',
    WAVEFORM_Y: '#00FF00',
    WAVEFORM_Z: '#0066FF',
    WAVEFORM_NORMAL: '#FFD700',
    WAVEFORM_ALERT: '#FF0000',
};

// User Roles
export const ROLES = {
    ADMIN: 'admin',
    ENGINEER: 'engineer',
    VIEWER: 'viewer',
};

// Project Status
export const PROJECT_STATUS = {
    PREPARING: 'preparing',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    ARCHIVED: 'archived',
};

// Defect Types
export const DEFECT_TYPES = {
    CRACK: 'crack',
    CORROSION: 'corrosion',
    INCLUSION: 'inclusion',
    OTHER: 'other',
};

// Defect Severity
export const DEFECT_SEVERITY = {
    MINOR: 'minor',
    MODERATE: 'moderate',
    SEVERE: 'severe',
    CRITICAL: 'critical',
};

// File Types
export const FILE_TYPES = {
    RAW_DATA: 'raw_data',
    REPORT: 'report',
    IMAGE: 'image',
    OTHER: 'other',
};

// Report Status
export const REPORT_STATUS = {
    DRAFT: 'draft',
    FINAL: 'final',
    ARCHIVED: 'archived',
};

// Alert Severity
export const ALERT_SEVERITY = {
    INFO: 'info',
    WARNING: 'warning',
    CRITICAL: 'critical',
};

// Alert Status
export const ALERT_STATUS = {
    ACTIVE: 'active',
    RESOLVED: 'resolved',
    IGNORED: 'ignored',
};

// Standards
export const STANDARDS = {
    ISO_9934: 'ISO 9934-1',
    ASTM_E709: 'ASTM E709',
    EN_1290: 'EN 1290',
    ASME_B31_4: 'ASME B31.4',
    API_1163: 'API 1163',
};

// Export all
window.MagSpecKit = window.MagSpecKit || {};
window.MagSpecKit.Constants = {
    COLORS,
    ROLES,
    PROJECT_STATUS,
    DEFECT_TYPES,
    DEFECT_SEVERITY,
    FILE_TYPES,
    REPORT_STATUS,
    ALERT_SEVERITY,
    ALERT_STATUS,
    STANDARDS,
};

