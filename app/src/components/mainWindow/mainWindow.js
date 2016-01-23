var path = require('path');
var electron = require('electron');
var helpers = require('./../../helpers/helpers');
var createMenu = require('./../menu/menu');

var BrowserWindow = electron.BrowserWindow;
var shell = electron.shell;
var isOSX = helpers.isOSX;
var linkIsInternal = helpers.linkIsInternal;

const ZOOM_INTERVAL = 0.1;

/**
 *
 * @param {{}} options AppArgs from nativefier.json
 * @param {electron.app.quit} onAppQuit
 * @param {electron.app.dock.setBadge} setDockBadge
 * @returns {electron.BrowserWindow}
 */
function createMainWindow(options, onAppQuit, setDockBadge) {
    var mainWindow = new BrowserWindow(
        {
            width: options.width || 1280,
            height: options.height || 800,
            'web-preferences': {
                javascript: true,
                plugins: true,
                nodeIntegration: false,
                preload: path.join(__dirname, 'static', 'preload.js')
            }
        }
    );

    var currentZoom = 1;

    var onZoomIn = function () {
        currentZoom += ZOOM_INTERVAL;
        mainWindow.webContents.send('change-zoom', currentZoom);
    };

    var onZoomOut = function () {
        currentZoom -= ZOOM_INTERVAL;
        mainWindow.webContents.send('change-zoom', currentZoom);
    };

    createMenu(options.nativefierVersion, onAppQuit, onZoomIn, onZoomOut);

    if (options.userAgent) {
        mainWindow.webContents.setUserAgent(options.userAgent);
    }

    mainWindow.webContents.on('did-finish-load', function () {
        mainWindow.webContents.send('params', JSON.stringify(options));
    });

    if (options.counter) {
        mainWindow.on('page-title-updated', function () {

            if (!isOSX() || mainWindow.isFocused()) {
                return;
            }

            if (options.counter) {
                var itemCountRegex = /[\(](\d*?)[\)]/;
                var match = itemCountRegex.exec(mainWindow.getTitle());
                if (match) {
                    setDockBadge(match[1]);
                }
                return;
            }

            setDockBadge('●');
        });
    }

    mainWindow.webContents.on('new-window', function (event, urlToGo) {
        if (linkIsInternal(options.targetUrl, urlToGo)) {
            return;
        }
        event.preventDefault();
        shell.openExternal(urlToGo);
    });

    mainWindow.loadURL(options.targetUrl);

    mainWindow.on('focus', function () {
        if (!isOSX()) {
            return;
        }

        setDockBadge('');
    });

    mainWindow.on('close', (e) => {
        if (isOSX()) {
            // this is called when exiting from clicking the cross button on the window
            e.preventDefault();
            mainWindow.hide();
        }
    });

    return mainWindow;
}

module.exports = createMainWindow;
