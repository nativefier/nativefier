import { linkIsInternal } from '../helpers/helpers';

export function onNewWindowHelper(
  urlToGo: string,
  disposition,
  targetUrl: string,
  internalUrls,
  preventDefault,
  openExternal,
  createAboutBlankWindow,
  nativeTabsSupported,
  createNewTab,
): void {
  if (!linkIsInternal(targetUrl, urlToGo, internalUrls)) {
    openExternal(urlToGo);
    preventDefault();
  } else if (urlToGo === 'about:blank') {
    const newWindow = createAboutBlankWindow();
    preventDefault(newWindow);
  } else if (nativeTabsSupported()) {
    if (disposition === 'background-tab') {
      const newTab = createNewTab(urlToGo, false);
      preventDefault(newTab);
    } else if (disposition === 'foreground-tab') {
      const newTab = createNewTab(urlToGo, true);
      preventDefault(newTab);
    }
  }
}
