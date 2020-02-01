import * as fs from 'fs';
import * as crypto from 'crypto';
import * as path from 'path';
import { promisify } from 'util';

import { kebabCase } from 'lodash';
import * as log from 'loglevel';
import { ncp } from 'ncp';

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
  if (!srcs) {
    log.debug('No scripts to inject, skipping copy.');
    return new Promise((resolve) => {
      resolve();
    });
  }

  log.debug(`Copying ${srcs.length} resources to inject in app.`);
  const promises = srcs.map(
    (src) =>
      new Promise((resolve, reject) => {
        if (!fs.existsSync(src)) {
          reject(new Error('Error copying injection files: file not found'));
          return;
        }

        let destFileName: string;
        if (path.extname(src) === '.js') {
          destFileName = 'inject.js';
        } else if (path.extname(src) === '.css') {
          destFileName = 'inject.css';
        } else {
          resolve();
          return;
        }

        const destPath = path.join(dest, 'inject', destFileName);
        log.debug(`Copying ${destPath}`);
        ncp(src, destPath, (error) => {
          if (error) {
            reject(new Error(`Error copying injection files: ${error}`));
            return;
          }
          resolve();
        });
      }),
  );

  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
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

  return new Promise((resolve, reject) => {
    ncp(src, dest, async (error) => {
      if (error) {
        reject(`Error copying electron app to temporary directory: ${error}`);
      }

      const appJsonPath = path.join(dest, '/nativefier.json');
      log.debug(`Writing app config to ${appJsonPath}`);
      await writeFileAsync(appJsonPath, JSON.stringify(appArgs));

      try {
        await maybeCopyScripts(options.inject, dest);
      } catch (err) {
        log.error('Error while copying scripts', err);
      }
      changeAppPackageJsonName(dest, appArgs.name, appArgs.targetUrl);
      resolve();
    });
  });
}
