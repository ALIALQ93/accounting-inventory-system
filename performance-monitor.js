/**
 * Performance Monitoring Tool
 * أداة قياس الأداء للعمليات المحاسبية
 */

class PerformanceMonitor {
    static measurements = [];
    static activeTimers = new Map();
    
    /**
     * Start timing an operation
     * @param {string} label - Operation label
     * @param {object} metadata - Additional metadata
     */
    static start(label, metadata = {}) {
        const timerId = `${label}-${Date.now()}-${Math.random()}`;
        this.activeTimers.set(label, {
            timerId,
            startTime: performance.now(),
            metadata
        });
        
        performance.mark(`${timerId}-start`);
    }
    
    /**
     * End timing an operation
     * @param {string} label - Operation label
     * @param {object} result - Operation result data
     * @returns {number} Duration in milliseconds
     */
    static end(label, result = {}) {
        const timer = this.activeTimers.get(label);
        if (!timer) {
            console.warn(`⚠️ No active timer found for: ${label}`);
            return 0;
        }
        
        const endTime = performance.now();
        const duration = endTime - timer.startTime;
        
        performance.mark(`${timer.timerId}-end`);
        performance.measure(label, `${timer.timerId}-start`, `${timer.timerId}-end`);
        
        const measurement = {
            label,
            duration: parseFloat(duration.toFixed(2)),
            timestamp: new Date(),
            metadata: timer.metadata,
            result
        };
        
        this.measurements.push(measurement);
        this.activeTimers.delete(label);
        
        // Log if duration exceeds threshold
        const threshold = this.getThreshold(label);
        if (duration > threshold) {
            console.warn(`⚠️ Slow operation: ${label} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`);
        } else {
            console.log(`✅ ${label}: ${duration.toFixed(2)}ms`);
        }
        
        return duration;
    }
    
    /**
     * Get performance threshold for an operation
     * @param {string} label - Operation label
     * @returns {number} Threshold in milliseconds
     */
    static getThreshold(label) {
        const thresholds = {
            'generateGeneralEntry-sales': 500,
            'generateGeneralEntry-purchases': 500,
            'calculateBalances': 2000,
            'saveVoucher': 300,
            'generateReport': 3000,
            'updatePartyBalance': 200,
            'updateAccountBalance': 200,
            'loadData': 1000
        };
        
        // Find matching threshold
        for (const [key, value] of Object.entries(thresholds)) {
            if (label.includes(key)) {
                return value;
            }
        }
        
        return 1000; // Default threshold
    }
    
    /**
     * Get measurements report
     * @param {string} label - Filter by label (optional)
     * @returns {Array} Measurements array
     */
    static getReport(label = null) {
        if (label) {
            return this.measurements.filter(m => m.label === label);
        }
        return this.measurements;
    }
    
    /**
     * Get statistics for a label
     * @param {string} label - Operation label
     * @returns {object} Statistics
     */
    static getStatistics(label) {
        const measurements = this.measurements.filter(m => m.label === label);
        
        if (measurements.length === 0) {
            return null;
        }
        
        const durations = measurements.map(m => m.duration);
        const sum = durations.reduce((a, b) => a + b, 0);
        const avg = sum / durations.length;
        const min = Math.min(...durations);
        const max = Math.max(...durations);
        
        // Calculate median
        const sorted = [...durations].sort((a, b) => a - b);
        const median = sorted.length % 2 === 0
            ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
            : sorted[Math.floor(sorted.length / 2)];
        
        return {
            label,
            count: measurements.length,
            average: parseFloat(avg.toFixed(2)),
            min: parseFloat(min.toFixed(2)),
            max: parseFloat(max.toFixed(2)),
            median: parseFloat(median.toFixed(2)),
            threshold: this.getThreshold(label),
            aboveThreshold: durations.filter(d => d > this.getThreshold(label)).length
        };
    }
    
    /**
     * Get summary report
     * @returns {object} Summary statistics
     */
    static getSummary() {
        const labels = [...new Set(this.measurements.map(m => m.label))];
        const summary = {
            totalOperations: this.measurements.length,
            uniqueOperations: labels.length,
            operations: labels.map(label => this.getStatistics(label)),
            totalDuration: this.measurements.reduce((sum, m) => sum + m.duration, 0)
        };
        
        return summary;
    }
    
    /**
     * Clear all measurements
     */
    static clear() {
        this.measurements = [];
        this.activeTimers.clear();
        performance.clearMarks();
        performance.clearMeasures();
        console.log('✅ Performance measurements cleared');
    }
    
    /**
     * Export measurements as JSON
     * @returns {string} JSON string
     */
    static export() {
        return JSON.stringify({
            summary: this.getSummary(),
            measurements: this.measurements,
            exportedAt: new Date().toISOString()
        }, null, 2);
    }
    
    /**
     * Print formatted report to console
     */
    static printReport() {
        const summary = this.getSummary();
        
        console.group('📊 Performance Report');
        console.log(`Total Operations: ${summary.totalOperations}`);
        console.log(`Total Duration: ${summary.totalDuration.toFixed(2)}ms`);
        console.log(`Unique Operations: ${summary.uniqueOperations}`);
        console.groupEnd();
        
        console.group('📈 Operation Statistics');
        summary.operations.forEach(op => {
            if (op) {
                const status = op.aboveThreshold > 0 ? '⚠️' : '✅';
                console.log(`${status} ${op.label}:`);
                console.log(`   Count: ${op.count}`);
                console.log(`   Average: ${op.average}ms`);
                console.log(`   Min: ${op.min}ms`);
                console.log(`   Max: ${op.max}ms`);
                console.log(`   Median: ${op.median}ms`);
                console.log(`   Threshold: ${op.threshold}ms`);
                if (op.aboveThreshold > 0) {
                    console.log(`   ⚠️ Above threshold: ${op.aboveThreshold} times`);
                }
            }
        });
        console.groupEnd();
    }
    
    /**
     * Measure async function execution
     * @param {string} label - Operation label
     * @param {Function} fn - Async function to measure
     * @param {object} metadata - Additional metadata
     * @returns {Promise} Function result
     */
    static async measure(label, fn, metadata = {}) {
        this.start(label, metadata);
        try {
            const result = await fn();
            this.end(label, { success: true, result });
            return result;
        } catch (error) {
            this.end(label, { success: false, error: error.message });
            throw error;
        }
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.PerformanceMonitor = PerformanceMonitor;
}

// Auto-export on page unload (for debugging)
if (typeof window !== 'undefined' && window.localStorage) {
    window.addEventListener('beforeunload', () => {
        if (PerformanceMonitor.measurements.length > 0) {
            const report = PerformanceMonitor.export();
            try {
                localStorage.setItem('performanceReport', report);
            } catch (e) {
                // Ignore storage errors
            }
        }
    });
}

console.log('✅ Performance Monitor loaded');


