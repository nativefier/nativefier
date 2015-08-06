/**
 * Created by JiaHao on 4/7/15.
 */

var app = require('app');
var fs = require('fs');
var BrowserWindow = require('browser-window');
var ipc = require('ipc');

const APP_ARGS_FILE_PATH = __dirname + '/targetUrl.txt';
require('crash-reporter').start();

var mainWindow = null;

var appArgs = JSON.parse(fs.readFileSync(APP_ARGS_FILE_PATH, 'utf8'));

app.on('window-all-closed', function() {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on('ready', function() {
    mainWindow = new BrowserWindow(
        {
            width: appArgs.width || 1280,
            height: appArgs.height || 800,
            'web-preferences': {
                javascript: true,
                plugins: true,
            }
        }
    );
    mainWindow.loadUrl('file://' + __dirname + '/index.html');

    //mainWindow.openDevTools();
    mainWindow.webContents.on('did-finish-load', function() {

        mainWindow.webContents.send('params', JSON.stringify(appArgs));
    });

    // if the window is focused, clear the badge
    mainWindow.on('focus', function () {
        if (process.platform === 'darwin') {
            app.dock.setBadge('');
        }
    });

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});

// listen for a notification message
ipc.on('notification-message', function(event, arg) {
    if (arg === 'TITLE_CHANGED') {
        if (process.platform === 'darwin' && !mainWindow.isFocused()) {
            app.dock.setBadge('●');
        }
    }
});

app.on('window-all-closed', function() {
    app.quit();
});
