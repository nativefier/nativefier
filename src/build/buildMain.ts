import * as path from 'path';

import * as electronPackager from 'electron-packager';
import * as hasbin from 'hasbin';
import * as log from 'loglevel';
import { ncp } from 'ncp';
import * as tmp from 'tmp';

import { isWindows } from '../helpers/helpers';
import { getOptions } from '../options/optionsMain';
import { buildApp } from './buildApp';
import { convertIconIfNecessary } from './buildIcon';

/**
 * Checks the app path array to determine if packaging completed successfully
 */
function getAppPath(appPath: string | string[]): string {
  if (!Array.isArray(appPath)) {
    return appPath;
  }

  if (appPath.length === 0) {
    return null; // directory already exists and `--overwrite` not set
  }

  if (appPath.length > 1) {
    log.warn(
      'Warning: This should not be happening, packaged app path contains more than one element:',
      appPath,
    );
  }

  return appPath[0];
}

/**
 * For Windows & Linux, we have to copy over the icon to the resources/app
 * folder, which the BrowserWindow is hard-coded to read the icon from
 */
function copyIconsIfNecessary(
  options: electronPackager.Options,
  appPath: string,
): void {
  if (!options.icon) {
    return;
  }

  if (options.platform === 'darwin' || options.platform === 'mas') {
    return;
  }

  // windows & linux: put the icon file into the app
  const destIconPath = path.join(appPath, 'resources/app');
  const destFileName = `icon${path.extname(options.icon)}`;
  ncp(options.icon, path.join(destIconPath, destFileName), (error) => {
    throw error;
  });
}

/**
 * Removes a specific option from an options object if building for Windows
 * while not on Windows and Wine is not installed
 */
function trimOptionRequiringWine(
  options: electronPackager.Options,
  optionToRemove: string,
): electronPackager.Options {
  const packageOptions = JSON.parse(JSON.stringify(options));
  if (options.platform === 'win32' && !isWindows()) {
    if (!hasbin.sync('wine')) {
      log.warn(
        `*NOT* packaging option "${optionToRemove}", as couldn't find Wine. Wine is required when packaging a Windows app under on non-Windows platforms`,
      );
      packageOptions[optionToRemove] = null;
    }
  }
  return packageOptions;
}

export async function buildMain(inpOptions: any): Promise<string> {
  const options = await getOptions(inpOptions);

  log.info('copying');
  const tmpDir = tmp.dirSync({ mode: 0o755, unsafeCleanup: true });
  const tmpPath = tmpDir.name;
  await buildApp(options.dir, tmpPath, options);

  log.info('icons');
  const optionsWithTmpPath = { ...options, dir: tmpPath };
  const optionsWithIcon = await convertIconIfNecessary(optionsWithTmpPath);

  log.info('packaging');
  let packageOptions = trimOptionRequiringWine(optionsWithIcon, 'icon');
  packageOptions = trimOptionRequiringWine(optionsWithIcon, 'appCopyright');
  packageOptions = trimOptionRequiringWine(optionsWithIcon, 'appVersion');
  packageOptions = trimOptionRequiringWine(optionsWithIcon, 'buildVersion');
  packageOptions = trimOptionRequiringWine(optionsWithIcon, 'versionString');
  packageOptions = trimOptionRequiringWine(optionsWithIcon, 'win32metadata');
  const appPathArray = await electronPackager(packageOptions);

  log.info('finalizing');
  const appPath = getAppPath(appPathArray);

  await copyIconsIfNecessary(packageOptions, appPath);
  return appPath;
}
