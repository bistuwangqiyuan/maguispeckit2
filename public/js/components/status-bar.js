/**
 * Status Bar Component
 * 顶部状态栏组件 - 显示系统状态和实时信息
 */

export class StatusBar {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.clockInterval = null;
        this.statusData = {
            deviceName: 'DOPPLER NOVASCAN',
            connected: false,
            currentUser: null,
            currentProject: null,
            battery: 100,
            storage: 50,
        };
    }
    
    render() {
        if (!this.container) {
            console.error('Status bar container not found');
            return;
        }
        
        this.container.innerHTML = `
            <div class="flex items-center justify-between px-6 py-3 h-16 bg-industrial-gray border-b-2 border-industrial-orange">
                <!-- Left Section: Device Info -->
                <div class="flex items-center gap-6">
                    <div class="flex items-center gap-3">
                        <svg class="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 7H7v6h6V7z"/>
                            <path fill-rule="evenodd" d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z" clip-rule="evenodd"/>
                        </svg>
                        <h1 class="text-xl font-bold text-orange-500 tracking-wider">${this.statusData.deviceName}</h1>
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <span class="status-indicator ${this.statusData.connected ? 'connected' : 'disconnected'}"></span>
                        <span class="text-sm font-medium ${this.statusData.connected ? 'text-green-400' : 'text-red-400'}">
                            ${this.statusData.connected ? '在线' : '离线'}
                        </span>
                    </div>
                </div>
                
                <!-- Right Section: System Info -->
                <div class="flex items-center gap-8 text-sm">
                    <!-- Clock -->
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span class="text-gray-400">时间:</span>
                        <span id="status-clock" class="text-orange-500 font-mono font-bold">--:--:--</span>
                    </div>
                    
                    <!-- User -->
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                        </svg>
                        <span class="text-gray-400">用户:</span>
                        <span class="text-orange-500 font-medium">
                            ${this.statusData.currentUser || '未登录'}
                        </span>
                    </div>
                    
                    <!-- Project -->
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                        </svg>
                        <span class="text-gray-400">项目:</span>
                        <span class="text-orange-500 font-medium">
                            ${this.statusData.currentProject || '未选择'}
                        </span>
                    </div>
                    
                    <!-- Battery/Storage Indicators -->
                    <div class="flex items-center gap-4">
                        <!-- Storage -->
                        <div class="flex items-center gap-2" title="存储空间">
                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"/>
                            </svg>
                            <span class="text-xs text-gray-400">${this.statusData.storage}%</span>
                        </div>
                        
                        <!-- Battery -->
                        <div class="flex items-center gap-2" title="电池电量">
                            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                            <span class="text-xs text-gray-400">${this.statusData.battery}%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Start clock
        this.startClock();
    }
    
    startClock() {
        this.updateClock();
        this.clockInterval = setInterval(() => this.updateClock(), 1000);
    }
    
    updateClock() {
        const clockElement = document.getElementById('status-clock');
        if (clockElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('zh-CN', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            clockElement.textContent = timeString;
        }
    }
    
    updateStatus(updates) {
        this.statusData = { ...this.statusData, ...updates };
        this.render();
    }
    
    destroy() {
        if (this.clockInterval) {
            clearInterval(this.clockInterval);
        }
    }
}

// Export for use in other modules
window.MagSpecKit = window.MagSpecKit || {};
window.MagSpecKit.StatusBar = StatusBar;

export default StatusBar;

