import React, { useState } from 'react';

function LicenseActivation({ onActivationSuccess }) {
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setError('Please enter a license key');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await window.electron.ipcRenderer.startMeasure('license-activation-attempt');
      
      const success = await window.electron.ipcRenderer.invoke('activate-license', licenseKey);
      
      const activationTime = await window.electron.ipcRenderer.endMeasure('license-activation-attempt');
      window.electron.ipcRenderer.trackMetric('licenseActivationAttemptTime', activationTime);
      
      if (success) {
        onActivationSuccess();
      } else {
        setError('Invalid license key. Please try again.');
      }
    } catch (error) {
      setError(error.message || 'Failed to activate license');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-neon-blue neon-glow mb-2">
            DeskGenie
          </h1>
          <p className="text-gray-400">Activate your license to continue</p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="space-y-4">
            <div>
              <label htmlFor="licenseKey" className="block text-sm font-medium text-gray-400 mb-2">
                License Key
              </label>
              <input
                type="text"
                id="licenseKey"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="Enter your license key"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleActivate}
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isLoading ? 'Activating...' : 'Activate License'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LicenseActivation; 