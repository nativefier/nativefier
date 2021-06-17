import {
  dialog,
  BrowserWindow,
  IpcMainEvent,
  NewWindowWebContentsEvent,
  WebContents,
} from 'electron';
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
  const preventDefault = (newGuest: BrowserWindow): void => {
    log.debug('onNewWindow.preventDefault', { newGuest, event });
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
    }
    // Normally the following would be:
    // if (urlToGo.startsWith('about:blank'))...
    // But due to a bug we resolved in https://github.com/nativefier/nativefier/issues/1197
    // Some sites use about:blank#something to use as placeholder windows to fill
    // with content via JavaScript. So we'll stay specific for now...
    else if (['about:blank', 'about:blank#blocked'].includes(urlToGo)) {
      return Promise.resolve(
        preventDefault(createAboutBlankWindow(options, setupWindow, parent)),
      );
    } else if (nativeTabsSupported()) {
      return Promise.resolve(
        preventDefault(
          createNewTab(
            options,
            setupWindow,
            urlToGo,
            disposition === 'foreground-tab',
            parent,
          ),
        ),
      );
    }
    return Promise.resolve(undefined);
  } catch (err: unknown) {
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

  window.webContents.on('will-navigate', (event: IpcMainEvent, url: string) => {
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
