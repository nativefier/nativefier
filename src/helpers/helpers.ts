import * as os from 'os';
import * as path from 'path';

import axios from 'axios';
import * as hasbin from 'hasbin';
import { ncp } from 'ncp';
import * as log from 'loglevel';
import * as tmp from 'tmp';
tmp.setGracefulCleanup(); // cleanup temp dirs even when an uncaught exception occurs

const now = new Date();
const TMP_TIME = `${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;

type DownloadResult = {
  data: Buffer;
  ext: string;
};

export function isOSX(): boolean {
  return os.platform() === 'darwin';
}

export function isWindows(): boolean {
  return os.platform() === 'win32';
}

/**
 * Create a temp directory with a debug-friendly name, and return its path.
 * Will be automatically deleted on exit.
 */
export function getTempDir(prefix: string, mode?: number): string {
  return tmp.dirSync({
    mode,
    unsafeCleanup: true, // recursively remove tmp dir on exit, even if not empty.
    prefix: `nativefier-${TMP_TIME}-${prefix}-`,
  }).name;
}

export async function copyFileOrDir(
  sourceFileOrDir: string,
  dest: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    ncp(sourceFileOrDir, dest, (error: any) => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
}

export async function downloadFile(fileUrl: string): Promise<DownloadResult> {
  log.debug(`Downloading ${fileUrl}`);
  return axios
    .get(fileUrl, {
      responseType: 'arraybuffer',
    })
    .then((response) => {
      if (!response.data) {
        return null;
      }
      return {
        data: response.data,
        ext: path.extname(fileUrl),
      };
    });
}

export function getAllowedIconFormats(platform: string): string[] {
  const hasIdentify = hasbin.sync('identify') || hasbin.sync('gm');
  const hasConvert = hasbin.sync('convert') || hasbin.sync('gm');
  const hasIconUtil = hasbin.sync('iconutil');

  const pngToIcns = hasConvert && hasIconUtil;
  const pngToIco = hasConvert;
  const icoToIcns = pngToIcns && hasIdentify;
  const icoToPng = hasConvert;

  // Unsupported
  const icnsToPng = false;
  const icnsToIco = false;

  const formats = [];

  // Shell scripting is not supported on windows, temporary override
  if (isWindows()) {
    switch (platform) {
      case 'darwin':
        formats.push('.icns');
        break;
      case 'linux':
        formats.push('.png');
        break;
      case 'win32':
        formats.push('.ico');
        break;
      default:
        throw new Error(`Unknown platform ${platform}`);
    }
    log.debug(
      `Allowed icon formats when building for ${platform} (limited on Windows):`,
      formats,
    );
    return formats;
  }

  switch (platform) {
    case 'darwin':
      formats.push('.icns');
      if (pngToIcns) {
        formats.push('.png');
      }
      if (icoToIcns) {
        formats.push('.ico');
      }
      break;
    case 'linux':
      formats.push('.png');
      if (icoToPng) {
        formats.push('.ico');
      }
      if (icnsToPng) {
        formats.push('.icns');
      }
      break;
    case 'win32':
      formats.push('.ico');
      if (pngToIco) {
        formats.push('.png');
      }
      if (icnsToIco) {
        formats.push('.icns');
      }
      break;
    default:
      throw new Error(`Unknown platform ${platform}`);
  }
  log.debug(`Allowed icon formats when building for ${platform}:`, formats);
  return formats;
}

/**
 * Refuse args like '--n' or '-name', we accept either short '-n' or long '--name'
 */
export function isArgFormatInvalid(arg: string): boolean {
  return (
    (arg.startsWith('---') ||
      /^--[a-z]$/i.exec(arg) !== null ||
      /^-[a-z]{2,}$/i.exec(arg) !== null) &&
    !['--x', '--y'].includes(arg) // exception for long args --{x,y}
  );
}
