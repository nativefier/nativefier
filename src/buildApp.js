import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

import optionsFactory from './options';
import packager from 'electron-packager';
import tmp from 'tmp';
import ncp from 'ncp';
import async from 'async';
import _ from 'lodash';

import packageJson from './../package.json';

const copy = ncp.ncp;

/**
 * @callback buildAppCallback
 * @param error
 * @param appPath
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
            optionsFactory(
                options.appName,
                options.targetUrl,
                options.platform,
                options.arch,
                options.electronVersion,
                options.outDir,
                options.overwrite,
                options.conceal,
                options.icon,
                options.counter,
                options.width,
                options.height,
                options.showMenuBar,
                options.userAgent,
                options.honest,
                callback);
        },
        (options, callback) => {
            copyPlaceholderApp(options.dir, tmpPath, options.name, options.targetUrl, options.counter, options.width, options.height, options.showMenuBar, options.userAgent, (error, tempDirPath) => {
                callback(error, tempDirPath, options);
            });
        },
        (tempDir, options, callback) => {
            options.dir = tempDir;
            packager(options, callback);
        },

        (appPathArray, callback) => {
            // somehow appPathArray is a 1 element array
            if (appPathArray.length !== 1) {
                console.warn('Warning: Packaged app path contains more than one element', appPathArray);
            }
            const appPath = appPathArray[0];
            callback(null, appPath);
        }
    ], callback);
}

/**
 * @callback tempDirCallback
 * @param error
 * @param {string} [tempDirPath]
 */

/**
 * Creates a temporary directory and copies the './app folder' inside, and adds a text file with the configuration
 * for the single page app.
 *
 * @param {string} srcAppDir
 * @param {string} tempDir
 * @param {string} name
 * @param {string} targetURL
 * @param {boolean} counter
 * @param {number} width
 * @param {number} height
 * @param {boolean} showMenuBar
 * @param {string} userAgent
 * @param {tempDirCallback} callback
 */
function copyPlaceholderApp(srcAppDir, tempDir, name, targetURL, counter, width, height, showMenuBar, userAgent, callback) {
    const loadedPackageJson = packageJson;
    copy(srcAppDir, tempDir, function(error) {
        if (error) {
            console.error(error);
            callback(`Error Copying temporary directory: ${error}`);
            return;
        }

        const appArgs = {
            name: name,
            targetUrl: targetURL,
            counter: counter,
            width: width,
            height: height,
            showMenuBar: showMenuBar,
            userAgent: userAgent,
            nativefierVersion: loadedPackageJson.version
        };

        fs.writeFileSync(path.join(tempDir, '/nativefier.json'), JSON.stringify(appArgs));

        // change name of packageJson so that temporary files will not be shared across different app instances
        const packageJsonPath = path.join(tempDir, '/package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
        packageJson.name = normalizeAppName(appArgs.name);
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));

        callback(null, tempDir);
    });
}

function normalizeAppName(appName) {
    // use a simple 3 byte random string to prevent collision
    const postFixHash = crypto.randomBytes(3).toString('hex');
    const normalized = _.kebabCase(appName.toLowerCase());
    return `${normalized}-nativefier-${postFixHash}`;
}

export default buildApp;
