import shell from 'shelljs';
import path from 'path';
import tmp from 'tmp';
import helpers from './helpers';

const isOSX = helpers.isOSX;
tmp.setGracefulCleanup();

const PNG_TO_ICNS_BIN_PATH = path.join(__dirname, '../..', 'bin/convertToIcns');

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
function convertToIcns(pngSrc, icnsDest, callback) {
  if (!isOSX()) {
    callback('OSX is required to convert .png to .icns icon', pngSrc);
    return;
  }

  shell.exec(`${PNG_TO_ICNS_BIN_PATH} ${pngSrc} ${icnsDest}`, { silent: true }, (exitCode, stdOut, stdError) => {
    if (stdOut.includes('icon.iconset:error') || exitCode) {
      if (exitCode) {
        callback({
          stdOut,
          stdError,
        }, pngSrc);
        return;
      }

      callback(stdOut, pngSrc);
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
function convertToIcnsTmp(pngSrc, callback) {
  const tempIconDirObj = tmp.dirSync({ unsafeCleanup: true });
  const tempIconDirPath = tempIconDirObj.name;
  convertToIcns(pngSrc, `${tempIconDirPath}/icon.icns`, callback);
}

export default convertToIcnsTmp;
