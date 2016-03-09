import path from 'path';
import helpers from './../helpers/helpers';
import pngToIcns from './../helpers/pngToIcns';
import singleIco from './../helpers/singleIco';
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

    if (options.platform === 'win32') {
        if (!iconIsIco(options.icon)) {
            console.warn('Icon should be an .ico to package for Windows');
            returnCallback();
            return;
        }

        singleIco(options.icon)
            .then(outPath => {
                options.icon = outPath;
                returnCallback();
            })
            .catch(error => {
                console.warn('Skipping icon conversion from `.png` to `.icns`: ', error);
                returnCallback();
            });
        return;
    }

    if (options.platform === 'linux') {
        if (iconIsPng(options.icon)) {
            returnCallback();
        } else {
            console.warn('Icon should be a .png to package for Linux');
            returnCallback();
        }
        return;
    }

    if (iconIsIcns(options.icon)) {
        returnCallback();
        return;
    }

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
    });
}

function iconIsIco(iconPath) {
    return path.extname(iconPath) === '.ico';
}

function iconIsPng(iconPath) {
    return path.extname(iconPath) === '.png';
}

function iconIsIcns(iconPath) {
    return path.extname(iconPath) === '.icns';
}

export default iconBuild;
