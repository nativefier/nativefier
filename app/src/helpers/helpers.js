import wurl from 'wurl';
import os from 'os';
import fs from 'fs';
import path from 'path';

const INJECT_CSS_PATH = path.join(__dirname, '..', 'inject/inject.css');

function isOSX() {
    return os.platform() === 'darwin';
}

function isLinux() {
    return os.platform() === 'linux';
}

function isWindows() {
    return os.platform() === 'win32';
}

function linkIsInternal(currentUrl, newUrl) {
    var currentDomain = wurl('domain', currentUrl);
    var newDomain = wurl('domain', newUrl);
    return currentDomain === newDomain;
}

function getCssToInject() {
    const needToInject = fs.existsSync(INJECT_CSS_PATH);
    if (!needToInject) {
        return '';
    }
    return fs.readFileSync(INJECT_CSS_PATH).toString();
}

export default {
    isOSX,
    isLinux,
    isWindows,
    linkIsInternal,
    getCssToInject
};
