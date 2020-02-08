import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';
import { promisify } from 'util';

import { kebabCase } from 'lodash';
import * as log from 'loglevel';

import { copyFileOrDir } from '../helpers/helpers';

const writeFileAsync = promisify(fs.writeFile);

/**
 * Only picks certain app args to pass to nativefier.json
 */
function pickElectronAppArgs(options): any {
  return {
    name: options.name,
    targetUrl: options.targetUrl,
    counter: options.counter,
    bounce: options.bounce,
    width: options.width,
    height: options.height,
    minWidth: options.minWidth,
    minHeight: options.minHeight,
    maxWidth: options.maxWidth,
    maxHeight: options.maxHeight,
    x: options.x,
    y: options.y,
    showMenuBar: options.showMenuBar,
    fastQuit: options.fastQuit,
    userAgent: options.userAgent,
    nativefierVersion: options.nativefierVersion,
    ignoreCertificate: options.ignoreCertificate,
    disableGpu: options.disableGpu,
    ignoreGpuBlacklist: options.ignoreGpuBlacklist,
    enableEs3Apis: options.enableEs3Apis,
    insecure: options.insecure,
    flashPluginDir: options.flashPluginDir,
    diskCacheSize: options.diskCacheSize,
    fullScreen: options.fullScreen,
    hideWindowFrame: options.hideWindowFrame,
    maximize: options.maximize,
    disableContextMenu: options.disableContextMenu,
    disableDevTools: options.disableDevTools,
    zoom: options.zoom,
    internalUrls: options.internalUrls,
    proxyRules: options.proxyRules,
    crashReporter: options.crashReporter,
    singleInstance: options.singleInstance,
    clearCache: options.clearCache,
    appCopyright: options.appCopyright,
    appVersion: options.appVersion,
    buildVersion: options.buildVersion,
    win32metadata: options.win32metadata,
    versionString: options.versionString,
    processEnvs: options.processEnvs,
    fileDownloadOptions: options.fileDownloadOptions,
    tray: options.tray,
    basicAuthUsername: options.basicAuthUsername,
    basicAuthPassword: options.basicAuthPassword,
    alwaysOnTop: options.alwaysOnTop,
    titleBarStyle: options.titleBarStyle,
    globalShortcuts: options.globalShortcuts,
    browserwindowOptions: options.browserwindowOptions,
    backgroundColor: options.backgroundColor,
    darwinDarkModeSupport: options.darwinDarkModeSupport,
  };
}

async function maybeCopyScripts(srcs: string[], dest: string): Promise<void> {
  if (!srcs || srcs.length === 0) {
    log.debug('No files to inject, skipping copy.');
    return;
  }

  log.debug(`Copying ${srcs.length} files to inject in app.`);
  for (const src of srcs) {
    if (!fs.existsSync(src)) {
      throw new Error('Error copying injection files: file not found');
    }

    let destFileName: string;
    if (path.extname(src) === '.js') {
      destFileName = 'inject.js';
    } else if (path.extname(src) === '.css') {
      destFileName = 'inject.css';
    } else {
      return;
    }

    const destPath = path.join(dest, 'inject', destFileName);
    log.debug(`Copying injection file "${src}" to "${destPath}"`);
    await copyFileOrDir(src, destPath);
  }
}

function normalizeAppName(appName: string, url: string): string {
  // use a simple 3 byte random string to prevent collision
  const hash = crypto.createHash('md5');
  hash.update(url);
  const postFixHash = hash.digest('hex').substring(0, 6);
  const normalized = kebabCase(appName.toLowerCase());
  return `${normalized}-nativefier-${postFixHash}`;
}

function changeAppPackageJsonName(
  appPath: string,
  name: string,
  url: string,
): void {
  const packageJsonPath = path.join(appPath, '/package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath).toString());
  const normalizedAppName = normalizeAppName(name, url);
  packageJson.name = normalizedAppName;
  log.debug(`Updating ${packageJsonPath} 'name' field to ${normalizedAppName}`);

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));
}

/**
 * Creates a temporary directory, copies the './app folder' inside,
 * and adds a text file with the app configuration.
 */
export async function buildApp(
  src: string,
  dest: string,
  options: any,
): Promise<void> {
  const appArgs = pickElectronAppArgs(options);

  log.debug(`Copying electron app from ${src} to ${dest}`);
  try {
    await copyFileOrDir(src, dest);
  } catch (err) {
    throw `Error copying electron app from ${src} to temp dir ${dest}. Error: ${err}`;
  }

  const appJsonPath = path.join(dest, '/nativefier.json');
  log.debug(`Writing app config to ${appJsonPath}`);
  await writeFileAsync(appJsonPath, JSON.stringify(appArgs));

  try {
    await maybeCopyScripts(options.inject, dest);
  } catch (err) {
    log.error('Error copying injection files', err);
  }
  changeAppPackageJsonName(dest, appArgs.name, appArgs.targetUrl);
}
