import * as path from 'path';

import * as electronPackager from 'electron-packager';
import * as hasbin from 'hasbin';
import * as log from 'loglevel';

import { isWindows, getTempDir, copyFileOrDir } from '../helpers/helpers';
import { getOptions } from '../options/optionsMain';
import { prepareElectronApp } from './prepareElectronApp';
import { convertIconIfNecessary } from './buildIcon';
import { AppOptions } from '../options/model';

const OPTIONS_REQUIRING_WINDOWS_FOR_WINDOWS_BUILD = [
  'icon',
  'appCopyright',
  'appVersion',
  'buildVersion',
  'versionString',
  'win32metadata',
];

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
async function copyIconsIfNecessary(
  options: AppOptions,
  appPath: string,
): Promise<void> {
  log.debug('Copying icons if necessary');
  if (!options.packager.icon) {
    log.debug('No icon specified in options; aborting');
    return;
  }

  if (
    options.packager.platform === 'darwin' ||
    options.packager.platform === 'mas'
  ) {
    log.debug('No copying necessary on macOS; aborting');
    return;
  }

  // windows & linux: put the icon file into the app
  const destAppPath = path.join(appPath, 'resources/app');
  const destFileName = `icon${path.extname(options.packager.icon)}`;
  const destIconPath = path.join(destAppPath, destFileName);

  log.debug(`Copying icon ${options.packager.icon} to`, destIconPath);
  await copyFileOrDir(options.packager.icon, destIconPath);
}

function trimUnprocessableOptions(options: AppOptions): void {
  if (
    options.packager.platform === 'win32' &&
    !isWindows() &&
    !hasbin.sync('wine')
  ) {
    const optionsPresent = Object.entries(options)
      .filter(
        ([key, value]) =>
          OPTIONS_REQUIRING_WINDOWS_FOR_WINDOWS_BUILD.includes(key) && !!value,
      )
      .map(([key]) => key);
    if (optionsPresent.length === 0) {
      return;
    }
    log.warn(
      `*Not* setting [${optionsPresent.join(', ')}], as couldn't find Wine.`,
      'Wine is required when packaging a Windows app under on non-Windows platforms.',
    );
    for (const keyToUnset of optionsPresent) {
      options[keyToUnset] = null;
    }
  }
}

export async function buildNativefierApp(rawOptions: any): Promise<string> {
  log.info('Processing options...');
  const options = await getOptions(rawOptions);

  log.info('\nPreparing Electron app...');
  const tmpPath = getTempDir('app', 0o755);
  await prepareElectronApp(options.packager.dir, tmpPath, options);

  log.info('\nConverting icons...');
  options.packager.dir = tmpPath; // const optionsWithTmpPath = { ...options, dir: tmpPath };
  await convertIconIfNecessary(options);

  log.info(
    "\nPackaging... This will take a few seconds, maybe minutes if the requested Electron isn't cached yet...",
  );
  trimUnprocessableOptions(options);
  const appPathArray = await electronPackager(options.packager);

  log.info('\nFinalizing build...');
  const appPath = getAppPath(appPathArray);
  await copyIconsIfNecessary(options, appPath);

  return appPath;
}
