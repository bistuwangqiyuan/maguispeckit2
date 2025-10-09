/**
 * Performance Monitor
 * 性能监控 - 监控系统性能指标
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoad: null,
            apiCalls: [],
            memoryUsage: [],
            fps: [],
        };
        this.isMonitoring = false;
    }
    
    /**
     * Start monitoring
     */
    start() {
        if (this.isMonitoring) return;
        
        console.log('📊 Starting performance monitoring...');
        this.isMonitoring = true;
        
        // Monitor page load
        this.monitorPageLoad();
        
        // Monitor FPS
        this.monitorFPS();
        
        // Monitor memory (if available)
        if (performance.memory) {
            this.monitorMemory();
        }
        
        console.log('✅ Performance monitoring started');
    }
    
    /**
     * Stop monitoring
     */
    stop() {
        this.isMonitoring = false;
        console.log('⏹️ Performance monitoring stopped');
    }
    
    /**
     * Monitor page load performance
     */
    monitorPageLoad() {
        if (!window.performance || !performance.timing) return;
        
        window.addEventListener('load', () => {
            const timing = performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
            
            this.metrics.pageLoad = {
                totalLoadTime: loadTime,
                domReadyTime: domReady,
                dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
                tcpConnection: timing.connectEnd - timing.connectStart,
                serverResponse: timing.responseEnd - timing.requestStart,
                domProcessing: timing.domComplete - timing.domLoading,
            };
            
            console.log('📊 Page load metrics:', this.metrics.pageLoad);
            
            // Log if load time is slow
            if (loadTime > 3000) {
                if (window.MagSpecKit?.Logger) {
                    window.MagSpecKit.Logger.warn('Slow page load detected', {
                        loadTime: `${loadTime}ms`,
                    });
                }
            }
        });
    }
    
    /**
     * Monitor FPS (Frames Per Second)
     */
    monitorFPS() {
        let lastTime = performance.now();
        let frames = 0;
        
        const measureFPS = () => {
            if (!this.isMonitoring) return;
            
            frames++;
            const currentTime = performance.now();
            
            // Calculate FPS every second
            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frames * 1000) / (currentTime - lastTime));
                
                this.metrics.fps.push({
                    timestamp: new Date().toISOString(),
                    fps,
                });
                
                // Keep only last 60 measurements
                if (this.metrics.fps.length > 60) {
                    this.metrics.fps.shift();
                }
                
                // Warn if FPS is too low
                if (fps < 20) {
                    if (window.MagSpecKit?.Logger) {
                        window.MagSpecKit.Logger.warn('Low FPS detected', { fps });
                    }
                }
                
                frames = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }
    
    /**
     * Monitor memory usage
     */
    monitorMemory() {
        setInterval(() => {
            if (!this.isMonitoring) return;
            
            const memory = performance.memory;
            const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
            const totalMB = Math.round(memory.jsHeapSizeLimit / 1048576);
            
            this.metrics.memoryUsage.push({
                timestamp: new Date().toISOString(),
                used: usedMB,
                total: totalMB,
                percentage: Math.round((usedMB / totalMB) * 100),
            });
            
            // Keep only last 100 measurements
            if (this.metrics.memoryUsage.length > 100) {
                this.metrics.memoryUsage.shift();
            }
            
            // Warn if memory usage is high
            const percentage = (usedMB / totalMB) * 100;
            if (percentage > 80) {
                if (window.MagSpecKit?.Logger) {
                    window.MagSpecKit.Logger.warn('High memory usage', {
                        used: `${usedMB}MB`,
                        total: `${totalMB}MB`,
                        percentage: `${percentage.toFixed(1)}%`,
                    });
                }
            }
        }, 5000); // Every 5 seconds
    }
    
    /**
     * Track API call performance
     */
    trackAPICall(url, duration, success) {
        this.metrics.apiCalls.push({
            timestamp: new Date().toISOString(),
            url,
            duration,
            success,
        });
        
        // Keep only last 100 API calls
        if (this.metrics.apiCalls.length > 100) {
            this.metrics.apiCalls.shift();
        }
        
        // Warn if API call is slow
        if (duration > 3000) {
            if (window.MagSpecKit?.Logger) {
                window.MagSpecKit.Logger.warn('Slow API call', {
                    url,
                    duration: `${duration}ms`,
                });
            }
        }
    }
    
    /**
     * Get all metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            currentFPS: this.metrics.fps.length > 0 
                ? this.metrics.fps[this.metrics.fps.length - 1].fps 
                : 0,
            currentMemory: this.metrics.memoryUsage.length > 0
                ? this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1]
                : null,
            averageAPITime: this.calculateAverageAPITime(),
        };
    }
    
    /**
     * Calculate average API call time
     */
    calculateAverageAPITime() {
        if (this.metrics.apiCalls.length === 0) return 0;
        
        const total = this.metrics.apiCalls.reduce((sum, call) => sum + call.duration, 0);
        return Math.round(total / this.metrics.apiCalls.length);
    }
    
    /**
     * Get performance report
     */
    getReport() {
        const metrics = this.getMetrics();
        
        return {
            pageLoad: metrics.pageLoad,
            performance: {
                currentFPS: metrics.currentFPS,
                averageFPS: this.calculateAverageFPS(),
                memoryUsage: metrics.currentMemory,
                averageAPITime: metrics.averageAPITime,
            },
            recommendations: this.getRecommendations(metrics),
        };
    }
    
    /**
     * Calculate average FPS
     */
    calculateAverageFPS() {
        if (this.metrics.fps.length === 0) return 0;
        
        const total = this.metrics.fps.reduce((sum, entry) => sum + entry.fps, 0);
        return Math.round(total / this.metrics.fps.length);
    }
    
    /**
     * Get performance recommendations
     */
    getRecommendations(metrics) {
        const recommendations = [];
        
        // Check page load time
        if (metrics.pageLoad && metrics.pageLoad.totalLoadTime > 3000) {
            recommendations.push('页面加载时间过长，建议优化资源加载');
        }
        
        // Check FPS
        if (metrics.currentFPS < 30) {
            recommendations.push('帧率较低，建议减少动画或优化渲染');
        }
        
        // Check memory
        if (metrics.currentMemory && metrics.currentMemory.percentage > 80) {
            recommendations.push('内存使用率过高，建议清理缓存或重启应用');
        }
        
        // Check API performance
        if (metrics.averageAPITime > 2000) {
            recommendations.push('API响应时间较慢，建议检查网络连接或优化后端');
        }
        
        return recommendations;
    }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Auto-start in development mode
const isDev = window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1';

if (isDev) {
    performanceMonitor.start();
}

// Export for use in other modules
window.MagSpecKit = window.MagSpecKit || {};
window.MagSpecKit.PerformanceMonitor = performanceMonitor;

export default performanceMonitor;

