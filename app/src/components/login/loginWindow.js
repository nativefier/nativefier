var electron = require('electron');
var BrowserWindow = electron.BrowserWindow;
var ipcMain = electron.ipcMain;

function createLoginWindow(loginCallback) {
    var loginWindow = new BrowserWindow({
        width: 300,
        height: 400,
        frame: false,
        resizable: false
    });
    loginWindow.loadURL('file://' + __dirname + '/static/login/login.html');

    ipcMain.once('login-message', function(event, usernameAndPassword) {
        loginCallback(usernameAndPassword[0], usernameAndPassword[1]);
        loginWindow.close();
    });
    return loginWindow;
}

module.exports = createLoginWindow;
