import wurl from 'wurl';
import os from 'os';

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

export default {
    isOSX,
    isLinux,
    isWindows,
    linkIsInternal
};
