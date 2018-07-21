import helpers from '../../helpers/helpers';

const { linkIsInternal } = helpers;

function onNewWindowHelper(
  urlToGo,
  disposition,
  targetUrl,
  internalUrls,
  preventDefault,
  openExternal,
  createAboutBlankWindow,
  nativeTabsSupported,
  createNewTab,
) {
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

export default { onNewWindowHelper };
