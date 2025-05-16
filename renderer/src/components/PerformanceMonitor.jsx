import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const PerformanceMonitor = ({ visible }) => {
  const [metrics, setMetrics] = useState({
    memory: null,
    cpu: null,
    eventLoopLag: null
  });

  useEffect(() => {
    if (!visible) return;

    const updateMetrics = async () => {
      try {
        const memory = await window.electron.ipcRenderer.invoke('get-memory-usage');
        const cpu = await window.electron.ipcRenderer.invoke('get-cpu-usage');
        const eventLoopLag = await window.electron.ipcRenderer.invoke('get-event-loop-lag');

        setMetrics({ memory, cpu, eventLoopLag });
      } catch (error) {
        console.error('Failed to fetch performance metrics:', error);
      }
    };

    const interval = setInterval(updateMetrics, 1000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50">
      <h3 className="text-lg font-semibold mb-2">Performance Monitor</h3>
      
      {metrics.memory && (
        <div className="mb-2">
          <h4 className="text-sm font-medium text-gray-300">Memory Usage</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>RSS:</div>
            <div>{metrics.memory.rss}</div>
            <div>Heap Total:</div>
            <div>{metrics.memory.heapTotal}</div>
            <div>Heap Used:</div>
            <div>{metrics.memory.heapUsed}</div>
            <div>External:</div>
            <div>{metrics.memory.external}</div>
          </div>
        </div>
      )}

      {metrics.cpu && (
        <div className="mb-2">
          <h4 className="text-sm font-medium text-gray-300">CPU Usage</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>User:</div>
            <div>{metrics.cpu.user.toFixed(2)}ms</div>
            <div>System:</div>
            <div>{metrics.cpu.system.toFixed(2)}ms</div>
          </div>
        </div>
      )}

      {metrics.eventLoopLag && (
        <div>
          <h4 className="text-sm font-medium text-gray-300">Event Loop Lag</h4>
          <div className="text-sm">
            {metrics.eventLoopLag.toFixed(2)}ms
            {metrics.eventLoopLag > 100 && (
              <span className="ml-2 text-red-400">⚠️ High Lag</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

PerformanceMonitor.propTypes = {
  visible: PropTypes.bool.isRequired
};

export default PerformanceMonitor; 