/**
 * Data Simulator
 * 数据模拟器 - 生成模拟的磁信号数据（仅用于开发测试）
 */

export class DataSimulator {
    constructor() {
        this.time = 0;
        this.interval = null;
        this.isRunning = false;
        this.listeners = [];
        this.config = {
            frequency: 20, // Hz (数据生成频率)
            defectProbability: 0.02, // 2% 概率生成缺陷信号
            noiseLevel: 5, // 噪声幅度 (mV)
        };
    }
    
    /**
     * Start generating simulated data
     * @param {Function} callback - Callback function for new data
     */
    start(callback) {
        if (this.isRunning) {
            console.warn('⚠️ Simulator already running');
            return;
        }
        
        console.log('🎲 Starting data simulator...');
        this.isRunning = true;
        this.time = 0;
        
        // Register callback
        if (callback) {
            this.listeners.push(callback);
        }
        
        // Generate data at specified frequency
        const intervalMs = 1000 / this.config.frequency;
        
        this.interval = setInterval(() => {
            const data = this.generateDataPoint();
            this.notifyListeners(data);
        }, intervalMs);
        
        console.log(`✅ Simulator started at ${this.config.frequency} Hz`);
    }
    
    /**
     * Stop generating simulated data
     */
    stop() {
        if (!this.isRunning) {
            return;
        }
        
        console.log('⏹️ Stopping data simulator...');
        
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        
        this.isRunning = false;
        this.listeners = [];
        
        console.log('✅ Simulator stopped');
    }
    
    /**
     * Generate a single data point
     * @returns {Object} Simulated data point
     */
    generateDataPoint() {
        // Increment time
        this.time += 1000 / this.config.frequency;
        
        // Check if this should be a defect signal
        const isDefect = Math.random() < this.config.defectProbability;
        
        // Generate base signals (sine waves with different frequencies)
        let xSignal = Math.sin(this.time * 0.001) * 40;
        let ySignal = Math.cos(this.time * 0.0015) * 35;
        let zSignal = Math.sin(this.time * 0.0008) * 30;
        
        // Add defect anomaly if triggered
        if (isDefect) {
            const anomalyType = Math.random();
            const anomalyStrength = 50 + Math.random() * 50; // 50-100 mV
            
            if (anomalyType < 0.33) {
                // Sudden spike (crack)
                xSignal += anomalyStrength;
                ySignal += anomalyStrength * 0.7;
            } else if (anomalyType < 0.66) {
                // Sudden drop (corrosion)
                xSignal -= anomalyStrength;
                zSignal -= anomalyStrength * 0.8;
            } else {
                // Oscillation (inclusion)
                xSignal += Math.sin(this.time * 0.05) * anomalyStrength;
                ySignal += Math.cos(this.time * 0.05) * anomalyStrength;
            }
        }
        
        // Add random noise
        xSignal += (Math.random() - 0.5) * this.config.noiseLevel;
        ySignal += (Math.random() - 0.5) * this.config.noiseLevel;
        zSignal += (Math.random() - 0.5) * this.config.noiseLevel;
        
        // Create data point
        const dataPoint = {
            timestamp: Math.floor(this.time),
            position: (this.time / 100).toFixed(2), // Simulated position in meters
            signal: {
                x: xSignal,
                y: ySignal,
                z: zSignal,
            },
            defectDetected: isDefect,
            metadata: {
                simulat: true,
                defectType: isDefect ? this.getRandomDefectType() : null,
            },
        };
        
        return dataPoint;
    }
    
    /**
     * Get random defect type
     * @returns {string}
     */
    getRandomDefectType() {
        const types = ['crack', 'corrosion', 'inclusion', 'other'];
        return types[Math.floor(Math.random() * types.length)];
    }
    
    /**
     * Notify all registered listeners
     * @param {Object} data - Data point
     */
    notifyListeners(data) {
        this.listeners.forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                console.error('❌ Error in simulator listener:', error);
            }
        });
    }
    
    /**
     * Register a listener
     * @param {Function} callback - Callback function
     */
    on(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
        }
    }
    
    /**
     * Update simulator configuration
     * @param {Object} newConfig - New configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Restart if running
        if (this.isRunning) {
            const listeners = [...this.listeners];
            this.stop();
            this.start(listeners[0]);
        }
    }
    
    /**
     * Get current configuration
     * @returns {Object}
     */
    getConfig() {
        return { ...this.config };
    }
    
    /**
     * Check if running
     * @returns {boolean}
     */
    isActive() {
        return this.isRunning;
    }
}

// Check if in development mode
const isDevelopment = 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '';

// Auto-create simulator in development mode
let dataSimulator = null;

if (isDevelopment) {
    dataSimulator = new DataSimulator();
    console.log('🎲 Data simulator available in development mode');
} else {
    console.log('📡 Production mode - using real data');
}

// Export for use in other modules
window.MagSpecKit = window.MagSpecKit || {};
window.MagSpecKit.DataSimulator = dataSimulator || DataSimulator;

export default dataSimulator;

