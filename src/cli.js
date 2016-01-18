import os from 'os';
import fs from 'fs';
import path from 'path';

import packager from 'electron-packager';
import commander from 'commander';
import tmp from 'tmp';
import ncp from 'ncp';
import async from 'async';

const copy = ncp.ncp;

const TEMPLATE_APP_DIR = path.join(__dirname, '../', 'app');
const ELECTRON_VERSION = '0.36.4';

function optionsFactory(name = 'MyApp',
                        targetUrl = 'http://google.com',
                        platform = detectPlatform(),
                        architecture = detectArch(),
                        version = ELECTRON_VERSION,
                        outDir = os.homedir(),
                        overwrite = true,
                        conceal = true,
                        iconDir,
                        badge = false,
                        width = 1280,
                        height = 800) {
    return {
        dir: TEMPLATE_APP_DIR,

        name: name,
        targetUrl: targetUrl,

        platform: platform,
        arch: architecture,
        version: version,

        out: outDir,

        // optionals
        overwrite: overwrite,
        asar: conceal,
        icon: iconDir,

        // app configuration
        badge: badge,
        width: width,
        height: height
    }
}

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
        function (callback) {
            console.log("Dir: ", tmpobj.name);

            copyPlaceholderApp(options.dir, tmpPath, options.name, options.targetUrl, options.badge, options.width, options.height, callback);
        },
        function (tempDir, callback) {
            console.log('copied to ', tempDir);
            options.dir = tempDir;
            packager(options, callback);
        },
        function (appPath, callback) {
            tmpobj.removeCallback();
            callback(null, appPath);
        }
    ], callback);
}


function detectPlatform() {
    const platform = os.platform();
    if (platform === 'darwin' || platform === 'win32' || platform === 'linux') {
        return platform;
    }

    console.warn(`Warning: Untested platform ${platform} detected, assuming linux`);
    return 'linux';
}

function detectArch() {
    const arch = os.arch();
    if (arch !== 'ia32' && arch !== 'x64') {
        throw `Incompatible architecture ${arch} detected`;
    }
    return os.arch();
}

function main() {
    const options = optionsFactory();
    buildApp(options, (error, appPath) => {
        if (error) {
            console.trace(error);
            return;
        }

        console.log(`App built to ${appPath}`);
    });

}

/**
 * @callback tempDirCallback
 * @param error
 * @param [tempDirPath]
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
 * @param {number} [width]
 * @param {number} [height]
 * @param {tempDirCallback} callback
 */
function copyPlaceholderApp(srcAppDir, tempDir, name, targetURL, badge, width, height, callback) {
    copy(srcAppDir, tempDir, function (error) {

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
            height: height
        };

        fs.writeFileSync(path.join(tempDir, '/targetUrl.txt'), JSON.stringify(appArgs));
        callback(null, tempDir);
    });
};


main();