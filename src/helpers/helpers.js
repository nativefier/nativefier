import os from 'os';

function isOSX() {
    return os.platform() === 'darwin';
}

function isWindows() {
    return os.platform() === 'win32';
}

export default {
    isOSX: isOSX,
    isWindows: isWindows
};
