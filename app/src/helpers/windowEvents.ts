import {
  dialog,
  BrowserWindow,
  Event,
  // IpcMainEvent,
  NewWindowWebContentsEvent,
  WebContents,
} from 'electron';
import log from 'loglevel';
import { WindowOptions } from '../../../shared/src/options/model';

import { linkIsInternal, nativeTabsSupported, openExternal } from './helpers';
import {
  blockExternalURL,
  createAboutBlankWindow,
  createNewTab,
  injectCSS,
  sendParamsOnDidFinishLoad,
  setProxyRules,
} from './windowHelpers';

export function onNewWindow(
  options: WindowOptions,
  setupWindow: (options: WindowOptions, window: BrowserWindow) => void,
  event: NewWindowWebContentsEvent,
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
): Promise<void> {
  log.debug('onNewWindow', {
    event,
    urlToGo,
    frameName,
    disposition,
    parent,
  });
  const preventDefault = (newGuest?: BrowserWindow): void => {
    event.preventDefault();
    if (newGuest) {
      event.newGuest = newGuest;
    }
  };
  return onNewWindowHelper(
    options,
    setupWindow,
    urlToGo,
    disposition,
    preventDefault,
    parent,
  );
}

export function onNewWindowHelper(
  options: WindowOptions,
  setupWindow: (options: WindowOptions, window: BrowserWindow) => void,
  urlToGo: string,
  disposition: string | undefined,
  preventDefault: (newGuest?: BrowserWindow) => void,
  parent?: BrowserWindow,
): Promise<void> {
  log.debug('onNewWindowHelper', {
    options,
    urlToGo,
    disposition,
    preventDefault,
    parent,
  });
  try {
    if (!linkIsInternal(options.targetUrl, urlToGo, options.internalUrls)) {
      preventDefault();
      if (options.blockExternalUrls) {
        return new Promise((resolve) => {
          blockExternalURL(urlToGo)
            .then(() => resolve())
            .catch((err: unknown) => {
              throw err;
            });
        });
      } else {
        return openExternal(urlToGo);
      }
    } else if (urlToGo === 'about:blank') {
      const newWindow = createAboutBlankWindow(options, setupWindow, parent);
      return Promise.resolve(preventDefault(newWindow));
    } else if (nativeTabsSupported()) {
      if (disposition === 'background-tab') {
        const newTab = createNewTab(
          options,
          setupWindow,
          urlToGo,
          false,
          parent,
        );
        return Promise.resolve(preventDefault(newTab));
      } else if (disposition === 'foreground-tab') {
        const newTab = createNewTab(
          options,
          setupWindow,
          urlToGo,
          true,
          parent,
        );
        return Promise.resolve(preventDefault(newTab));
      }
    }
    return Promise.resolve(undefined);
  } catch (err: unknown) {
    return Promise.reject(err);
  }
}

export function onWillNavigate(
  options: WindowOptions,
  event: Event,
  urlToGo: string,
): Promise<void> {
  log.debug('onWillNavigate', { options, event, urlToGo });
  if (!linkIsInternal(options.targetUrl, urlToGo, options.internalUrls)) {
    event.preventDefault();
    if (options.blockExternalUrls) {
      return new Promise((resolve) => {
        blockExternalURL(urlToGo)
          .then(() => resolve())
          .catch((err: unknown) => {
            throw err;
          });
      });
    } else {
      return openExternal(urlToGo);
    }
  }
  return Promise.resolve(undefined);
}

export function onWillPreventUnload(
  event: Event & { sender?: WebContents },
): void {
  log.debug('onWillPreventUnload', event);

  const webContents = event.sender;
  if (!webContents) {
    return;
  }

  const browserWindow =
    BrowserWindow.fromWebContents(webContents) ??
    BrowserWindow.getFocusedWindow();
  if (browserWindow) {
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
}

export function setupNativefierWindow(
  options: WindowOptions,
  window: BrowserWindow,
): void {
  if (options.userAgent) {
    window.webContents.userAgent = options.userAgent;
  }

  if (options.proxyRules) {
    setProxyRules(window, options.proxyRules);
  }

  injectCSS(window);

  window.webContents.on('will-navigate', (event: Event, url: string) => {
    onWillNavigate(options, event, url).catch((err) => {
      log.error('window.webContents.on.will-navigate ERROR', err);
      event.preventDefault();
    });
  });
  window.webContents.on('will-prevent-unload', onWillPreventUnload);

  sendParamsOnDidFinishLoad(options, window);

  // @ts-expect-error new-tab isn't in the type definition, but it does exist
  window.on('new-tab', () =>
    createNewTab(
      options,
      setupNativefierWindow,
      options.targetUrl,
      true,
      window,
    ),
  );
}
