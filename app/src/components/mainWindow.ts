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

export class MainWindow {
  private readonly options;
  private readonly onAppQuit;
  private readonly setDockBadge;
  private window: BrowserWindow;

  /**
   * @param {{}} nativefierOptions AppArgs from nativefier.json
   * @param {function} onAppQuit
   * @param {function} setDockBadge
   */
  constructor(nativefierOptions, onAppQuit, setDockBadge) {
    this.options = { ...nativefierOptions };
    this.onAppQuit = onAppQuit;
    this.setDockBadge = setDockBadge;
  }

  async create(): Promise<BrowserWindow> {
    const mainWindowState = windowStateKeeper({
      defaultWidth: this.options.width || 1280,
      defaultHeight: this.options.height || 800,
    });

    this.window = new BrowserWindow({
      frame: !this.options.hideWindowFrame,
      width: mainWindowState.width,
      height: mainWindowState.height,
      minWidth: this.options.minWidth,
      minHeight: this.options.minHeight,
      maxWidth: this.options.maxWidth,
      maxHeight: this.options.maxHeight,
      x: this.options.x,
      y: this.options.y,
      autoHideMenuBar: !this.options.showMenuBar,
      icon: getAppIcon(),
      // set to undefined and not false because explicitly setting to false will disable full screen
      fullscreen: this.options.fullScreen || undefined,
      // Whether the window should always stay on top of other windows. Default is false.
      alwaysOnTop: this.options.alwaysOnTop,
      titleBarStyle: this.options.titleBarStyle,
      show: this.options.tray !== 'start-in-tray',
      backgroundColor: this.options.backgroundColor,
      ...getDefaultWindowOptions(this.options),
    });

    mainWindowState.manage(this.window);

    // after first run, no longer force maximize to be true
    if (this.options.maximize) {
      this.window.maximize();
      this.options.maximize = undefined;
      saveAppArgs(this.options);
    }

    if (this.options.tray === 'start-in-tray') {
      this.window.hide();
    }

    const menuOptions = {
      nativefierVersion: this.options.nativefierVersion,
      appQuit: this.onAppQuit,
      clearAppData: () => clearAppData(this.window),
      disableDevTools: this.options.disableDevTools,
      getCurrentURL,
      goBack,
      goForward,
      goToURL,
      openExternal,
      zoomBuildTimeValue: this.options.zoom,
      zoomIn,
      zoomOut,
      zoomReset,
    };

    createMenu(menuOptions);
    if (!this.options.disableContextMenu) {
      initContextMenu(
        createNewWindow,
        nativeTabsSupported()
          ? (url: string, foreground: boolean) =>
              createNewTab(
                this.options,
                setupWindow,
                url,
                foreground,
                this.window,
              )
          : undefined,
        openExternal,
        this.window,
      );
    }

    setupWindow(this.options, this.window);

    if (this.options.counter) {
      this.window.on('page-title-updated', (event, title) => {
        log.debug('mainWindow.page-title-updated', { event, title });
        const counterValue = getCounterValue(title);
        if (counterValue) {
          this.setDockBadge(counterValue, this.options.bounce);
        } else {
          this.setDockBadge('');
        }
      });
    } else {
      ipcMain.on('notification', () => {
        log.debug('ipcMain.notification');
        if (!isOSX() || this.window.isFocused()) {
          return;
        }
        this.setDockBadge('•', this.options.bounce);
      });
      this.window.on('focus', () => {
        log.debug('mainWindow.focus');
        this.setDockBadge('');
      });
    }

    ipcMain.on('notification-click', () => {
      log.debug('ipcMain.notification-click');
      this.window.show();
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
            result.value = this.window.webContents.session[request.func](
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
              this.window.webContents.session[request.property] =
                request.propertyValue;
            }

            // Get the property value
            result.value = this.window.webContents.session[request.property];
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

    if (this.options.clearCache) {
      await clearCache(this.window);
    }

    await this.window.loadURL(this.options.targetUrl);

    this.window.on('close', (event: IpcMainEvent) => {
      log.debug('mainWindow.close', event);
      if (this.window.isFullScreen()) {
        if (nativeTabsSupported()) {
          this.window.moveTabToNewWindow();
        }
        this.window.setFullScreen(false);
        this.window.once('leave-full-screen', (event: IpcMainEvent) =>
          hideWindow(
            this.window,
            event,
            this.options.fastQuit,
            this.options.tray,
          ),
        );
      }
      hideWindow(this.window, event, this.options.fastQuit, this.options.tray);

      if (this.options.clearCache) {
        clearCache(this.window).catch((err) =>
          log.error('clearCache ERROR', err),
        );
      }
    });

    return this.window;
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

export function setupWindow(options, window: BrowserWindow): void {
  if (options.userAgent) {
    window.webContents.userAgent = options.userAgent;
  }

  if (options.proxyRules) {
    setProxyRules(window, options.proxyRules);
  }

  injectCSS(window);
  sendParamsOnDidFinishLoad(options, window);

  // .on('new-window', ...) is deprected in favor of setWindowOpenHandler(...)
  // We can't quite cut over to that yet for a few reasons:
  // 1. Our version of Electron does not yet support a parameter to
  //    setWindowOpenHandler that contains `disposition', which we need.
  //    See https://github.com/electron/electron/issues/28380
  // 2. setWindowOpenHandler doesn't support newGuest as well
  // Though at this point, 'new-window' bugs seem to be coming up and downstream
  // users are being pointed to use setWindowOpenHandler.
  // E.g., https://github.com/electron/electron/issues/28374

  window.webContents.on(
    'new-window',
    () => (event, url, frameName, disposition) =>
      onNewWindow(options, this, event, url, frameName, disposition),
  );
  window.webContents.on('will-navigate', (event: IpcMainEvent, url: string) => {
    onWillNavigate(options, event, url).catch((err) => {
      log.error(' window.webContents.on.will-navigate ERROR', err);
      event.preventDefault();
    });
  });
  window.webContents.on('will-prevent-unload', onWillPreventUnload);

  window.webContents.on('did-finish-load', () => {
    log.debug('mainWindow.webContents.did-finish-load');
    // Restore pinch-to-zoom, disabled by default in recent Electron.
    // See https://github.com/nativefier/nativefier/issues/379#issuecomment-598309817
    // and https://github.com/electron/electron/pull/12679
    window.webContents
      .setVisualZoomLevelLimits(1, 3)
      .catch((err) => log.error('webContents.setVisualZoomLevelLimits', err));

    // Remove potential css injection code set in `did-navigate`) (see injectCSS code)
    window.webContents.session.webRequest.onHeadersReceived(null);
  });

  // @ts-ignore new-tab isn't in the type definition, but it does exist
  window.on('new-tab', () => {
    createNewTab(options, this, options.targetUrl, true, window).catch((err) =>
      log.error('new-tab ERROR', err),
    );
  });
}
