import * as path from 'path';

import * as log from 'loglevel';
import * as electronPackager from 'electron-packager';

import { isOSX } from '../helpers/helpers';
import {
  convertToPng,
  convertToIco,
  convertToIcns,
} from '../helpers/iconShellHelpers';

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
 * Will convert a `.png` icon to the appropriate arch format (if necessary),
 * and return adjusted options
 */
export async function convertIconIfNecessary(
  options: electronPackager.Options,
): Promise<electronPackager.Options> {
  if (!options.icon) {
    return options;
  }

  if (options.platform === 'win32') {
    if (iconIsIco(options.icon)) {
      return options;
    }

    try {
      const iconPath = await convertToIco(options.icon);
      return { ...options, icon: iconPath };
    } catch (error) {
      log.warn('Failed to convert icon to .ico, skipping.', error);
      return options;
    }
  }

  if (options.platform === 'linux') {
    if (iconIsPng(options.icon)) {
      return options;
    }

    try {
      const iconPath = await convertToPng(options.icon);
      return { ...options, icon: iconPath };
    } catch (error) {
      log.warn('Failed to convert icon to .png, skipping.', error);
      return options;
    }
  }

  if (iconIsIcns(options.icon)) {
    return options;
  }

  if (!isOSX()) {
    log.warn(
      'Skipping icon conversion to .icns, conversion is only supported on macOS',
    );
    return options;
  }

  try {
    const iconPath = await convertToIcns(options.icon);
    return { ...options, icon: iconPath };
  } catch (error) {
    log.warn('Failed to convert icon to .icns, skipping.', error);
    return { ...options, icon: undefined };
  }
}
