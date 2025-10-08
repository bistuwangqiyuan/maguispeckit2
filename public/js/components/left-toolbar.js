/**
 * Left Toolbar Component
 * 左侧工具栏组件 - 主要功能按钮
 */

export class LeftToolbar {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.buttons = [
            {
                id: 'play',
                icon: 'play',
                label: '播放',
                title: '开始/暂停数据采集',
                active: false,
            },
            {
                id: 'upload',
                icon: 'upload',
                label: '上传',
                title: '上传数据文件',
                active: false,
            },
            {
                id: 'disp',
                icon: 'text',
                label: 'DISP',
                title: '显示设置',
                active: false,
            },
            {
                id: 'main',
                icon: 'text',
                label: '主',
                title: '主控制面板',
                active: false,
            },
            {
                id: 'gate',
                icon: 'text',
                label: 'GATE',
                title: '闸门设置',
                active: false,
            },
            {
                id: 'vpa',
                icon: 'text',
                label: 'VPA',
                title: 'VPA模式',
                active: false,
            },
        ];
    }
    
    render() {
        if (!this.container) {
            console.error('Left toolbar container not found');
            return;
        }
        
        this.container.innerHTML = `
            <div class="flex flex-col items-center gap-4 py-6 h-full bg-industrial-dark-gray border-r-2 border-industrial-orange">
                ${this.buttons.map(button => this.renderButton(button)).join('')}
            </div>
        `;
        
        // Attach event listeners
        this.attachEventListeners();
    }
    
    renderButton(button) {
        const activeClass = button.active ? 'bg-orange-500 text-black' : '';
        
        if (button.icon === 'play') {
            return `
                <button 
                    id="btn-${button.id}" 
                    class="btn-industrial ${activeClass}" 
                    title="${button.title}"
                    data-button-id="${button.id}">
                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                    </svg>
                    <span class="text-xs">${button.label}</span>
                </button>
            `;
        } else if (button.icon === 'upload') {
            return `
                <button 
                    id="btn-${button.id}" 
                    class="btn-industrial ${activeClass}" 
                    title="${button.title}"
                    data-button-id="${button.id}">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                    </svg>
                    <span class="text-xs">${button.label}</span>
                </button>
            `;
        } else {
            return `
                <button 
                    id="btn-${button.id}" 
                    class="btn-industrial ${activeClass}" 
                    title="${button.title}"
                    data-button-id="${button.id}">
                    <span class="text-sm font-bold">${button.label}</span>
                </button>
            `;
        }
    }
    
    attachEventListeners() {
        this.buttons.forEach(button => {
            const btnElement = document.getElementById(`btn-${button.id}`);
            if (btnElement) {
                btnElement.addEventListener('click', () => this.handleButtonClick(button.id));
            }
        });
    }
    
    handleButtonClick(buttonId) {
        console.log(`Left toolbar button clicked: ${buttonId}`);
        
        // Toggle active state
        const button = this.buttons.find(b => b.id === buttonId);
        if (button) {
            button.active = !button.active;
            this.render();
        }
        
        // Emit event
        this.emitEvent('toolbar-click', { buttonId, button });
        
        // Handle specific button actions
        switch (buttonId) {
            case 'play':
                this.handlePlayButton();
                break;
            case 'upload':
                this.handleUploadButton();
                break;
            case 'disp':
                this.handleDispButton();
                break;
            case 'main':
                this.handleMainButton();
                break;
            case 'gate':
                this.handleGateButton();
                break;
            case 'vpa':
                this.handleVpaButton();
                break;
        }
    }
    
    handlePlayButton() {
        console.log('Play/Pause data acquisition');
        // TODO: Implement data acquisition start/stop
    }
    
    handleUploadButton() {
        console.log('Upload file');
        // TODO: Implement file upload dialog
    }
    
    handleDispButton() {
        console.log('Display settings');
        // TODO: Implement display settings panel
    }
    
    handleMainButton() {
        console.log('Main control panel');
        // TODO: Implement main control panel
    }
    
    handleGateButton() {
        console.log('Gate settings');
        // TODO: Implement gate settings panel
    }
    
    handleVpaButton() {
        console.log('VPA mode');
        // TODO: Implement VPA mode
    }
    
    emitEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }
}

// Export for use in other modules
window.MagSpecKit = window.MagSpecKit || {};
window.MagSpecKit.LeftToolbar = LeftToolbar;

export default LeftToolbar;

