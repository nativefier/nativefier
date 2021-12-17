import { BrowserWindow, ContextMenuParams } from 'electron';
import contextMenu from 'electron-context-menu';
import log from 'loglevel';
import { nativeTabsSupported, openExternal } from '../helpers/helpers';
import { setupNativefierWindow } from '../helpers/windowEvents';
import { createNewTab, createNewWindow } from '../helpers/windowHelpers';
import {
  OutputOptions,
  outputOptionsToWindowOptions,
} from '../../../shared/src/options/model';

export function initContextMenu(
  options: OutputOptions,
  window?: BrowserWindow,
): void {
  log.debug('initContextMenu', { options, window });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  contextMenu({
    prepend: (actions: contextMenu.Actions, params: ContextMenuParams) => {
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
              outputOptionsToWindowOptions(options),
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
                outputOptionsToWindowOptions(options),
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
    showCopyImage: true,
    showCopyImageAddress: true,
    showSaveImage: true,
  });
}
