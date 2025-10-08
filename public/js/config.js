/**
 * MagSpecKit - Configuration
 * 配置文件 - 加载环境变量和应用配置
 */

// Supabase Configuration
// Note: In production, these should be loaded from environment variables
// For now, they are hardcoded based on the provided credentials
const SUPABASE_CONFIG = {
    url: 'https://zzyueuweeoakopuuwfau.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXVldXdlZW9ha29wdXV3ZmF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODEzMDEsImV4cCI6MjA1OTk1NzMwMX0.y8V3EXK9QVd3txSWdE3gZrSs96Ao0nvpnd0ntZw_dQ4',
};

// Application Configuration
window.AppConfig = {
    // Application Info
    name: 'MagSpecKit',
    version: '1.0.0',
    buildDate: '2025-10-08',
    
    // Environment
    environment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'development' 
        : 'production',
    
    // Supabase
    supabase: SUPABASE_CONFIG,
    
    // API Configuration
    api: {
        timeout: 30000, // 30 seconds
        retryAttempts: 3,
        retryDelay: 1000, // 1 second
    },
    
    // Feature Flags
    features: {
        enableDataSimulator: window.location.hostname === 'localhost', // Only in development
        enableDebugMode: window.location.hostname === 'localhost',
        enableAutoSave: true,
        autoSaveInterval: 1000, // 1 second
        enableAIDefectDetection: false, // Future feature
        enableRealtimeSync: true,
    },
    
    // Waveform Display Configuration
    waveform: {
        refreshRate: 30, // FPS
        maxDataPoints: 10000,
        defaultTimeWindow: 5, // seconds
        channels: ['X', 'Y', 'Z'],
        colors: {
            X: '#FF0000',
            Y: '#00FF00',
            Z: '#0066FF',
        },
    },
    
    // Data Acquisition Configuration
    dataAcquisition: {
        defaultSamplingRate: 1000, // Hz
        maxSamplingRate: 100000, // Hz
        minSamplingRate: 100, // Hz
        bufferSize: 1024,
    },
    
    // UI Configuration
    ui: {
        theme: 'industrial',
        locale: 'zh-CN',
        dateFormat: 'YYYY-MM-DD HH:mm:ss',
        colors: {
            primary: '#FF6B35',
            secondary: '#2D2D2D',
            background: '#000000',
            text: '#E5E7EB',
        },
    },
    
    // Storage Configuration
    storage: {
        localStoragePrefix: 'magspeckit_',
        maxLocalStorageSize: 5 * 1024 * 1024, // 5MB
    },
    
    // Logging Configuration
    logging: {
        enabled: true,
        level: window.location.hostname === 'localhost' ? 'debug' : 'info', // debug, info, warn, error
        consoleOutput: true,
        remoteLogging: false, // Future feature
    },
};

// Freeze configuration to prevent accidental modifications
Object.freeze(window.AppConfig);
Object.freeze(window.AppConfig.supabase);
Object.freeze(window.AppConfig.api);
Object.freeze(window.AppConfig.features);
Object.freeze(window.AppConfig.waveform);
Object.freeze(window.AppConfig.dataAcquisition);
Object.freeze(window.AppConfig.ui);
Object.freeze(window.AppConfig.storage);
Object.freeze(window.AppConfig.logging);

// Log configuration on load (only in development)
if (window.AppConfig.environment === 'development') {
    console.log('📝 Configuration loaded:', window.AppConfig);
}

