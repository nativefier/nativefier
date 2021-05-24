import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';

import * as log from 'loglevel';

export function adjustWindowZoom(adjustment: number): void {
  withFocusedWindow(
    (focusedWindow: BrowserWindow) =>
      (focusedWindow.webContents.zoomFactor =
        focusedWindow.webContents.zoomFactor + adjustment),
  );
}

export function createAboutBlankWindow(
  options,
  browserWindowConstructorOptions: BrowserWindowConstructorOptions,
  setupWindow,
  parent?: BrowserWindow,
): BrowserWindow {
  const window = createNewWindow(
    options,
    browserWindowConstructorOptions,
    setupWindow,
    'about:blank',
    parent,
  );
  setupWindow(options, window);
  window.show();
  window.focus();
  return window;
}

export function createNewTab(
  options,
  browserWindowConstructorOptions: BrowserWindowConstructorOptions,
  setupWindow,
  url: string,
  foreground: boolean,
  parent?: BrowserWindow,
): BrowserWindow {
  log.debug('createNewTab', { url, foreground, parent });
  withFocusedWindow((focusedWindow) => {
    const newTab = createNewWindow(
      options,
      browserWindowConstructorOptions,
      setupWindow,
      url,
      parent,
    );
    focusedWindow.addTabbedWindow(newTab);
    if (!foreground) {
      focusedWindow.focus();
    }
    return newTab;
  });
  return undefined;
}

export function createNewWindow(
  options,
  browserWindowConstructorOptions: BrowserWindowConstructorOptions,
  setupWindow,
  url: string,
  parent?: BrowserWindow,
): BrowserWindow {
  log.debug('createNewWindow', { url, parent });
  const window = new BrowserWindow({
    parent,
    ...browserWindowConstructorOptions,
  });
  setupWindow(options, window);
  window.loadURL(url).catch((err) => log.error('window.loadURL ERROR', err));
  return window;
}

export function getCurrentUrl(): string {
  return withFocusedWindow((focusedWindow) =>
    focusedWindow.webContents.getURL(),
  ) as unknown as string;
}

export function gotoUrl(url: string): void {
  return withFocusedWindow((focusedWindow) => void focusedWindow.loadURL(url));
}

export function withFocusedWindow(
  block: (window: BrowserWindow) => void,
): void {
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (focusedWindow) {
    return block(focusedWindow);
  }
  return undefined;
}
