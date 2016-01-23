/**
 Preload file that will be executed in the renderer process
 */

var electron = require('electron');
var ipc = electron.ipcRenderer;
var webFrame = electron.webFrame;

document.addEventListener("DOMContentLoaded", function(event) {
    // do things
});

ipc.on('params', function (event, message) {
    var appArgs = JSON.parse(message);
    console.log('nativefier.json', appArgs);
});


ipc.on('change-zoom', function (event, message) {
    webFrame.setZoomFactor(message);
});

