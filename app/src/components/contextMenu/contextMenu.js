import { shell } from 'electron';
import contextMenu from 'electron-context-menu';

function initContextMenu(createNewWindow) {
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
      }
      return items;
    },
  });
}

export default initContextMenu;
