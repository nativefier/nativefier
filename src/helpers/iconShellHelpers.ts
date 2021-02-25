import * as path from 'path';
import { spawnSync } from 'child_process';

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
function iconShellHelper(
  shellScriptPath: string,
  icoSource: string,
  icoDestination: string,
): string {
  if (isWindows()) {
    throw new Error(
      'Icon conversion only supported on macOS or Linux. ' +
        'If building for Windows, download/create a .ico and pass it with --icon favicon.ico . ' +
        'If building for macOS/Linux, do it from macOS/Linux',
    );
  }

  const shellCommand = `"${shellScriptPath}" "${icoSource}" "${icoDestination}"`;
  log.debug(
    `Converting icon ${icoSource} to ${icoDestination}.`,
    `Calling shell command: ${shellCommand}`,
  );
  const { stdout, stderr, status } = spawnSync(
    shellScriptPath,
    [icoSource, icoDestination],
    { timeout: 10000 },
  );
  if (status) {
    throw new Error(
      `Icon conversion failed with status code ${status}.\nstdout: ${stdout.toString()}\nstderr: ${stderr.toString()}`,
    );
  }
  log.debug(`Conversion succeeded and produced icon at ${icoDestination}`);
  return icoDestination;
}

export function singleIco(icoSrc: string): string {
  return iconShellHelper(
    SCRIPT_PATHS.singleIco,
    icoSrc,
    `${getTempDir('iconconv')}/icon.ico`,
  );
}

export function convertToPng(icoSrc: string): string {
  return iconShellHelper(
    SCRIPT_PATHS.convertToPng,
    icoSrc,
    `${getTempDir('iconconv')}/icon.png`,
  );
}

export function convertToIco(icoSrc: string): string {
  return iconShellHelper(
    SCRIPT_PATHS.convertToIco,
    icoSrc,
    `${getTempDir('iconconv')}/icon.ico`,
  );
}

export function convertToIcns(icoSrc: string): string {
  if (!isOSX()) {
    throw new Error('macOS is required to convert to a .icns icon');
  }

  return iconShellHelper(
    SCRIPT_PATHS.convertToIcns,
    icoSrc,
    `${getTempDir('iconconv')}/icon.icns`,
  );
}
