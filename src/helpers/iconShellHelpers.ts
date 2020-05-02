import * as path from 'path';

import * as shell from 'shelljs';

import { isWindows, isOSX, getTempDir } from './helpers';
import * as log from 'loglevel';

const SCRIPT_PATHS = {
  singleIco: path.join(__dirname, '../..', 'icon-scripts/singleIco'),
  convertToPng: path.join(__dirname, '../..', 'icon-scripts/convertToPng'),
  convertToIco: path.join(__dirname, '../..', 'icon-scripts/convertToIco'),
  convertToIcns: path.join(__dirname, '../..', 'icon-scripts/convertToIcns'),
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
      reject(
        new Error(
          'Icon conversion only supported on macOS or Linux. ' +
            'If building for Windows, download/create a .ico and pass it with --icon favicon.ico . ' +
            'If building for macOS/Linux, do it from macOS/Linux',
        ),
      );
      return;
    }

    const shellCommand = `"${shellScriptPath}" "${icoSource}" "${icoDestination}"`;
    log.debug(
      `Converting icon ${icoSource} to ${icoDestination}.`,
      `Calling: ${shellCommand}`,
    );
    shell.exec(shellCommand, { silent: true }, (exitCode, stdOut, stdError) => {
      if (exitCode) {
        reject({
          stdOut,
          stdError,
        });
        return;
      }

      log.debug(`Conversion succeeded and produced icon at ${icoDestination}`);
      resolve(icoDestination);
    });
  });
}

export function singleIco(icoSrc: string, icoNameDest: string = "icon"): Promise<string> {
  return iconShellHelper(
    SCRIPT_PATHS.singleIco,
    icoSrc,
    `${getTempDir('iconconv')}/${icoNameDest}.ico`,
  );
}

export async function convertToPng(icoSrc: string, icoNameDest: string = "icon"): Promise<string> {
  return iconShellHelper(
    SCRIPT_PATHS.convertToPng,
    icoSrc,
    `${getTempDir('iconconv')}/${icoNameDest}.png`,
  );
}

export async function convertToIco(icoSrc: string, icoNameDest: string = "icon"): Promise<string> {
  return iconShellHelper(
    SCRIPT_PATHS.convertToIco,
    icoSrc,
    `${getTempDir('iconconv')}/${icoNameDest}.ico`,
  );
}

export async function convertToIcns(icoSrc: string, icoNameDest: string = "icon"): Promise<string> {
  if (!isOSX()) {
    throw new Error('macOS is required to convert to a .icns icon');
  }

  return iconShellHelper(
    SCRIPT_PATHS.convertToIcns,
    icoSrc,
    `${getTempDir('iconconv')}/${icoNameDest}.icns`,
  );
}
