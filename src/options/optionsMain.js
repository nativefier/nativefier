import path from 'path';
import _ from 'lodash';
import async from 'async';
import sanitizeFilenameLib from 'sanitize-filename';

import inferIcon from './../infer/inferIcon';
import inferTitle from './../infer/inferTitle';
import inferOs from './../infer/inferOs';
import {inferUserAgent, getUserAgentString} from './../infer/inferUserAgent';
import normalizeUrl from './normalizeUrl';
import packageJson from './../../package.json';

const {inferPlatform, inferArch} = inferOs;

const PLACEHOLDER_APP_DIR = path.join(__dirname, '../../', 'app');
const ELECTRON_VERSION = '0.36.4';
const CHROME_VERSION = '47.0.2526.73';

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
        version: inpOptions.electronVersion || ELECTRON_VERSION,
        nativefierVersion: packageJson.version,
        out: inpOptions.out || process.cwd(),
        overwrite: inpOptions.overwrite,
        asar: inpOptions.conceal || false,
        icon: inpOptions.icon,
        counter: inpOptions.counter || false,
        width: inpOptions.width || 1280,
        height: inpOptions.height || 800,
        showMenuBar: inpOptions.showMenuBar || false,
        userAgent: inpOptions.userAgent,
        ignoreCertificate: inpOptions.ignoreCertificate || false,
        insecure: inpOptions.insecure || false,
        flashPluginDir: inpOptions.flash || null,
        inject: inpOptions.inject || null,
        fullScreen: inpOptions.fullScreen || false
    };

    if (inpOptions.honest) {
        options.userAgent = null;
    }

    if (options.platform.toLowerCase() === 'windows') {
        options.platform = 'win32';
    }

    if (options.platform.toLowerCase() === 'osx' || options.platform.toLowerCase() === 'mac') {
        options.platform = 'darwin';
    }

    async.waterfall([
        callback => {
            if (options.userAgent) {
                callback();
                return;
            }
            inferUserAgent(options.version, options.platform)
                .then(userAgent => {
                    options.userAgent = userAgent;
                    callback();
                })
                .catch(error => {
                    console.warn('Cannot get user agent:', error);
                    options.userAgent = getUserAgentString(CHROME_VERSION, options.platform);
                    callback();
                });
        },
        callback => {
            if (options.icon) {
                callback();
                return;
            }
            inferIcon(options.targetUrl, options.platform)
                .then(pngPath => {
                    options.icon = pngPath;
                    callback();
                })
                .catch(error => {
                    console.warn('Cannot automatically retrieve the app icon:', error);
                    callback();
                });
        },
        callback => {
            // length also checks if its the commanderJS function or a string
            if (options.name && options.name.length > 0) {
                callback();
                return;
            }

            inferTitle(options.targetUrl, function(error, pageTitle) {
                if (error) {
                    console.warn(`Unable to automatically determine app name, falling back to '${DEFAULT_APP_NAME}'`);
                    options.name = DEFAULT_APP_NAME;
                } else {
                    options.name = pageTitle.trim();
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

function sanitizeFilename(str) {
    const cleaned = sanitizeFilenameLib(str);
    // remove non ascii
    return cleaned.replace(/[^\x00-\x7F]/, '');
}

function sanitizeOptions(options) {
    options.name = sanitizeFilename(options.name);
    return options;
}

export default optionsFactory;
