import path from 'path';

const { app, Tray, Menu, ipcMain } = require('electron');

/**
 *
 * @param {{}} inpOptions AppArgs from nativefier.json
 * @param {electron.BrowserWindow} mainWindow MainWindow created from main.js
 * @returns {electron.Tray}
 */
function createTrayIcon(inpOptions, mainWindow) {
  const options = Object.assign({}, inpOptions);

  if (options.tray) {
    const iconPath = path.join(__dirname, '../', '/icon.png');
    const appIcon = new Tray(iconPath);

    const onClick = () => {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    };

    const contextMenu = Menu.buildFromTemplate([
      {
        label: options.name,
        click: onClick,
      },
      {
        label: 'Quit',
        click: app.exit,
      },
    ]);

    appIcon.on('click', onClick);

    mainWindow.on('show', () => {
      appIcon.setHighlightMode('always');
    });

    mainWindow.on('hide', () => {
      appIcon.setHighlightMode('never');
    });

    if (options.counter) {
      mainWindow.on('page-title-updated', (e, title) => {
        const itemCountRegex = /[([{](\d*?)\+?[}\])]/;
        const match = itemCountRegex.exec(title);
        if (match) {
          appIcon.setToolTip(`(${match[1]})  ${options.name}`);
        } else {
          appIcon.setToolTip(options.name);
        }
      });
    } else {
      ipcMain.on('notification', () => {
        if (mainWindow.isFocused()) {
          return;
        }
        appIcon.setToolTip(`•  ${options.name}`);
      });

      mainWindow.on('focus', () => {
        appIcon.setToolTip(options.name);
      });
    }

    appIcon.setToolTip(options.name);
    appIcon.setContextMenu(contextMenu);

    return appIcon;
  }

  return null;
}

export default createTrayIcon;
