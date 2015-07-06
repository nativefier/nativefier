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

app.on('window-all-closed', function() {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on('ready', function() {
    mainWindow = new BrowserWindow(
        {
            width: 1280,
            height: 800,
            'web-preferences': {
                javascript: true,
                plugins: true,
            }
        }
    );
    mainWindow.loadUrl('file://' + __dirname + '/index.html');

    mainWindow.openDevTools();
    mainWindow.webContents.on('did-finish-load', function() {
        fs.readFile(APP_ARGS_FILE_PATH, 'utf8', function (error, data) {
            if (error) {
                console.error('Error reading file: ' + error);
            } else {
                console.log(data);
                mainWindow.webContents.send('params', data);

            }

        })
    });

    // if the window is focused, clear the badge
    mainWindow.on('focus', function () {
        app.dock.setBadge('');
    });

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});

// listen for a notification message
ipc.on('notification-message', function(event, arg) {
    console.log(arg);  // prints "ping"
    if (arg === 'TITLE_CHANGED') {
        if (!mainWindow.isFocused()) {
            app.dock.setBadge('●');
        }
    }
});