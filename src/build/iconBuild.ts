import * as path from 'path';

import { isOSX } from '../helpers/helpers';
import {
  convertToPng,
  convertToIco,
  convertToIcns,
} from '../helpers/iconShellHelpers';

import log = require('loglevel');

function iconIsIco(iconPath: string): boolean {
  return path.extname(iconPath) === '.ico';
}

function iconIsPng(iconPath: string): boolean {
  return path.extname(iconPath) === '.png';
}

function iconIsIcns(iconPath: string): boolean {
  return path.extname(iconPath) === '.icns';
}

/**
 * Will check and convert a `.png` to `.icns` if necessary and augment
 * options.icon with the result
 */
export function iconBuild(
  inpOptions: any,
  callback: (error: any, options: any) => void,
): void {
  const options = { ...inpOptions };
  const returnCallback = () => {
    callback(null, options);
  };

  if (!options.icon) {
    returnCallback();
    return;
  }

  if (options.platform === 'win32') {
    if (iconIsIco(options.icon)) {
      returnCallback();
      return;
    }

    convertToIco(options.icon)
      .then((outPath) => {
        options.icon = outPath;
        returnCallback();
      })
      .catch((error) => {
        log.warn('Skipping icon conversion to .ico', error);
        returnCallback();
      });
    return;
  }

  if (options.platform === 'linux') {
    if (iconIsPng(options.icon)) {
      returnCallback();
      return;
    }

    convertToPng(options.icon)
      .then((outPath) => {
        options.icon = outPath;
        returnCallback();
      })
      .catch((error) => {
        log.warn('Skipping icon conversion to .png', error);
        returnCallback();
      });
    return;
  }

  if (iconIsIcns(options.icon)) {
    returnCallback();
    return;
  }

  if (!isOSX()) {
    log.warn(
      'Skipping icon conversion to .icns, conversion is only supported on OSX',
    );
    returnCallback();
    return;
  }

  convertToIcns(options.icon)
    .then((outPath) => {
      options.icon = outPath;
      returnCallback();
    })
    .catch((error) => {
      log.warn('Skipping icon conversion to .icns', error);
      options.icon = undefined;
      returnCallback();
    });
}
