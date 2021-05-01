import 'source-map-support/register';

import fs from 'fs';
import * as path from 'path';

import {
  app,
  crashReporter,
  dialog,
  globalShortcut,
  systemPreferences,
  BrowserWindow,
} from 'electron';
import electronDownload from 'electron-dl';
import * as log from 'loglevel';

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

log.debug('appArgs', appArgs);
// Do this relatively early so that we can start storing appData with the app
if (appArgs.portable) {
  log.debug(
    'App was built as portable; setting appData and userData to the app folder: ',
    path.resolve(path.join(__dirname, '..', 'appData')),
  );
  app.setPath('appData', path.join(__dirname, '..', 'appData'));
  app.setPath('userData', path.join(__dirname, '..', 'appData'));
}

// Take in a URL on the command line as an override
if (process.argv.length > 1) {
  const maybeUrl = process.argv[1];
  try {
    new URL(maybeUrl);
    appArgs.targetUrl = maybeUrl;
    console.info('Loading override URL passed as argument:', maybeUrl);
  } catch (err) {
    console.error(
      'Not loading override URL passed as argument, because failed to parse:',
      maybeUrl,
    );
  }
}

// Nativefier is a browser, and an old browser is an insecure / badly-performant one.
// Given our builder/app design, we currently don't have an easy way to offer
// upgrades from the app themselves (like browsers do).
// As a workaround, we ask for a manual upgrade & re-build if the build is old.
// The period in days is chosen to be not too small to be exceedingly annoying,
// but not too large to be exceedingly insecure.
const OLD_BUILD_WARNING_THRESHOLD_DAYS = 90;
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

if (appArgs.lang) {
  const langParts = (appArgs.lang as string).split(',');
  // Convert locales to languages, because for some reason locales don't work. Stupid Chromium
  const langPartsParsed = Array.from(
    // Convert to set to dedupe in case something like "en-GB,en-US" was passed
    new Set(langParts.map((l) => l.split('-')[0])),
  );
  const langFlag = langPartsParsed.join(',');
  log.debug('Setting --lang flag to', langFlag);
  app.commandLine.appendSwitch('--lang', langFlag);
}

let currentBadgeCount = 0;
const setDockBadge = isOSX()
  ? (count: number, bounce = false) => {
      app.dock.setBadge(count.toString());
      if (bounce && count > currentBadgeCount) app.dock.bounce();
      currentBadgeCount = count;
    }
  : () => undefined;

app.on('window-all-closed', () => {
  log.debug('windows-all-closed');
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
  log.debug('before-quit');
  // not fired when the close button on the window is clicked
  if (isOSX()) {
    // need to force a quit as a workaround here to simulate the osx app hiding behaviour
    // Somehow sokution at https://github.com/atom/electron/issues/444#issuecomment-76492576 does not work,
    // e.prevent default appears to persist

    // might cause issues in the future as before-quit and will-quit events are not called
    app.exit(0);
  }
});

app.on('will-quit', (event) => {
  log.debug('will-quit', event);
});

app.on('quit', (event, exitCode) => {
  log.debug('quit', event, exitCode);
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

  if (appArgs.widevine) {
    // @ts-ignore This event only appears on the widevine version of electron, which we'd see at runtime
    app.on('widevine-ready', (version: string, lastVersion: string) => {
      console.log('widevine-ready', version, lastVersion);
      onReady();
    });

    app.on(
      // @ts-ignore This event only appears on the widevine version of electron, which we'd see at runtime
      'widevine-update-pending',
      (currentVersion: string, pendingVersion: string) => {
        console.log(
          `Widevine ${currentVersion} is ready to be upgraded to ${pendingVersion}`,
        );
      },
    );

    // @ts-ignore This event only appears on the widevine version of electron, which we'd see at runtime
    app.on('widevine-error', (error: any) => {
      console.error('WIDEVINE ERROR: ', error);
    });
  } else {
    app.on('ready', () => {
      console.log('ready');
      onReady();
    });
  }
}

function onReady(): void {
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
    const oldBuildWarningText =
      appArgs.oldBuildWarningText ||
      'This app was built a long time ago. Nativefier uses the Chrome browser (through Electron), and it is insecure to keep using an old version of it. Please upgrade Nativefier and rebuild this app.';
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    dialog.showMessageBox(null, {
      type: 'warning',
      message: 'Old build detected',
      detail: oldBuildWarningText,
    });
  }
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
