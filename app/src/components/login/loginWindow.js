import electron from 'electron';
import path from 'path';
const {BrowserWindow, ipcMain} = electron;

function createLoginWindow(loginCallback) {
    var loginWindow = new BrowserWindow({
        width: 300,
        height: 400,
        frame: false,
        resizable: false
    });
    loginWindow.loadURL('file://' + path.join(__dirname, '/static/login/login.html'));

    ipcMain.once('login-message', function(event, usernameAndPassword) {
        loginCallback(usernameAndPassword[0], usernameAndPassword[1]);
        loginWindow.close();
    });
    return loginWindow;
}

export default createLoginWindow;
