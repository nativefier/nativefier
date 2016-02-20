import os from 'os';
import path from 'path';
import _ from 'lodash';
import async from 'async';
import sanitizeFilename from 'sanitize-filename';

import inferIcon from './../infer/inferIcon';
import inferTitle from './../infer/inferTitle';
import inferOs from './../infer/inferOs';
import normalizeUrl from './normalizeUrl';
import packageJson from './../../package.json';

const {inferPlatform, inferArch} = inferOs;

const PLACEHOLDER_APP_DIR = path.join(__dirname, '../../', 'app');
const ELECTRON_VERSION = '0.36.4';
const DEFAULT_APP_NAME = 'APP';

/**
 * @callback optionsCallback
 * @param error
 * @param options augmented options
 */

/**
 * Extracts only desired keys from inpOptions and augments it with defaults
 * @param inpOptions
 * @param {optionsCallback} callback
 */
function optionsFactory(inpOptions, callback) {

    const options = {
        dir: PLACEHOLDER_APP_DIR,
        name: inpOptions.name,
        targetUrl: normalizeUrl(inpOptions.targetUrl),
        platform: inpOptions.platform || inferPlatform(),
        arch: inpOptions.arch || inferArch(),
        version: ELECTRON_VERSION,
        nativefierVersion: packageJson.version,
        out: inpOptions.out || process.cwd(),
        overwrite: inpOptions.overwrite || false,
        asar: inpOptions.conceal || false,
        icon: inpOptions.icon,
        counter: inpOptions.counter || false,
        width: inpOptions.width || 1280,
        height: inpOptions.height || 800,
        showMenuBar: inpOptions.showMenuBar || false,
        userAgent: inpOptions.userAgent || getFakeUserAgent(),
        insecure: inpOptions.insecure || false
    };

    if (inpOptions.honest) {
        options.userAgent = null;
    }

    async.waterfall([
        callback => {
            if (options.icon) {
                callback();
                return;
            }
            inferIcon(options.targetUrl, (error, pngPath) => {
                if (error) {
                    console.warn('Cannot automatically retrieve the app icon:', error);
                } else {
                    options.icon = pngPath;
                }
                callback();
            });
        },
        callback => {
            if (options.name && options.name.length > 0) {
                callback();
                return;
            }

            inferTitle(options.targetUrl, function(error, pageTitle) {
                if (error) {
                    console.warn(`Unable to automatically determine app name, falling back to '${DEFAULT_APP_NAME}'`);
                    options.name = DEFAULT_APP_NAME;
                } else {
                    options.name = pageTitle;
                }
                if (options.platform === 'linux') {
                    // spaces will cause problems with Ubuntu when pinned to the dock
                    options.name = _.kebabCase(options.name);
                }
                callback();
            });
        }
    ], error => {
        callback(error, sanitizeOptions(options));
    });
}

function sanitizeOptions(options) {
    options.name = sanitizeFilename(options.name);

    return options;
}

function getFakeUserAgent() {
    let userAgent;
    switch (os.platform()) {
        case 'darwin':
            userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36';
            break;
        case 'win32':
            userAgent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';
            break;
        case 'linux':
            userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36';
            break;
        default:
            break;
    }
    return userAgent;
}

export default optionsFactory;
