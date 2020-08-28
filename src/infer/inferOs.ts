import * as os from 'os';
import * as log from 'loglevel';

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
  if (arch !== 'ia32' && arch !== 'x64' && arch !== 'arm' && arch !== 'arm64') {
    throw new Error(`Incompatible architecture ${arch} detected`);
  }
  log.debug('Inferred arch', arch);
  return arch;
}
