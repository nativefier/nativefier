/**
 * Preload file that will be executed in the renderer process.
 * Note: This needs to be attached **prior to imports**, as imports
 * would delay the attachment till after the event has been raised.
 */
document.addEventListener('DOMContentLoaded', () => {
  injectScripts(); // eslint-disable-line @typescript-eslint/no-use-before-define
});

import * as fs from 'fs';
import * as path from 'path';

import { ipcRenderer } from 'electron';
import { OutputOptions } from '../../shared/src/options/model';

// Do *NOT* add 3rd-party imports here in preload (except for webpack `externals` like electron).
// They will work during development, but break in the prod build :-/ .
// Electron doc isn't explicit about that, so maybe *we*'re doing something wrong.
// At any rate, that's what we have now. If you want an import here, go ahead, but
// verify that apps built with a non-devbuild nativefier (installed from tarball) work.
// Recipe to monkey around this, assuming you git-cloned nativefier in /opt/nativefier/ :
// cd /opt/nativefier/ && rm -f nativefier-43.1.0.tgz && npm run build && npm pack && mkdir -p ~/n4310/ && cd ~/n4310/ \
//    && rm -rf ./* && npm i /opt/nativefier/nativefier-43.1.0.tgz && ./node_modules/.bin/nativefier 'google.com'
// See https://github.com/nativefier/nativefier/issues/1175
// and https://www.electronjs.org/docs/api/browser-window#new-browserwindowoptions / preload

const log = console; // since we can't have `loglevel` here in preload

export const INJECT_DIR = path.join(__dirname, '..', 'inject');

/**
 * Patches window.Notification to:
 * - set a callback on a new Notification
 * - set a callback for clicks on notifications
 * @param createCallback
 * @param clickCallback
 */
function setNotificationCallback(
  createCallback: {
    (title: string, opt: NotificationOptions): void;
    (...args: unknown[]): void;
  },
  clickCallback: { (): void; (this: Notification, ev: Event): unknown },
): void {
  const OldNotify = window.Notification;
  const newNotify = function (
    title: string,
    opt: NotificationOptions,
  ): Notification {
    createCallback(title, opt);
    const instance = new OldNotify(title, opt);
    instance.addEventListener('click', clickCallback);
    return instance;
  };
  newNotify.requestPermission = OldNotify.requestPermission.bind(OldNotify);
  Object.defineProperty(newNotify, 'permission', {
    get: () => OldNotify.permission,
  });

  // @ts-expect-error TypeScript says its not compatible, but it works?
  window.Notification = newNotify;
}

function injectScripts(): void {
  const needToInject = fs.existsSync(INJECT_DIR);
  if (!needToInject) {
    return;
  }
  // Dynamically require scripts
  try {
    const jsFiles = fs
      .readdirSync(INJECT_DIR, { withFileTypes: true })
      .filter(
        (injectFile) => injectFile.isFile() && injectFile.name.endsWith('.js'),
      )
      .map((jsFileStat) => path.join('..', 'inject', jsFileStat.name));
    for (const jsFile of jsFiles) {
      log.debug('Injecting JS file', jsFile);
      require(jsFile);
    }
  } catch (err: unknown) {
    log.error('Error encoutered injecting JS files', err);
  }
}

function notifyNotificationCreate(
  title: string,
  opt: NotificationOptions,
): void {
  ipcRenderer.send('notification', title, opt);
}
function notifyNotificationClick(): void {
  ipcRenderer.send('notification-click');
}

// @ts-expect-error TypeScript thinks these are incompatible but they aren't
setNotificationCallback(notifyNotificationCreate, notifyNotificationClick);

ipcRenderer.on('params', (event, message: string) => {
  log.debug('ipcRenderer.params', { event, message });
  const appArgs = JSON.parse(message) as OutputOptions;
  log.info('nativefier.json', appArgs);
});

ipcRenderer.on('debug', (event, message: string) => {
  log.debug('ipcRenderer.debug', { event, message });
});
