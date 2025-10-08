/**
 * Projects Service
 * 项目服务 - 处理检测项目的CRUD操作
 * 
 * @module services/projects
 */

import supabaseClient from './supabase-client.js';

/**
 * Projects Service Class
 */
class ProjectsService {
    constructor() {
        this.currentProject = null;
        this.projects = [];
        this.projectListeners = [];
    }
    
    /**
     * Create a new project
     * @param {Object} projectData - Project data
     * @returns {Promise<Object>} Result object
     */
    async createProject(projectData) {
        try {
            console.log('📝 Creating new project...', projectData);
            
            const client = supabaseClient.getClient();
            if (!client) {
                throw new Error('Supabase client not initialized');
            }
            
            const { data, error } = await client
                .from('mag_projects')
                .insert([{
                    project_name: projectData.name,
                    description: projectData.description,
                    created_by: projectData.createdBy,
                }])
                .select()
                .single();
            
            if (error) throw error;
            
            console.log('✅ Project created:', data.id);
            
            // Refresh projects list
            await this.refreshProjects();
            
            return {
                success: true,
                project: data,
            };
            
        } catch (error) {
            console.error('❌ Failed to create project:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    
    /**
     * Get all projects with optional filters
     * @param {Object} filters - Filter options
     * @returns {Promise<Object>} Result object
     */
    async getProjects(filters = {}) {
        try {
            console.log('📋 Fetching projects...', filters);
            
            const client = supabaseClient.getClient();
            if (!client) {
                throw new Error('Supabase client not initialized');
            }
            
            let query = client
                .from('mag_projects')
                .select(`
                    *,
                    created_by_user:mag_users!mag_projects_created_by_fkey(full_name, email)
                `);
            
            // Apply filters
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            
            if (filters.createdBy) {
                query = query.eq('created_by', filters.createdBy);
            }
            
            if (filters.search) {
                query = query.or(`project_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
            }
            
            if (filters.dateFrom) {
                query = query.gte('created_at', filters.dateFrom);
            }
            
            if (filters.dateTo) {
                query = query.lte('created_at', filters.dateTo);
            }
            
            // Sorting
            const sortBy = filters.sortBy || 'created_at';
            const sortOrder = filters.sortOrder || 'desc';
            query = query.order(sortBy, { ascending: sortOrder === 'asc' });
            
            // Pagination
            if (filters.limit) {
                query = query.limit(filters.limit);
            }
            
            if (filters.offset) {
                query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
            }
            
            const { data, error, count } = await query;
            
            if (error) throw error;
            
            this.projects = data || [];
            console.log(`✅ Fetched ${this.projects.length} projects`);
            
            return {
                success: true,
                projects: this.projects,
                total: count,
            };
            
        } catch (error) {
            console.error('❌ Failed to fetch projects:', error);
            return {
                success: false,
                error: error.message,
                projects: [],
            };
        }
    }
    
    /**
     * Get project by ID
     * @param {string} projectId - Project ID
     * @returns {Promise<Object>} Result object
     */
    async getProjectById(projectId) {
        try {
            console.log('🔍 Fetching project:', projectId);
            
            const client = supabaseClient.getClient();
            if (!client) {
                throw new Error('Supabase client not initialized');
            }
            
            const { data, error } = await client
                .from('mag_projects')
                .select(`
                    *,
                    created_by_user:mag_users!mag_projects_created_by_fkey(full_name, email, role),
                    detection_count:mag_detection_data(count),
                    defect_count:mag_defects(count),
                    file_count:mag_files(count)
                `)
                .eq('id', projectId)
                .single();
            
            if (error) throw error;
            
            this.currentProject = data;
            console.log('✅ Project loaded:', data.project_name);
            
            return {
                success: true,
                project: data,
            };
            
        } catch (error) {
            console.error('❌ Failed to fetch project:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    
    /**
     * Update project
     * @param {string} projectId - Project ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Result object
     */
    async updateProject(projectId, updates) {
        try {
            console.log('✏️ Updating project:', projectId);
            
            const client = supabaseClient.getClient();
            if (!client) {
                throw new Error('Supabase client not initialized');
            }
            
            const { data, error } = await client
                .from('mag_projects')
                .update(updates)
                .eq('id', projectId)
                .select()
                .single();
            
            if (error) throw error;
            
            console.log('✅ Project updated:', projectId);
            
            // Refresh if it's the current project
            if (this.currentProject?.id === projectId) {
                this.currentProject = data;
            }
            
            // Refresh projects list
            await this.refreshProjects();
            
            return {
                success: true,
                project: data,
            };
            
        } catch (error) {
            console.error('❌ Failed to update project:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    
    /**
     * Delete project
     * @param {string} projectId - Project ID
     * @returns {Promise<Object>} Result object
     */
    async deleteProject(projectId) {
        try {
            console.log('🗑️ Deleting project:', projectId);
            
            const client = supabaseClient.getClient();
            if (!client) {
                throw new Error('Supabase client not initialized');
            }
            
            const { error } = await client
                .from('mag_projects')
                .delete()
                .eq('id', projectId);
            
            if (error) throw error;
            
            console.log('✅ Project deleted:', projectId);
            
            // Clear current project if it was deleted
            if (this.currentProject?.id === projectId) {
                this.currentProject = null;
            }
            
            // Refresh projects list
            await this.refreshProjects();
            
            return {
                success: true,
            };
            
        } catch (error) {
            console.error('❌ Failed to delete project:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
    
    /**
     * Get current project
     * @returns {Object|null}
     */
    getCurrentProject() {
        return this.currentProject;
    }
    
    /**
     * Set current project
     * @param {string} projectId - Project ID
     */
    async setCurrentProject(projectId) {
        const result = await this.getProjectById(projectId);
        if (result.success) {
            this.notifyProjectListeners('project_selected', this.currentProject);
        }
        return result;
    }
    
    /**
     * Clear current project
     */
    clearCurrentProject() {
        this.currentProject = null;
        this.notifyProjectListeners('project_cleared', null);
    }
    
    /**
     * Refresh projects list
     */
    async refreshProjects() {
        return this.getProjects({});
    }
    
    /**
     * Subscribe to project changes
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    onProjectChange(callback) {
        this.projectListeners.push(callback);
        
        return () => {
            const index = this.projectListeners.indexOf(callback);
            if (index > -1) {
                this.projectListeners.splice(index, 1);
            }
        };
    }
    
    /**
     * Notify project listeners
     * @param {string} event - Event type
     * @param {Object} project - Project object
     */
    notifyProjectListeners(event, project) {
        this.projectListeners.forEach(callback => {
            try {
                callback(event, project);
            } catch (error) {
                console.error('❌ Project listener error:', error);
            }
        });
    }
    
    /**
     * Get project statistics
     * @param {string} projectId - Project ID
     * @returns {Promise<Object>}
     */
    async getProjectStatistics(projectId) {
        try {
            const client = supabaseClient.getClient();
            if (!client) {
                throw new Error('Supabase client not initialized');
            }
            
            // Get counts from different tables
            const [detectionResult, defectResult, fileResult] = await Promise.all([
                client.from('mag_detection_data').select('count').eq('project_id', projectId),
                client.from('mag_defects').select('count').eq('project_id', projectId),
                client.from('mag_files').select('count').eq('project_id', projectId),
            ]);
            
            return {
                success: true,
                statistics: {
                    detectionCount: detectionResult.data?.[0]?.count || 0,
                    defectCount: defectResult.data?.[0]?.count || 0,
                    fileCount: fileResult.data?.[0]?.count || 0,
                },
            };
            
        } catch (error) {
            console.error('❌ Failed to get project statistics:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }
}

// Create and export singleton instance
const projectsService = new ProjectsService();

// Export for use in other modules
window.MagSpecKit = window.MagSpecKit || {};
window.MagSpecKit.ProjectsService = projectsService;

export default projectsService;

