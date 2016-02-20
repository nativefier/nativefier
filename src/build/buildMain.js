import path from 'path';
import packager from 'electron-packager';
import tmp from 'tmp';
import ncp from 'ncp';
import async from 'async';
import hasBinary from 'hasbin';

import optionsFactory from './../options/optionsMain';
import iconBuild from './iconBuild';
import helpers from './../helpers/helpers';
import buildApp from './buildApp';

const copy = ncp.ncp;
const isWindows = helpers.isWindows;

/**
 * @callback buildAppCallback
 * @param error
 * @param {string} appPath
 */

/**
 *
 * @param {{}} options
 * @param {buildAppCallback} callback
 */
function buildMain(options, callback) {
    // pre process app

    var tmpObj = tmp.dirSync({unsafeCleanup: true});
    const tmpPath = tmpObj.name;

    async.waterfall([
        callback => {
            optionsFactory(options, callback);
        },
        (options, callback) => {
            buildApp(options.dir, tmpPath, options, error => {
                if (error) {
                    callback(error);
                    return;
                }
                // dir now correctly references the app folder to package
                options.dir = tmpPath;
                callback(null, options);
            });
        },
        (options, callback) => {
            iconBuild(options, (error, optionsWithIcon) => {
                callback(null, optionsWithIcon);
            });
        },
        (options, callback) => {
            // maybe skip passing icon parameter to electron packager
            const packageOptions = maybeNoIconOption(options);
            packager(packageOptions, (error, appPathArray) => {
                // pass options which still contains the icon to waterfall
                callback(error, options, appPathArray);
            });
        },
        (options, appPathArray, callback) => {
            // somehow appPathArray is a 1 element array
            const appPath = getAppPath(appPathArray);
            if (!appPath) {
                callback();
                return;
            }

            maybeCopyIcons(options, appPath, error => {
                callback(error, appPath);
            });
        }
    ], callback);
}

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
        console.warn('Warning: This should not be happening, packaged app path contains more than one element:', appPathArray);
    }

    return appPathArray[0];
}

/**
 * Removes the `icon` parameter from options if building for Windows while not on Windows and Wine is not installed
 * @param options
 */
function maybeNoIconOption(options) {
    const packageOptions = JSON.parse(JSON.stringify(options));
    if (options.platform === 'win32' && !isWindows()) {
        if (!hasBinary.sync('wine')) {
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
    const destIconPath = path.join(appPath, 'resources/app');
    copy(options.icon, path.join(destIconPath, 'icon.png'), error => {
        callback(error);
    });
}

export default buildMain;
