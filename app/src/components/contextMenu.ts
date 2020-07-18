import { shell } from 'electron';
import contextMenu from 'electron-context-menu';

export function initContextMenu(createNewWindow, createNewTab): void {
  contextMenu({
    prepend: (actions, params) => {
      const items = [];
      if (params.linkURL) {
        items.push({
          label: 'Open Link in Default Browser',
          click: () => {
            shell.openExternal(params.linkURL); // eslint-disable-line @typescript-eslint/no-floating-promises
          },
        });
        items.push({
          label: 'Open Link in New Window',
          click: () => {
            createNewWindow(params.linkURL);
          },
        });
        if (createNewTab) {
          items.push({
            label: 'Open Link in New Tab',
            click: () => {
              createNewTab(params.linkURL, false);
            },
          });
        }
      }
      return items;
    },
  });
}
