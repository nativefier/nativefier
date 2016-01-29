import wurl from 'wurl';
import os from 'os';

function isOSX() {
    return os.platform() === 'darwin';
}

function linkIsInternal(currentUrl, newUrl) {
    var currentDomain = wurl('domain', currentUrl);
    var newDomain = wurl('domain', newUrl);
    return currentDomain === newDomain;
}

export default {
    isOSX,
    linkIsInternal
};
