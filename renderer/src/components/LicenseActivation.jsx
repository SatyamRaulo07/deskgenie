import React, { useState } from 'react';
import { ipcRenderer } from 'electron';

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
      const success = await ipcRenderer.invoke('activate-license', licenseKey);
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

        <div className="glass rounded-lg p-8 animate-slide-in">
          <div className="space-y-6">
            <div>
              <label htmlFor="licenseKey" className="block text-sm font-medium text-gray-300 mb-2">
                License Key
              </label>
              <input
                type="text"
                id="licenseKey"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                placeholder="Enter your license key"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus-neon outline-none"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-300 text-sm animate-fade-in">
                {error}
              </div>
            )}

            <button
              onClick={handleActivate}
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                isLoading
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover-glow'
              }`}
            >
              {isLoading ? 'Activating...' : 'Activate License'}
            </button>

            <div className="text-center space-y-4">
              <a
                href="https://deskgenie.app/purchase"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm block"
              >
                Don't have a license? Purchase one here
              </a>

              <div className="text-gray-500 text-sm">
                <p>Try DeskGenie for free with our trial license:</p>
                <code className="block mt-2 p-2 bg-gray-800 rounded text-neon-blue">
                  DG-TRIAL-2024-0001
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LicenseActivation; 