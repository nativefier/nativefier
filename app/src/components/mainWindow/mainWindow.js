var path = require('path');
var electron = require('electron');
var windowStateKeeper = require('electron-window-state');
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
 * @param {function} onAppQuit
 * @param {function} setDockBadge
 * @returns {electron.BrowserWindow}
 */
function createMainWindow(options, onAppQuit, setDockBadge) {
    var mainWindowState = windowStateKeeper({
        defaultWidth: options.width || 1280,
        defaultHeight: options.height || 800
    });
    var mainWindow = new BrowserWindow(
        {
            width: mainWindowState.width,
            height: mainWindowState.height,
            x: mainWindowState.x,
            y: mainWindowState.y,
            title: options.name,
            'web-preferences': {
                javascript: true,
                plugins: true,
                nodeIntegration: false,
                preload: path.join(__dirname, 'static', 'preload.js')
            },
            icon: options.icon || path.join(__dirname, '/icon.png') // hardcoded by default until you decide how to pass in an icon
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

    createMenu(options.nativefierVersion, onAppQuit, mainWindow.webContents.goBack, mainWindow.webContents.goForward, onZoomIn, onZoomOut);

    if (options.userAgent) {
        mainWindow.webContents.setUserAgent(options.userAgent);
    }

    mainWindow.webContents.on('did-finish-load', function () {
        mainWindow.webContents.send('params', JSON.stringify(options));
    });

    if (options.counter) {
        mainWindow.on('page-title-updated', function () {

            if (mainWindow.isFocused()) {
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
        setDockBadge('');
    });

    mainWindow.on('close', event => {
        if (mainWindow.isFullScreen()) {
            mainWindow.setFullScreen(false);
            mainWindow.once('leave-full-screen', maybeHideWindow.bind(this, mainWindow, event));
        }
        maybeHideWindow(mainWindow, event)
    });

    mainWindowState.manage(mainWindow);
    return mainWindow;
}

function maybeHideWindow(window, event) {
    if (isOSX()) {
        // this is called when exiting from clicking the cross button on the window
        event.preventDefault();
        window.hide();
    }
    // will close the window on other platforms
}

module.exports = createMainWindow;
