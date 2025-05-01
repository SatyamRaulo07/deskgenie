import React, { useState, useEffect } from 'react';
import { ipcRenderer } from 'electron';
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
        const valid = await ipcRenderer.invoke('check-license');
        setIsLicensed(valid);
        
        if (valid) {
          const info = await ipcRenderer.invoke('get-license-info');
          setLicenseInfo(info);
        }
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

    ipcRenderer.on('show-license-activation', handleShowLicenseActivation);

    return () => {
      ipcRenderer.removeListener('show-license-activation', handleShowLicenseActivation);
    };
  }, []);

  const handleActivationSuccess = async () => {
    setIsLicensed(true);
    const info = await ipcRenderer.invoke('get-license-info');
    setLicenseInfo(info);
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