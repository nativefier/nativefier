import { BrowserWindow, ipcMain } from 'electron';
import path from 'path';

function createLoginWindow(loginCallback) {
  const loginWindow = new BrowserWindow({
    width: 300,
    height: 400,
    frame: false,
    resizable: false,
  });
  loginWindow.loadURL(`file://${path.join(__dirname, '/static/login/login.html')}`);

  ipcMain.once('login-message', (event, usernameAndPassword) => {
    loginCallback(usernameAndPassword[0], usernameAndPassword[1]);
    loginWindow.close();
  });
  return loginWindow;
}

export default createLoginWindow;
