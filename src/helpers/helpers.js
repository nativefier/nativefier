import os from 'os';

function isOSX() {
    return os.platform() === 'darwin';
}

function isWindows() {
    return os.platform() === 'windows';
}

export default {
    isOSX: isOSX,
    isWindows: isWindows
};
