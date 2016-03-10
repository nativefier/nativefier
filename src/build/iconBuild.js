import path from 'path';
import helpers from './../helpers/helpers';
import iconShellHelpers from './../helpers/iconShellHelpers';

const {isOSX} = helpers;
const {singleIco, convertToPng, convertToIcns} = iconShellHelpers;

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
                console.warn('Skipping process to make .ico icon contain only a single image:', error);
                returnCallback();
            });
        return;
    }

    if (options.platform === 'linux') {
        if (iconIsPng(options.icon)) {
            returnCallback();
            return;
        }

        convertToPng(options.icon)
            .then(outPath => {
                options.icon = outPath;
                returnCallback();
            })
            .catch(error => {
                console.warn('Skipping icon conversion to .png', error);
                returnCallback();
            });
        return;
    }

    if (iconIsIcns(options.icon)) {
        returnCallback();
        return;
    }

    if (!isOSX()) {
        console.warn('Skipping icon conversion to .icns, conversion is only supported on OSX');
        returnCallback();
        return;
    }

    convertToIcns(options.icon)
        .then(outPath => {
            options.icon = outPath;
            returnCallback();
        })
        .catch(error => {
            console.warn('Skipping icon conversion to .icns', error);
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
