/**
 * Detection Data Service
 * 检测数据服务 - 处理实时数据采集和存储
 */

import supabaseClient from './supabase-client.js';

class DetectionDataService {
    constructor() {
        this.buffer = [];
        this.subscription = null;
    }
    
    async insertDetectionData(data) {
        try {
            const client = supabaseClient.getClient();
            if (!client) throw new Error('Supabase client not initialized');
            
            const { data: result, error } = await client
                .from('mag_detection_data')
                .insert([data])
                .select()
                .single();
            
            if (error) throw error;
            
            return { success: true, data: result };
        } catch (error) {
            console.error('❌ Insert detection data failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    async batchInsertDetectionData(dataArray) {
        try {
            const client = supabaseClient.getClient();
            if (!client) throw new Error('Supabase client not initialized');
            
            const { data, error } = await client
                .from('mag_detection_data')
                .insert(dataArray)
                .select();
            
            if (error) throw error;
            
            return { success: true, count: data.length };
        } catch (error) {
            console.error('❌ Batch insert failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    async getDetectionData(projectId, filters = {}) {
        try {
            const client = supabaseClient.getClient();
            if (!client) throw new Error('Supabase client not initialized');
            
            let query = client
                .from('mag_detection_data')
                .select('*')
                .eq('project_id', projectId);
            
            if (filters.limit) {
                query = query.limit(filters.limit);
            }
            
            query = query.order('timestamp', { ascending: false });
            
            const { data, error } = await query;
            
            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            console.error('❌ Get detection data failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    async subscribeToDetectionData(projectId, callback) {
        try {
            const client = supabaseClient.getClient();
            if (!client) throw new Error('Supabase client not initialized');
            
            this.subscription = client
                .channel(`project_${projectId}_detection`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'mag_detection_data',
                        filter: `project_id=eq.${projectId}`,
                    },
                    (payload) => {
                        callback(payload.new);
                    }
                )
                .subscribe();
            
            console.log('✅ Subscribed to realtime detection data');
            
            return () => this.unsubscribe();
        } catch (error) {
            console.error('❌ Subscribe failed:', error);
            return null;
        }
    }
    
    unsubscribe() {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
    }
}

const detectionDataService = new DetectionDataService();
window.MagSpecKit = window.MagSpecKit || {};
window.MagSpecKit.DetectionDataService = detectionDataService;
export default detectionDataService;

