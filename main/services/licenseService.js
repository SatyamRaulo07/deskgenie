const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class LicenseService {
  constructor() {
    this.licensePath = path.join(process.env.APPDATA || process.env.HOME, '.deskgenie', 'license.json');
    this.licenseInfo = this.loadLicense();
  }

  loadLicense() {
    try {
      if (fs.existsSync(this.licensePath)) {
        const data = fs.readFileSync(this.licensePath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading license:', error);
    }
    return null;
  }

  saveLicense(licenseInfo) {
    try {
      const dir = path.dirname(this.licensePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.licensePath, JSON.stringify(licenseInfo, null, 2));
      this.licenseInfo = licenseInfo;
    } catch (error) {
      console.error('Error saving license:', error);
      throw new Error('Failed to save license');
    }
  }

  validateLicenseKey(key) {
    // This is a simple validation example. In a real application, you would:
    // 1. Validate the key format
    // 2. Check against a server
    // 3. Verify the signature
    // 4. Check expiration date
    
    // For demo purposes, we'll accept any key that matches our pattern
    const keyPattern = /^DG-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    return keyPattern.test(key);
  }

  isLicenseValid() {
    if (!this.licenseInfo) return false;
    
    // Check if license is expired
    if (this.licenseInfo.expiresAt && new Date(this.licenseInfo.expiresAt) < new Date()) {
      return false;
    }
    
    return true;
  }

  getLicenseInfo() {
    if (!this.licenseInfo) return null;
    
    return {
      key: this.licenseInfo.key,
      type: this.licenseInfo.type,
      expiresAt: this.licenseInfo.expiresAt,
      isTrial: this.licenseInfo.type === 'trial'
    };
  }

  async activateLicense(key) {
    if (!this.validateLicenseKey(key)) {
      throw new Error('Invalid license key format');
    }

    // In a real application, you would validate the key with your server
    // For demo purposes, we'll create a simple license object
    const licenseInfo = {
      key: key,
      type: key.startsWith('DG-TRIAL') ? 'trial' : 'full',
      activatedAt: new Date().toISOString(),
      expiresAt: key.startsWith('DG-TRIAL') 
        ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days trial
        : null // Full license doesn't expire
    };

    this.saveLicense(licenseInfo);
    return true;
  }

  deactivateLicense() {
    try {
      if (fs.existsSync(this.licensePath)) {
        fs.unlinkSync(this.licensePath);
      }
      this.licenseInfo = null;
    } catch (error) {
      console.error('Error deactivating license:', error);
      throw new Error('Failed to deactivate license');
    }
  }
}

module.exports = new LicenseService(); 