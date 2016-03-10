import shell from 'shelljs';
import path from 'path';
import tmp from 'tmp';
import helpers from './helpers';
const {isWindows} = helpers;

tmp.setGracefulCleanup();

const EXTRACT_ICO_PATH = path.join(__dirname, '../..', 'bin/singleIco');

/**
 *
 * @param {string} icoSrc input .ico
 * @param {string} dest has to be a .ico path
 */
function singleIco(icoSrc, dest) {
    return new Promise((resolve, reject) => {
        if (isWindows()) {
            reject('OSX or Linux is required');
            return;
        }

        shell.exec(`${EXTRACT_ICO_PATH} ${icoSrc} ${dest}`, {silent: true}, (exitCode, stdOut, stdError) => {
            if (stdOut.includes('icon.iconset:error') || exitCode) {
                if (exitCode) {
                    reject({
                        stdOut: stdOut,
                        stdError: stdError
                    });
                    return;
                }

                reject(stdOut);
                return;
            }

            resolve(dest);
        });
    });
}

/**
 * Converts the ico to a temporary directory which will be cleaned up on process exit
 * @param {string} icoSrc path to a .ico file
 */
function singleIcoTmp(icoSrc) {
    const tempIconDirObj = tmp.dirSync({unsafeCleanup: true});
    const tempIconDirPath = tempIconDirObj.name;
    return singleIco(icoSrc, `${tempIconDirPath}/icon.ico`);
}

export default singleIcoTmp;
