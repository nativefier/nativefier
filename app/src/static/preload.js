/**
 Preload file that will be executed in the renderer process
 */

var electron = require('electron');
var ipc = electron.ipcRenderer;
var webFrame = electron.webFrame;
import loader from '../helpers/loader';

setNotificationCallback(function (title, opt) {
    ipc.send('notification', title, opt);
});

document.addEventListener("DOMContentLoaded", function (event) {
    // do things
    loader.runAll(document, event)
});

ipc.on('params', function (event, message) {
    var appArgs = JSON.parse(message);
    console.log('nativefier.json', appArgs);
});

ipc.on('change-zoom', function (event, message) {
    webFrame.setZoomFactor(message);
});


/**
 * Patches window.Notification to set a callback on a new Notification
 * @param callback
 */
function setNotificationCallback(callback) {

    var oldNotify = window.Notification;
    var newNotify = function (title, opt) {
        callback(title, opt);
        return new oldNotify(title, opt);
    };
    newNotify.requestPermission = oldNotify.requestPermission.bind(oldNotify);
    Object.defineProperty(newNotify, 'permission', {
        get: function () {
            return oldNotify.permission;
        }
    });

    window.Notification = newNotify;
}
