const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    ipcRenderer: {
      // Performance monitoring
      getMemoryUsage: () => ipcRenderer.invoke('get-memory-usage'),
      getCPUUsage: () => ipcRenderer.invoke('get-cpu-usage'),
      getEventLoopLag: () => ipcRenderer.invoke('get-event-loop-lag'),
      getOperationMetrics: (operationName) => ipcRenderer.invoke('get-operation-metrics', operationName),
      startMeasure: (operationName) => ipcRenderer.invoke('start-measure', operationName),
      endMeasure: (operationName) => ipcRenderer.invoke('end-measure', operationName),
      trackMetric: (name, value) => ipcRenderer.invoke('track-metric', { name, value }),
      getMetricStats: (metricName) => ipcRenderer.invoke('get-metric-stats', metricName),
      clearMetrics: () => ipcRenderer.invoke('clear-metrics'),

      // Existing handlers
      invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
      on: (channel, func) => {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      },
      removeListener: (channel, func) => {
        ipcRenderer.removeListener(channel, func);
      },
      send: (channel, ...args) => {
        ipcRenderer.send(channel, ...args);
      }
    }
  }
); 