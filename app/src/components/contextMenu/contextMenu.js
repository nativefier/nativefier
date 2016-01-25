import electron from 'electron';
const Menu = electron.Menu;
const ipcMain = electron.ipcMain;
const shell = electron.shell;
const BrowserWindow = electron.BrowserWindow;

function initContextMenu(mainWindow, sendMessage) {
    ipcMain.on('contextMenuOpened', function(event, targetHref) {
        const contextMenuTemplate = [
            {
                label: 'Open in default browser',
                click: function() {
                    if (targetHref) {
                        shell.openExternal(targetHref);
                        return;
                    }

                }
            },
            {
                label: 'Open in new window',
                click: function() {
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
