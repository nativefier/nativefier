/**
 Preload file that will be executed in the renderer process
 */
import electron from 'electron';
import path from 'path';
import fs from 'fs';
const {ipcRenderer, webFrame} = electron;

const INJECT_JS_PATH = path.join(__dirname, '../../', 'inject/inject.js');

setNotificationCallback((title, opt) => {
    ipcRenderer.send('notification', title, opt);
});

document.addEventListener('DOMContentLoaded', event => {
    // do things

    window.addEventListener('contextmenu', event => {
        event.preventDefault();
        const targetElement = event.srcElement;
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

ipcRenderer.on('change-zoom', (event, message) => {
    webFrame.setZoomFactor(message);
});

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
        get: () => {
            return OldNotify.permission;
        }
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
    require(INJECT_JS_PATH);
}
