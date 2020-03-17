import * as path from 'path';

import { BrowserWindow, ipcMain } from 'electron';

export function createLoginWindow(loginCallback): BrowserWindow {
  const loginWindow = new BrowserWindow({
    width: 300,
    height: 400,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true, // TODO work around this; insecure
    },
  });
  loginWindow.loadURL(`file://${path.join(__dirname, 'static/login.html')}`);

  ipcMain.once('login-message', (event, usernameAndPassword) => {
    loginCallback(usernameAndPassword[0], usernameAndPassword[1]);
    loginWindow.close();
  });
  return loginWindow;
}
