/**
 Preload file that will be executed in the renderer process
 */

var ipc = require('electron').ipcRenderer;

// monkeypatch window.Notification
hookNotify(function(title, opt){
  ipc.emit('notification', title, opt);
});

document.addEventListener("DOMContentLoaded", function(event) {
  // do things here
  Notification.requestPermission().then(function(){
    new Notification('test')
  })
});

ipc.on('params', function (event, message) {
    var appArgs = JSON.parse(message);
    console.log('nativefier.json', appArgs);
});

function hookNotify(cb){
  var oldNotify = window.Notification;
  var newNotify = function (title, opt) {
    cb(title, opt);
    return new oldNotify(title, opt);
  };
  newNotify.requestPermission = oldNotify.requestPermission.bind(oldNotify);
  Object.defineProperty(newNotify, 'permission', {
    get: function() {
      return oldNotify.permission;
    }
  });

  window.Notification = newNotify;
}
