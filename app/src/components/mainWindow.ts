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
} from '../helpers/helpers';
import { onNewWindow, setupNativefierWindow } from '../helpers/windowEvents';
import {
  clearCache,
  getDefaultWindowOptions,
  hideWindow,
} from '../helpers/windowHelpers';
import { initContextMenu } from './contextMenu';
import { createMenu } from './menu';

export const APP_ARGS_FILE_PATH = path.join(__dirname, '..', 'nativefier.json');

type SessionInteractionRequest = {
  id?: string;
  func?: string;
  funcArgs?: unknown[];
  property?: string;
  propertyValue?: unknown;
};

type SessionInteractionResult = {
  id?: string;
  value?: unknown;
  error?: Error;
};

/**
 * @param {{}} nativefierOptions AppArgs from nativefier.json
 * @param {function} setDockBadge
 */
export async function createMainWindow(
  nativefierOptions,
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
    fullscreen: options.fullScreen,
    // Whether the window should always stay on top of other windows. Default is false.
    alwaysOnTop: options.alwaysOnTop,
    titleBarStyle: options.titleBarStyle,
    show: options.tray !== 'start-in-tray',
    backgroundColor: options.backgroundColor,
    ...getDefaultWindowOptions(options),
  });

  // Just load about:blank to start, gives Spectron something to latch onto initially for testing.
  await mainWindow.loadURL('about:blank');

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
  createMenu(options, mainWindow);
  createContextMenu(options, mainWindow);
  setupNativefierWindow(options, mainWindow);

  // .on('new-window', ...) is deprected in favor of setWindowOpenHandler(...)
  // We can't quite cut over to that yet for a few reasons:
  // 1. Our version of Electron does not yet support a parameter to
  //    setWindowOpenHandler that contains `disposition', which we need.
  //    See https://github.com/electron/electron/issues/28380
  // 2. setWindowOpenHandler doesn't support newGuest as well
  // Though at this point, 'new-window' bugs seem to be coming up and downstream
  // users are being pointed to use setWindowOpenHandler.
  // E.g., https://github.com/electron/electron/issues/28374

  // Note it is important to add this handler only to the *main* window,
  // else we run into weird behavior like opening tabs twice
  mainWindow.webContents.on(
    'new-window',
    (event, url, frameName, disposition) => {
      onNewWindow(
        options,
        setupNativefierWindow,
        event,
        url,
        frameName,
        disposition,
      ).catch((err) => log.error('onNewWindow ERROR', err));
    },
  );

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
    initContextMenu(options, window);
  }
}

export function saveAppArgs(newAppArgs: any): void {
  try {
    fs.writeFileSync(APP_ARGS_FILE_PATH, JSON.stringify(newAppArgs));
  } catch (err: unknown) {
    log.warn(
      `WARNING: Ignored nativefier.json rewrital (${(err as Error).message})`,
    );
  }
}

function setupCloseEvent(options, window: BrowserWindow): void {
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
): void {
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
            (result.value as Promise<unknown>)
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
          throw new Error(
            'Received neither a func nor a property in the request. Unable to process.',
          );
        }

        // If we are awaiting a promise, that will return the reply instead, else
        if (!awaitingPromise) {
          log.debug('session-interaction:result', result);
          event.reply('session-interaction-reply', result);
        }
      } catch (err: unknown) {
        log.error('session-interaction:error', err, event, request);
        result.error = err as Error;
        result.value = undefined; // Clear out the value in case serializing the value is what got us into this mess in the first place
        event.reply('session-interaction-reply', result);
      }
    },
  );
}
