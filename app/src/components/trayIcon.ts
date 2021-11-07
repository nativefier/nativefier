import { app, Tray, Menu, ipcMain, nativeImage, BrowserWindow } from 'electron';
import log from 'loglevel';

import { getAppIcon, getCounterValue, isOSX } from '../helpers/helpers';
import { OutputOptions } from '../../../shared/src/options/model';
import * as fs from 'fs';
import path from 'path';
import { MenuItemConstructorOptions } from 'electron/main';

type TrayMenuConfig = TrayMenuItem[];

type TrayMenuItem = {
  label?: string;
  click?: string;
  action?: 'toggleWindow' | 'quit';
  type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio' | undefined;
  icon?: string;
  submenu?: TrayMenuItem[];
};

export function createTrayIcon(
  nativefierOptions: OutputOptions,
  mainWindow: BrowserWindow,
): Tray | undefined {
  const options = { ...nativefierOptions };

  if (options.tray && options.tray !== 'false') {
    const iconPath = getAppIcon();
    if (!iconPath) {
      throw new Error('Icon path not found found to use with tray option.');
    }
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

    const contextMenu = options.trayMenu
      ? createCustomTrayMenu(
          path.join(__dirname, '..', 'traymenu.json'),
          mainWindow,
        )
      : Menu.buildFromTemplate([
          {
            label: options.name,
            click: onClick,
          },
          {
            label: 'Quit',
            click: (): void => app.exit(0),
          },
        ]);

    appIcon.on('click', onClick);

    if (options.counter) {
      mainWindow.on('page-title-updated', (event, title) => {
        log.debug('mainWindow.page-title-updated', { event, title });
        const counterValue = getCounterValue(title);
        if (counterValue) {
          appIcon.setToolTip(
            `(${counterValue})  ${options.name ?? 'Nativefier'}`,
          );
        } else {
          appIcon.setToolTip(options.name ?? '');
        }
      });
    } else {
      ipcMain.on('notification', () => {
        log.debug('ipcMain.notification');
        if (mainWindow.isFocused()) {
          return;
        }
        if (options.name) {
          appIcon.setToolTip(`•  ${options.name}`);
        }
      });

      mainWindow.on('focus', () => {
        log.debug('mainWindow.focus');
        appIcon.setToolTip(options.name ?? '');
      });
    }

    appIcon.setToolTip(options.name ?? '');
    appIcon.setContextMenu(contextMenu);

    return appIcon;
  }

  return undefined;
}

function createCustomTrayMenu(
  trayMenuConfigPath: string,
  mainWindow: BrowserWindow,
): Electron.Menu {
  try {
    const trayMenuConfig = JSON.parse(
      fs.readFileSync(trayMenuConfigPath, 'utf-8'),
    ) as TrayMenuConfig;

    const test = trayMenuConfig.map((configMenuItem) =>
      createTrayMenuItem(configMenuItem, mainWindow),
    );

    return Menu.buildFromTemplate(test);
  } catch (err: unknown) {
    log.error('Failed to load & parse traymenu configuration JSON file.', err);
  }

  return Menu.buildFromTemplate([]);
}

function createTrayMenuItem(
  configMenuItem: TrayMenuItem,
  mainWindow: BrowserWindow,
): MenuItemConstructorOptions {
  const menuItem: MenuItemConstructorOptions = {};

  if (configMenuItem.label) {
    menuItem['label'] = configMenuItem.label;
  }

  if (configMenuItem.type) {
    menuItem['type'] = configMenuItem.type;
  }

  if (configMenuItem.click) {
    const functionToExecute = (): void => {
      void mainWindow.webContents
        .executeJavaScript(<string>configMenuItem.click)
        .then((res) => log.debug(res));
    };

    menuItem['click'] = functionToExecute;
  }

  if (configMenuItem.action) {
    const toggleWindow = (): void => {
      log.debug('onClick');
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    };

    switch (configMenuItem.action) {
      case 'toggleWindow':
        menuItem['click'] = toggleWindow;
        break;
      case 'quit':
        menuItem['click'] = (): void => app.exit(0);
        break;
    }
  }

  if (configMenuItem.icon) {
    menuItem['icon'] = configMenuItem.icon;
  }

  if (configMenuItem.submenu) {
    menuItem['submenu'] =
      configMenuItem.submenu.map<MenuItemConstructorOptions>((subMenuItem) =>
        createTrayMenuItem(subMenuItem, mainWindow),
      );
  }

  return menuItem;
}
