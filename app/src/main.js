/**
 * Created by JiaHao on 4/7/15.
 */

var fs = require('fs');
var path = require('path');
var electron = require('electron');
var createMainWindow = require('./components/mainWindow/mainWindow');
var createLoginWindow = require('./components/login/loginWindow');
var helpers = require('./helpers/helpers');
var app = electron.app;
var ipcMain = electron.ipcMain;
var isOSX = helpers.isOSX;

const APP_ARGS_FILE_PATH = path.join(__dirname, '..', 'nativefier.json');

var appArgs = JSON.parse(fs.readFileSync(APP_ARGS_FILE_PATH, 'utf8'));

var mainWindow;

// do nothing for setDockBadge if not OSX
let setDockBadge = () => {};

if (isOSX()) {
    setDockBadge = app.dock.setBadge;
}

app.on('window-all-closed', function() {
    if (!isOSX()) {
        app.quit();
    }
});

app.on('activate', function(event, hasVisibleWindows) {
    if (isOSX()) {
        // this is called when the dock is clicked
        if (!hasVisibleWindows) {
            mainWindow.show();
        }
    }
});

app.on('before-quit', function() {
    // not fired when the close button on the window is clicked
    if (isOSX()) {
        // need to force a quit as a workaround here to simulate the osx app hiding behaviour
        // Somehow sokution at https://github.com/atom/electron/issues/444#issuecomment-76492576 does not work,
        // e.prevent default appears to persist

        // might cause issues in the future as before-quit and will-quit events are not called
        app.exit(0);
    }
});

app.on('ready', function() {
    mainWindow = createMainWindow(appArgs, app.quit, setDockBadge);
});

app.on('login', function(event, webContents, request, authInfo, callback) {
    // for http authentication
    event.preventDefault();
    createLoginWindow(callback);
});

ipcMain.on('notification', function(event, title, opts) {
    if (!isOSX() || mainWindow.isFocused()) {
        return;
    }
    setDockBadge('●');
});
