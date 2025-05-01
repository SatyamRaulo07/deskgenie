const { Menu, ipcMain, app, dialog } = require('electron');

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Check for Updates',
          click: () => {
            ipcMain.emit('check-for-updates');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Alt+F4',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About DeskGenie',
          click: () => {
            dialog.showMessageBox({
              title: 'About DeskGenie',
              message: 'DeskGenie - Your Personal Voice Assistant',
              detail: `Version ${app.getVersion()}\n\nA cross-platform desktop application that helps you control your computer using voice commands.`,
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

module.exports = { createMenu }; 