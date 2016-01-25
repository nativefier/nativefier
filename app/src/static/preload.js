/**
 Preload file that will be executed in the renderer process
 */
import electron from 'electron';
var ipc = electron.ipcRenderer;
var webFrame = electron.webFrame;

setNotificationCallback(function(title, opt) {
    ipc.send('notification', title, opt);
});

document.addEventListener('DOMContentLoaded', function(event) {
    // do things

    window.addEventListener('contextmenu', function(event) {
        event.preventDefault();
        const targetElement = event.srcElement;
        const targetHref = targetElement.href;

        if (!targetHref) {
            ipc.once('contextMenuClosed', () => {
                clickSelector(event.target);
                ipc.send('cancelNewWindowOverride');
            });
        }

        ipc.send('contextMenuOpened', targetHref);
    }, false);

});

ipc.on('params', function(event, message) {
    var appArgs = JSON.parse(message);
    console.log('nativefier.json', appArgs);
});

ipc.on('change-zoom', function(event, message) {
    webFrame.setZoomFactor(message);
});

/**
 * Patches window.Notification to set a callback on a new Notification
 * @param callback
 */
function setNotificationCallback(callback) {

    var OldNotify = window.Notification;
    var newNotify = function(title, opt) {
        callback(title, opt);
        return new OldNotify(title, opt);
    };
    newNotify.requestPermission = OldNotify.requestPermission.bind(OldNotify);
    Object.defineProperty(newNotify, 'permission', {
        get: function() {
            return OldNotify.permission;
        }
    });

    window.Notification = newNotify;
}

function clickSelector(element) {
    const mouseEvent = new MouseEvent('click');
    element.dispatchEvent(mouseEvent);
}
