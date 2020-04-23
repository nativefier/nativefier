import * as fs from 'fs';
import * as path from 'path';

import { isOSX, isWindows, isLinux } from './helpers';

/**
 * Find a file or directory
 */
function findSync(
  pattern: RegExp,
  basePath: string,
  limitSearchToDirectories = false,
): string[] {
  const matches: string[] = [];

  (function findSyncRecurse(base) {
    let children: string[];
    try {
      children = fs.readdirSync(base);
    } catch (err) {
      if (err.code === 'ENOENT') {
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

function findFlashOnLinux() {
  return findSync(/libpepflashplayer\.so/, '/opt/google/chrome')[0];
}

function findFlashOnWindows() {
  return findSync(
    /pepflashplayer\.dll/,
    'C:\\Program Files (x86)\\Google\\Chrome',
  )[0];
}

function findFlashOnMac() {
  return findSync(
    /PepperFlashPlayer.plugin/,
    '/Applications/Google Chrome.app/',
    true,
  )[0];
}

export function inferFlashPath() {
  if (isOSX()) {
    return findFlashOnMac();
  }

  if (isWindows()) {
    return findFlashOnWindows();
  }

  if (isLinux()) {
    return findFlashOnLinux();
  }

  console.warn('Unable to determine OS to infer flash player');
  return null;
}
