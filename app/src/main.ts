import 'source-map-support/register';

import fs from 'fs';
import * as path from 'path';

import electron, {
  app,
  dialog,
  globalShortcut,
  systemPreferences,
  BrowserWindow,
  Event,
} from 'electron';
import electronDownload from 'electron-dl';

import { createLoginWindow } from './components/loginWindow';
import {
  createMainWindow,
  saveAppArgs,
  APP_ARGS_FILE_PATH,
} from './components/mainWindow';
import { createTrayIcon } from './components/trayIcon';
import {
  isOSX,
  isWayland,
  isWindows,
  removeUserAgentSpecifics,
} from './helpers/helpers';
import { inferFlashPath } from './helpers/inferFlash';
import * as log from './helpers/loggingHelper';
import {
  IS_PLAYWRIGHT,
  PLAYWRIGHT_CONFIG,
  safeGetEnv,
} from './helpers/playwrightHelpers';
import { OutputOptions } from '../../shared/src/options/model';

// Entrypoint for Squirrel, a windows update framework. See https://github.com/nativefier/nativefier/pull/744
if (require('electron-squirrel-startup')) {
  app.exit();
}

if (process.argv.indexOf('--verbose') > -1 || safeGetEnv('VERBOSE') === '1') {
  log.setLevel('DEBUG');
  process.traceDeprecation = true;
  process.traceProcessWarnings = true;
  process.argv.slice(1);
}

let mainWindow: BrowserWindow;

const appArgs =
  IS_PLAYWRIGHT && PLAYWRIGHT_CONFIG
    ? (JSON.parse(PLAYWRIGHT_CONFIG) as OutputOptions)
    : (JSON.parse(
        fs.readFileSync(APP_ARGS_FILE_PATH, 'utf8'),
      ) as OutputOptions);

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

if (!appArgs.userAgentHonest) {
  if (appArgs.userAgent) {
    app.userAgentFallback = appArgs.userAgent;
  } else {
    app.userAgentFallback = removeUserAgentSpecifics(
      app.userAgentFallback,
      app.getName(),
      app.getVersion(),
    );
  }
}

// this step is required to allow app names to be displayed correctly in notifications on windows
// https://www.electronjs.org/docs/latest/api/app#appsetappusermodelidid-windows
// https://www.electronjs.org/docs/latest/tutorial/notifications#windows
if (isWindows()) {
  app.setAppUserModelId(app.getName());
}

const urlArgv = process.argv.filter((a) => a.startsWith('http'));

// Take in a URL on the command line as an override
if (urlArgv.length > 0) {
  const maybeUrl = urlArgv[0];
  try {
    new URL(maybeUrl);
    appArgs.targetUrl = maybeUrl;
    log.info('Loading override URL passed as argument:', maybeUrl);
  } catch (err: unknown) {
    log.error(
      'Not loading override URL passed as argument, because failed to parse:',
      maybeUrl,
      err,
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
  let processEnvs: Record<string, string> =
    appArgs.processEnvs as unknown as Record<string, string>;
  // This is compatibility if just a string was passed.
  if (typeof appArgs.processEnvs === 'string') {
    try {
      processEnvs = JSON.parse(appArgs.processEnvs) as Record<string, string>;
    } catch {
      // This wasn't JSON. Fall back to the old code
      processEnvs = {};
      process.env.processEnvs = appArgs.processEnvs;
    }
  }
  Object.keys(processEnvs)
    .filter((key) => key !== undefined)
    .forEach((key) => {
      process.env[key] = processEnvs[key];
    });
}

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
  app.commandLine.appendSwitch(
    'disk-cache-size',
    appArgs.diskCacheSize.toString(),
  );
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

if (isWayland()) {
  app.commandLine.appendSwitch('enable-features', 'WebRTCPipeWireCapturer');
}

if (appArgs.lang) {
  const langParts = appArgs.lang.split(',');
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
  ? (count?: number | string, bounce = false): void => {
      if (count !== undefined) {
        app.dock.setBadge(count.toString());
        if (bounce && typeof count === 'number' && count > currentBadgeCount)
          app.dock.bounce();
        currentBadgeCount = typeof count === 'number' ? count : 0;
      }
    }
  : (): void => undefined;

app.on('window-all-closed', () => {
  log.debug('app.window-all-closed');
  if (!isOSX() || appArgs.fastQuit || IS_PLAYWRIGHT) {
    app.quit();
  }
});

app.on('before-quit', () => {
  log.debug('app.before-quit');
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
  log.debug('app.will-quit', event);
});

app.on('quit', (event, exitCode) => {
  log.debug('app.quit', { event, exitCode });
});

app.on('will-finish-launching', () => {
  log.debug('app.will-finish-launching');
});

app.on('open-url', (event, url) => {
  log.debug('app.open-url', { event, url });

  event.preventDefault();
  if (mainWindow) {
    mainWindow.webContents.send('open-url', url);
  }
});

if (appArgs.widevine) {
  // @ts-expect-error This event only appears on the widevine version of electron, which we'd see at runtime
  app.on('widevine-ready', (version: string, lastVersion: string) => {
    log.debug('app.widevine-ready', { version, lastVersion });
    onReady().catch((err) => log.error('onReady ERROR', err));
  });

  app.on(
    // @ts-expect-error This event only appears on the widevine version of electron, which we'd see at runtime
    'widevine-update-pending',
    (currentVersion: string, pendingVersion: string) => {
      log.debug('app.widevine-update-pending', {
        currentVersion,
        pendingVersion,
      });
    },
  );

  // @ts-expect-error This event only appears on the widevine version of electron, which we'd see at runtime
  app.on('widevine-error', (error: Error) => {
    log.error('app.widevine-error', error);
  });
} else {
  app.on('ready', () => {
    log.debug('ready');
    onReady().catch((err) => log.error('onReady ERROR', err));
  });
}

app.on('activate', (event: electron.Event, hasVisibleWindows: boolean) => {
  log.debug('app.activate', { event, hasVisibleWindows });
  if (isOSX() && !IS_PLAYWRIGHT) {
    // this is called when the dock is clicked
    if (!hasVisibleWindows) {
      mainWindow.show();
    }
  }
});

// quit if singleInstance mode and there's already another instance running
const shouldQuit = appArgs.singleInstance && !app.requestSingleInstanceLock();
if (shouldQuit) {
  app.quit();
} else {
  app.on('second-instance', () => {
    log.debug('app.second-instance');
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
}

app.on('new-window-for-tab', (event: Event) => {
  log.debug('app.new-window-for-tab', { event });
  if (mainWindow) {
    mainWindow.emit('new-window-for-tab', event);
  }
});

app.on(
  'login',
  (
    event,
    webContents,
    request,
    authInfo,
    callback: (username?: string, password?: string) => void,
  ) => {
    log.debug('app.login', { event, request });
    // for http authentication
    event.preventDefault();

    if (appArgs.basicAuthUsername && appArgs.basicAuthPassword) {
      callback(appArgs.basicAuthUsername, appArgs.basicAuthPassword);
    } else {
      createLoginWindow(
        callback,
        // mainWindow
      ).catch((err) => log.error('createLoginWindow ERROR', err));
    }
  },
);

async function onReady(): Promise<void> {
  // Warning: `mainWindow` below is the *global* unique `mainWindow`, created at init time
  mainWindow = await createMainWindow(appArgs, setDockBadge);

  createTrayIcon(appArgs, mainWindow);

  // Register global shortcuts
  if (appArgs.globalShortcuts) {
    appArgs.globalShortcuts.forEach((shortcut) => {
      globalShortcut.register(shortcut.key, () => {
        shortcut.inputEvents.forEach((inputEvent) => {
          // @ts-expect-error without including electron in our models, these will never match
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
        const accessibilityPromptResult = dialog.showMessageBoxSync(
          mainWindow,
          {
            type: 'question',
            message: 'Accessibility Permissions Needed',
            buttons: ['Yes', 'No', 'No and never ask again'],
            defaultId: 0,
            detail:
              `${appArgs.name} would like to use one or more of your keyboard's media keys (start, stop, next track, or previous track) to control it.\n\n` +
              `Would you like Mac OS to ask for your permission to do so?\n\n` +
              `If so, you will need to restart ${appArgs.name} after granting permissions for these keyboard shortcuts to begin working.`,
          },
        );
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
    dialog
      .showMessageBox(mainWindow, {
        type: 'warning',
        message: 'Old build detected',
        detail: oldBuildWarningText,
      })
      .catch((err) => log.error('dialog.showMessageBox ERROR', err));
  }

  if (appArgs.targetUrl) {
    await mainWindow.loadURL(appArgs.targetUrl);
  }
}

app.on(
  'accessibility-support-changed',
  (event: Event, accessibilitySupportEnabled: boolean) => {
    log.debug('app.accessibility-support-changed', {
      event,
      accessibilitySupportEnabled,
    });
  },
);

app.on(
  'activity-was-continued',
  (event: Event, type: string, userInfo: unknown) => {
    log.debug('app.activity-was-continued', { event, type, userInfo });
  },
);

app.on('browser-window-blur', () => {
  log.debug('app.browser-window-blur');
});

app.on('browser-window-created', () => {
  log.debug('app.browser-window-created');
});

app.on('browser-window-focus', () => {
  log.debug('app.browser-window-focus');
});
