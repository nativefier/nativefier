import { BrowserWindow } from 'electron';
import log from 'loglevel';
import { nativeTabsSupported, openExternal } from '../helpers/helpers';
import { setupNativefierWindow } from '../helpers/windowEvents';
import { createNewTab, createNewWindow } from '../helpers/windowHelpers';

export function initContextMenu(options, window?: BrowserWindow): void {
  // Require this at runtime, otherwise its child dependency 'electron-is-dev'
  // throws an error during unit testing.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const contextMenu = require('electron-context-menu');

  log.debug('initContextMenu', { options, window });

  contextMenu({
    prepend: (actions, params) => {
      log.debug('contextMenu.prepend', { actions, params });
      const items = [];
      if (params.linkURL) {
        items.push({
          label: 'Open Link in Default Browser',
          click: () => {
            openExternal(params.linkURL).catch((err) =>
              log.error('contextMenu Open Link in Default Browser ERROR', err),
            );
          },
        });
        items.push({
          label: 'Open Link in New Window',
          click: () =>
            createNewWindow(
              options,
              setupNativefierWindow,
              params.linkURL,
              window,
            ),
        });
        if (nativeTabsSupported()) {
          items.push({
            label: 'Open Link in New Tab',
            click: () =>
              createNewTab(
                options,
                setupNativefierWindow,
                params.linkURL,
                true,
                window,
              ),
          });
        }
      }
      return items;
    },
  });
}
