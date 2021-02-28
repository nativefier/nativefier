import * as log from 'loglevel';
import * as os from 'os';

export const supportedArchs = ['ia32', 'x64', 'armv7l', 'arm64'];

export function inferPlatform(): string {
  const platform = os.platform();
  if (
    platform === 'darwin' ||
    // @ts-ignore
    platform === 'mas' ||
    platform === 'win32' ||
    platform === 'linux'
  ) {
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
