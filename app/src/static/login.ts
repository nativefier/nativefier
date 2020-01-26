import { ipcRenderer } from 'electron';

document.getElementById('login-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('username-input').nodeValue;
  const password = document.getElementById('password-input').nodeValue;
  ipcRenderer.send('login-message', [username, password]);
});
