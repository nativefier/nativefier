import { shell } from 'electron';
import contextMenu from 'electron-context-menu';

function initContextMenu(createNewWindow, createNewTab) {
  contextMenu({
    prepend: (params) => {
      const items = [];
      if (params.linkURL) {
        items.push({
          label: 'Open Link in Default Browser',
          click: () => {
            shell.openExternal(params.linkURL);
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

export default initContextMenu;
