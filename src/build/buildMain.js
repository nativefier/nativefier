import path from 'path';
import packager from 'electron-packager';
import tmp from 'tmp';
import ncp from 'ncp';
import async from 'async';
import hasBinary from 'hasbin';
import log from 'loglevel';
import DishonestProgress from './../helpers/dishonestProgress';
import optionsFactory from './../options/optionsMain';
import iconBuild from './iconBuild';
import helpers from './../helpers/helpers';
import PackagerConsole from './../helpers/packagerConsole';
import buildApp from './buildApp';

const copy = ncp.ncp;
const isWindows = helpers.isWindows;

/**
 * Checks the app path array to determine if the packaging was completed successfully
 * @param appPathArray Result from electron-packager
 * @returns {*}
 */
function getAppPath(appPathArray) {
  if (appPathArray.length === 0) {
    // directory already exists, --overwrite is not set
    // exit here
    return null;
  }

  if (appPathArray.length > 1) {
    log.warn('Warning: This should not be happening, packaged app path contains more than one element:', appPathArray);
  }

  return appPathArray[0];
}

/**
 * Removes the `icon` parameter from options if building for Windows while not on Windows
 * and Wine is not installed
 * @param options
 */
function maybeNoIconOption(options) {
  const packageOptions = JSON.parse(JSON.stringify(options));
  if (options.platform === 'win32' && !isWindows()) {
    if (!hasBinary.sync('wine')) {
      log.warn('Wine is required to set the icon for a Windows app when packaging on non-windows platforms');
      packageOptions.icon = null;
    }
  }
  return packageOptions;
}

/**
 * For windows and linux, we have to copy over the icon to the resources/app folder, which the
 * BrowserWindow is hard coded to read the icon from
 * @param {{}} options
 * @param {string} appPath
 * @param callback
 */
function maybeCopyIcons(options, appPath, callback) {
  if (!options.icon) {
    callback();
    return;
  }

  if (options.platform === 'darwin') {
    callback();
    return;
  }

  // windows & linux
  // put the icon file into the app
  const destIconPath = path.join(appPath, 'resources/app');
  const destFileName = `icon${path.extname(options.icon)}`;
  copy(options.icon, path.join(destIconPath, destFileName), (error) => {
    callback(error);
  });
}

/**
 * Removes invalid parameters from options if building for Windows while not on Windows
 * and Wine is not installed
 * @param options
 */
function removeInvalidOptions(options, param) {
  const packageOptions = JSON.parse(JSON.stringify(options));
  if (options.platform === 'win32' && !isWindows()) {
    if (!hasBinary.sync('wine')) {
      log.warn(`Wine is required to use "${param}" option for a Windows app when packaging on non-windows platforms`);
      packageOptions[param] = null;
    }
  }
  return packageOptions;
}

/**
 * Removes the `appCopyright` parameter from options if building for Windows while not on Windows
 * and Wine is not installed
 * @param options
 */
function maybeNoAppCopyrightOption(options) {
  return removeInvalidOptions(options, 'appCopyright');
}

/**
 * Removes the `buildVersion` parameter from options if building for Windows while not on Windows
 * and Wine is not installed
 * @param options
 */
function maybeNoBuildVersionOption(options) {
  return removeInvalidOptions(options, 'buildVersion');
}

/**
 * Removes the `appVersion` parameter from options if building for Windows while not on Windows
 * and Wine is not installed
 * @param options
 */
function maybeNoAppVersionOption(options) {
  return removeInvalidOptions(options, 'appVersion');
}

/**
 * Removes the `versionString` parameter from options if building for Windows while not on Windows
 * and Wine is not installed
 * @param options
 */
function maybeNoVersionStringOption(options) {
  return removeInvalidOptions(options, 'versionString');
}

/**
 * Removes the `win32metadata` parameter from options if building for Windows while not on Windows
 * and Wine is not installed
 * @param options
 */
function maybeNoWin32metadataOption(options) {
  return removeInvalidOptions(options, 'win32metadata');
}

/**
 * @callback buildAppCallback
 * @param error
 * @param {string} appPath
 */

/**
 *
 * @param {{}} inpOptions
 * @param {buildAppCallback} callback
 */
function buildMain(inpOptions, callback) {
  const options = Object.assign({}, inpOptions);

  // pre process app

  const tmpObj = tmp.dirSync({ unsafeCleanup: true });
  const tmpPath = tmpObj.name;

  // todo check if this is still needed on later version of packager
  const packagerConsole = new PackagerConsole();

  const progress = new DishonestProgress(5);

  async.waterfall([
    (callback) => {
      progress.tick('inferring');
      optionsFactory(options)
        .then((result) => {
          callback(null, result);
        }).catch((error) => {
          callback(error);
        });
    },
    (options, callback) => {
      progress.tick('copying');
      buildApp(options.dir, tmpPath, options, (error) => {
        if (error) {
          callback(error);
          return;
        }
        // Change the reference file for the Electron app to be the temporary path
        const newOptions = Object.assign({}, options, { dir: tmpPath });
        callback(null, newOptions);
      });
    },
    (options, callback) => {
      progress.tick('icons');
      iconBuild(options, (error, optionsWithIcon) => {
        callback(null, optionsWithIcon);
      });
    },
    (options, callback) => {
      progress.tick('packaging');
      // maybe skip passing icon parameter to electron packager
      let packageOptions = maybeNoIconOption(options);
      // maybe skip passing other parameters to electron packager
      packageOptions = maybeNoAppCopyrightOption(packageOptions);
      packageOptions = maybeNoAppVersionOption(packageOptions);
      packageOptions = maybeNoBuildVersionOption(packageOptions);
      packageOptions = maybeNoVersionStringOption(packageOptions);
      packageOptions = maybeNoWin32metadataOption(packageOptions);

      packagerConsole.override();

      packager(packageOptions, (error, appPathArray) => {
        // restore console.error
        packagerConsole.restore();

        // pass options which still contains the icon to waterfall
        callback(error, options, appPathArray);
      });
    },
    (options, appPathArray, callback) => {
      progress.tick('finalizing');
      // somehow appPathArray is a 1 element array
      const appPath = getAppPath(appPathArray);
      if (!appPath) {
        callback();
        return;
      }

      maybeCopyIcons(options, appPath, (error) => {
        callback(error, appPath);
      });
    },
  ], (error, appPath) => {
    packagerConsole.playback();
    callback(error, appPath);
  });
}

export default buildMain;
