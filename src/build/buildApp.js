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
        changeAppPackageJsonName(dest, appArgs.name, appArgs.targetUrl);
        callback();
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

function normalizeAppName(appName, url) {
    // use a simple 3 byte random string to prevent collision
    let hash = crypto.createHash('md5');
    hash.update(url);
    const postFixHash = hash.digest('hex').substring(0, 6);
    const normalized = _.kebabCase(appName.toLowerCase());
    return `${normalized}-nativefier-${postFixHash}`;
}

export default buildApp;
