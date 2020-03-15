const { ipcRenderer } = require('electron');

document.getElementById('login-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const usernameInput = document.getElementById('username-input');
  const username = usernameInput.nodeValue || usernameInput.value;
  const passwordInput = document.getElementById('password-input');
  const password = passwordInput.nodeValue || passwordInput.value;
  ipcRenderer.send('login-message', [username, password]);
});
