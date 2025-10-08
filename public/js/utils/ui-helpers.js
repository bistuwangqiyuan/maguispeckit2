/**
 * UI Helpers
 * UI组件工具 - 通知、加载、对话框等
 */

// Show Notification
export function showNotification(message, type = 'info') {
    const colors = {
        info: 'bg-blue-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        error: 'bg-red-500',
    };
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Show Loading
export function showLoading(message = '加载中...') {
    let loader = document.getElementById('global-loader');
    
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
        loader.innerHTML = `
            <div class="bg-industrial-gray p-6 rounded-lg border-2 border-industrial-orange">
                <div class="spinner mb-4"></div>
                <p class="text-orange-500">${message}</p>
            </div>
        `;
        document.body.appendChild(loader);
    }
}

// Hide Loading
export function hideLoading() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.remove();
    }
}

// Show Confirm Dialog
export function showConfirm(message, onConfirm, onCancel = null) {
    const dialog = document.createElement('div');
    dialog.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-50';
    dialog.innerHTML = `
        <div class="bg-industrial-gray p-6 rounded-lg border-2 border-industrial-orange max-w-md">
            <p class="text-white mb-6">${message}</p>
            <div class="flex gap-4 justify-end">
                <button id="cancel-btn" class="btn-industrial px-4 py-2">取消</button>
                <button id="confirm-btn" class="btn-industrial px-4 py-2">确定</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    dialog.querySelector('#confirm-btn').addEventListener('click', () => {
        dialog.remove();
        if (onConfirm) onConfirm();
    });
    
    dialog.querySelector('#cancel-btn').addEventListener('click', () => {
        dialog.remove();
        if (onCancel) onCancel();
    });
}

// Show Modal
export function showModal(content, options = {}) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-industrial-gray p-6 rounded-lg border-2 border-industrial-orange max-w-2xl max-h-[80vh] overflow-auto">
            ${options.title ? `<h3 class="text-xl font-bold text-orange-500 mb-4">${options.title}</h3>` : ''}
            <div class="text-white">${content}</div>
            ${!options.hideClose ? '<button id="close-modal" class="btn-industrial mt-4">关闭</button>' : ''}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    if (!options.hideClose) {
        modal.querySelector('#close-modal').addEventListener('click', () => {
            modal.remove();
            if (options.onClose) options.onClose();
        });
    }
    
    return modal;
}

// Export all
window.MagSpecKit = window.MagSpecKit || {};
window.MagSpecKit.UIHelpers = {
    showNotification,
    showLoading,
    hideLoading,
    showConfirm,
    showModal,
};

