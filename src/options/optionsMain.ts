import * as fs from 'fs';

import * as log from 'loglevel';

import * as packageJson from '../../package.json';
import { ELECTRON_VERSION, PLACEHOLDER_APP_DIR } from '../constants';
import { inferPlatform, inferArch } from '../infer/inferOs';
import { asyncConfig } from './asyncConfig';
import { normalizeUrl } from './normalizeUrl';

/**
 * Extracts only desired keys from input options and augments it with defaults
 */
export function getOptions(inputOptions: any): Promise<any> {
  // TODO type inputOptions and/or options as electronPackager.Options
  const options: any = {
    dir: PLACEHOLDER_APP_DIR,
    name: inputOptions.name,
    targetUrl: normalizeUrl(inputOptions.targetUrl),
    platform: inputOptions.platform || inferPlatform(),
    arch: inputOptions.arch || inferArch(),
    electronVersion: inputOptions.electronVersion || ELECTRON_VERSION,
    nativefierVersion: packageJson.version,
    out: inputOptions.out || process.cwd(),
    overwrite: inputOptions.overwrite,
    asar: inputOptions.conceal || false,
    icon: inputOptions.icon,
    counter: inputOptions.counter || false,
    bounce: inputOptions.bounce || false,
    width: inputOptions.width || 1280,
    height: inputOptions.height || 800,
    minWidth: inputOptions.minWidth,
    minHeight: inputOptions.minHeight,
    maxWidth: inputOptions.maxWidth,
    maxHeight: inputOptions.maxHeight,
    showMenuBar: inputOptions.showMenuBar || false,
    fastQuit: inputOptions.fastQuit || false,
    userAgent: inputOptions.userAgent,
    ignoreCertificate: inputOptions.ignoreCertificate || false,
    disableGpu: inputOptions.disableGpu || false,
    ignoreGpuBlacklist: inputOptions.ignoreGpuBlacklist || false,
    enableEs3Apis: inputOptions.enableEs3Apis || false,
    insecure: inputOptions.insecure || false,
    flashPluginDir: inputOptions.flashPath || inputOptions.flash || null,
    diskCacheSize: inputOptions.diskCacheSize || null,
    inject: inputOptions.inject || null,
    ignore: 'src',
    fullScreen: inputOptions.fullScreen || false,
    maximize: inputOptions.maximize || false,
    hideWindowFrame: inputOptions.hideWindowFrame,
    verbose: inputOptions.verbose,
    disableContextMenu: inputOptions.disableContextMenu,
    disableDevTools: inputOptions.disableDevTools,
    crashReporter: inputOptions.crashReporter,
    tmpdir: false, // workaround for electron-packager#375
    zoom: inputOptions.zoom || 1.0,
    internalUrls: inputOptions.internalUrls || null,
    proxyRules: inputOptions.proxyRules || null,
    singleInstance: inputOptions.singleInstance || false,
    clearCache: inputOptions.clearCache || false,
    appVersion: inputOptions.appVersion,
    buildVersion: inputOptions.buildVersion,
    appCopyright: inputOptions.appCopyright,
    versionString: inputOptions.versionString,
    win32metadata: inputOptions.win32metadata || {
      ProductName: inputOptions.name,
      InternalName: inputOptions.name,
      FileDescription: inputOptions.name,
    },
    processEnvs: inputOptions.processEnvs,
    fileDownloadOptions: inputOptions.fileDownloadOptions,
    tray: inputOptions.tray || false,
    basicAuthUsername: inputOptions.basicAuthUsername || null,
    basicAuthPassword: inputOptions.basicAuthPassword || null,
    alwaysOnTop: inputOptions.alwaysOnTop || false,
    titleBarStyle: inputOptions.titleBarStyle || null,
    globalShortcuts: inputOptions.globalShortcuts || null,
    browserwindowOptions: inputOptions.browserwindowOptions,
    backgroundColor: inputOptions.backgroundColor || null,
    darwinDarkModeSupport: inputOptions.darwinDarkModeSupport || false,
  };

  if (options.verbose) {
    log.setLevel('trace');
    try {
      require('debug').enable('electron-packager');
    } catch (err) {
      log.debug(
        'Failed to enable electron-packager debug output. This should not happen,',
        'and suggests their internals changed. Please report an issue.',
      );
    }

    log.debug(
      'Running in verbose mode! This will produce a mountain of logs and',
      'is recommended only for troubleshooting or if you like Shakespeare.',
    );
  } else {
    log.setLevel('info');
  }

  if (options.flashPluginDir) {
    options.insecure = true;
  }

  if (inputOptions.honest) {
    options.userAgent = null;
  }

  if (options.platform.toLowerCase() === 'windows') {
    options.platform = 'win32';
  }

  if (
    options.platform.toLowerCase() === 'osx' ||
    options.platform.toLowerCase() === 'mac' ||
    options.platform.toLowerCase() === 'macos'
  ) {
    options.platform = 'darwin';
  }

  if (options.width > options.maxWidth) {
    options.width = options.maxWidth;
  }

  if (options.height > options.maxHeight) {
    options.height = options.maxHeight;
  }

  if (typeof inputOptions.x !== 'undefined') {
    options.x = inputOptions.x;
  }

  if (typeof inputOptions.y !== 'undefined') {
    options.y = inputOptions.y;
  }

  if (options.globalShortcuts) {
    log.debug('Will use global shortcuts file at', options.globalShortcuts);
    const globalShortcutsFileContent = fs.readFileSync(options.globalShortcuts);
    options.globalShortcuts = JSON.parse(globalShortcutsFileContent.toString());
  }

  return asyncConfig(options);
}
