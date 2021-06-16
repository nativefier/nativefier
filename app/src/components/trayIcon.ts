import { app, Tray, Menu, ipcMain, nativeImage, BrowserWindow } from 'electron';
import log from 'loglevel';

import { getAppIcon, getCounterValue, isOSX } from '../helpers/helpers';

export function createTrayIcon(
  nativefierOptions,
  mainWindow: BrowserWindow,
): Tray {
  const options = { ...nativefierOptions };

  if (options.tray) {
    const iconPath = getAppIcon();
    const nimage = nativeImage.createFromPath(iconPath);
    const appIcon = new Tray(nativeImage.createEmpty());

    if (isOSX()) {
      //sets the icon to the height of the tray.
      appIcon.setImage(
        nimage.resize({ height: appIcon.getBounds().height - 2 }),
      );
    } else {
      appIcon.setImage(nimage);
    }

    const onClick = (): void => {
      log.debug('onClick');
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
        click: app.exit.bind(this),
      },
    ]);

    appIcon.on('click', onClick);

    if (options.counter) {
      mainWindow.on('page-title-updated', (event, title) => {
        log.debug('mainWindow.page-title-updated', { event, title });
        const counterValue = getCounterValue(title);
        if (counterValue) {
          appIcon.setToolTip(`(${counterValue})  ${options.name}`);
        } else {
          appIcon.setToolTip(options.name);
        }
      });
    } else {
      ipcMain.on('notification', () => {
        log.debug('ipcMain.notification');
        if (mainWindow.isFocused()) {
          return;
        }
        appIcon.setToolTip(`•  ${options.name}`);
      });

      mainWindow.on('focus', () => {
        log.debug('mainWindow.focus');
        appIcon.setToolTip(options.name);
      });
    }

    appIcon.setToolTip(options.name);
    appIcon.setContextMenu(contextMenu);

    return appIcon;
  }

  return null;
}
