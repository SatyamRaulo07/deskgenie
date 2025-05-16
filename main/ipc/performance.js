const { ipcMain } = require('electron');
const performanceMonitor = require('../utils/performance');

function setupPerformanceHandlers() {
  // Start event loop monitoring when the app starts
  const eventLoopInterval = performanceMonitor.startEventLoopMonitoring();

  // Clean up on app quit
  ipcMain.on('app-quit', () => {
    clearInterval(eventLoopInterval);
  });

  // Get memory usage
  ipcMain.handle('get-memory-usage', async () => {
    return performanceMonitor.getMemoryUsage();
  });

  // Get CPU usage
  ipcMain.handle('get-cpu-usage', async () => {
    return performanceMonitor.getCPUUsage();
  });

  // Get event loop lag
  ipcMain.handle('get-event-loop-lag', async () => {
    const stats = performanceMonitor.getMetricStats('eventLoopLag');
    return stats ? stats.lastValue : 0;
  });

  // Get performance metrics for a specific operation
  ipcMain.handle('get-operation-metrics', async (event, operationName) => {
    return performanceMonitor.getMeasureStats()[operationName] || null;
  });

  // Start measuring an operation
  ipcMain.handle('start-measure', async (event, operationName) => {
    performanceMonitor.startMeasure(operationName);
  });

  // End measuring an operation
  ipcMain.handle('end-measure', async (event, operationName) => {
    return performanceMonitor.endMeasure(operationName);
  });

  // Track a custom metric
  ipcMain.handle('track-metric', async (event, { name, value }) => {
    performanceMonitor.trackMetric(name, value);
  });

  // Get stats for a custom metric
  ipcMain.handle('get-metric-stats', async (event, metricName) => {
    return performanceMonitor.getMetricStats(metricName);
  });

  // Clear all metrics
  ipcMain.handle('clear-metrics', async () => {
    performanceMonitor.clearMetrics();
  });
}

module.exports = setupPerformanceHandlers; 