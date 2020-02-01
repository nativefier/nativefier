import * as path from 'path';
import * as tmp from 'tmp';

import * as shell from 'shelljs';

import { isOSX } from './helpers';

tmp.setGracefulCleanup();

const PNG_TO_ICNS_BIN_PATH = path.join(__dirname, '../..', 'bin/convertToIcns');

/**
 * Converts the png to a temp directory which will be cleaned up on process exit
 */
export function convertToIcns(
  pngSource: string,
  callback: (error: any, iconsDestination: string) => void,
): void {
  const tmpIconDirPath = tmp.dirSync({ unsafeCleanup: true }).name;
  if (!isOSX()) {
    callback('OSX is required to convert a .png icon to .icns', pngSource);
    return;
  }

  const iconsDestination = `${tmpIconDirPath}/icon.icns`;
  shell.exec(
    `"${PNG_TO_ICNS_BIN_PATH}" "${pngSource}" "${iconsDestination}"`,
    { silent: true },
    (exitCode, stdOut, stdError) => {
      if (stdOut.includes('icon.iconset:error') || exitCode) {
        if (exitCode) {
          callback(
            {
              stdOut,
              stdError,
            },
            pngSource,
          );
          return;
        }

        callback(stdOut, pngSource);
        return;
      }

      callback(null, iconsDestination);
    },
  );
}
