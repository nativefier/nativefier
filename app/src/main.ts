import 'source-map-support/register';

import fs from 'fs';

import {
  app,
  crashReporter,
  dialog,
  globalShortcut,
  systemPreferences,
  BrowserWindow,
} from 'electron';
import electronDownload from 'electron-dl';

import { createLoginWindow } from './components/loginWindow';
import {
  createMainWindow,
  saveAppArgs,
  APP_ARGS_FILE_PATH,
} from './components/mainWindow';
import { createTrayIcon } from './components/trayIcon';
import { isOSX } from './helpers/helpers';
import { inferFlashPath } from './helpers/inferFlash';

// Entrypoint for Squirrel, a windows update framework. See https://github.com/nativefier/nativefier/pull/744
if (require('electron-squirrel-startup')) {
  app.exit();
}

const appArgs = JSON.parse(fs.readFileSync(APP_ARGS_FILE_PATH, 'utf8'));

const OLD_BUILD_WARNING_THRESHOLD_DAYS = 60;
const OLD_BUILD_WARNING_THRESHOLD_MS =
  OLD_BUILD_WARNING_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

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

      if (isOSX() && appArgs.accessibilityPrompt) {
        const mediaKeys = [
          'MediaPlayPause',
          'MediaNextTrack',
          'MediaPreviousTrack',
          'MediaStop',
        ];
        const globalShortcutsKeys = appArgs.globalShortcuts.map((g) => g.key);
        const mediaKeyWasSet = globalShortcutsKeys.find((g) =>
          mediaKeys.includes(g),
        );
        if (
          mediaKeyWasSet &&
          !systemPreferences.isTrustedAccessibilityClient(false)
        ) {
          // Since we're trying to set global keyboard shortcuts for media keys, we need to prompt
          // the user for permission on Mac.
          // For reference:
          // https://www.electronjs.org/docs/api/global-shortcut?q=MediaPlayPause#globalshortcutregisteraccelerator-callback
          const accessibilityPromptResult = dialog.showMessageBoxSync(null, {
            type: 'question',
            message: 'Accessibility Permissions Needed',
            buttons: ['Yes', 'No', 'No and never ask again'],
            defaultId: 0,
            detail:
              `${appArgs.name} would like to use one or more of your keyboard's media keys (start, stop, next track, or previous track) to control it.\n\n` +
              `Would you like Mac OS to ask for your permission to do so?\n\n` +
              `If so, you will need to restart ${appArgs.name} after granting permissions for these keyboard shortcuts to begin working.`,
          });
          switch (accessibilityPromptResult) {
            // User clicked Yes, prompt for accessibility
            case 0:
              systemPreferences.isTrustedAccessibilityClient(true);
              break;
            // User cliecked Never Ask Me Again, save that info
            case 2:
              appArgs.accessibilityPrompt = false;
              saveAppArgs(appArgs);
              break;
            // User clicked No
            default:
              break;
          }
        }
      }
    }
    if (
      !appArgs.disableOldBuildWarning &&
      new Date().getTime() - appArgs.buildDate > OLD_BUILD_WARNING_THRESHOLD_MS
    ) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      dialog.showMessageBox(null, {
        type: 'warning',
        message: 'Old build detected',
        detail:
          'This app was built a long time ago. Nativefier uses the Chrome browser (through Electron), and it is dangerous to keep using an old version of it. You should rebuild this app with a recent Electron. Using the latest Nativefier will default to it, or you can pass it manually.',
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
