const crypto = require('crypto');
const Store = require('electron-store');
const { app } = require('electron');
const path = require('path');

// Initialize secure store
const secureStore = new Store({
  name: 'secure-config',
  encryptionKey: crypto.randomBytes(32).toString('hex'),
  cwd: path.join(app.getPath('userData'), 'secure')
});

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100 // limit each IP to 100 requests per windowMs
};

// Security headers
const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

// API key validation patterns
const API_KEY_PATTERNS = {
  GEMINI: /^AI[a-zA-Z0-9_-]{35}$/,
  GMAIL: /^ya29\.[a-zA-Z0-9_-]+$/,
  OUTLOOK: /^[a-zA-Z0-9_-]{32}$/
};

class SecurityConfig {
  static async initialize() {
    try {
      // Generate encryption key if not exists
      if (!secureStore.get('encryptionKey')) {
        secureStore.set('encryptionKey', crypto.randomBytes(32).toString('hex'));
      }

      // Initialize rate limiting store
      if (!secureStore.get('rateLimits')) {
        secureStore.set('rateLimits', {});
      }

      return true;
    } catch (error) {
      console.error('Security initialization failed:', error);
      return false;
    }
  }

  static validateApiKey(key, type) {
    if (!key || !type) return false;
    const pattern = API_KEY_PATTERNS[type];
    return pattern ? pattern.test(key) : false;
  }

  static async storeApiKey(key, type) {
    if (!this.validateApiKey(key, type)) {
      throw new Error(`Invalid ${type} API key format`);
    }

    try {
      const encryptedKey = crypto.createCipheriv(
        'aes-256-gcm',
        Buffer.from(secureStore.get('encryptionKey'), 'hex'),
        crypto.randomBytes(16)
      ).update(key, 'utf8', 'hex');

      secureStore.set(`apiKeys.${type}`, encryptedKey);
      return true;
    } catch (error) {
      console.error(`Failed to store ${type} API key:`, error);
      return false;
    }
  }

  static async getApiKey(type) {
    try {
      const encryptedKey = secureStore.get(`apiKeys.${type}`);
      if (!encryptedKey) return null;

      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        Buffer.from(secureStore.get('encryptionKey'), 'hex'),
        crypto.randomBytes(16)
      );

      return decipher.update(encryptedKey, 'hex', 'utf8');
    } catch (error) {
      console.error(`Failed to retrieve ${type} API key:`, error);
      return null;
    }
  }

  static checkRateLimit(ip) {
    const rateLimits = secureStore.get('rateLimits') || {};
    const now = Date.now();
    const windowStart = now - RATE_LIMIT.windowMs;

    // Clean up old entries
    Object.keys(rateLimits).forEach(key => {
      if (rateLimits[key].timestamp < windowStart) {
        delete rateLimits[key];
      }
    });

    // Check rate limit
    if (!rateLimits[ip]) {
      rateLimits[ip] = { count: 1, timestamp: now };
    } else if (rateLimits[ip].timestamp < windowStart) {
      rateLimits[ip] = { count: 1, timestamp: now };
    } else if (rateLimits[ip].count >= RATE_LIMIT.maxRequests) {
      return false;
    } else {
      rateLimits[ip].count++;
    }

    secureStore.set('rateLimits', rateLimits);
    return true;
  }

  static getSecurityHeaders() {
    return SECURITY_HEADERS;
  }
}

module.exports = SecurityConfig; 