import * as path from 'path';

import * as async from 'async';
import * as ncp from 'ncp';
import * as electronPackager from 'electron-packager';
import * as tmp from 'tmp';
import * as hasbin from 'hasbin';

import { DishonestProgress } from '../helpers/dishonestProgress';
import { getOptions } from '../options/optionsMain';
import { iconBuild } from './iconBuild';
import { isWindows } from '../helpers/helpers';
import { PackagerConsole } from '../helpers/packagerConsole';
import { buildApp } from './buildApp';

import log = require('loglevel');

/**
 * Checks the app path array to determine if packaging completed successfully
 * @param appPathArray Result from electron-packager
 */
function getAppPath(appPathArray: any[]): any {
  if (appPathArray.length === 0) {
    // directory already exists, --overwrite is not set
    return null;
  }

  if (appPathArray.length > 1) {
    log.warn(
      'Warning: This should not be happening, packaged app path contains more than one element:',
      appPathArray,
    );
  }

  return appPathArray[0];
}

/**
 * For Windows & Linux, we have to copy over the icon to the resources/app
 * folder, which the BrowserWindow is hard-coded to read the icon from
 */
function maybeCopyIcons(
  options: any,
  appPath: string,
  callback: (error?: any) => void,
): void {
  if (!options.icon) {
    callback();
    return;
  }

  if (options.platform === 'darwin' || options.platform === 'mas') {
    callback();
    return;
  }

  // windows & linux: put the icon file into the app
  const destIconPath = path.join(appPath, 'resources/app');
  const destFileName = `icon${path.extname(options.icon)}`;
  ncp.ncp(options.icon, path.join(destIconPath, destFileName), (error) => {
    callback(error);
  });
}

/**
 * Removes a specific option from an options object if building for Windows
 * while not on Windows and Wine is not installed
 */
function trimWineRequiringOption(options: any, optionToRemove: string): any {
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

export function buildMain(
  inpOptions: any,
  callback: (error: any, appPath?: any) => void,
) {
  const options = { ...inpOptions };

  // pre process app
  const tmpObj = tmp.dirSync({ mode: 0o755, unsafeCleanup: true });
  const tmpPath = tmpObj.name;

  // todo check if this is still needed on later version of packager
  const packagerConsole = new PackagerConsole();

  const progress = new DishonestProgress(5);

  async.waterfall(
    [
      (cb) => {
        progress.tick('inferring');
        getOptions(options)
          .then((result) => {
            cb(null, result);
          })
          .catch((error) => {
            cb(error);
          });
      },
      (opts, cb) => {
        progress.tick('copying');
        buildApp(opts.dir, tmpPath, opts, (error) => {
          if (error) {
            cb(error);
            return;
          }
          // Change the reference file for the Electron app to be the temporary path
          const newOptions = { ...opts, dir: tmpPath };
          cb(null, newOptions);
        });
      },
      (opts, cb) => {
        progress.tick('icons');
        iconBuild(opts, (error, optionsWithIcon) => {
          cb(null, optionsWithIcon);
        });
      },
      (opts, cb) => {
        progress.tick('packaging');
        // maybe skip passing icon parameter to electron packager
        let packageOptions = trimWineRequiringOption(opts, 'icon');
        // maybe skip passing other parameters to electron packager
        packageOptions = trimWineRequiringOption(opts, 'appCopyright');
        packageOptions = trimWineRequiringOption(opts, 'appVersion');
        packageOptions = trimWineRequiringOption(opts, 'buildVersion');
        packageOptions = trimWineRequiringOption(opts, 'versionString');
        packageOptions = trimWineRequiringOption(opts, 'win32metadata');

        packagerConsole.override();

        electronPackager(packageOptions)
          .then((appPathArray) => {
            packagerConsole.restore(); // restore console.error
            cb(null, opts, appPathArray); // options still contain the icon to waterfall
          })
          .catch((error) => {
            packagerConsole.restore(); // restore console.error
            cb(error, opts); // options still contain the icon to waterfall
          });
      },
      (opts, appPathArray, cb) => {
        progress.tick('finalizing');
        // somehow appPathArray is a 1 element array
        const appPath = getAppPath(appPathArray);
        if (!appPath) {
          cb();
          return;
        }

        maybeCopyIcons(opts, appPath, (error) => {
          cb(error, appPath);
        });
      },
    ],
    (error, appPath) => {
      packagerConsole.playback();
      callback(error, appPath);
    },
  );
}
