import fs from 'fs';
import path from 'path';
import { BrowserWindow, shell, ipcMain, dialog } from 'electron';
import windowStateKeeper from 'electron-window-state';
import helpers from './../../helpers/helpers';
import createMenu from './../menu/menu';
import initContextMenu from './../contextMenu/contextMenu';

const { isOSX, linkIsInternal, getCssToInject, shouldInjectCss } = helpers;

const ZOOM_INTERVAL = 0.1;

function maybeHideWindow(window, event, fastQuit, tray) {
  if (isOSX() && !fastQuit) {
    // this is called when exiting from clicking the cross button on the window
    event.preventDefault();
    window.hide();
  } else if (!fastQuit && tray) {
    event.preventDefault();
    window.hide();
  }
  // will close the window on other platforms
}

function maybeInjectCss(browserWindow) {
  if (!shouldInjectCss()) {
    return;
  }

  const cssToInject = getCssToInject();

  const injectCss = () => {
    browserWindow.webContents.insertCSS(cssToInject);
  };

  browserWindow.webContents.on('did-finish-load', () => {
    // remove the injection of css the moment the page is loaded
    browserWindow.webContents.removeListener('did-get-response-details', injectCss);
  });

  // on every page navigation inject the css
  browserWindow.webContents.on('did-navigate', () => {
    // we have to inject the css in did-get-response-details to prevent the fouc
    // will run multiple times
    browserWindow.webContents.on('did-get-response-details', injectCss);
  });
}


/**
 *
 * @param {{}} inpOptions AppArgs from nativefier.json
 * @param {function} onAppQuit
 * @param {function} setDockBadge
 * @returns {electron.BrowserWindow}
 */
function createMainWindow(inpOptions, onAppQuit, setDockBadge) {
  const options = Object.assign({}, inpOptions);
  const mainWindowState = windowStateKeeper({
    defaultWidth: options.width || 1280,
    defaultHeight: options.height || 800,
  });

  const mainWindow = new BrowserWindow({
    frame: !options.hideWindowFrame,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: options.minWidth,
    minHeight: options.minHeight,
    maxWidth: options.maxWidth,
    maxHeight: options.maxHeight,
    x: mainWindowState.x,
    y: mainWindowState.y,
    autoHideMenuBar: !options.showMenuBar,
    // Convert dashes to spaces because on linux the app name is joined with dashes
    title: options.name,
    webPreferences: {
      javascript: true,
      plugins: true,
      // node globals causes problems with sites like messenger.com
      nodeIntegration: false,
      webSecurity: !options.insecure,
      preload: path.join(__dirname, 'static', 'preload.js'),
      zoomFactor: options.zoom,
    },
    // after webpack path here should reference `resources/app/`
    icon: path.join(__dirname, '../', '/icon.png'),
    // set to undefined and not false because explicitly setting to false will disable full screen
    fullscreen: options.fullScreen || undefined,
  });

  mainWindowState.manage(mainWindow);

  // after first run, no longer force maximize to be true
  if (options.maximize) {
    mainWindow.maximize();
    options.maximize = undefined;
    fs.writeFileSync(path.join(__dirname, '..', 'nativefier.json'), JSON.stringify(options));
  }

  let currentZoom = options.zoom;

  const onZoomIn = () => {
    currentZoom += ZOOM_INTERVAL;
    mainWindow.webContents.send('change-zoom', currentZoom);
  };

  const onZoomOut = () => {
    currentZoom -= ZOOM_INTERVAL;
    mainWindow.webContents.send('change-zoom', currentZoom);
  };

  const onZoomReset = () => {
    mainWindow.webContents.send('change-zoom', options.zoom);
  };

  const clearAppData = () => {
    dialog.showMessageBox(mainWindow, {
      type: 'warning',
      buttons: ['Yes', 'Cancel'],
      defaultId: 1,
      title: 'Clear cache confirmation',
      message: 'This will clear all data (cookies, local storage etc) from this app. Are you sure you wish to proceed?',
    }, (response) => {
      if (response !== 0) {
        return;
      }
      const session = mainWindow.webContents.session;
      session.clearStorageData(() => {
        session.clearCache(() => {
          mainWindow.loadURL(options.targetUrl);
        });
      });
    });
  };

  const onGoBack = () => {
    mainWindow.webContents.goBack();
  };

  const onGoForward = () => {
    mainWindow.webContents.goForward();
  };

  const getCurrentUrl = () => mainWindow.webContents.getURL();

  const menuOptions = {
    nativefierVersion: options.nativefierVersion,
    appQuit: onAppQuit,
    zoomIn: onZoomIn,
    zoomOut: onZoomOut,
    zoomReset: onZoomReset,
    zoomBuildTimeValue: options.zoom,
    goBack: onGoBack,
    goForward: onGoForward,
    getCurrentUrl,
    clearAppData,
    disableDevTools: options.disableDevTools,
  };

  createMenu(menuOptions);
  if (!options.disableContextMenu) {
    initContextMenu(mainWindow);
  }

  if (options.userAgent) {
    mainWindow.webContents.setUserAgent(options.userAgent);
  }

  maybeInjectCss(mainWindow);
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('params', JSON.stringify(options));
  });

  if (options.counter) {
    mainWindow.on('page-title-updated', (e, title) => {
      const itemCountRegex = /[([{](\d*?)\+?[}\])]/;
      const match = itemCountRegex.exec(title);
      if (match) {
        setDockBadge(match[1]);
      } else {
        setDockBadge('');
      }
    });
  } else {
    ipcMain.on('notification', () => {
      if (!isOSX() || mainWindow.isFocused()) {
        return;
      }
      setDockBadge('•');
    });
    mainWindow.on('focus', () => {
      setDockBadge('');
    });
  }

  mainWindow.webContents.on('new-window', (event, urlToGo) => {
    if (mainWindow.useDefaultWindowBehaviour) {
      mainWindow.useDefaultWindowBehaviour = false;
      return;
    }

    if (linkIsInternal(options.targetUrl, urlToGo, options.internalUrls)) {
      return;
    }
    event.preventDefault();
    shell.openExternal(urlToGo);
  });

  mainWindow.loadURL(options.targetUrl);

  mainWindow.on('close', (event) => {
    if (mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false);
      mainWindow.once('leave-full-screen', maybeHideWindow.bind(this, mainWindow, event, options.fastQuit));
    }
    maybeHideWindow(mainWindow, event, options.fastQuit, options.tray);
  });

  return mainWindow;
}

ipcMain.on('cancelNewWindowOverride', () => {
  const allWindows = BrowserWindow.getAllWindows();
  allWindows.forEach((window) => {
    // eslint-disable-next-line no-param-reassign
    window.useDefaultWindowBehaviour = false;
  });
});

export default createMainWindow;
