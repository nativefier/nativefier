import * as path from 'path';

import { BrowserWindow, ipcMain } from 'electron';

import * as log from '../helpers/loggingHelper';

export async function createLoginWindow(
  loginCallback: (username?: string, password?: string) => void,
  parent?: BrowserWindow,
): Promise<BrowserWindow> {
  log.debug('createLoginWindow', { loginCallback, parent });

  const loginWindow = new BrowserWindow({
    parent,
    width: 300,
    height: 400,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true, // TODO work around this; insecure
      contextIsolation: false, // https://github.com/electron/electron/issues/28017
    },
  });
  await loginWindow.loadURL(
    `file://${path.join(__dirname, 'static/login.html')}`,
  );

  ipcMain.once('login-message', (event, usernameAndPassword: string[]) => {
    log.debug('login-message', { event, username: usernameAndPassword[0] });
    loginCallback(usernameAndPassword[0], usernameAndPassword[1]);
    loginWindow.close();
  });
  return loginWindow;
}
