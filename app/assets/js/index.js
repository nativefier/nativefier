/**
 * Created by JiaHao on 5/7/15.
 */

var ipc = require('electron').ipcRenderer;

document.addEventListener("DOMContentLoaded", function(event) {
    // do things
});

ipc.on('params', function (event, message) {
    var appArgs = JSON.parse(message);
});
