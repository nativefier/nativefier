import * as os from 'os';

export function inferPlatform(): string {
  const platform = os.platform();
  if (
    platform === 'darwin' ||
    // @ts-ignore
    platform === 'mas' ||
    platform === 'win32' ||
    platform === 'linux'
  ) {
    return platform;
  }

  throw new Error(`Untested platform ${platform} detected`);
}

export function inferArch(): string {
  const arch = os.arch();
  if (arch !== 'ia32' && arch !== 'x64' && arch !== 'arm') {
    throw new Error(`Incompatible architecture ${arch} detected`);
  }
  return arch;
}
