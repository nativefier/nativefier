import path from 'path';
import helpers from './helpers';
import pngToIcns from './pngToIcns';
const isOSX = helpers.isOSX;

/**
 * @callback augmentIconsCallback
 * @param error
 * @param options
 */

/**
 * Will check and convert a `.png` to `.icns` if necessary and augment
 * options.icon with the result
 *
 * @param options will need options.platform and options.icon
 * @param {augmentIconsCallback} callback
 */
function iconBuild(options, callback) {

    const returnCallback = () => {
        callback(null, options);
    };

    if (!options.icon) {
        returnCallback();
        return;
    }

    if (options.platform !== 'darwin') {
        if (iconIsPng(options.icon)) {
            returnCallback();
        } else {
            console.warn('Icon should be a png for Linux and Windows apps');
            returnCallback();
        }
        return;
    }

    if (iconIsIcns(options.icon)) {
        returnCallback();
        return;
    }

    if (iconIsPng(options.icon)) {

        if (!isOSX()) {
            console.warn('Conversion of `.png` to `.icns` for OSX app is only supported on OSX');
            returnCallback();
            return;
        }

        pngToIcns(options.icon, (error, icnsPath) => {
            options.icon = icnsPath;
            if (error) {
                console.warn('Skipping icon conversion from `.png` to `.icns`: ', error);
            }
            returnCallback();
            return;
        });
    }
}

function iconIsPng(iconPath) {
    return path.extname(iconPath) === '.png';
}

function iconIsIcns(iconPath) {
    return path.extname(iconPath) === '.icns';
}

export default iconBuild;
