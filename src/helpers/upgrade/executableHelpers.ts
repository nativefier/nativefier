import * as fs from 'fs';
import * as path from 'path';

import * as log from 'loglevel';

import { NativefierOptions } from '../../options/model';
import { getVersionString } from './rceditGet';
type ExecutableInfo = {
  arch?: string;
};

function getExecutableBytes(executablePath: string): Uint8Array {
  return fs.readFileSync(executablePath);
}

function getExecutableArch(
  exeBytes: Uint8Array,
  platform: string,
): string | undefined {
  switch (platform) {
    case 'linux':
      // https://en.wikipedia.org/wiki/Executable_and_Linkable_Format#File_header
      switch (exeBytes[0x12]) {
        case 0x03:
          return 'ia32';
        case 0x28:
          return 'armv7l';
        case 0x3e:
          return 'x64';
        case 0xb7:
          return 'arm64';
        default:
          return undefined;
      }
    case 'darwin':
    case 'mas':
      // https://opensource.apple.com/source/xnu/xnu-2050.18.24/EXTERNAL_HEADERS/mach-o/loader.h

      switch ((exeBytes[0x04] << 8) + exeBytes[0x05]) {
        case 0x0700:
          return 'x64';
        case 0x0c00:
          return 'arm64';
        default:
          return undefined;
      }
    case 'windows':
      // https://en.wikibooks.org/wiki/X86_Disassembly/Windows_Executable_Files#COFF_Header
      switch ((exeBytes[0x7d] << 8) + exeBytes[0x7c]) {
        case 0x014c:
          return 'ia32';
        case 0x8664:
          return 'x64';
        case 0xaa64:
          return 'arm64';
        default:
          return undefined;
      }
    default:
      return undefined;
  }
}

function getExecutableInfo(
  executablePath: string,
  platform: string,
): ExecutableInfo {
  const exeBytes = getExecutableBytes(executablePath);
  return {
    arch: getExecutableArch(exeBytes, platform),
  };
}

export function getOptionsFromExecutable(
  appResourcesDir: string,
  appName: string,
): NativefierOptions {
  const options: NativefierOptions = {};
  let executablePath: string | undefined = undefined;

  const appRoot = path.resolve(path.join(appResourcesDir, '..', '..'));
  const children = fs.readdirSync(appRoot, { withFileTypes: true });
  const looksLikeMacOS =
    children.filter((c) => c.name === 'MacOS' && c.isDirectory()).length > 0;
  const looksLikeWindows =
    children.filter((c) => c.name.toLowerCase().endsWith('.exe') && c.isFile())
      .length > 0;
  const looksLikeLinux =
    children.filter((c) => c.name.toLowerCase().endsWith('.so') && c.isFile())
      .length > 0;

  if (looksLikeMacOS) {
    log.debug('This looks like a MacOS app...');
    options.platform =
      children.filter((c) => c.name === 'Library' && c.isDirectory()).length > 0
        ? 'mas'
        : 'darwin';
    executablePath = path.join(
      appRoot,
      'MacOS',
      fs.readdirSync(path.join(appRoot, 'MacOS'))[0],
    );
  } else if (looksLikeWindows) {
    log.debug('This looks like a Windows app...');
    options.platform = 'windows';
    executablePath = path.join(
      appRoot,
      children.filter(
        (c) =>
          c.name.toLowerCase() === `${appName.toLowerCase()}.exe` && c.isFile(),
      )[0].name,
    );
    // https://github.com/electron/electron-packager/blob/f1c159f4c844d807968078ea504fba40ca7d9c73/src/win32.js#L46-L48
    options.appVersion = getVersionString(executablePath, 'ProductVersion');
    log.debug(`Extracted app version from executable: ${options.appVersion}`);

    //https://github.com/electron/electron-packager/blob/f1c159f4c844d807968078ea504fba40ca7d9c73/src/win32.js#L50-L52
    options.buildVersion = getVersionString(executablePath, 'FileVersion');

    // https://github.com/electron/electron-packager/blob/f1c159f4c844d807968078ea504fba40ca7d9c73/src/win32.js#L54-L56
    options.appCopyright = getVersionString(executablePath, 'LegalCopyright');
    log.debug(
      `Extracted app copyright from executable: ${options.appCopyright}`,
    );

    if (options.appVersion == options.buildVersion) {
      options.buildVersion = undefined;
    } else {
      log.debug(
        `Extracted build version from executable: ${options.buildVersion}`,
      );
    }
  } else if (looksLikeLinux) {
    log.debug('This looks like a Linux app...');
    options.platform = 'linux';
    executablePath = path.join(
      appRoot,
      children.filter((c) => c.name == appName && c.isFile())[0].name,
    );
  }

  log.debug(`Executable path: ${executablePath}`);

  const executableInfo = getExecutableInfo(executablePath, options.platform);
  options.arch = executableInfo.arch;
  log.debug(`Extracted arch from executable: ${options.arch}`);

  if (options.platform === undefined || options.arch == undefined) {
    throw Error(`Could not determine platform / arch of app in ${appRoot}`);
  }

  return options;
}
