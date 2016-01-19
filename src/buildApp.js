import fs from 'fs';
import path from 'path';

import packager from 'electron-packager';
import tmp from 'tmp';
import ncp from 'ncp';
import async from 'async';

const copy = ncp.ncp;

/**
 * @callback buildAppCallback
 * @param error
 * @param appPath
 */

/**
 *
 * @param options
 * @param {buildAppCallback} callback
 */
function buildApp(options, callback) {
    // pre process app

    var tmpobj = tmp.dirSync({unsafeCleanup: true});
    const tmpPath = tmpobj.name;

    async.waterfall([
        callback => {
            copyPlaceholderApp(options.dir, tmpPath, options.name, options.targetUrl, options.badge, options.width, options.height, options.userAgent, options.showDevTools, callback);
        },

        (tempDir, callback) => {
            options.dir = tempDir;
            packager(options, callback);
        },

        (appPath, callback) => {
            tmpobj.removeCallback();
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
 * @param {boolean} badge
 * @param {number} width
 * @param {number} height
 * @param {string} userAgent
 * @param {boolean} showDevTools
 * @param {tempDirCallback} callback
 */
function copyPlaceholderApp(srcAppDir, tempDir, name, targetURL, badge, width, height, userAgent, showDevTools, callback) {
    copy(srcAppDir, tempDir, error => {

        if (error) {
            console.error(error);
            callback(`Error Copying temporary directory: ${error}`);
            return;
        }

        const appArgs = {
            name: name,
            targetUrl: targetURL,
            badge: badge,
            width: width,
            height: height,
            userAgent: userAgent,
            showDevTools: showDevTools
        };

        fs.writeFileSync(path.join(tempDir, '/targetUrl.txt'), JSON.stringify(appArgs));
        callback(null, tempDir);
    });
};

export default buildApp;
