import * as fs from 'fs';
import path from 'path';

import {
  BrowserWindow,
  clipboard,
  Menu,
  MenuItem,
  MenuItemConstructorOptions,
} from 'electron';

import { cleanupPlainText, isOSX, openExternal } from '../helpers/helpers';
import * as log from '../helpers/loggingHelper';
import {
  clearAppData,
  getCurrentURL,
  goBack,
  goForward,
  goToURL,
  zoomIn,
  zoomOut,
  zoomReset,
} from '../helpers/windowHelpers';
import { OutputOptions } from '../../../shared/src/options/model';

type BookmarksLink = {
  type: 'link';
  title: string;
  url: string;
  shortcut?: string;
};

type BookmarksSeparator = {
  type: 'separator';
};

type BookmarkConfig = BookmarksLink | BookmarksSeparator;

type BookmarksMenuConfig = {
  menuLabel: string;
  bookmarks: BookmarkConfig[];
};

export function createMenu(
  options: OutputOptions,
  mainWindow: BrowserWindow,
): void {
  log.debug('createMenu', { options });
  const menuTemplate = generateMenu(options, mainWindow);

  injectBookmarks(menuTemplate);

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

export function generateMenu(
  options: {
    disableDevTools: boolean;
    nativefierVersion: string;
    zoom?: number;
  },
  mainWindow: BrowserWindow,
): MenuItemConstructorOptions[] {
  const { nativefierVersion, zoom, disableDevTools } = options;
  const zoomResetLabel =
    !zoom || zoom === 1.0
      ? 'Reset Zoom'
      : `Reset Zoom (to ${(zoom * 100).toFixed(1)}%, set at build time)`;

  const editMenu: MenuItemConstructorOptions = {
    label: '&Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo',
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo',
      },
      {
        type: 'separator',
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut',
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy',
      },
      {
        label: 'Copy as Plain Text',
        accelerator: 'CmdOrCtrl+Shift+C',
        click: (): void => {
          // We use clipboard.readText to strip down formatting
          const text = clipboard.readText('selection');
          clipboard.writeText(cleanupPlainText(text), 'clipboard');
        },
      },
      {
        label: 'Copy Current URL',
        accelerator: 'CmdOrCtrl+L',
        click: (): void => clipboard.writeText(getCurrentURL()),
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste',
      },
      {
        label: 'Paste and Match Style',
        // https://github.com/nativefier/nativefier/issues/404
        // Apple's HIG lists this shortcut for paste and match style
        // https://support.apple.com/en-us/HT209651
        accelerator: isOSX() ? 'Option+Shift+Cmd+V' : 'Ctrl+Shift+V',
        role: 'pasteAndMatchStyle',
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectAll',
      },
      {
        label: 'Clear App Data',
        click: (
          item: MenuItem,
          focusedWindow: BrowserWindow | undefined,
        ): void => {
          log.debug('Clear App Data.click', {
            item,
            focusedWindow,
            mainWindow,
          });
          if (!focusedWindow) {
            focusedWindow = mainWindow;
          }
          clearAppData(focusedWindow).catch((err) =>
            log.error('clearAppData ERROR', err),
          );
        },
      },
    ],
  };

  const viewMenu: MenuItemConstructorOptions = {
    label: '&View',
    submenu: [
      {
        label: 'Back',
        accelerator: isOSX() ? 'Cmd+Left' : 'Alt+Left',
        click: goBack,
      },
      {
        label: 'BackAdditionalShortcut',
        visible: false,
        acceleratorWorksWhenHidden: true,
        accelerator: 'CmdOrCtrl+[', // What old versions of Nativefier used, kept for backwards compat
        click: goBack,
      },
      {
        label: 'Forward',
        accelerator: isOSX() ? 'Cmd+Right' : 'Alt+Right',
        click: goForward,
      },
      {
        label: 'ForwardAdditionalShortcut',
        visible: false,
        acceleratorWorksWhenHidden: true,
        accelerator: 'CmdOrCtrl+]', // What old versions of Nativefier used, kept for backwards compat
        click: goForward,
      },
      {
        label: 'Reload',
        role: 'reload',
      },
      {
        type: 'separator',
      },
      {
        label: 'Toggle Full Screen',
        accelerator: isOSX() ? 'Ctrl+Cmd+F' : 'F11',
        enabled: mainWindow.isFullScreenable() || isOSX(),
        visible: mainWindow.isFullScreenable() || isOSX(),
        click: (
          item: MenuItem,
          focusedWindow: BrowserWindow | undefined,
        ): void => {
          log.debug('Toggle Full Screen.click()', {
            item,
            focusedWindow,
            isFullScreen: focusedWindow?.isFullScreen(),
            isFullScreenable: focusedWindow?.isFullScreenable(),
          });
          if (!focusedWindow) {
            focusedWindow = mainWindow;
          }
          if (focusedWindow.isFullScreenable()) {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
          } else if (isOSX()) {
            focusedWindow.setSimpleFullScreen(
              !focusedWindow.isSimpleFullScreen(),
            );
          }
        },
      },
      {
        label: 'Zoom In',
        accelerator: 'CmdOrCtrl+=',
        click: zoomIn,
      },
      {
        label: 'ZoomInAdditionalShortcut',
        visible: false,
        acceleratorWorksWhenHidden: true,
        accelerator: 'CmdOrCtrl+numadd',
        click: zoomIn,
      },
      {
        label: 'Zoom Out',
        accelerator: 'CmdOrCtrl+-',
        click: zoomOut,
      },
      {
        label: 'ZoomOutAdditionalShortcut',
        visible: false,
        acceleratorWorksWhenHidden: true,
        accelerator: 'CmdOrCtrl+numsub',
        click: zoomOut,
      },
      {
        label: zoomResetLabel,
        accelerator: 'CmdOrCtrl+0',
        click: (): void => zoomReset(options),
      },
      {
        label: 'ZoomResetAdditionalShortcut',
        visible: false,
        acceleratorWorksWhenHidden: true,
        accelerator: 'CmdOrCtrl+num0',
        click: (): void => zoomReset(options),
      },
    ],
  };

  if (!disableDevTools) {
    (viewMenu.submenu as MenuItemConstructorOptions[]).push(
      {
        type: 'separator',
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: isOSX() ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
        click: (item: MenuItem, focusedWindow: BrowserWindow | undefined) => {
          log.debug('Toggle Developer Tools.click()', { item, focusedWindow });
          if (!focusedWindow) {
            focusedWindow = mainWindow;
          }
          focusedWindow.webContents.toggleDevTools();
        },
      },
    );
  }

  const windowMenu: MenuItemConstructorOptions = {
    label: '&Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize',
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close',
      },
    ],
  };

  const helpMenu: MenuItemConstructorOptions = {
    label: '&Help',
    role: 'help',
    submenu: [
      {
        label: `Built with Nativefier v${nativefierVersion}`,
        click: (): void => {
          openExternal('https://github.com/nativefier/nativefier').catch(
            (err: unknown): void =>
              log.error(
                'Built with Nativefier v${nativefierVersion}.click ERROR',
                err,
              ),
          );
        },
      },
      {
        label: 'Report an Issue',
        click: (): void => {
          openExternal('https://github.com/nativefier/nativefier/issues').catch(
            (err: unknown): void =>
              log.error('Report an Issue.click ERROR', err),
          );
        },
      },
    ],
  };

  let menuTemplate: MenuItemConstructorOptions[];

  if (isOSX()) {
    const electronMenu: MenuItemConstructorOptions = {
      label: 'E&lectron',
      submenu: [
        {
          label: 'Services',
          role: 'services',
          submenu: [],
        },
        {
          type: 'separator',
        },
        {
          label: 'Hide App',
          accelerator: 'Cmd+H',
          role: 'hide',
        },
        {
          label: 'Hide Others',
          accelerator: 'Cmd+Shift+H',
          role: 'hideOthers',
        },
        {
          label: 'Show All',
          role: 'unhide',
        },
        {
          type: 'separator',
        },
        {
          label: 'Quit',
          accelerator: 'Cmd+Q',
          role: 'quit',
        },
      ],
    };
    (windowMenu.submenu as MenuItemConstructorOptions[]).push(
      {
        type: 'separator',
      },
      {
        label: 'Bring All to Front',
        role: 'front',
      },
    );
    menuTemplate = [electronMenu, editMenu, viewMenu, windowMenu, helpMenu];
  } else {
    menuTemplate = [editMenu, viewMenu, windowMenu, helpMenu];
  }

  return menuTemplate;
}

function injectBookmarks(menuTemplate: MenuItemConstructorOptions[]): void {
  const bookmarkConfigPath = path.join(__dirname, '..', 'bookmarks.json');

  if (!fs.existsSync(bookmarkConfigPath)) {
    return;
  }

  try {
    const bookmarksMenuConfig = JSON.parse(
      fs.readFileSync(bookmarkConfigPath, 'utf-8'),
    ) as BookmarksMenuConfig;
    const submenu: MenuItemConstructorOptions[] =
      bookmarksMenuConfig.bookmarks.map((bookmark) => {
        switch (bookmark.type) {
          case 'link':
            if (!('title' in bookmark && 'url' in bookmark)) {
              throw new Error(
                'All links in the bookmarks menu must have a title and url.',
              );
            }
            try {
              new URL(bookmark.url);
            } catch {
              throw new Error('Bookmark URL "' + bookmark.url + '"is invalid.');
            }
            return {
              label: bookmark.title,
              click: (): void => {
                goToURL(bookmark.url)?.catch((err: unknown): void =>
                  log.error(`${bookmark.title}.click ERROR`, err),
                );
              },
              accelerator:
                'shortcut' in bookmark ? bookmark.shortcut : undefined,
            };
          case 'separator':
            return {
              type: 'separator',
            };
          default:
            throw new Error(
              'A bookmarks menu entry has an invalid type; type must be one of "link", "separator".',
            );
        }
      });
    const bookmarksMenu: MenuItemConstructorOptions = {
      label: bookmarksMenuConfig.menuLabel,
      submenu,
    };
    // Insert custom bookmarks menu between menus "View" and "Window"
    menuTemplate.splice(menuTemplate.length - 2, 0, bookmarksMenu);
  } catch (err: unknown) {
    log.error('Failed to load & parse bookmarks configuration JSON file.', err);
  }
}
