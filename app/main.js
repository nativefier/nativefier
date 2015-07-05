/**
 * Created by JiaHao on 4/7/15.
 */


var app = require('app');
var fs = require('fs');
var BrowserWindow = require('browser-window');

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


    mainWindow.on('closed', function() {
        mainWindow = null;
    })

});

