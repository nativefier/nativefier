import { BrowserWindow } from 'electron';

export function initContextMenu(
  createNewWindow,
  createNewTab,
  openExternal,
  window?: BrowserWindow,
): void {
  // Require this at runtime, otherwise its child dependency 'electron-is-dev'
  // throws an error during unit testing.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const contextMenu = require('electron-context-menu');

  contextMenu({
    prepend: (actions, params) => {
      const items = [];
      if (params.linkURL) {
        items.push({
          label: 'Open Link in Default Browser',
          click: () => {
            openExternal(params.linkURL);
          },
        });
        items.push({
          label: 'Open Link in New Window',
          click: () => {
            createNewWindow(params.linkURL, window);
          },
        });
        if (createNewTab) {
          items.push({
            label: 'Open Link in New Tab',
            click: () => {
              createNewTab(params.linkURL, false, window);
            },
          });
        }
      }
      return items;
    },
  });
}
