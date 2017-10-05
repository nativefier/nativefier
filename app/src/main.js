import 'source-map-support/register';
import fs from 'fs';
import path from 'path';
import { app, crashReporter } from 'electron';
import electronDownload from 'electron-dl';

import createLoginWindow from './components/login/loginWindow';
import createMainWindow from './components/mainWindow/mainWindow';
import createTrayIcon from './components/trayIcon/trayIcon';
import helpers from './helpers/helpers';
import inferFlash from './helpers/inferFlash';

const { isOSX } = helpers;

electronDownload();

const APP_ARGS_FILE_PATH = path.join(__dirname, '..', 'nativefier.json');
const appArgs = JSON.parse(fs.readFileSync(APP_ARGS_FILE_PATH, 'utf8'));

if (appArgs.processEnvs) {
  Object.keys(appArgs.processEnvs).forEach((key) => {
    /* eslint-env node */
    process.env[key] = appArgs.processEnvs[key];
  });
}

let mainWindow;

if (typeof appArgs.flashPluginDir === 'string') {
  app.commandLine.appendSwitch('ppapi-flash-path', appArgs.flashPluginDir);
} else if (appArgs.flashPluginDir) {
  const flashPath = inferFlash();
  app.commandLine.appendSwitch('ppapi-flash-path', flashPath);
}

if (appArgs.ignoreCertificate) {
  app.commandLine.appendSwitch('ignore-certificate-errors');
}

if (appArgs.ignoreGpuBlacklist) {
  app.commandLine.appendSwitch('ignore-gpu-blacklist');
}

if (appArgs.enableEs3Apis) {
  app.commandLine.appendSwitch('enable-es3-apis');
}

if (appArgs.diskCacheSize) {
  app.commandLine.appendSwitch('disk-cache-size', appArgs.diskCacheSize);
}

if (appArgs.basicAuthUsername) {
  app.commandLine.appendSwitch('basic-auth-username', appArgs.basicAuthUsername);
}

if (appArgs.basicAuthPassword) {
  app.commandLine.appendSwitch('basic-auth-password', appArgs.basicAuthPassword);
}

// do nothing for setDockBadge if not OSX
let setDockBadge = () => {};

if (isOSX()) {
  setDockBadge = app.dock.setBadge;
}

app.on('window-all-closed', () => {
  if (!isOSX() || appArgs.fastQuit) {
    app.quit();
  }
});

app.on('activate', (event, hasVisibleWindows) => {
  if (isOSX()) {
        // this is called when the dock is clicked
    if (!hasVisibleWindows) {
      mainWindow.show();
    }
  }
});

app.on('before-quit', () => {
  // not fired when the close button on the window is clicked
  if (isOSX()) {
    // need to force a quit as a workaround here to simulate the osx app hiding behaviour
    // Somehow sokution at https://github.com/atom/electron/issues/444#issuecomment-76492576 does not work,
    // e.prevent default appears to persist

    // might cause issues in the future as before-quit and will-quit events are not called
    app.exit(0);
  }
});

if (appArgs.crashReporter) {
  app.on('will-finish-launching', () => {
    crashReporter.start({
      companyName: appArgs.companyName || '',
      productName: appArgs.name,
      submitURL: appArgs.crashReporter,
      autoSubmit: true,
    });
  });
}

app.on('ready', () => {
  mainWindow = createMainWindow(appArgs, app.quit, setDockBadge);
  createTrayIcon(appArgs, mainWindow);
});

app.on('login', (event, webContents, request, authInfo, callback) => {
    // for http authentication
  event.preventDefault();

  if (appArgs.basicAuthUsername !== null && appArgs.basicAuthPassword !== null) {
    callback(appArgs.basicAuthUsername, appArgs.basicAuthPassword);
  } else {
    createLoginWindow(callback);
  }
});

if (appArgs.singleInstance) {
  const shouldQuit = app.makeSingleInstance(() => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  if (shouldQuit) {
    app.quit();
  }
}
