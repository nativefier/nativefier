import { app, Tray, Menu, ipcMain, nativeImage, BrowserWindow } from 'electron';

import { getAppIcon, getAppIconStatus, getCounterValue } from '../helpers/helpers';

export function createTrayIcon(
  nativefierOptions,
  mainWindow: BrowserWindow,
): Tray {
  const options = { ...nativefierOptions };

  if (options.tray) {
    const iconPath = getAppIcon();
    const nimage = nativeImage.createFromPath(iconPath);
    const iconStatusPath = getAppIconStatus();
    const nimageStatus = nativeImage.createFromPath(iconStatusPath);
    const appIcon = new Tray(nimage);

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
        click: app.exit.bind(this),
      },
    ]);

    appIcon.on('click', onClick);

    if (options.iconStatus) {
      mainWindow.on('page-title-updated', (e, title) => {
        const counterValue = getCounterValue(title);
        if (!mainWindow.isFocused() && counterValue) {
          appIcon.setImage(nimageStatus);
        } else {
          appIcon.setImage(nimage);
        }
      });
      mainWindow.on('focus', () => {
        appIcon.setImage(nimage);
      });
    }

    if (options.counter) {
      mainWindow.on('page-title-updated', (e, title) => {
        const counterValue = getCounterValue(title);
        if (counterValue) {
          appIcon.setToolTip(`(${counterValue})  ${options.name}`);
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
