import 'source-map-support/register';

import fs from 'fs';
import path from 'path';

import { app, crashReporter, globalShortcut, BrowserWindow } from 'electron';
import electronDownload from 'electron-dl';

import { createLoginWindow } from './components/loginWindow';
import { createMainWindow } from './components/mainWindow';
import { createTrayIcon } from './components/trayIcon';
import { isOSX } from './helpers/helpers';
import { inferFlashPath } from './helpers/inferFlash';

// Entrypoint for Squirrel, a windows update framework. See https://github.com/jiahaog/nativefier/pull/744
if (require('electron-squirrel-startup')) {
  app.exit();
}

const APP_ARGS_FILE_PATH = path.join(__dirname, '..', 'nativefier.json');
const appArgs = JSON.parse(fs.readFileSync(APP_ARGS_FILE_PATH, 'utf8'));

const fileDownloadOptions = { ...appArgs.fileDownloadOptions };
electronDownload(fileDownloadOptions);

if (appArgs.processEnvs) {
  // This is compatibility if just a string was passed.
  if (typeof appArgs.processEnvs === 'string') {
    process.env.processEnvs = appArgs.processEnvs;
  } else {
    Object.keys(appArgs.processEnvs).forEach((key) => {
      /* eslint-env node */
      process.env[key] = appArgs.processEnvs[key];
    });
  }
}

let mainWindow: BrowserWindow;

if (typeof appArgs.flashPluginDir === 'string') {
  app.commandLine.appendSwitch('ppapi-flash-path', appArgs.flashPluginDir);
} else if (appArgs.flashPluginDir) {
  const flashPath = inferFlashPath();
  app.commandLine.appendSwitch('ppapi-flash-path', flashPath);
}

if (appArgs.ignoreCertificate) {
  app.commandLine.appendSwitch('ignore-certificate-errors');
}

if (appArgs.disableGpu) {
  app.disableHardwareAcceleration();
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
  app.commandLine.appendSwitch(
    'basic-auth-username',
    appArgs.basicAuthUsername,
  );
}

if (appArgs.basicAuthPassword) {
  app.commandLine.appendSwitch(
    'basic-auth-password',
    appArgs.basicAuthPassword,
  );
}

const isRunningMacos = isOSX();
let currentBadgeCount = 0;
const setDockBadge = isRunningMacos
  ? (count: number, bounce = false) => {
      app.dock.setBadge(count.toString());
      if (bounce && count > currentBadgeCount) app.dock.bounce();
      currentBadgeCount = count;
    }
  : () => undefined;

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
      uploadToServer: true,
    });
  });
}

// quit if singleInstance mode and there's already another instance running
const shouldQuit = appArgs.singleInstance && !app.requestSingleInstanceLock();
if (shouldQuit) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (!mainWindow.isVisible()) {
        // try
        mainWindow.show();
      }
      if (mainWindow.isMinimized()) {
        // minimized
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });

  app.on('ready', () => {
    mainWindow = createMainWindow(appArgs, app.quit.bind(this), setDockBadge);
    createTrayIcon(appArgs, mainWindow);

    // Register global shortcuts
    if (appArgs.globalShortcuts) {
      appArgs.globalShortcuts.forEach((shortcut) => {
        globalShortcut.register(shortcut.key, () => {
          shortcut.inputEvents.forEach((inputEvent) => {
            mainWindow.webContents.sendInputEvent(inputEvent);
          });
        });
      });
    }
  });
}

app.on('new-window-for-tab', () => {
  mainWindow.emit('new-tab');
});

app.on('login', (event, webContents, request, authInfo, callback) => {
  // for http authentication
  event.preventDefault();

  if (
    appArgs.basicAuthUsername !== null &&
    appArgs.basicAuthPassword !== null
  ) {
    callback(appArgs.basicAuthUsername, appArgs.basicAuthPassword);
  } else {
    createLoginWindow(callback);
  }
});
