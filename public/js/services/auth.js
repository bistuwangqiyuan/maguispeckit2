/**
 * Authentication Service
 * 认证服务 - 处理用户登录、登出、会话管理
 * 
 * @module services/auth
 */

import supabaseClient from './supabase-client.js';

/**
 * Authentication Service Class
 */
class AuthService {
    constructor() {
        this.currentUser = null;
        this.session = null;
        this.authStateListeners = [];
    }
    
    /**
     * Initialize auth service
     */
    async initialize() {
        try {
            console.log('🔐 Initializing Authentication Service...');
            
            const client = supabaseClient.getClient();
            if (!client) {
                console.warn('⚠️ Supabase client not available');
                return;
            }
            
            // Get current session
            const { data: { session } } = await client.auth.getSession();
            
            if (session) {
                this.session = session;
                await this.loadUserProfile(session.user.id);
                console.log('✅ User already logged in:', this.currentUser?.email);
            }
            
            // Listen for auth state changes
            client.auth.onAuthStateChange((event, session) => {
                console.log('🔄 Auth state changed:', event);
                this.handleAuthStateChange(event, session);
            });
            
            console.log('✅ Authentication Service initialized');
        } catch (error) {
            console.error('❌ Failed to initialize auth service:', error);
        }
    }
    
    /**
     * Login with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Result object
     */
    async login(email, password) {
        try {
            console.log('🔑 Logging in:', email);
            
            const client = supabaseClient.getClient();
            if (!client) {
                throw new Error('Supabase client not initialized');
            }
            
            const { data, error } = await client.auth.signInWithPassword({
                email,
                password,
            });
            
            if (error) throw error;
            
            this.session = data.session;
            await this.loadUserProfile(data.user.id);
            
            // Log audit event
            await this.logAuditEvent('login', data.user.id);
            
            console.log('✅ Login successful:', this.currentUser?.email);
            
            return {
                success: true,
                user: this.currentUser,
                session: this.session,
            };
            
        } catch (error) {
            console.error('❌ Login failed:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    
    /**
     * Logout current user
     * @returns {Promise<Object>} Result object
     */
    async logout() {
        try {
            console.log('🚪 Logging out...');
            
            const client = supabaseClient.getClient();
            if (!client) {
                throw new Error('Supabase client not initialized');
            }
            
            const userId = this.currentUser?.id;
            
            const { error } = await client.auth.signOut();
            
            if (error) throw error;
            
            // Log audit event before clearing user
            if (userId) {
                await this.logAuditEvent('logout', userId);
            }
            
            this.currentUser = null;
            this.session = null;
            
            console.log('✅ Logout successful');
            
            return {
                success: true,
            };
            
        } catch (error) {
            console.error('❌ Logout failed:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    
    /**
     * Get current user
     * @returns {Object|null} Current user object
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * Get current session
     * @returns {Object|null} Current session object
     */
    getCurrentSession() {
        return this.session;
    }
    
    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return this.currentUser !== null && this.session !== null;
    }
    
    /**
     * Check user role
     * @param {string} role - Role to check (admin, engineer, viewer)
     * @returns {boolean}
     */
    hasRole(role) {
        return this.currentUser?.role === role;
    }
    
    /**
     * Check if user is admin
     * @returns {boolean}
     */
    isAdmin() {
        return this.hasRole('admin');
    }
    
    /**
     * Check if user is engineer
     * @returns {boolean}
     */
    isEngineer() {
        return this.hasRole('engineer');
    }
    
    /**
     * Check session validity
     * @returns {Promise<boolean>}
     */
    async checkSession() {
        try {
            const client = supabaseClient.getClient();
            if (!client) {
                return false;
            }
            
            const { data: { session }, error } = await client.auth.getSession();
            
            if (error || !session) {
                this.currentUser = null;
                this.session = null;
                return false;
            }
            
            this.session = session;
            return true;
            
        } catch (error) {
            console.error('❌ Session check failed:', error);
            return false;
        }
    }
    
    /**
     * Load user profile from database
     * @param {string} userId - User ID
     */
    async loadUserProfile(userId) {
        try {
            const client = supabaseClient.getClient();
            if (!client) {
                throw new Error('Supabase client not initialized');
            }
            
            const { data, error } = await client
                .from('mag_users')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error) throw error;
            
            this.currentUser = data;
            
        } catch (error) {
            console.error('❌ Failed to load user profile:', error);
            // Use basic user info from session
            this.currentUser = {
                id: userId,
                email: this.session?.user?.email,
                role: 'viewer', // Default role
            };
        }
    }
    
    /**
     * Handle auth state changes
     * @param {string} event - Auth event type
     * @param {Object} session - Session object
     */
    async handleAuthStateChange(event, session) {
        this.session = session;
        
        if (event === 'SIGNED_IN') {
            await this.loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
            this.currentUser = null;
        } else if (event === 'TOKEN_REFRESHED') {
            console.log('🔄 Token refreshed');
        }
        
        // Notify listeners
        this.notifyAuthStateListeners(event, this.currentUser);
    }
    
    /**
     * Subscribe to auth state changes
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    onAuthStateChange(callback) {
        this.authStateListeners.push(callback);
        
        // Return unsubscribe function
        return () => {
            const index = this.authStateListeners.indexOf(callback);
            if (index > -1) {
                this.authStateListeners.splice(index, 1);
            }
        };
    }
    
    /**
     * Notify all auth state listeners
     * @param {string} event - Event type
     * @param {Object} user - User object
     */
    notifyAuthStateListeners(event, user) {
        this.authStateListeners.forEach(callback => {
            try {
                callback(event, user);
            } catch (error) {
                console.error('❌ Auth state listener error:', error);
            }
        });
    }
    
    /**
     * Log audit event
     * @param {string} action - Action type
     * @param {string} userId - User ID
     */
    async logAuditEvent(action, userId) {
        try {
            const client = supabaseClient.getClient();
            if (!client) return;
            
            await client
                .from('mag_audit_logs')
                .insert({
                    user_id: userId,
                    action: action,
                    resource_type: 'auth',
                    resource_id: userId,
                    details: {
                        timestamp: new Date().toISOString(),
                        user_agent: navigator.userAgent,
                    },
                });
        } catch (error) {
            console.error('❌ Failed to log audit event:', error);
        }
    }
    
    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise<Object>}
     */
    async requestPasswordReset(email) {
        try {
            const client = supabaseClient.getClient();
            if (!client) {
                throw new Error('Supabase client not initialized');
            }
            
            const { error } = await client.auth.resetPasswordForEmail(email);
            
            if (error) throw error;
            
            return {
                success: true,
                message: 'Password reset email sent',
            };
            
        } catch (error) {
            console.error('❌ Password reset request failed:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    
    /**
     * Update user password
     * @param {string} newPassword - New password
     * @returns {Promise<Object>}
     */
    async updatePassword(newPassword) {
        try {
            const client = supabaseClient.getClient();
            if (!client) {
                throw new Error('Supabase client not initialized');
            }
            
            const { error } = await client.auth.updateUser({
                password: newPassword,
            });
            
            if (error) throw error;
            
            return {
                success: true,
                message: 'Password updated successfully',
            };
            
        } catch (error) {
            console.error('❌ Password update failed:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
}

// Create and export singleton instance
const authService = new AuthService();

// Auto-initialize
authService.initialize().catch(err => {
    console.error('Failed to initialize auth service:', err);
});

// Export for use in other modules
window.MagSpecKit = window.MagSpecKit || {};
window.MagSpecKit.AuthService = authService;

export default authService;

