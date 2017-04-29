import fs from 'fs';
import path from 'path';
import helpers from './helpers';

const { isOSX, isWindows, isLinux } = helpers;

/**
 * Synchronously find a file or directory
 * @param {RegExp} pattern regex
 * @param {string} base path
 * @param {boolean} [findDir] if true, search results will be limited to only directories
 * @returns {Array}
 */
function findSync(pattern, basePath, findDir) {
  const matches = [];

  (function findSyncRecurse(base) {
    let children;
    try {
      children = fs.readdirSync(base);
    } catch (exception) {
      if (exception.code === 'ENOENT') {
        return;
      }
      throw exception;
    }

    children.forEach((child) => {
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

      if (!findDir) {
        matches.push(childPath);
        return;
      }

      if (childIsDirectory) {
        matches.push(childPath);
      }
    });
  }(basePath));
  return matches;
}

function linuxMatch() {
  return findSync(/libpepflashplayer\.so/, '/opt/google/chrome')[0];
}

function windowsMatch() {
  return findSync(/pepflashplayer\.dll/, 'C:\\Program Files (x86)\\Google\\Chrome')[0];
}

function darwinMatch() {
  return findSync(/PepperFlashPlayer.plugin/, '/Applications/Google Chrome.app/', true)[0];
}

function inferFlash() {
  if (isOSX()) {
    return darwinMatch();
  }

  if (isWindows()) {
    return windowsMatch();
  }

  if (isLinux()) {
    return linuxMatch();
  }

  console.warn('Unable to determine OS to infer flash player');
  return null;
}
export default inferFlash;
