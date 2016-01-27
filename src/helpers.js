import os from 'os';

function isOSX() {
    return os.platform() === 'darwin';
}

export default {
    isOSX: isOSX
};
