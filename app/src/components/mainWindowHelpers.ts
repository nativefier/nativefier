import { linkIsInternal } from '../helpers/helpers';

export function onNewWindowHelper(
  urlToGo: string,
  disposition: string,
  targetUrl: string,
  internalUrls: string | RegExp,
  preventDefault,
  openExternal,
  createAboutBlankWindow,
  nativeTabsSupported,
  createNewTab,
  blockExternal: boolean,
  onBlockedExternalUrl: (url: string) => void,
  parent?: BrowserWindow,
): void {
  log.debug('onNewWindowHelper', {
    urlToGo,
    disposition,
    targetUrl,
    internalUrls,
    preventDefault,
    openExternal,
    createAboutBlankWindow,
    nativeTabsSupported,
    createNewTab,
    blockExternal,
    onBlockedExternalUrl,
    parent,
  });
  if (!linkIsInternal(targetUrl, urlToGo, internalUrls)) {
    preventDefault();
    if (blockExternal) {
      onBlockedExternalUrl(urlToGo);
    } else {
      openExternal(urlToGo);
    }
    const newWindow = createAboutBlankWindow(parent);
    preventDefault(newWindow);
  } else if (nativeTabsSupported()) {
    if (disposition === 'background-tab') {
      const newTab = createNewTab(urlToGo, false, parent);
      preventDefault(newTab);
    } else if (disposition === 'foreground-tab') {
      const newTab = createNewTab(urlToGo, true, parent);
      preventDefault(newTab);
    }
  }
}
