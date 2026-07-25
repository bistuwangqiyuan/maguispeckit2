/**
 * Settings Page
 * 参数配置页面 - 处理检测参数和闸门设置
 */

export class SettingsPage {
    constructor() {
        this.settings = {
            detection: {
                samplingRate: 1000, // Hz
                sensitivity: 5, // 1-10
                filterMode: 'lowpass',
            },
            gate: {
                position: 0, // mm
                width: 100, // mm
                threshold: 50, // mV
            },
        };
        
        this.isDirty = false;
    }
    
    /**
     * Initialize settings page
     */
    init() {
        console.log('⚙️ Initializing settings page...');
        
        // Load saved settings from localStorage
        this.loadSettings();
        
        // Attach event listeners
        this.attachEventListeners();
        
        // Update UI with current settings
        this.updateUI();
        
        console.log('✅ Settings page initialized');
    }
    
    /**
     * Load settings from localStorage
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem('magspeckit_settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.settings = { ...this.settings, ...parsed };
                console.log('✅ Settings loaded from localStorage');
            }
        } catch (error) {
            console.error('❌ Failed to load settings:', error);
        }
    }
    
    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem('magspeckit_settings', JSON.stringify(this.settings));
            console.log('✅ Settings saved to localStorage');
            this.isDirty = false;
            
            // Show notification
            if (window.MagSpecKit?.UIHelpers) {
                window.MagSpecKit.UIHelpers.showNotification('配置已保存', 'success');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Failed to save settings:', error);
            if (window.MagSpecKit?.UIHelpers) {
                window.MagSpecKit.UIHelpers.showNotification('保存失败: ' + error.message, 'error');
            }
            return false;
        }
    }
    
    /**
     * Reset settings to default
     */
    resetSettings() {
        if (window.MagSpecKit?.UIHelpers) {
            window.MagSpecKit.UIHelpers.showConfirm(
                '确定要恢复默认设置吗？所有自定义配置将丢失。',
                () => {
                    this.settings = {
                        detection: {
                            samplingRate: 1000,
                            sensitivity: 5,
                            filterMode: 'lowpass',
                        },
                        gate: {
                            position: 0,
                            width: 100,
                            threshold: 50,
                        },
                    };
                    
                    this.saveSettings();
                    this.updateUI();
                    
                    if (window.MagSpecKit?.UIHelpers) {
                        window.MagSpecKit.UIHelpers.showNotification('已恢复默认设置', 'success');
                    }
                }
            );
        }
    }
    
    /**
     * Update UI with current settings
     */
    updateUI() {
        // Detection parameters
        const samplingRateInput = document.querySelector('#page-settings input[type="number"]');
        if (samplingRateInput) {
            samplingRateInput.value = this.settings.detection.samplingRate;
        }
        
        const sensitivitySlider = document.querySelector('#page-settings input[type="range"]');
        if (sensitivitySlider) {
            sensitivitySlider.value = this.settings.detection.sensitivity;
        }
        
        const filterModeSelect = document.querySelector('#page-settings select');
        if (filterModeSelect) {
            filterModeSelect.value = this.settings.detection.filterMode;
        }
        
        // Gate settings
        const inputs = document.querySelectorAll('#page-settings input[type="number"]');
        if (inputs.length >= 4) {
            inputs[1].value = this.settings.gate.position;
            inputs[2].value = this.settings.gate.width;
            inputs[3].value = this.settings.gate.threshold;
        }
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Get all input elements in settings page
        const settingsPage = document.getElementById('page-settings');
        if (!settingsPage) {
            console.warn('⚠️ Settings page not found');
            return;
        }
        
        // Sampling rate
        const samplingRateInput = settingsPage.querySelectorAll('input[type="number"]')[0];
        if (samplingRateInput) {
            samplingRateInput.addEventListener('change', (e) => {
                const value = parseInt(e.target.value);
                if (value >= 100 && value <= 10000) {
                    this.settings.detection.samplingRate = value;
                    this.isDirty = true;
                } else {
                    e.target.value = this.settings.detection.samplingRate;
                    if (window.MagSpecKit?.UIHelpers) {
                        window.MagSpecKit.UIHelpers.showNotification('采样率范围: 100-10000 Hz', 'warning');
                    }
                }
            });
        }
        
        // Sensitivity
        const sensitivitySlider = settingsPage.querySelector('input[type="range"]');
        if (sensitivitySlider) {
            sensitivitySlider.addEventListener('input', (e) => {
                this.settings.detection.sensitivity = parseInt(e.target.value);
                this.isDirty = true;
            });
        }
        
        // Filter mode
        const filterModeSelect = settingsPage.querySelector('select');
        if (filterModeSelect) {
            filterModeSelect.addEventListener('change', (e) => {
                this.settings.detection.filterMode = e.target.value;
                this.isDirty = true;
            });
        }
        
        // Gate settings
        const gateInputs = settingsPage.querySelectorAll('input[type="number"]');
        if (gateInputs.length >= 4) {
            // Gate position
            gateInputs[1].addEventListener('change', (e) => {
                this.settings.gate.position = parseFloat(e.target.value);
                this.isDirty = true;
            });
            
            // Gate width
            gateInputs[2].addEventListener('change', (e) => {
                this.settings.gate.width = parseFloat(e.target.value);
                this.isDirty = true;
            });
            
            // Gate threshold
            gateInputs[3].addEventListener('change', (e) => {
                this.settings.gate.threshold = parseFloat(e.target.value);
                this.isDirty = true;
            });
        }
        
        // Save button
        const saveBtn = settingsPage.querySelector('.btn-industrial.flex-1.bg-orange-500');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.handleSave();
            });
        }
        
        // Reset button
        const resetBtn = settingsPage.querySelectorAll('.btn-industrial.flex-1')[1];
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetSettings();
            });
        }
    }
    
    /**
     * Handle save button click
     */
    handleSave() {
        if (!this.isDirty) {
            if (window.MagSpecKit?.UIHelpers) {
                window.MagSpecKit.UIHelpers.showNotification('没有更改需要保存', 'info');
            }
            return;
        }
        
        // Validate settings
        const validation = this.validateSettings();
        if (!validation.valid) {
            if (window.MagSpecKit?.UIHelpers) {
                window.MagSpecKit.UIHelpers.showNotification('验证失败: ' + validation.error, 'error');
            }
            return;
        }
        
        // Save settings
        const success = this.saveSettings();
        
        if (success) {
            // Apply settings to active components
            this.applySettings();
        }
    }
    
    /**
     * Validate settings
     * @returns {Object} Validation result
     */
    validateSettings() {
        // Sampling rate
        if (this.settings.detection.samplingRate < 100 || this.settings.detection.samplingRate > 10000) {
            return { valid: false, error: '采样率必须在100-10000 Hz之间' };
        }
        
        // Sensitivity
        if (this.settings.detection.sensitivity < 1 || this.settings.detection.sensitivity > 10) {
            return { valid: false, error: '灵敏度必须在1-10之间' };
        }
        
        // Gate width
        if (this.settings.gate.width <= 0) {
            return { valid: false, error: '闸门宽度必须大于0' };
        }
        
        // Gate threshold
        if (this.settings.gate.threshold < 0) {
            return { valid: false, error: '阈值必须大于等于0' };
        }
        
        return { valid: true };
    }
    
    /**
     * Apply settings to active components
     */
    applySettings() {
        console.log('🔧 Applying settings to components...');
        
        // Apply to waveform chart if available
        if (window.MagSpecKit?.WaveformChart) {
            // Update sampling rate or other chart settings
            console.log('📊 Settings applied to waveform chart');
        }
        
        // Apply to data simulator if available
        if (window.MagSpecKit?.DataSimulator) {
            const simulator = window.MagSpecKit.DataSimulator;
            if (simulator && typeof simulator.updateConfig === 'function') {
                simulator.updateConfig({
                    frequency: this.settings.detection.samplingRate / 50, // Convert to update frequency
                });
                console.log('🎲 Settings applied to data simulator');
            }
        }
        
        // Emit settings change event
        const event = new CustomEvent('settings-changed', {
            detail: this.settings,
        });
        window.dispatchEvent(event);
        
        console.log('✅ Settings applied successfully');
    }
    
    /**
     * Get current settings
     * @returns {Object} Current settings
     */
    getSettings() {
        return { ...this.settings };
    }
    
    /**
     * Update specific setting
     * @param {string} path - Setting path (e.g., 'detection.samplingRate')
     * @param {*} value - New value
     */
    updateSetting(path, value) {
        const keys = path.split('.');
        let target = this.settings;
        
        for (let i = 0; i < keys.length - 1; i++) {
            target = target[keys[i]];
        }
        
        target[keys[keys.length - 1]] = value;
        this.isDirty = true;
    }
}

// Auto-initialize when settings page is active
let settingsPageInstance = null;

// Listen for page changes
window.addEventListener('page-change', (event) => {
    if (event.detail.pageId === 'settings') {
        if (!settingsPageInstance) {
            settingsPageInstance = new SettingsPage();
        }
        settingsPageInstance.init();
    }
});

// Export for use in other modules
window.MagSpecKit = window.MagSpecKit || {};
window.MagSpecKit.SettingsPage = SettingsPage;

export default SettingsPage;

