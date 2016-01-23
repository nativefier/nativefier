var wurl = require('wurl');
var os = require('os');

function isOSX() {
    return os.platform() === 'darwin';
}

function linkIsInternal(currentUrl, newUrl) {
    var currentDomain = wurl('domain', currentUrl);
    var newDomain = wurl('domain', newUrl);
    return currentDomain === newDomain;
}

module.exports = {
    isOSX: isOSX,
    linkIsInternal: linkIsInternal
};
