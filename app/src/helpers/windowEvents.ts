import { dialog, BrowserWindow, IpcMainEvent, WebContents } from 'electron';
import log from 'loglevel';

import { linkIsInternal, nativeTabsSupported, openExternal } from './helpers';
import {
  blockExternalURL,
  createAboutBlankWindow,
  createNewTab,
  getDefaultWindowOptions,
} from './windowHelpers';

export function onNewWindow(
  options,
  setupWindow,
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
  setupWindow,
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
  if (!linkIsInternal(options.targetUrl, urlToGo, options.internalUrls)) {
    preventDefault();
    if (options.blockExternalUrls) {
      return blockExternalURL(urlToGo).then(() => null);
    } else {
      return openExternal(urlToGo);
    }
  } else if (urlToGo === 'about:blank') {
    const newWindow = createAboutBlankWindow(
      options,
      getDefaultWindowOptions(options),
      parent,
    );
    return preventDefault(newWindow);
  } else if (nativeTabsSupported()) {
    if (disposition === 'background-tab') {
      const newTab = createNewTab(options, setupWindow, urlToGo, false, parent);
      return preventDefault(newTab);
    } else if (disposition === 'foreground-tab') {
      const newTab = createNewTab(options, setupWindow, urlToGo, true, parent);
      return preventDefault(newTab);
    }
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
