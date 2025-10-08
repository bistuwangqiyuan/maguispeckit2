/**
 * Realtime Data Service
 * 实时数据服务 - 处理Supabase实时数据订阅
 * 
 * @module services/realtime-data
 */

import supabaseClient from './supabase-client.js';

/**
 * Realtime Data Service Class
 */
class RealtimeDataService {
    constructor() {
        this.subscriptions = new Map();
        this.listeners = new Map();
        this.isConnected = false;
    }
    
    /**
     * Subscribe to detection data updates for a project
     * @param {string} projectId - Project ID
     * @param {Function} callback - Callback function for new data
     * @returns {Function} Unsubscribe function
     */
    async subscribeToDetectionData(projectId, callback) {
        try {
            console.log('📡 Subscribing to detection data for project:', projectId);
            
            const client = supabaseClient.getClient();
            if (!client) {
                throw new Error('Supabase client not initialized');
            }
            
            // Create channel name
            const channelName = `detection_data_${projectId}`;
            
            // Check if already subscribed
            if (this.subscriptions.has(channelName)) {
                console.warn('⚠️ Already subscribed to this project');
                return () => this.unsubscribe(channelName);
            }
            
            // Create subscription
            const channel = client
                .channel(channelName)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'mag_detection_data',
                        filter: `project_id=eq.${projectId}`,
                    },
                    (payload) => {
                        this.handleDetectionDataInsert(payload, callback);
                    }
                )
                .subscribe((status) => {
                    console.log(`📡 Subscription status: ${status}`);
                    this.isConnected = status === 'SUBSCRIBED';
                });
            
            // Store subscription
            this.subscriptions.set(channelName, channel);
            
            console.log('✅ Subscribed to realtime detection data');
            
            // Return unsubscribe function
            return () => this.unsubscribe(channelName);
            
        } catch (error) {
            console.error('❌ Failed to subscribe to detection data:', error);
            return null;
        }
    }
    
    /**
     * Handle detection data insert event
     * @param {Object} payload - Supabase payload
     * @param {Function} callback - User callback
     */
    handleDetectionDataInsert(payload, callback) {
        try {
            const newData = payload.new;
            
            console.log('📥 New detection data received:', {
                id: newData.id,
                timestamp: newData.timestamp,
                position: newData.position,
            });
            
            // Parse raw signal data
            let signalData = newData.raw_signal;
            
            // If raw_signal is a JSON string, parse it
            if (typeof signalData === 'string') {
                try {
                    signalData = JSON.parse(signalData);
                } catch (e) {
                    console.warn('⚠️ Failed to parse raw_signal:', e);
                    signalData = null;
                }
            }
            
            // Prepare data for callback
            const processedData = {
                id: newData.id,
                timestamp: newData.timestamp,
                position: newData.position,
                signal: {
                    x: signalData?.x || newData.signal_x || 0,
                    y: signalData?.y || newData.signal_y || 0,
                    z: signalData?.z || newData.signal_z || 0,
                },
                defectDetected: newData.defect_detected || false,
                raw: signalData,
            };
            
            // Call user callback
            if (callback && typeof callback === 'function') {
                callback(processedData);
            }
            
        } catch (error) {
            console.error('❌ Error handling detection data insert:', error);
        }
    }
    
    /**
     * Unsubscribe from a channel
     * @param {string} channelName - Channel name
     */
    async unsubscribe(channelName) {
        try {
            const channel = this.subscriptions.get(channelName);
            
            if (channel) {
                await channel.unsubscribe();
                this.subscriptions.delete(channelName);
                console.log(`✅ Unsubscribed from ${channelName}`);
            }
            
        } catch (error) {
            console.error('❌ Failed to unsubscribe:', error);
        }
    }
    
    /**
     * Unsubscribe from all channels
     */
    async unsubscribeAll() {
        console.log('🧹 Unsubscribing from all channels...');
        
        const unsubscribePromises = Array.from(this.subscriptions.keys()).map(
            channelName => this.unsubscribe(channelName)
        );
        
        await Promise.all(unsubscribePromises);
        
        this.subscriptions.clear();
        this.isConnected = false;
        
        console.log('✅ All channels unsubscribed');
    }
    
    /**
     * Get subscription status
     * @returns {Object} Status object
     */
    getStatus() {
        return {
            connected: this.isConnected,
            activeSubscriptions: this.subscriptions.size,
            channels: Array.from(this.subscriptions.keys()),
        };
    }
    
    /**
     * Register a listener for specific events
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }
    
    /**
     * Emit an event to registered listeners
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        const listeners = this.listeners.get(event);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Error in event listener for ${event}:`, error);
                }
            });
        }
    }
}

// Create and export singleton instance
const realtimeDataService = new RealtimeDataService();

// Export for use in other modules
window.MagSpecKit = window.MagSpecKit || {};
window.MagSpecKit.RealtimeDataService = realtimeDataService;

export default realtimeDataService;

