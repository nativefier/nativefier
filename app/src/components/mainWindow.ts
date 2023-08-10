import * as fs from 'fs';
import * as path from 'path';

import {
  desktopCapturer,
  ipcMain,
  BrowserWindow,
  Event,
  HandlerDetails,
} from 'electron';
import windowStateKeeper from 'electron-window-state';

import { initContextMenu } from './contextMenu';
import { createMenu } from './menu';
import {
  getAppIcon,
  getCounterValue,
  isOSX,
  nativeTabsSupported,
} from '../helpers/helpers';
import * as log from '../helpers/loggingHelper';
import { IS_PLAYWRIGHT } from '../helpers/playwrightHelpers';
import { onNewWindow, setupNativefierWindow } from '../helpers/windowEvents';
import {
  clearCache,
  createNewTab,
  getDefaultWindowOptions,
  hideWindow,
} from '../helpers/windowHelpers';
import {
  OutputOptions,
  outputOptionsToWindowOptions,
} from '../../../shared/src/options/model';

export const APP_ARGS_FILE_PATH = path.join(__dirname, '..', 'nativefier.json');

type SessionInteractionRequest = {
  id?: string;
  func?: string;
  funcArgs?: unknown[];
  property?: string;
  propertyValue?: unknown;
};

type SessionInteractionResult<T = unknown> = {
  id?: string;
  value?: T | Promise<T>;
  error?: Error;
};

/**
 * @param {{}} nativefierOptions AppArgs from nativefier.json
 * @param {function} setDockBadge
 */
export async function createMainWindow(
  nativefierOptions: OutputOptions,
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
    titleBarStyle: options.titleBarStyle ?? 'default',
    // Maximize window visual glitch on Windows fix
    // We want a consistent behavior on all OSes, but Windows needs help to not glitch.
    // So, we manually mainWindow.show() later, see a few lines below
    show: options.tray !== 'start-in-tray' && process.platform !== 'win32',
    backgroundColor: options.backgroundColor,
    ...getDefaultWindowOptions(
      outputOptionsToWindowOptions(options, nativeTabsSupported()),
    ),
  });

  // Just load about:blank to start, gives playwright something to latch onto initially for testing.
  if (IS_PLAYWRIGHT) {
    await mainWindow.loadURL('about:blank');
  }

  mainWindowState.manage(mainWindow);

  // after first run, no longer force maximize to be true
  if (options.maximize) {
    mainWindow.maximize();
    options.maximize = undefined;
    saveAppArgs(options);
  }

  if (options.tray === 'start-in-tray') {
    mainWindow.hide();
  } else if (process.platform === 'win32') {
    // See other "Maximize window visual glitch on Windows fix" comment above.
    mainWindow.show();
  }

  const windowOptions = outputOptionsToWindowOptions(
    options,
    nativeTabsSupported(),
  );
  createMenu(options, mainWindow);
  createContextMenu(options, mainWindow);
  setupNativefierWindow(windowOptions, mainWindow);

  // Note it is important to add these handlers only to the *main* window,
  // else we run into weird behavior like opening tabs twice
  mainWindow.webContents.setWindowOpenHandler((details: HandlerDetails) => {
    return onNewWindow(
      windowOptions,
      setupNativefierWindow,
      details,
      mainWindow,
    );
  });
  mainWindow.on('new-window-for-tab', (event?: Event<{ url?: string }>) => {
    log.debug('mainWindow.new-window-for-tab', { event });
    createNewTab(
      windowOptions,
      setupNativefierWindow,
      event?.url ?? options.targetUrl,
      true,
      // mainWindow,
    );
  });

  if (options.counter) {
    setupCounter(options, mainWindow, setDockBadge);
  } else {
    setupNotificationBadge(options, mainWindow, setDockBadge);
  }

  ipcMain.on('notification-click', () => {
    log.debug('ipcMain.notification-click');
    mainWindow.show();
  });

  setupSessionInteraction(mainWindow);
  setupSessionPermissionHandler(mainWindow);

  if (options.clearCache) {
    await clearCache(mainWindow);
  }

  setupCloseEvent(options, mainWindow);

  return mainWindow;
}

function createContextMenu(
  options: OutputOptions,
  window: BrowserWindow,
): void {
  if (!options.disableContextMenu) {
    initContextMenu(options, window);
  }
}

export function saveAppArgs(newAppArgs: OutputOptions): void {
  try {
    fs.writeFileSync(APP_ARGS_FILE_PATH, JSON.stringify(newAppArgs, null, 2));
  } catch (err: unknown) {
    log.warn(
      `WARNING: Ignored nativefier.json rewrital (${(err as Error).message})`,
    );
  }
}

function setupCloseEvent(options: OutputOptions, window: BrowserWindow): void {
  window.on('close', (event: Event) => {
    log.debug('mainWindow.close', event);
    if (window.isFullScreen()) {
      if (nativeTabsSupported()) {
        window.moveTabToNewWindow();
      }
      window.setFullScreen(false);
      window.once('leave-full-screen', (event: Event) =>
        hideWindow(
          window,
          event,
          options.fastQuit ?? false,
          options.tray ?? 'false',
        ),
      );
    }
    hideWindow(
      window,
      event,
      options.fastQuit ?? false,
      options.tray ?? 'false',
    );

    if (options.clearCache) {
      clearCache(window).catch((err) => log.error('clearCache ERROR', err));
    }
  });
}

function setupCounter(
  options: OutputOptions,
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

function setupSessionPermissionHandler(window: BrowserWindow): void {
  window.webContents.session.setPermissionCheckHandler(() => {
    return true;
  });
  window.webContents.session.setPermissionRequestHandler(
    (_webContents, _permission, callback) => {
      callback(true);
    },
  );
  ipcMain.handle('desktop-capturer-get-sources', () => {
    return desktopCapturer.getSources({
      types: ['screen', 'window'],
    });
  });
}

function setupNotificationBadge(
  options: OutputOptions,
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

function setupSessionInteraction(window: BrowserWindow): void {
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
          // @ts-expect-error accessing a func by string name
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          result.value = window.webContents.session[request.func](
            ...request.funcArgs,
          );

          if (result.value !== undefined && result.value instanceof Promise) {
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
            // @ts-expect-error setting a property by string name
            window.webContents.session[request.property] =
              request.propertyValue;
          }

          // Get the property value
          // @ts-expect-error accessing a property by string name
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
