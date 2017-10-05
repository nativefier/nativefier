import log from 'loglevel';

import inferOs from './../infer/inferOs';
import normalizeUrl from './normalizeUrl';
import packageJson from './../../package.json';
import { ELECTRON_VERSION, PLACEHOLDER_APP_DIR } from './../constants';
import asyncConfig from './asyncConfig';

const { inferPlatform, inferArch } = inferOs;

/**
 * Extracts only desired keys from inpOptions and augments it with defaults
 * @param {Object} inpOptions
 * @returns {Promise}
 */
export default function (inpOptions) {
  const options = {
    dir: PLACEHOLDER_APP_DIR,
    name: inpOptions.name,
    targetUrl: normalizeUrl(inpOptions.targetUrl),
    platform: inpOptions.platform || inferPlatform(),
    arch: inpOptions.arch || inferArch(),
    electronVersion: inpOptions.electronVersion || ELECTRON_VERSION,
    nativefierVersion: packageJson.version,
    out: inpOptions.out || process.cwd(),
    overwrite: inpOptions.overwrite,
    asar: inpOptions.conceal || false,
    icon: inpOptions.icon,
    counter: inpOptions.counter || false,
    width: inpOptions.width || 1280,
    height: inpOptions.height || 800,
    minWidth: inpOptions.minWidth,
    minHeight: inpOptions.minHeight,
    maxWidth: inpOptions.maxWidth,
    maxHeight: inpOptions.maxHeight,
    showMenuBar: inpOptions.showMenuBar || false,
    fastQuit: inpOptions.fastQuit || false,
    userAgent: inpOptions.userAgent,
    ignoreCertificate: inpOptions.ignoreCertificate || false,
    ignoreGpuBlacklist: inpOptions.ignoreGpuBlacklist || false,
    enableEs3Apis: inpOptions.enableEs3Apis || false,
    insecure: inpOptions.insecure || false,
    flashPluginDir: inpOptions.flashPath || inpOptions.flash || null,
    diskCacheSize: inpOptions.diskCacheSize || null,
    inject: inpOptions.inject || null,
    ignore: 'src',
    fullScreen: inpOptions.fullScreen || false,
    maximize: inpOptions.maximize || false,
    hideWindowFrame: inpOptions.hideWindowFrame,
    verbose: inpOptions.verbose,
    disableContextMenu: inpOptions.disableContextMenu,
    disableDevTools: inpOptions.disableDevTools,
    crashReporter: inpOptions.crashReporter,
    // workaround for electron-packager#375
    tmpdir: false,
    zoom: inpOptions.zoom || 1.0,
    internalUrls: inpOptions.internalUrls || null,
    singleInstance: inpOptions.singleInstance || false,
    appVersion: inpOptions.appVersion,
    buildVersion: inpOptions.buildVersion,
    appCopyright: inpOptions.appCopyright,
    versionString: inpOptions.versionString,
    win32metadata: inpOptions.win32metadata || {
      ProductName: inpOptions.name,
      InternalName: inpOptions.name,
      FileDescription: inpOptions.name,
    },
    processEnvs: inpOptions.processEnvs,
    tray: inpOptions.tray || false,
    basicAuthUsername: inpOptions.basicAuthUsername || null,
    basicAuthPassword: inpOptions.basicAuthPassword || null,
  };

  if (options.verbose) {
    log.setLevel('trace');
  } else {
    log.setLevel('error');
  }

  if (options.flashPluginDir) {
    options.insecure = true;
  }

  if (inpOptions.honest) {
    options.userAgent = null;
  }

  if (options.platform.toLowerCase() === 'windows') {
    options.platform = 'win32';
  }

  if (options.platform.toLowerCase() === 'osx' || options.platform.toLowerCase() === 'mac') {
    options.platform = 'darwin';
  }

  if (options.width > options.maxWidth) {
    options.width = options.maxWidth;
  }

  if (options.height > options.maxHeight) {
    options.height = options.maxHeight;
  }

  return asyncConfig(options);
}
