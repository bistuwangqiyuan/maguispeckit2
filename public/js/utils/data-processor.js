/**
 * Data Processor
 * 数据处理工具 - 信号处理和统计计算
 */

// Filter Signal (Simple Low-pass)
export function filterSignal(rawData, filterType = 'lowpass') {
    if (!Array.isArray(rawData) || rawData.length === 0) return rawData;
    
    if (filterType === 'lowpass') {
        // Simple moving average
        const windowSize = 5;
        const filtered = [];
        
        for (let i = 0; i < rawData.length; i++) {
            const start = Math.max(0, i - Math.floor(windowSize / 2));
            const end = Math.min(rawData.length, i + Math.ceil(windowSize / 2));
            const window = rawData.slice(start, end);
            const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
            filtered.push(avg);
        }
        
        return filtered;
    }
    
    return rawData;
}

// Normalize Signal
export function normalizeSignal(data) {
    if (!Array.isArray(data) || data.length === 0) return data;
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;
    
    if (range === 0) return data;
    
    return data.map(val => (val - min) / range);
}

// Detect Peaks
export function detectPeaks(signal, threshold = 0.5) {
    const peaks = [];
    
    for (let i = 1; i < signal.length - 1; i++) {
        if (signal[i] > threshold && 
            signal[i] > signal[i - 1] && 
            signal[i] > signal[i + 1]) {
            peaks.push({ index: i, value: signal[i] });
        }
    }
    
    return peaks;
}

// Calculate Statistics
export function calculateStats(data) {
    if (!Array.isArray(data) || data.length === 0) {
        return { mean: 0, variance: 0, stdDev: 0, min: 0, max: 0 };
    }
    
    const n = data.length;
    const mean = data.reduce((sum, val) => sum + val, 0) / n;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    const min = Math.min(...data);
    const max = Math.max(...data);
    
    return { mean, variance, stdDev, min, max };
}

// RMS Calculation
export function calculateRMS(data) {
    if (!Array.isArray(data) || data.length === 0) return 0;
    
    const squareSum = data.reduce((sum, val) => sum + val * val, 0);
    return Math.sqrt(squareSum / data.length);
}

// Export all
window.MagSpecKit = window.MagSpecKit || {};
window.MagSpecKit.DataProcessor = {
    filterSignal,
    normalizeSignal,
    detectPeaks,
    calculateStats,
    calculateRMS,
};

