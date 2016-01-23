var ipcRenderer = require('electron').ipcRenderer;

var form = document.getElementById('login-form');

form.addEventListener('submit', function(event) {
    event.preventDefault();
    var username = document.getElementById('username-input').value;
    var password = document.getElementById('password-input').value;
    ipcRenderer.send('login-message', [username, password]);
});
