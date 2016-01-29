import electron from 'electron';
const {Menu, ipcMain, shell, BrowserWindow} = electron;

function initContextMenu(mainWindow) {
    ipcMain.on('contextMenuOpened', (event, targetHref) => {
        const contextMenuTemplate = [
            {
                label: 'Open in default browser',
                click: () => {
                    if (targetHref) {
                        shell.openExternal(targetHref);
                        return;
                    }
                }
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
                }
            }
        ];

        const contextMenu = Menu.buildFromTemplate(contextMenuTemplate);
        contextMenu.popup(mainWindow);
        mainWindow.contextMenuOpen = true;
    });
}

export default initContextMenu;
