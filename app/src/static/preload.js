/**
 Preload file that will be executed in the renderer process
 */

/**
 * Note: This needs to be attached prior to the imports, as the they will delay
 * the attachment till after the event has been raised.
 */
document.addEventListener('DOMContentLoaded', () => {
  // Due to the early attachment, this triggers a linter error
  // because it's not yet been defined.
  // eslint-disable-next-line no-use-before-define
  injectScripts();
});

// Disable imports being first due to the above event attachment
import { ipcRenderer } from 'electron'; // eslint-disable-line import/first
import path from 'path'; // eslint-disable-line import/first
import fs from 'fs'; // eslint-disable-line import/first

const INJECT_JS_PATH = path.join(__dirname, '../../', 'inject/inject.js');
const log = require('loglevel');
/**
 * Patches window.Notification to:
 * - set a callback on a new Notification
 * - set a callback for clicks on notifications
 * @param createCallback
 * @param clickCallback
 */
function setNotificationCallback(createCallback, clickCallback) {
  const OldNotify = window.Notification;
  const newNotify = (title, opt) => {
    createCallback(title, opt);
    const instance = new OldNotify(title, opt);
    instance.addEventListener('click', clickCallback);
    return instance;
  };
  newNotify.requestPermission = OldNotify.requestPermission.bind(OldNotify);
  Object.defineProperty(newNotify, 'permission', {
    get: () => OldNotify.permission,
  });

  window.Notification = newNotify;
}

function injectScripts() {
  const needToInject = fs.existsSync(INJECT_JS_PATH);
  if (!needToInject) {
    return;
  }
  // Dynamically require scripts
  // eslint-disable-next-line global-require, import/no-dynamic-require
  require(INJECT_JS_PATH);
}

function notifyNotificationCreate(title, opt) {
  ipcRenderer.send('notification', title, opt);
}
function notifyNotificationClick() {
  ipcRenderer.send('notification-click');
}

setNotificationCallback(notifyNotificationCreate, notifyNotificationClick);

ipcRenderer.on('params', (event, message) => {
  const appArgs = JSON.parse(message);
  log.info('nativefier.json', appArgs);
});

ipcRenderer.on('debug', (event, message) => {
  // eslint-disable-next-line no-console
  log.info('debug:', message);
});
