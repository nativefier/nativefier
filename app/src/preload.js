/**
 Preload file that will be executed in the renderer process
 */

var ipc = require('electron').ipcRenderer;

document.addEventListener("DOMContentLoaded", function(event) {
    // do things
});

ipc.on('params', function (event, message) {
    var appArgs = JSON.parse(message);
    console.log('nativefier.json', appArgs);
});
