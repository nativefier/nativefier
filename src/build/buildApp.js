import fs from 'fs';
import crypto from 'crypto';
import _ from 'lodash';
import path from 'path';
import ncp from 'ncp';

const copy = ncp.ncp;

/**
 * Creates a temporary directory and copies the './app folder' inside, and adds a text file with the configuration
 * for the single page app.
 *
 * @param {string} src
 * @param {string} dest
 * @param {{}} options
 * @param callback
 */
function buildApp(src, dest, options, callback) {
    const appArgs = selectAppArgs(options);
    copy(src, dest, error => {
        if (error) {
            callback(`Error Copying temporary directory: ${error}`);
            return;
        }

        fs.writeFileSync(path.join(dest, '/nativefier.json'), JSON.stringify(appArgs));

        maybeCopyScripts(options.inject, dest)
            .then(() => {
                changeAppPackageJsonName(dest, appArgs.name, appArgs.targetUrl);
                callback();
            })
            .catch(error => {
                callback(error);
            });
    });
}

function maybeCopyScripts(srcs, dest) {
    if (!srcs) {
        return new Promise(resolve => {
            resolve();
        });
    }
    const promises = srcs.map(src => {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(src)) {
                resolve();
                return;
            }

            let destFileName;
            if (path.extname(src) === '.js') {
                destFileName = 'inject.js';
            } else if (path.extname(src) === '.css') {
                destFileName = 'inject.css';
            } else {
                resolve();
                return;
            }

            copy(src, path.join(dest, 'inject', destFileName), error => {
                if (error) {
                    reject(`Error Copying injection files: ${error}`);
                    return;
                }
                resolve();
            });
        });
    });

    return new Promise((resolve, reject) => {
        Promise.all(promises)
            .then(() => {
                resolve();
            })
            .catch(error => {
                reject(error);
            });
    });
}

function changeAppPackageJsonName(appPath, name, url) {
    const packageJsonPath = path.join(appPath, '/package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath));
    packageJson.name = normalizeAppName(name, url);
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));
}

/**
 * Only picks certain app args to pass to nativefier.json
 * @param options
 * @returns {{name: (*|string), targetUrl: (string|*), counter: *, width: *, height: *, showMenuBar: *, userAgent: *, nativefierVersion: *, insecure: *, disableWebSecurity: *}}
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
        ignoreCertificate: options.ignoreCertificate,
        insecure: options.insecure,
        flashPluginDir: options.flashPluginDir,
        fullScreen: options.fullScreen,
        hideWindowFrame: options.hideWindowFrame,
        maximize: options.maximize,
        disableContextMenu: options.disableContextMenu
    };
}

function normalizeAppName(appName, url) {
    // use a simple 3 byte random string to prevent collision
    let hash = crypto.createHash('md5');
    hash.update(url);
    const postFixHash = hash.digest('hex').substring(0, 6);
    const normalized = _.kebabCase(appName.toLowerCase());
    return `${normalized}-nativefier-${postFixHash}`;
}

export default buildApp;
