/**
 * Right Toolbar Component
 * 右侧快捷栏组件 - 快捷操作按钮
 */

export class RightToolbar {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.buttons = [
            {
                id: 'back',
                icon: 'back',
                label: '返回',
                title: '返回上一页',
            },
            {
                id: 'save',
                icon: 'save',
                label: '保存',
                title: '保存当前数据',
            },
            {
                id: 'menu',
                icon: 'menu',
                label: '菜单',
                title: '打开菜单',
            },
        ];
    }
    
    render() {
        if (!this.container) {
            console.error('Right toolbar container not found');
            return;
        }
        
        this.container.innerHTML = `
            <div class="flex flex-col items-center gap-4 py-6 h-full bg-industrial-dark-gray border-l-2 border-industrial-orange">
                ${this.buttons.map(button => this.renderButton(button)).join('')}
            </div>
        `;
        
        // Attach event listeners
        this.attachEventListeners();
    }
    
    renderButton(button) {
        let iconSvg = '';
        
        switch (button.icon) {
            case 'back':
                iconSvg = `
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                `;
                break;
            case 'save':
                iconSvg = `
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                    </svg>
                `;
                break;
            case 'menu':
                iconSvg = `
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                `;
                break;
        }
        
        return `
            <button 
                id="btn-${button.id}" 
                class="btn-industrial" 
                title="${button.title}"
                data-button-id="${button.id}">
                ${iconSvg}
                <span class="text-xs">${button.label}</span>
            </button>
        `;
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
        console.log(`Right toolbar button clicked: ${buttonId}`);
        
        // Emit event
        this.emitEvent('toolbar-click', { buttonId });
        
        // Handle specific button actions
        switch (buttonId) {
            case 'back':
                this.handleBackButton();
                break;
            case 'save':
                this.handleSaveButton();
                break;
            case 'menu':
                this.handleMenuButton();
                break;
        }
    }
    
    handleBackButton() {
        console.log('Navigate back');
        window.history.back();
    }
    
    handleSaveButton() {
        console.log('Save data');
        // TODO: Implement save functionality
        if (window.MagSpecKit?.UIHelpers) {
            window.MagSpecKit.UIHelpers.showNotification('数据已保存', 'success');
        }
    }
    
    handleMenuButton() {
        console.log('Open menu');
        // TODO: Implement menu panel
    }
    
    emitEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }
}

// Export for use in other modules
window.MagSpecKit = window.MagSpecKit || {};
window.MagSpecKit.RightToolbar = RightToolbar;

export default RightToolbar;

