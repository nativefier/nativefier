import fs from 'fs';
import path from 'path';
import electron from 'electron';
import windowStateKeeper from 'electron-window-state';
import helpers from './../../helpers/helpers';
import createMenu from './../menu/menu';
import initContextMenu from './../contextMenu/contextMenu';

const {BrowserWindow, shell, ipcMain, dialog} = electron;
const {isOSX, linkIsInternal, getCssToInject} = helpers;

const ZOOM_INTERVAL = 0.1;

/**
 *
 * @param {{}} options AppArgs from nativefier.json
 * @param {function} onAppQuit
 * @param {function} setDockBadge
 * @returns {electron.BrowserWindow}
 */
function createMainWindow(options, onAppQuit, setDockBadge) {
    const mainWindowState = windowStateKeeper({
        defaultWidth: options.width || 1280,
        defaultHeight: options.height || 800
    });

    const mainWindow = new BrowserWindow({
        width: mainWindowState.width,
        height: mainWindowState.height,
        x: mainWindowState.x,
        y: mainWindowState.y,
        'auto-hide-menu-bar': !options.showMenuBar,
        // Convert dashes to spaces because on linux the app name is joined with dashes
        title: options.name,
        'web-preferences': {
            javascript: true,
            plugins: true,
            // node globals causes problems with sites like messenger.com
            nodeIntegration: false,
            webSecurity: !options.insecure,
            preload: path.join(__dirname, 'static', 'preload.js')
        },
        // after webpack path here should reference `resources/app/`
        icon: path.join(__dirname, '../', '/icon.png'),
        // set to undefined and not false because explicitly setting to false will disable full screen
        fullscreen: options.fullScreen || undefined
    });

    // after first run, no longer force full screen to be true
    if (options.fullScreen) {
        options.fullScreen = undefined;
        fs.writeFileSync(path.join(__dirname, '..', 'nativefier.json'), JSON.stringify(options));
    }

    let currentZoom = 1;

    const onZoomIn = () => {
        currentZoom += ZOOM_INTERVAL;
        mainWindow.webContents.send('change-zoom', currentZoom);
    };

    const onZoomOut = () => {
        currentZoom -= ZOOM_INTERVAL;
        mainWindow.webContents.send('change-zoom', currentZoom);
    };

    const clearAppData = () => {
        dialog.showMessageBox(mainWindow, {
            type: 'warning',
            buttons: ['Yes', 'Cancel'],
            defaultId: 1,
            title: 'Clear cache confirmation',
            message: 'This will clear all data (cookies, local storage etc) from this app. Are you sure you wish to proceed?'
        }, response => {
            if (response === 0) {
                const session = mainWindow.webContents.session;
                session.clearStorageData(() => {
                    session.clearCache(() => {
                        mainWindow.loadURL(options.targetUrl);
                    });
                });
            }
        });
    };

    const onGoBack = () => {
        mainWindow.webContents.goBack();
    };

    const onGoForward = () => {
        mainWindow.webContents.goForward();
    };

    const getCurrentUrl = () => {
        return mainWindow.webContents.getURL();
    };

    const menuOptions = {
        nativefierVersion: options.nativefierVersion,
        appQuit: onAppQuit,
        zoomIn: onZoomIn,
        zoomOut: onZoomOut,
        goBack: onGoBack,
        goForward: onGoForward,
        getCurrentUrl: getCurrentUrl,
        clearAppData: clearAppData
    };

    createMenu(menuOptions);
    initContextMenu(mainWindow);

    if (options.userAgent) {
        mainWindow.webContents.setUserAgent(options.userAgent);
    }

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('params', JSON.stringify(options));
        mainWindow.webContents.insertCSS(getCssToInject());
    });

    if (options.counter) {
        mainWindow.on('page-title-updated', () => {
            if (mainWindow.isFocused()) {
                return;
            }

            if (options.counter) {
                const itemCountRegex = /[\(\[{](\d*?)[}\]\)]/;
                const match = itemCountRegex.exec(mainWindow.getTitle());
                if (match) {
                    setDockBadge(match[1]);
                }
                return;
            }
            setDockBadge('●');
        });
    }

    mainWindow.webContents.on('new-window', (event, urlToGo) => {
        if (mainWindow.useDefaultWindowBehaviour) {
            mainWindow.useDefaultWindowBehaviour = false;
            return;
        }

        if (linkIsInternal(options.targetUrl, urlToGo)) {
            return;
        }
        event.preventDefault();
        shell.openExternal(urlToGo);
    });

    mainWindow.loadURL(options.targetUrl);

    mainWindow.on('focus', () => {
        setDockBadge('');
    });

    mainWindow.on('close', event => {
        if (mainWindow.isFullScreen()) {
            mainWindow.setFullScreen(false);
            mainWindow.once('leave-full-screen', maybeHideWindow.bind(this, mainWindow, event));
        }
        maybeHideWindow(mainWindow, event);
    });

    mainWindowState.manage(mainWindow);
    return mainWindow;
}

ipcMain.on('cancelNewWindowOverride', () => {
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach(window => {
        window.useDefaultWindowBehaviour = false;
    });
});

function maybeHideWindow(window, event) {
    if (isOSX()) {
        // this is called when exiting from clicking the cross button on the window
        event.preventDefault();
        window.hide();
    }
    // will close the window on other platforms
}

export default createMainWindow;
