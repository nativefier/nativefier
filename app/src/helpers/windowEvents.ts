import { dialog, BrowserWindow, IpcMainEvent, WebContents } from 'electron';
import log from 'loglevel';

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
  options,
  setupWindow: (...args) => void,
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
): Promise<void> {
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
  options,
  setupWindow: (...args) => void,
  urlToGo: string,
  disposition: string,
  preventDefault,
  parent?: BrowserWindow,
): Promise<void> {
  log.debug('onNewWindowHelper', {
    urlToGo,
    disposition,
    preventDefault,
    parent,
  });
  try {
    if (!linkIsInternal(options.targetUrl, urlToGo, options.internalUrls)) {
      preventDefault();
      if (options.blockExternalUrls) {
        return blockExternalURL(urlToGo).then(() => null);
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
  } catch (err) {
    return Promise.reject(err);
  }
}

export function onWillNavigate(
  options,
  event: IpcMainEvent,
  urlToGo: string,
): Promise<void> {
  log.debug('onWillNavigate', { options, event, urlToGo });
  if (!linkIsInternal(options.targetUrl, urlToGo, options.internalUrls)) {
    event.preventDefault();
    if (options.blockExternalUrls) {
      return blockExternalURL(urlToGo).then(() => null);
    } else {
      return openExternal(urlToGo);
    }
  }
  return Promise.resolve(undefined);
}

export function onWillPreventUnload(event: IpcMainEvent): void {
  log.debug('onWillPreventUnload', event);

  const webContents: WebContents = event.sender;
  if (webContents === undefined) {
    return;
  }

  const browserWindow = BrowserWindow.fromWebContents(webContents);
  const choice = dialog.showMessageBoxSync(browserWindow, {
    type: 'question',
    buttons: ['Proceed', 'Stay'],
    message: 'You may have unsaved changes, are you sure you want to proceed?',
    title: 'Changes you made may not be saved.',
    defaultId: 0,
    cancelId: 1,
  });
  if (choice === 0) {
    event.preventDefault();
  }
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
