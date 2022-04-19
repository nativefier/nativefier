import * as fs from 'fs';
import * as path from 'path';

import { isOSX, isWindows, isLinux } from './helpers';
import * as log from './loggingHelper';

type fsError = Error & { code: string };

/**
 * Find a file or directory
 */
function findSync(
  pattern: RegExp,
  basePath: string,
  limitSearchToDirectories = false,
): string[] {
  const matches: string[] = [];

  (function findSyncRecurse(base): void {
    let children: string[];
    try {
      children = fs.readdirSync(base);
    } catch (err: unknown) {
      if ((err as fsError).code === 'ENOENT') {
        return;
      }
      throw err;
    }

    for (const child of children) {
      const childPath = path.join(base, child);
      const childIsDirectory = fs.lstatSync(childPath).isDirectory();
      const patternMatches = pattern.test(childPath);

      if (!patternMatches) {
        if (!childIsDirectory) {
          return;
        }
        findSyncRecurse(childPath);
        return;
      }

      if (!limitSearchToDirectories) {
        matches.push(childPath);
        return;
      }

      if (childIsDirectory) {
        matches.push(childPath);
      }
    }
  })(basePath);
  return matches;
}

function findFlashOnLinux(): string {
  return findSync(/libpepflashplayer\.so/, '/opt/google/chrome')[0];
}

function findFlashOnWindows(): string {
  return findSync(
    /pepflashplayer\.dll/,
    'C:\\Program Files (x86)\\Google\\Chrome',
  )[0];
}

function findFlashOnMac(): string {
  return findSync(
    /PepperFlashPlayer.plugin/,
    '/Applications/Google Chrome.app/',
    true,
  )[0];
}

export function inferFlashPath(): string | undefined {
  if (isOSX()) {
    return findFlashOnMac();
  }

  if (isWindows()) {
    return findFlashOnWindows();
  }

  if (isLinux()) {
    return findFlashOnLinux();
  }

  log.warn('Unable to determine OS to infer flash player');
  return undefined;
}
