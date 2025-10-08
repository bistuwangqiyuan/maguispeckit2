/**
 * Defect Marking Feature
 * 缺陷标注功能 - 在波形图上标记缺陷
 */

import defectsService from '../services/defects.js';

export class DefectMarking {
    constructor(chartInstance) {
        this.chart = chartInstance;
        this.marks = [];
        this.enabled = false;
    }
    
    /**
     * Enable defect marking mode
     */
    enable() {
        this.enabled = true;
        
        if (this.chart && this.chart.chart) {
            // Add click event listener to chart
            this.chart.chart.on('click', (params) => {
                this.handleChartClick(params);
            });
        }
        
        console.log('✅ Defect marking enabled');
        
        if (window.MagSpecKit?.UIHelpers) {
            window.MagSpecKit.UIHelpers.showNotification('缺陷标注模式已启用', 'info');
        }
    }
    
    /**
     * Disable defect marking mode
     */
    disable() {
        this.enabled = false;
        
        if (this.chart && this.chart.chart) {
            this.chart.chart.off('click');
        }
        
        console.log('⏸️ Defect marking disabled');
    }
    
    /**
     * Handle chart click event
     * @param {Object} params - ECharts click parameters
     */
    handleChartClick(params) {
        if (!this.enabled) return;
        
        console.log('📍 Chart clicked at:', params);
        
        // Get timestamp from click
        const timestamp = params.name;
        const value = params.value;
        
        // Show defect marking dialog
        this.showDefectDialog(timestamp, value, params);
    }
    
    /**
     * Show defect marking dialog
     * @param {string} timestamp - Timestamp of the mark
     * @param {number} value - Signal value at the mark
     * @param {Object} params - Chart click parameters
     */
    showDefectDialog(timestamp, value, params) {
        const dialogHTML = `
            <div class="space-y-4">
                <div>
                    <p class="text-sm text-gray-400 mb-2">位置信息:</p>
                    <p class="text-orange-500 font-mono">时间: ${timestamp} ms</p>
                    <p class="text-orange-500 font-mono">信号值: ${value?.toFixed(2) || 'N/A'} mV</p>
                </div>
                
                <div>
                    <label class="industrial-label">缺陷类型</label>
                    <select id="defect-type" class="industrial-input w-full">
                        <option value="crack">裂纹 (Crack)</option>
                        <option value="corrosion">腐蚀 (Corrosion)</option>
                        <option value="inclusion">夹杂物 (Inclusion)</option>
                        <option value="other">其他 (Other)</option>
                    </select>
                </div>
                
                <div>
                    <label class="industrial-label">严重程度</label>
                    <select id="defect-severity" class="industrial-input w-full">
                        <option value="minor">轻微 (Minor)</option>
                        <option value="moderate">中等 (Moderate)</option>
                        <option value="severe">严重 (Severe)</option>
                        <option value="critical">危急 (Critical)</option>
                    </select>
                </div>
                
                <div>
                    <label class="industrial-label">备注</label>
                    <textarea id="defect-notes" class="industrial-input w-full" rows="3" 
                              placeholder="输入缺陷描述..."></textarea>
                </div>
                
                <div class="flex gap-4">
                    <button id="btn-save-defect" class="btn-industrial flex-1 bg-orange-500 text-black">
                        保存标注
                    </button>
                    <button id="btn-cancel-defect" class="btn-industrial flex-1">
                        取消
                    </button>
                </div>
            </div>
        `;
        
        const modal = window.MagSpecKit?.UIHelpers?.showModal(dialogHTML, {
            title: '📍 标记缺陷',
            hideClose: true,
        });
        
        if (!modal) {
            console.error('Failed to show defect dialog');
            return;
        }
        
        // Attach button event listeners
        const btnSave = document.getElementById('btn-save-defect');
        const btnCancel = document.getElementById('btn-cancel-defect');
        
        if (btnSave) {
            btnSave.addEventListener('click', () => {
                this.saveDefectMark(timestamp, value, params, modal);
            });
        }
        
        if (btnCancel) {
            btnCancel.addEventListener('click', () => {
                modal.remove();
            });
        }
    }
    
    /**
     * Save defect mark
     * @param {string} timestamp - Timestamp
     * @param {number} value - Signal value
     * @param {Object} params - Chart parameters
     * @param {HTMLElement} modal - Modal element
     */
    async saveDefectMark(timestamp, value, params, modal) {
        try {
            // Get form values
            const type = document.getElementById('defect-type')?.value;
            const severity = document.getElementById('defect-severity')?.value;
            const notes = document.getElementById('defect-notes')?.value;
            
            // Validate
            if (!type || !severity) {
                if (window.MagSpecKit?.UIHelpers) {
                    window.MagSpecKit.UIHelpers.showNotification('请填写必填项', 'warning');
                }
                return;
            }
            
            console.log('💾 Saving defect mark:', { timestamp, type, severity });
            
            // Create mark data
            const markData = {
                timestamp,
                value,
                type,
                severity,
                notes,
                position: parseInt(timestamp) || 0,
            };
            
            // Add visual mark to chart
            this.addMarkToChart(markData);
            
            // Store in local array
            this.marks.push(markData);
            
            // Save to database (if project is selected)
            const currentProject = window.MagSpecKit?.ProjectsService?.getCurrentProject();
            
            if (currentProject) {
                const defectData = {
                    project_id: currentProject.id,
                    defect_type: type,
                    severity: severity,
                    position: parseInt(timestamp) || 0,
                    notes: notes || null,
                };
                
                const result = await defectsService.createDefect(defectData);
                
                if (result.success) {
                    console.log('✅ Defect saved to database:', result.defect);
                } else {
                    console.warn('⚠️ Failed to save defect to database:', result.error);
                }
            }
            
            // Close modal
            modal.remove();
            
            // Show success notification
            if (window.MagSpecKit?.UIHelpers) {
                window.MagSpecKit.UIHelpers.showNotification('缺陷标注已保存', 'success');
            }
            
        } catch (error) {
            console.error('❌ Error saving defect mark:', error);
            if (window.MagSpecKit?.UIHelpers) {
                window.MagSpecKit.UIHelpers.showNotification('保存失败: ' + error.message, 'error');
            }
        }
    }
    
    /**
     * Add visual mark to chart
     * @param {Object} markData - Mark data
     */
    addMarkToChart(markData) {
        if (!this.chart || !this.chart.chart) {
            console.error('Chart not available');
            return;
        }
        
        // Determine mark color based on severity
        const severityColors = {
            minor: '#F59E0B',      // Yellow
            moderate: '#FF6B35',   // Orange
            severe: '#EF4444',     // Red
            critical: '#DC2626',   // Dark Red
        };
        
        const color = severityColors[markData.severity] || '#EF4444';
        
        // Add mark line to chart
        const option = this.chart.chart.getOption();
        
        // Initialize markLine if not exists
        if (!option.series[0].markLine) {
            option.series[0].markLine = { data: [] };
        }
        
        // Add new mark
        option.series[0].markLine.data.push({
            name: markData.type,
            xAxis: markData.timestamp,
            lineStyle: {
                color: color,
                width: 2,
                type: 'solid',
            },
            label: {
                show: true,
                formatter: `{b}`,
                position: 'end',
                color: color,
                fontSize: 10,
            },
        });
        
        // Update chart
        this.chart.chart.setOption(option);
        
        console.log('✅ Mark added to chart');
    }
    
    /**
     * Get all marks
     * @returns {Array} Array of marks
     */
    getMarks() {
        return [...this.marks];
    }
    
    /**
     * Clear all marks
     */
    clearMarks() {
        this.marks = [];
        
        if (this.chart && this.chart.chart) {
            const option = this.chart.chart.getOption();
            if (option.series[0].markLine) {
                option.series[0].markLine.data = [];
                this.chart.chart.setOption(option);
            }
        }
        
        console.log('✅ All marks cleared');
        
        if (window.MagSpecKit?.UIHelpers) {
            window.MagSpecKit.UIHelpers.showNotification('所有标注已清除', 'info');
        }
    }
    
    /**
     * Load marks from database
     * @param {string} projectId - Project ID
     */
    async loadMarks(projectId) {
        try {
            console.log('📥 Loading defect marks for project:', projectId);
            
            const result = await defectsService.getDefects(projectId);
            
            if (result.success && result.defects) {
                result.defects.forEach(defect => {
                    const markData = {
                        timestamp: defect.position.toString(),
                        value: 0, // Not stored in database
                        type: defect.defect_type,
                        severity: defect.severity,
                        notes: defect.notes,
                        position: defect.position,
                    };
                    
                    this.addMarkToChart(markData);
                    this.marks.push(markData);
                });
                
                console.log(`✅ Loaded ${result.defects.length} defect marks`);
            }
            
        } catch (error) {
            console.error('❌ Failed to load defect marks:', error);
        }
    }
}

// Export for use in other modules
window.MagSpecKit = window.MagSpecKit || {};
window.MagSpecKit.DefectMarking = DefectMarking;

export default DefectMarking;

