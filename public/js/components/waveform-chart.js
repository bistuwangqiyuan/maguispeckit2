/**
 * Waveform Chart Component
 * 波形图表组件 - 使用ECharts显示实时磁信号
 */

export class WaveformChart {
    constructor(containerId) {
        this.containerId = containerId;
        this.chart = null;
        this.dataBuffer = [];
        this.maxDataPoints = 1000;
        this.isPlaying = false;
        this.updateInterval = null;
    }
    
    init() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Chart container ${this.containerId} not found`);
            return;
        }
        
        // Initialize ECharts
        this.chart = echarts.init(container, 'dark');
        
        // Set initial options
        this.setOptions();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.chart) {
                this.chart.resize();
            }
        });
        
        console.log('✅ Waveform chart initialized');
    }
    
    setOptions() {
        const option = {
            backgroundColor: '#000000',
            title: {
                text: '实时磁信号波形',
                left: 'center',
                top: 10,
                textStyle: {
                    color: '#FF6B35',
                    fontSize: 18,
                    fontWeight: 'bold',
                },
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(45, 45, 45, 0.9)',
                borderColor: '#FF6B35',
                borderWidth: 2,
                textStyle: {
                    color: '#E5E7EB',
                },
                formatter: (params) => {
                    let result = `时间: ${params[0].name}<br/>`;
                    params.forEach(param => {
                        result += `${param.seriesName}: ${param.value.toFixed(3)} mV<br/>`;
                    });
                    return result;
                },
            },
            legend: {
                data: ['X轴', 'Y轴', 'Z轴'],
                top: 40,
                right: 20,
                textStyle: {
                    color: '#A0A0A0',
                },
                selectedMode: 'multiple',
            },
            grid: {
                left: '8%',
                right: '5%',
                top: '20%',
                bottom: '15%',
                containLabel: true,
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                name: '时间 (ms)',
                nameLocation: 'middle',
                nameGap: 30,
                nameTextStyle: {
                    color: '#A0A0A0',
                    fontSize: 12,
                },
                axisLine: {
                    lineStyle: {
                        color: '#FF6B35',
                        width: 2,
                    },
                },
                axisTick: {
                    lineStyle: {
                        color: '#666',
                    },
                },
                axisLabel: {
                    color: '#A0A0A0',
                    formatter: (value) => {
                        return value;
                    },
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#333333',
                        type: 'dashed',
                    },
                },
                data: [],
            },
            yAxis: {
                type: 'value',
                name: '信号强度 (mV)',
                nameLocation: 'middle',
                nameGap: 50,
                nameTextStyle: {
                    color: '#A0A0A0',
                    fontSize: 12,
                },
                axisLine: {
                    lineStyle: {
                        color: '#FF6B35',
                        width: 2,
                    },
                },
                axisTick: {
                    lineStyle: {
                        color: '#666',
                    },
                },
                axisLabel: {
                    color: '#A0A0A0',
                    formatter: '{value}',
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#333333',
                        type: 'dashed',
                    },
                },
                min: -100,
                max: 100,
            },
            series: [
                {
                    name: 'X轴',
                    type: 'line',
                    data: [],
                    smooth: true,
                    symbol: 'none',
                    lineStyle: {
                        color: '#FF0000',
                        width: 2,
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(255, 0, 0, 0.3)' },
                            { offset: 1, color: 'rgba(255, 0, 0, 0.05)' },
                        ]),
                    },
                },
                {
                    name: 'Y轴',
                    type: 'line',
                    data: [],
                    smooth: true,
                    symbol: 'none',
                    lineStyle: {
                        color: '#00FF00',
                        width: 2,
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(0, 255, 0, 0.3)' },
                            { offset: 1, color: 'rgba(0, 255, 0, 0.05)' },
                        ]),
                    },
                },
                {
                    name: 'Z轴',
                    type: 'line',
                    data: [],
                    smooth: true,
                    symbol: 'none',
                    lineStyle: {
                        color: '#0066FF',
                        width: 2,
                    },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(0, 102, 255, 0.3)' },
                            { offset: 1, color: 'rgba(0, 102, 255, 0.05)' },
                        ]),
                    },
                },
            ],
        };
        
        this.chart.setOption(option);
    }
    
    // Update chart with new data
    updateData(timestamp, xValue, yValue, zValue) {
        this.dataBuffer.push({
            timestamp,
            x: xValue,
            y: yValue,
            z: zValue,
        });
        
        // Keep buffer size manageable
        if (this.dataBuffer.length > this.maxDataPoints) {
            this.dataBuffer.shift();
        }
        
        // Update chart
        this.render();
    }
    
    // Render chart with current buffer data
    render() {
        if (!this.chart) return;
        
        const timestamps = this.dataBuffer.map(d => d.timestamp);
        const xData = this.dataBuffer.map(d => d.x);
        const yData = this.dataBuffer.map(d => d.y);
        const zData = this.dataBuffer.map(d => d.z);
        
        this.chart.setOption({
            xAxis: {
                data: timestamps,
            },
            series: [
                { data: xData },
                { data: yData },
                { data: zData },
            ],
        });
    }
    
    // Start simulated data generation (for testing)
    startSimulation() {
        this.isPlaying = true;
        let time = 0;
        
        this.updateInterval = setInterval(() => {
            if (!this.isPlaying) return;
            
            // Generate simulated magnetic signal data
            const xValue = Math.sin(time * 0.1) * 50 + Math.random() * 10;
            const yValue = Math.cos(time * 0.15) * 40 + Math.random() * 8;
            const zValue = Math.sin(time * 0.08) * 30 + Math.random() * 6;
            
            this.updateData(time.toFixed(0), xValue, yValue, zValue);
            
            time += 10; // 10ms intervals
        }, 50); // Update every 50ms (20Hz)
    }
    
    // Stop simulation
    stopSimulation() {
        this.isPlaying = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    // Clear chart data
    clear() {
        this.dataBuffer = [];
        this.render();
    }
    
    // Resize chart
    resize() {
        if (this.chart) {
            this.chart.resize();
        }
    }
    
    // Destroy chart
    destroy() {
        this.stopSimulation();
        if (this.chart) {
            this.chart.dispose();
            this.chart = null;
        }
    }
}

// Export for use in other modules
window.MagSpecKit = window.MagSpecKit || {};
window.MagSpecKit.WaveformChart = WaveformChart;

export default WaveformChart;

