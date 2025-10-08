/**
 * Supabase Client
 * Supabase客户端 - 单例模式，提供数据库连接
 * 
 * @module services/supabase-client
 */

// Import Supabase from CDN (loaded in HTML)
// Note: Supabase client will be available as window.supabase after CDN load

/**
 * Supabase Client Singleton
 */
class SupabaseClient {
    constructor() {
        if (SupabaseClient.instance) {
            return SupabaseClient.instance;
        }
        
        this.client = null;
        this.isConnected = false;
        this.connectionError = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        SupabaseClient.instance = this;
    }
    
    /**
     * Initialize Supabase client
     * @returns {Promise<Object>} Supabase client instance
     */
    async initialize() {
        try {
            console.log('🔌 Initializing Supabase client...');
            
            // Get configuration
            const config = window.AppConfig?.supabase;
            
            if (!config || !config.url || !config.anonKey) {
                throw new Error('Supabase configuration not found');
            }
            
            // Check if Supabase SDK is loaded
            if (typeof window.supabase === 'undefined') {
                console.warn('⚠️ Supabase SDK not loaded yet, will initialize later');
                return null;
            }
            
            // Create client
            this.client = window.supabase.createClient(
                config.url,
                config.anonKey,
                {
                    auth: {
                        autoRefreshToken: true,
                        persistSession: true,
                        detectSessionInUrl: true,
                    },
                    realtime: {
                        params: {
                            eventsPerSecond: 10,
                        },
                    },
                }
            );
            
            // Test connection
            await this.testConnection();
            
            this.isConnected = true;
            this.connectionError = null;
            console.log('✅ Supabase client initialized successfully');
            
            return this.client;
            
        } catch (error) {
            console.error('❌ Failed to initialize Supabase client:', error);
            this.isConnected = false;
            this.connectionError = error.message;
            
            // Retry logic
            if (this.retryCount < this.maxRetries) {
                this.retryCount++;
                console.log(`🔄 Retrying connection (${this.retryCount}/${this.maxRetries})...`);
                await this.delay(2000);
                return this.initialize();
            }
            
            throw error;
        }
    }
    
    /**
     * Test database connection
     */
    async testConnection() {
        try {
            const { data, error } = await this.client
                .from('mag_users')
                .select('count')
                .limit(1);
            
            if (error) throw error;
            
            console.log('✅ Database connection test passed');
            return true;
        } catch (error) {
            console.warn('⚠️ Database connection test failed:', error.message);
            // Don't throw - connection might work even if test fails
            return false;
        }
    }
    
    /**
     * Get Supabase client instance
     * @returns {Object} Supabase client
     */
    getClient() {
        if (!this.client) {
            console.warn('⚠️ Supabase client not initialized. Call initialize() first.');
        }
        return this.client;
    }
    
    /**
     * Check if connected
     * @returns {boolean}
     */
    isClientConnected() {
        return this.isConnected && this.client !== null;
    }
    
    /**
     * Get connection status
     * @returns {Object} Status object
     */
    getStatus() {
        return {
            connected: this.isConnected,
            error: this.connectionError,
            retries: this.retryCount,
            clientExists: this.client !== null,
        };
    }
    
    /**
     * Reconnect to Supabase
     */
    async reconnect() {
        console.log('🔄 Reconnecting to Supabase...');
        this.retryCount = 0;
        return this.initialize();
    }
    
    /**
     * Handle query errors
     * @param {Error} error - Error object
     * @param {string} operation - Operation name
     */
    handleError(error, operation = 'unknown') {
        console.error(`❌ Supabase ${operation} error:`, error);
        
        // Log to audit system if available
        if (window.MagSpecKit?.Logger) {
            window.MagSpecKit.Logger.error(`Supabase ${operation} failed`, {
                error: error.message,
                code: error.code,
                details: error.details,
            });
        }
        
        return {
            success: false,
            error: error.message,
            code: error.code,
        };
    }
    
    /**
     * Delay utility
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Disconnect (cleanup)
     */
    disconnect() {
        if (this.client) {
            console.log('🔌 Disconnecting Supabase client...');
            // Supabase client doesn't have explicit disconnect
            // Just clean up references
            this.client = null;
            this.isConnected = false;
        }
    }
}

// Create and export singleton instance
const supabaseClient = new SupabaseClient();

// Auto-initialize when Supabase SDK is loaded
if (typeof window.supabase !== 'undefined') {
    supabaseClient.initialize().catch(err => {
        console.error('Failed to auto-initialize Supabase:', err);
    });
} else {
    console.log('⏳ Waiting for Supabase SDK to load...');
    // Try again after a short delay
    setTimeout(() => {
        if (typeof window.supabase !== 'undefined') {
            supabaseClient.initialize().catch(err => {
                console.error('Failed to auto-initialize Supabase:', err);
            });
        }
    }, 1000);
}

// Export for use in other modules
window.MagSpecKit = window.MagSpecKit || {};
window.MagSpecKit.SupabaseClient = supabaseClient;

export default supabaseClient;

