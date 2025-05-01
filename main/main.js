const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const vosk = require('vosk');
const fs = require('fs');
const intentService = require('./services/intentService');
const voiceService = require('./services/voiceService');
const licenseService = require('./services/licenseService');
const updateService = require('./services/updateService');
const { createMenu } = require('./menu');

let mainWindow;
let recognizer;
let isVoskAvailable = false;
let voiceFeedbackEnabled = true;

// Initialize Vosk
try {
  const MODEL_PATH = path.join(__dirname, '../models/vosk-model-small-en-us-0.15');
  if (fs.existsSync(MODEL_PATH)) {
    vosk.setLogLevel(-1);
    const model = new vosk.Model(MODEL_PATH);
    recognizer = new vosk.Recognizer({ model: model, sampleRate: 16000 });
    isVoskAvailable = true;
  }
} catch (error) {
  console.error('Vosk initialization failed:', error);
}

function createWindow() {
  try {
    mainWindow = new BrowserWindow({
      width: 900,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      frame: false,
      transparent: true,
      backgroundColor: '#00000000'
    });

    // Create the application menu
    createMenu();

    // In development, load from React dev server
    if (process.env.NODE_ENV === 'development') {
      mainWindow.loadURL('http://localhost:3000');
      mainWindow.webContents.openDevTools();
    } else {
      // In production, load the built React app
      mainWindow.loadFile(path.join(__dirname, '../renderer/build/index.html'));
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Failed to load:', errorCode, errorDescription);
      dialog.showErrorBox(
        'Load Error',
        'Failed to load the application. Please try restarting.'
      );
    });
  } catch (error) {
    console.error('Error creating window:', error);
    dialog.showErrorBox(
      'Window Creation Error',
      'Failed to create the application window. Please try restarting.'
    );
  }
}

// Handle license checks
ipcMain.handle('check-license', async () => {
  try {
    return licenseService.isLicenseValid();
  } catch (error) {
    console.error('License check failed:', error);
    return false;
  }
});

ipcMain.handle('get-license-info', async () => {
  try {
    return licenseService.getLicenseInfo();
  } catch (error) {
    console.error('Get license info failed:', error);
    return null;
  }
});

ipcMain.handle('activate-license', async (event, key) => {
  try {
    return await licenseService.activateLicense(key);
  } catch (error) {
    console.error('License activation failed:', error);
    return false;
  }
});

ipcMain.handle('deactivate-license', async () => {
  try {
    licenseService.deactivateLicense();
    return true;
  } catch (error) {
    console.error('License deactivation failed:', error);
    return false;
  }
});

// Handle update checks
ipcMain.handle('check-for-updates', async () => {
  try {
    return await updateService.checkForUpdatesManually();
  } catch (error) {
    console.error('Manual update check failed:', error);
    return false;
  }
});

// Handle voice recognition
ipcMain.handle('start-recognition', async () => {
  try {
    return isVoskAvailable;
  } catch (error) {
    console.error('Start recognition failed:', error);
    return false;
  }
});

ipcMain.handle('process-audio', async (event, audioData) => {
  try {
    if (!isVoskAvailable || !recognizer) return null;
    
    const result = recognizer.acceptWaveform(audioData);
    if (result.text) {
      return result.text;
    }
  } catch (error) {
    console.error('Error processing audio:', error);
  }
  return null;
});

// Handle voice feedback settings
ipcMain.handle('get-voice-feedback', () => {
  try {
    return voiceFeedbackEnabled;
  } catch (error) {
    console.error('Get voice feedback failed:', error);
    return false;
  }
});

ipcMain.handle('set-voice-feedback', (event, enabled) => {
  try {
    voiceFeedbackEnabled = enabled;
    return true;
  } catch (error) {
    console.error('Set voice feedback failed:', error);
    return false;
  }
});

// Handle voice settings
ipcMain.handle('get-voice-settings', () => {
  try {
    return {
      verbosity: voiceService.verbosityLevel,
      voice: voiceService.voice,
      speed: voiceService.speed,
      pitch: voiceService.pitch
    };
  } catch (error) {
    console.error('Get voice settings failed:', error);
    return null;
  }
});

ipcMain.handle('set-voice-settings', (event, settings) => {
  try {
    if (settings.verbosity) {
      voiceService.setVerbosity(settings.verbosity);
    }
    if (settings.voice) {
      voiceService.setVoice(settings.voice);
    }
    if (settings.speed) {
      voiceService.setSpeed(settings.speed);
    }
    if (settings.pitch) {
      voiceService.setPitch(settings.pitch);
    }
    return true;
  } catch (error) {
    console.error('Set voice settings failed:', error);
    return false;
  }
});

// Handle intent recognition
ipcMain.handle('process-intent', async (event, text) => {
  try {
    const result = await intentService.recognizeIntent(text);
    
    if (voiceFeedbackEnabled) {
      await voiceService.speak(result.feedback, {
        isGeminiResponse: result.isGeminiResponse,
        isActionConfirmation: result.isActionConfirmation
      });
      mainWindow.webContents.send('speech-complete');
    }
    
    return result;
  } catch (error) {
    console.error('Error processing intent:', error);
    return {
      intent: 'error',
      action: 'Error processing request',
      feedback: 'I encountered an error while processing your request.',
      isGeminiResponse: false,
      isActionConfirmation: true
    };
  }
});

// Check license and updates before starting the app
app.whenReady().then(async () => {
  try {
    const isLicensed = licenseService.isLicenseValid();
    if (!isLicensed) {
      // Show license activation screen
      createWindow();
      mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('show-license-activation');
      });
    } else {
      // Start the app normally
      createWindow();
      // Check for updates after a short delay
      setTimeout(() => {
        updateService.checkForUpdates();
      }, 3000);
    }
  } catch (error) {
    console.error('App initialization failed:', error);
    dialog.showErrorBox(
      'Initialization Error',
      'Failed to initialize the application. Please try restarting.'
    );
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  dialog.showErrorBox(
    'Application Error',
    'An unexpected error occurred. The application will now close.'
  );
  app.quit();
}); 