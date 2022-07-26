import * as os from 'os';

import * as log from 'loglevel';

// Ideally we'd get this list directly from electron-packager, but it's not
// possible to convert a literal type to an array of strings in current TypeScript
export const supportedArchs = ['x64', 'armv7l', 'arm64', 'universal'];
export const supportedPlatforms = [
  'darwin',
  'linux',
  'mac',
  'mas',
  'osx',
  'win32',
  'windows',
];

export function inferPlatform(): string {
  const platform = os.platform();
  if (['darwin', 'linux', 'win32'].includes(platform)) {
    log.debug('Inferred platform', platform);
    return platform;
  }

  throw new Error(`Untested platform ${platform} detected`);
}

export function inferArch(): string {
  const arch = os.arch();
  if (!supportedArchs.includes(arch)) {
    throw new Error(`Incompatible architecture ${arch} detected`);
  }
  log.debug('Inferred arch', arch);
  return arch;
}
