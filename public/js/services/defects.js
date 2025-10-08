/**
 * Defects Service
 * 缺陷服务 - 处理缺陷记录的CRUD操作
 */

import supabaseClient from './supabase-client.js';

class DefectsService {
    async createDefect(defectData) {
        try {
            const client = supabaseClient.getClient();
            if (!client) throw new Error('Supabase client not initialized');
            
            const { data, error } = await client
                .from('mag_defects')
                .insert([defectData])
                .select()
                .single();
            
            if (error) throw error;
            
            return { success: true, defect: data };
        } catch (error) {
            console.error('❌ Create defect failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    async getDefects(projectId) {
        try {
            const client = supabaseClient.getClient();
            if (!client) throw new Error('Supabase client not initialized');
            
            const { data, error } = await client
                .from('mag_defects')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            return { success: true, defects: data };
        } catch (error) {
            console.error('❌ Get defects failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    async updateDefect(id, updates) {
        try {
            const client = supabaseClient.getClient();
            if (!client) throw new Error('Supabase client not initialized');
            
            const { data, error } = await client
                .from('mag_defects')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            
            return { success: true, defect: data };
        } catch (error) {
            console.error('❌ Update defect failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    async deleteDefect(id) {
        try {
            const client = supabaseClient.getClient();
            if (!client) throw new Error('Supabase client not initialized');
            
            const { error } = await client
                .from('mag_defects')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            return { success: true };
        } catch (error) {
            console.error('❌ Delete defect failed:', error);
            return { success: false, error: error.message };
        }
    }
}

const defectsService = new DefectsService();
window.MagSpecKit = window.MagSpecKit || {};
window.MagSpecKit.DefectsService = defectsService;
export default defectsService;

