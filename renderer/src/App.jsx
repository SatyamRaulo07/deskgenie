import React, { useState, useEffect } from 'react';
import LicenseActivation from './components/LicenseActivation';
import MainInterface from './components/MainInterface';
import './App.css';

function App() {
  const [isLicensed, setIsLicensed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [licenseInfo, setLicenseInfo] = useState(null);

  useEffect(() => {
    const checkLicense = async () => {
      try {
        await window.electron.ipcRenderer.startMeasure('license-check');
        
        const valid = await window.electron.ipcRenderer.invoke('check-license');
        setIsLicensed(valid);
        
        if (valid) {
          const info = await window.electron.ipcRenderer.invoke('get-license-info');
          setLicenseInfo(info);
        }
        
        const checkTime = await window.electron.ipcRenderer.endMeasure('license-check');
        window.electron.ipcRenderer.trackMetric('licenseCheckTime', checkTime);
      } catch (error) {
        console.error('Error checking license:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLicense();

    // Listen for license activation events
    const handleShowLicenseActivation = () => {
      setIsLicensed(false);
      setIsLoading(false);
    };

    window.electron.ipcRenderer.on('show-license-activation', handleShowLicenseActivation);

    return () => {
      window.electron.ipcRenderer.removeListener('show-license-activation', handleShowLicenseActivation);
    };
  }, []);

  const handleActivationSuccess = async () => {
    try {
      await window.electron.ipcRenderer.startMeasure('license-activation');
      
      setIsLicensed(true);
      const info = await window.electron.ipcRenderer.invoke('get-license-info');
      setLicenseInfo(info);
      
      const activationTime = await window.electron.ipcRenderer.endMeasure('license-activation');
      window.electron.ipcRenderer.trackMetric('licenseActivationTime', activationTime);
    } catch (error) {
      console.error('Error during license activation:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-neon-blue animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white">
      {!isLicensed ? (
        <LicenseActivation onActivationSuccess={handleActivationSuccess} />
      ) : (
        <MainInterface licenseInfo={licenseInfo} />
      )}
    </div>
  );
}

export default App; 