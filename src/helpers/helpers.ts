import * as os from 'os';
import * as path from 'path';

import axios from 'axios';
import * as hasbin from 'hasbin';
import * as log from 'loglevel';

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
  const hasIdentify = hasbin.sync('identify');
  const hasConvert = hasbin.sync('convert');
  const hasIconUtil = hasbin.sync('iconutil');

  const pngToIcns = hasConvert && hasIconUtil;
  const pngToIco = hasConvert;
  const icoToIcns = pngToIcns && hasIdentify;
  const icoToPng = hasConvert;

  // todo scripts for the following
  const icnsToPng = false;
  const icnsToIco = false;

  const formats = [];

  // TODO shell scripting is not supported on windows, temporary override
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
