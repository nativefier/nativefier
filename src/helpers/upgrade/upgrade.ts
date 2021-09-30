import * as fs from 'fs';
import * as path from 'path';

import * as log from 'loglevel';

import {
  NativefierOptions,
  RawOptions,
} from '../../../shared/src/options/model';
import { dirExists, fileExists } from '../fsHelpers';
import { extractBoolean, extractString } from './plistInfoXMLHelpers';
import { getOptionsFromExecutable } from './executableHelpers';
import { parseJson } from '../../utils/parseUtils';

export type UpgradeAppInfo = {
  appResourcesDir: string;
  appRoot: string;
  options: NativefierOptions;
};

function findUpgradeAppResourcesDir(searchDir: string): string | null {
  searchDir = dirExists(searchDir) ? searchDir : path.dirname(searchDir);
  log.debug(`Searching for nativfier.json in ${searchDir}`);
  const children = fs.readdirSync(searchDir, { withFileTypes: true });
  if (fileExists(path.join(searchDir, 'nativefier.json'))) {
    // Found 'nativefier.json', so this must be it!
    return path.resolve(searchDir);
  }
  const childDirectories = children.filter((c) => c.isDirectory());
  for (const childDir of childDirectories) {
    // We must go deeper!
    const result = findUpgradeAppResourcesDir(
      path.join(searchDir, childDir.name, 'nativefier.json'),
    );
    if (result !== null) {
      return path.resolve(result);
    }
  }

  // Didn't find it down here
  return null;
}

function getAppRoot(
  appResourcesDir: string,
  options: NativefierOptions,
): string {
  switch (options.platform) {
    case 'darwin':
      return path.resolve(path.join(appResourcesDir, '..', '..', '..', '..'));
    case 'linux':
    case 'win32':
      return path.resolve(path.join(appResourcesDir, '..', '..'));
    default:
      throw new Error(
        `Could not find the app root for platform: ${
          options.platform ?? 'undefined'
        }`,
      );
  }
}

function getIconPath(appResourcesDir: string): string | undefined {
  const icnsPath = path.join(appResourcesDir, '..', 'electron.icns');
  if (fileExists(icnsPath)) {
    log.debug(`Found icon at: ${icnsPath}`);
    return path.resolve(icnsPath);
  }
  const icoPath = path.join(appResourcesDir, 'icon.ico');
  if (fileExists(icoPath)) {
    log.debug(`Found icon at: ${icoPath}`);
    return path.resolve(icoPath);
  }
  const pngPath = path.join(appResourcesDir, 'icon.png');
  if (fileExists(pngPath)) {
    log.debug(`Found icon at: ${pngPath}`);
    return path.resolve(pngPath);
  }

  log.debug('Could not find icon file.');
  return undefined;
}

function getInfoPListOptions(
  appResourcesDir: string,
  priorOptions: NativefierOptions,
): NativefierOptions {
  if (!fileExists(path.join(appResourcesDir, '..', '..', 'Info.plist'))) {
    // Not a darwin/mas app, so this is irrelevant
    return priorOptions;
  }

  const newOptions = { ...priorOptions };

  const infoPlistXML: string = fs
    .readFileSync(path.join(appResourcesDir, '..', '..', 'Info.plist'))
    .toString();

  if (newOptions.appCopyright === undefined) {
    // https://github.com/electron/electron-packager/blob/0d3f84374e9ab3741b171610735ebc6be3e5e75f/src/mac.js#L230-L232
    newOptions.appCopyright = extractString(
      infoPlistXML,
      'NSHumanReadableCopyright',
    );
    log.debug(
      `Extracted app copyright from Info.plist: ${
        newOptions.appCopyright as string
      }`,
    );
  }

  if (newOptions.appVersion === undefined) {
    // https://github.com/electron/electron-packager/blob/0d3f84374e9ab3741b171610735ebc6be3e5e75f/src/mac.js#L214-L216
    // This could also be the buildVersion, but since they end up in the same place, that SHOULDN'T matter
    const bundleVersion = extractString(infoPlistXML, 'CFBundleVersion');
    newOptions.appVersion =
      bundleVersion === undefined || bundleVersion === '1.0.0' // If it's 1.0.0, that's just the default
        ? undefined
        : bundleVersion;
    (newOptions.darwinDarkModeSupport =
      newOptions.darwinDarkModeSupport === undefined
        ? undefined
        : newOptions.darwinDarkModeSupport === false),
      log.debug(
        `Extracted app version from Info.plist: ${
          newOptions.appVersion as string
        }`,
      );
  }

  if (newOptions.darwinDarkModeSupport === undefined) {
    // https://github.com/electron/electron-packager/blob/0d3f84374e9ab3741b171610735ebc6be3e5e75f/src/mac.js#L234-L236
    newOptions.darwinDarkModeSupport = extractBoolean(
      infoPlistXML,
      'NSRequiresAquaSystemAppearance',
    );
    log.debug(
      `Extracted Darwin dark mode support from Info.plist: ${
        newOptions.darwinDarkModeSupport ? 'Yes' : 'No'
      }`,
    );
  }

  return newOptions;
}

function getInjectPaths(appResourcesDir: string): string[] | undefined {
  const injectDir = path.join(appResourcesDir, 'inject');
  if (!dirExists(injectDir)) {
    return undefined;
  }

  const injectPaths = fs
    .readdirSync(injectDir, { withFileTypes: true })
    .filter(
      (fd) =>
        fd.isFile() &&
        (fd.name.toLowerCase().endsWith('.css') ||
          fd.name.toLowerCase().endsWith('.js')),
    )
    .map((fd) => path.resolve(path.join(injectDir, fd.name)));
  log.debug(`CSS/JS Inject paths: ${injectPaths.join(', ')}`);
  return injectPaths;
}

function isAsar(appResourcesDir: string): boolean {
  const asar = fileExists(path.join(appResourcesDir, '..', 'electron.asar'));
  log.debug(`Is this app an ASAR? ${asar ? 'Yes' : 'No'}`);
  return asar;
}

export function findUpgradeApp(upgradeFrom: string): UpgradeAppInfo | null {
  const searchDir = dirExists(upgradeFrom)
    ? upgradeFrom
    : path.dirname(upgradeFrom);
  log.debug(`Looking for old options file in ${searchDir}`);
  const appResourcesDir = findUpgradeAppResourcesDir(searchDir);
  if (appResourcesDir === null) {
    log.debug(`No nativefier.json file found in ${searchDir}`);
    return null;
  }

  const nativefierJSONPath = path.join(appResourcesDir, 'nativefier.json');

  log.debug(`Loading ${nativefierJSONPath}`);
  let options = parseJson<NativefierOptions>(
    fs.readFileSync(nativefierJSONPath, 'utf8'),
  );

  if (!options) {
    throw new Error(
      `Could not read Nativefier options from ${nativefierJSONPath}`,
    );
  }

  options.electronVersion = undefined;

  options = {
    ...options,
    ...getOptionsFromExecutable(appResourcesDir, options),
  };

  const appRoot = getAppRoot(appResourcesDir, options);

  return {
    appResourcesDir,
    appRoot,
    options: {
      ...options,
      ...getInfoPListOptions(appResourcesDir, options),
      asar: options.asar !== undefined ? options.asar : isAsar(appResourcesDir),
      icon: getIconPath(appResourcesDir),
      inject: getInjectPaths(appResourcesDir),
    },
  };
}

export function useOldAppOptions(
  rawOptions: RawOptions,
  oldApp: UpgradeAppInfo,
): RawOptions {
  if (rawOptions.targetUrl !== undefined && dirExists(rawOptions.targetUrl)) {
    // You got your ouput dir in my targetUrl!
    rawOptions.out = rawOptions.targetUrl;
  }

  log.debug('oldApp', oldApp);

  const combinedOptions = { ...rawOptions, ...oldApp.options };

  log.debug('Combined options', combinedOptions);

  return combinedOptions;
}
