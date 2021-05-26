import * as fs from 'fs';
import * as path from 'path';

import { ipcMain, BrowserWindow, IpcMainEvent } from 'electron';
import windowStateKeeper from 'electron-window-state';
import log from 'loglevel';

import {
  getAppIcon,
  getCounterValue,
  isOSX,
  nativeTabsSupported,
  openExternal,
} from '../helpers/helpers';
import {
  onNewWindow,
  onWillNavigate,
  onWillPreventUnload,
} from '../helpers/windowEvents';
import {
  clearAppData,
  clearCache,
  createNewTab,
  createNewWindow,
  getCurrentURL,
  getDefaultWindowOptions,
  goBack,
  goForward,
  goToURL,
  hideWindow,
  injectCSS,
  sendParamsOnDidFinishLoad,
  setProxyRules,
  zoomIn,
  zoomOut,
  zoomReset,
} from '../helpers/windowHelpers';
import { initContextMenu } from './contextMenu';
import { createMenu } from './menu';

export const APP_ARGS_FILE_PATH = path.join(__dirname, '..', 'nativefier.json');

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

/**
 * @param {{}} nativefierOptions AppArgs from nativefier.json
 * @param {function} onAppQuit
 * @param {function} setDockBadge
 */
export async function createMainWindow(
  nativefierOptions,
  onAppQuit: () => void,
  setDockBadge: (value: number | string, bounce?: boolean) => void,
): Promise<BrowserWindow> {
  const options = { ...nativefierOptions };

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
    x: options.x,
    y: options.y,
    autoHideMenuBar: !options.showMenuBar,
    icon: getAppIcon(),
    // set to undefined and not false because explicitly setting to false will disable full screen
    fullscreen: options.fullScreen ?? undefined,
    // Whether the window should always stay on top of other windows. Default is false.
    alwaysOnTop: options.alwaysOnTop,
    titleBarStyle: options.titleBarStyle,
    show: options.tray !== 'start-in-tray',
    backgroundColor: options.backgroundColor,
    ...getDefaultWindowOptions(options),
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

  createMainMenu(options, mainWindow, onAppQuit);
  createContextMenu(options, mainWindow);
  setupNativefierWindow(options, mainWindow);

  if (options.counter) {
    setupCounter(options, mainWindow, setDockBadge);
  } else {
    setupNotificationBadge(options, mainWindow, setDockBadge);
  }

  ipcMain.on('notification-click', () => {
    log.debug('ipcMain.notification-click');
    mainWindow.show();
  });

  setupSessionInteraction(options, mainWindow);

  if (options.clearCache) {
    await clearCache(mainWindow);
  }

  await mainWindow.loadURL(options.targetUrl);

  setupCloseEvent(options, mainWindow);

  return mainWindow;
}

function createContextMenu(options, window: BrowserWindow): void {
  if (!options.disableContextMenu) {
    initContextMenu(
      createNewWindow,
      nativeTabsSupported()
        ? (url: string, foreground: boolean) =>
            createNewTab(
              options,
              setupNativefierWindow,
              url,
              foreground,
              window,
            )
        : undefined,
      openExternal,
      window,
    );
  }
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

function setupCloseEvent(options, window: BrowserWindow) {
  window.on('close', (event: IpcMainEvent) => {
    log.debug('mainWindow.close', event);
    if (window.isFullScreen()) {
      if (nativeTabsSupported()) {
        window.moveTabToNewWindow();
      }
      window.setFullScreen(false);
      window.once('leave-full-screen', (event: IpcMainEvent) =>
        hideWindow(window, event, options.fastQuit, options.tray),
      );
    }
    hideWindow(window, event, options.fastQuit, options.tray);

    if (options.clearCache) {
      clearCache(window).catch((err) => log.error('clearCache ERROR', err));
    }
  });
}

function setupCounter(
  options,
  window: BrowserWindow,
  setDockBadge: (value: number | string, bounce?: boolean) => void,
) {
  window.on('page-title-updated', (event, title) => {
    log.debug('mainWindow.page-title-updated', { event, title });
    const counterValue = getCounterValue(title);
    if (counterValue) {
      setDockBadge(counterValue, options.bounce);
    } else {
      setDockBadge('');
    }
  });
}

function createMainMenu(
  options: any,
  window: BrowserWindow,
  onAppQuit: () => void,
) {
  const menuOptions = {
    nativefierVersion: options.nativefierVersion,
    appQuit: onAppQuit,
    clearAppData: () => clearAppData(window),
    disableDevTools: options.disableDevTools,
    getCurrentURL,
    goBack,
    goForward,
    goToURL,
    openExternal,
    zoomBuildTimeValue: options.zoom,
    zoomIn,
    zoomOut,
    zoomReset,
  };

  createMenu(menuOptions);
}

function setupNotificationBadge(
  options,
  window: BrowserWindow,
  setDockBadge: (value: number | string, bounce?: boolean) => void,
): void {
  ipcMain.on('notification', () => {
    log.debug('ipcMain.notification');
    if (!isOSX() || window.isFocused()) {
      return;
    }
    setDockBadge('•', options.bounce);
  });
  window.on('focus', () => {
    log.debug('mainWindow.focus');
    setDockBadge('');
  });
}

export function setupNativefierWindow(options, window: BrowserWindow): void {
  if (options.userAgent) {
    window.webContents.userAgent = options.userAgent;
  }

  if (options.proxyRules) {
    setProxyRules(window, options.proxyRules);
  }

  injectCSS(window);

  // .on('new-window', ...) is deprected in favor of setWindowOpenHandler(...)
  // We can't quite cut over to that yet for a few reasons:
  // 1. Our version of Electron does not yet support a parameter to
  //    setWindowOpenHandler that contains `disposition', which we need.
  //    See https://github.com/electron/electron/issues/28380
  // 2. setWindowOpenHandler doesn't support newGuest as well
  // Though at this point, 'new-window' bugs seem to be coming up and downstream
  // users are being pointed to use setWindowOpenHandler.
  // E.g., https://github.com/electron/electron/issues/28374

  window.webContents.on('new-window', (event, url, frameName, disposition) => {
    onNewWindow(
      options,
      setupNativefierWindow,
      event,
      url,
      frameName,
      disposition,
    ).catch((err) => log.error('onNewWindow ERROR', err));
  });
  window.webContents.on('will-navigate', (event: IpcMainEvent, url: string) => {
    onWillNavigate(options, event, url).catch((err) => {
      log.error(' window.webContents.on.will-navigate ERROR', err);
      event.preventDefault();
    });
  });
  window.webContents.on('will-prevent-unload', onWillPreventUnload);

  sendParamsOnDidFinishLoad(options, window);

  // @ts-ignore new-tab isn't in the type definition, but it does exist
  window.on('new-tab', () => {
    createNewTab(
      options,
      setupNativefierWindow,
      options.targetUrl,
      true,
      window,
    ).catch((err) => log.error('new-tab ERROR', err));
  });
}

function setupSessionInteraction(options, window: BrowserWindow): void {
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
          result.value = window.webContents.session[request.func](
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
            window.webContents.session[request.property] =
              request.propertyValue;
          }

          // Get the property value
          result.value = window.webContents.session[request.property];
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
}
