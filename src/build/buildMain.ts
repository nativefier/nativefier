import * as path from 'path';

import * as electronPackager from 'electron-packager';
import * as hasbin from 'hasbin';
import * as log from 'loglevel';
import { ncp } from 'ncp';

import { isWindows, getTempDir } from '../helpers/helpers';
import { getOptions } from '../options/optionsMain';
import { buildApp } from './buildApp';
import { convertIconIfNecessary } from './buildIcon';

const OPTIONS_REQUIRING_WINDOWS_FOR_WINDOWS_BUILD = [
  'icon',
  'appCopyright',
  'appVersion',
  'buildVersion',
  'versionString',
  'win32metadata',
];

// electron-packager's default ignore list is too aggressive, pruning e.g.
// `node_modules/debug/src/*`. Not sure why, it's not what the doc says.
// Overriding with a hand-tweaked set of reasonable exclusions.
// https://github.com/electron/electron-packager/blob/master/docs/api.md#ignore
const ELECTRON_PACKAGER_IGNORES = [
  /\.md$/,
  /\.markdown$/,
  /\.d\.ts$/,
  /Makefile$/,
  /\.yml$/,
  /\.test\.js$/,
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
  options: electronPackager.Options,
  appPath: string,
): Promise<void> {
  log.debug('Copying icons if necessary');
  if (!options.icon) {
    log.debug('No icon specified in options; aborting');
    return;
  }

  if (options.platform === 'darwin' || options.platform === 'mas') {
    log.debug('No copying necessary on macOS; aborting');
    return;
  }

  // windows & linux: put the icon file into the app
  const destAppPath = path.join(appPath, 'resources/app');
  const destFileName = `icon${path.extname(options.icon)}`;
  const destIconPath = path.join(destAppPath, destFileName);

  log.debug(`Copying icon ${options.icon} to`, destIconPath);
  return new Promise((resolve, reject) => {
    ncp(options.icon, destIconPath, (error) => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}

function trimUnprocessableOptions(
  options: electronPackager.Options,
): electronPackager.Options {
  if (options.platform === 'win32' && !isWindows() && !hasbin.sync('wine')) {
    const optionsPresent = Object.entries(options)
      .filter(
        ([key, value]) =>
          OPTIONS_REQUIRING_WINDOWS_FOR_WINDOWS_BUILD.includes(key) && !!value,
      )
      .map(([key]) => key);
    if (optionsPresent.length === 0) {
      return options;
    }
    log.warn(
      `*Not* setting [${optionsPresent.join(', ')}], as couldn't find Wine.`,
      'Wine is required when packaging a Windows app under on non-Windows platforms.',
    );
    for (const keyToUnset in optionsPresent) {
      options[keyToUnset] = null;
    }
  }
  return options;
}

export async function buildMain(inputOptions: any): Promise<string> {
  log.info('Getting options...');
  const options = await getOptions(inputOptions);

  log.info('\nPreparing Electron app...');
  const tmpPath = getTempDir('app', 0o755);
  await buildApp(options.dir, tmpPath, options);

  log.info('\nConverting icons...');
  const optionsWithTmpPath = { ...options, dir: tmpPath };
  const optionsWithIcon = await convertIconIfNecessary(optionsWithTmpPath);

  log.info(
    "\nPackaging; this might take a while, especially if the requested Electron isn't cached yet...",
  );
  const packageOptions = trimUnprocessableOptions(optionsWithIcon);
  const appPathArray = await electronPackager({
    ...packageOptions,
    quiet: false,
    ignore: ELECTRON_PACKAGER_IGNORES,
  });

  log.info('\nFinalizing build...');
  const appPath = getAppPath(appPathArray);
  await copyIconsIfNecessary(packageOptions, appPath);

  return appPath;
}
