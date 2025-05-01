const { autoUpdater } = require('electron-updater');
const { app, dialog, BrowserWindow } = require('electron');
const path = require('path');

class UpdateService {
  constructor() {
    // Configure auto-updater
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.logger = require('electron-log');
    autoUpdater.logger.transports.file.level = 'info';

    // Set up event handlers
    autoUpdater.on('checking-for-update', () => {
      this.sendStatusToWindow('Checking for updates...');
    });

    autoUpdater.on('update-available', (info) => {
      this.sendStatusToWindow('Update available:', info);
      dialog.showMessageBox({
        type: 'info',
        title: 'Update Available',
        message: `A new version (${info.version}) is available. Would you like to download it now?`,
        detail: `Release notes:\n${info.releaseNotes || 'No release notes available.'}`,
        buttons: ['Yes', 'No']
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
        }
      }).catch((error) => {
        console.error('Error showing update dialog:', error);
      });
    });

    autoUpdater.on('update-not-available', () => {
      this.sendStatusToWindow('No updates available');
    });

    autoUpdater.on('download-progress', (progressObj) => {
      let logMessage = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
      this.sendStatusToWindow(logMessage);
    });

    autoUpdater.on('update-downloaded', (info) => {
      this.sendStatusToWindow('Update downloaded:', info);
      dialog.showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: `Version ${info.version} has been downloaded.`,
        detail: 'Restart the application to apply the update.',
        buttons: ['Restart Now', 'Later']
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall(false, true);
        }
      }).catch((error) => {
        console.error('Error showing restart dialog:', error);
      });
    });

    autoUpdater.on('error', (err) => {
      this.sendStatusToWindow('Error in auto-updater:', err);
      dialog.showErrorBox(
        'Update Error',
        'An error occurred while checking for updates. Please try again later.'
      );
    });
  }

  sendStatusToWindow(text) {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      mainWindow.webContents.send('update-status', text);
    }
    console.log(text);
  }

  async checkForUpdates() {
    try {
      // Check for updates on app launch
      const result = await autoUpdater.checkForUpdates();
      if (result) {
        this.sendStatusToWindow(`Update available: ${result.updateInfo.version}`);
      } else {
        this.sendStatusToWindow('No updates available');
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
      dialog.showErrorBox(
        'Update Error',
        'An error occurred while checking for updates. Please try again later.'
      );
    }
  }

  async checkForUpdatesManually() {
    try {
      const result = await autoUpdater.checkForUpdates();
      if (!result) {
        dialog.showMessageBox({
          type: 'info',
          title: 'No Updates',
          message: 'You are running the latest version of DeskGenie.',
          detail: `Current version: ${app.getVersion()}`
        }).catch((error) => {
          console.error('Error showing no updates dialog:', error);
        });
      }
      return result;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      dialog.showErrorBox(
        'Update Error',
        'An error occurred while checking for updates. Please try again later.'
      );
      return null;
    }
  }

  getCurrentVersion() {
    return app.getVersion();
  }

  getUpdateChannel() {
    return autoUpdater.channel;
  }

  setUpdateChannel(channel) {
    autoUpdater.channel = channel;
  }
}

module.exports = new UpdateService(); 