import * as fs from 'fs';
import * as path from 'path';

import {
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  Event,
  WebContents,
} from 'electron';
import windowStateKeeper from 'electron-window-state';
import log from 'loglevel';

import {
  isOSX,
  linkIsInternal,
  getCssToInject,
  shouldInjectCss,
  getAppIcon,
  nativeTabsSupported,
  getCounterValue,
} from '../helpers/helpers';
import { initContextMenu } from './contextMenu';
import { onNewWindowHelper } from './mainWindowHelpers';
import { createMenu } from './menu';

export const APP_ARGS_FILE_PATH = path.join(__dirname, '..', 'nativefier.json');
const ZOOM_INTERVAL = 0.1;

type SessionInteractionRequest = {
  id?: string;
  func?: string;
  funcArgs?: any[];
  property?: string;
  propertyValue?: any;
};

type SessionInteractionResult = {
  id?: string;
  value?: any;
  error?: Error;
};

function hideWindow(
  window: BrowserWindow,
  event: Event,
  fastQuit: boolean,
  tray,
): void {
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

function injectCss(browserWindow: BrowserWindow): void {
  if (!shouldInjectCss()) {
    return;
  }

  const cssToInject = getCssToInject();

  browserWindow.webContents.on('did-navigate', () => {
    // We must inject css early enough; so onHeadersReceived is a good place.
    // Will run multiple times, see `did-finish-load` below that unsets this handler.
    browserWindow.webContents.session.webRequest.onHeadersReceived(
      { urls: [] }, // Pass an empty filter list; null will not match _any_ urls
      (details, callback) => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        browserWindow.webContents.insertCSS(cssToInject);
        callback({ cancel: false, responseHeaders: details.responseHeaders });
      },
    );
  });
}

async function clearCache(browserWindow: BrowserWindow): Promise<void> {
  const { session } = browserWindow.webContents;
  await session.clearStorageData();
  await session.clearCache();
}

function setProxyRules(browserWindow: BrowserWindow, proxyRules): void {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  browserWindow.webContents.session.setProxy({
    proxyRules,
    pacScript: '',
    proxyBypassRules: '',
  });
}

export function saveAppArgs(newAppArgs: any) {
  try {
    fs.writeFileSync(APP_ARGS_FILE_PATH, JSON.stringify(newAppArgs));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(
      `WARNING: Ignored nativefier.json rewrital (${(err as Error).toString()})`,
    );
  }
}
/**
 * @param {{}} nativefierOptions AppArgs from nativefier.json
 * @param {function} onAppQuit
 * @param {function} setDockBadge
 */
export function createMainWindow(
  nativefierOptions,
  onAppQuit,
  setDockBadge,
): BrowserWindow {
  const options = { ...nativefierOptions };
  const mainWindowState = windowStateKeeper({
    defaultWidth: options.width || 1280,
    defaultHeight: options.height || 800,
  });

  const DEFAULT_WINDOW_OPTIONS = {
    // Convert dashes to spaces because on linux the app name is joined with dashes
    title: options.name,
    tabbingIdentifier: nativeTabsSupported() ? options.name : undefined,
    webPreferences: {
      javascript: true,
      plugins: true,
      nodeIntegration: false, // `true` is *insecure*, and cause trouble with messenger.com
      webSecurity: !options.insecure,
      preload: path.join(__dirname, 'preload.js'),
      zoomFactor: options.zoom,
    },
  };

  const browserwindowOptions = { ...options.browserwindowOptions };

  const mainWindow = new BrowserWindow({
    frame: !options.hideWindowFrame,
    width: mainWindowState.width,
    height: mainWindowState.height,
    minWidth: options.minWidth,
    minHeight: options.minHeight,
    maxWidth: options.maxWidth,
    maxHeight: options.maxHeight,
    x: options.x,
    y: options.y,
    autoHideMenuBar: !options.showMenuBar,
    icon: getAppIcon(),
    // set to undefined and not false because explicitly setting to false will disable full screen
    fullscreen: options.fullScreen || undefined,
    // Whether the window should always stay on top of other windows. Default is false.
    alwaysOnTop: options.alwaysOnTop,
    titleBarStyle: options.titleBarStyle,
    show: options.tray !== 'start-in-tray',
    backgroundColor: options.backgroundColor,
    ...DEFAULT_WINDOW_OPTIONS,
    ...browserwindowOptions,
  });

  mainWindowState.manage(mainWindow);

  // after first run, no longer force maximize to be true
  if (options.maximize) {
    mainWindow.maximize();
    options.maximize = undefined;
    saveAppArgs(options);
  }

  if (options.tray === 'start-in-tray') {
    mainWindow.hide();
  }

  const withFocusedWindow = (block: (window: BrowserWindow) => void): void => {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      return block(focusedWindow);
    }
    return undefined;
  };

  const adjustWindowZoom = (
    window: BrowserWindow,
    adjustment: number,
  ): void => {
    window.webContents.zoomFactor = window.webContents.zoomFactor + adjustment;
  };

  const onZoomIn = (): void => {
    withFocusedWindow((focusedWindow: BrowserWindow) =>
      adjustWindowZoom(focusedWindow, ZOOM_INTERVAL),
    );
  };

  const onZoomOut = (): void => {
    withFocusedWindow((focusedWindow: BrowserWindow) =>
      adjustWindowZoom(focusedWindow, -ZOOM_INTERVAL),
    );
  };

  const onZoomReset = (): void => {
    withFocusedWindow((focusedWindow: BrowserWindow) => {
      focusedWindow.webContents.zoomFactor = options.zoom;
    });
  };

  const clearAppData = async (): Promise<void> => {
    const response = await dialog.showMessageBox(mainWindow, {
      type: 'warning',
      buttons: ['Yes', 'Cancel'],
      defaultId: 1,
      title: 'Clear cache confirmation',
      message:
        'This will clear all data (cookies, local storage etc) from this app. Are you sure you wish to proceed?',
    });

    if (response.response !== 0) {
      return;
    }
    await clearCache(mainWindow);
  };

  const onGoBack = (): void => {
    withFocusedWindow((focusedWindow) => {
      focusedWindow.webContents.goBack();
    });
  };

  const onGoForward = (): void => {
    withFocusedWindow((focusedWindow) => {
      focusedWindow.webContents.goForward();
    });
  };

  const getCurrentUrl = (): void =>
    withFocusedWindow((focusedWindow) => focusedWindow.webContents.getURL());

  const gotoUrl = (url: string): void =>
    withFocusedWindow((focusedWindow) => void focusedWindow.loadURL(url));

  const onBlockedExternalUrl = (url: string) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    dialog.showMessageBox(mainWindow, {
      message: `Cannot navigate to external URL: ${url}`,
      type: 'error',
      title: 'Navigation blocked',
    });
  };

  const onWillNavigate = (event: Event, urlToGo: string): void => {
    if (!linkIsInternal(options.targetUrl, urlToGo, options.internalUrls)) {
      event.preventDefault();
      if (options.blockExternalUrls) {
        onBlockedExternalUrl(urlToGo);
      } else {
        shell.openExternal(urlToGo); // eslint-disable-line @typescript-eslint/no-floating-promises
      }
    }
  };

  const onWillPreventUnload = (event: Event): void => {
    log.debug('onWillPreventUnload', event);
    const eventAny = event as any;
    if (eventAny.sender === undefined) {
      return;
    }
    const webContents: WebContents = eventAny.sender;
    const browserWindow = BrowserWindow.fromWebContents(webContents);
    const choice = dialog.showMessageBoxSync(browserWindow, {
      type: 'question',
      buttons: ['Proceed', 'Stay'],
      message:
        'You may have unsaved changes, are you sure you want to proceed?',
      title: 'Changes you made may not be saved.',
      defaultId: 0,
      cancelId: 1,
    });
    if (choice === 0) {
      event.preventDefault();
    }
  };

  const createNewWindow: (url: string) => BrowserWindow = (url: string) => {
    const window = new BrowserWindow(DEFAULT_WINDOW_OPTIONS);
    if (options.userAgent) {
      window.webContents.userAgent = options.userAgent;
    }

    if (options.proxyRules) {
      setProxyRules(window, options.proxyRules);
    }

    injectCss(window);
    sendParamsOnDidFinishLoad(window);
    window.webContents.on('new-window', onNewWindow);
    window.webContents.on('will-navigate', onWillNavigate);
    window.webContents.on('will-prevent-unload', onWillPreventUnload);
    window.loadURL(url); // eslint-disable-line @typescript-eslint/no-floating-promises
    return window;
  };

  const createNewTab = (url: string, foreground: boolean): BrowserWindow => {
    withFocusedWindow((focusedWindow) => {
      const newTab = createNewWindow(url);
      focusedWindow.addTabbedWindow(newTab);
      if (!foreground) {
        focusedWindow.focus();
      }
      return newTab;
    });
    return undefined;
  };

  const createAboutBlankWindow = (): BrowserWindow => {
    const window = createNewWindow('about:blank');
    window.hide();
    window.webContents.once('did-stop-loading', () => {
      if (window.webContents.getURL() === 'about:blank') {
        window.close();
      } else {
        window.show();
      }
    });
    return window;
  };

  const onNewWindow = (
    event: Event & { newGuest?: any },
    urlToGo: string,
    frameName: string,
    disposition,
  ): void => {
    const preventDefault = (newGuest: any): void => {
      event.preventDefault();
      if (newGuest) {
        event.newGuest = newGuest;
      }
    };
    onNewWindowHelper(
      urlToGo,
      disposition,
      options.targetUrl,
      options.internalUrls,
      preventDefault,
      shell.openExternal.bind(this),
      createAboutBlankWindow,
      nativeTabsSupported,
      createNewTab,
      options.blockExternalUrls,
      onBlockedExternalUrl,
    );
  };

  const sendParamsOnDidFinishLoad = (window: BrowserWindow): void => {
    window.webContents.on('did-finish-load', () => {
      // In children windows too: Restore pinch-to-zoom, disabled by default in recent Electron.
      // See https://github.com/nativefier/nativefier/issues/379#issuecomment-598612128
      // and https://github.com/electron/electron/pull/12679
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      window.webContents.setVisualZoomLevelLimits(1, 3);

      window.webContents.send('params', JSON.stringify(options));
    });
  };

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
    gotoUrl,
    clearAppData,
    disableDevTools: options.disableDevTools,
  };

  createMenu(menuOptions);
  if (!options.disableContextMenu) {
    initContextMenu(
      createNewWindow,
      nativeTabsSupported() ? createNewTab : undefined,
    );
  }

  if (options.userAgent) {
    mainWindow.webContents.userAgent = options.userAgent;
  }

  if (options.proxyRules) {
    setProxyRules(mainWindow, options.proxyRules);
  }

  injectCss(mainWindow);
  sendParamsOnDidFinishLoad(mainWindow);

  if (options.counter) {
    mainWindow.on('page-title-updated', (e, title) => {
      const counterValue = getCounterValue(title);
      if (counterValue) {
        setDockBadge(counterValue, options.bounce);
      } else {
        setDockBadge('');
      }
    });
  } else {
    ipcMain.on('notification', () => {
      if (!isOSX() || mainWindow.isFocused()) {
        return;
      }
      setDockBadge('•', options.bounce);
    });
    mainWindow.on('focus', () => {
      setDockBadge('');
    });
  }

  ipcMain.on('notification-click', () => {
    mainWindow.show();
  });

  // See API.md / "Accessing The Electron Session"
  ipcMain.on(
    'session-interaction',
    (event, request: SessionInteractionRequest) => {
      log.debug('session-interaction:event', event);
      log.debug('session-interaction:request', request);

      const result: SessionInteractionResult = { id: request.id };
      let awaitingPromise = false;
      try {
        if (request.func !== undefined) {
          // If no funcArgs provided, we'll just use an empty array
          if (request.funcArgs === undefined || request.funcArgs === null) {
            request.funcArgs = [];
          }

          // If funcArgs isn't an array, we'll be nice and make it a single item array
          if (typeof request.funcArgs[Symbol.iterator] !== 'function') {
            request.funcArgs = [request.funcArgs];
          }

          // Call func with funcArgs
          result.value = mainWindow.webContents.session[request.func](
            ...request.funcArgs,
          );

          if (
            result.value !== undefined &&
            typeof result.value['then'] === 'function'
          ) {
            // This is a promise. We'll resolve it here otherwise it will blow up trying to serialize it in the reply
            result.value.then((trueResultValue) => {
              result.value = trueResultValue;
              log.debug('session-interaction:result', result);
              event.reply('session-interaction-reply', result);
            });
            awaitingPromise = true;
          }
        } else if (request.property !== undefined) {
          if (request.propertyValue !== undefined) {
            // Set the property
            mainWindow.webContents.session[request.property] =
              request.propertyValue;
          }

          // Get the property value
          result.value = mainWindow.webContents.session[request.property];
        } else {
          // Why even send the event if you're going to do this? You're just wasting time! ;)
          throw Error(
            'Received neither a func nor a property in the request. Unable to process.',
          );
        }

        // If we are awaiting a promise, that will return the reply instead, else
        if (!awaitingPromise) {
          log.debug('session-interaction:result', result);
          event.reply('session-interaction-reply', result);
        }
      } catch (error) {
        log.error('session-interaction:error', error, event, request);
        result.error = error;
        result.value = undefined; // Clear out the value in case serializing the value is what got us into this mess in the first place
        event.reply('session-interaction-reply', result);
      }
    },
  );

  mainWindow.webContents.on('new-window', onNewWindow);
  mainWindow.webContents.on('will-navigate', onWillNavigate);
  mainWindow.webContents.on('will-prevent-unload', onWillPreventUnload);
  mainWindow.webContents.on('did-finish-load', () => {
    // Restore pinch-to-zoom, disabled by default in recent Electron.
    // See https://github.com/nativefier/nativefier/issues/379#issuecomment-598309817
    // and https://github.com/electron/electron/pull/12679
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    mainWindow.webContents.setVisualZoomLevelLimits(1, 3);

    // Remove potential css injection code set in `did-navigate`) (see injectCss code)
    mainWindow.webContents.session.webRequest.onHeadersReceived(null);
  });

  if (options.clearCache) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    clearCache(mainWindow);
  }

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  mainWindow.loadURL(options.targetUrl);

  // @ts-ignore
  mainWindow.on('new-tab', () => createNewTab(options.targetUrl, true));

  mainWindow.on('close', (event) => {
    if (mainWindow.isFullScreen()) {
      if (nativeTabsSupported()) {
        mainWindow.moveTabToNewWindow();
      }
      mainWindow.setFullScreen(false);
      mainWindow.once(
        'leave-full-screen',
        hideWindow.bind(this, mainWindow, event, options.fastQuit),
      );
    }
    hideWindow(mainWindow, event, options.fastQuit, options.tray);

    if (options.clearCache) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      clearCache(mainWindow);
    }
  });

  return mainWindow;
}
