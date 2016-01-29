import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import packager from 'electron-packager';
import tmp from 'tmp';
import ncp from 'ncp';
import async from 'async';
import _ from 'lodash';
import hasBinary from 'hasbin';

import optionsFactory from './../options';
import iconBuild from './iconBuild';
import helpers from './../helpers/helpers';

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
function buildApp(options, callback) {
    // pre process app

    var tmpObj = tmp.dirSync({unsafeCleanup: true});
    const tmpPath = tmpObj.name;

    async.waterfall([
        callback => {
            optionsFactory(options, callback);
        },
        (options, callback) => {
            copyPlaceholderApp(options.dir, tmpPath, options, error => {
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
            if (appPathArray.length === 0) {
                // directory already exists, --overwrite is not set
                // exit here
                callback();
                return;
            }

            if (appPathArray.length > 1) {
                console.warn('Warning: Packaged app path contains more than one element:', appPathArray);
            }

            const appPath = appPathArray[0];
            maybeCopyIcons(options, appPath, error => {
                callback(error, appPath);
            });
        }
    ], callback);
}

/**
 * Creates a temporary directory and copies the './app folder' inside, and adds a text file with the configuration
 * for the single page app.
 *
 * @param {string} src
 * @param {string} dest
 * @param {{}} options
 * @param callback
 */
function copyPlaceholderApp(src, dest, options, callback) {
    const appArgs = selectAppArgs(options);
    copy(src, dest, error => {
        if (error) {
            callback(`Error Copying temporary directory: ${error}`);
            return;
        }

        fs.writeFileSync(path.join(dest, '/nativefier.json'), JSON.stringify(appArgs));
        changeAppPackageJsonName(dest, appArgs.name);
        callback();
    });
}

function changeAppPackageJsonName(appPath, name) {
    const packageJsonPath = path.join(appPath, '/package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
    packageJson.name = normalizeAppName(name);
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));
}

/**
 * Only picks certain app args to pass to nativefier.json
 * @param options
 * @returns {{name: (*|string), targetUrl: (string|*), counter: *, width: *, height: *, showMenuBar: *, userAgent: *, nativefierVersion: *, insecure: *}}
 */
function selectAppArgs(options) {
    return {
        name: options.name,
        targetUrl: options.targetUrl,
        counter: options.counter,
        width: options.width,
        height: options.height,
        showMenuBar: options.showMenuBar,
        userAgent: options.userAgent,
        nativefierVersion: options.nativefierVersion,
        insecure: options.insecure
    };
}

function normalizeAppName(appName) {
    // use a simple 3 byte random string to prevent collision
    const postFixHash = crypto.randomBytes(3).toString('hex');
    const normalized = _.kebabCase(appName.toLowerCase());
    return `${normalized}-nativefier-${postFixHash}`;
}

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

export default buildApp;
