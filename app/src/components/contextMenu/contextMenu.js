// Because we are changing the properties of `mainWindow` in initContextMenu()
/* eslint-disable no-param-reassign */
import { Menu, ipcMain, shell, clipboard, BrowserWindow } from 'electron';

function initContextMenu(mainWindow) {
  ipcMain.on('contextMenuOpened', (event, targetHref) => {
    const contextMenuTemplate = [
      {
        label: 'Open with default browser',
        click: () => {
          if (targetHref) {
            shell.openExternal(targetHref);
          }
        },
      },
      {
        label: 'Open in new window',
        click: () => {
          if (targetHref) {
            new BrowserWindow().loadURL(targetHref);
            return;
          }

          mainWindow.useDefaultWindowBehaviour = true;
          mainWindow.webContents.send('contextMenuClosed');
        },
      },
      {
        label: 'Copy link location',
        click: () => {
          if (targetHref) {
            clipboard.writeText(targetHref);
            return;
          }

          mainWindow.useDefaultWindowBehaviour = true;
          mainWindow.webContents.send('contextMenuClosed');
        },
      },
    ];

    const contextMenu = Menu.buildFromTemplate(contextMenuTemplate);
    contextMenu.popup(mainWindow);
    mainWindow.contextMenuOpen = true;
  });
}

export default initContextMenu;
