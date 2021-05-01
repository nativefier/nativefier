import * as fs from 'fs';
import path from 'path';

import { Menu, clipboard, shell, MenuItemConstructorOptions } from 'electron';
import * as log from 'loglevel';

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

export function createMenu({
  nativefierVersion,
  appQuit,
  zoomIn,
  zoomOut,
  zoomReset,
  zoomBuildTimeValue,
  goBack,
  goForward,
  getCurrentUrl,
  gotoUrl,
  clearAppData,
  disableDevTools,
}): void {
  const zoomResetLabel =
    zoomBuildTimeValue === 1.0
      ? 'Reset Zoom'
      : `Reset Zoom (to ${zoomBuildTimeValue * 100}%, set at build time)`;

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
        label: 'Copy Current URL',
        accelerator: 'CmdOrCtrl+L',
        click: () => {
          const currentURL = getCurrentUrl();
          clipboard.writeText(currentURL);
        },
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste',
      },
      {
        label: 'Paste and Match Style',
        accelerator: 'CmdOrCtrl+Shift+V',
        role: 'pasteAndMatchStyle',
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectAll',
      },
      {
        label: 'Clear App Data',
        click: clearAppData,
      },
    ],
  };

  const viewMenu: MenuItemConstructorOptions = {
    label: '&View',
    submenu: [
      {
        label: 'Back',
        accelerator: (() => {
          const backKbShortcut =
            process.platform === 'darwin' ? 'Cmd+Left' : 'Alt+Left';
          return backKbShortcut;
        })(),
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
        accelerator: (() => {
          const forwardKbShortcut =
            process.platform === 'darwin' ? 'Cmd+Right' : 'Alt+Right';
          return forwardKbShortcut;
        })(),
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
        accelerator: 'CmdOrCtrl+R',
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.reload();
          }
        },
      },
      {
        type: 'separator',
      },
      {
        label: 'Toggle Full Screen',
        accelerator: (() => {
          if (process.platform === 'darwin') {
            return 'Ctrl+Cmd+F';
          }
          return 'F11';
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
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
        click: zoomReset,
      },
      {
        label: 'ZoomResetAdditionalShortcut',
        visible: false,
        acceleratorWorksWhenHidden: true,
        accelerator: 'CmdOrCtrl+num0',
        click: zoomReset,
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
        accelerator: (() => {
          if (process.platform === 'darwin') {
            return 'Alt+Cmd+I';
          }
          return 'Ctrl+Shift+I';
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow) {
            focusedWindow.webContents.toggleDevTools();
          }
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
        click: () => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          shell.openExternal('https://github.com/nativefier/nativefier');
        },
      },
      {
        label: 'Report an Issue',
        click: () => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          shell.openExternal('https://github.com/nativefier/nativefier/issues');
        },
      },
    ],
  };

  let menuTemplate: MenuItemConstructorOptions[];

  if (process.platform === 'darwin') {
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
          click: appQuit,
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

  try {
    const bookmarkConfigPath = path.join(__dirname, '..', 'bookmarks.json');
    if (fs.existsSync(bookmarkConfigPath)) {
      const bookmarksMenuConfig: BookmarksMenuConfig = JSON.parse(
        fs.readFileSync(bookmarkConfigPath, 'utf-8'),
      );
      const bookmarksMenu: MenuItemConstructorOptions = {
        label: bookmarksMenuConfig.menuLabel,
        submenu: bookmarksMenuConfig.bookmarks.map((bookmark) => {
          if (bookmark.type === 'link') {
            if (!('title' in bookmark && 'url' in bookmark)) {
              throw Error(
                'All links in the bookmarks menu must have a title and url.',
              );
            }
            try {
              new URL(bookmark.url);
            } catch (_) {
              throw Error('Bookmark URL "' + bookmark.url + '"is invalid.');
            }
            let accelerator = null;
            if ('shortcut' in bookmark) {
              accelerator = bookmark.shortcut;
            }
            return {
              label: bookmark.title,
              click: () => {
                gotoUrl(bookmark.url);
              },
              accelerator: accelerator,
            };
          } else if (bookmark.type === 'separator') {
            return {
              type: 'separator',
            };
          } else {
            throw Error(
              'A bookmarks menu entry has an invalid type; type must be one of "link", "separator".',
            );
          }
        }),
      };
      // Insert custom bookmarks menu between menus "View" and "Window"
      menuTemplate.splice(menuTemplate.length - 2, 0, bookmarksMenu);
    }
  } catch (err) {
    log.error('Failed to load & parse bookmarks configuration JSON file.', err);
  }

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}
