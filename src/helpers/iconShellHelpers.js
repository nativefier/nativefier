import shell from 'shelljs';
import path from 'path';
import tmp from 'tmp';
import helpers from './helpers';

const { isWindows, isOSX } = helpers;

tmp.setGracefulCleanup();

const SCRIPT_PATHS = {
  singleIco: path.join(__dirname, '../..', 'bin/singleIco'),
  convertToPng: path.join(__dirname, '../..', 'bin/convertToPng'),
  convertToIco: path.join(__dirname, '../..', 'bin/convertToIco'),
  convertToIcns: path.join(__dirname, '../..', 'bin/convertToIcns'),
};

/**
 * Executes a shell script with the form "./pathToScript param1 param2"
 * @param {string} shellScriptPath
 * @param {string} icoSrc input .ico
 * @param {string} dest has to be a .ico path
 */
function iconShellHelper(shellScriptPath, icoSrc, dest) {
  return new Promise((resolve, reject) => {
    if (isWindows()) {
      reject('OSX or Linux is required');
      return;
    }

    shell.exec(`${shellScriptPath} ${icoSrc} ${dest}`, { silent: true }, (exitCode, stdOut, stdError) => {
      if (exitCode) {
        reject({
          stdOut,
          stdError,
        });
        return;
      }

      resolve(dest);
    });
  });
}

function getTmpDirPath() {
  const tempIconDirObj = tmp.dirSync({ unsafeCleanup: true });
  return tempIconDirObj.name;
}

/**
 * Converts the ico to a temporary directory which will be cleaned up on process exit
 * @param {string} icoSrc path to a .ico file
 * @return {Promise}
 */

function singleIco(icoSrc) {
  return iconShellHelper(SCRIPT_PATHS.singleIco, icoSrc, `${getTmpDirPath()}/icon.ico`);
}

function convertToPng(icoSrc) {
  return iconShellHelper(SCRIPT_PATHS.convertToPng, icoSrc, `${getTmpDirPath()}/icon.png`);
}

function convertToIco(icoSrc) {
  return iconShellHelper(SCRIPT_PATHS.convertToIco, icoSrc, `${getTmpDirPath()}/icon.ico`);
}

function convertToIcns(icoSrc) {
  if (!isOSX()) {
    return new Promise((resolve, reject) => reject('OSX is required to convert to a .icns icon'));
  }
  return iconShellHelper(SCRIPT_PATHS.convertToIcns, icoSrc, `${getTmpDirPath()}/icon.icns`);
}

export default {
  singleIco,
  convertToPng,
  convertToIco,
  convertToIcns,
};
