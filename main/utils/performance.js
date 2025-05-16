const { performance } = require('perf_hooks');
const Logger = require('./logger');

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.marks = new Map();
    this.measures = new Map();
  }

  startMeasure(name) {
    if (this.marks.has(name)) {
      Logger.warn(`Measure ${name} already exists, overwriting`);
    }
    this.marks.set(name, performance.now());
  }

  endMeasure(name) {
    const startTime = this.marks.get(name);
    if (!startTime) {
      Logger.warn(`No measure found for ${name}`);
      return null;
    }

    const duration = performance.now() - startTime;
    this.measures.set(name, duration);
    this.marks.delete(name);

    // Log if duration exceeds threshold
    if (duration > 1000) { // 1 second threshold
      Logger.warn(`Performance warning: ${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  trackMetric(name, value) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name).push({
      value,
      timestamp: Date.now()
    });

    // Keep only last 1000 measurements
    if (this.metrics.get(name).length > 1000) {
      this.metrics.get(name).shift();
    }
  }

  getMetricStats(name) {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) {
      return null;
    }

    const numbers = values.map(v => v.value);
    return {
      min: Math.min(...numbers),
      max: Math.max(...numbers),
      avg: numbers.reduce((a, b) => a + b, 0) / numbers.length,
      count: numbers.length,
      lastValue: numbers[numbers.length - 1]
    };
  }

  getMeasureStats() {
    const stats = {};
    for (const [name, duration] of this.measures) {
      stats[name] = {
        avg: duration,
        count: 1,
        lastValue: duration
      };
    }
    return stats;
  }

  clearMetrics() {
    this.metrics.clear();
    this.marks.clear();
    this.measures.clear();
  }

  // Memory usage monitoring
  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: this.formatBytes(usage.rss),
      heapTotal: this.formatBytes(usage.heapTotal),
      heapUsed: this.formatBytes(usage.heapUsed),
      external: this.formatBytes(usage.external)
    };
  }

  formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }

    return `${value.toFixed(2)} ${units[unitIndex]}`;
  }

  // CPU usage monitoring
  async getCPUUsage() {
    const startUsage = process.cpuUsage();
    await new Promise(resolve => setTimeout(resolve, 100));
    const endUsage = process.cpuUsage(startUsage);

    return {
      user: endUsage.user / 1000, // Convert to milliseconds
      system: endUsage.system / 1000
    };
  }

  // Monitor event loop lag
  startEventLoopMonitoring(interval = 1000) {
    let lastCheck = process.hrtime();
    
    const checkLag = () => {
      const [seconds, nanoseconds] = process.hrtime(lastCheck);
      const lag = (seconds * 1000) + (nanoseconds / 1000000);
      
      this.trackMetric('eventLoopLag', lag);
      
      if (lag > 100) { // 100ms threshold
        Logger.warn(`Event loop lag detected: ${lag.toFixed(2)}ms`);
      }
      
      lastCheck = process.hrtime();
    };

    return setInterval(checkLag, interval);
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

module.exports = performanceMonitor; 