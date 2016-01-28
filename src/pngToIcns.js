import shell from 'shelljs';
import path from 'path';
import tmp from 'tmp';
import helpers from './helpers';
const isOSX = helpers.isOSX;
tmp.setGracefulCleanup();

const PNG_TO_ICNS_BIN_PATH = path.join(__dirname, '..', 'bin/pngToIcns');

/**
 * @callback pngToIcnsCallback
 * @param error
 * @param {string} icnsDest If error, will return the original png src
 */

/**
 *
 * @param {string} pngSrc
 * @param {string} icnsDest
 * @param {pngToIcnsCallback} callback
 */
function pngToIcns(pngSrc, icnsDest, callback) {
    if (!isOSX()) {
        callback('OSX is required to convert .png to .icns icon', pngSrc);
        return;
    }

    shell.exec(`${PNG_TO_ICNS_BIN_PATH} ${pngSrc} ${icnsDest}`, {silent: true}, (exitCode, stdOut, stdError) => {
        if (exitCode) {
            callback({
                stdOut: stdOut,
                stdError: stdError
            }, pngSrc);
            return;
        }

        callback(null, icnsDest);
    });
}

/**
 * Converts the png to a temporary directory which will be cleaned up on process exit
 * @param {string} pngSrc
 * @param {pngToIcnsCallback} callback
 */
function pngToIcnsTmp(pngSrc, callback) {
    const tempIconDirObj = tmp.dirSync({unsafeCleanup: true});
    const tempIconDirPath = tempIconDirObj.name;
    pngToIcns(pngSrc, `${tempIconDirPath}/icon.icns`, callback);
}

export default pngToIcnsTmp;
