import * as path from 'path';

import * as log from 'loglevel';

import { BrowserWindow, ipcMain } from 'electron';

export async function createLoginWindow(
  loginCallback,
  parent?: BrowserWindow,
): Promise<BrowserWindow> {
  log.debug('createLoginWindow', loginCallback, parent);

  const loginWindow = new BrowserWindow({
    parent,
    width: 300,
    height: 400,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true, // TODO work around this; insecure
    },
  });
  await loginWindow.loadURL(
    `file://${path.join(__dirname, 'static/login.html')}`,
  );

  ipcMain.once('login-message', (event, usernameAndPassword) => {
    loginCallback(usernameAndPassword[0], usernameAndPassword[1]);
    loginWindow.close();
  });
  return loginWindow;
}
