/**
 * Bottom Navigation Component
 * 底部导航栏组件 - 页面导航和快捷信息
 */

export class BottomNav {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentPage = 'waveform';
        this.pages = [
            { id: 'waveform', label: '波形显示', icon: 'chart' },
            { id: 'data', label: '数据列表', icon: 'table' },
            { id: 'defects', label: '缺陷记录', icon: 'warning' },
            { id: 'settings', label: '参数配置', icon: 'settings' },
            { id: 'reports', label: '报告生成', icon: 'document' },
        ];
    }
    
    render() {
        if (!this.container) {
            console.error('Bottom nav container not found');
            return;
        }
        
        this.container.innerHTML = `
            <div class="flex items-center justify-between px-6 py-3 h-14 bg-industrial-dark-gray border-t-2 border-industrial-orange">
                <!-- Page Navigation Tabs -->
                <div class="flex items-center gap-2">
                    ${this.pages.map(page => this.renderTab(page)).join('')}
                </div>
                
                <!-- Status Info -->
                <div class="flex items-center gap-6 text-xs text-gray-400">
                    <span>数据点: <span class="text-orange-500 font-mono">0</span></span>
                    <span>采样率: <span class="text-orange-500 font-mono">1000 Hz</span></span>
                    <span>缺陷数: <span class="text-orange-500 font-mono">0</span></span>
                    <span class="text-gray-500">© 2025 MagSpecKit</span>
                </div>
            </div>
        `;
        
        // Attach event listeners
        this.attachEventListeners();
    }
    
    renderTab(page) {
        const activeClass = this.currentPage === page.id 
            ? 'bg-orange-500 text-black border-orange-500' 
            : 'bg-industrial-gray text-gray-300 border-gray-600 hover:border-orange-500';
        
        return `
            <button 
                id="nav-${page.id}" 
                class="nav-tab ${activeClass}"
                data-page-id="${page.id}">
                ${this.getIcon(page.icon)}
                <span class="text-xs font-medium">${page.label}</span>
            </button>
        `;
    }
    
    getIcon(iconType) {
        const icons = {
            chart: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
            </svg>`,
            table: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>`,
            warning: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>`,
            settings: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>`,
            document: `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>`,
        };
        return icons[iconType] || '';
    }
    
    attachEventListeners() {
        this.pages.forEach(page => {
            const tabElement = document.getElementById(`nav-${page.id}`);
            if (tabElement) {
                tabElement.addEventListener('click', () => this.handleTabClick(page.id));
            }
        });
    }
    
    handleTabClick(pageId) {
        console.log(`Page navigation: ${pageId}`);
        
        this.currentPage = pageId;
        this.render();
        
        // Emit event
        this.emitEvent('page-change', { pageId });
        
        // Update main content area
        this.updateMainContent(pageId);
    }
    
    updateMainContent(pageId) {
        // This will be handled by the main app controller
        console.log(`Switching to page: ${pageId}`);
    }
    
    emitEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }
    
    setActivePage(pageId) {
        this.currentPage = pageId;
        this.render();
    }
}

// Export for use in other modules
window.MagSpecKit = window.MagSpecKit || {};
window.MagSpecKit.BottomNav = BottomNav;

export default BottomNav;

