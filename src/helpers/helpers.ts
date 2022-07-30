import { spawnSync } from 'child_process';
import * as crypto from 'crypto';
import * as os from 'os';
import * as path from 'path';

import axios from 'axios';
import * as dns from 'dns';
import * as hasbin from 'hasbin';
import * as log from 'loglevel';
import * as tmp from 'tmp';

import { parseJson } from '../utils/parseUtils';

tmp.setGracefulCleanup(); // cleanup temp dirs even when an uncaught exception occurs

const now = new Date();
const TMP_TIME = `${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;

export type DownloadResult = {
  data: Buffer;
  ext: string;
};

type ProcessEnvs = Record<string, unknown>;

export function hasWine(): boolean {
  return hasbin.sync('wine');
}

// I tried to place this (and the other is* functions) in
// a new shared helpers, but alas eslint gets real confused
// about the type signatures and thinks they're all any.
// TODO: Figure out a way to refactor duplicate code from
// src/helpers/helpers.ts and app/src/helpers/helpers.ts
// into the shared module

export function isLinux(): boolean {
  return os.platform() === 'linux';
}

export function isOSX(): boolean {
  return os.platform() === 'darwin';
}

export function isWindows(): boolean {
  return os.platform() === 'win32';
}

export function isWindowsAdmin(): boolean {
  if (process.platform !== 'win32') {
    return false;
  }

  // https://stackoverflow.com/questions/4051883/batch-script-how-to-check-for-admin-rights
  // https://stackoverflow.com/questions/57009374/check-admin-or-non-admin-users-in-nodejs-or-javascript
  return spawnSync('fltmc').status === 0;
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

export function downloadFile(
  fileUrl: string,
): Promise<DownloadResult | undefined> {
  log.debug(`Downloading ${fileUrl}`);
  return axios
    .get<Buffer>(fileUrl, {
      responseType: 'arraybuffer',
    })
    .then((response) => {
      if (!response.data) {
        return undefined;
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

  const formats: string[] = [];

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

export function generateRandomSuffix(length = 6): string {
  const hash = crypto.createHash('md5');
  // Add a random salt to help avoid collisions
  hash.update(crypto.randomBytes(256));
  return hash.digest('hex').substring(0, length);
}

export function getProcessEnvs(val: string): ProcessEnvs | undefined {
  if (!val) {
    return undefined;
  }
  return parseJson<ProcessEnvs>(val);
}

export function checkInternet(): void {
  dns.lookup('npmjs.com', (err) => {
    if (err && err.code === 'ENOTFOUND') {
      log.warn(
        '\nNo Internet Connection\nTo offline build, download electron from https://github.com/electron/electron/releases\nand place in ~/AppData/Local/electron/Cache/ on Windows,\n~/.cache/electron on Linux or ~/Library/Caches/electron/ on Mac\nUse --electron-version to specify the version you downloaded.',
      );
    }
  });
}

/**
 * Takes in a snake-cased string and converts to camelCase
 */
export function camelCased(str: string): string {
  return str
    .split('-')
    .filter((s) => s.length > 0)
    .map((word, i) => {
      if (i === 0) return word;
      return `${word[0].toUpperCase()}${word.substring(1)}`;
    })
    .join('');
}
