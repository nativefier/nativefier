/**
 Preload file that will be executed in the renderer process
 */
import { ipcRenderer, webFrame } from 'electron';
import path from 'path';
import fs from 'fs';

const INJECT_JS_PATH = path.join(__dirname, '../../', 'inject/inject.js');

/**
 * Patches window.Notification to set a callback on a new Notification
 * @param callback
 */
function setNotificationCallback(callback) {
  const OldNotify = window.Notification;
  const newNotify = (title, opt) => {
    callback(title, opt);
    return new OldNotify(title, opt);
  };
  newNotify.requestPermission = OldNotify.requestPermission.bind(OldNotify);
  Object.defineProperty(newNotify, 'permission', {
    get: () => OldNotify.permission,
  });

  window.Notification = newNotify;
}

function clickSelector(element) {
  const mouseEvent = new MouseEvent('click');
  element.dispatchEvent(mouseEvent);
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

setNotificationCallback((title, opt) => {
  ipcRenderer.send('notification', title, opt);
});

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    let targetElement = event.srcElement;

    // the clicked element is the deepest in the DOM, and may not be the <a> bearing the href
    // for example, <a href="..."><span>Google</span></a>
    while (!targetElement.href && targetElement.parentElement) {
      targetElement = targetElement.parentElement;
    }
    const targetHref = targetElement.href;

    if (!targetHref) {
      ipcRenderer.once('contextMenuClosed', () => {
        clickSelector(event.target);
        ipcRenderer.send('cancelNewWindowOverride');
      });
    }

    ipcRenderer.send('contextMenuOpened', targetHref);
  }, false);

  injectScripts();
});

ipcRenderer.on('params', (event, message) => {
  const appArgs = JSON.parse(message);
  console.log('nativefier.json', appArgs);
});

ipcRenderer.on('debug', (event, message) => {
  // eslint-disable-next-line no-console
  console.log('debug:', message);
});

ipcRenderer.on('change-zoom', (event, message) => {
  webFrame.setZoomFactor(message);
});

