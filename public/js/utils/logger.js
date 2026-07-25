/**
 * Logger Utility
 * 日志工具 - 统一的日志记录和监控系统
 */

class Logger {
    constructor() {
        this.logs = [];
        this.maxLogs = 1000; // 最多保存1000条日志
        this.logLevel = this.getLogLevel();
        this.enableConsole = true;
        this.enableStorage = true;
    }
    
    /**
     * Get log level from environment
     */
    getLogLevel() {
        const isDev = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
        return isDev ? 'debug' : 'info';
    }
    
    /**
     * Log levels
     */
    static levels = {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
        critical: 4,
    };
    
    /**
     * Check if should log at this level
     */
    shouldLog(level) {
        const currentLevel = Logger.levels[this.logLevel] || 1;
        const messageLevel = Logger.levels[level] || 1;
        return messageLevel >= currentLevel;
    }
    
    /**
     * Create log entry
     */
    createLogEntry(level, message, data = null) {
        return {
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            message,
            data,
            url: window.location.href,
            userAgent: navigator.userAgent,
        };
    }
    
    /**
     * Store log entry
     */
    storeLog(entry) {
        this.logs.push(entry);
        
        // Trim logs if exceeds max
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // Store in localStorage if enabled
        if (this.enableStorage) {
            try {
                const recent = this.logs.slice(-100); // Keep last 100 in storage
                localStorage.setItem('magspeckit_logs', JSON.stringify(recent));
            } catch (error) {
                // Storage might be full, clear old logs
                localStorage.removeItem('magspeckit_logs');
            }
        }
    }
    
    /**
     * Debug level log
     */
    debug(message, data = null) {
        if (!this.shouldLog('debug')) return;
        
        const entry = this.createLogEntry('debug', message, data);
        this.storeLog(entry);
        
        if (this.enableConsole) {
            console.log(`🔍 [DEBUG] ${message}`, data || '');
        }
    }
    
    /**
     * Info level log
     */
    info(message, data = null) {
        if (!this.shouldLog('info')) return;
        
        const entry = this.createLogEntry('info', message, data);
        this.storeLog(entry);
        
        if (this.enableConsole) {
            console.log(`ℹ️ [INFO] ${message}`, data || '');
        }
    }
    
    /**
     * Warning level log
     */
    warn(message, data = null) {
        if (!this.shouldLog('warn')) return;
        
        const entry = this.createLogEntry('warn', message, data);
        this.storeLog(entry);
        
        if (this.enableConsole) {
            console.warn(`⚠️ [WARN] ${message}`, data || '');
        }
    }
    
    /**
     * Error level log
     */
    error(message, data = null) {
        if (!this.shouldLog('error')) return;
        
        const entry = this.createLogEntry('error', message, data);
        this.storeLog(entry);
        
        if (this.enableConsole) {
            console.error(`❌ [ERROR] ${message}`, data || '');
        }
        
        // Send error to monitoring service if available
        this.reportError(entry);
    }
    
    /**
     * Critical level log
     */
    critical(message, data = null) {
        const entry = this.createLogEntry('critical', message, data);
        this.storeLog(entry);
        
        if (this.enableConsole) {
            console.error(`🚨 [CRITICAL] ${message}`, data || '');
        }
        
        // Send critical error immediately
        this.reportError(entry, true);
    }
    
    /**
     * Report error to monitoring service
     */
    async reportError(entry, isCritical = false) {
        // TODO: Send to external monitoring service (e.g., Sentry, LogRocket)
        // For now, just store in Supabase audit logs
        
        try {
            if (window.MagSpecKit?.SupabaseClient) {
                const client = window.MagSpecKit.SupabaseClient.getClient();
                if (client) {
                    await client.from('mag_audit_logs').insert({
                        action: isCritical ? 'critical_error' : 'error',
                        resource_type: 'system',
                        resource_id: 'frontend',
                        details: entry,
                    });
                }
            }
        } catch (error) {
            console.error('Failed to report error to audit logs:', error);
        }
    }
    
    /**
     * Get all logs
     */
    getLogs(filter = {}) {
        let filtered = [...this.logs];
        
        if (filter.level) {
            filtered = filtered.filter(log => log.level === filter.level.toUpperCase());
        }
        
        if (filter.since) {
            const sinceDate = new Date(filter.since);
            filtered = filtered.filter(log => new Date(log.timestamp) >= sinceDate);
        }
        
        if (filter.limit) {
            filtered = filtered.slice(-filter.limit);
        }
        
        return filtered;
    }
    
    /**
     * Clear all logs
     */
    clearLogs() {
        this.logs = [];
        localStorage.removeItem('magspeckit_logs');
        console.log('✅ Logs cleared');
    }
    
    /**
     * Export logs as JSON
     */
    exportLogs() {
        const blob = new Blob([JSON.stringify(this.logs, null, 2)], {
            type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `magspeckit_logs_${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }
    
    /**
     * Get log statistics
     */
    getStats() {
        const stats = {
            total: this.logs.length,
            byLevel: {},
            recent: this.logs.slice(-10),
        };
        
        this.logs.forEach(log => {
            stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
        });
        
        return stats;
    }
}

// Create singleton instance
const logger = new Logger();

// Intercept console errors
window.addEventListener('error', (event) => {
    logger.error('Uncaught error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack,
    });
});

// Intercept unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', {
        reason: event.reason,
        promise: event.promise,
    });
});

// Export for use in other modules
window.MagSpecKit = window.MagSpecKit || {};
window.MagSpecKit.Logger = logger;

export default logger;

