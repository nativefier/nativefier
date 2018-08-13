import electron from 'electron';

const { ipcRenderer } = electron;

const form = document.getElementById('login-form');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('username-input').value;
  const password = document.getElementById('password-input').value;
  ipcRenderer.send('login-message', [username, password]);
});
