import * as path from 'path';
import * as tmp from 'tmp';

import * as shell from 'shelljs';

import { isWindows, isOSX } from './helpers';

tmp.setGracefulCleanup();

const SCRIPT_PATHS = {
  singleIco: path.join(__dirname, '../..', 'bin/singleIco'),
  convertToPng: path.join(__dirname, '../..', 'bin/convertToPng'),
  convertToIco: path.join(__dirname, '../..', 'bin/convertToIco'),
  convertToIcns: path.join(__dirname, '../..', 'bin/convertToIcns'),
};

/**
 * Executes a shell script with the form "./pathToScript param1 param2"
 */
async function iconShellHelper(
  shellScriptPath: string,
  icoSource: string,
  icoDestination: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (isWindows()) {
      reject(new Error('OSX or Linux is required'));
      return;
    }

    shell.exec(
      `"${shellScriptPath}" "${icoSource}" "${icoDestination}"`,
      { silent: true },
      (exitCode, stdOut, stdError) => {
        if (exitCode) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({
            stdOut,
            stdError,
          });
          return;
        }

        resolve(icoDestination);
      },
    );
  });
}

function getTmpDirPath(): string {
  const tempIconDirObj = tmp.dirSync({ unsafeCleanup: true });
  return tempIconDirObj.name;
}

/**
 * Converts the ico to a temporary directory which will be cleaned up on process exit
 * @param {string} icoSrc path to a .ico file
 * @return {Promise}
 */

export function singleIco(icoSrc: string): Promise<string> {
  return iconShellHelper(
    SCRIPT_PATHS.singleIco,
    icoSrc,
    `${getTmpDirPath()}/icon.ico`,
  );
}

export function convertToPng(icoSrc: string): Promise<string> {
  return iconShellHelper(
    SCRIPT_PATHS.convertToPng,
    icoSrc,
    `${getTmpDirPath()}/icon.png`,
  );
}

export function convertToIco(icoSrc: string): Promise<string> {
  return iconShellHelper(
    SCRIPT_PATHS.convertToIco,
    icoSrc,
    `${getTmpDirPath()}/icon.ico`,
  );
}

export function convertToIcns(icoSrc: string): Promise<string> {
  if (!isOSX()) {
    return new Promise((resolve, reject) =>
      reject(new Error('OSX is required to convert to a .icns icon')),
    );
  }
  return iconShellHelper(
    SCRIPT_PATHS.convertToIcns,
    icoSrc,
    `${getTmpDirPath()}/icon.icns`,
  );
}
