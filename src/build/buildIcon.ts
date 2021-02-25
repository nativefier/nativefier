import * as path from 'path';

import * as log from 'loglevel';

import { isOSX } from '../helpers/helpers';
import {
  convertToPng,
  convertToIco,
  convertToIcns,
} from '../helpers/iconShellHelpers';
import { AppOptions } from '../options/model';

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
export function convertIconIfNecessary(options: AppOptions): void {
  if (!options.packager.icon) {
    log.debug('Option "icon" not set, skipping icon conversion.');
    return;
  }

  if (options.packager.platform === 'win32') {
    if (iconIsIco(options.packager.icon)) {
      log.debug(
        'Building for Windows and icon is already a .ico, no conversion needed',
      );
      return;
    }

    try {
      const iconPath = convertToIco(options.packager.icon);
      options.packager.icon = iconPath;
      return;
    } catch (error) {
      log.warn('Failed to convert icon to .ico, skipping.', error);
      return;
    }
  }

  if (options.packager.platform === 'linux') {
    if (iconIsPng(options.packager.icon)) {
      log.debug(
        'Building for Linux and icon is already a .png, no conversion needed',
      );
      return;
    }

    try {
      const iconPath = convertToPng(options.packager.icon);
      options.packager.icon = iconPath;
      return;
    } catch (error) {
      log.warn('Failed to convert icon to .png, skipping.', error);
      return;
    }
  }

  if (iconIsIcns(options.packager.icon)) {
    log.debug(
      'Building for macOS and icon is already a .icns, no conversion needed',
    );
    return;
  }

  if (!isOSX()) {
    log.warn(
      'Skipping icon conversion to .icns, conversion is only supported on macOS',
    );
    return;
  }

  try {
    const iconPath = convertToIcns(options.packager.icon);
    options.packager.icon = iconPath;
    return;
  } catch (error) {
    log.warn('Failed to convert icon to .icns, skipping.', error);
    options.packager.icon = undefined;
    return;
  }
}
