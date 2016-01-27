import shell from 'shelljs';
import path from 'path';
import tmp from 'tmp';

tmp.setGracefulCleanup();

const PNG_TO_ICNS_BIN_PATH = path.join(__dirname, '..', 'bin/pngToIcns');

/**
 * @callback pngToIcnsCallback
 * @param {{}} error
 * @param {string} error.stdOut
 * @param {string} error.stdError
 * @param {string} icnsDest
 */

/**
 *
 * @param {string} pngSrc
 * @param {string} icnsDest
 * @param {pngToIcnsCallback} callback
 */
function pngToIcns(pngSrc, icnsDest, callback) {
    shell.exec(`${PNG_TO_ICNS_BIN_PATH} ${pngSrc} ${icnsDest}`, {silent: true}, (exitCode, stdOut, stdError) => {
        if (exitCode) {
            callback({
                stdOut: stdOut,
                stdError: stdError
            });
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
