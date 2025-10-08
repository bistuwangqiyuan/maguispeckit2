/**
 * Waveform Controls Component
 * 波形控制面板 - 控制波形显示参数
 */

export class WaveformControls {
    constructor(containerId, chartInstance) {
        this.containerId = containerId;
        this.chart = chartInstance;
        this.settings = {
            playing: false,
            timeScale: 1000, // ms
            amplitudeScale: 100, // mV
            visibleChannels: {
                x: true,
                y: true,
                z: true,
            },
        };
    }
    
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error('Waveform controls container not found');
            return;
        }
        
        container.innerHTML = `
            <div class="flex flex-wrap items-center gap-4 p-4 bg-industrial-gray border-2 border-industrial-orange rounded-lg">
                <!-- Play/Pause Controls -->
                <div class="flex items-center gap-2">
                    <button id="btn-play-pause" class="btn-control ${this.settings.playing ? 'bg-orange-500' : ''}">
                        ${this.settings.playing ? '⏸' : '▶'} ${this.settings.playing ? '暂停' : '播放'}
                    </button>
                    <button id="btn-clear" class="btn-control">🗑️ 清除</button>
                    <button id="btn-screenshot" class="btn-control">📷 截图</button>
                </div>
                
                <!-- Time Scale -->
                <div class="flex items-center gap-2">
                    <label class="text-sm text-gray-400">时间轴:</label>
                    <select id="select-time-scale" class="industrial-input text-sm">
                        <option value="1000" ${this.settings.timeScale === 1000 ? 'selected' : ''}>1秒</option>
                        <option value="5000" ${this.settings.timeScale === 5000 ? 'selected' : ''}>5秒</option>
                        <option value="10000" ${this.settings.timeScale === 10000 ? 'selected' : ''}>10秒</option>
                        <option value="30000" ${this.settings.timeScale === 30000 ? 'selected' : ''}>30秒</option>
                    </select>
                </div>
                
                <!-- Amplitude Scale -->
                <div class="flex items-center gap-2">
                    <label class="text-sm text-gray-400">幅值:</label>
                    <select id="select-amplitude-scale" class="industrial-input text-sm">
                        <option value="10" ${this.settings.amplitudeScale === 10 ? 'selected' : ''}>±10 mV</option>
                        <option value="50" ${this.settings.amplitudeScale === 50 ? 'selected' : ''}>±50 mV</option>
                        <option value="100" ${this.settings.amplitudeScale === 100 ? 'selected' : ''}>±100 mV</option>
                        <option value="200" ${this.settings.amplitudeScale === 200 ? 'selected' : ''}>±200 mV</option>
                    </select>
                </div>
                
                <!-- Channel Visibility -->
                <div class="flex items-center gap-3">
                    <label class="text-sm text-gray-400">通道:</label>
                    <label class="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" id="cb-channel-x" ${this.settings.visibleChannels.x ? 'checked' : ''} 
                               class="form-checkbox text-red-500">
                        <span class="text-sm text-red-500">X</span>
                    </label>
                    <label class="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" id="cb-channel-y" ${this.settings.visibleChannels.y ? 'checked' : ''} 
                               class="form-checkbox text-green-500">
                        <span class="text-sm text-green-500">Y</span>
                    </label>
                    <label class="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" id="cb-channel-z" ${this.settings.visibleChannels.z ? 'checked' : ''} 
                               class="form-checkbox text-blue-500">
                        <span class="text-sm text-blue-500">Z</span>
                    </label>
                </div>
                
                <!-- Export Options -->
                <div class="flex items-center gap-2 ml-auto">
                    <button id="btn-export-png" class="btn-control">导出PNG</button>
                    <button id="btn-export-csv" class="btn-control">导出CSV</button>
                </div>
            </div>
        `;
        
        // Attach event listeners
        this.attachEventListeners();
    }
    
    attachEventListeners() {
        // Play/Pause
        const btnPlayPause = document.getElementById('btn-play-pause');
        if (btnPlayPause) {
            btnPlayPause.addEventListener('click', () => this.togglePlayPause());
        }
        
        // Clear
        const btnClear = document.getElementById('btn-clear');
        if (btnClear) {
            btnClear.addEventListener('click', () => this.clearWaveform());
        }
        
        // Screenshot
        const btnScreenshot = document.getElementById('btn-screenshot');
        if (btnScreenshot) {
            btnScreenshot.addEventListener('click', () => this.takeScreenshot());
        }
        
        // Time Scale
        const selectTimeScale = document.getElementById('select-time-scale');
        if (selectTimeScale) {
            selectTimeScale.addEventListener('change', (e) => {
                this.settings.timeScale = parseInt(e.target.value);
                this.applyTimeScale();
            });
        }
        
        // Amplitude Scale
        const selectAmplitudeScale = document.getElementById('select-amplitude-scale');
        if (selectAmplitudeScale) {
            selectAmplitudeScale.addEventListener('change', (e) => {
                this.settings.amplitudeScale = parseInt(e.target.value);
                this.applyAmplitudeScale();
            });
        }
        
        // Channel checkboxes
        ['x', 'y', 'z'].forEach(channel => {
            const checkbox = document.getElementById(`cb-channel-${channel}`);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.settings.visibleChannels[channel] = e.target.checked;
                    this.toggleChannel(channel, e.target.checked);
                });
            }
        });
        
        // Export buttons
        const btnExportPng = document.getElementById('btn-export-png');
        if (btnExportPng) {
            btnExportPng.addEventListener('click', () => this.exportPNG());
        }
        
        const btnExportCsv = document.getElementById('btn-export-csv');
        if (btnExportCsv) {
            btnExportCsv.addEventListener('click', () => this.exportCSV());
        }
    }
    
    togglePlayPause() {
        this.settings.playing = !this.settings.playing;
        
        if (this.chart) {
            if (this.settings.playing) {
                this.chart.startSimulation();
            } else {
                this.chart.stopSimulation();
            }
        }
        
        this.render();
        
        if (window.MagSpecKit?.UIHelpers) {
            const message = this.settings.playing ? '数据采集已启动' : '数据采集已暂停';
            window.MagSpecKit.UIHelpers.showNotification(message, 'info');
        }
    }
    
    clearWaveform() {
        if (this.chart) {
            this.chart.clear();
        }
        
        if (window.MagSpecKit?.UIHelpers) {
            window.MagSpecKit.UIHelpers.showNotification('波形已清除', 'success');
        }
    }
    
    takeScreenshot() {
        if (!this.chart || !this.chart.chart) {
            console.error('Chart not available');
            return;
        }
        
        const dataURL = this.chart.chart.getDataURL({
            type: 'png',
            pixelRatio: 2,
            backgroundColor: '#000000',
        });
        
        // Create download link
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `waveform_${Date.now()}.png`;
        link.click();
        
        if (window.MagSpecKit?.UIHelpers) {
            window.MagSpecKit.UIHelpers.showNotification('截图已保存', 'success');
        }
    }
    
    applyTimeScale() {
        console.log('⏱️ Time scale changed to:', this.settings.timeScale, 'ms');
        
        // Update chart max data points based on time scale
        if (this.chart) {
            // Assuming 50ms update interval (20Hz)
            const maxPoints = Math.floor(this.settings.timeScale / 50);
            this.chart.maxDataPoints = maxPoints;
        }
        
        if (window.MagSpecKit?.UIHelpers) {
            window.MagSpecKit.UIHelpers.showNotification(`时间轴: ${this.settings.timeScale/1000}秒`, 'info');
        }
    }
    
    applyAmplitudeScale() {
        console.log('📊 Amplitude scale changed to:', this.settings.amplitudeScale, 'mV');
        
        // Update chart Y-axis range
        if (this.chart && this.chart.chart) {
            this.chart.chart.setOption({
                yAxis: {
                    min: -this.settings.amplitudeScale,
                    max: this.settings.amplitudeScale,
                },
            });
        }
        
        if (window.MagSpecKit?.UIHelpers) {
            window.MagSpecKit.UIHelpers.showNotification(`幅值: ±${this.settings.amplitudeScale} mV`, 'info');
        }
    }
    
    toggleChannel(channel, visible) {
        console.log(`🔄 Channel ${channel.toUpperCase()} ${visible ? 'shown' : 'hidden'}`);
        
        if (this.chart && this.chart.chart) {
            const seriesIndex = { x: 0, y: 1, z: 2 }[channel];
            
            this.chart.chart.dispatchAction({
                type: visible ? 'legendSelect' : 'legendUnSelect',
                name: `${channel.toUpperCase()}轴`,
            });
        }
    }
    
    exportPNG() {
        this.takeScreenshot();
    }
    
    exportCSV() {
        if (!this.chart || !this.chart.dataBuffer) {
            console.error('No data to export');
            if (window.MagSpecKit?.UIHelpers) {
                window.MagSpecKit.UIHelpers.showNotification('没有数据可导出', 'warning');
            }
            return;
        }
        
        // Generate CSV content
        let csv = 'Timestamp,X(mV),Y(mV),Z(mV)\n';
        
        this.chart.dataBuffer.forEach(data => {
            csv += `${data.timestamp},${data.x.toFixed(3)},${data.y.toFixed(3)},${data.z.toFixed(3)}\n`;
        });
        
        // Create blob and download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.href = url;
        link.download = `waveform_data_${Date.now()}.csv`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        if (window.MagSpecKit?.UIHelpers) {
            window.MagSpecKit.UIHelpers.showNotification('CSV已导出', 'success');
        }
    }
    
    getSettings() {
        return { ...this.settings };
    }
    
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.render();
    }
}

// Add button control styles to CSS
const style = document.createElement('style');
style.textContent = `
    .btn-control {
        padding: 0.5rem 1rem;
        background-color: var(--color-dark-gray);
        border: 2px solid var(--color-light-gray);
        color: var(--color-light-gray);
        border-radius: 0.375rem;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.875rem;
        font-weight: 600;
        white-space: nowrap;
    }
    
    .btn-control:hover {
        border-color: var(--color-orange);
        background-color: #3A3A3A;
    }
    
    .btn-control.bg-orange-500 {
        background-color: var(--color-orange);
        border-color: var(--color-orange);
        color: #000000;
    }
`;
document.head.appendChild(style);

// Export for use in other modules
window.MagSpecKit = window.MagSpecKit || {};
window.MagSpecKit.WaveformControls = WaveformControls;

export default WaveformControls;

