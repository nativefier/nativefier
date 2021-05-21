import * as fs from 'fs';
import * as path from 'path';

import {
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  Event,
  HeadersReceivedResponse,
  OnHeadersReceivedListenerDetails,
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
import { BrowserWindowConstructorOptions } from 'electron/main';

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
    log.debug('browserWindow.webContents.did-navigate');
    // We must inject css early enough; so onHeadersReceived is a good place.
    // Will run multiple times, see `did-finish-load` below that unsets this handler.
    browserWindow.webContents.session.webRequest.onHeadersReceived(
      { urls: [] }, // Pass an empty filter list; null will not match _any_ urls
      (
        details: OnHeadersReceivedListenerDetails,
        callback: (headersReceivedResponse: HeadersReceivedResponse) => void,
      ) => {
        log.debug(
          'browserWindow.webContents.session.webRequest.onHeadersReceived',
          { details, callback },
        );
        if (details.webContents) {
          details.webContents
            .insertCSS(cssToInject)
            .catch((err) => log.error('webContents.insertCSS ERROR', err));
        }
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
  browserWindow.webContents.session
    .setProxy({
      proxyRules,
      pacScript: '',
      proxyBypassRules: '',
    })
    .catch((err) => log.error('session.setProxy ERROR', err));
}

export function saveAppArgs(newAppArgs: any) {
  try {
    fs.writeFileSync(APP_ARGS_FILE_PATH, JSON.stringify(newAppArgs));
  } catch (err) {
    // eslint-disable-next-line no-console
    log.warn(
      `WARNING: Ignored nativefier.json rewrital (${(
        err as Error
      ).toString()})`,
    );
  }
}

export type createWindowResult = {
  window: BrowserWindow;
  setupWindow: (window: BrowserWindow) => void;
};

/**
 * @param {{}} nativefierOptions AppArgs from nativefier.json
 * @param {function} onAppQuit
 * @param {function} setDockBadge
 */
export async function createMainWindow(
  nativefierOptions,
  onAppQuit,
  setDockBadge,
): Promise<createWindowResult> {
  const options = { ...nativefierOptions };
  const mainWindowState = windowStateKeeper({
    defaultWidth: options.width || 1280,
    defaultHeight: options.height || 800,
  });

  const DEFAULT_WINDOW_OPTIONS: BrowserWindowConstructorOptions = {
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
    ...options.browserwindowOptions,
  };

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
    mainWindow.on('page-title-updated', (event, title) => {
      log.debug('mainWindow.page-title-updated', { event, title });
      const counterValue = getCounterValue(title);
      if (counterValue) {
        setDockBadge(counterValue, options.bounce);
      } else {
        setDockBadge('');
      }
    });
  } else {
    ipcMain.on('notification', () => {
      log.debug('ipcMain.notification');
      if (!isOSX() || mainWindow.isFocused()) {
        return;
      }
      setDockBadge('•', options.bounce);
    });
    mainWindow.on('focus', () => {
      log.debug('mainWindow.focus');
      setDockBadge('');
    });
  }

  ipcMain.on('notification-click', () => {
    log.debug('ipcMain.notification-click');
    mainWindow.show();
  });

  // See API.md / "Accessing The Electron Session"
  ipcMain.on(
    'session-interaction',
    (event, request: SessionInteractionRequest) => {
      log.debug('ipcMain.session-interaction', { event, request });

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
            result.value
              .then((trueResultValue) => {
                result.value = trueResultValue;
                log.debug('ipcMain.session-interaction:result', result);
                event.reply('session-interaction-reply', result);
              })
              .catch((err) =>
                log.error('session-interaction ERROR', request, err),
              );
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
    log.debug('mainWindow.webContents.did-finish-load');
    // Restore pinch-to-zoom, disabled by default in recent Electron.
    // See https://github.com/nativefier/nativefier/issues/379#issuecomment-598309817
    // and https://github.com/electron/electron/pull/12679
    mainWindow.webContents
      .setVisualZoomLevelLimits(1, 3)
      .catch((err) => log.error('webContents.setVisualZoomLevelLimits', err));

    // Remove potential css injection code set in `did-navigate`) (see injectCss code)
    mainWindow.webContents.session.webRequest.onHeadersReceived(null);
  });

  if (options.clearCache) {
    await clearCache(mainWindow);
  }

  await mainWindow.loadURL(options.targetUrl);

  // @ts-ignore new-tab isn't in the type definition, but it does exist
  mainWindow.on('new-tab', () => createNewTab(options.targetUrl, true));

  mainWindow.on('close', (event) => {
    log.debug('mainWindow.close', event);
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
      clearCache(mainWindow).catch((err) => log.error('clearCache ERROR', err));
    }
  });

  return { window: mainWindow, setupWindow };

  function withFocusedWindow(block: (window: BrowserWindow) => void): void {
    const focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      return block(focusedWindow);
    }
    return undefined;
  }

  function adjustWindowZoom(window: BrowserWindow, adjustment: number): void {
    window.webContents.zoomFactor = window.webContents.zoomFactor + adjustment;
  }

  function onZoomIn(): void {
    log.debug('onZoomIn');
    withFocusedWindow((focusedWindow: BrowserWindow) =>
      adjustWindowZoom(focusedWindow, ZOOM_INTERVAL),
    );
  }

  function onZoomOut(): void {
    log.debug('onZoomOut');
    withFocusedWindow((focusedWindow: BrowserWindow) =>
      adjustWindowZoom(focusedWindow, -ZOOM_INTERVAL),
    );
  }

  function onZoomReset(): void {
    log.debug('onZoomReset');
    withFocusedWindow((focusedWindow: BrowserWindow) => {
      focusedWindow.webContents.zoomFactor = options.zoom;
    });
  }

  async function clearAppData(): Promise<void> {
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
  }

  function onGoBack(): void {
    log.debug('onGoBack');
    withFocusedWindow((focusedWindow) => {
      focusedWindow.webContents.goBack();
    });
  }

  function onGoForward(): void {
    log.debug('onGoForward');
    withFocusedWindow((focusedWindow) => {
      focusedWindow.webContents.goForward();
    });
  }

  function getCurrentUrl(): void {
    return withFocusedWindow((focusedWindow) =>
      focusedWindow.webContents.getURL(),
    );
  }

  function gotoUrl(url: string): void {
    return withFocusedWindow(
      (focusedWindow) => void focusedWindow.loadURL(url),
    );
  }

  function onBlockedExternalUrl(url: string) {
    log.debug('onBlockedExternalUrl', url);
    dialog
      .showMessageBox(mainWindow, {
        message: `Cannot navigate to external URL: ${url}`,
        type: 'error',
        title: 'Navigation blocked',
      })
      .catch((err) => log.error('dialog.showMessageBox ERROR', err));
  }

  function onWillNavigate(event: Event, urlToGo: string): void {
    log.debug('onWillNavigate', { event, urlToGo });
    if (!linkIsInternal(options.targetUrl, urlToGo, options.internalUrls)) {
      event.preventDefault();
      if (options.blockExternalUrls) {
        onBlockedExternalUrl(urlToGo);
      } else {
        shell
          .openExternal(urlToGo)
          .catch((err) => log.error('shell.openExternal ERROR', err));
      }
    }
  }

  function onWillPreventUnload(event: Event): void {
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
  }

  function createNewWindow(url: string): BrowserWindow {
    const window = new BrowserWindow(DEFAULT_WINDOW_OPTIONS);
    setupWindow(window);
    window.loadURL(url).catch((err) => log.error('window.loadURL ERROR', err));
    return window;
  }

  function setupWindow(window: BrowserWindow): void {
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
  }

  function createNewTab(url: string, foreground: boolean): BrowserWindow {
    log.debug('createNewTab', { url, foreground });
    withFocusedWindow((focusedWindow) => {
      const newTab = createNewWindow(url);
      focusedWindow.addTabbedWindow(newTab);
      if (!foreground) {
        focusedWindow.focus();
      }
      return newTab;
    });
    return undefined;
  }

  function createAboutBlankWindow(): BrowserWindow {
    const window = createNewWindow('about:blank');
    setupWindow(window);
    window.show();
    window.focus();
    return window;
  }

  function onNewWindow(
    event: Event & { newGuest?: any },
    urlToGo: string,
    frameName: string,
    disposition:
      | 'default'
      | 'foreground-tab'
      | 'background-tab'
      | 'new-window'
      | 'save-to-disk'
      | 'other',
  ): void {
    log.debug('onNewWindow', { event, urlToGo, frameName, disposition });
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
  }

  function sendParamsOnDidFinishLoad(window: BrowserWindow): void {
    window.webContents.on('did-finish-load', () => {
      log.debug(
        'sendParamsOnDidFinishLoad.window.webContents.did-finish-load',
        window.webContents.getURL(),
      );
      // In children windows too: Restore pinch-to-zoom, disabled by default in recent Electron.
      // See https://github.com/nativefier/nativefier/issues/379#issuecomment-598612128
      // and https://github.com/electron/electron/pull/12679
      window.webContents
        .setVisualZoomLevelLimits(1, 3)
        .catch((err) => log.error('webContents.setVisualZoomLevelLimits', err));

      window.webContents.send('params', JSON.stringify(options));
    });
  }
}
