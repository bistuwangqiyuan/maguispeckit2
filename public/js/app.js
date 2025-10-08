/**
 * MagSpecKit Main Application
 * 主应用程序 - 初始化和协调所有组件
 */

// Import components
import { StatusBar } from './components/status-bar.js';
import { LeftToolbar } from './components/left-toolbar.js';
import { RightToolbar } from './components/right-toolbar.js';
import { BottomNav } from './components/bottom-nav.js';
import { WaveformChart } from './components/waveform-chart.js';
import { WaveformControls } from './components/waveform-controls.js';

// Import services
import supabaseClient from './services/supabase-client.js';
import authService from './services/auth.js';
import projectsService from './services/projects.js';
import realtimeDataService from './services/realtime-data.js';

// Import utilities
import './utils/constants.js';
import './utils/helpers.js';
import './utils/data-processor.js';
import './utils/ui-helpers.js';
import './utils/data-simulator.js';

// Import features
import './features/defect-marking.js';

/**
 * Main Application Class
 */
class MagSpecKitApp {
    constructor() {
        this.components = {};
        this.currentPage = 'waveform';
        this.isInitialized = false;
    }
    
    /**
     * Initialize application
     */
    async init() {
        try {
            console.log('🚀 Initializing MagSpecKit Application...');
            
            // Show loading
            this.showLoading();
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Initialize components
            await this.initializeComponents();
            
            // Initialize services
            await this.initializeServices();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Hide loading
            this.hideLoading();
            
            this.isInitialized = true;
            console.log('✅ MagSpecKit Application initialized successfully');
            
            // Show welcome message
            if (window.MagSpecKit?.UIHelpers) {
                window.MagSpecKit.UIHelpers.showNotification('系统已启动', 'success');
            }
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.hideLoading();
            alert('系统初始化失败: ' + error.message);
        }
    }
    
    /**
     * Initialize UI components
     */
    async initializeComponents() {
        console.log('📦 Initializing UI components...');
        
        // Status Bar
        this.components.statusBar = new StatusBar('status-bar');
        this.components.statusBar.render();
        
        // Left Toolbar
        this.components.leftToolbar = new LeftToolbar('left-toolbar');
        this.components.leftToolbar.render();
        
        // Right Toolbar
        this.components.rightToolbar = new RightToolbar('right-toolbar');
        this.components.rightToolbar.render();
        
        // Bottom Navigation
        this.components.bottomNav = new BottomNav('bottom-nav');
        this.components.bottomNav.render();
        
        // Waveform Chart
        this.components.waveformChart = new WaveformChart('waveform-chart');
        this.components.waveformChart.init();
        
        console.log('✅ UI components initialized');
    }
    
    /**
     * Initialize backend services
     */
    async initializeServices() {
        console.log('🔌 Initializing services...');
        
        // Supabase client should auto-initialize
        // Wait a moment for it to complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const status = supabaseClient.getStatus();
        console.log('Supabase status:', status);
        
        if (!status.connected) {
            console.warn('⚠️ Supabase not connected, will retry...');
            try {
                await supabaseClient.initialize();
            } catch (error) {
                console.error('Failed to connect to Supabase:', error);
            }
        }
        
        console.log('✅ Services initialized');
    }
    
    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        console.log('🎧 Setting up event listeners...');
        
        // Listen for page changes
        window.addEventListener('page-change', (event) => {
            this.handlePageChange(event.detail.pageId);
        });
        
        // Listen for toolbar clicks
        window.addEventListener('toolbar-click', (event) => {
            this.handleToolbarClick(event.detail);
        });
        
        // Listen for auth state changes
        authService.onAuthStateChange((event, user) => {
            this.handleAuthStateChange(event, user);
        });
        
        // Listen for project selection
        projectsService.onProjectChange((event, project) => {
            this.handleProjectChange(event, project);
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.components.waveformChart) {
                this.components.waveformChart.resize();
            }
        });
        
        console.log('✅ Event listeners set up');
    }
    
    /**
     * Handle page navigation
     */
    handlePageChange(pageId) {
        console.log('📄 Changing page to:', pageId);
        
        // Hide all pages
        const pages = ['waveform', 'data', 'defects', 'settings', 'reports'];
        pages.forEach(page => {
            const pageElement = document.getElementById(`page-${page}`);
            if (pageElement) {
                pageElement.classList.add('hidden');
            }
        });
        
        // Show selected page
        const targetPage = document.getElementById(`page-${pageId}`);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            this.currentPage = pageId;
        }
        
        // Handle page-specific actions
        if (pageId === 'waveform' && this.components.waveformChart) {
            this.components.waveformChart.resize();
        }
    }
    
    /**
     * Handle toolbar button clicks
     */
    handleToolbarClick(detail) {
        console.log('🔘 Toolbar clicked:', detail);
        
        const { buttonId } = detail;
        
        // Handle specific button actions
        switch (buttonId) {
            case 'play':
                this.toggleDataAcquisition();
                break;
            case 'upload':
                this.handleFileUpload();
                break;
            case 'save':
                this.handleSave();
                break;
            // Add more handlers as needed
        }
    }
    
    /**
     * Toggle data acquisition (play/pause)
     */
    toggleDataAcquisition() {
        if (this.components.waveformChart) {
            if (this.components.waveformChart.isPlaying) {
                this.components.waveformChart.stopSimulation();
                console.log('⏸️ Data acquisition paused');
                if (window.MagSpecKit?.UIHelpers) {
                    window.MagSpecKit.UIHelpers.showNotification('数据采集已暂停', 'info');
                }
            } else {
                this.components.waveformChart.startSimulation();
                console.log('▶️ Data acquisition started');
                if (window.MagSpecKit?.UIHelpers) {
                    window.MagSpecKit.UIHelpers.showNotification('数据采集已启动', 'success');
                }
            }
        }
    }
    
    /**
     * Handle file upload
     */
    handleFileUpload() {
        console.log('📤 Opening file upload dialog...');
        // TODO: Implement file upload functionality
        if (window.MagSpecKit?.UIHelpers) {
            window.MagSpecKit.UIHelpers.showNotification('文件上传功能开发中', 'info');
        }
    }
    
    /**
     * Handle save action
     */
    handleSave() {
        console.log('💾 Saving data...');
        // TODO: Implement save functionality
        if (window.MagSpecKit?.UIHelpers) {
            window.MagSpecKit.UIHelpers.showNotification('数据已保存', 'success');
        }
    }
    
    /**
     * Handle authentication state changes
     */
    handleAuthStateChange(event, user) {
        console.log('🔐 Auth state changed:', event, user);
        
        // Update status bar with user info
        if (this.components.statusBar) {
            this.components.statusBar.updateStatus({
                currentUser: user?.email || '未登录',
            });
        }
    }
    
    /**
     * Handle project selection
     */
    handleProjectChange(event, project) {
        console.log('📁 Project changed:', event, project);
        
        // Update status bar with project info
        if (this.components.statusBar) {
            this.components.statusBar.updateStatus({
                currentProject: project?.project_name || '未选择',
            });
        }
    }
    
    /**
     * Show loading indicator
     */
    showLoading() {
        const loader = document.createElement('div');
        loader.id = 'app-loader';
        loader.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
        loader.innerHTML = `
            <div class="text-center">
                <div class="spinner mb-4"></div>
                <p class="text-orange-500 text-lg font-bold">正在初始化系统...</p>
            </div>
        `;
        document.body.appendChild(loader);
    }
    
    /**
     * Hide loading indicator
     */
    hideLoading() {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.remove();
        }
    }
    
    /**
     * Cleanup and destroy application
     */
    destroy() {
        console.log('🧹 Cleaning up application...');
        
        // Destroy components
        if (this.components.statusBar) {
            this.components.statusBar.destroy();
        }
        if (this.components.waveformChart) {
            this.components.waveformChart.destroy();
        }
        
        // Disconnect services
        supabaseClient.disconnect();
        
        console.log('✅ Application cleaned up');
    }
}

// Create and initialize application
const app = new MagSpecKitApp();

// Initialize when script loads
app.init().catch(error => {
    console.error('Failed to start application:', error);
});

// Export for debugging
window.MagSpecKitApp = app;

// Handle page unload
window.addEventListener('beforeunload', () => {
    app.destroy();
});

console.log('📱 MagSpecKit application loaded');
