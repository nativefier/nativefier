import {
  dialog,
  BrowserWindow,
  Event,
  WebContents,
  HandlerDetails,
} from 'electron';

import { linkIsInternal, nativeTabsSupported, openExternal } from './helpers';
import * as log from './loggingHelper';
import {
  createAboutBlankWindow,
  createNewTab,
  injectCSS,
  sendParamsOnDidFinishLoad,
  setProxyRules,
  showNavigationBlockedMessage,
} from './windowHelpers';
import { WindowOptions } from '../../../shared/src/options/model';

type NewWindowHandlerResult = ReturnType<
  Parameters<WebContents['setWindowOpenHandler']>[0]
>;

export function onNewWindow(
  options: WindowOptions,
  setupWindow: (options: WindowOptions, window: BrowserWindow) => void,
  details: HandlerDetails,
  parent?: BrowserWindow,
): NewWindowHandlerResult {
  log.debug('onNewWindow', {
    details,
  });
  return onNewWindowHelper(
    options,
    setupWindow,
    details,
    nativeTabsSupported() ? undefined : parent,
  );
}

export function onNewWindowHelper(
  options: WindowOptions,
  setupWindow: (options: WindowOptions, window: BrowserWindow) => void,
  details: HandlerDetails,
  parent?: BrowserWindow,
): NewWindowHandlerResult {
  log.debug('onNewWindowHelper', {
    options,
    details,
  });
  try {
    if (
      !linkIsInternal(
        options.targetUrl,
        details.url,
        options.internalUrls,
        options.strictInternalUrls,
      )
    ) {
      if (options.blockExternalUrls) {
        showNavigationBlockedMessage(
          `Navigation to external URL blocked by options: ${details.url}`,
        )
          .then(() => {
            // blockExternalURL(details.url).then(resolve).catch((err: unknown) => {
            //   log.error('blockExternalURL', err);
            // });
          })
          .catch((err: unknown) => {
            throw err;
          });
        return { action: 'deny' };
      } else {
        openExternal(details.url).catch((err: unknown) => {
          log.error('openExternal', err);
        });
        return { action: 'deny' };
      }
    }
    // Normally the following would be:
    // if (urlToGo.startsWith('about:blank'))...
    // But due to a bug we resolved in https://github.com/nativefier/nativefier/issues/1197
    // Some sites use about:blank#something to use as placeholder windows to fill
    // with content via JavaScript. So we'll stay specific for now...
    else if (['about:blank', 'about:blank#blocked'].includes(details.url)) {
      createAboutBlankWindow(
        options,
        setupWindow,
        nativeTabsSupported() ? undefined : parent,
      );
      return { action: 'deny' };
    } else if (nativeTabsSupported()) {
      createNewTab(
        options,
        setupWindow,
        details.url,
        details.disposition === 'foreground-tab',
      );
      return { action: 'deny' };
    }
    return { action: 'allow' };
  } catch (err: unknown) {
    return { action: 'deny' };
  }
}

export function onWillNavigate(
  options: WindowOptions,
  event: Event,
  urlToGo: string,
): Promise<void> {
  log.debug('onWillNavigate', urlToGo);
  if (
    !linkIsInternal(
      options.targetUrl,
      urlToGo,
      options.internalUrls,
      options.strictInternalUrls,
    )
  ) {
    event.preventDefault();
    if (options.blockExternalUrls) {
      return new Promise((resolve) => {
        showNavigationBlockedMessage(
          `Navigation to external URL blocked by options: ${urlToGo}`,
        )
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
}
