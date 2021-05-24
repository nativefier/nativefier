import * as fs from 'fs';
import * as path from 'path';

import {
  BrowserWindow,
  ipcMain,
  dialog,
  BrowserWindowConstructorOptions,
  Event,
  HeadersReceivedResponse,
  OnHeadersReceivedListenerDetails,
  WebContents,
} from 'electron';
import windowStateKeeper from 'electron-window-state';
import log from 'loglevel';

import {
  getAppIcon,
  getCounterValue,
  getCSSToInject,
  isOSX,
  linkIsInternal,
  nativeTabsSupported,
  openExternal,
  shouldInjectCss,
} from '../helpers/helpers';
import {
  adjustWindowZoom,
  createAboutBlankWindow,
  createNewTab,
  createNewWindow,
  getCurrentUrl,
  gotoUrl,
  withFocusedWindow,
} from '../helpers/windowHelpers';
import { initContextMenu } from './contextMenu';
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

  async clearAppData(): Promise<void> {
    const response = await dialog.showMessageBox(this.window, {
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
    await this.clearCache();
  }

  async clearCache(): Promise<void> {
    const { session } = this.window.webContents;
    await session.clearStorageData();
    await session.clearCache();
  }

  static getDefaultWindowOptions = (
    options,
  ): BrowserWindowConstructorOptions => {
    const browserwindowOptions: BrowserWindowConstructorOptions = {
      ...options.browserwindowOptions,
    };
    // We're going to remove this an merge it separately into DEFAULT_WINDOW_OPTIONS.webPreferences
    // Otherwise browserwindowOptions.webPreferences object will eliminate the webPreferences
    // specified in the DEFAULT_WINDOW_OPTIONS and replace it with itself
    delete browserwindowOptions.webPreferences;

    return {
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
        ...(options.browserWindowOptions &&
        options.browserwindowOptions.webPreferences
          ? options.browserwindowOptions.webPreferences
          : {}),
      },
      ...browserwindowOptions,
    };
  };

  static hideWindow = (
    window: BrowserWindow,
    event: Event,
    fastQuit: boolean,
    tray,
  ): void => {
    if (isOSX() && !fastQuit) {
      // this is called when exiting from clicking the cross button on the window
      event.preventDefault();
      window.hide();
    } else if (!fastQuit && tray) {
      event.preventDefault();
      window.hide();
    }
    // will close the window on other platforms
  };

  static injectCss = (browserWindow: BrowserWindow): void => {
    if (!shouldInjectCss()) {
      return;
    }

    const cssToInject = getCSSToInject();

    browserWindow.webContents.on('did-navigate', () => {
      log.debug(
        'browserWindow.webContents.did-navigate',
        browserWindow.webContents.getURL(),
      );
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
  };

  static sendParamsOnDidFinishLoad = (options, window: BrowserWindow): void => {
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
  };

  static setProxyRules = (browserWindow: BrowserWindow, proxyRules): void => {
    browserWindow.webContents.session
      .setProxy({
        proxyRules,
        pacScript: '',
        proxyBypassRules: '',
      })
      .catch((err) => log.error('session.setProxy ERROR', err));
  };

  async create(): Promise<BrowserWindow> {
    const mainWindowState = windowStateKeeper({
      defaultWidth: this.options.width || 1280,
      defaultHeight: this.options.height || 800,
    });

    const defaultWindowOptions = MainWindow.getDefaultWindowOptions(
      this.options,
    );

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
      ...defaultWindowOptions,
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
      clearAppData: this.clearAppData.bind(this),
      disableDevTools: this.options.disableDevTools,
      getCurrentUrl,
      goBack: MainWindow.onGoBack,
      goForward: MainWindow.onGoForward,
      gotoUrl,
      openExternal,
      zoomBuildTimeValue: this.options.zoom,
      zoomIn: MainWindow.onZoomIn,
      zoomOut: MainWindow.onZoomOut,
      zoomReset: MainWindow.onZoomReset,
    };

    createMenu(menuOptions);
    if (!this.options.disableContextMenu) {
      initContextMenu(
        createNewWindow,
        nativeTabsSupported()
          ? (url: string, foreground: boolean) =>
              createNewTab(
                this.options,
                MainWindow.getDefaultWindowOptions(this.options),
                MainWindow.setupWindow,
                url,
                foreground,
                this.window,
              )
          : undefined,
        openExternal,
        this.window,
      );
    }

    MainWindow.setupWindow(this.options, this.window);

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
      await this.clearCache();
    }

    await this.window.loadURL(this.options.targetUrl);

    this.window.on('close', (event) => {
      log.debug('mainWindow.close', event);
      if (this.window.isFullScreen()) {
        if (nativeTabsSupported()) {
          this.window.moveTabToNewWindow();
        }
        this.window.setFullScreen(false);
        this.window.once(
          'leave-full-screen',
          MainWindow.hideWindow.bind(this.window, event, this.options.fastQuit),
        );
      }
      MainWindow.hideWindow(
        this.window,
        event,
        this.options.fastQuit,
        this.options.tray,
      );

      if (this.options.clearCache) {
        this.clearCache().catch((err) => log.error('clearCache ERROR', err));
      }
    });

    return this.window;
  }

  static onBlockedExternalUrl = (url: string) => {
    log.debug('onBlockedExternalUrl', url);
    withFocusedWindow((focusedWindow) => {
      dialog
        .showMessageBox(focusedWindow, {
          message: `Cannot navigate to external URL: ${url}`,
          type: 'error',
          title: 'Navigation blocked',
        })
        .catch((err) => log.error('dialog.showMessageBox ERROR', err));
    });
  };

  static onGoBack = (): void => {
    log.debug('onGoBack');
    withFocusedWindow((focusedWindow) => {
      focusedWindow.webContents.goBack();
    });
  };

  static onGoForward = (): void => {
    log.debug('onGoForward');
    withFocusedWindow((focusedWindow) => {
      focusedWindow.webContents.goForward();
    });
  };

  static onNewWindow = (
    options,
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
    parent?: BrowserWindow,
  ): void => {
    log.debug('onNewWindow', {
      event,
      urlToGo,
      frameName,
      disposition,
      parent,
    });
    const preventDefault = (newGuest: any): void => {
      event.preventDefault();
      if (newGuest) {
        event.newGuest = newGuest;
      }
    };
    MainWindow.onNewWindowHelper(
      options,
      urlToGo,
      disposition,
      preventDefault,
      parent,
    );
  };

  static onNewWindowHelper = (
    options,
    urlToGo: string,
    disposition: string,
    preventDefault,
    parent?: BrowserWindow,
  ): void => {
    log.debug('onNewWindowHelper', {
      urlToGo,
      disposition,
      preventDefault,
      parent,
    });
    if (!linkIsInternal(options.targetUrl, urlToGo, options.internalUrls)) {
      preventDefault();
      if (options.blockExternalUrls) {
        MainWindow.onBlockedExternalUrl(urlToGo);
      } else {
        openExternal(urlToGo);
      }
    } else if (urlToGo === 'about:blank') {
      const newWindow = createAboutBlankWindow(
        options,
        MainWindow.getDefaultWindowOptions(options),
        parent,
      );
      preventDefault(newWindow);
    } else if (nativeTabsSupported()) {
      if (disposition === 'background-tab') {
        const newTab = createNewTab(
          options,
          MainWindow.getDefaultWindowOptions(options),
          MainWindow.setupWindow,
          urlToGo,
          false,
          parent,
        );
        preventDefault(newTab);
      } else if (disposition === 'foreground-tab') {
        const newTab = createNewTab(
          options,
          MainWindow.getDefaultWindowOptions(options),
          MainWindow.setupWindow,
          urlToGo,
          true,
          parent,
        );
        preventDefault(newTab);
      }
    }
  };

  static onWillNavigate = (options, event: Event, urlToGo: string): void => {
    log.debug('onWillNavigate', { options, event, urlToGo });
    if (!linkIsInternal(options.targetUrl, urlToGo, options.internalUrls)) {
      event.preventDefault();
      if (options.blockExternalUrls) {
        MainWindow.onBlockedExternalUrl(urlToGo);
      } else {
        openExternal(urlToGo);
      }
    }
  };

  static onWillPreventUnload = (event: Event): void => {
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

  static onZoomOut = (): void => {
    log.debug('onZoomOut');
    adjustWindowZoom(-ZOOM_INTERVAL);
  };

  static onZoomReset = (options): void => {
    log.debug('onZoomReset');
    withFocusedWindow((focusedWindow: BrowserWindow) => {
      focusedWindow.webContents.zoomFactor = options.zoom;
    });
  };

  static onZoomIn = (): void => {
    log.debug('onZoomIn');
    adjustWindowZoom(ZOOM_INTERVAL);
  };

  static setupWindow = (options, window: BrowserWindow): void => {
    if (options.userAgent) {
      window.webContents.userAgent = options.userAgent;
    }

    if (options.proxyRules) {
      MainWindow.setProxyRules(window, options.proxyRules);
    }

    MainWindow.injectCss(window);
    MainWindow.sendParamsOnDidFinishLoad(options, window);

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
        MainWindow.onNewWindow(options, event, url, frameName, disposition),
    );
    window.webContents.on('will-navigate', (event: Event, url: string) =>
      MainWindow.onWillNavigate(options, event, url),
    );
    window.webContents.on(
      'will-prevent-unload',
      MainWindow.onWillPreventUnload,
    );

    window.webContents.on('did-finish-load', () => {
      log.debug('mainWindow.webContents.did-finish-load');
      // Restore pinch-to-zoom, disabled by default in recent Electron.
      // See https://github.com/nativefier/nativefier/issues/379#issuecomment-598309817
      // and https://github.com/electron/electron/pull/12679
      window.webContents
        .setVisualZoomLevelLimits(1, 3)
        .catch((err) => log.error('webContents.setVisualZoomLevelLimits', err));

      // Remove potential css injection code set in `did-navigate`) (see injectCss code)
      window.webContents.session.webRequest.onHeadersReceived(null);
    });

    // @ts-ignore new-tab isn't in the type definition, but it does exist
    this.window.on('new-tab', () =>
      createNewTab(
        options,
        MainWindow.getDefaultWindowOptions(options),
        MainWindow.setupWindow,
        options.targetUrl,
        true,
        window,
      ),
    );
  };
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
